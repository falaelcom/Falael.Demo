//	R0Q3?/daniel/20220402
//		- TODO: `log` is a misleading name, too similar to the `Logger.log`; rename to sth that pairs well with the name of the `alert` method
//		- DOC, TEST
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");
const Logger = require("-/pb/natalis/005/Logger.js");

module.exports =

class Feedback
{
	static Abort = -1;

	//	Parameter: `par.logger: Logger`
	//	Parameter: `par.progressLogger: Logger`
	//	Parameter: `par.alert: function(code, activityKey, ...args): bool` - return value must be `-1` (`Feedback.Abort`) or a signal for the caller, as defined by caller's specification.
	constructor(par)
	{
		if(PB_DEBUG)
		{
			if (!Type.isNU(par) && !Type.isObject(par)) throw new Exception(0x3C939C, `Argument is invalid: "par".`);
			if (par && !Type.isNU(par.logger) && !(par.logger instanceof Logger)) throw new Exception(0x90B6B9, `Argument is invalid: "par.logger".`);
			if (par && !Type.isNU(par.progressLogger) && !(par.progressLogger instanceof Logger)) throw new Exception(0x364F9E, `Argument is invalid: "par.progressLogger".`);
			if (par && !Type.isNU(par.alert) && !CallableType.isFunction(par.alert)) throw new Exception(0x76D5F8, `Argument is invalid: "par.alert".`);
		}

		this._logger = par && par.logger;
		this._progressLogger = par && par.progressLogger || (this._logger && Logger.augment(this._logger, Feedback.decorator));
		this._alert = par && par.alert;

		this._activities = {};

		Object.freeze(this);
	}

	static decorator(logLevel, args)
	{
		let i = 0;
		for (const length = args.length; i < length; ++i) if (args[i] instanceof ProgressSnapshot)
		{
			args[i] = args[i].getPercent() + "%";
			break;
		}
		if (i !== args.length) args.splice(i + 1, 1);	//	remove `activityKey`
		return args;
	}


	print(logLevel, ...args)
	{
		if (this._logger) this._logger.print(logLevel, ...args);
	}

	printTrace()
	{
		if (this._logger) this._logger.printTrace(...arguments);
	}

	printDebug()
	{
		if (this._logger) this._logger.printDebug(...arguments);
	}

	printInfo()
	{
		if (this._logger) this._logger.printInfo(...arguments);
	}

	printWarn()
	{
		if (this._logger) this._logger.printWarn(...arguments);
	}

	printError()
	{
		if (this._logger) this._logger.printError(...arguments);
	}


	log(logLevel, ...args)
	{
		if (this._logger) this._logger.log(logLevel, ...args);
	}

	time()
	{
		if (this._logger) this._logger.time(...arguments);
	}

	timeEnd()
	{
		if (this._logger) this._logger.timeEnd(...arguments);
	}

	trace()
	{
		if (this._logger) this._logger.trace(...arguments);
	}

	debug()
	{
		if (this._logger) this._logger.debug(...arguments);
	}

	info()
	{
		if (this._logger) this._logger.info(...arguments);
	}

	warn()
	{
		if (this._logger) this._logger.warn(...arguments);
	}

	error()
	{
		if (this._logger) this._logger.error(...arguments);
	}

	alert(code)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(code)) throw new ArgumentException(0x880871, "code", code);
		}
		if (!this._alert) return Feedback.Abort;
		return this._alert(code, null, ...args);
	}


	progressLog(activityKey, logLevel, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0x725C89, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0xD67029, "activityKey", activityKey);
		}
		if (this._progressLogger) this._progressLogger.log(logLevel, this._activities[activityKey], activityKey, ...args);
	}

	progressTrace(activityKey, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0xA66FDF, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0xE9E8C9, "activityKey", activityKey);
		}
		if (this._progressLogger) this._progressLogger.trace(this._activities[activityKey], activityKey, ...args);
	}

	progressDebug(activityKey, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0x352297, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0x737489, "activityKey", activityKey);
		}
		if (this._progressLogger) this._progressLogger.debug(this._activities[activityKey], activityKey, ...args);
	}

	progressInfo(activityKey, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0xEE9A25, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0x49D7A1, "activityKey", activityKey);
		}
		if (this._progressLogger) this._progressLogger.info(this._activities[activityKey], activityKey, ...args);
	}

	progressWarn(activityKey, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0x36690D, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0x2BD569, "activityKey", activityKey);
		}
		if (this._progressLogger) this._progressLogger.warn(this._activities[activityKey], activityKey, ...args);
	}

	progressError(activityKey, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0xF3B350, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0x7B412B, "activityKey", activityKey);
		}
		if (this._progressLogger) this._progressLogger.error(this._activities[activityKey], activityKey, ...args);
	}

	//	Returns: any value; the return value interpretation is specific to each operation that provides `Feedback`; if the `Feedback` object has not been configured with an `alert`
	//		callback (see `constructor`), this function always returns `Feedback.Abort`.
	//	Remarks: General guidelines on return value interpretation:
	//		- a return value of `-1` (`Feedback.Abort`) should be interpreted by the caller as an instruction to terminate operation and return;
	//		- any unknown signal shall be interpreted by the caller as an instruction to ignore the alert and continue execution if possible;
	//		- all other signals shall be processed by the caller according to its signal specifications.
	progressAlert(activityKey, code)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(code)) throw new ArgumentException(0x75738B, "code", code);
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new ArgumentException(0xD224FB, "activityKey", activityKey);
			if (!this._activities[activityKey]) throw new ArgumentException(0x7B0746, "activityKey", activityKey);
		}
		if (!this._alert) return Feedback.Abort;
		return this._alert(code, activityKey, ...args);
	}


	begin(activityKey, min, max, current = null)
	{
		if(PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new Exception(0xE4A652, `Argument is invalid: "activityKey".`);
			if(!Type.isNumber(min)) throw new Exception(0x6B9104, `Argument is invalid: "min".`);
			if(!Type.isNumber(max)) throw new Exception(0x27B071, `Argument is invalid: "max".`);
			if(current !== null && !Type.isNumber(current)) throw new Exception(0xEA01FD, `Argument is invalid: "current".`);
		}
		const result = new ProgressSnapshot(min, max, current !== null ? current : min);
		this._activities[activityKey] = result;
		return result;
	}

	adjust(activityKey, min = null, max = null, current = null)
	{
		if(PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new Exception(0xB61BEE, `Argument is invalid: "activityKey".`);
			if (!this._activities[activityKey]) throw new Exception(0x529413, `Argument is invalid: "activityKey".`);
			if(min !== null && !Type.isNumber(min)) throw new Exception(0x91765E, `Argument is invalid: "min".`);
			if(max !== null && !Type.isNumber(max)) throw new Exception(0x73FADB, `Argument is invalid: "max".`);
			if(current !== null && !Type.isNumber(current)) throw new Exception(0x1A49B6, `Argument is invalid: "current".`);
		}
		const result = this._activities[activityKey];
		if(min !== null) result.min = min;
		if(max !== null) result.max = max;
		if(current !== null) result.current = current;
		return result;
	}

	step(activityKey, delta = 1)
	{
		if(PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new Exception(0x903A8E, `Argument is invalid: "activityKey".`);
			if (!this._activities[activityKey]) throw new Exception(0x47A8E6, `Argument is invalid: "activityKey".`);
			if(!Type.isNumber(delta)) throw new Exception(0x39290C, `Argument is invalid: "delta".`);
		}
		const result = this._activities[activityKey];
		result.current += delta;
		return result;
	}

	end(activityKey)
	{
		if(PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new Exception(0x80B1E7, `Argument is invalid: "activityKey".`);
			if (!this._activities[activityKey]) throw new Exception(0x90A643, `Argument is invalid: "activityKey".`);
		}
		const result = this._activities[activityKey];
		delete this._activities[activityKey];
		return result;
	}

	snapshot(activityKey)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(activityKey) && !Type.isString(activityKey) && !Type.isSymbol(activityKey)) throw new Exception(0x99BF1A, `Argument is invalid: "activityKey".`);
			if (!this._activities[activityKey]) throw new Exception(0x1E2D87, `Argument is invalid: "activityKey".`);
		}
		return this._activities[activityKey];
	}


	nest()
	{
		const result = new Feedback(
		{
			logger: this._logger,
			alert: this._alert,
			progressLogger: this._progressLogger,
		});
		return result;
	}
}

class ProgressSnapshot
{
	constructor(min, max, current)
	{
		if(PB_DEBUG)
		{
			if(!Type.isNumber(min)) throw new Exception(0x6B8473, `Argument is invalid: "min".`);
			if(!Type.isNumber(max)) throw new Exception(0xC8D593, `Argument is invalid: "max".`);
			if(!Type.isNumber(current)) throw new Exception(0xBB30AA, `Argument is invalid: "current".`);
		}
		this.min = min;
		this.max = max;
		this.current = current;
	}

	//	Parameter: `epsylon` - integer in interval [0, 1]
	getProgress(decimals = 0, epsylon = 0)
	{
		if(PB_DEBUG)
		{
			if(!Type.isInteger(decimals) || decimals < 0) throw new Exception(0x3FFECD, `Argument is invalid: "decimals".`);
			if(!Type.isNumber(epsylon) || epsylon < 0 || epsylon >= 1) throw new Exception(0x61C7BC, `Argument is invalid: "epsylon".`);
		}
		if(this.current >= this.max - epsylon) return 1;
		const result = (this.current - this.min) / (this.max - this.min);
		if(isNaN(result)) return 1;
		if(decimals === 0) return result;
		const factor = Math.pow(10, decimals);
		return Math.floor(result * factor) / factor;
	}

	//	Parameter: `epsylon` - integer in interval [0, 100]
	getPercent(decimals = 0, epsylon = 0)
	{
		if(PB_DEBUG)
		{
			if(!Type.isInteger(decimals) || decimals < 0) throw new Exception(0x1A5543, `Argument is invalid: "decimals".`);
			if(!Type.isNumber(epsylon) || epsylon < 0 || epsylon >= 100) throw new Exception(0x6ED59B, `Argument is invalid: "epsylon".`);
		}
		if(this.current >= this.max - epsylon / 100) return 100;
		const result = 100 * (this.current - this.min) / (this.max - this.min);
		if(isNaN(result)) return 100;
		const factor = Math.pow(10, decimals);
		return Math.floor(result * factor) / factor;
	}
}

module.exports.Feedback = module.exports;
