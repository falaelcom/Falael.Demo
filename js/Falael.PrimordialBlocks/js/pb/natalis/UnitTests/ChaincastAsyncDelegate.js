//	R0Q2/daniel/20220505
"use strict";

const { ChaincastAsyncDelegate } = require("-/pb/natalis/012/ChaincastAsyncDelegate.js");

module.exports =

class UnitTests_ChaincastAsyncDelegate
{
	//	Category: Unit test
	//	Function: Run unit tests for `ChaincastAsyncDelegate` class interface.
	static unitTest_ChaincastAsyncDelegate(result, asyncTests)
	{
		const { sleep } = require("-/pb/natalis/010/Context.js");	//	needs to stay here

		asyncTests.push(async () =>
		{
			const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

			let ccd;
			let cdref1, cbref2, cbref5;
			let state1 = 0, state2 = 0;

			const callback1 = async (v, next) => { await sleep(0); state1 = 1 + v };
			const callback2 = async (v, next) => { await sleep(0); state2 = 2 + v };
			const callback3 = async (v, next) => { await sleep(0); };
			const callback4 = async (v, next) => { await sleep(0); };

			const obj = { a: 10 };
			const callback5 = async function (v) { await sleep(0); this.a += v };

			ccd = new ChaincastAsyncDelegate();

			cdref1 = ccd.put(callback1);
			if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastAsyncDelegate (001.001)`));
			if (ccd.getCallbacks()[0] !== callback1) result.push(fail(`ChaincastAsyncDelegate (001.002)`));
			if (!callback1.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (001.003)`));
			if (callback1.__pbcdi && !callback1.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (001.004)`));
			if (!ccd.has(cdref1)) result.push(fail(`ChaincastAsyncDelegate (001.007)`));
			if (!ccd.has(callback1)) result.push(fail(`ChaincastAsyncDelegate (001.008)`));

			ccd.remove(callback1);
			if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastAsyncDelegate (002.001)`));
			if (callback1.__pbcdi && callback1.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (002.002)`));
			if (ccd.has(cdref1)) result.push(fail(`ChaincastAsyncDelegate (002.003)`));
			if (ccd.has(callback1)) result.push(fail(`ChaincastAsyncDelegate (002.004)`));

			try
			{
				cbref5 = ccd.put(callback5.bind(obj));
				if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastAsyncDelegate (101.001)`));
				if (ccd.getCallbacks()[0] !== cbref5) result.push(fail(`ChaincastAsyncDelegate (101.002)`));
				if (!cbref5.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (101.003)`));
				if (cbref5.__pbcdi && !cbref5.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (101.006)`));
				if (!ccd.has(cbref5)) result.push(fail(`ChaincastAsyncDelegate (101.007)`));

				await ccd(6);
				if (obj.a !== 16) result.push(fail(`ChaincastAsyncDelegate (101.008)`));

				ccd.remove(cbref5);
				if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastAsyncDelegate (102.001)`));
				if (cbref5.__pbcdi && cbref5.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (102.002)`));
				if (ccd.has(cbref5)) result.push(fail(`ChaincastAsyncDelegate (102.003)`));
			}
			catch (ex)
			{
				result.push(fail(`ChaincastAsyncDelegate (102.222)`));
			}

			obj.a = 10;// eslint-disable-line
			cbref5 = ccd.put(async (...args) => callback5.bind(obj)(...args));
			if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastAsyncDelegate (101.101)`));
			if (ccd.getCallbacks()[0] !== cbref5) result.push(fail(`ChaincastAsyncDelegate (101.102)`));
			if (!cbref5.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (101.103)`));
			if (cbref5.__pbcdi && !cbref5.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (101.106)`));
			if (!ccd.has(cbref5)) result.push(fail(`ChaincastAsyncDelegate (101.107)`));

			await ccd(6);
			if (obj.a !== 16) result.push(fail(`ChaincastAsyncDelegate (101.108)`, 16, obj.a));

			ccd.remove(cbref5);
			if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastAsyncDelegate (102.101)`));
			if (cbref5.__pbcdi && cbref5.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (102.102)`));
			if (ccd.has(cbref5)) result.push(fail(`ChaincastAsyncDelegate (102.103)`));

			cdref1 = ccd.put(callback1);
			ccd.remove(cdref1);
			if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastAsyncDelegate (003.001)`));
			if (callback1.__pbcdi && callback1.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (003.002)`));
			if (ccd.has(cdref1)) result.push(fail(`ChaincastAsyncDelegate (003.003)`));
			if (ccd.has(callback1)) result.push(fail(`ChaincastAsyncDelegate (003.004)`));

			cdref1 = ccd.put(callback1);
			cbref2 = ccd.put(callback2);
			if (ccd.getCallbacks().length !== 2) result.push(fail(`ChaincastAsyncDelegate (004.001)`));
			if (ccd.getCallbacks()[1] !== callback1) result.push(fail(`ChaincastAsyncDelegate (004.0021)`));
			if (ccd.getCallbacks()[0] !== callback2) result.push(fail(`ChaincastAsyncDelegate (004.0022)`));
			if (!callback2.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (004.003)`));
			if (callback2.__pbcdi && !callback2.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (004.004)`));
			if (callback2.__pbcdi && callback2.__pbcdi.has(ccd) !== true) result.push(fail(`ChaincastAsyncDelegate (004.006)`));
			if (!ccd.has(cbref2)) result.push(fail(`ChaincastAsyncDelegate (004.007)`));
			if (!ccd.has(callback2)) result.push(fail(`ChaincastAsyncDelegate (004.008)`));

			await ccd(10);
			if (state1 !== 0) result.push(fail(`ChaincastAsyncDelegate (005.001)`, 0, state1));
			if (state2 !== 12) result.push(fail(`ChaincastAsyncDelegate (005.002)`, 12, state2));

			ccd = new ChaincastAsyncDelegate(callback3);
			if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastAsyncDelegate (006.001)`));
			if (ccd.getCallbacks()[0] !== callback3) result.push(fail(`ChaincastAsyncDelegate (006.002)`));
			if (!callback3.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (006.003)`));
			if (callback3.__pbcdi && !callback3.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (006.004)`));
			if (!ccd.has(callback3)) result.push(fail(`ChaincastAsyncDelegate (006.005)`));
			ccd.remove(callback3);

			ccd = new ChaincastAsyncDelegate([callback3]);
			if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastAsyncDelegate (007.001)`));
			if (ccd.getCallbacks()[0] !== callback3) result.push(fail(`ChaincastAsyncDelegate (007.002)`));
			if (!callback3.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (007.003)`));
			if (callback3.__pbcdi && !callback3.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (007.004)`));
			if (!ccd.has(callback3)) result.push(fail(`ChaincastAsyncDelegate (007.005)`));
			ccd.remove(callback3);

			ccd = new ChaincastAsyncDelegate([callback3], callback4);
			if (ccd.getCallbacks().length !== 2) result.push(fail(`ChaincastAsyncDelegate (008.001)`));
			if (ccd.getCallbacks()[1] !== callback3) result.push(fail(`ChaincastAsyncDelegate (008.002)`));
			if (ccd.getCallbacks()[0] !== callback4) result.push(fail(`ChaincastAsyncDelegate (008.003)`));
			if (!callback3.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (008.004)`));
			if (callback3.__pbcdi && !callback3.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (008.005)`));
			if (!ccd.has(callback3)) result.push(fail(`ChaincastAsyncDelegate (008.006)`));
			if (!callback4.__pbcdi) result.push(fail(`ChaincastAsyncDelegate (008.007)`));
			if (callback4.__pbcdi && !callback4.__pbcdi.has(ccd)) result.push(fail(`ChaincastAsyncDelegate (008.008)`));
			if (!ccd.has(callback4)) result.push(fail(`ChaincastAsyncDelegate (008.009)`));
			ccd.remove(callback3);
			ccd.remove(callback4);

			ccd = new ChaincastAsyncDelegate(callback1, callback2, callback3, callback4);
			ccd.lift();
			ccd.lift();
			ccd.lift();
			if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastAsyncDelegate (018.001)`));
			if (ccd.getCallbacks()[0] !== callback1) result.push(fail(`ChaincastAsyncDelegate (018.002)`));
			ccd.lift();

			let stateStack = "";
			let callbackBottom = async (v, next) => { await sleep(0); stateStack += `bottom(${v})`; next && await next(v); };
			let callbackMiddle = async (v, next) => { await sleep(0); stateStack += `middle(${v})`; next && await next(v); };
			let callbackTop = async (v, next) => { await sleep(0); stateStack += `top(${v})`; next && await next(v); };
			ccd = new ChaincastAsyncDelegate(callbackBottom, callbackMiddle, callbackTop);
			await ccd(666);
			if (stateStack !== "top(666)middle(666)bottom(666)") result.push(fail(`ChaincastAsyncDelegate (009.001)`, "top(666)middle(666)bottom(666)", stateStack));

			stateStack = "";
			callbackBottom = async (v, next) => { await sleep(0); stateStack += `bottom(${v})`; next && await next(v); };
			callbackMiddle = async (v, next) => { await sleep(0); stateStack += `middle(${v})`; };
			callbackTop = async (v, next) => { await sleep(0); stateStack += `top(${v})`; next && await next(v); };
			ccd = new ChaincastAsyncDelegate(callbackBottom, callbackMiddle, callbackTop);
			await ccd(666);
			if (stateStack !== "top(666)middle(666)") result.push(fail(`ChaincastAsyncDelegate (009.002)`, "top(666)middle(666)", stateStack));

			stateStack = "";// eslint-disable-line
			callbackBottom = async (v, next) => { await sleep(0); stateStack += `bottom(${v})`; next && await next(v); };
			callbackMiddle = async (v, next) => { await sleep(0); stateStack += `middle(${v})`; next && await next(v); };
			callbackTop = async (v, next) => { await sleep(0); stateStack += `top(${v})`; };
			ccd = new ChaincastAsyncDelegate(callbackBottom, callbackMiddle, callbackTop);
			await ccd(666);
			if (stateStack !== "top(666)") result.push(fail(`ChaincastAsyncDelegate (009.003)`, "top(666)", stateStack));

			callbackBottom = async (v, next) => { await sleep(0); return `bottom(${v})` + (next ? await next(v) : ""); };
			callbackMiddle = async (v, next) => { await sleep(0); return `middle(${v})` + (next ? await next(v) : ""); };
			callbackTop = async (v, next) => { await sleep(0); return `top(${v})` + (next ? await next(v) : ""); };
			ccd = new ChaincastAsyncDelegate(callbackBottom, callbackMiddle, callbackTop);
			stateStack = await ccd(666);// eslint-disable-line
			if (stateStack !== "top(666)middle(666)bottom(666)") result.push(fail(`ChaincastAsyncDelegate (009.004)`, "top(666)middle(666)bottom(666)", stateStack));
		});
	}
}

module.exports.UnitTests_ChaincastAsyncDelegate = module.exports;
