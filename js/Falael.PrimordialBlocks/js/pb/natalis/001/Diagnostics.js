//	R0Q3?/daniel/20220608
//	- TODO: `value = value.slice` actually modifies the source `value` instance; replace with code that doesn't modify the source even at some performance price.
//	- DOC
"use strict";

const { Type, Unset } = require("-/pb/natalis/000/Native.js");

const CompoundStructureMarker = Symbol.for("CompoundStructureMarker");

const Verbatim = Symbol("Verbatim");

//	Class: Provides facilities for performing basic diagnostic operations.
const Diagnostics = module.exports =
{
	//	Field: A symbol for use as a specialized return value by implementations of the `format` callback of `Diagnostics.format`; a `Verbatim` value returned by the `format` callback
	//		instructs `Diagnostics.format` to continue operation as if no `format` callback has been specified.
	Verbatim,


	format(value, { verbose = false, inspect = null, format = null, sb = null, visited = null, container = null, key = Unset } = {})
	{
		return _formatValue(value, verbose, inspect, format, sb, visited, container, key);

		function _ip(value, rootConstructor)	//	inheritance path
		{
			if (value.constructor === rootConstructor)
			{
				if (rootConstructor === Array || rootConstructor === Object) return ``;
				return `${value.constructor.name}`;
			}
			if (!verbose)
			{
				if (rootConstructor === Array || rootConstructor === Object) return "/" + value.constructor.name;
				return rootConstructor.name + "/" + value.constructor.name;
			}
			const list = [];
			let cur = value.constructor;
			do
			{
				list.push(cur.name);
				cur = Object.getPrototypeOf(cur);
			}
			while (cur && cur !== Object.getPrototypeOf(Object) && cur !== rootConstructor);
			if (rootConstructor === Array || rootConstructor === Object) return "/" + list.reverse().join("/");
			return rootConstructor.name + "/" + list.reverse().join("/");
		}

		function _formatValue(value, verbose, inspect, format, sb = null, visited = null, container = null, key = Unset)
		{
			if (!sb) sb = "";
			const type = Type.getType(value);
			switch (type)
			{
				case Type.Array:
					visited = visited || new Map();
					if (visited.has(value))
					{
						if (value.constructor === Array)
						{
							if (value.length >= 2 && value[0] === CompoundStructureMarker)												//	CompoundStructure
							{
								sb += `&cost<${value[1].description || ""}>@${visited.get(value)}`;
							}
							else if (value.PB_compoundType !== void 0 && Number.isInteger(value.count))									//	CompoundBuf
							{
								if (verbose) sb += `&cbuf(${value.length})<${value.PB_compoundType.description || ""}>@${visited.get(value)}`; 
								else sb += `&cbuf<${value.PB_compoundType.description || ""}>@${visited.get(value)}`;
							}
							else if (value.PB_compoundType !== void 0)														//	CompoundArray
							{
								sb += `&carr<${value.PB_compoundType.description || ""}>@${visited.get(value)}`;
							}
							else if (Number.isInteger(value.count))																		//	Buf
							{
								if (verbose) sb += `&buf(${value.length})@${visited.get(value)}`;
								else sb += `&buf@${visited.get(value)}`;
							}
							else sb += `&Array@${visited.get(value)}`;
						}
						else sb += `&${_ip(value, Array)}@${visited.get(value)}`;
						return sb;
					}
					visited.set(value, sb.length);
					break;
				case Type.Object:
					visited = visited || new Map();
					if (visited.has(value))
					{
						sb += !value.constructor ? `&null@${visited.get(value)}` : value.constructor === Object ? `&Object@${visited.get(value)}` : `&${_ip(value, Object)}@${visited.get(value)}`;
						return sb;
					}
					visited.set(value, sb.length);
					break;
				case Type.Error:
					visited = visited || new Map();
					if (visited.has(value))
					{
						sb += `&${_ip(value, Error)}@${visited.get(value)}`;
						return sb;
					}
					visited.set(value, sb.length);
					break;
				case Type.Map:
					visited = visited || new Map();
					if (visited.has(value))
					{
						sb += `&${_ip(value, Map)}@${visited.get(value)}`;
						return sb;
					}
					visited.set(value, sb.length);
					break;
				case Type.Set:
					visited = visited || new Map();
					if (visited.has(value))
					{
						sb += `&${_ip(value, Set)}@${visited.get(value)}`;
						return sb;
					}
					visited.set(value, sb.length);
					break;
			}
			if (inspect) value = inspect(value, type, container, key, visited);
			if (format)
			{
				const outcome = format(value, type, container, key, visited);
				if (outcome !== Verbatim) return sb + outcome;
			}
			try
			{
				switch (Type.getType(value))
				{
					case Type.Undefined:
						sb += "void 0";
						break;
					case Type.Null:
						sb += "null";
						break;
					case Type.Boolean:
					case Type.Number:
					case Type.String:
						sb += JSON.stringify(value);
						break;
					case Type.BigInt:
						sb += `${value.toString()}n`;
						break;
					case Type.NaN:
						sb += "NaN";
						break;
					case Type.Date:
						sb += `\\${value.toJSON()}`;
						break;
					case Type.Symbol:
						sb += `<${value.description || ""}>`;
						break;
					case Type.RegExp:
					case Type.Callable:
						sb += value.toString();
						break;
					case Type.Iterator:
						sb += "&Iterator";
						break;
					case Type.Promise:
						sb += `&${_ip(value, Promise)}`;
						break;
					case Type.WeakMap:
						sb += `&${_ip(value, WeakMap)}`;
						break;
					case Type.WeakSet:
						sb += `&${_ip(value, WeakSet)}`;
						break;
					case Type.ArrayBuffer:
						sb += `&${_ip(value, ArrayBuffer)}(${value.byteLength})`;
						break;
					case Type.DataView:
						sb += `&${_ip(value, DataView)}(${value.byteLength})`;
						break;
					case Type.Int8Array:
						sb += `&${_ip(value, Int8Array)}(${value.length})`;
						break;
					case Type.Uint8Array:
						sb += `&${_ip(value, Uint8Array)}(${value.length})`;
						break;
					case Type.Uint8ClampedArray:
						sb += `&${_ip(value, Uint8ClampedArray)}(${value.length})`;
						break;
					case Type.Int16Array:
						sb += `&${_ip(value, Int16Array)}(${value.length})`;
						break;
					case Type.Uint16Array:
						sb += `&${_ip(value, Uint16Array)}(${value.length})`;
						break;
					case Type.Int32Array:
						sb += `&${_ip(value, Int32Array)}(${value.length})`;
						break;
					case Type.Uint32Array:
						sb += `&${_ip(value, Uint32Array)}(${value.length})`;
						break;
					case Type.Float32Array:
						sb += `&${_ip(value, Float32Array)}(${value.length})`;
						break;
					case Type.Float64Array:
						sb += `&${_ip(value, Float64Array)}(${value.length})`;
						break;
					case Type.BigInt64Array:
						sb += `&${_ip(value, BigInt64Array)}(${value.length})`;
						break;
					case Type.BigUint64Array:
						sb += `&${_ip(value, BigUint64Array)}(${value.length})`;
						break;
					case Type.Array:
						{
							let skipFields = [];
							if (value.constructor === Array)
							{
								if (value.length >= 2 && value[0] === CompoundStructureMarker)											//	CompoundStructure
								{
									sb += `&cost<${value[1].description || ""}>[`;
									value = value.slice(2);
								}
								else if (value.PB_compoundType !== void 0 && Number.isInteger(value.count))								//	CompoundBuffer
								{
									if (verbose) sb += `&cbuf(${value.length})<${value.PB_compoundType.description || ""}>[`;
									else sb += `&cbuf<${value.PB_compoundType.description || ""}>[`;
									skipFields = ["count", "PB_compoundType"];
									value = value.slice(0, value.count);
								}
								else if (value.PB_compoundType !== void 0)																//	CompoundArray
								{
									sb += `&carr<${value.PB_compoundType.description || ""}>[`;
									skipFields = ["PB_compoundType"];
								}
								else if (Number.isInteger(value.count))																	//	Buf
								{
									if (verbose) sb += `&buf(${value.length})[`;
									else sb += `&buf[`;
									value = value.slice(0, value.count);
									skipFields = ["count"];
								}
								else sb += "[";
							}
							else sb += `&${_ip(value, Array)}[`;
							let i = 0, m = false;
							for (const key in value)
							{
								if (skipFields.indexOf(key) !== -1) continue;
								if (m) sb += ", ";
								else m = true;
								const ikey = Number.parseFloat(key);
								if (!Type.isInteger(ikey))
								{
									if (Type.isNumber(ikey)) sb += `${JSON.stringify(ikey)}: `;
									else sb += `${JSON.stringify(key)}: `;
									sb = _formatValue(value[key], verbose, inspect, format, sb, visited, value, key);
									continue;
								}
								if (i > ikey)
								{
									sb += `${JSON.stringify(ikey)}: `;
									sb = _formatValue(value[ikey], verbose, inspect, format, sb, visited, value, ikey);
									continue;
								}
								if (i === ikey)
								{
									sb = _formatValue(value[ikey], verbose, inspect, format, sb, visited, value, i);
									++i;
									continue;
								}
								let emptyCount = ikey - i;
								if (emptyCount !== 0) sb += emptyCount !== 1 ? `...(${(emptyCount)}x empty), ` : `...(empty), `;
								sb = _formatValue(value[ikey], verbose, inspect, format, sb, visited, value, ikey);
								i = ikey + 1;
							}
							if (i < value.length)
							{
								if (m) sb += ", ";
								else m = true;
								const emptyCount = value.length - i;
								sb += emptyCount !== 1 ? `...(${(emptyCount)}x empty)` : `...(empty)`;
							}
							for (let coll = Object.getOwnPropertySymbols(value), length = coll.length, i = 0; i < length; ++i)
							{
								const item = coll[i];
								if (m) sb += ", ";
								else m = true;
								sb += `<${item.description}>: `;
								sb = _formatValue(value[item], verbose, inspect, format, sb, visited, value, item);
							}
							sb += "]";
							break;
						}
					case Type.Object:
						{
							sb += !value.constructor ? `&null` : value.constructor === Object ? "" : `&${_ip(value, Object)}`
							sb += "{";
							let m = false;
							for (const key in value)
							{
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `${JSON.stringify(key)}: `;
								sb = _formatValue(value[key], verbose, inspect, format, sb, visited, value, key);
							}
							for (let coll = Object.getOwnPropertySymbols(value), length = coll.length, i = 0; i < length; ++i)
							{
								const item = coll[i];
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `<${item.description}>: `;
								sb = _formatValue(value[item], verbose, inspect, format, sb, visited, value, item);
							}
							if (m) sb += " }";
							else sb += "}";
							break;
						}
					case Type.Error:
						{
							sb += `&${_ip(value, Error)}`;
							sb += "{";
							let m = false;
							for (const key in value)
							{
								if (value && value.constructor.name.endsWith("Exception")) switch (key) { case "name": case "message": case "stack": case "code": case "errno": case "syscall": case "cause": case "_rawMessage": case "ncode": case "details": case "innerException": continue; }
								else switch (key) { case "name": case "message": case "stack": case "code": case "errno": case "syscall": case "cause": continue; }
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `${JSON.stringify(key)}: `;
								sb = _formatValue(value[key], verbose, inspect, format, sb, visited, value, key);
							}
							if (value.message) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"message": `; sb = _formatValue(value.message, verbose, inspect, format, sb, visited, value, "message"); }
							if (value.code !== void 0) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"code": `; sb = _formatValue(value.code, verbose, inspect, format, sb, visited, value, "code"); }
							if (value.errno !== void 0) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"errno": `; sb = _formatValue(value.errno, verbose, inspect, format, sb, visited, value, "errno"); }
							if (value.syscall) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"syscall": `; sb = _formatValue(value.syscall, verbose, inspect, format, sb, visited, value, "syscall"); }
							if (value.cause) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"cause": `; sb = _formatValue(value.cause, verbose, inspect, format, sb, visited, value, "cause"); }
							if (value && value.constructor.name.endsWith("Exception"))
							{
								if (value.details) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"details": `; sb = _formatValue(value.details, verbose, inspect, format, sb, visited, value, "details"); }
								if (value.innerException) { if (m) sb += ", "; else { m = true; sb += " "; }; sb += `"innerException": `; sb = _formatValue(value.innerException, verbose, inspect, format, sb, visited, value, "innerException"); }
							}
							for (let coll = Object.getOwnPropertySymbols(value), length = coll.length, i = 0; i < length; ++i)
							{
								const item = coll[i];
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `<${item.description}>: `;
								sb = _formatValue(value[item], verbose, inspect, format, sb, visited, value, item);
							}
							if (m) sb += " }";
							else sb += "}";
							break;
						}
					case Type.Map:
						{
							sb += `&${_ip(value, Map)}`;
							sb += "{";
							let m = false;
							for (const entry of value)
							{
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb = _formatValue(entry[0], verbose, inspect, format, sb, visited, value, Unset);
								sb += `=`;
								sb = _formatValue(entry[1], verbose, inspect, format, sb, visited, value, Unset);
							}
							for (const key in value)
							{
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `${JSON.stringify(key)}: `;
								sb = _formatValue(value[key], verbose, inspect, format, sb, visited, value, key);
							}
							for (let coll = Object.getOwnPropertySymbols(value), length = coll.length, i = 0; i < length; ++i)
							{
								const item = coll[i];
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `<${item.description}>: `;
								sb = _formatValue(value[item], verbose, inspect, format, sb, visited, value, item);
							}
							if (m) sb += " }";
							else sb += "}";
							break;
						}
					case Type.Set:
						{
							sb += `&${_ip(value, Set)}`;
							sb += "{";
							let m = false;
							for (const entry of value)
							{
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb = _formatValue(entry, verbose, inspect, format, sb, visited, value, Unset);
							}
							for (let coll = Object.getOwnPropertySymbols(value), length = coll.length, i = 0; i < length; ++i)
							{
								const item = coll[i];
								if (m) sb += ", ";
								else { m = true; sb += " "; }
								sb += `<${item.description}>: `;
								sb = _formatValue(value[item], verbose, inspect, format, sb, visited, value, item);
							}
							if (m) sb += " }";
							else sb += "}";
							break;
						}
					default:
						sb += `${String(value)}`;
						break;
				}
			}
			catch (ex)
			{
				return sb + `!${ex.message}`;
			}
			return sb;
		}
	},

	print(...args)
	{
		if (args.length === 0) return "";
		if (args.length === 1) return Diagnostics.format(args[0], { verbose: true });
		let result = "";
		for (let length = args.length, i = 0; i < length; i += 2)
		{
			const key = args[i];
			const value = args[i + 1];
			if (result.length) result += ", ";
			switch (key)
			{
				case "ncode":
					result += `"ncode" (${Diagnostics.printNcode(value)})`;
					break;
				default:
					result += `${JSON.stringify(key)} (${Diagnostics.format(value, { verbose: true })})`;
					break;
			}
		}
		return result;
	},

	printObject(obj)
	{
		let result = "";
		for (const key in obj)
		{
			const value = obj[key];
			if (result.length) result += ", ";
			switch (key)
			{
				case "ncode":
					result += `"ncode" (${Diagnostics.printNcode(value)})`;
					break;
				default:
					result += `${JSON.stringify(key)} (${Diagnostics.print(value)})`;
					break;
			}
		}
		return result;
	},

	printNcode(value, defaultValue = void 0)
	{
		if (Type.isInteger(value)) return `0x${value.toString(16).toUpperCase()}`;
		if (value === void 0 && defaultValue !== void 0) return defaultValue;
		return Diagnostics.print(value);
	},

	printString(value, defaultValue = "")
	{
		if (value === void 0 || value === null || value !== value) return defaultValue;
		else if (value.constructor === Symbol) return `(${value.description})`;
		try
		{
			return String(value);
		}
		catch (ex)
		{
			return "[object null]";
		}
	},


	//	Usage: `require("-/pb/natalis/001/Diagnostics.js").createNcode()`.
	createNcode()
	{
		const digitCount = 6;

		const sb = ["0x"];
		sb.push(Math.floor(Math.random() * 15 + 1).toString(16).toUpperCase());
		for(let i = 1; i < digitCount; ++i) sb.push(Math.floor(Math.random() * 16).toString(16).toUpperCase());
		return sb.join("");
	},

	//	Parameter: `exclude` - a space-separated list of hex-codes to exclude from the generation
	//	Remarks:
	//		To produce a report of all ncodes used under a directory in windows powershell, use the following command:
	//		`Get-ChildItem ./* -Filter *.js -Recurse | Foreach-Object {Select-String -Path "$($_.FullName)" -Pattern "0x[123456789aAbBcCdDeEfF]{6}" -AllMatches} | foreach {$_.matches}|select value`
	//	Usage: `require("-/pb/natalis/001/Diagnostics.js").createNcodes(10000).join(", ")`.
	//	Usage: `require("-/pb/natalis/001/Diagnostics.js").createNcodes(10000, "0x697374 0x697373").join(", ")`.
	createNcodes(number = 100, exclude = null)
	{
		const excludedCodeSet = new Set();
		if (exclude)
		{
			const items = String(exclude).split(" ");
			for (let length = items.length, i = 0; i < length; ++i) 
			{
				const item = items[i];
				if (item.length === 0) continue;
				const number = Number.parseInt(item);
				if (Type.isNaN(number)) console.error("Diagnostics.createNcodes", "exclude", `Cannot parse as a hexdecimal number: "${item}".`);
				excludedCodeSet.add("0x" + number.toString(16).toUpperCase());
			}
		}

		const set = new Set();
		for(let i = 0; i < number; ++i) 
		{
			const value = Diagnostics.createNcode();
			if (set.has(value)) { --i; continue; }
			if (excludedCodeSet.has(value)) { --i; continue; } 
			set.add(value);
		}

		function validate(l, r)
		{
			const left = l.split(" ").map(v => !isNaN(Number.parseInt(v)) && Number.parseInt(v));
			const right = r.split(" ").map(v => !isNaN(Number.parseInt(v)) && Number.parseInt(v));
			const ls = new Set(left);
			const rs = new Set(right);
			const result = [];
			for (const lv of ls) if (rs.has(lv)) result.push("0x" + lv.toString(16).toUpperCase());
			for (const rv of rs) if (ls.has(rv)) result.push("0x" + rv.toString(16).toUpperCase());
			return result;
		}

		const overlappingItems = validate(Array.from(set).join(" "), exclude);
		if (overlappingItems.length !== 0) console.error("Overlapping", overlappingItems);

		return Array.from(set);
	},
}

module.exports.Diagnostics = module.exports;
