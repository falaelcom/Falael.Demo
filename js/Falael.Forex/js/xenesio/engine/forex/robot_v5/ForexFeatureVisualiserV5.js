"use strict";

include("StdAfx.js");

class ForexFeatureVisualiserV5
{
	constructor(par)
	{
		this._chartVisual = par.chartVisual;
		this._timeAxis = par.timeAxis;
		this._valueAxis = par.valueAxis;

		this._indicatorChartVisual = par.indicatorChartVisual;
		this._indicatorTimeAxis = par.indicatorTimeAxis;
		this._indicatorValueAxis = par.indicatorValueAxis;

		this._dataSources = [];

		this._mainChartIndicator1DataSource = this._addMainChartLineSeries({ color: "red", width: 0.5, strokeStyle: "dashed" });
		this._mainChartIndicator2DataSource = this._addMainChartLineSeries({ color: "#adadad", width: 0.5, strokeStyle: "dashed" });
		this._mainChartIndicator3DataSource = this._addMainChartLineSeries({ color: "#adadad", width: 0.5, strokeStyle: "dashed" });
		this._mainChartIndicator4DataSource = this._addMainChartLineSeries({ color: "#adadad", width: 0.5, strokeStyle: "dashed" });
		this._mainChartIndicator5DataSource = this._addMainChartLineSeries({ color: "#adadad", width: 0.5, strokeStyle: "dashed" });
		this._mainChartIndicator6DataSource = this._addMainChartLineSeries({ color: "#adadad", width: 0.5, strokeStyle: "dashed" });
		this._mainChartIndicator7DataSource = this._addMainChartLineSeries({ color: "#adadad", width: 0.5, strokeStyle: "dashed" });

		this._mainChartIndicator8DataSource = this._addMainChartLineSeries({ color: "red", width: 1 });

		this._indicatorDataSource = this._addIndicatorChartLineSeries({ color: "purple", strokeStyle: "dotted" });
		this._indicator2DataSource = this._addIndicatorChartLineSeries({ color: "red", strokeStyle: "dotted" });
		this._indicator3DataSource = this._addIndicatorChartLineSeries({ color: "purple", strokeStyle: "dotted" });
		this._indicator4DataSource = this._addIndicatorChartLineSeries({ color: "green", strokeStyle: "dotted" });
		this._indicator5DataSource = this._addIndicatorChartLineSeries({ color: "#9A7D0A", strokeStyle: "solid" });
	}


	draw(context, featureList, min, max)
	{
		for (var length = featureList.length, i = 0; i < length; ++i)
		{
			var item = featureList[i];
			if (item instanceof ForexFeatureV5_Channel) this._drawChannel(context, item, min, max);
			else throw "Not implemented.";
		}
	}

	clear()
	{
		for (var length = this._dataSources.length, i = 0; i < length; ++i) this._dataSources[i].clear();
	}


	_drawChannel(context, feature, min, max)
	{
		/////////////////////////////////////////
		//	on main chart
		min = feature.firstDt;
		if (feature.isFinished) max = Math.min(max, feature.lastDt);

		var luid = newLUID();

		if (feature.supportAndResistanceInfo)
		{
			if (false) if (feature.supportAndResistanceInfo.valleysA) for (var length = feature.supportAndResistanceInfo.valleysA.length, i = 0; i < length; ++i)
			{
				var x = feature.supportAndResistanceInfo.valleysA.getAt(i, "x");
				var y = feature.supportAndResistanceInfo.valleysA.getAt(i, "y");

				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = x;
				pointMarker1.modelY = y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "cyan";
				pointMarker1.lineStyle.color = "blue";
				pointMarker1.size = 3;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}

			if (false) if (feature.supportAndResistanceInfo.peaksB) for (var length = feature.supportAndResistanceInfo.peaksB.length, i = 0; i < length; ++i)
			{
				var x = feature.supportAndResistanceInfo.peaksB.getAt(i, "x");
				var y = feature.supportAndResistanceInfo.peaksB.getAt(i, "y");

				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = x;
				pointMarker1.modelY = y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "yellow";
				pointMarker1.lineStyle.color = "brown";
				pointMarker1.size = 3;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}

			if (false) if (feature.supportAndResistanceInfo.significantValleyPoints) for (var length = feature.supportAndResistanceInfo.significantValleyPoints.length, i = 0; i < length; ++i)
			{
				var x = feature.supportAndResistanceInfo.significantValleyPoints[i].x;
				var y = feature.supportAndResistanceInfo.significantValleyPoints[i].y;

				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = x;
				pointMarker1.modelY = y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "red";
				pointMarker1.lineStyle.color = "blue";
				pointMarker1.size = 2;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}

			if(false) if (feature.supportAndResistanceInfo.significantPeakPoints) for (var length = feature.supportAndResistanceInfo.significantPeakPoints.length, i = 0; i < length; ++i)
			{
				var x = feature.supportAndResistanceInfo.significantPeakPoints[i].x;
				var y = feature.supportAndResistanceInfo.significantPeakPoints[i].y;

				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = x;
				pointMarker1.modelY = y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "red";
				pointMarker1.lineStyle.color = "blue";
				pointMarker1.size = 2;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}

			if (feature.supportAndResistanceInfo.definingPoint)
			{
				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = feature.supportAndResistanceInfo.definingPoint.x;
				pointMarker1.modelY = feature.supportAndResistanceInfo.definingPoint.y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "red";
				pointMarker1.lineStyle.color = "blue";
				pointMarker1.size = 3;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}

			if (feature.supportAndResistanceInfo.middlePointA) 
			{
				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = feature.supportAndResistanceInfo.middlePointA.x;
				pointMarker1.modelY = feature.supportAndResistanceInfo.middlePointA.y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "yellow";
				pointMarker1.lineStyle.color = "blue";
				pointMarker1.size = 4;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}

			if (feature.supportAndResistanceInfo.middlePointB) 
			{
				var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = feature.supportAndResistanceInfo.middlePointB.x;
				pointMarker1.modelY = feature.supportAndResistanceInfo.middlePointB.y;
				pointMarker1.opacity = 1;
				pointMarker1.color = "yellow";
				pointMarker1.lineStyle.color = "blue";
				pointMarker1.size = 4;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}


			var redAB;
			var blueAB;
			try
			{
				var correlationRatingAB = Math.abs(feature.supportAndResistanceInfo.subSampleAB.correlationCoefficient("x", "y"));
				redAB = correlationRatingAB * 255;
				blueAB = (1 - correlationRatingAB) * 255;
			}
			catch (ex)
			{
				log(37945736, ex);
				redAB = 0;
				blueAB = 0;
			}
			var lineMarker = new ChartLineMarker("trendLineAB_" + newLUID(), this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = feature.firstDt;
			lineMarker.modelY0 = feature.supportAndResistanceInfo.trendLineAB.calc(lineMarker.modelX0);
			lineMarker.modelX1 = feature.lastDt;
			lineMarker.modelY1 = feature.supportAndResistanceInfo.trendLineAB.calc(lineMarker.modelX1);
			lineMarker.lineStyle.color = "rgb(" + redAB + ", 0, " + blueAB + ")";
			lineMarker.lineStyle.width = 1.5;
			lineMarker.lineStyle.strokeStyle = "solid";
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

			if (feature.supportAndResistanceInfo.supportTrendLineA)
			{
				var lineMarker = new ChartLineMarker("supportTrendLineA_" + newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = feature.firstDt;
				//lineMarker.modelX0 = this._timeAxis.dataRange.min;
				lineMarker.modelY0 = feature.supportAndResistanceInfo.supportTrendLineA.calc(lineMarker.modelX0);
				lineMarker.modelX1 = feature.lastDt;
				//lineMarker.modelX1 = this._timeAxis.dataRange.max;
				lineMarker.modelY1 = feature.supportAndResistanceInfo.supportTrendLineA.calc(lineMarker.modelX1);
				lineMarker.lineStyle.color = "gray";
				lineMarker.lineStyle.width = 1;
				lineMarker.lineStyle.strokeStyle = "dashed";
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}

			if (feature.supportAndResistanceInfo.resistanceTrendLineB)
			{
				var lineMarker = new ChartLineMarker("resistanceTrendLineB_" + newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = feature.firstDt;
				//lineMarker.modelX0 = this._timeAxis.dataRange.min;
				lineMarker.modelY0 = feature.supportAndResistanceInfo.resistanceTrendLineB.calc(lineMarker.modelX0);
				lineMarker.modelX1 = feature.lastDt;
				//lineMarker.modelX1 = this._timeAxis.dataRange.max;
				lineMarker.modelY1 = feature.supportAndResistanceInfo.resistanceTrendLineB.calc(lineMarker.modelX1);
				lineMarker.lineStyle.color = "gray";
				lineMarker.lineStyle.width = 1;
				lineMarker.lineStyle.strokeStyle = "dashed";
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}
		}

		//	central line (trend line)
		if (feature.lineOfBestFitInfo.lineOfBestFit_trendLine && feature.lineOfBestFitInfo.lineOfBestFit_significantPointSample.length)
		{
			var red;
			var blue;
			try
			{
				var correlationRating = Math.abs(feature.lineOfBestFitInfo.lineOfBestFit_significantPointSample.correlationCoefficient("x", "y"));
				red = correlationRating * 255;
				blue = (1 - correlationRating) * 255;
			}
			catch (ex)
			{
				log(3799236, ex);
				red = 0;
				blue = 0;
			}

			var lineMarker = new ChartLineMarker("lineOfBestFit_" + luid, this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = min;
			lineMarker.modelY0 = feature.lineOfBestFitInfo.lineOfBestFit_trendLine.calc(lineMarker.modelX0);
			lineMarker.modelX1 = max;
			lineMarker.modelY1 = feature.lineOfBestFitInfo.lineOfBestFit_trendLine.calc(lineMarker.modelX1);
			lineMarker.lineStyle.color = "rgb(" + red + ", 0, " + blue + ")";
			lineMarker.lineStyle.width = 0.6;
			lineMarker.lineStyle.strokeStyle = "dashed";
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

			//	standard deviation (Y-axis) lines
			var standardDeviationY = feature.lineOfBestFitInfo.lineOfBestFit_pointSample.standardDeviation("y");
			var standardDeviationLineCount = 3;
			for (var i = -standardDeviationLineCount; i <= standardDeviationLineCount; ++i)
			{
				if (!i) continue;

				var line = feature.lineOfBestFitInfo.lineOfBestFit_trendLine.clone();
				line.b += i * standardDeviationY;

				var lineMarker = new ChartLineMarker("standardDeviationLine_" + luid + "_" + i, this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = feature.lastDt - (feature.lastDt - feature.firstDt) / 20;
				lineMarker.modelY0 = line.calc(lineMarker.modelX0);
				lineMarker.modelX1 = feature.lastDt;
				lineMarker.modelY1 = line.calc(lineMarker.modelX1);
				lineMarker.lineStyle.color = "black";
				lineMarker.lineStyle.width = 1;
				lineMarker.lineStyle.strokeStyle = "dashed";
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}

			for (var length = feature.tradeSample.length, i = 0; i < length; ++i)
			{
				var item = feature.tradeSample.getAt(i);

				if (!item.precursorTrade)
				{
					var pointMarker1 = new ChartPointMarker("tradeOpen_" + newLUID(), this._timeAxis, this._valueAxis, true);
					pointMarker1.modelX = item.dt;
					pointMarker1.modelY = item.price;
					pointMarker1.opacity = 0.75;
					pointMarker1.color = (item.transactionType == ETransactionTypeV5.Buy ? "lime" : "magenta");
					pointMarker1.lineStyle.color = (item.transactionType == ETransactionTypeV5.Buy == "buy" ? "lime" : "magenta");
					pointMarker1.size = 4;
					this._chartVisual.scene.markers.add(pointMarker1);
					ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
				}
				else
				{
					var pointMarker1 = new ChartPointMarker("tradeClose_" + newLUID(), this._timeAxis, this._valueAxis, true);
					pointMarker1.modelX = item.dt;
					pointMarker1.modelY = item.price;
					pointMarker1.opacity = 0.75;
					pointMarker1.color = (item.transactionType == ETransactionTypeV5.Buy ? "lime" : "magenta");
					pointMarker1.lineStyle.color = (item.transactionType == ETransactionTypeV5.Buy == "buy" ? "lime" : "magenta");
					pointMarker1.size = 2;
					this._chartVisual.scene.markers.add(pointMarker1);
					ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);

					var lineMarker = new ChartLineMarker("tradeMovement_" + newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = item.precursorTrade.dt;
					lineMarker.modelY0 = item.precursorTrade.price;
					lineMarker.modelX1 = item.dt;
					lineMarker.modelY1 = item.price;
					lineMarker.lineStyle.color = item.movement > 0 ? "LAWNGREEN" : "CRIMSON";
					lineMarker.lineStyle.width = 1.2;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				}
			}
		}

		//	channel start
		var lineMarker = new ChartLineMarker("channelStart_" + luid, this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = feature.firstDt;
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = lineMarker.modelX0;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "#cc00cc";
		lineMarker.lineStyle.width = 1.2;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		//	channel end
		if (feature.datapoint_spi2)
		{
			var pointMarker1 = new ChartPointMarker("channelEnd_spi2_" + luid, this._timeAxis, this._valueAxis, true);
			pointMarker1.modelX = feature.datapoint_spi2.item.x;
			pointMarker1.modelY = feature.datapoint_spi2.item.y;
			pointMarker1.color = "blue";
			pointMarker1.lineStyle.color = "darkblue";
			pointMarker1.size = 4;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);

			var lineMarker = new ChartLineMarker("trade_totalMovement_" + luid, this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = feature.lastDt;
			lineMarker.modelY0 = this._valueAxis.dataRange.min + this._valueAxis.dataRange.length / 2;
			lineMarker.modelX1 = lineMarker.modelX0;
			lineMarker.modelY1 = this._valueAxis.dataRange.min + this._valueAxis.dataRange.length / 2 + feature.trade_totalMovement;
			lineMarker.lineStyle.color = feature.trade_totalMovement > 0 ? "LAWNGREEN" : "CRIMSON";
			lineMarker.lineStyle.width = 5;
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
		}

		var lineMarker = new ChartLineMarker("channelEnd_" + luid, this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = feature.lastDt;
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = lineMarker.modelX0;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "#cc00cc";
		lineMarker.lineStyle.width = 0.8;
		lineMarker.lineStyle.strokeStyle = "dashed";
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		//	flexible sdy
		if (feature.lineOfBestFitInfo.lineOfBestFit_sdySample)
		{
			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly }; });
			this._mainChartIndicator1DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));

			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly + item.sdy }; });
			this._mainChartIndicator2DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));
			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly - item.sdy }; });
			this._mainChartIndicator3DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));

			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly + 2 * item.sdy }; });
			this._mainChartIndicator4DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));
			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly - 2 * item.sdy }; });
			this._mainChartIndicator5DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));

			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly + 3 * item.sdy }; });
			this._mainChartIndicator6DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));
			var lineOfBestFit_sdySample_adjusted = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.transformSample(function (item) { return { x: item.x, sdy: item.tly - 3 * item.sdy }; });
			this._mainChartIndicator7DataSource.addRange(lineOfBestFit_sdySample_adjusted.toArray({ dt: ["x"], y: ["sdy"] }));
		}

		/////////////////////////////////////////
		//	on indicator chart
		for (var length = feature.lineOfBestFitInfo.lineOfBestFit_deadZoneSample.length, i = 0; i < length; ++i)
		{
			var range = feature.lineOfBestFitInfo.lineOfBestFit_deadZoneSample.getAt(i);
			var minx = range.min;
			var maxx = range.max !== Infinity ? range.max : feature.lastDt;

			var lineMarker = new ChartLineMarker("deadZoneData_" + luid + "_" + i, this._indicatorTimeAxis, this._indicatorValueAxis, true);
			lineMarker.modelX0 = minx;
			lineMarker.modelY0 = 0;
			lineMarker.modelX1 = maxx;
			lineMarker.modelY1 = 0;
			lineMarker.lineStyle.color = "black";
			lineMarker.lineStyle.width = 1.5;
			this._indicatorChartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

			if (range.max === Infinity)
			{
				var pointMarker1 = new ChartPointMarker(newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
				pointMarker1.modelX = minx;
				pointMarker1.modelY = 0;
				pointMarker1.color = "black";
				pointMarker1.lineStyle.color = "black";
				pointMarker1.size = 4;
				this._indicatorChartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}
		}

		if (feature.lineOfBestFitInfo.lineOfBestFit_sdySample)
		{
			var lineOfBestFit_sdySample_derivative = feature.lineOfBestFitInfo.lineOfBestFit_sdySample.derivativeSample("x", "tly");
			var lineOfBestFit_sdySample_normal = lineOfBestFit_sdySample_derivative.transformSample(function (item)
			{
				return { x: item.x, sdy: 2 * MappedArray.fnorm(-0.6, MappedArray.sigmoid(item.tly * 1000000000)) - 1 };
			});
			this._indicator4DataSource.addRange(lineOfBestFit_sdySample_normal.toArray({ dt: ["x"], y: ["sdy"] }));

			var lineOfBestFit_sdTrendLineAngleSample_normal = feature.lineOfBestFitInfo.lineOfBestFit_sdTrendLineAngleSample.transformSample(function (item)
			{
				return { x: item.x, y: item.a };
			});
			this._indicator3DataSource.addRange(lineOfBestFit_sdTrendLineAngleSample_normal.toArray({ dt: ["x"], y: ["y"] }));
		}

		//	trendline correlation coefficient indicator
		if (feature.lineOfBestFitInfo.lineOfBestFit_correlationSample.length && this._indicatorDataSource.rawData.length)
		{
			var firstNewX = feature.lineOfBestFitInfo.lineOfBestFit_correlationSample.getAt(0, "x");
			var lastExistingX = this._indicatorDataSource.rawData[this._indicatorDataSource.rawData.length - 1].dt;
			if (lastExistingX < firstNewX) this._indicatorDataSource.addRange(feature.lineOfBestFitInfo.lineOfBestFit_correlationSample.toArray({ dt: ["x"], y: ["sy"] }));
		}

		var derivativeSample = feature.lineOfBestFitInfo.lineOfBestFit_correlationSample.derivativeSample("x", "y");
		var uniformMax = Math.max(derivativeSample.max("y"), Math.abs(derivativeSample.min("y")));
		var normalDerivativeSample = derivativeSample.transformSample(function (item) { return { dt: item.x, y: Math.sign(item.y / uniformMax) * MappedArray.ifnorm(-0.999, 1 - Math.abs(item.y / uniformMax)) }; });
		for (var length = normalDerivativeSample.length, i = 0; i < length; ++i) this._indicator5DataSource.add({ dt: normalDerivativeSample.getAt(i, "dt"), y: normalDerivativeSample.getAt(i, "y") });
		
		//	trendline correlation coefficient variability indicator
		this._indicator2DataSource.addRange(feature.lineOfBestFitInfo.lineOfBestFit_variabilitySample.toArray({ dt: ["x"], y: ["value"] }));

		//	trendline correlation coefficient stability onset indicator
		if (feature.lineOfBestFitInfo.lineOfBestFit_variability_spi1)
		{
			var x = feature.lineOfBestFitInfo.lineOfBestFit_variability_spi1.item.x;
			var y = feature.lineOfBestFitInfo.lineOfBestFit_variability_spi1.item.value;
			var pointMarker1 = new ChartPointMarker("lineOfBestFit_variability_spi1_" + luid + "_" + i, this._indicatorTimeAxis, this._indicatorValueAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			pointMarker1.size = 3;
			this._indicatorChartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}

		//	trendline direction sign change
		if (feature.lineOfBestFitInfo.lineOfBestFit_turningPoints_spi3 && feature.lineOfBestFitInfo.lineOfBestFit_turningPoints_spi3.length)
		{
			for (var jlength = feature.lineOfBestFitInfo.lineOfBestFit_turningPoints_spi3.length, j = 0; j < jlength; ++j)
			{
				var jitem = feature.lineOfBestFitInfo.lineOfBestFit_turningPoints_spi3[j];
				var x = jitem.correleationItem.x;
				var y = jitem.correleationItem.y;
				var sameAsLast = (feature.lineOfBestFitInfo.lineOfBestFit_lastCcs == jitem.correlationSign);
				var pointMarker1 = new ChartPointMarker("ccs_" + luid + "_" + j, this._indicatorTimeAxis, this._indicatorValueAxis, true);
				pointMarker1.modelX = x;
				pointMarker1.modelY = y;
				pointMarker1.color = sameAsLast ? "green" : "red";
				pointMarker1.lineStyle.color = sameAsLast ? "darkgreen" : "darkred";
				pointMarker1.size = 5;
				this._indicatorChartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}
		}

		//	special point markers
		if (feature.lineOfBestFitInfo.lineOfBestFit_variability_spi1)
		{
			var x = feature.lineOfBestFitInfo.lineOfBestFit_variability_spi1.item.x;
			var y = feature.lineOfBestFitInfo.lineOfBestFit_variability_spi1.item.value;
			//log(912, x, y);
			var pointMarker1 = new ChartPointMarker("lineOfBestFit_variability_spi1_" + luid, this._indicatorTimeAxis, this._indicatorValueAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			pointMarker1.size = 3;
			this._indicatorChartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}

		//	channel start
		var lineMarker = new ChartLineMarker("channelStart_" + luid, this._indicatorTimeAxis, this._indicatorValueAxis, true);
		lineMarker.modelX0 = feature.firstDt;
		lineMarker.modelY0 = -10;
		lineMarker.modelX1 = lineMarker.modelX0;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "#cc00cc";
		lineMarker.lineStyle.width = 1.2;
		this._indicatorChartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
	}

	_drawChannelPois(feature, min, max)
	{
		var luid = newLUID();

		/////////////////////////////////////////
		//	on main chart
		if (feature.introEnd_spi3)
		{
			var x = feature.introEnd_spi3.item.x;
			var y = feature.introEnd_spi3.item.y;
			var lineMarker = new ChartLineMarker("line_channelPois_introEnd_spi3_" + luid, this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = x;
			lineMarker.modelY0 = -10;
			lineMarker.modelX1 = x;
			lineMarker.modelY1 = 10;
			lineMarker.lineStyle.color = "pink";
			lineMarker.lineStyle.width = 1;
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

			var pointMarker1 = new ChartPointMarker("point_channelPois_introEnd_spi3_" + luid, this._timeAxis, this._valueAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			pointMarker1.color = "pink";
			pointMarker1.lineStyle.color = "purple";
			pointMarker1.size = 2;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}

		if (feature.tradeGate_spi4)
		{
			var x = feature.tradeGate_spi4.item.x;
			var y = feature.tradeGate_spi4.item.value;
			var lineMarker = new ChartLineMarker("line_tradeGate_spi4_" + luid, this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = x;
			lineMarker.modelY0 = -10;
			lineMarker.modelX1 = x;
			lineMarker.modelY1 = 10;
			lineMarker.lineStyle.color = "cyan";
			lineMarker.lineStyle.width = 1;
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
		}

		if (feature.tradeOpen_spi5)
		{
			var x = feature.tradeOpen_spi5.item.x;
			var y = feature.tradeOpen_spi5.item.y;
			var pointMarker1 = new ChartPointMarker("point_tradeOpen_spi5_" + feature.tradeOpen_spi5.type + "_" + luid, this._timeAxis, this._valueAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			switch (feature.tradeOpen_spi5.type)
			{
				case "buy":
					pointMarker1.color = "green";
					pointMarker1.lineStyle.color = "lime";
					break;
				case "sell":
					pointMarker1.color = "brown";
					pointMarker1.lineStyle.color = "yellow";
					break;
			}
			pointMarker1.size = 5;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}

		if (feature.tradeClose_spi6)
		{
			var x = feature.tradeClose_spi6.item.x;
			var y = feature.tradeClose_spi6.item.y;
			var pointMarker1 = new ChartPointMarker("point_tradeClose_spi6_" + feature.tradeClose_spi6.type + "_" + luid, this._timeAxis, this._valueAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			switch (feature.tradeClose_spi6.type)
			{
				case "buy":
					pointMarker1.color = "green";
					pointMarker1.lineStyle.color = "lime";
					break;
				case "sell":
					pointMarker1.color = "brown";
					pointMarker1.lineStyle.color = "yellow";
					break;
			}
			pointMarker1.size = 7;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}


		/////////////////////////////////////////
		//	on indicator chart
		if (feature.introEnd_spi3)
		{
			var x = feature.introEnd_spi3.item.x;

			var lineMarker = new ChartLineMarker("indicatorLine_channelPois_introEnd_spi3_" + newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
			lineMarker.modelX0 = x;
			lineMarker.modelY0 = -10;
			lineMarker.modelX1 = lineMarker.modelX0;
			lineMarker.modelY1 = 10;
			lineMarker.lineStyle.color = "pink";
			lineMarker.lineStyle.width = 1;
			this._indicatorChartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
		}

		if (feature.tradeGate_spi4)
		{
			var x = feature.tradeGate_spi4.item.x;
			var y = feature.tradeGate_spi4.item.value;
			var pointMarker1 = new ChartPointMarker("indicatorPoint_channelPois_tradeGate_spi4_" + luid, this._indicatorTimeAxis, this._indicatorValueAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			pointMarker1.color = "cyan";
			pointMarker1.lineStyle.color = "blue";
			pointMarker1.size = 3;
			this._indicatorChartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}
	}

	_addMainChartLineSeries(lineStyle)
	{
		var dataSource = new ChartDataSource_Buffer(newLUID());
		var lineSeries = new ChartLineSeries(newLUID(), 5050, this._timeAxis, this._valueAxis, "dt", "y", dataSource);
		lineSeries.lineStyle.color = lineStyle.color;
		lineSeries.lineStyle.width = lineStyle.width;
		lineSeries.lineStyle.strokeStyle = lineStyle.strokeStyle;
		this._chartVisual.scene.series.add(lineSeries);
		ChartStyleSheet.defaultSceneStyle.applyToSeries(lineSeries);
		this._dataSources.push(dataSource);
		return dataSource;
	}

	_addIndicatorChartLineSeries(lineStyle)
	{
		var dataSource = new ChartDataSource_Buffer(newLUID());
		var lineSeries = new ChartLineSeries(newLUID(), 5050, this._indicatorTimeAxis, this._indicatorValueAxis, "dt", "y", dataSource);
		lineSeries.lineStyle.color = lineStyle.color;
		lineSeries.lineStyle.width = lineStyle.width;
		lineSeries.lineStyle.strokeStyle = lineStyle.strokeStyle;
		this._indicatorChartVisual.scene.series.add(lineSeries);
		ChartStyleSheet.defaultSceneStyle.applyToSeries(lineSeries);
		this._dataSources.push(dataSource);
		return dataSource;
	}
}
