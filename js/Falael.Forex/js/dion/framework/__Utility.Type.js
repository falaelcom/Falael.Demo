"use strict";

//	based on the following pages
//	http://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
//	http://studiokoi.com/blog/article/typechecking_arrays_in_javascript
//	all test functions use strong typing, e.g. isNumber("1") == false , while isNumber(1) == true

function isUndefined(o)
{
	return o === void (0);
}

function isNU(o)
{
	return o === null || o === void (0);
}

function isString(o)
{
	if (isNU(o))
	{
		return false;
	}
	return (typeof o === "string" || (typeof o === "object" && o.constructor === String));
}

function isFixedString(o, charCount)
{
	if (!isString(o))
	{
		return false;
	}
	if (!charCount)
	{
		charCount = 0;
	}
	return o.length == charCount;
}

function isNumber(o)
{
	if (isNU(o))
	{
		return false;
	}
	return (typeof o === "number" || (typeof o === "object" && o.constructor === Number)) && !isNaN(o) && isFinite(o);
}

function isBoolean(o)
{
	if (isNU(o))
	{
		return false;
	}
	return typeof o === "boolean" || (typeof o === "object" && o.constructor === Boolean);
}

function isObject(o)
{
	if (isNU(o))
	{
		return false;
	}
	if (isArray(o))
	{
		return false;
	}
	if (isDate(o))
	{
		return false;
	}
	return typeof o === "object" && o.constructor !== Boolean && o.constructor !== String && o.constructor !== Number;
}

function isJson(o)
{
	if (isUndefined(o))
	{
		return false;
	}
	if (isNU(o))
	{
		return true;
	}
	if (isArray(o))
	{
		return true;
	}
	if (isDate(o))
	{
		return false;
	}
	return typeof o === "object" && o.constructor !== Boolean && o.constructor !== String && o.constructor !== Number;
}

function isInteger(o)
{
	return (parseInt(o) === o) && isFinite(o);
}

function isArray(o)
{
	return Object.prototype.toString.apply(o) === '[object Array]';
}

function isFunction(o)
{
	return Object.prototype.toString.apply(o) === '[object Function]';
}

function isDate(o)
{
	return Object.prototype.toString.apply(o) === '[object Date]';
}

function getType(o)
{
	if (o === null)
	{
		return "null";
	}
	else if (isUndefined(o))
	{
		return "undefined";
	}
	else if (isString(o))
	{
		return "string";
	}
	else if (isNumber(o))
	{
		return "number";
	}
	else if (isBoolean(o))
	{
		return "boolean";
	}
	else if (isArray(o))
	{
		return "array";
	}
	else if (isObject(o))
	{
		return "object";
	}
	else if (isFunction(o))
	{
		return "function";
	}
	else if (isDate(o))
	{
		return "date";
	}
	else
	{
		return typeof o;
	}
}

function getClass(o)
{
	if (o === null)
	{
		return "null";
	}
	else if (isUndefined(o))
	{
		return "undefined";
	}
	else if (isString(o))
	{
		return "string";
	}
	else if (isNumber(o))
	{
		return "number";
	}
	else if (isBoolean(o))
	{
		return "boolean";
	}
	else if (isArray(o))
	{
		return "array";
	}
	else if (isObject(o))
	{
		if (o.constructor)
		{
			if (o.constructor.name == "Object") return "object";
			return o.constructor.name;
		}
		return "object";
	}
	else if (isFunction(o))
	{
		return "function";
	}
	else if (isDate(o))
	{
		return "date";
	}
	else
	{
		return typeof o;
	}
}

//  !!! no unit tests
function getPropertiesCount(o)
{
	var count = 0;
	for (var jey in o)
	{
		if (!o.hasOwnProperty(jey))
		{
			continue;
		}
		count++;
	}
	return count;
}

function __unitTest()
{
	var result = [];
	function assertTrue(method, name, value)
	{
		if (value)
		{
			result.push("OK Utility.Type." + method + ": " + name);
		}
		else
		{
			result.push("FAIL Utility.Type." + method + ": " + name);
		}
	};

	function assertFalse(method, name, value)
	{
		assertTrue(method + " NOT", name, !value);
	};

	var date = new Date();

	//<editor-fold desc="isUndefined">
	var func = function () { };
	var ux, uy = {}, uz = {}, ut = { a: 1 };
	//delete uz;
	delete ut.a;
	assertTrue("isUndefined", "undefined", isUndefined(undefined));
	assertTrue("isUndefined", "Undefined variable", isUndefined(ux));
	assertTrue("isUndefined", "Undefined property", isUndefined(uy.z));
	assertTrue("isUndefined", "Deleted property", isUndefined(ut.a));
	assertTrue("isUndefined", "No params", isUndefined());
	assertFalse("isUndefined", "func", isUndefined(func));
	assertFalse("isUndefined", "arguments", isUndefined(arguments));
	//assertFalse("isUndefined", "Deleted variable", isUndefined(uz));
	assertFalse("isUndefined", "null", isUndefined(null));
	assertFalse("isUndefined", "0", isUndefined(0));
	assertFalse("isUndefined", "1", isUndefined(1));
	assertFalse("isUndefined", "1.1", isUndefined(1.1));
	assertFalse("isUndefined", "''", isUndefined(''));
	assertFalse("isUndefined", "'1'", isUndefined('1'));
	assertFalse("isUndefined", "{}", isUndefined({}));
	assertFalse("isUndefined", "[]", isUndefined([]));
	assertFalse("isUndefined", "NaN", isUndefined(NaN));
	assertFalse("isUndefined", "Infinity", isUndefined(Infinity));
	assertFalse("isUndefined", "true", isUndefined(true));
	assertFalse("isUndefined", "false", isUndefined(false));
	assertFalse("isUndefined", "date", isUndefined(date));
	//</editor-fold>

	//<editor-fold desc="isNU">
	assertTrue("isNU", "undefined", isNU(undefined));
	assertTrue("isNU", "Undefined variable", isNU(ux));
	assertTrue("isNU", "Undefined property", isNU(uy.z));
	assertTrue("isNU", "Deleted property", isNU(ut.a));
	assertTrue("isNU", "No params", isNU());
	assertTrue("isNU", "null", isNU(null));
	assertFalse("isNU", "func", isNU(func));
	assertFalse("isNU", "arguments", isNU(arguments));
	assertFalse("isNU", "Deleted variable", isNU(uz));
	assertFalse("isNU", "0", isNU(0));
	assertFalse("isNU", "1", isNU(1));
	assertFalse("isNU", "1.1", isNU(1.1));
	assertFalse("isNU", "''", isNU(''));
	assertFalse("isNU", "'1'", isNU('1'));
	assertFalse("isNU", "{}", isNU({}));
	assertFalse("isNU", "[]", isNU([]));
	assertFalse("isNU", "NaN", isNU(NaN));
	assertFalse("isNU", "Infinity", isNU(Infinity));
	assertFalse("isNU", "true", isNU(true));
	assertFalse("isNU", "false", isNU(false));
	assertFalse("isNU", "date", isNU(date));
	//</editor-fold>

	//<editor-fold desc="isString">
	assertTrue("isString", "''", isString(''));
	assertTrue("isString", "'1'", isString('1'));
	assertTrue("isString", "new String('')", isString(new String('')));
	assertTrue("isString", "new String('1')", isString(new String('1')));
	assertFalse("isString", "func", isString(func));
	assertFalse("isString", "arguments", isString(arguments));
	assertFalse("isString", "undefined", isString(undefined));
	assertFalse("isString", "No params", isString());
	assertFalse("isString", "null", isString(null));
	assertFalse("isString", "1", isString(1));
	assertFalse("isString", "1.1", isString(1.1));
	assertFalse("isString", "{}", isString({}));
	assertFalse("isString", "[]", isString([]));
	assertFalse("isString", "NaN", isString(NaN));
	assertFalse("isString", "Infinity", isString(Infinity));
	assertFalse("isString", "true", isString(true));
	assertFalse("isString", "false", isString(false));
	assertFalse("isString", "date", isString(date));
	//</editor-fold>

	//<editor-fold desc="isFixedString">
	assertTrue("isFixedString", "'1', 1", isFixedString('1', 1));
	assertTrue("isFixedString", "''", isFixedString(''));
	assertTrue("isFixedString", "'', 0", isFixedString('', 0));
	assertFalse("isFixedString", "func", isFixedString(func));
	assertFalse("isFixedString", "arguments", isFixedString(arguments));
	assertFalse("isFixedString", "'', 1", isFixedString('', 1));
	assertFalse("isFixedString", "'11', 1", isFixedString('11', 1));
	//</editor-fold>

	//<editor-fold desc="isNumber">
	assertTrue("isNumber", "0", isNumber(0));
	assertTrue("isNumber", "1", isNumber(1));
	assertTrue("isNumber", "-1", isNumber(-1));
	assertTrue("isNumber", "1.1", isNumber(1.1));
	assertTrue("isNumber", "-1.1", isNumber(-1.1));
	assertTrue("isNumber", "Number()", isNumber(Number()));
	assertTrue("isNumber", "Number(0)", isNumber(Number("0")));
	assertTrue("isNumber", "Number(1)", isNumber(Number(1)));
	assertTrue("isNumber", "Number(-1)", isNumber(Number(-1)));
	assertTrue("isNumber", "Number(1.1)", isNumber(Number(1.1)));
	assertTrue("isNumber", "Number(-1.1)", isNumber(Number(-1.1)));
	assertFalse("isNumber", "func", isNumber(func));
	assertFalse("isNumber", "arguments", isNumber(arguments));
	assertFalse("isNumber", "''", isNumber(''));
	assertFalse("isNumber", "'1'", isNumber('1'));
	assertFalse("isNumber", "undefined", isNumber(undefined));
	assertFalse("isNumber", "No params", isNumber());
	assertFalse("isNumber", "null", isNumber(null));
	assertFalse("isNumber", "{}", isNumber({}));
	assertFalse("isNumber", "[]", isNumber([]));
	assertFalse("isNumber", "NaN", isNumber(NaN));
	assertFalse("isNumber", "Infinity", isNumber(Infinity));
	assertFalse("isNumber", "true", isNumber(true));
	assertFalse("isNumber", "false", isNumber(false));
	assertFalse("isNumber", "date", isNumber(date));
	//</editor-fold>

	//<editor-fold desc="isBoolean">
	assertTrue("isBoolean", "true", isBoolean(true));
	assertTrue("isBoolean", "false", isBoolean(false));
	assertTrue("isBoolean", "Boolean()", isBoolean(Boolean()));
	assertTrue("isBoolean", "Boolean(true)", isBoolean(Boolean(true)));
	assertTrue("isBoolean", "Boolean(false)", isBoolean(Boolean(false)));
	assertFalse("isBoolean", "func", isBoolean(func));
	assertFalse("isBoolean", "arguments", isBoolean(arguments));
	assertFalse("isBoolean", "0", isBoolean(0));
	assertFalse("isBoolean", "1", isBoolean(1));
	assertFalse("isBoolean", "1.1", isBoolean(1.1));
	assertFalse("isBoolean", "''", isBoolean(''));
	assertFalse("isBoolean", "'1'", isBoolean('1'));
	assertFalse("isBoolean", "undefined", isBoolean(undefined));
	assertFalse("isBoolean", "No params", isBoolean());
	assertFalse("isBoolean", "null", isBoolean(null));
	assertFalse("isBoolean", "{}", isBoolean({}));
	assertFalse("isBoolean", "[]", isBoolean([]));
	assertFalse("isBoolean", "NaN", isBoolean(NaN));
	assertFalse("isBoolean", "Infinity", isBoolean(Infinity));
	assertFalse("isBoolean", "date", isBoolean(date));
	//</editor-fold>

	//<editor-fold desc="isObject">
	assertTrue("isObject", "{}", isObject({}));
	assertTrue("isObject", "arguments", isObject(arguments));
	assertFalse("isObject", "func", isObject(func));
	assertFalse("isObject", "true", isObject(true));
	assertFalse("isObject", "false", isObject(false));
	assertFalse("isObject", "0", isObject(0));
	assertFalse("isObject", "1", isObject(1));
	assertFalse("isObject", "''", isObject(''));
	assertFalse("isObject", "'1'", isObject('1'));
	assertFalse("isObject", "undefined", isObject(undefined));
	assertFalse("isObject", "No params", isObject());
	assertFalse("isObject", "null", isObject(null));
	assertFalse("isObject", "[]", isObject([]));
	assertFalse("isObject", "NaN", isObject(NaN));
	assertFalse("isObject", "Infinity", isObject(Infinity));
	assertFalse("isObject", "date", isObject(date));
	//</editor-fold>

	//<editor-fold desc="isJson">
	assertTrue("isJson", "{}", isJson({}));
	assertTrue("isJson", "arguments", isJson(arguments));
	assertTrue("isJson", "null", isJson(null));
	assertTrue("isJson", "[]", isJson([]));
	assertFalse("isJson", "func", isJson(func));
	assertFalse("isJson", "true", isJson(true));
	assertFalse("isJson", "false", isJson(false));
	assertFalse("isJson", "0", isJson(0));
	assertFalse("isJson", "1", isJson(1));
	assertFalse("isJson", "''", isJson(''));
	assertFalse("isJson", "'1'", isJson('1'));
	assertFalse("isJson", "undefined", isJson(undefined));
	assertFalse("isJson", "No params", isJson());
	assertFalse("isJson", "NaN", isJson(NaN));
	assertFalse("isJson", "Infinity", isJson(Infinity));
	assertFalse("isJson", "date", isJson(date));
	//</editor-fold>

	//<editor-fold desc="isInteger">
	assertTrue("isInteger", "0", isInteger(0));
	assertTrue("isInteger", "1", isInteger(1));
	assertTrue("isInteger", "-1", isInteger(-1));
	assertTrue("isInteger", "Number()", isInteger(Number()));
	assertTrue("isInteger", "Number(0)", isInteger(Number("0")));
	assertTrue("isInteger", "Number(1)", isInteger(Number(1)));
	assertTrue("isInteger", "Number(-1)", isInteger(Number(-1)));
	assertFalse("isInteger", "Number(1.1)", isInteger(Number(1.1)));
	assertFalse("isInteger", "Number(-1.1)", isInteger(Number(-1.1)));
	assertFalse("isInteger", "func", isInteger(func));
	assertFalse("isInteger", "arguments", isInteger(arguments));
	assertFalse("isInteger", "1.1", isInteger(1.1));
	assertFalse("isInteger", "-1.1", isInteger(-1.1));
	assertFalse("isInteger", "''", isInteger(''));
	assertFalse("isInteger", "'1'", isInteger('1'));
	assertFalse("isInteger", "undefined", isInteger(undefined));
	assertFalse("isInteger", "No params", isInteger());
	assertFalse("isInteger", "null", isInteger(null));
	assertFalse("isInteger", "{}", isInteger({}));
	assertFalse("isInteger", "[]", isInteger([]));
	assertFalse("isInteger", "NaN", isInteger(NaN));
	assertFalse("isInteger", "Infinity", isInteger(Infinity));
	assertFalse("isInteger", "true", isInteger(true));
	assertFalse("isInteger", "false", isInteger(false));
	assertFalse("isInteger", "date", isInteger(date));
	//</editor-fold>

	//<editor-fold desc="isArray">
	assertTrue("isArray", "[]", isArray([]));
	assertFalse("isArray", "func", isArray(func));
	assertFalse("isArray", "arguments", isArray(arguments));
	assertFalse("isArray", "true", isArray(true));
	assertFalse("isArray", "false", isArray(false));
	assertFalse("isArray", "0", isArray(0));
	assertFalse("isArray", "1", isArray(1));
	assertFalse("isArray", "''", isArray(''));
	assertFalse("isArray", "'1'", isArray('1'));
	assertFalse("isArray", "undefined", isArray(undefined));
	assertFalse("isArray", "No params", isArray());
	assertFalse("isArray", "null", isArray(null));
	assertFalse("isArray", "{}", isArray({}));
	assertFalse("isArray", "NaN", isArray(NaN));
	assertFalse("isArray", "Infinity", isArray(Infinity));
	assertFalse("isArray", "date", isArray(date));
	//</editor-fold>

	//<editor-fold desc="isFunction">
	assertTrue("isFunction", "func", isFunction(func));
	assertFalse("isFunction", "{}", isFunction({}));
	assertFalse("isFunction", "arguments", isFunction(arguments));
	assertFalse("isFunction", "true", isFunction(true));
	assertFalse("isFunction", "false", isFunction(false));
	assertFalse("isFunction", "0", isFunction(0));
	assertFalse("isFunction", "1", isFunction(1));
	assertFalse("isFunction", "''", isFunction(''));
	assertFalse("isFunction", "undefined", isFunction(undefined));
	assertFalse("isFunction", "No params", isFunction());
	assertFalse("isFunction", "null", isFunction(null));
	assertFalse("isFunction", "[]", isFunction([]));
	assertFalse("isFunction", "NaN", isFunction(NaN));
	assertFalse("isFunction", "Infinity", isFunction(Infinity));
	assertFalse("isFunction", "date", isFunction(date));
	//</editor-fold>

	//<editor-fold desc="isDate">
	assertTrue("isDate", "date", isDate(date));
	assertFalse("isDate", "func", isDate(func));
	assertFalse("isDate", "{}", isDate({}));
	assertFalse("isDate", "arguments", isDate(arguments));
	assertFalse("isDate", "true", isDate(true));
	assertFalse("isDate", "false", isDate(false));
	assertFalse("isDate", "0", isDate(0));
	assertFalse("isDate", "1", isDate(1));
	assertFalse("isDate", "''", isDate(''));
	assertFalse("isDate", "undefined", isDate(undefined));
	assertFalse("isDate", "No params", isDate());
	assertFalse("isDate", "null", isDate(null));
	assertFalse("isDate", "[]", isDate([]));
	assertFalse("isDate", "NaN", isDate(NaN));
	assertFalse("isDate", "Infinity", isDate(Infinity));
	//</editor-fold>

	//<editor-fold desc="getType">
	assertTrue("getType", "null", getType(null) == "null");
	assertTrue("getType", "undefined", getType(undefined) == "undefined");
	assertTrue("getType", "'1'", getType('') == "string");
	assertTrue("getType", "''", getType('1') == "string");
	assertTrue("getType", "1.5", getType(1.5) == "number");
	assertTrue("getType", "0", getType(0) == "number");
	assertTrue("getType", "true", getType(true) == "boolean");
	assertTrue("getType", "[]", getType([]) == "array");
	assertTrue("getType", "{}", getType({}) == "object");
	assertTrue("getType", "date", getType(date) == "date");
	//</editor-fold>

	//<editor-fold desc="getClass">
	class CTest1
	{
	}
	function CTest2() { }
	assertTrue("getClass", "null", getClass(null) == "null");
	assertTrue("getClass", "undefined", getClass(undefined) == "undefined");
	assertTrue("getClass", "'1'", getClass('') == "string");
	assertTrue("getClass", "''", getClass('1') == "string");
	assertTrue("getClass", "1.5", getClass(1.5) == "number");
	assertTrue("getClass", "0", getClass(0) == "number");
	assertTrue("getClass", "true", getClass(true) == "boolean");
	assertTrue("getClass", "[]", getClass([]) == "array");
	assertTrue("getClass", "{}", getClass({}) == "object");
	assertTrue("getClass", "new CTest1()", getClass(new CTest1()) == "CTest1");
	assertTrue("getClass", "new CTest2()", getClass(new CTest2()) == "CTest2");
	assertTrue("getClass", "date", getClass(date) == "date");
	//</editor-fold>

	return result;
}

module.exports =
{
	isUndefined: isUndefined,
	isNU: isNU,
	isString: isString,
	isFixedString: isFixedString,
	isNumber: isNumber,
	isBoolean: isBoolean,
	isObject: isObject,
	isJson: isJson,
	isInteger: isInteger,
	isArray: isArray,
	isFunction: isFunction,
	getPropertiesCount: getPropertiesCount,
	getType: getType,
	getClass: getClass,
	__unitTest: __unitTest
};

