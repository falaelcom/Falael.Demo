"use strict";

const ObjectID = require("mongodb").ObjectID;
const moment = require("moment");
const os = require('os');

const InvalidOperationException = require("@framework/InvalidOperationException.js");
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

const Simulator = require("@shared/Simulator.js");

const DbCache = require("@internal/DbCache.js");

const GetForexDataBoundariesCommand = require("@commands/Data/GetForexDataBoundariesCommand.js");
const GetForexMetadataCommand = require("@commands/Data/GetForexMetadataCommand.js");
const GetForexSampledDataCommand = require("@commands/Data/GetForexSampledDataCommand.js");

//	cli tests:
//	r -b full -c /Simulation/SimulateChannelTrade -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1241136000605 --coll=forex.sampledData.minute1
//
//	rest tests:
//	var result = await client.Simulation.SimulateChannelTrade({ querystring: { pid: "5d96423f5a4aa978f03002d2", start: 1241136000365, end: 1241136000605, coll: "forex.sampledData.minute1" } });
//

module.exports = class SimulateChannelTradeCommand extends Command
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
					type: "object",
					required: ["channels", "maxConcurrentChannelCount"],
					properties:
					{
						channels:
						{
							type: "array",
							items:
							{
								type: "object",
								additionalProperties: true,
							},
						},
						maxConcurrentChannelCount: { type: "number" },
					},
				},
			},
		};
		return result;
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

			Math.max(Math.round(this.data.fields.start), dbBoundaries.min),
			Math.min(Math.round(this.data.fields.end), dbBoundaries.max),
		);

		return new CommandResult();
    }
}
