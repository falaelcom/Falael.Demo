"use strict";

include("StdAfx.js");

//	unlike ForexAgent_Extremums, produces only one type of features; multiple instances of this class are required to produce all possible trend line types;
//	the robot must feed every ForexAgent_TrendLines instance with the corresponding extremum type
class ForexAgent_TrendLines extends ForexAgent
{
	constructor(produceFeature, updateLastFeature, isUpward, outputFeatureType, config)
	{
		super(produceFeature, updateLastFeature);

		this._outputFeatureType = outputFeatureType;
		this._isUpward = isUpward;

		this._lineSpread = config.lineSpread;
		this._minDataPointCount = config.minDataPointCount;
		this._tolerableDiscrepancyCount = config.tolerableDiscrepancyCount;

		this._extremums = [];
		this._state = ForexAgent_TrendLines.STATE_INPUT;

		this._featureDataCache = null;

		this._revert_state = null;
		this._revert_featureDataCache = null;
	}


	_onProduceFeature(featureType, featureData)
	{
		this.onProduceFeature(featureType, featureData);
	}

	_onUpdateLastFeature(featureType, featureData)
	{
		this.onUpdateLastFeature(featureType, featureData);
	}


	reset()
	{
		this._extremums = [];
		this._state = ForexAgent_TrendLines.STATE_INPUT;

		this._featureDataCache = null;

		this._revert_state = null;
		this._revert_featureDataCache = null;
	}

	feed(extremum)
	{
		//log(777, "feed", ForexAgent_TrendLines.STATE.toString(this._state), this._featureDataCache, extremum);

		this._revert_state = this._state;
		this._revert_featureDataCache = this._featureDataCache;

		switch (this._state)
		{
			case ForexAgent_TrendLines.STATE_INPUT:
				this._extremums.push(extremum);
				this._state = ForexAgent_TrendLines.STATE_SEQUENCE;
				break;

			case ForexAgent_TrendLines.STATE_SEQUENCE:
				var trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence && this._extremums.length > this._tolerableDiscrepancyCount)
				{
					this._extremums.splice(0, this._extremums.length - this._tolerableDiscrepancyCount);
				}
				this._extremums.push(extremum);
				trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence)
				{
					break;
				}
				this._featureDataCache = this._produce(trendingSequence);
				if (!this._featureDataCache)
				{
					this._state = ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE;
					break;
				}
				this._onProduceFeature(this._outputFeatureType, this._featureDataCache);
				this._state = ForexAgent_TrendLines.STATE_FEATURE;
				break;

			case ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE:
				this._extremums.push(extremum);
				var trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence)
				{
					this._state = ForexAgent_TrendLines.STATE_SEQUENCE;
					break;
				}
				this._featureDataCache = this._produce(trendingSequence);
				if (!this._featureDataCache)
				{
					break;
				}
				this._onProduceFeature(this._outputFeatureType, this._featureDataCache);
				this._state = ForexAgent_TrendLines.STATE_FEATURE;
				break;

			case ForexAgent_TrendLines.STATE_FEATURE:
				this._extremums.push(extremum);
				var trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence)
				{
					this._state = ForexAgent_TrendLines.STATE_SEQUENCE;
					break;
				}
				this._featureDataCache = this._produce(trendingSequence);
				if (!this._featureDataCache)
				{
					this._extremums = [this._extremums[this._extremums.length - 1]];
					this._state = ForexAgent_TrendLines.STATE_SEQUENCE;
					break;
				}
				this._onUpdateLastFeature(this._outputFeatureType, this._featureDataCache);
				break;

			default:
				throw "Not implemented.";
		}
	}

	updateLast(extremum)
	{
		//log(778, "updateLast", ForexAgent_TrendLines.STATE.toString(this._state), this._featureDataCache, extremum);

		switch (this._state)
		{
			case ForexAgent_TrendLines.STATE_INPUT:
				throw "Invalid operation.";

			case ForexAgent_TrendLines.STATE_SEQUENCE:
				trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence)
				{
					break;
				}
				this._featureDataCache = this._produce(trendingSequence);
				if (!this._featureDataCache)
				{
					this._state = ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE;
					break;
				}
				this._onProduceFeature(this._outputFeatureType, this._featureDataCache);
				this._state = ForexAgent_TrendLines.STATE_FEATURE;
				break;

			case ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE:
				var trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence)
				{
					this._state = ForexAgent_TrendLines.STATE_SEQUENCE;
					break;
				}
				this._featureDataCache = this._produce(trendingSequence);
				if (!this._featureDataCache)
				{
					break;
				}
				this._onProduceFeature(this._outputFeatureType, this._featureDataCache);
				this._state = ForexAgent_TrendLines.STATE_FEATURE;
				break;

			case ForexAgent_TrendLines.STATE_FEATURE:
				var trendingSequence = ForexAgent_TrendLines._getTrendingSequence(this._extremums, this._isUpward, this._tolerableDiscrepancyCount);
				if (!trendingSequence)
				{
					this._onUpdateLastFeature(this._outputFeatureType, null);
					this._state = ForexAgent_TrendLines.STATE_SEQUENCE;
					break;
				}
				this._featureDataCache = this._produce(trendingSequence);
				if (!this._featureDataCache)
				{
					this._onUpdateLastFeature(this._outputFeatureType, null);
					this._state = ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE;
					break;
				}
				this._onUpdateLastFeature(this._outputFeatureType, this._featureDataCache);
				break;

			default:
				throw "Not implemented.";
		}
	}

	removeLast()
	{
		//log(779, "removeLast", ForexAgent_TrendLines.STATE.toString(this._state), this._featureDataCache);

		switch (this._state)
		{
			case ForexAgent_TrendLines.STATE_INPUT:
				throw "Invalid operation.";

			case ForexAgent_TrendLines.STATE_SEQUENCE:
			case ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE:
				this._extremums.pop();
				if (!this._extremums.length)
				{
					this._state = ForexAgent_TrendLines.STATE_INPUT;
					break;
				}

				this._state = this._revert_state;
				this._featureDataCache = this._revert_featureDataCache;
				break;

			case ForexAgent_TrendLines.STATE_FEATURE:
				this._extremums.pop();
				if (!this._extremums.length)
				{
					this._onUpdateLastFeature(this._outputFeatureType, null);
					this._state = ForexAgent_TrendLines.STATE_INPUT;
					break;
				}
				this._state = this._revert_state;
				this._featureDataCache = this._revert_featureDataCache;
				if (!this._featureDataCache) this._onUpdateLastFeature(this._outputFeatureType, null);
				break;

			default:
				throw "Not implemented.";
		}

		this._revert_state = null;
		this._revert_featureDataCache = null;
	}


	setLineSpread(value)
	{
		this._lineSpread = value;
	}


	_produce(trendingSequence)
	{
		if (trendingSequence.length < this._minDataPointCount)
		{
			return null;
		}

		var linedef = LinearFunction.buildLineOfBestFit(trendingSequence);
		if (!linedef.arePointsWithinSpread(trendingSequence, this._lineSpread))
		{
			return null;
		}

		var startExtremum = this._extremums[0];
		var endExtremum = this._extremums[this._extremums.length - 1];
		var result =
		{
			underlying:
			{
				extremums: this._extremums.slice(0),
				tolerableDiscrepancyCount: this._tolerableDiscrepancyCount,
				minDataPointCount: this._minDataPointCount,
				lineSpread: this._lineSpread
			},
			x0: startExtremum.x,
			x1: endExtremum.x,
			linedef: linedef,
		};
		return result;
	}


	static _getTrendingSequence(sequence, isUpward, tolerableDiscrepancyCount)
	{
		var result = [sequence[0]];
		var discrepancyCount = 0;
		for (var length = sequence.length, i = 1; i < length; ++i)
		{
			var item = sequence[i];
			if (isUpward)
			{
				if (sequence[i - 1].y > item.y)
				{
					++discrepancyCount;
					if (discrepancyCount > tolerableDiscrepancyCount)
					{
						//window.dbgchart.debug_clear();
						return null;
					}
					continue;
				}
			}
			else
			{
				if (sequence[i - 1].y < item.y)
				{
					++discrepancyCount;
					if (discrepancyCount > tolerableDiscrepancyCount)
					{
						//window.dbgchart.debug_clear();
						return null;
					}
					continue;
				}
			}
			result.push(item);
		}

		if (result.length <= 1)
		{
			//window.dbgchart.debug_clear();
			return null;
		}

		//window.dbgchart.debug_clear();
		//log(99999999999, result.length);
		//for (var length = result.length, i = 0; i < length; ++i)
		//{
		//	var item = result[i];
		//	window.dbgchart.debug_draw(
		//	{
		//		primitive: "triangle",
		//		modelX: item.x,
		//		modelY: item.y,
		//		size: 5,
		//		zIndex: 10,
		//		style: { fill: "red", },
		//		lineStyle: { color: "black", width: 1, },
		//	});
		//}
		//window.dbgchart.refresh();

		//if (result.length == 5)
		//{
		//	ForexAgent_TrendLines._getTrendingSequence(sequence, isUpward, tolerableDiscrepancyCount);
		//}

		return result;
	}
}

ForexAgent_TrendLines.STATE_INPUT = 1;
ForexAgent_TrendLines.STATE_SEQUENCE = 2;
ForexAgent_TrendLines.STATE_TRENDING_SEQUENCE = 3;
ForexAgent_TrendLines.STATE_FEATURE = 4;

ForexAgent_TrendLines.STATE =
{
	toString(state)
	{
		for (var key in ForexAgent_TrendLines)
		{
			if (key.indexOf("STATE_") == -1) continue;
			if (ForexAgent_TrendLines[key] == state) return key;
		}
		throw "Not implemented.";
	}
};
