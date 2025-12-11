//	R0Q2/daniel/20220505
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { tunable } = require("-/pb/natalis/010/Context.js");
const { BufPool } = require("-/pb/natalis/013/Compound.js");
const { DiagnosticsCollector, INDEX_TIMENS, INDEX_DURATIONNS_SYSTEM } = require("-/pb/natalis/014/DiagnosticsCollector.js");

const T_0x253AC3 = tunable(0x253AC3);

module.exports =

class UnitTests_DiagnosticsCollector
{
	//	Category: Unit test
	//	Function: Run unit tests for `DiagnosticsCollector` class methods and properties.
	static unitTest_DiagnosticsCollector(result)
	{
		let dia, expected, temp, outcome, traceBufferPool, lineBufferPool;

		const inspect = (value, type, container, key, visited) =>
		{
			switch (type)
			{
				case Type.Date: return "(date/time)";
				default:
					switch (key)
					{
						case "durationMs": return 0;
						case INDEX_TIMENS: case INDEX_DURATIONNS_SYSTEM: return 0;	//	duration in array
						case "_traceBufferPool": case "_trace_finalize": case "_lineBufferPool": case "_traceLine_finalize": return Symbol("stripped");
						default: return value;
					}
			}
		};

		const inspectA = (value, type, container, key, visited) =>
		{
			switch (key)
			{
				case "_traceBufferPool":
				case "_trace_finalize":
				case "_lineBufferPool":
				case "_traceLine_finalize":
					return Symbol("stripped");
				default: return value;
			}
		};

		test_DiagnosticsCollector_trace();
		test_DiagnosticsCollector_report();

		function test_DiagnosticsCollector_trace()
		{
			const fail = testName => result.push({ testName, expected, outcome: Diagnostics.format(dia, { inspect }) });
			const fail2 = (testName, expected, outcome) => result.push({ testName, expected, outcome });
			const test = testName => { if (Diagnostics.format(dia, { inspect }) !== expected) fail(testName) };

			const failA = testName => result.push({ testName, expected, outcome: Diagnostics.format(dia, { inspect: inspectA }) });
			const testA = testName => { if (Diagnostics.format(dia, { inspect: inspectA }) !== expected) failA(testName) };

			dia = new DiagnosticsCollector();
			expected = `&/DiagnosticsCollector{ "_store": &Map{}, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 2, "_lineCounter": 0, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.01)");

			dia = new DiagnosticsCollector(null, null, 3);
			expected = `&/DiagnosticsCollector{ "_store": &Map{}, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 0, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.02)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace();
			expected = `&/DiagnosticsCollector{ "_store": &Map{ null=&buf[&buf[1, null, 0, null, null, 0, 0]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.031)");

			dia = new DiagnosticsCollector(666, null, 3);
			dia.trace();
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, null, null, 0, 0]] }, "_defaultTraceKey": 666, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.032)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, null, null, 0, 0]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.033)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666, "message");
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, "message", null, 0, 0]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.04)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666, "message", { details: true });
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, "message", { "details": true }, 0, 0]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.05)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666, "message", { details: true }, 5);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, "message", { "details": true }, 0, 0]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (01.06)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666, "message", { details: true }, 5, 10);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 5, "message", { "details": true }, 0, 10]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			testA("DiagnosticsCollector.trace (01.07)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666, "message1", 11, 5, 10);
			dia.trace(666, "message2", 12, 15, 20);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 5, "message1", 11, 0, 10], &buf[1, 666, 15, "message2", 12, 1, 20]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 2, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			testA("DiagnosticsCollector.trace (01.08)");

			dia = new DiagnosticsCollector(null, null, 3);
			dia.trace(666, "message1", 11, 5, 10);
			dia.trace(999, "message2", 12, 15, 20);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 5, "message1", 11, 0, 10]], 999=&buf[&buf[1, 999, 15, "message2", 12, 1, 20]] }, "_defaultTraceKey": null, "_inspect": null, "_autoGrowthFactor": 3, "_lineCounter": 2, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			testA("DiagnosticsCollector.trace (01.09)");

			temp = 5;
			dia = new DiagnosticsCollector(null, function inspect() { temp = 6; }, 3);
			dia.trace(666);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, null, null, 0, 0]] }, "_defaultTraceKey": null, "_inspect": function inspect() { temp = 6; }, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (02.01)");
			if (temp !== 6) fail2("DiagnosticsCollector.trace (02.02)", 6, temp);

			temp = 0;
			dia = new DiagnosticsCollector(null, function inspect(sender, line) { temp = line; }, 3);
			dia.trace(666);
			expected = `&/DiagnosticsCollector{ "_store": &Map{ 666=&buf[&buf[1, 666, 0, null, null, 0, 0]] }, "_defaultTraceKey": null, "_inspect": function inspect(sender, line) { temp = line; }, "_autoGrowthFactor": 3, "_lineCounter": 1, "_traceBufferPool": <stripped>, "_trace_finalize": <stripped>, "_lineBufferPool": <stripped>, "_traceLine_finalize": <stripped> }`;
			test("DiagnosticsCollector.trace (02.03)");
			expected = `&buf[1, 666, 0, null, null, 0, 0]`;
			outcome = Diagnostics.format(temp, { inspect });
			if (outcome !== expected) fail2("DiagnosticsCollector.trace (02.04)", expected, outcome);

			traceBufferPool = new BufPool(void 0, 2);	//	new trace buffers will have `length === 2`, which will make autogrowth for trace buffers to kick-in early
			dia = new DiagnosticsCollector(null, null, 4, traceBufferPool);
			for (let length = 3, i = 0; i < length; ++i) dia.trace(666, String(i));
			expected = 12;
			outcome = dia.store.get(666).length;
			if (outcome !== expected) fail2("DiagnosticsCollector.trace - autogrowth, ovr traceBufferPool (03.01)", expected, outcome);

			lineBufferPool = new BufPool(void 0, 666);
			dia = new DiagnosticsCollector(null, null, 4, null, lineBufferPool);
			dia.trace(666);
			expected = 666;
			outcome = dia.store.get(666)[0].length;
			if (outcome !== expected) fail2("DiagnosticsCollector.trace - ovr lineBufferPool (03.02)", expected, outcome);
		}

		function test_DiagnosticsCollector_report()
		{
			const failA = testName => result.push({ testName, expected, outcome: Diagnostics.format(outcome, { inspect: inspectA }) });
			const testA = testName => { if (Diagnostics.format(outcome, { inspect: inspectA }) !== expected) failA(testName) };

			//	no keys, missing keys
			dia = new DiagnosticsCollector();
			outcome = dia.report();
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0, "data": [] }], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0 }`;
			testA("DiagnosticsCollector.report (100.001)");

			dia = new DiagnosticsCollector();
			outcome = dia.report([]);
			expected = `{ "tables": [], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0 }`;
			testA("DiagnosticsCollector.report (100.002)");

			dia = new DiagnosticsCollector();
			outcome = dia.report([[666]]);
			expected = `{ "tables": [{ "aggregateDef": [666], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0, "data": [] }], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0 }`;
			testA("DiagnosticsCollector.report (100.003)");

			dia = new DiagnosticsCollector();
			outcome = dia.report([[666, "abc"]]);
			expected = `{ "tables": [{ "aggregateDef": [666, "abc"], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0, "data": [] }], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0 }`;
			testA("DiagnosticsCollector.report (100.004)");

			dia = new DiagnosticsCollector();
			outcome = dia.report([[666], ["abc"]]);
			expected = `{ "tables": [{ "aggregateDef": [666], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0, "data": [] }, { "aggregateDef": ["abc"], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0, "data": [] }], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0 }`;
			testA("DiagnosticsCollector.report (100.005)");

			//	single key
			dia = new DiagnosticsCollector();
			dia.trace(666, "message", "details", 10, 20);
			outcome = dia.report();
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 20, "lastSystemDurationNs": 20, "significantDurationNs": 0, "data": [{ "key": 666, "ordinal": 0, "message": "message", "details": "details", "timeNs": 10, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }] }, { "aggregateDef": [666], "systemDurationNs": 20, "lastSystemDurationNs": 20, "significantDurationNs": 0, "data": [{ "key": 666, "ordinal": 0, "message": "message", "details": "details", "timeNs": 10, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }] }], "systemDurationNs": 20, "lastSystemDurationNs": 20, "significantDurationNs": 0 }`;
			testA("DiagnosticsCollector.report (101.021)");

			dia = new DiagnosticsCollector();
			dia.trace(666, "message1", "details1", 10, 20);
			dia.trace(666, "message2", "details2", 100, 15);
			outcome = dia.report();
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 35, "lastSystemDurationNs": 15, "significantDurationNs": 70, "data": [{ "key": 666, "ordinal": 0, "message": "message1", "details": "details1", "timeNs": 10, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": 666, "ordinal": 1, "message": "message2", "details": "details2", "timeNs": 100, "systemDurationNs": 15, "lastSystemDurationNs": 20, "significantDurationNs": 70 }] }, { "aggregateDef": [666], "systemDurationNs": 35, "lastSystemDurationNs": 15, "significantDurationNs": 70, "data": [{ "key": 666, "ordinal": 0, "message": "message1", "details": "details1", "timeNs": 10, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": 666, "ordinal": 1, "message": "message2", "details": "details2", "timeNs": 100, "systemDurationNs": 15, "lastSystemDurationNs": 20, "significantDurationNs": 70 }] }], "systemDurationNs": 35, "lastSystemDurationNs": 15, "significantDurationNs": 70 }`
			testA("DiagnosticsCollector.report (101.022)");

			dia = new DiagnosticsCollector();
			dia.trace(666, "message3", "details3", 300, 15);
			dia.trace(666, "message2", "details2", 200, 10);
			dia.trace(666, "message1", "details1", 100, 5);
			outcome = dia.report();
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 30, "lastSystemDurationNs": 15, "significantDurationNs": 185, "data": [{ "key": 666, "ordinal": 2, "message": "message1", "details": "details1", "timeNs": 100, "systemDurationNs": 5, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": 666, "ordinal": 1, "message": "message2", "details": "details2", "timeNs": 200, "systemDurationNs": 10, "lastSystemDurationNs": 5, "significantDurationNs": 95 }, { "key": 666, "ordinal": 0, "message": "message3", "details": "details3", "timeNs": 300, "systemDurationNs": 15, "lastSystemDurationNs": 10, "significantDurationNs": 90 }] }, { "aggregateDef": [666], "systemDurationNs": 30, "lastSystemDurationNs": 15, "significantDurationNs": 185, "data": [{ "key": 666, "ordinal": 2, "message": "message1", "details": "details1", "timeNs": 100, "systemDurationNs": 5, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": 666, "ordinal": 1, "message": "message2", "details": "details2", "timeNs": 200, "systemDurationNs": 10, "lastSystemDurationNs": 5, "significantDurationNs": 95 }, { "key": 666, "ordinal": 0, "message": "message3", "details": "details3", "timeNs": 300, "systemDurationNs": 15, "lastSystemDurationNs": 10, "significantDurationNs": 90 }] }], "systemDurationNs": 30, "lastSystemDurationNs": 15, "significantDurationNs": 185 }`;
			testA("DiagnosticsCollector.report (101.023)");

			//	2 keys
			dia = new DiagnosticsCollector();
			dia.trace("abc", "message", "details", 200, 20);
			dia.trace(666, "message", "details", 100, 10);
			outcome = dia.report();
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90, "data": [{ "key": 666, "ordinal": 1, "message": "message", "details": "details", "timeNs": 100, "systemDurationNs": 10, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": 10, "significantDurationNs": 90 }] }, { "aggregateDef": ["abc"], "systemDurationNs": 20, "lastSystemDurationNs": 20, "significantDurationNs": 0, "data": [{ "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }] }, { "aggregateDef": [666], "systemDurationNs": 10, "lastSystemDurationNs": 10, "significantDurationNs": 0, "data": [{ "key": 666, "ordinal": 1, "message": "message", "details": "details", "timeNs": 100, "systemDurationNs": 10, "lastSystemDurationNs": null, "significantDurationNs": null }] }], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90 }`;
			testA("DiagnosticsCollector.report (102.001)");

			dia = new DiagnosticsCollector();
			dia.trace("abc", "message", "details", 200, 20);
			dia.trace(666, "message", "details", 100, 10);
			outcome = dia.report([[666, "abc"], ["abc"]]);
			expected = `{ "tables": [{ "aggregateDef": [666, "abc"], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90, "data": [{ "key": 666, "ordinal": 1, "message": "message", "details": "details", "timeNs": 100, "systemDurationNs": 10, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": 10, "significantDurationNs": 90 }] }, { "aggregateDef": ["abc"], "systemDurationNs": 20, "lastSystemDurationNs": 20, "significantDurationNs": 0, "data": [{ "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }] }], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90 }`;
			testA("DiagnosticsCollector.report (102.002)");

			dia = new DiagnosticsCollector();
			dia.trace("abc", "message", "details", 200, 20);
			dia.trace(666, "message", "details", 100, 10);
			outcome = dia.report([]);
			expected = `{ "tables": [], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90 }`;
			testA("DiagnosticsCollector.report (102.003)");

			dia = new DiagnosticsCollector();
			dia.trace("abc", "message", "details", 200, 20);
			dia.trace(666, "message", "details", 100, 10);
			outcome = dia.report([[]]);
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90, "data": [{ "key": 666, "ordinal": 1, "message": "message", "details": "details", "timeNs": 100, "systemDurationNs": 10, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": 10, "significantDurationNs": 90 }] }], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90 }`;
			testA("DiagnosticsCollector.report (102.004)");

			dia = new DiagnosticsCollector();
			dia.trace("abc", "message", "details", 200, 20);
			dia.trace(666, "message", "details", 100, 10);
			outcome = dia.report([[666, "abc", "nonexisting"], ["abc", "nonexisting"], ["nonexisting"]]);
			expected = `{ "tables": [{ "aggregateDef": [666, "abc", "nonexisting"], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90, "data": [{ "key": 666, "ordinal": 1, "message": "message", "details": "details", "timeNs": 100, "systemDurationNs": 10, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": 10, "significantDurationNs": 90 }] }, { "aggregateDef": ["abc", "nonexisting"], "systemDurationNs": 20, "lastSystemDurationNs": 20, "significantDurationNs": 0, "data": [{ "key": "abc", "ordinal": 0, "message": "message", "details": "details", "timeNs": 200, "systemDurationNs": 20, "lastSystemDurationNs": null, "significantDurationNs": null }] }, { "aggregateDef": ["nonexisting"], "systemDurationNs": 0, "lastSystemDurationNs": 0, "significantDurationNs": 0, "data": [] }], "systemDurationNs": 30, "lastSystemDurationNs": 20, "significantDurationNs": 90 }`;
			testA("DiagnosticsCollector.report (102.005)");

			dia = new DiagnosticsCollector();
			dia.trace(666, "message666-3", "details666-3", 300, 15);
			dia.trace(666, "message666-2", "details666-2", 200, 10);
			dia.trace(666, "message666-1", "details666-1", 100, 5);
			dia.trace("abc", "messageabc-3", "detailsabc-3", 250, 25);
			dia.trace("abc", "messageabc-2", "detailsabc-2", 150, 15);
			dia.trace("abc", "messageabc-1", "detailsabc-1", 50, 0);
			outcome = dia.report([[]]);
			expected = `{ "tables": [{ "aggregateDef": [], "systemDurationNs": 70, "lastSystemDurationNs": 15, "significantDurationNs": 195, "data": [{ "key": "abc", "ordinal": 5, "message": "messageabc-1", "details": "detailsabc-1", "timeNs": 50, "systemDurationNs": 0, "lastSystemDurationNs": null, "significantDurationNs": null }, { "key": 666, "ordinal": 2, "message": "message666-1", "details": "details666-1", "timeNs": 100, "systemDurationNs": 5, "lastSystemDurationNs": 0, "significantDurationNs": 50 }, { "key": "abc", "ordinal": 4, "message": "messageabc-2", "details": "detailsabc-2", "timeNs": 150, "systemDurationNs": 15, "lastSystemDurationNs": 5, "significantDurationNs": 45 }, { "key": 666, "ordinal": 1, "message": "message666-2", "details": "details666-2", "timeNs": 200, "systemDurationNs": 10, "lastSystemDurationNs": 15, "significantDurationNs": 35 }, { "key": "abc", "ordinal": 3, "message": "messageabc-3", "details": "detailsabc-3", "timeNs": 250, "systemDurationNs": 25, "lastSystemDurationNs": 10, "significantDurationNs": 40 }, { "key": 666, "ordinal": 0, "message": "message666-3", "details": "details666-3", "timeNs": 300, "systemDurationNs": 15, "lastSystemDurationNs": 25, "significantDurationNs": 25 }] }], "systemDurationNs": 70, "lastSystemDurationNs": 15, "significantDurationNs": 195 }`;
			testA("DiagnosticsCollector.report (103.001)");
		}
	}
}

module.exports.UnitTests_DebugAggregator = module.exports;
