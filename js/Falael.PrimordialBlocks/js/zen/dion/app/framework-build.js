const path = require("path");

const Feedback = require("-/pb/natalis/012/Feedback.js");
const ApplicationBuilder = require("-/pb/dion/002/ApplicationBuilder.js");

module.exports = 
{
    async build(bootContext)
    {
        const packageJsonPath = bootContext.package.path;

        const { _moduleAliases } = require(packageJsonPath);

        bootContext.logger.trace("[effective module aliases]");
        bootContext.logger.trace(_moduleAliases);
        bootContext.logger.trace("[current working directory]", path.resolve(""));

        const strip = v => v.replace(/(require\s*\(.*)(\d\d\d+\/)([^)]*\))/g, "$1$3")

        const par =
        {
            outputDirectory: bootContext.config.build.output,
            rules:
            [
                //  contextless
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_AppendJavaScript,
                    directory: _moduleAliases["-/pb/xenesio"],
                    recursive: true,
                    prefixFiles: ["Boot.js"],
                    baseUrl: "-/pb/xenesio",
                },
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextless,
                    baseUrl: "-/pb/natalis",
                },
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextless,
                    baseUrl: "-/pb/xenesio",
                },
                //  context
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/zen/xenesio"],
                    recursive: true,
                    postfixFiles: [ "ConfigureContext.FrameworkBuild.js" ],
                    baseUrl: "-/zen/natalis",
                },
                //  contextful
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextful,
                    postfixFiles: bootContext.config.build.tests ? [ "PerformanceTests.js" ] : null,
                    baseUrl: "-/pb/natalis",
                },
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: bootContext.config.build.tests ? path => path.match(/^UnitTests\/.*\.js$/g) : path => false,
                    postfixFiles: bootContext.config.build.tests ? ["UnitTests.js"] : null,
                    baseUrl: "-/pb/natalis",
                },
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextful,
                    postfixFiles: bootContext.config.build.tests ? [ "UnitTests.js" ] : null,
                    baseUrl: "-/pb/xenesio",
                },
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/zen/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect,
                    baseUrl: "-/zen/natalis",
                },
                {
                    target: "pb/xenesio.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/zen/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect,
                    baseUrl: "-/zen/xenesio",
                },
                {
                    target: "pb/natalis/",
                    action: ApplicationBuilder.Action_Copy_Strip,
                    process: strip,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.NodeJSFileSelect,
                },
                {
                    target: "pb/dion/",
                    action: ApplicationBuilder.Action_Copy_Strip,
                    process: strip,
                    directory: _moduleAliases["-/pb/dion"],
                    recursive: true,
                    select: ApplicationBuilder.NodeJSFileSelect,
                },
            ],
        };
        const feedback = new Feedback(
        {
            logger: bootContext.logger,
        });

        feedback.info("Building the Primordial Blocks framework...");
        feedback.time("[time] Operation");

        await ApplicationBuilder.build(feedback, par);
        
        feedback.timeEnd("[time] Operation");
        feedback.info("Ready.");
    }
};