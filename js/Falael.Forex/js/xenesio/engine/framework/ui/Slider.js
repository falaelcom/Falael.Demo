"use strict";

include("StdAfx.js");

class Slider extends SliderVisual
{
	constructor(style, instanceCssClass, id)
	{
		super(style, instanceCssClass, id);

		this._behavior = null;
	}


	__onRendered()
	{
		this._behavior = new SliderBehavior(this.backplane, this.style == "horizontal");
		this._behavior.enabled = this._enabled;
	}

	__onEnabledChanged(value)
	{
		if (this._behavior) this._behavior.enabled = value;
	}


	onClick(args)
	{
		this._behavior.onClick(args);
	}


	get click()
	{
		return this._behavior.click;
	}
}
