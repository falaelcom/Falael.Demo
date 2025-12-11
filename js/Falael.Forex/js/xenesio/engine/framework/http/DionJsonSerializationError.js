"use strict";

include("StdAfx.js");

class DionJsonSerializationError extends DionClientError
{
	constructor(value, message, innerError)
	{
		super(70004, "JSON serialization error", message, innerError);

		this.value = value;
	}
}