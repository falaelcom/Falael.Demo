//	R0Q3?/daniel/20240609
//	- TODO: implement full interface for `Lean` and `Compact` cursors
//	- TODO: implement `Lean.buildMergePlan`
//	- TODO: provide all "*.to*" methods with a `fabric` param (would require also modifying `DotSharpNotation` to use a fabric for encoding and decoding of components, see `DotSharpNotation` in-file TODO-list);
//	- TODO: `GraphCursor.List.uniform`
//		- test the added `fabric` param
//		- DOC, TEST `GraphCursor.List.is`
//	- TODO: `CompactList.fuse`, `CompactList.spread`, `CompactList.rotate`, `CompactFormalList.fuse`, `CompactFormalList.spread`: implement the use of `targetOrSubject`, `offsetInTarget`, `batchProcessingConfig` (see `_GraphCursor_List.uniform`); DOC, TEST new implementation
//	- TODO: `Compact.create`, `CompactFormal.create` - shouldn't min length be `1`?
//	- TEST: `Lean.is`, `Compact.is`, `Compact.asCompactFormal`, `CompactFormal.asCompact`, `GraphCursor.equals(leftCursor, rightCursor)`
//	- DOC, TEST: `Lean.toDotSharpString/fromDotSharpString`, `Compact.toDotSharpString/fromDotSharpString`, `CompactFormal.toDotSharpString/fromDotSharpString`
//	- OPT: create own implementations of `Lean.toDotSharpString/fromDotSharpString`, `Compact.toDotSharpString`, `CompactFormal.toDotSharpString` (current implementation of `CompactFormal.toDotSharpString` creates an unnecessary array in the process)
//	- OPT: `GraphComposerTransaction` - a possible optimization would be to not record changes on graph subpaths for newly created cursors (this information is available at the merge plan building stage); also recording repeated modifications on the same graph path is redundant but it's not obvious that any deduplication attempt would be cheaper than bulk-recording and rollback
//	- OPT: implement a code-merged version of `Compact.buildMergePlan` + `GraphComposer.executeMergePlan` that omits the allocation and use of an intermediate merge plan and directly modifies the target graph, relying on `GraphComposerTransaction` for rollback on merge fail
//	- OPT: `Compact.rotate` - test performance with iteration and copy instead of slice/concat (no memory operations this way).

"use strict";

const { Unset, Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { ArgumentException, CircularReferenceException, NotImplementedException, InvalidOperationException, MergeConflictException } = require("-/pb/natalis/003/Exception.js");
const { Enum } = require("-/pb/natalis/011/Enum.js");
const { Fabric, Cardinality } = require("-/pb/natalis/013/Fabric.js");
const { LiteralFabric } = require("-/pb/natalis/014/LiteralFabric.js");
const { Compound, buf, isBuf, CompoundBuf, cbuf, BufPool } = require("-/pb/natalis/013/Compound.js"); 
const { DotSharpNotation } = require("-/pb/natalis/014/DotSharpNotation.js");
const { BatchProcessingConfig, InstanceHandling } = require("-/pb/natalis/014/BatchProcessingConfig.js");

const { tunable } = require("-/pb/natalis/010/Context.js");
const T_0x7E6183 = tunable(0x7E6183);
const T_0xBD1466 = tunable(0xBD1466);
const T_0x402757 = tunable(0x402757);
const T_0x78A43F = tunable(0x78A43F);
const T_0x4B0ECF = tunable(0x4B0ECF);

const GraphCursorList = Symbol("GraphCursorList");

//	Enum: Enumerates all possible merge decision flags and correspnding binary masks.
//	Remarks:
//		- _target vertex_ is the subject vertex another vertex is being merged into;
//		- _merging vertex_ is the vertex being merged into the target vertex;
//		e.g.
//		```
//			const targetVertexDef = { a: 1 };	//	target arc is `(1, "a", Uncountable)`; target vertex is the atom `1`
//			const mergingVertexDef = { a: 2 };	//	merging arc is `(2, "a", Uncountable)`; merging vertex is the atom `2`
//			const outcome = Object.assign(targetVertexDef, mergingVertexDef);
//			console.log(JSON.stringify(outcome) === JSON.stringify({ a: 2 }));	//	resulting arc is `(2, "a", Uncountable)`; resulting vertex is the atom `2`
//		```
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const MergeDecisions = Enum("MergeDecisions",
{
	//	Field: The `use-theirs` merge policy: overwrite all, except for `(void, void)`, `(countable, countable)` and `(uncountable, uncountable)`;
	//		keep `(void, void)`, `(countable, countable)` and`(uncountable, uncountable)`.
	//	Remarks: Using this policy with a `MergeInstruction.Delete` cursor head will delete the vertex at the specified path if the path can be traced, otherwise will create
	//		the corresponding missing containers up to the missing vertex. As this is usually not the desired behaviour, consider using the `MergeDecisions.SafeDelete` or `MergeDecisions.TryDelete`
	//		policies with `MergeInstruction.Delete` cursor heads.
	UseTheirs:                            ~~0b10111111111011111111111111111110,	//	-1074790402
	//	Field: The `safe-delete` merge policy:
	//		- overwrite `(atom, void)`, `(countable, void)` and `(uncountable, void)`;
	//		- keep all others;
	//	Remarks: Using this policy with a `MergeInstruction.Delete` cursor head will delete the vertex at the specified path if the path can be traced, otherwise the merging process will do nothing.
	SafeDelete:                           ~~0b10101011101010111010101110101010,	//	-1414812758
	//	Field: The `try-delete` merge policy:
	//		- overwrite `(atom, void)`, `(countable, void)` and `(uncountable, void)`;
	//		- keep `(void, void)`, `(countable, countable)` and `(uncountable, uncountable)`;
	//		- fail all others;
	//	Remarks: Using this policy with a `MergeInstruction.Delete` cursor head will delete the vertex at the specified path if the path can be traced, otherwise the merging process will fail.
	TryDelete:                            ~~0b10010111011001110101011101010110,	//	-1754835114

	//	Field: Mask for the `(void, void)` merge decision flags.
	VoidVoid:                               0b00000000000000000000000000000011,	//	3
	//	Field: Fail when an attempt is made to merge a void target vertext with a void merging vertex.
	VoidVoidFail:                           0b00000000000000000000000000000001,	//	1
	//	Field: Produce void when an attempt is made to merge a void target vertext with a void merging vertex (same as `MergeDecisions.VoidVoidOverwrite`).
	VoidVoidKeep:                           0b00000000000000000000000000000010,	//	2
	//	Field: Produce void when an attempt is made to merge a void target vertext with a void merging vertex (same as `MergeDecisions.VoidVoidKeep`).
	VoidVoidOverwrite:                      0b00000000000000000000000000000011,	//	3

	//	Field: Mask for the `(void, atom)` merge decision flags.
	VoidAtom:                               0b00000000000000000000000000001100,	//	12
	//	Field: Fail when an attempt is made to merge a void target vertext with an atom merging vertex.
	VoidAtomFail:                           0b00000000000000000000000000000100,	//	4
	//	Field: Produce void when an attempt is made to merge a void target vertext with an atom merging vertex.
	VoidAtomKeep:                           0b00000000000000000000000000001000,	//	8
	//	Field: Produce the atom merging vertex when an attempt is made to merge a void target vertext with an atom merging vertex.
	VoidAtomOverwrite:                      0b00000000000000000000000000001100,	//	12

	//	Field: Mask for the `(void, countable)` merge decision flags.
	VoidCountable:                          0b00000000000000000000000000110000,	//	48
	//	Field: Fail when an attempt is made to merge a void target vertext with a countable merging vertex.
	VoidCountableFail:                      0b00000000000000000000000000010000,	//	16
	//	Field: Produce void when an attempt is made to merge a void target vertext with a countable merging vertex.
	VoidCountableKeep:                      0b00000000000000000000000000100000,	//	32
	//	Field: Produce a new countable vertex when an attempt is made to merge a void target vertext with a countable merging vertex.
	VoidCountableOverwrite:                 0b00000000000000000000000000110000,	//	48

	//	Field: Mask for the `(void, uncountable)` merge decision flags.
	VoidUncountable:                        0b00000000000000000000000011000000,	//	192
	//	Field: Fail when an attempt is made to merge a void target vertext with an uncountable merging vertex.
	VoidUncountableFail:                    0b00000000000000000000000001000000,	//	64
	//	Field: Produce void when an attempt is made to merge a void target vertext with an uncountable merging vertex.
	VoidUncountableKeep:                    0b00000000000000000000000010000000,	//	128
	//	Field: Produce a new uncountable vertex when an attempt is made to merge a void target vertext with an uncountable merging vertex.
	VoidUncountableOverwrite:               0b00000000000000000000000011000000,	//	192

	//	Field: Mask for the `(atom, void)` merge decision flags.
	AtomVoid:                               0b00000000000000000000001100000000,	//	768
	//	Field: Fail when an attempt is made to merge an atom target vertext with a void merging vertex.
	AtomVoidFail:                           0b00000000000000000000000100000000,	//	256
	//	Field: Produce the atom target vertex when an attempt is made to merge an atom target vertext with a void merging vertex.
	AtomVoidKeep:                           0b00000000000000000000001000000000,	//	512
	//	Field: Produce void when an attempt is made to merge an atom target vertext with a void merging vertex.
	AtomVoidOverwrite:                      0b00000000000000000000001100000000,	//	768

	//	Field: Mask for the `(atom, atom)` merge decision flags.
	AtomAtom:                               0b00000000000000000000110000000000,	//	3072
	//	Field: Fail when an attempt is made to merge an atom target vertext with an atom merging vertex.
	AtomAtomFail:                           0b00000000000000000000010000000000,	//	1024
	//	Field: Produce the atom target vertex when an attempt is made to merge an atom target vertext with an atom merging vertex.
	AtomAtomKeep:                           0b00000000000000000000100000000000,	//	2048
	//	Field: Produce the atom merging vertex when an attempt is made to merge an atom target vertext with an atom merging vertex.
	AtomAtomOverwrite:                      0b00000000000000000000110000000000,	//	3072

	//	Field: Mask for the `(atom, countable)` merge decision flags.
	AtomCountable:                          0b00000000000000000011000000000000,	//	12288
	//	Field: Fail when an attempt is made to merge an atom target vertext with a countable merging vertex.
	AtomCountableFail:                      0b00000000000000000001000000000000,	//	4096
	//	Field: Produce the atom target vertex when an attempt is made to merge an atom target vertext with a countable merging vertex.
	AtomCountableKeep:                      0b00000000000000000010000000000000,	//	8192
	//	Field: Produce a new countable merging vertex when an attempt is made to merge an atom target vertext with a countable merging vertex.
	AtomCountableOverwrite:                 0b00000000000000000011000000000000,	//	12288

	//	Field: Mask for the `(atom, uncountable)` merge decision flags.
	AtomUncountable:                        0b00000000000000001100000000000000,	//	49152
	//	Field: Fail when an attempt is made to merge an atom target vertext with an uncountable merging vertex.
	AtomUncountableFail:                    0b00000000000000000100000000000000,	//	16384
	//	Field: Produce the atom target vertex when an attempt is made to merge an atom target vertext with an uncountable merging vertex.
	AtomUncountableKeep:                    0b00000000000000001000000000000000,	//	32768
	//	Field: Produce a new uncountable merging vertex when an attempt is made to merge an atom target vertext with an uncountable merging vertex.
	AtomUncountableOverwrite:               0b00000000000000001100000000000000,	//	49152

	//	Field: Mask for the `(countable, void)` merge decision flags.
	CountableVoid:                          0b00000000000000110000000000000000,	//	196608
	//	Field: Fail when an attempt is made to merge a countable target vertext with a void merging vertex.
	CountableVoidFail:                      0b00000000000000010000000000000000,	//	65536
	//	Field: Produce the countable target vertext when an attempt is made to merge a countable target vertext with a void merging vertex.
	CountableVoidKeep:                      0b00000000000000100000000000000000,	//	131072
	//	Field: Produce void when an attempt is made to merge a countable target vertext with a void merging vertex.
	CountableVoidOverwrite:                 0b00000000000000110000000000000000,	//	196608

	//	Field: Mask for the `(countable, atom)` merge decision flags.
	CountableAtom:                          0b00000000000011000000000000000000,	//	786432
	//	Field: Fail when an attempt is made to merge a countable target vertext with an atom merging vertex.
	CountableAtomFail:                      0b00000000000001000000000000000000,	//	262144
	//	Field: Produce countable target vertext when an attempt is made to merge a countable target vertext with an atom merging vertex.
	CountableAtomKeep:                      0b00000000000010000000000000000000,	//	524288
	//	Field: Produce the atom merging vertex when an attempt is made to merge a countable target vertext with an atom merging vertex.
	CountableAtomOverwrite:                 0b00000000000011000000000000000000,	//	786432

	//	Field: Mask for the `(countable, countable)` merge decision flags.
	CountableCountable:                     0b00000000001100000000000000000000,	//	3145728
	//	Field: Fail when an attempt is made to merge a countable target vertext with a countable merging vertex.
	CountableCountableFail:                 0b00000000000100000000000000000000,	//	1048576
	//	Field: Produce the target countable vertex when an attempt is made to merge a countable target vertext with a countable merging vertex.
	CountableCountableKeep:                 0b00000000001000000000000000000000,	//	2097152
	//	Field: Produce a new countable vertex when an attempt is made to merge a countable target vertext with a countable merging vertex.
	CountableCountableOverwrite:            0b00000000001100000000000000000000,	//	3145728

	//	Field: Mask for the `(countable, uncountable)` merge decision flags.
	CountableUncountable:                   0b00000000110000000000000000000000,	//	12582912
	//	Field: Fail when an attempt is made to merge a countable target vertext with an uncountable merging vertex.
	CountableUncountableFail:               0b00000000010000000000000000000000,	//	4194304
	//	Field: Produce the countable target vertext when an attempt is made to merge a countable target vertext with an uncountable merging vertex.
	CountableUncountableKeep:               0b00000000100000000000000000000000,	//	8388608
	//	Field: Produce a new uncountable vertex when an attempt is made to merge a countable target vertext with an uncountable merging vertex.
	CountableUncountableOverwrite:          0b00000000110000000000000000000000,	//	12582912

	//	Field: Mask for the `(uncountable, void)` merge decision flags.
	UncountableVoid:                        0b00000011000000000000000000000000,	//	50331648
	//	Field: Fail when an attempt is made to merge an uncountable target vertext with a void merging vertex.
	UncountableVoidFail:                    0b00000001000000000000000000000000,	//	16777216
	//	Field: Produce the uncountable target vertext when an attempt is made to merge an uncountable target vertext with a void merging vertex.
	UncountableVoidKeep:                    0b00000010000000000000000000000000,	//	33554432
	//	Field: Produce void when an attempt is made to merge an uncountable target vertext with a void merging vertex.
	UncountableVoidOverwrite:               0b00000011000000000000000000000000,	//	50331648

	//	Field: Mask for the `(uncountable, atom)` merge decision flags.
	UncountableAtom:                        0b00001100000000000000000000000000,	//	201326592
	//	Field: Fail when an attempt is made to merge an uncountable target vertext with an atom merging vertex.
	UncountableAtomFail:                    0b00000100000000000000000000000000,	//	67108864
	//	Field: Produce the uncountable target vertext when an attempt is made to merge an uncountable target vertext with an atom merging vertex.
	UncountableAtomKeep:                    0b00001000000000000000000000000000,	//	134217728
	//	Field: Produce the atom merging vertex when an attempt is made to merge an uncountable target vertext with an atom merging vertex.
	UncountableAtomOverwrite:               0b00001100000000000000000000000000,	//	201326592

	//	Field: Mask for the `(uncountable, countable)` merge decision flags.
	UncountableCountable:                   0b00110000000000000000000000000000,	//	805306368
	//	Field: Fail when an attempt is made to merge an uncountable target vertext with a countable merging vertex.
	UncountableCountableFail:               0b00010000000000000000000000000000,	//	268435456
	//	Field: Produce the uncountable target vertext when an attempt is made to merge an uncountable target vertext with a countable merging vertex.
	UncountableCountableKeep:               0b00100000000000000000000000000000,	//	536870912
	//	Field: Produce a new countable vertex when an attempt is made to merge an uncountable target vertext with a countable merging vertex.
	UncountableCountableOverwrite:          0b00110000000000000000000000000000,	//	805306368

	//	Field: Mask for the `(uncountable, uncountable)` merge decision flags.
	UncountableUncountable:               ~~0b11000000000000000000000000000000,	//	-3221225472
	//	Field: Fail when an attempt is made to merge an uncountable target vertext with an uncountable merging vertex.
	UncountableUncountableFail:             0b01000000000000000000000000000000,	//	1073741824
	//	Field: Produce uncountable target vertext when an attempt is made to merge an uncountable target vertext with a countable merging vertex.
	UncountableUncountableKeep:           ~~0b10000000000000000000000000000000,	//	-2147483648
	//	Field: Produce a new countable vertex when an attempt is made to merge an uncountable target vertext with a countable merging vertex.
	UncountableUncountableOverwrite:      ~~0b11000000000000000000000000000000,	//	-1073741824
});

const MergeAction = Enum("MergeAction",
{
	Fail: Symbol("Fail"),
	Noop: Symbol("Noop"),
	Set_NewCountable: Symbol("Set_NewCountable"),
	Set_NewUncountable: Symbol("Set_NewUncountable"),
	Set_Atom: Symbol("Set_Atom"),
	Delete: Symbol("Delete"),
});

const MergeInstruction = Enum("MergeInstruction",
{
	Delete: Symbol("Delete"),
});

//	used with `CompactFormal.spread`
const static_buf = buf();

//	Enum: Enumerates the compound types of the implemented graph cursor formats.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const GraphCursorType = Enum("GraphCursorType",
{
	//	Field: The compound buffer type for the lean procedural graph cursor format.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	Lean: Symbol("Lean"),
	//	Field: The compound buffer type for the compact procedural graph cursor format.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	Compact: Symbol("Compact"),
	//	Field: The compound buffer type for the compact formal graph cursor format, dot-sharp notation.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	CompactFormal: Symbol("CompactFormal"),
});

//	used with `Lean.toDotSharpString`, `Compact.toDotSharpString`
const convertBuffer_compactFormal = cbuf(GraphCursorType.CompactFormal);

//	Object: `GraphCursor` implements operations on the `Lean` and `Compact` graph cursor formats and lists of graph cursors including conversion between the both formats.
//	Remarks:
//		`Lean`, `Compact` and `CompactFormal` graph cursor formats offer different sets of operations suitable for the particular format.
//		The lean formal format is not implemented because it doesn't offer neither performance, nor usability advantage over converting between `Lean` and `CompactFormal` while
//			introducing ambiguity on how to implement the `fuse` and `spread` operations, characteristic for the formal graph path encoding.
//		A graph cursor list might consist of graph cursors of all supported formats.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const GraphCursor = 
{
	//	Field: The compound type for the graph cursor list compound.
	GraphCursorList,
}

//	Object: Implements operations on the `Lean` graph cursor format.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const Lean =
{
	//	Function: `is(cursor: any): boolean` - test whether `cursor` is a valid lean cursor (`cbuf<GraphCursorType.Lean>`).
	//	Parameter: `cursor: any` - the value to test; can be anything.
	//	Returns: `true` if `(CompoundBuf.isOf(cursor, GraphCursorType.Lean) && cursor.count >= 1) || cursor === Unset`, otherwise returns `false`.
	//	Remarks: `Unset` lean, compact and compact formal cursors represent a void head; `[Unset]` is an invalid compact or compact formal cursor.
	is(cursor)
	{
		return cursor === Unset || (CompoundBuf.isOf(cursor, GraphCursorType.Lean) && (cursor.count % 2 === 0 || (cursor.count === 1 && cursor[0] !== Unset)));
	},

	//	Function: `create(length: integer, bufferLength: integer): cbuf<GraphCursorType.Lean>` - creates new `GraphCursorType.Lean` compound buffer with the given `length` or
	//		length of `0` (default), and the `bufferLength` or buffer length of `tunable(0x7E6183)` (default).
	//	Parameter: `length: integer` - defaults to `0`; a non-negative integer specifying the length of the newly created compound (`result.count === length`).
	//	Parameter: `bufferLength: integer` - defaults to `tunable(0x7E6183)`; a positive integer specifying the native length of the new array (`result.length === bufferLength`).
	//	Returns: A new `cbuf<GraphCursorType.Lean>` instance, buffer length is `bufferLength` or `tunable(0x7E6183)` if `bufferLength` is not set.
	//	Performance: Allocates new memory.
	//	Exception: `ArgumentException`.
	//	Tunable: `0x7E6183`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	create(length = 0, bufferLength = T_0x7E6183)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(length) || length < 0) throw new ArgumentException(0x1ABFF0, "length", length);
			if (!Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0xB846D6, "bufferLength", bufferLength);
		}
		return cbuf(GraphCursorType.Lean, length, bufferLength);
	},

	fromDotSharpString(head, path, bufferLength = void 0)
	{
		return Compact.toLean(Compact.fromDotSharpString(head, path, bufferLength));
	},

	//	Function: `list(root: any, fabric: Fabric, lenient: boolean, createCursor: function(compoundType: Symbol, length: integer, bufferLength_suggested: integer): cbuf<GraphCursorType.Lean>, targetOrNew: cbuf<GraphCursor.GraphCursorList>): cbuf<GraphCursor.GraphCursorList>`
	//		- transcribes the `root` into a list of `Lean` graph cursors describing exhaustively the `root` graph.
	//	Parameter: `root: any` - the root graph.
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; the fabric for the transcription.
	//	Parameter: `lenient: boolean` - optional, defaults to `false`; if set to `true` disables circular references checks.
	//	Parameter: `createCursor: function(compoundType: Symbol, length: integer, bufferLength_suggested: integer): cbuf<GraphCursorType.Lean>` - optional; if a callback is provided it will be called to create new cursor instances during graph listing.
	//	Parameter: `targetOrNew: cbuf<GraphCursor.GraphCursorList>` - optional, if ommitted a new `cbuf<GraphCursor.GraphCursorList>` instance will be created and returned by the function;
	//		the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result at.
	//	Returns: A list of `GraphCursorType.Lean` graph cursors describing exhaustively the `root` graph.
	//	Remarks: By default the transcription process tracks visited graph vertices and throws a `CircularReferenceException` if a circular reference is encountered, preventing inifinite recursion.
	//		Setting `lenient` to `true` turns off this safegurad, which might provide peformance gain but exposes the application process to inifinite recursion. Setting `lenient` to `true` is
	//		recommended only in such cases when it's guaranteed that `root` is a tree with no circular references, e.g. when using this method on freshly parsed JSON.
	//	Exception: `ArgumentException`.
	//	Performance: Allocates new memory.
	//	Tunable: `0x7E6183`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	list(root, fabric = null, lenient = false, createCursor = null, targetOrNew = null, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isBoolean(lenient)) throw new ArgumentException(0xAC1506, "lenient", lenient);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x63ED90, "fabric", fabric);
			if (!Type.isNU(createCursor) && !CallableType.isFunction(createCursor)) throw new ArgumentException(0xD985EB, "createCursor", createCursor);
			if (!Type.isNU(targetOrNew) && !CompoundBuf.isOf(targetOrNew, GraphCursor.GraphCursorList)) throw new ArgumentException(0xB502E4, "targetOrNew", targetOrNew);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x9F1F3B, "offsetInTarget", offsetInTarget);
		}

		if (root === Unset) return Unset;

		const visitorState = { cursor: null, graphCursorType: GraphCursorType.Lean, offsetInTarget };

		if (createCursor) visitorState.createCursor = createCursor;
		else visitorState.graphCursorBufferLength = T_0x7E6183;

		if (targetOrNew)
		{
			visitorState.target = targetOrNew;
			targetOrNew.count = offsetInTarget;
		}
		else visitorState.target = Unset;

		if (!lenient) visitorState.visited = buf();

		return (fabric || LiteralFabric.the).walk(_leanCursorLister_visit, visitorState, root).target;
	},

	//	Function: `toCompact(cursor: cbuf<GraphCursorType.Lean>, targetOrSubject: cbuf<GraphCursorType.Compact>): cbuf<GraphCursorType.Compact>` - converts a graph cursor from lean format
	//		to compact format and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.Lean>` - a cursor to convert.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.Compact>` - defaults to `cursor`; the converted cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` converted to and augmented as `cbuf<GraphCursorType.Compact>` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing `cursor` in compact form.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Loops backwards when copying to `targetOrSubject`; this way if the size of the `target` buffer is less than `cursor.count / 2`, the first `targetOrSubject[cursor.count / 2 - 1]` assignment will force
	//			a one-time array expansion instead of incrementing the size of the array by 1 on each iteration.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toCompact(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.Lean)) throw new ArgumentException(0x20ACB0, "cursor", cursor);
			if (cursor !== Unset && cursor.count !== 1 && cursor.count % 2) throw new ArgumentException(0x38CFB3, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.Compact)) throw new ArgumentException(0xB1EBD7, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (!targetOrSubject)
		{
			if (cursor.count === 1) return CompoundBuf.augment(cursor, GraphCursorType.Compact, 1);
			for (let length = cursor.count, i = 3, j = 1; i < length; i += 2, ++j) cursor[j] = cursor[i];		//	move labels
			cursor[0] = cursor[cursor.count - 2];	//	value
			return CompoundBuf.augment(cursor, GraphCursorType.Compact, cursor.count / 2);
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		targetOrSubject[0] = cursor[cursor.count - 2];	//	value
		for (let i = cursor.count - 1, j = cursor.count / 2 - 1; i >= 3; i -= 2, --j) targetOrSubject[j] = cursor[i];		//	copy labels
		targetOrSubject.count = cursor.count / 2;
		return targetOrSubject;
	},

	//	Function: `toCompactFormal(cursor: cbuf<GraphCursorType.Lean>, targetOrSubject: cbuf<GraphCursorType.CompactFormal>): cbuf<GraphCursorType.CompactFormal>` - converts a graph cursor
	//		from lean format to compact-formal format, `DotSharpNotation` notation, and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.Lean>` - a cursor to convert.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.CompactFormal>` - defaults to `cursor`; the converted cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` converted to and augmented as `cbuf<GraphCursorType.CompactFormal>` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing `cursor` in compact formal form, `DotSharpNotation` notation.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Loops backwards when copying to `targetOrSubject`; this way if the size of the `targetOrSubject` buffer is less than `cursor.count / 2`, the first `targetOrSubject[cursor.count / 2 - 1]` assignment will force
	//			a one-time array expansion instead of incrementing the size of the array by 1 on each iteration.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toCompactFormal(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.Lean)) throw new ArgumentException(0x16F7C8, "cursor", cursor);
			if (cursor !== Unset && cursor.count !== 1 && cursor.count % 2) throw new ArgumentException(0x93C063, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.CompactFormal)) throw new ArgumentException(0xA80C93, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (!targetOrSubject)
		{
			if (cursor.count === 1) return CompoundBuf.augment(cursor, GraphCursorType.CompactFormal, 1);
			for (let length = cursor.count, i = 3, j = 1; i < length; i += 2, ++j) cursor[j] = DotSharpNotation.encodeComponent(cursor[i]);		//	move and encode labels
			cursor[0] = cursor[cursor.count - 2];	//	value
			return CompoundBuf.augment(cursor, GraphCursorType.CompactFormal, cursor.count / 2);
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		targetOrSubject[0] = cursor[cursor.count - 2];	//	value
		for (let i = cursor.count - 1, j = cursor.count / 2 - 1; i >= 3; i -= 2, --j) targetOrSubject[j] = DotSharpNotation.encodeComponent(cursor[i]);		//	copy and encode labels
		targetOrSubject.count = cursor.count / 2;
		return targetOrSubject;
	},

	toDotSharpString(cursor)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.Lean)) throw new ArgumentException(0xAAFFF3, "cursor", cursor);
			if (cursor !== Unset && cursor.count !== 1 && cursor.count % 2) throw new ArgumentException(0xA2F6E2, "cursor", cursor);
		}
		return CompactFormal.toDotSharpString(this.toCompactFormal(cursor, convertBuffer_compactFormal));
	},
}

//	Object: Implements operations on the `Compact` graph cursor format.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const Compact =
{
	//	Function: `is(cursor: any): boolean` - test whether `cursor` is a valid compact cursor (`cbuf<GraphCursorType.Compact>`).
	//	Parameter: `cursor: any` - the value to test; can be anything.
	//	Returns: `true` if `cursor === Unset || (CompoundBuf.isOf(cursor, GraphCursorType.Compact) && (cursor.count > 1 || (cursor.count === 1 && cursor[0] !== Unset)))`, otherwise returns `false`.
	//	Remarks: `Unset` lean, compact and compact formal cursors represent a void head; `[Unset]` is an invalid compact or compact formal cursor.
	is(cursor)
	{
		return cursor === Unset || (CompoundBuf.isOf(cursor, GraphCursorType.Compact) && (cursor.count > 1 || (cursor.count === 1 && cursor[0] !== Unset)));
	},

	//	Function: `create(length: integer, bufferLength: integer): cbuf<GraphCursorType.Compact>` - creates new `GraphCursorType.Compact` compound buffer with the given `length`
	//		or length of `0` (default), and the `bufferLength` or buffer length of `tunable(0xBD1466)` (default).
	//	Parameter: `length: integer` - defaults to `0`; a non-negative integer specifying the length of the newly created compound (`result.count === length`).
	//	Parameter: `bufferLength: integer` - defaults to `tunable(0xBD1466)`; a positive integer specifying the native length of the new array (`result.length === bufferLength`).
	//	Returns: A new `cbuf<GraphCursorType.Compact>` instance, buffer length is `bufferLength` or `tunable(0xBD1466)` if `bufferLength` is not set.
	//	Exception: `ArgumentException`.
	//	Performance: Allocates new memory.
	//	Tunable: `0xBD1466`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	create(length = 0, bufferLength = T_0xBD1466)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(length) || length < 0) throw new ArgumentException(0xA52A53, "length", length);
			if (!Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0xB85FE4, "bufferLength", bufferLength);
		}
		return cbuf(GraphCursorType.Compact, length, bufferLength);
	},

	fromDotSharpString(head, path, bufferLength = void 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(path)) throw new ArgumentException(0x9318BA, "path", path);
			if (bufferLength !== void 0 && !Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0x1373DD, "bufferLength", bufferLength);
		}
		const result = Compact.create(1, bufferLength);
		result[0] = head;
		DotSharpNotation.parse(path, result, 1);
		return result;
	},

	//	Function: `list(root: any, fabric: Fabric, lenient: boolean, createCursor: function(compoundType: Symbol, length: integer, bufferLength_suggested: integer): cbuf<GraphCursorType.Compact>, targetOrNew: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer): cbuf<GraphCursor.GraphCursorList>` - transcribes the `root` into a list of `Compact` graph cursors describing exhaustively the `root` graph.
	//	Parameter: `root: any` - the root graph.
	//	Parameter: `fabric: Fabric` - the fabric for the transcription; defaults to `LiteralFabric.the`.
	//	Parameter: `lenient: boolean` - if set to `true` disables circular references checks; defaults to `false`.
	//	Parameter: `createCursor: function(compoundType: Symbol, length: integer, bufferLength_suggested: integer): cbuf<GraphCursorType.Compact>` - optional; if a callback is provided it will be called to create new cursor instances during graph listing.
	//	Parameter: `targetOrNew: cbuf<GraphCursor.GraphCursorList>` - defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result at.
	//	Returns: A list of `GraphCursorType.Compact` graph cursors describing exhaustively the `root` graph.
	//	Remarks: By default the transcription process tracks visited graph vertices and throws a `CircularReferenceException` if a circular reference is encountered, preventing inifinite recursion.
	//		Setting `lenient` to `true` turns off this safegurad, which might provide peformance gain but exposes the application process to inifinite recursion. Setting `lenient` to `true` is
	//		recommended only in such cases when it's guaranteed that `root` is a tree with no circular references, e.g. when using this method on freshly parsed JSON.
	//	Exception: `ArgumentException`.
	//	Performance: Allocates new memory.
	//	Tunable: `0xBD1466`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	list(root, fabric = null, lenient = false, createCursor = null, targetOrNew = null, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x736888, "fabric", fabric);
			if (!Type.isBoolean(lenient)) throw new ArgumentException(0xC0A8F7, "lenient", lenient);
			if (!Type.isNU(createCursor) && !CallableType.isFunction(createCursor)) throw new ArgumentException(0xF169FD, "createCursor", createCursor);
			if (!Type.isNU(targetOrNew) && !CompoundBuf.isOf(targetOrNew, GraphCursor.GraphCursorList)) throw new ArgumentException(0x4CEABF, "targetOrNew", targetOrNew);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0xF242CC, "offsetInTarget", offsetInTarget);
		}

		if (root === Unset) return Unset;

		const visitorState = { cursor: null, graphCursorType: GraphCursorType.Compact, offsetInTarget };

		if (createCursor) visitorState.createCursor = createCursor;
		else visitorState.graphCursorBufferLength = T_0xBD1466;

		if (targetOrNew)
		{
			visitorState.target = targetOrNew;
			targetOrNew.count = offsetInTarget;
		}
		else visitorState.target = Unset;

		if (!lenient) visitorState.visited = buf();

		return (fabric || LiteralFabric.the).walk(_compactCursorLister_visit, visitorState, root).target;
	},

	//	Function: `asCompactFormal(cursor: cbuf<GraphCursorType.Compact>): cbuf<GraphCursorType.CompactFormal>` - changes the type of `cursor` from compact format to compact-formal format.
	//	Parameter: `cursor: cbuf<GraphCursorType.Compact>` - a cursor to convert.
	//	Returns: `cursor` as `cbuf<GraphCursorType.CompactFormal>` (`Unset` if `cursor === Unset`).
	//	Remarks: This function changes the type of (casts) `cursor` from `GraphCursorType.Compact` to `GraphCursorType.CompactFormal` without modifying its elements in any way.
	//	Exception: `ArgumentException`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	asCompactFormal(cursor)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0x6C4C40, "cursor", cursor);
		}
		if (cursor === Unset) return Unset;
		return CompoundBuf.setType(cursor, GraphCursorType.CompactFormal);
	},

	//	Function: `toCompactFormal(cursor: cbuf<GraphCursorType.Compact>, targetOrSubject: cbuf<GraphCursorType.CompactFormal>): cbuf<GraphCursorType.CompactFormal>` - converts a graph cursor from
	//		compact format to compact-formal format, `DotSharpNotation` notation, and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.Compact>` - a cursor to convert.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.CompactFormal>` - defaults to `cursor`; the converted cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` converted to and augmented as `cbuf<GraphCursorType.CompactFormal>` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing `cursor` in compact formal form, `DotSharpNotation` notation.
	//	Remarks:
	//		This function produces a graph path with all graph path labels encoded in via `DotSharpNotation.encodeComponent`.
	//		The buffer length of the resulting compund equals `cursor.count`.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Loops backwards when copying to `targetOrSubject`; this way if the size of the `targetOrSubject` buffer is less than `cursor.count`, the first `targetOrSubject[cursor.count - 1]` assignment will force
	//			a one-time array expansion instead of incrementing the size of the array by 1 on each iteration.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toCompactFormal(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0xD7260B, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.CompactFormal)) throw new ArgumentException(0xF4CE48, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (!targetOrSubject)
		{
			if (cursor.count === 1) return CompoundBuf.augment(cursor, GraphCursorType.CompactFormal, 1);
			//	`i = 1` explanation - the value at [0] stays unmodified and unmoved
			for (let length = cursor.count, i = 1; i < length; ++i) cursor[i] = DotSharpNotation.encodeComponent(cursor[i]);
			return CompoundBuf.augment(cursor, GraphCursorType.CompactFormal, cursor.count);
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		targetOrSubject[0] = cursor[0];	//	value
		for (let i = cursor.count - 1; i >= 1; --i) targetOrSubject[i] = DotSharpNotation.encodeComponent(cursor[i]);
		targetOrSubject.count = cursor.count;
		return targetOrSubject;
	},

	//	Function: `toCompactFormalFused(cursor: cbuf<GraphCursorType.Compact>, targetOrSubject: cbuf<GraphCursorType.CompactFormal>): cbuf<GraphCursorType.CompactFormal>` - fuses all cursor graph
	//		path expression components into a single graph path expression component using `DotSharpNotation` notation and returns either `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.Compact>` - a cursor to fuse.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.CompactFormal>` - defaults to `cursor`; the modified cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` in fused form and augmented as `GraphCursorType.CompactFormal` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject: cbuf<GraphCursorType.CompactFormal>` containing the fused form of `cursor`.
	//		Buffer length is either `1` (atomic root) or `2` (fused form with a non-atomic root).
	//		This method returns a cursor of `GraphCursorType.CompactFormal`.
	//	Remarks:
	//		Examples
	//		- `[1, 0]` -> `[1, 0]`
	//		- `[1, 0, 0]` -> `[1, "#0#0"]`
	//		- `[1, "a", "b", "#0", 1]` -> `[1, "a.b.\\\\#0.#1"]`
	//		Unlike `CompactFormal.fuse`, this implementation interprets all `cursor` uncountable labels as informal literals.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Using `DotSharpNotation.append`, which performs string concatenations, in JavaScript (v8, SpiderMonkey) is faster than the `Array.join` alternative.
	//	See also: `GraphCursor.CompactFormal.spread`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toCompactFormalFused(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.Compact)) throw new ArgumentException(0xC64646, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.CompactFormal)) throw new ArgumentException(0x48B4E7, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (!targetOrSubject)
		{
			CompoundBuf.augment(cursor, GraphCursorType.CompactFormal);
			if (cursor.count === 1) return cursor;	//	operation is not applicable; `cursor.count === 1` indicates an atomic root, and there are no labels to fuse
			let path = null;
			for (let length = cursor.count, i = 1; i < length; ++i) path = DotSharpNotation.append(path, DotSharpNotation.encodeComponent(cursor[i]));
			//	`cursor[0]` - cursor head stays unchanged
			cursor[1] = path;			//	graph path expression
			cursor.count = 2;
			return cursor;
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;	//	operation is not applicable; `cursor.count === 1` indicates an atomic root, and there are no labels to fuse
		}
		let path = null;
		for (let length = cursor.count, i = 1; i < length; ++i) path = DotSharpNotation.append(path, DotSharpNotation.encodeComponent(cursor[i]));
		targetOrSubject[1] = path;			//	graph path expression
		targetOrSubject[0] = cursor[0];		//	head
		targetOrSubject.count = 2;
		return targetOrSubject;
	},

	//	Function: `toLean(cursor: cbuf<GraphCursorType.Compact>, targetOrSubject: cbuf<GraphCursorType.Lean>, fabric: Fabric): cbuf<GraphCursorType.Lean>` - converts a graph cursor
	//		from compact format to lean format and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.Compact>` - a cursor to convert.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.Lean>` - defaults to `cursor`; the converted cursor is stored in this compound buffer.
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; the fabric to use for label cardinality determination.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` converted to and augmented as `cbuf<GraphCursorType.Lean>` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing `cursor` in lean form.
	//	Remarks: Buffer length of the returned buffer is `1` or `2 * cursor.count`.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Loops backwards when copying to `targetOrSubject`; this way if the size of the `targetOrSubject` buffer is less than `2 * cursor.count`, the first `targetOrSubject[2 * cursor.count - 1]` assignment will force
	//			a one-time array expansion instead of incrementing the size of the array by 1 on each iteration.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toLean(cursor, targetOrSubject = null, fabric = null)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0xC550CE, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.Lean)) throw new ArgumentException(0x7F890A, "targetOrSubject", targetOrSubject);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0xBC60FA, "fabric", fabric);
		}
		if (cursor === Unset) return Unset;
		if (!fabric) fabric = LiteralFabric.the;
		if (!targetOrSubject)
		{
			if (cursor.count === 1) return CompoundBuf.augment(cursor, GraphCursorType.Lean, 1);
			cursor[2 * cursor.count - 2] = cursor[0];	//	value
			for (let i = cursor.count - 1, j = 2 * cursor.count - 1; i >= 1; --i, j -= 2)
			{
				const item = cursor[i];
				cursor[j] = item;
				cursor[j - 3] = fabric.getLabelCardinality(item);
			}
			cursor[1] = null;							//	reserved
			return CompoundBuf.augment(cursor, GraphCursorType.Lean, 2 * cursor.count);
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		targetOrSubject[2 * cursor.count - 2] = cursor[0];	//	value
		targetOrSubject[1] = null;							//	reserved
		for (let i = cursor.count - 1, j = 2 * cursor.count - 1; i >= 1; --i, j -= 2)
		{
			const item = cursor[i];
			targetOrSubject[j] = item;
			targetOrSubject[j - 3] = fabric.getLabelCardinality(item);
		}
		targetOrSubject.count = 2 * cursor.count;
		return targetOrSubject;
	},

	toDotSharpString(cursor)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0xC93F51, "cursor", cursor);
		}
		return CompactFormal.toDotSharpString(this.toCompactFormal(cursor, convertBuffer_compactFormal));
	},

	//	Function: `rotate(cursor: cbuf<GraphCursorType.Compact>, count: integer, targetOrSubject: cbuf<GraphCursorType.Compact>): cbuf<GraphCursorType.Compact>` - rotates the path of the graph cursor
	//		and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.Compact>` - a cursor to rotate.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.Compact>` - defaults to `cursor`; the rotated cursor is stored in this compound buffer.
	//	Parameter: `count: integer` - the number of rotation steps to perform:
	//		- `count === 0` or `!(count % (cursor.count - 1))` - no rotation;
	//		- `count > 0` - right rotation (`count === 1`, `[5, "a", "b", "c"]` => `[5, "c", "a", "b"]`);
	//		- `count < 0` - left rotation (`count === -1`, `[5, "a", "b", "c"]` => `[5, "b", "c", "a"]`).
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- the rotatetd `cursor` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing the rotatetd `cursor`.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Needs optimization, see "GraphCursor.js"'s TODO list.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	rotate(cursor, count, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0x2E2D2B, "cursor", cursor);
			if (!Type.isInteger(count)) throw new ArgumentException(0xA5C682, "count", count);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.Compact)) throw new ArgumentException(0xA13D0C, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (count === 0 || cursor.count === 0 || !(count % (cursor.count - 1)))
		{
			if (!targetOrSubject || targetOrSubject === cursor) return cursor;
			return CompoundBuf.copyTo(cursor, targetOrSubject);
		}
		if (count < 0) count = -count % (cursor.count - 1);
		else count = cursor.count - count % (cursor.count - 1) - 1;
		let result = [cursor[0]];	//	value
		result = result.concat(cursor.slice(count + 1, cursor.count));
		if (result.length <= cursor.count) result = result.concat(cursor.slice(1, 1 + count));
		else result = result.concat(cursor.slice(1, 1 + count + result.length - cursor.count));
		if (!targetOrSubject || targetOrSubject === cursor) return CompoundBuf.copyTo(CompoundBuf.augment(result, GraphCursorType.Compact, cursor.count), cursor);
		return CompoundBuf.copyTo(CompoundBuf.augment(result, GraphCursorType.Compact, cursor.count), targetOrSubject);
	},

	//	Function: `buildMergePlan(cursor: Compact | Unset, target: *, mergePolicy: MergeDecisions, fabric: Fabric, outcomeBuf: buf): buf` - creates a merge plan for merging `cursor` into
	//		`target` considering the `mergePolicy` for making of merge decisions and using `fabric` for determining label- and vertex cardinality and testing for arc existence.
	//	Parameter: `cursor: Compact | Unset` - the compact cursor to merge into the `target` graph.
	//	Parameter: `target: *` - a graph to merge `cursor` into; `Unset` value is treated as a void graph root (non-exiting graph).
	//	Parameter: `mergePolicy: MergeDecisions` - a number representing a binary set of merge decisions covering all merge cases when a merge decision has to be made for the
	//		given (`target`, `cursor`) pair; if the values of `target` and `cursor` are not known beforehand, all possible cases should be covered:
	//		`MergeDecisions.VoidVoid, MergeDecisions.VoidAtom, MergeDecisions.VoidCountable, MergeDecisions.VoidUncountable, MergeDecisions.AtomVoid, MergeDecisions.AtomAtom,`
	//		`MergeDecisions.AtomCountable, MergeDecisions.AtomUncountable, MergeDecisions.CountableVoid, MergeDecisions.CountableAtom, MergeDecisions.CountableCountable,`
	//		`MergeDecisions.CountableUncountable, MergeDecisions.UncountableVoid, MergeDecisions.UncountableAtom, MergeDecisions.UncountableCountable,`
	//		`MergeDecisions.UncountableUncountable`; for each of the listed masks, a decision should then be provided, e.g.
	//		`mergePolicy = MergeDecisions.VoidVoidKeep | MergeDecisions.VoidAtomOverwrite | MergeDecisions.VoidUncountableOverwrite | MergeDecisions.AtomVoidFail | ...`.
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; the fabric to use for determining label- and vertex cardinality and testing arc existence.
	//	Parameter: `outcomeBuf: buf` - optional, defaults to a preallocated file-static buffer (see Remarks); used to store the resulting merge plan.
	//	Returns: a `buf` (either `outcomeBuf` or a preallocated file-static buffer) containing a merge plan; an empty buffer is a possible return value; the following example illustrates
	//		the schema of the outcome of the function:
	//		```
	//		[
	//			MergeAction.Set_NewCountable,			//	action 0: replace target's root with a new countable, i.e. []
	//			MergeAction.Set_NewUncountable,			//	action 1: create a new uncountable, i.e. {} ...
	//			0,											//		... and put it as the first element of the array created at action 0
	//			MergeAction.Set_Atom,					//	action 2: set a property of the object, created at action 1 ...
	//			"propname",									//		... named "propname" ...
	//			5											//		... and with value 5
	//		]
	//		```
	//		Read the nested functions at the end of the body of `buildMergePlan` for details.
	//	Exception: `ArgumentException`.
	//	Exception: `InvalidOperationException`.
	//	Exception: `NotImplementedException`.
	//	Remarks:
	//		`MergeDecisions` offer three predefined merge policies for use with the `mergePolicy` parameter:
	//			- `MergeDecisions.UseTheirs` - overwrite all, except for `(void, void)`, `(countable, countable)` and `(uncountable, uncountable)`; keep `(void, void)`,
	//				`(countable, countable)` and`(uncountable, uncountable)`; applicable to most merge scenarios, except in case the `cursor` head is `MergeInstruction.Delete`;
	//			- `MergeDecisions.SafeDelete` - The `safe-delete` merge policy: overwrite `(atom, void)`, `(countable, void)` and `(uncountable, void)`; keep all others; causes
	//				the merge process to delete the specified vertex from the `target` graph or do nothing if the vertex does not exist; applicable in case the `cursor` head is
	//				`MergeInstruction.Delete`;
	//			- `MergeDecisions.TryDelete` - The `try-delete` merge policy: overwrite `(atom, void)`, `(countable, void)` and `(uncountable, void)`; keep `(void, void)`,
	//				`(countable, countable)` and `(uncountable, uncountable)`; fail all others; causes the merge process to delete the specified vertex from the `target` graph
	//				or fail if the vertex does not exist; applicable in case the `cursor` head is `MergeInstruction.Delete`.
	//		The behavior of the function exactly matches the behavior prescribed under the "Graph Construction" section in https://bic.wiki/wiki/Falael.Transcribe.
	//		Reading the unit test cases for this function can be very informative as well.
	//	Performance: If `outcomeBuf` is ommitted, a preallocated file-static buffer is used and returned by the function, sparing memory allocation. In such case is important to use the result
	//		before any other calls of `Compact.buildMergePlan` and before any async code is executed, otherwise the content of the buffer might change unpredictably.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	buildMergePlan(cursor, target, mergePolicy, fabric = null, outcomeBuf = null)
	{
		if (PB_DEBUG)
		{
			if (!Compact.is(cursor)) throw new ArgumentException(0x7B9BC3, "cursor", cursor);
			//	--- target may be anything
			if (!Type.isInteger(mergePolicy)) throw new ArgumentException(0x6356A5, "mergePolicy", mergePolicy);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x3EBDEF, "fabric", fabric);
			if (!Type.isNU(outcomeBuf) && !isBuf(outcomeBuf)) throw new ArgumentException(0xF487D7, "outcomeBuf", outcomeBuf);
		}

		if (!fabric) fabric = LiteralFabric.the;
		if (!outcomeBuf) outcomeBuf = buf();

		let targetExhausted = false;
		let abort = false;
		let lastNoopLength = -1;
		let lastNonNoopLength = 0;

		reset();

		//	UNIT-TESTED
		if (cursor === Unset)	//	`cursor === Unset` represents a compact cursor with a void head
		{
			if (target === Unset)
			{
				switch (mergePolicy & MergeDecisions.VoidVoid)
				{
					case MergeDecisions.VoidVoidOverwrite: break;
					case MergeDecisions.VoidVoidKeep: break;
					case MergeDecisions.VoidVoidFail: root_fail(0x88CB47); break;
					default: throw new NotImplementedException(0x952324);
				}
				return outcomeBuf;
			}
			switch (fabric.getVertexCardinality(target))
			{
				case Cardinality.Zero:
					switch (mergePolicy & MergeDecisions.AtomVoid)
					{
						case MergeDecisions.AtomVoidOverwrite: root_remove(); break;
						case MergeDecisions.AtomVoidKeep: break;
						case MergeDecisions.AtomVoidFail: root_fail(0x8B5B8B); break;
						default: throw new NotImplementedException(0xFB4D64);
					}
					break;
				case Cardinality.AlephNull:
					switch (mergePolicy & MergeDecisions.CountableVoid)
					{
						case MergeDecisions.CountableVoidOverwrite: root_remove(); break;
						case MergeDecisions.CountableVoidKeep: break;
						case MergeDecisions.CountableVoidFail: root_fail(0x10F757); break;
						default: throw new NotImplementedException(0xC65890);
					}
					break;
				case Cardinality.AlephOne:
					switch (mergePolicy & MergeDecisions.UncountableVoid)
					{
						case MergeDecisions.UncountableVoidOverwrite: root_remove(); break;
						case MergeDecisions.UncountableVoidKeep: break;
						case MergeDecisions.UncountableVoidFail: root_fail(0xFADC6B); break;
						default: throw new NotImplementedException(0xEFD041);
					}
					break;
				default: throw new NotImplementedException(0xB83C06);
			}
			return outcomeBuf;
		}

		//	UNIT-TESTED
		const cursorRoot = cursor.count === 1 ? cursor[0] : fabric.getLabelCardinality(cursor[1]);
		switch (cursorRoot)
		{
			case MergeInstruction.Delete: throw new NotImplementedException(0xA1528F);
			case Cardinality.AlephNull:
				if (target === Unset) switch (mergePolicy & MergeDecisions.VoidCountable)
				{
					case MergeDecisions.VoidCountableOverwrite: root_newCountable(); break;
					case MergeDecisions.VoidCountableKeep: (cursor.count !== 1) && root_noop(); break;
					case MergeDecisions.VoidCountableFail: root_fail(0x1BEC77); break;
					default: throw new NotImplementedException(0xAE110C);
				}
				else switch (fabric.getVertexCardinality(target))
				{
					case Cardinality.Zero:
						switch (mergePolicy & MergeDecisions.AtomCountable)
						{
							case MergeDecisions.AtomCountableOverwrite: root_newCountable(); break;
							case MergeDecisions.AtomCountableKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.AtomCountableFail: root_fail(0xD81CE3); break;
							default: throw new NotImplementedException(0xEC2B51);
						}
						break;
					case Cardinality.AlephNull:
						switch (mergePolicy & MergeDecisions.CountableCountable)
						{
							case MergeDecisions.CountableCountableOverwrite: root_newCountable(); break;
							case MergeDecisions.CountableCountableKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.CountableCountableFail: root_fail(0x3345A2); break;
							default: throw new NotImplementedException(0xB3CDF6);
						}
						break;
					case Cardinality.AlephOne:
						switch (mergePolicy & MergeDecisions.UncountableCountable)
						{
							case MergeDecisions.UncountableCountableOverwrite: root_newCountable(); break;
							case MergeDecisions.UncountableCountableKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.UncountableCountableFail: root_fail(0xDAE0DD); break;
							default: throw new NotImplementedException(0xC320EB);
						}
						break;
					default: throw new NotImplementedException(0x17E3AF);
				}
				break;
			case Cardinality.AlephOne:
				if (target === Unset) switch (mergePolicy & MergeDecisions.VoidUncountable)
				{
					case MergeDecisions.VoidUncountableOverwrite: root_newUncountable(); break;
					case MergeDecisions.VoidUncountableKeep: (cursor.count !== 1) && root_noop(); break;
					case MergeDecisions.VoidUncountableFail: root_fail(0xA538D2); break;
					default: throw new NotImplementedException(0x6D68AC);
				}
				else switch (fabric.getVertexCardinality(target))
				{
					case Cardinality.Zero:
						switch (mergePolicy & MergeDecisions.AtomUncountable)
						{
							case MergeDecisions.AtomUncountableOverwrite: root_newUncountable(); break;
							case MergeDecisions.AtomUncountableKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.AtomUncountableFail: root_fail(0x9FD6AD); break;
							default: throw new NotImplementedException(0x565668);
						}
						break;
					case Cardinality.AlephNull:
						switch (mergePolicy & MergeDecisions.CountableUncountable)
						{
							case MergeDecisions.CountableUncountableOverwrite: root_newUncountable(); break;
							case MergeDecisions.CountableUncountableKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.CountableUncountableFail: root_fail(0xBCB8F2); break;
							default: throw new NotImplementedException(0x79F0A3);
						}
						break;
					case Cardinality.AlephOne:
						switch (mergePolicy & MergeDecisions.UncountableUncountable)
						{
							case MergeDecisions.UncountableUncountableOverwrite: root_newUncountable(); break;
							case MergeDecisions.UncountableUncountableKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.UncountableUncountableFail: root_fail(0x1058AC); break;
							default: throw new NotImplementedException(0xAF4EB0);
						}
						break;
					default: throw new NotImplementedException(0xFB4EC5);
				}
				break;
			default:	//	`Cardinality.Zero` is implied
				if (target === Unset) switch (mergePolicy & MergeDecisions.VoidAtom)
				{
					case MergeDecisions.VoidAtomOverwrite: root_atom(cursorRoot); break;
					case MergeDecisions.VoidAtomKeep: (cursor.count !== 1) && root_noop(); break;
					case MergeDecisions.VoidAtomFail: root_fail(0x96E684); break;
					default: throw new NotImplementedException(0x3747C1);
				}
				else switch (fabric.getVertexCardinality(target))
				{
					case Cardinality.Zero:
						switch (mergePolicy & MergeDecisions.AtomAtom)
						{
							case MergeDecisions.AtomAtomOverwrite: root_atom(cursorRoot); break;
							case MergeDecisions.AtomAtomKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.AtomAtomFail: root_fail(0x72F4AC); break;
							default: throw new NotImplementedException(0x7626BE);
						}
						break;
					case Cardinality.AlephNull:
						switch (mergePolicy & MergeDecisions.CountableAtom)
						{
							case MergeDecisions.CountableAtomOverwrite: root_atom(cursorRoot); break;
							case MergeDecisions.CountableAtomKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.CountableAtomFail: root_fail(0x17B0B5); break;
							default: throw new NotImplementedException(0x90E719);
						}
						break;
					case Cardinality.AlephOne:
						switch (mergePolicy & MergeDecisions.UncountableAtom)
						{
							case MergeDecisions.UncountableAtomOverwrite: root_atom(cursorRoot); break;
							case MergeDecisions.UncountableAtomKeep: (cursor.count !== 1) && root_noop(); break;
							case MergeDecisions.UncountableAtomFail: root_fail(0x26D0F2); break;
							default: throw new NotImplementedException(0xF05DA0);
						}
						break;
					default: throw new NotImplementedException(0xE11924);
				}
				break;
		}
		if (cursor.count === 1) return outcomeBuf;

		//	PARTIALLY UNIT-TESTED
		let head = cursor[0];
		let label = cursor[1];
		let labelCardinality = fabric.getLabelCardinality(label);
		let labelPrev;
		targetExhausted = !fabric.arcExists(target, label);
		let targetVertex;
		(!targetExhausted) && (targetVertex = target[label]);
		for (let length = cursor.count, i = 2; i < length; ++i)	//	`i === 1` has been already processed under `const cursorRoot = cursor.count === 1 ? head : fabric.getLabelCardinality(label);` above
		{
			labelPrev = label;
			label = cursor[i];
			labelCardinality = fabric.getLabelCardinality(label);
			if (!targetExhausted) switch (labelCardinality)
			{
				case Cardinality.AlephNull:
				{
					switch (fabric.getVertexCardinality(targetVertex))
					{
						case Cardinality.Zero:
							switch (mergePolicy & MergeDecisions.AtomCountable)
							{
								case MergeDecisions.AtomCountableOverwrite: newCountable(labelPrev); break;			//	unit test: mec-Zero-AlephNull-AtomCountableOverwrite
								case MergeDecisions.AtomCountableKeep: abort = true; break;							//	unit test: mec-Zero-AlephNull-AtomCountableKeep
								case MergeDecisions.AtomCountableFail: fail(labelPrev, 0x7F7500); break;			//	unit test: mec-Zero-AlephNull-AtomCountableFail
								default: throw new NotImplementedException(0xDE44D5);
							}
							break;
						case Cardinality.AlephNull:
							switch (mergePolicy & MergeDecisions.CountableCountable)
							{
								case MergeDecisions.CountableCountableOverwrite: newCountable(labelPrev); break;	//	unit test: mec-AlephNull-AlephNull-CountableCountableOverwrite
								case MergeDecisions.CountableCountableKeep: noop(labelPrev); break;					//	unit test: mec-AlephNull-AlephNull-CountableCountableKeep
								case MergeDecisions.CountableCountableFail: fail(labelPrev, 0x20CCAD); break;		//	unit test: mec-AlephNull-AlephNull-CountableCountableFail
								default: throw new NotImplementedException(0x81418E);
							}
							break;
						case Cardinality.AlephOne:
							switch (mergePolicy & MergeDecisions.UncountableCountable)
							{
								case MergeDecisions.UncountableCountableOverwrite: newCountable(labelPrev); break;	//	unit test: mec-AlephOne-AlephNull-UncountableCountableOverwrite
								case MergeDecisions.UncountableCountableKeep: abort = true; break;					//	unit test: mec-AlephOne-AlephNull-UncountableCountableKeep
								case MergeDecisions.UncountableCountableFail: fail(labelPrev, 0x3D3DAD); break;		//	unit test: mec-AlephOne-AlephNull-UncountableCountableFail
								default: throw new NotImplementedException(0x193C22);
							}
							break;
						default: throw new NotImplementedException(0x6DDD30);
					}
					break;
				}
				case Cardinality.AlephOne:
				{
					switch (fabric.getVertexCardinality(targetVertex))
					{
						case Cardinality.Zero:
							switch (mergePolicy & MergeDecisions.AtomUncountable)
							{
								case MergeDecisions.AtomUncountableOverwrite: newUncountable(labelPrev); break;			//	unit test: mec-Zero-AlephOne-AtomUncountableOverwrite
								case MergeDecisions.AtomUncountableKeep: abort = true; break;							//	unit test: mec-Zero-AlephOne-AtomUncountableKeep
								case MergeDecisions.AtomUncountableFail: fail(labelPrev, 0xA14B17); break;				//	unit test: mec-Zero-AlephOne-AtomUncountableFail
								default: throw new NotImplementedException(0x204E2B);
							}
							break;
						case Cardinality.AlephNull:
							switch (mergePolicy & MergeDecisions.CountableUncountable)
							{
								case MergeDecisions.CountableUncountableOverwrite: newUncountable(labelPrev); break;	//	unit test: mec-AlephOne-AlephOne-CountableUncountableOverwrite
								case MergeDecisions.CountableUncountableKeep: abort = true; break;						//	unit test: mec-AlephOne-AlephOne-CountableUncountableKeep
								case MergeDecisions.CountableUncountableFail: fail(labelPrev, 0xE93976); break;			//	unit test: mec-AlephOne-AlephOne-CountableUncountableFail
								default: throw new NotImplementedException(0x1EE480);
							}
							break;
						case Cardinality.AlephOne:
							switch (mergePolicy & MergeDecisions.UncountableUncountable)
							{
								case MergeDecisions.UncountableUncountableOverwrite: newUncountable(labelPrev); break;	//	unit test: mec-AlephOne-AlephOne-UncountableUncountableOverwrite
								case MergeDecisions.UncountableUncountableKeep: noop(labelPrev); break;					//	unit test: mec-AlephOne-AlephOne-UncountableUncountableKeep
								case MergeDecisions.UncountableUncountableFail: fail(labelPrev, 0xC58FD7); break;		//	unit test: mec-AlephOne-AlephOne-UncountableUncountableFail
								default: throw new NotImplementedException(0xD07FB9);
							}
							break;
						default: throw new NotImplementedException(0x88080D);
					}
					break;
				}
				default: throw new InvalidOperationException(0x888205);
			}
			else switch (labelCardinality)
			{
				case Cardinality.AlephNull:
				{
					switch (mergePolicy & MergeDecisions.VoidCountable)
					{
						case MergeDecisions.VoidCountableOverwrite: newCountable(labelPrev); break;						//	unit test: mecex-Void-AlephNull-VoidCountableOverwrite
						case MergeDecisions.VoidCountableKeep: abort = true; break;										//	unit test: mecex-Void-AlephNull-VoidCountableKeep
						case MergeDecisions.VoidCountableFail: fail(labelPrev, 0x2938C5); break;						//	unit test: mecex-Void-AlephNull-VoidCountableFail
						default: throw new NotImplementedException(0xEACC66);
					}
					break;
				}
				case Cardinality.AlephOne:
				{
					switch (mergePolicy & MergeDecisions.VoidUncountable)
					{
						case MergeDecisions.VoidUncountableOverwrite: newUncountable(labelPrev); break;					//	unit test: mecex-Void-AlephOne-VoidUncountableOverwrite
						case MergeDecisions.VoidUncountableKeep: abort = true; break;									//	unit test: mecex-Void-AlephOne-VoidUncountableKeep
						case MergeDecisions.VoidUncountableFail: fail(labelPrev, 0xF9829F); break;						//	unit test: mecex-Void-AlephOne-VoidUncountableFail
						default: throw new NotImplementedException(0xE51FC0);
					}
					break;
				}
			}
			if (!targetExhausted)
			{
				if (!fabric.arcExists(targetVertex, label)) targetExhausted = true;
				else targetVertex = targetVertex[label];
			}
			if (abort) break;
		}
		if (!abort)
		{
			if (!targetExhausted) switch (head)
			{
				case MergeInstruction.Delete:
				{
					switch (fabric.getVertexCardinality(targetVertex))
					{
						case Cardinality.Zero:
							switch (mergePolicy & MergeDecisions.AtomVoid)
							{
								case MergeDecisions.AtomVoidOverwrite: remove(label); break;					//	unit test: mec-Zero-Delete-AtomVoidOverwrite-head
								case MergeDecisions.AtomVoidKeep: break;										//	unit test: mec-Zero-Delete-AtomVoidKeep-head
								case MergeDecisions.AtomVoidFail: fail(label, 0xC99182); break;					//	unit test: mec-Zero-Delete-AtomVoidFail-head
								default: throw new NotImplementedException(0x511A02);
							}
							break;
						case Cardinality.AlephNull:
							switch (mergePolicy & MergeDecisions.CountableVoid)
							{
								case MergeDecisions.CountableVoidOverwrite: remove(label); break;				//	unit test: mec-AlephNull-Delete-CountableVoidOverwrite-head, mec-AlephNull-Delete-CountableVoidOverwrite-head-1
								case MergeDecisions.CountableVoidKeep: break;									//	unit test: mec-AlephNull-Delete-CountableVoidKeep-head, mec-AlephNull-Delete-CountableVoidKeep-head-1
								case MergeDecisions.CountableVoidFail: fail(label, 0x16E957); break;			//	unit test: mec-AlephNull-Delete-CountableVoidFail-head, mec-AlephNull-Delete-CountableVoidFail-head-1
								default: throw new NotImplementedException(0x6370F4);
							}
							break;
						case Cardinality.AlephOne:
							switch (mergePolicy & MergeDecisions.UncountableVoid)
							{
								case MergeDecisions.UncountableVoidOverwrite: remove(label); break;				//	unit test: mec-AlephOne-Delete-UncountableVoidOverwrite-head, mec-AlephOne-Delete-UncountableVoidOverwrite-head-1
								case MergeDecisions.UncountableVoidKeep: break;									//	unit test: mec-AlephOne-Delete-UncountableVoidKeep-head, mec-AlephOne-Delete-UncountableVoidKeep-head-1
								case MergeDecisions.UncountableVoidFail: fail(label, 0xE2C614); break;			//	unit test: mec-AlephOne-Delete-UncountableVoidFail-head, mec-AlephOne-Delete-UncountableVoidFail-head-1
								default: throw new NotImplementedException(0xAE3698);
							}
							break;
						default: throw new NotImplementedException(0xAE6931);
					}
					break;
				}
				case Cardinality.AlephNull:
				{
					switch (fabric.getVertexCardinality(targetVertex))
					{
						case Cardinality.Zero:
							switch (mergePolicy & MergeDecisions.AtomCountable)
							{
								case MergeDecisions.AtomCountableOverwrite: newCountable(label); break;			//	unit test: mec-Zero-AlephNull-AtomCountableOverwrite-head
								case MergeDecisions.AtomCountableKeep: break;									//	unit test: mec-Zero-AlephNull-AtomCountableKeep-head
								case MergeDecisions.AtomCountableFail: fail(label, 0x2969E9); break;			//	unit test: mec-Zero-AlephNull-AtomCountableFail-head
								default: throw new NotImplementedException(0xEA9BB4);
							}
							break;
						case Cardinality.AlephNull:
							switch (mergePolicy & MergeDecisions.CountableCountable)
							{
								case MergeDecisions.CountableCountableOverwrite: newCountable(label); break;	//	unit test: mec-AlephNull-AlephNull-CountableCountableOverwrite-head
								case MergeDecisions.CountableCountableKeep: break;								//	unit test: mec-AlephNull-AlephNull-CountableCountableKeep-head
								case MergeDecisions.CountableCountableFail: fail(label, 0xEDCD07); break;		//	unit test: mec-AlephNull-AlephNull-CountableCountableFail-head
								default: throw new NotImplementedException(0x5316E3);
							}
							break;
						case Cardinality.AlephOne:
							switch (mergePolicy & MergeDecisions.UncountableCountable)
							{
								case MergeDecisions.UncountableCountableOverwrite: newCountable(label); break;	//	unit test: mec-AlephOne-AlephNull-UncountableCountableOverwrite-head
								case MergeDecisions.UncountableCountableKeep: break;							//	unit test: mec-AlephOne-AlephNull-UncountableCountableKeep-head
								case MergeDecisions.UncountableCountableFail: fail(label, 0xEFEBF2); break;		//	unit test: mec-AlephOne-AlephNull-UncountableCountableFail-head
								default: throw new NotImplementedException(0x6DE531);
							}
							break;
						default: throw new NotImplementedException(0x4224CE);
					}
					break;
				}
				case Cardinality.AlephOne:
				{
					switch (fabric.getVertexCardinality(targetVertex))
					{
						case Cardinality.Zero:
							switch (mergePolicy & MergeDecisions.AtomUncountable)
							{
								case MergeDecisions.AtomUncountableOverwrite: newUncountable(label); break;				//	unit test: mec-Zero-AlephOne-AtomUncountableOverwrite-head
								case MergeDecisions.AtomUncountableKeep: break;											//	unit test: mec-Zero-AlephOne-AtomUncountableKeep-head
								case MergeDecisions.AtomUncountableFail: fail(label, 0x4818BF); break;					//	unit test: mec-Zero-AlephOne-AtomUncountableFail-head
								default: throw new NotImplementedException(0x85BBF6);
							}
							break;
						case Cardinality.AlephNull:
							switch (mergePolicy & MergeDecisions.CountableUncountable)
							{
								case MergeDecisions.CountableUncountableOverwrite: newUncountable(label); break;		//	unit test: mec-AlephNull-AlephOne-CountableUncountableOverwrite-head
								case MergeDecisions.CountableUncountableKeep: break;									//	unit test: mec-AlephNull-AlephOne-CountableUncountableKeep-head
								case MergeDecisions.CountableUncountableFail: fail(label, 0xABA3B1); break;				//	unit test: mec-AlephNull-AlephOne-CountableUncountableFail-head
								default: throw new NotImplementedException(0x5531F8);
							}
							break;
						case Cardinality.AlephOne:
							switch (mergePolicy & MergeDecisions.UncountableUncountable)
							{
								case MergeDecisions.UncountableUncountableOverwrite: newUncountable(label); break;		//	unit test: mec-AlephOne-AlephOne-UncountableUncountableOverwrite-head
								case MergeDecisions.UncountableUncountableKeep: break;									//	unit test: mec-AlephOne-AlephOne-UncountableUncountableKeep-head
								case MergeDecisions.UncountableUncountableFail: fail(label, 0xA6A14C); break;			//	unit test: mec-AlephOne-AlephOne-UncountableUncountableFail-head
								default: throw new NotImplementedException(0x5698B7);
							}
							break;
						default: throw new NotImplementedException(0xF79A55);
					}
					break;
				}
				default:	//	`Cardinality.Zero` is implied
				{
					switch (fabric.getVertexCardinality(targetVertex))
					{
						case Cardinality.Zero:
							switch (mergePolicy & MergeDecisions.AtomAtom)
							{
								case MergeDecisions.AtomAtomOverwrite: atom(label, head); break;						//	unit test: mec-Zero-Zero-AtomAtomOverwrite-head
								case MergeDecisions.AtomAtomKeep: break;												//	unit test: mec-Zero-Zero-AtomAtomKeep-head
								case MergeDecisions.AtomAtomFail: fail(label, 0xD05CC4); break;							//	unit test: mec-Zero-Zero-AtomAtomFail-head
								default: throw new NotImplementedException(0x21480E);
							}
							break;
						case Cardinality.AlephNull:
							switch (mergePolicy & MergeDecisions.CountableAtom)
							{
								case MergeDecisions.CountableAtomOverwrite: atom(label, head); break;					//	unit test: mec-AlephNull-Zero-CountableAtomOverwrite-head
								case MergeDecisions.CountableAtomKeep: break;											//	unit test: mec-AlephNull-Zero-CountableAtomKeep-head
								case MergeDecisions.CountableAtomFail: fail(label, 0x4FFF2A); break;					//	unit test: mec-AlephNull-Zero-CountableAtomFail-head
								default: throw new NotImplementedException(0x8E73F5);
							}
							break;
						case Cardinality.AlephOne:
							switch (mergePolicy & MergeDecisions.UncountableAtom)
							{
								case MergeDecisions.UncountableAtomOverwrite: atom(label, head); break;					//	unit test: mec-AlephOne-Zero-UncountableAtomOverwrite-head
								case MergeDecisions.UncountableAtomKeep: break;											//	unit test: mec-AlephOne-Zero-UncountableAtomKeep-head
								case MergeDecisions.UncountableAtomFail: fail(label, 0xFB67D0); break;					//	unit test: mec-AlephOne-Zero-UncountableAtomFail-head
								default: throw new NotImplementedException(0xB931A2);
							}
							break;
						default: throw new NotImplementedException(0xF84003);
					}
					break;
				}
			}
			else switch (head)
			{
				case MergeInstruction.Delete:
				{
					switch (mergePolicy & MergeDecisions.VoidVoid)
					{
						case MergeDecisions.VoidVoidOverwrite: break;									//	unit test: mecex-Void-Delete-VoidVoidOverwrite-head
						case MergeDecisions.VoidVoidKeep: break;										//	unit test: mecex-Void-Delete-VoidVoidKeep-head
						case MergeDecisions.VoidVoidFail: fail(label, 0x8CC134); break;					//	unit test: mecex-Void-Delete-VoidVoidFail-head
						default: throw new NotImplementedException(0x6CFDDF);
					}
					break;
				}
				case Cardinality.AlephNull:
				{
					switch (mergePolicy & MergeDecisions.VoidCountable)
					{
						case MergeDecisions.VoidCountableOverwrite: newCountable(label); break;			//	unit test: mecex-Void-AlephNull-VoidCountableOverwrite-head
						case MergeDecisions.VoidCountableKeep: break;									//	unit test: mecex-Void-AlephNull-VoidCountableKeep-head
						case MergeDecisions.VoidCountableFail: fail(label, 0xFAA97F); break;			//	unit test: mecex-Void-AlephNull-VoidCountableFail-head
						default: throw new NotImplementedException(0x2936D5);
					}
					break;
				}
				case Cardinality.AlephOne:
				{
					switch (mergePolicy & MergeDecisions.VoidUncountable)
					{
						case MergeDecisions.VoidUncountableOverwrite: newUncountable(label); break;		//	unit test: mecex-Void-AlephOne-VoidUncountableOverwrite-head
						case MergeDecisions.VoidUncountableKeep: break;									//	unit test: mecex-Void-AlephOne-VoidUncountableKeep-head
						case MergeDecisions.VoidUncountableFail: fail(label, 0x39DDD3); break;			//	unit test: mecex-Void-AlephOne-VoidUncountableFail-head
						default: throw new NotImplementedException(0x628571);
					}
					break;
				}
				default:	//	`Cardinality.Zero` is implied
				{
					switch (mergePolicy & MergeDecisions.VoidAtom)
					{
						case MergeDecisions.VoidAtomOverwrite: atom(label, head); break;				//	unit test: mecex-Void-Zero-VoidAtomOverwrite-head
						case MergeDecisions.VoidAtomKeep: break;										//	unit test: mecex-Void-Zero-VoidAtomKeep-head
						case MergeDecisions.VoidAtomFail: fail(label, 0x638C90); break;					//	unit test: mecex-Void-Zero-VoidAtomFail-head
						default: throw new NotImplementedException(0xE349CD);
					}
					break;
				}
			}
		}

		if (lastNonNoopLength < lastNoopLength) outcomeBuf.count = lastNonNoopLength;

		return outcomeBuf;

		function reset()
		{
			outcomeBuf.count = 0;
		}

		function root_newCountable()
		{
			targetExhausted = true;
			outcomeBuf.count = 1;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[0] = MergeAction.Set_NewCountable;
			lastNonNoopLength = outcomeBuf.count;
		}

		function root_newUncountable()
		{
			targetExhausted = true;
			outcomeBuf.count = 1;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[0] = MergeAction.Set_NewUncountable;
			lastNonNoopLength = outcomeBuf.count;
		}

		function root_atom(value)
		{
			outcomeBuf.count = 2;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[0] = MergeAction.Set_Atom;
			outcomeBuf[1] = value;
			lastNonNoopLength = outcomeBuf.count;
		}

		function root_remove()
		{
			outcomeBuf.count = 1;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[0] = MergeAction.Delete;
			lastNonNoopLength = outcomeBuf.count;
		}

		function root_noop()
		{
			outcomeBuf.count = 1;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[0] = MergeAction.Noop;
			lastNoopLength = outcomeBuf.count;
		}

		function root_fail(ncode)
		{
			abort = true;
			outcomeBuf.count = 2;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[0] = MergeAction.Fail;
			outcomeBuf[1] = ncode;
			lastNonNoopLength = outcomeBuf.count;
		}

		function newCountable(label)
		{
			targetExhausted = true;
			outcomeBuf.count += 2;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[outcomeBuf.count - 2] = MergeAction.Set_NewCountable;
			outcomeBuf[outcomeBuf.count - 1] = label;
			lastNonNoopLength = outcomeBuf.count;
		}

		function newUncountable(label)
		{
			targetExhausted = true;
			outcomeBuf.count += 2;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[outcomeBuf.count - 2] = MergeAction.Set_NewUncountable;
			outcomeBuf[outcomeBuf.count - 1] = label;
			lastNonNoopLength = outcomeBuf.count;
		}

		function atom(label, value)
		{
			outcomeBuf.count += 3;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[outcomeBuf.count - 3] = MergeAction.Set_Atom;
			outcomeBuf[outcomeBuf.count - 2] = label;
			outcomeBuf[outcomeBuf.count - 1] = value;
			lastNonNoopLength = outcomeBuf.count;
		}

		function remove(label)
		{
			outcomeBuf.count += 2;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[outcomeBuf.count - 2] = MergeAction.Delete;
			outcomeBuf[outcomeBuf.count - 1] = label;
			lastNonNoopLength = outcomeBuf.count;
		}

		function noop(label)
		{
			outcomeBuf.count += 2;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[outcomeBuf.count - 2] = MergeAction.Noop;
			outcomeBuf[outcomeBuf.count - 1] = label;
			lastNoopLength = outcomeBuf.count;
		}

		function fail(label, ncode)
		{
			abort = true;
			outcomeBuf.count += 3;
			outcomeBuf.length < outcomeBuf.count && (outcomeBuf.length = outcomeBuf.count);
			outcomeBuf[outcomeBuf.count - 3] = MergeAction.Fail;
			outcomeBuf[outcomeBuf.count - 2] = label;
			outcomeBuf[outcomeBuf.count - 1] = ncode;
			lastNonNoopLength = outcomeBuf.count;
		}
	},
}

//	Object: Implements operations on the `CompactFormal` graph cursor format.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const CompactFormal =
{
	//	Function: `is(cursor: any): boolean` - test whether `cursor` is a valid compact cursor (`cbuf<GraphCursorType.CompactFormal>`).
	//	Parameter: `cursor: any` - the value to test; can be anything.
	//	Returns: `true` if `cursor === Unset || (CompoundBuf.isOf(cursor, GraphCursorType.CompactFormal) && (cursor.count > 1 || (cursor.count === 1 && cursor[0] !== Unset)))`, otherwise returns `false`.
	//	Remarks: `Unset` lean, compact and compact formal cursors represent a void head; `[Unset]` is an invalid compact or compact formal cursor.
	is(cursor)
	{
		return cursor === Unset || (CompoundBuf.isOf(cursor, GraphCursorType.CompactFormal) && (cursor.count > 1 || (cursor.count === 1 && cursor[0] !== Unset)));
	},

	//	Function: `create(length: integer, bufferLength: integer): cbuf<GraphCursorType.CompactFormal>` - creates new `GraphCursorType.CompactFormal` compound buffer with the given `length`
	//		or length of `0` (default), and the `bufferLength` or buffer length of `tunable(0x402757)` (default).
	//	Parameter: `length: integer` - defaults to `0`; a non-negative integer specifying the length of the newly created compound (`result.count === length`).
	//	Parameter: `bufferLength: integer` - defaults to `tunable(0x402757)`; a positive integer specifying the native length of the new array (`result.length === bufferLength`).
	//	Returns: A new `cbuf<GraphCursorType.Compact>` instance, buffer length is `bufferLength` or `tunable(0x402757)` if `bufferLength` is not set.
	//	Exception: `ArgumentException`.
	//	Performance: Allocates new memory.
	//	Tunable: `0x402757`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	create(length = 0, bufferLength = T_0x402757)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(length) || length < 0) throw new ArgumentException(0xAB6197, "length", length);
			if (!Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0x5DA650, "bufferLength", bufferLength);
		}
		return cbuf(GraphCursorType.CompactFormal, length, bufferLength);
	},

	fromDotSharpString(head, path, performSpread = false, bufferLength = void 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(path)) throw new ArgumentException(0x826CEB, "path", path);
			if (bufferLength !== void 0 && !Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0x7BA3AC, "bufferLength", bufferLength);
		}
		const result = CompactFormal.create(2, bufferLength);
		result[0] = head;
		result[1] = path;
		return performSpread ? CompactFormal.spread(result) : result;
	},

	//	Function: `list(root: any, fabric: Fabric, lenient: boolean, createCursor: function(compoundType: Symbol, length: integer, bufferLength_suggested: integer): cbuf<GraphCursorType.CompactFormal>, targetOrNew: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer): cbuf<GraphCursor.GraphCursorList>`
	//		- transcribes the `root` into a list of `CompactFormal` graph cursors describing exhaustively the `root` graph, `DotSharpNotation` notation.
	//	Parameter: `root: any` - the root graph.
	//	Parameter: `fabric: Fabric` - the fabric for the transcription; defaults to `LiteralFabric.the`.
	//	Parameter: `lenient: boolean` - if set to `true` disables circular references checks; defaults to `false`.
	//	Parameter: `createCursor: function(compoundType: Symbol, length: integer, bufferLength_suggested: integer): cbuf<GraphCursorType.CompactFormal>` - optional; if a callback is provided it will be called to create new cursor instances during graph listing.
	//	Parameter: `targetOrNew: cbuf<GraphCursor.GraphCursorList>` - defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result at.
	//	Returns: A list of `GraphCursorType.CompactFormal` graph cursors, `DotSharpNotation` notation, describing exhaustively the `root` graph.
	//	Remarks: By default the transcription process tracks visited graph vertices and throws a `CircularReferenceException` if a circular reference is encountered, preventing inifinite recursion.
	//		Setting `lenient` to `true` turns off this safegurad, which might provide peformance gain but exposes the application process to inifinite recursion. Setting `lenient` to `true` is
	//		recommended only in such cases when it's guaranteed that `root` is a tree with no circular references, e.g. when using this method on freshly parsed JSON.
	//	Exception: `ArgumentException`.
	//	Performance: Allocates new memory.
	//	Tunable: `0x402757`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	list(root, fabric = null, lenient = false, createCursor = null, targetOrNew = null, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isBoolean(lenient)) throw new ArgumentException(0x20DED0, "lenient", lenient);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x3F8A64, "fabric", fabric);
			if (!Type.isNU(createCursor) && !CallableType.isFunction(createCursor)) throw new ArgumentException(0x4C939B, "createCursor", createCursor);
			if (!Type.isNU(targetOrNew) && !CompoundBuf.isOf(targetOrNew, GraphCursor.GraphCursorList)) throw new ArgumentException(0xF4B624, "targetOrNew", targetOrNew);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x724420, "offsetInTarget", offsetInTarget);
		}

		if (root === Unset) return Unset;

		const visitorState = { cursor: null, graphCursorType: GraphCursorType.CompactFormal, offsetInTarget };

		if (createCursor) visitorState.createCursor = createCursor;
		else visitorState.graphCursorBufferLength = T_0x402757;

		if (targetOrNew)
		{
			visitorState.target = targetOrNew;
			targetOrNew.count = offsetInTarget;
		}
		else visitorState.target = Unset;

		if (!lenient) visitorState.visited = buf();

		return (fabric || LiteralFabric.the).walk(_compactCursorLister_visit, visitorState, root).target;
	},

	//	Function: `asCompact(cursor: cbuf<GraphCursorType.CompactFormal>): cbuf<GraphCursorType.Compact>` - changes the type of `cursor` from compact-formal format to compact format.
	//	Parameter: `cursor: cbuf<GraphCursorType.CompactFormal>` - a cursor to convert.
	//	Returns: `cursor` as `cbuf<GraphCursorType.Compact>` (`Unset` if `cursor === Unset`).
	//	Remarks: This function changes the type of (casts) `cursor` from `GraphCursorType.CompactFormal` to `GraphCursorType.Compact` without modifying its elements in any way.
	//	Exception: `ArgumentException`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	asCompact(cursor)
	{
		if (PB_DEBUG)
		{
			if (!CompactFormal.is(cursor)) throw new ArgumentException(0x4F17D3, "cursor", cursor);
		}
		if (cursor === Unset) return Unset;
		return CompoundBuf.setType(cursor, GraphCursorType.Compact);
	},

	//	Function: `toCompact(cursor: cbuf<GraphCursorType.CompactFormal>, targetOrSubject: cbuf<GraphCursorType.Compact>): cbuf<GraphCursorType.Compact>` - converts a graph cursor from compact formal format,
	//		`DotSharpNotation` notation, to compact format and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.CompactFormal>` - a cursor to convert.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.Compact>` - defaults to `cursor`; the converted cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` converted to and augmented as `cbuf<GraphCursorType.Compact>` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing `cursor` in compact form.
	//	Remarks:
	//		This function produces a graph path with all graph path labels dencoded via the `DotSharpNotation` notation.
	//		The buffer length of the resulting compund equals `cursor.count`.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Loops backwards when copying to `targetOrSubject`; this way if the size of the `targetOrSubject` buffer is less than `cursor.count`, the first `targetOrSubject[cursor.count - 1]` assignment will force
	//			a one-time array expansion instead of incrementing the size of the array by 1 on each iteration.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toCompact(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.CompactFormal)) throw new ArgumentException(0x5CE89B, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.Compact)) throw new ArgumentException(0xC4859D, "targetOrSubject", targetOrSubject);
		}

		if (cursor === Unset) return Unset;
		if (cursor.count === 1)	//	operation is not applicable; `cursor.count === 1` indicates an atomic root, and there are no labels to fuse
		{
			if (!targetOrSubject)
			{
				CompoundBuf.augment(cursor, GraphCursorType.Compact);
				return cursor;
			}
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		static_buf.count = 0;
		for (let length = cursor.count, i = 1; i < length; ++i) DotSharpNotation.parse(cursor[i], static_buf, static_buf.count);
		if (!targetOrSubject)
		{
			CompoundBuf.augment(cursor, GraphCursorType.Compact);
			targetOrSubject = cursor;
		}
		else targetOrSubject[0] = cursor[0];		//	head
		targetOrSubject.count = static_buf.count + 1;
		targetOrSubject.length = Math.max(targetOrSubject.length, targetOrSubject.count);
		for (let length = static_buf.count, i = 0; i < length; ++i) targetOrSubject[i + 1] = DotSharpNotation.decodeComponent(static_buf[i]);
		return targetOrSubject;
	},

	//	Function: `toLean(cursor: cbuf<GraphCursorType.CompactFormal>, targetOrSubject: cbuf<GraphCursorType.Lean>, fabric: Fabric): cbuf<GraphCursorType.Lean>` - converts a graph cursor
	//		from compact formal format,	`DotSharpNotation` notation, to lean format and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.CompactFormal>` - a cursor to convert.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.Lean>` - defaults to `cursor`; the converted cursor is stored in this compound buffer.
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; the fabric to use for label cardinality determination.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` converted to and augmented as `cbuf<GraphCursorType.Lean>` if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing `cursor` in lean form.
	//	Remarks: Buffer length of the returned buffer is `1` or `2 * cursor.count`.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Loops backwards when copying to `targetOrSubject`; this way if the size of the `targetOrSubject` buffer is less than `2 * cursor.count`, the first `targetOrSubject[2 * cursor.count - 1]` assignment will force
	//			a one-time array expansion instead of incrementing the size of the array by 1 on each iteration.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	toLean(cursor, targetOrSubject = null, fabric = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.CompactFormal)) throw new ArgumentException(0xE9322C, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.Lean)) throw new ArgumentException(0xE77691, "targetOrSubject", targetOrSubject);
			if (cursor !== Unset && !Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0xCE3EE5, "fabric", fabric);
		}
		if (cursor === Unset) return Unset;
		if (!fabric) fabric = LiteralFabric.the;
		if (!targetOrSubject)
		{
			if (cursor.count === 1) return CompoundBuf.augment(cursor, GraphCursorType.Lean, 1);
			cursor[2 * cursor.count - 2] = cursor[0];	//	value
			for (let i = cursor.count - 1, j = 2 * cursor.count - 1; i >= 1; --i, j -= 2)
			{
				const item = cursor[i];
				cursor[j] = DotSharpNotation.decodeComponent(item);
				cursor[j - 3] = fabric.getLabelCardinality(item);
			}
			cursor[1] = null;							//	reserved
			return CompoundBuf.augment(cursor, GraphCursorType.Lean, 2 * cursor.count);
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		targetOrSubject[2 * cursor.count - 2] = cursor[0];	//	value
		targetOrSubject[1] = null;							//	reserved
		for (let i = cursor.count - 1, j = 2 * cursor.count - 1; i >= 1; --i, j -= 2)
		{
			const item = cursor[i];
			targetOrSubject[j] = DotSharpNotation.decodeComponent(item);
			targetOrSubject[j - 3] = fabric.getLabelCardinality(item);
		}
		targetOrSubject.count = 2 * cursor.count;
		return targetOrSubject;
	},

	toDotSharpString(cursor)
	{
		if (PB_DEBUG)
		{
			if (!CompactFormal.is(cursor)) throw new ArgumentException(0x575DE7, "cursor", cursor);
		}
		const outcome = CompactFormal.fuse(cursor, convertBuffer_compactFormal);
		if (outcome === Unset) return Unset;
		if (outcome.count === 1) return "";
		return outcome[1];
	},

	//	Function: `fuse(cursor: cbuf<GraphCursorType.CompactFormal>, targetOrSubject: cbuf<GraphCursorType.CompactFormal>): cbuf<GraphCursorType.CompactFormal>` - fuses all cursor graph
	//		path expression components into a single graph path expression component using `DotSharpNotation` notation and returns either `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.CompactFormal>` - a cursor to fuse.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.CompactFormal>` - defaults to `cursor`; the modified cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` in fused form if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing the fused form of `cursor`.
	//		Buffer length is either `1` (atomic root) or `2` (fused form with a non-atomic root).
	//		This method is guaranteed to return a cursor of `GraphCursorType.CompactFormal`.
	//	Remarks:
	//		Examples
	//		- `[1, 0]` -> `[1, 0]`
	//		- `[1, 0, 0]` -> `[1, "#0#0"]`
	//		- `[1, "a", "b", "#0", 1]` -> `[1, "a.b#0#1"]`
	//		Unlike `Compact.fuse`, this implementation interprets all `cursor` uncountable labels as `DotSharpNotation`-encoded paths.
	//	Exception: `ArgumentException`.
	//	Performance:
	//		Using `DotSharpNotation.append`, which performs string concatenations, in JavaScript (v8, SpiderMonkey) is faster than the `Array.join` alternative.
	//	See also: `GraphCursor.CompactFormal.spread`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	fuse(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.CompactFormal)) throw new ArgumentException(0xED167E, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.CompactFormal)) throw new ArgumentException(0x88362B, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (!targetOrSubject)
		{
			if (cursor.count === 1) return cursor;	//	operation is not applicable; `cursor.count === 1` indicates an atomic root, and there are no labels to fuse
			let path = null;
			for (let length = cursor.count, i = 1; i < length; ++i) path = DotSharpNotation.append(path, cursor[i]);
			//	`cursor[0]` - cursor head stays unchanged
			cursor[1] = path;			//	graph path expression
			cursor.count = 2;
			return cursor;
		}
		if (cursor.count === 1)
		{
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;	//	operation is not applicable; `cursor.count === 1` indicates an atomic root, and there are no labels to fuse
		}
		let path = null;
		for (let length = cursor.count, i = 1; i < length; ++i) path = DotSharpNotation.append(path, cursor[i]);
		targetOrSubject[1] = path;			//	graph path expression
		targetOrSubject[0] = cursor[0];		//	head
		targetOrSubject.count = 2;
		return targetOrSubject;
	},

	//	Function: `spread(cursor: cbuf<GraphCursorType.CompactFormal>, targetOrSubject: cbuf<GraphCursorType.CompactFormal>): cbuf<GraphCursorType.CompactFormal>` - spreads all cursor graph path
	//		expression components into atomic graph path expression components using `DotSharpNotation` notation and returns `Unset`, the modified `targetOrSubject` or the modified `cursor`.
	//	Parameter: `cursor: cbuf<GraphCursorType.CompactFormal>` - a cursor to spread.
	//	Parameter: `targetOrSubject: cbuf<GraphCursorType.CompactFormal>` - defaults to `cursor`; the modified cursor is stored in this compound buffer.
	//	Returns:
	//		- `Unset` if `cursor === Unset`;
	//		- `cursor` in spread form if no argument is provided for `targetOrSubject`;
	//		- otherwise returns `targetOrSubject` containing the spread form of `cursor`.
	//		This method is guaranteed to return a cursor of `GraphCursorType.CompactFormal`.
	//	Remarks:
	//		Examples
	//		- `[1, 0]` -> `[1, 0]`
	//		- `[1, "#0#0"]` -> `[1, 0, 0]`
	//		- `[1, "a.b#0#1"]` -> `[1, "a", "b", 0, 1]`
	//		- `[1, "a.b", 0, "#1"]` -> `[1, "a", "b", 0, 1]`
	//	Exception: `ArgumentException`.
	//	See also: `GraphCursor.CompactFormal.fuse`.
	//	See also: https://bic.wiki/wiki/Falael.Transcribe.
	spread(cursor, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (cursor !== Unset && !CompoundBuf.isOf(cursor, GraphCursorType.CompactFormal)) throw new ArgumentException(0xCE9BFE, "cursor", cursor);
			if (!Type.isNU(targetOrSubject) && !CompoundBuf.isOf(targetOrSubject, GraphCursorType.CompactFormal)) throw new ArgumentException(0xB94D08, "targetOrSubject", targetOrSubject);
		}
		if (cursor === Unset) return Unset;
		if (cursor.count === 1)	//	operation is not applicable; `cursor.count === 1` indicates an atomic root, and there are no labels to fuse
		{
			if (!targetOrSubject) return cursor;
			targetOrSubject[0] = cursor[0];
			targetOrSubject.count = 1;
			return targetOrSubject;
		}
		static_buf.count = 0;
		for (let length = cursor.count, i = 1; i < length; ++i) DotSharpNotation.parse(cursor[i], static_buf, static_buf.count);
		if (!targetOrSubject) targetOrSubject = cursor;
		else targetOrSubject[0] = cursor[0];		//	head
		targetOrSubject.count = static_buf.count + 1;
		targetOrSubject.length = Math.max(targetOrSubject.length, targetOrSubject.count);
		for (let length = static_buf.count, i = 0; i < length; ++i) targetOrSubject[i + 1] = static_buf[i];
		return targetOrSubject;
	},
}

//	Object: Implements operations on non-homogenous cursor lists. Exported as `GraphCursor.List`; the local name `_GraphCursor_List` is used for disambiguation from the `List.js` imports.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const _GraphCursor_List =
{
	is(value)
	{
		return value === Unset || CompoundBuf.isOf(value, GraphCursorList);
	},

	//	Function: `create(length: integer, bufferLength: integer): cbuf<GraphCursor.GraphCursorList>` - creates new `GraphCursor.GraphCursorList` compound buffer with the given `length`
	//		or length of `0`(default), and the `bufferLength` or buffer length of `tunable(0x78A43F)` (default).
	//	Parameter: `length: integer` - defaults to `0`; a non-negative integer specifying the length of the newly created compound.
	//	Parameter: `bufferLength: integer` - defaults to `tunable(0x78A43F)`; a positive integer specifying the native length of the new array (`result.length === bufferLength`).
	//	Returns: A new `cbuf<GraphCursor.GraphCursorList>` instance, buffer length is `bufferLength` or `tunable(0x78A43F)` (default).
	//	Exception: `ArgumentException`.
	//	Performance: Allocates new memory.
	//	Tunable: `0x78A43F`.
	create(length = 0, bufferLength = T_0x78A43F)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(length) || length < 0) throw new ArgumentException(0x8C6C84, "length", length);
			if (!Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0x303E81, "bufferLength", bufferLength);
		}
		return cbuf(GraphCursorList, length, bufferLength);
	},

	//	Function: `uniform(cursorList: cbuf<GraphCursor.GraphCursorList>, targetCursorFormat: GraphCursorType, targetOrSubject: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer, batchProcessingConfig: BatchProcessingConfig): cbuf<GraphCursor.GraphCursorList>` -
	//		homogenizes `cursorList` so that all cursors in the resulting list are guaranteed to be of the specified `targetCursorFormat`.
	//	Parameter: `cursorList: cbuf<GraphCursor.GraphCursorList>` - a list of cursors of any cursor format.
	//	Parameter: `targetCursorFormat: GraphCursorType` - the `GraphCursorType` to target in cursor conversion; regardless of their original cursor format, all cursors in the resulting list are guaranteed to be of the specified `targetCursorFormat`.
	//	Parameter: `targetOrSubject: cbuf<GraphCursor.GraphCursorList>` - defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result at.
	//	Parameter: `batchProcessingConfig: BatchProcessingConfig` - defines the element instance handling behavior of the function:
	//		- if the `batchProcessingConfig` is not set or `batchProcessingConfig.elementInstanceHandling === InstanceHandling.MutateModified`, the function modifies each element in-place;
	//		- if the `batchProcessingConfig` is present and `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneModified`, the function creates new instances for modified elements
	//			instead of modifying existing elements; if `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneAll`, the function creates new instances for all elements.
	//			- if `batchProcessingConfig.bufPoolTransaction` is set, it collects newly created instances allowing post-processing and batch instance release;
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; the fabric to use for label cardinality determination; currently used only when converting a cursor to lean format (not implemented with other target cursor formats).
	//	Returns: `Unset` if `cursorList === Unset` or a homogenized version of `cursorList` with all graph cursor elements guaranteed to be of the specified `targetCursorFormat` compound type.
	//	Exception: `ArgumentException`.
	//	Exception: `ReturnValueException`.
	//	Exception: `NotImplementedException`.
	uniform(cursorList, targetCursorFormat, targetOrSubject = null, offsetInTarget = 0, batchProcessingConfig = null, fabric = null)
	{
		if (PB_DEBUG)
		{
			if (!_GraphCursor_List.is(cursorList)) throw new ArgumentException(0xC66E6F, "cursorList", cursorList);
			if (!Enum.hasValue(GraphCursorType, targetCursorFormat)) throw new ArgumentException(0xADE23B, "targetCursorFormat", targetCursorFormat);
			if (!Type.isNU(targetOrSubject) && !_GraphCursor_List.is(targetOrSubject)) throw new ArgumentException(0xC5E71F, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x9816B8, "offsetInTarget", offsetInTarget);
			if (!Type.isNU(batchProcessingConfig) && !(batchProcessingConfig instanceof BatchProcessingConfig)) throw new ArgumentException(0x1F9667, "batchProcessingConfig", batchProcessingConfig);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x686F49, "fabric", fabric);
		}

		if (cursorList === Unset) return Unset;
		if (!fabric) fabric = LiteralFabric.the;
		let cursorListCount = cursorList.count;
		if (!targetOrSubject)
		{
			if (!cursorList.count) return cursorList;
			if (offsetInTarget) cursorList.count += offsetInTarget;
			targetOrSubject = cursorList;
		}
		else
		{
			if (!cursorList.count) return targetOrSubject;
			targetOrSubject.count = cursorList.count + offsetInTarget;
		}
		for (let length = cursorListCount, i = 0; i < length; ++i)
		{
			const item = cursorList[i];
			if (item === Unset)
			{
				targetOrSubject[i + offsetInTarget] = Unset;
				continue;
			}
			if (!Compound.isCompoundBuf(item))
			{
				targetOrSubject[i + offsetInTarget] = item;
				continue;
			}
			const cursorType = CompoundBuf.getType(item);
			let target;
			switch (batchProcessingConfig?.elementInstanceHandling)
			{
				case InstanceHandling.CloneModified:
					if (cursorType === targetCursorFormat)
					{
						targetOrSubject[i + offsetInTarget] = item;
						continue;
					}
					else if (batchProcessingConfig.bufPoolTransaction) target = batchProcessingConfig.bufPoolTransaction.hold(targetCursorFormat);
					else target = cbuf(targetCursorFormat, 0, item.count);
					break;
				case InstanceHandling.CloneAll:
					if (batchProcessingConfig.bufPoolTransaction) target = batchProcessingConfig.bufPoolTransaction.hold(targetCursorFormat);
					else target = cbuf(targetCursorFormat, 0, item.count);
					if (cursorType === targetCursorFormat)
					{
						targetOrSubject[i + offsetInTarget] = Compound.copyElements(item, target);
						continue;
					}
					break;
				case null:
				case void 0:
				case InstanceHandling.MutateModified:
					if (cursorType === targetCursorFormat)
					{
						targetOrSubject[i + offsetInTarget] = item;
						continue;
					}
					target = null;
					break;
				default: throw new NotImplementedException(0xB6D82D);
			}
			if (cursorType === GraphCursorType.Lean && targetCursorFormat === GraphCursorType.Compact) targetOrSubject[i + offsetInTarget] = Lean.toCompact(item, target);
			else if (cursorType === GraphCursorType.Lean && targetCursorFormat === GraphCursorType.CompactFormal) targetOrSubject[i + offsetInTarget] = Lean.toCompactFormal(item, target);
			else if (cursorType === GraphCursorType.Compact && targetCursorFormat === GraphCursorType.CompactFormal) targetOrSubject[i + offsetInTarget] = Compact.toCompactFormal(item, target);
			else if (cursorType === GraphCursorType.Compact && targetCursorFormat === GraphCursorType.Lean) targetOrSubject[i + offsetInTarget] = Compact.toLean(item, target, fabric);
			else if (cursorType === GraphCursorType.CompactFormal && targetCursorFormat === GraphCursorType.Compact) targetOrSubject[i + offsetInTarget] = CompactFormal.toCompact(item, target);
			else if (cursorType === GraphCursorType.CompactFormal && targetCursorFormat === GraphCursorType.Lean) targetOrSubject[i + offsetInTarget] = CompactFormal.toLean(item, target, fabric);
			else throw new NotImplementedException(0x229AFA);
		}
		return targetOrSubject;
	}
};

//	Object: Implements operations on homogenous lean cursor lists. Exported as `Lean.List`.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const LeanList =
{
	//	no ops
}

//	Object: Implements operations on homogenous compact cursor lists. Exported as `Compact.List`.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const CompactList =
{
	//	Function: `fuse(cursorList: cbuf<GraphCursor.GraphCursorList>, targetOrSubject: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer, batchProcessingConfig: BatchProcessingConfig)` - performs a batch
	//		fuse-operation on all cursors from `cursorList`.
	//	Parameter: `cursorList: cbuf<GraphCursor.GraphCursorList>` - a list of cursors of `Compact` cursor form.
	//	Parameter: `targetOrSubject: cbuf<GraphCursor.GraphCursorList>` - NOT IMPLEMENTED; defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - NOT IMPLEMENTED; optional, defaults to `0`; the first index in target to start writing the result at.
	//	Parameter: `batchProcessingConfig: BatchProcessingConfig` - NOT IMPLEMENTED; defines the element instance handling behavior of the function:
	//		- if the `batchProcessingConfig` is not set or `batchProcessingConfig.elementInstanceHandling === InstanceHandling.MutateModified`, the function modifies each element in-place;
	//		- if the `batchProcessingConfig` is present and `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneModified`, the function creates new instances for modified elements
	//			instead of modifying existing elements; if `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneAll`, the function creates new instances for all elements.
	//			- if `batchProcessingConfig.bufPoolTransaction` is set, it collects newly created instances allowing post-processing and batch instance release;
	//	Returns: `Unset` if `cursorList === Unset` or a version of `cursorList` with all graph cursor elements of `CompactFormal` cursor form guaranteed to be fused via `Compact.fuse`.
	//		`Unset` cursors are added to the result as they are.
	//	Remarks: Support for parameters `targetOrSubject`, `offsetInTarget` and `batchProcessingConfig` is not implemented.
	fuse(cursorList, targetOrSubject = null, offsetInTarget = 0, batchProcessingConfig = null)
	{
		if (PB_DEBUG)
		{
			if (!_GraphCursor_List.is(cursorList) || (cursorList !== Unset && cursorList.some(v => !Compact.is(v)))) throw new ArgumentException(0x7343DA, "cursorList", cursorList);
			if (!Type.isNU(targetOrSubject) && !_GraphCursor_List.is(targetOrSubject)) throw new ArgumentException(0x2CA194, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x3FF12F, "offsetInTarget", offsetInTarget);
			if (!Type.isNU(batchProcessingConfig) && !(batchProcessingConfig instanceof BatchProcessingConfig)) throw new ArgumentException(0x121438, "batchProcessingConfig", batchProcessingConfig);
		}

		if (cursorList === Unset) return Unset;

		if (targetOrSubject !== null || offsetInTarget !== 0 || batchProcessingConfig !== null) throw new NotImplementedException("TODO: use `targetOrSubject`, `offsetInTarget`, `batchProcessingConfig`");

		for (let length = cursorList.count, i = 0; i < length; ++i)
		{
			const cursor = cursorList[i];
			if (cursor === Unset) continue;
			Compact.toCompactFormalFused(cursor);
		}

		return cursorList;
	},

	//	Function: `rotate(cursorList: cbuf<GraphCursor.GraphCursorList>, targetOrSubject: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer, batchProcessingConfig: BatchProcessingConfig)` - performs a batch
	//		rotate-operation on all cursors from `cursorList`.
	//	Parameter: `count: integer` - the number of rotation steps to perform on each cursor:
	//		- `count === 0` or `!(count % (cursor.count - 1))` - no rotation;
	//		- `count > 0` - right rotation (`count === 1`, `[5, "a", "b", "c"]` => `[5, "c", "a", "b"]`);
	//		- `count < 0` - left rotation (`count === -1`, `[5, "a", "b", "c"]` => `[5, "b", "c", "a"]`).
	//	Parameter: `cursorList: cbuf<GraphCursor.GraphCursorList>` - a list of cursors of `CompactFormal` cursor form.
	//	Parameter: `targetOrSubject: cbuf<GraphCursor.GraphCursorList>` - NOT IMPLEMENTED; defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - NOT IMPLEMENTED; optional, defaults to `0`; the first index in target to start writing the result at.
	//	Parameter: `batchProcessingConfig: BatchProcessingConfig` - NOT IMPLEMENTED; defines the element instance handling behavior of the function:
	//		- if the `batchProcessingConfig` is not set or `batchProcessingConfig.elementInstanceHandling === InstanceHandling.MutateModified`, the function modifies each element in-place;
	//		- if the `batchProcessingConfig` is present and `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneModified`, the function creates new instances for modified elements
	//			instead of modifying existing elements; if `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneAll`, the function creates new instances for all elements.
	//			- if `batchProcessingConfig.bufPoolTransaction` is set, it collects newly created instances allowing post-processing and batch instance release;
	//	Returns: `Unset` if `cursorList === Unset` or a version of `cursorList` with all graph cursor elements of `Compact` cursor form guaranteed to be rotateed via `Compact.rotate`.
	//		`Unset` cursors are added to the result as they are.
	//	Remarks: Support for parameters `targetOrSubject`, `offsetInTarget` and `batchProcessingConfig` is not implemented.
	rotate(cursorList, count, targetOrSubject = null, offsetInTarget = 0, batchProcessingConfig = null)
	{
		if (PB_DEBUG)
		{
			if (!_GraphCursor_List.is(cursorList) || (cursorList !== Unset && cursorList.some(v => !Compact.is(v)))) throw new ArgumentException(0xC9150A, "cursorList", cursorList);
			if (!Type.isInteger(count)) throw new ArgumentException(0x430F42, "count", count);
			if (!Type.isNU(targetOrSubject) && !_GraphCursor_List.is(targetOrSubject)) throw new ArgumentException(0xAC42FF, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0xD6F168, "offsetInTarget", offsetInTarget);
			if (!Type.isNU(batchProcessingConfig) && !(batchProcessingConfig instanceof BatchProcessingConfig)) throw new ArgumentException(0xC9F62A, "batchProcessingConfig", batchProcessingConfig);
		}

		if (cursorList === Unset) return Unset;

		if (targetOrSubject !== null || offsetInTarget !== 0 || batchProcessingConfig !== null) throw new NotImplementedException("TODO: use `targetOrSubject`, `offsetInTarget`, `batchProcessingConfig`");

		for (let length = cursorList.count, i = 0; i < length; ++i)
		{
			const cursor = cursorList[i];
			if (cursor === Unset) continue;
			Compact.rotate(cursor, count);
		}

		return cursorList;
	},

	//	Function: `merge(cursorList: cbuf<GraphCursor.GraphCursorList>, target: any, graphComposerTransaction: GraphComposerTransaction, mergePolicy: MergeDecisions, deleteMergePolicy: MergeDecisions, fabric: Fabric)` - merges
	//		all cursors from `cursorList` into the `target` graph.
	//	Parameter: `cursorList: cbuf<GraphCursor.GraphCursorList>` - a list of cursors of `CompactFormal` cursor form.
	//	Parameter: `target: any` - the target graph; can be anything.
	//	Parameter: `graphComposerTransaction: GraphComposerTransaction` - optional; a `GraphComposer` transaction capable of recording all changes applied to the target graph during graph composition and rolling back all changes on `rollback` method call.
	//	Parameter: `mergePolicy: MergeDecisions` - optional, defaults to `MergeDecisions.UseTheirs`; the merge policy for the function to use when merging vertices; see `Compact.buildMergePlan` for details.
	//	Parameter: `deleteMergePolicy: MergeDecisions` - optional, defaults to `MergeDecisions.SafeDelete`; the merge policy for the function to use if cursor head is `MergeInstruction.Delete`; see `Compact.buildMergePlan` for details.
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; used by the function to create new countable and uncountable vertices.
	//	Returns: `target`, `Unset`, an atom or a new countable or uncountable, depending on the values of `cursorList` and `target`; see `GraphComposer.executeMergePlan` for details.
	//	Remarks: Use `graphComposerTransaction` to revert any changes made to `target` in the case that the merge process fails with a `MergeConflictException` exception.
	merge(cursorList, target, graphComposerTransaction = null, mergePolicy = null, deleteMergePolicy = null, fabric = null)
	{
		if (PB_DEBUG)
		{
			if (!_GraphCursor_List.is(cursorList) || (cursorList !== Unset && cursorList.some(v => !Compact.is(v)))) throw new ArgumentException(0x27ACDC, "cursorList", cursorList);
			//	--- target may be anything
			if (!Type.isNU(graphComposerTransaction) && !(graphComposerTransaction instanceof GraphComposerTransaction)) throw new ArgumentException(0x72B43B, "graphComposerTransaction", graphComposerTransaction);
			if (!Type.isNU(mergePolicy) && !Type.isInteger(mergePolicy)) throw new ArgumentException(0xA8EC3F, "mergePolicy", mergePolicy);
			if (!Type.isNU(deleteMergePolicy) && !Type.isInteger(deleteMergePolicy)) throw new ArgumentException(0xC01930, "deleteMergePolicy", deleteMergePolicy);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0xCE3778, "fabric", fabric);
		}

		if (cursorList === Unset) return Unset;

		if (Type.isNU(mergePolicy)) mergePolicy = MergeDecisions.UseTheirs;
		if (Type.isNU(deleteMergePolicy)) deleteMergePolicy = MergeDecisions.SafeDelete;
		if (!fabric) fabric = LiteralFabric.the;

		let result = target;
		for (let length = cursorList.count, i = 0; i < length; ++i)
		{
			const cursor = cursorList[i];
			const mergePlan = Compact.buildMergePlan(cursor, result, cursor === Unset || cursor[0] !== MergeInstruction.Delete ? mergePolicy : deleteMergePolicy, fabric);
			result = GraphComposer.executeMergePlan(mergePlan, result, graphComposerTransaction, fabric);
		}
		return result;
	},
}

//	Object: Implements operations on homogenous compact formal cursor lists. Exported as `CompactFormal.List`.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const CompactFormalList =
{
	//	Function: `fuse(cursorList: cbuf<GraphCursor.GraphCursorList>, targetOrSubject: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer, batchProcessingConfig: BatchProcessingConfig)` - performs a batch
	//		fuse-operation on all cursors from `cursorList`.
	//	Parameter: `cursorList: cbuf<GraphCursor.GraphCursorList>` - a list of cursors of `CompactFormal` cursor form.
	//	Parameter: `targetOrSubject: cbuf<GraphCursor.GraphCursorList>` - NOT IMPLEMENTED; defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - NOT IMPLEMENTED; optional, defaults to `0`; the first index in target to start writing the result at.
	//	Parameter: `batchProcessingConfig: BatchProcessingConfig` - NOT IMPLEMENTED; defines the element instance handling behavior of the function:
	//		- if the `batchProcessingConfig` is not set or `batchProcessingConfig.elementInstanceHandling === InstanceHandling.MutateModified`, the function modifies each element in-place;
	//		- if the `batchProcessingConfig` is present and `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneModified`, the function creates new instances for modified elements
	//			instead of modifying existing elements; if `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneAll`, the function creates new instances for all elements.
	//			- if `batchProcessingConfig.bufPoolTransaction` is set, it collects newly created instances allowing post-processing and batch instance release;
	//	Returns: `Unset` if `cursorList === Unset` or a version of `cursorList` with all graph cursor elements of `CompactFormal` cursor form guaranteed to be fused via `CompactFormal.fuse`.
	//		`Unset` cursors are added to the result as they are.
	//	Remarks: Support for parameters `targetOrSubject`, `offsetInTarget` and `batchProcessingConfig` is not implemented.
	fuse(cursorList, targetOrSubject = null, offsetInTarget = 0, batchProcessingConfig = null)
	{
		if (PB_DEBUG)
		{
			if (!_GraphCursor_List.is(cursorList) || (cursorList !== Unset && cursorList.some(v => !CompactFormal.is(v)))) throw new ArgumentException(0x4E6DD7, "cursorList", cursorList);
			if (!Type.isNU(targetOrSubject) && !_GraphCursor_List.is(targetOrSubject)) throw new ArgumentException(0x2B755B, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x9CB484, "offsetInTarget", offsetInTarget);
			if (!Type.isNU(batchProcessingConfig) && !(batchProcessingConfig instanceof BatchProcessingConfig)) throw new ArgumentException(0xCCA264, "batchProcessingConfig", batchProcessingConfig);
		}

		if (cursorList === Unset) return Unset;

		if (targetOrSubject !== null || offsetInTarget !== 0 || batchProcessingConfig !== null) throw new NotImplementedException("TODO: use `targetOrSubject`, `offsetInTarget`, `batchProcessingConfig`");

		for (let length = cursorList.count, i = 0; i < length; ++i)
		{
			const cursor = cursorList[i];
			if (cursor === Unset) continue;
			CompactFormal.fuse(cursor);
		}

		return cursorList;
	},

	//	Function: `spread(cursorList: cbuf<GraphCursor.GraphCursorList>, targetOrSubject: cbuf<GraphCursor.GraphCursorList>, offsetInTarget: integer, batchProcessingConfig: BatchProcessingConfig)` - performs a batch
	//		spread-operation on all cursors from `cursorList`.
	//	Parameter: `cursorList: cbuf<GraphCursor.GraphCursorList>` - a list of cursors of `CompactFormal` cursor form.
	//	Parameter: `targetOrSubject: cbuf<GraphCursor.GraphCursorList>` - NOT IMPLEMENTED; defaults to `cursorList`; the converted cursor list is stored in this compound buffer.
	//	Parameter: `offsetInTarget: integer` - NOT IMPLEMENTED; optional, defaults to `0`; the first index in target to start writing the result at.
	//	Parameter: `batchProcessingConfig: BatchProcessingConfig` - NOT IMPLEMENTED; defines the element instance handling behavior of the function:
	//		- if the `batchProcessingConfig` is not set or `batchProcessingConfig.elementInstanceHandling === InstanceHandling.MutateModified`, the function modifies each element in-place;
	//		- if the `batchProcessingConfig` is present and `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneModified`, the function creates new instances for modified elements
	//			instead of modifying existing elements; if `batchProcessingConfig.elementInstanceHandling === InstanceHandling.CloneAll`, the function creates new instances for all elements.
	//			- if `batchProcessingConfig.bufPoolTransaction` is set, it collects newly created instances allowing post-processing and batch instance release;
	//	Returns: `Unset` if `cursorList === Unset` or a version of `cursorList` with all graph cursor elements of `CompactFormal` cursor form guaranteed to be spread via `CompactFormal.spread`.
	//		`Unset` cursors are added to the result as they are.
	//	Remarks: Support for parameters `targetOrSubject`, `offsetInTarget` and `batchProcessingConfig` is not implemented.
	spread(cursorList, targetOrSubject = null, offsetInTarget = 0, batchProcessingConfig = null)
	{
		if (PB_DEBUG)
		{
			if (!_GraphCursor_List.is(cursorList) || (cursorList !== Unset && cursorList.some(v => !CompactFormal.is(v)))) throw new ArgumentException(0x599841, "cursorList", cursorList);
			if (!Type.isNU(targetOrSubject) && !_GraphCursor_List.is(targetOrSubject)) throw new ArgumentException(0x740BCA, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0xB1C643, "offsetInTarget", offsetInTarget);
			if (!Type.isNU(batchProcessingConfig) && !(batchProcessingConfig instanceof BatchProcessingConfig)) throw new ArgumentException(0x32EE98, "batchProcessingConfig", batchProcessingConfig);
		}

		if (cursorList === Unset) return Unset;

		if (targetOrSubject !== null || offsetInTarget !== 0 || batchProcessingConfig !== null) throw new NotImplementedException("TODO: use `targetOrSubject`, `offsetInTarget`, `batchProcessingConfig`");

		for (let length = cursorList.count, i = 0; i < length; ++i)
		{
			const cursor = cursorList[i];
			if (cursor === Unset) continue;
			CompactFormal.spread(cursor);
		}

		return cursorList;
	},
}

//	Object: Implements graph composition operations. Exported as `GraphComposer`.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
const GraphComposer =
{
	//	Function: `executeMergePlan(mergePlan: buf, target: any, graphComposerTransaction: GraphComposerTransaction, fabric: Fabric): any` - applies the specified `mergePlan` on `target` and returns `target`, `Unset`,
	//		an atom or a new countable or uncountable, depending on the `mergePlan`.
	//	Parameter: `target: any` - the target graph; can be anything.
	//	Parameter: `graphComposerTransaction: GraphComposerTransaction` - optional; a `GraphComposer` transaction capable of recording all changes applied to the target graph during graph composition and rolling back all changes on `rollback` method call.
	//	Parameter: `fabric: Fabric` - optional, defaults to `LiteralFabric.the`; used by the function to create new countable and uncountable vertices.
	//	Returns: `target`, `Unset`, an atom or a new countable or uncountable, depending on the `mergePlan`.
	//	Exception: `ArgumentException`.
	//	Exception: `NotImplementedException`.
	//	Exception: `MergeConflictException`.
	//	See also: `Compact.buildMergePlan`, `CompactList.merge`
	executeMergePlan(mergePlan, target, graphComposerTransaction = null, fabric = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(mergePlan) && !isBuf(mergePlan)) throw new ArgumentException(0x97CEA8, "mergePlan", mergePlan);
			//	--- target may be anything
			if (!Type.isNU(graphComposerTransaction) && !(graphComposerTransaction instanceof GraphComposerTransaction)) throw new ArgumentException(0x44F0CC, "graphComposerTransaction", graphComposerTransaction);
			if (!Type.isNU(fabric) && !(fabric instanceof Fabric)) throw new ArgumentException(0x4F69B5, "fabric", fabric);
		}

		graphComposerTransaction && (graphComposerTransaction._setOriginalRoot(target));

		if (Type.isNU(fabric)) fabric = LiteralFabric.the;

		if (mergePlan.count === 0) return target;

		let result;
		let targetVertex;

		//	root
		switch (mergePlan[0])
		{
			case MergeAction.Noop:
				result = targetVertex = target;
				break;
			case MergeAction.Set_NewCountable:
				result = targetVertex = fabric.newCountable();
				graphComposerTransaction && (graphComposerTransaction._addRootMergeAction(targetVertex));
				break;
			case MergeAction.Set_NewUncountable:
				result = targetVertex = fabric.newUncountable();
				graphComposerTransaction && (graphComposerTransaction._addRootMergeAction(targetVertex));
				break;
			case MergeAction.Set_Atom:
				if (graphComposerTransaction)
				{
					const atom = mergePlan[1];
					graphComposerTransaction && (graphComposerTransaction._addRootMergeAction(atom));
					return atom;
				}
				return mergePlan[1];
			case MergeAction.Delete:
				graphComposerTransaction && (graphComposerTransaction._addRootMergeAction(Unset));
				return Unset;
			case MergeAction.Fail:
				throw new MergeConflictException(mergePlan[1] || 0xA9737F, { mergePlan });
			default: throw new NotImplementedException(0xC9159F);
		}

		//	arcs
		let step = 1;
		for (let length = mergePlan.count, i = step; i < length; i += step)
		{
			switch (mergePlan[i])
			{
				case MergeAction.Noop:
					targetVertex = targetVertex[mergePlan[i + 1]];
					step = 2;
					break;
				case MergeAction.Set_NewCountable:
					if (graphComposerTransaction)
					{
						const label = mergePlan[i + 1];
						fabric.arcExists(targetVertex, label) ?
							graphComposerTransaction._addMergeAction(targetVertex, false, label, targetVertex[label]) :
							graphComposerTransaction._addMergeAction(targetVertex, true, label);
						targetVertex = (targetVertex[label] = fabric.newCountable());
					}
					else targetVertex = (targetVertex[mergePlan[i + 1]] = fabric.newCountable());
					step = 2;
					break;
				case MergeAction.Set_NewUncountable:
					if (graphComposerTransaction)
					{
						const label = mergePlan[i + 1];
						fabric.arcExists(targetVertex, label) ?
							graphComposerTransaction._addMergeAction(targetVertex, false, label, targetVertex[label]) :
							graphComposerTransaction._addMergeAction(targetVertex, true, label);
						targetVertex = (targetVertex[label] = fabric.newUncountable());
					}
					else targetVertex = (targetVertex[mergePlan[i + 1]] = fabric.newUncountable());
					step = 2;
					break;
				case MergeAction.Set_Atom:
					if (graphComposerTransaction)
					{
						const label = mergePlan[i + 1];
						fabric.arcExists(targetVertex, label) ?
							graphComposerTransaction._addMergeAction(targetVertex, false, label, targetVertex[label]) :
							graphComposerTransaction._addMergeAction(targetVertex, true, label);
						targetVertex = (targetVertex[label] = mergePlan[i + 2]);
					}
					else targetVertex = (targetVertex[mergePlan[i + 1]] = mergePlan[i + 2]);
					return result;
					break;
				case MergeAction.Delete:
					if (graphComposerTransaction)
					{
						const label = mergePlan[i + 1];
						fabric.arcExists(targetVertex, label) ?
							graphComposerTransaction._addMergeAction(targetVertex, false, label, targetVertex[label]) :
							graphComposerTransaction._addMergeAction(targetVertex, true, label);
						delete targetVertex[label];
					}
					else delete targetVertex[mergePlan[i + 1]];
					return result;
				case MergeAction.Fail:
					throw new MergeConflictException(mergePlan[i + 2] || 0xC2CDC3, { mergePlan });
				default: throw new NotImplementedException(0x9B16A9);
			}
		}

		return result;
	},
}

const default_GraphComposerTransaction_heldRegistryBufPool = new BufPool(null, T_0x4B0ECF);
const default_GraphComposerTransaction_heldRegistryBufPool_finalize = new FinalizationRegistry(v => default_GraphComposerTransaction_heldRegistryBufPool.release(v));
//	Class: Represents a `GraphComposer` transaction capable of recording all changes applied to the target graph during graph composition and rolling back all changes on `rollback` method call.
//	See also: https://bic.wiki/wiki/Falael.Transcribe.
class GraphComposerTransaction
{
	//	Parameter: `bufPool: BufPool` - optional, defaults to a preallocated application-global static `BufPool`; the underlying `BufPool` instance used for taking hold of internal use `buf`s.
	constructor(bufPool = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(bufPool) && !(bufPool instanceof BufPool)) throw new ArgumentException(0x384AB2, "bufPool", bufPool);
		}
		if (bufPool)
		{
			this._bufPool = bufPool;
			this._finalizationRegistry = new FinalizationRegistry(v => this._bufPool.release(v));
		}
		else
		{
			this._bufPool = default_GraphComposerTransaction_heldRegistryBufPool;
			this._finalizationRegistry = default_GraphComposerTransaction_heldRegistryBufPool_finalize;
		}
		this._originalRoot = null;
		this._originalRoot_isSet = false;
		this._targetRoot = null;
		this._targetRoot_isSet = false;
		this._actions = null;
	}

	//	Function: `rollback(): any` - reverts all changes applied to a target graph by a `GraphComposer`.
	//	Returns: the original target graph.
	//	Remarks: As part of a merge plan execution, a `GraphComposer` can replace the original target graph root instance. This function returns the original target graph root instance.
	rollback()
	{
		if (PB_DEBUG)
		{
			if (!this._originalRoot_isSet) throw new InvalidOperationException(0xEAA8DA, `; transaction not initialized by a GraphComposer.`);
		}

		if (this._actions) for (let i = this._actions.count - 1; i >= 0; i -= 4)
		{
			const container = this._actions[i - 3];
			const labelCreated = this._actions[i - 2];
			const label = this._actions[i - 1];
			const original = this._actions[i];

			if (labelCreated) delete container[label];
			else container[label] = original;
		}

		const result = this._originalRoot;

		this._originalRoot = null;
		this._originalRoot_isSet = false;
		this._targetRoot = null;
		this._targetRoot_isSet = false;
		this._actions = null;

		return result;
	}

	//	Function: `commit(): any` - resets the transaction internal state effectively removing any recorded changes that were applied to a target graph by a `GraphComposer`, making it impossible to reverse the modifications and thus "comitting" any changes and making them permenent.
	//	Returns: the modified target graph.
	//	Remarks: As part of a merge plan execution, a `GraphComposer` can replace the original target graph root instance. This function returns the final target graph root instance, original or new.
	commit()
	{
		if (PB_DEBUG)
		{
			if (!this._originalRoot_isSet) throw new InvalidOperationException(0xFB91E4, `; transaction not initialized by a GraphComposer.`);
		}

		const result = this._targetRoot_isSet ? this._targetRoot : this._originalRoot;

		this._originalRoot = null;
		this._originalRoot_isSet = false;
		this._targetRoot = null;
		this._targetRoot_isSet = false;
		this._actions = null;

		return result;
	}

	//	Function: `toDiagnosicString(verbose: boolean): string` - generates a string representing a part of or the complete internal state of this `GraphComposerTransaction` instance, formatted via `Diagnostics.format`.
	//	Parameter: `verbose: boolean` - optional, defaults to `false`; if set to `true` unconditionally serializes the complete `this` instance, otherwise serializes an object as described in the "Returns"-section.
	//	Returns: If `verbose` is set to `true` returns the unconditionally serialized complete `this` instance, otherwise returns an object with the following schema:
	//	```
	//	{
	//		"originalRoot": any,	//	optional, present only if the transaction has been initialized by a GraphComposer
	//		"targetRoot": any,		//	optional, present only if a GraphComposer has replaced the target graph root instance
	//		"actions": any,			//	optional, present only if a GraphComposer has issued non-root graph modification commands
	//	}
	//	```
	toDiagnosicString(verbose = false)
	{
		if (verbose) return Diagnostics.format(this, { verbose });

		const result = {};
		if (this._originalRoot_isSet) result.originalRoot = this._originalRoot;
		if (this._targetRoot_isSet) result.targetRoot = this._targetRoot;
		if (this._actions !== null) result.actions = this._actions;
		return Diagnostics.format(result);
	}

	_setOriginalRoot(originalRoot)
	{
		this._originalRoot = originalRoot;
		this._originalRoot_isSet = true;
	}

	_addRootMergeAction(targetRoot)
	{
		this._targetRoot = targetRoot;
		this._targetRoot_isSet = true;
	}

	_addMergeAction(container, labelCreated, label, original)
	{
		if (PB_DEBUG)
		{
			if (!Type.isBoolean(labelCreated)) throw new ArgumentException(0xA60BF5, "labelCreated", labelCreated);
		}

		if (this._targetRoot_isSet) return;

		this._actions || this._finalizationRegistry.register(this, this._actions = this._bufPool.hold());

		this._actions[this._actions.count] = container;
		this._actions[this._actions.count + 1] = labelCreated;
		this._actions[this._actions.count + 2] = label;
		this._actions[this._actions.count + 3] = original;
		this._actions.count += 4;
	}
}

//	Exception: `ReturnValueException`.
//	Exception: `CircularReferenceException`.
function _leanCursorLister_visit(state, deltaOut, head, headCardinality, label, labelCardinality)
{
	if (headCardinality === void 0)	//	unroot
	{
		if (!state.cursor) return true;
		if (state.cursor.count === 2) state.cursor.count = 1;
		state.target[state.target.count] = state.cursor;
		++state.target.count;
		return true;
	}
	if (labelCardinality === void 0)	//	root
	{
		if (headCardinality === Cardinality.Zero)
		{
			if (state.target === Unset) state.target = cbuf(GraphCursorList, state.offsetInTarget, T_0x78A43F);
			const cursor = state.createCursor ? state.createCursor(state.graphCursorType, 1, 1) : cbuf(state.graphCursorType, 1, 1);
			if (PB_DEBUG)
			{
				if (CompoundBuf.getType(cursor) !== state.graphCursorType) throw new ReturnValueException(0x3B56FC, "state.createCursor", CompoundBuf.getType(cursor));
			}
			cursor[0] = head;
			state.target[state.target.count] = cursor;
			++state.target.count;
			return true;
		}
		state.visited && (state.visited[state.visited.count] = head, ++state.visited.count);
		state.cursor = state.createCursor ? state.createCursor(state.graphCursorType, 0, state.graphCursorBufferLength) : cbuf(state.graphCursorType, 0, state.graphCursorBufferLength);
		if (PB_DEBUG)
		{
			if (CompoundBuf.getType(state.cursor) !== state.graphCursorType) throw new ReturnValueException(0xCAE53B, "state.createCursor", CompoundBuf.getType(state.cursor));
		}
		state.cursor[0] = headCardinality;
		state.cursor[1] = null;
		state.cursor.count = 2;
		if (state.target === Unset) state.target = cbuf(GraphCursorList, state.offsetInTarget, T_0x78A43F);
		return true;
	}
	if (deltaOut === 1)				//	keeping the same depth; cursor points either to an atom or an empty composite
	{
		//	add the previous finding to the result, including empty composites
		state.target[state.target.count] = CompoundBuf.trim(state.cursor, true);
		++state.target.count;
		state.cursor[state.cursor.count - 1] = label;
		if (headCardinality === Cardinality.Zero) state.cursor[state.cursor.count - 2] = head;
		else
		{
			if (state.visited)
			{
				if (state.visited.lastIndexOf(head, state.visited.count - 2) !== -1) throw new CircularReferenceException(0xD2DBFA);
				if (Type.isSymbol(state.cursor[state.cursor.count - 2])) state.visited[state.visited.count - 1] = head;	//	composite head or instruction head
				else (state.visited[state.visited.count] = head, ++state.visited.count)									//	atomic head
			}
			state.cursor[state.cursor.count - 2] = headCardinality;
		}
		return true;
	}
	if (deltaOut === 0)				//	dipping in; cursor points to a non-empty composite
	{
		state.cursor[state.cursor.count + 1] = label;
		if (headCardinality === Cardinality.Zero) state.cursor[state.cursor.count] = head;
		else
		{
			if (state.visited)
			{
				if (state.visited.lastIndexOf(head, state.visited.count - 1) !== -1) throw new CircularReferenceException(0x86CF83);
				(state.visited[state.visited.count] = head, ++state.visited.count);
			}
			state.cursor[state.cursor.count] = headCardinality;
		}
		state.cursor.count += 2;
		return true;
	}
	//	add the previous finding to the result, including empty composites
	state.target[state.target.count] = CompoundBuf.trim(state.cursor, true);
	++state.target.count;
	//	climb
	state.visited.count -= deltaOut - 1;
	state.cursor.count -= 2 * (deltaOut - 1);	//	climbing
	state.cursor[state.cursor.count - 1] = label;
	if (headCardinality === Cardinality.Zero) state.cursor[state.cursor.count - 2] = head;
	else
	{
		if (state.visited)
		{
			if (state.visited.lastIndexOf(head, state.visited.count - 1) !== -1) throw new CircularReferenceException(0x4D89C9);
			(state.visited[state.visited.count] = head, ++state.visited.count);
		}
		state.cursor[state.cursor.count - 2] = headCardinality;
	}
	return true;
}

//	Exception: `ReturnValueException`.
//	Exception: `CircularReferenceException`.
function _compactCursorLister_visit(state, deltaOut, head, headCardinality, label, labelCardinality)
{
	if (headCardinality === void 0)	//	unroot
	{
		if (!state.cursor) return true;
		state.target[state.target.count] = state.cursor;
		++state.target.count;
		return true;
	}
	if (labelCardinality === void 0)	//	root
	{
		if (headCardinality === Cardinality.Zero)
		{
			if (state.target === Unset) state.target = cbuf(GraphCursorList, state.offsetInTarget, T_0x78A43F);
			const cursor = state.createCursor ? state.createCursor(state.graphCursorType, 1, 1) : cbuf(state.graphCursorType, 1, 1);
			if (PB_DEBUG)
			{
				if (CompoundBuf.getType(cursor) !== state.graphCursorType) throw new ReturnValueException(0x502B39, "state.createCursor", CompoundBuf.getType(cursor));
			}
			cursor[0] = head;
			state.target[state.target.count] = cursor;
			++state.target.count;
			return true;
		}
		state.visited && (state.visited[state.visited.count] = head, ++state.visited.count);
		state.cursor = state.createCursor ? state.createCursor(state.graphCursorType, 0, state.graphCursorBufferLength) : cbuf(state.graphCursorType, 0, state.graphCursorBufferLength);
		if (PB_DEBUG)
		{
			if (CompoundBuf.getType(state.cursor) !== state.graphCursorType) throw new ReturnValueException(0x290B85, "state.createCursor", CompoundBuf.getType(state.cursor));
		}
		state.cursor[0] = headCardinality;
		state.cursor.count = 1;
		if (state.target === Unset) state.target = cbuf(GraphCursorList, state.offsetInTarget, T_0x78A43F);
		return true;
	}
	if (deltaOut === 1)				//	keeping the same depth; cursor points either to an atom or an empty composite
	{
		//	add the previous finding to the result, including empty composites
		state.target[state.target.count] = CompoundBuf.trim(state.cursor, true);
		++state.target.count;
		state.cursor[state.cursor.count - 1] = label;
		if (headCardinality === Cardinality.Zero) state.cursor[0] = head;
		else
		{
			if (state.visited)
			{
				if (state.visited.lastIndexOf(head, state.visited.count - 2) !== -1) throw new CircularReferenceException(0x71E8D4);
				if (Type.isSymbol(state.cursor[0])) state.visited[state.visited.count - 1] = head;			//	composite head or instruction head
				else (state.visited[state.visited.count] = head, ++state.visited.count);					//	atomic head
			}
			state.cursor[0] = headCardinality;
		}
		return true;
	}
	if (deltaOut === 0)				//	dipping in; cursor points to a non-empty composite
	{
		state.cursor[state.cursor.count] = label;
		if (headCardinality === Cardinality.Zero) state.cursor[0] = head;
		else
		{
			if (state.visited)
			{
				if (state.visited.lastIndexOf(head, state.visited.count - 1) !== -1) throw new CircularReferenceException(0x4DCDC3);
				(state.visited[state.visited.count] = head, ++state.visited.count);
			}
			state.cursor[0] = headCardinality;
		}
		state.cursor.count += 1;
		return true;
	}
	//	add the previous finding to the result, including empty composites
	state.target[state.target.count] = CompoundBuf.trim(state.cursor, true);
	++state.target.count;
	//	climb
	state.visited.count -= deltaOut - 1;
	state.cursor.count -= deltaOut - 1;	//	climbing
	state.cursor[state.cursor.count - 1] = label;
	if (headCardinality === Cardinality.Zero) state.cursor[0] = head;
	else
	{
		if (state.visited)
		{
			if (state.visited.lastIndexOf(head, state.visited.count - 1) !== -1) throw new CircularReferenceException(0xAEF626);
			(state.visited[state.visited.count] = head, ++state.visited.count);
		}
		state.cursor[0] = headCardinality;
	}
	return true;
}

module.exports = GraphCursor;
module.exports.GraphCursor = GraphCursor;
module.exports.List = _GraphCursor_List;
module.exports.Lean = Lean;
module.exports.Lean.List = LeanList;
module.exports.Compact = Compact;
module.exports.Compact.List = CompactList;
module.exports.CompactFormal = CompactFormal;
module.exports.CompactFormal.List = CompactFormalList;
module.exports.GraphComposer = GraphComposer;
module.exports.GraphComposerTransaction = GraphComposerTransaction;
module.exports.GraphCursorType = GraphCursorType;
module.exports.MergeDecisions = MergeDecisions;
module.exports.MergeAction = MergeAction;
module.exports.MergeInstruction = MergeInstruction;
