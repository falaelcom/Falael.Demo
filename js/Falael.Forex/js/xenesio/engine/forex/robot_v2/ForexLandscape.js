"use strict";

include("StdAfx.js");

class ForexLandscape
{
	constructor(messageBus)
	{
		this._messageBus = messageBus;
		this._data = {};

		//this._debug_counter = 0;
	}


	reset()
	{
		this._data = {};
		this._messageBus.sendMessage(null, this, { actionType: EForexLandscapeActionType.Clear })
	}

	feed(featureType, featureData)
	{
		var featureList = this._data[featureType];
		if (!featureList)
		{
			featureList = [];
			this._data[featureType] = featureList;
		}
		featureList.push(featureData);
		//log(511, "feed", EForexFeatureType.toString(featureType), featureData);
		//if (featureType == EForexFeatureType.Ask_Close_UpwardResistanceLine) log(511, "feed", EForexFeatureType.toString(featureType), featureData);
		//if (featureType == EForexFeatureType.Ask_Close_UpwardResistanceLine)
		//{
		//	++this._debug_counter;
		//	log(511, "feed", EForexFeatureType.toString(featureType), featureData);
		//}
		this._messageBus.sendMessage(featureType, this, { actionType: EForexLandscapeActionType.Append, featureType: featureType, featureData: featureData, featureList: featureList })
	}

	updateLast(featureType, featureData)
	{
		var featureList = this._data[featureType];
		if (!featureList) throw "Invalid operation.";
		if (!featureList.length) throw "Invalid operation.";
		featureList[featureList.length - 1] = featureData;
		//if (featureType == EForexFeatureType.Ask_Close_UpwardResistanceLine) log(512, "updateLast", EForexFeatureType.toString(featureType), featureData);
		this._messageBus.sendMessage(featureType, this, { actionType: EForexLandscapeActionType.Replace, featureType: featureType, featureData: featureData, featureList: featureList })
	}

	removeLast(featureType)
	{
		var featureList = this._data[featureType];
		if (!featureList) throw "Invalid operation.";
		if (!featureList.length) throw "Invalid operation.";
		var featureData = featureList.pop();
		//if (featureType == EForexFeatureType.Ask_Close_UpwardResistanceLine) log(513, "removeLast", EForexFeatureType.toString(featureType), featureData);
		this._messageBus.sendMessage(featureType, this, { actionType: EForexLandscapeActionType.Remove, featureType: featureType, featureData: featureData, featureList: featureList })
	}

	getFeatures(featureType)
	{
		return this._data[featureType] || [];
	}

	getFeatures_multipleTypes(featureTypes)
	{
		var result = [];
		for (var length = featureTypes.length, i = 0; i < length; ++i) result = result.concat(this.getFeatures(featureTypes[i]));
		return result;
	}
}
