//	R0Q3?/daniel/20240619
"use strict";

const { Native, Type, CallableType, LiteralType } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { Exception, ArgumentException, ValidationFailedException } = require("-/pb/natalis/003/Exception.js");
const { Compound, buf, isBuf, CompoundBuf, cbuf, BufPool } = require("-/pb/natalis/013/Compound.js");
const { Pins }  = require("-/pb/natalis/013/Pins.js");
const { NativeGraph } = require("-/pb/natalis/014/NativeGraph.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0xE90536 = tunable(0xE90536);

const GraphSchemaNodeCompound = Symbol("GraphSchemaNodeCompound");

const GraphSchema = module.exports = 

class GraphSchema
{
	constructor()
	{
	}
}

class GraphSchemaPredicate
{
	constructor(test, params)
	{
		if (PB_DEBUG)
		{
			if (!CallableType.isFunction(test)) throw new ArgumentException(0x72FCDD, "test", test);
			if (!Type.isNU(params) && !Type.isObject(params)) throw new ArgumentException(0x6EEED0, "params", params);
		}
		this._test = test;
		this._params = params;
	}

	getInlinedCode(...args)
	{
		return Native.inlineFunction(this._test, args);
	}
}

const GraphSchemaNode =
{
	is(node)
	{
		return CompoundBuf.isOf(node, GraphSchemaNodeCompound) && node.count >= 1;
	},

	create(predicate = null, length = 1, bufferLength = T_0xE90536)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(predicate) && !(predicate instanceof GraphSchemaPredicate)) throw new ArgumentException(0x34F9EF, "predicate", predicate);
			if (!Type.isInteger(length) || length < 1) throw new ArgumentException(0xF19FE6, "length", length);
			if (!Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0x344885, "bufferLength", bufferLength);
		}
		const result = cbuf(GraphSchemaNodeCompound, length, bufferLength);
		result[0] = predicate;
		return result;
	},
}

module.exports.Schema = module.exports;