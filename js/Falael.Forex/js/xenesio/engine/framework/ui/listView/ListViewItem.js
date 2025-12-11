"use strict";

include("StdAfx.js");

class ListViewItem
{
	constructor(value)
	{
		if (!value)
		{
			throw "Argument is null: value.";
		}
		this._value = value;

		this._id = newLUID();
		this._state = ListViewItem.State.Normal;

		this._change = new MulticastDelegate();
		this._itemChangeRegistry = new DelegateRegistry();

		this.__renderCache = null;

		if (value.change) this._itemChangeRegistry.add(value.change, function (sender, args) { this.onChange({ type: "valueProperty", value: value, details: args }); }.bind(this));
	}


	onChange(args)
	{
		this._change.execute(this, args);
	}


	get value()
	{
		return this._value;
	}

	set value(value)
	{
		if (!value)
		{
			throw "Argument is null: value.";
		}
		if (this._value == value)
		{
			return;
		}
		this._itemChangeRegistry.remove(this._value.change);
		this._value = value;
		if (value.change) this._itemChangeRegistry.add(value.change, function (sender, args) { this.onChange({ type: "valueProperty", value: value, details: args }); });
		this.onChange({ type: "value", value: value });
	}

	get id()
	{
		return this._id;
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

		if (this.__renderCache && this.__renderCache.itemElements.itemRootElement)
		{
			this.__renderCache.itemElements.itemRootElement.classList.remove(ListViewItem._stateCss_Normal);
			this.__renderCache.itemElements.itemRootElement.classList.remove(ListViewItem._stateCss_Highlight);
			this.__renderCache.itemElements.itemRootElement.classList.remove(ListViewItem._stateCss_Selected);
			this.__renderCache.itemElements.itemRootElement.classList.add(this.stateClassName);
		}

		this.onChange({ type: "state", value: value });
	}

	get stateClassName()
	{
		switch (this._state)
		{
			case ListViewItem.State.Normal:
				return ListViewItem._stateCss_Normal;
			case ListViewItem.State.Highlight:
				return ListViewItem._stateCss_Highlight;
			case ListViewItem.State.Selected:
				return ListViewItem._stateCss_Selected;
			default:
				throw "Not implemented." + this._state;
		}
	}


	get change()
	{
		return this._change;
	}
}

ListViewItem.State =
{
	Normal: 1,
	Highlight: 2,	//	currently not in use
	Selected: 3,
};
ListViewItem._stateCss_Normal = "normal";
ListViewItem._stateCss_Highlight = "highlight";		//	currently not in use
ListViewItem._stateCss_Selected = "selected";