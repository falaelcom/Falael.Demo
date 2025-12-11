"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class InvalidOperationException extends DionException // 10005
{
    constructor(message)
    {
        super(500, 10005, "The operation is not valid in the current application state", message);
    }
}
