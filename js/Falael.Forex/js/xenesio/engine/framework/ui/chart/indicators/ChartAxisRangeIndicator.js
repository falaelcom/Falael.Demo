"use strict";

include("StdAfx.js");

class ChartAxisRangeIndicator extends ChartElement
{
	constructor(id, axis, visible)
	{
		super(id, 8500, null, null, visible, "axisRange");

		this._axis = axis;
		this._axis.change.add(this._axis_change.bind(this));

		this._opacity = null;
		this._backplaneColor = null;
		this._backplaneBorderLineStyle = new ChartLineStyle("backplaneBorderLineStyle", this);
		this._backplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));

		this._modelLowerOffset = null;
		this._modelUpperOffset = null;
	}

	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var backplaneValid = boundingRectValid && this.__isAspectValid("backplaneStyle");

		if (backplaneValid)
		{
			return;
		}

		var sceneLowerOffset = this.axis.modelToScene(this.modelLowerOffset);
		var sceneUpperOffset = this.axis.modelToScene(this.modelUpperOffset);

		var renderInfo =
		{
			aspects: ["boundingRect", "backplaneStyle"],
			primitive: "axisRange",
			style:
			{
				fill: this.backplaneColor,
			},
			lineStyle: this.backplaneBorderLineStyle,
			source: this,
			zIndex: this.zIndex + 1,
			opacity: this._opacity,
		};
		renderPlan.renderInfos.push(renderInfo);
		switch (this.axis.position)
		{
			case EChartAxisPosition.Bottom:
				renderInfo.x = sceneLowerOffset;
				renderInfo.y = this.axis.boundingRect.y;
				renderInfo.width = sceneUpperOffset - sceneLowerOffset;
				renderInfo.height = this.axis.boundingRect.height;
				break;
			case EChartAxisPosition.Right:
				renderInfo.x = this.axis.boundingRect.x;
				renderInfo.y = sceneLowerOffset;
				renderInfo.width = this.axis.boundingRect.width;
				renderInfo.height = sceneUpperOffset - sceneLowerOffset;
				break;
			case EChartAxisPosition.Top:
				renderInfo.x = sceneLowerOffset;
				renderInfo.y = this.axis.boundingRect.y;
				renderInfo.width = sceneUpperOffset - sceneLowerOffset;
				renderInfo.height = this.axis.boundingRect.height;
				break;
			case EChartAxisPosition.Left:
				renderInfo.x = this.axis.boundingRect.x;
				renderInfo.y = sceneLowerOffset;
				renderInfo.width = this.axis.boundingRect.width;
				renderInfo.height = sceneUpperOffset - sceneLowerOffset;
				break;
			default:
				throw "Not implemented.";
		}

		this.__hitTestInfo =
		{
			element: this,
			elementType: "axisRange",
			sceneX: renderInfo.x,
			sceneY: renderInfo.y,
			sceneWidth: renderInfo.width,
			sceneHeight: renderInfo.height,
		};
		renderPlan.hitTestInfos.push(
		{
			aspects: ["boundingRect"],
			hitTestInfo: this.hitTestInfo,
			source: this,
		});
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


	get opacity()
	{
		return this._opacity;
	}

	set opacity(value)
	{
		if (this._opacity == value)
		{
			return;
		}
		this._opacity = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get backplaneColor()
	{
		return this._backplaneColor;
	}

	set backplaneColor(value)
	{
		if (this._backplaneColor == value)
		{
			return;
		}
		this._backplaneColor = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get backplaneBorderLineStyle()
	{
		return this._backplaneBorderLineStyle;
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

	get modelLowerOffset()
	{
		return this._modelLowerOffset;
	}

	set modelLowerOffset(value)
	{
		if (this._modelLowerOffset == value)
		{
			return;
		}
		this._modelLowerOffset = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelUpperOffset()
	{
		return this._modelUpperOffset;
	}

	set modelUpperOffset(value)
	{
		if (this._modelUpperOffset == value)
		{
			return;
		}
		this._modelUpperOffset = value;
		this.__invalidateAspect("boundingRect");
	}
}
