"use strict";

include("StdAfx.js");

class ForexAgent_Extremums extends ForexAgent
{
	constructor(produceFeature, updateLastFeature)
	{
		super(produceFeature, updateLastFeature);

		this._dataPoints = [];
		this._lastProducedFeatureType = {};
	}


	_onProduceFeature(metric, featureType, featureData)
	{
		this.onProduceFeature(featureType, featureData);
		this._lastProducedFeatureType[metric] = featureData ? featureType : null;
	}

	_onUpdateLastFeature(metric, featureType, featureData)
	{
		this.onUpdateLastFeature(featureType, featureData);
		this._lastProducedFeatureType[metric] = featureData ? featureType : null;
	}


	reset()
	{
		this._dataPoints = [];
		this._lastProducedFeatureType = {};
	}

	feed(dataPoint)
	{
		this._dataPoints.push(dataPoint);
		if (this._dataPoints.length < 3)
		{
			return;
		}
		if (this._dataPoints.length > 4)
		{
			this._dataPoints.shift();
		}

		this._produceFromMetric(EForexFeatureType.Ask_Close_Peak, EForexFeatureType.Ask_Close_Valley, "ac", this._onProduceFeature.bind(this), false);
		this._produceFromMetric(EForexFeatureType.Bid_Close_Peak, EForexFeatureType.Bid_Close_Valley, "bc", this._onProduceFeature.bind(this), false);
	}

	updateLast(dataPoint)
	{
		if (this._dataPoints.length < 3)
		{
			return;
		}

		if (this._lastProducedFeatureType["ac"]) this._produceFromMetric(EForexFeatureType.Ask_Close_Peak, EForexFeatureType.Ask_Close_Valley, "ac", this._onUpdateLastFeature.bind(this), true);
		else this._produceFromMetric(EForexFeatureType.Ask_Close_Peak, EForexFeatureType.Ask_Close_Valley, "ac", this._onProduceFeature.bind(this), false);

		if (this._lastProducedFeatureType["bc"]) this._produceFromMetric(EForexFeatureType.Bid_Close_Peak, EForexFeatureType.Bid_Close_Valley, "bc", this._onUpdateLastFeature.bind(this), true);
		else this._produceFromMetric(EForexFeatureType.Bid_Close_Peak, EForexFeatureType.Bid_Close_Valley, "bc", this._onProduceFeature.bind(this), false);
	}


	_produceFromMetric(peakFeatureType, valleyFeatureType, metric, emitFunction, emitNull)
	{
		var v0 = this._dataPoints[this._dataPoints.length - 3][metric];
		var v1 = this._dataPoints[this._dataPoints.length - 2][metric];
		var v2 = this._dataPoints[this._dataPoints.length - 1][metric];
		var dt = this._dataPoints[this._dataPoints.length - 2].dt;

		if (v1 > v0 && v1 > v2)
		{
			emitFunction(metric, peakFeatureType,
			{
				underlying: { dataPoints: this._dataPoints.slice(0), anchorIndex: this._dataPoints.length - 2 },
				x: dt,
				y: v1,
			});
			return;
		}
		else if (v1 < v0 && v1 < v2)
		{
			emitFunction(metric, valleyFeatureType,
			{
				underlying: { dataPoints: this._dataPoints.slice(0), anchorIndex: this._dataPoints.length - 2 },
				x: dt,
				y: v1,
			});
			return;
		}
		else if (v1 == v0 && this._dataPoints.length > 3)
		{
			var vn1 = this._dataPoints[this._dataPoints.length - 4][metric];
			if (v1 > vn1 && v1 > v2)
			{
				emitFunction(metric, peakFeatureType,
				{
					underlying: { dataPoints: this._dataPoints.slice(0), anchorIndex: this._dataPoints.length - 2 },
					x: dt,
					y: v1,
				});
				return;
			}
			else if (v1 < vn1 && v1 < v2)
			{
				emitFunction(metric, valleyFeatureType,
				{
					underlying: { dataPoints: this._dataPoints.slice(0), anchorIndex: this._dataPoints.length - 2 },
					x: dt,
					y: v1,
				});
				return;
			}
		}

		if (emitNull && this._lastProducedFeatureType[metric])
		{
			emitFunction(metric, this._lastProducedFeatureType[metric], null);
			return;
		}

		this._lastProducedFeatureType[metric] = null;
	}
}
