//	R0Q2?/daniel/20210727
//	- DOC
//	- TEST
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Diagnostics } = require("-/pb/natalis/001/Diagnostics.js");
const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");

const EnumDataKey = Symbol("EnumDataKey");

const TEnum = class Enum
{
	constructor(name, dictionary)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(name)) throw new ArgumentException(0xECD90B, "name", name);
			if (!Type.isObject(dictionary)) throw new ArgumentException(0xFD8725, "dictionary", dictionary);
		}

		this[EnumDataKey] =
		{
			name,
			names: [],
			reverseMap: {},
		};
		const names = this[EnumDataKey].names;
		const reverseMap = this[EnumDataKey].reverseMap;

		for (const key in dictionary)
		{
			if (!Object.prototype.hasOwnProperty.call(dictionary, key)) continue;
			const value = dictionary[key];
			_validateValue(value);
			names.push(key);
			reverseMap[value] = key;
			this[key] = value;
		}
		for (const key in Object.getOwnPropertySymbols(dictionary))
		{
			const value = dictionary[key];
			_validateValue(value);
			if (PB_DEBUG)
			{
				if (key === EnumDataKey) throw new Exception(0x80864C, `Enum key is invalid: "${key.description}".`);
			}
			names.push(key);
			reverseMap[value] = key;
			this[key] = value;
		}

		Object.freeze(this);
		Object.freeze(this[EnumDataKey]);
		Object.freeze(this[EnumDataKey].names);
		Object.freeze(this[EnumDataKey].reverseMap);
	}

	static getEnumName(enumType)
	{
		if (PB_DEBUG)
		{
			if (Type.isNU(enumType) || enumType.constructor !== Enum) throw new ArgumentException(0xA8C3A5, "enumType", enumType);
		}
		return enumType[EnumDataKey].name;
	}

	static getName(enumType, value)
	{
		if (PB_DEBUG)
		{
			if (Type.isNU(enumType) || enumType.constructor !== Enum) throw new ArgumentException(0xA5F3B4, "enumType", enumType);
			_validateValue(value);
		}
		return enumType[EnumDataKey].reverseMap[value];
	}

	static names(enumType)
	{
		if (PB_DEBUG)
		{
			if (Type.isNU(enumType) || enumType.constructor !== Enum) throw new ArgumentException(0x999FC6, "enumType", enumType);
		}
		return enumType[EnumDataKey].names;
	}

	static hasValue(enumType, value)
	{
		if (PB_DEBUG)
		{
			if (Type.isNU(enumType) || enumType.constructor !== Enum) throw new ArgumentException(0x5246F4, "enumType", enumType);
		}
		return enumType[EnumDataKey].reverseMap[value] !== void 0;
	}
}
function Enum(name, dictionary) { return new TEnum(name, dictionary); }
Enum.prototype.constructor = TEnum.constructor;
Enum.getName = TEnum.getName;
Enum.names = TEnum.names;
Enum.hasValue = TEnum.hasValue;
module.exports = Enum;

function _validateValue(value)
{
	if (value === true || value === false) return;
	if (value === void 0 || value === null || value !== value) throw new Exception(0x5E381B, `Enum value is invalid: "value".`);
	if (value.constructor === Number) return;
	if (value.constructor === String) return;
	if (value.constructor === Symbol) return;
	throw new Exception(0x4150C2, `Enum value is invalid: "value" (${Diagnostics.print(value)}).`);
}

module.exports.Enum = module.exports;
