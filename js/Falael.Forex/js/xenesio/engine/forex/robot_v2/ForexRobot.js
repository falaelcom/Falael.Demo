"use strict";

include("StdAfx.js");

class ForexRobot
{
	constructor(config)
	{
		this._trendLineSpread = config.trendLineSpread;

		this._messageBus = new ForexMessageBus();
		this._landscape = new ForexLandscape(this._messageBus);
		this._currentDataPoint = null;

		this._agents = [];

		//	ForexAgent_Extremums
		this._agent_extremums = new ForexAgent_Extremums(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this)
		);
		this._agents.push(this._agent_extremums);
		this._messageBus.subscribe(EForexFeatureType.RawData, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_extremums.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_extremums.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					throw "Invalid operation.";
				case EForexLandscapeActionType.Clear:
					this._agent_extremums.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Ask_Close_UpwardResistanceLine
		this._agent_trendLines_Acur = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			true,
			EForexFeatureType.Ask_Close_UpwardResistanceLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Acur);
		this._messageBus.subscribe(EForexFeatureType.Ask_Close_Peak, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Acur.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Acur.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Acur.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Acur.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Ask_Close_DownwardResistanceLine
		this._agent_trendLines_Acdr = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			false,
			EForexFeatureType.Ask_Close_DownwardResistanceLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Acdr);
		this._messageBus.subscribe(EForexFeatureType.Ask_Close_Peak, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Acdr.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Acdr.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Acdr.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Acdr.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Ask_Close_UpwardSupportLine
		this._agent_trendLines_Acus = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			true,
			EForexFeatureType.Ask_Close_UpwardSupportLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Acus);
		this._messageBus.subscribe(EForexFeatureType.Ask_Close_Valley, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Acus.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Acus.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Acus.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Acus.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Ask_Close_DownwardSupportLine
		this._agent_trendLines_Acds = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			false,
			EForexFeatureType.Ask_Close_DownwardSupportLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Acds);
		this._messageBus.subscribe(EForexFeatureType.Ask_Close_Valley, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Acds.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Acds.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Acds.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Acds.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Bid_Close_UpwardResistanceLine
		this._agent_trendLines_Bcur = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			true,
			EForexFeatureType.Bid_Close_UpwardResistanceLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Bcur);
		this._messageBus.subscribe(EForexFeatureType.Bid_Close_Peak, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Bcur.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Bcur.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Bcur.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Bcur.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Bid_Close_DownwardResistanceLine
		this._agent_trendLines_Bcdr = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			false,
			EForexFeatureType.Bid_Close_DownwardResistanceLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Bcdr);
		this._messageBus.subscribe(EForexFeatureType.Bid_Close_Peak, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Bcdr.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Bcdr.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Bcdr.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Bcdr.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Bid_Close_UpwardSupportLine
		this._agent_trendLines_Bcus = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			true,
			EForexFeatureType.Bid_Close_UpwardSupportLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Bcus);
		this._messageBus.subscribe(EForexFeatureType.Bid_Close_Valley, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Bcus.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Bcus.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Bcus.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Bcus.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TrendLines - Bid_Close_DownwardSupportLine
		this._agent_trendLines_Bcds = new ForexAgent_TrendLines(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			false,
			EForexFeatureType.Bid_Close_DownwardSupportLine,

			{
				lineSpread: this._trendLineSpread,
				minDataPointCount: 3,
				tolerableDiscrepancyCount: 1,
			}
		);
		this._agents.push(this._agent_trendLines_Bcds);
		this._messageBus.subscribe(EForexFeatureType.Bid_Close_Valley, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_trendLines_Bcds.feed(args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_trendLines_Bcds.updateLast(args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_trendLines_Bcds.removeLast();
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_trendLines_Bcds.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_Channels
		this._agent_channels = new ForexAgent_Channels(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			{
				startTolerance: 1000 * 60 * 10,	//	10 min
			}
		);
		this._agents.push(this._agent_channels);
		var sourceFeatureTypes =
		[
			//EForexFeatureType.Ask_Close_UpwardResistanceLine,
			EForexFeatureType.Ask_Close_UpwardSupportLine,
			//EForexFeatureType.Ask_Close_DownwardResistanceLine,
			EForexFeatureType.Ask_Close_DownwardSupportLine,
			EForexFeatureType.Bid_Close_UpwardResistanceLine,
			//EForexFeatureType.Bid_Close_UpwardSupportLine,
			EForexFeatureType.Bid_Close_DownwardResistanceLine,
			//EForexFeatureType.Bid_Close_DownwardSupportLine,
		];
		this._messageBus.subscribeMany(sourceFeatureTypes, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_channels.feed(args.featureType, args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_channels.updateLast(args.featureType, args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_channels.removeLast(args.featureType, args.featureData);
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_channels.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));

		//	ForexAgent_TradeDecisions
		this._agent_tradeDecisions = new ForexAgent_TradeDecisions(

			function produceFeature(sender, args)
			{
				this._landscape.feed(args.featureType, args.featureData);
			}.bind(this),

			function updateLastFeature(sender, args)
			{
				if (args.featureData) this._landscape.updateLast(args.featureType, args.featureData);
				else this._landscape.removeLast(args.featureType);
			}.bind(this),

			{
				epsylonFactor_tradeOpen: 0.1,
				epsylonFactor_tradeExit: 0.2,
				toleranceTime_channelFinished: 1000 * 60 * 7, //	7 min
				tradeAmount: 10000,
			}
		);
		this._agents.push(this._agent_tradeDecisions);
		var sourceFeatureTypes =
		[
			EForexFeatureType.RawData,
			EForexFeatureType.Bid_Close_Peak,
			EForexFeatureType.Ask_Close_Valley,
			EForexFeatureType.Close_UpwardChannel,
			EForexFeatureType.Close_DownwardChannel
		];
		this._messageBus.subscribeMany(sourceFeatureTypes, function (sender, args)
		{
			switch (args.actionType)
			{
				case EForexLandscapeActionType.Append:
					this._agent_tradeDecisions.feed(args.featureType, args.featureData);
					break;
				case EForexLandscapeActionType.Replace:
					this._agent_tradeDecisions.updateLast(args.featureType, args.featureData);
					break;
				case EForexLandscapeActionType.Remove:
					this._agent_tradeDecisions.removeLast(args.featureType, args.featureData);
					break;
				case EForexLandscapeActionType.Clear:
					this._agent_tradeDecisions.reset();
					break;
				default:
					throw "Not implemented.";
			}
		}.bind(this));
	}


	reset()
	{
		this._landscape.reset();
	}

	feed(dataPoint)
	{
		this.currentDataPoint = dataPoint;
		this._landscape.feed(EForexFeatureType.RawData, dataPoint);
	}

	updateLast(dataPoint)
	{
		this._landscape.updateLast(EForexFeatureType.RawData, dataPoint);
	}


	static _convertSampleIntervalDefToLineSpread(value)
	{
		var base = 0.0004;
		switch (value.collectionName)
		{
			case "forex.sampledData.second10":
				return base;
			case "forex.sampledData.minute1":
				return base * 12;
			case "forex.sampledData.minute5":
				return base * 30 / 2.2;
			case "forex.sampledData.minute10":
				return base * 60 / 2.4;
			case "forex.sampledData.minute15":
				return base * 90 / 2.6;
			case "forex.sampledData.minute30":
				return base * 180 / 3;
			case "forex.sampledData.hour1":
				return base * 6 * 60 / 4;
			case "forex.sampledData.hour4":
				return base * 6 * 60 * 4 / 5;
			case "forex.sampledData.day1":
				return base * 6 * 60 * 24 / 8;
			case "forex.sampledData.week1":
				return base * 6 * 60 * 24 * 7 / 9;
			case "forex.sampledData.month1":
				return base * 6 * 60 * 24 * 30 / 10;
			default:
				throw "Not implemented.";
		}
	}

	setSampleIntervalDef(value)
	{
		this.trendLineSpread = ForexRobot._convertSampleIntervalDefToLineSpread(value);
	}


	get landscape()
	{
		return this._landscape;
	}

	get currentDataPoint()
	{
		return this._currentDataPoint;
	}

	set currentDataPoint(value)
	{
		this._currentDataPoint = value;
		for (var length = this._agents.length, i = 0; i < length; ++i) this._agents[i].currentDataPoint = value;
	}

	get trendLineSpread()
	{
		return this._trendLineSpread;
	}

	set trendLineSpread(value)
	{
		this._trendLineSpread = value;
		for (var length = this._agents.length, i = 0; i < length; ++i) if (this._agents[i].setLineSpread) this._agents[i].setLineSpread(value);
	}
}
