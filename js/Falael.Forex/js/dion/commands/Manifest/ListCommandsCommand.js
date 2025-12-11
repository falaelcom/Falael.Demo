"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const CommandRegistry = require("@framework/CommandRegistry.js");
const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class ListCommandsCommand extends Command
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
				bodyParserType: EHttpBodyParserType.None,
			},
			response:
			{
				responseType: EResponseType.Json,
				compressed: true,
				validate:
				{
					type: "array",
					items:
					{
						type: "object",
						properties:
						{
							path: { type: "string" },											//	the rest path of the command, including trailing params
							httpMethod: { type: "integer" },									//	Command.manifest.rest.method: EHttpMethod
							requestType: { type: "integer" },									//	Command.manifest.rest.bodyParserType: EHttpBodyParserType
							requestValidate: { type: "object", additionalProperties: true },	//	Command.manifest.rest.validate
							responseType: { type: "integer" },									//	Command.manifest.responseType: EResponseType
							responseValidate: { type: "object", additionalProperties: true },	//	Command.manifest.response.validate
						},
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		const result = [];
		for (let length = application.commandRegistry.commandList.length, i = 0; i < length; ++i)
		{
			let item = application.commandRegistry.commandList[i];
			if (!item.commandType.manifest.rest)
			{
				continue;
			}

			result.push(
			{
				path: item.key,
				httpMethod: item.commandType.manifest.rest.method,
				requestType: item.commandType.manifest.rest.bodyParserType || EHttpBodyParserType.None,
				requestValidate: item.commandType.manifest.rest.validate,
				responseType: item.commandType.manifest.response.responseType || EResponseType.None,
				responseValidate: item.commandType.manifest.response.validate,
			});
		}

        return new CommandResult(result);
    }
}
