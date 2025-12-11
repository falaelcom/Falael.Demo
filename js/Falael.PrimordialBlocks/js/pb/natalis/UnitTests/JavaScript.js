//	R0Q2/daniel/20220505
"use strict";

const GeneratorFunction = Object.getPrototypeOf(function* () { }).constructor;
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () { }).constructor;
const createIterator = function* () { };

module.exports =

class UnitTests_JavaScript
{
	//	Category: Unit test
	//	Function: Unit tests for the built-in `String()` serialization.
	static unitTest_String(result)
	{
		const test = (outcome, expected, testName) => { if (outcome !== expected) result.push({ testName, outcome, expected }) };

		test(String(void 0), "undefined", "String(void 0)");
		test(String(undefined), "undefined", "String(undefined)");
		test(String(null), "null", "String(null)");
		test(String(NaN), "NaN", "String(NaN)");
		test(String(true), "true", "String(true)");
		test(String(false), "false", "String(false)");
		test(String(Boolean()), "false", "String(Boolean())");
		test(String(new Boolean()), "false", "String(new Boolean())");
		test(String(""), ``, `String("")`);
		test(String(String()), ``, `String(String())`);
		test(String(new String()), ``, `String(new String())`);
		test(String("a"), `a`, `String("a")`);
		test(String(0), `0`, `String(0)`);
		test(String(1), `1`, `String(1)`);
		test(String(-1), `-1`, `String(-1)`);
		test(String(0.1), `0.1`, `String(0.1)`);
		test(String(-0.1), `-0.1`, `String(-0.1)`);
		test(String(Number()), `0`, `String(Number())`);
		test(String(new Number()), `0`, `String(new Number())`);
		test(String(Infinity), `Infinity`, `String(Infinity)`);
		test(String(Number.POSITIVE_INFINITY), `Infinity`, `String(Number.POSITIVE_INFINITY)`);
		test(String(-Infinity), `-Infinity`, `String(-Infinity)`);
		test(String(Number.NEGATIVE_INFINITY), `-Infinity`, `String(Number.NEGATIVE_INFINITY)`);
		test(String(Number.MAX_VALUE), `1.7976931348623157e+308`, `String(Number.MAX_VALUE)`);
		test(String(Number.MAX_SAFE_INTEGER), `9007199254740991`, `String(Number.MAX_SAFE_INTEGER)`);
		test(String(Number.MIN_VALUE), `5e-324`, `String(Number.MIN_VALUE)`);
		test(String(Number.MIN_SAFE_INTEGER), `-9007199254740991`, `String(Number.MIN_SAFE_INTEGER)`);
		test(String(Number.EPSILON), `2.220446049250313e-16`, `String(Number.EPSILON)`);
		test(String([]), ``, `String([])`);
		test(String([0]), `0`, `String([0])`);
		test(String([0, 1]), `0,1`, `String([0, 1])`);
		test(String(Array()), ``, `String(Array())`);
		test(String(Array([0])), `0`, `String(Array([0]))`);
		test(String(Array([0, 1])), `0,1`, `String(Array([0, 1]))`);
		test(String(new Array()), ``, `String(new Array())`);
		test(String(new Array([0])), `0`, `String(new Array(0))`);
		test(String(new Array([0, 1])), `0,1`, `String(new Array(0, 1))`);
		test(String(JSON.parse("[]")), ``, `String("[]")`);
		test(String(JSON.parse("[0]")), `0`, `String("[0]")`);
		test(String(JSON.parse("[0, 1]")), `0,1`, `String("[0, 1]")`);
		test(String({}), `[object Object]`, `String({})`);
		test(String(Object()), `[object Object]`, `String(Object())`);
		test(String(new Object()), `[object Object]`, `String(new Object())`);
		test(String(new Proxy({}, {})), `[object Object]`, `String(new Proxy({}, {}))`);
		try
		{
			String(Object.create(null));
			result.push({ testName: `String(Object.create(null))` });
		}
		catch (ex) { }
		test(String(JSON.parse("{}")), `[object Object]`, `String("{}")`);
		test(String(JSON), `[object JSON]`, `String(JSON)`);
		test(String(Math), `[object Math]`, `String(Math)`);
		if (global.Atomics) test(String(Atomics), `[object Atomics]`, `String(Atomics)`);
		if (global.Intl) test(String(Intl), `[object Intl]`, `String(Intl)`);
		if (global.WebAssembly) test(String(WebAssembly), `[object WebAssembly]`, `String(WebAssembly)`);
		test(String(Reflect), `[object Reflect]`, `String(Reflect)`);
		(function (...args)
		{
			test(String(arguments), `[object Arguments]`, `String(arguments)`);
			test(String(args), `1,a,true`, `String(args)`);
		})(1, "a", true);
		test(
			String([0, "a", "", "\"'`\r\n\t\b\f\v\0\x00\x01\x0a\u0001\u{b}", true, null, void 0, {}, [0, 1], NaN]),
			'0,a,,"\'`\r\n\t\b\f\v\x00\x00\x01\n\x01\v,true,,,[object Object],0,1,NaN',
			`String([0, "a", "", "\\"\\'\`\r\n\t\b\f\v\0\x00\x01\x0a\u0001\u{b}", true, null, void 0, {}, [0, 1], NaN])`);
		test(String(Symbol()), `Symbol()`, `String(Symbol())`);
		test(String(Symbol("a")), `Symbol(a)`, `String(Symbol("a"))`);
		test(String(Symbol(/a/gi)), `Symbol(/a/gi)`, `String(/a/gi)`);
		test(String(/a/gi), `/a/gi`, `String(/a/gi)`);
		test(String(RegExp()), `/(?:)/`, `String(RegExp())`);
		test(String(new RegExp()), `/(?:)/`, `String(new RegExp())`);
		//	-- moved to test_withBigIntLiteral()
		//test(String(0n), "0", "String(0n)");
		//test(String(BigInt(0)), "0", "String(BigInt(0))");
		//test(String(1n), "1", "String(1n)");
		test(String(new Int8Array()), ``, `String(new Int8Array())`);
		test(String(new Int8Array([1, 2, 3])), `1,2,3`, `String(new Int8Array([1, 2, 3]))`);
		test(String(new ArrayBuffer()), `[object ArrayBuffer]`, `String(new ArrayBuffer())`);
		test(String(new DataView(new ArrayBuffer())), `[object DataView]`, `String(new DataView(new ArrayBuffer()))`);
		test(String(() => { }), `() => { }`, `String(() => { })`);
		test(String(a => a), `a => a`, `String(a => a)`);
		test(String((a) => true), `(a) => true`, `String((a) => true)`);
		test(String(function name() { }), `function name() { }`, `String(function name() { })`);
		test(String(function* name() { }), `function* name() { }`, `String(function* name() { })`);
		test(String(async function name() { }), `async function name() { }`, `String(async function name() { })`);
		try //	due to react native
		{
			test(String(async function* name() { }), `async function* name() { }`, `String(async function* name() { })`);
		}
		catch (ex)
		{
			result.push({ testName: `String(async function* name() { })`, ex });
		}
		test(String(Function()), 'function anonymous(\n) {\n\n}', `String(Function())`);
		test(String(new Function()), 'function anonymous(\n) {\n\n}', `String(new Function())`);
		try //	due to react native
		{
			test(String(new GeneratorFunction()), 'function* anonymous(\n) {\n\n}', `String(new GeneratorFunction())`);
		}
		catch (ex)
		{
			result.push({ testName: `String(new GeneratorFunction())`, ex });
		}
		test(String(new AsyncFunction()), 'async function anonymous(\n) {\n\n}', `String(new AsyncFunction())`);
		try //	due to react native
		{
			test(String(new AsyncGeneratorFunction()), 'async function* anonymous(\n) {\n\n}', `String(new AsyncGeneratorFunction())`);
		}
		catch (ex)
		{
			result.push({ testName: `String(new AsyncGeneratorFunction())`, ex });
		}
		test(String(new Promise(() => true)), `[object Promise]`, `String(new Promise(() => true))`);
		try //	due to react native
		{
			test(String(createIterator()), `[object Generator]`, `String(generatorFunction())`);
		}
		catch (ex)
		{
			result.push({ testName: `String(generatorFunction())`, ex });
		}
		test(String(Error()), `Error`, `String(Error())`);
		test(String(Error("a")), `Error: a`, `String(Error("a"))`);
		test(String(new Error()), `Error`, `String(new Error())`);
		test(String(new Error("a")), `Error: a`, `String(new Error("a"))`);
		test(String(new Map()), `[object Map]`, `String(new Map())`);
		test(String(new Set()), `[object Set]`, `String(new Set())`);
		test(String(new WeakMap()), `[object WeakMap]`, `String(new WeakMap())`);
		test(String(new WeakSet()), `[object WeakSet]`, `String(new WeakSet())`);
		test(String(new (class C { })), `[object Object]`, `String(new (class C { }))`);
		test(String(new Proxy(new (class C { }), {})), `[object Object]`, `String(new Proxy(new (class C { }), {}))`);
		test(String(class C { }), `class C { }`, `String(class C { })`);
		test(String(class C { a() { } }), `class C { a() { } }`, `String(class C { a() { } })`);

		if (global.BigInt) test_withBigIntLiteral();

		function test_withBigIntLiteral()
		{
			function REVAL(code)
			{
				const f = new Function("result", "test", code);
				f(result, test);
			}

			REVAL(`

			test(String(0n), "0", "String(0n)");
			test(String(BigInt(0)), "0", "String(BigInt(0))");
			test(String(1n), "1", "String(1n)");

			`)
		}
	}

	//	Category: Unit test
	//	Function: Unit tests for selected static and instance methofd of the built-in `Object`.
	static unitTest_Object(result)
	{
		const fail = (testName) => ({ testName });

		test_Object_hasOwnProperty_regular();
		test_Object_hasOwnProperty_exceptions();

		//	Object.prototype.hasOwnProperty - regular flows
		function test_Object_hasOwnProperty_regular(...args)
		{
			if (Object.prototype.hasOwnProperty.call(Symbol(), 0)) result.push(fail(`Object.prototype.hasOwnProperty.call(Symbol(), 0)`));
			if (Object.prototype.hasOwnProperty.call(Symbol(), "")) result.push(fail(`Object.prototype.hasOwnProperty.call(Symbol(), "")`));
			if (Object.prototype.hasOwnProperty.call(Symbol(), "description")) result.push(fail(`Object.prototype.hasOwnProperty.call(Symbol(), "description")`));
			if (Object.prototype.hasOwnProperty.call(Symbol(""), "description")) result.push(fail(`Object.prototype.hasOwnProperty.call(Symbol(""), "description")`));

			if (Object.prototype.hasOwnProperty.call(/a/gi, 0)) result.push(fail(`Object.prototype.hasOwnProperty.call(/a/gi, 0)`));
			if (Object.prototype.hasOwnProperty.call(/a/gi, "")) result.push(fail(`Object.prototype.hasOwnProperty.call(/a/gi, "")`));
			if (Object.prototype.hasOwnProperty.call(/a/gi, "global")) result.push(fail(`Object.prototype.hasOwnProperty.call(/a/gi, "global")`));
			if (Object.prototype.hasOwnProperty.call(new RegExp(), 0)) result.push(fail(`Object.prototype.hasOwnProperty.call(new RegExp(), 0)`));
			if (Object.prototype.hasOwnProperty.call(new RegExp(), "")) result.push(fail(`Object.prototype.hasOwnProperty.call(new RegExp(), "")`));
			if (Object.prototype.hasOwnProperty.call(new RegExp(), "global")) result.push(fail(`Object.prototype.hasOwnProperty.call(new RegExp(), "global")`));

			if (Object.prototype.hasOwnProperty.call(Error(), 0)) result.push(fail(`Object.prototype.hasOwnProperty.call(Error(), 0)`));
			if (Object.prototype.hasOwnProperty.call(Error(), "")) result.push(fail(`Object.prototype.hasOwnProperty.call(Error(), "")`));
			if (Object.prototype.hasOwnProperty.call(Error(), "name")) result.push(fail(`Object.prototype.hasOwnProperty.call(Error(), "name")`));
			if (Object.prototype.hasOwnProperty.call(Error(), "message")) result.push(fail(`Object.prototype.hasOwnProperty.call(Error(), "message")`));
			if (!Object.prototype.hasOwnProperty.call(Error("test"), "message")) result.push(fail(`Object.prototype.hasOwnProperty.call(Error("test"), "message")`));

			if (Object.prototype.hasOwnProperty.call({}, 0)) result.push(fail(`Object.prototype.hasOwnProperty.call({}, 0)`));
			if (Object.prototype.hasOwnProperty.call({}, "a")) result.push(fail(`Object.prototype.hasOwnProperty.call({}, "a")`));
			if (!Object.prototype.hasOwnProperty.call({ a: void 0 }, "a")) result.push(fail(`Object.prototype.hasOwnProperty.call({ a: void 0 }, "a")`));
			if (!Object.prototype.hasOwnProperty.call({ a: "" }, "a")) result.push(fail(`Object.prototype.hasOwnProperty.call({ a: "" }, "a")`));
			if (!Object.prototype.hasOwnProperty.call({ get a() { return void 0; } }, "a")) result.push(fail(`Object.prototype.hasOwnProperty.call({ get a() { return void 0; } }, "a")`));
			if (!Object.prototype.hasOwnProperty.call({ get a() { return 1; } }, "a")) result.push(fail(`Object.prototype.hasOwnProperty.call({ get a() { return 1; } }, "a")`));
			if (!Object.prototype.hasOwnProperty.call({ a() { } }, "a")) result.push(fail(`Object.prototype.hasOwnProperty.call({ a() { } }, "a")`));
		}

		//	Object.prototype.hasOwnProperty - exceptional flows
		function test_Object_hasOwnProperty_exceptions(...args)
		{
			try
			{
				if (Object.prototype.hasOwnProperty.call(null, "")) result.push(fail(`Object.prototype.hasOwnProperty.call(null, "") (1)`));
				result.push(fail(`Object.prototype.hasOwnProperty.call(null, "") (2)`));
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") result.push(fail(`Object.prototype.hasOwnProperty.call(null, "") (3)`));
			}

			try
			{
				if (Object.prototype.hasOwnProperty.call(null, 1)) result.push(fail(`Object.prototype.hasOwnProperty.call(null, 1) (1)`));
				result.push(fail(`Object.prototype.hasOwnProperty.call(null, 1) (2)`));
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") result.push(fail(`Object.prototype.hasOwnProperty.call(null, 1) (3)`));
			}

			try
			{
				if (Object.prototype.hasOwnProperty.call(void 0, "")) result.push(fail(`Object.prototype.hasOwnProperty.call(void 0, "") (1)`));
				result.push(fail(`Object.prototype.hasOwnProperty.call(void 0, "") (2)`));
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") result.push(fail(`Object.prototype.hasOwnProperty.call(void 0, "") (3)`));
			}

			try
			{
				if (Object.prototype.hasOwnProperty.call(void 0, 1)) result.push(fail(`Object.prototype.hasOwnProperty.call(void 0, 1) (1)`));
				result.push(fail(`Object.prototype.hasOwnProperty.call(void 0, 1) (2)`));
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") result.push(fail(`Object.prototype.hasOwnProperty.call(void 0, 1) (3)`));
			}
		}

	}

	//	Category: Unit test
	//	Function: Unit tests for the built-in `Proxy` feature.
	static unitTest_Proxy(result)
	{
		let testName;
		const fail = () => result.push({ testName });

		test_Proxy_applicability_OK();
		test_Proxy_applicability_FAIL();

		function test_Proxy_applicability_OK(...args)
		{
			testName = `new Proxy(new Proxy({}, {}), {})`;
			try
			{
				new Proxy(new Proxy({}, {}), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Boolean(), {})`;
			try
			{
				new Proxy(new Boolean(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(Object(true), {})`;
			try
			{
				new Proxy(Object(true), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Object(true), {})`;
			try
			{
				new Proxy(new Object(true), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Object(Symbol()), {})`;
			try
			{
				new Proxy(new Object(Symbol()), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new String(), {})`;
			try
			{
				new Proxy(new String(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(/a/gi, {})`;
			try
			{
				new Proxy(/a/gi, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(RegExp(), {})`;
			try
			{
				new Proxy(RegExp(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new RegExp(), {})`;
			try
			{
				new Proxy(new RegExp(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Number(), {})`;
			try
			{
				new Proxy(new Number(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy({}, {})`;
			try
			{
				new Proxy({}, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(Object(), {})`;
			try
			{
				new Proxy(Object(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Object(), {})`;
			try
			{
				new Proxy(new Object(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new (class { }), {})`;
			try
			{
				new Proxy(new (class { }), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(Object.create(null), {})`;
			try
			{
				new Proxy(Object.create(null), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy([], {})`;
			try
			{
				new Proxy([], {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(Array(), {})`;
			try
			{
				new Proxy(Array(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Array(), {})`;
			try
			{
				new Proxy(new Array(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(arguments, {})`;
			try
			{
				new Proxy(arguments, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(args, {})`;
			try
			{
				new Proxy(args, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new ArrayBuffer(), {})`;
			try
			{
				new Proxy(new ArrayBuffer(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new DataView(new ArrayBuffer()), {})`;
			try
			{
				new Proxy(new DataView(new ArrayBuffer()), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Int8Array(), {})`;
			try
			{
				new Proxy(new Int8Array(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Map(), {})`;
			try
			{
				new Proxy(new Map(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(class { }, {})`;
			try
			{
				new Proxy(class { }, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(() => { }, {})`;
			try
			{
				new Proxy(() => { }, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(async () => { }, {})`;
			try
			{
				new Proxy(async () => { }, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(function* () { }, {})`;
			try
			{
				new Proxy(function* () { }, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(async function* ()  { }, {})`;
			try
			{
				new Proxy(async function* () { }, {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(createIterator(), {})`;
			try
			{
				new Proxy(createIterator(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Promise(() => true), {})`;
			try
			{
				new Proxy(new Promise(() => true), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(Error()), {})`;
			try
			{
				new Proxy(Error(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Error()), {})`;
			try
			{
				new Proxy(new Error(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}

			testName = `new Proxy(new Date()), {})`;
			try
			{
				new Proxy(new Date(), {});
			}
			catch (ex)
			{
				fail(`${testName}`);
			}
		}

		function test_Proxy_applicability_FAIL(...args)
		{
			testName = `new Proxy(void 0, {})`;
			try
			{
				new Proxy(void 0, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(null, {})`;
			try
			{
				new Proxy(null, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(undefined, {})`;
			try
			{
				new Proxy(undefined, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(NaN, {})`;
			try
			{
				new Proxy(NaN, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(true, {})`;
			try
			{
				new Proxy(true, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(Boolean(), {})`;
			try
			{
				new Proxy(Boolean(), {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(Symbol(), {})`;
			try
			{
				new Proxy(Symbol(), {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy("", {})`;
			try
			{
				new Proxy("", {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(String(), {})`;
			try
			{
				new Proxy(String(), {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(0, {})`;
			try
			{
				new Proxy(0, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(Number(), {})`;
			try
			{
				new Proxy(Number(), {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}

			testName = `new Proxy(Infinity, {})`;
			try
			{
				new Proxy(Infinity, {});
				fail(`${testName} (1)`);
			}
			catch (ex)
			{
				if (ex.name !== "TypeError") fail(`${testName} (2)`);
			}
		}

	}
}

module.exports.UnitTests_String = module.exports;
