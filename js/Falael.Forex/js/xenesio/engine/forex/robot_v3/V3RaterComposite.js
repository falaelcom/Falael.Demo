"use strict";

include("StdAfx.js");

class V3RaterComposite extends V3Rater
{
	constructor(config)
	{
		super(config);

		this._raters = config.raters;
	}

	//	https://www.wikihow.com/Calculate-Weighted-Average
	__rate(context, item)
	{
		var weightSum = 0;
		var weightedRatingSum = 0;
		for (var length = this._raters.length, i = 0; i < length; ++i)
		{
			var rater = this._raters[i];
			weightSum += rater.weight;
			weightedRatingSum += rater.weight * rater.rate(context, item);
		}
		return weightedRatingSum / weightSum;
	}
}
