//	R0Q3?/daniel/20220422
//	- TODO: implement `format`
//	- TODO: migrate from class to object
//	- DOC, TEST
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

module.exports = 

class IntervalNotation
{
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Format is invalid"`.
	static parse(value)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(value)) throw new Exception(0xF0A8FB, `Argument is invalid: "value".`);
			if (!value.length) throw new Exception(0xD034D1, `Argument is invalid: "value".`);
		}

		const lb = value[0];
		const rb = value[value.length - 1];
		const tokens = value.substr(1, value.length - 2).split(',');
		if (PB_DEBUG)
		{
			if (tokens.length !== 2) throw new Exception(0xAAC80E, `Format is invalid: Too many tokens; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
			if (lb !== '[' && lb !== '(') throw new Exception(0xE09B01, `Format is invalid: unrecognized parenthesis at interval start: ${JSON.stringify(lb)}; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
			if (rb !== ']' && rb !== ')') throw new Exception(0xB8F806, `Format is invalid: unrecognized parenthesis at interval end: ${JSON.stringify(rb)}; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
		}

		const lnt = tokens[0].trim();
		const rnt = tokens[1].trim();
		let ln = lnt === "*" ? Infinity : parseFloat(lnt);
		let rn = rnt === "*" ? Infinity : parseFloat(rnt);
		if (PB_DEBUG)
		{
			if (isNaN(ln)) throw new Exception(0x5B0D06, `Format is invalid: unrecognized number format at interval start: ${JSON.stringify(lnt)}; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
			if (isNaN(rn)) throw new Exception(0x8EA9E4, `Format is invalid: unrecognized number format at interval end: ${JSON.stringify(rnt)}; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
		}

		const result = {};
		switch (lb)
		{
			case '[':
				if (isFinite(ln)) { result.lte = ln; break; }
				throw new Exception(0xCAB37A, `Format is invalid: infinity requires a left open interval (* at interval start: ${JSON.stringify(lb + lnt)}; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
			case '(':
				if (isFinite(ln)) result.lt = ln;
				break;
		}
		switch (rb)
		{
			case ']':
				if (isFinite(gn)) { result.gte = gn; break; }
				throw new Exception(0x7BC10E, `Format is invalid: infinity requires a right open interval *) at interval end: ${JSON.stringify(rb + rnt)}; value: ${JSON.stringify(value)}. Hint: "(*, 10.1]".`);
			case ')':
				if (isFinite(gn)) result.gt = ln;
				break;
		}
		return result;
	}

	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Callback has returned an invalid value"`.
	//	Exception: `"Key is invalid"`.
	//	Exception: `"Format is invalid"`.
	static validateObject(value, sane = true, strict = false)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(input)) throw new Exception(0x9BC1EC, `Argument is invalid: "input".`);
		}

		let i = 0;
		for (const key in value)
		{
			switch (key)
			{
				case "gt":
				case "lt":
				case "gte":
				case "lte":
					if (!Type.isNumber(value[key])) throw new Exception(0xCA7F7C, `Format is invalid: "${key}": "${JSON.stringify(value)}"`);
					++i;
					break;
				default:
					if (sane) throw new Exception(0xEFECAE, `Key is invalid: "${key}".`);
					break;
			}
		}
		if (strict && i !== 2) throw new Exception(0xABB63A, `Format is invalid.`);
	}
}

module.exports.IntervalNotation = module.exports;
