"use strict";

include("StdAfx.js");

class ChartAspectRegistry
{
	constructor()
	{
		this._store = {};
	}

	registerAspects(elementPath, aspects)
	{
		var elementStore = this._store[elementPath];
		if (!elementStore)
		{
			elementStore = {};
			this._store[elementPath] = elementStore;
		}
		for (var length = aspects.length, i = 0; i < length; ++i)
		{
			elementStore[aspects[i]] = true;
		}
	}

	get store()
	{
		return this._store;
	}
}
