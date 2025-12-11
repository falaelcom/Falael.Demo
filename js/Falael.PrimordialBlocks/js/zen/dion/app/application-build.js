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

        const par =
        {
            outputDirectory: bootContext.config.build.output,
            rules:
            [
                //  contextless
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_AppendJavaScript,
                    directory: _moduleAliases["-/pb/xenesio"],
                    recursive: true,
                    prefixFiles: ["Boot.js"],
                    baseUrl: "-/pb/xenesio",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextless,
                    baseUrl: "-/pb/natalis",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextless,
                    baseUrl: "-/pb/xenesio",
                },
                //  context
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/zen/xenesio"],
                    recursive: true,
                    postfixFiles: [ "ConfigureContext.js" ],
                    baseUrl: "-/zen/natalis",
                },
                //  contextful
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextful,
                    postfixFiles: bootContext.config.build.tests ? [ "PerformanceTests.js" ] : null,
                    baseUrl: "-/pb/natalis",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: bootContext.config.build.tests ? path => path.match(/^UnitTests\/.*\.js$/g) : path => false,
                    postfixFiles: bootContext.config.build.tests ? ["UnitTests.js"] : null,
                    baseUrl: "-/pb/natalis",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/pb/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect_Contextful,
                    postfixFiles: bootContext.config.build.tests ? [ "UnitTests.js" ] : null,
                    baseUrl: "-/pb/xenesio",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineResource,
                    directory: _moduleAliases["-/zen/natalis"],
                    recursive: true,
                    prefixFiles: ["bogus.xhtml"],
                    baseUrl: "-/zen/natalis",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/zen/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect,
                    baseUrl: "-/zen/natalis",
                },
                {
                    target: "zen/xenesio/o.js",
                    action: ApplicationBuilder.Action_CombineJavaScript,
                    directory: _moduleAliases["-/zen/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.FrameworkJavaScriptFileSelect,
                    baseUrl: "-/zen/xenesio",
                },
                {
                    target: "zen/xenesio/",
                    action: ApplicationBuilder.Action_Copy,
                    directory: _moduleAliases["-/zen/xenesio"],
                    recursive: true,
                    select: ApplicationBuilder.WebFileSelect,
                    excludedFiles: ["index.xhtml", "ConfigureContext.js"],
                },
                {
                    target: "zen/xenesio/",
                    action: ApplicationBuilder.Action_Copy_RegexReplaceInContent,
                    directory: _moduleAliases["-/zen/xenesio"],
                    prefixFiles: ["index.xhtml"],
                    data:
                    {
                        '(name="global::PB_DEBUG" content=")(.*)(")': "$1false$3",
                        '(<meta name="boot::ROUTE" rel="-/pb/natalis" content=")(.*)(") />': "",
                        '(<meta name="boot::ROUTE" rel="-/pb/xenesio" content=")(.*)(") />': "",
                        '(<meta name="boot::ROUTE" rel="-/zen/natalis" content=")(.*)(") />': "",
                        '(<meta name="boot::ROUTE" rel="-/zen/xenesio" content=")(.*)(") />': "",
                        '(src=")(.*Boot.js)(")': "$1o.js$3",
						'(<script type="text/javascript" src=")(.*ConfigureContext.js)(")></script>': "",
                    },
                },
                {
                    target: "pb/natalis/",
                    action: ApplicationBuilder.Action_Copy,
                    directory: _moduleAliases["-/pb/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.NodeJSFileSelect,
                },
                {
                    target: "zen/natalis/",
                    action: ApplicationBuilder.Action_Copy,
                    directory: _moduleAliases["-/zen/natalis"],
                    recursive: true,
                    select: ApplicationBuilder.NodeJSFileSelect,
                },
                {
                    target: "pb/dion/",
                    action: ApplicationBuilder.Action_Copy,
                    directory: _moduleAliases["-/pb/dion"],
                    recursive: true,
                    select: ApplicationBuilder.NodeJSFileSelect,
                },
                {
                    target: "zen/dion/",
                    action: ApplicationBuilder.Action_Copy,
                    recursive: true,
                    directory: _moduleAliases["-/zen/dion"],
                    select: ApplicationBuilder.NodeJSFileSelect,
                },
                {
                    action: ApplicationBuilder.Action_Copy_RegexReplaceInContent,
                    prefixFiles: [packageJsonPath],
                    data:
                    {
                        '("version":\\s*")(.*)(")': "$1" + bootContext.versionInfo.version + "-" + require("crypto").randomBytes(4).toString("hex") + "$3",
                    },
                },
            ],
        };
        const feedback = new Feedback(
        {
            logger: bootContext.logger,
            //  TODO:
            //      - use progress calls to print progress percentage via logger to acheive percentage overwriting (the next logging call will add text after the current percentage and move to a new line, which is ok)
        });

        feedback.info("Building the application...");
        feedback.time("[time] Operation");

        await ApplicationBuilder.build(feedback, par);
        
        feedback.timeEnd("[time] Operation");
        feedback.info("Ready.");
    }
};