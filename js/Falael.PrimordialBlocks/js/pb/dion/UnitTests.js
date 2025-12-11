//	R0Q3/daniel/20210728
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

const Runtime = require("-/pb/natalis/000/Runtime.js");
const Native = require("-/pb/natalis/000/Native.js");
const Parse = require("-/pb/dion/002/Parse.js");

const unitTestClasses = [];

module.exports =

//	Class: Holds the unit tests for dion.
class UnitTests
{
	//	Function: Run all available unit tests.
	static unitTest(testFailed, { disabledTests = null, acknowledged = null } = {})
	{
		return Runtime.unitTest(unitTestClasses.concat(UnitTests), testFailed, { disabledTests, acknowledged });
	}

	//	Category: Unit test
	//	Function: Run unit tests for `Parse` static class and nested class methods.
	//	Returns: If one or more unit tests have failed, returns an array of `{ class: "Parse", testName: string, expected, outcome }`, otherwise returns an empty array.
	static unitTest_Parse(result)
	{
		const test = (outcome, expected) => JSON.stringify(outcome) === JSON.stringify(expected);
		const fail = (testName, expected, outcome) => ({ class: "Parse", testName, expected, outcome });

		let parser;
		let subject;
		let expected;
		let outcome;

		//	Parse.MultipartFormDataParser.ChunkList
		{
			const ChunkList = Parse.MultipartFormDataParser.ChunkList;
			const ltest = (outcome, expected) => Native.arraysEqual(outcome, expected, Native.arraysEqual);

			//	Parse.MultipartFormDataParser.ChunkList.keepRight
			subject = new ChunkList(); subject.keepRight(0); expected = []; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.000)`, expected, outcome));
			subject = new ChunkList(); subject.keepRight(1); expected = []; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.010)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5])]); subject.keepRight(0); expected = []; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.020)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5])]); subject.keepRight(1); expected = [new Uint8Array([5])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.030)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5])]); subject.keepRight(3); expected = [new Uint8Array([5])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.035)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 9])]); subject.keepRight(0); expected = []; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.040)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 9])]); subject.keepRight(1); expected = [new Uint8Array([5, 9])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.050)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 9])]); subject.keepRight(2); expected = [new Uint8Array([5, 9])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.060)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([9])]); subject.keepRight(0); expected = []; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.070)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([9])]); subject.keepRight(1); expected = [new Uint8Array([9])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.080)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([9])]); subject.keepRight(2); expected = [new Uint8Array([5]), new Uint8Array([9])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.083)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([9, 7])]); subject.keepRight(1); expected = [new Uint8Array([9, 7])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.090)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([9, 7])]); subject.keepRight(2); expected = [new Uint8Array([9, 7])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.093)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([9, 7])]); subject.keepRight(3); expected = [new Uint8Array([5]), new Uint8Array([9, 7])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.093)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 7]), new Uint8Array([9])]); subject.keepRight(1); expected = [new Uint8Array([9])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.100)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 7]), new Uint8Array([9])]); subject.keepRight(2); expected = [new Uint8Array([5, 7]), new Uint8Array([9])]; if (!ltest(outcome = subject.chunks, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.keepRight (000.103)`, expected, outcome));

			//	Parse.MultipartFormDataParser.ChunkList.getByteAt
			subject = new ChunkList([new Uint8Array([5])]); outcome = subject.getByteAt(0); expected = 5; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.000)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([7])]); outcome = subject.getByteAt(0); expected = 5; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.005)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 7])]); outcome = subject.getByteAt(0); expected = 5; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.010)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 7]), new Uint8Array([9])]); outcome = subject.getByteAt(0); expected = 5; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.015)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 7])]); outcome = subject.getByteAt(1); expected = 7; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.020)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5, 7]), new Uint8Array([9])]); outcome = subject.getByteAt(1); expected = 7; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.025)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([7])]); outcome = subject.getByteAt(1); expected = 7; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.030)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([7, 9])]); outcome = subject.getByteAt(1); expected = 7; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.035)`, expected, outcome));
			subject = new ChunkList([new Uint8Array([5]), new Uint8Array([7, 9])]); outcome = subject.getByteAt(2); expected = 9; if (!test(outcome, expected)) result.push(fail(`Parse.MultipartFormDataParser.ChunkList.getByteAt (000.040)`, expected, outcome));
		}

		//	Parse.MultipartFormDataParser
		{
			const enc = v => new TextEncoder().encode(v);

			const format = () =>
			{
				switch (parser.outputType)
				{
					case Parse.MultipartFormDataParser.ElementType_Parsing:
					case Parse.MultipartFormDataParser.ElementType_ClosingBoundary:
						return `${outcome}*${parser._state.description}*${parser.outputType.description}*L${parser._chunkList.byteLength}*O${parser._chunkList.pointer}`;
					default:
						return `${outcome}*${parser._state.description}*${parser.outputType.description}*L${parser._chunkList.byteLength}*O${parser._chunkList.pointer}*${parser.output}`;
				}
			}
			const expect = (expected, title) =>
			{
				if (format() !== expected) result.push(fail(`Parse.MultipartFormDataParser (${title})`, expected, format()));
			}

			const next_expectEx = (expected, title) =>
			{
				try { parser.next(); result.push(fail(`Parse.MultipartFormDataParser (${title})`, expected, format())); } catch (ex) { if (expected !== ex.message) result.push(fail(`Parse.MultipartFormDataParser (${title})`, expected, ex.message)); }
			}

			const boundary = new Uint8Array(enc("ab"));
			const boundaryAlt = new Uint8Array(enc("--"));

			//	Parse.MultipartFormDataParser.next - STATE_PREAMBLE
			{
				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(Parse.MultipartFormDataParser.EOI);
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L0*O0*null", "000.0000");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array([5]));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L1*O0", "000.0010");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array([5]));
				parser.consume(Parse.MultipartFormDataParser.EOI);
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L1*O0*null", "000.0012");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array([5, 5, 5, 5]));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L4*O1", "000.0020");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array([5, 5, 5, 5]));
				parser.consume(Parse.MultipartFormDataParser.EOI);
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L4*O0*null", "000.0022");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array([5, 5, 5, 5, 5, 5]));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L6*O3", "000.0030");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("-")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L1*O0", "000.0040");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L2*O0", "000.0050");

				parser = new Parse.MultipartFormDataParser(boundaryAlt);
				parser.consume(new Uint8Array(enc("--")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L2*O0", "000.0055");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0060");

				parser = new Parse.MultipartFormDataParser(boundaryAlt);
				parser.consume(new Uint8Array(enc("----")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0060");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("x--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0070");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab ")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L5*O5", "000.0080");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--")));
				parser.consume(new Uint8Array(enc("ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0090");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L2*O0", "000.0101");
				parser.consume(new Uint8Array(enc("ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0102");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("x")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L1*O0", "000.0121");
				parser.consume(new Uint8Array(enc("-")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L2*O0", "000.0122");
				parser.consume(new Uint8Array(enc("-")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L3*O0", "000.0123");
				parser.consume(new Uint8Array(enc("a")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L3*O0", "000.0124");
				parser.consume(new Uint8Array(enc("b")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0125");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("01234-")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L6*O3", "000.0130");
				parser.consume(new Uint8Array(enc("-ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0131");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("01234")));
				outcome = parser.next(); expect("false*STATE_PREAMBLE*ElementType_Parsing*L5*O2", "000.0140");
				parser.consume(new Uint8Array(enc("--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0141");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("01234--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "000.0150");
			}

			//	Parse.MultipartFormDataParser.next - STATE_PART_OR_EOM
			{
				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "001.0001");
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0xAD22C9 Format is invalid (multipart form data): unexpected EOI.", "001.0002");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0xAD22C9 Format is invalid (multipart form data): unexpected EOI.", "001.0011");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--abz")));
				next_expectEx("0x238A36 Format is invalid (multipart form data): unexpected byte code 122 at chunk list offset 4.", "001.0101");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("x")));
				parser.consume(new Uint8Array(enc("-")));
				parser.consume(new Uint8Array(enc("-")));
				parser.consume(new Uint8Array(enc("a")));
				parser.consume(new Uint8Array(enc("b")));
				parser.consume(new Uint8Array(enc("z")));
				next_expectEx("0x238A36 Format is invalid (multipart form data): unexpected byte code 122 at chunk list offset 0.", "001.0111");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "001.0121");
				parser.consume(new Uint8Array(enc("z")));
				next_expectEx("0x238A36 Format is invalid (multipart form data): unexpected byte code 122 at chunk list offset 0.", "001.0122");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--a")));
				parser.consume(new Uint8Array(enc("bz")));
				next_expectEx("0x238A36 Format is invalid (multipart form data): unexpected byte code 122 at chunk list offset 1.", "001.0142");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--abz")));
				next_expectEx("0x238A36 Format is invalid (multipart form data): unexpected byte code 122 at chunk list offset 4.", "001.0152");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab-")));
				outcome = parser.next(); expect("false*STATE_EOM_CANDIDATE*ElementType_Parsing*L5*O5", "001.0201");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\r")));
				outcome = parser.next(); expect("false*STATE_PART_CANDIDATE*ElementType_Parsing*L5*O5", "001.0301");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\t ")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L6*O6", "001.0401");
			}

			//	Parse.MultipartFormDataParser.next - STATE_EOM_CANDIDATE
			{
				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab-")));
				outcome = parser.next(); expect("false*STATE_EOM_CANDIDATE*ElementType_Parsing*L5*O5", "002.0001");
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0x5B8719 Format is invalid (multipart form data): unexpected EOI.", "002.0003");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				parser.consume(new Uint8Array(enc("-")));
				outcome = parser.next(); expect("false*STATE_EOM_CANDIDATE*ElementType_Parsing*L1*O1", "002.0101");
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0x5B8719 Format is invalid (multipart form data): unexpected EOI.", "002.0103");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab-x")));
				next_expectEx("0xDF15FB Format is invalid (multipart form data): unexpected byte code 120 at chunk list offset 5.", "002.0203");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab-")));
				parser.consume(new Uint8Array(enc("x")));
				next_expectEx("0xDF15FB Format is invalid (multipart form data): unexpected byte code 120 at chunk list offset 5.", "002.0303");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab-")));
				outcome = parser.next(); expect("false*STATE_EOM_CANDIDATE*ElementType_Parsing*L5*O5", "002.0402");
				parser.consume(new Uint8Array(enc("x")));
				next_expectEx("0xDF15FB Format is invalid (multipart form data): unexpected byte code 120 at chunk list offset 5.", "002.0403");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab--")));
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L6*O5*null", "002.0501");

				parser = new Parse.MultipartFormDataParser(boundaryAlt);
				parser.consume(new Uint8Array(enc("------")));
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L6*O5*null", "002.0521");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("012345--ab----6789")));
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L18*O11*null", "002.0551");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				parser.consume(new Uint8Array(enc("--")));
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L2*O1*null", "002.0601");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "002.0701");
				parser.consume(new Uint8Array(enc("--")));
				outcome = parser.next(); expect("false*STATE_EOM*ElementType_Empty*L2*O1*null", "002.0702");
			}

			//	Parse.MultipartFormDataParser.next - STATE_PART_CANDIDATE
			{
				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\r")));
				outcome = parser.next(); expect("false*STATE_PART_CANDIDATE*ElementType_Parsing*L5*O5", "003.0001");
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0x3B8566 Format is invalid (multipart form data): unexpected EOI.", "003.0003");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\rx")));
				next_expectEx("0xC7276A Format is invalid (multipart form data): unexpected byte code 120 at chunk list offset 5.", "003.0103");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\r\n")));
				outcome = parser.next(); expect("false*STATE_PART_HEADER_OR_BODY*ElementType_Parsing*L6*O6", "003.0201");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab")));
				outcome = parser.next(); expect("false*STATE_PART_OR_EOM*ElementType_Parsing*L0*O0", "003.0301");
				parser.consume(new Uint8Array(enc("\r\n")));
				outcome = parser.next(); expect("false*STATE_PART_HEADER_OR_BODY*ElementType_Parsing*L2*O2", "003.0302");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\r")));
				outcome = parser.next(); expect("false*STATE_PART_CANDIDATE*ElementType_Parsing*L5*O5", "003.0401");
				parser.consume(new Uint8Array(enc("\n")));
				outcome = parser.next(); expect("false*STATE_PART_HEADER_OR_BODY*ElementType_Parsing*L6*O6", "003.0402");
			}

			//	Parse.MultipartFormDataParser.next - STATE_PART_HEADER_OR_BODY
			{
				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab \r\n:")));
				next_expectEx("0xF7CE5A Format is invalid (multipart form data): unexpected ':' byte.", "004.0003");


				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab \r\n")));
				outcome = parser.next(); expect("false*STATE_PART_HEADER_OR_BODY*ElementType_Parsing*L7*O7", "004.0101");
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0x917B89 Format is invalid (multipart form data): unexpected EOI.", "004.0103");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\t\r\n\r")));
				outcome = parser.next(); expect("false*STATE_PART_BODY_CANDIDATE*ElementType_Parsing*L8*O8", "004.0201");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\t\r\nx")));
				outcome = parser.next(); expect("false*STATE_PART_HEADER*ElementType_Parsing*L8*O8", "004.0301");
			}

			//	Parse.MultipartFormDataParser.next - STATE_PART_HEADER_NAME
			{
				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab \r\n")));
				outcome = parser.next(); expect("false*STATE_PART_HEADER_OR_BODY*ElementType_Parsing*L7*O7", "005.0001");
				parser.consume(Parse.MultipartFormDataParser.EOI);
				next_expectEx("0x917B89 Format is invalid (multipart form data): unexpected EOI.", "005.0003");

				parser = new Parse.MultipartFormDataParser(boundary);
				parser.consume(new Uint8Array(enc("--ab\t\r\n\r")));
				outcome = parser.next(); expect("false*STATE_PART_BODY_CANDIDATE*ElementType_Parsing*L8*O8", "005.0201");
			}
		}
	}
}

module.exports.UnitTests = module.exports;
