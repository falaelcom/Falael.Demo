"use strict";

const fsa = require("fs").promises;

const InvalidOperationException = require("@framework/InvalidOperationException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class JsonCommand extends Command
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
				method: EHttpMethod.Post,
				bodyParserType: EHttpBodyParserType.Json,
				validate:
				{
					body:
					{
						type: "object",
						properties:
						{
							hello: { type: "string" },
							goodbye: { type: "number" },
						},
					},
				},
			},
			cli:
			{
				bodyParserType: ECliBodyParserType.Json,
				validate:
				{
					json:
					{
						type: "object",
						properties:
						{
							hello: { type: "string" },
							goodbye: { type: "number" },
						},
					},
				},
			},
			response:
			{
				responseType: EResponseType.Json,
				validate:
				{
					type: "object",
					properties:
					{
						hello: { type: "string" },
						goodbye: { type: "number" },
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		if (this.data.document)
		{
			return new CommandResult(this.data.document);
		}

		return new CommandResult(this.data.fields);
    }
}
