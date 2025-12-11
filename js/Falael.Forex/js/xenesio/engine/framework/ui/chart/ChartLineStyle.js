"use strict";

include("StdAfx.js");

class ChartLineStyle extends ChartNode
{
	constructor(id, parentNode)
	{
		super(parentNode.id + "#" + id, null, parentNode);

		this._visible = null;
		this._color = null;
		this._width = null;
		this._strokeStyle = null;
	}


	__invalidateAspect(aspectId)
	{
		this.onChange({ aspect: aspectId });
	}

	get visible()
	{
		return this._visible;
	}

	set visible(value)
	{
		if (this._visible == value)
		{
			return;
		}
		this._visible = value;
		this.__invalidateAspect("visible");
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
		this.__invalidateAspect("color");
	}

	get width()
	{
		return this._width;
	}

	set width(value)
	{
		if (this._width == value)
		{
			return;
		}
		this._width = value;
		this.__invalidateAspect("width");
	}

	get strokeStyle()
	{
		return this._strokeStyle;
	}

	//	"dotted" | "dashed" | "solid"
	set strokeStyle(value)
	{
		if (this._strokeStyle == value)
		{
			return;
		}
		this._strokeStyle = value;
		this.__invalidateAspect("strokeStyle");
	}
}
