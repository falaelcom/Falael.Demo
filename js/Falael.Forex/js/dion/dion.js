"use strict";

require("module-alias/register");

const signature = "dion";
const version = "1.0.0";
const commandDirectory = "./commands";
const sharedDirectory = "./shared";
const clientDirectory = "./xenesio";

global.application =
{
	signature: signature,
	version: version,
	commandDirectory: commandDirectory,
};

const fs = require("fs");
const path = require("path");
const dashdash = require("dashdash");
const UUID = require("pure-uuid");
const chalk = require("chalk");

const Server = require("mongodb").Server;
const MongoClient = require("mongodb").MongoClient;

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ELoggerLevel = require("@framework/ELoggerLevel.js");
const ELoggerTarget = require("@framework/ELoggerTarget.js");

const DionException = require("@framework/DionException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const ArgumentException = require("@framework/ArgumentException.js");

const Utility = require("@framework/Utility.js");
const Logger = require("@framework/Logger.js");
const Configuration = require("@framework/Configuration.js");

const Range = require("@shared/Range.js");
const Command = require("@framework/Command.js");
const CommandRegistry = require("@framework/CommandRegistry.js");
const Stream = require("@framework/Stream.js");
const RestProtocol = require("@framework/RestProtocol.js");
const CliProtocol = require("@framework/CliProtocol.js");

const bootContext =
{
	optionsParser: null,
	options: null,
	versionInfo: null,
};

async function boot(bootContext)
{
	try 
    {
		console.time("[time] early boot complete in");

		Command.__initializeCliAjv();

		if (!_stage_parseCliOptions(bootContext)) process.exit(0);
		if (!(await _stage_getVersionInfo(bootContext))) process.exit(0);
		if (!(await _stage_executeImmediateCliOptions(bootContext))) process.exit(0);
		if (!_stage_configureLogger(bootContext)) process.exit(0);
		if (!_stage_configureGlobals(bootContext)) process.exit(0);
		if (!_stage_loadConfiguration(bootContext)) process.exit(0);
		if (!(await _stage_initDatabase(bootContext))) process.exit(0);

		process.on("SIGINT", _exit);
		process.on("SIGTERM", _exit);
		process.on("SIGUSR1", _exit);
		process.on("SIGUSR2", _exit);

		if (bootContext.options.verbosity == "full") console.timeEnd("[time] early boot complete in");
		if (bootContext.options.verbosity == "full") console.time("[time] application");

		let protocol = null;
		if (bootContext.options.command)
        {
			protocol = new CliProtocol(commandDirectory);
		}
		else
		{
			protocol = new RestProtocol(commandDirectory, sharedDirectory, clientDirectory);
		}

		await protocol.start(bootContext.options);

		if (bootContext.options.verbosity == "full") console.timeEnd("[time] application");
	}
	catch (ex)
	{
        console.error(ex);
        process.exit(-1);
	}
}

function _stage_parseCliOptions(bootContext)
{
    const options =
    [
        {
            names: ["environment", "e"],
            type: "string",
            help: "specify the execution environment: \"development\" (default), \"win64dev\", \"testing\", \"production\"",
            helpArg: "ENV",
            env: "ENVIRONMENT",
			default: "win64dev",
        },
		{
            names: ["config", "n"],
            type: "string",
            help: "cascade an additional configuration snippet file (multiple --config arguments are supported)",
            helpArg: "CONFIG",
            env: "CONFIG",
            default: null,
		},
        {
            names: ["command", "c"],
            type: "string",
            help: "execute a command instead of running the web server",
            helpArg: "COMMAND",
            env: "COMMAND",
            default: null,
        },
		{
            names: ["json", "j"],
            type: "string",
            help: "a json to pass to the command (ignored if a command argument is not specified or if the command's body parser type is not Json)",
            helpArg: "JSON",
            env: "JSON",
            default: null,
        },
        {
            names: ["verbosity", "b"],
            type: "string",
            help: "verbosity level; possible values are 'silent' (default in command mode), 'normal' (default in rest server mode), 'full'",
            helpArg: "VERBOSITY",
            env: "VERBOSITY",
        },
        {
            names: ["list", "l"],
            type: "bool",
            help: "list all available commands",
            helpArg: "LIST",
            env: "LIST",
        },
        {
            names: ["file", "f"],
            type: "string",
            help: "add a file path to the command data's files collection (multiple --file arguments are supported)",
            helpArg: "FILE",
            env: "FILE",
        },
        {
            names: ["help", "h"],
            type: "bool",
            help: "display this help",
        },
        {
            names: ["version", "v"],
            type: "bool",
            help: "show version",
        },
        {
            names: ["unittest"],
            type: "bool",
            help: "run unit tests",
        }
    ];

    const parser = dashdash.createParser({ options: options });
    let result = null;

    try
    {
		result = parser.parse(process.argv);

		if (!result.verbosity)
		{
			if (result.command) result.verbosity = "silent";
			else result.verbosity = "normal";
		}
    }
    catch (ex)
    {
        console.error(ex.message);
        const help = parser.help({ includeEnv: true }).trimRight();
        console.log("usage: node dion.js [OPTIONS]\n"
            + "options:\n"
            + help);
		return false;
    }

	bootContext.options = result;
	bootContext.optionsParser = parser;
    return true;
}

async function _stage_getVersionInfo(bootContext)
{
	return new Promise((resolve, reject) =>
	{
		const versionInfo =
		{
			signature,
			version,
			text: signature + " v" + version,
		};
		bootContext.versionInfo = versionInfo;
		return resolve(true);
	});
}

async function _stage_executeImmediateCliOptions(bootContext)
{
    if (bootContext.options.help)
    {
        const help = bootContext.optionsParser.help({ includeEnv: true }).trimRight();
        console.log("usage: node dion.js [OPTIONS]\n"
            + "options:\n"
            + help);
		return false;
    }
    else if (bootContext.options.version)
    {
        console.log(bootContext.versionInfo.text);
		return false;
    }
	else if (bootContext.options.unittest)
	{
		console.log(chalk`{magentaBright Running available unit tests}`);
		console.log(require("util").inspect(Utility.Type.__unitTest(), { maxArrayLength: null }));
		console.log(require("util").inspect(Range.__unitTest(), { maxArrayLength: null }));
		return false;
	}
	else if (bootContext.options.list)
	{
		const commandRegistry = new CommandRegistry();
		await commandRegistry.register(commandDirectory);

		commandRegistry.commandList.sort((l, r) => l.key > r.key);
		for (let length = commandRegistry.commandList.length, i = 0; i < length; ++i)
		{
			console.log(commandRegistry.commandList[i].key);
		}

		return false;
	}

	return true;
}

function _stage_configureLogger(bootContext)
{
	global.logger = new Logger([ELoggerTarget.Stdout]);
	global.log = logger.info.bind(logger);

	switch (bootContext.options.verbosity)
	{
		case "silent":
			logger.addRoute(ELoggerLevel.Trace, ELoggerTarget.Null);
			logger.addRoute(ELoggerLevel.Debug, ELoggerTarget.Null);
			logger.addRoute(ELoggerLevel.Info, ELoggerTarget.Null);
			logger.addRoute(ELoggerLevel.Warning, ELoggerTarget.Null);
			logger.addRoute(ELoggerLevel.Error, ELoggerTarget.Stderr);
			logger.addRoute(ELoggerLevel.Fatal, ELoggerTarget.Stderr);
			break;
		case "normal":
			logger.addRoute(ELoggerLevel.Trace, ELoggerTarget.Null);
			logger.addRoute(ELoggerLevel.Debug, ELoggerTarget.Null);
			logger.addRoute(ELoggerLevel.Info, ELoggerTarget.Stdout);
			logger.addRoute(ELoggerLevel.Warning, ELoggerTarget.Stderr);
			logger.addRoute(ELoggerLevel.Error, ELoggerTarget.Stderr);
			logger.addRoute(ELoggerLevel.Fatal, ELoggerTarget.Stderr);
			break;
		case "full":
			logger.addRoute(ELoggerLevel.Trace, ELoggerTarget.Stdout);
			logger.addRoute(ELoggerLevel.Debug, ELoggerTarget.Stdout);
			logger.addRoute(ELoggerLevel.Info, ELoggerTarget.Stdout);
			logger.addRoute(ELoggerLevel.Warning, ELoggerTarget.Stderr);
			logger.addRoute(ELoggerLevel.Error, ELoggerTarget.Stderr);
			logger.addRoute(ELoggerLevel.Fatal, ELoggerTarget.Stderr);
			break;
		default:
			throw new ArgumentException("verbosity", String(bootContext.options.verbosity) + " is not a valid verbosity value, accepted values are \"silent\" | \"normal\" | \"full\".");
	}

	process.on("uncaughtException", function (err)
	{
		logger.error(110003, err);
	});

	return true;
}

function _stage_configureGlobals(bootContext)
{
	global.newLUID = function ()
	{
		var result = global.newLUID._counter;
		++global.newLUID._counter;
		if (global.newLUID._counter == Number.MAX_SAFE_INTEGER) global.newLUID._counter = Number.MIN_SAFE_INTEGER;
		else if (global.newLUID._counter == 0) throw "Counter overflow.";
		return result;
	}
	global.newLUID._counter = 0;

	global.Enum = function (obj)
	{
		obj.reverseMap = {};
		for (var key in obj) obj.reverseMap[obj[key]] = key;
		obj.toString = function (value) { return obj.reverseMap[value]; }
		return obj;
	}

	return true;
}

function _stage_loadConfiguration(bootContext)
{
	//const mainConfigurationPath = path.resolve("testing/configuration.json");
	const mainConfigurationPath = path.resolve("configuration.json");

	var configLog;
	if (bootContext.options.list || bootContext.options.command)
	{
		configLog = logger.trace.bind(logger);
	}
	else
	{
		configLog = logger.info.bind(logger);
	}
	configLog(chalk`[main config]: {whiteBright ${mainConfigurationPath}}`);
	const configJson = require(mainConfigurationPath);

	const snippets = [];
	if (bootContext.options.config)
	{
		const coll = bootContext.options._order;
		for (let length = coll.length, i = 0; i < length; ++i)
		{
			const item = coll[i];
			if (item.key != "config")
			{
				continue;
			}
			const snippetFilePath = path.resolve(item.value);
			configLog(chalk`[extra config]: {whiteBright ${snippetFilePath}}`);
			snippets.push({ json: require(snippetFilePath), path: snippetFilePath });
		}
	}

	global.config = new Configuration(
		{ json: configJson, name: "configuration.json" },
		snippets,
		bootContext.options.environment
	);
	configLog("[effective config]");
	const output = {};
	Object.assign(output, config.$);
	//	output.db.password = "<hidden>";
	configLog(JSON.stringify(output, null, '  '));

	return true;
}

async function _stage_initDatabase(bootContext)
{
	var dbInitLog;
	if (bootContext.options.command)
	{
		dbInitLog = logger.trace.bind(logger);
	}
	else
	{
		dbInitLog = logger.info.bind(logger);
	}

	dbInitLog(chalk`{magentaBright Connecting to mongodb}:`);

	const server = new Server(config.db.host, config.db.port);

	global.mongoClient = await MongoClient.connect(server, {});
	global.db = mongoClient.db(config.db.name);

	dbInitLog(chalk`Connection ready.`);

	return true;
}

async function _exit()
{
	await mongoClient.close();
	if (mongoClient.topology && mongoClient.topology.isConnected())
	{
		logger.error(110004, "Failed to close the default mongodb connection.");
	}

	return process.exit(0);
}

boot(bootContext);

