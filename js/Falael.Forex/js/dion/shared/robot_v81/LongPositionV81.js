"use strict";

module.exports =

class LongPositionV81
{
	constructor(bidlow, bidhigh)
	{
		this.bidlow = bidlow;
		this.bidhigh = bidhigh;

		this.dto = null;		//	open order dt
		this.dtoex = null;		//	open order execution dt (latency applied)
		this.dtc = null;		//	close order dt
		this.dtcex = null;		//	close order execution dt (latency applied)
		this.ask = null;
		this.askex = null;
		this.bid = null;
		this.bidex = null;
		this.openReason = null;
		this.closeReason = null;
		this.latencyo = null;	//	open order execution latency
		this.latencyc = null;	//	close order execution latency
	}
}
