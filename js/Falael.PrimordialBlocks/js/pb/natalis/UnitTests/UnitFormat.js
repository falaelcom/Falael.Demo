//	R0Q2/daniel/20230915
"use strict";

const { UnitFormat } = require("-/pb/natalis/012/UnitFormat.js");

module.exports =

class UnitTests_UnitFormat
{
	//	Category: Unit test
	//	Function: Run unit tests for all class methods.
	static unitTest_UnitFormat(result)
	{
		let value, base, unitLabels, roundingDefs, unitOverflowDecimals, expected, outcome;

		const fail = testName => result.push({ testName, expected, outcome, base, unitLabels, roundingDefs, unitOverflowDecimals });

		test_magnitude();

		function test_magnitude()
		{
			//	001.* - general tests
			{
				base = 1000;
				unitLabels = ["", "KB", "MB", "GB", "TB", "PB", "EB"];
				roundingDefs = [10, 2];
				unitOverflowDecimals = 0;

				value = 0, expected = "0", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.001)");

				value = 0, expected = "0", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.001)");

				value = 1, expected = "1", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.002)");

				value = 10, expected = "10", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.002.01)");

				value = 999, expected = "999", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.003)");

				value = 1000, expected = "1KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.004)");

				value = 1001, expected = "1KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.005)");

				value = 1500, expected = "1.5KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.006)");

				value = 1550, expected = "1.55KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.007)");

				value = 1555, expected = "1.55KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.008)");

				value = 9999, expected = "9.99KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.009)");

				value = 10000, expected = "10KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.010)");

				value = 10500, expected = "10KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.011)");

				value = 999999, expected = "999KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.012)");

				value = 1000000, expected = "1MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.013)");

				value = 1555000, expected = "1.55MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.014)");

				value = 9999999, expected = "9.99MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.014.001)");

				value = 999999999, expected = "999MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.015)");

				value = 1000000000, expected = "1GB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.016)");

				value = 1000000000000, expected = "1TB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.017)");

				value = 1000000000000000, expected = "1PB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.018)");

				value = 1000000000000000000, expected = "1EB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.019)");

				value = 999 * 1000000000000000000, expected = "999EB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.020)");

				value = 1000 * 1000000000000000000, expected = "1000EB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.021)");

				value = 1500 * 1000000000000000000, expected = "1500EB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (001.022)");
			}

			//	002.* - floating point tests
			{
				base = 1000;
				unitLabels = ["", "KB", "MB", "GB", "TB", "PB", "EB"];
				roundingDefs = [10, 2, 100, 1];
				unitOverflowDecimals = 0;

				value = 0.5, expected = "0.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.001)");

				value = 0.55, expected = "0.55", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.002)");

				value = 0.555, expected = "0.55", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.003)");

				value = 10.5, expected = "10.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.004)");

				value = 10.55, expected = "10.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.005)");

				value = 999.9, expected = "999", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.006)");

				value = 1000.5, expected = "1KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.007)");

				value = 1500.5, expected = "1.5KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (002.008)");
			}

			//	003.* - base
			{
				unitLabels = ["", "K", "M", "G", "T", "P", "E"];
				roundingDefs = [10, 2];
				unitOverflowDecimals = 0;

				base = 1000; value = 1000, expected = "1K", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (003.001)");

				base = 1024; value = 1000, expected = "1000", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (003.002)");

				base = 1024; value = 1024, expected = "1K", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (003.003)");

				base = 300; value = 1000, expected = "3.33K", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (003.004)");
			}

			//	004.* - roundingDefs
			{
				base = 1000;
				unitLabels = ["", "KB", "MB", "GB", "TB", "PB", "EB"];
				unitOverflowDecimals = 0;

				roundingDefs = [];

				value = 0, expected = "0", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.001)");

				value = 999, expected = "999", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.001.001)");

				value = 1000, expected = "1KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.001.002)");

				value = 1500, expected = "1KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.001.003)");

				value = 999999, expected = "999KB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.001.004)");


				roundingDefs = [1, 3, 10, 2, 100, 1]; 

				value = 0, expected = "0", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002)");

				value = 0.5, expected = "0.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.001)");

				value = 0.55, expected = "0.55", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.002)");

				value = 0.555, expected = "0.555", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.003)");

				value = 0.5555, expected = "0.555", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.004)");

				value = 1.5, expected = "1.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.005)");

				value = 1.55, expected = "1.55", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.006)");

				value = 1.555, expected = "1.55", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.007)");

				value = 10.5, expected = "10.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.008)");

				value = 10.55, expected = "10.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.002.009)");


				value = 99500000000, expected = "99.5GB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.003.001)");

				value = 100500000000, expected = "100GB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (004.003.002)");
			}

			//	005.* - unitOverflowDecimals
			{
				base = 1000;
				unitLabels = ["", "KB", "MB"];
				roundingDefs = [10, 2];
				
				unitOverflowDecimals = 1; 

				value = 1000000, expected = "1MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.001)");

				value = 9999999, expected = "9.99MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.002)");

				value = 10000000, expected = "10MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.003)");

				value = 100000000, expected = "100MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.004)");

				value = 1000000000, expected = "1000MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.005)");

				value = 1500000000, expected = "1500MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.006)");

				value = 1500500000, expected = "1500.5MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.007)");

				value = 1500550000, expected = "1500.5MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.008)");


				unitOverflowDecimals = 2; 

				value = 1500550000, expected = "1500.55MB", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (005.009)");
			}

			//	006.* - negative numbers tests
			{
				base = 1000;
				unitLabels = ["", "KB", "MB", "GB", "TB", "PB", "EB"];
				roundingDefs = [10, 2, 100, 1];
				unitOverflowDecimals = 0;

				value = -0.5, expected = "-0.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (006.001)");

				value = -1, expected = "-1", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (006.002)");

				value = -10, expected = "-10", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (006.003)");

				value = -10.5, expected = "-10.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (006.004)");

				value = -10.55, expected = "-10.5", outcome = UnitFormat.magnitude(value, base, unitLabels, roundingDefs, unitOverflowDecimals);
				if (expected !== outcome) fail("magnitude (006.005)");
			}
		}
	}
}

module.exports.UnitTests_Schema = module.exports;
