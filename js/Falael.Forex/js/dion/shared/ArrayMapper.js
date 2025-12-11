"use strict";

const ArrayView = require("@shared/ArrayView.js");

module.exports =

class ArrayMapper extends ArrayView
{
	//	mapping: { a: "x", b: ArrayMapper.Calculators.mul(100, "y"), c: (m) => m.y + 1 }
	constructor(arg, mapping, defaultValues, viewOrigin, viewSize)
	{
		super(arg, viewOrigin, viewSize);
		this._mapping = mapping;
		this._defaultValues = defaultValues;
		this._valueAccessorKeys = [];
		for (var key in this._mapping) this._valueAccessorKeys.push(key);
	}

	static wrap(arg)
	{
		if (arg instanceof ArrayMapper) return arg;
		return new ArrayMapper(arg);
	}

	//	overrides
	clone()
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		return new ArrayMapper(this.__items, this._mapping, this._defaultValues, this.__viewOrigin, this.__viewSize);
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
		return new ArrayMapper(this.__items, this._mapping, this._defaultValues, this.__viewOrigin + start, length);
	}

	remap(mapping, merge)
	{
		if (this.__items.length != this.__originalItemsLength) throw "Invalid operation.";	//	items array was modified from the outside
		if (merge) Object.assign(this._mapping, mapping);
		else this._mapping = mapping;
		return this;
	}

	valueOf(item, valueAccessorKey, index)
	{
		if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
		var defaultValue = this._defaultValues ? this._defaultValues[valueAccessorKey] : null;
		if (defaultValue === void (0)) defaultValue = null;
		if (item === void (0) || item === null) return defaultValue;
		if (!this._mapping || !this._mapping[valueAccessorKey])
		{
			item = item[valueAccessorKey];
			if (item === void (0) || item === null) return defaultValue;
			return item;
		}
		const mapper = this._mapping[valueAccessorKey];
		if (mapper instanceof Function) item = mapper(item, index, this);
		else item = item[mapper];
		if (item === void (0) || item === null) return defaultValue;
		return item;
	}

	//	returns an ArrayView with the same items, view origin and view size
	unwrap()
	{
		return super.clone();
	}


	toArrayM(...valueAccessorKeys)
	{
		if (!valueAccessorKeys && !this._valueAccessorKeys) throw "Argument is invalid: valueAccessorKey.";
		if (this._valueAccessorKeys) valueAccessorKeys = valueAccessorKeys.concat(this._valueAccessorKeys);
		return super.toArray(...valueAccessorKeys);
	}

	getM(index, ...valueAccessorKeys)
	{
		if (!valueAccessorKeys && !this._valueAccessorKeys) throw "Argument is invalid: valueAccessorKey.";
		if (this._valueAccessorKeys) valueAccessorKeys = valueAccessorKeys.concat(this._valueAccessorKeys);
		var result = {};
		for (var length = valueAccessorKeys.length, i = 0; i < length; ++i)
		{
			var valueAccessorKey = valueAccessorKeys[i];
			result[valueAccessorKey] = super.get(index, valueAccessorKey);
		}
		return result;
	}


	get mapping()
	{
		return Object.assign({}, this._mapping);
	}


	static mapByKey(arr, valueAccessorFunction, stackDuplicates)
	{
		const result = {};
		for (let length = arr.length, i = 0; i < length; ++i)
		{
			const m = arr[i];
			const key = valueAccessorFunction(m, i, arr);
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

	static get Calculators()
	{
		if (!ArrayMapper._Calculators)
		{
			ArrayMapper._Calculators = {};
			ArrayMapper._Calculators.add = (value, valueAccessorKey) =>
			{
				if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
				return (m, i, arm) => { const r = arm.valueOf(m, valueAccessorKey, i); return r === void (0) || r === null ? r : r + value; };
			}
			ArrayMapper._Calculators.mul = (value, valueAccessorKey) =>
			{
				if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
				return (m, i, arm) => { const r = arm.valueOf(m, valueAccessorKey, i); return r === void (0) || r === null ? r : r * value; };
			}
			ArrayMapper._Calculators.sign = (valueAccessorKey) =>
			{
				if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
				return (m, i, arm) => { const r = arm.valueOf(m, valueAccessorKey, i); return r === void (0) || r === null ? r : Math.sign(r); };
			}
			ArrayMapper._Calculators.abs = (valueAccessorKey) =>
			{
				if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
				return (m, i, arm) => { const r = arm.valueOf(m, valueAccessorKey, i); return r === void (0) || r === null ? r : Math.abs(r); };
			}
			ArrayMapper._Calculators.sqrt = (valueAccessorKey) =>
			{
				if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
				return (m, i, arm) => { const r = arm.valueOf(m, valueAccessorKey, i); return r === void (0) || r === null ? r : Math.sqrt(r); };
			}
			ArrayMapper._Calculators.pow = (value, valueAccessorKey) =>
			{
				if (!valueAccessorKey) throw "Argument is invalid: valueAccessorKey.";
				return (m, i, arm) => { const r = arm.valueOf(m, valueAccessorKey, i); return r === void (0) || r === null ? r : Math.pow(r, value); };
			}
		}
		return ArrayMapper._Calculators;
	}
}
