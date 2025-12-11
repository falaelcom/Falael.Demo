"use strict";

include("StdAfx.js");

//	NOTE: assumes that the database is immutable (caches the database start and end dates)
//		- the start and end cached values are reset on clear()
class ForexDbDataChannel extends ForexDataChannel
{
	constructor(par)
	{
		super(par);

		this._instrumentId = par.instrumentId;
		this._client = par.client;
		this._sync = par.sync;

		this._maxDataPoints = 10000000;
		this._maxIterations = 1000;
		this._maxPageCount = 10000;

		//this.__debug_preventOverlapping = true;
		this.__debug_preventOverlapping = false;

		this._tickDataQuery = new DataQuery(
		{
			sync: this._sync,
			query: this._tickDataQuery_query.bind(this),
			stat: this._dataQuery_stat.bind(this),
		});
		this._sampledDataQuery = new DataQuery(
		{
			sync: this._sync,
			query: this._sampledDataQuery_query.bind(this),
			map: this._sampledDataQuery_map.bind(this),
			stat: this._dataQuery_stat.bind(this),
		});
		this._dataBuffer = new DataBuffer({ authorativePropertyName: "dt" });
		this._dataBuffer.__debug_preventOverlapping = this.__debug_preventOverlapping;
		this._dbDataStartMsCache = -1;	//	indicates the earliest available date for the selected instrument in the tick collection
		this._dbDataEndMsCache = -1;		//	indicates the latest available date for the selected instrument in the tick collection

		this._adaptiveRange = new Range(-1, -1);
	}


	async _tickDataQuery_query(args)
	{
		var response = await this._client.Data.GetForexTickData({ querystring: args });
		if (!response.success) { log(7808734, response.errors); throw "Database operation error."; }
		return response.value;
	}

	async _sampledDataQuery_query(args)
	{
		var response = await this._client.Data.GetForexSampledData({ querystring: args });
		if (!response.success) { log(7808735, response.errors); throw "Database operation error."; }
		return response.value;
	}

	_sampledDataQuery_map(record)
	{
		var result =
		{
			raw: record,
			dt: record.dt,
			ask: record.ac,
			bid: record.bc,
		};
		return result;
	}

	_dataQuery_stat(context, record)
	{
		if (context === void (0)) return { min: this._adaptiveRange.min == -1 ? Infinity : this._adaptiveRange.min, max: this._adaptiveRange.max == -1 ? -Infinity : this._adaptiveRange.max };
		if (record === void (0)) return context;

		if (record.bid < context.min) context.min = record.bid;
		if (record.ask > context.max) context.max = record.ask;
	}


	//	par: { range, merge }
	//	returns the count of newly read datapoints
	async _loadRange(par)
	{
		var range = par.range;
		var merge = par.merge;

		if (!range.isHalfIntegerRange) throw "Argument is invalid: par.range.";

		var result = 0;
		var queryResult;
		if (!this.sampleIntervalDef)
		{
			queryResult = await this._tickDataQuery.executeQuery(
			{
				pid: this._instrumentId,
				start: range.min,
				end: range.max,
			});
		}
		else
		{
			queryResult = await this._sampledDataQuery.executeQuery(
			{
				pid: this._instrumentId,
				start: range.min,
				end: range.max,
				coll: this.sampleIntervalDef.collectionName,
				numb: true,	//	won't ensure sampled data
			});
		}

		result = queryResult.data.length;
		if (!merge) this._dataBuffer.clear();
		this._dataBuffer.merge(queryResult.data, range);

		if (this.__debug_preventOverlapping)
		{
			if (queryResult.data.length)
			{
				var firstdt = queryResult.data[0].dt;
				var lastdt = queryResult.data[queryResult.data.length - 1].dt;
				if (range.min > firstdt || range.max < lastdt) throw "Merge overlapping.";
			}
			await this._debug_validateCachedData(this.sampleIntervalDef);
		}

		this._adaptiveRange.min = queryResult.stats.min;
		this._adaptiveRange.max = queryResult.stats.max;

		if (this._dataBuffer.length > this._maxDataPoints) throw "Limit exceeded.";

		return result;
	}

	async ensureRange(range)
	{
		await this._sync.execute(async function ensureRange_sync(range)
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
					result += await this._loadRange({ range: item, merge: true });
				}

				return result;
			}
			catch (ex)
			{
				console.error(3472367, ex);
				return 0;
			}
		}.bind(this), range);
	}

	//	par: { dt, pageSizeMs, lookBack, acceptEqual }
	//	looks up and returns the datapoint preceding, following dt or exactly at dt, depending on the values of lookBack, acceptEqual
	//	returns null if looking forward beyond the end or backward beyond the start of the database data
	//	when required, incrementally loads data in pages from the database
	//	if acceptEqual is set to true will return a datapoint if it exactly matches par.dt, otherwise will always look forwards or backwards
	async lookupDataPoint(par)
	{
		var result = null;
		await this._sync.execute(async function lookupDataPoint_sync(par)
		{
			var dt = par.dt;
			var pageSizeMs = par.pageSizeMs;	//	60 * 60 * 1000;		//	1 hour
			var lookBack = par.lookBack;
			var acceptEqual = par.acceptEqual;

			if (!Number.isInteger(dt)) throw "Argument is invalid: par.dt.";

			var dbDataStartMs = await this.getAllDataStartMs();
			if (lookBack)
			{
				if (acceptEqual) if (dt < dbDataStartMs) return;
				else if (dt <= dbDataStartMs) return;
			}
			var dbDataEndMs = await this.getAllDataEndMs();
			if (!lookBack)
			{
				if (acceptEqual) if (dt > dbDataEndMs) return;
				else if (dt >= dbDataEndMs) return;
			}

			result = this._dataBuffer.lookupDataPoint(dt, lookBack, acceptEqual);
			if (result) return;

			var lipArgs =
			{
				range: null,
				lookBack: lookBack,
				pageSizeMs: pageSizeMs,
				sampleIntervalDef: this.sampleIntervalDef,
				pageLoadedCallback: function () { return this._dataBuffer.lookupDataPoint(dt, lookBack, acceptEqual); }.bind(this),
			};
			for (var i = 0; i < this._maxIterations; ++i)
			{
				var range = this._dataBuffer.getVoidVicinity(dt, lookBack);
				if (range.min < dbDataStartMs) range.min = dbDataStartMs - 1;
				if (range.max > dbDataEndMs) range.max = dbDataEndMs + 1;
				if (lookBack) { if (range.max > dt) range.max = dt + 1; }
				else if (range.min < dt) range.min = dt - 1;
				lipArgs.range = range.roundDown(0.5);
				if (lipArgs.range.isEmpty) { log(888, range); throw "Invalid operation."; }
				result = await this._loadRangeIncrementally(lipArgs);
				if (result) return;
			}
			throw "Limit exceeded.";
		}.bind(this), par);
		return result;
	}

	async lookupDataPoints(par)
	{
		var dt = par.dt;
		var count = par.count;
		var pageSizeMs = par.pageSizeMs;	//	60 * 60 * 1000;		//	1 hour
		var lookBack = par.lookBack;
		var acceptEqual = par.acceptEqual;

		var result = [];
		for (var cdt = dt, i = 0; i < count; ++i)
		{
			var dp = await this.lookupDataPoint({ dt: cdt, pageSizeMs: pageSizeMs, lookBack: lookBack, acceptEqual: i == 0 ? acceptEqual : false });
			if (!dp) break;
			result.push(dp);
			cdt = dp.dt;
		}
		if (lookBack) result.reverse();
		return result;
	}

	async getAllDataStartMs()
	{
		if (this._dbDataStartMsCache == -1)
		{
			var response;
			if (!this.sampleIntervalDef) response = await this._client.Data.GetForexTickData({ querystring: { pid: this._instrumentId, start: Number.MIN_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER, limit: 1 } });
			else response = await this._client.Data.GetForexSampledData({ querystring: { pid: this._instrumentId, coll: this.sampleIntervalDef.collectionName, numb: true, start: Number.MIN_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER, limit: 1 } });
			if (!response.success) throw response.errors;
			if (!response.value.length) throw "Query returned an empty dataset (1)";
			this._dbDataStartMsCache = response.value[0].dt;
		}
		return this._dbDataStartMsCache;
	}

	async getAllDataEndMs()
	{
		if (this._dbDataEndMsCache == -1)
		{
			var response
			if (!this.sampleIntervalDef) response = await this._client.Data.GetForexTickData({ querystring: { pid: this._instrumentId, start: Number.MIN_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER, limit: 1, reverse: true } });
			else response = await this._client.Data.GetForexTickData({ querystring: { pid: this._instrumentId, coll: this.sampleIntervalDef.collectionName, numb: true, start: Number.MIN_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER, limit: 1, reverse: true } });
			if (!response.success) throw response.errors;
			if (!response.value.length) throw "Query returned an empty dataset (2)";
			this._dbDataEndMsCache = response.value[0].dt;
		}
		return this._dbDataEndMsCache;
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
		this._dbDataStartMsCache = -1;
		this._dbDataEndMsCache = -1;
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
			var loadedCount = await this._loadRange(
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
				max = range.max - fullPageCount * pageSizeMs;
				min = range.max - fullPageCount * pageSizeMs - lastPageSize;
			}
			else
			{
				min = range.min + fullPageCount * pageSizeMs;
				max = range.min + fullPageCount * pageSizeMs + lastPageSize;
			}
			await this._loadRange(
			{
				range: new Range(min, max),
				sampleIntervalDef: this.sampleIntervalDef,
				merge: true,
			});
		}
		if (pageLoadedCallback) return pageLoadedCallback();
	}

	async _debug_validateCachedData(sampleIntervalDef)
	{
		for (var length = this._dataBuffer.validRanges.length, i = 0; i < length; ++i)
		{
			var range = this._dataBuffer.validRanges[i];
			var queryResult;
			if (!sampleIntervalDef)
			{
				queryResult = await this._tickDataQuery.executeQuery(
				{
					pid: this._instrumentId,
					start: range.min,
					end: range.max,
					limit: 50000,
				});
			}
			else
			{
				queryResult = await this._sampledDataQuery.executeQuery(
				{
					pid: this._instrumentId,
					start: range.min,
					end: range.max,
					coll: sampleIntervalDef.collectionName,
					numb: true,	//	won't ensure sampled data
					limit: 50000,
				});
			}

			var rangeDbData = queryResult.data;
			rangeDbData.sort((left, right) =>
			{
				var result = left.dt - right.dt;
				if (result) return result;
				result = left.ask - right.ask;
				if (result) return result;
				return left.bid - right.bid;
			});

			var rangeCachedData = this._dataBuffer.toArray(range.min, range.max + 1);	//	the range max is non-inclusive
			rangeCachedData.sort((left, right) =>
			{
				var result = left.dt - right.dt;
				if (result) return result;
				result = left.ask - right.ask;
				if (result) return result;
				return left.bid - right.bid;
			});

			if (rangeDbData.length != rangeCachedData.length && rangeCachedData.length <= 50000) throw "inconsistent cache (1).";
			for (var jlength = rangeDbData.length, j = 0; j < jlength; ++j)
			{
				var left = rangeDbData[j];
				var right = rangeCachedData[j];
				if (left.dt != right.dt) throw "inconsistent cache (2).";
				if (left.ask != right.ask) throw "inconsistent cache (3).";
				if (left.bid != right.bid) throw "inconsistent cache (4).";
			}
		}
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

	get _dataVersion()
	{
		return this._dataBuffer.dataVersion;
	}

	get cachedDataPointCount()
	{
		return this._dataBuffer.length;
	}


	get instrumentId()
	{
		return this._instrumentId;
	}

	get client()
	{
		return this._client;
	}

	get sync()
	{
		return this._sync;
	}
}
