"use strict";

include("StdAfx.js");

class V3Rater_TrendLine_Concentration extends V3Rater
{
	//	config.distanceRaterFunction(context, distance) - return value must be in [0..1]
	constructor(config)
	{
		super(config);

		//	config.sampleIntervalToDistanceFactorMap[<collectionName>] = <number>
		//	where <collectionName> is as generated in GetForexMetadataCommand, e.g. "forex.sampledData.minute1" or "forex.sampledData.second10"
		this._sampleIntervalToDistanceFactorMap = config.sampleIntervalToDistanceFactorMap;	//	'a' on the notes
	}

	__rate(context, item)
	{
		if (!item) throw "Argument is invalid: item.";
		if (!item.lineOfBestFit) throw "Argument is invalid: item.lineOfBestFit.";
		if (!item.sample) throw "Argument is invalid: item.sample.";

		var dataSet = new MappedArray(item.sample,
		{
			x: function (item) { return item.x; },
			y: function (item) { return item.y; },
		});

		return dataSet.correlationCoefficient("x", "y");
	}

	//	return value is [0, 1]
	static ratePoint_linearDistance(distanceFactor, linedef, point)
	{
		var distance = linedef.distanceTo(point);
		var result = (distanceFactor - distance) / distanceFactor;
		if (result > 1) throw "Invalid operation.";
		if (result < 0) result = 0;
		return result;
	}

	//	return value is [-1, 1]
	static ratePoint_nonlinearDistance1(distanceFactor, linedef, x1, x2, point)
	{
		//	TODO: get the trendline angle (slope)
		//	scale the offsetFromLineMiddle_normalized by the slope, so that 
		//		- for horizontal trendlines offsetFromLineMiddle_normalized becomes 0
		//		- for upward trendlines offsetFromLineMiddle_normalized becomes - before theline middle and + after
		//		- for downward trendlines offsetFromLineMiddle_normalized becomes + before theline middle and - after
		//	normalize the distanceRating to fit in [-1, 1]
		//		- handle +- Infinity values of distanceRating

		var projectedPoint = linedef.orthogonalProjectPoint(point);

		if (projectedPoint.x < x1 || projectedPoint.x > x2) return 0;

		var distance = linedef.distanceTo(point);
		var lineLength = linedef.getDistance(x1, x2);

		var offset = linedef.getDistance(x1, projectedPoint.x);
		var offsetFromLineMiddle = offset - lineLength / 2;
		var offsetFromLineMiddle_normalized = 2 * offsetFromLineMiddle / lineLength;	//	offsetFromLineMiddle_normalized is [-1; 1]
		if (offsetFromLineMiddle_normalized < -1 || offsetFromLineMiddle_normalized > 1) throw "Invalid operation";

		var distanceRating = offsetFromLineMiddle_normalized * Math.exp(distance - distanceFactor) + 1;
		if (distanceRating > 1) return 1;
		if (distanceRating < -1) return -1;
		return distanceRating;

		var result = (distanceFactor - distance) / distanceFactor;
		if (result > 1) throw "Invalid operation.";
		if (result < 0) result = 0;
		return result;
	}

	static get default_sampleIntervalToDistanceFactorMap()
	{
		var result =
		{
			"forex.sampledData.second10": null,
			"forex.sampledData.minute1": 10000,
			"forex.sampledData.minute5": null,
			"forex.sampledData.minute10": null,
			"forex.sampledData.minute15": null,
			"forex.sampledData.minute30": null,
			"forex.sampledData.hour1": null,
			"forex.sampledData.hour4": null,
			"forex.sampledData.day1": null,
			"forex.sampledData.week1": null,
			"forex.sampledData.month1": null,
		};
		return result;
	}


	get sampleIntervalToDistanceFactorMap()
	{
		return this._sampleIntervalToDistanceFactorMap;
	}
}
