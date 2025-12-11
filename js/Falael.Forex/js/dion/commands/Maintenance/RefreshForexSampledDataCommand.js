"use strict";

const fsa = require("fs").promises;
const path = require("path");
const os = require('os');
const UUID = require("pure-uuid");
const ObjectID = require("mongodb").ObjectID;

const FormatException = require("@framework/FormatException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const InvalidValueException = require("@framework/InvalidValueException.js");
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

const GetForexDataBoundariesCommand = require("@commands/Data/GetForexDataBoundariesCommand.js");
const GetForexMetadataCommand = require("@commands/Data/GetForexMetadataCommand.js");
const GetForexSampledDataCommand = require("@commands/Data/GetForexSampledDataCommand.js");

//	cli tests:
//	r -b full -c /Maintenance/RefreshForexSampledData -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1241136000605 --coll=forex.sampledData.minute5
//	r -b full -c /Maintenance/RefreshForexSampledData -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1272661200000 --coll=forex.sampledData.hour1
//	r -b full -c /Maintenance/RefreshForexSampledData -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1272661200000
//	r -b full -c /Maintenance/RefreshForexSampledData -- --pid=5d96423f5a4aa978f03002d2 --coll=forex.sampledData.hour1
//	r -b full -c /Maintenance/RefreshForexSampledData -- --pid=5d96423f5a4aa978f03002d2
//	r -b full -c /Maintenance/RefreshForexSampledData -- --pid=5d98a1765a4aa978f09c5464

module.exports = class RefreshForexSampledDataCommand extends Command
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
						help: "optional; the start of the time range to sample in milliseconds; if ommitted, the time of the earliest database record for the specified currency pair is used",
					},
					{
						names: ["end"],
						type: "number",
						help: "optional; the end of the time range to sample in milliseconds; if ommitted, the time of the latest database record for the specified currency pair is used",
					},
					{
						names: ["coll"],
						type: "string",
						help: "optional; name of the sampled data collection to process, as returned by the /Data/GetForexMetadata command; if ommitted, all defined collections will be processed in a batch",
					},
					{
						names: ["force"],
						type: "bool",
						help: "optional; if set this option will cause the sampled data collection locks to always succeed; useful to continue sampling after a crash",
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
		logger.info("Refreshing sampled data...");

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
				await GetForexSampledDataCommand.run(
				{
					pid: this.data.fields.pid,
					start: range.min,
					end: range.max,
					coll: item.collectionName,
					mute: true,
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

			await GetForexSampledDataCommand.run(
			{
				pid: this.data.fields.pid,
				start: range.min,
				end: range.max,
				coll: this.data.fields.coll,
				mute: true,
				force: this.data.fields.force,
			});
		}

		logger.info("Ready.");
		return new CommandResult();
	}
}
