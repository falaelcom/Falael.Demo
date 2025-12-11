"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class DbException extends DionException // 10012
{
    constructor(innerException, message)
    {
        super(500, 10012, "Database error", message, innerException);
    }
}
