"use strict";

include("StdAfx.js");

class ForexAccount_Oanda_Simulated extends ForexAccount
{
	constructor(par)
	{
		super(par);

		//	see SimulationChartUserControl for remarks and links for rates specific to OANDA
		this._monthlyCommission = par.monthlyCommission;
		this._instrumentCommission = par.instrumentCommission;
		this._minimumInstrumentCommission = par.minimumInstrumentCommission;
	}


	get monthlyCommission()
	{
		return this._monthlyCommission;
	}

	get instrumentCommission()
	{
		return this._instrumentCommission;
	}

	get minimumInstrumentCommission()
	{
		return this._minimumInstrumentCommission;
	}
}
