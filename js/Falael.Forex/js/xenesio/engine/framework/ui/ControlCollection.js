"use strict";

include("StdAfx.js");

class ControlCollection extends Collection
{
	constructor(changeCallback)
	{
		super(changeCallback);

		this._itemMap = {};
	}

	add(item)
	{
		if (!item) throw "Argument is null: item.";
		if (this._itemMap[item.id]) throw "Key is already present in the collection.";
		this._itemMap[item.id] = item;
		return super.add(item);
	}

	insert(offset, item)
	{
		if (!item) throw "Argument is null: item.";
		if (this._itemMap[item.id]) throw "Key is already present in the collection.";
		this._itemMap[item.id] = item;
		return super.insert(offset, item);
	}

	remove(item)
	{
		if (!item) throw "Argument is null: item.";
		if (!this._itemMap[item.id]) throw "Key is not present in the collection.";
		delete this._itemMap[item.id];
		return super.remove(item);
	}

	removeAt(offset)
	{
		var item = super.removeAt(offset);
		if (!item) throw "Invalid operation.";
		if (!this._itemMap[item.id]) throw "Invalid operation.";
		delete this._itemMap[item.id];
		return item;
	}

	removeById(id)
	{
		var item = this.getById(id);
		if (!item) throw "Argument is invalid: id.";
		return this.remove(item);
	}

	clear()
	{
		this._itemMap = {};
		super.clear();
	}

	getById(id)
	{
		if (!id) throw "Argument is null: id.";
		return this._itemMap[id];
	}

	has(id)
	{
		if (!id) throw "Argument is null: id.";
		return !!this._itemMap[id];
	}
}

