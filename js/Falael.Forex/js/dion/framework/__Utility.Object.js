"use strict";

module.exports =

class Utility_Object
{
	static mapArray(array, propertyName)
	{
		if (!array) return array;
		if (!array.length) return {};
		const result = {};
		for (let length = array.length, i = 0; i < length; ++i)
		{
			const item = array[i];
			result[item[propertyName]] = item;
		}
		return result;
	}

	//	https://stackoverflow.com/questions/34517538/setting-an-es6-class-getter-to-enumerable
	static makeGettersEnumerable(o)
	{
		const prototype = Object.getPrototypeOf(o);
		const prototype_property_descriptors = Object.getOwnPropertyDescriptors(prototype);
		for (const [property, descriptor] of Object.entries(prototype_property_descriptors))
		{
			const is_nonstatic_getter = (typeof descriptor.get === "function");
			if (is_nonstatic_getter)
			{
				descriptor.enumerable = true;
				Object.defineProperty(o, property, descriptor);
			}
		}
	}
}