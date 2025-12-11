//	R0Q2/daniel/20220505
"use strict";

const { Unset, Type } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { Buf, cbuf } = require("-/pb/natalis/013/Compound.js");
const { LiteralFabric, Cardinality } = require("-/pb/natalis/014/LiteralFabric.js");
const { List } = require("-/pb/natalis/014/List.js");
const { BatchProcessingConfig, InstanceHandling } = require("-/pb/natalis/014/BatchProcessingConfig.js");
const { GraphCursor, GraphCursorType, GraphCursorList, Lean, Compact, CompactFormal, GraphComposer, GraphComposerTransaction, MergeAction, MergeDecisions, MergeInstruction } = require("-/pb/natalis/015/GraphCursor.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0x455307 = tunable(0x455307);
const T_0x7E6183 = tunable(0x7E6183);
const T_0xBD1466 = tunable(0xBD1466);
const T_0x402757 = tunable(0x402757);

module.exports =

class UnitTests_GraphCursor
{
	//	Category: Unit test
	//	Function: Run unit tests for `MergeDecisions` enum fields integrity.
	static unitTest_MergeDecisions(result)
	{
		let expected, outcome;

		const test = testName => expected !== outcome ? result.push({ testName, expected, outcome: outcome }) : void 0;

		test_MergeDecisions_fields_integrity();

		function test_MergeDecisions_fields_integrity()
		{
			expected = 1; outcome = MergeDecisions.VoidVoid & MergeDecisions.VoidVoidFail; test("MergeDecisions (001.01)");
			expected = 2; outcome = MergeDecisions.VoidVoid & MergeDecisions.VoidVoidKeep; test("MergeDecisions (001.02)");
			expected = 3; outcome = MergeDecisions.VoidVoid & MergeDecisions.VoidVoidOverwrite; test("MergeDecisions (001.03)");

			expected = 4; outcome = MergeDecisions.VoidAtom & MergeDecisions.VoidAtomFail; test("MergeDecisions (002.01)");
			expected = 8; outcome = MergeDecisions.VoidAtom & MergeDecisions.VoidAtomKeep; test("MergeDecisions (002.02)");
			expected = 12; outcome = MergeDecisions.VoidAtom & MergeDecisions.VoidAtomOverwrite; test("MergeDecisions (002.03)");

			expected = 16; outcome = MergeDecisions.VoidCountable & MergeDecisions.VoidCountableFail; test("MergeDecisions (003.01)");
			expected = 32; outcome = MergeDecisions.VoidCountable & MergeDecisions.VoidCountableKeep; test("MergeDecisions (003.02)");
			expected = 48; outcome = MergeDecisions.VoidCountable & MergeDecisions.VoidCountableOverwrite; test("MergeDecisions (003.03)");

			expected = 64; outcome = MergeDecisions.VoidUncountable & MergeDecisions.VoidUncountableFail; test("MergeDecisions (004.01)");
			expected = 128; outcome = MergeDecisions.VoidUncountable & MergeDecisions.VoidUncountableKeep; test("MergeDecisions (004.02)");
			expected = 192; outcome = MergeDecisions.VoidUncountable & MergeDecisions.VoidUncountableOverwrite; test("MergeDecisions (004.03)");

			expected = 256; outcome = MergeDecisions.AtomVoid & MergeDecisions.AtomVoidFail; test("MergeDecisions (005.01)");
			expected = 512; outcome = MergeDecisions.AtomVoid & MergeDecisions.AtomVoidKeep; test("MergeDecisions (005.02)");
			expected = 768; outcome = MergeDecisions.AtomVoid & MergeDecisions.AtomVoidOverwrite; test("MergeDecisions (005.03)");

			expected = 1024; outcome = MergeDecisions.AtomAtom & MergeDecisions.AtomAtomFail; test("MergeDecisions (006.01)");
			expected = 2048; outcome = MergeDecisions.AtomAtom & MergeDecisions.AtomAtomKeep; test("MergeDecisions (006.02)");
			expected = 3072; outcome = MergeDecisions.AtomAtom & MergeDecisions.AtomAtomOverwrite; test("MergeDecisions (006.03)");

			expected = 4096; outcome = MergeDecisions.AtomCountable & MergeDecisions.AtomCountableFail; test("MergeDecisions (007.01)");
			expected = 8192; outcome = MergeDecisions.AtomCountable & MergeDecisions.AtomCountableKeep; test("MergeDecisions (007.02)");
			expected = 12288; outcome = MergeDecisions.AtomCountable & MergeDecisions.AtomCountableOverwrite; test("MergeDecisions (007.03)");

			expected = 16384; outcome = MergeDecisions.AtomUncountable & MergeDecisions.AtomUncountableFail; test("MergeDecisions (008.01)");
			expected = 32768; outcome = MergeDecisions.AtomUncountable & MergeDecisions.AtomUncountableKeep; test("MergeDecisions (008.02)");
			expected = 49152; outcome = MergeDecisions.AtomUncountable & MergeDecisions.AtomUncountableOverwrite; test("MergeDecisions (008.03)");

			expected = 65536; outcome = MergeDecisions.CountableVoid & MergeDecisions.CountableVoidFail; test("MergeDecisions (009.01)");
			expected = 131072; outcome = MergeDecisions.CountableVoid & MergeDecisions.CountableVoidKeep; test("MergeDecisions (009.02)");
			expected = 196608; outcome = MergeDecisions.CountableVoid & MergeDecisions.CountableVoidOverwrite; test("MergeDecisions (009.03)");

			expected = 262144; outcome = MergeDecisions.CountableAtom & MergeDecisions.CountableAtomFail; test("MergeDecisions (010.01)");
			expected = 524288; outcome = MergeDecisions.CountableAtom & MergeDecisions.CountableAtomKeep; test("MergeDecisions (010.02)");
			expected = 786432; outcome = MergeDecisions.CountableAtom & MergeDecisions.CountableAtomOverwrite; test("MergeDecisions (010.03)");

			expected = 1048576; outcome = MergeDecisions.CountableCountable & MergeDecisions.CountableCountableFail; test("MergeDecisions (011.01)");
			expected = 2097152; outcome = MergeDecisions.CountableCountable & MergeDecisions.CountableCountableKeep; test("MergeDecisions (011.02)");
			expected = 3145728; outcome = MergeDecisions.CountableCountable & MergeDecisions.CountableCountableOverwrite; test("MergeDecisions (011.03)");

			expected = 4194304; outcome = MergeDecisions.CountableUncountable & MergeDecisions.CountableUncountableFail; test("MergeDecisions (012.01)");
			expected = 8388608; outcome = MergeDecisions.CountableUncountable & MergeDecisions.CountableUncountableKeep; test("MergeDecisions (012.02)");
			expected = 12582912; outcome = MergeDecisions.CountableUncountable & MergeDecisions.CountableUncountableOverwrite; test("MergeDecisions (012.03)");

			expected = 16777216; outcome = MergeDecisions.UncountableVoid & MergeDecisions.UncountableVoidFail; test("MergeDecisions (013.01)");
			expected = 33554432; outcome = MergeDecisions.UncountableVoid & MergeDecisions.UncountableVoidKeep; test("MergeDecisions (013.02)");
			expected = 50331648; outcome = MergeDecisions.UncountableVoid & MergeDecisions.UncountableVoidOverwrite; test("MergeDecisions (013.03)");

			expected = 67108864; outcome = MergeDecisions.UncountableAtom & MergeDecisions.UncountableAtomFail; test("MergeDecisions (014.01)");
			expected = 134217728; outcome = MergeDecisions.UncountableAtom & MergeDecisions.UncountableAtomKeep; test("MergeDecisions (014.02)");
			expected = 201326592; outcome = MergeDecisions.UncountableAtom & MergeDecisions.UncountableAtomOverwrite; test("MergeDecisions (014.03)");

			expected = 268435456; outcome = MergeDecisions.UncountableCountable & MergeDecisions.UncountableCountableFail; test("MergeDecisions (015.01)");
			expected = 536870912; outcome = MergeDecisions.UncountableCountable & MergeDecisions.UncountableCountableKeep; test("MergeDecisions (015.02)");
			expected = 805306368; outcome = MergeDecisions.UncountableCountable & MergeDecisions.UncountableCountableOverwrite; test("MergeDecisions (015.03)");

			expected = 1073741824; outcome = MergeDecisions.UncountableUncountable & MergeDecisions.UncountableUncountableFail; test("MergeDecisions (016.01)");
			expected = -2147483648; outcome = MergeDecisions.UncountableUncountable & MergeDecisions.UncountableUncountableKeep; test("MergeDecisions (016.02)");
			expected = -1073741824; outcome = MergeDecisions.UncountableUncountable & MergeDecisions.UncountableUncountableOverwrite; test("MergeDecisions (016.03)");

			expected = MergeDecisions.VoidVoidKeep; outcome = MergeDecisions.UseTheirs & MergeDecisions.VoidVoid; test("MergeDecisions (100.01)");
			expected = MergeDecisions.VoidAtomOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.VoidAtom; test("MergeDecisions (100.02)");
			expected = MergeDecisions.VoidCountableOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.VoidCountable; test("MergeDecisions (100.03)");
			expected = MergeDecisions.VoidUncountableOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.VoidUncountable; test("MergeDecisions (100.04)");
			expected = MergeDecisions.AtomVoidOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.AtomVoid; test("MergeDecisions (100.05)");
			expected = MergeDecisions.AtomAtomOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.AtomAtom; test("MergeDecisions (100.06)");
			expected = MergeDecisions.AtomCountableOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.AtomCountable; test("MergeDecisions (100.07)");
			expected = MergeDecisions.AtomUncountableOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.AtomUncountable; test("MergeDecisions (100.08)");
			expected = MergeDecisions.CountableVoidOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.CountableVoid; test("MergeDecisions (100.09)");
			expected = MergeDecisions.CountableAtomOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.CountableAtom; test("MergeDecisions (100.10)");
			expected = MergeDecisions.CountableCountableKeep; outcome = MergeDecisions.UseTheirs & MergeDecisions.CountableCountable; test("MergeDecisions (100.11)");
			expected = MergeDecisions.CountableUncountableOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.CountableUncountable; test("MergeDecisions (100.12)");
			expected = MergeDecisions.UncountableVoidOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.UncountableVoid; test("MergeDecisions (100.13)");
			expected = MergeDecisions.UncountableAtomOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.UncountableAtom; test("MergeDecisions (100.14)");
			expected = MergeDecisions.UncountableCountableOverwrite; outcome = MergeDecisions.UseTheirs & MergeDecisions.UncountableCountable; test("MergeDecisions (100.15)");
			expected = MergeDecisions.UncountableUncountableKeep; outcome = MergeDecisions.UseTheirs & MergeDecisions.UncountableUncountable; test("MergeDecisions (100.16)");

			expected = MergeDecisions.VoidVoidKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.VoidVoid; test("MergeDecisions (101.01)");
			expected = MergeDecisions.VoidAtomKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.VoidAtom; test("MergeDecisions (101.02)");
			expected = MergeDecisions.VoidCountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.VoidCountable; test("MergeDecisions (101.03)");
			expected = MergeDecisions.VoidUncountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.VoidUncountable; test("MergeDecisions (101.04)");
			expected = MergeDecisions.AtomVoidOverwrite; outcome = MergeDecisions.SafeDelete & MergeDecisions.AtomVoid; test("MergeDecisions (101.05)");
			expected = MergeDecisions.AtomAtomKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.AtomAtom; test("MergeDecisions (101.06)");
			expected = MergeDecisions.AtomCountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.AtomCountable; test("MergeDecisions (101.07)");
			expected = MergeDecisions.AtomUncountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.AtomUncountable; test("MergeDecisions (101.08)");
			expected = MergeDecisions.CountableVoidOverwrite; outcome = MergeDecisions.SafeDelete & MergeDecisions.CountableVoid; test("MergeDecisions (101.09)");
			expected = MergeDecisions.CountableAtomKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.CountableAtom; test("MergeDecisions (101.10)");
			expected = MergeDecisions.CountableCountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.CountableCountable; test("MergeDecisions (101.11)");
			expected = MergeDecisions.CountableUncountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.CountableUncountable; test("MergeDecisions (101.12)");
			expected = MergeDecisions.UncountableVoidOverwrite; outcome = MergeDecisions.SafeDelete & MergeDecisions.UncountableVoid; test("MergeDecisions (101.13)");
			expected = MergeDecisions.UncountableAtomKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.UncountableAtom; test("MergeDecisions (101.14)");
			expected = MergeDecisions.UncountableCountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.UncountableCountable; test("MergeDecisions (101.15)");
			expected = MergeDecisions.UncountableUncountableKeep; outcome = MergeDecisions.SafeDelete & MergeDecisions.UncountableUncountable; test("MergeDecisions (101.16)");

			expected = MergeDecisions.VoidVoidKeep; outcome = MergeDecisions.TryDelete & MergeDecisions.VoidVoid; test("MergeDecisions (102.01)");
			expected = MergeDecisions.VoidAtomFail; outcome = MergeDecisions.TryDelete & MergeDecisions.VoidAtom; test("MergeDecisions (102.02)");
			expected = MergeDecisions.VoidCountableFail; outcome = MergeDecisions.TryDelete & MergeDecisions.VoidCountable; test("MergeDecisions (102.03)");
			expected = MergeDecisions.VoidUncountableFail; outcome = MergeDecisions.TryDelete & MergeDecisions.VoidUncountable; test("MergeDecisions (102.04)");
			expected = MergeDecisions.AtomVoidOverwrite; outcome = MergeDecisions.TryDelete & MergeDecisions.AtomVoid; test("MergeDecisions (102.05)");
			expected = MergeDecisions.AtomAtomFail; outcome = MergeDecisions.TryDelete & MergeDecisions.AtomAtom; test("MergeDecisions (102.06)");
			expected = MergeDecisions.AtomCountableFail; outcome = MergeDecisions.TryDelete & MergeDecisions.AtomCountable; test("MergeDecisions (102.07)");
			expected = MergeDecisions.AtomUncountableFail; outcome = MergeDecisions.TryDelete & MergeDecisions.AtomUncountable; test("MergeDecisions (102.08)");
			expected = MergeDecisions.CountableVoidOverwrite; outcome = MergeDecisions.TryDelete & MergeDecisions.CountableVoid; test("MergeDecisions (102.09)");
			expected = MergeDecisions.CountableAtomFail; outcome = MergeDecisions.TryDelete & MergeDecisions.CountableAtom; test("MergeDecisions (102.10)");
			expected = MergeDecisions.CountableCountableKeep; outcome = MergeDecisions.TryDelete & MergeDecisions.CountableCountable; test("MergeDecisions (102.11)");
			expected = MergeDecisions.CountableUncountableFail; outcome = MergeDecisions.TryDelete & MergeDecisions.CountableUncountable; test("MergeDecisions (102.12)");
			expected = MergeDecisions.UncountableVoidOverwrite; outcome = MergeDecisions.TryDelete & MergeDecisions.UncountableVoid; test("MergeDecisions (102.13)");
			expected = MergeDecisions.UncountableAtomFail; outcome = MergeDecisions.TryDelete & MergeDecisions.UncountableAtom; test("MergeDecisions (102.14)");
			expected = MergeDecisions.UncountableCountableFail; outcome = MergeDecisions.TryDelete & MergeDecisions.UncountableCountable; test("MergeDecisions (102.15)");
			expected = MergeDecisions.UncountableUncountableKeep; outcome = MergeDecisions.TryDelete & MergeDecisions.UncountableUncountable; test("MergeDecisions (102.16)");
		}
	}

	//	Category: Unit test
	//	Function: Run unit tests for `GraphCursor` class methods and properties.
	static unitTest_GraphCursor(result)
	{
		let value, ref, expected, outcome;

		const fail = (testName, expected, outcome) => result.push({ testName, expected, outcome });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		test_Lean_list_copy();
		test_Lean_list_create();
		test_Lean_toCompact_copy();
		test_Lean_toCompact_mutate();
		test_Lean_toCompactFormal_copy();
		test_Lean_toCompactFormal_mutate();
		test_Compact_list_copy();
		test_Compact_list_create();
		test_Compact_toCompactFormal_copy();
		test_Compact_toCompactFormal_mutate();
		test_Compact_toLean_copy();
		test_Compact_toLean_mutate();
		test_Compact_toCompactFormalFused_copy();
		test_Compact_toCompactFormalFused_mutate();
		test_Compact_rotate_copy();
		test_Compact_rotate_mutate();
		test_CompactFormal_list_copy();
		test_CompactFormal_list_create();
		test_CompactFormal_toCompact_copy();
		test_CompactFormal_toCompact_mutate();
		test_CompactFormal_toLean_copy();
		test_CompactFormal_toLean_mutate();
		test_CompactFormal_fuse_copy();
		test_CompactFormal_fuse_mutate();
		test_CompactFormal_spread_copy();
		test_CompactFormal_spread_mutate();
		test_CompactFormal_fuse_spread();
		test_List_uniform_copy();
		test_List_uniform_mutate();

		function test_Lean_list_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[void 0]]`; value = void 0; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[null]]`; value = null; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[true]]`; value = true; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[false]]`; value = false; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[0]]`; value = 0; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[1]]`; value = 1; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[""]]`; value = ""; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>["a"]]`; value = "a"; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (01.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>]]`; value = {}; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (01.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>]]`; value = []; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (01.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, ""]]`; value = { "": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.01a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "."]]`; value = { ".": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.01b)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "#"]]`; value = { "#": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.01c)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]]`; value = { "\\": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.01d)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"]]`; value = { a: 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.01e)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "1"]]`; value = { 1: 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 2, "b"]]`; value = { a: { b: 2 } }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"]]`; value = { a: {} }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephOne>, "b"]]`; value = { a: { b: {} } }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b"]]`; value = { a: { b: [] } }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a"]]`; value = { a: [] }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", 0, 0]]`; value = { a: [0] }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephOne>, 0, 1, "b"]]`; value = { a: [{ b: 1 }] }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephNull>, 0]]`; value = { a: [[]] }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephNull>, 0, 1, 0]]`; value = { a: [[1]] }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"], &cbuf<Lean>[<AlephOne>, null, 2, "b"]]`; value = { a: 1, b: 2 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (02.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0]]`; value = [1]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0]]`; value = [{}]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0, 1, "a"]]`; value = [{ a: 1 }]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0, <AlephNull>, "a"]]`; value = [{ a: [] }]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0, <AlephNull>, "a", 1, 0]]`; value = [{ a: [1] }]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0]]`; value = [[]]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1]]`; value = [1, 2]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1], &cbuf<Lean>[<AlephNull>, null, <AlephOne>, 2]]`; value = [1, 2, {}]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1], &cbuf<Lean>[<AlephNull>, null, <AlephOne>, 2, 3, "a"]]`; value = [1, 2, { a: 3 }]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1], &cbuf<Lean>[<AlephNull>, null, <AlephOne>, 2, <AlephOne>, "a", 3, "b"], &cbuf<Lean>[<AlephNull>, null, 4, 3]]`; value = [1, 2, { a: { b: 3 } }, 4]; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.073)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, ${1000000000 + T_0x455307}]]`; value = [1]; value[1000000000 + T_0x455307] = 2; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (03.08)");

			ref = {};
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"], &cbuf<Lean>[<AlephOne>, null, <AlephOne>, "b"]]`; value = { a: ref, b: ref }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (031.01)");
			ref = { c: 1 };
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 1, "c"], &cbuf<Lean>[<AlephOne>, null, <AlephOne>, "b", 1, "c"]]`; value = { a: ref, b: ref }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (031.02)");

			ref = { a: null };
			value = { a: ref };
			ref.a = value;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				outcome = Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.01)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.02)");
			}

			ref = { a: null };
			value = [ref];
			ref.a = value;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				outcome = Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.03)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.04)");
			}

			value = [1];
			value[1] = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				outcome = Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.04)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.05)");
			}

			value = [1, [2]];
			value[2] = value;
			expected = `"0x4D89C9 Circular reference."`;
			try
			{
				outcome = Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.06)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.07)");
			}

			value = {};
			value.r = value;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				outcome = Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.08)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.09)");
			}

			value = { b: null, r: null };
			value.r = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.10)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.11)");
			}

			value = { b: 1, r: null };
			value.r = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.12)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.13)");
			}

			value = { b: {}, r: null };
			value.r = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.14)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.15)");
			}

			value = { a: { r: null } };
			value.a.r = value.a;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				Lean.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Lean.list - copy (04.16)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - copy (04.17)");
			}

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, ""]]`; value = { "": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (05.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "."]]`; value = { ".": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (05.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "#"]]`; value = { "#": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (05.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]]`; value = { "\\": 1 }; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (05.04)");

			expected = `<Unset>`; value = Unset; outcome = Lean.list(value, null, false, null, GraphCursor.List.create()); test("Lean.list - copy (06.01)");
			expected = `<Unset>`; value = Unset; outcome = Lean.list(value, null, false, () => { throw new Error() }, GraphCursor.List.create()); test("Lean.list - copy (06.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Lean.list - copy (06.03)");
			expected = `true`; value = {}; Lean.list(value, null, false, null, outcome = GraphCursor.List.create()); outcome = outcome[0].length === T_0x7E6183; test("Lean.list - copy (06.05)");
			expected = `true`; value = {}; Lean.list(value, null, false, () => Lean.create(0, T_0x7E6183 + 1), outcome = GraphCursor.List.create()); outcome = outcome[0].length === T_0x7E6183 + 1; test("Lean.list - copy (06.06)");

			//	use `offsetInTarget`
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); outcome = Lean.list(value, null, false, null, GraphCursor.List.create(0), 1); test("Lean.list - copy (07.01)");
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); outcome = Lean.list(value, null, false, null, GraphCursor.List.create(1), 1); test("Lean.list - copy (07.02)");
		}

		function test_Lean_list_create()
		{
			expected = `<Unset>`; value = Unset; outcome = Lean.list(value); test("Lean.list - create (01.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); outcome = Lean.list(value); test("Lean.list - create (01.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[void 0]]`; value = void 0; outcome = Lean.list(value); test("Lean.list - create (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[null]]`; value = null; outcome = Lean.list(value); test("Lean.list - create (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[true]]`; value = true; outcome = Lean.list(value); test("Lean.list - create (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[false]]`; value = false; outcome = Lean.list(value); test("Lean.list - create (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[0]]`; value = 0; outcome = Lean.list(value); test("Lean.list - create (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[1]]`; value = 1; outcome = Lean.list(value); test("Lean.list - create (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[""]]`; value = ""; outcome = Lean.list(value); test("Lean.list - create (01.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>["a"]]`; value = "a"; outcome = Lean.list(value); test("Lean.list - create (01.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>]]`; value = {}; outcome = Lean.list(value); test("Lean.list - create (01.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>]]`; value = []; outcome = Lean.list(value); test("Lean.list - create (01.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, null, ""]]`; value = { "": null }; outcome = Lean.list(value); test("Lean.list - create (02.01.null)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, ""]]`; value = { "": 1 }; outcome = Lean.list(value); test("Lean.list - create (02.01a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "."]]`; value = { ".": 1 }; outcome = Lean.list(value); test("Lean.list - create (02.01b)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "#"]]`; value = { "#": 1 }; outcome = Lean.list(value); test("Lean.list - create (02.01c)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]]`; value = { "\\": 1 }; outcome = Lean.list(value); test("Lean.list - create (02.01d)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"]]`; value = { a: 1 }; outcome = Lean.list(value); test("Lean.list - create (02.01e)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "1"]]`; value = { 1: 1 }; outcome = Lean.list(value); test("Lean.list - create (02.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 2, "b"]]`; value = { a: { b: 2 } }; outcome = Lean.list(value); test("Lean.list - create (02.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"]]`; value = { a: {} }; outcome = Lean.list(value); test("Lean.list - create (02.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephOne>, "b"]]`; value = { a: { b: {} } }; outcome = Lean.list(value); test("Lean.list - create (02.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b"]]`; value = { a: { b: [] } }; outcome = Lean.list(value); test("Lean.list - create (02.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a"]]`; value = { a: [] }; outcome = Lean.list(value); test("Lean.list - create (02.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", 0, 0]]`; value = { a: [0] }; outcome = Lean.list(value); test("Lean.list - create (02.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephOne>, 0, 1, "b"]]`; value = { a: [{ b: 1 }] }; outcome = Lean.list(value); test("Lean.list - create (02.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephNull>, 0]]`; value = { a: [[]] }; outcome = Lean.list(value); test("Lean.list - create (02.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephNull>, 0, 1, 0]]`; value = { a: [[1]] }; outcome = Lean.list(value); test("Lean.list - create (02.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"], &cbuf<Lean>[<AlephOne>, null, 2, "b"]]`; value = { a: 1, b: 2 }; outcome = Lean.list(value); test("Lean.list - create (02.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, null, 0]]`; value = [null]; outcome = Lean.list(value); test("Lean.list - create (03.01.null)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0]]`; value = [1]; outcome = Lean.list(value); test("Lean.list - create (03.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0]]`; value = [{}]; outcome = Lean.list(value); test("Lean.list - create (03.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0, 1, "a"]]`; value = [{ a: 1 }]; outcome = Lean.list(value); test("Lean.list - create (03.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0, <AlephNull>, "a"]]`; value = [{ a: [] }]; outcome = Lean.list(value); test("Lean.list - create (03.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0, <AlephNull>, "a", 1, 0]]`; value = [{ a: [1] }]; outcome = Lean.list(value); test("Lean.list - create (03.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0]]`; value = [[]]; outcome = Lean.list(value); test("Lean.list - create (03.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1]]`; value = [1, 2]; outcome = Lean.list(value); test("Lean.list - create (03.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1], &cbuf<Lean>[<AlephNull>, null, <AlephOne>, 2]]`; value = [1, 2, {}]; outcome = Lean.list(value); test("Lean.list - create (03.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1], &cbuf<Lean>[<AlephNull>, null, <AlephOne>, 2, 3, "a"]]`; value = [1, 2, { a: 3 }]; outcome = Lean.list(value); test("Lean.list - create (03.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, 1], &cbuf<Lean>[<AlephNull>, null, <AlephOne>, 2, <AlephOne>, "a", 3, "b"], &cbuf<Lean>[<AlephNull>, null, 4, 3]]`; value = [1, 2, { a: { b: 3 } }, 4]; outcome = Lean.list(value); test("Lean.list - create (03.073)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>, null, 1, 0], &cbuf<Lean>[<AlephNull>, null, 2, ${1000000000 + T_0x455307}]]`; value = [1]; value[1000000000 + T_0x455307] = 2; outcome = Lean.list(value); test("Lean.list - create (03.08)");

			ref = {};
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"], &cbuf<Lean>[<AlephOne>, null, <AlephOne>, "b"]]`; value = { a: ref, b: ref }; outcome = Lean.list(value); test("Lean.list - create (031.01)");
			ref = { c: 1 };
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 1, "c"], &cbuf<Lean>[<AlephOne>, null, <AlephOne>, "b", 1, "c"]]`; value = { a: ref, b: ref }; outcome = Lean.list(value); test("Lean.list - create (031.02)");

			ref = { a: null };
			value = { a: ref };
			ref.a = value;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.01)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.02)");
			}

			ref = { a: null };
			value = [ref];
			ref.a = value;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.03)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.04)");
			}

			value = [1];
			value[1] = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.04)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.05)");
			}

			value = [1, [2]];
			value[2] = value;
			expected = `"0x4D89C9 Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.06)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.07)");
			}

			value = {};
			value.r = value;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.08)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.09)");
			}

			value = { b: null, r: null };
			value.r = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.10)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.11)");
			}

			value = { b: 1, r: null };
			value.r = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.12)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.13)");
			}

			value = { b: {} , r: null };
			value.r = value;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.14)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.15)");
			}

			value = { a: { r: null } };
			value.a.r = value.a;
			expected = `"0x86CF83 Circular reference."`;
			try
			{
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.16)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.17)");
			}

			value = { b: { c1: 1, c2: { r: { d1: {}, d2: null } } } };
			value.b.c2.r.d2 = value.b;
			expected = `"0xD2DBFA Circular reference."`;
			try
			{
				debugger;
				Lean.list(value);
				outcome = null;
				test("Lean.list - create (04.18)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Lean.list - create (04.19)");
			}

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, ""]]`; value = { "": 1 }; outcome = Lean.list(value); test("Lean.list - create (05.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "."]]`; value = { ".": 1 }; outcome = Lean.list(value); test("Lean.list - create (05.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "#"]]`; value = { "#": 1 }; outcome = Lean.list(value); test("Lean.list - create (05.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]]`; value = { "\\": 1 }; outcome = Lean.list(value); test("Lean.list - create (05.04)");

			expected = `<Unset>`; value = Unset; outcome = Lean.list(value); test("Lean.list - create (06.01)");
			expected = `<Unset>`; value = Unset; outcome = Lean.list(value, null, false, () => { throw new Error() }); test("Lean.list - create (06.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); outcome = Lean.list(value); test("Lean.list - create (06.03)");
			expected = `true`; value = {}; outcome = Lean.list(value); outcome = outcome[0].length === T_0x7E6183; test("Lean.list - create (06.05)");
			expected = `true`; value = {}; outcome = Lean.list(value, null, false, () => Lean.create(0, T_0x7E6183 + 1)); outcome = outcome[0].length === T_0x7E6183 + 1; test("Lean.list - create (06.06)");

			//	use `offsetInTarget`
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Lean>[<symbol>]]`; value = Symbol("symbol"); outcome = Lean.list(value, null, false, null, null, 1); test("Lean.list - create (07.01)");
		}

		function test_Lean_toCompact_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.01)");
			expected = `&cbuf<Compact>[void 0]`; value = Lean.create(); value.count = 1; value[0] = void 0; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.02)");
			expected = `&cbuf<Compact>[null]`; value = Lean.create(); value.count = 1; value[0] = null; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.03)");
			expected = `&cbuf<Compact>[true]`; value = Lean.create(); value.count = 1; value[0] = true; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.04)");
			expected = `&cbuf<Compact>[false]`; value = Lean.create(); value.count = 1; value[0] = false; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.05)");
			expected = `&cbuf<Compact>[0]`; value = Lean.create(); value.count = 1; value[0] = 0; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.06)");
			expected = `&cbuf<Compact>[1]`; value = Lean.create(); value.count = 1; value[0] = 1; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.07)");
			expected = `&cbuf<Compact>[""]`; value = Lean.create(); value.count = 1; value[0] = ""; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.08)");
			expected = `&cbuf<Compact>[<AlephNull>]`; value = Lean.list([])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.09)");
			expected = `&cbuf<Compact>[<AlephOne>]`; value = Lean.list({})[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (01.10)");

			expected = `&cbuf<Compact>[1, "a"]`; value = Lean.list({ a: 1 })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.01)");
			expected = `&cbuf<Compact>[1, "1"]`; value = Lean.list({ 1: 1 })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.02)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = Lean.list({ a: { b: 2 } })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.03)");
			expected = `&cbuf<Compact>[<AlephOne>, "a"]`; value = Lean.list({ a: {} })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.04)");
			expected = `&cbuf<Compact>[<AlephNull>, "a"]`; value = Lean.list({ a: [] })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.05)");
			expected = `&cbuf<Compact>[<AlephOne>, "a", "b"]`; value = Lean.list({ a: { b: {} } })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.06)");
			expected = `&cbuf<Compact>[<AlephNull>, "a", "b"]`; value = Lean.list({ a: { b: [] } })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.07)");
			expected = `&cbuf<Compact>[0, "a", "b", 0]`; value = Lean.list({ a: { b: [0] } })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.08)");
			expected = `&cbuf<Compact>[1, "a", 0, "b"]`; value = Lean.list({ a: [{ b: 1 }] })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (02.09)"); 

			expected = `&cbuf<Compact>[0, 0]`; value = Lean.list([0])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.01)");
			expected = `&cbuf<Compact>[1, 0]`; value = Lean.list([1])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.02)");
			expected = `&cbuf<Compact>[1, 1]`; value = Lean.list([void 0, 1])[1]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.03)");
			expected = `&cbuf<Compact>[<AlephOne>, 0]`; value = Lean.list([{}])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.04)");
			expected = `&cbuf<Compact>[<AlephNull>, 0]`; value = Lean.list([[]])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.05)");
			expected = `&cbuf<Compact>[<AlephNull>, 0, 0]`; value = Lean.list([[[]]])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.06)");
			expected = `&cbuf<Compact>[5, 0, 0, 0]`; value = Lean.list([[[5]]])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.07)");
			expected = `&cbuf<Compact>[5, 0, 0, "a"]`; value = Lean.list([[{a: 5}]])[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (03.08)");

			expected = `&cbuf<Compact>[1, ""]`; value = Lean.list({ "": 1 })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (04.01)");
			expected = `&cbuf<Compact>[1, "."]`; value = Lean.list({ ".": 1 })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (04.02)");
			expected = `&cbuf<Compact>[1, "#"]`; value = Lean.list({ "#": 1 })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Compact>[1, "\\\\"]`; value = Lean.list({ "\\": 1 })[0]; outcome = Lean.toCompact(value, Compact.create()); test("Lean.toCompact - copy (04.04)");
		}

		function test_Lean_toCompact_mutate()
		{
			expected = `<Unset>`; value = Unset; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.01)");
			expected = `&cbuf<Compact>[void 0]`; value = Lean.create(); value.count = 1; value[0] = void 0; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.02)");
			expected = `&cbuf<Compact>[null]`; value = Lean.create(); value.count = 1; value[0] = null; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.03)");
			expected = `&cbuf<Compact>[true]`; value = Lean.create(); value.count = 1; value[0] = true; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.04)");
			expected = `&cbuf<Compact>[false]`; value = Lean.create(); value.count = 1; value[0] = false; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.05)");
			expected = `&cbuf<Compact>[0]`; value = Lean.create(); value.count = 1; value[0] = 0; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.06)");
			expected = `&cbuf<Compact>[1]`; value = Lean.create(); value.count = 1; value[0] = 1; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.07)");
			expected = `&cbuf<Compact>[""]`; value = Lean.create(); value.count = 1; value[0] = ""; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.08)");
			expected = `&cbuf<Compact>[<AlephNull>]`; value = Lean.list([])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.09)");
			expected = `&cbuf<Compact>[<AlephOne>]`; value = Lean.list({})[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (01.10)");

			expected = `&cbuf<Compact>[1, "a"]`; value = Lean.list({ a: 1 })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.01)");
			expected = `&cbuf<Compact>[1, "1"]`; value = Lean.list({ 1: 1 })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.02)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = Lean.list({ a: { b: 2 } })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.03)");
			expected = `&cbuf<Compact>[<AlephOne>, "a"]`; value = Lean.list({ a: {} })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.04)");
			expected = `&cbuf<Compact>[<AlephNull>, "a"]`; value = Lean.list({ a: [] })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.05)");
			expected = `&cbuf<Compact>[<AlephOne>, "a", "b"]`; value = Lean.list({ a: { b: {} } })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.06)");
			expected = `&cbuf<Compact>[<AlephNull>, "a", "b"]`; value = Lean.list({ a: { b: [] } })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.07)");
			expected = `&cbuf<Compact>[0, "a", "b", 0]`; value = Lean.list({ a: { b: [0] } })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.08)");
			expected = `&cbuf<Compact>[1, "a", 0, "b"]`; value = Lean.list({ a: [{ b: 1 }] })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (02.09)");

			expected = `&cbuf<Compact>[0, 0]`; value = Lean.list([0])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.01)");
			expected = `&cbuf<Compact>[1, 0]`; value = Lean.list([1])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.02)");
			expected = `&cbuf<Compact>[1, 1]`; value = Lean.list([void 0, 1])[1]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.03)");
			expected = `&cbuf<Compact>[<AlephOne>, 0]`; value = Lean.list([{}])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.04)");
			expected = `&cbuf<Compact>[<AlephNull>, 0]`; value = Lean.list([[]])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.05)");
			expected = `&cbuf<Compact>[<AlephNull>, 0, 0]`; value = Lean.list([[[]]])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.06)");
			expected = `&cbuf<Compact>[5, 0, 0, 0]`; value = Lean.list([[[5]]])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.07)");
			expected = `&cbuf<Compact>[5, 0, 0, "a"]`; value = Lean.list([[{ a: 5 }]])[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (03.08)");

			expected = `&cbuf<Compact>[1, ""]`; value = Lean.list({ "": 1 })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (04.01)");
			expected = `&cbuf<Compact>[1, "."]`; value = Lean.list({ ".": 1 })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (04.02)");
			expected = `&cbuf<Compact>[1, "#"]`; value = Lean.list({ "#": 1 })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Compact>[1, "\\\\"]`; value = Lean.list({ "\\": 1 })[0]; Lean.toCompact(value); outcome = value; test("Lean.toCompact - mutate (04.04)");
		}

		function test_Lean_toCompactFormal_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = Lean.create(); value.count = 1; value[0] = void 0; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = Lean.create(); value.count = 1; value[0] = null; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = Lean.create(); value.count = 1; value[0] = true; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = Lean.create(); value.count = 1; value[0] = false; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = Lean.create(); value.count = 1; value[0] = 0; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = Lean.create(); value.count = 1; value[0] = 1; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = Lean.create(); value.count = 1; value[0] = ""; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = Lean.list([])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = Lean.list({})[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (01.10)");

			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Lean.list({ a: 1 })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.01)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = Lean.list({ 1: 1 })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a", "b"]`; value = Lean.list({ a: { b: 2 } })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = Lean.list({ a: {} })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = Lean.list({ a: [] })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a", "b"]`; value = Lean.list({ a: { b: {} } })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a", "b"]`; value = Lean.list({ a: { b: [] } })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a", "b", 0]`; value = Lean.list({ a: { b: [0] } })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a", 0, "b"]`; value = Lean.list({ a: [{ b: 1 }] })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = Lean.list([0])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = Lean.list([1])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = Lean.list([void 0, 1])[1]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = Lean.list([{}])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = Lean.list([[]])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0, 0]`; value = Lean.list([[[]]])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.06)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, 0]`; value = Lean.list([[[5]]])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.07)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, "a"]`; value = Lean.list([[{ a: 5 }]])[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Lean.list({ "": 1 })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (04.01)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\."]`; value = Lean.list({ ".": 1 })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (04.02)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\#"]`; value = Lean.list({ "#": 1 })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (04.03)");
			//	the `"\\\\\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a double backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\"]`; value = Lean.list({ "\\": 1 })[0]; outcome = Lean.toCompactFormal(value, CompactFormal.create()); test("Lean.toCompactFormal - copy (04.04)");
		}

		function test_Lean_toCompactFormal_mutate()
		{
			expected = `<Unset>`; value = Unset; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = Lean.create(); value.count = 1; value[0] = void 0; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = Lean.create(); value.count = 1; value[0] = null; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = Lean.create(); value.count = 1; value[0] = true; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = Lean.create(); value.count = 1; value[0] = false; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = Lean.create(); value.count = 1; value[0] = 0; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = Lean.create(); value.count = 1; value[0] = 1; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = Lean.create(); value.count = 1; value[0] = ""; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = Lean.list([])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = Lean.list({})[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (01.10)");

			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Lean.list({ a: 1 })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.01)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = Lean.list({ 1: 1 })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a", "b"]`; value = Lean.list({ a: { b: 2 } })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = Lean.list({ a: {} })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = Lean.list({ a: [] })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a", "b"]`; value = Lean.list({ a: { b: {} } })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a", "b"]`; value = Lean.list({ a: { b: [] } })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a", "b", 0]`; value = Lean.list({ a: { b: [0] } })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a", 0, "b"]`; value = Lean.list({ a: [{ b: 1 }] })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = Lean.list([0])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = Lean.list([1])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = Lean.list([void 0, 1])[1]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = Lean.list([{}])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = Lean.list([[]])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0, 0]`; value = Lean.list([[[]]])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.06)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, 0]`; value = Lean.list([[[5]]])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.07)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, "a"]`; value = Lean.list([[{ a: 5 }]])[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Lean.list({ "": 1 })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (04.01)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\."]`; value = Lean.list({ ".": 1 })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (04.02)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\#"]`; value = Lean.list({ "#": 1 })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (04.03)");
			//	the `"\\\\\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a double backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\"]`; value = Lean.list({ "\\": 1 })[0]; Lean.toCompactFormal(value); outcome = value; test("Lean.toCompactFormal - copy (04.04)");
		}


		function test_Compact_list_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Unset; outcome = Compact.list(Symbol("symbol"), null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[void 0]]`; value = void 0; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[null]]`; value = null; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[true]]`; value = true; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[false]]`; value = false; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0]]`; value = 0; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1]]`; value = 1; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[""]]`; value = ""; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>["a"]]`; value = "a"; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (01.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = {}; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (01.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>]]`; value = []; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (01.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, ""]]`; value = { "": 1 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.01a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "."]]`; value = { ".": 1 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.01b)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "#"]]`; value = { "#": 1 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.01c)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "\\\\"]]`; value = { "\\": 1 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.01d)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"]]`; value = { a: 1 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.01e)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "1"]]`; value = { 1: 1 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[2, "a", "b"]]`; value = { a: { b: 2 } }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, "a"]]`; value = { a: {} }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, "a", "b"]]`; value = { a: { b: {} } }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, "a", "b"]]`; value = { a: { b: [] } }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, "a"]]`; value = { a: [] }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, "a", 0]]`; value = { a: [0] }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", 0, "b"]]`; value = { a: [{ b: 1 }] }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, "a", 0]]`; value = { a: [[]] }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", 0, 0]]`; value = { a: [[1]] }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = { a: 1, b: 2 }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (02.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0]]`; value = [1]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, 0]]`; value = [{}]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0, "a"]]`; value = [{ a: 1 }]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, 0, "a"]]`; value = [{ a: [] }]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0, "a", 0]]`; value = [{ a: [1] }]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, 0]]`; value = [[]]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1]]`; value = [1, 2]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1], &cbuf<Compact>[<AlephOne>, 2]]`; value = [1, 2, {}]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1], &cbuf<Compact>[3, 2, "a"]]`; value = [1, 2, { a: 3 }]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1], &cbuf<Compact>[3, 2, "a", "b"], &cbuf<Compact>[4, 3]]`; value = [1, 2, { a: { b: 3 } }, 4]; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.073)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, ${1000000000 + T_0x455307}]]`; value = [1]; value[1000000000 + T_0x455307] = 2; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (03.08)");

			ref = {};
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, "a"], &cbuf<Compact>[<AlephOne>, "b"]]`; value = { a: ref, b: ref }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (031.01)");
			ref = { c: 1 };
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", "c"], &cbuf<Compact>[1, "b", "c"]]`; value = { a: ref, b: ref }; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (031.02)");

			ref = { a: null };
			value = { a: ref };
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				Compact.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Compact.list - copy (04.01)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - copy (04.02)");
			}

			ref = { a: null };
			value = [ref];
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				Compact.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Compact.list - copy (04.03)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - copy (04.04)");
			}

			value = [1];
			value[1] = value;
			expected = `"0x71E8D4 Circular reference."`;
			try
			{
				Compact.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Compact.list - copy (04.04)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - copy (04.05)");
			}

			value = [1, [2]];
			value[2] = value;
			expected = `"0xAEF626 Circular reference."`;
			try
			{
				Compact.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Compact.list - copy (04.06)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - copy (04.07)");
			}

			value = {};
			value.r = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				Compact.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("Compact.list - copy (04.08)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - copy (04.09)");
			}

			expected = `<Unset>`; value = Unset; outcome = Compact.list(value, null, false, null, GraphCursor.List.create()); test("Compact.list - copy (06.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Symbol("symbol"); Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); test("Compact.list - copy (06.03)");
			expected = `true`; value = {}; Compact.list(value, null, false, null, outcome = GraphCursor.List.create()); outcome = outcome[0].length === T_0xBD1466; test("Compact.list - copy (06.05)");
			expected = `true`; value = {}; Compact.list(value, null, false, () => Compact.create(0, T_0xBD1466 + 1), outcome = GraphCursor.List.create()); outcome = outcome[0].length === T_0xBD1466 + 1; test("Compact.list - copy (06.06)");

			//	use `offsetInTarget`
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Compact>[<symbol>]]`; value = Symbol("symbol"); outcome = Compact.list(value, null, false, null, GraphCursor.List.create(0), 1); test("Compact.list - copy (07.01)");
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Compact>[<symbol>]]`; value = Symbol("symbol"); outcome = Compact.list(value, null, false, null, GraphCursor.List.create(1), 1); test("Compact.list - copy (07.02)");
		}

		function test_Compact_list_create()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.list(value); test("Compact.list - create (01.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Unset; outcome = Compact.list(Symbol("symbol")); test("Compact.list - create (01.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[void 0]]`; value = void 0; outcome = Compact.list(value); test("Compact.list - create (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[null]]`; value = null; outcome = Compact.list(value); test("Compact.list - create (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[true]]`; value = true; outcome = Compact.list(value); test("Compact.list - create (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[false]]`; value = false; outcome = Compact.list(value); test("Compact.list - create (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0]]`; value = 0; outcome = Compact.list(value); test("Compact.list - create (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1]]`; value = 1; outcome = Compact.list(value); test("Compact.list - create (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[""]]`; value = ""; outcome = Compact.list(value); test("Compact.list - create (01.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>["a"]]`; value = "a"; outcome = Compact.list(value); test("Compact.list - create (01.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = {}; outcome = Compact.list(value); test("Compact.list - create (01.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>]]`; value = []; outcome = Compact.list(value); test("Compact.list - create (01.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[null, ""]]`; value = { "": null }; outcome = Compact.list(value); test("Compact.list - create (02.01.null)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, ""]]`; value = { "": 1 }; outcome = Compact.list(value); test("Compact.list - create (02.01a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "."]]`; value = { ".": 1 }; outcome = Compact.list(value); test("Compact.list - create (02.01b)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "#"]]`; value = { "#": 1 }; outcome = Compact.list(value); test("Compact.list - create (02.01c)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "\\\\"]]`; value = { "\\": 1 }; outcome = Compact.list(value); test("Compact.list - create (02.01d)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"]]`; value = { a: 1 }; outcome = Compact.list(value); test("Compact.list - create (02.01e)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "1"]]`; value = { 1: 1 }; outcome = Compact.list(value); test("Compact.list - create (02.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[2, "a", "b"]]`; value = { a: { b: 2 } }; outcome = Compact.list(value); test("Compact.list - create (02.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, "a"]]`; value = { a: {} }; outcome = Compact.list(value); test("Compact.list - create (02.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, "a", "b"]]`; value = { a: { b: {} } }; outcome = Compact.list(value); test("Compact.list - create (02.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, "a", "b"]]`; value = { a: { b: [] } }; outcome = Compact.list(value); test("Compact.list - create (02.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, "a"]]`; value = { a: [] }; outcome = Compact.list(value); test("Compact.list - create (02.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, "a", 0]]`; value = { a: [0] }; outcome = Compact.list(value); test("Compact.list - create (02.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", 0, "b"]]`; value = { a: [{ b: 1 }] }; outcome = Compact.list(value); test("Compact.list - create (02.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, "a", 0]]`; value = { a: [[]] }; outcome = Compact.list(value); test("Compact.list - create (02.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", 0, 0]]`; value = { a: [[1]] }; outcome = Compact.list(value); test("Compact.list - create (02.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = { a: 1, b: 2 }; outcome = Compact.list(value); test("Compact.list - create (02.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[null, 0]]`; value = [null]; outcome = Compact.list(value); test("Compact.list - create (03.01.null)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0]]`; value = [1]; outcome = Compact.list(value); test("Compact.list - create (03.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, 0]]`; value = [{}]; outcome = Compact.list(value); test("Compact.list - create (03.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0, "a"]]`; value = [{ a: 1 }]; outcome = Compact.list(value); test("Compact.list - create (03.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, 0, "a"]]`; value = [{ a: [] }]; outcome = Compact.list(value); test("Compact.list - create (03.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0, "a", 0]]`; value = [{ a: [1] }]; outcome = Compact.list(value); test("Compact.list - create (03.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>, 0]]`; value = [[]]; outcome = Compact.list(value); test("Compact.list - create (03.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1]]`; value = [1, 2]; outcome = Compact.list(value); test("Compact.list - create (03.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1], &cbuf<Compact>[<AlephOne>, 2]]`; value = [1, 2, {}]; outcome = Compact.list(value); test("Compact.list - create (03.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1], &cbuf<Compact>[3, 2, "a"]]`; value = [1, 2, { a: 3 }]; outcome = Compact.list(value); test("Compact.list - create (03.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, 1], &cbuf<Compact>[3, 2, "a", "b"], &cbuf<Compact>[4, 3]]`; value = [1, 2, { a: { b: 3 } }, 4]; outcome = Compact.list(value); test("Compact.list - create (03.073)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0], &cbuf<Compact>[2, ${1000000000 + T_0x455307}]]`; value = [1]; value[1000000000 + T_0x455307] = 2; outcome = Compact.list(value); test("Compact.list - create (03.08)");

			ref = {};
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>, "a"], &cbuf<Compact>[<AlephOne>, "b"]]`; value = { a: ref, b: ref }; outcome = Compact.list(value); test("Compact.list - create (031.01)");
			ref = { c: 1 };
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", "c"], &cbuf<Compact>[1, "b", "c"]]`; value = { a: ref, b: ref }; outcome = Compact.list(value); test("Compact.list - create (031.02)");

			ref = { a: null };
			value = { a: ref };
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				Compact.list(value);
				outcome = null;
				test("Compact.list - create (04.01)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - create (04.02)");
			}

			ref = { a: null };
			value = [ref];
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				Compact.list(value);
				outcome = null;
				test("Compact.list - create (04.03)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - create (04.04)");
			}

			value = [1];
			value[1] = value;
			expected = `"0x71E8D4 Circular reference."`;
			try
			{
				Compact.list(value);
				outcome = null;
				test("Compact.list - create (04.04)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - create (04.05)");
			}

			value = [1, [2]];
			value[2] = value;
			expected = `"0xAEF626 Circular reference."`;
			try
			{
				Compact.list(value);
				outcome = null;
				test("Compact.list - create (04.06)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - create (04.07)");
			}

			value = {};
			value.r = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				Compact.list(value);
				outcome = null;
				test("Compact.list - create (04.08)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("Compact.list - create (04.09)");
			}

			expected = `<Unset>`; value = Unset; outcome = Compact.list(value); test("Compact.list - create (06.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Symbol("symbol"); outcome = Compact.list(value); test("Compact.list - create (06.03)");
			expected = `true`; value = {}; outcome = Compact.list(value); outcome = outcome[0].length === T_0xBD1466; test("Compact.list - create (06.05)");
			expected = `true`; value = {}; outcome = Compact.list(value, null, false, () => Compact.create(0, T_0xBD1466 + 1)); outcome = outcome[0].length === T_0xBD1466 + 1; test("Compact.list - create (06.06)");

			//	use `offsetInTarget`
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Compact>[<symbol>]]`; value = Symbol("symbol"); outcome = Compact.list(value, null, false, null, null, 1); test("Compact.list - create (07.01)");
		}

		function test_Compact_toCompactFormal_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = Compact.create(); value.count = 1; value[0] = null; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = Compact.create(); value.count = 1; value[0] = true; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = Compact.create(); value.count = 1; value[0] = false; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = Compact.list([])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = Compact.list({})[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (01.10)");

			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.01)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = Compact.list({ 1: 1 })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a", "b"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a", "b"]`; value = Compact.list({ a: { b: {} } })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a", "b"]`; value = Compact.list({ a: { b: [] } })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a", "b", 0]`; value = Compact.list({ a: { b: [0] } })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a", 0, "b"]`; value = Compact.list({ a: [{ b: 1 }] })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = Compact.list([0])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = Compact.list([1])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = Compact.list([void 0, 1])[1]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = Compact.list([{}])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = Compact.list([[]])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0, 0]`; value = Compact.list([[[]]])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.06)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, 0]`; value = Compact.list([[[5]]])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.07)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, "a"]`; value = Compact.list([[{ a: 5 }]])[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.list({ "": 1 })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (04.01)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\."]`; value = Compact.list({ ".": 1 })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (04.02)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\#"]`; value = Compact.list({ "#": 1 })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (04.03)");
			//	the `"\\\\\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a double backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\"]`; value = Compact.list({ "\\": 1 })[0]; outcome = Compact.toCompactFormal(value, CompactFormal.create()); test("Compact.toCompactFormal - copy (04.04)");
		}

		function test_Compact_toCompactFormal_mutate()
		{
			expected = `<Unset>`; value = Unset; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = Compact.create(); value.count = 1; value[0] = null; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = Compact.create(); value.count = 1; value[0] = true; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = Compact.create(); value.count = 1; value[0] = false; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = Compact.list([])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = Compact.list({})[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (01.10)");

			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.01)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = Compact.list({ 1: 1 })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a", "b"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a", "b"]`; value = Compact.list({ a: { b: {} } })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a", "b"]`; value = Compact.list({ a: { b: [] } })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a", "b", 0]`; value = Compact.list({ a: { b: [0] } })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a", 0, "b"]`; value = Compact.list({ a: [{ b: 1 }] })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = Compact.list([0])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = Compact.list([1])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = Compact.list([void 0, 1])[1]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = Compact.list([{}])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = Compact.list([[]])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0, 0]`; value = Compact.list([[[]]])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.06)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, 0]`; value = Compact.list([[[5]]])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.07)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, "a"]`; value = Compact.list([[{ a: 5 }]])[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.list({ "": 1 })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (04.01)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\."]`; value = Compact.list({ ".": 1 })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (04.02)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\#"]`; value = Compact.list({ "#": 1 })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (04.03)");
			//	the `"\\\\\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a double backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\"]`; value = Compact.list({ "\\": 1 })[0]; Compact.toCompactFormal(value); outcome = value; test("Compact.toCompactFormal - mutate (04.04)");
		}

		function test_Compact_toCompactFormalFused_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = Compact.create(); value.count = 1; value[0] = null; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = Compact.create(); value.count = 1; value[0] = true; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = Compact.create(); value.count = 1; value[0] = false; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = Compact.list([])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = Compact.list({})[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (01.10)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.list({ "": 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.01a)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.01b)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = Compact.list({ 1: 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a.b"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a.b"]`; value = Compact.list({ a: { b: {} } })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a.b"]`; value = Compact.list({ a: { b: [] } })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a.b#0"]`; value = Compact.list({ a: { b: [0] } })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a#0.b"]`; value = Compact.list({ a: [{ b: 1 }] })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = Compact.list([0])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = Compact.list([1])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = Compact.list([void 0, 1])[1]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = Compact.list([{}])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = Compact.list([[]])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "#0#0"]`; value = Compact.list([[[]]])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.06)");
			expected = `&cbuf<CompactFormal>[5, "#0#0#0"]`; value = Compact.list([[[5]]])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.07)");
			expected = `&cbuf<CompactFormal>[5, "#0#0.a"]`; value = Compact.list([[{ a: 5 }]])[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.list({ "": 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (04.01)");
			expected = `&cbuf<CompactFormal>[1, "\\\\."]`; value = Compact.list({ ".": 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (04.02)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#"]`; value = Compact.list({ "#": 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\"]`; value = Compact.list({ "\\": 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (04.04)");

			expected = `&cbuf<CompactFormal>[1, "\\\\#0"]`; value = Compact.list({ "#0": 1 })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.01)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0#0"]`; value = Compact.list({ "#0": [1] })[0]; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.02)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "#0"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.03)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0.\\\\#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = "#0"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.04)");
			expected = `&cbuf<CompactFormal>[1, "#0.\\\\#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = "#0"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.05)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = 0; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.06)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = 0; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.07)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = ""; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.08)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\0"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "\\0"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.09)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "a"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.10)");
			expected = `&cbuf<CompactFormal>[1, "\\\\.a"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = ".a"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.11)");
			expected = `&cbuf<CompactFormal>[1, "a.b"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = "a"; value[2] = "b"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.12)");
			expected = `&cbuf<CompactFormal>[1, "a\\\\.b"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "a.b"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.13)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "a\\\\\\\\\\\\.b"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "a\\.b"; outcome = Compact.toCompactFormalFused(value, CompactFormal.create()); test("Compact.toCompactFormalFused - copy (05.13)");
		}

		function test_Compact_toCompactFormalFused_mutate()
		{
			expected = `<Unset>`; value = Unset; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = Compact.create(); value.count = 1; value[0] = null; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = Compact.create(); value.count = 1; value[0] = true; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = Compact.create(); value.count = 1; value[0] = false; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = Compact.list([])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = Compact.list({})[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (01.10)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.list({ "": 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.01a)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.01b)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = Compact.list({ 1: 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a.b"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a.b"]`; value = Compact.list({ a: { b: {} } })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a.b"]`; value = Compact.list({ a: { b: [] } })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a.b#0"]`; value = Compact.list({ a: { b: [0] } })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a#0.b"]`; value = Compact.list({ a: [{ b: 1 }] })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = Compact.list([0])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = Compact.list([1])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = Compact.list([void 0, 1])[1]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = Compact.list([{}])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = Compact.list([[]])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "#0#0"]`; value = Compact.list([[[]]])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.06)");
			expected = `&cbuf<CompactFormal>[5, "#0#0#0"]`; value = Compact.list([[[5]]])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.07)");
			expected = `&cbuf<CompactFormal>[5, "#0#0.a"]`; value = Compact.list([[{ a: 5 }]])[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.list({ "": 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (04.01)");
			expected = `&cbuf<CompactFormal>[1, "\\\\."]`; value = Compact.list({ ".": 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (04.02)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#"]`; value = Compact.list({ "#": 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\"]`; value = Compact.list({ "\\": 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (04.04)");

			expected = `&cbuf<CompactFormal>[1, "\\\\#0"]`; value = Compact.list({ "#0": 1 })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.01)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0#0"]`; value = Compact.list({ "#0": [1] })[0]; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.02)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "#0"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.03)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0.\\\\#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = "#0"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.04)");
			expected = `&cbuf<CompactFormal>[1, "#0.\\\\#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = "#0"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.05)");
			expected = `&cbuf<CompactFormal>[1, "\\\\#0#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = 0; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.06)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = 0; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.07)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = ""; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.08)");
			expected = `&cbuf<CompactFormal>[1, "\\\\\\\\0"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "\\0"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.09)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = "a"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.10)");
			expected = `&cbuf<CompactFormal>[1, "\\\\.a"]`; value = Compact.create(); value.count = 2; value[0] = 1; value[1] = ".a"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.11)");
			expected = `&cbuf<CompactFormal>[1, "a.b"]`; value = Compact.create(); value.count = 3; value[0] = 1; value[1] = "a"; value[2] = "b"; Compact.toCompactFormalFused(value); outcome = value; test("Compact.toCompactFormalFused - mutate (05.11)");
		}

		function test_Compact_toLean_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.01)");
			expected = `&cbuf<Lean>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.02)");
			expected = `&cbuf<Lean>[null]`; value = Compact.create(); value.count = 1; value[0] = null; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.03)");
			expected = `&cbuf<Lean>[true]`; value = Compact.create(); value.count = 1; value[0] = true; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.04)");
			expected = `&cbuf<Lean>[false]`; value = Compact.create(); value.count = 1; value[0] = false; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.05)");
			expected = `&cbuf<Lean>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.06)");
			expected = `&cbuf<Lean>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.07)");
			expected = `&cbuf<Lean>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.08)");
			expected = `&cbuf<Lean>[<AlephNull>]`; value = Compact.list([])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.09)");
			expected = `&cbuf<Lean>[<AlephOne>]`; value = Compact.list({})[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (01.10)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "1"]`; value = Compact.list({ 1: 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 2, "b"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.03)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.05)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephOne>, "b"]`; value = Compact.list({ a: { b: {} } })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.06)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b"]`; value = Compact.list({ a: { b: [] } })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.07)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b", 0, 0]`; value = Compact.list({ a: { b: [0] } })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.08)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephOne>, 0, 1, "b"]`; value = Compact.list({ a: [{ b: 1 }] })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (02.09)");

			expected = `&cbuf<Lean>[<AlephNull>, null, 0, 0]`; value = Compact.list([0])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.01)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 0]`; value = Compact.list([1])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.02)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 1]`; value = Compact.list([void 0, 1])[1]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.03)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0]`; value = Compact.list([{}])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.04)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0]`; value = Compact.list([[]])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.05)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0]`; value = Compact.list([[[]]])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.06)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0, 5, 0]`; value = Compact.list([[[5]]])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.07)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephOne>, 0, 5, "a"]`; value = Compact.list([[{ a: 5 }]])[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (03.08)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, ""]`; value = Compact.list({ "": 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (04.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "."]`; value = Compact.list({ ".": 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (04.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "#"]`; value = Compact.list({ "#": 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]`; value = Compact.list({ "\\": 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (04.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a.b"]`; value = Compact.list({ "a.b": 1 })[0]; outcome = Compact.toLean(value, Lean.create()); test("Compact.toLean - copy (04.05)");
		}

		function test_Compact_toLean_mutate()
		{
			expected = `<Unset>`; value = Unset; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.01)");
			expected = `&cbuf<Lean>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.02)");
			expected = `&cbuf<Lean>[null]`; value = Compact.create(); value.count = 1; value[0] = null; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.03)");
			expected = `&cbuf<Lean>[true]`; value = Compact.create(); value.count = 1; value[0] = true; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.04)");
			expected = `&cbuf<Lean>[false]`; value = Compact.create(); value.count = 1; value[0] = false; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.05)");
			expected = `&cbuf<Lean>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.06)");
			expected = `&cbuf<Lean>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.07)");
			expected = `&cbuf<Lean>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.08)");
			expected = `&cbuf<Lean>[<AlephNull>]`; value = Compact.list([])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.09)");
			expected = `&cbuf<Lean>[<AlephOne>]`; value = Compact.list({})[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (01.10)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "1"]`; value = Compact.list({ 1: 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 2, "b"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.03)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.05)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephOne>, "b"]`; value = Compact.list({ a: { b: {} } })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.06)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b"]`; value = Compact.list({ a: { b: [] } })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.07)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b", 0, 0]`; value = Compact.list({ a: { b: [0] } })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.08)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephOne>, 0, 1, "b"]`; value = Compact.list({ a: [{ b: 1 }] })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (02.09)");

			expected = `&cbuf<Lean>[<AlephNull>, null, 0, 0]`; value = Compact.list([0])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.01)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 0]`; value = Compact.list([1])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.02)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 1]`; value = Compact.list([void 0, 1])[1]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.03)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0]`; value = Compact.list([{}])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.04)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0]`; value = Compact.list([[]])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.05)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0]`; value = Compact.list([[[]]])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.06)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0, 5, 0]`; value = Compact.list([[[5]]])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.07)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephOne>, 0, 5, "a"]`; value = Compact.list([[{ a: 5 }]])[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (03.08)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, ""]`; value = Compact.list({ "": 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (04.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "."]`; value = Compact.list({ ".": 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (04.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "#"]`; value = Compact.list({ "#": 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]`; value = Compact.list({ "\\": 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (04.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a.b"]`; value = Compact.list({ "a.b": 1 })[0]; Compact.toLean(value); outcome = value; test("Compact.toLean - mutate (04.05)");
		}

		function test_Compact_rotate_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.01)");
			expected = `<Unset>`; value = Unset; outcome = Compact.rotate(value, -1, Compact.create()); test("Compact.rotate - copy (01.011)");
			expected = `&cbuf<Compact>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.02)");
			expected = `&cbuf<Compact>[null]`; value = Compact.create(); value.count = 1; value[0] = null; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.03)");
			expected = `&cbuf<Compact>[true]`; value = Compact.create(); value.count = 1; value[0] = true; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.04)");
			expected = `&cbuf<Compact>[false]`; value = Compact.create(); value.count = 1; value[0] = false; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.05)");
			expected = `&cbuf<Compact>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.06)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.071)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.rotate(value, -1, Compact.create()); test("Compact.rotate - copy (01.072)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.rotate(value, 2, Compact.create()); test("Compact.rotate - copy (01.073)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; outcome = Compact.rotate(value, -2, Compact.create()); test("Compact.rotate - copy (01.074)");
			expected = `&cbuf<Compact>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.08)");
			expected = `&cbuf<Compact>[<AlephNull>]`; value = Compact.list([])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.09)");
			expected = `&cbuf<Compact>[<AlephOne>]`; value = Compact.list({})[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (01.10)");

			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.01)");
			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.rotate(value, -1, Compact.create()); test("Compact.rotate - copy (02.011)");
			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.rotate(value, 2, Compact.create()); test("Compact.rotate - copy (02.012)");
			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; outcome = Compact.rotate(value, -2, Compact.create()); test("Compact.rotate - copy (02.013)");
			expected = `&cbuf<Compact>[1, "1"]`; value = Compact.list({ 1: 1 })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.02)");
			expected = `&cbuf<Compact>[2, "b", "a"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.03)");
			expected = `&cbuf<Compact>[2, "b", "a"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.rotate(value, -1, Compact.create()); test("Compact.rotate - copy (02.031)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.rotate(value, 2, Compact.create()); test("Compact.rotate - copy (02.032)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = Compact.list({ a: { b: 2 } })[0]; outcome = Compact.rotate(value, -2, Compact.create()); test("Compact.rotate - copy (02.033)");
			expected = `&cbuf<Compact>[<AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.04)");
			expected = `&cbuf<Compact>[<AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.05)");
			expected = `&cbuf<Compact>[<AlephOne>, "b", "a"]`; value = Compact.list({ a: { b: {} } })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.06)");
			expected = `&cbuf<Compact>[<AlephNull>, "b", "a"]`; value = Compact.list({ a: { b: [] } })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.07)");
			expected = `&cbuf<Compact>[5, "c", "a", "b"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.08)");
			expected = `&cbuf<Compact>[5, "b", "c", "a"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, -1, Compact.create()); test("Compact.rotate - copy (02.081)");
			expected = `&cbuf<Compact>[5, "b", "c", "a"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, 2, Compact.create()); test("Compact.rotate - copy (02.082)");
			expected = `&cbuf<Compact>[5, "c", "a", "b"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, -2, Compact.create()); test("Compact.rotate - copy (02.083)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, 3, Compact.create()); test("Compact.rotate - copy (02.084)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, -3, Compact.create()); test("Compact.rotate - copy (02.085)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, 0, Compact.create()); test("Compact.rotate - copy (02.086)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, 6, Compact.create()); test("Compact.rotate - copy (02.086)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, -6, Compact.create()); test("Compact.rotate - copy (02.087)");
			expected = `&cbuf<Compact>[5, "c", "a", "b"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, 7, Compact.create()); test("Compact.rotate - copy (02.088)");
			expected = `&cbuf<Compact>[5, "b", "c", "a"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; outcome = Compact.rotate(value, -7, Compact.create()); test("Compact.rotate - copy (02.089)");
			expected = `&cbuf<Compact>[0, 0, "a", "b"]`; value = Compact.list({ a: { b: [0] } })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.09)");
			expected = `&cbuf<Compact>[1, "b", "a", 0]`; value = Compact.list({ a: [{ b: 1 }] })[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (02.10)");

			expected = `&cbuf<Compact>[0, 0]`; value = Compact.list([0])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.01)");
			expected = `&cbuf<Compact>[1, 0]`; value = Compact.list([1])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.02)");
			expected = `&cbuf<Compact>[1, 1]`; value = Compact.list([void 0, 1])[1]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.03)");
			expected = `&cbuf<Compact>[<AlephOne>, 0]`; value = Compact.list([{}])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.04)");
			expected = `&cbuf<Compact>[<AlephNull>, 0]`; value = Compact.list([[]])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.05)");
			expected = `&cbuf<Compact>[<AlephNull>, 0, 0]`; value = Compact.list([[[]]])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.06)");
			expected = `&cbuf<Compact>[5, 0, 0, 0]`; value = Compact.list([[[5]]])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.07)");
			expected = `&cbuf<Compact>[5, "a", 0, 0]`; value = Compact.list([[{ a: 5 }]])[0]; outcome = Compact.rotate(value, 1, Compact.create()); test("Compact.rotate - copy (03.08)");
		}

		function test_Compact_rotate_mutate()
		{
			expected = `<Unset>`; value = Unset; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.01)");
			expected = `<Unset>`; value = Unset; Compact.rotate(value, -1); outcome = value; test("Compact.rotate (01.011)");
			expected = `&cbuf<Compact>[void 0]`; value = Compact.create(); value.count = 1; value[0] = void 0; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.02)");
			expected = `&cbuf<Compact>[null]`; value = Compact.create(); value.count = 1; value[0] = null; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.03)");
			expected = `&cbuf<Compact>[true]`; value = Compact.create(); value.count = 1; value[0] = true; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.04)");
			expected = `&cbuf<Compact>[false]`; value = Compact.create(); value.count = 1; value[0] = false; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.05)");
			expected = `&cbuf<Compact>[0]`; value = Compact.create(); value.count = 1; value[0] = 0; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.06)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.071)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.rotate(value, -1); outcome = value; test("Compact.rotate (01.072)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.rotate(value, 2); outcome = value; test("Compact.rotate (01.073)");
			expected = `&cbuf<Compact>[1]`; value = Compact.create(); value.count = 1; value[0] = 1; Compact.rotate(value, -2); outcome = value; test("Compact.rotate (01.074)");
			expected = `&cbuf<Compact>[""]`; value = Compact.create(); value.count = 1; value[0] = ""; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.08)");
			expected = `&cbuf<Compact>[<AlephNull>]`; value = Compact.list([])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.09)");
			expected = `&cbuf<Compact>[<AlephOne>]`; value = Compact.list({})[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (01.10)");

			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.01)");
			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.rotate(value, -1); outcome = value; test("Compact.rotate (02.011)");
			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.rotate(value, 2); outcome = value; test("Compact.rotate (02.012)");
			expected = `&cbuf<Compact>[1, "a"]`; value = Compact.list({ a: 1 })[0]; Compact.rotate(value, -2); outcome = value; test("Compact.rotate (02.013)");
			expected = `&cbuf<Compact>[1, "1"]`; value = Compact.list({ 1: 1 })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.02)");
			expected = `&cbuf<Compact>[2, "b", "a"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.03)");
			expected = `&cbuf<Compact>[2, "b", "a"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.rotate(value, -1); outcome = value; test("Compact.rotate (02.031)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.rotate(value, 2); outcome = value; test("Compact.rotate (02.032)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = Compact.list({ a: { b: 2 } })[0]; Compact.rotate(value, -2); outcome = value; test("Compact.rotate (02.033)");
			expected = `&cbuf<Compact>[<AlephOne>, "a"]`; value = Compact.list({ a: {} })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.04)");
			expected = `&cbuf<Compact>[<AlephNull>, "a"]`; value = Compact.list({ a: [] })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.05)");
			expected = `&cbuf<Compact>[<AlephOne>, "b", "a"]`; value = Compact.list({ a: { b: {} } })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.06)");
			expected = `&cbuf<Compact>[<AlephNull>, "b", "a"]`; value = Compact.list({ a: { b: [] } })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.07)");
			expected = `&cbuf<Compact>[5, "c", "a", "b"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.08)");
			expected = `&cbuf<Compact>[5, "b", "c", "a"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, -1); outcome = value; test("Compact.rotate (02.081)");
			expected = `&cbuf<Compact>[5, "b", "c", "a"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, 2); outcome = value; test("Compact.rotate (02.082)");
			expected = `&cbuf<Compact>[5, "c", "a", "b"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, -2); outcome = value; test("Compact.rotate (02.083)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, 3); outcome = value; test("Compact.rotate (02.084)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, -3); outcome = value; test("Compact.rotate (02.085)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, 0); outcome = value; test("Compact.rotate (02.086)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, 6); outcome = value; test("Compact.rotate (02.086)");
			expected = `&cbuf<Compact>[5, "a", "b", "c"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, -6); outcome = value; test("Compact.rotate (02.087)");
			expected = `&cbuf<Compact>[5, "c", "a", "b"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, 7); outcome = value; test("Compact.rotate (02.088)");
			expected = `&cbuf<Compact>[5, "b", "c", "a"]`; value = Compact.list({ a: { b: { c: 5 } } })[0]; Compact.rotate(value, -7); outcome = value; test("Compact.rotate (02.089)");
			expected = `&cbuf<Compact>[0, 0, "a", "b"]`; value = Compact.list({ a: { b: [0] } })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.09)");
			expected = `&cbuf<Compact>[1, "b", "a", 0]`; value = Compact.list({ a: [{ b: 1 }] })[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (02.10)");

			expected = `&cbuf<Compact>[0, 0]`; value = Compact.list([0])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.01)");
			expected = `&cbuf<Compact>[1, 0]`; value = Compact.list([1])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.02)");
			expected = `&cbuf<Compact>[1, 1]`; value = Compact.list([void 0, 1])[1]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.03)");
			expected = `&cbuf<Compact>[<AlephOne>, 0]`; value = Compact.list([{}])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.04)");
			expected = `&cbuf<Compact>[<AlephNull>, 0]`; value = Compact.list([[]])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.05)");
			expected = `&cbuf<Compact>[<AlephNull>, 0, 0]`; value = Compact.list([[[]]])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.06)");
			expected = `&cbuf<Compact>[5, 0, 0, 0]`; value = Compact.list([[[5]]])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.07)");
			expected = `&cbuf<Compact>[5, "a", 0, 0]`; value = Compact.list([[{ a: 5 }]])[0]; Compact.rotate(value, 1); outcome = value; test("Compact.rotate (03.08)");
		}

		
		function test_CompactFormal_list_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<symbol>]]`; value = Unset; outcome = CompactFormal.list(Symbol("symbol")); test("CompactFormal.list - copy (01.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[void 0]]`; value = void 0; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[null]]`; value = null; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[true]]`; value = true; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[false]]`; value = false; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0]]`; value = 0; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1]]`; value = 1; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[""]]`; value = ""; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>["a"]]`; value = "a"; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (01.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>]]`; value = {}; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (01.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>]]`; value = []; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (01.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, ""]]`; value = { "": 1 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.01a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "."]]`; value = { ".": 1 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.01b)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "#"]]`; value = { "#": 1 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.01c)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "\\\\"]]`; value = { "\\": 1 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.01d)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"]]`; value = { a: 1 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.01e)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "1"]]`; value = { 1: 1 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[2, "a", "b"]]`; value = { a: { b: 2 } }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, "a"]]`; value = { a: {} }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, "a", "b"]]`; value = { a: { b: {} } }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, "a", "b"]]`; value = { a: { b: [] } }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, "a"]]`; value = { a: [] }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, "a", 0]]`; value = { a: [0] }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", 0, "b"]]`; value = { a: [{ b: 1 }] }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, "a", 0]]`; value = { a: [[]] }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", 0, 0]]`; value = { a: [[1]] }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"], &cbuf<CompactFormal>[2, "b"]]`; value = { a: 1, b: 2 }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (02.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0]]`; value = [1]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, 0]]`; value = [{}]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0, "a"]]`; value = [{ a: 1 }]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, 0, "a"]]`; value = [{ a: [] }]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0, "a", 0]]`; value = [{ a: [1] }]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, 0]]`; value = [[]]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1]]`; value = [1, 2]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1], &cbuf<CompactFormal>[<AlephOne>, 2]]`; value = [1, 2, {}]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1], &cbuf<CompactFormal>[3, 2, "a"]]`; value = [1, 2, { a: 3 }]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1], &cbuf<CompactFormal>[3, 2, "a", "b"], &cbuf<CompactFormal>[4, 3]]`; value = [1, 2, { a: { b: 3 } }, 4]; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.073)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, ${1000000000 + T_0x455307}]]`; value = [1]; value[1000000000 + T_0x455307] = 2; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (03.08)");

			ref = {};
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, "a"], &cbuf<CompactFormal>[<AlephOne>, "b"]]`; value = { a: ref, b: ref }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (031.01)");
			ref = { c: 1 };
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", "c"], &cbuf<CompactFormal>[1, "b", "c"]]`; value = { a: ref, b: ref }; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (031.02)");

			ref = { a: null };
			value = { a: ref };
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				CompactFormal.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("CompactFormal.list - copy (04.01)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - copy (04.02)");
			}

			ref = { a: null };
			value = [ref];
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				CompactFormal.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("CompactFormal.list - copy (04.03)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - copy (04.04)");
			}

			value = [1];
			value[1] = value;
			expected = `"0x71E8D4 Circular reference."`;
			try
			{
				CompactFormal.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("CompactFormal.list - copy (04.04)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - copy (04.05)");
			}

			value = [1, [2]];
			value[2] = value;
			expected = `"0xAEF626 Circular reference."`;
			try
			{
				CompactFormal.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("CompactFormal.list - copy (04.06)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - copy (04.07)");
			}

			value = {};
			value.r = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				CompactFormal.list(value, null, false, null, GraphCursor.List.create());
				outcome = null;
				test("CompactFormal.list - copy (04.08)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - copy (04.09)");
			}

			expected = `<Unset>`; value = Unset; outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create()); test("CompactFormal.list - copy (06.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<symbol>]]`; value = Symbol("symbol"); CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); test("CompactFormal.list - copy (06.03)");
			expected = `true`; value = {}; CompactFormal.list(value, null, false, null, outcome = GraphCursor.List.create()); outcome = outcome[0].length === T_0x402757; test("CompactFormal.list - copy (06.05)");
			expected = `true`; value = {}; CompactFormal.list(value, null, false, () => CompactFormal.create(0, T_0x402757 + 1), outcome = GraphCursor.List.create()); outcome = outcome[0].length === T_0x402757 + 1; test("CompactFormal.list - copy (06.06)");

			//	use `offsetInTarget`
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<CompactFormal>[<symbol>]]`; value = Symbol("symbol"); outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create(0), 1); test("CompactFormal.list - copy (07.01)");
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<CompactFormal>[<symbol>]]`; value = Symbol("symbol"); outcome = CompactFormal.list(value, null, false, null, GraphCursor.List.create(1), 1); test("CompactFormal.list - copy (07.02)");
		}

		function test_CompactFormal_list_create()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<symbol>]]`; value = Unset; outcome = CompactFormal.list(Symbol("symbol")); test("CompactFormal.list - create (01.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[void 0]]`; value = void 0; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[null]]`; value = null; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[true]]`; value = true; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[false]]`; value = false; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0]]`; value = 0; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1]]`; value = 1; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[""]]`; value = ""; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>["a"]]`; value = "a"; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>]]`; value = {}; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>]]`; value = []; outcome = CompactFormal.list(value); test("CompactFormal.list - create (01.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[null, ""]]`; value = { "": null }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.01.null)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, ""]]`; value = { "": 1 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.01a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "."]]`; value = { ".": 1 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.01b)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "#"]]`; value = { "#": 1 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.01c)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "\\\\"]]`; value = { "\\": 1 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.01d)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"]]`; value = { a: 1 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.01e)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "1"]]`; value = { 1: 1 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.011)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[2, "a", "b"]]`; value = { a: { b: 2 } }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, "a"]]`; value = { a: {} }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, "a", "b"]]`; value = { a: { b: {} } }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, "a", "b"]]`; value = { a: { b: [] } }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, "a"]]`; value = { a: [] }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, "a", 0]]`; value = { a: [0] }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", 0, "b"]]`; value = { a: [{ b: 1 }] }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.08)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, "a", 0]]`; value = { a: [[]] }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.09)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", 0, 0]]`; value = { a: [[1]] }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.10)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"], &cbuf<CompactFormal>[2, "b"]]`; value = { a: 1, b: 2 }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (02.11)");

			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[null, 0]]`; value = [null]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.01.null)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0]]`; value = [1]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, 0]]`; value = [{}]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0, "a"]]`; value = [{ a: 1 }]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, 0, "a"]]`; value = [{ a: [] }]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0, "a", 0]]`; value = [{ a: [1] }]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephNull>, 0]]`; value = [[]]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1]]`; value = [1, 2]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1], &cbuf<CompactFormal>[<AlephOne>, 2]]`; value = [1, 2, {}]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1], &cbuf<CompactFormal>[3, 2, "a"]]`; value = [1, 2, { a: 3 }]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, 1], &cbuf<CompactFormal>[3, 2, "a", "b"], &cbuf<CompactFormal>[4, 3]]`; value = [1, 2, { a: { b: 3 } }, 4]; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.073)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, 0], &cbuf<CompactFormal>[2, ${1000000000 + T_0x455307}]]`; value = [1]; value[1000000000 + T_0x455307] = 2; outcome = CompactFormal.list(value); test("CompactFormal.list - create (03.08)");

			ref = {};
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>, "a"], &cbuf<CompactFormal>[<AlephOne>, "b"]]`; value = { a: ref, b: ref }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (031.01)");
			ref = { c: 1 };
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", "c"], &cbuf<CompactFormal>[1, "b", "c"]]`; value = { a: ref, b: ref }; outcome = CompactFormal.list(value); test("CompactFormal.list - create (031.02)");

			ref = { a: null };
			value = { a: ref };
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				CompactFormal.list(value);
				outcome = null;
				test("CompactFormal.list - create (04.01)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - create (04.02)");
			}

			ref = { a: null };
			value = [ref];
			ref.a = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				CompactFormal.list(value);
				outcome = null;
				test("CompactFormal.list - create (04.03)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - create (04.04)");
			}

			value = [1];
			value[1] = value;
			expected = `"0x71E8D4 Circular reference."`;
			try
			{
				CompactFormal.list(value);
				outcome = null;
				test("CompactFormal.list - create (04.04)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - create (04.05)");
			}

			value = [1, [2]];
			value[2] = value;
			expected = `"0xAEF626 Circular reference."`;
			try
			{
				CompactFormal.list(value);
				outcome = null;
				test("CompactFormal.list - create (04.06)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - create (04.07)");
			}

			value = {};
			value.r = value;
			expected = `"0x4DCDC3 Circular reference."`;
			try
			{
				CompactFormal.list(value);
				outcome = null;
				test("CompactFormal.list - create (04.08)");
			}
			catch (ex)
			{
				outcome = ex.message;
				test("CompactFormal.list - create (04.09)");
			}

			expected = `<Unset>`; value = Unset; outcome = CompactFormal.list(value); test("CompactFormal.list - create (06.01)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<symbol>]]`; value = Symbol("symbol"); outcome = CompactFormal.list(value); test("CompactFormal.list - create (06.03)");
			expected = `true`; value = {}; outcome = CompactFormal.list(value); outcome = outcome[0].length === T_0x402757; test("CompactFormal.list - create (06.05)");
			expected = `true`; value = {}; outcome = CompactFormal.list(value, null, false, () => CompactFormal.create(0, T_0x402757 + 1)); outcome = outcome[0].length === T_0x402757 + 1; test("CompactFormal.list - create (06.06)");

			//	use `offsetInTarget`
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<CompactFormal>[<symbol>]]`; value = Symbol("symbol"); outcome = CompactFormal.list(value, null, false, null, null, 1); test("CompactFormal.list - create (07.01)");
		}

		function test_CompactFormal_toCompact_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.01)");
			expected = `&cbuf<Compact>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.02)");
			expected = `&cbuf<Compact>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.03)");
			expected = `&cbuf<Compact>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.04)");
			expected = `&cbuf<Compact>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.05)");
			expected = `&cbuf<Compact>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.06)");
			expected = `&cbuf<Compact>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.07)");
			expected = `&cbuf<Compact>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.08)");
			expected = `&cbuf<Compact>[<AlephNull>]`; value = CompactFormal.list([])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.09)");
			expected = `&cbuf<Compact>[<AlephOne>]`; value = CompactFormal.list({})[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (01.10)");

			expected = `&cbuf<Compact>[1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.01)");
			expected = `&cbuf<Compact>[1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.02)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = CompactFormal.list({ a: { b: 2 } })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.03)");
			expected = `&cbuf<Compact>[<AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.04)");
			expected = `&cbuf<Compact>[<AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.05)");
			expected = `&cbuf<Compact>[<AlephOne>, "a", "b"]`; value = CompactFormal.list({ a: { b: {} } })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.06)");
			expected = `&cbuf<Compact>[<AlephNull>, "a", "b"]`; value = CompactFormal.list({ a: { b: [] } })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.07)");
			expected = `&cbuf<Compact>[0, "a", "b", 0]`; value = CompactFormal.list({ a: { b: [0] } })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.08)");
			expected = `&cbuf<Compact>[1, "a", 0, "b"]`; value = CompactFormal.list({ a: [{ b: 1 }] })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (02.09)");

			expected = `&cbuf<Compact>[0, 0]`; value = CompactFormal.list([0])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.01)");
			expected = `&cbuf<Compact>[1, 0]`; value = CompactFormal.list([1])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.02)");
			expected = `&cbuf<Compact>[1, 1]`; value = CompactFormal.list([void 0, 1])[1]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.03)");
			expected = `&cbuf<Compact>[<AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.04)");
			expected = `&cbuf<Compact>[<AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.05)");
			expected = `&cbuf<Compact>[<AlephNull>, 0, 0]`; value = CompactFormal.list([[[]]])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.06)");
			expected = `&cbuf<Compact>[5, 0, 0, 0]`; value = CompactFormal.list([[[5]]])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.07)");
			expected = `&cbuf<Compact>[5, 0, 0, "a"]`; value = CompactFormal.list([[{ a: 5 }]])[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (03.08)");

			expected = `&cbuf<Compact>[1, ""]`; value = CompactFormal.list({ "\\0": 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (04.01)");
			expected = `&cbuf<Compact>[1, "."]`; value = CompactFormal.list({ "\\.": 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (04.02)");
			expected = `&cbuf<Compact>[1, "#"]`; value = CompactFormal.list({ "\\#": 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Compact>[1, "\\\\"]`; value = CompactFormal.list({ "\\\\": 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (04.04)");
			expected = `&cbuf<Compact>[1, "a.b"]`; value = CompactFormal.list({ "a\\.b": 1 })[0]; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (04.05)");

			expected = `&cbuf<Compact>[1, "a.b", "c", "d"]`; value = CompactFormal.create(3); value[0] = 1; value[1] = "a\\.b"; value[2] = "c.d"; outcome = CompactFormal.toCompact(value, Compact.create()); test("CompactFormal.toCompact - copy (05.01)");
		}

		function test_CompactFormal_toCompact_mutate()
		{
			expected = `<Unset>`; value = Unset; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.01)");
			expected = `&cbuf<Compact>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.02)");
			expected = `&cbuf<Compact>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.03)");
			expected = `&cbuf<Compact>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.04)");
			expected = `&cbuf<Compact>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.05)");
			expected = `&cbuf<Compact>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.06)");
			expected = `&cbuf<Compact>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.07)");
			expected = `&cbuf<Compact>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.08)");
			expected = `&cbuf<Compact>[<AlephNull>]`; value = CompactFormal.list([])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.09)");
			expected = `&cbuf<Compact>[<AlephOne>]`; value = CompactFormal.list({})[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (01.10)");

			expected = `&cbuf<Compact>[1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.01)");
			expected = `&cbuf<Compact>[1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.02)");
			expected = `&cbuf<Compact>[2, "a", "b"]`; value = CompactFormal.list({ a: { b: 2 } })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.03)");
			expected = `&cbuf<Compact>[<AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.04)");
			expected = `&cbuf<Compact>[<AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.05)");
			expected = `&cbuf<Compact>[<AlephOne>, "a", "b"]`; value = CompactFormal.list({ a: { b: {} } })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.06)");
			expected = `&cbuf<Compact>[<AlephNull>, "a", "b"]`; value = CompactFormal.list({ a: { b: [] } })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.07)");
			expected = `&cbuf<Compact>[0, "a", "b", 0]`; value = CompactFormal.list({ a: { b: [0] } })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.08)");
			expected = `&cbuf<Compact>[1, "a", 0, "b"]`; value = CompactFormal.list({ a: [{ b: 1 }] })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (02.09)");

			expected = `&cbuf<Compact>[0, 0]`; value = CompactFormal.list([0])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.01)");
			expected = `&cbuf<Compact>[1, 0]`; value = CompactFormal.list([1])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.02)");
			expected = `&cbuf<Compact>[1, 1]`; value = CompactFormal.list([void 0, 1])[1]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.03)");
			expected = `&cbuf<Compact>[<AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.04)");
			expected = `&cbuf<Compact>[<AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.05)");
			expected = `&cbuf<Compact>[<AlephNull>, 0, 0]`; value = CompactFormal.list([[[]]])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.06)");
			expected = `&cbuf<Compact>[5, 0, 0, 0]`; value = CompactFormal.list([[[5]]])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.07)");
			expected = `&cbuf<Compact>[5, 0, 0, "a"]`; value = CompactFormal.list([[{ a: 5 }]])[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (03.08)");

			expected = `&cbuf<Compact>[1, ""]`; value = CompactFormal.list({ "\\0": 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (04.01)");
			expected = `&cbuf<Compact>[1, "."]`; value = CompactFormal.list({ "\\.": 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (04.02)");
			expected = `&cbuf<Compact>[1, "#"]`; value = CompactFormal.list({ "\\#": 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Compact>[1, "\\\\"]`; value = CompactFormal.list({ "\\\\": 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (04.04)");
			expected = `&cbuf<Compact>[1, "a.b"]`; value = CompactFormal.list({ "a\\.b": 1 })[0]; CompactFormal.toCompact(value); outcome = value; test("CompactFormal.toCompact mutate - (04.05)");

			expected = `&cbuf<Compact>[1, "a.b", "c", "d"]`; value = CompactFormal.create(3); value[0] = 1; value[1] = "a\\.b"; value[2] = "c.d"; outcome = CompactFormal.toCompact(value); test("CompactFormal.toCompact - mutate (05.01)");
		}

		function test_CompactFormal_toLean_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.01)");
			expected = `&cbuf<Lean>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.02)");
			expected = `&cbuf<Lean>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.03)");
			expected = `&cbuf<Lean>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.04)");
			expected = `&cbuf<Lean>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.05)");
			expected = `&cbuf<Lean>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.06)");
			expected = `&cbuf<Lean>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.07)");
			expected = `&cbuf<Lean>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.08)");
			expected = `&cbuf<Lean>[<AlephNull>]`; value = CompactFormal.list([])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.09)");
			expected = `&cbuf<Lean>[<AlephOne>]`; value = CompactFormal.list({})[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (01.10)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 2, "b"]`; value = CompactFormal.list({ a: { b: 2 } })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.03)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.05)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephOne>, "b"]`; value = CompactFormal.list({ a: { b: {} } })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.06)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b"]`; value = CompactFormal.list({ a: { b: [] } })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.07)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b", 0, 0]`; value = CompactFormal.list({ a: { b: [0] } })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.08)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephOne>, 0, 1, "b"]`; value = CompactFormal.list({ a: [{ b: 1 }] })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (02.09)");

			expected = `&cbuf<Lean>[<AlephNull>, null, 0, 0]`; value = CompactFormal.list([0])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.01)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 0]`; value = CompactFormal.list([1])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.02)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 1]`; value = CompactFormal.list([void 0, 1])[1]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.03)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.04)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.05)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0]`; value = CompactFormal.list([[[]]])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.06)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0, 5, 0]`; value = CompactFormal.list([[[5]]])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.07)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephOne>, 0, 5, "a"]`; value = CompactFormal.list([[{ a: 5 }]])[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (03.08)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, ""]`; value = CompactFormal.list({ "": 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (04.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "."]`; value = CompactFormal.list({ ".": 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (04.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "#"]`; value = CompactFormal.list({ "#": 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]`; value = CompactFormal.list({ "\\": 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (04.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a.b"]`; value = CompactFormal.list({ "a.b": 1 })[0]; outcome = CompactFormal.toLean(value, Lean.create()); test("CompactFormal.toLean - copy (04.05)");
		}

		function test_CompactFormal_toLean_mutate()
		{
			expected = `<Unset>`; value = Unset; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.01)");
			expected = `&cbuf<Lean>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.02)");
			expected = `&cbuf<Lean>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.03)");
			expected = `&cbuf<Lean>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.04)");
			expected = `&cbuf<Lean>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.05)");
			expected = `&cbuf<Lean>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.06)");
			expected = `&cbuf<Lean>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.07)");
			expected = `&cbuf<Lean>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.08)");
			expected = `&cbuf<Lean>[<AlephNull>]`; value = CompactFormal.list([])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.09)");
			expected = `&cbuf<Lean>[<AlephOne>]`; value = CompactFormal.list({})[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (01.10)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", 2, "b"]`; value = CompactFormal.list({ a: { b: 2 } })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.03)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.05)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephOne>, "b"]`; value = CompactFormal.list({ a: { b: {} } })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.06)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b"]`; value = CompactFormal.list({ a: { b: [] } })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.07)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephOne>, "a", <AlephNull>, "b", 0, 0]`; value = CompactFormal.list({ a: { b: [0] } })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.08)");
			expected = `&cbuf<Lean>[<AlephOne>, null, <AlephNull>, "a", <AlephOne>, 0, 1, "b"]`; value = CompactFormal.list({ a: [{ b: 1 }] })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (02.09)");

			expected = `&cbuf<Lean>[<AlephNull>, null, 0, 0]`; value = CompactFormal.list([0])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.01)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 0]`; value = CompactFormal.list([1])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.02)");
			expected = `&cbuf<Lean>[<AlephNull>, null, 1, 1]`; value = CompactFormal.list([void 0, 1])[1]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.03)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.04)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.05)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0]`; value = CompactFormal.list([[[]]])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.06)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephNull>, 0, 5, 0]`; value = CompactFormal.list([[[5]]])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.07)");
			expected = `&cbuf<Lean>[<AlephNull>, null, <AlephNull>, 0, <AlephOne>, 0, 5, "a"]`; value = CompactFormal.list([[{ a: 5 }]])[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (03.08)");

			expected = `&cbuf<Lean>[<AlephOne>, null, 1, ""]`; value = CompactFormal.list({ "": 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (04.01)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "."]`; value = CompactFormal.list({ ".": 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (04.02)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "#"]`; value = CompactFormal.list({ "#": 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "\\\\"]`; value = CompactFormal.list({ "\\": 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (04.04)");
			expected = `&cbuf<Lean>[<AlephOne>, null, 1, "a.b"]`; value = CompactFormal.list({ "a.b": 1 })[0]; CompactFormal.toLean(value); outcome = value; test("CompactFormal.toLean - mutate (04.05)");
		}

		function test_CompactFormal_fuse_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = CompactFormal.list([])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = CompactFormal.list({})[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (01.10)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.01a)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.01b)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a.b"]`; value = CompactFormal.list({ a: { b: 2 } })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a.b"]`; value = CompactFormal.list({ a: { b: {} } })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a.b"]`; value = CompactFormal.list({ a: { b: [] } })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a.b#0"]`; value = CompactFormal.list({ a: { b: [0] } })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a#0.b"]`; value = CompactFormal.list({ a: [{ b: 1 }] })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = CompactFormal.list([0])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.list([1])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = CompactFormal.list([void 0, 1])[1]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "#0#0"]`; value = CompactFormal.list([[[]]])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.06)");
			expected = `&cbuf<CompactFormal>[5, "#0#0#0"]`; value = CompactFormal.list([[[5]]])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.07)");
			expected = `&cbuf<CompactFormal>[5, "#0#0.a"]`; value = CompactFormal.list([[{ a: 5 }]])[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (04.01)");
			expected = `&cbuf<CompactFormal>[1, "."]`; value = CompactFormal.list({ ".": 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (04.02)");
			expected = `&cbuf<CompactFormal>[1, "#"]`; value = CompactFormal.list({ "#": 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\"]`; value = CompactFormal.list({ "\\": 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (04.04)");

			expected = `&cbuf<CompactFormal>[1, "#0"]`; value = CompactFormal.list({ "#0": 1 })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.01)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.list({ "#0": [1] })[0]; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.02)");
			expected = `&cbuf<CompactFormal>[1, "#0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "#0"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.03)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = "#0"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.04)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = "#0"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.05)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = 0; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.06)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = 0; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.07)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ""; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.08)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "\\0"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.09)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.10)");
			expected = `&cbuf<CompactFormal>[1, ".a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ".a"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.11)");
			expected = `&cbuf<CompactFormal>[1, "a.b"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = "a"; value[2] = "b"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.12)");
			expected = `&cbuf<CompactFormal>[1, "a.b"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a.b"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.13)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "a\\\\.b"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a\\.b"; outcome = CompactFormal.fuse(value, CompactFormal.create()); test("CompactFormal.fuse - copy (05.13)");
		}

		function test_CompactFormal_fuse_mutate()
		{
			expected = `<Unset>`; value = Unset; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = CompactFormal.list([])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = CompactFormal.list({})[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (01.10)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.01a)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.01b)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a.b"]`; value = CompactFormal.list({ a: { b: 2 } })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a.b"]`; value = CompactFormal.list({ a: { b: {} } })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a.b"]`; value = CompactFormal.list({ a: { b: [] } })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a.b#0"]`; value = CompactFormal.list({ a: { b: [0] } })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a#0.b"]`; value = CompactFormal.list({ a: [{ b: 1 }] })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = CompactFormal.list([0])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.list([1])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = CompactFormal.list([void 0, 1])[1]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "#0#0"]`; value = CompactFormal.list([[[]]])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.06)");
			expected = `&cbuf<CompactFormal>[5, "#0#0#0"]`; value = CompactFormal.list([[[5]]])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.07)");
			expected = `&cbuf<CompactFormal>[5, "#0#0.a"]`; value = CompactFormal.list([[{ a: 5 }]])[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (04.01)");
			expected = `&cbuf<CompactFormal>[1, "."]`; value = CompactFormal.list({ ".": 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (04.02)");
			expected = `&cbuf<CompactFormal>[1, "#"]`; value = CompactFormal.list({ "#": 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\"]`; value = CompactFormal.list({ "\\": 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (04.04)");

			expected = `&cbuf<CompactFormal>[1, "#0"]`; value = CompactFormal.list({ "#0": 1 })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.01)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.list({ "#0": [1] })[0]; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.02)");
			expected = `&cbuf<CompactFormal>[1, "#0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "#0"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.03)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = "#0"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.04)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = "#0"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.05)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = "#0"; value[2] = 0; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.06)");
			expected = `&cbuf<CompactFormal>[1, "#0#0"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = 0; value[2] = 0; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.07)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ""; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.08)");
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "\\0"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.09)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.10)");
			expected = `&cbuf<CompactFormal>[1, ".a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ".a"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.11)");
			expected = `&cbuf<CompactFormal>[1, "a.b"]`; value = CompactFormal.create(); value.count = 3; value[0] = 1; value[1] = "a"; value[2] = "b"; CompactFormal.fuse(value); outcome = value; test("CompactFormal.fuse - mutate (05.11)");
		}

		function test_CompactFormal_spread_copy()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = CompactFormal.list([])[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = CompactFormal.list({})[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (01.10)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.01a)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.01b)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a", "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: 2 } })[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a", "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: {} } })[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a", "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: [] } })[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a", "b", 0]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: [0] } })[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a", 0, "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: [{ b: 1 }] })[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = CompactFormal.list([0])[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.list([1])[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = CompactFormal.list([void 0, 1])[1]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0, 0]`; value = CompactFormal.fuse(CompactFormal.list([[[]]])[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.06)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, 0]`; value = CompactFormal.fuse(CompactFormal.list([[[5]]])[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.07)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, "a"]`; value = CompactFormal.fuse(CompactFormal.list([[{ a: 5 }]])[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (04.01)");
			expected = `&cbuf<CompactFormal>[1, "", ""]`; value = CompactFormal.list({ ".": 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (04.02)");
			expected = `&cbuf<CompactFormal>[1, "#"]`; value = CompactFormal.list({ "#": 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\"]`; value = CompactFormal.list({ "\\": 1 })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (04.04)");

			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.fuse(CompactFormal.list({ "#0": 1 })[0]); outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.01)");
			expected = `&cbuf<CompactFormal>[1, 0, 0]`; value = CompactFormal.list({ "#0": [1] })[0]; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.02)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = 0; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.03)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "#0"; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.03)");
			expected = `&cbuf<CompactFormal>[1, 0, 0]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "#0#0"; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.04)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ""; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.08)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "\\0"; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.09)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a"; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.10)");
			expected = `&cbuf<CompactFormal>[1, "", "a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ".a"; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.11)");
			expected = `&cbuf<CompactFormal>[1, "a", "b"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a.b"; outcome = CompactFormal.spread(value, CompactFormal.create()); test("CompactFormal.spread - copy (05.11)");
		}

		function test_CompactFormal_spread_mutate()
		{
			expected = `<Unset>`; value = Unset; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.01)");
			expected = `&cbuf<CompactFormal>[void 0]`; value = CompactFormal.create(); value.count = 1; value[0] = void 0; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.02)");
			expected = `&cbuf<CompactFormal>[null]`; value = CompactFormal.create(); value.count = 1; value[0] = null; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.03)");
			expected = `&cbuf<CompactFormal>[true]`; value = CompactFormal.create(); value.count = 1; value[0] = true; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.04)");
			expected = `&cbuf<CompactFormal>[false]`; value = CompactFormal.create(); value.count = 1; value[0] = false; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.05)");
			expected = `&cbuf<CompactFormal>[0]`; value = CompactFormal.create(); value.count = 1; value[0] = 0; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.06)");
			expected = `&cbuf<CompactFormal>[1]`; value = CompactFormal.create(); value.count = 1; value[0] = 1; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.07)");
			expected = `&cbuf<CompactFormal>[""]`; value = CompactFormal.create(); value.count = 1; value[0] = ""; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.08)");
			expected = `&cbuf<CompactFormal>[<AlephNull>]`; value = CompactFormal.list([])[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.09)");
			expected = `&cbuf<CompactFormal>[<AlephOne>]`; value = CompactFormal.list({})[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (01.10)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.01a)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.list({ a: 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.01b)");
			expected = `&cbuf<CompactFormal>[1, "1"]`; value = CompactFormal.list({ 1: 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.02)");
			expected = `&cbuf<CompactFormal>[2, "a", "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: 2 } })[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a"]`; value = CompactFormal.list({ a: {} })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a"]`; value = CompactFormal.list({ a: [] })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.05)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, "a", "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: {} } })[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.06)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, "a", "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: [] } })[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.07)");
			expected = `&cbuf<CompactFormal>[0, "a", "b", 0]`; value = CompactFormal.fuse(CompactFormal.list({ a: { b: [0] } })[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.08)");
			expected = `&cbuf<CompactFormal>[1, "a", 0, "b"]`; value = CompactFormal.fuse(CompactFormal.list({ a: [{ b: 1 }] })[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (02.09)");

			expected = `&cbuf<CompactFormal>[0, 0]`; value = CompactFormal.list([0])[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.01)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.list([1])[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.02)");
			expected = `&cbuf<CompactFormal>[1, 1]`; value = CompactFormal.list([void 0, 1])[1]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.03)");
			expected = `&cbuf<CompactFormal>[<AlephOne>, 0]`; value = CompactFormal.list([{}])[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.04)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0]`; value = CompactFormal.list([[]])[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.05)");
			expected = `&cbuf<CompactFormal>[<AlephNull>, 0, 0]`; value = CompactFormal.fuse(CompactFormal.list([[[]]])[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.06)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, 0]`; value = CompactFormal.fuse(CompactFormal.list([[[5]]])[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.07)");
			expected = `&cbuf<CompactFormal>[5, 0, 0, "a"]`; value = CompactFormal.fuse(CompactFormal.list([[{ a: 5 }]])[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (03.08)");

			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.list({ "": 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (04.01)");
			expected = `&cbuf<CompactFormal>[1, "", ""]`; value = CompactFormal.list({ ".": 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (04.02)");
			expected = `&cbuf<CompactFormal>[1, "#"]`; value = CompactFormal.list({ "#": 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (04.03)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\"]`; value = CompactFormal.list({ "\\": 1 })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (04.04)");

			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.fuse(CompactFormal.list({ "#0": 1 })[0]); CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.01)");
			expected = `&cbuf<CompactFormal>[1, 0, 0]`; value = CompactFormal.list({ "#0": [1] })[0]; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.02)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = 0; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.03)");
			expected = `&cbuf<CompactFormal>[1, 0]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "#0"; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.03)");
			expected = `&cbuf<CompactFormal>[1, 0, 0]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "#0#0"; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.04)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ""; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.08)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "\\0"; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.09)");
			expected = `&cbuf<CompactFormal>[1, "a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a"; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.10)");
			expected = `&cbuf<CompactFormal>[1, "", "a"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = ".a"; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.11)");
			expected = `&cbuf<CompactFormal>[1, "a", "b"]`; value = CompactFormal.create(); value.count = 2; value[0] = 1; value[1] = "a.b"; CompactFormal.spread(value); outcome = value; test("CompactFormal.spread - mutate (05.11)");
		}

		function test_CompactFormal_fuse_spread()
		{
			const f = value => CompactFormal.spread(CompactFormal.fuse(value, CompactFormal.create()));
			const t = (testName, value) => { if (Diagnostics.format(f(value)) !== Diagnostics.format(value)) fail(testName, Diagnostics.format(value), Diagnostics.format(f(value))) };

			t("CompactFormal.fuse/spread (01.01)", Unset);

			value = CompactFormal.create(1); value[0] = void 0;
			t("CompactFormal.fuse/spread (01.02)", value);

			value = CompactFormal.list([])[0];
			t("CompactFormal.fuse/spread (01.03)", value);

			value = CompactFormal.list({})[0];
			t("CompactFormal.fuse/spread (01.04)", value);


			value = CompactFormal.list({ a: 1 })[0];
			t("CompactFormal.fuse/spread (02.01)", value);

			value = CompactFormal.list({ a: { b: 2 } })[0];
			t("CompactFormal.fuse/spread (02.02)", value);

			value = CompactFormal.list({ a: [{ b: 1 }] })[0];
			t("CompactFormal.fuse/spread (02.03)", value);

			value = CompactFormal.list([[{ a: 5 }]])[0];
			t("CompactFormal.fuse/spread (02.04)", value);

			value = CompactFormal.list(".")[0];
			t("CompactFormal.fuse/spread (02.05)", value);

			value = CompactFormal.list("#")[0];
			t("CompactFormal.fuse/spread (02.06)", value);

			value = CompactFormal.list({ "\\": 1 })[0];
			t("CompactFormal.fuse/spread (02.07)", value);

			value = CompactFormal.list({ "\\0": 1 })[0];
			t("CompactFormal.fuse/spread (02.08)", value);

			value = CompactFormal.list({ "a\\.b": 1 })[0];
			t("CompactFormal.fuse/spread (02.09)", value);


			//	exceptions
			expected = `&cbuf<CompactFormal>[1, "\\\\0"]`;	//	in compact formal form, "\0" is equivalend to ""
			value = CompactFormal.list({ "": 1 })[0];
			outcome = f(value);
			test("CompactFormal.fuse/spread (99.01)");

			expected = `&cbuf<CompactFormal>[1, 0]`;		//	in compact formal form, "#0" is equivalend to 0
			value = CompactFormal.list({ "#0": 1 })[0];
			outcome = f(value);
			test("CompactFormal.fuse/spread (99.02)");
		}


		function test_List_uniform_copy() 
		{
			expected = `<Unset>`; value = Unset; outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.011)");
			expected = `<Unset>`; value = Lean.list(Unset); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.0111)"); 
			expected = `<Unset>`; value = Compact.list(Unset); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.0111a)"); 
			expected = `<Unset>`; value = Unset; outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.012)");
			expected = `<Unset>`; value = Lean.list(Unset); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.0121)"); 
			expected = `<Unset>`; value = Compact.list(Unset); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.0121a)"); 
			expected = `&cbuf<GraphCursorList>[]`; value = GraphCursor.List.create(); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Lean.list(Symbol("symbol")); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.031)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Compact.list(Symbol("symbol")); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.031a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Lean.list(Symbol("symbol")); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.032)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Compact.list(Symbol("symbol")); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.032a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>]]`; value = Lean.list({}); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.041)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>]]`; value = Compact.list({}); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.041a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = Lean.list({}); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.042)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = Compact.list({}); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.042a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>]]`; value = Lean.list([]); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.051)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>]]`; value = Compact.list([]); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.051a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>]]`; value = Lean.list([]); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.052)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>]]`; value = Compact.list([]); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.052a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"]]`; value = Lean.list({ a: 1 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.061)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"]]`; value = Compact.list({ a: 1 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.061a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"]]`; value = Lean.list({ a: 1 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.062)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"]]`; value = Compact.list({ a: 1 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.062a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"], &cbuf<Lean>[<AlephOne>, null, 2, "b"]]`; value = Lean.list({ a: 1, b: 2 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"], &cbuf<Lean>[<AlephOne>, null, 2, "b"]]`; value = Compact.list({ a: 1, b: 2 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.071a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = Lean.list({ a: 1, b: 2 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = Compact.list({ a: 1, b: 2 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (01.067a)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 0, ""]]`; value = Lean.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.001)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, ""]]`; value = Lean.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.003)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, "\\\\0"]]`; value = Lean.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.CompactFormal, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.004)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, ""]]`; value = Compact.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.101)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, "\\\\0"]]`; value = Compact.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.CompactFormal, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.102)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 0, ""]]`; value = Compact.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.103)");

			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, ""]]`; value = CompactFormal.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.CompactFormal, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.301)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, ""]]`; value = CompactFormal.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Compact, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.302)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 0, ""]]`; value = CompactFormal.list({ "": 0 }); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create()); test("GraphCursor.List.uniform - copy (02.303)");

			//	test `batchProcessingConfig`
			expected = `false`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneAll)); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - copy (03.002.01)");
			expected = `false`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneAll)); outcome = ref === value; test("GraphCursor.List.uniform - copy (03.002.01)");
			expected = `false`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneAll)); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - copy (03.002.03)");
			expected = `false`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneAll)); outcome = ref === value; test("GraphCursor.List.uniform - copy (03.002.04)");
			expected = `false`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneModified)); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - copy (03.002.05)");
			expected = `false`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneModified)); outcome = ref === value; test("GraphCursor.List.uniform - copy (03.002.06)");
			expected = `true`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneModified)); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - copy (03.002.07)");
			expected = `false`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.CloneModified)); outcome = ref === value; test("GraphCursor.List.uniform - copy (03.002.08)");
			expected = `true`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 0, new BatchProcessingConfig(InstanceHandling.CloneAll)); outcome = ref === value; test("GraphCursor.List.uniform - copy (03.002.09)");
			expected = `true`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 0, new BatchProcessingConfig(InstanceHandling.CloneModified)); outcome = ref === value; test("GraphCursor.List.uniform - copy (03.002.10)");

			//	use `offsetInTarget`
			expected = `<Unset>`; value = Unset; outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 1); test("GraphCursor.List.uniform - copy (04.01)");
			expected = `&cbuf<GraphCursorList>[]`; value = GraphCursor.List.create(); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 1); test("GraphCursor.List.uniform - copy (04.02)");
			expected = `&cbuf<GraphCursorList>[...(empty)]`; value = GraphCursor.List.create(); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(1), 1); test("GraphCursor.List.uniform - copy (04.03)");
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Lean>[<symbol>]]`; value = Lean.list(Symbol("symbol")); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(1), 1); test("GraphCursor.List.uniform - copy (04.05)");
			expected = `&cbuf<GraphCursorList>[...(empty), &cbuf<Lean>[<AlephOne>]]`; value = Lean.list({}); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(1), 1, new BatchProcessingConfig(InstanceHandling.CloneAll)); test("GraphCursor.List.uniform - copy (04.06)");
		}
		
		function test_List_uniform_mutate() 
		{
			expected = `<Unset>`; value = Unset; GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.011)");
			expected = `<Unset>`; value = Lean.list(Unset); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.0111)");
			expected = `<Unset>`; value = Compact.list(Unset); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.0111a)");
			expected = `<Unset>`; value = Unset; GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.012)");
			expected = `<Unset>`; value = Lean.list(Unset); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.0121)");
			expected = `<Unset>`; value = Compact.list(Unset); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.0121a)");
			expected = `&cbuf<GraphCursorList>[]`; value = GraphCursor.List.create(); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Lean.list(Symbol("symbol")); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.031)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>]]`; value = Compact.list(Symbol("symbol")); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.031a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Lean.list(Symbol("symbol")); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.032)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<symbol>]]`; value = Compact.list(Symbol("symbol")); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.032a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>]]`; value = Lean.list({}); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.041)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>]]`; value = Compact.list({}); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.041a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = Lean.list({}); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.042)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = Compact.list({}); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.042a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>]]`; value = Lean.list([]); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.051)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephNull>]]`; value = Compact.list([]); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.051a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>]]`; value = Lean.list([]); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.052)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephNull>]]`; value = Compact.list([]); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.052a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"]]`; value = Lean.list({ a: 1 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.061)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"]]`; value = Compact.list({ a: 1 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.061a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"]]`; value = Lean.list({ a: 1 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.062)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"]]`; value = Compact.list({ a: 1 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.062a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"], &cbuf<Lean>[<AlephOne>, null, 2, "b"]]`; value = Lean.list({ a: 1, b: 2 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.071)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 1, "a"], &cbuf<Lean>[<AlephOne>, null, 2, "b"]]`; value = Compact.list({ a: 1, b: 2 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (01.071a)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = Lean.list({ a: 1, b: 2 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.072)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = Compact.list({ a: 1, b: 2 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (01.067a)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 0, ""]]`; value = Lean.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (02.001)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, ""]]`; value = Lean.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (02.003)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, "\\\\0"]]`; value = Lean.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.CompactFormal); outcome = value; test("GraphCursor.List.uniform - mutate (02.004)");

			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, ""]]`; value = Compact.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (02.101)");
			//	the `"\\\\"` part of `expected` is escaped once by `Diagnostics.format` and once by the js string escaping rules and represents a single backslash.
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, "\\\\0"]]`; value = Compact.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.CompactFormal); outcome = value; test("GraphCursor.List.uniform - mutate (02.102)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 0, ""]]`; value = Compact.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (02.103)");

			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[0, ""]]`; value = CompactFormal.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.CompactFormal); outcome = value; test("GraphCursor.List.uniform - mutate (02.301)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[0, ""]]`; value = CompactFormal.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.Compact); outcome = value; test("GraphCursor.List.uniform - mutate (02.302)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>, null, 0, ""]]`; value = CompactFormal.list({ "": 0 }); GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = value; test("GraphCursor.List.uniform - mutate (02.303)");

			//	test `batchProcessingConfig`
			expected = `true`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - mutate (03.001)");
			expected = `true`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 0, new BatchProcessingConfig(InstanceHandling.MutateModified)); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - mutate (03.002.01)");
			expected = `true`; value = Compact.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 0, new BatchProcessingConfig(InstanceHandling.MutateModified)); outcome = ref === value; test("GraphCursor.List.uniform - mutate (03.002.02)");
			expected = `true`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 0, new BatchProcessingConfig(InstanceHandling.MutateModified)); outcome = ref[0] === value[0]; test("GraphCursor.List.uniform - mutate (03.002.04)");
			expected = `true`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 0, new BatchProcessingConfig(InstanceHandling.MutateModified)); outcome = ref === value; test("GraphCursor.List.uniform - mutate (03.002.05)");
			expected = `false`; value = Lean.list({}); ref = GraphCursor.List.uniform(value, GraphCursorType.Lean, GraphCursor.List.create(), 0, new BatchProcessingConfig(InstanceHandling.MutateModified)); outcome = ref === value; test("GraphCursor.List.uniform - mutate (03.002.06)");

			//	use `offsetInTarget`
			expected = `<Unset>`; value = Unset; outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 1); test("GraphCursor.List.uniform - mutate (04.01)");
			expected = `&cbuf<GraphCursorList>[]`; value = GraphCursor.List.create(); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 1); test("GraphCursor.List.uniform - mutate (04.02)");
			expected = `&cbuf<GraphCursorList>[...(empty), void 0]`; value = GraphCursor.List.create(1); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 1); test("GraphCursor.List.uniform - mutate (04.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<symbol>], &cbuf<Lean>@23]`; value = Lean.list(Symbol("symbol")); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 1); test("GraphCursor.List.uniform - mutate (04.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Lean>[<AlephOne>], &cbuf<Lean>@23]`; value = Lean.list({}); outcome = GraphCursor.List.uniform(value, GraphCursorType.Lean, null, 1, new BatchProcessingConfig(InstanceHandling.MutateModified)); test("GraphCursor.List.uniform - mutate (04.06)");
		}
	}

	//	Category: Unit test
	//	Function: Run unit tests for `GraphCursor` class methods and properties.
	static unitTest_GraphCursor_buildMergePlan(result)
	{
		let target, cursor, policy, expected, outcome;

		const format = o => Diagnostics.format(o, { format: v => Type.isInteger(v) ? Diagnostics.printNcode(v) : Diagnostics.Verbatim });
		const test = testName => expected !== format(outcome) ? result.push({ testName, expected, outcome: format(outcome) }) : void 0;

		buildMergePlan_CompactCursor();

		function buildMergePlan_CompactCursor()
		{
			const prepare = ({ t, c, v, p }) =>
			{
				target = t;

				cursor = Compact.create(c.length + 1);
				const vc = LiteralFabric.the.getVertexCardinality(v);
				cursor[0] = v === Unset ? Unset : vc === Cardinality.Zero ? v : vc;
				for (let length = c.length, i = 0; i < length; ++i) cursor[i + 1] = c[i];
				policy = 0;
				for (const key in p) policy |= MergeDecisions[key + p[key]];
			}

			//	(X, Y) - X describes the target graph; Y describes the merging cursor

			//	TODO: add test cases for DeleteArcInstruction, WhipePathInstruction

			//	unset cursor
			{
				//	(Unset, Unset)
				{
					expected = `&buf[]`; cursor = Unset; target = Unset; policy = MergeDecisions.VoidVoidOverwrite;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, Unset, VoidVoidOverwrite)");

					expected = `&buf[]`; cursor = Unset; target = Unset; policy = MergeDecisions.VoidVoidKeep;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, Unset, VoidVoidKeep)");

					expected = `&buf[<Fail>, 0x88CB47]`; cursor = Unset; target = Unset; policy = MergeDecisions.VoidVoidFail;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, Unset, VoidVoidFail)");
				}

				//	(atom, Unset)
				{
					expected = `&buf[<Delete>]`; cursor = Unset; target = 1; policy = MergeDecisions.AtomVoidOverwrite;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, Unset, AtomVoidOverwrite)");

					expected = `&buf[]`; cursor = Unset; target = 1; policy = MergeDecisions.AtomVoidKeep;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, Unset, AtomVoidKeep)");

					expected = `&buf[<Fail>, 0x8B5B8B]`; cursor = Unset; target = 1; policy = MergeDecisions.AtomVoidFail;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, Unset, AtomVoidFail)");
				}

				//	(countable, Unset)
				{
					expected = `&buf[<Delete>]`; cursor = Unset; target = []; policy = MergeDecisions.CountableVoidOverwrite;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, Unset, CountableVoidOverwrite)");

					expected = `&buf[]`; cursor = Unset; target = []; policy = MergeDecisions.CountableVoidKeep;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, Unset, CountableVoidKeep)");

					expected = `&buf[<Fail>, 0x10F757]`; cursor = Unset; target = []; policy = MergeDecisions.CountableVoidFail;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, Unset, CountableVoidFail)");
				}

				//	(uncountable, Unset)
				{
					expected = `&buf[<Delete>]`; cursor = Unset; target = {}; policy = MergeDecisions.UncountableVoidOverwrite;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, Unset, UncountableVoidOverwrite)");

					expected = `&buf[]`; cursor = Unset; target = {}; policy = MergeDecisions.UncountableVoidKeep;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, Unset, UncountableVoidKeep)");

					expected = `&buf[<Fail>, 0xFADC6B]`; cursor = Unset; target = {}; policy = MergeDecisions.UncountableVoidFail;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, Unset, UncountableVoidFail)");
				}
			}

			//	1-element cursor
			{
				//	(Unset, atom)
				{
					prepare({ t: Unset, c: [], v: 0, p: { VoidAtom: "Overwrite" } });
					expected = `&buf[<Set_Atom>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, atom, VoidAtomOverwrite)");

					prepare({ t: Unset, c: [], v: 0, p: { VoidAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, atom, VoidAtomKeep)");

					prepare({ t: Unset, c: [], v: 0, p: { VoidAtom: "Fail" } });
					expected = `&buf[<Fail>, 0x96E684]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, atom, VoidAtomFail)");
				}

				//	(atom, atom)
				{
					prepare({ t: 1, c: [], v: 0, p: { AtomAtom: "Overwrite" } });
					expected = `&buf[<Set_Atom>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, atom, AtomAtomOverwrite)");

					prepare({ t: 1, c: [], v: 0, p: { AtomAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, atom, AtomAtomKeep)");

					prepare({ t: 1, c: [], v: 0, p: { AtomAtom: "Fail" } });
					expected = `&buf[<Fail>, 0x72F4AC]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, atom, AtomAtomFail)");
				}

				//	(countable, atom)
				{
					prepare({ t: [], c: [], v: 0, p: { CountableAtom: "Overwrite" } });
					expected = `&buf[<Set_Atom>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, atom, CountableAtomOverwrite)");

					prepare({ t: [], c: [], v: 0, p: { CountableAtom: "Keep" } });
					expected = `&buf[]`; cursor = Compact.create(1); cursor[0] = 0; target = []; policy = MergeDecisions.CountableAtomKeep;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, atom, CountableAtomKeep)");

					prepare({ t: [], c: [], v: 0, p: { CountableAtom: "Fail" } });
					expected = `&buf[<Fail>, 0x17B0B5]`; cursor = Compact.create(1); cursor[0] = 0; target = []; policy = MergeDecisions.CountableAtomFail;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, atom, CountableAtomFail)");
				}

				//	(uncountable, atom)
				{
					prepare({ t: {}, c: [], v: 0, p: { UncountableAtom: "Overwrite" } });
					expected = `&buf[<Set_Atom>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, atom, UncountableAtomOverwrite)");

					prepare({ t: {}, c: [], v: 0, p: { UncountableAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, atom, UncountableAtomKeep)");

					prepare({ t: {}, c: [], v: 0, p: { UncountableAtom: "Fail" } });
					expected = `&buf[<Fail>, 0x26D0F2]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, atom, UncountableAtomFail)");
				}

				//	(Unset, countable)
				{
					prepare({ t: Unset, c: [], v: Cardinality.AlephNull, p: { VoidCountable: "Overwrite" } });
					expected = `&buf[<Set_NewCountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, countable, VoidCountableOverwrite)");

					prepare({ t: Unset, c: [], v: Cardinality.AlephNull, p: { VoidCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, countable, VoidCountableKeep)");

					prepare({ t: Unset, c: [], v: Cardinality.AlephNull, p: { VoidCountable: "Fail" } });
					expected = `&buf[<Fail>, 0x1BEC77]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, countable, VoidCountableFail)");
				}

				//	(atom, countable)
				{
					prepare({ t: 1, c: [], v: Cardinality.AlephNull, p: { AtomCountable: "Overwrite" } });
					expected = `&buf[<Set_NewCountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, countable, AtomCountableOverwrite)");

					prepare({ t: 1, c: [], v: Cardinality.AlephNull, p: { AtomCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, countable, AtomCountableKeep)");

					prepare({ t: 1, c: [], v: Cardinality.AlephNull, p: { AtomCountable: "Fail" } });
					expected = `&buf[<Fail>, 0xD81CE3]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, countable, AtomCountableFail)");
				}

				//	(countable, countable)
				{
					prepare({ t: [], c: [], v: Cardinality.AlephNull, p: { CountableCountable: "Overwrite" } });
					expected = `&buf[<Set_NewCountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, countable, CountableCountableOverwrite)");

					prepare({ t: [], c: [], v: Cardinality.AlephNull, p: { CountableCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, countable, CountableCountableKeep)");

					prepare({ t: [], c: [], v: Cardinality.AlephNull, p: { CountableCountable: "Fail" } });
					expected = `&buf[<Fail>, 0x3345A2]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, countable, CountableCountableFail)");
				}

				//	(uncountable, countable)
				{
					prepare({ t: {}, c: [], v: Cardinality.AlephNull, p: { UncountableCountable: "Overwrite" } });
					expected = `&buf[<Set_NewCountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, countable, UncountableCountableOverwrite)");

					prepare({ t: {}, c: [], v: Cardinality.AlephNull, p: { UncountableCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, countable, UncountableCountableKeep)");

					prepare({ t: {}, c: [], v: Cardinality.AlephNull, p: { UncountableCountable: "Fail" } });
					expected = `&buf[<Fail>, 0xDAE0DD]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, countable, UncountableCountableFail)");
				}

				//	(Unset, uncountable)
				{
					prepare({ t: Unset, c: [], v: Cardinality.AlephOne, p: { VoidUncountable: "Overwrite" } });
					expected = `&buf[<Set_NewUncountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, uncountable, VoidUncountableOverwrite)");

					prepare({ t: Unset, c: [], v: Cardinality.AlephOne, p: { VoidUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, uncountable, VoidUncountableKeep)");

					prepare({ t: Unset, c: [], v: Cardinality.AlephOne, p: { VoidUncountable: "Fail" } });
					expected = `&buf[<Fail>, 0xA538D2]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(Unset, uncountable, VoidUncountableFail)");
				}

				//	(atom, uncountable)
				{
					prepare({ t: 1, c: [], v: Cardinality.AlephOne, p: { AtomUncountable: "Overwrite" } });
					expected = `&buf[<Set_NewUncountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, uncountable, AtomUncountableOverwrite)");

					prepare({ t: 1, c: [], v: Cardinality.AlephOne, p: { AtomUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, uncountable, AtomUncountableKeep)");

					prepare({ t: 1, c: [], v: Cardinality.AlephOne, p: { AtomUncountable: "Fail" } });
					expected = `&buf[<Fail>, 0x9FD6AD]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(atom, uncountable, AtomUncountableFail)");
				}

				//	(countable, uncountable)
				{
					prepare({ t: [], c: [], v: Cardinality.AlephOne, p: { CountableUncountable: "Overwrite" } });
					expected = `&buf[<Set_NewUncountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, uncountable, CountableUncountableOverwrite)");

					prepare({ t: [], c: [], v: Cardinality.AlephOne, p: { CountableUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, uncountable, CountableUncountableKeep)");

					prepare({ t: [], c: [], v: Cardinality.AlephOne, p: { CountableUncountable: "Fail" } });
					expected = `&buf[<Fail>, 0xBCB8F2]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(countable, uncountable, CountableUncountableFail)");
				}

				//	(uncountable, uncountable)
				{
					prepare({ t: {}, c: [], v: Cardinality.AlephOne, p: { UncountableUncountable: "Overwrite" } });
					expected = `&buf[<Set_NewUncountable>]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, uncountable, UncountableUncountableOverwrite)");

					prepare({ t: {}, c: [], v: Cardinality.AlephOne, p: { UncountableUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, uncountable, UncountableUncountableKeep)");

					prepare({ t: {}, c: [], v: Cardinality.AlephOne, p: { UncountableUncountable: "Fail" } });
					expected = `&buf[<Fail>, 0x1058AC]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor(uncountable, uncountable, UncountableUncountableFail)");
				}
			}

			//	multi-element cursor - generic
			{
				{
					prepare({ t: { a: { z1: [], z2: { p: "m" } }, b: [{}, []] }, c: ["a", "z3"], v: 5, p: { UncountableUncountable: "Keep", VoidAtom: "Overwrite" } });
					//	EXPLANATION: | keep root |   keep `a: {}`,  | add `z3: 5` as prop of `a: {}` |
					//		`&buf[   |  <Noop>,  |   <Noop>, "a",   |     <Set_Atom>, "z3", 0x5      |  ]`;
					expected = `&buf[<Noop>, <Noop>, "a", <Set_Atom>, "z3", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - generic 1");
				}
				{
					prepare({ t: { a: { z1: [], z2: { p: "m" } }, b: [{}, []] }, c: ["a", "z2", "p"], v: 5, p: { UncountableUncountable: "Keep", AtomAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Noop>, "z2", <Set_Atom>, "p", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - generic 2");
				}
				{
					prepare({ t: { a: { z1: [], z2: { p: "m" } }, b: [{}, []] }, c: ["a", "z2", 1], v: 5, p: { UncountableUncountable: "Keep", UncountableCountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewCountable>, "z2", <Set_Atom>, 0x1, 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - generic 3");
				}
			}

			//	multi-element cursor - code cases
			{
				//	mec-*-AlephNull-*
				{
					//	mec-Zero-AlephNull-AtomCountableOverwrite
					prepare({ t: { a: 1 }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", AtomCountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewCountable>, "a", <Set_Atom>, 0x0, 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephNull-AtomCountableOverwrite");

					//	mec-Zero-AlephNull-AtomCountableKeep
					prepare({ t: { a: 1 }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", AtomCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephNull-AtomCountableKeep");

					//	mec-Zero-AlephNull-AtomCountableFail
					prepare({ t: { a: 1 }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", AtomCountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x7F7500]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephNull-AtomCountableFail");
				}
				{
					//	mec-AlephNull-AlephNull-CountableCountableOverwrite
					prepare({ t: { a: [] }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", CountableCountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewCountable>, "a", <Set_Atom>, 0x0, 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephNull-CountableCountableOverwrite");

					//	mec-AlephNull-AlephNull-CountableCountableKeep
					prepare({ t: { a: [] }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_Atom>, 0x0, 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephNull-CountableCountableKeep");

					//	mec-AlephNull-AlephNull-CountableCountableFail
					prepare({ t: { a: [] }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", CountableCountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x20CCAD]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephNull-CountableCountableFail");
				}
				{
					//	mec-AlephOne-AlephNull-UncountableCountableOverwrite
					prepare({ t: { a: {} }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", UncountableCountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewCountable>, "a", <Set_Atom>, 0x0, 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephNull-UncountableCountableOverwrite");

					//	mec-AlephOne-AlephNull-UncountableCountableKeep
					prepare({ t: { a: {} }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", UncountableCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephNull-UncountableCountableKeep");

					//	mec-AlephOne-AlephNull-UncountableCountableFail
					prepare({ t: { a: {} }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", UncountableCountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x3D3DAD]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephNull-UncountableCountableFail");
				}

				//	mec-*-AlephOne-*
				{
					//	mec-Zero-AlephOne-AtomUncountableOverwrite
					prepare({ t: [1], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", AtomUncountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewUncountable>, 0x0, <Set_Atom>, "b", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephOne-AtomUncountableOverwrite");

					//	mec-Zero-AlephOne-AtomUncountableKeep
					prepare({ t: [1], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", AtomUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephOne-AtomUncountableKeep");

					//	mec-Zero-AlephOne-AtomUncountableFail
					prepare({ t: [1], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", AtomUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, 0x0, 0xA14B17]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephOne-AtomUncountableFail");
				}
				{
					//	mec-AlephOne-AlephOne-CountableUncountableOverwrite
					prepare({ t: [[]], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", CountableUncountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewUncountable>, 0x0, <Set_Atom>, "b", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-CountableUncountableOverwrite");

					//	mec-AlephOne-AlephOne-CountableUncountableKeep
					prepare({ t: [[]], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", CountableUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-CountableUncountableKeep");

					//	mec-AlephOne-AlephOne-CountableUncountableFail
					prepare({ t: [[]], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", CountableUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, 0x0, 0xE93976]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-CountableUncountableFail");
				}
				{
					//	mec-AlephOne-AlephOne-UncountableUncountableOverwrite
					prepare({ t: [{}], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", UncountableUncountable: "Overwrite", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewUncountable>, 0x0, <Set_Atom>, "b", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-UncountableUncountableOverwrite");

					//	mec-AlephOne-AlephOne-UncountableUncountableKeep
					prepare({ t: [{}], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", UncountableUncountable: "Keep", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, 0x0, <Set_Atom>, "b", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-UncountableUncountableKeep");

					//	mec-AlephOne-AlephOne-UncountableUncountableFail
					prepare({ t: [{}], c: [0, "b"], v: 5, p: { CountableCountable: "Keep", UncountableUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, 0x0, 0xC58FD7]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-UncountableUncountableFail");
				}

				//	mecex-*-AlephNull-* (exhaust target)
				{
					//	mecex-Void-AlephNull-VoidCountableOverwrite
					prepare({ t: { a: [] }, c: ["a", 0, 0], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidCountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewCountable>, 0x0, <Set_NewCountable>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephNull-VoidCountableOverwrite");

					//	mecex-Void-AlephNull-VoidCountableKeep
					prepare({ t: { a: [] }, c: ["a", 0, 0], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephNull-VoidCountableKeep");

					//	mecex-Void-AlephNull-VoidCountableFail
					prepare({ t: { a: [] }, c: ["a", 0, 0], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidCountable: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Fail>, 0x0, 0x2938C5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephNull-VoidCountableFail");
				}
				//	mecex-*-AlephOne-* (exhaust target)
				{
					//	mecex-Void-AlephOne-VoidUncountableOverwrite
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: {} , p: { UncountableUncountable: "Keep", VoidUncountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewUncountable>, "b", <Set_NewUncountable>, "c"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephOne-VoidUncountableOverwrite");

					//	mecex-Void-AlephOne-VoidUncountableKeep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: {}, p: { UncountableUncountable: "Keep", VoidUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephOne-VoidUncountableKeep");

					//	mecex-Void-AlephOne-VoidUncountableFail
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: {}, p: { UncountableUncountable: "Keep", VoidUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Fail>, "b", 0xF9829F]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephOne-VoidUncountableFail");
				}

				//	mec-*-Zero-*-head
				{
					//	mec-Zero-Zero-AtomAtomOverwrite-head
					prepare({ t: { a: 1 }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", AtomAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_Atom>, "a", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-Zero-AtomAtomOverwrite-head");

					//	mec-Zero-Zero-AtomAtomKeep-head
					prepare({ t: { a: 1 }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", AtomAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-Zero-AtomAtomKeep-head");

					//	mec-Zero-Zero-AtomAtomFail-head
					prepare({ t: { a: 1 }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", AtomAtom: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xD05CC4]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-Zero-AtomAtomFail-head");
				}
				{
					//	mec-AlephNull-Zero-CountableAtomOverwrite-head
					prepare({ t: { a: [] }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", CountableAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_Atom>, "a", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Zero-CountableAtomOverwrite-head");

					//	mec-AlephNull-Zero-CountableAtomKeep-head
					prepare({ t: { a: [] }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", CountableAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Zero-CountableAtomKeep-head");

					//	mec-AlephNull-Zero-CountableAtomFail-head
					prepare({ t: { a: [] }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", CountableAtom: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x4FFF2A]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Zero-CountableAtomFail-head");
				}
				{
					//	mec-AlephOne-Zero-UncountableAtomOverwrite-head
					prepare({ t: { a: {} }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", UncountableAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_Atom>, "a", 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Zero-UncountableAtomOverwrite-head");

					//	mec-AlephOne-Zero-UncountableAtomKeep-head
					prepare({ t: { a: {} }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", UncountableAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Zero-UncountableAtomKeep-head");

					//	mec-AlephOne-Zero-UncountableAtomFail-head
					prepare({ t: { a: {} }, c: ["a"], v: 5, p: { UncountableUncountable: "Keep", UncountableAtom: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xFB67D0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Zero-UncountableAtomFail-head");
				}

				//	mec-*-AlephNull-*-head
				{
					//	mec-Zero-AlephNull-AtomCountableOverwrite-head
					prepare({ t: { a: 1 }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", AtomCountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewCountable>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephNull-AtomCountableOverwrite-head");

					//	mec-Zero-AlephNull-AtomCountableKeep-head
					prepare({ t: { a: 1 }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", AtomCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephNull-AtomCountableKeep-head");

					//	mec-Zero-AlephNull-AtomCountableFail-head
					prepare({ t: { a: 1 }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", AtomCountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x2969E9]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephNull-AtomCountableFail-head");
				}
				{
					//	mec-AlephNull-AlephNull-CountableCountableOverwrite-head
					prepare({ t: { a: [] }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewCountable>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephNull-CountableCountableOverwrite-head");

					//	mec-AlephNull-AlephNull-CountableCountableKeep-head
					prepare({ t: { a: [] }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephNull-CountableCountableKeep-head");

					//	mec-AlephNull-AlephNull-CountableCountableFail-head
					prepare({ t: { a: [] }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xEDCD07]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephNull-CountableCountableFail-head");
				}
				{
					//	mec-AlephOne-AlephNull-UncountableCountableOverwrite-head
					prepare({ t: { a: {} }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", UncountableCountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewCountable>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephNull-UncountableCountableOverwrite-head");

					//	mec-AlephOne-AlephNull-UncountableCountableKeep-head
					prepare({ t: { a: {} }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", UncountableCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephNull-UncountableCountableKeep-head");

					//	mec-AlephOne-AlephNull-UncountableCountableFail-head
					prepare({ t: { a: {} }, c: ["a"], v: [], p: { UncountableUncountable: "Keep", UncountableCountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xEFEBF2]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephNull-UncountableCountableFail-head");
				}

				//	mec-*-AlephOne-*-head
				{
					//	mec-Zero-AlephOne-AtomUncountableOverwrite-head
					prepare({ t: { a: 1 }, c: ["a"], v: {} , p: { UncountableUncountable: "Keep", AtomUncountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewUncountable>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephOne-AtomUncountableOverwrite-head");

					//	mec-Zero-AlephOne-AtomUncountableKeep-head
					prepare({ t: { a: 1 }, c: ["a"], v: {}, p: { UncountableUncountable: "Keep", AtomUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephOne-AtomUncountableKeep-head");

					//	mec-Zero-AlephOne-AtomUncountableFail-head
					prepare({ t: { a: 1 }, c: ["a"], v: {}, p: { UncountableUncountable: "Keep", AtomUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x4818BF]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-AlephOne-AtomUncountableFail-head");
				}
				{
					//	mec-AlephNull-AlephOne-CountableUncountableOverwrite-head
					prepare({ t: { a: [] }, c: ["a"], v: {}, p: { UncountableUncountable: "Keep", CountableUncountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewUncountable>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephOne-CountableUncountableOverwrite-head");

					//	mec-AlephNull-AlephOne-CountableUncountableKeep-head
					prepare({ t: { a: [] }, c: ["a"], v: {}, p: { UncountableUncountable: "Keep", CountableUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephOne-CountableUncountableKeep-head");

					//	mec-AlephNull-AlephOne-CountableUncountableFail-head
					prepare({ t: { a: [] }, c: ["a"], v: {}, p: { UncountableUncountable: "Keep", CountableUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xABA3B1]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-AlephOne-CountableUncountableFail-head");
				}
				{
					//	mec-AlephOne-AlephOne-UncountableUncountableOverwrite-head
					prepare({ t: [{}], c: [0], v: {}, p: { CountableCountable: "Keep", UncountableUncountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Set_NewUncountable>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-UncountableUncountableOverwrite-head");

					//	mec-AlephOne-AlephOne-UncountableUncountableKeep-head
					prepare({ t: [{}], c: [0], v: {}, p: { CountableCountable: "Keep", UncountableUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-UncountableUncountableKeep-head");

					//	mec-AlephOne-AlephOne-UncountableUncountableFail-head
					prepare({ t: [{}], c: [0], v: {}, p: { CountableCountable: "Keep", UncountableUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, 0x0, 0xA6A14C]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-AlephOne-UncountableUncountableFail-head");
				}

				//	mec-*-Delete-*-head
				{
					//	mec-Zero-Delete-AtomVoidOverwrite-head
					prepare({ t: { a: 1 }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", AtomVoid: "Overwrite" } });
					expected = `&buf[<Noop>, <Delete>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-Delete-AtomVoidOverwrite-head");

					//	mec-Zero-Delete-AtomVoidKeep-head
					prepare({ t: { a: 1 }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", AtomVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-Delete-AtomVoidKeep-head");

					//	mec-Zero-Delete-AtomVoidFail-head
					prepare({ t: { a: 1 }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", AtomVoid: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xC99182]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-Zero-Delete-AtomVoidFail-head");
				}
				{
					//	mec-AlephNull-Delete-CountableVoidOverwrite-head
					prepare({ t: { a: [] }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", CountableVoid: "Overwrite" } });
					expected = `&buf[<Noop>, <Delete>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Delete-CountableVoidOverwrite-head");

					//	mec-AlephNull-Delete-CountableVoidKeep-head
					prepare({ t: { a: [] }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", CountableVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Delete-CountableVoidKeep-head");

					//	mec-AlephNull-Delete-CountableVoidFail-head
					prepare({ t: { a: [] }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", CountableVoid: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x16E957]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Delete-CountableVoidFail-head");
				}
				{
					//	mec-AlephOne-Delete-UncountableVoidOverwrite-head
					prepare({ t: { a: {} }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", UncountableVoid: "Overwrite" } });
					expected = `&buf[<Noop>, <Delete>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Delete-UncountableVoidOverwrite-head");

					//	mec-AlephOne-Delete-UncountableVoidKeep-head
					prepare({ t: { a: {} }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", UncountableVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Delete-UncountableVoidKeep-head");

					//	mec-AlephOne-Delete-UncountableVoidFail-head
					prepare({ t: { a: {} }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", UncountableVoid: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xE2C614]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Delete-UncountableVoidFail-head");
				}
				{
					//	mec-AlephNull-Delete-CountableVoidOverwrite-head-1
					prepare({ t: { a: [3] }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", CountableVoid: "Overwrite" } });
					expected = `&buf[<Noop>, <Delete>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Delete-CountableVoidOverwrite-head-1");

					//	mec-AlephNull-Delete-CountableVoidKeep-head-1
					prepare({ t: { a: [3] }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", CountableVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Delete-CountableVoidKeep-head-1");

					//	mec-AlephNull-Delete-CountableVoidFail-head-1
					prepare({ t: { a: [3] }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", CountableVoid: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0x16E957]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephNull-Delete-CountableVoidFail-head-1");
				}
				{
					//	mec-AlephOne-Delete-UncountableVoidOverwrite-head-1
					prepare({ t: { a: { b: 3 } }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", UncountableVoid: "Overwrite" } });
					expected = `&buf[<Noop>, <Delete>, "a"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Delete-UncountableVoidOverwrite-head-1");

					//	mec-AlephOne-Delete-UncountableVoidKeep-head-1
					prepare({ t: { a: { b: 3 } }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", UncountableVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Delete-UncountableVoidKeep-head-1");

					//	mec-AlephOne-Delete-UncountableVoidFail-head-1
					prepare({ t: { a: { b: 3 } }, c: ["a"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", UncountableVoid: "Fail" } });
					expected = `&buf[<Noop>, <Fail>, "a", 0xE2C614]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mec-AlephOne-Delete-UncountableVoidFail-head-1");
				}

				//	mecex-*-Zero-*-head (exhaust target)
				{
					//	mecex-Void-Zero-VoidAtomOverwrite-head
					prepare({ t: { a: [] }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidAtom: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_Atom>, 0x0, 0x5]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Zero-VoidAtomOverwrite-head");

					//	mecex-Void-Zero-VoidAtomKeep-head
					prepare({ t: { a: [] }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidAtom: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Zero-VoidAtomKeep-head");

					//	mecex-Void-Zero-VoidAtomFail-head
					prepare({ t: { a: [] }, c: ["a", 0], v: 5, p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidAtom: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Fail>, 0x0, 0x638C90]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Zero-VoidAtomFail-head");
				}
				//	mecex-*-AlephNull-*-head (exhaust target)
				{
					//	mecex-Void-AlephNull-VoidCountableOverwrite-head
					prepare({ t: { a: [] }, c: ["a", 0], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidCountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewCountable>, 0x0]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephNull-VoidCountableOverwrite-head");

					//	mecex-Void-AlephNull-VoidCountableKeep-head
					prepare({ t: { a: [] }, c: ["a", 0], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidCountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephNull-VoidCountableKeep-head");

					//	mecex-Void-AlephNull-VoidCountableFail-head
					prepare({ t: { a: [] }, c: ["a", 0], v: [], p: { UncountableUncountable: "Keep", CountableCountable: "Keep", VoidCountable: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Fail>, 0x0, 0xFAA97F]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephNull-VoidCountableFail-head");
				}
				//	mecex-*-AlephOne-*-head (exhaust target)
				{
					//	mecex-Void-AlephOne-VoidUncountableOverwrite-head
					prepare({ t: { a: {} }, c: ["a", "b"], v: {}, p: { UncountableUncountable: "Keep", VoidUncountable: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewUncountable>, "b"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephOne-VoidUncountableOverwrite-head");

					//	mecex-Void-AlephOne-VoidUncountableKeep-head
					prepare({ t: { a: {} }, c: ["a", "b"], v: {}, p: { UncountableUncountable: "Keep", VoidUncountable: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephOne-VoidUncountableKeep-head");

					//	mecex-Void-AlephOne-VoidUncountableFail-head
					prepare({ t: { a: {} }, c: ["a", "b"], v: {}, p: { UncountableUncountable: "Keep", VoidUncountable: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Fail>, "b", 0x39DDD3]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-AlephOne-VoidUncountableFail-head");
				}
				//	mecex-*-Delete-*-head (exhaust target)
				{
					//	mecex-Void-Delete-VoidVoidOverwrite-head
					prepare({ t: { a: {} }, c: ["a", "b"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidVoid: "Overwrite" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidOverwrite-head");

					//	mecex-Void-Delete-VoidVoidKeep-head
					prepare({ t: { a: {} }, c: ["a", "b"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidKeep-head");

					//	mecex-Void-Delete-VoidVoidFail-head
					prepare({ t: { a: {} }, c: ["a", "b"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidVoid: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Fail>, "b", 0x8CC134]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidFail-head");
				}
				//	mecex-*-Delete-*-head-deep (exhaust target)
				{
					//	mecex-Void-Delete-VoidVoidOverwrite-VoidUncountableKeep-head-deep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidUncountable: "Keep", VoidVoid: "Overwrite" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidOverwrite-VoidUncountableKeep-head-deep");

					//	mecex-Void-Delete-VoidVoidOverwrite-VoidUncountableOverwrite-head-deep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidUncountable: "Overwrite", VoidVoid: "Overwrite" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewUncountable>, "b"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidOverwrite-VoidUncountableOverwrite-head-deep");

					//	mecex-Void-Delete-VoidVoidKeep-VoidUncountableKeep-head-deep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidUncountable: "Keep", VoidVoid: "Keep" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidKeep-VoidUncountableKeep-head-deep");

					//	mecex-Void-Delete-VoidVoidKeep-VoidUncountableOverwrite-head-deep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidUncountable: "Overwrite", VoidVoid: "Keep" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewUncountable>, "b"]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidKeep-VoidUncountableOverwrite-head-deep");

					//	mecex-Void-Delete-VoidVoidFail-VoidUncountableKeep-head-deep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidUncountable: "Keep", VoidVoid: "Fail" } });
					expected = `&buf[]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidFail-VoidUncountableKeep-head-deep");

					//	mecex-Void-Delete-VoidVoidFail-VoidUncountableOverwrite-head-deep
					prepare({ t: { a: {} }, c: ["a", "b", "c"], v: MergeInstruction.Delete, p: { UncountableUncountable: "Keep", VoidUncountable: "Overwrite", VoidVoid: "Fail" } });
					expected = `&buf[<Noop>, <Noop>, "a", <Set_NewUncountable>, "b", <Fail>, "c", 0x8CC134]`;
					outcome = Compact.buildMergePlan(cursor, target, policy);
					test("buildMergePlan_CompactCursor - mecex-Void-Delete-VoidVoidFail-VoidUncountableOverwrite-head-deep");
				}
			}
		}
	}

	//	Category: Unit test
	//	Function: Run unit tests for `GraphCursor` list-related class methods and properties.
	static unitTest_GraphCursorLists(result)
	{
		let value, target, gct, expected, outcome;

		const fail = testName => result.push({ testName, expected, outcome });
		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;

		test_Compact_List_fuse();
		test_Compact_List_rotate();
		test_Compact_List_merge();
		test_CompactFormal_List_fuse();
		test_CompactFormal_List_spread();

		function test_Compact_List_fuse()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.01)");
			expected = `&cbuf<GraphCursorList>[]`; value = cbuf(GraphCursorList); outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1]]`; value = Compact.list(1); outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>["a"]]`; value = Compact.list("a"); outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>]]`; value = Compact.list({}); outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"], &cbuf<CompactFormal>[2, "b"]]`; value = Compact.list({ a: 1, b: 2 }); outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a.b#0"], <Unset>, &cbuf<CompactFormal>["d", "c#0"]]`; value = Compact.list({ a: { b: [1] }, c: ["d"] }); List.insert(value, 1, Unset); outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a\\\\.a.b#0"], &cbuf<CompactFormal>["d", "c#0"]]`; value = Compact.list({ a: { b: [1] }, c: ["d"] }); value[0][1] = "a.a"; outcome = Compact.List.fuse(value); test("Compact.List.fuse - mutate (01.08)");
		}

		function test_Compact_List_rotate()
		{
			expected = `<Unset>`; value = Unset; outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.01)");
			expected = `&cbuf<GraphCursorList>[]`; value = cbuf(GraphCursorList); outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1]]`; value = Compact.list(1); outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>["a"]]`; value = Compact.list("a"); outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[<AlephOne>]]`; value = Compact.list({}); outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a"], &cbuf<Compact>[2, "b"]]`; value = Compact.list({ a: 1, b: 2 }); outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0, "a", "b"], <Unset>, &cbuf<Compact>["d", 0, "c"]]`; value = Compact.list({ a: { b: [1] }, c: ["d"] }); List.insert(value, 1, Unset); outcome = Compact.List.rotate(value, 1); test("Compact.List.rotate - mutate (01.07)");
		}

		function test_Compact_List_merge()
		{
			expected = `<Unset>`; value = Unset; target = Unset; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.01)");
			expected = `<Unset>`; value = cbuf(GraphCursorList); target = Unset; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.02)");
			expected = `1`; value = Compact.list(1); target = Unset; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.03)");
			expected = `1`; value = Compact.list(1); target = {}; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.04)");
			expected = `[2]`; value = Compact.list([2]); target = [1]; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.05)");
			expected = `[2, 3, 9]`; value = Compact.list([2, 3]); target = [1, 1, 9]; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.06)");
			expected = `[...(empty), 3, 9]`; value = Compact.list([2, 3]); value[0][0] = MergeInstruction.Delete; target = [1, 1, 9]; outcome = Compact.List.merge(value, target); test("Compact.List.merge (01.07)");

			gct = new GraphComposerTransaction();
			expected = `[1, 1, 9]`; value = Compact.list([2, 3]); value[0][0] = MergeInstruction.Delete; target = [1, 1, 9]; outcome = Compact.List.merge(value, target, gct); gct.rollback(); test("Compact.List.merge (01.08)");
		}

		function test_CompactFormal_List_fuse()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.01)");
			expected = `&cbuf<GraphCursorList>[]`; value = cbuf(GraphCursorList); outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1]]`; value = CompactFormal.list(1); outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>["a"]]`; value = CompactFormal.list("a"); outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>]]`; value = CompactFormal.list({}); outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"], &cbuf<CompactFormal>[2, "b"]]`; value = CompactFormal.list({ a: 1, b: 2 }); outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a.b#0"], <Unset>, &cbuf<CompactFormal>["d", "c#0"]]`; value = CompactFormal.list({ a: { b: [1] }, c: ["d"] }); List.insert(value, 1, Unset); outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a.a.b#0"], &cbuf<CompactFormal>["d", "c#0"]]`; value = CompactFormal.list({ a: { b: [1] }, c: ["d"] }); value[0][1] = "a.a"; outcome = CompactFormal.List.fuse(value); test("CompactFormal.List.fuse - mutate (01.08)");
		}

		function test_CompactFormal_List_spread()
		{
			expected = `<Unset>`; value = Unset; outcome = CompactFormal.List.spread(value); test("CompactFormal.List.spread - mutate (01.01)");
			expected = `&cbuf<GraphCursorList>[]`; value = cbuf(GraphCursorList); outcome = CompactFormal.List.spread(value); test("CompactFormal.List.spread - mutate (01.02)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1]]`; value = CompactFormal.list(1); outcome = CompactFormal.List.spread(CompactFormal.List.fuse(value)); test("CompactFormal.List.spread - mutate (01.03)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>["a"]]`; value = CompactFormal.list("a"); outcome = CompactFormal.List.spread(CompactFormal.List.fuse(value)); test("CompactFormal.List.spread - mutate (01.04)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[<AlephOne>]]`; value = CompactFormal.list({}); outcome = CompactFormal.List.spread(CompactFormal.List.fuse(value)); test("CompactFormal.List.spread - mutate (01.05)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"], &cbuf<CompactFormal>[2, "b"]]`; value = CompactFormal.list({ a: 1, b: 2 }); outcome = CompactFormal.List.spread(CompactFormal.List.fuse(value)); test("CompactFormal.List.spread - mutate (01.06)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", "b", 0], <Unset>, &cbuf<CompactFormal>["d", "c", 0]]`; value = CompactFormal.list({ a: { b: [1] }, c: ["d"] }); List.insert(value, 1, Unset); outcome = CompactFormal.List.spread(CompactFormal.List.fuse(value)); test("CompactFormal.List.spread - mutate (01.07)");
			expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", "a", "b", 0], &cbuf<CompactFormal>["d", "c", 0]]`; value = CompactFormal.list({ a: { b: [1] }, c: ["d"] }); value[0][1] = "a.a"; outcome = CompactFormal.List.spread(CompactFormal.List.fuse(value)); test("CompactFormal.List.spread - mutate (01.08)");
		}
	}

	//	Category: Unit test
	//	Function: Run unit tests for `GraphComposer` class methods and properties.
	static unitTest_GraphComposer(result)
	{
		let target, mergePlan, gct, expected, outcome;

		const format = o => Diagnostics.format(o, { format: v => Type.isInteger(v) ? Diagnostics.printNcode(v) : Diagnostics.Verbatim });
		const test = testName => expected !== format(outcome) ? result.push({ testName, expected, outcome: format(outcome) }) : void 0;
		const testGCT = testName => expected !== outcome ? result.push({ testName, expected, outcome: outcome }) : void 0;

		test_executeMergePlan();

		function test_executeMergePlan()
		{
			//	root

			//	GraphComposer.executeMergePlan 100.01
			{
				expected = `<Unset>`; target = Unset; mergePlan = Buf.fromArray([]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.01");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.01.GCT.101");

					expected = `<Unset>`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.01.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.01.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.01.GCT.201");

					expected = `<Unset>`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.01.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.01.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.02
			{
				expected = `<Unset>`; target = Unset; mergePlan = Buf.fromArray([MergeAction.Noop]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.02");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.02.GCT.101");

					expected = `<Unset>`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.02.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.02.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.02.GCT.201");

					expected = `<Unset>`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.02.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.02.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.03
			{
				expected = `[]`; target = Unset; mergePlan = Buf.fromArray([MergeAction.Set_NewCountable]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.03");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset>, "targetRoot": [] }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.03.GCT.101");

					expected = `[]`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.03.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.03.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset>, "targetRoot": [] }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.03.GCT.201");

					expected = `<Unset>`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.03.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.03.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.04
			{
				expected = `{}`; target = Unset; mergePlan = Buf.fromArray([MergeAction.Set_NewUncountable]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.04");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset>, "targetRoot": {} }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.04.GCT.101");

					expected = `{}`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.04.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.04.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset>, "targetRoot": {} }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.04.GCT.201");

					expected = `<Unset>`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.04.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.04.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.06
			{
				expected = `0x5`; target = Unset; mergePlan = Buf.fromArray([MergeAction.Set_Atom, 5]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.06");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset>, "targetRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.06.GCT.101");

					expected = `0x5`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.06.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.06.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset>, "targetRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.06.GCT.201");

					expected = `<Unset>`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.06.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.06.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.07
			{
				expected = `<Unset>`; target = 5; mergePlan = Buf.fromArray([MergeAction.Delete]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.07");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.101");

					expected = `<Unset>`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.07.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.201");

					expected = `0x5`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.07.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.08 (fail)
			{
				expected = `&Error/MergeConflictException{ "mergePlan": &buf[<Fail>, 0x0], "message": "0xA9737F Merge conflict.", "code": "0xA9737F" }`; target = Unset;
				mergePlan = Buf.fromArray([MergeAction.Fail, 0x0]);
				try { outcome = GraphComposer.executeMergePlan(mergePlan, target); } catch (ex) { outcome = ex; }
				test("GraphComposer.executeMergePlan 100.08");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.08.GCT.101");

						expected = `<Unset>`;
						outcome = gct.commit();
						test("GraphComposer.executeMergePlan 100.08.GCT.102");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.08.GCT.103");
					}
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.08.GCT.201");

						expected = `<Unset>`;
						outcome = gct.rollback();
						test("GraphComposer.executeMergePlan 100.08.GCT.202");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.08.GCT.203");
					}
				}
			}

			//	GraphComposer.executeMergePlan 100.09 (fail)
			{
				expected = `&Error/MergeConflictException{ "mergePlan": &buf[<Fail>, 0x1], "message": "0x1 Merge conflict.", "code": "0x1" }`; target = Unset;
				mergePlan = Buf.fromArray([MergeAction.Fail, 0x1]);
				try { outcome = GraphComposer.executeMergePlan(mergePlan, target); } catch (ex) { outcome = ex; }
				test("GraphComposer.executeMergePlan 100.09");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.09.GCT.101");

						expected = `<Unset>`;
						outcome = gct.commit();
						test("GraphComposer.executeMergePlan 100.09.GCT.102");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.09.GCT.103");
					}
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": <Unset> }`;
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.09.GCT.201");

						expected = `<Unset>`;
						outcome = gct.rollback();
						test("GraphComposer.executeMergePlan 100.09.GCT.202");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 100.09.GCT.203");
					}
				}
			}

			//	GraphComposer.executeMergePlan 100.10
			{
				expected = `0x5`; target = 5; mergePlan = Buf.fromArray([]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.10");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.101");

					expected = `0x5`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.07.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.201");

					expected = `0x5`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.07.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.07.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.11
			{
				expected = `0x5`; target = 5; mergePlan = Buf.fromArray([MergeAction.Noop]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.11");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.11.GCT.101");

					expected = `0x5`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.11.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.11.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.11.GCT.201");

					expected = `0x5`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.11.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.11.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.12
			{
				expected = `[]`; target = 5; mergePlan = Buf.fromArray([MergeAction.Set_NewCountable]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.12");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": [] }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.12.GCT.101");

					expected = `[]`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.12.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.12.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": [] }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.12.GCT.201");

					expected = `0x5`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.12.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.12.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.13
			{
				expected = `{}`; target = 5; mergePlan = Buf.fromArray([MergeAction.Set_NewUncountable]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.13");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": {} }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.13.GCT.101");

					expected = `{}`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.13.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.13.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": {} }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.13.GCT.201");

					expected = `0x5`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.13.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.13.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.14
			{
				expected = `0x5`; target = 6; mergePlan = Buf.fromArray([MergeAction.Set_Atom, 5]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.14");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 6, "targetRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.14.GCT.101");

					expected = `0x5`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.14.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.14.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 6, "targetRoot": 5 }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.14.GCT.201");

					expected = `0x6`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.14.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.14.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 100.15
			{
				expected = `<Unset>`; target = 5; mergePlan = Buf.fromArray([MergeAction.Delete]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 100.15");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.15.GCT.101");

					expected = `<Unset>`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 100.15.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.15.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": 5, "targetRoot": <Unset> }`;
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.15.GCT.201");

					expected = `0x5`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 100.15.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 100.15.GCT.203");
				}
			}

			//	arcs

			//	GraphComposer.executeMergePlan 101.01
			{
				expected = `{}`; target = {}; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Noop]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.01");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": {} }`; target = {};
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.01.GCT.101");

					expected = `{}`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.01.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.01.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": {} }`; target = {};
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.01.GCT.201");

					expected = `{}`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.01.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.01.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.02
			{
				expected = `{ "a": 0x5 }`; target = { a: 5 }; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Noop]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.02");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 } }`; target = { a: 5 };
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.02.GCT.101");

					expected = `{ "a": 0x5 }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.02.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.02.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 } }`; target = { a: 5 };
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.02.GCT.201");

					expected = `{ "a": 0x5 }`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.02.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.02.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.03
			{
				expected = `{ "a": [] }`; target = {}; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Set_NewCountable, "a"]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.03");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": [] }, "actions": &buf[&Object@18, true, "a", void 0] }`; target = {};	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.03.GCT.101");

					expected = `{ "a": [] }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.03.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.03.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": [] }, "actions": &buf[&Object@18, true, "a", void 0] }`; target = {};	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.03.GCT.201");

					expected = `{}`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.03.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.03.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.05
			{
				expected = `{ "a": {} }`; target = {}; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Set_NewUncountable, "a"]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.05");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": {} }, "actions": &buf[&Object@18, true, "a", void 0] }`; target = {};	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.05.GCT.101");

					expected = `{ "a": {} }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.05.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.05.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": {} }, "actions": &buf[&Object@18, true, "a", void 0] }`; target = {};	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.05.GCT.201");

					expected = `{}`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.05.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.05.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.06
			{
				expected = `{ "a": 0x5 }`; target = {}; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Set_Atom, "a", 5]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.06");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 }, "actions": &buf[&Object@18, true, "a", void 0] }`; target = {};	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.101");

					expected = `{ "a": 0x5 }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.06.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 }, "actions": &buf[&Object@18, true, "a", void 0] }`; target = {};	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.201");

					expected = `{}`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.06.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.07
			{
				expected = `{}`; target = { a: 5 }; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Delete, "a"]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.07");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": {}, "actions": &buf[&Object@18, false, "a", 5] }`; target = { a: 5 };	//	`"originalRoot": {}` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.101");

					expected = `{}`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.06.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": {}, "actions": &buf[&Object@18, false, "a", 5] }`; target = { a: 5 };	//	`"originalRoot": {}` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.201");

					expected = `{ "a": 0x5 }`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.06.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.06.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.09 (fail)
			{
				expected = `&Error/MergeConflictException{ "mergePlan": &buf[<Noop>, <Fail>, "a", 0x0], "message": "0xC2CDC3 Merge conflict.", "code": "0xC2CDC3" }`; target = { a: 5 };
				mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Fail, "a", 0x0]);
				try { outcome = GraphComposer.executeMergePlan(mergePlan, target); } catch (ex) { outcome = ex; }
				test("GraphComposer.executeMergePlan 101.09");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 } }`; target = { a: 5 };
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.09.GCT.101");

						expected = `{ "a": 0x5 }`;
						outcome = gct.commit();
						test("GraphComposer.executeMergePlan 101.09.GCT.102");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.09.GCT.103");
					}
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 } }`; target = { a: 5 };
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.09.GCT.201");

						expected = `{ "a": 0x5 }`;
						outcome = gct.rollback();
						test("GraphComposer.executeMergePlan 101.09.GCT.202");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.09.GCT.203");
					}
				}
			}

			//	GraphComposer.executeMergePlan 101.10 (fail)
			{
				expected = `&Error/MergeConflictException{ "mergePlan": &buf[<Noop>, <Fail>, "a", 0x1], "message": "0x1 Merge conflict.", "code": "0x1" }`; target = { a: 5 };
				mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Fail, "a", 0x1]);
				try { outcome = GraphComposer.executeMergePlan(mergePlan, target); } catch (ex) { outcome = ex; }
				test("GraphComposer.executeMergePlan 101.10");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 } }`; target = { a: 5 };
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.10.GCT.101");

						expected = `{ "a": 0x5 }`;
						outcome = gct.commit();
						test("GraphComposer.executeMergePlan 101.10.GCT.102");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.10.GCT.103");
					}
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 } }`; target = { a: 5 };
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.10.GCT.201");

						expected = `{ "a": 0x5 }`;
						outcome = gct.rollback();
						test("GraphComposer.executeMergePlan 101.10.GCT.202");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.10.GCT.203");
					}
				}
			}

			//	GraphComposer.executeMergePlan 101.11
			{
				expected = `{ "b": 0x6 }`; target = { a: 5 }; mergePlan = Buf.fromArray([MergeAction.Set_NewUncountable, MergeAction.Set_Atom, "b", 6]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.11");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 }, "targetRoot": { "b": 6 } }`; target = { a: 5 };	//	`"originalRoot": {}` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.11.GCT.101");

					expected = `{ "b": 0x6 }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.11.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.11.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 }, "targetRoot": { "b": 6 } }`; target = { a: 5 };	//	`"originalRoot": {}` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.11.GCT.201");

					expected = `{ "a": 0x5 }`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.11.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.11.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.12
			{
				expected = `{ "a": [] }`; target = { a: 5 }; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Set_NewCountable, "a"]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.12");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": [] }, "actions": &buf[&Object@18, false, "a", 5] }`; target = { a: 5 };	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.12.GCT.101");

					expected = `{ "a": [] }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.12.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.12.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": [] }, "actions": &buf[&Object@18, false, "a", 5] }`; target = { a: 5 };	//	`"originalRoot": { "a": [] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.12.GCT.201");

					expected = `{ "a": 0x5 }`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.12.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.12.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.13
			{
				expected = `{ "a": 0x5, "b": 0x6 }`; target = { a: 5 }; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Set_Atom, "b", 6]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.13");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5, "b": 6 }, "actions": &buf[&Object@18, true, "b", void 0] }`; target = { a: 5 };	//	`"originalRoot": { "a": 5, "b": 6 }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.13.GCT.101");

					expected = `{ "a": 0x5, "b": 0x6 }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.13.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.13.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5, "b": 6 }, "actions": &buf[&Object@18, true, "b", void 0] }`; target = { a: 5 };	//	`"originalRoot": { "a": 5, "b": 6 }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.13.GCT.201");

					expected = `{ "a": 0x5 }`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.13.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.13.GCT.203");
				}
			}

			//	GraphComposer.executeMergePlan 101.14 (fail)
			{
				expected = `&Error/MergeConflictException{ "mergePlan": &buf[<Set_NewCountable>, <Fail>, "a", 0x1], "message": "0x1 Merge conflict.", "code": "0x1" }`; target = { a: 5 };
				mergePlan = Buf.fromArray([MergeAction.Set_NewCountable, MergeAction.Fail, "a", 0x1]);
				try { outcome = GraphComposer.executeMergePlan(mergePlan, target); } catch (ex) { outcome = ex; }
				test("GraphComposer.executeMergePlan 101.14");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 }, "targetRoot": [] }`; target = { a: 5 };
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.14.GCT.101");

						expected = `[]`;
						outcome = gct.commit();
						test("GraphComposer.executeMergePlan 101.14.GCT.102");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.14.GCT.103");
					}
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5 }, "targetRoot": [] }`; target = { a: 5 };
					try
					{
						GraphComposer.executeMergePlan(mergePlan, target, gct);
					}
					catch (ex)
					{
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.14.GCT.201");

						expected = `{ "a": 0x5 }`;
						outcome = gct.rollback();
						test("GraphComposer.executeMergePlan 101.14.GCT.202");

						expected = `{}`;
						outcome = gct.toDiagnosicString();
						testGCT("GraphComposer.executeMergePlan 101.14.GCT.203");
					}
				}
			}

			//	GraphComposer.executeMergePlan 101.15
			{
				expected = `{ "a": 0x5, "b": [...(empty), 0x6] }`; target = { a: 5 }; mergePlan = Buf.fromArray([MergeAction.Noop, MergeAction.Set_NewCountable, "b", MergeAction.Set_Atom, 1, 6]);
				outcome = GraphComposer.executeMergePlan(mergePlan, target);
				test("GraphComposer.executeMergePlan 101.15");

				//	GraphComposerTransaction.commit
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5, "b": [...(empty), 6] }, "actions": &buf[&Object@18, true, "b", void 0, &Array@33, true, 1, void 0] }`; target = { a: 5 };	//	`"originalRoot": { "a": 5, "b": [...(empty), 6] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.15.GCT.101");

					expected = `{ "a": 0x5, "b": [...(empty), 0x6] }`;
					outcome = gct.commit();
					test("GraphComposer.executeMergePlan 101.15.GCT.102");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.15.GCT.103");
				}

				//	GraphComposerTransaction.rollback
				{
					gct = new GraphComposerTransaction();

					expected = `{ "originalRoot": { "a": 5, "b": [...(empty), 6] }, "actions": &buf[&Object@18, true, "b", void 0, &Array@33, true, 1, void 0] }`; target = { a: 5 };	//	`"originalRoot": { "a": 5, "b": [...(empty), 6] }` because the serialized `gct` references the modified original root
					GraphComposer.executeMergePlan(mergePlan, target, gct);
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.15.GCT.201");

					expected = `{ "a": 0x5 }`;
					outcome = gct.rollback();
					test("GraphComposer.executeMergePlan 101.15.GCT.202");

					expected = `{}`;
					outcome = gct.toDiagnosicString();
					testGCT("GraphComposer.executeMergePlan 101.15.GCT.203");
				}
			}
		}
	}
}

module.exports.UnitTests_GraphCursor = module.exports;
