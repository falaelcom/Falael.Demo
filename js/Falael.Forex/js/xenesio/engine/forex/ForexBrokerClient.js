"use strict";

include("StdAfx.js");

class ForexBrokerClient
{
	constructor()
	{
		this._accounts = new Collection(this._accounts_change.bind(this));

		this._currentDt = 0;
		this._currentAsk = 0;
		this._currentBid = 0;

		this._tick = new MulticastDelegate();
	}


	onTick(args)
	{
		this._tick.execute(this, args);
	}


	_accounts_change(sender, args)
	{
		switch (args.changeType)
		{
			case "add":
				args.item.currentDt = this._currentDt;
				args.item.currentAsk = this._currentAsk;
				args.item.currentBid = this._currentBid;
				break;
			case "remove":
				break;
			default:
				throw new "Not implemented.";
		}
	}


	get accounts()
	{
		return this._accounts;
	}


	get currentDt()
	{
		return this._currentDt;
	}

	set currentDt(value)
	{
		if (this._currentDt == value)
		{
			return;
		}
		this._currentDt = value;
		for (var length = this._accounts.length, i = 0; i < length; ++i) this._accounts[i].currentAsk = this._currentAsk;
	}

	get currentAsk()
	{
		return this._currentAsk;
	}

	set currentAsk(value)
	{
		if (this._currentAsk == value)
		{
			return;
		}
		this._currentAsk = value;
		for (var length = this._accounts.length, i = 0; i < length; ++i) this._accounts[i].currentAsk = this._currentAsk;
	}

	get currentBid()
	{
		return this._currentBid;
	}

	set currentBid(value)
	{
		if (this._currentBid == value)
		{
			return;
		}
		this._currentBid = value;
		for (var length = this._accounts.length, i = 0; i < length; ++i) this._accounts[i].currentBid = this._currentBid;
	}


	get tick()
	{
		return this._tick;
	}
}
