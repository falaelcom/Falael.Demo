"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class ArgumentException extends DionException // 10001
{
    constructor(parameterName, message)
    {
        super(500, 10001, "Argument value is not valid", message);

		this.parameterName = parameterName;
    }
}
