"use strict";

include("StdAfx.js");

include("framework/multiViewVisual.plain.css");
include("multiViewVisual.plain", "framework/multiViewVisual.plain.xhtml");

class MultiViewVisual extends Control
{
	constructor(style, instanceCssClass, id)
	{
		super(id, style, "multiView", instanceCssClass);

		this._selectedControl = null;
		this._invalidControls = [];

		this.controls.change.add(this._controls_change.bind(this));

		this._selectedControlChange = new MulticastDelegate();
	}


	onSelectedControlChange(args)
	{
		this._selectedControlChange.execute(this, args);
	}


	__render(hostElement)
	{
		return XhtmlTemplate.apply("multiViewVisual." + this.style, hostElement, null, TemplateEngine.Append);
	}

	__refresh()
	{
		if (!this.isDirty("selectedControl")) return;

		for (var length = this._invalidControls.length, i = 0; i < length; ++i)
		{
			var item = this._invalidControls[i];
			if (!item.backplane) continue;
			if (item.backplane.parentNode != this.backplane) throw "Invalid control.";
			if (item != this._selectedControl) item.visible = false;
			else item.visible = true;
			item.refresh();
		}
		this._invalidControls.length = 0;
	}

	__onEnabledChanged(value)
	{
		throw "Not implemented.";
	}


	_controls_change(sender, args)
	{
		switch (args.changeType)
		{
			case "add":
				this._invalidControls.push(args.item);
				break;
			case "remove":
				this._invalidControls.push(args.item);
				if (this._selectedControl == args.item) this._selectedControl = null;
				break;
			default:
				throw "Not implemented.";
		}
	}


	get selectedControl()
	{
		return this._selectedControl;
	}

	set selectedControl(value)
	{
		if (this._selectedControl == value)
		{
			return;
		}
		if (this._selectedControl) this._invalidControls.push(this._selectedControl);
		if (value) this._invalidControls.push(value);
		var oldValue = this._selectedControl;
		this._selectedControl = value;
		this.setDirty("selectedControl");
		this.onSelectedControlChange({ oldValue: oldValue, value: value });
	}


	get selectedControlChange()
	{
		return this._selectedControlChange;
	}
}