"use strict";

include("StdAfx.js");

class ChartChannelZoneMarker extends ChartElement
{
	constructor(id, xAxis, yAxis, visible)
	{
		super(id, 1000, null, null, visible, "channelZone");

		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		this._yAxis.change.add(this._yAxis_change.bind(this));

		this._opacity = null;
		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("lineStyle"); }.bind(this));
		this._backplaneColor = null;

		this._supportLine_modelLowerX = null;
		this._supportLine_modelUpperX = null;
		this._supportLine_modelLowerY = null;
		this._supportLine_modelUpperY = null;

		this._resistanceLine_modelLowerX = null;
		this._resistanceLine_modelUpperX = null;
		this._resistanceLine_modelLowerY = null;
		this._resistanceLine_modelUpperY = null;
	}


	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var lineValid = boundingRectValid && this.__isAspectValid("lineStyle");
		var backplaneValid = boundingRectValid && this.__isAspectValid("backplaneStyle");

		if (!backplaneValid || !lineValid)
		{
			var renderInfo =
			{
				aspects: ["boundingRect", "backplaneStyle", "lineStyle"],
				primitive: "channel",
				style:
				{
					fill: this.backplaneColor,
				},
				lineStyle: this.lineStyle,
				source: this,
				zIndex: this.zIndex,
				opacity: this._opacity,

				supportLine_sceneLowerX: this._xAxis.modelToScene(this.supportLine_modelLowerX),
				supportLine_sceneUpperX: this._xAxis.modelToScene(this.supportLine_modelUpperX),
				supportLine_sceneLowerY: this._yAxis.modelToScene(this.supportLine_modelLowerY),
				supportLine_sceneUpperY: this._yAxis.modelToScene(this.supportLine_modelUpperY),

				resistanceLine_sceneLowerX: this._xAxis.modelToScene(this.resistanceLine_modelLowerX),
				resistanceLine_sceneUpperX: this._xAxis.modelToScene(this.resistanceLine_modelUpperX),
				resistanceLine_sceneLowerY: this._yAxis.modelToScene(this.resistanceLine_modelLowerY),
				resistanceLine_sceneUpperY: this._yAxis.modelToScene(this.resistanceLine_modelUpperY),
			};
			renderPlan.renderInfos.push(renderInfo);
		}
	}


	_xAxis_change(sender, args)
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

	_yAxis_change(sender, args)
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

	get lineStyle()
	{
		return this._lineStyle;
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
		this._xAxis = value;
		this.__invalidateAspect("boundingRect");
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
		this._yAxis = value;
		this.__invalidateAspect("boundingRect");
	}


	get supportLine_modelLowerX()
	{
		return this._supportLine_modelLowerX;
	}

	set supportLine_modelLowerX(value)
	{
		if (this._supportLine_modelLowerX == value)
		{
			return;
		}
		this._supportLine_modelLowerX = value;
		this.__invalidateAspect("boundingRect");
	}

	get supportLine_modelUpperX()
	{
		return this._supportLine_modelUpperX;
	}

	set supportLine_modelUpperX(value)
	{
		if (this._supportLine_modelUpperX == value)
		{
			return;
		}
		this._supportLine_modelUpperX = value;
		this.__invalidateAspect("boundingRect");
	}


	get supportLine_modelLowerY()
	{
		return this._supportLine_modelLowerY;
	}

	set supportLine_modelLowerY(value)
	{
		if (this._supportLine_modelLowerY == value)
		{
			return;
		}
		this._supportLine_modelLowerY = value;
		this.__invalidateAspect("boundingRect");
	}

	get supportLine_modelUpperY()
	{
		return this._supportLine_modelUpperY;
	}

	set supportLine_modelUpperY(value)
	{
		if (this._supportLine_modelUpperY == value)
		{
			return;
		}
		this._supportLine_modelUpperY = value;
		this.__invalidateAspect("boundingRect");
	}


	get resistanceLine_modelLowerX()
	{
		return this._resistanceLine_modelLowerX;
	}

	set resistanceLine_modelLowerX(value)
	{
		if (this._resistanceLine_modelLowerX == value)
		{
			return;
		}
		this._resistanceLine_modelLowerX = value;
		this.__invalidateAspect("boundingRect");
	}

	get resistanceLine_modelUpperX()
	{
		return this._resistanceLine_modelUpperX;
	}

	set resistanceLine_modelUpperX(value)
	{
		if (this._resistanceLine_modelUpperX == value)
		{
			return;
		}
		this._resistanceLine_modelUpperX = value;
		this.__invalidateAspect("boundingRect");
	}


	get resistanceLine_modelLowerY()
	{
		return this._resistanceLine_modelLowerY;
	}

	set resistanceLine_modelLowerY(value)
	{
		if (this._resistanceLine_modelLowerY == value)
		{
			return;
		}
		this._resistanceLine_modelLowerY = value;
		this.__invalidateAspect("boundingRect");
	}

	get resistanceLine_modelUpperY()
	{
		return this._resistanceLine_modelUpperY;
	}

	set resistanceLine_modelUpperY(value)
	{
		if (this._resistanceLine_modelUpperY == value)
		{
			return;
		}
		this._resistanceLine_modelUpperY = value;
		this.__invalidateAspect("boundingRect");
	}
}
