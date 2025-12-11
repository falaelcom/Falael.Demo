"use strict";

class ForexChannelV7
{
	constructor(par)
	{
		this._id = newLUID();

		this.extremums = par.extremums;
		this.signatureExtremums = par.signatureExtremums;
		this.startDp = par.startDp;
		this.startIndex = par.startIndex;
		this.detectionDp = par.detectionDp;
		this.detectionIndex = par.detectionIndex;
		this.endDp = par.endDp;
		this.longEndDp = par.longEndDp;
		this.supportLine = par.supportLine;
		this.resistanceLine = par.resistanceLine;
		this.spread = par.spread;
		this.direction = par.direction;
		this.sdr = par.sdr;
		this.sdy = par.sdy;
		this.sdyType = par.sdyType;
		this.sdyPrecision = par.sdyPrecision;
		this.cc = par.cc;
		this.cod = par.cod;

		this.concurrencyId = par.concurrencyId || null;
		this.data = par.data || [];
		this.msdy = par.msdy || null;
		this.ema = par.ema || null;
	}

	static wrap(arg)
	{
		if (arg instanceof ForexChannelV7) return arg;

		return new ForexChannelV7(Object.assign({}, arg,
		{
			supportLine: LinearFunction.wrap(arg.supportLine),
			resistanceLine: LinearFunction.wrap(arg.resistanceLine),
		}));
	}

	static wrapArray(arr)
	{
		return arr.map(m => ForexChannelV7.wrap(m));
	}


	getHashCode()
	{
		return ForexChannelV7.getExtremumsHashCode(this.signatureExtremums);
	}

	equals(r)
	{
		return ForexChannelV7.extremumsEqual(this.signatureExtremums, r);
	}


	get id()
	{
		return this._id;
	}

	get baseDurationMs()
	{
		return this.detectionDp.dt - this.startDp.dt;
	}

	get fullDurationMs()
	{
		return this.longEndDp.dt - this.startDp.dt;
	}


	static getExtremumsHashCode(extremums)
	{
		var result = 0;
		for (var length = extremums.length, i = 0; i < length; ++i) result ^= extremums[i].m.dt;
		return result;
	}

	static extremumsEqual(l, r)
	{
		if (l.length != r.length) return false;
		for (var length = l.length, i = 0; i < length; ++i) if (l[i].m.dt != r[i].m.dt) return false;
		return true;
	}

	static createExtremumsObject(extremums)
	{
		return {

			extremums: extremums,
			getHashCode()
			{
				return ForexChannelV7.getExtremumsHashCode(this.extremums);
			},
			equals(r)
			{
				return ForexChannelV7.extremumsEqual(this.extremums, r);
			},
		};
	}
}