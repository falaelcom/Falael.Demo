//	R0Q3?/daniel/20210727
//  - TODO: internal implementation of "module-alias"
//  - IMPL
//      - migrate command code from GamingGates
//          - command metadata and (REST) request/response schema validation, (CLI) options/printout schema validation
//      - error handling (for REST: server side and pass through to client)
//      - REST server: rest url parser
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

require("module-alias/register");

/////////////////////////////////////////////////////////////////////////////
//  Configure Globals
/////////////////////////////////////////////////////////////////////////////

global.NODE_DEBUG = (require('inspector').url() !== void 0);    //  https://stackoverflow.com/a/67445850/4151043
global.PB_DEBUG = NODE_DEBUG;                                   //  required by Primordial Blocks

/////////////////////////////////////////////////////////////////////////////
//  Validate Runtime
/////////////////////////////////////////////////////////////////////////////

const unsupported = require("-/pb/natalis/000/Runtime.js").caps({ query: "unsupported", acknowledge: ["GlobalObject:window"] });
unsupported.length ? console.error(`Unsupported runtime caps:`, unsupported) : void 0;

/////////////////////////////////////////////////////////////////////////////
//  References
/////////////////////////////////////////////////////////////////////////////

const DebugManifest = require("-/pb/dion/DebugManifest.js");
//  TODO: move directories to `configuration.json`
//  TODO: get module aliases from package.json
DebugManifest.installRequire([{ directory: "./", recursive: true }, { directory: "-/pb/natalis", recursive: true }, { directory: "-/pb/dion", recursive: true }], { "-/pb/natalis": "../../pb/natalis", "-/pb/dion": "../../pb/dion" });

const { Type } = require("-/pb/natalis/Native.js");
const Feedback = require("-/pb/natalis/Feedback.js")
const Exception = require("-/pb/natalis/Exception.js");
const Configuration = require("-/pb/natalis/Configuration.js");
const Options = require("-/pb/natalis/Options.js");
const Logger = require("-/pb/natalis/Logger.js");
const Context = require("-/pb/natalis/Context.js");

/////////////////////////////////////////////////////////////////////////////
//  Main Application
/////////////////////////////////////////////////////////////////////////////

const signature = require("path").basename(__filename, ".js");

const options =
[
    `Usage: node ${signature} [OPTIONS]`,
    {
        names: ["verbosity", "b"],
        description: `logging verbosity level; possible values for LVL are: 0 or "silent", 1 or "fatal", 2 or "errors", 3 or "warnings", 4 or "info" (default), 5 or "time", 6 or "debug", 7 or "trace"`,
        argument: "LVL",
        value:
        {
            parser: value =>
            {
                switch(value)
                {
                    case null: return null;
                    case "7": case "dump": return 7;
                    case "6": case "trace": return 6;
                    case "5": case "time": return 5;
                    case "4": case "info": return 4;
                    case "3": case "warnings": return 3;
                    case "2": case "errors": return 2;
                    case "1": case "fatal": return 1;
                    case "0": case "silent": return 0;
                    default: throw new Exception(0x643703, `Invalid verbosity level value "${value}". See help for details.`);
                }
            },
            default: "info"
        },
    },
    {
        names: ["timestamp", "t"],
        description: "if present, this flag enforces ISO-formatted timestamps on logging, e.g. \"[2000-01-31T01:00:00.555Z]\"",
    },
    {
        names: ["environment", "e"],
        description: "specify the execution environment; possible values for ENV are \"win64dev\" (default), \"testing\", \"production\"",
        argument: "ENV",
        value:
        {
            parser: value =>
            {
                switch(value)
                {
                    case null:
                    case "win64dev":
                    case "testing":
                    case "production":
                        return value;
                    default: throw new Exception(0x71BBE2, `Unknown environment name "${value}". See help for details.`);
                }
            },
            default: "win64dev"
        },
    },
    {
        names: ["config", "n"],
        description: "override the default path (which is the current working directory) to the main configuration FILE; FILE is a path relative to the current working directory",
        argument: "FILE",
        value: { parser: Type.String, default: null }
    },
    {
        names: ["config-snippet"],
        property: "configSnippets",
        cardinality: Infinity,
        description: "cascade an additional configuration snippet file (multiple --config-snippet arguments are supported); FILE is a path relative to the current working directory",
        argument: "FILE",
        value: { parser: Type.String, default: null },
    },
    {
        names: ["command", "c"],
        description: "execute the command CMD, instead of running the web server",
        argument: "CMD",
        value: { parser: Type.String },
    },
    {
        names: ["json", "j"],
        description: "a json to pass to the command (ignored if a command argument is not specified or if the command's body parser type is not Json)",
        argument: "JSON",
        value: { parser: Type.String, default: null },
    },
    {
        names: ["file", "f"],
        cardinality: Infinity,
        description: "add a file path to the command data's files collection (multiple --file arguments are supported); FILE is a path relative to the current working directory",
        argument: "FILE",
        value: { parser: Type.String, default: null },
    },
    {
        names: ["list", "l"],
        description: "list all commands",
    },
    {
        names: ["help", "h"],
        description: "print out this help",
    },
    {
        names: ["version", "v"],
        description: "print out application version",
    },
    {
        names: ["build"],
        description: `build the application using the rules specified in the application configuration's "build" section; possible values for TARGET are: "zen", "pb"; considers the selected execution environment (see -e, --environment).`,
        argument: "TARGET",
        value:
        {
            parser: value =>
            {
                switch (value)
                {
                    case "zen":
                    case "pb":
                        return value;
                    default: throw new Exception(0x9AA86E, `Unknown target name "${value}". See help for details.`);
                }
            },
        },
    },
    {
        names: ["sources-collect"],
        description: "collect and update the source code files as specified in the application configuration's \"sources\" section; considers the selected execution environment (see -e, --environment).",
    },
    {
        names: ["unit-test"],
        description: "run all unit tests",
    },
    {
        names: ["performance-test"],
        description: "run enabled performance tests; see \"-/pb/natalis/PerformanceTests.js\"",
    },
    {
        names: ["profile"],
        description: "build performance profile of the underlying JavaScript engine; STANDARD_DURATION_MS defines the standard for the single probe running duration; value of 250 yields quicker execution and low precision; value of 8000 yields slow execution and high precision",
        argument: "STANDARD_DURATION_MS",
        value: { parser: Type.Number },
    },
];

async function boot()
{
    const bootContext =
    {
        args: process.argv.slice(2),
        options: null,
        package: { path: null, info: null },
        versionInfo: { signature: null, version: null, text: null },
        config: null,
        logger: null,
    };

	try
	{
		process.on("SIGINT",  () => { (bootContext.logger ? bootContext.logger.warn.bind(bootContext.logger) : console.log)("SIGINT (Ctrl-C)."); _exit(-2); });
		process.on("SIGTERM", () => { (bootContext.logger ? bootContext.logger.warn.bind(bootContext.logger) : console.log)("SIGTERM."); _exit(-3); });
		process.on("SIGQUIT", () => { (bootContext.logger ? bootContext.logger.warn.bind(bootContext.logger) : console.log)("SIGQUIT."); _exit(-4); });

		if (!_boot_parseArguments(bootContext)) return await _exit();
		if (!_boot_configureLogger(bootContext)) return await _exit();                                  bootContext.logger.time("[time] Early boot");
		if (!(_boot_parsePackageJson(bootContext))) return await _exit();
		if (!(await _boot_readVersionInfo(bootContext))) return await _exit();
		if (!(await _boot_executeImmediateOptions(bootContext))) return await _exit();                  bootContext.logger.info(`${NODE_DEBUG?"Debugging":"Starting"} ${bootContext.versionInfo.text}...`);
		if (!_boot_loadAppConfiguration(bootContext)) return await _exit();
        if (!(await _boot_configureContext(bootContext))) return await _exit();                         bootContext.logger.timeEnd("[time] Early boot");
        if (!(await _boot_executeImmediateOptions_configurable(bootContext))) return await _exit();

        bootContext.logger.time("[time] Database connection");
		if (!(await _boot_initDatabase(bootContext))) return await _exit();
        bootContext.logger.timeEnd("[time] Database connection");

		if (bootContext.options.command)
        {
            bootContext.logger.time("[time] Command");
            await _boot_executeCommand(bootContext);
            bootContext.logger.timeEnd("[time] Command");
            return await _exit();
        }
        else 
        {
            bootContext.logger.time("[time] REST server start");
            await _boot_startRestServer(bootContext);
            bootContext.logger.timeEnd("[time] REST server start");
        }

        bootContext.logger.info(`Ready.`);
    }
	catch (ex)
    {
        if (bootContext && bootContext.logger) bootContext.logger.fatal(ex);
        else console.error(ex);
		return await _exit(-1);
	}

    async function _exit(code = 0)
    {
        if(!Context.pristine && Context.heap.dbClient)
        {
            await Context.heap.dbClient.close();
            if (Context.heap.dbClient.topology && Context.heap.dbClient.topology.isConnected()) bootContext.logger.error(110004, "Failed to close the mongodb connection.");
            else bootContext.logger.info("Mongodb connection colsed.");
        }
        if (NODE_DEBUG)
        {
            console.log("Press any key to exit...");
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on("data", process.exit.bind(process, code));
        }
        else process.exit(code);
    }
}

function _boot_parseArguments(bootContext)
{
    try
    {
        const config_weak =
        {
            posix_strict: false,
            posix_rejectUnknownFlags: false,
            gnu_rejectUnknownFlags: false,
            gnu_rejectUnknownAssignables: false,
        };
        const options_weak = Options.json(options, bootContext.args, config_weak);

        if(options_weak.command) bootContext.options = options_weak;
        else bootContext.options = Options.json(options, bootContext.args, { posix_strict: false });

        return true;
    }
    catch (ex)
    {
        switch(ex.ncode)
        {
            case 0x7BBB35:
            case 0x369BE9:
                console.error("\n" + ex.rawMessage);
                console.log(Options.format(options));
                break;
            default: console.error("\n" + ex.message);
        }
        return false;
    }
}

function _boot_parsePackageJson(bootContext)
{
    const path = require("path");
    const fs = require("fs");

    let directory = process.cwd();
    let packageJsonPath;
    let success = false;
    do
    {
        packageJsonPath = path.join(directory, "package.json");
        if(fs.existsSync(packageJsonPath)) { success = true; break; }
        directory = path.resolve(directory, "..");
    }
    while(directory && directory !== "/");

    if(!success) throw new Exception(0x8857F3, `Unable to locate "package.json".`);

    bootContext.package.path = packageJsonPath;
    bootContext.package.info = require(packageJsonPath);

    return true;
}

async function _boot_readVersionInfo(bootContext)
{
    return new Promise((resolve, reject) =>
    {
        bootContext.versionInfo.signature = signature;
        bootContext.versionInfo.version = bootContext.package.info.version;
        bootContext.versionInfo.text = `${bootContext.versionInfo.signature} v${bootContext.versionInfo.version}`;
        return resolve(true);
    });
}

async function _boot_executeImmediateOptions(bootContext)
{
    try
    {
        if (bootContext.options.help)
        {
            bootContext.logger.info(Options.format(options));
            return false;
        }
        else if (bootContext.options.version)
        {
            bootContext.logger.info(bootContext.versionInfo.text);
            return false;
        }
        else if (bootContext.options["unit-test"])
        {
            const PB_DEBUG = global.PB_DEBUG;
            global.PB_DEBUG = true;
            try
            {
                //  Function: Filters out messages for known compatibility issues between nodejs and Primordial Blocks
                //  Remarks: Known compatibility issues between nodejs v14.18.1 and Primordial Blocks:
                //      (1) in nodejs v14.18.1 `String(Intl) === "[object Object]"` and `String(Reflect) === "[object Object]"`;
                //          - WORKAROUND: none, but the lacking functionality is non-critical and only affects some unit tests
                const acknowledged =
                    [
                        "String(Intl)",                                                   //  (1) WORKAROUND: none, but the lacking functionality is non-critical and only affects some unit tests
                        "String(Reflect)",                                                //  (1) WORKAROUND: none, but the lacking functionality is non-critical and only affects some unit tests
                    ];
                Context.configure(
                    {
                        version: null,
                        config: null,
                        logger: new Logger(),                   //  required by `Context.luid` and hence by `-/pb/natalis/UnitTests.unitTest_MulticastDelegate()`
                        guid: require("crypto").randomUUID,     //  required by `Context.luid` and hence by `-/pb/natalis/UnitTests.unitTest_MulticastDelegate()`
                        esc: () => { throw new Exception(0x0, `Not implemented.`); },
                    });

                bootContext.logger.info(`Running unit tests (PB_DEBUG === true)...`);
                let asyncTests = [];
                {
                    bootContext.logger.info(`For "pb/natalis"...`);
                    asyncTests = asyncTests.concat(require("-/pb/natalis/UnitTests.js").unitTest(
                        v => bootContext.logger.error("Test failed:", require("util").inspect(v, { maxArrayLength: null })),
                        { acknowledged }
                    ));
                    bootContext.logger.info(`Done.`);
                }

                {
                    bootContext.logger.info(`For "pb/dion"...`);
                    asyncTests = asyncTests.concat(require("-/pb/dion/UnitTests.js").unitTest(
                        v => bootContext.logger.error("Test failed:", require("util").inspect(v, { maxArrayLength: null }))
                    ));
                    bootContext.logger.info(`Done.`);
                }

                console.log("Awiting async tests...");
                await Promise.all(asyncTests);
                bootContext.logger.info(`Done.`);

                bootContext.logger.info(`Ready.`);
            }
            finally
            {
                global.PB_DEBUG = PB_DEBUG;// eslint-disable-line
            }
            return false;
        }
        else if (bootContext.options["performance-test"])
        {
            Context.configure(
            {
                version: null,
                config: null,
                logger: new Logger(),                   //  required by `Context.luid` and hence by `-/pb/natalis/UnitTests.unitTest_MulticastDelegate()`
                guid: require("crypto").randomUUID,     //  required by `Context.luid` and hence by `-/pb/natalis/UnitTests.unitTest_MulticastDelegate()`
                esc: () => { throw new Exception(0x0, `Not implemented.`); },
            });

            bootContext.logger.info(`Running performance tests...`);

            bootContext.logger.info(`For "pb/natalis"...`);
            require("-/pb/natalis/PerformanceTests.js").run();
            bootContext.logger.info(`Done.`);

            bootContext.logger.info(`Ready.`);
            return false;
        }
        else if (bootContext.options["profile"])
        {
            const fs = require("fs").promises;
            const fileName = `performance-profile-${bootContext.options["profile"]}.json`;
            let preloadedData, preloadedDataJson;
            try
            {
                preloadedDataJson = await fs.readFile(fileName, "utf8");
                preloadedData = JSON.parse(preloadedDataJson);
            }
            catch (ex)
            {
                bootContext.logger.warn(ex);
            }
            const feedback = new Feedback(
            {
                logger: bootContext.logger,
            });
            const outcome = await require("-/pb/natalis/PerformanceProfile.js").run(feedback, preloadedData, bootContext.options["profile"]);
            feedback.info(outcome);
            try
            {
                const resultDayaJson = JSON.stringify(outcome, 0, "\t");
                if (preloadedDataJson !== resultDayaJson) await fs.writeFile(fileName, resultDayaJson, "utf8");
            }
            catch (ex)
            {
                feedback.warn(ex);
            }
            feedback.info(`Ready.`);
            return false;
        }
        else if (bootContext.options.list)
        {
            throw new Exception(0xA2E3BE, `Not implemented. - command list`);

            const commandRegistry = new CommandRegistry();
            await commandRegistry.register(commandDirectory);

            commandRegistry.commandList.sort((l, r) => l.key > r.key);
            for (let length = commandRegistry.commandList.length, i = 0; i < length; ++i)
            {
                bootContext.logger.info(commandRegistry.commandList[i].key);
            }

            return false;
        }
        return true;
    }
    catch (ex)
    {
        console.error(ex);
    }
}

async function _boot_executeImmediateOptions_configurable(bootContext)
{
    switch (bootContext.options.build)
    {
        case "pb":
            const frameworkBuild = require("./app/framework-build.js");
            await frameworkBuild.build(bootContext);
            return false;
        case "zen":
            const applicationBuild = require("./app/application-build.js");
            await applicationBuild.build(bootContext);
            return false;
        default:
            if (bootContext.options["sources-collect"])
            {
                const sourcesCollect = require("./app/sources-collect.js");
                await sourcesCollect.build(bootContext);
                return false;
            }
            return true;
    }
}

function _boot_configureLogger(bootContext)
{
    const logLevels =
    [
        [Logger.Fatal, Logger.ConsoleError],
        [Logger.Error, Logger.ConsoleError],
        [Logger.Warning, Logger.ConsoleError],
        [Logger.Info, Logger.ConsoleLog],
        true,   //  time
        [Logger.Trace, Logger.ConsoleLog],
        [Logger.Dump, Logger.ConsoleLog],
    ];
    const printLevels =
    [
        [Logger.Fatal, Logger.ProcessStderr],
        [Logger.Error, Logger.ProcessStderr],
        [Logger.Warning, Logger.ProcessStderr],
        [Logger.Info, Logger.ProcessStdout],
        null,   //  time
        [Logger.Trace, Logger.ProcessStdout],
        [Logger.Dump, Logger.ProcessStdout],
    ];
    const routes = [];
    const printRoutes = [];
    let enableTime = false;
    for (let length = logLevels.length, i = 0; i < length; ++i) if (i < bootContext.options.verbosity) logLevels[i] === true ? enableTime = true : (routes.push(logLevels[i]), printRoutes.push(printLevels[i]));

    let decorate;
    if (bootContext.options.timestamp)
    {
        decorate = function decorate(logLevel, args)
        {
            const timestamp = `[${new Date().toISOString()}]`;
            args.unshift(timestamp);
            return args;
        };
    }

    bootContext.logger = new Logger(routes, printRoutes, enableTime, decorate);

    process.on("uncaughtException", error => bootContext.logger.error(110003, error));

    return true;
}

function _boot_loadAppConfiguration(bootContext)
{
    const path = require("path");

    const configLog =  bootContext.logger.trace.bind(bootContext.logger);

    {
        configLog(`[effective options]`);
        const output = {};
        Object.assign(output, bootContext.options);
        delete output._list;
        delete output._operands0;
        delete output._operands1;
        configLog(JSON.stringify(output, null, '  '));
    }

    let mainConfigurationPath;
    if(bootContext.options.config)
    {
        const stat = fs.lstatSync(bootContext.options.config);
        if(stat.isFile()) mainConfigurationPath = path.resolve(bootContext.options.config);
        else if(stat.isDirectory()) mainConfigurationPath = path.resolve(bootContext.options.config, "configuration.json");
        else throw new Exception(`Invalid main configuration path: "${bootContext.options.config}".`);
    }
    else mainConfigurationPath = path.resolve("configuration.json");

    configLog(`[main config] ${mainConfigurationPath}`);

    const snippets = [];
    if (bootContext.options.configSnippets)
    {
        const coll = bootContext.options.configSnippets;
        for (let length = coll.length, i = 0; i < length; ++i)
        {
            const item = coll[i];
            const snippetFilePath = path.resolve(item);
            configLog(`[extra config]: ${snippetFilePath}`);
            snippets.push({ json: require(snippetFilePath), name: snippetFilePath });
        }
    }

    bootContext.config = new Configuration(

        { json: require(mainConfigurationPath), name: "configuration.json" },
        snippets,
        bootContext.options.environment
    );

    {
        configLog("[effective config]");
        const output = {};
        Object.assign(output, bootContext.config.all);
        //	output.db.password = "<hidden>";
        configLog(JSON.stringify(output, null, '  '));
    }

    return true;
}

function _boot_configureContext(bootContext)
{
    Context.configure(
    {
        version: bootContext.versionInfo.version,
        config: bootContext.config,
        logger: bootContext.logger,
        guid: require("crypto").randomUUID,
        esc: value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
    });

    Context.heap.package = bootContext.package;
    
    return true;
}

async function _boot_initDatabase(bootContext) //  also see _exit
{
    const DbServer = require("mongodb").Server;
    const DbClient = require("mongodb").MongoClient;

    bootContext.logger.printTrace(`Connecting to mongodb... `);

    const {host, port, name} = bootContext.config.db;
    
    const server = new DbServer(host, port);
    const client = await DbClient.connect(server, {});

    Context.heap.db = client.db(name);
    Context.heap.dbClient = client;

    bootContext.logger.trace(`Done.`);

    return true;
}

async function _boot_executeCommand(bootContext)
{
    //  TODO: parse the `bootContext.args` with command-specific definitions
    throw new Exception(0x0, `Not implemented.`);
}

async function _boot_startRestServer(bootContext)
{
    const http = require("http");

    bootContext.logger.printTrace(`Starting REST server... `);
    const server = http.createServer(require("./app/rest-server.js").handler);
    await server.listen(bootContext.config.server.port, bootContext.config.server.hostname);
    bootContext.logger.trace(`Done.`);
    bootContext.logger.info(`Server listening at: http://${bootContext.config.server.hostname}:${bootContext.config.server.port}/ `);
}

boot();
