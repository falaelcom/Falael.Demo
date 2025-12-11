"use strict";

include("StdAfx.js");

class ForexTraderV5_Channel_LBF extends ForexTraderV5
{
	constructor(par, positionOpen, positionClose)
	{
		super(par, positionOpen, positionClose)

		this._LBF_tradeOpen_spreadThreshold = par.LBF_tradeOpen_spreadThreshold;
		this._LBF_tradeOpen_ldNValue = par.LBF_tradeOpen_ldNValue;
		this._LBF_tradeOpen_sdAngleThreshold = par.LBF_tradeOpen_sdAngleThreshold;
		this._LBF_tradeOpen_sdyThresholdFactor = par.LBF_tradeOpen_sdyThresholdFactor;
		this._LBF_tradeClose_sdyThresholdFactor = par.LBF_tradeClose_sdyThresholdFactor;
		this._LBF_tradeClose_sdTargetProfit = par.LBF_tradeClose_sdTargetProfit;
	}

	//	context.dt
	//	context.ask
	//	context.bid
	//	
	//	context.lineOfBestFit_currentSample
	//	context.lineOfBestFit_trendLine
	//	context.lineOfBestFit_sdAngleFactor
	//	context.lineOfBestFit_deadZoneData
	trade(context)	//	context == closeRawSample.getAt(ri)
	{
		var lineOfBestFit_currentSample = context.lineOfBestFit_currentSample;
		var lineOfBestFit_trendLine = context.lineOfBestFit_trendLine;
		var lineOfBestFit_sdAngleFactor = context.lineOfBestFit_sdAngleFactor;
		var lineOfBestFit_deadZoneData = context.lineOfBestFit_deadZoneData;

		var currentTrade = this.openPositions[0];
		if (!currentTrade)
		{
			var sdy = lineOfBestFit_currentSample.standardDeviation("y");
			var tly = lineOfBestFit_trendLine.calc(context.dt);

			var flag_tradeOpen_spreadThreshold = (context.ask - context.bid < this._LBF_tradeOpen_spreadThreshold);
			var flag_tradeOpen_ldNValue = (context.dt >= lineOfBestFit_currentSample.getAt(0, "x") + this._LBF_tradeOpen_ldNValue);
			var flag_tradeOpen_sdAngleThreshold = (Math.abs(lineOfBestFit_sdAngleFactor) > this._LBF_tradeOpen_sdAngleThreshold);
			var flag_tradeOpen_sdyThresholdFactor;
			var flag_deadZoneFree = !Range.contain(lineOfBestFit_deadZoneData, context.dt);

			if (lineOfBestFit_sdAngleFactor == 0) flag_tradeOpen_sdyThresholdFactor = false;
			else if (lineOfBestFit_sdAngleFactor > 0) flag_tradeOpen_sdyThresholdFactor = (context.ask < tly - sdy * this._LBF_tradeOpen_sdyThresholdFactor);
			else if (lineOfBestFit_sdAngleFactor < 0) flag_tradeOpen_sdyThresholdFactor = (context.bid > tly + sdy * this._LBF_tradeOpen_sdyThresholdFactor);

			if (flag_deadZoneFree && flag_tradeOpen_spreadThreshold && flag_tradeOpen_ldNValue && flag_tradeOpen_sdAngleThreshold && flag_tradeOpen_sdyThresholdFactor)
			{
				this.__openPosition(context, lineOfBestFit_sdAngleFactor > 0 ? ETransactionTypeV5.Buy : ETransactionTypeV5.Sell, { sdAngleFactor: lineOfBestFit_sdAngleFactor });
			}
		}
		else
		{
			var sdy = lineOfBestFit_currentSample.standardDeviation("y");
			var tly = lineOfBestFit_trendLine.calc(context.dt);

			var flag_tradeClose_sdyThresholdFactor = currentTrade.transactionType == ETransactionTypeV5.Buy ?
				(context.bid > tly + sdy * this._LBF_tradeClose_sdyThresholdFactor):
				(context.ask < tly - sdy * this._LBF_tradeClose_sdyThresholdFactor);
			var value = currentTrade.transactionType == ETransactionTypeV5.Buy ? context.bid : context.ask;
			var movement = currentTrade.transactionType == ETransactionTypeV5.Buy ? (value - currentTrade.price) : (currentTrade.price - value);
			var flag_tradeClose_hasProfit = movement / sdy > this._LBF_tradeClose_sdTargetProfit;
			//var flag_tradeClose_minDuration = (context.dt >= lineOfBestFit_currentSample.getAt(0, "x") + 1000 * 60 * 10);
			var flag_sdAngleFactor = Math.sign(lineOfBestFit_sdAngleFactor) != Math.sign(currentTrade.metadata.sdAngleFactor);
			var flag_deadZone = Range.contain(lineOfBestFit_deadZoneData, context.dt);

			if (flag_deadZone || flag_tradeClose_hasProfit || flag_tradeClose_sdyThresholdFactor || flag_sdAngleFactor)
			{
				this.__closePosition(context, currentTrade);
			}
		}
	}
}
