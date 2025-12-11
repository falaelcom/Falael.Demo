"use strict";

include("StdAfx.js");

class ForexAgent_Channels extends ForexAgent
{
	constructor(produceFeature, updateLastFeature, config)
	{
		super(produceFeature, updateLastFeature);

		this._startTolerance = config.startTolerance;

		this._trendLines = {};
		this._featureLog = {};
		this._featureLog_maxFeatureCount = 16;
	}


	_trendLine_add(featureType, featureData)
	{
		var featureList = this._trendLines[featureType];
		if (!featureList)
		{
			featureList = [];
			this._trendLines[featureType] = featureList;
		}
		else if (Array.find(featureList, function (item) { return item.x0 == featureData.x0 }) != -1)
		{
			throw "Invalid operation.";
		}
		featureList[0] = featureData;
		//featureList.push(featureData);
		//featureList.sort(function (left, right) { return left.x0 - right.x0; });
		//log(6661, featureList);
	}

	_trendLine_set(featureType, featureData)
	{
		var featureList = this._trendLines[featureType];
		if (!featureList)
		{
			featureList = [];
			this._trendLines[featureType] = featureList;
		}
		//else 
		//{
		//	var foundAt = Array.find(featureList, function (item) { return item.x0 == featureData.x0 });
		//	if (foundAt != -1)
		//	{
		//		featureList[foundAt] = featureData;
		//		//log(66621, featureList);
		//		return;
		//	}
		//}
		featureList[0] = featureData;
		//featureList.push(featureData);
		//featureList.sort(function (left, right) { return left.x0 - right.x0; });
		//log(66622, featureList);
	}

	_trendLine_remove(featureType, featureData)
	{
		var featureList = this._trendLines[featureType];
		if (!featureList) return;
		featureList.length = 0;
		//var foundAt = Array.find(featureList, function (item) { return item.x0 == featureData.x0 });
		//if (foundAt == -1) return;
		//var result = featureList.splice(foundAt, 1);
		////log(6663, featureList);
		//return result[0];
	}

	_sanitizeTrendLines()
	{
		//var count = 0;
		//for (var key in this._trendLines)
		//{
		//	var list = this._trendLines[key];
		//	count += list.length;
		//}
		//log(444, count);

		//for (var featureType in this._trendLines)
		//{
		//	var featureList = this._trendLines[featureType];
		//	for (var length = featureList.length, i = 0; i < length; ++i)
		//	{
		//		var item = featureList[i];
		//		if (this.currentDataPoint.dt < item.x0 || this.currentDataPoint.dt > item.x1)
		//		{
		//			log(111, "remove trendline", new Date(this.currentDataPoint.dt), new Date(item.x0), new Date(item.x1));
		//			this._trendLine_remove(featureType, item);
		//		}
		//	}
		//}
	}


	_featureLog_add(featureType, featureData)
	{
		var featureList = this._featureLog[featureType];
		if (!featureList)
		{
			featureList = [];
			this._featureLog[featureType] = featureList;
		}
		featureList.push(featureData);
		if (featureList.length > this._featureLog_maxFeatureCount) featureList.shift();
	}

	_featureLog_remove(featureType, featureData)
	{
		var featureList = this._featureLog[featureType];
		if (!featureList) return;
		var foundAt = featureList.indexOf(featureData);
		if (foundAt == -1) throw "Invalid operation.";
		var result = featureList.splice(foundAt, 1);
		return result[0];
	}

	_featureLog_query(featureType, support_x0, resistance_x0)
	{
		var featureList = this._featureLog[featureType];
		if (!featureList) return null;
		var foundAt = Array.find(featureList, function (item) { return item.supportLine.x0 == support_x0 && item.resistanceLine.x0 == resistance_x0; });
		return foundAt == -1 ? null : featureList[foundAt];
	}

	_featureLog_queryByX0(trendLineFeatureType, x0)
	{
		var featureType = ForexAgent_Channels._getChannelFeatureType(trendLineFeatureType);

		var featureList = this._featureLog[featureType];
		if (!featureList) return null;
		for (var length = featureList.length, i = 0; i < length; ++i)
		{
			var item = featureList[i];
			if (ForexAgent_Channels._isSupportLine(trendLineFeatureType))
			{
				if (item.supportLine.x0 == x0) return item;
			}
			else
			{
				if (item.resistanceLine.x0 == x0) return item;
			}
		}
	}


	_findMatchingTrendLines(featureType)
	{
		var featureList = this._trendLines[featureType];
		if (!featureList) return;

		var pairFeatureType = ForexAgent_Channels._getPairFeatureType(featureType);
		var pairFeatureList = this._trendLines[pairFeatureType];
		if (!pairFeatureList) return;

		var supportFeatureType = ForexAgent_Channels._isSupportLine(featureType) ? featureType : pairFeatureType;
		var resistanceFeatureType = ForexAgent_Channels._isSupportLine(featureType) ? pairFeatureType : featureType;
		var supportFeatureList = ForexAgent_Channels._isSupportLine(featureType) ? featureList : pairFeatureList;
		var resistanceFeatureList = ForexAgent_Channels._isSupportLine(featureType) ? pairFeatureList : featureList;

		var result = null;
		for (var length = supportFeatureList.length, i = 0; i < length; ++i)
		{
			var supportFeatureData = supportFeatureList[i];
			//if (this._featureLog_queryByX0(supportFeatureType, supportFeatureData.x0)) continue;
			for (var jlength = resistanceFeatureList.length, j = 0; j < jlength; ++j)
			{
				var resistanceFeatureData = resistanceFeatureList[j];
				//if (this._featureLog_queryByX0(resistanceFeatureType, resistanceFeatureData.x0)) continue;
				var distance = Math.abs(supportFeatureData.x0 - resistanceFeatureData.x0);
				if (distance < this._startTolerance)
				{
					result =
					{
						supportLine: supportFeatureData,
						supportFeatureType: supportFeatureType,
						resistanceLine: resistanceFeatureData,
						resistanceFeatureType: resistanceFeatureType,
					};
					return result;
				}
			}
		}
		return result;
	}


	_onProduceFeature(featureType, featureData)
	{
		featureData.emergenceTime = this.currentDataPoint.dt;

		//log(555, "_onProduceFeature", featureType, featureData);
		this.onProduceFeature(featureType, featureData);
	}

	_onUpdateLastFeature(featureType, featureData)
	{
		featureData.lastChangeTime = this.currentDataPoint.dt;

		//log(556, "_onUpdateLastFeature", featureType, featureData);
		this.onUpdateLastFeature(featureType, featureData);
	}


	static _getPairFeatureType(featureType)
	{
		switch (featureType)
		{
			case EForexFeatureType.Ask_Close_UpwardSupportLine: return EForexFeatureType.Bid_Close_UpwardResistanceLine;
			case EForexFeatureType.Ask_Close_DownwardSupportLine: return EForexFeatureType.Bid_Close_DownwardResistanceLine;
			case EForexFeatureType.Bid_Close_UpwardResistanceLine: return EForexFeatureType.Ask_Close_UpwardSupportLine;
			case EForexFeatureType.Bid_Close_DownwardResistanceLine: return EForexFeatureType.Ask_Close_DownwardSupportLine;

			default: throw "Not implemented.";
		}
	}

	static _isSupportLine(featureType)
	{
		switch (featureType)
		{
			case EForexFeatureType.Ask_Close_UpwardSupportLine:
			case EForexFeatureType.Ask_Close_DownwardSupportLine:
				return true;
			default:
				return false;
		}
	}

	static _getChannelFeatureType(trendLineFeatureType)
	{
		switch (trendLineFeatureType)
		{
			case EForexFeatureType.Ask_Close_UpwardSupportLine: return EForexFeatureType.Close_UpwardChannel;
			case EForexFeatureType.Ask_Close_DownwardSupportLine: return EForexFeatureType.Close_DownwardChannel;
			case EForexFeatureType.Bid_Close_UpwardResistanceLine: return EForexFeatureType.Close_UpwardChannel;
			case EForexFeatureType.Bid_Close_DownwardResistanceLine: return EForexFeatureType.Close_DownwardChannel;

			default: throw "Not implemented.";
		}
	}


	reset()
	{
		this._trendLines = {};
		this._featureLog = {};
	}

	feed(featureType, featureData)
	{
		//log(777, "feed", featureType, featureData);

		this._sanitizeTrendLines();
		this._trendLine_add(featureType, featureData);

		var matchingPair = this._findMatchingTrendLines(featureType);
		if (!matchingPair) return;

		var producedFeatureType = ForexAgent_Channels._getChannelFeatureType(featureType);
		var existingFeature = this._featureLog_query(producedFeatureType, matchingPair.supportLine.x0, matchingPair.resistanceLine.x0);
		if (existingFeature)
		{
			if (ForexAgent_Channels._isSupportLine(featureType))
			{
				if (existingFeature.supportLine.x0 == featureData.x0)
				{
					existingFeature.supportLine = featureData;
					this._onUpdateLastFeature(producedFeatureType, existingFeature);
				}
			}
			else
			{
				if (existingFeature.resistanceLine.x0 == featureData.x0)
				{
					existingFeature.resistanceLine = featureData;
					this._onUpdateLastFeature(producedFeatureType, existingFeature);
				}
			}
			return;
		}

		var producedFeatureData = this._produce(matchingPair);
		this._onProduceFeature(producedFeatureType, producedFeatureData);
		this._featureLog_add(producedFeatureType, producedFeatureData);
	}

	updateLast(featureType, featureData)
	{
		//log(778, "updateLast", featureType, featureData);

		this._trendLine_set(featureType, featureData);
		this._sanitizeTrendLines();

		var matchingPair = this._findMatchingTrendLines(featureType);
		if (!matchingPair) return;

		var producedFeatureType = ForexAgent_Channels._getChannelFeatureType(featureType);
		var existingFeature = this._featureLog_query(producedFeatureType, matchingPair.supportLine.x0, matchingPair.resistanceLine.x0);
		if (existingFeature)
		{
			if (ForexAgent_Channels._isSupportLine(featureType))
			{
				if (existingFeature.supportLine.x0 == featureData.x0)
				{
					existingFeature.supportLine = featureData;
					this._onUpdateLastFeature(producedFeatureType, existingFeature);
				}
			}
			else
			{
				if (existingFeature.resistanceLine.x0 == featureData.x0)
				{
					existingFeature.resistanceLine = featureData;
					this._onUpdateLastFeature(producedFeatureType, existingFeature);
				}
			}
			return;
		}
	}

	removeLast(featureType, featureData)
	{
		//log(779, "removeLast", featureType, featureData);

		this._trendLine_remove(featureType, featureData);
		this._sanitizeTrendLines();

		var relatedFeature = this._featureLog_queryByX0(featureType);
		if (!relatedFeature) return;

		var producedFeatureType = ForexAgent_Channels._getChannelFeatureType(featureType);
		this._featureLog_remove(producedFeatureType, relatedFeature)
		this._onUpdateLastFeature(producedFeatureType, null);
	}


	_produce(trendLinePair)
	{
		this._trendLine_remove(trendLinePair.supportFeatureType, trendLinePair.supportLine);
		this._trendLine_remove(trendLinePair.resistanceFeatureType, trendLinePair.resistanceLine);
		return new ForexChannel(trendLinePair.supportLine, trendLinePair.resistanceLine);
	}
}
