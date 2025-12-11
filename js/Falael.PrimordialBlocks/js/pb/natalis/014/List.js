//	R0Q2/daniel/20240523
//	- TODO: implement support for `cost`, `carr`, `buf`, `cbuf` values for the `lists` params in the `List.*Set` method family
//	- TODO: - finish the `*Set`-family list methods
//		-implement support for complementary sets and universal set with: `unionSet`, `intersectionSet`, `subtractionSet`, `equalSet`, `isEmptySet`(`makeSet` won't be modified)
//		- `List.makeEmptySet(target)` - initialize`target` as an empty set(set the count / length property to 0)
//		- `List.makeUniversalSet(target)` - initialize`target` as a universal set(set the count / length property to 0 and`target.PB_Complementary = true`)
//		- `List.isUniversalSet(list)` - true if zero elements and`list.PB_Complementary = true`
//		- `List.complementarySet(list, targetOrSubject = null)` - complementation is achieved by setting the `list.PB_Complementary = true` property of `list` if absent or removing the property if present
//	- OPT: consider implementation of the `insert*` family functions using `splice`; validate efficiency of `splice` compared to current implementation; also consider replacing other loops
//		with native functions, if available; also validate performance benefits.

"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException, ReturnValueException, NotImplementedException } = require("-/pb/natalis/003/Exception.js");
const { Compound, CompoundStructure, buf } = require("-/pb/natalis/013/Compound.js");

//	Class: Provides list operations over `buf`, `cbuf`, `carr`, `cast` and `Array`.
const List =

module.exports =
{
	//	Function: `selectIf(list: buf | cbuf | carr | cast | Array, test(value, index): boolean, targetOrSubject: buf | cbuf | carr | cast | Array, offsetInTarget: integer): buf | cbuf | carr | cast | Array` -
	//		produces a filtered list containing only elements for which the `test` callback has returned `true`.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the source list to be filtered.
	//	Parameter: `test(value, index: integer): boolean` - required; a callback that is invoked by `selectIf` in sequence for every `list` element; on invocation, the `value` parameter contains
	//		the value of the `list` element, and `index` contains the element index in the `list`; the `test` callback must return either `true` or `false`; a return value of `true` instructs
	//		`selectIf` to include the element in the resulting list; a return value of `false` instructs `selectIf` to exclude the element from the resulting list.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the filtered source `list` is stored in this container.
	//	Parameter: `offsetInTarget: integer` - optional, defaults to `0`; the first index in `targetOrSubject` or `list` to start writing the result at.
	//	Returns:
	//		- `list` populated with filtered data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with filtered data, otherwise.
	selectIf(list, test, targetOrSubject = null, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x6A1C14, "list", list);
			if (!CallableType.isFunction(test)) throw new ArgumentException(0x81B2E3, "test", test);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xE9C25C, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x2016AF, "offsetInTarget", offsetInTarget);
		}

		const subjectLowerBound = Compound.lowerBound(list);
		const subjectCount = Compound.count(list);

		if (Type.isNU(targetOrSubject) || targetOrSubject === list)
		{
			//	unit tests "List.selectIf 01.*"
			const buffer = buf(subjectCount);
			let j = 0;
			for (let i = 0; i < subjectCount; ++i)
			{
				const item = list[i + subjectLowerBound];
				const outcome = test(item, i);
				if (PB_DEBUG)
				{
					if (!Type.isBoolean(outcome)) throw new ReturnValueException(0x23B98D, "test", outcome);
				}
				if (!outcome) continue;
				buffer[j] = item;
				++j;
			}
			buffer.count = j;
			return Compound.copyElements(buffer, list, offsetInTarget);
		}

		//	unit tests "List.selectIf 02.*"
		const targetLowerBound = Compound.lowerBound(targetOrSubject);
		let j = targetLowerBound + offsetInTarget;
		for (let i = 0; i < subjectCount; ++i)
		{
			const item = list[i + subjectLowerBound];
			const outcome = test(item, i);
			if (PB_DEBUG)
			{
				if (!Type.isBoolean(outcome)) throw new ReturnValueException(0x58FF59, "test", outcome);
			}
			if (!outcome) continue;
			targetOrSubject[j] = item;
			++j;
		}
		if (Number.isInteger(targetOrSubject.count)) targetOrSubject.count = j;
		else targetOrSubject.length = j;
		return targetOrSubject;
	},

	//	Function: `transform(list: buf | cbuf | carr | cast | Array, transformList(src, srcCount, srcLowerBound, srcUpperBound, dest, destCount, destLowerBound, destUpperBound): void, targetOrSubject: buf | cbuf | carr | cast | Array, offsetInTarget: integer): buf | cbuf | carr | cast | Array` -
	//		produces a list transformed using the `transformList` function.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the source list to be transformed.
	//	Parameter: `transformList(
	//		src: buf | cbuf | carr | cast | Array,
	//		srcCount: integer,
	//		srcLowerBound: integer,
	//		srcUpperBound: integer,
	//		dest: buf | cbuf | carr | cast | Array,
	//		destCount: integer,
	//		destLowerBound: integer, 
	//		destUpperBound: integer
	//	): void` - required; a list transformer callback.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the transformed source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with transformed data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with transformed data, otherwise.
	//	Performance: `transformList` is invoked only once for the whole `list`; iteration of the `list` is responsibility of the callback.
	transform(list, transformList, targetOrSubject = null, offsetInTarget = 0)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x84554E, "list", list);
			if (!CallableType.isFunction(transformList)) throw new ArgumentException(0xD5734E, "transformList", transformList);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0x17E2D4, "targetOrSubject", targetOrSubject);
			if (!Type.isInteger(offsetInTarget) || offsetInTarget < 0) throw new ArgumentException(0x1D3643, "offsetInTarget", offsetInTarget);
		}

		//	unit tests "List.transform 01.*"
		if (Type.isNU(targetOrSubject) || targetOrSubject === list)
		{
			const lowerBound = Compound.lowerBound(list);
			const upperBound = Compound.upperBound(list);
			const count = Compound.count(list);
			transformList(list, count, lowerBound, upperBound, list, count, lowerBound + offsetInTarget, upperBound + offsetInTarget);
			return list;
		}

		//	unit tests "List.transform 02.*"
		transformList(
			list, Compound.count(list), Compound.lowerBound(list), Compound.upperBound(list), 
			targetOrSubject, Compound.count(targetOrSubject), Compound.lowerBound(targetOrSubject) + offsetInTarget, Compound.upperBound(targetOrSubject) + offsetInTarget
		);
		return targetOrSubject;
	},

	//	Function: `sort(list: buf | cbuf | carr | cast | Array, compare(left, right): boolean, targetOrSubject: buf | cbuf | carr | cast | Array, offsetInTarget: integer): buf | cbuf | carr | cast | Array` -
	//		produces a list sorted using the `compare` function.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the source list to be sorted.
	//	Parameter: `compare(left, right): boolean` - required; a comparer callback for sorting.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the sorted source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with sorted data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with sorted data, otherwise.
	//	Performance: With `cost`, this implementation copies the array two times, which might be inefficient; further examination of the possibilities is required.
	sort(list, compare, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x4106E8, "list", list);
			if (!CallableType.isFunction(compare)) throw new ArgumentException(0x726571, "compare", compare);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xADAB53, "targetOrSubject", targetOrSubject);
		}

		const list_isCompoundStructure = Compound.isCompoundStructure(list);

		//	unit tests "List.sort 01.01.*"
		if (Type.isNU(targetOrSubject) || targetOrSubject === list)
		{
			if (list_isCompoundStructure) return CompoundStructure.sort(list, compare);
			list.sort(compare);
			return list;
		}

		//	unit tests "List.sort 02.01.*"
		if (Compound.isCompoundStructure(targetOrSubject))
		{
			const targetCount = Compound.count(targetOrSubject);
			const buffer = buf(targetCount);
			Compound.copyElements(list, buffer);
			buffer.sort(compare);
			return Compound.copyElements(buffer, targetOrSubject);
		}

		Compound.copyElements(list, targetOrSubject);
		targetOrSubject.sort(compare);
		return targetOrSubject;
	},

	//	Function: `append(list: buf | cbuf | carr | cast | Array, value: any, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		appends `value` to `list` and returns the resulting array or compound.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the `list` to append `value` to.
	//	Parameter: `value: any` - required; the `value` to append.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the modified source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks: Modifies the source `list` if `targetOrSubject` is not set or is set to the `list` instance, otherwise copies `list` into `targetOrSubject`.
	append(list, value, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x57F87A, "list", list);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xA5EEAF, "targetOrSubject", targetOrSubject);
		}

		//	unit tests "List.append 01.*"
		if (Type.isNU(targetOrSubject) || targetOrSubject === list)
		{
			if (Number.isInteger(list.count))
			{
				list[list.count] = value;
				++list.count;
				return list;
			}
			list.push(value);
			return list;
		}

		//	unit tests "List.append 02.*"
		const result = Compound.copyElements(list, targetOrSubject);
		if (Number.isInteger(result.count))
		{
			result[result.count] = value;
			++result.count;
			return result;
		}
		result.push(value);
		return result;
	},

	//	Function: `appendRange(list: buf | cbuf | carr | cast | Array, list2: buf | cbuf | carr | cast | Array, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		appends all elements of `list2` to `list` and returns the resulting array or compound.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the `list` to append to.
	//	Parameter: `list2: buf | cbuf | carr | cast | Array` - required; the list to append.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the modified source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks: Modifies the source `list` if `targetOrSubject` is not set or is set to the `list` instance, otherwise copies `list` into `targetOrSubject`.
	appendRange(list, list2, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0xFB8FFB, "list", list);
			if (!Type.isArray(list2)) throw new ArgumentException(0xBF93F2, "list2", list2);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0x554A66, "targetOrSubject", targetOrSubject);
		}

		//	unit tests "List.appendRange 01.*"
		if (Type.isNU(targetOrSubject) || targetOrSubject === list) return Compound.copyElements(list2, list, Compound.count(list));

		//	unit tests "List.appendRange 02.*"
		Compound.copyElements(list, targetOrSubject);
		return Compound.copyElements(list2, targetOrSubject, Compound.count(targetOrSubject));
	},

	//	Function: `insert(list: buf | cbuf | carr | cast | Array, index: integer, value: any, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		inserts an element to `list` before `index` and returns the resulting array or compound.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the `list` to insert into to.
	//	Parameter: `value: any` - required; the `value` to insert.
	//	Parameter: `index: integer` - required, must be in the range `(-listLength, listLength]`; the index in `list` to insert `value` at; negative values are interpreted as `listLength + index` 
	//		(indexing backwards from the end of the list).
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the modified source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks: Modifies the source `list` if `targetOrSubject` is not set or is set to the `list` instance, otherwise copies `list` into `targetOrSubject`.
	insert(list, index, value, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x552485, "list", list);
			if (!Type.isInteger(index) || index < -Compound.count(list) || index > Compound.count(list)) throw new ArgumentException(0x9554E8, "index", index);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xFAE297, "targetOrSubject", targetOrSubject);
		}

		const list_count = Compound.count(list);
		const absoluteIndex = index >= 0 ? index : list_count + index;

		//	unit tests "List.insert 01.*"
		if (Type.isNU(targetOrSubject) || targetOrSubject === list)
		{
			if (Number.isInteger(list.count))
			{
				const list_lowerBound = Compound.lowerBound(list);
				++list.count;
				list.length = Math.max(list_lowerBound + list.count, list.length);
			}
			else ++list.length;
			Compound.placeRange(list, absoluteIndex, list_count - absoluteIndex, list, absoluteIndex + 1);
			list[absoluteIndex] = value;
			return list;
		}

		//	unit tests "List.insert 02.*"
		if (Number.isInteger(targetOrSubject.count))
		{
			const target_lowerBound = Compound.lowerBound(targetOrSubject);
			targetOrSubject.count = list.count + 1;
			targetOrSubject.length = Math.max(target_lowerBound + targetOrSubject.count, targetOrSubject.length);
		}
		else targetOrSubject.length = list.length + 1;
		Compound.placeRange(list, 0, absoluteIndex, targetOrSubject);
		Compound.placeRange(list, absoluteIndex, list_count - absoluteIndex, targetOrSubject, absoluteIndex + 1);
		targetOrSubject[absoluteIndex] = value;
		return targetOrSubject;
	},

	//	Function: `insertRange(list: buf | cbuf | carr | cast | Array, index: integer, list2: buf | cbuf | carr | cast | Array, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		inserts all elements of `list2` to `list` at `index` and returns the resulting array or compound.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the `list` to append to.
	//	Parameter: `index: integer` - required, must be in the range `(-listLength, listLength]`; the index in `list` to insert `list2` at; negative values are interpreted as `listLength + index` 
	//		(indexing backwards from the end of the list).
	//	Parameter: `list2: buf | cbuf | carr | cast | Array` - required; the list to append.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the modified source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks: Modifies the source `list` if `targetOrSubject` is not set or is set to the `list` instance, otherwise copies `list` into `targetOrSubject`.
	insertRange(list, index, list2, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0xB358F9, "list", list);
			if (!Type.isInteger(index) || index < -Compound.count(list) || index > Compound.count(list)) throw new ArgumentException(0xFA2EB4, "index", index);
			if (!Type.isArray(list2)) throw new ArgumentException(0x1B1186, "list2", list2);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xEC02F4, "targetOrSubject", targetOrSubject);
		}

		const list_count = Compound.count(list);
		const absoluteIndex = index >= 0 ? index : list_count + index;
		const list2_count = Compound.count(list2);

		//	unit tests "List.insertRange 01.*"
		if (Type.isNU(targetOrSubject) || targetOrSubject === list)
		{
			if (Number.isInteger(list.count))
			{
				const list_lowerBound = Compound.lowerBound(list);
				list.count += list2_count;
				list.length = Math.max(list_lowerBound + list.count, list.length);
			}
			else list.length += list2_count;
			Compound.placeRange(list, absoluteIndex, list_count - absoluteIndex, list, absoluteIndex + list2_count);
			Compound.placeRange(list2, 0, list2_count, list, absoluteIndex);
			return list;
		}

		//	unit tests "List.insertRange 02.*"
		if (Number.isInteger(targetOrSubject.count))
		{
			const target_lowerBound = Compound.lowerBound(targetOrSubject);
			targetOrSubject.count = list.count + list2_count;
			targetOrSubject.length = Math.max(target_lowerBound + targetOrSubject.count, targetOrSubject.length);
		}
		else targetOrSubject.length = list.length + list2_count;
		Compound.placeRange(list, 0, absoluteIndex, targetOrSubject);
		Compound.placeRange(list, absoluteIndex, list_count - absoluteIndex, targetOrSubject, absoluteIndex + list2_count);
		Compound.placeRange(list2, 0, list2_count, targetOrSubject, absoluteIndex);
		return targetOrSubject;
	},

	//	Function: `makeSet(list: buf | cbuf | carr | cast | Array, elementEquals(a, b): boolean, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		produces a filtered list that contains only elements determined as being unique using the `elementEquals` function or the `===` operator if `elementEquals` is not set.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the source list to be filtered.
	//	Parameter: `elementEquals(a, b): boolean` - optional, defaults to the `===` operator; provides criteria for considering two elements as equal for the purposes of establishing elemen uniqueness.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `list`; the modified source `list` is stored in this container.
	//	Returns:
	//		- `list` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === list`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks:
	//		Only the first element of a series of equal elements is included in the result.
	//		The order of the elements included in the result matches the element order in the source `list`.
	//	Performance:
	//		Optimize by replacing `selectIf` - calls that invoke additional callbacks with the code of the `selectIf` implementation modified to use a `Set` or `elementEquals` directly; 
	//			implement further tests with `cast`, `carr`, `buf` and `cbuf`.
	//		The `List.*Set` method family has been implemented without much concideration for performance in favor of quicker implementation and fewer unit tests.
	makeSet(list, elementEquals = null, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0xA355F9, "list", list);
			if (!Type.isNU(elementEquals) && !CallableType.isFunction(elementEquals)) throw new ArgumentException(0xF2E1B4, "elementEquals", elementEquals);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xBB8DE8, "targetOrSubject", targetOrSubject);
		}

		//	unit tests "List.transform 01.*" - targetOrSubject === null
		//	unit tests "List.transform 03.*" - targetOrSubject !== null
		if (Type.isNU(elementEquals))
		{
			const uniqueElements = new Set();
			return List.selectIf(list, v =>
			{
				if (uniqueElements.has(v)) return false;
				uniqueElements.add(v);
				return true;
			}, targetOrSubject);
		}

		//	unit tests "List.transform 02.*" - targetOrSubject === null
		//	unit tests "List.transform 04.*" - targetOrSubject !== null
		const uniqueElements = buf(Compound.count(list));
		return List.selectIf(list, v =>
		{
			for (let length = uniqueElements.count, i = 0; i < length; ++i)
			{
				const outcome = elementEquals(uniqueElements[i], v);
				if (PB_DEBUG)
				{
					if (!Type.isBoolean(outcome)) throw new ReturnValueException(0xC0A2D6, "elementEquals", outcome);
				}
				if (outcome) return false;
				break;
			}
			uniqueElements[uniqueElements.count] = v;
			++uniqueElements.count;
			return true;
		}, targetOrSubject);
	},

	//	Function: `unionSet(lists: [buf | cbuf | carr | cast | Array], elementEquals(a, b): boolean, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		produces a list that contains all unique elements of all lists in the `lists` array; element uniqueness is determined using the `elementEquals` function or the `===` operator if `elementEquals` is not set.
	//	Parameter: `lists: [buf | cbuf | carr | cast | Array]` - required; an array of lists to be included in the uniton.
	//	Parameter: `elementEquals(a, b): boolean` - optional, defaults to the `===` operator; provides criteria for considering two elements as equal for the purposes of establishing elemen uniqueness.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `lists[0]`; all unique elements of all `lists` are stored in this container.
	//	Returns:
	//		- `lists[0]` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === lists[0]`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks:
	//		Only the first element of a series of equal elements is included in the result.
	//		The order of the elements included in the result matches the element order in each list in `lists`.
	//		If `lists` contains exactly zero elements, the function returns an empty array.
	//		If `lists` contains exactly one element, the function behavior is identical to `List.makeSet(list[0], elementEquals, targetOrSubject)`.
	//		If `lists` is an empty array, and `targetOrSubject` is not set, an exception is thrown.
	//	Performance:
	//		Optimize by replacing `selectIf` - calls that invoke additional callbacks with the code of the `selectIf` implementation modified to use a `Set` or `elementEquals` directly;
	//			implement further tests with `cast`, `carr`, `buf` and `cbuf`.
	//		The `List.*Set` method family has been implemented without much concideration for performance in favor of quicker implementation and fewer unit tests.
	unionSet(lists, elementEquals = null, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(lists) || lists.some(v => !Type.isArray(v))) throw new ArgumentException(0x546D35, "lists", lists);
			if (!Type.isNU(elementEquals) && !CallableType.isFunction(elementEquals)) throw new ArgumentException(0x546D35, "elementEquals", elementEquals);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0x546D35, "targetOrSubject", targetOrSubject);
			if (!lists.length && Type.isNU(targetOrSubject)) throw new ArgumentException(0x834BD3, "targetOrSubject", targetOrSubject);
		}

		if (!lists.length)
		{
			if (Number.isInteger(targetOrSubject.count)) targetOrSubject.count = 0;
			else targetOrSubject.length = 0;
			return targetOrSubject;
		}

		const target = targetOrSubject || lists[0];

		//	unit tests "List.unionSet 01.*" - targetOrSubject === null
		//	unit tests "List.unionSet 03.*" - targetOrSubject !== null
		if (Type.isNU(elementEquals))	//	this implementation guarantees element order, unlike a pure `Set`-based implementation
		{
			const uniqueElements = new Set();
			for (let jlength = lists.length, j = 0; j < jlength; ++j)
			{
				List.selectIf(lists[j], v =>
				{
					if (uniqueElements.has(v)) return false;
					uniqueElements.add(v);
					return true;
				}, target, uniqueElements.size);
			}
			return target;
		}

		//	unit tests "List.unionSet 02.*" - targetOrSubject === null
		//	unit tests "List.unionSet 04.*" - targetOrSubject !== null
		const uniqueElements = buf(lists.reduce((acc, arr) => acc + Compound.count(arr), 0));
		for (let jlength = lists.length, j = 0; j < jlength; ++j)
		{
			List.selectIf(lists[j], v =>
			{
				for (let length = uniqueElements.count, i = 0; i < length; ++i)
				{
					const outcome = elementEquals(uniqueElements[i], v);
					if (PB_DEBUG)
					{
						if (!Type.isBoolean(outcome)) throw new ReturnValueException(0xCE2F96, "elementEquals", outcome);
					}
					if (outcome) return false;
				}
				uniqueElements[uniqueElements.count] = v;
				++uniqueElements.count;
				return true;
			}, target, uniqueElements.count);
		}
		return target;
	},

	//	Function: `intersectionSet(lists: [buf | cbuf | carr | cast | Array], elementEquals(a, b): boolean, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		produces a list that contains only elements present in two or more `lists`; element uniqueness is determined using the `elementEquals` function or the `===` operator if `elementEquals` is not set.
	//	Parameter: `lists: [buf | cbuf | carr | cast | Array]` - required; an array of lists to be intersected.
	//	Parameter: `elementEquals(a, b): boolean` - optional, defaults to the `===` operator; provides criteria for considering two elements as equal for the purposes of establishing elemen uniqueness.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `lists[0]`; the `lists` intersection result elements are stored in this container.
	//	Returns:
	//		- `lists[0]` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === lists[0]`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks:
	//		An element that is present in multiple `lists` is included exactly once in the result.
	//		The order of the elements included in the result matches the element order in each list in `lists`.
	//		If `lists` contains zero or one elements, the function returns an empty array.
	//		If `lists` is an empty array, and `targetOrSubject` is not set, an exception is thrown.
	//	Performance:
	//		This implementation is suboptimal in many ways and can be optimized or replaced with a better one; add further tests to cover possible subimplementations in the new code.
	//		The `List.*Set` method family has been implemented without much concideration for performance in favor of quicker implementation and fewer unit tests.
	intersectionSet(lists, elementEquals = null, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(lists) || lists.some(v => !Type.isArray(v))) throw new ArgumentException(0xE7EF2F, "lists", lists);
			if (!Type.isNU(elementEquals) && !CallableType.isFunction(elementEquals)) throw new ArgumentException(0xE10028, "elementEquals", elementEquals);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0xD29F01, "targetOrSubject", targetOrSubject);
			if (!lists.length && Type.isNU(targetOrSubject)) throw new ArgumentException(0x832999, "targetOrSubject", targetOrSubject);
		}

		const target = targetOrSubject || lists[0];
		if (lists.length <= 1)
		{
			if (Number.isInteger(target.count)) target.count = 0;
			else target.length = 0;
			return target;
		}

		const equalsFn = elementEquals || ((a, b) => a === b);

		const elementCounts = buf(3 * lists.reduce((acc, arr) => acc + Compound.count(arr), 0));
		for (let jlength = lists.length, j = 0; j < jlength; ++j)
		{
			const list = lists[j];
			for (let maxi = Compound.upperBound(list), i = Compound.lowerBound(list); i <= maxi; ++i)
			{
				const element = list[i];
				let isMatch = false;
				for (let klength = elementCounts.count, k = 0; k < klength; k += 3)
				{
					const cachedList = elementCounts[k + 1];
					if (cachedList === list) continue;
					const cachedElement = elementCounts[k];
					const outcome = equalsFn(cachedElement, element);
					if (PB_DEBUG)
					{
						if (!Type.isBoolean(outcome)) throw new ReturnValueException(0x7892D1, "equalsFn", outcome);
					}
					if (outcome)
					{
						isMatch = true;
						++elementCounts[k + 2];
						break;
					}
				}
				if (!isMatch)
				{
					elementCounts[elementCounts.count] = element;
					elementCounts[elementCounts.count + 1] = list;
					elementCounts[elementCounts.count + 2] = 1;
					elementCounts.count += 3;
				}
			}
		}

		List.selectIf(elementCounts, (_, index) =>
		{
			if (index % 3) return false;
			if (elementCounts[index + 2] <= 1) return false;
			return true;
		}, target);

		return target;
	},

	//	Function: `subtractionSet(lists: [buf | cbuf | carr | cast | Array], elementEquals(a, b): boolean, targetOrSubject: buf | cbuf | carr | cast | Array): buf | cbuf | carr | cast | Array` -
	//		produces a list that contains only elements present in `lists[0]` that are not present in any other list from `lists`; element uniqueness is determined using the `elementEquals` function or the `===` operator if `elementEquals` is not set.
	//	Parameter: `lists: [buf | cbuf | carr | cast | Array]` - required; an array of lists to be subtracted (`lists[1+]` are subtracted from `list[0]`).
	//	Parameter: `elementEquals(a, b): boolean` - optional, defaults to the `===` operator; provides criteria for considering two elements as equal for the purposes of establishing elemen uniqueness.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `lists[0]`; the `lists` subtraction result elements are stored in this container.
	//	Returns:
	//		- `lists[0]` populated with modified data if no argument is provided for `targetOrSubject` or `targetOrSubject === lists[0]`;
	//		- `targetOrSubject` populated with modified data, otherwise.
	//	Remarks:
	//		An element that is present multiple times in `lists[0]` and in no other list from `lists` is included exactly once in the result.
	//		The order of the elements included in the result matches the element order in `lists[0]`.
	//		If `lists` contains zero elements, the function returns an empty set (empty array).
	//		If `lists` is an empty array, and `targetOrSubject` is not set, an exception is thrown.
	//	Performance:
	//		This implementation is suboptimal in many ways and can be optimized or replaced with a better one; add further tests to cover possible subimplementations in the new code.
	//		The `List.*Set` method family has been implemented without much concideration for performance in favor of quicker implementation and fewer unit tests.
	subtractionSet(lists, elementEquals = null, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(lists) || lists.some(v => !Type.isArray(v))) throw new ArgumentException(0x8395D1, "lists", lists);
			if (!Type.isNU(elementEquals) && !CallableType.isFunction(elementEquals)) throw new ArgumentException(0xCB73EB, "elementEquals", elementEquals);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0x73A0B3, "targetOrSubject", targetOrSubject);
			if (!lists.length && Type.isNU(targetOrSubject)) throw new ArgumentException(0x4DF30A, "targetOrSubject", targetOrSubject);
		}

		const target = targetOrSubject || lists[0];
		if (!lists.length)
		{
			if (Number.isInteger(target.count)) target.count = 0;
			else target.length = 0;
			return target;
		}

		const equalsFn = elementEquals || ((a, b) => a === b);

		const excludedElements = [];
		for (let jlength = lists.length, j = 1; j < jlength; ++j)
		{
			const list = lists[j];
			for (let maxi = Compound.upperBound(list), i = Compound.lowerBound(list); i <= maxi; ++i)
			{
				const item = list[i];
				const outcome = !excludedElements.some(e =>
				{
					const outcome = equalsFn(e, item);
					if (PB_DEBUG)
					{
						if (!Type.isBoolean(outcome)) throw new ReturnValueException(0x64808B, "equalsFn", outcome);
					}
					return outcome;
				});
				if (outcome) excludedElements.push(item);
			}
		}

		return List.selectIf(lists[0], v =>
		{
			for (let i = 0, length = excludedElements.length; i < length; ++i)
			{
				const outcome = equalsFn(v, excludedElements[i]);
				if (PB_DEBUG)
				{
					if (!Type.isBoolean(outcome)) throw new ReturnValueException(0xC0A2D6, "equalsFn", outcome);
				}
				if (outcome) return false;
			}
			return true;
		}, target);
	},

	//	Function: `equalSet(lists: [buf | cbuf | carr | cast | Array], elementEquals(a, b): boolean): boolean` -
	//		tests if all `lists` contain the same elements regardless of order and duplicity; element uniqueness is determined using the `elementEquals` function or the `===` operator if `elementEquals` is not set.
	//	Parameter: `lists: [buf | cbuf | carr | cast | Array]` - required; an array of lists to be subtracted (`lists[1+]` are subtracted from `list[0]`).
	//	Parameter: `elementEquals(a, b): boolean` - optional, defaults to the `===` operator; provides criteria for considering two elements as equal for the purposes of establishing elemen uniqueness.
	//	Parameter: `targetOrSubject: buf | cbuf | carr | cast | Array` - optional, defaults to `lists[0]`; the `lists` subtraction result elements are stored in this container.
	//	Returns: `true` if all `lists` contain the same elements regardless of order and duplicity, otherwise `false`.
	//	Remarks: If `lists` contains zero elements, the function returns `true`.
	//	Performance:
	//		This implementation is suboptimal in many ways and can be optimized or replaced with a better one; add further tests to cover possible subimplementations in the new code.
	//		The `List.*Set` method family has been implemented without much concideration for performance in favor of quicker implementation and fewer unit tests.
	equalSet(lists, elementEquals = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(lists) || lists.some(v => !Type.isArray(v))) throw new ArgumentException(0x7C1BE7, "lists", lists);
			if (!Type.isNU(elementEquals) && !CallableType.isFunction(elementEquals)) throw new ArgumentException(0x218764, "elementEquals", elementEquals);
		}

		if (lists.length <= 1) return true;

		const equalsFn = elementEquals || ((a, b) => a === b);

		function __getUniqueElements(list)
		{
			const result = buf(Compound.count(list));
			for (let maxi = Compound.upperBound(list), i = Compound.lowerBound(list); i <= maxi; ++i)
			{
				const element = list[i];
				if (!result.some(e => equalsFn(e, element)))
				{
					result[result.count] = element;
					++result.count;
				}
			}
			return result;
		}

		const referenceSet = __getUniqueElements(lists[0]);
		for (let jlength = lists.length, j = 1; j < jlength; ++j)
		{
			const currentSet = __getUniqueElements(lists[j]);
			if (currentSet.count !== referenceSet.count) return false;
			for (let ilength = referenceSet.count, i = 0; i < ilength; ++i) if (!currentSet.some(e => equalsFn(e, referenceSet[i]))) return false;
		}

		return true;
	},

	//	Function: `isEmptySet(list: buf | cbuf | carr | cast | Array): boolean` - tests if `list` is an empty set.
	//	Parameter: `list: buf | cbuf | carr | cast | Array` - required; the source list to be filtered.
	//	Returns: `true` if `list` is an empty set, otherwise `false`.
	isEmptySet(list)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x78AA13, "list", list);
		}

		return Compound.count(list) === 0;
	},

	//	TODO
	isUniversalSet(list)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x210428, "list", list);
		}

		throw new NotImplementedException(0x0);
	},

	//	TODO
	complementarySet(list, targetOrSubject = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isArray(list)) throw new ArgumentException(0x568693, "list", list);
			if (!Type.isNU(targetOrSubject) && !Type.isArray(targetOrSubject)) throw new ArgumentException(0x6BCDFE, "targetOrSubject", targetOrSubject);
		}

		throw new NotImplementedException(0x0);
	},
};

module.exports.List = module.exports;
