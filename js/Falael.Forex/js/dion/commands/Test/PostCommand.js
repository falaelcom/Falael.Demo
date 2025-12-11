"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class PostCommand extends Command
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
				bodyParserType: EHttpBodyParserType.Form,
			},
			response:
			{
				responseType: EResponseType.Json,
				validate:
				{
					type: "object",
					properties:
					{
						anything: { type: "string" },
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		return new CommandResult(this.data.fields);
    }
}
