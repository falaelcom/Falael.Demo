//	R0Q2/daniel/20230903
//	- TODO: to enable async code tracing, add a `pause` method that adds a "pause"-type of entry for a key; pause entries start non-measurable time that ends with the next trace
//		current entry; with pause entries available, the `report` function must be extended by grouping the aggregated entries in measurable intervals that are separately calculated using
//		the algo; in such case `report` will be returning sums of the calculated values for the measurable intervals
//	- TODO: to enable correct async inspect constructor param behavior, add `async traceAsync` that calls `await onInspect(entry)`
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException } = require("-/pb/natalis/003/Exception.js");
const { tunable, timens } = require("-/pb/natalis/010/Context.js");
const { BufPool, isBuf } = require("-/pb/natalis/013/Compound.js");

const T_0x253AC3 = tunable(0x253AC3);

const traceLineBufferLength = 7;
const TYPE_ENTRY = 1;
const TYPE_PAUSE = 2;
const INDEX_TYPE = 0;
const INDEX_KEY = 1;
const INDEX_TIMENS = 2;
const INDEX_MESSAGE = 3;
const INDEX_DETAILS = 4;
const INDEX_ORDINAL = 5;
const INDEX_DURATIONNS_SYSTEM = 6;
const default_lineBufferPool = new BufPool(void 0, traceLineBufferLength);
const default_traceBufferPool = BufPool.the;

const default_trace_finalize = new FinalizationRegistry(v => BufPool.the.release(v));
const default_traceLine_finalize = new FinalizationRegistry(v => default_lineBufferPool.release(v));

module.exports =

//	Class: `DiagnosticsCollector` facilitates structured execution step tracing and time measurement.
//	Remarks: The pause functionality has not been implemented yet. The `DiagnosticsCollector.TYPE_PAUSE` value is not currently used.
class DiagnosticsCollector
{
	//	Parameter: `defaultTraceKey: any` - optional, defaults to `null`; a default value for the `key` parameter of the `DiagnosticsCollector.trace` funciton.
	//	Parameter: `inspect(entry: buf): void` - optional, defaults to `null`; a callback invoked by the `trace` method allowing the `DiagnosticsCollector` instantiator to inspect and
	//		modify raw trace entries upon upon addition.
	//	Parameter: `autoGrowthFactor: number` - optional, defaults to `tunable(0x253AC3)`; must be larger than `1`; provides a factor for automatically expanding the trace buffers by the
	//		formula `Math.floor(autoGrowthFactor * (this.length + 1))`.
	//	Parameter: `traceBufferPool: number` - optional, defaults to `BufPool.the`; provides a way to override the default `BufPool` used by `DiagnosticsCollector` to acquire
	//		trace buf instances. An example for a scenario when a custom `traceBufferPool` instance might be useful could be when the expected number of trace keys greatly exceeds
	//		`BufPool.the.constructor`, `bufferLength` parameter (`tunable(0xB275B7)`), and it would be beneficial to acquire precreated bufs with a larger default size.
	//	Parameter: `lineBufferPool: number` - optional, defaults to `new BufPool(void 0, 6)`; provides a way to override the default `BufPool` used by `DiagnosticsCollector` to acquire
	//		trace entry buf instances. An example for a scenario when a custom `lineBufferPool` instance might be useful could be when the `inspect` callback adds new elements to
	//		trace entry bufs, and it would be beneficial to acquire precreated bufs with a larger default size.
	//	Remarks:
	//		When the `inspect` callback is invoked, `entry[require("-/pb/natalis/014/DiagnosticsCollector.js").INDEX_DURATIONNS_SYSTEM]` has an unpredictable value and
	//			will be set after the callback returns.
	//	Tunable: `0x253AC3`.
	constructor(defaultTraceKey = null, inspect = null, autoGrowthFactor = T_0x253AC3, traceBufferPool = null, lineBufferPool = null)
	{
		if (PB_DEBUG)
		{
			//	`defaultTraceKey` can be anything
			if (!Type.isNU(inspect) && !CallableType.isUnyielded(inspect)) throw new ArgumentException(0xB72B65, `inspect`, inspect);
			if (!Type.isNumber(autoGrowthFactor) || autoGrowthFactor <= 1) throw new ArgumentException(0xB84773, "autoGrowthFactor", autoGrowthFactor);
			if (!Type.isNU(traceBufferPool) && !(traceBufferPool instanceof BufPool)) throw new ArgumentException(0x8409E4, "traceBufferPool", traceBufferPool);
			if (!Type.isNU(lineBufferPool) && !(lineBufferPool instanceof BufPool)) throw new ArgumentException(0xD2C0EA, "lineBufferPool", lineBufferPool);
		}
		this._defaultTraceKey = defaultTraceKey;
		this._inspect = inspect;
		this._autoGrowthFactor = autoGrowthFactor;
		this._lineCounter = 0;

		if (!traceBufferPool)
		{
			this._traceBufferPool = default_traceBufferPool;
			this._trace_finalize = default_trace_finalize;
		}
		else
		{
			this._traceBufferPool = traceBufferPool;
			this._trace_finalize = new FinalizationRegistry(v => this._traceBufferPool.release(v));
		}

		if (!lineBufferPool)
		{
			this._lineBufferPool = default_lineBufferPool;
			this._traceLine_finalize = default_traceLine_finalize;
		}
		else
		{
			this._lineBufferPool = lineBufferPool;
			this._traceLine_finalize = new FinalizationRegistry(v => this._lineBufferPool.release(v));
		}
	}

	//	Function: `onInspect(entry: buf): void` - invokes the `inspect` callback if provided in the `DiagnosticsCollector` constructor.
	//	Parameter: `entry: buf` - a buf containing the current entry data in a raw format; see `DiagnosticsCollector.store` for details.
	//	Remarks:
	//		When `DiagnosticsCollector.onInspect()` is called, `entry[require("-/pb/natalis/014/DiagnosticsCollector.js").INDEX_DURATIONNS_SYSTEM]` has an unpredictable value and
	//			will be set after the callback returns.
	//	Usage:
	//	```
	//		const { DiagnosticsCollector, TYPE_ENTRY, TYPE_PAUSE } = require("-/pb/natalis/014/DiagnosticsCollector.js");
	//		const dia = new DiagnosticsCollector();
	//		dia.onInspect(Buf.augment([TYPE_ENTRY, 666, 10, "message", 5, 1, 0]));
	//	```
	onInspect(entry)
	{
		if (PB_DEBUG)
		{
			if (!isBuf(entry)) throw new ArgumentException(0x36BCF0, `entry`, entry);
			if (entry.count !== INDEX_DURATIONNS_SYSTEM) throw new ArgumentException(0x81AA87, `entry.count`, entry.count);
		}
		return this._inspect && this._inspect(this, entry);
	}

	//	Function: `trace(key: any, message: string, details: any, timeNs: integer, systemDurationNs: integer): void` - appends a trace entry to a trace list associated with `key`.
	//	Parameter: `key: any` - optional, defaults to `this.defaultTraceKey`; the trace key; trace data is collected per trace key.
	//	Parameter: `message: string` - optional, defaults to `null`; the trace message.
	//	Parameter: `details: any` - optional, defaults to `null`; the trace details.
	//	Parameter: `timeNs: integer` - optional, defaults to the time taken as the first operation of the trace function body execution; the time to be traced, in nanoseconds.
	//	Parameter: `systemDurationNs: integer` - optional, defaults to the duration measured between the start and the end of the trace function body execution; the system duraiton to be
	//		traced, in nanoseconds.
	//	Remarks:
	//		The added trace entry has the form `[key, timeNs, message, details, ordinal, traceFunctionExecutionNs]`, where `traceFunctionExecutionNs` is the time measured from the beginning till the
	//			end of the execution of this `DiagnosticsCollector.trace` invokation excluding the function call time, the time to acquire and cache the start time, the time
	//			to calculate the difference between the end and the start times and the time to set the difference as the last element of the trace entry buf.
	trace(key = null, message = null, details = null, timeNs = null, systemDurationNs = null)
	{
		const traceStartNs = timens();
		if (PB_DEBUG)
		{
			//	`key` can be anything
			if (!Type.isNU(message) && !Type.isString(message)) throw new ArgumentException(0xFD1A97, `message`, message);
			//	`details` can be anything
			if (!Type.isNU(timeNs) && !Type.isInteger(timeNs)) throw new ArgumentException(0x39CD96, `timeNs`, timeNs);
			if (!Type.isNU(systemDurationNs) && !Type.isInteger(systemDurationNs)) throw new ArgumentException(0x927B61, `systemDurationNs`, systemDurationNs);
		}
		if (key === null) key = this.defaultTraceKey;
		if (timeNs === null) timeNs = traceStartNs;

		let trace = this._store.get(key);
		if (!trace)
		{
			trace = this._traceBufferPool.hold();
			this._trace_finalize.register(this, trace);
			this._store.set(key, trace);
		}
		else if (trace.count === trace.length) trace.length = Math.floor(this._autoGrowthFactor * (trace.length + 1));
		const traceLine = trace[trace.count] = this._lineBufferPool.hold();
		this._traceLine_finalize.register(trace, traceLine);
		++trace.count;
		++traceLine.count; traceLine[INDEX_TYPE] = TYPE_ENTRY;
		++traceLine.count; traceLine[INDEX_KEY] = key;
		++traceLine.count; traceLine[INDEX_TIMENS] = timeNs;
		++traceLine.count; traceLine[INDEX_MESSAGE] = message;
		++traceLine.count; traceLine[INDEX_DETAILS] = details;
		++traceLine.count; traceLine[INDEX_ORDINAL] = this._lineCounter;
		++this._lineCounter;
		this.onInspect(traceLine);
		++traceLine.count; traceLine[INDEX_DURATIONNS_SYSTEM] = systemDurationNs === null ? timens() - traceStartNs : systemDurationNs;
	}

	//	Function: `clear(key: any): void` - removes all collected data for the specified `key` or all collected data of `key` is not specified.
	//	Parameter: `key: any` -	optional, defaults to `null`; if specified, indicates the trace `key` to be cleared, otherwise indicates that all collected data has to cleared.
	clear(key = null)
	{
		if (key === null) return this._store.clear();
		return this._store.remove(key);
	}

	//	Function: `report(aggregateDefs: null | [[]]): {}` - prepares aggregate tables and calculates durations.
	//	Parameter: `aggregateDefs: null | [[]]` - optional, defaults to `null`; a list of aggregate definitions for the provisioned aggregate tables.
	//	Returns: An object similar to the following:
	//	```
	//	{
	//		"tables": [{									//	a list of aggregates, one per aggregateDefs element, except for aggregateDefs === null, see remarks
	//				"aggregateDef": [],						//	the aggregate definition used to prepare this table; in this parfticular case the empty array is interpreted as "aggregate all keys"
	//				"systemDurationNs": 20,					//	the total time overhead measured in trace-function calls related to the current aggregate
	//				"lastSystemDurationNs": 20,				//	the total time measured between the start of the first trace-function-call body execution and the end of the last trace-function-call body execution (includes the complete systemDurationNs)
	//				"significantDurationNs": 0,				//	the significant time, excluding any system time, measured the start of the first trace-function-call body execution and the start of the last trace-function-call body execution (excludes any systemDurationNs)
	//				"data": [{								//	a list of all entries created by trace-calls for all keys, sorted by timeNs/systemDurationNs/ordinal (if timeNs equals, compare systemDurationNs; if systemDurationNs equals, compare ordinal) in ascending order
	//						"key": 666,						//	the trace key argument
	//						"ordinal": 1,					//	auto-incrementing counter starting from 1; unique for the trace key; no overflow protection
	//						"message": "message",			//	trace message argument
	//						"details": 5,					//	trace details argument
	//						"timeNs": 10,					//	trace timeNs argument or if not provided, time taken as the first operation in the trace function body
	//						"lastSystemDurationNs": null,	//	the time measured between the previous and the current trace entry including the systemDurationNs of the previous trace entry; null with the first data array element
	//						"significantDurationNs": null,	//	the time measured between the previous and the current trace entry excluding the systemDurationNs of the previous trace entry; null with the first data array element
	//						"systemDurationNs": 20			//	the time overhead measured during the trace-function-call body execution related to the current trace entry
	//					}
	//				]
	//			}, {
	//				"aggregateDef": [666],
	//				"systemDurationNs": 20,
	//				"lastSystemDurationNs": 20,
	//				"significantDurationNs": 0,
	//				"data": [{
	//						"key": 666,
	//						"ordinal": 1,
	//						"message": "message",
	//						"details": 5,
	//						"timeNs": 10,
	//						"lastSystemDurationNs": null,
	//						"significantDurationNs": null,
	//						"systemDurationNs": 20
	//					}
	//				]
	//			}
	//		],
	//		"systemDurationNs": 20,							//	the total time overhead measured all trace-function-calls
	//		"lastSystemDurationNs": 20,						//	the total time measured between the start of the first trace-function-call body execution and the end of the last trace-function-call body execution for all keys combined (includes the complete systemDurationNs)
	//		"significantDurationNs": 0,						//	the significant time, excluding any system time, measured the start of the first trace-function-call body execution and the start of the last trace-function-call body execution for all keys combined (excludes any systemDurationNs)
	//	}
	//	```
	//	Remarks: Depending on the `aggregateDefs` value the function will return as follows:
	//		- if `aggregateDefs === []`, ommit any table data in the result and provide only general stats (the `outcome.tables` array is empty);
	//		- if `aggregateDefs === [[]]`, augment the result with one table aggregating all trace entries for all keys sorted chronologically;
	//		- if `aggregateDefs === null`, augment the result with one table aggregating all trace entries for all keys sorted chronologically, and one table per key;
	//		- if `aggregateDefs === [[], [key2], [key1, key2]]` (a sample) - augment the result with one table aggregating all trace entries for all keys (causeed by the
	//			first element `[]`) sorted chronologically, one table for `key2` and one table aggregating all trace entries for `key1` and `key2` sorted chronologically.
	report(aggregateDefs = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(aggregateDefs) && !Type.isArray(aggregateDefs)) throw new ArgumentException(0x1D31B3, `aggregateDefs`, aggregateDefs);
			if (!Type.isNU(aggregateDefs)) for (let length = aggregateDefs.length, i = 0; i < length; ++i) if (!Type.isArray(aggregateDefs[i])) throw new ArgumentException(0x374C02, `aggregateDefs[${i}]`, aggregateDefs);
		}

		const result =
		{
			tables: [],
			startTimeNs: Number.MAX_SAFE_INTEGER,
			endTimeNs: Number.MIN_SAFE_INTEGER,
			systemDurationNs: 0,
			lastSystemDurationNs: 0,
			significantDurationNs: 0,
		};

		if (!aggregateDefs)
		{
			aggregateDefs = [[]];												//	aggregate all keys in one table
			for (const key of this._store.keys()) aggregateDefs.push([key]);	//	aggregate every keys in a separate table
		}

		for (let ilength = aggregateDefs.length, i = 0; i < ilength; ++i)
		{
			const aggregateDef = aggregateDefs[i];
			const table =
			{
				aggregateDef,
				startTimeNs: Number.MAX_SAFE_INTEGER,
				endTimeNs: Number.MIN_SAFE_INTEGER,
				systemDurationNs: 0,
				lastSystemDurationNs: 0,
				significantDurationNs: 0,
				data: []
			};
			result.tables.push(table);
			let isEmpty = true;
			for (const item of _aggregate(this._store, aggregateDef))
			{
				table.data.push(
				{
					key: item[INDEX_KEY],
					ordinal: item[INDEX_ORDINAL],
					message: item[INDEX_MESSAGE],
					details: item[INDEX_DETAILS],
					timeNs: item[INDEX_TIMENS],
					systemDurationNs: item[INDEX_DURATIONNS_SYSTEM],
					lastSystemDurationNs: 0,	//	will be populated by `_calculateDurations()`
					significantDurationNs: 0,	//	will be populated by `_calculateDurations()`
				});
				isEmpty = false;
			}
			if (!isEmpty)
			{
				_sortData(table.data);
				_calculateDurations(table);
			}
			delete table.startTimeNs;
			delete table.endTimeNs;
		}

		let isEmpty = true;
		let endSystemDurationNs = 0;
		for (const item of _aggregate(this._store, []))
		{
			const timeNs = item[INDEX_TIMENS];
			const systemDurationNs = item[INDEX_DURATIONNS_SYSTEM];
			result.systemDurationNs += systemDurationNs;
			if (timeNs < result.startTimeNs) result.startTimeNs = timeNs;
			if (timeNs > result.endTimeNs)
			{
				result.endTimeNs = timeNs;
				endSystemDurationNs = systemDurationNs;
			}
			isEmpty = false;
		}
		if (!isEmpty)
		{
			const fullDurationNs = result.endTimeNs - result.startTimeNs + endSystemDurationNs;
			result.significantDurationNs = fullDurationNs - result.systemDurationNs;
			result.lastSystemDurationNs = endSystemDurationNs;
		}
		delete result.startTimeNs;
		delete result.endTimeNs;

		return result;

		function* _aggregate(store, def)
		{
			if (def.length == 0)
			{
				//	aggregate all keys in a combined table
				for (const buf of store.values()) for (let length = buf.count, i = 0; i < length; ++i) yield buf[i];
				return;
			}
			//	aggregate specified keys in a combined table
			for (let jlength = def.length, j = 0; j < jlength; ++j)
			{
				const buf = store.get(def[j]);
				if (!buf) continue;
				for (let klength = buf.count, k = 0; k < klength; ++k) yield buf[k];
			}
		}

		function _sortData(data)
		{
			data.sort((l, r) =>
			{
				let diff = l.timeNs - r.timeNs;
				if (diff) return diff;
				diff = l.systemDurationNs - r.systemDurationNs;
				if (diff) return diff;
				return l.ordinal - r.ordinal;
			});
		}

		function _calculateDurations(table)
		{
			let endSystemDurationNs = 0;
			for (let mlength = table.data.length, m = 0; m < mlength; ++m)
			{
				const item = table.data[m];
				const timeNs = item.timeNs;
				const systemDurationNs = item.systemDurationNs;
				table.systemDurationNs += systemDurationNs;
				if (m === 0)
				{
					item.lastSystemDurationNs = null;
					item.significantDurationNs = null;
				}
				else
				{
					const timeNs_prev = table.data[m - 1].timeNs;
					const systemDurationNs_prev = table.data[m - 1].systemDurationNs;
					const fullDurationNs = timeNs - timeNs_prev;
					item.lastSystemDurationNs = systemDurationNs_prev;
					item.significantDurationNs = fullDurationNs - systemDurationNs_prev;
				}
				if (timeNs < table.startTimeNs) table.startTimeNs = timeNs;
				if (timeNs > table.endTimeNs)
				{
					table.endTimeNs = timeNs;
					endSystemDurationNs = systemDurationNs;
				}
			}
			const fullDurationNs = table.endTimeNs - table.startTimeNs + endSystemDurationNs;
			table.lastSystemDurationNs = endSystemDurationNs;
			table.significantDurationNs = fullDurationNs - table.systemDurationNs;
		}
	}

	//	Property: `defaultTraceKey: any` - gets the default value for the `key` parameter of the `DiagnosticsCollector.trace` funciton.
	get defaultTraceKey()
	{
		return this._defaultTraceKey;
	}

	//	Property: `store: Map` - gets a dictionary (`Map`) holding all collected trace data in a raw format.
	//	Returns: a dictionary (`Map`) holding all collected trace data in the following format:
	//	```
	//	const { DiagnosticsCollector, TYPE_ENTRY, TYPE_PAUSE, INDEX_TYPE, INDEX_KEY, INDEX_TIMENS, INDEX_MESSAGE, INDEX_DETAILS, INDEX_ORDINAL, INDEX_DURATIONNS_SYSTEM } = require("-/pb/natalis/014/DiagnosticsCollector.js");
	//	const dia = new DiagnosticsCollector();
	//	dia.trace(666, "message", 5, 10, 20);
	//	//	dia.store.get(666) -> [[666, 10, "message", 5, 1, 20]]
	//	dia.store.get(666)[0][INDEX_TYPE] === TYPE_ENTRY;
	//	dia.store.get(666)[0][INDEX_KEY] === 666;
	//	dia.store.get(666)[0][INDEX_TIMENS] === 10;
	//	dia.store.get(666)[0][INDEX_MESSAGE] === "message";
	//	dia.store.get(666)[0][INDEX_DETAILS] === 5;
	//	dia.store.get(666)[0][INDEX_ORDINAL] === 1;
	//	dia.store.get(666)[0][INDEX_DURATIONNS_SYSTEM] === 20;
	//	```
	get store()
	{
		return this._store;
	}

	_store = new Map();

	//	Field: Indicates the trace buf element type ENTRY. All buf elements created by a `trace()` function call have this type.
	static TYPE_ENTRY = TYPE_ENTRY;
	//	Field: Indicates the trace buf element type PAUSE. All buf elements created by a `pause()` function call have this type.
	static TYPE_PAUSE = TYPE_PAUSE;
	//	Field: Indicates the type value index in a trace buf element.
	static INDEX_TYPE = INDEX_TYPE;
	//	Field: Indicates the trace key value index in a trace buf element.
	static INDEX_KEY = INDEX_KEY;
	//	Field: Indicates the time (in nanoseconds) key value index in a trace buf element.
	static INDEX_TIMENS = INDEX_TIMENS;
	//	Field: Indicates the message value index in a trace buf element.
	static INDEX_MESSAGE = INDEX_MESSAGE;
	//	Field: Indicates the details value index in a trace buf element.
	static INDEX_DETAILS = INDEX_DETAILS;
	//	Field: Indicates the ordinal value index in a trace buf element.
	static INDEX_ORDINAL = INDEX_ORDINAL;
	//	Field: Indicates the system duration (in nanoseconds) value index in a trace buf element.
	static INDEX_DURATIONNS_SYSTEM = INDEX_DURATIONNS_SYSTEM;
}

module.exports.DiagnosticsCollector = module.exports;
