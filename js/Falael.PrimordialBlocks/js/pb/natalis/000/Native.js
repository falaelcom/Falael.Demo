//	R0Q2?/daniel/20240620
//	- TODO: `Native.inlineFunction` - better implementation with better support for js constructs; test regex performance and possibly reimplement without regex
//	- TODO: explore the following opportunity for more compatible type detection: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
//	- DOC: `Native`, `Native.isUnset`, `Native.valuesEqual`, `Native.arraysEqual`, `Native.Type.*()`, `Native.CallableType.getCallableType`, `Native.LiteralType.*()`, `Native.inlineFunction`
//	- TEST: `Native.arraysEqual`, `Native.Type.instanceOf`
//	- TEST: add tests for bound functions (sync, async, generator, async generator)

"use strict";

const Iterator = Object.getPrototypeOf(function* () { }).prototype;
const GeneratorFunction = Object.getPrototypeOf(function* () { }).constructor;
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () { }).constructor;

const Native = module.exports =
{
	//	Field: `Type.Unset` provides a way for functions specialized in manipulation of JavaScript values to handle transparently all possible JavaScript types and values, including `null` 
	//		and `void 0` (undefined).
	//	Remarks: 
	//		Any functions expecting `Type.Unset` as an argument or returning it must explicitly document its usage.
	//		`Type.Unset` represents the concept of complete non-existence in JavaScript, as opposed to `null` and `void 0`, both of which can be used as legitime values of variables, 
	//			properties and array elements. Can be used to distinguish a property that has not been defined (`Object.prototype.hasOwnProperty.call(this, name) === false`) from a defined 
	//			property with value of `void 0`.
	//		If returned by a callback, this symbol indicates that the callback is unable to provide a meaningful return value and a defualt value sould be used instead.
	//		If passed as an argument, `Type.Unset` indicates that the argument should not be considered and a defualt value sould be used instead.
	Unset: Symbol("Unset"),

	isUnset(value)
	{
		return value === Native.Unset;
	},

	valuesEqual(left, right)
	{
		if (left === void 0)
		{
			if (right === void 0) return true;
			return false;
		}
		if (left === null)
		{
			if (right === null) return true;
			return false;
		}
		if (left !== left)
		{
			if (right !== right) return true;
			return false;
		}
		if (right === void 0 || right === null || right !== right) return false;

		if (left.constructor !== right.constructor) return false;

		if (left.constructor === Boolean ||
			left.constructor === Number ||
			left.constructor === String ||
			left.constructor === Symbol ||
			left.constructor === Date)
		{
			return left.valueOf() === right.valueOf();
		}

		if (global.BigInt && left.constructor === global.BigInt) return left.valueOf() === right.valueOf();

		//	https://stackoverflow.com/a/10776682/4151043
		if (left.constructor === RegExp)
		{
			return left.source === right.source &&
				left.global === right.global &&
				left.ignoreCase === right.ignoreCase &&
				left.multiline === right.multiline &&
				left.dotAll === right.dotAll &&
				left.sticky === right.sticky &&
				left.unicode === right.unicode;
		}

		//	Object, Array, Symbol, Function, Object, Iterator, Proxy (with proxies, the proxy object references are compared, and no of the wrapped value)
		return left === right;
	},

	arraysEqual(left, right, valuesEqual = null)
	{
		if (!Array.isArray(left) || !Array.isArray(right)) return false;
		if (left.length !== right.length) return false;
		if (!left.length) return true;
		if (valuesEqual)
		{
			for (let length = left.length, i = 0; i < length; ++i) if (!valuesEqual(left[i], right[i])) return false;
		}
		else
		{
			for (let length = left.length, i = 0; i < length; ++i) if (left[i] !== right[i]) return false;
		}
		return true;
	},

	//	Parameter: `args: [{ isLiteral, value }]`
	//	Remarks: Current implementation doesn't parse literal strings.
	inlineFunction(fn, ...args)
	{
		const STATE_CODE = Symbol("STATE_CODE");
		const STATE_STRING = Symbol("STATE_STRING");
		const STATE_STRING_ESCAPE_SEQUENCE = Symbol("STATE_STRING_ESCAPE_SEQUENCE");
		const STATE_IDENTIFIER = Symbol("STATE_IDENTIFIER");

		const { params, body } = __parseFunctionDefinition(fn);

		const paramArgMap = new Map();
		for (let length = params.length, i = 0; i < length; ++i)
		{
			const param = params[i];
			const { isLiteral, value } = args[i];
			paramArgMap.set(param, isLiteral ? JSON.stringify(value) : value);
		}

		return __replaceParamsWithArgs(body, paramArgMap);

		function __replaceParamsWithArgs(code, paramArgMap)
		{
			let result = "";
			let state = STATE_CODE;
			let buffer = "";

			for (let length = code.length, i = 0; i < length; ++i)
			{
				const c = code.charCodeAt(i);
				switch (state)
				{
					case STATE_CODE:
						if ((c > 64 && c < 91) || 	// upper alpha (A-Z)
							(c > 96 && c < 123) || 	// lower alpha (a-z)
							c === 95 || 			// underscore (_)
							c === 36)				// dollar sign ($)
						{
							buffer = code[i];
							state = STATE_IDENTIFIER;
							continue;
						}
						if (c === 39 || 			// quote (')
							c === 34)				// double quote (")
						{
							result += code[i];
							state = STATE_STRING;
							continue;
						}
						if (c === 96)				// backtick (`)
						{
							throw new Error(`0xE65629 Not implemented (literal strings).`);
						}
						result += code[i];
						continue;
					case STATE_STRING:
						if (c === 92)				// backslash (\)
						{
							result += code[i];
							state = STATE_STRING_ESCAPE_SEQUENCE;
							continue;
						}
						if (c === 39 || 			// quote (')
							c === 34)				// double quote (")
						{
							result += code[i];
							state = STATE_CODE;
							continue;
						}
						result += code[i];
						continue;
					case STATE_STRING_ESCAPE_SEQUENCE:
						result += code[i];
						state = STATE_STRING;
						continue;
					case STATE_IDENTIFIER:
						if ((c > 47 && c < 58) || 	// numeric (0-9)
							(c > 64 && c < 91) || 	// upper alpha (A-Z)
							(c > 96 && c < 123) || 	// lower alpha (a-z)
							c === 95 || 			// underscore (_)
							c === 36)				// dollar sign ($)
						{
							buffer += code[i];
							continue;
						}
						const value = paramArgMap.get(buffer);
						result += value === void 0 ? buffer : value;
						if (c === 39 || 			// quote (')
							c === 34)				// double quote (")
						{
							result += code[i];
							state = STATE_STRING;
							continue;
						}
						if (c === 96)				// backtick (`)
						{
							throw new Error(`0x469025 Not implemented (literal strings).`);
						}
						result += code[i];
						state = STATE_CODE;
						continue;
					default: throw new Error(`0x14FE22 Not implemented.`);
				}
			}
			switch (state)
			{
				case STATE_IDENTIFIER:
					const value = paramArgMap.get(buffer);
					result += value === void 0 ? buffer : value;
					break;
			}
			return result;
		}

		function __parseFunctionDefinition(fn) 
		{
			// Get function source code
			const fnSource = fn.toString();

			let params, body;

			// Match different function types
			const arrowFunctionMatch = fnSource.match(/^\s*(\(?[^)]*\)?)\s*=>\s*(\{?[^]*\}?)\s*$/);
			const regularFunctionMatch = fnSource.match(/^\s*function[^\(]*\(([^\)]*)\)[^\{]*\{([\s\S]*)\}\s*$/);

			if (arrowFunctionMatch) 
			{
				// Arrow function
				params = arrowFunctionMatch[1]
					.replace(/^\(|\)$/g, '')  // Remove surrounding parentheses
					.split(',')
					.map(param => param.trim())
					.filter(param => param);  // Remove empty parameters

				body = arrowFunctionMatch[2].trim();
				if (body.startsWith('{') && body.endsWith('}')) 
				{
					body = body.slice(1, -1).trim(); // Remove braces for block body
				}
				else
				{
					// Add return statement if no braces
					body = `return (${body});`;
				}
			}
			else if (regularFunctionMatch) 
			{
				// Regular function
				params = regularFunctionMatch[1]
					.split(',')
					.map(param => param.trim())
					.filter(param => param);  // Remove empty parameters

				body = regularFunctionMatch[2].trim();
			}
			else
			{
				throw new Error(`0x298CC7 Unable to parse as function.`);
			}

			return { params, body };
		}
	},
}

//	Remarks: The `Proxy` JavaScript feature is completely ignored in Primordial Blocks, including with type detection. Using proxies with Primordial Blocks is not thoroughly tested and might cause
//		Primordial Blocks implementations to throw exceptions, as in the following case: `Native.valuesEqual(new Proxy(new Number(), {}), 0)`.
Native.Type = 
{
	//	Field: Classifies the value `void 0` (undefined).
	//	See also: `Native.Type.isNU`.
	Undefined: Symbol("Undefined"),
	//	Field: Classifies the value of `null`.
	//	See also: `Native.Type.isNU`.
	Null: Symbol("Null"),
	//	Field: Classifies any value that is a boolean constant or a `Boolean` object.
	//	See also: `Native.Type.isBoolean`.
	Boolean: Symbol("Boolean"),
	//	Field: Classifies any value that is a numeric constant or a `Number` object.
	//	See also: `Native.Type.isNumber`.
	Number: Symbol("Number"),
	//	Field: Classifies any value that is a string constant or a `String` object.
	//	See also: `Native.Type.isString`.
	String: Symbol("String"),
	//	Field: Classifies any value that is an `Array`.
	//	See also: `Native.Type.isArray`.
	Array: Symbol("Array"),
	//	Field: Classifies any value that is an `Object` and is not classified as another `Native.Type`.
	//	See also: `Native.Type.isObject`.
	Object: Symbol("Object"),
	//	Field: Classifies the value of `NaN`.
	NaN: Symbol("NaN"),
	//	Field: Classifies any value that is a `Date` object.
	//	See also: `Native.Type.isDate`.
	Date: Symbol("Date"),
	//	Field: Classifies any value that is a `Symbol`.
	//	See also: `Native.Type.isSymbol`.
	Symbol: Symbol("Symbol"),
	//	Field: Classifies any value that is a regular expression literal or a `RegExp` object.
	RegExp: Symbol("RegExp"),
	//	Field: Classifies any value that is a `Function` object.
	//	See also: `Native.Type.isCallable`.
	Callable: Symbol("Callable"),
	//	Field: Classifies any value that is an iterator (the return value of `(function* () { })()`).
	Iterator: Symbol("Iterator"),
	//	Field: Classifies any value that is an `Error` object.
	Error: Symbol("Error"),
	//	Field: Classifies any value that is a BigInt literal or a `BigInt` object.
	//	See also: `Native.Type.isBigInt`.
	BigInt: Symbol("BigInt"),
	//	Field: Classifies any value that is a `Promise` object.
	Promise: Symbol("Promise"),
	//	Field: Classifies any value that is a `Map` object.
	Map: Symbol("Map"),
	//	Field: Classifies any value that is a `Set` object.
	Set: Symbol("Set"),
	//	Field: Classifies any value that is a `WeakMap` object.
	WeakMap: Symbol("WeakMap"),
	//	Field: Classifies any value that is a `WeakSet` object.
	WeakSet: Symbol("WeakSet"),
	//	Field: Classifies any value that is an `ArrayBuffer` object.
	ArrayBuffer: Symbol("ArrayBuffer"),
	//	Field: Classifies any value that is a `DataView` object.
	DataView: Symbol("DataView"),
	//	Field: Classifies any value that is an `Int8Array` object.
	Int8Array: Symbol("Int8Array"),
	//	Field: Classifies any value that is a `Uint8Array` object.
	Uint8Array: Symbol("Uint8Array"),
	//	Field: Classifies any value that is a `Uint8ClampedArray` object.
	Uint8ClampedArray: Symbol("Uint8ClampedArray"),
	//	Field: Classifies any value that is an `Int16Array` object.
	Int16Array: Symbol("Int16Array"),
	//	Field: Classifies any value that is a `Uint16Array` object.
	Uint16Array: Symbol("Uint16Array"),
	//	Field: Classifies any value that is an `Int32Array` object.
	Int32Array: Symbol("Int32Array"),
	//	Field: Classifies any value that is a `Uint32Array` object.
	Uint32Array: Symbol("Uint32Array"),
	//	Field: Classifies any value that is a `Float32Array` object.
	Float32Array: Symbol("Float32Array"),
	//	Field: Classifies any value that is a `Float64Array` object.
	Float64Array: Symbol("Float64Array"),
	//	Field: Classifies any value that is a `BigInt64Array` object.
	BigInt64Array: Symbol("BigInt64Array"),
	//	Field: Classifies any value that is a `BigUint64Array` object.
	BigUint64Array: Symbol("BigUint64Array"),

	isUndefined(value) { return value === void 0 },
	isNull(value) { return value === null },
	isNU(value) { return value === null || value === void 0 },
	isBoolean(value) { return value === true || value === false || (value && value.constructor === Boolean) },
	isNumber(value) { return value === 0 || (value && value.constructor === Number) },
	isInteger(value) { return value === 0 || (value && value.constructor === Number && Number.isInteger(value)) },
	isString(value) { return value === "" || (value && value.constructor === String) },
	isArray(value) { return Array.isArray(value) },
	isObject(value) { return Native.Type.getType(value) === Native.Type.Object },
	isNullObject(value) { return value && value.__proto__ === void 0 },
	isNaN(value) { return Number.isNaN(value) },
	isDate(value) { return typeof value instanceof Date },
	isSymbol(value) { return value && value.constructor === Symbol },
	isRegExp(value) { return value instanceof RegExp },
	isCallable(value) { return value instanceof Function },
	isIterator(value) { return value && value.constructor === Iterator.constructor },
	isError(value) { return value instanceof Error },
	isBigInt(value) { return global.BigInt !== void 0 && (value !== void 0 && value !== null && value === value && value.constructor === BigInt) },
	isPromise(value) { return value instanceof Promise },
	isMap(value) { return value instanceof Map },
	isSet(value) { return value instanceof Set },
	isWeakMap(value) { return value instanceof WeakMap },
	isWeakSet(value) { return value instanceof WeakSet },
	isArrayBuffer(value) { return value instanceof ArrayBuffer },
	isDataView(value) { return value instanceof DataView },
	isInt8Array(value) { return value instanceof Int8Array },
	isUint8Array(value) { return value instanceof Uint8Array },
	isUint8ClampedArray(value) { return value instanceof Uint8ClampedArray },
	isInt16Array(value) { return value instanceof Int16Array },
	isUint16Array(value) { return value instanceof Uint16Array },
	isInt32Array(value) { return value instanceof Int32Array },
	isUint32Array(value) { return value instanceof Uint32Array },
	isFloat32Array(value) { return value instanceof Float32Array },
	isFloat64Array(value) { return value instanceof Float64Array },
	isBigInt64Array(value) { return global.BigInt64Array !== void 0 && (value instanceof BigInt64Array) },
	isBigUint64Array(value) { return global.BigUint64Array !== void 0 && (value instanceof BigUint64Array) },
	//	Remarks: Due to unstable behavior with Babel, this function should be considered an experimental and has no corresponding `Native.Type` constant, hance classes are not detectable by `Native.Type.getType`.
	//	See also: https://stackoverflow.com/a/66120819/4151043
	isClass(value)
	{
		//	keep in sync with "-/natalis/000/Runtime.js"
		if (value === void 0 || value === null || value !== value || Array.isArray(value)) return false;
		if (value.constructor !== Function || value.prototype === void 0 || value.prototype === null) return false;
		if (Function.prototype !== Object.getPrototypeOf(value)) return true;
		return value.prototype.constructor.toString().substring(0, 5) === "class";
	},

	//	Function: Gets the `Native.Type` of the provided `value`.
	//	Parameter: `value` - any value. 
	//	Returns: the `Native.Type` of the provided `value`.
	//	Remarks: To examine exact method behavior, see `UnitTests` and also the is*-family of methods of `Native.Type`.
	//	Performance: In the context of the common use cases of this method, it needs to be considered a low-performing function.
	getType(value)
	{
		if (value === void 0) return Native.Type.Undefined;
		if (value === null) return Native.Type.Null;
		if (value !== value) return Native.Type.NaN;
		if (value === true || value === false || value.constructor === Boolean) return Native.Type.Boolean;
		if (value.constructor === Number) return Native.Type.Number;
		if (value.constructor === String) return Native.Type.String;
		if (Array.isArray(value)) return Native.Type.Array;
		if (value.constructor === Object || !value.constructor) return Native.Type.Object;
		if (value instanceof Function) return Native.Type.Callable;
		if (value.constructor === Iterator.constructor) return Native.Type.Iterator;
		if (value instanceof Date) return Native.Type.Date;
		if (value.constructor === Symbol) return Native.Type.Symbol;
		if (value instanceof RegExp) return Native.Type.RegExp;
		if (value instanceof Error) return Native.Type.Error;
		if (value instanceof Promise) return Native.Type.Promise;
		if (global.BigInt !== void 0 && value.constructor === BigInt) return Native.Type.BigInt;
		if (value instanceof Map) return Native.Type.Map;
		if (value instanceof Set) return Native.Type.Set;
		if (value instanceof WeakMap) return Native.Type.WeakMap;
		if (value instanceof WeakSet) return Native.Type.WeakSet;
		if (value instanceof ArrayBuffer) return Native.Type.ArrayBuffer;
		if (value instanceof DataView) return Native.Type.DataView;
		if (value instanceof Int8Array) return Native.Type.Int8Array;
		if (value instanceof Uint8Array) return Native.Type.Uint8Array;
		if (value instanceof Uint8ClampedArray) return Native.Type.Uint8ClampedArray;
		if (value instanceof Int16Array) return Native.Type.Int16Array;
		if (value instanceof Uint16Array) return Native.Type.Uint16Array;
		if (value instanceof Int32Array) return Native.Type.Int32Array;
		if (value instanceof Uint32Array) return Native.Type.Uint32Array;
		if (value instanceof Float32Array) return Native.Type.Float32Array;
		if (value instanceof Float64Array) return Native.Type.Float64Array;
		if (global.BigInt64Array !== void 0 && value instanceof BigInt64Array) return Native.Type.BigInt64Array;
		if (global.BigUint64Array !== void 0 && value instanceof BigUint64Array) return Native.Type.BigUint64Array;
		return Native.Type.Object;
	},
}

Native.CallableType =
{
	//	Field: Classifies the value as a synchronous function.
	//	See also: `Native.CallableType.isFunction`.
	Function: Symbol("Function"),
	//	Field: Classifies the value as an asynchronous function.
	//	See also: `Native.CallableType.isAsyncFunction`.
	AsyncFunction: Symbol("AsyncFunction"),
	//	Field: Classifies the value as a synchronous generator function.
	//	See also: `Native.CallableType.isGenerator`.
	Generator: Symbol("Generator"),
	//	Field: Classifies the value as an asynchronous generator function.
	//	See also: `Native.CallableType.isAsyncGenerator`.
	AsyncGenerator: Symbol("AsyncGenerator"),
	//	Field: Classifies the value that is not a function.
	//	See also: `Native.CallableType.isNonCallable`.
	NonCallable: Symbol("NonCallable"),


	//	Function: Test whether the provided `value` is a synchrounous non-generator function.
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is a synchrounous non-generator function, otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isFunction(value)
	{
		return (value instanceof Function) && !(value instanceof AsyncFunction) && !(value instanceof GeneratorFunction) && !(value instanceof AsyncGeneratorFunction);
	},

	//	Function: Test whether the provided `value` is an asynchrounous non-generator function.
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is an asynchrounous non-generator function, otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isAsyncFunction(value)
	{
		return value instanceof AsyncFunction;
	},

	//	Function: Test whether the provided `value` is a non-generator function (synchronous or asynchronous).
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is a non-generator function (synchronous or asynchronous), otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isUnyielded(value)
	{
		return (value instanceof Function) && !(value instanceof GeneratorFunction) && !(value instanceof AsyncGeneratorFunction);
	},


	//	Function: Test whether the provided `value` is a synchronous generator function.
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is a synchronous generator function, otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isGenerator(value)
	{
		return value instanceof GeneratorFunction;
	},

	//	Function: Test whether the provided `value` is an asynchronous generator function.
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is an asynchronous generator function, otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isAsyncGenerator(value)
	{
		return value instanceof AsyncGeneratorFunction;
	},

	//	Function: Test whether the provided `value` is a generator function (synchronous or asynchronous).
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is a generator function (synchronous or asynchronous), otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isYielded(value)
	{
		return (value instanceof GeneratorFunction) || (value instanceof AsyncGeneratorFunction);
	},


	//	Function: Test whether the provided `value` is anything else but a function.
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a function that is is anything else but a function, otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	isNonCallable(value)
	{
		return !(value instanceof Function);
	},

	getCallableType(value)
	{
		if (value instanceof AsyncGeneratorFunction) return Native.CallableType.AsyncGenerator;
		if (value instanceof GeneratorFunction) return Native.CallableType.Generator;
		if (value instanceof AsyncFunction) return Native.CallableType.AsyncFunction;
		if (value instanceof Function) return Native.CallableType.Function;
		return Native.CallableType.NonCallable;
	},


	//	Function: Test whether the provided `value` is an async function.
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is an async function, otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	hasAsyncAttribute(value)
	{
		return value instanceof AsyncFunction || value instanceof AsyncGeneratorFunction;
	},

	//	Function: Test whether the provided `value` is a generator function (synchronous or asynchronous).
	//	Parameter: `value` - any value.
	//	Returns: `true` if the `value` is a generator function (synchronous or asynchronous), otherwise returns `false`.
	//	Remarks: To examine exact method behavior, see `UnitTests`.
	hasGeneratorAttribute(value)
	{
		return value instanceof GeneratorFunction || value instanceof AsyncGeneratorFunction;
	},
}

Native.LiteralType =
{
	//	Field: Classifies the value `void 0` (undefined).
	//	See also: `Native.LiteralType.isNU`.
	Undefined: Symbol("Undefined"),
	//	Field: Classifies the value of `null`.
	//	See also: `Native.LiteralType.isNU`.
	Null: Symbol("Null"),
	//	Field: Classifies a boolean value.
	//	Remarks: Does not classify `Boolean` instances (`new Boolean(true)`). Classifies the return value of a `Boolean()` call.
	//	See also: `Native.LiteralType.isBoolean`.
	Boolean: Symbol("Boolean"),
	//	Field: Classifies a numeric value.
	//	Remarks: Does not classify `Number` instances (`new Number(1)`), `NaN`, `-Infinity` or `Infinity`. Classifies the return value of a `Number()` call.
	//	See also: `Native.LiteralType.isNumber`.
	Number: Symbol("Number"),
	//	Field: Classifies a safe integer numeric value.
	//	Remarks: Does not classify `Number` instances (`new Number(1)`), `NaN`, `-Infinity` or `Infinity`. Classifies the return value of a `Number()` call if it's a safe integer.
	//	See also: `Native.LiteralType.isInteger`.
	Integer: Symbol("Integer"),
	//	Field: Classifies a string value.
	//	Remarks: Does not classify `String` instances (`new String()`). Classifies the return value of a `String()` call.
	//	See also: `Native.LiteralType.isString`.
	String: Symbol("String"),
	//	Field: Classifies any value that is an array created strictly by either parsing JSON, using the object literal syntax `[]`
	//		or via `new Array()`, `Array()`, `new Object([...])`, `Object([...])`.
	//	Remarks: Does not classify instances of classes extending `Array`. Classifies the return value of an `Array()` call. Classifies `arguments`.
	//	See also: `Native.LiteralType.isArray`.
	Array: Symbol("Array"),
	//	Field: Classifies any value that is an object created strictly by either parsing JSON, using the object literal syntax `{}`
	//		or via `new Object(), new Object({...}), Object(), Object({...}), Object.create({...})`.
	//	Remarks: Does not classify instances of classes extending `Object` or `null`-objects (created via `Object.create(null)`). Classifies the return value of an `Object()` call. Classifies `arguments`.
	//	See also: `Native.LiteralType.isObject`.
	Object: Symbol("Object"),
	//	Field: Classifies any value that is not classified by `Native.LiteralType`.
	//	See also: `Native.CallableType.isNaL`.
	NonLiteral: Symbol("NonLiteral"),

	isUndefined(value) { return value === void 0 },
	isNull(value) { return value === null },
	isNU(value) { return value === null || value === void 0 },
	isBoolean(value) { return value === true || value === false },
	isNumber(value) { return Number.isFinite(value) },
	isInteger(value) { return Number.isSafeInteger(value) },
	isString(value) { try { return String(value) === value } catch (ex) { return false } },
	isArray(value) { return value && value.constructor === Array },
	isObject(value) { return value && value.constructor === Object },
	isNaL(value) { return Native.LiteralType.getType(value) === Native.LiteralType.NonLiteral },

	getType(value)
	{
		if (value === void 0) return Native.LiteralType.Undefined;
		if (value === null) return Native.LiteralType.Null;
		if (value === true || value === false) return Native.LiteralType.Boolean;
		if (Number.isFinite(value)) return Native.LiteralType.Number;
		if (Number.isSafeInteger(value)) return Native.LiteralType.Integer;
		if (value !== value) return Native.LiteralType.NonLiteral;
		if (value.constructor === Array) return Native.LiteralType.Array;
		if (value.constructor === Object) return Native.LiteralType.Object;
		if (value.constructor === Symbol) return Native.LiteralType.NonLiteral;
		try { if (String(value) === value) return Native.LiteralType.String } catch (ex) { }
		return Native.LiteralType.NonLiteral;
	},
}

module.exports.Native = module.exports;