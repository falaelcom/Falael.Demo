"use strict";

include("StdAfx.js");

class DionHttpError extends DionClientError
{
	constructor(statusCode, response, readyState, message, innerError)
	{
		super(70002, "HTTP error", message, innerError);

		this.statusCode = statusCode;
		this.response = response;
		this.readyState = readyState;
	}
}