//	R0Q2?/daniel/20240425
//	- TODO: reconsider the symbol-only compound type concept (already removed debug checks for compound type as symbol); allow number, string and symbol to be used as a compound type, restrict in debug checks
//		- `Diagnostics.format`
//		- JSON serialization of compounds - https://chatgpt.com/c/d582bbe5-8cd7-4612-a35d-c487bfc27625
//	- TODO: implement `CompoundStructure.fromArray`, `CompoundArray.fromArray`, `CompoundBuf.fromArray` (ref. `Buf.fromArray`)
//	- TODO: implement `CompoundStructure.setType`, `CompoundArray.setType`
//	- TODO: implement `BufPool` - expose all significant data mambers as read-only properties
//	- TODO: implement `BufPool.hold()` -> `BufPool.hold(compoundType: symbol)` - allow for inline compount type provision when getting hold on a`cbuf`
//	- TODO: implement `BufPool` - optional threshold of held memory beyond which the pool immediately frees buffer moemory upon release
//		- may be introduce a memory management policy concept defining multiple limits and behaviors; such policy could for Ex. refuse to pool bus with length exceeding a certain
//			value
//	- TEST: `CompoundStructure.copyTo`, `CompoundArray.copyTo`, `CompoundBuf.copyTo`, `CompoundBuf.augment`, `Buf.copyTo`, `CompoundBuf.setType`
//	- TEST: `new BufPool(Symbol())`, `BufPool.hold(Symbol())`
//	- OPT: add to analysis counters per buffer element count, increment on release
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { ArgumentException, InvalidOperationException } = require("-/pb/natalis/003/Exception.js");
const { tunable, logger } = require("-/pb/natalis/010/Context.js");

const T_0xB275B7 = tunable(0xB275B7);
const T_0x3EEDC9 = tunable(0x3EEDC9);
const T_0xA37DF4 = tunable(0xA37DF4);
const T_0xAB9C26 = tunable(0xAB9C26);
const T_0xDBAF1B = tunable(0xDBAF1B);
const T_0x523EBA = tunable(0x523EBA);

const CompoundStructureMarker = Symbol.for("CompoundStructureMarker");

const CompoundStructureLowerBound = 2;
const CompoundArrayLowerBound = 0;
const CompoundBufLowerBound = 0;
const BufLowerBound = 0;

const analyseResult = { heldCount: 0, heldElementCount: 0, totalElementCount: 0 };

//	Class: Provides facilities for creating and recognizing of all Primordial Blocks compound memory structures:
//		- Compound Structure (`Compound.cost()`, `Compound.isCompoundStructure()`) - a structured typed array of the form `[Symbol("CompoundStructureMarker"), <arrayTypeSymbol>, <arrayElement0>, <arrayElement1>, ...]`.
//			See `Compound.CompoundStructure`.
//		- Compound Array (`Compound.carr()`, `Compound.isCompoundArray()`) - a typed array of the form `arr === [<arrayElement0>, <arrayElement1>, ...]`, `arr.PB_compoundType === <arrayTypeSymbol>`.
//			See `Compound.CompoundArray`.
//		- Compound Buffer (`Compound.cbuf()`, `Compound.isCompoundBuf()`) - a typed buffered array of the form `arr === [<arrayElement0>, <arrayElement1>, ..., (empty)]`,
//			`arr.length === <bufferLength>`, `arr.count === <actualDataLength>`, `arr.PB_compoundType === <arrayTypeSymbol>`. See `Compound.CompoundBuf`.
//		- Buffer (`Compound.buf()`, `Compound.isBuf()`) - a generic buffered array of the form `arr === [<arrayElement0>, <arrayElement1>, ..., (empty)]`, `arr.length === <bufferLength>`,
//			`arr.count === <actualDataLength>`. See`Compound.Buf`.
//		- Buffer Pool - a pool of preallocated `buf`s or `cbufs`. See `Compound.BufPool`.
//	Remarks:
//		Compound memory structures offer array typing and preallocation facilities optimized for performance.
//
//		The compound structure (`cost`), compound array (`carr`), and compound buffer (`cbuf`) are not optimized for serialization and deserialization. The compound type shall be serialized
//			separately, possibly as a string or numeric compound type property, and the deserializer shall have prior knowledge on how to parse values of the given property back to a
//			symbol and augment the parsed compound structure (`cost`), compound array (`carr`) or compound buffer (`cbuf`) with thre resulting compound type. Compound structures (`cost`)
//			might be serialized either with their first element that stores the compound type as `void 0` or completely remove this element from the serialized array. Once again, a
//			deserializer must be implemented according to the schosen serialization format.
//
//		Motivation
//		-------------
//		Tests show that any type of array inheritance, as well as using native ways of expanding an array (`array.push()`, `array.length = <largerValue>`), intoduce huge performance overhead
//			with array creation and/or property access. In order to allow faster operations with typed arrays and faster array creation and expansion, Primordial Blocks implements
//			multiple facilities suitable for different scenarios:
//			- Array typing through a user-defined symbol; depending on the needs, the type-defining symbol can be stored either as the first array element, offsetting the lower indexing bound
//				for the actual data elements of the array to `1` (`cost`), or as a property of the array object (`carr`, `cbuf`).
//			- Memory preallocation (`buf`, `cbuf`) - the initial native length of an array is higher or equal than the initial actual data element count in the array; array's `length` property
//				indicates the preallocated element count while a newly introduced `count` property indicated the count of elements actually in use; the `count` property is manually managed by the user.
//	Performance: Tested and optimized.
const Compound = module.exports =
{
	//	Function: `cost(compoundType: symbol, count: integer): Array` - creates a new structured typed array of type `compoundType` and of length `length + 1`.
	//	Parameter: `compoundType: symbol` - a user-defined symbol for type identification of the array.
	//	Parameter: `count: integer` - optional, defaults to `0`; a non-negative integer specifying the count of elements in the new array.
	//	Returns: An array of the form `[Symbol("CompoundStructureMarker"), <arrayTypeSymbol>, <arrayElement0>, <arrayElement1>, ...]`.
	//	Lower bound: `2`.
	//	Remarks: The `Symbol("CompoundStructureMarker")` is stored in the first element of the array. The array type is stored in the second element of the array. 
	//		The array has the form `[Symbol("CompoundStructureMarker"), <arrayTypeSymbol>, <arrayElement0>, <arrayElement1>, ...]`.
	//		Array type's symbol is available via `arr[1]`.
	//	Exception: `ArgumentException`.
	//	Performance: 1.5x faster with creation of empty arrays compared to `carr` with v8; inconvenient interface (lower bound of actual array data is `2` and not the usual `0`).
	//	See also: `Compound.CompoundStructure`.
	cost(compoundType, count = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x9332DD, "compoundType", compoundType);
			if (!Type.isInteger(count) || count < 0) throw new ArgumentException(0x979369, "length", count);
		}
		switch (count)
		{
			case 0: return new Array(CompoundStructureMarker, compoundType);
			default:
				const result = new Array(count + 2);
				result[0] = CompoundStructureMarker;
				result[1] = compoundType;
				return result;
		}
	},

	//	Function: `isCompoundStructure(value: any): bool` - tests whether `value` is a compound structure (`cost`).
	//	Parameter: `value: any` - the value to test; can be any value.
	//	Returns: `true` if `value` is a JavaScript array (`Array.isArray(value)`), has a length >= 1 and the constructor of the element at index `0` is `Symbol("CompoundStructureMarker")`, otherwise returns `false`.
	//	See also: `Compound.CompoundStructure`.
	isCompoundStructure(value)
	{
		return Array.isArray(value) && value.length >= 2 && value[0] === CompoundStructureMarker;
	},

	//	Function: `carr(compoundType: symbol, length: integer): Array` - creates a new typed array of type `compoundType` and of the specified `length`.
	//	Parameter: `compoundType: symbol` - a user-defined symbol for type identification of the array.
	//	Parameter: `length: integer` - optional, defaults to `0`; a non-negative integer specifying the length of the new array.
	//	Returns: An array with the `PB_compoundType` property set to the value of the `compoundType` parameter.
	//	Lower bound: `0`.
	//	Remarks: The array type is stored as the `PB_compoundType` property of the array.
	//		Array type's symbol is available via `arr.PB_compoundType`.
	//	Exception: `ArgumentException`.
	//	Performance: 1.5x slower with creation of empty arrays compared to `cost` with v8; convenient interface (lower bound of actual array data is `0`).
	//	See also: `Compound.CompoundArray`.
	carr(compoundType, length = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x69C877, "compoundType", compoundType);
			if (!Type.isInteger(length) || length < 0) throw new ArgumentException(0x72E380, "length", length);
		}
		const result = new Array(length);
		result.PB_compoundType = compoundType;
		return result;
	},

	//	Function: `isCompoundArray(value: any): bool` - tests whether `value` is a compound array (`carr`).
	//	Parameter: `value: any` - the value to test; can be any value.
	//	Returns: `true` if `value` is a JavaScript array (`Array.isArray(value)`), has no integer `count` property and has the `PB_compoundType` property is not undefined, otherwise returns `false`.
	//	See also: `Compound.CompoundArray`.
	isCompoundArray(value)
	{
		return Array.isArray(value) && !Number.isInteger(value.count) && value.PB_compoundType !== void 0;
	},

	//	Function: `cbuf(compoundType: symbol, length: integer, bufferLength: integer): Array` - creates a new preallocated typed array of type `compoundType`, with native array length set
	//		to `bufferLength` and actual data length set to `length`. The newly created buffer is not associated with buffer pool.
	//	Parameter: `compoundType: symbol` - a user-defined symbol for type identification of the array.
	//	Parameter: `length: integer` - optional, defaults to `0`; a non-negative integer specifying the actual data length of the new array (`arr.count === length`).
	//	Parameter: `bufferLength: integer` - optional, defaults to `tunable(0x523EBA)`; a positive integer specifying the native length of the new array (`arr.length === bufferLength`).
	//	Returns: A preallocated array with the `PB_compoundType` property set to the value of the `compoundType` parameter, native array length set to `bufferLength` and the `count` property
	//		set to the value of the `length` parameter.
	//	Lower bound: `0`.
	//	Remarks: The array type is stored as the `PB_compoundType` property of the array (array type's symbol is available via `arr.PB_compoundType`). The actual data length is stored
	//		as the `count` property of the array. After array's creation, the `count` property is manually managed by the user.
	//	Exception: `ArgumentException`.
	//	Performance: 1.5x slower with creation of empty arrays compared to `cost` with v8; convenient interface (lower bound of actual array data is `0`).
	//	Tunable: `0x523EBA`.
	//	See also: `Compound.CompoundBuf`.
	cbuf(compoundType, length = 0, bufferLength = T_0x523EBA)
	{
		if (PB_DEBUG)
		{
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x6194C7, "compoundType", compoundType);
			if (!Type.isInteger(length) || length < 0) throw new ArgumentException(0x62938B, "length", length);
			if (!Type.isInteger(bufferLength) || bufferLength < 1) throw new ArgumentException(0x1717FB, "bufferLength", bufferLength);
		}
		const result = new Array(Math.max(bufferLength, length));
		result.count = length;
		result.PB_compoundType = compoundType;
		return result;
	},

	//	Function: `isCompoundBuf(value: any): bool` - tests whether `value` is a compound buffer (`cbuf`).
	//	Parameter: `value: any` - the value to test; can be any value.
	//	Returns: `true` if `value` is a JavaScript array (`Array.isArray(value)`), `value.count` is an integer and `value.PB_compoundType` property is not undefined, otherwise returns `false`.
	//	See also: `Compound.CompoundBuf`.
	isCompoundBuf(value)
	{
		return Array.isArray(value) && Number.isInteger(value.count) && value.PB_compoundType !== void 0;
	},

	//	Function: `buf(bufferLength: integer): Array` - creates a new preallocated array, with native array length set
	//		to `bufferLength` and actual data length set to `0`. The newly created buffer is not associated with buffer pool.
	//	Parameter: `bufferLength: integer` - optional, defaults to `tunable(0x523EBA)`; a non-negative integer specifying the native length of the new array (`arr.length === bufferLength`).
	//	Returns: A preallocated array with with native array length set to `bufferLength`
	//	Lower bound: `0`.
	//	Remarks: The actual data length is stored as the `count` property of the array. After array's creation, the `count` property is manually managed by the user.
	//	Exception: `ArgumentException`.
	//	Tunable: `0x523EBA`.
	//	See also: `Compound.Buf`.
	buf(bufferLength = T_0x523EBA)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(bufferLength) || bufferLength < 0) throw new ArgumentException(0xE89F0D, "bufferLength", bufferLength);
		}
		const result = new Array(bufferLength);
		result.count = 0;
		return result;
	},

	//	Function: Tests whether `value` is likely to be a buffered array (`buf`).
	//	Parameter: `value` - the value to test.
	//	Returns: `true` if `value` appears to be a buffered array, otherwise returns `false`.
	//	Remarks: Buffered array are in their essence regular JavaScript arrays. This method checks whether `value` is an array (`Array.isArray(value)`) and whether
	//		`value.count` holds an integer value.
	isBuf(value)
	{
		return Array.isArray(value) && Number.isInteger(value.count);
	},

	//	Function: `lowerBound(value: Array): integer` - gets the first iteratable index in the `value` array.
	//	Parameter: `value: Array` - the value to test.
	//	Returns: `1` if value is a compound structure (`cost`), otherwise returns `0`.
	//	See also: `Compound.isCompoundStructure`, Remarks section.
	lowerBound(value)
	{
		if (PB_DEBUG)
		{
			if (!Array.isArray(value)) throw new ArgumentException(0x8CBDF0, "value", value);
		}
		return value.length >= 2 && value[0] === CompoundStructureMarker ? CompoundStructureLowerBound : 0;
	},

	//	Function: `lowerBound(value: Array): integer` - gets the last iteratable index in the `value` array.
	//	Parameter: `value: Array` - the value to test.
	//	Returns: If `value` is `cost` returns `value.length - 1`; else if `value` is `buf` or `cbuf` returns `value.count - 1`, otherwise (`carr`, plain Array) returns `value.length - 1`.
	//	See also: `Compound.isCompoundStructure`, Remarks section.
	upperBound(value)
	{
		if (PB_DEBUG)
		{
			if (!Array.isArray(value)) throw new ArgumentException(0x35B094, "value", value);
		}
		//     is cost?                                                                       is buf, cbuf?                                     return for carr, plain Array
		return value.length >= 2 && value[0] === CompoundStructureMarker ? value.length - 1 : Number.isInteger(value.count) ? value.count - 1 : value.length - 1;
	},

	//	Function: `count(value: Array): integer` - gets the number of content elements in the `value` array.
	//	Parameter: `value: Array` - the value to test.
	//	Returns: If `value` is `cost` returns `value.length - 2`; else if `value` is `buf` or `cbuf` returns `value.count - 1`, otherwise (`carr`, plain Array) returns `value.length`.
	//	See also: `Compound.isCompoundStructure`, Remarks section.
	count(value)
	{
		if (PB_DEBUG)
		{
			if (!Array.isArray(value)) throw new ArgumentException(0xF3CF37, "value", value);
		}
		//     is cost?                                                                                                 is buf, cbuf?                                 return for carr, plain Array
		return value.length >= 2 && value[0] === CompoundStructureMarker ? value.length - CompoundStructureLowerBound : Number.isInteger(value.count) ? value.count : value.length;
	},

	//	Function: `copyElements(value: Array, target: Array, offsetInTarget: integer): Array` - copies significant elements from `value` over to `target` preserving `target`'s underlying array structure and possible flavor.
	//	Parameter: `value: Array` - the array to copy elements from.
	//	Parameter: `target: Array` - the array to copy elements to.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result at.
	//	Returns: the `target` instance.
	//	Remarks: Preserves the target's underlying structure (comp, buf, cbuf etc.); only transfers elements. Sets `target`s length/count to `value`s length/count.
	//	See also: `Compound.isCompoundStructure`, Remarks section.
	copyElements(value, target, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Array.isArray(value)) throw new ArgumentException(0xBCCB14, "value", value);
			if (!Array.isArray(target)) throw new ArgumentException(0x7E088B, "target", target);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x90A00C, "offsetInTarget", offsetInTarget);
		}

		const value_lowerBound = Compound.lowerBound(value);
		const value_count = Compound.count(value);
		const target_lowerBound = Compound.lowerBound(target);

		//	preallocate memory and set content element count
		//	target is a buffer (has both `length` - buffer length, and `count` - content element count)
		if (Number.isInteger(target.count))
		{
			target.length = Math.max(target_lowerBound + value_count + offsetInTarget, target.length);
			target.count = value_count + offsetInTarget;
		}
		//	target is a non-buffer (has only a `length` property and no `count`)
		else target.length = target_lowerBound + value_count + offsetInTarget;

		for (let i = value_lowerBound + value_count - 1, j = target_lowerBound + value_count - 1 + offsetInTarget; i >= value_lowerBound; --i, --j) target[j] = value[i];

		return target;
	},

	//	Function: `placeRange(value: Array, startIndex: integer, count: integer, target: Array, offsetInTarget: integer): Array` - copies `count` significant elements from `value` starting at `startIndex`
	//		over to `target` preserving `target`'s underlying array structure and possible flavor.
	//	Parameter: `value: Array` - the array to copy elements from.
	//	Parameter: `startIndex: integer` - required; a non-negative integer indicating the index in `value` of the first copied element relative to lower bound.
	//	Parameter: `count: integer` - required; a non-negative integer indicating the number of `value` elements to copy; `startIndex + count < Compound.count(value)`, only the available elements are copied, if any.
	//	Parameter: `target: Array` - the array to copy elements to.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in target to start writing the result at.
	//	Returns: the `target` instance.
	//	Remarks: Preserves the target's underlying structure (comp, buf, cbuf etc.); only transfers elements. If the copied elements fit within the current length/count of the `target`
	//		the `target`s length/count is preserved, otherwise the `target`s length/count is increased to fit all elements.
	//	See also: `Compound.isCompoundStructure`, Remarks section.
	placeRange(value, startIndex, count, target, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Array.isArray(value)) throw new ArgumentException(0x60C5D2, "value", value);
			if (!Type.isInteger(startIndex) || startIndex < 0) throw new ArgumentException(0xEB3907, "startIndex", startIndex);
			if (!Type.isInteger(count) || count < 0) throw new ArgumentException(0xBA27F7, "count", count);
			if (!Array.isArray(target)) throw new ArgumentException(0x1A8F9B, "target", target);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x8A8E96, "offsetInTarget", offsetInTarget);
		}

		const value_lowerBound = Compound.lowerBound(value);
		const value_count = Compound.count(value);

		if (value_count <= startIndex) return target;

		const range_count = Math.min(count, value_count - startIndex);
		const target_lowerBound = Compound.lowerBound(target);

		//	preallocate memory and set content element count
		//	target is a buffer (has both `length` - buffer length, and `count` - content element count)
		if (Number.isInteger(target.count))
		{
			target.length = Math.max(target_lowerBound + range_count + offsetInTarget, target.length);
			target.count = Math.max(target.count, range_count + offsetInTarget);
		}
		//	target is a non-buffer (has only a `length` property and no `count`)
		else target.length = Math.max(target.length, target_lowerBound + range_count + offsetInTarget);

		for (let i = value_lowerBound + startIndex + range_count - 1, j = target_lowerBound + range_count - 1 + offsetInTarget; i >= value_lowerBound + startIndex; --i, --j) target[j] = value[i];

		return target;
	},
}

//	Class: Provides facilities for copying, type- and lower-bount-checking of compound structures (`cost`).
//	Performance: Tested and optimized.
const CompoundStructure =
{
	//	Function: `clone(compound): compound` - creates a shallow copy of the provided compound structure (`cost`).
	//	Parameter: `compound` - the compound structure to copy; must satisfy the condition `Compound.isCompoundStructure(compound)`.
	//	Returns: A shallow copy of `compound`.
	//	Remarks: Uses a single call to `compound.slice(0)`.
	//	Exception: `ArgumentException`.
	clone(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundStructure(compound)) throw new ArgumentException(0x3B90C6, "compound", compound);
		}
		return compound.slice(0);
	},

	//	Function: `copyTo(compound, target: []): compound` - augments `target` as a compound structure (`cost`) and copies provided `compound` structure (`cost`) over `target`.
	//	Parameter: `compound` - the compound structure to copy from; must satisfy the condition `Compound.isCompoundStructure(compound)`.
	//	Parameter: `target: []` - the array to copy to.
	//	Returns: A reference to `target` augmented as a compound structure (`cost`); `target`'s compound type is set to the `compound`'s type.
	//	Exception: `ArgumentException`.
	copyTo(compound, target)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundStructure(compound)) throw new ArgumentException(0x3F83CC, "compound", compound);
			if (!Type.isArray(target)) throw new ArgumentException(0x90287F, "target", target);
		}
		target.length = compound.length;
		for (let i = compound.length - 1; i >= 0; --i) target[i] = compound[i];
		return target;
	},

	//	Function: `isOf(compound: any, compoundType: symbol): boolean` - test whether `compound` is a compound structure (`cost`) and is of the specified `compoundType`.
	//	Parameter: `compound: any` - the compound structure (`cost`) to test; can be anything.
	//	Parameter: `compoundType: symbol` - a user-defined symbol specifying the array type to test upon.
	//	Returns: `true` if `!!compound` tests positive, its first element equals to `Symbol("CompoundStructureMarker")` and its second element equals `compoundType`, otherwise returns `false`.
	//	Exception: `ArgumentException`.
	isOf(compound, compoundType)
	{
		if (PB_DEBUG)
		{
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x6BB219, "compoundType", compoundType);
		}
		return compound && compound[0] === CompoundStructureMarker && compound[1] === compoundType;
	},

	//	Function: `getType(compound): symbol` - returns the compount type of the provided `compound`.
	//	Parameter: `compound` - the compound structure (`cost`) to examine; must satisfy the condition `Compound.isCompoundStructure(compound)`.
	//	Returns: The compount type of the provided `compound`.
	//	Exception: `ArgumentException`.
	getType(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundStructure(compound)) throw new ArgumentException(0xE2509F, "compound", compound);
		}
		return compound[1];
	},

	//	Function: `sort(compound, compare(left, right): boolean): compound` - sorts the provided compound structure (`cost`).
	//	Parameter: `compound` - the compound structure to sort; must satisfy the condition `Compound.isCompoundStructure(compound)`.
	//	Parameter: `compare(left, right): boolean` - required; a comparer callback for sorting.
	//	Returns: the `compound` instance.
	//	Performance: This implementation copies the array two times, which might be inefficient; further examination of the possibilities is required.
	//	Exception: `ArgumentException`.
	sort(compound, compare)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundStructure(compound)) throw new ArgumentException(0xC48CD7, "compound", compound);
			if (!CallableType.isFunction(compare)) throw new ArgumentException(0x1A5F6F, "compare", compare);
		}
		const compoundStructureMarker = compound.shift();
		const compoundType = compound.shift();
		compound.sort(compare);
		compound.unshift(compoundType);
		compound.unshift(compoundStructureMarker);
		return compound;
	},

	//	Static Field: The lower bound for iterating compound strutures (`cost`). Equals to `1`.
	LowerBound: CompoundStructureLowerBound,
}

//	Class: Provides facilities for copying, type- and lower-bount-checking of compound arrays (`carr`).
//	Performance: Tested and optimized.
const CompoundArray =
{
	//	Function: `clone(compound): compound` - creates a shallow copy of the provided `compound` array (`carr`).
	//	Parameter: `compound` - the compound array to copy; must satisfy the condition `Compound.isCompoundArray(compound)`.
	//	Returns: A shallow copy of `compound`.
	//	Remarks: Uses a call to `compound.slice(0)` and a property assignment.
	//	Exception: `ArgumentException`.
	clone(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundArray(compound)) throw new ArgumentException(0xDE733C, "compound", compound);
		}
		const result = compound.slice(0);
		result.PB_compoundType = compound.PB_compoundType;
		return result;
	},

	//	Function: `copyTo(compound, target: []): compound` - augments `target` as a compound array (`carr`) and copies provided `compound` array (`carr`) over `target`.
	//	Parameter: `compound` - the compound array to copy; must satisfy the condition `Compound.isCompoundArray(compound)`.
	//	Parameter: `target: []` - the array to copy to.
	//	Returns: A reference to `target` augmented as a compound array (`carr`); `target`'s compound type is set to the `compound`'s type.
	//	Exception: `ArgumentException`.
	copyTo(compound, target)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundArray(compound)) throw new ArgumentException(0xA3C583, "compound", compound);
			if (!Type.isArray(target)) throw new ArgumentException(0xF2EFCF, "target", target);
		}
		target.length = compound.length;
		target.PB_compoundType = compound.PB_compoundType;
		for (let i = compound.length - 1; i >= 0; --i) target[i] = compound[i];
		return target;
	},

	//	Function: `isOf(compound: any, compoundType: symbol): boolean` - test whether `compound` is a compound array (`carr`) and of the specified `compoundType`.
	//	Parameter: `compound: any` - the compound array (`carr`) to test; can be anything.
	//	Parameter: `compoundType: symbol` - a user-defined symbol specifying the array type to test upon.
	//	Returns: `true` if `!!compound` tests positive and its `PB_compoundType` property equals `compoundType`, otherwise returns `false`.
	//	Exception: `ArgumentException`.
	isOf(compound, compoundType)
	{
		if (PB_DEBUG)
		{
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0xCAC8F0, "compoundType", compoundType);
		}
		return compound && compound.PB_compoundType === compoundType;
	},

	//	Function: `getType(compound): symbol` - returns the compount type of the provided `compound`.
	//	Parameter: `compound` - the compound array (`carr`) to examine; must satisfy the condition `Compound.isCompoundArray(compound)`.
	//	Returns: The compount type of the provided `compound`.
	//	Exception: `ArgumentException`.
	getType(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundArray(compound)) throw new ArgumentException(0x5B0161, "compound", compound);
		}
		return compound.PB_compoundType;
	},

	//	Static Field: The lower bound for iterating compound arrays (`carr`). Equals to `0`.
	LowerBound: CompoundArrayLowerBound,
}

//	Class: Provides facilities for copying, augmenting, type- and lower-bount-checking of compound buffers (`cbuf`).
//	Performance: Tested and optimized.
const CompoundBuf =
{
	//	Function: `clone(compound): compound` - creates a shallow copy of the provided compound buffer (`cbuf`).
	//	Parameter: `compound` - the compound buffer to copy; must satisfy the condition `Compound.isCompoundBuf(compound)`.
	//	Returns: A shallow copy of `compound`.
	//	Remarks: Uses a call to `compound.slice(0)` and two property assignments.
	//	Exception: `ArgumentException`.
	clone(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundBuf(compound)) throw new ArgumentException(0x733518, "compound", compound);
		}
		const result = compound.slice(0);
		result.PB_compoundType = compound.PB_compoundType;
		result.count = compound.count;
		return result;
	},

	//	Function: `copyTo(compound, target: []): compound` - augments `target` as a compound buffer (`cbuf`) and copies provided `compound` buffer (`cbuf`) over `target`.
	//	Parameter: `compound` - the compound buffer to copy; must satisfy the condition `Compound.isCompoundBuf(compound)`.
	//	Parameter: `target: []` - the array to copy to.
	//	Returns: A reference to `target` augmented as a compound buffer (`cbuf`); `target`'s length, count and compound type are set to the `compound`'s length, count and type.
	//	Exception: `ArgumentException`.
	copyTo(compound, target)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundBuf(compound)) throw new ArgumentException(0xAAA779, "compound", compound);
			if (!Type.isArray(target)) throw new ArgumentException(0xC45AED, "target", target);
		}
		target.length = compound.length;
		target.count = compound.count;
		target.PB_compoundType = compound.PB_compoundType;
		for (let i = compound.count - 1; i >= 0; --i) target[i] = compound[i];
		return target;
	},

	//	Function: `trim(compound): compound` - creates a shallow copy of the portion of the provided compound buffer (`cbuf`) used for actual data (copies the first `compound.count`
	//		or `compound.length` elements, whichever is lower).
	//	Parameter: `compound` - the compound buffer to copy; must satisfy the condition `Compound.isCompoundBuf(compound)`.
	//	Returns: A shallow copy of the portion of `compound` used for actual data (copies the first `compound.count` or `compound.length` elements, whichever is lower).
	//	Remarks: Uses a call to `compound.slice(0)` and two property assignments.
	//	Exception: `ArgumentException`.
	trim(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundBuf(compound)) throw new ArgumentException(0xA57741, "compound", compound);
		}
		const result = compound.count < compound.length ? compound.slice(0, compound.count) : compound.slice(0);
		result.PB_compoundType = compound.PB_compoundType;
		result.count = compound.count;
		return result;
	},

	//	Function: `augment(array: [], compoundType: symbol, count: integer): compound` - modifies the `array` instance by augmenting it with the provided compound buffer attributes.
	//	Parameter: `array` - an array to augment as a compound buffer (`cbuf`); works well also with compound arrays (`carr`) and compound buffers (`cbuf`); if `array` is a
	//		compound structure(`cost`) the result is unpredictable.
	//	Parameter: `compoundType: symbol` - a user-defined symbol specifying the array type to augment `array` with.
	//	Parameter: `count: integer` - optional; a non-negative integer; if present modifies the `count` property of the `array`.
	//	Returns: A reference to the `array` argument.
	//	Remarks:
	//		Uses two property assignments.
	//		If `array` is already a compound array (`carr`) changes its type (the `PB_compoundType` property) to `compoundType` and augments it with a `count` property.
	//		If `array` is already a compound buffer (`cbuf`) changes its type (the `PB_compoundType` property) to `compoundType` and and its count (the `count` property) to `count`.
	//		If `array` is a compound structure (`cost`) the result is unpredictable.
	//	Exception: `ArgumentException`.
	augment(array, compoundType, count = void 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(array)) throw new ArgumentException(0x2E16C0, "array", array);
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x1466FA, "compoundType", compoundType);
			if (!Type.isNU(count) && (!Type.isInteger(count) || count < 0)) throw new ArgumentException(0x3606A4, "count", count);
		}
		array.PB_compoundType = compoundType;
		if (Type.isInteger(count)) array.count = count;
		return array;
	},

	//	Function: `isOf(compound: any, compoundType: symbol): boolean` - test whether `compound` is a compound buffer (`cbuf`) and of the specified `compoundType`.
	//	Parameter: `compound: any` - the compound buffer (`cbuf`) to test; can be anything.
	//	Parameter: `compoundType: symbol` - a user-defined symbol specifying the array type to test upon.
	//	Returns: `true` if `!!compound` tests positive and its `PB_compoundType` property equals `compoundType`, otherwise returns `false`.
	//	Exception: `ArgumentException`.
	isOf(compound, compoundType)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundBuf(compound)) throw new ArgumentException(0x54D661, "compound", compound);
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x7DC0BF, "compoundType", compoundType);
		}
		return compound && compound.PB_compoundType === compoundType;
	},

	//	Function: `getType(compound): symbol` - returns the compount type of the provided `compound`.
	//	Parameter: `compound` - the compound buffer (`cbuf`) to examine; must satisfy the condition `Compound.isCompoundBuf(compound)`.
	//	Returns: The compount type of the provided `compound`.
	//	Exception: `ArgumentException`.
	getType(compound)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundBuf(compound)) throw new ArgumentException(0x681738, "compound", compound);
		}
		return compound.PB_compoundType;
	},

	//	Function: `setType(compound, compoundType: symbol): cbuf` - changes the compount type of the provided `compound`.
	//	Parameter: `compound` - the compound buffer (`cbuf`) to modify; must satisfy the condition `Compound.isCompoundBuf(compound)`.
	//	Parameter: `compoundType: symbol` - a user-defined symbol specifying the new compound type.
	//	Returns: `compound`.
	//	Exception: `ArgumentException`.
	setType(compound, compoundType)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isCompoundBuf(compound)) throw new ArgumentException(0x433FB0, "compound", compound);
			if (!Type.isSymbol(compoundType)) throw new ArgumentException(0x932C38, "compoundType", compoundType);
		}
		compound.PB_compoundType = compoundType;
		return compound;
	},


	//	Static Field: The lower bound for iterating compound buffers (`cbuf`). Equals to `0`.
	LowerBound: CompoundBufLowerBound,
}

//	Class: Provides facilities for copying, trimming and lower-bount-checking of buffers (`buf`).
//	Performance: Tested and optimized.
const Buf =
{
	//	Function: `clone(buf): buffer` - creates a shallow copy of the provided buffer (`buf`).
	//	Parameter: `buf` - the buffer to copy; must satisfy the condition `Compound.isBuf(buf)`.
	//	Returns: A shallow copy of `buf`.
	//	Remarks: Uses a call to `buf.slice(0)` and a property assignment.
	//	Exception: `ArgumentException`.
	clone(buf)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isBuf(buf)) throw new ArgumentException(0x57D822, "buf", buf);
		}
		const result = buf.slice(0);
		result.count = buf.count;
		return result;
	},

	//	Function: `copyTo(buf, target: []): buffer` - augments `target` as a buffer (`buf`) and copies provided `buf` over `target`.
	//	Parameter: `buf` - the buffer to copy; must satisfy the condition `Compound.isBuf(buf)`.
	//	Parameter: `target: []` - the array to copy to.
	//	Returns: A reference to `target` augmented as a buffer (`buf`); `target`'s length and count are set to the `buf`'s length and count.
	//	Exception: `ArgumentException`.
	copyTo(buf, target)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isBuf(buf)) throw new ArgumentException(0x501F78, "buf", buf);
			if (!Type.isArray(target)) throw new ArgumentException(0xCBFFCE, "target", target);
		}
		target.length = buf.length;
		target.count = buf.count;
		for (let i = buf.count - 1; i >= 0; --i) target[i] = buf[i];
		return target;
	},

	//	Function: `trim(buf): buffer` - creates a shallow copy of the portion of the provided buffer (`buf`) used for actual data (copies the first `buf.count`
	//		or `buf.length` elements, whichever is lower).
	//	Parameter: `buf` - the buffer to copy; must satisfy the condition `Compound.isBuf(buf)`.
	//	Returns: A shallow copy of the portion of `buf` used for actual data (copies the first `buf.count` or `buf.length` elements, whichever is lower).
	//	Remarks: Uses a call to `buf.slice(0)` and a property assignment.
	//	Exception: `ArgumentException`.
	trim(buf)
	{
		if (PB_DEBUG)
		{
			if (!Compound.isBuf(buf)) throw new ArgumentException(0x9C1ABA, "buf", buf);
		}
		const result = buf.count < buf.length ? buf.slice(0, buf.count) : buf.slice(0);
		result.count = buf.count;
		return result;
	},

	//	Function: `fromArray(array: Array, bufferLength: integer): Array` - creates a new preallocated array, with native array length set to `bufferLength` or `array.length`
	//		(whichever is higher) and actual data length (`result.count`) set to `array.length`. The elements of `array` are copied over to the newly created buf.
	//	Parameter: `array: Array` - required; an array to create a buf from.
	//	Parameter: `bufferLength: integer` - optional, defaults to `tunable(0x523EBA)`; a non-negative integer specifying the native length of the new array (`arr.length === bufferLength`).
	//	Returns: A new preallocated array, with native array length set to `bufferLength` or `array.length` (whichever is higher) and actual data length (`result.count`) set to `array.length`.
	//		The elements of `array` are copied over to the newly created buf.
	//	Lower bound: `0`.
	//	Remarks: The actual data length is stored as the `count` property of the array. After array's creation, the `count` property is manually managed by the user.
	//	Exception: `ArgumentException`.
	//	Tunable: `0x523EBA`.
	//	Performance:
	//		If `array.length > bufferLength`, this function uses `array.slice(0)` to clone the `array` into a new buf. Otherwise, function uses `Object.assign` to copy `array` 
	//			elements into the new buf. This approach guarantees only one memory operation per function call.
	//		The performance of `Object.assign` has not been tested, though. Further analysis and tests are required to enssure optimal performace.
	//	See also: `Compound.buf`.
	fromArray(array, bufferLength = T_0x523EBA)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(array)) throw new ArgumentException(0xBBDA6E, "array", array);
			if (!Type.isInteger(bufferLength) || bufferLength < 0) throw new ArgumentException(0x6C3D94, "bufferLength", bufferLength);
		}
		const count = array.length;
		const result = count > bufferLength ? array.slice(0) : Object.assign(new Array(bufferLength), array);
		result.count = count;
		return result;
	},

	//	Function: `augment(array: Array, count: integer): Array` - modifies the `array` instance by augmenting it with the provided buffer attribute `count`.
	//	Parameter: `array` - an array to augment as a buffer (`buf`); works well also with compound arrays (`carr`) and compound buffers (`cbuf`); if `array` is a compound
	//		structure(`cost`) the result is unpredictable.
	//	Parameter: `count: integer` - a non-negative integer; defaults to `array.length`.
	//	Returns: A reference to the `array` argument.
	//	Remarks:
	//		Uses one property assignment.
	//		When used on compound buffers (`cbuf`) effectively modifies the value of their `count` property.
	//		If `array` is a a compound array (`carr`) this method effectively changes it to a compound buffer (`cbuf`).
	//		if `array` is a compound structure(`cost`) the result is unpredictable.
	//	Exception: `ArgumentException`.
	augment(array, count = void 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(array)) throw new ArgumentException(0x6BE8D7, "array", array);
			if (!Type.isNU(count) && (!Type.isInteger(count) || count < 0)) throw new ArgumentException(0x96ACFA, "count", count);
		}
		array.count = Type.isInteger(count) ? count : array.length;
		return array;
	},

	//	Static Field: The lower bound for iterating buffers (`buf`). Equals to `0`.
	LowerBound: BufLowerBound,
}

//	Class: A buffer pool optimized for performance (10-25x faster) with frequent creation and destruction of buffers (`buf`) and compound buffers (`cbuf`).
//	Performance: Tested and optimized.
//	Usage: The following usage patterns of `BufPool` are recommended in order to ensure that there no leaks and to guarantee full control by API user over buffer pooling:
//		- For internal use, in the cases when APIs can guarantee the release of held `buf`s, APIs shall use `BufPool.the` as a default buffer pool but always let the API user override
//			the default instace:
//			```
//			function apiFunction(par1, par2, bufPool = null)
//			{
//				if(!bufPool) bufPool = BufPool.the;
//				let b = null;
//				try
//				{
//					b = bufPool.hold();
//					//...
//				}
//				finally
//				{
//					b && bufPool.release(b);
//				}
//			}
//			```
//		- For internal use, in the cases when APIs can't guarantee the release of held `buf`s, APIs shall use `FinalizationRegistry` to ensure any held `buf`s will be released
//			upon garbage collection:
//			```
//			const default_bufPool = BufPool.the;
//			const default_finalize = new FinalizationRegistry(v => default_bufPool.release(v));
//			class C
//			{
//				constructor(bufPool = null)
//				{
//					this._bufPool = bufPool || default_bufPool;
//					if (!bufPool) this._finalize = default_finalize;
//					else this._finalize = new FinalizationRegistry(v => this._bufPool.release(v));
//				}
//				apiFunction()
//				{
//					const b = this._bufPool();
//					this._finalize.register(this, b);
//				}
//			}
//			```
//		- For hybrid use (internal `hold`, external `release`), `BufPoolTransaction` shall be used explicitly instead of `BufPool`:
//			```
//			function apiFunction(par1, par2, bufPoolTransaction)
//			{
//				//...
//				const b1 = bufPoolTransaction.hold();
//				const b2 = bufPoolTransaction.hold(CompoundType);
//				par1.b3 = bufPoolTransaction.hold();
//				//...
//				return [b1, b2];
//			}
//			const t = new BufPoolTransaction(BufPool.the);
//			try
//			{
//				const outcome = apiFunction({}, 5, t);
//				//... use outcome
//			}
//			finally
//			{
//				t.releaseAll();
//			}
//			```
class BufPool extends Array
{
	//	Field: A reusable instance of `Compound.BufPool` created with default parameters, see `constructor`.
	static the = new BufPool();

	//	Parameter: `compoundType: symbol` - defaults to `null` - no compound type; a user-defined symbol for type identification of the managed buffers.
	//	Parameter: `bufferLength: integer` - defaults to `tunable(0xB275B7)`; must be greater than or equal to `0`; provides the create-time length of the buffers returned by `Compound.BufPool.hold()`.
	//	Parameter: `internalBufferCount: integer` - defaults to `tunable(0x3EEDC9)`; must be larger than or equal to `1`; provides the initial count of precreated buffers.
	//	Parameter: `autoGrowthFactor: number` - default: `tunable(0xA37DF4)`; must be greater than `1`; provides a factor for automatically expanding the pool by the
	//		formula `Math.floor(autoGrowthFactor * (this.length + 1))`.
	//	Parameter: `autoRecycleFragmentation: number` - defaults to `tunable(0xAB9C26)`; must be larger than or equal to `0` and less than or equal to `0.5`; provides a threshold factor for automatic defragmentation
	//		(recycling) as a last measure before expanding the pool, by the formula `fragmentCount > Math.floor(autoRecycleFragmentation * this.length) + 1`.
	//	Remarks:
	//		If `compoundType` is provided as a symbol, all managed buffers will be compound buffers (`cbuf`) of compound type `compoundType`; if ommitted or set to `null` all 
	//			managed buffers will be non-compound buffers(`buf`).
	//		The minimum number of fragments is `1`, which indicates either no locked pool elements or one solid block of locked pool elements starting at index `0`.
	//	Exception: `ArgumentException`.
	//	Tunable: `0xB275B7`.
	//	Tunable: `0x3EEDC9`.
	//	Tunable: `0xA37DF4`.
	//	Tunable: `0xAB9C26`.
	constructor(compoundType = null, bufferLength = T_0xB275B7, internalBufferCount = T_0x3EEDC9, autoGrowthFactor = T_0xA37DF4, autoRecycleFragmentation = T_0xAB9C26)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(compoundType) && !Type.isSymbol(compoundType)) throw new ArgumentException(0x540BC2, "compoundType", compoundType);
			if (!Type.isInteger(bufferLength) || bufferLength < 0) throw new ArgumentException(0xB13B3C, "bufferLength", bufferLength);
			if (!Type.isInteger(internalBufferCount) || internalBufferCount < 1) throw new ArgumentException(0xB6288E, "internalBufferCount", internalBufferCount);
			if (!Type.isNumber(autoGrowthFactor) || autoGrowthFactor <= 1) throw new ArgumentException(0xF9D0A3, "autoGrowthFactor", autoGrowthFactor);
			if (!Type.isNumber(autoRecycleFragmentation) || autoRecycleFragmentation < 0 || autoRecycleFragmentation > 0.5) throw new ArgumentException(0xB1B772, "autoRecycleFragmentation", autoRecycleFragmentation);
		}

		super(internalBufferCount);
		for (let length = this.length, i = 0; i < length; ++i)
		{
			const buffer = new Array(bufferLength);
			buffer.count = 0;
			buffer.index = -1;
			buffer.locked = false;
			this[i] = buffer;
		}
		this._compoundType = compoundType;
		this._count = 0;
		this._fragmentCount = 1;

		this._bufferLength = bufferLength;
		this._autoGrowthFactor = autoGrowthFactor;
		this._autoRecycleFragmentation = autoRecycleFragmentation;
	}

	//	Function: `hold(compoundType: symbol): buf | cbuf` - Locks a non-locked buffer (`buf`) or, if `compoundType` is set or `this._compoundType` is a symbol, compound buffer
	//		(`cbuf`) and acquires its reference.
	//	Parameter: `compoundType: symbol` - optional; if set, forces the returned value to be a compound buffer (`cbuf`) of the specified `compoundType`, ignoring the `this._compoundType`
	//		value.
	//	Returns: A buffer (`buf`) or, if `compoundType` is set or `this._compoundType` is a symbol, compound buffer (`cbuf`), see the `Compound.BufPool` class remarks.
	//	Remarks: Instances acquired via this method must be released via `Compound.BufPool.release` immediately after use. To prevent memory leaks:
	//		- Use `try`-`catch`-`finally` or the corresponding `Promise` constructs to guaranee that `Compound.BufPool.release` will be called even when an exception is thrown.
	//		- Add debug-only (`PB_DEBUG === true`) code to frequently inspect the result of `Compound.BufPool.analyse` and to throw an exception if the metrics of the pool reach
	//			a specific threshold (a missing `Compound.BufPool.release` call will most likely cause unbounded growth of the number of locked buffers).
	//		- Use `Compound.buf` or `Compound.cbuf` instead where releasing cannot be guaranteed; the preallocated buffered arrays still perform much better on push than `[]`, and
	//			`new Array(8)` cannot directly replace `[]` because its length will be set to `8` and not to `0`.
	//		- Use `FinalizationRegistry` where releasing cannot be guaranteed.
	//	Exception: `ArgumentException`.
	//	Exception: `InvalidOperationException`.
	//	Tunable: `0xDBAF1B` - `PB_DEBUG`-only; when the threshold has been exceeded, a warning will be logged via `Context.logger.warn`.
	hold(compoundType)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(compoundType) && !Type.isSymbol(compoundType)) throw new ArgumentException(0xA6EB8F, "compoundType", compoundType);
		}
		if (this.needsRecycing) this.recycle();
		if (PB_DEBUG)
		{
			if (BufPool.the.analyse().totalElementCount > T_0xDBAF1B) logger.warn(Diagnostics.printNcode(0xD30142), `Threshold exceeded: ${BufPool.the.analyse().totalElementCount} > ${T_0xDBAF1B}.`);
		}
		if (this._count === this.length)
		{
			this.length = Math.floor(this._autoGrowthFactor * (this.length + 1));
			for (let length = this.length, i = this._count; i < length; ++i)
			{
				const buffer = new Array(this._bufferLength);
				buffer.count = 0;
				buffer.index = -1;
				buffer.locked = false;
				this[i] = buffer;
			}
		}
		const result = this[this._count];
		if (PB_DEBUG)
		{
			if (result.locked) throw new InvalidOperationException(0x286D79);
		}
		result.count = 0;
		result.PB_compoundType = compoundType ? compoundType : this._compoundType ? this._compoundType : void 0;
		result.index = this._count;
		result.locked = true;
		++this._count;
		return result;
	}

	//	Function: Releases the lock on a buffer acquired via `Compound.BufPool.hold`.
	//	Parameter: `buffer: buffer` - a buffer (`buf`) or compound buffer (`cbuf`) if `this._compoundType` is a symbol to be released back to the pool.
	//	Returns: `void 0`.
	//	Remarks: Never use a buffer after its release. To prevent accidents, on release use the assignment `buffer = bufferPoolInstance.release(buffer);`, 
	//		which will effectively set `buffer` to undefined.
	//	Exception: `ArgumentException`.
	release(buffer)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(buffer)) throw new ArgumentException(0xC04AAE, "buffer", buffer);
			if (!Type.isInteger(buffer.index) || buffer.index < 0) throw new ArgumentException(0x8BC666, "buffer", buffer);
			if (this.indexOf(buffer) !== buffer.index) throw new ArgumentException(0x7F4149, "buffer", buffer);
			if (buffer.locked !== true) throw new ArgumentException(0x5CA8DE, "buffer", buffer);
		}
		buffer.locked = false;
		if (buffer.index === this._count - 1) --this._count;
		else ++this._fragmentCount;
	}

	//	Function: Compresses all locked buffers to the beginning of the pool, decreasing the fragment count to `1` and releasing for use all unlocked buffers that were previously kept
	//		between fragments.
	recycle()
	{
		this.sort((l, r) => l.locked === true ? (r.locked === true ? 0 : -1) : (r.locked === true ? 1 : 0));
		for (let length = this._count, i = 0; i < length; ++i)
		{
			const buffer = this[i];
			if (buffer.locked === false)
			{
				this._count = i;
				break;
			}
			buffer.index = i;
		}
		this._fragmentCount = 1;
	}

	//	Function: Returns array with usage metrics for the pool.
	//	Returns: `{ heldCount: integer, heldElementCount: integer, totalElementCount: integer }` - an object that is static on application level, where:
	//		- Field: `heldCount: integer` - indicates the number of currently locked buffers.
	//		- Field: `heldElementCount: integer` - indicates the total number of array elements contained by the currently locked buffers and the pool itself (includes `this.length`).
	//		- Field: `totalElementCount: integer` - indicates the total number of array elements contained by the all buffers and the pool itself (includes `this.length`).
	//	Remarks: This method reuses the returned object even between multiple `Compound.BufPool` instances (always returns the same instance). Never store the returned object and never use it
	//		after any kind of async calls.
	analyse()
	{
		analyseResult.heldCount = 0;
		analyseResult.heldElementCount = this.length;
		analyseResult.totalElementCount = this.length;
		for (let length = this.length, i = 0; i < length; ++i)
		{
			const buffer = this[i];
			analyseResult.totalElementCount += buffer.length;
			if (buffer.locked === true)
			{
				++analyseResult.heldCount;
				analyseResult.heldElementCount += buffer.length;
			}
		}
		return analyseResult;
	}

	//	Gets a value indicating whether the next `Compound.BufPool.hold` call will trigger a recycle operation.
	//	Returns: `true`, if the next `Compound.BufPool.hold` call will trigger a recycle operation, otherwise `false`.
	get needsRecycing()
	{
		return this._count === this.length && this._fragmentCount > Math.floor(this._autoRecycleFragmentation * this.length) + 1;
	}

	//	Gets the compound type this instance was created with.
	get compoundType()
	{
		return this._compoundType;
	}
}

const default_BufPoolTransaction_heldRegistryBufPool = BufPool.the;
const default_BufPoolTransaction_heldRegistryBufPool_finalize = new FinalizationRegistry(v => default_BufPoolTransaction_heldRegistryBufPool.release(v));
//	Class: Represents a subset of `buf`s/`cbuf`s from a specified `BufPool` being held as part of a single transaction. Allows for bulk release of all `buf`s/`cbuf`s registered with the transaction.
//	Usage:
//		```
//		const t = new BufPoolTransaction(BufPool.the);
//		try
//		{
//			const b1 = t.hold();
//			const b2 = t.hold(CompoundType);
//		}
//		finally
//		{
//			t.releaseAll();
//		}
//		```
class BufPoolTransaction
{
	//	Parameter: `bufPool: BufPool` - required; the underlying `BufPool` instance used for taking hold of `buf`s.
	//	Parameter: `heldRegistryBuf: buf` - optional, defaults to `BufPool.the.hold()`; a `buf` to hold `buf`s within this transaction.
	//	Parameter: `heldRegistryBufPool: BufPool` - optional, defaults to `BufPool.the`; used to get hold on a `buf` instance for `this._heldRegistry`.
	//	Remarks:
	//		At least one of `heldRegistryBuf` and `heldRegistryBufPool` must be `null | void 0`.
	//		Operates both with `buf`s and `cbuf`s.
	constructor(bufPool, heldRegistryBuf = null, heldRegistryBufPool = null)
	{
		if (PB_DEBUG)
		{
			if (!(bufPool instanceof BufPool)) throw new ArgumentException(0x9A419A, "bufPool", bufPool);
			if (!Type.isNU(heldRegistryBuf) && !Compound.isBuf(heldRegistryBuf)) throw new ArgumentException(0xA8F8B4, "heldRegistryBuf", heldRegistryBuf);
			if (!Type.isNU(heldRegistryBufPool) && !(heldRegistryBufPool instanceof BufPool)) throw new ArgumentException(0x7CC0E9, "heldRegistryBufPool", heldRegistryBufPool);
			if (!Type.isNU(heldRegistryBuf) && !Type.isNU(heldRegistryBufPool)) throw new ArgumentException(0xFAB831, "heldRegistryBuf, heldRegistryBufPool", { heldRegistryBuf, heldRegistryBufPool });
		}
		this._bufPool = bufPool;
		if (heldRegistryBuf) this._heldRegistry = heldRegistryBuf;
		if (!heldRegistryBufPool)
		{
			this._heldRegistry = default_BufPoolTransaction_heldRegistryBufPool.hold();
			default_BufPoolTransaction_heldRegistryBufPool_finalize.register(this, this._heldRegistry);
		}
		else
		{
			this._heldRegistryBufPool = heldRegistryBufPool;
			this._heldRegistry = this._heldRegistryBufPool.hold();
			new FinalizationRegistry(v => this._heldRegistryBufPool.release(v)).register(this, this._heldRegistry);
		}
	}

	//	Function: `hold(compoundType: symbol): buf | cbuf` - Locks with the underlying `BufPool` a non-locked buffer (`buf`) or, if `compoundType` is set or `this._compoundType` is a symbol,
	//		 compound buffer (`cbuf`) and acquires its reference.
	//	Parameter: `compoundType: symbol` - optional; if set, forces the returned value to be a compound buffer (`cbuf`) of the specified `compoundType`, ignoring the `compoundType`
	//		property of the underlying `BufPool`.
	//	Returns: A buffer (`buf`) or, if `compoundType` is set or the underlying `BufPool`'s `compoundType` property is a symbol, compound buffer (`cbuf`), see the `Compound.BufPool`
	//		class remarks.
	//	Remarks: Instances acquired via this method must be released via `Compound.BufPoolTransaction.releaseAll`. To prevent memory leaks:
	//		- Use `try`-`catch`-`finally` or the corresponding `Promise` constructs to guaranee that `Compound.BufPoolTransaction.releaseAll` will be called even when an exception is thrown.
	//		- Add debug-only (`PB_DEBUG === true`) code to frequently inspect the result of `Compound.BufPool.analyse` and to throw an exception if the metrics of the pool reach
	//			a specific threshold (a missing `Compound.BufPool.release` call will most likely cause unbounded growth of the number of locked buffers).
	//		- Use `Compound.buf` or `Compound.cbuf` instead where releasing cannot be guaranteed; the preallocated buffered arrays still perform much better on push than `[]`, and
	//			`new Array(8)` cannot directly replace `[]` because its length will be set to `8` and not to `0`.
	//		- Use `FinalizationRegistry` where releasing cannot be guaranteed.
	//	Exception: `ArgumentException`.
	hold(compoundType)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(compoundType) && !Type.isSymbol(compoundType)) throw new ArgumentException(0x74EE5F, "compoundType", compoundType);
		}
		const result = this._bufPool.hold(compoundType);
		this._heldRegistry[this._heldRegistry.count] = result;
		++this._heldRegistry.count;
		return result;
	}

	//	Function: Releases the lock on all `buf`s acquired via this instance's `hold` method.
	//	Remarks: After `releaseAll()` this instance becomes a still usable empty instance.
	releaseAll()
	{
		for (let length = this._heldRegistry.count, i = 0; i < length; ++i) this._bufPool.release(this._heldRegistry[i]);
		this._heldRegistry.count = 0;
	}
}

module.exports.Compound = module.exports;
module.exports.CompoundStructure = CompoundStructure;
module.exports.CompoundStructureMarker = CompoundStructureMarker;
module.exports.CompoundArray = CompoundArray;
module.exports.CompoundBuf = CompoundBuf;
module.exports.Buf = Buf;
module.exports.BufPool = BufPool;
module.exports.BufPoolTransaction = BufPoolTransaction;