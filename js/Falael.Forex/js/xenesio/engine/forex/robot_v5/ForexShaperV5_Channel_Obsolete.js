"use strict";

include("StdAfx.js");

class ForexShaperV5_ChannelV0 extends ForexShaperV5
{
	//	par.priceSourcing: EPriceSourcingV5
	//	par.dataPointSelector: EDataPointSelectorV5
	constructor(par)
	{
		super(par);

		this._minSignificantDataPointCount = par.minSignificantDataPointCount;
		this._priceSourcing = par.priceSourcing;
		this._dataPointSelector = par.dataPointSelector;
		this._variability_windowSize = par.variability_windowSize;
		this._spi1_variability_lowerThreshold = par.spi1_variability_lowerThreshold;

		this._spi1_standardDeviation_thresholdFactor = par.spi1_standardDeviation_thresholdFactor;
	}

	//	returns ForexFeatureV5_Channel
	shape(context, dataPoints, par)
	{
		if (!dataPoints) throw "Argument is null: dataPoints.";

		if (dataPoints.length < this._minSignificantDataPointCount) return null;

		var rawSample;
		switch (this._priceSourcing)
		{
			case EPriceSourcingV5.HighLow:
				//	uses ask-low values and bid-high values
				rawSample = new MappedArray(dataPoints,
				{
					dt: item => item.raw.dt,
					ask: item => item.raw.al,
					bid: item => item.raw.bh,
				});
				break;
			case EPriceSourcingV5.Open:
				rawSample = new MappedArray(dataPoints,
				{
					dt: item => item.raw.dt,
					ask: item => item.raw.ao,
					bid: item => item.raw.bo,
				});
				break;
			case EPriceSourcingV5.Close:
				rawSample = new MappedArray(dataPoints,
				{
					dt: item => item.raw.dt,
					ask: item => item.raw.ac,
					bid: item => item.raw.bc,
				});
				break;
			case EPriceSourcingV5.Tick:
				rawSample = new MappedArray(dataPoints,
				{
					dt: item => item.dt,
					ask: item => item.ask,
					bid: item => item.bid,
				});
				break;
			default:
				throw "Not implemented.";
		}

		var selectionStart = 0;
		var selectionLength = rawSample.length - selectionStart;
		var pointSample = null;
		var significantPointSample = null;
		switch (this._dataPointSelector)
		{
			case EDataPointSelectorV5.Ask_All:
				pointSample = rawSample
					.map({ x: ["dt"], y: ["ask"] }, selectionStart, selectionLength);
				significantPointSample = pointSample;
				break;
			case EDataPointSelectorV5.Ask_Extremums:
				pointSample = rawSample
					.map({ x: ["dt"], y: ["ask"] }, selectionStart, selectionLength);
				significantPointSample = pointSample
					.extremumSamples("x", "y", { singlePoints: true }).extremums;
				break;
			case EDataPointSelectorV5.Bid_All:
				pointSample = rawSample
					.map({ x: ["dt"], y: ["bid"] }, selectionStart, selectionLength);
				significantPointSample = pointSample;
				break;
			case EDataPointSelectorV5.Bid_Extremums:
				pointSample = rawSample
					.map({ x: ["dt"], y: ["bid"] }, selectionStart, selectionLength);
				significantPointSample = pointSample
					.extremumSamples("x", "y", { singlePoints: true }).extremums;
				break;
			case EDataPointSelectorV5.AskBid_All:
				pointSample = rawSample
					.map({ x: ["dt", "dt"], y: ["ask", "bid"] }, selectionStart, selectionLength);
				significantPointSample = pointSample;
				break;
			case EDataPointSelectorV5.AskBid_Extremums:
				pointSample = rawSample
					.map({ x: ["dt", "dt"], y: ["ask", "bid"] }, selectionStart, selectionLength);
				significantPointSample = pointSample
					.extremumSamples("x", "y", { singlePoints: true }).extremums;
				break;
			case EDataPointSelectorV5.AskBid_SmartExtremums:	//	includes ask peaks and bid valleys
				pointSample = rawSample
					.map({ x: ["dt", "dt"], y: ["ask", "bid"] }, selectionStart, selectionLength);
				var subSample = rawSample.subSample(selectionStart, selectionLength);
				var pointSample_ask_peaks = subSample
					.map({ x: ["dt"], y: ["ask"] })
					.extremumSamples("x", "y", { excludeValleys: true, singlePoints: true }).extremums;
				var pointSample_bid_valleys = subSample
					.map({ x: ["dt"], y: ["bid"] })
					.extremumSamples("x", "y", { excludePeaks: true, singlePoints: true }).extremums;
				var significantPointSampleArray = pointSample_ask_peaks.toArray().concat(pointSample_bid_valleys.toArray());
				significantPointSampleArray.sort((left, right) => left.x - right.x || left.y - right.y);
				significantPointSample = new MappedArray(significantPointSampleArray);
				break;
			default:
				throw "Not implemented.";
		}

		//	build trendline
		var trendLine = significantPointSample.lineOfBestFit("x", "y");

		//	build correlation sample
		var correlationData = [];
		var directionData = [];
		var buffer = [];
		var sample = null;
		var currentDt = null;
		for (var length = pointSample.length, i = 0; i < length; ++i)
		{
			var item = pointSample.getAt(i);
			buffer.push(item);
			if (currentDt === item.x) continue;
			currentDt = item.x;
			if (i < this._minSignificantDataPointCount) continue;
			sample = new MappedArray(buffer);
			var correlationCoefficient = sample.correlationCoefficient("x", "y");
			correlationData.push({ x: item.x, y: correlationCoefficient });
			var correlationSign = sample.correlationSign("x", "y");
			directionData.push({ x: item.x, y: correlationSign * correlationCoefficient });
		}
		var correlationSample = new MappedArray(correlationData);

		//	build variability sample
		var variabilitySample = correlationSample.variabilitySample(new Range(0, 1), "x", "y", this._variability_windowSize);

		//	build a sample of the difference between the correlation coefficient and correlation coefficient variability at any given point where variabilitySample has data
		var cvDeltaData = [];
		for (var length = variabilitySample.length, vi = 0; vi < length; ++vi)
		{
			var x = variabilitySample.getAt(vi, "x");
			var ci = vi + this._variability_windowSize;
			if (x != correlationSample.getAt(ci, "x")) throw "Invalid operation.";
			var cy = correlationSample.getAt(ci, "y");
			var vy = variabilitySample.getAt(vi, "value");
			cvDeltaData.push({ x: x, value: cy - vy });
		}
		var cvDeltaSample = new MappedArray(cvDeltaData);

		//	build a sample combining data for the movements (first derivatives) of the correlation coefficient and the correlation coefficient variability
		//	every datapoint is considered as part of a "zone" only when the correlation is moving up and variability is moving down
		var cvZoningData = [];

		var correlationDerivativeSample = correlationSample.derivativeSample("x", "y");
		var correlationDerivativeSample_uniformMax = Math.max(correlationDerivativeSample.max("y"), Math.abs(correlationDerivativeSample.min("y")));
		var correlationDerivativeSample_normal = correlationDerivativeSample.transformSample(function (item) { return { x: item.x, y: item.y / correlationDerivativeSample_uniformMax }; });

		var variabilityDerivativeSample = variabilitySample.derivativeSample("x", "value");
		var variabilityDerivativeSample_uniformMax = Math.max(variabilityDerivativeSample.max("value"), Math.abs(variabilityDerivativeSample.min("value")));
		var variabilityDerivativeSample_normal = variabilityDerivativeSample.transformSample(function (item) { return { x: item.x, value: item.value / variabilityDerivativeSample_uniformMax }; });

		for (var length = variabilityDerivativeSample_normal.length, vi = 0; vi < length; ++vi)
		{
			var x = variabilityDerivativeSample_normal.getAt(vi, "x");
			var ci = vi + this._variability_windowSize;
			if (x != correlationDerivativeSample_normal.getAt(ci, "x")) throw "Invalid operation.";
			var dcy = correlationDerivativeSample_normal.getAt(ci, "y");
			var dvy = variabilityDerivativeSample_normal.getAt(vi, "value");

			cvZoningData.push(
			{
				x: x,
				dcy: dcy,
				dvy: dvy,
				zoned: (dcy > 0 && dvy < 0),
			});
		}
		var cvZoningSample = new MappedArray(cvZoningData);

		//	find first low point in variability
		var spi1_info = null;
		for (var length = variabilitySample.length, i = 0; i < length; ++i)
		{
			var y = variabilitySample.getAt(i, "value");
			if (!spi1_info && y < this._spi1_variability_lowerThreshold) spi1_info =
			{
				item: variabilitySample.getAt(i),
			};
			if (spi1_info) break;
		}

		//	find out-of-channel datapoint after the first low point
		var derangedItemInfo = null;
		if (spi1_info)
		{
			var sdy = pointSample.standardDeviation("y");
			var sdThesholdOffset = this._spi1_standardDeviation_thresholdFactor * sdy;
			var trendSign = Math.sign(trendLine.a);
			var derangedItemIndex = -1;
			if (trendSign > 0)
			{
				derangedItemIndex = pointSample.indexOf((item) =>
				{
					if (item.x < spi1_info.item.x) return false;
					var baseY = trendLine.calc(item.x);
					return item.y < baseY - sdThesholdOffset;
				});
			}
			else if (trendSign < 0)
			{
				derangedItemIndex = pointSample.indexOf((item) =>
				{
					if (item.x < spi1_info.item.x) return false;
					var baseY = trendLine.calc(item.x);
					return item.y > baseY + sdThesholdOffset;
				});
			}
			else
			{
				derangedItemIndex = pointSample.indexOf((item) =>
				{
					if (item.x < spi1_info.item.x) return false;
					var baseY = trendLine.calc(item.x);
					return item.y < baseY - sdThesholdOffset || item.y > baseY + sdThesholdOffset;
				});
			}
			if (derangedItemIndex != -1)
			{
				derangedItemInfo =
				{
					item: pointSample.getAt(derangedItemIndex),
				};
			}
		}

		var result = new ForexFeatureV5_Channel(
		{
			trendLine: trendLine,
			significantPointSample: significantPointSample,
			pointSample: pointSample,
			correlationSample: correlationSample,
			directionSample: new MappedArray(directionData),
			variability_windowSize: this._variability_windowSize,
			variabilitySample: variabilitySample,
			cvDeltaSample: cvDeltaSample,
			cvZoningSample: cvZoningSample,
			variability_spi1: spi1_info,
			datapoint_spi2: derangedItemInfo,
		});

		return result;
	}


	get minSignificantDataPointCount()
	{
		return this._minSignificantDataPointCount;
	}
}
