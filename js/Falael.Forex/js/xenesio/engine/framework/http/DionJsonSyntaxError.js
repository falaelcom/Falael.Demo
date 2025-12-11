"use strict";

include("StdAfx.js");

class DionJsonSyntaxError extends DionClientError
{
	constructor(json, message, innerError)
	{
		super(70001, "JSON syntax error", message, innerError);

		this.json = json;
	}
}