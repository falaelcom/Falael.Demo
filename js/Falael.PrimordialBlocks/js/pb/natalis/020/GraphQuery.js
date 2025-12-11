//	R0Q3?/daniel/20240610
//	- TODO: C:\repos\Falael.CODE\manifestation\framework\Falael.PrimordialBlocks\resources\!todo.md
//	- DOC, TEST
"use strict";

const { Unset, Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { ArgumentException, InvalidOperationException, NotImplementedException, MergeConflictException } = require("-/pb/natalis/003/Exception.js");
const { Enum } = require("-/pb/natalis/011/Enum.js");
const { Fabric } = require("-/pb/natalis/013/Fabric.js");
const { LiteralFabric } = require("-/pb/natalis/014/LiteralFabric.js");
const { isBuf, CompoundBuf } = require("-/pb/natalis/013/Compound.js");
const { List } = require("-/pb/natalis/014/List.js");
const { BatchProcessingConfig, InstanceHandling } = require("-/pb/natalis/014/BatchProcessingConfig.js");
const { GraphCursor, GraphCursorList, GraphCursorType, Lean, Compact, CompactFormal, GraphComposer, MergeDecisions, MergeInstruction, MergeAction } = require("-/pb/natalis/015/GraphCursor.js");
const { Query } = require("-/pb/natalis/015/Query.js");

const TranscribeInstruction = Enum("TranscribeInstruction",
{
	Fuse: Symbol("Fuse"),
});

class TranscribeQuery extends Query
{
	constructor(...args) { super(null, null, null, ...args); }

	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; the fabric used for interpreting the graph vertices and labels.
	//	Parameter: `lenient: boolean` - optional, defaults to `false`; if set to `true` disables circular references checks when listing a graph.
	//	Parameter: `createCursor: function(): cbuf<GraphCursorType.Compact>` - optional; if provided will be called to create new cursor instances during graph listing.
	//	Parameter: `graphQuery: GraphQuery` - optional; ...
	//	Parameter: `compactListQuery: CompactListQuery` - optional; ...
	//	Parameter: `compactFormalListQuery: CompactFormalListQuery` - optional; ...
	//	Parameter: `vertexDictionaryQuery: VertexDictionaryQuery` - optional; ...
	//	See also: `GraphCursor.Lean.list`, `GraphCursor.Compact.list`, `GraphCursor.CompactFormal.list`.
	construct({ relays: { graphQuery = null, compactListQuery = null, compactFormalListQuery = null, vertexDictionaryQuery = null } = {}, defaults: { fabric = null, lenient = false, createCursor = null } = {} } = {})
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(graphQuery) && !(graphQuery instanceof GraphQuery)) throw new ArgumentException(0x85D4A4, "par.relays.graphQuery", graphQuery);
			if (!Type.isNU(compactListQuery) && !(compactListQuery instanceof CompactListQuery)) throw new ArgumentException(0x56067D, "par.relays.compactListQuery", compactListQuery);
			if (!Type.isNU(compactFormalListQuery) && !(compactFormalListQuery instanceof CompactFormalListQuery)) throw new ArgumentException(0x44578A, "par.relays.compactFormalListQuery", compactFormalListQuery);
			if (!Type.isNU(vertexDictionaryQuery) && !(vertexDictionaryQuery instanceof VertexDictionaryQuery)) throw new ArgumentException(0x34B7A7, "par.relays.vertexDictionaryQuery", vertexDictionaryQuery);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x354B53, "par.defaults.fabric", fabric);
			if (!Type.isBoolean(lenient)) throw new ArgumentException(0xB727FB, "par.defaults.lenient", lenient);
			if (!Type.isNU(createCursor) && !CallableType.isFunction(createCursor)) throw new ArgumentException(0x454EF5, "par.defaults.createCursor", createCursor);
		}

		this._graphQuery = graphQuery;
		this._compactListQuery = compactListQuery;
		this._compactFormalListQuery = compactFormalListQuery;
		this._vertexDictionaryQuery = vertexDictionaryQuery;

		this._fabric_default = fabric;
		this._lenient_default = lenient;
		this._createCursor_default = createCursor;
	}

	begin()
	{
		this.principal._fabric = this._fabric_default;
		this.principal._lenient = this._lenient_default;
		this.principal._createCursor = this._createCursor_default;
	}

	execute() { throw new NotImplementedException(0xA6B27E, "Must override."); }

	//	query session configuration
	setFabric(fabric)
	{
		if (PB_DEBUG)
		{
			if (!(fabric instanceof Fabric)) throw new ArgumentException(0x8E3415, "fabric", fabric);
		}
		this.principal._fabric = fabric;
		return this;
	}

	setLenient(lenient)
	{
		if (PB_DEBUG)
		{
			if (!Type.isBoolean(lenient)) throw new ArgumentException(0x94F67C, "lenient", lenient);
		}
		this.principal._lenient = lenient;
		return this;
	}

	setCreateCursor(createCursor)
	{
		if (PB_DEBUG)
		{
			if (!CallableType.isFunction(createCursor)) throw new ArgumentException(0x38B89C, "createCursor", createCursor);
		}
		this.principal._createCursor = createCursor;
		return this;
	}

	//	properties
	get graphQuery() { return this._principal._graphQuery; }

	get compactListQuery() { return this._principal._compactListQuery; }

	get compactFormalListQuery() { return this._principal._compactFormalListQuery; }

	get vertexDictionaryQuery() { return this._principal._vertexDictionaryQuery; } 

	get fabric() { return this._principal._fabric; }

	get lenient() { return this._principal._lenient; }

	get createCursor() { return this._principal._createCursor; }
}

//	Class: Provides a `Query` interface for graph operations.
class GraphQuery extends TranscribeQuery
{
	construct(par)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(par?.relays?.graphQuery)) throw new ArgumentException(0x77ADF0, "par.relays.graphQuery", par?.relays?.graphQuery);
		}
		super.construct(par);
		this._graphQuery = this;
	}

	begin(root)
	{
		super.begin();
		this._value = root;
	}

	execute() { return this._value; }

	//	relay
	toCompact()
	{
		if (PB_DEBUG)
		{
			if (!(this.compactListQuery instanceof CompactListQuery)) throw new InvalidOperationException(0x85361F, `"this.compactListQuery" value is invalid.`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toCompact", { value: Diagnostics.format(this._value), fabric: this.fabric, lenient: this.lenient, createCursor: this.createCursor });
		const cursorList = Compact.list(this._value, this.fabric, this.lenient, this.createCursor);
		return this.relay(this.compactListQuery, cursorList);
	}

	toCompactFormal()
	{
		if (PB_DEBUG)
		{
			if (!(this.compactFormalListQuery instanceof CompactFormalListQuery)) throw new InvalidOperationException(0xEFFA82, `"this.compactFormalListQuery" value is invalid.`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toCompactFormal", { value: Diagnostics.format(this._value), fabric: this.fabric, lenient: this.lenient, createCursor: this.createCursor });
		const cursorList = CompactFormal.list(this._value, this.fabric, this.lenient, this.createCursor);
		return this.relay(this.compactFormalListQuery, cursorList);
	}

	toLean()
	{
		throw new NotImplementedException(0x0);
	}
}

class GraphCursorListQuery extends TranscribeQuery
{
	//	operations
	selectIf(test)
	{
		if (PB_DEBUG)
		{
			if (!CallableType.isFunction(test)) throw new ArgumentException(0xB762B9, "test", test);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "selectIf", { value: Diagnostics.format(this._value), test });
		List.selectIf(this._value, test);
		return this;
	}

	transform(transformList)
	{
		if (PB_DEBUG)
		{
			if (!CallableType.isFunction(transformList)) throw new ArgumentException(0x6300EE, "transformList", transformList);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "transform", { value: Diagnostics.format(this._value), transformList });
		List.transform(this._value, transformList);
		return this;
	}

	sort(compare)
	{
		if (PB_DEBUG)
		{
			if (!CallableType.isFunction(compare)) throw new ArgumentException(0x141A93, "compare", compare);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "sort", { value: Diagnostics.format(this._value), compare });
		List.sort(this._value, compare);
		return this;
	}

	append(cursor)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor) && !CompactFormal.is(cursor) && !Lean.is(cursor)) throw new ArgumentException(0xC1CC6C, "cursor", cursor);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "append", { value: Diagnostics.format(this._value), cursor });
		List.append(this._value, cursor);
		return this;
	}

	appendRange(cursorList)
	{
		if (PB_DEBUG)
		{
			if (!GraphCursor.List.is(cursorList)) throw new ArgumentException(0xA690E7, "cursorList", cursorList);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "appendRange", { value: Diagnostics.format(this._value), cursorList });
		List.appendRange(this._value, cursorList);
		return this;
	}

	insert(cursor, index)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor) && !CompactFormal.is(cursor) && !Lean.is(cursor)) throw new ArgumentException(0xD98C69, "cursor", cursor);
			if (!Type.isInteger(index)) throw new ArgumentException(0xB56ABE, "index", index);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "insert", { value: Diagnostics.format(this._value), index, cursor });
		List.insert(this._value, index, cursor);
		return this;
	}

	insertRange(cursorList, index)
	{
		if (PB_DEBUG)
		{
			if (!GraphCursor.List.is(cursorList)) throw new ArgumentException(0x90B05B, "cursorList", cursorList);
			if (!Type.isInteger(index)) throw new ArgumentException(0xA0C7CA, "index", index);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "insertRange", { value: Diagnostics.format(this._value), index, cursorList });
		List.insertRange(this._value, index, cursorList);
		return this;
	}
}

class CompactListQuery extends GraphCursorListQuery
{
	construct(par)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(par?.relays?.compactListQuery)) throw new ArgumentException(0x46AB43, "par.relays.compactListQuery", par?.relays?.compactListQuery);
		}
		super.construct(par);
		this._compactListQuery = this;
	}

	begin(cursorList)
	{
		if (PB_DEBUG)
		{
			if (!GraphCursor.List.is(cursorList)) throw new ArgumentException(0x868499, "cursorList", cursorList);
		}
		super.begin();
		this._value = cursorList;
	}

	execute() { return this._value; }

	//	relay
	toGraph(graphComposerTransaction = null, mergePolicy = null, deleteMergePolicy = null)
	{
		if (PB_DEBUG)
		{
			if (!(this.graphQuery instanceof GraphQuery)) throw new InvalidOperationException(0x38F8D3, `"this.graphQuery" value is invalid.`);
		}
		if (PB_DEBUG)
		{
			if (!Type.isNU(graphComposerTransaction) && !(graphComposerTransaction instanceof GraphComposerTransaction)) throw new ArgumentException(0x64B93A, "graphComposerTransaction", graphComposerTransaction);
			if (!Type.isNU(mergePolicy) && !Type.isInteger(mergePolicy)) throw new ArgumentException(0x157CA0, "mergePolicy", mergePolicy);
			if (!Type.isNU(deleteMergePolicy) && !Type.isInteger(deleteMergePolicy)) throw new ArgumentException(0xA4D74C, "deleteMergePolicy", deleteMergePolicy);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toGraph", { value: Diagnostics.format(this._value), graphComposerTransaction, mergePolicy, deleteMergePolicy, fabric: this.fabric });
		const outcome = Compact.List.merge(this._value, Unset, graphComposerTransaction, mergePolicy, deleteMergePolicy, this.fabric);
		return this.relay(this.graphQuery, outcome);
	}

	toCompactFormal(transcribeInstruction = null)
	{
		if (PB_DEBUG)
		{
			if (!(this.compactFormalListQuery instanceof CompactFormalListQuery)) throw new InvalidOperationException(0xA4F42D, `"this.CompactFormalListQuery" value is invalid.`);
			if (!Type.isNU(transcribeInstruction) && transcribeInstruction !== TranscribeInstruction.Fuse) throw new ArgumentException(0x64F41C, "transcribeInstruction", transcribeInstruction);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toCompactFormal", { value: Diagnostics.format(this._value), fabric: this.fabric, transcribeInstruction });
		const outcome = transcribeInstruction === TranscribeInstruction.Fuse ? Compact.List.fuse(this._value) : GraphCursor.List.uniform(this._value, GraphCursorType.CompactFormal, null, 0, null, this.fabric);
		return this.relay(this.compactFormalListQuery, outcome);
	}

	//	Remarks: Current implementation does not provision future support for parameters `targetOrSubject`, `offsetInTarget` and `batchProcessingConfig`.
	asCompactFormal()
	{
		if (PB_DEBUG)
		{
			if (!(this.compactFormalListQuery instanceof CompactFormalListQuery)) throw new InvalidOperationException(0x279A72, `"this.CompactFormalListQuery" value is invalid.`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "asCompactFormal", { value: Diagnostics.format(this._value) });
		for (let length = this._value.count, i = 0; i < length; ++i)
		{
			const cursor = this._value[i];
			if (cursor === Unset) continue;
			this._value[i] = Compact.asCompactFormal(cursor);
		}
		return this.relay(this.compactFormalListQuery, this._value);
	}

	//	operations
	append(cursor)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0xD28C01, "cursor", cursor);
		}
		return super.append(cursor);
	}

	appendRange(cursorList)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(cursorList) || cursorList.some(v => !Compact.is(v))) throw new ArgumentException(0xEF14CE, "cursorList", cursorList);
		}
		return super.appendRange(cursorList);
	}

	insert(cursor, index)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0x8A0322, "cursor", cursor);
		}
		return super.insert(cursor, index);
	}

	insertRange(cursorList, index)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(cursorList) || cursorList.some(v => !Compact.is(v))) throw new ArgumentException(0xBD5BD1, "cursorList", cursorList);
		}
		return super.insertRange(cursorList, index);
	}

	appendGraph(root)
	{
		this._principal._dia && this._principal._dia.trace(this._did, "appendGraph", { value: Diagnostics.format(this._value), root, fabric: this.fabric, fabric: this.lenient, fabric: this.createCursor });
		const cursorList = Compact.list(root, this.fabric, this.lenient, this.createCursor);
		List.appendRange(this._value, cursorList);
		return this;
	}

	insertGraph(root, index)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(index)) throw new ArgumentException(0x954531, "index", index);
		}

		this._principal._dia && this._principal._dia.trace(this._did, "insertGraph", { value: Diagnostics.format(this._value), index, root, fabric: this.fabric, lenient: this.lenient, createCursor: this.createCursor });
		const cursorList = Compact.list(root, this.fabric, this.lenient, this.createCursor);
		List.insertRange(this._value, index, cursorList);
		return this;
	}

	rotate(count)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(count)) throw new ArgumentException(0x3996F9, "count", count);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "rotate", { value: Diagnostics.format(this._value), count });
		Compact.List.rotate(this._value, count);
		return this;
	}
}

class CompactFormalListQuery extends GraphCursorListQuery
{
	construct(par)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(par?.relays?.compactFormalListQuery)) throw new ArgumentException(0x689C13, "par.relays.compactFormalListQuery", par?.relays?.compactFormalListQuery);
		}
		super.construct(par);
		this._compactFormalListQuery = this;
	}

	begin(cursorList)
	{
		if (PB_DEBUG)
		{
			if (!GraphCursor.List.is(cursorList)) throw new ArgumentException(0x4BCE8D, "cursorList", cursorList);
		}

		super.begin();

		this._value = cursorList;
	}

	execute() { return this._value; }

	//	relay
	//	Remarks: Will automatically spread the compact formal cursor.
	toCompact()
	{
		if (PB_DEBUG)
		{
			if (!(this.compactListQuery instanceof CompactListQuery)) throw new InvalidOperationException(0xDE948F, `"this.compactListQuery" value is invalid.`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toCompact", { value: Diagnostics.format(this._value), fabric: this.fabric, transcribeInstruction });
		const outcome = GraphCursor.List.uniform(this._value, GraphCursorType.Compact, null, 0, null, this.fabric);
		return this.relay(this.compactListQuery, outcome);
	}

	//	Remarks: Current implementation does not provision future support for parameters `targetOrSubject`, `offsetInTarget` and `batchProcessingConfig`.
	asCompact()
	{
		if (PB_DEBUG)
		{
			if (!(this.compactListQuery instanceof CompactListQuery)) throw new InvalidOperationException(0xFF35B9, `"this.compactListQuery" value is invalid.`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "asCompact", { value: Diagnostics.format(this._value) });
		for (let length = this._value.count, i = 0; i < length; ++i)
		{
			const cursor = this._value[i];
			if (cursor === Unset) continue;
			this._value[i] = CompactFormal.asCompact(cursor);
		}
		return this.relay(this.compactListQuery, this._value);
	}

	//	Remarks: Assumes that the current state of the list is fused.
	toVertexDictionary()
	{
		if (PB_DEBUG)
		{
			if (!(this.vertexDictionaryQuery instanceof VertexDictionaryQuery)) throw new InvalidOperationException(0xB92FB2, `"this.vertexDictionaryQuery" value is invalid.`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toVertexDictionary", { value: Diagnostics.format(this._value) });
		const result = {};
		for (let length = this._value.count, i = 0; i < length; ++i)
		{
			const cursor = this._value[i];
			result[cursor[1]] = cursor[0];
		}
		return this.relay(this.vertexDictionaryQuery, result);
	}

	//	operations
	append(cursor)
	{
		if (PB_DEBUG)
		{
			if (!CompactFormal.is(cursor)) throw new ArgumentException(0xC08CA3, "cursor", cursor);
		}
		return super.append(cursor);
	}

	appendRange(cursorList)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(cursorList) || cursorList.some(v => !CompactFormal.is(v))) throw new ArgumentException(0x420A5D, "cursorList", cursorList);
		}
		return super.appendRange(cursorList);
	}

	insert(cursor, index)
	{
		if (PB_DEBUG)
		{
			if (!CompactFormal.is(cursor)) throw new ArgumentException(0xD6E2D2, "cursor", cursor);
		}
		return super.insert(cursor, index);
	}

	insertRange(cursorList, index)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(cursorList) || cursorList.some(v => !CompactFormal.is(v))) throw new ArgumentException(0xB3782F, "cursorList", cursorList);
		}
		return super.insertRange(cursorList, index);
	}

	appendGraph(root)
	{
		this._principal._dia && this._principal._dia.trace(this._did, "appendGraph", { value: Diagnostics.format(this._value), root, fabric: this.fabric, lenient: this.lenient, createCursor: this.createCursor });
		const cursorList = CompactFormal.list(root, this.fabric, this.lenient, this.createCursor);
		List.appendRange(this._value, cursorList);
		return this;
	}

	insertGraph(root, index)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(index)) throw new ArgumentException(0x36E85F, "index", index);
		}

		this._principal._dia && this._principal._dia.trace(this._did, "insertGraph", { value: Diagnostics.format(this._value), index, root, fabric: this.fabric, lenient: this.lenient, createCursor: this.createCursor });
		const cursorList = CompactFormal.list(root, this.fabric, this.lenient, this.createCursor);
		List.insertRange(this._value, index, cursorList);
		return this;
	}

	fuse()
	{
		this._principal._dia && this._principal._dia.trace(this._did, "fuse", { value: Diagnostics.format(this._value) });
		CompactFormal.List.fuse(this._value);
		return this;
	}

	spread()
	{
		this._principal._dia && this._principal._dia.trace(this._did, "spread", { value: Diagnostics.format(this._value) });
		CompactFormal.List.spread(this._value);
		return this;
	}
}

class VertexDictionaryQuery extends TranscribeQuery
{
	construct(par)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(par?.relays?.vertexDictionaryQuery)) throw new ArgumentException(0xE6A87E, "par.relays.vertexDictionaryQuery", par?.relays?.vertexDictionaryQuery);
		}
		super.construct(par);
		this._vertexDictionaryQuery = this;
	}

	begin(vertexDictionary)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(vertexDictionary)) throw new ArgumentException(0xC6A6FD, "vertexDictionary", vertexDictionary);
		}

		super.begin();

		this._value = vertexDictionary;
	}

	execute() { return this._value; }

	//	relay
	toCompactFormal()
	{
		if (PB_DEBUG)
		{
			if (!(this.compactFormalListQuery instanceof CompactFormalListQuery)) throw new InvalidOperationException(0xFEA847, `"this.compactFormalListQuery" value is invalid`);
		}
		this._principal._dia && this._principal._dia.trace(this._did, "toCompactFormal", { value: Diagnostics.format(this._value) });
		const keys = Object.keys(this._value);
		const result = GraphCursor.List.create(keys.length);
		for (let length = keys.length, i = 0; i < length; ++i)
		{
			const key = keys[i];
			const cursor = CompactFormal.create(2);
			cursor[0] = this._value[key];
			cursor[1] = key;
			result[i] = cursor;
		}
		return this.relay(this.compactFormalListQuery, result);
	}
}



module.exports = GraphQuery;
module.exports.TranscribeInstruction = TranscribeInstruction;
module.exports.TranscribeQuery = TranscribeQuery;
module.exports.GraphQuery = module.exports;
module.exports.CompactListQuery = CompactListQuery;
module.exports.CompactFormalListQuery = CompactFormalListQuery;
module.exports.VertexDictionaryQuery = VertexDictionaryQuery;
