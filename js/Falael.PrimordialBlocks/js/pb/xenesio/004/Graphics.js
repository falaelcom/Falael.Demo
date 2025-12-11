//	R0Q1?/daniel/20210502
//		- missing unit tests for Category: Canvas pixel manipulation; Ref.: Falael.CODE\inception\js-sandbox\05-colors-hsv-h.html
"use strict"; if (typeof window === "undefined") throw new Error(`Unsupported runtime.`);

const { Type } = require("-/pb/natalis/000/Native.js");

module.exports = 

//	Class: A collection of static functions for graphics manipulation in the following categories:
//		Category: Canvas pixel manipulation
class Graphics
{
	//	Category: Canvas pixel manipulation
	//	Function: Set a single pixel of a pixelData object at specified coordinates x and y to a color r, g, b, and a represented as RGBA (Red, Green, Blue, Alpha).
	//	Parameter: `pixelData`: an object, obtainable from a canvas in the following way: `pixelData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height)`.
	//	Parameter: `x: integer` - the x-coordinate of the pixel; expected to be a non-negative number less than the canvas' width; required.
	//	Parameter: `y: integer` - the y-coordinate of the pixel; expected to be a non-negative number less than the canvas' height; required.
	//	Parameter: `r: integer` - the red channel of the color; expected to to fall in the range [0, 255]; required.
	//	Parameter: `g: integer` - the green channel of the color; expected to to fall in the range [0, 255]; required.
	//	Parameter: `b: integer` - the blue channel of the color; expected to to fall in the range [0, 255]; required.
	//	Parameter: `a: integer` - the alpha channel of the color; expected to to fall in the range [0, 255]; required.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Argument is out of range"`.
	static setPixel(pixelData, x, y, r, g, b, a)
	{
		if (PB_DEBUG)
		{
			if (!pixelData) throw new Exception(0xC88161, `Argument is invalid: "pixelData".`);
			if (!pixelData.data) throw new Exception(0x84F4D9, `Argument is invalid: "pixelData".`);

			if (!Type.isInteger(x)) throw new Exception(0xEF1A1F, `Argument is invalid: "x".`);
			if (x < 0 || x >= pixelData.width) throw new Exception(0xFA4A4B, `Argument is out of range: "x".`);
			if (!Type.isInteger(y)) throw new Exception(0x4FDAE6, `Argument is invalid: "y".`);
			if (y < 0 || y >= pixelData.height) throw new Exception(0x31B785, `Argument is out of range: "y".`);

			if (!Type.isInteger(r)) throw new Exception(0x8B592C, `Argument is invalid: "r".`);
			if (r < 0 || r > 255) throw new Exception(0x7AFB48, `Argument is out of range: "r".`);
			if (!Type.isInteger(g)) throw new Exception(0x2A657B, `Argument is invalid: "g".`);
			if (g < 0 || g > 255) throw new Exception(0x41DC58, `Argument is out of range: "g".`);
			if (!Type.isInteger(b)) throw new Exception(0x5819BC, `Argument is invalid: "b".`);
			if (b < 0 || b > 255) throw new Exception(0xAFD7F0, `Argument is out of range: "b".`);
			if (!Type.isInteger(a)) throw new Exception(0xF937E1, `Argument is invalid: "a".`);
			if (a < 0 || a > 255) throw new Exception(0x9BE11A, `Argument is out of range: "a".`);
		}
		
		let index = (x + y * pixelData.width) * 4;
		pixelData.data[index++] = r;
		pixelData.data[index++] = g;
		pixelData.data[index++] = b;
		pixelData.data[index++] = a;
	}
}