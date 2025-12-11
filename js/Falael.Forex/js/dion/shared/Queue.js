"use strict";

module.exports =

class Queue
{
	constructor(arraySizeHint)
	{
		this._arraySizeHint = arraySizeHint || 2048;

		this._items = new Array(this._arraySizeHint);
		this._i0 = 0;
		this._i1 = 0;
	}

	enqueue(item)
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

	dequeue()
	{
		return this._items[++this._i0 - 1];
	}

	reset()
	{
		this._i0 = this._i1 = 0;
	}

	lookup(offset, tail)
	{
		if (this._i1 - this._i0 <= offset) throw "Invalid operation.";
		if (tail) return this._items[this._i0 + offset];
		return this._items[this._i1 - offset - 1];
	}

	get head()
	{
		if (this._i0 == this._i1) throw "Invalid operation.";
		return this._items[this._i1];
	}

	get tail()
	{
		if (this._i0 == this._i1) throw "Invalid operation.";
		return this._items[this._i0];
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