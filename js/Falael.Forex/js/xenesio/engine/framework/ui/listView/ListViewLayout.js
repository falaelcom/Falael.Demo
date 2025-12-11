"use strict";

include("StdAfx.js");

class ListViewLayout
{
	constructor()
	{
		this._rootElementRendered = false;

		this._rootElement = null;
		this._containerElement = null;
	}


	__renderRootElement(hostElement)
	{
	}

	__renderItems(rootElement, itemRenderer, itemsChangeLog)
	{
	}

	__clear(rootElement)
	{
	}


	renderRootElement(hostElement)
	{
		if (this._rootElementRendered) throw "Invalid operation.";

		var elements = this.__renderRootElement(hostElement)
		this._rootElement = elements.root;
		if (!this._rootElement) throw "Invalid operation.";
		this._containerElement = elements.container;
		if (!this._containerElement) throw "Invalid operation.";
		this._rootElementRendered = true;
	}

	renderItems(itemRenderer, itemsChangeLog)
	{
		this.__renderItems(this._containerElement, itemRenderer, itemsChangeLog);
	}

	clear()
	{
		this.__clear(this._containerElement);
	}


	get rootElementRendered()
	{
		return this._rootElementRendered;
	}
}
