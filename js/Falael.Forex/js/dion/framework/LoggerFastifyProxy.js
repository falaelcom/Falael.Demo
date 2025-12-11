"use strict";

const Utility = require("@framework/Utility.js");
const NotImplementedException = require("@framework/NotImplementedException.js");

module.exports =

class LoggerFastifyProxy
{
	constructor(verbose)
	{
		this.verbose = verbose;
	}

	static _parseArgs(args)
	{
		function stringifySubject(obj)
		{
			var footprint = {};

			if (obj.error || obj.err)
			{
				footprint.error = obj.error || obj.err;
			}

			if (obj.req && obj.res)
			{
				footprint.id = obj.req.id;
				footprint.method = obj.req.method;
				footprint.endpoint = obj.req.url;
				footprint.server = obj.req.hostname;
				footprint.source = (obj.req.headers["x-forwarded-for"] || "").split(",").pop() ||
					obj.req.connection.remoteAddress ||
					obj.req.socket.remoteAddress ||
					obj.req.connection.socket.remoteAddress;
				footprint.payloadLength = obj.req.headers["content-length"];
				footprint.payloadMimeType = obj.req.headers["content-type"];

				footprint.statusCode = obj.res.statusCode;
				footprint.statusMessage = obj.res.statusMessage;
				if (!Utility.Type.isNU(footprint.responseTime)) footprint.responseTime = obj.responseTime;
			}
			else if (obj.req)
			{
				footprint.id = obj.req.id;
				footprint.method = obj.req.method;
				footprint.endpoint = obj.req.url;
				footprint.server = obj.req.hostname;
				footprint.source = (obj.req.headers["x-forwarded-for"] || "").split(",").pop() ||
					obj.req.connection.remoteAddress ||
					obj.req.socket.remoteAddress ||
					obj.req.connection.socket.remoteAddress;
				footprint.payloadLength = obj.req.headers["content-length"];
				footprint.payloadMimeType = obj.req.headers["content-type"];
			}
			else if (obj.res)
			{
				footprint.id = obj.res.id;
				footprint.statusCode = obj.res.statusCode;
				footprint.statusMessage = obj.res.statusMessage;
				footprint.responseTime = obj.responseTime;
			}
			else
			{
				footprint = obj;
			}

			return JSON.stringify(footprint);
		}

		function translateMessage(text)
		{
			switch (text)
			{
				case "incoming request":
					return "request start";
				case "request completed":
					return "request end  ";
				default:
					return text;
			}
		}

		var result =
		{
			loggerArgs: [],
		};
		switch (args.length)
		{
			case 0:
				break;
			case 1:
				if (Utility.Type.isString(args[0]))
				{
					result.message = translateMessage(args[0]);
					result.loggerArgs.push(result.message);
					break;
				}
				result.subject = stringifySubject(args[0]);
				result.loggerArgs.push(result.subject);
				break;
			case 2:
				if (Utility.Type.isString(args[0]))
				{
					result.message = translateMessage(args[0]);
					result.trace = args[1];
					result.loggerArgs.push(result.message);
					result.loggerArgs.push(result.trace);
					break;
				}
				result.subject = stringifySubject(args[0]);
				result.message = translateMessage(args[1]);
				result.loggerArgs.push(result.message);
				result.loggerArgs.push(result.subject);
				break;
			case 3:
				result.subject = stringifySubject(args[0]);
				result.message = translateMessage(args[1]);
				result.trace = args[2];
				result.loggerArgs.push(result.message);
				result.loggerArgs.push(result.subject);
				result.loggerArgs.push(result.trace);
			default:
				throw new NotImplementedException();

		}

		return result;
	}

	trace(...args)
	{
		if (!this.verbose) return;
		logger.trace(...args);
	}

	debug(...args)
	{
		if (!this.verbose) return;
		logger.debug(...args);
	}

	info(...args)
	{
		if (!this.verbose) return;
		logger.info(...LoggerFastifyProxy._parseArgs(args).loggerArgs);
	}

	warn(...args)
	{
		logger.warn(...LoggerFastifyProxy._parseArgs(args).loggerArgs);
	}

	error(...args)
	{
		logger.error(...LoggerFastifyProxy._parseArgs(args).loggerArgs);
	}

	fatal(...args)
	{
		logger.fatal(...LoggerFastifyProxy._parseArgs(args).loggerArgs);
	}

	child()
	{
		return new LoggerFastifyProxy(this.verbose);
	}
}
