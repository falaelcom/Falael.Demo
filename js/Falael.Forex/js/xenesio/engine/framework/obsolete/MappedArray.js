"use strict";

//	wraps up an array of objects sharing the same schema
//	abstracts the access to objects' properties by mapping user-defined keys to user-defined property accessor functions
//	provides some statistical functions over the sample
//
//	data is copied in the constructor
//	a MappedArray instance is read-only and thus immutable
class MappedArray
{
	//	avoid '*' in value accessor keys
	constructor(data, valueAccessors, defaultValueAccessorKey)
	{
		if (!data) throw "Argument is null: data.";
		if (valueAccessors && defaultValueAccessorKey && !valueAccessors[defaultValueAccessorKey]) throw "Argument value is invalid: defaultValueAccessorKey.";

		this._data = data.slice();
		this._valueAccessors = valueAccessors;
		this._defaultValueAccessorKey = defaultValueAccessorKey;
	}

	clone()
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);
		result._data = this._data;
		return result;
	}

	//	config.schemaType
	//		"array"
	//		config.distributionType
	//			"random"
	//			config.probabilityDistributionType: "uniform", "biasedAtZero"
	//			config.valueAccessorKey_i
	//			config.valueAccessorKey_value
	//			config.minY
	//			config.maxY
	//			config.resolutionY
	//			config.stepYSpread
	//		config.distributionType
	//			"function"
	//			config.valueAccessorKey_i
	//			config.valueAccessorKey_value
	//			config.calc
	static generateSample(count, config)
	{
		var distributionType = config.distributionType;

		var schemaType = config.schemaType;
		switch (schemaType)
		{
			case "array":	//	will use incrementing zero-based indices as a x-component of the resulting data entries
				switch (distributionType)
				{
					case "random":		//	will generate an array of random numbers
						return MappedArray._gen_random_array(count, config);
					case "function":	//	will generate an array of calculated values, x in [0..count]
						return MappedArray._gen_function_array(count, config);
					default:
						throw "Not implemented.";
				}
			default:
				throw "Not implemented.";
		}
	}

	static _gen_random_array(count, config)
	{
		var probabilityDistributionType = config.probabilityDistributionType;
		var valueAccessorKey_i = config.valueAccessorKey_i;
		var valueAccessorKey_value = config.valueAccessorKey_value;
		var minY = config.minY;
		var maxY = config.maxY;
		var resolutionY = config.resolutionY;
		var stepYSpread = config.stepYSpread;

		var result = [];
		switch (probabilityDistributionType)
		{
			case "uniform":
				var ySpread = maxY - minY;
				var yStep = stepYSpread * ySpread / resolutionY;
				var y = minY + ySpread / 2;
				for (var i = 0; i < count; ++i)
				{
					y += Math.sign(Math.random() - 0.5) * Math.random() * yStep;
					var item = {};
					item[valueAccessorKey_i] = i;
					item[valueAccessorKey_value] = y;
					result.push(item);
				}
				break;
			case "biasedAtZero":
				var ySpread = maxY - minY;
				var yStep = stepYSpread * ySpread / resolutionY;
				var y = minY + ySpread / 2;
				for (var i = 0; i < count; i += 1 + Math.round(Math.random() * 0.60) + Math.round(Math.random() * 0.53) + Math.round(Math.random() * 0.51))
				{
					y += Math.sign(Math.random() - 0.5) * Math.random() * yStep;
					var item = {};
					item[valueAccessorKey_i] = i;
					item[valueAccessorKey_value] = y;
					result.push(item);
				}
				break;
			default:
				throw "Not implemented.";
		}

		var valueAccessors = {};
		valueAccessors[valueAccessorKey_i] = entry => entry[valueAccessorKey_i];
		valueAccessors[valueAccessorKey_value] = entry => entry[valueAccessorKey_value];
		return new MappedArray(result, valueAccessors);
	}

	static _gen_function_array(count, config)
	{
		var valueAccessorKey_i = config.valueAccessorKey_i;
		var valueAccessorKey_value = config.valueAccessorKey_value;
		var calc = config.calc;

		var result = [];
		for (var i = 0; i < count; ++i)
		{
			var item = {};
			item[valueAccessorKey_i] = i;
			item[valueAccessorKey_value] = calc(i);
			result.push(item);
		}

		var valueAccessors = {};
		valueAccessors[valueAccessorKey_i] = entry => entry[valueAccessorKey_i];
		valueAccessors[valueAccessorKey_value] = entry => entry[valueAccessorKey_value];
		return new MappedArray(result, valueAccessors);
	}


	getAt(i, valueAccessorKey)
	{
		return this.accessValue(this._data[i], valueAccessorKey);
	}

	accessValue(item, valueAccessorKey)
	{
		var effectiveValueAccessorKey = valueAccessorKey || this._defaultValueAccessorKey;

		if (!effectiveValueAccessorKey) return item;
		if (!this._valueAccessors) return item[effectiveValueAccessorKey];

		var valueAccessorFunction = this._valueAccessors[effectiveValueAccessorKey];
		if (!valueAccessorFunction) return item[effectiveValueAccessorKey];

		return valueAccessorFunction(item);
	}

	remapSample(valueAccessors, defaultValueAccessorKey)
	{
		return new MappedArray(this._data, valueAccessors, defaultValueAccessorKey);
	}

	//	mapping: { resultItemPropertyName: [valueAccessorKey] }
	//		- if mapping is not set, returns slice on the internal data array
	//		- sample.toArray() returns a shallow copy of the internal data array
	//	able to generate multiple result items from a single source item
	//	NOT cached
	toArray(mapping, sourceOffset, sourceLength)
	{
		if (!sourceOffset) sourceOffset = 0;
		if (!sourceLength) sourceLength = this._data.length - sourceOffset;

		if (!mapping) return this._data.slice(sourceOffset, sourceOffset + sourceLength);

		var valence = -1;
		for (var key in mapping)
		{
			var mapperValueAccessorKeys = mapping[key];
			if (Utility.Type.isArray(mapperValueAccessorKeys))
			{
				if (valence == -1) valence = mapperValueAccessorKeys.length;
				else if (valence != mapperValueAccessorKeys.length) throw "Argument is invalid: mapping.";
			}
			else
			{
				if (valence != -1) throw "Argument is invalid: mapping.";
			}
		}
		if (!valence) throw "Argument is invalid: mapping.";

		var result = [];
		if (valence == -1)
		{
			for (var length = sourceOffset + sourceLength, i = sourceOffset; i < length; ++i) 
			{
				var resultItem = {};
				result.push(resultItem);
				for (var key in mapping)
				{
					var mapperValueAccessorKey = mapping[key];
					resultItem[key] = this.getAt(i, mapperValueAccessorKey);
				}
			}
		}
		else if (valence == 1)
		{
			for (var length = sourceOffset + sourceLength, i = sourceOffset; i < length; ++i) 
			{
				var resultItem = {};
				result.push(resultItem);
				for (var key in mapping)
				{
					var mapperValueAccessorKey = mapping[key][0];
					resultItem[key] = this.getAt(i, mapperValueAccessorKey);
				}
			}
		}
		else
		{
			for (var length = sourceOffset + sourceLength, i = sourceOffset; i < length; ++i) 
			{
				var resultItems = [];
				for (var key in mapping)
				{
					var mapperValueAccessorKeys = mapping[key];
					for (var jlength = mapperValueAccessorKeys.length, j = 0; j < jlength; ++j)
					{
						var resultItem;
						if (resultItems.length <= j) resultItems.push(resultItem = {});
						else resultItem = resultItems[j];
						resultItem[key] = this.getAt(i, mapperValueAccessorKeys[j]);
					}
				}
				for (var jlength = resultItems.length, j = 0; j < jlength; ++j) result.push(resultItems[j]);
			}
		}
		return result;
	}

	//	using this.toArray, produces a new sample with verbatim value accessors (<prop> => item.<prop> for each property in mapping)
	//	NOT cached
	map(mapping, sourceOffset, sourceLength)
	{
		if (!sourceOffset) sourceOffset = 0;
		if (!sourceLength) sourceLength = this._data.length - sourceOffset;

		if (!mapping && sourceOffset == 0 && sourceLength == this.length) return this.clone();

		var array = this.toArray(mapping, sourceOffset, sourceLength);
		var valueAccessors = [];
		for (const key in mapping) valueAccessors[key] = item => item[key];
		return new MappedArray(array, valueAccessors);
	}

	//	NOT cached
	toValueArray(valueAccessorKey)
	{
		var result = [];
		for (var length = this._data.length, i = 0; i < length; ++i) result.push(this.getAt(i, valueAccessorKey));
		return result;
	}

	//	NOT cached
	flatten(sourceOffset, sourceLength)
	{
		if (!sourceOffset) sourceOffset = 0;
		if (!sourceLength) sourceLength = this._data.length - sourceOffset;

		if (!this.valueAccessors) return this._data.slice(sourceOffset, sourceOffset + sourceLength);

		var result = [];
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var newItem = {};
			for (var key in this.valueAccessors) newItem[key] = this.getAt(i, key);
			result.push(newItem);
		}
		return result;
	}

	//	requires all values, produced by getAt(i, valueAccessorKey_i) to be integer values >= 0
	//	NOT cached
	enumerateValueArray(valueAccessorKey_i, valueAccessorKey_value)
	{
		var result = [];
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var index;
			if (valueAccessorKey_i) index = this.getAt(i, valueAccessorKey_i);
			else index = i;
			if (!Number.isInteger(index)) throw "Invalid data (1).";
			if (index < 0) throw "Invalid data (2).";
			result[index] = this.getAt(i, valueAccessorKey_value);
		}
		return result;
	}

	//	comparer: function(left, right), where left and right are raw data items, the comparer needs to access properties directly rather than via value accessors
	mergeSample(sample, comparer)
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);
		result._data = this._data.concat(sample._data);
		if (comparer) result._data.sort(comparer);
		return result;
	}

	//	comparer: function(left, right), where left and right are raw data items, the comparer needs to access properties directly rather than via value accessors
	sortedSample(comparer)
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);
		result._data = this._data.slice();
		result._data.sort(comparer);
		return result;
	}

	selectSample(selector)
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);
		for (var length = this._data.length, i = 0; i < length; ++i) if (selector(this._data[i], i)) result._data.push(this._data[i]);
		return result;
	}

	pickSample(indices)
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);
		for (var length = indices.length, i = 0; i < length; ++i) result._data.push(this._data[indices[i]]);
		return result;
	}

	//	NOT cached
	subSample(sourceOffset, sourceLength, valueAccessors, defaultValueAccessorKey)
	{
		if (!sourceOffset) sourceOffset = 0;
		if (!sourceLength) sourceLength = this._data.length - sourceOffset;

		if (!valueAccessors && !defaultValueAccessorKey && sourceOffset == 0 && sourceLength == this.length) return this.clone();

		var result = new MappedArray([], valueAccessors || Object.assign({}, this._valueAccessors), defaultValueAccessorKey || this._defaultValueAccessorKey);
		result._data = this._data.slice(sourceOffset, sourceOffset + sourceLength);
		return result;
	}

	//	NOT cached
	topSample(n, valueAccessorKey, reverse, vicinityCount)
	{
		var array = [];
		for (var length = this._data.length, i = 0; i < length; ++i) array.push({ i: i, value: this.getAt(i, valueAccessorKey) });
		if (!reverse) array.sort((l, r) => r.value - l.value || l.i - r.i);
		else array.sort((l, r) => r.value - l.value || r.i - l.i);
		if (vicinityCount)
		{
			var selection = [];
			var selectionRanges = [];
			for (var length = array.length, i = 0; i < length; ++i)
			{
				var item = array[i];
				if (Range.contain(selectionRanges, item.i)) continue;
				selectionRanges.push(new Range(item.i - vicinityCount, item.i + vicinityCount));
				selection.push(array[i]);
			}
			array = selection;
		}
		var indices = array.slice(0, n).map((x) => x.i);
		indices.sort();
		return this.pickSample(indices);
	}

	//	NOT cached
	bottomSample(n, valueAccessorKey, reverse, vicinityCount)
	{
		var array = [];
		for (var length = this._data.length, i = 0; i < length; ++i) array.push({ i: i, value: this.getAt(i, valueAccessorKey) });
		if (!reverse) array.sort((l, r) => l.value - r.value || l.i - r.i);
		else array.sort((l, r) => l.value - r.value || r.i - l.i);
		if (vicinityCount)
		{
			var selection = [];
			var selectionRanges = [];
			for (var length = array.length, i = 0; i < length; ++i)
			{
				var item = array[i];
				if (Range.contain(selectionRanges, item.i)) continue;
				selectionRanges.push(new Range(item.i - vicinityCount, item.i + vicinityCount));
				selection.push(array[i]);
			}
			array = selection;
		}
		var indices = array.slice(0, n).map((x) => x.i);
		indices.sort();
		return this.pickSample(indices);
	}

	//	if getAt(i, valueAccessorKey_y) === void(0), a zero movement is added to the result
	//	NOT cached
	movements(valueAccessorKey_i, valueAccessorKey_value)
	{
		var yArray = this.enumerateValueArray(valueAccessorKey_i, valueAccessorKey_value);

		var result = [];
		var y_prev = yArray[0];
		if (y_prev === void (0)) throw "Invalid data.";
		for (var length = yArray.length, i = 1; i < length; ++i)
		{
			var y = yArray[i];
			if (y === void (0))
			{
				result.push(0);
				continue;
			}
			result.push(y - y_prev);
			y_prev = y;
		}

		return result;
	}

	//	the values within the returned array are linearly normalized to be between -1 and 1, based on the uniform maximum of the sample
	//	NOT cached
	normalizeWithinSpread(valueAccessorKey)
	{
		var uniformMax = Math.max(this.max(valueAccessorKey), Math.abs(this.min(valueAccessorKey)));
		var result = [];
		for (var length = this._data.length, i = 0; i < length; ++i) result.push(this.getAt(i, valueAccessorKey) / uniformMax);
		return result;
	}

	//	the values within the returned array are linearly normalized to be between 0 and 1 so that the sum of the returned array is 1
	//	represents a probability map for the occurrence of all values within the sample
	//	NOT cached
	normalize(valueAccessorKey)
	{
		var sum = 0;
		var result = [];
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var value = this.getAt(i, valueAccessorKey) || 0;
			sum += value;
			result.push(value);
		};
		for (var length = result.length, i = 0; i < length; ++i) result[i] /= sum;
		return result;
	}

	//	cached
	derivativeSample(valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!this.length) return this.clone();

		//	{ valueAccessorKey_x + "*" + valueAccessorKey_y: derivative }
		if (!this._derivativeCache) this._derivativeCache = {};
		var cacheKey = valueAccessorKey_x + '*' + valueAccessorKey_y;
		var cachedValue = this._derivativeCache[cacheKey];
		if (cachedValue !== void (0)) return new MappedArray(cachedValue);

		var cachedValue = [];
		var prevX = this.getAt(0, valueAccessorKey_x);
		var prevY = this.getAt(0, valueAccessorKey_y);
		for (var length = this.length, i = 1; i < length; ++i)
		{
			var x = this.getAt(i, valueAccessorKey_x);
			var y = this.getAt(i, valueAccessorKey_y);
			var deltaX = prevX - x;
			var deltaY = prevY - y;
			var resultItem = {};
			resultItem[valueAccessorKey_x] = x;
			resultItem[valueAccessorKey_y] = deltaY / deltaX;
			cachedValue.push(resultItem);
			prevX = x;
			prevY = y;
		}

		this._derivativeCache[cacheKey] = cachedValue;
		return new MappedArray(cachedValue);
	}

	//	cached
	stat(valueAccessorKey)
	{
		if (!this._data.length) return null;

		//	{ valueAccessorKey: meanValue }
		if (!this._statCache) this._statCache = {};
		var cachedValue = this._statCache[valueAccessorKey];
		if (cachedValue !== void (0)) return cachedValue;

		var sum = 0;
		var min = Infinity;
		var max = -Infinity;
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var value = this.getAt(i, valueAccessorKey);
			sum += value;
			if (min > value) min = value;
			if (max < value) max = value;
		}
		cachedValue =
		{
			mean: sum / this._data.length,
			min: min,
			max: max,
		};
		this._statCache[valueAccessorKey] = cachedValue;
		return cachedValue;
	}

	//	cached
	mean(valueAccessorKey)
	{
		if (!this._data.length) return 0;
		return this.stat(valueAccessorKey).mean;
	}

	//	cached
	min(valueAccessorKey)
	{
		if (!this._data.length) return 0;
		return this.stat(valueAccessorKey).min;
	}

	//	cached
	max(valueAccessorKey)
	{
		if (!this._data.length) return 0;
		return this.stat(valueAccessorKey).max;
	}


	//	https://www.khanacademy.org/math/ap-statistics/bivariate-data-ap/correlation-coefficient-r/v/calculating-correlation-coefficient-r?modal=1
	//	cached
	standardDeviation(valueAccessorKey)
	{
		if (this._data.length < 2) return 0;

		//	{ valueAccessorKey: standardDeviationValue }
		if (!this._standardDeviationCache) this._standardDeviationCache = {};
		var cachedValue = this._standardDeviationCache[valueAccessorKey];
		if (cachedValue !== void (0)) return cachedValue;

		var mean = this.mean(valueAccessorKey);
		var sum = 0;
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var value = this.getAt(i, valueAccessorKey);
			var residual = value - mean;
			sum += residual * residual;
		}
		cachedValue = Math.sqrt(sum / (this._data.length - 1));
		this._standardDeviationCache[valueAccessorKey] = cachedValue;
		return cachedValue;
	}

	lineOfBestFit(valueAccessorKey_x, valueAccessorKey_y)
	{
		//	{ valueAccessorKey_x + "*" + valueAccessorKey_y: LinearFunction }
		if (!this._lineOfBestFitCache) this._lineOfBestFitCache = {};
		var cacheKey = valueAccessorKey_x + '*' + valueAccessorKey_y;
		var cachedValue = this._lineOfBestFitCache[cacheKey];
		if (cachedValue !== void (0)) return cachedValue;
		cachedValue = LinearFunction.buildLineOfBestFit(this.toArray({ x: valueAccessorKey_x, y: valueAccessorKey_y }));
		this._lineOfBestFitCache[cacheKey] = cachedValue;
		return cachedValue;
	}

	//	https://www.khanacademy.org/math/ap-statistics/bivariate-data-ap/correlation-coefficient-r/v/calculating-correlation-coefficient-r?modal=1
	//	cached
	correlationCoefficient(valueAccessorKey_x, valueAccessorKey_y)
	{
		return Math.abs(this._correlationCoefficient(valueAccessorKey_x, valueAccessorKey_y));
	}

	//	cached
	correlationSign(valueAccessorKey_x, valueAccessorKey_y)
	{
		return Math.sign(this._correlationCoefficient(valueAccessorKey_x, valueAccessorKey_y));
	}

	_correlationCoefficient(valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		if (this._data.length < 2) return 0;

		//	{ valueAccessorKey_x + "*" + valueAccessorKey_y: correlationCoefficient }
		if (!this._correlationCoefficientCache) this._correlationCoefficientCache = {};
		var cacheKey = valueAccessorKey_x + '*' + valueAccessorKey_y;
		var cachedValue = this._correlationCoefficientCache[cacheKey];
		if (cachedValue !== void (0)) return cachedValue;

		var mean_x = this.mean(valueAccessorKey_x);
		var mean_y = this.mean(valueAccessorKey_y);
		var sx = this.standardDeviation(valueAccessorKey_x);
		var sy = this.standardDeviation(valueAccessorKey_y);

		if (!sx) throw "Invalid data (1).";
		if (!sy) throw "Invalid data (2).";

		var sum = 0;
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var x = this.getAt(i, valueAccessorKey_x);
			var y = this.getAt(i, valueAccessorKey_y);
			var factor_x = (x - mean_x) / sx;
			var factor_y = (y - mean_y) / sy;
			sum += factor_x * factor_y;
		}

		cachedValue = sum / (this._data.length - 1);
		//	try to negate the adverse floating imprecision point effect
		if (cachedValue < -1) cachedValue = Math.ceil(cachedValue * 1000000000000000) / 1000000000000000;
		else if (cachedValue > 1) cachedValue = Math.floor(cachedValue * 1000000000000000) / 1000000000000000;
		if (cachedValue < -1 || cachedValue > 1) throw "Assertion failed.";
		this._correlationCoefficientCache[cacheKey] = cachedValue;
		return cachedValue;
	}

	//	biasStrength - good values seem to lie between 1 (weaker bias) and 5 (stronger bias)
	//	TODO: needs more formal analysis of the correlation coefficient calculation algorithm and better algorithm 
	//		adjustment so that the result value always lies in the interval [-1, 1] (currently with higher values of biasStrength the algorithm
	//		produces results that lie outside the definition range and must be trimmed)
	//	cached
	slopeBiasedCorrelationCoefficient(valueAccessorKey_x, valueAccessorKey_y, biasStrength)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		if (this._data.length < 2) return 0;

		//	{ valueAccessorKey_x + "*" + valueAccessorKey_y: slopeBiasedCorrelationCoefficient }
		if (!this._slopeBiasedCorrelationCoefficientCache) this._slopeBiasedCorrelationCoefficientCache = {};
		var cacheKey = valueAccessorKey_x + '*' + valueAccessorKey_y;
		var cachedValue = this._slopeBiasedCorrelationCoefficientCache[cacheKey];
		if (cachedValue !== void (0)) return cachedValue;

		var mean_x = this.mean(valueAccessorKey_x);
		var mean_y = this.mean(valueAccessorKey_y);
		var sx = this.standardDeviation(valueAccessorKey_x);
		var sy = this.standardDeviation(valueAccessorKey_y);

		//	bias code
		var line = this.lineOfBestFit(valueAccessorKey_x, valueAccessorKey_y);
		var sdAngleFactor = this.sdAngleFactor(valueAccessorKey_x, valueAccessorKey_y);
		var firstX = this.getAt(0, valueAccessorKey_x);
		var lastX = this.getAt(this.length - 1, valueAccessorKey_x);
		var middleDistance = (lastX - firstX) / 2;
		//	/bias code

		var sum = 0;
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var x = this.getAt(i, valueAccessorKey_x);
			var y = this.getAt(i, valueAccessorKey_y);

			//	bias code
			var distanceFromStart = x - firstX;
			var distanceFromMiddle = distanceFromStart - middleDistance;
			var normalDistanceFromMiddle = distanceFromMiddle / middleDistance;	//	[-1..1]
			var lineY = line.calc(x);
			var deltaY = y - lineY;
			var biasPower = Math.pow(Math.E, - biasStrength * Math.sign(deltaY) * normalDistanceFromMiddle * sdAngleFactor);
			//	/bias code

			var factor_x = (x - mean_x) / sx;
			//var factor_y = (y - mean_y) / sy;
			//	bias code
			var factor_y = Math.sign((y - mean_y) / sy) * Math.pow(Math.abs((y - mean_y) / sy), biasPower);
			//	/bias code
			sum += factor_x * factor_y;
		}

		cachedValue = sum / (this._data.length - 1);
		//	bias code
		if (cachedValue < -1) cachedValue = -1;
		if (cachedValue > 1) cachedValue = 1;
		//	/bias code
		this._slopeBiasedCorrelationCoefficientCache[cacheKey] = cachedValue;
		return cachedValue;
	}

	//	cached
	standardDeviationOfResiduals(valueAccessorKey_x, valueAccessorKey_y, linedef)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		if (this._data.length < 3) return 0;

		//	{ valueAccessorKey_x + "*" + valueAccessorKey_y: standardDeviationOfResiduals }
		if (!this._standardDeviationOfResidualsCache) this._standardDeviationOfResidualsCache = {};
		var cacheKey = valueAccessorKey_x + '*' + valueAccessorKey_y;
		var cachedValue = this._standardDeviationOfResidualsCache[cacheKey];
		if (cachedValue !== void (0)) return cachedValue;

		var sum = 0;
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var x = this.getAt(i, valueAccessorKey_x);
			var y = this.getAt(i, valueAccessorKey_y);
			var y_fit = linedef.calc(x);
			var r = y - y_fit;
			sum += r * r;
		}

		cachedValue = Math.sqrt(sum / (this._data.length - 2));
		if (cachedValue < 0 || cachedValue > 1) throw "Assertion failed.";
		this._standardDeviationOfResidualsCache[cacheKey] = cachedValue;
		return cachedValue;
	}

	//	cached
	sdAngleFactor(valueAccessorKey_x, valueAccessorKey_y)
	{
		if (this._data.length < 2) return 0;

		//	{ valueAccessorKey_x + "*" + valueAccessorKey_y: sdAngleFactor }
		if (!this._sdAngleFactorCache) this._sdAngleFactorCache = {};
		var cacheKey = valueAccessorKey_x + '*' + valueAccessorKey_y;
		var cachedValue = this._sdAngleFactorCache[cacheKey];
		if (cachedValue !== void (0)) return cachedValue;

		var sx = this.standardDeviation(valueAccessorKey_x);
		var sy = this.standardDeviation(valueAccessorKey_y);

		//	project data in a space where x and y units are x- and y- standard deviations
		var sdPointSample = this.transformSample(function (item)
		{
			//	sx: how many model x fit within one standard deviation x
			//	sy: how many model y fit within one standard deviation y
			return { x: item.x / sx, y: item.y / sy };
		});
		//	sdLine is the line of best fit for this sample projected in a descartes space with Ox and Oy measured in standard deviations
		//	in this space measuring angles makes sense
		var sdLine = LinearFunction.buildLineOfBestFit(sdPointSample.toArray({ x: [valueAccessorKey_x], y: [valueAccessorKey_y] }));
		//var sdStandardDeviationX = sdPointSample.standardDeviation("x");
		//var sdStandardDeviationY = sdPointSample.standardDeviation("y");
		//var sdCorrelationCoefficient = sdPointSample.correlationCoefficient("x", "y");
		var sdAngleFactor = 0;	//	the angle between Ox and the line, [-PI/2, 0) for left angles and [0, PI/2] for right angles
		if (sdLine.angle <= Math.PI / 2) sdAngleFactor = 2 * sdLine.angle / Math.PI;
		else sdAngleFactor = - 2 * (Math.PI - sdLine.angle) / Math.PI;

		cachedValue = sdAngleFactor;
		this._sdAngleFactorCache[cacheKey] = cachedValue;
		return cachedValue;
	}

	//	returns [0..1], where 0 indicates no variability and 1 - maximum variability
	//	indicates the largest movement within the subsample
	//	NOT cached
	variability(valueRange, valueAccessorKey, start, length)
	{
		if (start + length >= this._data.length) throw "Out of range.";
		var subSample = this.subSample(start, length);
		var sdMin = MappedArray.calcSdnormLowerFactor(length) * valueRange.min;
		var sdMax = MappedArray.calcSdnormUpperFactor(length) * valueRange.max;
		var sdRange = sdMax - sdMin;
		var sd = subSample.standardDeviation(valueAccessorKey);
		var result = (sd - sdMin) / sdRange;
		if (result > 1) return 1;
		if (result < 0) return 0;
		return result;
	}

	//	windowSize: count of source datapoints to analyze per output datapoint
	//	returns an array of variability values for a windowSize long data window ending with each datapoint in the sample
	//	NOT cached
	variabilitySample(valueRange, valueAccessorKey_x, valueAccessorKey_y, windowSize)
	{
		var resultArray = [];
		for (var length = this._data.length, windowEnd = windowSize; windowEnd < length; ++windowEnd)
		{
			var resultItem = {};
			resultItem[valueAccessorKey_x] = this._data[windowEnd][valueAccessorKey_x];
			resultItem.value = this.variability(valueRange, valueAccessorKey_y, windowEnd - windowSize, windowSize);
			resultArray.push(resultItem);
		}
		return new MappedArray(resultArray);
	}


	//	builds a table quantifying the movements of the sample, assuming the x-dimension of the sample is discrete
	//		- all values of valueAccessorKey_x are used as array indices, starting from 0 and with step of 1
	//		- missing indices are interperted as zero movements
	//	resolution: how many intervals are used to classify values
	//	bias: anorm for sizing the intervals (bias < 0 will produce shorter intervals closer to 0; bias > 0 will produce shorter intervals closer to 1)
	//	the resulting table contains 2 collections - 1 for positive and one for negative movements, and one single value for zero movements
	//		- all sample movements are mapped to one of the classification intervals
	//	NOT cached
	q2table(resolution, bias, valueAccessorKey_x, valueAccessorKey_y)
	{
		var result =
		{
			resolution: resolution,
			bias: bias,
			Q_neg: [],
			Q_zero: null,
			Q_pos: [],

			incAtN(n)
			{
				if (!n)
				{
					if (!this.Q_zero) this.Q_zero = 0;
					++this.Q_zero;
				}
				else if (n < 0)
				{
					if (!this.Q_neg[-n - 1]) this.Q_neg[-n - 1] = 0;
					++this.Q_neg[-n - 1];
				}
				else
				{
					if (!this.Q_pos[n - 1]) this.Q_pos[n - 1] = 0;
					++this.Q_pos[n - 1];
				}
			},
			quantify(value)
			{
				if (value < -1 || value > 1) throw "Argument is invalid: value.";
				var s = Math.sign(value);
				var v = Math.abs(value);
				return s * Math.ceil(this.resolution * MappedArray.fnorm(this.bias, v) / 2);
			}
		};

		var movementSample = new MappedArray(this.movements(valueAccessorKey_x, valueAccessorKey_y));
		var movementsNormalized = movementSample.normalizeWithinSpread();
		for (var length = movementsNormalized.length, i = 0; i < length; ++i)
		{
			var d = movementsNormalized[i];
			var qn = result.quantify(d);
			result.incAtN(qn);
		}

		var sum = result.Q_zero;
		for (var length = result.Q_neg.length, i = 0; i < length; ++i) sum += (result.Q_neg[i] || 0);
		for (var length = result.Q_pos.length, i = 0; i < length; ++i) sum += (result.Q_pos[i] || 0);

		result.Q_zero = (result.Q_zero || 0) / sum;
		for (var length = result.Q_neg.length, i = 0; i < length; ++i) result.Q_neg[i] = (result.Q_neg[i] || 0) / sum;
		for (var length = result.Q_pos.length, i = 0; i < length; ++i) result.Q_pos[i] = (result.Q_pos[i] || 0) / sum;

		return result;
	};

	//	options: {excludePeaks: bool, excludeValleys: bool, oneSided: bool, splitLine: LinearFunction}
	//	defaults
	//		options.singlePoints: false
	//		options.excludePeaks: false
	//		options.excludeValleys: false
	//		options.oneSided: false	- skip peaks below and valleys above the splitLine
	//		options.oneSided_strict: false - also skip peaks with next point below and valleys with next point above the splitLine
	//		options.splitLine: null
	//		options.epsylon: null - used only with options.oneSided: true
	//		options.start: null - will start looking from this index (forwards or backwards, depending on options.inverse)
	//		options.limit: null - will stop looking for limits after all resulting samples have at least options.limit extremums in them
	//		options.inverse: false - significant when combined with start and limit
	//	return
	//	{
	//		peaks: MappedArray,
	//		valleys: MappedArray,
	//		extremums: MappedArray,
	//	}
	//	if options.singlePoints is false, populates the extremum collections with triplets of datapoints: prev dp, extremum dp, next dp
	//	NOT cached

	// TODO: reimplement with moving window
	// TODO: add Y-tolerance in sd for equality comparison

	extremumSamples(valueAccessorKey_x, valueAccessorKey_y, options)
	{
		var triplets = options ? !options.singlePoints : true;
		var includePeaks = options ? !options.excludePeaks : true;
		var includeValleys = options ? !options.excludeValleys : true;
		var oneSided = options ? options.oneSided : false;
		var oneSided_strict = options ? options.oneSided_strict : false;
		var splitLine = options ? options.splitLine : null;
		var epsylon = options ? options.epsylon : null;
		var start = options ? options.start: null;
		var limit = options ? options.limit: null;
		var forward = options ? !options.inverse : true;

		if (oneSided && !splitLine) throw "Argument is null: options.splitLine";

		var result =
		{
			peaks: new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey),
			valleys: new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey),
			extremums: new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey),
		};

		if (this._data.length < 3)
		{
			return result;
		}

		var i0 = forward ? (start || 0) : (start || this._data.length - 1);
		var iterate = function (step)
		{
			if (forward)
			{
				for (var length = this._data.length - 1, i = i0 + 1; i < length; ++i) if (step(i - 1, i, i + 1)) break;
			}
			else
			{
				for (var i = i0 - 1; i >= 1; --i) if (step(i + 1, i, i - 1)) break;
			}
		}.bind(this);

		var add = function (coll, item)
		{
			if (forward) coll.push(item);
			else coll.unshift(item);
		}.bind(this);

		iterate(function step(h, i, j)
		{
			var item = this._data[i];

			var current = this.getAt(i, valueAccessorKey_y);
			var last = this.getAt(i - 1, valueAccessorKey_y);
			var next = this.getAt(i + 1, valueAccessorKey_y);

			if (last <= current && next <= current)			//	peak
			{
				if (!includePeaks) return;
				if (oneSided)
				{
					var point =
					{
						x: this.getAt(i, valueAccessorKey_x),
						y: current,
					}
					if (!splitLine.isBelowPoint(point, epsylon)) return;
					if (oneSided_strict)
					{
						var nextPoint =
						{
							x: this.getAt(i + 1, valueAccessorKey_x),
							y: next,
						};
						//log(453, new Date(nextPoint.x), nextPoint.x, nextPoint.y, splitLine.isBelowPoint(nextPoint), splitLine, splitLine.calc(nextPoint.x));
						if (!splitLine.isBelowPoint(nextPoint, epsylon)) return;
					}
				}
				if (triplets) add(result.peaks._data, this._data[h]);
				add(result.peaks._data, item);
				if (triplets) add(result.peaks._data, this._data[j]);
			}
			else if (last >= current && next >= current)	//	valley
			{
				if (!includeValleys) return;
				if (oneSided)
				{
					var point =
					{
						x: this.getAt(i, valueAccessorKey_x),
						y: current,
					}
					if (splitLine.isBelowPoint(point, epsylon)) return;
					if (oneSided_strict)
					{
						var nextPoint =
						{
							x: this.getAt(i + 1, valueAccessorKey_x),
							y: next,
						};
						if (splitLine.isBelowPoint(nextPoint, epsylon)) return;
					}
				}
				if (triplets) add(result.valleys._data, this._data[h]);
				add(result.valleys._data, item);
				if (triplets) add(result.valleys._data, this._data[j]);
			}
			else return;

			if (triplets) add(result.extremums._data, this._data[h]);
			add(result.extremums._data, item);
			if (triplets) add(result.extremums._data, this._data[j]);

			if (limit !== null && (includePeaks || includeValleys))
			{
				var peakCount = triplets ? result.peaks._data.length / 3 : result.peaks._data.length;
				var valleyCount = triplets ? result.valleys._data.length / 3 : result.valleys._data.length;
				if (includePeaks && !includeValleys) if (peakCount >= limit) return true;
				if (!includePeaks && includeValleys) if (valleyCount >= limit) return true;
				if (includePeaks && includeValleys) if (valleyCount >= limit && peakCount >= limit) return true;
			}
		}.bind(this));

		return result;
	}

	smoothSample(windowLength, valueAccessorKey)
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);
		var windowSum = 0;
		var smoothValuePropertyName = "__p" + newLUID();
		result._valueAccessors[valueAccessorKey] = (item) => item[smoothValuePropertyName];
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var value = this.getAt(i, valueAccessorKey);
			windowSum += value;
			if (i >= windowLength) windowSum -= this.getAt(i - windowLength, valueAccessorKey);
			if (i < windowLength - 1) continue;
			var smoothedItem = Object.assign({}, this.getAt(i - Math.ceil(windowLength / 2)));
			smoothedItem[smoothValuePropertyName] = windowSum / windowLength;
			result._data.push(smoothedItem);
		}
		return result;
	}

	gaussianSmoothenSample(instensity, valueAccessorKey)
	{
		var result = new MappedArray([], Object.assign({}, this._valueAccessors), this._defaultValueAccessorKey);

		var kernelSize = 4;
		if (this.length <= 2 * kernelSize + 1) return result;

		var values = this.toValueArray(valueAccessorKey);
		var smoothValues = Taira.smoothen(values, Taira.ALGORITHMS.GAUSSIAN, kernelSize, instensity, false);

		var smoothValuePropertyName = "__p" + newLUID();
		result._valueAccessors[valueAccessorKey] = (item) => item[smoothValuePropertyName];
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var smoothedItem = Object.assign({}, this.getAt(i));
			smoothedItem[smoothValuePropertyName] = smoothValues[i];
			result._data.push(smoothedItem);
		}
		return result;
	}

	//	NOT cached
	transformSample(transformItem, valueAccessors, defaultValueAccessorKey)
	{
		var result = new MappedArray([], valueAccessors || Object.assign({}, this._valueAccessors), defaultValueAccessorKey || this._defaultValueAccessorKey);
		for (var length = this._data.length, i = 0; i < length; ++i) result._data.push(transformItem(this._data[i], i));
		return result;
	}

	//	NOT cached
	transformItems(transformItem)
	{
		for (var length = this._data.length, i = 0; i < length; ++i)
		{
			var tansformedItem = transformItem(this._data[i], i);
			if (tansformedItem !== void (0)) this._data[i] = tansformedItem;
		}
	}

	//	NOT cached
	indexOf(testItem)
	{
		if (!testItem) throw "Argument is null: testItem.";
		for (var length = this._data.length, i = 0; i < length; ++i) if (testItem(this._data[i], i)) return i;
		return -1;
	}

	//	NOT cached
	find(value, valueAccessorKey)
	{
		return this.indexOf((item, i) => this.getAt(i, valueAccessorKey) == value);
	}

	//	NOT cached
	scaleSample(valueAccessorKey_x, scalex, valueAccessorKey_y, scaley)
	{
		var result = this.transformSample(function (item, i)
		{
			var result = {};
			result["i"] = i;
			result[valueAccessorKey_x] = this.getAt(i, valueAccessorKey_x) * scalex;
			result[valueAccessorKey_y] = this.getAt(i, valueAccessorKey_y) * scaley;
			return result;
		}.bind(this));
		delete result._valueAccessors;
		delete result._defaultValueAccessorKey;
		return result;
	}

	sdScaleSample(valueAccessorKey_x, valueAccessorKey_y)
	{
		var sdx = this.standardDeviation("x");
		var sdy = this.standardDeviation("y");
		return this.scaleSample(valueAccessorKey_x, 1 / sdx, valueAccessorKey_y, 1 / sdy);
	}

	//	calculates infos aabout LD50 (with 50 replaced with param) for the sample
	//	valueAccessorKey must be pointing to a sortablecolumn
	//	NOT cached
	ldNInfo(n, valueAccessorKey)
	{
		if (this.length < 2) return {

			index: 0,
			value: 0,
			sample: this.clone(),
		};

		var result =
		{
			index: null,
			value: null,
			sample: null,
		};

		//	result.index
		result.index = Math.ceil(this.length * n / 100);
		if (result.index >= this.length) throw "Invalid operation (2).";

		//	result.value
		var data = this._data.slice();
		data.sort((left, right) => this.accessValue(right, valueAccessorKey) - this.accessValue(left, valueAccessorKey));
		result.value = this.accessValue(data[result.index], valueAccessorKey);

		//	sample
		result.sample = new MappedArray(data.slice(result.index), this._valueAccessors, this._defaultValueAccessorKey);

		return result;
	}


	//	x in (-Infinity, +Infinity), y in (0, 1)
	static sigmoid(x)
	{
		//	desmos.com: \frac{1}{\left(1+e^{-x}\right)}
		return 1 / (1 + Math.exp(-x));
	}

	//	x in (0, 1), y in (-Infinity, +Infinity)
	//	not in use here
	static inverseSigmoid(x)
	{
		//	desmos.com: -\ln\left(\frac{1}{x}-1\right)
		return -Math.log(1 / x - 1);
	}

	//	x in (-Infinity, +Infinity), y in (-1, +1)
	static polarSigmoid(x)
	{
		//	desmos.com: \frac{2}{\left(1+e^{-x}\right)}-1
		return 2 / (1 + Math.exp(-x)) - 1;
	}

	//	x in (-1, +1), y in (-Infinity, +Infinity)
	//	not in use here
	static inversePolarSigmoid(x)
	{
		//	desmos.com: -\ln\left(\frac{2}{x+1}-1\right)
		return -Math.log(2 / (x + 1) - 1);
	}

	//	anorm in (-1, +1)
	//	x in [0, 1]
	//	returns [0, 1]
	//	applies left/ right bias, depending on the value of anorm
	//		- anorm < 0 - left bias (convex)
	//		- anorm == 0 - no bias (returns x)
	//		- anorm > 0 - right bias (concave)
	static fnorm(anorm, x)
	{
		if (anorm <= -1 || anorm >= 1) throw "Argument out of range: anorm.";
		if (x < 0 || x > 1) throw "Argument out of range: x.";
		if (anorm == 0) return x;

		var a;
		if (anorm < 0) a = 1 + 1 / anorm;
		else a = 1 / anorm;

		//	desmos.com: -\left(\frac{1.2}{x-1.2}+1\right)\cdot\left(1.2-1\right)
		return -(a / (x - a) + 1) * (a - 1);
	}

	//	the inverse function of fnorm
	static ifnorm(anorm, x)
	{
		return MappedArray.fnorm(-anorm, x);
	}

	//	items: [{weight: Number, value: Number}]
	static calcWeightedAverage(items)
	{
		var weightSum = 0;
		var weightedSum = 0;
		for (var length = items.length, i = 0; i < length; ++i)
		{
			var item = items[i];
			weightSum += item.weight;
			weightedSum += item.weight * item.value;
		}
		return weightedSum / weightSum;
	}

	static calcSdnormUpperFactor(n)
	{
		if (n < 2) return 0;
		if (n == 2) return 0.7071;
		var result = -Math.log((n / 100 - 0.027) * 10000000) / 21 + 1.118;
		if (result > 1) return 1;
		if (result < 0) return 0;
		return result;
	}

	static calcSdnormLowerFactor(n)
	{
		if (n < 2) return 0;
		if (n == 2) return 0.0000015;
		if (n == 3) return 0.0009;
		var result = Math.log((n / 100 - 0.027) * 100000000) / 21 - 0.67;
		if (result > 1) return 1;
		if (result < 0) return 0;
		return result;
	}

	static getExtremumType(points, valueAccessor, epsylon)
	{
		if (points.length < 3) throw "Argument is invalid: points.";
		if (Math.floor(points.length / 2) == points.length / 2) throw "Argument is invalid: points.";

		epsylon = epsylon || 0;

		var ci = Math.floor(points.length / 2);
		var center = points[ci];
		var distances = [];
		for (var length = points.length, i = 0; i < length; ++i)
		{
			if (i == ci) continue;
			var distance;
			if (valueAccessor) distance = center[valueAccessor] - points[i][valueAccessor];
			else distance = center - points[i];
			if (Math.abs(distance) <= epsylon) distance = 0;
			distances.push(Math.sign(distance));
		};
		var leftHigh = false;
		var leftLow = false;
		var rightHigh = false;
		var rightLow = false;
		for (var length = distances.length, hl = distances.length / 2, i = 0; i < length; ++i)
		{
			var distance = distances[i];
			if (!distance) continue;
			if (distance > 0 && i < hl) leftHigh = true;
			if (distance > 0 && i >= hl) rightHigh = true;
			if (distance < 0 && i < hl) leftLow = true;
			if (distance < 0 && i >= hl) rightLow = true;
		}
		if (leftHigh && leftLow) return 0;
		if (rightHigh && rightLow) return 0;
		if (leftHigh && rightHigh) return 1;
		if (leftLow && rightLow) return -1;
		return 0;
	}

	static getMovementType(points, valueAccessor, epsylon)
	{
		if (points.length < 2) throw "Argument is invalid: points.";

		epsylon = epsylon || 0;

		var first = points[0];
		if (valueAccessor) first = first[valueAccessor];
		var last = points[points.length - 1];
		if (valueAccessor) last = last[valueAccessor];
		if (Math.abs(last - first) <= epsylon) return 0;

		var direction = Math.sign(last - first);
		for (var length = points.length - 1, i = 1; i < length; ++i)
		{
			var fd;
			if (valueAccessor) fd = first[valueAccessor] - points[i][valueAccessor];
			else fd = points[i] - first;
			if (Math.abs(fd) > epsylon && Math.sign(fd) != direction) return 0;

			var ld;
			if (valueAccessor) ld = last[valueAccessor] - points[i][valueAccessor];
			else ld = last - points[i];
			if (Math.abs(ld) > epsylon && Math.sign(ld) != direction) return 0;
		};
		return direction;
	}


	static std_relative_table()
	{
		var gen = (count, max) =>	
		{
			var result = [];
			for (var i = 1; i <= count; ++i) result.push({ x: Math.random() * max });
			return result;
		};
		var genLinear = (count, max) =>	
		{
			var result = [];
			var valueStep = max / count;
			for (var i = 1; i <= count; ++i) result.push({ x: i * valueStep });
			return result;
		};
		var genFlat = (count, value) =>	
		{
			var result = [];
			for (var i = 1; i <= count; ++i) result.push({ x: value });
			return result;
		};

		var max = 100;
		var resultMin = [];
		var resultMax = [];
		for (var jlength = 100, j = 0; j < jlength; ++j)
		{
			log("j", j, "of", jlength);
			var minSdt_relative = Infinity;
			var maxSdt_relative = -Infinity;
			var sampleSize = j;
			for (var experimentCount = 100000, i = 0; i < experimentCount; ++i)
			{
				var sample = new MappedArray(gen(sampleSize, max));
				var std_relative = sample.standardDeviation("x") / max;
				maxSdt_relative = Math.max(maxSdt_relative, std_relative);
				minSdt_relative = Math.min(minSdt_relative, std_relative);
			}

			var sample = new MappedArray(genLinear(j, max));
			var std_relative = sample.standardDeviation("x") / max;
			maxSdt_relative = Math.max(maxSdt_relative, std_relative);

			var sample = new MappedArray(genFlat(j, max));
			var std_relative = sample.standardDeviation("x") / max;
			minSdt_relative = Math.max(minSdt_relative, std_relative);

			resultMax.push(maxSdt_relative);
			resultMin.push(minSdt_relative);
		}
		return {
			resultMin: resultMin,
			resultMax: resultMax,
		};
	}


	get length()
	{
		return this._data.length;
	}

	get valueAccessors()
	{
		return this._valueAccessors;
	}

	get defaultValueAccessorKey()
	{
		return this._defaultValueAccessorKey;
	}
}

MappedArray.table_sdUpperBoundRatio =
[
	0, 0, 0.7066101721833479, 0.5664790664521209, 0.5568211370309475, 0.5251670358158426, 0.5077221795028702, 0.4842730105944406, 0.4667840860211573, 0.46297833513678216, 0.45769581734943215, 0.4372156314356321, 0.4301658214355196, 0.42896945397502095, 0.4225610260856278, 0.42930214673497136, 0.4277577750935708, 0.4203630398938937, 0.4091939798293885, 0.4016363887028559, 0.4062516867487387, 0.4062353640525236, 0.3944239847382047, 0.397843329964878, 0.39957187697642454, 0.3983068444702682, 0.3935727614529364, 0.3968295513698075, 0.3902374141468996, 0.3853559620099024, 0.38124321863955557, 0.3834458264857814, 0.395740471152706, 0.3947809002874919, 0.3754089351108484, 0.38852071794139775, 0.37497216729044297, 0.3795281519018877, 0.3832730482571962, 0.36858998064610676, 0.3810111449955614, 0.373014698964116, 0.37003653136554404, 0.3654939669472468, 0.3728313783471734, 0.36791123436211914, 0.38007289010245165, 0.36216562453344353, 0.3648248868432703, 0.3738335746987691, 0.3666140769792359, 0.36088364419525926, 0.3574417885668538, 0.35944721159598475, 0.3629734793932458, 0.35537330245138554, 0.35966049267577466, 0.35179074889084005, 0.35829992308626624, 0.3551577412092628, 0.35587502185632075, 0.3577522998348986, 0.35749837141294194, 0.3577732874427786, 0.35796216461650027, 0.35541605853350744, 0.35575945264621933, 0.34846679785450035, 0.3518023831862401, 0.36073523801495355, 0.3528050996077555, 0.3520219893522458, 0.34720175587757907, 0.36242643514186446, 0.3478516764457712, 0.34818398610025847, 0.3547852847760349, 0.3456513711215932, 0.353979911588807, 0.3436862631774854, 0.3520572798863785, 0.34944280407097567, 0.349037877590278, 0.3470123931402847, 0.3434784699028172, 0.34621774586034343, 0.35050798479945144, 0.3440674906795895, 0.34609287666749844, 0.34430220775471165, 0.34545960884167615, 0.3507142345804322, 0.34027605640980174, 0.3506782858778417, 0.34114741307872576, 0.34541636625262756, 0.34297242806258593, 0.34310590475566466, 0.34320382336998867, 0.3461026781571617
];

MappedArray.table_sdLowerBoundRatio =
[
	0, 0, 0.0000014949890202765457, 0.0008616202659149646, 0.00475923879924107, 0.016925453322443263, 0.023767809090665875, 0.04640001707636289, 0.05138160194674707, 0.057339362069936596, 0.06028473770439013, 0.048557866633444725, 0.10563921099208183, 0.09464591279360718, 0.11998984898427148, 0.10967879317810046, 0.09960285550163339, 0.12425006629419404, 0.12876396202470727, 0.12581530307267041, 0.12761033247937711, 0.14946481798488073, 0.1496283806790933, 0.1352737520242736, 0.1487073509734417, 0.14292564006795272, 0.16715548968854235, 0.13934907645926844, 0.16491468927138683, 0.16756310241161224, 0.15628331204273618, 0.1724440409019682, 0.16846013144977082, 0.17234845061983953, 0.18234093917797914, 0.18142111612091383, 0.18414061865592898, 0.18427179030879945, 0.18327290295342283, 0.17446436156290965, 0.18314923375347356, 0.19253596918538401, 0.19506518840774323, 0.19462538251738845, 0.19337739782562793, 0.19498750865572295, 0.19538086495590598, 0.19892914463427863, 0.1954341757945014, 0.19748479082363524, 0.19275578302924296, 0.2037846767418657, 0.20210005153186233, 0.20955743458417023, 0.20663765633854272, 0.19887232611650985, 0.1916182003618118, 0.20532033481246226, 0.21258830283352675, 0.20784412043551703, 0.21147272130408531, 0.21012835235766225, 0.20804623715141024, 0.21840361493171578, 0.20882001580722975, 0.21480406709352548, 0.21612602622068328, 0.21599199964383234, 0.21428753782278723, 0.20297192610613557, 0.21828725385014353, 0.21463410721213563, 0.2213970389671735, 0.21548919470664946, 0.21907398211175189, 0.21876814661795435, 0.2104105523386691, 0.21844110698945124, 0.22143199742115546, 0.21992555046640333, 0.22058126262535624, 0.22075287681667144, 0.22724289995977448, 0.22130774208722268, 0.219311319765522, 0.22627641328568832, 0.2280660047536934, 0.22642648675099156, 0.22806287637994035, 0.22927083808099116, 0.22546617917831926, 0.22578910602302066, 0.2275063278466921, 0.22670042466161178, 0.22738711081776525, 0.22446592587807285, 0.22033385835131175, 0.2282642688956856, 0.23092039438730091, 0.22976847858385746
];
