"use strict";

include("StdAfx.js");

class ForexAgent_TradeDecisions extends ForexAgent
{
	constructor(produceFeature, updateLastFeature, config)
	{
		super(produceFeature, updateLastFeature);

		this._epsylonFactor_tradeOpen = config.epsylonFactor_tradeOpen;
		this._epsylonFactor_tradeExit = config.epsylonFactor_tradeClose;
		this._toleranceTime_channelFinished = config.toleranceTime_channelFinished;
		this._tradeAmount = config.tradeAmount;

		this._state = ForexAgent_TradeDecisions.STATE_PENDING;
		this._channel = null;
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
	}

	feed(featureType, featureData)
	{
		//log(111, ForexAgent_TradeDecisions.STATE.toString(this._state), featureType, featureData);

		switch (this._state)
		{
			case ForexAgent_TradeDecisions.STATE_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
					case EForexFeatureType.Bid_Close_Peak:
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = featureData;
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = featureData;
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						var dataPoint = featureData.underlying.dataPoints[featureData.underlying.dataPoints.length - 1];
						var hitTestResult = this._channel.hitTest(dataPoint.dt, dataPoint.ac);
						if (hitTestResult.isAboveSupportLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen)) break;
						this._produce("buy, open", { x: dataPoint.dt, y: dataPoint.ac });
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_POSITION;
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = featureData;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = featureData;
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_POSITION:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						var hitTestResult = this._channel.hitTest(featureData.dt, featureData.bc);
						if (!hitTestResult.isBelowResistanceLine && hitTestResult.distanceToResistanceLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen))
						{
							this._produce("sell, close 1.1", { x: featureData.dt, y: featureData.bc });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
							break;
						}
						if (featureData.dt > this._channel.x1 + this._toleranceTime_channelFinished)
						{
							this._produce("sell, close 1.2", { x: featureData.dt, y: featureData.bc });
							this._state = ForexAgent_TradeDecisions.STATE_PENDING;
							break;
						}
						if (!hitTestResult.isAboveSupportLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeExit))
						{
							this._produce("sell, close 2", { x: featureData.dt, y: featureData.bc });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
							break;
						}
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						break;
					case EForexFeatureType.Close_DownwardChannel:
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						var dataPoint = featureData.underlying.dataPoints[featureData.underlying.dataPoints.length - 1];
						var hitTestResult = this._channel.hitTest(dataPoint.dt, dataPoint.bc);
						if (hitTestResult.isBelowResistanceLine && hitTestResult.distanceToResistanceLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen)) break;
						this._produce("sell, open", { x: dataPoint.dt, y: dataPoint.bc });
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_POSITION;
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = featureData;
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = featureData;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_POSITION:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						var hitTestResult = this._channel.hitTest(featureData.dt, featureData.ac);
						if (!hitTestResult.isBelowResistanceLine && hitTestResult.distanceToResistanceLine > this._channel.getEpsylon(this._epsylonFactor_tradeExit))
						{
							this._produce("buy, close 2", { x: featureData.dt, y: featureData.ac });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
							break;
						}
						if (!hitTestResult.isAboveSupportLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen))
						{
							this._produce("buy, close 1.1", { x: featureData.dt, y: featureData.ac });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
							break;
						}
						if (featureData.dt > this._channel.x1 + this._toleranceTime_channelFinished)
						{
							this._produce("buy, close 1.2", { x: featureData.dt, y: featureData.ac });
							this._state = ForexAgent_TradeDecisions.STATE_PENDING;
							break;
						}
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						break;
					case EForexFeatureType.Close_DownwardChannel:
						break;
					default:
						throw "Not implemented.";
				}
				break;
			default:
				throw "Not implemented.";
			
		}
	}

	updateLast(featureType, featureData)
	{
		//log(112, ForexAgent_TradeDecisions.STATE.toString(this._state));

		switch (this._state)
		{
			case ForexAgent_TradeDecisions.STATE_PENDING:
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						var dataPoint = featureData.underlying.dataPoints[featureData.underlying.dataPoints.length - 1];
						var hitTestResult = this._channel.hitTest(dataPoint.dt, dataPoint.ac);
						if (hitTestResult.isBelowResistanceLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen)) break;
						this._produce("buy, open", { x: dataPoint.dt, y: dataPoint.ac });
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_POSITION;
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = featureData;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = featureData;
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_POSITION:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						var hitTestResult = this._channel.hitTest(featureData.dt, featureData.bc);
						if (!hitTestResult.isBelowResistanceLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen))
						{
							this._produce("sell, close 1.1", { x: featureData.dt, y: featureData.bc });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
							break;
						}
						if (featureData.dt > this._channel.x1 + this._toleranceTime_channelFinished)
						{
							this._produce("sell, close 1.2", { x: featureData.dt, y: featureData.bc });
							this._state = ForexAgent_TradeDecisions.STATE_PENDING;
							break;
						}
						if (!hitTestResult.isAboveSupportLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeExit))
						{
							this._produce("sell, close 2", { x: featureData.dt, y: featureData.bc });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
							break;
						}
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						break;
					case EForexFeatureType.Close_DownwardChannel:
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						var dataPoint = featureData.underlying.dataPoints[featureData.underlying.dataPoints.length - 1];
						var hitTestResult = this._channel.hitTest(dataPoint.dt, dataPoint.bc);
						if (hitTestResult.isAboveSupportLine && hitTestResult.distanceToResistanceLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen)) break;
						this._produce("sell, open", { x: dataPoint.dt, y: dataPoint.bc });
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_POSITION;
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = featureData;
						this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = featureData;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_POSITION:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						var hitTestResult = this._channel.hitTest(featureData.dt, featureData.ac);
						if (!hitTestResult.isBelowResistanceLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeExit))
						{
							this._produce("buy, close 2", { x: featureData.dt, y: featureData.ac });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
							break;
						}
						if (!hitTestResult.isAboveSupportLine && hitTestResult.distanceToSupportLine > this._channel.getEpsylon(this._epsylonFactor_tradeOpen))
						{
							this._produce("buy, close 1.1", { x: featureData.dt, y: featureData.ac });
							this._state = ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING;
							break;
						}
						if (featureData.dt > this._channel.x1 + this._toleranceTime_channelFinished)
						{
							this._produce("buy, close 1.2", { x: featureData.dt, y: featureData.ac });
							this._state = ForexAgent_TradeDecisions.STATE_PENDING;
							break;
						}
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						break;
					case EForexFeatureType.Close_DownwardChannel:
						break;
					default:
						throw "Not implemented.";
				}
				break;
			default:
				throw "Not implemented.";

		}
	}

	removeLast(featureType, featureData)
	{
		//log(113, ForexAgent_TradeDecisions.STATE.toString(this._state));

		switch (this._state)
		{
			case ForexAgent_TradeDecisions.STATE_PENDING:
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = null;
						this._state = ForexAgent_TradeDecisions.STATE_PENDING;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = null;
						this._state = ForexAgent_TradeDecisions.STATE_PENDING;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_POSITION:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						break;
					case EForexFeatureType.Close_DownwardChannel:
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						this._channel = null;
						this._state = ForexAgent_TradeDecisions.STATE_PENDING;
						break;
					case EForexFeatureType.Close_DownwardChannel:
						this._channel = null;
						this._state = ForexAgent_TradeDecisions.STATE_PENDING;
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_POSITION:
				switch (featureType)
				{
					case EForexFeatureType.RawData:
						break;
					case EForexFeatureType.Bid_Close_Peak:
						break;
					case EForexFeatureType.Ask_Close_Valley:
						break;
					case EForexFeatureType.Close_UpwardChannel:
						break;
					case EForexFeatureType.Close_DownwardChannel:
						break;
					default:
						throw "Not implemented.";
				}
				break;
			default:
				throw "Not implemented.";

		}
	}


	_produce(tradeType, point)
	{
		//log(111, tradeType, point.x, point.y);
		var featureData =
		{
			underlying: { channel: this._channel },
			x: point.x,
			y: point.y,
			buy: tradeType.indexOf("buy") != -1,
			sell: tradeType.indexOf("sell") != -1,
			open: tradeType.indexOf("open") != -1,
			close: tradeType.indexOf("close") != -1,
		};
		var featureType = null;
		if (featureData.buy && featureData.open) featureType = EForexFeatureType.Buy_OpenTrade_Decision;
		else if (featureData.buy && featureData.close) featureType = EForexFeatureType.Buy_CloseTrade_Decision;
		else if (featureData.sell && featureData.open) featureType = EForexFeatureType.Sell_OpenTrade_Decision;
		else if (featureData.sell && featureData.close) featureType = EForexFeatureType.Sell_CloseTrade_Decision;
		else throw "Invalid operation.";
		this._onProduceFeature(featureType, featureData);
		
	}
}

ForexAgent_TradeDecisions.STATE_PENDING = 1;
ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_PENDING = 2;
ForexAgent_TradeDecisions.STATE_CHANNEL_UPWARD_POSITION = 3;
ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_PENDING = 4;
ForexAgent_TradeDecisions.STATE_CHANNEL_DOWNWARD_POSITION = 5;

ForexAgent_TradeDecisions.STATE =
{
	toString(state)
	{
		for (var key in ForexAgent_TradeDecisions)
		{
			if (key.indexOf("STATE_") == -1) continue;
			if (ForexAgent_TradeDecisions[key] == state) return key;
		}
		throw "Not implemented.";
	}
};
