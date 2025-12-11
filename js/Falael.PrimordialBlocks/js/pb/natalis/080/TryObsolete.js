//	R0Q3?/daniel/20210826
//		- DOC
//		- TEST: Test.argument()
"use strict";

const { Type, CallableType }  = require("-/pb/natalis/000/Native.js");
const { ArgumentException, ReturnValueException } = require("-/pb/natalis/003/Exception.js");
const MulticastDelegate = require("-/pb/natalis/012/MulticastDelegate.js");
const SchemaObsolete = require("-/pb/natalis/070/SchemaObsolete.js");

const _schema = new SchemaObsolete(
{
	"function": v => CallableType.isFunction(v),
	"functionNU": v => Type.isNU(v) || CallableType.isFunction(v),
	"asyncFunction": v => CallableType.isAsyncFunction(v),
	"asyncFunctionNU": v => Type.isNU(v) || CallableType.isAsyncFunction(v),
	"functionPrimitive": v => Type.isCallable(v),
	"functionPrimitiveNU": v => Type.isNU(v) || Type.isCallable(v),
	"integer": v => Type.isInteger(v),
	"date": v => Type.isDate(v),
	"dateNU": v => Type.isNU(v) || Type.isDate(v),
	"symbol": v => Type.isSymbol(v),
	"symbolNU": v => Type.isNU(v) || Type.isSymbol(v),
	"multicastDelegate": (v) => MulticastDelegate.isMulticastDelegate(v),
	"multicastDelegateNU": (v) => Type.isNU(v) || MulticastDelegate.isMulticastDelegate(v),
	"instanceof": (v, c) => !Type.isNU(v) && c.constructor === String ? v.constructor === c : v instanceof c,
	"instanceofNU": (v, c) => Type.isNU(v) || c.constructor === String ? v.constructor === c : v instanceof c,
});

module.exports =

//	Class: A collection of functions for validation of data.
//	Remarks:
class TryObsolete
{
	//	Field: A shorthand for the `any` directive.
	static any = SchemaObsolete.any;
	//	Field: A shorthand for a non-specific `array` directive.
	static array = SchemaObsolete.array;
	//	Field: A shorthand for the `boolean` directive.
	static boolean = SchemaObsolete.boolean;
	//	Field: A shorthand for the `NU` directive.
	static NU = SchemaObsolete.NU;
	//	Field: A shorthand for the `null` directive.
	static null = SchemaObsolete.null;
	//	Field: A shorthand for the `number` directive.
	static number = SchemaObsolete.number;
	//	Field: A shorthand for the `string` directive.
	static string = SchemaObsolete.string;
	//	Field: A shorthand for a non-specific `object` directive.
	static object = SchemaObsolete.object;
	//	Field: A shorthand for a non-specific `objex` directive.
	static objex = SchemaObsolete.objex;
	//	Field: A shorthand for a non-specific `struct` directive.
	static struct = SchemaObsolete.struct;
	//	Field: A shorthand for a non-specific `strux` directive.
	static strux = SchemaObsolete.strux;
	//	Field: A shorthand for the `void` directive.
	static void = SchemaObsolete.void;

	static argument(pin, name, value, def)
	{
		const model = _schema.model(def, pin);
		try
		{
			_schema.try(pin, name, value, model);
		}
		catch (ex)
		{
			throw new ArgumentException(pin, name, value, `; explanation: ${JSON.stringify(_schema.explain())}.`, ex);
		}
	}

	static value(pin, callbackName, value, def)
	{
		const model = _schema.model(def, pin);
		try
		{
			_schema.try(pin, callbackName, value, model);
		}
		catch (ex)
		{
			throw new ReturnValueException(pin, callbackName, value, `; explanation: ${JSON.stringify(_schema.explain())}.`, ex);
		}
	}
}

module.exports.TryObsolete = module.exports;