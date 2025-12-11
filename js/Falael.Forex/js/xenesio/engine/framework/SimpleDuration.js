"use strict";

include("StdAfx.js");

class SimpleDuration
{
	constructor(value, unit)
	{
		this._value = value;
		this._unit = unit;
	}

	static parse(text)
	{
		var value = null;
		var unit = null;

		var STATE_INPUT = 1;
		var STATE_NUMBER = 2;
		var STATE_UNIT = 3;

		var state = STATE_INPUT;
		var i = 0;
		var length = text.length;
		var sb = [];
		while (i < length)
		{
			var c = text[i];
			switch (state)
			{
				case STATE_INPUT:
					switch (c)
					{
						case '0':
						case '1':
						case '2':
						case '3':
						case '4':
						case '5':
						case '6':
						case '7':
						case '8':
						case '9':
							state = STATE_NUMBER;
							break;
						default:
							throw "Invalid format: number.";
					}
					break;
				case STATE_NUMBER:
					switch (c)
					{
						case '0':
						case '1':
						case '2':
						case '3':
						case '4':
						case '5':
						case '6':
						case '7':
						case '8':
						case '9':
							++i;
							sb.push(c);
							break;
						default:
							if (!sb.length)
							{
								throw "Invalid format: number.";
							}
							value = parseInt(sb.join(""));
							sb.length = 0;
							state = STATE_UNIT;
					}
					break;
				case STATE_UNIT:
					switch (c)
					{
						case 'm':
						case 's':
						case 'i':
						case 'n':
						case 'h':
						case 'd':
						case 'W':
						case 'M':
						case 'Q':
						case 'y':
						case 'D':
						case 'c':
							++i;
							sb.push(c);
							break;
						default:
							throw "Invalid format: unit.";
					}
					break;
				default:
					throw "Not implemented.";
			}
		}

		if (!sb.length)
		{
			throw "Invalid format: unit.";
		}

		switch (sb.join(""))
		{
			case "ms": unit = EDateTimeUnit.Millisecond; break;
			case "s": unit = EDateTimeUnit.Second; break;
			case "min": unit = EDateTimeUnit.Minute; break;
			case "h": unit = EDateTimeUnit.Hour; break;
			case "d": unit = EDateTimeUnit.Day; break;
			case "W": unit = EDateTimeUnit.Week; break;
			case "M": unit = EDateTimeUnit.Month; break;
			case "Q": unit = EDateTimeUnit.Quarter; break;
			case "y": unit = EDateTimeUnit.Year; break;
			case "D": unit = EDateTimeUnit.Decade; break;
			case "c": unit = EDateTimeUnit.Century; break;
			default: throw "Invalid format: unit.";
		}

		return new SimpleDuration(value, unit);
	}

	static fromRange(startMs, endMs, unit)
	{
		return new SimpleDuration(EDateTimeUnit.diffMoments(moment.utc(endMs), moment.utc(startMs), unit), unit);
	}

	lessThan(duration)
	{
		if (this._unit > duration._unit) return true;
		if (this._unit < duration._unit) return false;
		return this._value < duration._value;
	}

	lessThanOrEquals(duration)
	{
		if (this._unit > duration._unit) return true;
		if (this._unit < duration._unit) return false;
		return this._value <= duration._value;
	}

	get value()
	{
		return this._value;
	}

	get unit()
	{
		return this._unit;
	}
}
