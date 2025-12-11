//	R0Q2/daniel/20220427
//		- DOC
//		- FIX: seems that probes removed from the code are not removed from the cached results
"use strict";

let _pristine = true;

const _info = { name: null };
const _caps =
{
	"GlobalObject": null,
	"GlobalObject:global": null,
	"GlobalObject:window": null,
	"Process": null,
	"Process:stdout": null,
	"Process:stderr": null,
	"Process:hrtime": null,
	"performance": null,
	"performance:now": null,
	"Timer:HR": null,
	"BigInt": null,
	"Atomics": null,
	"Intl": null,
	"WebAssembly": null,
	"AsyncGeneratorFunction:indication": null,		//	react native/babel-specific problem
	"AsyncFunction:indication": null,				//	react native/babel-specific problem
	"AsyncGeneratorFunction:bind:indication": null,	//	react native/babel-specific problem
	"AsyncFunction:bind:indication": null,			//	react native/babel-specific problem
	"Class:indication": null,						//	react native/babel-specific problem
	"RegExp:lookbehind": null,						//	react native/babel-specific problem
	"Array.concat::preserveType": null,				//	react native/babel-specific problem
};

let _standard = {}, _scaler_probeDurationMs;
let _temp;	//	temp is reported as not used by the development environment, but in fact it's being used for a bogus assignment, see its reference below

module.exports =
{
	configure(par)
	{
		if (PB_DEBUG)
		{
			if (!par) throw new Error(`0xECDC14 Argument is invalid: "par".`);
			for (const key in par) if (par[key] !== true && par[key] !== false) throw new Error(`0xAEC834 Argument is invalid: "par.${key}".`);
		}

		if (_pristine) _evaluate();
		Object.assign(_caps, par);
	},

	supports(key)
	{
		if (_caps[key] === void 0) throw new Error(`0x492ACC Argument is invalid: "key".`);
		if (_pristine) _evaluate();
		if (_caps[key] === null) throw new Error(`0xDFC87A Invalid operation.`);
		return _caps[key];
	},

	//	Function: `caps({ query: "all" | "supported" | "unsupported", acknowledge: [<string>] }): [<string>]` - queries the runtime caps and returns a list of cap string identifiers
	//		matching the `query` and ignoring all ids occuring in `acknowledge`.
	//	Parameter: `query: "all" | "supported" | "unsupported"` - optional, defaults to `"all"`; specifies what cap ids to include in the result:
	//		- `"all"` - all except for ids occuring in `acknowledge`; mostly suitable for diagnostic purposes, for Ex. for examining the full set of caps that have been evaluated and
	//			configured via `Runtime.configure()`.
	//		- `"supported"` - the ids of all supported caps except for the ids occuring in `acknowledge`;
	//		- `"unsupported"` - the ids of all unsupported caps except for the ids occuring in `acknowledge`.
	//	Parameter: `acknowledge: [<string>]` - a list of caps to skip in the result.
	//	Returns: returns a list of cap string identifiers matching the `query` and ignoring all ids occuring in `acknowledge`.
	//	Remarks:
	//		Caps are evaluated only once on the first `Runtime.configure()` or `Runtime.caps()` function call, and the results are cached for later use.
	//		Acknowledging allows the programmer to disable reporting of unsupported caps after investigating and mitigating the effect on their code of every unsupported cap.
	//			This way if for any reason the supported status of a cap changes because any of the reasons listed below, or a new cap is added to Primordial Blocks that appears to be
	//			unsuported, the programmer will be alerted in a timely manner. Reasons for changing the supported status of a cap:
	//			- The runtime environment has changed, for Ex. a new version of babel has been released that translates an ECMA Script feature in a new, unexpected way that breaks a cap test;
	//			- The source code has been run on a runtime environment it's not been designed for.
	//	Usage:
	//		Sample for a web browser:
	//		```
	//			const unsupported = require("-/pb/natalis/000/Runtime.js").caps({ query: "unsupported", acknowledge: ["GlobalObject:global", "Process", "Process:stdout", "Process:stderr", "Process:hrtime"] });
	//			unsupported.length ? console.error(`Unsupported runtime caps:`, unsupported) : void 0;
	//		```
	//		Sample for nodejs:
	//		```
	//			const unsupported = require("-/pb/natalis/000/Runtime.js").caps({ query: "unsupported", acknowledge: ["GlobalObject:window"] });
	//			unsupported.length ? console.error(`Unsupported runtime caps:`, unsupported) : void 0;
	//		```
	caps({ query = "all", acknowledge = null })
	{
		if (PB_DEBUG)
		{
			if (query !== "all" && query !== "supported" && query !== "unsupported") throw new Error(`0x5CD20D Argument is invalid: "query".`);
			if (acknowledge !== null && !Array.isArray(acknowledge)) throw new Error(`0x9DA849 Argument is invalid: "acknowledge".`);
		}
		if (_pristine) _evaluate();
		if (query === "all") return acknowledge ?
			Object.keys(_caps).filter(v => acknowledge.indexOf(v) === -1) :
			Object.keys(_caps);
		return acknowledge ?
			Object.keys(_caps).filter(key => query === "supported" ? this.supports(key) : !this.supports(key)).filter(v => acknowledge.indexOf(v) === -1) :
			Object.keys(_caps).filter(key => query === "supported" ? this.supports(key) : !this.supports(key));
	},

	//	Function: `unitTest(...)` - for internal use; invoked directly from `/UnitTests/UnitTests.js`
	unitTest(unitTestClasses, testFailed, { disabledTests = null, acknowledged = null } = {})
	{
		if (PB_DEBUG)
		{
			if (!(testFailed instanceof Function)) throw new Error(`0xD9070A Argument is invalid: "testFailed".`);
		}

		let list = [];

		unitTestClasses.forEach(C => list = list.concat(Object.getOwnPropertyNames(C).filter(prop => prop.indexOf("unitTest_") === 0 && typeof C[prop] === "function").map(name => ({ C, name }))));

		let asyncTestPromises = [];
		for (let length = list.length, i = 0; i < length; ++i)
		{
			const { C, name } = list[i];
			const f = C[name];
			const proxy =
			{
				push(testInfo)
				{
					if (acknowledged && acknowledged.some(v => v === testInfo.testName)) return;
					testFailed(Object.assign({}, testInfo, { class: C.name, function: name }));
				}
			};
			if (disabledTests && disabledTests.indexOf(name) !== -1)
			{
				testFailed({ class: C.name, function: name, skipping: name });
				continue;
			}
			try
			{
				const asyncTests = [];
				f(proxy, asyncTests);
				asyncTestPromises = asyncTestPromises.concat(asyncTests.map(v => v()));
			}
			catch (ex)
			{
				testFailed({ class: C.name, function: name, ex });
			}
		}
		return asyncTestPromises;
	},

	async profile(feedback, profilingClasses, preloadedData, standardDurationMs)
	{
		let fullList = [];

		profilingClasses.forEach(C => fullList = fullList.concat(Object.getOwnPropertyNames(C)
			.filter(prop => prop.indexOf("probe_") === 0 && typeof C[prop] === "function")
			.map(name => ({ C, name, probeName: name.substring("probe_".length) }))
		));

		//	exclude preloaded results
		let list = fullList.filter(v => !(preloadedData && preloadedData[v.C.name] && preloadedData[v.C.name][v.probeName] !== void 0));

		//	filter out removed probes
		const resultData = {};
		const resultList = [];
		for (const className in preloadedData)
		{
			const group = preloadedData[className];
			for (const probeName in group)
			{
				if (!fullList.some(v => v.probeName === probeName)) continue;
				const value = group[probeName];
				(resultData[className] || (resultData[className] = {}))[probeName] = value;
				resultList.push(
				[
					className,
					probeName,
					{
						rating: value,
					}
				]);
			}
		}

		if (!list.length) return resultData || {};

		feedback.time(`[time] Operation`);

		feedback.info(`Calibrating profiler...`);
		feedback.trace(`    - benchmarking the standard...`);
		function standardProbe(experimentCount)
		{
			const begin = new Date().getTime();
			for (let i = 0; i < experimentCount; ++i);
			const end = new Date().getTime();
			return end - begin;
		}
		_standard = await _calibrateProbe(standardProbe, Math.round(standardDurationMs / 4), standardDurationMs);
		function scalerProbe(experimentCount)
		{
			let a;
			const begin = new Date().getTime();
			for (let i = 0; i < experimentCount; ++i) a = {};
			const end = new Date().getTime();
			_temp = a;
			return end - begin;
		}
		feedback.trace(`    - benchmarking the scaler...`);
		const _standard_scaleToStandard = _standard.scaleToStandard;
		const _standard_probeDurationMs = _standard.probeDurationMs;
		_standard.scaleToStandard = 1;
		_standard.probeDurationMs = 0;
		try
		{
			_scaler_probeDurationMs = scalerProbe(Math.round(_standard.experimentCount / 100)) * 100;
		}
		finally
		{
			_standard.scaleToStandard = _standard_scaleToStandard;	// eslint-disable-line
			_standard.probeDurationMs = _standard_probeDurationMs;	// eslint-disable-line
		}
		feedback.info(`Standard experiment count: ${_standard.experimentCount}`);
		feedback.info(`Standard probe duration: ${_standard.probeDurationMs}`);
		feedback.info(`Scaler probe duration: ${_scaler_probeDurationMs}`);
		feedback.info(`Performance rating: ${_standard.performanceRating}`);
		feedback.info(`Done.`);

		feedback.info(`Building performance profile...`);
		const akey = Symbol();
		feedback.begin(akey, 0, list.length);
		try
		{
			for (let length = list.length, i = 0; i < length; ++i)
			{
				const { C, name, probeName } = list[i];
				const f = C[name];
				const scale = C["scale_" + probeName];

				const fullProbeName = C.name + '.' + probeName;

				feedback.step(akey);
				feedback.progressInfo(akey, `Probing ${fullProbeName}...`);

				try
				{
					feedback.progressTrace(akey, `    - calibrating probe...`);

					let experimentCount;
					if (scale)
					{
						experimentCount = Math.round(_standard.experimentCount * scale);
						_standard.scaleToStandard = scale;
					}
					else
					{
						const calibrationInfo = await _calibrateProbe(f, Math.round(_standard.probeDurationMs / 4), _standard.probeDurationMs);
						experimentCount = calibrationInfo.experimentCount;
						_standard.scaleToStandard = calibrationInfo.experimentCount / _standard.experimentCount;	// eslint-disable-line
					}

					feedback.progressTrace(akey, `        - calibrated at scale ${Math.round(_standard.scaleToStandard * 1000) / 1000}`);
					feedback.progressTrace(akey, `    - running probe (${_standard.probeDurationMs} ms)...`);

					const begin = new Date().getTime();
					const probeDurationMs = await f(experimentCount);
					const end = new Date().getTime();

					feedback.progressTrace(akey, `    - experiment count: ${experimentCount}, running time: ${Math.round(end - begin)} ms, duration: ${Math.round(probeDurationMs)} ms`);

					const factor = probeDurationMs / (_scaler_probeDurationMs - _standard.probeDurationMs);
					const rating = factor < 0 ? 0 : factor;
					resultList.push(
					[
						C.name,
						probeName,
						{
							durationMs: Math.round(probeDurationMs),
							rating: Math.round(rating * 100) / 100,
						}
					]);
					feedback.progressInfo(akey, `Rating: ${Math.round(rating * 100) / 100}.`);
				}
				catch (ex)
				{
					feedback.error(ex);
					if (feedback.alert(0xE1222F, { class: C, function: name, probe: fullProbeName, ex }) === -1) break;	//	-1 === Feedback.Abort
				}
			}
			if (feedback.snapshot(akey).getPercent() < 100)
			{
				feedback.step(akey);
				feedback.progressTrace(akey);
			}
			feedback.trace(`Sorting result...`);

			resultList.sort((l, r) => l[2].rating - r[2].rating);
			const result = {};
			resultList.forEach(v =>
			{
				const group = result[v[0]] || (result[v[0]] = {});
				group[v[1]] = v[2].rating;
			});

			feedback.timeEnd(`[time] Operation`);
			feedback.info(`Done.`);
			return result;
		}
		finally
		{
			feedback.end(akey);
		}
	},

	get info()
	{
		if (_pristine) _evaluate();
		return _info;
	}
}

module.exports.profile.norm = function norm(durationMs)
{
	if (PB_DEBUG)
	{
		if (!Number.isFinite(durationMs)) throw new Error(`0x1E8E69 Argument is invalid: "durationMs" (${durationMs}).`);
	}
	return Math.round(durationMs / _standard.scaleToStandard - _standard.probeDurationMs);
}

async function _calibrateProbe(probe, calibrationDurationMs, probeTargetDurationMs)
{
	if (PB_DEBUG)
	{
		if (!Number.isInteger(probeTargetDurationMs) || probeTargetDurationMs < 1) throw new Error(`0x8A2D48 Argument is invalid: "probeTargetDurationMs".`);
		if (!Number.isInteger(calibrationDurationMs) || calibrationDurationMs < 1) throw new Error(`0x2FC44F Argument is invalid: "calibrationDurationMs".`);
	}

	const _standard_scaleToStandard = _standard.scaleToStandard;
	const _standard_probeDurationMs = _standard.probeDurationMs;
	_standard.scaleToStandard = 1;
	_standard.probeDurationMs = 0;
	try
	{

		//	calculate standard experiment count: a number of probe repetitions for which the probe running time roughly equals `probeStandardDurationMs`
		let durationMs = 0, count = 10;
		while (true)
		{
			const begin = new Date().getTime();
			await probe(count);
			const end = new Date().getTime();
			durationMs = end - begin;
			if (durationMs < 1) { durationMs = 1 }
			if (PB_DEBUG)
			{
				if (!Number.isFinite(durationMs) || durationMs < 1) throw new Error(`0x1E2D87 Invalid operation: ${durationMs}.`);
			}
			if (durationMs >= calibrationDurationMs) break;
			count = Math.ceil(count * calibrationDurationMs / durationMs);
		}

		const excessTimeFactor = calibrationDurationMs / durationMs;	//	<= 1
		const calibrationTimeFactor = probeTargetDurationMs / calibrationDurationMs;
		const calibratedCount = Math.round(
			count *							//	some number of standard experiments taking more than `calibrationDurationMs` in total to complete
			excessTimeFactor *				//	correction for the extra time over `calibrationDurationMs`
			calibrationTimeFactor			//	normalization upon `probeTargetDurationMs`
		);
		const result =
		{
			experimentCount: calibratedCount,
			probeDurationMs: probeTargetDurationMs,
			performanceRating: Math.round(calibratedCount / 10000 / probeTargetDurationMs),
		};
		return result;
	}
	finally
	{
		_standard.scaleToStandard = _standard_scaleToStandard;	// eslint-disable-line
		_standard.probeDurationMs = _standard_probeDurationMs;	// eslint-disable-line
	}
}

function _evaluate()
{
	if (!_pristine) throw new Error(`0x3BEED5 Invalid operation.`);

	let _globalObject;
	if (typeof __METRO_GLOBAL_PREFIX__ === "string")
	{
		_globalObject = global;
		_info.name = "react-native";
	}
	else if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]")
	{
		_globalObject = global;
		_info.name = "node";
	}
	else if (typeof window !== "undefined")
	{
		_globalObject = window;
		_info.name = "browser";
	}
	else _globalObject = null;

	_caps["GlobalObject"] = !!(_globalObject);
	_caps["GlobalObject:global"] = !!(typeof global !== "undefined");
	_caps["GlobalObject:window"] = !!(typeof window !== "undefined");
	_caps["Process"] = !!(typeof process !== "undefined");
	_caps["Process:stdout"] = !!(typeof process !== "undefined" && typeof process.stdout !== "undefined");
	_caps["Process:stderr"] = !!(typeof process !== "undefined" && typeof process.stdout !== "undefined");
	_caps["Process:hrtime"] = !!(typeof process !== "undefined" && typeof process.hrtime !== "undefined");
	_caps["performance"] = !!(typeof performance !== "undefined");
	_caps["performance:now"] = !!(typeof performance !== "undefined" && typeof performance.now !== "undefined");
	_caps["Timer:HR"] = _caps["Process:hrtime"] || _caps["performance:now"];
	_caps["BigInt"] = !!(_globalObject && _globalObject.BigInt);
	_caps["Atomics"] = !!(_globalObject && _globalObject.Atomics);
	_caps["Intl"] = !!(_globalObject && _globalObject.Intl);
	_caps["WebAssembly"] = !!(_globalObject && _globalObject.WebAssembly);
	try
	{
		const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
		_caps["AsyncFunction:indication"] = !!(new AsyncFunction() instanceof AsyncFunction) && !(new Function() instanceof AsyncFunction);
		_caps["AsyncFunction:bind:indication"] = !!((async function () { }.bind({})) instanceof AsyncFunction) && !((function () { }.bind({})) instanceof AsyncFunction);
	}
	catch (ex)
	{
		_caps["AsyncFunction:indication"] = false;
		_caps["AsyncFunction:bind:indication"] = false;
	}
	try
	{
		const GeneratorFunction = Object.getPrototypeOf(function* () { }).constructor;
		const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () { }).constructor;
		_caps["AsyncGeneratorFunction:indication"] = !!(new AsyncGeneratorFunction() instanceof AsyncGeneratorFunction) && !(new GeneratorFunction() instanceof AsyncGeneratorFunction);
		_caps["AsyncGeneratorFunction:bind:indication"] = !!((new AsyncGeneratorFunction().bind({})) instanceof AsyncGeneratorFunction) && !((new GeneratorFunction().bind({})) instanceof AsyncGeneratorFunction);
	}
	catch (ex)
	{
		_caps["AsyncGeneratorFunction:indication"] = false;
		_caps["AsyncGeneratorFunction:bind:indication"] = false;
	}
	try
	{
		function isClass(value)
		{
			//	keep in sync with "-/natalis/000/Runtime.js"
			if (value === void 0) return false;
			if (value === null) return false;
			if (value !== value) return false;
			if (Array.isArray(value)) return false;
			if (value.constructor !== Function || value.prototype === void 0 || value.prototype === null) return false;
			if (Function.prototype !== Object.getPrototypeOf(value)) return true;
			return value.prototype.constructor.toString().substring(0, 5) === "class";
		}

		const A1 = class { };
		const A2 = class A { };

		const C1 = class { };
		const C2 = class C { };
		const C3 = class extends A1 { };
		const C4 = class extends A2 { };
		const C5 = class C extends A1 { };
		const C6 = class C extends A2 { };

		const f1 = () => { };
		const f2 = function(){ };
		const f3 = new Function();

		_caps["Class:indication"] = 
			isClass(C1) &&
			isClass(C2) &&
			isClass(C3) &&
			isClass(C4) &&
			isClass(C5) &&
			isClass(C6) &&
			!isClass(f1) &&
			!isClass(f2) &&
			!isClass(f3);
	}
	catch (ex)
	{
		_caps["Class:indication"] = false;
	}

	try
	{
		_caps["RegExp:lookbehind"] = (!new RegExp("(?<!A)b").test("AbAb"));
	}
	catch (ex)
	{
		_caps["RegExp:lookbehind"] = false;
	}

	try
	{
		class A extends Array { }
		_caps["Array.concat::preserveType"] = new A().concat() instanceof A;
	}
	catch (ex)
	{
		_caps["Array.concat::preserveType"] = false;
	}

	for (const key in _caps) if (_caps[key] !== true && _caps[key] !== false) throw new Error(`0xD164E0 Invalid operation.`);

	_pristine = false;
}

module.exports.Runtime = module.exports;
Object.freeze(module.exports);
