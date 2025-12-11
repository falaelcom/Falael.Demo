"use strict";

////////////////////////////////////////////
//	Utility
if (!("Utility" in window)) window.Utility = {};

////////////////////////////////////////////
//	Utility.Format
if (!Utility.Format) Utility.Format = {};

Utility.Format.formatNumber = function(value, totalChars)
{
	var result = String(Math.round(value * 100000) / 100000);
	if (result.indexOf('.') == -1) result += '.';
	return result.padEnd(totalChars, '0');
}

Utility.Format.formatDecimal = function (value, decimalPlaces)
{
	var factor = Math.pow(10, decimalPlaces);
	var result = String(Math.round(value * factor) / factor);
	if (!decimalPlaces) return result;
	var foundAt = result.indexOf('.');
	if (foundAt == -1)
	{
		result += '.';
		foundAt = result.length - 1;
	}
	var fractionLength = result.length - foundAt + 1;
	var padCount = result.length + decimalPlaces - fractionLength + 2;

	return result.padEnd(padCount, '0');
}
