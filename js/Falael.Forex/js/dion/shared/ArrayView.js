"use strict";

module.exports =

class ArrayView
{
	constructor(arg, viewOrigin, viewSize)
	{
		if (!arg) throw "Argument is null: arg.";
		if (viewOrigin === null) throw "Argument is null: viewOrigin.";
		if (viewSize === null) throw "Argument is null: viewSize.";

		if (viewOrigin !== void (0) && viewOrigin < 0) throw "Invalid argument: viewOrigin.";
		if (viewSize !== void (0) && viewSize < 0) throw "Invalid argument: viewSize.";

		if (arg instanceof ArrayView)
		{
			this.__items = arg.__items;
			this.__viewOrigin = viewOrigin !== void (0) ? viewOrigin : arg.__viewOrigin;
			this.__viewSize = viewSize !== void (0) ? viewSize : arg.__viewSize;
		}
		else
		{
			this.__items = arg;
			this.__viewOrigin = viewOrigin || 0;
			this.__viewSize = viewSize !== void (0) ? viewSize : arg.length - this.__viewOrigin;
		}

		if (this.__viewOrigin + this.__viewSize > this.__items.length) throw "Invalid operation.";
		if (this.__viewOrigin < 0) throw "Invalid operation.";
		if (this.__viewSize < 0) throw "Invalid operation.";

		this.__originalItemsLength = this.__items.length;
	}

	static wrap(arg)
	{
		if (arg instanceof ArrayView) return arg;
		return new ArrayView(arg);
	}

	//	overridables
	clone()
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		return new ArrayView(this.__items, this.__viewOrigin, this.__viewSize);
	}

	extract(start, length)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		start = start || 0;
		length = length || this.__viewSize - start;
		if (start < 0) throw "Out of bounds: start.";
		if (start > this.__viewSize) throw "Out of bounds: start.";
		if (length < 0) throw "Out of bounds: length.";
		if (start + length > this.__viewSize) throw "Out of bounds: length.";
		return new ArrayView(this.__items, this.__viewOrigin + start, length);
	}

	move(viewOrigin)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (viewOrigin === void (0) || viewOrigin === null) throw "Argument is null: viewOrigin.";
		if (viewOrigin < 0) throw "Argument is invalid: viewOrigin.";
		if (viewOrigin + this.__viewSize > this.__items.length) throw "Argument is invalid: viewOrigin.";
		this.__viewOrigin = viewOrigin;
		return this;
	}

	resize(viewSize)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (viewSize === void (0) || viewSize === null) throw "Argument is null: viewSize.";
		if (viewSize < 0) throw "Argument is invalid: viewSize.";
		if (this.__viewOrigin + viewSize > this.__items.length) throw "Argument is invalid: viewSize.";
		this.__viewSize = viewSize;
		return this;
	}

	transform(viewOrigin, viewSize)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (viewOrigin === void (0) || viewOrigin === null) throw "Argument is null: viewOrigin.";
		if (viewOrigin < 0) throw "Argument is invalid: viewOrigin.";
		if (viewSize === void (0) || viewSize === null) throw "Argument is null: viewSize.";
		if (viewSize < 0) throw "Argument is invalid: viewSize.";
		if (viewOrigin + viewSize > this.__items.length) throw "Invalid operation.";
		this.__viewOrigin = viewOrigin;
		this.__viewSize = viewSize;
		return this;
	}

	get(index, valueAccessorKey)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (index < 0) throw "Out of bounds: index.";
		if (index >= this.__viewSize) throw "Argument is invalid: index.";
		const item = this.__items[this.__viewOrigin + index];
		if (!valueAccessorKey) return item;
		return this.valueOf(item, valueAccessorKey, index);
	}

	//	this method is provided mainly as a trivial implementation of ArrayMapper.valueOf
	valueOf(item, valueAccessorKey, index)
	{
		if (item === void (0) || item === null) return null;
		if (!valueAccessorKey) return item;
		item = item[valueAccessorKey];
		if (item === void (0) || item === null) return null;
		return item;
	}

	//	if valueAccessorKeys is empty returns a shallow copy of the underlying array
	//	else returns an array with elements containing only the properties corresponding the valueAccessorKeys
	//	if used as an inherited method of ArrayMapper, applies calculated values to the new array
	toArray(...valueAccessorKeys)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside

		if (!valueAccessorKeys.length) return this.__items.slice(this.__viewOrigin, this.__viewOrigin + this.__viewSize);

		const result = [];
		for (let length = this.length, i = 0; i < length; ++i)
		{
			if (valueAccessorKeys.length == 1)
			{
				result.push(this.get(i, valueAccessorKeys[0]));
				continue;
			}
			const item = {};
			result.push(item);
			for (let jlength = valueAccessorKeys.length, j = 0; j < jlength; ++j)
			{
				const valueAccessorKey = valueAccessorKeys[j];
				item[valueAccessorKey] = this.get(i, valueAccessorKey);
			}
		}
		return result;
	}

	map(produceItem)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!produceItem) throw "Argument is null: produceItem.";
		const result = [];
		for (let length = this.__viewSize, i = 0; i < length; ++i) result.push(produceItem(this.__items[this.__viewOrigin + i], i, this));
		return result;
	}


	//	interface
	first(valueAccessorKey)
	{
		return this.get(0, valueAccessorKey);
	}

	last(valueAccessorKey)
	{
		return this.get(this.length - 1, valueAccessorKey);
	}

	firstMin(valueAccessorKey)
	{
		let value = Infinity;
		let index = -1;
		for (let length = this.length, i = 0; i < length; ++i)
		{
			let item = this.get(i, valueAccessorKey);
			if (item >= value) continue;
			value = item;
			index = i;
		}
		return index == -1 ? null : this.get(index);
	}

	lastMin(valueAccessorKey)
	{
		let value = Infinity;
		let index = -1;
		for (let length = this.length, i = 0; i < length; ++i)
		{
			let item = this.get(i, valueAccessorKey);
			if (item > value) continue;
			value = item;
			index = i;
		}
		return index == -1 ? null : this.get(index);
	}

	firstMax(valueAccessorKey)
	{
		let value = -Infinity;
		let index = -1;
		for (let length = this.length, i = 0; i < length; ++i)
		{
			let item = this.get(i, valueAccessorKey);
			if (item <= value) continue;
			value = item;
			index = i;
		}
		return index == -1 ? null : this.get(index);
	}

	lastMax(valueAccessorKey)
	{
		let value = -Infinity;
		let index = -1;
		for (let length = this.length, i = 0; i < length; ++i)
		{
			let item = this.get(i, valueAccessorKey);
			if (item < value) continue;
			value = item;
			index = i;
		}
		return index == -1 ? null : this.get(index);
	}

	indexOf(testItem)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!testItem) throw "Argument is null: testItem.";
		for (let length = this.__viewSize, i = 0; i < length; ++i) if (testItem(this.__items[this.__viewOrigin + i], i, this)) return i;
		return -1;
	}

	indicesOf(testItem)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!testItem) throw "Argument is null: testItem.";
		var result = [];
		for (let length = this.__viewSize, i = 0; i < length; ++i) if (testItem(this.__items[this.__viewOrigin + i], i, this)) result.push(i);
		return result;
	}

	indexOfValue(value, valueAccessorKey)
	{
		return this.indexOf((item, i) => this.get(i, valueAccessorKey) == value);
	}

	modifyItems(modifyItem)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!modifyItem) throw "Argument is null: modifyItem.";
		for (let length = this.__viewSize, i = 0; i < length; ++i)
		{
			const item = modifyItem(this.__items[this.__viewOrigin + i], i, this);
			if (item !== void (0)) this.__items[this.__viewOrigin + i] = item;
		}
	}

	countOf(testItem)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!testItem) throw "Argument is null: testItem.";
		var result = 0;
		for (let length = this.__viewSize, i = 0; i < length; ++i) if (testItem(this.__items[this.__viewOrigin + i], i, this)) ++result;
		return result;
	}


	//	transformations

	//	for non-object-element arvs
	//		compare = (l, r) => l - r
	//	for object-element arvs
	//		compare = (l, r) => {arv.valueOf(l, "x") - arv.valueOf(r, "x")}
	//	a sorted version of this.toArray()
	sortedArray(compare, ...valueAccessorKeys)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside

		const result = this.toArray(...valueAccessorKeys);
		result.sort(compare);
		return result;
	}

	filteredArray(testItem)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!testItem) throw "Argument is null: testItem.";
		const result = [];
		for (let length = this.__viewSize, i = 0; i < length; ++i)
		{
			var item = this.get(i);
			if (testItem(item, i, this)) result.push(item);
		}
		return result;
	}

	pickArray(indices)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (!indices) throw "Argument is null: testItem.";
		const result = [];
		for (let length = indices.length, i = 0; i < length; ++i) result.push(this.get(indices[i]));
		return result;

	}


	static extendArray(arr, length, value)
	{
		if (arr.length >= length) return;
		for (let i = arr.length; i < length; ++i) arr[i] = value;
		if (arr.length != length) throw "Assertion failed.";
	}

	static mapByKey(arr, valueAccessorKey_key, stackDuplicates)
	{
		const arv = ArrayView.wrap(arr);
		const result = {};
		for (let length = arv.length, i = 0; i < length; ++i)
		{
			const m = arv.get(i);
			const key = arv.get(i, valueAccessorKey_key);
			if (!stackDuplicates) result[key] = m;
			else
			{
				const existing = result[key];
				if (!existing) result[key] = m;
				else
				{
					if (Array.isArray(existing)) existing.push(m);
					else result[key] = [existing, m];
				}
			}
		}
		return result;
	}


	get length()
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside

		return this.__viewSize;
	}


	get viewOrigin()
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside

		return this.__viewOrigin;
	}

	get viewBoundary()
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside

		return this.__viewOrigin + this.__viewSize - 1;
	}

	get viewSize()
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside

		return this.__viewSize;
	}
}
