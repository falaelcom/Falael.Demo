//	R0Q2/daniel/20220608
"use strict";

const { Diagnostics, Verbatim } = require("-/pb/natalis/001/Diagnostics.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");
const {
	cost, carr, cbuf, buf,
	CompoundStructure, CompoundArray, CompoundBuf, Buf,
} = require("-/pb/natalis/013/Compound.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0x523EBA = tunable(0x523EBA);

module.exports =

class UnitTests_Diagnostics
{
	//	Category: Unit test
	//	Function: Run unit tests for `Diagnostics` class.
	static unitTest_Diagnostics(result)
	{
		const test = (outcome, testName) => { if (outcome !== expected) result.push({ testName, outcome, expected }) };

		let expected, subject, cyclic, cyclic2;

		test_Diagnostics_format();

		function test_Diagnostics_format(...args)
		{
			expected = `void 0`; test(Diagnostics.format(), "Diagnostics.format (01.01)");
			expected = `void 0`; subject = void 0; test(Diagnostics.format(subject), "Diagnostics.format (01.02)");
			expected = `null`; subject = null; test(Diagnostics.format(subject), "Diagnostics.format (01.03)");
			expected = `0`; subject = 0; test(Diagnostics.format(subject), "Diagnostics.format (01.04)");
			expected = `1`; subject = 1; test(Diagnostics.format(subject), "Diagnostics.format (01.05)");
			expected = `true`; subject = true; test(Diagnostics.format(subject), "Diagnostics.format (01.06)");
			expected = `false`; subject = false; test(Diagnostics.format(subject), "Diagnostics.format (01.07)");
			expected = `""`; subject = ""; test(Diagnostics.format(subject), "Diagnostics.format (01.08)");
			expected = `"a"`; subject = "a"; test(Diagnostics.format(subject), "Diagnostics.format (01.09)");
			expected = `NaN`; subject = 0 / 0; test(Diagnostics.format(subject), "Diagnostics.format (01.10)");
			expected = `\\1901-01-31T22:58:57.001Z`; subject = new Date(1, 1, 1, 1, 1, 1, 1); test(Diagnostics.format(subject), "Diagnostics.format (01.11)");
			expected = `<>`; subject = Symbol(); test(Diagnostics.format(subject), "Diagnostics.format (01.121)");
			expected = `<symbol>`; subject = Symbol("symbol"); test(Diagnostics.format(subject), "Diagnostics.format (01.122)");
			expected = `/(?:)/`; subject = new RegExp(); test(Diagnostics.format(subject), "Diagnostics.format (01.13)");
			expected = `() => { }`; subject = () => { }; test(Diagnostics.format(subject), "Diagnostics.format (01.14)");
			expected = `function () { }`; subject = function () { }; test(Diagnostics.format(subject), "Diagnostics.format (01.15)");
			expected = `&Iterator`; subject = (function* () { yield 1 })(); test(Diagnostics.format(subject), "Diagnostics.format (01.16)");
			expected = `&Promise`; subject = (async function () { })(); test(Diagnostics.format(subject), "Diagnostics.format (01.17)");
			expected = `&WeakMap`; subject = new WeakMap(); test(Diagnostics.format(subject), "Diagnostics.format (01.18)");
			expected = `&WeakSet`; subject = new WeakSet(); test(Diagnostics.format(subject), "Diagnostics.format (01.19)");
			expected = `&ArrayBuffer(0)`; subject = new ArrayBuffer(); test(Diagnostics.format(subject), "Diagnostics.format (01.20)");
			expected = `&DataView(0)`; subject = new DataView(new ArrayBuffer()); test(Diagnostics.format(subject), "Diagnostics.format (01.21)");
			expected = `&Int8Array(0)`; subject = new Int8Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.22)");
			expected = `&Uint8Array(0)`; subject = new Uint8Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.23)");
			expected = `&Uint8ClampedArray(0)`; subject = new Uint8ClampedArray(); test(Diagnostics.format(subject), "Diagnostics.format (01.24)");
			expected = `&Int16Array(0)`; subject = new Int16Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.25)");
			expected = `&Uint16Array(0)`; subject = new Uint16Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.26)");
			expected = `&Int32Array(0)`; subject = new Int32Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.27)");
			expected = `&Uint32Array(0)`; subject = new Uint32Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.28)");
			expected = `&Float32Array(0)`; subject = new Float32Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.29)");
			expected = `&Float64Array(0)`; subject = new Float64Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.30)");
			if (global.BigInt64Array) { expected = `&BigInt64Array(0)`; subject = new BigInt64Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.31)"); }
			if (global.BigUint64Array) { expected = `&BigUint64Array(0)`; subject = new BigUint64Array(); test(Diagnostics.format(subject), "Diagnostics.format (01.32)"); }
			expected = `[]`; subject = args; test(Diagnostics.format(subject), "Diagnostics.format (01.33)");
			
			expected = `[]`; subject = []; test(Diagnostics.format(subject), "Diagnostics.format (02.01)");
			expected = `&/A[]`; subject = new (class A extends Array { })(); test(Diagnostics.format(subject), "Diagnostics.format (02.011)");
			expected = `&/A[]`; subject = new (class A extends class B extends Array { } { })(); test(Diagnostics.format(subject), "Diagnostics.format (02.012)");
			expected = `&/B/A[]`; subject = new (class A extends class B extends Array { } { })(); test(Diagnostics.format(subject, { verbose: true }), "Diagnostics.format (02.013)");
			expected = `[1]`; subject = [1]; test(Diagnostics.format(subject), "Diagnostics.format (02.02)");
			expected = `[1, 2]`; subject = [1, 2]; test(Diagnostics.format(subject), "Diagnostics.format (02.03)");
			expected = `[1, "a"]`; subject = [1, "a"]; test(Diagnostics.format(subject), "Diagnostics.format (02.04)");
			expected = `[[]]`; subject = [[]]; test(Diagnostics.format(subject), "Diagnostics.format (02.05)");
			expected = `[[], []]`; subject = [[], []]; test(Diagnostics.format(subject), "Diagnostics.format (02.06)");
			expected = `[1, []]`; subject = [1, []]; test(Diagnostics.format(subject), "Diagnostics.format (02.07)");
			expected = `[1, [2]]`; subject = [1, [2]]; test(Diagnostics.format(subject), "Diagnostics.format (02.08)");
			expected = `[]`; subject = new Array(); test(Diagnostics.format(subject), "Diagnostics.format (02.09)");
			expected = `[...(5x empty)]`; subject = new Array(5); test(Diagnostics.format(subject), "Diagnostics.format (02.10)");
			expected = `[...(5x empty), 1]`; subject = []; subject[5] = 1; test(Diagnostics.format(subject), "Diagnostics.format (02.10)");
			expected = `[1.1: 2]`; subject = []; subject[1.1] = 2; test(Diagnostics.format(subject), "Diagnostics.format (02.11)");
			expected = `[1, -1: 2]`; subject = []; subject[-1] = 2; subject[0] = 1; test(Diagnostics.format(subject), "Diagnostics.format (02.111)");
			expected = `[<symbol>: 2]`; subject = []; subject[Symbol("symbol")] = 2; test(Diagnostics.format(subject), "Diagnostics.format (02.12)");
			expected = `[1, <symbol>: 2]`; subject = [1]; subject[Symbol("symbol")] = 2; test(Diagnostics.format(subject), "Diagnostics.format (02.13)");
			expected = `[1, <symbol>: 2, <symbol2>: 3]`; subject = [1]; subject[Symbol("symbol")] = 2; subject[Symbol("symbol2")] = 3; test(Diagnostics.format(subject), "Diagnostics.format (02.131)");
			expected = `[1, ...(99x empty), 2]`; subject = [1]; subject[100] = 2; test(Diagnostics.format(subject), "Diagnostics.format (02.14)");
			expected = `[1, ...(9x empty), 2, ...(89x empty), 3]`; subject = [1]; subject[10] = 2; subject[100] = 3; test(Diagnostics.format(subject), "Diagnostics.format (02.15)");
			expected = `[...(10x empty), 2, ...(89x empty), 3, ...(empty)]`; subject = new Array(102); subject[10] = 2; subject[100] = 3; test(Diagnostics.format(subject), "Diagnostics.format (02.16)");
			expected = `[1, ...(9x empty), 4, "a": 2, "b": 3, <symbol>: 5]`; subject = [1]; subject["a"] = 2; subject.b = 3; subject[10] = 4; subject[Symbol("symbol")] = 5; test(Diagnostics.format(subject), "Diagnostics.format (02.17)");
			expected = `&/C["a"]`; subject = new (class C extends Array { })("a"); test(Diagnostics.format(subject), "Diagnostics.format (02.018)");
			expected = `&/C2[&/C1[...(5x empty), &/C2@0]]`; cyclic = new (class C1 extends Array { }); subject = new (class C2 extends Array { })(cyclic); cyclic[5] = subject; test(Diagnostics.format(subject), "Diagnostics.format (02.019)");
			expected = `[1, [...(5x empty), &Array@0]]`; cyclic = []; subject = [1, cyclic]; cyclic[5] = subject;  test(Diagnostics.format(subject), "Diagnostics.format (02.020)"); 
			expected = `[[[&Array@1]]]`; cyclic = []; cyclic2 = [cyclic]; subject = [cyclic]; cyclic[0] = cyclic2; test(Diagnostics.format(subject), "Diagnostics.format (02.021)"); 
			expected = `[&Array@0]`; subject = []; subject[0] = subject; test(Diagnostics.format(subject), "Diagnostics.format (02.022)"); 
			expected = `[...(1000000000x empty), 1]`; subject = []; subject[1000000000] = 1; test(Diagnostics.format(subject), "Diagnostics.format (02.023)");

			const ct1 = Symbol(), ct2 = Symbol("symbol");
			expected = `&cost<>[]`; subject = cost(ct1); test(Diagnostics.format(subject), "Diagnostics.format (102.011)");
			expected = `&cost<symbol>[]`; subject = cost(ct2); test(Diagnostics.format(subject), "Diagnostics.format (102.012)");
			expected = `&cost<symbol>[...(empty)]`; subject = cost(ct2, 1); test(Diagnostics.format(subject), "Diagnostics.format (102.013)");
			expected = `&cost<symbol>[...(2x empty)]`; subject = cost(ct2, 2); test(Diagnostics.format(subject), "Diagnostics.format (102.014)");
			expected = `&cost<symbol>[1, ...(empty)]`; subject = cost(ct2, 2); subject[CompoundStructure.LowerBound] = 1; test(Diagnostics.format(subject), "Diagnostics.format (102.015)");
			expected = `&cost<symbol>[...(empty), 1]`; subject = cost(ct2, 2); subject[CompoundStructure.LowerBound + 1] = 1; test(Diagnostics.format(subject), "Diagnostics.format (102.016)");
			expected = `&cost<>[...(empty), &cost<>@0]`; subject = cost(ct1, 2); subject[CompoundStructure.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (102.017)");
			expected = `&cost<symbol>[...(empty), &cost<symbol>@0]`; subject = cost(ct2, 2); subject[CompoundStructure.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (102.018)");

			expected = `&carr<>[]`; subject = carr(ct1); test(Diagnostics.format(subject), "Diagnostics.format (202.011)");
			expected = `&carr<symbol>[]`; subject = carr(ct2); test(Diagnostics.format(subject), "Diagnostics.format (202.012)");
			expected = `&carr<symbol>[...(empty)]`; subject = carr(ct2, 1); test(Diagnostics.format(subject), "Diagnostics.format (202.013)");
			expected = `&carr<symbol>[...(2x empty)]`; subject = carr(ct2, 2); test(Diagnostics.format(subject), "Diagnostics.format (202.014)");
			expected = `&carr<symbol>[1, ...(empty)]`; subject = carr(ct2, 2); subject[CompoundArray.LowerBound] = 1; test(Diagnostics.format(subject), "Diagnostics.format (202.015)");
			expected = `&carr<symbol>[...(empty), 1]`; subject = carr(ct2, 2); subject[CompoundArray.LowerBound + 1] = 1; test(Diagnostics.format(subject), "Diagnostics.format (202.016)");
			expected = `&carr<>[...(empty), &carr<>@0]`; subject = carr(ct1, 2); subject[CompoundArray.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (202.017)");
			expected = `&carr<symbol>[...(empty), &carr<symbol>@0]`; subject = carr(ct2, 2); subject[CompoundArray.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (202.018)");

			expected = `&cbuf<>[]`; subject = cbuf(ct1); test(Diagnostics.format(subject), "Diagnostics.format (302.011)");
			expected = `&cbuf(${T_0x523EBA})<>[]`; subject = cbuf(ct1); test(Diagnostics.format(subject, { verbose: true }), "Diagnostics.format (302.0111)");
			expected = `&cbuf<symbol>[]`; subject = cbuf(ct2); test(Diagnostics.format(subject), "Diagnostics.format (302.012)");
			expected = `&cbuf<symbol>[...(empty)]`; subject = cbuf(ct2, 1); test(Diagnostics.format(subject), "Diagnostics.format (302.013)");
			expected = `&cbuf<symbol>[...(empty)]`; subject = cbuf(ct2, 1, 5); test(Diagnostics.format(subject), "Diagnostics.format (302.0131)");
			expected = `&cbuf<symbol>[...(2x empty)]`; subject = cbuf(ct2, 2); test(Diagnostics.format(subject), "Diagnostics.format (302.014)");
			expected = `&cbuf<symbol>[...(2x empty)]`; subject = cbuf(ct2, 2, 5); test(Diagnostics.format(subject), "Diagnostics.format (302.0141)");
			expected = `&cbuf<symbol>[1, ...(empty)]`; subject = cbuf(ct2, 2); subject[CompoundBuf.LowerBound] = 1; test(Diagnostics.format(subject), "Diagnostics.format (302.015)");
			expected = `&cbuf<symbol>[1, ...(empty)]`; subject = cbuf(ct2, 2, 5); subject[CompoundBuf.LowerBound] = 1; test(Diagnostics.format(subject), "Diagnostics.format (302.0151)");
			expected = `&cbuf<symbol>[...(empty), 1]`; subject = cbuf(ct2, 2); subject[CompoundBuf.LowerBound + 1] = 1; test(Diagnostics.format(subject), "Diagnostics.format (302.016)");
			expected = `&cbuf<>[...(empty), &cbuf<>@0]`; subject = cbuf(ct1, 2); subject[CompoundBuf.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (302.017)");
			expected = `&cbuf<symbol>[...(empty), &cbuf<symbol>@0]`; subject = cbuf(ct2, 2); subject[CompoundBuf.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (302.018)");
			expected = `&cbuf<symbol>[...(empty), &cbuf<symbol>@0]`; subject = cbuf(ct2, 2, 5); subject[CompoundBuf.LowerBound + 1] = subject; test(Diagnostics.format(subject), "Diagnostics.format (302.0181)");

			expected = `&buf[]`; subject = buf(); test(Diagnostics.format(subject), "Diagnostics.format (402.011)");
			expected = `&buf(${T_0x523EBA})[]`; subject = buf(); test(Diagnostics.format(subject, { verbose: true }), "Diagnostics.format (402.0111)");
			expected = `&buf[]`; subject = buf(); test(Diagnostics.format(subject), "Diagnostics.format (402.012)");
			expected = `&buf[...(empty)]`; subject = buf(5); subject.count = 1; test(Diagnostics.format(subject), "Diagnostics.format (402.013)");
			expected = `&buf[...(2x empty)]`; subject = buf(); subject.count = 2; test(Diagnostics.format(subject), "Diagnostics.format (402.014)");
			expected = `&buf[1, ...(empty)]`; subject = buf(5); subject[Buf.LowerBound] = 1; subject.count = 2; test(Diagnostics.format(subject), "Diagnostics.format (402.015)");
			expected = `&buf[...(empty), 1]`; subject = buf(5); subject[Buf.LowerBound + 1] = 1; subject.count = 2; test(Diagnostics.format(subject), "Diagnostics.format (402.016)");
			expected = `&buf[...(empty), &buf@0]`; subject = buf(); subject[Buf.LowerBound + 1] = subject; subject.count = 2; test(Diagnostics.format(subject), "Diagnostics.format (402.018)");

			expected = `{}`; subject = {}; test(Diagnostics.format(subject), "Diagnostics.format (03.01)");
			expected = `&/C{}`; subject = new class C { }; test(Diagnostics.format(subject), "Diagnostics.format (03.011)");
			expected = `{ "a": 1 }`; subject = { a: 1 }; test(Diagnostics.format(subject), "Diagnostics.format (03.02)");
			expected = `{ "a": 1, "b": 2 }`; subject = { a: 1, b: 2 }; test(Diagnostics.format(subject), "Diagnostics.format (03.03)");
			expected = `{ <symbol>: 2 }`; subject = {}; subject[Symbol("symbol")] = 2; test(Diagnostics.format(subject), "Diagnostics.format (03.04)");
			expected = `{ "a": 1, <symbol>: 2 }`; subject = { "a": 1 }; subject[Symbol("symbol")] = 2; test(Diagnostics.format(subject), "Diagnostics.format (03.05)");
			expected = `{ "a": 1, <symbol>: 2 }`; subject = { "a": 1 }; subject[Symbol("symbol")] = 2; test(Diagnostics.format(subject), "Diagnostics.format (03.06)");
			expected = `{ "a": 1, "b": 5, <symbol>: 2, <symbol2>: 3 }`; subject = { "a": 1, [Symbol("symbol")]: 2, b: 5 }; subject[Symbol("symbol2")] = 3; test(Diagnostics.format(subject), "Diagnostics.format (03.07)");
			expected = `&null{}`; subject = Object.create(null); test(Diagnostics.format(subject), "Diagnostics.format (03.08)");
			expected = `&null{ "a": 1 }`; subject = Object.create(null); subject.a = 1;  test(Diagnostics.format(subject), "Diagnostics.format (03.09)");
			expected = `{ "": {} }`; subject = { "": {} }; test(Diagnostics.format(subject), "Diagnostics.format (03.10)");
			expected = `{ "b": { "a": &Object@0 } }`; subject = {}; cyclic = { a: subject }; subject.b = cyclic; test(Diagnostics.format(subject), "Diagnostics.format (03.12)");
			expected = `{ "c": { "a": { "b": &Object@7 } } }`; cyclic = {}; cyclic2 = { b: cyclic }; cyclic.a = cyclic2; subject = { c: cyclic }; test(Diagnostics.format(subject), "Diagnostics.format (03.13)");
			expected = `{ "c": &/C1{ "a": { "b": &/C1@7 } } }`; cyclic = new (class C1 { }); cyclic2 = { b: cyclic }; cyclic.a = cyclic2; subject = { c: cyclic }; test(Diagnostics.format(subject), "Diagnostics.format (03.14)");
			expected = `{ "a": &Object@0 }`; subject = {}; subject.a = subject; test(Diagnostics.format(subject), "Diagnostics.format (03.15)");

			expected = `&Error{}`; try { throw new Error() } catch (ex) { subject = ex; test(Diagnostics.format(subject), "Diagnostics.format (04.01)"); }
			expected = `&Error{ "message": "a" }`; try { throw new Error("a") } catch (ex) { subject = ex; test(Diagnostics.format(subject), "Diagnostics.format (04.02)"); }
			expected = `&Error/TypeError{}`; try { throw new TypeError("") } catch (ex) { subject = ex; test(Diagnostics.format(subject), "Diagnostics.format (04.03)"); }
			expected = `&Error{ "a": 1 }`; try { throw new Error() } catch (ex) { subject = ex; ex.a = 1;  test(Diagnostics.format(subject), "Diagnostics.format (04.04)"); }
			expected = `&Error{ <symbol>: 1 }`; try { throw new Error() } catch (ex) { subject = ex; ex[Symbol("symbol")] = 1; test(Diagnostics.format(subject), "Diagnostics.format (04.05)"); }
			expected = `&Error{ "innerException": &Error{ "innerException": &Error@0 } }`; try { throw new Error() } catch (ex) { cyclic = new Error(); cyclic.innerException = ex; subject = ex; subject.innerException = cyclic; test(Diagnostics.format(subject), "Diagnostics.format (04.06)"); }
			expected = `&Error/Exception{ "message": "0x0", "code": "0x0" }`; try { throw new Exception(0) } catch (ex) { subject = ex; test(Diagnostics.format(subject), "Diagnostics.format (041.01)"); }
			expected = `&Error/Exception{ "message": "0x1", "code": "0x1" }`; try { throw new Exception(1) } catch (ex) { subject = ex; test(Diagnostics.format(subject), "Diagnostics.format (041.02)"); }
			expected = `&Error/ArgumentException{ "message": "0xDEFB53 Argument is invalid: \\"a\\" (1).", "code": "0xDEFB53", "details": { "name": "a", "value": 1 } }`; try { throw new ArgumentException(0xDEFB53, "a", 1) } catch (ex) { subject = ex; test(Diagnostics.format(subject), "Diagnostics.format (041.03)"); }
			expected = `&Error/Exception/ArgumentException{ "message": "0xDEFB53 Argument is invalid: \\"a\\" (1).", "code": "0xDEFB53", "details": { "name": "a", "value": 1 } }`; try { throw new ArgumentException(0xDEFB53, "a", 1) } catch (ex) { subject = ex; test(Diagnostics.format(subject, { verbose: true }), "Diagnostics.format (041.04)"); }

			expected = `&Map{}`; subject = new Map(); test(Diagnostics.format(subject), "Diagnostics.format (05.01)");
			expected = `&Map/M{}`; subject = new (class M extends Map { })(); test(Diagnostics.format(subject), "Diagnostics.format (05.011)");
			expected = `&Map{ null=1 }`; subject = new Map(); subject.set(null, 1); test(Diagnostics.format(subject), "Diagnostics.format (05.02)");
			expected = `&Map{ void 0=1 }`; subject = new Map(); subject.set(void 0, 1); test(Diagnostics.format(subject), "Diagnostics.format (05.03)");
			expected = `&Map{ true=1 }`; subject = new Map(); subject.set(true, 1); test(Diagnostics.format(subject), "Diagnostics.format (05.04)");
			expected = `&Map{ "a"=1 }`; subject = new Map(); subject.set("a", 1); test(Diagnostics.format(subject), "Diagnostics.format (05.05)");
			expected = `&Map{ "a"=1, "b"=2 }`; subject = new Map(); subject.set("a", 1); subject.set("b", 2); test(Diagnostics.format(subject), "Diagnostics.format (05.06)");
			expected = `&Map{ []=1 }`; subject = new Map(); subject.set([], 1); test(Diagnostics.format(subject), "Diagnostics.format (05.07)");
			expected = `&Map{ {}=1 }`; subject = new Map(); subject.set({}, 1); test(Diagnostics.format(subject), "Diagnostics.format (05.08)");
			expected = `&Map{ 1=&Map{ 2=&Map@0 } }`; subject = new Map(); cyclic = new Map(); subject.set(1, cyclic); cyclic.set(2, subject); test(Diagnostics.format(subject), "Diagnostics.format (05.09)");
			expected = `&Map{ 1=&Map@0 }`; subject = new Map(); subject.set(1, subject); test(Diagnostics.format(subject), "Diagnostics.format (05.10)");
			expected = `&Map{ &Map@0=1 }`; subject = new Map(); subject.set(subject, 1); test(Diagnostics.format(subject), "Diagnostics.format (05.101)");
			expected = `&Map{ null=1, "a": 2, <symbol>: 1 }`; subject = new Map(); subject[Symbol("symbol")] = 1; subject.set(null, 1); subject.a = 2;  test(Diagnostics.format(subject), "Diagnostics.format (05.11)");

			expected = `&Set{}`; subject = new Set(); test(Diagnostics.format(subject), "Diagnostics.format (06.01)");
			expected = `&Set/S{}`; subject = new (class S extends Set { })(); test(Diagnostics.format(subject), "Diagnostics.format (06.011)");
			expected = `&Set{ null }`; subject = new Set(); subject.add(null); test(Diagnostics.format(subject), "Diagnostics.format (06.02)");
			expected = `&Set{ void 0 }`; subject = new Set(); subject.add(void 0); test(Diagnostics.format(subject), "Diagnostics.format (06.03)");
			expected = `&Set{ true }`; subject = new Set(); subject.add(true); test(Diagnostics.format(subject), "Diagnostics.format (06.04)");
			expected = `&Set{ "a" }`; subject = new Set(); subject.add("a"); test(Diagnostics.format(subject), "Diagnostics.format (06.05)");
			expected = `&Set{ "a", "b" }`; subject = new Set(); subject.add("a"); subject.add("b"); test(Diagnostics.format(subject), "Diagnostics.format (06.06)");
			expected = `&Set{ [] }`; subject = new Set(); subject.add([]); test(Diagnostics.format(subject), "Diagnostics.format (06.07)");
			expected = `&Set{ {} }`; subject = new Set(); subject.add({}); test(Diagnostics.format(subject), "Diagnostics.format (06.08)");
			expected = `&Set{ &Set{ &Set@0 } }`; subject = new Set(); cyclic = new Set(); subject.add(cyclic); cyclic.add(subject); test(Diagnostics.format(subject), "Diagnostics.format (06.09)");
			expected = `&Set{ &Set@0 }`; subject = new Set(); subject.add(subject); test(Diagnostics.format(subject), "Diagnostics.format (06.10)");
			expected = `&Set{ "a", <symbol>: 1 }`; subject = new Set(); subject[Symbol("symbol")] = 1; subject.add("a"); test(Diagnostics.format(subject), "Diagnostics.format (06.11)");

			expected = `{ "a": [1, 2, &Map{}, { <s>: &Set{} }, [true, false]], "b": { "c": function () { } } }`; subject = { "a": [1, 2, new Map(), { [Symbol("s")]: new Set() }, [true, false]], "b": { "c": function () { } } }; test(Diagnostics.format(subject), "Diagnostics.format (07.01)");
			expected = `&Map{ [{ "c": &Array@6 }]=&Map@0 }`; cyclic = {}; cyclic2 = [cyclic]; subject = new Map(); cyclic.c = cyclic2;  subject.set(cyclic2, subject); test(Diagnostics.format(subject), "Diagnostics.format (07.02)");


			const inspect = (value, type, container, key, visited) => Diagnostics.format({ value, type, container, key, visited });
			
			expected = `"{ \\"value\\": {}, \\"type\\": <Object>, \\"container\\": null, \\"key\\": <Unset>, \\"visited\\": &Map{ &Object@11=0 } }"`;
			subject = {}; test(Diagnostics.format(subject, { inspect }), "Diagnostics.format (08.01)");


			const format1 = (value, type, container, key, visited) => Diagnostics.format({ value, type, container, key, visited });
			const format2 = (value, type, container, key, visited) => Verbatim;
			const format3 = (value, type, container, key, visited) => key === "a" ? "+++" : Verbatim;

			expected = `{ "value": {}, "type": <Object>, "container": null, "key": <Unset>, "visited": &Map{ &Object@11=0 } }`;
			subject = {}; test(Diagnostics.format(subject, { format: format1 }), "Diagnostics.format (09.01)");

			expected = `{}`;
			subject = {}; test(Diagnostics.format(subject, { format: format2 }), "Diagnostics.format (09.02)");

			expected = `{ "a": +++ }`;
			subject = { a: 1 }; test(Diagnostics.format(subject, { format: format3 }), "Diagnostics.format (09.03)");
		}
	}
}

module.exports.UnitTests_Exception = module.exports;
