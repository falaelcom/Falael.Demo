"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class IoException extends DionException // 10013
{
    constructor(innerException, message)
    {
        super(500, 10013, "IO error", message, innerException);
    }
}
