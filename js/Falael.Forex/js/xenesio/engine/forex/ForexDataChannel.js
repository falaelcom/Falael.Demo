"use strict";

include("StdAfx.js");

class ForexDataChannel
{
	constructor(par)
	{
		this._sampleIntervalDef = par.sampleIntervalDef;
	}


	//	par: { range, merge }
	//	returns the count of newly read datapoints
	async loadRange(par)
	{
		throw "Not implemented.";
	}

	async ensureRange(range)
	{
		throw "Not implemented.";
	}

	//	par: { dt, pageSizeMs, lookBack, acceptEqual }
	//	looks up and returns the datapoint preceding, following dt or exactly at dt, depending on the values of lookBack, acceptEqual
	//	returns null if looking forward beyond the end or backward beyond the start of the database data
	//	when required, incrementally loads data in pages from the database
	//	if acceptEqual is set to true will return a datapoint if it exactly matches par.dt, otherwise will always look forwards or backwards
	async lookupDataPoint(par)
	{
		throw "Not implemented.";
	}

	async getAllDataStartMs()
	{
		throw "Not implemented.";
	}

	async getAllDataEndMs()
	{
		throw "Not implemented.";
	}


	getRawDataInRange(range)
	{
		throw "Not implemented.";
	}

	getRawDataPoint(dt)
	{
		throw "Not implemented.";
	}


	clear(preserveAdapativeDataRange)
	{
		throw "Not implemented.";
	}


	get rawData()
	{
		throw "Not implemented.";
	}

	get authorativeRange()
	{
		throw "Not implemented.";
	}

	get adaptiveRange()
	{
		throw "Not implemented.";
	}

	get cachedDataPointCount()
	{
		throw "Not implemented.";
	}


	get sampleIntervalDef()
	{
		return this._sampleIntervalDef;
	}
}
