const path = require("path");

const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { NativeGraph } = require("-/pb/natalis/017/NativeGraph.js");
const { Feedback } = require("-/pb/natalis/012/Feedback.js");
const { SourcesCollector } = require("-/pb/dion/002/SourcesCollector.js");

module.exports = 
{
    async build(bootContext)
    {
        const packageJsonPath = bootContext.package.path;

        const { _moduleAliases } = require(packageJsonPath);

        bootContext.logger.info("[effective module aliases]");
        bootContext.logger.info(_moduleAliases);
        bootContext.logger.info("[current working directory]", path.resolve(""));

        const rules = NativeGraph.transcribe(bootContext.config.sources.collect);
        if (PB_DEBUG)
        {
            if (Diagnostics.format(rules) !== Diagnostics.format(bootContext.config.sources.collect)) throw new `Assertion failed.`;
        }
        
        for(let length = rules.length, i = 0; i < length; ++i)
        {
            const item = rules[i];
            for(const key in _moduleAliases)
            {
                const fullPath = path.resolve(_moduleAliases[key]);
                if(item.sourceDirectory.indexOf(key) === 0) item.sourceDirectory = item.sourceDirectory.replace(key, fullPath);
                if(item.targetDirectory.indexOf(key) === 0) item.targetDirectory = item.targetDirectory.replace(key, fullPath);
            }
        }

        const feedback = new Feedback(
        {
            logger: bootContext.logger,
        });

        bootContext.logger.info("Updating sources...");
        feedback.time("[time] Operation");

        await SourcesCollector.update(feedback, rules);
        
        feedback.timeEnd("[time] Operation");
        bootContext.logger.info("Ready.");
    }
};