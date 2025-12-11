"use strict";

include("StdAfx.js");

class ListView extends ListViewVisual
{
	//	itemRenderer: function(hostElement, listViewItem: ListViewItem, itemIndex: Number)
	constructor(style, instanceCssClass, id, itemRenderer)
	{
		super(style, instanceCssClass, id, itemRenderer);

		this._behavior = null;
		this._selectionChange = new MulticastDelegate();
	}


	onSelectionChange(args)
	{
		this._selectionChange.execute(this, args);
	}


	__onRendered()
	{
		this._behavior = new ListViewBehavior(this.backplane);
		this._behavior.itemClick.add(this._behavior_itemClick.bind(this));
		this._behavior.enabled = this._enabled;
	}

	__onEnabledChanged(value)
	{
		if (this._behavior) this._behavior.enabled = value;
	}

	__setSelectedItem(value)
	{
		this.onSelectionChange({ selectedItem: this._selectedItem });
	}


	_behavior_itemClick(sender, args)
	{
		this.selectedItem = this.getItemById(args.itemId);
	}


	get selectionChange()
	{
		return this._selectionChange;
	}
}
