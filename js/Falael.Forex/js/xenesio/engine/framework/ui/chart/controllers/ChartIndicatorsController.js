"use strict";

include("StdAfx.js");

class ChartIndicatorsController
{
	constructor(chartVisual, xAxis, yAxis, dataSeries)
	{
		this._chartVisual = chartVisual;
		this._xAxis = xAxis;
		this._yAxis = yAxis;
		this._dataSeries = dataSeries;

		var indicators = {};
		indicators.mouseIndicatorX = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("mouseLineIndicatorX", 90, null, null, false));
		indicators.mouseIndicatorY = this._chartVisual.overlay.indicators.add(new ChartLineIndicator("mouseLineIndicatorY", 0, null, null, false));
		indicators.mouseLabelIndicator = this._chartVisual.overlay.indicators.add(new ChartLabelIndicator("mouseLabelIndicator", this._dataSeries, false));
		indicators.mouseAxisIndicatorX = this._chartVisual.overlay.indicators.add(new ChartAxisLineIndicator("mouseAxisIndicatorX", this._xAxis, true));
		indicators.mouseAxisLabelIndicatorX = this._chartVisual.overlay.indicators.add(new ChartAxisLabelIndicator("mouseAxisLabelIndicatorX", this._xAxis, true));
		indicators.mouseAxisIndicatorY = this._chartVisual.overlay.indicators.add(new ChartAxisLineIndicator("mouseAxisIndicatorY", this._yAxis, true));
		indicators.mouseAxisLabelIndicatorY = this._chartVisual.overlay.indicators.add(new ChartAxisLabelIndicator("mouseAxisLabelIndicatorY", this._yAxis, true));
		ChartStyleSheet.defaultOverlayStyle.applyToOverlay(this._chartVisual.overlay);
		this._chartIndicatorsBehavior = new ChartIndicatorsBehavior(this._chartVisual, indicators);

		this._enabled = false;
	}


	get enabled()
	{
		return this._enabled;
	}

	set enabled(value)
	{
		if (this._enabled == value) return;
		this._enabled = value;
		this._chartIndicatorsBehavior.enabled = value;
	}


	get chartVisual()
	{
		return this._chartVisual;
	}

	get xAxis()
	{
		return this._xAxis;
	}

	get yAxis()
	{
		return this._yAxis;
	}

	get dataSeries()
	{
		return this._dataSeries;
	}

	get behavior()
	{
		return this._chartIndicatorsBehavior;
	}
}
