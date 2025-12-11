//	R0Q2/daniel/20220505
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Options } = require("-/pb/natalis/012/Options.js");

module.exports =

class UnitTests_Options
{
	//	Category: Unit test
	//	Function: Run unit tests for selected class methods.
	static unitTest_PosixArguments(result)
	{
		let title;
		let parser;
		let hasNext;
		let o =
		{
			elementType: null,
			elementText: null,
			argumentOffset: null,
			characterOffset: null,
		};

		const f = () => `${hasNext}*${o.elementType.description.replace("ElementType_", "")}*${o.elementText === null ? "" : o.elementText}*${o.argumentOffset}*${o.characterOffset}`;
		const t = (expected, subExperimentId = -1) => { const outcome = f(); if (outcome !== expected) { fail(expected, outcome, subExperimentId); } };
		const fail = (expected, outcome, subExperimentId = -1) => result.push({ testName: `Options - PosixArguments, ${title}${(subExperimentId === -1 ? "" : " (" + subExperimentId + ")")}`, expected, outcome });
		const reset = () => { o.elementType = Symbol("n/a"); o.elementText = null; o.argumentOffset = -1; o.characterOffset = -1; };

		if (PB_DEBUG)
		{
			title = `(bad schema)`; reset();
			try { parser = new Options([], [{ name: '+' }]); fail(title); } catch (ex) { }

			title = `(bad schema) - W`; reset();
			try { parser = new Options([], [{ name: 'W' }]); fail(title); } catch (ex) { }

			title = `(ok schema) - non-standard W`; reset();
			parser = new Options([], [{ name: 'W' }], null, { posix_vendorReservedAssignable: false }); if (!parser.posixSchema.find(x => x.name === 'W')) fail();
		}

		title = `[}`; reset();
		parser = new Options([]);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `[null]`; reset();
		parser = new Options([""]);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `[""]`; reset();
		parser = new Options([""]);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a"]`; reset();
		parser = new Options(["a"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0");
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-"]`; reset();
		parser = new Options(["-"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*0*0");
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["--"]`; reset();
		parser = new Options(["--"]);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*0*0");
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["--", "a"]`; reset();
		parser = new Options(["--", "a"]);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["--", "-a"]`; reset();
		parser = new Options(["--", "-a"]);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*-a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a", "--"]`; reset();
		parser = new Options(["a", "--"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a", "--" } (non-strict)`; reset();
		parser = new Options(["a", "--"], null, null, { posix_strict: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a", "-", "--"]`; reset();
		parser = new Options(["a", "-", "--"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*--*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a", "-", "--" } (non-strict)`; reset();
		parser = new Options(["a", "-", "--"], null, null, { posix_strict: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-", "a", "--"]`; reset();
		parser = new Options(["-", "a", "--"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*--*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-", "a", "--" } (non-strict)`; reset();
		parser = new Options(["-", "a", "--"], null, null, { posix_strict: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*-*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a", "--", "-"]`; reset();
		parser = new Options(["a", "--", "-"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["a", "--", "-" } (non-strict)`; reset();
		parser = new Options(["a", "--", "-"], null, null, { posix_strict: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-o", "a", "--", "-"]`; reset();
		parser = new Options(["-o", "a", "--", "-"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*o*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*--*2*0", 3);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*3*0", 4);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-o", "a", "--", "-" } (non-strict)`; reset();
		parser = new Options(["-o", "a", "--", "-"], null, null, { posix_strict: false });
		hasNext = parser.posixGetNext(o); t("true*Flag*o*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*2*0", 3);
		hasNext = parser.posixGetNext(o); t("true*Operand*-*3*0", 4);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a"]`; reset();
		parser = new Options(["-a"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1");
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "-a"]`; reset();
		parser = new Options(["-a", "-a"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-aa"]`; reset();
		parser = new Options(["-aa"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ab", "-c"]`; reset();
		parser = new Options(["-ab", "-c"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*1*1", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "b"]`; reset();
		parser = new Options(["-a", "b"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*b*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["b", "-a"]`; reset();
		parser = new Options(["b", "-a"]);
		hasNext = parser.posixGetNext(o); t("true*Operand*b*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*-a*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["b", "-a" } (non-strict)`; reset();
		parser = new Options(["b", "-a"], null, null, { posix_strict: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*b*0*0", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "--"]`; reset();
		parser = new Options(["-a", "--"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a"]`; reset();
		parser = new Options(["-a"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a" } (value required)`; reset();
		parser = new Options(["-a"], [{ name: 'a', valueRequired: true }]);
		try { parser.posixGetNext(o); fail(); } catch (ex) { }

		title = `["-a-"]`; reset();
		parser = new Options(["-a-"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.posixGetNext(o); t("true*OptionalValue*-*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a-" } (value required)`; reset();
		parser = new Options(["-a-"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*-*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "-"]`; reset();
		parser = new Options(["-a", "-"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.posixGetNext(o); t("true*Operand*-*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "-" } (value required)`; reset();
		parser = new Options(["-a", "-"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*-*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "--", "-b"]`; reset();
		parser = new Options(["-a", "--", "-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*-b*2*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "--", "-b" } (value required)`; reset();
		parser = new Options(["-a", "--", "-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*--*1*0", 2);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*2*1", 1);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ab"]`; reset();
		parser = new Options(["-ab"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*OptionalValue*b*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ab" } (value required)`; reset();
		parser = new Options(["-ab"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*b*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a-b"]`; reset();
		parser = new Options(["-a-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*OptionalValue*-b*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a-b" } (value required)`; reset();
		parser = new Options(["-a-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*-b*0*2", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "b"]`; reset();
		parser = new Options(["-a", "b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Operand*b*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "b" } (value required)`; reset();
		parser = new Options(["-a", "b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*b*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "-b"]`; reset();
		parser = new Options(["-a", "-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*1*1", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-a", "-b" } (value required)`; reset();
		parser = new Options(["-a", "-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*-b*1*0", 2);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-cab"]`; reset();
		parser = new Options(["-cab"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*OptionalValue*b*0*3", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-cab" } (value required)`; reset();
		parser = new Options(["-cab"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*b*0*3", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca-b"]`; reset();
		parser = new Options(["-ca-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*OptionalValue*-b*0*3", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca-b" } (value required)`; reset();
		parser = new Options(["-ca-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*-b*0*3", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca", "b"]`; reset();
		parser = new Options(["-ca", "b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*Operand*b*1*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca", "b" } (value required)`; reset();
		parser = new Options(["-ca", "b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*b*1*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca", "-b"] (1)`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*1*1", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca", "-b"] (1) (value required)`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*-b*1*0", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca", "-b"] (2)`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'c', valueRequired: false }, { name: 'a', valueRequired: false }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*OptionalValue*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*1*1", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-ca", "-b"] (2) (value required)`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'c', valueRequired: true }, { name: 'a', valueRequired: true }]);
		hasNext = parser.posixGetNext(o); t("true*Assignable*c*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*RequiredValue*a*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*1*1", 3);
		hasNext = parser.posixGetNext(o); t("false*EOI**-1*-1");

		title = `["-W"]`; reset();
		parser = new Options(["-W"], null, null, { posix_vendorReservedAssignable: true });
		try { parser.posixGetNext(o); fail(); } catch (ex) { }

		title = `["-W" } (non-standard)`; reset();
		parser = new Options(["-W"], null, null, { posix_vendorReservedAssignable: false });
		hasNext = parser.posixGetNext(o); t("true*Flag*W*0*1", 1);

		title = `["-Wa" } (non-standard)`; reset();
		parser = new Options(["-Wa"], null, null, { posix_vendorReservedAssignable: false });
		hasNext = parser.posixGetNext(o); t("true*Flag*W*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*2", 2);

		title = `["-aW" } (non-standard)`; reset();
		parser = new Options(["-aW"], null, null, { posix_vendorReservedAssignable: false });
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*Flag*W*0*2", 2);

		title = `["-Wvalue"]`; reset();
		parser = new Options(["-Wvalue"], null, null, { posix_vendorReservedAssignable: true });
		hasNext = parser.posixGetNext(o); t("true*VendorReservedAssignable*W*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*VendorReservedValue*value*0*2", 2);

		title = `["-aWvalue"]`; reset();
		parser = new Options(["-aWvalue"], null, null, { posix_vendorReservedAssignable: true });
		hasNext = parser.posixGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.posixGetNext(o); t("true*VendorReservedAssignable*W*0*2", 2);
		hasNext = parser.posixGetNext(o); t("true*VendorReservedValue*value*0*3", 3);

		title = `["-b+c"]`; reset();
		parser = new Options(["-b+c"]);
		hasNext = parser.posixGetNext(o); t("true*Flag*b*0*1", 1);
		try { parser.posixGetNext(o); fail(); } catch (ex) { }

		title = `["-b+c" } (operand)`; reset();
		parser = new Options(["-b+c"], null, null, { posix_rejectUnrecognizableArguments: false });
		hasNext = parser.posixGetNext(o); t("true*Flag*b*0*1", 1);
		try { parser.posixGetNext(o); fail(); } catch (ex) { }

		title = `["-+bc"]`; reset();
		parser = new Options(["-+bc"]);
		try { parser.posixGetNext(o); fail(); } catch (ex) { }

		title = `["-+bc" } (operand)`; reset();
		parser = new Options(["-+bc"], null, null, { posix_rejectUnrecognizableArguments: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*-+bc*0*0", 1);

		title = `["--a"]`; reset();
		parser = new Options(["--a"]);
		try { parser.posixGetNext(o); fail(); } catch (ex) { }

		title = `["--a" } (operand)`; reset();
		parser = new Options(["--a"], null, null, { posix_rejectUnrecognizableArguments: false });
		hasNext = parser.posixGetNext(o); t("true*Operand*--a*0*0", 1);
	}

	//	Category: Unit test
	//	Function: Run unit tests for selected class methods.
	static unitTest_GnuArguments(result)
	{
		let title;
		let parser;
		let hasNext;
		let o =
		{
			elementType: null,
			elementText: null,
			argumentOffset: null,
			characterOffset: null,
		};

		const f = () => `${hasNext}*${o.elementType.description.replace("ElementType_", "")}*${o.elementText === null ? "" : o.elementText}*${o.argumentOffset}*${o.characterOffset}`;
		const t = (expected, subExperimentId = -1) => { const outcome = f(); if (outcome !== expected) { fail(expected, outcome, subExperimentId); } };
		const fail = (expected, outcome, subExperimentId = -1) => result.push({ testName: `Options - GnuArguments, ${title}${(subExperimentId === -1 ? "" : " (" + subExperimentId + ")")}`, expected, outcome });
		const reset = () => { o.elementType = Symbol("n/a"); o.elementText = null; o.argumentOffset = -1; o.characterOffset = -1; };

		//  POSIX tests

		if (PB_DEBUG)
		{
			title = `(bad schema)`; reset();
			try { parser = new Options([], [{ name: '+' }]); fail(title); } catch (ex) { }

			title = `(bad schema) - W`; reset();
			try { parser = new Options([], [{ name: 'W' }]); fail(title); } catch (ex) { }

			title = `(ok schema) - non-standard W`; reset();
			parser = new Options([], [{ name: 'W' }], null, { posix_vendorReservedAssignable: false }); if (!parser.posixSchema.find(x => x.name === 'W')) fail();
		}

		title = `new string[] { }`; reset();
		parser = new Options([]);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { null }`; reset();
		parser = new Options([""]);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "" }`; reset();
		parser = new Options([""]);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a" }`; reset();
		parser = new Options(["a"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-" }`; reset();
		parser = new Options(["-"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*0*0");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--" }`; reset();
		parser = new Options(["--"]);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*0*0");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--", "a" }`; reset();
		parser = new Options(["--", "a"]);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--", "-a" }`; reset();
		parser = new Options(["--", "-a"]);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a", "--" }`; reset();
		parser = new Options(["a", "--"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a", "--" } (non-strict)`; reset();
		parser = new Options(["a", "--"], null, null, { posix_strict: false });
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a", "-", "--" }`; reset();
		parser = new Options(["a", "-", "--"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*--*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a", "-", "--" } (non-strict)`; reset();
		parser = new Options(["a", "-", "--"], null, null, { posix_strict: false });
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-", "a", "--" }`; reset();
		parser = new Options(["-", "a", "--"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*--*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-", "a", "--" } (non-strict)`; reset();
		parser = new Options(["-", "a", "--"], null, null, { posix_strict: false });
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a", "--", "-" }`; reset();
		parser = new Options(["a", "--", "-"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "a", "--", "-" } (non-strict)`; reset();
		parser = new Options(["a", "--", "-"], null, null, { posix_strict: false });
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-o", "a", "--", "-" }`; reset();
		parser = new Options(["-o", "a", "--", "-"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*o*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*--*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*3*0", 4);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-o", "a", "--", "-" } (non-strict)`; reset();
		parser = new Options(["-o", "a", "--", "-"], null, null, { posix_strict: false });
		hasNext = parser.gnuGetNext(o); t("true*Flag*o*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*3*0", 4);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a" }`; reset();
		parser = new Options(["-a"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "-a" }`; reset();
		parser = new Options(["-a", "-a"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-aa" }`; reset();
		parser = new Options(["-aa"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ab", "-c" }`; reset();
		parser = new Options(["-ab", "-c"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*1*1", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "b" }`; reset();
		parser = new Options(["-a", "b"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*b*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "b", "-a" }`; reset();
		parser = new Options(["b", "-a"]);
		hasNext = parser.gnuGetNext(o); t("true*Operand*b*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "b", "-a" } (non-strict)`; reset();
		parser = new Options(["b", "-a"], null, null, { posix_strict: false });
		hasNext = parser.gnuGetNext(o); t("true*Operand*b*0*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "--" }`; reset();
		parser = new Options(["-a", "--"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a" }`; reset();
		parser = new Options(["-a"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a" } (value required)`; reset();
		parser = new Options(["-a"], [{ name: 'a', valueRequired: true }]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "-a-" }`; reset();
		parser = new Options(["-a-"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.gnuGetNext(o); t("true*OptionalValue*-*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a-" } (value required)`; reset();
		parser = new Options(["-a-"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*-*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "-" }`; reset();
		parser = new Options(["-a", "-"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.gnuGetNext(o); t("true*Operand*-*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "-" } (value required)`; reset();
		parser = new Options(["-a", "-"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1");
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*-*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "--", "-b" }`; reset();
		parser = new Options(["-a", "--", "-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*-b*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "--", "-b" } (value required)`; reset();
		parser = new Options(["-a", "--", "-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*2*1", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ab" }`; reset();
		parser = new Options(["-ab"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*OptionalValue*b*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ab" } (value required)`; reset();
		parser = new Options(["-ab"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*b*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a-b" }`; reset();
		parser = new Options(["-a-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*OptionalValue*-b*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a-b" } (value required)`; reset();
		parser = new Options(["-a-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*-b*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "b" }`; reset();
		parser = new Options(["-a", "b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*b*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "b" } (value required)`; reset();
		parser = new Options(["-a", "b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*b*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "-b" }`; reset();
		parser = new Options(["-a", "-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*1*1", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "-b" } (value required)`; reset();
		parser = new Options(["-a", "-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*-b*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-cab" }`; reset();
		parser = new Options(["-cab"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*OptionalValue*b*0*3", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-cab" } (value required)`; reset();
		parser = new Options(["-cab"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*b*0*3", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca-b" }`; reset();
		parser = new Options(["-ca-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*OptionalValue*-b*0*3", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca-b" } (value required)`; reset();
		parser = new Options(["-ca-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*-b*0*3", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca", "b" }`; reset();
		parser = new Options(["-ca", "b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*b*1*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca", "b" } (value required)`; reset();
		parser = new Options(["-ca", "b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*b*1*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca", "-b" }`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*1*1", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca", "-b" } (value required)`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*-b*1*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca", "-b" }`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'c', valueRequired: false }, { name: 'a', valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*OptionalValue*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*1*1", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-ca", "-b" } (value required)`; reset();
		parser = new Options(["-ca", "-b"], [{ name: 'c', valueRequired: true }, { name: 'a', valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*Assignable*c*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*RequiredValue*a*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*1*1", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-W" }`; reset();
		parser = new Options(["-W"], null, null, { posix_vendorReservedAssignable: true });
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "-W" } (non-standard)`; reset();
		parser = new Options(["-W"], null, null, { posix_vendorReservedAssignable: false });
		hasNext = parser.gnuGetNext(o); t("true*Flag*W*0*1", 1);

		title = `new string[] { "-Wa" } (non-standard)`; reset();
		parser = new Options(["-Wa"], null, null, { posix_vendorReservedAssignable: false });
		hasNext = parser.gnuGetNext(o); t("true*Flag*W*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*2", 2);

		title = `new string[] { "-aW" } (non-standard)`; reset();
		parser = new Options(["-aW"], null, null, { posix_vendorReservedAssignable: false });
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*W*0*2", 2);

		title = `new string[] { "-Wvalue" }`; reset();
		parser = new Options(["-Wvalue"], null, null, { posix_vendorReservedAssignable: true, gnu_vendorReservedTranslate: false });
		hasNext = parser.gnuGetNext(o); t("true*VendorReservedAssignable*W*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*VendorReservedValue*value*0*2", 2);

		title = `new string[] { "-aWvalue" }`; reset();
		parser = new Options(["-aWvalue"], null, null, { posix_vendorReservedAssignable: true, gnu_vendorReservedTranslate: false });
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*VendorReservedAssignable*W*0*2", 2);
		hasNext = parser.gnuGetNext(o); t("true*VendorReservedValue*value*0*3", 3);

		title = `new string[] { "-b+c" }`; reset();
		parser = new Options(["-b+c"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*0*1", 1);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "-b+c" } (operand)`; reset();
		parser = new Options(["-b+c"], null, null, { posix_rejectUnrecognizableArguments: false });
		hasNext = parser.gnuGetNext(o); t("true*Flag*b*0*1", 1);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "-+bc" }`; reset();
		parser = new Options(["-+bc"]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "-+bc" } (operand)`; reset();
		parser = new Options(["-+bc"], null, null, { posix_rejectUnrecognizableArguments: false });
		hasNext = parser.gnuGetNext(o); t("true*Operand*-+bc*0*0", 1);

		//  GNU tests

		if (PB_DEBUG)
		{
			title = `(bad gnu schema)`; reset();
			try { parser = new Options([], [{ name: "+" }]); fail(); } catch (ex) { }
		}

		title = `new string[] { "--abc" } (1)`; reset();
		parser = new Options(["--abc"]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*0*2");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--a-b-c" } (1)`; reset();
		parser = new Options(["--a-b-c"]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*a-b-c*0*2");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc" } (2)`; reset();
		parser = new Options(["--abc"], [{ name: 'a' }]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*0*2");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc" } (assignable)`; reset();
		parser = new Options(["--abc"], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--ab-c" } (assignable)`; reset();
		parser = new Options(["--ab-c"], [{ name: "ab-c", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*ab-c*0*2");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "--ab-c" }`; reset();
		parser = new Options(["--abc", "--ab-c"]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*ab-c*1*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "-a" }`; reset();
		parser = new Options(["--abc", "-a"]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "-a", "--abc" }`; reset();
		parser = new Options(["-a", "--abc"]);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*0*1", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*1*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc=" }`; reset();
		parser = new Options(["--abc="]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "--abc=" } (assignable)`; reset();
		parser = new Options(["--abc="], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2");
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc=" } (requires value)`; reset();
		parser = new Options(["--abc="], [{ name: "abc", valueRequired: true }]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "--abc", "-a" }`; reset();
		parser = new Options(["--abc", "-a"], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "-a" } (requires value)`; reset();
		parser = new Options(["--abc", "-a"], [{ name: "abc", valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongOptionRequiredValue*-a*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc=", "-a" }`; reset();
		parser = new Options(["--abc=", "-a"], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*1*1", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc==" }`; reset();
		parser = new Options(["--abc=="]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "--abc==" } (assignable)`; reset();
		parser = new Options(["--abc=="], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongOptionOptionalValue*=*0*6", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "=" } (assignable, split value)`; reset();
		parser = new Options(["--abc", "="], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*Operand*=*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc==" } (requires value)`; reset();
		parser = new Options(["--abc=="], [{ name: "abc", valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongOptionRequiredValue*=*0*6", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "=" } (requires value, split value)`; reset();
		parser = new Options(["--abc", "="], [{ name: "abc", valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongOptionRequiredValue*=*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc==", "-a" }`; reset();
		parser = new Options(["--abc==", "-a"], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongOptionOptionalValue*=*0*6", 2);
		hasNext = parser.gnuGetNext(o); t("true*Flag*a*1*1", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "--" }`; reset();
		parser = new Options(["--abc", "--"]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "--", "--abc" }`; reset();
		parser = new Options(["--abc", "--", "--abc"]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*OperandListMarker*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*Operand*--abc*2*0", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--abc", "--", "--zz" } (assignable, requires value)`; reset();
		parser = new Options(["--abc", "--", "--zz"], [{ name: "abc", valueRequired: true }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongOptionRequiredValue*--*1*0", 2);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*zz*2*2", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1");

		title = `new string[] { "--ab=" } (partial)`; reset();
		parser = new Options(["--ab="], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*ab*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "--ab" } (ambigous)`; reset();
		parser = new Options(["--ab"], [{ name: "abc", valueRequired: false }, { name: "abd", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*ab*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "--ab=" } (ambigous, empty value)`; reset();
		parser = new Options(["--ab="], [{ name: "abc", valueRequired: false }, { name: "abd", valueRequired: false }]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "--ab" } (posix + gnu)`; reset();
		parser = new Options(["--ab"], [{ name: "abc", valueRequired: false }, { name: "a", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*ab*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "--ab=" } (unknown assignable, gnu_rejectUnknownAssignables: false)`; reset();
		parser = new Options(["--ab="], [], [], { gnu_rejectUnknownAssignables: false });
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*ab*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "--ab=" } (ambigous, empty value, gnu_rejectUnknownAssignables: false)`; reset();
		parser = new Options(["--ab="], [{ name: "abc", valueRequired: false }, { name: "abd", valueRequired: false }], null, { gnu_rejectUnknownAssignables: false });
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*ab*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-Wabc" } (translate, flag)`; reset();
		parser = new Options(["-Wabc"]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongFlag*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-Wabc", "--abc" } (translate, flag)`; reset();
		parser = new Options(["-Wabc", "--abc"]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongFlag*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*1*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-W", "abc" } (translate, flag)`; reset();
		parser = new Options(["-W", "abc"]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongFlag*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-W", "abc", "--abc" } (translate, flag)`; reset();
		parser = new Options(["-W", "abc", "--abc"]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongFlag*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongFlag*abc*2*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-Wabc" } (translate, assignable)`; reset();
		parser = new Options(["-Wabc"], null, [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-Wabc", "--abc" } (translate, assignable)`; reset();
		parser = new Options(["-Wabc", "--abc"], [{ name: "abc", valueRequired: false }], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*1*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-W", "abc" } (translate, assignable)`; reset();
		parser = new Options(["-W", "abc"], null, [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-W", "abc", "--abc" } (translate, assignable)`; reset();
		parser = new Options(["-W", "abc", "--abc"], [{ name: "abc", valueRequired: false }], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*2*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-Wabc=" } (translate, assignable)`; reset();
		parser = new Options(["-Wabc="], null, [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-Wabc=", "--abc" } (translate, assignable)`; reset();
		parser = new Options(["-Wabc=", "--abc"], [{ name: "abc", valueRequired: false }], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*1*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-W", "abc=" } (translate, assignable)`; reset();
		parser = new Options(["-W", "abc="], null, [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 2);

		title = `new string[] { "-W", "abc=", "--abc" } (translate, assignable)`; reset();
		parser = new Options(["-W", "abc=", "--abc"], [{ name: "abc", valueRequired: false }], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*2*2", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-Wabc=value" } (translate, assignable)`; reset();
		parser = new Options(["-Wabc=value"], null, [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongOptionOptionalValue*value*0*5", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-Wabc=value", "--abc" } (translate, assignable)`; reset();
		parser = new Options(["-Wabc=value", "--abc"], [{ name: "abc", valueRequired: false }], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*0*2", 1);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongOptionOptionalValue*value*0*5", 2);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*1*2", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 4);

		title = `new string[] { "-W", "abc=value" } (translate, assignable)`; reset();
		parser = new Options(["-W", "abc=value"], null, [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongOptionOptionalValue*value*1*3", 2);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 3);

		title = `new string[] { "-W", "abc=value", "--abc" } (translate, assignable)`; reset();
		parser = new Options(["-W", "abc=value", "--abc"], [{ name: "abc", valueRequired: false }], [{ name: "abc", valueRequired: false }]);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongAssignable*abc*1*0", 1);
		hasNext = parser.gnuGetNext(o); t("true*VendorLongOptionOptionalValue*value*1*3", 2);
		hasNext = parser.gnuGetNext(o); t("true*LongAssignable*abc*2*2", 3);
		hasNext = parser.gnuGetNext(o); t("false*EOI**-1*-1", 4);

		title = `new string[] { "--b+c" }`; reset();
		parser = new Options(["--b+c"]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }

		title = `new string[] { "-+bc" }`; reset();
		parser = new Options(["-+bc"]);
		try { parser.gnuGetNext(o); fail(); } catch (ex) { }
	}

	//	Category: Unit test
	//	Function: Run unit tests for selected class methods.
	static unitTest_GnuOptions(result)
	{
		let title;
		let parser;
		let hasNext;
		let o =
		{
			type: null,
			posix: null,
			name: null,
			value: null,
		};

		const f = () => `${hasNext}*${o.type.description.replace("ElementType_", "")}/${o.posix ? "P" : "G"}*${o.name === null ? "" : o.name}*${o.value === null ? "" : o.value}`;
		const t = (expected, subExperimentId = -1) => { const outcome = f(); if (outcome !== expected) { fail(expected, outcome, subExperimentId); } };
		const fail = (expected, outcome, subExperimentId = -1) => result.push({ testName: `Options - GnuOptions, ${title}${(subExperimentId === -1 ? "" : " (" + subExperimentId + ")")}`, expected, outcome });
		const reset = () => { o.elementType = Symbol("n/a"); o.elementText = null; o.argumentOffset = -1; o.characterOffset = -1; };

		//	gnuOptionsGetNext
		{
			title = `new string[] { "a" }`; reset();
			parser = new Options(["a"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Operand/P**a");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--" }`; reset();
			parser = new Options(["--"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*OperandListMarker/P**--");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--", "a" }`; reset();
			parser = new Options(["--", "a"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*OperandListMarker/P**--");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Operand/P**a");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--", "-a" }`; reset();
			parser = new Options(["--", "-a"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*OperandListMarker/P**--");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Operand/P**-a");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a" }`; reset();
			parser = new Options(["-a"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa" }`; reset();
			parser = new Options(["--aa"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "-a" }`; reset();
			parser = new Options(["-a", "-a"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa", "-a" }`; reset();
			parser = new Options(["--aa", "-a"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "--aa" }`; reset();
			parser = new Options(["-a", "--aa"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa", "--aa" }`; reset();
			parser = new Options(["--aa", "--aa"]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Flag/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a" } (assignable)`; reset();
			parser = new Options(["-a"], [{ name: 'a' }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa" } (assignable)`; reset();
			parser = new Options(["--aa"], [{ name: "aa" }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "-a" } (assignable)`; reset();
			parser = new Options(["-a", "-a"], [{ name: 'a' }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "--aa" } (assignable)`; reset();
			parser = new Options(["-a", "--aa"], [{ name: 'a' }, { name: "aa" }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa", "-a" } (assignable)`; reset();
			parser = new Options(["--aa", "-a"], [{ name: 'a' }, { name: "aa" }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa", "--aa" } (assignable)`; reset();
			parser = new Options(["--aa", "--aa"], [{ name: 'a' }, { name: "aa" }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "-a", "-a" } (assignable)`; reset();
			parser = new Options(["-a", "-a", "-a"], [{ name: 'a' }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "v" }`; reset();
			parser = new Options(["-a", "v"], [{ name: 'a' }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Operand/P**v");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa", "v" }`; reset();
			parser = new Options(["--aa", "v"], [{ name: "aa" }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Operand/P**v");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "v" } (requires value)`; reset();
			parser = new Options(["-a", "v"], [{ name: 'a', valueRequired: true }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*v");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "--aa", "v" } (requires value)`; reset();
			parser = new Options(["--aa", "v"], [{ name: "aa", valueRequired: true }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/G*aa*v");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-a", "v", "c" }`; reset();
			parser = new Options(["-a", "v", "c"], [{ name: 'a', valueRequired: true }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*v");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Operand/P**c");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");

			title = `new string[] { "-av", "-a" }`; reset();
			parser = new Options(["-av", "-a"], [{ name: 'a' }]);
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*v");
			hasNext = parser.gnuOptionsGetNext(o); t("true*Assignable/P*a*");
			hasNext = parser.gnuOptionsGetNext(o); t("false*EOI/P**");
		}

		//	crunchDefinitions().definitionItemIndex
		{
			let defs;
			let di;

			const t2 = (expected) => { title = "defs: " + JSON.stringify(defs) + ", di:" + di; const outcome = defs[Options.crunchDefinitions(defs).definitionItemIndexOf(di)]; if (JSON.stringify(outcome) !== JSON.stringify(expected)) { fail(expected, outcome); } };

			defs = [{ names: ["a"] }];
			di = "a";
			t2(defs[0]);

			defs = [{ names: ["aa", "ab"] }];
			di = "a";
			t2(void 0);

			defs = [{ names: ["aa"] }, { names: ["ab"] }];
			di = "a";
			t2(void 0);

			defs = [{ names: ["aa"] }];
			di = "a";
			t2(defs[0]);

			defs = [{ names: ["a"], value: { parse: Type.String } }];
			di = "a";
			t2(defs[0]);

			defs = [{ names: ["aa"], value: { parse: Type.String } }];
			di = "a";
			t2(defs[0]);

			defs = [{ names: ["aa", "ab"], value: { parse: Type.String } }];
			di = "a";
			t2(void 0);

			defs = [{ names: ["aa"], value: { parse: Type.String } }, { names: ["ab"], value: { parse: Type.String } }];
			di = "a";
			t2(void 0);

			defs = [{ names: ["aa"] }, { names: ["ab"], value: { parse: Type.String } }];
			di = "a";
			t2(void 0);
		}
	}

	//	Category: Unit test
	//	Function: Run unit tests for selected class methods.
	static unitTest_Options(result)
	{
		let definitions;
		let argv;
		let config;
		let settings;
		let expected;
		let outcome;

		//	Options.json
		{
			const t = (expected, outcome) => { return JSON.stringify(outcome) === JSON.stringify(expected) };
			const fail = (title, expected, outcome) => result.push({ testName: `Options.json, ${title}`, expected: JSON.stringify(expected), outcome: JSON.stringify(outcome) });

			definitions = [];
			argv = [];
			config = null;
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(10)", expected, outcome);

			definitions = [];
			argv = ["a"];
			config = null;
			expected = { "_list": [{ "operand": true, "value": "a" }], "_operands": ["a"], "_operands0": ["a"], "_operands1": [] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(20)", expected, outcome);

			definitions = [];
			argv = ["--", "a"];
			config = null;
			expected = { "_list": [{ "operandListMarker": true }, { "operand": true, "value": "a" }], "_operands": ["a"], "_operands0": [], "_operands1": ["a"] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(30)", expected, outcome);

			definitions = [];
			argv = ["-a"];
			config = null;
			expected = `0x7BBB35 Invalid option "a".`;
			try { Options.json(definitions, argv, config); fail("(40)", expected, null); } catch (ex) { if (ex.message !== expected) fail("(41)", expected, ex.message); }

			definitions = [];
			argv = ["-a"];
			config = { posix_rejectUnknownFlags: false };
			expected = { "_list": [{ "flag": true, posix: true, "optionName": "a", "propertyName": "a", "definitionItemIndex": -1 }], "_operands": [], "_operands0": [], "_operands1": [], "a": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(50)", expected, outcome);

			definitions = [];
			argv = ["--aa"];
			config = { gnu_rejectUnknownFlags: false };
			expected = { "_list": [{ "flag": true, posix: false, "optionName": "aa", "propertyName": "aa", "definitionItemIndex": -1 }], "_operands": [], "_operands0": [], "_operands1": [], "aa": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(52)", expected, outcome);

			definitions = [{ names: ["a"] }];
			argv = ["-a"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": true, "optionName": "a", "propertyName": "a", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(55)", expected, outcome);

			definitions = [{ names: ["a"], property: "b" }];
			argv = ["-a"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": true, "optionName": "a", "propertyName": "b", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "b": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(60)", expected, outcome);

			definitions = [{ names: ["aa"], property: "b" }];
			argv = ["--a"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": false, "optionName": "a", "propertyName": "b", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "b": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(70)", expected, outcome);

			definitions = [{ names: ["aa"] }];
			argv = ["-a"];
			config = null;
			expected = `0x7BBB35 Invalid option "a".`;
			try { Options.json(definitions, argv, config); fail("(71)", expected, null); } catch (ex) { if (ex.message !== expected) fail("(72)", expected, ex.message); }

			definitions = [{ names: ["aa", "a"] }];
			argv = ["-a"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": true, "optionName": "a", "propertyName": "aa", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "aa": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(80)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: Type.String } }];
			argv = ["-a"];
			config = null;
			expected = `0x47BC4A Value is required; gnu_state: State_Posix_Input, elementType: ElementType_Assignable, elementText: a, argument: "-a", argumentOffset: 1, characterOffset: 0.`;
			try { Options.json(definitions, argv, config); fail("(90)", expected, null); } catch (ex) { if (ex.message !== expected) fail("(91)", expected, ex.message); }

			definitions = [{ names: ["a"], value: { parser: Type.String } }];
			argv = ["-a11"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": true, "optionName": "a", "propertyName": "a", "rawValue": "11", "value": "11", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": "11" };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(100)", expected, outcome);

			definitions = [{ names: ["aa"], value: { parser: Type.String, default: null } }];
			argv = ["--aa"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": false, "optionName": "aa", "propertyName": "aa", "rawValue": null, "value": null, "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "aa": null };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(105)", expected, outcome);

			definitions = [{ names: ["aa"], value: { parser: Type.String, default: null } }];
			argv = ["--aa="];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": false, "optionName": "aa", "propertyName": "aa", "rawValue": null, "value": null, "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "aa": null };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(105)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: Type.Number } }];
			argv = ["-a11"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": true, "optionName": "a", "propertyName": "a", "rawValue": "11", "value": 11, "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": 11 };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(110)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: Type.Boolean } }];
			argv = ["-a11"];
			config = null;
			expected = `0xAF9254 Invalid boolean value provided for option "a[0]".`;
			try { Options.json(definitions, argv, config); fail("(120)", expected, null); } catch (ex) { if (ex.message !== expected) fail("(121)", expected, ex.message); }

			definitions = [{ names: ["a"], value: { parser: Type.Boolean } }];
			argv = ["-atrue"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": true, "optionName": "a", "propertyName": "a", "rawValue": "true", "value": true, "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": true };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(130)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: x => 5 } }];
			argv = ["-atrue"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": true, "optionName": "a", "propertyName": "a", "rawValue": "true", "value": 5, "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": 5 };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(140)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: x => { throw new Error("Parser error: fail.") } } }];
			argv = ["-atrue"];
			config = null;
			expected = `0x369BE9 Invalid value provided for option "a[0]". Parser error: fail.`;	//	different browsers provide different stack strings; this unit test acknowledges this behavior and does not test possible variants
			try { Options.json(definitions, argv, config); fail("(150)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(151)", expected, ex.message); }

			definitions = [{ names: ["a"], value: { parser: Type.String, default: 5 } }];
			argv = ["-a"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": true, "optionName": "a", "propertyName": "a", "rawValue": null, "value": 5, "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": 5 };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(160)", expected, outcome);

			definitions = [{ names: ["a"], required: true }];
			argv = [];
			config = null;
			expected = `0xD5B6B5 Option is required: "a".`;
			try { Options.json(definitions, argv, config); fail("(170)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(171)", expected, ex.message); }

			definitions = [{ names: ["a", "bb"] }];
			argv = ["-a", "--b"];
			config = null;
			expected = `0x9BBA84 Cannot use the option more than once: "b" ("a").`;
			try { Options.json(definitions, argv, config); fail("(180)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(181)", expected, ex.message); }

			definitions = [{ names: ["a", "bb"], cardinality: 2 }];
			argv = ["-a"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": true, "optionName": "a", "propertyName": "a", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": [true] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(190)", expected, outcome);

			definitions = [{ names: ["a", "bb"], cardinality: 2 }];
			argv = ["-a", "--b"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": true, "optionName": "a", "propertyName": "a", "definitionItemIndex": 0 }, { "flag": true, "posix": false, "optionName": "b", "propertyName": "a", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": [true, true] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(195)", expected, outcome);

			definitions = [{ names: ["xbc", "x"], value: { parser: Type.String, default: "2" } }];
			argv = ["-x", "1"];
			config = null;
			expected = { _list: [{ assignable: true, posix: true, optionName: "x", propertyName: "xbc", rawValue: null, value: "2", definitionItemIndex: 0 }, { operand: true, value: "1" }], _operands: ["1"], _operands0: ["1"], _operands1: [], xbc: "2" };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(196)", expected, outcome);

			definitions = [{ names: ["a", "bb"], value: { parser: Type.String }, cardinality: 2 }];
			argv = ["-a", "5", "--b", "6"];
			config = null;
			expected = { "_list": [{ "assignable": true, "posix": true, "optionName": "a", "propertyName": "a", "rawValue": "5", "value": "5", "definitionItemIndex": 0 }, { "assignable": true, "posix": false, "optionName": "b", "propertyName": "a", "rawValue": "6", "value": "6", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": ["5", "6"] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(200)", expected, outcome);

			definitions = [{ names: ["a"], cardinality: 2 }];
			argv = [];
			config = null;
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [], "a": [] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(202)", expected, outcome);

			definitions = [];
			argv = ["--a="];
			config = { gnu_rejectUnknownAssignables: false };
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [], "a": [null] };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(204)", expected, outcome);

			definitions = [{ names: ["b"], vendorReserved: true }];
			argv = ["-Wb"];
			config = null;
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [], "_vendor": { "_list": [{ "flag": true, "posix": false, "optionName": "b", "propertyName": "b", "definitionItemIndex": 0 }], "b": true } };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(2060)", expected, outcome);

			definitions = [{ names: ["b"], vendorReserved: true, value: { parser: Type.String, default: "z" } }];
			argv = ["-Wb="];
			config = null;
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [], "_vendor": { "_list": [{ "assignable": true, "posix": false, "optionName": "b", "propertyName": "b", "rawValue": null, "value": "z", "definitionItemIndex": 0 }], "b": "z" } };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(2063)", expected, outcome);

			definitions = [{ names: ["b"], vendorReserved: true, value: { parser: Type.String } }];
			argv = ["-Wb=1"];
			config = null;
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [], "_vendor": { "_list": [{ "assignable": true, "posix": false, "optionName": "b", "propertyName": "b", "rawValue": "1", "value": "1", "definitionItemIndex": 0 }], "b": "1" } };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(2064)", expected, outcome);

			definitions = [{ names: ["b"], vendorReserved: true, value: { parser: Type.String, default: "z" } }];
			argv = ["-Wb=1"];
			config = null;
			expected = { "_list": [], "_operands": [], "_operands0": [], "_operands1": [], "_vendor": { "_list": [{ "assignable": true, "posix": false, "optionName": "b", "propertyName": "b", "rawValue": "1", "value": "1", "definitionItemIndex": 0 }], "b": "1" } };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(2065)", expected, outcome);

			definitions = [{ names: ["a"] }, { names: ["b"], vendorReserved: true }];
			argv = ["--a", "-Wb"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": false, "optionName": "a", "propertyName": "a", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": true, "_vendor": { "_list": [{ "flag": true, "posix": false, "optionName": "b", "propertyName": "b", "definitionItemIndex": 1 }], "b": true } };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(2067)", expected, outcome);

			definitions = [{ names: ["a"] }, { names: ["b"], vendorReserved: true, value: { parser: Type.String, default: "z" } }];
			argv = ["--a", "-Wb=1"];
			config = null;
			expected = { "_list": [{ "flag": true, "posix": false, "optionName": "a", "propertyName": "a", "definitionItemIndex": 0 }], "_operands": [], "_operands0": [], "_operands1": [], "a": true, "_vendor": { "_list": [{ "assignable": true, "posix": false, "optionName": "b", "propertyName": "b", "rawValue": "1", "value": "1", "definitionItemIndex": 1 }], "b": "1" } };
			outcome = Options.json(definitions, argv, config); if (!t(expected, outcome)) fail("(2068)", expected, outcome);

			definitions = [{ names: ["a", "a"] }];
			argv = [];
			config = null;
			expected = `0x7F7A77 Argument is invalid: "definitions": duplicate option name "a". Related index: 0. Related property: "names[1]".`;
			try { Options.json(definitions, argv, config); fail("(200)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(205)", expected, ex.message); }

			definitions = [{ names: ["a"] }, { names: ["a"] }];
			argv = [];
			config = null;
			expected = `0x7F7A77 Argument is invalid: "definitions": duplicate option name "a". Related index: 1. Related property: "names[0]".`;
			try { Options.json(definitions, argv, config); fail("(210)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(2101)", expected, ex.message); }

			definitions = [];
			argv = ["-Wb"];
			config = null;
			expected = `0xC12006 Invalid option "b".`;
			try { Options.json(definitions, argv, config); fail("(220)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(2201)", expected, ex.message); }

			definitions = [];
			argv = ["--__proto__=1"];
			config = { gnu_rejectUnknownAssignables: false };
			expected = `0xA714A7 Invalid character in long option name; gnu_state: State_Gnu_LongOption, State_Posix_Input, null, --__proto__=1, argumentOffset: 0, characterOffset: 2.`;
			try { Options.json(definitions, argv, config); fail("(230)", expected, null); } catch (ex) { if (ex.message.indexOf(expected) !== 0) fail("(2301)", expected, ex.message); }

		}

		//	Options.format
		{
			const t = (expected, outcome) => { return outcome === expected };
			const fail = (title, expected, outcome) => result.push({ testName: `Options.format, ${title}`, expected: expected, outcome: outcome });

			definitions = [];
			settings = null;
			expected = "";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(10)", expected, outcome);

			definitions = ["a"];
			settings = null;
			expected = "\na\n\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(20)", expected, outcome);

			definitions = ["a"];
			settings = { newLine: "$" };
			expected = "$a$$";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(20)", expected, outcome);

			definitions = [{ names: ["a"] }];
			settings = null;
			expected = " -a,                          (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(30)", expected, outcome);

			definitions = [{ names: ["a"], description: "description" }];
			settings = null;
			expected = " -a,                          description\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(35)", expected, outcome);

			definitions = [{ names: ["a", "bc"] }];
			settings = null;
			expected = " -a, --bc                     (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(40)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-1234567890"] }];
			settings = null;
			expected = " -a, --1234567890-1234567890  (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(50)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-12345678901"] }];
			settings = null;
			expected = " -a, --1234567890-12345678901   (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(60)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-1234567890-1"] }];
			settings = null;
			expected = " -a, --1234567890-1234567890-1   (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(70)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-1234567890-12"] }];
			settings = null;
			expected = " -a, --1234567890-1234567890-12   (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(80)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-1234567890-1234567890"] }];
			settings = { rightMargin: 40 };
			expected = " -a, --1234567890-1234567890-1234567890\n                              (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(83)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-1234567890-1234567890-1234567890"] }];
			settings = { rightMargin: 40 };
			expected = " -a, \n     --1234567890-1234567890-1234567890-1234567890\n                              (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(84)", expected, outcome);

			definitions = [{ names: ["a", "1234567890-1234567890", "2234567890-1234567890"] }];
			settings = { rightMargin: 40 };
			expected = " -a, --1234567890-1234567890\n     --2234567890-1234567890  (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(85)", expected, outcome);

			definitions = [{ names: ["a"], description: "1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890" }];
			settings = { rightMargin: 60 };
			expected = " -a,                          1234567890 1234567890 1234567890\n                              1234567890 1234567890 1234567890\n                              1234567890\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(86)", expected, outcome);

			definitions = [{ names: ["a"], description: "1234567890\n1234567890 1234567890 1234567890 1234567890 1234567890 1234567890" }];
			settings = { rightMargin: 60 };
			expected = " -a,                          1234567890\n                              1234567890 1234567890 1234567890\n                              1234567890 1234567890 1234567890\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(87)", expected, outcome);

			definitions = [{ names: ["mmm", "a", "zzz-zzz"] }];
			settings = null;
			expected = " -a, --mmm, --zzz-zzz         (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(90)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: Type.String }, argument: "AAA" }];
			settings = null;
			expected = " -aAAA,                       (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(100)", expected, outcome);

			definitions = [{ names: ["a"], value: { parser: Type.String, default: null }, argument: "AAA" }];
			settings = null;
			expected = " -a[AAA],                     (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(110)", expected, outcome);

			definitions = [{ names: ["a", "bc"], value: { parser: Type.String }, argument: "AAA" }];
			settings = null;
			expected = " -a, --bc=AAA                 (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(120)", expected, outcome);

			definitions = [{ names: ["a", "bc"], value: { parser: Type.String, default: null }, argument: "AAA" }];
			settings = null;
			expected = " -a, --bc[=AAA]               (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(130)", expected, outcome);

			definitions = [{ names: ["v", "version"], value: { parser: Type.String }, argument: "MINOR[.MAJOR]" }];
			settings = null;
			expected = " -v, --version=MINOR[.MAJOR]  (n/a)\n";
			outcome = Options.format(definitions, settings); if (!t(expected, outcome)) fail("(140)", expected, outcome);
		}
	}
}

module.exports.UnitTests_Options = module.exports;
