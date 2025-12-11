//	R0Q3?/daniel/20210913
//	- TEST, DOC, VALIDATE
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

module.exports =

//	Class: 
class Network
{
	static parseIP(req)
	{
		return req.headers["x-forwarded-for"]?.split(',').shift() || req.socket?.remoteAddress;
	}
}

module.exports.Network = module.exports;
