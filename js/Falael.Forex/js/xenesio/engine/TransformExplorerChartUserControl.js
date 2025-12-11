"use strict";

include("StdAfx.js");

include("TransformExplorerChartUserControl.css");

include("TransformExplorerChartUserControl", "TransformExplorerChartUserControl.xhtml");

class TransformExplorerChartUserControl extends Control
{
	constructor(id)
	{
		super(id, null, "transformExplorerChart");

		this._chartVisual_left = null;
		this._chartVisual_right = null;

		this._chartIndicatorsController_left = null;
		this._chartIndicatorsController_right = null;

		this.util = {};
		this.util.buildQTable = function (m, sdSample)
		{
			var result =
			{
				m: m,
				Q_neg: [],
				Q_zero: null,
				Q_pos: [],

				getAtN(n)
				{
					if (!n) return this.Q_zero;
					if (n < 0) return this.Q_neg[-n];
					return this.Q_pos[n];
				},
				incAtN(n)
				{
					if (!n)
					{
						if (!this.Q_zero) this.Q_zero = 0;
						++this.Q_zero;
					}
					else if (n < 0)
					{
						if (!this.Q_neg[-n]) this.Q_neg[-n] = 0;
						++this.Q_neg[-n];
					}
					else
					{
						if (!this.Q_pos[n]) this.Q_pos[n] = 0;
						++this.Q_pos[n];
					}
				},
				//	q = Math.exp(x * Math.log(Math.exp(Math.E) + 1) - Math.E) - 1/Math.exp(Math.E)
				getQ(n)
				{
					if (!n) return 0;
					if (n < 0) return -Math.exp(Math.log(Math.exp(Math.E) + 1) * (-n) / this.m - Math.E) - 1 / Math.exp(Math.E);
					return Math.exp(Math.log(Math.exp(Math.E) + 1) * n / this.m - Math.E) - 1 / Math.exp(Math.E);
				},
				getInterval(n)
				{
					if (!n) return { min: 0, max: 0 };
					if (n < 0) return { min: this.getQ(n), max: this.getQ(n + 1) };
					return { min: this.getQ(n - 1), max: this.getQ(n) };
				},
				quantify(value)
				{
					if (!value) return 0;
					if (value < 0) return Math.floor(-this.m * (Math.log(-value + 1 / Math.exp(Math.E)) + Math.E) / Math.log(Math.exp(Math.E) + 1));
					return Math.ceil(this.m * (Math.log(value + 1 / Math.exp(Math.E)) + Math.E) / Math.log(Math.exp(Math.E) + 1));
				}
			};

			var sdx_prev = sdSample.getAt(0, "x");
			var sdy_prev = sdSample.getAt(0, "y");
			for (var length = sdSample.length, i = 1; i < length; ++i)
			{
				var sdx = sdSample.getAt(i, "x");
				var sdy = sdSample.getAt(i, "y");
				//log(921, sdx, sdy);
				var deltax = sdx - sdx_prev;
				var deltay = sdy - sdy_prev;
				var qn = result.quantify(deltay / deltax);
				result.incAtN(qn);
				sdx_prev = sdx;
				sdy_prev = sdy;
			}

			//	TODO: normalize to probability distribution

			return result;
		};
	}


	__render(hostElement)
	{
		var elements = XhtmlTemplate.apply("TransformExplorerChartUserControl", hostElement, null, TemplateEngine.Append);

		this._renderChart_left(elements.leftChartHost);
		this._renderChart_right(elements.rightChartHost);

		this._chartVisual_left.refresh();
		this._chartVisual_right.refresh();

		return elements;
	}

	__refresh()
	{
		this._chartVisual_left.refresh();
	}


	///////////////////////////////////////////////////////////////
	//	left chart
	_renderChart_left(host)
	{
		//var xSpan = 1000 * (1000 * 60 * 60);
		var xSpan = 100000;
		var xStep = xSpan / 50000;
		//var startDate = new Date(2009, 0, 1);
		var startDate = new Date(0);
		var endDate = new Date(startDate.getTime() + xSpan);

		var minY = 0;
		var maxY = 0.00010;
		var yMaxDelta = maxY - minY;
		var yStep = (maxY - minY) / 400;

		var x = startDate.getTime();
		var y = minY + yMaxDelta / 2;
		var rawData = [];
		while (x < endDate.getTime())
		{
			y += Math.sign(Math.random() - 0.5) * Math.random() * 5 * yStep;
			rawData.push({ x: x, y: y });
			x += xStep + Math.random() * 3 * xStep;
		}

		var sample = new MappedArray(rawData,
		{
			x: item => item.x,
			y: item => item.y,
		});

		var sx = sample.standardDeviation("x");
		var sy = sample.standardDeviation("y");
		var sdSample = sample.transformSample(function (item)
		{
			return { x: item.x / sx, y: item.y / sy };
		});

		////////////////////////////////////////////////////////////////////////////////////
		this._chartVisual_left = new ChartVisual("transformExplorerChartVisual_left", EChartDeviceType.Canvas);
		this._chartVisual_left.suspendRefresh();

		this._rawData_render(this._chartVisual_left);
		this._sdData_render(this._chartVisual_left);
		
		this._chartVisual_left.scene.backplane.xAxis = this._xAxis;
		this._chartVisual_left.scene.backplane.yAxis = this._yAxis;

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual_left.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual_left.overlay);
		this._chartVisual_left.resumeRefresh();
		this._chartVisual_left.render(host);
		this._chartVisual_left.refresh();

		this._chartIndicatorsController_left = new ChartIndicatorsController(this._chartVisual_left, this._sxAxis, this._syAxis, this._sdLineSeries);
		this._chartIndicatorsController_left.enabled = true;

		////////////////////////////////////////////////////////////////////////////////////
		this._rawData_show(this._chartVisual_left, sample);
		this._sdData_show(this._chartVisual_left, sdSample);
	}


	_rawData_render(chartVisual)
	{
		this._chartDataSource = null;
		this._xAxis = null;
		this._yAxis = null;
		this._lineSeries = null;

		this._xAxis = chartVisual.scene.axes.add(new ChartDateTimeAxis("x", new ChartDataRange("xAxis")));
		this._xAxis.position = EChartAxisPosition.Bottom;
		this._xAxis.paddingLower = 20;
		this._xAxis.paddingUpper = 20;

		this._yAxis = chartVisual.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("yAxis")));
		this._yAxis.position = EChartAxisPosition.Right;
		this._yAxis.rangeLabelStyle.visible = false;
		this._yAxis.rangeStartLabelStyle.visible = false;
		this._yAxis.rangeEndLabelStyle.visible = false;
		this._yAxis.majorTickRange = 90;
		this._yAxis.minorTickRange = 22.5;
		this._yAxis.paddingLower = 0;
		this._yAxis.paddingUpper = 0;
		this._yAxis.spread = 60;

		this._chartDataSource = new ChartDataSource_Buffer("chartDataSource");

		this._lineSeries = new ChartLineSeries("lineSeries1", 5010, this._xAxis, this._yAxis, "x", "y", this._chartDataSource);
		chartVisual.scene.series.add(this._lineSeries);
	}

	_rawData_show(chartVisual, sample)
	{
		var statx = sample.stat("x");
		var staty = sample.stat("y");

		this._xAxis.dataRange.setBounds(statx.min, statx.max);
		this._yAxis.dataRange.setBounds(staty.min, staty.max);

		this._chartDataSource.addRange(sample.toArray({ x: ["x"], y: ["y"] }));

		var linedef = sample.lineOfBestFit("x", "y");

		var x0 = statx.min;
		var y0 = linedef.calc(x0);
		var x1 = statx.max;
		var y1 = linedef.calc(x1);
		var lineMarker = new ChartLineMarker("lineOfBestFit", this._xAxis, this._yAxis, true);
		lineMarker.modelX0 = x0;
		lineMarker.modelY0 = y0;
		lineMarker.modelX1 = x1;
		lineMarker.modelY1 = y1;
		lineMarker.lineStyle.color = "blue";
		lineMarker.lineStyle.width = 1;
		chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
	}


	_sdData_render(chartVisual)
	{
		this._sdChartDataSource = null;
		this._sxAxis = null;
		this._syAxis = null;
		this._sdLineSeries = null;

		this._sdChartDataSource = new ChartDataSource_Buffer("sdChartDataSource");

		this._sxAxis = chartVisual.scene.axes.add(new ChartNumericAxis("x", new ChartDataRange("sxAxis")));
		this._sxAxis.position = EChartAxisPosition.Bottom;
		this._sxAxis.rangeLabelStyle.visible = false;
		this._sxAxis.rangeStartLabelStyle.visible = false;
		this._sxAxis.rangeEndLabelStyle.visible = false;
		this._sxAxis.majorTickRange = 90;
		this._sxAxis.minorTickRange = 22.5;
		this._sxAxis.paddingLower = 20;
		this._sxAxis.paddingUpper = 20;

		this._syAxis = chartVisual.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("syAxis")));
		this._syAxis.position = EChartAxisPosition.Right;
		this._syAxis.rangeLabelStyle.visible = false;
		this._syAxis.rangeStartLabelStyle.visible = false;
		this._syAxis.rangeEndLabelStyle.visible = false;
		this._syAxis.majorTickRange = 90;
		this._syAxis.minorTickRange = 22.5;
		this._syAxis.paddingLower = 0;
		this._syAxis.paddingUpper = 0;
		this._syAxis.spread = 60;

		this._sdLineSeries = new ChartLineSeries("sdLineSeries1", 5020, this._sxAxis, this._syAxis, "x", "y", this._sdChartDataSource);
		this._sdLineSeries.lineStyle.color = "red";
		chartVisual.scene.series.add(this._sdLineSeries);
	}

	_sdData_show(chartVisual, sdSample)
	{
		var statx = sdSample.stat("x");
		var staty = sdSample.stat("y");

		var sdUniformMin = Math.min(statx.min, staty.min);
		var sdUniformMax = Math.max(statx.max, staty.max);
		this._sxAxis.dataRange.setBounds(sdUniformMin, sdUniformMax);
		this._syAxis.dataRange.setBounds(sdUniformMin, sdUniformMax);

		this._sdChartDataSource.addRange(sdSample.toArray({ x: ["x"], y: ["y"] }));

		var sdLinedef = sdSample.lineOfBestFit("x", "y");

		var x0 = statx.min;
		var y0 = sdLinedef.calc(x0);
		var x1 = statx.max;
		var y1 = sdLinedef.calc(x1);
		var lineMarker = new ChartLineMarker("sdLineOfBestFit", this._sxAxis, this._syAxis, true);
		lineMarker.modelX0 = x0;
		lineMarker.modelY0 = y0;
		lineMarker.modelX1 = x1;
		lineMarker.modelY1 = y1;
		lineMarker.lineStyle.color = "red";
		lineMarker.lineStyle.width = 1;
		chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		var x1 = sdSample.getAt(0, "x");
		var x2 = sdSample.getAt(sdSample.length - 1, "x");
		var sdr = 1;
		for (var x = x1; x <= x2; x += (x2 - x1) / 50)
		{
			var xx = x - 1.8;
			if (xx * xx > sdr * sdr) continue;
			var pointMarker1 = new ChartPointMarker("sdPoint2_" + x, this._sxAxis, this._syAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = Math.sqrt(sdr * sdr - xx * xx) + 1.5;
			pointMarker1.size = 1;
			chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			var pointMarker2 = new ChartPointMarker("sdPoint4_" + x, this._sxAxis, this._syAxis, true);
			pointMarker2.modelX = x;
			pointMarker2.modelY = -Math.sqrt(sdr * sdr - xx * xx) + 1.5;
			pointMarker2.size = 1;
			chartVisual.scene.markers.add(pointMarker2);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker2);
		}
	}


	///////////////////////////////////////////////////////////////
	//	right chart
	async _renderChart_right(host)
	{
		////////////////////////////////////////////////////////////////////////////////////
		this._chartVisual_right = new ChartVisual("transformExplorerChartVisual_right", EChartDeviceType.Canvas);
		this._chartVisual_right.suspendRefresh();

		this._q2tablexAxis = null;
		this._q2tableyAxis = null;
		this._decartxAxis = null;
		this._decartyAxis = null;

		this._decartxAxis = this._chartVisual_right.scene.axes.add(new ChartNumericAxis("x", new ChartDataRange("decartxAxis")));
		this._decartxAxis.position = EChartAxisPosition.Bottom;
		this._decartxAxis.rangeLabelStyle.visible = false;
		this._decartxAxis.rangeStartLabelStyle.visible = false;
		this._decartxAxis.rangeEndLabelStyle.visible = false;
		this._decartxAxis.majorTickRange = 80;
		this._decartxAxis.minorTickRange = 20;
		this._decartxAxis.paddingLower = 20;
		this._decartxAxis.paddingUpper = 20;
		this._decartxAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._decartxAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._q2tablexAxis = this._chartVisual_right.scene.axes.add(new ChartNumericAxis("x", new ChartDataRange("q2tablexAxis")));
		this._q2tablexAxis.position = EChartAxisPosition.Bottom;
		this._q2tablexAxis.rangeLabelStyle.visible = false;
		this._q2tablexAxis.rangeStartLabelStyle.visible = false;
		this._q2tablexAxis.rangeEndLabelStyle.visible = false;
		this._q2tablexAxis.majorTickRange = 80;
		this._q2tablexAxis.minorTickRange = 20;
		this._q2tablexAxis.paddingLower = 50;
		this._q2tablexAxis.paddingUpper = 50;
		this._q2tablexAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._q2tablexAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._q2tableyAxis = this._chartVisual_right.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("q2tablexAxis")));
		this._q2tableyAxis.position = EChartAxisPosition.Right;
		this._q2tableyAxis.rangeLabelStyle.visible = false;
		this._q2tableyAxis.rangeStartLabelStyle.visible = false;
		this._q2tableyAxis.rangeEndLabelStyle.visible = false;
		this._q2tableyAxis.majorTickRange = 80;
		this._q2tableyAxis.minorTickRange = 20;
		this._q2tableyAxis.paddingLower = 0;
		this._q2tableyAxis.paddingUpper = 0;
		this._q2tableyAxis.spread = 60;
		this._q2tableyAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._q2tableyAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._decartyAxis = this._chartVisual_right.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("decartxAxis")));
		this._decartyAxis.position = EChartAxisPosition.Right;
		this._decartyAxis.rangeLabelStyle.visible = false;
		this._decartyAxis.rangeStartLabelStyle.visible = false;
		this._decartyAxis.rangeEndLabelStyle.visible = false;
		this._decartyAxis.majorTickRange = 80;
		this._decartyAxis.minorTickRange = 20;
		this._decartyAxis.paddingLower = 0;
		this._decartyAxis.paddingUpper = 0;
		this._decartyAxis.spread = 60;
		this._decartyAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._decartyAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._chartVisual_right.scene.backplane.xAxis = this._decartxAxis;
		this._chartVisual_right.scene.backplane.yAxis = this._decartyAxis;

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual_right.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual_right.overlay);
		this._chartVisual_right.resumeRefresh();
		this._chartVisual_right.render(host);
		this._chartVisual_right.refresh();

		//this._chartIndicatorsController_right = new ChartIndicatorsController(this._chartVisual_right, this._decartxAxis, this._decartyAxis, this._decartLineSeries);
		//this._chartIndicatorsController_right.enabled = true;

		//this._q2table_show(this._chartVisual_right);
		await this._decartSpace_show(this._chartVisual_right);

		this._chartVisual_right.refresh();
	}

	async _decartSpace_show(chartVisual)
	{
		this._decartxAxis.dataRange.setBounds(0, 1);
		this._decartyAxis.dataRange.setBounds(0, 1);

		//var dpcount = 500000;

		//var minY = 0.1;
		//var maxY = 0.2;
		//var yMaxDelta = maxY - minY;
		//var yStep = (maxY - minY) / 400;

		//var y = minY + yMaxDelta / 2;
		//var rawData = [];
		//for (var i = 0; i < dpcount; i += 1 + Math.round(Math.random() * 0.60) + Math.round(Math.random() * 0.53) + Math.round(Math.random() * 0.51))
		//{
		//	y += Math.sign(Math.random() - 0.5) * Math.random() * 5 * yStep;
		//	rawData.push({ x: i, y: y });
		//}

		//var sample = new MappedArray(rawData,
		//{
		//	x: item => item.x,
		//	y: item => item.y,
		//});

		//var sy = sample.standardDeviation("y");
		//var semiSdSample = sample.transformSample(function (item)
		//{
		//	return { x: item.x, y: item.y / sy };
		//});

		///////////////////////////////////////////////////

		//var resolution = 50;
		//for (var anorm = -99; anorm <= 99; ++anorm)
		//{
		//	var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource" + anorm);
		//	var decartLineSeries = new ChartLineSeries("decartLineSeries" + anorm, 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//	if (anorm < 0) decartLineSeries.lineStyle.color = "green";
		//	else if (anorm > 0) decartLineSeries.lineStyle.color = "blue";
		//	else decartLineSeries.lineStyle.color = "red";
		//	chartVisual.scene.series.add(decartLineSeries);
		//	for (var x = 0; x <= 1 * resolution; ++x)
		//	{
		//		var xx = x / resolution;
		//		//if (anorm == 1) log(911, xx, MappedArray.fnorm(0.01, xx));
		//		decartChartDataSource.add({ x: xx, y: MappedArray.fnorm(anorm / 100, xx) });
		//	}
		//}

		//var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource1");
		//var decartLineSeries = new ChartLineSeries("decartLineSeries1", 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//decartLineSeries.lineStyle.color = "green";
		//var anorm = 0.99;
		//chartVisual.scene.series.add(decartLineSeries);
		//for (var x = 0; x <= 1 * resolution; ++x)
		//{
		//	var xx = x / resolution;
		//	//decartChartDataSource.add({ x: xx, y: Math.ceil(50 * MappedArray.fnorm(anorm, xx)) / 50 });
		//	decartChartDataSource.add({ x: xx, y: MappedArray.fnorm(anorm, xx) });
		//}

		//var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource2");
		//var decartLineSeries = new ChartLineSeries("decartLineSeries2", 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//decartLineSeries.lineStyle.color = "blue";
		//var anorm = -0.99;
		//chartVisual.scene.series.add(decartLineSeries);
		//for (var x = 0; x <= 1 * resolution; ++x)
		//{
		//	var xx = x / resolution;
		//	//decartChartDataSource.add({ x: xx, y: Math.ceil(50 * MappedArray.fnorm(anorm, xx)) / 50 });
		//	decartChartDataSource.add({ x: xx, y: MappedArray.ifnorm(anorm, 1 - xx) });
		//}

		//var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource3");
		//var decartLineSeries = new ChartLineSeries("decartLineSeries3", 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//decartLineSeries.lineStyle.color = "red";
		//chartVisual.scene.series.add(decartLineSeries);
		//for (var length = MappedArray.table_sdUpperBoundRatio.length, i = 0; i < length; ++i)
		//{
		//	var x = i / MappedArray.table_sdUpperBoundRatio.length;
		//	var value = MappedArray.table_sdUpperBoundRatio[i];
		//	decartChartDataSource.add({ x: x, y: value });
		//}

		//var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource4");
		//var decartLineSeries = new ChartLineSeries("decartLineSeries4", 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//decartLineSeries.lineStyle.color = "pink";
		//chartVisual.scene.series.add(decartLineSeries);
		//var func = (x) =>
		//{
		//	return -Math.log((x - 0.027) * 10000000) / 21 + 1.115;
		//};
		//for (var x = 0; x <= 1; x += 0.01)
		//{
		//	var value = func(x);
		//	decartChartDataSource.add({ x: x, y: value });
		//}

		//var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource4");
		//var decartLineSeries = new ChartLineSeries("decartLineSeries4", 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//decartLineSeries.lineStyle.color = "black";
		//chartVisual.scene.series.add(decartLineSeries);
		//for (var length = MappedArray.table_sdLowerBoundRatio.length, i = 0; i < length; ++i)
		//{
		//	var x = i / MappedArray.table_sdLowerBoundRatio.length;
		//	var value = MappedArray.table_sdLowerBoundRatio[i];
		//	decartChartDataSource.add({ x: x, y: value });
		//}

		//var decartChartDataSource = new ChartDataSource_Buffer("decartChartDataSource5");
		//var decartLineSeries = new ChartLineSeries("decartLineSeries5", 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		//decartLineSeries.lineStyle.color = "cyan";
		//chartVisual.scene.series.add(decartLineSeries);
		//var func = (x) =>
		//{
		//	return Math.log((x - 0.027) * 100000000) / 21 - 0.67;
		//};
		//for (var x = 0; x <= 1; x += 0.01)
		//{
		//	var value = func(x);
		//	decartChartDataSource.add({ x: x, y: value });
		//}

		var decartChartDataSource = new ChartDataSource_Buffer(newLUID());
		var decartLineSeries = new ChartLineSeries(newLUID(), 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		decartLineSeries.lineStyle.color = "blue";
		chartVisual.scene.series.add(decartLineSeries);

		var decartChartDataSource2 = new ChartDataSource_Buffer(newLUID());
		var decartLineSeries2 = new ChartLineSeries(newLUID(), 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource2);
		decartLineSeries2.lineStyle.color = "red";
		chartVisual.scene.series.add(decartLineSeries2);

		var decartChartDataSource3 = new ChartDataSource_Buffer(newLUID());
		var decartLineSeries3 = new ChartLineSeries(newLUID(), 5010, this._decartxAxis, this._q2tableyAxis, "x", "y", decartChartDataSource3);
		decartLineSeries3.lineStyle.color = "black";
		chartVisual.scene.series.add(decartLineSeries3);

		const a = 0.35;
		const b = 0;
		const k = 0.533;
		const factor = 967549.3643736127
		//const factor = 1;
		var func = x =>
		{
			return (Math.pow(a * (x - b), k) + Math.pow(a * b, k)) * factor;
		};
		const items = await app.db.listNormalXYRatios(ForexDataBase.Instruments.EURUSD);
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		let qminY = Infinity;
		let qmaxY = -Infinity;
		let avgDev = 0;
		for (let length = items.length - 6, i = 0; i < length; ++i)
		{
			const pitem = items[i - 1];
			const item = items[i];
			const x = item.range_x;
			const y = item.ratio;
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
			decartChartDataSource.add({ x, y });
			decartChartDataSource2.add({ x, y: func(x) });
			if (i > 0) avgDev = Sample.avginc(avgDev, y / func(x), i);
			log(911, y, func(x), y / func(x), avgDev);

			const qy = func(x) - y;
			decartChartDataSource3.add({ x, y: qy });
			qminY = Math.min(qminY, qy);
			qmaxY = Math.max(qmaxY, qy);
		}
		this._decartxAxis.dataRange.setBounds(minX, maxX);
		this._decartyAxis.dataRange.setBounds(minY, maxY);

		this._q2tableyAxis.dataRange.setBounds(qminY, qmaxY);
		log(222, decartChartDataSource3)
		//window.setTimeout(() => this._probabilityTests(chartVisual), 0);

		ChartStyleSheet.defaultSceneStyle.applyToScene(chartVisual.scene);
	}

	async _probabilityTests(chartVisual)
	{
		var decartChartDataSource = new ChartDataSource_Buffer(newLUID());
		var decartLineSeries = new ChartLineSeries(newLUID(), 5010, this._decartxAxis, this._decartyAxis, "x", "y", decartChartDataSource);
		decartLineSeries.lineStyle.color = "blue";
		chartVisual.scene.series.add(decartLineSeries);
		var func = (x) =>
		{
			return Math.log((x - 0.027) * 100000000) / 21 - 0.67;
		};
		for (var x = 0; x <= 1; x += 0.01)
		{
			var value = func(x);
			decartChartDataSource.add({ x: x, y: value });
		}

		ChartStyleSheet.defaultSceneStyle.applyToScene(chartVisual.scene);
		chartVisual.refresh();
	}

	_q2table_show(chartVisual)
	{
		//var sample = MappedArray.generateSample(100000,
		//{
		//	distributionType: "random",
		//	schemaType: "array",
		//	probabilityDistributionType: "biasedAtZero",
		//	valueAccessorKey_i: "x",
		//	valueAccessorKey_value: "y",
		//	minY: 0.1,
		//	maxY: 0.2,
		//	resolutionY: 400,
		//	stepYSpread: 5,
		//});

		//var sample = MappedArray.generateSample(100000,
		//{
		//	distributionType: "random",
		//	schemaType: "array",
		//	probabilityDistributionType: "uniform",
		//	valueAccessorKey_i: "x",
		//	valueAccessorKey_value: "y",
		//	minY: 0.1,
		//	maxY: 0.2,
		//	resolutionY: 400,
		//	stepYSpread: 5,
		//});

		var sample = MappedArray.generateSample(10000,
		{
			distributionType: "function",
			schemaType: "array",
			valueAccessorKey_i: "x",
			valueAccessorKey_value: "y",
			//calc: x => x,
			//calc: x => x * x,
			//calc: x => x * x * x,
			//calc: x => x * x * x * x,
			//calc: x => Math.sqrt(x),
			//calc: x => Math.exp(x/10000),
			//calc: x => Math.sin(x / 2000),
			calc: x => Math.sin(x / 10000),
			//calc: x => MappedArray.sigmoid(x),
			//calc: x => 1 / (x + 0.000000001),
			//calc: x => (x + 10000) * (x + 10000) * (x + 10000) + (x + 10000) * (x + 10000),
			//calc: x => (x - 10000) * (x - 10000) * (x - 10000) + (x - 10000) * (x - 10000),
			//calc: x => Math.tan(x / 2),
			//calc: x => Math.sin(x / 2000) / (x + 0.000000001),
		});

		var sy = sample.standardDeviation("y");
		var semiSdSample = sample.transformSample(function (item)
		{
			return { x: item.x, y: item.y / sy };
		});

		///////////////////////////////////////////////////
		var resolution = 50;
		this._q2tablexAxis.dataRange.setBounds(-resolution, resolution);
		this._q2tableyAxis.dataRange.setBounds(-1, 1);

		//for (var anorm = -999; anorm <= 999; ++anorm)
		var anorm = 0;
		//var anorm = 999;
		//var anorm = -999;
		{
			var q2table = semiSdSample.q2table(resolution, anorm / 1000, "x", "y");
			if (q2table.Q_neg.length > resolution || q2table.Q_pos.length > resolution) throw "Invalid operation.";
			var q2tableChartDataSource = new ChartDataSource_Buffer("q2tableChartDataSource" + anorm);
			var q2tableLineSeries = new ChartLineSeries("q2tableLineSeries" + anorm, 5010, this._q2tablexAxis, this._q2tableyAxis, "x", "y", q2tableChartDataSource);
			if (anorm < 0) q2tableLineSeries.lineStyle.color = "magenta";
			else if (anorm > 0) q2tableLineSeries.lineStyle.color = "cyan";
			else q2tableLineSeries.lineStyle.color = "red";
			chartVisual.scene.series.add(q2tableLineSeries);
			for (var i = q2table.Q_neg.length - 1; i >= 0 ; --i) q2tableChartDataSource.add({ x: -(i + 1), y: q2table.Q_neg[i] });
			q2tableChartDataSource.add({ x: 0, y: q2table.Q_zero });
			for (var i = 0; i < q2table.Q_pos.length; ++i) q2tableChartDataSource.add({ x: i + 1, y: q2table.Q_pos[i] });
			for (var length = q2tableChartDataSource.rawData.length, i = 0; i < length; ++i)
			{
				var item = q2tableChartDataSource.rawData[i];
				var pointMarker1 = new ChartPointMarker("pt" + i, this._q2tablexAxis, this._q2tableyAxis, true);
				pointMarker1.modelX = item.x;
				pointMarker1.modelY = item.y;
				pointMarker1.size = 2;
				chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
			}
		}

		ChartStyleSheet.defaultSceneStyle.applyToScene(chartVisual.scene);
	}
}