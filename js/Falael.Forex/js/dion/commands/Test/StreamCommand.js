"use strict";

const fsa = require("fs").promises;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports = class StreamCommand extends Command
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
				responseType: EResponseType.Text,
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		if (inboundStream)
		{
			//const sb = [];
			let checksum = 0;
			await inboundStream.read((chunk) =>
			{
				for (let length = chunk.length, i = 0; i < length; ++i)
				{
					checksum += chunk[i];
					//sb.push(String(chunk[i]));
				}
				process.stdout.write("*");
			});
			process.stdout.write(checksum + "!!!");
			//require("fs").writeFileSync("testing/checksum.txt", sb.join());
			return new CommandResult(String(checksum));
		}

		return new CommandResult(JSON.stringify(this.data.fields));
    }
}
