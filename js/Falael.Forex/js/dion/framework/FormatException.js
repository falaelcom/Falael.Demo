"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class FormatException extends DionException // 10010
{
    constructor(dataChunkName, message)
    {
        super(500, 10010, "Invalid format", message);

		this.dataChunkName = dataChunkName;
    }
}
