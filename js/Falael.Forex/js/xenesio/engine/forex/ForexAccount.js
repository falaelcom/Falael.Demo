"use strict";

include("StdAfx.js");

//	assumed instrument: EURUSD
//		- base currency: EUR
//		- quote currency: USD
//	account currency: EUR 
//		- no need to convert required margin - https://www.babypips.com/learn/forex/what-is-margin
class ForexAccount
{
	constructor(par)
	{
		this._marginRequirementFactor = par.marginRequirementFactor;	//	e.g. 0.05
		this._marginCallLevelPercent = par.marginCallLevelPercent;		//	e.g. 100
		this._stopOutLevelPercent = par.stopOutLevelPercent;			//	e.g. 50

		this._currentDt = 0;
		this._currentAsk = 0;
		this._currentBid = 0;

		this._balance = par.balance;
		
		this._positions = [];
	}

	
	buy(quoteAmount)
	{
		if (this.marginLevelPercent && this.marginLevelPercent <= this._marginCallLevelPercent)
		{
			throw "Invalid operation.";
		}

		var client = this;
		var position = new ForexPosition(
		{
			type: EForexPositionType.Long,
			quoteAmount: quoteAmount,
			entryPrice: this._currentAsk,
			requiredMargin: this._marginRequirementFactor * quoteAmount,
			start: this._currentDt,
			currentAsk: this._currentAsk,
			currentBid: this._currentBid,
		});
		this._positions.push(position);
		return position;
	}

	sell(quoteAmount)
	{
		if (this.marginLevelPercent && this.marginLevelPercent <= this._marginCallLevelPercent)
		{
			throw "Invalid operation.";
		}

		var client = this;
		var position = new ForexPosition(
		{
			type: EForexPositionType.Short,
			quoteAmount: quoteAmount,
			entryPrice: this._currentBid,
			requiredMargin: this._marginRequirementFactor * quoteAmount,
			start: this._currentDt,
			currentAsk: this._currentAsk,
			currentBid: this._currentBid,
		});
		this._positions.push(position);
		return position;
	}

	close(position)
	{
		var foundAt = this._positions.indexOf(position);
		if (foundAt == -1) throw "Invalid argument: position.";
		this._positions.splice(foundAt, 1);
		this._balance += position.floatingAmount;
	}

	closeAll()
	{
		for (var length = this._positions.length, i = 0; i < length; ++i) this._balance += this._positions[i].floatingAmount;
		this._positions.length = 0;
	}


	//	https://www.babypips.com/learn/forex/what-is-margin
	get marginRequirementFactor()
	{
		return this._marginRequirementFactor;
	}

	//	https://www.babypips.com/learn/forex/what-is-a-margin-call-level
	get marginCallLevelPercent()
	{
		return this._marginCallLevelPercent;
	}

	//	https://www.babypips.com/learn/forex/what-is-a-stop-out-level
	get stopOutLevelPercent()
	{
		return this._stopOutLevelPercent;
	}


	get currentDt()
	{
		return this._currentDt;
	}

	set currentDt(value)
	{
		this._currentDt = value;
	}

	get currentAsk()
	{
		return this._currentAsk;
	}

	set currentAsk(value)
	{
		this._currentAsk = value;
		for (var length = this._positions.length, i = 0; i < length; ++i) this._positions[i].dynamicAsk = value;
		if (this.marginLevelPercent && this.marginLevelPercent <= this._stopOutLevelPercent)
		{
			throw "Stop out.";
		}
		if (this.marginLevelPercent && this.marginLevelPercent <= this._marginCallLevelPercent)
		{
			throw "Margin call.";
		}
	}

	get currentBid()
	{
		return this._currentBid;
	}

	set currentBid(value)
	{
		this._currentBid = value;
		for (var length = this._positions.length, i = 0; i < length; ++i) this._positions[i].dynamicBid = value;
		if (this.marginLevelPercent && this.marginLevelPercent <= this._stopOutLevelPercent)
		{
			throw "Stop out.";
		}
		if (this.marginLevelPercent && this.marginLevelPercent <= this._marginCallLevelPercent)
		{
			throw "Margin call.";
		}
	}

	get currentSpread()
	{
		return this._currentAsk - this._currentBid;
	}


	get positions()
	{
		return this._positions;
	}


	//	https://www.babypips.com/learn/forex/what-is-account-balance
	get balance()
	{
		return this._balance;
	}


	//	https://www.babypips.com/learn/forex/what-is-unrealized-profit-or-loss
	get floatingAmount()
	{
		var result = 0;
		for (var length = this._positions.length, i = 0; i < length; ++i) result += this._positions[i].floatingAmount;
		return result;
	}

	//	https://www.babypips.com/learn/forex/what-is-used-margin
	get usedMargin()
	{
		var result = 0;
		for (var length = this._positions.length, i = 0; i < length; ++i) result += this._positions[i].requiredMargin;
		return result;
	}

	//	https://www.babypips.com/learn/forex/what-is-equity
	get equity()
	{
		return this.balance + this.floatingAmount;
	}

	//	https://www.babypips.com/learn/forex/what-is-free-margin
	get freeMargin()
	{
		return this.equity - this.usedMargin;
	}

	//	https://www.babypips.com/learn/forex/what-is-margin-level
	get marginLevelPercent()
	{
		if (!this.usedMargin) return 0;
		return (this.equity / this.usedMargin) * 100;
	}
}
