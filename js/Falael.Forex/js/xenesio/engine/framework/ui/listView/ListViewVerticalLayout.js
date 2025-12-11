"use strict";

include("StdAfx.js");

include("listViewVisual.verticalLayout.container", "framework/listViewVisual.verticalLayout.container.xhtml");
include("listViewVisual.verticalLayout.item", "framework/listViewVisual.verticalLayout.item.xhtml");

class ListViewVerticalLayout extends ListViewLayout
{
	constructor()
	{
		super();
	}

	__renderRootElement(hostElement)
	{
		return XhtmlTemplate.apply("listViewVisual.verticalLayout.container", hostElement, null, TemplateEngine.Append);
	}

	__renderItems(rootElement, itemRenderer, itemsChangeLog)
	{
		if (!itemRenderer.render || !itemRenderer.refresh)
		{
			throw "Argument is invalid: itemRenderer.";
		}

		for (var length = itemsChangeLog.length, i = 0; i < length; ++i)
		{
			var instruction = itemsChangeLog[i];
			switch (instruction.type)
			{
				case "insert":	//	instruction: {type: String, index: Number, item: Object}
					var itemRootElement = null;
					var fields =
					{
						listItemId: instruction.item.id,
						stateClassName: instruction.item.stateClassName,
					};
					if (instruction.index == 0)
					{
						itemRootElement = XhtmlTemplate.apply("listViewVisual.verticalLayout.item", rootElement, fields, TemplateEngine.Prepend).item;
					}
					else
					{
						var anchorElement = rootElement.children[instruction.index - 1];
						if (!anchorElement) throw "Invalid operation.";
						itemRootElement = XhtmlTemplate.apply("listViewVisual.verticalLayout.item", anchorElement, fields, TemplateEngine.InsertAfter).item;
					}
					var elements = itemRenderer.render(itemRootElement, instruction.item);
					if (!elements) throw "Invalid result.";
					var itemElements = Object.assign({ itemRootElement: itemRootElement }, elements);
					instruction.item.__renderCache = { itemElements: itemElements };
					break;
				case "remove":	//	instruction: {type: String, item: Object}
					rootElement.removeChild(instruction.item.__renderCache.itemElements.itemRootElement);
					instruction.item.__renderCache = null;
					break;
				case "update":	//	instruction: {type: String, item: Object}
					itemRenderer.refresh(instruction.item.__renderCache.itemElements.itemRootElement, instruction.item);
					break;
				default:
					throw "Not implemented.";
			}
		}
	}

	__clear(rootElement)
	{
		rootElement.innerHTML = "";
	}
}
