"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class UnexpectedException extends DionException // 10014
{
    constructor(innerException, message)
    {
        super(500, 10014, "Unexpected error", message, innerException);
    }
}
