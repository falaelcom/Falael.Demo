//	R0Q2?/daniel/20220528
//	- TODO: finish `test_Object_hasOwnProperty_regular`
"use strict";

const { Native, Unset } = require("-/pb/natalis/000/Native.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");
const { MulticastDelegate } = require("-/pb/natalis/012/MulticastDelegate.js");
const { ChaincastDelegate } = require("-/pb/natalis/012/ChaincastDelegate.js");
const { ChaincastAsyncDelegate } = require("-/pb/natalis/012/ChaincastAsyncDelegate.js");

const GeneratorFunction = Object.getPrototypeOf(function* () { }).constructor;
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () { }).constructor;
const createIterator = function* () { };

function _getTestValueDict(...args)
{
	class B	{ }
	class C { }
	class D extends B { }
	const obj = {};
	const cobj = new (class C { });
	const arr = [];
	const symbol = Symbol();
	const result =
	{
		//	non-values
		'Unset': Unset,
		'null': null,
		'void 0': void 0,
		'undefined': undefined,
		'NaN': NaN,

		//	booleans
		'true': true,
		'false': false,
		'Boolean()': Boolean(),
		'new Boolean()': new Boolean(),
		'Object(true)': Object(true),
		'new Object(true)': new Object(true),

		//	symbols
		'Symbol()': symbol,
		'Object(Symbol())': Object(symbol),
		'new Object(Symbol())': new Object(symbol),

		//	strings
		'""': "",
		'"a"': "a",
		'String()': String(),
		'new String()': new String(),
		'Object("")': Object(""),
		'new Object("")': new Object(""),

		//	regexps
		'/a/gi': /a/gi,
		'RegExp()': RegExp(),
		'new RegExp()': new RegExp(),

		//	numbers
		'0': 0,
		'1': 1,
		'0.1': 0.1,
		'1/2': 1 / 2,
		'-0': -0,
		'-1': -1,
		'-0.1': -0.1,
		'-1/2': -1 / 2,
		'Math.PI': Math.PI,
		'Math.E': Math.E,
		'Number()': Number(),
		'new Number()': new Number(),
		'Object(0)': Object(0),
		'new Object(0)': new Object(0),
		'Object(-0.1)': Object(-0.1),
		'new Object(-0.1)': new Object(-0.1),
		'Infinity': Infinity,
		'-Infinity': -Infinity,

		//	objects
		'{}': {},
		'JSON.parse("{}")': JSON.parse("{}"),
		'obj': obj,
		'Object()': Object(),
		'Object({})': Object({}),
		'Object(obj)': Object(obj),
		'Object(cobj)': Object(cobj),
		'new Object()': new Object(),
		'new Object({})': new Object({}),
		'new Object(obj)': new Object(obj),
		'new Object(cobj)': new Object(cobj),
		'new (class C { })': new (class C { }),
		'new Object(new (class C { }))': new Object(new (class C { })),
		'Object.create(new (class C { }))': Object.create(new (class C { })),
		'Object.create(null)': Object.create(null),
		'Object.create(obj)': Object.create(obj),
		'Object.create(cobj)': Object.create(cobj),

		//	collections
		'arr': arr,
		'[]': [],
		'Array()': Array(),
		'Array(5)': Array(5),
		'Array(5, 7)': Array(5, 7),
		'new Array()': new Array(),
		'new Array(5)': new Array(5),
		'new Array(5, 7)': new Array(5, 7),
		'Object([])': Object([]),
		'Object(arr)': Object(arr),
		'new Object([])': new Object([]),
		'new Object(arr)': new Object(arr),
		'arguments': arguments,
		'Object(arguments)': Object(arguments),
		'new Object(arguments)': new Object(arguments),
		'args': args,
		'Object(args)': Object(args),
		'new Object(args)': new Object(args),
		'new ArrayBuffer()': new ArrayBuffer(),
		'new DataView(new ArrayBuffer())': new DataView(new ArrayBuffer()),
		'new Int8Array()': new Int8Array(),
		'new Uint8Array()': new Uint8Array(), 
		'new Uint8ClampedArray()': new Uint8ClampedArray(), 
		'new Int16Array()': new Int16Array(), 
		'new Uint16Array()': new Uint16Array(), 
		'new Int32Array()': new Int32Array(), 
		'new Uint32Array()': new Uint32Array(), 
		'new Float32Array()': new Float32Array(), 
		'new Float64Array()': new Float64Array(), 

		//	dictionaries
		'new Map()': new Map(),
		'new Set()': new Set(),
		'new WeakMap()': new WeakMap(),
		'new WeakSet()': new WeakSet(),

		//	classes
		'C': C,
		'class { }': class { },
		'class C { }': class C { },
		'class extends class { } { }': class extends class { } { },
		'class extends B { }': class extends B { },
		'D': D,
		'class C extends B { }': class C extends B { },

		//	delegates
		'new MulticastDelegate()': new MulticastDelegate(),
		'new ChaincastDelegate()': new ChaincastDelegate(),
		'new ChaincastAsyncDelegate()': new ChaincastAsyncDelegate(),

		//	functions
		'() => { }': () => { },
		'function () { }': function () { },
		'function* () { }': function* () { },
		'async function () { }': async function () { },
		'async function* () { }': async function* () { },
		'Function()': Function(),
		'new Function()': new Function(),
		'new GeneratorFunction()': new GeneratorFunction(),
		'new AsyncFunction()': new AsyncFunction(),
		'new AsyncGeneratorFunction()': new AsyncGeneratorFunction(),
		'Object(new Function())': Object(new Function()),
		'new Object(new Function())': new Object(new Function()),

		//	other JavaScript types
		'createIterator()': createIterator(),
		'new Promise(() => true)': new Promise(() => true),
		'Error()': Error(),
		'new Error()': new Error(),
		'Date()': Date(),
		'new Date()': new Date(),
		'Object(new Date())': Object(new Date()),
		'new Object(new Date())': new Object(new Date()),
		'JSON': JSON,
		'Math': Math,
		'Reflect': Reflect,
	};

	if (global.Atomics) result['Atomics'] = Atomics;
	if (global.Intl) result['Intl'] = Intl;
	if (global.WebAssembly) result['WebAssembly'] = WebAssembly;
	if (global.BigInt) result['BigInt(0)'] = BigInt(0);
	if (global.BigInt) result['BigInt(1)'] = BigInt(1);
	if (global.BigInt64Array) result['new BigInt64Array()'] = new BigInt64Array();
	if (global.BigUint64Array) result['new BigUint64Array()'] = new BigUint64Array();

	return result;
}

function _testSingleArgument(functionName, test, fail, { returnsTrue = null, returnsFalse = null } = {})
{
	const valueDict = _getTestValueDict();
	if (returnsTrue && returnsTrue.some(name => name && !Object.prototype.hasOwnProperty.call(valueDict, name))) throw new ArgumentException(0x9E8EB6, "returnsTrue", returnsTrue.filter(name => !Object.prototype.hasOwnProperty.call(valueDict, name)));
	if (returnsFalse && returnsFalse.some(name => name && !Object.prototype.hasOwnProperty.call(valueDict, name))) throw new ArgumentException(0x353184, "returnsFalse", returnsFalse.filter(name => !Object.prototype.hasOwnProperty.call(valueDict, name)));
	if ((!!returnsTrue && !!returnsFalse)) throw new Exception(0x5D7523);
	for (const name in valueDict)
	{
		const key = name;
		const outcome = test(valueDict[name], name);
		if (returnsTrue)
		{
			if (outcome && returnsTrue.indexOf(key) === -1) fail(`${functionName}(${name})`, key);
			continue;
		}
		if (returnsFalse)
		{
			if (!outcome && returnsFalse.indexOf(key) === -1) fail(`!${functionName}(${name})`, key);
			continue;
		}
		outcome ? fail(`${functionName}(${name})`, key) : fail(`!${functionName}(${name})`, key);
	}
}

function _testTwoArguments(functionName, test, fail, { returnsTrue = null, returnsFalse = null } = {})
{
	const valueDict = _getTestValueDict();
	if ((!!returnsTrue && !!returnsFalse)) throw new Exception(0xFABEEB);

	const keys = {};
	const valueList = Object.entries(valueDict);
	for (let llength = valueList.length, l = 0; l < llength; ++l)
	{
		const [leftName, leftValue] = valueList[l];
		for (let rlength = valueList.length, r = l; r < rlength; ++r)
		{
			const [rightName, rightValue] = valueList[r];
			const key = `${leftName} | ${rightName}`;
			keys[key] = true;
			const outcome = test(leftValue, rightValue);
			if (returnsTrue)
			{
				if (outcome && returnsTrue.indexOf(key) === -1) fail(`${functionName}(${leftName}, ${rightName})`, key);
				continue;
			}
			if (returnsFalse)
			{
				if (!outcome && returnsFalse.indexOf(key) === -1) fail(`!${functionName}(${leftName}, ${rightName})`, key);
				continue;
			}
			outcome ? fail(`${functionName}(${leftName}, ${rightName})`, key) : fail(`!${functionName}(${leftName}, ${rightName})`, key);
		}
	}

	if (returnsTrue && returnsTrue.some(name => name && !Object.prototype.hasOwnProperty.call(keys, name))) throw new ArgumentException(0xFAF2C3, "returnsTrue", returnsTrue.filter(name => !Object.prototype.hasOwnProperty.call(keys, name)));
	if (returnsFalse && returnsFalse.some(name => name && !Object.prototype.hasOwnProperty.call(keys, name))) throw new ArgumentException(0x12E527, "returnsFalse", returnsFalse.filter(name => !Object.prototype.hasOwnProperty.call(keys, name)));
}

module.exports =

class UnitTests_Native
{
	//	Category: Unit test
	//	Function: Run unit tests for `Native` static class methods.
	//	Remarks: `BigInt` literals are excluded from the tests.
	static unitTest_Native(result)
	{
		const fail = (testName, key) => result.push({ key, testName });
		//const fail = (testName, key) => console.log(`'${key}',`);	//	keep for when adding test values

		_testSingleArgument("Native.isUnset", v => Native.isUnset(v), fail, { returnsTrue: ["Unset"] });
		_testTwoArguments("Native.valuesEqual", (l, r) => Native.valuesEqual(l, r), fail, { returnsTrue:
		[
			'0 | 0',
			'0 | -0',
			'0 | Number()',
			'0 | new Number()',
			'0 | Object(0)',
			'0 | new Object(0)',
			'1 | 1',
			'Unset | Unset',
			'null | null',
			'void 0 | void 0',
			'void 0 | undefined',
			'undefined | undefined',
			'NaN | NaN',
			'true | true',
			'true | Object(true)',
			'true | new Object(true)',
			'false | false',
			'false | Boolean()',
			'false | new Boolean()',
			'Boolean() | Boolean()',
			'Boolean() | new Boolean()',
			'new Boolean() | new Boolean()',
			'Object(true) | Object(true)',
			'Object(true) | new Object(true)',
			'new Object(true) | new Object(true)',
			'Symbol() | Symbol()',
			'Symbol() | Object(Symbol())',
			'Symbol() | new Object(Symbol())',
			'Object(Symbol()) | Object(Symbol())',
			'Object(Symbol()) | new Object(Symbol())',
			'new Object(Symbol()) | new Object(Symbol())',
			'"" | ""',
			'"" | String()',
			'"" | new String()',
			'"" | Object("")',
			'"" | new Object("")',
			'"a" | "a"',
			'String() | String()',
			'String() | new String()',
			'String() | Object("")',
			'String() | new Object("")',
			'new String() | new String()',
			'new String() | Object("")',
			'new String() | new Object("")',
			'Object("") | Object("")',
			'Object("") | new Object("")',
			'new Object("") | new Object("")',
			'/a/gi | /a/gi',
			'RegExp() | RegExp()',
			'RegExp() | new RegExp()',
			'new RegExp() | new RegExp()',
			'0.1 | 0.1',
			'1/2 | 1/2',
			'-0 | -0',
			'-0 | Number()',
			'-0 | new Number()',
			'-0 | Object(0)',
			'-0 | new Object(0)',
			'-1 | -1',
			'-0.1 | -0.1',
			'-0.1 | Object(-0.1)',
			'-0.1 | new Object(-0.1)',
			'-1/2 | -1/2',
			'Math.PI | Math.PI',
			'Math.E | Math.E',
			'Number() | Number()',
			'Number() | new Number()',
			'Number() | Object(0)',
			'Number() | new Object(0)',
			'new Number() | new Number()',
			'new Number() | Object(0)',
			'new Number() | new Object(0)',
			'Object(0) | Object(0)',
			'Object(0) | new Object(0)',
			'new Object(0) | new Object(0)',
			'Object(-0.1) | Object(-0.1)',
			'Object(-0.1) | new Object(-0.1)',
			'new Object(-0.1) | new Object(-0.1)',
			'Infinity | Infinity',
			'-Infinity | -Infinity',
			'{} | {}',
			'JSON.parse("{}") | JSON.parse("{}")',
			'obj | obj',
			'obj | Object(obj)',
			'obj | new Object(obj)',
			'Object() | Object()',
			'Object({}) | Object({})',
			'Object(obj) | Object(obj)',
			'Object(obj) | new Object(obj)',
			'Object(cobj) | Object(cobj)',
			'Object(cobj) | new Object(cobj)',
			'new Object() | new Object()',
			'new Object({}) | new Object({})',
			'new Object(obj) | new Object(obj)',
			'new Object(cobj) | new Object(cobj)',
			'new (class C { }) | new (class C { })',
			'new Object(new (class C { })) | new Object(new (class C { }))',
			'Object.create(new (class C { })) | Object.create(new (class C { }))',
			'Object.create(null) | Object.create(null)',
			'Object.create(obj) | Object.create(obj)',
			'Object.create(cobj) | Object.create(cobj)',
			'arr | arr',
			'arr | Object(arr)',
			'arr | new Object(arr)',
			'[] | []',
			'Array() | Array()',
			'Array(5) | Array(5)',
			'Array(5, 7) | Array(5, 7)',
			'new Array() | new Array()',
			'new Array(5) | new Array(5)',
			'new Array(5, 7) | new Array(5, 7)',
			'Object([]) | Object([])',
			'Object(arr) | Object(arr)',
			'Object(arr) | new Object(arr)',
			'new Object([]) | new Object([])',
			'new Object(arr) | new Object(arr)',
			'arguments | arguments',
			'arguments | Object(arguments)',
			'arguments | new Object(arguments)',
			'Object(arguments) | Object(arguments)',
			'Object(arguments) | new Object(arguments)',
			'new Object(arguments) | new Object(arguments)',
			'args | args',
			'args | Object(args)',
			'args | new Object(args)',
			'Object(args) | Object(args)',
			'Object(args) | new Object(args)',
			'new Object(args) | new Object(args)',
			'new ArrayBuffer() | new ArrayBuffer()',
			'new DataView(new ArrayBuffer()) | new DataView(new ArrayBuffer())',
			'new Int8Array() | new Int8Array()',
			'new Uint8Array() | new Uint8Array()',
			'new Uint8ClampedArray() | new Uint8ClampedArray()',
			'new Int16Array() | new Int16Array()',
			'new Uint16Array() | new Uint16Array()',
			'new Int32Array() | new Int32Array()',
			'new Uint32Array() | new Uint32Array()',
			'new Float32Array() | new Float32Array()',
			'new Float64Array() | new Float64Array()',
			'new Map() | new Map()',
			'new Set() | new Set()',
			'new WeakMap() | new WeakMap()',
			'new WeakSet() | new WeakSet()',
			'C | C',
			'class { } | class { }',
			'class C { } | class C { }',
			'class extends class { } { } | class extends class { } { }',
			'class extends B { } | class extends B { }',
			'D | D',
			'class C extends B { } | class C extends B { }',
			'new MulticastDelegate() | new MulticastDelegate()',
			'new ChaincastDelegate() | new ChaincastDelegate()',
			'new ChaincastAsyncDelegate() | new ChaincastAsyncDelegate()',
			'() => { } | () => { }',
			'function () { } | function () { }',
			'function* () { } | function* () { }',
			'async function () { } | async function () { }',
			'async function* () { } | async function* () { }',
			'Function() | Function()',
			'new Function() | new Function()',
			'new GeneratorFunction() | new GeneratorFunction()',
			'new AsyncFunction() | new AsyncFunction()',
			'new AsyncGeneratorFunction() | new AsyncGeneratorFunction()',
			'Object(new Function()) | Object(new Function())',
			'new Object(new Function()) | new Object(new Function())',
			'createIterator() | createIterator()',
			'new Promise(() => true) | new Promise(() => true)',
			'Error() | Error()',
			'new Error() | new Error()',
			'Date() | Date()',
			'new Date() | new Date()',
			'new Date() | Object(new Date())',
			'new Date() | new Object(new Date())',
			'Object(new Date()) | Object(new Date())',
			'Object(new Date()) | new Object(new Date())',
			'new Object(new Date()) | new Object(new Date())',
			'JSON | JSON',
			'Math | Math',
			'Reflect | Reflect',
			global.Atomics && 'Atomics | Atomics',
			global.Intl && 'Intl | Intl',
			global.WebAssembly && 'WebAssembly | WebAssembly',
			global.BigInt && 'BigInt(0) | BigInt(0)',
			global.BigInt && 'BigInt(1) | BigInt(1)',
			global.BigInt64Array && 'new BigInt64Array() | new BigInt64Array()',
			global.BigUint64Array && 'new BigUint64Array() | new BigUint64Array()',
		]});
	}

	//	Category: Unit test
	//	Function: Run unit tests for `Native.Type` static class methods.
	//	Remarks: `BigInt` literals are excluded from the tests.
	static unitTest_Native_Type(result)
	{
		const fail = (testName, key) => result.push({ key, testName });
		//const fail = (testName, key) => console.log(`'${key}',`);	//	keep for when adding test values

		_testSingleArgument("Native.Type.isUndefined", v => Native.Type.isUndefined(v), fail, { returnsTrue: ["void 0", "undefined"] });
		_testSingleArgument("Native.Type.isNull", v => Native.Type.isNull(v), fail, { returnsTrue: ["null"] });
		_testSingleArgument("Native.Type.isNU", v => Native.Type.isNU(v), fail, { returnsTrue: ["void 0", "undefined", "null"] });
		_testSingleArgument("Native.Type.isBoolean", v => Native.Type.isBoolean(v), fail, { returnsTrue: ["true", "false", "Boolean()", "new Boolean()", "Object(true)", "new Object(true)"] });
		_testSingleArgument("Native.Type.isNumber", v => Native.Type.isNumber(v), fail, { returnsTrue: 
		[
			'0',
			'1',
			'0.1',
			'1/2',
			'-0',
			'-1',
			'-0.1',
			'-1/2',
			'Math.PI',
			'Math.E',
			'Number()',
			'new Number()',
			'Object(0)',
			'new Object(0)',
			'Object(-0.1)',
			'new Object(-0.1)',
			'Infinity',
			'-Infinity',
		]});
		_testSingleArgument("Native.Type.isInteger", v => Native.Type.isInteger(v), fail, { returnsTrue: 
		[
			'0',
			'1',
			'-0',
			'-1',
			'Number()',
			'new Number()',
			'Object(0)',
			'new Object(0)',
			'Infinity',
			'-Infinity',
		]});
		_testSingleArgument("Native.Type.isString", v => Native.Type.isString(v), fail, { returnsTrue: 
		[
			'""',
			'"a"',
			'String()',
			'new String()',
			'Object("")',
			'new Object("")',
			'Date()',
		]});
		_testSingleArgument("Native.Type.isArray", v => Native.Type.isArray(v), fail, { returnsTrue: 
		[
			'arr',
			'[]',
			'Array()',
			'Array(5)',
			'Array(5, 7)',
			'new Array()',
			'new Array(5)',
			'new Array(5, 7)',
			'Object([])',
			'Object(arr)',
			'new Object([])',
			'new Object(arr)',
			'args',
			'Object(args)',
			'new Object(args)',
		]});
		_testSingleArgument("Native.Type.isObject", v => Native.Type.isObject(v), fail, { returnsTrue: 
		[
			'{}',
			'JSON.parse("{}")',
			'obj',
			'Object()',
			'Object({})',
			'Object(obj)',
			'Object(cobj)',
			'new Object()',
			'new Object({})',
			'new Object(obj)',
			'new Object(cobj)',
			'new (class C { })',
			'new Object(new (class C { }))',
			'Object.create(new (class C { }))',
			'Object.create(null)',
			'Object.create(obj)',
			'Object.create(cobj)',
			'arguments',
			'Object(arguments)',
			'new Object(arguments)',
			'JSON',
			'Math',
			'Reflect',
			global.Atomics && 'Atomics',
			global.Intl && 'Intl',
			global.WebAssembly && 'WebAssembly',
		]});
		_testSingleArgument("Native.Type.isNullObject", v => Native.Type.isNullObject(v), fail, { returnsTrue: [ "Object.create(null)" ]});
		_testSingleArgument("Native.Type.isNaN", v => Native.Type.isNaN(v), fail, { returnsTrue:  ["NaN"] });
		_testSingleArgument("Native.Type.isDate", v => Native.Type.isDate(v), fail, { returnsTrue: ['new Date()','Object(new Date())', 'new Object(new Date())'] });
		_testSingleArgument("Native.Type.isSymbol", v => Native.Type.isSymbol(v), fail, { returnsTrue: ['Symbol()', 'Object(Symbol())', 'new Object(Symbol())', 'Unset'] });
		_testSingleArgument("Native.Type.isRegExp", v => Native.Type.isRegExp(v), fail, { returnsTrue: ['/a/gi', 'RegExp()', 'new RegExp()'] });
		_testSingleArgument("Native.Type.isCallable", v => Native.Type.isCallable(v), fail, { returnsTrue: 
		[
			'C',
			'class { }',
			'class C { }',
			'class extends class { } { }',
			'class extends B { }',
			'D',
			'class C extends B { }',
			'new MulticastDelegate()',
			'new ChaincastDelegate()',
			'new ChaincastAsyncDelegate()',
			'() => { }',
			'function () { }',
			'function* () { }',
			'async function () { }',
			'async function* () { }',
			'Function()',
			'new Function()',
			'new GeneratorFunction()',
			'new AsyncFunction()',
			'new AsyncGeneratorFunction()',
			'Object(new Function())',
			'new Object(new Function())',
		]});
		_testSingleArgument("Native.Type.isIterator", v => Native.Type.isIterator(v), fail, { returnsTrue: ["createIterator()"] });
		_testSingleArgument("Native.Type.isError", v => Native.Type.isError(v), fail, { returnsTrue: ["Error()", "new Error()"] });
		global.BigInt && _testSingleArgument("Native.Type.isBigInt", v => Native.Type.isBigInt(v), fail, { returnsTrue: ["BigInt(0)", "BigInt(1)"] });
		_testSingleArgument("Native.Type.isPromise", v => Native.Type.isPromise(v), fail, { returnsTrue: ['new Promise(() => true)'] });
		_testSingleArgument("Native.Type.isMap", v => Native.Type.isMap(v), fail, { returnsTrue: ['new Map()'] });
		_testSingleArgument("Native.Type.isSet", v => Native.Type.isSet(v), fail, { returnsTrue: ['new Set()'] });
		_testSingleArgument("Native.Type.isWeakMap", v => Native.Type.isWeakMap(v), fail, { returnsTrue: ['new WeakMap()'] });
		_testSingleArgument("Native.Type.isWeakSet", v => Native.Type.isWeakSet(v), fail, { returnsTrue: ['new WeakSet()'] });
		_testSingleArgument("Native.Type.isArrayBuffer", v => Native.Type.isArrayBuffer(v), fail, { returnsTrue: ['new ArrayBuffer()'] });
		_testSingleArgument("Native.Type.isDataView", v => Native.Type.isDataView(v), fail, { returnsTrue: ['new DataView(new ArrayBuffer())'] });
		_testSingleArgument("Native.Type.isInt8Array", v => Native.Type.isInt8Array(v), fail, { returnsTrue: ['new Int8Array()'] });
		_testSingleArgument("Native.Type.isUint8Array", v => Native.Type.isUint8Array(v), fail, { returnsTrue: ['new Uint8Array()'] });
		_testSingleArgument("Native.Type.isUint8ClampedArray", v => Native.Type.isUint8ClampedArray(v), fail, { returnsTrue: ['new Uint8ClampedArray()'] });
		_testSingleArgument("Native.Type.isInt16Array", v => Native.Type.isInt16Array(v), fail, { returnsTrue: ['new Int16Array()'] });
		_testSingleArgument("Native.Type.isUint16Array", v => Native.Type.isUint16Array(v), fail, { returnsTrue: ['new Uint16Array()'] });
		_testSingleArgument("Native.Type.isInt32Array", v => Native.Type.isInt32Array(v), fail, { returnsTrue: ['new Int32Array()'] });
		_testSingleArgument("Native.Type.isUint32Array", v => Native.Type.isUint32Array(v), fail, { returnsTrue: ['new Uint32Array()'] });
		_testSingleArgument("Native.Type.isFloat32Array", v => Native.Type.isFloat32Array(v), fail, { returnsTrue: ['new Float32Array()'] });
		_testSingleArgument("Native.Type.isFloat64Array", v => Native.Type.isFloat64Array(v), fail, { returnsTrue: ['new Float64Array()'] });
		global.BigInt64Array && _testSingleArgument("Native.Type.isBigInt64Array", v => Native.Type.isBigInt64Array(v), fail, { returnsTrue: ['new BigInt64Array()'] });
		global.BigUint64Array && _testSingleArgument("Native.Type.isBigUint64Array", v => Native.Type.isBigUint64Array(v), fail, { returnsTrue: ['new BigUint64Array()'] });
		_testSingleArgument("Native.Type.isClass", v => Native.Type.isClass(v), fail, { returnsTrue: 
		[
			'C',
			'class { }',
			'class C { }',
			'class extends class { } { }',
			'class extends B { }',
			'D',
			'class C extends B { }',
			]
		});

		const typeMap =
		{
			'0': Native.Type.Number,
			'1': Native.Type.Number,
			'Unset': Native.Type.Symbol,
			'null': Native.Type.Null,
			'void 0': Native.Type.Undefined,
			'undefined': Native.Type.Undefined,
			'NaN': Native.Type.NaN,
			'true': Native.Type.Boolean,
			'false': Native.Type.Boolean,
			'Boolean()': Native.Type.Boolean,
			'new Boolean()': Native.Type.Boolean,
			'Object(true)': Native.Type.Boolean,
			'new Object(true)': Native.Type.Boolean,
			'Symbol()': Native.Type.Symbol,
			'Object(Symbol())': Native.Type.Symbol,
			'new Object(Symbol())': Native.Type.Symbol,
			'""': Native.Type.String,
			'"a"': Native.Type.String,
			'String()': Native.Type.String,
			'new String()': Native.Type.String,
			'Object("")': Native.Type.String,
			'new Object("")': Native.Type.String,
			'/a/gi': Native.Type.RegExp,
			'RegExp()': Native.Type.RegExp,
			'new RegExp()': Native.Type.RegExp,
			'0.1': Native.Type.Number,
			'1/2': Native.Type.Number,
			'-0': Native.Type.Number,
			'-1': Native.Type.Number,
			'-0.1': Native.Type.Number,
			'-1/2': Native.Type.Number,
			'Math.PI': Native.Type.Number,
			'Math.E': Native.Type.Number,
			'Number()': Native.Type.Number,
			'new Number()': Native.Type.Number,
			'Object(0)': Native.Type.Number,
			'new Object(0)': Native.Type.Number,
			'Object(-0.1)': Native.Type.Number,
			'new Object(-0.1)': Native.Type.Number,
			'Infinity': Native.Type.Number,
			'-Infinity': Native.Type.Number,
			'{}': Native.Type.Object,
			'JSON.parse("{}")': Native.Type.Object,
			'obj': Native.Type.Object,
			'Object()': Native.Type.Object,
			'Object({})': Native.Type.Object,
			'Object(obj)': Native.Type.Object,
			'Object(cobj)': Native.Type.Object,
			'new Object()': Native.Type.Object,
			'new Object({})': Native.Type.Object,
			'new Object(obj)': Native.Type.Object,
			'new Object(cobj)': Native.Type.Object,
			'new (class C { })': Native.Type.Object,
			'new Object(new (class C { }))': Native.Type.Object,
			'Object.create(new (class C { }))': Native.Type.Object,
			'Object.create(null)': Native.Type.Object,
			'Object.create(obj)': Native.Type.Object,
			'Object.create(cobj)': Native.Type.Object,
			'arr': Native.Type.Array,
			'[]': Native.Type.Array,
			'Array()': Native.Type.Array,
			'Array(5)': Native.Type.Array,
			'Array(5, 7)': Native.Type.Array,
			'new Array()': Native.Type.Array,
			'new Array(5)': Native.Type.Array,
			'new Array(5, 7)': Native.Type.Array,
			'Object([])': Native.Type.Array,
			'Object(arr)': Native.Type.Array,
			'new Object([])': Native.Type.Array,
			'new Object(arr)': Native.Type.Array,
			'arguments': Native.Type.Object,
			'Object(arguments)': Native.Type.Object,
			'new Object(arguments)': Native.Type.Object,
			'args': Native.Type.Array,
			'Object(args)': Native.Type.Array,
			'new Object(args)': Native.Type.Array,
			'new ArrayBuffer()': Native.Type.ArrayBuffer,
			'new DataView(new ArrayBuffer())': Native.Type.DataView,
			'new Int8Array()': Native.Type.Int8Array,
			'new Uint8Array()': Native.Type.Uint8Array,
			'new Uint8ClampedArray()': Native.Type.Uint8ClampedArray,
			'new Int16Array()': Native.Type.Int16Array,
			'new Uint16Array()': Native.Type.Uint16Array,
			'new Int32Array()': Native.Type.Int32Array,
			'new Uint32Array()': Native.Type.Uint32Array,
			'new Float32Array()': Native.Type.Float32Array,
			'new Float64Array()': Native.Type.Float64Array,
			'new Map()': Native.Type.Map,
			'new Set()': Native.Type.Set,
			'new WeakMap()': Native.Type.WeakMap,
			'new WeakSet()': Native.Type.WeakSet,
			'C': Native.Type.Callable,
			'class { }': Native.Type.Callable,
			'class C { }': Native.Type.Callable,
			'class extends class { } { }': Native.Type.Callable,
			'class extends B { }': Native.Type.Callable,
			'D': Native.Type.Callable,
			'class C extends B { }': Native.Type.Callable,
			'new MulticastDelegate()': Native.Type.Callable,
			'new ChaincastDelegate()': Native.Type.Callable,
			'new ChaincastAsyncDelegate()': Native.Type.Callable,
			'() => { }': Native.Type.Callable,
			'function () { }': Native.Type.Callable,
			'function* () { }': Native.Type.Callable,
			'async function () { }': Native.Type.Callable,
			'async function* () { }': Native.Type.Callable,
			'Function()': Native.Type.Callable,
			'new Function()': Native.Type.Callable,
			'new GeneratorFunction()': Native.Type.Callable,
			'new AsyncFunction()': Native.Type.Callable,
			'new AsyncGeneratorFunction()': Native.Type.Callable,
			'Object(new Function())': Native.Type.Callable,
			'new Object(new Function())': Native.Type.Callable,
			'createIterator()': Native.Type.Iterator,
			'new Promise(() => true)': Native.Type.Promise,
			'Error()': Native.Type.Error,
			'new Error()': Native.Type.Error,
			'Date()': Native.Type.String,
			'new Date()': Native.Type.Date,
			'Object(new Date())': Native.Type.Date,
			'new Object(new Date())': Native.Type.Date,
			'JSON': Native.Type.Object,
			'Math': Native.Type.Object,
			'Reflect': Native.Type.Object,
		};

		if (global.Atomics) typeMap['Atomics'] = Native.Type.Object;
		if (global.Intl) typeMap['Intl'] = Native.Type.Object;
		if (global.WebAssembly) typeMap['WebAssembly'] = Native.Type.Object;
		if (global.BigInt) typeMap['BigInt(0)'] = Native.Type.BigInt;
		if (global.BigInt) typeMap['BigInt(1)'] = Native.Type.BigInt;
		if (global.BigInt64Array) typeMap['new BigInt64Array()'] = Native.Type.BigInt64Array;
		if (global.BigUint64Array) typeMap['new BigUint64Array()'] = Native.Type.BigUint64Array;

		const valueDict = _getTestValueDict();
		for (const name in valueDict) if (Native.Type.getType(valueDict[name]) !== typeMap[name]) fail(`Native.Type.getType(${name})`, name);
	}
	
	//	Category: Unit test
	//	Function: Run unit tests for `Native.CallableType` static class methods.
	//	Remarks: `BigInt` literals are excluded from the tests.
	static unitTest_Native_CallableType(result)
	{
		const fail = (testName, key) => result.push({ key, testName });
		const failEx = (testName, key, outcome) => result.push({ key, testName, outcome });
		//const fail = (testName, key) => console.log(`'${key}',`);	//	keep for when adding test values
		//const failEx = (testName, key, outcome) => console.log(`'${key}': Native.CallableType.${outcome.description},`);	//	keep for when adding test values

		_testSingleArgument("Native.CallableType.isFunction", v => Native.CallableType.isFunction(v), fail, { returnsTrue: 
		[
			'C',
			'class { }',
			'class C { }',
			'class extends class { } { }',
			'class extends B { }',
			'D',
			'class C extends B { }',
			'new MulticastDelegate()',
			'new ChaincastDelegate()',
			'() => { }',
			'function () { }',
			'Function()',
			'new Function()',
			'Object(new Function())',
			'new Object(new Function())',
		]});
		_testSingleArgument("Native.CallableType.isAsyncFunction", v => Native.CallableType.isAsyncFunction(v), fail, { returnsTrue: 
		[
			'new ChaincastAsyncDelegate()',
			'async function () { }',
			'new AsyncFunction()',
		]});
		_testSingleArgument("Native.CallableType.isGenerator", v => Native.CallableType.isGenerator(v), fail, { returnsTrue: 
		[
			'function* () { }',
			'new GeneratorFunction()',
		]});
		_testSingleArgument("Native.CallableType.isAsyncGenerator", v => Native.CallableType.isAsyncGenerator(v), fail, { returnsTrue: 
		[
			'async function* () { }',
			'new AsyncGeneratorFunction()',
		]});
		_testSingleArgument("Native.CallableType.isUnyielded", v => Native.CallableType.isUnyielded(v), fail, { returnsTrue: 
		[
			'C',
			'class { }',
			'class C { }',
			'class extends class { } { }',
			'class extends B { }',
			'D',
			'class C extends B { }',
			'new MulticastDelegate()',
			'new ChaincastDelegate()',
			'() => { }',
			'function () { }',
			'Function()',
			'new Function()',
			'Object(new Function())',
			'new Object(new Function())',
			'new ChaincastAsyncDelegate()',
			'async function () { }',
			'new AsyncFunction()',
		]});
		_testSingleArgument("Native.CallableType.isNonCallable", v => Native.CallableType.isNonCallable(v), fail, { returnsFalse: 
		[
			'C',
			'class { }',
			'class C { }',
			'class extends class { } { }',
			'class extends B { }',
			'D',
			'class C extends B { }',
			'new MulticastDelegate()',
			'new ChaincastDelegate()',
			'new ChaincastAsyncDelegate()',
			'() => { }',
			'function () { }',
			'function* () { }',
			'async function () { }',
			'async function* () { }',
			'Function()',
			'new Function()',
			'new GeneratorFunction()',
			'new AsyncFunction()',
			'new AsyncGeneratorFunction()',
			'Object(new Function())',
			'new Object(new Function())',
		]});
		_testSingleArgument("Native.CallableType.hasAsyncAttribute", v => Native.CallableType.hasAsyncAttribute(v), fail, { returnsTrue: 
		[
			'new ChaincastAsyncDelegate()',
			'async function () { }',
			'async function* () { }',
			'new AsyncFunction()',
			'new AsyncGeneratorFunction()',
		]});
		_testSingleArgument("Native.CallableType.hasGeneratorAttribute", v => Native.CallableType.hasGeneratorAttribute(v), fail, { returnsTrue: 
		[
			'function* () { }',
			'async function* () { }',
			'new GeneratorFunction()',
			'new AsyncGeneratorFunction()',
			]
		});

		const typeMap =
		{
			'0': Native.CallableType.NonCallable,
			'1': Native.CallableType.NonCallable,
			'Unset': Native.CallableType.NonCallable,
			'null': Native.CallableType.NonCallable,
			'void 0': Native.CallableType.NonCallable,
			'undefined': Native.CallableType.NonCallable,
			'NaN': Native.CallableType.NonCallable,
			'true': Native.CallableType.NonCallable,
			'false': Native.CallableType.NonCallable,
			'Boolean()': Native.CallableType.NonCallable,
			'new Boolean()': Native.CallableType.NonCallable,
			'Object(true)': Native.CallableType.NonCallable,
			'new Object(true)': Native.CallableType.NonCallable,
			'Symbol()': Native.CallableType.NonCallable,
			'Object(Symbol())': Native.CallableType.NonCallable,
			'new Object(Symbol())': Native.CallableType.NonCallable,
			'""': Native.CallableType.NonCallable,
			'"a"': Native.CallableType.NonCallable,
			'String()': Native.CallableType.NonCallable,
			'new String()': Native.CallableType.NonCallable,
			'Object("")': Native.CallableType.NonCallable,
			'new Object("")': Native.CallableType.NonCallable,
			'/a/gi': Native.CallableType.NonCallable,
			'RegExp()': Native.CallableType.NonCallable,
			'new RegExp()': Native.CallableType.NonCallable,
			'0.1': Native.CallableType.NonCallable,
			'1/2': Native.CallableType.NonCallable,
			'-0': Native.CallableType.NonCallable,
			'-1': Native.CallableType.NonCallable,
			'-0.1': Native.CallableType.NonCallable,
			'-1/2': Native.CallableType.NonCallable,
			'Math.PI': Native.CallableType.NonCallable,
			'Math.E': Native.CallableType.NonCallable,
			'Number()': Native.CallableType.NonCallable,
			'new Number()': Native.CallableType.NonCallable,
			'Object(0)': Native.CallableType.NonCallable,
			'new Object(0)': Native.CallableType.NonCallable,
			'Object(-0.1)': Native.CallableType.NonCallable,
			'new Object(-0.1)': Native.CallableType.NonCallable,
			'Infinity': Native.CallableType.NonCallable,
			'-Infinity': Native.CallableType.NonCallable,
			'{}': Native.CallableType.NonCallable,
			'JSON.parse("{}")': Native.CallableType.NonCallable,
			'obj': Native.CallableType.NonCallable,
			'Object()': Native.CallableType.NonCallable,
			'Object({})': Native.CallableType.NonCallable,
			'Object(obj)': Native.CallableType.NonCallable,
			'Object(cobj)': Native.CallableType.NonCallable,
			'new Object()': Native.CallableType.NonCallable,
			'new Object({})': Native.CallableType.NonCallable,
			'new Object(obj)': Native.CallableType.NonCallable,
			'new Object(cobj)': Native.CallableType.NonCallable,
			'new (class C { })': Native.CallableType.NonCallable,
			'new Object(new (class C { }))': Native.CallableType.NonCallable,
			'Object.create(new (class C { }))': Native.CallableType.NonCallable,
			'Object.create(null)': Native.CallableType.NonCallable,
			'Object.create(obj)': Native.CallableType.NonCallable,
			'Object.create(cobj)': Native.CallableType.NonCallable,
			'arr': Native.CallableType.NonCallable,
			'[]': Native.CallableType.NonCallable,
			'Array()': Native.CallableType.NonCallable,
			'Array(5)': Native.CallableType.NonCallable,
			'Array(5, 7)': Native.CallableType.NonCallable,
			'new Array()': Native.CallableType.NonCallable,
			'new Array(5)': Native.CallableType.NonCallable,
			'new Array(5, 7)': Native.CallableType.NonCallable,
			'Object([])': Native.CallableType.NonCallable,
			'Object(arr)': Native.CallableType.NonCallable,
			'new Object([])': Native.CallableType.NonCallable,
			'new Object(arr)': Native.CallableType.NonCallable,
			'arguments': Native.CallableType.NonCallable,
			'Object(arguments)': Native.CallableType.NonCallable,
			'new Object(arguments)': Native.CallableType.NonCallable,
			'args': Native.CallableType.NonCallable,
			'Object(args)': Native.CallableType.NonCallable,
			'new Object(args)': Native.CallableType.NonCallable,
			'new ArrayBuffer()': Native.CallableType.NonCallable,
			'new DataView(new ArrayBuffer())': Native.CallableType.NonCallable,
			'new Int8Array()': Native.CallableType.NonCallable,
			'new Uint8Array()': Native.CallableType.NonCallable,
			'new Uint8ClampedArray()': Native.CallableType.NonCallable,
			'new Int16Array()': Native.CallableType.NonCallable,
			'new Uint16Array()': Native.CallableType.NonCallable,
			'new Int32Array()': Native.CallableType.NonCallable,
			'new Uint32Array()': Native.CallableType.NonCallable,
			'new Float32Array()': Native.CallableType.NonCallable,
			'new Float64Array()': Native.CallableType.NonCallable,
			'new Map()': Native.CallableType.NonCallable,
			'new Set()': Native.CallableType.NonCallable,
			'new WeakMap()': Native.CallableType.NonCallable,
			'new WeakSet()': Native.CallableType.NonCallable,
			'C': Native.CallableType.Function,
			'class { }': Native.CallableType.Function,
			'class C { }': Native.CallableType.Function,
			'class extends class { } { }': Native.CallableType.Function,
			'class extends B { }': Native.CallableType.Function,
			'D': Native.CallableType.Function,
			'class C extends B { }': Native.CallableType.Function,
			'new MulticastDelegate()': Native.CallableType.Function,
			'new ChaincastDelegate()': Native.CallableType.Function,
			'new ChaincastAsyncDelegate()': Native.CallableType.AsyncFunction,
			'() => { }': Native.CallableType.Function,
			'function () { }': Native.CallableType.Function,
			'function* () { }': Native.CallableType.Generator,
			'async function () { }': Native.CallableType.AsyncFunction,
			'async function* () { }': Native.CallableType.AsyncGenerator,
			'Function()': Native.CallableType.Function,
			'new Function()': Native.CallableType.Function,
			'new GeneratorFunction()': Native.CallableType.Generator,
			'new AsyncFunction()': Native.CallableType.AsyncFunction,
			'new AsyncGeneratorFunction()': Native.CallableType.AsyncGenerator,
			'Object(new Function())': Native.CallableType.Function,
			'new Object(new Function())': Native.CallableType.Function,
			'createIterator()': Native.CallableType.NonCallable,
			'new Promise(() => true)': Native.CallableType.NonCallable,
			'Error()': Native.CallableType.NonCallable,
			'new Error()': Native.CallableType.NonCallable,
			'Date()': Native.CallableType.NonCallable,
			'new Date()': Native.CallableType.NonCallable,
			'Object(new Date())': Native.CallableType.NonCallable,
			'new Object(new Date())': Native.CallableType.NonCallable,
			'JSON': Native.CallableType.NonCallable,
			'Math': Native.CallableType.NonCallable,
			'Reflect': Native.CallableType.NonCallable,
		};

		if (global.Atomics) typeMap['Atomics'] = Native.CallableType.NonCallable;
		if (global.Intl) typeMap['Intl'] = Native.CallableType.NonCallable;
		if (global.WebAssembly) typeMap['WebAssembly'] = Native.CallableType.NonCallable;
		if (global.BigInt) typeMap['BigInt(0)'] = Native.CallableType.NonCallable;
		if (global.BigInt) typeMap['BigInt(1)'] = Native.CallableType.NonCallable;
		if (global.BigInt64Array) typeMap['new BigInt64Array()'] = Native.CallableType.NonCallable;
		if (global.BigUint64Array) typeMap['new BigUint64Array()'] = Native.CallableType.NonCallable;

		const valueDict = _getTestValueDict();
		for (const name in valueDict) if (Native.CallableType.getCallableType(valueDict[name]) !== typeMap[name]) failEx(`Native.CallableType.getCallableType(${name})`, name, Native.CallableType.getCallableType(valueDict[name]));
	}

	//	Category: Unit test
	//	Function: Run unit tests for `Native.CallableType` static class methods.
	//	Remarks: `BigInt` literals are excluded from the tests.
	static unitTest_Native_LiteralType(result)
	{
		//const fail = (testName, key) => result.push({ key, testName });
		//const failEx = (testName, key, outcome) => result.push({ key, testName, outcome });
		const fail = (testName, key) => console.log(`'${key}',`);	//	keep for when adding test values
		const failEx = (testName, key, outcome) => console.log(`'${key}': Native.LiteralType.${outcome.description},`);	//	keep for when adding test values

		_testSingleArgument("Native.LiteralType.isUndefined", v => Native.LiteralType.isUndefined(v), fail, { returnsTrue: [ "void 0", "undefined" ]});
		_testSingleArgument("Native.LiteralType.isNull", v => Native.LiteralType.isNull(v), fail, { returnsTrue: ["null"] });
		_testSingleArgument("Native.LiteralType.isNU", v => Native.LiteralType.isNU(v), fail, { returnsTrue: ["null", "void 0", "undefined"] });
		_testSingleArgument("Native.LiteralType.isBoolean", v => Native.LiteralType.isBoolean(v), fail, { returnsTrue: ['true', 'false', 'Boolean()'] });
		_testSingleArgument("Native.LiteralType.isNumber", v => Native.LiteralType.isNumber(v), fail, { returnsTrue: ['0', '1', '0.1', '1/2', '-0', '-1', '-0.1', '-1/2', 'Math.PI', 'Math.E', 'Number()'] });
		_testSingleArgument("Native.LiteralType.isInteger", v => Native.LiteralType.isInteger(v), fail, { returnsTrue: ['0', '1', '-0', '-1', 'Number()'] });
		_testSingleArgument("Native.LiteralType.isString", v => Native.LiteralType.isString(v), fail, { returnsTrue: ['""', '"a"', 'String()', 'Date()'] });
		_testSingleArgument("Native.LiteralType.isArray", v => Native.LiteralType.isArray(v), fail, { returnsTrue: 
		[
			'arr',
			'[]',
			'Array()',
			'Array(5)',
			'Array(5, 7)',
			'new Array()',
			'new Array(5)',
			'new Array(5, 7)',
			'Object([])',
			'Object(arr)',
			'new Object([])',
			'new Object(arr)',
			'args',
			'Object(args)',
			'new Object(args)'
		]});
		_testSingleArgument("Native.LiteralType.isObject", v => Native.LiteralType.isObject(v), fail, { returnsTrue: 
		[
			'{}',
			'JSON.parse("{}")',
			'obj',
			'Object()',
			'Object({})',
			'Object(obj)',
			'new Object()',
			'new Object({})',
			'new Object(obj)',
			'Object.create(obj)',
			'arguments',
			'Object(arguments)',
			'new Object(arguments)',
			'JSON',
			'Math',
			'Reflect',
			global.Atomics && 'Atomics',
			global.Intl && 'Intl',
			global.WebAssembly && 'WebAssembly',
		]});
		_testSingleArgument("Native.LiteralType.isNaL", v => Native.LiteralType.isNaL(v), fail, { returnsFalse: 
		[
			'0',
			'1',
			'null',
			'void 0',
			'undefined',
			'true',
			'false',
			'Boolean()',
			'""',
			'"a"',
			'String()',
			'0.1',
			'1/2',
			'-0',
			'-1',
			'-0.1',
			'-1/2',
			'Math.PI',
			'Math.E',
			'Number()',
			'{}',
			'JSON.parse("{}")',
			'obj',
			'Object()',
			'Object({})',
			'Object(obj)',
			'new Object()',
			'new Object({})',
			'new Object(obj)',
			'Object.create(obj)',
			'arr',
			'[]',
			'Array()',
			'Array(5)',
			'Array(5, 7)',
			'new Array()',
			'new Array(5)',
			'new Array(5, 7)',
			'Object([])',
			'Object(arr)',
			'new Object([])',
			'new Object(arr)',
			'arguments',
			'Object(arguments)',
			'new Object(arguments)',
			'args',
			'Object(args)',
			'new Object(args)',
			'Date()',
			'JSON',
			'Math',
			'Reflect',
			global.Atomics && 'Atomics',
			global.Intl && 'Intl',
			global.WebAssembly && 'WebAssembly',
		]});

		const typeMap =
		{
			'0': Native.LiteralType.Number,
			'1': Native.LiteralType.Number,
			'Unset': Native.LiteralType.NonLiteral,
			'null': Native.LiteralType.Null,
			'void 0': Native.LiteralType.Undefined,
			'undefined': Native.LiteralType.Undefined,
			'NaN': Native.LiteralType.NonLiteral,
			'true': Native.LiteralType.Boolean,
			'false': Native.LiteralType.Boolean,
			'Boolean()': Native.LiteralType.Boolean,
			'new Boolean()': Native.LiteralType.NonLiteral,
			'Object(true)': Native.LiteralType.NonLiteral,
			'new Object(true)': Native.LiteralType.NonLiteral,
			'Symbol()': Native.LiteralType.NonLiteral,
			'Object(Symbol())': Native.LiteralType.NonLiteral,
			'new Object(Symbol())': Native.LiteralType.NonLiteral,
			'""': Native.LiteralType.String,
			'"a"': Native.LiteralType.String,
			'String()': Native.LiteralType.String,
			'new String()': Native.LiteralType.NonLiteral,
			'Object("")': Native.LiteralType.NonLiteral,
			'new Object("")': Native.LiteralType.NonLiteral,
			'/a/gi': Native.LiteralType.NonLiteral,
			'RegExp()': Native.LiteralType.NonLiteral,
			'new RegExp()': Native.LiteralType.NonLiteral,
			'0.1': Native.LiteralType.Number,
			'1/2': Native.LiteralType.Number,
			'-0': Native.LiteralType.Number,
			'-1': Native.LiteralType.Number,
			'-0.1': Native.LiteralType.Number,
			'-1/2': Native.LiteralType.Number,
			'Math.PI': Native.LiteralType.Number,
			'Math.E': Native.LiteralType.Number,
			'Number()': Native.LiteralType.Number,
			'new Number()': Native.LiteralType.NonLiteral,
			'Object(0)': Native.LiteralType.NonLiteral,
			'new Object(0)': Native.LiteralType.NonLiteral,
			'Object(-0.1)': Native.LiteralType.NonLiteral,
			'new Object(-0.1)': Native.LiteralType.NonLiteral,
			'Infinity': Native.LiteralType.NonLiteral,
			'-Infinity': Native.LiteralType.NonLiteral,
			'{}': Native.LiteralType.Object,
			'JSON.parse("{}")': Native.LiteralType.Object,
			'obj': Native.LiteralType.Object,
			'Object()': Native.LiteralType.Object,
			'Object({})': Native.LiteralType.Object,
			'Object(obj)': Native.LiteralType.Object,
			'Object(cobj)': Native.LiteralType.NonLiteral,
			'new Object()': Native.LiteralType.Object,
			'new Object({})': Native.LiteralType.Object,
			'new Object(obj)': Native.LiteralType.Object,
			'new Object(cobj)': Native.LiteralType.NonLiteral,
			'new (class C { })': Native.LiteralType.NonLiteral,
			'new Object(new (class C { }))': Native.LiteralType.NonLiteral,
			'Object.create(new (class C { }))': Native.LiteralType.NonLiteral,
			'Object.create(null)': Native.LiteralType.NonLiteral,
			'Object.create(obj)': Native.LiteralType.Object,
			'Object.create(cobj)': Native.LiteralType.NonLiteral,
			'arr': Native.LiteralType.Array,
			'[]': Native.LiteralType.Array,
			'Array()': Native.LiteralType.Array,
			'Array(5)': Native.LiteralType.Array,
			'Array(5, 7)': Native.LiteralType.Array,
			'new Array()': Native.LiteralType.Array,
			'new Array(5)': Native.LiteralType.Array,
			'new Array(5, 7)': Native.LiteralType.Array,
			'Object([])': Native.LiteralType.Array,
			'Object(arr)': Native.LiteralType.Array,
			'new Object([])': Native.LiteralType.Array,
			'new Object(arr)': Native.LiteralType.Array,
			'arguments': Native.LiteralType.Object,
			'Object(arguments)': Native.LiteralType.Object,
			'new Object(arguments)': Native.LiteralType.Object,
			'args': Native.LiteralType.Array,
			'Object(args)': Native.LiteralType.Array,
			'new Object(args)': Native.LiteralType.Array,
			'new ArrayBuffer()': Native.LiteralType.NonLiteral,
			'new DataView(new ArrayBuffer())': Native.LiteralType.NonLiteral,
			'new Int8Array()': Native.LiteralType.NonLiteral,
			'new Uint8Array()': Native.LiteralType.NonLiteral,
			'new Uint8ClampedArray()': Native.LiteralType.NonLiteral,
			'new Int16Array()': Native.LiteralType.NonLiteral,
			'new Uint16Array()': Native.LiteralType.NonLiteral,
			'new Int32Array()': Native.LiteralType.NonLiteral,
			'new Uint32Array()': Native.LiteralType.NonLiteral,
			'new Float32Array()': Native.LiteralType.NonLiteral,
			'new Float64Array()': Native.LiteralType.NonLiteral,
			'new Map()': Native.LiteralType.NonLiteral,
			'new Set()': Native.LiteralType.NonLiteral,
			'new WeakMap()': Native.LiteralType.NonLiteral,
			'new WeakSet()': Native.LiteralType.NonLiteral,
			'C': Native.LiteralType.NonLiteral,
			'class { }': Native.LiteralType.NonLiteral,
			'class C { }': Native.LiteralType.NonLiteral,
			'class extends class { } { }': Native.LiteralType.NonLiteral,
			'class extends B { }': Native.LiteralType.NonLiteral,
			'D': Native.LiteralType.NonLiteral,
			'class C extends B { }': Native.LiteralType.NonLiteral,
			'new MulticastDelegate()': Native.LiteralType.NonLiteral,
			'new ChaincastDelegate()': Native.LiteralType.NonLiteral,
			'new ChaincastAsyncDelegate()': Native.LiteralType.NonLiteral,
			'() => { }': Native.LiteralType.NonLiteral,
			'function () { }': Native.LiteralType.NonLiteral,
			'function* () { }': Native.LiteralType.NonLiteral,
			'async function () { }': Native.LiteralType.NonLiteral,
			'async function* () { }': Native.LiteralType.NonLiteral,
			'Function()': Native.LiteralType.NonLiteral,
			'new Function()': Native.LiteralType.NonLiteral,
			'new GeneratorFunction()': Native.LiteralType.NonLiteral,
			'new AsyncFunction()': Native.LiteralType.NonLiteral,
			'new AsyncGeneratorFunction()': Native.LiteralType.NonLiteral,
			'Object(new Function())': Native.LiteralType.NonLiteral,
			'new Object(new Function())': Native.LiteralType.NonLiteral,
			'createIterator()': Native.LiteralType.NonLiteral,
			'new Promise(() => true)': Native.LiteralType.NonLiteral,
			'Error()': Native.LiteralType.NonLiteral,
			'new Error()': Native.LiteralType.NonLiteral,
			'Date()': Native.LiteralType.String,
			'new Date()': Native.LiteralType.NonLiteral,
			'Object(new Date())': Native.LiteralType.NonLiteral,
			'new Object(new Date())': Native.LiteralType.NonLiteral,
			'JSON': Native.LiteralType.Object,
			'Math': Native.LiteralType.Object,
			'Reflect': Native.LiteralType.Object,
		};

		if (global.Atomics) typeMap['Atomics'] = Native.LiteralType.Object;
		if (global.Intl) typeMap['Intl'] = Native.LiteralType.Object;
		if (global.WebAssembly) typeMap['WebAssembly'] = Native.LiteralType.Object;
		if (global.BigInt) typeMap['BigInt(0)'] = Native.LiteralType.NonLiteral;
		if (global.BigInt) typeMap['BigInt(1)'] = Native.LiteralType.NonLiteral;
		if (global.BigInt64Array) typeMap['new BigInt64Array()'] = Native.LiteralType.NonLiteral;
		if (global.BigUint64Array) typeMap['new BigUint64Array()'] = Native.LiteralType.NonLiteral;

		const valueDict = _getTestValueDict();
		for (const name in valueDict) if (Native.LiteralType.getType(valueDict[name]) !== typeMap[name]) failEx(`Native.LiteralType.getType(${name})`, name, Native.LiteralType.getType(valueDict[name]));
	}
}

module.exports.UnitTests_Type = module.exports;
