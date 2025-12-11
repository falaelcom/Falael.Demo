"use strict";

include("StdAfx.js");

class ChartNode
{
	constructor(id, parentPath, parentNode)
	{
		if (!id)
		{
			throw "Argument null exception: id.";
		}
		this._id = id;
		this._parentPath = parentPath;
		this._parentNode = parentNode;
		this._aspects = {};
		this._aspectValidVersions = {};

		this._suspendChangeCount = 0;
		this._change = new MulticastDelegate();
	}


	suspendChange()
	{
		++this._suspendChangeCount;
	}

	resumeChange()
	{
		if (!this._suspendChangeCount)
		{
			throw "Invalid operation.";
		}
		--this._suspendChangeCount;
	}

	onChange(args)
	{
		if (this._suspendChangeCount)
		{
			return;
		}
		this._change.execute(this, args);
	}

	getChildById(id)
	{
		var coll = this.children;
		for (var length = coll.length, i = 0; i < length; ++i)
		{
			var item = coll[i];
			if (item.id == id) return item;
		}
		return null;
	}

	getDescendantById(id)
	{
		var coll = this.children;
		for (var length = coll.length, i = 0; i < length; ++i)
		{
			var item = coll[i];
			if (item.id == id) return item;
			var result = item.getDescendantById(id);
			if (result) return result;
		}
		return null;
	}


	__enumerateChildren()
	{
		return [];
	}

	__isAspectValid(aspectId)
	{
		if (!aspectId)
		{
			throw "Argument null exception: aspectId.";
		}
		var aspectVersion = this._aspects[aspectId];
		if (aspectVersion === void (0))
		{
			return false;
		}
		return aspectVersion == this._aspectValidVersions[aspectId];
	}

	__areAspectsValid(aspectIds)
	{
		if (!aspectIds)
		{
			throw "Argument null exception: aspectId.";
		}
		for (var length = aspectIds.length, i = 0; i < length; ++i) if (!this.__isAspectValid(aspectIds[i])) return false;
		return true;
	}

	__invalidateAspect(aspectId)
	{
		if (!aspectId)
		{
			throw "Argument null exception: aspectId.";
		}
		this._aspects[aspectId] = newLUID();
	}

	__validateAllAspects()
	{
		this._aspectValidVersions = Object.assign({}, this._aspects);
	}


	set __parentNode(value)
	{
		this._parentNode = value;
	}

	set __parentPath(value)
	{
		this._parentPath = value;
	}


	get id()
	{
		return this._id;
	}

	get parentNode()
	{
		return this._parentNode;
	}

	get path()
	{
		if (!this._parentNode && !this._parentPath)
		{
			return null;
		}
		if (!this._parentNode)
		{
			return this._parentPath;
		}
		if (!this._parentPath)
		{
			return this._parentNode.path;
		}
		return this._parentNode.path + '.' + this._parentPath;
	}

	get change()
	{
		return this._change;
	}

	get children()
	{
		return this.__enumerateChildren();
	}
}
