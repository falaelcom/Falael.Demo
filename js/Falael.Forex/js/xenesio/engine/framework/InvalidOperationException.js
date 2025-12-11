"use strict";

include("StdAfx.js");

class InvalidOperationException extends XenesioException
{
    constructor(message, innerException)
    {
        super("The operation is not valid in the current application state", message, innerException);
    }
}
