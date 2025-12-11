//	R0Q1/daniel/20220515
"use strict";

const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { List } = require("-/pb/natalis/014/List.js");
const {
	cost, carr, cbuf, buf,
	CompoundStructure, CompoundArray, CompoundBuf, Buf,
} = require("-/pb/natalis/013/Compound.js");

module.exports =

class UnitTests_List
{
	static unitTest_List_selectIf(result)
	{
		let subject, target, expected, outcome, tf;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no explicit target
		expected = `[]`; subject = []; tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf); test("List.selectIf 01.01.01");
		if (outcome !== subject) fail("List.selectIf 01.01.02");

		expected = `[]`; subject = [1]; tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf); test("List.selectIf 01.02.01");
		if (outcome !== subject) fail("List.selectIf 01.02.02");

		expected = `[2]`; subject = [1, 2]; tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf); test("List.selectIf 01.03.01");
		if (outcome !== subject) fail("List.selectIf 01.03.02");

		expected = `[1, 2, 2]`; subject = [1, 2]; tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf, null, 2); test("List.selectIf 01.04.01");
		if (outcome !== subject) fail("List.selectIf 01.04.02");

		expected = `[1, 2]`; subject = [1, 2]; tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf, null, 1); test("List.selectIf 01.05.01");
		if (outcome !== subject) fail("List.selectIf 01.05.02");

		expected = `&cost<a>[1, 2, 3]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; subject[CompoundStructure.LowerBound + 2] = 3; tf = (value, index) => true;
		outcome = List.selectIf(subject, tf, null); test("List.selectIf 01.06.01");
		if (outcome !== subject) fail("List.selectIf 01.06.02");

		expected = `&buf[1, 1, 2, 3]`; subject = buf(); subject[Buf.LowerBound] = 1; subject[Buf.LowerBound + 1] = 2; subject[Buf.LowerBound + 2] = 3; subject.count = 3; tf = (value, index) => true;
		outcome = List.selectIf(subject, tf, null, 1); test("List.selectIf 01.07.01");
		if (outcome !== subject) fail("List.selectIf 01.07.02");

		//	explicit target
		expected = `[]`; subject = []; target = [1, 2]; tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf, target); test("List.selectIf 02.01.01");
		if (outcome === subject) fail("List.selectIf 02.01.02");

		expected = `&buf[2]`; subject = [1, 2]; target = buf(); tf = (value, index) => index === 1;
		outcome = List.selectIf(subject, tf, target); test("List.selectIf 02.02.01");
		if (outcome === subject) fail("List.selectIf 02.02.02");

		expected = `[2]`; subject = [1, 2]; target = []; tf = (value, index) => value === 2;
		outcome = List.selectIf(subject, tf, target); test("List.selectIf 02.03.01");
		if (outcome === subject) fail("List.selectIf 02.03.02");

		expected = `[3, 4, 2]`; subject = [1, 2]; target = [3, 4]; tf = (value, index) => value === 2;
		outcome = List.selectIf(subject, tf, target, 2); test("List.selectIf 02.04.01");
		if (outcome === subject) fail("List.selectIf 02.04.02");

		expected = `[3, 2]`; subject = [1, 2]; target = [3, 4]; tf = (value, index) => value === 2;
		outcome = List.selectIf(subject, tf, target, 1); test("List.selectIf 02.05.01");
		if (outcome === subject) fail("List.selectIf 02.05.02");

		expected = `&cost<b>[1, 2, 3]`;
		subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; subject[CompoundStructure.LowerBound + 2] = 3;
		target = cost(Symbol("b")); target[CompoundStructure.LowerBound] = 33; target[CompoundStructure.LowerBound + 1] = 44; target[CompoundStructure.LowerBound + 2] = 55; target[CompoundStructure.LowerBound + 3] = 66;
		tf = (value, index) => true;
		outcome = List.selectIf(subject, tf, target); test("List.selectIf 02.06.01");
		if (outcome === subject) fail("List.selectIf 02.06.02");

		expected = `&cost<b>[...(empty), 1, 2, 3]`;
		subject = cost(Symbol("a"));
		subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; subject[CompoundStructure.LowerBound + 2] = 3;
		target = cost(Symbol("b"));
		tf = (value, index) => true;
		outcome = List.selectIf(subject, tf, target, 1); test("List.selectIf 02.07.01");
		if (outcome === subject) fail("List.selectIf 02.07.02");

		expected = `&buf[1, 2, 3]`;
		subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; subject[CompoundStructure.LowerBound + 1] = 2; subject[CompoundStructure.LowerBound + 2] = 3;
		target = buf(); target[Buf.LowerBound] = 33; target[Buf.LowerBound + 1] = 44; target[Buf.LowerBound + 2] = 55; target[Buf.LowerBound + 3] = 66; buf.count = 4;
		tf = (value, index) => true;
		outcome = List.selectIf(subject, tf, target); test("List.selectIf 02.08.01");
		if (outcome === subject) fail("List.selectIf 02.08.02");
	}

	static unitTest_List_transform(result)
	{
		let subject, target, expected, outcome, call_outcome;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		const transformList = (src, srcCount, srcLowerBound, srcUpperBound, dest, destCount, destLowerBound, destUpperBound) =>
		{
			outcome = { src, srcCount, srcLowerBound, srcUpperBound, dest, destCount, destLowerBound, destUpperBound };
		};

		//	no explicit target
		expected = `{ "src": [], "srcCount": 0, "srcLowerBound": 0, "srcUpperBound": -1, "dest": &Array@9, "destCount": 0, "destLowerBound": 0, "destUpperBound": -1 }`;
		subject = [];
		call_outcome = List.transform(subject, transformList); test("List.transform 01.01.01");
		if (call_outcome !== subject) fail("List.transform 01.01.02");

		expected = `{ "src": [1, 2, "a"], "srcCount": 3, "srcLowerBound": 0, "srcUpperBound": 2, "dest": &Array@9, "destCount": 3, "destLowerBound": 0, "destUpperBound": 2 }`;
		subject = [1, 2, 'a'];
		call_outcome = List.transform(subject, transformList); test("List.transform 01.02.01");
		if (call_outcome !== subject) fail("List.transform 01.02.02");

		expected = `{ "src": [1, 2, "a"], "srcCount": 3, "srcLowerBound": 0, "srcUpperBound": 2, "dest": &Array@9, "destCount": 3, "destLowerBound": 2, "destUpperBound": 4 }`;
		subject = [1, 2, 'a'];
		call_outcome = List.transform(subject, transformList, null, 2); test("List.transform 01.03.01");
		if (call_outcome !== subject) fail("List.transform 01.03.02");

		//	explicit target
		expected = `{ "src": [], "srcCount": 0, "srcLowerBound": 0, "srcUpperBound": -1, "dest": [3, 4], "destCount": 2, "destLowerBound": 0, "destUpperBound": 1 }`;
		subject = []; target = [3, 4];
		call_outcome = List.transform(subject, transformList, target); test("List.transform 02.01.01");
		if (call_outcome === subject) fail("List.transform 02.01.02");

		expected = `{ "src": [1, 2, "a"], "srcCount": 3, "srcLowerBound": 0, "srcUpperBound": 2, "dest": [6, "b"], "destCount": 2, "destLowerBound": 0, "destUpperBound": 1 }`;
		subject = [1, 2, 'a']; target = [6, 'b'];
		call_outcome = List.transform(subject, transformList, target); test("List.transform 02.02.01");
		if (call_outcome === subject) fail("List.transform 02.02.02");

		expected = `{ "src": [1, 2, "a"], "srcCount": 3, "srcLowerBound": 0, "srcUpperBound": 2, "dest": [6, "b"], "destCount": 2, "destLowerBound": 2, "destUpperBound": 3 }`;
		subject = [1, 2, 'a']; target = [6, 'b'];
		call_outcome = List.transform(subject, transformList, target, 2); test("List.transform 02.03.01");
		if (call_outcome === subject) fail("List.transform 02.03.02");
	}

	static unitTest_List_sort(result)
	{
		let subject, target, expected, outcome, compare;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no explicit target
		expected = `[]`; subject = []; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.01.01");
		if (outcome !== subject) fail("List.sort 01.01.02");

		expected = `[1]`; subject = [1]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.02.01");
		if (outcome !== subject) fail("List.sort 01.02.02");

		expected = `[1, 2, 3]`; subject = [1, 2, 3]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.03.01");
		if (outcome !== subject) fail("List.sort 01.03.02");

		expected = `[1, 2, 3]`; subject = [2, 3, 1]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.04.01");
		if (outcome !== subject) fail("List.sort 01.04.02");

		expected = `&cost<a>[1, 2, 3]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 2; subject[CompoundStructure.LowerBound + 1] = 3; subject[CompoundStructure.LowerBound + 2] = 1; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.05.01");
		if (outcome !== subject) fail("List.sort 01.05.02");

		expected = `&carr<a>[1, 2, 3]`; subject = carr(Symbol("a")); subject[CompoundArray.LowerBound] = 2; subject[CompoundArray.LowerBound + 1] = 3; subject[CompoundArray.LowerBound + 2] = 1; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.06.01");
		if (outcome !== subject) fail("List.sort 01.06.02");

		expected = `&cbuf<a>[1, 2, 3]`; subject = cbuf(Symbol("a")); subject[CompoundBuf.LowerBound] = 2; subject[CompoundBuf.LowerBound + 1] = 3; subject[CompoundBuf.LowerBound + 2] = 1; subject.count = 3; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.07.01");
		if (outcome !== subject) fail("List.sort 01.07.02");

		expected = `&buf[1, 2, 3]`; subject = buf(); subject[Buf.LowerBound] = 2; subject[Buf.LowerBound + 1] = 3; subject[Buf.LowerBound + 2] = 1; subject.count = 3; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare); test("List.sort 01.08.01");
		if (outcome !== subject) fail("List.sort 01.08.02");

		//	explicit target
		expected = `[]`; subject = []; target = [3, 4]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.01.01");
		if (outcome === subject) fail("List.sort 02.01.02");

		expected = `[1]`; subject = [1]; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.02.01");
		if (outcome === subject) fail("List.sort 02.02.02");

		expected = `[1, 2, 3]`; subject = [1, 2, 3]; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.03.01");
		if (outcome === subject) fail("List.sort 02.03.02");

		expected = `[3, 2, 1]`; subject = [1, 2, 3]; target = []; compare = (l, r) => r - l;
		outcome = List.sort(subject, compare, target); test("List.sort 02.031.01");
		if (outcome === subject) fail("List.sort 02.031.02");

		expected = `[1, 2, 3]`; subject = [2, 1, 3]; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.04.01");
		if (outcome === subject) fail("List.sort 02.04.02");

		expected = `[1, 2, 3]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 2; subject[CompoundStructure.LowerBound + 1] = 3; subject[CompoundStructure.LowerBound + 2] = 1; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.051.01");
		if (outcome === subject) fail("List.sort 02.051.02");

		expected = `&cost<a>[1, 2, 3]`; subject = [2, 1, 3]; target = cost(Symbol("a")); compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.052.01");
		if (outcome === subject) fail("List.sort 02.052.02");

		expected = `[1, 2, 3]`; subject = carr(Symbol("a")); subject[CompoundArray.LowerBound] = 2; subject[CompoundArray.LowerBound + 1] = 3; subject[CompoundArray.LowerBound + 2] = 1; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.061.01");
		if (outcome === subject) fail("List.sort 02.061.02");

		expected = `&carr<a>[1, 2, 3]`; subject = [2, 1, 3]; target = carr(Symbol("a")); compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.062.01");
		if (outcome === subject) fail("List.sort 02.062.02");

		expected = `[1, 2, 3]`; subject = cbuf(Symbol("a")); subject[CompoundBuf.LowerBound] = 2; subject[CompoundBuf.LowerBound + 1] = 3; subject[CompoundBuf.LowerBound + 2] = 1; subject.count = 3; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.071.01");
		if (outcome === subject) fail("List.sort 02.071.02");

		expected = `&cbuf<a>[1, 2, 3]`; subject = [2, 1, 3]; target = cbuf(Symbol("a")); target.count = 3; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.072.01");
		if (outcome === subject) fail("List.sort 02.072.02");

		expected = `[1, 2, 3]`; subject = buf(); subject[Buf.LowerBound] = 2; subject[Buf.LowerBound + 1] = 3; subject[Buf.LowerBound + 2] = 1; subject.count = 3; target = [3, 4, 5]; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.081.01");
		if (outcome === subject) fail("List.sort 02.081.02");

		expected = `&buf[1, 2, 3]`; subject = [2, 1, 3]; target = buf(); target.count = 3; compare = (l, r) => l - r;
		outcome = List.sort(subject, compare, target); test("List.sort 02.082.01");
		if (outcome === subject) fail("List.sort 02.082.02");
	}

	static unitTest_List_append(result)
	{
		let subject, target, expected, outcome;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no explicit target
		expected = `[1]`; subject = [];
		outcome = List.append(subject, 1); test("List.append 01.01.01");
		if (outcome !== subject) fail("List.append 01.01.02");

		expected = `&cost<a>[1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1;
		outcome = List.append(subject, 2); test("List.append 01.02.01");
		if (outcome !== subject) fail("List.append 01.02.02");

		expected = `&buf[1, 2]`; subject = buf(); subject[Buf.LowerBound] = 1; subject.count = 1;
		outcome = List.append(subject, 2); test("List.append 01.03.01");
		if (outcome !== subject) fail("List.append 01.03.02");

		//	explicit target
		expected = `[1]`; subject = []; target = [3, 4];
		outcome = List.append(subject, 1, target); test("List.append 02.01.01");
		if (outcome === subject) fail("List.append 02.01.02");

		expected = `[1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; target = [5, 6];
		outcome = List.append(subject, 2, target); test("List.append 02.02.01");
		if (outcome === subject) fail("List.append 02.02.02");

		expected = `&cost<b>[1, 2]`; subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 1; target = cost(Symbol("b")); target[CompoundStructure.LowerBound] = 7;
		outcome = List.append(subject, 2, target); test("List.append 02.03.01");
		if (outcome === subject) fail("List.append 02.03.02");

		expected = `&buf[1, 2]`; subject = buf(); subject[Buf.LowerBound] = 1; subject.count = 1; target = buf(); 
		outcome = List.append(subject, 2, target); test("List.append 02.03.01");
		if (outcome === subject) fail("List.append 02.03.02");
	}

	static unitTest_List_appendRange(result)
	{
		let subject, subject2, target, expected, outcome;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no explicit target
		expected = `[]`; subject = []; subject2 = [];
		outcome = List.appendRange(subject, subject2); test("List.appendRange 01.01.01");
		if (outcome !== subject) fail("List.appendRange 01.01.02");

		expected = `[1, 2, 3, 4]`; subject = [1, 2]; subject2 = [3, 4];
		outcome = List.appendRange(subject, subject2); test("List.appendRange 01.02.01");
		if (outcome !== subject) fail("List.appendRange 01.02.02");

		//	explicit target
		expected = `[]`; subject = []; subject2 = []; target = [3, 4];
		outcome = List.appendRange(subject, subject2, target); test("List.appendRange 02.01.01");
		if (outcome === subject) fail("List.appendRange 02.01.02");

		expected = `[1, 2, 3, 4]`; subject = [1, 2]; subject2 = [3, 4]; target = [5, 6, 7, 8, 9];
		outcome = List.appendRange(subject, subject2, target); test("List.appendRange 02.02.01");
		if (outcome === subject) fail("List.appendRange 02.02.02");
	}

	static unitTest_List_insert(result)
	{
		let subject, target, expected, outcome;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no explicit target
		expected = `[1]`; subject = [];
		outcome = List.insert(subject, 0, 1); test("List.insert 01.01.01");
		if (outcome !== subject) fail("List.insert 01.01.02");

		expected = `["a", 1]`; subject = ['a'];
		outcome = List.insert(subject, 1, 1); test("List.insert 01.02.01");
		if (outcome !== subject) fail("List.insert 01.02.02");

		expected = `[1, "a"]`; subject = ['a'];
		outcome = List.insert(subject, 0, 1); test("List.insert 01.03.01");
		if (outcome !== subject) fail("List.insert 01.03.02");

		expected = `["a", 1, "b"]`; subject = ['a', 'b'];
		outcome = List.insert(subject, 1, 1); test("List.insert 01.04.01");
		if (outcome !== subject) fail("List.insert 01.04.02");

		expected = `["a", 1]`; subject = ['a'];
		outcome = List.insert(subject, 1, 1); test("List.insert 01.05.01");	//	append
		if (outcome !== subject) fail("List.insert 01.05.02");

		expected = `[1, "a"]`; subject = ['a'];
		outcome = List.insert(subject, -1, 1); test("List.insert 01.06.01");//	prepend
		if (outcome !== subject) fail("List.insert 01.06.02");

		expected = `["a", 1, "b"]`; subject = ['a', 'b'];
		outcome = List.insert(subject, -1, 1); test("List.insert 01.07.01");
		if (outcome !== subject) fail("List.insert 01.07.02");

		expected = `&buf[1]`; subject = buf();
		outcome = List.insert(subject, 0, 1); test("List.insert 02.01.01");
		if (outcome !== subject) fail("List.insert 02.01.02");

		expected = `&buf["a", 1]`; subject = buf(); subject[Buf.LowerBound] = 'a'; subject.count = 1;
		outcome = List.insert(subject, 1, 1); test("List.insert 02.02.01");
		if (outcome !== subject) fail("List.insert 02.02.02");

		expected = `&buf[1, "a"]`; subject = buf(); subject[Buf.LowerBound] = 'a'; subject.count = 1;
		outcome = List.insert(subject, 0, 1); test("List.insert 02.03.01");
		if (outcome !== subject) fail("List.insert 02.03.02");

		expected = `&buf["a", 1, "b"]`; subject = buf(); subject[Buf.LowerBound] = 'a'; subject[Buf.LowerBound + 1] = 'b'; subject.count = 2;
		outcome = List.insert(subject, 1, 1); test("List.insert 02.04.01");
		if (outcome !== subject) fail("List.insert 02.04.02");

		//	explicit target
		expected = `[1]`; subject = []; target = [3, 4];
		outcome = List.insert(subject, 0, 1, target); test("List.insert 03.01.01");
		if (outcome === subject) fail("List.insert 03.01.02");

		expected = `["a", 1]`; subject = ['a']; target = [];
		outcome = List.insert(subject, 1, 1, target); test("List.insert 03.02.01");
		if (outcome === subject) fail("List.insert 03.02.02");

		expected = `[1, "a"]`; subject = ['a']; target = [];
		outcome = List.insert(subject, 0, 1, target); test("List.insert 03.03.01");
		if (outcome === subject) fail("List.insert 03.03.02");

		expected = `["a", 1, "b"]`; subject = ['a', 'b']; target = ['c', 'd', 'e', 'f'];
		outcome = List.insert(subject, 1, 1, target); test("List.insert 03.04.01");
		if (outcome === subject) fail("List.insert 03.04.02");

		expected = `["a", 1]`; subject = ['a']; target = [];
		outcome = List.insert(subject, 1, 1, target); test("List.insert 03.05.01");	//	append
		if (outcome === subject) fail("List.insert 03.05.02");

		expected = `[1, "a"]`; subject = ['a']; target = [];
		outcome = List.insert(subject, -1, 1, target); test("List.insert 03.06.01");//	prepend
		if (outcome === subject) fail("List.insert 03.06.02");

		expected = `["a", 1, "b"]`; subject = ['a', 'b']; target = ['c', 'd', 'e', 'f'];
		outcome = List.insert(subject, -1, 1, target); test("List.insert 03.07.01");
		if (outcome === subject) fail("List.insert 03.07.02");

		expected = `&buf[1]`; subject = buf(); target = buf();
		outcome = List.insert(subject, 0, 1, target); test("List.insert 04.01.01");
		if (outcome === subject) fail("List.insert 04.01.02");

		expected = `&buf["a", 1]`; subject = buf(); subject[Buf.LowerBound] = 'a'; subject.count = 1; target = buf();
		outcome = List.insert(subject, 1, 1, target); test("List.insert 04.02.01");
		if (outcome === subject) fail("List.insert 04.02.02");

		expected = `&buf[1, "a"]`; subject = buf(); subject[Buf.LowerBound] = 'a'; subject.count = 1; target = buf(); target[Buf.LowerBound] = 'c'; target[Buf.LowerBound + 1] = 'd'; target[Buf.LowerBound + 2] = 'e'; target.count = 3;
		outcome = List.insert(subject, 0, 1, target); test("List.insert 04.03.01");
		if (outcome === subject) fail("List.insert 04.03.02");

		expected = `&buf["a", 1, "b"]`; subject = buf(); subject[Buf.LowerBound] = 'a'; subject[Buf.LowerBound + 1] = 'b'; subject.count = 2; target = buf();
		outcome = List.insert(subject, 1, 1, target); test("List.insert 04.04.01");
		if (outcome === subject) fail("List.insert 04.04.02");
	}

	static unitTest_List_insertRange(result)
	{
		let subject, subject2, target, expected, outcome;

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no explicit target
		expected = `[]`; subject = []; subject2 = [];
		outcome = List.insertRange(subject, 0, subject2); test("List.insertRange 01.01.01");
		if (outcome !== subject) fail("List.insertRange 01.01.02");

		expected = `[1]`; subject = []; subject2 = [1];
		outcome = List.insertRange(subject, 0, subject2); test("List.insertRange 01.02.01");
		if (outcome !== subject) fail("List.insertRange 01.02.02");

		expected = `[3, 4, 1, 2]`; subject = [1, 2]; subject2 = [3, 4];
		outcome = List.insertRange(subject, 0, subject2); test("List.insertRange 01.03.01");
		if (outcome !== subject) fail("List.insertRange 01.03.02");

		expected = `[1, 3, 4, 2]`; subject = [1, 2]; subject2 = [3, 4];
		outcome = List.insertRange(subject, 1, subject2); test("List.insertRange 01.04.01");
		if (outcome !== subject) fail("List.insertRange 01.04.02");

		expected = `[1, 2, 3, 4]`; subject = [1, 2]; subject2 = [3, 4];
		outcome = List.insertRange(subject, 2, subject2); test("List.insertRange 01.05.01");
		if (outcome !== subject) fail("List.insertRange 01.05.02");

		expected = `[1, 3, 4, 2]`; subject = [1, 2]; subject2 = [3, 4];
		outcome = List.insertRange(subject, -1, subject2); test("List.insertRange 01.06.01");
		if (outcome !== subject) fail("List.insertRange 01.06.02");

		expected = `[3, 4, 1, 2]`; subject = [1, 2]; subject2 = [3, 4];
		outcome = List.insertRange(subject, -2, subject2); test("List.insertRange 01.07.01");
		if (outcome !== subject) fail("List.insertRange 01.07.02");

		//	explicit target
		expected = `[]`; subject = []; subject2 = []; target = [3, 4];
		outcome = List.insertRange(subject, 0, subject2, target); test("List.insertRange 03.01.01");
		if (outcome === subject) fail("List.insertRange 03.01.02");

		expected = `[1]`; subject = []; subject2 = [1]; target = [];
		outcome = List.insertRange(subject, 0, subject2, target); test("List.insertRange 03.02.01");
		if (outcome === subject) fail("List.insertRange 03.02.02");

		expected = `[3, 4, 1, 2]`; subject = [1, 2]; subject2 = [3, 4]; target = [];
		outcome = List.insertRange(subject, 0, subject2, target); test("List.insertRange 03.03.01");
		if (outcome === subject) fail("List.insertRange 03.03.02");

		expected = `[1, 3, 4, 2]`; subject = [1, 2]; subject2 = [3, 4]; target = [5, 6, 7, 8, 9, 10];
		outcome = List.insertRange(subject, 1, subject2, target); test("List.insertRange 03.04.01");
		if (outcome === subject) fail("List.insertRange 03.04.02");

		expected = `[1, 2, 3, 4]`; subject = [1, 2]; subject2 = [3, 4]; target = [5, 6, 7];
		outcome = List.insertRange(subject, 2, subject2, target); test("List.insertRange 03.05.01");
		if (outcome === subject) fail("List.insertRange 03.05.02");

		expected = `[1, 3, 4, 2]`; subject = [1, 2]; subject2 = [3, 4]; target = [5, 6, 7];
		outcome = List.insertRange(subject, -1, subject2, target); test("List.insertRange 03.06.01");
		if (outcome === subject) fail("List.insertRange 03.06.02");

		expected = `[3, 4, 1, 2]`; subject = [1, 2]; subject2 = [3, 4]; target = [];
		outcome = List.insertRange(subject, -2, subject2, target); test("List.insertRange 03.07.01");
		if (outcome === subject) fail("List.insertRange 03.07.02");
	}

	static unitTest_List_makeSet(result)
	{
		let subject, target, expected, outcome;
		const a = { v: 'a' }, b = { v: 'b' }, c = { v: 'c' };

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		const equals = (a, b) => a == b;	//	will match (1, '1') as opposed to the no-equals implementation that tests for equality useing `Set.has` (i.e. `a === b`)

		//	no explicit target, no equals
		expected = `[]`; subject = []; outcome = List.makeSet(subject); test("List.makeSet 01.01.01");
		if (outcome !== subject) fail("List.makeSet 01.01.02");

		expected = `[1, 2]`; subject = [1, 2]; outcome = List.makeSet(subject); test("List.makeSet 01.02.01");
		if (outcome !== subject) fail("List.makeSet 01.02.02");

		expected = `[1, 2, 3]`; subject = [1, 2, 1, 3]; outcome = List.makeSet(subject); test("List.makeSet 01.03.01");
		if (outcome !== subject) fail("List.makeSet 01.03.02");

		expected = `[{ "v": "a" }, { "v": "b" }, { "v": "c" }]`; subject = [a, b, a, c]; outcome = List.makeSet(subject); test("List.makeSet 01.04.01");
		if (outcome !== subject) fail("List.makeSet 01.04.02");

		//	no explicit target, equals
		expected = `[]`; subject = []; outcome = List.makeSet(subject, equals); test("List.makeSet 02.01.01");
		if (outcome !== subject) fail("List.makeSet 02.01.02");

		expected = `[1, 2]`; subject = [1, 2]; outcome = List.makeSet(subject, equals); test("List.makeSet 02.02.01");
		if (outcome !== subject) fail("List.makeSet 02.02.02");

		expected = `[1]`; subject = [1, '1']; outcome = List.makeSet(subject, equals); test("List.makeSet 02.03.01");
		if (outcome !== subject) fail("List.makeSet 02.03.02");

		expected = `[1, 2, 3]`; subject = [1, 2, '1', 3]; outcome = List.makeSet(subject, equals); test("List.makeSet 02.04.01");
		if (outcome !== subject) fail("List.makeSet 02.04.02");

		//	explicit target, no equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.makeSet(subject, null, target); test("List.makeSet 03.01.01");
		if (outcome === subject) fail("List.makeSet 03.01.02");

		expected = `[1, 2]`; subject = [1, 2]; target = [3, 4, 5];
		outcome = List.makeSet(subject, null, target); test("List.makeSet 03.02.01");
		if (outcome === subject) fail("List.makeSet 03.02.02");

		expected = `[1, 2, 3]`; subject = [1, 2, 1, 3]; target = [];
		outcome = List.makeSet(subject, null, target); test("List.makeSet 03.03.01");
		if (outcome === subject) fail("List.makeSet 03.03.02");

		expected = `[{ "v": "a" }, { "v": "b" }, { "v": "c" }]`; subject = [a, b, a, c]; target = [];
		outcome = List.makeSet(subject, null, target); test("List.makeSet 03.04.01");
		if (outcome === subject) fail("List.makeSet 03.04.02");

		//	explicit target, equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.makeSet(subject, equals, target); test("List.makeSet 04.01.01");
		if (outcome === subject) fail("List.makeSet 04.01.02");

		expected = `[1, 2]`; subject = [1, 2]; target = [];
		outcome = List.makeSet(subject, equals, target); test("List.makeSet 04.02.01");
		if (outcome === subject) fail("List.makeSet 04.02.02");

		expected = `[1]`; subject = [1, '1']; target = [];
		outcome = List.makeSet(subject, equals, target); test("List.makeSet 04.03.01");
		if (outcome === subject) fail("List.makeSet 04.03.02");

		expected = `[1, 2, 3]`; subject = [1, 2, '1', 3]; target = [];
		outcome = List.makeSet(subject, equals, target); test("List.makeSet 04.04.01");
		if (outcome === subject) fail("List.makeSet 04.04.02");
	}

	static unitTest_List_unionSet(result)
	{
		let subject, target, expected, outcome;
		const a = { v: 'a' }, b = { v: 'b' }, c = { v: 'c' };

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		const equals = (a, b) => a == b;	//	will match (1, '1') as opposed to the no-equals implementation that tests for equality useing `Set.has` (i.e. `a === b`)

		//	no explicit target, no equals
		expected = `[]`; subject = [[]]; outcome = List.unionSet(subject); test("List.unionSet 01.01.01");
		if (outcome !== subject[0]) fail("List.unionSet 01.01.02");

		expected = `[1, 2]`; subject = [[1, 2, 1]]; outcome = List.unionSet(subject); test("List.unionSet 01.02.01");
		if (outcome !== subject[0]) fail("List.unionSet 01.02.02");

		expected = `[1, 2, { "v": "a" }, { "v": "b" }]`; subject = [[1, 2, a], [a, b, 2]]; outcome = List.unionSet(subject); test("List.unionSet 01.03.01");
		if (outcome !== subject[0]) fail("List.unionSet 01.03.02");

		expected = `[1, 2, 3]`; subject = [[1, 1, 2], [3, 1, 3]]; outcome = List.unionSet(subject); test("List.unionSet 01.04.01");
		if (outcome !== subject[0]) fail("List.unionSet 01.04.02");
		if (Diagnostics.format(subject[1]) !== `[3, 1, 3]`) fail("List.unionSet 01.04.03");

		expected = `[1, 2, "1"]`; subject = [[1, 2, '1']]; outcome = List.unionSet(subject); test("List.unionSet 01.05.01");
		if (outcome !== subject[0]) fail("List.unionSet 01.05.02");

		//	no explicit target, equals
		expected = `[]`; subject = [[]]; outcome = List.unionSet(subject, equals); test("List.unionSet 02.01.01");
		if (outcome !== subject[0]) fail("List.unionSet 02.01.02");

		expected = `[1, 2]`; subject = [[1, 2, '1']]; outcome = List.unionSet(subject, equals); test("List.unionSet 02.02.01");
		if (outcome !== subject[0]) fail("List.unionSet 02.02.02");

		expected = `[1, 2, { "v": "a" }, { "v": "b" }]`; subject = [[1, 2, a], [a, b, '2']]; outcome = List.unionSet(subject, equals); test("List.unionSet 02.03.01");
		if (outcome !== subject[0]) fail("List.unionSet 02.03.02");

		//	explicit target, no equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.unionSet(subject, null, target); test("List.unionSet 03.01.01");

		expected = `[]`; subject = [[]]; target = [3, 4];
		outcome = List.unionSet(subject, null, target); test("List.unionSet 03.02.01");

		expected = `[1, 2]`; subject = [[1, 2, 1]]; target = [3, 4, 5, 6, 7];
		outcome = List.unionSet(subject, null, target); test("List.unionSet 03.03.01");
		if (outcome === subject[0]) fail("List.unionSet 03.03.02");

		expected = `[1, 2, { "v": "a" }, { "v": "b" }]`; subject = [[1, 2, a], [a, b, 2]]; target = [3, 4, 5, 6, 7];
		outcome = List.unionSet(subject, null, target); test("List.unionSet 03.04.01");
		if (outcome === subject[0]) fail("List.unionSet 03.04.02");

		expected = `[1, 2, 3]`; subject = [[1, 1, 2], [3, 1, 3]]; target = [3, 4, 5, 6, 7];
		outcome = List.unionSet(subject, null, target); test("List.unionSet 03.05.01");
		if (outcome === subject[0]) fail("List.unionSet 03.05.02");

		expected = `[1, 2, "1"]`; subject = [[1, 2, '1']]; target = [3, 4, 5, 6, 7];
		outcome = List.unionSet(subject, null, target); test("List.unionSet 03.06.01");
		if (outcome === subject[0]) fail("List.unionSet 03.06.02");

		//	explicit target, equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.unionSet(subject, equals, target); test("List.unionSet 04.01.01");

		expected = `[]`; subject = [[]]; target = [3, 4];
		outcome = List.unionSet(subject, equals, target); test("List.unionSet 04.02.01");

		expected = `[1, 2]`; subject = [[1, 2, '1']]; target = [3, 4];
		outcome = List.unionSet(subject, equals, target); test("List.unionSet 04.03.01");
		if (outcome === subject[0]) fail("List.unionSet 04.03.02");

		expected = `[1, 2, { "v": "a" }, { "v": "b" }]`; subject = [[1, 2, a], [a, b, '2']]; target = [3, 4];
		outcome = List.unionSet(subject, equals, target); test("List.unionSet 04.04.01");
		if (outcome === subject[0]) fail("List.unionSet 04.04.02");
	}

	static unitTest_List_intersectionSet(result)
	{
		let subject, target, expected, outcome, temp;
		const a = { v: 'a' }, b = { v: 'b' }, c = { v: 'c' };

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		const equals = (a, b) => a == b;	//	will match (1, '1') as opposed to the no-equals implementation that tests for equality useing `Set.has` (i.e. `a === b`)

		//	no explicit target, no equals
		expected = `[]`; subject = [[]]; outcome = List.intersectionSet(subject); test("List.intersectionSet 01.01.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.01.02");

		expected = `[]`; subject = [[1, 2, 3, 2]]; outcome = List.intersectionSet(subject); test("List.intersectionSet 01.02.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.02.02");

		expected = `[]`; subject = [[], [1, 2, 3]]; outcome = List.intersectionSet(subject); test("List.intersectionSet 01.03.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.03.02");

		expected = `[1, 3]`; subject = [[0, 1, 5, 3], [1, 2, 3]]; outcome = List.intersectionSet(subject); test("List.intersectionSet 01.04.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.04.02");

		expected = `[{ "v": "a" }, 3]`; subject = [[0, a, 5, 3], [1, a, '3'], [b, 3]]; outcome = List.intersectionSet(subject); test("List.intersectionSet 01.05.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.05.02");

		expected = `&cost<a>[1, 3]`;
		temp = cost(Symbol("a")); temp[CompoundStructure.LowerBound] = 0; temp[CompoundStructure.LowerBound + 1] = 1; temp[CompoundStructure.LowerBound + 2] = 5; temp[CompoundStructure.LowerBound + 3] = 3;
		subject = [temp, [1, 2, '3'], [3]];
		outcome = List.intersectionSet(subject); test("List.intersectionSet 01.06.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.06.02");

		expected = `&buf[1, 3]`;
		temp = buf(); temp[Buf.LowerBound] = 0; temp[Buf.LowerBound + 1] = 1; temp[Buf.LowerBound + 2] = 5; temp[Buf.LowerBound + 3] = 3; temp.count = 4;
		subject = [temp, [1, 2, '3'], [3]];
		outcome = List.intersectionSet(subject); test("List.intersectionSet 01.07.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 01.07.02");

		//	no explicit target, equals
		expected = `[]`; subject = [[]]; outcome = List.intersectionSet(subject, equals); test("List.intersectionSet 02.01.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 02.01.02");

		expected = `[1, 3]`; subject = [[0, 1, 5, 3], [1, 2, '3']]; outcome = List.intersectionSet(subject, equals); test("List.intersectionSet 02.04.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 02.04.02");

		expected = `[1, 3, 2]`; subject = [[0, 1, 5, 3], [1, 2, '3'], [2]]; outcome = List.intersectionSet(subject, equals); test("List.intersectionSet 02.05.01");
		if (outcome !== subject[0]) fail("List.intersectionSet 02.05.02");

		//	explicit target, no equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.intersectionSet(subject, null, target); test("List.intersectionSet 03.01.01");

		expected = `[]`; subject = [[]]; target = [3, 4];
		outcome = List.intersectionSet(subject, null, target); test("List.intersectionSet 03.02.01");

		expected = `[]`; subject = [[1, 2, 1]]; target = [3, 4, 5, 6, 7];
		outcome = List.intersectionSet(subject, null, target); test("List.intersectionSet 03.03.01");
		if (outcome === subject[0]) fail("List.unionSet 03.03.02");

		expected = `[1, 3]`; subject = [[0, 1, 5, 3], [1, 2, 3]]; target = [33, 44, 55, 66, 77];
		outcome = List.intersectionSet(subject, null, target); test("List.intersectionSet 03.04.01");
		if (outcome === subject[0]) fail("List.unionSet 03.04.02");

		//	explicit target, equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.intersectionSet(subject, equals, target); test("List.intersectionSet 04.01.01");

		expected = `[]`; subject = [[]]; target = [3, 4];
		outcome = List.intersectionSet(subject, equals, target); test("List.intersectionSet 04.02.01");

		expected = `[]`; subject = [[1, 2, '1']]; target = [3, 4];
		outcome = List.intersectionSet(subject, equals, target); test("List.intersectionSet 04.03.01");
		if (outcome === subject[0]) fail("List.intersectionSet 04.03.02");

		expected = `[1, "3"]`; subject = [[0, 1, 5, '3'], [1, 2, 3]]; target = [33, 44, 55, 66, 77];
		outcome = List.intersectionSet(subject, equals, target); test("List.intersectionSet 04.05.01");
		if (outcome === subject[0]) fail("List.unionSet 04.05.02");
	}

	static unitTest_List_subtractionSet(result)
	{
		let subject, target, expected, outcome, temp;
		const a = { v: 'a' }, b = { v: 'b' }, c = { v: 'c' };

		const fail = testName => result.push({ testName });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		const equals = (a, b) => a == b;	//	will match (1, '1') as opposed to the no-equals implementation that tests for equality useing `Set.has` (i.e. `a === b`)

		//	no explicit target, no equals
		 expected = `[]`; subject = [[]]; outcome = List.subtractionSet(subject); test("List.subtractionSet 01.01.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.01.02");

		expected = `[]`; subject = [[], []]; outcome = List.subtractionSet(subject); test("List.subtractionSet 01.02.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.02.02");

		expected = `[1, 2]`; subject = [[1, 2]]; outcome = List.subtractionSet(subject); test("List.subtractionSet 01.03.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.03.02");

		expected = `[2, 3]`; subject = [[1, 2, 3], [1]]; outcome = List.subtractionSet(subject); test("List.subtractionSet 01.04.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.04.02");

		expected = `[]`; subject = [[1, 2, 3], [2, 4], [3, 1, 5]]; outcome = List.subtractionSet(subject); test("List.subtractionSet 01.05.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.05.02");

		expected = `&cost<a>[0, 5]`;
		temp = cost(Symbol("a")); temp[CompoundStructure.LowerBound] = 0; temp[CompoundStructure.LowerBound + 1] = 1; temp[CompoundStructure.LowerBound + 2] = 5; temp[CompoundStructure.LowerBound + 3] = 3;
		subject = [temp, [1, 2], [3]];
		outcome = List.subtractionSet(subject); test("List.subtractionSet 01.06.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.06.02");

		expected = `&buf[0, 5]`;
		temp = buf(); temp[Buf.LowerBound] = 0; temp[Buf.LowerBound + 1] = 1; temp[Buf.LowerBound + 2] = 5; temp[Buf.LowerBound + 3] = 3; temp.count = 4;
		subject = [temp, [1, 3, 7], [7, 2]];
		outcome = List.subtractionSet(subject); test("List.subtractionSet 01.07.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 01.07.02");

		//	no explicit target, equals
		expected = `[]`; subject = [[]]; outcome = List.subtractionSet(subject, equals); test("List.subtractionSet 02.01.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 02.01.02");

		expected = `[{ "v": "b" }]`; subject = [[1, 2, a, b], ['2', 4], [a, 1, 5]]; outcome = List.subtractionSet(subject, equals); test("List.subtractionSet 02.02.01");
		if (outcome !== subject[0]) fail("List.subtractionSet 02.02.02");

		//	explicit target, no equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.subtractionSet(subject, null, target); test("List.subtractionSet 03.01.01");

		expected = `[]`; subject = [[]]; target = [3, 4];
		outcome = List.subtractionSet(subject, null, target); test("List.subtractionSet 03.02.01");

		expected = `[1]`; subject = [[1]]; target = [3, 4, 5, 6, 7];
		outcome = List.subtractionSet(subject, null, target); test("List.subtractionSet 03.03.01");
		if (outcome === subject[0]) fail("List.unionSet 03.03.02");

		expected = `[]`; subject = [[1], [2, 1]]; target = [3, 4, 5, 6, 7];
		outcome = List.subtractionSet(subject, null, target); test("List.subtractionSet 03.04.01");
		if (outcome === subject[0]) fail("List.unionSet 03.04.02");

		//	explicit target, equals
		expected = `[]`; subject = []; target = [3, 4];
		outcome = List.subtractionSet(subject, equals, target); test("List.subtractionSet 04.01.01");

		expected = `[]`; subject = [[]]; target = [3, 4];
		outcome = List.subtractionSet(subject, equals, target); test("List.subtractionSet 04.02.01");

		expected = `[1]`; subject = [[1]]; target = [3, 4];
		outcome = List.subtractionSet(subject, equals, target); test("List.subtractionSet 04.03.01");
		if (outcome === subject[0]) fail("List.subtractionSet 04.03.02");

		expected = `[]`; subject = [[1], [2, 1]]; target = [3, 4];
		outcome = List.subtractionSet(subject, equals, target); test("List.subtractionSet 04.04.01");
		if (outcome === subject[0]) fail("List.subtractionSet 04.04.02");
	}

	static unitTest_List_equalSet(result)
	{
		let subject, expected, outcome, temp;
		const a = { v: 'a' }, b = { v: 'b' }, c = { v: 'c' };

		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		const equals = (a, b) => a == b;	//	will match (1, '1') as opposed to the no-equals implementation that tests for equality useing `Set.has` (i.e. `a === b`)

		//	no equals
		expected = `true`; subject = []; outcome = List.equalSet(subject); test("List.equalSet 01.00.01");

		expected = `true`; subject = [[]]; outcome = List.equalSet(subject); test("List.equalSet 01.01.01");

		expected = `true`; subject = [[], []]; outcome = List.equalSet(subject); test("List.equalSet 01.02.01");

		expected = `true`; subject = [[a, 2], [2, a, 2]]; outcome = List.equalSet(subject); test("List.equalSet 01.03.01");

		expected = `false`; subject = [[1, 2], [2, 1, 3]]; outcome = List.equalSet(subject); test("List.equalSet 01.04.01");

		expected = `false`; subject = [[1, 2], [1, 3]]; outcome = List.equalSet(subject); test("List.equalSet 01.04.01");

		expected = `true`;
		temp = cost(Symbol("a")); temp[CompoundStructure.LowerBound] = 0; temp[CompoundStructure.LowerBound + 1] = 1; temp[CompoundStructure.LowerBound + 2] = 5; temp[CompoundStructure.LowerBound + 3] = 3;
		subject = [temp, [1, 0, 0, 5, 3], [3, 3, 5, 3, 1, 0]];
		outcome = List.equalSet(subject); test("List.equalSet 01.06.01");

		expected = `false`;
		temp = buf(); temp[Buf.LowerBound] = 0; temp[Buf.LowerBound + 1] = 1; temp[Buf.LowerBound + 2] = 5; temp[Buf.LowerBound + 3] = 3; temp.count = 4;
		subject = [temp, [1, 0, 0, 5, 3], [3, 3, 5, 3, 2]];
		outcome = List.equalSet(subject); test("List.equalSet 01.07.01");

		//	equals
		expected = `true`; subject = [[]]; outcome = List.equalSet(subject, equals); test("List.equalSet 02.01.01");

		expected = `true`; subject = [[3, '1', b], [b, 1, 3]]; outcome = List.equalSet(subject, equals); test("List.equalSet 02.02.01");

		expected = `false`; subject = [[3, '1', 2], [2, 'a', 3]]; outcome = List.equalSet(subject, equals); test("List.equalSet 02.03.01");
	}

	static unitTest_List_isEmptySet(result)
	{
		let subject, expected, outcome;
		const a = { v: 'a' };

		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		//	no equals
		expected = `true`; subject = []; outcome = List.isEmptySet(subject); test("List.isEmptySet 01.00.01");

		expected = `false`; subject = [2, a, 2]; outcome = List.isEmptySet(subject); test("List.isEmptySet 01.02.01");

		expected = `true`;
		subject = cost(Symbol("a"));
		outcome = List.isEmptySet(subject); test("List.isEmptySet 01.04.01");

		expected = `false`;
		subject = cost(Symbol("a")); subject[CompoundStructure.LowerBound] = 0; subject[CompoundStructure.LowerBound + 1] = 1; subject[CompoundStructure.LowerBound + 2] = 5; subject[CompoundStructure.LowerBound + 3] = 3;
		outcome = List.isEmptySet(subject); test("List.isEmptySet 01.04.01");

		expected = `true`;
		subject = buf(); subject.count = 0;
		outcome = List.isEmptySet(subject); test("List.isEmptySet 01.05.01");

		expected = `false`;
		subject = buf(); subject[Buf.LowerBound] = 0; subject[Buf.LowerBound + 1] = 1; subject[Buf.LowerBound + 2] = 5; subject[Buf.LowerBound + 3] = 3; subject.count = 4;
		outcome = List.isEmptySet(subject); test("List.isEmptySet 01.06.01");
	}
}

module.exports.UnitTests_BufferPool = module.exports;
