//	R0Q3?/daniel/20210913
//	- DOC
//	- input params validations
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

const { Exception } = require("-/pb/natalis/003/Exception.js");
const Feedback = require("-/pb/natalis/012/Feedback.js");
const TryObsolete = require("-/pb/natalis/080/TryObsolete.js");

const FileSystem = require("-/pb/dion/001/FileSystem.js");

const fs = require("fs/promises");
const path = require("path");

module.exports =

//	Class: 
class SourcesCollector
{
	//	Exception: `"Argument is invalid"`.
	static async update(feedback, par)
	{
		if(PB_DEBUG)
		{
			if(!(feedback instanceof Feedback)) throw new Exception(0x4C21E8, `Argument is invalid: "feedback".`);
			TryObsolete.argument(0x72CFAD, "par", par,
			{
				array:
				[
					{
						sourceDirectory: "",
						targetDirectory: "",
						recursive: true,
					}
				],
			}); 
		}

		await _reset();
		await _build();

		async function _reset()
		{
			const promises = [];
			for(let length = par.length, i = 0; i < length; ++i)
			{
				const { targetDirectory } = par[i];
				feedback.info(`Cleaning up "${path.resolve(targetDirectory)}"...`);
				try
				{
					const outcome = await fs.readdir(targetDirectory);
					for(let jlength = outcome.length, j = 0; j < jlength; ++j)
					{
						const jitem = outcome[j];
						const fullPath = path.resolve(targetDirectory, jitem);
						feedback.debug(`Deleting "${fullPath}"...`);
						promises.push(fs.rm(fullPath, { recursive: true, force: true }));
					}
					feedback.info("Done.");
				}
				catch(ex)
				{
					if (ex.code === "ENOENT") feedback.info(ex, "Skiped.");
					else feedback.error(ex);
				}
			}
			await Promise.all(promises);
		}

		async function _build()
		{
			feedback.info("Enumerating sources...");
			const cache = {};
			await Promise.all(par.map(v => _listDirectory(cache, path.resolve(v.sourceDirectory), v.recursive)));
			feedback.info("Done.");

			const batches = [];
			for(let length = par.length, i = 0; i < length; ++i)
			{
				const item = par[i];
				const batchKey = `${item.sourceDirectory}|${item.targetDirectory}`;
				const batch = batches.find(v => v.key === batchKey);
				if(!batch)
				{
					batches.push(
					{
						key: batchKey,
						recursive: item.recursive,
						source: item.sourceDirectory,
						target: item.targetDirectory,
						files: cache[path.resolve(item.sourceDirectory)],
					});
					continue;
				}
				if(!batch.recursive && item.recursive) batch.recursive = true;
			}
		
			feedback.info("Executing tasks...");
			let fileCount = 0;
			for(let length = batches.length, i = 0; i < length; ++i) fileCount += batches[i].files.length;

			feedback.begin("actions", 0, fileCount);
			const promises = [];
			for(let length = batches.length, i = 0; i < length; ++i)
			{
				const batch = batches[i];
				promises.push(_copy(feedback, batch.files, batch.source, batch.target));
			}
			await Promise.all(promises);
			feedback.end("actions");
			feedback.info("Done.");
		}
	}
}

async function _listDirectory(cache, directory, recursive)
{
	const cacheItem = cache[directory];
	if(cacheItem) return cacheItem;
	const result = cache[directory] = [];
	return await FileSystem.listFiles(directory, recursive, result);
}

async function _copy(feedback, files, source, destination)
{
	const promises = [];
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		const fullPath = path.resolve(source, file);
		const destinationPath = path.resolve(destination, file);
		feedback.step("actions");
		feedback.progressTrace("actions", `Copying "${fullPath}" => "${destinationPath}"...`);
		promises.push(_copyOne(feedback, fullPath, destinationPath));
	}
	return Promise.all(promises);
}

async function _copyOne(feedback, source, destination)
{
	await fs.mkdir(path.dirname(destination), { recursive: true }).catch(ex => feedback.error(ex));
	return fs.copyFile(source, destination).catch(ex => feedback.error(ex));
}

module.exports.SourcesCollector = module.exports;
