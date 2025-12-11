"use strict";

include("StdAfx.js");

class ForexSimulatedDataChannel extends ForexDataChannel
{
	constructor(par)
	{
		super(par);

		this._dataStartMs = par.dataStartMs;
		this._dataEndMs = par.dataEndMs;

		this._maxDataPoints = 10000000;
		this._maxIterations = 1000;
		this._maxPageCount = 10000;

		this.__debug_preventOverlapping = true;
		//this.__debug_preventOverlapping = false;

		this._dataBuffer = new DataBuffer({ authorativePropertyName: "dt" });
		this._dataBuffer.__debug_preventOverlapping = this.__debug_preventOverlapping;

		this._adaptiveRange = new Range(-1, -1);
	}


	//	par: { range, merge }
	//	returns the count of newly generated datapoints
	async loadRange(par)
	{
		var range = par.range;
		var merge = par.merge;

		if (!range.isHalfIntegerRange) throw "Argument is invalid: par.range.";

		var queryResult = this._genData(range);
		if (!merge) this._dataBuffer.clear();
		this._dataBuffer.merge(queryResult.data, range);

		this._adaptiveRange.min = Math.min(this._adaptiveRange.min == -1 ? Infinity : this._adaptiveRange.min, queryResult.stats.min);
		this._adaptiveRange.max = Math.max(this._adaptiveRange.max == -1 ? -Infinity : this._adaptiveRange.max, queryResult.stats.max);

		if (this._dataBuffer.length > this._maxDataPoints) throw "Limit exceeded.";

		return queryResult.data.length;
	}

	async ensureRange(range)
	{
		if (!range.isHalfIntegerRange) throw "Argument is invalid: range.";

		try
		{
			var dbDataStartMs = await this.getAllDataStartMs();
			var dbDataEndMs = await this.getAllDataEndMs();
			if (range.min < dbDataStartMs) range.min = dbDataStartMs - 0.5;
			if (range.max > dbDataEndMs) range.max = dbDataEndMs + 0.5;

			var invalidRanges = Range.subtractRanges([range], this._dataBuffer.validRanges);
			if (!invalidRanges.length) return 0;

			var result = 0;
			for (var length = invalidRanges.length, i = 0; i < length; ++i)
			{
				var item = invalidRanges[i];
				result += await this.loadRange({ range: item, merge: true });
			}

			return result;
		}
		catch (ex)
		{
			console.error(3832367, ex);
			return 0;
		}
	}

	//	par: { dt, pageSizeMs, lookBack, acceptEqual }
	//	looks up and returns the datapoint preceding, following dt or exactly at dt, depending on the values of lookBack, acceptEqual
	//	returns null if looking forward beyond the end or backward beyond the start of all data
	//	when required, incrementally generates data in pages
	//	if acceptEqual is set to true will return a datapoint if it exactly matches par.dt, otherwise will always look forwards or backwards
	async lookupDataPoint(par)
	{
		var dt = par.dt;
		var pageSizeMs = par.pageSizeMs;	//	60 * 60 * 1000;		//	1 hour
		var lookBack = par.lookBack;
		var acceptEqual = par.acceptEqual;

		if (!Number.isInteger(dt)) throw "Argument is invalid: par.dt.";

		var dbDataStartMs = await this.getAllDataStartMs();
		if (lookBack)
		{
			if (acceptEqual) if (dt < dbDataStartMs) return null;
			else if (dt <= dbDataStartMs) return null;
		}
		var dbDataEndMs = await this.getAllDataEndMs();
		if (!lookBack)
		{
			if (acceptEqual) if (dt > dbDataEndMs) return null;
			else if (dt >= dbDataEndMs) return null;
		}

		var result = this._dataBuffer.lookupDataPoint(dt, lookBack, acceptEqual);
		if (result) return result;

		var lipArgs =
		{
			range: null,
			lookBack: lookBack,
			pageSizeMs: pageSizeMs,
			sampleIntervalDef: this.sampleIntervalDef,
			pageLoadedCallback: function () { return this._dataBuffer.lookupDataPoint(dt, lookBack, acceptEqual); },
		};
		for (var i = 0; i < this._maxIterations; ++i)
		{
			var range = this._dataBuffer.getVoidVicinity(dt, lookBack);
			if (range.min < dbDataStartMs) range.min = dbDataStartMs - 1;
			if (range.max > dbDataEndMs) range.max = dbDataEndMs + 1;
			if (lookBack) { if (range.max > dt) range.max = dt; }
			else if (range.min < dt) range.min = dt;
			lipArgs.range = range.roundDown(0.5);
			var result = await this._loadRangeIncrementally(lipArgs);
			if (result) return result;
		}
		throw "Limit exceeded.";
	}

	async getAllDataStartMs()
	{
		return this._dataStartMs;
	}

	async getAllDataEndMs()
	{
		return this._dataEndMs;
	}


	getRawDataInRange(range)
	{
		if (!range.isHalfIntegerRange) throw "Argument is invalid: range.";

		return this._dataBuffer.toArray(range.min, range.max);
	}

	getRawDataPoint(dt)
	{
		this._dataBuffer.getAt(dt);
	}


	clear(preserveAdapativeDataRange)
	{
		this._dataBuffer.clear()
		if (!preserveAdapativeDataRange)
		{
			this._adaptiveRange.min = -1;
			this._adaptiveRange.max = -1;
		}
	}


	//	par: { range, pageSizeMs, pageLoadedCallback() }
	//	if par.pageLoadedCallback is set returns the result of the first par.pageLoadedCallback() call that returns a value !== null, or the result of the last call of par.pageLoadedCallback()
	//	always merges
	//	if par.range is empty throws an exception
	async _loadRangeIncrementally(par)
	{
		var range = par.range;
		var lookBack = par.lookBack;
		var pageSizeMs = par.pageSizeMs;	//	60 * 60 * 1000;		//	1 hour
		var pageLoadedCallback = par.pageLoadedCallback;

		if (!range.isHalfIntegerRange) throw "Argument is invalid: par.range.";

		if (range.isEmpty) throw "Argument is invalid: range.length.";
		var fullPageCount = Math.floor(range.length / pageSizeMs);
		var lastPageSize = range.length % pageSizeMs;
		var min;
		var max;
		for (var i = 0; i < fullPageCount; ++i)
		{
			if (i > this._maxPageCount) throw "Limit exceeded.";

			if (lookBack)
			{
				max = range.max - i * pageSizeMs;
				min = range.max - (i + 1) * pageSizeMs;
			}
			else
			{
				min = range.min + i * pageSizeMs;
				max = range.min + (i + 1) * pageSizeMs;
			}
			var loadedCount = await this.loadRange(
			{
				range: new Range(min, max),
				sampleIntervalDef: this.sampleIntervalDef,
				merge: true,
			});
			if (!loadedCount) continue;
			if (pageLoadedCallback)
			{
				var result = pageLoadedCallback();
				if (result !== null) return result;
			}
		}
		if (lastPageSize)
		{
			if (lookBack)
			{
				max = range.max - fullPageCount * pageSizeM;
				min = range.max - fullPageCount * pageSizeM - lastPageSize;
			}
			else
			{
				min = range.min + fullPageCount * pageSizeM;
				max = range.min + fullPageCount * pageSizeM + lastPageSize;
			}
			await this.loadRange(
			{
				range: new Range(min, max),
				sampleIntervalDef: this.sampleIntervalDef,
				merge: true,
			});
		}
		if (pageLoadedCallback) return pageLoadedCallback();
	}

	_genData(range)
	{
		var result =
		{
			data: [],
			stats:
			{
				min: -1,
				max: -1,
			},
		};

		//	TODO:
		//		- determine if there are a previous and next values to the range and use them as start and end values during generation (requires generation algorithm adjustment)
		//		- consider weekends and generate gaps
		//		- count the datapoints in the range (add sampling interval def property to the channel, throw an exception on tick data), generate data, map the generated data to the range
		//		- get some inspiration for the Y-configuration of the sample generator
		//			- maybe replace the 4 Y-configuration values with something more meaningful?
		var sample = MappedArray.generateSample(100000,
		{
			distributionType: "random",
			schemaType: "array",
			probabilityDistributionType: "biasedAtZero",
			valueAccessorKey_i: "x",
			valueAccessorKey_value: "y",
			minY: 0.1,
			maxY: 0.2,
			resolutionY: 400,
			stepYSpread: 5,
		});

		//	gen random data, see TransformExplorerChartUserControl

		return result;
	}


	get rawData()
	{
		return this._dataBuffer.toArray();
	}

	get authorativeRange()
	{
		return this._dataBuffer.boundingRange;
	}

	get adaptiveRange()
	{
		return this._adaptiveRange;
	}

	get cachedDataPointCount()
	{
		return this._dataBuffer.length;
	}
}
