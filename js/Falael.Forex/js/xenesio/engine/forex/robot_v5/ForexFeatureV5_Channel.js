"use strict";

include("StdAfx.js");

//	ccsc - correlation coefficient sign change
class ForexFeatureV5_Channel
{
	constructor(par)
	{
		this._firstDt = par.firstDt;
		this._lastDt = par.lastDt;
		this._datapoint_spi2 = par.datapoint_spi2;		//	significant point 3 info: {item, index} - the last datapoint of the channel; the first datapoint after spi1 to escape the channel boundry/ies
		this._isBroken = par.isBroken;						//	channel was going to be too longs
		this._tradeSample = par.tradeSample;

		this._lineOfBestFitInfo = par.lineOfBestFitInfo;
		this._supportAndResistanceInfo = par.supportAndResistanceInfo;
		this._progressInfo = par.progressInfo;
	}


	get isFinished()
	{
		return !!this._datapoint_spi2;
	}

	get isBroken()
	{
		return this._isBroken;
	}


	get firstDt()
	{
		return this._firstDt;
	}

	get lastDt()
	{
		return this._lastDt;
	}

	get datapoint_spi2()
	{
		return this._datapoint_spi2;
	}

	set datapoint_spi2(value)
	{
		this._datapoint_spi2 = value;
	}

	get tradeSample()
	{
		return this._tradeSample;
	}

	get trade_totalMovement()
	{
		var result = 0;
		for (var length = this._tradeSample.length, i = 0; i < length; ++i) result += (this._tradeSample.getAt(i, "movement") || 0);
		return result;
	}


	get lineOfBestFitInfo()
	{
		return this._lineOfBestFitInfo;
	}

	get supportAndResistanceInfo()
	{
		return this._supportAndResistanceInfo;
	}

	get progressInfo()
	{
		return this._progressInfo;
	}
}
