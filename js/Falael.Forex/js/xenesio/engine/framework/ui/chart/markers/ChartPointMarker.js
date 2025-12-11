"use strict";

include("StdAfx.js");

class ChartPointMarker extends ChartElement
{
	constructor(id, xAxis, yAxis, visible)
	{
		super(id, 900, null, null, visible, "point");

		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		this._yAxis.change.add(this._yAxis_change.bind(this));

		this._opacity = null;
		this._size = null;
		this._color = null;
		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("style"); }.bind(this));

		this._modelX = null;
		this._modelY = null;
	}

	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var backplaneValid = boundingRectValid && this.__isAspectValid("style");
		var sceneX = this._xAxis.modelToScene(this.modelX);
		var sceneY = this._yAxis.modelToScene(this.modelY);

		if (!backplaneValid)
		{
			if (sceneX < this.boundingRect.x ||
				sceneX > this.boundingRect.x + this.boundingRect.width ||
				sceneY < this.boundingRect.y ||
				sceneY > this.boundingRect.y + this.boundingRect.height)
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
					primitive: "point",
					style:
					{
						fill: this.color,
					},
					lineStyle: this.lineStyle,
					source: this,
					opacity: this._opacity,
					x: sceneX,
					y: sceneY,
					size: this._size,
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
		this.__invalidateAspect("style");
	}

	get size()
	{
		return this._size;
	}

	set size(value)
	{
		if (this._size == value)
		{
			return;
		}
		this._size = value;
		this.__invalidateAspect("style");
	}

	get color()
	{
		return this._color;
	}

	set color(value)
	{
		if (this._color == value)
		{
			return;
		}
		this._color = value;
		this.__invalidateAspect("style");
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


	get modelX()
	{
		return this._modelX;
	}

	set modelX(value)
	{
		if (this._modelX == value)
		{
			return;
		}
		this._modelX = value;
		this.__invalidateAspect("boundingRect");
	}


	get modelY()
	{
		return this._modelY;
	}

	set modelY(value)
	{
		if (this._modelY == value)
		{
			return;
		}
		this._modelY = value;
		this.__invalidateAspect("boundingRect");
	}
}
