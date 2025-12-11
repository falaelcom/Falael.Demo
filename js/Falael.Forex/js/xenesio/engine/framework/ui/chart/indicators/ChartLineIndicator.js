"use strict";

include("StdAfx.js");

class ChartLineIndicator extends ChartElement
{
	//	rotation: degrees number
	constructor(id, rotation, xAxis, yAxis, visible)
	{
		super(id, 8000, null, null, visible, "line");

		this._rotation = rotation;
		this._xAxis = xAxis;
		if (this._xAxis) this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		if (this._yAxis) this._yAxis.change.add(this._yAxis_change.bind(this));

		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("line"); }.bind(this));

		this._sceneX = null;
		this._sceneY = null;
		this._modelX = null;
		this._modelY = null;
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

		switch (this._rotation)
		{
			case 0:
				var sceneY = (this.modelY !== null && this._yAxis) ? this._yAxis.modelToScene(this.modelY) : this.sceneY;
				renderPlan.renderInfos.push(
				{
					aspects: ["boundingRect", "line"],
					primitive: "indicatorLine",
					x: this.boundingRect.x,
					y: sceneY,
					width: this.boundingRect.width,
					height: 0,
					lineStyle: this.lineStyle,
					source: this,
				});
				break;
			case 90:
				var sceneX = (this.modelX !== null && this._xAxis) ? this._xAxis.modelToScene(this.modelX) : this.sceneX;
				renderPlan.renderInfos.push(
				{
					aspects: ["boundingRect", "line"],
					primitive: "indicatorLine",
					x: sceneX,
					y: this.boundingRect.y,
					width: 0,
					height: this.boundingRect.height,
					lineStyle: this.lineStyle,
					source: this,
				});
				break;
			default:
				throw "Not implemented.";
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


	get rotation()
	{
		return this._rotation;
	}

	set rotation(value)
	{
		if (this._rotation == value)
		{
			return;
		}
		this._rotation = value;
		this.__invalidateAspect("boundingRect");
	}

	get xAxis()
	{
		return this._xAxis;
	}

	get yAxis()
	{
		return this._yAxis;
	}


	get sceneX()
	{
		return this._sceneX;
	}

	set sceneX(value)
	{
		if (this._sceneX == value)
		{
			return;
		}
		this._sceneX = value;
		this.__invalidateAspect("boundingRect");
	}

	get sceneY()
	{
		return this._sceneY;
	}

	set sceneY(value)
	{
		if (this._sceneY == value)
		{
			return;
		}
		this._sceneY = value;
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
