"use strict";

class ForexLandscapeShaperV7
{
	constructor(par)
	{
		this._windowDpCount = par.windowDpCount || 4 * 60;
		this._pageSizeMs = par.pageSizeMs || 60 * 60 * 1000;
		this._extremumVicinity = par.extremumVicinity || 3;
		this._extremumDeviationTolerance = par.extremumDeviationTolerance || 0.12;
		//this._spreadSdyTolerance = par.spreadSdyTolerance || 0.175;
		this._spreadSdyTolerance = par.spreadSdyTolerance || 0.05;
		this._channelToPriceSpreadTolerance = par.channelToPriceSpreadTolerance || 5;
		this._channelSimilarity_sdAngleTolerance = par.channelSimilarity_sdAngleTolerance || Math.PI / 120;
		this._channelSimilarity_spreadTolerance = par.channelSimilarity_spreadTolerance || 0.15;
		this._channelSimilarity_startDpCountTolerance = par.channelSimilarity_startDpCountTolerance || 5;

		//this._baseExtremumDpCount = par.baseExtremumDpCount || 3;
		this._baseExtremumDpCount = par.baseExtremumDpCount || 2;
		this._baseContraExtremumSelectionMode = par.baseContraExtremumSelectionMode || "farthest";
		//this._baseContraExtremumSelectionMode = par.baseContraExtremumSelectionMode || "latest";

		if (this._baseExtremumDpCount != 2 && this._baseExtremumDpCount != 3) throw "Argument is invalid: par.baseExtremumDpCount.";
		if (this._baseContraExtremumSelectionMode != "latest" && this._baseContraExtremumSelectionMode != "farthest") throw "Argument is invalid: par.baseContraExtremumSelectionMode.";
	}

	async shape(data, step)
	{
		const extremumInfo = this._shapeExtremums(data);

		const valleys = [];
		for (let length = extremumInfo.valleys.length, i = 0; i < length; ++i)
		{
			const item = extremumInfo.valleys[i];
			if (item.di > this._extremumVicinity) break;
			valleys.push(item);
		}

		const peaks = [];
		for (let length = extremumInfo.peaks.length, i = 0; i < length; ++i)
		{
			const item = extremumInfo.peaks[i];
			if (item.di > this._extremumVicinity) break;
			peaks.push(item);
		}
		const channelHash = new HashSet();
		const channels = [];
		let arv = new ArrayView(data, 0, this._extremumVicinity);
		for (let length = data.length, i0 = 0, i1 = this._extremumVicinity - 1; i1 < length; ++i1)
		{
			if (i1 - i0 > this._windowDpCount) ++i0;
			arv.transform(i0, i1 - i0 + 1);
			const dp = arv.last();

			if (valleys.length && valleys[0].di < i0) valleys.shift(); 
			const valley = extremumInfo.valleyMap[i1];
			if (valley) valleys.push(valley);

			if (peaks.length && peaks[0].di < i0) peaks.shift();
			const peak = extremumInfo.peakMap[i1];
			if (peak) peaks.push(peak);

			for (var i = arv.length - 3; i >= 0; --i)
			{
				const rarv = arv.extract(i, arv.length - i);
				const dt0 = rarv.first("dt");
				const dt1 = rarv.last("dt");
				const dpals = rarv.map((m) => ({ x: m.dt, y: m.raw.al }));
				const dpbhs = rarv.map((m) => ({ x: m.dt, y: m.raw.bh }));
				const dpabs = rarv.map((m) => ({ x: m.dt, y: (m.raw.bh + m.raw.al) / 2 }));
				const trendLine = LinearFunction.buildLineOfBestFit(dpabs);
				const svalleys = [];
				for (let k = valleys.length - 1; k >= 0; --k)
				{
					let m = valleys[k];
					if (m.m.dt < dt0) break;
					m.d = trendLine.calc(m.m.dt) - m.v;
					svalleys.push(m);
				}
				const speaks = [];
				for (let k = peaks.length - 1; k >= 0; --k)
				{
					let m = peaks[k];
					if (m.m.dt < dt0) break;
					m.d = m.v - trendLine.calc(m.m.dt);
					speaks.push(m);
				}
				if (trendLine.a < 0)
				{
					if (svalleys.length < 3) continue;
					if (speaks.length < 1) continue;
				}
				else
				{
					if (speaks.length < 3) continue;
					if (svalleys.length < 1) continue;
				}
				if (step) await step(dt0, dt1, channels, speaks, svalleys, trendLine);
				let insample_in = null;
				let sdx = null;
				let sdy = null;
				let extremums = null;
				let signatureExtremums = null;
				let extremumsObject = null;
				let supportLine = null;
				let resistanceLine = null;
				if (trendLine.a < 0)
				{
					const sample = new Sample(dpals);
					sdx = sample.standardDeviation("x");
					sdy = sample.standardDeviation("y");

					let peak;
					if (this._baseContraExtremumSelectionMode == "latest") peak = speaks.reduce((p, c) => p.m.dt > c.m.dt ? p : c);
					else peak = speaks.reduce((p, c) => p.d > c.d ? p : c);

					svalleys.sort((l, r) => r.d - l.d);
					const ei0 = svalleys[0].i, edp0 = data[ei0];
					const ei1 = svalleys[1].i, edp1 = data[ei1];
					if (this._baseExtremumDpCount == 3)
					{
						const i2 = svalleys[2].i, dp2 = data[i2];
						extremums = [svalleys[0], svalleys[1], svalleys[2], peak].sort((l, r) => l.m.dt - r.m.dt);
						signatureExtremums = [svalleys[0], svalleys[1], svalleys[2]].sort((l, r) => l.m.dt - r.m.dt);
						extremumsObject = ForexChannelV7.createExtremumsObject(signatureExtremums);
						if (channelHash.has(extremumsObject)) continue;
						const sdLine1 = LinearFunction.buildLineFromPoints({ x: edp0.dt / sdx, y: edp0.raw.al / sdy }, { x: edp1.dt / sdx, y: edp1.raw.al / sdy });
						const sdLine2 = LinearFunction.buildLineFromPoints({ x: edp0.dt / sdx, y: edp0.raw.al / sdy }, { x: dp2.dt / sdx, y: dp2.raw.al / sdy });
						if (sdLine1.angleWith(sdLine2) > this._extremumDeviationTolerance) continue;
						supportLine = LinearFunction.buildLineOfBestFit([{ x: edp0.dt, y: edp0.raw.al }, { x: edp1.dt, y: edp1.raw.al }, { x: dp2.dt, y: dp2.raw.al }]);
						resistanceLine = LinearFunction.buildLineFromPointSlope({ x: peak.m.dt, y: peak.m.raw.bh }, supportLine.slope);
					}
					else
					{
						extremums = [svalleys[0], svalleys[1], peak].sort((l, r) => l.m.dt - r.m.dt);
						signatureExtremums = [svalleys[0], svalleys[1]].sort((l, r) => l.m.dt - r.m.dt);
						extremumsObject = ForexChannelV7.createExtremumsObject(signatureExtremums);
						if (channelHash.has(extremumsObject)) continue;
						supportLine = LinearFunction.buildLineOfBestFit([{ x: edp0.dt, y: edp0.raw.al }, { x: edp1.dt, y: edp1.raw.al }]);
						resistanceLine = LinearFunction.buildLineFromPointSlope({ x: peak.m.dt, y: peak.m.raw.bh }, supportLine.slope);
					}
					insample_in = new Sample(new ArrayView(rarv, extremums[0].i, ei1 - extremums[0].i).map((m) => ({ x: m.dt, y: m.raw.al })));
				}
				else
				{
					const sample = new Sample(dpbhs);
					sdx = sample.standardDeviation("x");
					sdy = sample.standardDeviation("y");

					let valley;
					if (this._baseContraExtremumSelectionMode == "latest") valley = svalleys.reduce((p, c) => p.m.dt > c.m.dt ? p : c);
					else valley = svalleys.reduce((p, c) => p.d > c.d ? p : c);
					speaks.sort((l, r) => r.d - l.d);

					const ei0 = speaks[0].i, edp0 = data[ei0];
					const ei1 = speaks[1].i, edp1 = data[ei1];
					if (this._baseExtremumDpCount == 3)
					{
						const i2 = speaks[2].i, dp2 = data[i2];
						extremums = [speaks[0], speaks[1], speaks[2], valley].sort((l, r) => l.m.dt - r.m.dt);
						signatureExtremums = [speaks[0], speaks[1], speaks[2]].sort((l, r) => l.m.dt - r.m.dt);
						extremumsObject = ForexChannelV7.createExtremumsObject(signatureExtremums);
						if (channelHash.has(extremumsObject)) continue;
						const sdLine1 = LinearFunction.buildLineFromPoints({ x: edp0.dt / sdx, y: edp0.raw.bh / sdy }, { x: edp1.dt / sdx, y: edp1.raw.bh / sdy });
						const sdLine2 = LinearFunction.buildLineFromPoints({ x: edp0.dt / sdx, y: edp0.raw.bh / sdy }, { x: dp2.dt / sdx, y: dp2.raw.bh / sdy });
						if (sdLine1.angleWith(sdLine2) > this._extremumDeviationTolerance) continue;
						resistanceLine = LinearFunction.buildLineOfBestFit([{ x: edp0.dt, y: edp0.raw.bh }, { x: edp1.dt, y: edp1.raw.bh }, { x: dp2.dt, y: dp2.raw.bh }]);
						supportLine = LinearFunction.buildLineFromPointSlope({ x: valley.m.dt, y: valley.m.raw.al }, resistanceLine.slope);
					}
					else
					{
						extremums = [speaks[0], speaks[1], valley].sort((l, r) => l.m.dt - r.m.dt);
						signatureExtremums = [speaks[0], speaks[1]].sort((l, r) => l.m.dt - r.m.dt);
						extremumsObject = ForexChannelV7.createExtremumsObject(signatureExtremums);
						if (channelHash.has(extremumsObject)) continue;
						resistanceLine = LinearFunction.buildLineOfBestFit([{ x: edp0.dt, y: edp0.raw.bh }, { x: edp1.dt, y: edp1.raw.bh }]);
						supportLine = LinearFunction.buildLineFromPointSlope({ x: valley.m.dt, y: valley.m.raw.al }, resistanceLine.slope);
					}
					insample_in = new Sample(new ArrayView(rarv, extremums[0].i, ei1 - extremums[0].i).map((m) => ({ x: m.dt, y: m.raw.bh })));
				}
				const sdx_in = insample_in.standardDeviation("y");
				const sdy_in = insample_in.standardDeviation("y");
				const spread = resistanceLine.calc(data[0].dt) - supportLine.calc(data[0].dt);
				const sdTrendLine = LinearFunction.buildScaledLine(trendLine, 1 / sdx_in, 1 / sdy_in);
				const ratio = spread / sdy_in / 2;
				const fractional = ratio - Math.floor(ratio);

				//	reject channels with spread too close to the current price spread
				if (spread < this._channelToPriceSpreadTolerance * (dp.ask - dp.bid)) continue;

				//	reject the channel if the current price is already outside at the time of detection
				if (dp.raw.al - supportLine.calc(dp.dt) < 0 || dp.raw.bh - resistanceLine.calc(dp.dt) > 0) continue;

				//	reject channels opposing the trendline
				if (Math.sign(supportLine.a) != Math.sign(trendLine.a)) continue;

				//	reject channels with no defined standard deviations
				if (!sdx_in || !sdy_in) continue;

				//	reject channels with spreads not aligned with the sdy unit
				if (1 - fractional > this._spreadSdyTolerance) continue;

				//	reject newer channels that are too similar to older channels
				let isDuplicate = false;
				for (let klength = channels.length, k = 0; k < klength; ++k)
				{
					const kitem = channels[k];
					const isParallel = (sdTrendLine.angleWith(LinearFunction.buildScaledLine(kitem.supportLine, 1 / sdx_in, 1 / sdy_in)) < this._channelSimilarity_sdAngleTolerance);
					const isSameSpread = (Math.abs(1 - spread / kitem.spread) < this._channelSimilarity_spreadTolerance || Math.abs(1 - kitem.spread / spread) < this._channelSimilarity_spreadTolerance);
					const isSameStart = (Math.abs(extremums[0].i - kitem.startIndex) <= this._channelSimilarity_startDpCountTolerance);
					if (isParallel && isSameSpread && isSameStart) { isDuplicate = true; break; }
				}
				if (isDuplicate) continue;

				channelHash.set(extremumsObject);
				const channel = new ForexChannelV7(
				{
					extremums: extremums,
					signatureExtremums: signatureExtremums,
					startDp: extremums[0].m,
					startIndex: extremums[0].i,
					detectionDp: dp,
					detectionIndex: i1,
					endDp: null,
					longEndDp: null,
					supportLine: supportLine,
					resistanceLine: resistanceLine,
					spread: spread,
					direction: Math.sign(supportLine.a),
					sdr: insample_in.standardDeviationOfResiduals("x", "y"),
					sdy: sdy_in,
					sdyType: Math.round(ratio),
					sdyPrecision: 1 - ((1 - fractional) / this._spreadSdyTolerance),
					cc: insample_in.correlationCoefficient("x", "y"),
					cod: insample_in.coefficientOfDetermination("x", "y"),
				});
				if (channel.detectionIndex <= channel.startIndex) debugger
				channels.push(channel);
			}
		}

		const result =
		{
			data: data,
			extremumInfo: extremumInfo,
			channels: channels,
		};
		return result;
	}

	analyseChannels(shaperResult)
	{
		const concurrencyIds = [];
		function getConcurrencyId()
		{
			for (let length = 9999, i = 0; i < length; ++i) if (!concurrencyIds[i]) { concurrencyIds[i] = true; return i; }
			throw "Limit exceeded.";
		}
		function releaseConcurrencyId(id) { concurrencyIds[id] = false; }

		const channelMap = ArrayMapper.mapByKey(shaperResult.channels, (m) => m.startDp.dt, true);
		let currentChannels = [];
		let maxConcurrentChannelCount = 0;
		for (let length = shaperResult.data.length, i = 0; i < length; ++i)
		{
			const dp = shaperResult.data[i];
			const c = channelMap[dp.dt];
			if (c)
			{
				if (Array.isArray(c))
				{
					currentChannels = currentChannels.concat(c);
					for (let klength = c.length, k = 0; k < klength; ++k) c[k].concurrencyId = getConcurrencyId();
				}
				else
				{
					c.concurrencyId = getConcurrencyId();
					currentChannels.push(c);
				}
			}
			maxConcurrentChannelCount = Math.max(maxConcurrentChannelCount, currentChannels.length);
			const currentChannels_mod = [];
			for (let klength = currentChannels.length, k = 0; k < klength; ++k)
			{
				const cc = currentChannels[k];
				let ccEnd = false;
				switch (cc.direction)
				{
					case -1:
						if (!cc.longEndDp && dp.dt > cc.detectionDp.dt && dp.raw.bl > cc.resistanceLine.calc(dp.dt)) ccEnd = true;
						break;
					case 1:
						if (!cc.longEndDp && dp.dt > cc.detectionDp.dt && dp.raw.ah < cc.supportLine.calc(dp.dt)) ccEnd = true;
						break;
					case 0:
						if (!cc.longEndDp && dp.dt > cc.detectionDp.dt && (dp.raw.bl > cc.resistanceLine.calc(dp.dt) || dp.raw.ah < cc.supportLine.calc(dp.dt))) ccEnd = true;
						break;
				}
				if (ccEnd)
				{
					releaseConcurrencyId(cc.concurrencyId);
					cc.longEndDp = dp;
					cc.data.push(dp);
				}
				else if (!cc.longEndDp)
				{
					currentChannels_mod.push(cc);
					cc.data.push(dp);
				}
			}
			currentChannels = currentChannels_mod;
		}

		for (let length = shaperResult.channels.length, i = 0; i < length; ++i)
		{
			const channel = shaperResult.channels[i];
			const count = channel.detectionIndex - channel.startIndex;
			channel.msdy = ForexLandscapeShaperV7._buildMSdy(channel, count);
			//channel.ema = ForexLandscapeShaperV7._buildEMA(channel.data, count);
		}

		const result =
		{
			maxConcurrentChannelCount,
		};
		return result;
	}

	_shapeExtremums(data)
	{
		const valleys = Sample.valleys(new ArrayMapper(data, { y: (m) => m.raw.al }), this._extremumVicinity, "y");
		const valleyMap = ArrayView.mapByKey(ArrayView.wrap(valleys).toArray(), "di");

		const peaks = Sample.peaks(new ArrayMapper(data, { y: (m) => m.raw.bh }), this._extremumVicinity, "y");
		const peakMap = ArrayView.mapByKey(ArrayView.wrap(peaks).toArray(), "di");

		var result =
		{
			valleys,
			valleyMap,
			peaks,
			peakMap,
		};
		return result;
	}

	//static _buildMSdy(data, count)
	//{
	//	let initialSda = null;
	//	return Sample.movingAverage(new ArrayMapper(data, { a: (m) => (m.raw.ah + m.raw.bl) / 2 }), count, (arv) =>
	//	{
	//		const sda = Sample.standardDeviation(arv, "a");
	//		if (initialSda == null) initialSda = sda;
	//		return {
	//			dt: arv.last("dt"),
	//			y: sda / initialSda,
	//		};
	//	});
	//}

	static _buildMSdy(channel, count)
	{
		const arm = new ArrayMapper(channel.data, { a: (m) => (m.raw.ah + m.raw.bl) / 2 });
		let detectionLevel = null;
		const emsdy_index = {};
		const emsdy = Sample.emsdy(arm, count, "a", (current, i, arv) =>
		{
			const dt = arv.get(i, "dt");
			if (dt == channel.detectionDp.dt) detectionLevel = current;
			emsdy_index[dt] = current;
			return {
				i: i,
				dt: dt,
				y: current,
			};
		});
		const result =
		{
			emsdy,
			emsdy_index: emsdy_index,
			detectionLevel,
		};
		return result;
	}

	static _buildEMA(data, count)
	{
		const arm = new ArrayMapper(data, { a: (m) => (m.raw.ah + m.raw.bl) / 2 });
		return Sample.ema(arm, count, "a", (current, i, arv) =>
		{
			return {
				i: i,
				dt: arv.get(i, "dt"),
				y: current,
			};
		});
	}


	get windowDpCount() { return this._windowDpCount; }
	get pageSizeMs() { return this._pageSizeMs; }
	get extremumVicinity() { return this._extremumVicinity; }
	get extremumDeviationTolerance() { return this._extremumDeviationTolerance; }
	get spreadSdyTolerance() { return this._spreadSdyTolerance; }
	get channelToPriceSpreadTolerance() { return this._channelToPriceSpreadTolerance; }
	get channelSimilarity_sdAngleTolerance() { return this._channelSimilarity_sdAngleTolerance; }
	get channelSimilarity_spreadTolerance() { return this._channelSimilarity_spreadTolerance; }
	get baseExtremumDpCount() { return this._baseExtremumDpCount; }
	get baseContraExtremumSelectionMode() { return this._baseContraExtremumSelectionMode; }
}