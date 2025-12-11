"use strict";

include("StdAfx.js");

class ForexFeatureV4_TrendLine
{
	constructor(par)
	{
		this._line = par.line;
		this._rating = par.rating;
		this._pointSample = par.pointSample;
		this._rawSample = par.rawSample;
		this._offsetInRawSample = par.offsetInRawSample;
	}

	get line()
	{
		return this._line;
	}

	get rating()
	{
		return this._rating;
	}

	get pointSample()
	{
		return this._pointSample;
	}

	get rawSample()
	{
		return this._rawSample;
	}

	get offsetInRawSample()
	{
		return this._offsetInRawSample;
	}
}
