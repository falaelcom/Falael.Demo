//	R0Q3?/daniel/20210913
//	- TEST, DOC
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");

const fs = require("fs/promises");
const path = require("path");

module.exports =

//	Class: 
class FileSystem
{
	static async listFiles(directory, recursive = false, result = null)
	{
		if(PB_DEBUG)
		{
			if (!Type.isString(directory)) throw new ArgumentException(0xC7A9AC, "directory", directory);
			if (!Type.isBoolean(recursive)) throw new ArgumentException(0xAE580A, "recursive", recursive);
			if (!Type.isNU(result) && !Type.isArray(result)) throw new ArgumentException(0xC9E851, "result", result);
		}		

		result = result || [];
		if(recursive)
		{
			for await(const item of FileSystem.walkFiles(directory)) result.push(item);
			return result;
		}
		const outcome = await fs.readdir(directory, {withFileTypes: true});
		for(let length = outcome.length, i = 0; i < length; ++i)
		{
			const item = outcome[i];
			if(!item.isFile()) continue;
			result.push(item.name);
		}
		return result;
	}
	
	static async *walkFiles(root, prefix = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(root)) throw new Exception(0x5BB3B5, `Argument is invalid: "root".`);
			if (!Type.isNU(prefix) && !Type.isString(prefix)) throw new Exception(0xC1C195, `Argument is invalid: "prefix".`);
		}

		const entries = await fs.readdir(root, { withFileTypes: true });
		for (const entry of entries)
		{
			if (entry.isDirectory()) yield* await FileSystem.walkFiles(path.resolve(root, entry.name), prefix ? path.join(prefix, entry.name) : entry.name);
			else yield prefix ? path.join(prefix, entry.name) : entry.name;
		}
	}

	static async listFilePaths(directory, recursive = false, result = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(directory)) throw new Exception(0xC7A9AC, `Argument is invalid: "directory".`);
			if (!Type.isBoolean(recursive)) throw new Exception(0xAE580A, `Argument is invalid: "recursive".`);
			if (!Type.isNU(result) && !Type.isArray(result)) throw new Exception(0xC9E851, `Argument is invalid: "result".`);
		}

		result = result || [];
		if (recursive)
		{
			for await (const item of FileSystem.walkFilePaths(directory)) result.push(item);
			return result;
		}
		const outcome = await fs.readdir(directory, { withFileTypes: true });
		for (let length = outcome.length, i = 0; i < length; ++i)
		{
			const item = outcome[i];
			if (!item.isFile()) continue;
			result.push(path.join(directory, item.name));
		}
		return result;
	}

	static async *walkFilePaths(root, prefix = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(root)) throw new Exception(0x5BB3B5, `Argument is invalid: "root".`);
			if (!Type.isNU(prefix) && !Type.isString(prefix)) throw new Exception(0xC1C195, `Argument is invalid: "prefix".`);
		}

		const entries = await fs.readdir(root, { withFileTypes: true });
		for (const entry of entries)
		{
			if (entry.isDirectory()) yield* await FileSystem.walkFilePaths(path.resolve(root, entry.name), prefix ? path.join(prefix, entry.name) : entry.name);
			else yield prefix ? path.join(root, prefix, entry.name) : path.join(root, entry.name);
		}
	}

	static async listFileEntries(directory, recursive = false, result = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(directory)) throw new Exception(0xC17D4B, `Argument is invalid: "directory".`);
			if (!Type.isBoolean(recursive)) throw new Exception(0x8CD4C8, `Argument is invalid: "recursive".`);
			if (!Type.isNU(result) && !Type.isArray(result)) throw new Exception(0xBF2645, `Argument is invalid: "result".`);
		}

		result = result || [];
		if (recursive)
		{
			for await (const item of FileSystem.walkFileEntries(directory)) result.push(item);
			return result;
		}
		const outcome = await fs.readdir(directory, { withFileTypes: true });
		for (let length = outcome.length, i = 0; i < length; ++i)
		{
			const item = outcome[i];
			if (!item.isFile()) continue;
			const stat = await fs.stat(path.resolve(directory, item.name));
			result.push({ name: item.name, path: path.join(directory, item.name), entry: item, stat });
		}
		return result;
	}

	static async *walkFileEntries(root, prefix = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(root)) throw new Exception(0xADE059, `Argument is invalid: "root".`);
			if (!Type.isNU(prefix) && !Type.isString(prefix)) throw new Exception(0x9E8EB6, `Argument is invalid: "prefix".`);
		}

		const entries = await fs.readdir(root, { withFileTypes: true });
		for (const entry of entries)
		{
			if (entry.isDirectory()) yield* await FileSystem.walkFileEntries(path.resolve(root, entry.name), prefix ? path.join(prefix, entry.name) : entry.name);
			else
			{
				const stat = await fs.stat(path.resolve(root, entry.name));
				yield { name: prefix ? path.join(prefix, entry.name) : entry.name, path: path.join(root, entry.name), entry, stat };
			}
		}
	}
}

module.exports.FileSystem = module.exports;
