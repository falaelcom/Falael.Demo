"use strict";

const fs = require("fs");
const node_path = require("path");

module.exports =

class Utility_Fs
{
    static getFiles(par)
    {
        return new Promise((resolve, reject) =>
        {
            return Utility_Fs._getFiles(par, (err, result) =>
            {
				try
				{
					if (err)
					{
						return reject(err);
					}
					return resolve(result);
				}
				catch (ex)
				{
					return reject(ex);
				}
            });
        });
    }

    static _getFiles(par, callback)
    {
        const path = par.path;
        const patternRegex = par.patternRegex || null;

        let result = [];
        return fs.readdir(path, function (err, list)
        {
            if (err)
            {
                return callback(err);
            }

            let pendingCount = list.length;
            if (!pendingCount)
            {
                return callback(null, result);
            }

            list.forEach(function (entry)
            {
                const localPath = node_path.resolve(path, entry);

                fs.stat(localPath, function (err, stat)
                {
                    if (stat && stat.isDirectory())
                    {
                        Utility_Fs._getFiles({ path: localPath, patternRegex }, function (err, res)
                        {
                            result = result.concat(res);
                            if (!--pendingCount)
                            {
                                return callback(null, result);
                            }
                        });
                    }
                    else
                    {
                        if (patternRegex)
                        {
                            if (localPath.match(patternRegex))
                            {
                                result.push(localPath);
                            }
                        }
                        else
                        {
                            result.push(localPath);
                        }
                        if (!--pendingCount)
                        {
                            return callback(null, result);
                        }
                    }
                });
            });
        });
    }
}