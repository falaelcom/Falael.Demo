"use strict";

const fsa = require("fs").promises;

const Utility = require("@framework/Utility.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
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
			rest:
			{
				parameters: ["zz"],
			},
			response:
			{
				responseType: EResponseType.Json,
				validate:
				{
					type: "object",
					properties:
					{
						text: { type: "string" },
						files: { type: "array", items: { type: "string" } },
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
        const files = await Utility.Fs.getFiles({ path: "./commands" });
        files.sort();

        const text = await fsa.readFile(this.data.fields.path, "utf8");

        return new CommandResult(
		{
            text,
            files,
        });
    }
}
