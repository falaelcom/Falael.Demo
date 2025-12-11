//	R0Q2/daniel/20220505
"use strict";

const { DotQuoteNotation } = require("-/pb/natalis/012/DotQuoteNotation.js");

module.exports =

class UnitTests_Parse
{
	//	Category: Unit test
	//	Function: Run unit tests for `Parse` static class and nested class methods.
	static unitTest_Parse(result)
	{
		const test = (outcome, expected) => JSON.stringify(outcome) === JSON.stringify(expected);
		const fail = (testName, expected, outcome) => ({ testName, expected, outcome });

		let subject;
		let expected;
		let outcome;

		//	DotQuoteNotation.parse
		{
			//	DotQuoteNotation.parse - regular cases
			subject = "''"; expected = [""]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "'a'"; expected = ["a"]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "'a'.'b'"; expected = ["a", "b"]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "'\\\\'"; expected = ["\\"]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "'\\''"; expected = ["'"]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "''[0]"; expected = ["", 0]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "''[1]"; expected = ["", 1]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));
			subject = "''[10]"; expected = ["", 10]; if (!test(outcome = DotQuoteNotation.parse(subject), expected)) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, outcome));

			//	DotQuoteNotation.parse - exceptional cases
			subject = ""; expected = "0x841DFA Format is invalid: unexpected end of input."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "'"; expected = "0x841DFA Format is invalid: unexpected end of input."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''."; expected = "0x841DFA Format is invalid: unexpected end of input."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "1"; expected = "0xAA5884 Format is invalid at offset 0: unexpected character \"1\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''1"; expected = "0x49B3D5 Format is invalid at offset 2: unexpected character \"1\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "'\\a'"; expected = "0x9D7B66 Format is invalid at offset 2: unrecognized escape sequence character \"a\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "["; expected = "0xAA5884 Format is invalid at offset 0: unexpected character \"[\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''["; expected = "0x841DFA Format is invalid: unexpected end of input."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''[]"; expected = "0x3F97F5 Format is invalid at offset 3: unexpected character \"]\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''.["; expected = "0xAA5884 Format is invalid at offset 3: unexpected character \"[\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''[00]"; expected = "0xB3CBE5 Format is invalid at offset 3: invalid first digit \"0\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
			subject = "''[01]"; expected = "0xF730C8 Format is invalid at offset 3: invalid first digit \"0\"."; try { DotQuoteNotation.parse(subject); result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, null)); } catch (ex) { if (ex.message !== expected) result.push(fail(`DotQuoteNotation.parse(${JSON.stringify(subject)})`, expected, ex.message)); }
		}
	}
}

module.exports.UnitTests_Parse = module.exports;
