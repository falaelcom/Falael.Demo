"use strict";

include("StdAfx.js");

include("framework/buttonVisual.textButton.css");
include("buttonVisual.textButton", "framework/buttonVisual.textButton.xhtml");

class ButtonVisual extends Control
{
	constructor(style, instanceCssClass, id)
	{
		super(id, style, "button", instanceCssClass, ButtonVisual._stateCss_Up);

		this._text = "";
		this._state = ButtonVisual.State.Up;
		this._checkedState = ButtonVisual.CheckedState.Unchecked;
	}


	__render(hostElement)
	{
		return XhtmlTemplate.apply("buttonVisual." + this.style, hostElement, null, TemplateEngine.Append);
	}

	__refresh()
	{
		if (this.isDirty("text"))
		{
			this.__elements.text.innerHTML = this._text;
		}

		if (this.isDirty("state"))
		{
			var sb = [];
			switch (this._state)
			{
				case ButtonVisual.State.Up:
					sb.push(ButtonVisual._stateCss_Up);
					break;
				case ButtonVisual.State.Highlight:
					sb.push(ButtonVisual._stateCss_Highlight);
					break;
				case ButtonVisual.State.Down:
					sb.push(ButtonVisual._stateCss_Down);
					break;
				default:
					throw "Not implemented (1). " + this._state;
			}
			switch (this._checkedState)
			{
				case ButtonVisual.CheckedState.Unchecked:
					sb.push(ButtonVisual._checkedStateCss_Unchecked);
					break;
				case ButtonVisual.CheckedState.Checked:
					sb.push(ButtonVisual._checkedStateCss_Checked);
					break;
				case ButtonVisual.CheckedState.Tentative:
					sb.push(ButtonVisual._checkedStateCss_Tentative);
					break;
				default:
					throw "Not implemented (2). " + this._checkedState;
			}
			this.__stateCssClass = sb.join(' ');
		}
	}


	get text()
	{
		return this._text;
	}

	set text(value)
	{
		if (this._text == value)
		{
			return;
		}
		this._text = value;
		this.setDirty("text");
		this.refresh();
	}

	get state()
	{
		return this._state;
	}

	set state(value)
	{
		if (this._state == value)
		{
			return;
		}
		this._state = value;
		this.setDirty("state");
		this.refresh();
	}

	get checkedState()
	{
		return this._checkedState;
	}

	set checkedState(value)
	{
		if (this._checkedState == value)
		{
			return;
		}
		this._checkedState = value;
		this.setDirty("state");
		this.refresh();
	}
}

ButtonVisual.State =
{
	Up: 1,
	Highlight: 2,
	Down: 3,
};
ButtonVisual._stateCss_Up = "up";
ButtonVisual._stateCss_Highlight = "highlight";
ButtonVisual._stateCss_Down = "down";

ButtonVisual.CheckedState =
{
	Unchecked: 1,
	Checked: 2,
	Tentative: 3,
};
ButtonVisual._checkedStateCss_Unchecked = "unchecked";
ButtonVisual._checkedStateCss_Checked = "checked";
ButtonVisual._checkedStateCss_Tentative = "tentative";
