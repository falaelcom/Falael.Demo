"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class BinaryResponse1Command extends Command
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
		const binaryArray = Buffer.alloc(1024 * 1024 * 10);
		for (let i = 0; i < binaryArray.length; ++i)
		{
			binaryArray[i] = i % 256;
		}
        return new CommandResult(binaryArray);
    }
}
