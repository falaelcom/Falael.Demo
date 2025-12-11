"use strict";

include("StdAfx.js");

class Button extends ButtonVisual
{
	constructor(style, instanceCssClass, id)
	{
		super(style, instanceCssClass, id);

		this._behavior = null;
	}


	__onRendered()
	{
		this._behavior = new ButtonBehavior(this.backplane);
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
