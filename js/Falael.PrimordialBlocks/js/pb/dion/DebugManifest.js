//	R0Q3?/daniel/20220323
//  - TODO: `DebugManifest.build()` - can reduce the length of the resulting json by calculating the common part of all version numbers and extracting into a separate common manifest field.
//  - TODO: `DebugManifest.build()` - can reduce the length of the resulting json by grouping files and nesting groups by subdirectory
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

const fs = require("fs/promises");
const fss = require("fs");
const path = require("path");

module.exports =

//	Class: 
class DebugManifest
{
    static async build(directories, moduleAliases)
    {
        const manifestDirectories = normalizeConfigDebugManifestDirectories(directories, moduleAliases);
        const entries = [];
        for (let length = manifestDirectories.length, i = 0; i < length; ++i)
        {
            const item = manifestDirectories[i];
            try
            {
                await listFileEntries(item.directory, item.recursive, entries);
            }
            catch (ex)
            {
                console.warn(`Error reading ${JSON.stringify(item.directory)}`, ex);
            }
        }
        const result = { v: 1, f: {} };
        for (let length = entries.length, i = 0; i < length; ++i)
        {
            const item = entries[i];
            const rpath = denormalizeFilePath(item.path, moduleAliases);
            if (result.f[rpath]) throw new Error(`Invalid operation.`);
            const parts = String(item.stat.mtimeMs).split('.');
            switch (parts.length)
            {
                case 1: result.f[rpath] = parseInt(parts[0].padStart(13, '0') + "0000"); break;
                case 2: result.f[rpath] = parseInt(parts[0].padStart(13, '0') + '' + parts[1].padStart(4, '0')); break;
                default: throw new Error(`Invalid operation.`);
            }
        }
        return result;
    }

    static installRequire(directories, moduleAliases)
    {
        const manifestDirectories = normalizeConfigDebugManifestDirectories(directories, moduleAliases);
        const files = [];
        for (let length = manifestDirectories.length, i = 0; i < length; ++i)
        {
            const item = manifestDirectories[i];
            listFilePathsSync(item.directory, item.recursive, files);
        }
        const paths = {};
        for (let length = files.length, i = 0; i < length; ++i)
        {
            const item = files[i];
            const rpath = denormalizeFilePath(item, moduleAliases);
            if (paths[rpath]) { throw new Error(`Invalid operation. Related value: ${item}`); }
            paths[rpath] = true;
        }
        let hasAlias = false;
        const aliases = {};
        for (const key in paths)
        {
            const alias = normalizeFileName(key);
            if (alias === null) continue;
            if (aliases[alias]) throw new Error(`Invalid operation: duplicate alias name; related values: "${alias}" ("${key}").`);
            aliases[alias] = key;
            hasAlias = true;
        }
        if (!hasAlias) return;

        const Module = require("module");
        const require_original = Module.prototype.require;
        Module.prototype.require = function (path)
        {
            const alias = aliases[path];
            if (alias) return require_original.call(this, alias);
            return require_original.call(this, path);
        };
    }
}

function normalizeConfigDebugManifestDirectories(directoryList, moduleAliases)
{
    const result = [];
    for (let length = directoryList.length, i = 0; i < length; ++i)
    {
        const item = directoryList[i];
        const ritem = { directory: item.directory, recursive: item.recursive };
        for (const key in moduleAliases)
        {
            if (ritem.directory.indexOf(key) !== 0) continue;
            ritem.directory = ritem.directory.replace(key, moduleAliases[key]);
            break;
        }
        ritem.directory = path.resolve(ritem.directory);
        result.push(ritem);
    }
    return result;
}

function denormalizeFilePath(filePath, moduleAliases)
{
    let result = path.resolve(filePath);
    for (const key in moduleAliases)
    {
        const aliasFullPath = path.resolve(moduleAliases[key]);
        if (result.indexOf(aliasFullPath) !== 0) continue;
        result = result.replace(aliasFullPath, key).replace(/\\/g, '/');
        break;
    }
    return result;
}

function normalizeFileName(filePath)
{
    if (!/\d\d\d+\//.test(filePath)) return null;
    return filePath.replace(/\d\d\d+\//, "");
}

function listFilePathsSync(directory, recursive = false, result = null)
{
    result = result || [];
    if (recursive)
    {
        for (const item of walkFilePathsSync(directory)) result.push(item);
        return result;
    }
    const outcome = fss.readdirSync(directory, { withFileTypes: true });
    for (let length = outcome.length, i = 0; i < length; ++i)
    {
        const item = outcome[i];
        if (!item.isFile()) continue;
        result.push(path.join(directory, item.name));
    }
    return result;
}

function* walkFilePathsSync(root)
{
    const entries = fss.readdirSync(root, { withFileTypes: true });
    for (const entry of entries)
    {
        if (entry.isDirectory()) yield * walkFilePathsSync(path.resolve(root, entry.name));
        else yield path.join(root, entry.name);
    }
}

async function listFileEntries(directory, recursive = false, result = null)
{
    result = result || [];
    if (recursive)
    {
        for await (const item of walkFileEntries(directory)) result.push(item);
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

async function* walkFileEntries(root)
{
    const entries = await fs.readdir(root, { withFileTypes: true });
    for (const entry of entries)
    {
        if (entry.isDirectory()) yield * walkFileEntries(path.resolve(root, entry.name));
        else
        {
            const stat = await fs.stat(path.resolve(root, entry.name));
            yield { name: entry.name, path: path.join(root, entry.name), entry, stat };
        }
    }
}

module.exports.DebugManifest = module.exports;
