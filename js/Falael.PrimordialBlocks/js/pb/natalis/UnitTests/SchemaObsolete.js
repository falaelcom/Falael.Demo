//	R0Q2/daniel/20220505
"use strict";

const { LiteralType } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { NativeGraph } = require("-/pb/natalis/014/NativeGraph.js");
const { SchemaObsolete } = require("-/pb/natalis/070/SchemaObsolete.js");

module.exports =

class UnitTests_SchemaObsolete
{
	//	Category: Unit test
	//	Function: Run unit tests for all class methods.
	static unitTest_SchemaObsolete(result)
	{
		const reset = () => { context = { _doc: {} }; sb.length = 0; };
		const test = (outcome, expected) => Diagnostics.format(outcome) === Diagnostics.format(expected);
		const fail = (testName, expected, outcome) => result.push({ testName, expected: Diagnostics.format(expected), outcome: Diagnostics.format(outcome) });
		const failErr = (testName, expected, outcome) => result.push({ testName, expected: Diagnostics.format(expected), outcome: Diagnostics.format(outcome) });

		//const zzz = outcome;
		//window.addEventListener("load", () =>
		//{
		//	const zz = document.createElement("pre"); zz.innerText = zzz; document.body.appendChild(zz);
		//});

		let obj, temp;
		let outcome;
		let expected, expected2;
		let schema;
		let model;
		let subject;

		let context;
		let sb = [];

		test_generateCode_validate();
		test_model_test_explain();
		test_SchemaObsolete_parseDef_regular_workflow();
		test_SchemaObsolete_parseDef_errors();
		test_SchemaObsolete_walkTypeDefList();
		test_pins();
		test_serialize();
		test_deserialize();

		//	SchemaObsolete.parseDef - regular workflow; `"any"` not tested.
		function test_SchemaObsolete_parseDef_regular_workflow()
		{
			obj = {};
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = true;
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Boolean }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = null;
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Null }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = 0;
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Number }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = "";
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.string;
			expected = [{ hintPath: "'{}'", path: "'{}'.'string'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { string: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'string'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { string: "string" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'string'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: [SchemaObsolete.string] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'array'", type: SchemaObsolete.Array, elementAlternatives: [{ hintPath: "'{}'.'array'[0]", path: "'{}'.'array'[0].'string'", type: SchemaObsolete.String }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { number: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'number'", type: SchemaObsolete.Number }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.number;
			expected = [{ hintPath: "'{}'", path: "'{}'.'number'", type: SchemaObsolete.Number }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { number: "number" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'number'", type: SchemaObsolete.Number }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { boolean: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'boolean'", type: SchemaObsolete.Boolean }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.boolean;
			expected = [{ hintPath: "'{}'", path: "'{}'.'boolean'", type: SchemaObsolete.Boolean }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { boolean: "boolean" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'boolean'", type: SchemaObsolete.Boolean }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { NU: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'NU'", type: SchemaObsolete.NullOrUndefined }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.NU;
			expected = [{ hintPath: "'{}'", path: "'{}'.'NU'", type: SchemaObsolete.NullOrUndefined }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { NU: "NU" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'NU'", type: SchemaObsolete.NullOrUndefined }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { null: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'null'", type: SchemaObsolete.Null }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.null;
			expected = [{ hintPath: "'{}'", path: "'{}'.'null'", type: SchemaObsolete.Null }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { null: "null" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'null'", type: SchemaObsolete.Null }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { void: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'void'", type: SchemaObsolete.Void }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.void;
			expected = [{ hintPath: "'{}'", path: "'{}'.'void'", type: SchemaObsolete.Void }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { void: "void" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'void'", type: SchemaObsolete.Void }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.object;
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: "object" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: "objex" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.objex;
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {} };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: {} };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, properties: [], propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { a: 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'object'.'a'", path: "'{}'.'object'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: { a: 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'objex'.'a'", path: "'{}'.'objex'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { struct: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'struct'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.struct;
			expected = [{ hintPath: "'{}'", path: "'{}'.'struct'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { struct: "struct" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'struct'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { strux: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'strux'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.strux;
			expected = [{ hintPath: "'{}'", path: "'{}'.'strux'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { strux: "strux" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'strux'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { struct: {} };
			expected = [{ hintPath: "'{}'", path: "'{}'.'struct'", type: SchemaObsolete.Object, classAgnostic: true, properties: [], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { strux: {} };
			expected = [{ hintPath: "'{}'", path: "'{}'.'strux'", type: SchemaObsolete.Object, properties: [], propertyExclusive: false, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { struct: { a: 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'struct'", type: SchemaObsolete.Object, classAgnostic: true, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'struct'.'a'", path: "'{}'.'struct'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { strux: { a: 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'strux'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'strux'.'a'", path: "'{}'.'strux'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: false, classAgnostic: true }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { a: 0 };
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'a'", path: "'{}'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{ object: { a: 0 } }, { object: { b: "" } }] };
			expected = [{ "hintPath": "'{}'.'alt'[0]", "path": "'{}'.'alt'[0].'object'", type: SchemaObsolete.Object, "properties": [{ "name": "a", "alternatives": [{ "hintPath": "'{}'.'alt'[0].'object'.'a'", "path": "'{}'.'alt'[0].'object'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }, { "hintPath": "'{}'.'alt'[1]", "path": "'{}'.'alt'[1].'object'", type: SchemaObsolete.Object, "properties": [{ "name": "b", "alternatives": [{ "hintPath": "'{}'.'alt'[1].'object'.'b'", "path": "'{}'.'alt'[1].'object'.'b'", type: SchemaObsolete.String }] }], propertyExclusive: true, classAgnostic: false }]
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{ a: 0 }, { b: "" }] };
			expected = [{ "hintPath": "'{}'.'alt'[0]", "path": "'{}'.'alt'[0]", type: SchemaObsolete.Object, "properties": [{ "name": "a", "alternatives": [{ "hintPath": "'{}'.'alt'[0].'a'", "path": "'{}'.'alt'[0].'a'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }, { "hintPath": "'{}'.'alt'[1]", "path": "'{}'.'alt'[1]", type: SchemaObsolete.Object, "properties": [{ "name": "b", "alternatives": [{ "hintPath": "'{}'.'alt'[1].'b'", "path": "'{}'.'alt'[1].'b'", type: SchemaObsolete.String }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { any: 1 };
			expected = [{ "hintPath": "'{}'", "path": "'{}'.'any'", type: SchemaObsolete.Any }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = SchemaObsolete.any;
			expected = [{ "hintPath": "'{}'", "path": "'{}'.'any'", type: SchemaObsolete.Any }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { any: "any" };
			expected = [{ "hintPath": "'{}'", "path": "'{}'.'any'", type: SchemaObsolete.Any }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { string: 1, any: 1 };
			expected = [{ "hintPath": "'{}'", "path": "'{}'.'string'", type: SchemaObsolete.String }, { "hintPath": "'{}'", "path": "'{}'.'any'", type: SchemaObsolete.Any }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { any: 1, string: 1 };
			expected = [{ "hintPath": "'{}'", "path": "'{}'.'any'", type: SchemaObsolete.Any }, { "hintPath": "'{}'", "path": "'{}'.'string'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { a: 0, b: "" } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'object'.'a'", path: "'{}'.'object'.'a'", type: SchemaObsolete.Number }] }, { name: "b", alternatives: [{ hintPath: "'{}'.'object'.'b'", path: "'{}'.'object'.'b'", type: SchemaObsolete.String }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: { a: 0, b: "" } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'objex'.'a'", path: "'{}'.'objex'.'a'", type: SchemaObsolete.Number }] }, { name: "b", alternatives: [{ hintPath: "'{}'.'objex'.'b'", path: "'{}'.'objex'.'b'", type: SchemaObsolete.String }] }], propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { a: 0, b: "" };
			expected = [{ "hintPath": "'{}'", "path": "'{}'", type: SchemaObsolete.Object, "properties": [{ "name": "a", "alternatives": [{ "hintPath": "'{}'.'a'", "path": "'{}'.'a'", type: SchemaObsolete.Number }] }, { "name": "b", "alternatives": [{ "hintPath": "'{}'.'b'", "path": "'{}'.'b'", type: SchemaObsolete.String }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { a: 0 }, string: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'object'.'a'", path: "'{}'.'object'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }, { hintPath: "'{}'", path: "'{}'.'string'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: { a: 0 }, string: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, properties: [{ name: "a", alternatives: [{ hintPath: "'{}'.'objex'.'a'", path: "'{}'.'objex'.'a'", type: SchemaObsolete.Number }] }], propertyExclusive: false, classAgnostic: false }, { hintPath: "'{}'", path: "'{}'.'string'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{}] };
			expected = [{ hintPath: "'{}'.'alt'[0]", path: "'{}'.'alt'[0]", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1000)`, expected, outcome);

			obj = { array: 1 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'array'", type: SchemaObsolete.Array }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: "array" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'array'", type: SchemaObsolete.Array }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: [] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'array'", type: SchemaObsolete.Array }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = [0];
			expected = [{ "hintPath": "'{}'.'alt'[0]", "path": "'{}'.'alt'[0]", type: SchemaObsolete.Number }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = [0, ""];
			expected = [{ "hintPath": "'{}'.'alt'[0]", "path": "'{}'.'alt'[0]", type: SchemaObsolete.Number }, { "hintPath": "'{}'.'alt'[1]", "path": "'{}'.'alt'[1]", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: [0] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'array'", type: SchemaObsolete.Array, elementAlternatives: [{ hintPath: "'{}'.'array'[0]", path: "'{}'.'array'[0]", type: SchemaObsolete.Number }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: [0, ""] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'array'", type: SchemaObsolete.Array, elementAlternatives: [{ hintPath: "'{}'.'array'[0]", path: "'{}'.'array'[0]", type: SchemaObsolete.Number }, { hintPath: "'{}'.'array'[1]", path: "'{}'.'array'[1]", type: SchemaObsolete.String }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: 0 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'also'", type: SchemaObsolete.Atom, valueType: LiteralType.Number, value: 0 }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: [0] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'also'[0]", type: SchemaObsolete.Atom, valueType: LiteralType.Number, value: 0 }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: [0, "2"] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'also'[0]", type: SchemaObsolete.Atom, valueType: LiteralType.Number, value: 0 }, { hintPath: "'{}'", path: "'{}'.'also'[1]", type: SchemaObsolete.Atom, valueType: LiteralType.String, value: "2" }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: void 0 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'also'", type: SchemaObsolete.Atom, valueType: LiteralType.Undefined, value: void 0 }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { is: void 0 };
			expected = [{ hintPath: "'{}'", path: "'{}'.'is'", type: SchemaObsolete.Atom, valueType: LiteralType.Undefined, value: void 0 }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{}] };
			expected = [{ hintPath: "'{}'.'alt'[0]", path: "'{}'.'alt'[0]", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [0, {}] };
			expected = [{ hintPath: "'{}'.'alt'[0]", path: "'{}'.'alt'[0]", type: SchemaObsolete.Number }, { hintPath: "'{}'.'alt'[1]", path: "'{}'.'alt'[1]", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [0, { object: {} }] };
			expected = [{ hintPath: "'{}'.'alt'[0]", path: "'{}'.'alt'[0]", type: SchemaObsolete.Number }, { hintPath: "'{}'.'alt'[1]", path: "'{}'.'alt'[1].'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [0, { objex: {} }] };
			expected = [{ hintPath: "'{}'.'alt'[0]", path: "'{}'.'alt'[0]", type: SchemaObsolete.Number }, { hintPath: "'{}'.'alt'[1]", path: "'{}'.'alt'[1].'objex'", type: SchemaObsolete.Object, properties: [], propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { match: "" };
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Any, match: [{ key: "" }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, match: "a" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false, match: [{ key: "a" }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, match: ["a"] };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false, match: [{ key: "a" }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, match: { a: { b: 1 } } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false, match: [{ key: "a", config: { b: 1 } }] }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, string: 1, match: "a" };
			temp = [{ key: "a" }];
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false, match: temp }, { hintPath: "'{}'", path: "'{}'.'string'", type: SchemaObsolete.String, match: temp }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { string: 1, also: 1, match: "a" };
			expected = [{ "hintPath": "'{}'", "path": "'{}'.'string'", type: SchemaObsolete.String, "match": [{ "key": "a" }] }, { "hintPath": "'{}'", "path": "'{}'.'also'", type: SchemaObsolete.Atom, valueType: LiteralType.Number, "value": 1 }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{}, { objex: 1 }] };
			expected = [{ "hintPath": "'{}'.'alt'[0]", "path": "'{}'.'alt'[0]", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }, { "hintPath": "'{}'.'alt'[1]", "path": "'{}'.'alt'[1].'objex'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: {} };
			expected = [{ hintPath: "'{}'", path: "'{}'.'objex'", type: SchemaObsolete.Object, properties: [], propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, hint: "a" };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, outcome);
			expected2 = { "_doc": { "'{}'": "a" } };
			if (!test(context, expected2)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected2, context);

			obj = { alt: [0, {}], hint: "a" };
			expected = [{ hintPath: "'{}'.'alt'[0]", path: "'{}'.'alt'[0]", type: SchemaObsolete.Number }, { hintPath: "'{}'.'alt'[1]", path: "'{}'.'alt'[1]", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, outcome);
			expected2 = { "_doc": { "'{}'": "a" } };
			if (!test(context, expected2)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected2, context);

			obj = { alt: [{ object: { z: 0 }, hint: "a" }, { object: { z: 0 }, hint: "b" }] };
			expected = [{ "hintPath": "'{}'.'alt'[0]", "path": "'{}'.'alt'[0].'object'", type: SchemaObsolete.Object, "properties": [{ "name": "z", "alternatives": [{ "hintPath": "'{}'.'alt'[0].'object'.'z'", "path": "'{}'.'alt'[0].'object'.'z'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }, { "hintPath": "'{}'.'alt'[1]", "path": "'{}'.'alt'[1].'object'", type: SchemaObsolete.Object, "properties": [{ "name": "z", "alternatives": [{ "hintPath": "'{}'.'alt'[1].'object'.'z'", "path": "'{}'.'alt'[1].'object'.'z'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, outcome);
			expected2 = { "_doc": { "'{}'.'alt'[0]": "a", "'{}'.'alt'[1]": "b" } };
			if (!test(context, expected2)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected2, context);

			obj = { object: { z: { object: 1, hint: "a" } } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ name: "z", alternatives: [{ hintPath: "'{}'.'object'.'z'", path: "'{}'.'object'.'z'.'object'", type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: false }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, outcome);
			expected2 = { "_doc": { "'{}'.'object'.'z'": "a" } };
			if (!test(context, expected2)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected2, context);

			obj = { object: { z: { objex: 1, hint: "a" } } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ name: "z", alternatives: [{ hintPath: "'{}'.'object'.'z'", path: "'{}'.'object'.'z'.'objex'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, outcome);
			expected2 = { "_doc": { "'{}'.'object'.'z'": "a" } };
			if (!test(context, expected2)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected2, context);

			obj = { object: { "": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "", alternatives: [{ hintPath: "'{}'.'object'.''", path: "'{}'.'object'.''", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { "\0": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "\0", alternatives: [{ hintPath: "'{}'.'object'.'\0'", path: "'{}'.'object'.'\0'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { ".": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": ".", alternatives: [{ hintPath: "'{}'.'object'.'.'", path: "'{}'.'object'.'.'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { "'": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "'", alternatives: [{ hintPath: "'{}'.'object'.'\\''", path: "'{}'.'object'.'\\''", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { "\\": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "\\", alternatives: [{ hintPath: "'{}'.'object'.'\\\\'", path: "'{}'.'object'.'\\\\'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { "1'2": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "1'2", alternatives: [{ hintPath: "'{}'.'object'.'1\\'2'", path: "'{}'.'object'.'1\\'2'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { "1\\2": 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "1\\2", alternatives: [{ hintPath: "'{}'.'object'.'1\\\\2'", path: "'{}'.'object'.'1\\\\2'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { [5]: 0 } };
			expected = [{ hintPath: "'{}'", path: "'{}'.'object'", type: SchemaObsolete.Object, properties: [{ "name": "5", alternatives: [{ hintPath: "'{}'.'object'.'5'", path: "'{}'.'object'.'5'", type: SchemaObsolete.Number }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { typedef: "" };
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.String }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { typedef: 0 };
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Number }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { typedef: {} };
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { typedef: { porp: "" } };
			expected = [{ hintPath: "'{}'", path: "'{}'", type: SchemaObsolete.Object, properties: [{ name: "porp", alternatives: [{ hintPath: "'{}'.'porp'", path: "'{}'.'porp'", type: SchemaObsolete.String }] }], propertyExclusive: true, classAgnostic: false }];
			reset(); if (!test(outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), expected)) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)})`, expected, outcome);
		}

		//	SchemaObsolete.parseDef - errors
		function test_SchemaObsolete_parseDef_errors()
		{
			obj = false;
			expected = `0x3DDCE8 Invalid "boolean" schema definition at "'{}'": false. Hint: true.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail("SchemaObsolete.parseDef(false) (1)", expected, null) } catch (ex) { if (ex.message !== expected) fail("SchemaObsolete.parseDef(false) (2)", expected, ex.message) }

			obj = 5;
			expected = `0xF31ECA Invalid "number" schema definition at "'{}'": 5. Hint: 0.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail("SchemaObsolete.parseDef(5) (1)", expected, null) } catch (ex) { if (ex.message !== expected) fail("SchemaObsolete.parseDef(5) (2)", expected, ex.message) }

			obj = "a";
			expected = `0x740449 Invalid "string" schema definition at "'{}'": "a". Hint: "".`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef("a") (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef("a") (2)`, expected, ex.message) }

			obj = { string: 0 };
			expected = `0xF24527 Invalid "string" schema definition at "'{}'.'string'": 0. Hint: { string: 1 || "string" }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { number: 0 };
			expected = `0xA0E48B Invalid "number" schema definition at "'{}'.'number'": 0. Hint: { number: 1 || "number" }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { boolean: 0 };
			expected = `0x8C21BF Invalid "boolean" schema definition at "'{}'.'boolean'": 0. Hint: { boolean: 1 || "boolean" }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { object: 0 };
			expected = `0x514F4C Invalid "object" schema definition type at "'{}'.'object'": Number. Hint: { object: 1 || "object" || { <property type defs> } }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { object: [] };
			expected = `0x514F4C Invalid "object" schema definition type at "'{}'.'object'": Array. Hint: { object: 1 || "object" || { <property type defs> } }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { objex: 0 };
			expected = `0x417681 Invalid "objex" schema definition type at "'{}'.'objex'": Number. Hint: { objex: 1 || "objex" || { <property type defs> } }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { objex: [] };
			expected = `0x417681 Invalid "objex" schema definition type at "'{}'.'objex'": Array. Hint: { objex: 1 || "objex" || { <property type defs> } }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { array: 0 };
			expected = `0xDB0D7A Invalid "array" schema definition type at "'{}'.'array'": Number. Hint: { array: 1 || "array" || [<element type defs>] }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { array: {} };
			expected = `0xDB0D7A Invalid "array" schema definition type at "'{}'.'array'": Object. Hint: { array: 1 || "array" || [<element type defs>] }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { zzz: 1 };
			expected = `0xF31ECA Invalid "number" schema definition at "'{}'.'zzz'": 1. Hint: 0.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { also: {} };
			expected = `0x6FCEA4 Invalid "also" schema definition type at "'{}'.'also'": Object. Supported types are null, undefined, boolean, number, string, non-empty array.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { also: [] };
			expected = `0x851B24 Invalid "also" schema definition type at "'{}'.'also'": Array; array is empty. Supported types are null, undefined, boolean, number, string, non-empty array.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { also: [{}] };
			expected = `0x76E175 Invalid "also" schema definition value type at "'{}'.'also'[0]": Object. Supported types are null, undefined, boolean, number, string.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { also: [[]] };
			expected = `0x76E175 Invalid "also" schema definition value type at "'{}'.'also'[0]": Array. Supported types are null, undefined, boolean, number, string.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { alt: {} };
			expected = `0xAA717B Invalid "alt" schema definition type at "'{}'.'alt'": Object. Hint: { alt: [<type defs>] }, where [<type defs>] must be a non-empty array of objects.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { alt: [] };
			expected = `0x6221C8 Invalid "alt" schema definition type at "'{}'.'alt'": Array; array is empty. Hint: { alt: [<type defs>] }, where [<type defs>] must be a non-empty array of objects.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { match: 1 };
			expected = `0xB88947 Invalid "match" schema definition type at "'{}'.'match'": Number. Hint: { match: [ "<validator full name>" ] || { "<validator full name>": 1 || <config>, ... } }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { hint: "" };
			expected = `0x614920 Invalid schema definition at "'{}'": at least one type definition or a match directive is required. Hint: { also || alt || any || array || boolean || is || NU || null || number || object || objex || string || struct || strux || void, hint, match }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { also: 1, match: "a" };
			expected = `0xFED901 The "match" directive will have no effect at "'{}'".`;
			reset(); try { outcome = SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); _Schema_validateTypeDefList(outcome, { a: () => true }); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { object: {}, match: [{}] };
			expected = `0xFFE2F4 Invalid "match" schema definition type at "'{}'.'match'": Array. Hint: { match: [ "<validator full name>" ] || { "<validator full name>": 1 || <config>, ... } }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { object: {}, hint: null };
			expected = `0x4AC40B Invalid "hint" schema definition type at "'{}'.'hint'": Null. Hint: { hint: "" }.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }

			obj = { is: 1, null: 1 };
			expected = `0xE859D3 Invalid schema definition at "'{}'": the is directive cannot be combined with other directives except for hint. Hint: {is, hint}.`;
			reset(); try { SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj); fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (1)`, expected, null) } catch (ex) { if (ex.message !== expected) fail(`SchemaObsolete.parseDef(${Diagnostics.format(obj)}) (2)`, expected, ex.message) }
		}

		function test_SchemaObsolete_walkTypeDefList()
		{
			const onStructural = function (structural, path, jsonPath, depth, typeDef)
			{
				sb.push('|');
				sb.push(structural.description);
				sb.push('(');
				sb.push(depth);
				sb.push(')');

				for (let length = jsonPath.length, i = 0; i < length; ++i) sb.push(`[${JSON.stringify(jsonPath[i])}]`);

				switch (structural)
				{
					case SchemaObsolete.Structural_AltList:
					case SchemaObsolete.Structural_AltListEnd:
					case SchemaObsolete.Structural_Alt:
					case SchemaObsolete.Structural_AltEnd:
					case SchemaObsolete.Structural_ObjectPropertyEnd:
					case SchemaObsolete.Structural_ObjectEnd:
					case SchemaObsolete.Structural_ArrayEnd:
						break;
					case SchemaObsolete.Structural_CustomMatch:
						sb.push(':');
						sb.push(JSON.stringify(typeDef.match));
						sb.push(',');
						sb.push(JSON.stringify(path));
						break;
					case SchemaObsolete.Structural_Any:
					case SchemaObsolete.Structural_Object:
					case SchemaObsolete.Structural_ObjectProperty:
					case SchemaObsolete.Structural_Array:
					case SchemaObsolete.Structural_Number:
					case SchemaObsolete.Structural_String:
					case SchemaObsolete.Structural_Boolean:
					case SchemaObsolete.Structural_Value:
						sb.push(',');
						sb.push(JSON.stringify(typeDef));
						break;
					default: throw `Not implemented.`;
				}
			};

			obj = {};
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'\",\"propertyExclusive\":false,\"classAgnostic\":false}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			//obj = [];
			//expected = "|Structural_Array(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'\"}|Structural_ArrayEnd(0)";
			//reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = true;
			expected = "|Structural_Boolean(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = 0;
			expected = "|Structural_Number(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = "";
			expected = "|Structural_String(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { any: 1 };
			expected = "|Structural_Any(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'any'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { string: 1 };
			expected = "|Structural_String(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'string'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { number: 1 };
			expected = "|Structural_Number(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'number'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { boolean: 1 };
			expected = "|Structural_Boolean(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'boolean'\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: 1 };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { objex: 1 };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'objex'\",\"propertyExclusive\":false,\"classAgnostic\":false}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { struct: 1 };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'struct'\",\"propertyExclusive\":true,\"classAgnostic\":true}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {} };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { a: 0 } };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"a\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"a\"],{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}|Structural_Number(1)[\"a\"],{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}|Structural_ObjectPropertyEnd(0)[\"a\"]|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { "'": 0 } };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"'\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'\\\\''\",\"path\":\"'{}'.'object'.'\\\\''\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"'\"],{\"hintPath\":\"'{}'.'object'.'\\\\''\",\"path\":\"'{}'.'object'.'\\\\''\"}|Structural_Number(1)[\"'\"],{\"hintPath\":\"'{}'.'object'.'\\\\''\",\"path\":\"'{}'.'object'.'\\\\''\"}|Structural_ObjectPropertyEnd(0)[\"'\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { '"': 0 } };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"\\\"\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'\\\"'\",\"path\":\"'{}'.'object'.'\\\"'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"\\\"\"],{\"hintPath\":\"'{}'.'object'.'\\\"'\",\"path\":\"'{}'.'object'.'\\\"'\"}|Structural_Number(1)[\"\\\"\"],{\"hintPath\":\"'{}'.'object'.'\\\"'\",\"path\":\"'{}'.'object'.'\\\"'\"}|Structural_ObjectPropertyEnd(0)[\"\\\"\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { any: 1, string: 1 };
			expected = "|Structural_AltList(0)|Structural_Alt(0)|Structural_Any(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'any'\"}|Structural_AltEnd(0)|Structural_Alt(0)|Structural_String(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'string'\"}|Structural_AltEnd(0)|Structural_AltListEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{ a: 0 }, { b: "" }] };
			expected = `|Structural_AltList(0)|Structural_Alt(0)|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\",\"properties\":[{\"name\":\"a\",\"alternatives\":[{\"hintPath\":\"'{}'.'alt'[0].'a'\",\"path\":\"'{}'.'alt'[0].'a'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"a\"],{\"hintPath\":\"'{}'.'alt'[0].'a'\",\"path\":\"'{}'.'alt'[0].'a'\"}|Structural_Number(1)[\"a\"],{\"hintPath\":\"'{}'.'alt'[0].'a'\",\"path\":\"'{}'.'alt'[0].'a'\"}|Structural_ObjectPropertyEnd(0)[\"a\"]|Structural_ObjectEnd(0)|Structural_AltEnd(0)|Structural_Alt(0)|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[1]\",\"path\":\"'{}'.'alt'[1]\",\"properties\":[{\"name\":\"b\",\"alternatives\":[{\"hintPath\":\"'{}'.'alt'[1].'b'\",\"path\":\"'{}'.'alt'[1].'b'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"b\"],{\"hintPath\":\"'{}'.'alt'[1].'b'\",\"path\":\"'{}'.'alt'[1].'b'\"}|Structural_String(1)[\"b\"],{\"hintPath\":\"'{}'.'alt'[1].'b'\",\"path\":\"'{}'.'alt'[1].'b'\"}|Structural_ObjectPropertyEnd(0)[\"b\"]|Structural_ObjectEnd(0)|Structural_AltEnd(0)|Structural_AltListEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { a: 0, b: "" } };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"a\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}]},{\"name\":\"b\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'b'\",\"path\":\"'{}'.'object'.'b'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"a\"],{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}|Structural_Number(1)[\"a\"],{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}|Structural_ObjectPropertyEnd(0)[\"a\"]|Structural_ObjectProperty(0)[\"b\"],{\"hintPath\":\"'{}'.'object'.'b'\",\"path\":\"'{}'.'object'.'b'\"}|Structural_String(1)[\"b\"],{\"hintPath\":\"'{}'.'object'.'b'\",\"path\":\"'{}'.'object'.'b'\"}|Structural_ObjectPropertyEnd(0)[\"b\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { a: 0 }, string: 1 };
			expected = `|Structural_AltList(0)|Structural_Alt(0)|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"a\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"a\"],{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}|Structural_Number(1)[\"a\"],{\"hintPath\":\"'{}'.'object'.'a'\",\"path\":\"'{}'.'object'.'a'\"}|Structural_ObjectPropertyEnd(0)[\"a\"]|Structural_ObjectEnd(0)|Structural_AltEnd(0)|Structural_Alt(0)|Structural_String(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'string'\"}|Structural_AltEnd(0)|Structural_AltListEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{}] };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\",\"propertyExclusive\":false,\"classAgnostic\":false}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: 1 };
			expected = "|Structural_Array(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'array'\"}|Structural_ArrayEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { array: [] };
			expected = "|Structural_Array(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'array'\"}|Structural_ArrayEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = [0];
			expected = "|Structural_Number(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\"}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = [0, ""];
			expected = "|Structural_AltList(0)|Structural_Alt(0)|Structural_Number(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\"}|Structural_AltEnd(0)|Structural_Alt(0)|Structural_String(0),{\"hintPath\":\"'{}'.'alt'[1]\",\"path\":\"'{}'.'alt'[1]\"}|Structural_AltEnd(0)|Structural_AltListEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = [{ object: { z: { object: { x: 0 } } } }];
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0].'object'\",\"properties\":[{\"name\":\"z\",\"alternatives\":[{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'\",\"path\":\"'{}'.'alt'[0].'object'.'z'.'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"z\"],{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'\",\"path\":\"'{}'.'alt'[0].'object'.'z'\"}|Structural_Object(1)[\"z\"],{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'\",\"path\":\"'{}'.'alt'[0].'object'.'z'.'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(1)[\"z\"][\"x\"],{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\"}|Structural_Number(2)[\"z\"][\"x\"],{\"hintPath\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\"}|Structural_ObjectPropertyEnd(1)[\"z\"][\"x\"]|Structural_ObjectEnd(1)[\"z\"]|Structural_ObjectPropertyEnd(0)[\"z\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { z: [{ object: { x: 0 } }] } };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"z\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0]\",\"path\":\"'{}'.'object'.'z'.'alt'[0].'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"z\"],{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0]\",\"path\":\"'{}'.'object'.'z'.'alt'[0]\"}|Structural_Object(1)[\"z\"],{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0]\",\"path\":\"'{}'.'object'.'z'.'alt'[0].'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(1)[\"z\"][\"x\"],{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\"}|Structural_Number(2)[\"z\"][\"x\"],{\"hintPath\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'alt'[0].'object'.'x'\"}|Structural_ObjectPropertyEnd(1)[\"z\"][\"x\"]|Structural_ObjectEnd(1)[\"z\"]|Structural_ObjectPropertyEnd(0)[\"z\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: 0 };
			expected = "|Structural_Value(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'also'\",\"value\":0}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: [0] };
			expected = "|Structural_Value(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'also'[0]\",\"value\":0}";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { also: [0, "2"] };
			expected = "|Structural_AltList(0)|Structural_Alt(0)|Structural_Value(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'also'[0]\",\"value\":0}|Structural_AltEnd(0)|Structural_Alt(0)|Structural_Value(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'also'[1]\",\"value\":\"2\"}|Structural_AltEnd(0)|Structural_AltListEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [{}] };
			expected = "|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\",\"propertyExclusive\":false,\"classAgnostic\":false}|Structural_ObjectEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [0, {}] };
			expected = "|Structural_AltList(0)|Structural_Alt(0)|Structural_Number(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\"}|Structural_AltEnd(0)|Structural_Alt(0)|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[1]\",\"path\":\"'{}'.'alt'[1]\",\"propertyExclusive\":false,\"classAgnostic\":false}|Structural_ObjectEnd(0)|Structural_AltEnd(0)|Structural_AltListEnd(0)";
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { alt: [0, { object: {} }] };
			expected = `|Structural_AltList(0)|Structural_Alt(0)|Structural_Number(0),{\"hintPath\":\"'{}'.'alt'[0]\",\"path\":\"'{}'.'alt'[0]\"}|Structural_AltEnd(0)|Structural_Alt(0)|Structural_Object(0),{\"hintPath\":\"'{}'.'alt'[1]\",\"path\":\"'{}'.'alt'[1].'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectEnd(0)|Structural_AltEnd(0)|Structural_AltListEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, match: "a" };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}|Structural_ObjectEnd(0)|Structural_CustomMatch(0):[{\"key\":\"a\"}],[]`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { z: { object: {}, match: "a" } } };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"z\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'.'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"z\"],{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'\"}|Structural_Object(1)[\"z\"],{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'.'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}|Structural_ObjectEnd(1)[\"z\"]|Structural_CustomMatch(1)[\"z\"]:[{\"key\":\"a\"}],[{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"z\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'.'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}]}],\"propertyExclusive\":true,\"classAgnostic\":false},{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'\"}]|Structural_ObjectPropertyEnd(0)[\"z\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: { z: { object: { x: 0 }, match: "a" } } };
			expected = `|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"z\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'.'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}]}],\"propertyExclusive\":true,\"classAgnostic\":false}|Structural_ObjectProperty(0)[\"z\"],{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'\"}|Structural_Object(1)[\"z\"],{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'.'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}|Structural_ObjectProperty(1)[\"z\"][\"x\"],{\"hintPath\":\"'{}'.'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'object'.'x'\"}|Structural_Number(2)[\"z\"][\"x\"],{\"hintPath\":\"'{}'.'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'object'.'x'\"}|Structural_ObjectPropertyEnd(1)[\"z\"][\"x\"]|Structural_ObjectEnd(1)[\"z\"]|Structural_CustomMatch(1)[\"z\"]:[{\"key\":\"a\"}],[{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[{\"name\":\"z\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'.'object'\",\"properties\":[{\"name\":\"x\",\"alternatives\":[{\"hintPath\":\"'{}'.'object'.'z'.'object'.'x'\",\"path\":\"'{}'.'object'.'z'.'object'.'x'\"}]}],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}]}],\"propertyExclusive\":true,\"classAgnostic\":false},{\"hintPath\":\"'{}'.'object'.'z'\",\"path\":\"'{}'.'object'.'z'\"}]|Structural_ObjectPropertyEnd(0)[\"z\"]|Structural_ObjectEnd(0)`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);

			obj = { object: {}, string: 1, match: "a" };
			expected = `|Structural_AltList(0)|Structural_Alt(0)|Structural_Object(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'object'\",\"properties\":[],\"propertyExclusive\":true,\"classAgnostic\":false,\"match\":[{\"key\":\"a\"}]}|Structural_ObjectEnd(0)|Structural_AltEnd(0)|Structural_Alt(0)|Structural_String(0),{\"hintPath\":\"'{}'\",\"path\":\"'{}'.'string'\",\"match\":[{\"key\":\"a\"}]}|Structural_AltEnd(0)|Structural_AltListEnd(0)|Structural_CustomMatch(0):[{\"key\":\"a\"}],[]`;
			reset(); SchemaObsolete.walkTypeDefList(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), onStructural); outcome = sb.join(""); if (!test(outcome, expected)) fail(`SchemaObsolete.walkTypeDefList(${Diagnostics.format(obj)})`, expected, outcome);
		}

		//	SchemaObsolete.generateCode_validate
		function test_generateCode_validate()
		{
			obj = null;
			expected = "let rr, ri=0;FAIL:do{if(n !== null) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=9;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { void: 1 };
			expected = "let rr, ri=0;FAIL:do{if(n !== void 0) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'void'\",rr.h=\"'{}'\",rr.m=10;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = {};
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = true;
			expected = "let rr, ri=0;FAIL:do{if(n !== true && n !== false && (!n || n.constructor !== Boolean)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=8;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = 0;
			expected = "let rr, ri=0;FAIL:do{if((!n && n !== 0) || (n.constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=6;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = "";
			expected = "let rr, ri=0;FAIL:do{if((!n && n !== \"\") || (n.constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=7;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: 1 };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { struct: 1 };
			expected = "let rr, ri=0;FAIL:do{if(!n || !(n instanceof Object) || n.constructor === String || n.constructor === Number || n.constructor === Boolean || n.constructor === Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'struct'\",rr.h=\"'{}'\",rr.m=3;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'struct'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { objex: 1 };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'objex'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { strux: 1 };
			expected = "let rr, ri=0;FAIL:do{if(!n || !(n instanceof Object) || n.constructor === String || n.constructor === Number || n.constructor === Boolean || n.constructor === Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'strux'\",rr.h=\"'{}'\",rr.m=3;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: {} };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { objex: {} };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'objex'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { a: 0 } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}if((!n[\"a\"] && n[\"a\"] !== 0) || (n[\"a\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'a'\",rr.h=\"'{}'.'object'.'a'\",rr.m=6;break FAIL;}{const a = [\"a\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { objex: { a: 0 } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'objex'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}if((!n[\"a\"] && n[\"a\"] !== 0) || (n[\"a\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'objex'.'a'\",rr.h=\"'{}'.'objex'.'a'\",rr.m=6;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { z: { any: 1 } } };
			expected = `let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'object'",rr.h="'{}'",rr.m=2;break FAIL;}{const a = ["z"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'object'",rr.h="'{}'",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { alt: [{ a: 0 }, { b: "" }] };
			expected = `let rr, ri=0;FAIL:do{L0:do{A0:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[0]",rr.h="'{}'.'alt'[0]",rr.m=2;break A0;}if((!n["a"] && n["a"] !== 0) || (n["a"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[0].'a'",rr.h="'{}'.'alt'[0].'a'",rr.m=6;break A0;}{const a = ["a"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[0]",rr.h="'{}'.'alt'[0]",rr.m=4,rr.d=k;break A0;} }break L0;}while(false);A0:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[1]",rr.h="'{}'.'alt'[1]",rr.m=2;break A0;}if((!n["b"] && n["b"] !== "") || (n["b"].constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[1].'b'",rr.h="'{}'.'alt'[1].'b'",rr.m=7;break A0;}{const a = ["b"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[1]",rr.h="'{}'.'alt'[1]",rr.m=4,rr.d=k;break A0;} }break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'",rr.h="'{}'",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { a: 0, b: "" } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}if((!n[\"a\"] && n[\"a\"] !== 0) || (n[\"a\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'a'\",rr.h=\"'{}'.'object'.'a'\",rr.m=6;break FAIL;}if((!n[\"b\"] && n[\"b\"] !== \"\") || (n[\"b\"].constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'b'\",rr.h=\"'{}'.'object'.'b'\",rr.m=7;break FAIL;}{const a = [\"a\",\"b\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { a: 0, b: true }, string: 1 };
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break A0;}if((!n[\"a\"] && n[\"a\"] !== 0) || (n[\"a\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'a'\",rr.h=\"'{}'.'object'.'a'\",rr.m=6;break A0;}if(n[\"b\"] !== true && n[\"b\"] !== false && (!n[\"b\"] || n[\"b\"].constructor !== Boolean)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'b'\",rr.h=\"'{}'.'object'.'b'\",rr.m=8;break A0;}{const a = [\"a\",\"b\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break A0;} }break L0;}while(false);A0:do{if((!n && n !== \"\") || (n.constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'string'\",rr.h=\"'{}'\",rr.m=7;break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { alt: [{}] };
			expected = `let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[0]",rr.h="'{}'.'alt'[0]",rr.m=2;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { array: [] };
			expected = "let rr, ri=0;FAIL:do{if(!n || n.constructor !== Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'\",rr.h=\"'{}'\",rr.m=5;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [0];
			expected = "let rr, ri=0;FAIL:do{if((!n && n !== 0) || (n.constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0]\",rr.h=\"'{}'.'alt'[0]\",rr.m=6;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [0, ""];
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{if((!n && n !== 0) || (n.constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0]\",rr.h=\"'{}'.'alt'[0]\",rr.m=6;break A0;}break L0;}while(false);A0:do{if((!n && n !== \"\") || (n.constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[1]\",rr.h=\"'{}'.'alt'[1]\",rr.m=7;break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [{ object: { z: 0 } }];
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=2;break FAIL;}if((!n[\"z\"] && n[\"z\"] !== 0) || (n[\"z\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'\",rr.h=\"'{}'.'alt'[0].'object'.'z'\",rr.m=6;break FAIL;}{const a = [\"z\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [{ object: { z: { object: { x: 0 } } } }];
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=2;break FAIL;}if(!n[\"z\"] || (n[\"z\"].constructor && n[\"z\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'z'\",rr.m=2;break FAIL;}if((!n[\"z\"][\"x\"] && n[\"z\"][\"x\"] !== 0) || (n[\"z\"][\"x\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\",rr.h=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'\",rr.m=6;break FAIL;}{const a = [\"x\"]; for(const k in n[\"z\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'z'\",rr.m=4,rr.d=k;break FAIL;} }{const a = [\"z\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [{ object: { "'": { object: { x: 0 } } } }];
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=2;break FAIL;}if(!n[\"'\"] || (n[\"'\"].constructor && n[\"'\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'\\\\''.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'\\\\''\",rr.m=2;break FAIL;}if((!n[\"'\"][\"x\"] && n[\"'\"][\"x\"] !== 0) || (n[\"'\"][\"x\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'\\\\''.'object'.'x'\",rr.h=\"'{}'.'alt'[0].'object'.'\\\\''.'object'.'x'\",rr.m=6;break FAIL;}{const a = [\"x\"]; for(const k in n[\"'\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'\\\\''.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'\\\\''\",rr.m=4,rr.d=k;break FAIL;} }{const a = [\"'\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [{ object: { '"': { object: { x: 0 } } } }];
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=2;break FAIL;}if(!n[\"\\\"\"] || (n[\"\\\"\"].constructor && n[\"\\\"\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'\\\"'.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'\\\"'\",rr.m=2;break FAIL;}if((!n[\"\\\"\"][\"x\"] && n[\"\\\"\"][\"x\"] !== 0) || (n[\"\\\"\"][\"x\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'\\\"'.'object'.'x'\",rr.h=\"'{}'.'alt'[0].'object'.'\\\"'.'object'.'x'\",rr.m=6;break FAIL;}{const a = [\"x\"]; for(const k in n[\"\\\"\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'\\\"'.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'\\\"'\",rr.m=4,rr.d=k;break FAIL;} }{const a = [\"\\\"\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = [{ object: { z: { object: { x: [{ object: { y: true } }] } } } }];
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=2;break FAIL;}if(!n[\"z\"] || (n[\"z\"].constructor && n[\"z\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'z'\",rr.m=2;break FAIL;}if(!n[\"z\"][\"x\"] || (n[\"z\"][\"x\"].constructor && n[\"z\"][\"x\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'.'alt'[0]\",rr.m=2;break FAIL;}if(n[\"z\"][\"x\"][\"y\"] !== true && n[\"z\"][\"x\"][\"y\"] !== false && (!n[\"z\"][\"x\"][\"y\"] || n[\"z\"][\"x\"][\"y\"].constructor !== Boolean)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'.'alt'[0].'object'.'y'\",rr.h=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'.'alt'[0].'object'.'y'\",rr.m=8;break FAIL;}{const a = [\"y\"]; for(const k in n[\"z\"][\"x\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0].'object'.'z'.'object'.'x'.'alt'[0]\",rr.m=4,rr.d=k;break FAIL;} }{const a = [\"x\"]; for(const k in n[\"z\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'.'z'.'object'\",rr.h=\"'{}'.'alt'[0].'object'.'z'\",rr.m=4,rr.d=k;break FAIL;} }{const a = [\"z\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'alt'[0].'object'\",rr.h=\"'{}'.'alt'[0]\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { array: [[true]] };
			expected = "let rr, ri=0;FAIL:do{if(!n || n.constructor !== Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'\",rr.h=\"'{}'\",rr.m=5;break FAIL;}for(let c0 = n, l0 = c0.length, i0 = 0; i0 < l0; ++i0) { const m0 = c0[i0];if(m0 !== true && m0 !== false && (!m0 || m0.constructor !== Boolean)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'alt'[0]\",rr.h=\"'{}'.'array'[0].'alt'[0]\",rr.m=8;break FAIL;}}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { array: [{ array: [true] }] };
			expected = "let rr, ri=0;FAIL:do{if(!n || n.constructor !== Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'\",rr.h=\"'{}'\",rr.m=5;break FAIL;}for(let c0 = n, l0 = c0.length, i0 = 0; i0 < l0; ++i0) { const m0 = c0[i0];if(!m0 || m0.constructor !== Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'array'\",rr.h=\"'{}'.'array'[0]\",rr.m=5;break FAIL;}for(let c1 = m0, l1 = c1.length, i1 = 0; i1 < l1; ++i1) { const m1 = c1[i1];if(m1 !== true && m1 !== false && (!m1 || m1.constructor !== Boolean)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'array'[0]\",rr.h=\"'{}'.'array'[0].'array'[0]\",rr.m=8;break FAIL;}}}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { array: [{ object: {} }] };
			obj.array[0].object[0] = { object: {} };
			obj.array[0].object[0].object[9] = 0;
			expected = "let rr, ri=0;FAIL:do{if(!n || n.constructor !== Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'\",rr.h=\"'{}'\",rr.m=5;break FAIL;}for(let c0 = n, l0 = c0.length, i0 = 0; i0 < l0; ++i0) { const m0 = c0[i0];if(!m0 || (m0.constructor && m0.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'object'\",rr.h=\"'{}'.'array'[0]\",rr.m=2;break FAIL;}if(!m0[\"0\"] || (m0[\"0\"].constructor && m0[\"0\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'object'.'0'.'object'\",rr.h=\"'{}'.'array'[0].'object'.'0'\",rr.m=2;break FAIL;}if((!m0[\"0\"][\"9\"] && m0[\"0\"][\"9\"] !== 0) || (m0[\"0\"][\"9\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'object'.'0'.'object'.'9'\",rr.h=\"'{}'.'array'[0].'object'.'0'.'object'.'9'\",rr.m=6;break FAIL;}{const a = [\"9\"]; for(const k in m0[\"0\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'object'.'0'.'object'\",rr.h=\"'{}'.'array'[0].'object'.'0'\",rr.m=4,rr.d=k;break FAIL;} }{const a = [\"0\"]; for(const k in m0) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'array'[0].'object'\",rr.h=\"'{}'.'array'[0]\",rr.m=4,rr.d=k;break FAIL;} }}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { z: { array: [{ object: { x: 0 } }] } } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}if(!n[\"z\"] || n[\"z\"].constructor !== Array) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'array'\",rr.h=\"'{}'.'object'.'z'\",rr.m=5;break FAIL;}for(let c1 = n[\"z\"], l1 = c1.length, i1 = 0; i1 < l1; ++i1) { const m1 = c1[i1];if(!m1 || (m1.constructor && m1.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'array'[0].'object'\",rr.h=\"'{}'.'object'.'z'.'array'[0]\",rr.m=2;break FAIL;}if((!m1[\"x\"] && m1[\"x\"] !== 0) || (m1[\"x\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'array'[0].'object'.'x'\",rr.h=\"'{}'.'object'.'z'.'array'[0].'object'.'x'\",rr.m=6;break FAIL;}{const a = [\"x\"]; for(const k in m1) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'array'[0].'object'\",rr.h=\"'{}'.'object'.'z'.'array'[0]\",rr.m=4,rr.d=k;break FAIL;} }}{const a = [\"z\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { is: 0 };
			expected = "let rr, ri=0;FAIL:do{if(n !== 0) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'is'\",rr.h=\"'{}'\",rr.m=11,rr.d=0;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { also: 0 };
			expected = "let rr, ri=0;FAIL:do{if(n !== 0) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'also'\",rr.h=\"'{}'\",rr.m=11,rr.d=0;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { also: null };
			expected = "let rr, ri=0;FAIL:do{if(n !== null) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'also'\",rr.h=\"'{}'\",rr.m=11,rr.d=null;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { also: void 0 };
			expected = "let rr, ri=0;FAIL:do{if(n !== void 0) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'also'\",rr.h=\"'{}'\",rr.m=11,rr.d=void 0;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { also: [0] };
			expected = "let rr, ri=0;FAIL:do{if(n !== 0) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'also'[0]\",rr.h=\"'{}'\",rr.m=11,rr.d=0;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { also: [0, "2"] };
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{if(n !== 0) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'also'[0]\",rr.h=\"'{}'\",rr.m=11,rr.d=0;break A0;}break L0;}while(false);A0:do{if(n !== \"2\") {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'also'[1]\",rr.h=\"'{}'\",rr.m=11,rr.d=\"2\";break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { alt: [{}] };
			expected = `let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[0]",rr.h="'{}'.'alt'[0]",rr.m=2;break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { alt: [0, {}] };
			expected = `let rr, ri=0;FAIL:do{L0:do{A0:do{if((!n && n !== 0) || (n.constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[0]",rr.h="'{}'.'alt'[0]",rr.m=6;break A0;}break L0;}while(false);A0:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'.'alt'[1]",rr.h="'{}'.'alt'[1]",rr.m=2;break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'",rr.h="'{}'",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: {}, match: "a" };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}if(!cv[\"a\"](n)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"a\";break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: {}, match: { a: { b: 1 } } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}if(!cv[\"a\"](n, {\"b\":1})) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"a\",rr.e={\"b\":1};break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: {}, match: ["a", "b"] };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}if(!cv[\"a\"](n)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"a\";break FAIL;}if(!cv[\"b\"](n)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"b\";break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: {}, match: { a: {}, b: {} } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;}if(!cv[\"a\"](n, {})) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"a\",rr.e={};break FAIL;}if(!cv[\"b\"](n, {})) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"b\",rr.e={};break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { z: { object: {}, match: "a" } } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}if(!n[\"z\"] || (n[\"z\"].constructor && n[\"z\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'object'\",rr.h=\"'{}'.'object'.'z'\",rr.m=2;break FAIL;}for(const k in n[\"z\"]) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'object'\",rr.h=\"'{}'.'object'.'z'\",rr.m=4,rr.d=k;break FAIL;}if(!cv[\"a\"](n[\"z\"])) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'\",rr.h=\"'{}'.'object'.'z'\",rr.m=12,rr.d=\"a\";break FAIL;}{const a = [\"z\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: { z: { object: { x: 0 }, match: "a" } } };
			expected = "let rr, ri=0;FAIL:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break FAIL;}if(!n[\"z\"] || (n[\"z\"].constructor && n[\"z\"].constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'object'\",rr.h=\"'{}'.'object'.'z'\",rr.m=2;break FAIL;}if((!n[\"z\"][\"x\"] && n[\"z\"][\"x\"] !== 0) || (n[\"z\"][\"x\"].constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'object'.'x'\",rr.h=\"'{}'.'object'.'z'.'object'.'x'\",rr.m=6;break FAIL;}{const a = [\"x\"]; for(const k in n[\"z\"]) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'.'object'\",rr.h=\"'{}'.'object'.'z'\",rr.m=4,rr.d=k;break FAIL;} }if(!cv[\"a\"](n[\"z\"])) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'.'z'\",rr.h=\"'{}'.'object'.'z'\",rr.m=12,rr.d=\"a\";break FAIL;}{const a = [\"z\"]; for(const k in n) if(a.indexOf(k) === -1) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break FAIL;} }r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { object: {}, string: 1, match: "a" };
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{if(!n || (n.constructor && n.constructor !== Object)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=2;break A0;}for(const k in n) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'object'\",rr.h=\"'{}'\",rr.m=4,rr.d=k;break A0;}break L0;}while(false);A0:do{if((!n && n !== \"\") || (n.constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'string'\",rr.h=\"'{}'\",rr.m=7;break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);if(!cv[\"a\"](n)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=12,rr.d=\"a\";break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { any: 1 };
			expected = "let rr, ri=0;FAIL:do{r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { any: 1, string: 1 };
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{break L0;}while(false);A0:do{if((!n && n !== \"\") || (n.constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'string'\",rr.h=\"'{}'\",rr.m=7;break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { number: 1, any: 1 };
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{if((!n && n !== 0) || (n.constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'number'\",rr.h=\"'{}'\",rr.m=6;break A0;}break L0;}while(false);A0:do{break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { number: 1, any: 1, string: 1 };
			expected = "let rr, ri=0;FAIL:do{L0:do{A0:do{if((!n && n !== 0) || (n.constructor !== Number)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'number'\",rr.h=\"'{}'\",rr.m=6;break A0;}break L0;}while(false);A0:do{break L0;}while(false);A0:do{if((!n && n !== \"\") || (n.constructor !== String)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'.'string'\",rr.h=\"'{}'\",rr.m=7;break A0;}break L0;}while(false);{++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=\"'{}'\",rr.h=\"'{}'\",rr.m=1;break FAIL;}}while(false);r[0]=true;return ri;}while(false);r[0]=false;return ri;";
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { any: 1, match: "a" };
			expected = `let rr, ri=0;FAIL:do{if(!cv["a"](n)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'",rr.h="'{}'",rr.m=12,rr.d="a";break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);

			obj = { match: "a" };
			expected = `let rr, ri=0;FAIL:do{if(!cv["a"](n)) {++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p="'{}'",rr.h="'{}'",rr.m=12,rr.d="a";break FAIL;}r[0]=true;return ri;}while(false);r[0]=false;return ri;`;
			reset(); outcome = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}); if (!test(outcome, expected)) fail(`SchemaObsolete.generateCode_validate(${Diagnostics.format(obj)}, {})`, expected, outcome);
		}

		//	SchemaObsolete.model
		//	SchemaObsolete.validate
		//	SchemaObsolete.explain
		function test_model_test_explain(...args)
		{
			schema = new SchemaObsolete();

			model = schema.model({});
			subject = {};
			expected = { success: true, messages: [] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			try
			{
				model = schema.model({});
				subject = {};
				reset();
				schema.try(0x0, "subject", subject, model);
			}
			catch (ex)
			{
				failErr(`schema.test (1)`, null, ex);
			}

			model = schema.model({});
			subject = 1;
			expected = { success: false, messages: [{ path: "'{}'", hintPath: "'{}'", messageId: 2, message: "Object expected." }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			try
			{
				model = schema.model({});
				subject = 1;
				expected = "0x0 Validation failed [(model)]: \"subject\" (1).";
				reset();
				schema.try(0x0, "subject", subject, model);
				fail(`schema.test (2.1)`, expected, null);
			}
			catch (ex)
			{
				if (expected !== ex.message) fail(`schema.test (2.2)`, expected, ex.message);
			}

			model = schema.model({ object: 1, hint: "hint" });
			subject = 1;
			expected = { "success": false, "messages": [{ "path": "'{}'.'object'", "hintPath": "'{}'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema({ object: 1, hint: "hint" });
			subject = 1;
			expected = { "success": false, "messages": [{ "path": "'{}'.'object'", "hintPath": "'{}'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)} (1)`, expected, outcome);

			model = schema.model({ objex: 1, hint: "hint" });
			subject = 1;
			expected = { "success": false, "messages": [{ "path": "'{}'.'objex'", "hintPath": "'{}'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ object: { a: { object: 1, hint: "hint" } } });
			subject = { a: 1 };
			expected = { "success": false, "messages": [{ "path": "'{}'.'object'.'a'.'object'", "hintPath": "'{}'.'object'.'a'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'.'object'.'a'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ object: { a: { objex: 1, hint: "hint" } } });
			subject = { a: 1 };
			expected = { "success": false, "messages": [{ "path": "'{}'.'object'.'a'.'objex'", "hintPath": "'{}'.'object'.'a'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'.'object'.'a'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ object: { a: { object: 1, hint: "hint_a" } }, hint: "hint_object" });
			subject = { a: 1 };
			expected = { "success": false, "messages": [{ "path": "'{}'.'object'.'a'.'object'", "hintPath": "'{}'.'object'.'a'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'.'object'.'a'", "hint": "hint_a" }, { "hintPath": "'{}'", "hint": "hint_object" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ object: { a: { objex: 1, hint: "hint_a" } }, hint: "hint_object" });
			subject = { a: 1 };
			expected = { "success": false, "messages": [{ "path": "'{}'.'object'.'a'.'objex'", "hintPath": "'{}'.'object'.'a'", "messageId": 2, "message": "Object expected.", "hints": [{ "hintPath": "'{}'.'object'.'a'", "hint": "hint_a" }, { "hintPath": "'{}'", "hint": "hint_object" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ array: 1, hint: "hint" });
			subject = [1, 2, 3];
			expected = { success: true, messages: [] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ array: 1, hint: "hint" });
			subject = {};
			expected = { "success": false, "messages": [{ "path": "'{}'.'array'", "hintPath": "'{}'", "messageId": 5, "message": "Array expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: {}, model: { array: 1, hint: "hint" }`, expected, outcome);

			model = schema.model({ array: [0, ""], hint: "hint" });
			subject = [1, "a", 3, "c"];
			expected = { "success": true, "messages": [{ "path": "'{}'.'array'[0]", "hintPath": "'{}'.'array'[0]", "messageId": 6, "message": "Number expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }, { "path": "'{}'.'array'[0]", "hintPath": "'{}'.'array'[0]", "messageId": 6, "message": "Number expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ array: [0, ""], hint: "hint" });
			subject = [1, "a", true];
			expected = { "success": false, "messages": [{ "path": "'{}'.'array'[0]", "hintPath": "'{}'.'array'[0]", "messageId": 6, "message": "Number expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }, { "path": "'{}'.'array'[0]", "hintPath": "'{}'.'array'[0]", "messageId": 6, "message": "Number expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }, { "path": "'{}'.'array'[1]", "hintPath": "'{}'.'array'[1]", "messageId": 7, "message": "String expected.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }, { "path": "'{}'.'array'", "hintPath": "'{}'", "messageId": 1, "message": "No valid alternative was matched.", "hints": [{ "hintPath": "'{}'", "hint": "hint" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ array: [{ number: 1, hint: "hint_number" }], hint: "hint_array" });
			subject = [""];
			expected = { "success": false, "messages": [{ "path": "'{}'.'array'[0].'number'", "hintPath": "'{}'.'array'[0]", "messageId": 6, "message": "Number expected.", "hints": [{ "hintPath": "'{}'.'array'[0]", "hint": "hint_number" }, { "hintPath": "'{}'", "hint": "hint_array" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({ array: [{ object: { a: 0 }, hint: "hint_object1" }, { object: { b: "" }, hint: "hint_object2" }], hint: "hint_array" });
			subject = [{ a: 5 }, { b: 6 }, {}];
			expected = { "success": false, "messages": [{ "path": "'{}'.'array'[0].'object'.'a'", "hintPath": "'{}'.'array'[0].'object'.'a'", "messageId": 6, "message": "Number expected.", "hints": [{ "hintPath": "'{}'.'array'[0]", "hint": "hint_object1" }, { "hintPath": "'{}'", "hint": "hint_array" }] }, { "path": "'{}'.'array'[1].'object'.'b'", "hintPath": "'{}'.'array'[1].'object'.'b'", "messageId": 7, "message": "String expected.", "hints": [{ "hintPath": "'{}'.'array'[1]", "hint": "hint_object2" }, { "hintPath": "'{}'", "hint": "hint_array" }] }, { "path": "'{}'.'array'", "hintPath": "'{}'", "messageId": 1, "message": "No valid alternative was matched.", "hints": [{ "hintPath": "'{}'", "hint": "hint_array" }] }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			schema = new SchemaObsolete(null, { [SchemaObsolete.MessageId_numberExpected]: "numberExpected" });
			model = schema.model(0);
			subject = true;
			expected = { "success": false, "messages": [{ "path": "'{}'", "hintPath": "'{}'", "messageId": 6, "message": "numberExpected" }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, schema.messages: ${Diagnostics.format(schema.messages)}, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			schema = new SchemaObsolete({ a: (v, c) => true });
			model = schema.model({ number: 1, match: "a" });
			subject = 5;
			expected = { success: true, messages: [] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, schema.validators: {a: (v, c) => true}, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			schema = new SchemaObsolete({ a: (v, c) => false });
			model = schema.model({ number: 1, match: "a" });
			subject = 5;
			expected = { "success": false, "messages": [{ "path": "'{}'", "hintPath": "'{}'", "messageId": 12, "message": "Custom validation failed.", "validatorName": "a" }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, schema.validators: {a: (v, c) => false}, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			schema = new SchemaObsolete({ a: (v, c) => false });
			model = schema.model({ number: 1, match: { a: {} } });
			subject = 5;
			expected = { "success": false, "messages": [{ "path": "'{}'", "hintPath": "'{}'", "messageId": 12, "message": "Custom validation failed.", "validatorName": "a", "validatorConfig": {} }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, schema.validators: {a: (v, c) => false}, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			subject = Object.create(arguments);
			model = schema.model({ array: 1 });
			expected = { "success": false, "messages": [{ "path": "'{}'.'array'", "hintPath": "'{}'", "messageId": 5, "message": "Array expected." }] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: arguments, model: { array: 1 }`, expected, outcome);

			subject = Object.create(args);
			model = schema.model({ array: 1 });
			expected = { "success": true, "messages": [] };
			reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(`schema.explain, subject: args, model: { array: 1 }`, expected, outcome);

			//	`object` vs `struct`

			const test_ovss = (title) =>
			{
				reset(); schema.test(subject, model); if (!test(outcome = schema.explain(), expected)) fail(title || `schema.explain, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);
			};

			//	`object` vs `struct` - `object`

			model = schema.model({ object: 1 });

			//	`object` vs `struct` - `object` - FAIL

			expected = { "success": false, "messages": [{ "path": "'{}'.'object'", "hintPath": "'{}'", "messageId": 2, "message": "Object expected." }] };

			subject = new Int8Array();

			subject = new RegExp();
			test_ovss();

			subject = () => { };
			test_ovss();

			subject = Error();
			test_ovss("schema.explain (1000), subject = Error()");

			subject = new Object(new (class C { }));
			test_ovss();

			subject = class C { };
			test_ovss();

			subject = Object.create(new (class A0 { }));
			test_ovss();

			subject = null;
			test_ovss();

			subject = void 0;
			test_ovss();

			subject = NaN;
			test_ovss();

			subject = true;
			test_ovss();

			subject = new Boolean();
			test_ovss();

			subject = 1;
			test_ovss();

			subject = new Number();
			test_ovss();

			subject = "";
			test_ovss();

			subject = new String();
			test_ovss();

			subject = [];
			test_ovss();

			subject = new Array();
			test_ovss();

			subject = Symbol();
			test_ovss();

			subject = /a/;
			test_ovss();

			subject = RegExp();
			test_ovss();

			subject = new Date();
			test_ovss();

			subject = new Proxy(new (class C { }), {});
			test_ovss();

			subject = new Object([]);
			test_ovss();

			subject = Object.create(args);
			test_ovss();

			//	`object` vs `struct` - `object` - SUCCESS

			expected = { success: true, messages: [] };

			subject = Object.create(null);
			test_ovss(`schema.explain (1017), subject = Object.create(null)`);

			subject = Object.create(JSON.parse("{}"));
			test_ovss(`schema.explain (1016), subject = Object.create(JSON.parse("{}"))`);

			subject = Object.create(arguments);
			test_ovss(`schema.explain (1015), subject = Object.create(arguments)`);

			//	`object` vs `struct` - `struct`

			//	`object` vs `struct` - `struct` - SUCCESS

			model = schema.model({ struct: 1 });
			expected = { success: true, messages: [] };

			subject = new Int8Array();
			test_ovss("schema.explain (1003), subject = new Int8Array()");

			subject = new RegExp();
			test_ovss("schema.explain (1004), subject = new RegExp()");

			subject = () => { };
			test_ovss("schema.explain (1005), subject = () => { }");

			subject = Error();
			test_ovss("schema.explain (1001), subject = Error()");

			subject = new Object(new (class C { }));
			test_ovss("schema.explain (1006), subject = new Object(new (class C { }))");

			subject = class C { };
			test_ovss("schema.explain (1007), subject = class C { }");

			subject = Object.create(new (class A0 { }));
			test_ovss("schema.explain (1008), subject = Object.create(new (class A0 { }))");

			subject = /a/;
			test_ovss("schema.explain (1009), subject = /a/");

			subject = RegExp();
			test_ovss("schema.explain (1010), subject = RegExp()");

			subject = new Date();
			test_ovss("schema.explain (1011), subject = new Date()");

			subject = new Proxy(new (class C { }), {});
			test_ovss("schema.explain (1012), subject = new Proxy(new (class C { }), {})");

			subject = Object.create(JSON.parse("{}"));
			test_ovss(`schema.explain (1013), subject = Object.create(JSON.parse("{}"))`);

			subject = Object.create(arguments);
			test_ovss(`schema.explain (1014), subject = Object.create(arguments)`);

			//	`object` vs `struct` - `struct` - FAIL

			expected = { "success": false, "messages": [{ "path": "'{}'.'struct'", "hintPath": "'{}'", "messageId": 3, "message": "Any object expected, except for String, Number, Boolean and Array." }] };

			subject = Object.create(null);
			test_ovss();

			subject = null;
			test_ovss();

			subject = void 0;
			test_ovss();

			subject = NaN;
			test_ovss();

			subject = true;
			test_ovss();

			subject = new Boolean();
			test_ovss();

			subject = 1;
			test_ovss();

			subject = new Number();
			test_ovss();

			subject = "";
			test_ovss();

			subject = new String();
			test_ovss();

			subject = [];
			test_ovss();

			subject = new Array();
			test_ovss();

			subject = Symbol();
			test_ovss();

			subject = new Object([]);
			test_ovss();

			subject = Object.create(args);
			test_ovss();
		}

		function test_pins()
		{
			schema = new SchemaObsolete();

			model = schema({}, 0);
			model = schema({ a: "" }, 0);
			subject = {};
			expected = { success: true, messages: [] };
			reset();
			schema.test(subject, model);
			if (!test(outcome = schema.explain(), expected)) fail(`schema pins 001`, expected, outcome);

			model = schema({}, 0);
			model = schema({ a: "" }, 1);
			subject = {};
			expected = { "success": false, "messages": [{ "path": "'{}'.'a'", "hintPath": "'{}'.'a'", "messageId": 7, "message": "String expected." }] };
			reset();
			schema.test(subject, model);
			if (!test(outcome = schema.explain(), expected)) fail(`schema pins 002`, expected, outcome);
		}

		//	SchemaObsolete.serialize
		function test_serialize()
		{
			schema = new SchemaObsolete();

			model = schema.model({});
			subject = {};
			expected = "{}";
			reset(); if (!test(outcome = schema.serialize(subject, model), expected)) fail(`schema.serialize, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({});
			subject = { a: 1 };
			expected = `{"a":1}`;
			reset(); if (!test(outcome = schema.serialize(subject, model), expected)) fail(`schema.serialize, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);
		}

		//	SchemaObsolete.deserialize
		function test_deserialize()
		{
			schema = new SchemaObsolete();

			model = schema.model({});
			subject = "{}";
			expected = {};
			reset(); if (!test(outcome = schema.deserialize(subject, model), expected)) fail(`schema.deserialize, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);

			model = schema.model({});
			subject = `{"a":1}`;
			expected = { a: 1 };
			reset(); if (!test(outcome = schema.deserialize(subject, model), expected)) fail(`schema.deserialize, subject: ${Diagnostics.format(subject)}, model: ${Diagnostics.format(model.typedef)}`, expected, outcome);
		}

		//test_serializer();
		function test_serializer()
		{
			reset();

			//obj = [{ z: { boolean: 1, void: 1 } }, { q: { any: 1 } }];
			obj = { array: [{ object: { a: 0, b: { string: 1, number: 1 } } }, { null: 1, void: 1 }, { z: { boolean: 1, NU: 1 } }, { q: { any: 1 } }] };
			//obj = [{ a: 0 }, { z: true } ];
			const code = SchemaObsolete.generateCode_validate(SchemaObsolete.parseDef(context, "'{}'", "'{}'", obj), {}, { createSerializer: true });
			//document.body.innerHTML += `<pre>${Context.esc(code)}</pre>`

			//subject = [{ q: "aaa" }];
			subject = [null, { a: 666, b: "777" }, { a: 444, b: -1 }, null, void 0, { z: void 0 }, { q: "aaa" }, { q: void 0 }, { q: new Date() }, { q: NaN }, { q: { aaaa: [444, 555, 666] } }];
			//subject = [{ a: 444 }, { z: true }];
			const v = new Function("n", "r", "cv", "cb", "sb", code);
			const errorBuffer = [];
			for (let i = 0; i < 1024; ++i) errorBuffer.push({});
			const outcome = v(subject, errorBuffer, null, null, new Array(256));
			document.body.innerHTML += `<pre>${isNaN(outcome) ? outcome : Diagnostics.format(errorBuffer[outcome])}</pre>`
			console.log(913, JSON.parse(outcome));
			//document.body.innerText += `<pre>${code}</pre>`

			if (false)
			{
				//const obj = [{ object: { a: 0, b: { number: 1 } } }];
				const obj = [{ object: { a: 0, b: { string: 1, number: 1 } } }];
				//const obj = [{ object: { a: 0, b: { string: 1, number: 1 } } }, { null: 1, void: 1 }, { z: { boolean: 1, void: 1 } }, { q: { any: 1 } }];
				//const obj = [{ any: 1 }];
				const subject = [{ a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }, { a: 666, b: 777 }, { a: 444, b: -1 }];
				//const subject = [null, { a: 666, b: "777" }, { a: 444, b: -1 }, null, void 0, { z: void 0 }, { q: "aaa" }, { q: void 0 }, { q: new Date() }, { q: NaN }, { q: { aaaa: [444, 555, 666] } }, null, { a: 666, b: "777" }, { a: 444, b: -1 }, null, void 0, { z: void 0 }, { q: "aaa" }, { q: void 0 }, { q: new Date() }, { q: NaN }, { q: { aaaa: [444, 555, 666] } }];
				const schema = new SchemaObsolete();
				const model = schema.model(obj);
				const repeatCount = 500000;
				const buffer = new Array(256);

				console.time("test1");
				for (let i = 0; i < repeatCount; ++i)
				{
					v(subject, errorBuffer, null, null, buffer);
				}
				console.timeEnd("test1");

				console.time("test2");
				for (let i = 0; i < repeatCount; ++i)
				{
					schema.test(subject, model);
					Diagnostics.format(subject);
				}
				console.timeEnd("test2");

				console.time("test1");
				for (let i = 0; i < repeatCount; ++i)
				{
					v(subject, errorBuffer, null, null, buffer);
				}
				console.timeEnd("test1");

				console.time("test2");
				for (let i = 0; i < repeatCount; ++i)
				{
					schema.test(subject, model);
					Diagnostics.format(subject);
				}
				console.timeEnd("test2");
			}
		}
	}
}

module.exports.UnitTests_SchemaObsolete = module.exports;
