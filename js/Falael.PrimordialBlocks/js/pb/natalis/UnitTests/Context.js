//	R0Q2/daniel/20230827
"use strict";

const { timens, sleep } = require("-/pb/natalis/010/Context.js");

module.exports =

class UnitTests_BoyerMoore
{
	//	Category: Unit test
	//	Function: Run unit tests for `BoyerMoore` static class and nested class methods.
	static async unitTest_timens(result)
	{
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let ms;
		let outcome, outcome2;

		outcome = timens();
		if (!Number.isInteger(outcome)) result.push(fail("Context.timens (01)", "integer", outcome));
		outcome2 = timens();
		if (outcome2 - outcome < 0) result.push(fail("Context.timens (02)", ">= 0", outcome2 - outcome));
		
		outcome = timens();
		outcome2 = timens(outcome);
		if (outcome2 < 0) result.push(fail("Context.timens (03)", ">= 0", outcome2));

		ms = 1000;
		outcome = timens();
		await sleep(ms);
		outcome2 = timens(outcome);
		if (outcome2 < ms * 1e6) result.push(fail("Context.timens (04)", `>= ${ms * 1e6}`, outcome2));
	}
}

module.exports.UnitTests_BoyerMoore = module.exports;
