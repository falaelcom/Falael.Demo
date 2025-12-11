//	R0Q3?/daniel/20220915
//	- TEST: `bytes_IEC`, `bytes_SI`
//	- DOC
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { ArgumentException } = require("-/pb/natalis/003/Exception.js");

const MagnitudeUnits_IEC_en = [null, "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB", "BiB", "GEiB"];
const MagnitudeUnits_SI_en = [null, "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "BB", "GEB"];
//	NOTE: kg, km, mg, cm, etc. would be generalized with "metric units" as opposed to "magnitude" as used above

//	`RoundingDefs` - 3 decimal places up to 1 (excl), 2 decimal places up to 10 (excl), 1 decimal place up to 100 (excl), 0 decimal place above 100 (incl) 
const RoundingDefs = [1, 3, 10, 2, 100, 1];

const UnitFormat =

module.exports = 
{
	"en":
	{
		bytes_IEC(input)
		{
			return UnitFormat.magnitude(input, 1024, MagnitudeUnits_IEC_en, RoundingDefs, 0);
		},

		bytes_SI(input)
		{
			return UnitFormat.magnitude(input, 1000, MagnitudeUnits_SI_en, RoundingDefs, 0);
		},
	},

	//	Parameter: `roundingDefs: [<threshold>: number, <decimals>: integer]` - must be sorted by `<threshold>` in ascending order.
	magnitude(input, base, unitLabels, roundingDefs, unitOverflowDecimals)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNumber(input)) throw new ArgumentException(0xD3F5D5, "input", input);
			if (!Type.isNumber(base) || base < 1) throw new ArgumentException(0x3DE661, "base", base);
			if (!Type.isArray(unitLabels) || unitLabels.length < 1) throw new ArgumentException(0xBD8513, "unitLabels", unitLabels);
			for (let length = unitLabels.length, i = 0; i < length; ++i) if (!Type.isString(unitLabels[i])) throw new ArgumentException(0xD7ADE2, `unitLabels[${i}]`, unitLabels[i]);
			if (!Type.isArray(roundingDefs) || roundingDefs.length % 2 !== 0) throw new ArgumentException(0xBCD232, "roundingDefs", roundingDefs);
			for (let length = roundingDefs.length, i = 0; i < length; ++i) if (!Type.isInteger(roundingDefs[i]) || roundingDefs[i] < 0) throw new ArgumentException(0x911B3B, `roundingDefs[${i}]`, roundingDefs[i]);
			for (let length = roundingDefs.length - 1, i = 0; i < length; i += 2) if (roundingDefs[i + 2] <= roundingDefs[i]) throw new ArgumentException(0x577F5C, `roundingDefs[${i}] > roundingDefs[${i + 2}]`, [roundingDefs[i], roundingDefs[i + 1] ]);
		}

		const inputValue = Math.abs(input);
		const inputSign = Math.sign(input);
		if (inputValue >= Math.pow(base, unitLabels.length))
		{
			const precisionFactor = Math.pow(10, unitOverflowDecimals);
			return inputSign * Math.floor((inputValue / Math.pow(base, unitLabels.length - 1)) * precisionFactor) / precisionFactor + unitLabels[unitLabels.length - 1];
		}

		let i = 0, value = inputValue;
		while (value >= base && i < unitLabels.length - 1)
		{
			value /= base;
			i++;
		}
		for (let jlength = roundingDefs.length, j = 0; j < jlength; j += 2)
		{
			const threshold = roundingDefs[j];
			if (value >= threshold) continue;
			const decimals = roundingDefs[j + 1];
			const precisionFactor = Math.pow(10, decimals);
			const result = Math.floor(value * precisionFactor) / precisionFactor;
			if (Math.floor(result) !== result) return inputSign * result + unitLabels[i];
			return inputSign * Math.floor(value) + unitLabels[i];
		}
		return inputSign * Math.floor(value) + unitLabels[i];
	},
}

module.exports.UnitFormat = module.exports;
module.exports.MagnitudeUnits_IEC_en = MagnitudeUnits_IEC_en;
module.exports.MagnitudeUnits_SI_en = MagnitudeUnits_SI_en;
module.exports.RoundingDefs = RoundingDefs;
