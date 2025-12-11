"use strict";

include("StdAfx.js");

class XenesioException extends Exception
{
    constructor(name, message, innerException)
    {
        super(name, message, innerException);
    }
}
