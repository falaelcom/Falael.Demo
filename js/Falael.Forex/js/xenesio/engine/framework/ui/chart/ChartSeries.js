"use strict";

include("StdAfx.js");

class ChartSeries extends ChartElement
{
	constructor(id, zIndex, xAxis, yAxis, seriesTypeId)
	{
		super(id, zIndex, null, null, true, seriesTypeId);

		this._xAxis = xAxis;
		this._yAxis = yAxis;
	}

	get xAxis()
	{
		return this._xAxis;
	}

	get yAxis()
	{
		return this._yAxis;
	}
}
