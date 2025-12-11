//	R0Q2/daniel/20210504
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

const BoyerMoore_ALPHABET_LEN = 256;

module.exports = 

//	See also: https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm
//	See also: https://gist.github.com/jhermsmeier/2138865
class BoyerMoore
{
	//	Function: For the given pattern, creates and builds a table for the "bad character rule" for the boyer-moore search algorithm.
	//	Parameter: `pat: Uint8Array` - the search pattern.
	//	Returns: Returns a delta table for the "bad character rule" as `Uint8Array`.
	//	Remarks:
	//		Based on: `make_delta1`, C code sample, https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm
	//		Based on: `makeCharTable`, JS code sample, https://gist.github.com/jhermsmeier/2138865
	//
	//		BAD CHARACTER RULE.
	//
	//		delta1 table: delta1[c] contains the distance between the last
	//		character of pat and the rightmost occurrence of c in pat.
	//
	//		If c does not occur in pat, then delta1[c] = patlen.
	//		If c is at string[i] and c != pat[patlen-1], we can safely shift i
	//			over by delta1[c], which is the minimum distance needed to shift
	//			pat forward to get string[i] lined up with some character in pat.
	//		c == pat[patlen-1] returning zero is only a concern for BMH, which
	//			does not have delta2. BMH makes the value patlen in such a case.
	//			We follow this choice instead of the original 0 because it skips
	//			more. (correctness?)
	//
	//		This algorithm runs in alphabet_len+patlen time.
	//	Exception: `"Argument is invalid"`.
	static createDelta1Table(pat)
	{
		if(PB_DEBUG)
		{
			if(!(pat instanceof Uint8Array)) throw new Exception(0xE67449, `Argument is invalid: "pat".`);
		}

		var result = new Uint32Array(BoyerMoore_ALPHABET_LEN);
		var n = pat.length;
		var t = result.length;
		var i = 0;
		for(; i < t; ++i) result[i] = n;
		n--;
		for(i = 0; i < n; ++i) result[pat[i]] = n - i;
		return result;
	}

	//	Function: For the given pattern, creates and builds a table for the "good suffix rule" for the boyer-moore search algorithm.
	//	Parameter: `pat: Uint8Array` - the search pattern.
	//	Returns: Returns a delta table for the "good suffix rule" as `Uint8Array`.
	//	Remarks:
	//		Based on: `make_delta2`, C code sample, https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm
	//		Based on: `makeOffsetTable`, JS code sample, https://gist.github.com/jhermsmeier/2138865
	//
	//		GOOD SUFFIX RULE.
	//
	//		delta2 table: given a mismatch at pat[pos], we want to align
	//		with the next possible full match could be based on what we
	//		know about pat[pos+1] to pat[patlen-1].
	//		
	//		In case 1:
	//		pat[pos+1] to pat[patlen-1] does not occur elsewhere in pat,
	//		the next plausible match starts at or after the mismatch.
	//		If, within the substring pat[pos+1 .. patlen-1], lies a prefix
	//		of pat, the next plausible match is here (if there are multiple
	//		prefixes in the substring, pick the longest). Otherwise, the
	//		next plausible match starts past the character aligned with
	//		pat[patlen-1].
	//		
	//		In case 2:
	//		pat[pos+1] to pat[patlen-1] does occur elsewhere in pat. The
	//		mismatch tells us that we are not looking at the end of a match.
	//		We may, however, be looking at the middle of a match.
	//		
	//		The first loop, which takes care of case 1, is analogous to
	//		the KMP table, adapted for a 'backwards' scan order with the
	//		additional restriction that the substrings it considers as
	//		potential prefixes are all suffixes. In the worst case scenario
	//		pat consists of the same letter repeated, so every suffix is
	//		a prefix. This loop alone is not sufficient, however:
	//		Suppose that pat is "ABYXCDBYX", and text is ".....ABYXCDEYX".
	//		We will match X, Y, and find B != E. There is no prefix of pat
	//		in the suffix "YX", so the first loop tells us to skip forward
	//		by 9 characters.
	//		Although superficially similar to the KMP table, the KMP table
	//		relies on information about the beginning of the partial match
	//		that the BM algorithm does not have.
	//		
	//		The second loop addresses case 2. Since suffix_length may not be
	//		unique, we want to take the minimum value, which will tell us
	//		how far away the closest potential match is.
	//	Exception: `"Argument is invalid"`.
	static createDelta2Table(pat)
	{
		if(PB_DEBUG)
		{
			if(!(pat instanceof Uint8Array)) throw new Exception(0x6ACB7D, `Argument is invalid: "pat".`);
		}

		var i, suffix;
		var n = pat.length;
		var m = n - 1;
		var lastPrefix = n;
		var result = new Uint32Array(n);
    
		for(i = m; i >= 0; --i)
		{
			if(is_prefix(pat, i + 1)) lastPrefix = i + 1;
			result[ m - i ] = lastPrefix - i + m;
		}
		for(i = 0; i < n; ++i)
		{
			suffix = suffix_length(pat, i);
			result[suffix] = m - i + suffix;
		}
		return result;

		// true if the suffix of word starting from word[pos] is a prefix of word
		function is_prefix(word, i)
		{
			var k = 0;
			var n = word.length;
			for(; i < n; ++i, ++k) if(word[i] !== word[k]) return false;
			return true;
		}

		// length of the longest suffix of word ending on word[pos].
		function suffix_length(word, pos)
		{
			var i = pos;
			var k = 0;
			var n = word.length;
			var m = n - 1;
			for(; i >= 0 && word[i] === word[m]; --i, --m ) k += 1;
			return k;
		}
	}

	//	Function: Performs a boyer-moore search of a byte pattern within a byte array subject.
	//	Parameter: `subject: Uint8Array` - the byte array subject.
	//	Parameter: `pat: Uint8Array` - the byte pattern to search for.
	//	Parameter: `offset: integer` - a non-negative integer representing the offset from the `subject` beggining to start the search from.
	//	Parameter: `delta1Table: Uint8Array` - a prebuilt detla1 table created by `BoyerMoore.createDelta1Table(pat);`; if ommitted, the delta1 table will be created internally.
	//	Parameter: `delta2Table: Uint8Array` - a prebuilt detla2 table created by `BoyerMoore.createDelta2Table(pat);`; if ommitted, the delta2 table will be created internally.
	//	Returns: The index of the first occurrence of `pat` within `subject` or `-1` if `pat` is empty or not found.
	//	Remarks: 
	//		As an optimization, the `delta1Table` and `delta2Table` parameters can be set with prebuilt values in case of multiple searches with the same pattern.
	//		For multiple searches, subsequent array views created by `Uint8Array.subarray` can be used.
	//	Exception: `"Argument is invalid"`.
	static search(subject, pat, offset = 0, delta1Table = null, delta2Table = null)
	{
		if(PB_DEBUG)
		{
			if(!(subject instanceof Uint8Array)) throw new Exception(0x4E4804, `Argument is invalid: "subject".`);
			if(!(pat instanceof Uint8Array)) throw new Exception(0xBD68E5, `Argument is invalid: "pat".`);
			if(!Type.isInteger(offset) || offset < 0) throw new Exception(0x5651AA, `Argument is invalid: "offset".`);
			if(delta1Table !== null && (!(delta1Table instanceof Uint8Array) || delta1Table.byteLength !== BoyerMoore_ALPHABET_LEN)) throw new Exception(0xAA7289, `Argument is invalid: "delta1Table".`);
			if(delta2Table !== null && (!(delta2Table instanceof Uint8Array) || delta2Table.byteLength !== pat.byteLength)) throw new Exception(0x84FF09, `Argument is invalid: "delta2Table".`);
		}

		// The empty pattern must be considered specially
		if (pat.byteLength === 0) return -1;

		const subjectlen = subject.length;
		const patlen = pat.byteLength;
		delta1Table = delta1Table || BoyerMoore.createDelta1Table(pat);
		delta2Table = delta2Table || BoyerMoore.createDelta2Table(pat);

		let i = offset + patlen - 1;				// str-idx
		while (i < subjectlen)
		{
			let j = patlen - 1;			// pat-idx
			while (subject[i] === pat[j])
			{
				if(j === 0) return i;
				--i;
				--j;
			}
			i += Math.max(delta1Table[subject[i]], delta2Table[patlen - 1 - j]);
		}
		return -1;
	}

	//	Function: Performs a boyer-moore search of a byte pattern within a subject - an array of non-empty byte arrays.
	//	Parameter: `subjects: Uint8Array` - the subject - an array of non-empty byte arrays.
	//	Parameter: `pat: Uint8Array` - the byte pattern to search for.
	//	Parameter: `offset: integer` - a non-negative integer representing the offset from the first `subject`'s item's beggining to start the search from.
	//	Parameter: `delta1Table: Uint8Array` - a prebuilt detla1 table created by `BoyerMoore.createDelta1Table(pat);`; if ommitted, the delta1 table will be created internally.
	//	Parameter: `delta2Table: Uint8Array` - a prebuilt detla2 table created by `BoyerMoore.createDelta2Table(pat);`; if ommitted, the delta2 table will be created internally.
	//	Returns: The index of the first occurrence of `pat` within the `subjects` or `-1` if `pat` is empty or not found. This index is relative to the first `subject`'s item's beggining 
	//		and counts the bytes of all subsequent items.
	//	Remarks: 
	//		The `offset` parameter and the return value represent offsets cumulative to the whole `subjects` array, e.g. the offset of `8` in `[[6, 7], [8, 9]]` will be `2` (`Uint8Array`s 
	//			are represented with the plain array notation for redability).
	//		As an optimization, the `delta1Table` and `delta2Table` parameters can be set with prebuilt values in case of multiple searches with the same pattern.
	//	Exception: `"Argument is invalid"`.
	static searchEx(subjects, pat, offset = 0, delta1Table = null, delta2Table = null)
	{
		if(PB_DEBUG)
		{
			if (!Type.isArray(subjects)) throw new Exception(0x59659A, `Argument is invalid: "subjects".`);
			for(let length = subjects.length, i = 0; i < length; ++i) if(!(subjects[i] instanceof Uint8Array)) throw new Exception(0x45B828, `Argument is invalid: "subjects". Related index: ${i}.`);
			for(let length = subjects.length, i = 0; i < length; ++i) if(!subjects[i].length) throw new Exception(0x1360D0, `Argument is invalid: "subjects". Related index: ${i}.`);
			if(!(pat instanceof Uint8Array)) throw new Exception(0xDD05E2, `Argument is invalid: "pat".`);
			if(!Type.isInteger(offset) || offset < 0) throw new Exception(0xBF1713, `Argument is invalid: "offset".`);
			if(delta1Table !== null && (!(delta1Table instanceof Uint8Array) || delta1Table.byteLength !== BoyerMoore_ALPHABET_LEN)) throw new Exception(0x8D4638, `Argument is invalid: "delta1Table".`);
			if(delta2Table !== null && (!(delta2Table instanceof Uint8Array) || delta2Table.byteLength !== pat.byteLength)) throw new Exception(0x584204, `Argument is invalid: "delta2Table".`);
		}

		// The empty pattern must be considered specially
		if (pat.byteLength === 0) return -1;

		const patlen = pat.byteLength;
		delta1Table = delta1Table || BoyerMoore.createDelta1Table(pat);
		delta2Table = delta2Table || BoyerMoore.createDelta2Table(pat);

		let subjectlen = 0;
		let subjectcur = Number.MAX_SAFE_INTEGER;
		let offsets = new Array(subjects.length);
		for(let length = subjects.length, i = 0; i < length; ++i)
		{
			offsets[i] = subjectlen;
			subjectlen += subjects[i].length;
			if(offset < subjectlen) subjectcur = Math.min(i, subjectcur);
		}
		let subject = subjects[subjectcur];
		let subjectoffs = offsets[subjectcur];

		let i = offset + patlen - 1;				// str-idx
		if(subjectcur < subjects.length - 1 && (i < subjectoffs || i - subjectoffs >= subject.length))
		{
			let acum = subjectoffs;
			for(let klength = subjects.length, k = subjectcur; k < klength; ++k)
			{
				acum += subjects[k].length;
				if(i < acum) {subjectcur = k; break;}
			}
			subject = subjects[subjectcur];
			subjectoffs = offsets[subjectcur];
		}
		while (i < subjectlen)
		{
			let j = patlen - 1;			// pat-idx
			while (subject[i - subjectoffs] === pat[j])
			{
				if(j === 0) return i;
				--i;
				--j;
				if(i < subjectoffs)
				{
					--subjectcur;
					subject = subjects[subjectcur];
					subjectoffs = offsets[subjectcur];
				}
			}
			if (j < 0) return i + 1;
			i += Math.max(delta1Table[subject[i - subjectoffs]], delta2Table[patlen - 1 - j]);
			if(subjectcur < subjects.length - 1 && i - subjectoffs >= subject.length)
			{
				let acum = subjectoffs;
				for(let klength = subjects.length, k = subjectcur; k < klength; ++k)
				{
					acum += subjects[k].length;
					if(i < acum) {subjectcur = k; break;}
				}
				subject = subjects[subjectcur];
				subjectoffs = offsets[subjectcur];
			}
		}
		return -1;
	}
}

module.exports.BoyerMoore = module.exports;