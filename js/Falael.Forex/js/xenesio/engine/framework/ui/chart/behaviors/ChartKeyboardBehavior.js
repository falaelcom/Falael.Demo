"use strict";

include("StdAfx.js");

class ChartKeyboardBehavior extends Behavior
{
	constructor(control)
	{
		super(control.backplane);

		this.enableEventRole(EBrowserEventType.KeyDown, "*");

		this._keyPress = new MulticastDelegate();
	}

	onKeyPress(args)
	{
		this._keyPress.execute(this, args);
	}

	get keyPress()
	{
		return this._keyPress;
	}


	__onKeyDown(args)
	{
		switch (args.code)
		{
			case "Escape":
				this.onKeyPress({ keyCode: args.code });
				break;
		}
	}

	get control()
	{
		return this._control;
	}
}
