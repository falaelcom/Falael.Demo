//	R0Q2/daniel/20220505
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Fabric } = require("-/pb/natalis/013/Fabric.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0x455307 = tunable(0x455307);

module.exports =

class UnitTests_Fabric
{
	//	Category: Unit test
	//	Function: Run unit tests for `Fabric` class methods and properties.
	static unitTest_Fabric(result)
	{
		let value, state, expected, outcome;

		const test = testName => outcome !== expected ? result.push({ testName, expected, outcome }) : void 0;

		test_Fabric_walk();

		function test_Fabric_walk()
		{
			function visit(state, deltaOut, head, headCardinality, label, labelCardinality)
			{
				if (deltaOut !== null) state.o += `DO(${deltaOut})`;
				if (labelCardinality) state.o += `[${Type.isSymbol(label) ? `<${label.description || ""}>` : label}(${labelCardinality.description})]`;
				if (labelCardinality && headCardinality) state.o += "=";
				if (headCardinality) state.o += `${headCardinality.description}`
				if (headCardinality !== void 0) state.o += "*";
				return true;
			}

			value = void 0; expected = "Zero*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (01.01)");
			value = null; expected = "Zero*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (01.02)");
			value = 1; expected = "Zero*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (01.03)");
			value = ""; expected = "Zero*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (01.04)");
			value = true; expected = "Zero*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (01.05)");
			value = function () { }; expected = "Zero*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (01.06)");

			value = []; expected = "AlephNull*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (02.01)");
			value = []; value.a = 1; value[Symbol()] = 2; expected = "AlephNull*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (02.011)");
			value = [1]; expected = "AlephNull*DO(0)[0(AlephNull)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (02.02)");
			value = [1, 2]; expected = "AlephNull*DO(0)[0(AlephNull)]=Zero*DO(1)[1(AlephNull)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (02.03)");
			value = []; value[-1] = 1; expected = "AlephNull*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (02.04)");
			value = []; value[-1] = 1; value[1000000000 + T_0x455307] = 1; expected = `AlephNull*DO(0)[${1000000000 + T_0x455307}(AlephNull)]=Zero*DO(2)`; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (02.05)");

			value = {}; expected = "AlephOne*DO(1)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (03.01)");
			value = {}; value[Symbol()] = 2; expected = `AlephOne*DO(0)[<>(AlephOne)]=Zero*DO(2)`; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (03.011)");
			value = { a: 1 }; expected = "AlephOne*DO(0)[a(AlephOne)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (03.02)");
			value = { a: 1, b: 2 }; expected = "AlephOne*DO(0)[a(AlephOne)]=Zero*DO(1)[b(AlephOne)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (03.03)");

			value = [{}]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.01)");
			value = [{}, {}]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(1)[1(AlephNull)]=AlephOne*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.02)");
			value = [{ a: 1 }]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.03)");
			value = [{ a: 1 }, {}]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=Zero*DO(2)[1(AlephNull)]=AlephOne*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.04)");
			value = [{ a: 1 }, { b: 2 }]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=Zero*DO(2)[1(AlephNull)]=AlephOne*DO(0)[b(AlephOne)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.05)");
			value = [1, { b: 2 }]; expected = "AlephNull*DO(0)[0(AlephNull)]=Zero*DO(1)[1(AlephNull)]=AlephOne*DO(0)[b(AlephOne)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.06)");
			value = [{ a: 1 }, 2]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=Zero*DO(2)[1(AlephNull)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.07)");
			value = [{ a: [{ a: [1] }] }]; expected = "AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(6)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (04.08)");

			value = { a: [] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.01)");
			value = { a: [], b: [] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(1)[b(AlephOne)]=AlephNull*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.02)");
			value = { a: [1] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.03)");
			value = { a: [1], b: [] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(2)[b(AlephOne)]=AlephNull*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.04)");
			value = { a: [], b: [2] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(1)[b(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.05)");
			value = { a: [1], b: [2] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(2)[b(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.05)");
			value = { a: 1, b: [] }; expected = "AlephOne*DO(0)[a(AlephOne)]=Zero*DO(1)[b(AlephOne)]=AlephNull*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.07)");
			value = { a: 1, b: [2] }; expected = "AlephOne*DO(0)[a(AlephOne)]=Zero*DO(1)[b(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(3)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.08)");
			value = { a: [], b: 2 }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(1)[b(AlephOne)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.09)");
			value = { a: [1], b: 2 }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=Zero*DO(2)[b(AlephOne)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.10)");
			value = { a: [{ a: [{ a: 1 }] }] }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(0)[a(AlephOne)]=Zero*DO(6)"; state = { o: "" }; outcome = Fabric.the.walk(visit, state, value).o; test("Fabric.walk (05.11)");

			function visitWithFalse(state, deltaOut, head, headCardinality, label, labelCardinality)
			{
				var result = visit(state, deltaOut, head, headCardinality, label, labelCardinality);
				if(head && head.b == 2) return false;
				return result;
			}

			value = { a: [{ b: 2 }, 3], c: 4 }; expected = "AlephOne*DO(0)[a(AlephOne)]=AlephNull*DO(0)[0(AlephNull)]=AlephOne*DO(1)[1(AlephNull)]=Zero*DO(2)[c(AlephOne)]=Zero*DO(2)"; state = { o: "" }; outcome = Fabric.the.walk(visitWithFalse, state, value).o; test("Fabric.walk (06.01)");
		}
	}
}

module.exports.UnitTests_Fabric = module.exports;
