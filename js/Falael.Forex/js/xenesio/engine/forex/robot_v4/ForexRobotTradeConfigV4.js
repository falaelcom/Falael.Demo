"use strict";

include("StdAfx.js");

class ForexRobotTradeConfigV4
{
	//	ms - milliseconds
	//	sd - standard deviations
	//	angle factor - normalized angle [-1, 0) for right angles and [0, 1] for left angles
	constructor(par)
	{
		this._open_extremumNext_interval = par.open_extremumNext_interval;	//	won't open a new position if the time passed since the last extremum-next exceeds this value in ms
		this._open_sdAngleFactor_min = par.open_sdAngleFactor_min;			//	won't open a new position if the last good trendline angle in sd is lower than this value
		this._open_sdThreshold = par.open_sdThreshold;						//	won't open a new position if the last extremum-next y in sd is above (long) or below (short) this value
		this._close_sdAngleFactor = par.close_sdAngleFactor;				//	will close the current position if the last good trendline angle in sd moves below (long) or above (short) this value
		this._close_sdThreshold = par.close_sdThreshold;					//	will close a position if the last extremum-next y in sd is above (long) or below (short) this offset from the trendline (may be combined with other conditions)
		this._close_sdSafeguardThreshold = par.close_sdSafeguardThreshold;	//	will close a position if the last extremum-next y in sd is below (long) or above (short) this offset from the trendline (may be combined with other conditions)
		this._position_gracePeriod = par._position_gracePeriod;				//	after this period in ms check for high enough extremum-next and close
		this._position_maxTime = par.position_maxTime;						//	will close a position if the specified time in ms has elapsed since the position was opened
		this._position_targetProfitFactor = par.targetProfitFactor;			//	will close a position if the position floatingAmount exceeds initialInvestment * targetProfitFactor
		this._investmentFactor = par.investmentFactor;						//	what fraction of the currently available free margin to use when creating a position
	}

	get open_extremumNext_interval()
	{
		return this._open_extremumNext_interval;
	}

	get open_sdAngleFactor_min()
	{
		return this._open_sdAngleFactor_min;
	}

	get open_sdThreshold()
	{
		return this._open_sdThreshold;
	}

	get close_sdAngleFactor()
	{
		return this._close_sdAngleFactor;
	}

	get close_sdThreshold()
	{
		return this._close_sdThreshold;
	}

	get close_sdSafeguardThreshold()
	{
		return this._close_sdSafeguardThreshold;
	}

	get position_gracePeriod()
	{
		return this._position_gracePeriod;
	}

	get position_maxTime()
	{
		return this._position_maxTime;
	}

	get position_targetProfitFactor()
	{
		return this._position_targetProfitFactor;
	}

	get investmentFactor()
	{
		return this._investmentFactor;
	}
}
