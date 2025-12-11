//	R0Q2/daniel/20210525
"use strict";

const Runtime = require("-/pb/natalis/000/Runtime.js");

const { Type, CallableType, LiteralType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException } = require("-/pb/natalis/003/Exception.js");
const Enum = require("-/pb/natalis/011/Enum.js");

let _temp;

module.exports =

class PerformanceProfile_PrimordialBlocks
{
	static probe_GetValue_PrimordialBlocks_Enum(experimentCount)
	{
		const E = Enum("E", { EnumField: Symbol() })
		let a;

		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = E.EnumField;
		const end = new Date().getTime();

		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_FunctionInlighning_PB_DEBUG_Overhead(experimentCount)
	{
		function f1(a)
		{
			return a === 0 ? a : a - 1;
		}

		function f2(a)
		{
			if (PB_DEBUG)
			{
				if (Type.isNU(a)) throw new ArgumentException(0x0, "a", a);
			}
			return a === 0 ? a : a - 1;
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f1(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f2(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionInlighning_PB_DEBUG_multiline_Overhead(experimentCount)
	{
		function f1(a)
		{
			return a === 0 ? a : a - 1;
		}

		function f2(a)
		{
			if (PB_DEBUG)
			{
				if (Type.isNU(a)) throw new ArgumentException(0x0, "a", a);
				if (Type.isSymbol(a)) throw new ArgumentException(0x0, "a", a);
				if (Type.isString(a)) throw new ArgumentException(0x0, "a", a);
			}
			return a === 0 ? a : a - 1;
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f1(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f2(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionInlighning_PB_DEBUG_multiline_SwitchCase_Overhead(experimentCount)
	{
		function f1(a)
		{
			return a === 0 ? a : a - 1;
		}

		function f2(a)
		{
			if (PB_DEBUG)
			{
				if (Type.isNU(a)) throw new ArgumentException(0x0, "a", a);
				if (Type.isSymbol(a)) throw new ArgumentException(0x0, "a", a);
				if (Type.isString(a)) throw new ArgumentException(0x0, "a", a);
			}
			switch (a)
			{
				case 0: return 2;
				case 1: return 3;
				case 3: return 4;
				default: return a === 0 ? a : a - 1;
			}
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f1(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f2(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionInlighning_TypeReferenceFromArg_RegularVsPrecompiledFunction(experimentCount)
	{
		const template =
		{
			isUndefined: Type.isUndefined,
			isNull: Type.isNull,
			isBoolean: Type.isBoolean,
			isNumber: Type.isNumber,
			isString: Type.isString,
			isArray: Type.isArray,
			isObject: Type.isObject,
		};

		function exf(template, v)
		{
			template.isUndefined(v);
			template.isNull(v);
			template.isBoolean(v);
			template.isNumber(v);
			template.isString(v);
			template.isArray(v);
			template.isObject(v);
		}

		const pcf = new Function("template", "v", `
			template.isUndefined(v);
			template.isNull(v);
			template.isBoolean(v);
			template.isNumber(v);
			template.isString(v);
			template.isArray(v);
			template.isObject(v);
		`);

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) exf(template, i);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) pcf(template, i);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		return ms - stdms;
	}
}

_temp;

module.exports.PerformanceProfile = module.exports;
