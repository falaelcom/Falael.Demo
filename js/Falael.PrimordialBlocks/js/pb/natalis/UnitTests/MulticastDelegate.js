//	R0Q2/daniel/20220505
"use strict";

const { MulticastDelegate } = require("-/pb/natalis/012/MulticastDelegate.js");

module.exports =

class UnitTests_MulticastDelegate
{
	//	Category: Unit test
	//	Function: Run unit tests for `MulticastDelegate` class interface.
	static unitTest_MulticastDelegate(result)
	{
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let mcd;
		let cdref1, cbref2, cbref5;
		let state1 = 0, state2 = 0;

		const callback1 = v => { state1 = 1 + v };
		const callback2 = v => { state2 = 2 + v };
		const callback3 = v => { };
		const callback4 = v => { };

		const obj = { a: 10 };
		const callback5 = function (v) { this.a += v };

		mcd = new MulticastDelegate();

		cdref1 = mcd.add(callback1);
		if (mcd.getCallbacks().length !== 1) result.push(fail(`MulticastDelegate (001.001)`));
		if (mcd.getCallbacks()[0] !== callback1) result.push(fail(`MulticastDelegate (001.002)`));
		if (!callback1.__pbmdi) result.push(fail(`MulticastDelegate (001.003)`));
		if (callback1.__pbmdi && !callback1.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (001.004)`));
		if (!mcd.has(cdref1)) result.push(fail(`MulticastDelegate (001.007)`));
		if (!mcd.has(callback1)) result.push(fail(`MulticastDelegate (001.008)`));

		mcd.remove(callback1);
		if (mcd.getCallbacks().length !== 0) result.push(fail(`MulticastDelegate (002.001)`));
		if (callback1.__pbmdi && callback1.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (002.002)`));
		if (mcd.has(cdref1)) result.push(fail(`MulticastDelegate (002.003)`));
		if (mcd.has(callback1)) result.push(fail(`MulticastDelegate (002.004)`));

		cbref5 = mcd.add(callback5.bind(obj));
		if (mcd.getCallbacks().length !== 1) result.push(fail(`MulticastDelegate (101.001)`));
		if (mcd.getCallbacks()[0] !== cbref5) result.push(fail(`MulticastDelegate (101.002)`));
		if (!cbref5.__pbmdi) result.push(fail(`MulticastDelegate (101.003)`));
		if (cbref5.__pbmdi && !cbref5.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (101.006)`));
		if (!mcd.has(cbref5)) result.push(fail(`MulticastDelegate (101.007)`));

		mcd(6);
		if (obj.a !== 16) result.push(fail(`MulticastDelegate (101.008)`));

		mcd.remove(cbref5);
		if (mcd.getCallbacks().length !== 0) result.push(fail(`MulticastDelegate (102.001)`));
		if (cbref5.__pbmdi && cbref5.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (102.002)`));
		if (mcd.has(cbref5)) result.push(fail(`MulticastDelegate (102.003)`));

		cdref1 = mcd.add(callback1);
		mcd.remove(cdref1);
		if (mcd.getCallbacks().length !== 0) result.push(fail(`MulticastDelegate (003.001)`));
		if (callback1.__pbmdi && callback1.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (003.002)`));
		if (mcd.has(cdref1)) result.push(fail(`MulticastDelegate (003.003)`));
		if (mcd.has(callback1)) result.push(fail(`MulticastDelegate (003.004)`));

		cdref1 = mcd.add(callback1);
		cbref2 = mcd.add(callback2);
		if (mcd.getCallbacks().length !== 2) result.push(fail(`MulticastDelegate (004.001)`));
		if (mcd.getCallbacks()[0] !== callback1) result.push(fail(`MulticastDelegate (004.0021)`));
		if (mcd.getCallbacks()[1] !== callback2) result.push(fail(`MulticastDelegate (004.0022)`));
		if (!callback2.__pbmdi) result.push(fail(`MulticastDelegate (004.003)`));
		if (callback2.__pbmdi && !callback2.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (004.004)`));
		if (callback2.__pbmdi && callback2.__pbmdi.has(mcd) !== true) result.push(fail(`MulticastDelegate (004.006)`));
		if (!mcd.has(cbref2)) result.push(fail(`MulticastDelegate (004.007)`));
		if (!mcd.has(callback2)) result.push(fail(`MulticastDelegate (004.008)`));

		mcd(10);
		if (state1 !== 11) result.push(fail(`MulticastDelegate (005.001)`));
		if (state2 !== 12) result.push(fail(`MulticastDelegate (005.002)`));

		mcd = new MulticastDelegate(callback3);
		if (mcd.getCallbacks().length !== 1) result.push(fail(`MulticastDelegate (006.001)`));
		if (mcd.getCallbacks()[0] !== callback3) result.push(fail(`MulticastDelegate (006.002)`));
		if (!callback3.__pbmdi) result.push(fail(`MulticastDelegate (006.003)`));
		if (callback3.__pbmdi && !callback3.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (006.004)`));
		if (!mcd.has(callback3)) result.push(fail(`MulticastDelegate (006.005)`));
		mcd.remove(callback3);

		mcd = new MulticastDelegate([callback3]);
		if (mcd.getCallbacks().length !== 1) result.push(fail(`MulticastDelegate (007.001)`));
		if (mcd.getCallbacks()[0] !== callback3) result.push(fail(`MulticastDelegate (007.002)`));
		if (!callback3.__pbmdi) result.push(fail(`MulticastDelegate (007.003)`));
		if (callback3.__pbmdi && !callback3.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (007.004)`));
		if (!mcd.has(callback3)) result.push(fail(`MulticastDelegate (007.005)`));
		mcd.remove(callback3);

		mcd = new MulticastDelegate([callback3], callback4);
		if (mcd.getCallbacks().length !== 2) result.push(fail(`MulticastDelegate (008.001)`));
		if (mcd.getCallbacks()[0] !== callback3) result.push(fail(`MulticastDelegate (008.002)`));
		if (mcd.getCallbacks()[1] !== callback4) result.push(fail(`MulticastDelegate (008.003)`));
		if (!callback3.__pbmdi) result.push(fail(`MulticastDelegate (008.004)`));
		if (callback3.__pbmdi && !callback3.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (008.005)`));
		if (!mcd.has(callback3)) result.push(fail(`MulticastDelegate (008.006)`));
		if (!callback4.__pbmdi) result.push(fail(`MulticastDelegate (008.007)`));
		if (callback4.__pbmdi && !callback4.__pbmdi.has(mcd)) result.push(fail(`MulticastDelegate (008.008)`));
		if (!mcd.has(callback4)) result.push(fail(`MulticastDelegate (008.009)`));
		mcd.remove(callback3);
		mcd.remove(callback4);
	}
}

module.exports.UnitTests_MulticastDelegate = module.exports;
