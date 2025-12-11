//	R0Q2/daniel/20230909
"use strict";

const { DiagnosticsCollector } = require("-/pb/natalis/014/DiagnosticsCollector.js");
const { Query, VALUE_TREATMENT_FROM_CACHE, VALUE_TREATMENT_EVALUATE, VALUE_TREATMENT_EVALUATE_AND_CACHE }  = require("-/pb/natalis/015/Query.js");

module.exports =

class UnitTests_Query
{
	//	Category: Unit test
	//	Function: Run unit tests for `Query` class.
	static unitTest_Query(result, asyncTests)
	{
		let expected, outcome;

		const fail = testName => result.push({ testName });
		const fail2 = (testName, expected, outcome) => result.push({ testName, expected, outcome });

		//	basic tests, direct usage
		{
			{
				const query = new Query();
				if (query().Q !== void 0) fail("Query (01.011)");
				if (query().setValue(666).Q !== 666) fail("Query (01.012)");
			}

			{
				function execute() { return 5; }
				const query = new Query(execute);
				if (query().Q !== 5) fail("Query (01.02)");
			}

			{
				function execute() { return this.a; }
				function begin(a) { this.a = a; }
				const query = new Query(execute, begin);
				if (query(6).Q !== 6) fail("Query (01.03)");
			}

			{
				function execute() { return this.a + this.b; }
				function begin(a) { this.a = a; }
				function construct(b) { this.b = b; }
				const query = new Query(execute, begin, construct, 1);
				if (query(6).Q !== 7) fail("Query (01.041)");
				if (query(7).Q !== 8) fail("Query (01.042)");
			}
		}

		//	basic tests, class method usage
		{
			{
				class TestQuery extends Query
				{
				}
				const query = new TestQuery();
				if (query().Q !== void 0) fail("Query (02.01)");
			}

			{
				class TestQuery extends Query
				{
					execute() { return 5; }
				}
				const query = new TestQuery();
				if (query().Q !== 5) fail("Query (02.02)");
			}

			{
				class TestQuery extends Query
				{
					begin(a) { this.a = a; }
					execute() { return this.a; }
				}
				const query = new TestQuery();
				if (query(6).Q !== 6) fail("Query (02.03)");
			}

			{
				class TestQuery extends Query
				{
					constructor(b)
					{
						super(null, null, null, b);
					}

					construct(b) { this.b = b; }
					begin(a) { this.a = a; }
					execute() { return this.a + this.b; }
				}
				const query = new TestQuery(1);
				if (query(6).Q !== 7) fail("Query (02.04)");
			}

			{
				class TestQueryBase extends Query
				{
					operation1()
					{
						this._value *= 10000;
						return this;
					}
				}

				class TestQuery extends TestQueryBase
				{
					constructor(b)
					{
						super(null, null, null, b);
					}

					construct(b) { this.b = b; }
					begin(a) { this._value = a; }
					execute() { return this._value + this.b; }
				}
				const query = new TestQuery(1);
				if (query(6).operation1().Q !== 60001) fail("Query (02.05)");
			}

			{
				class TestQueryBase extends Query
				{
					constructor(b)
					{
						super(null, null, null, b);
					}

					operation1()
					{
						this._value *= 10000;
						return this;
					}
				}

				class TestQuery extends TestQueryBase
				{
					construct(b) { this.b = b; }
					begin(a) { this._value = a; }
					execute() { return this._value + this.b; }
				}
				const query = new TestQuery(1);
				if (query(6).operation1().Q !== 60001) fail("Query (02.06)");
			}

			{
				class TestQueryBase extends Query
				{
					constructor(b)
					{
						super(null, null, null, b);
					}
					construct(b) { this.b = b; }

					operation1()
					{
						this._value *= 10000;
						return this;
					}
				}

				class TestQuery extends TestQueryBase
				{
					begin(a) { this._value = a; }
					execute() { return this._value + this.b; }
				}
				const query = new TestQuery(1);
				if (query(6).operation1().Q !== 60001) fail("Query (02.07)");
			}
		}

		{
			class TestQueryBase extends Query
			{
				constructor(b, c)
				{
					super(null, null, null, b, c);
				}
				construct(b) { this.b = b; }

				operation1()
				{
					this._value *= 10000;
					return this;
				}
			}

			class TestQuery extends TestQueryBase
			{
				construct(...args) { super.construct(...args); this.c = args[1]; }
				begin(a) { this._value = a; }
				execute() { return this._value + this.b + this.c; }
			}
			const query = new TestQuery(1, 500);
			if (query(6).operation1().Q !== 60501) fail("Query (02.08)");
		}

		//	extend
		{
			function execute() { return this.a; }
			function begin(a) { this.a = a; }
			const query = new Query(execute, begin);
			query.extend("square", function ()
			{
				if (!this.valueTreatment) return this;
				this.a = this.a * this.a;
				return this;
			});
			if (query(6).Q !== 6) fail("Query (extend.01)");
			if (query(6).square().Q !== 36) fail("Query (extend.02)");
		}

		//	relay
		{
			{
				const query1 = new Query();
				const query2 = new Query();
				if (query1().relay(query2).Q !== void 0) fail("Query (04.01)");
			}

			{
				function execute() { return 5; }
				const query1 = new Query();
				const query2 = new Query(execute);
				if (query1().relay(query2).Q !== 5) fail("Query (extend.02)");
			}

			{
				function execute() { return this.principal.a; }
				function begin(a) { this.principal.a = a; }
				const query1 = new Query(null, begin);
				const query2 = new Query(execute);
				if (query1(5).relay(query2).Q !== 5) fail("Query (extend.03)");
			}

			{
				const query1 = new Query();
				const query2 = new Query();
				if (query1().pin().relay(query2).cache !== query1.cache) fail("Query (extend.04)");
			}

			{
				const query1 = new Query();
				const query2 = new Query();
				if (query1().pin(666).relay(query2).cacheKey !== 666) fail("Query (extend.05)");
			}

			{
				const query1 = new Query();
				const query2 = new Query();
				if (query1().pin(666).relay(query2).valueTreatment !== query1.valueTreatment) fail("Query (extend.06)");
			}

			{
				const query1 = new Query();
				const query2 = new Query();
				if (query1().setValue(666).relay(query2).value !== 666) fail("Query (extend.07)");
			}

			{
				const query1 = new Query();
				const query2 = new Query();
				if (query1().setDid(666).relay(query2).did === 666) fail("Query (extend.08)");
			}
		}

		//	pin
		{
			{
				const query = new Query();
				query().setValue(666);
				if (query.valueTreatment !== VALUE_TREATMENT_EVALUATE) fail("Query (pin.101)");
			}

			{
				const query = new Query();
				query().setValue(666).pin();
				if (query.valueTreatment !== VALUE_TREATMENT_EVALUATE_AND_CACHE) fail("Query (pin.102)");
			}

			{
				const query = new Query();
				query().setValue(666).pin().Q;
				query().setValue(777).pin();
				if (query.valueTreatment !== VALUE_TREATMENT_FROM_CACHE) fail("Query (pin.103)");
			}

			{
				const query = new Query();
				if (query().setValue(666).Q !== 666) fail("Query (pin.201)");
				if (query().setValue(666).pin().Q !== 666) fail("Query (pin.202)");
				if (query().setValue(777).pin().Q !== 666) fail("Query (pin.203)");
				if (query().pin().setValue(777).Q !== 666) fail("Query (pin.204)");
				if (query().setValue(777).Q !== 777) fail("Query (pin.205)");
			}

			{
				const query = new Query();
				if (query().setValue(666).pin(null, false).Q !== 666) fail("Query (pin.301)");
				if (query().setValue(777).pin(null, false).Q !== 777) fail("Query (pin.302)");
				if (query().pin(null, false).setValue(777).Q !== 777) fail("Query (pin.303)");
			}
		}

		//	basic tests, diagnostics collector
		{
			const replace = (key, value) =>
			{
				switch (key)
				{
					case "timeNs":
					case "systemDurationNs":
					case "lastSystemDurationNs":
					case "significantDurationNs":
					case "aggregateDef":
					case "ordinal":
						return void 0;
					default: return value;
				}
			};

			//	general
			{
				const query = new Query();
				if (query().trace().Q !== void 0) fail("Query (03.01.01)");
			}

			{
				const dia = new DiagnosticsCollector("did");
				const query = new Query();
				if (query(dia).setDid("did").trace().Q !== void 0) fail("Query (03.01.02)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"did","message":null,"details":null},{"key":"did","message":"evaluate","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.02.03)", expected, outcome);
			}

			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				if (query(dia).Q !== void 0) fail("Query (03.02.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"Query","message":"evaluate","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.02.02)", expected, outcome);
			}

			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				if (query(dia).trace().Q !== void 0) fail("Query (03.03.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":null,"message":null,"details":null},{"key":"Query","message":"evaluate","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.03.02)", expected, outcome);
			}

			//	pin
			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				if (query(dia).pin("pin").Q !== void 0) fail("Query (03.04.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"Query","message":"pin: scheduled for caching","details":{"cacheKey":"pin","cachedSize":0}},{"key":"Query","message":"evaluate and cache","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.04.02)", expected, outcome);
			}

			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				query().pin("pin").Q;
				if (query(dia).pin("pin").Q !== void 0) fail("Query (03.05.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"Query","message":"pin: cache hit","details":{"cacheKey":"pin","cachedSize":1}},{"key":"Query","message":"from cache","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.05.02)", expected, outcome);
			}

			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				query().pin("pin1").Q;
				if (query(dia).pin("pin2").Q !== void 0) fail("Query (03.06.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"Query","message":"pin: scheduled for caching","details":{"cacheKey":"pin2","cachedSize":1}},{"key":"Query","message":"evaluate and cache","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.06.02)", expected, outcome);
			}

			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				if (query(dia).pin("pin", false).Q !== void 0) fail("Query (03.07.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"Query","message":"pin: cache disabled via override","details":{"cacheKey":"pin"}},{"key":"Query","message":"evaluate","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.07.02)", expected, outcome);
			}

			{
				const dia = new DiagnosticsCollector();
				const query = new Query();
				query().pin("pin").Q;
				if (query(dia).pin("pin", false).Q !== void 0) fail("Query (03.08.01)");

				expected = `{"tables":[{"data":[{"key":"Query","message":"begin","details":null},{"key":"Query","message":"pin: cache disabled via override","details":{"cacheKey":"pin","cachedSize":1}},{"key":"Query","message":"evaluate","details":{}}]}]}`;
				outcome = JSON.stringify(dia.report([[]]), replace);
				if (expected !== outcome) fail2("Query (03.08.02)", expected, outcome);
			}
		}

		//	debugIsActive
		{
			function execute() { return this.a; }
			function begin(a) { this.a = a; }

			{
				const query = new Query(execute, begin);
				const PB_DEBUG_save = PB_DEBUG;
				try
				{
					PB_DEBUG = false;
					try { query.debugIsActive; fail("Query (debugIsActive.011)"); } catch (ex) { if (ex.ncode !== 0x88DA36) fail("Query (debugIsActive.012)"); }
				}
				finally
				{
					PB_DEBUG = PB_DEBUG_save;
				}
			}

			if (PB_DEBUG)
			{
				{
					const query = new Query(execute, begin);
					const principal = query(6);
					try { query(6); fail("Query (debugIsActive.021)"); } catch (ex) { if (ex.ncode !== 0x4D6FED) fail("Query (debugIsActive.022)"); }
					try { query.extend("", function () { }); fail("Query (debugIsActive.023)"); } catch (ex) { if (ex.ncode !== 0xA02699) fail("Query (debugIsActive.024)"); }
					principal.Q;
					try { principal.Q; fail("Query (debugIsActive.025)"); } catch (ex) { if (ex.ncode !== 0x20D470) fail("Query (debugIsActive.026)"); }
					try { principal.relay(query); fail("Query (debugIsActive.027)"); } catch (ex) { if (ex.ncode !== 0xAF135F) fail("Query (debugIsActive.028)"); }
					try { principal.pin(); fail("Query (debugIsActive.029)"); } catch (ex) { if (ex.ncode !== 0xF16462) fail("Query (debugIsActive.0210)"); }
					try { principal.trace(); fail("Query (debugIsActive.0211)"); } catch (ex) { if (ex.ncode !== 0x949D49) fail("Query (debugIsActive.0212)"); }
				}

				{
					const query = new Query(execute, begin);
					const principal = query(6);
					if (!principal.debugIsActive) fail("Query (debugIsActive.022)");
					principal.Q;
					if (principal.debugIsActive) fail("Query (debugIsActive.023)");
				}

				{
					const query1 = new Query();
					const query2 = new Query();
					const principal1 = query1();
					const principal2 = query1.relay(query2);
					if (principal1.debugIsActive) fail("Query (debugIsActive.031)");
					if (!principal2.debugIsActive) fail("Query (debugIsActive.032)");
				}
			}
		}
	}
}

module.exports.UnitTests_Query = module.exports;
