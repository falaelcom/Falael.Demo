"use strict";

include("StdAfx.js");

class ButtonBehavior extends Behavior
{
	constructor(eventRootElement)
	{
		super(eventRootElement);

		var elementRole = eventRootElement.getAttribute("rl");
		if (elementRole == "button")
		{
			this.enableEventRole(EBrowserEventType.MouseEnter, "button");
			this.enableEventRole(EBrowserEventType.MouseLeave, "button");
		}
		else
		{
			this.enableEventRole(EBrowserEventType.MouseMove, elementRole);
		}

		this.enableEventRole(EBrowserEventType.MouseDown, "button");

		this._isPressed = false;
		this._isOver = false;
		this._control_pressed = null;
		this._control_hover = null;	//	used only in multi-control scenarios (lists of buttons within a parent control)

		this._click = new MulticastDelegate();
	}


	get click()
	{
		return this._click;
	}

	onClick(args)
	{
		this._click.execute(args.control, args);
	}


	__onMouseMove(args)
	{
		var buttonBackplaneElement = Behavior.lookupAscendentWithRole(args.element, "button");
		if (!buttonBackplaneElement)
		{
			if (this._control_hover)
			{
				this._onMouseOut(this._control_hover);
				this._control_hover = null;
			}
		}
		else
		{
			this._onMouseOver(args.control);
			this._control_hover = args.control;
		}
	}

	__onMouseEnter(args)
	{
		this._onMouseOver(args.control);
	}

	__onMouseLeave(args)
	{
		this._onMouseOut(args.control);
	}

	__onMouseDown(args)
	{
		args.control.state = ButtonVisual.State.Down;
		this._isPressed = true;
		this._control_pressed = args.control;
		this.enableEventRole(EBrowserEventType.MouseUp, "*");
	}

	__onMouseUp(args)
	{
		this._control_pressed.state = ButtonVisual.State.Up;
		if (this._isPressed && this._isOver && this._control_pressed == args.control)
		{
			this.onClick(args);
		}
		this._isPressed = false;
		this._control_pressed = null;
		this.disableEventRole(EBrowserEventType.MouseUp, "*");
	}


	_onMouseOver(control)
	{
		if (this._isPressed)
		{
			if (this._control_pressed == control)
			{
				control.state = ButtonVisual.State.Down;
			}
			else
			{
				control.state = ButtonVisual.State.Highlight;
			}
		}
		else
		{
			control.state = ButtonVisual.State.Highlight;
		}
		this._isOver = true;
	}

	_onMouseOut(control)
	{
		control.state = ButtonVisual.State.Up;
		this._isOver = false;
	}
}