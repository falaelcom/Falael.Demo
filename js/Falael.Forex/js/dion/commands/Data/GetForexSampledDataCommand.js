"use strict";

const ObjectID = require("mongodb").ObjectID;
const moment = require("moment");
const os = require('os');

const InvalidOperationException = require("@framework/InvalidOperationException.js");
const TimeoutException = require("@framework/TimeoutException.js");
const DbException = require("@framework/DbException.js");
const UnexpectedException = require("@framework/UnexpectedException.js");
const InvalidValueException = require("@framework/InvalidValueException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");
const EDateTimeUnit = require("@framework/EDateTimeUnit.js");
const ELoggerLevel = require("@framework/ELoggerLevel.js");

const Range = require("@shared/Range.js");
const Utility = require("@framework/Utility.js");
const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

const Locking = require("@internal/Locking.js");
const DbCache = require("@internal/DbCache.js");

const GetForexDataBoundariesCommand = require("@commands/Data/GetForexDataBoundariesCommand.js");
const GetForexMetadataCommand = require("@commands/Data/GetForexMetadataCommand.js");

//	cli tests:
//	r -b full -c /Data/GetForexSampledData -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1241136000605 --coll=forex.sampledData.minute5
//	r -b full -c /Data/GetForexSampledData -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1272661200000 --coll=forex.sampledData.hour1
//
//	rest tests:
//	var result = await client.Data.GetForexSampledData({ querystring: { pid: "5d96423f5a4aa978f03002d2", start: 1241136000365, end: 1241136000605, coll: "forex.sampledData.minute5" } });
//

const lockKey_sampled = "forex.sampledData._info";
const lockKey_extremumData = "forex.sampledData.embeddedIndicators._info";
const maxSampleLengthMs = 16740000;
const maxSampleDbResults = 200000;

module.exports = class GetForexSampledDataCommand extends Command
{
    constructor(data)
    {
        super(data);
    }

	static get __manifest()
	{
		const result =
		{
			rest:
			{
				method: EHttpMethod.Get,
				validate:
				{
					querystring:
					{
						type: "object",
						required: [ "pid", "start", "end", "coll" ],
						properties:
						{
							pid: { type: "string" },
							start: { type: "number" },
							end: { type: "number" },
							coll: { type: "string" },
							mute: { type: "boolean" },
							numb: { type: "boolean" },
							force: { type: "boolean" },
							limit: { type: "integer" },
							reverse: { type: "boolean" },
						},
					},
				},
			},
			cli:
			{
				options: { $rest: "querystring" },
				validate:
				{
					args: { $rest: "querystring" },
				},
			},
			response:
			{
				responseType: EResponseType.Json,
				validate:
				{
					type: "array",
					items:
					{
						type: "object",
						required: ["dt", "ac", "ah", "al", "ao", "bc", "bh", "bl", "bo"],
						properties:
						{
							dt: { type: "number" },
							ac: { type: "number" },		//	ask close
							ah: { type: "number" },		//	ask high
							al: { type: "number" },		//	ask low
							ao: { type: "number" },		//	ask open
							bc: { type: "number" },		//	bid close
							bh: { type: "number" },		//	bid high
							bl: { type: "number" },		//	bid low
							bo: { type: "number" },		//	bid open
						},
					}
				},
			},
		};
		return result;
	}

	static async run(fields)
	{
		const commandResult = await new GetForexSampledDataCommand({ fields }).execute();
		return commandResult.value;
	}

    async execute(inboundStream, outboundStream)
    {
		const samplingInterval = await GetForexMetadataCommand.getItemByCollectionName(this.data.fields.coll);
		if (!samplingInterval)
		{
			throw new InvalidValueException("coll");
		}

		try
		{
			await db.collection("forex.tickData").createIndex(

				{ pid: 1, dt: 1 },
				{ unique: true }
			);
			await db.collection(this.data.fields.coll).createIndex(

				{ pid: 1, dt: 1 },
				{ unique: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		//	normalize the requested range (trim to fit within the existing data)
		const dbBoundaries = await GetForexDataBoundariesCommand.run(this.data.fields.pid);
		if (dbBoundaries.empty) return new CommandResult([]);
		const range = new Range(

			Math.max(this.data.fields.start, dbBoundaries.min),
			Math.min(this.data.fields.end, dbBoundaries.max),
		);

		if (!this.data.fields.numb)
		{
			var samplingRange = range.clone();

			//	round the request range to the sampling interval unit and length boundry
			samplingRange.min = EDateTimeUnit.floorMoment(moment(samplingRange.min), samplingInterval.unit, samplingInterval.length).valueOf();
			samplingRange.max = EDateTimeUnit.floorMoment(moment(samplingRange.max), samplingInterval.unit, samplingInterval.length).valueOf();
			samplingRange.max = EDateTimeUnit.addToMoment(moment(samplingRange.max), samplingInterval.length, samplingInterval.unit).valueOf();

			await this._ensureRangeSampled(samplingRange, samplingInterval, !!this.data.fields.force);
			await this._ensureExtremumData(samplingRange, samplingInterval, !!this.data.fields.force);
		}

		if (this.data.fields.mute)
		{
			return new CommandResult();
		}

		const coll = this.data.fields.coll;
		const sort = this.data.fields.reverse ? -1 : 1;
		if (this.data.fields.limit)
		{
			try
			{
				const result = await db.collection(coll).find(
				{
					pid: ObjectID(this.data.fields.pid),
					dt: { $gte: range.min, $lte: range.max },
				}).limit(this.data.fields.limit).sort({ dt: sort }).toArray();
				return new CommandResult(result);
			}
			catch (ex)
			{
				throw new DbException(ex);
			}
		}
		else
		{
			let result = null;
			let outcome;
			do
			{
				try
				{
					outcome = await db.collection(coll).find(
					{
						pid: ObjectID(this.data.fields.pid),
						dt: { $gte: range.min, $lte: range.max },
					}).limit(config.db.limit).sort({ dt: sort }).toArray();
				}
				catch (ex)
				{
					throw new DbException(ex);
				}
				if (!outcome.length) break;
				if (!result) result = outcome;
				else result = result.concat(outcome);
				range.min = outcome[outcome.length - 1].dt + 1;
			}
			while (outcome.length >= config.db.limit);
			return new CommandResult(result || []);
		}
    }

	async _ensureRangeSampled(requestedRange, samplingInterval, force)
	{
		logger.info(`(1) Ensuring sampled data for pid ${this.data.fields.pid}, coll ${this.data.fields.coll}, range ${requestedRange.min} - ${requestedRange.max}...`);

		logger.write(ELoggerLevel.Info, "Locking metadata...");
		const lockInfo = await Locking.acquireLock({ key: lockKey_sampled, pid: this.data.fields.pid, coll: this.data.fields.coll, force});
		logger.write(ELoggerLevel.Info, "OK" + os.EOL);

		let validRegions = Range.fromJsonRanges(lockInfo.validRegions);
		try
		{
			//	detect invalid regions (such that need sampling)
			let invalidRegions = [requestedRange];
			if (validRegions) invalidRegions = Range.subtractRanges(invalidRegions, validRegions);
			if (!validRegions) validRegions = [];

			if (invalidRegions.length)
			{
				logger.info(`(2) Sampling data for ${invalidRegions.length} invalid regions...`);

				//	perform sampling on the invalid regions
				for (let length = invalidRegions.length, i = 0; i < length; ++i)
				{
					logger.info(`(3) Sampling region ${i} / ${invalidRegions.length}...`);

					const item = invalidRegions[i];
					await this._sampleRange(item, samplingInterval);
					validRegions.push(item);

					logger.info("(3) Done .");
				}

				logger.info("(2) Done.");
			}
			else
			{
				logger.info("All sampled data for the requested region is valid.");
			}
		}
		finally
		{
			//	release lock and write the updated valid regions
			logger.write(ELoggerLevel.Info, `Releasing lock...`);
			//	normalize the valid regions collection (merge adjesent regions)
			lockInfo.validRegions = Range.toJsonRanges(Range.normalizeRanges(validRegions));
			await Locking.releaseLock({ key: lockKey_sampled, lockInfo: lockInfo });
			logger.write(ELoggerLevel.Info, "OK" + os.EOL);
		}
		logger.info("(1) Done.");
	}

	async _sampleRange(range, samplingInterval)
	{
		const sampleCountInRange = Math.ceil(EDateTimeUnit.diffMoments(moment(range.max), moment(range.min), samplingInterval.unit) / samplingInterval.length);

		let sampleRangeStartMoment = moment(range.min);
		let sampleRangeEndMoment = EDateTimeUnit.addToMoment(sampleRangeStartMoment, samplingInterval.length, samplingInterval.unit);

		logger.write(ELoggerLevel.Info, "Sampling progress:     ");

		let lastPrintedPercent = -1;

		let adaptiveMaxSampleLengthMs = maxSampleLengthMs;
		for (let i = 0; i < sampleCountInRange; ++i)
		{
			const sampleRangeMs = sampleRangeEndMoment.valueOf() - sampleRangeStartMoment.valueOf();

			let first = null;
			let last = null;
			let askLow = null;
			let askHigh = null;
			let bidLow = null;
			let bidHigh = null;
			let tickData = null;

			let k = 0;
			let offsetEnd = 0;
			while (offsetEnd < sampleRangeMs)
			{
				const offsetStart = k * adaptiveMaxSampleLengthMs;
				offsetEnd = offsetStart + adaptiveMaxSampleLengthMs;
				if (offsetEnd > sampleRangeMs) offsetEnd = sampleRangeMs;
				++k;

				try
				{
					tickData = await db.collection("forex.tickData").find(
					{
						pid: ObjectID(this.data.fields.pid),
						dt: { $gte: sampleRangeStartMoment.valueOf() + offsetStart, $lte: sampleRangeStartMoment.valueOf() + offsetEnd },
					}).sort({ dt: 1 }).limit(maxSampleDbResults + 1).toArray();
				}
				catch (ex)
				{
					throw new DbException(ex);
				}
				if (tickData.length == maxSampleDbResults + 1)
				{
					adaptiveMaxSampleLengthMs = Math.floor(adaptiveMaxSampleLengthMs / 2);
					k = Math.floor(offsetStart / adaptiveMaxSampleLengthMs);
					offsetEnd = 0;
					logger.warn("Sample data point count too big: " + tickData.length + ", retrying with adaptiveMaxSampleLengthMs" + adaptiveMaxSampleLengthMs + ".");
					logger.write(ELoggerLevel.Info, "Sampling progress:     ");
					continue;
				}
				if (!tickData.length) continue;

				if (first === null)
				{
					first = tickData[0];
					askLow = first.ask;
					askHigh = first.ask;
					bidLow = first.bid;
					bidHigh = first.bid;
				}

				for (let jlength = tickData.length, j = 1; j < jlength; ++j)
				{
					const jitem = tickData[j];
					askLow = Math.min(askLow, jitem.ask);
					askHigh = Math.max(askHigh, jitem.ask);
					bidLow = Math.min(bidLow, jitem.bid);
					bidHigh = Math.max(bidHigh, jitem.bid);
				}

				last = tickData[tickData.length - 1];
			}
			if (first !== null)
			{
				const record =
				{
					pid: ObjectID(this.data.fields.pid),
					dt: sampleRangeStartMoment.valueOf(),
					ac: last.ask,
					ah: askHigh,
					al: askLow,
					ao: first.ask,
					bc: last.bid,
					bh: bidHigh,
					bl: bidLow,
					bo: first.bid,
					vl: tickData.length,
				};

				try
				{
					await db.collection(this.data.fields.coll).replaceOne(

						{
							pid: ObjectID(this.data.fields.pid),
							dt: sampleRangeStartMoment.valueOf(),
						},
						record,
						{ upsert: true }
					);
				}
				catch (ex)
				{
					throw new DbException(ex);
				}

				let progressPercent = Math.round(i * 100 / sampleCountInRange);
				if (lastPrintedPercent != progressPercent)
				{
					let progressPercentText = String(progressPercent).padStart(3, ' ') + '%';
					logger.write(ELoggerLevel.Info, "\b\b\b\b" + progressPercentText);
				}
			}

			sampleRangeStartMoment = sampleRangeEndMoment;
			sampleRangeEndMoment = EDateTimeUnit.addToMoment(sampleRangeStartMoment, samplingInterval.length, samplingInterval.unit);
		}
		logger.write(ELoggerLevel.Info, "\b\b\b\b" + "OK    " + os.EOL);
	}

	async _ensureExtremumData(requestedRange, samplingInterval, force)
	{
		logger.info(`(1) Ensuring extremum data for pid ${this.data.fields.pid}, coll ${this.data.fields.coll}, range ${requestedRange.min} - ${requestedRange.max}...`);

		logger.write(ELoggerLevel.Info, "Locking metadata...");
		const lockInfo = await Locking.acquireLock({ key: lockKey_extremumData, pid: this.data.fields.pid, coll: this.data.fields.coll, force });
		logger.write(ELoggerLevel.Info, "OK" + os.EOL);

		const dbCache = new DbCache(
		{
			pid: this.data.fields.pid,
			coll: this.data.fields.coll,
			authorativePropertyName: "dt",
		});
		let validRegions = Range.fromJsonRanges(lockInfo.validRegions);
		try
		{
			//	detect invalid regions (such that need sampling)
			let invalidRegions = [requestedRange];
			if (validRegions) invalidRegions = Range.subtractRanges(invalidRegions, validRegions);
			if (!validRegions) validRegions = [];

			if (invalidRegions.length)
			{
				logger.info(`(2) Building extremum data for ${invalidRegions.length} invalid regions...`);

				//	perform sampling on the invalid regions
				for (let length = invalidRegions.length, i = 0; i < length; ++i)
				{
					logger.info(`(3) Region ${i} / ${invalidRegions.length}...`);

					const item = invalidRegions[i];
					await this._markExtremumsInRange(item, dbCache, samplingInterval);
					validRegions.push(item);

					logger.info("(3) Done .");
				}

				logger.info("(2) Done.");
			}
			else
			{
				logger.info("All extremum data for the requested region are valid.");
			}
		}
		finally
		{
			//	release lock and write the updated valid regions
			logger.write(ELoggerLevel.Info, `Releasing lock...`);
			//	normalize the valid regions collection (merge adjesent regions)
			lockInfo.validRegions = Range.toJsonRanges(Range.normalizeRanges(validRegions));
			await Locking.releaseLock({ key: lockKey_extremumData, lockInfo: lockInfo });
			logger.write(ELoggerLevel.Info, "OK" + os.EOL);
		}
		logger.info("(1) Done.");
	}

	async _markExtremumsInRange(range, dbCache, samplingInterval)
	{
		
	}
}
