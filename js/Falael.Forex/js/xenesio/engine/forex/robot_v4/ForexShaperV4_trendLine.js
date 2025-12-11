"use strict";

include("StdAfx.js");

class ForexShaperV4_TrendLine extends ForexShaperV4
{
	constructor(par)
	{
		super(par);

		this._minSignificantDataPointCount = par.minSignificantDataPointCount;

		this._standardDeviationFactor = par.standardDeviationFactor;
		this._standardDeviationRating_weight = par.standardDeviationRating_weight;

		this._correlationCoefficient_biasStrength = par.correlationCoefficient_biasStrength;
		this._correlationCoefficient_weight = par.correlationCoefficient_weight;

		this._normalizedSlope_scaleMin = par.normalizedSlope_scaleMin;
		this._normalizedSlope_scaleMax = par.normalizedSlope_scaleMax;
		this._normalizedSlopeRating_weight = par.normalizedSlopeRating_weight;
	}

	//	returns ForexFeatureV4_TrendLine
	shape(dataPoints)
	{
		if (!dataPoints) throw "Argument is null: dataPoints.";

		if (dataPoints.length < this._minSignificantDataPointCount) return null;

		//	uses ask low values and bid high values
		var rawSample = new MappedArray(dataPoints,
		{
			dt: item => item.raw.dt,
			al: item => item.raw.al,
			bh: item => item.raw.bh,
		});

		var bestMatch = null;
		for (var length = rawSample.length, i = this._minSignificantDataPointCount; i < length; ++i)
		//for (var length = rawSample.length, i = length - 1; i < length; ++i)
		{
			var pointSampleArray = rawSample.toArray({ x: ["dt", "dt"], y: ["al", "bh"] }, length - i);
			var pointSample = new MappedArray(pointSampleArray,
			{
				x: item => item.x,
				y: item => item.y,
			});
			var standardDeviationY = pointSample.standardDeviation("y");

			var line = pointSample.lineOfBestFit("x", "y");

			var correlationCoefficient = Math.abs(pointSample.correlationCoefficient("x", "y"));

			var standardDeviationRating = 1 - (this._standardDeviationFactor / (standardDeviationY + this._standardDeviationFactor));	//	y = 1 - (a / (x + a))
			if (standardDeviationRating < 0 || standardDeviationRating > 1) throw "Assertion failed.";

			var normalizedSlope = line.slope * pointSample.standardDeviation("x");
			var normalizedSlopeRating = 1 - (standardDeviationY / (Math.abs(normalizedSlope) + standardDeviationY ));	//	y = 1 - (a / (x + a))
			var scaleRange = this._normalizedSlope_scaleMax - this._normalizedSlope_scaleMin;
			var normalizedSlopeRating_scaled = (normalizedSlopeRating - this._normalizedSlope_scaleMin) / scaleRange;
			if (normalizedSlopeRating_scaled < 0) normalizedSlopeRating_scaled = 0;
			if (normalizedSlopeRating_scaled > 1) normalizedSlopeRating_scaled = 1;

			var slopeBiasedCorrelationCoefficient = Math.abs(pointSample.slopeBiasedCorrelationCoefficient("x", "y", this._correlationCoefficient_biasStrength));

			var rating = MappedArray.calcWeightedAverage(
			[
				{ weight: this._correlationCoefficient_weight, value: slopeBiasedCorrelationCoefficient},
				{ weight: this._standardDeviationRating_weight, value: standardDeviationRating },
				{ weight: this._normalizedSlopeRating_weight, value: normalizedSlopeRating_scaled },
			]);
			if (rating < 0 || rating > 1) throw "Assertion failed.";

			if (bestMatch && bestMatch.rating >= rating) continue;

			bestMatch = new ForexFeatureV4_TrendLine(
			{
				line: line,
				rating: rating,
				rawSample: rawSample.clone(),
				offsetInRawSample: i,
				pointSample: pointSample,
			});
		}

		return bestMatch;
	}
}
