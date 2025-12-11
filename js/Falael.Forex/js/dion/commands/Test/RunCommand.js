"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class RunCommand extends Command
{
    constructor(data)
    {
        super(data);
    }

	static get __manifest()
	{
		const result =
		{
			cli:
			{
				bodyParserType: EHttpBodyParserType.None,
				options:
				[
					{
						names: ["text", "t"],
						type: "string",
						default: "(empty)",
					},
					{
						names: ["number", "n"],
						type: "string",
						default: "0",
					}
				],
				validate:
				{
					args:
					{
						type: "object",
						properties:
						{
							text: { type: "string" },
							number: { type: "number" },
						},
					}
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
						aaa: { type: "number" },
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
        return new CommandResult(
		{
            aaa: 666,
        });
    }
}
