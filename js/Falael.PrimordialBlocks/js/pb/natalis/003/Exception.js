//	R0Q3?/daniel/20220608
//	- DOC
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");

module.exports =

class Exception extends Error
{
	constructor(ncode, message = null, detailsOrInnerException = null, innerException = null)
	{
		if (!Type.isInteger(ncode))
			throw new Error(`0xA7D083 Bad exception. Argument is invalid: ${Diagnostics.print("ncode", ncode)}; integer expected. Details: ${Diagnostics.print("message", message, "detailsOrInnerException", detailsOrInnerException, "innerException", innerException)}.`);

		if (!Type.isNU(message) && !Type.isString(message))
			throw new Error(`0xA35A92 Bad exception. Argument is invalid: ${Diagnostics.print("message", message)}; string expected. Details: ${Diagnostics.print("ncode", ncode, "detailsOrInnerException", detailsOrInnerException, "innerException", innerException)}.`);

		if (!Type.isNU(innerException) && !(innerException instanceof Error))
			throw new Error(`0xC0ACDA Bad exception. Argument is invalid: ${Diagnostics.print("innerException", innerException)}; Error instance expected. Details: ${Diagnostics.print("ncode", ncode, "message", message, "detailsOrInnerException", detailsOrInnerException)}.`);

		if (detailsOrInnerException instanceof Error && !Type.isNU(innerException))
			throw new Error(`0x7D52E4 Bad exception. Arguments are invalid: ${Diagnostics.print("detailsOrInnerException", detailsOrInnerException, "innerException", innerException)}. Details: ${Diagnostics.print("ncode", ncode, "message", message)}.`);

		const ncodeText = `0x${ncode.toString(16).toUpperCase()}`;

		if (detailsOrInnerException instanceof Error)
		{
			innerException = detailsOrInnerException;
			detailsOrInnerException = null;
		}


		super(`${ncodeText}${message && message.length > 0 ? ' ' + Diagnostics.printString(message) : ""}${innerException ? innerException.message ? ' ' + Diagnostics.printString(innerException.message) : "" : ""}`);

		this._rawMessage = message || "";
		this.code = ncodeText;
		this.ncode = ncode;

		this.details = detailsOrInnerException;
		this.innerException = innerException;

		if (!this.innerException && Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
	}

	get rawMessage()
	{
		return this._rawMessage;
	}


	static InvalidOperationException = class InvalidOperationException extends Exception
	{
		constructor(ncode, message = null, innerException = null)
		{
			super(ncode, `Invalid operation${message ? ": " + Diagnostics.printString(message) : ""}.`, null, innerException);
		}
	}

	static ArgumentException = class ArgumentException extends Exception
	{
		constructor(ncode, name, value, message = null, innerException = null)
		{
			if (!Type.isString(name))
				throw new Error(`0x13B72B Bad exception. Argument is invalid: ${Diagnostics.print("name", name)}; string expected. Details: ${Diagnostics.print("ncode", ncode, "value", value, "message", message, "innerException", innerException)}.`);

			super(ncode, `Argument is invalid: ${Diagnostics.print(name, value)}${Diagnostics.printString(message)}.`, { name, value }, innerException);
		}
	}

	static ReturnValueException = class ReturnValueException extends Exception
	{
		constructor(ncode, callbackName, value, message = null, innerException = null)
		{
			if (!Type.isString(callbackName))
				throw new Error(`0x966165 Bad exception. Callback has returned an invalid value: ${Diagnostics.print("value", value)}; string expected. Details: ${Diagnostics.print("ncode", ncode, "callbackName", callbackName, "message", message, "innerException", innerException)}.`);

			super(ncode, `Callback has returned an invalid value: ${Diagnostics.print(callbackName, value)}${Diagnostics.printString(message)}.`, { callbackName, value }, innerException);
		}
	}

	static ValidationFailedException = class ValidationFailedException extends Exception
	{
		constructor(ncode, subjectName, subjectValue, ruleName, rule, explanation = null, message = null, innerException = null)
		{
			if (!Type.isString(subjectName))
				throw new Error(`0xE42567 Bad exception. Validation failed: ${Diagnostics.print("subjectValue", subjectValue)}; string expected. Details: ${Diagnostics.print("ncode", ncode, "subjectName", subjectName, "ruleName", ruleName, "rule", rule, "message", message, "innerException", innerException)}.`);

			if (!Type.isString(ruleName))
				throw new Error(`0xB101B2 Bad exception. Validation failed: ${Diagnostics.print("ruleName", ruleName)}; string expected. Details: ${Diagnostics.print("ncode", ncode, "subjectName", subjectName, "ruleName", ruleName, "rule", rule, "message", message, "innerException", innerException)}.`);

			super(ncode, `Validation failed [${ruleName}]: ${Diagnostics.print(subjectName, subjectValue)}${Diagnostics.printString(message)}.`, { subjectName, subjectValue, ruleName, rule, explanation }, innerException);
		}
	}

	static NotImplementedException = class NotImplementedException extends Exception
	{
		constructor(ncode, message = null)
		{
			super(ncode, `Not implemented${message ? ": " + Diagnostics.printString(message) : ""}.`);
		}
	}

	static NotSupportedException = class NotSupportedException extends Exception
	{
		constructor(ncode, message = null)
		{
			super(ncode, `Not supported${message ? ": " + Diagnostics.printString(message) : ""}.`);
		}
	}

	static CircularReferenceException = class CircularReferenceException extends Exception
	{
		constructor(ncode, message = null)
		{
			super(ncode, `Circular reference${message ? ": " + Diagnostics.printString(message) : ""}.`);
		}
	}

	static HttpException = class HttpException extends Exception
	{
		constructor(ncode, details, message = null, innerException = null)
		{
			if (Type.isNU(details) || !Type.isObject(details))
				throw new Error(`0x8D4E9C Bad exception. Argument is invalid: ${Diagnostics.print("details", details)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}.`);

			const { method, url, httpStatusCode, httpStatusText, appStatusCode, appStatusText, responseText } = details;

			if (!Type.isString(method))
				throw new Error(`0xD2B753 Bad exception. Argument is invalid: ${Diagnostics.print("details.method", method)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			if (!Type.isString(url))
				throw new Error(`0x89D979 Bad exception. Argument is invalid: ${Diagnostics.print("details.url", url)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			if (!Type.isInteger(httpStatusCode))
				throw new Error(`0xD1A1A0 Bad exception. Argument is invalid: ${Diagnostics.print("details.httpStatusCode", httpStatusCode)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			if (!Type.isNU(httpStatusText) && !Type.isString(httpStatusText))
				throw new Error(`0x1289C9 Bad exception. Argument is invalid: ${Diagnostics.print("details.httpStatusText", httpStatusText)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			if (!Type.isNU(appStatusCode) && !Type.isInteger(appStatusCode))
				throw new Error(`0xCBD3A6 Bad exception. Argument is invalid: ${Diagnostics.print("details.appStatusCode", appStatusCode)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			if (!Type.isNU(appStatusText) && !Type.isString(appStatusText))
				throw new Error(`0xAD95A6 Bad exception. Argument is invalid: ${Diagnostics.print("details.appStatusText", appStatusText)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			if (!Type.isNU(responseText) && !Type.isString(responseText))
				throw new Error(`0x8D3406 Bad exception. Argument is invalid: ${Diagnostics.print("details.responseText", responseText)}. Details: ${Diagnostics.print("ncode", ncode, "message", message, "innerException", innerException)}, "details" ({${Diagnostics.printObject(details)}}).`);

			let sb = "";
			sb += httpStatusCode;
			if (httpStatusText) sb += ` ${httpStatusText}.`;
			if (message) sb += ` ${message}`;
			if (method) sb += ` ${method}`;
			if (url) sb += ` ${url}`;
			if (appStatusCode) sb += ` ${appStatusCode}`;
			if (appStatusText) sb += ` ${appStatusText}.`;
			if (responseText) sb += ` RESPONSE: ${responseText}`;

			super(ncode, sb, innerException);

			Object.assign(this, details);
		}
	}

	static MergeConflictException = class MergeConflictException extends Exception
	{
		constructor(ncode, details, message = null)
		{
			if (Type.isNU(details) || !Type.isObject(details))
				throw new Error(`0xF310F3 Bad exception. Argument is invalid: ${Diagnostics.print("details", details)}. Details: ${Diagnostics.print("ncode", ncode, "message", message)}.`);

			super(ncode, `Merge conflict${message ? ": " + Diagnostics.printString(message) : ""}.`);

			Object.assign(this, details);
		}
	}
}

module.exports.Exception = module.exports;