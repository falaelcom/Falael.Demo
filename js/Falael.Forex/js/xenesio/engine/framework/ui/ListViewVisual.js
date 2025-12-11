"use strict";

include("StdAfx.js");

include("framework/ui/listView/ListViewItem.js");
include("framework/ui/listView/ListViewLayout.js");
include("framework/ui/listView/ListViewBehavior.js");
include("framework/ui/listView/ListViewVerticalLayout.js");

include("framework/listViewVisual.css");
include("framework/listViewVisual.verticalList.css");
include("listViewVisual.verticalList", "framework/listViewVisual.verticalList.xhtml");

class ListViewVisual extends Control
{
	//	itemRenderer:
	//	{
	//		render: function(hostElement, listViewItem: ListViewItem),
	//		refresh: function(itemElement, listViewItem: ListViewItem),
	//	}
	constructor(style, instanceCssClass, id, itemRenderer)
	{
		super(id, style, "listView", instanceCssClass);

		this._itemRenderer = itemRenderer;

		this._layout = null;

		this._items = new Collection(this._items_change.bind(this));
		this._itemChangeRegistry = new DelegateRegistry();
		this._itemIdMap = {};

		this._itemsChangeLog = [];

		this._selectedItem = null;
	}

	__render(hostElement)
	{
		var elements = XhtmlTemplate.apply("listViewVisual." + this.style, hostElement, null, TemplateEngine.Append);
		if (this.isDirty("style")) this._layout = ListViewVisual._createLayout(this.style);
		this._layout.renderRootElement(elements.backplane);
		return elements;
	}

	__refresh()
	{
		if (!this.isDirty("style") && !this.isDirty("items"))
		{
			return;
		}

		if (this._itemsChangeLog.length)
		{
			this._layout.renderItems(this._itemRenderer, this._itemsChangeLog);
			this._itemsChangeLog = [];
		}

		this.clearDirty("items");
	}

	__buildCssClassText(sb)
	{
		sb.push(this.style);
	}

	__setSelectedItem(value)
	{
	}


	getItemById(id)
	{
		return this._itemIdMap[id];
	}


	static _createLayout(style)
	{
		switch (style)
		{
			case "verticalList":
				return new ListViewVerticalLayout();
			default:
				throw "Not implemented.";
		}
	}


	_items_change(sender, args)
	{
		this.setDirty("items");
		switch (args.changeType)
		{
			case "add":
				if (!(args.item instanceof ListViewItem))
				{
					throw "Invalid operation.";
				}
				this._itemChangeRegistry.add(args.item.change, this._item_change.bind(this));
				if (this._itemIdMap[args.item.id])
				{
					throw "Item is already in the collection.";
				}
				this._itemIdMap[args.item.id] = args.item;
				this._itemsChangeLog.push(
				{
					type: "insert",
					index: args.offset,
					item: args.item
				});
				break;
			case "remove":
				this._itemChangeRegistry.remove(args.item.change);
				delete this._itemIdMap[args.item.id];
				this._itemsChangeLog.push(
				{
					type: "remove",
					item: args.item
				});
				if (args.item == this.selectedItem)
				{
					this.selectedItem = null;
				}
				break;
			default:
				throw "Not implemented.";
		}
	}

	_item_change(sender, args)
	{
		switch (args.type)
		{
			case "state":
				break;
			case "value":
			case "valueProperty":
				this._itemsChangeLog.push(
				{
					type: "update",
					item: sender
				});
				this.setDirty("items");
				break;
			default:
				throw "Not implemented.";
		}
	}

	get itemRenderer()
	{
		return this._itemRenderer;
	}

	get items()
	{
		return this._items;
	}


	get selectedItem()
	{
		return this._selectedItem;
	}

	set selectedItem(value)
	{
		if (this._selectedItem == value)
		{
			return;
		}
		if (this._selectedItem) this._selectedItem.state = ListViewItem.State.Normal;
		this._selectedItem = value;
		if (this._selectedItem) this._selectedItem.state = ListViewItem.State.Selected;
		this.__setSelectedItem(this._selectedItem);
	}
}
