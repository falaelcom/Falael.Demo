"use strict";

include("StdAfx.js");

class NotImplementedException extends XenesioException
{
    constructor(message, innerException)
    {
        super("Not implemented", message, innerException);
    }
}
