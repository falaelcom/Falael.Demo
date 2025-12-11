"use strict";

const InvalidOperationException = require("@framework/InvalidOperationException.js");

module.exports =

class Range
{
    constructor(min, max)
    {
        this._min = min || 0;
		this._max = max || 0;
    }

	clone()
	{
		return new Range(this._min, this._max);
	}

	static Empty()
	{
		if (!Range._Empty)
		{
			Range._Empty = new Range(0, 0);
		}
		return Range._Empty;
	}

	static toJsonRanges(rangeArray)
	{
		if (!rangeArray) return rangeArray;
		var result = [];
		for (var length = rangeArray.length, i = 0; i < length; ++i) result.push(rangeArray[i].toJson());
		return result;
	}

	static fromJsonRanges(jsonArray)
	{
		if (!jsonArray) return jsonArray;
		var result = [];
		for (var length = jsonArray.length, i = 0; i < length; ++i) result.push(Range.fromJson(jsonArray[i]));
		return result;
	}

	static fromJson(json)
	{
		return new Range(json.min, json.max);
	}

	toJson()
	{
		return { min: this._min, max: this._max };
	}

	toStringKey()
	{
		return this._min + '*' + tihs._max;
	}

	equals(right)
	{
		if (!right) return false;
		return this._min == right._min && this._max == right._max;
	}


	inflate(lowerExtrusionFactor, upperExtrusionFactor)
	{
		this._min -= this.length * lowerExtrusionFactor;
		this._max += this.length * upperExtrusionFactor;
		return this;
	}

	//	returns a range with min floored and max floored
	//	if pinch [0..1) is specied, this value will be subsequently added to min and max
	roundUp(pinch)
	{
		pinch = pinch || 0;
		if (pinch < 0 || pinch >= 1) throw "Argument is ivalid: pinch.";
		return new Range(Math.floor(this._min) + pinch, Math.floor(this._max) + pinch);
	}

	//	returns a range with min ceiled and max ceiled
	//	if pinch [0..1) is specied, this value will be subsequently subtracted from min and max
	roundDown(pinch)
	{
		pinch = pinch || 0;
		if (pinch < 0 || pinch >= 1) throw "Argument is ivalid: pinch.";
		return new Range(Math.ceil(this._min) - pinch, Math.ceil(this._max) - pinch);
	}

	containsValue(value)
	{
		return this._min <= value && this._max >= value;
	}

	//	returns true if the left range fully contains the right range
	contains(right)
	{
		return this._min <= right._min && this._max >= right._max;
	}

	//	returns an array of ranges with length 0, 1 or 2
	//	1. if both ranges are equal, returns an empty array (0 elements)
	//	2. if the right range fully contains the left range, returns an empty array (0 elements)
	//	3. if both ranges don't overlap, returns an array containing the the left range (1 element)
	//	4. if the left range fully contains the right range and nor the start or the end values of both ranges match, returns an array containing two ranges (the left and right non-overlapping parts of the left range) (2 elements)
	//	5. if the left range fully contains the right range and the starts of both ranges are equal, returns an array containing the non-overlapping right part of the left range (1 element)
	//	6. if the left range fully contains the right range and the ends of both ranges are equal, returns an array containing the non-overlapping left part of the left range (1 element)
	//	7. if the left range partially overlaps with the right range, so that the start of the left range is within the right range, returns an array containing the non-overlapping right part of the left range (1 element)
	//	8. if the left range partially overlaps with the right range, so that the end of the left range is within the right range, returns an array containing the non-overlapping left part of the left range (1 element)
	//	NOTE: this method does not account for open and closed intervals and when the result of it is used for data selection, can cause records that are located on the open edges of ranges to be included in the resultset, when they in fact should be ommitted
	//			if using such resultsets for generation of data sampling collections, to avoid duplicated records, upsert rather than insert must be used for write operations
	subtract(right)
	{
		//	1. 2.
		if (right._min <= this._min && right._max >= this._max) return [];

		//	3.
		if (right._min > this._max || this._min > right._max) return [this];

		//	4.
		if (this._min < right._min && this._max > right._max) return [new Range(this._min, right._min), new Range(right._max, this._max)];

		//	5.
		if (this._min == right._min && this._max > right._max) return [new Range(right._max, this._max)];

		//	6.
		if (this._min < right._min && this._max == right._max) return [new Range(this._min, right._min)];

		//	7.
		if (this._min > right._min && this._min <= right._max) return [new Range(right._max, this._max)];

		//	8.
		if (this._max >= right._min && this._max < right._max) return [new Range(this._min, right._min)];

		throw new InvalidOperationException();
	}


	static subtractRanges(left, right)
	{
		let result = left;
		for (let length = right.length, i = 0; i < length; ++i)
		{
			const item = right[i];
			const reducedResult = [];
			for (let jlength = result.length, j = 0; j < jlength; ++j)
			{
				const jitem = result[j];
				const diff = jitem.subtract(item);
				switch (diff.length)
				{
					case 0: continue;
					case 1:
						reducedResult.push(diff[0]);
						break;
					case 2:
						reducedResult.push(diff[0]);
						reducedResult.push(diff[1]);
						break;
				}
			}
			result = reducedResult;
		}
		return result;
	}

	static normalizeRanges(rangeArray)
	{
		if (!rangeArray) return null;
		if (!rangeArray.length) return [];
		const arr = rangeArray.slice();
		arr.sort((left, right) => left._min - right._min);
		let prevItem = arr[0];
		const result = [prevItem];
		for (let length = arr.length, i = 1; i < length; ++i)
		{
			const item = arr[i];
			if (prevItem._max >= item._min) result[result.length - 1] = new Range(result[result.length - 1]._min, item._max);
			else result.push(item);
			prevItem = item;
		}
		return result;
	}

	//	all values under highPropertyName and lowPropertyName must be numeric
	//	OBSOLETE, used in only one place, remove asap
	//	replace with sample.stat
	static measureArray(array, highPropertyName, lowPropertyName)
	{
		var result = new Range(Infinity, -Infinity);
		for (let length = array.length, i = 0; i < length; ++i)
		{
			const item = array[i];
			const lowPropertyValue = item[lowPropertyName];
			const highPropertyValue = item[highPropertyName];
			if (lowPropertyValue < result.min) result.min = lowPropertyValue;
			if (highPropertyValue > result.max) result.max = highPropertyValue;
		}
		return result;
	}

	static contain(ranges, value)
	{
		for (let length = ranges.length, i = 0; i < length; ++i)
		{
			const item = ranges[i];
			if (item.containsValue(value)) return true;
		}
		return false;
	}


	static __unitTest()
	{
		var result = [];

		function assertTrue(method, name, value)
		{
			if (value)
			{
				result.push("OK Range." + method + ": " + name);
			}
			else
			{
				result.push("FAIL Range." + method + ": " + name);
			}
		};

		function assertFalse(method, name, value)
		{
			assertTrue(method + " NOT", name, !value);
		};

		let expected, value;

		//	contains
		assertTrue("contains", "test1", !new Range(0, 100).contains(new Range(-100, -1)));
		assertTrue("contains", "test2", !new Range(0, 100).contains(new Range(-100, 0)));
		assertTrue("contains", "test3", !new Range(0, 100).contains(new Range(-50, 50)));
		assertTrue("contains", "test4", new Range(0, 100).contains(new Range(0, 50)));
		assertTrue("contains", "test5", new Range(0, 100).contains(new Range(1, 50)));
		assertTrue("contains", "test6", new Range(0, 100).contains(new Range(1, 100)));
		assertTrue("contains", "test7", new Range(0, 100).contains(new Range(0, 100)));
		assertTrue("contains", "test8", !new Range(0, 100).contains(new Range(0, 101)));
		assertTrue("contains", "test9", !new Range(0, 100).contains(new Range(1, 101)));
		assertTrue("contains", "test10", !new Range(0, 100).contains(new Range(100, 101)));
		assertTrue("contains", "test11", !new Range(0, 100).contains(new Range(101, 102)));

		//	subtract
		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(-50, -1))));
		expected = '[{"min":0,"max":100}]';
		assertTrue("subtract", "small,0,0", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(-50, 0))));
		expected = '[{"min":0,"max":100}]';
		assertTrue("subtract", "small,0,1", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(-40, 10))));
		expected = '[{"min":10,"max":100}]';
		assertTrue("subtract", "small,0,2", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(0, 50))));
		expected = '[{"min":50,"max":100}]';
		assertTrue("subtract", "small,1,2", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(10, 60))));
		expected = '[{"min":0,"max":10},{"min":60,"max":100}]';
		assertTrue("subtract", "small,2,2", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(50, 100))));
		expected = '[{"min":0,"max":50}]';
		assertTrue("subtract", "small,2,1", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(60, 110))));
		expected = '[{"min":0,"max":60}]';
		assertTrue("subtract", "small,2,0", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(100, 150))));
		expected = '[{"min":0,"max":100}]';
		assertTrue("subtract", "small,1,0", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(0, 100))));
		expected = '[]';
		assertTrue("subtract", "small,1,1", value == expected);

		value = JSON.stringify(Range.toJsonRanges(new Range(0, 100).subtract(new Range(-100, 200))));
		expected = '[]';
		assertTrue("subtract", "small,0a,0a", value == expected);

		//	normalizeRanges
		let source;
		source = [];
		value = Range.normalizeRanges(Range.fromJsonRanges(source));
		expected = [];
		assertTrue("normalizeRanges", "test0", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		source = [{ min: 0, max: 100 }];
		value = Range.normalizeRanges(Range.fromJsonRanges(source));
		expected = [{ min: 0, max: 100 }];
		assertTrue("normalizeRanges", "test1", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		source = [{ min: 0, max: 100 }, { min: 100, max: 200 }];
		value = Range.normalizeRanges(Range.fromJsonRanges(source));
		expected = [{ min: 0, max: 200 }];
		assertTrue("normalizeRanges", "test2", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		source = [{ min: 0, max: 100 }, { min: 100, max: 200 }, { min: 200, max: 300 }];
		value = Range.normalizeRanges(Range.fromJsonRanges(source));
		expected = [{ min: 0, max: 300 }];
		assertTrue("normalizeRanges", "test3", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		source = [{ min: 0, max: 90 }, { min: 100, max: 200 }, { min: 200, max: 300 }];
		value = Range.normalizeRanges(Range.fromJsonRanges(source));
		expected = [{ min: 0, max: 90 }, { min: 100, max: 300 }];
		assertTrue("normalizeRanges", "test4", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		source = [{ min: 0, max: 90 }, { min: 100, max: 200 }, { min: 150, max: 250 }, { min: 200, max: 300 }];
		value = Range.normalizeRanges(Range.fromJsonRanges(source));
		expected = [{ min: 0, max: 90 }, { min: 100, max: 300 }];
		assertTrue("normalizeRanges", "test5", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		//	subtractRanges
		let left, right;

		left = [{ min: 0, max: 100 }];
		right = [{ min: 0, max: 100 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [];
		assertTrue("subtract", "test1", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: 0, max: 100 }];
		right = [{ min: -100, max: 0 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 0, max: 100 }];
		assertTrue("subtract", "test2", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: 0, max: 100 }];
		right = [{ min: 0, max: 10 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 10, max: 100 }];
		assertTrue("subtract", "test3", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: 0, max: 100 }];
		right = [{ min: 0, max: 10 }, { min: 20, max: 30 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 10, max: 20 }, { min: 30, max: 100 }];
		assertTrue("subtract", "test3", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: 0, max: 100 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 10, max: 20 }];
		assertTrue("subtract", "test4", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: 0, max: 100 }, { min: 110, max: 150 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 10, max: 20 }, { min: 130, max: 150 }];
		assertTrue("subtract", "test5", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: 0, max: 100 }, { min: 110, max: 150 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }, { min: 131, max: 132 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 10, max: 20 }, { min: 130, max: 131 } , { min: 132, max: 150 }];
		assertTrue("subtract", "test6", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [ { min: -100, max: 0}, { min: 0, max: 100 }, { min: 110, max: 150 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }, { min: 131, max: 132 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: -100, max: -10 }, { min: 10, max: 20 }, { min: 130, max: 131 }, { min: 132, max: 150 }];
		assertTrue("subtract", "test7", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: -100, max: 0 }, { min: 0, max: 100 }, { min: 110, max: 150 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }, { min: 10, max: 20 }, { min: 131, max: 132 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: -100, max: -10 }, { min: 130, max: 131 }, { min: 132, max: 150 }];
		assertTrue("subtract", "test8", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: -100, max: 0 }, { min: 0, max: 100 }, { min: 110, max: 150 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }, { min: 10, max: 20 }, { min: 131, max: 132 }, { min: -1000, max: 150 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [];
		assertTrue("subtract", "test9", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		left = [{ min: -100, max: 0 }, { min: 0, max: 100 }, { min: 110, max: 150 }];
		right = [{ min: -10, max: 10 }, { min: 20, max: 130 }, { min: 10, max: 20 }, { min: 131, max: 132 }, { min: -1000, max: 149 }];
		value = Range.subtractRanges(Range.fromJsonRanges(left), Range.fromJsonRanges(right));
		expected = [{ min: 149, max: 150 }];
		assertTrue("subtract", "test10", JSON.stringify(Range.toJsonRanges(value)) == JSON.stringify(expected));

		return result;
	}


	get min()
	{
		return this._min;
	}

	set min(value)
	{
		this._min = value;
	}

	get max()
	{
		return this._max;
	}

	set max(value)
	{
		this._max = value;
	}

	get length()
	{
		return this._max - this._min;
	}

	set length(value)
	{
		this._max = this._min + value;
	}

	get isEmpty()
	{
		return this._max <= this._min;
	}

	get isIntegerRange()
	{
		return Number.isInteger(this._min) && Number.isInteger(this._max);
	}

	get isHalfIntegerRange()
	{
		return Number.isInteger(this._min + 0.5) && Number.isInteger(this._max + 0.5);
	}
}
