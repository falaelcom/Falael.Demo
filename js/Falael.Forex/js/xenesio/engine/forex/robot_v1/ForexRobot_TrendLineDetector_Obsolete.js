"use strict";

include("StdAfx.js");

class ForexRobot_TrendLineDetector_Obsolete extends ForexRobot_Obsolete
{
	constructor(lineSpread, minDataPointCount, maxDataPointCount, tolerableDiscrepancyCount)
	{
		super();

		this._lineSpread = lineSpread;
		this._minDataPointCount = minDataPointCount;
		this._maxDataPointCount = maxDataPointCount;
		this._tolerableDiscrepancyCount = tolerableDiscrepancyCount;

		this._peaks = [];
		this._valleys = [];

		this._upwardResistanceLines = [];
		this._downwardResistanceLines = [];
		this._upwardSupportLines = [];
		this._downwardSupportLines = [];
	}


	__onFeed(unprocessedDataPointCount)
	{
		if (this.dataCache.length < this._minDataPointCount) return;

		//	full reset (reimplement with incremental build of the collections)
		this._peaks = [];
		this._valleys = [];

		this._upwardResistanceLines = [];
		this._downwardResistanceLines = [];
		this._upwardSupportLines = [];
		this._downwardSupportLines = [];

		//	detect peaks and valleys
		for (var length = this.dataCache.length - 1, i = 1; i < length; ++i)
		{
			var dataPoint0 = this.dataCache[i - 1];
			var dataPoint1 = this.dataCache[i];
			var dataPoint2 = this.dataCache[i + 1];

			if (dataPoint1[1] > dataPoint0[1] && dataPoint1[1] > dataPoint2[1]) this._peaks.push(dataPoint1);
			else if (dataPoint1[1] < dataPoint0[1] && dataPoint1[1] < dataPoint2[1]) this._valleys.push(dataPoint1);
			else if (dataPoint1[1] == dataPoint0[1] && i > 1)
			{
				if (dataPoint1[1] > dataPoint2[1] && dataPoint1[1] > this.dataCache[i - 2][1]) this._peaks.push(dataPoint1);
				else if (dataPoint1[1] < dataPoint2[1] && dataPoint1[1] < this.dataCache[i - 2][1]) this._valleys.push(dataPoint1);
			}
			else if (dataPoint1[1] == dataPoint2[1] && i < length - 1)
			{
				if (dataPoint1[1] > dataPoint0[1] && dataPoint1[1] > this.dataCache[i + 2][1]) this._peaks.push(dataPoint1);
				else if (dataPoint1[1] < dataPoint0[1] && dataPoint1[1] < this.dataCache[i + 2][1]) this._valleys.push(dataPoint1);
			}
		}

		//	detect upward resistence lines
		this._processExtremeumCollection(this._peaks, this._upwardResistanceLines, true);

		//	detect downward resistence lines
		this._processExtremeumCollection(this._peaks, this._downwardResistanceLines, false);

		//	detect upward support lines
		this._processExtremeumCollection(this._valleys, this._upwardSupportLines, true);

		//	detect downward support lines
		this._processExtremeumCollection(this._valleys, this._downwardSupportLines, false);
	}

	_processExtremeumCollection(collSrc, collDest, isUpward)
	{
		for (var length = collSrc.length, i = 0; i < length; ++i)
		{
			for (var lookForwardPointCount = Math.min(this._maxDataPointCount, collSrc.length - i); lookForwardPointCount >= this._minDataPointCount; --lookForwardPointCount)
			{
				var dataPointSample = [];
				var discrepancyCount = 0;
				var lastDataPoint = collSrc[i];
				var lastSignificantDataPointIndex = i;
				var abortFlag = false;
				for (var j = 0; j < lookForwardPointCount; ++j)
				{
					var dataPoint = collSrc[i + j];
					var left = isUpward ? dataPoint[1] : lastDataPoint[1];
					var right = isUpward ? lastDataPoint[1] : dataPoint[1];
					if (left < right)
					{
						++discrepancyCount;
						if (discrepancyCount > this._tolerableDiscrepancyCount)
						{
							abortFlag = true;
							break;
						}
						continue;
					}
					discrepancyCount = 0;
					dataPointSample.push(dataPoint);
					lastSignificantDataPointIndex = i + j;
					lastDataPoint = dataPoint;
				}
				if (abortFlag)
				{
					continue;
				}
				if (dataPointSample.length < this._minDataPointCount)
				{
					continue;
				}
				var linedef = this._lineOfBestFit(dataPointSample);
				if (this._isDataPointSampleWithinSpread(linedef, dataPointSample))
				{
					collDest.push(
					{
							linedef: linedef,
						dataPointSample: dataPointSample,
					});
					i = lastSignificantDataPointIndex - 1;
					break;
				}
			}
		}
	}

	_isDataPointSampleWithinSpread(linedef, dataPointSample)
	{
		for (var length = dataPointSample.length, i = 0; i < length; ++i)
		{
			var item = dataPointSample[i];
			var d = this._distanceToLine(linedef, item);
			if (d > this._lineSpread / 2)
			{
				return false;
			}
		}
		return true;
	}

	//	https://www.varsitytutors.com/hotmath/hotmath_help/topics/line-of-best-fit
	_lineOfBestFit(dataPoints)
	{
		var sumX = 0;
		var sumY = 0;
		for (var length = dataPoints.length, i = 0; i < length; ++i)
		{
			var item = dataPoints[i];
			sumX += item[0]; 
			sumY += item[1]; 
		}
		var meanX = sumX / dataPoints.length;
		var meanY = sumY / dataPoints.length;

		var m_sum1 = 0;
		var m_sum2 = 0;
		for (var length = dataPoints.length, i = 0; i < length; ++i)
		{
			var item = dataPoints[i];
			m_sum1 += (item[0] - meanX) * (item[1] - meanY);
			m_sum2 += (item[0] - meanX) * (item[0] - meanX);
		}
		var m = m_sum1 / m_sum2;
		var b = meanY - m * meanX;

		return {
			a: m,
			b: b
		};
	}

	//	https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line - Another formula
	_distanceToLine(linedef, dataPoint)
	{
		var m = linedef.a;
		var k = linedef.b;
		var x0 = dataPoint[0];
		var y0 = dataPoint[1];
		return Math.abs(k + m * x0 - y0) / Math.sqrt(1 + m * m);
	}


	get lineSpread()
	{
		return this._lineSpread;
	}

 	get minDataPointCount()
	{
		return this._minDataPointCount;
	}

	get maxDataPointCount()
	{
		return this._maxDataPointCount;
	}

	get tolerableDiscrepancyCount()
	{
		return this._tolerableDiscrepancyCount;
	}


	get peaks()
	{
		return this._peaks;
	}

	get valleys()
	{
		return this._valleys;
	}


	get upwardResistanceLines()
	{
		return this._upwardResistanceLines;
	}

	get downwardResistanceLines()
	{
		return this._downwardResistanceLines;
	}

	get upwardSupportLines()
	{
		return this._upwardSupportLines;
	}

	get downwardSupportLines()
	{
		return this._downwardSupportLines;
	}
}
