"use strict";

include("StdAfx.js");

class ForexRobotV4
{
	//	ms - milliseconds
	//	sd - standard deviations
	constructor(config, callbacks)
	{
		this._forexAccount = config.forexAccount;
		this._forexAccount_autoUpdate = config.forexAccount_autoUpdate;	//	set to true if the forex account current date, ask and bid values are not set elsewhere

		this._trendLineShaper = config.trendLineShaper;
		this._peaksShaper = config.peaksShaper;
		this._valleyShaper = config.valleyShaper;

		this._openPosition = callbacks.openPosition;
		this._closePosition = callbacks.closePosition;

		this._windowsSize = config.windowsSize;					//	the maximum time interval in ms to use when shaping features
		this._tsEpsylon = config.tsEpsylon;						//	the epsylon for comparing floating point trendline starts in ms (trendline starts closer than epsylon are considered equal)
		this._angleEpsylon = config.angleEpsylon;				//	the epsylon for comparing floating point trendline sd angle ratio (trendline angles closer than epsylon are considered equal)
		this._trading_longPosition = config.trading_longPosition;
		this._trading_shortPosition = config.trading_shortPosition;

		this._state = EForexRobotStateV4.Input;
		this._currentVolatileDataPoint = null;
		this._currentSealedDataPoint = null;
		this._dataPointCache = [];
		this._sampleIntervalDef = null;

		this._trendLineFeature = null;
		this._peaksFeature = null;
		this._valleysFeature = null;

		this._trendLineFeature_lastGood = null;
		this._currentPosition = null;
	}


	reset()
	{
		this._state = EForexRobotStateV4.Input;
		this._currentVolatileDataPoint = null;
		this._currentSealedDataPoint = null;
		this._dataPointCache = [];
		this._sampleIntervalDef = null;

		this._trendLineFeature = null;
		this._peaksFeature = null;
		this._valleysFeature = null;

		this._trendLineFeature_lastGood = null;
		this._currentPosition = null;
	}

	//	copies the datapoints into the robot and feeds the last one
	dumpRange(dataPoints)
	{
		if (!dataPoints.length) return;
		if (dataPoints.length == 1)
		{
			this.feed(dataPoints[0]);
			return;
		}
		if (dataPoints.length == 2)
		{
			this._currentVolatileDataPoint = dataPoints[0];
			this.feed(dataPoints[1]);
			return;
		}
		this._dataPointCache = this._dataPointCache.concat(dataPoints.slice(0, dataPoints.length - 2));
		this._currentVolatileDataPoint = dataPoints[dataPoints.length - 2];
		this.feed(dataPoints[dataPoints.length - 1]);
	}

	//	sequentially feeds all datapoints into the robot
	feedRange(dataPoints)
	{
		for (var length = dataPoints.length, i = 0; i < length; ++i) this.feed(dataPoints[i]);
	}

	//	dataPoint: ForexDataPointV4
	feed(dataPoint)
	{
		this._currentSealedDataPoint = this._currentVolatileDataPoint;
		this._currentVolatileDataPoint = dataPoint;

		if (this._currentSealedDataPoint)
		{
			this._dataPointCache.push(this._currentSealedDataPoint);
			this._trimToWindow();
			this._dataPointAdded(this._currentSealedDataPoint);
		}
	}

	//	dataPoint: ForexDataPointV4
	updateLast(dataPoint)
	{
		this._currentVolatileDataPoint = dataPoint;
	}

	//	TODO: maybe keep 2 data points outside on the left of the data window and shape extremums with these data points included
	//		this will allow very early extremum-next detection and early trade decisions
	_dataPointAdded(dataPoint)
	{
		if (this._forexAccount_autoUpdate)
		{
			//	TODO:
			//		- move the forex account auto update to a separate class ForexAccountPriceSync
			//			- ForexAccountPriceSync will be able to receive the transactionDelayMinMs/transactionDelayMaxMs configuration and will apply slippage on sync
			//			- ForexAccountPriceSync will read dynamically from the db tick data and cache tick data pages with configurable size
			//				- initial tick data range can be provided in the constructor to avoid multiple db reads
			//			- also in ForexBrokerClient._accounts_change, ForexBrokerClient_Simulated._oneStep_realTime, ForexBrokerClient_Simulated._oneStep_realTime
			//		- calculate random delay in the interval [this._transactionDelayMinMs, this._transactionDelayMaxMs] (if equal directly use the provided value)
			//		- if the delay != 0
			//			- lookup the first tick datapoint after dataPoint.dt + delay
			//			- set this._forexAccount.currentAsk and this._forexAccount.currentBid to the values from the tick datapoint

			this._forexAccount.currentDt = dataPoint.dt;
			this._forexAccount.currentAsk = dataPoint.ask;
			this._forexAccount.currentBid = dataPoint.bid;
		}

		this._trendLineFeature = this._trendLineShaper.shape(this._dataPointCache);

		if (!this._trendLineFeature) return;

		//	current trendline start
		var cts = this._trendLineFeature.pointSample.getAt(0, "x");
		//	current trendline sd angle
		var ctsda = this._trendLineFeature.pointSample.sdAngleFactor("x", "y");

		this._peaksFeature = this._peaksShaper.shape(this._dataPointCache, cts);
		this._valleysFeature = this._valleyShaper.shape(this._dataPointCache, cts);

		if (!this._trendLineFeature) return;
		if (!this._peaksFeature) return;
		if (!this._valleysFeature) return;
		if (!this._peaksFeature.extremumSample.length) return;
		if (!this._valleysFeature.extremumSample.length) return;

		if (!this._trendLineFeature_lastGood)
		{
			//	occurs once at the start of the robot operation
			this._trendLineFeature_lastGood = this._trendLineFeature;
			return;
		}

		//	last good trendline start
		var lgts = this._trendLineFeature_lastGood.pointSample.getAt(0, "x");

		//	last good trendline sd angle
		var lgtsda = this._trendLineFeature_lastGood.pointSample.sdAngleFactor("x", "y");

		var sameStart = this._tsEqual(cts, lgts);
		var sameAngle = this._anglesEqual(ctsda, lgtsda);

		if (!sameStart || !sameAngle)
		{
			this._trendLineFeature_lastGood = this._trendLineFeature;
		}

		switch (this._state)
		{
			case EForexRobotStateV4.Input:
				this._tryOpenPosition();
				break;
			case EForexRobotStateV4.LongPosition:
			case EForexRobotStateV4.ShortPosition:
				this._tryClosePosition();
				break;
			default:
				throw "Not implemented.";
		}	
	}

	_tryOpenPosition()
	{
		var lgtsda = this._trendLineFeature_lastGood.pointSample.sdAngleFactor("x", "y");
		var isUpwards = Math.sign(lgtsda) > 0;

		if (isUpwards)
		{
			//	discard too low trendline angles
			if (Math.abs(lgtsda) < this._trading_longPosition.open_sdAngleFactor_min) return;

			var extremumNextX = this._valleysFeature.extremumSample.getAt(this._valleysFeature.extremumSample.length - 1, "x");
			var extremumNextY = this._valleysFeature.extremumSample.getAt(this._valleysFeature.extremumSample.length - 1, "y");

			//	don't trade if too long time has elapes after the last extremum-next point
			if (this._currentVolatileDataPoint.dt - extremumNextX > this._trading_longPosition.open_extremumNext_interval) return;

			var trendLineY = this._trendLineFeature_lastGood.line.calc(extremumNextX);
			var standardDeviationY = this._trendLineFeature_lastGood.pointSample.standardDeviation("y");

			//	don't trade if the last extremum-next point is too close to the trend line
			if (extremumNextY > trendLineY - this._trading_longPosition.open_sdThreshold * standardDeviationY) return;

			this._state = EForexRobotStateV4.LongPosition;
			this._currentPosition = this._forexAccount.buy(this._forexAccount.freeMargin * this._trading_longPosition.investmentFactor);
			if (this._openPosition) this._openPosition(
			{
				x: this._currentVolatileDataPoint.dt,
				position: this._currentPosition,
			});
		}
		else
		{
			//	discard too low trendline angles
			if (Math.abs(lgtsda) < this._trading_shortPosition.open_sdAngleFactor_min) return;

			var extremumNextX = this._peaksFeature.extremumSample.getAt(this._peaksFeature.extremumSample.length - 1, "x");
			var extremumNextY = this._peaksFeature.extremumSample.getAt(this._peaksFeature.extremumSample.length - 1, "y");

			//	don't trade if too long time has elapes after the last extremum-next point
			if (this._currentVolatileDataPoint.dt - extremumNextX > this._trading_shortPosition.open_extremumNext_interval) return;

			var trendLineY = this._trendLineFeature_lastGood.line.calc(extremumNextX);
			var standardDeviationY = this._trendLineFeature_lastGood.pointSample.standardDeviation("y");

			//log(411, extremumNextY, trendLineY, trendLineY - this._trading_longPosition.open_sdThreshold * standardDeviationY, extremumNextY <= trendLineY);

			//	don't trade if the last extremum-next point is too close to the trend line
			if (extremumNextY < trendLineY + this._trading_longPosition.open_sdThreshold * standardDeviationY) return;
			
			this._state = EForexRobotStateV4.ShortPosition;
			this._currentPosition = this._forexAccount.sell(this._forexAccount.freeMargin * this._trading_longPosition.investmentFactor);
			if (this._openPosition) this._openPosition(
			{
				x: this._currentVolatileDataPoint.dt,
				position: this._currentPosition,
			});
		}
	}

	_tryClosePosition()
	{
		var closeTradeReason = EForexPositionCloseReasonV4.None;

		var lgtsda = this._trendLineFeature_lastGood.pointSample.sdAngleFactor("x", "y");
		var isUpwards = Math.sign(lgtsda) > 0;

		var trendLineY = this._trendLineFeature_lastGood.line.calc(this._currentSealedDataPoint.dt);
		var standardDeviationY = this._trendLineFeature_lastGood.pointSample.standardDeviation("y");

		switch (this._currentPosition.type)
		{
			case EForexPositionType.Long:
				//	trending direction has changed
				if (!isUpwards) closeTradeReason = EForexPositionCloseReasonV4.TrendingDirectionChanged;

				//	close on too low trendline angles
				if (Math.abs(lgtsda) < this._trading_longPosition.close_sdAngleFactor) closeTradeReason = EForexPositionCloseReasonV4.TrendLineAngleTooLow;

				//	close if the current bid price goes too far away below the trendline
				//log(99991, this._currentSealedDataPoint.bid < trendLineY - this._trading_longPosition.close_sdSafeguardThreshold * standardDeviationY, this._currentSealedDataPoint.bid, trendLineY, this._trading_longPosition.close_sdSafeguardThreshold * standardDeviationY, trendLineY - this._trading_longPosition.close_sdSafeguardThreshold * standardDeviationY);
				//if (this._currentSealedDataPoint.bid < trendLineY - this._trading_longPosition.close_sdSafeguardThreshold * standardDeviationY) closeTradeReason = EForexPositionCloseReasonV4.ChannelSafeguard;

				//	close if the grace period expired and the last extremum-next value is high enough
				if (this._currentVolatileDataPoint.dt - this._currentPosition.start > this._trading_longPosition.position_gracePeriod)
				{
					var extremumNextX = this._peaksFeature.extremumSample.getAt(this._peaksFeature.extremumSample.length - 1, "x");
					var extremumNextY = this._peaksFeature.extremumSample.getAt(this._peaksFeature.extremumSample.length - 1, "y");
					var trendLineY2 = this._trendLineFeature_lastGood.line.calc(extremumNextX);
					if (extremumNextY > trendLineY2 + this._trading_longPosition.close_sdThreshold * standardDeviationY) closeTradeReason = EForexPositionCloseReasonV4.GracePeriodExpired;
				}

				//	close after the maximum time elapsed
				if (this._currentVolatileDataPoint.dt - this._currentPosition.start > this._trading_longPosition.position_maxTime) closeTradeReason = EForexPositionCloseReasonV4.MaximumTimeElapsed;

				//	close when a financial goal has been acheived
				if (this._currentPosition.floatingAmount > this._currentPosition.entryAmount * this._trading_longPosition.targetProfitFactor) closeTradeReason = EForexPositionCloseReasonV4.GoalReached;
				
				break;
			case EForexPositionType.Short:
				//	trending direction has changed
				if (isUpwards) closeTradeReason = EForexPositionCloseReasonV4.TrendingDirectionChanged;

				//	close on too low trendline angles
				if (Math.abs(lgtsda) < this._trading_shortPosition.close_sdAngleFactor) closeTradeReason = EForexPositionCloseReasonV4.TrendLineAngleTooLow;

				//	close if the current bid price goes too far away above the trendline
				//log(99992,
				//	this._currentSealedDataPoint.ask > trendLineY + this._trading_shortPosition.close_sdSafeguardThreshold * standardDeviationY,
				//	this._currentSealedDataPoint.ask,
				//	trendLineY,
				//	this._trading_shortPosition.close_sdSafeguardThreshold * standardDeviationY,
				//	trendLineY + this._trading_shortPosition.close_sdSafeguardThreshold * standardDeviationY,
				//	standardDeviationY,
				//	this._trading_shortPosition.close_sdSafeguardThreshold
				//);
				//if (this._currentSealedDataPoint.ask > trendLineY + this._trading_shortPosition.close_sdSafeguardThreshold * standardDeviationY) closeTradeReason = EForexPositionCloseReasonV4.ChannelSafeguard;

				//	close if the grace period expired and the last extremum-next value is low enough
				if (this._currentVolatileDataPoint.dt - this._currentPosition.start > this._trading_shortPosition.position_gracePeriod)
				{
					var extremumNextX = this._valleysFeature.extremumSample.getAt(this._valleysFeature.extremumSample.length - 1, "x");
					var extremumNextY = this._valleysFeature.extremumSample.getAt(this._valleysFeature.extremumSample.length - 1, "y");
					var trendLineY2 = this._trendLineFeature_lastGood.line.calc(extremumNextX);
					if (extremumNextY > trendLineY2 + this._trading_shortPosition.close_sdThreshold * standardDeviationY) closeTradeReason = EForexPositionCloseReasonV4.GracePeriodExpired;
				}
				
				//	close after the maximum time elapsed
				if (this._currentVolatileDataPoint.dt - this._currentPosition.start > this._trading_shortPosition.position_maxTime) closeTradeReason = EForexPositionCloseReasonV4.MaximumTimeElapsed;

				//	close when a financial goal has been acheived
				if (this._currentPosition.floatingAmount > this._currentPosition.entryAmount * this._trading_shortPosition.targetProfitFactor) closeTradeReason = EForexPositionCloseReasonV4.GoalReached;
				break;
		}

		switch (closeTradeReason)
		{
			case EForexPositionCloseReasonV4.None:
				break;
			case EForexPositionCloseReasonV4.TrendingDirectionChanged:
			case EForexPositionCloseReasonV4.TrendLineAngleTooLow:
			case EForexPositionCloseReasonV4.ChannelSafeguard:
			case EForexPositionCloseReasonV4.GracePeriodExpired:
			case EForexPositionCloseReasonV4.MaximumTimeElapsed:
			case EForexPositionCloseReasonV4.GoalReached:
				this._state = EForexRobotStateV4.Input;
				this._forexAccount.close(this._currentPosition);
				if (this._closePosition) this._closePosition(
				{
					x: this._currentVolatileDataPoint.dt,
					position: this._currentPosition,
					reason: closeTradeReason,
				});
				this._currentPosition = null;
				break;
			case EForexPositionCloseReasonV4.Shutdown:
				throw "Invalid operation.";
			default:
				throw "Not implemented.";
		}
	}

	_trimToWindow()
	{
		if (this._dataPointCache.length < 3) return;

		var minX = this._dataPointCache[this._dataPointCache.length - 1].dt - this._windowsSize;
		var result = [];
		for (var length = this._dataPointCache.length, i = 0; i < length; ++i)
		{
			var item = this._dataPointCache[i];
			if (item.dt < minX) continue;
			result.push(item);
		}
		this._dataPointCache = result;
	}

	//	tests if trendline starts are considered equal
	_tsEqual(ts1, ts2)
	{
		return Math.abs(ts2 - ts1) < this._tsEpsylon;
	}

	_anglesEqual(a1, a2)
	{
		if (Math.sign(a1) != Math.sign(a2)) return false;

		return Math.abs(a2 - a1) < this._angleEpsylon;
	}


	get windowsSize()
	{
		return this._windowsSize;
	}

	get trendLineShaper()
	{
		return this._trendLineShaper;
	}
	
	get peaksShaper()
	{
		return this._peaksShaper;
	}
	
	get valleyShaper()
	{
		return this._valleyShaper;
	}


	get trendLineFeature()
	{
		return this._trendLineFeature;
	}

	get peaksFeature()
	{
		return this._peaksFeature;
	}

	get valleysFeature()
	{
		return this._valleysFeature;
	}


	get sampleIntervalDef()
	{
		return this._sampleIntervalDef;
	}

	set sampleIntervalDef(value)
	{
		this._sampleIntervalDef = value;
	}
}
