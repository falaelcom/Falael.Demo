"use strict";

include("StdAfx.js");

class ForexPosition
{
	constructor(par)
	{
		this._type = par.type;	//	EForexPositionType
		this._quoteAmount = par.quoteAmount;
		this._entryPrice = par.entryPrice;
		this._requiredMargin = par.requiredMargin;
		this._start = par.start;

		this._dynamicAsk = par.currentAsk;
		this._dynamicBid = par.currentBid;

		this._change = new MulticastDelegate();
	}


	onChange(args)
	{
		this._change.execute(this, args);
	}


	get type()
	{
		return this._type;
	}
	
	get quoteAmount()
	{
		return this._quoteAmount;
	}

	get entryPrice()
	{
		return this._entryPrice;
	}

	get requiredMargin()
	{
		return this._requiredMargin;
	}

	get start()
	{
		return this._start;
	}


	get dynamicAsk()
	{
		return this._dynamicAsk;
	}

	set dynamicAsk(value)
	{
		if (this._dynamicAsk == value)
		{
			return;
		}
		this._dynamicAsk = value;
		this.onChange({ property: "dynamicAsk", value: this._dynamicAsk });
	}

	get dynamicBid()
	{
		return this._dynamicBid;
	}

	set dynamicBid(value)
	{
		if (this._dynamicAsk == value)
		{
			return;
		}
		this._dynamicBid = value;
		this.onChange({ property: "dynamicBid", value: this._dynamicBid });
	}


	get floatingAmount()
	{
		switch (this._type)
		{
			case EForexPositionType.Long:
				return this._quoteAmount * (this._dynamicBid - this._entryPrice);
			case EForexPositionType.Short:
				return this._quoteAmount * (this._entryPrice - this._dynamicAsk);
			default:
				throw "Not implemented.";
		}
	}

	get exitEvenPrice()
	{
		var spread = this._dynamicAsk - this._dynamicBid;
		switch (this._type)
		{
			case EForexPositionType.Long:
				return this._entryPrice + spread;
			case EForexPositionType.Short:
				return this._entryPrice - spread;
			default:
				throw "Not implemented.";
		}
	}

	get entryAmount()
	{
		return this._quoteAmount * this._entryPrice;
	}


	get change()
	{
		return this._change;
	}
}
