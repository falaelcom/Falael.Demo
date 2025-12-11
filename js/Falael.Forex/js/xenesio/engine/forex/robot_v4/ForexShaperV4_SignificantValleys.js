"use strict";

include("StdAfx.js");

class ForexShaperV4_SignificantValleys extends ForexShaperV4
{
	constructor(par)
	{
		super(par);

		this._epsylon = par.epsylon;
	}

	//	returns ForexFeatureV4_Extremums
	//	ForexFeatureV4_Extremums.extremumSample structure: [prevDataPoint1, extremumDataPoint1, nextDataPoint1, prevDataPoint2, extremumDataPoint2, nextDataPoint2, ...]
	shape(dataPoints, minX)
	{
		if (!dataPoints) throw "Argument is null: pointSample.";

		var dataPointsInRange;
		if (minX)
		{
			dataPointsInRange = [];
			for (var length = dataPoints.length, i = 0; i < length; ++i)
			{
				var item = dataPoints[i];
				if (item.dt < minX) continue;
				dataPointsInRange.push(item);
			}
		}
		else dataPointsInRange = dataPoints;
		if (dataPointsInRange.length < 3) return null;

		var pointSample = new MappedArray(dataPointsInRange,
		{
			x: item => item.raw.dt,
			y: item => item.raw.al,
		});

		return new ForexFeatureV4_Extremums(
		{
			extremumSample: pointSample.extremumSamples("x", "y",
			{
				excludePeaks: true,
				oneSided: true,
				oneSided_strict: true,
				splitLine: pointSample.lineOfBestFit("x", "y"),
				epsylon: this._epsylon,
			}).extremums,
			extremumTypes: EExtremumTypesV4.Valleys,
		});
	}
}
