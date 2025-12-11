"use strict";

include("StdAfx.js");

class ChartAxisLineIndicator extends ChartElement
{
	constructor(id, axis, visible)
	{
		super(id, 8000, null, null, visible, "axisLine");

		this._axis = axis;
		this._axis.change.add(this._axis_change.bind(this));

		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("line"); }.bind(this));

		this._sceneOffset = null;
	}

	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var lineValid = boundingRectValid && this.__isAspectValid("line");

		if (lineValid)
		{
			return;
		}

		var renderInfo =
		{
			aspects: ["boundingRect", "line"],
			primitive: "axisIndicatorLine",
			lineStyle: this.lineStyle,
			source: this,
		};
		renderPlan.renderInfos.push(renderInfo);
		switch (this.axis.position)
		{
			case EChartAxisPosition.Bottom:
				renderInfo.x = this.sceneOffset;
				renderInfo.y = this.axis.boundingRect.y;
				renderInfo.width = 0;
				renderInfo.height = this.axis.boundingRect.height;
				break;
			case EChartAxisPosition.Right:
				renderInfo.x = this.axis.boundingRect.x;
				renderInfo.y = this.sceneOffset;
				renderInfo.width = this.axis.boundingRect.width;
				renderInfo.height = 0;
				break;
			case EChartAxisPosition.Top:
				renderInfo.x = this.sceneOffset;
				renderInfo.y = this.axis.boundingRect.y;
				renderInfo.width = 0;
				renderInfo.height = this.axis.boundingRect.height;
				break;
			case EChartAxisPosition.Left:
				renderInfo.x = this.axis.boundingRect.x;
				renderInfo.y = this.sceneOffset;
				renderInfo.width = this.axis.boundingRect.width;
				renderInfo.height = 0;
				break;
			default:
				throw "Not implemented.";
		}
	}


	_axis_change(sender, args)
	{
		switch (args.aspect)
		{
			case "scale":
			case "boundingRect":
				this.__invalidateAspect("boundingRect");
				break;
			case "line":
			case "labels":
				break;
			default:
				throw "Not implemented.";
		}
	}


	get lineStyle()
	{
		return this._lineStyle;
	}


	get axis()
	{
		return this._axis;
	}

	set axis(value)
	{
		if (this._axis == value)
		{
			return;
		}
		this._axis = value;
		this.__invalidateAspect("boundingRect");
	}

	get sceneOffset()
	{
		return this._sceneOffset;
	}

	set sceneOffset(value)
	{
		if (this._sceneOffset == value)
		{
			return;
		}
		this._sceneOffset = value;
		this.__invalidateAspect("boundingRect");
	}
}
