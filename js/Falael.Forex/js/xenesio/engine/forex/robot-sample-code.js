window.dbgchart = this._chartVisual;
window.dbgchart.debug_xAxis = this._timeAxis;
window.dbgchart.debug_yAxis = this._valueAxis;


this._robot = new ForexRobot(
{
	trendLineSpread: 0.0003
});

_updateRobotStateVisuals()
{
	var xAxis = this.xAxis;
	var yAxis = this.yAxis;

	//log(944, yAxis.sceneToModel(40) - yAxis.sceneToModel(0));

	//var min = new Date(2011, 2, 1, 13, 44).getTime();
	//var max = new Date(2011, 2, 1, 17, 19).getTime();

	this._chartVisual.scene.markers.removeByQuery(function (item) { return item instanceof ChartPointMarker });

	var askClosePeaks = this._robot.landscape.getFeatures(EForexFeatureType.Ask_Close_Peak);
	for (var length = askClosePeaks.length, i = 0; i < length; ++i)
	{
		var item = askClosePeaks[i];
		var pointMarker = new ChartPointMarker("askClosePeakPoint" + i, xAxis, yAxis, true);
		pointMarker.modelX = item.x;
		pointMarker.modelY = item.y;
		pointMarker.size = 3;
		this._chartVisual.scene.markers.add(pointMarker);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
	}

	var askCloseValleys = this._robot.landscape.getFeatures(EForexFeatureType.Ask_Close_Valley);
	for (var length = askCloseValleys.length, i = 0; i < length; ++i)
	{
		var item = askCloseValleys[i];
		var pointMarker = new ChartPointMarker("askCloseValleyPoint" + i, xAxis, yAxis, true);
		pointMarker.modelX = item.x;
		pointMarker.modelY = item.y;
		pointMarker.size = 2;
		pointMarker.color = "lime";
		pointMarker.lineStyle.lineColor = "green";
		this._chartVisual.scene.markers.add(pointMarker);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
	}

	var bidClosePeaks = this._robot.landscape.getFeatures(EForexFeatureType.Bid_Close_Peak);
	for (var length = bidClosePeaks.length, i = 0; i < length; ++i)
	{
		var item = bidClosePeaks[i];
		var pointMarker = new ChartPointMarker("bidClosePoint" + i, xAxis, yAxis, true);
		pointMarker.modelX = item.x;
		pointMarker.modelY = item.y;
		pointMarker.size = 3;
		this._chartVisual.scene.markers.add(pointMarker);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
	}

	var bidCloseValleys = this._robot.landscape.getFeatures(EForexFeatureType.Bid_Close_Valley);
	for (var length = bidCloseValleys.length, i = 0; i < length; ++i)
	{
		var item = bidCloseValleys[i];
		var pointMarker = new ChartPointMarker("bidCloseValleyPoint" + i, xAxis, yAxis, true);
		pointMarker.modelX = item.x;
		pointMarker.modelY = item.y;
		pointMarker.size = 2;
		pointMarker.color = "lime";
		pointMarker.lineStyle.lineColor = "green";
		this._chartVisual.scene.markers.add(pointMarker);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
	}

	this._chartVisual.scene.markers.removeByQuery(function (item) { return item instanceof ChartLinearZoneMarker });

	//var askCloseUpwardResistanceLines = this._robot.landscape.getFeatures(EForexFeatureType.Ask_Close_UpwardResistanceLine);
	//for (var length = askCloseUpwardResistanceLines.length, i = 0; i < length; ++i)
	//{
	//	var item = askCloseUpwardResistanceLines[i];
	//	var x0 = item.x0;
	//	var x1 = item.x1;
	//	var y0 = item.linedef.calc(item.x0);
	//	var y1 = item.linedef.calc(item.x1);

	//	var linearZone = new ChartLinearZoneMarker("askCloseUpwardResistanceLineZone" + i, xAxis, yAxis, true);
	//	linearZone.spreadAxisRole = EChartAxisRole.Oy;
	//	linearZone.modelLowerX = x0;
	//	linearZone.modelUpperX = x1;
	//	linearZone.modelLowerY = y0;
	//	linearZone.modelUpperY = y1;
	//	linearZone.modelSpread = this._robot.trendLineSpread;
	//	this._chartVisual.scene.markers.add(linearZone);
	//	linearZone.lineStyle.width = 2;
	//	ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	//}

	//var askCloseDownwardResistanceLines = this._robot.landscape.getFeatures(EForexFeatureType.Ask_Close_DownwardResistanceLine);
	//for (var length = askCloseDownwardResistanceLines.length, i = 0; i < length; ++i)
	//{
	//	var item = askCloseDownwardResistanceLines[i];
	//	var x0 = item.x0;
	//	var x1 = item.x1;
	//	var y0 = item.linedef.calc(item.x0);
	//	var y1 = item.linedef.calc(item.x1);

	//	var linearZone = new ChartLinearZoneMarker("askCloseDownwardResistanceLineZone" + i, xAxis, yAxis, true);
	//	linearZone.spreadAxisRole = EChartAxisRole.Oy;
	//	linearZone.modelLowerX = x0;
	//	linearZone.modelUpperX = x1;
	//	linearZone.modelLowerY = y0;
	//	linearZone.modelUpperY = y1;
	//	linearZone.modelSpread = this._robot.trendLineSpread;
	//	this._chartVisual.scene.markers.add(linearZone);
	//	linearZone.lineStyle.width = 2;
	//	ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	//}

	var askCloseUpwardSupportLines = this._robot.landscape.getFeatures(EForexFeatureType.Ask_Close_UpwardSupportLine);
	for (var length = askCloseUpwardSupportLines.length, i = 0; i < length; ++i)
	{
		var item = askCloseUpwardSupportLines[i];
		var x0 = item.x0;
		var x1 = item.x1;
		var y0 = item.linedef.calc(item.x0);
		var y1 = item.linedef.calc(item.x1);

		var linearZone = new ChartLinearZoneMarker("askCloseUpwardSupportLineZone" + i, xAxis, yAxis, true);
		linearZone.spreadAxisRole = EChartAxisRole.Oy;
		linearZone.modelLowerX = x0;
		linearZone.modelUpperX = x1;
		linearZone.modelLowerY = y0;
		linearZone.modelUpperY = y1;
		linearZone.modelSpread = this._robot.trendLineSpread;
		this._chartVisual.scene.markers.add(linearZone);
		linearZone.backplaneColor = "cyan";
		linearZone.lineStyle.color = "green";
		linearZone.lineStyle.width = 2;
		ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	}

	var askCloseDownwardSupportLines = this._robot.landscape.getFeatures(EForexFeatureType.Ask_Close_DownwardSupportLine);
	for (var length = askCloseDownwardSupportLines.length, i = 0; i < length; ++i)
	{
		var item = askCloseDownwardSupportLines[i];
		var x0 = item.x0;
		var x1 = item.x1;
		var y0 = item.linedef.calc(item.x0);
		var y1 = item.linedef.calc(item.x1);

		var linearZone = new ChartLinearZoneMarker("askCloseDownwardSupportLineZone" + i, xAxis, yAxis, true);
		linearZone.spreadAxisRole = EChartAxisRole.Oy;
		linearZone.modelLowerX = x0;
		linearZone.modelUpperX = x1;
		linearZone.modelLowerY = y0;
		linearZone.modelUpperY = y1;
		linearZone.modelSpread = this._robot.trendLineSpread;
		this._chartVisual.scene.markers.add(linearZone);
		linearZone.backplaneColor = "cyan";
		linearZone.lineStyle.color = "green";
		linearZone.lineStyle.width = 2;
		ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	}

	/////

	var bidCloseUpwardResistanceLines = this._robot.landscape.getFeatures(EForexFeatureType.Bid_Close_UpwardResistanceLine);
	for (var length = bidCloseUpwardResistanceLines.length, i = 0; i < length; ++i)
	{
		var item = bidCloseUpwardResistanceLines[i];
		var x0 = item.x0;
		var x1 = item.x1;
		var y0 = item.linedef.calc(item.x0);
		var y1 = item.linedef.calc(item.x1);

		var linearZone = new ChartLinearZoneMarker("bidCloseUpwardResistanceLineZone" + i, xAxis, yAxis, true);
		linearZone.spreadAxisRole = EChartAxisRole.Oy;
		linearZone.modelLowerX = x0;
		linearZone.modelUpperX = x1;
		linearZone.modelLowerY = y0;
		linearZone.modelUpperY = y1;
		linearZone.modelSpread = this._robot.trendLineSpread;
		this._chartVisual.scene.markers.add(linearZone);
		linearZone.backplaneColor = "pink";
		linearZone.lineStyle.color = "red";
		linearZone.lineStyle.width = 1;
		ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	}

	var bidCloseDownwardResistanceLines = this._robot.landscape.getFeatures(EForexFeatureType.Bid_Close_DownwardResistanceLine);
	for (var length = bidCloseDownwardResistanceLines.length, i = 0; i < length; ++i)
	{
		var item = bidCloseDownwardResistanceLines[i];
		var x0 = item.x0;
		var x1 = item.x1;
		var y0 = item.linedef.calc(item.x0);
		var y1 = item.linedef.calc(item.x1);

		var linearZone = new ChartLinearZoneMarker("bidCloseDownwardResistanceLineZone" + i, xAxis, yAxis, true);
		linearZone.spreadAxisRole = EChartAxisRole.Oy;
		linearZone.modelLowerX = x0;
		linearZone.modelUpperX = x1;
		linearZone.modelLowerY = y0;
		linearZone.modelUpperY = y1;
		linearZone.modelSpread = this._robot.trendLineSpread;
		this._chartVisual.scene.markers.add(linearZone);
		linearZone.backplaneColor = "pink";
		linearZone.lineStyle.color = "red";
		linearZone.lineStyle.width = 1;
		ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	}

	//var bidCloseUpwardSupportLines = this._robot.landscape.getFeatures(EForexFeatureType.Bid_Close_UpwardSupportLine);
	//for (var length = bidCloseUpwardSupportLines.length, i = 0; i < length; ++i)
	//{
	//	var item = bidCloseUpwardSupportLines[i];
	//	var x0 = item.x0;
	//	var x1 = item.x1;
	//	var y0 = item.linedef.calc(item.x0);
	//	var y1 = item.linedef.calc(item.x1);

	//	var linearZone = new ChartLinearZoneMarker("bidCloseUpwardSupportLineZone" + i, xAxis, yAxis, true);
	//	linearZone.spreadAxisRole = EChartAxisRole.Oy;
	//	linearZone.modelLowerX = x0;
	//	linearZone.modelUpperX = x1;
	//	linearZone.modelLowerY = y0;
	//	linearZone.modelUpperY = y1;
	//	linearZone.modelSpread = this._robot.trendLineSpread;
	//	this._chartVisual.scene.markers.add(linearZone);
	//	linearZone.backplaneColor = "blue";
	//	linearZone.lineStyle.color = "darkblue";
	//	linearZone.lineStyle.width = 1;
	//	ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	//}

	//var bidCloseDownwardSupportLines = this._robot.landscape.getFeatures(EForexFeatureType.Bid_Close_DownwardSupportLine);
	//for (var length = bidCloseDownwardSupportLines.length, i = 0; i < length; ++i)
	//{
	//	var item = bidCloseDownwardSupportLines[i];
	//	var x0 = item.x0;
	//	var x1 = item.x1;
	//	var y0 = item.linedef.calc(item.x0);
	//	var y1 = item.linedef.calc(item.x1);

	//	var linearZone = new ChartLinearZoneMarker("bidCloseDownwardSupportLineZone" + i, xAxis, yAxis, true);
	//	linearZone.spreadAxisRole = EChartAxisRole.Oy;
	//	linearZone.modelLowerX = x0;
	//	linearZone.modelUpperX = x1;
	//	linearZone.modelLowerY = y0;
	//	linearZone.modelUpperY = y1;
	//	linearZone.modelSpread = this._robot.trendLineSpread;
	//	this._chartVisual.scene.markers.add(linearZone);
	//	linearZone.backplaneColor = "blue";
	//	linearZone.lineStyle.color = "darkblue";
	//	linearZone.lineStyle.width = 1;
	//	ChartStyleSheet.defaultSceneStyle.applyToLinearZone(linearZone);
	//}

	this._chartVisual.scene.markers.removeByQuery(function (item) { return item instanceof ChartChannelZoneMarker });
	window.dbgchart.debug_clear();
	var closeUpwardChannelZones = this._robot.landscape.getFeatures(EForexFeatureType.Close_UpwardChannel);
	for (var length = closeUpwardChannelZones.length, i = 0; i < length; ++i)
	{
		var item = closeUpwardChannelZones[i];

		var channelZone = new ChartChannelZoneMarker("closeUpwardChannelZone" + i, xAxis, yAxis, true);
		channelZone.supportLine_modelLowerX = item.x0;
		channelZone.supportLine_modelUpperX = item.x1;
		channelZone.supportLine_modelLowerY = item.y0_support;
		channelZone.supportLine_modelUpperY = item.y1_support;
		channelZone.resistanceLine_modelLowerX = item.x0;
		channelZone.resistanceLine_modelUpperX = item.x1;
		channelZone.resistanceLine_modelLowerY = item.y0_resistance;
		channelZone.resistanceLine_modelUpperY = item.y1_resistance;
		this._chartVisual.scene.markers.add(channelZone);
		ChartStyleSheet.defaultSceneStyle.applyToChannelZone(channelZone);

		window.dbgchart.debug_draw(
			{
				primitive: "line",
				modelX0: item.x0,
				modelY0: item.y0_support,
				modelX1: item.x1,
				modelY1: item.y1_support,
				source: { zIndex: 10 },
				lineStyle: { color: "red", width: 3, },
			});

		window.dbgchart.debug_draw(
			{
				primitive: "line",
				modelX0: item.x0,
				modelY0: item.y0_resistance,
				modelX1: item.x1,
				modelY1: item.y1_resistance,
				source: { zIndex: 10 },
				lineStyle: { color: "cyan", width: 3, },
			});
	}

	var closeDownwardChannelZones = this._robot.landscape.getFeatures(EForexFeatureType.Close_DownwardChannel);
	for (var length = closeDownwardChannelZones.length, i = 0; i < length; ++i)
	{
		var item = closeDownwardChannelZones[i];

		var channelZone = new ChartChannelZoneMarker("closeDownwardChannelZone" + i, xAxis, yAxis, true);
		channelZone.supportLine_modelLowerX = item.x0;
		channelZone.supportLine_modelUpperX = item.x1;
		channelZone.supportLine_modelLowerY = item.y0_support;
		channelZone.supportLine_modelUpperY = item.y1_support;
		channelZone.resistanceLine_modelLowerX = item.x0;
		channelZone.resistanceLine_modelUpperX = item.x1;
		channelZone.resistanceLine_modelLowerY = item.y0_resistance;
		channelZone.resistanceLine_modelUpperY = item.y1_resistance;
		this._chartVisual.scene.markers.add(channelZone);
		ChartStyleSheet.defaultSceneStyle.applyToChannelZone(channelZone);

		window.dbgchart.debug_draw(
			{
				primitive: "line",
				modelX0: item.x0,
				modelY0: item.y0_support,
				modelX1: item.x1,
				modelY1: item.y1_support,
				source: { zIndex: 10 },
				lineStyle: { color: "red", width: 3, },
			});

		window.dbgchart.debug_draw(
			{
				primitive: "line",
				modelX0: item.x0,
				modelY0: item.y0_resistance,
				modelX1: item.x1,
				modelY1: item.y1_resistance,
				source: { zIndex: 10 },
				lineStyle: { color: "cyan", width: 3, },
			});
	}

	var featureTypes = [EForexFeatureType.Buy_OpenTrade_Decision, EForexFeatureType.Buy_CloseTrade_Decision, EForexFeatureType.Sell_OpenTrade_Decision, EForexFeatureType.Sell_CloseTrade_Decision];
	var tradeDecisions = this._robot.landscape.getFeatures_multipleTypes(featureTypes);
	for (var length = tradeDecisions.length, i = 0; i < length; ++i)
	{
		var item = tradeDecisions[i];
		var pointMarker = new ChartPointMarker("tradeDecision" + i, xAxis, yAxis, true);
		pointMarker.modelX = item.x;
		pointMarker.modelY = item.y;
		pointMarker.size = 5;
		if (item.buy)
		{
			pointMarker.color = "red";
			pointMarker.lineStyle.lineColor = "darkred";
		}
		else if (item.sell)
		{
			pointMarker.color = "blue";
			pointMarker.lineStyle.lineColor = "darkblue";
		}
		this._chartVisual.scene.markers.add(pointMarker);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);

		window.dbgchart.debug_draw(
			{
				primitive: "line",
				modelX0: item.underlying.channel.emergenceTime,
				y: 0,
				modelX1: item.underlying.channel.emergenceTime,
				height: 400,
				source: { zIndex: 10 },
				lineStyle: { color: "red", width: 1, },
			});

		window.dbgchart.debug_draw(
			{
				primitive: "line",
				modelX0: item.underlying.channel.lastChangeTime,
				y: 0,
				modelX1: item.underlying.channel.lastChangeTime,
				height: 400,
				source: { zIndex: 10 },
				lineStyle: { color: "blue", width: 1, },
			});

	}
}

















if (!this._robotV3.projectedLineOfBestFitCache)
{
	return;
}

function virtualProjectionRatioTests()
{
	//	hline, scene coordinates
	var tx11 = 125;
	var ty11 = 100;
	var tx12 = 175;
	var ty12 = 200;
	var modeltx11 = this._timeAxis.sceneToModel(tx11);
	var modelty11 = this._valueAxis.sceneToModel(ty11);
	var modeltx12 = this._timeAxis.sceneToModel(tx12);
	var modelty12 = this._valueAxis.sceneToModel(ty12);

	//	vline, scene coordinates
	var tx21 = 100;
	var ty21 = 175;
	var tx22 = 200;
	var ty22 = 125;
	var modeltx21 = this._timeAxis.sceneToModel(tx21);
	var modelty21 = this._valueAxis.sceneToModel(ty21);
	var modeltx22 = this._timeAxis.sceneToModel(tx22);
	var modelty22 = this._valueAxis.sceneToModel(ty22);

	window.dbgchart.debug_draw(
		{
			primitive: "line",
			modelX0: modeltx11,
			modelY0: modelty11,
			modelX1: modeltx12,
			modelY1: modelty12,
			source: { zIndex: 10 },
			lineStyle: { color: "pink", width: 2, },
		});

	window.dbgchart.debug_draw(
		{
			primitive: "line",
			modelX0: modeltx21,
			modelY0: modelty21,
			modelX1: modeltx22,
			modelY1: modelty22,
			source: { zIndex: 10 },
			lineStyle: { color: "pink", width: 2, },
		});

	var linedef1 = LinearFunction.buildLineFromPoints({ x: tx11, y: ty11 }, { x: tx12, y: ty12 });
	var linedef2 = LinearFunction.buildLineFromPoints({ x: tx21, y: ty21 }, { x: tx22, y: ty22 });
	var intersectionPoint = linedef1.intersectWith(linedef2);

	window.dbgchart.debug_draw(
		{
			primitive: "circle",
			modelX: this._timeAxis.sceneToModel(intersectionPoint.x),
			modelY: this._valueAxis.sceneToModel(intersectionPoint.y),
			source: { zIndex: 10 },
			lineStyle: { color: "darkred", width: 1, },
			style: { fill: "red" },
			size: 5,
		});

	log(8273, linedef1.getDistance(tx11, tx12) / linedef2.getDistance(tx21, tx22), linedef1.getDistance(tx11, tx12), linedef2.getDistance(tx21, tx22));

	var modellinedef1 = LinearFunction.buildLineFromPoints({ x: modeltx11, y: modelty11 }, { x: modeltx12, y: modelty12 });
	var modellinedef2 = LinearFunction.buildLineFromPoints({ x: modeltx21, y: modelty21 }, { x: modeltx22, y: modelty22 });
	var modelintersectionPoint = modellinedef1.intersectWith(modellinedef2);

	window.dbgchart.debug_draw(
		{
			primitive: "circle",
			modelX: modelintersectionPoint.x,
			modelY: modelintersectionPoint.y,
			source: { zIndex: 10 },
			lineStyle: { color: "blue", width: 1, },
			style: { fill: "cyan" },
			size: 3,
		});

	log(912, modellinedef1.getDistance(modeltx11, modeltx12) / modellinedef2.getDistance(modeltx21, modeltx22), modellinedef1.getDistance(modeltx11, modeltx12), modellinedef2.getDistance(modeltx21, modeltx22));

	var projectedlinedef1 = LinearFunction.buildLineFromPoints({ x: this._robotV3._projectX(modeltx11), y: this._robotV3._projectY(modelty11) }, { x: this._robotV3._projectX(modeltx12), y: this._robotV3._projectY(modelty12) });
	var projectedlinedef2 = LinearFunction.buildLineFromPoints({ x: this._robotV3._projectX(modeltx21), y: this._robotV3._projectY(modelty21) }, { x: this._robotV3._projectX(modeltx22), y: this._robotV3._projectY(modelty22) });
	var projectedinterectionPoint = projectedlinedef1.intersectWith(projectedlinedef2);

	window.dbgchart.debug_draw(
		{
			primitive: "circle",
			modelX: this._robotV3._unprojectX(projectedinterectionPoint.x),
			modelY: this._robotV3._unprojectY(projectedinterectionPoint.y),
			source: { zIndex: 10 },
			lineStyle: { color: "black", width: 1, },
			style: { fill: "yellow" },
			size: 2,
		});

	log(913, projectedlinedef1, projectedlinedef1.getDistance(this._robotV3._projectX(modeltx11), this._robotV3._projectX(modeltx12)) / projectedlinedef2.getDistance(this._robotV3._projectX(modeltx21), this._robotV3._projectX(modeltx22)), projectedlinedef1.getDistance(this._robotV3._projectX(modeltx11), this._robotV3._projectX(modeltx12)), projectedlinedef2.getDistance(this._robotV3._projectX(modeltx21), this._robotV3._projectX(modeltx22)));
};

//		window.dbgchart.debug_clear();

//		virtualProjectionRatioTests.bind(this)();

//log(555, this._robotV3.projectedLineOfBestFitCache);

this._chartVisual.scene.markers.removeByQuery(function (item) { return item instanceof ChartLineMarker });

var x0 = min;
var y0 = this._robotV3.projectedLineOfBestFitCache.calc(x0);
var x1 = max;
var y1 = this._robotV3.projectedLineOfBestFitCache.calc(x1);
var lineMarker = new ChartLineMarker("lineOfBestFit", this._timeAxis, this._valueAxis, true);
lineMarker.modelX0 = this._robotV3._unprojectX(x0);
lineMarker.modelY0 = this._robotV3._unprojectY(y0);
lineMarker.modelX1 = this._robotV3._unprojectX(x1);
lineMarker.modelY1 = this._robotV3._unprojectY(y1);
lineMarker.lineStyle.color = "red";
lineMarker.lineStyle.width = 1;
this._chartVisual.scene.markers.add(lineMarker);
ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

var lineOfBestFit_resistance = LinearFunction.buildLineOfBestFit(this._robotV3._debug_rotatedExtremums.projectedPeaks);
var x0 = min;
var y0 = lineOfBestFit_resistance.calc(x0);
var x1 = max;
var y1 = lineOfBestFit_resistance.calc(x1);
var lineMarker = new ChartLineMarker("lineOfBestFit", this._timeAxis, this._valueAxis, true);
lineMarker.modelX0 = this._robotV3._unprojectX(x0);
lineMarker.modelY0 = this._robotV3._unprojectY(y0);
lineMarker.modelX1 = this._robotV3._unprojectX(x1);
lineMarker.modelY1 = this._robotV3._unprojectY(y1);
lineMarker.lineStyle.color = "green";
lineMarker.lineStyle.width = 1;
this._chartVisual.scene.markers.add(lineMarker);
ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

var lineOfBestFit_support = LinearFunction.buildLineOfBestFit(this._robotV3._debug_rotatedExtremums.projectedValleys);
var x0 = min;
var y0 = lineOfBestFit_support.calc(x0);
var x1 = max;
var y1 = lineOfBestFit_support.calc(x1);
var lineMarker = new ChartLineMarker("lineOfBestFit", this._timeAxis, this._valueAxis, true);
lineMarker.modelX0 = this._robotV3._unprojectX(x0);
lineMarker.modelY0 = this._robotV3._unprojectY(y0);
lineMarker.modelX1 = this._robotV3._unprojectX(x1);
lineMarker.modelY1 = this._robotV3._unprojectY(y1);
lineMarker.lineStyle.color = "blue";
lineMarker.lineStyle.width = 1;
this._chartVisual.scene.markers.add(lineMarker);
ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

this._chartVisual.scene.markers.removeByQuery(function (item) { return item instanceof ChartPointMarker });

var peaks = this._robotV3._debug_rotatedExtremums.peaks;
for (var length = peaks.length, i = 0; i < length; ++i)
{
	var item = peaks[i];
	var pointMarker = new ChartPointMarker("peakPoint" + i, this._timeAxis, this._valueAxis, true);
	pointMarker.modelX = item.x;
	pointMarker.modelY = item.y;
	pointMarker.size = 3;
	this._chartVisual.scene.markers.add(pointMarker);
	ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
}

var valleys = this._robotV3._debug_rotatedExtremums.valleys;
for (var length = valleys.length, i = 0; i < length; ++i)
{
	var item = valleys[i];
	var pointMarker = new ChartPointMarker("valleyPoint" + i, this._timeAxis, this._valueAxis, true);
	pointMarker.modelX = item.x;
	pointMarker.modelY = item.y;
	pointMarker.size = 2;
	pointMarker.color = "lime";
	pointMarker.lineStyle.lineColor = "green";
	this._chartVisual.scene.markers.add(pointMarker);
	ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
}
















this._robotV3 = new ForexRobotV3(
	{
		projectionFactor: 2665110010,
		//projectionFactor: 1,
		minSignificantDataPointCount: 3,
		extraHistoryDataPointCount: 30,

		trendLineRater: new V3RaterComposite(
			{
				weight: 1,
				raters:
				[
					new V3Rater_TrendLine_Length({ weight: 1 }),
					//new V3Rater_TrendLine_Concentration({ weight: 1, sampleIntervalToDistanceFactorMap: V3Rater_TrendLine_Concentration.default_sampleIntervalToDistanceFactorMap }),
				],
			}),
	});





this._forexHeatMapSeries = null;
this._forexHeatMapSeries_validVersion = 0;

this._forexHeatMapSeries = new ChartHeatMapSeries("heatMapSeries", this._timeAxis, this._valueAxis, this._forexHeatMapSeries_getColor.bind(this), this._forexHeatMapSeries_getValidVersion.bind(this));
this._chartVisual.scene.series.add(this._forexHeatMapSeries);

_forexHeatMapSeries_getValidVersion()
{
	return this._forexHeatMapSeries_validVersion;
}
			//++this._forexHeatMapSeries_validVersion;

_forexHeatMapSeries_getColor(modelX, modelY)
{
	if (!this._robotV3.projectedLineOfBestFitCache) return null;

	var point = { x: this._robotV3._projectX(modelX), y: this._robotV3._projectY(modelY) };
	var rating = V3Rater_TrendLine_Concentration.ratePoint_linearDistance(1500000, this._robotV3.projectedLineOfBestFitCache, point);

	if (rating < 0 || rating > 1) throw "Invalid operation";

	var item =
		{
			r: rating * 255,
			g: 0,
			b: (1 - rating) * 255,
			a: rating * 255,
		};

	return item;
}

_forexHeatMapSeries_getColor_OBSOLETE_nonlinear_test(modelX, modelY)
{
	if (!this._robotV3.projectedLineOfBestFitCache) return null;

	var point = { x: this._robotV3._projectX(modelX), y: this._robotV3._projectY(modelY) };
	var rating = V3Rater_TrendLine_Concentration.ratePoint_nonlinearDistance1(

		1500000,
		this._robotV3.projectedLineOfBestFitCache,
		this._robotV3.lineOfBestFitCache_details.projectedSample[0].x,
		this._robotV3.lineOfBestFitCache_details.projectedSample[this._robotV3.lineOfBestFitCache_details.projectedSample.length - 1].x,
		point);

	if (rating < -1 || rating > 1) throw "Invalid operation";

	var item =
		{
			r: rating < 0 ? 0 : rating * 255,
			g: 0,
			b: rating > 0 ? 0 : (1 - rating) * 255,
			a: Math.abs(rating * 255),
		};

	return item;
}


