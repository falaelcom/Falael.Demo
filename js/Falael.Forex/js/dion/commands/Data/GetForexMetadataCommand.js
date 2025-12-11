"use strict";

const InvalidOperationException = require("@framework/InvalidOperationException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");
const EDateTimeUnit = require("@framework/EDateTimeUnit.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

const ObjectID = require("mongodb").ObjectID;

//	cli tests:
//	r -b full -c /Data/GetForexMetadata
//	r -c /Data/GetForexMetadata
//
//	rest tests:
//	var result = await client.Data.GetForexMetadata();
//
module.exports = class GetForexMetadataCommand extends Command
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
			},
			response:
			{
				responseType: EResponseType.Json,
				validate:
				{
					type: "object",
					required: ["samplingIntervals"],
					properties:
					{
						samplingIntervals:
						{
							type: "array",
							items:
							{
								type: "object",
								required: ["unit", "length", "collectionName"],
								properties:
								{
									unit: { type: "integer" },
									length: { type: "integer" },
									collectionName: { type: "string" },
								},
							},
						},
					},
				},
			},
		};
		return result;
	}

	static async getSamplingIntervals()
	{
		const commandResult = await new GetForexMetadataCommand().execute();
		return commandResult.value.samplingIntervals;
	}

	static async getItemByCollectionName(value)
	{
		const commandResult = await new GetForexMetadataCommand().execute();
		const forexMetadata = commandResult.value;
		for (var length = forexMetadata.samplingIntervals.length, i = 0; i < length; ++i)
		{
			const item = forexMetadata.samplingIntervals[i];
			if (item.collectionName == value) return item;
		}
		return null;
	}

    async execute(inboundStream, outboundStream)
    {
		const result =
		{
			samplingIntervals:
			[
				{
					unit: EDateTimeUnit.Second,
					length: 5,
				},
				{
					unit: EDateTimeUnit.Second,
					length: 10,
				},
				{
					unit: EDateTimeUnit.Second,
					length: 30,
				},
				{
					unit: EDateTimeUnit.Minute,
					length: 1,
				},
				{
					unit: EDateTimeUnit.Minute,
					length: 5,
				},
				{
					unit: EDateTimeUnit.Minute,
					length: 10,
				},
				{
					unit: EDateTimeUnit.Minute,
					length: 15,
				},
				{
					unit: EDateTimeUnit.Minute,
					length: 30,
				},
				{
					unit: EDateTimeUnit.Hour,
					length: 1,
				},
				{
					unit: EDateTimeUnit.Hour,
					length: 4,
				},
				{
					unit: EDateTimeUnit.Day,
					length: 1,
				},
				{
					unit: EDateTimeUnit.Week,
					length: 1,
				},
				{
					unit: EDateTimeUnit.Month,
					length: 1,
				},
			],
		};

		for (var length = result.samplingIntervals.length, i = 0; i < length; ++i)
		{
			const item = result.samplingIntervals[i];
			item.collectionName = "forex.sampledData." + EDateTimeUnit.getName(item.unit) + item.length.toString();
		}
		return new CommandResult(result);
    }
}
