"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class ValidationFailedException extends DionException // 10009
{
    constructor(ajvErrors, message)
    {
		super(400, 10009, "Validation failed", message);

		this.ajvErrors = ajvErrors;
    }
}
