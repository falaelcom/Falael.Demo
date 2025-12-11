"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class InvalidValueException extends DionException // 10015
{
    constructor(parameterName, message)
    {
        super(400, 10015, "The provided value is not valid", message);

		this.parameterName = parameterName;
    }
}
