//	R0Q2/daniel/20220505
"use strict";

const { QueryDelegate } = require("-/pb/natalis/013/QueryDelegate.js");

module.exports =

class UnitTests_QueryDelegate
{
	//	Category: Unit test
	//	Function: Run unit tests for `QueryDelegate` class.
	static unitTest_QueryDelegate(result, asyncTests)
	{
		const fail = testName => result.push({ testName });

		{
			function execute()
			{
				return 5;
			}
			const valueName_save = QueryDelegate.ValueName;
			try
			{
				QueryDelegate.ValueName = "A"
				const query = new QueryDelegate(execute);
				if (query.A !== 5) fail("QueryDelegate (01.00)");
				if (query().A !== 5) fail("QueryDelegate (01.00)");
			}
			finally
			{
				QueryDelegate.ValueName = valueName_save;
			}
		}

		(function ()	//	because of a react-native/babel bug
		{
			function execute()
			{
				return 5;
			}
			const query = new QueryDelegate(execute);
			if (query.Q !== 5) fail("QueryDelegate (01.01)");
			if (query().Q !== 5) fail("QueryDelegate (01.02)");
		})();

		{
			function execute()
			{
				return this.a;
			}
			function construct(a)
			{
				this.a = a;
			}
			const query = new QueryDelegate(execute, null, construct, 5);
			if (query.Q !== 5) fail("QueryDelegate (02.01)");
			if (query().Q !== 5) fail("QueryDelegate (02.02)");
		}

		(function ()	//	because of a react-native/babel bug
		{
			function execute()
			{
				return this.a;
			}
			function begin(a)
			{
				this.a = a;
			}
			const query = new QueryDelegate(execute, begin);
			if (query.Q !== void 0) fail("QueryDelegate (03.01)");
			if (query(5).Q !== 5) fail("QueryDelegate (03.02)");
		})();

		{
			function begin(b)
			{
				this.b = b;
			}
			function execute()
			{
				return this.a + this.b;
			}
			function construct(a)
			{
				this.a = a;
				this.b = 0;
			}
			const query = new QueryDelegate(execute, begin, construct, 5);
			if (query.Q !== 5) fail("QueryDelegate (04.01)");
			if (query(10).Q !== 15) fail("QueryDelegate (04.02)");
		}

		asyncTests.push(async () =>
		{
			function begin(b)
			{
				this.b = b;
			}
			async function execute()
			{
				return new Promise((r) => r(this.a + this.b));
			}
			function construct(a)
			{
				this.a = a;
				this.b = 0;
			}
			const query = new QueryDelegate(execute, begin, construct, 5);
			if ((await query.Q) !== 5) fail("QueryDelegate (05.01)");
			if ((await query(10).Q) !== 15) fail("QueryDelegate (05.02)");
		});

		{
			class C extends QueryDelegate
			{
				c = 7;
				abnormal01 = 7;
				abnormal02 = 7;

				constructor(...args)
				{
					function execute()
					{
						return this._a + this._value;
					}
					function begin(b)
					{
						this._value = b;
					}
					function construct(a)
					{
						this._a = a;
						this._value = 0;

						this.abnormal01 = 8;
					}
					const instance = super(execute, begin, construct, ...args);
					this.abnormal02 = 8;
					return instance;
				}

				inc()
				{
					++this._value;
					return this;
				}
			}
			const query = new C(5);
			if (query.c !== 7) fail("QueryDelegate (06.01)");
			if (query.abnormal01 !== 7) fail("QueryDelegate (06.011)");
			if (query.abnormal02 !== 8) fail("QueryDelegate (06.012)");
			if (query.Q !== 5) fail("QueryDelegate (06.02)");
			if (query(10).Q !== 15) fail("QueryDelegate (06.03)");
			if (query(10).inc().Q !== 16) fail("QueryDelegate (06.04)");
			if (query(10).inc().inc().Q !== 17) fail("QueryDelegate (06.05)");
		}

		{
			class C extends QueryDelegate
			{
				c = 7;
				abnormal01 = 7;
				abnormal02 = 7;

				constructor(...args)
				{
					const instance = super(null, null, null, ...args);
					this.abnormal02 = 8;
					return instance;
				}
				execute()
				{
					return this._a + this._value;
				}
				begin(b)
				{
					this._value = b;
				}
				construct(a)
				{
					this._a = a;
					this._value = 0;

					this.abnormal01 = 8;
				}
				inc()
				{
					++this._value;
					return this;
				}
			}
			const query = new C(5);
			if (query.c !== 7) fail("QueryDelegate (07.01)");
			if (query.abnormal01 !== 7) fail("QueryDelegate (07.011)");
			if (query.abnormal02 !== 8) fail("QueryDelegate (07.012)");
			if (query.Q !== 5) fail("QueryDelegate (07.02)");
			if (query(10).Q !== 15) fail("QueryDelegate (07.03)");
			if (query(10).inc().Q !== 16) fail("QueryDelegate (07.04)");
			if (query(10).inc().inc().Q !== 17) fail("QueryDelegate (07.05)");
		}
	}
}

module.exports.UnitTests_QueryDelegate = module.exports;
