"use strict";

include("StdAfx.js");

class Deferrer
{
	constructor(par)
	{
		this._timeout = par.timeout || 0;
		this._signalled = par.signalled;

		this._signalArgs = null;
		this._timerId = -1;
	}


	async onSignalled(args)
	{
		if (this._signalled) await this._signalled(this, args);
	}

	get signalled()
	{
		return this._signalled;
	}


	async signal(signalArgs)
	{
		this._signalArgs = signalArgs;
		if (this._timerId != -1) window.clearTimeout(this._timerId);
		this._timerId = window.setTimeout(function Deferrer_signal_onTimeout()
		{
			this._timer_timeout();
		}.bind(this), this._timeout);
	}


	async _timer_timeout()
	{
		this._timerId = -1;
		await this.onSignalled(this._signalArgs);
	}


	get timeout()
	{
		return this._timeout;
	}

	get signalArgs()
	{
		return this._signalArgs;
	}
}
