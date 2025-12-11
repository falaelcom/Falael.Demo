//	R0Q3/daniel/20230910
//	- DOC: proof-read all docs
//	- DOC: detailed Usage
//	- TODO: implement `AsyncQuery` after `Query` gets tested and its interface becomes well-established

"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException, InvalidOperationException, NotImplementedException } = require("-/pb/natalis/003/Exception.js");
const { tunable } = require("-/pb/natalis/010/Context.js");
const { DiagnosticsCollector } = require("-/pb/natalis/014/DiagnosticsCollector.js");
const { QueryDelegate }  = require("-/pb/natalis/013/QueryDelegate.js");

const T_0xEE2A12 = tunable(0xEE2A12);

const VALUE_TREATMENT_FROM_CACHE = 0;
const VALUE_TREATMENT_EVALUATE = 1;
const VALUE_TREATMENT_EVALUATE_AND_CACHE = 2;

module.exports =

//	Class: Extends `QueryDelegate` with built-in caching, diagnostic and relaying capabilities.
//	Remarks:
//		Strictly synchronous. An async version of this interface is pending implementation under the `AsyncQuery` name.
//		Relaying designates the capability of a query to transfer execution to another query along with its current state; relaying is done via a `query.relay()` call and is usually wrapped
//			in a function that knows which query it's relaying to and how to prepare its state for the transfer, usually by performing pending operations and caching the result in
//			`this._principal._value`.
//	Performance:
//		The `Query` facade aims to provide a convenient pipeline configuration pattern free of extra memory operations:
//		```
//			counst outcome1 = usualFunction_operation1({ opt11, opt12, opt13, port14: { opt15 } });		//	2 new objects per call
//			counst outcome2 = usualFunction_operation2(outcome1, { opt21, opt22 });						//	1 new object per call
//			//	vs
//			const singleQueryInstance = new SomeQuery();
//			counst outcome2 = singleQueryInstance(opt11, opt12)
//				.config(opt13)																			//	extra function call instead of memory allocation
//				.config2(opt15)																			//	extra function call instead of memory allocation
//				.operation1()
//				.operation2(opt21, opt22)
//				.Q;
//			counst outcome3 = singleQueryInstance(opt11, opt12).Q;	//	singleQueryInstance - reusable
//		```
//		According to the V8 performance profiling available in Primordial Blocks, a function call is roughly 3x faster than object creation not considering garbage collection,
//			which renders the `Query` approach arguably more efficient than the commonly used "options" approach in cases when the operations performed by the
//			pipeline take times close to object creation and function calls (e.g. graph processing).
//	See also: `QueryDelegate`; take a note on possible construction and initilization abnormalities and workarounds.
class Query extends QueryDelegate
{
	//	Parameter: `execute(): any` - optional; if set, on `QueryDelegate.ValueName` property get access (e.g. `myquery().Q`) executes the query, otherwise
	//		the query execution is delegated to `this.execute` if present, otherwise the `QueryDelegate.ValueName` property get accessor returns `void 0`.
	//	Parameter: `begin(...args, diagnosticsCollector: DiagnosticsCollector | void 0): this` - optional; if set, initializes a new query when this instance is invoked as a function,
	//		otherwise, the query initialization is delegated to `this.begin` if present, otherwise no query initialization is performed.
	//		If the last argument of the query session begin (i.e. invoking the query instance as a function) is of type `DiagnosticsCollector`, it's set and used as a diagnostics collector
	//		(`dia`) for this instance and all subsequently relayed queries and is excluded from the arguments that are passed to `begin` or `this.begin`.
	//	Parameter: `construct(...args): void` - optional; on new instance creation, if set, initializes the new instances of the `Query` class, otherwise, if present,
	//		the instance initialization is delegated to `this.construct`, otherwise no instance initialization is performed.
	//	Parameter: `...args` - arguments passed on to the descendant's `construct` or `this.construct` function.
	//	Remarks:
	//		Exactly one of the two `execute` and `this.execute` functions is required to be present.If both are present, `execute` is used and`this.execute` is ignored.
	//		The `T_0xEE2A12` tunable controls the behavior of the `pin` method. If `T_0xEE2A12` is set to `true` the internal caching mechanism of `Query` is enabled, otherwise
	//			it's disabled. This control mechanism affects all queries in the application and is provided for diagnostic purposes. During development, comparing the application
	//			behavior with cache on and off might provide valuable diagnostics insights.
	//		Cache keys are scoped per `Query` instance.
	//		Caching uses lazy initialization, and any code related to caching is executed for the first time with the `pin` method call.
	//		For further details on caching see `Query.pin()`.
	//	Exception: `ArgumentException`.
	//	Exception: `InvalidOperationException`.
	//	Exception: `NotImplementedException`.
	constructor(execute = null, begin = null, construct = null, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(execute) && !CallableType.isFunction(execute)) throw new ArgumentException(0xC3F8C0, "execute", execute);
			if (!Type.isNU(begin) && !CallableType.isFunction(begin)) throw new ArgumentException(0x228687, "begin", begin);
			if (!Type.isNU(construct) && !CallableType.isFunction(construct)) throw new ArgumentException(0xD88E98, "construct", construct);
		}

		function beginQuery(...args)
		{
			if (PB_DEBUG)
			{
				if (args.length && args[args.length - 1] instanceof DiagnosticsCollector && args[args.length - 1].constructor !== DiagnosticsCollector) throw new ArgumentException(0xAC060A, "args[args.length - 1]", args[args.length - 1]);
				if (this._debugIsActive) throw new InvalidOperationException(0x4D6FED, "attempt to begin an active query");
				this._debugIsActive = true;
			}

			const hasDia = args.length && args[args.length - 1].constructor === DiagnosticsCollector;
			const effectiveArgs = hasDia ? args.slice(0, -1) : args;

			this._principal = this;
			this._value = void 0;
			this._cacheKey = null;
			this._valueTreatment = VALUE_TREATMENT_EVALUATE;
			this._dia = args.length && args[args.length - 1].constructor === DiagnosticsCollector ? args[args.length - 1] : null;
			this._did = this.constructor.name;

			this._dia && this._dia.trace(this.constructor.name, "begin");

			return begin ? begin.apply(this, effectiveArgs) || this : this.begin ? this.begin.apply(this, effectiveArgs) || this : this;
		}

		function executeQuery()
		{
			if (PB_DEBUG)
			{
				if (!this._debugIsActive) throw new InvalidOperationException(0x20D470, "attempt to execute an inactive query");
			}
			switch (this._principal._valueTreatment)
			{
				case VALUE_TREATMENT_EVALUATE:
					this._principal._value = execute ? execute.call(this) : this.execute ? this.execute.apply(this) : this._principal._value;
					this._principal._dia && this._principal._dia.trace(this._did, "evaluate", { value: this._principal._value });
					break;
				case VALUE_TREATMENT_EVALUATE_AND_CACHE:
					this._principal._cache.set(this._principal._cacheKey, this._principal._value = execute ? execute.call(this) : this.execute ? this.execute.apply(this) : this._principal._value);
					this._principal._dia && this._principal._dia.trace(this._did, "evaluate and cache", { value: this._principal._value });
					break;
				case VALUE_TREATMENT_FROM_CACHE:
					this._principal._dia && this._principal._dia.trace(this._did, "from cache", { value: this._principal._value });
					break;
				default: throw new NotImplementedException(0x487350);
			}
			if (PB_DEBUG)
			{
				this._debugIsActive = false;
			}
			return this._principal._value;
		}

		const instance = super(executeQuery, beginQuery, construct, ...args);	// eslint-disable-line
		instance._cache = null;
		return instance;
	}

	//	Function: Extends this instance with a new method.
	//	Parameter: `name: string` - the name of the new method; if `PB_DEBUG === true`, a name collision with an existing class member will cause an exception.
	//	Parameter: `method(...args)` - added as a method with name `name` to this instance, bound to this instance.
	//	Returns: This instance.
	//	Remarks:
	//		IMPORTANT: The `method` argument will be bound to `this` instance; since arrow functions don't respect the bound `this` and `this` instance of the `Query` won't be available 
	//			in the function's body, passing an arrow function as a value for `method` is meaningless. Because at this point there's no known way to reliably differentiate 
	//			between this - bindeable and non - bindeable functions, non - bindeable functions are accepted as `extend` arguments, and the responsibility for avoiding them 
	//			falls on the programmer.
	//		This function is required for late-wireup of cyclic relay dependencies between `Query` instances, e.g.if `LexiconQuery` references and relays to `GraphQuery` via
	//			`new LexiconQuery().toCompactList()`, relaying back to `LexiconQuery` via `new LexiconQuery().toCompactList().someGraphQueryOp().toLexicon()` would normally require
	//			`GraphQuery` to be referencing `LexiconQuery`, which would create a circular reference that is forbidden by Primordial Blocks. The `extend` method allows for
	//			referencing both `LexiconQuery` and `GraphQuery` from the codebase to extend both queries with the capability to relay to each other.
	//			It also enables extending existing queries with relays to newly implemented queries.
	//		As a general recommendation, relay wireup should happen at application boot as a form of semantical configuration.
	//	Usage:
	//		Provision: `query.extend("name", function (...args) { return this.relay(anotherQuery, this.value, ...args)) }`.
	//		Utilization: `query.name(...args)`.
	extend(name, method)
	{
		if (PB_DEBUG)
		{
			if (this._debugIsActive) throw new InvalidOperationException(0xA02699, "attempt to extend an active query");
			if (!Type.isString(name)) throw new ArgumentException(0x58DDA1, "name", name);
			if (Object.prototype.hasOwnProperty.call(this, name)) throw new ArgumentException(0x2D7BC6, "name", name);
			if (!CallableType.isFunction(method)) throw new ArgumentException(0x933A0B, "method", method);
		}
		this[name] = method.bind(this);
		return this;
	}

	//	Function: Relays the query execution to another `Query` instance.
	//	Parameter: `next: Query` - the `Query` instance to relay query execution to.
	//	Parameter: `...args` - The rest of the arguments are passed directly to the invokation of the `next` `Query`.
	//	Remarks:
	//		Relaying designates the capability of a query to transfer execution to another query along with its current state; relaying is done via a `query.relay()` call and is usually
	//			wrapped in a function that knows which query it's relaying to and how to prepare its state for the transfer, usually by performing pending operations and caching the result in
	//			`this._principal._value`.
	//		All `Query` instances maintain a private `principal` property that initially refers to `this`. All internal references to the query's caching mechanism and the `DiagnosticsCollector`
	//			are routed through the `principal` property, which allows for switching to another caching and debugging prvoider by chainging the value of the `principal` property.
	//		When invoked, `relay` invokes the `next` `Query` as a function with the given `...args`, sets its `principal` property to refer to its own principal (which
	//			points to their principal for relayed queries, and so on) and returns the `next` `Query`.
	//	Exception: `ArgumentException`.
	relay(next, ...args)
	{
		if (PB_DEBUG)
		{
			if (!(next instanceof Query)) throw new ArgumentException(0xEBB3FD, "next", next);
			if (!this._debugIsActive) throw new InvalidOperationException(0xAF135F, "attempt to relay an inactive query");
			if (next._debugIsActive) throw new InvalidOperationException(0x82EC0A, "attempt to relay to an active query");
		}

		this._principal._dia && this._principal._dia.trace(this._did, "relay", { next });

		const result = next(...args);
		result._principal = this._principal;
		if (PB_DEBUG)
		{
			this._debugIsActive = false;
		}
		return result;
	}

	//	Function: Sets a cache key for the current query.
	//	Parameter: `cacheKey: any` - optional, defaults to `null`; a cache key for the current query.
	//	Parameter: `enableOverride: boolean | void 0` - optional, defualuts to `tunable(0xEE2A12)`; an explicit override for `tunable(0xEE2A12)`; if set will govern the cache enabled state for
	//		this `Query`.
	//	Returns: This instance.
	//	Remarks:
	//		Tries to retrieve a cached value for that key and if successful, instructs the query to skip the execution of the rest of the operations and to return the retrieved value
	//			as a final result by setting `this.valueTreatment = VALUE_TREATMENT_FROM_CACHE` (all query chainable methods are required to test `this.valueTreatment` and skip execution
	//			if set to `VALUE_TREATMENT_FROM_CACHE`). Otherwise the query execution proceeeds normally until the final result is requested and then the final result is added to
	//			the cache and returned faterwards.
	//		Repeated calls to this method will replace `this.cacheKey`.
	//
	//		The `tunable(0xEE2A12)` tunable controls the behavior of the `pin` method. If `tunable(0xEE2A12)` is set to `true` the internal caching mechanism of `Query` is enabled, otherwise
	//			it's disabled. This control mechanism affects all queries in the application and is provided for diagnostic purposes. During development, comparing the application
	//			behavior with cache on and off might provide valuable diagnostics insights.
	//		Cache keys are scoped per `Query` instance.
	//		Caching uses lazy initialization, and any code related to caching is executed for the first time with the `pin` method call.
	//	Tunable: `0xEE2A12` - if set to `false` disables query caching for all `Query` instances.
	//	Usage:
	//		To ensure correct operation in caching scenarios all query implementations must adher to the following rule: chainable methods must test the value of `this.valueTreatment`
	//			and if `true` must return `this` immediately:
	//			```
	//			class SomeQuery extends Query
	//			{
	//				//...
	//				someMethod()
	//				{
	//					if(!this.valueTreatment) return this;	//	same as this.valueTreatment === VALUE_TREATMENT_FROM_CACHE because VALUE_TREATMENT_FROM_CACHE === 0
	//
	//					// the actual method implementation
	//					return this;
	//				}
	//				//...
	//			}
	//			```
	//	Exception: `ArgumentException`.
	//	Exception: `InvalidOperationException`.
	pin(cacheKey = null, enableOverride = void 0)
	{
		if (PB_DEBUG)
		{
			if (!this._debugIsActive) throw new InvalidOperationException(0xF16462, "attempt to pin an inactive query");
			//	`cacheKey` can be anything
			if (enableOverride !== void 0 && !Type.isBoolean(enableOverride)) throw new ArgumentException(0xCCCFDE, "enableOverride", enableOverride);
			
		}
		if (enableOverride !== void 0)
		{
			if (!enableOverride) 
			{
				this._principal._dia && this._principal._dia.trace(this._did, "pin: cache disabled via override", { cacheKey, cachedSize: this._principal._cache ? this._principal._cache.size : void 0 });
				return this;
			}
		}
		else if (!T_0xEE2A12) 
		{
			this._principal._dia && this._principal._dia.trace(this._did, "pin: cache disabled via tunable(0xEE2A12)", { cacheKey });
			return this;
		}
		this._principal._cacheKey = cacheKey;
		if (!this._principal._cache)
		{
			this._principal._cache = new Map();
			this._principal._valueTreatment = VALUE_TREATMENT_EVALUATE_AND_CACHE;
			this._principal._dia && this._principal._dia.trace(this._did, "pin: scheduled for caching", { cacheKey, cachedSize: 0 });
			return this;
		}
		if (!this._principal._cache.has(cacheKey))
		{
			this._principal._valueTreatment = VALUE_TREATMENT_EVALUATE_AND_CACHE;
			this._principal._dia && this._principal._dia.trace(this._did, "pin: scheduled for caching", { cacheKey, cachedSize: this._principal._cache.size });
			return this;
		}
		this._principal._value = this._principal._cache.get(cacheKey);
		this._principal._valueTreatment = VALUE_TREATMENT_FROM_CACHE;
		this._principal._dia && this._principal._dia.trace(this._did, "pin: cache hit", { cacheKey, value: this._principal._value, cachedSize: this._principal._cache.size });
		return this;
	}

	//	Function: Appends a trace entry to the `DiagnosticCollector` (`this.dia`) if one has been provided at `this` begin.
	//	Parameter: `key: any` - optional, defaults to `this.dia.defaultTraceKey`; the trace key; trace data is collected per trace key.
	//	Parameter: `message: string` - optional, defaults to `null`; the trace message.
	//	Parameter: `details: any` - optional, defaults to `null`; the trace details.
	//	Parameter: `timeNs: integer` - optional, defaults to the time taken as the first operation of the trace function body execution; the time to be traced, in nanoseconds.
	//	Parameter: `systemDurationNs: integer` - optional, defaults to the duration measured between the start and the end of the trace function body execution; the system duraiton to be
	//		traced, in nanoseconds.
	//	Returns: This instance.
	//	Remarks:
	//		With a `DiagnosticCollector` provided on query begin, the `Query` appends exactly one trace entry when:
	//			- the query begins, trace key is `this.did`;
	//			- `DiagnosticCollector.relay` is called, trace key is `this.did`;
	//			- `DiagnosticCollector.pin` is called, trace key is `this.did`;
	//			- `DiagnosticCollector.trace` is called, trace key is the `key` argument;
	//			- the query ends, trace key is `this.did`.
	//		Custom trace entries can be appended to the automatically maintained trace list by calling `DiagnosticCollector.trace` with `this.did` as value for `key`, e.g.
	//			```
	//			new MyQuery()(new DiagnosticCollector()).trace(q.did).Q;
	//			new MyQuery()(new DiagnosticCollector()).setDid("DID").trace(q.did).Q;
	//			```
	//		If no `DiagnosticCollector` (`this.dia`) was provided in the`Query` invokation, does nothing.
	trace(key = null, message = null, details = null, timeNs = null, systemDurationNs = null)
	{
		if (PB_DEBUG)
		{
			if (!this._debugIsActive) throw new InvalidOperationException(0x949D49, "attempt to trace an inactive query");
			//	`key` can be anything
			if (!Type.isNU(message) && !Type.isString(message)) throw new ArgumentException(0x730D8E, `message`, message);
			//	`details` can be anything
			if (!Type.isNU(timeNs) && !Type.isInteger(timeNs)) throw new ArgumentException(0x74434F, `timeNs`, timeNs);
			if (!Type.isNU(systemDurationNs) && !Type.isInteger(systemDurationNs)) throw new ArgumentException(0x662568, `systemDurationNs`, systemDurationNs);
		}
		this._principal._dia && this._principal._dia.trace(key, message, details, timeNs, systemDurationNs);
		return this;
	}

	//	Function: `setDid(value: any)` - sets the diagnostic trace key used by this instance's built-in trace calls.
	//	Parameter: `value: any` - the diagnostic trace key used by this instance's built-in trace calls.
	//	Remarks:
	//		The `did` property is NOT relayed.
	//		This method is invokable both in debug-active and debug-inactive state.
	//	See also: `Query.trace`.
	setDid(value)
	{
		this._did = value;
		return this;
	}

	//	Function: `setValue(value: any)` - sets the query's current value for the current principal.
	//	Parameter: `value: any` - the value to use.
	//	Remarks:
	//		The `value` property is relayed.
	//		This method is invokable both in debug-active and debug-inactive state.
	//	See also: `Query.pin`.
	setValue(value)
	{
		if (this.valueTreatment === VALUE_TREATMENT_FROM_CACHE) return this;

		this._principal._value = value;
		return this;
	}


	//	Property: `principal: Query` - gets the current principal.
	//	Remarks: This property is relayed.
	//	See also: `Query.relay`.
	get principal() { return this._principal; }

	//	Property: `relayed: boolean` - gets a value indicating whether the current query is being relayed.
	//	See also: `Query.trace`.
	//	See also: `Query.relay`.
	get isRelayed() { return this._principal !== this; }

	//	Property: `dia: DiagnosticCollector | null` - gets the current `DiagnosticsCollector` instance with this `Query`'s principal.
	//	Remarks: This property is relayed.
	//	See also: `Query.trace`.
	get dia() { return this._principal._dia; }

	//	Property: `cache: Map` - gets the `Map` instance of the current cache with this `Query`'s principal if set.
	//	Returns: `null` if no cache has been used yet or the `Map` instance of the current cache with this `Query`'s principal.
	//	Remarks: This property is relayed.
	//	See also: `Query.pin`.
	get cache() { return this._principal._cache; }

	//	Property: `cacheKey: string` - gets the current cache key with this `Query`'s principal if set.
	//	Returns: `null` if no cache has been used yet or the current cache key with this `Query`'s principal.
	//	Remarks: This property is relayed.
	//	See also: `Query.pin`.
	get cacheKey() { return this._principal._cacheKey; }

	//	Property: `valueTreatment: integer` - gets a value indicating query's behavior in relation to caching:
	//		- `VALUE_TREATMENT_FROM_CACHE` (`0`) - all query operations after the `pin` operations are skipped; the query evaluation property returns a cached value;
	//		- `VALUE_TREATMENT_EVALUATE` (`1`) - no caching; the query evaluation property returns an evaluated value;
	//		- `VALUE_TREATMENT_EVALUATE_AND_CACHE` (`2`) - evaluate and cache; the query evaluates and caches a value and the query evaluation property returns the evaluated value;
	//	Remarks: This property is relayed.
	//	See also: `Query.pin`.
	get valueTreatment() { return this._principal._valueTreatment; }

	//	Property: `value: any` - gets the current query value with this `Query`'s principal.
	//	Remarks: This property is relayed.
	//	See also: `Query.pin`.
	get value() { return this._principal._value; }

	//	Property: `did: any` - gets the diagnostic trace key used by this instance's built-in trace calls.
	//	Returs: The name of this instance class acquired via `this.constructor.name`.
	//	Remarks: This property is NOT relayed.
	//	See also: `Query.trace`.
	get did() { return this._did; }

	//	Property: `debugIsActive: boolean` - gets the current query active state.
	//	Remarks:
	//		This property is only executable if `PB_DEBUG === true` and is provided mainly for the purpose of unit-testing the overlapping `Query` session executions debug-time prevention.
	//			If executed with `PB_DEBUG === false` this property throws an `InvalidOperationException`.
	//		A `Query` is considered active after invoking it as a function (`new Query()()`) and before executing the query's evaluation property (`new Query()().Q`).
	//		This property is NOT relayed.
	//	Exception: `InvalidOperationException`.
	//	Usage: The `debugIsActive` use must always be enclosed in a `if(PB_DEBUG)` conditional body:
	//	```
	//		if(PB_DEBUG)
	//		{
	//			new Query().debugIsActive;
	//		}
	//		
	//	```
	//	See also: `QueryDelegate`.
	get debugIsActive()
	{
		if (!PB_DEBUG)
		{
			throw new InvalidOperationException(0x88DA36);
		}
		return this._debugIsActive;
	}
}

module.exports.Query = module.exports;
module.exports.Query.VALUE_TREATMENT_FROM_CACHE = VALUE_TREATMENT_FROM_CACHE;
module.exports.Query.VALUE_TREATMENT_EVALUATE = VALUE_TREATMENT_EVALUATE;
module.exports.Query.VALUE_TREATMENT_EVALUATE_AND_CACHE = VALUE_TREATMENT_EVALUATE_AND_CACHE;


//	Usage
//
//		Direct usage:
//		```
//		function begin(b)
//		{
//			this.b = b;
//			return this;	//	this line is optional
//		}
//		function execute()
//		{
//			return this.a + this.b;
//		}
//		function construct(a)
//		{
//			this.a = a;
//			this.b = 0;
//		}
//		const query = new Query(execute, begin, construct, 5);
//		if (query.Q !== 5) fail("Query (01.01)");
//		if (query(10).Q !== 15) fail("Query (01.02)");
//		if (query.pin("cached").Q !== 5) fail("Query (01.03)");
//		if (query(10).pin("cached").Q !== 5) fail("Query (01.04)");
//		```
//
//		See the unit tests for `Query` for more usage samples.
