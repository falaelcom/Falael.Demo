"use strict";

include("StdAfx.js");

//	all ratings and fitness values are in the range [0..1]
class ForexRobotV3
{
	constructor(config)
	{
		this._trendLineRater = config.trendLineRater;

		this._projectionFactor = config.projectionFactor;
		this._minSignificantDataPointCount = config.minSignificantDataPointCount;
		this._extraHistoryDataPointCount = config.extraHistoryDataPointCount;

		this._currentVolatileDataPoint = null;
		this._currentSealedDataPoint = null;
		this._dataPointCache = [];

		this._lineOfBestFitCache = null;
		this._lineOfBestFitCache_details = null;
		this._projectedLineOfBestFitCache = null;

		this._resistance_lineOfBestFitCache = null;
		this._resistance_lineOfBestFitCache_details = null;
		this._resistance_projectedLineOfBestFitCache = null;

		this._sampleIntervalDef = null;
	}


	reset()
	{
		this._currentVolatileDataPoint = null;
		this._currentSealedDataPoint = null;
		this._dataPointCache = [];

		this._lineOfBestFitCache = null;
		this._lineOfBestFitCache_details = null;
		this._projectedLineOfBestFitCache = null;

		this._resistance_lineOfBestFitCache = null;
		this._resistance_lineOfBestFitCache_details = null;
		this._resistance_projectedLineOfBestFitCache = null;
	}

	feedRange(dataPoints)
	{
		for (var length = dataPoints.length, i = 0; i < length; ++i) this.feed(dataPoints[i]);
	}

	//	dataPoint: ForexDataPointV3
	feed(dataPoint)
	{
		this._currentSealedDataPoint = this._currentVolatileDataPoint;
		this._currentVolatileDataPoint = dataPoint;
		
		if (this._currentSealedDataPoint)
		{
			this._dataPointCache.push(this._currentSealedDataPoint);
			this._dataPointAdded(this._currentSealedDataPoint);
		}
	}

	//	dataPoint: ForexDataPointV3
	updateLast(dataPoint)
	{
		this._currentVolatileDataPoint = dataPoint;
	}


	_dataPointAdded(dataPoint)
	{
		if (this._dataPointCache.length < this._minSignificantDataPointCount) return;

		var candidates = [];

		for (var length = this._dataPointCache.length, i = this._minSignificantDataPointCount; i < length; ++i) candidates.push(this._processProjectedSample(i, this._buildProjectedSample(i, true, true)));

		if (!candidates.length) return;
		var raterContext =
		{
			dataPointCount: 2 * this._dataPointCache.length,	//	samples contain 2 points (one of ask and one for bid) per data point
			sampleIntervalDef: this._sampleIntervalDef,
		};
		var bestFitCandidate = candidates[0];
		for (var length = candidates.length, i = 1; i < length; ++i)
		{
			var item = candidates[i];
			item.fitness = this._trendLineRater.rate(raterContext, item);
			if (item.fitness > bestFitCandidate.fitness) bestFitCandidate = item;
		}

		this._projectedLineOfBestFitCache = bestFitCandidate.lineOfBestFit;
		this._lineOfBestFitCache = this._unprojectLinedef(bestFitCandidate.lineOfBestFit);
		this._lineOfBestFitCache_details = bestFitCandidate;

		this._debug_rotatedExtremums = this._queryRotatedExtremums(

			this._buildProjectedSample(bestFitCandidate.sampleSize, false, true),	//	the projected sample of bid values for peak detection (sell when at highest price using the bid price)
			this._buildProjectedSample(bestFitCandidate.sampleSize, true, false),	//	the projected sample of ask values for valley detection (buy when at lowest price using the ask price)
			bestFitCandidate.lineOfBestFit
		);

		//	find best match, if any
		//	what next?
	}

	//	uses ask low values and bid high values
	_processProjectedSample(sampleSize, projectedSample)
	{
		//	CHANNELS
		//	for this projectedSample build a channel
		//	collect all channels for all samples
		//	assign a fitness score to every channel (calculated internally by the channel)
		//	select the most fit channel
		//	trim the dp cache to the selected channel's length + this._extraHistoryDataPointCount

		//	POSITIONS
		//	test within the selected current channel the current datapoint's fitness for position opening
		//	for every open position, test within the origin channel the current datapoint's fitness for position closing

		var lineOfBestFit = LinearFunction.buildLineOfBestFit(projectedSample);
		var result =
		{
			sampleSize: sampleSize,
			sample: this._unprojectSample(projectedSample),
			projectedSample: projectedSample,
			lineOfBestFit: lineOfBestFit,
			fitness: -1,
		};
		return result;
	}

	_buildProjectedSample(sampleSize, includeAsk, includeBid)
	{
		if (!includeAsk && !includeBid) throw "Bad arguments.";

		var result = [];
		for (var max = this._dataPointCache.length - 1, i = this._dataPointCache.length - sampleSize; i <= max; ++i)
		{
			var dataPoint = this._dataPointCache[i];
			if (includeAsk) result.push(
			{
				x: this._projectX(dataPoint.raw.dt),
				y: this._projectY(dataPoint.raw.al),
			});
			if (includeBid) result.push(
			{
				x: this._projectX(dataPoint.raw.dt),
				y: this._projectY(dataPoint.raw.bh),
			});
		}
		return result;
	}

	_queryRotatedExtremums(peakProjectedSample, valleyProjectedSample, projectedLineOfBestFit)
	{
		var result =
		{
			projectedPeaks: [],
			projectedValleys: [],
			peaks: null,
			valleys: null,
		};

		if (peakProjectedSample.length >= 3)
		{
			for (var length = peakProjectedSample.length - 1, i = 1; i < length; ++i)
			{
				var last = peakProjectedSample[i - 1];
				var distance_last = projectedLineOfBestFit.distanceTo(last) * (projectedLineOfBestFit.isBelowPoint(last) ? 1 : -1);

				var current = peakProjectedSample[i];
				var distance_current = projectedLineOfBestFit.distanceTo(current) * (projectedLineOfBestFit.isBelowPoint(current) ? 1 : -1);

				var next = peakProjectedSample[i + 1];
				var distance_next = projectedLineOfBestFit.distanceTo(next) * (projectedLineOfBestFit.isBelowPoint(next) ? 1 : -1);

				if (distance_current > 0) 
				{
					if (distance_last <= distance_current && distance_next <= distance_current) result.projectedPeaks.push(current);
				}
			}
		}

		if (valleyProjectedSample.length >= 3)
		{
			for (var length = valleyProjectedSample.length - 1, i = 1; i < length; ++i)
			{
				var last = valleyProjectedSample[i - 1];
				var distance_last = projectedLineOfBestFit.distanceTo(last) * (projectedLineOfBestFit.isBelowPoint(last) ? 1 : -1);

				var current = valleyProjectedSample[i];
				var distance_current = projectedLineOfBestFit.distanceTo(current) * (projectedLineOfBestFit.isBelowPoint(current) ? 1 : -1);

				var next = valleyProjectedSample[i + 1];
				var distance_next = projectedLineOfBestFit.distanceTo(next) * (projectedLineOfBestFit.isBelowPoint(next) ? 1 : -1);

				if (distance_current < 0) 
				{
					if (distance_last >= distance_current && distance_next >= distance_current) result.projectedValleys.push(current);
				}
			}
		}

		result.peaks = this._unprojectSample(result.projectedPeaks);
		result.valleys = this._unprojectSample(result.projectedValleys);

		return result;
	}

	_projectX(x)
	{
		return x;
	}

	_projectY(y)
	{
		return this._projectionFactor * y;
	}

	_unprojectX(x)
	{
		return x;
	}

	_unprojectY(y)
	{
		return y / this._projectionFactor;
	}

	_unprojectPoint(point)
	{
		return { x: this._unprojectX(point.x), y: this._unprojectY(point.y) };
	}

	_unprojectLinedef(linedef)
	{
		if (linedef.isParalellOy) return linedef;

		var x0 = 0;
		var x1 = 100000000;	//	must be large enough to mitigate precision errors of floating point operations
		var y0 = linedef.calc(x0);
		var y1 = linedef.calc(x1);

		var x0u = this._unprojectX(x0);
		var x1u = this._unprojectX(x1);
		var y0u = this._unprojectY(y0);
		var y1u = this._unprojectY(y1);

		return LinearFunction.buildLineFromPoints({ x: x0u, y: y0u }, { x: x1u, y: y1u });
	}

	_unprojectSample(projectedSample)
	{
		var result = [];
		for (var length = projectedSample.length, i = 0; i < length; ++i) result.push(this._unprojectPoint(projectedSample[i]));
		return result;
	}


	get lineOfBestFitCache()
	{
		return this._lineOfBestFitCache;
	}

	get lineOfBestFitCache_details()
	{
		return this._lineOfBestFitCache_details;
	}

	get projectedLineOfBestFitCache()
	{
		return this._projectedLineOfBestFitCache;
	}


	get sampleIntervalDef()
	{
		return this._sampleIntervalDef;
	}

	set sampleIntervalDef(value)
	{
		this._sampleIntervalDef = value;
	}
}
