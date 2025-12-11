"use strict";

include("StdAfx.js");

class ListViewBehavior extends Behavior
{
	constructor(eventRootElement)
	{
		super(eventRootElement);

		this.enableEventRole(EBrowserEventType.Click, "listViewItem");

		this._itemClick = new MulticastDelegate();
	}

	get itemClick()
	{
		return this._itemClick;
	}

	onItemClick(args)
	{
		this._itemClick.execute(this, args);
	}

	__onClick(args)
	{
		var listViewItemElement = Behavior.lookupAscendentWithRole(args.element, "listViewItem");
		var listViewItemId = listViewItemElement.getAttribute("listItemId");
		this.onItemClick({ itemId: listViewItemId })
	}
}