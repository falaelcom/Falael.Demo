//	R0Q2/daniel/20210525
"use strict";

const Runtime = require("-/pb/natalis/000/Runtime.js");

const { Type } = require("-/pb/natalis/000/Native.js");
const { Feedback } = require("-/pb/natalis/012/Feedback.js");
const { ArgumentException } = require("-/pb/natalis/003/Exception.js");

const PerformanceProfile_PrimordialBlocks = require("-/pb/natalis/PerformanceProfile/PrimordialBlocks.js");

const profilingClasses =
[
	PerformanceProfile_PrimordialBlocks,
];

const closureValue = Symbol();
let _temp;

module.exports =

//	Class: Implements a formal performance testing framework for both JavaScript platform and Primordial Blocks.
class PerformanceProfile
{
	static async run(feedback, preloadedData, standardDurationMs = 1000)
	{
		if (PB_DEBUG)
		{
			if (!(feedback instanceof Feedback)) throw new ArgumentException(0x82D3E0, "feedback", feedback);
			if (!Type.isNU(preloadedData) && !Type.isObject(preloadedData)) throw new ArgumentException(0xDA768C, "preloadedData", preloadedData);
			if (!Type.isInteger(standardDurationMs)) throw new ArgumentException(0xC2F456, "standardDurationMs", standardDurationMs);
		}
		return await Runtime.profile(feedback, profilingClasses.concat(PerformanceProfile), preloadedData, standardDurationMs);
	}

	static probe_EmptyForLoop(experimentCount)
	{
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i);
		const end = new Date().getTime();
		return Runtime.profile.norm(end - begin);
	}

	static probe_TryCatch(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = String(experimentCount);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) try { a = String(experimentCount) } catch (ex) { a = ex };
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TryCatch_FunctionInlining(experimentCount)
	{
		function f1(experimentCount)
		{
			return String(experimentCount);
		}

		function f2(experimentCount)
		{
			try
			{
				return String(experimentCount);
			}
			catch (ex)
			{
				return ex;
			}
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f1(experimentCount);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f2(experimentCount);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestForNull_TrippleEquals(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = false;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (experimentCount === null);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestForNull_DoubleEquals(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = false;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (experimentCount == null);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestForNull_TypeCoercion(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = false;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = !experimentCount;
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestConstructor_FullStatement(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = false;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (experimentCount !== void 0 && experimentCount !== null && experimentCount === i && experimentCount.constructor === Number);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestConstructor_TypeCoercion(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = false;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (experimentCount && experimentCount.constructor === Number);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestConstructor_Typeof(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = false;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (typeof experimentCount === "number");
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_TestConstructor_TypeofCustomClass(experimentCount)
	{
		class LongerClassName { }
		const longerClassName = new LongerClassName();

		let a;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (typeof longerClassName === "LongerClassName");
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_LocalVariableAssignment(experimentCount)
	{
		let a;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = experimentCount;
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_InlinedFunctionCall(experimentCount)
	{
		function f()
		{
			return 1;
		}

		let a;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f();
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_InlinedFunctionCall_SwitchCase_Overhead(experimentCount)
	{
		function f1(a)
		{
			if (a === 5) return a;
			if (a === 10) return a - 10;
			return a - 1;
		}

		function f2(a)
		{
			switch (a)
			{
				case 0: return 2;
				case 1: return 3;
				case 3: return 4;
				default:
					if (a === 5) return a;
					if (a === 10) return a - 10;
					return a - 1;
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

	static probe_InlinedFunctionCall_NestedCalls(experimentCount)
	{
		function f1()
		{
			return 1;
		}

		function f2()
		{
			return f1();
		}

		let a;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f2();
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_InlinedFunctionCall_DefaultParams(experimentCount)
	{
		function f(a = 1)
		{
			return a;
		}

		let a;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f();
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_FunctionInlining_AsArgument(experimentCount)
	{
		let a;

		function ft(z)
		{
			return z + 1;
		}

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = ft(a);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		function f(ff)
		{
			let a;

			const begin2 = new Date().getTime();
			for (let length = experimentCount, i = 0; i < length; ++i) a = ff(a);
			const end2 = new Date().getTime();
			const ms = Runtime.profile.norm(end2 - begin2);

			return ms;
		}
		const ms = f(ft);

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionInlining_TypeIsArray(experimentCount)
	{
		let a, arr = [];

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = Array.isArray(arr); 
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = Type.isArray(arr);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionInlining_TypeIsArray2(experimentCount)
	{
		let a, arr = [];
		const typeIsArray = Type.isArray;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = Array.isArray(arr);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = typeIsArray(arr);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall(experimentCount)
	{
		function fstd(a)
		{
			if (a === 1) return;
			return a + 1;
		}
		function f(a)
		{
			if (a === 1) return;
			return f(a + 1);
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_InstanceMethod(experimentCount)
	{
		let a, obj =
		{
			fstd(a)
			{
				if (a === 1) return;
				return a + 1;
			},
			f(a)
			{
				if (a === 1) return;
				return obj.f(a + 1);
			}
		};

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_ClassInstanceMethod(experimentCount)
	{
		class C
		{
			fstd(a)
			{
				if (a === 1) return;
				return a + 1;
			}
			f(a)
			{
				if (a === 1) return;
				return this.f(a + 1);
			}
		}

		let a, obj = new C();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_ClassInstanceMethod_Inherited(experimentCount)
	{
		class B
		{
			fstd(a)
			{
				if (a === 1) return;
				return a + 1;
			}
			f(a)
			{
				if (a === 1) return;
				return this.f(a + 1);
			}
		}

		class C extends B
		{
		}

		let a, obj = new C();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_ClassInstanceMethod_DoubleInherited(experimentCount)
	{
		class B
		{
			fstd(a)
			{
				if (a === 1) return;
				return a + 1;
			}
			f(a)
			{
				if (a === 1) return;
				return this.f(a + 1);
			}
		}

		class C extends B
		{
		}

		class D extends C
		{
		}

		let a, obj = new D();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_ClassInstanceMethod_Overridden(experimentCount)
	{
		class B
		{
			fstd(a)
			{
			}
			f(a)
			{
			}
		}

		class C extends B
		{
			fstd(a)
			{
				if (a === 1) return;
				return a + 1;
			}
			f(a)
			{
				if (a === 1) return;
				return this.f(a + 1);
			}
		}

		let a, obj = new C();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_StaticMethod(experimentCount)
	{
		let a;
		class C
		{
			static fstd(a)
			{
				if (a === 1) return;
				return a + 1;
			}
			static f(a)
			{
				if (a === 1) return;
				return C.f(a + 1);
			}
		}

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = C.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = C.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_Postset(experimentCount)
	{
		let a;
		class C
		{
		}
		C.fstd = function(a)
		{
			if (a === 1) return;
			return a + 1;
		}
		C.f = function(a)
		{
			if (a === 1) return;
			return C.f(a + 1);
		}

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = C.fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = C.f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2) / 2);	//	half time because the function is called recursively twice

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_arguments(experimentCount)
	{
		function fstd(a)
		{
			if (a === 1) return 0;
			return a;
		}
		function f()
		{
			if (arguments[0] === 1) return 0;
			return a;
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2));

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_RestArgs(experimentCount)
	{
		function fstd(a)
		{
			if (a === 1) return 0;
			return a;
		}
		function f(...args)
		{
			if (args[0] === 1) return 0;
			return a;
		}

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = fstd(0);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f(0);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm((end2 - begin2));

		_temp = a;
		return ms - stdms;
	}

	static probe_FunctionCall_RegularVsPrecompiledFunction(experimentCount)
	{
		let a;

		function exf(v) { return v; }
		const pcf = new Function("v", `return v;`);

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = exf(i);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = pcf(i);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_CreateClosure(experimentCount)
	{
		let a;

		function fstd(a)
		{
			return function () { return 1; };
		}

		function f(a)
		{
			return function () { return a; };
		}

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = fstd(i);
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = f(i);
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_CreateEmptyObject(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = i;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = {};
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_CreateEmptyArray(experimentCount)
	{
		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = i;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = [];
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_CreateEmptyArray_Extended(experimentCount)
	{
		let a;

		class C extends Array { }

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = i;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = new C();
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_CreateEmptyArray_flavoured(experimentCount)
	{
		let a;

		const s = Symbol();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = i;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) { a = []; a.flavour = s; };
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_CreateEmptyArray_flavoured_shortName(experimentCount)
	{
		let a;

		const s = Symbol();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = i;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) { a = []; a.T = s; };
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	//	very slow with larger experiment counts, most likely due to garbage collection
	//	`--profile=1000` produces a seemingly correct value; the time measured with `--profile=2000` jumps drastically
	static probe_CreateEmptyArray_flavoured_firstElementReserved(experimentCount)
	{
		let a;

		const s = Symbol();

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = i;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) { a = new Array(s); };
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_InstanceofString(experimentCount)
	{
		let a;
		const s = "";
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (s instanceof String);
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_InstanceofCustomClass(experimentCount)
	{
		class LongerClassName { }
		const longerClassName = new LongerClassName();

		let a;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (longerClassName instanceof LongerClassName);
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_TestConstructor_InstanceofVsTypeofCustomClass(experimentCount)
	{
		class LongerClassName { }
		const longerClassName = new LongerClassName();

		let a;

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (typeof longerClassName === "LongerClassName");
		const end1 = new Date().getTime();
		const typeofms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (longerClassName instanceof LongerClassName);
		const end2 = new Date().getTime();
		const instanceofms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return instanceofms - typeofms;
	}

	static probe_ConstructorEqualsString(experimentCount)
	{
		let a;
		const s = "";
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (s.constructor === String);
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_ConstructorEqualsString_Full(experimentCount)
	{
		let a;
		const s = "";
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = (s !== null && s !== void 0 && s.constructor === String);
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ObjectProperyDotNotation(experimentCount)
	{
		let a;
		const s = {a: 1, b: 2, cccccccccccccccccccc: 3};
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s.cccccccccccccccccccc;
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ObjectProperyDotNotation(experimentCount)
	{
		const s = { a: 1, b: 2, cccccccccccccccccccc: 3 };
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s.cccccccccccccccccccc = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ObjectProperySquareNotation(experimentCount)
	{
		let a;
		const s = { a: 1, b: 2, cccccccccccccccccccc: 3 };
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s["cccccccccccccccccccc"];
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ObjectProperySquareNotation(experimentCount)
	{
		const s = { a: 1, b: 2, cccccccccccccccccccc: 3 };
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s["cccccccccccccccccccc"] = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ObjectProperySquareNotation_VariableName(experimentCount)
	{
		let a;
		const s = { a: 1, b: 2, cccccccccccccccccccc: 3 }, name = "cccccccccccccccccccc";
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[name];
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ObjectProperySquareNotation_VariableName(experimentCount)
	{
		const s = { a: 1, b: 2, cccccccccccccccccccc: 3 }, name = "cccccccccccccccccccc";
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[name] = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ObjectProperySquareNotation_VariableName_Unpredictable(experimentCount)
	{
		let a;
		const s = { a: 1, b: 2, c: 3 }, names = ["a", "b", "c"];

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = names[i % 3];
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		_temp = a;

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[names[i % 3]];
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_Accessors_Set_ObjectProperySquareNotation_VariableName_Unpredictable(experimentCount)
	{
		let a;
		const s = { a: 1, b: 2, c: 3 }, names = ["a", "b", "c"];

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = names[i % 3];
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		_temp = a;

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[names[i % 3]] = i;
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = s;
		return ms - stdms;
	}

	static probe_Accessors_Get_ObjectPropery_Numeric(experimentCount)
	{
		let a;
		const s = { a: 1, b: 2, [1]: 3 };
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[1];
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ObjectPropery_Numeric(experimentCount)
	{
		const s = { a: 1, b: 2, [1]: 3 };
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[1] = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ObjectPropery_Numeric_Unpredictable(experimentCount)
	{
		let a;
		const s = { [1]: 1, [2]: 2, [1000000000]: 3 }, names = [1, 2, 1000000000];

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = names[i % 3];
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		_temp = a;

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[names[i % 3]];
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_Accessors_Set_ObjectPropery_Numeric_Unpredictable(experimentCount)
	{
		let a;
		const s = { [1]: 1, [2]: 2, [1000000000]: 3 }, names = [1, 2, 1000000000];

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = names[i % 3];
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		_temp = a;

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[names[i % 3]] = i;
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = s;
		return ms - stdms;
	}

	static probe_Accessors_Get_ArrayIndex(experimentCount)
	{
		let a;
		const s = [1, 2, 3];
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[2];
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ArrayIndex(experimentCount)
	{
		const s = [1, 2, 3];
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[2] = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ArrayIndex_Sparse(experimentCount)
	{
		let a;
		const s = [1, 2, 3];
		s[1000000000] = 4;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[1000000000];
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ArrayIndex_Sparse(experimentCount)
	{
		const s = [1, 2, 3];
		s[1000000000] = 4;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[1000000000] = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Get_ArrayIndex_DoubleSparse(experimentCount)
	{
		let a;
		const s = [1, 2, 3];
		s[100000000] = 4;
		s[1000000000] = 5;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = s[1000000000];
		const end = new Date().getTime();
		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Set_ArrayIndex_DoubleSparse(experimentCount)
	{
		const s = [1, 2, 3];
		s[100000000] = 4;
		s[1000000000] = 5;
		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) s[1000000000] = i;
		const end = new Date().getTime();
		_temp = s;
		return Runtime.profile.norm(end - begin);
	}

	static probe_Accessors_Array_Push1000x(experimentCount)
	{
		const pushCount = 1000;
		const stepCount = Math.ceil(experimentCount / pushCount);
		const pushCountResidual = experimentCount - stepCount * pushCount;

		let arr;
		let ms = 0;
		for (let s = 0; s < stepCount; ++s)
		{
			arr = [];
			const begin = new Date().getTime();
			for (let length = pushCount, i = 0; i < length; ++i) arr.push(i);
			const end = new Date().getTime();
			ms += end - begin;
		}
		if (pushCountResidual)
		{
			arr = [];
			const begin = new Date().getTime();
			for (let length = pushCountResidual, i = 0; i < length; ++i) arr.push(i);
			const end = new Date().getTime();
			ms += end - begin;
		}

		_temp = arr;
		return Runtime.profile.norm(ms);
	}

	static probe_IsArrayVsLengthTest(experimentCount)
	{
		let a, arr = [];

		const begin1 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = arr.length !== void 0;
		const end1 = new Date().getTime();
		const stdms = Runtime.profile.norm(end1 - begin1);

		const begin2 = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = Array.isArray(arr); 
		const end2 = new Date().getTime();
		const ms = Runtime.profile.norm(end2 - begin2);

		_temp = a;
		return ms - stdms;
	}

	static probe_GetValue_Closure(experimentCount)
	{
		let a;

		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = closureValue;
		const end = new Date().getTime();

		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_GetValue_DataMember(experimentCount)
	{
		let a, obj = { DataMember: Symbol() };

		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = obj.DataMember;
		const end = new Date().getTime();

		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_GetValue_StaticField(experimentCount)
	{
		class C { static StaticField = Symbol() }
		let a;

		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = C.StaticField;
		const end = new Date().getTime();

		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_GetValue_ClassAsObject_Field(experimentCount)
	{
		class C { }
		C.Field = Symbol()
		let a;

		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = C.Field;
		const end = new Date().getTime();

		_temp = a;
		return Runtime.profile.norm(end - begin);
	}

	static probe_GetValue_Bit(experimentCount)
	{
		let a, flags = 10;

		const begin = new Date().getTime();
		for (let length = experimentCount, i = 0; i < length; ++i) a = flags & 1;
		const end = new Date().getTime();

		_temp = a;
		return Runtime.profile.norm(end - begin);
	}
}

_temp;

module.exports.PerformanceProfile = module.exports;
