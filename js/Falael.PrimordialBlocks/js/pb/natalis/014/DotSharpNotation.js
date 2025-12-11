//	R0Q3?/daniel/20240528
//	- TODO: consider using a fabric to determine if a label should be encoded/decoded as a countable or uncountanle, and not `LiteralType.isString(value)` and `LiteralType.isInteger(value)`
//		- would require js parsing instead of regular expressions; test performance, may be fall back to regular expressions if using the default fabric
//	- OPT: there might be possible better-performing implementations (e.g. w/ no regular expressions); extensive testing is required to establish the optimal implementation

"use strict";

const { LiteralType, CallableType } = require("-/pb/natalis/000/Native.js");
const { Runtime } = require("-/pb/natalis/000/Runtime.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");
const { buf, isBuf } = require("-/pb/natalis/013/Compound.js"); 

const encodeComponent_dotBackslashReplace = /[.\\#]/g;
const decodeComponent_dotBackslashReplace = /\\(.)/g;
const parse_indexerSequenceMatch = /([^\\]|^)#\d+$/g;

const parse_unescapedDotSplit = Runtime.supports("RegExp:lookbehind") ? new RegExp("(?<!\\\\)\\.") : null;				//	post ECMAScript 2018 regex (not supported by earlier babel and hence react native versions)
const parse_indexerSplit = Runtime.supports("RegExp:lookbehind") ? new RegExp("(?<!\\\\)#") : null;						//	post ECMAScript 2018 regex (not supported by earlier babel and hence react native versions)

let splitPath_byDelimiter = Runtime.supports("RegExp:lookbehind") ? path => path.split(parse_unescapedDotSplit) : path => _split(path, '.');
let splitPath_byIndexer = Runtime.supports("RegExp:lookbehind") ? path => path.split(parse_indexerSplit) : path => _split(path, '#');

if (PB_DEBUG)
{
	if (Runtime.supports("RegExp:lookbehind"))
	{
		splitPath_byDelimiter = path =>
		{
			const result = path.split(parse_unescapedDotSplit);
			if (JSON.stringify(result) !== JSON.stringify(_split(path, '.'))) throw new Exception(0xC20FC9, `Invalid operation.`);
			return result;
		}
		splitPath_byIndexer = path =>
		{
			const result = path.split(parse_indexerSplit);
			if (JSON.stringify(result) !== JSON.stringify(_split(path, '#'))) throw new Exception(0xE2BD90, `Invalid operation.`);
			return result;
		}
	}
}

module.exports =

//	Class: Provides utilities for encoding, decoding, parsing and formatting of graph cursor paths to/from dot-sharp notation.
class DotSharpNotation
{
	//	Function: `encodeComponent(value: string | integer): string | integer` - encodes `value` into a dot-sharp notation component.
	//	Parameter: `value: string | integer` - the value to encode.
	//	Returns: `value` encoded into a dot-sharp notation component - an integer or a string.
	//	Remarks:
	//		If `value` is an integer it's returned verbatimly; otherwise dot-sharp-specific encoding is performed on a `value` string and the result is returned.
	//		If `value === ""` the string "\\0" is returned.
	static encodeComponent(value)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(value) && !LiteralType.isInteger(value)) throw new ArgumentException(0xDBB433, "value", value);
		}
		if (value.length === 0) return "\\0";
		if (LiteralType.isInteger(value)) return value;
		return value.replace(encodeComponent_dotBackslashReplace, "\\$&");
	}

	//	Function: `decodeComponent(value: string | integer): string | integer` - decodes `value` as a dot-sharp notation component.
	//	Parameter: `value: string | integer` - the value to decode.
	//	Returns: `value` decoded as a dot-sharp notation component - an integer or a string.
	//	Remarks:
	//		If `value` is an integer it will be returned verbatimly; otherwise dot-sharp-specific decoding will be performed on a `value` string and the result will be returned.
	//		If `value === "\\" || value === "\\0"` an empty string will be returned.
	static decodeComponent(value)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(value) && !LiteralType.isInteger(value)) throw new ArgumentException(0x99CF25, "value", value);
		}
		if (LiteralType.isInteger(value) || value === "\\") return value;
		if (value === "\\0" || value === "") return "";
		if (value.indexOf('\\') === -1) return value;
		return value.replace(decodeComponent_dotBackslashReplace, "$1");
	}

	//	Function: `parse(path: string | integer | null, targetOrNew: buf | null, offsetInTarget: integer): buf` - parses `path` and returns the parsed elements either appended to the `buf` passed
	//		 as `targetOrNew` or a new `buf` if `targetOrNew` is `null`.
	//	Parameter: `path: string | integer | null` - the path to parse in dot-sharp notation; an integer value represents a path consisting of a single countable label;
	//		a `null` value represents an empty path.
	//	Parameter: `targetOrNew: buf | null` - a `buf` to hold the parsed elements or `null`, in which case a new `buf` will be created and returned.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result.
	//	Returns: If `path === null` returns `targetOrNew` even if it's `null`, otherwise returns the parsed elements either appended to the `buf` passed as `targetOrNew` or a new `buf` if `targetOrNew` is `null`.
	//	Remarks:
	//		The `path === null` test causes the function to return `targetOrNew` if set, otherwise `null`.
	//		The `path.length === 0 || path === "\\0"` test causes the function to return the `"\\0"` uncountable label as a single result element.
	//		The `path === "\\"` test causes the function to return the `"\\"` uncountable label as a single result element.
	//		Countable components it are passed as integers. Uncountable components are passed as strings.
	//		If `path` is integer, it's treated as containing a single countable component and is returned as is as a single result element.
	//	Performance:
	//		This version of the function uses split via regular expressions, which is expected to be a slow operation. In the future,
	//			implementing another version of the function is suggested that uses a parsing automation. Because such implementation would iterate
	//			through the input in native JavaScript code, it's not immediately clear whether it would necessarily yield better performance results.
	//		The suggestions above are purely speculative because no actual performance measuremuents were performed.
	static parse(path, targetOrNew = null, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(path) && !LiteralType.isInteger(path) && path !== null) throw new ArgumentException(0xA84F54, "path", path);
			if (targetOrNew !== null && !isBuf(targetOrNew)) throw new ArgumentException(0x5C15E3, "targetOrNew", targetOrNew);
			if (!LiteralType.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x63D5BB, "offsetInTarget", offsetInTarget);
		}
		if (path === null) { return targetOrNew; }
		if (!targetOrNew) targetOrNew = buf();
		targetOrNew.count = offsetInTarget;
		if (LiteralType.isInteger(path)) { targetOrNew[targetOrNew.count] = path; ++targetOrNew.count; return targetOrNew; }
		if (path.length === 0 || path === "\\0") { targetOrNew[targetOrNew.count] = "\\0"; ++targetOrNew.count; return targetOrNew; }
		if (path === "\\") { targetOrNew[targetOrNew.count] = "\\"; ++targetOrNew.count; return targetOrNew; }
		const intermeditate = splitPath_byDelimiter(path);
		for (let length = intermeditate.length, i = 0; i < length; ++i)
		{
			const item = intermeditate[i];
			const match1 = item.match(parse_indexerSequenceMatch);
			if (match1 === null) { targetOrNew[targetOrNew.count] = item; ++targetOrNew.count; continue; }
			const parts = splitPath_byIndexer(item);
			const part0 = parts[0];
			if (part0 !== "") { targetOrNew[targetOrNew.count] = part0; ++targetOrNew.count; }
			else if (i !== 0) { targetOrNew[targetOrNew.count] = ""; ++targetOrNew.count; }
			for (let jlength = parts.length, j = 1; j < jlength; ++j) { targetOrNew[targetOrNew.count] = parseInt(parts[j]); ++targetOrNew.count; }
		}
		return targetOrNew;
	}

	//	Function: `parseHof(path: string | integer | null, encodedComponentCallback: function(encodedComponent: string | integer): void): void` - parses `path` and yields the resulting encoded components
	//		as arguments of `encodedComponentCallback` calls.
	//	Parameter: `path: string | integer | null` - the path to parse in dot-sharp notation; an integer value represents a path consisting of a single countable label;
	//		a `null` value represents an empty path.
	//	Parameter: `encodedComponentCallback: function(component: string | integer): void` - a callback to invoke for every parsed component; `component` is passed in encoded form.
	//	Remarks:
	//		The `path === null` test causes the function to return immediately without invoking `encodedComponentCallback`.
	//		The `path.length === 0 || path === "\\0"` test causes the function to invoke `encodedComponentCallback` once with the `"\\0"` uncountable label.
	//		The `path === "\\"` test causes the function to invoke `encodedComponentCallback` once with the `"\\"` uncountable label.
	//		Countable components it are passed as integers. Uncountable components are passed as strings.
	//		If `path` is integer, it's treated as containing a single countable component and is passed as is, in a single `encodedComponentCallback` call.
	//		"Hof" in the function name stands for "High Order Function" indicating that this version requires a callback to operate.
	//	Performance:
	//		This version of the function invokes a callback to yield results, which is expected to be a slow operation. `DotSharpNotation.parse` uses a `buf` to store the parsed elements instead
	//			and is presumably recommended before `DotSharpNotation.parseHof`.
	//		This version of the function uses split via regular expressions, which is expected to be a slow operation. In the future,
	//			implementing another version of the function is suggested that offers a more optimized interface and uses a parsing automation. Because such implementation would iterate
	//			through the input in native JavaScript code, it's not immediately clear whether it would necessarily yield better performance results.
	//		The suggestions above are purely speculative because no actual performance measuremuents were performed.
	static parseHof(path, encodedComponentCallback)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(path) && !LiteralType.isInteger(path) && path !== null) throw new ArgumentException(0x66D578, "path", path);
			if (!CallableType.isFunction(encodedComponentCallback)) throw new ArgumentException(0x363504, "encodedComponentCallback", encodedComponentCallback);
		}
		if (LiteralType.isInteger(path)) { encodedComponentCallback(path); return; }
		if (path === null) { return; }
		if (path.length === 0 || path === "\\0") { encodedComponentCallback("\\0"); return; }
		if (path === "\\") { encodedComponentCallback("\\"); return; }
		const intermeditate = splitPath_byDelimiter(path);
		for (let length = intermeditate.length, i = 0; i < length; ++i)
		{
			const item = intermeditate[i];
			const match1 = item.match(parse_indexerSequenceMatch);
			if (match1 === null) { encodedComponentCallback(item); continue; }
			const parts = splitPath_byIndexer(item);
			const part0 = parts[0];
			if (part0 !== "") encodedComponentCallback(part0);
			else if (i !== 0) encodedComponentCallback("");
			for (let jlength = parts.length, j = 1; j < jlength; ++j) encodedComponentCallback(parseInt(parts[j]));
		}
	}

	//	Function: `append(path: string | integer | null, encodedComponent: string | integer): string | integer` - appends `encodedComponent` to `path`.
	//	Parameter: `path: string | integer | null` - the path to append to; an integer value represents a path consisting of a single countable label; a `null` value represents an empty path.
	//	Parameter: `encodedComponent: string | integer` - the encoded component to append to `path`; an integer value represents a countable label.
	//	Returns: A path representing `path` with appended `encodedComponent`.
	//	Remarks:
	//		Examples
	//		- `path: null, encodedComponent: 1` -> `1`
	//		- `path: null, encodedComponent: ""` -> `"\\0"`
	//		- `path: null, encodedComponent: "\\0"` -> `"\\0"`
	//		- `path: null, encodedComponent: "a"` -> `"a"`
	//		- `path: null, encodedComponent: "#0"` -> `"#0"`
	//		- `path: "", encodedComponent: 1` -> `\\0#1`
	//		- `path: "", encodedComponent: ""` -> `"."`
	//		- `path: "", encodedComponent: "\\0"` -> `"."`
	//		- `path: "", encodedComponent: "a"` -> `".a"`
	//		- `path: "", encodedComponent: "#0"` -> `"\\0#0"`
	//		- `path: 0, encodedComponent: 1` -> `"#0#1"`
	//		- `path: 0, encodedComponent: ""` -> `"#0."`
	//		- `path: 0, encodedComponent: "\\0"` -> `"#0."`
	//		- `path: 0, encodedComponent: "a"` -> `"#0.a"`
	//		- `path: 0, encodedComponent: "#1"` -> `"#0#1"`
	//		- `path: "\\0", encodedComponent: 1` -> `"\\0#1"`
	//		- `path: "\\0", encodedComponent: ""` -> `"."`
	//		- `path: "\\0", encodedComponent: "\\0"` -> `"."`
	//		- `path: "\\0", encodedComponent: "a"` -> `".a"`
	//		- `path: "\\0", encodedComponent: "#0"` -> `"\\0#0"`
	//		- `path: "a", encodedComponent: 1` -> `"a#1"`
	//		- `path: "a", encodedComponent: ""` -> `"a."`
	//		- `path: "a", encodedComponent: "\\0"` -> `"a."`
	//		- `path: "a", encodedComponent: "b"` -> `"a.b"`
	//		- `path: "a", encodedComponent: "#0"` -> `"a#0"`
	//		- `path: ".", encodedComponent: 1` -> `".#1"`
	//		- `path: ".", encodedComponent: ""` -> `".."`
	//		- `path: ".", encodedComponent: "\\0"` -> `".."`
	//		- `path: ".", encodedComponent: "a"` -> `"..a"`
	//		- `path: ".", encodedComponent: "#0"` -> `".#0"`
	//		- `path: "a.", encodedComponent: 1` -> `"a.#1"`
	//		- `path: "a.", encodedComponent: ""` -> `"a.."`
	//		- `path: "a.", encodedComponent: "\\0"` -> `"a.."`
	//		- `path: "a.", encodedComponent: "b"` -> `"a..b"`
	//		- `path: "a.", encodedComponent: "#0"` -> `"a.#0"`
	//	Performance:
	//		Using string concatenation in JavaScript (v8, SpiderMonkey) is faster than the `Array.join` alternative.
	static append(path, encodedComponent)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(path) && !LiteralType.isInteger(path) && path !== null) throw new ArgumentException(0x9B443F, "path", path);
			if (!LiteralType.isString(encodedComponent) && !LiteralType.isInteger(encodedComponent)) throw new ArgumentException(0x2AE609, "encodedComponent", encodedComponent);
		}
		if (LiteralType.isInteger(encodedComponent))
		{
			if (path === null) return encodedComponent;
			if (LiteralType.isInteger(path)) return `#${path}#${encodedComponent}`;
			if (path.length === 0 || path === "\\0") return `\\0#${encodedComponent}`;
			return `${path}#${encodedComponent}`;
		}
		if (path === null)
		{
			if (encodedComponent.length === 0 || encodedComponent === "\\0") return "\\0";
			return `${encodedComponent}`;
		}
		if (LiteralType.isInteger(path))
		{
			if (encodedComponent.length === 0 || encodedComponent === "\\0") return `#${path}.`;
			if (encodedComponent[0] === "#") return `#${path}${encodedComponent}`;
			return `#${path}.${encodedComponent}`;
		}
		if (path.length === 0 || path === "\\0")
		{
			if (encodedComponent.length === 0 || encodedComponent === "\\0") return ".";
			if (encodedComponent[0] === "#") return `\\0${encodedComponent}`;
			return `.${encodedComponent}`;
		}
		if (encodedComponent.length === 0 || encodedComponent === "\\0") return `${path}.`;
		if (encodedComponent[0] === "#") return `${path}${encodedComponent}`;
		return `${path}.${encodedComponent}`;
	}
}

/////////////////////////////////////////////////
//	_split
const State_Input = Symbol("State_Input");
const State_EscapeSequence = Symbol("State_EscapeSequence");

function _split(path, delimiter)
{
	if (path.length === 0) return [""];

	const result = [];

	let state = State_Input;
	const splitPoints = [];

	for (let length = path.length, i = 0; i < length; ++i)
	{
		const c = path[i];
		switch (state)
		{
			case State_Input:
				switch (c)
				{
					case '\\': state = State_EscapeSequence; continue;
					case delimiter: splitPoints.push(i); continue;
					default: continue;
				}
			case State_EscapeSequence: state = State_Input; continue;
			default:
				throw new Exception(0x6DEE73, `Not implemented.`);
		}
	}

	let anchor = 0;
	for (let length = splitPoints.length, i = 0; i < length; ++i)
	{
		const offset = splitPoints[i];
		result.push(path.substr(anchor, offset - anchor));
		anchor = offset + 1;
	}

	result.push(path.substr(anchor));
	return result;
}

module.exports.DotSharpNotation = module.exports;