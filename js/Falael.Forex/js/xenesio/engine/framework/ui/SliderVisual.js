"use strict";

include("StdAfx.js");

include("framework/sliderVisual.horizontal.css");
include("sliderVisual.horizontal", "framework/sliderVisual.horizontal.xhtml");

class SliderVisual extends Control
{
	constructor(style, instanceCssClass, id)
	{
		super(id, style, "slider", instanceCssClass, SliderVisual._stateCss_Up);

		this._min = 0;
		this.setDirty("min");

		this._max = 100;
		this.setDirty("max");

		this._value = 0;
		this.setDirty("value");

		this._decimalPlaces = 0;
		this.setDirty("decimalPlaces");

		this._state = SliderVisual.State.Up;

		this._valueChange = new MulticastDelegate();
	}


	get valueChange()
	{
		return this._valueChange;
	}

	onValueChange(args)
	{
		this._valueChange.execute(args.control, args);
	}


	__render(hostElement)
	{
		return XhtmlTemplate.apply("sliderVisual." + this.style, hostElement, null, TemplateEngine.Append);
	}

	__refresh()
	{
		if (this.isDirty("value") || this.isDirty("min") || this.isDirty("max") || this.isDirty("decimalPlaces"))
		{
			this.__elements.gripper.style.left = this.modelToDevice(this._value - this._min) + "px";
			this.__elements.text.innerHTML = Utility.Format.formatDecimal(this._value, this._decimalPlaces);
			this.__elements.textBox.value = this.__elements.text.innerHTML;
		}

		if (this.isDirty("state"))
		{
			switch (this._state)
			{
				case SliderVisual.State.Up:
					this.__stateCssClass = SliderVisual._stateCss_Up;
					break;
				case SliderVisual.State.Highlight:
					this.__stateCssClass = SliderVisual._stateCss_Highlight;
					break;
				case SliderVisual.State.Down:
					this.__stateCssClass = SliderVisual._stateCss_Down;
					break;
				case SliderVisual.State.Edit:
					this.__stateCssClass = SliderVisual._stateCss_Edit;
					break;
				default:
					throw "Not implemented." + this._state;
			}
		}
	}


	modelToDevice(value)
	{
		var modelRange = this._max - this._min;
		var deviceRange = this.__elements.rail.offsetWidth - this.__elements.gripper.offsetWidth;
		return value * deviceRange / modelRange;
	}

	deviceToModel(value)
	{
		var modelRange = this._max - this._min;
		var deviceRange = this.__elements.rail.offsetWidth - this.__elements.gripper.offsetWidth;
		return value * modelRange / deviceRange;
	}

	applyTextValue()
	{
		this.value = Number.parseFloat(this.__elements.textBox.value);
	}

	incTextValue(step)
	{
		var value = Number.parseFloat(this.__elements.textBox.value) + step;
		var factor = Math.pow(10, this._decimalPlaces);
		value = Math.round(value * factor) / factor;
		if (value < this._min) value = this._min;
		else if (value > this._max) value = this._max;

		this.__elements.textBox.value = value;
	}


	get value()
	{
		return this._value;
	}

	set value(value)
	{
		if (this._value === value)
		{
			return;
		}
		var factor = Math.pow(10, this._decimalPlaces);
		var oldValue = this._value;
		this._value = Math.round(value * factor) / factor;
		if (this._value < this._min) this._value = this._min;
		else if (this._value > this._max) this._value = this._max;
		this.setDirty("value");
		this.onValueChange({ oldValue: oldValue, newValue: this._value });
		this.refresh();
	}

	get min()
	{
		return this._min;
	}

	set min(value)
	{
		if (this._min == value)
		{
			return;
		}
		this._min = value;
		this.setDirty("min");
		this.refresh();
	}

	get max()
	{
		return this._max;
	}

	set max(value)
	{
		if (this._max == value)
		{
			return;
		}
		this._max = value;
		this.setDirty("max");
		this.refresh();
	}

	get decimalPlaces()
	{
		return this._decimalPlaces;
	}

	set decimalPlaces(value)
	{
		if (this._decimalPlaces == value)
		{
			return;
		}
		this._decimalPlaces = value;
		this.setDirty("decimalPlaces");
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
}

SliderVisual.State =
{
	Up: 1,
	Highlight: 2,
	Down: 3,
	Edit: 4,
};
SliderVisual._stateCss_Up = "up";
SliderVisual._stateCss_Highlight = "highlight";
SliderVisual._stateCss_Down = "down";
SliderVisual._stateCss_Edit = "edit";