"use strict";

const InvalidOperationException = require("@framework/InvalidOperationException.js");
const DbException = require("@framework/DbException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

const ObjectID = require("mongodb").ObjectID;

//	cli tests:
//		
//	r -c /Data/GetForexDataBoundaries -- --pid=5d96423f5a4aa978f03002d2
//
//	rest tests:
//	var result = await client.Data.GetForexDataBoundaries({ querystring: { pid: "5d96423f5a4aa978f03002d2" } });
//
module.exports = class GetForexDataBoundariesCommand extends Command
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
					required: ["min", "max", "empty"],
					properties:
					{
						min: { type: "integer" },
						max: { type: "integer" },
						empty: { type: "boolean" },
					},
				},
			},
		};
		return result;
	}

	static async run(pid)
	{
		const commandResult = await new GetForexDataBoundariesCommand({ fields: { pid } }).execute();
		return commandResult.value;
	}

    async execute(inboundStream, outboundStream)
    {
		try
		{
			await db.collection("forex.tickData").createIndex(

				{ pid: 1, dt: 1 },
				{ unique: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		let firstTickRecord;
		let lastTickRecord;
		try
		{
			const firstTickResult = await db.collection("forex.tickData").find({ pid: ObjectID(this.data.fields.pid) }).sort({ dt: 1 }).limit(1).toArray();
			const lastTickResult = await db.collection("forex.tickData").find({ pid: ObjectID(this.data.fields.pid) }).sort({ dt: -1 }).limit(1).toArray();
			firstTickRecord = firstTickResult[0];
			lastTickRecord = lastTickResult[0];
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		const result =
		{
			min: null,
			max: null,
			empty: true,
		};
		if (firstTickRecord && lastTickRecord)
		{
			result.min = firstTickRecord.dt;
			result.max = lastTickRecord.dt;
			result.empty = false;
		}
		return new CommandResult(result);
    }
}
