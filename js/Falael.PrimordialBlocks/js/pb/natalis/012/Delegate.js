//	R0Q2?/daniel/20220424
//	- TEST
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");

module.exports =

//	Class: A facility provisioning direct execution of class instances (`new Delegate()()`) with full access to all instance fields, properties and methods, and a functioning `instanceof`.
//		When used as a base class enables direct execution of instances to derived classes.
//	Remarks:
//		See the `_abnormal` property behavior in the Usage section.
//		Member functions `execute` and `construct` can be liberated from the special meaning imbued by `Delegate` by passing the correponding callbacks to the `Delegate` constructor.
//	Performance: The `Object.setPrototypeOf` call is required for the `instanceof` operator to work correctly but adds some instantiation performance overhead.
class Delegate
{
	//	Parameter: `execute(...args)` - executed on `new Delegate()(...args)`; bound to the delegate instance; must be a function (sync, async, generator and async generator are ok).
	//	Parameter: `construct(...args)` - executed on `new Delegate(...args)`; bound to the delegate instance; must be a synchronous non-generator function (not tested for synchronysity or being a generator).
	//	Parameter: `args` - any args that are passed to `construct()`.
	constructor(execute = null, construct = null, ...args)
	{
		if (PB_DEBUG)
		{
			if (!Type.isCallable(execute) && !Type.isCallable(this.execute)) throw new ArgumentException(0x3CA1DA, "execute", execute, `; a function value is required if no "execute" class method is present.`);
			if (!Type.isNU(construct) && !Type.isCallable(construct)) throw new ArgumentException(0x5B5709, "construct", construct);
			if (!Type.isNU(this.construct) && !Type.isCallable(this.construct)) throw new Exception(0xC03A8C, ` Format is invalid: "this.construct".`);
		}
		construct = construct || this.construct;
		execute = execute || this.execute;
		const instance = function (...args) { return execute.apply(instance, args); };
		Object.setPrototypeOf(instance, this.constructor.prototype);
		if (construct) construct.apply(instance, args);
		return instance;
	}
}

module.exports.Delegate = module.exports;

//	Usage:
//		Direct usage:
//		```
//			const instance = new Delegate(
//				function execute(b) { return 10 + this.prop + b },	//	cached for later execution
//				function construct(a) { this.prop = 5 + a },		//	executed once during object construction: `function construct(a) { this.prop = 5 + a }` with `a === 1`, see `...args`; `instance.prop` becomes `6`
//				1													//	`...args`
//			);
//			const result = instance(100);		//	result === 116;	executes the `execute` function: `function execute(b) { return 10 + this.prop + b }` with `b === 100` and `this.prop === 6`
//			const value = instance.prop;`		//	value === 6
//		```
//
//		Subclassing with callbacks:
//		```
//			class ChildSelegate extends Delegate
//			{
//				_abnormal = 7;							//	will have value `7` after construction, see below
//				_abnormal_workaround = 7;				//	will have value `8` after construction, see below
//				constructor(...args)
//				{
//					function execute(b)
//					{
//						return 10 + this._prop + b;
//					}
//					function construct(a)
//					{
//						this._prop = 5 + a;
//						this._abnormal = 8;				//	will have value `7` after construction; `function construct(a)` is executed by the base constructor, which is invoked by the JavaScript engine *before* the `_abnormal = 7` initialization.
//					}
//					const instance = super(execute, construct, ...args);
//					this._abnormal_workaround = 8;		//	will have value `8` after construction
//					return instance;
//				}
//				get prop() { return this._prop; }
//			}
//			const instance = new ChildSelegate(1);
//			const result = instance(100);		//	result === 116;	executes the `execute` function: `function execute(b) { return 10 + this.prop + b }` with `b === 100` and `this.prop === 6`
//			const value = instance.prop;`		//	value === 6
//
//			new ChildSelegate() instanceof ChildSelegate === true
//		```
//
//		Subclassing with methods:
//		```
//			class ChildSelegate extends Delegate
//			{
//				constructor(...args) { return super(null, null, ...args) }
//				construct(a)
//				{
//					this._prop = 5 + a;
//				}
//				execute(b)
//				{
//					return 10 + this._prop + b;
//				}
//				get prop() { return this._prop; }
//			}
//			const instance = new ChildSelegate(1);
//			const result = instance(100);		//	result === 116;	executes the `execute` function: `function execute(b) { return 10 + this.prop + b }` with `b === 100` and `this.prop === 6`
//			const value = instance.prop;`		//	value === 6
//
//			new ChildSelegate() instanceof ChildSelegate === true
//		```
