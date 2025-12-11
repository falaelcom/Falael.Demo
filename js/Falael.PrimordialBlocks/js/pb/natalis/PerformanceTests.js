//	R0Q1/daniel/20210718
"use strict";

const { buf, BufPool } = require("-/pb/natalis/013/Compound.js");

const test =
{
	"Set vs WeakSet": false,
	"proxy vs lookup vs direct indexing": false,
	"prop indexing vs dot operator": false,
	"string vs symbol props": false,
	"function vs new Function": false,
	"function vs new Function (create, bind-invoke)": false,
	"multicast delegate vs EventTarget": false,
	"goto simulation": false,
	"array multi-indexing vs var cache": false,
	"function implicit inlining": false,
	"method implicit inlining": false,
	"if vs array indexing": false,
	"plus vs array indexing": false,
	"array auto-grow vs array push": false,
	"array shift vs array pooling": false,
	"async vs plain function": false,
	"new Function vs setPrototypeOf vs new vs bind": false,
	"bind vs closure vs defineProperty": false,
	"call vs apply with spread op": false,
	"forEach interation vs for-in and parseInt": false,
	"params vs data members vs arr offset vs objparam": false,
	"BufPool vs Array": false,
	"Array - resize and auto-grow": false,
	"Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time": false,
	"Wrapper function": false,
	"Inheritance": false,
	"porop value vs Object.prototype.hasOwnProperty": false,
	"Graph Traverse vs Buffered Traverse": false,
};

module.exports =

//	Class: Facilitates miscellaneous custom performance tests.
//	Remarks: Does not provide any standartization. The intepretation of the test results requires careful test code examination. For a robust and formal performance test framework see `PerformanceProfile`.
class PerformanceTests
{
	//	Function: Runs miscellaneous performance and limitation tests.
	//	Remarks: By default, all tests are disabled. To enable a test, set the corresponding property of the `test` variable to `true`.
	static async run()
	{
		let enabledCount = 0
		for (const key in test) if (test[key]) ++enabledCount;
		if (!enabledCount) console.log(`All natalis performance tests are disabled. See "-/pb/natalis/PerformanceTests.js" for details.`);

		//	conclusion: nodejs v14.18.1, chrome 100.0.4896.75, firefox 100.0b3 (64-bit) - In general, Set is more efficient, with deviations on the different platforms; in chrome, with larger amounts WeakSet becomes unusable
		if (test["Set vs WeakSet"])
		{
			const testCount = 1500000;

			const subjects = [];
			for (let i = 0; i < testCount; ++i) subjects.push({});

			let set;
			let t;

			set = new Set();
			console.time("Set vs WeakSet - Set.add");
			for (let i = 0; i < testCount; ++i) t = set.add(subjects[i]);
			console.timeEnd("Set vs WeakSet - Set.add");

			console.time("Set vs WeakSet - Set.has");
			for (let i = 0; i < testCount; ++i) t = set.has(subjects[i]);
			console.timeEnd("Set vs WeakSet - Set.has");

			set = new WeakSet();
			console.time("Set vs WeakSet - WeakSet.add");
			for (let i = 0; i < testCount; ++i) t = set.add(subjects[i]);
			console.timeEnd("Set vs WeakSet - WeakSet.add");

			console.time("Set vs WeakSet - WeakSet.has");
			for (let i = 0; i < testCount; ++i) t = set.has(subjects[i]);
			console.timeEnd("Set vs WeakSet - WeakSet.has");

			console.log(t);
		}

		//	conclusion: 
		//		- nodejs v14.18.1 - direct accessor : lookup : proxy : reflecting proxy = 1 : 1 : 15 : 35
		//		- chrome 100.0.4896.75 - direct accessor : lookup : proxy : reflecting proxy = 1 : 1 : 20 : 40
		//		- firefox 100.0b3(64 - bit) - direct accessor : lookup : proxy : reflecting proxy = 1 : 1 : 200 : 200
		if (test["proxy vs lookup vs direct indexing"])
		{
			const testCount = 30000000;

			function lookup(obj, name)
			{
				return obj[name];
			}

			const proxyHandler =
			{
				get(obj, name)
				{
					return obj[name];
				}
			};

			const reflectingProxyHandler =
			{
				get(...args)
				{
					return Reflect.get(...args);
				}
			};

			const obj = { a: 1 };
			let t;

			console.time("proxy vs lookup vs direct indexing - direct accessor");
			for (let i = 0; i < testCount; ++i)
			{
				t = obj.a;
			}
			console.timeEnd("proxy vs lookup vs direct indexing - direct accessor");

			console.time("proxy vs lookup vs direct indexing - lookup");
			for (let i = 0; i < testCount; ++i)
			{
				t = lookup(obj, "a");
			}
			console.timeEnd("proxy vs lookup vs direct indexing - lookup");

			const proxy = new Proxy(obj, proxyHandler);
			console.time("proxy vs lookup vs direct indexing - proxy");
			for (let i = 0; i < testCount; ++i)
			{
				t = proxy.a;
			}
			console.timeEnd("proxy vs lookup vs direct indexing - proxy");

			const reflectingProxy = new Proxy(obj, reflectingProxyHandler);
			console.time("proxy vs lookup vs direct indexing - reflectingProxy");
			for (let i = 0; i < testCount; ++i)
			{
				t = reflectingProxy.a;
			}
			console.timeEnd("proxy vs lookup vs direct indexing - reflectingProxy");

			t;
		}

		//	conclusion: nodejs v14.18.1, chrome 100.0.4896.75, firefox 100.0b3 (64-bit) - no difference between accessing properties via indexing or via dot syntax
		if (test["prop indexing vs dot operator"])
		{
			const propCount = 800;
			const testLvl1Count = 400;
			const testLvl2Count = 400;

			let sbi_c = `const result = {};`, sbd_c = `const result = {};`;
			let sbi_i = ``, sbd_i = ``;
			for (let i = 0; i < propCount - 1; ++i)
			{
				const name = "n" + Math.random().toString(36).substring(2);
				sbi_c += `result[${JSON.stringify(name)}] = 0;`;
				sbd_c += `result.${name} = 0;`;

				sbi_i += `++value[${JSON.stringify(name)}];`;
				sbd_i += `++value.${name};`;
			}
			sbi_c += `return result;`;
			sbd_c += `return result;`;

			const fni_c = new Function(sbi_c);
			const fnd_c = new Function(sbd_c);
			const fni_i = new Function("value", sbi_i);
			const fnd_i = new Function("value", sbd_i);

			console.time("prop indexing vs dot operator - indexing");
			for (let i = 0; i < testLvl1Count; ++i)
			{
				const value = fni_c();
				for (let j = 0; j < testLvl2Count; ++j) fni_i(value);
			}
			console.timeEnd("prop indexing vs dot operator - indexing");

			console.time("prop indexing vs dot operator - dot");
			for (let i = 0; i < testLvl1Count; ++i)
			{
				const value = fnd_c();
				for (let j = 0; j < testLvl2Count; ++j) fnd_i(value);
			}
			console.timeEnd("prop indexing vs dot operator - dot");
		}

		//	conclusion: nodejs v16.6.1, chrome 94.0.4606.71 - no significant difference between accessing string and symbol properties
		if (test["string vs symbol props"])
		{
			const propCount = 1000000;

			const symbols = [];
			const names = [];
			const object1 = {};
			const object2 = {};
			for(let i = 0; i < propCount; ++i)
			{
				const text = Math.random().toString(36).substring(2);
				const symbol = Symbol(text);
				symbols.push(symbol);
				names.push(text);
				object1[text] = function() {}
				object2[symbol] = function() {}
			}

			console.time("string vs symbol props - string");
			for(let i = 0; i < propCount; ++i) object1[names[i]]();
			console.timeEnd("string vs symbol props - string");
			
			console.time("string vs symbol props - symbol");
			for(let i = 0; i < propCount; ++i) object2[symbols[i]]();
			console.timeEnd("string vs symbol props - symbol");
		}

		//	conclusion: chrome 94.0.4606.71 - no differences between the performance of calling a_inc1 and a_inc2
		if (test["function vs new Function"])
		{
			let a = 0;
			const count = 50000000;
			function a_inc1(a) { return a + 1; }
			const a_inc2 = new Function("a", "return a + 1");

			console.time("function vs new Function - a_inc1");
			a = 0; for (let i = 0; i < count; ++i) a = a_inc1(a);
			console.timeEnd("function vs new Function - a_inc1");

			console.time("function vs new Function - a_inc2");
			a = 0; for (let i = 0; i < count; ++i) a = a_inc2(a);
			console.timeEnd("function vs new Function - a_inc2");

			console.time("function vs new Function - a_inc1");
			a = 0; for (let i = 0; i < count; ++i) a = a_inc1(a);
			console.timeEnd("function vs new Function - a_inc1");

			console.time("function vs new Function - a_inc2");
			a = 0; for (let i = 0; i < count; ++i) a = a_inc2(a);
			console.timeEnd("function vs new Function - a_inc2");
		}

		//	conclusion: nodejs v14.18.1, chrome 99.0.4844.82 
		//		- no significant difference between creating instances of Test1 and Test3
		//			- creating instances of Test2 is extremely slow, supposedly because of the repeated run-time compilation caused by super(`++this.a`)
		//			- creating instances of Test4 is extremely slow, supposedly because of the repeated run-time property creating by Object.defineProperty(result, "a", { get: function () { return this._a; }.bind(this) });
		//		- no significant difference between invokation of instances of Test1, Test2 and Test3
		if (test["function vs new Function (create, bind-invoke)"])
		{
			const count = 5000000000;
			class Test1
			{
				constructor(a) { this._a = a; }
				test() { ++this._a; }
				get a() { return this._a; }
			}
			class Test2 extends Function
			{
				constructor(a)
				{
					super(`++this.a`);
					this.a = a;
					const result = this.bind(this);
					result.THIS = this;
					return result;
				}
				test() { ++this.THIS.a; }
			}
			function Test3(a)
			{
				this._a = a;
				const result = Test3.__pbmdfn.bind(this);
				result.test = function test() { ++this._a; }.bind(this);
				result.getA = function getA() { return this._a; }.bind(this);
				return result;
			}
			Test3.__pbmdfn = function () { ++this._a };
			function Test4(a)
			{
				this._a = a;
				const result = Test4.__pbmdfn.bind(this);
				result.test = function test() { ++this._a; }.bind(this);
				Object.defineProperty(result, "a", { get: function () { return this._a; }.bind(this) });
				return result;
			}
			Test4.__pbmdfn = function () { ++this._a };

			const t1 = new Test1(10); t1.test(); console.log("function vs new Function (create, bind-invoke) (1)", t1.a);
			const t2 = new Test2(20); t2(); console.log("function vs new Function (create, bind-invoke) (2)", t2.THIS.a);
			const t3 = new Test3(30); t3(); console.log("function vs new Function (create, bind-invoke) (3)", t3.getA());
			const t4 = new Test4(40); t4(); console.log("function vs new Function (create, bind-invoke) (4)", t4.a);

			console.time("function vs new Function (create, bind-invoke) - Test1 - invoke");
			for (let length = count, i = 0; i < length; ++i) { t1.test() };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test1 - invoke");
			console.log("function vs new Function (create, bind-invoke) (1.1)", t1.a);

			console.time("function vs new Function (create, bind-invoke) - Test2 - invoke");
			for (let length = count, i = 0; i < length; ++i) { t2() };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test2 - invoke");
			console.log("function vs new Function (create, bind-invoke) (2.1)", t2.THIS.a);

			console.time("function vs new Function (create, bind-invoke) - Test3 - invoke");
			for (let length = count, i = 0; i < length; ++i) { t3() };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test3 - invoke");
			console.log("function vs new Function (create, bind-invoke) (3.1)", t3.getA());

			console.time("function vs new Function (create, bind-invoke) - Test4 - invoke");
			for (let length = count, i = 0; i < length; ++i) { t4() };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test4 - invoke");
			console.log("function vs new Function (create, bind-invoke) (4.1)", t4.a);

			console.time("function vs new Function (create, bind-invoke) - Test1 - create");
			for (let i = 0; i < count; ++i) { const t = new Test1(i) };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test1 - create");

			console.time("function vs new Function (create, bind-invoke) - Test3 - create");
			for (let i = 0; i < count; ++i) { const t = new Test3(i) };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test3 - create");

			console.time("function vs new Function (create, bind-invoke) - Test1 - create");
			for (let i = 0; i < count; ++i) { const t = new Test1(i) };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test1 - create");

			console.time("function vs new Function (create, bind-invoke) - Test3 - create");
			for (let i = 0; i < count; ++i) { const t = new Test3(i) };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test3 - create");

			console.time("function vs new Function (create, bind-invoke) - Test2 - create (multiply time by 100000!)");
			for (let length = count / 100000, i = 0; i < length; ++i) { const t = new Test2(i) };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test2 - create (multiply time by 100000!)");

			console.time("function vs new Function (create, bind-invoke) - Test4 - create (multiply time by 1000!)");
			for (let length = count / 1000, i = 0; i < length; ++i) { const t = new Test4(i) };
			console.timeEnd("function vs new Function (create, bind-invoke) - Test4 - create (multiply time by 1000!)");
		}

		//	conclusion: chrome 99.0.4844.82
		//		- in Test2, EventTarget is about 100 times slower than the sample multicast delegate implementation due to the repeated creation of an Event object
		//		- in Test3, EventTarget with reused Event object is faster with large numbers of callbacks (like > 50), but 2-3 times slower with one callback and still slower with 8-10 callbacks
		if (test["multicast delegate vs EventTarget"])
		{
			const expcount = 5;
			const count = 1000000;
			function Test1(cblist)
			{
				this._callbacks = cblist;
				const result = Test1.__pbmdfn.bind(this);
				return result;
			}
			Test1.__pbmdfn = function (...args)
			{
				for (let length = this._callbacks.length, i = 0; i < length; ++i) this._callbacks[i](...args);
			};

			function Test2(cblist)
			{
				this._et = new EventTarget();
				for (let length = cblist.length, i = 0; i < length; ++i) this._et.addEventListener(null, cblist[i]);
				const result = Test2.__pbmdfn.bind(this);
				return result;
			}
			Test2.__pbmdfn = function (...args)
			{
				this._et.dispatchEvent(new Event(args));
			};

			function Test3(cblist)
			{
				this._et = new EventTarget();
				for (let length = cblist.length, i = 0; i < length; ++i) this._et.addEventListener(null, cblist[i]);
				const result = Test3.__pbmdfn.bind(this);
				return result;
			}
			const evt = new Event(1);
			Test3.__pbmdfn = function (...args)
			{
				evt.data = 666;
				this._et.dispatchEvent(evt);
			};

			const expcbs = [];
			let cbcount = 1;
			for (let i = 0; i < expcount; ++i)
			{
				const cblist = [];
				expcbs.push(cblist);
				for (let j = 0; j < cbcount ; ++j) cblist.push(() => { ++z });
				cbcount *= 10;
			}

			let z = 0;
			for (let length = expcbs.length, i = 0; i < length; ++i)
			{
				const cblist = expcbs[i];
				const t1 = new Test1(cblist);
				console.time(`multicast delegate vs EventTarget - multicast delegate - ${cblist.length}`);
				for (let jlength = count / cblist.length, j = 0; j < jlength; ++j) { t1() };
				console.timeEnd(`multicast delegate vs EventTarget - multicast delegate - ${cblist.length}`);
			}

			if (typeof EventTarget !== "undefined")
			{
				z = 0;
				for (let length = expcbs.length, i = 0; i < length; ++i)
				{
					const cblist = expcbs[i];
					const t2 = new Test2(cblist);
					console.time(`multicast delegate vs EventTarget - EventTarget 2 - ${cblist.length}`);
					for (let jlength = count / cblist.length, j = 0; j < jlength; ++j) { t2() };
					console.timeEnd(`multicast delegate vs EventTarget - EventTarget 2 - ${cblist.length}`);
				}

				z = 0;
				for (let length = expcbs.length, i = 0; i < length; ++i)
				{
					const cblist = expcbs[i];
					const t3 = new Test3(cblist);
					console.time(`multicast delegate vs EventTarget - EventTarget 3 - ${cblist.length}`);
					for (let jlength = count / cblist.length, j = 0; j < jlength; ++j) { t3() };
					console.timeEnd(`multicast delegate vs EventTarget - EventTarget 3 - ${cblist.length}`);
				}
			}
			else console.log("EventTarget is not defined.");
		}

		//	conclusion: chrome 94.0.4606.71 - do-while nesting is supported up to about 600 levels
		if (test["goto simulation"])
		{
			test(10);
			test(10);
			test(100);
			test(100);
			test(500);
			test(500);
			function test(count)
			{
				const sb = [];
				step(sb, count, 0);
				sb.push(`console.timeEnd("goto ${count}");`);
				const f = new Function(sb.join(""));
				f();

				function step(sb, count, depth)
				{
					if (depth >= count)
					{
						sb.push(`console.time("goto ${count}");`);
						sb.push(`break l0;` + "\n");
						return;
					}
					sb.push(`l${depth}: do {` + "\n");
					step(sb, count, depth + 1);
					sb.push(`} while(true);` + "\n");
				}
			}
		}

		//	conclusion: nodejs v16.6.1, chrome 94.0.4606.71 - with 1-8 indexing ops per one var var cache and multi-indexing show the same performance
		if (test["array multi-indexing vs var cache"])
		{
			const count = 10000000;

			const array = new Array(count);

			for (let length = array.length, i = 0; i < length; ++i) array[i] = { a: 1, b: 2, c: 3, d: 4 };

			console.time("array multi-indexing vs var cache - var cache");
			for (let length = array.length, i = 0; i < length; ++i)
			{
				const item = array[i];
				++item.a;
				++item.b;
				++item.c;
				++item.d;
			}
			console.timeEnd("array multi-indexing vs var cache - var cache");

			for (let length = array.length, i = 0; i < length; ++i) array[i] = { a: 1, b: 2, c: 3, d: 4 };

			console.time("array multi-indexing vs var cache - multi-indexing");
			for (let length = array.length, i = 0; i < length; ++i)
			{
				++array[i].a;
				++array[i].b;
				++array[i].c;
				++array[i].d;
			}
			console.timeEnd("array multi-indexing vs var cache - multi-indexing");
		}

		//	conclusion 1: nodejs v16.6.1 - simple op with a closure introduces considerable lag
		//	conclusion 2: nodejs v16.6.1, chrome 94.0.4606.71 - simple op in a function is inlined (function call yields the same performance as inline code)
		//	conclusion 3: nodejs v16.6.1, chrome 94.0.4606.71 - simple op with array indexing in a function is inlined (function call yields the same performance as inline code)
		//	conclusion 4: nodejs v16.6.1, chrome 94.0.4606.71 - complex op in a function is NOT inlined (function call yields ~2.5 longer execution time compared to inline code)
		//	conclusion 5: nodejs v16.6.1 vs chrome 94.0.4606.71 - all simple op tests are MASSIVELY faster in nodejs compared to chrome (~8 times)
		//	conclusion 6: `if (FALSE)`, where `FALSE === false`, does not prevent a function from being inlined
		if (test["function implicit inlining"])
		{
			const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
			let count;

			//	function implicit inlining - simple op
			count = 100000000;
			let a = 0;
			function inc_closure() {++a}
			function inc2(a) {return a + 1;}
			
			a = 0;
			console.time("function implicit inlining - simple op - inline code");
			for (let i = 0; i < count; ++i) {++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;}
			console.timeEnd("function implicit inlining - simple op - inline code");
			
			a = 0;
			console.time("function implicit inlining - simple op - inc_closure");
			for (let i = 0; i < count; ++i) {inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();inc_closure();}
			console.timeEnd("function implicit inlining - simple op - inc_closure");

			a = 0;
			console.time("function implicit inlining - simple op - inc2");
			for (let i = 0; i < count; ++i) {a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);a = inc2(a);}
			console.timeEnd("function implicit inlining - simple op - inc2");

			//	function implicit inlining - arr index op
			count = 10000000;
			function indexop(a, i) {return a + arr[i%10] + 1;}
			
			a = 0;
			console.time("function implicit inlining - arr index op - inline code");
			for (let i = 0; i < count; ++i) {a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;}
			console.timeEnd("function implicit inlining - arr index op - inline code");
			
			a = 0;
			console.time("function implicit inlining - arr index op - function");
			for (let i = 0; i < count; ++i) {a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);a = indexop(a, i);}
			console.timeEnd("function implicit inlining - arr index op - function");

			//	function implicit inlining - complex op
			count = 100000000;
			let b = 0;
			function coop(arr, b, i)
			{
				switch(i % 10)
				{
					case 0: b += arr[9]; break;
					case 1: b += arr[8]; break;
					case 2: b += arr[7]; break;
					case 3: b += arr[6]; break;
					case 4: b += arr[5]; break;
					case 5: b += arr[4]; break;
					case 6: b += arr[3]; break;
					case 7: b += arr[2]; break;
					case 8: b += arr[1]; break;
					case 9: b += arr[0]; break;
					default: throw "Not implemented."
				}
				return b;
			}

			b = 0;
			console.time("function implicit inlining - complex op - inline code");
			for (let i = 0; i < count; ++i)
			{
				switch(i % 10)
				{
					case 0: b += arr[9]; break;
					case 1: b += arr[8]; break;
					case 2: b += arr[7]; break;
					case 3: b += arr[6]; break;
					case 4: b += arr[5]; break;
					case 5: b += arr[4]; break;
					case 6: b += arr[3]; break;
					case 7: b += arr[2]; break;
					case 8: b += arr[1]; break;
					case 9: b += arr[0]; break;
					default: throw "Not implemented."
				}
			}
			console.timeEnd("function implicit inlining - complex op - inline code");

			b = 0;
			console.time("function implicit inlining - complex op - function");
			for (let i = 0; i < count; ++i) b = coop(arr, b, i);
			console.timeEnd("function implicit inlining - complex op - function");
		}

		//	conclusion - results are same as with "function implicit inlining" - comparatively and as absolute values
		if (test["method implicit inlining"])
		{
			const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
			let count;

			class C {}
			const o = new C();

			//	method implicit inlining - simple op
			count = 100000000;
			let a = 0;
			C.prototype.inc_closure = function inc_closure() {++a}
			C.prototype.inc2 = function inc2(a) {return a + 1;}
			
			a = 0;
			console.time("method implicit inlining - simple op - inline code");
			for (let i = 0; i < count; ++i) {++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;++a;}
			console.timeEnd("method implicit inlining - simple op - inline code");
			
			a = 0;
			console.time("method implicit inlining - simple op - inc_closure");
			for (let i = 0; i < count; ++i) {o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();o.inc_closure();}
			console.timeEnd("method implicit inlining - simple op - inc_closure");

			a = 0;
			console.time("method implicit inlining - simple op - inc2");
			for (let i = 0; i < count; ++i) {a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);a = o.inc2(a);}
			console.timeEnd("method implicit inlining - simple op - inc2");

			//	method implicit inlining - arr index op
			count = 10000000;
			C.prototype.indexop = function indexop(a, i) {return a + arr[i%10] + 1;}
			
			a = 0;
			console.time("method implicit inlining - arr index op - inline code");
			for (let i = 0; i < count; ++i) {a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;a = a + arr[i%10] + 1;}
			console.timeEnd("method implicit inlining - arr index op - inline code");
			
			a = 0;
			console.time("method implicit inlining - arr index op - function");
			for (let i = 0; i < count; ++i) {a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);a = o.indexop(a, i);}
			console.timeEnd("method implicit inlining - arr index op - function");

			//	method implicit inlining - complex op
			count = 100000000;
			let b = 0;
			const FALSE = false;
			C.op = function op(v) { return v !== null; }
			C.prototype.coop = function coop(arr, b, i)
			{
				switch(i % 10)
				{
					case 0: b += arr[9]; break;
					case 1: b += arr[8]; break;
					case 2: b += arr[7]; break;
					case 3: b += arr[6]; break;
					case 4: b += arr[5]; break;
					case 5: b += arr[4]; break;
					case 6: b += arr[3]; break;
					case 7: b += arr[2]; break;
					case 8: b += arr[1]; break;
					case 9: b += arr[0]; break;
					default: throw "Not implemented."
				}
				return b;
			}
			C.prototype.coop2 = function coop(arr, b, i)
			{
				if (FALSE)
				{
					if (!C.op(arr)) throw new Error();
				}
				return arr[i] + b;
			}

			b = 0;
			console.time("method implicit inlining - complex op - inline code");
			for (let i = 0; i < count; ++i)
			{
				switch(i % 10)
				{
					case 0: b += arr[9]; break;
					case 1: b += arr[8]; break;
					case 2: b += arr[7]; break;
					case 3: b += arr[6]; break;
					case 4: b += arr[5]; break;
					case 5: b += arr[4]; break;
					case 6: b += arr[3]; break;
					case 7: b += arr[2]; break;
					case 8: b += arr[1]; break;
					case 9: b += arr[0]; break;
					default: throw "Not implemented."
				}
			}
			console.timeEnd("method implicit inlining - complex op - inline code");

			b = 0;
			console.time("method implicit inlining - complex op - function");
			for (let i = 0; i < count; ++i) b = o.coop(arr, b, i);
			console.timeEnd("method implicit inlining - complex op - function");

			b = 0;
			console.time("method implicit inlining - complex op - inline code 2");
			for (let i = 0; i < count; ++i)
			{
				if (FALSE)
				{
					if (!C.op(arr)) throw new Error();
				}
				b = arr[i] + b;
			}
			console.timeEnd("method implicit inlining - complex op - inline code 2");

			b = 0;
			console.time("method implicit inlining - complex op - function 2");
			for (let i = 0; i < count; ++i) b = o.coop2(arr, b, i);
			console.timeEnd("method implicit inlining - complex op - function 2");
		}

		//	conclusion - nodejs v16.6.1, chrome 94.0.4606.71 - the if represents ~12-15% of the array indexing execution time
		if (test["if vs array indexing"])
		{
			const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

			const count = 100000000;
			
			console.time("if vs array indexing - if");
			for (let i = 0; i < count; ++i)
			{
				if(i%10 !== 20) continue;
			}
			console.timeEnd("if vs array indexing - if");

			console.time("if vs array indexing - array indexing");
			for (let i = 0; i < count; ++i)
			{
				arr[i%10] = i;
			}
			console.timeEnd("if vs array indexing - array indexing");

			console.time("if vs array indexing - if + array indexing");
			for (let i = 0; i < count; ++i)
			{
				if(i%10 !== 20) arr[i%10] = i;
			}
			console.timeEnd("if vs array indexing - if + array indexing");
		}

		//	conclusion - nodejs v14.18.1, chrome 97.0.4692.71 - the plus adds no significant increase to the array indexing execution time
		if (test["plus vs array indexing"])
		{
			const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

			const count = 100000000;
			let b;

			console.time("plus vs array indexing - plus");
			for (let i = 0; i < count; ++i)
			{
				b = (i % 10) + 1;
			}
			console.timeEnd("plus vs array indexing - plus");

			console.time("plus vs array indexing - array indexing");
			for (let i = 0; i < count; ++i)
			{
				b = arr[i % 10];
			}
			console.timeEnd("plus vs array indexing - array indexing");

			console.time("plus vs array indexing - plus + array indexing");
			for (let i = 0; i < count; ++i)
			{
				b = arr[i % 10] + 1;
			}
			console.timeEnd("plus vs array indexing - plus + array indexing");
		}

		//	conclusion - nodejs v14.18.1, chrome 97.0.4692.71 - no significant difference
		if (test["array auto-grow vs array push"])
		{
			const count = 20000000;
			let arr = null;
			let autoGrowntFactor = null;
			let length = null;

			console.time("array auto-grow vs array push - push");
			arr = [];
			for (let i = 0; i < count; ++i) arr.push(i);
			console.timeEnd("array auto-grow vs array push - push");

			console.time("array auto-grow vs array push - auto-grow, x1.5");
			arr = [];
			autoGrowntFactor = 1.5;
			length = 0;
			for (let i = 0; i < count; ++i)
			{
				if (arr.length < length + 1) arr.length = Math.ceil(arr.length * autoGrowntFactor);
				arr[length] = i;
				++length;
			}
			console.timeEnd("array auto-grow vs array push - auto-grow, x1.5");

			console.time("array auto-grow vs array push - auto-grow, x1.2");
			arr = [];
			autoGrowntFactor = 1.2;
			length = 0;
			for (let i = 0; i < count; ++i)
			{
				if (arr.length < length + 1) arr.length = Math.ceil(arr.length * autoGrowntFactor);
				arr[length] = i;
				++length;
			}
			console.timeEnd("array auto-grow vs array push - auto-grow, x1.2");

			console.time("array auto-grow vs array push - auto-grow, x2");
			arr = [];
			autoGrowntFactor = 2;
			length = 0;
			for (let i = 0; i < count; ++i)
			{
				if (arr.length < length + 1) arr.length = Math.ceil(arr.length * autoGrowntFactor);
				arr[length] = i;
				++length;
			}
			console.timeEnd("array auto-grow vs array push - auto-grow, x2");

			console.time("array auto-grow vs array push - push");
			arr = [];
			for (let i = 0; i < count; ++i) arr.push(i);
			console.timeEnd("array auto-grow vs array push - push");
		}

		//	conclusion - nodejs v14.18.1, chrome 97.0.4692.71 - pooling is significantly faster than array shift, with performance gain higher for larger arrays
		if (test["array shift vs array pooling"])
		{
			const count = 100000;
			const subjectLength = 100;
			let arr = null;
			let offset = null;
			let length = null;

			console.time("array shift vs array pooling - array shift");
			for (let i = 0; i < count; ++i)
			{
				arr = new Array(subjectLength);
				for (let j = 0; j < subjectLength; ++j) arr.shift();
			}
			console.timeEnd("array shift vs array pooling - array shift");

			console.time("array shift vs array pooling - pooling");
			for (let i = 0; i < count; ++i)
			{
				arr = new Array(subjectLength);
				length = subjectLength;
				offset = 0;
				for (let j = 0; j < subjectLength; ++j)
				{
					offset = offset + 1;
					length = length - 1;
				}
			}
			console.timeEnd("array shift vs array pooling - pooling");
		}

		//	conclusion - chrome 99.0.4844.82 - async/await adds a significant performance overhead
		if (test["async vs plain function"])
		{
			const count = 10000;

			let z;
			function fn() { return z; }
			async function afn() { return z; }

			z = 0;
			console.time("async vs plain function - plain");
			for (let i = 0; i < count; ++i) z = fn() + 1;
			console.timeEnd("async vs plain function - plain");

			z = 0;
			console.time("async vs plain function - await plain");
			for (let i = 0; i < count; ++i) z = await fn() + 1;
			console.timeEnd("async vs plain function - await plain");

			z = 0;
			console.time("async vs plain function - async");
			for (let i = 0; i < count; ++i) z = afn() + 1;
			console.timeEnd("async vs plain function - async");

			z = 0;
			console.time("async vs plain function - await async");
			for (let i = 0; i < count; ++i) z = await afn() + 1;
			console.timeEnd("async vs plain function - await async");
		}

		//	conclusion: `Object.setPrototypeOf` is the cheapest tool to augment new objects and functions
		//		- nodejs v14.18.1 - `new Function` is moderately slower than the other two approaches (20-30x); `Object.setPrototypeOf` is 2x slower than the direct instancing; a single `bind` is comparable with `Object.setPrototypeOf`
		//		- chrome 100.0.4896.127, firefox 100.0b7(64 - bit) - `new Function` is massively slower than the other two approaches (300-500x); `Object.setPrototypeOf` is 2x to 4x slower than the direct instancing; a single `bind` is comparable with `Object.setPrototypeOf`
		if (test["new Function vs setPrototypeOf vs new vs bind"])
		{
			const count = 3000000;

			function A() { this.a = 1; }

			class B extends Function
			{
				constructor()
				{
					super("...args", `return (${String(function (self) { })})(this, ...args)`);
					this.a = 1;
					return this.bind(this);
				}
			}

			function D() { this.a = 1; }
			function D2() { this.a = 1; }
			function D3() { this.a = 1; }
			function D4() { this.a = 1; }
			function D5() { this.a = 1; }

			class F extends Function
			{
				constructor()
				{
					super();
				}
			}

			let v = null

			console.time("new Function vs setPrototypeOf vs new vs bind - createViaNew");
			for (let i = 0; i < count; ++i) v = new A();
			console.timeEnd("new Function vs setPrototypeOf vs new vs bind - createViaNew");

			console.time("new Function vs setPrototypeOf vs new vs bind - createViaNewFunction (*1000)");
			for (let i = 0; i < count / 1000; ++i) v = new B();
			console.timeEnd("new Function vs setPrototypeOf vs new vs bind - createViaNewFunction (*1000)");

			console.time("new Function vs setPrototypeOf vs new vs bind - createViaSetPrototypeOf");
			for (let i = 0; i < count; ++i) v = Object.setPrototypeOf({ a: 1 }, A.prototype)
			console.timeEnd("new Function vs setPrototypeOf vs new vs bind - createViaSetPrototypeOf");

			{
				console.time("new Function vs setPrototypeOf vs new vs bind - bind (1)");
				for (let i = 0; i < count; ++i) v = D.bind(A)();
				console.timeEnd("new Function vs setPrototypeOf vs new vs bind - bind (1)");

				console.time("new Function vs setPrototypeOf vs new vs bind - bind (2)");
				for (let i = 0; i < count; ++i) { v = D.bind(A)(); v = D2.bind(A)() };
				console.timeEnd("new Function vs setPrototypeOf vs new vs bind - bind (2)");

				console.time("new Function vs setPrototypeOf vs new vs bind - bind (3)");
				for (let i = 0; i < count; ++i) { v = D.bind(A)(); v = D2.bind(A)(); v = D3.bind(A)() };
				console.timeEnd("new Function vs setPrototypeOf vs new vs bind - bind (3)");

				console.time("new Function vs setPrototypeOf vs new vs bind - bind (4)");
				for (let i = 0; i < count; ++i) { v = D.bind(A)(); v = D2.bind(A)(); v = D3.bind(A)(); v = D4.bind(A)() };
				console.timeEnd("new Function vs setPrototypeOf vs new vs bind - bind (4)");

				console.time("new Function vs setPrototypeOf vs new vs bind - bind (5)");
				for (let i = 0; i < count; ++i) { v = D.bind(A)(); v = D2.bind(A)(); v = D3.bind(A)(); v = D4.bind(A)(); v = D5.bind(A)() };
				console.timeEnd("new Function vs setPrototypeOf vs new vs bind - bind (5)");
			}

			console.time("new Function vs setPrototypeOf vs new vs bind - F (*1000)");
			for (let i = 0; i < count / 1000; ++i) v = new F();
			console.timeEnd("new Function vs setPrototypeOf vs new vs bind - F (*1000)");

			console.log(v);
		}

		//	conclusion: closure is 5x faster (except for mozilla (2x faster), but not sure the tests are clean with the subject version)
		//		`defineProperty` is x100 slower than creating a closure
		//	no difference when invoking bound or closured functions
		if (test["bind vs closure vs defineProperty"])
		{
			const count = 100000000;

			const o = {b:1};
			function a(a) { return a + this.b; }

			let v = {};
			const pd =
			{
				enumerable: true,
				configurable: true,
				get() { return this.b }
			};

			console.time("bind vs closure vs defineProperty - bind");
			for (let i = 0; i < count; ++i) v.a = a.bind(o);
			console.timeEnd("bind vs closure vs defineProperty - bind");

			console.time("bind vs closure vs defineProperty - bind - invoke");
			for (let i = 0; i < count; ++i) v.a(1);
			console.timeEnd("bind vs closure vs defineProperty - bind - invoke");

			console.time("bind vs closure vs defineProperty - closure");
			for (let i = 0; i < count; ++i)
			{
				let oo = o;
				v.a = function a(a) { return a + oo.b; }
			}
			console.timeEnd("bind vs closure vs defineProperty - closure");

			class C
			{
				constructor()
				{
					this.b = 1;
					console.time("bind vs closure vs defineProperty - closure (2)");
					for (let i = 0; i < count; ++i)
					{
						v.a = (a) => a + this.b;
					}
					console.timeEnd("bind vs closure vs defineProperty - closure (2)");
				}
			}
			new C();

			console.time("bind vs closure vs defineProperty - closure - invoke");
			for (let i = 0; i < count; ++i) v.a(1);
			console.timeEnd("bind vs closure vs defineProperty - closure - invoke");

			console.time("bind vs closure vs defineProperty - defineProperty (*100)");
			for (let i = 0; i < count / 100; ++i)
			{
				Object.defineProperty(o, "a", pd);
			}
			console.timeEnd("bind vs closure vs defineProperty - defineProperty (*100)");

			console.time("bind vs closure vs defineProperty - getOwnPropertyDescriptor (*10)");
			for (let i = 0; i < count / 10; ++i)
			{
				v = Object.getOwnPropertyDescriptor(o, "a")
			}
			console.timeEnd("bind vs closure vs defineProperty - getOwnPropertyDescriptor (*10)");

			console.time("bind vs closure vs defineProperty - getOwnPropertyNames (*10)");
			for (let i = 0; i < count / 10; ++i)
			{
				v = Object.getOwnPropertyNames(o)
			}
			console.timeEnd("bind vs closure vs defineProperty - getOwnPropertyNames (*10)");
		}

		//	conclusion: no significant difference with v8
		//		in firefox .call is unusably slow
		if (test["call vs apply with spread op"])
		{
			const count = 1000000000;

			function f1(a, b, c, d, e)
			{
				return a + b + c + d + e;
			}

			function f1direct(a, b, c, d, e)
			{
				return f1(a, b, c, d, e);
			}

			function f1direct_call(a, b, c, d, e)
			{
				return f1.call(null, a, b, c, d, e);
			}

			function f1call(...args)
			{
				return f1.call(null, ...args);
			}

			function f1apply(...args)
			{
				return f1.apply(null, args);
			}

			let v;

			console.time("call vs apply with spread op - call");
			for (let i = 0; i < count; ++i) v = f1call(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - call");

			console.time("call vs apply with spread op - apply");
			for (let i = 0; i < count; ++i) v = f1apply(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - apply");

			console.time("call vs apply with spread op - direct call");
			for (let i = 0; i < count; ++i) v = f1direct_call(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - direct call");

			console.time("call vs apply with spread op - direct");
			for (let i = 0; i < count; ++i) v = f1direct(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - direct");

			console.time("call vs apply with spread op - call");
			for (let i = 0; i < count; ++i) v = f1call(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - call");

			console.time("call vs apply with spread op - apply");
			for (let i = 0; i < count; ++i) v = f1apply(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - apply");

			console.time("call vs apply with spread op - direct call");
			for (let i = 0; i < count; ++i) v = f1direct_call(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - direct call");

			console.time("call vs apply with spread op - direct");
			for (let i = 0; i < count; ++i) v = f1direct(i, i + 1, i + 2, i + 3, i + 4);
			console.timeEnd("call vs apply with spread op - direct");
		}

		//	conclusion: threshold 1000 is good
		if (test["forEach interation vs for-in and parseInt"])
		{
			const arraySize = 1000;
			const experimentCount = 10000;
			let v, array;

			for (let fullness = 0; fullness <= 0.2; fullness += 0.02)
			{
				array = [];
				array[arraySize] = 1;
				for (let i = 0; i < Math.floor(fullness * arraySize); ++i) array[i] = 1;

				const percentage = Math.round(fullness * 100);
				const count = Math.floor(fullness * arraySize);

				console.time(`forEach interation vs for-in and parseInt - ${percentage}% - forEach (${count})`);
				for (let i = 0; i < experimentCount; ++i) array.forEach(vv => v = vv);
				console.timeEnd(`forEach interation vs for-in and parseInt - ${percentage}% - forEach (${count})`);

				console.time(`forEach interation vs for-in and parseInt - ${percentage}% - for-in  (${count})`);
				for (let i = 0; i < experimentCount; ++i) for (const key in array) v = array[parseInt(key)];
				console.timeEnd(`forEach interation vs for-in and parseInt - ${percentage}% - for-in  (${count})`);
			}
		}

		//	conclusion: 
		//		- nodejs v14.18.1, chrome 100.0.4896.127 - params, objparam and objparam 2 are perform similarly fast, 2-3x faster than the rest of the tests
		//		- firefox 101.0b1 (64-bit) - params is 5x faster than data membars and objparam and 10x faster than array offset
		if (test["params vs data members vs arr offset vs objparam"])
		{
			const experimentCount = 200000000;

			function f1(a, b, c, d, e, f, g, h, i, j, k, l, m, n)
			{
				return a + b + c + d + e + f + g + h + i + j + k + l + m + n;
			}

			const obj = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0, n: 0 };
			function f2()
			{
				return obj.a + obj.b + obj.c + obj.d + obj.e +
					obj.f + obj.g + obj.h + obj.i + obj.j +
					obj.k + obj.l + obj.m + obj.n;
			}

			const arr = new Array(14);
			function f3()
			{
				return arr[0] + arr[1] + arr[2] + arr[3] + arr[4] +
					arr[5] + arr[6] + arr[7] + arr[8] + arr[9] +
					arr[10] + arr[11] + arr[12] + arr[13];
			}

			function f4({ a, b, c, d, e, f, g, h, i, j, k, l, m, n })
			{
				return a + b + c + d + e + f + g + h + i + j + k + l + m + n;
			}

			function f5(par)
			{
				const { a, b, c, d, e, f, g, h, i, j, k, l, m, n } = par;

				return a + b + c + d + e + f + g + h + i + j + k + l + m + n;
			}

			let v = 0;

			console.time("params vs data members vs arr offset vs objparam - params");
			for (let i = 0; i < experimentCount; ++i) v = f1(i, i + 1, i + 2, i + 3, i + 4,
				i + 5, i + 6, i + 7, i + 8, i + 9,
				i + 10, i + 11, i + 12, i + 13);
			console.timeEnd("params vs data members vs arr offset vs objparam - params");

			console.time("params vs data members vs arr offset vs objparam - data members");
			for (let i = 0; i < experimentCount; ++i)
			{
				obj.a = i;
				obj.b = i+1;
				obj.c = i+2;
				obj.d = i+3;
				obj.e = i+4;

				obj.f = i+5;
				obj.g = i+6;
				obj.h = i+7;
				obj.i = i+8;
				obj.j = i+9;

				obj.k = i+10;
				obj.l = i+11;
				obj.m = i+12;
				obj.n = i+13;
				v = f2();
			}
			console.timeEnd("params vs data members vs arr offset vs objparam - data members");

			console.time("params vs data members vs arr offset vs objparam - arr offset");
			for (let i = 0; i < experimentCount; ++i)
			{
				arr[0] = i; 
				arr[1] = i+1;
				arr[2] = i+2;
				arr[3] = i+3;
				arr[4] = i+4;
				arr[5] = i+5;
				arr[6] = i+6;
				arr[7] = i+7;
				arr[8] = i+8;
				arr[9] = i+9;
				arr[10]= i+10;
				arr[11]= i+11;
				arr[12]= i+12;
				arr[13] = i+13;
				v = f3();
			}
			console.timeEnd("params vs data members vs arr offset vs objparam - arr offset");

			console.time("params vs data members vs arr offset vs objparam - objparam");
			for (let i = 0; i < experimentCount; ++i) v = f4({ a: i, b: i+1, c: i+2, d: i+3, e: i+4, f: i+5, g: i+6, h: i+7, i: i+8, j: i+9, k: i+10, l: i+11, m: i+12, n: i+13 });
			console.timeEnd("params vs data members vs arr offset vs objparam - objparam");

			console.time("params vs data members vs arr offset vs objparam - objparam 2");
			for (let i = 0; i < experimentCount; ++i) v = f5({ a: i, b: i + 1, c: i + 2, d: i + 3, e: i + 4, f: i + 5, g: i + 6, h: i + 7, i: i + 8, j: i + 9, k: i + 10, l: i + 11, m: i + 12, n: i + 13 });
			console.timeEnd("params vs data members vs arr offset vs objparam - objparam 2");
		}

		//	conslusion: using BufPool for acquiring array instances is faster than creating new instances for arrays as follows (chrome 100.0.4896.127, firefox 101.0b1 (64-bit)):
		//		- 0 element arrays - 0.01x (v8), 0.2x (ff) (BufPool is slower)
		//		- 1 element arrays - 0.25x (v8), 0.2x (ff) (BufPool is slower)
		//		- 2 element arrays - 0.5x (v8), 0.2x (ff) (BufPool is slower)
		//		- 5 element arrays - 0.9x (v8), 0.25x (ff) (BufPool is slower)
		//		- 8 element arrays - 1x (v8), 0.25x (ff) (ff: BufPool is slower)			<----- breaking point with v8
		//		- 13 element arrays - 1.3x (v8), 0.35x (ff) (ff: BufPool is slower)
		//		- 14 element arrays - 1.5x (v8), 1.3x (ff)									<----- breaking point with ff
		//		- 20 element arrays - 2x (v8), 1.5x (ff)
		//	with v8, even a single `array.push` adds huge overhead with arrays created with size 0, which makes the use of `BufPool.hold` and `BufPool.create` meaningful even for small arrays
		//
		//	string concatenation is the fastest way for building smaller strings, but in v8 using an automatically-growing array peforms significantly faster for large strings
		if (test["BufPool vs Array"])
		{
			const experimentCount = 100000000;
			const bufferLength = 3;

			let v;

			const original_PB_DEBUG = PB_DEBUG;
			PB_DEBUG = false;
			try
			{
				console.time("BufPool vs Array - control loop");
				for (let i = 0; i < experimentCount; ++i);
				console.timeEnd("BufPool vs Array - control loop");

				console.time("BufPool vs Array - new - Array");
				for (let i = 0; i < experimentCount; ++i) v = new Array(bufferLength);
				console.timeEnd("BufPool vs Array - new - Array");

				console.time("BufPool vs Array - new - Array (push)");
				for (let i = 0; i < experimentCount; ++i) { v = []; v.push(i); }
				console.timeEnd("BufPool vs Array - new - Array (push)");

				console.time("BufPool vs Array - hold/release - BufPool");
				const bp = new BufPool(null, bufferLength);
				for (let i = 0; i < experimentCount; ++i) { v = bp.hold(); bp.release(v); }
				console.timeEnd("BufPool vs Array - hold/release - BufPool");

				const subExperimentCount = experimentCount / 10;

				v = "";
				console.time("BufPool vs Array - string concatenation");
				for (let i = 0; i < subExperimentCount; ++i) v += "a";
				console.timeEnd("BufPool vs Array - string concatenation");

				const arr = new Array(10);
				const resizeFactor = 3;
				console.time("BufPool vs Array - auto-resize buffer");
				for (let i = 0; i < subExperimentCount; ++i) { if (arr.length <= i) { arr.length = Math.ceil(arr.length * resizeFactor); } arr.push("a"); }
				v = arr.join("");
				console.timeEnd("BufPool vs Array - auto-resize buffer");

				const buff = buf(subExperimentCount + 1);
				console.time("BufPool vs Array - string buffer");
				for (let i = 0; i < subExperimentCount; ++i) { buff.push("a"); ++buff.count; }
				v = buff.slice(0, buff.count).join("");
				console.timeEnd("BufPool vs Array - string buffer");
			}
			finally
			{
				PB_DEBUG = original_PB_DEBUG;
			}
		}

		//	conclusion: auto-growth too slow to be practical
		if (test["Array - resize and auto-grow"])
		{
			const experimentCount = 10000000;
			const startElementCount = 6;
			const totalElementCount = 150;
			const growFactor = 3;

			let v, arr;

			const original_PB_DEBUG = PB_DEBUG;
			PB_DEBUG = false;
			try
			{
				console.time("Array - resize and auto-grow - control loop");
				for (let i = 0; i < experimentCount; ++i) for (let j = 0; j < totalElementCount; ++j);
				console.timeEnd("Array - resize and auto-grow - control loop");

				console.time("Array - resize and auto-grow - set");
				for (let i = 0; i < experimentCount; ++i)
				{
					arr = new Array(startElementCount);
					for (let j = 0; j < totalElementCount; ++j) arr[j] = j;
				}
				console.timeEnd("Array - resize and auto-grow - set");

				console.time("Array - resize and auto-grow - auto grow");
				for (let i = 0; i < experimentCount; ++i)
				{
					arr = new Array(startElementCount);
					for (let j = 0; j < totalElementCount; ++j)
					{
						if (j >= arr.length) arr.length *= growFactor;
						arr[j] = j;
					}
				}
				console.timeEnd("Array - resize and auto-grow - auto grow");
			}
			finally
			{
				PB_DEBUG = original_PB_DEBUG;
			}
		}

		//	conslusion: recursive function calls are the cheapest way to maintain nested iterations over sparse arrays and object properties
		if (test["Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time"])
		{
			const experimentCount = 10000;
			const arraySize = 10000;

			const arr = new Array(arraySize);
			arr.fill(0);
			const obj = new Object();
			for (let i = 0; i < arraySize; ++i) obj["a" + i] = 0;

			let vv;
			function f(i = 0)
			{
				if (i === 1)
				{
					i = i + 2;
					return i;
				}
				return f(i + 1);
			}

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - control loop");
			for (let i = 0; i < experimentCount; ++i);
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - control loop");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array.forEach");
			for (let i = 0; i < experimentCount; ++i) arr.forEach((v, i) => { if (i === 1) vv = v + 1; else vv = v + 2; } );
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array.forEach");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array.entries (Array)");
			for (let i = 0; i < experimentCount; ++i) for (let coll = Array.from(arr.entries()), length = coll.length, i = 0; i < length; ++i) { if (i === 1) vv = coll[i][1] + 1; else vv = coll[i][1] + 2; };
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array.entries (Array)");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array.entries (Object) *10");
			for (let i = 0; i < experimentCount / 10; ++i) for (let coll = Array.from(Object.entries(obj)), length = coll.length, i = 0; i < length; ++i) { if (i === 1) vv = coll[i][1] + 1; else vv = coll[i][1] + 2; };
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array.entries (Object) *10");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array indexer");
			for (let i = 0; i < experimentCount; ++i) for (let length = arr.length, i = 0; i < length; ++i) { if (i === 1) vv = arr[i] + 1; else vv = arr[i] + 2; };
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - Array indexer");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - for-in (Array)");
			for (let i = 0; i < experimentCount; ++i) for (const key in arr) { if (i === 1) vv = arr[key] + 1; else vv = arr[key] + 2; };
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - for-in (Array)");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - for-in (Object)");
			for (let i = 0; i < experimentCount; ++i) for (const key in obj) { if (i === 1) vv = obj[key] + 1; else vv = obj[key] + 2; };
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - for-in (Object)");

			console.time("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - function call time");
			for (let i = 0; i < experimentCount * arraySize; ++i) vv = f();
			console.timeEnd("Array.forEach vs Array.entries vs Array indexer vs for-in vs function call time - function call time");
		}

		//	conslusion: the wrapper is negligable
		if (test["Wrapper function"])
		{
			const experimentCount = 500000000;

			function f(a, b, c)
			{
				switch (a)
				{
					case 1: return a + b + c;
					case 2: return a + b - c;
					case 3: return a - b - c;
					case 4: return -a - b - c;
				}
				return a + b + c;
			}

			const wf = (a, b, c) => f(a + b + c);

			let v;

			console.time("Wrapper function - control loop");
			for (let i = 0; i < experimentCount; ++i);
			console.timeEnd("Wrapper function - control loop");

			console.time("Wrapper function - no wrapper");
			for (let i = 0; i < experimentCount; ++i) v = f(i, i + 1, i + 2);
			console.timeEnd("Wrapper function - no wrapper");

			console.time("Wrapper function - wrapper");
			for (let i = 0; i < experimentCount; ++i) v = wf(i, i + 1, i + 2);
			console.timeEnd("Wrapper function - wrapper");
		}

		//	conclusion: subclassing comes at a significant instantiation performance cost; array subclassing is still the fastest way to extend an array
		//		- in firefox instantialtion of subclassed arrays is 10x slower than instatiation of arrays, which is pretty slow by itself
		if (test["Inheritance"])
		{
			const experimentCount = 500000000;

			class A { get a() { return 1; } }

			class B extends A { get b() { return 2; } }

			class C extends B { get c() { return 3; } }

			class AA { get a() { return 1; } get b() { return 2; } }

			class AAA { get a() { return 1; } get b() { return 2; } get c() { return 3; } }

			class Arr extends Array { constructor() { super() } get b() { return 2; } }

			class Arr2 { constructor() { this._buffer = new Array(); } get b() { return 2; } }

			let v;

			console.time("Inheritance - control loop");
			for (let i = 0; i < experimentCount; ++i);
			console.timeEnd("Inheritance - control loop");

			console.time("Inheritance - object literal");
			for (let i = 0; i < experimentCount; ++i) v = {};
			console.timeEnd("Inheritance - object literal");

			console.time("Inheritance - class");
			for (let i = 0; i < experimentCount; ++i) v = new AAA();
			console.timeEnd("Inheritance - class");

			console.time("Inheritance - subclass");
			for (let i = 0; i < experimentCount; ++i) v = new B();
			console.timeEnd("Inheritance - subclass");

			console.time("Inheritance - subclass of subclass");
			for (let i = 0; i < experimentCount; ++i) v = new C();
			console.timeEnd("Inheritance - subclass of subclass");

			console.time("Inheritance - array");
			for (let i = 0; i < experimentCount; ++i) v = [];
			console.timeEnd("Inheritance - array");

			console.time("Inheritance - array subclass");
			for (let i = 0; i < experimentCount; ++i) v = new Arr();
			console.timeEnd("Inheritance - array subclass");

			console.time("Inheritance - array container");
			for (let i = 0; i < experimentCount; ++i) v = new Arr2();
			console.timeEnd("Inheritance - array container");
		}

		//	conclusion: Object.prototype.hasOwnProperty is ~500x slower than === void 0 and Number.isInteger()
		if (test["porop value vs Object.prototype.hasOwnProperty"])
		{
			const experimentCount = 500000000;

			const obj1 = [], obj2 = [];
			obj1.count = 0;

			let v;

			console.time("porop value vs Object.prototype.hasOwnProperty - control loop");
			for (let i = 0; i < experimentCount; ++i);
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - control loop");

			console.time("porop value vs Object.prototype.hasOwnProperty - obj1.count === void 0");
			for (let i = 0; i < experimentCount; ++i) v = (obj1.count === void 0);
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - obj1.count === void 0");

			console.time("porop value vs Object.prototype.hasOwnProperty - obj2.count === void 0");
			for (let i = 0; i < experimentCount; ++i) v = (obj2.count === void 0);
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - obj2.count === void 0");

			console.time("porop value vs Object.prototype.hasOwnProperty - Number.isInteger(obj1.count)");
			for (let i = 0; i < experimentCount; ++i) v = Number.isInteger(obj1.count);
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - Number.isInteger(obj1.count)");

			console.time("porop value vs Object.prototype.hasOwnProperty - Number.isInteger(obj2.count)");
			for (let i = 0; i < experimentCount; ++i) v = Number.isInteger(obj2.count);
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - Number.isInteger(obj2.count)");

			console.time("porop value vs Object.prototype.hasOwnProperty - Object.prototype.hasOwnProperty(obj1, 'count') / 1000");
			for (let i = 0; i < experimentCount / 1000; ++i) v = Object.prototype.hasOwnProperty(obj1, "count");
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - Object.prototype.hasOwnProperty(obj1, 'count') / 1000");

			console.time("porop value vs Object.prototype.hasOwnProperty - Object.prototype.hasOwnProperty(obj2, 'count') / 1000");
			for (let i = 0; i < experimentCount / 1000; ++i) v = Object.prototype.hasOwnProperty(obj2, "count");
			console.timeEnd("porop value vs Object.prototype.hasOwnProperty - Object.prototype.hasOwnProperty(obj2, 'count') / 1000");
		}

		//	conclusion: see the code and the code comments below
		//		- `traverseDelta(subject, traverseDelta_jsonVisitor)` is 30% slower than `function replacer(key, value) { return value; }; JSON.stringify(subject, replacer);`
		if (test["Graph Traverse vs Buffered Traverse"])
		{
			const experimentCount = 25000;

			class SampleFabric
			{
				static Countable = Symbol("C");
				static Uncountable = Symbol("U");
				static Atom = Symbol("A");

				getType(value)
				{
					if (value instanceof Array) return SampleFabric.Countable;
					if (value instanceof Object) return SampleFabric.Uncountable;
					return SampleFabric.Atom;
				}

				static the = new SampleFabric();

				newCountable(count)
				{
					return new Array(count);
				}

				newUncountable()
				{
					return {};
				}
			}

			function traverseDelta(value, visit)
			{
				let pathLength = -1, visitedPathLength = 0;
				++pathLength;
				const type = SampleFabric.the.getType(value);
				visit(type, value);
				visitedPathLength = pathLength;
				if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
				else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
				--pathLength;
				visit(null, null, pathLength - visitedPathLength);

				function _traverse(value, label, labelType)
				{
					++pathLength;
					const type = SampleFabric.the.getType(value);
					visit(type, value, pathLength - visitedPathLength - 1, label, labelType);
					visitedPathLength = pathLength;
					if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
					else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
					--pathLength;
				}
			}

			//	CHOSEN WALKER: traverseDelta2
			function traverseDelta2(value, visit)
			{
				let pathLength = -1, visitedPathLength = 0;
				++pathLength;
				const type = SampleFabric.the.getType(value);
				visit(null, value, type);
				visitedPathLength = pathLength;
				if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
				else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
				--pathLength;
				visit(pathLength - visitedPathLength);

				function _traverse(value, label, labelType)
				{
					++pathLength;
					const type = SampleFabric.the.getType(value);
					visit(pathLength - visitedPathLength - 1, value, type, label, labelType);
					visitedPathLength = pathLength;
					if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
					else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
					--pathLength;
				}
			}

			function traverseDeltaRV(value, visit)
			{
				let pathLength = -1, visitedPathLength = 0;
				++pathLength;
				const type = SampleFabric.the.getType(value);
				if (visit(type, value) === false) return;
				visitedPathLength = pathLength;
				if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
				else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
				--pathLength;
				visit(null, null, pathLength - visitedPathLength);

				function _traverse(value, label, labelType)
				{
					++pathLength;
					const type = SampleFabric.the.getType(value);
					if (visit(type, value, pathLength - visitedPathLength - 1, label, labelType) === false) return;
					visitedPathLength = pathLength;
					if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
					else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
					--pathLength;
				}
			}

			//	CHOSEN WALKER: traverseDelta2
			function traverseDelta2RV(value, visit)
			{
				let pathLength = -1, visitedPathLength = 0;
				++pathLength;
				const type = SampleFabric.the.getType(value);
				if (visit(null, value, type) === false) return;
				visitedPathLength = pathLength;
				if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
				else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
				--pathLength;
				visit(pathLength - visitedPathLength);

				function _traverse(value, label, labelType)
				{
					++pathLength;
					const type = SampleFabric.the.getType(value);
					if (visit(pathLength - visitedPathLength - 1, value, type, label, labelType) === false) return;
					visitedPathLength = pathLength;
					if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, SampleFabric.Countable);
					else if (type === SampleFabric.Uncountable) for (const key in value) _traverse(value[key], key, SampleFabric.Uncountable);
					--pathLength;
				}
			}

			//	traverseDeltaEx provides extra metadata to the visitor at the price of 10-20% performance penalty
			function traverseDeltaEx(value, visit)
			{
				let pathLength = -1, visitedPathLength = 0;
				++pathLength;
				const type = SampleFabric.the.getType(value);
				visit(null, value, type);
				visitedPathLength = pathLength;
				if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, i, length, SampleFabric.Countable);
				else if (type === SampleFabric.Uncountable)
				{
					let i = 0, cur = null;
					for (const key in value)
					{
						if (i === 0)
						{
							++i;
							cur = key;
							continue;
						}
						_traverse(value[cur], cur, i - 1, false, SampleFabric.Uncountable);
						++i;
						cur = key;
					}
					if (cur) _traverse(value[cur], cur, i - 1, true, SampleFabric.Uncountable);
				}
				--pathLength;
				visit(pathLength - visitedPathLength);

				function _traverse(value, label, ordinal, tailLengthOrIsLast, labelType)
				{
					++pathLength;
					const type = SampleFabric.the.getType(value);
					visit(pathLength - visitedPathLength - 1, value, type, label, labelType, ordinal, tailLengthOrIsLast);
					visitedPathLength = pathLength;
					if (type === SampleFabric.Countable) for (let length = value.length, i = 0; i < length; ++i) _traverse(value[i], i, i, length, SampleFabric.Countable);
					else if (type === SampleFabric.Uncountable)
					{
						let i = 0, cur = null;
						for (const key in value)
						{
							if (i === 0)
							{
								++i;
								cur = key;
								continue;
							}
							_traverse(value[cur], cur, i - 1, false, SampleFabric.Uncountable);
							++i;
							cur = key;
						}
						if (cur) _traverse(value[cur], cur, i - 1, true, SampleFabric.Uncountable);
					}
					--pathLength;
				}
			}

			let target, trace;
			function traverseDelta_cloningVisitor(valueType, value, diffOut, label, labelType)
			{
				if (diffOut === void 0)	//	root
				{
					if (valueType === SampleFabric.Atom)
					{
						target = value;
						return;
					}
					trace = BufPool.the.hold();
					if (valueType === SampleFabric.Uncountable) trace[0] = SampleFabric.the.newUncountable();
					else trace[0] = SampleFabric.the.newCountable(value.length);
					++trace.count;
					return;
				}
				if (label === void 0)	//	unroot
				{
					if (!trace) return;
					target = JSON.stringify(trace[0]);
					trace = BufPool.the.release(trace);
					return;
				}
				trace.count += diffOut;
				if (valueType === SampleFabric.Uncountable) trace[trace.count] = trace[trace.count - 1][label] = SampleFabric.the.newUncountable();
				else if (valueType === SampleFabric.Countable) trace[trace.count] = trace[trace.count - 1][label] = SampleFabric.the.newCountable(value.length);
				else trace[trace.count - 1][label] = value;
				++trace.count;
			}
			let closings, visited = new Set();
			function traverseDelta_jsonVisitor(valueType, value, diffOut, label, labelType)
			{
				if (diffOut === void 0)	//	root
				{
					if (valueType === SampleFabric.Atom)
					{
						target = JSON.stringify(value);
						return;
					}
					closings = "";
					visited.clear();
					visited.add(value);
					if (valueType === SampleFabric.Countable)
					{
						target = "[";
						closings = "]";
					}
					else
					{
						target = "{";
						closings = "}";
					}
					return;
				}
				if (label === void 0)	//	unroot
				{
					if (!closings) return;
					target += closings;
					return;
				}
				if (diffOut === -1)
				{
					target += ",";
				}
				if (diffOut !== 0)
				{
					target += closings.substring(0, -diffOut - 1);
					closings = closings.substring(-diffOut - 1, closings.length);
					target += ",";
				}
				if (valueType === SampleFabric.Countable)
				{
					if (visited.has(value)) throw new Error(`Circular reference.`);
					visited.add(value);
					if (labelType === SampleFabric.Uncountable)
					{
						target += JSON.stringify(label);
						target += ":[";
					}
					else
					{
						target += "[";
					}
					closings = "]" + closings;
				}
				else if (valueType === SampleFabric.Uncountable)
				{
					if (visited.has(value)) throw new Error(`Circular reference.`);
					visited.add(value);
					if (labelType === SampleFabric.Uncountable)
					{
						target += JSON.stringify(label);
						target += ":{";
					}
					else
					{
						target += "{";
					}
					closings = "}" + closings;
				}
				else
				{
					if (labelType === SampleFabric.Uncountable)
					{
						target += JSON.stringify(label);
						target += ":";
					}
					target += JSON.stringify(value);
				}
			}
			const cursorBufferLength = 6;
			let cursor;
			//	CHOSEN CURSOR: Lean
			function traverseDeltaEx_rawBuilerVisitor_Lean(diffOut, value, valueType, label, labelType)
			{
				if (valueType === void 0)	//	unroot
				{
					if (!cursor) return;
					target[target.count] = cursor;
					++target.count;
					return;
				}
				if (labelType === void 0)	//	root
				{
					if (valueType === SampleFabric.Atom)
					{
						cursor = null;
						target = [value];
						return;
					}
					cursor = buf(cursorBufferLength);
					cursor[0] = valueType;
					cursor[1] = null;
					cursor.count = 2;
					target = buf();
					return;
				}
				if (diffOut === -1)				//	keeping the same depth; cursor points either to an atom or an empty composite
				{
					//	add the previous finding to the result, including empty composites
					target[target.count] = cursor;
					++target.count;
					const count = cursor.count;
					cursor = cursor.concat();
					cursor.count = count;
					cursor[cursor.count - 1] = label;
					if (valueType === SampleFabric.Atom) cursor[cursor.count - 2] = value;
					else cursor[cursor.count - 2] = valueType;
					return;
				}
				if (diffOut === 0)				//	dipping in; cursor points to a non-empty composite
				{
					cursor[cursor.count + 1] = label;
					if (valueType === SampleFabric.Atom) cursor[cursor.count] = value;
					else cursor[cursor.count] = valueType;
					cursor.count += 2;
					return;
				}
				//	add the previous finding to the result, including empty composites
				target[target.count] = cursor;
				++target.count;
				const count = cursor.count;
				cursor = cursor.concat();
				cursor.count = count;
				//	climb
				cursor.count += 2 * (diffOut + 1);	//	climbing
				cursor[cursor.count - 1] = label;
				if (valueType === SampleFabric.Atom) cursor[cursor.count - 2] = value;
				else cursor[cursor.count - 2] = valueType;
			}

			const subject =
			[
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
				{ a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3, e: [{ a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }, { a: "a" }, { b: "b" }, { c: "c" }] } } } },
			];

			let v1, v2, v3;
			function visitDelta(pathLength, value, diffOut, label) { v1 = value; v2 = label; v3 = diffOut; }

			const original_PB_DEBUG = PB_DEBUG;
			PB_DEBUG = false;
			try
			{
				console.time("Graph Traverse vs Buffered Traverse - control loop");
				for (let i = 0; i < experimentCount; ++i) v1 = v2 = 1;
				console.timeEnd("Graph Traverse vs Buffered Traverse - control loop");

				console.time("Graph Traverse vs Buffered Traverse - traverseDelta");
				for (let i = 0; i < experimentCount; ++i) v1 = traverseDelta(subject, visitDelta);
				console.timeEnd("Graph Traverse vs Buffered Traverse - traverseDelta");

				console.time("Graph Traverse vs Buffered Traverse - traverseDelta2 rawBuilerVisitor - Lean Cursor Format");
				for (let i = 0; i < experimentCount; ++i) v1 = traverseDelta2(subject, traverseDeltaEx_rawBuilerVisitor_Lean);
				console.timeEnd("Graph Traverse vs Buffered Traverse - traverseDelta2 rawBuilerVisitor - Lean Cursor Format");


				console.time("Graph Traverse vs Buffered Traverse - clone - traverseDelta");
				for (let i = 0; i < experimentCount; ++i) v1 = traverseDelta(subject, traverseDelta_cloningVisitor);
				console.timeEnd("Graph Traverse vs Buffered Traverse - clone - traverseDelta");

				console.time("Graph Traverse vs Buffered Traverse - clone - traverseDeltaRV");
				for (let i = 0; i < experimentCount; ++i) v1 = traverseDeltaRV(subject, traverseDelta_cloningVisitor);
				console.timeEnd("Graph Traverse vs Buffered Traverse - clone - traverseDeltaRV");

				console.time("Graph Traverse vs Buffered Traverse - clone - JSON.parse(JSON.stringify())");
				for (let i = 0; i < experimentCount; ++i) v1 = JSON.parse(JSON.stringify(subject));
				console.timeEnd("Graph Traverse vs Buffered Traverse - clone - JSON.parse(JSON.stringify())");


				console.time("Graph Traverse vs Buffered Traverse - JSON - traverseDelta");
				for (let i = 0; i < experimentCount; ++i) v1 = traverseDelta(subject, traverseDelta_jsonVisitor);
				console.timeEnd("Graph Traverse vs Buffered Traverse - JSON - traverseDelta");

				console.time("Graph Traverse vs Buffered Traverse - JSON - traverseDeltaRV");
				for (let i = 0; i < experimentCount; ++i) v1 = traverseDeltaRV(subject, traverseDelta_jsonVisitor);
				console.timeEnd("Graph Traverse vs Buffered Traverse - JSON - traverseDeltaRV");

				console.time("Graph Traverse vs Buffered Traverse - JSON - JSON.stringify()");
				for (let i = 0; i < experimentCount; ++i) v1 = JSON.stringify(subject);
				console.timeEnd("Graph Traverse vs Buffered Traverse - JSON - JSON.stringify()");

				function replacer(key, value) { return value; }
				console.time("Graph Traverse vs Buffered Traverse - JSON - JSON.stringify() with replacer");
				for (let i = 0; i < experimentCount; ++i) v1 = JSON.stringify(subject, replacer);
				console.timeEnd("Graph Traverse vs Buffered Traverse - JSON - JSON.stringify() with replacer");


				console.log(911, v1, v2, v3);
			}
			finally
			{
				PB_DEBUG = original_PB_DEBUG;
			}
		}
	}
}

module.exports.PerformanceTests = module.exports;
