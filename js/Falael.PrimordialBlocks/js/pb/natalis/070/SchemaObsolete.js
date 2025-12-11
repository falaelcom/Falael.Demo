//	R0Q2?/daniel/20220502
//		- TODO: consider using symbol properties instead of wrapper properties for type spec etc (instead of `{ object: { <props> } }` experiment with `{ [objex]: true, <props> }`
//			where `objex = Symbol("objex")`)[object]: true,
//		- TODO: add a facility to specify typedefs for extension properties in `objex` and `strux`: `{ objex: {}, rest: "" }`
//		- TODO: add `SchemaObsolete.typedef` describing the schema of a valid schema typedef
//			- implement recursive typedefs
//		- TODO: replace schema constructor param `validators` with `lexicon`; add `005.Lexicon.js` to validate lexicons and provide placeholder for future lexicon functionality like merging and querying
//			- let the `Lexicon` class build the validators for the `SchemaObsolete` class; also store the lexicon instance in schema, to allow `traits` look up in `generateCode_validate`
//			- add `traits` and `callback` to the `lexeme.test()` traits (see `Lexicon`);
//		- TODO: implement built-in custom validators (see TryObsolete.js)
//			- `"isoDateTime"`
//			- `"jsonDate"`
//			- `"tuple: [ <typeDef>, <typeDef>, <typeDef>... ]"`
//			- `"interval: "<intervalCode>" || { <propertyName>: "<intervalCode>" }"` (see `Parse.interval`, `Format.interval`)
//		- TODO: consider adding an `explain`-like efficient method to return the first validation path that succeeded in a case of alternatives presented in the schema.
//			- might require a new abstraction layer for code generation (also for performance optimization)
//		- OPT: analyse and cache the count of alternatives in a schema; for serialization select the serializer generator for schemas with less alternatives and the combination of validator+JSON.stringify for schemas with more alternatives
//			- depending on the alternative count
//			- depending on specificity (schemas with more "any" are more suitable for JSON.stringify)
//		- OPT: embed "match" functions in precompiled validation code to avoid the `cv["matchName"]` lookups - search below for result.push(`if(!cv[${JSON.stringify
//		- OPT: in `generateCode_validate`, allow validator function inlining (serialize the body of the function, declare and call the function as `(function(v, c, p, l, cb){...})(v, c, p, l, cb)`), instead of the cv["key"] lookup
//		- OPT: buildBreakStatement - add a symbol version of the message id for faster comparison
//		- OPT: _Schema_validateTypeDefList - detect redundant type definitions (e.g. 2 times number)
//		- OPT: validation code that will always match must simply return `true` (e.g. `{any: 1, string: 1}`)
//		- OPT: any types after `any: 1` must be discarded by `walkTypeDefList` (e.g. `{number: 1, any: 1, string: 1}` must not produce a `Structural_String`, see tests `obj = { any: 1, string: 1 };`)
//		- OPT: validation code with no alternatives
//		- OPT: validation code with strict list of admissible properties (all validation must go through the for..in loop; see `SchemaObsolete.generateCode_validate` -> `case SchemaObsolete.Structural_ObjectEnd:`)
//		- OPT: single admissible property in an object does not need a loop
//		+ OPT: serialization - code generator
//			- TEST: serialize() - add more tests
//		- OPT: deserialization - research if code generator is feasible; maybe with the requirement for strict property ordering for the purpose of generating efficient parsing automata?
//			- TEST: deserialize() - add more tests
//		- OPT: in validator code gen - cache n["propname"] in var
//		- DOC: SchemaObsolete.parseDef, SchemaObsolete.walkTypeDefList, SchemaObsolete.generateCode_validate
"use strict";

const { Type, CallableType, LiteralType } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { Exception, ArgumentException, ValidationFailedException } = require("-/pb/natalis/003/Exception.js");
const { Pins } = require("-/pb/natalis/013/Pins.js");
const { Delegate } = require("-/pb/natalis/012/Delegate.js");
const { DotQuoteNotation } = require("-/pb/natalis/012/DotQuoteNotation.js");
const { NativeGraph } = require("-/pb/natalis/014/NativeGraph.js");

let schemaInstanceCounter = Number.MIN_SAFE_INTEGER;

const SchemaObsolete = module.exports = 

//	Class: Provides means for defining and validating Primordial Blocks JSON schema. Handles JSON serialization and deserialization with predefined schema.
//	Remarks: With serialization and deserialization, the order of object fields is assumed to be insignificant and unpredictable.
//		The specific way `SchemaObsolete` is implemented serves optimization and forward-compatability goals.
class SchemaObsolete extends Delegate
{
	//	Parameter: `validators: { validatorName: (value, config) => false || groupName: { validatorName: (value, config) => false } }` - optional dictionary of validator functions.
	//		Groups can be nested.
	//	Parameter: `messages: { <messageId>: "<message text>" }` - optional mapping of error message ids to text messages; message ids that are present in the mapping override the hard-coded default texts. See Remarks.
	//	Remarks:
	//	List of message ids generated by the schema validation with their corresponding hard-coded default texts:
	//	- `SchemaObsolete.MessageId_noAltMatch` - `"No valid alternative was matched."`;
	//	- `SchemaObsolete.MessageId_objectExpected` - `"Object expected."`;
	//	- `SchemaObsolete.MessageId_structExpected` - `"Any object expected, except for String, Number, Boolean and Array."`;
	//	- `SchemaObsolete.MessageId_unexpectedProperty` - `"Unexpected property."`, explain items with this message id will indicate the name of the unexpected property in `.propertyName`;
	//	- `SchemaObsolete.MessageId_arrayExpected` - `"Array expected."`;
	//	- `SchemaObsolete.MessageId_numberExpected` - `"Number expected."`;
	//	- `SchemaObsolete.MessageId_stringExpected` - `"String expected."`;
	//	- `SchemaObsolete.MessageId_booleanExpected` - `"Boolean expected."`;
	//	- `SchemaObsolete.MessageId_NUExpected - `"NU expected."`
	//	- `SchemaObsolete.MessageId_nullExpected` - `"Null expected."`;
	//	- `SchemaObsolete.MessageId_voidExpected` - `"Undefined expected."`;
	//	- `SchemaObsolete.MessageId_invalidValue` - `"Invalid value."`, explain items with this message id will indicate the expected value in `.expectedValue`;
	//	- `SchemaObsolete.MessageId_matchFailed` - `"Custom validation failed."`, explain items with this message id will indicate the name of the failing custom validation function in `.validatorName`and the match configuration object if such is present in the schema in `.validatorConfig`;
	//	Exception: `"Argument is invalid"`.
	constructor(validators, messages)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(validators) && !Type.isNU(validators)) throw new Exception(0x3D2D58, `Argument is invalid: "validators".`);
			if (!Type.isObject(messages) && !Type.isNU(messages)) throw new Exception(0xE32732, `Argument is invalid: "messages".`);
		}

		function construct()
		{
			parseValidators("", validators, this.validators = {});
			function parseValidators(path, validators, outcome)
			{
				for (const key in validators)
				{
					const value = validators[key];
					const path2 = path ? path + '.' + key : key;
					if (CallableType.isFunction(value)) outcome[path2] = value;
					else if (Type.isObject(value)) parseValidators(path ? path2 : key, value, outcome);
					else throw new Exception(0x2153FC, `Argument is invalid: "validators". Related path: "{}.${path2}".`);
				}
			}
			this.messages = messages;

			Object.freeze(this.validators);

			//	performance optimization state
			this._errorBuffer = [];
			for (let i = 0; i < 1024; ++i) this._errorBuffer.push({});
			this._errorBufferIndex = -1;
			this._lastModel = null;
			this._schemaInstanceId = ++schemaInstanceCounter;

			this._modelPins = new Pins();
		}
		function execute()
		{
			return this.model.apply(this, arguments);
		}
		return super(execute, construct);	// eslint-disable-line
	}

	//	Function: Compiles a model definition into a model object usable with `SchemaObsolete.test()`, `SchemaObsolete.serialize()` and `SchemaObsolete.deserialize()`.
	//	Parameter: `typedef: {}` - a schema definition object. See the class Usage for details.
	//	Parameter: `pin: any` - optional; a identifier for the model unique within this schema, used as acaching key and for increased readability of model-related messages, e.g. validation exceptions.
	//		If a `pin` is given, the model is cached and subsequent modelling attempts with the same pin will retrieve the cached value instead of remodelling.
	//	Returns: model object usable with `SchemaObsolete.test()`, `SchemaObsolete.serialize()` and `SchemaObsolete.deserialize()`.
	//	Remarks: The returned model object is allowed to be used only with the `SchemaObsolete` instance it was originally created with, otherwise an `"Invalid operation"` exception is thrown.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Not implemented"`.
	//	Exception `"Invalid schema definition"`.
	//	Exception `"Unsupported schema definition type"`.
	//	Exception `"Unrecognized validator key"`.
	//	Exception `"Duplicate type definition"`.
	//	Exception `"The \"match\" directive will have no effect"`.
	//	Exception `"Invalid \"also\" schema definition type"`.
	//	Exception `"Invalid \"also\" schema definition value type"`.
	//	Exception `"Invalid \"is\" schema definition type"`.
	//	Exception `"Invalid \"is\" schema definition value type"`.
	//	Exception `"Invalid \"alt\" schema definition type"`.
	//	Exception `"Invalid \"any\" schema definition"`.
	//	Exception `"Invalid \"array\" schema definition type"`.
	//	Exception `"Invalid \"boolean\" schema definition"`.
	//	Exception `"Invalid \"NU\" schema definition"`.
	//	Exception `"Invalid \"null\" schema definition"`.
	//	Exception `"Invalid \"void\" schema definition"`.
	//	Exception `"Invalid \"hint\" schema definition type"`.
	//	Exception `"Invalid \"match\" schema definition type"`.
	//	Exception `"Invalid \"number\" schema definition"`.
	//	Exception `"Invalid \"object\" schema definition type"`.
	//	Exception `"Invalid \"object\" schema definition"`.
	//	Exception `"Invalid \"objex\" schema definition type"`.
	//	Exception `"Invalid \"objex\" schema definition"`.
	//	Exception `"Invalid \"struct\" schema definition type"`.
	//	Exception `"Invalid \"struct\" schema definition"`.
	//	Exception `"Invalid \"strux\" schema definition type"`.
	//	Exception `"Invalid \"strux\" schema definition"`.
	//	Exception `"Invalid \"string\" schema definition"`.
	//	Exception `"Invalid schema definition directive"`.
	model(typedef, pin = void 0)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isObject(typedef) && !LiteralType.isString(typedef) && !LiteralType.isNumber(typedef) && !LiteralType.isBoolean(typedef) && !LiteralType.isArray(typedef) && !LiteralType.isNU(typedef)) throw new Exception(0xD0435A, `Argument is invalid: "typedef".`);
		}

		return this._modelPins(pin, () =>
		{
			const result =
			{
				pin,
				typedef,

				_schemaInstanceId: this._schemaInstanceId,
				_doc: {},
				_parsedDef: null,
				_validate: null,
				_serialize: null,
				_deserialize: null,

			};

			result._parsedDef = SchemaObsolete.parseDef(result, "'{}'", "'{}'", typedef);
			_Schema_validateTypeDefList(result._parsedDef, this.validators);
			result._validate = new Function("n", "r", "cv", "cb", SchemaObsolete.generateCode_validate(result._parsedDef, this.validators));

			return result;
		});
	}

	//	Function: Validate the provided `subject` upon the provided `model`.
	//	Parameter: `subject: *` - a value to be validated.
	//	Parameter: `model: object` - the product of `SchemaObsolete.model()`. Must be used only with the `SchemaObsolete` instance it was originally created with, otherwise an `"Invalid operation"` exception is thrown.
	//	Parameter: `callback(value: *, config: *, traits: object, lexeme: string): *` - if set, will be passed as the fifth parameter to the lexeme test function; the return value depends on the specific lexeme test function implementation.
	//	Returns: `true` if the validation was successful, otherwise returns `false`.
	//	Remarks: The model object must belong with this `SchemaObsolete` instance, otherwise an `"Invalid operation"` exception is thrown.
	//		The `SchemaObsolete.explain` method provides details regarding the result of the last call of `SchemaObsolete.test()`, `SchemaObsolete.serialize()` or `SchemaObsolete.deserialize()`.
	//		The `callback()` parameter provides a way to perform runtime-specific validation in the context of the validation caller.
	//	Exception: `"Invalid operation"`.
	//	Exception: `"Argument is invalid"`.
	test(subject, model, callback)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(model)) throw new ArgumentException(0x7AF355, "model", model);
			if (!Type.isNU(callback) && !CallableType.isFunction(callback)) throw new ArgumentException(0xA31C9E, "callback", callback);
		}
		if (model._schemaInstanceId !== this._schemaInstanceId) throw new InvalidOperationException(0x209F95);
		this._lastModel = model;
		this._errorBufferIndex = model._validate(subject, this._errorBuffer, this.validators, callback);
		return this._errorBuffer[0];
	}

	//	Function: Validate the provided `subject` upon the provided `model` and throw an exception on failure.
	//	Parameter: `ncode: integer` - a unique identifier of the exception thrown when the validation has failed.
	//	Parameter: `subjectName: string` - a name identifying the value to be validated.
	//	Parameter: `subjectValue: *` - a value to be validated.
	//	Parameter: `model: object` - the product of `SchemaObsolete.model()`. Must be used only with the `SchemaObsolete` instance it was originally created with, otherwise an `"Invalid operation"` exception is thrown.
	//	Parameter: `callback(value: *, config: *, traits: object, lexeme: string): *` - if set, will be passed as the fifth parameter to the lexeme test function; the return value depends on the specific lexeme test function implementation.
	//	Parameter: `message: string` - optinal; a custom text to insert before the period of the original error message of the exception thrown when the validation has failed.
	//	Remarks: The model object must belong with this `SchemaObsolete` instance, otherwise an `"Invalid operation"` exception is thrown.
	//		The `callback()` parameter provides a way to perform runtime-specific validation in the context of the validation caller.
	//	Exception: `"Invalid operation"`.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Validation failed"`.
	try(ncode, subjectName, subjectValue, model, callback, message = null)
	{
		if (!this.test(subjectValue, model, callback)) throw new ValidationFailedException(ncode, subjectName, subjectValue, Diagnostics.printNcode(model.pin, "(model)"), model.typedef, this.explain(), message);
	}

	//	Function: Validate the provided `subject` upon the provided `model` and serialize as JSON.
	//	Parameter: `subject: *` - a value to be serialized.
	//	Parameter: `model: object` - the product of `SchemaObsolete.model()`. Must be used only with the `SchemaObsolete` instance it was originally created with, otherwise an `"Invalid operation"` exception is thrown.
	//	Remarks: The model object is required to be created by this `SchemaObsolete` instance, otherwise an `"Invalid operation"` exception is thrown.
	//		The `SchemaObsolete.explain` method provides details regarding the result of the last call of `SchemaObsolete.test()`, `SchemaObsolete.serialize()` or `SchemaObsolete.deserialize()`.
	//		The implementation of this method might be a subject of future optimization, and in the future breaking changes might be introduced in regard of the exceptions thrown.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Invalid operation"`.
	//	Exception: `"Validation failed"`.
	serialize(subject, model)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(model)) throw new Exception(0x8AD903, `Argument is invalid: "model".`);
		}
		const outcome = this.test(subject, model);
		if (outcome) return JSON.stringify(subject);
		throw `Validation failed.`;
	}

	//	Function: Deserialize the provided `subject` as JSON and validate the result upon the provided `model`.
	//	Parameter: `subject: string` - JSON to be deserialized.
	//	Parameter: `model: object` - the product of `SchemaObsolete.model()`. Must be used only with the `SchemaObsolete` instance it was originally created with, otherwise an `"Invalid operation"` exception is thrown.
	//	Parameter: `revive(key, value): *` - see `JSON.parse:revive` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse).
	//	Remarks: The returned model object is allowed to be used only with the `SchemaObsolete` instance it was originally created with, otherwise an `"Invalid operation"` exception is thrown.
	//		The `SchemaObsolete.explain` method provides details regarding the result of the last call of `SchemaObsolete.test()`, `SchemaObsolete.serialize()` or `SchemaObsolete.deserialize()`.
	//		Also might throw the exceptions from `JSON.parse()`.
	//		The implementation of this method might be a subject of future optimization, and in the future breaking changes might be introduced in regard of the exceptions thrown.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Invalid operation"`.
	//	Exception: `"Validation failed"`.
	deserialize(subject, model, revive)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(subject)) throw new Exception(0xCD6A2E, `Argument is invalid: "subject".`);
			if (!Type.isObject(model)) throw new Exception(0x580E35, `Argument is invalid: "model".`);
		}
		if (model._schemaInstanceId !== this._schemaInstanceId) throw new Exception(0x158BA9, `Invalid operation.`);
		const obj = JSON.parse(subject, revive);
		const outcome = this.test(obj, model);
		if (outcome) return obj;
		throw `Validation failed.`;
	}

	//	Function: Provide detailed information on the critical and non-critical validation failures for a unsuccessful or successful validation performed by the last call of `SchemaObsolete.test()`, `SchemaObsolete.serialize()` or `SchemaObsolete.deserialize()`.
	//	Returns: `
	//		[{
	//			path,			//	schema path to the point of failure; sample path: '{}'.'array'[0].'object'
	//			hintPath,		//	schema path to the relevant hint point for the point of failure; sample path: '{}'.'array'[0]
	//			messageId,		//	an id of the error indicating the type of failure; see the constructor Remarks for details.
	//			message,		//	an human-readable error message indicating the type of failure; see the constructor Remarks for details.
	//			propertyName,	//	the name of the unexpected object property; present only with messageId == SchemaObsolete.MessageId_unexpectedProperty.
	//			expectedValue,	//	the value that was expected; present only with messageId == SchemaObsolete.MessageId_invalidValue.
	//			validatorName,	//	the name of the failing custom validator; present only with messageId == SchemaObsolete.MessageId_matchFailed; see the constructor Remarks for details.
	//			validatorConfig,//	the configuration of the failing custom validator; present only with messageId == SchemaObsolete.MessageId_matchFailed, and if configuration was specified in the model for the failing validator.
	//			hints:			//	a collection of available hints as defined in the model, ordered by specificity up to the model definition root; present only if any hints were resolved for the failing schema type definition.
	//			[{
	//				hintPath:	//	schema path to the point; sample path: '{}'.'array'[0]
	//				hint:		//	user-defined text, as defined in the model
	//			}],
	//		}]`
	//	Remarks: The value returned by this function is only valid before the next `SchemaObsolete.test()`, `SchemaObsolete.serialize()` or `SchemaObsolete.deserialize()` call. As a principle, the result of calling
	//		this method should be considered unpredictable if another function call has been made after the last call of `SchemaObsolete.test()`, `SchemaObsolete.serialize()` or `SchemaObsolete.deserialize()`.
	//		The motivation behind such design decision is memory and performance optimization.
	explain()
	{
		const result =
		{
			success: this._errorBuffer[0],
			messages: [],
		};

		for (let length = this._errorBufferIndex + 1, i = 1; i < length; ++i)
		{
			const item = this._errorBuffer[i];
			const resultItem = {};
			resultItem.path = item.p;
			resultItem.hintPath = item.h;
			resultItem.messageId = item.m;
			switch (resultItem.messageId)
			{
				case SchemaObsolete.MessageId_noAltMatch:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_noAltMatch]) || "No valid alternative was matched.";
					break;
				case SchemaObsolete.MessageId_objectExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_objectExpected]) || "Object expected.";
					break;
				case SchemaObsolete.MessageId_structExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_structExpected]) || "Any object expected, except for String, Number, Boolean and Array.";
					break;
				case SchemaObsolete.MessageId_unexpectedProperty:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_unexpectedProperty]) || "Unexpected property.";
					resultItem.propertyName = item.d;
					break;
				case SchemaObsolete.MessageId_arrayExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_arrayExpected]) || "Array expected.";
					break;
				case SchemaObsolete.MessageId_numberExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_numberExpected]) || "Number expected.";
					break;
				case SchemaObsolete.MessageId_stringExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_stringExpected]) || "String expected.";
					break;
				case SchemaObsolete.MessageId_booleanExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_booleanExpected]) || "Boolean expected.";
					break;
				case SchemaObsolete.MessageId_NUExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_NUExpected]) || "NU expected.";
					break;
				case SchemaObsolete.MessageId_nullExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_nullExpected]) || "Null expected.";
					break;
				case SchemaObsolete.MessageId_voidExpected:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_booleanExpected]) || "Undefined expected.";
					break;
				case SchemaObsolete.MessageId_invalidValue:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_invalidValue]) || "Invalid value.";
					resultItem.expectedValue = item.d;
					break;
				case SchemaObsolete.MessageId_matchFailed:
					resultItem.message = (this.messages && this.messages[SchemaObsolete.MessageId_matchFailed]) || "Custom validation failed.";
					resultItem.validatorName = item.d;
					if (item.e) resultItem.validatorConfig = item.e;
					break;
			}
			const outcome = lookupAncestorHints(this._lastModel._doc, resultItem.hintPath);
			if (outcome) resultItem.hints = outcome;
			result.messages.push(resultItem);
		}

		function lookupAncestorHints(doc, hintPath)
		{
			const result = [];
			const groupPathTokens = DotQuoteNotation.parse(hintPath);
			while (groupPathTokens.length)
			{
				const path = DotQuoteNotation.format(groupPathTokens);
				const hint = doc[path];
				if (hint) result.push({ hintPath: path, hint });
				groupPathTokens.pop();
			}
			return result.length ? result : null;
		}

		return result;
	}

	//	Function: For intenral use. Only marked as public for unit testing.
	//	returns: a `<TypeDefList>`.
	//	`[
	//		{
	//			path: "",
	//			hintPath: "",	//	used also as a key in `context._doc`
	//
	//			type: SchemaObsolete.Object ||
	//			type: SchemaObsolete.Object,
	//				propertyExclusive: true,
	//				classAgnostic: true,
	//				properties: [{ name, alternatives: TypeDefList }] ||
	//			type: SchemaObsolete.Array ||
	//			type: SchemaObsolete.Array,
	//				elementAlternatives: [<TypeDefList>] ||
	//			type: SchemaObsolete.Atom, 
	//				valueType: LiteralType.*,
	//				value: * ||
	//			type: SchemaObsolete.Number ||
	//			type: SchemaObsolete.String ||
	//			type: SchemaObsolete.Boolean ||
	//			type: SchemaObsolete.NullOrUndefined ||
	//			type: SchemaObsolete.Null ||
	//			type: SchemaObsolete.Void ||
	//			type: SchemaObsolete.Any ||
	//
	//			match: [{ key } || { key, config }],
	//		}
	//	]`
	static parseDef(context, path, hintPath, def)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(context)) throw new Exception(0x114540, `Argument is invalid: "context".`);
			if (!Type.isObject(context._doc)) throw new Exception(0x209F17, `Argument is invalid: "context._doc".`);
			if (!Type.isString(path)) throw new Exception(0xCA5236, `Argument is invalid: "path".`);
			if (!Type.isString(hintPath)) throw new Exception(0xFB27B2, `Argument is invalid: "hintPath".`);
		}

		if (!LiteralType.isNU(def) && Object.prototype.hasOwnProperty.call(def, "typedef")) def = def.typedef;
		if (LiteralType.isString(def) && (def === SchemaObsolete.any || def === SchemaObsolete.array || def === SchemaObsolete.boolean || def === SchemaObsolete.NU || def === SchemaObsolete.null || def === SchemaObsolete.number || def === SchemaObsolete.object || def === SchemaObsolete.objex || def === SchemaObsolete.string || def === SchemaObsolete.struct || def === SchemaObsolete.strux || def === SchemaObsolete.void)) def = { [def]: 1 };

		const type = LiteralType.getType(def);
		switch (type)
		{
			case LiteralType.Object:
				const isDirectTypeDef =
					!Object.prototype.hasOwnProperty.call(def, "object") &&
					!Object.prototype.hasOwnProperty.call(def, "objex") &&
					!Object.prototype.hasOwnProperty.call(def, "struct") &&
					!Object.prototype.hasOwnProperty.call(def, "strux") &&
					!Object.prototype.hasOwnProperty.call(def, "also") &&
					!Object.prototype.hasOwnProperty.call(def, "is") &&
					!Object.prototype.hasOwnProperty.call(def, "alt") &&
					!Object.prototype.hasOwnProperty.call(def, "array") &&
					!Object.prototype.hasOwnProperty.call(def, "boolean") &&
					!Object.prototype.hasOwnProperty.call(def, "NU") &&
					!Object.prototype.hasOwnProperty.call(def, "null") &&
					!Object.prototype.hasOwnProperty.call(def, "void") &&
					!Object.prototype.hasOwnProperty.call(def, "hint") &&
					!Object.prototype.hasOwnProperty.call(def, "match") &&
					!Object.prototype.hasOwnProperty.call(def, "number") &&
					!Object.prototype.hasOwnProperty.call(def, "string") &&
					!Object.prototype.hasOwnProperty.call(def, "any") &&
					!Object.prototype.hasOwnProperty.call(def, "typedef") &&
					NativeGraph.count(def) !== 0
				if (isDirectTypeDef) return parseObjectDirect(context, path, hintPath, def);
				return parseObject(context, path, hintPath, def);
			case LiteralType.Array:
				return parseObject(context, path, hintPath, { alt: def });
			case LiteralType.Boolean:
				if (def !== true) throw new Exception(0x3DDCE8, `Invalid "boolean" schema definition at "${path}": ${JSON.stringify(def)}. Hint: true.`);
				return [{ hintPath, path, type: SchemaObsolete.Boolean }];
			case LiteralType.Number:
				if (def !== 0) throw new Exception(0xF31ECA, `Invalid "number" schema definition at "${path}": ${JSON.stringify(def)}. Hint: 0.`);
				return [{ hintPath, path, type: SchemaObsolete.Number }];
			case LiteralType.String:
				if (def !== "") throw new Exception(0x740449, `Invalid "string" schema definition at "${path}": ${JSON.stringify(def)}. Hint: "".`);
				return [{ hintPath, path, type: SchemaObsolete.String }];
			case LiteralType.Null:
				return [{ hintPath, path, type: SchemaObsolete.Null }];
			case LiteralType.Undefined:
				return [{ hintPath, path, type: SchemaObsolete.Void }];
			case LiteralType.NonLiteral:
				throw new Exception(0x6B3190, `Unsupported schema definition type ${Type.getType(def).description}.`);
			default: throw new Exception(0x42D7D5, `Not implemented.`);
		}

		function parseObjectDirect(context, path, hintPath, def)
		{
			let result = [];

			const typeDef = { hintPath, path: path, type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false };
			for (const key in def) typeDef.properties.push({ name: key, alternatives: SchemaObsolete.parseDef(context, path + '.' + DotQuoteNotation.encodeComponent(key), hintPath + '.' + DotQuoteNotation.encodeComponent(key), def[key]) });
			result.push(typeDef);

			return result;
		}

		function parseObject(context, path, hintPath, def)
		{
			let result = [];
			let propertyCount = 0;
			let hasIsDirective = false;
			let hasIsDirectiveCintradictor = false;

			if (!LiteralType.isNU(def) && Object.prototype.hasOwnProperty.call(def, "typedef")) def = def.typedef;

			const match = [];
			for (const key in def)
			{
				++propertyCount;
				const path2 = path + '.' + DotQuoteNotation.encodeComponent(key);
				const hintPath2 = hintPath + '.' + DotQuoteNotation.encodeComponent(key);
				const value = def[key];

				switch (key)
				{
					case "string":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.string) { result.push({ hintPath, path: path2, type: SchemaObsolete.String }); continue; }
						throw new Exception(0xF24527, `Invalid "string" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { string: 1 || "string" }.`);
					case "number":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.number) { result.push({ hintPath, path: path2, type: SchemaObsolete.Number }); continue; }
						throw new Exception(0xA0E48B, `Invalid "number" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { number: 1 || "number" }.`);
					case "boolean":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.boolean) { result.push({ hintPath, path: path2, type: SchemaObsolete.Boolean }); continue; }
						throw new Exception(0x8C21BF, `Invalid "boolean" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { boolean: 1 || "boolean" }.`);
					case "NU":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.NU) { result.push({ hintPath, path: path2, type: SchemaObsolete.NullOrUndefined }); continue; }
						throw new Exception(0x19F374, `Invalid "NU" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { NU: 1 || "NU" }.`);
					case "null":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.null) { result.push({ hintPath, path: path2, type: SchemaObsolete.Null }); continue; }
						throw new Exception(0x97189F, `Invalid "null" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { null: 1 || "null" }.`);
					case "void":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.void) { result.push({ hintPath, path: path2, type: SchemaObsolete.Void }); continue; }
						throw new Exception(0x7578B3, `Invalid "void" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { void: 1 || "void" }.`);
					case "objex":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.objex) { result.push({ hintPath, path: path2, type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false }); continue; }
						else if (LiteralType.isObject(value))
						{
							const typeDef = { hintPath, path: path2, type: SchemaObsolete.Object, properties: [], propertyExclusive: false, classAgnostic: false };
							for (const key2 in value) typeDef.properties.push({ name: key2, alternatives: SchemaObsolete.parseDef(context, path2 + '.' + DotQuoteNotation.encodeComponent(key2), hintPath2 + '.' + DotQuoteNotation.encodeComponent(key2), value[key2]) });
							result.push(typeDef);
							continue;
						}
						else throw new Exception(0x417681, `Invalid "objex" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { objex: 1 || "objex" || { <property type defs> } }.`);
					case "object":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.object) { result.push({ hintPath, path: path2, type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: false }); continue; }
						else if (LiteralType.isObject(value))
						{
							const typeDef = { hintPath, path: path2, type: SchemaObsolete.Object, properties: [], propertyExclusive: true, classAgnostic: false };
							for (const key2 in value) typeDef.properties.push({ name: key2, alternatives: SchemaObsolete.parseDef(context, path2 + '.' + DotQuoteNotation.encodeComponent(key2), hintPath2 + '.' + DotQuoteNotation.encodeComponent(key2), value[key2]) });
							result.push(typeDef);
							continue;
						}
						else throw new Exception(0x514F4C, `Invalid "object" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { object: 1 || "object" || { <property type defs> } }.`);
					case "strux":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.strux) { result.push({ hintPath, path: path2, type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: true }); continue; }
						else if (LiteralType.isObject(value))
						{
							const typeDef = { hintPath, path: path2, type: SchemaObsolete.Object, properties: [], propertyExclusive: false, classAgnostic: true };
							for (const key2 in value) typeDef.properties.push({ name: key2, alternatives: SchemaObsolete.parseDef(context, path2 + '.' + DotQuoteNotation.encodeComponent(key2), hintPath2 + '.' + DotQuoteNotation.encodeComponent(key2), value[key2]) });
							result.push(typeDef);
							continue;
						}
						else throw new Exception(0xC2D844, `Invalid "strux" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { strux: 1 || "strux" || { <property type defs> } }.`);
					case "struct":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.struct) { result.push({ hintPath, path: path2, type: SchemaObsolete.Object, propertyExclusive: true, classAgnostic: true }); continue; }
						else if (LiteralType.isObject(value))
						{
							const typeDef = { hintPath, path: path2, type: SchemaObsolete.Object, classAgnostic: true, properties: [], propertyExclusive: true, classAgnostic: false };
							for (const key2 in value) typeDef.properties.push({ name: key2, alternatives: SchemaObsolete.parseDef(context, path2 + '.' + DotQuoteNotation.encodeComponent(key2), hintPath2 + '.' + DotQuoteNotation.encodeComponent(key2), value[key2]) });
							result.push(typeDef);
							continue;
						}
						else throw new Exception(0xEDD80D, `Invalid "struct" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { struct: 1 || "struct" || { <property type defs> } }.`);
					case "array":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === SchemaObsolete.array) { result.push({ hintPath, path: path2, type: SchemaObsolete.Array }); continue; }
						if (!LiteralType.isArray(value)) throw new Exception(0xDB0D7A, `Invalid "array" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { array: 1 || "array" || [<element type defs>] }.`);
						if (!value.length) { result.push({ hintPath, path: path2, type: SchemaObsolete.Array }); continue; }
						const typeDef = { hintPath, path: path2, type: SchemaObsolete.Array, elementAlternatives: [] };
						for (let length = value.length, i = 0; i < length; ++i) typeDef.elementAlternatives = typeDef.elementAlternatives.concat(SchemaObsolete.parseDef(context, path2 + '[' + i + "]", hintPath2 + '[' + i + "]", value[i]));
						result.push(typeDef);
						continue;
					case "also":
					case "is":
						{
							if (key === "is") hasIsDirective = true;
							else hasIsDirectiveCintradictor = true;

							const type = LiteralType.getType(value);
							switch (type)
							{
								case LiteralType.Undefined:
								case LiteralType.Null:
								case LiteralType.Boolean:
								case LiteralType.Number:
								case LiteralType.String:
									result.push({ hintPath, path: path2, type: SchemaObsolete.Atom, valueType: type, value });
									break;
								case LiteralType.Array:
									if (!value.length) throw new Exception(0x851B24, `Invalid "${key}" schema definition type at "${path2}": ${Type.getType(value).description}; array is empty. Supported types are null, undefined, boolean, number, string, non-empty array.`);
									for (let length = value.length, i = 0; i < length; ++i)
									{
										const value2 = value[i];
										const type = LiteralType.getType(value2);
										switch (type)
										{
											case LiteralType.Undefined:
											case LiteralType.Null:
											case LiteralType.Boolean:
											case LiteralType.Number:
											case LiteralType.String:
												result.push({ hintPath, path: path2 + '[' + i + ']', type: SchemaObsolete.Atom, valueType: type, value: value2 });
												break;
											case LiteralType.Array:
											case LiteralType.Object:
											case LiteralType.NonLiteral:
												throw new Exception(0x76E175, `Invalid "${key}" schema definition value type at "${path2}[${i}]": ${Type.getType(value2).description}. Supported types are null, undefined, boolean, number, string.`);
											default: throw new Exception(0x4295CC, `Not implemented.`);
										}
									}
									break;
								case LiteralType.Object:
								case LiteralType.NonLiteral:
									throw new Exception(0x6FCEA4, `Invalid "${key}" schema definition type at "${path2}": ${Type.getType(value).description}. Supported types are null, undefined, boolean, number, string, non-empty array.`);
								default: new Exception(0x5B6598, `Not implemented.`);
							}
						}
						continue;
					case "alt":
						hasIsDirectiveCintradictor = true;
						if (!LiteralType.isArray(value)) throw new Exception(0xAA717B, `Invalid "alt" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { alt: [<type defs>] }, where [<type defs>] must be a non-empty array of objects.`);
						if (!value.length) throw new Exception(0x6221C8, `Invalid "alt" schema definition type at "${path2}": ${Type.getType(value).description}; array is empty. Hint: { alt: [<type defs>] }, where [<type defs>] must be a non-empty array of objects.`);
						for (let length = value.length, i = 0; i < length; ++i) result = result.concat(SchemaObsolete.parseDef(context, path2 + '[' + i + ']', hintPath2 + '[' + i + ']', value[i]));
						continue;
					case "any":
						hasIsDirectiveCintradictor = true;
						if (value === 1 || value === "any") { result.push({ hintPath, path: path2, type: SchemaObsolete.Any }); continue; }
						throw new Exception(0x779996, `Invalid "any" schema definition at "${path2}": ${JSON.stringify(value)}. Hint: { any: 1 || "any" }.`);
					case "match":
						hasIsDirectiveCintradictor = true;
						if (LiteralType.isString(value)) { match.push({ key: value }); continue; }
						else if (LiteralType.isObject(value))
						{
							for (const key2 in value)
							{
								const value2 = value[key2];
								if (value === 1) { match.push({ key: key2 }); continue; }
								match.push({ key: key2, config: value2 });
							}
							continue;
						}
						else if (LiteralType.isArray(value))
						{
							for (let length = value.length, i = 0; i < length; ++i)
							{
								const item = value[i];
								if (!LiteralType.isString(item)) throw new Exception(0xFFE2F4, `Invalid "match" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { match: [ "<validator full name>" ] || { "<validator full name>": 1 || <config>, ... } }.`);
								match.push({ key: item });
							}
							continue;
						}
						else throw new Exception(0xB88947, `Invalid "match" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { match: [ "<validator full name>" ] || { "<validator full name>": 1 || <config>, ... } }.`);
					case "hint":
						if (!LiteralType.isString(value)) throw new Exception(0x4AC40B, `Invalid "hint" schema definition type at "${path2}": ${Type.getType(value).description}. Hint: { hint: "" }.`);
						context._doc[path] = value;
						continue;
					default: throw new Exception(0x59D9B0, `Invalid schema definition directive at "${path}": "${key}". Supported directives are "also", "alt", "any", "array", "boolean", "hint", "is", "match", "number", "NU", "null", "object", "objex", "string", "struct", "strux", "typedef" and "void".`);
				}
			}

			if (!propertyCount) result.push({ hintPath, path, type: SchemaObsolete.Object, propertyExclusive: false, classAgnostic: false });
			else
			{
				//	if there is only a `hint` (`context._doc[path]`) directive present and no type definition or a match
				if (!result.length && !match.length && Type.isString(context._doc[path])) throw new Exception(0x614920, `Invalid schema definition at "${path}": at least one type definition or a match directive is required. Hint: { also || alt || any || array || boolean || is || NU || null || number || object || objex || string || struct || strux || void, hint, match }.`);
				//	if there are only `match` (`match.length`) and `hint` (`context._doc[path]`) directives present and no type definitions, assume `{ any: 1 }`
				if (!result.length && (match.length || Type.isString(context._doc[path]))) result.push({ hintPath, path: path, type: SchemaObsolete.Any });
				//	if there is a contradicting directive along with the `is` directive
				if (hasIsDirective && hasIsDirectiveCintradictor) throw new Exception(0xE859D3, `Invalid schema definition at "${path}": the is directive cannot be combined with other directives except for hint. Hint: {is, hint}.`);
			}

			//	spread the `match` directive to all non-value (non-`also`) type definitions
			if (match.length)
			{
				let hasNonValueTypeDef = false;
				for (let length = result.length, i = 0; i < length; ++i)
				{
					const item = result[i];
					if (item.type === SchemaObsolete.Atom) continue;
					item.match = item.match ? item.match.concat(match) : match;
					hasNonValueTypeDef = true;
				}
				if (!hasNonValueTypeDef) throw new Exception(0xFED901, `The "match" directive will have no effect at "${path}".`);
			}

			return result;
		}
	}

	//	Function: For intenral use. Only marked as public for unit testing.
	static walkTypeDefList(typeDefList, onStructural)
	{
		return _walk(typeDefList, [], [], 0, onStructural);

		function _walk(typeDefList, path, jsonPath, depth, onStructural)
		{
			if (PB_DEBUG)
			{
				if (!Type.isArray(typeDefList)) throw new Exception(0x2C681B, `Argument is invalid: "typeDefList".`);
				if (!Type.isArray(path)) throw new Exception(0x5BD11F, `Argument is invalid: "path".`);
				if (!Type.isArray(jsonPath)) throw new Exception(0xDDBD1E, `Argument is invalid: "jsonPath".`);
				if (!CallableType.isFunction(onStructural)) throw new Exception(0x387DC9, `Argument is invalid: "callback".`);
			}

			if (typeDefList.length > 1) onStructural(SchemaObsolete.Structural_AltList, path, jsonPath, depth, null);
			let iitem = null;
			for (let ilength = typeDefList.length, i = 0; i < ilength; ++i)
			{
				iitem = typeDefList[i];
				if (ilength > 1) onStructural(SchemaObsolete.Structural_Alt, path, jsonPath, depth, null);
				path.push(iitem);
				switch (iitem.type)
				{
					case SchemaObsolete.Object:
						onStructural(SchemaObsolete.Structural_Object, path, jsonPath, depth, iitem);
						if (iitem.properties) for (let jlength = iitem.properties.length, j = 0; j < jlength; ++j)
						{
							const jitem = iitem.properties[j];
							const pseudoTypeDef =
							{
								hintPath: jitem.alternatives[0].hintPath,
								path: jitem.alternatives[0].hintPath,		//	assume the hintPath of the first type def for the property as path; entirely empirical decision
							};
							path.push(pseudoTypeDef);
							jsonPath.push(jitem.name);
							onStructural(SchemaObsolete.Structural_ObjectProperty, path, jsonPath, depth, pseudoTypeDef);
							_walk(jitem.alternatives, path, jsonPath, depth + 1, onStructural);
							onStructural(SchemaObsolete.Structural_ObjectPropertyEnd, path, jsonPath, depth, pseudoTypeDef);
							jsonPath.pop();
							path.pop();
						}
						onStructural(SchemaObsolete.Structural_ObjectEnd, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Array:
						onStructural(SchemaObsolete.Structural_Array, path, jsonPath, depth, iitem);
						if (iitem.elementAlternatives) _walk(iitem.elementAlternatives, path, jsonPath, depth + 1, onStructural);
						onStructural(SchemaObsolete.Structural_ArrayEnd, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Number:
						onStructural(SchemaObsolete.Structural_Number, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.String:
						onStructural(SchemaObsolete.Structural_String, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Boolean:
						onStructural(SchemaObsolete.Structural_Boolean, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.NullOrUndefined:
						onStructural(SchemaObsolete.Structural_NU, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Null:
						onStructural(SchemaObsolete.Structural_Null, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Void:
						onStructural(SchemaObsolete.Structural_Void, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Any:
						onStructural(SchemaObsolete.Structural_Any, path, jsonPath, depth, iitem);
						break;
					case SchemaObsolete.Atom:
						onStructural(SchemaObsolete.Structural_Value, path, jsonPath, depth, iitem);
						break;
					default: throw new Exception(0xBD2701, `Not implemented.`);
				}
				path.pop();
				if (ilength > 1) onStructural(SchemaObsolete.Structural_AltEnd, path, jsonPath, depth, null);
			}
			if (typeDefList.length > 1) onStructural(SchemaObsolete.Structural_AltListEnd, path, jsonPath, depth, null);
			if (iitem && iitem.match) onStructural(SchemaObsolete.Structural_CustomMatch, path, jsonPath, depth, iitem);
		}
	}

	//	Function: For internal use. Marked as public for unit testing only.
	//	Remarks: List of the possible validation error message ids and the corresponding detail fields:
	//	- `SchemaObsolete.MessageId_noAltMatch`;
	//	- `SchemaObsolete.MessageId_objectExpected`;
	//	- `SchemaObsolete.MessageId_structExpected`;
	//	- `SchemaObsolete.MessageId_unexpectedProperty`, `.d` holds the name of the unexpected property;
	//	- `SchemaObsolete.MessageId_arrayExpected`;
	//	- `SchemaObsolete.MessageId_numberExpected`;
	//	- `SchemaObsolete.MessageId_stringExpected`;
	//	- `SchemaObsolete.MessageId_booleanExpected`;
	//	- `SchemaObsolete.MessageId_NUExpected`;
	//	- `SchemaObsolete.MessageId_nullExpected`;
	//	- `SchemaObsolete.MessageId_voidExpected`;
	//	- `SchemaObsolete.MessageId_invalidValue`, `.d` holds the expected value;
	//	- `SchemaObsolete.MessageId_matchFailed`, `.d` holds the name of the failing custom validation function, `.e` holds the match configuration object if such is present in the schema;
	//	Generated code requires the following variables to be already defined:
	//	`n: *` - iNput
	//	`r: []` - eRrors - this array is used internally for performance optimization; intended to be reused between all calls to the function below.
	//	`cv: {}` - Custom Validators in the form `{"validator.full.name": function, ...}`
	//	`cb: function` - Custom validator callback function`
	//	Generated code returns the last index in `r` that was set by the function.
	static generateCode_validate(alternatives, validators, config = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(alternatives)) throw new Exception(0xFF631F, `Argument is invalid: "alternatives".`);
			if (!Type.isObject(validators)) throw new Exception(0xEC5267, `Argument is invalid: "validators".`);
			if (!Type.isNU(config) && !Type.isObject(config)) throw new Exception(0xECA085, `Argument is invalid: "config".`);
			if (!Type.isNU(config) && !Type.isBoolean(config.createSerializer)) throw new Exception(0xC9CCCA, `Argument is invalid: "config.createSerializer".`);
		}

		const createSerializer = config && config.createSerializer;

		const result = [];
		const roots = ["n"];
		const startIndices = [0];
		const altDepths = [];
		const admissiblePropertyNames = [];

		const serializer =
		{
			containerIsArrayStack: [false],
			get containerIsArray()
			{
				return this.containerIsArrayStack[this.containerIsArrayStack.length - 1];
			},

			needsComaStack: [0],
			get needsComa()
			{
				return !this.containerIsArray && this.needsComaStack[this.needsComaStack.length - 1] !== 0;
			},
			incNeedsComa()
			{
				++this.needsComaStack[this.needsComaStack.length - 1];
			},

			begin: () => result.push('let pt=-1;'),
			end: () => result.push('return sb.slice(0, pt+1).join("");'),

			save: () => result.push('const sss=pt;'),
			restore: () => result.push('pt=sss;'),
			getRestoreCode: () => 'pt=sss;',
			startScope: () => result.push('{'),
			endScope: () => result.push('}'),

			startObject()
			{
				if (this.needsComa) result.push(`sb[++pt]=",{";`);
				else result.push(`sb[++pt]="{";`);
				this.incNeedsComa();
				this.needsComaStack.push(0);
				this.containerIsArrayStack.push(false);
			},
			endObject()
			{
				result.push(`sb[++pt]="}";`);
				this.needsComaStack.pop();
				this.containerIsArrayStack.pop();
			},
			startArray()
			{
				if (this.needsComa) result.push(`sb[++pt]=",[";`);
				else result.push(`sb[++pt]="[";`);
				this.incNeedsComa();
				this.needsComaStack.push(0);
				this.containerIsArrayStack.push(true);
			},
			arrayComa(depth)
			{
				result.push(`if(i${depth}!==0)sb[++pt]=",";`);
			},
			endArray()
			{
				result.push(`sb[++pt]="]";`);
				this.needsComaStack.pop();
				this.containerIsArrayStack.pop();
			},
			reference(type, value)
			{
				switch (type)
				{
					case LiteralType.Number:
					case LiteralType.Boolean:
						result.push(`sb[++pt]=${value};`);
						break;
					case LiteralType.String:
						result.push(`sb[++pt]=JSON.stringify(${value});`);
						break;
					case LiteralType.Null:
						result.push(`sb[++pt]="null";`);
						break;
					case LiteralType.Undefined:
						if (this.containerIsArray) result.push(`sb[++pt]="null";`);
						else result.push(`--pt;`);
						break;
					default: throw new Exception(0xF6861B, `Not implemented.`);
				}
			},
			referenceNU(value)
			{
				if (this.containerIsArray) result.push(`sb[++pt]="null";`);
				else result.push(`${value}===null?sb[++pt]="null":--pt;`);
			},
			anyReference(value)
			{
				result.push(`if(${value}===void 0)--pt;else sb[++pt]=JSON.stringify(${value});`);
			},
			propertyName(value)
			{
				if (this.needsComa) result.push(`sb[++pt]=',${JSON.stringify(value)}:';`);
				else result.push(`sb[++pt]='${JSON.stringify(value)}:';`);
				this.incNeedsComa();
			},
		};

		if (createSerializer) serializer.begin();
		result.push("let rr, ri=0;FAIL:do{");
		SchemaObsolete.walkTypeDefList(alternatives, (structural, path, jsonPath, depth, typeDef) =>
		{
			const breakLabel = altDepths.length ? `A${altDepths[altDepths.length - 1]}` : `FAIL`;
			const effectiveHintPath = typeDef ? typeDef.hintPath : path.length ? path[path.length - 1].hintPath : "'{}'";
			const pathText = typeDef ? typeDef.path : path.length ? path[path.length - 1].path : "'{}'";
			const buildBreakStatement = (restore, messageId, detail1, detail2) =>
			{
				//	`rr.p` - `path`
				//	`rr.h` - `hintPath`
				//	`rr.m` - `messageId`
				//	`rr.d` - detail
				//	`rr.e` - extended detail
				if (messageId === SchemaObsolete.MessageId_unexpectedProperty) return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(pathText)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)},rr.d=k;break ${breakLabel};}`;
				else if (messageId === SchemaObsolete.MessageId_invalidValue) return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(pathText)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)},rr.d=${detail1};break ${breakLabel};}`;
				else if (messageId === SchemaObsolete.MessageId_matchFailed && !detail2) return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(effectiveHintPath)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)},rr.d=${JSON.stringify(detail1)};break ${breakLabel};}`;
				else if (messageId === SchemaObsolete.MessageId_matchFailed && detail2) return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(effectiveHintPath)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)},rr.d=${JSON.stringify(detail1)},rr.e=${JSON.stringify(detail2)};break ${breakLabel};}`;
				else if (detail1 && !detail2) return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(pathText)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)},rr.d=${JSON.stringify(detail1)};break ${breakLabel};}`;
				else if (detail1 && detail2) return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(pathText)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)},rr.d=${JSON.stringify(detail1)},rr.e=${JSON.stringify(detail2)};break ${breakLabel};}`;
				else return `{${createSerializer && restore ? serializer.getRestoreCode() : ""}++ri;rr=ri<r.length?r[ri]:(r[ri]={});rr.p=${JSON.stringify(pathText)},rr.h=${JSON.stringify(effectiveHintPath)},rr.m=${JSON.stringify(messageId)};break ${breakLabel};}`;
			};
			switch (structural)
			{
				case SchemaObsolete.Structural_AltList:
					if (createSerializer) { serializer.startScope(); serializer.save(); }
					result.push(`L${depth}:do{`);
					break;
				case SchemaObsolete.Structural_AltListEnd:
					result.push(buildBreakStatement(true, SchemaObsolete.MessageId_noAltMatch));
					result.push("}while(false);");
					if (createSerializer) { serializer.endScope(); }
					break;
				case SchemaObsolete.Structural_Alt:
					if (createSerializer) { serializer.startScope(); serializer.save(); }
					altDepths.push(depth);
					result.push(`A${depth}:do{`);
					break;
				case SchemaObsolete.Structural_AltEnd:
					altDepths.pop();
					result.push(`break L${depth};`);
					result.push("}while(false);");
					if (createSerializer) { serializer.restore(); serializer.endScope(); }
					break;
				case SchemaObsolete.Structural_Object:
					{
						if (createSerializer) { serializer.save(); serializer.startObject(); }

						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						if (!typeDef.classAgnostic) result.push(`if(!${jsonPathCode} || (${jsonPathCode}.constructor && ${jsonPathCode}.constructor !== Object)) ${buildBreakStatement(true, SchemaObsolete.MessageId_objectExpected)}`);
						else result.push(`if(!${jsonPathCode} || !(${jsonPathCode} instanceof Object) || ${jsonPathCode}.constructor === String || ${jsonPathCode}.constructor === Number || ${jsonPathCode}.constructor === Boolean || ${jsonPathCode}.constructor === Array) ${buildBreakStatement(true, SchemaObsolete.MessageId_structExpected)}`);
						if (typeDef.propertyExclusive) admissiblePropertyNames.push(typeDef.properties ? typeDef.properties.map(x => x.name) : []);
					}
					break;
				case SchemaObsolete.Structural_ObjectProperty:
					if (createSerializer) { serializer.propertyName(jsonPath[jsonPath.length - 1]); }
					break;
				case SchemaObsolete.Structural_ObjectPropertyEnd:
					//	noop
					break;
				case SchemaObsolete.Structural_ObjectEnd:
					if (typeDef.propertyExclusive)
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						const propertyNames = admissiblePropertyNames.pop();
						if (propertyNames.length)
						{
							const propertyNamesCode = JSON.stringify(propertyNames);
							result.push(`{const a = ${propertyNamesCode}; for(const k in ${jsonPathCode}) if(a.indexOf(k) === -1) ${buildBreakStatement(true, SchemaObsolete.MessageId_unexpectedProperty)} }`);
						}
						else result.push(`for(const k in ${jsonPathCode}) ${buildBreakStatement(true, SchemaObsolete.MessageId_unexpectedProperty)}`);

						if (createSerializer) { serializer.endObject(); }
					}
					break;
				case SchemaObsolete.Structural_Array:
					{
						if (createSerializer) { serializer.save(); serializer.startArray(); }

						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if(!${jsonPathCode} || ${jsonPathCode}.constructor !== Array) ${buildBreakStatement(true, SchemaObsolete.MessageId_arrayExpected)}`);
						if (typeDef.elementAlternatives)
						{
							result.push(`for(let c${depth} = ${jsonPathCode}, l${depth} = c${depth}.length, i${depth} = 0; i${depth} < l${depth}; ++i${depth}) { const m${depth} = c${depth}[i${depth}];`);

							if (createSerializer) { serializer.arrayComa(depth); }

							startIndices.push(jsonPath.length);
							roots.push(`m${depth}`);
						}
					}
					break;
				case SchemaObsolete.Structural_ArrayEnd:
					if (typeDef.elementAlternatives)
					{
						result.push(`}`);
						startIndices.pop();
						roots.pop();
					}

					if (createSerializer) { serializer.endArray(); }
					break;
				case SchemaObsolete.Structural_Number:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if((!${jsonPathCode} && ${jsonPathCode} !== 0) || (${jsonPathCode}.constructor !== Number)) ${buildBreakStatement(true, SchemaObsolete.MessageId_numberExpected)}`);

						if (createSerializer) { serializer.reference(LiteralType.Number, jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_String:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if((!${jsonPathCode} && ${jsonPathCode} !== "") || (${jsonPathCode}.constructor !== String)) ${buildBreakStatement(true, SchemaObsolete.MessageId_stringExpected)}`);

						if (createSerializer) { serializer.reference(LiteralType.String, jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_Boolean:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if(${jsonPathCode} !== true && ${jsonPathCode} !== false && (!${jsonPathCode} || ${jsonPathCode}.constructor !== Boolean)) ${buildBreakStatement(true, SchemaObsolete.MessageId_booleanExpected)}`);

						if (createSerializer) { serializer.reference(LiteralType.Boolean, jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_NU:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if(${jsonPathCode} !== null && ${jsonPathCode} !== void 0) ${buildBreakStatement(true, SchemaObsolete.MessageId_nullExpected)}`);

						if (createSerializer) { serializer.referenceNU(jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_Null:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if(${jsonPathCode} !== null) ${buildBreakStatement(true, SchemaObsolete.MessageId_nullExpected)}`);

						if (createSerializer) { serializer.reference(LiteralType.Null, jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_Void:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						result.push(`if(${jsonPathCode} !== void 0) ${buildBreakStatement(true, SchemaObsolete.MessageId_voidExpected)}`);

						if (createSerializer) { serializer.reference(LiteralType.Undefined, jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_Value:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						let valueCode;
						switch (typeDef.valueType)
						{
							case LiteralType.Undefined: valueCode = "void 0"; break;
							case LiteralType.Null: valueCode = "null"; break;
							case LiteralType.Boolean: valueCode = typeDef.value ? "true" : "false"; break;
							case LiteralType.Number: valueCode = JSON.stringify(typeDef.value); break;
							case LiteralType.String: valueCode = JSON.stringify(typeDef.value); break;
							default: throw `Not implemented.`;
						}
						result.push(`if(${jsonPathCode} !== ${valueCode}) ${buildBreakStatement(true, SchemaObsolete.MessageId_invalidValue, valueCode)}`);

						if (createSerializer) { serializer.reference(typeDef.valueType, jsonPathCode); }
					}
					break;
				case SchemaObsolete.Structural_Any:
					if (createSerializer)
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						serializer.anyReference(jsonPathCode);
					}
					break;
				case SchemaObsolete.Structural_CustomMatch:
					{
						const jsonPathCode = getJsonPathCode(roots[roots.length - 1], jsonPath, startIndices[startIndices.length - 1]);
						for (let length = typeDef.match.length, i = 0; i < length; ++i)
						{
							const item = typeDef.match[i];
							//	TODO: after `validators` schema starts supporting object definitions in the form `{  hlt, traits, test }` - look for `traits` and detrmine the minimal code to invloke `cv[]()`; pass `cv[].traits` as argument to `cv[]()`
							//	const validator = validators[item.key];
							//	if (item.config) result.push(`if(!cv[${JSON.stringify(item.key)}](${jsonPathCode}, ${JSON.stringify(item.config)}, null, ${JSON.stringify(item.key)}, cb)) ${buildBreakStatement(true, SchemaObsolete.MessageId_matchFailed, item.key, item.config)}`);
							//	else result.push(`if(!cv[${JSON.stringify(item.key)}](${jsonPathCode}, null, null, ${JSON.stringify(item.key)}, cb)) ${buildBreakStatement(true, SchemaObsolete.MessageId_matchFailed, item.key)}`);

							if (item.config) result.push(`if(!cv[${JSON.stringify(item.key)}](${jsonPathCode}, ${JSON.stringify(item.config)})) ${buildBreakStatement(true, SchemaObsolete.MessageId_matchFailed, item.key, item.config)}`);
							else result.push(`if(!cv[${JSON.stringify(item.key)}](${jsonPathCode})) ${buildBreakStatement(true, SchemaObsolete.MessageId_matchFailed, item.key)}`);
						}
					}
					break;
				default: throw `Not implemented.`;
			}
		});

		if (createSerializer) serializer.end();
		else result.push("r[0]=true;return ri;");
		result.push("}while(false);r[0]=false;return ri;");
		return result.join("");

		function getJsonPathCode(root, jsonPath, startIndex)
		{
			const sb = [root];
			for (let length = jsonPath.length, i = startIndex; i < length; ++i) sb.push(`[${JSON.stringify(jsonPath[i])}]`);
			return sb.join("");
		}
	}

	//	Field: A shorthand for the `any` directive.
	static any = "any";
	//	Field: A shorthand for a non-specific `array` directive.
	static array = "array";
	//	Field: A shorthand for the `boolean` directive.
	static boolean = "boolean";
	//	Field: A shorthand for the `NU` directive.
	static NU = "NU";
	//	Field: A shorthand for the `null` directive.
	static null = "null";
	//	Field: A shorthand for the `number` directive.
	static number = "number";
	//	Field: A shorthand for a non-specific `object` directive.
	static object = "object";
	//	Field: A shorthand for a non-specific `objex` directive.
	static objex = "objex";
	//	Field: A shorthand for the `string` directive.
	static string = "string";
	//	Field: A shorthand for a non-specific `struct` directive.
	static struct = "struct";
	//	Field: A shorthand for a non-specific `strux` directive.
	static strux = "strux";
	//	Field: A shorthand for the `void` directive.
	static void = "void";

	//	Field: Classifies a schema definition as an object.
	static Object = Symbol("Object");
	//	Field: Classifies a schema definition as a string.
	static String = Symbol("String");
	//	Field: Classifies a schema definition as a number.
	static Number = Symbol("Number");
	//	Field: Classifies a schema definition as a boolean.
	static Boolean = Symbol("Boolean");
	//	Field: Classifies a schema definition as Null or Undefined.
	static NullOrUndefined = Symbol("NullOrUndefined");
	//	Field: Classifies a schema definition as a null.
	static Null = Symbol("Null");
	//	Field: Classifies a schema definition as an undefined.
	static Void = Symbol("Void");
	//	Field: Classifies a schema definition as an array.
	static Array = Symbol("Array");
	//	Field: Classifies a schema definition as a single value.
	static Value = Symbol("Value");
	//	Field: Classifies a schema definition as a non-specific type.
	static Any = Symbol("Any");

	static Structural_AltList = Symbol("Structural_AltList");
	static Structural_AltListEnd = Symbol("Structural_AltListEnd");
	static Structural_Alt = Symbol("Structural_Alt");
	static Structural_AltEnd = Symbol("Structural_AltEnd");
	static Structural_Object = Symbol("Structural_Object");
	static Structural_ObjectProperty = Symbol("Structural_ObjectProperty");
	static Structural_ObjectPropertyEnd = Symbol("Structural_ObjectPropertyEnd");
	static Structural_ObjectEnd = Symbol("Structural_ObjectEnd");
	static Structural_Array = Symbol("Structural_Array");
	static Structural_ArrayEnd = Symbol("Structural_ArrayEnd");
	static Structural_Number = Symbol("Structural_Number");
	static Structural_String = Symbol("Structural_String");
	static Structural_Boolean = Symbol("Structural_Boolean");
	static Structural_NU = Symbol("Structural_NU");
	static Structural_Null = Symbol("Structural_Null");
	static Structural_Void = Symbol("Structural_Void");
	static Structural_Any = Symbol("Structural_Any");
	static Structural_Value = Symbol("Structural_Value");
	static Structural_CustomMatch = Symbol("Structural_CustomMatch");

	static MessageId_noAltMatch = 1;	//	`"No valid alternative was matched."`
	static MessageId_objectExpected = 2;	//	`"Object expected."`
	static MessageId_structExpected = 3;	//	`"Any object expected, except for String, Number, Boolean and Array."`
	static MessageId_unexpectedProperty = 4;	//	`"Unexpected property."`, explain items with this message id will indicate the name of the unexpected property in `.propertyName`
	static MessageId_arrayExpected = 5;	//	`"Array expected."`
	static MessageId_numberExpected = 6;	//	`"Number expected."`
	static MessageId_stringExpected = 7;	//	`"String expected."`
	static MessageId_booleanExpected = 8;	//	`"Boolean expected."`
	static MessageId_nullExpected = 9;	//	`"Null expected."`
	static MessageId_voidExpected = 10;	//	`"Undefined expected."`
	static MessageId_invalidValue = 11;	//	`"Invalid value."`, explain items with this message id will indicate the expected value in `.expectedValue`
	static MessageId_matchFailed = 12;	//	`"Custom validation failed."`, explain items with this message id will indicate the name of the failing custom validation function in `.validatorName`and the match configuration object if such is present in the schema in `.validatorConfig`
	static MessageId_NUExpected = 13;	//	`"NU expected."`
}

function _Schema_validateTypeDefList(typeDefList, validators)
{
	if (PB_DEBUG)
	{
		if (!Type.isArray(typeDefList)) throw new Exception(0x9B7470, `Argument is invalid: "typeDefList".`);
		if (!Type.isObject(validators)) throw new Exception(0xBCC20A, `Argument is invalid: "validators".`);
	}

	const jsonSet = new Set();

	for (let length = typeDefList.length, i = 0; i < length; ++i)
	{
		const item = typeDefList[i];
		if (item.match) for (let jlength = item.match.length, j = 0; j < jlength; ++j) if (!validators[item.match[j].key]) throw new Exception(0xB8B0CF, `Unrecognized validator key "${item.match[j].key}" at "${item.path}".`);
		const json = JSON.stringify(item, (k, v) =>
		{
			const t = Type.getType(v);
			if (t === Type.Symbol) return v.description;
			if (t === Type.Undefined) return "undefined";
			return v;
		});
		if (jsonSet.has(json)) throw new Exception(0x9A2D9C, `Duplicate type definition at "${item.path}": ${json}.`);
		jsonSet.add(json);
		switch (item.type)
		{
			case SchemaObsolete.Object:
				if (item.properties) for (let jlength = item.properties.length, j = 0; j < jlength; ++j) _Schema_validateTypeDefList(item.properties[j].alternatives, validators);
				break;
			case SchemaObsolete.Array:
				if (item.elementAlternatives) _Schema_validateTypeDefList(item.elementAlternatives, validators);
				break;
			case SchemaObsolete.Atom:
			case SchemaObsolete.Number:
			case SchemaObsolete.String:
			case SchemaObsolete.Boolean:
			case SchemaObsolete.NullOrUndefined:
			case SchemaObsolete.Null:
			case SchemaObsolete.Void:
			case SchemaObsolete.Any:
				break;
			default: throw new Exception(0x7F0555, `Not implemented.`);
		}
	}
}

//	Usage:
//
//	types
//	-----------------------------
//	- [{<type defs>}] || { alt: [{<type defs>}] } - lists alternative schemas
//	- {<property defs>} - (direct object definition) - an object (constructor === Object) with strict list of adimissible properties; <property defs> must have at least one property and may not have as a property any
//		of the reseved property names: also, alt, any, array, boolean, is, null, hint, match, number, object, objex, string, typedef, void
//		- <property def> - "<property name>": "" || 0 || true || [<type defs>] || { alt || any || array || boolean || null || number || object || objex || string || struct || strux || void, also, hint, match }
//	- { object: 1 || {} || {<property defs>} || also, match, hint } - an object (constructor === Object) with strict list of adimissible properties; { object: 1 } and { object: {} } define a strictly empty object
//	- {}, { objex: {<property defs>}, also, match, hint } - a EXtendable (non-strict) object (constructor === Object) definition; any property that is non-present in the objex definition is accepted but not validated
//	- { struct: 1 || {} || {<property defs>} || also, match, hint } - an object (any constructor, except for String, Number, Boolean, Array) with strict list of adimissible properties; { struct: 1 } and { struct: {} } define a strictly empty object (any constructor, except for String, Number, Boolean, Array)
//	- { strux: {<property defs>}, also, match, hint } - a EXtendable (non-strict) an object (any constructor, except for String, Number, Boolean, Array) definition; any property that is non-present in the strux definition is accepted but not validated
//	- "" || { string: 1, also, match, hint } - a string
//	- 0 || { number: 1, also, match, hint} - a number
//	- true || { boolean: 1, also, match, hint } - a boolean
//	- null || { null: 1, also, match, hint } - null - matches only if the tested value is null
//	- { void: 1, also, match, hint } - undefined - matches only if the tested value is undefined
//	- { match } || { match, hint } || { any: 1, match, hint } - type is not validated; any custom matches are performed on the value
//	- { any: 1, alt || array || boolean || null || number || object || objex || string || struct || strux || void, also, match, hint } - any value is validated successfully (other directives are ignored, except for match)
//	- { array: 1 || { array: 1 } || [<element type defs>], also, match, hint } - an array
//		- <element type defs>: [0, ""] - accepts mixed number and string elements
//		- <element type defs>: [{number: 1, string: 1}] - accepts mixed number and string elements - element type def alternatives are considered to by type defs accepted by the array
//	- { is: <sigle value of a built-in type> || [<sigle value of a built-in type>], hint } - same as `also` (see below) but can be combined only with `hint`
//	- { typedef } - the value of the typedef property is used as a type def instead of the encapuslating object; all other properties of the encapuslating object are ignored; allows for referencing schema models directly from type defs (e.g. `model1 = schema.model({myproperty: 0}); model2 = schema.model({anotherporperty: model1});`)
//
//	modifiers
//	-----------------------------
//	also || is: <sigle value of a built-in type> || [<sigle value of a built-in type>] - additionally validates all listed values regardless of their type
//	match (match def) - "<validator full name>" || ["<validator full name>"] || { "<validator full name>": 1 || { <validator config> }, ... } - all listed validators must succeed othrwise property validation will fail
//		validator function: (value, config) => boolean && (SchemaObsolete.Doc) => { title, description }
//	hint: "" - human-readable description of the type; for error reporting and automated documentation generation.
//
//	NOTE: match does not apply to values from also/is; combining match only with also/is causes an error.
//
//	optional properties
//	-----------------------------
//	{ ..., also: void 0 } || { ..., also: [void 0, null] }
//	{ ..., void: 1 } || { ..., void: 1, null: 1 }
//
//	multiple types
//	-----------------------------
//	- single property - { string: 1, number: 1 }
//	- in an array - [ "", { number: 1 } ], [ { string: 1, number: 1 } ]
//
//	referencing models
//	-----------------------------
//	const schema = new Schema();
//	const address_model = schema.model({ city: "", street: "", zip: "" });
//	const person_model = schema.model({ work_address: address_model, home_address: address_model });
//
//	NOTE: there is no requirement for referenced models to belong to a particular schema; any custom validators used by a referenced model, though, must be registered with the schema modelling
//		the referencing type def.

//	sample
//	-----------------------------
//	const SchemaObsolete = require(`-/pb/natalis/070/SchemaObsolete.js`);
//
//	const schema = new SchemaObsolete(
//	{
//		integer: (value) => true,
//		length: (value) => true,
//		uri: (value) => true,
//		positive: (value) => true,
//		length: (value) => true,
//		email: (value) => true,
//		phone:
//		{
//			stationary: (value) => true,
//			mobile: (value) => true,
//			international: (value, config) => true,
//		},
//		address: (value, config) => true,
//	});
//	const person_model = schema.model(
//	{
//		object:
//		{
//			title: { string: 1, NU: 1 },					//	optional string
//			firstName: "",									//	required string
//			middleName: { string: 1, void: 1, null: 1 },	//	optional string
//			lastName: { string: 1, also: [void 0, null] },	//	optional string
//			title: { also: [ "Mr", "Mrs", "Ms", void 0 ] },	//	optional enum
//			age: { number: 1, match: { integer: 1 } },		//	required integer
//			weight: { number: 1, match: "positive", also: [null, -1] }		//	required positive number or null or -1
//			address:										//	required object matching the address validator ({ locale: "BG" })
//			{
//				object:
//				{
//					city: { string: 1, also: null },		//	required string or null
//					zip: 0,
//				},
//				match: { address: { locale: "BG" } },
//			},
//			nicks: { array: [""] },										//	required array of strings
//			emails: { array: [ { string: 1, match: { email: 1 } } ] },	//	required string matching the email validator
//			blog: { array: [ { string: 1, match: { uri: 1 } } ] },		//	required string matching the uri validator
//			phoneNumbers: [ { string: 1, match: { "phone.stationary": 1, "phone.mobile": 1 } }, { string: 1, match: { "phone.international": { locale: ["BG", "TR"] } } } ],
//			favouriteNumbers: { array: [0], match: { length: "[0, 3]" } },
//			applesAndOranges: { string: 1, number: 1 },					//	required string or number
//		}
//	});
//
//	if(!schema.test(obj, person_model)) console.log(schema.explain());
//	const json = schema.serialize({}, person_model);
//	const obj = schema.deserialize(json, person_model);
//
//	const { SchemaObsolete, any, array, boolean, NU, number, object, objex, string, struct, strux } = require(`-/pb/natalis/070/SchemaObsolete.js`);
//	const schema = new SchemaObsolete();
//	const shorthands_model = schema.model(
//	{
//		first_name: { null: 1, void: 1, string },
//		last_name: { NU, string },
//		value: any,
//		collection1: array,
//		collection2: { array },
//		collection3: { array: [ void, null, 0] },
//		objORarr: [{}, array],
//	}, 0x8A2F54);	//	`0x8A2F54` is a pin that is used both as a cache key and as a model name in diagnostics

module.exports.SchemaObsolete = module.exports;