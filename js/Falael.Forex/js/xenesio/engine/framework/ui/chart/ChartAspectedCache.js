"use strict";

include("StdAfx.js");

class ChartAspectedCache
{
	constructor()
	{
		this._store = {};
	}

	add(elementPath, aspects, primitive)
	{
		if (primitive == "$clearAspects")
		{
			return;
		}
		var elementStore = this._store[elementPath];
		if (!elementStore)
		{
			elementStore = {};
			this._store[elementPath] = elementStore;
		}
		for (var length = aspects.length, i = 0; i < length; ++i)
		{
			var aspect = aspects[i];
			var aspectStore = elementStore[aspect];
			if (!aspectStore)
			{
				aspectStore = [];
				elementStore[aspect] = aspectStore;
			}
			aspectStore.push(primitive);
		}
	}

	_getAllPrimitivesAsWeakMap()
	{
		var result = new WeakMap();
		for (var elementPath in this._store)
		{
			var elementStore = this._store[elementPath];
			for (var aspect in elementStore)
			{
				var aspectStore = elementStore[aspect];
				for (var length = aspectStore.length, i = 0; i < length; ++i)
				{
					result.set(aspectStore[i], true);
				}
			}
		}
		return result;
	}

	_clearAspect(elementPath, aspect)
	{
		var elementStore = this._store[elementPath];
		if (!elementStore)
		{
			return [];
		}
		var aspectStore = elementStore[aspect];
		if (!aspectStore || !aspectStore.length)
		{
			return [];
		}
		elementStore[aspect] = [];
		return aspectStore;
	}

	_clearElement(elementPath)
	{
		var elementStore = this._store[elementPath];
		if (!elementStore)
		{
			return [];
		}
		var result = [];
		for (var aspect in elementStore)
		{
			result = result.concat(elementStore[aspect]);
		}
		delete this._store[elementPath];
		return result;
	}

	commit(visitedElements, aspectRegistry)
	{
		var resultCandidates = [];

		//	clear elements that were not visited
		var elementPaths = [];
		for (var elementPath in this._store)
		{
			elementPaths.push(elementPath);
		}
		for (var length = elementPaths.length, i = 0; i < length; ++i)
		{
			var elementPath = elementPaths[i];
			if (visitedElements[elementPath])
			{
				continue;
			}
			resultCandidates = resultCandidates.concat(this._clearElement(elementPath));
		}

		//	clear registered aspects
		for (var elementPath in aspectRegistry.store)
		{
			var registryElementStore = aspectRegistry.store[elementPath];
			for (var registryAspect in registryElementStore)
			{
				resultCandidates = resultCandidates.concat(this._clearAspect(elementPath, registryAspect));
			}
		}

		//	retain primitives that are referenced in other elements/aspects
		var cachedPrimitivesWeakMap = this._getAllPrimitivesAsWeakMap();

		var result = [];
		for (var length = resultCandidates.length, i = 0; i < length; ++i)
		{
			var item = resultCandidates[i];
			if (!cachedPrimitivesWeakMap.has(item)) result.push(item);
		}

		return result;
	}
}
