"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class ArgumentNullException extends DionException // 10002
{
    constructor(parameterName, message)
    {
        super(500, 10002, "Argument is null", message);

		this.parameterName = parameterName;
    }
}
