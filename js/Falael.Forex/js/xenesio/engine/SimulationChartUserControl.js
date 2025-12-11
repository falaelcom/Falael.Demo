"use strict";

include("StdAfx.js");

include("SimulationChartUserControl.css");

include("SimulationChartUserControl", "SimulationChartUserControl.xhtml");

class SimulationChartUserControl extends Control
{
	constructor(id)
	{
		super(id, null, "simulationChart");

		this._detailTabControl = null;

		this._infoLabel = null;
		this._runButton_discrete = null;
		this._runButton_realTime = null;
		this._runButton_realTime_x2 = null;
		this._runButton_realTime_x4 = null;
		this._runButton_afaic = null;
		this._simulateButton_visibleRange = null;
		this._simulateButton_geneticSimulator = null;
		this._stopButton = null;
		this._clearButton = null;

		this._forexAccount = null;
		this._forexAccountUserControl = null;
		this._forexBrokerClient = null;
		this._simulationStart_originalValue = null;

		this._forexDataSource = null;
		this._forexDataSource_updateSync = new Sync("SimulationChartUserControl::forexDataSource_updateSync");
		this._forexDataSource_simulation = null;
		this._dataSource1 = null;
		this._indicator2DataSource = null;
		this._tickDataThreshold = 1000 * 60 * 7;
		this._instrumentId = ForexDataBase.Instruments.EURUSD;
		this._sampleIntervalDef = null;

		this._chartVisual = null;
		this._timelineAxis = null;
		this._timeAxis = null;
		this._valueAxis = null;
		this._forexAreaSeries = null;
		this._forexHlAreaSeries = null;
		this._adaptiveDataRange__rawMin = null;
		this._adaptiveDataRange__rawMax = null;

		this._indicatorChartVisual = null;
		this._indicatorTimeAxis = null;
		this._indicatorValueAxis = null;

		this._indicator2ChartVisual = null;
		this._indicator2TimeAxis = null;
		this._indicator2ValueAxis = null;
		this._indicator2LineSeries = null;

		this._forexRobotV5_ChannelChain_Factory = null;
		this._forexFeatureVisualizerV5 = null;

		this._forexRobotV5_ChannelChain = null;
		this._channelShaperConfig =
		{
			//channelMode: "lineOfBestFit",
			minSignificantDataPointCount: 3,
			maxChannelDataPointCount: 666,

			priceSourcing: EPriceSourcingV5.HighLow,

			supportAndResistance_minChannelSpread: 0.0012,
			supportAndResistance_derangeThresholdFactor: 1.25,

			lineOfBestFit_variability_windowSize: 23,
			lineOfBestFit_spi1_variability_lowerThreshold: 0.065,
			lineOfBestFit_spi1_standardDeviation_thresholdFactor: 1,
			lineOfBestFit_deadZone_inertiaPointCount: 5,

			traderSNR_ZigZag:
			{
				SNR_ZigZag_trade_thresholdFactord: 0.1,
			},

			traderLBF:
			{
				LBF_tradeOpen_spreadThreshold: 0.0001,
				LBF_tradeOpen_ldNValue: 1163116,
				LBF_tradeOpen_sdAngleThreshold: 0.2410,
				LBF_tradeOpen_sdyThresholdFactor: 0,
				LBF_tradeClose_sdyThresholdFactor: 1,
				LBF_tradeClose_sdTargetProfit: 1,
			},
		};
		this._channelPoisShaperConfig =
		{
			channelShaperConfig: this._channelShaperConfig,
			spi3_introDuration_sampleCount: 140,
			spi4_cvDelta_lowerThreshold: 0.6,
			spi4_considerZoning: true,
			spi5_tradeOpen_standardDeviation_thresholdFactor: 0.5,
			spi6_tradeClose_standardDeviation_thresholdFactor: 0.5,
		};

		this._discreteSimulationKeyboardBehavior = null;
		this._horizontalRangeSelectBehavior = null;
		this._horizontalRangeSelectBehavior_deferrer = null;

		this._chartIndicatorsController = null;
		this._chartHorizontalPanZoomController = null;

		this._simulationStartIndicatorX = null;
		this._progressIndicatorX = null;
		this._progressLabelIndicator = null;
		this._selectedPositionEntryPriceIndicatorY = null;
		this._selectedPositionEvenPriceIndicatorY = null;

		this._state = SimulationChartUserControl.State.Exploration;

		this._simulationStateChange = new MulticastDelegate();
	}


	onSimulationStateChange(args)
	{
		this._simulationStateChange.execute(this, args);
	}


	async initializeChartBounds(min, max)
	{
		this._timeAxis.dataRange.setBounds(min, max);
		await this._updateDataChannel(new Range(min, max));
	}

	async setTimeRange(min, max, start, sampleIntervalDef)
	{
		this._sampleIntervalDef = sampleIntervalDef;

		var range = max - min;
		this._timelineAxis.dataRange.setBounds(min, max + 20 * range);
		this._timeAxis.dataRange.setBounds(min, max);
		this._simulationStart_originalValue = start;
		this._forexBrokerClient.simulationStartMs = start;
		this._forexDataSource.authorativeRange = new Range(min, max).inflate(0.1, 0.1);

		if (this._simulationStartIndicatorX.modelX != start)
		{
			this._simulationStartIndicatorX.modelX = start;

			this._forexDataSource_simulation.clear();
			this._progressIndicatorX.visible = false;
			this._progressLabelIndicator.visible = false;
		}

		await this._updateDataChannel(new Range(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max).inflate(0.1, 0.1));

		this._reset_forexRobotV5_ChannelChain();
		this._channelChainV5 = null;
		this._forexRobotV5_ChannelChain.initialize(this._sampleIntervalDef);
	}

	setValueRange(min, max)
	{
		if (this._forexAccountUserControl.selectedPosition)
		{
			if (min > this._forexAccountUserControl.selectedPosition.entryPrice) min = this._forexAccountUserControl.selectedPosition.entryPrice;
			if (max < this._forexAccountUserControl.selectedPosition.entryPrice) max = this._forexAccountUserControl.selectedPosition.entryPrice;
			switch (this._forexAccountUserControl.selectedPosition.type)
			{
				case EForexPositionType.Long:
					if (min > this._forexAccountUserControl.selectedPosition.exitEvenPrice) min = this._forexAccountUserControl.selectedPosition.exitEvenPrice;
					if (max < this._forexAccountUserControl.selectedPosition.exitEvenPrice) max = this._forexAccountUserControl.selectedPosition.exitEvenPrice;
					break;
				case EForexPositionType.Short:
					break;
				default:
					throw "Not implemented.";
			}
		}

		this._valueAxis.dataRange.setBounds(min, max);
		this._adaptiveDataRange__rawMin = min;
		this._adaptiveDataRange__rawMax = max;
	}


	__render(hostElement)
	{
		var elements = XhtmlTemplate.apply("SimulationChartUserControl", hostElement, null, TemplateEngine.Append);

		this._forexRobotV5_ChannelChain_Factory = new ForexRobotV5_ChannelChain_Factory();

		this._forexAccount = new ForexAccount_Oanda_Simulated(
		{
			monthlyCommission: 200,				//	400 USD in OANDA - 
			instrumentCommission: 0,			//	0 in OANDA - https://pages.oanda.com/OAU-OANDACorePrices.html, with option for commission and lower spreads
			minimumInstrumentCommission: 0,		//	0 in OANDA - https://pages.oanda.com/OAU-OANDACorePrices.html, with option for commission and lower spreads
			marginRequirementFactor: 3.3 / 100,	//	3.3% in OANDA - https://www1.oanda.com/resources/legal/europe/legal/margin-rates
			marginCallLevelPercent: 100,		//	?? in OANDA - https://www1.oanda.com/forex-trading/analysis/margin-call-calculator
			stopOutLevelPercent: 50,			//	?? in OANDA,
			//balance: 100000,
			balance: 5000,
		});

		this._forexDataSource = new ForextDbChartDataSource("forexDataSource", app.db);
		this._forexDataSource.instrumentId = this._instrumentId;

		this._forexDataSource_simulation = new ForextFeedChartDataSource("simulationDataSource");

		this._detailTabControl = new TabControl("plain", "detailTabControl", "detailTabControl");
		this._detailTabControl.render(elements.detailHost);
		this._detailTabControl.tabPages.add(
		{
			key: "infoView",
			title: "Info",
			prerender: true,
			render: async function (hostElement)
			{
				this._render_infoElements(hostElement);
			}.bind(this),
		});
		this._detailTabControl.tabPages.add(
		{
			key: "q2tableView",
			title: "Q2T",
			render: async function (hostElement)
			{
				this._render_q2tableChart(hostElement);
			}.bind(this),
		});
		this._detailTabControl.tabPages.add(
		{
			key: "sdView",
			title: "SD",
			render: async function (hostElement)
			{
				this._render_sdChart(hostElement);
			}.bind(this),
		});
		this._detailTabControl.tabPages.add(
		{
			key: "fftView",
			title: "FFT",
			render: async function (hostElement)
			{
				this._render_fftChart(hostElement);
			}.bind(this),
		});
		this._detailTabControl.tabPages.add(
		{
			key: "channelAdjustView",
			title: "Chan",
			render: async function (hostElement)
			{
				this._render_channelAdjustElements(hostElement);
			}.bind(this),
		});
		this._detailTabControl.tabPages.add(
		{
			key: "statCalcView",
			title: "Stat",
			render: async function (hostElement)
			{
				this._render_statCalcElements(hostElement);
			}.bind(this),
		});
		//this._detailTabControl.selectedTabPageKey = "infoView";
		//this._detailTabControl.selectedTabPageKey = "sdView";
		//this._detailTabControl.selectedTabPageKey = "channelAdjustView";
		//this._detailTabControl.selectedTabPageKey = "fftView";
		this._detailTabControl.selectedTabPageKey = "statCalcView";
		this._detailTabControl.refresh();

		this._render_chart(elements.chartHost);
		this._render_indicatorChart(elements.indicatorChartHost);
		this._render_indicator2Chart(elements.indicator2ChartHost);

		this._forexFeatureVisualizerV5 = new ForexFeatureVisualiserV5(
		{
			chartVisual: this._chartVisual,
			timeAxis: this._timeAxis,
			valueAxis: this._valueAxis,
			indicatorChartVisual: this._indicatorChartVisual,
			indicatorTimeAxis: this._indicatorTimeAxis,
			indicatorValueAxis: this._indicatorValueAxis,
		});

		this._reset_forexRobotV5_ChannelChain();

		return elements;
	}


	_render_infoElements(hostElement)
	{
		var elements = XhtmlTemplate.apply("SimulationChartUserControl::infoLayout", hostElement, null, TemplateEngine.Append);

		this._infoLabel = new LabelVisual("plain", "simulationChartInfoLabel");
		this._infoLabel.suspendRefresh();
		this._infoLabel.render(elements.infoLabelHost);
		this._infoLabel.resumeRefresh();
		this._infoLabel.refresh();

		this._runButton_discrete = new Button("textButton", "runButton_discrete");
		this._runButton_discrete.suspendRefresh();
		this._runButton_discrete.text = "Run DCE";
		this._runButton_discrete.render(elements.buttonsHost);
		this._runButton_discrete.resumeRefresh();
		this._runButton_discrete.refresh();
		this._runButton_discrete.click.add(this._runButton_discrete_click.bind(this));

		this._runButton_realTime = new Button("textButton", "runButton_realTime");
		this._runButton_realTime.suspendRefresh();
		this._runButton_realTime.text = "Run RT";
		this._runButton_realTime.render(elements.buttonsHost);
		this._runButton_realTime.resumeRefresh();
		this._runButton_realTime.refresh();
		this._runButton_realTime.click.add(this._runButton_realTime_click.bind(this));

		this._runButton_realTime_x2 = new Button("textButton", "runButton_realTime");
		this._runButton_realTime_x2.suspendRefresh();
		this._runButton_realTime_x2.text = "RTx2";
		this._runButton_realTime_x2.render(elements.buttonsHost);
		this._runButton_realTime_x2.resumeRefresh();
		this._runButton_realTime_x2.refresh();
		this._runButton_realTime_x2.click.add(this._runButton_realTime_x2_click.bind(this));

		this._runButton_realTime_x4 = new Button("textButton", "runButton_realTime");
		this._runButton_realTime_x4.suspendRefresh();
		this._runButton_realTime_x4.text = "RTx4";
		this._runButton_realTime_x4.render(elements.buttonsHost);
		this._runButton_realTime_x4.resumeRefresh();
		this._runButton_realTime_x4.refresh();
		this._runButton_realTime_x4.click.add(this._runButton_realTime_x4_click.bind(this));

		this._runButton_afaic = new Button("textButton", "runButton_afaic");
		this._runButton_afaic.suspendRefresh();
		this._runButton_afaic.text = "AFAIC";
		this._runButton_afaic.render(elements.buttonsHost);
		this._runButton_afaic.resumeRefresh();
		this._runButton_afaic.refresh();
		this._runButton_afaic.click.add(this._runButton_afaic_click.bind(this));

		this._stopButton = new Button("textButton", "stopButton");
		this._stopButton.suspendRefresh();
		this._stopButton.enabled = false;
		this._stopButton.text = "Stop";
		this._stopButton.render(elements.buttonsHost);
		this._stopButton.resumeRefresh();
		this._stopButton.refresh();
		this._stopButton.click.add(this._stopButton_click.bind(this));


		this._simulateButton_visibleRange = new Button("textButton", "simulateButton_visibleRange");
		this._simulateButton_visibleRange.suspendRefresh();
		this._simulateButton_visibleRange.text = "SimR";
		this._simulateButton_visibleRange.render(elements.buttonsHostRow2);
		this._simulateButton_visibleRange.resumeRefresh();
		this._simulateButton_visibleRange.refresh();
		this._simulateButton_visibleRange.click.add(this._simulateButton_visibleRange_click.bind(this));

		this._simulateButton_geneticSimulator = new Button("textButton", "simulateButton_geneticSimulator");
		this._simulateButton_geneticSimulator.suspendRefresh();
		this._simulateButton_geneticSimulator.text = "SimG";
		this._simulateButton_geneticSimulator.render(elements.buttonsHostRow2);
		this._simulateButton_geneticSimulator.resumeRefresh();
		this._simulateButton_geneticSimulator.refresh();
		this._simulateButton_geneticSimulator.click.add(this._simulateButton_geneticSimulator_click.bind(this));

		this._simulateButton_longerDuration = new Button("textButton", "simulateButton_longerDuration");
		this._simulateButton_longerDuration.suspendRefresh();
		this._simulateButton_longerDuration.text = "SimL";
		this._simulateButton_longerDuration.render(elements.buttonsHostRow2);
		this._simulateButton_longerDuration.resumeRefresh();
		this._simulateButton_longerDuration.refresh();
		this._simulateButton_longerDuration.click.add(this._simulateButton_longerDuration_click.bind(this));

		this._clearButton = new Button("textButton", "clearButton");
		this._clearButton.suspendRefresh();
		this._clearButton.text = "Clear";
		this._clearButton.render(elements.buttonsHostRow2);
		this._clearButton.resumeRefresh();
		this._clearButton.refresh();
		this._clearButton.click.add(this._clearButton_click.bind(this));

		//////////////////////////////////////////////////////////////////////////////////
		this._forexAccountUserControl = new ForexAccountUserControl("forexAccountUserControl1", this._forexAccount);
		this._forexAccountUserControl.selectedPositionChange.add(this._forexAccountUserControl_selectedPositionChange.bind(this));
		this._forexAccountUserControl.suspendRefresh();
		this._forexAccountUserControl.render(elements.forexAccountHost);
		this._forexAccountUserControl.resumeRefresh();
		this._forexAccountUserControl.refresh();

		this._resetForexClient();
	}

	_render_chart(hostElement)
	{
		this._chartVisual = new ChartVisual("simulationChartVisual", EChartDeviceType.Canvas);
		this._chartVisual.suspendRefresh();

		this._timelineAxis = this._chartVisual.scene.axes.add(new ChartDateTimeAxis("simulationChartTimeline", new ChartDataRange("timeline")));
		this._timelineAxis.position = EChartAxisPosition.Bottom;
		this._timelineAxis.rangeLabelStyle.visible = false;
		this._timelineAxis.rangeStartLabelStyle.visible = false;
		this._timelineAxis.rangeEndLabelStyle.visible = false;

		this._timeAxis = this._chartVisual.scene.axes.add(new ChartDateTimeAxis("simulationChartTime", new ChartDataRange("timeAxis")));
		this._timeAxis.position = EChartAxisPosition.Bottom;
		this._timeAxis.paddingLower = 20;
		this._timeAxis.paddingUpper = 40;

		this._valueAxis = this._chartVisual.scene.axes.add(new ChartNumericAxis("simulationChartValue", new ChartDataRange("valueAxis")));
		this._valueAxis.position = EChartAxisPosition.Right;
		this._valueAxis.rangeLabelStyle.visible = false;
		this._valueAxis.rangeStartLabelStyle.visible = false;
		this._valueAxis.rangeEndLabelStyle.visible = false;
		this._valueAxis.spread = 60;

		this._chartVisual.scene.backplane.xAxis = this._timeAxis;
		this._chartVisual.scene.backplane.yAxis = this._valueAxis;

		this._forexAreaSeries = new ChartAreaSeries("areaSeries2", 5010, this._timeAxis, this._valueAxis, "dt", "bid", "ask", this._forexDataSource);
		this._forexAreaSeries.lineStyle_low.width = 0.5;
		this._forexAreaSeries.lineStyle_low.strokeStyle = "dotted";
		this._forexAreaSeries.lineStyle_high.width = 0.5;
		this._forexAreaSeries.lineStyle_high.strokeStyle = "dotted";
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

		this._forexHlAreaSeries = new ChartAreaSeries("areaSeries3", 5005, this._timeAxis, this._valueAxis, "dt", "ask", "bid", this._forexDataSource, { ask: m => m.raw ? m.raw.al : m.ask, bid: m => m.raw ? m.raw.bh : m.bid });
		this._forexHlAreaSeries.areaBackgroundColor = "green";
		this._forexHlAreaSeries.lineStyle_low.color = "green";	//	ask low
		//this._forexHlAreaSeries.lineStyle_low.width = 0.5;
		//this._forexHlAreaSeries.lineStyle_low.strokeStyle = "dotted";
		this._forexHlAreaSeries.lineStyle_high.color = "red";	//	bid high
		//this._forexHlAreaSeries.lineStyle_high.width = 0.5;
		//this._forexHlAreaSeries.lineStyle_high.strokeStyle = "dotted";
		this._forexHlAreaSeries.gapTester = this._forexAreaSeries.gapTester;
		this._chartVisual.scene.series.add(this._forexHlAreaSeries);

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		this._chartVisual.resumeRefresh();
		this._chartVisual.render(hostElement);

		//	simulation indicators
		this._simulationStartIndicatorX = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("simulationStartIndicatorX", 90, this._timeAxis, this._valueAxis, true));
		this._simulationStartIndicatorX.lineStyle.color = "lime";
		this._simulationStartIndicatorX.lineStyle.width = 1;
		this._simulationStartIndicatorX.lineStyle.strokeStyle = "solid";

		this._progressIndicatorX = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("progressIndicatorX", 90, this._timeAxis, this._valueAxis, false));
		this._progressIndicatorX.lineStyle.color = "blue";
		this._progressIndicatorX.lineStyle.width = 1;
		this._progressIndicatorX.lineStyle.strokeStyle = "solid";

		this._progressLabelIndicator = this._chartVisual.overlay.indicators.add(new ChartAxisLabelIndicator("progressLabelIndicator", this._timeAxis, false));
		this._progressLabelIndicator.labelStyle.formatter = function (formattingContext, value)
		{
			return ChartStyleSheet.formatDateTimeAxisLabel(value, EDateTimeUnit.Second);
		},

		//	trading indicators
		this._selectedPositionEntryPriceIndicatorY = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("selectedPositionEntryPriceIndicatorY", 0, this._timeAxis, this._valueAxis, false));
		this._selectedPositionEntryPriceIndicatorY.lineStyle.color = "green";
		this._selectedPositionEntryPriceIndicatorY.lineStyle.width = 1;
		this._selectedPositionEntryPriceIndicatorY.lineStyle.strokeStyle = "dashed";

		this._selectedPositionEvenPriceIndicatorY = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("selectedPositionEvenPriceIndicatorY", 0, this._timeAxis, this._valueAxis, false));
		this._selectedPositionEvenPriceIndicatorY.lineStyle.color = "red";
		this._selectedPositionEvenPriceIndicatorY.lineStyle.width = 1;
		this._selectedPositionEvenPriceIndicatorY.lineStyle.strokeStyle = "solid";

		this._chartVisual.suspendRefresh();

		//	horizontal range selector behaviors
		this._horizontalRangeSelectBehavior = new ChartHorizontalRangeSelectBehavior(this._chartVisual, this._timeAxis);
		this._horizontalRangeSelectBehavior.enabled = true;
		this._horizontalRangeSelectBehavior.cudCommand.add(this._horizontalRangeSelectBehavior_cudCommand.bind(this));

		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		this._chartVisual.resumeRefresh();
		this._chartVisual.refresh();

		this._chartIndicatorsController = new ChartIndicatorsController(this._chartVisual, this._timeAxis, this._valueAxis, this._forexAreaSeries);
		this._chartIndicatorsController.behavior.indicatorUpdate.add(this._chartIndicatorsController_behavior_indicatorUpdate.bind(this));
		this._chartIndicatorsController.enabled = true;

		this._chartHorizontalPanZoomController = new ChartHorizontalPanZoomController(this._chartVisual, this._timeAxis, this._valueAxis, this._timelineAxis);
		this._chartHorizontalPanZoomController.changing.add(this._chartHorizontalPanZoomController_changing.bind(this));
		this._chartHorizontalPanZoomController.enabled = true;

		//	step by step simulation behavior
		this._discreteSimulationKeyboardBehavior = new Behavior(this._chartVisual.backplane);
		this._discreteSimulationKeyboardBehavior.enableEventRole(EBrowserEventType.KeyDown, "chart");
		this._discreteSimulationKeyboardBehavior.__onKeyDown = this._discreteSimulationKeyboardBehavior__onKeyDown.bind(this);	//	inline override of __onKeyDown
		this._discreteSimulationKeyboardBehavior.enabled = true;

		//	dispatcher
		this._channelChainSahpe_deferrer = new Deferrer({ timeout: 150, signalled: this._shapeChannelsV5Button_click.bind(this) });

		this._horizontalRangeSelectBehavior_deferrer = new Deferrer({ timeout: 150, signalled: this._horizontalRangeSelectBehavior_dataRangeAvailable.bind(this) });
		this._horizontalRangeSelectBehavior.dataRangeAvailable.add(function (sender, args) { this._horizontalRangeSelectBehavior_deferrer.signal({ sender: sender, args: args }); }.bind(this));

		this._timeAxis.change.add(this._timeAxis_change.bind(this));
	}

	_render_indicatorChart(hostElement)
	{
		this._indicatorChartVisual = new ChartVisual("indicatorChartVisual", EChartDeviceType.Canvas);
		this._indicatorChartVisual.suspendRefresh();

		this._indicatorTimeAxis = this._indicatorChartVisual.scene.axes.add(new ChartDateTimeAxis("indicatorChartTime", new ChartDataRange("indicatorTimeAxis")));
		this._indicatorTimeAxis.rangeLabelStyle.visible = false;
		this._indicatorTimeAxis.rangeStartLabelStyle.visible = false;
		this._indicatorTimeAxis.rangeEndLabelStyle.visible = false;
		this._indicatorTimeAxis.spread = 30;
		this._indicatorTimeAxis.position = EChartAxisPosition.Bottom;
		this._indicatorTimeAxis.paddingLower = 20;
		this._indicatorTimeAxis.paddingUpper = 40;

		this._indicatorValueAxis = this._indicatorChartVisual.scene.axes.add(new ChartNumericAxis("indicatorChartValue", new ChartDataRange("indicatorValueAxis")));
		this._indicatorValueAxis.position = EChartAxisPosition.Right;
		this._indicatorValueAxis.rangeLabelStyle.visible = false;
		this._indicatorValueAxis.rangeStartLabelStyle.visible = false;
		this._indicatorValueAxis.rangeEndLabelStyle.visible = false;
		this._indicatorValueAxis.paddingLower = 5;
		this._indicatorValueAxis.paddingUpper = 5;
		this._indicatorValueAxis.spread = 60;

		this._indicatorChartVisual.scene.backplane.xAxis = this._indicatorTimeAxis;
		this._indicatorChartVisual.scene.backplane.yAxis = this._indicatorValueAxis;

		this._indicatorMouseIndicatorX = this._indicatorChartVisual.overlay.indicators.add(new ChartLineIndicator("indicatorChart_mouseLineIndicatorX", 90, this._indicatorTimeAxis, this._indicatorValueAxis, false));

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._indicatorChartVisual.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._indicatorChartVisual.overlay);
		this._indicatorChartVisual.resumeRefresh();
		this._indicatorChartVisual.render(hostElement);

		this._indicatorChartVisual.refresh();
	}

	_render_indicator2Chart(hostElement)
	{
		this._indicator2ChartVisual = new ChartVisual("indicator2ChartVisual", EChartDeviceType.Canvas);
		this._indicator2ChartVisual.suspendRefresh();

		this._indicator2TimeAxis = this._indicator2ChartVisual.scene.axes.add(new ChartDateTimeAxis("indicatorChartTime", new ChartDataRange("indicatorTimeAxis")));
		this._indicator2TimeAxis.rangeLabelStyle.visible = false;
		this._indicator2TimeAxis.rangeStartLabelStyle.visible = false;
		this._indicator2TimeAxis.rangeEndLabelStyle.visible = false;
		this._indicator2TimeAxis.spread = 30;
		this._indicator2TimeAxis.position = EChartAxisPosition.Bottom;
		this._indicator2TimeAxis.paddingLower = 20;
		this._indicator2TimeAxis.paddingUpper = 40;

		this._indicator2ValueAxis = this._indicator2ChartVisual.scene.axes.add(new ChartNumericAxis("indicatorChartValue", new ChartDataRange("indicatorValueAxis")));
		this._indicator2ValueAxis.position = EChartAxisPosition.Right;
		this._indicator2ValueAxis.rangeLabelStyle.visible = false;
		this._indicator2ValueAxis.rangeStartLabelStyle.visible = false;
		this._indicator2ValueAxis.rangeEndLabelStyle.visible = false;
		this._indicator2ValueAxis.paddingLower = 5;
		this._indicator2ValueAxis.paddingUpper = 5;
		this._indicator2ValueAxis.spread = 60;

		this._indicator2ChartVisual.scene.backplane.xAxis = this._indicator2TimeAxis;
		this._indicator2ChartVisual.scene.backplane.yAxis = this._indicator2ValueAxis;

		this._indicator2MouseIndicatorX = this._indicator2ChartVisual.overlay.indicators.add(new ChartLineIndicator("indicatorChart_mouseLineIndicatorX", 90, this._indicator2TimeAxis, this._indicator2ValueAxis, false));

		this._indicator2DataSource = new ChartDataSource_Buffer("indicatorDataSource");
		this._indicator2LineSeries = new ChartLineSeries("indicatorLineSeries" + newLUID(), 5010, this._indicator2TimeAxis, this._indicator2ValueAxis, "x", "v", this._indicator2DataSource);
		this._indicator2LineSeries.gapTester = function (left, right)
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
		this._indicator2ChartVisual.scene.series.add(this._indicator2LineSeries);

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._indicator2ChartVisual.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._indicator2ChartVisual.overlay);
		this._indicator2ChartVisual.resumeRefresh();
		this._indicator2ChartVisual.render(hostElement);

		this._indicator2ChartVisual.refresh();
	}


	_render_q2tableChart(hostElement)
	{
		this._secondaryChartVisual = new ChartVisual("simulationChartVisual_qtTable", EChartDeviceType.Canvas, 530, 530);
		this._secondaryChartVisual.suspendRefresh();

		this._q2tablexAxis = null;
		this._q2tableyAxis = null;

		this._q2tablexAxis = this._secondaryChartVisual.scene.axes.add(new ChartNumericAxis("x", new ChartDataRange("q2tablexAxis")));
		this._q2tablexAxis.position = EChartAxisPosition.Bottom;
		this._q2tablexAxis.rangeLabelStyle.visible = false;
		this._q2tablexAxis.rangeStartLabelStyle.visible = false;
		this._q2tablexAxis.rangeEndLabelStyle.visible = false;
		this._q2tablexAxis.majorTickRange = 80;
		this._q2tablexAxis.minorTickRange = 20;
		this._q2tablexAxis.paddingLower = 50;
		this._q2tablexAxis.paddingUpper = 50;
		this._q2tablexAxis.spread = 45;
		this._q2tablexAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._q2tablexAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._q2tableyAxis = this._secondaryChartVisual.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("q2tablexAxis")));
		this._q2tableyAxis.position = EChartAxisPosition.Right;
		this._q2tableyAxis.rangeLabelStyle.visible = false;
		this._q2tableyAxis.rangeStartLabelStyle.visible = false;
		this._q2tableyAxis.rangeEndLabelStyle.visible = false;
		this._q2tableyAxis.majorTickRange = 80;
		this._q2tableyAxis.minorTickRange = 20;
		this._q2tableyAxis.paddingLower = 0;
		this._q2tableyAxis.paddingUpper = 0;
		this._q2tableyAxis.spread = 45;
		this._q2tableyAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._q2tableyAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._q2tableChartDataSource = new ChartDataSource_Buffer("q2tableChartDataSource");
		this._q2tableLineSeries = this._secondaryChartVisual.scene.series.add(new ChartLineSeries("q2tableLineSeries", 5010, this._q2tablexAxis, this._q2tableyAxis, "x", "y", this._q2tableChartDataSource));

		this._secondaryChartVisual.scene.backplane.xAxis = this._q2tablexAxis;
		this._secondaryChartVisual.scene.backplane.yAxis = this._q2tableyAxis;

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._secondaryChartVisual.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._secondaryChartVisual.overlay);
		this._secondaryChartVisual.resumeRefresh();
		this._secondaryChartVisual.render(hostElement);
		this._secondaryChartVisual.refresh();
	}

	_render_sdChart(hostElement)
	{
		this._sdChart = new ChartVisual("sdChartVisual_qtTable", EChartDeviceType.Canvas, 530, 530);
		this._sdChart.suspendRefresh();

		this._sdxAxis = null;
		this._sdyAxis = null;

		this._unsdxAxis = null;
		this._unsdyAxis = null;

		this._unsdxAxis = this._sdChart.scene.axes.add(new ChartDateTimeAxis("unsdxAxis", new ChartDataRange("unsdxAxis")));
		this._unsdxAxis.position = EChartAxisPosition.Bottom;
		this._unsdxAxis.paddingLower = 40;
		this._unsdxAxis.paddingUpper = 50;

		this._sdxAxis = this._sdChart.scene.axes.add(new ChartNumericAxis("x", new ChartDataRange("sdxAxis")));
		this._sdxAxis.position = EChartAxisPosition.Bottom;
		this._sdxAxis.rangeLabelStyle.visible = false;
		this._sdxAxis.rangeStartLabelStyle.visible = false;
		this._sdxAxis.rangeEndLabelStyle.visible = false;
		this._sdxAxis.majorTickRange = 160;
		this._sdxAxis.minorTickRange = 80;
		this._sdxAxis.paddingLower = 40;
		this._sdxAxis.paddingUpper = 20;
		this._sdxAxis.spread = 45;
		this._sdxAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._sdxAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._sdyAxis = this._sdChart.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("sdyAxis")));
		this._sdyAxis.position = EChartAxisPosition.Right;
		this._sdyAxis.rangeLabelStyle.visible = false;
		this._sdyAxis.rangeStartLabelStyle.visible = false;
		this._sdyAxis.rangeEndLabelStyle.visible = false;
		this._sdyAxis.majorTickRange = 80;
		this._sdyAxis.minorTickRange = 20;
		this._sdyAxis.paddingLower = 10;
		this._sdyAxis.paddingUpper = 10;
		this._sdyAxis.spread = 45;
		this._sdyAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._sdyAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._unsdyAxis = this._sdChart.scene.axes.add(new ChartNumericAxis("unsdyAxis", new ChartDataRange("unsdyAxis")));
		this._unsdyAxis.position = EChartAxisPosition.Right;
		this._unsdyAxis.rangeLabelStyle.visible = false;
		this._unsdyAxis.rangeStartLabelStyle.visible = false;
		this._unsdyAxis.rangeEndLabelStyle.visible = false;
		this._unsdyAxis.paddingLower = 10;
		this._unsdyAxis.paddingUpper = 10;
		this._unsdyAxis.spread = 60;

		this._sdChartDataSource = new ChartDataSource_Buffer("sdChartDataSource");
		this._sdLineSeries = this._sdChart.scene.series.add(new ChartLineSeries("sdLineSeries", 5010, this._sdxAxis, this._sdyAxis, "x", "y", this._sdChartDataSource));
		this._sdLineSeries.lineStyle.color = "green";
		this._unsdChartDataSource = new ChartDataSource_Buffer("unsdChartDataSource");
		this._unsdLineSeries = this._sdChart.scene.series.add(new ChartLineSeries("unsdLineSeries", 5010, this._unsdxAxis, this._unsdyAxis, "x", "y", this._unsdChartDataSource));
		this._unsdLineSeries.lineStyle.strokeStyle = "dotted";

		this._sdChart.scene.backplane.xAxis = this._sdxAxis;
		this._sdChart.scene.backplane.yAxis = this._sdyAxis;

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._sdChart.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._sdChart.overlay);
		this._sdChart.resumeRefresh();
		this._sdChart.render(hostElement);
		this._sdChart.refresh();
	}

	_render_fftChart(hostElement)
	{
		this._fftChart = new ChartVisual("fftChartVisual", EChartDeviceType.Canvas, 530, 530);
		this._fftChart.suspendRefresh();

		this._fftxAxis = null;
		this._fftyAxis = null;

		this._fftxAxis = this._fftChart.scene.axes.add(new ChartNumericAxis("x", new ChartDataRange("fftxAxis")));
		this._fftxAxis.position = EChartAxisPosition.Bottom;
		this._fftxAxis.rangeLabelStyle.visible = false;
		this._fftxAxis.rangeStartLabelStyle.visible = false;
		this._fftxAxis.rangeEndLabelStyle.visible = false;
		this._fftxAxis.majorTickRange = 80;
		this._fftxAxis.minorTickRange = 20;
		this._fftxAxis.paddingLower = 20;
		this._fftxAxis.paddingUpper = 20;
		this._fftxAxis.spread = 45;
		this._fftxAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._fftxAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._fftyAxis = this._fftChart.scene.axes.add(new ChartNumericAxis("y", new ChartDataRange("fftyAxis")));
		this._fftyAxis.position = EChartAxisPosition.Right;
		this._fftyAxis.rangeLabelStyle.visible = false;
		this._fftyAxis.rangeStartLabelStyle.visible = false;
		this._fftyAxis.rangeEndLabelStyle.visible = false;
		this._fftyAxis.majorTickRange = 40;
		this._fftyAxis.minorTickRange = 20;
		this._fftyAxis.paddingLower = 10;
		this._fftyAxis.paddingUpper = 10;
		this._fftyAxis.spread = 70;
		this._fftyAxis.majorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 1); };
		this._fftyAxis.minorTickLabelStyle.formatter = function (formattingContext, unit, value) { return Utility.Format.formatNumber(value, 2); };

		this._fftChartDataSource = new ChartDataSource_Buffer("fftChartDataSource");
		this._fftLineSeries = this._fftChart.scene.series.add(new ChartLineSeries("fftLineSeries", 5010, this._fftxAxis, this._fftyAxis, "x", "y", this._fftChartDataSource));
		this._fftLineSeries.lineStyle.color = "black";

		this._fftChart.scene.backplane.xAxis = this._fftxAxis;
		this._fftChart.scene.backplane.yAxis = this._fftyAxis;

		ChartStyleSheet.defaultSceneStyle.applyToScene(this._fftChart.scene);
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._fftChart.overlay);
		this._fftChart.resumeRefresh();
		this._fftChart.render(hostElement);
		this._fftChart.refresh();
	}

	_render_channelAdjustElements(hostElement)
	{
		var elements = XhtmlTemplate.apply("SimulationChartUserControl::channelAdjustLayout", hostElement, null, TemplateEngine.Append);

		var apply = async function ()
		{
			this._channelChainV5 = null;
			this._reset_forexRobotV5_ChannelChain();
			this._forexRobotV5_ChannelChain.initialize(this._sampleIntervalDef);
			await this._channelChainSahpe_deferrer.signal();

		}.bind(this);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_priceSourcing,
			function () { return this._channelShaperConfig.priceSourcing }.bind(this),
			async function (value) { this._channelShaperConfig.priceSourcing = value; await apply() }.bind(this)
		);


		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_supportAndResistance_minChannelSpread,
			function () { return this._channelShaperConfig.supportAndResistance_minChannelSpread }.bind(this),
			async function (value) { this._channelShaperConfig.supportAndResistance_minChannelSpread = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_supportAndResistance_derangeThresholdFactor,
			function () { return this._channelShaperConfig.supportAndResistance_derangeThresholdFactor }.bind(this),
			async function (value) { this._channelShaperConfig.supportAndResistance_derangeThresholdFactor = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderSNR_ZigZag_SNR_ZigZag_trade_thresholdFactord,
			function () { return this._channelShaperConfig.traderSNR_ZigZag.SNR_ZigZag_trade_thresholdFactord }.bind(this),
			async function (value) { this._channelShaperConfig.traderSNR_ZigZag.SNR_ZigZag_trade_thresholdFactord = value; await apply() }.bind(this)
		);


		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_lineOfBestFit_variability_windowSize,
			function () { return this._channelShaperConfig.lineOfBestFit_variability_windowSize }.bind(this),
			async function (value) { this._channelShaperConfig.lineOfBestFit_variability_windowSize = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_lineOfBestFit_spi1_variability_lowerThreshold,
			function () { return this._channelShaperConfig.lineOfBestFit_spi1_variability_lowerThreshold }.bind(this),
			async function (value) { this._channelShaperConfig.lineOfBestFit_spi1_variability_lowerThreshold = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_lineOfBestFit_spi1_standardDeviation_thresholdFactor,
			function () { return this._channelShaperConfig.lineOfBestFit_spi1_standardDeviation_thresholdFactor }.bind(this),
			async function (value) { this._channelShaperConfig.lineOfBestFit_spi1_standardDeviation_thresholdFactor = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_lineOfBestFit_deadZone_inertiaPointCount,
			function () { return this._channelShaperConfig.lineOfBestFit_deadZone_inertiaPointCount }.bind(this),
			async function (value) { this._channelShaperConfig.lineOfBestFit_deadZone_inertiaPointCount = value; await apply() }.bind(this)
		);


		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderLBF_LBF_tradeOpen_spreadThreshold,
			function () { return this._channelShaperConfig.traderLBF.LBF_tradeOpen_spreadThreshold }.bind(this),
			async function (value) { this._channelShaperConfig.traderLBF.LBF_tradeOpen_spreadThreshold = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderLBF_LBF_tradeOpen_ldNValue,
			function () { return this._channelShaperConfig.traderLBF.LBF_tradeOpen_ldNValue }.bind(this),
			async function (value) { this._channelShaperConfig.traderLBF.LBF_tradeOpen_ldNValue = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderLBF_LBF_tradeOpen_sdAngleThreshold,
			function () { return this._channelShaperConfig.traderLBF.LBF_tradeOpen_sdAngleThreshold }.bind(this),
			async function (value) { this._channelShaperConfig.traderLBF.LBF_tradeOpen_sdAngleThreshold = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderLBF_LBF_tradeOpen_sdyThresholdFactor,
			function () { return this._channelShaperConfig.traderLBF.LBF_tradeOpen_sdyThresholdFactor }.bind(this),
			async function (value) { this._channelShaperConfig.traderLBF.LBF_tradeOpen_sdyThresholdFactor = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderLBF_LBF_tradeClose_sdyThresholdFactor,
			function () { return this._channelShaperConfig.traderLBF.LBF_tradeClose_sdyThresholdFactor }.bind(this),
			async function (value) { this._channelShaperConfig.traderLBF.LBF_tradeClose_sdyThresholdFactor = value; await apply() }.bind(this)
		);

		this._forexRobotV5_ChannelChain_Factory.createControl(elements,
			ForexRobotV5_ChannelChain_Factory.Schema.channelShaper_traderLBF_LBF_tradeClose_sdTargetProfit,
			function () { return this._channelShaperConfig.traderLBF.LBF_tradeClose_sdTargetProfit }.bind(this),
			async function (value) { this._channelShaperConfig.traderLBF.LBF_tradeClose_sdTargetProfit = value; await apply() }.bind(this)
		);


		this._shapeChannelsV5Button = new Button("textButton", "shapeChannelsV5Button");
		this._shapeChannelsV5Button.suspendRefresh();
		this._shapeChannelsV5Button.text = "Shape";
		this._shapeChannelsV5Button.render(elements.buttonsHost);
		this._shapeChannelsV5Button.resumeRefresh();
		this._shapeChannelsV5Button.refresh();
		this._shapeChannelsV5Button.click.add(this._shapeChannelsV5Button_click.bind(this));
	}

	_render_statCalcElements(hostElement)
	{
		console.log(911, "_render_statCalcElements", "NOTHING TO RENDER");
	}


	__refresh()
	{
		this._chartVisual.refresh();
		this._chartVisual.debug_infoAvailable.add(this._updateInfoLabel.bind(this));
		this._updateInfoLabel();
	}


	_resetForexClient()
	{
		this._forexBrokerClient = new ForexBrokerClient_Simulated(
		{
			timePassage: EForexTimePassage.RealTime,
			instrumentId: this._instrumentId,
		});
		this._forexBrokerClient.tick.add(this._forexBrokerClient_tick.bind(this));
		this._forexBrokerClient.idle.add(this._forexBrokerClient_idle.bind(this));
		this._forexBrokerClient.finish.add(this._forexBrokerClient_finish.bind(this));
		this._forexBrokerClient.accounts.add(this._forexAccount);
	}

	async _updateDataChannel(range)
	{
		if (this._forexDataSource_updateSync.isBlocking) return;
		await this._forexDataSource_updateSync.execute(async function _updateDataChannel_sync()
		{
			this._chartVisual.suspendRefresh();
			try
			{
				this._sampleIntervalDef = await app.db.selectSampleInterval(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max, this._timeAxis.scaleInfoCache.sceneLengthDeflated, this._tickDataThreshold);
				this._forexDataSource.sampleIntervalDef = this._sampleIntervalDef;
				this._forexDataSource.authorativeRange = range.inflate(0.1, 0.1);
				await this._forexDataSource.refreshData();
				this._valueAxis.dataRange.setBounds(this._forexDataSource.adaptiveRange.min, this._forexDataSource.adaptiveRange.max);
				if (this._detailTabControl.selectedTabPageKey == "channelAdjustView") await this._shapeChannelsV5(this._simulationStartIndicatorX.modelX, this._timeAxis.dataRange.max);
				//if (this._detailTabControl.selectedTabPageKey == "channelAdjustView") this._drawChannelsV5();
			}
			finally
			{
				this._chartVisual.resumeRefresh();
			}
			this._chartVisual.refresh();
			this._updateInfoLabel();
		}.bind(this));

		if (!this._afterFirst)
		{
			this._afterFirst = true;
			return;
		}

		if (!this._updateIndicators_deferrer) this._updateIndicators_deferrer = new Deferrer({timeout: 500, signalled: async function ()
		{
			//this._chartVisual.scene.markers.clear();
			//this._indicatorChartVisual.scene.markers.clear();
			//await this._updateV6Indicators();
			//await this._updateV6HlIndicator();
			//await this._updateV6PredictorIndicator2();
			//await this._updateV6VariabilityIndicator();
		}.bind(this)});
		this._updateIndicators_deferrer.signal();
	}

	async _updateV6Indicators()
	{
		if (!this._indicatorDataSource)
		{
			this._indicatorDataSource = new ChartDataSource_Buffer("indicatorDataSource");
			this._indicatorDataLineSeries = new ChartLineSeries("indicatorDataLineSeries", 5010, this._indicatorTimeAxis, this._indicatorValueAxis, "x", "v", this._indicatorDataSource);
			this._indicatorDataLineSeries.gapTester = this._forexAreaSeries.gapTester;
			this._indicatorChartVisual.scene.series.add(this._indicatorDataLineSeries);

			ChartStyleSheet.defaultSceneStyle.applyToScene(this._indicatorChartVisual.scene);
			ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._indicatorChartVisual.overlay);
		}

		if (!this._dataSource1)
		{
			this._dataSource1 = new ChartDataSource_Buffer("dataSource1");
			this._lineSeries1 = new ChartLineSeries("lineSeries1", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource1);
			this._lineSeries1.lineStyle.color = "white";
			this._lineSeries1.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries1);


			this._dataSource2 = new ChartDataSource_Buffer("dataSource2");
			this._lineSeries2 = new ChartLineSeries("lineSeries2", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource2);
			this._lineSeries2.lineStyle.color = "white";
			this._lineSeries2.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries2);

			this._dataSource2a = new ChartDataSource_Buffer("dataSource2a");
			this._lineSeries2a = new ChartLineSeries("lineSeries2a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource2a);
			this._lineSeries2a.lineStyle.color = "pink";
			this._lineSeries2a.lineStyle.strokeStyle = "dashed";
			this._lineSeries2a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries2a);


			this._dataSource3 = new ChartDataSource_Buffer("dataSource3");
			this._lineSeries3 = new ChartLineSeries("lineSeries3", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource3);
			this._lineSeries3.lineStyle.color = "white";
			this._lineSeries3.lineStyle.strokeStyle = "dashed";
			this._lineSeries3.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries3);

			this._dataSource3a = new ChartDataSource_Buffer("dataSource3a");
			this._lineSeries3a = new ChartLineSeries("lineSeries3a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource3a);
			this._lineSeries3a.lineStyle.color = "red";
			this._lineSeries3a.lineStyle.strokeStyle = "solid";
			this._lineSeries3a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries3a);


			this._dataSource4 = new ChartDataSource_Buffer("dataSource4");
			this._lineSeries4 = new ChartLineSeries("lineSeries4", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource4);
			this._lineSeries4.lineStyle.color = "white";
			this._lineSeries4.lineStyle.strokeStyle = "dashed";
			this._lineSeries4.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries4);

			this._dataSource4a = new ChartDataSource_Buffer("dataSource4a");
			this._lineSeries4a = new ChartLineSeries("lineSeries4a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource4a);
			this._lineSeries4a.lineStyle.color = "green";
			this._lineSeries4a.lineStyle.strokeStyle = "solid";
			this._lineSeries4a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries4a);

			ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual.scene);
			ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		}

		this._indicatorDataSource.clear();
		this._dataSource1.clear();
		this._dataSource2.clear();
		this._dataSource2a.clear();
		this._dataSource3.clear();
		this._dataSource3a.clear();
		this._dataSource4.clear();
		this._dataSource4a.clear();

		var windowDpCount = 100;
		var z = 1;
		var a = 1000;
		var mean = (l, r) =>
		{
			return (z * l + a * r) / (z + a);
		};
		var simCurrentDp = this._forexDataSource.rawData[Math.ceil(2 * this._forexDataSource.rawData.length / 3)];
		if (!simCurrentDp) return;
		var simCurrentDt = simCurrentDp.dt;

		var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = simCurrentDt;
		lineMarker.modelY0 = -10;
		lineMarker.modelX1 = lineMarker.modelX0;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "blue";
		lineMarker.lineStyle.strokeStyle = "dashed";
		lineMarker.lineStyle.width = 0.5;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		var predictionStartDt;
		var pois_crossings = [];
		var pois_extremums = [];
		var buffer = [];
		for (var length = this._forexDataSource.rawData.length, c = this._forexDataSource.rawData[0].dt, i = 0; i < length && c <= simCurrentDt; ++i)
		{
			var dp = this._forexDataSource.rawData[i];
			c = dp.dt;
			buffer.push(dp);
			if (buffer.length > windowDpCount)
			{
				buffer.shift();
				var sample = new MappedArray(buffer, { x: (m) => m.dt, ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
				//	TODO: consider using also yb for this._dataSource3 (the resistance line) for fine tuning
				var lobfa = sample.lineOfBestFit("x", "ya");
				//this._dataSource1.add({ x: c, y: lobf.calc(c) });
				var midDt = (buffer[0].dt + buffer[buffer.length - 1].dt) / 2;
				predictionStartDt = midDt;
				this._dataSource2.add({ x: midDt, y: lobfa.calc(midDt) });
				this._dataSource3.add({ x: midDt, y: lobfa.calc(midDt) + sample.standardDeviation("ya") });
				this._dataSource4.add({ x: midDt, y: lobfa.calc(midDt) - sample.standardDeviation("ya") });

				if (this._dataSource2.rawData.length >= 2)
				{
					var buffera = buffer.slice();
					var buffera2 = this._dataSource2.rawData.slice();
					var buffera3 = this._dataSource3.rawData.slice();
					var buffera4 = this._dataSource4.rawData.slice();
					for (; buffera.length >= 3;)
					{
						buffera.shift();
						var sample = new MappedArray(buffera, { x: (m) => m.dt, ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
						var lobfa = sample.lineOfBestFit("x", "ya");

						var midDt = (buffera[0].dt + buffera[buffera.length - 1].dt) / 2;

						var y2 = lobfa.calc(midDt);
						var movement1 = y2 - buffera2[buffera2.length - 1].y;
						var movement0 = buffera2[buffera2.length - 1].y - buffera2[buffera2.length - 2].y;
						buffera2.push({ x: midDt, y: buffera2[buffera2.length - 1].y + mean(movement1,  movement0) });

						var y3 = lobfa.calc(midDt) + sample.standardDeviation("ya");
						var movement1 = y3 - buffera3[buffera3.length - 1].y;
						var movement0 = buffera3[buffera3.length - 1].y - buffera3[buffera3.length - 2].y;
						buffera3.push({ x: midDt, y: buffera3[buffera3.length - 1].y + mean(movement1, movement0) });

						var y4 = lobfa.calc(midDt) - sample.standardDeviation("ya");
						var movement1 = y4 - buffera4[buffera4.length - 1].y;
						var movement0 = buffera4[buffera4.length - 1].y - buffera4[buffera4.length - 2].y;
						buffera4.push({ x: midDt, y: buffera4[buffera4.length - 1].y + mean(movement1, movement0) });
					}
					this._dataSource2a.add(buffera2[buffera2.length - 1]);
					this._dataSource3a.add(buffera3[buffera3.length - 1]);
					this._dataSource4a.add(buffera4[buffera4.length - 1]);

					this._indicatorDataSource.add({ x: midDt, v: buffera3[buffera3.length - 1].y - buffera4[buffera4.length - 1].y});
				}
			}
		}

		for (; buffer.length >= 3;)
		{
			buffer.shift();
			var sample = new MappedArray(buffer, { x: (m) => m.dt, ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
			var lobfa = sample.lineOfBestFit("x", "ya");

			var midDt = (buffer[0].dt + buffer[buffer.length - 1].dt) / 2;

			var data = this._dataSource2.rawData;
			var y2 = lobfa.calc(midDt);
			var movement1 = y2 - data[data.length - 1].y;
			var movement0 = data[data.length - 1].y - data[data.length - 2].y;
			this._dataSource2.add({ x: midDt, y: data[data.length - 1].y + mean(movement1, movement0) });

			var data = this._dataSource3.rawData;
			var y3 = lobfa.calc(midDt) + sample.standardDeviation("ya");
			var movement1 = y3 - data[data.length - 1].y;
			var movement0 = data[data.length - 1].y - data[data.length - 2].y;
			this._dataSource3.add({ x: midDt, y: data[data.length - 1].y + mean(movement1, movement0) });

			var data = this._dataSource4.rawData;
			var y4 = lobfa.calc(midDt) - sample.standardDeviation("ya");
			var movement1 = y4 - data[data.length - 1].y;
			var movement0 = data[data.length - 1].y - data[data.length - 2].y;
			this._dataSource4.add({ x: midDt, y: data[data.length - 1].y + mean(movement1, movement0) });
		}

		var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = predictionStartDt;
		lineMarker.modelY0 = -10;
		lineMarker.modelX1 = lineMarker.modelX0;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "black";
		lineMarker.lineStyle.strokeStyle = "dashed";
		lineMarker.lineStyle.width = 0.5;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);


		var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
		pointMarker1.modelX = this._dataSource2.rawData[this._dataSource2.rawData.length - 1].x;
		pointMarker1.modelY = this._dataSource2.rawData[this._dataSource2.rawData.length - 1].y;
		pointMarker1.color = "black";
		pointMarker1.lineStyle.color = "black";
		pointMarker1.size = 2;
		this._chartVisual.scene.markers.add(pointMarker1);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);

		var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
		pointMarker1.modelX = this._dataSource3.rawData[this._dataSource3.rawData.length - 1].x;
		pointMarker1.modelY = this._dataSource3.rawData[this._dataSource3.rawData.length - 1].y;
		pointMarker1.color = "red";
		pointMarker1.lineStyle.color = "pink";
		pointMarker1.size = 2;
		this._chartVisual.scene.markers.add(pointMarker1);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);

		var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
		pointMarker1.modelX = this._dataSource4.rawData[this._dataSource4.rawData.length - 1].x;
		pointMarker1.modelY = this._dataSource4.rawData[this._dataSource4.rawData.length - 1].y;
		pointMarker1.color = "red";
		pointMarker1.lineStyle.color = "pink";
		pointMarker1.size = 2;
		this._chartVisual.scene.markers.add(pointMarker1);
		ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);

		var sample = new MappedArray(this._indicatorDataSource.rawData);
		this._indicatorValueAxis.dataRange.setBounds(sample.min("v"), sample.max("v"));
		//this._indicatorValueAxis.dataRange.setBounds(0.003, -0.003);
		var lineMarker = new ChartLineMarker(newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
		lineMarker.modelX0 = 0;
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = Number.MAX_SAFE_INTEGER;
		lineMarker.modelY1 = 0;
		lineMarker.lineStyle.color = "black";
		lineMarker.lineStyle.width = 0.5;
		this._indicatorChartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		this._indicatorChartVisual.refresh();
		this._chartVisual.refresh();
	}

	async _updateV6PredictorIndicator()
	{
		if (!this._dataSource2a)
		{
			this._dataSource2a = new ChartDataSource_Buffer("dataSource2a");
			this._lineSeries2a = new ChartLineSeries("lineSeries2", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource2a);
			this._lineSeries2a.lineStyle.color = "orange";
			this._lineSeries2a.lineStyle.strokeStyle = "solid";
			this._lineSeries2a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries2a);

			this._dataSource3a = new ChartDataSource_Buffer("dataSource3a");
			this._lineSeries3a = new ChartLineSeries("lineSeries3a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource3a);
			this._lineSeries3a.lineStyle.color = "red";
			this._lineSeries3a.lineStyle.strokeStyle = "dashed";
			this._lineSeries3a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries3a);

			this._dataSource4a = new ChartDataSource_Buffer("dataSource4a");
			this._lineSeries4a = new ChartLineSeries("lineSeries4a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource4a);
			this._lineSeries4a.lineStyle.color = "green";
			this._lineSeries4a.lineStyle.strokeStyle = "dashed";
			this._lineSeries4a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries4a);

			ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual.scene);
			ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		}

		this._dataSource2a.clear();
		this._dataSource3a.clear();
		this._dataSource4a.clear();

		var fsp6 = new ForexShaper_PredictorV6();
		var piInfo = fsp6.shape(null, this._forexDataSource.rawData);
		if (!piInfo) return;

		this._dataSource2a.addRange(piInfo.ibufferm);
		this._dataSource3a.addRange(piInfo.ibufferr);
		this._dataSource4a.addRange(piInfo.ibuffers);

		var currentPriceDeviationThreshold = 0.0007;
		//var sdyaThreshold = 0.0005;
		//var sdyaThreshold = 0.0002;
		//var sdyaThreshold = 0.00015;
		var sdyaThreshold = 0;
		var ranges = [new Range(6 * 60 * 60 * 1000, 20 * 60 * 60 * 1000)];
		var testPoi = function (poi, action)
		{
			var timeOfDay = moment.utc(poi.dt).valueOf() - moment.utc(poi.dt).startOf("day").valueOf();
			if (!Range.contain(ranges, timeOfDay)) return false;

			return true;
		}
		var handicap = 0.0002;
		//var handicap = 0.0000;
		var openPosition = null;
		var totalMovement = 0;
		var totalMovement_handicapped = 0;
		for (var length = piInfo.pois.length, i = 0; i < length; ++i)
		{
			var poi = piInfo.pois[i];

			var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
			var action = null;
			if (poi.nz == 1) action = "wait";
			else if (poi.nz === 0 && poi.d == -1) action = "sell";
			else if (poi.nz === 0 && poi.d == 1) action = "buy";
			else if (poi.s == -1) action = "sell";
			else if (poi.s == 1) action = "buy";
			else if (poi.s === 0) action = "wait";
			else if (poi.d * poi.r == -1) action = "sell";
			else if (poi.d === 0) action = "wait";
			else if (poi.d * poi.r == 1) action = "buy";
			else action = "error";

			pointMarker1.modelX = poi.dt;
			pointMarker1.modelY = poi.ask;
			//log(999, moment.utc(poi.dt).toString(), poi.a);
			switch (action)
			{
				case "close wait":
					if (openPosition)
					{
						if (openPosition.a == "sell")
						{
							var movement = openPosition.p - poi.bid;
							totalMovement += movement;
							totalMovement_handicapped += movement - handicap;
							var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
							lineMarker.modelX0 = openPosition.dt;
							lineMarker.modelY0 = openPosition.p;
							lineMarker.modelX1 = poi.x;
							lineMarker.modelY1 = poi.bid;
							lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
							lineMarker.lineStyle.width = 3;
							this._chartVisual.scene.markers.add(lineMarker);
							ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
							openPosition = null;
							if (poi.r == 1 && poi.sdya > sdyaThreshold && poi.ask - poi.y <= currentPriceDeviationThreshold && testPoi(poi, action)) openPosition = { a: "buy", dt: poi.dt, p: poi.ask };
						}
						else if (openPosition.a == "buy")
						{
							var movement = poi.ask - openPosition.p;
							totalMovement += movement;
							totalMovement_handicapped += movement - handicap;
							var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
							lineMarker.modelX0 = openPosition.dt;
							lineMarker.modelY0 = openPosition.p;
							lineMarker.modelX1 = poi.x;
							lineMarker.modelY1 = poi.ask;
							lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
							lineMarker.lineStyle.width = 3;
							this._chartVisual.scene.markers.add(lineMarker);
							ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
							openPosition = null;
							if (poi.r == 1 && poi.sdya > sdyaThreshold && poi.ask - poi.y <= currentPriceDeviationThreshold && testPoi(poi, action)) openPosition = { a: "sell", dt: poi.dt, p: poi.bid };
						}
					}
					break;
				case "buy":
					if (openPosition)
					{
						if (openPosition.a == "sell")
						{
							var movement = openPosition.p - poi.bid;
							totalMovement += movement;
							totalMovement_handicapped += movement - handicap;
							var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
							lineMarker.modelX0 = openPosition.dt;
							lineMarker.modelY0 = openPosition.p;
							lineMarker.modelX1 = poi.x;
							lineMarker.modelY1 = poi.bid;
							lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
							lineMarker.lineStyle.width = 3;
							this._chartVisual.scene.markers.add(lineMarker);
							ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
							openPosition = null;
							if (poi.r == 1 && poi.sdya > sdyaThreshold && poi.ask - poi.y <= currentPriceDeviationThreshold && testPoi(poi, action)) openPosition = { a: "buy", dt: poi.dt, p: poi.ask };
						}
					}
					else
					{
						if (poi.r == 1 && poi.sdya > sdyaThreshold && poi.ask - poi.y <= currentPriceDeviationThreshold && testPoi(poi, action)) openPosition = { a: "buy", dt: poi.dt, p: poi.ask };
					}
					pointMarker1.color = "red";
					pointMarker1.size = 2;
					break;
				case "sell":
					if (openPosition)
					{
						if (openPosition.a == "buy")
						{
							var movement = poi.ask - openPosition.p;
							totalMovement += movement;
							totalMovement_handicapped += movement - handicap;
							var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
							lineMarker.modelX0 = openPosition.dt;
							lineMarker.modelY0 = openPosition.p;
							lineMarker.modelX1 = poi.x;
							lineMarker.modelY1 = poi.ask;
							lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
							lineMarker.lineStyle.width = 3;
							this._chartVisual.scene.markers.add(lineMarker);
							ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
							openPosition = null;
							if (poi.r == 1 && poi.sdya > sdyaThreshold && poi.ask - poi.y <= currentPriceDeviationThreshold && testPoi(poi, action)) openPosition = { a: "sell", dt: poi.dt, p: poi.bid };
						}
					}
					else if (poi.r == 1 && poi.sdya > sdyaThreshold && poi.ask - poi.y <= currentPriceDeviationThreshold && testPoi(poi, action)) openPosition = { a: "sell", dt: poi.dt, p: poi.bid };
					pointMarker1.color = "black";
					pointMarker1.size = 2;
					break;
				case "wait":
					pointMarker1.color = "springgreen";
					pointMarker1.size = 2;
					break;
				case "error":
					pointMarker1.color = "yellow";
					pointMarker1.size = 10;
					break;
			}
//			log(999, moment.utc(poi.x).toString(), openPosition);
			if (poi.r == 1) pointMarker1.lineStyle.color = pointMarker1.color;
			else if (poi.r === 0) pointMarker1.lineStyle.color = "magenta";
			else pointMarker1.lineStyle.color = "lime";
			//if (poi.s === 1) pointMarker1.size = 6;
			//this._chartVisual.scene.markers.add(pointMarker1);
			//ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}
		if (openPosition)
		{
			if (openPosition.a == "buy")
			{
				var movement = poi.ask - openPosition.p - handicap;
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = openPosition.dt;
				lineMarker.modelY0 = openPosition.p;
				lineMarker.modelX1 = poi.x;
				lineMarker.modelY1 = poi.ask;
				lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
				lineMarker.lineStyle.width = 0.5;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}
			if (openPosition.a == "sell")
			{
				var movement = openPosition.p - poi.bid - handicap;
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = openPosition.dt;
				lineMarker.modelY0 = openPosition.p;
				lineMarker.modelX1 = poi.x;
				lineMarker.modelY1 = poi.bid;
				lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
				lineMarker.lineStyle.width = 0.5;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}
		}
		log(911, totalMovement_handicapped, totalMovement);

		this._chartVisual.refresh();
	}

	async _updateV6PredictorIndicator2()
	{
		if (!this._indicatorDataSource)
		{
			this._indicatorDataSource = new ChartDataSource_Buffer("indicatorDataSource");
			this._indicatorDataLineSeries = new ChartLineSeries("lineSeries1", 5010, this._indicatorTimeAxis, this._indicatorValueAxis, "x", "v", this._indicatorDataSource);
			this._indicatorDataLineSeries.gapTester = this._forexAreaSeries.gapTester;
			this._indicatorChartVisual.scene.series.add(this._indicatorDataLineSeries);

			this._indicatorDataSourceA = new ChartDataSource_Buffer("indicatorDataSourceA");
			this._indicatorDataLineSeriesA = new ChartLineSeries("indicatorDataLineSeriesA", 5010, this._indicatorTimeAxis, this._indicatorValueAxis, "x", "v", this._indicatorDataSourceA);
			this._indicatorDataLineSeriesA.lineStyle.color = "red";
			this._indicatorDataLineSeriesA.lineStyle.strokeStyle = "dashed";
			this._indicatorDataLineSeriesA.gapTester = this._forexAreaSeries.gapTester;
			this._indicatorChartVisual.scene.series.add(this._indicatorDataLineSeriesA);

			ChartStyleSheet.defaultSceneStyle.applyToScene(this._indicatorChartVisual.scene);
			ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._indicatorChartVisual.overlay);
		}

		//this._indicatorDataSource.clear();
		//this._indicatorChartVisual.refresh();
		
		if (!this._dataSource2a)
		{
			this._dataSource2a = new ChartDataSource_Buffer("dataSource2a");
			this._lineSeries2a = new ChartLineSeries("lineSeries2", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource2a);
			this._lineSeries2a.lineStyle.color = "orange";
			this._lineSeries2a.lineStyle.strokeStyle = "solid";
			this._lineSeries2a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries2a);

			this._dataSource3a = new ChartDataSource_Buffer("dataSource3a");
			this._lineSeries3a = new ChartLineSeries("lineSeries3a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource3a);
			this._lineSeries3a.lineStyle.color = "red";
			this._lineSeries3a.lineStyle.strokeStyle = "dashed";
			this._lineSeries3a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries3a);

			this._dataSource4a = new ChartDataSource_Buffer("dataSource4a");
			this._lineSeries4a = new ChartLineSeries("lineSeries4a", 5010, this._timeAxis, this._valueAxis, "x", "y", this._dataSource4a);
			this._lineSeries4a.lineStyle.color = "green";
			this._lineSeries4a.lineStyle.strokeStyle = "dashed";
			this._lineSeries4a.gapTester = this._forexAreaSeries.gapTester;
			this._chartVisual.scene.series.add(this._lineSeries4a);

			ChartStyleSheet.defaultSceneStyle.applyToScene(this._chartVisual.scene);
			ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		}

		this._indicatorDataSource.clear();
		this._indicatorDataSourceA.clear();
		this._dataSource2a.clear();
		this._dataSource3a.clear();
		this._dataSource4a.clear();

		if (!this._forexDataSource.rawData.length) return;

		var si = await app.db.getSampleIntervalByName("forex.sampledData.second5");
		var dbChannel = app.db.getChannel(this._instrumentId, si);

		var fsp6 = new ForexShaper_PredictorV6();
		var piInfo = fsp6.shape(null, this._forexDataSource.rawData);
		if (!piInfo) return;

		this._dataSource2a.addRange(piInfo.ibufferm);
		this._dataSource3a.addRange(piInfo.ibufferr);
		this._dataSource4a.addRange(piInfo.ibuffers);

		//var currentPriceDeviationThreshold = 0.0007;
		var currentPriceDeviationThreshold = 999;
		var ranges = [new Range(6 * 60 * 60 * 1000, 20 * 60 * 60 * 1000)];
		var handicap = 0.0002;
		//var handicap = 0.0000;
		var openPosition = null;
		var totalMovement = 0;
		var totalMovement_handicapped = 0;
		for (var length = piInfo.pois.length, i = 0; i < length; ++i)
		{
			var poi = piInfo.pois[i];

			//var dps5_0 = poi.dp;
			//var dps5m1 = await dbChannel.lookupDataPoint({ dt: dps5_0.dt, pageSizeMs: 60 * 60 * 1000, lookBack: true, acceptEqual: false });
			//var dps5p1 = await dbChannel.lookupDataPoint({ dt: dps5_0.dt, pageSizeMs: 60 * 60 * 1000, lookBack: false, acceptEqual: false });
			var dps5p1 = poi.dp;

			var testPoi = async function (poi, action)
			{
				var timeOfDay = moment.utc(poi.dt).valueOf() - moment.utc(poi.dt).startOf("day").valueOf();
				if (!Range.contain(ranges, timeOfDay)) return false;
				return false;
				switch (action)
				{
					case "buy":
						var dps5_0_sign = Math.sign(dps5_0.raw.ac - dps5_0.raw.ao);
						//var dps5m1_sign = Math.sign(dps5m1.raw.ac - dps5m1.raw.ao);
						var dps5p1_sign = Math.sign(dps5p1.raw.ac - dps5p1.raw.ao);
						var patternMatch1 = false;//(dps5m1_sign < 0 && dps5_0_sign < 0 && dps5p1_sign > 0);
						var patternMatch2 = (dps5_0_sign > 0 && dps5p1_sign > 0);
						if (!patternMatch1 && !patternMatch2) return false;
						break;
					case "sell":
						var dps5_0_sign = Math.sign(dps5_0.raw.bc - dps5_0.raw.bo);
						//var dps5m1_sign = Math.sign(dps5m1.raw.bc - dps5m1.raw.bo);
						var dps5p1_sign = Math.sign(dps5p1.raw.ac - dps5p1.raw.ao);
						var patternMatch1 = false;//(dps5m1_sign > 0 && dps5_0_sign > 0 && dps5p1_sign < 0);
						var patternMatch2 = (dps5_0_sign < 0 && dps5p1_sign < 0);
						if (!patternMatch1 && !patternMatch2) return false;
						break;
				}

				return true;
			}

			var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
			var action = null;

			var isPeak = (poi.type == ForexShaper_PredictorV6.PoiType.Peak);
			var isValley = (poi.type == ForexShaper_PredictorV6.PoiType.Valley);
			var isReversed = (poi.r == -1);
			var isNormal = (poi.r == 1);
			var isAmbigous = (poi.r === 0);
			var isAscending = (poi.d == 1);
			var isDescending = (poi.d == -1);
			var isHorizontal = (poi.d === 0);

			if (!isPeak && !isValley) continue;

			if (isPeak) action = "sell";
			if (isValley) action = "buy";

			//if (poi.nz === 1) action = "wait";
			//else if (poi.nz === 0 && poi.d == -1) action = "sell";
			//else if (poi.nz === 0 && poi.d == 1) action = "buy";
			//else if (poi.s == 1) action = "sell";
			//else if (poi.s == -1) action = "buy";
			//else if (poi.s === 0) action = "wait";
			//else if (poi.d * poi.r == -1) action = "sell";
			//else if (poi.d === 0) action = "wait";
			//else if (poi.d * poi.r == 1) action = "buy";
			//else action = "error";

			//pointMarker1.modelX = poi.dt;
			//pointMarker1.modelY = poi.y;
			pointMarker1.modelX = poi.dt;
			pointMarker1.modelY = poi.ask;
			//log(999, moment.utc(poi.dt).toString(), poi.a);
			switch (action)
			{
				case "buy":
					if (openPosition)
					{
						if (openPosition.a == "sell")
						{
							var movement = openPosition.p - poi.bid;
							totalMovement += movement;
							totalMovement_handicapped += movement - handicap;
							var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
							lineMarker.modelX0 = openPosition.dt;
							lineMarker.modelY0 = openPosition.p;
							lineMarker.modelX1 = poi.x;
							lineMarker.modelY1 = poi.bid;
							lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
							lineMarker.lineStyle.width = 3;
							this._chartVisual.scene.markers.add(lineMarker);
							ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
							openPosition = null;
							var testResult = await testPoi(poi, action);
							if (poi.r == 1 && dps5p1.ask - poi.y <= currentPriceDeviationThreshold && testResult) openPosition = { a: "buy", dt: dps5p1.dt, p: dps5p1.ask };
						}
					}
					else
					{
						var testResult = await testPoi(poi, action);
						if (poi.r == 1 && dps5p1.ask - poi.y <= currentPriceDeviationThreshold && testResult) openPosition = { a: "buy", dt: dps5p1.dt, p: dps5p1.ask };
					}
					pointMarker1.color = "red";
					pointMarker1.size = 3;
					break;
				case "sell":
					if (openPosition)
					{
						if (openPosition.a == "buy")
						{
							var movement = poi.ask - openPosition.p;
							totalMovement += movement;
							totalMovement_handicapped += movement - handicap;
							var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
							lineMarker.modelX0 = openPosition.dt;
							lineMarker.modelY0 = openPosition.p;
							lineMarker.modelX1 = poi.x;
							lineMarker.modelY1 = poi.ask;
							lineMarker.lineStyle.color = movement >= 0 ? "lawngreen" : "red";
							lineMarker.lineStyle.width = 3;
							this._chartVisual.scene.markers.add(lineMarker);
							ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
							openPosition = null;
							var testResult = await testPoi(poi, action);
							if (poi.r == 1 && dps5p1.ask - poi.y <= currentPriceDeviationThreshold && testResult) openPosition = { a: "sell", dt: dps5p1.dt, p: dps5p1.bid };
						}
					}
					else
					{
						var testResult = await testPoi(poi, action);
						if (poi.r == 1 && dps5p1.ask - poi.y <= currentPriceDeviationThreshold && testResult) openPosition = { a: "sell", dt: dps5p1.dt, p: dps5p1.bid };
					}
					pointMarker1.color = "black";
					pointMarker1.size = 3;
					break;
				case "wait":
					pointMarker1.color = "springgreen";
					pointMarker1.size = 2;
					break;
				case "error":
					pointMarker1.color = "yellow";
					pointMarker1.size = 10;
					break;
			}
			//			log(999, moment.utc(poi.x).toString(), openPosition);
			if (poi.s == 1) pointMarker1.lineStyle.color = "red";
			else if (poi.s === 0) pointMarker1.lineStyle.color = "magenta";
			else pointMarker1.lineStyle.color = "black";
			pointMarker1.opacity = 1;
			//if (poi.s === 1) pointMarker1.size = 6;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}
		if (openPosition)
		{
			if (openPosition.a == "buy")
			{
				var movement = poi.ask - openPosition.p - handicap;
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = openPosition.dt;
				lineMarker.modelY0 = openPosition.p;
				lineMarker.modelX1 = poi.x;
				lineMarker.modelY1 = poi.ask;
				lineMarker.lineStyle.color = movement >= 0 ? "green" : "maroon";
				lineMarker.lineStyle.width = 0.5;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}
			if (openPosition.a == "sell")
			{
				var movement = openPosition.p - poi.bid - handicap;
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = openPosition.dt;
				lineMarker.modelY0 = openPosition.p;
				lineMarker.modelX1 = poi.x;
				lineMarker.modelY1 = poi.bid;
				lineMarker.lineStyle.color = movement >= 0 ? "green" : "maroon";
				lineMarker.lineStyle.width = 0.5;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}
		}
		log(911, totalMovement_handicapped, totalMovement);

		this._chartVisual.refresh();
	}

	async _updateV6VariabilityIndicator()
	{
		//	variability indicator
		var windowDpCount = 100;
		var bufferc = [];
		var bufferv = [];
		var bufferw = [];
		for (var length = this._forexDataSource.rawData.length, i = 0; i < length; ++i)
		{
			var dp = this._forexDataSource.rawData[i];
			bufferw.push(dp);
			if (bufferw.length > windowDpCount)
			{
				bufferw.shift();
				var sample = new MappedArray(bufferw, { x: (m) => m.dt, ya: (m) => m.raw.al, yb: (m) => m.raw.bh });
				var sdya = sample.standardDeviation("ya");
				var item =
				{
					x: dp.dt,
					v: sdya,
				};
				bufferv.push(item);
			}
		}

		if (!this._indicatorDataSource)
		{
			this._indicatorDataSource = new ChartDataSource_Buffer("indicatorDataSource");
			this._indicatorDataLineSeries = new ChartLineSeries("lineSeries1", 5010, this._indicatorTimeAxis, this._indicatorValueAxis, "x", "v", this._indicatorDataSource);
			this._indicatorDataLineSeries.gapTester = this._forexAreaSeries.gapTester;
			this._indicatorChartVisual.scene.series.add(this._indicatorDataLineSeries);

			ChartStyleSheet.defaultSceneStyle.applyToScene(this._indicatorChartVisual.scene);
			ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._indicatorChartVisual.overlay);
		}

		this._indicatorDataSource.clear();
		this._indicatorDataSource.addRange(bufferv);
		this._indicatorValueAxis.dataRange.setBounds(0, 0.001);
		this._indicatorChartVisual.refresh();
	}

	async _updateV6HlIndicator()
	{
		//	variability indicator
		var min = Infinity;
		var max = -Infinity;
		for (var length = this._forexDataSource.rawData.length, i = 0; i < length; ++i)
		{
			var dp = this._forexDataSource.rawData[i];

			var x = dp.dt;
			var y0 = dp.raw.al;
			var y1 = dp.raw.ah;
			var s = dp.raw.ac - dp.raw.ao;
			min = Math.min(min, y0);
			max = Math.max(max, y1);
			var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = x;
			lineMarker.modelY0 = y0;
			lineMarker.modelX1 = x;
			lineMarker.modelY1 = y1;
			lineMarker.lineStyle.color = s > 0 ? "lawngreen" : "red";
			lineMarker.lineStyle.width = 1;
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
		}

		//this._indicatorValueAxis.dataRange.setBounds(min, max);
		this._chartVisual.refresh();
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
		var sb = [];

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
		sb.push(moment.duration(this._timeAxis.dataRange.length).humanize());
		sb.push(", ");
		if (this._sampleIntervalDef) sb.push(this._sampleIntervalDef.length + " " + EDateTimeUnit.getName(this._sampleIntervalDef.unit) + "(s)");
		else sb.push("tick");
		sb.push(" resolution");

		this._infoLabel.text = sb.join("");
	}

	_updateSelectedPositionIndicators()
	{
		if (this._forexAccountUserControl.selectedPosition)
		{
			this._selectedPositionEntryPriceIndicatorY.visible = true;
			this._selectedPositionEntryPriceIndicatorY.sceneY = this._valueAxis.modelToScene(this._forexAccountUserControl.selectedPosition.entryPrice);

			switch (this._forexAccountUserControl.selectedPosition.type)
			{
				case EForexPositionType.Long:
					this._selectedPositionEvenPriceIndicatorY.visible = true;
					this._selectedPositionEvenPriceIndicatorY.sceneY = this._valueAxis.modelToScene(this._forexAccountUserControl.selectedPosition.exitEvenPrice);
					break;
				case EForexPositionType.Short:
					this._selectedPositionEvenPriceIndicatorY.visible = false;
					break;
				default:
					throw "Not implemented.";
			}
		}
		else
		{
			this._selectedPositionEntryPriceIndicatorY.visible = false;
			this._selectedPositionEvenPriceIndicatorY.visible = false;
		}
	}

	_updateButtonEnabledStates(isRunningSimulation)
	{
		this._stopButton.enabled = isRunningSimulation;
		this._stopButton.refresh();
		this._runButton_discrete.enabled = !isRunningSimulation;
		this._runButton_discrete.refresh();
		this._runButton_realTime.enabled = !isRunningSimulation;
		this._runButton_realTime.refresh();
		this._runButton_realTime_x2.enabled = !isRunningSimulation;
		this._runButton_realTime_x2.refresh();
		this._runButton_realTime_x4.enabled = !isRunningSimulation;
		this._runButton_realTime_x4.refresh();
		this._runButton_afaic.enabled = !isRunningSimulation;
		this._runButton_afaic.refresh();
		this._simulateButton_visibleRange.enabled = !isRunningSimulation;
		this._simulateButton_visibleRange.refresh();
		this._simulateButton_geneticSimulator.enabled = !isRunningSimulation;
		this._simulateButton_geneticSimulator.refresh();
		this._clearButton.enabled = !isRunningSimulation;
		this._clearButton.refresh();

		this.onSimulationStateChange({ isRunningSimulation: isRunningSimulation });
	}


	async _timeAxis_change(sender, args)
	{
		switch (args.aspect)
		{
			case "scale":
				this._updateInfoLabel();
				this._indicatorTimeAxis.dataRange.setBounds(sender.dataRange.min, sender.dataRange.max);
				this._indicator2TimeAxis.dataRange.setBounds(sender.dataRange.min, sender.dataRange.max);
				await this._channelChainSahpe_deferrer.signal();
				this._chartVisual.refresh();
				this._indicatorChartVisual.refresh();
				break;
		}
	}

	async _chartHorizontalPanZoomController_changing(sender, args)
	{
		switch (this._state)
		{
			case SimulationChartUserControl.State.Exploration:
				await this._updateDataChannel(new Range(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max).inflate(0.1, 0.1));
				break;
			case SimulationChartUserControl.State.Simulation:
				break;
			default:
				throw "Not implemented.";
		}
	}

	_chartIndicatorsController_behavior_indicatorUpdate(sender, args)
	{
		switch (args.indicator)
		{
			case "mouseIndicatorX":
				switch (args.update)
				{
					case "offset":
						this._indicatorMouseIndicatorX.modelX = args.modelOffset;
						this._indicator2MouseIndicatorX.modelX = args.modelOffset;
						this._indicatorChartVisual.refresh();
						this._indicator2ChartVisual.refresh();
						break;
					case "visibility":
						this._indicatorMouseIndicatorX.visible = args.visible;
						this._indicator2MouseIndicatorX.visible = args.visible;
						this._indicatorChartVisual.refresh();
						this._indicator2ChartVisual.refresh();
						break;
					default:
						throw "Not implemented.";
				}
				break;
			case "mouseIndicatorY":
				break;
			default:
				throw "Not implemented.";
		}
		
	}


	//	live ui trade simulation
	async _preloadHistoryData()
	{
		if (this._forexDataSource_simulation.rawData.length) return;

		this._sampleIntervalDef = await app.db.selectSampleInterval(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max, this._timeAxis.scaleInfoCache.sceneLengthDeflated, this._tickDataThreshold);

		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		var preLoadPeriodMs = this._timeAxis.dataRange.length * 0.5;
		var simulationRange = new Range(this._simulationStartIndicatorX.modelX - preLoadPeriodMs, this._simulationStartIndicatorX.modelX);
		await dbChannel.ensureRange(simulationRange.roundUp(0.5));
		this._forexDataSource_simulation.authorativeRange = this._forexDataSource.authorativeRange;
		this._forexDataSource_simulation.feed(dbChannel.getRawDataInRange(simulationRange.roundUp(0.5)));
		this._valueAxis.dataRange.setBounds(
			Math.min(this._adaptiveDataRange__rawMin, this._forexDataSource_simulation.adaptiveRange.min),
			Math.max(this._adaptiveDataRange__rawMax, this._forexDataSource_simulation.adaptiveRange.max)
		);
		this._chartVisual.refresh();
		this._updateInfoLabel();
	}

	_forexAccountUserControl_selectedPositionChange(sender, args)
	{
		this.setValueRange(this._adaptiveDataRange__rawMin, this._adaptiveDataRange__rawMax);
		this._chartVisual.refresh();

		this._updateSelectedPositionIndicators();
		this._chartVisual.refresh();
	}

	_forexBrokerClient_tick(sender, args)
	{
		this._forexDataSource_simulation.feedTick(args.dt, args.ask, args.bid, this._sampleIntervalDef);
		var lastSampledDataPoint = this._forexDataSource_simulation.rawData[this._forexDataSource_simulation.rawData.length - 1];

		this._progressIndicatorX.visible = true;
		this._progressIndicatorX.modelX = lastSampledDataPoint.dt;
		this._progressLabelIndicator.visible = true;
		this._progressLabelIndicator.modelOffset = this._forexBrokerClient.currentTimeMs;
		this._updateSelectedPositionIndicators();

		var roundedMoment = EDateTimeUnit.floorMoment(moment(args.dt), this._sampleIntervalDef.unit, this._sampleIntervalDef.length);
		roundedMoment = EDateTimeUnit.addToMoment(roundedMoment, this._sampleIntervalDef.length, this._sampleIntervalDef.unit);
		if (roundedMoment > this._timeAxis.dataRange.max)
		{
			this._timeAxis.dataRange.setBounds(roundedMoment - this._timeAxis.dataRange.length, roundedMoment);
		}

		var min = Math.min(this._adaptiveDataRange__rawMin, args.bid);
		var max = Math.max(this._adaptiveDataRange__rawMax, args.ask);
		this.setValueRange(min, max);

		this._chartVisual.refresh();
		this._forexAccountUserControl.refresh();
	}

	_forexBrokerClient_idle(sender, args)
	{
		this._progressLabelIndicator.visible = true;
		this._progressLabelIndicator.modelOffset = this._forexBrokerClient.currentTimeMs;
		this._chartVisual.refresh();
	}

	_forexBrokerClient_finish(sender, args)
	{
		this._updateButtonEnabledStates(false);
	}

	async _runButton_discrete_click(sender, args)
	{
		this._updateButtonEnabledStates(true);
		this._chartVisual.scene.markers.clear();

		this._state = SimulationChartUserControl.State.Simulation;
		this._forexBrokerClient.timePassage = EForexTimePassage.Discrete;
		this._forexAreaSeries.dataSource = this._forexDataSource_simulation;
		await this._preloadHistoryData();
		await this._forexBrokerClient.startSimulation();
		this._chartVisual.refresh();
	}

	async _runButton_realTime_click(sender, args)
	{
		this._updateButtonEnabledStates(true);
		this._chartVisual.scene.markers.clear();

		this._state = SimulationChartUserControl.State.Simulation;
		this._forexBrokerClient.timePassage = EForexTimePassage.RealTime;
		this._forexAreaSeries.dataSource = this._forexDataSource_simulation;
		await this._preloadHistoryData();
		await this._forexBrokerClient.startSimulation();
		this._chartVisual.refresh();
	}

	async _runButton_realTime_x2_click(sender, args)
	{
		this._updateButtonEnabledStates(true);
		this._chartVisual.scene.markers.clear();

		this._state = SimulationChartUserControl.State.Simulation;
		this._forexBrokerClient.timePassage = EForexTimePassage.RealTime_x2;
		this._forexAreaSeries.dataSource = this._forexDataSource_simulation;
		await this._preloadHistoryData();
		await this._forexBrokerClient.startSimulation();
		this._chartVisual.refresh();
	}

	async _runButton_realTime_x4_click(sender, args)
	{
		this._updateButtonEnabledStates(true);
		this._chartVisual.scene.markers.clear();

		this._state = SimulationChartUserControl.State.Simulation;
		this._forexBrokerClient.timePassage = EForexTimePassage.RealTime_x4;
		this._forexAreaSeries.dataSource = this._forexDataSource_simulation;
		await this._preloadHistoryData();
		await this._forexBrokerClient.startSimulation();
		this._chartVisual.refresh();
	}

	async _runButton_afaic_click(sender, args)
	{
		this._updateButtonEnabledStates(true);
		this._chartVisual.scene.markers.clear();

		this._state = SimulationChartUserControl.State.Simulation;
		this._forexBrokerClient.timePassage = EForexTimePassage.Afaic;
		this._forexAreaSeries.dataSource = this._forexDataSource_simulation;
		await this._preloadHistoryData();
		await this._forexBrokerClient.startSimulation();
		this._chartVisual.refresh();
	}

	async _stopButton_click(sender, args)
	{
		this._updateButtonEnabledStates(false);

		var isRunning = this._forexBrokerClient.isRunning;
		if (isRunning)
		{
			this._forexBrokerClient.stopSimulation();
		}
		this._forexBrokerClient.simulationStartMs = this._forexBrokerClient.currentTimeMs;
		this._state = SimulationChartUserControl.State.Exploration;

		await this._updateDataChannel(new Range(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max).inflate(0.25, 0.25));
		this._forexAreaSeries.dataSource = this._forexDataSource;
		this._chartVisual.refresh();
	}

	_discreteSimulationKeyboardBehavior__onKeyDown(args)
	{
		switch (args.code)
		{
			case "Space":
				if (!this._forexBrokerClient.isRunning) break;
				this._forexBrokerClient.oneStep();
				break;
		}
	}


	//	simulate on range selection
	_horizontalRangeSelectBehavior_cudCommand(sender, args)
	{
		switch (args.action)
		{
			case "delete":
				this._chartVisual.overlay.indicators.remove(args.element);
				break;
			case "create":
				this._chartVisual.overlay.indicators.add(args.element);
				ChartStyleSheet.defaultOverlayStyle.applyToHorizontalRange(args.element);
				args.element.opacity = 0.05;
				break;
			case "change":
				break;
			default:
				throw "Not implemented.";
		}
	}

	async _horizontalRangeSelectBehavior_dataRangeAvailable(sender, signalArgs)
	{
		var sender = signalArgs.sender;
		var args = signalArgs.args;

		if (args.empty) return;

		//this._updateButtonEnabledStates(true);
		try
		{
			//this._chartVisual.scene.markers.clear();
			if (this._detailTabControl.selectedTabPageKey == "infoView") await this._updateChartV7(new Range(args.min, args.max));
			if (this._detailTabControl.selectedTabPageKey == "q2tableView") await this._updateQ2TableChart(new Range(args.min, args.max));
			else if (this._detailTabControl.selectedTabPageKey == "sdView") await this._updateSdChart(new Range(args.min, args.max));
			//else if (this._detailTabControl.selectedTabPageKey == "fftView") await this._updateFftChart(new Range(args.min, args.max));
			else if (this._detailTabControl.selectedTabPageKey == "fftView") await this._updateFftChart_movmentStats(new Range(args.min, args.max));
			//else await this._shapeRangeV5(args.min, args.max);
			else if (this._detailTabControl.selectedTabPageKey == "statCalcView") await this._runStatCalc(new Range(args.min, args.max));
		}
		finally
		{
			//this._updateButtonEnabledStates(false);
		}
	}

	async _simulateButton_visibleRange_click(sender, args)
	{
		this._updateButtonEnabledStates(true);
		try
		{
			this._chartVisual.scene.markers.clear();
			await this._runRobotV4OnRange(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max);
			await this._updateDataChannel(new Range(this._timeAxis.dataRange.min, this._timeAxis.dataRange.max));
		}
		finally
		{
			this._updateButtonEnabledStates(false);
		}
	}

	_clearButton_click(sender, args)
	{
		this._chartVisual.scene.markers.clear();
		this._forexDataSource_simulation.clear();
		this._forexAreaSeries.dataSource = this._forexDataSource;
		this._chartVisual.refresh();
		this._resetForexClient();
		this._forexBrokerClient.simulationStartMs = this._simulationStart_originalValue;
		this._updateInfoLabel();
		this._forexAccountUserControl.refresh();
	}

	async _runRobotV4OnRange(min, max)
	{
		var settings =
		{
			minSignificantDataPointCount: 3,
			forexAccount: this._forexAccount,
			forexAccount_autoUpdate: true,
			transactionDelayMinMs: 0.2,
			transactionDelayMaxMs: 5,
		};
		var callbacks =
		{
			openPosition: this._forexRobotV4_openPosition.bind(this),
			closePosition: this._forexRobotV4_closePosition.bind(this),
		};
		var config =
		{
			trendLineShaper:
			{
				correlationCoefficient_biasStrength: 1.5,
				correlationCoefficient_weight: 1,

				standardDeviationFactor: 0.0002,
				standardDeviationRating_weight: 2.5,

				normalizedSlope_scaleMin: 0,
				normalizedSlope_scaleMax: 0.4913493285048215,
				normalizedSlopeRating_weight: 5,
			},
			peaksShaper:
			{
				epsylon: 0.00005,
			},
			valleyShaper:
			{
				epsylon: 0.00005,
			},

			windowsSize: 2.25 * 1000 * 60 * 60,		//	2.25h
			tsEpsylon: 7 * 60 * 1000,				//	7 min
			angleEpsylon: 0.1,						//	9 degree
			trading_longPosition:
			{
				open_extremumNext_interval: 3 * 60 * 1000,	//	3 min
				open_sdAngleFactor_min: 0.15,
				open_sdThreshold: 0.45,
				close_sdAngleFactor: 0.2,
				close_sdThreshold: 0.75,
				close_sdSafeguardThreshold: 8,
				position_gracePeriod: 30 * 60 * 1000,		//	30 min
				position_maxTime: 5 * 60 * 60 * 1000,		//	5 h
				position_targetProfitFactor: 0.2,
				investmentFactor: 0.5,
			},
			trading_shortPosition:
			{
				open_extremumNext_interval: 3 * 60 * 1000,	//	3 min
				open_sdAngleFactor_min: 0.15,
				open_sdThreshold: 0.45,
				close_sdAngleFactor: 0.2,
				close_sdThreshold: 0.75,
				close_sdSafeguardThreshold: 8,
				position_gracePeriod: 30 * 60 * 1000,		//	30 min
				position_maxTime: 5 * 60 * 60 * 1000,		//	5 h
				position_targetProfitFactor: 0.2,
				investmentFactor: 0.5,
			},
		};
		config = ForexRobotFactoryV4.numericArrayToJsonSettings([234, 149, 18, 690, 738, 379, 423, 98, 16, 6, 43, 638, 645, 178, 207, 58, 153, 559, 371, 780, 498, 87, 855, 192, 232, 315, 85, 673, 223, 1238, 673, 38]);

		var robotFactory = new ForexRobotFactoryV4();
		var forexRobotV4 = robotFactory.createRobot(settings, callbacks, config);

		var simulationRange = new Range(min, max);
		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		await dbChannel.ensureRange(simulationRange.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(simulationRange.roundUp(0.5));
		this._forexDataSource_simulation.authorativeRange = this._forexDataSource.authorativeRange;
		this._forexDataSource_simulation.feed(data);

		forexRobotV4.feedRange(data);

		for (var length = this._forexAccount.positions.length, i = 0; i < length; ++i)
		{
			this._forexRobotV4_closePosition(
			{
				x: this._forexAccount.currentDt,
				position: this._forexAccount.positions[i],
				reason: EForexPositionCloseReasonV4.Shutdown,
			});
		}
		this._forexAccount.closeAll();

		var featureVisualiser = new ForexFeatureVisualiserV4(this._chartVisual, this._timeAxis, this._valueAxis);
		featureVisualiser.draw(
		[
			forexRobotV4.trendLineFeature,
			forexRobotV4.peaksFeature,
			forexRobotV4.valleysFeature
		], min, max);

		this._forexAccountUserControl.refresh();
	}

	_forexRobotV4_openPosition(positionInfo)
	{
		log(311, "open", positionInfo);

		var lineMarker = new ChartLineMarker("channelStart" + newUUID(), this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = positionInfo.position.start;
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = positionInfo.position.start;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "black";
		lineMarker.lineStyle.width = 1.5;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
	}

	_forexRobotV4_closePosition(positionInfo)
	{
		log(312, "close", EForexPositionCloseReasonV4.toString(positionInfo.reason), positionInfo.position.floatingAmount, positionInfo);

		var lineMarker = new ChartLineMarker("channelEnd" + newUUID(), this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = positionInfo.x;
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = positionInfo.x;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "yellow";
		lineMarker.lineStyle.width = 3;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
	}


	_reset_forexRobotV5_ChannelChain()
	{
		var configNumericArray = ForexRobotV5_ChannelChain_Factory.jsonToNumericArraySettings(
		{
			channelShaper: this._channelShaperConfig,
		});
		this._forexRobotV5_ChannelChain = this._forexRobotV5_ChannelChain_Factory.createRobot(
		{
			instrumentId: this._instrumentId,
			pageSizeMs: 6 * 60 * 60 * 1000,	//	6h
			//channelMode: "lineOfBestFit",
			maxChannelDataPointCount: 666,
			minSignificantDataPointCount: 3,
			progress: (args) =>
			{
				var percent = Math.round(100 * (args.current - args.range.min) / args.range.length);
				log(911, percent + "%");
			},
		}, ForexRobotV5_ChannelChain_Factory.numericArrayToJsonSettings(configNumericArray));
	}

	async _shapeChannelsV5Button_click()
	{
		await this._shapeChannelsV5(this._simulationStartIndicatorX.modelX, this._timeAxis.dataRange.max);
		this._drawChannelsV5();
		this._chartVisual.refresh();
		this._indicatorChartVisual.refresh();
	}

	async _shapeChannelsV5(visualMin, visualMax)
	{
		return

		if (visualMax <= visualMin) return;
		if (this._forexRobotV5_ChannelChain.isBroken) return;

		if (!this._forexRobotV5_ChannelChain.initialized) this._forexRobotV5_ChannelChain.initialize(this._sampleIntervalDef);
		await this._forexRobotV5_ChannelChain.buildRange(new Range(visualMin, visualMax));

		var mi = ForexRobotV5_ChannelChain.movementInfo(this._forexRobotV5_ChannelChain.channelChain);
		log(999, mi ? mi.totalMovement : "-");
	}

	_drawChannelsV5()
	{
		if (!this._forexRobotV5_ChannelChain.channelChain) return;

		this._forexFeatureVisualizerV5.clear();

		this._chartVisual.scene.markers.clear();
		this._indicatorChartVisual.scene.markers.clear();
		this._indicatorValueAxis.dataRange.setBounds(-1, 1);
				
		var visibleFeatures = [];
		for (var length = this._forexRobotV5_ChannelChain.channelChain.length, i = 0; i < length; ++i)
		{
			var item = this._forexRobotV5_ChannelChain.channelChain[i];
			if (item.lastDt <= this._timeAxis.dataRange.min) continue;
			if (item.firstDt >= this._timeAxis.dataRange.max) continue;
			visibleFeatures.push(item);
		}

		var context =
		{
		};
		this._forexFeatureVisualizerV5.draw(context, visibleFeatures, this._timeAxis.dataRange.min, this._timeAxis.dataRange.max);
	}

	async _shapeRangeV5(min, max)
	{
		var simulationRange = new Range(min, max);
		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		await dbChannel.ensureRange(simulationRange.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(simulationRange.roundUp(0.5));

		this._forexDataSource_simulation.authorativeRange = this._forexDataSource.authorativeRange;
		this._forexDataSource_simulation.feed(data);

		var channelShaper = new ForexShaperV5_Channel(this._channelShaperConfig);
		var channelFeature = channelShaper.shape({ sampleIntervalDef: this._sampleIntervalDef, infinite: true }, data);
		if (!channelFeature)
		{
			this._chartVisual.refresh();
			this._indicatorChartVisual.refresh();
			return;
		}

		this._forexFeatureVisualizerV5.clear();
		this._chartVisual.scene.markers.clear();
		this._indicatorChartVisual.scene.markers.clear();
		this._indicatorValueAxis.dataRange.setBounds(-1, 1);

		var context =
		{
		};
		this._forexFeatureVisualizerV5.draw(context, [channelFeature], min, max);

		this._chartVisual.refresh();
		this._indicatorChartVisual.refresh();
	}

	async _updateChartV7(range)
	{
		//var sampleIntervalDef = await app.db.getLowerSampleInterval(this._sampleIntervalDef.collectionName, 2);
		var sampleIntervalDef = this._sampleIntervalDef;
		var sampleLengthMs = EDateTimeUnit.getMaxUnitLengthMs(sampleIntervalDef.unit) * sampleIntervalDef.length;

		var dbChannel = app.db.getChannel(this._instrumentId, sampleIntervalDef);
		await dbChannel.ensureRange(range.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
		if (!data.length) return;

		this._chartVisual.scene.markers.clear();
		this._chartVisual.scene.series.removeByQuery((m, i) => String(m.id).indexOf("emsdy_") == 0);
		this._indicatorChartVisual.scene.markers.clear();
		this._indicatorChartVisual.scene.series.clear();

		if (false)
		{
			var directionDpCount = 7;
			var takeProfit_spreadFactor = 35;
			var trailingStopLossDistance_spreadFactor = 25;
			var stopLoss_spreadFactor = 3.5;
			var testMarket = function (dp, i, totalMovement, tradeCount)
			{
				if (i < directionDpCount - 1) return null;
				var mca = Sample.classifyMovement(new ArrayMapper(data, { y: (m) => m.raw.ah }, null, i - directionDpCount + 1, directionDpCount), "y");
				var mcb = Sample.classifyMovement(new ArrayMapper(data, { y: (m) => m.raw.bl }, null, i - directionDpCount + 1, directionDpCount), "y");
				if (mca >= 0 && mcb <= 0) return null;
				var spread = dp.ask - dp.bid;
				if (mca < 0)
				{
					var extremums = Sample.extremums(new ArrayMapper(data, { y: (m) => m.raw.ah }, null, i - directionDpCount + 1, directionDpCount), 3, "y");
					if (extremums.valleys.length || extremums.peaks.length) { return null; }
					return [
					{
						type: "buy",
						stopLoss: dp.bid - stopLoss_spreadFactor * spread,
						trailingStopLossDistance: trailingStopLossDistance_spreadFactor * spread,
						takeProfit: dp.bid + takeProfit_spreadFactor * spread,
					},
					{
						type: "sell",
						stopLoss: dp.ask + stopLoss_spreadFactor * spread,
						trailingStopLossDistance: trailingStopLossDistance_spreadFactor * spread,
						takeProfit: dp.ask - takeProfit_spreadFactor * spread,
					}];
				}
				if (mcb > 0)
				{
					var extremums = Sample.extremums(new ArrayMapper(data, { y: (m) => m.raw.bl }, null, i - directionDpCount + 1, directionDpCount), 3, "y");
					if (extremums.valleys.length || extremums.peaks.length) { return null; }
					return [
					{
						type: "buy",
						stopLoss: dp.bid - stopLoss_spreadFactor * spread,
						trailingStopLossDistance: trailingStopLossDistance_spreadFactor * spread,
						takeProfit: dp.bid + takeProfit_spreadFactor * spread,
					},
					{
						type: "sell",
						stopLoss: dp.ask + stopLoss_spreadFactor * spread,
						trailingStopLossDistance: trailingStopLossDistance_spreadFactor * spread,
						takeProfit: dp.ask - takeProfit_spreadFactor * spread,
					}];
				}
				throw "Invalid operation.";
			}.bind(this);

			var testPosition = function (dp, i, position)
			{
				return null;
			}.bind(this);

			var positionOpened = function (dp, i, position, totalMovement, tradeCount)
			{
				var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = position.dt;
				pointMarker1.modelY = position.price;
				pointMarker1.color = "white";
				pointMarker1.lineStyle.color = "green";
				pointMarker1.lineStyle.width = 0.6;
				pointMarker1.size = 2;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
				log(5551, "positionOpened", dp, i, position, totalMovement, tradeCount);
			}.bind(this);

			var positionClosed = function (dp, i, position, closeLevel, movement, closePositionReason, totalMovement, tradeCount)
			{
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = position.dt;
				lineMarker.modelY0 = position.price;
				lineMarker.modelX1 = dp.dt;
				lineMarker.modelY1 = closeLevel;
				lineMarker.lineStyle.color = Math.sign(movement) >= 0 ? "lawngreen" : "red";
				lineMarker.lineStyle.width = 3;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				log(5552, "positionClosed", dp, i, position, movement, closePositionReason, totalMovement, tradeCount);
			}.bind(this);

			var tradeResult = new Simulator().trade(data, testMarket, testPosition, positionOpened, positionClosed);
			log(555, "tradeResult", tradeResult);
		}

		var z = function z(data, draw)
		{
			data = ArrayView.wrap(data);

			var extremumVicinity = 3;
			var valleyExtremums = Sample.extremums(new ArrayMapper(data, { y: (m) => m.raw.al }), extremumVicinity, "y");
			valleyExtremums = Sample.extremums(new ArrayMapper(valleyExtremums.valleys, { y: (m) => m.m.raw.al }), extremumVicinity, "y");
			var valleyMap = ArrayView.mapByKey(new ArrayMapper(ArrayView.wrap(valleyExtremums.valleys).toArray("m"), { ii: (m) => m.i - Math.floor(extremumVicinity / 2) }), "ii");
			var valleys = [];
			var peakExtremums = Sample.extremums(new ArrayMapper(data, { y: (m) => m.raw.bh }), extremumVicinity, "y");
			peakExtremums = Sample.extremums(new ArrayMapper(peakExtremums.peaks, { y: (m) => m.m.raw.bh }), extremumVicinity, "y");
			var peakMap = ArrayView.mapByKey(new ArrayMapper(ArrayView.wrap(peakExtremums.peaks).toArray("m"), { ii: (m) => m.i - Math.floor(extremumVicinity / 2) }), "ii");
			var peaks = [];
			var supportLine = null;
			var resistanceLine = null;
			var position = null;
			var dp = data.last();
			for (var min = Math.floor(extremumVicinity / 2), i = data.length - 1 - min; i >= min; --i)
			{
				var arm = new ArrayMapper(data.extract(i, data.length - i), { x: "dt", y: (m) => m.raw.al });
				var trendLine = LinearFunction.buildLineOfBestFit(arm.toArrayM());
				var valley = valleyMap[i];
				if (valley)
				{
					valleys.push(valley);
					if (draw)
					{
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = valley.m.dt;	
						pointMarker1.modelY = valley.v;
						pointMarker1.color = "red";
						pointMarker1.lineStyle.color = "red";
						pointMarker1.lineStyle.width = 0.5;
						pointMarker1.size = 1.5;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}
				}
				var peak = peakMap[i];
				if (peak)
				{
					peaks.push(peak);
					if (draw)
					{
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = peak.m.dt;
						pointMarker1.modelY = peak.v;
						pointMarker1.color = "cyan";
						pointMarker1.lineStyle.color = "cyan";
						pointMarker1.lineStyle.width = 0.5;
						pointMarker1.size = 1.5;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}
				}
				if (peaks.length < 1 || valleys.length < 3) continue;

				if (!supportLine || !resistanceLine)
				{
					var sample = new Sample(arm);

					var sdx = sample.standardDeviation("x");
					var sdy = sample.standardDeviation("y");
					var sdTrendLine = LinearFunction.buildScaledLine(trendLine, 1 / sdx, 1 / sdy);

					var extremumDeviationTolerance = 0.12;
					var dps = [];
					if (trendLine.a < 0)
					{
						var sdValleys = new ArrayMapper(valleys,
						{
							d: (m) => { let pt = { x: m.m.dt / sdx, y: m.v / sdy }; return (sdTrendLine.isBelowPoint(pt) ? -1 : 1) * sdTrendLine.distanceTo(pt) },
						});
						var sdValleys_distanceSorted = sdValleys.sortedArray((l, r) => sdValleys.valueOf(r, "d") - sdValleys.valueOf(l, "d"));
						if (sdValleys_distanceSorted.length < 3) continue;
						var i0 = sdValleys_distanceSorted[0].i;
						var i1 = sdValleys_distanceSorted[1].i;
						var i2 = sdValleys_distanceSorted[2].i;
						var sdLine1 = LinearFunction.buildLineFromPoints({ x: data.get(i0).dt / sdx, y: data.get(i0).raw.al / sdy }, { x: data.get(i1).dt / sdx, y: data.get(i1).raw.al / sdy });
						var sdLine2 = LinearFunction.buildLineFromPoints({ x: data.get(i0).dt / sdx, y: data.get(i0).raw.al / sdy }, { x: data.get(i2).dt / sdx, y: data.get(i2).raw.al / sdy });
						if (sdLine1.angleWith(sdLine2) > extremumDeviationTolerance) continue;
						supportLine = LinearFunction.buildLineOfBestFit([{ x: data.get(i0).dt, y: data.get(i0).raw.al }, { x: data.get(i1).dt, y: data.get(i1).raw.al }, { x: data.get(i2).dt, y: data.get(i2).raw.al }]);

						var sdPeaks = new ArrayMapper(peaks,
						{
							d: (m) => { let pt = { x: m.m.dt / sdx, y: m.v / sdy }; return (sdLine1.isBelowPoint(pt) ? 1 : -1) * sdLine1.distanceTo(pt) },
						});
						var sdPeaks_distanceSorted = sdPeaks.sortedArray((l, r) => sdPeaks.valueOf(r, "d") - sdPeaks.valueOf(l, "d"));
						if (sdPeaks_distanceSorted.length < 1) continue;
						var peak = sdPeaks_distanceSorted[0];
						resistanceLine = LinearFunction.buildLineFromPointSlope({ x: peak.m.dt, y: peak.m.raw.bh }, supportLine.slope);

						dps.push(sdValleys_distanceSorted[0]);
						dps.push(sdValleys_distanceSorted[1]);
						dps.push(sdValleys_distanceSorted[2]);
						dps.push(sdPeaks_distanceSorted[0]);
					}
					else
					{
						var sdPeaks = new ArrayMapper(peaks,
						{
							d: (m) => { let pt = { x: m.m.dt / sdx, y: m.v / sdy }; return (sdTrendLine.isBelowPoint(pt) ? 1 : -1) * sdTrendLine.distanceTo(pt) },
						});
						var sdPeaks_distanceSorted = sdPeaks.sortedArray((l, r) => sdPeaks.valueOf(r, "d") - sdPeaks.valueOf(l, "d"));
						if (sdPeaks_distanceSorted.length < 3) continue;
						var i0 = sdPeaks_distanceSorted[0].i;
						var i1 = sdPeaks_distanceSorted[1].i;
						var i2 = sdPeaks_distanceSorted[2].i;
						var sdLine1 = LinearFunction.buildLineFromPoints({ x: data.get(i0).dt / sdx, y: data.get(i0).raw.bh / sdy }, { x: data.get(i1).dt / sdx, y: data.get(i1).raw.bh / sdy });
						var sdLine2 = LinearFunction.buildLineFromPoints({ x: data.get(i0).dt / sdx, y: data.get(i0).raw.bh / sdy }, { x: data.get(i2).dt / sdx, y: data.get(i2).raw.bh / sdy });
						if (sdLine1.angleWith(sdLine2) > extremumDeviationTolerance) continue;
						resistanceLine = LinearFunction.buildLineOfBestFit([{ x: data.get(i0).dt, y: data.get(i0).raw.bh }, { x: data.get(i1).dt, y: data.get(i1).raw.bh }, { x: data.get(i2).dt, y: data.get(i2).raw.bh }]);
						var sdValleys = new ArrayMapper(valleys,
						{
							d: (m) => { let pt = { x: m.m.dt / sdx, y: m.v / sdy }; return (sdLine1.isBelowPoint(pt) ? -1 : 1) * sdLine1.distanceTo(pt) },
						});
						var sdValleys_distanceSorted = sdValleys.sortedArray((l, r) => sdValleys.valueOf(r, "d") - sdValleys.valueOf(l, "d"));
						if (sdValleys_distanceSorted.length < 1) continue;
						var valley = sdValleys_distanceSorted[0];
						supportLine = LinearFunction.buildLineFromPointSlope({ x: valley.m.dt, y: valley.m.raw.al }, resistanceLine.slope);

						dps.push(sdPeaks_distanceSorted[0]);
						dps.push(sdPeaks_distanceSorted[1]);
						dps.push(sdPeaks_distanceSorted[2]);
						dps.push(sdValleys_distanceSorted[0]);
					}

					var spread = resistanceLine.calc(range.min) - supportLine.calc(range.min);

					var sdyTolerance = 0.3;
					if (spread > (2 + sdyTolerance) * sdy || spread < (2 - sdyTolerance) * sdy)
					{
						supportLine = null;
						resistanceLine = null;
						continue;
					}

					if (dp.raw.al - supportLine.calc(dp.raw.dt) < 0 || dp.raw.bh - resistanceLine.calc(dp.raw.dt) > 0)
					{
						supportLine = null;
						resistanceLine = null;
						continue;
					}

					if (sdTrendLine.angleWith(LinearFunction.buildScaledLine(supportLine, 1 / sdx, 1 / sdy)) > Math.PI / 175)
					{
						supportLine = null;
						resistanceLine = null;
						continue;
					}

					//if (Math.sign(trendLine.a) != Math.sign(supportLine.a))
					//{
					//	supportLine = null;
					//	resistanceLine = null;
					//	continue;
					//}

					var arm1 = new ArrayMapper(ArrayView.wrap(dps).sortedArray((l, r) => l.m.dt - r.m.dt), {dt: (m) => m.m.dt});
					var startDp = arm1.firstMin("dt").m;

					if (draw)
					{
						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = range.min;
						lineMarker.modelY0 = supportLine.calc(lineMarker.modelX0);
						lineMarker.modelX1 = range.max + 1.5 * range.length;
						lineMarker.modelY1 = supportLine.calc(lineMarker.modelX1);
						lineMarker.lineStyle.color = "black";
						lineMarker.lineStyle.width = 0.5;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = range.min;
						lineMarker.modelY0 = resistanceLine.calc(lineMarker.modelX0);
						lineMarker.modelX1 = range.max + 1.5 * range.length;
						lineMarker.modelY1 = resistanceLine.calc(lineMarker.modelX1);
						lineMarker.lineStyle.color = "black";
						lineMarker.lineStyle.width = 0.5;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = range.min;
						lineMarker.modelY0 = (supportLine.calc(lineMarker.modelX0) + resistanceLine.calc(lineMarker.modelX0)) / 2;
						lineMarker.modelX1 = range.max + 1.5 * range.length;
						lineMarker.modelY1 = (supportLine.calc(lineMarker.modelX1) + resistanceLine.calc(lineMarker.modelX1)) / 2;
						lineMarker.lineStyle.color = "black";
						lineMarker.lineStyle.strokeStyle = "dashed";
						lineMarker.lineStyle.width = 0.5;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = range.min;
						lineMarker.modelY0 = (supportLine.calc(lineMarker.modelX0) + resistanceLine.calc(lineMarker.modelX0)) / 2 - sdy;
						lineMarker.modelX1 = range.max + 1.5 * range.length;
						lineMarker.modelY1 = (supportLine.calc(lineMarker.modelX1) + resistanceLine.calc(lineMarker.modelX1)) / 2 - sdy;
						lineMarker.lineStyle.color = "red";
						lineMarker.lineStyle.strokeStyle = "dotted";
						lineMarker.lineStyle.width = 0.5;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = range.min;
						lineMarker.modelY0 = (supportLine.calc(lineMarker.modelX0) + resistanceLine.calc(lineMarker.modelX0)) / 2 + sdy;
						lineMarker.modelX1 = range.max + 1.5 * range.length;
						lineMarker.modelY1 = (supportLine.calc(lineMarker.modelX1) + resistanceLine.calc(lineMarker.modelX1)) / 2 + sdy;
						lineMarker.lineStyle.color = "red";
						lineMarker.lineStyle.strokeStyle = "dotted";
						lineMarker.lineStyle.width = 0.5;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
					}
					//log(999, arm1.toArray(), arm1);
					return new ForexChannelV7(
					{
						extremums: arm1.toArray(),
						startDp: startDp,
						endDp: null,
						supportLine: supportLine,
						resistanceLine: resistanceLine,
						spread: spread,
						direction: Math.sign(supportLine.a),
						sdy: sdy,
					});
				}
			}
			return null;
		}.bind(this);

		//z(data, true);

		if (true)
		{
			var draw_indicator_msdy = function (channel, maxConcurrentChannelCount)
			{
				if (!channel.msdy) return;
				let vdata = channel.msdy.emsdy;
				const range = Sample.stat(vdata, "y").range;

				var lineMarker = new ChartLineMarker(newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
				lineMarker.modelX0 = vdata[0].dt;
				lineMarker.modelY0 = channel.concurrencyId + (channel.sdy - range.min) / range.length;
				lineMarker.modelX1 = vdata[vdata.length - 1].dt;
				lineMarker.modelY1 = lineMarker.modelY0;
				lineMarker.lineStyle.color = "gray";
				lineMarker.lineStyle.strokeStyle = "dashed";
				lineMarker.lineStyle.width = 0.5;
				this._indicatorChartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

				var lineMarker = new ChartLineMarker(newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
				lineMarker.modelX0 = vdata[0].dt;
				lineMarker.modelY0 = channel.concurrencyId + (channel.msdy.detectionLevel - range.min) / range.length;
				lineMarker.modelX1 = vdata[vdata.length - 1].dt;
				lineMarker.modelY1 = lineMarker.modelY0;
				lineMarker.lineStyle.color = "red";
				lineMarker.lineStyle.strokeStyle = "dashed";
				lineMarker.lineStyle.width = 0.5;
				this._indicatorChartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

				var dataSource = new ChartDataSource_Buffer(newLUID());
				var lineSeries = new ChartLineSeries(newLUID(), 5050, this._indicatorTimeAxis, this._indicatorValueAxis, "dt", "y", dataSource);
				lineSeries.lineStyle.color = "green";
				this._indicatorChartVisual.scene.series.add(lineSeries);
				ChartStyleSheet.defaultSceneStyle.applyToSeries(lineSeries);
				for (var klength = vdata.length, k = 0; k < klength; ++k)
				{
					var kitem = vdata[k];
					var kyNorm = (kitem.y - range.min) / range.length;
					dataSource.add({ dt: kitem.dt, y: channel.concurrencyId + kyNorm });
				}

				var emsdyPlusDataSource = new ChartDataSource_Buffer(newLUID());
				var emsdyPlusLineSeries = new ChartLineSeries("emsdy_" + newLUID(), 5050, this._timeAxis, this._valueAxis, "dt", "y", emsdyPlusDataSource);
				emsdyPlusLineSeries.lineStyle.color = "red";
				//emsdyPlusLineSeries.lineStyle.strokeStyle = "dotted";
				this._chartVisual.scene.series.add(emsdyPlusLineSeries);
				ChartStyleSheet.defaultSceneStyle.applyToSeries(emsdyPlusLineSeries);

				var emsdyMinusDataSource = new ChartDataSource_Buffer(newLUID());
				var emsdyMinusLineSeries = new ChartLineSeries("emsdy_" + newLUID(), 5050, this._timeAxis, this._valueAxis, "dt", "y", emsdyMinusDataSource);
				emsdyMinusLineSeries.lineStyle.color = "red";
				//emsdyMinusLineSeries.lineStyle.strokeStyle = "dotted";
				this._chartVisual.scene.series.add(emsdyMinusLineSeries);
				ChartStyleSheet.defaultSceneStyle.applyToSeries(emsdyMinusLineSeries);

				for (var klength = vdata.length, k = 0; k < klength; ++k)
				{
					var kitem = vdata[k];
					if (kitem.dt < channel.detectionDp.dt) continue;
					var pivotValue = (channel.supportLine.calc(kitem.dt) + channel.resistanceLine.calc(kitem.dt)) / 2
					emsdyPlusDataSource.add({ dt: kitem.dt, y: pivotValue + kitem.y });
					emsdyMinusDataSource.add({ dt: kitem.dt, y: pivotValue - kitem.y });
				}
			}.bind(this);

			var draw_indicator_ema = function (channel, maxConcurrentChannelCount)
			{
				if (!channel.ema) return;

				let vdata = channel.ema;
				//vdata = Sample.derivative(vdata, "dt", "y");
				const range = Sample.stat(vdata, "y").range;
				var lineMarker = new ChartLineMarker(newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
				lineMarker.modelX0 = vdata[0].dt;
				lineMarker.modelY0 = channel.concurrencyId - range.min / range.length;
				lineMarker.modelX1 = vdata[vdata.length - 1].dt;
				lineMarker.modelY1 = channel.concurrencyId - range.min / range.length;
				lineMarker.lineStyle.color = "gray";
				lineMarker.lineStyle.strokeStyle = "dashed";
				lineMarker.lineStyle.width = 0.5;
				this._indicatorChartVisual.scene.markers.add(lineMarker);

				//	TODO: draw the emsdy distances in the main chart
				//	TODO: maybe test channel detection based on emsdy instead of sdy when matching sdy to channel spread

				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				var dataSource = new ChartDataSource_Buffer(newLUID());
				var lineSeries = new ChartLineSeries(newLUID(), 5050, this._indicatorTimeAxis, this._indicatorValueAxis, "dt", "y", dataSource);
				lineSeries.lineStyle.color = "lawngreen";
				this._indicatorChartVisual.scene.series.add(lineSeries);
				ChartStyleSheet.defaultSceneStyle.applyToSeries(lineSeries);
				var lastKy = null;
				for (var klength = vdata.length, k = 0; k < klength; ++k)
				{
					var kitem = vdata[k];
					var kyNorm = (kitem.y - range.min) / range.length;
					dataSource.add({ dt: kitem.dt, y: channel.concurrencyId + kyNorm });
					if (lastKy !== null)
					{
						var isPeak = false;
						var isValley = false;
						switch (channel.direction)
						{
							case -1:
							case 1:
								isPeak = (Math.sign(lastKy) == 1 && Math.sign(kitem.y) == -1);
								isValley = (Math.sign(lastKy) == -1 && Math.sign(kitem.y) == 1);
								break;
						}
						if (isPeak || isValley)
						{
							var pointMarker1 = new ChartPointMarker(newLUID(), this._indicatorTimeAxis, this._indicatorValueAxis, true);
							pointMarker1.modelX = kitem.dt;
							pointMarker1.modelY = channel.concurrencyId + (kitem.y - range.min) / range.length;
							pointMarker1.color = isPeak ? "blue" : "red";
							pointMarker1.lineStyle.color = isPeak ? "blue" : "red";
							pointMarker1.lineStyle.width = 0.5;
							pointMarker1.size = 1;
							this._indicatorChartVisual.scene.markers.add(pointMarker1);
							ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
						}
					}
					lastKy = kitem.y;
				}
			}.bind(this);

			var draw = function (channels, maxConcurrentChannelCount)
			{
				this._indicatorValueAxis.dataRange.setBounds(0, maxConcurrentChannelCount);

				for (var length = channels.length, i = 0; i < length; ++i)
				{
					var channel = channels[i];

					const nxyr = Sample.calcNormalXYRatio_EURUSD(channel.baseDurationMs);
					const normalizedSupportLine = LinearFunction.buildScaledLine(channel.supportLine, 1, nxyr);
					let angle = (normalizedSupportLine.a >= 0 ? 180 * (normalizedSupportLine.angle / Math.PI) : -180 * (1 - normalizedSupportLine.angle / Math.PI));

					let red;
					let green;
					let blue;
					try
					{
						var anglem = Math.abs(angle);
						var angles = Math.sign(angle);
						if (angle > 0)
						{
							red = 255;
							green = blue = (1 - anglem / 90) * 255;
						}
						else if (angle < 0)
						{
							blue = 255;
							green = red = (1 - anglem / 90) * 255;
						}
						else
						{
							green = red = blue = 128;
						}
					}
					catch (ex)
					{
						log(94573736, ex);
						red = 0;
						green = 0;
						blue = 0;
					}
					const ccCssColor = "rgb(" + red + ", " + green + ", " + blue + ")";

					var stardDt = channel.startDp.dt;
					var endDt = channel.endDp ? channel.endDp.dt : channel.longEndDp ? channel.longEndDp.dt : range.max;

					//	indicators
					draw_indicator_msdy(channel, maxConcurrentChannelCount);
					draw_indicator_ema(channel, maxConcurrentChannelCount);

					//	extremums
					for (var klength = channel.extremums.length, k = 0; k < klength; ++k)
					{
						var kitem = channel.extremums[k];
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = kitem.m.dt;
						pointMarker1.modelY = kitem.v;
						pointMarker1.color = "cyan";
						pointMarker1.lineStyle.color = "magenta";
						pointMarker1.lineStyle.width = 1;
						pointMarker1.size = 2.5;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}

					//	support
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = channel.supportLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = ccCssColor;
					lineMarker.lineStyle.strokeStyle = "solid";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	resistance
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = channel.resistanceLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = ccCssColor;
					lineMarker.lineStyle.strokeStyle = "solid";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	pivot
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2;
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2;
					lineMarker.lineStyle.color = ccCssColor;
					lineMarker.lineStyle.strokeStyle = "dashed";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	-quarter spread
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2 - channel.spread / 4;
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2 - channel.spread / 4;
					lineMarker.lineStyle.color = "blue";
					lineMarker.lineStyle.strokeStyle = "dotted";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	+quarter spread
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2 + channel.spread / 4;
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2 + channel.spread / 4;
					lineMarker.lineStyle.color = "blue";
					lineMarker.lineStyle.strokeStyle = "dotted";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	-sdy_in
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2 - channel.sdy;
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2 - channel.sdy;
					lineMarker.lineStyle.color = "red";
					lineMarker.lineStyle.strokeStyle = "dotted";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	+sdy_in
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = stardDt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2 + channel.sdy;
					lineMarker.modelX1 = endDt;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2 + channel.sdy;
					lineMarker.lineStyle.color = "red";
					lineMarker.lineStyle.strokeStyle = "dotted";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	detection
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.detectionDp.dt;
					lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = channel.detectionDp.dt;
					lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = ccCssColor;
					lineMarker.lineStyle.strokeStyle = "solid";
					lineMarker.lineStyle.width = 1.25;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					//	long end
					if (channel.longEndDp)
					{
						log(555, channel.supportLine.calc(lineMarker.modelX0), channel.resistanceLine.calc(lineMarker.modelX1), moment.utc(channel.longEndDp.dt).toString());
						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = channel.longEndDp.dt;
						lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
						lineMarker.modelX1 = channel.longEndDp.dt;
						lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
						lineMarker.lineStyle.color = ccCssColor;
						lineMarker.lineStyle.strokeStyle = "solid";
						lineMarker.lineStyle.width = 1.25;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
					}

					if (channel.endDp)
					{
						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = channel.endDp.dt;
						lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
						lineMarker.modelX1 = channel.endDp.dt;
						lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
						lineMarker.lineStyle.color = ccCssColor;
						lineMarker.lineStyle.strokeStyle = "solid";
						lineMarker.lineStyle.width = 1;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
					}
				}
			}.bind(this);

			var step = async function step(dt0, dt1, channels, peaks, valleys, trendLine)
			{
				return new Promise(function (resolve, reject)
				{
					this._chartVisual.scene.markers.clear();

					draw(channels);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = dt0;
					lineMarker.modelY0 = trendLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = dt1;
					lineMarker.modelY1 = trendLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = "red";
					lineMarker.lineStyle.width = 1;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = dt0;
					lineMarker.modelY0 = Number.MIN_SAFE_INTEGER;
					lineMarker.modelX1 = dt0;
					lineMarker.modelY1 = Number.MAX_SAFE_INTEGER;
					lineMarker.lineStyle.color = "black";
					lineMarker.lineStyle.width = 1;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = dt1;
					lineMarker.modelY0 = Number.MIN_SAFE_INTEGER;
					lineMarker.modelX1 = dt1;
					lineMarker.modelY1 = Number.MAX_SAFE_INTEGER;
					lineMarker.lineStyle.color = "black";
					lineMarker.lineStyle.width = 1;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					for (var klength = peaks.length, k = 0; k < klength; ++k)
					{
						var kitem = peaks[k];
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = kitem.m.dt;
						pointMarker1.modelY = kitem.v;
						pointMarker1.color = "magenta";
						pointMarker1.lineStyle.color = "magenta";
						pointMarker1.lineStyle.width = 1;
						pointMarker1.size = 1.5;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}

					for (var klength = valleys.length, k = 0; k < klength; ++k)
					{
						var kitem = valleys[k];
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = kitem.m.dt;
						pointMarker1.modelY = kitem.v;
						pointMarker1.color = "magenta";
						pointMarker1.lineStyle.color = "magenta";
						pointMarker1.lineStyle.width = 1;
						pointMarker1.size = 1.5;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}

					this._chartVisual.refresh();
					return window.setTimeout(resolve, 0);
				}.bind(this));
			}.bind(this);

			log(666, "Running simulation (client-side)...");
			console.time("ForexLandscapeShaperV7");
			var shaper = new ForexLandscapeShaperV7(
			{
				windowDpCount: 2 * 60,
				pageSizeMs: 12 * 60 * 60 * 1000,
			});

			const dataRange = new Range(Math.round(range.min), Math.round(range.max));
			const dbChannel = app.db.getChannel(this._instrumentId, sampleIntervalDef);
			await dbChannel.ensureRange(dataRange.roundUp(0.5));
			const data_range = dbChannel.getRawDataInRange(dataRange.roundUp(0.5));
			const data_pre = await dbChannel.lookupDataPoints({ dt: dataRange.min, count: shaper.extremumVicinity, pageSizeMs: shaper.pageSizeMs, lookBack: true, acceptEqual: true });
			const data = data_pre.concat(data_range);

			const shapeOutcome = await shaper.shape(data);
			const analyseOutcome = shaper.analyseChannels(shapeOutcome);
			console.timeEnd("ForexLandscapeShaperV7");
			log(911, shapeOutcome, analyseOutcome);
			draw(shapeOutcome.channels, analyseOutcome.maxConcurrentChannelCount);

			console.time("GetForexTickDataCompact");
			var response = await app.client.Data.GetForexTickDataCompact(
			{
				querystring:
				{
					pid: this._instrumentId,
					start: shapeOutcome.data[0].dt,
					end: shapeOutcome.data[shapeOutcome.data.length - 1].dt,
					compact: true,
				}
			});
			if (!response.success) { log(7808734, response.errors); throw "Database operation error."; }
			console.timeEnd("GetForexTickDataCompact");
			const compactTickData = response.value;
			log(922, compactTickData);

			console.time("Simulator.ticktrade");
			var tickIterator = async function* ()
			{
				for (let coll = compactTickData.arr, length = coll.length, i = 0; i < length; i += 3) yield { dt: compactTickData.dt + coll[i], ask: coll[i + 1], bid: coll[i + 2] };
			}();

			const tradeEngine = new ForexTradeEngineV7(
			{
				sampleIntervalDef: this._sampleIntervalDef,
				config_windowSize_sampledDps: 2,
				config_windowSize_extremums: 1,
				config_windowSize_movements: 1,
				config_vicinity: 0.1,
				prebuilt_sampledDp: shapeOutcome.data,
				prebuilt_valleys: shapeOutcome.extremumInfo.valleys,
				prebuilt_peaks: shapeOutcome.extremumInfo.peaks,
				prebuilt_channels: shapeOutcome.channels,
			});

			var testMarket = async function (clientTick)
			{
				tradeEngine.clientTick(clientTick);

				if (tradeEngine.changes.sampledDp_added)
				{
					var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					pointMarker.modelX = clientTick.dt;
					pointMarker.modelY = tradeEngine.changes.sampledDp_added.ask;
					pointMarker.color = "darkkhaki";
					pointMarker.lineStyle.color = "black";
					pointMarker.lineStyle.width = 0.25;
					pointMarker.lineStyle.strokeStyle = "dotted";
					pointMarker.size = 1.1;
					this._chartVisual.scene.markers.add(pointMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
					
					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = clientTick.dt;
					lineMarker.modelY0 = tradeEngine.changes.sampledDp_added.ask
					lineMarker.modelX1 = tradeEngine.changes.sampledDp_added.dt;
					lineMarker.modelY1 = tradeEngine.changes.sampledDp_added.ask;
					lineMarker.lineStyle.color = "gray";
					lineMarker.lineStyle.width = 0.5;
					lineMarker.lineStyle.strokeStyle = "dotted";
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					pointMarker.modelX = clientTick.dt;
					pointMarker.modelY = tradeEngine.changes.sampledDp_added.bid;
					pointMarker.color = "darkkhaki";
					pointMarker.lineStyle.color = "black";
					pointMarker.lineStyle.width = 0.25;
					pointMarker.lineStyle.strokeStyle = "dotted";
					pointMarker.size = 1.1;
					this._chartVisual.scene.markers.add(pointMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = clientTick.dt;
					lineMarker.modelY0 = tradeEngine.changes.sampledDp_added.bid
					lineMarker.modelX1 = tradeEngine.changes.sampledDp_added.dt;
					lineMarker.modelY1 = tradeEngine.changes.sampledDp_added.bid;
					lineMarker.lineStyle.color = "gray";
					lineMarker.lineStyle.width = 0.5;
					lineMarker.lineStyle.strokeStyle = "dotted";
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				}

				//if (tradeEngine.changes.extremum_added)
				//{
				//	const pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	pointMarker.modelX = clientTick.dt;
				//	pointMarker.modelY = tradeEngine.changes.extremum_added.v;
				//	pointMarker.color = tradeEngine.changes.extremum_added.t == 1 ? "red" : "blue";
				//	pointMarker.lineStyle.color = tradeEngine.changes.extremum_added.t == 1 ? "red" : "blue";
				//	pointMarker.lineStyle.width = 0.5;
				//	pointMarker.size = 1.5;
				//	this._chartVisual.scene.markers.add(pointMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);

				//	var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	lineMarker.modelX0 = clientTick.dt;
				//	lineMarker.modelY0 = tradeEngine.changes.extremum_added.v
				//	lineMarker.modelX1 = tradeEngine.changes.extremum_added.m.dt;
				//	lineMarker.modelY1 = tradeEngine.changes.extremum_added.v;
				//	lineMarker.lineStyle.color = tradeEngine.changes.extremum_added.t == 1 ? "red" : "blue";
				//	lineMarker.lineStyle.width = 0.5;
				//	this._chartVisual.scene.markers.add(lineMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				//}

				//if (tradeEngine.changes.movement_added)
				//{
				//	var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	pointMarker.modelX = tradeEngine.changes.movement_added.first.ddt;
				//	pointMarker.modelY = tradeEngine.changes.movement_added.first.ask;
				//	pointMarker.color = tradeEngine.changes.movement_added.directiona == 1 ? "purple" : "green";
				//	pointMarker.lineStyle.color = pointMarker.color;
				//	pointMarker.lineStyle.width = 0.25;
				//	pointMarker.size = 1;
				//	this._chartVisual.scene.markers.add(pointMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);

				//	var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	pointMarker.modelX = tradeEngine.changes.movement_added.last.ddt;
				//	pointMarker.modelY = tradeEngine.changes.movement_added.last.ask;
				//	pointMarker.color = tradeEngine.changes.movement_added.directiona == 1 ? "purple" : "green";
				//	pointMarker.lineStyle.color = pointMarker.color;
				//	pointMarker.lineStyle.width = 0.25;
				//	pointMarker.size = 1;
				//	this._chartVisual.scene.markers.add(pointMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);

				//	var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	lineMarker.modelX0 = tradeEngine.changes.movement_added.first.ddt;
				//	lineMarker.modelY0 = tradeEngine.changes.movement_added.linedefa.calc(lineMarker.modelX0);
				//	lineMarker.modelX1 = tradeEngine.changes.movement_added.last.ddt;
				//	lineMarker.modelY1 = tradeEngine.changes.movement_added.linedefa.calc(lineMarker.modelX1);
				//	lineMarker.lineStyle.color = pointMarker.color;
				//	lineMarker.lineStyle.strokeStyle = "dashed";
				//	lineMarker.lineStyle.width = 0.5;
				//	this._chartVisual.scene.markers.add(lineMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

				//	var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	pointMarker.modelX = tradeEngine.changes.movement_added.first.ddt;
				//	pointMarker.modelY = tradeEngine.changes.movement_added.first.bid;
				//	pointMarker.color = tradeEngine.changes.movement_added.directionb == 1 ? "purple" : "green";
				//	pointMarker.lineStyle.color = pointMarker.color;
				//	pointMarker.lineStyle.width = 0.25;
				//	pointMarker.size = 1;
				//	this._chartVisual.scene.markers.add(pointMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);

				//	var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	pointMarker.modelX = tradeEngine.changes.movement_added.last.ddt;
				//	pointMarker.modelY = tradeEngine.changes.movement_added.last.bid;
				//	pointMarker.color = tradeEngine.changes.movement_added.directionb == 1 ? "purple" : "green";
				//	pointMarker.lineStyle.color = pointMarker.color;
				//	pointMarker.lineStyle.width = 0.25;
				//	pointMarker.size = 1;
				//	this._chartVisual.scene.markers.add(pointMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);

				//	var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				//	lineMarker.modelX0 = tradeEngine.changes.movement_added.first.ddt;
				//	lineMarker.modelY0 = tradeEngine.changes.movement_added.linedefb.calc(lineMarker.modelX0);
				//	lineMarker.modelX1 = tradeEngine.changes.movement_added.last.ddt;
				//	lineMarker.modelY1 = tradeEngine.changes.movement_added.linedefb.calc(lineMarker.modelX1);
				//	lineMarker.lineStyle.color = pointMarker.color;
				//	lineMarker.lineStyle.strokeStyle = "dashed";
				//	lineMarker.lineStyle.width = 0.5;
				//	this._chartVisual.scene.markers.add(lineMarker);
				//	ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				//}

				if (tradeEngine.changes.channels_changed.length)
				{
					const kcoll = tradeEngine.changes.channels_changed;
					for (let klength = kcoll.length, k = 0; k < klength; ++k)
					{
						const kitem = kcoll[k];

						////switch (kitem.extremumLocation_added)
						////switch (kitem.sampledDpPriceLocation_added)
						//switch (kitem.clientTickPriceLocation_added)
						//{
						//	case EForexChannelLocationV7.ResistanceVicinity_Inside:
						//		var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		pointMarker.modelX = clientTick.dt;
						//		pointMarker.modelY = clientTick.bid;
						//		pointMarker.lineStyle.width = 0.25;
						//		pointMarker.color = "red";
						//		pointMarker.lineStyle.color = pointMarker.color;
						//		pointMarker.size = 2.5;
						//		this._chartVisual.scene.markers.add(pointMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
						//		break;
						//	case EForexChannelLocationV7.ResistanceVicinity_Outside:
						//		var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		pointMarker.modelX = clientTick.dt;
						//		pointMarker.modelY = clientTick.bid;
						//		pointMarker.lineStyle.width = 0.25;
						//		pointMarker.color = "blue";
						//		pointMarker.lineStyle.color = pointMarker.color;
						//		pointMarker.size = 2.5;
						//		this._chartVisual.scene.markers.add(pointMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
						//		break;
						//	case EForexChannelLocationV7.SupportVicinity_Inside:
						//		var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		pointMarker.modelX = clientTick.dt;
						//		pointMarker.modelY = clientTick.ask;
						//		pointMarker.lineStyle.width = 0.25;
						//		pointMarker.color = "red";
						//		pointMarker.lineStyle.color = pointMarker.color;
						//		pointMarker.size = 2.5;
						//		this._chartVisual.scene.markers.add(pointMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
						//		break;
						//	case EForexChannelLocationV7.SupportVicinity_Outside:
						//		var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		pointMarker.modelX = clientTick.dt;
						//		pointMarker.modelY = clientTick.ask;
						//		pointMarker.lineStyle.width = 0.25;
						//		pointMarker.color = "blue";
						//		pointMarker.lineStyle.color = pointMarker.color;
						//		pointMarker.size = 2.5;
						//		this._chartVisual.scene.markers.add(pointMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
						//		break;
						//	case EForexChannelLocationV7.Inside:
						//		var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		lineMarker.modelX0 = clientTick.dt;
						//		lineMarker.modelY0 = clientTick.ask;
						//		lineMarker.modelX1 = clientTick.dt;
						//		lineMarker.modelY1 = clientTick.bid;
						//		lineMarker.lineStyle.color = "lawngreen";
						//		lineMarker.lineStyle.width = 2.75;
						//		this._chartVisual.scene.markers.add(lineMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
						//		break;
						//	case EForexChannelLocationV7.Above:
						//		var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		pointMarker.modelX = clientTick.dt;
						//		pointMarker.modelY = clientTick.bid;
						//		pointMarker.lineStyle.width = 0.25;
						//		pointMarker.color = "mediumorchid";
						//		pointMarker.lineStyle.color = pointMarker.color;
						//		pointMarker.size = 2.5;
						//		this._chartVisual.scene.markers.add(pointMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
						//		break;
						//	case EForexChannelLocationV7.Below:
						//		var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						//		pointMarker.modelX = clientTick.dt;
						//		pointMarker.modelY = clientTick.ask;
						//		pointMarker.lineStyle.width = 0.25;
						//		pointMarker.color = "fuchsia";
						//		pointMarker.lineStyle.color = pointMarker.color;
						//		pointMarker.size = 2.5;
						//		this._chartVisual.scene.markers.add(pointMarker);
						//		ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
						//		break;
						//	default: break;
						//}

						if (kitem.movementCrossing_added)
						{
							switch (kitem.movementCrossing_added.location)
							{
								case EForexChannelLocationV7.Support_Inward:
								case EForexChannelLocationV7.Resistance_Inward:
									var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
									pointMarker.modelX = kitem.movementCrossing_added.point.x;
									pointMarker.modelY = kitem.movementCrossing_added.point.y;
									pointMarker.lineStyle.width = 1.25;
									pointMarker.color = "black";
									pointMarker.lineStyle.color = "red";
									pointMarker.size = 2.75;
									this._chartVisual.scene.markers.add(pointMarker);
									ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
									break;
								case EForexChannelLocationV7.Support_Outward:
								case EForexChannelLocationV7.Resistance_Outward:
									var pointMarker = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
									pointMarker.modelX = kitem.movementCrossing_added.point.x;
									pointMarker.modelY = kitem.movementCrossing_added.point.y;
									pointMarker.lineStyle.width = 1.25;
									pointMarker.color = "black";
									pointMarker.lineStyle.color = "lawngreen";
									pointMarker.size = 2.75;
									this._chartVisual.scene.markers.add(pointMarker);
									ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker);
									break;
								default: break;
							}
						}
					}
				}

				return null;
			}.bind(this);

			var testPosition = async function (clientTick, position)
			{
				return null;
			}.bind(this);

			var positionOpen = function (position, info)
			{
				var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = position.opening.executionTick.dt;
				pointMarker1.modelY = position.opening.price;
				pointMarker1.color = "white";
				pointMarker1.lineStyle.color = "green";
				pointMarker1.lineStyle.width = 0.6;
				pointMarker1.size = 2;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
				log(5551, "positionOpened", position, info);
			}.bind(this);

			var positionClose = function (position, info)
			{
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = position.opening.executionTick.dt;
				lineMarker.modelY0 = position.opening.price;
				lineMarker.modelX1 = position.closing.executionTick.dt;
				lineMarker.modelY1 = position.closing.price;
				lineMarker.lineStyle.color = Math.sign(position.movement) >= 0 ? "lawngreen" : "red";
				lineMarker.lineStyle.width = 1.5;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				log(5552, "positionClosed", position.closeReason, position, info);
			}.bind(this);

			var tradeResult = await (new Simulator()).ticktrade(
			{
				tickIterator: tickIterator,
				testMarket: testMarket,
				testPosition: testPosition,
				makeSystemLatency: null,
				makeClientLatency: null,
				positionOpen: positionOpen,
				positionClose: positionClose,
			});
			console.timeEnd("Simulator.ticktrade");
			log(933, "tradeResult", tradeResult);
			log(944, "done.");
		}

		if (false)
		{
			log(666, "Running simulation...");

			range = new Range(Math.round(range.min), Math.round(range.max));
			var dbTickChannel = app.db.getChannel(this._instrumentId, null);
			var tickIterator = async function* ()
			{
				var dp = await dbTickChannel.lookupDataPoint({ dt: range.min, pageSizeMs: 20 * 60 * 1000, acceptEqual: true });
				do
				{
					yield dp;
				} while ((dp = await dbTickChannel.lookupDataPoint({ dt: dp.dt, pageSizeMs: 20 * 60 * 1000 })) && dp.dt < range.max);
			}.bind(this)();

			var windowDpCount = 4 * 60;	//	4h in 1 min resolution
			var windowData = await dbChannel.lookupDataPoints({ dt: range.min, count: windowDpCount, pageSizeMs: 60 * 60 * 1000, lookBack: true, acceptEqual: true });
			windowData.push(await dbChannel.lookupDataPoint({ dt: range.min, pageSizeMs: 60 * 60 * 1000 }));
			var windowDataDirty = false;
			var arv = new ArrayView(windowData, 0, windowDpCount);

			var currentChannels = new HashSet();
			var channels = [];

			var testMarket = async function (clientTick)
			{
				if (clientTick.dt >= windowData[windowData.length - 1].dt)
				{
					windowData.shift();
					windowData.push(await dbChannel.lookupDataPoint({ dt: windowData[windowData.length - 1].dt, pageSizeMs: 60 * 60 * 1000 }));
					windowDataDirty = true;
				}

				if (windowDataDirty)
				{
					if (currentChannels.length)
					{
						var currentChannels_mod = new HashSet();
						var pointer, iterator = currentChannels.getIterator();
						while (!(pointer = iterator.next()).done)
						{
							var channel = pointer.value;
							if (channel.supportLine.calc(clientTick.dt) - clientTick.ask > channel.spread / 2 || clientTick.bid - channel.resistanceLine.calc(clientTick.dt) > channel.spread / 2)
							{
								channel.endDp = clientTick;
								continue;
							}
							currentChannels_mod.set(channel);
						}
						currentChannels = currentChannels_mod;
					}

					if (!currentChannels.length)
					{
						var channel = z(arv, false);
						if (channel)
						{
							if (!currentChannels.has(channel))
							{
								channel.detectionDp = clientTick;
								currentChannels.set(channel);
								channels.push(channel);
							}
							else
							{
								log(777, "channel discarded", channel.getHashCode(), ArrayView.wrap(channel.extremums).toArray("m"), channel);
							}
						}
					}
					windowDataDirty = false;

					if (currentChannels.length)
					{
						var result = [];
						var channel = currentChannels.toArray()[0];

						if (channel.spread < 10 * (clientTick.ask - clientTick.bid)) return null;

						var direction = channel.direction;
						var rdpy = channel.resistanceLine.calc(clientTick.dt);
						var sdpy = channel.supportLine.calc(clientTick.dt);
						var mdpy = (rdpy + sdpy) / 2;

						var et = Sample.classifyExtremum(new ArrayMapper(arv, { y: (m) => m.raw.ah }, null, arv.length - 3, 3), "y");
						//var cdp = arv.get(arv.length - 2);
						var cdp = clientTick;
						var crdpy = channel.resistanceLine.calc(cdp.dt);
						var csdpy = channel.supportLine.calc(cdp.dt);
						if (et > 0 && cdp.ask > crdpy - 0.125 * channel.spread && cdp.ask < crdpy + 0.125 * channel.spread)
						{
							result.push(
							{
								type: "sell",
								stopLoss: rdpy + 0.5 * channel.spread,
								trailingStopLossDistance: channel.spread / 2.2,
								takeProfit: clientTick.ask - channel.spread / (direction > 0 ? 3.2 : 2.6),
								tag: { kind: 1, channel: channel, },
							});
						}
						var et = Sample.classifyExtremum(new ArrayMapper(arv, { y: (m) => m.raw.bl }, null, arv.length - 3, 3), "y");
						//var cdp = arv.get(arv.length - 2);
						var cdp = clientTick;
						var crdpy = channel.resistanceLine.calc(cdp.dt);
						var csdpy = channel.supportLine.calc(cdp.dt);
						if (et < 0 && cdp.bid > csdpy - 0.125 * channel.spread && cdp.bid < csdpy + 0.125 * channel.spread)
						{
							result.push(
							{
								type: "buy",
								stopLoss: sdpy - 0.5 * channel.spread,
								trailingStopLossDistance: channel.spread / 2.2,
								takeProfit: clientTick.bid + channel.spread / (direction < 0 ? 3.2 : 2.6),
								tag: { kind: 1, channel: channel, },
							});
						}

						var pdp = arv.get(arv.length - 2);
						if ((pdp.bid < mdpy && clientTick.bid >= mdpy || pdp.bid <= mdpy && clientTick.bid > mdpy) && clientTick.bid < crdpy - channel.spread / 1.75)
						{
							result.push(
							{
								type: "buy",
								stopLoss: mdpy,
								trailingStopLossDistance: channel.spread / 2.2,
								takeProfit: clientTick.bid + channel.spread / (direction > 0 ? 5 : 4),
								tag: { kind: 2, channel: channel, },
							});
						}
						if ((pdp.ask > mdpy && clientTick.ask <= mdpy || pdp.ask >= mdpy && clientTick.ask < mdpy) && clientTick.ask > csdpy + channel.spread / 1.75)
						{
							result.push(
							{
								type: "sell",
								stopLoss: mdpy,
								trailingStopLossDistance: channel.spread / 2.2,
								takeProfit: clientTick.ask - channel.spread / (direction < 0 ? 5 : 4),
								tag: { kind: 2, channel: channel, },
							});
						}

						return result;
					}
				}

				return null;
			}.bind(this);

			var testPosition = async function (clientTick, position)
			{
				var channel = position.tag.channel;
				var direction = channel.direction;
				var rdpy = channel.resistanceLine.calc(clientTick.dt);
				var sdpy = channel.supportLine.calc(clientTick.dt);
				var mdpy = (rdpy + sdpy) / 2;

				var et = Sample.classifyExtremum(new ArrayMapper(arv, { y: (m) => m.raw.ah }, null, arv.length - 3, 3), "y");
				var cdp = arv.get(arv.length - 2);
				var crdpy = channel.resistanceLine.calc(cdp.dt);
				var csdpy = channel.supportLine.calc(cdp.dt);

				switch (position.tag.kind)
				{
					case 1:
						if (position.type == "buy" && clientTick.bid <= sdpy - 0.1 * channel.spread) return "supportCrossed-";
						if (position.type == "sell" && clientTick.ask >= rdpy + 0.1 * channel.spread) return "resistanceCrossed-";
						break;
					case 2:
						if (position.type == "buy" && clientTick.bid >= rdpy - 0.1 * channel.spread) return "resistanceCrossed+";
						if (position.type == "sell" && clientTick.ask <= sdpy + 0.1 * channel.spread) return "supportCrossed+";
						break;
				}
				return null;
			}.bind(this);

			var positionOpen = function (position, info)
			{
				var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = position.opening.executionTick.dt;
				pointMarker1.modelY = position.opening.price;
				pointMarker1.color = "white";
				pointMarker1.lineStyle.color = "green";
				pointMarker1.lineStyle.width = 0.6;
				pointMarker1.size = 2;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
				log(5551, "positionOpened", position, info);
			}.bind(this);

			var positionClose = function (position, info)
			{
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = position.opening.executionTick.dt;
				lineMarker.modelY0 = position.opening.price;
				lineMarker.modelX1 = position.closing.executionTick.dt;
				lineMarker.modelY1 = position.closing.price;
				lineMarker.lineStyle.color = Math.sign(position.movement) >= 0 ? "lawngreen" : "red";
				lineMarker.lineStyle.width = 1.5;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				log(5552, "positionClosed", position.closeReason, position, info);
			}.bind(this);

			var draw = function (channels)
			{
				for (var length = channels.length, i = 0; i < length; ++i)
				{
					var channel = channels[i];

					for (var klength = channel.extremums.length, k = 0; k < klength; ++k)
					{
						var kitem = channel.extremums[k];
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = kitem.m.dt;
						pointMarker1.modelY = kitem.v;
						pointMarker1.color = "cyan";
						pointMarker1.lineStyle.color = "magenta";
						pointMarker1.lineStyle.width = 1;
						pointMarker1.size = 2.5;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.startDp.dt;
					lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = channel.endDp ? channel.endDp.dt : range.max;
					lineMarker.modelY1 = channel.supportLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = "black";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.startDp.dt;
					lineMarker.modelY0 = channel.resistanceLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = channel.endDp ? channel.endDp.dt : range.max;
					lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = "black";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.startDp.dt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2;
					lineMarker.modelX1 = channel.endDp ? channel.endDp.dt : range.max;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2;
					lineMarker.lineStyle.color = "black";
					lineMarker.lineStyle.strokeStyle = "dashed";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.startDp.dt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2 - channel.sdy;
					lineMarker.modelX1 = channel.endDp ? channel.endDp.dt : range.max;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2 - channel.sdy;
					lineMarker.lineStyle.color = "red";
					lineMarker.lineStyle.strokeStyle = "dotted";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.startDp.dt;
					lineMarker.modelY0 = (channel.supportLine.calc(lineMarker.modelX0) + channel.resistanceLine.calc(lineMarker.modelX0)) / 2 + channel.sdy;
					lineMarker.modelX1 = channel.endDp ? channel.endDp.dt : range.max;
					lineMarker.modelY1 = (channel.supportLine.calc(lineMarker.modelX1) + channel.resistanceLine.calc(lineMarker.modelX1)) / 2 + channel.sdy;
					lineMarker.lineStyle.color = "red";
					lineMarker.lineStyle.strokeStyle = "dotted";
					lineMarker.lineStyle.width = 0.5;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
					lineMarker.modelX0 = channel.detectionDp.dt;
					lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
					lineMarker.modelX1 = channel.detectionDp.dt;
					lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
					lineMarker.lineStyle.color = "magenta";
					lineMarker.lineStyle.strokeStyle = "dashed";
					lineMarker.lineStyle.width = 1;
					this._chartVisual.scene.markers.add(lineMarker);
					ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

					if (channel.endDp)
					{
						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = channel.endDp.dt;
						lineMarker.modelY0 = channel.supportLine.calc(lineMarker.modelX0);
						lineMarker.modelX1 = channel.endDp.dt;
						lineMarker.modelY1 = channel.resistanceLine.calc(lineMarker.modelX1);
						lineMarker.lineStyle.color = "cyan";
						lineMarker.lineStyle.strokeStyle = "solid";
						lineMarker.lineStyle.width = 1;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
					}
				}
			}.bind(this);

			var tradeResult = await (new Simulator()).ticktrade(
			{
				tickIterator: tickIterator,
				testMarket: testMarket,
				testPosition: testPosition,
				makeSystemLatency: null,
				makeClientLatency: null,
				positionOpen: positionOpen,
				positionClose: positionClose,
			});
			draw(channels);
			log(5555, "tradeResult", tradeResult);
		}

		if (false)
		{
			var channel = null;
			var buffer = [];
			var testMarket = function (dp, i, totalMovement, tradeCount)
			{
				buffer.push(dp);
				if (buffer.length < 3) return null;
				if (!channel)
				{
					channel = z(buffer, true);
				}
				else
				{
					if (channel.supportLine.a > 0)
					{
						if (channel.supportLine.calc(dp.dt) - dp.ask > channel.spread) channel = z(buffer, true);
					}
					else if (channel.supportLine.a < 0)
					{
						if (dp.bid - channel.resistanceLine.calc(dp.dt) > channel.spread) channel = z(buffer, true);
					}
				}

				if (!channel) return null;
				if (channel.spread < 10 * (dp.ask - dp.bid)) return null;

				//if (direction > 0)
				//{
				//}

				var result = [];

				var direction = channel.direction;
				var rdpy = channel.resistanceLine.calc(dp.dt);
				var sdpy = channel.supportLine.calc(dp.dt);
				var mdpy = (rdpy + sdpy) / 2;

				var et = Sample.classifyExtremum(new ArrayMapper(buffer, { y: (m) => m.raw.ah }, null, buffer.length - 3, 3), "y");
				var cdp = buffer[buffer.length - 2];
				var crdpy = channel.resistanceLine.calc(cdp.dt);
				var csdpy = channel.supportLine.calc(cdp.dt);
				if (et > 0 && cdp.ask > crdpy - 0.2 * channel.spread && cdp.ask < crdpy + 0.2 * channel.spread)
				{
					result.push(
					{
						type: "sell",
						stopLoss: rdpy,
						trailingStopLossDistance: channel.spread / 2.2,
						takeProfit: dp.ask - channel.spread / (direction > 0 ? 3 : 2.6),
						tag: { kind: 1, channel: channel, },
					});
				}
				if (et < 0 && cdp.bid > csdpy - 0.2 * channel.spread && cdp.bid < csdpy + 0.2 * channel.spread)
				{
					result.push(
					{
						type: "buy",
						stopLoss: sdpy,
						trailingStopLossDistance: channel.spread / 2.2,
						takeProfit: dp.bid + channel.spread / (direction < 0 ? 3 : 2.6),
						tag: { kind: 1, channel: channel, },
					});
				}

				var pdp = buffer[buffer.length - 2];
				if ((pdp.bid < mdpy && dp.bid >= mdpy || pdp.bid <= mdpy && dp.bid > mdpy) && dp.bid < crdpy - channel.spread / 2)
				{
					result.push(
					{
						type: "buy",
						stopLoss: mdpy,
						trailingStopLossDistance: channel.spread / 2.2,
						takeProfit: dp.bid + channel.spread / (direction > 0 ? 5 : 4),
						tag: { kind: 2, channel: channel, },
					});
				}
				if ((pdp.ask > mdpy && dp.ask <= mdpy || pdp.ask >= mdpy && dp.ask < mdpy) && dp.ask > csdpy + channel.spread / 2)
				{
					result.push(
					{
						type: "sell",
						stopLoss: mdpy,
						trailingStopLossDistance: channel.spread / 2.2,
						takeProfit: dp.ask - channel.spread / (direction < 0 ? 5 : 4),
						tag: { kind: 2, channel: channel, },
					});
				}


				return result;
				return [
					{
						type: "buy",
						stopLoss: dp.bid - stopLoss_spreadFactor * spread,
						trailingStopLossDistance: trailingStopLossDistance_spreadFactor * spread,
						takeProfit: dp.bid + takeProfit_spreadFactor * spread,
					},
					{
						type: "sell",
						stopLoss: dp.ask + stopLoss_spreadFactor * spread,
						trailingStopLossDistance: trailingStopLossDistance_spreadFactor * spread,
						takeProfit: dp.ask - takeProfit_spreadFactor * spread,
					}];
			}.bind(this);

			var testPosition = function (dp, i, position)
			{
				var channel = position.tag.channel;
				var direction = channel.direction;
				var rdpy = channel.resistanceLine.calc(dp.dt);
				var sdpy = channel.supportLine.calc(dp.dt);
				var mdpy = (rdpy + sdpy) / 2;

				var et = Sample.classifyExtremum(new ArrayMapper(buffer, { y: (m) => m.raw.ah }, null, buffer.length - 3, 3), "y");
				var cdp = buffer[buffer.length - 2];
				var crdpy = channel.resistanceLine.calc(cdp.dt);
				var csdpy = channel.supportLine.calc(cdp.dt);

				switch (position.tag.kind)
				{
					case 1:
						if (position.type == "buy" && dp.bid <= sdpy) return "supportCrossed-";
						if (position.type == "sell" && dp.ask >= rdpy) return "resistanceCrossed-";
						break;
					case 2:
						if (position.type == "buy" && dp.bid >= rdpy) return "resistanceCrossed+";
						if (position.type == "sell" && dp.ask <= sdpy) return "supportCrossed+";
						break;
				}
				return null;
			}.bind(this);

			var positionOpened = function (dp, i, position, totalMovement, tradeCount)
			{
				var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				pointMarker1.modelX = position.dt;
				pointMarker1.modelY = position.price;
				pointMarker1.color = "white";
				pointMarker1.lineStyle.color = "green";
				pointMarker1.lineStyle.width = 0.6;
				pointMarker1.size = 2;
				this._chartVisual.scene.markers.add(pointMarker1);
				ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
				log(5551, "positionOpened", dp, i, position, totalMovement, tradeCount);
			}.bind(this);

			var positionClosed = function (dp, i, position, closeLevel, movement, closePositionReason, totalMovement, tradeCount)
			{
				var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
				lineMarker.modelX0 = position.dt;
				lineMarker.modelY0 = position.price;
				lineMarker.modelX1 = dp.dt;
				lineMarker.modelY1 = closeLevel;
				lineMarker.lineStyle.color = Math.sign(movement) >= 0 ? "lawngreen" : "red";
				lineMarker.lineStyle.width = position.tag.kind == 2 ? 1 : 3;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				log(5552, "positionClosed", dp, i, position, movement, closePositionReason, totalMovement, tradeCount);
			}.bind(this);

			var tradeResult = new Simulator().trade(data, testMarket, testPosition, positionOpened, positionClosed);
			log(555, "tradeResult", tradeResult);
		}

		if (false)
		{
			var buffer = [];
			var channel = null;
			var totalMovement = 0;
			for (var length = data.length, i = 0; i < length; ++i)
			{
				var dp = data[i];
				buffer.push(data[i]);
				if (i < 2) continue;
				if (!channel)
				{
					channel = z(buffer, true);
				}
				else
				{
					if (channel.supportLine.a > 0)
					{
						if (channel.supportLine.calc(dp.dt) - dp.ask > channel.spread) channel = z(buffer, true);
					}
					else if (channel.supportLine.a < 0)
					{
						if (dp.bid  - channel.resistanceLine.calc(dp.dt)> channel.spread) channel = z(buffer, true);
					}
				}
			}
		}

		if (false)
		{
			var buffer = [];
			var position = null;
			var totalMovement = 0;
			for (var length = data.length, i = 0; i < length; ++i)
			{
				var dp = data[i];
				buffer.push(data[i]);
				if (i < 2) continue;

				if (position)
				{
					if (dp.bid <= position.stopLoss)
					{
						totalMovement += dp.bid - position.dp.ask;
						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = position.dp.dt;
						lineMarker.modelY0 = position.dp.ask;
						lineMarker.modelX1 = dp.dt;
						lineMarker.modelY1 = dp.bid;
						lineMarker.lineStyle.color = "red";
						lineMarker.lineStyle.width = 1.2;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
						position = null;
					}
					else if (dp.bid >= position.takeProfit)
					{
						totalMovement += dp.bid - position.dp.ask;
						var lineMarker = new ChartLineMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						lineMarker.modelX0 = position.dp.dt;
						lineMarker.modelY0 = position.dp.ask;
						lineMarker.modelX1 = dp.dt;
						lineMarker.modelY1 = dp.bid;
						lineMarker.lineStyle.color = "lawngreen";
						lineMarker.lineStyle.width = 1.2;
						this._chartVisual.scene.markers.add(lineMarker);
						ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
						position = null;
					}
				}

				if (!position)
				{
					position = z(buffer);
					if (position)
					{
						var pointMarker1 = new ChartPointMarker(newLUID(), this._timeAxis, this._valueAxis, true);
						pointMarker1.modelX = position.dp.dt;
						pointMarker1.modelY = position.dp.ask;
						pointMarker1.color = "white";
						pointMarker1.lineStyle.color = "green";
						pointMarker1.lineStyle.width = 0.6;
						pointMarker1.size = 3;
						this._chartVisual.scene.markers.add(pointMarker1);
						ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
					}
				}
			}
			log(911, totalMovement);
		}

		this._chartVisual.refresh();
		this._indicatorChartVisual.refresh();
	}


	async _updateQ2TableChart(range)
	{
		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		await dbChannel.ensureRange(range.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
		if (!data.length) return;

		var askLevels = [];
		var startMoment = moment(data[0].dt);
		var endMoment = moment(data[data.length - 1].dt);
		var currentMoment = startMoment;
		var i = 0;
		while (currentMoment.valueOf() <= endMoment)
		{
			var item = data[i];
			if (item.dt != currentMoment) askLevels.push(void (0));
			else { askLevels.push(item.ask); ++i; }

			currentMoment = EDateTimeUnit.addToMoment(currentMoment, this._sampleIntervalDef.length, this._sampleIntervalDef.unit);
		}
		var askLevelsSample = new MappedArray(askLevels);

		var resolution = 20;
		var askQ2table = askLevelsSample.q2table(resolution, 0);

		this._q2tablexAxis.dataRange.setBounds(-resolution, resolution);
		this._q2tableyAxis.dataRange.setBounds(-1, 1);

		this._q2tableChartDataSource.clear();
		for (var i = askQ2table.Q_neg.length - 1; i >= 0; --i) this._q2tableChartDataSource.add({ x: -(i + 1), y: askQ2table.Q_neg[i] });
		this._q2tableChartDataSource.add({ x: 0, y: askQ2table.Q_zero });
		for (var i = 0; i < askQ2table.Q_pos.length; ++i) this._q2tableChartDataSource.add({ x: i + 1, y: askQ2table.Q_pos[i] });
		this._secondaryChartVisual.scene.markers.clear();
		for (var length = this._q2tableChartDataSource.rawData.length, i = 0; i < length; ++i)
		{
			var item = this._q2tableChartDataSource.rawData[i];
			var pointMarker1 = new ChartPointMarker("pt" + i, this._q2tablexAxis, this._q2tableyAxis, true);
			pointMarker1.modelX = item.x;
			pointMarker1.modelY = item.y;
			pointMarker1.size = 2;
			this._secondaryChartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}
		this._secondaryChartVisual.refresh();
	}

	async _updateSdChart(range)
	{
		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		await dbChannel.ensureRange(range.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
		if (!data.length) return;

		this._sdChart.scene.markers.clear();

		var sampleAB = new MappedArray(data).map({ x: ["dt", "dt"], y: ["ask", "bid"] });
		var trendLineAB = sampleAB.lineOfBestFit("x", "y");

		var sampleA = new MappedArray(data, { x: (item) => item.raw.dt, y: (item) => item.raw.al });
		this._unsdxAxis.dataRange.setBounds(sampleA.min("x"), sampleA.max("x"));
		this._unsdyAxis.dataRange.setBounds(sampleA.min("y"), sampleA.max("y"));
		this._unsdChartDataSource.clear();
		this._unsdChartDataSource.addRange(sampleA.flatten());

		var valleysA = sampleA.extremumSamples("x", "y", { excludePeaks: true, singlePoints: true, splitLine: trendLineAB, oneSided: true }).extremums;
		for (var length = valleysA.length, i = 0; i < length; ++i)
		{
			var x = valleysA.getAt(i, "x");
			var y = valleysA.getAt(i, "y");

			var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._unsdxAxis, this._unsdyAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			pointMarker1.opacity = 1;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "blue";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.lineStyle.strokeStyle = "dotted";
			pointMarker1.size = 3;
			this._sdChart.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}
		var lineMarker = new ChartLineMarker("trendLineAB_" + newLUID(), this._unsdxAxis, this._unsdyAxis, true);
		lineMarker.modelX0 = sampleA.min("x");
		lineMarker.modelY0 = trendLineAB.calc(lineMarker.modelX0);
		lineMarker.modelX1 = sampleA.max("x");
		lineMarker.modelY1 = trendLineAB.calc(lineMarker.modelX1);
		lineMarker.lineStyle.color = "blue";
		lineMarker.lineStyle.width = 1;
		lineMarker.lineStyle.strokeStyle = "dotted";
		this._sdChart.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		var sdSampleA = sampleA.sdScaleSample("x", "y");
		this._sdxAxis.dataRange.setBounds(sdSampleA.min("x"), sdSampleA.max("x"));
		this._sdyAxis.dataRange.setBounds(sdSampleA.min("y"), sdSampleA.max("y"));
		this._sdChartDataSource.clear();
		this._sdChartDataSource.addRange(sdSampleA.flatten());

		var sdx = sampleA.standardDeviation("x");
		var sdya = sampleA.standardDeviation("y");
		var sdTrendLineAB_onA = LinearFunction.buildScaledLine(trendLineAB, 1 / sdx, 1 / sdya);
		var sdValleysA = sdSampleA.extremumSamples("x", "y", { excludePeaks: true, singlePoints: true, splitLine: sdTrendLineAB_onA, oneSided: true }).extremums;
		for (var length = sdValleysA.length, i = 0; i < length; ++i)
		{
			var x = sdValleysA.getAt(i, "x");
			var y = sdValleysA.getAt(i, "y");

			var pointMarker1 = new ChartPointMarker("zz1_" + newLUID(), this._sdxAxis, this._sdyAxis, true);
			pointMarker1.modelX = x;
			pointMarker1.modelY = y;
			pointMarker1.opacity = 1;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "green";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._sdChart.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker1);
		}
		var lineMarker = new ChartLineMarker("sdTrendLineAB_onA_" + newLUID(), this._sdxAxis, this._sdyAxis, true);
		lineMarker.modelX0 = sdSampleA.min("x");
		lineMarker.modelY0 = sdTrendLineAB_onA.calc(lineMarker.modelX0);
		lineMarker.modelX1 = sdSampleA.max("x");
		lineMarker.modelY1 = sdTrendLineAB_onA.calc(lineMarker.modelX1);
		lineMarker.lineStyle.color = "green";
		lineMarker.lineStyle.width = 1;
		this._sdChart.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		this._sdChart.refresh();
	}

	async _updateFftChart(range)
	{
		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		await dbChannel.ensureRange(range.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
		if (!data.length) return;

		this._fftChart.scene.markers.clear();
		this._fftChartDataSource.clear();

		var Npair = 64;
		var ar = [];
		for (var length = Npair, i = 0; i < length; ++i)
		{
			if (i > data.length - 1) ar.push(0);
			else ar.push(data[i].ask);
		}
		var ai = new Array(Npair).fill(0);
		fft(1, Npair, ar, ai);
		var uar = [];
		var uai = [];
		ar[0] = 0;
		unfoldSpectrum(Npair, ar, ai, uar, uai)
		var sample = new MappedArray(uai);
		var min = sample.min();
		var max = sample.max();

		var sampleCount = 8;
		var dpPerSample = uar.length / sampleCount;
		var reampledArr = new Array(sampleCount).fill(0);
		for (var length = uar.length, i = 0, c = -1; i < length; ++i)
		{
			if (!(i % dpPerSample)) ++c;
			reampledArr[c] = Math.max(reampledArr[c], uar[i]);
		}
		var sample = new MappedArray(reampledArr);
		var min = sample.min();
		var max = sample.max();
		for (var length = reampledArr.length, i = 0; i < length; ++i) this._fftChartDataSource.add({ x: i, y: reampledArr[i] });
		
		var lineMarker = new ChartLineMarker(newLUID(), this._fftxAxis, this._fftyAxis, true);
		lineMarker.modelX0 = 0;
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = Number.MAX_SAFE_INTEGER;
		lineMarker.modelY1 = 0;
		lineMarker.lineStyle.color = "black";
		lineMarker.lineStyle.width = 0.5;
		this._fftChart.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		//this._fftxAxis.dataRange.setBounds(0, this._fftChartDataSource.rawData.length);
		this._fftxAxis.dataRange.setBounds(0, sampleCount);
		//this._fftyAxis.dataRange.setBounds(min, max);
		this._fftyAxis.dataRange.setBounds(-0.001, 0.001);
		this._fftChart.refresh();
	}

	async _updateFftChart_movmentStats(range)
	{
		//var sampleIntervalDef = await app.db.getLowerSampleInterval(this._sampleIntervalDef.collectionName, 2);
		var sampleIntervalDef = this._sampleIntervalDef;
		log(87563485, "working with sample interval ", sampleIntervalDef.collectionName);

		var dbChannel = app.db.getChannel(this._instrumentId, sampleIntervalDef);
		await dbChannel.ensureRange(range.roundUp(0.5));
		var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
		if (!data.length) return;

		var avgUnitLengthMs = (EDateTimeUnit.getMinUnitLengthMs(sampleIntervalDef.unit) + EDateTimeUnit.getMaxUnitLengthMs(sampleIntervalDef.unit)) / 2;
		var avgIntervalLengthMs = avgUnitLengthMs * sampleIntervalDef.length;

		//var distances_x = [avgIntervalLengthMs, 2 * avgIntervalLengthMs, 4 * avgIntervalLengthMs, 8 * avgIntervalLengthMs, 16 * avgIntervalLengthMs, 32 * avgIntervalLengthMs, 64 * avgIntervalLengthMs, 128 * avgIntervalLengthMs, 256 * avgIntervalLengthMs, 512 * avgIntervalLengthMs];
		var distances_x = [];
		for (var length = 50, i = 1; i <= length; ++i) distances_x.push(i * avgIntervalLengthMs);
		var movements = Sample.movements(new ArrayMapper(data, { x: "dt", y: "ask" }), distances_x, "x", "y", "mindy", "maxdy");

		this._fftChart.scene.markers.clear();
		this._fftChartDataSource.clear();

		//var visualizer = new ChartMovementHistogramVisualizer(this._fftChart, this._fftxAxis, this._fftyAxis);
		//visualizer.draw3(distances_x, movements, "y", "mindy", "maxdy", 0.00005, null, 0.025);

		//var visualizer = new ChartMovementHistogramVisualizer(this._fftChart, this._fftxAxis, this._fftyAxis);
		//visualizer.draw(distances_x, movements, "y", "mindy", "maxdy", 0.00005, "probabilities");

		var visualizer = new ChartMovementHistogramVisualizer(this._fftChart, this._fftxAxis, this._fftyAxis);
		visualizer.draw2(distances_x, movements, "y", "mindy", "maxdy", 0.0005, "effectiveness");
		
		//this._fftChartDataSource.addRange(probabilities);
		//var stat = Sample.stat(probabilities, "x");
		//this._fftxAxis.dataRange.setBounds(stat.min, stat.max);
		//var stat = Sample.stat(probabilities, "y");
		//this._fftyAxis.dataRange.setBounds(stat.min, stat.max);

		this._fftChart.refresh();
	}

	//	run genetic simulator
	async _simulateButton_geneticSimulator_click(sender, args)
	{
		log("Starting simulation.");

		var geneticSimulator = new ForexRobotV5_ChannelChain_GeneticSimulator(
		{
			forexRobotV5_ChannelChain_Factory: this._forexRobotV5_ChannelChain_Factory,

			populationCount: 21,
			leastFitDeathRate: 9,
			alleleCrossoverChance: 0.003,
			alleleMutationChance: 0.06,
			maxGenerationCount: 10000,
			//alleleCrossoverChance: 0.13,
			//alleleMutationChance: 0.05,
			//maxGenerationCount: 10000,

			simulation_instrumentId: this._instrumentId,
			simulation_sampleIntervalName: "forex.sampledData.second30",
			simulation_pageSizeMs: 6 * 60 * 60 * 1000,	//	6h
			//simulation_channelMode: "lineOfBestFit",
			maxChannelDataPointCount: 666,
			simulation_ranges: new ForexRangerV5({dow:[4]}).weeklyRanges(1300673832815, 100),

			strongChromosomes:
			[
				ForexRobotV5_ChannelChain_Factory.jsonToNumericArraySettings({ channelShaper: this._channelShaperConfig }),
			],

			onProgress: (args) =>
			{
				var generationProgress_percent = Math.round(100 * args.individualNumber / args.individualCount);
				var rangeProgress_percent = Math.round(100 * args.individualRangeNumber / args.individualRangeCount);
				var individualProgress_percent = Math.round(100 * (args.individualProgress.current - args.individualProgress.range.min) / args.individualProgress.range.length);

				//log(911, args.stats.bestFitness, args.generationNumber, generationProgress_percent + "%", rangeProgress_percent + "%", individualProgress_percent + "%");
				var key = this.id + "_rangeProgress_percent";
				if (window[key] != rangeProgress_percent) log(911, args.generationNumber, args.stats.bestFitness, generationProgress_percent + "%", rangeProgress_percent + "%", "tot mut: ", args.stats_run.mutations, "tot xovr:", args.stats_run.crossovers, "cc!:", args.stats_run.cacheCollisions);
				window[key] = rangeProgress_percent;
			},

			onGenerationAvailable: function (args)
			{
				//log("onGenerationAvailable (1)", args);
				log("onGenerationAvailable (2)",
					args.generation[0].fitness,
					args.generation[0].metrics ? args.generation[0].metrics.totalMovement : "-",
					args.generation[0].metrics ? args.generation[0].metrics.movementPerDay : "-",
					args.generation[0].chromosome,
					"|",
					args.generation[1].fitness,
					args.generation[1].metrics ? args.generation[1].metrics.totalMovement : "-",
					args.generation[1].metrics ? args.generation[0].metrics.movementPerDay : "-",
					args.generation[1].chromosome,
					"|",
					args.generation[2].fitness,
					args.generation[2].metrics ? args.generation[2].metrics.totalMovement : "-",
					args.generation[1].metrics ? args.generation[0].metrics.movementPerDay : "-",
					args.generation[2].chromosome,
				);
			},

			onSolutionAvailable: function (args)
			{
				//log("onSolutionAvailable (1)", args);
				log("onSolutionAvailable (2)", args.generation[0].chromosome, args.generation[1].chromosome, args.generation[2].chromosome);
			}
		});

		await geneticSimulator.run();

		log("Done.");
	}

	async _simulateButton_longerDuration_click(sender, args)
	{
		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		var min = await dbChannel.getAllDataStartMs();
		var max = await dbChannel.getAllDataEndMs() - 1000 * 60 * 60 * 24 * 7;

		var simulationRanges = new ForexRangerV5({ dow: [4] }).randomRanges(min, max, 1000);
		//var simulationRanges = new ForexRangerV5({ dow: [5] }).weeklyRanges(1300673832815, 100);
		//var simulationRanges = new ForexRangerV5().weeklyRanges(1300673832815, 10);

		var largestCcscOffset = 0;
		var largestCcscOffsetRatio = 0;
		var channelFeatures = [];
		var totalDuration = 0;
		for (var length = simulationRanges.length, i = 0; i < length; ++i)
		{
			if (dbChannel.cachedDataPointCount > 10000) dbChannel._dataBuffer.clear();

			var item = simulationRanges[i];

			var pageSizeMs = 6 * 60 * 60 * 1000;	//	6h

			//var robotConfig = { channelShaper: this._channelShaperConfig };
			//var robotConfig = ForexRobotV5_ChannelChain_Factory.numericArrayToJsonSettings();
			var robotConfig =
			{
				channelShaper:
				{
					priceSourcing: 1,

					supportAndResistance_minChannelSpread: 0.0012,
					supportAndResistance_derangeThresholdFactor: 1,

					lineOfBestFit_variability_windowSize: 24,
					lineOfBestFit_spi1_variability_lowerThreshold: 0.065,
					lineOfBestFit_spi1_standardDeviation_thresholdFactor: 0.726,
					lineOfBestFit_deadZone_inertiaPointCount: 5,

					traderSNR_ZigZag:
					{
						SNR_ZigZag_trade_thresholdFactord: 0.05,
					},

					traderLBF:
					{
						LBF_tradeOpen_spreadThreshold: 0.0000579,
						LBF_tradeOpen_ldNValue: 996962,
						LBF_tradeOpen_sdAngleThreshold: 0.0820,
						LBF_tradeOpen_sdyThresholdFactor: 0.3068,
						LBF_tradeClose_sdyThresholdFactor: 0.4658,
					},
				}
			};

			var robot = this._forexRobotV5_ChannelChain_Factory.createRobot(
			{
				instrumentId: this._instrumentId,
				pageSizeMs: pageSizeMs,
				//channelMode: "lineOfBestFit",
				maxChannelDataPointCount: 666,
				minSignificantDataPointCount: 3,
				progress: (args) =>
				{
					var percent = Math.round(100 * (args.current - args.range.min) / args.range.length);
					log(911, percent + "%");
				},
			}, robotConfig);
			var sampleIntervalDef = await app.db.getSampleIntervalByName("forex.sampledData.second30");
			robot.initialize(sampleIntervalDef);

			var pageCount = Math.ceil(item.length / pageSizeMs);
			for (var j = 0; j < pageCount; ++j)
			{
				var range = new Range(item.min + j * pageSizeMs, item.min + (j + 1) * pageSizeMs - 1);
				await robot.buildRange(range);

				totalDuration += Math.max(range.max, robot.channelChain.length ? robot.channelChain[robot.channelChain.length - 1].lastDt : 0) - range.min;
				channelFeatures = channelFeatures.concat(robot.channelChain);
				
				var fitnessInfo_combined = ForexRobotV5_ChannelChain_GeneticSimulator.chainCcsc_fitnessCheck(channelFeatures, totalDuration);

				log(910,
					JSON.stringify(range),
					"item " + i + " of " + simulationRanges.length,
					"page " + j + " out of " + pageCount,
					"ccsc",
						fitnessInfo_combined.fitness,
						fitnessInfo_combined.metrics ? fitnessInfo_combined.metrics.totalMovement : "-",
						fitnessInfo_combined.metrics ? fitnessInfo_combined.metrics.movementPerDay : "-"
				);
			}
		}

		log(999, "Done.");
	}

	//	Function `_runStatCalc(range): void` - for the alt-selected period in the bottom chart, for every datapoint in the current resolution simulate one short and one long trade and
	//		test trade result; trade is closed on take profit, stop loss, after a predefined forward data point count or at the end of total available data in the database.
	async _runStatCalc(range)
	{
		const sampleIntervalDef = this._sampleIntervalDef;
		log(87963485, "working with sample interval ", sampleIntervalDef, sampleIntervalDef.collectionName);

		const dbChannel = app.db.getChannel(this._instrumentId, sampleIntervalDef);
		await dbChannel.ensureRange(range.roundUp(0.5));
		const data = dbChannel.getRawDataInRange(range.roundUp(0.5));
		if (!data.length) return;

		console.log(911, data);

		const feeEurPerLot = 3;
		const positionSizeLots = 1;
		const profitTargetEur = 50;
		const stopLossEur = 200;
		//	pageSizePeriodCount = 28; maxPageCount = 64; profitTargetEur = 100; stopLossEur = 400; visible time = 3h; chart 10 sec
		//	pageSizePeriodCount = 28; maxPageCount = 64; profitTargetEur = 50; stopLossEur = 200; visible time = 16h; chart 1 min

		const pageSizePeriodCount = 28;
		const pageSize = EDateTimeUnit.getMinUnitLengthMs(sampleIntervalDef.unit) * sampleIntervalDef.length * pageSizePeriodCount;
		const maxPageCount = 64;
		const dbDataEndMs = await dbChannel.getAllDataEndMs();

		//	build position list
		const positionList = [];
		for (let length = data.length, i = 0; i < length; ++i)
		{
			const item = data[i];
			positionList.push(
			{
				dt: item.dt,
				isLong: true,
				rate: item.raw.ah,
				fee: feeEurPerLot,
				volume: 100000 * positionSizeLots,
				startDataItem: item,
				endDataItem: null,
				minDeviationPL: 0,
				netPL: 0,
			});
			positionList.push(
			{
				dt: item.dt,
				isLong: false,
				rate: item.raw.al,	//	assuming ask === bid (0 spread) but adding fixed trade fee as with IC Marnets; to enable spread use `iitem_position.raw.bl`
				fee: feeEurPerLot,
				volume: 100000 * positionSizeLots,
				startDataItem: item,
				endDataItem: null,
				minDeviationPL: 0,
				netPL: 0,
			});
		}

		let currentDataPage = 0;
		let pendingPositionList = positionList.slice(0);
		const finishedPositionList = [];
		const simulationRange = range.clone();
		while (simulationRange.max <= dbDataEndMs && pendingPositionList.length > 0 && currentDataPage <= maxPageCount)
		{
			await dbChannel.ensureRange(simulationRange.roundUp(0.5));
			const data = dbChannel.getRawDataInRange(simulationRange.roundUp(0.5));
			if (data.length !== 0)
			{
				for (let jlength = data.length, j = 0; j < jlength; ++j)
				{
					const jitem_market = data[j];

					for (let ilength = pendingPositionList.length, i = 0; i < ilength; ++i)
					{
						const iitem_position = pendingPositionList[i];

						if (jitem_market.dt <= iitem_position.dt) continue;

						iitem_position.netPL = iitem_position.isLong ?
							(jitem_market.raw.al - iitem_position.rate) * iitem_position.volume - iitem_position.fee :
							(iitem_position.rate - jitem_market.raw.ah) * iitem_position.volume - iitem_position.fee; //	assuming ask === bid (0 spread) but adding fixed trade fee as with IC Marnets; to enable spread use `iitem_position.raw.bl`

						const takeProfit = iitem_position.netPL >= profitTargetEur;
						const stopLoss = iitem_position.netPL < 0 && Math.abs(iitem_position.netPL) >= stopLossEur;
						if (stopLoss) iitem_position.minDeviationPL = Math.min(iitem_position.netPL, iitem_position.minDeviationPL);
						if (!takeProfit && !stopLoss) continue;
						
						finishedPositionList.push(iitem_position);
						iitem_position.endDataItem = jitem_market;
						console.log(912, "position closed", iitem_position, finishedPositionList.length, "/", positionList.length);
					}
					pendingPositionList = pendingPositionList.filter(v => v.endDataItem === null);
				}
			}
			simulationRange.min += pageSize;
			simulationRange.max += pageSize;
			++currentDataPage;
			console.log(914, "loading next page", currentDataPage, "/", maxPageCount);
		}

		const minMinDeviationPL = list => list.reduce((min, item) => Math.min(min, item.minDeviationPL), Number.MAX_VALUE);
		const totalPL = list => list.reduce((v, item) => item.netPL + v, 0);

		const stopLossPositions = finishedPositionList.filter(v => v.netPL < 0);
		const takeProfitPositions = finishedPositionList.filter(v => v.netPL >= 0);

		console.log(915, "unclosable positions", pendingPositionList);
		console.log(917, "stop-loss positions", stopLossPositions, "total PL", totalPL(stopLossPositions));
		console.log(918, "take-profit positions", takeProfitPositions, "total PL", totalPL(takeProfitPositions));
		console.log(916, "closed positions", finishedPositionList, "max deviation PL", minMinDeviationPL(finishedPositionList));
		console.log(917, "total PL", totalPL(finishedPositionList) + totalPL(pendingPositionList), "TP", takeProfitPositions.length, ": SL", stopLossPositions.length, ": UN", pendingPositionList.length);
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


	get simulationStateChange()
	{
		return this._simulationStateChange;
	}
}


SimulationChartUserControl.State =
{
	Exploration: 1,
	Simulation: 2,
};