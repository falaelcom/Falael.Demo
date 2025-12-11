"use strict";

const Pool = require("@shared/Pool.js");

module.exports =

//	v81 only supports long positions, stop loss and take profit
class SimulatorV81
{
	//	market(dt, ask, bid): [LongPositionV81] - returns null or a non-emprty array of positions for an
	//		- open order (item.closeReason not set) or 
	//		- close order (item.closeReason set and greater than 2)
	//			- must return the same position instance that was returned with the open order
	constructor(market)
	{
		this._market = market;
	}

	//	fct: {dt: <baseTime:Number>, arr: [<timeOffsetFromBase:Number>, <ask:Number>, <bid:Number>, ...]}
	//	FCT - Flat Collection of Ticks
	run(fct)
	{
		if ((fct.arr.length % 3) != 0) throw "Argument is invalid: fct.arr.";

		const STOP_LOSS = 1;
		const TAKE_PROFIT = 2;

		const positionPool = new Pool();
		const executionPool = new Pool();
		const icoll = fct.arr;
		for (let dt, ask, bid, positions, ilength = icoll.length, i = 0; i < ilength; i += 3)
		{
			dt = fct.dt + icoll[0];
			ask = icoll[1];
			bid = icoll[2];

			//	query the algo for open/close orders (optimization - uses LongPositionV81 to indicate an order)
			if (positions = this._market(dt, ask, bid)) for (let kitem, klength = positions.length, k = 0; k < klength; ++k)
			{
				kitem = positions[k];				//	kitem:LongPositionV81
				if (!kitem.closeReason)				//	open order
				{
					kitem.dto = dt;
					kitem.ask = ask;
					kitem.latencyo = 0;
				}
				else								//	close order
				{
					if (kitem.closeReason < 2) throw "Invalid value.";
					kitem.dtc = dt;
					kitem.bid = bid;
					kitem.latencyc = 0;
					positionPool.remove(kitem);
				}
				executionPool.add(kitem);
			}

			//	create close orders for STOP_LOSS and TAKE_PROFIT (optimization - uses LongPositionV81 to indicate an order)
			for (let kitem, klength = positionPool.length, k = positionPool.base; k < klength; ++k)
			{
				kitem = positionPool[k];						//	kitem:LongPositionV81
				if (kitem.bidlow && bid <= kitem.bidlow)		//	STOP_LOSS
				{
					kitem.dtc = dt;
					kitem.bid = bid;
					kitem.latencyc = 0;							//	TODO
					kitem.closeReason = STOP_LOSS;
					executionPool.add(kitem);
					positionPool.removeAt(k);
					--k;
					--klength;
				}
				else if (kitem.bidhigh && bid >= kitem.bidhigh)	//	TAKE_PROFIT
				{
					kitem.dtc = dt;
					kitem.bid = bid;
					kitem.latencyc = 0;							//	TODO
					kitem.closeReason = TAKE_PROFIT;
					executionPool.add(kitem);
					positionPool.removeAt(k);
					--k;
					--klength;
				}
			}

			//	process the pending orders (optimization - uses LongPositionV81 to indicate an order)
			for (let kitem, klength = executionPool.length, k = executionPool.base; k < klength; ++k)
			{
				kitem = executionPool[k];						//	kitem:LongPositionV81
				if (!kitem.closeReason)							//	open order
				{
					if (dt >= kitem.dto + kitem.latencyo)
					{
						kitem.dtoex = dt;
						kitem.askex = ask;
						executionPool.removeAt(k);
						--k;
						--klength;
					}
				}
				else											//	close order
				{
					if (dt >= kitem.dtc + kitem.latencyc)
					{
						kitem.dtcex = dt;
						kitem.bidex = bid;
						executionPool.removeAt(k);
						--k;
						--klength;
					}
				}
			}
		}
	}
}
