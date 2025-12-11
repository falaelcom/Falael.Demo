"use strict";

include("StdAfx.js");

//	adds realistic slippage to price by providing later price based on random or fixed transaction delay
//	for simulation purposes only
class ForexAccountSlippageSimulator
{
	constructor(par)
	{
		this._instrumentId = par.instrumentId;	//	"5d96423f5a4aa978f03002d2";	//	EUR/USD
		this._pageSizeMs = par.tickData_pageSizeMs;	//	60 * 60 * 1000;		//	1 hour
		this._downtime_timeoutMs = par.downtime_timeoutMs;	//	24 * 60 * 60 * 1000;	//	1 day
		this._transactionDelayMinMs = par.transactionDelayMinMs;
		this._transactionDelayMaxMs = par.transactionDelayMaxMs;

		this._tickDataChannel = app.db.getChannel(this._instrumentId, null);	//	no sampling, will use raw tick data
	}

	//	if end of data has been reached returns null, otherwise returns a tick datapoint after applying slippage
	//	considers trades during weekends and returns the first tick datapoint from the next week
	async getTickDatapoint(dt)
	{
		var delayMs;
		if (this._transactionDelayMinMs == this._transactionDelayMaxMs)
		{
			delayMs = this._transactionDelayMinMs;
		}
		else
		{
			var rangeMs = this._transactionDelayMaxMs - this._transactionDelayMinMs;
			delayMs = Math.random() * rangeMs + this._transactionDelayMinMs;
		}

		var dataPoint1 = await this._tickDataChannel.lookupDataPoint(
		{
			dt: dt + delayMs,
			pageSizeMs: this._pageSizeMs,
			lookBack: true,
			acceptEqual: true,
		});
		if (!dataPoint1) throw "Invalid operation";
		var dataPoint2 = await this._tickDataChannel.lookupDataPoint(
		{
			dt: dt + delayMs,
			pageSizeMs: this._pageSizeMs,
			lookBack: false,
			acceptEqual: false,
		});
		if (!dataPoint2) return null;
		var distance = dataPoint2.dt - dataPoint1.dt;
		if (distance >= this._downtime_timeoutMs) return dataPoint2;
		return dataPoint1;
	}


	get transactionDelayMinMs()
	{
		return this._transactionDelayMinMs;
	}

	get transactionDelayMaxMs()
	{
		return this._transactionDelayMaxMs;
	}

	get pageSizeMs()
	{
		return this._pageSizeMs;
	}

	get downtime_timeoutMs()
	{
		return this._downtime_timeoutMs;
	}

	get instrumentId()
	{
		return this._instrumentId;
	}
}
