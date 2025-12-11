"use strict";

const dashdash = require("dashdash");

const ArgumentException = require("@framework/ArgumentException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const ValidationFailedException = require("@framework/ValidationFailedException.js");

const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Utility = require("@framework/Utility.js");
const Stream = require("@framework/Stream.js");
const Protocol = require("@framework/Protocol.js");

const CommandRegistry = require("@framework/CommandRegistry.js");
const Command = require("@framework/Command.js");
const CommandData = require("@framework/CommandData.js");
const CommandResult = require("@framework/CommandResult.js");

module.exports =

class CliProtocol extends Protocol
{
    constructor(commandDirectory)
    {
		super(commandDirectory);
    }

	async start(options)
	{
		const commandRegistry = new CommandRegistry();
        await commandRegistry.register(this.commandDirectory);

		const commandType = commandRegistry.commandMap.get(options.command);
		if (!commandType)
		{
			throw new ArgumentException("command", "Unknown command " + options.command);
		}

		if (commandType.manifest.cli)
		{
			const commandData = await this.parse(commandType, options);
			const inboundStream = await this.getInboundStream(commandType.manifest, process.stdin);
			const outboundStream = await this.getOutboundStream(commandType.manifest, process.stdout);

			const command = new commandType(commandData);
			const commandResult = await command.execute(inboundStream, outboundStream);

			this.reply(commandType.manifest, commandResult, process.stdout);
		}
		else
		{
			throw new ArgumentException("command", "CLI protocol is not supported by the command " + options.command);
		}

		return process.exit(0);
	}

    async parse(commandType, options)
    {
		const result = new CommandData();

		//	JSON and stream
		switch (commandType.manifest.cli.bodyParserType)
		{
			case ECliBodyParserType.None:
			case ECliBodyParserType.Stream:
				if (options.json)
				{
					result.document = JSON.parse(options.json);
					if (!Command.__ajv.validate(commandType.key + " json", result.document))
					{
						throw new ValidationFailedException(Command.__ajv.errors, Command.__ajv.errorsText(Command.__ajv.errors));
					}
				}
				break;
			case ECliBodyParserType.Json:
				const json = await this._readStdin_Utf8();
				result.document = JSON.parse(json);
				if (!Command.__ajv.validate(commandType.key + " json", result.document))
				{
					throw new ValidationFailedException(Command.__ajv.errors, Command.__ajv.errorsText(Command.__ajv.errors));
				}
				break;
			default:
				throw new NotImplementedException();
		}

		//	command line options after --
		const parser = dashdash.createParser({ options: commandType.manifest.cli.options });
		const commandOptions = parser.parse(["", ""].concat(options._args));	//	["", ""] stands for argv[0] (node binary path) and argv[1] (js file path), which are expected by dashdash

		var coll = commandOptions._order;
		for (var length = coll.length, i = 0; i < length; ++i)
		{
			var item = coll[i];
			result.fields[item.key] = item.value;
		}
		if (!Command.__ajv.validate(commandType.key + " args", result.fields))
		{
			throw new ValidationFailedException(Command.__ajv.errors, Command.__ajv.errorsText(Command.__ajv.errors));
		}

		//	files
		if (options.file)	//	dashdash will set this field to the value of the last option occurrence if at least one --file/-f option is present
		{
			var coll = options._order;
			for (var length = coll.length, i = 0; i < length; ++i)
			{
				var item = coll[i];
				if (item.key != "file")
				{
					continue;
				}
				result.files.push(item.value);
			}
		}

		return result;
    }

	getInboundStream(commandManifest, inboundStream)
	{
		switch (commandManifest.cli.bodyParserType)
		{
			case ECliBodyParserType.None:
			case ECliBodyParserType.Json:
				return null;
			case EHttpBodyParserType.Stream:
				return new Stream(inboundStream);
			default:
				throw new NotImplementedException();
		}
	}

	reply(commandManifest, commandResult, stdout)
	{
		var result = commandResult.value;
		switch (commandManifest.response.responseType)
		{
			case EResponseType.None:
				if (!Utility.Type.isNU(result))
				{
					throw new ResponseTypeException("null or undefined");
				}
				break;
			case EResponseType.Json:
				if (!Utility.Type.isJson(result))
				{
					throw new ResponseTypeException("json");
				}
				if (!commandManifest.response.validate)
				{
					throw new InvalidOperationException("Response schema is required with EResponseType.Json");
				}
				stdout.write(JSON.stringify(result));
				stdout.write('\n');
				break;
			case EResponseType.Text:
				if (!Utility.Type.isString(result))
				{
					throw new ResponseTypeException("string");
				}
				stdout.write(result);
				break;
			case EResponseType.Binary:
				var className = Utility.Type.getClass(result);
				switch (className)
				{
					case "Buffer":
						stdout.write(result);
						break;
					case "ReadStream":
						result.pipe(stdout);
						break;
					default:
						throw new ResponseTypeException("Buffer or ReadStream");
				}
				
				break;
			case EResponseType.Stream:
				break;
			default:
				throw new NotImplementedException();
		}
	}

	async _readStdin_Utf8()
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				var sb = [];
				process.stdin.setEncoding("utf8");

				process.stdin.on("data", (chunk) =>
				{
					sb.push(chunk);
				});
				process.stdin.on("end", () =>
				{
					return resolve(sb.join(""));
				});
				process.stdin.on("error", (error) =>
				{
					return reject(error);
				});
			}
			catch (ex)
			{
				return reject(ex);
			}
		});
	}
}
