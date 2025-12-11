"use strict";

include("StdAfx.js");

class ForexTraderV5_Channel_SNR_ZigZag extends ForexTraderV5
{
	constructor(par, positionOpen, positionClose)
	{
		super(par, positionOpen, positionClose)

		this._SNR_ZigZag_trade_thresholdFactord = par.SNR_ZigZag_trade_thresholdFactord;
	}

	//	context.dt
	//	context.ask
	//	context.bid
	//	
	//	context.trendLineAB
	//	context.channelSpread
	//	context.supportTrendLineA
	//	context.resistanceTrendLineB
	trade(context)	//	context == closeRawSample.getAt(ri)
	{
		var trendLineAB = context.trendLineAB;
		var channelSpread = context.channelSpread;
		var supportTrendLineA = context.supportTrendLineA;
		var resistanceTrendLineB = context.resistanceTrendLineB;

		var thresholdSpread = this._SNR_ZigZag_trade_thresholdFactord * channelSpread;

		var currentTrade = this.openPositions[0];
		if (!currentTrade)	//	true only immediately after channel detection
		{
			var rly = resistanceTrendLineB.calc(context.dt);
			var sly = supportTrendLineA.calc(context.dt);
			if (context.bid >= rly - thresholdSpread) this.__openPosition(context, ETransactionTypeV5.Sell);
			else if (context.ask <= sly + thresholdSpread) this.__openPosition(context, ETransactionTypeV5.Buy);
			return;
		}

		switch (currentTrade.transactionType)
		{
			case ETransactionTypeV5.Buy:
				var rly = resistanceTrendLineB.calc(context.dt);
				if (context.bid < rly - thresholdSpread) break;
				this.__closePosition(context, currentTrade);
				this.__openPosition(context, ETransactionTypeV5.Sell);
				break;
			case ETransactionTypeV5.Sell:
				var sly = supportTrendLineA.calc(context.dt);
				if (context.ask > sly + thresholdSpread) break;
				this.__closePosition(context, currentTrade);
				this.__openPosition(context, ETransactionTypeV5.Buy);
				break;
			default:
				throw "Not implented.";
		}
	}
}
