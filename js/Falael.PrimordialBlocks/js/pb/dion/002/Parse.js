//	R0Q3?/daniel/20210911
//		- TODO: "multipart/form-data" - implement
//		- TODO: "multipart/form-data" - when looking for a boundary in large enough input chunks (len > boundary.len + N), utilize BoyerMoore.search; for shorter chunks and around the
//			boundary between two consequtive chunks use standard sequential search
//		- TODO: "quoted-printable" - implement decoder/parser - https://www.w3.org/Protocols/rfc1341/5_Content-Transfer-Encoding.html ("5.1 Quoted-Printable Content-Transfer-Encoding"), https://en.wikipedia.org/wiki/Quoted-printable, https://en.wikipedia.org/wiki/ASCII
//		- OPT: `ChunkList` - use a circular auto-expanding underlyng buffer with start and end pointers
//		- OPT: `ChunkList. next(), moveTo(), moveBy(), add()` - replace `getByteAt` with a context-specific implementation
//		- OPT: `ChunkList.trimLeft()` - replace the `keepRight` call with an optimized implementation
//		- TEST: `ChunkList. next(), moveTo(), moveBy(), add(), trimLeft()`
//		- TEST, DOC
"use strict"; if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) !== "[object process]") throw new Error(`Unsupported runtime.`);

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");
const BoyerMoore = require("-/pb/natalis/012/BoyerMoore.js");

const Parse = module.exports =

//	Class: A collection of functions for deserialization of data.
class Parse
{
}

//	Character codes for Parse.MultipartFormDataParser
const CODE_DASH = "-".charCodeAt(0);
const CODE_COLON = ":".charCodeAt(0);
const CODE_CR = "\r".charCodeAt(0);
const CODE_LF = "\n".charCodeAt(0);
const CODE_SPACE = " ".charCodeAt(0);
const CODE_HTAB = "\t".charCodeAt(0);

//	Parser states for Parse.MultipartFormDataParser
const STATE_EOI = Symbol("STATE_EOI");					//	End Of Input - `Parse.MultipartFormDataParser` enters this state when `Parse.MultipartFormDataParser.EOI` is consumed.
const STATE_EOM = Symbol("STATE_EOM");					//	End Of Message - `Parse.MultipartFormDataParser` enters this state when the closing boundary is consumed.
const STATE_PREAMBLE = Symbol("STATE_PREAMBLE");		//	The initial state of the parser, scanning the preamble for the first encapsulation boundary.
const STATE_PART_OR_EOM = Symbol("STATE_PART_OR_EOM");	//	Looking forward for the closing boundary marker `"--"`, for a new line sequence `"\r\n"` or for sequence of a space characters (`' '`, `'\t'`) leading towards a new line sequence `"\r\n"`.
const STATE_EOM_CANDIDATE = Symbol("STATE_EOM_CANDIDATE");				//	Looking for the second dash from the closing boundary marker `"--"`.
const STATE_PART_CANDIDATE = Symbol("STATE_PART_CANDIDATE");			//	Looking for the `'\n'` from the new line sequence `"\r\n"`.
const STATE_PART_HEADER_OR_BODY = Symbol("STATE_PART_HEADER_OR_BODY");	//	Looking for a new line sequence `"\r\n"` (part body start) or for any other character (headers section).
const STATE_PART_HEADER_NAME = Symbol("STATE_PART_HEADER");					//	Looking for a header value delimiter sequence `": "`.
const STATE_PART_HEADER_VALUE_CANDIDATE = Symbol("STATE_PART_HEADER_VALUE_CANDIDATE");		//	Looking for the space byte `' '` of a header value delimiter sequence `": "`.
const STATE_PART_BODY_CANDIDATE = Symbol("STATE_PART_BODY_CANDIDATE");	//	Scanning for an encapsulation boundary.

//	Known header patterns for Parse.MultipartFormDataParser
const HeaderContentDispositionBytes = new TextEncoder().encode("content-disposition");
const HeaderTypeBytes = new TextEncoder().encode("content-type");
const HeaderContentTransferEncodingBytes = new TextEncoder().encode("content-transfer-encoding");

//	Class: The instances of this class parse "multipart/form-data"-encoded strings (`Parse.MultipartFormDataParser.parseString()`) and byte streams 
//		(`Parse.MultipartFormDataParser.consume()`, `Parse.MultipartFormDataParser.next()`).
//	Remarks:
//		This parser has been designed for maximum performance and balanced memory usage.
//		This parser's streaming interface (`Parse.MultipartFormDataParser.consume()`, `Parse.MultipartFormDataParser.next()`) doesn't decode the names and values of headers, 
//			form fields and part contents; manual decoding should be done via `new TextDecoder().decode(uint8array)`.
//		By default, this parser's `Parse.MultipartFormDataParser.parseString()` static method fully decodes headers and content.
//	See also: http://bic.wiki/wiki/Falael.MultipartFormDataParser.
Parse.MultipartFormDataParser = class MultipartFormDataParser
{
	//	Field: End Of Input; used as an argument for the `consume()` method to indicate that the input has finished.
	static EOI = Symbol("EOI");

	//	Field: Indicates an empty input (input is a single `Parse.MultipartFormDataParser.EOI`) or an input containing one of the following patterns:
	//		`<preamble?>`, `<preamble?>--<boundary>--<epilogue?>` (see http://bic.wiki/wiki/Falael.MultipartFormDataParser).
	//		Returned by the `consume()` method.
	static ElementType_Empty = Symbol("ElementType_Empty");
	//	Field: Indicates that no output element is ready at the moment.
	//		Returned by the `consume()` method.
	static ElementType_Parsing = Symbol("ElementType_Parsing");
	//	Field: Indicates that a header name chunk was parsed for the current part.
	//		Returned by the `consume()` method.
	static ElementType_HeaderNameChunk = Symbol("ElementType_HeaderNameChunk");
	//	Field: Indicates that the final chunk of a "content-disposition" header name was parsed for the current part.
	//		Returned by the `consume()` method.
	static ElementType_HeaderContentDisposition = Symbol("ElementType_HeaderContentDisposition");
	//	Field: Indicates that the final chunk of a "content-type" header name was parsed for the current part.
	//		Returned by the `consume()` method.
	static ElementType_HeaderContentType = Symbol("ElementType_HeaderContentType");
	//	Field: Indicates that the final chunk of a "content-transfer-encoding" name header was parsed for the current part.
	//		Returned by the `consume()` method.
	static ElementType_HeaderContentTransferEncoding = Symbol("ElementType_HeaderContentTransferEncoding");
	//	Field: Indicates that the final chunk of an unknown header name was parsed for the current part.
	//		Returned by the `consume()` method if `this.emitUnknownHeaders === true`; the final data chunk might be an empty byte array.
	static ElementType_UnknownHeaderNameFinalChunk = Symbol("ElementType_UnknownHeaderNameFinalChunk");
	//	Field: Indicates that a known header value chunk was parsed for the current part.
	//		Returned by the `consume()` method.
	static ElementType_KnownHeaderValueChunk = Symbol("ElementType_KnownHeaderValueChunk");
	//	Field: Indicates that the final chunk of a known header value was parsed for the current part.
	//		Returned by the `consume()` method; the final data chunk might be an empty byte array..
	static ElementType_KnownHeaderValueFinalChunk = Symbol("ElementType_KnownHeaderValueFinalChunk");
	//	Field: Indicates that an unknown header value chunk was parsed for the current part.
	//		Returned by the `consume()` method if `this.emitUnknownHeaders === true`.
	static ElementType_UnknownHeaderValueChunk = Symbol("ElementType_UnknownHeaderValueChunk");
	//	Field: Indicates that the final chunk of an unknown header value was parsed for the current part.
	//		Returned by the `consume()` method if `this.emitUnknownHeaders === true`; the final data chunk might be an empty byte array.
	static ElementType_UnknownHeaderValueFinalChunk = Symbol("ElementType_UnknownHeaderValueFinalChunk");
	//	Field: Indicates that a data chunk is ready for the current part.
	//		Returned by the `consume()` method.
	static ElementType_DataChunk = Symbol("ElementType_DataChunk");
	//	Field: Indicates that the final data chunk for the current part is ready; the final data chunk might be an empty byte array.
	//		Returned by the `consume()` method.
	static ElementType_DataFinalChunk = Symbol("ElementType_DataFinalChunk");
	//	Field: Indicates that the closing boundary has been parsed; any subsequent calls `consume()` this function will throw an exception.
	//		Returned by the `consume()` method.
	static ElementType_ClosingBoundary = Symbol("ElementType_ClosingBoundary");


	//	Parameter: `boundary: Uint8Array` - the part delimiter as provided in the message's "content-type" header.
	//	Parameter: `options: { emitUnknownHeaders: false }`.
	constructor(boundary, options = null)
	{
		if (PB_DEBUG)
		{
			if (!(boundary instanceof Uint8Array)) throw new Exception(0x46F011, `Argument is invalid: "boundary".`);
			if (options !== null && !Type.isObject(options)) throw new Exception(0xA1CE8A, `Argument is invalid: "options".`);
			if (options !== null && options.emitUnknownHeaders !== null && !Type.isBoolean(options.emitUnknownHeaders)) throw new Exception(0x155E1E, `Argument is invalid: "options.emitUnknownHeaders".`);
		}

		this._boundary = boundary;
		this._emitUnknownHeaders = options ? !!options.emitUnknownHeaders : false;

		//	`this._encapsulationBoundary` will hold the value of `--<boundary>` (see http://bic.wiki/wiki/Falael.MultipartFormDataParser).
		this._encapsulationBoundary = new Uint8Array(this._boundary.length + 2);
		this._encapsulationBoundary[0] = CODE_DASH;
		this._encapsulationBoundary[1] = CODE_DASH;
		this._encapsulationBoundary.set(this._boundary, 2);
		this._encapsulationBoundary_delta1Table = BoyerMoore.createDelta1Table(this._encapsulationBoundary);
		this._encapsulationBoundary_delta2Table = BoyerMoore.createDelta2Table(this._encapsulationBoundary);
		this._encapsulationBoundaryLength = this._encapsulationBoundary.length;

		this.delta1Table = BoyerMoore.createDelta1Table(this._encapsulationBoundary);
		this.delta2Table = BoyerMoore.createDelta2Table(this._encapsulationBoundary);

		this._hasEOI = false;
		this._isEmpty = true;
		this._state = STATE_PREAMBLE;
		this._headerStartOffsetInChunk = -1;
		this._headerType = null;

		this._chunkList = new ChunkList();		//	the current array of chunks to search, see `BoyerMoore.searchEx`
	}

	//	Function: Consumes an array of byte character codes or `Parse.MultipartFormDataParser.EOI`, and prepares the parser for subsequent `Parse.MultipartFormDataParser.next()` calls.
	//	Parameter: `chunk` - an array of byte character codes or `Parse.MultipartFormDataParser.EOI` if the end of input has been reached.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Invalid operation"`.
	consume(chunk)
	{
		if (PB_DEBUG)
		{
			if (chunk !== Parse.MultipartFormDataParser.EOI && !(chunk instanceof Uint8Array)) throw new Exception(0x510E0F, `Argument is invalid: "chunk".`);
			if (chunk.length <= 0) throw new Exception(0xF36718, `Argument is invalid: "chunk".`);
		}

		if (this._hasEOI) throw new Exception(0x80E855, `Invalid operation.`);

		if (chunk === Parse.MultipartFormDataParser.EOI) this._hasEOI = true;
		else this._chunkList.add(chunk);
	}

	//	Function: Continues parsing the accumulated chunks until all parseable bytes have been processed.
	//	Returns `true` if there is more to parse, otherwise returns `false`.
	//	Remarks: 
	//		Does not perform decoding on the input; manual decoding maight be needed via `new TextDecoder().decode(parser.output)`.
	//		On return, sets `Parse.MultipartFormDataParser.outputType` and may set `Parse.MultipartFormDataParser.output`.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Format is invalid"`.
	//	Exception: `"Invalid operation"`.
	//	Exception: `"Not implemented"`.
	next()
	{
		if (PB_DEBUG)
		{
			if (!this._hasEOI && this._chunkList.isEOB) throw new Exception(0xEB69C3, `Invalid operation.`);
		}

		while (true)
		{
			switch (this._state)
			{
				case STATE_PREAMBLE:
					{
						if (this._chunkList.byteLength - this._chunkList.pointer < this._encapsulationBoundary.length)
						{
							if (this._hasEOI)
							{
								this._state = STATE_EOM;
								this._chunkList.dispose();
								this.outputType = Parse.MultipartFormDataParser.ElementType_Empty;
								return false;			//	no reason to continue parsing after an empty message has been recognized
							}
							this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
							return false;				//	not enough bytes are left to fit an encapsulation boundary; further parsing is meaningless until more bytes are consumed
						}
						const foundAt = BoyerMoore.searchEx(this._chunkList.chunks, this._encapsulationBoundary, this._chunkList.pointer);
						if (foundAt === -1)
						{
							if (this._hasEOI)
							{
								this._state = STATE_EOM;
								this._chunkList.dispose();
								this.outputType = Parse.MultipartFormDataParser.ElementType_Empty;
								return false;			//	no reason to continue parsing after an empty message has been recognized
							}
							//	in next statement, `-1` because the last `this._encapsulationBoundary.length` bytes don't match the encapsulation boundary and the next search shall not test the same bytes
							this._chunkList.keepRight(this._encapsulationBoundary.length - 1);
							this._chunkList.moveTo(this._chunkList.byteLength - this._encapsulationBoundary.length + 1);
							this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
							return false;				//	not enough bytes are left to fit an encapsulation boundary; further parsing is meaningless until more bytes are consumed
						}
						const nextIndex = foundAt + this._encapsulationBoundary.length;
						const delta = this._chunkList.keepRight(this._chunkList.byteLength - nextIndex);
						this._chunkList.moveTo(nextIndex + delta);
						this._state = STATE_PART_OR_EOM;
						if (!this._chunkList.isEOB || this._hasEOI) continue;
						this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
						return false;	//	not enough bytes are left to continue; further parsing is meaningless until more bytes are consumed
					}
				case STATE_PART_OR_EOM:
					{
						if (this._hasEOI && this._chunkList.isEOB) throw new Exception(0xAD22C9, `Format is invalid (multipart form data): unexpected EOI.`);
						switch (this._chunkList.currentByte)
						{
							case CODE_DASH: this._state = STATE_EOM_CANDIDATE; break;
							case CODE_CR: this._state = STATE_PART_CANDIDATE; break;
							case CODE_SPACE: case CODE_HTAB: break;
							default: throw new Exception(0x238A36, `Format is invalid (multipart form data): unexpected byte code ${this._chunkList.currentByte} at chunk list offset ${this._chunkList.pointer}.`);
						}
						this._chunkList.next();
						if (!this._chunkList.isEOB || this._hasEOI) continue;
						this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
						return false;	//	not enough bytes are left to continue; further parsing is meaningless until more bytes are consumed
					}
				case STATE_EOM_CANDIDATE:
					{
						if (this._hasEOI && this._chunkList.isEOB) throw new Exception(0x5B8719, `Format is invalid (multipart form data): unexpected EOI.`);
						switch (this._chunkList.currentByte)
						{
							case CODE_DASH:
								this._state = STATE_EOM;
								this._chunkList.dispose();
								if (this._isEmpty) this.outputType = Parse.MultipartFormDataParser.ElementType_Empty;
								else this.outputType = Parse.MultipartFormDataParser.ElementType_ClosingBoundary;
								return this._hasEOI;
							default: throw new Exception(0xDF15FB, `Format is invalid (multipart form data): unexpected byte code ${this._chunkList.currentByte} at chunk list offset ${this._chunkList.pointer}.`);
						}
					}
				case STATE_PART_CANDIDATE:
					{
						if (this._hasEOI && this._chunkList.isEOB) throw new Exception(0x3B8566, `Format is invalid (multipart form data): unexpected EOI.`);
						switch (this._chunkList.currentByte)
						{
							case CODE_LF: this._state = STATE_PART_HEADER_OR_BODY; break;
							default: throw new Exception(0xC7276A, `Format is invalid (multipart form data): unexpected byte code ${this._chunkList.currentByte} at chunk list offset ${this._chunkList.pointer}.`);
						}
						this._chunkList.next();
						if (!this._chunkList.isEOB || this._hasEOI) continue;
						this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
						return false;	//	not enough bytes are left to continue; further parsing is meaningless until more bytes are consumed
					}
				case STATE_PART_HEADER_OR_BODY:
					{
						if (this._hasEOI && this._chunkList.isEOB) throw new Exception(0x917B89, `Format is invalid (multipart form data): unexpected EOI.`);
						this._isEmpty = false;
						this._chunkList.trimLeft();
						switch (this._chunkList.currentByte)
						{
							case CODE_CR: this._chunkList.next(); this._state = STATE_PART_BODY_CANDIDATE; break;
							case CODE_COLON: throw new Exception(0xF7CE5A, `Format is invalid (multipart form data): unexpected ':' byte.`);
							default:
								this._headerStartOffsetInChunk = this._chunkList.pointer;
								this._state = STATE_PART_HEADER_NAME;
								break;
						}
						if (!this._chunkList.isEOB || this._hasEOI) continue;
						this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
						return false;	//	not enough bytes are left to continue; further parsing is meaningless until more bytes are consumed
					}
				//	TODO: parse chunk-by-chunk to allow header name- and value- chunked emission
				//	- `this._chunkList.next()` now returns a chunk when that chunk been completely consumed 
				//	- iterate bytes via `this._chunkList.next()`
				//	- when a header syntactically-significant byte is encountered
				//		- emit either the whole chunk (`this._chunkList.next()` has returned a chunk and `this._headerStartOffsetInChunk === 0`), or the part between `this._headerStartOffsetInChunk` and the current byte
				//			- change `this._state` to reflect the parsed byte meaning
				//	- don't remove chunks during header parsing
				//	- `trimLeft` when chaning state to `STATE_PART_BODY_CANDIDATE`
				case STATE_PART_HEADER_NAME:		//	TODO: unittest regular and exceptional flows
					{
						if (this._hasEOI && this._chunkList.isEOB) throw new Exception(0xBBCDC4, `Format is invalid (multipart form data): unexpected EOI.`);
						switch (this._chunkList.currentByte)
						{
							case CODE_COLON:
								//	TODO: emit either the whole chunk (`this._chunkList.next()` has returned a chunk and `this._headerStartOffsetInChunk === 0`), or the part between `this._headerStartOffsetInChunk` and the current byte
								this._state = STATE_PART_HEADER_VALUE_CANDIDATE; break;
							default: break;
						}
						const outcome = this._chunkList.next();
						if (!this._chunkList.isEOB) continue;
						this.outputType = Parse.MultipartFormDataParser.ElementType_Parsing;
						return this._hasEOI;
					}
				case STATE_PART_HEADER_VALUE_CANDIDATE: throw new Exception(1, `Invalid operation.`);
				case STATE_PART_BODY_CANDIDATE:
					this._chunkList.trimLeft();
					throw new Exception(1, `Invalid operation.`);
				case STATE_EOI: throw new Exception(0x871D0D, `Invalid operation.`);
				case STATE_EOM: throw new Exception(0x8BEF62, `Invalid operation.`);
				default: throw new Exception(0xFBE291, `Not implemented.`);
			}
		}
	}

	//	Property: Gets the part delimiter as set in the constructor.
	//	Returns: `Uint8Array`.
	get boundary()	{ return this._boundary; }

	//	Property: Gets the the value of `--<boundary>` (see http://bic.wiki/wiki/Falael.MultipartFormDataParser).
	//	Returns: `Uint8Array`.
	get encapsulationBoundary() { return this._encapsulationBoundary; }

	get emitUnknownHeaders()
	{
		return this._emitUnknownHeaders;
	}

	//	Field: Holds the type of the current output of the parser.
	//	Remarks: 
	//		Possible values:
	//		- `Parse.MultipartFormDataParser.ElementType_Parsing` - no output element is ready at the moment;
	//		- `Parse.MultipartFormDataParser.ElementType_Empty` - an empty input (input is a single `Parse.MultipartFormDataParser.EOI`) or an input containing one of the following patterns:
	//			`<preamble?>`, `<preamble?>--<boundary>--<epilogue?>` (see http://bic.wiki/wiki/Falael.MultipartFormDataParser), followed by `Parse.MultipartFormDataParser.EOI`.
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderNameChunk` - a header name chunk was parsed for the current part; access bytes of the chunk via `parser.output`;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderContentDisposition` - the final chunk of a "content-disposition" header was parsed for the current part;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderContentType` - the final chunk of a "content-type" header was parsed for the current part;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderContentTransferEncoding` - the final chunk of a "content-transfer-encoding" header was parsed for the current part;
	//		- `Parse.MultipartFormDataParser.ElementType_UnknownHeaderNameFinalChunk` - the final chunk of an unknown header name was parsed for the current part; access the bytes of the chunk via `parser.output`; the final data chunk might be an empty byte array; emitted only if `this.emitUnknownHeaders === true`;
	//		- `Parse.MultipartFormDataParser.ElementType_KnownHeaderValueChunk` - a known header value chunk was parsed for the current part; access the bytes of the chunk via `parser.output`;
	//		- `Parse.MultipartFormDataParser.ElementType_KnownHeaderValueFinalChunk` - the final chunk of a known header value was parsed for the current part; access the bytes of the chunk via `parser.output`; the final data chunk might be an empty byte array;
	//		- `Parse.MultipartFormDataParser.ElementType_UnknownHeaderValueChunk` - an unknown header value was parsed for the current part; access header's complete bytes via `parser.output`; emitted only if `this.emitUnknownHeaders === true`;
	//		- `Parse.MultipartFormDataParser.ElementType_UnknownHeaderValueFinalChunk` - the final chunk of an unknown header value was parsed for the current part; access the bytes of the chunk via `parser.output`; the final data chunk might be an empty byte array; emitted only if `this.emitUnknownHeaders === true`;
	//		- `Parse.MultipartFormDataParser.ElementType_DataChunk` - a data chunk is ready for the current part; access it's value via `parser.output`;
	//		- `Parse.MultipartFormDataParser.ElementType_DataFinalChunk` - the final data chunk for the current part is ready; access it's value via `parser.output`; the final chunk might be an empty byte array;
	//		- `Parse.MultipartFormDataParser.ElementType_ClosingBoundary` - the closing boundary has been parsed; any subsequent calls of this function will throw an exception.
	outputType = null;

	//	Field: Holds the current output of the parser as a transient `Uint8Array`.
	//	Remarks: 
	//		Depending of the value of `this.outputType`, this field contains:
	//		- `Parse.MultipartFormDataParser.ElementType_Parsing` - unpredictable;
	//		- `Parse.MultipartFormDataParser.ElementType_Empty` - `null`;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderNameChunk` - a portion of bytes from the name of a header;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderContentDisposition` - unpredictable;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderContentType` - unpredictable;
	//		- `Parse.MultipartFormDataParser.ElementType_HeaderContentTransferEncoding` - unpredictable;
	//		- `Parse.MultipartFormDataParser.ElementType_UnknownHeaderNameFinalChunk` - the final bytes from the name of an unknown header;
	//		- `Parse.MultipartFormDataParser.ElementType_KnownHeaderValueChunk` - a portion of bytes from the value of a known header;
	//		- `Parse.MultipartFormDataParser.ElementType_KnownHeaderValueFinalChunk` - the final bytes from the value of a known header;
	//		- `Parse.MultipartFormDataParser.ElementType_UnknownHeaderValueChunk` - a portion of bytes from the value of an unknown header;
	//		- `Parse.MultipartFormDataParser.ElementType_UnknownHeaderValueFinalChunk` - the final bytes from the value of an unknown header;
	//		- `Parse.MultipartFormDataParser.ElementType_DataChunk` - a portion of bytes from the content data of the current part;
	//		- `Parse.MultipartFormDataParser.ElementType_DataFinalChunk` - the final portion of bytes from the content data of the current part; if the part's data comes in a single portion, this would also be
	//			the first and only data portion for the current part;
	//		- `Parse.MultipartFormDataParser.ElementType_ClosingBoundary` - unpredictable.
	//		This field's value is not decoded; manual decoding should be done via `new TextDecoder().decode(parser.output))`; chunked data must be decoded with consideration
	//			for multibyte encodings and the possibility that a multibyte codepoint might be split between consecutive chunks.
	output = null;
}

const ChunkList = Parse.MultipartFormDataParser.ChunkList = class ChunkList
{
	constructor(chunks)
	{
		this.chunks = [];
		this.byteLength = 0;
		this.pointer = 0;
		this._currentByte = null;

		this._currentChunkOffset = null;
		this._currentChunkIndex = null;
		this._currentChunk = null;

		if (chunks) for (let length = chunks.length, i = 0; i < length; ++i) this.add(chunks[i]);
	}

	next()
	{
		++this.pointer;
		if (this.pointer < this.byteLength)
		{
			this._currentByte = this.getByteAt(this.pointer);

			//	will become obsolete when the `this.getByteAt` call gets replaced with custom inline code here
			let chunk = this.chunks[0];
			if (this.pointer >= chunk.length) return chunk;	//	return the chunk when it has been completely consumed
			return null;	//	no chunk has been completely consumed on this step - still working the current chunk
			//	/will become obsolete when the `this.getByteAt` call gets replaced with custom inline code here
		}
		else
		{
			this._currentByte = null;

			//	will become obsolete when the `this.getByteAt` call gets replaced with custom inline code here
			return null;	//	no chunk has been completely consumed on this step - waiting for a new chunk
			//	/will become obsolete when the `this.getByteAt` call gets replaced with custom inline code here
		}
	}

	moveTo(offset)
	{
		this.pointer = offset;
		if (this.pointer < this.byteLength) this._currentByte = this.getByteAt(this.pointer);
		else this._currentByte = null;
	}

	moveBy(count)
	{
		this.pointer += count;
		if (this.pointer < this.byteLength) this._currentByte = this.getByteAt(this.pointer);
		else this._currentByte = null;
	}

	add(chunk)
	{
		if (PB_DEBUG)
		{
			if (chunk !== Parse.MultipartFormDataParser.EOI && !(chunk instanceof Uint8Array)) throw new Exception(0xEDC612, `Argument is invalid: "chunk".`);
			if (chunk.length <= 0) throw new Exception(0xC507BC, `Argument is invalid: "chunk".`);
		}

		this.chunks.push(chunk);
		this.byteLength += chunk.length;
		if (this.currentByte === null) this._currentByte = this.getByteAt(this.pointer);
	}

	getByteAt(offset)
	{
		if (PB_DEBUG)
		{
			if (this.chunks.length === 0) throw new Exception(0x7DAED3, `Invalid operation.`);
			if (this.byteLength === 0) throw new Exception(0x55E6BD, `Invalid operation.`);
			if (offset < 0 || offset >= this.byteLength) throw new Exception(0xE35215, `Argument is invalid: "offset".`);
		}
		let chunk = this.chunks[0];
		if (offset < chunk.length) return chunk[offset];
		let i = 1;
		let cumulativeLength = chunk.length;
		do
		{
			chunk = this.chunks[i];
			if (offset - cumulativeLength < chunk.length) return chunk[offset - cumulativeLength];
			cumulativeLength += chunk.length;
			++i;
		}
		while (i < this.chunks.length)
		throw new Exception(0xAD9CDD, `Invalid operation.`);
	}

	//	removes chunks from the start of the raw array until a minimum number of chunks has left that has a cumulative length larger than `targetLength`
	//	returns the delta of change of `this.length` (a non-positive integer)
	//	does not update `this.pointer`, requires an additional `moveBy` or `moveTo` call to do that
	keepRight(targetLength)
	{
		if (targetLength <= 0)
		{
			this.chunks.length = 0;
			const delta = -this.byteLength;
			this.byteLength = 0;
			return delta;
		}
		let cumulativeLength = 0;
		for (let i = this.chunks.length - 1; i >= 0; --i)
		{
			const chunk = this.chunks[i];
			cumulativeLength += chunk.length;
			if (cumulativeLength < targetLength) continue;
			if (i <= 0) return 0;
			if (i > 1) this.chunks.splice(0, i);
			else this.chunks.shift();
			const delta = cumulativeLength - this.byteLength;
			this.byteLength = cumulativeLength;
			return delta;
		}
		return 0;
	}

	//	removes chunks from the start of the raw array until a minimum number of chunks has left that has a cumulative length larger than `this.byteLength - this.pointer`
	trimLeft()
	{
		this.pointer += this.keepRight(this.byteLength - this.pointer);
	}

	dispose()
	{
		this.chunks = null;
	}

	//	Remarks: EOB - End Of Buffer
	get isEOB()
	{
		return this.pointer >= this.byteLength;
	}

	get currentByte()
	{
		return this._currentByte;
	}
}

module.exports.Parse = module.exports;
