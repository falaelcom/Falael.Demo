//	R0Q2?/daniel/20230820
//	- TODO: migrate from class to object
//	- DOC, TEST

"use strict";

const { LiteralType } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

module.exports =

class DotQuoteNotation
{
	//	Exception: `"Argument is invalid"`.
	static encodeComponent(input)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(input) && !LiteralType.isInteger(input)) throw new Exception(0xCE3D4B, `Argument is invalid: "input".`);
		}

		if (LiteralType.isString(input))
		{
			const result = ['\''];
			for (let length = input.length, i = 0; i < length; ++i)
			{
				const c = input[i];
				switch (c)
				{
					case '\'': result.push("\\'"); break;
					case '\\': result.push("\\\\"); break;
					default: result.push(c); break;
				}
			}
			result.push('\'');
			return result.join("");
		}
		return `[${input}]`;
	}

	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Format is invalid"`.
	//	Exception: `"Not implemented"`.
	static parse(input)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isString(input)) throw new Exception(0xC790B4, `Argument is invalid: "input".`);
		}

		const result = [];

		const STATE_INPUT = Symbol("STATE_INPUT");
		const STATE_DESCENDANT = Symbol("STATE_DESCENDENT");
		const STATE_INDEXER = Symbol("STATE_INDEXER");
		const STATE_STRING = Symbol("STATE_STRING");
		const STATE_ESCAPE_SEQUENCE = Symbol("STATE_ESCAPE_SEQUENCE");

		const sb = [];
		const length = input.length;
		let i = 0;
		let state = STATE_INPUT;
		while (i < length)
		{
			const c = input[i];
			switch (state)
			{
				case STATE_INPUT:
					switch (c)
					{
						case '\'': ++i; state = STATE_STRING; continue;
						default: throw new Exception(0xAA5884, `Format is invalid at offset ${i}: unexpected character ${JSON.stringify(c)}.`);
					}
				case STATE_DESCENDANT:
					switch (c)
					{
						case '.': ++i; state = STATE_INPUT; continue;
						case '[': ++i; state = STATE_INDEXER; continue;
						default: throw new Exception(0x49B3D5, `Format is invalid at offset ${i}: unexpected character ${JSON.stringify(c)}.`);
					}
				case STATE_INDEXER:
					switch (c)
					{
						case '0':
						case '1':
						case '2':
						case '3':
						case '4':
						case '5':
						case '6':
						case '7':
						case '8':
						case '9':
							if (sb.length && c !== '0' && sb[0] === '0') throw new Exception(0xF730C8, `Format is invalid at offset ${i - sb.length}: invalid first digit ${JSON.stringify('0')}.`);
							++i;
							sb.push(c);
							continue;
						case ']':
							if (!sb.length) throw new Exception(0x3F97F5, `Format is invalid at offset ${i}: unexpected character ${JSON.stringify(c)}.`);
							if (sb.length > 1 && sb[0] === '0') throw new Exception(0xB3CBE5, `Format is invalid at offset ${i - sb.length}: invalid first digit ${JSON.stringify('0')}.`);
							++i;
							result.push(parseInt(sb.join("")));
							sb.length = 0;
							state = STATE_DESCENDANT;
							continue;
						default: throw new Exception(0xF2C667, `Format is invalid at offset ${i}: unexpected character ${JSON.stringify(c)}.`);
					}
				case STATE_STRING:
					switch (c)
					{
						case '\\': ++i; state = STATE_ESCAPE_SEQUENCE; continue;
						case '\'':
							result.push(sb.join(""));
							sb.length = 0;
							++i;
							state = STATE_DESCENDANT;
							continue;
						default: ++i; sb.push(c); continue;
					}
				case STATE_ESCAPE_SEQUENCE:
					switch (c)
					{
						case '\\':
						case '\'':
							++i;
							sb.push(c);
							state = STATE_STRING;
							continue;
						default: throw new Exception(0x9D7B66, `Format is invalid at offset ${i}: unrecognized escape sequence character ${JSON.stringify(c)}.`);
					}
				default: throw new Exception(0xAD8C52, `Not implemented.`);
			}
		}
		if (state !== STATE_DESCENDANT) throw new Exception(0x841DFA, `Format is invalid: unexpected end of input.`);
		return result;
	}

	//	Exception: `"Argument is invalid"`.
	static format(array)
	{
		if (PB_DEBUG)
		{
			if (!LiteralType.isArray(array)) throw new Exception(0x796E95, `Argument is invalid: "array".`);
		}

		const sb = [];
		for (let length = array.length, i = 0; i < length; ++i)
		{
			const item = array[i];
			if (i && LiteralType.isString(item)) sb.push('.');
			sb.push(DotQuoteNotation.encodeComponent(item));
		}
		return sb.join("");
	}

}

module.exports.DotQuoteNotation = module.exports;