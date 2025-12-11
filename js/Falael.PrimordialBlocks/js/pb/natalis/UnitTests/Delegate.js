//	R0Q2/daniel/20220505
"use strict";

const { Delegate } = require("-/pb/natalis/012/Delegate.js");

module.exports =

class UnitTests_Delegate
{
	//	Category: Unit test
	//	Function: Run unit tests for `Delegate` class.
	static unitTest_Delegate(result, asyncTests)
	{
		const { sleep } = require("-/pb/natalis/010/Context.js");	//	needs to stay here

		const fail = testName => result.push({ testName });

		(function ()	//	because of a react-native/babel bug
		{
			function execute(b)
			{
				if (!(this instanceof Delegate)) fail("Delegate (8001.0011");
				return this._a + b;
			}
			function construct(a)
			{
				this._a = a;
			}
			const delegate = new Delegate(execute, construct, 100);
			delegate.test = function (c)
			{
				if (!(this instanceof Delegate)) fail("Delegate (9001.0011");
				return this(c);
			}
			if (!(delegate instanceof Delegate)) fail("Delegate (001.0011");
			if (delegate(50) !== 150) fail("Delegate (001.0012)");
			if (delegate.test(50) !== 150) fail("Delegate (001.0013)");
		})();

		asyncTests.push(async () =>
		{
			async function execute(b)
			{
				await sleep(0);
				return this._a + b;
			}
			function construct(a)
			{
				this._a = a;
			}
			const delegate = new Delegate(execute, construct, 100);
			if ((await delegate(50)) !== 150) fail("Delegate (001.002)");
		});

		try
		{
			function* execute(b)
			{
				for (let i = 1; i < b; ++i) yield this._a + i;
			}
			function construct(a)
			{
				this._a = a;
			}
			const delegate = new Delegate(execute, construct, 100);
			for (const v of delegate(50))
			{
				if (v !== 101) fail("Delegate (001.003)");
				break;
			}
		}
		catch (ex)
		{
			fail("Delegate (001.103)");
		}

		asyncTests.push(async () =>
		{
			try
			{
				async function* execute(b)
				{
					yield await (async () =>
					{
						await sleep(0);
						return this._a + b
					})();
				}
				function construct(a)
				{
					this._a = a;
				}
				const delegate = new Delegate(execute, construct, 100);
				for await (const v of delegate(50))
				{
					if (v !== 150) fail("Delegate (001.004)");
					break;
				}
			}
			catch (ex)
			{
				fail("Delegate (001.104)");
			}
		});

		{
			class C extends Delegate
			{
				constructor(...args)
				{
					function execute(b)
					{
						if (!(this instanceof Delegate)) fail("Delegate (8002.0011");
						if (!(this instanceof C)) fail("Delegate (9002.0012");
						return this._a + b;
					}
					function construct(a)
					{
						this._a = a;
					}
					return super(execute, construct, ...args);	// eslint-disable-line
				}
				test(c)
				{
					if (!(this instanceof Delegate)) fail("Delegate (6002.0011");
					if (!(this instanceof C)) fail("Delegate (7002.0012");
					return this(c)
				}
			}
			const delegate = new C(100);
			if (!(delegate instanceof Delegate)) fail("Delegate (002.0011");
			if (!(delegate instanceof C)) fail("Delegate (002.0012");
			if (delegate(50) !== 150) fail("Delegate (002.0013)");
			if (delegate.test(50) !== 150) fail("Delegate (002.0014)");
		}

		{
			class C extends Delegate
			{
				_a = 0;
				constructor(a)
				{
					function execute(b)
					{
						if (!(this instanceof Delegate)) fail("Delegate (18002.0011");
						if (!(this instanceof C)) fail("Delegate (19002.0012");
						return this._a + b;
					}
					const instance = super(execute);
					this._a = a;
					return instance;
				}
				test(c)
				{
					if (!(this instanceof Delegate)) fail("Delegate (16002.0011");
					if (!(this instanceof C)) fail("Delegate (17002.0012");
					return this(c)
				}
			}
			const delegate = new C(100);
			if (!(delegate instanceof Delegate)) fail("Delegate (1002.0011");
			if (!(delegate instanceof C)) fail("Delegate (1002.0012");
			if (delegate(50) !== 150) fail("Delegate (1002.0013)");
			if (delegate.test(50) !== 150) fail("Delegate (1002.0014)");
		}

		{
			class C extends Delegate
			{
				c = 7;
				abnormal01 = 7;
				abnormal02 = 7;
				abnormal03 = 7;

				constructor(...args)
				{
					const outcome = super(null, null, ...args);
					outcome.abnormal02 = 8;
					this.abnormal03 = 8;
					return outcome;
				}
				construct(a)
				{
					this._a = a;
					this.abnormal01 = 8;
				}
				execute(b)
				{
					if (!(this instanceof Delegate)) fail("Delegate (8003.0011");
					if (!(this instanceof C)) fail("Delegate (9003.0012");
					return this._a + b;
				}
				test(c)
				{
					if (!(this instanceof Delegate)) fail("Delegate (6003.0011");
					if (!(this instanceof C)) fail("Delegate (7003.0012");
					return this(c);
				}
			}
			const delegate = new C(100);
			if (!(delegate instanceof Object)) fail("Delegate (003.0011");
			if (!(delegate instanceof Delegate)) fail("Delegate (003.0012");
			if (!(delegate instanceof C)) fail("Delegate (003.0013");
			if (delegate(50) !== 150) fail("Delegate (003.0014)");
			if (delegate.test(50) !== 150) fail("Delegate (003.0015)");
			if (delegate.c !== 7) fail("Delegate (003.0016)");
			if (delegate.abnormal01 !== 7) fail("Delegate (003.0017)");
			if (delegate.abnormal02 !== 8) fail("Delegate (003.0018)");
			if (delegate.abnormal03 !== 8) fail("Delegate (003.0019)");
		}
	}
}

module.exports.UnitTests_Delegate = module.exports;
