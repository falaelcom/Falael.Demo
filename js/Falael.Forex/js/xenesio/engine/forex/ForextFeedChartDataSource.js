"use strict";

include("StdAfx.js");

class ForextFeedChartDataSource extends ChartDataSource
{
	constructor(id)
	{
		super(id);

		this._authorativeRange = new Range(-1, -1);
		this._adaptiveRange = new Range(-1, -1);
		this._dataBuffer = new DataBuffer({ authorativePropertyName: "dt" });
	}


	clear()
	{
		super.clear();

		this._authorativeRange = new Range(-1, -1);
		this._adaptiveRange = new Range(-1, -1);
		this._dataBuffer.clear();
	}

	feed(dataPoints)
	{
		if (!dataPoints.length) return;
		this._dataBuffer.merge(dataPoints, new Range(dataPoints[0].dt, dataPoints[dataPoints.length - 1].dt));

		var min = this._adaptiveRange.min == -1 ? Infinity : this._adaptiveRange.min;
		var max = this._adaptiveRange.max == -1 ? -Infinity : this._adaptiveRange.max;
		for (var length = dataPoints.length, i = 0; i < length; ++i)
		{
			var item = dataPoints[i];
			if (!Number.isInteger(item.dt)) throw "Argument is invalid: dataPoints.";
			if (item.bid < min) min = item.bid;
			if (item.ask > max) max = item.ask;
		}
		this._adaptiveRange.min = min;
		this._adaptiveRange.max = max;
		this.__invalidateData();
	}

	feedTick(dt, ask, bid, sampleIntervalDef)
	{
		if (!Number.isInteger(dt)) throw "Argument is invalid: dt.";

		if (!sampleIntervalDef)
		{
			this._dataBuffer.append(
			{
				dt: dt,
				ask: ask,
				bid: bid,
			});
		}
		else
		{
			var sampleRangeStartMoment = EDateTimeUnit.floorMoment(moment(dt), sampleIntervalDef.unit, sampleIntervalDef.length).valueOf();

			var currentSampledDataPoint;
			if (this._dataBuffer.length)
			{
				currentSampledDataPoint = this._dataBuffer.last;
			}
			if (this._dataBuffer.length && currentSampledDataPoint.dt >= sampleRangeStartMoment)
			{
				currentSampledDataPoint.raw.ac = ask;
				currentSampledDataPoint.raw.ah = Math.max(currentSampledDataPoint.raw.ah, ask);
				currentSampledDataPoint.raw.al = Math.min(currentSampledDataPoint.raw.al, ask);
				currentSampledDataPoint.raw.bc = bid;
				currentSampledDataPoint.raw.bh = Math.max(currentSampledDataPoint.raw.bh, bid);
				currentSampledDataPoint.raw.bl = Math.min(currentSampledDataPoint.raw.bl, bid);

				currentSampledDataPoint.ask = ask;
				currentSampledDataPoint.bid = bid;
			}
			else
			{
				var item =
				{
					raw:
					{
						pid: this._instrumentId,
						dt: sampleRangeStartMoment,
						ac: ask,
						ah: ask,
						al: ask,
						ao: ask,
						bc: bid,
						bh: bid,
						bl: bid,
						bo: bid,
					},
					dt: sampleRangeStartMoment,
					ask: ask,
					bid: bid,
				};
				this._dataBuffer.append(item);
			}
		}

		var min = this._adaptiveRange.min == -1 ? Infinity : this._adaptiveRange.min;
		var max = this._adaptiveRange.max == -1 ? -Infinity : this._adaptiveRange.max;
		if (bid < min) min = bid;
		if (ask > max) max = ask;
		this._adaptiveRange.min = min;
		this._adaptiveRange.max = max;

		this.__invalidateData();
	}


	get rawData()
	{
		var range = this._authorativeRange.roundUp(0.5);
		return this._dataBuffer.toArray(range.min, range.max);
	}


	get authorativeRange()
	{
		return this._authorativeRange;
	}

	set authorativeRange(value)
	{
		if (!value) throw "Argument is null: value.";
		if (this._authorativeRange.equals(value)) return;
		this._authorativeRange = value;
		this.__invalidateData();
	}


	get adaptiveRange()
	{
		return this._adaptiveRange;
	}
}
