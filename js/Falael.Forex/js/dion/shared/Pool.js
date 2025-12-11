"use strict";

module.exports =

class Pool
{
	constructor(arraySizeHint)
	{
		this._arraySizeHint = arraySizeHint || 2048;

		this._items = new Array(this._arraySizeHint);
		this._i0 = 0;
		this._i1 = 0;
	}

	add(item)
	{
		if (this._i1 >= this._items.length)
		{
			if (this._i1 - this._i0 < this._items.length / 2)
			{
				this._items.copyWithin(0, this._i0, this._i1);
				this._i1 -= this._i0;
				this._i0 = 0;
			}
			else
			{
				this._items.length *= 2;
			}
		}
		this._items[this._i1] = item;
		++this._i1;
	}

	remove(item)
	{
		const foundAt = this._items.indexOf(item);
		if (foundAt == -1) throw "Not found.";
		this.removeAt(foundAt);
	}

	removeAt(index)
	{
		if (index < this._i0 || index >= this._i1) throw "Argument is out of bounds: index.";
		//	if (index == this._i0) { ++this._i0; return; }	//	won't do that in order to keep this.base unchanged on item remove
		if (index != this._i1) this._items.copyWithin(index, index + 1, this._i1);
		--this._i1;
	}

	reset()
	{
		this._i0 = this._i1 = 0;
	}

	get items()
	{
		return this._items;
	}

	get base()
	{
		return this._i0;
	}

	get length()
	{
		return this._i1 - this._i0;
	}

	get isEmpty()
	{
		return this._i0 == this._i1;
	}
}