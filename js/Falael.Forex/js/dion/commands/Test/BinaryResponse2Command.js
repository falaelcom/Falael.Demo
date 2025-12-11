"use strict";

const fs = require("fs");
const path = require("path");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class BinaryResponse2Command extends Command
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
				bodyParserType: EHttpBodyParserType.None,
			},
			cli:
			{
				bodyParserType: EHttpBodyParserType.None,
			},
			response:
			{
				responseType: EResponseType.Binary,
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		var filePath = path.resolve("commands/Test/BinaryResponse2Command.js");
        return new CommandResult(fs.createReadStream(filePath, "utf8"));
    }
}
