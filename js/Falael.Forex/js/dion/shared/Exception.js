"use strict";

module.exports =

class Exception extends Error
{
    constructor(name, message, innerException)
    {
        super(message);

		this.name = name;
		this.innerException = innerException;

		if (!this.innerException && Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    }
}
