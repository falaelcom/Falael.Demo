"use strict";

include("StdAfx.js");

class DionValidateError extends DionClientError
{
	constructor(message, innerError)
	{
		super(70003, "Validate error", message, innerError);
	}
}

DionValidateError.fromAjvError = function (message, ajvError)
{
	return new DionValidateError(message, ajvError);
}

DionValidateError.fromAjvErrors = function (message, ajvErrors)
{
	var result = [];
	for (var length = ajvErrors.length, i = 0; i < length; ++i)
	{
		result.push(DionValidateError.fromAjvError(message, ajvErrors[i]));
	}
	return result;
}