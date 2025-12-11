"use strict";

include("StdAfx.js");

class DionClientError
{
	constructor(code, name, message, innerError)
	{
		this.code = code;
		this.name = name;
		this.message = message;
		this.innerError = innerError;
	}
}