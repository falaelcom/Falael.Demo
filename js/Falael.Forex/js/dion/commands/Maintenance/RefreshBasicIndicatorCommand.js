//	STATUS: under construction, cannot be used

"use strict";

const fsa = require("fs").promises;
const path = require("path");
const os = require('os');
const UUID = require("pure-uuid");
const ObjectID = require("mongodb").ObjectID;
const createRBTree = require("functional-red-black-tree");

const FormatException = require("@framework/FormatException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const InvalidOperationException = require("@framework/InvalidOperationException.js");
const DbException = require("@framework/DbException.js");
const UnexpectedException = require("@framework/UnexpectedException.js");

const ELoggerLevel = require("@framework/ELoggerLevel.js");
const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");
const EDateTimeUnit = require("@framework/EDateTimeUnit.js");

const Range = require("@shared/Range.js");
const Utility = require("@framework/Utility.js");
const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

const Locking = require("@internal/Locking.js");

const GetForexDataBoundariesCommand = require("@commands/Data/GetForexDataBoundariesCommand.js");
const GetForexMetadataCommand = require("@commands/Data/GetForexMetadataCommand.js");
const GetForexSampledDataCommand = require("@commands/Data/GetForexSampledDataCommand.js");

//	cli tests:
//	r -b full -c /Maintenance/RefreshBasicIndicator -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1241136000605 --coll=forex.sampledData.minute5
//	r -b full -c /Maintenance/RefreshBasicIndicator -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1272661200000 --coll=forex.sampledData.hour1
//	r -b full -c /Maintenance/RefreshBasicIndicator -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1272661200000
//	r -b full -c /Maintenance/RefreshBasicIndicator -- --pid=5d96423f5a4aa978f03002d2 --coll=forex.sampledData.hour1
//	r -b full -c /Maintenance/RefreshBasicIndicator -- --pid=5d96423f5a4aa978f03002d2
//	r -b full -c /Maintenance/RefreshBasicIndicator -- --pid=5d98a1765a4aa978f09c5464

const lockKey = "forex.sampledData.basicIndicators._info";
const pageTargetDatapointCount_forward = 20000;
const pageTargetDatapointCount_backward = 2000;
const cache_maxSize = 2000000;

module.exports = class RefreshBasicIndicatorCommand extends Command
{
    constructor(data)
    {
        super(data);
    }

	static get __manifest()
	{
		const result =
		{
			rest: false,
			cli:
			{
				options:
				[
					{
						names: ["pid"],
						type: "string",
						help: "required; forex pair database id",
					},
					{
						names: ["start"],
						type: "number",
						help: "optional; the start of the time range to process in milliseconds; if ommitted, the time of the earliest database record for the specified currency pair is used",
					},
					{
						names: ["end"],
						type: "number",
						help: "optional; the end of the time range to process in milliseconds; if ommitted, the time of the latest database record for the specified currency pair is used",
					},
					{
						names: ["coll"],
						type: "string",
						help: "optional; name of the sampled data collection to process, as returned by the /Data/GetForexMetadata command; if ommitted, all defined collections will be processed in a batch",
					},
					{
						names: ["force"],
						type: "bool",
						help: "optional; if set this option will cause the collection locks to always succeed; useful to continue sampling after a crash",
					},
				],
				validate:
				{
					args:
					{
						type: "object",
						properties:
						{
							pid: { type: "string" },
							start: { type: "integer" },
							end: { type: "integer" },
							coll: { type: "string" },
							force: { type: "boolean" },
						},
						required: ["pid"],
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		logger.info("Refreshing basic indicator data...");

		//	normalize the requested range (trim to fit within the existing data)
		const dbBoundaries = await GetForexDataBoundariesCommand.run(this.data.fields.pid);
		if (dbBoundaries.empty)
		{
			logger.info("No data.");
			return new CommandResult();
		}
		const range = new Range(

			Math.max(this.data.fields.start || -Infinity, dbBoundaries.min),
			Math.min(this.data.fields.end || Infinity, dbBoundaries.max),
		);

		const samplingIntervals = await GetForexMetadataCommand.getSamplingIntervals();

		if (this.data.fields.coll === void (0))
		{
			for (let length = samplingIntervals.length, i = 0; i < length; ++i)
			{
				const item = samplingIntervals[i];
				await this._processCollection(
				{
					pid: this.data.fields.pid,
					start: range.min,
					end: range.max,
					coll: item.collectionName,
					force: this.data.fields.force,
				});
			}
		}
		else
		{
			const samplingIntervalMap = Utility.Object.mapArray(samplingIntervals, "collectionName");
			if (!samplingIntervalMap[this.data.fields.coll])
			{
				throw new InvalidValueException("coll");
			}

			await this._processCollection(
			{
				pid: this.data.fields.pid,
				start: range.min,
				end: range.max,
				coll: this.data.fields.coll,
				force: this.data.fields.force,
			});
		}

		logger.info("Ready.");
		return new CommandResult();
	}

	async _processCollection(par)
	{
		const pid = par.pid;
		const start = par.start;
		const end = par.end;
		const coll = par.coll;
		const force = par.force;

		const samplingInterval = await GetForexMetadataCommand.getItemByCollectionName(coll);
		if (!samplingInterval)
		{
			throw new InvalidValueException("coll");
		}

		try
		{
			await db.collection(this.data.fields.coll).createIndex(

				{ pid: 1, dt: 1 },
				{ unique: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		const range = new Range(start, end);

		//	round the range to the sampling interval unit and length boundry
		range.min = EDateTimeUnit.floorMoment(moment(range.min), samplingInterval.unit, samplingInterval.length).valueOf();
		range.max = EDateTimeUnit.floorMoment(moment(range.max), samplingInterval.unit, samplingInterval.length).valueOf();
		range.max = EDateTimeUnit.addToMoment(moment(range.max), samplingInterval.length, samplingInterval.unit).valueOf();

		await this._ensureRangeProcessed(range, pid, coll, samplingInterval, !!force);
	}

	async _ensureRangeProcessed(range, pid, coll, samplingInterval, force)
	{
		logger.info(`(1) Ensuring basic indicator data for pid ${pid}, coll ${coll}, range ${range.min} - ${range.max}...`);

		logger.write(ELoggerLevel.Info, "Locking basic indicator metadata...");
		const sampledDataInfo = await Locking.acquireLock({ key: lockKey, pid: this.data.fields.pid, coll: this.data.fields.coll, force });
		logger.write(ELoggerLevel.Info, "OK" + os.EOL);

		let validRegions = Range.fromJsonRanges(sampledDataInfo.validRegions);
		try
		{
			//	detect invalid regions (such that need sampling)
			let invalidRegions = [range];
			if (validRegions) invalidRegions = Range.subtractRanges(invalidRegions, validRegions);
			if (!validRegions) validRegions = [];

			if (invalidRegions.length)
			{
				logger.info(`(2) Building basic indicator data for ${invalidRegions.length} invalid regions...`);

				for (let length = invalidRegions.length, i = 0; i < length; ++i)
				{
					logger.info(`(3) Building basic indicator data for region ${i} / ${invalidRegions.length}...`);

					const item = invalidRegions[i];
					await this._processRange(item, pid, coll, samplingInterval);
					validRegions.push(item);

					logger.info("(3) Done .");
				}

				logger.info("(2) Done.");
			}
			else
			{
				logger.info("All basic indicator data for the requested region is valid.");
			}
		}
		finally
		{
			//	release lock and write the updated valid regions
			logger.write(ELoggerLevel.Info, `Releasing lock...`);
			//	normalize the valid regions collection (merge adjesent regions)
			sampledDataInfo.validRegions = Range.toJsonRanges(Range.normalizeRanges(validRegions));
			await Locking.releaseLock({ key: lockKey, lockInfo: sampledDataInfo });
			logger.write(ELoggerLevel.Info, "OK" + os.EOL);
		}
		logger.info("(1) Done.");
	}

	async _releaseLock(sampledDataInfo)
	{
		return new Promise(async (resolve, reject) =>
		{
			try
			{
				sampledDataInfo.lock = false;
				await db.collection("forex.sampledData.basicIndicators._info").findOneAndUpdate(

					{ _id: sampledDataInfo._id },
					{ $set: sampledDataInfo }
				);
				return resolve();
			}
			catch (ex)
			{
				return reject(new UnexpectedException(ex));
			}
		});
	}

	async _processRange(range, pid, coll, samplingInterval)
	{
		const pageSizeMs = EDateTimeUnit.getMaxUnitLengthMs(samplingInterval.unit) * samplingInterval.length * pageTargetDatapointCount_forward;
		const pageCountInRange = Math.ceil(range.length / pageSizeMs);

		var context =
		{
			dataTree: createRBTree(),
			range: new Range(Infinity, -Infinity),
		};

		let startMoment = moment(range.min);
		let endMoment = moment(range.max);

		logger.write(ELoggerLevel.Info, "Progress:     ");

		let lastPrintedPercent = -1;

		for (let i = 0; i < pageCountInRange; ++i)
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

	async _getDatapoint(context, pid, coll, samplingInterval, dt, next)
	{
		if (context.dataTree.length > cache_maxSize)
		{
			context.dataTree = createRBTree();
			context.range = new Range(Infinity, -Infinity);
		}

			//	actually must iterate pages UNTIL context.dataTree.gt/lt(dt).value returns a result or the range min/max reaches the db boundaries
		if (context.range.containsValue(dt))
		{
			if (next) return context.dataTree.gt(dt).value;
			else return context.dataTree.lt(dt).value;
		}

		const pageSizeMs = EDateTimeUnit.getMaxUnitLengthMs(samplingInterval.unit) * samplingInterval.length * pageTargetDatapointCount_backward;

		let range;
		if (context.range.min == Infinity) context.range.min = dt;
		if (context.range.max == -Infinity) context.range.max = dt - 1;
		if (next) range = new Range(context.range.max, context.range.max + pageSizeMs).roundUp(0.5);
		else range = new Range(context.range.min - pageSizeMs, context.range.min).roundUp(0.5);
		do
		{
			let pageData;
			try
			{
				pageData = await db.collection(coll).find(
				{
					pid: ObjectID(pid),
					dt: { $gte: range.min, $lte: range.max },
				}).limit(config.db.limit).sort({ dt: 1 }).toArray();

				if (pageData.length == config.db.limit) logger.warn("GetForexSampledDataCommand.execute: resultset possibly trimmed by configured limitation.", range, config.db.limit);

				for (let length = pageData.length, i = 0; i < length; ++i)
				{
					var item = pageData[i];
					context.dataTree = context.dataTree.insert(item.dt, item);
				}
				context.range.min = Math.min(context.range.min, range.min);
				context.range.max = Math.max(context.range.max, range.max);

				if (context.range.containsValue(dt))
				{
					if (next) return context.dataTree.gt(dt).value;
					else return context.dataTree.lt(dt).value;
				}
				if (next) range = new Range(context.range.max, context.range.max + pageSizeMs).roundUp(0.5);
				else range = new Range(context.range.min - pageSizeMs, context.range.min).roundUp(0.5);
			}
			catch (ex)
			{
				throw new DbException(ex);
			}
		}
		while (true);



		//	load pages backwards until a datapoint with date < dt is found
		//	write also _getNextDatapoint
	}
}
