"use strict";

include("StdAfx.js");

class V3Rater_TrendLine_Length extends V3Rater
{
	constructor(config)
	{
		super(config);
	}

	__rate(context, item)
	{
		if (!context) throw "Argument is invalid: context.";
		if (context.dataPointCount === void (0)) throw "Argument is invalid: context.dataPointCount.";
		if (!item) throw "Argument is invalid: item.";
		if (!item.projectedSample) throw "Argument is invalid: item.projectedSample.";

		return item.projectedSample.length / context.dataPointCount;
	}
}
