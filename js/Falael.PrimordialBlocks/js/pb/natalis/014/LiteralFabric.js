//	R0Q2?/daniel/20230916
//	- TEST: `walk::visit` - `true` and `false` return values
//	- DOC
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Fabric, Cardinality } = require("-/pb/natalis/013/Fabric.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0x455307 = tunable(0x455307);

module.exports =

//	Class: Abstracts the means to distinguish between void (`Unset`), atoms, countable composites and uncountable composites based on `Native.LiteralType`.
//	Remarks:
//		This class represents the "fabric" of the virtual "universe" containing all data of a JavaScript program. Atoms represent unbreakable values like `null` or `5`, composites represent values
//			capable of containing other values like `{}` and `[]`, and void represents the concept of nonexistance (`Object.prototype.hasOwnProperty.call(container, key)`).
//		The `LiteralFabric` class belongs to the `Transcribe` family of classes, which defines basic facilities for manipulation of ordered directed multigraphs.
//	Performance: To ensure method inlining and to reduce the number of operations, the code in the single method is kept to the minimum; no type safeguards are implemented and some 
//		assumptions are in place (see the documentation for each method).
//	See also: https://bic.wiki/wiki/Falael.Transcribe
class LiteralFabric extends Fabric
{
	static the = new LiteralFabric();

	//	Remarks: Only direct instances of the `Array` (`[]`, `new Array()`) and `Object` (`{}`, `new Object()`) types are considered to be of non-zero cardinality. Instances of classes
	//		extending `Array` or `Object` are considered to be of cardinality `Cardinality.Zero`.
	getVertexCardinality(vertex)
	{
		return vertex ? ((vertex.constructor === Array) ? Cardinality.AlephNull : (vertex.constructor === Object) ? Cardinality.AlephOne : Cardinality.Zero) : Cardinality.Zero;
	}

	//	Remarks: Integer labels are considered to be of `Cardinality.AlephNull`. All other labels are considered to be of `Cardinality.AlephOne`. It's up to the caller to
	//		validate the type of `Cardinality.AlephOne` labels.
	getLabelCardinality(label)
	{
		return Number.isSafeInteger(label) ? Cardinality.AlephNull : Cardinality.AlephOne;
	}

	//	Remarks: No `PB_DEBUG`-time type validation is performed on either `tail` or `label`.
	arcExists(tail, label)
	{
		return Object.prototype.hasOwnProperty.call(tail, label);
	}

	//	Remarks: No `PB_DEBUG`-time type validation is performed on `cardinality`. If `cardinality !== Cardinality.AlephNull && cardinality !== Cardinality.AlephOne` the
	//		function returns `void 0`.
	newComposite(cardinality)
	{
		return cardinality === Cardinality.AlephOne ? {} : cardinality === Cardinality.AlephNull ? [] : void 0;
	}

	//	Remarks: No `PB_DEBUG`-time type validation is performed on `count`. If `count` is not a number, the new array will contain `count` as a sole element. Decimal `count`
	//		will cause an exception.
	newCountable(count)
	{
		return count ? new Array(count) : [];
	}

	newUncountable()
	{
		return {};
	}

	//	Function: Performs a depth-first pre-order traversal of a graph; visits in order the graph root and all encountered graph arcs defined as array elements and string properties; implements the Stalker Protocol.
	//	Parameter: `visit(state: any, deltaOut: integer, head: any, headCardinality: Cardinality, label: string | integer, labelCardinality: Cardinality): boolean` - called on root vertex or arc encounter;
	//		Encodes the following graph cursor movement operations: root, in, side, out, unroot (see Remarks).
	//		- Parameter: `state` - visitor-specific state info shared between multiple calls of `visit`.
	//		- Parameter: `deltaOut: integer | null` - the number of steps towards the root the graph cursor has performed since the last visit (the number of steps away from root is not explicitly provided
	//			as it's either `1` when visiting an arc or `0` when visiting root or performing unroot):
	//			- `null` - visiting the root; this happens only once and is the first `visit` call during a traversal; `deltaOut` is not applicable;
	//			- with `headCardinality !== void 0` (visiting an arc)
	//				- `0` - dipping in one level - `0` steps towards the root, `1` step away from it;
	//				- `1` - moving sideways on the same depth level - `1` steps towards the root, `1` step away from it;
	//				- `>= 2` - moving towards the root - `deltaOut` steps towards the root, `1` step away from it;
	//			- with `headCardinality === void 0` (unroot)
	//				- `>= 1` - moving all the way towards the root't virtual, non-existent tail - `deltaOut` steps towards the root's tail.
	//		- Parameter: `head: any` - the head of the arc being visited or `void 0` with unroot;
	//		- Parameter: `headCardinality: Cardinality | void 0` - the cardinality of the head of the arc being visited or `void 0` with unroot;
	//		- Parameter: `label: string | integer | void 0` - the label of the arc being visited or `void 0` with root and unroot;
	//		- Parameter: `labelCardinality: Cardinality | void 0` - the cardinality of the label of the arc being visited or `void 0` with root and unroot;
	//		- Returns: If the callback returns `false` while visiting a composite, the arcs of the composite are not traversed; otherwise all arcs of the composite are traversed.
	//	Remarks:
	//		For terminology see https://bic.wiki/wiki/Falael.Transcribe.
	//		Graph cursor movement encoding:
	//		- root(): `labelCardinality === void 0` - visiting the graph root; this happens only once and is the first `visit` call during a traversal;
	//		- unroot(): `vertexCardinality === void 0` - visiting the non-existent tail of the graph root; this happens only once and is the last `visit` call during a traversal;
	//		- in(label): `deltaOut === 0` - visiting the head of the first arc (labeled `label`) that starts with the head of the previously visited arc - no cursor movement towards the root,
	//			`1` step away from the root(inwards);
	//		- side(label): `deltaOut === 1` - visiting the next arc (labeled `label`) that starts the head of the previously visited arc - one step towards the root, `1` step away
	//			from the root(inwards);
	//		- out(deltaOut): `deltaOut >= 2` - visiting the head of the next arc (labeled `label`) after recursively exhausing all arcs starting from some number of vertices in the
	//			current vertex chain - `N` steps towards the root, `1` step away from the root(inwards);
	//		Only the countable arcs (array elements) of countable grpahs (arrays) are visited; uncountable arcs (string and symbol properties) of countable grpahs (arrays) are ignored.
	//		Symbol properties are ignored in both countable and uncountable graphs.
	walk(visit, visitorState, root)
	{
		if (PB_DEBUG)
		{
			if (!Type.isCallable(visit)) throw new ArgumentException(0xBB6697, "visit", visit);
			//	-- `visitorState` can be anything
			//	-- `root` can be anything
		}

		const fabric = this;

		let pathLength = -1, visitedPathLength = 0;
		++pathLength;
		const headCardinality = fabric.getVertexCardinality(root);
		const outcome = visit(visitorState, null, root, headCardinality);
		if (PB_DEBUG)
		{
			if (!Type.isBoolean(outcome)) throw new ReturnValueException(0xD4DBCA, "visit", outcome);
		}
		if (outcome)
		{
			visitedPathLength = pathLength;
			if (headCardinality === Cardinality.AlephNull)
			{
				if (root.length < T_0x455307) for (let length = root.length, i = 0; i < length; ++i) _traverse(root[i], i, Cardinality.AlephNull);
				else for (const key in root)
				{
					const i = parseInt(key);
					if (Number.isNaN(i) || i < 0) continue;
					_traverse(root[i], i, Cardinality.AlephNull);
				}
			}
			else if (headCardinality === Cardinality.AlephOne) for (const key in root) _traverse(root[key], key, Cardinality.AlephOne);
		}
		--pathLength;
		const outcome2 = visit(visitorState, visitedPathLength - pathLength);
		if (!outcome2) throw new ReturnValueException(0xE75F69, "visit", outcome2);
		return visitorState;

		function _traverse(head, label, labelCardinality)
		{
			++pathLength;
			const headCardinality = fabric.getVertexCardinality(head);
			const outcome = visit(visitorState, visitedPathLength - pathLength + 1, head, headCardinality, label, labelCardinality);
			if (PB_DEBUG)
			{
				if (!Type.isBoolean(outcome)) throw new ReturnValueException(0x17D419, "visit", outcome);
			}
			visitedPathLength = pathLength;
			if (!outcome) { --pathLength; return; }
			if (headCardinality === Cardinality.AlephNull)
			{
				if (root.length < T_0x455307) for (let length = head.length, i = 0; i < length; ++i) _traverse(head[i], i, Cardinality.AlephNull);
				else for (const key in head)
				{
					const i = parseInt(key);
					if (Number.isNaN(i) || i < 0) continue;
					_traverse(head[i], i, Cardinality.AlephNull);
				}
			}
			else if (headCardinality === Cardinality.AlephOne) for (const key in head) _traverse(head[key], key, Cardinality.AlephOne);
			--pathLength;
		}
	}
}

module.exports.LiteralFabric = module.exports;
