//	R0Q2/daniel/20220505
"use strict";

const { ChaincastDelegate } = require("-/pb/natalis/012/ChaincastDelegate.js");

module.exports =

class UnitTests_ChaincastDelegate
{
	//	Category: Unit test
	//	Function: Run unit tests for `ChaincastDelegate` class interface.
	static unitTest_ChaincastDelegate(result)
	{
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let ccd;
		let cdref1, cbref2, cbref5;
		let state1 = 0, state2 = 0;

		const callback1 = (v, next) => { state1 = 1 + v };
		const callback2 = (v, next) => { state2 = 2 + v };
		const callback3 = (v, next) => { };
		const callback4 = (v, next) => { };

		const obj = { a: 10 };
		const callback5 = function (v) { this.a += v };

		ccd = new ChaincastDelegate();

		cdref1 = ccd.put(callback1);
		if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastDelegate (001.001)`));
		if (ccd.getCallbacks()[0] !== callback1) result.push(fail(`ChaincastDelegate (001.002)`));
		if (!callback1.__pbcdi) result.push(fail(`ChaincastDelegate (001.003)`));
		if (callback1.__pbcdi && !callback1.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (001.004)`));
		if (!ccd.has(cdref1)) result.push(fail(`ChaincastDelegate (001.007)`));
		if (!ccd.has(callback1)) result.push(fail(`ChaincastDelegate (001.008)`));

		ccd.remove(callback1);
		if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastDelegate (002.001)`));
		if (callback1.__pbcdi && callback1.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (002.002)`));
		if (ccd.has(cdref1)) result.push(fail(`ChaincastDelegate (002.003)`));
		if (ccd.has(callback1)) result.push(fail(`ChaincastDelegate (002.004)`));

		cbref5 = ccd.put(callback5.bind(obj));
		if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastDelegate (101.001)`));
		if (ccd.getCallbacks()[0] !== cbref5) result.push(fail(`ChaincastDelegate (101.002)`));
		if (!cbref5.__pbcdi) result.push(fail(`ChaincastDelegate (101.003)`));
		if (cbref5.__pbcdi && !cbref5.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (101.006)`));
		if (!ccd.has(cbref5)) result.push(fail(`ChaincastDelegate (101.007)`));

		ccd(6);
		if (obj.a !== 16) result.push(fail(`ChaincastDelegate (101.008)`));

		ccd.remove(cbref5);
		if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastDelegate (102.001)`));
		if (cbref5.__pbcdi && cbref5.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (102.002)`));
		if (ccd.has(cbref5)) result.push(fail(`ChaincastDelegate (102.003)`));

		cdref1 = ccd.put(callback1);
		ccd.remove(cdref1);
		if (ccd.getCallbacks().length !== 0) result.push(fail(`ChaincastDelegate (003.001)`));
		if (callback1.__pbcdi && callback1.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (003.002)`));
		if (ccd.has(cdref1)) result.push(fail(`ChaincastDelegate (003.003)`));
		if (ccd.has(callback1)) result.push(fail(`ChaincastDelegate (003.004)`));

		cdref1 = ccd.put(callback1);
		cbref2 = ccd.put(callback2);
		if (ccd.getCallbacks().length !== 2) result.push(fail(`ChaincastDelegate (004.001)`));
		if (ccd.getCallbacks()[1] !== callback1) result.push(fail(`ChaincastDelegate (004.0021)`));
		if (ccd.getCallbacks()[0] !== callback2) result.push(fail(`ChaincastDelegate (004.0022)`));
		if (!callback2.__pbcdi) result.push(fail(`ChaincastDelegate (004.003)`));
		if (callback2.__pbcdi && !callback2.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (004.004)`));
		if (callback2.__pbcdi && callback2.__pbcdi.has(ccd) !== true) result.push(fail(`ChaincastDelegate (004.006)`));
		if (!ccd.has(cbref2)) result.push(fail(`ChaincastDelegate (004.007)`));
		if (!ccd.has(callback2)) result.push(fail(`ChaincastDelegate (004.008)`));

		ccd(10);
		if (state1 !== 0) result.push(fail(`ChaincastDelegate (005.001)`, 0, state1));
		if (state2 !== 12) result.push(fail(`ChaincastDelegate (005.002)`, 12, state2));

		ccd = new ChaincastDelegate(callback3);
		if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastDelegate (006.001)`));
		if (ccd.getCallbacks()[0] !== callback3) result.push(fail(`ChaincastDelegate (006.002)`));
		if (!callback3.__pbcdi) result.push(fail(`ChaincastDelegate (006.003)`));
		if (callback3.__pbcdi && !callback3.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (006.004)`));
		if (!ccd.has(callback3)) result.push(fail(`ChaincastDelegate (006.005)`));
		ccd.remove(callback3);

		ccd = new ChaincastDelegate([callback3]);
		if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastDelegate (007.001)`));
		if (ccd.getCallbacks()[0] !== callback3) result.push(fail(`ChaincastDelegate (007.002)`));
		if (!callback3.__pbcdi) result.push(fail(`ChaincastDelegate (007.003)`));
		if (callback3.__pbcdi && !callback3.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (007.004)`));
		if (!ccd.has(callback3)) result.push(fail(`ChaincastDelegate (007.005)`));
		ccd.remove(callback3);

		ccd = new ChaincastDelegate([callback3], callback4);
		if (ccd.getCallbacks().length !== 2) result.push(fail(`ChaincastDelegate (008.001)`));
		if (ccd.getCallbacks()[1] !== callback3) result.push(fail(`ChaincastDelegate (008.002)`));
		if (ccd.getCallbacks()[0] !== callback4) result.push(fail(`ChaincastDelegate (008.003)`));
		if (!callback3.__pbcdi) result.push(fail(`ChaincastDelegate (008.004)`));
		if (callback3.__pbcdi && !callback3.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (008.005)`));
		if (!ccd.has(callback3)) result.push(fail(`ChaincastDelegate (008.006)`));
		if (!callback4.__pbcdi) result.push(fail(`ChaincastDelegate (008.007)`));
		if (callback4.__pbcdi && !callback4.__pbcdi.has(ccd)) result.push(fail(`ChaincastDelegate (008.008)`));
		if (!ccd.has(callback4)) result.push(fail(`ChaincastDelegate (008.009)`));
		ccd.remove(callback3);
		ccd.remove(callback4);

		ccd = new ChaincastDelegate(callback1, callback2, callback3, callback4);
		ccd.lift();
		ccd.lift();
		ccd.lift();
		if (ccd.getCallbacks().length !== 1) result.push(fail(`ChaincastDelegate (018.001)`));
		if (ccd.getCallbacks()[0] !== callback1) result.push(fail(`ChaincastDelegate (018.002)`));
		ccd.lift();

		let stateStack = "";
		let callbackBottom = (v, next) => { stateStack += `bottom(${v})`; next && next(v); };
		let callbackMiddle = (v, next) => { stateStack += `middle(${v})`; next && next(v); };
		let callbackTop = (v, next) => { stateStack += `top(${v})`; next && next(v); };
		ccd = new ChaincastDelegate(callbackBottom, callbackMiddle, callbackTop);
		ccd(666);
		if (stateStack !== "top(666)middle(666)bottom(666)") result.push(fail(`ChaincastDelegate (009.001)`, "top(666)middle(666)bottom(666)", stateStack));

		stateStack = "";
		callbackBottom = (v, next) => { stateStack += `bottom(${v})`; next && next(v); };
		callbackMiddle = (v, next) => { stateStack += `middle(${v})`; };
		callbackTop = (v, next) => { stateStack += `top(${v})`; next && next(v); };
		ccd = new ChaincastDelegate(callbackBottom, callbackMiddle, callbackTop);
		ccd(666);
		if (stateStack !== "top(666)middle(666)") result.push(fail(`ChaincastDelegate (009.002)`, "top(666)middle(666)", stateStack));

		stateStack = "";
		callbackBottom = (v, next) => { stateStack += `bottom(${v})`; next && next(v); };
		callbackMiddle = (v, next) => { stateStack += `middle(${v})`; next && next(v); };
		callbackTop = (v, next) => { stateStack += `top(${v})`; };
		ccd = new ChaincastDelegate(callbackBottom, callbackMiddle, callbackTop);
		ccd(666);
		if (stateStack !== "top(666)") result.push(fail(`ChaincastDelegate (009.003)`, "top(666)", stateStack));

		callbackBottom = (v, next) => { return `bottom(${v})` + (next ? next(v) : ""); };
		callbackMiddle = (v, next) => { return `middle(${v})` + (next ? next(v) : ""); };
		callbackTop = (v, next) => { return `top(${v})` + (next ? next(v) : ""); };
		ccd = new ChaincastDelegate(callbackBottom, callbackMiddle, callbackTop);
		stateStack = ccd(666);
		if (stateStack !== "top(666)middle(666)bottom(666)") result.push(fail(`ChaincastDelegate (009.004)`, "top(666)middle(666)bottom(666)", stateStack));
	}
}

module.exports.UnitTests_ChaincastDelegate = module.exports;
