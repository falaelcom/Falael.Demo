"use strict";

include("StdAfx.js");

class ChartLineMarker extends ChartElement
{
	constructor(id, xAxis, yAxis, visible)
	{
		super(id, 910, null, null, visible, "line");

		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		this._yAxis.change.add(this._yAxis_change.bind(this));

		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("style"); }.bind(this));

		this._modelX0 = null;
		this._modelY0 = null;
		this._modelX1 = null;
		this._modelY1 = null;
	}


	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var backplaneValid = boundingRectValid && this.__isAspectValid("style");

		var sceneX0;
		var sceneY0;
		var sceneX1;
		var sceneY1;

		if (this.modelX0 <= this.modelX1)
		{
			sceneX0 = this._xAxis.modelToScene(this.modelX0);
			sceneY0 = this._yAxis.modelToScene(this.modelY0);
			sceneX1 = this._xAxis.modelToScene(this.modelX1);
			sceneY1 = this._yAxis.modelToScene(this.modelY1);
		}
		else
		{
			sceneX0 = this._xAxis.modelToScene(this.modelX1);
			sceneY0 = this._yAxis.modelToScene(this.modelY1);
			sceneX1 = this._xAxis.modelToScene(this.modelX0);
			sceneY1 = this._yAxis.modelToScene(this.modelY0);
		}

		if (!backplaneValid)
		{
			if (sceneX1 < this.boundingRect.x ||
				sceneX0 > this.boundingRect.x + this.boundingRect.width ||
				Math.max(sceneY0, sceneY1) < this.boundingRect.y ||
				Math.min(sceneY0, sceneY1)  > this.boundingRect.y + this.boundingRect.height)
			{
				var renderInfo =
				{
					aspects: ["boundingRect", "style"],
					primitive: "$clearAspects",
					source: this,
				};
				renderPlan.renderInfos.push(renderInfo);
			}
			else
			{
				var renderInfo =
				{
					aspects: ["boundingRect", "style"],
					primitive: "line",
					x: sceneX0,
					y: sceneY0,
					width: sceneX1 - sceneX0,
					height: sceneY1 - sceneY0,
					lineStyle: this.lineStyle,
					source: this,
				};

				renderPlan.renderInfos.push(renderInfo);
			}
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


	get lineStyle()
	{
		return this._lineStyle;
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


	get modelX0()
	{
		return this._modelX0;
	}

	set modelX0(value)
	{
		if (this._modelX0 == value)
		{
			return;
		}
		this._modelX0 = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelY0()
	{
		return this._modelY0;
	}

	set modelY0(value)
	{
		if (this._modelY0 == value)
		{
			return;
		}
		this._modelY0 = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelX1()
	{
		return this._modelX1;
	}

	set modelX1(value)
	{
		if (this._modelX1 == value)
		{
			return;
		}
		this._modelX1 = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelY1()
	{
		return this._modelY1;
	}

	set modelY1(value)
	{
		if (this._modelY1 == value)
		{
			return;
		}
		this._modelY1 = value;
		this.__invalidateAspect("boundingRect");
	}
}
