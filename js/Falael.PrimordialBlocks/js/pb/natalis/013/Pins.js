//	R0Q3?/daniel/20220513
//	- DOC
//	- TEST
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException, ReturnValueException } = require("-/pb/natalis/003/Exception.js");
const Delegate = require("-/pb/natalis/012/Delegate.js");

module.exports =

class Pins extends Delegate
{
	constructor(create = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(create) && !CallableType.isFunction(create)) throw new ArgumentException(0x94BDA4, "create", create);
		}

		function construct()
		{
			this._items = new Map();

			this.has = pin => this._items.has(pin);
			this.unpin = pin => this._items.delete(pin);
		}

		function execute(pin, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
		{
			if (pin === void 0)
			{
				if (create) return create(arg1, arg2, arg3, arg4, arg5, arg6, arg7);
				else return arg1(arg2, arg3, arg4, arg5, arg6, arg7);
			}
			let result = this._items.get(pin);
			if (result !== void 0) return result;
			if (create) result = create(arg1, arg2, arg3, arg4, arg5, arg6, arg7);
			else result = arg1(arg2, arg3, arg4, arg5, arg6, arg7);
			if (result === void 0) throw new ReturnValueException(0x1D3431, "create", "undefined");
			this._items.set(pin, result);
			return result;
		}

		return super(execute, construct);	// eslint-disable-line
	}
}

module.exports.AsyncPins = class AsyncPins extends Delegate
{
	constructor(create = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(create) && !CallableType.isAsyncFunction(create)) throw new ArgumentException(0x3A4ECF, "create", create);
		}

		function construct()
		{
			this._items = new Map();

			this.has = pin => this._items.has(pin);
			this.unpin = pin => this._items.delete(pin);
		}

		async function execute(pin, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
		{
			if (pin === void 0)
			{
				if (create) return await create(arg1, arg2, arg3, arg4, arg5, arg6, arg7);
				else return await arg1(arg2, arg3, arg4, arg5, arg6, arg7);
			}
			let result = this._items.get(pin);
			if (result !== void 0) return result;
			if (create) result = await create(arg1, arg2, arg3, arg4, arg5, arg6, arg7);
			else result = await arg1(arg2, arg3, arg4, arg5, arg6, arg7);
			if (result === void 0) throw new ReturnValueException(0xFA7B98, "create", "undefined");
			this._items.set(pin, result);
			return result;
		}

		return super(execute, construct);	// eslint-disable-line
	}
};

//	Usage:
//	```
//	const { Pins, AsyncPins } = require("-/pb/natalis/013/Pins.js");
//
//	const pins1 = new Pins();
//	const outcome11 = pins1("pin1", (a) => ({a}), 5);	//	`outcome1 === { a: 5 }`
//	const outcome12 = pins1("pin1", (a) => ({a}), 10);	//	`outcome1 === { a: 5 }`
//	const outcome13 = pins1(void 0, (a) => ({a}), 7);	//	`outcome1 === { a: 7 }`
//	const outcome14 = pins1(void 0, (a) => ({a}), 9);	//	`outcome1 === { a: 9 }`
//	pins1.has("pin1");
//	pins1.unpin("pin1");
//
//	const pins2 = new AsyncPins(null);
//	const outcome21 = await pins2("pin1", async (a) => ({a}), 5);	//	`outcome1 === { a: 5 }`
//	const outcome22 = await pins2("pin1", async (a) => ({a}), 10);	//	`outcome1 === { a: 5 }`
//	const outcome23 = await pins2(void 0, async (a) => ({a}), 7);	//	`outcome1 === { a: 7 }`
//	const outcome24 = await pins2(void 0, async (a) => ({a}), 9);	//	`outcome1 === { a: 9 }`
//
//	const pins3 = new Pins((a) => ({a}));
//	const outcome31 = pins3("pin1", 5);	//	`outcome1 === { a: 5 }`
//	const outcome32 = pins3("pin1", 10);	//	`outcome1 === { a: 5 }`
//	const outcome33 = pins3(void 0, 7);	//	`outcome1 === { a: 7 }`
//	const outcome34 = pins3(void 0, 9);	//	`outcome1 === { a: 9 }`
//
//	const pins4 = new AsyncPins(async (a) => ({a}));
//	const outcome41 = await pins4("pin1", 5);	//	`outcome1 === { a: 5 }`
//	const outcome42 = await pins4("pin1", 10);	//	`outcome1 === { a: 5 }`
//	const outcome43 = await pins4(void 0, 7);	//	`outcome1 === { a: 7 }`
//	const outcome44 = await pins4(void 0, 9);	//	`outcome1 === { a: 9 }`
//	```

module.exports.Pins = module.exports;
