"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class UploadCommand extends Command
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
				bodyParserType: EHttpBodyParserType.FormMultipart,
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
						properties:
						{
							namespace: { type: "string" },
							name: { type: "string" },
							path: { type: "string" },
							size: { type: "number" },
						}
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		return new CommandResult(this.data.files);
    }
}
