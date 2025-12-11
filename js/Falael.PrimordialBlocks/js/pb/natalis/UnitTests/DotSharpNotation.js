//	R0Q2/daniel/20220505
"use strict";

const { buf } = require("-/pb/natalis/013/Compound.js");
const { DotSharpNotation } = require("-/pb/natalis/014/DotSharpNotation.js");

module.exports =

class UnitTests_DotSharpNotation
{
	//	Category: Unit test
	//	Function: Run unit tests for `DotSharpNotation` static class methods.
	static unitTest_DotSharpNotation(result)
	{
		let obj, obj2;
		let expected;
		let outcome;

		const test = (testName) => { if (JSON.stringify(outcome) !== JSON.stringify(expected)) result.push({ testName, fact: `${JSON.stringify(outcome)} is not ${JSON.stringify(expected)}`, expected, outcome }) };

		test_DotSharpNotation_encodeComponent();
		test_DotSharpNotation_decodeComponent();
		test_DotSharpNotation_parse();
		test_DotSharpNotation_parseHof();
		test_DotSharpNotation_parse_decodeComponent();
		test_DotSharpNotation_append();

		function test_DotSharpNotation_encodeComponent()
		{
			obj = ""; expected = "\\0"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.001)");
			obj = "\\"; expected = "\\\\"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.002)");
			obj = "."; expected = "\\."; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.003)");
			obj = "#"; expected = "\\#"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.004)");
			obj = "\\\\"; expected = "\\\\\\\\"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.005)");
			obj = ".."; expected = "\\.\\."; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.006)");
			obj = "##"; expected = "\\#\\#"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (001.007)");

			obj = "\\0"; expected = "\\\\0"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002.001)");
			obj = "\\\\"; expected = "\\\\\\\\"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002.002)");
			obj = "\\."; expected = "\\\\\\."; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002.003)");
			obj = "\\#"; expected = "\\\\\\#"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002.004)");

			obj = "\\00"; expected = "\\\\00"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002a.001)");
			obj = "\\\\\\"; expected = "\\\\\\\\\\\\"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002a.002)");
			obj = "\\.."; expected = "\\\\\\.\\."; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002a.003)");
			obj = "\\##"; expected = "\\\\\\#\\#"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (002a.004)");

			obj = 0; expected = 0; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (003.001)");
			obj = 1; expected = 1; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (003.001a)");
			obj = "a"; expected = "a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (003.002)");
			obj = ".a"; expected = "\\.a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (003.004)");
			obj = "#a"; expected = "\\#a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (003.005)");
			obj = "\\a"; expected = "\\\\a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (003.006)");

			obj = "a."; expected = "a\\."; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (004.001)");
			obj = "a#"; expected = "a\\#"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (004.002)");
			obj = "a\\"; expected = "a\\\\"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (004.003)");

			obj = "a.a"; expected = "a\\.a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (005.001)");
			obj = "a#a"; expected = "a\\#a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (005.002)");
			obj = "a\\a"; expected = "a\\\\a"; outcome = DotSharpNotation.encodeComponent(obj); test("DotSharpNotation.encodeComponent (005.003)");
		}

		function test_DotSharpNotation_decodeComponent()
		{
			obj = ""; expected = ""; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.001a)");
			obj = 0; expected = 0; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.001b)");
			obj = 1; expected = 1; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.001c)");
			obj = "\\0"; expected = ""; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.002)");
			obj = "\\"; expected = "\\"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.003)");
			obj = "\\\\"; expected = "\\"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.004)");
			obj = "."; expected = "."; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.005)");
			obj = "\\."; expected = "."; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.006)");
			obj = "#"; expected = "#"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.007)");
			obj = "\\#"; expected = "#"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.008)");
			obj = "\\a"; expected = "a"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (001.009)");

			obj = "\\\\0"; expected = "\\0"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (002.001)");
			obj = "\\\\."; expected = "\\."; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (002.002)");
			obj = "\\\\#"; expected = "\\#"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (002.003)");
			obj = "\\\\a"; expected = "\\a"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (002.004)");

			obj = "x\\0"; expected = "x0"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (003.001)");
			obj = "x\\."; expected = "x."; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (003.002)");
			obj = "x\\#"; expected = "x#"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (003.003)");
			obj = "x\\\\"; expected = "x\\"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (003.004)");
			obj = "x\\a"; expected = "xa"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (003.005)");

			obj = "\\0x"; expected = "0x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (004.001)");
			obj = "\\.x"; expected = ".x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (004.002)");
			obj = "\\#x"; expected = "#x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (004.003)");
			obj = "\\\\x"; expected = "\\x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (004.004)");
			obj = "\\ax"; expected = "ax"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (004.005)");

			obj = "y\\0x"; expected = "y0x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (005.001)");
			obj = "y\\.x"; expected = "y.x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (005.002)");
			obj = "y\\#x"; expected = "y#x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (005.003)");
			obj = "y\\\\x"; expected = "y\\x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (005.004)");
			obj = "y\\ax"; expected = "yax"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (005.005)");

			obj = "y\\0\\0x"; expected = "y00x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (006.001)");
			obj = "y\\.\\.x"; expected = "y..x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (006.002)");
			obj = "y\\#\\#x"; expected = "y##x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (006.003)");
			obj = "y\\\\\\\\x"; expected = "y\\\\x"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (006.004)");
			obj = "y\\a\\ax"; expected = "yaax"; outcome = DotSharpNotation.decodeComponent(obj); test("DotSharpNotation.decodeComponent (006.005)");
		}

		function test_DotSharpNotation_parseHof()
		{
			const componentCallback = v => outcome.push(v);

			obj = null; expected = []; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.001)");
			obj = ""; expected = ["\\0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.001a)");
			obj = 0; expected = [0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.001b)");
			obj = 1; expected = [1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.001c)");
			obj = "\\0"; expected = ["\\0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.002)");
			obj = "\\"; expected = ["\\"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.002a)");
			obj = "0"; expected = ["0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.002b)");
			obj = "\\0\\0"; expected = ["\\0\\0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.002c)");
			obj = "."; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.003)");
			obj = "\\0."; expected = ["\\0", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.004)");
			obj = "\\0.\\0"; expected = ["\\0", "\\0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.005)");
			obj = ".\\0"; expected = ["", "\\0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (001.006)");

			obj = "\\."; expected = ["\\."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.001)");
			obj = "\\.0"; expected = ["\\.0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.002)");
			obj = "\\.\\."; expected = ["\\.\\."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.003)");
			obj = "\\.\\.\\."; expected = ["\\.\\.\\."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.004)");
			obj = "\\.x"; expected = ["\\.x"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.005)");
			obj = "x\\."; expected = ["x\\."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.006)");
			obj = "x\\.x"; expected = ["x\\.x"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.007)");
			obj = "\\.x\\."; expected = ["\\.x\\."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.008)");
			obj = "\\.."; expected = ["\\.", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.009)");
			obj = ".\\."; expected = ["", "\\."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.010)");
			obj = ".\\.."; expected = ["", "\\.", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (002.011)");

			obj = ".a"; expected = ["", "a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.001)");
			obj = "\\0.a"; expected = ["\\0", "a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.002)");
			obj = "a."; expected = ["a", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.003)");
			obj = "a.\\0"; expected = ["a", "\\0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.004)");
			obj = "a.b"; expected = ["a", "b"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.005)");
			obj = ".0"; expected = ["", "0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.006)");
			obj = "\\0.0"; expected = ["\\0", "0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.007)");
			obj = "."; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.008)");
			obj = ".."; expected = ["", "", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (0021.009)");

			obj = "#"; expected = ["#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.001)");
			obj = "#0"; expected = [0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.002)");
			obj = "#1"; expected = [1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.003)");
			obj = "0#0"; expected = ["0", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.004)");
			obj = "\\0#0"; expected = ["\\0", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.005)");
			obj = "#0."; expected = [0, ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.006)");
			obj = "#0#1"; expected = [0, 1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.007)");
			obj = "a#0"; expected = ["a", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.008)");

			obj = ".#0"; expected = ["", "", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.009)");
			obj = "\\.#0"; expected = ["\\.", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.010)");
			obj = "\\.\\#0"; expected = ["\\.\\#0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.011)");
			obj = "#0#"; expected = ["#0#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.012)");
			obj = "#0\\#"; expected = ["#0\\#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (003.013)");

			obj = "\\#"; expected = ["\\#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.001)");
			obj = "\\#1"; expected = ["\\#1"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.002)");
			obj = "\\##1"; expected = ["\\#", 1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.003)");
			obj = "##"; expected = ["##"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.004)");
			obj = "#."; expected = ["#", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.005)");
			obj = "#.a"; expected = ["#", "a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.006)");
			obj = ".#."; expected = ["", "#", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.007)");
			obj = ".\\#."; expected = ["", "\\#", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.008)");
			obj = "a#1b#2"; expected = ["a", 1, 2]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.009)");
			obj = "a#1b#2a"; expected = ["a#1b#2a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.010)");
			obj = "a#1.b#9"; expected = ["a", 1, "b", 9]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parseHof (004.011)");
		}

		function test_DotSharpNotation_parse()
		{
			obj = null; expected = []; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.001)");
			obj = ""; expected = ["\\0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.001a)");
			obj = 0; expected = [0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.001b)");
			obj = 1; expected = [1]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.001c)");
			obj = "\\0"; expected = ["\\0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.002)");
			obj = "\\"; expected = ["\\"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.002a)");
			obj = "0"; expected = ["0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.002b)");
			obj = "\\0\\0"; expected = ["\\0\\0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.002c)");
			obj = "."; expected = ["", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.003)");
			obj = "\\0."; expected = ["\\0", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.004)");
			obj = "\\0.\\0"; expected = ["\\0", "\\0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.005)");
			obj = ".\\0"; expected = ["", "\\0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (001.006)");

			obj = "\\."; expected = ["\\."]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.001)");
			obj = "\\.0"; expected = ["\\.0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.002)");
			obj = "\\.\\."; expected = ["\\.\\."]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.003)");
			obj = "\\.\\.\\."; expected = ["\\.\\.\\."]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.004)");
			obj = "\\.x"; expected = ["\\.x"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.005)");
			obj = "x\\."; expected = ["x\\."]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.006)");
			obj = "x\\.x"; expected = ["x\\.x"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.007)");
			obj = "\\.x\\."; expected = ["\\.x\\."]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.008)");
			obj = "\\.."; expected = ["\\.", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.009)");
			obj = ".\\."; expected = ["", "\\."]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.010)");
			obj = ".\\.."; expected = ["", "\\.", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (002.011)");

			obj = ".a"; expected = ["", "a"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.001)");
			obj = "\\0.a"; expected = ["\\0", "a"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.002)");
			obj = "a."; expected = ["a", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.003)");
			obj = "a.\\0"; expected = ["a", "\\0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.004)");
			obj = "a.b"; expected = ["a", "b"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.005)");
			obj = ".0"; expected = ["", "0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.006)");
			obj = "\\0.0"; expected = ["\\0", "0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.007)");
			obj = "."; expected = ["", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.008)");
			obj = ".."; expected = ["", "", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (0021.009)");

			obj = "#"; expected = ["#"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.001)");
			obj = "#0"; expected = [0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.002)");
			obj = "#1"; expected = [1]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.003)");
			obj = "0#0"; expected = ["0", 0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.004)");
			obj = "\\0#0"; expected = ["\\0", 0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.005)");
			obj = "#0."; expected = [0, ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.006)");
			obj = "#0#1"; expected = [0, 1]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.007)");
			obj = "a#0"; expected = ["a", 0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.008)");

			obj = ".#0"; expected = ["", "", 0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.009)");
			obj = "\\.#0"; expected = ["\\.", 0]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.010)");
			obj = "\\.\\#0"; expected = ["\\.\\#0"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.011)");
			obj = "#0#"; expected = ["#0#"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.012)");
			obj = "#0\\#"; expected = ["#0\\#"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (003.013)");

			obj = "\\#"; expected = ["\\#"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.001)");
			obj = "\\#1"; expected = ["\\#1"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.002)");
			obj = "\\##1"; expected = ["\\#", 1]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.003)");
			obj = "##"; expected = ["##"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.004)");
			obj = "#."; expected = ["#", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.005)");
			obj = "#.a"; expected = ["#", "a"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.006)");
			obj = ".#."; expected = ["", "#", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.007)");
			obj = ".\\#."; expected = ["", "\\#", ""]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.008)");
			obj = "a#1b#2"; expected = ["a", 1, 2]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.009)");
			obj = "a#1b#2a"; expected = ["a#1b#2a"]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.010)");
			obj = "a#1.b#9"; expected = ["a", 1, "b", 9]; outcome = DotSharpNotation.parse(obj, buf()); outcome.length = outcome.count; test("DotSharpNotation.parse (004.011)");

			//	use `offsetInTarget`
			obj = "a#1.b#9"; expected = [void 0, "a", 1, "b", 9]; outcome = DotSharpNotation.parse(obj, buf(), 1); outcome.length = outcome.count; test("DotSharpNotation.parse (005.001)");
		}

		function test_DotSharpNotation_parse_decodeComponent()
		{
			const componentCallback = v => outcome.push(DotSharpNotation.decodeComponent(v));

			obj = null; expected = []; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.001)");
			obj = ""; expected = [""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.001a)");
			obj = 0; expected = [0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.001b)");
			obj = 1; expected = [1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.001c)");
			obj = "\\0"; expected = [""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.002)");
			obj = "\\"; expected = ["\\"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.002a)");
			obj = "0"; expected = ["0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.002b)");
			obj = "\\0\\0"; expected = ["00"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.002c)");
			obj = "."; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.003)");
			obj = "\\0."; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.004)");
			obj = "\\0.\\0"; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.005)");
			obj = ".\\0"; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (001.006)");

			obj = "\\."; expected = ["."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.001)");
			obj = "\\.0"; expected = [".0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.002)");
			obj = "\\.\\."; expected = [".."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.003)");
			obj = "\\.\\.\\."; expected = ["..."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.004)");
			obj = "\\.x"; expected = [".x"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.005)");
			obj = "x\\."; expected = ["x."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.006)");
			obj = "x\\.x"; expected = ["x.x"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.007)");
			obj = "\\.x\\."; expected = [".x."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.008)");
			obj = "\\.."; expected = [".", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.009)");
			obj = ".\\."; expected = ["", "."]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.010)");
			obj = ".\\.."; expected = ["", ".", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (002.011)");

			obj = ".a"; expected = ["", "a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.001)");
			obj = "\\0.a"; expected = ["", "a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.002)");
			obj = "a."; expected = ["a", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.003)");
			obj = "a.\\0"; expected = ["a", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.004)");
			obj = "a.b"; expected = ["a", "b"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.005)");
			obj = ".0"; expected = ["", "0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.006)");
			obj = "\\0.0"; expected = ["", "0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.007)");
			obj = "."; expected = ["", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.008)");
			obj = ".."; expected = ["", "", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (0021.009)");

			obj = "#"; expected = ["#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.001)");
			obj = "#0"; expected = [0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.002)");
			obj = "#1"; expected = [1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.003)");
			obj = "0#0"; expected = ["0", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.004)");
			obj = "\\0#0"; expected = ["", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.005)");
			obj = "#0."; expected = [0, ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.006)");
			obj = "#0#1"; expected = [0, 1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.007)");
			obj = "a#0"; expected = ["a", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.008)");

			obj = ".#0"; expected = ["", "", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.009)");
			obj = "\\.#0"; expected = [".", 0]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.010)");
			obj = "\\.\\#0"; expected = [".#0"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.011)");
			obj = "#0#"; expected = ["#0#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.012)");
			obj = "#0\\#"; expected = ["#0#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (003.013)");

			obj = "\\#"; expected = ["#"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.001)");
			obj = "\\#1"; expected = ["#1"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.002)");
			obj = "\\##1"; expected = ["#", 1]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.003)");
			obj = "##"; expected = ["##"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.004)");
			obj = "#."; expected = ["#", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.005)");
			obj = "#.a"; expected = ["#", "a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.006)");
			obj = ".#."; expected = ["", "#", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.007)");
			obj = ".\\#."; expected = ["", "#", ""]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.008)");
			obj = "a#1b#2"; expected = ["a", 1, 2]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.009)");
			obj = "a#1b#2a"; expected = ["a#1b#2a"]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.010)");
			obj = "a#1.b#9"; expected = ["a", 1, "b", 9]; outcome = []; DotSharpNotation.parseHof(obj, componentCallback); test("DotSharpNotation.parse, decodeComponent (004.011)");
		}

		function test_DotSharpNotation_append()
		{
			obj = null; obj2 = 1, expected = 1; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.001)");
			obj = null; obj2 = "", expected = "\\0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.002)");
			obj = null; obj2 = "\\0", expected = "\\0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.003)");
			obj = null; obj2 = "a", expected = "a"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.004)");
			obj = null; obj2 = "#0", expected = "#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.004a)");
			obj = ""; obj2 = 1, expected = "\\0#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001a.001)");
			obj = ""; obj2 = "", expected = "."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001a.002)");
			obj = ""; obj2 = "\\0", expected = "."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001a.003)");
			obj = ""; obj2 = "a", expected = ".a"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001a.004)");
			obj = ""; obj2 = "#0", expected = "\\0#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001a.004a)");
			obj = 0; obj2 = 1, expected = "#0#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.005)");
			obj = 0; obj2 = "", expected = "#0."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.006)");
			obj = 0; obj2 = "\\0", expected = "#0."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.007)");
			obj = 0; obj2 = "a", expected = "#0.a"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.008)");
			obj = 0; obj2 = "#1", expected = "#0#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.008a)");
			obj = "\\0"; obj2 = 1, expected = "\\0#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.009)");
			obj = "\\0"; obj2 = "", expected = "."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.010)");
			obj = "\\0"; obj2 = "\\0", expected = "."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.011)");
			obj = "\\0"; obj2 = "a", expected = ".a"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.012)");
			obj = "\\0"; obj2 = "#0", expected = "\\0#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.012a)");
			obj = "a"; obj2 = 1, expected = "a#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.013)");
			obj = "a"; obj2 = "", expected = "a."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.014)");
			obj = "a"; obj2 = "\\0", expected = "a."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.015)");
			obj = "a"; obj2 = "b", expected = "a.b"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.016)");
			obj = "a"; obj2 = "#0", expected = "a#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.016a)");
			obj = "."; obj2 = 1, expected = ".#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.017)");
			obj = "."; obj2 = "", expected = ".."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.018)");
			obj = "."; obj2 = "\\0", expected = ".."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.019)");
			obj = "."; obj2 = "a", expected = "..a"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.020)");
			obj = "."; obj2 = "#0", expected = ".#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.020a)");
			obj = "a."; obj2 = 1, expected = "a.#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.021)");
			obj = "a."; obj2 = "", expected = "a.."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.022)");
			obj = "a."; obj2 = "\\0", expected = "a.."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.023)");
			obj = "a."; obj2 = "b", expected = "a..b"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.024)");
			obj = "a."; obj2 = "#0", expected = "a.#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.024a)");
			obj = "#0"; obj2 = 1, expected = "#0#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.025)");
			obj = "#0"; obj2 = "", expected = "#0."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.026)");
			obj = "#0"; obj2 = "\\0", expected = "#0."; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.027)");
			obj = "#0"; obj2 = "b", expected = "#0.b"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.028)");
			obj = "#0"; obj2 = "#1", expected = "#0#1"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (001.028a)");

			obj = "a.b"; obj2 = "c", expected = "a.b.c"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (002.001)");
			obj = "a.b"; obj2 = "c.d", expected = "a.b.c.d"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (002.002)");
			obj = "a#0"; obj2 = 0, expected = "a#0#0"; outcome = DotSharpNotation.append(obj, obj2); test("DotSharpNotation.append string (002.003)");
		}
	}
}

module.exports.UnitTests_DotSharpNotation = module.exports;
