"use strict";

include("StdAfx.js");

class SliderBehavior extends Behavior
{
	constructor(eventRootElement, isHorizontal)
	{
		super(eventRootElement);

		this._isHorizontal = isHorizontal;

		var elementRole = eventRootElement.getAttribute("rl");
		if (elementRole == "slider")
		{
			this.enableEventRole(EBrowserEventType.MouseEnter, "slider");
			this.enableEventRole(EBrowserEventType.MouseLeave, "slider");
		}
		else
		{
			this.enableEventRole(EBrowserEventType.MouseMove, elementRole);
		}

		this.enableEventRole(EBrowserEventType.MouseDown, "slider");
		this.enableEventRole(EBrowserEventType.DblClick, "slider");
		this.enableEventRole(EBrowserEventType.Wheel, "slider");

		this._isPressed = false;
		this._isOver = false;
		this._isEditing = false;
		this._control_pressed = null;
		this._control_hover = null;	//	used only in multi-control scenarios (lists of sliders within a parent control)
		this._control_edit = null;
		this._initialMouseOffset = null;
		this._initialValue = null;

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
		if (this._isEditing) return;

		if (this._isPressed)
		{
			var mouseOffset = this._isHorizontal ? args.localX : args.localY;
			var mouseDelta = mouseOffset - this._initialMouseOffset;
			this._control_pressed.value = this._initialValue + this._control_pressed.deviceToModel(mouseDelta);
			return;
		}

		var sliderBackplaneElement = Behavior.lookupAscendentWithRole(args.element, "slider");
		if (!sliderBackplaneElement)
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
		if (this._isEditing) return;

		args.control.state = SliderVisual.State.Down;
		this._isPressed = true;
		this._control_pressed = args.control;
		this.enableEventRole(EBrowserEventType.MouseMove, "*");
		this.enableEventRole(EBrowserEventType.MouseUp, "*");
		this._initialMouseOffset = this._isHorizontal ? args.localX : args.localY;
		this._initialValue = args.control.value;
	}

	__onMouseUp(args)
	{
		if (this._isEditing) return;

		this._control_pressed.state = SliderVisual.State.Up;
		if (this._isPressed && this._isOver && this._control_pressed == args.control)
		{
			this.onClick(args);
		}
		this._isPressed = false;
		this._control_pressed = null;
		this.disableEventRole(EBrowserEventType.MouseMove, "*");
		this.disableEventRole(EBrowserEventType.MouseUp, "*");
		this._initialMouseOffset = null;
		this._initialValue = null;
	}

	__onDblClick(args)
	{
		if (this._isEditing) return;

		args.control.state = SliderVisual.State.Edit;
		this._control_edit = args.control;
		this.enableEventRole(EBrowserEventType.KeyDown, "*");
		this.enableEventRole(EBrowserEventType.Wheel, "*");
		this._isEditing = true;
	}

	__onKeyDown(args)
	{
		switch (args.code)
		{
			case "Enter":
				this._control_edit.applyTextValue();
				break;
			case "Escape":
				break;
			default:
				return;
		}

		this._onEndEdit();
	}

	__onWheel(args)
	{
		if (!args.deltaY) return;

		switch (args.control.state)
		{
			case SliderVisual.State.Edit:
				var deltaFactor = Math.sign(args.deltaY) * Math.pow(10, -this._control_edit.decimalPlaces);
				if (args.keys.ctrlKey) deltaFactor *= 10;
				this._control_edit.incTextValue(deltaFactor);
				break;
			default:
				var deltaFactor = Math.sign(args.deltaY) * Math.pow(10, -args.control.decimalPlaces);
				if (args.keys.ctrlKey) deltaFactor *= 10;
				args.control.incTextValue(deltaFactor);
				args.control.applyTextValue();
				break;

		}

		return true;
	}


	_onMouseOver(control)
	{
		if (this._isEditing) return;
		if (this._isPressed) return;

		control.state = SliderVisual.State.Highlight;
		this._isOver = true;
	}

	_onMouseOut(control)
	{
		if (this._isEditing) return;
		if (this._isPressed) return;

		control.state = SliderVisual.State.Up;
		this._isOver = false;
	}

	_onEndEdit()
	{
		this._control_edit.state = SliderVisual.State.Up;
		this.disableEventRole(EBrowserEventType.KeyDown, "*");
		this.disableEventRole(EBrowserEventType.Wheel, "*");
		this._control_edit = null;
		this._isEditing = false;
	}
}