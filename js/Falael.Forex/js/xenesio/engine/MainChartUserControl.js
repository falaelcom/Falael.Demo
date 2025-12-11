"use strict";

include("StdAfx.js");

include("MainChartUserControl.css");

include("MainChartUserControl", "MainChartUserControl.xhtml");

class MainChartUserControl extends Control
{
	constructor(id)
	{
		super(id, null, "mainChart");

		this._infoLabel = null;
		this._useButton = null;

		this._forexDataSource = null;
		this._forexDataSource_updateSync = new Sync("MainChartUserControl::forexDataSource_updateSync");
		this._tickDataThreshold = 1000 * 60 * 7;
		this._instrumentId = ForexDataBase.Instruments.EURUSD;
		this._sampleIntervalDef = null;

		this._chartVisual = null;
		this._timelineAxis = null;
		this._timeAxis = null;
		this._valueAxis = null;
		this._forexAreaSeries = null;

		this._simulationStartIndicatorX = null;
		this._simulationStartBehavior = null;

		this._chartIndicatorsController = null;
		this._chartHorizontalPanZoomController = null;

		this._selectionChange = new MulticastDelegate();
	}


	onSelectionChange(args)
	{
		this._selectionChange.execute(this, args);
	}


	__render(hostElement)
	{
		var elements = XhtmlTemplate.apply("MainChartUserControl", hostElement, null, TemplateEngine.Append);

		this._infoLabel = new LabelVisual("plain", "mainChartInfoLabel");
		this._infoLabel.suspendRefresh();
		this._infoLabel.render(elements.infoLabelHost);
		this._infoLabel.resumeRefresh();
		this._infoLabel.refresh();

		this._useButton = new Button("textButton", "useButton");
		this._useButton.suspendRefresh();
		this._useButton.text = "Use";
		this._useButton.render(elements.buttonsHost);
		this._useButton.resumeRefresh();
		this._useButton.refresh();
		this._useButton.click.add(this._useButton_click.bind(this));

		//////////////////////////////////////////////////////////////////////////////////
		this._forexDataSource = new ForextDbChartDataSource("forexDataSource", app.db);
		this._forexDataSource.instrumentId = this._instrumentId;

		////////////////////////////////////////////////////////////////////////////////////
		this._chartVisual = new ChartVisual("mainChartVisual", EChartDeviceType.Canvas);
		this._chartVisual.suspendRefresh();

		this._timelineAxis = this._chartVisual.scene.axes.add(new ChartDateTimeAxis("timeline", new ChartDataRange("timeline")));
		this._timelineAxis.dataRange.setBounds(
			new Date(2009, 0, 1, 0, 0, 0).getTime(),
			new Date(2020, 0, 1, 0, 0, 0).getTime()
		);
		this._timelineAxis.position = EChartAxisPosition.Bottom;
		this._timelineAxis.rangeLabelStyle.visible = false;
		this._timelineAxis.rangeStartLabelStyle.visible = false;
		this._timelineAxis.rangeEndLabelStyle.visible = false;

		this._timeAxis = this._chartVisual.scene.axes.add(new ChartDateTimeAxis("time", new ChartDataRange("timeAxis")));
		this._timeAxis.position = EChartAxisPosition.Bottom;
		this._timeAxis.paddingLower = 20;
		this._timeAxis.paddingUpper = 20;

		this._valueAxis = this._chartVisual.scene.axes.add(new ChartNumericAxis("value", new ChartDataRange("valueAxis")));
		this._valueAxis.position = EChartAxisPosition.Right;
		this._valueAxis.rangeLabelStyle.visible = false;
		this._valueAxis.rangeStartLabelStyle.visible = false;
		this._valueAxis.rangeEndLabelStyle.visible = false;
		this._valueAxis.spread = 60;

		this._chartVisual.scene.backplane.xAxis = this._timeAxis;
		this._chartVisual.scene.backplane.yAxis = this._valueAxis;

		this._forexAreaSeries = new ChartAreaSeries("areaSeries1", 5010, this._timeAxis, this._valueAxis, "dt", "bid", "ask", this._forexDataSource);
		this._forexAreaSeries.gapTester = function (left, right)
		{
			var gapSize = 10;

			if (!this._sampleIntervalDef) return false;
			var unit = this._sampleIntervalDef.unit;
			var length = this._sampleIntervalDef.length;
			var leftMoment = moment.utc(left);
			var rightMoment = moment.utc(right);
			var range = EDateTimeUnit.diffMoments(rightMoment, leftMoment, unit);
			return range > gapSize * length;
		}.bind(this);
		this._chartVisual.scene.series.add(this._forexAreaSeries);

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		this._chartVisual.resumeRefresh();
		this._chartVisual.render(elements.chartHost);
		this._chartVisual.refresh();

		this._timeAxis.change.add(this._timeAxis_change.bind(this));

		this._chartIndicatorsController = new ChartIndicatorsController(this._chartVisual, this._timeAxis, this._valueAxis, this._forexAreaSeries);
		this._chartIndicatorsController.enabled = true;

		this._chartHorizontalPanZoomController = new ChartHorizontalPanZoomController(this._chartVisual, this._timeAxis, this._valueAxis, this._timelineAxis);
		this._chartHorizontalPanZoomController.changing.add(this._chartHorizontalPanZoomController_changing.bind(this));
		this._chartHorizontalPanZoomController.enabled = true;

		//	simulation indicators
		this._simulationStartIndicatorX = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("simulationStartIndicatorX", 90, this._timeAxis, this._valueAxis, true));
		this._simulationStartIndicatorX.lineStyle.color = "lime";
		this._simulationStartIndicatorX.lineStyle.width = 1;
		this._simulationStartIndicatorX.lineStyle.strokeStyle = "solid";

		this._simulationStartBehavior = new Behavior(this._chartVisual.backplane);
		this._simulationStartBehavior.enableEventRole(EBrowserEventType.DblClick, "chart");
		this._simulationStartBehavior.__onDblClick = this._simulationStartBehavior__onDblClick.bind(this);	//	inline override of __onDblClick
		this._simulationStartBehavior.enabled = true;

		return elements;
	}

	__refresh()
	{
		this._chartVisual.refresh();
		this._chartVisual.debug_infoAvailable.add(this._updateInfoLabel.bind(this));

		this._useButton.refresh();
	}

	__onEnabledChanged(value)
	{
		this._useButton.enabled = value;
		this._simulationStartBehavior.enabled = value;
	}


	initializeSimulationStartIndicator()
	{
		this._simulationStartIndicatorX.modelX = this._timeAxis.dataRange.min;
	}

	async initializeChartBounds(min, max)
	{
		this._timeAxis.dataRange.setBounds(min, max);
		await this._updateDataChannel();
	}


	async _updateDataChannel()
	{
		if (this._forexDataSource_updateSync.isBlocking) return;
		await this._forexDataSource_updateSync.execute(async function _updateDataChannel_sync()
		{
			this._chartVisual.suspendRefresh();
			try
			{
				this._sampleIntervalDef = await app.db.selectSampleInterval(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max, this._timeAxis.scaleInfoCache.sceneLengthDeflated, this._tickDataThreshold);
				this._forexDataSource.sampleIntervalDef = this._sampleIntervalDef;
				this._forexDataSource.authorativeRange = new Range(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max).inflate(0.25, 0.25).roundUp(0.5);
				await this._forexDataSource.refreshData();
				this._valueAxis.dataRange.setBounds(this._forexDataSource.adaptiveRange.min, this._forexDataSource.adaptiveRange.max);
			}
			finally
			{
				this._chartVisual.resumeRefresh();
			}
			this._chartVisual.refresh();
			this._updateInfoLabel();
		}.bind(this));
	}

	_getFpsText(fps)
	{
		if (!isFinite(fps))
		{
			return this._lastFpsText || "";
		}

		var maxHistoryLength = 32;
		if (!this._fpsHistory) this._fpsHistory = [];
		if (this._fpsHistory.length > maxHistoryLength) this._fpsHistory.shift();
		this._fpsHistory.push(fps);
		var sum = 0;
		for (var length = this._fpsHistory.length, i = 0; i < length; ++i) sum += this._fpsHistory[i];
		var avg = sum / this._fpsHistory.length;
		if (avg > 1000) this._lastFpsText = "MAX fps";
		else this._lastFpsText = Math.round(avg) + " fps";
		return this._lastFpsText;
	}

	_updateInfoLabel()
	{
		var xRatio = this._chartVisual.getDebug_sceneToModelRatio(this._timeAxis);
		var yRatio = this._chartVisual.getDebug_sceneToModelRatio(this._valueAxis);
//		log(669, "virtual projection factor suggestion", Math.round(xRatio / yRatio));

		var sb = [];

		sb.push(this._getFpsText(this._chartVisual.debug_renderFps));
		sb.push("<br />");

		sb.push("Datapoint cache: ");
		sb.push(app.db.cachedDataPointCount);
		sb.push("<br />");
		sb.push("<br />");

		sb.push("Sample interval: ");
		if (this._sampleIntervalDef) sb.push(this._sampleIntervalDef.length + " " + EDateTimeUnit.getName(this._sampleIntervalDef.unit) + "(s)");
		else sb.push("tick");
		sb.push("<br />");
		sb.push("<br />");

		var commonText = EDateTimeUnit.formatCommon(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max);
		if (commonText)
		{
			sb.push(commonText);
			sb.push("<br />");
		}
		sb.push(EDateTimeUnit.formatUncommon(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max));
		sb.push(" - ");
		sb.push(EDateTimeUnit.formatUncommon(this._timeAxis.dataRange.max, this._timeAxis.dataRange.min));
		sb.push("<br />");

		sb.push(Math.round(this._timeAxis.dataRange.min));
		sb.push(" - ");
		sb.push(Math.round(this._timeAxis.dataRange.max));
		sb.push("<br />");

		sb.push("<br />");
		sb.push(moment.duration(this._timeAxis.dataRange.length).humanize());

		this._infoLabel.text = sb.join("");
	}


	async _chartHorizontalPanZoomController_changing(sender, args)
	{
		await this._updateDataChannel();
	}

	async _timeAxis_change(sender, args)
	{
	}

	_useButton_click(sender, args)
	{
		var alignedMinMoment = EDateTimeUnit.floorMoment(moment(this._timeAxis.dataRange.min), this._sampleIntervalDef.unit, this._sampleIntervalDef.length);
		alignedMinMoment = EDateTimeUnit.addToMoment(alignedMinMoment, this._sampleIntervalDef.length, this._sampleIntervalDef.unit);

		this.onSelectionChange(
		{
			authorative:
			{
				min: alignedMinMoment.valueOf(),
				max: this._timeAxis.dataRange.max,
				start: this._simulationStartIndicatorX.modelX,
			},
			adaptive:
			{
				min: this._forexDataSource.adaptiveRange.min,
				max: this._forexDataSource.adaptiveRange.max
			},
		});
	}

	_simulationStartBehavior__onDblClick(args)
	{
		if (args.button != 0)
		{
			return;
		}
		var hitTestResult = this._chartVisual.hitTest(args.localX, args.localY, function (element)
		{
			return ["range2d"].indexOf(element.elementType) != -1;
		});
		if (hitTestResult)
		{
			//	don't act if a range2d is doubleclicked
			return;
		}

		this._simulationStartIndicatorX.modelX = this._timeAxis.sceneToModel(args.x);
		this._chartVisual.refresh();
	}


	get tickDataThreshold()
	{
		return this._tickDataThreshold;
	}

	get chartVisual()
	{
		return this._chartVisual;
	}

	get xAxis()
	{
		return this._timeAxis;
	}

	get yAxis()
	{
		return this._valueAxis;
	}


	get selectionChange()
	{
		return this._selectionChange;
	}
}
