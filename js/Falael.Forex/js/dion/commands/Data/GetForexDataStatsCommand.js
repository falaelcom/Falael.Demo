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
const Sample = require("@shared/Sample.js");
const Utility = require("@framework/Utility.js");
const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

const GetForexDataBoundariesCommand = require("@commands/Data/GetForexDataBoundariesCommand.js");
const GetForexMetadataCommand = require("@commands/Data/GetForexMetadataCommand.js");

//	cli tests:
//	r -b full -c /Data/GetForexDataStats -- --pid=5d96423f5a4aa978f03002d2 --start=1300089600000 --end=1300133343396 --coll=forex.sampledData.minute1
//	r -b full -c /Data/GetForexDataStats -- --pid=5d96423f5a4aa978f03002d2 --start=1300089600000 --end=1300133343396 --coll=forex.sampledData.hour1
//	r -b full -c /Data/GetForexDataStats -- --pid=5d96423f5a4aa978f03002d2
//
//	rest tests:
//	var result = await client.Data.GetForexDataStatsCommand({ querystring: { pid: "5d96423f5a4aa978f03002d2", start: 1300089600000, end: 1300133343396, coll: "forex.sampledData.minute1" } });
//

const pageDpCount = 50000;

module.exports = class GetForexDataStatsCommand extends Command
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
						required: [ "pid" ],
						properties:
						{
							pid: { type: "string" },
							start: { type: "number" },
							end: { type: "number" },
							coll: { type: "string" },
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
						required:
						[
							"coll", "durationMinMs", "durationMaxMs",
							"almin", "ahmin", "almax", "ahmax", "aavg", "aminrn", "amaxrn", "aarn",
							"blmin", "blmax", "bmmin", "bhmax", "bavg", "bminrn", "bmaxrn", "barn",
							"abavg", "abminrn", "abmaxrn", "abarn", "abiavg", "abiminrn", "abimaxrn", "abiarn",
							"spreadmin", "spreadmax", "spreadavg"
						],
						properties:
						{
							coll: { type: "string" },
							durationMinMs: { type: "number" },
							durationMaxMs: { type: "number" },

							almin: { type: "number" },	//	absolute min al price for the requested period
							ahmin: { type: "number" },	//	absolute min ah price for the requested period
							almax: { type: "number" },	//	absolute max al price for the requested period
							ahmax: { type: "number" },	//	absolute max ah price for the requested period
							aavg: { type: "number" },	//	average price for the requested period based on the local average (ah + al) / 2
							aminrn: { type: "number" },	//	absolute min range for the requested period based on the local range (ah - al)
							amaxrn: { type: "number" },	//	absolute max range for the requested period based on the local range (ah - al)
							aarn: { type: "number" },	//	average range for the requested period based on the local range (ah - al)

							blmin: { type: "number" },	//	absolute min bl price for the requested period
							bhmin: { type: "number" },	//	absolute min bh price for the requested period
							blmax: { type: "number" },	//	absolute max bl price for the requested period
							bhmax: { type: "number" },	//	absolute max bh price for the requested period
							bavg: { type: "number" },	//	average price for the requested period based on the local average (bh + bl) / 2
							bminrn: { type: "number" },	//	absolute min range for the requested period based on the local range (bh - bl)
							bmaxrn: { type: "number" },	//	absolute max range for the requested period based on the local range (bh - bl)
							barn: { type: "number" },	//	average range for the requested period based on the local range (bh - bl)

							abavg: { type: "number" },	//	average price for the requested period based on the local average (ah + bl) / 2
							abminrn: { type: "number" },//	absolute min range for the requested period based on the local range (ah - bl)
							abmaxrn: { type: "number" },//	absolute max range for the requested period based on the local range (ah - bl)
							abarn: { type: "number" },	//	average range for the requested period based on the local range (ah - bl)
							abiavg: { type: "number" },	//	average price for the requested period based on the local average (al + bh) / 2
							abiminrn: { type: "number" },//	absolute min range for the requested period based on the local range (al - bh)
							abimaxrn: { type: "number" },//	absolute max range for the requested period based on the local range (al - bh)
							abiarn: { type: "number" },	//	average range for the requested period based on the local range (al - bh)

							spreadmin: { type: "number" },	//	absolute min spread for the requested period based on the local spread (ac - bc)
							spreadmax: { type: "number" },	//	absolute max spread for the requested period based on the local spread (ac - bc)
							spreadavg: { type: "number" },	//	average spread for the requested period based on the local spread (ac - bc)
						},
					}
				},
			},
		};
		return result;
	}

	static async run(fields)
	{
		const commandResult = await new GetForexDataStatsCommand({ fields }).execute();
		return commandResult.value;
	}

    async execute(inboundStream, outboundStream)
    {
		logger.info("Analysing...");

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

		const result = [];
		if (this.data.fields.coll === void (0))
		{
			for (let length = samplingIntervals.length, i = 0; i < length; ++i)
			{
				const samplingInterval = samplingIntervals[i];
				const outcome = await this._processCollection(
				{
					pid: this.data.fields.pid,
					range,
					samplingInterval,
				});
				result.push(outcome);
			}
		}
		else
		{
			const samplingIntervalMap = Utility.Object.mapArray(samplingIntervals, "collectionName");
			const samplingInterval = samplingIntervalMap[this.data.fields.coll];
			if (!samplingInterval)
			{
				throw new InvalidValueException("coll");
			}

			const outcome = await this._processCollection(
			{
				pid: this.data.fields.pid,
				range,
				samplingInterval,
			});
			result.push(outcome);
		}

		logger.info("Ready.");
		return new CommandResult(result);
    }

	async _processCollection(par)
	{
		const pid = par.pid;
		const range = par.range;
		const samplingInterval = par.samplingInterval;
		const coll = par.samplingInterval.collectionName;

		logger.info(`Target: pid ${pid}, coll ${coll}, range ${range.min} - ${range.max}...`);
		logger.write(ELoggerLevel.Info, "Progress:     ");

		const result =
		{
			coll: coll,
			durationMinMs: EDateTimeUnit.getMinUnitLengthMs(samplingInterval.unit) * samplingInterval.length,
			durationMaxMs: EDateTimeUnit.getMaxUnitLengthMs(samplingInterval.unit) * samplingInterval.length,
			
			almin: Infinity,	//	absolute min al price for the requested period
			ahmin: Infinity,	//	absolute min ah price for the requested period
			almax: -Infinity,	//	absolute max al price for the requested period
			ahmax: -Infinity,	//	absolute max ah price for the requested period
			aavg: 0,			//	average price for the requested period based on the local average (ah + al) / 2
			aminrn: Infinity,	//	absolute min range for the requested period based on the local range (ah - al)
			amaxrn: -Infinity,	//	absolute max range for the requested period based on the local range (ah - al)
			aarn: 0,			//	average range for the requested period based on the local range (ah - al)

			blmin: Infinity,	//	absolute min bl price for the requested period
			bhmin: Infinity,	//	absolute min bh price for the requested period
			blmax: -Infinity,	//	absolute max bl price for the requested period
			bhmax: -Infinity,	//	absolute max bh price for the requested period
			bavg: 0,			//	average price for the requested period based on the local average (bh + bl) / 2
			bminrn: Infinity,	//	absolute min range for the requested period based on the local range (bh - bl)
			bmaxrn: -Infinity,	//	absolute max range for the requested period based on the local range (bh - bl)
			barn: 0,			//	average range for the requested period based on the local range (bh - bl)

			abavg: 0,			//	average price for the requested period based on the local average (ah + bl) / 2
			abminrn: Infinity,	//	absolute min range for the requested period based on the local range (ah - bl)
			abmaxrn: -Infinity,	//	absolute max range for the requested period based on the local range (ah - bl)
			abarn: 0,			//	average range for the requested period based on the local range (ah - bl)
			abiavg: 0,			//	average price for the requested period based on the local average (al + bh) / 2
			abiminrn: Infinity,	//	absolute min range for the requested period based on the local range (al - bh)
			abimaxrn: -Infinity,//	absolute max range for the requested period based on the local range (al - bh)
			abiarn: 0,			//	average range for the requested period based on the local range (al - bh)

			spreadmin: Infinity,	//	absolute min spread for the requested period based on the local spread (ac - bc)
			spreadmax: -Infinity,	//	absolute max spread for the requested period based on the local spread (ac - bc)
			spreadavg: 0,			//	average spread for the requested period based on the local spread (ac - bc)
		};
		const progressRange = range.clone();
		let outcome;
		let n = 1;
		let lastPrintedPercent = -1;
		do
		{
			let progressPercent = Math.round((progressRange.min - range.min) * 100 / range.length);
			if (lastPrintedPercent != progressPercent)
			{
				let progressPercentText = String(progressPercent).padStart(3, ' ') + '%';
				logger.write(ELoggerLevel.Info, "\b\b\b\b" + progressPercentText);
			}

			try
			{
				outcome = await db.collection(coll).find(
				{
					pid: ObjectID(this.data.fields.pid),
					dt: { $gte: progressRange.min, $lte: progressRange.max },
				}).limit(pageDpCount).sort({ dt: 1 }).toArray();
			}
			catch (ex)
			{
				throw new DbException(ex);
			}
			if (!outcome.length) break;
			for (let length = outcome.length, i = 0; i < length; ++i, ++n)
			{
				const item = outcome[i];

				result.almin = Math.min(result.almin, item.al);
				result.ahmin = Math.min(result.ahmin, item.ah);
				result.almax = Math.max(result.almax, item.al);
				result.ahmax = Math.max(result.ahmax, item.ah);
				result.aavg = Sample.avginc(result.aavg, (item.ah + item.al) / 2, n);
				result.aminrn = Math.min(result.aminrn, item.ah - item.al);
				result.amaxrn = Math.max(result.amaxrn, item.ah - item.al);
				result.aarn = Sample.avginc(result.aarn, item.ah - item.al, n);

				result.blmin = Math.min(result.blmin, item.bl);
				result.bhmin = Math.min(result.bhmin, item.bh);
				result.blmax = Math.max(result.blmax, item.bl);
				result.bhmax = Math.max(result.bhmax, item.bh);
				result.bavg = Sample.avginc(result.bavg, (item.bh + item.bl) / 2, n);
				result.bminrn = Math.min(result.bminrn, item.bh - item.bl);
				result.bmaxrn = Math.max(result.bmaxrn, item.bh - item.bl);
				result.barn = Sample.avginc(result.barn, item.bh - item.bl, n);

				result.abavg = Sample.avginc(result.abavg, (item.ah + item.bl) / 2, n);
				result.abminrn = Math.min(result.abminrn, item.ah - item.bl);
				result.abmaxrn = Math.max(result.abmaxrn, item.ah - item.bl);
				result.abarn = Sample.avginc(result.abarn, item.ah - item.bl, n);
				result.abiavg = Sample.avginc(result.abiavg, (item.al + item.bh) / 2, n);
				result.abiminrn = Math.min(result.abiminrn, item.al - item.bh);
				result.abimaxrn = Math.max(result.abimaxrn, item.al - item.bh);
				result.abiarn = Sample.avginc(result.abiarn, item.al - item.bh, n);

				result.spreadmin = Math.min(result.spreadmin, item.ac - item.bc);
				result.spreadmax = Math.max(result.spreadmax, item.ac - item.bc);
				result.spreadavg = Sample.avginc(result.spreadavg, item.ac - item.bc, n);
			}
			progressRange.min = outcome[outcome.length - 1].dt + 1;
		}
		while (outcome.length >= config.db.limit);

		logger.write(ELoggerLevel.Info, "\b\b\b\b" + "OK    " + os.EOL);
		logger.info("Done.");
		return result;
	}
}
