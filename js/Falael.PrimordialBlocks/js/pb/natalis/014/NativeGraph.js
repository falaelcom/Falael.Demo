//	R0Q2?/daniel/20231001
//	- TODO: reimagine `count` as a vertex `outdegree` function (counting the number of arcs starting from the provided vertex);
//			consider adding a corresponding `indegree` funciton (counting the number of arcs ending with the provided vertex within a graph given by a graph root);
//			consider adding also a pair of functions listing the outgoing and incoming arcs analogous to the `indegree` and `outdegree` functions
//	- TODO: implement support for `.toJSON`, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
//	- TEST:
//		- `NativeGraph.Visitors.transcribe::state.traceBuf`
//		- `NativeGraph.Visitors.transcribe::state.traceBufPool`
//		- `NativeGraph.transcribe::traceBuf`
//		- `NativeGraph.transcribe::traceBufPool`
//		- `NativeGraph.Visitors.select::state.traceBuf`
//		- `NativeGraph.Visitors.select::state.traceBufPool`
//		- `NativeGraph.select::traceBuf`
//		- `NativeGraph.select::traceBufPool`
//	- DOC
"use strict";

const { Type, CallableType, Unset } = require("-/pb/natalis/000/Native.js");
const { Enum } = require("-/pb/natalis/011/Enum.js");
const { CircularReferenceException, ArgumentException, NotImplementedException, ReturnValueException } = require("-/pb/natalis/003/Exception.js");
const { Fabric, Cardinality } = require("-/pb/natalis/013/Fabric.js");
const { Compound, buf, isBuf, BufPool } = require("-/pb/natalis/013/Compound.js"); 

const visited_buf = buf();
const copy_state = {};
const select_state = {};

const SELECT_REUSE = 1;
const SELECT_NEW = 2;
const SELECT_DISCARD = 3;

module.exports =

//	Class: Provides functions related to exploration and manipulation of graphs as defined by a `Fabric`.
class NativeGraph
{
	static Compare =
	{
		lexical(l, r) { return l.localeCompare(r); },
		lexicalDesc(l, r) { return r.localeCompare(l); },
		length(l, r) { return l.length - r.length; },
		lengthDesc(l, r) { return r.length - l.length; },
	};

	static Visitors =
	{
		json(state, deltaOut, head, headCardinality, label, labelCardinality)
		{
			if (PB_DEBUG)
			{
				if (!Type.isObject(state)) throw new ArgumentException(0xC5B882, "state", state);
				if (!Type.isNU(state.visited) && !Compound.isBuf(state.visited)) throw new ArgumentException(0x12B323, "state.visited", state.visited);
				if (deltaOut !== void 0 && deltaOut !== null && !Type.isInteger(deltaOut)) throw new ArgumentException(0x4D9019, "deltaOut", deltaOut);
				if (headCardinality !== void 0 && !Enum.hasValue(Cardinality, headCardinality)) throw new ArgumentException(0x18FCBE, "headCardinality", headCardinality);
				if (labelCardinality !== void 0 && !Enum.hasValue(Cardinality, labelCardinality)) throw new ArgumentException(0x207EB6, "labelCardinality", labelCardinality);
			}
			if (headCardinality === void 0)	//	unroot
			{
				if (!state.closings) return true;
				state.target += state.closings;
				return true;
			}
			if (labelCardinality === void 0)	//	root
			{
				if (headCardinality === Cardinality.Zero)
				{
					state.target = JSON.stringify(head);
					return true;
				}
				state.closings = "";
				state.visited && (state.visited[state.visited.count] = head, ++state.visited.count);
				if (headCardinality === Cardinality.AlephNull)
				{
					state.target = "[";
					state.closings = "]";
				}
				else
				{
					state.target = "{";
					state.closings = "}";
				}
				return true;
			}
			if (label.constructor !== String && (label.constructor !== Number || !Number.isInteger(label)))
			{
				return true;	//	JSON supports only integer and string properties regardless of the specific Fabric implementation
			}
			if (deltaOut === 1)				//	keeping the same depth
			{
				if (state.visited && headCardinality !== Cardinality.Zero)
				{
					if (state.visited.lastIndexOf(head, state.visited.count - 2) !== -1) throw new CircularReferenceException(0x12B0AA);
					if (state.lastHeadCardinality !== Cardinality.Zero) state.visited[state.visited.count - 1] = head;
					else (state.visited[state.visited.count] = head, ++state.visited.count);
				}
				if (state.lastHeadCardinality !== Cardinality.Zero)
				{
					state.target += state.closings.substring(0, 1);
					state.closings = state.closings.substring(1, state.closings.length);
				}
				state.target += ",";
			}
			else if (deltaOut !== 0)	//	climbing
			{
				state.visited.count -= deltaOut - 1;
				if (state.visited && headCardinality !== Cardinality.Zero)
				{
					if (state.visited.lastIndexOf(head, state.visited.count - 1) !== -1) throw new CircularReferenceException(0xDC81D7);
					(state.visited[state.visited.count] = head, ++state.visited.count);
				}
				state.target += state.closings.substring(0, deltaOut - 1);
				state.closings = state.closings.substring(deltaOut - 1, state.closings.length);
				state.target += ",";
			}
			else						//	dipping in
			{
				if (state.visited && headCardinality !== Cardinality.Zero)
				{
					if (state.visited.lastIndexOf(head, state.visited.count - 1) !== -1) throw new CircularReferenceException(0x90AC92);
					(state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			state.lastHeadCardinality = headCardinality;
			if (headCardinality === Cardinality.AlephNull)
			{
				if (labelCardinality === Cardinality.AlephOne)
				{
					state.target += JSON.stringify(label);
					state.target += ":[";
				}
				else
				{
					state.target += "[";
				}
				state.closings = "]" + state.closings;
			}
			else if (headCardinality === Cardinality.AlephOne)
			{
				if (labelCardinality === Cardinality.AlephOne)
				{
					state.target += JSON.stringify(label);
					state.target += ":{";
				}
				else
				{
					state.target += "{";
				}
				state.closings = "}" + state.closings;
			}
			else
			{
				if (labelCardinality === Cardinality.AlephNull)
				{
					if (head === void 0 || Type.isSymbol(head)) state.target += "null";
					else state.target += JSON.stringify(head);
					return true;
				}
				if (labelCardinality === Cardinality.AlephOne)
				{
					if (head === void 0 || Type.isSymbol(head)) return true;
					state.target += JSON.stringify(label);
					state.target += ":";
				}
				state.target += JSON.stringify(head);
			}
			return true;
		},

		transcribe(state, deltaOut, head, headCardinality, label, labelCardinality)
		{
			if (PB_DEBUG)
			{
				if (!Type.isObject(state)) throw new ArgumentException(0x388A2E, "state", state);
				if (!Type.isNU(state.visited) && !Compound.isBuf(state.visited)) throw new ArgumentException(0x8010E5, "state.visited", state.visited);
				if (!(state.fabric instanceof Fabric)) throw new ArgumentException(0x4E1BFF, "state.fabric", state.fabric);
				if (!Type.isNU(state.traceBuf) && !isBuf(state.traceBuf)) throw new ArgumentException(0xED8DCD, "state.traceBuf", state.traceBuf);
				if (!Type.isNU(state.traceBufPool) && !(state.traceBufPool instanceof BufPool)) throw new ArgumentException(0xECE59C, "state.traceBufPool", state.traceBufPool);
				if (!Type.isNU(state.traceBuf) && !Type.isNU(state.traceBufPool)) throw new ArgumentException(0x6206C6, "state.traceBuf, state.traceBufPool", { traceBuf: state.traceBuf, traceBufPool: state.traceBufPool });
				if (deltaOut !== void 0 && deltaOut !== null && !Type.isInteger(deltaOut)) throw new ArgumentException(0x117B89, "deltaOut", deltaOut);
				if (headCardinality !== void 0 && !Enum.hasValue(Cardinality, headCardinality)) throw new ArgumentException(0xFF778E, "headCardinality", headCardinality);
				if (labelCardinality !== void 0 && !Enum.hasValue(Cardinality, labelCardinality)) throw new ArgumentException(0x9A648E, "labelCardinality", labelCardinality);
			}
			if (headCardinality === void 0)	//	unroot
			{
				if (!state.trace) return true;
				state.target = state.trace[0];
				(!state.traceBuf) && (state.traceBufPool || BufPool.the).release(state.trace);
				return true;
			}
			if (labelCardinality === void 0)	//	root
			{
				if (headCardinality === Cardinality.Zero)
				{
					state.target = head;
					return true;
				}
				state.trace = state.traceBuf || (state.traceBufPool || BufPool.the).hold();
				if (headCardinality === Cardinality.AlephOne) state.trace[0] = state.fabric.newUncountable();
				else state.trace[0] = state.fabric.newCountable(head.length);
				state.trace.count = 1;
				state.visited && (state.visited[0] = head, state.visited.count = 1);
				return true;
			}
			let existing, reuseExisting = false;
			if (deltaOut === 1)				//	keeping the same depth
			{
				if (state.visited)
				{
					let index;
					if ((index = state.visited.lastIndexOf(head, state.visited.count - 2)) !== -1) { existing = state.trace[index]; reuseExisting = true };
					if (state.lastHeadCardinality !== Cardinality.Zero) state.visited[state.visited.count - 1] = head;
					else (state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			else if (deltaOut !== 0)	//	climbing
			{
				if (state.visited)
				{
					state.visited.count -= deltaOut;
					let index;
					if ((index = state.visited.lastIndexOf(head, state.visited.count - 1)) !== -1) { existing = state.trace[index]; reuseExisting = true };
					(state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			else						//	dipping in
			{
				if (state.visited)
				{
					let index;
					if ((index = state.visited.lastIndexOf(head, state.visited.count - 1)) !== -1) { existing = state.trace[index]; reuseExisting = true };
					(state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			state.trace.count -= deltaOut;
			if (headCardinality === Cardinality.AlephOne) state.trace[state.trace.count] = state.trace[state.trace.count - 1][label] = reuseExisting ? existing : state.fabric.newUncountable();
			else if (headCardinality === Cardinality.AlephNull) state.trace[state.trace.count] = state.trace[state.trace.count - 1][label] = reuseExisting ? existing : state.fabric.newCountable(head.length);
			else state.trace[state.trace.count - 1][label] = head;
			++state.trace.count;
			return reuseExisting ? false : true;
		},

		select(state, deltaOut, head, headCardinality, label, labelCardinality)
		{
			if (PB_DEBUG)
			{
				if (!Type.isObject(state)) throw new ArgumentException(0x2E7C64, "state", state);
				if (!Type.isNU(state.visited) && !Compound.isBuf(state.visited)) throw new ArgumentException(0x6EC24E, "state.visited", state.visited);
				if (state.labelDefsType !== null && state.labelDefsType !== Type.Array && state.labelDefsType !== Type.Callable) throw new ArgumentException(0xD26C2B, "state.labelDefsType", state.labelDefsType);
				if (state.labelDefsType === Type.Array && !Type.isArray(state.labelDefs)) throw new ArgumentException(0x59094C, "state.labelDefsType, state.labelDefs", { labelDefsType: state.labelDefsType, labelDefs: state.labelDefs });
				if (state.labelDefsType === Type.Callable && !Type.isCallable(state.labelDefs)) throw new ArgumentException(0x31BE0A, "state.labelDefsType, state.labelDefs", { labelDefsType: state.labelDefsType, labelDefs: state.labelDefs });
				if (state.labelDefsType === Type.Array) for (let length = state.labelDefs.length, i = 0; i < length; ++i) if (!Type.isString(state.labelDefs[i]) && !Type.isInteger(state.labelDefs[i]) && !CallableType.isFunction(state.labelDefs[i])) throw new ArgumentException(0xFCE804, `state.labelDefs[${i}]`, state.labelDefs[i]);
				if (state.labelDefsType === null && !Type.isString(state.labelDefs) && !Type.isInteger(state.labelDefs)) throw new ArgumentException(0xE907D6, "state.labelDefs", state.labelDefs);
				if (!Type.isNU(state.traceBuf) && !isBuf(state.traceBuf)) throw new ArgumentException(0x22B8FE, "state.traceBuf", state.traceBuf);
				if (!Type.isNU(state.traceBufPool) && !(state.traceBufPool instanceof BufPool)) throw new ArgumentException(0x9DC154, "state.traceBufPool", state.traceBufPool);
				if (!Type.isNU(state.traceBuf) && !Type.isNU(state.traceBufPool)) throw new ArgumentException(0xBBE202, "state.traceBuf, state.traceBufPool", { traceBuf: state.traceBuf, traceBufPool: state.traceBufPool });
				if (!Type.isBoolean(state.inverted)) throw new ArgumentException(0x462F68, "state.inverted", state.inverted);
				if (!(state.fabric instanceof Fabric)) throw new ArgumentException(0xFEAE53, "state.fabric", state.fabric);
				if (deltaOut !== void 0 && deltaOut !== null && !Type.isInteger(deltaOut)) throw new ArgumentException(0xF93F9F, "deltaOut", deltaOut);
				if (headCardinality !== void 0 && !Enum.hasValue(Cardinality, headCardinality)) throw new ArgumentException(0xDC63D4, "headCardinality", headCardinality);
				if (labelCardinality !== void 0 && !Enum.hasValue(Cardinality, labelCardinality)) throw new ArgumentException(0x14332A, "labelCardinality", labelCardinality);
			}
			if (headCardinality === void 0)	//	unroot
			{
				if (!state.trace) return true;
				state.target = state.trace[0];
				(!state.traceBuf) && (state.traceBufPool || BufPool.the).release(state.trace);
				return true;
			}
			if (labelCardinality === void 0)	//	root
			{
				if (headCardinality === Cardinality.Zero)
				{
					state.target = head;
					return true;
				}
				state.trace = state.traceBuf || (state.traceBufPool || BufPool.the).hold();
				if (headCardinality === Cardinality.AlephOne) state.trace[0] = state.fabric.newUncountable();
				else state.trace[0] = state.fabric.newCountable(head.length);
				state.trace.count = 1;
				state.visited && (state.visited[0] = head, state.visited.count = 1);
				return true;
			}
			let isMatch = state.inverted;
			{
				if (state.labelDefsType === null) isMatch = state.inverted ? state.labelDefs !== label : state.labelDefs === label;
				else if (state.labelDefsType === Type.Callable)
				{
					const outcome = state.labelDefs(label, head);
					if (PB_DEBUG)
					{
						if (!Type.isBoolean(outcome)) throw new ReturnValueException(0x9B1313, `state.labelDefs(${JSON.stringify(label)}, <head>)`, outcome);
					}
					isMatch = state.inverted ? !outcome : outcome;
				}
				else for (let coll = state.labelDefs, length = coll.length, i = 0; i < length; ++i)
				{
					const item = coll[i];
					if (Type.isCallable(item))
					{
						const outcome = item(label, head);
						if (PB_DEBUG)
						{
							if (!Type.isBoolean(outcome)) throw new ReturnValueException(0xC51E75, `state.labelDefs[${i}](${JSON.stringify(label)}, <head>)`, outcome);
						}
						if (outcome) isMatch = !state.inverted;
					}
					else if (item === label) { isMatch = !state.inverted; }
					if (isMatch !== state.inverted) break;
				}
			}
			let existing, instruction = isMatch ? SELECT_NEW : SELECT_DISCARD;
			if (deltaOut === 1)				//	keeping the same depth
			{
				if (state.visited)
				{
					if (isMatch)
					{
						let index;
						if ((index = state.visited.lastIndexOf(head, state.visited.count - 2)) !== -1) { existing = state.trace[index]; instruction = SELECT_REUSE };
					}
					if (state.lastHeadCardinality !== Cardinality.Zero) state.visited[state.visited.count - 1] = head;
					else (state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			else if (deltaOut !== 0)	//	climbing
			{
				if (state.visited)
				{
					state.visited.count -= deltaOut;
					if (isMatch)
					{
						let index;
						if ((index = state.visited.lastIndexOf(head, state.visited.count - 1)) !== -1) { existing = state.trace[index]; instruction = SELECT_REUSE };
					}
					(state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			else						//	dipping in
			{
				if (state.visited)
				{
					if (isMatch)
					{
						let index;
						if ((index = state.visited.lastIndexOf(head, state.visited.count - 1)) !== -1) { existing = state.trace[index]; instruction = SELECT_REUSE };
					}
					(state.visited[state.visited.count] = head, ++state.visited.count);
				}
			}
			state.trace.count -= deltaOut;
			switch (instruction)
			{
				case SELECT_REUSE:
					if (headCardinality === Cardinality.AlephOne) state.trace[state.trace.count] = state.trace[state.trace.count - 1][label] = existing;
					else if (headCardinality === Cardinality.AlephNull) state.trace[state.trace.count] = state.trace[state.trace.count - 1][label] = existing;
					else state.trace[state.trace.count - 1][label] = head;
					++state.trace.count;
					return false;
				case SELECT_NEW:
					if (headCardinality === Cardinality.AlephOne) state.trace[state.trace.count] = state.trace[state.trace.count - 1][label] = state.fabric.newUncountable();
					else if (headCardinality === Cardinality.AlephNull) state.trace[state.trace.count] = state.trace[state.trace.count - 1][label] = state.fabric.newCountable(head.length);
					else state.trace[state.trace.count - 1][label] = head;
					++state.trace.count;
					return true;
				case SELECT_DISCARD:
					++state.trace.count;
					return false;
				default: throw new NotImplementedException(0x81CD97);
			}
		},
	};

	//	Function: Count the properties in a primitive object or the items in a primitive array or string. This is the primitive and more optimal version of the `count*` family of methods.
	//	Parameter: `value` - any primitive value that is not `null` or undefined.
	//	Returns: The number of properties in a primitive object or items in a primitive array or string.
	//	Remarks:
	//		For primitive objects and their proxies, returns the number of object's properties.
	//		For primitive arrays, returns the array's length.
	//		For strings, returns the string's length.
	//		For any other `value` type throws an `"Argument is invalid"` exception.
	//		For the built-in global objects (`Math, Atomics, Reflect, Intl, WebAssembly, JSON`), the result is unpredictable.
	//	Exception: `ArgumentException`.
	static count(value)
	{
		if (PB_DEBUG)
		{
			if (value === void 0) throw new ArgumentException(0x76267D, "value", value);
			if (value === null) throw new ArgumentException(0x1690DA, "value", value);
			if (value !== value) throw new ArgumentException(0x9C3B30, "value", value);
		}
		if (Array.isArray(value)) return value.length;
		if (!value.constructor || value.constructor === Object) return Object.keys(value).length;
		if (value.constructor === String) return value.length;
		if (PB_DEBUG)
		{
			throw new ArgumentException(0xAC8E01, "value", value);
		}
		return 0;
	}

	//	Function: `transcribe(value: any, fabric: Fabric, visitedBuf: buf | Unset)` - performs a deep copy of an object, gracefully handling circular references and unknown types. This operation is designed to be asymmetric and may result in a non-identical copy
	//		of an object, depending on the JavaScript features used to compose `value` and the provided `fabric`.
	//	Parameter: `value` - any value.
	//	Parameter: `fabric: Fabric` - defaults to `Fabric.the`; if set, overrides the default (`Fabric`) implementation of graph traversal and new graph vertex creation.
	//	Parameter: `visitedBuf: buf | Unset` - defaults to a static `buf` instance; if set to a `buf`, will be used as the internal storage for all vertices visited during function's 
	//		execution; if set to `Unset` the handling of circular references will be disabled increasing performance while removing the safeguards against infinite recursion.
	//	Returns: A deep copy of `value`.
	//  Sanity: Tested against prototype pollution.
	//	Exception: `ArgumentException`.
	static transcribe(value, fabric = null, visitedBuf = null, traceBuf = null, traceBufPool = null)
	{
		if (PB_DEBUG)
		{
			//	-- `value` can be anything
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x709B5C, "fabric", fabric);
			if (visitedBuf !== Unset && !Type.isNU(visitedBuf) && !isBuf(visitedBuf)) throw new ArgumentException(0x23C097, "visitedBuf", visitedBuf);
			if (!Type.isNU(traceBuf) && !isBuf(traceBuf)) throw new ArgumentException(0xF3406B, "traceBuf", traceBuf);
			if (!Type.isNU(traceBufPool) && !(traceBufPool instanceof BufPool)) throw new ArgumentException(0x24F88B, "traceBufPool", traceBufPool);
			if (!Type.isNU(traceBuf) && !Type.isNU(traceBufPool)) throw new ArgumentException(0x73F2D4, "traceBuf, traceBufPool", { traceBuf, traceBufPool });
		}

		copy_state.trace = null;
		traceBuf && (copy_state.traceBuf = traceBuf);
		traceBufPool && (copy_state.traceBufPool = traceBufPool);
		copy_state.fabric = fabric || Fabric.the;
		copy_state.target = void 0;
		copy_state.visited = visitedBuf !== Unset ? visitedBuf || ((visited_buf.count = 0), visited_buf) : null;
		return Fabric.the.walk(NativeGraph.Visitors.transcribe, copy_state, value).target;
	}

	//	Function: `select(value: any, labelDefs: string | integer | function | [string | integer | function], inverted: boolean, fabric: Fabric, visitedBuf: buf)` - includes
	//		into the resulting graph all vertices at labels that are present in (or with `inverted === true` missing from) the `labelDefs` argument or tested positively by a
	//		`labelDefs` function.
	//	Parameter: `value` - any value.
	//	Parameter: `labelDefs: string | integer | [string | integer]` - required; depending on type defines the following selection criteria:
	//		- `string` - selects only vertices at labels equal to `labelDefs` uncountable label;
	//		- `integer` - selects only vertices at labels equal to `labelDefs` countable label;
	//		- `function` - selects only vertices at labels for which `labelDefs(label) === true`;
	//		- `[string | integer | function]` - selects only vertices at labels present in the `labelDefs` array or tested positively by a function-element of `labelDefs` (i.e.
	//			`labelDefs[n](label) === true`).
	//	Parameter: `inverted: boolean` - optional, defaults to `false`; inverts the selection.
	//	Parameter: `fabric: Fabric` - defaults to `Fabric.the`; if set, overrides the default (`Fabric`) implementation of graph traversal and new graph vertex creation.
	//	Parameter: `visitedBuf: buf | Unset` - defaults to a static `buf` instance; if set to a `buf`, will be used as the internal storage for all vertices visited during function's
	//		execution; if set to `Unset` the handling of circular references will be disabled increasing performance while removing the safeguards against infinite recursion.
	//	Returns: A graph containing all vertices at labels that are present in (or with `inverted === true` missing from) the `labelDefs` argument.
	//	Remarks: `labelDefs` string values are interpreted as uncountable labels.
	//	Usage:
	//		- `select({ a: { b: 1 }, c: 2 }, "a") === { a: {} }`
	//		- `select({ a: { b: 1 }, c: 2 }, "b") === {}`
	//		- `select({ a: { b: 1 }, c: 2 }, ["a", "b"]) === { a: { b: 1 } }`
	//		- `select({ a: { b: 1 }, c: 2 }, ["a", "b", "c"]) === { a: { b: 1 }, c: 2 }`
	//		- `select({ a: { b: 1 }, c: 2 }, label => label === "a" || label === "b" || label === "c") === { a: { b: 1 }, c: 2 }`
	//	Exception: `ArgumentException`.
	//	Exception: `NotImplementedException`.
	//	Exception: `ReturnValueException`.
	static select(value, labelDefs, inverted = false, fabric = null, visitedBuf = null, traceBuf = null, traceBufPool = null)
	{
		if (PB_DEBUG)
		{
			//	-- `value` can be anything
			if (!Type.isString(labelDefs) && !Type.isInteger(labelDefs) && !CallableType.isFunction(labelDefs) && !Type.isArray(labelDefs)) throw new ArgumentException(0xD5145C, "labelDefs", labelDefs);
			if (Type.isArray(labelDefs)) for (let length = labelDefs.length, i = 0; i < length; ++i) if (!Type.isString(labelDefs[i]) && !Type.isInteger(labelDefs[i]) && !CallableType.isFunction(labelDefs[i])) throw new ArgumentException(0x70515B, `labelDefs[${i}]`, labelDefs[i]);
			if (!Type.isBoolean(inverted)) throw new ArgumentException(0x8C9427, "inverted", inverted);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0xA3A066, "fabric", fabric);
			if (visitedBuf !== Unset && !Type.isNU(visitedBuf) && !isBuf(visitedBuf)) throw new ArgumentException(0x2DDDC8, "visitedBuf", visitedBuf);
			if (!Type.isNU(traceBuf) && !isBuf(traceBuf)) throw new ArgumentException(0xD60C96, "traceBuf", traceBuf);
			if (!Type.isNU(traceBufPool) && !(traceBufPool instanceof BufPool)) throw new ArgumentException(0xC36976, "traceBufPool", traceBufPool);
			if (!Type.isNU(traceBuf) && !Type.isNU(traceBufPool)) throw new ArgumentException(0x10B2FE, "traceBuf, traceBufPool", { traceBuf, traceBufPool });
		}

		select_state.trace =traceBuf ||  null;
		traceBuf && (select_state.traceBuf = traceBuf);
		traceBufPool && (select_state.traceBufPool = traceBufPool);
		select_state.labelDefs = labelDefs;
		select_state.labelDefsType = Type.isArray(labelDefs) ? Type.Array : Type.isCallable(labelDefs) ? Type.Callable : null;
		select_state.inverted = inverted;
		select_state.fabric = fabric || Fabric.the;
		select_state.target = void 0;
		select_state.visited = visitedBuf !== Unset ? visitedBuf || ((visited_buf.count = 0), visited_buf) : null;
		return Fabric.the.walk(NativeGraph.Visitors.select, select_state, value).target;
	}
}

module.exports.NativeGraph = module.exports;