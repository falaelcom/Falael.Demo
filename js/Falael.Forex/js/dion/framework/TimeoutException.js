"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class TimeoutException extends DionException // 10011
{
    constructor(timeoutMs, message)
    {
        super(500, 10011, "Operation aborted after the specified timeout", message);

		this.timeoutMs = timeoutMs;
    }
}
