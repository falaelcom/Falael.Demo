//	R0Q2/daniel/20220505
"use strict";

const { Type, Unset } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { Fabric } = require("-/pb/natalis/013/Fabric.js");
const { LiteralFabric } = require("-/pb/natalis/014/LiteralFabric.js");
const { buf } = require("-/pb/natalis/013/Compound.js"); 
const { MulticastDelegate } = require("-/pb/natalis/012/MulticastDelegate.js");
const { NativeGraph } = require("-/pb/natalis/014/NativeGraph.js");

const GeneratorFunction = Object.getPrototypeOf(function* () { }).constructor;
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const generatorFunction = function* () { };

module.exports =

class UnitTests_NativeGraph
{
	//	Category: Unit test
	//	Function: Run unit tests for `NativeGraph` non-JSON-related static class methods.
	//	Remarks: If one or more unit tests have failed, appends to `result` elements in the form `{ testName: string, expected, outcome }`.
	//	Remarks: From all build-in JavaScript types that have `TypedArray` as a prototype, only `Int8Array` is tested, with the assumption that all other types
	//		from the `*Array` family will behave yield the same test results.
	static unitTest_NativeGraph(result)
	{
		const test = (outcome, expected) => JSON.stringify(outcome) === JSON.stringify(expected);
		const testLiteral = (outcome, expected) => outcome === expected || (outcome !== outcome && expected !== expected);
		const testJson = (outcome, expected) => Diagnostics.format(outcome) === Diagnostics.format(expected);
		const testJsonText = (outcome, expected) => Diagnostics.format(outcome) === expected;
		const fail = (testName) => ({ testName });
		const failEx = (testName, expected, outcome) => ({ testName, expected, outcome });

		let obj;
		let obj2;
		let expected;
		let outcome;

		test_count();
		test_transcribe();
		test_select();

		//	NativeGraph.count
		function test_count()
		{
			obj = ""; expected = 0; if (!testLiteral(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count("")`, expected, outcome));
			obj = "a"; expected = 1; if (!testLiteral(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count("a")`, expected, outcome));
			obj = "aa"; expected = 2; if (!testLiteral(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count("aa")`, expected, outcome));
			obj = String(); expected = 0; if (!testLiteral(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(String())`, expected, outcome));
			obj = new String(); expected = 0; if (!testLiteral(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(new String())`, expected, outcome));
			obj = []; expected = 0; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count([])`, expected, outcome));
			obj = [1]; expected = 1; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count([1])`, expected, outcome));
			obj = [1, 2]; expected = 2; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count([1, 2])`, expected, outcome));
			obj = []; obj.length = 3; expected = 3; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count([]) (1)`, expected, outcome));
			obj = Array(); expected = 0; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(Array())`, expected, outcome));
			obj = Array(5); expected = 5; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(Array(5))`, expected, outcome));
			obj = Array(1, 2); expected = 2; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(Array(1, 2))`, expected, outcome));
			obj = Array(); obj.length = 3; expected = 3; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(Array()) (1)`, expected, outcome));
			obj = new Array(); expected = 0; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(new Array())`, expected, outcome));
			obj = new Array(5); expected = 5; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(new Array(5))`, expected, outcome));
			obj = new Array(1, 2); expected = 2; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(new Array(1, 2))`, expected, outcome));
			obj = new Array(); obj.length = 3; expected = 3; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(new Array()) (1)`, expected, outcome));
			(function () { obj = arguments; expected = 3; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(arguments)`, expected, outcome)); })(1, 2, 3);
			(function (...args) { obj = args; expected = 3; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(args)`, expected, outcome)); })(1, 2, 3);
			obj = {}; expected = 0; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count({})`, expected, outcome));
			obj = { a: 1 }; expected = 1; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count({ a: 1 })`, expected, outcome));
			obj = { a: 1, b: 2 }; expected = 2; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count({ a: 1, b: 2 })`, expected, outcome));
			obj = JSON.parse("{}"); expected = 0; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(JSON.parse("{}"))`, expected, outcome));
			obj = JSON.parse("{ \"a\": 1 }"); expected = 1; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(JSON.parse('{ "a": 1 }'))`, expected, outcome));
			obj = JSON.parse("{ \"a\": 1, \"b\": 2 }"); expected = 2; if (!test(outcome = NativeGraph.count(obj), expected)) result.push(failEx(`count(JSON.parse('{ "a": 1, "b": 2 }'))`, expected, outcome));
		}

		//	NativeGraph.transcribe
		function test_transcribe()
		{
			obj = void 0; expected = void 0; if (!testJson(outcome = NativeGraph.transcribe(obj), expected)) result.push(failEx(`NativeGraph.transcribe 001.001`, expected, outcome));
			obj = void 0; expected = void 0; if (!testJson(outcome = NativeGraph.transcribe(obj, Fabric.the, buf()), expected)) result.push(failEx(`NativeGraph.transcribe 001.002`, expected, outcome));
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = { a: [1, 2], b: { c: [{ d: 3 }] } }; if (!testJson(outcome = NativeGraph.transcribe(obj, Fabric.the, buf()), expected)) result.push(failEx(`NativeGraph.transcribe 001.003`, expected, outcome));
			obj = void 0; expected = void 0; if (!testJson(outcome = NativeGraph.transcribe(obj, LiteralFabric.the), expected)) result.push(failEx(`NativeGraph.transcribe 001.004`, expected, outcome));
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = { a: [1, 2], b: { c: [{ d: 3 }] } }; if (!testJson(outcome = NativeGraph.transcribe(obj, LiteralFabric.the), expected)) result.push(failEx(`NativeGraph.transcribe 001.005`, expected, outcome));
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = { a: [1, 2], b: { c: [{ d: 3 }] } }; if (!testJson(outcome = NativeGraph.transcribe(obj, LiteralFabric.the, Unset), expected)) result.push(failEx(`NativeGraph.transcribe 001.006`, expected, outcome));
			obj = { a: null }; obj2 = { b: obj }; obj.a = obj2; expected = obj; if (!testJson(outcome = NativeGraph.transcribe(obj, LiteralFabric.the), expected)) result.push(failEx(`NativeGraph.transcribe 001.007`, expected, outcome));
			try
			{
				obj = { a: null }; obj2 = { b: obj }; obj.a = obj2;
				NativeGraph.transcribe(obj, LiteralFabric.the, Unset);
				result.push(failEx(`NativeGraph.transcribe 001.008.001`, "ERROR", null));
			}
			catch (ex)
			{
				if (ex.name !== "RangeError") result.push(failEx(`NativeGraph.transcribe 001.008.002`, "RangeError", ex.name));
			}
		}

		//	NativeGraph.select
		function test_select()
		{
			obj = void 0; expected = void 0; if (!testJson(outcome = NativeGraph.select(obj, []), expected)) result.push(failEx(`NativeGraph.select 001.001`, expected, outcome));
			obj = void 0; expected = void 0; if (!testJson(outcome = NativeGraph.select(obj, [], false, Fabric.the, buf()), expected)) result.push(failEx(`NativeGraph.select 001.002`, expected, outcome));
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = `{}`; if (!testJsonText(outcome = NativeGraph.select(obj, [], false), expected)) result.push(failEx(`NativeGraph.select 001.003`, expected, Diagnostics.format(outcome))); 
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = `{ "a": [...(2x empty)] }`; if (!testJsonText(outcome = NativeGraph.select(obj, "a", false), expected)) result.push(failEx(`NativeGraph.select 001.004`, expected, Diagnostics.format(outcome))); 
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = `{ "a": [1, 2], "b": { "c": [{ "d": 3 }] } }`; if (!testJsonText(outcome = NativeGraph.select(obj, [], true), expected)) result.push(failEx(`NativeGraph.select 001.005`, expected, Diagnostics.format(outcome))); 
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = `{ "a": [1, ...(empty)] }`; if (!testJsonText(outcome = NativeGraph.select(obj, ["a", 0], false), expected)) result.push(failEx(`NativeGraph.select 001.006`, expected, Diagnostics.format(outcome)));
			obj = { a: [1, 2], b: { c: [{ d: 3 }] } }; expected = `{ "a": [1, 2], "b": { "c": [{ "d": 3 }] } }`; if (!testJsonText(outcome = NativeGraph.select(obj, [], true, LiteralFabric.the), expected)) result.push(failEx(`NativeGraph.select 001.007`, expected, Diagnostics.format(outcome))); 
			obj = { a: null }; obj2 = { b: obj }; obj.a = obj2; expected = `{ "a": { "b": &Object@0 } }`; if (!testJsonText(outcome = NativeGraph.select(obj, [], true, LiteralFabric.the), expected)) result.push(failEx(`NativeGraph.select 001.008`, expected, Diagnostics.format(outcome)));
			try
			{
				obj = { a: null }; obj2 = { b: obj }; obj.a = obj2;
				NativeGraph.select(obj, [], true, LiteralFabric.the, Unset);
				result.push(failEx(`NativeGraph.select 001.009.001`, "ERROR", null));
			}
			catch (ex)
			{
				if (ex.name !== "RangeError") result.push(failEx(`NativeGraph.select 001.009.002`, "RangeError", ex.name));
			}
		}
	}

	//	Category: Unit test
	//	Function: Run unit tests for `NativeGraph` JSON-related static class methods, as well some `JSON.stringify` tests for probing JavaScript platform compatibility with standards.
	//	Remarks: If one or more unit tests have failed, appends to `result` elements in the form `{ testName: string, expected, outcome }`.
	//	Remarks: From all build-in JavaScript types that have `TypedArray` as a prototype, only `Int8Array` is tested, with the assumption that all other types
	//		from the `*Array` family will behave yield the same test results.
	static unitTest_NativeGraph_Visitors(result)
	{
		const testLiteral = (outcome, expected) => outcome === expected || (outcome !== outcome && expected !== expected);
		const testJson = (outcome, expected) => Diagnostics.format(outcome) === Diagnostics.format(expected);
		const testJsonText = (outcome, expected) => Diagnostics.format(outcome) === expected;
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });
		const failText = (testName, expected, outcome) => ({ testName, expected, outcome: Diagnostics.format(outcome) });
		const failEx = (testName, expected, outcome) => ({ testName, expected: Diagnostics.format(expected), outcome: Diagnostics.format(outcome) });

		let obj;
		let obj2;
		let expected;
		let outcome;

		validate_JSON_stringify();
		test_NativeGraph_Visitors_json_Fabric();
		test_NativeGraph_Visitors_json_LiteralFabric();
		test_NativeGraph_Visitors_transcribe_Fabric();
		test_NativeGraph_Visitors_select_Fabric();
		if (global.BigInt) test_withBigIntLiteral();

		//	test `JSON.stringify` for types, unknown to `NativeGraph.json`; it is assumed that the `Int8Array` test is representative of all `*Array` family of types.
		function validate_JSON_stringify()
		{
			obj = new Map(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new Map())`, expected, outcome));
			obj = new Set(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new Set())`, expected, outcome));
			obj = new WeakMap(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new WeakMap())`, expected, outcome));
			obj = new WeakSet(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new WeakSet())`, expected, outcome));
			obj = new Int8Array(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new Int8Array())`, expected, outcome));
			obj = new ArrayBuffer(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new ArrayBuffer())`, expected, outcome));
			obj = new DataView(new ArrayBuffer()); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new DataView(new ArrayBuffer()))`, expected, outcome));
			obj = /a/gi; expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(/a/gi)`, expected, outcome));
			obj = RegExp(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(RegExp())`, expected, outcome));
			obj = new RegExp(); expected = "{}"; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new RegExp())`, expected, outcome));
			obj = new RegExp(); obj.a = 1; expected = `{"a":1}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new RegExp()) (modified)`, expected, outcome));
			//	-- moved to test_withBigIntLiteral()
			//obj = 0n; try { JSON.stringify(obj); result.push(failEx(`JSON.stringify(0n)`, null, outcome)); } catch (ex) { }
			if (global.BigInt) { obj = BigInt(0); try { JSON.stringify(obj); result.push(fail(`JSON.stringify(BigInt(0))`, null, outcome)); } catch (ex) { } }
			obj = () => { }; expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(() => { })`, expected, outcome));
			obj = function () { }; expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(function () { })`, expected, outcome));
			obj = function* () { }; expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(function* () { })`, expected, outcome));
			obj = async function () { }; expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(async function () { })`, expected, outcome));
			obj = Function(); expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(Function())`, expected, outcome));
			obj = new GeneratorFunction(); expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new GeneratorFunction())`, expected, outcome));
			obj = new AsyncFunction(); expected = void 0; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new AsyncFunction())`, expected, outcome));
			obj = new Promise(() => true); expected = `{}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new Promise(() => true))`, expected, outcome));
			obj = generatorFunction(); expected = `{}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(generatorFunction())`, expected, outcome));
			obj = Error(); expected = `{}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(Error())`, expected, outcome));
			obj = new Error(); expected = `{}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new Error())`, expected, outcome));
			obj = new Error(); obj.a = 1; expected = `{"a":1}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new Error()) (modified)`, expected, outcome));
			obj = new (class { }); expected = `{}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new (class {}))`, expected, outcome));
			obj = new (class { constructor() { this.a = 1; } }); expected = `{"a":1}`; if (!testLiteral(outcome = JSON.stringify(obj), expected)) result.push(fail(`JSON.stringify(new (class { constructor() { this.a = 1; } }))`, expected, outcome));
		}

		//	NativeGraph.Visitors.json, Fabric
		function test_NativeGraph_Visitors_json_Fabric()
		{
			function formatJson_Fabric(value)
			{
				return Fabric.the.walk(NativeGraph.Visitors.json, { target: void 0, visited: buf() }, value).target;
			}

			///////////////////////////////////////
			//	non-compliant with JSON.stringify

			//	class instance
			obj = {}; obj2 = { a: 1 }; Object.setPrototypeOf(obj, obj2); expected = `{"a":1}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance, setPrototypeOf - inherited field`, expected, outcome));
			//	class instance - own properties
			class C3 { }; Object.defineProperty(C3.prototype, "n", { get: () => 1, enumerable: true }); obj = new C3; expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - class, Object.defineProperty, enumerable`, expected, outcome));
			//	class instance - inherited properties
			obj = {}; obj2 = { get n() { return 1; } }; Object.setPrototypeOf(obj, obj2); expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: setPrototypeOf, { get n() { return 1; } }`, expected, outcome));
			obj = {}; obj2 = {}; obj2.__defineGetter__("n", () => 1); Object.setPrototypeOf(obj, obj2); expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: __defineGetter__("n", () => 1)`, expected, outcome));
			obj = {}; obj2 = {}; Object.defineProperty(obj2, "n", { value: 1, enumerable: true }); Object.setPrototypeOf(obj, obj2); expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: defineProperty(obj2, "n", { value: 1, enumerable: true })`, expected, outcome));
			class D5 { }; class D6 extends D5 { }; Object.defineProperty(D5.prototype, "n", { value: 1, enumerable: true }); obj = new D6; expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: class, Object.defineProperty, { get n() { return 1; } }, enumerable`, expected, outcome));
			//	proxies
			class E2 { }; Object.defineProperty(E2.prototype, "n", { get: () => 1, enumerable: true }); obj = new Proxy(new E2, { get(target, prop, receiver) { if (prop === "n") return 2; else return Reflect.get(...arguments); } }); expected = `{"n":2}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Proxy(new E2, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));

			///////////////////////////////////////
			//	compliant with JSON.stringify

			obj = void 0; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(void 0)`, expected, outcome));
			obj = null; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(null)`, expected, outcome));
			obj = NaN; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(NaN)`, expected, outcome));
			obj = Symbol(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(Symbol())`, expected, outcome));
			obj = true; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = false; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = Boolean(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(Boolean())`, expected, outcome));
			obj = new Boolean(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Boolean())`, expected, outcome));
			obj = 0; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = 1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = Infinity; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = Number(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(Number())`, expected, outcome));
			obj = new Number(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Number())`, expected, outcome));
			obj = ""; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = "a"; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = String(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(String())`, expected, outcome));
			obj = new String(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new String())`, expected, outcome));
			obj = /a/gi; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(/a/gi)`, expected, outcome));
			obj = RegExp(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(RegExp())`, expected, outcome));
			obj = new RegExp(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new RegExp())`, expected, outcome));
			obj = new Date(1999, 1, 1, 0, 0, 0, 0); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Date(1999, 1, 1, 0, 0, 0, 0))`, expected, outcome));
			//	modified objects of built-in types
			obj = new RegExp(); obj.a = 1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new RegExp()) (modified)`, expected, outcome));
			obj = new Date(2000, 1, 1, 0, 0, 0, 0); obj.a = 1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Date(2000, 1, 1, 0, 0, 0, 0)) (modified)`, expected, outcome));
			obj = new Error(); obj.a = 1; expected = JSON.stringify(obj); outcome = formatJson_Fabric(obj); if (outcome.indexOf(expected) !== 0) result.push(fail(`formatJson_Fabric(new Error()) (modified)`, expected, outcome));
			//	primitive object
			obj = {}; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: null }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric({a:null})`, expected, outcome));
			obj = { a: void 0 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric({a:void 0})`, expected, outcome));
			obj = { a: 1 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: 1, b: 2 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: { b: 1 } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [1] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [1, 2], b: [3, 4] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [], b: [{ c: 1, d: 2 }] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { [Symbol("a")]: 1 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric({ [Symbol("a")]: 1 })`, expected, outcome));
			obj = { a: Symbol() }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric({ a: Symbol() })`, expected, outcome));
			//	primitive object - own properties
			obj = { get n() { return 1; } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { set n(v) { } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { get n() { return 1; }, set n(v) { } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { get [Symbol("n")]() { return 1; } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric({ get [Symbol("n")]() { return 1; } })`, expected, outcome));
			obj = {}; obj.__defineGetter__("n", () => 1); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - __defineGetter__("n", () => 1)`, expected, outcome));
			obj = {}; obj.__defineSetter__("n", function (v) { }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - __defineSetter__("n", function (v) { })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1 }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", {value: 1})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", {value: 1, enumerable: true})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1, writable: false }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", {value: 1, writable: false})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1, writable: false, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", {value: 1, writable: false, enumerable: true})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1 }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", { get: () => 1 })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", { get: () => 1, enumerable: true })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", { get: () => 1, set: function(v) { }})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { }, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { }, enumerable: true })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, Symbol("n"), { value: 1, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - Object.defineProperty(obj, Symbol("n"), { value: 1, enumerable: true })`, expected, outcome));
			//	class instance
			obj = {}; obj2 = {}; Object.setPrototypeOf(obj, obj2); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance, setPrototypeOf`, expected, outcome));
			function A1() { }; obj = new A1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance, function`, expected, outcome));
			function A2() { this.a = 1; }; obj = new A2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance, function - inherited field`, expected, outcome));
			class B1 { }; obj = new B1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance, class`, expected, outcome));
			class B2 { constructor() { this.a = 1; } }; obj = new B2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance, class - inherited field`, expected, outcome));
			//	class instance - own properties
			class C1 { get n() { return 1; } }; obj = new C1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - own properties: class, { get n() { return 1; } }`, expected, outcome));
			class C2 { }; Object.defineProperty(C2.prototype, "n", { get: () => 1 }); obj = new C2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - class, Object.defineProperty`, expected, outcome));
			//	class instance - inherited properties
			class D1 { get n() { return 1; } }; class D2 extends D1 { }; obj = new D2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: class, { get n() { return 1; } }`, expected, outcome));
			obj = {}; obj2 = {}; Object.defineProperty(obj2, "n", { value: 1 }); Object.setPrototypeOf(obj, obj2); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: defineProperty(obj2, "n", { value: 1 })`, expected, outcome));
			class D3 { }; class D4 extends D3 { }; Object.defineProperty(D3.prototype, "n", { value: 1 }); obj = new D4; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - class instance - inherited properties: class, Object.defineProperty, { get n() { return 1; } }`, expected, outcome));
			//	array
			obj = []; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([])`, expected, outcome));
			obj = [null]; outcome = formatJson_Fabric(obj); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([null])`, expected, outcome));
			obj = [void 0]; outcome = formatJson_Fabric(obj); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([void 0])`, expected, outcome));
			obj = [Symbol()]; outcome = formatJson_Fabric(obj); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([Symbol()])`, expected, outcome));
			obj = [1]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1])`, expected, outcome));
			obj = [1, 2]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, 2])`, expected, outcome));
			obj = [{}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([{}])`, expected, outcome));
			obj = [{}, {}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([{}, {}])`, expected, outcome));
			obj = [{ a: 1 }, { b: 2 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([{ a: 1 }, { b: 2 }])`, expected, outcome));
			obj = [[]]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([[]])`, expected, outcome));
			obj = [[], []]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([[], []])`, expected, outcome));
			obj = [[1, 2], [3, 4]]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([[1, 2], [3, 4]])`, expected, outcome));
			obj = [[], [{ a: 1 }, { b: 2 }]]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([[], [{ a: 1 }, { b: 2 }]])`, expected, outcome));
			//	graph traversal differentials
			obj = [1, {}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, {}])`, expected, outcome));
			obj = [{}, 1]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([{}, 1])`, expected, outcome));
			obj = [1, { a: 1 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, { a: 1 }])`, expected, outcome));
			obj = [{ a: 1 }, 1]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([{ a: 1 }, 1])`, expected, outcome));
			obj = [1, { a: [2] }, 3]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, { a: [2] }, 3])`, expected, outcome));
			obj = [1, { a: [2] }, {}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, { a: [2] }, {}])`, expected, outcome));
			obj = [1, { a: [2] }, { b: 3 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, { a: [2] }, { b: 3 }])`, expected, outcome));
			obj = [1, { a: [2] }, 4, { b: 3 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric([1, { a: [2] }, 4, { b: 3 }])`, expected, outcome));
			//	reusing references
			obj = {}; obj2 = { n: 2 }; obj.a1 = obj2; obj.a2 = obj2;
			expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric() - reusing references 1`, expected, outcome));
			//	proxies
			obj = new Proxy({ a: 1 }, { get(target, prop, receiver) { if (prop === "a") return 2; else return Reflect.get(...arguments); } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Proxy({ a: 1 }, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
			class E1 { get n() { return 1; } }; obj = new Proxy(new E1, { get(target, prop, receiver) { if (prop === "n") return 2; else return Reflect.get(...arguments); } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric(new Proxy(new E1, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
			//	error object
			obj = new Error("a"); outcome = formatJson_Fabric(obj); expected = JSON.stringify(obj); if (outcome.indexOf(expected) !== 0) result.push(fail(`formatJson_Fabric(new Error("a"))`, expected, outcome));	//	different browsers provide different stack strings; this unit test acknowledges this behavior and does not test possible variants
			//	prototype pollution
			obj = { __proto__: { polluted: true } }; expected = `{"polluted":true}`; if (!testLiteral(outcome = formatJson_Fabric(obj), expected)) result.push(fail(`formatJson_Fabric({ __proto__: { polluted: true } }) (1)`, expected, outcome));
			obj = { __proto__: { polluted: true } }; formatJson_Fabric(obj); if (new Object().polluted) result.push(fail(`formatJson_Fabric({ __proto__: { polluted: true } }) (2)`, false, true));
			//	circular refererences
			obj = {}; obj2 = {}; obj.a = obj2; obj2.a = obj;
			try { outcome = formatJson_Fabric(obj); result.push(fail(`formatJson_Fabric:circular (1.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0x90AC92 Circular reference.`) result.push(fail(`formatJson_Fabric:circular (1.2)`, "exception", ex)); }
			obj = { n: 1 }; obj2 = { n: 2 }; obj.a = obj2; obj2.a = obj;
			try { outcome = formatJson_Fabric(obj); result.push(fail(`formatJson_Fabric:circular (2.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0x12B0AA Circular reference.`) result.push(fail(`formatJson_Fabric:circular (2.2)`, "exception", ex)); }
			obj = { n: 1 }; obj.a = obj;
			try { outcome = formatJson_Fabric(obj); result.push(fail(`formatJson_Fabric:circular (3.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0x12B0AA Circular reference.`) result.push(fail(`formatJson_Fabric:circular (3.2)`, "exception", ex)); }
			obj = { n1: { r1: 2 } }; obj2 = { n2: { r2: 2 } }; obj.a1 = obj2; obj2.a2 = obj;
			try { outcome = formatJson_Fabric(obj); result.push(fail(`formatJson_Fabric:circular (4.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0xDC81D7 Circular reference.`) result.push(fail(`formatJson_Fabric:circular (4.2)`, "exception", ex)); }
		}

		//	NativeGraph.Visitors.json, LiteralFabric
		function test_NativeGraph_Visitors_json_LiteralFabric()
		{
			function formatJson_LiteralFabric(value)
			{
				return LiteralFabric.the.walk(NativeGraph.Visitors.json, { target: void 0, visited: buf() }, value).target;
			}

			///////////////////////////////////////
			//	non-compliant with JSON.stringify

			//	class instance
			obj = {}; obj2 = { a: 1 }; Object.setPrototypeOf(obj, obj2); expected = `{"a":1}`; if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance, setPrototypeOf - inherited field`, expected, outcome));
			//	class instance - inherited properties
			obj = {}; obj2 = { get n() { return 1; } }; Object.setPrototypeOf(obj, obj2); expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: setPrototypeOf, { get n() { return 1; } }`, expected, outcome));
			obj = {}; obj2 = {}; obj2.__defineGetter__("n", () => 1); Object.setPrototypeOf(obj, obj2); expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: __defineGetter__("n", () => 1)`, expected, outcome));
			obj = {}; obj2 = {}; Object.defineProperty(obj2, "n", { value: 1, enumerable: true }); Object.setPrototypeOf(obj, obj2); expected = `{"n":1}`; if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: defineProperty(obj2, "n", { value: 1, enumerable: true })`, expected, outcome));

			///////////////////////////////////////
			//	compliant with JSON.stringify

			obj = void 0; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(void 0)`, expected, outcome));
			obj = null; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(null)`, expected, outcome));
			obj = NaN; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(NaN)`, expected, outcome));
			obj = Symbol(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(Symbol())`, expected, outcome));
			obj = true; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = false; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = Boolean(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(Boolean())`, expected, outcome));
			obj = new Boolean(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Boolean())`, expected, outcome));
			obj = 0; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = 1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = Infinity; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = Number(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(Number())`, expected, outcome));
			obj = new Number(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Number())`, expected, outcome));
			obj = ""; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = "a"; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = String(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(String())`, expected, outcome));
			obj = new String(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new String())`, expected, outcome));
			obj = /a/gi; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(/a/gi)`, expected, outcome));
			obj = RegExp(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(RegExp())`, expected, outcome));
			obj = new RegExp(); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new RegExp())`, expected, outcome));
			obj = new Date(1999, 1, 1, 0, 0, 0, 0); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Date(1999, 1, 1, 0, 0, 0, 0))`, expected, outcome));
			//	modified objects of built-in types
			obj = new RegExp(); obj.a = 1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new RegExp()) (modified)`, expected, outcome));
			obj = new Date(2000, 1, 1, 0, 0, 0, 0); obj.a = 1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Date(2000, 1, 1, 0, 0, 0, 0)) (modified)`, expected, outcome));
			obj = new Error(); obj.a = 1; expected = JSON.stringify(obj); outcome = formatJson_LiteralFabric(obj); if (outcome.indexOf(expected) !== 0) result.push(fail(`formatJson_LiteralFabric(new Error()) (modified)`, expected, outcome));
			//	primitive object
			obj = {}; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: null }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric({a:null})`, expected, outcome));
			obj = { a: void 0 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric({a:void 0})`, expected, outcome));
			obj = { a: 1 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: 1, b: 2 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: { b: 1 } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [1] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [1, 2], b: [3, 4] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { a: [], b: [{ c: 1, d: 2 }] }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { [Symbol("a")]: 1 }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric({ [Symbol("a")]: 1 })`, expected, outcome));
			obj = { a: Symbol() }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric({ a: Symbol() })`, expected, outcome));
			//	primitive object - own properties
			obj = { get n() { return 1; } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { set n(v) { } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { get n() { return 1; }, set n(v) { } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(${JSON.stringify(obj)})`, expected, outcome));
			obj = { get [Symbol("n")]() { return 1; } }; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric({ get [Symbol("n")]() { return 1; } })`, expected, outcome));
			obj = {}; obj.__defineGetter__("n", () => 1); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - __defineGetter__("n", () => 1)`, expected, outcome));
			obj = {}; obj.__defineSetter__("n", function (v) { }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - __defineSetter__("n", function (v) { })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1 }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", {value: 1})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", {value: 1, enumerable: true})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1, writable: false }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", {value: 1, writable: false})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { value: 1, writable: false, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", {value: 1, writable: false, enumerable: true})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1 }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", { get: () => 1 })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", { get: () => 1, enumerable: true })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", { get: () => 1, set: function(v) { }})`, expected, outcome));
			obj = {}; Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { }, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { }, enumerable: true })`, expected, outcome));
			obj = {}; Object.defineProperty(obj, Symbol("n"), { value: 1, enumerable: true }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - Object.defineProperty(obj, Symbol("n"), { value: 1, enumerable: true })`, expected, outcome));
			//	class instance
			obj = {}; obj2 = {}; Object.setPrototypeOf(obj, obj2); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance, setPrototypeOf`, expected, outcome));
			function A1() { }; obj = new A1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance, function`, expected, outcome));
			function A2() { this.a = 1; }; obj = new A2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance, function - inherited field`, expected, outcome));
			class B1 { }; obj = new B1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance, class`, expected, outcome));
			class B2 { constructor() { this.a = 1; } }; obj = new B2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance, class - inherited field`, expected, outcome));
			//	class instance - own properties
			class C1 { get n() { return 1; } }; obj = new C1; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - own properties: class, { get n() { return 1; } }`, expected, outcome));
			class C2 { }; Object.defineProperty(C2.prototype, "n", { get: () => 1 }); obj = new C2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - class, Object.defineProperty`, expected, outcome));
			class C3 { }; Object.defineProperty(C3.prototype, "n", { get: () => 1, enumerable: true }); obj = new C3; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - class, Object.defineProperty, enumerable`, expected, outcome));
			//	class instance - inherited properties
			class D1 { get n() { return 1; } }; class D2 extends D1 { }; obj = new D2; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: class, { get n() { return 1; } }`, expected, outcome));
			obj = {}; obj2 = {}; Object.defineProperty(obj2, "n", { value: 1 }); Object.setPrototypeOf(obj, obj2); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: defineProperty(obj2, "n", { value: 1 })`, expected, outcome));
			class D3 { }; class D4 extends D3 { }; Object.defineProperty(D3.prototype, "n", { value: 1 }); obj = new D4; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: class, Object.defineProperty, { get n() { return 1; } }`, expected, outcome));
			class D5 { }; class D6 extends D5 { }; Object.defineProperty(D5.prototype, "n", { value: 1, enumerable: true }); obj = new D6; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - class instance - inherited properties: class, Object.defineProperty, { get n() { return 1; } }, enumerable`, expected, outcome));
			//	array
			obj = []; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([])`, expected, outcome));
			obj = [null]; outcome = formatJson_LiteralFabric(obj); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([null])`, expected, outcome));
			obj = [void 0]; outcome = formatJson_LiteralFabric(obj); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([void 0])`, expected, outcome));
			obj = [Symbol()]; outcome = formatJson_LiteralFabric(obj); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([Symbol()])`, expected, outcome));
			obj = [1]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1])`, expected, outcome));
			obj = [1, 2]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, 2])`, expected, outcome));
			obj = [{}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([{}])`, expected, outcome));
			obj = [{}, {}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([{}, {}])`, expected, outcome));
			obj = [{ a: 1 }, { b: 2 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([{ a: 1 }, { b: 2 }])`, expected, outcome));
			obj = [[]]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([[]])`, expected, outcome));
			obj = [[], []]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([[], []])`, expected, outcome));
			obj = [[1, 2], [3, 4]]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([[1, 2], [3, 4]])`, expected, outcome));
			obj = [[], [{ a: 1 }, { b: 2 }]]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([[], [{ a: 1 }, { b: 2 }]])`, expected, outcome));
			//	graph traversal differentials
			obj = [1, {}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, {}])`, expected, outcome));
			obj = [{}, 1]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([{}, 1])`, expected, outcome));
			obj = [1, { a: 1 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, { a: 1 }])`, expected, outcome));
			obj = [{ a: 1 }, 1]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([{ a: 1 }, 1])`, expected, outcome));
			obj = [1, { a: [2] }, 3]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, { a: [2] }, 3])`, expected, outcome));
			obj = [1, { a: [2] }, {}]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, { a: [2] }, {}])`, expected, outcome));
			obj = [1, { a: [2] }, { b: 3 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, { a: [2] }, { b: 3 }])`, expected, outcome));
			obj = [1, { a: [2] }, 4, { b: 3 }]; expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric([1, { a: [2] }, 4, { b: 3 }])`, expected, outcome));
			//	reusing references
			obj = {}; obj2 = { n: 2 }; obj.a1 = obj2; obj.a2 = obj2;
			expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric() - reusing references 1`, expected, outcome));
			//	proxies
			obj = new Proxy({ a: 1 }, { get(target, prop, receiver) { if (prop === "a") return 2; else return Reflect.get(...arguments); } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Proxy({ a: 1 }, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
			class E1 { get n() { return 1; } }; obj = new Proxy(new E1, { get(target, prop, receiver) { if (prop === "n") return 2; else return Reflect.get(...arguments); } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Proxy(new E1, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
			class E2 { }; Object.defineProperty(E2.prototype, "n", { get: () => 1, enumerable: true }); obj = new Proxy(new E2, { get(target, prop, receiver) { if (prop === "n") return 2; else return Reflect.get(...arguments); } }); expected = JSON.stringify(obj); if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric(new Proxy(new E2, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
			//	error object
			obj = new Error("a"); outcome = formatJson_LiteralFabric(obj); expected = JSON.stringify(obj); if (outcome.indexOf(expected) !== 0) result.push(fail(`formatJson_LiteralFabric(new Error("a"))`, expected, outcome));	//	different browsers provide different stack strings; this unit test acknowledges this behavior and does not test possible variants
			//	prototype pollution
			obj = { __proto__: { polluted: true } }; expected = `{"polluted":true}`; if (!testLiteral(outcome = formatJson_LiteralFabric(obj), expected)) result.push(fail(`formatJson_LiteralFabric({ __proto__: { polluted: true } }) (1)`, expected, outcome));
			obj = { __proto__: { polluted: true } }; formatJson_LiteralFabric(obj); if (new Object().polluted) result.push(fail(`formatJson_LiteralFabric({ __proto__: { polluted: true } }) (2)`, false, true));
			//	circular refererences
			obj = {}; obj2 = {}; obj.a = obj2; obj2.a = obj;
			try { outcome = formatJson_LiteralFabric(obj); result.push(fail(`formatJson_LiteralFabric:circular (1.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0x90AC92 Circular reference.`) result.push(fail(`formatJson_LiteralFabric:circular (1.2)`, "exception", ex)); }
			obj = { n: 1 }; obj2 = { n: 2 }; obj.a = obj2; obj2.a = obj;
			try { outcome = formatJson_LiteralFabric(obj); result.push(fail(`formatJson_LiteralFabric:circular (2.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0x12B0AA Circular reference.`) result.push(fail(`formatJson_LiteralFabric:circular (2.2)`, "exception", ex)); }
			obj = { n: 1 }; obj.a = obj;
			try { outcome = formatJson_LiteralFabric(obj); result.push(fail(`formatJson_LiteralFabric:circular (3.1)`, "exception", outcome)) } catch (ex) { if (ex.message !== `0x12B0AA Circular reference.`) result.push(fail(`formatJson_LiteralFabric:circular (3.2)`, "exception", ex)); }
		}

		//	NativeGraph.Visitors.transcribe, Fabric
		function test_NativeGraph_Visitors_transcribe_Fabric()
		{
			function transcribe_Fabric(value)
			{
				return Fabric.the.walk(NativeGraph.Visitors.transcribe, { fabric: Fabric.the, target: void 0, visited: buf() }, value).target;
			}

			const sym = Symbol("a"); 

			//	general
			{
				obj = void 0; expected = void 0; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(void 0)`, expected, outcome));
				obj = null; expected = null; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(null)`, expected, outcome));
				obj = NaN; expected = NaN; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(NaN)`, expected, outcome));
				obj = Symbol(); expected = obj; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(Symbol())`, expected, outcome));
				obj = true; expected = true; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(${obj})`, expected, outcome));
				obj = false; expected = false; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(${obj})`, expected, outcome));
				obj = Boolean(); expected = Boolean(); if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(Boolean())`, expected, outcome));
				obj = 0; expected = 0; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(${obj})`, expected, outcome));
				obj = 1; expected = 1; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(${obj})`, expected, outcome));
				obj = Number(); expected = Number(); if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(Number())`, expected, outcome));
				//	-- moved to test_withBigIntLiteral()
				//obj = 0n; expected = void 0; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(0n)`, expected, outcome));
				//obj = 1n; expected = void 0; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(1n)`, expected, outcome));
				if (global.BigInt) { obj = BigInt(0); expected = BigInt(0); if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(BigInt())`, expected, outcome)); }
				obj = ""; expected = ""; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(${obj})`, expected, outcome));
				obj = "a"; expected = "a"; if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(${obj})`, expected, outcome));
				obj = String(); expected = String(); if (!testLiteral(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(String())`, expected, outcome));
				obj = /a/gi; expected = /a/gi; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(/a/gi)`, expected, outcome));
				obj = RegExp(); expected = RegExp(); if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(RegExp())`, expected, outcome));
				obj = new RegExp(); expected = new RegExp(); if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new RegExp())`, expected, outcome));
				obj = new Date(); expected = obj; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new Date())`, expected, outcome));
			}
			//	primitive object
			{
				obj = {}; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({})`, expected, outcome));
				obj = { a: null }; expected = { a: null }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:null})`, expected, outcome));
				obj = { a: void 0 }; outcome = transcribe_Fabric(obj); if (outcome.a !== void 0) result.push(failEx(`transcribe_Fabric({a:void 0})`, { a: void 0 }, outcome));
				obj = { a: 1 }; expected = { a: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:1})`, expected, outcome));
				obj = { a: 1, b: 2 }; expected = { a: 1, b: 2 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:1,b:2})`, expected, outcome));
				obj = { a: { b: 1 } }; expected = { a: { b: 1 } }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:{b:1}})`, expected, outcome));
				obj = { a: [] }; expected = { a: [] }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:[]})`, expected, outcome));
				obj = { a: [1] }; expected = { a: [1] }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:[1]})`, expected, outcome));
				obj = { a: [1, 2], b: [3, 4] }; expected = { a: [1, 2], b: [3, 4] }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:[1,2],b:[3,4]})`, expected, outcome));
				obj = { a: [], b: [{ c: 1, d: 2 }] }; expected = { a: [], b: [{ c: 1, d: 2 }] }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({a:[],b:[{c:1,d:2}]})`, expected, outcome));
				obj = { [sym]: 1 }; expected = { [sym]: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({ [Symbol("a")]: 1 })`, expected, outcome));
			}
			//	primitive object - own properties
			{
				obj = { get n() { return 1; } }; expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({ get n() { return 1; } })`, expected, outcome));
				obj = { set n(v) { } }; expected = { n: void 0 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({ set n(v) { } })`, expected, outcome));
				obj = { get n() { return 1; }, set n(v) { } }; expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({ get n() { return 1; }, set n(v) { } })`, expected, outcome));
				const sym2 = Symbol("n"); obj = { get [sym2]() { return 1; } }; expected = { [sym2]: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({ get [Symbol("n")]() { return 1; } })`, expected, outcome));
				obj = {}; obj.__defineGetter__("n", () => 1); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - __defineGetter__("n", () => 1)`, expected, outcome));
				obj = {}; obj.__defineSetter__("n", function (v) { }); expected = { n: void 0 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - __defineSetter__("n", function (v) { })`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { value: 1 }); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", {value: 1})`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { value: 1, enumerable: true }); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", {value: 1, enumerable: true})`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { value: 1, writable: false }); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", {value: 1, writable: false})`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { value: 1, writable: false, enumerable: true }); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", {value: 1, writable: false, enumerable: true})`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { get: () => 1 }); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", { get: () => 1 })`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { get: () => 1, enumerable: true }); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", { get: () => 1, enumerable: true })`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { } }); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", { get: () => 1, set: function(v) { }})`, expected, outcome));
				obj = {}; Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { }, enumerable: true }); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, "n", { get: () => 1, set: function (v) { }, enumerable: true })`, expected, outcome));
				obj = {}; Object.defineProperty(obj, sym2, { value: 1, enumerable: true }); expected = { [sym2]: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - Object.defineProperty(obj, Symbol("n"), { value: 1, enumerable: true })`, expected, outcome));
			}
			//	class instance
			{
				obj = {}; obj2 = {}; Object.setPrototypeOf(obj, obj2); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance, setPrototypeOf`, expected, outcome));
				obj = {}; obj2 = { a: 1 }; Object.setPrototypeOf(obj, obj2); expected = { a: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance, setPrototypeOf - inherited field`, expected, outcome));
				obj = {}; obj2 = { a: 1 }; Object.setPrototypeOf(obj, obj2); outcome = transcribe_Fabric(obj); obj2.a = 2; expected = { a: 1 }; if (!testJson(outcome, expected)) result.push(failEx(`transcribe_Fabric() - class instance, setPrototypeOf - inherited field, mutation`, expected, outcome));
				function A1() { }; obj = new A1; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance, function`, expected, outcome));
				function A2() { this.a = 1; }; obj = new A2; expected = { a: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance, function - inherited field`, expected, outcome));
				function A3() { this.a = 1; }; obj = new A3; outcome = transcribe_Fabric(obj); obj.a = 2; expected = { a: 1 }; if (!testJson(outcome, expected)) result.push(failEx(`transcribe_Fabric() - class instance, function - inherited field, mutation`, expected, outcome));
				class B1 { }; obj = new B1; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance, class`, expected, outcome));
				class B2 { constructor() { this.a = 1; } }; obj = new B2; expected = { a: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance, class - inherited field`, expected, outcome));
				class B3 { constructor() { this.a = 1; } }; obj = new B3; outcome = transcribe_Fabric(obj); obj.a = 2; expected = { a: 1 }; if (!testJson(outcome, expected)) result.push(failEx(`transcribe_Fabric() - class instance, class - inherited field, mutation`, expected, outcome));
			}
			//	class instance - own properties
			{
				class C1 { get n() { return 1; } }; obj = new C1; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - own properties: class, { get n() { return 1; } }`, expected, outcome));
				class C2 { }; Object.defineProperty(C2.prototype, "n", { get: () => 1 }); obj = new C2; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - own properties: class, Object.defineProperty`, expected, outcome));
				class C3 { }; Object.defineProperty(C3.prototype, "n", { get: () => 1, enumerable: true }); obj = new C3; expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - own properties: class, Object.defineProperty, enumerable`, expected, outcome));
			}
			//	class instance - inherited properties
			{
				obj = {}; obj2 = { get n() { return 1; } }; Object.setPrototypeOf(obj, obj2); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: setPrototypeOf, { get n() { return 1; } }`, expected, outcome));
				class D1 { get n() { return 1; } }; class D2 extends D1 { }; obj = new D2; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: class, { get n() { return 1; } }`, expected, outcome));
				obj = {}; obj2 = {}; obj2.__defineGetter__("n", () => 1); Object.setPrototypeOf(obj, obj2); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: __defineGetter__("n", () => 1)`, expected, outcome));
				obj = {}; obj2 = {}; Object.defineProperty(obj2, "n", { value: 1 }); Object.setPrototypeOf(obj, obj2); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: defineProperty(obj2, "n", { value: 1 })`, expected, outcome));
				class D3 { }; class D4 extends D3 { }; Object.defineProperty(D3.prototype, "n", { value: 1 }); obj = new D4; expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: class, Object.defineProperty, { get n() { return 1; } }`, expected, outcome));
				obj = {}; obj2 = {}; Object.defineProperty(obj2, "n", { value: 1, enumerable: true }); Object.setPrototypeOf(obj, obj2); expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: defineProperty(obj2, "n", { value: 1, enumerable: true })`, expected, outcome));
				class D5 { }; class D6 extends D5 { }; Object.defineProperty(D5.prototype, "n", { value: 1, enumerable: true }); obj = new D6; expected = { n: 1 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric() - class instance - inherited properties: class, Object.defineProperty, { get n() { return 1; } }, enumerable`, expected, outcome));
			}
			//	array
			{
				obj = []; expected = []; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([])`, expected, outcome));
				obj = [null]; expected = [null]; outcome = transcribe_Fabric(obj); if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([null])`, [null], outcome));
				obj = [void 0]; expected = [void 0]; outcome = transcribe_Fabric(obj); if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([void 0])`, [void 0], outcome));
				obj = [sym]; expected = [sym]; outcome = transcribe_Fabric(obj); if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([Symbol()])`, [void 0], outcome));
				obj = [1]; expected = [1]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1])`, expected, outcome));
				obj = [1, 2]; expected = [1, 2]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, 2])`, expected, outcome));
				obj = [{}]; expected = [{}]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([{}])`, expected, outcome));
				obj = [{}, {}]; expected = [{}, {}]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([{}, {}])`, expected, outcome));
				obj = [{ a: 1 }, { b: 2 }]; expected = [{ a: 1 }, { b: 2 }]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([{ a: 1 }, { b: 2 }])`, expected, outcome));
				obj = [[]]; expected = [[]]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([[]])`, expected, outcome));
				obj = [[], []]; expected = [[], []]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([[], []])`, expected, outcome));
				obj = [[1, 2], [3, 4]]; expected = [[1, 2], [3, 4]]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([[1, 2], [3, 4]])`, expected, outcome));
				obj = [[], [{ a: 1 }, { b: 2 }]]; expected = [[], [{ a: 1 }, { b: 2 }]]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([[], [{ a: 1 }, { b: 2 }]])`, expected, outcome));
			}
			//	graph traversal differentials
			{
				obj = [1, {}]; expected = [1, {}]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, {}])`, expected, outcome));
				obj = [{}, 1]; expected = [{}, 1]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([{}, 1])`, expected, outcome));
				obj = [1, { a: 1 }]; expected = [1, { a: 1 }]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, { a: 1 }])`, expected, outcome));
				obj = [{ a: 1 }, 1]; expected = [{ a: 1 }, 1]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([{ a: 1 }, 1])`, expected, outcome));
				obj = [1, { a: [2] }, 3]; expected = [1, { a: [2] }, 3]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, { a: [2] }, 3])`, expected, outcome));
				obj = [1, { a: [2] }, {}]; expected = [1, { a: [2] }, {}]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, { a: [2] }, {}])`, expected, outcome));
				obj = [1, { a: [2] }, { b: 3 }]; expected = [1, { a: [2] }, { b: 3 }]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, { a: [2] }, { b: 3 }])`, expected, outcome));
				obj = [1, { a: [2] }, 4, { b: 3 }]; expected = [1, { a: [2] }, 4, { b: 3 }]; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric([1, { a: [2] }, 4, { b: 3 }])`, expected, outcome));
			}
			//	MulticastDelegate
			{
				obj = new MulticastDelegate(); expected = obj; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new MulticastDelegate())`, expected, outcome));
				obj = { a: new MulticastDelegate() }; expected = { a: obj.a }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new MulticastDelegate())`, expected, outcome));
			}
			//	proxies
			{
				obj = new Proxy({ a: 1 }, { get(target, prop, receiver) { if (prop === "a") return 2; else return Reflect.get(...arguments); } }); expected = { a: 2 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new Proxy({ a: 1 }, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
				class E1 { get n() { return 1; } }; obj = new Proxy(new E1, { get(target, prop, receiver) { if (prop === "n") return 2; else return Reflect.get(...arguments); } }); expected = {}; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new Proxy(new E1, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
				class E2 { }; Object.defineProperty(E2.prototype, "n", { get: () => 1, enumerable: true }); obj = new Proxy(new E2, { get(target, prop, receiver) { if (prop === "n") return 2; else return Reflect.get(...arguments); } }); expected = { n: 2 }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric(new Proxy(new E2, { get(target, prop, receiver) { return 2; } }))`, expected, outcome));
			}
			//	prototype pollution
			{
				obj = { __proto__: { polluted: true } }; expected = { polluted: true }; if (!testJson(outcome = transcribe_Fabric(obj), expected)) result.push(failEx(`transcribe_Fabric({ __proto__: { polluted: true } }) (1)`, expected, outcome));
				obj = { __proto__: { polluted: true } }; transcribe_Fabric(obj); if (new Object().polluted) result.push(failEx(`transcribe_Fabric({ __proto__: { polluted: true } }) (2)`, false, true));
			}
			//	circular references
			{
				obj = {}; obj2 = {}; obj.a1 = obj2; obj2.a2 = obj; expected = `{ "a1": { "a2": &Object@0 } }`; if (!testLiteral(outcome = Diagnostics.format(transcribe_Fabric(obj)), expected)) result.push(failEx(`transcribe_Fabric - circular reference 1`, expected, outcome));
				obj = { n1: 1 }; obj2 = { n2: 2 }; obj.a1 = obj2; obj2.a2 = obj; expected = `{ "n1": 1, "a1": { "n2": 2, "a2": &Object@0 } }`; if (!testLiteral(outcome = Diagnostics.format(transcribe_Fabric(obj)), expected)) result.push(failEx(`transcribe_Fabric - circular reference 2`, expected, outcome));
				obj = { n: 1 }; obj.a = obj; expected = `{ "n": 1, "a": &Object@0 }`; if (!testLiteral(outcome = Diagnostics.format(transcribe_Fabric(obj)), expected)) result.push(failEx(`transcribe_Fabric - circular reference 3`, expected, outcome));
				obj = { n1: { r1: 2 } }; obj2 = { n2: { r2: 2 } }; obj.a1 = obj2; obj2.a2 = obj; expected = `{ "n1": { "r1": 2 }, "a1": { "n2": { "r2": 2 }, "a2": &Object@0 } }`; if (!testLiteral(outcome = Diagnostics.format(transcribe_Fabric(obj)), expected)) result.push(failEx(`transcribe_Fabric - circular reference 4`, expected, outcome));
			}
		}

		//	NativeGraph.Visitors.select, Fabric
		function test_NativeGraph_Visitors_select_Fabric()
		{
			let labelDefs, inverted;

			function select_Fabric(value)
			{
				return Fabric.the.walk(NativeGraph.Visitors.select, { labelDefs, labelDefsType: Type.isArray(labelDefs) ? Type.Array : Type.isCallable(labelDefs) ? Type.Callable : null, inverted, fabric: Fabric.the, target: void 0, visited: buf() }, value).target;
			}

			//	general
			{
				obj = void 0; labelDefs = []; inverted = false; 
				expected = void 0;
				if (!testLiteral(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 001.001`, expected, outcome));

				obj = {}; labelDefs = []; inverted = false;
				expected = {};
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 001.002`, expected, outcome));

				obj = { a: 1 }; labelDefs = "a"; inverted = false;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 001.003`, expected, outcome));

				obj = [1]; labelDefs = 0; inverted = false;
				expected = [1];
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 001.004`, expected, outcome));
			}
			//	object
			{
				obj = { a: 1 }; labelDefs = []; inverted = false;
				expected = {};
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.003.001`, expected, outcome));

				obj = { a: 1 }; labelDefs = []; inverted = true;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.003.002`, expected, outcome));

				obj = { a: 1, b: 2 }; labelDefs = []; inverted = false;
				expected = {};
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.004.001`, expected, outcome));

				obj = { a: 1, b: 2 }; labelDefs = []; inverted = true;
				expected = { a: 1, b: 2 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.004.002`, expected, outcome));

				obj = { a: 1, b: 2 }; labelDefs = ["a"]; inverted = false;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.005.001`, expected, outcome));

				obj = { a: 1, b: 2 }; labelDefs = ["a"]; inverted = true;
				expected = { b: 2 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.005.002`, expected, outcome));

				obj = { a: { b: 2 } }; labelDefs = ["a"]; inverted = false;
				expected = { a: {} };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.006.001`, expected, outcome));

				obj = { a: { b: 2 } }; labelDefs = ["a"]; inverted = true;
				expected = { };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 002.006.002`, expected, outcome));
			}
			//	array
			{
				obj = [1]; labelDefs = []; inverted = false;
				expected = `[...(empty)]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.003.001`, expected, outcome));

				obj = [1]; labelDefs = []; inverted = true;
				expected = `[1]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.003.002`, expected, outcome));

				obj = [1, 2]; labelDefs = []; inverted = false;
				expected = `[...(2x empty)]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.004.001`, expected, outcome));

				obj = [1, 2]; labelDefs = []; inverted = true;
				expected = `[1, 2]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.004.002`, expected, outcome));

				obj = [1, 2]; labelDefs = [0]; inverted = false;
				expected = `[1, ...(empty)]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.005.001`, expected, outcome));

				obj = [1, 2]; labelDefs = [0]; inverted = true;
				expected = `[...(empty), 2]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.005.002`, expected, outcome));

				obj = [[1], [2]]; labelDefs = [0]; inverted = false;
				expected = `[[1], ...(empty)]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.006.002`, expected, outcome));

				obj = [[1], [2]]; labelDefs = [0]; inverted = true;
				expected = `[...(empty), [...(empty)]]`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failText(`select_Fabric 003.006.002`, expected, outcome));
			}
			//	function
			{
				obj = { a: 1 }; labelDefs = label => label === "a"; inverted = false;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.001.001`, expected, outcome));

				obj = { a: 1 }; labelDefs = label => label === "a"; inverted = true;
				expected = { };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.001.002`, expected, outcome));

				obj = { a: 1 }; labelDefs = [label => label === "a"]; inverted = false;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.001.003`, expected, outcome));

				obj = { a: 1 }; labelDefs = [label => label === "a"]; inverted = true;
				expected = {};
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.001.004`, expected, outcome));

				obj = { a: 1 }; labelDefs = label => label !== "a"; inverted = false;
				expected = {};
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.002.001`, expected, outcome));

				obj = { a: 1 }; labelDefs = label => label !== "a"; inverted = true;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.002.002`, expected, outcome));

				obj = { a: 1 }; labelDefs = [label => label !== "a"]; inverted = false;
				expected = {};
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.002.003`, expected, outcome));

				obj = { a: 1 }; labelDefs = [label => label !== "a"]; inverted = true;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.003.004`, expected, outcome));

				obj = { a: 1, b: 2 }; labelDefs = (label, head) => head === 1; inverted = false;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.003.005`, expected, outcome));

				obj = { a: 1, b: 2 }; labelDefs = [(label, head) => head === 1]; inverted = false;
				expected = { a: 1 };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.003.006`, expected, outcome));

				obj = { a: { b: 2 } }; labelDefs = ["a", label => label === "b"]; inverted = false;
				expected = { a: { b: 2 } };
				if (!testJson(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 004.004.001`, expected, outcome));
			}
			//	circular reference
			{
				let obj2;

				obj2 = { a: null, b: 1 }; obj = { c: obj2, d: 2 }; obj2.a = obj; labelDefs = ["a", "c"]; inverted = false;
				expected = `{ "c": { "a": &Object@0 } }`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 005.001.001`, expected, outcome));

				obj2 = { a: null, b: 1 }; obj = { c: obj2, d: 2 }; obj2.a = obj; labelDefs = ["a", "c"]; inverted = true;
				expected = `{ "d": 2 }`;
				if (!testJsonText(outcome = select_Fabric(obj), expected)) result.push(failEx(`select_Fabric 005.001.002`, expected, outcome));
			}
		}

		function test_withBigIntLiteral()
		{
			function REVAL(code)
			{
				const f = new Function("result", "obj", "outcome", "failEx", "testLiteral", "NativeGraph", code);
				f(result, obj, outcome, fail, testLiteral, NativeGraph);
			}

			REVAL(`
			//	from validate_JSON_stringify()
			obj = 0n; try { JSON.stringify(obj); result.push(failEx("JSON.stringify(0n)", null, outcome)); } catch (ex) { }
			`)
		}
	}
}

module.exports.UnitTests_NativeGraph = module.exports;
