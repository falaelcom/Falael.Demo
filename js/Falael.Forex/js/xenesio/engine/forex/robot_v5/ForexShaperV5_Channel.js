"use strict";

include("StdAfx.js");

//	ccsc - correlation coefficient sign change
class ForexShaperV5_Channel extends ForexShaperV5
{
	//	par.priceSourcing: EPriceSourcingV5
	constructor(par)
	{
		super(par);

		this._channelMode = par.channelMode || "supportAndResistance";	//	"lineOfBestFit", "supportAndResistance"
//		this._channelMode = par.channelMode || "lineOfBestFit";	//	"lineOfBestFit", "supportAndResistance"
		this._minSignificantDataPointCount = par.minSignificantDataPointCount;
		this._maxChannelDataPointCount = par.maxChannelDataPointCount;

		this._priceSourcing = par.priceSourcing;

		//	!!! https://tradingstrategyguides.com/rabbit-trail-channel-trading-strategy/

		this._supportAndResistance_minSignificantDatapointCount = 5;
		this._supportAndResistance_maxIntermissionDatapointCount = 100;
		this._supportAndResistance_minChannelSpread = par.supportAndResistance_minChannelSpread;
		this._supportAndResistance_angleAsymmetryThreshold = 0.07;
		this._supportAndResistance_derangeThresholdFactor = par.supportAndResistance_derangeThresholdFactor;
		this._supportAndResistance_centralAsymmetryThresholdFactor = 1;

		this._lineOfBestFit_variability_windowSize = par.lineOfBestFit_variability_windowSize;
		this._lineOfBestFit_spi1_variability_lowerThreshold = par.lineOfBestFit_spi1_variability_lowerThreshold;
		this._lineOfBestFit_spi1_standardDeviation_thresholdFactor = par.lineOfBestFit_spi1_standardDeviation_thresholdFactor;
		this._lineOfBestFit_deadZone_inertiaPointCount = par.lineOfBestFit_deadZone_inertiaPointCount;

		this._traderLBF = par.traderLBF;
		this._traderSNR_ZigZag = par.traderSNR_ZigZag;

		//this._lineOfBestFit_dataPointSelector = EDataPointSelectorV5.AskBid_All;
		this._lineOfBestFit_dataPointSelector = EDataPointSelectorV5.AskBid_Extremums;
	}

	//	returns ForexFeatureV5_Channel
	shape(context, dataPoints, par)
	{
		var progressInfo = context.progressInfo;

		if (!dataPoints) throw "Argument is null: dataPoints.";

		if (dataPoints.length < this._minSignificantDataPointCount) return null;

		var rawSample = this.remap(dataPoints);
		var dataPointSample = this.select(rawSample);

		var closeRawSample = new MappedArray(dataPoints,
		{
			dt: item => item.raw.dt,
			ask: item => item.raw.ac,
			bid: item => item.raw.bc,
		});

		if (!progressInfo)
		{
			progressInfo =
			{
				firstDt: rawSample.getAt(0, "dt"),
				currentDt: null,
				datapoint_spi2: null,
				i: 0,

				trades: [],
				trader_LBF: new ForexTraderV5_Channel_LBF(this._traderLBF, (sender, args) => progressInfo.trades.push(args), (sender, args) => progressInfo.trades.push(args)),
				trader_SNR_ZigZag: new ForexTraderV5_Channel_SNR_ZigZag(this._traderSNR_ZigZag, (sender, args) => progressInfo.trades.push(args), (sender, args) => progressInfo.trades.push(args)),

				supportAndResistanceInfo: null,
				lineOfBestFitInfo:
				{
					significantPointSample: null,
					trendLine: null,
					correlationData: [],
					variabilityData: [],
					buffer: [],
					currentSample: null,
					spi1_info: null,
					turningPoints_spi3: [],
					turningPoints_spi3_last_ccs: null,
					turningPoints_spi3_first: null,
					sdyData: [],
					sdTrendLineAngle: [],
					deadZoneData: [],
					currentDeadZone: null,
					currentDeadZone_inertiaCounter: 0,
				},
			};
		}

		function lineOfBestFit_buildSignificantPointSample(pointSample)
		{
			var lineOfBestFit_significantPointSample = null;
			switch (this._lineOfBestFit_dataPointSelector)
			{
				case EDataPointSelectorV5.AskBid_All:
					lineOfBestFit_significantPointSample = pointSample;
					break;
				case EDataPointSelectorV5.AskBid_Extremums:
					lineOfBestFit_significantPointSample = pointSample.extremumSamples("x", "y", { singlePoints: true }).extremums;
					break;
				default:
					throw "Not implemented.";
			}
			return lineOfBestFit_significantPointSample;
		}

		function supportAndResistance_getInfo(max)
		{
			var valleysA_all = rawSample.extremumSamples("dt", "ask", { excludePeaks: true, singlePoints: true }).extremums.remapSample({ x: rawSample.valueAccessors.dt, y: rawSample.valueAccessors.ask });
			if (!valleysA_all.length) return null;
			var peaksB_all = rawSample.extremumSamples("dt", "bid", { excludeValleys: true, singlePoints: true }).extremums.remapSample({ x: rawSample.valueAccessors.dt, y: rawSample.valueAccessors.bid });
			if (!peaksB_all.length) return null;

			var maxDt = rawSample.getAt(max, "dt");

			var bufferRaw = [];
			var bufferAB = [];
			var supportAndResistanceInfo = null;
			for (var i = max; i >= Math.max(0, max - this._supportAndResistance_maxIntermissionDatapointCount); --i)
			{
				var dt = rawSample.getAt(i, "dt");
				var ask = rawSample.getAt(i, "ask");
				var bid = rawSample.getAt(i, "bid");

				//	.push is ok, because the actual order of the items does not matter for any of the calculations in the loop
				//	.push is much much faster than .unshift
				bufferRaw.push({ dt: dt, ask: ask, bid: bid, i: bufferRaw.length });
				bufferAB.push({ x: dt, y: ask, i: bufferAB.length });
				bufferAB.push({ x: dt, y: bid, i: bufferAB.length });

				if (bufferRaw.length < this._supportAndResistance_minSignificantDatapointCount * 3) continue;

				var subSample = new MappedArray(bufferRaw);
				var sdx = subSample.standardDeviation("dt");
				var sdya = subSample.standardDeviation("ask");
				var sdyb = subSample.standardDeviation("bid");

				var subSampleAB = new MappedArray(bufferAB);
				var trendLineAB = subSampleAB.lineOfBestFit("x", "y");
				var valleysA = valleysA_all.selectSample(function (item, i)
				{
					var itemDt = valleysA_all.getAt(i, "x");
					return itemDt > dt && itemDt < maxDt;
				});
				var sdTrendLineAB_onA = LinearFunction.buildScaledLine(trendLineAB, 1 / sdx, 1 / sdya);
				valleysA.transformItems(function transformItem(item, i)
				{
					var x = valleysA.accessValue(item, "x");
					var y = valleysA.accessValue(item, "y");
					item.ia = i;
					var sdPoint = { x: x / sdx, y: y / sdya };
					var sign = sdTrendLineAB_onA.isBelowPoint(sdPoint) ? -1 : 1;
					item.d = sign * sdTrendLineAB_onA.distanceTo(sdPoint);
					item.sxa = x / sdx;
					item.sya = y / sdya;
				});
				var sdDistanceSortedA = valleysA.sortedSample((l, r) => r.d - l.d);
				var flagA = false;
				if (sdDistanceSortedA.length >= this._supportAndResistance_minSignificantDatapointCount)
				{
					//	test a larger subsample of most distant points, not only the top 2
					var i0 = sdDistanceSortedA.getAt(0, "ia");
					var i1 = sdDistanceSortedA.getAt(1, "ia");
					var sdLine = LinearFunction.buildLineFromPoints({ x: valleysA.getAt(i0, "sxa"), y: valleysA.getAt(i0, "sya") }, { x: valleysA.getAt(i1, "sxa"), y: valleysA.getAt(i1, "sya") });
					var sdAngle = sdLine.angleWith(sdTrendLineAB_onA);
					var angleThreshold = this._supportAndResistance_angleAsymmetryThreshold;
					flagA = (sdAngle < angleThreshold);
				}

				var peaksB = peaksB_all.selectSample(function (item, i)
				{
					var itemDt = peaksB_all.getAt(i, "x");
					return itemDt > dt && itemDt < maxDt;
				});
				var sdTrendLineAB_onB = LinearFunction.buildScaledLine(trendLineAB, 1 / sdx, 1 / sdyb);
				peaksB.transformItems(function transformItem(item, i)
				{
					var x = peaksB.accessValue(item, "x");
					var y = peaksB.accessValue(item, "y");
					item.ib = i;
					var sdPoint = { x: x / sdx, y: y / sdyb };
					var sign = sdTrendLineAB_onB.isBelowPoint(sdPoint) ? 1 : -1;
					item.d = sign * sdTrendLineAB_onB.distanceTo(sdPoint);
					item.sxb = x / sdx;
					item.syb = y / sdyb;
				});
				var sdDistanceSortedB = peaksB.sortedSample((l, r) => r.d - l.d);
				var flagB = false;
				if (sdDistanceSortedB.length >= this._supportAndResistance_minSignificantDatapointCount)
				{
					var i0 = sdDistanceSortedB.getAt(0, "ib");
					var i1 = sdDistanceSortedB.getAt(1, "ib");
					var sdLine = LinearFunction.buildLineFromPoints({ x: peaksB.getAt(i0, "sxb"), y: peaksB.getAt(i0, "syb") }, { x: peaksB.getAt(i1, "sxb"), y: peaksB.getAt(i1, "syb") });
					var sdAngle = sdLine.angleWith(sdTrendLineAB_onB);
					var angleThreshold = this._supportAndResistance_angleAsymmetryThreshold;
					flagB = (sdAngle < angleThreshold);
				}

				if (flagA && flagB)
				{
					supportAndResistanceInfo =
					{
						trendLineAB: trendLineAB,
						subSampleAB: subSampleAB,
						valleysA: valleysA,
						peaksB: peaksB,

						definingPoint: null,
						channelSpread: null,

						significantValleyPoints: null,
						middlePointA: null,
						supportTrendLineA: null,

						significantPeakPoints: null,
						middlePointB: null,
						resistanceTrendLineB: null,
					};

					var i0 = sdDistanceSortedA.getAt(0, "ia");
					var i1 = sdDistanceSortedA.getAt(1, "ia");
					var middlePointA = { x: (valleysA.getAt(i0, "x") + valleysA.getAt(i1, "x")) / 2, y: (valleysA.getAt(i0, "y") + valleysA.getAt(i1, "y")) / 2 };
					supportAndResistanceInfo.significantValleyPoints =
					[
						{ x: valleysA.getAt(i0, "x"), y: valleysA.getAt(i0, "y") },
						{ x: valleysA.getAt(i1, "x"), y: valleysA.getAt(i1, "y") },
					];
					supportAndResistanceInfo.middlePointA = middlePointA;
					supportAndResistanceInfo.supportTrendLineA = LinearFunction.buildLineFromPointSlope(middlePointA, trendLineAB.slope);

					var i0 = sdDistanceSortedB.getAt(0, "ib");
					var i1 = sdDistanceSortedB.getAt(1, "ib");
					var middlePointB = { x: (peaksB.getAt(i0, "x") + peaksB.getAt(i1, "x")) / 2, y: (peaksB.getAt(i0, "y") + peaksB.getAt(i1, "y")) / 2 };
					supportAndResistanceInfo.significantPeakPoints =
					[
						{ x: peaksB.getAt(i0, "x"), y: peaksB.getAt(i0, "y") },
						{ x: peaksB.getAt(i1, "x"), y: peaksB.getAt(i1, "y") },
					];
					supportAndResistanceInfo.middlePointB = middlePointB;
					supportAndResistanceInfo.resistanceTrendLineB = LinearFunction.buildLineFromPointSlope(middlePointB, trendLineAB.slope);

					var significantExtremumPoints = supportAndResistanceInfo.significantValleyPoints.concat(supportAndResistanceInfo.significantPeakPoints);
					significantExtremumPoints.sort((l, r) => r.x - l.x);
					supportAndResistanceInfo.definingPoint = significantExtremumPoints[0];

					supportAndResistanceInfo.channelSpread = supportAndResistanceInfo.resistanceTrendLineB.calc(closeRawSample.getAt(ri, "dt")) - supportAndResistanceInfo.supportTrendLineA.calc(closeRawSample.getAt(ri, "dt"));

					if (supportAndResistanceInfo.channelSpread < this._supportAndResistance_minChannelSpread) continue;

					var resistanceD = supportAndResistanceInfo.resistanceTrendLineB.b - supportAndResistanceInfo.trendLineAB.b;
					var supportD = supportAndResistanceInfo.trendLineAB.b - supportAndResistanceInfo.supportTrendLineA.b;

					if (Math.abs(resistanceD - supportD) > supportAndResistanceInfo.channelSpread * this._supportAndResistance_centralAsymmetryThresholdFactor) continue;

					return supportAndResistanceInfo;
				}
			}

			return null;
		}

		for (var length = dataPointSample.length, ri = Math.floor(progressInfo.i / 2); progressInfo.i < length; ++progressInfo.i, ri = Math.floor(progressInfo.i / 2))
		{
			var item = dataPointSample.getAt(progressInfo.i);
			progressInfo.lineOfBestFitInfo.buffer.push(item);
			if (progressInfo.currentDt === item.x) continue;
			progressInfo.currentDt = item.x;
			if (progressInfo.i < this._minSignificantDataPointCount) continue;
			if (!context.infinite) if (ri >= this._maxChannelDataPointCount) break;

			switch (this._channelMode)
			{
				case "lineOfBestFit":
					break;
				case "supportAndResistance":
					if (!progressInfo.supportAndResistanceInfo) progressInfo.supportAndResistanceInfo = supportAndResistance_getInfo.bind(this)(ri);
					break;
				default: throw "Not implemented.";
			}

			progressInfo.lineOfBestFitInfo.currentSample = new MappedArray(progressInfo.lineOfBestFitInfo.buffer);
			var correlationCoefficient;
			var correlationSign;
			try
			{
				correlationCoefficient = progressInfo.lineOfBestFitInfo.currentSample.correlationCoefficient("x", "y");
				correlationSign = progressInfo.lineOfBestFitInfo.currentSample.correlationSign("x", "y");
				progressInfo.lineOfBestFitInfo.correlationData.push({ x: item.x, y: correlationCoefficient, s: correlationSign, sy: correlationSign * correlationCoefficient });
			}
			catch (ex)	//	all y values in the sample are equal
			{
				log(2334556, ex);
				continue;
			}

			var k = progressInfo.lineOfBestFitInfo.correlationData.length - 1;
			//	in-plcace incremental variability calculation
			if (k >= this._lineOfBestFit_variability_windowSize)
			{
				function variability(data, valueRange)
				{
					var subSample = new MappedArray(data);
					var sdMin = MappedArray.calcSdnormLowerFactor(data.length) * valueRange.min;
					var sdMax = MappedArray.calcSdnormUpperFactor(data.length) * valueRange.max;
					var sdRange = sdMax - sdMin;
					var sd = subSample.standardDeviation("y");
					var result = (sd - sdMin) / sdRange;
					if (result > 1) return 1;
					if (result < 0) return 0;
					return result;
				}
				var data = progressInfo.lineOfBestFitInfo.correlationData.slice(k - this._lineOfBestFit_variability_windowSize, k);
				var variabilityItem =
				{
					x: item.x,
					value: variability(data, new Range(0, 1)),
				};
				progressInfo.lineOfBestFitInfo.variabilityData.push(variabilityItem);
			}

			//	find first low point in variability
			if (!progressInfo.lineOfBestFitInfo.spi1_info && progressInfo.lineOfBestFitInfo.variabilityData.length)
			{
				var variabilityItem = progressInfo.lineOfBestFitInfo.variabilityData[progressInfo.lineOfBestFitInfo.variabilityData.length - 1];
				if (variabilityItem.value < this._lineOfBestFit_spi1_variability_lowerThreshold) progressInfo.lineOfBestFitInfo.spi1_info =
				{
					item: variabilityItem,
				};
			}

			progressInfo.lineOfBestFitInfo.significantPointSample = lineOfBestFit_buildSignificantPointSample.bind(this)(progressInfo.lineOfBestFitInfo.currentSample);
			if (progressInfo.lineOfBestFitInfo.significantPointSample.length < this._minSignificantDataPointCount) continue;

			var lineOfBestFit_sdAngleFactor = progressInfo.lineOfBestFitInfo.significantPointSample.sdAngleFactor("x", "y");
			var lineOfBestFit_sdAngleFactorSign = Math.sign(lineOfBestFit_sdAngleFactor);
			if (progressInfo.lineOfBestFitInfo.turningPoints_spi3_first === null) progressInfo.lineOfBestFitInfo.turningPoints_spi3_first =
			{
				item: item,
				correleationItem: { x: item.x, y: lineOfBestFit_sdAngleFactor },
				correlationSign: lineOfBestFit_sdAngleFactorSign,
			};
			else if (progressInfo.lineOfBestFitInfo.turningPoints_spi3_last_ccs != lineOfBestFit_sdAngleFactorSign)
			{
				progressInfo.lineOfBestFitInfo.turningPoints_spi3.push(
				{
					item: item,
					correleationItem: { x: item.x, y: lineOfBestFit_sdAngleFactor },
					correlationSign: lineOfBestFit_sdAngleFactorSign,
				});
			}
			progressInfo.lineOfBestFitInfo.turningPoints_spi3_last_ccs = lineOfBestFit_sdAngleFactorSign;

			//	build trendline
			progressInfo.lineOfBestFitInfo.trendLine = progressInfo.lineOfBestFitInfo.significantPointSample.lineOfBestFit("x", "y");

			progressInfo.lineOfBestFitInfo.sdyData.push(
			{
				x: rawSample.getAt(ri, "dt"),
				ask: rawSample.getAt(ri, "ask"),
				bid: rawSample.getAt(ri, "bid"),
				sdy: progressInfo.lineOfBestFitInfo.currentSample.standardDeviation("y"),
				tly: progressInfo.lineOfBestFitInfo.trendLine.calc(rawSample.getAt(ri, "dt")),
			});

			progressInfo.lineOfBestFitInfo.sdTrendLineAngle.push(
			{
				x: item.x,
				a: progressInfo.lineOfBestFitInfo.significantPointSample.sdAngleFactor("x", "y"),
			});

			var lineOfBestFit_sdTrendLineAngleSample = new MappedArray(progressInfo.lineOfBestFitInfo.sdTrendLineAngle);
			var lineOfBestFit_sdySample = new MappedArray(progressInfo.lineOfBestFitInfo.sdyData);
			var lineOfBestFit_sdySample_derivative = lineOfBestFit_sdySample.derivativeSample("x", "tly");

			//	dead zone
			if (lineOfBestFit_sdySample_derivative.length)
			{
				var x = lineOfBestFit_sdySample_derivative.getAt(lineOfBestFit_sdySample_derivative.length - 1, "x");
				var tly = lineOfBestFit_sdySample_derivative.getAt(lineOfBestFit_sdySample_derivative.length - 1, "tly");
				var foundAt = lineOfBestFit_sdTrendLineAngleSample.indexOf((item2) => item2.x >= x);
				if (foundAt != -1)
				{
					var a = lineOfBestFit_sdTrendLineAngleSample.getAt(foundAt, "a");
					if (Math.sign(a) != Math.sign(tly))
					{
						if (progressInfo.lineOfBestFitInfo.currentDeadZone)
						{
							progressInfo.lineOfBestFitInfo.currentDeadZone_inertiaCounter = 0;
						}
						else
						{
							progressInfo.lineOfBestFitInfo.currentDeadZone = new Range(x, Infinity);
							progressInfo.lineOfBestFitInfo.deadZoneData.push(progressInfo.lineOfBestFitInfo.currentDeadZone);
						}
					}
					else
					{
						if (progressInfo.lineOfBestFitInfo.currentDeadZone)
						{
							++progressInfo.lineOfBestFitInfo.currentDeadZone_inertiaCounter;
							if (progressInfo.lineOfBestFitInfo.currentDeadZone_inertiaCounter >= this._lineOfBestFit_deadZone_inertiaPointCount)
							{
								progressInfo.lineOfBestFitInfo.currentDeadZone.max = x;
								progressInfo.lineOfBestFitInfo.currentDeadZone_inertiaCounter = 0;
								progressInfo.lineOfBestFitInfo.currentDeadZone = null;
							}
						}
					}
				}
			}

			var flag_deadZone = Range.contain(progressInfo.lineOfBestFitInfo.deadZoneData, item.x);

			var isStable;
			switch (this._channelMode)
			{
				case "lineOfBestFit":
					isStable = !!progressInfo.lineOfBestFitInfo.spi1_info;
					break;
				case "supportAndResistance":
					isStable = !!progressInfo.supportAndResistanceInfo;
					break;
				default: throw "Not implemented.";
			}

			//	trades
			switch (this._channelMode)
			{
				case "lineOfBestFit":
					{
						progressInfo.trader_LBF.trade(Object.assign(
						{ 
							lineOfBestFit_currentSample: progressInfo.lineOfBestFitInfo.currentSample, 
							lineOfBestFit_trendLine: progressInfo.lineOfBestFitInfo.trendLine,
							lineOfBestFit_sdAngleFactor: lineOfBestFit_sdAngleFactor,
							lineOfBestFit_deadZoneData: progressInfo.lineOfBestFitInfo.deadZoneData,
						}, closeRawSample.getAt(ri)));
					}
					break;
				case "supportAndResistance":
					{
						if (!progressInfo.supportAndResistanceInfo) break;
						progressInfo.trader_SNR_ZigZag.trade(Object.assign(
						{ 
							trendLineAB: progressInfo.supportAndResistanceInfo.trendLineAB, 
							channelSpread: progressInfo.supportAndResistanceInfo.channelSpread,
							supportTrendLineA: progressInfo.supportAndResistanceInfo.supportTrendLineA,
							resistanceTrendLineB: progressInfo.supportAndResistanceInfo.resistanceTrendLineB,
						}, closeRawSample.getAt(ri)));
					}
					break;
				default: throw "Not implemented.";
			}

			//	find out-of-channel datapoint after the first low point
			if (isStable)
			{
				var flag_deranged = false;
				var sdThesholdOffset;
				var trendSign;
				var tly;
				switch (this._channelMode)
				{
					case "lineOfBestFit":
						{
							var sdy = progressInfo.lineOfBestFitInfo.currentSample.standardDeviation("y");
							sdThesholdOffset = this._lineOfBestFit_spi1_standardDeviation_thresholdFactor * sdy;
							trendSign = Math.sign(progressInfo.lineOfBestFitInfo.trendLine.a);
							tly = progressInfo.lineOfBestFitInfo.trendLine.calc(closeRawSample.getAt(ri, "dt"));
						}
						break;
					case "supportAndResistance":
						{
							var channelSpread = progressInfo.supportAndResistanceInfo.resistanceTrendLineB.calc(closeRawSample.getAt(ri, "dt")) - progressInfo.supportAndResistanceInfo.supportTrendLineA.calc(closeRawSample.getAt(ri, "dt"));
							sdThesholdOffset = this._supportAndResistance_derangeThresholdFactor * channelSpread;
							trendSign = Math.sign(progressInfo.supportAndResistanceInfo.trendLineAB.a);
							tly = progressInfo.supportAndResistanceInfo.trendLineAB.calc(closeRawSample.getAt(ri, "dt"));
						}
						break;
					default: throw "Not implemented.";
				}
				//if (trendSign > 0)
				//{
				//	flag_deranged = (closeRawSample.getAt(ri, "ask") < tly - sdThesholdOffset);
				//}
				//if (trendSign < 0)
				//{
				//	flag_deranged = (closeRawSample.getAt(ri, "bid") > tly + sdThesholdOffset);
				//}
				//else
				//{
					flag_deranged = (closeRawSample.getAt(ri, "ask") < tly - sdThesholdOffset || closeRawSample.getAt(ri, "bid") > tly + sdThesholdOffset);
				//}
				if (flag_deranged)
				{
					progressInfo.datapoint_spi2 =
					{
						item: rawSample.getAt(ri),
					};
					progressInfo.trader_LBF.closeAllPositions(closeRawSample.getAt(ri), { datapoint_spi2: progressInfo.datapoint_spi2 });
					progressInfo.trader_SNR_ZigZag.closeAllPositions(closeRawSample.getAt(ri), { datapoint_spi2: progressInfo.datapoint_spi2 });
				}
			}
			if (!context.infinite && progressInfo.datapoint_spi2)
			{
				break;
			}
		}

		var lineOfBestFitResultInfo =
		{
			lineOfBestFit_trendLine: progressInfo.lineOfBestFitInfo.trendLine,
			lineOfBestFit_significantPointSample: progressInfo.lineOfBestFitInfo.significantPointSample,
			lineOfBestFit_pointSample: progressInfo.lineOfBestFitInfo.currentSample,
			lineOfBestFit_correlationSample: new MappedArray(progressInfo.lineOfBestFitInfo.correlationData),
			lineOfBestFit_variability_windowSize: this._lineOfBestFit_variability_windowSize,
			lineOfBestFit_variabilitySample: new MappedArray(progressInfo.lineOfBestFitInfo.variabilityData),
			lineOfBestFit_variability_spi1: progressInfo.lineOfBestFitInfo.spi1_info,
			lineOfBestFit_sdySample: lineOfBestFit_sdySample,
			lineOfBestFit_sdTrendLineAngleSample: lineOfBestFit_sdTrendLineAngleSample,
			lineOfBestFit_deadZoneSample: new MappedArray(progressInfo.lineOfBestFitInfo.deadZoneData),
			lineOfBestFit_turningPoints_spi3: progressInfo.lineOfBestFitInfo.turningPoints_spi3,
			lineOfBestFit_lastCcs: progressInfo.lineOfBestFitInfo.turningPoints_spi3_last_ccs,
		};
		var result = new ForexFeatureV5_Channel(
		{
			firstDt: progressInfo.firstDt,
			lastDt: progressInfo.currentDt,
			datapoint_spi2: progressInfo.datapoint_spi2,
			isBroken: ri >= this._maxChannelDataPointCount,
			tradeSample: new MappedArray(progressInfo.trades),

			lineOfBestFitInfo: lineOfBestFitResultInfo,
			supportAndResistanceInfo: progressInfo.supportAndResistanceInfo,
			progressInfo: progressInfo.datapoint_spi2 ? null : progressInfo,
		});

		return result;
	}

	finish(context, channelFeature, dataPoints)
	{
		if (!dataPoints) throw "Argument is null: dataPoints.";
		if (!channelFeature) throw "Argument is null: channelFeature.";

		var lineOfBestFit_pointSample = this.select(this.remap(dataPoints));

		channelFeature.datapoint_spi2 =
		{
			item: lineOfBestFit_pointSample.getAt(lineOfBestFit_pointSample.length - 1),
		};
	}


	remap(dataPoints)
	{
		var result;
		switch (this._priceSourcing)
		{
			case EPriceSourcingV5.HighLow:
				//	uses ask-low values and bid-high values
				result = new MappedArray(dataPoints,
				{
					dt: item => item.raw.dt,
					ask: item => item.raw.al,
					bid: item => item.raw.bh,
				});
				break;
			case EPriceSourcingV5.Open:
				result = new MappedArray(dataPoints,
				{
					dt: item => item.raw.dt,
					ask: item => item.raw.ao,
					bid: item => item.raw.bo,
				});
				break;
			case EPriceSourcingV5.Close:
				result = new MappedArray(dataPoints,
				{
					dt: item => item.raw.dt,
					ask: item => item.raw.ac,
					bid: item => item.raw.bc,
				});
				break;
			case EPriceSourcingV5.Tick:
				result = new MappedArray(dataPoints,
				{
					dt: item => item.dt,
					ask: item => item.ask,
					bid: item => item.bid,
				});
				break;
			default:
				throw "Not implemented.";
		}
		return result;
	}

	select(rawSample)
	{
		var result = null;
		switch (this._lineOfBestFit_dataPointSelector)
		{
			case EDataPointSelectorV5.AskBid_All:
				result = rawSample.map({ x: ["dt", "dt"], y: ["ask", "bid"] });
				break;
			case EDataPointSelectorV5.AskBid_Extremums:
				result = rawSample.map({ x: ["dt", "dt"], y: ["ask", "bid"] });
				break;
			default:
				throw "Not implemented.";
		}
		return result;
	}


	static async _temp_getSdyAB(instrumentId, sampleIntervalDef, dt, windowDpCount)
	{
		ForexShaperV5_Channel._temp_getSdyAB_cache = ForexShaperV5_Channel._temp_getSdyAB_cache || {};
		var key = instrumentId + ':' + sampleIntervalDef.collectionName + ':' + dt + ':' + windowDpCount;
		var result = ForexShaperV5_Channel._temp_getSdyAB_cache[key];
		if (!result)
		{
			var dbChannel = app.db.getChannel(instrumentId, sampleIntervalDef);
			var rangeLengthMs = windowDpCount * EDateTimeUnit.getMaxUnitLengthMs(sampleIntervalDef.unit) * sampleIntervalDef.length;
			var range = new Range(dt - rangeLengthMs, dt + 1);
			await dbChannel.ensureRange(range.roundUp(0.5));
			var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
			var buffer = [];
			for (var i = data.length - 1, count = 0; i >= 0 && count < windowDpCount; --i)
			{
				var item = data[i];
				if (item.dt > dt) continue;
				buffer.push(item);
			}
			if (!buffer.length) return { dt: dt, ask: Infinity, bid: Infinity };
			var sample = new MappedArray(buffer, { ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
			result = { dt: dt, ask: sample.standardDeviation("ya"), bid: sample.standardDeviation("yb") };
			ForexShaperV5_Channel._temp_getSdyAB_cache[key] = result;
		}
		return result;
	}

	static _temp_getSdyAB_sync(instrumentId, sampleIntervalDef, dt, windowDpCount)
	{
		ForexShaperV5_Channel._temp_getSdyAB_cache = ForexShaperV5_Channel._temp_getSdyAB_cache || {};
		var key = instrumentId + ':' + sampleIntervalDef.collectionName + ':' + dt + ':' + windowDpCount;
		return ForexShaperV5_Channel._temp_getSdyAB_cache[key] || null;
	}


	get minSignificantDataPointCount()
	{
		return this._minSignificantDataPointCount;
	}
}
