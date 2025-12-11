"use strict";

include("StdAfx.js");

function BookDocument_ResourceLoader(ioBasePath, dataRoot, resourcesRoot)
{
	this.ioBasePath = ioBasePath;
	this.dataRoot = dataRoot;
	this.resourcesRoot = resourcesRoot;

	this.includedFileMap = {};
}

BookDocument_ResourceLoader.prototype.loadJsonFile = function (relativePath, callback)
{
	var path = this.ioBasePath + this.dataRoot + relativePath;

	if (this.includedFileMap[path])
	{
		return callback("Already included: " + path);
	}
	this.includedFileMap[path] = true;

	return async.waterfall(
	[
		function (next)
		{
			return Utility.IO.readFile(path, next);
		},
		function (text, next)
		{
			var json;
			try
			{
				json = JSON.parse(text);
			}
			catch (ex)
			{
				return next("Invalid JSON in " + path + "; " + ex.message);
			}
			return next(null, json);
		}
	], function done(err, result)
	{
		if (err)
		{
			console.error("Cannot read index JSON file \"" + path + "\".");
		}
		return callback(err, result);
	});
}

BookDocument_ResourceLoader.prototype.loadRoomFile = function (relativePath, callback)
{
	var path = this.ioBasePath + this.dataRoot + relativePath;

	return Utility.IO.readFile(path, function done(err, result)
	{
		if (err)
		{
			console.error("Cannot read room file \"" + path + "\".");
		}
		return callback(err, result);
	});
}