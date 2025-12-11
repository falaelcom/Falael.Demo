"use strict";

include("StdAfx.js");

class ChartDataSource extends ChartNode
{
	constructor(id)
	{
		super(id);

		this._dataVersion = null;
		this._validDataVersion = null;
	}


	clear()
	{
		this._dataVersion = null;
		this._validDataVersion = null;
	}


	__validateData()
	{
		this._validDataVersion = this._dataVersion;
	}


	__invalidateData()
	{
		this._dataVersion = newLUID();
	}


	get rawData()
	{
		throw "Not implemented.";
	}

	get dataVersion()
	{
		return this._dataVersion;
	}

	get isValid()
	{
		return this._validDataVersion == this.dataVersion;
	}
}
