//	R0Q1/daniel/20220515
"use strict";

const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const {
	Compound,
	CompoundStructure, cost, isCompoundStructure, CompoundStructureMarker,
	CompoundArray, carr, isCompoundArray,
	CompoundBuf, cbuf, isCompoundBuf,
	Buf, buf, isBuf,
	BufPool,
	BufPoolTransaction
} = require("-/pb/natalis/013/Compound.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0x523EBA = tunable(0x523EBA);

module.exports =

class UnitTests_Compound
{
	static unitTest_Compound(result)
	{
		let subject, target, expected, outcome;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	Compound.lowerBound
		if (Compound.lowerBound([]) !== 0) fail("Compound.lowerBound 01.01");
		if (Compound.lowerBound(cost(Symbol())) !== CompoundStructure.LowerBound) fail("Compound.lowerBound 01.02");
		if (Compound.lowerBound(carr(Symbol())) !== CompoundArray.LowerBound) fail("Compound.lowerBound 01.03");
		if (Compound.lowerBound(cbuf(Symbol())) !== CompoundBuf.LowerBound) fail("Compound.lowerBound 01.04");
		if (Compound.lowerBound(buf()) !== Buf.LowerBound) fail("Compound.lowerBound 01.05");

		//	Compound.upperBound
		if (Compound.upperBound([]) !== -1) fail("Compound.upperBound 02.01");
		if (Compound.upperBound(['a']) !== 0) fail("Compound.upperBound 02.02");
		if (Compound.upperBound(cost(Symbol())) !== CompoundStructure.LowerBound - 1) fail("Compound.upperBound 02.03");
		if (Compound.upperBound(cost(Symbol(), 1)) !== CompoundStructure.LowerBound) fail("Compound.upperBound 02.04");
		if (Compound.upperBound(carr(Symbol())) !== CompoundArray.LowerBound - 1) fail("Compound.upperBound 02.05");
		if (Compound.upperBound(carr(Symbol(), 1)) !== CompoundArray.LowerBound) fail("Compound.upperBound 02.06");
		if (Compound.upperBound(cbuf(Symbol())) !== CompoundBuf.LowerBound - 1) fail("Compound.upperBound 02.07");
		if (Compound.upperBound(cbuf(Symbol(), 1)) !== CompoundBuf.LowerBound) fail("Compound.upperBound 02.08");
		if (Compound.upperBound(buf()) !== Buf.LowerBound - 1) fail("Compound.upperBound 02.09");

		subject = buf();
		++subject.count;
		if (Compound.upperBound(subject) !== 0) fail("Compound.upperBound 02.10");

		//	Compound.count
		if (Compound.count([]) !== 0) fail("Compound.count 03.01");
		if (Compound.count(['a']) !== 1) fail("Compound.count 03.02");
		if (Compound.count(cost(Symbol())) !== 0) fail("Compound.count 03.03");
		if (Compound.count(cost(Symbol(), 1)) !== 1) fail("Compound.count 03.04");
		if (Compound.count(carr(Symbol())) !== 0) fail("Compound.count 03.05");
		if (Compound.count(carr(Symbol(), 1)) !== 1) fail("Compound.count 03.06");
		if (Compound.count(cbuf(Symbol())) !== 0) fail("Compound.count 03.07");
		if (Compound.count(cbuf(Symbol(), 1)) !== 1) fail("Compound.count 03.08");
		if (Compound.count(buf()) !== 0) fail("Compound.count 03.09");

		subject = buf();
		++subject.count;
		if (Compound.count(subject) !== 1) fail("Compound.count 03.10");

		//	Compound.copyElements

		//	array -> array
		expected = `[]`; outcome = Compound.copyElements([], []); test("Compound.copyElements 04.01");
		expected = `[1]`; outcome = Compound.copyElements([1], []); test("Compound.copyElements 04.02");
		expected = `[1, 2]`; outcome = Compound.copyElements([1, 2], [3]); test("Compound.copyElements 04.03");
		expected = `[1]`; outcome = Compound.copyElements([1], [2, 3]); test("Compound.copyElements 04.04");
		expected = `[3, 1, 2]`; outcome = Compound.copyElements([1, 2], [3, 4], 1); test("Compound.copyElements 04.05");

		//	array -> cost
		expected = `&cost<a>[]`; target = cost(Symbol("a")); outcome = Compound.copyElements([], target); test("Compound.copyElements 05.01");
		expected = `&cost<a>[1, 2]`; target = cost(Symbol("a")); outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 05.02");
		expected = `&cost<a>[1, 2]`; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 05.03");
		expected = `&cost<a>[1]`; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; outcome = Compound.copyElements([1], target); test("Compound.copyElements 05.04");
		expected = `&cost<a>[3, 1, 2]`; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; outcome = Compound.copyElements([1, 2], target, 1); test("Compound.copyElements 05.05");

		//	array -> carr
		expected = `&carr<a>[]`; target = carr(Symbol("a")); outcome = Compound.copyElements([], target); test("Compound.copyElements 06.01");
		expected = `&carr<a>[1, 2]`; target = carr(Symbol("a")); outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 06.02");
		expected = `&carr<a>[1, 2]`; target = carr(Symbol("a")); target[CompoundArray.LowerBound] = 3; outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 06.03");
		expected = `&carr<a>[1]`; target = carr(Symbol("a")); target[CompoundArray.LowerBound] = 3; target[CompoundArray.LowerBound + 1] = 4; outcome = Compound.copyElements([1], target); test("Compound.copyElements 06.04");
		expected = `&carr<a>[3, 1, 2]`; target = carr(Symbol("a")); target[CompoundArray.LowerBound] = 3; target[CompoundArray.LowerBound + 1] = 4; outcome = Compound.copyElements([1, 2], target, 1); test("Compound.copyElements 06.05");

		//	array -> cbuf
		expected = `&cbuf<a>[]`; target = cbuf(Symbol("a")); outcome = Compound.copyElements([], target); test("Compound.copyElements 07.01");
		expected = `&cbuf<a>[1, 2]`; target = cbuf(Symbol("a")); outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 07.02");
		expected = `&cbuf<a>[1, 2]`; target = cbuf(Symbol("a")); target[CompoundBuf.LowerBound] = 3; target.count = 1; outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 07.03");
		expected = `&cbuf<a>[1]`; target = cbuf(Symbol("a")); target[CompoundBuf.LowerBound] = 3; target[CompoundBuf.LowerBound + 1] = 4; target.count = 2; outcome = Compound.copyElements([1], target); test("Compound.copyElements 07.04");
		expected = `&cbuf<a>[3, 1, 2]`; target = cbuf(Symbol("a")); target[CompoundBuf.LowerBound] = 3; target[CompoundBuf.LowerBound + 1] = 4; target.count = 2; outcome = Compound.copyElements([1, 2], target, 1); test("Compound.copyElements 07.05");

		//	array -> buf
		expected = `&buf[]`; target = buf(); outcome = Compound.copyElements([], target); test("Compound.copyElements 08.01");
		expected = `&buf[1, 2]`; target = buf(); outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 08.02");
		expected = `&buf[1, 2]`; target = buf(); target[Buf.LowerBound] = 3; target.count = 1; outcome = Compound.copyElements([1, 2], target); test("Compound.copyElements 08.03");
		expected = `&buf[1]`; target = buf(); target[Buf.LowerBound] = 3; target[Buf.LowerBound + 1] = 4; target.count = 2; outcome = Compound.copyElements([1], target); test("Compound.copyElements 08.04");
		expected = `&buf[3, 1, 2]`; target = buf(); target[Buf.LowerBound] = 3; target[Buf.LowerBound + 1] = 4; target.count = 2; outcome = Compound.copyElements([1, 2], target, 1); test("Compound.copyElements 08.05");

		//	cost -> array
		expected = `[]`; subject = cost(Symbol("a")); outcome = Compound.copyElements(subject, []); test("Compound.copyElements 09.01");
		expected = `[1]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; outcome = Compound.copyElements(subject, []); test("Compound.copyElements 09.02");
		expected = `[1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; outcome = Compound.copyElements(subject, [3]); test("Compound.copyElements 09.03");
		expected = `[1]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; outcome = Compound.copyElements(subject, [2, 3]); test("Compound.copyElements 09.04");
		expected = `[3, 1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; outcome = Compound.copyElements(subject, [3, 4], 1); test("Compound.copyElements 09.05");

		//	cost -> cost
		expected = `&cost<a>[]`; subject = cost(Symbol("x")); target = cost(Symbol("a")); outcome = Compound.copyElements(subject, target); test("Compound.copyElements 10.01");
		expected = `&cost<a>[1, 2]`; subject = cost(Symbol("x")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; target = cost(Symbol("a")); outcome = Compound.copyElements(subject, target); test("Compound.copyElements 10.02");
		expected = `&cost<a>[1, 2]`; subject = cost(Symbol("x")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; outcome = Compound.copyElements(subject, target); test("Compound.copyElements 10.03");
		expected = `&cost<a>[1]`; subject = cost(Symbol("x")); subject[CompoundStructure.LowerBound] = 1; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; outcome = Compound.copyElements(subject, target); test("Compound.copyElements 10.04");
		expected = `&cost<a>[3, 1, 2]`; subject = cost(Symbol("x")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; outcome = Compound.copyElements(subject, target, 1); test("Compound.copyElements 10.05");

		//	* -> array
		expected = `[]`; subject = carr(Symbol("a")); outcome = Compound.copyElements(subject, []); test("Compound.copyElements 11.01");
		expected = `[3, 1, 2]`; subject = carr(Symbol("a")); subject[CompoundArray.LowerBound] = 1; subject[CompoundArray.LowerBound + 1] = 2; outcome = Compound.copyElements(subject, [3, 4], 1); test("Compound.copyElements 11.02");
		expected = `[]`; subject = cbuf(Symbol("a")); outcome = Compound.copyElements(subject, []); test("Compound.copyElements 11.03");
		expected = `[3, 1, 2]`; subject = cbuf(Symbol("a")); subject[CompoundBuf.LowerBound] = 1; subject[CompoundBuf.LowerBound + 1] = 2; subject.count = 2; outcome = Compound.copyElements(subject, [3, 4], 1); test("Compound.copyElements 11.04");
		expected = `[]`; subject = buf(); outcome = Compound.copyElements(subject, []); test("Compound.copyElements 11.05");
		expected = `[3, 1, 2]`; subject = buf(); subject[Buf.LowerBound] = 1; subject[Buf.LowerBound + 1] = 2; subject.count = 2; outcome = Compound.copyElements(subject, [3, 4], 1); test("Compound.copyElements 11.06");

		//	Compound.placeRange

		//	array -> array
		expected = `[]`; outcome = Compound.placeRange([], 0, 0, []); test("Compound.placeRange 04.01.01");
		expected = `[]`; outcome = Compound.placeRange([], 1, 1, []); test("Compound.placeRange 04.01.02");
		expected = `[]`; outcome = Compound.placeRange([1], 0, 0, []); test("Compound.placeRange 04.02.01");
		expected = `[1]`; outcome = Compound.placeRange([1], 0, 1, []); test("Compound.placeRange 04.02.02");
		expected = `[]`; outcome = Compound.placeRange([1], 1, 1, []); test("Compound.placeRange 04.02.03");
		expected = `[3]`; outcome = Compound.placeRange([1, 2], 0, 0, [3]); test("Compound.placeRange 04.03.01");
		expected = `[1, 2]`; outcome = Compound.placeRange([1, 2], 0, 2, [3]); test("Compound.placeRange 04.03.02");
		expected = `[2]`; outcome = Compound.placeRange([2], 0, 2, [3]); test("Compound.placeRange 04.03.03");
		expected = `[2]`; outcome = Compound.placeRange([1, 2], 1, 2, [3]); test("Compound.placeRange 04.03.04");
		expected = `[2, 3]`; outcome = Compound.placeRange([1], 0, 0, [2, 3]); test("Compound.placeRange 04.04.01");
		expected = `[1, 3]`; outcome = Compound.placeRange([1], 0, 1, [2, 3]); test("Compound.placeRange 04.04.02");
		expected = `[2, 3]`; outcome = Compound.placeRange([1], 1, 1, [2, 3]); test("Compound.placeRange 04.04.03");
		expected = `[1, 3]`; outcome = Compound.placeRange([1], 0, 2, [2, 3]); test("Compound.placeRange 04.04.04");
		expected = `[3, 4]`; outcome = Compound.placeRange([1, 2], 0, 0, [3, 4], 1); test("Compound.placeRange 04.05.01");
		expected = `[3, 1]`; outcome = Compound.placeRange([1, 2], 0, 1, [3, 4], 1); test("Compound.placeRange 04.05.02");
		expected = `[3, 1, 2]`; outcome = Compound.placeRange([1, 2], 0, 2, [3, 4], 1); test("Compound.placeRange 04.05.03");
		expected = `[3, 4, 1, 2]`; outcome = Compound.placeRange([1, 2], 0, 2, [3, 4], 2); test("Compound.placeRange 04.05.04");
		expected = `[3, 4, ...(empty), 1, 2]`; outcome = Compound.placeRange([1, 2], 0, 2, [3, 4], 3); test("Compound.placeRange 04.05.05");

		//	array -> cost
		expected = `&cost<a>[]`; target = cost(Symbol("a")); outcome = Compound.placeRange([], 0, 0, target); test("Compound.placeRange 05.01.01");
		expected = `&cost<a>[]`; target = cost(Symbol("a")); outcome = Compound.placeRange([], 1, 1, target); test("Compound.placeRange 05.01.02");
		expected = `&cost<a>[]`; target = cost(Symbol("a")); outcome = Compound.placeRange([1, 2], 0, 0, target); test("Compound.placeRange 05.02.01");
		expected = `&cost<a>[1]`; target = cost(Symbol("a")); outcome = Compound.placeRange([1, 2], 0, 1, target); test("Compound.placeRange 05.02.02");
		expected = `&cost<a>[1, 2]`; target = cost(Symbol("a")); outcome = Compound.placeRange([1, 2], 0, 2, target); test("Compound.placeRange 05.02.03");
		expected = `&cost<a>[2]`; target = cost(Symbol("a")); outcome = Compound.placeRange([1, 2], 1, 2, target); test("Compound.placeRange 05.02.04");
		expected = `&cost<a>[2, 4, 5]`; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; target[CompoundStructure.LowerBound + 2] = 5; outcome = Compound.placeRange([1, 2], 1, 2, target); test("Compound.placeRange 05.03.01");
		expected = `&cost<a>[1, 2, 5]`; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; target[CompoundStructure.LowerBound + 2] = 5; outcome = Compound.placeRange([1, 2], 0, 2, target); test("Compound.placeRange 05.03.02");
		expected = `&cost<a>[3, 2, 5]`; target = cost(Symbol("a")); target[CompoundStructure.LowerBound] = 3; target[CompoundStructure.LowerBound + 1] = 4; target[CompoundStructure.LowerBound + 2] = 5; outcome = Compound.placeRange([1, 2], 1, 2, target, 1); test("Compound.placeRange 05.03.03");

		//	array -> buf
		expected = `&buf[]`; target = buf(); outcome = Compound.placeRange([], 0, 0, target); test("Compound.placeRange 08.01.01");
		expected = `&buf[]`; target = buf(); outcome = Compound.placeRange([], 1, 1, target); test("Compound.placeRange 08.01.02");
		expected = `&buf[]`; target = buf(); outcome = Compound.placeRange([1, 2], 0, 0, target); test("Compound.placeRange 08.02.01");
		expected = `&buf[2]`; target = buf(); outcome = Compound.placeRange([1, 2], 1, 1, target); test("Compound.placeRange 08.02.02");
		expected = `&buf[1, 2]`; target = buf(); outcome = Compound.placeRange([1, 2], 0, 2, target); test("Compound.placeRange 08.02.03");
		expected = `&buf[1, 2]`; target = buf(); target[Buf.LowerBound] = 3; target.count = 1; outcome = Compound.placeRange([1, 2], 0, 2, target); test("Compound.placeRange 08.03.01");
		expected = `&buf[3, 2, 4]`; target = buf(); target[Buf.LowerBound] = 3; target.count = 1; outcome = Compound.placeRange([1, 2, 4], 1, 2, target, 1); test("Compound.placeRange 08.03.02");

		//	cost -> array
		expected = `[]`; subject = cost(Symbol("a")); outcome = Compound.placeRange(subject, 0, 0, []); test("Compound.placeRange 09.01.01");
		expected = `[]`; subject = cost(Symbol("a")); outcome = Compound.placeRange(subject, 1, 1, []); test("Compound.placeRange 09.01.02");
		expected = `[]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; outcome = Compound.placeRange(subject, 0, 0, []); test("Compound.placeRange 09.02.01");
		expected = `[1]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; outcome = Compound.placeRange(subject, 0, 1, []); test("Compound.placeRange 09.02.02");
		expected = `[1]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; outcome = Compound.placeRange(subject, 0, 1, [3]); test("Compound.placeRange 09.03.01");
		expected = `[1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; outcome = Compound.placeRange(subject, 0, 2, [3]); test("Compound.placeRange 09.03.02");
		expected = `[1, 3]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; outcome = Compound.placeRange(subject, 0, 1, [2, 3]); test("Compound.placeRange 09.04.01");
		expected = `[1, 3]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; outcome = Compound.placeRange(subject, 0, 2, [2, 3]); test("Compound.placeRange 09.04.02");
		expected = `[3, 1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; outcome = Compound.placeRange(subject, 0, 2, [3, 4], 1); test("Compound.placeRange 09.05.01");
		expected = `[3, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; outcome = Compound.placeRange(subject, 1, 3, [3, 4], 1); test("Compound.placeRange 09.05.02");
	}

	static unitTest_CompoundStructure(result)
	{
		let expected, outcome, subject, compare;
		const ct = Symbol();

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		expected = `&cost<>[]`; outcome = cost(ct); test("CompoundStructure 01.01");
		expected = `&cost<>[...(5x empty)]`; outcome = cost(ct, 5); test("CompoundStructure 01.02");

		if (isCompoundStructure()) fail("CompoundStructure 02.01");
		if (isCompoundStructure([])) fail("CompoundStructure 02.02");
		if (isCompoundStructure([1])) fail("CompoundStructure 02.03");
		if (isCompoundStructure([ct])) fail("CompoundStructure 02.04");
		if (isCompoundStructure([CompoundStructureMarker])) fail("CompoundStructure 02.04");
		if (!isCompoundStructure(cost(ct, 5))) fail("CompoundStructure 02.05");
		if (isCompoundStructure(carr(ct))) fail("CompoundStructure 02.06");
		if (isCompoundStructure(cbuf(ct))) fail("CompoundStructure 02.07");
		if (isCompoundStructure(buf())) fail("CompoundStructure 02.08");

		expected = `&cost<>[]`; outcome = CompoundStructure.clone(cost(ct)); test("CompoundStructure 03.01");
		expected = `&cost<>[...(5x empty)]`; outcome = CompoundStructure.clone(cost(ct, 5)); test("CompoundStructure 03.02");

		if (!isCompoundStructure(CompoundStructure.clone(cost(ct)))) fail("CompoundStructure 04.01");
		if (!isCompoundStructure(CompoundStructure.clone(cost(ct, 5)))) fail("CompoundStructure 04.02");
		if (cost(ct).length !== CompoundStructure.LowerBound) fail("CompoundStructure 04.06");
		if (CompoundStructure.clone(cost(ct)).length !== CompoundStructure.LowerBound) fail("CompoundStructure 04.061");
		if (cost(ct, 5).length !== CompoundStructure.LowerBound + 5) fail("CompoundStructure 04.07");
		if (CompoundStructure.clone(cost(ct, 5)).length !== CompoundStructure.LowerBound + 5) fail("CompoundStructure 04.071");

		if (CompoundStructure.isOf(1, ct)) fail("CompoundStructure 05.01");
		if (CompoundStructure.isOf([], ct)) fail("CompoundStructure 05.02");
		if (CompoundStructure.isOf([CompoundStructureMarker], ct)) fail("CompoundStructure 05.02");
		if (CompoundStructure.isOf([ct], ct)) fail("CompoundStructure 05.03");
		if (!CompoundStructure.isOf([CompoundStructureMarker, ct], ct)) fail("CompoundStructure 05.04");
		if (!CompoundStructure.isOf(cost(ct), ct)) fail("CompoundStructure 05.05");
		if (!CompoundStructure.isOf(cost(ct, 5), ct)) fail("CompoundStructure 05.06");
		if (!CompoundStructure.isOf(CompoundStructure.clone(cost(ct)), ct)) fail("CompoundStructure 05.07");
		if (!CompoundStructure.isOf(CompoundStructure.clone(cost(ct, 5)), ct)) fail("CompoundStructure 05.08");

		if (CompoundStructure.getType(cost(ct, 5)) !== ct) fail("CompoundStructure 06.01");
		if (CompoundStructure.getType(CompoundStructure.clone(cost(ct, 5))) !== ct) fail("CompoundStructure 06.02");

		compare = (left, right) => left - right;
		expected = `&cost<>[]`; outcome = CompoundStructure.sort(cost(ct), compare); test("CompoundStructure 07.01");
		expected = `&cost<>[1, 5, 10]`; subject = cost(ct); subject.push(10); subject.push(1); subject.push(5); outcome = CompoundStructure.sort(subject, compare); test("CompoundStructure 07.02");
		if (outcome !== subject) fail("CompoundStructure 07.02.01");
	}

	static unitTest_CompoundArray(result)
	{
		let expected, outcome;
		const ct = Symbol();

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		expected = `&carr<>[]`; outcome = carr(ct); test("CompoundArray 01.01");
		expected = `&carr<>[...(5x empty)]`; outcome = carr(ct, 5); test("CompoundArray 01.02");

		if (isCompoundArray()) fail("CompoundArray 02.01");
		if (isCompoundArray([])) fail("CompoundArray 02.02");
		if (isCompoundArray([1])) fail("CompoundArray 02.03");
		if (!isCompoundArray(carr(ct))) fail("CompoundArray 02.04");
		if (!isCompoundArray(carr(ct, 5))) fail("CompoundArray 02.05");
		if (isCompoundArray(cost(ct))) fail("CompoundArray 02.06");
		if (isCompoundArray(cbuf(ct))) fail("CompoundBuf 02.07");
		if (isCompoundArray(cbuf(ct, 5))) fail("CompoundBuf 02.08");
		if (isCompoundArray(cbuf(ct, 5, 7))) fail("CompoundBuf 02.09");
		if (isCompoundArray(buf())) fail("CompoundBuf 02.08");

		expected = `&carr<>[]`; outcome = CompoundArray.clone(carr(ct)); test("CompoundArray 03.01");
		expected = `&carr<>[...(5x empty)]`; outcome = CompoundArray.clone(carr(ct, 5)); test("CompoundArray 03.02");

		if (!isCompoundArray(CompoundArray.clone(carr(ct)))) fail("CompoundArray 04.01");
		if (!isCompoundArray(CompoundArray.clone(carr(ct, 5)))) fail("CompoundArray 04.02");
		if (carr(ct).length !== 0) fail("CompoundArray 04.06");
		if (CompoundArray.clone(carr(ct)).length !== 0) fail("CompoundArray 04.061");
		if (carr(ct, 5).length !== 5) fail("CompoundArray 04.07");
		if (CompoundArray.clone(carr(ct, 5)).length !== 5) fail("CompoundArray 04.071");

		if (CompoundArray.isOf(1, ct)) fail("CompoundArray 05.01");
		if (CompoundArray.isOf([], ct)) fail("CompoundArray 05.02");
		if (!CompoundArray.isOf(carr(ct), ct)) fail("CompoundArray 05.03");
		if (!CompoundArray.isOf(carr(ct, 5), ct)) fail("CompoundArray 05.04");
		if (!CompoundArray.isOf(CompoundArray.clone(carr(ct)), ct)) fail("CompoundArray 05.05");
		if (!CompoundArray.isOf(CompoundArray.clone(carr(ct, 5)), ct)) fail("CompoundArray 05.06");

		if (CompoundArray.getType(carr(ct, 5)) !== ct) fail("CompoundArray 06.01");
		if (CompoundArray.getType(CompoundArray.clone(carr(ct, 5))) !== ct) fail("CompoundArray 06.02");
	}

	static unitTest_CompoundBuf(result)
	{
		let expected, outcome;
		const ct = Symbol();

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		expected = `&cbuf<>[]`; outcome = cbuf(ct); test("CompoundBuf 01.01");
		expected = `&cbuf<>[...(5x empty)]`; outcome = cbuf(ct, 5); test("CompoundBuf 01.02");
		expected = `&cbuf<>[...(5x empty)]`; outcome = cbuf(ct, 5, 5); test("CompoundBuf 01.03");

		if (isBuf()) fail("CompoundBuf 02.01");
		if (isBuf([])) fail("CompoundBuf 02.02");
		if (isBuf([1])) fail("CompoundBuf 02.03");
		if (!isBuf(cbuf(ct))) fail("CompoundBuf 02.04");
		if (!isBuf(cbuf(ct, 5))) fail("CompoundBuf 02.05");
		if (!isBuf(cbuf(ct, 5, 7))) fail("CompoundBuf 02.06");
		if (isCompoundBuf()) fail("CompoundBuf 02.21");
		if (isCompoundBuf([])) fail("CompoundBuf 02.22");
		if (isCompoundBuf([1])) fail("CompoundBuf 02.23");
		if (!isCompoundBuf(cbuf(ct))) fail("CompoundBuf 02.24");
		if (!isCompoundBuf(cbuf(ct, 5))) fail("CompoundBuf 02.25");
		if (!isCompoundBuf(cbuf(ct, 5, 7))) fail("CompoundBuf 02.26");
		if (isCompoundBuf(buf())) fail("CompoundBuf 02.27");
		if (isCompoundBuf(cost(ct))) fail("CompoundBuf 02.28");
		if (isCompoundBuf(carr(ct))) fail("CompoundBuf 02.29");

		expected = `&cbuf<>[]`; outcome = CompoundBuf.clone(cbuf(ct)); test("CompoundBuf 03.01");
		expected = `&cbuf<>[...(5x empty)]`; outcome = CompoundBuf.clone(cbuf(ct, 5)); test("CompoundBuf 03.02");
		expected = `&cbuf<>[...(5x empty)]`; outcome = CompoundBuf.clone(cbuf(ct, 5, 5)); test("CompoundBuf 03.03");

		if (!isCompoundBuf(CompoundBuf.clone(cbuf(ct)))) fail("CompoundBuf 04.01");
		if (!isCompoundBuf(CompoundBuf.clone(cbuf(ct, 5)))) fail("CompoundBuf 04.02");
		if (!isCompoundBuf(CompoundBuf.clone(cbuf(ct, 5, 7)))) fail("CompoundBuf 04.03");
		if (CompoundBuf.clone(cbuf(ct, 5)).length !== T_0x523EBA) fail("CompoundBuf 04.055");
		if (CompoundBuf.clone(cbuf(ct, 5, 7)).length !== 7) fail("CompoundBuf 04.056");
		if (cbuf(ct).count !== 0) fail("CompoundBuf 04.06");
		if (cbuf(ct, 5).count !== 5) fail("CompoundBuf 04.07");
		if (cbuf(ct, 5, 7).count !== 5) fail("CompoundBuf 04.071");
		if (CompoundBuf.clone(cbuf(ct)).count !== 0) fail("CompoundBuf 04.072");
		if (CompoundBuf.clone(cbuf(ct, 5)).count !== 5) fail("CompoundBuf 04.073");
		if (CompoundBuf.clone(cbuf(ct, 5, 7)).count !== 5) fail("CompoundBuf 04.074");

		if (!CompoundBuf.isOf(cbuf(ct), ct)) fail("CompoundBuf 05.01");
		if (!CompoundBuf.isOf(cbuf(ct, 5), ct)) fail("CompoundBuf 05.02");
		if (!CompoundBuf.isOf(CompoundBuf.clone(cbuf(ct)), ct)) fail("CompoundBuf 05.03");
		if (!CompoundBuf.isOf(CompoundBuf.clone(cbuf(ct, 5)), ct)) fail("CompoundBuf 05.04");

		if (CompoundBuf.getType(cbuf(ct, 5)) !== ct) fail("CompoundBuf 06.01");
		if (CompoundBuf.getType(CompoundBuf.clone(cbuf(ct, 5))) !== ct) fail("CompoundBuf 06.02");
	}

	static unitTest_Buf(result)
	{
		let expected, outcome, arr;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;
		const testv = testName => expected !== Diagnostics.format(outcome, { verbose: true }) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome, { verbose: true }) }) : void 0;

		expected = `&buf[]`; outcome = buf(); test("Buf 01.01");
		expected = `&buf[]`; outcome = buf(5); test("Buf 01.02");

		if (isBuf()) fail("Buf 02.01");
		if (isBuf([])) fail("Buf 02.02");
		if (isBuf([1])) fail("Buf 02.03");
		if (!isBuf(buf())) fail("Buf 02.04");
		if (!isBuf(buf(5))) fail("Buf 02.05");
		if (isCompoundArray(buf())) fail("Buf 02.14");
		if (isCompoundArray(buf(5))) fail("Buf 02.15");
		if (isCompoundBuf(buf())) fail("Buf 02.24");
		if (isCompoundBuf(buf(5))) fail("Buf 02.25");

		expected = `&buf[]`; outcome = Buf.clone(buf()); test("Buf 03.01");
		expected = `&buf[]`; outcome = Buf.clone(buf(5)); test("Buf 03.02");

		if (!isBuf(Buf.clone(buf()))) fail("Buf 04.01");
		if (!isBuf(Buf.clone(buf(5)))) fail("Buf 04.02");
		if (Buf.clone(buf()).length !== T_0x523EBA) fail("Buf 04.055");
		if (Buf.clone(buf(0)).length !== 0) fail("Buf 04.0561");
		if (Buf.clone(buf(5)).length !== 5) fail("Buf 04.056");
		if (buf().count !== 0) fail("Buf 04.06");
		if (buf(5).count !== 0) fail("Buf 04.07");
		if (Buf.clone(buf()).count !== 0) fail("Buf 04.072");
		if (Buf.clone(buf(5)).count !== 0) fail("Buf 04.073");

		if (!isBuf(Buf.fromArray([]))) fail("Buf 05.01");
		if (Buf.fromArray([]).length !== T_0x523EBA) fail("Buf 05.02");
		if (Buf.fromArray([], 0).length !== 0) fail("Buf 05.021");
		if (Buf.fromArray([0, 1], 1).length !== 2) fail("Buf 05.022");
		if (Buf.fromArray([]).count !== 0) fail("Buf 05.03");
		if (Buf.fromArray([0, 1], 1).count !== 2) fail("Buf 05.031");
		expected = `&buf(8)[]`; outcome = Buf.fromArray([], 8); testv("Buf 05.041");
		expected = `&buf(8)[1]`; outcome = Buf.fromArray([1], 8); testv("Buf 05.042");
		arr = [1]; outcome = Buf.fromArray(arr); if (arr === outcome) fail("Buf 05.05");

		if (!isBuf(Buf.augment([]))) fail("Buf 06.01");
		if (Buf.augment([]).length !== 0) fail("Buf 06.02");
		if (Buf.augment([0, 1], 1).length !== 2) fail("Buf 06.021");
		if (Buf.augment([]).count !== 0) fail("Buf 06.03");
		if (Buf.augment([0, 1], 1).count !== 1) fail("Buf 06.031");
		expected = `&buf(0)[]`; outcome = Buf.augment([], 8); testv("Buf 06.041");
		expected = `&buf(1)[1]`; outcome = Buf.augment([1], 8); testv("Buf 06.042");
		arr = [1]; outcome = Buf.augment(arr); if (arr !== outcome) fail("Buf 06.05");
	}

	//	Category: Unit test
	//	Function: Run unit tests for `BufferPool` class methods.
	static unitTest_BufPool(result)
	{
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let bp, arr1, arr2;

		bp = new BufPool(null, 3, 1, 2, 0.5);
		if (bp.length !== 1) result.push(fail("BufferPool (001.001)", 1, bp.length));
		if (bp[0].length !== 3) result.push(fail("BufferPool (001.002)", 3, bp[0].length));
		if (bp[0].count !== 0) result.push(fail("BufferPool (001.003)", 0, bp[0].count));
		if (bp[0].index !== -1) result.push(fail("BufferPool (001.004)", 1, bp[0].index));
		if (bp[0].locked !== false) result.push(fail("BufferPool (001.005)", false, bp[0].locked));
		if (bp[0][0] !== void 0) result.push(fail("BufferPool (001.006)", void 0, bp[0][0]));

		arr1 = bp.hold();
		if (bp.needsRecycing) result.push(fail("BufferPool (002.000)", false, bp.needsRecycing));
		if (bp.length !== 1) result.push(fail("BufferPool (002.001)", 1, bp.length));
		if (bp._count !== 1) result.push(fail("BufferPool (002.002)", 1, bp._count));
		if (arr1.length !== 3) result.push(fail("BufferPool (002.003)", 3, arr1.length));
		if (arr1.count !== 0) result.push(fail("BufferPool (002.004)", 0, arr1.count));
		if (arr1.index !== 0) result.push(fail("BufferPool (002.005)", 0, arr1.index));
		if (arr1.locked !== true) result.push(fail("BufferPool (002.006)", true, arr1.locked));

		arr1 = bp.hold();
		if (bp.needsRecycing) result.push(fail("BufferPool (003.000)", false, bp.needsRecycing));
		if (bp.length !== 4) result.push(fail("BufferPool (003.001)", 4, bp.length));
		if (bp._count !== 2) result.push(fail("BufferPool (003.002)", 2, bp._count));
		if (arr1.length !== 3) result.push(fail("BufferPool (003.003)", 3, arr1.length));
		if (arr1.count !== 0) result.push(fail("BufferPool (003.004)", 0, arr1.count));
		if (arr1.index !== 1) result.push(fail("BufferPool (003.005)", 1, arr1.index));
		if (arr1.locked !== true) result.push(fail("BufferPool (003.006)", true, arr1.locked));

		bp.release(arr1);
		if (bp.needsRecycing) result.push(fail("BufferPool (004.000)", false, bp.needsRecycing));
		if (bp.length !== 4) result.push(fail("BufferPool (004.001)", 4, bp.length));
		if (bp._count !== 1) result.push(fail("BufferPool (004.002)", 1, bp._count));
		if (arr1.count !== 0) result.push(fail("BufferPool (004.004)", 0, arr1.count));
		if (arr1.index !== 1) result.push(fail("BufferPool (004.005)", 1, arr1.index));
		if (arr1.locked !== false) result.push(fail("BufferPool (004.006)", false, arr1.locked));

		bp = new BufPool(null, 3, 1, 2, 0.5);
		arr1 = bp.hold();
		arr2 = bp.hold();
		bp.release(arr1);
		if (bp.needsRecycing) result.push(fail("BufferPool (005.000)", false, bp.needsRecycing));
		if (bp.length !== 4) result.push(fail("BufferPool (005.001)", 4, bp.length));
		if (bp._count !== 2) result.push(fail("BufferPool (005.002)", 2, bp._count));
		if (arr1.count !== 0) result.push(fail("BufferPool (005.004)", 0, arr1.count));
		if (arr1.index !== 0) result.push(fail("BufferPool (005.005)", 0, arr1.index));
		if (arr1.locked !== false) result.push(fail("BufferPool (005.006)", false, arr1.locked));
		if (arr2.count !== 0) result.push(fail("BufferPool (005.007)", 0, arr2.count));
		if (arr2.index !== 1) result.push(fail("BufferPool (005.008)", 1, arr2.index));
		if (arr2.locked !== true) result.push(fail("BufferPool (005.009)", true, arr2.locked));

		bp.recycle();
		if (bp.needsRecycing) result.push(fail("BufferPool (006.000)", false, bp.needsRecycing));
		if (bp.length !== 4) result.push(fail("BufferPool (006.001)", 4, bp.length));
		if (bp._count !== 1) result.push(fail("BufferPool (006.002)", 1, bp._count));
		if (bp[0] !== arr2) result.push(fail("BufferPool (006.0031)", arr2, bp[0]));
		if (bp[1] !== arr1) result.push(fail("BufferPool (006.0032)", arr1, bp[1]));
		if (bp[0].count !== 0) result.push(fail("BufferPool (006.007)", 0, bp[0].count));
		if (bp[0].index !== 0) result.push(fail("BufferPool (006.008)", 0, bp[0].index));
		if (bp[0].locked !== true) result.push(fail("BufferPool (006.009)", true, bp[0].locked));
		if (bp[1].count !== 0) result.push(fail("BufferPool (006.004)", 0, bp[1].count));
		if (bp[1].index !== 0) result.push(fail("BufferPool (006.005)", 0, bp[1].index));
		if (bp[1].locked !== false) result.push(fail("BufferPool (006.006)", false, bp[1].locked));

		bp = new BufPool(null, 3, 1, 2, 0);
		arr1 = bp.hold();
		arr2 = bp.hold();
		bp.release(arr1);
		bp.hold();
		if (bp.needsRecycing) result.push(fail("BufferPool (007.0001)", false, bp.needsRecycing));
		bp.hold();
		if (!bp.needsRecycing) result.push(fail("BufferPool (007.0002)", true, bp.needsRecycing));
		bp.hold();
		if (bp.needsRecycing) result.push(fail("BufferPool (007.0003)", false, bp.needsRecycing));
		if (bp.length !== 4) result.push(fail("BufferPool (007.001)", 4, bp.length));
		if (bp._count !== 4) result.push(fail("BufferPool (007.002)", 4, bp._count));

		if (JSON.stringify(bp.analyse()) !== JSON.stringify({ heldCount: 4, heldElementCount: 16, totalElementCount: 16 })) result.push(fail("BufferPool (008.001)", JSON.stringify(bp.analyse()), JSON.stringify({ heldCount: 4, heldElementCount: 28, totalElementCount: 28 })));
		bp.release(arr2);
		if (JSON.stringify(bp.analyse()) !== JSON.stringify({ heldCount: 3, heldElementCount: 13, totalElementCount: 16 })) result.push(fail("BufferPool (008.002)", JSON.stringify(bp.analyse()), JSON.stringify({ heldCount: 3, heldElementCount: 22, totalElementCount: 28 })));

		if (!isBuf(buf())) result.push(fail("BufferPool.isBuffer (009.001)", true, false));
		if (!isBuf(arr2)) result.push(fail("BufferPool.isBuffer (009.002)", true, false));
		if (!isBuf(bp.hold())) result.push(fail("BufferPool.isBuffer (009.003)", true, false));
		if (isBuf({})) result.push(fail("BufferPool.isBuffer (009.004)", false, true));
		if (isBuf([])) result.push(fail("BufferPool.isBuffer (009.005)", false, true));

		bp = new BufPool(null, 0, 1, 2, 0);
		arr1 = bp.hold();
		if (arr1.length !== 0) result.push(fail("BufferPool (010.001)", 0, bp.length));
	}

	static unitTest_BufPoolTransaction(result)
	{
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let t, bp, b, b1, s = Symbol("s");

		bp = new BufPool(null, 3, 1, 2, 0.5);
		t = new BufPoolTransaction(bp);
		try
		{
			b = t.hold();
			if (bp.length !== 1) result.push(fail("BufPoolTransaction (001.001)", 1, bp.length));
			if (bp[0] !== b) result.push(fail("BufPoolTransaction (001.002)", b, bp[0]));
			if (!b.locked) result.push(fail("BufPoolTransaction (001.003)", true, b.locked));
		}
		finally
		{
			t.releaseAll();
			if (b.locked) result.push(fail("BufPoolTransaction (001.004)", false, b.locked));
		}

		bp = new BufPool(null, 3, 1, 2, 0.5);
		t = new BufPoolTransaction(bp, buf());
		try
		{
			b1 = t.hold(s);
			b = t.hold();
			if (bp.length !== 4) result.push(fail("BufPoolTransaction (002.001)", 4, bp.length));
			if (bp[1] !== b) result.push(fail("BufPoolTransaction (002.002)", b, bp[1]));
			if (!CompoundBuf.isOf(b1, s)) result.push(fail("BufPoolTransaction (002.003)", s, b1.PB_compoundType));
			if (!b1.locked) result.push(fail("BufPoolTransaction (002.004)", true, b1.locked));
			if (!b.locked) result.push(fail("BufPoolTransaction (002.005)", true, b.locked));
		}
		finally
		{
			t.releaseAll();
			if (b1.locked) result.push(fail("BufPoolTransaction (002.006)", false, b1.locked));
			if (b.locked) result.push(fail("BufPoolTransaction (002.007)", false, b.locked));
		}
	}
}

module.exports.UnitTests_BufferPool = module.exports;
