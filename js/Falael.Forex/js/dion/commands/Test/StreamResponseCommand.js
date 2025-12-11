"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class StreamResponseCommand extends Command
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
				bodyParserType: EHttpBodyParserType.Stream,
			},
			cli:
			{
				bodyParserType: EHttpBodyParserType.Stream,
			},
			response:
			{
				responseType: EResponseType.Stream,
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		if (inboundStream)
		{
			await inboundStream.read((chunk) =>
			{
				console.log(888888, chunk);
			});

			let binaryArray = Buffer.alloc(1024 * 1024 * 10);
			for (let i = 0; i < binaryArray.length; ++i)
			{
				binaryArray[i] = i % 256;
			}
			outboundStream.writeHeader(200, { "Content-Type": "application/octet-stream" });
			outboundStream.write(binaryArray);
			outboundStream.end();
		}

		return new CommandResult();
    }
}
