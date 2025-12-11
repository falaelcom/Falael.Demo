"use strict";

include("StdAfx.js");

class ForexAgent
{
	constructor(produceFeature, updateLastFeature)
	{
		if (!produceFeature) throw "Argument is null: produceFeature.";
		if (!updateLastFeature) throw "Argument is null: updateLastFeature.";

		this._produceFeature = produceFeature;
		this._updateLastFeature = updateLastFeature;

		this._currentDataPoint = null;
	}


	onProduceFeature(featureType, featureData)
	{
		this._produceFeature(this, { featureType: featureType, featureData: featureData });
	}

	onUpdateLastFeature(featureType, featureData)
	{
		this._updateLastFeature(this, { featureType: featureType, featureData: featureData });
	}


	reset()
	{
	}

	feed(dataPoint)
	{
	}

	updateLast(dataPoint)
	{
	}

	removeLast()
	{
	}


	get currentDataPoint()
	{
		return this._currentDataPoint;
	}

	set currentDataPoint(value)
	{
		this._currentDataPoint = value;
	}
}
