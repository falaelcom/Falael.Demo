"use strict";

include("StdAfx.js");

class ChartLabelStyle extends ChartNode
{
	constructor(id, parentNode)
	{
		super(parentNode.id + "#" + id, null, parentNode);

		this._visible = null;
		this._fontFamilty = null;
		this._fontSize = null;
		this._fontWeight = null;
		this._fontFill = null;
		this._formatter = null;

		this._fontStylesValidVersion = newLUID();
		this._fontStylesVersion = newLUID();
		this._fontStylesCache = null;
	}


	__invalidateAspect(aspectId)
	{
		this.onChange({ aspect: aspectId });
	}


	measureText(text)
	{
		return window.measureText(text, this._fontSize + "px " + this._fontFamilty);
	}


	get fontStyles()
	{
		if (this._fontStylesValidVersion != this._fontStylesVersion)
		{
			this._fontStylesCache =
			{
				family: this.fontFamilty,
				size: this.fontSize,
				leading: this.fontSize,
				weight: this.fontWeight,
				fill: this.fontFill,
			};
			this._fontStylesValidVersion = this._fontStylesVersion;
		}

		return this._fontStylesCache;
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

	get fontFamilty()
	{
		return this._fontFamilty;
	}

	set fontFamilty(value)
	{
		if (this._fontFamilty == value)
		{
			return;
		}
		this._fontFamilty = value;
		this.__invalidateAspect("fontFamily");
		this._rangeStartFontStylesVersion = newLUID();
	}

	get fontSize()
	{
		return this._fontSize;
	}

	set fontSize(value)
	{
		if (this._fontSize == value)
		{
			return;
		}
		this._fontSize = value;
		this.__invalidateAspect("fontSize");
		this._rangeStartFontStylesVersion = newLUID();
	}

	get fontWeight()
	{
		return this._fontWeight;
	}

	set fontWeight(value)
	{
		if (this._fontWeight == value)
		{
			return;
		}
		this._fontWeight = value;
		this.__invalidateAspect("fontWeight");
		this._rangeStartFontStylesVersion = newLUID();
	}

	get fontFill()
	{
		return this._fontFill;
	}

	set fontFill(value)
	{
		if (this._fontFill == value)
		{
			return;
		}
		this._fontFill = value;
		this.__invalidateAspect("fontFill");
		this._rangeStartFontStylesVersion = newLUID();
	}

	get formatter()
	{
		return this._formatter;
	}

	set formatter(value)
	{
		if (this._formatter == value)
		{
			return;
		}
		this._formatter = value;
		this.__invalidateAspect("formatter");
	}
}
