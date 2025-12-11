"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class NotImplementedException extends DionException // 10006
{
    constructor(message)
    {
        super(501, 10006, "Not implemented", message);
    }
}
