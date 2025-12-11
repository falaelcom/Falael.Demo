//	R0Q2/daniel/20220505
"use strict";

const { Unset, Type } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");
const { log } = require("-/pb/natalis/010/Context.js");
const { Buf, cbuf } = require("-/pb/natalis/013/Compound.js");
const { Fabric, Cardinality } = require("-/pb/natalis/013/Fabric.js");
const { LiteralFabric } = require("-/pb/natalis/014/LiteralFabric.js");
const { DotSharpNotation } = require("-/pb/natalis/014/DotSharpNotation.js");
const { DiagnosticsCollector } = require("-/pb/natalis/014/DiagnosticsCollector.js");
const { List } = require("-/pb/natalis/014/List.js");
const { BatchProcessingConfig, InstanceHandling } = require("-/pb/natalis/014/BatchProcessingConfig.js");
const { GraphCursor, GraphCursorType, GraphCursorList, Lean, Compact, CompactFormal, GraphComposer, GraphComposerTransaction, MergeAction, MergeDecisions, MergeInstruction } = require("-/pb/natalis/015/GraphCursor.js");
const { GraphQuery, CompactListQuery, CompactFormalListQuery, VertexDictionaryQuery, TranscribeInstruction } = require("-/pb/natalis/020/GraphQuery.js");

module.exports =

class UnitTests_GraphQuery
{
	//	Category: Unit test
	//	Function: Run unit tests for the `GraphQuery` class.
	static unitTest_GraphQuery(result)
	{
		let expected, outcome;

		const test = testName => expected !== Diagnostics.format(outcome) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome) }) : void 0;
		const testvb = testName => expected !== Diagnostics.format(outcome, { verbose: true }) ? result.push({ testName, expected, outcome: Diagnostics.format(outcome, { verbose: true }) }) : void 0;

		test_playground();
		test_TranscribeQuery_GraphQuery();
		test_GraphCursorListQuery();
		test_CompactListQuery();
		test_CompactFormalListQuery();
		test_VertexDictionaryQuery();

		function test_playground()
		{
			//	playground 0001
			{
				const graphQuery = new GraphQuery(
				{
					defaults:
					{
						fabric: LiteralFabric.the,
					},
					relays:
					{
						compactListQuery: new CompactListQuery(),
						compactFormalListQuery: new CompactFormalListQuery(),
						vertexDictionaryQuery: new VertexDictionaryQuery(),
					},
				});
				const cursor = Compact.create(2);
				cursor[0] = 6;
				cursor[1] = "e.e";
				outcome = graphQuery({ a: [1, "b"], c: { d: 5 } })
					.toCompact()
					.append(cursor)
					.toCompactFormal(TranscribeInstruction.Fuse)
					.toVertexDictionary()
					.Q;

				expected = `{ "a#0": 1, "a#1": "b", "c.d": 5, "e\\\\.e": 6 }`;
				test("playground 0001");
			}

			//	playground 0002
			{
				const dia = new DiagnosticsCollector();
				const graphQuery = new GraphQuery(
				{
					defaults:
					{
						fabric: LiteralFabric.the,
					},
					relays:
					{
						compactListQuery: new CompactListQuery(),
						compactFormalListQuery: new CompactFormalListQuery(),
						vertexDictionaryQuery: new VertexDictionaryQuery(),
					},
				});
				const cursor = Compact.create(2);
				cursor[0] = 6;
				cursor[1] = "e.e";
				outcome = graphQuery({ a: [1, "b"], c: { d: 5 } }, dia)
					.toCompact()
					.append(cursor)
					.toCompactFormal(TranscribeInstruction.Fuse)
					.toVertexDictionary()
					.Q;

				expected = `{ "a#0": 1, "a#1": "b", "c.d": 5, "e\\\\.e": 6 }`;
				test("playground 0002");
				log("UnitTests_GraphQuery: playground 0002 (using DiagnosticsCollector) - non-testable, times are expected to vary on every run", graphQuery.dia.report());
			}
		}

		function test_TranscribeQuery_GraphQuery()
		{
			const relays = { compactListQuery: new CompactListQuery(), compactFormalListQuery: new CompactFormalListQuery(), vertexDictionaryQuery: new VertexDictionaryQuery() };

			//	TranscribeQuery_GraphQuery 001.01
			{
				const graphQuery = new GraphQuery({ relays });
				class B { b = 2 }
				outcome = graphQuery({ a: new B() }).toCompact().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[&/B{ "b": 2 }, "a"]]`;
				test("TranscribeQuery_GraphQuery 001.01");
			}
			//	TranscribeQuery_GraphQuery 001.02
			{
				const defaults =
				{
					fabric: Fabric.the,
					createCursor: (compoundType, length) => cbuf(compoundType, length, 666),
				};
				const graphQuery = new GraphQuery({ defaults, relays });
				class B { b = 2 }
				outcome = graphQuery({ a: new B() }).toCompact().Q;

				expected = `&cbuf(8)<GraphCursorList>[&cbuf(666)<Compact>[2, "a", "b"]]`;
				testvb("TranscribeQuery_GraphQuery 001.02");
			}
			//	TranscribeQuery_GraphQuery 001.03
			{
				const graphQuery = new GraphQuery({ relays });
				const a = {};
				const b = { a };
				a.b = b;
				try
				{
					graphQuery(a).toCompact().Q;
				}
				catch (ex)
				{
					outcome = ex;
					expected = `&Error/CircularReferenceException{ "message": "0x4DCDC3 Circular reference.", "code": "0x4DCDC3" }`;
					test("TranscribeQuery_GraphQuery 001.03");
				}
			}
			//	TranscribeQuery_GraphQuery 001.04
			{
				const defaults = { lenient: true };
				const graphQuery = new GraphQuery({ defaults, relays });
				const a = {};
				const b = { a };
				a.b = b;
				try
				{
					graphQuery(a).toCompact().Q;
				}
				catch (ex)
				{
					outcome = ex;
					expected = `&Error/RangeError{ "message": "Maximum call stack size exceeded" }`;
					test("TranscribeQuery_GraphQuery 001.04");
				}
			}

			//	TranscribeQuery_GraphQuery 002.01
			{
				const graphQuery = new GraphQuery({ relays });
				class B { b = 2 }
				outcome = graphQuery({ a: new B() }).toCompactFormal().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[&/B{ "b": 2 }, "a"]]`;
				test("TranscribeQuery_GraphQuery 002.01");
			}
			//	TranscribeQuery_GraphQuery 002.02
			{
				const graphQuery = new GraphQuery({ relays });
				class B { b = 2 }
				outcome = graphQuery({ a: new B() }).setFabric(Fabric.the).setCreateCursor((compoundType, length) => cbuf(compoundType, length, 666)).toCompactFormal().Q;

				expected = `&cbuf(8)<GraphCursorList>[&cbuf(666)<CompactFormal>[2, "a", "b"]]`;
				testvb("TranscribeQuery_GraphQuery 002.02");
			}
			//	TranscribeQuery_GraphQuery 002.03
			{
				const graphQuery = new GraphQuery({ relays });
				const a = {};
				const b = { a };
				a.b = b;
				try
				{
					graphQuery(a).toCompactFormal().Q;
				}
				catch (ex)
				{
					outcome = ex;
					expected = `&Error/CircularReferenceException{ "message": "0x4DCDC3 Circular reference.", "code": "0x4DCDC3" }`;
					test("TranscribeQuery_GraphQuery 002.03");
				}
			}
			//	TranscribeQuery_GraphQuery 002.04
			{
				const graphQuery = new GraphQuery({ relays });
				const a = {};
				const b = { a };
				a.b = b;
				try
				{
					graphQuery(a).setLenient(true).toCompactFormal().Q;
				}
				catch (ex)
				{
					outcome = ex;
					expected = `&Error/RangeError{ "message": "Maximum call stack size exceeded" }`;
					test("TranscribeQuery_GraphQuery 002.04");
				}
			}
		}

		function test_GraphCursorListQuery()
		{
			//	GraphCursorListQuery 001.01 - selectIf, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [1, 2], b: [3, 4] })).selectIf((value, index) => index === 0 || value[0] === 2 || value[0] === 4).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", 0], &cbuf<Compact>[2, "a", 1], &cbuf<Compact>[4, "b", 1]]`;
				test("GraphCursorListQuery 001.01");
			}
			//	GraphCursorListQuery 001.02 - selectIf, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [1, 2], b: [3, 4] })).selectIf((value, index) => index === 0 || value[0] === 2 || value[0] === 4).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", 0], &cbuf<CompactFormal>[2, "a", 1], &cbuf<CompactFormal>[4, "b", 1]]`;
				test("GraphCursorListQuery 001.02");
			}
			//	GraphCursorListQuery 002.01 - transform, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ "a.a": [1, 2], b: [3, 4] })).transform((src, srcCount, srcLowerBound, srcUpperBound, dest, destCount, destLowerBound, destUpperBound) =>
				{
					for (let i = srcLowerBound, j = destLowerBound; i <= srcUpperBound; ++i, ++j) dest[j] = Compact.toCompactFormalFused(src[i]);
				}).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a\\\\.a#0"], &cbuf<CompactFormal>[2, "a\\\\.a#1"], &cbuf<CompactFormal>[3, "b#0"], &cbuf<CompactFormal>[4, "b#1"]]`;
				test("GraphCursorListQuery 002.01");
			}
			//	GraphCursorListQuery 002.02 - transform, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ "a.a": [1, 2], b: [3, 4] })).transform((src, srcCount, srcLowerBound, srcUpperBound, dest, destCount, destLowerBound, destUpperBound) =>
				{
					for (let i = srcLowerBound, j = destLowerBound; i <= srcUpperBound; ++i, ++j) dest[j] = CompactFormal.fuse(src[i]);
				}).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a.a#0"], &cbuf<CompactFormal>[2, "a.a#1"], &cbuf<CompactFormal>[3, "b#0"], &cbuf<CompactFormal>[4, "b#1"]]`;
				test("GraphCursorListQuery 002.02");
			}
			//	GraphCursorListQuery 003.01 - sort, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).sort((left, right) => left[0] - right[0]).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", 1], &cbuf<Compact>[2, "b", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[4, "a", 0]]`;
				test("GraphCursorListQuery 003.01");
			}
			//	GraphCursorListQuery 003.02 - sort, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).sort((left, right) => left[0] - right[0]).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[2, "b", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[4, "a", 0]]`;
				test("GraphCursorListQuery 003.02");
			}

			//	GraphCursorListQuery 004.01 - append, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).append(Compact.fromDotSharpString(666, "a#2")).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[4, "a", 0], &cbuf<Compact>[1, "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[2, "b", 1], &cbuf<Compact>[666, "a", 2]]`;
				test("GraphCursorListQuery 004.01");
			}
			//	GraphCursorListQuery 004.02 - append, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).append(CompactFormal.fromDotSharpString(666, "a#2")).append(CompactFormal.fromDotSharpString(777, "a#3", true)).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[4, "a", 0], &cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[2, "b", 1], &cbuf<CompactFormal>[666, "a#2"], &cbuf<CompactFormal>[777, "a", 3]]`;
				test("GraphCursorListQuery 004.02");
			}
			//	GraphCursorListQuery 005.01 - appendRange, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).appendRange(Compact.list({ c: [666, 777] })).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[4, "a", 0], &cbuf<Compact>[1, "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[2, "b", 1], &cbuf<Compact>[666, "c", 0], &cbuf<Compact>[777, "c", 1]]`;
				test("GraphCursorListQuery 005.01");
			}
			//	GraphCursorListQuery 005.02 - appendRange, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).appendRange(CompactFormal.list({ c: [666, 777] })).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[4, "a", 0], &cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[2, "b", 1], &cbuf<CompactFormal>[666, "c", 0], &cbuf<CompactFormal>[777, "c", 1]]`;
				test("GraphCursorListQuery 005.02");
			}
			//	GraphCursorListQuery 006.01 - insert, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).insert(Compact.fromDotSharpString(666, "a#2"), 0).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[666, "a", 2], &cbuf<Compact>[4, "a", 0], &cbuf<Compact>[1, "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[2, "b", 1]]`;
				test("GraphCursorListQuery 006.01");
			}
			//	GraphCursorListQuery 006.02 - insert, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).insert(CompactFormal.fromDotSharpString(666, "a#2"), 0).insert(CompactFormal.fromDotSharpString(777, "a#3", true), 0).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[777, "a", 3], &cbuf<CompactFormal>[666, "a#2"], &cbuf<CompactFormal>[4, "a", 0], &cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[2, "b", 1]]`;
				test("GraphCursorListQuery 006.02");
			}
			//	GraphCursorListQuery 007.01 - insertRange, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).insertRange(Compact.list({ c: [666, 777] }), 0).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[666, "c", 0], &cbuf<Compact>[777, "c", 1], &cbuf<Compact>[4, "a", 0], &cbuf<Compact>[1, "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[2, "b", 1]]`;
				test("GraphCursorListQuery 007.01");
			}
			//	GraphCursorListQuery 007.02 - insertRange, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).insertRange(CompactFormal.list({ c: [666, 777] }), 0).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[666, "c", 0], &cbuf<CompactFormal>[777, "c", 1], &cbuf<CompactFormal>[4, "a", 0], &cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[2, "b", 1]]`;
				test("GraphCursorListQuery 007.02");
			}
			//	GraphCursorListQuery 008.01 - appendGraph, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).appendGraph({ c: [666, 777] }).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[4, "a", 0], &cbuf<Compact>[1, "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[2, "b", 1], &cbuf<Compact>[666, "c", 0], &cbuf<Compact>[777, "c", 1]]`;
				test("GraphCursorListQuery 008.01");
			}
			//	GraphCursorListQuery 008.02 - appendGraph, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).appendGraph({ c: [666, 777] }).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[4, "a", 0], &cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[2, "b", 1], &cbuf<CompactFormal>[666, "c", 0], &cbuf<CompactFormal>[777, "c", 1]]`;
				test("GraphCursorListQuery 008.02");
			}
			//	GraphCursorListQuery 009.01 - insertGraph, compact
			{
				const compactListQuery = new CompactListQuery();
				outcome = compactListQuery(Compact.list({ a: [4, 1], b: [3, 2] })).insertGraph({ c: [666, 777] }, 0).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[666, "c", 0], &cbuf<Compact>[777, "c", 1], &cbuf<Compact>[4, "a", 0], &cbuf<Compact>[1, "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[2, "b", 1]]`;
				test("GraphCursorListQuery 009.01");
			}
			//	GraphCursorListQuery 009.02 - insertGraph, compact formal
			{
				const compactFormalListQuery = new CompactFormalListQuery();
				outcome = compactFormalListQuery(CompactFormal.list({ a: [4, 1], b: [3, 2] })).insertGraph({ c: [666, 777] }, 0).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[666, "c", 0], &cbuf<CompactFormal>[777, "c", 1], &cbuf<CompactFormal>[4, "a", 0], &cbuf<CompactFormal>[1, "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[2, "b", 1]]`;
				test("GraphCursorListQuery 009.02");
			}
		}

		function test_CompactListQuery()
		{
			const relays = { graphQuery: new GraphQuery(), compactFormalListQuery: new CompactFormalListQuery(), vertexDictionaryQuery: new VertexDictionaryQuery() };

			//	CompactListQuery 001.01 - toGraph
			{
				const compactListQuery = new CompactListQuery({ relays });
				outcome = compactListQuery(Compact.list({ a: [1, 2], b: [3, 4] })).toGraph().Q;

				expected = `{ "a": [1, 2], "b": [3, 4] }`;
				test("CompactListQuery 001.01");
			}
			//	CompactListQuery 002.01 - toCompactFormal
			{
				const compactListQuery = new CompactListQuery({ relays });
				outcome = compactListQuery(Compact.list({ "a.a": [1, 2], b: [3, 4] })).toCompactFormal().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a\\\\.a", 0], &cbuf<CompactFormal>[2, "a\\\\.a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[4, "b", 1]]`;
				test("CompactListQuery 002.01");
			}
			//	CompactListQuery 003.01 - toCompactFormal(TranscribeInstruction.Fuse)
			{
				const compactListQuery = new CompactListQuery({ relays });
				outcome = compactListQuery(Compact.list({ "a.a": [1, 2], b: [3, 4] })).toCompactFormal(TranscribeInstruction.Fuse).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a\\\\.a#0"], &cbuf<CompactFormal>[2, "a\\\\.a#1"], &cbuf<CompactFormal>[3, "b#0"], &cbuf<CompactFormal>[4, "b#1"]]`;
				test("CompactListQuery 003.01");
			}
			//	CompactListQuery 004.01 - asCompactFormal
			{
				const compactListQuery = new CompactListQuery({ relays });
				outcome = compactListQuery(Compact.list({ "a.a": [1, 2], b: [3, 4] })).asCompactFormal().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a.a", 0], &cbuf<CompactFormal>[2, "a.a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[4, "b", 1]]`;
				test("CompactListQuery 004.01");
			}
			//	CompactListQuery 005.01 - rotate
			{
				const compactListQuery = new CompactListQuery({ relays });
				outcome = compactListQuery(Compact.list({ "a.a": [1, 2], b: [3, 4] })).rotate(1).Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, 0, "a.a"], &cbuf<Compact>[2, 1, "a.a"], &cbuf<Compact>[3, 0, "b"], &cbuf<Compact>[4, 1, "b"]]`;
				test("CompactListQuery 005.01");
			}
		}

		function test_CompactFormalListQuery()
		{
			const relays = { graphQuery: new GraphQuery(), compactListQuery: new CompactListQuery(), vertexDictionaryQuery: new VertexDictionaryQuery() };

			//	test `spread`

			//	CompactFormalListQuery 001.01 - toCompact
			{
				const compactFormalListQuery = new CompactFormalListQuery({ relays });
				outcome = compactFormalListQuery(CompactFormal.list({ "a.a": [1, 2], b: [3, 4] })).toCompact().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a", "a", 0], &cbuf<Compact>[2, "a", "a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[4, "b", 1]]`;
				test("CompactFormalListQuery 001.01");
			}
			//	CompactFormalListQuery 001.02 - asCompact
			{
				const compactFormalListQuery = new CompactFormalListQuery({ relays });
				outcome = compactFormalListQuery(CompactFormal.list({ "a.a": [1, 2], b: [3, 4] })).asCompact().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<Compact>[1, "a.a", 0], &cbuf<Compact>[2, "a.a", 1], &cbuf<Compact>[3, "b", 0], &cbuf<Compact>[4, "b", 1]]`;
				test("CompactFormalListQuery 001.02");
			}
			//	CompactFormalListQuery 001.03 - toVertexDictionary, fuse
			{
				const compactFormalListQuery = new CompactFormalListQuery({ relays });
				outcome = compactFormalListQuery(CompactFormal.list({ "a.a": [1, 2], b: [3, 4] })).fuse().toVertexDictionary().Q;

				expected = `{ "a.a#0": 1, "a.a#1": 2, "b#0": 3, "b#1": 4 }`;
				test("CompactFormalListQuery 001.03");
			}
			//	CompactFormalListQuery 001.04 - spread
			{
				const compactFormalListQuery = new CompactFormalListQuery({ relays });
				outcome = compactFormalListQuery(CompactFormal.list({ "a.a": [1, 2], b: [3, 4] })).fuse().spread().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a", "a", 0], &cbuf<CompactFormal>[2, "a", "a", 1], &cbuf<CompactFormal>[3, "b", 0], &cbuf<CompactFormal>[4, "b", 1]]`;
				test("CompactFormalListQuery 001.04");
			}
		}

		function test_VertexDictionaryQuery()
		{
			const relays = { compactFormalListQuery: new CompactFormalListQuery() };

			//	VertexDictionaryQuery 001.01 - toCompactFormal
			{
				const vertexDictionaryQuery = new VertexDictionaryQuery({ relays });
				outcome = vertexDictionaryQuery({"a": 1, "b.c#0": 2}).toCompactFormal().Q;

				expected = `&cbuf<GraphCursorList>[&cbuf<CompactFormal>[1, "a"], &cbuf<CompactFormal>[2, "b.c#0"]]`;
				test("VertexDictionaryQuery 001.01");
			}
		}
	}
}

module.exports.UnitTests_GraphCursor = module.exports;
