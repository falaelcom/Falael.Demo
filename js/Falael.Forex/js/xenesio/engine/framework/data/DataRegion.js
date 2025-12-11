"use strict";

include("StdAfx.js");

class DataRegion extends Range
{
	constructor(min, max, authorativeValue_first, authorativeValue_last)
	{
		super(min, max);

		this._authorativeValue_first = authorativeValue_first;	//	null means there are no authorative values in the region
		this._authorativeValue_last = authorativeValue_last;	//	null means there are no authorative values in the region
	}

	static fromRange(range, authorativeValue_first, authorativeValue_last)
	{
		return new DataRegion(range.min, range.max, authorativeValue_first, authorativeValue_last);
	}

	clone()
	{
		return new DataRegion(this._min, this._max, this._authorativeValue_first, this._authorativeValue_last);
	}


	static normalizeRanges(rangeArray)
	{
		if (!rangeArray) return null;
		if (!rangeArray.length) return [];
		var arr = rangeArray.slice(0);
		arr.sort((left, right) => left.min - right.min);
		var prevItem = arr[0];
		var result = [prevItem];
		for (var length = arr.length, i = 1; i < length; ++i)
		{
			var item = arr[i];
			if (prevItem.max >= item.min)
			{
				var resultItem = result[result.length - 1].clone();
				if (resultItem.authorativeValue_first === null) resultItem.authorativeValue_first = item.authorativeValue_first;
				if (item.authorativeValue_last !== null) resultItem.authorativeValue_last = item.authorativeValue_last;
				resultItem.max = item.max;
				result.push(resultItem);
			}
			else result.push(item);
			prevItem = item;
		}
		return result;
	}


	get authorativeValue_first()
	{
		return this._authorativeValue_first;
	}

	set authorativeValue_first(value)
	{
		this._authorativeValue_first = value;
	}

	get authorativeValue_last()
	{
		return this._authorativeValue_last;
	}

	set authorativeValue_last(value)
	{
		this._authorativeValue_last = value;
	}
}
