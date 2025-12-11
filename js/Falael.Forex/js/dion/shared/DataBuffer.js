"use strict";

const createRBTree = require("functional-red-black-tree");
const Range = require("@shared/Range.js");

module.exports =

class DataBuffer
{
	//	par.authorativePropertyName - the name of the property of datapoints that will be used to determine order and define ranges of cached data
	//		- values must be numeric
	//		- values must be always set
	//		- merged data must be sorted by this property in ascending order
	constructor(par)
	{
		if (!par.authorativePropertyName) throw "Argument is null: par.authorativePropertyName.";

		this._authorativePropertyName = par.authorativePropertyName;

		this.__debug_preventOverlapping = !!par.debug_preventOverlapping;

		this._dataTree = createRBTree();
		this._dataVersion = null;
		this._validRanges = [];
	}

	//	min and max are optional
	toArray(min, max)
	{
		const result = [];
		if (min !== void (0))
			if (max !== void (0))
				this._dataTree.forEach(function(key, value) { result.push(value); }, min, max);
			else
				this._dataTree.forEach(function (key, value) { result.push(value); }, min);
		else
			this._dataTree.forEach(function (key, value) { result.push(value); });
		return result;
	}


	clear()
	{
		this._dataTree = createRBTree();
		this._dataVersion = null;
		this._validRanges = [];
	}

	//	use this.getVoidVicinity(authorativeValue) to select an authorative range that doesn't overlap with the existing cached data
	//	authorativeRange - the range that was used to retrieve the data, in the units of the authorative property
	merge(data, authorativeRange)
	{
		if (!data.length)
		{
			this._validRanges.push(authorativeRange);
			this._validRanges = Range.normalizeRanges(this._validRanges);
			return;
		}

		if (!this.__debug_preventOverlapping)
		{
			for (let length = data.length, i = 0; i < length; ++i)
			{
				const item = data[i];
				this._dataTree = this._dataTree.insert(item[this._authorativePropertyName], item);
			}
		}
		else
		{
			for (let length = data.length, i = 0; i < length; ++i)
			{
				const item = data[i];
				const authorativeValue = item[this._authorativePropertyName];
				if (this._dataTree.get(authorativeValue)) throw "Merge overlapping.";
				this._dataTree = this._dataTree.insert(authorativeValue, item);
			}
		}
		
		this._validRanges.push(authorativeRange);
		this._validRanges = Range.normalizeRanges(this._validRanges);

		this._invalidateData();
	}

	append(dataPoint)
	{
		const authorativeValue = dataPoint[this._authorativePropertyName];
		if (this.__debug_preventOverlapping) if (this._dataTree.get(authorativeValue)) throw "Merge overlapping.";
		this._dataTree = this._dataTree.insert(authorativeValue, dataPoint);
		this._invalidateData();

		if (!this._validRanges.length) this._validRanges.push(new Range(authorativeValue, authorativeValue));
		else
		{
			const lastRange = this._validRanges[this._validRanges.length - 1];
			if (authorativeValue < lastRange.max) throw "Argument invalid: dataPoint.";
			lastRange.max = authorativeValue;
		}
	}

	//	if authorativeValue is within a valid range and there is at least one datapoint in this valid range with authorative value that is 
	//		less/less than or equal/greater/ greater than or equal authorativeValue, returns this datapoint
	//	otherwise returns null
	lookupDataPoint(authorativeValue, lookBack, acceptEqual)
	{
		const validRange = this.getValidRange(authorativeValue);
		if (!validRange) return null;
		let result;
		if (lookBack && !acceptEqual) result = this._dataTree.lt(authorativeValue).value;
		else if (lookBack && acceptEqual) result = this._dataTree.le(authorativeValue).value;
		else if (!lookBack && !acceptEqual) result = this._dataTree.gt(authorativeValue).value;
		else if (!lookBack && acceptEqual) result = this._dataTree.ge(authorativeValue).value;
		if (!result) return null;
		const resultValidRange = this.getValidRange(result[this._authorativePropertyName]);
		if (validRange !== resultValidRange) return null;	//	all calls to this.getValidRange operate on the same array of ranges and the instance comparison is ok
		return result;
	}

	getAt(authorativeValue)
	{
		return this._dataTree.get(authorativeValue);
	}

	//	if authorativeValue is within a valid range and there is at least one datapoint in this valid range with authorative value less than authorativeValue,
	//		returns this datapoint
	//	otherwise returns null
	getLower(authorativeValue)
	{
		return this.lookupDataPoint(authorativeValue, true, false);
	}

	//	if authorativeValue is within a valid range and there is at least one datapoint in this valid range with authorative value less than or equal to authorativeValue,
	//		returns this datapoint
	//	otherwise returns null
	getLowerOrEqual(authorativeValue)
	{
		return this.lookupDataPoint(authorativeValue, true, true);
	}

	//	if authorativeValue is within a valid range and there is at least one datapoint in this valid range with authorative value greater than authorativeValue,
	//		returns this datapoint
	//	otherwise returns null
	getHigher(authorativeValue)
	{
		return this.lookupDataPoint(authorativeValue, false, false);
	}

	//	if authorativeValue is within a valid range and there is at least one datapoint in this valid range with authorative value greater than or equal to authorativeValue,
	//		returns this datapoint
	//	otherwise returns null
	getHigherOrEqual(authorativeValue)
	{
		return this.lookupDataPoint(authorativeValue, false, true);
	}

	//	returns the range if authorativeValue is within one of this.validRanges, otherwise returns null
	//	NOTE: the belonging to a range tests are inclusive
	getValidRange(authorativeValue)
	{
		if (!this.isWithinBoundingRange(authorativeValue)) return null;
		for (let length = this._validRanges.length, i = 0; i < length; ++i) if (this._validRanges[i].containsValue(authorativeValue)) return this._validRanges[i];
		return null;
	}

	//	lookBack - if set to true and authorativeValue belongs to a valid range, will look back for a void range; otherwise will look forward
	//	returns a previous/next void range if authorativeValue belongs to a valid range
	//	returns the largest uninterrupted range surrounding authorativeValue that does not overlap with any valid range
	//		- for left-unbounded ranges min is set to -Infinity
	//		- for right-unbounded ranges max is set to Infinity
	//	NOTE: the returned range is inclusive; to avoid overlapping, a range border exclusion policy must be implemented externally to this method
	//		(e.g. by adding 1/ -1 to the start/end of the resulting range)
	getVoidVicinity(authorativeValue, lookBack)
	{
		if (lookBack)
		{
			if (!this._validRanges.length) return new Range(-Infinity, Infinity);
			if (authorativeValue <= this._validRanges[0].max) return new Range(-Infinity, this._validRanges[0].min);
			if (authorativeValue > this._validRanges[this._validRanges.length - 1].max) return new Range(this._validRanges[this._validRanges.length - 1].max, Infinity);

			let lastMax = this._validRanges[0].max;
			for (let length = this._validRanges.length, i = 1; i < length; ++i)
			{
				const item = this._validRanges[i];
				if (authorativeValue < item.max) return new Range(lastMax, item.min);
				lastMax = item.max;
			}
		}
		else
		{
			if (!this._validRanges.length) return new Range(-Infinity, Infinity);
			if (authorativeValue < this._validRanges[0].min) return new Range(-Infinity, this._validRanges[0].min);
			if (authorativeValue >= this._validRanges[this._validRanges.length - 1].min) return new Range(this._validRanges[this._validRanges.length - 1].max, Infinity);

			let lastMin = this._validRanges[this._validRanges.length - 1].min;
			for (let i = this._validRanges.length - 2; i >= 0; --i)
			{
				const item = this._validRanges[i];
				if (authorativeValue > item.min) return new Range(item.max, lastMin);
				lastMin = item.min;
			}
		}
		throw "Invalid operation.";
	}

	//	returns true if authorativeValue is between the min of the lowest valid range and the max of the highest valid range, otherwise returns false
	//	NOTE: the belonging to a range tests are inclusive
	isWithinBoundingRange(authorativeValue)
	{
		if (!this._validRanges.length) return false;
		if (authorativeValue < this._validRanges[0].min) return false;
		if (authorativeValue > this._validRanges[this._validRanges.length - 1].max) return false;
		return true;
	}


	_invalidateData()
	{
		this._dataVersion = newLUID();
	}


	static testRBTree()
	{
		//const dataCount = 20000;
		//const dataCount = 10000;
		//const dataCount = 2000;
		const dataCount = 1000;
		//const dataCount = 100;

		/////////////////////////////////////////////////////////////////////
		//	sorted data
		var sortedData = [];
		for (var length = dataCount, i = 0; i < length; ++i) sortedData.push(
		{
			key: i,
			value: i.toString(),
		});

		//	sorted data, full index
		var index = {};
		var begin = performance.now();
		for (var length = sortedData.length, i = 0; i < length; ++i)
		{
			var item = sortedData[i];
			index[item.key] = item;
		}
		for (var length = sortedData.length, i = 0; i < length; ++i)
		{
			var item = index[i];
		}
		var end = performance.now();
		log("sorted data, full index", end - begin);

		//	sorted data, binary tree
		var tree = createRBTree();
		var begin = performance.now();
		for (var length = sortedData.length, i = 0; i < length; ++i)
		{
			var item = sortedData[i];
			tree = tree.insert(item.key, item);
		}
		for (var length = sortedData.length, i = 0; i < length; ++i)
		{
			var item = tree.get(i);
		}
		var end = performance.now();
		log("sorted data, binary tree", end - begin);

		/////////////////////////////////////////////////////////////////////
		//	randomized data
		var randomizedData = [];
		var debugi = 0;
		log("randomizing data...");
		while (sortedData.length)
		{
			var i = Math.floor(Math.random() * sortedData.length);
			var item = sortedData.splice(i, 1)[0];
			randomizedData.push(item);

			if (++debugi > dataCount + 100) break;
		}
		log("done.");

		//	randomized data, full index
		var index = {};
		var data = [];
		var begin = performance.now();
		for (var length = randomizedData.length, i = 0; i < length; ++i)
		{
			var item = randomizedData[i];
			index[item.key] = item;
			data.push(item);
			data.sort((left, right) => left.key - right.key);
		}
		for (var length = randomizedData.length, i = 0; i < length; ++i)
		{
			var item = index[i];
		}
		var end = performance.now();
		log("randomized data, full index", end - begin);

		//	randomized data, binary tree
		var tree = createRBTree();
		var begin = performance.now();
		for (var length = randomizedData.length, i = 0; i < length; ++i)
		{
			var item = randomizedData[i];
			tree = tree.insert(item.key, item);
		}
		for (var length = randomizedData.length, i = 0; i < length; ++i)
		{
			var item = tree.get(i);
		}
		var end = performance.now();
		log("randomized data, binary tree", end - begin);
	}


	get length()
	{
		return this._dataTree.length;
	}

	get dataVersion()
	{
		return this._dataVersion;
	}

	get validRanges()
	{
		return this._validRanges;
	}

	get boundingRange()
	{
		if (!this._validRanges.length) new Range(-1, -1);
		return new Range(this._validRanges[0].min, this._validRanges[this._validRanges.length - 1].max);
	}

	get first()
	{
		return this._dataTree.begin.value || null;
	}

	get last()
	{
		return this._dataTree.end.value || null;
	}
}
