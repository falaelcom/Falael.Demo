"use strict";

const ELoggerLevel = require("@framework/ELoggerLevel.js");
const ELoggerTarget = require("@framework/ELoggerTarget.js");

const ArgumentException = require("@framework/ArgumentException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");

module.exports =

class Logger
{
	constructor(defaultTargets)
	{
		this._routes = {};
		this._defaultTargets = defaultTargets;
	}

	addRoute(level, target)
	{
		var targets = this._routes[level];
		if (!targets)
		{
			targets = [];
			this._routes[level] = targets;
		}
		targets.push(target);
	}

	trace(...args)
	{
		this.writeLine(ELoggerLevel.Trace, ...args);
	}

	debug(...args)
	{
		this.writeLine(ELoggerLevel.Debug, ...args);
	}

	info(...args)
	{
		this.writeLine(ELoggerLevel.Info, ...args);
	}

	warn(...args)
	{
		this.writeLine(ELoggerLevel.Warning, ...args);
	}

	error(...args)
	{
		this.writeLine(ELoggerLevel.Error, ...args);
	}

	fatal(...args)
	{
		this.writeLine(ELoggerLevel.Fatal, ...args);
	}

	get routes()
	{
		return this._routes;
	}

	get defaultTargets()
	{
		return this._defaultTargets;
	}

	writeLine(level, ...args)
	{
		var targets = this._routes[level];
		if (!targets)
		{
			if (!this._defaultTargets)
			{
				console.log.apply(console, args);
				throw new ArgumentException("level");
			}
			targets = this._defaultTargets;
		}

		for (var length = targets.length, i = 0; i < length; ++i)
		{
			var target = targets[i];
			switch (target)
			{
				case ELoggerTarget.Null:
					break;
				case ELoggerTarget.Stdout:
					console.log.apply(console, args);
					break;
				case ELoggerTarget.Stderr:
					console.error.apply(console, args);
					break;
				default:
					throw new NotImplementedException();
			}
		}
	}

	write(level, text)
	{
		var targets = this._routes[level];
		if (!targets)
		{
			if (!this._defaultTargets)
			{
				process.stdout.write(text);
				throw new ArgumentException("level");
			}
			targets = this._defaultTargets;
		}

		for (var length = targets.length, i = 0; i < length; ++i)
		{
			var target = targets[i];
			switch (target)
			{
				case ELoggerTarget.Null:
					break;
				case ELoggerTarget.Stdout:
					process.stdout.write(text);
					break;
				case ELoggerTarget.Stderr:
					process.stderr.write(text);
					break;
				default:
					throw new NotImplementedException();
			}
		}
	}
}
