//	R0Q2/daniel/20220505
"use strict";

const { BoyerMoore } = require("-/pb/natalis/012/BoyerMoore.js");

module.exports =

class UnitTests_BoyerMoore
{
	//	Category: Unit test
	//	Function: Run unit tests for `BoyerMoore` static class and nested class methods.
	static unitTest_BoyerMoore(result)
	{
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let outcome;
		let expected;

		//	BoyerMoore.search
		let subj;
		let pat;

		//	BoyerMoore.search - no offset
		{
			subj = new Uint8Array();
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (10)", expected, outcome));

			subj = new Uint8Array([1]);
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (20)", expected, outcome));

			subj = new Uint8Array([1]);
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (30)", expected, outcome));

			subj = new Uint8Array([1, 1]);
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (32)", expected, outcome));

			subj = new Uint8Array([1, 2]);
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (40)", expected, outcome));

			subj = new Uint8Array([1, 2]);
			pat = new Uint8Array([2]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (50)", expected, outcome));

			subj = new Uint8Array([1, 2]);
			pat = new Uint8Array([1, 2]);
			expected = 0;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (60)", expected, outcome));

			subj = new Uint8Array([0, 1, 2]);
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (70)", expected, outcome));

			subj = new Uint8Array([0, 1, 1, 1]);
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (80)", expected, outcome));

			subj = new Uint8Array([0, 1, 2, 1]);
			pat = new Uint8Array([1, 1]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (90)", expected, outcome));

			subj = new Uint8Array([0, 1, 2, 1]);
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (100)", expected, outcome));

			subj = new Uint8Array([0, 2, 1, 1]);
			pat = new Uint8Array([2, 1, 1]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (1011)", expected, outcome));

			subj = new Uint8Array([2, 2, 1, 1]);
			pat = new Uint8Array([2, 1, 1]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (1012)", expected, outcome));

			subj = new Uint8Array([0]);
			pat = new Uint8Array([0, 1]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (110)", expected, outcome));

			subj = new Uint8Array([1, 2, 0, 1]);
			pat = new Uint8Array([0, 1, 2]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (120)", expected, outcome));

			subj = new Uint8Array([1, 2, 0, 1]);
			pat = new Uint8Array([0, 1, 2, 3, 4]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (130)", expected, outcome));
		}

		//	BoyerMoore.search - with offset
		{
			subj = new Uint8Array();
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1010)", expected, outcome));

			subj = new Uint8Array([1]);
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1020)", expected, outcome));

			subj = new Uint8Array([1]);
			pat = new Uint8Array([1]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1030)", expected, outcome));

			subj = new Uint8Array([0, 1]);
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1035)", expected, outcome));

			subj = new Uint8Array([1, 2]);
			pat = new Uint8Array([1]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1040)", expected, outcome));

			subj = new Uint8Array([0, 1, 2]);
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1045)", expected, outcome));

			subj = new Uint8Array([1, 2]);
			pat = new Uint8Array([2]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1050)", expected, outcome));

			subj = new Uint8Array([1, 2]);
			pat = new Uint8Array([1, 2]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1060)", expected, outcome));

			subj = new Uint8Array([0, 1, 2]);
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1065)", expected, outcome));

			subj = new Uint8Array([0, 1, 2]);
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1070)", expected, outcome));

			subj = new Uint8Array([0, 1, 2]);
			pat = new Uint8Array([1, 2]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.search (1075)", expected, outcome));

			subj = new Uint8Array([0, 1, 1, 1]);
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1080)", expected, outcome));

			subj = new Uint8Array([0, 1, 1, 1]);
			pat = new Uint8Array([1, 1]);
			expected = 2;
			outcome = BoyerMoore.search(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.search (1085)", expected, outcome));

			subj = new Uint8Array([0, 1, 2, 1]);
			pat = new Uint8Array([1, 1]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (1090)", expected, outcome));

			subj = new Uint8Array([0, 1, 2, 1]);
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (10100)", expected, outcome));

			subj = new Uint8Array([0]);
			pat = new Uint8Array([0, 1]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (10110)", expected, outcome));

			subj = new Uint8Array([1, 2, 0, 1]);
			pat = new Uint8Array([0, 1, 2]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (10120)", expected, outcome));

			subj = new Uint8Array([1, 2, 0, 1]);
			pat = new Uint8Array([0, 1, 2, 3, 4]);
			expected = -1;
			outcome = BoyerMoore.search(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.search (10130)", expected, outcome));
		}

		//	BoyerMoore.searchEx - no offset
		{
			subj = [new Uint8Array([1])];
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2020)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([1])];
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2025)", expected, outcome));

			subj = [new Uint8Array([1])];
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2030)", expected, outcome));

			subj = [new Uint8Array([1, 1])];
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2032)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([1])];
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2035)", expected, outcome));

			subj = [new Uint8Array([1, 1]), new Uint8Array([1, 1])];
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2037)", expected, outcome));

			subj = [new Uint8Array([1, 2])];
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2040)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([1]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2045)", expected, outcome));

			subj = [new Uint8Array([1, 2])];
			pat = new Uint8Array([2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2050)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2055)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([1, 2])];
			pat = new Uint8Array([2]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2057)", expected, outcome));

			subj = [new Uint8Array([1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2060)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2065)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([1, 2]);
			expected = 0;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2067)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2070)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2072)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2074)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2076)", expected, outcome));

			subj = [new Uint8Array([0, 1, 1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2080)", expected, outcome));

			subj = [new Uint8Array([0, 1, 1]), new Uint8Array([1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20801)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20802)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20803)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([1, 1]), new Uint8Array([1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20804)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 1, 1]), new Uint8Array([1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20805)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1]), new Uint8Array([1, 1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20806)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2, 1])];
			pat = new Uint8Array([1, 1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (2090)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2, 1])];
			pat = new Uint8Array([1, 1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20901)", expected, outcome));

			subj = new Uint8Array([0, 1, 2, 1]);
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.search(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.search (20100)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20100)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (201001)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (201002)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2]), new Uint8Array([1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (201003)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (201004)", expected, outcome));

			subj = [new Uint8Array([2, 2, 1, 1])];
			pat = new Uint8Array([2, 1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20101)", expected, outcome));

			subj = [new Uint8Array([2]), new Uint8Array([2, 1, 1])];
			pat = new Uint8Array([2, 1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20101)", expected, outcome));

			subj = [new Uint8Array([2, 2]), new Uint8Array([1, 1])];
			pat = new Uint8Array([2, 1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (201011)", expected, outcome));

			subj = [new Uint8Array([0, 0]), new Uint8Array([1, 1]), new Uint8Array([2, 2]), new Uint8Array([1, 1])];
			pat = new Uint8Array([2, 1, 1]);
			expected = 5;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20102)", expected, outcome));

			subj = [new Uint8Array([0])];
			pat = new Uint8Array([0, 1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20110)", expected, outcome));

			subj = [new Uint8Array([1, 2, 0, 1])];
			pat = new Uint8Array([0, 1, 2]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20120)", expected, outcome));

			subj = [new Uint8Array([1, 2]), new Uint8Array([0, 1])];
			pat = new Uint8Array([0, 1, 2]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (20125)", expected, outcome));
		}

		//	BoyerMoore.searchEx - with offset
		{
			subj = [new Uint8Array([1])];
			pat = new Uint8Array();
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3020)", expected, outcome));

			subj = [new Uint8Array([1])];
			pat = new Uint8Array([1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3030)", expected, outcome));

			subj = [new Uint8Array([0, 1])];
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3035)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1])];
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30351)", expected, outcome));

			subj = [new Uint8Array([1, 2])];
			pat = new Uint8Array([1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3040)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30401)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2])];
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3045)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2])];
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30451)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2])];
			pat = new Uint8Array([1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30452)", expected, outcome));

			subj = [new Uint8Array([1, 2])];
			pat = new Uint8Array([2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3050)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30501)", expected, outcome));

			subj = [new Uint8Array([1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3060)", expected, outcome));

			subj = [new Uint8Array([1]), new Uint8Array([2])];
			pat = new Uint8Array([1, 2]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30601)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3065)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30651)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30652)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2])];
			pat = new Uint8Array([1, 2]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3075)", expected, outcome));

			subj = [new Uint8Array([0, 1, 1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3080)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30801)", expected, outcome));

			subj = [new Uint8Array([0, 1, 1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (3085)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([1, 1])];
			pat = new Uint8Array([1, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30851)", expected, outcome));

			subj = [new Uint8Array([0, 1, 2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30100)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (301001)", expected, outcome));

			subj = [new Uint8Array([0, 1]), new Uint8Array([2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (301002)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (301002)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = 2;
			outcome = BoyerMoore.searchEx(subj, pat, 2); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (301002)", expected, outcome));

			subj = [new Uint8Array([0]), new Uint8Array([1, 2, 1])];
			pat = new Uint8Array([2, 1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 3); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (301002)", expected, outcome));

			subj = [new Uint8Array([0])];
			pat = new Uint8Array([0, 1]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30110)", expected, outcome));

			subj = [new Uint8Array([1, 2, 0, 1])];
			pat = new Uint8Array([0, 1, 2]);
			expected = -1;
			outcome = BoyerMoore.searchEx(subj, pat, 1); if (expected !== outcome) result.push(fail("BoyerMoore.searchEx (30120)", expected, outcome));
		}
	}
}

module.exports.UnitTests_BoyerMoore = module.exports;
