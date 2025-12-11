//	R0Q3?/daniel/20210824
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
class ApplicationBuilder
{
	static FrameworkJavaScriptFileSelect_Contextless = p => { const outcome = p.match(/(\d\d\d+)[/\\].+\.js$/); return outcome && parseInt(outcome) <= 10 };	//	`".../<001-010>/FileName.js"`
	static FrameworkJavaScriptFileSelect_Contextful = p => { const outcome = p.match(/(\d\d\d+)[/\\].+\.js$/); return outcome && parseInt(outcome) > 10 };		//	`".../<011-...>/FileName.js"`
	static FrameworkJavaScriptFileSelect = path => path.match(/\d\d\d+[/\\].+\.js$/g);
	static WebFileSelect = path => path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".jpg") || path.endsWith(".png") || path.endsWith(".ttf") || path.endsWith(".ico") || path.endsWith(".xhtml");
	static NodeJSFileSelect = path => path.endsWith(".js") || path.endsWith(".json") || path.endsWith(".xhtml");

	static Action_Copy = Symbol("Action_Copy");
	static Action_Copy_Strip = Symbol("Action_Copy_Strip");	//	strips pb numbering from paths
	static Action_Copy_RegexReplaceInContent = Symbol("Action_Copy_RegexReplaceInContent");
	static Action_Merge = Symbol("Action_Merge");
	static Action_AppendJavaScript = Symbol("Action_AppendJavaScript");
	static Action_CombineJavaScript = Symbol("Action_CombineJavaScript");
	static Action_CombineResource = Symbol("Action_CombineResource");

	//	Parameter: `feedback: Feedback` - `alert` return code signals are ignored.
	//	Parameter: `par:
	//	{
	//		rules:
	//		[{
	//			directory: string, 
	//			recursive: boolean,		//	optional, defaults to false
	//			select: function(path: string): boolean, //	optional; i.g. path => /^\d+\..+\.js$/g.match(path) - will match "000.Type.js" but not "Boot.js"
	//			prefixFiles: [string],	//	optional
	//			postfixFiles: [string], //	optional
	//			includedFiles: [string], //	optional
	//			excludedFiles: [string], //	optional
	//			target: string,
	//			action: ApplicationBuilder.Action_*,
	//			baseUrl: string, //	optional
	//			process: function(path: string, text: string): text,	//	optional; i.g. `(path, text) => text` (identity op)
	//		}],
	//		outputDirectory: string,
	//	}`
	//	Exception: `"Argument is invalid"`.
	static async build(feedback, par)
	{
		if(PB_DEBUG)
		{
			if(!(feedback instanceof Feedback)) throw new Exception(0xE1222F, `Argument is invalid: "feedback".`);
			TryObsolete.argument(0xD7C4D4, "par", par,
			{
				object: 
				{
					outputDirectory: "",
					rules:
					{
						array:
						[
							{
								directory: { string: 1, also: [void 0, null] },
								recursive: { boolean: 1, also: [void 0, null] },
								select: { match: "functionNU" },
								prefixFiles: { array: [""], also: [void 0, null] },
								postfixFiles: { array: [""], also: [void 0, null] },
								excludedFiles: { array: [""], also: [void 0, null] },
								action: { match: "symbol" },
								target: { string: 1, also: [void 0, null] },
								baseUrl: { string: 1, also: [void 0, null] },
								data: { objex: 1, also: [void 0, null] },
								process: { match: "functionNU" },
							},
						],
					},
				},
			}); 
		}

		const { outputDirectory, rules } = par;
		
		await _reset();
		await _generate();

		async function _reset()
		{
			feedback.info(`Cleaning up "${outputDirectory}"...`);
			try
			{
				const outcome = await fs.readdir(outputDirectory);
				const promises = [];
				for(let length = outcome.length, i = 0; i < length; ++i)
				{
					const item = outcome[i];
					const fullPath = path.resolve(outputDirectory, item);
					feedback.debug(`Deleting "${fullPath}"...`);
					promises.push(fs.rm(fullPath, { recursive: true, force: true }));
				}
				await Promise.all(promises);
			}
			catch(ex)
			{
				if(ex.code === "ENOENT") feedback.info(ex, "Skipped.");
				else feedback.error(ex);
			}
			feedback.info("Done.");
		}

		async function _generate()
		{
			feedback.info("Enumerating sources...");
			const cache = {};
			const outcome = await Promise.all(rules.map(v => _listDirectory(cache, path.resolve(v.directory || ""), v.recursive)));
			feedback.info("Done.");

			const batches = [];
			for(const task of enumerateTasks(rules, outcome))
			{
				const batchKey = `${task.action.description}|${task.target}${task.process ? "*process" : ""}`;
				let batch = batches.find(v => v.key === batchKey);
				if(!batch)
				{
					batch =
					{
						key: batchKey,
						action: task.action,
						process: task.process,
						target: path.resolve(outputDirectory, task.target || ""),
						data: task.data,
						files: []
					};
					batches.push(batch);
				}
				batch.files.push({ task, fullPath: task.source, rootPath: task.sourceRoot, relativePath: path.isAbsolute(task.sourcePath) ? path.basename(task.sourcePath) : task.sourcePath, url: task.url, content: null });
			}
		
			feedback.info("Executing tasks...");
			let fsActionFileCount = 0;
			let contentActionFileCount = 0;
			for(let length = batches.length, i = 0; i < length; ++i)
			{
				const batch = batches[i];
				fsActionFileCount += batch.files.length; 
				switch(batch.action)
				{
					case ApplicationBuilder.Action_Copy:
					case ApplicationBuilder.Action_Copy_Strip:
						if (batch.process) contentActionFileCount += batch.files.length;
						break;
					case ApplicationBuilder.Action_Merge:
					case ApplicationBuilder.Action_Copy_RegexReplaceInContent:
					case ApplicationBuilder.Action_AppendJavaScript:
					case ApplicationBuilder.Action_CombineJavaScript:
					case ApplicationBuilder.Action_CombineResource:
						contentActionFileCount += batch.files.length;
						break;
					default: throw new Exception(0x7EE42A, `Not implemented.`);
				}
			}
			feedback.begin("actions", 0, fsActionFileCount);
			const promises = [];
			for(let length = batches.length, i = 0; i < length; ++i)
			{
				const batch = batches[i];
				switch(batch.action)
				{
					case ApplicationBuilder.Action_Copy:
						if (batch.process) promises.push(_read(feedback, batch.files));
						else promises.push(_copy(feedback, batch.files, batch.target, false));
						break;
					case ApplicationBuilder.Action_Copy_Strip:
						if (batch.process) promises.push(_read(feedback, batch.files));
						promises.push(_copy(feedback, batch.files, batch.target, true));
						break;
					case ApplicationBuilder.Action_Merge:
					case ApplicationBuilder.Action_Copy_RegexReplaceInContent:
					case ApplicationBuilder.Action_AppendJavaScript:
					case ApplicationBuilder.Action_CombineJavaScript:
					case ApplicationBuilder.Action_CombineResource:
						promises.push(_read(feedback, batch.files));
						break;
					default: throw new Exception(0xD081B4, `Not implemented.`);
				}
			}
			await Promise.all(promises);
			feedback.end("actions");
			feedback.info("Done.");

			feedback.info("Translating files...");
			feedback.begin("content", 0, contentActionFileCount);
			for(let length = batches.length, i = 0; i < length; ++i)
			{
				const batch = batches[i];
				switch(batch.action)
				{
					case ApplicationBuilder.Action_Copy: batch.process && await _translate(feedback, batch.files, batch.target, false, batch.process); break;
					case ApplicationBuilder.Action_Copy_Strip: batch.process && await _translate(feedback, batch.files, batch.target, true, batch.process); break;
					case ApplicationBuilder.Action_Merge: await _merge(feedback, batch.files, batch.target, batch.data || {}); break;
					case ApplicationBuilder.Action_Copy_RegexReplaceInContent: await _replace(feedback, batch.files, batch.target, batch.data || {}); break;
					case ApplicationBuilder.Action_AppendJavaScript: await _appendJs(feedback, batch.files, batch.target, false); break;
					case ApplicationBuilder.Action_CombineJavaScript: await _appendJs(feedback, batch.files, batch.target, true); break;
					case ApplicationBuilder.Action_CombineResource: await _appendResource(feedback, batch.files, batch.target); break;
					default: throw new Exception(0x28721A, `Not implemented.`);
				}
			}
			feedback.end("content");
			feedback.info("Done.");
		}
	}
}

async function _listDirectory(cache, directory, recursive)
{
	const cacheItem = cache[directory];
	if(cacheItem) return cacheItem;
	const result = cache[directory] = [];
	await FileSystem.listFiles(directory, recursive, result);
	for (let length = result.length, i = 0; i < length; ++i) result[i] = result[i].replace(/\\/, "/");
	return result;

}

function* enumerateTasks(rules, lists)
{
	for(let length = rules.length, i = 0; i < length; ++i)
	{
		const rule = rules[i];
		const excludedFiles = rule.excludedFiles ? rule.excludedFiles.map(v => path.resolve(rule.directory, v)) : null;
		const directoryListing = lists[i];
		if(rule.prefixFiles) for(let jlength = rule.prefixFiles.length, j = 0; j < jlength; ++j)
		{
			const item = rule.prefixFiles[j];
			const fullPath = path.resolve(rule.directory || "", item);
			if(excludedFiles && excludedFiles.indexOf(fullPath) !== -1) continue;
			yield {
				rule,
				sourceRoot: rule.directory,
				sourcePath: item,
				source: fullPath,
				target: rule.target,
				action: rule.action,
				process: rule.process,
				url: rule.baseUrl ? path.posix.join(rule.baseUrl, item) : null,
				data: rule.data,
			};
		};
		if(rule.select) for(let coll = directoryListing.filter(v => rule.select(v)).sort(), jlength = coll.length, j = 0; j < jlength; ++j)
		{
			const item = coll[j];
			const fullPath = path.resolve(rule.directory, item);
			if(excludedFiles && excludedFiles.indexOf(fullPath) !== -1) continue;
			yield {
				rule,
				sourceRoot: rule.directory,
				sourcePath: item,
				source: fullPath,
				target: rule.target,
				action: rule.action,
				process: rule.process,
				url: rule.baseUrl ? path.posix.join(rule.baseUrl, item) : null,
				data: rule.data,
			};
		};
		if(rule.postfixFiles) for(let jlength = rule.postfixFiles.length, j = 0; j < jlength; ++j)
		{
			const item = rule.postfixFiles[j];
			const fullPath = path.resolve(rule.directory, item);
			if(excludedFiles && excludedFiles.indexOf(fullPath) !== -1) continue;
			yield {
				rule,
				sourceRoot: rule.directory,
				sourcePath: item,
				source: fullPath,
				target: rule.target,
				action: rule.action,
				process: rule.process,
				url: rule.baseUrl ? path.posix.join(rule.baseUrl, item) : null,
				data: rule.data,
			};
		};
	}
}

async function _copy(feedback, files, destination, strip = false)
{
	const promises = [];
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		const destinationPath = strip ? path.resolve(destination, file.relativePath).replace(/\d\d\d+[\\/]/, "") : path.resolve(destination, file.relativePath);
		feedback.step("actions");
		feedback.debug(file.task);
		feedback.progressTrace("actions", `Copying "${file.fullPath}" => "${destinationPath}"...`);
		promises.push(_copyOne(feedback, file.fullPath, destinationPath));
	}
	return Promise.all(promises);
}

async function _translate(feedback, files, destination, strip = false, process = null)
{
	for (let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		const destinationFullPath = strip ? path.resolve(destination, file.relativePath).replace(/\d\d\d+[\\/]/, "") : path.resolve(destination, file.relativePath);
		feedback.step("content");
		feedback.debug(file.task);
		feedback.progressTrace("content", `Translate "${file.fullPath}" => "${destinationFullPath}"...`);
		let content = process(file.content.toString("utf8"));
		await fs.mkdir(path.dirname(destinationFullPath), { recursive: true }).catch(ex => feedback.error(ex));
		await fs.writeFile(destinationFullPath, content);
	}
}

async function _copyOne(feedback, source, destination)
{
	await fs.mkdir(path.dirname(destination), { recursive: true }).catch(ex => feedback.error(ex));
	return fs.copyFile(source, destination).catch(ex => feedback.error(ex));
}

async function _read(feedback, files)
{
	const promises = [];
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		feedback.step("actions");
		feedback.debug(file.task);
		feedback.progressTrace("actions", `Reading "${file.fullPath}"...`);
		promises.push((async(path) => file.content = await fs.readFile(path))(file.fullPath));
	}	
	return Promise.all(promises);
}

async function _appendJs(feedback, files, destination, wrapForRequire)
{
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		feedback.step("content");
		feedback.debug(file.task);
		feedback.progressTrace("content", `Appending to "${destination}": "${file.fullPath}"...`);
		await fs.mkdir(path.dirname(destination), { recursive: true }).catch(ex => feedback.error(ex));
		if(!wrapForRequire)
		{
			await fs.appendFile(destination, file.content + "\n");
			return;
		}
		const alias = normalizeFileName(file.url);
		const code = `
{(global.require.__cache || (global.require.__cache = {}))[${JSON.stringify(file.url)}] = global.require.__cache[${JSON.stringify(alias)}] = (function(){
const module = {exports:{}}, exports = module.exports;
${file.content}
return module.exports;
})()};
`;
		await fs.appendFile(destination, code);
	}
}

async function _appendResource(feedback, files, destination)
{
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		feedback.step("content");
		feedback.debug(file.task);
		feedback.progressTrace("content", `Appending to "${destination}": "${file.relativePath}"...`);
		const backQuote = '`';
		const alias = normalizeFileName(file.url);
		const code = `
{(global.require.__cache || (global.require.__cache = {}))[${JSON.stringify(file.url)}] = global.require.__cache[${JSON.stringify(alias)}] = ${backQuote}${file.content.toString("utf8").replace(/`/gi, "\\`").replace(/\$/gi, "\\$")}${backQuote}};
`;
		await fs.mkdir(path.dirname(destination), { recursive: true }).catch(ex => feedback.error(ex));
		await fs.appendFile(destination, code);
	}
}

async function _merge(feedback, files, destination, data)
{
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		const destinationFullPath = path.resolve(destination, file.relativePath);
		feedback.step("content");
		feedback.debug(file.task);
		feedback.progressTrace("content", `Merging "${file.fullPath}" into "${destinationFullPath}"...`);
		const templateProcessor = generateTemplateProcessor(Object.keys(data), file.content.toString("utf8"));
		const code = templateProcessor(...Object.values(data));
		await fs.mkdir(path.dirname(destinationFullPath), { recursive: true }).catch(ex => feedback.error(ex));
		await fs.writeFile(destinationFullPath, code);
	}
	
	function generateTemplateProcessor(mergeFields, template)
	{
		return new Function(...mergeFields, "return `" + template.replace(/`/gi, "\\`") + "`");
	}
}

async function _replace(feedback, files, destination, data)
{
	for(let length = files.length, i = 0; i < length; ++i)
	{
		const file = files[i];
		const destinationFullPath = path.resolve(destination, file.relativePath);
		feedback.step("content");
		feedback.debug(file.task);
		feedback.progressTrace("content", `Regex find-and-replace in "${file.fullPath}" => "${destinationFullPath}"...`);
		let content = file.content.toString("utf8");
		for(const key in data) content = content.replace(new RegExp(key), String(data[key]));
		await fs.mkdir(path.dirname(destinationFullPath), { recursive: true }).catch(ex => feedback.error(ex));
		await fs.writeFile(destinationFullPath, content);
	}
}

function normalizeFileName(filePath)
{
	if (!/\d\d\d+\//.test(filePath)) return null;
	return filePath.replace(/\d\d\d+\//, "");
}

module.exports.ApplicationBuilder = module.exports;
