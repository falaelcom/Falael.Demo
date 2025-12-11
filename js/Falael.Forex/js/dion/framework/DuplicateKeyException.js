"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class DuplicateKeyException extends DionException // 10004
{
    constructor(key, message)
    {
        super(500, 10004, "Duplicate key in dictionary", message);

		this.key = key;
    }
}
