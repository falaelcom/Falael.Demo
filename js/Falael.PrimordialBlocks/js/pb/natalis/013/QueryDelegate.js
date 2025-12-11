//	R0Q2?/daniel/20220513
//	- DOC, TEST with Q returning a promise
//	- TEST
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException, NotImplementedException } = require("-/pb/natalis/003/Exception.js");
const Delegate = require("-/pb/natalis/012/Delegate.js");

module.exports =

//	Class: Enables the query configuration- and execution pattern, see Usage.
//	Remarks:
//		See the Usage section of `Delegate` for possible construction and initilization abnormalities and workarounds.
//		Member functions `execute`, `begin` and `construct` can be liberated from the special meaning imbued by `Delegate` by passing the correponding callbacks to the `Delegate` constructor.
class QueryDelegate extends Delegate
{
	//	Field: The name of the query's evaluation property.
	//	Usage: `queryDelegate().verb().Q`.
	static ValueName = "Q";

	//	Parameter: `execute(): any` - optional; on `QueryDelegate.ValueName` property get access, if set, executes the query, otherwise, if present,
	//		the query execution is delegated to `this.execute`, otherwise the `QueryDelegate.ValueName` property get accessor returns `void 0`.
	//	Parameter: `begin(...args): this` - optional; when this instance is invoked as a function, if set, initializes a new query, otherwise, if present,
	//		the query initialization is delegated to `this.begin`, otherwise the no query initialization is performed; `begin` and `this.begin` must always return `this`.
	//	Parameter: `construct(...args): void` - optional; on new instance creation, if set, initializes the new instances of the `QueryDelegate` class, otherwise, if present,
	//		the instance initialization is delegated to `this.construct`, otherwise the no instance initialization is performed.
	//	Parameter: `...args` - arguments passed on to the descendant's `construct` or `this.construct` function.
	//	Remarks: Exactly one of the two `execute` and `this.execute` functions is required to be present. If both are present, the `execute` is used and `this.execute`
	//		is ignored.
	//	Exception: `ArgumentException`.
	//	Exception: `NotImplementedException`.
	constructor(execute = null, begin = null, construct = null, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(execute) && !CallableType.isFunction(execute) && !CallableType.isAsyncFunction(execute)) throw new ArgumentException(0x91C6FD, "execute", execute);
			if (!Type.isNU(begin) && !CallableType.isFunction(begin)) throw new ArgumentException(0xA4F1CC, "begin", begin);
			if (!Type.isNU(construct) && !CallableType.isFunction(construct)) throw new ArgumentException(0xB6E172, "construct", construct);
		}
		function delegate_execute(...args)
		{
			return begin ? begin.apply(this, args) || this : this.begin ? this.begin.apply(this, args) || this : this;
		}
		function delegate_construct(...args)
		{
			const query_execute = execute || this.execute;
			const query_construct = construct || this.construct;
			if (PB_DEBUG)
			{
				if (!CallableType.isFunction(query_execute) && !CallableType.isAsyncFunction(query_execute)) throw new NotImplementedException(0xFC32CB, `; an "execute" method is required when no "execute" argument has been provided.`);
			}
			query_construct && query_construct.apply(this, args);
			Object.defineProperty(this, QueryDelegate.ValueName, { get: () => query_execute.call(this) });
		}
		return super(delegate_execute, delegate_construct, ...args);	// eslint-disable-line
	}
}

module.exports.QueryDelegate = module.exports;

//	Usage:
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
//		const query = new QueryDelegate(execute, begin, construct, 5);
//		if (query.Q !== 5) fail("QueryDelegate (04.01)");
//		if (query(10).Q !== 15) fail("QueryDelegate (04.02)");
//		```
//
//		Direct usage (async `execute`):
//		```
//		function begin(b)
//		{
//			this.b = b;
//			return this;	//	this line is optional
//		}
//		async function execute()
//		{
//			return new Promise((r) => r(this.a + this.b));
//		}
//		function construct(a)
//		{
//			this.a = a;
//			this.b = 0;
//		}
//		const query = new QueryDelegate(execute, begin, construct, 5);
//		if (await query.Q !== 5) fail("QueryDelegate (04.01)");
//		if (await query(10).Q !== 15) fail("QueryDelegate (04.02)");
//		```
//
//		Subclassing with callbacks:
//		```
//		class C extends QueryDelegate
//		{
//			c = 7;
//			abnormal01 = 7;
//			abnormal02 = 7;
//
//			constructor(...args)
//			{
//				function execute()
//				{
//					return this._a + this._value;
//				}
//				function begin(b)
//				{
//					this._value = b;
//					return this;	//	this line is optional
//				}
//				function construct(a)
//				{
//					this._a = a;
//					this._value = 0;
//
//					this.abnormal01 = 8;
//				}
//				const instance = super(execute, begin, construct, ...args);
//				this.abnormal02 = 8;
//				return instance;
//			}
//
//			inc()
//			{
//				++this._value;
//				return this;
//			}
//		}
//		const query = new C(5);
//		if (query.c !== 7) fail("QueryDelegate (06.01)");
//		if (query.abnormal01 !== 7) fail("QueryDelegate (06.011)");
//		if (query.abnormal02 !== 8) fail("QueryDelegate (06.012)");
//		if (query.Q !== 5) fail("QueryDelegate (06.02)");
//		if (query(10).Q !== 15) fail("QueryDelegate (06.03)");
//		if (query(10).inc().Q !== 16) fail("QueryDelegate (06.04)");
//		if (query(10).inc().inc().Q !== 17) fail("QueryDelegate (06.05)");
//		```
//
//		Subclassing with methods:
//		```
//		class C extends QueryDelegate
//		{
//			c = 7;
//			abnormal01 = 7;
//			abnormal02 = 7;

//			constructor(...args)
//			{
//				const instance = super(null, null, null, ...args);
//				this.abnormal02 = 8;
//				return instance;
//			}
//			execute()
//			{
//				return this._a + this._value;
//			}
//			begin(b)
//			{
//				this._value = b;
//				return this;	//	this line is optional
//			}
//			construct(a)
//			{
//				this._a = a;
//				this._value = 0;

//				this.abnormal01 = 8;
//			}
//			inc()
//			{
//				++this._value;
//				return this;
//			}
//		}
//		const query = new C(5);
//		if (query.c !== 7) fail("QueryDelegate (07.01)");
//		if (query.abnormal01 !== 7) fail("QueryDelegate (07.011)");
//		if (query.abnormal02 !== 8) fail("QueryDelegate (07.012)");
//		if (query.Q !== 5) fail("QueryDelegate (07.02)");
//		if (query(10).Q !== 15) fail("QueryDelegate (07.03)");
//		if (query(10).inc().Q !== 16) fail("QueryDelegate (07.04)");
//		if (query(10).inc().inc().Q !== 17) fail("QueryDelegate (07.05)");
//		```

module.exports.QueryDelegate = module.exports;
