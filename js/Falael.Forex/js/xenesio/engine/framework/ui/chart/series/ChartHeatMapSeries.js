"use strict";

include("StdAfx.js");

class ChartHeatMapSeries extends ChartSeries
{
	constructor(id, xAxis, yAxis, colorGeneratorCallback, validVersionGetterCallback)
	{
		super(id, -1, xAxis, yAxis, "heatMapSeries");

		this.xAxis.dataRange.change.add(this._dataRange_change.bind(this));
		this.yAxis.dataRange.change.add(this._dataRange_change.bind(this));

		this._colorGeneratorCallback = colorGeneratorCallback;
		this._validVersionGetterCallback = validVersionGetterCallback;

		this._dotSize = null;
		this._gridSpacing = null;

		this._currentValidVersion = null;
	}


	__buildRenderPlan(renderPlan)
	{
		var validVersion = this._validVersionGetterCallback();
		var isDataValid = (this._currentValidVersion == validVersion);

		renderPlan.renderInfos.push(
		{
			primitive: "pixelGrid",
			dotSize: this._dotSize,
			gridSpacing: this._gridSpacing,
			getColor: this._colorGeneratorCallback,
			source: this,
			xAxis: this.xAxis,
			yAxis: this.yAxis,
			isValid: this.__isAspectValid("boundingRect") && this.__isAspectValid("dataRanges") && isDataValid,
		});

		this._currentValidVersion = validVersion;
	}


	_dataRange_change(sender, args)
	{
		this.__invalidateAspect("dataRanges");
	}


	get dotSize()
	{
		return this._dotSize;
	}

	set dotSize(value)
	{
		if (this._dotSize == value)
		{
			return;
		}
		this._dotSize = value;
	}

	get gridSpacing()
	{
		return this._gridSpacing;
	}

	set gridSpacing(value)
	{
		if (this._gridSpacing == value)
		{
			return;
		}
		this._gridSpacing = value;
	}
}
