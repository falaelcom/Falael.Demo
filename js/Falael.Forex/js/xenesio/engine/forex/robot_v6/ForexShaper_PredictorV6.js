"use strict";

include("StdAfx.js");

class ForexShaper_PredictorV6 extends ForexShaperV6
{
	constructor(par)
	{
		super(par);

		par = par || {};
		this._windowDpCount = par.windowDpCount || 110;
		this._z = 1;
		this._a = 1200;
		this._eptc = 9;
		this._extremum_minProximityCount = par.extremum_minProximityCount || 2;
		this._extremum_contrastMinLength = par.extremum_contrastMinLength || 0.00000;
		this._srNarrowZoneEntryTreshold = par.srNarrowZoneEntryTreshold || 0.0002;
		this._srNarrowZoneExitTreshold = par.srNarrowZoneExitTreshold || 0.0003;
	}

	shape(context, dataPoints)
	{
		//	TODO: consider using also yb for buffer3 (the resistance line) for fine tuning
		//		- how is the middle line built in this case?

		var epsylon = 0.00000001;

		var pois = [];
		var bufferw = [];	//	w - window
		var bufferm = [];	//	m - middle
		var bufferr = [];	//	r - resistance
		var buffers = [];	//	s - support
		var ibufferm = [];	//	i - indicator
		var ibufferr = [];
		var ibuffers = [];
		var narrowZoneFlag = false;
		for (var length = dataPoints.length, i = 0; i < length; ++i)
		{
			var dp = dataPoints[i];
			var dt = dp.dt;
			bufferw.push(dp);
			if (bufferw.length > this._windowDpCount)
			{
				bufferw.shift();
				var sample = new MappedArray(bufferw, { x: (m) => m.dt, ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
				var lobfa = sample.lineOfBestFit("x", "ya");
				var midDt = (bufferw[0].dt + bufferw[bufferw.length - 1].dt) / 2;
				bufferm.push({ x: midDt, y: lobfa.calc(midDt) });
				bufferr.push({ x: midDt, y: lobfa.calc(midDt) + sample.standardDeviation("ya") / 0.7017 });
				buffers.push({ x: midDt, y: lobfa.calc(midDt) - sample.standardDeviation("ya") / 0.7017 });

				if (bufferm.length >= 2)
				{
					var sdya = sample.standardDeviation("ya");

					var fbufferw = bufferw.slice();	//	f - finish
					var fbufferm = bufferm.slice();
					var fbufferr = bufferr.slice();
					var fbuffers = buffers.slice();
					for (; fbufferw.length >= 3;)
					{
						fbufferw.shift();
						var sample = new MappedArray(fbufferw, { x: (m) => m.dt, ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
						var lobfa = sample.lineOfBestFit("x", "ya");

						var midDt = (fbufferw[0].dt + fbufferw[fbufferw.length - 1].dt) / 2;

						var y2 = lobfa.calc(midDt);
						var movement1 = y2 - fbufferm[fbufferm.length - 1].y;
						var movement0 = fbufferm[fbufferm.length - 1].y - fbufferm[fbufferm.length - 2].y;
						fbufferm.push({ x: midDt, y: fbufferm[fbufferm.length - 1].y + (this._z * movement1 + this._a * movement0) / (this._a + this._z), sdya: sdya });

						var y3 = lobfa.calc(midDt) + sample.standardDeviation("ya");
						var movement1 = y3 - fbufferr[fbufferr.length - 1].y;
						var movement0 = fbufferr[fbufferr.length - 1].y - fbufferr[fbufferr.length - 2].y;
						fbufferr.push({ x: midDt, y: fbufferr[fbufferr.length - 1].y + (this._z * movement1 + this._a * movement0) / (this._a + this._z), sdya: sdya });

						var y4 = lobfa.calc(midDt) - sample.standardDeviation("ya");
						var movement1 = y4 - fbuffers[fbuffers.length - 1].y;
						var movement0 = fbuffers[fbuffers.length - 1].y - fbuffers[fbuffers.length - 2].y;
						fbuffers.push({ x: midDt, y: fbuffers[fbuffers.length - 1].y + (this._z * movement1 + this._a * movement0) / (this._a + this._z), sdya: sdya });
					}
					ibufferm.push(fbufferm[fbufferm.length - 1]);
					ibufferr.push(fbufferr[fbufferr.length - 1]);
					ibuffers.push(fbuffers[fbuffers.length - 1]);

					//	detect narrow zones
					var pt3a = ibufferr[ibufferr.length - 1];
					var pt4a = ibuffers[ibuffers.length - 1];
					var d = Math.abs(pt3a.y - pt4a.y);
					var s = Math.sign(pt3a.y - pt4a.y);
					if (!narrowZoneFlag)
					{
						if (d <= this._srNarrowZoneEntryTreshold)
						{
							narrowZoneFlag = true;
							var poi = { i: i, x: pt3a.x, y: pt3a.y, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya, type: ForexShaper_PredictorV6.PoiType.NzStart };
							pois.push(poi);
						}
					}
					else
					{
						if (d > this._srNarrowZoneExitTreshold)
						{
							narrowZoneFlag = false;
							var poi = { i: i, x: pt3a.x, y: pt3a.y, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya, type: ForexShaper_PredictorV6.PoiType.NzStart };
							pois.push(poi);

							var pt2a1 = ibufferm[ibufferm.length - 2];
							var pt2a2 = ibufferm[ibufferm.length - 1];
							poi.d = 0;	//	direction: -1, 0, 1
							if (Math.abs(pt2a2.y - pt2a1.y) >= epsylon) poi.d = Math.sign(pt2a2.y - pt2a1.y);
						}
					}

					//	detect cross points of ibufferr and ibuffers
					if (ibufferr.length >= 3)
					{
						var pt3a0 = ibufferr[ibufferr.length - 3];
						var pt3a1 = ibufferr[ibufferr.length - 2];
						var pt3a2 = ibufferr[ibufferr.length - 1];
						var pt4a0 = ibuffers[ibuffers.length - 3];
						var pt4a1 = ibuffers[ibuffers.length - 2];
						var pt4a2 = ibuffers[ibuffers.length - 1];
						var poi = null;
						if (Math.abs(pt3a1.y - pt4a1.y) < epsylon)	//	pt3a1.y == pt4a1.y
						{
							if (Math.abs(pt3a2.y - pt4a2.y) < epsylon) poi = { i: i, x: pt3a2.x, y: pt3a2.y, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya };
							else if (Math.abs(pt3a0.y - pt4a0.y) < epsylon) poi = { i: i, x: pt3a0.x, y: pt3a0.y, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya };
							else if (Math.sign(pt3a0.y - pt4a0.y) != Math.sign(pt3a2.y - pt4a2.y)) poi = { i: i, x: pt3a1.x, y: pt3a1.y, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya };
						}
						else
						{
							if (Math.sign(pt3a1.y - pt4a1.y) != Math.sign(pt3a2.y - pt4a2.y)) poi = { i: i, x: pt3a1.x + (pt3a2.x - pt3a1.x) / 2, y: pt3a1.y + (pt3a2.y - pt3a1.y) / 2, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya };
						}
						if (poi)
						{
							var pt2a0 = ibufferm[ibufferm.length - 3];
							var pt2a1 = ibufferm[ibufferm.length - 2];
							var pt2a2 = ibufferm[ibufferm.length - 1];
							poi.d = 0;	//	direction: -1, 0, 1
							if (Math.abs(pt2a2.y - pt2a1.y) >= epsylon) poi.d = Math.sign(pt2a2.y - pt2a1.y);

							poi.r = null;
							if (Math.abs(pt3a2.y - pt4a2.y) >= epsylon) poi.r = Math.sign(pt3a2.y - pt4a2.y);
							else poi.r = -Math.sign(pt3a1.y - pt4a1.y);

							pois.push(poi);
						}
					}

					//	detect extremums of ibufferm
					if (ibufferm.length >= this._eptc)
					{
						var points = ibufferm.slice(ibufferm.length - this._eptc, ibufferm.length);
						var ppc = MappedArray.getExtremumType(points, "y", this._extremum_contrastMinLength);
						//log(888, moment.utc(ibufferm[ibufferm.length - Math.ceil(this._eptc / 2)].x).toString(), ppc);
						if (ppc)
						{
							var ecdp = ibufferm[ibufferm.length - Math.ceil(this._eptc / 2)];
							var poi = { i: i, x: ecdp.x, y: ecdp.y, dt: dt, dp: dp, ask: dp.raw.ac, bid: dp.raw.bc, sdya: sdya };
							if (ppc > 0) poi.type = ForexShaper_PredictorV6.PoiType.Peak;
							else poi.type = ForexShaper_PredictorV6.PoiType.Valley;

							var pt3a0 = ibufferr[ibufferr.length - 3];
							var pt3a1 = ibufferr[ibufferr.length - 2];
							var pt3a2 = ibufferr[ibufferr.length - 1];
							var pt4a0 = ibuffers[ibuffers.length - 3];
							var pt4a1 = ibuffers[ibuffers.length - 2];
							var pt4a2 = ibuffers[ibuffers.length - 1];
							poi.r = null;
							if (Math.abs(pt3a2.y - pt4a2.y) >= epsylon) poi.r = Math.sign(pt3a2.y - pt4a2.y);
							else poi.r = -Math.sign(pt3a1.y - pt4a1.y);

							pois.push(poi);
						}
					}
				}
			}
		}

		if (!bufferm.length) return null;

		var result =
		{
			ibufferm: ibufferm,
			ibufferr: ibufferr,
			ibuffers: ibuffers,
			pois: pois,
		};
		return result;
	}
}

ForexShaper_PredictorV6.PoiType = {};
ForexShaper_PredictorV6.PoiType.Peak = 1;
ForexShaper_PredictorV6.PoiType.Valley = 2;
ForexShaper_PredictorV6.PoiType.NzStart = 3;
ForexShaper_PredictorV6.PoiType.NzEnd = 4;
ForexShaper_PredictorV6.PoiType.ReverseStart = 5;
ForexShaper_PredictorV6.PoiType.ReverseEnd = 6;