"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class ResponseTypeException extends DionException // 10007
{
    constructor(exptected, message)
    {
        super(500, 10007, "Reponse type mismatch", message);

		this.exptected = exptected;
    }
}
