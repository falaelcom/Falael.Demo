"use strict";

include("StdAfx.js");

class Collection
{
	constructor(changeCallback)
	{
		this._items = [];
		this._changeCallback = changeCallback;
		this._change = new MulticastDelegate();

		return new Proxy(this,
		{
            get: function (obj, key)
			{
                if (typeof (key) === 'string' && (Number.isInteger(Number(key)))) // key is an index
                    return obj._items[key];
                else
                    return obj[key];
            },
            set: function (obj, key, value)
			{
                if (typeof (key) === 'string' && (Number.isInteger(Number(key)))) // key is an index
                    return obj._items[key] = value;
                else
                    return obj[key] = value;
            }
        });
	}

	onChange(args)
	{
		if (this._changeCallback) this._changeCallback(this, args);
		this._change.execute(this, args);
	}

	getAt(offset)
	{
		if (offset < 0)
		{
			throw "Invalid argument: offset.";
		}
		if (offset >= this._items.length)
		{
			throw "Invalid argument: offset.";
		}
		return this._items[offset];
	}

	getByPropertyValue(propertyName, value)
	{
		for (var length = this._items.length, i = 0; i < length; ++i)
		{
			var item = this._items[i];
			if (item[propertyName] == value)
			{
				return item;
			}
		}
		return null;
	}

	add(item)
	{
		this._items.push(item);
		this.onChange({ changeType: "add", item: item, offset: this._items.length - 1 });
		return item;
	}

	insert(offset, item)
	{
		if (offset < 0)
		{
			throw "Invalid argument: offset.";
		}
		if (offset > this._items.length)
		{
			throw "Invalid argument: offset.";
		}

		this._items.splice(offset, 0, item);
		this.onChange({ changeType: "add", item: item, offset: offset });
		return item;
	}

	remove(item)
	{
		var foundAt = this._items.indexOf(item);
		if (foundAt == -1)
		{
			return item;
		}
		this._items.splice(foundAt, 1);
		this.onChange({ changeType: "remove", item: item, offset: foundAt });
		return item;
	}

	removeAt(offset)
	{
		if (offset < 0)
		{
			throw "Invalid argument: offset.";
		}
		if (offset >= this._items.length)
		{
			throw "Invalid argument: offset.";
		}
		var result = this._items.splice(offset, 1);
		this.onChange({ changeType: "remove", item: result[0], offset: offset });
		return result[0];
	}

	removeByQuery(test)
	{
		var keptItems = [];
		var removedItems = [];
		var removedIndices = [];
		for (var length = this._items.length, i = 0; i < length; ++i)
		{
			var item = this._items[i];
			if (test(item, i))
			{
				removedItems.push(item);
				removedIndices.push(i);
			}
			else
			{
				keptItems.push(item);
			}
		}
		this._items = keptItems;
		for (var length = removedItems.length, i = 0; i < length; ++i) this.onChange({ changeType: "remove", item: removedItems[i], offset: removedIndices[i] });
		return removedItems;
	}

	clear()
	{
		var items = this._items;
		this._items = [];
		for (var length = items.length, i = 0; i < length; ++i) this.onChange({ changeType: "remove", item: items[i], offset: i });
	}

	toArray()
	{
		return this._items.slice(0);
	}

	get length()
	{
		return this._items.length;
	}

	get change()
	{
		return this._change;
	}
}
