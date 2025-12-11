"use strict";

include("StdAfx.js");

class ForexTraderV5
{
	constructor(par, positionOpen, positionClose)
	{
		this._id = par.id;

		this._openPositions = [];

		this._positionOpen = new MulticastDelegate();
		if (positionOpen) this._positionOpen.add(positionOpen);
		this._positionClose = new MulticastDelegate();
		if (positionClose) this._positionClose.add(positionClose);
	}


	onPositionOpen(args)
	{
		this._positionOpen.execute(this, args);
	}

	get positionOpen()
	{
		return this._positionOpen;
	}

	onPositionClose(args)
	{
		this._positionClose.execute(this, args);
	}

	get positionClose()
	{
		return this._positionClose;
	}


	//	context.dt
	//	context.ask
	//	context.bid
	trade(context)
	{
		throw "Not implemented.";
	}

	//	context.dt
	//	context.ask
	//	context.bid
	closeAllPositions(context, metadata)
	{
		for (var length = this._openPositions.length, i = 0; i < length; ++i) this.__closePosition(context, this._openPositions[i], metadata);
	}


	//	context.dt
	//	context.ask
	//	context.bid
	//	transactionType: ETransactionTypeV5
	//	metadata - additional data to be attached to the trade; algorithm-specific
	__openPosition(context, transactionType, metadata)
	{
		var trade =
		{
			dt: context.dt,
			transactionType: transactionType,
			price: transactionType == ETransactionTypeV5.Buy ? context.ask : context.bid,
			traderId: this._id,
			metadata: metadata,
		};
		this._openPositions.push(trade);
		this.onPositionOpen(trade);
	}

	//	context.dt
	//	context.ask
	//	context.bid
	//	metadata - additional data to be attached to the trade; algorithm-specific
	__closePosition(context, precursorTrade, metadata)
	{
		var foundAt = this._openPositions.indexOf(precursorTrade);
		if (foundAt == -1) throw "Invalid operation.";
		this._openPositions.splice(foundAt, 1);
		var trade =
		{
			dt: context.dt,
			transactionType: precursorTrade.transactionType == ETransactionTypeV5.Buy ? ETransactionTypeV5.Sell : ETransactionTypeV5.Buy,
			price: precursorTrade.transactionType == ETransactionTypeV5.Buy ? context.bid : context.ask,
			traderId: this._id,
			metadata: metadata,

			precursorTrade: precursorTrade,
			movement: 0,
		};
		trade.movement = trade.precursorTrade.transactionType == ETransactionTypeV5.Buy ? (trade.price - trade.precursorTrade.price) : (trade.precursorTrade.price - trade.price);
		this.onPositionClose(trade);
	}


	get id()
	{
		return this._id;
	}

	get openPositions()
	{
		return this._openPositions;
	}
}
