"use strict";

include("StdAfx.js");

class ChartDataSource_Buffer extends ChartDataSource
{
	constructor(id)
	{
		super(id);

		this._data = [];
	}


	clear()
	{
		super.clear();
		this._data = [];
	}


	add(dataPoint)
	{
		this._data.push(dataPoint);
		this.__invalidateData();
	}

	addRange(dataPointArray)
	{
		this._data = this._data.concat(dataPointArray);
		this.__invalidateData();
	}


	get rawData()
	{
		return this._data;
	}
}
