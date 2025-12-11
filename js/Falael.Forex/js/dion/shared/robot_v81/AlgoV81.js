"use strict";

const Queue = require("@shared/Queue.js");
const Pool = require("@shared/Pool.js");

const LongPositionV81 = require("@shared/robot_v81/LongPositionV81.js");

module.exports =

//	v81 only supports long positions, stop loss and take profit
class AlgoV81
{
	constructor({ sampleDtu })
	{
		//	configuration
		this._sampleDtu = sampleDtu;	//	EDateTimeUnit, TODO: merge client and server EDateTimeUnit into the shared folder

		//	internal state
		this._positionPool = new Pool();

		//	optimization
		this._result = [];
	}

	tick(dt, ask, bid)
	{
		this._result.length = 0;



		return this._resultPool.items;
	}
}
