"use strict";

const InvalidOperationException = require("@framework/InvalidOperationException.js");
const DbException = require("@framework/DbException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");
const Range = require("@shared/Range.js");

const ObjectID = require("mongodb").ObjectID;

//	cli tests:
//		
//	r -c /Data/GetForexTickDataCompact -- --pid=5d96423f5a4aa978f03002d2 --start=1241136000365 --end=1272661200000
//
//	rest tests:
//	var result = await client.Data.GetForexTickDataCompact({ querystring: { pid: "5d96423f5a4aa978f03002d2", start: 1241136000365, end: 1241136000605 } });
//

const dbReadOpLimit = 200000;

module.exports = class GetForexTickDataCompactCommand extends Command
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
						required: [ "pid", "start", "end" ],
						properties:
						{
							pid: { type: "string" },
							start: { type: "number" },
							end: { type: "number" },
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
					type: "object",
					required: ["dt", "arr"],
					properties:
					{
						dt: { type: "number" },
						arr:
						{
							type: "array",
							items:
							{
								type: "number",
							},
						},
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		console.time("tickData");
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

		const coll = "forex.tickData";
		const range = new Range(this.data.fields.start, this.data.fields.end);
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
				console.timeEnd("tickData");
				return new CommandResult(this._compact(result));
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
			const limit = dbReadOpLimit;
			//const limit = config.db.limit;
			do
			{
				try
				{
					outcome = await db.collection(coll).find(
					{
						pid: ObjectID(this.data.fields.pid),
						dt: { $gte: range.min, $lte: range.max },
					}).limit(limit).sort({ dt: sort }).toArray();
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
			while (outcome.length >= limit);
			console.timeEnd("tickData");
			return new CommandResult(this._compact(result || []));
		}
    }

	_compact(arr)
	{
		if (!arr.length) return { dt: null, arr: [] };

		const result =
		{
			dt: arr[0].dt,
			arr: [],
		};
		for (let length = arr.length, i = 0; i < length; ++i)
		{
			const item = arr[i];
			result.arr.push(item.dt - result.dt);
			result.arr.push(item.ask);
			result.arr.push(item.bid);
		}
		return result;
	}
}
