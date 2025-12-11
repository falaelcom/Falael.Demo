//	R0Q3?/daniel/20210824
//	- TODO: validate input parameters where meaningful in functions
//	- TEST uuid44 both implementations (crypto and the polyfill)
//	- TEST md5
"use strict";

const { Exception } = require("-/pb/natalis/003/Exception.js");

module.exports =

//	Class: 
//	See also: https://github.com/uuidjs/uuid
//	See also: https://gitlab.com/rockerest/fast-mersenne-twister/-/tree/master
//	See also: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
class Crypto
{
	static uuid44()
	{
		_getRandomValues(_buffer);

		// Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
		_buffer[6] = (_buffer[6] & 0x0f) | 0x40;
		_buffer[8] = (_buffer[8] & 0x3f) | 0x80;

		return _serialize(_buffer);
	}

	//	See also: http://pajhome.org.uk/crypt/md5/contrib/jkm-md5.js
	static md5 = _md5_initialize()
}

const _buffer = new Uint8Array(16);

//	_serialize
const _map = [];
for (let i = 0; i < 256; ++i) _map.push((i + 0x100).toString(16).substr(1).toLowerCase());
function _serialize(arr)
{
    return (
        _map[arr[0]] + _map[arr[1]] + _map[arr[2]] + _map[arr[3]] + '-' +
        _map[arr[4]] + _map[arr[5]] + '-' +
        _map[arr[6]] + _map[arr[7]] + '-' +
        _map[arr[8]] + _map[arr[9]] + '-' +
        _map[arr[10]] + _map[arr[11]] + _map[arr[12]] + _map[arr[13]] + _map[arr[14]] + _map[arr[15]]
    );
}

//	getRandomValues
let _getRandomValues;
if(typeof crypto !== "undefined" && crypto.getRandomValues)
{
	_getRandomValues = crypto.getRandomValues.bind(crypto);
}
else
{
	const nextRandomFloat = _createMersenneTwister(Math.random() * Number.MAX_SAFE_INTEGER);
	_getRandomValues = function(array)
	{
		let i = array.length;
		while (--i) array[i] = Math.floor(nextRandomFloat() * 256);
	}

	//	Mersenne Twister
	function _createMersenneTwister(seed)
	{
		const N = 624;
		const N_MINUS_1 = 623;
		const M = 397;
		const M_MINUS_1 = 396;
		const DIFF = N - M;
		const MATRIX_A = 0x9908b0df;
		const UPPER_MASK = 0x80000000;
		const LOWER_MASK = 0x7fffffff;

		let state = initialize(seed);
		let next = 0;
		return () => 
		{
			let x;
			if(next >= N)
			{
				state = twist(state);
				next = 0;
			}
			x = state[next++];
			// Tempering
			x ^=  x >>> 11;
			x ^= (x << 7)  & 0x9d2c5680;
			x ^= (x << 15) & 0xefc60000;
			x ^=  x >>> 18;
			x =  (x >>> 0);	// Convert to unsigned
			return x * ( 1.0 / 4294967296.0 );
		};
	
		// The original algorithm used 5489 as the default seed
		function initialize(seed = Date.now())
		{
			const result = new Array(N);

			// fill initial state
			result[0] = seed;
			for(let i = 1; i < N; i++ )
			{
				let s = result[i - 1] ^ ( result[i - 1] >>> 30 );
				// avoid multiplication overflow: split 32 bits into 2x 16 bits and process them individually
				result[i]  = (
					(
						(
							(
								( s & 0xffff0000 ) >>> 16
							) * 1812433253
						) << 16
					) + ( s & 0x0000ffff ) * 1812433253
				) + i;
			}
			return twist(result);
		}

		function twist(state)
		{
			let bits;
			for(let i = 0; i < DIFF; i++)	// first 624-397=227 words
			{
				bits = ( state[i] & UPPER_MASK ) | ( state[i + 1] & LOWER_MASK );
				state[i] = state[i + M] ^ ( bits >>> 1 ) ^ ( ( bits & 1 ) * MATRIX_A );
			}
			for(let i = DIFF ; i < N_MINUS_1; i++)	// remaining words (except the very last one)
			{
				bits = ( state[i] & UPPER_MASK ) | ( state[i + 1] & LOWER_MASK );
				state[i] = state[i - DIFF] ^ ( bits >>> 1 ) ^ ( ( bits & 1 ) * MATRIX_A );
			}
			// last word is computed pretty much the same way, but i + 1 must wrap around to 0
			bits = ( state[N_MINUS_1] & UPPER_MASK ) | ( state[0] & LOWER_MASK );
			state[N_MINUS_1] = state[M_MINUS_1] ^ ( bits >>> 1 ) ^ ( ( bits & 1 ) * MATRIX_A );
			return state;
		}
	}
}

function _md5_initialize()
{
	const hex_chr = "0123456789abcdef".split("");
	const md5blks = [];

	function md5cycle(x, k)
	{
		let a = x[0], b = x[1], c = x[2], d = x[3];

		a = ff(a, b, c, d, k[0], 7 , -680876936);
		d = ff(d, a, b, c, k[1], 12, -389564586);
		c = ff(c, d, a, b, k[2], 17,  606105819);
		b = ff(b, c, d, a, k[3], 22, -1044525330);
		a = ff(a, b, c, d, k[4], 7 , -176418897);
		d = ff(d, a, b, c, k[5], 12,  1200080426);
		c = ff(c, d, a, b, k[6], 17, -1473231341);
		b = ff(b, c, d, a, k[7], 22, -45705983);
		a = ff(a, b, c, d, k[8], 7 ,  1770035416);
		d = ff(d, a, b, c, k[9], 12, -1958414417);
		c = ff(c, d, a, b, k[10], 17, -42063);
		b = ff(b, c, d, a, k[11], 22, -1990404162);
		a = ff(a, b, c, d, k[12], 7 ,  1804603682);
		d = ff(d, a, b, c, k[13], 12, -40341101);
		c = ff(c, d, a, b, k[14], 17, -1502002290);
		b = ff(b, c, d, a, k[15], 22,  1236535329);

		a = gg(a, b, c, d, k[1], 5 , -165796510);
		d = gg(d, a, b, c, k[6], 9 , -1069501632);
		c = gg(c, d, a, b, k[11], 14,  643717713);
		b = gg(b, c, d, a, k[0], 20, -373897302);
		a = gg(a, b, c, d, k[5], 5 , -701558691);
		d = gg(d, a, b, c, k[10], 9 ,  38016083);
		c = gg(c, d, a, b, k[15], 14, -660478335);
		b = gg(b, c, d, a, k[4], 20, -405537848);
		a = gg(a, b, c, d, k[9], 5 ,  568446438);
		d = gg(d, a, b, c, k[14], 9 , -1019803690);
		c = gg(c, d, a, b, k[3], 14, -187363961);
		b = gg(b, c, d, a, k[8], 20,  1163531501);
		a = gg(a, b, c, d, k[13], 5 , -1444681467);
		d = gg(d, a, b, c, k[2], 9 , -51403784);
		c = gg(c, d, a, b, k[7], 14,  1735328473);
		b = gg(b, c, d, a, k[12], 20, -1926607734);

		a = hh(a, b, c, d, k[5], 4 , -378558);
		d = hh(d, a, b, c, k[8], 11, -2022574463);
		c = hh(c, d, a, b, k[11], 16,  1839030562);
		b = hh(b, c, d, a, k[14], 23, -35309556);
		a = hh(a, b, c, d, k[1], 4 , -1530992060);
		d = hh(d, a, b, c, k[4], 11,  1272893353);
		c = hh(c, d, a, b, k[7], 16, -155497632);
		b = hh(b, c, d, a, k[10], 23, -1094730640);
		a = hh(a, b, c, d, k[13], 4 ,  681279174);
		d = hh(d, a, b, c, k[0], 11, -358537222);
		c = hh(c, d, a, b, k[3], 16, -722521979);
		b = hh(b, c, d, a, k[6], 23,  76029189);
		a = hh(a, b, c, d, k[9], 4 , -640364487);
		d = hh(d, a, b, c, k[12], 11, -421815835);
		c = hh(c, d, a, b, k[15], 16,  530742520);
		b = hh(b, c, d, a, k[2], 23, -995338651);

		a = ii(a, b, c, d, k[0], 6 , -198630844);
		d = ii(d, a, b, c, k[7], 10,  1126891415);
		c = ii(c, d, a, b, k[14], 15, -1416354905);
		b = ii(b, c, d, a, k[5], 21, -57434055);
		a = ii(a, b, c, d, k[12], 6 ,  1700485571);
		d = ii(d, a, b, c, k[3], 10, -1894986606);
		c = ii(c, d, a, b, k[10], 15, -1051523);
		b = ii(b, c, d, a, k[1], 21, -2054922799);
		a = ii(a, b, c, d, k[8], 6 ,  1873313359);
		d = ii(d, a, b, c, k[15], 10, -30611744);
		c = ii(c, d, a, b, k[6], 15, -1560198380);
		b = ii(b, c, d, a, k[13], 21,  1309151649);
		a = ii(a, b, c, d, k[4], 6 , -145523070);
		d = ii(d, a, b, c, k[11], 10, -1120210379);
		c = ii(c, d, a, b, k[2], 15,  718787259);
		b = ii(b, c, d, a, k[9], 21, -343485551);

		x[0] = add32(a, x[0]);
		x[1] = add32(b, x[1]);
		x[2] = add32(c, x[2]);
		x[3] = add32(d, x[3]);
	}

	function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b) }

	function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }

	function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }

	function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }

	function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

	function md51(s)
	{
		const n = s.length, state = [1732584193, -271733879, -1732584194, 271733878];
		let i;
		for (i = 64; i <= s.length; i += 64) md5cycle(state, md5blk(s.substring(i-64, i)));
		s = s.substring(i - 64);
		const tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
		for (i = 0; i < s.length; ++i)
		tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
		tail[i>>2] |= 0x80 << ((i%4) << 3);
		if (i > 55)
		{
			md5cycle(state, tail);
			for (i = 0; i < 16; ++i) tail[i] = 0;
		}
		tail[14] = n*8;
		md5cycle(state, tail);
		return state;
	}

	function md5blk(s)
	{
		for (let i = 0; i < 64; i += 4)
		{
			md5blks[i>>2] = s.charCodeAt(i)
				+ (s.charCodeAt(i+1) << 8)
				+ (s.charCodeAt(i+2) << 16)
				+ (s.charCodeAt(i+3) << 24);
		}
		return md5blks;
	}

	function rhex(n)
	{
		let s = "";
		for(let j=0; j<4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
		return s;
	}

	function hex(x)
	{
		for (let i = 0; i < x.length; i++) x[i] = rhex(x[i]);
		return x.join("");
	}

	function add32(a, b) { return (a + b) & 0xFFFFFFFF; }

	if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592") throw new Exception(0xB9A895, `Unsupported running environment.`);

	return v => hex(md51(v));
}

module.exports.Crypto = module.exports;