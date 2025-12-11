"use strict";

include("StdAfx.js");

//	all ratings and fitness values are in the range [0..1]
//	all weights are non-negative numbers
class V3Rater
{
	constructor(config)
	{
		this._weight = config.weight;
	}

	__rate(context, item)
	{
	}

	rate(context, item)
	{
		var result = this.__rate(context, item);
		if (result < 0 || result > 1) throw "Return value is invalid: V3Rater.__rate.";
		return result;
	}

	get weight()
	{
		return this._weight;
	}
}
