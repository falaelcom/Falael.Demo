"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class RestEndpointException extends DionException // 10008
{
    constructor(commandKey, innerException)
    {
        super(500, 10008, "REST endpoint error", innerException.message, innerException);

		this.commandKey = commandKey;
		this.innerException = innerException;
    }
}
