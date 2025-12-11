"use strict";

const node_path = require("path");

const Utility = require("@framework/Utility.js");
const Command = require("@framework/Command.js");

module.exports =

class CommandRegistry
{
    constructor()
    {
        this._commandMap = new Map();
        this._commandList = [];
    }

    get commandMap()
    {
        return this._commandMap;
    }

    get commandList()
    {
        return this._commandList;
    }

    async register(path)
    {
        const paths = await Utility.Fs.getFiles({ path, patternRegex: /.*Command\.js$/gi });
        for (let length = paths.length, i = 0; i < length; ++i)
        {
            const item = paths[i];
            let key = item.replace(node_path.resolve(path), "").replace(/Command\.js$/gi, "").replace(/{(.*)}/gi, ":$1").replace(/\\/gi, '/');

			const commandType = require(item);
			commandType.manifest = Command.__ensureManifest(commandType.__manifest);
			commandType.key = key;

            if (commandType.manifest.rest.parameters)
            {
                for (let jlength = commandType.manifest.rest.parameters.length, j = 0; j < jlength; ++j)
                {
                    key += "/:" + commandType.manifest.rest.parameters[j];
                }
            }

            this._commandMap.set(key, commandType);
            this._commandList.push({ key, commandType });

			Command.__initializeCommandCliAjvSchema(commandType);
        }
    }
}