"use strict";

include("StdAfx.js");

class ChartBackplane extends ChartElement
{
	constructor(id, parentPath, parentNode)
	{
		super(id, 9000, parentPath, parentNode);

		this._backgroundColor = null;

		this._xAxis = null;
		this._yAxis = null;

		this._majorHLineStyle = new ChartLineStyle("gridMajorHLineStyle", this);
		this._majorHLineStyle.change.add(function (sender, args) { this.__invalidateAspect("hGridLines"); }.bind(this));

		this._majorVLineStyle = new ChartLineStyle("gridMajorVLineStyle", this);
		this._majorVLineStyle.change.add(function (sender, args) { this.__invalidateAspect("vGridLines"); }.bind(this));

		this._minorHLineStyle = new ChartLineStyle("gridMinorHLineStyle", this);
		this._minorHLineStyle.change.add(function (sender, args) { this.__invalidateAspect("hGridLines"); }.bind(this));

		this._minorVLineStyle = new ChartLineStyle("gridMinorVLineStyle", this);
		this._minorVLineStyle.change.add(function (sender, args) { this.__invalidateAspect("vGridLines"); }.bind(this));

		this._microHLineStyle = new ChartLineStyle("gridMicroHLineStyle", this);
		this._microHLineStyle.change.add(function (sender, args) { this.__invalidateAspect("hGridLines"); }.bind(this));

		this._microVLineStyle = new ChartLineStyle("gridMicroVLineStyle", this);
		this._microVLineStyle.change.add(function (sender, args) { this.__invalidateAspect("vGridLines"); }.bind(this));

		this._runningHLineStyle = new ChartLineStyle("gridRunningHLineStyle", this);
		this._runningHLineStyle.change.add(function (sender, args) { this.__invalidateAspect("hGridLines"); }.bind(this));

		this._runningVLineStyle = new ChartLineStyle("gridRunningVLineStyle", this);
		this._runningVLineStyle.change.add(function (sender, args) { this.__invalidateAspect("vGridLines"); }.bind(this));
	}

	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		if (!this.__isAspectValid("boundingRect"))
		{
			this.__hitTestInfo =
			{
				element: this,
				elementType: "backplane",
				sceneX: this.boundingRect.x,
				sceneY: this.boundingRect.y,
				sceneWidth: this.boundingRect.width,
				sceneHeight: this.boundingRect.height,
			};
			renderPlan.hitTestInfos.push(
			{
				aspects: ["boundingRect"],
				hitTestInfo: this.hitTestInfo,
				source: this,
			});
		}

		if (!this.__isAspectValid("backgroundColor") || !this.__isAspectValid("boundingRect"))
		{
			renderPlan.renderInfos.push(
			{
				aspects: ["backgroundColor", "boundingRect"],
				primitive: "background",
				x: this.boundingRect.x,
				y: this.boundingRect.y,
				width: this.boundingRect.width,
				height: this.boundingRect.height,
				style:
				{
					fill: this.backgroundColor,
				},
				source: this,
			});
		}

		if (this._xAxis && (!this.__isAspectValid("vGridLines") || !this.__isAspectValid("boundingRect")))
		{
			for (var length = this._xAxis.scaleInfoCache.ticks.length, i = 0; i < length; ++i) this.__buildRenderPlan_vGridLine(renderPlan, this._xAxis.scaleInfoCache.ticks[i], ["vGridLines"]);
		}

		if (this._yAxis && (!this.__isAspectValid("hGridLines") || !this.__isAspectValid("boundingRect")))
		{
			for (var length = this._yAxis.scaleInfoCache.ticks.length, i = 0; i < length; ++i) this.__buildRenderPlan_hGridLine(renderPlan, this._yAxis.scaleInfoCache.ticks[i], ["hGridLines"]);
		}
	}

	__buildRenderPlan_vGridLine(renderPlan, tickInfo, aspects)
	{
		var lineStyle;
		switch (tickInfo.tickType)
		{
			case EChartTickType.Major:
				lineStyle = this.majorVLineStyle;
				break;
			case EChartTickType.Minor:
				lineStyle = this.minorVLineStyle;
				break;
			case EChartTickType.Micro:
				lineStyle = this.microVLineStyle;
				break;
			case EChartTickType.Running:
				lineStyle = this.runningVLineStyle;
				break;
			default:
				throw "Not implemented.";
		}
		if (!lineStyle.visible) return;
		var renderInfo =
		{
			aspects: aspects,
			primitive: "vGridLine",
			lineStyle: lineStyle,
			source: this,
			zIndex: this.zIndex + 1,
		};
		renderPlan.renderInfos.push(renderInfo);
		renderInfo.x = tickInfo.sceneOffset;
		renderInfo.y = this.boundingRect.y;
		renderInfo.width = 0;
		renderInfo.height = this.boundingRect.height;
	}

	__buildRenderPlan_hGridLine(renderPlan, tickInfo, aspects)
	{
		var lineStyle;
		switch (tickInfo.tickType)
		{
			case EChartTickType.Major:
				lineStyle = this.majorHLineStyle;
				break;
			case EChartTickType.Minor:
				lineStyle = this.minorHLineStyle;
				break;
			case EChartTickType.Micro:
				lineStyle = this.microHLineStyle;
				break;
			case EChartTickType.Running:
				lineStyle = this.runningHLineStyle;
				break;
			default:
				throw "Not implemented.";
		}
		if (!lineStyle.visible) return;
		var renderInfo =
		{
			aspects: aspects,
			primitive: "hGridLine",
			lineStyle: lineStyle,
			source: this,
			zIndex: this.zIndex + 1,
		};
		renderPlan.renderInfos.push(renderInfo);
		renderInfo.x = this.boundingRect.x;
		renderInfo.y = tickInfo.sceneOffset;
		renderInfo.width = this.boundingRect.width;
		renderInfo.height = 0;
	}


	_xAxis_change(sender, args)
	{
		this.__invalidateAspect("vGridLines");
	}

	_yAxis_change(sender, args)
	{
		this.__invalidateAspect("hGridLines");
	}


	get xAxis()
	{
		return this._xAxis;
	}

	set xAxis(value)
	{
		if (this._xAxis == value)
		{
			return;
		}
		if (this._xAxis)
		{
			this._xAxis.change.remove(this._xAxis_change._multicastDelegateId);
		}
		this._xAxis = value;
		if (this._xAxis) this._xAxis_change._multicastDelegateId = this._xAxis.change.add(this._xAxis_change.bind(this));
		this.__invalidateAspect("vGridLines");
	}

	get yAxis()
	{
		return this._yAxis;
	}

	set yAxis(value)
	{
		if (this._yAxis == value)
		{
			return;
		}
		if (this._yAxis)
		{
			this._yAxis.change.remove(this._yAxis_change._multicastDelegateId);
		}
		this._yAxis = value;
		if (this._yAxis) this._yAxis_change._multicastDelegateId = this._yAxis.change.add(this._yAxis_change.bind(this));
		this.__invalidateAspect("hGridLines");
	}


	get backgroundColor()
	{
		return this._backgroundColor;
	}

	set backgroundColor(value)
	{
		if (this._backgroundColor == value)
		{
			return;
		}
		this._backgroundColor = value;
		this.__invalidateAspect("backgroundColor");
	}


	get majorHLineStyle()
	{
		return this._majorHLineStyle;
	}

	get majorVLineStyle()
	{
		return this._majorVLineStyle;
	}

	get minorHLineStyle()
	{
		return this._minorHLineStyle;
	}

	get minorVLineStyle()
	{
		return this._minorVLineStyle;
	}

	get microHLineStyle()
	{
		return this._microHLineStyle;
	}

	get microVLineStyle()
	{
		return this._microVLineStyle;
	}

	get runningHLineStyle()
	{
		return this._runningHLineStyle;
	}

	get runningVLineStyle()
	{
		return this._runningVLineStyle;
	}
}
