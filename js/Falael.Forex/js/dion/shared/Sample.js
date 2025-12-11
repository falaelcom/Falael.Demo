"use strict";

const Range = require("@shared/Range.js");
const ArrayView = require("@shared/ArrayView.js");
const LinearFunction = require("@shared/LinearFunction.js");

module.exports =

class Sample
{
	constructor(arg, cached)
	{
		this._arrayView = ArrayView.wrap(arg);
		if (this._arrayView.length < 1024) this._cached = !!cached;
		else this._cached = true;

		if (cached) this._cache = {};
	}

	static wrap(arg, cached)
	{
		if (arg instanceof Sample)
		{
			if (cached !== void (0) && arg._cached != cached)
			{
				arg = arg.clone();
				arg._cached = cached;
			}
			return arg;
		}
		return new Sample(ArrayView.wrap(arg), cached);
	}

	clone()
	{
		const result = new Sample(arg, cached);
		result._cache = this._cache;
		return result;
	}


	stat(valueAccessorKey)
	{
		const self = this;
		return this._cache_get(Sample._CacheBuckets.stat, valueAccessorKey || null, () =>
		{
			if (!self._arrayView.length) return null;

			let sum = 0;
			let min = Infinity;
			let max = -Infinity;
			for (let length = self._arrayView.length, i = 0; i < length; ++i)
			{
				const value = self._arrayView.get(i, valueAccessorKey);
				sum += value;
				if (min > value) min = value;
				if (max < value) max = value;
			}
			return {
				mean: sum / self._arrayView.length,
				min: min,
				max: max,
				range: new Range(min, max),
			};
		});
	}

	mean(valueAccessorKey)
	{
		if (!this._arrayView.length) return 0;
		return this.stat(valueAccessorKey).mean;
	}

	min(valueAccessorKey)
	{
		if (!this._arrayView.length) return 0;
		return this.stat(valueAccessorKey).min;
	}

	max(valueAccessorKey)
	{
		if (!this._arrayView.length) return 0;
		return this.stat(valueAccessorKey).max;
	}

	range(valueAccessorKey)
	{
		if (!this._arrayView.length) return 0;
		return this.stat(valueAccessorKey).range;
	}

	lineOfBestFit(valueAccessorKey_x, valueAccessorKey_y)
	{
		const self = this;
		return this._cache_get(Sample.__CacheBuckets.lineOfBestFit, this._cached ? valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			if (self._arrayView.length < 2) return null;
			const points = self._arrayView.map((m, i, arv) => ({ x: arv.valueOf(m, valueAccessorKey_x), y: arv.valueOf(m, valueAccessorKey_y) }));
			return LinearFunction.buildLineOfBestFit(points);
		});
	}

	standardDeviationOfResiduals(valueAccessorKey_x, valueAccessorKey_y)
	{
		const self = this;
		return this._cache_get(Sample._CacheBuckets.standardDeviationOfResiduals, this._cached ? valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			if (self._arrayView.length < 2) return 0;
			const linedef = self.lineOfBestFit(valueAccessorKey_x, valueAccessorKey_y);
			return Sample.standardDeviationOfResiduals(self._arrayView, linedef, valueAccessorKey_x, valueAccessorKey_y);
		});
	}

	standardDeviation(valueAccessorKey)
	{
		const self = this;
		return this._cache_get(Sample._CacheBuckets.standardDeviation, valueAccessorKey || null, () =>
		{
			if (self._arrayView.length < 2) return 0;

			let mean = self.mean(valueAccessorKey);
			let sum = 0;
			for (let length = self._arrayView.length, i = 0; i < length; ++i)
			{
				const value = self._arrayView.get(i, valueAccessorKey);
				const residual = value - mean;
				sum += residual * residual;
			}
			return Math.sqrt(sum / (self._arrayView.length - 1));
		});
	}

	correlationCoefficient(valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const self = this;
		return this._cache_get(Sample._CacheBuckets.correlationCoefficient, this._cached ? valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			if (self._arrayView.length < 2) return NaN;

			const mean_x = self.mean(valueAccessorKey_x);
			const mean_y = self.mean(valueAccessorKey_y);
			const sx = self.standardDeviation(valueAccessorKey_x);
			const sy = self.standardDeviation(valueAccessorKey_y);

			if (!sx) throw "Invalid data (1).";
			if (!sy) throw "Invalid data (2).";

			let sum = 0;
			for (let length = self._arrayView.length, i = 0; i < length; ++i)
			{
				const x = self._arrayView.get(i, valueAccessorKey_x);
				const y = self._arrayView.get(i, valueAccessorKey_y);
				const factor_x = (x - mean_x) / sx;
				const factor_y = (y - mean_y) / sy;
				sum += factor_x * factor_y;
			}

			let result = sum / (self._arrayView.length - 1);

			//	try to negate the adverse floating point imprecision effect
			if (result < -1) result = Math.ceil(result * 1000000000000000) / 1000000000000000;
			else if (result > 1) result = Math.floor(result * 1000000000000000) / 1000000000000000;
			if (result < -1 || result > 1) throw "Assertion failed.";

			return result;
		});
	}

	//	NOT TESTED
	//	https://en.wikipedia.org/wiki/Total_sum_of_squares
	totalSumOfSquares(valueAccessorKey)
	{
		const self = this;
		return this._cache_get(Sample._CacheBuckets.totalSumOfSquares, this._cached ? valueAccessorKey : null, () =>
		{
			if (self._arrayView.length < 1) return NaN;

			const mean = self.mean(valueAccessorKey);

			let sum = 0;
			for (let length = self._arrayView.length, i = 0; i < length; ++i)
			{
				const v = self._arrayView.get(i, valueAccessorKey);
				sum += (v - mean) * (v - mean);
			}
			return sum;
		});
	}

	//	NOT TESTED
	//	https://en.wikipedia.org/wiki/Explained_sum_of_squares
	explainedSumOfSquares(valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const self = this;
		return this._cache_get(Sample._CacheBuckets.explainedSumOfSquares, this._cached ? valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			if (self._arrayView.length < 1) return NaN;

			const mean_x = self.mean(valueAccessorKey_x);
			const linedef = self.lineOfBestFit(valueAccessorKey_x, valueAccessorKey_y);

			let sum = 0;
			for (let length = self._arrayView.length, i = 0; i < length; ++i)
			{
				const x = self._arrayView.get(i, valueAccessorKey_x);
				const y = linedef.calc(x);
				sum += (y - mean_x) * (y - mean_x);
			}
			return sum;
		});
	}

	//	NOT TESTED - generates unexpected values, most likely is not correct
	//	https://en.wikipedia.org/wiki/Coefficient_of_determination
	coefficientOfDetermination(valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const self = this;
		return this._cache_get(Sample._CacheBuckets.coefficientOfDetermination, this._cached ? valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			if (self._arrayView.length < 2) return NaN;

			const sstot_x = self.totalSumOfSquares(valueAccessorKey_x);
			const ssreg = self.explainedSumOfSquares(valueAccessorKey_x, valueAccessorKey_y);
			return ssreg / sstot_x;
		});
	}

	variability(valueAccessorKey)
	{
		const self = this;
		return this._cache_get(Sample._CacheBuckets.variability, this._cached ? valueAccessorKey || null : null, () =>
		{
			const range = self.range(valueAccessorKey).length;
			const sdMin = Sample.sdLowerBoundRatio(self.length) * range;
			const sdMax = Sample.sdUpperBoundRatio(self.length) * range;
			const sdRange = sdMax - sdMin;
			const sd = self.standardDeviation(valueAccessorKey);
			const result = (sd - sdMin) / sdRange;
			if (result > 1) return 1;
			if (result < 0) return 0;
			return result;
		});
	}

	//	returns an array of variability values for a windowSize long data window ending with each datapoint in the sample
	variabilityArray(windowSize, valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = this._arrayView;
		return this._cache_get(Sample._CacheBuckets.variabilityArray, this._cached ? windowSize + '*' + valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			return Sample.variabilityArray(arv, windowSize, valueAccessorKey_x, valueAccessorKey_y);
		});
	}

	stepMovements(distanceDpCount, valueAccessorKey)
	{
		const arv = this._arrayView;
		return this._cache_get(Sample._CacheBuckets.stepMovements, this._cached ? (distanceDpCount || 1) + '*' + (valueAccessorKey || 0) : null, () =>
		{
			return Sample.stepMovements(arv, distanceDpCount, valueAccessorKey);
		});
	}

	movements(distances_x, valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!distances_x) throw "Argument is null: distances_x.";
		if (!distances_x.length) throw "Argument is invalid: distances_x.";
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = this._arrayView;
		return this._cache_get(Sample._CacheBuckets.variabilityArray, this._cached ? distances_x + '*' + valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			return Sample.movements(arv, distances_x, valueAccessorKey_x, valueAccessorKey_y);
		});
	}

	derivative(arg, valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = this._arrayView;
		return this._cache_get(Sample._CacheBuckets.derivative, this._cached ? valueAccessorKey_x + '*' + valueAccessorKey_y : null, () =>
		{
			return Sample.derivative(arv, valueAccessorKey_x, valueAccessorKey_y);
		});
	}


	_cache_get(bucketKey, itemKey, calculate)
	{
		if (!this._cache) return calculate();
		let bucket = this._cache[bucketKey];
		if (!bucket) this._cache[bucketKey] = bucket = {};
		let value = bucket[itemKey];
		if (value === void (0)) bucket[itemKey] = value = calculate();
		return value;
	}


	get arrayView()
	{
		return this._arrayView;
	}

	get cached()
	{
		return this._cached;
	}

	get length()
	{
		return this._arrayView.length;
	}


	/////////////////////////////////////////////
	//	basic

	static stat(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).stat(valueAccessorKey);
	}

	static mean(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).mean(valueAccessorKey);
	}

	static min(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).min(valueAccessorKey);
	}

	static max(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).max(valueAccessorKey);
	}

	static range(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).range(valueAccessorKey);
	}

	static standardDeviation(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).standardDeviation(valueAccessorKey);
	}

	static correlationCoefficient(arg, valueAccessorKey_x, valueAccessorKey_y)
	{
		return Sample.wrap(arg).correlationCoefficient(valueAccessorKey_x, valueAccessorKey_y);
	}


	static sum(arg, valueAccessorKey)
	{
		const arv = ArrayView.wrap(arg);
		let result = 0;
		for (let length = arv.length, i = 0; i < length; ++i) result += arv.get(i, valueAccessorKey);
		return result;
	}


	/////////////////////////////////////////////
	//	analysis

	//	returns
	//		-1 - valley
	//		0 - not an extremum
	//		1 - peak
	static classifyExtremum(arg, valueAccessorKey, epsylon)
	{
		const arv = ArrayView.wrap(arg);
		if (arv.length < 3) throw "Argument is invalid: points.";
		if (Math.floor(arv.length / 2) == arv.length / 2) throw "Argument is invalid: points.";

		epsylon = epsylon || 0;

		const ci = Math.floor(arv.length / 2);
		const centerValue = arv.get(ci, valueAccessorKey);
		const distances = [];
		for (let length = arv.length, i = 0; i < length; ++i)
		{
			if (i == ci) continue;
			let distance = centerValue - arv.get(i, valueAccessorKey);
			if (Math.abs(distance) <= epsylon) distance = 0;
			distances.push(Math.sign(distance));
		};
		let leftHigh = false;
		let leftLow = false;
		let rightHigh = false;
		let rightLow = false;
		for (let length = distances.length, hl = distances.length / 2, i = 0; i < length; ++i)
		{
			const distance = distances[i];
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

	//	returns
	//		-1 - decline
	//		0 - not an uniform movement
	//		1 - increase
	static classifyMovement(arg, valueAccessorKey, epsylon)
	{
		const arv = ArrayView.wrap(arg);
		if (arv.length < 2) throw "Argument is invalid: points.";

		epsylon = epsylon || 0;

		const first = arv.first(valueAccessorKey);
		const last = arv.last(valueAccessorKey);
		if (Math.abs(last - first) <= epsylon) return 0;

		const direction = Math.sign(last - first);
		for (let length = arv.length - 1, i = 1; i < length; ++i)
		{
			const fd = arv.get(i, valueAccessorKey) - first;
			if (Math.abs(fd) > epsylon && Math.sign(fd) != direction) return 0;

			const ld = last - arv.get(i, valueAccessorKey);
			if (Math.abs(ld) > epsylon && Math.sign(ld) != direction) return 0;
		};
		return direction;
	}

	static weightedAverage(arg, valueAccessorKey, weightAccessorKey)
	{
		if (!valueAccessorKey) throw "Argument is null: valueAccessorKey.";
		if (!weightAccessorKey) throw "Argument is null: weightAccessorKey.";

		const arv = ArrayView.wrap(arg);

		let weightSum = 0;
		let weightedSum = 0;
		for (let length = arv.length, i = 0; i < length; ++i)
		{
			const value = arv.get(i, valueAccessorKey);
			const weight = arv.get(i, weightAccessorKey);
			weightSum += weight;
			weightedSum += weight * value;
		}
		return weightedSum / weightSum;
	}

	//	calculates infos about LD50 (with 50 replaced with param) for the sample
	//	valueAccessorKey must be pointing to a sortable column
	//	NOT TESTED
	static ldNInfo(arg, n, valueAccessorKey)
	{
		if (n < 0) throw "Argument is invalid: n.";
		if (n > 100) throw "Argument is invalid: n.";

		const arv = ArrayView.wrap(arg);

		if (arv.length < 2) return {

			index: 0,
			value: 0,
			arr: null,
		};

		const result =
		{
			index: null,
			value: null,
			arr: null,
		};

		result.index = Math.ceil(arv.length * n / 100);
		result.arr = arv.sortedArray((l, r) => arv.valueOf(r, valueAccessorKey) - arv.valueOf(l, valueAccessorKey));
		result.value = arv.valueOf(result.arr[result.index], valueAccessorKey);

		return result;
	}

	//	returns [0..1], where 0 indicates no variability and 1 - maximum variability
	//	actually returns a normalized standard deviation 
	static variability(arg, valueAccessorKey)
	{
		return Sample.wrap(arg).variability(valueAccessorKey);
	}

	static variabilityArray(arg, windowSize, valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = ArrayView.wrap(arg);

		const result = [];
		for (let length = arv.length, windowEnd = windowSize; windowEnd < length; ++windowEnd)
		{
			const resultItem = {};
			resultItem[valueAccessorKey_x] = arv.get(windowEnd - 1, valueAccessorKey_x);
			resultItem.v = new Sample(arv.extract(windowEnd - windowSize, windowSize)).variability(valueAccessorKey_y);
			result.push(resultItem);
		}
		return result;
	}

	static stepMovements(arg, distanceDpCount, valueAccessorKey)
	{
		distanceDpCount = distanceDpCount || 1;
		const arv = ArrayView.wrap(arg);
		const result = [];
		for (let lenth = arg.length, i = distanceDpCount; i < length; ++i) result.push(arv.get(i, valueAccessorKey) - arv.get(i - distanceDpCount, valueAccessorKey));
		return result;
	}

	//	distances_x - a list of x-distances to measure y-movements upon
	//	valueAccessorKey_mindy, valueAccessorKey_maxdy the names of the properties to put the largest movements during the measured distance
	//	returns an array of arrays, one subarray per distances_x item
	static movements(arg, distances_x, valueAccessorKey_x, valueAccessorKey_y, valueAccessorKey_mindy, valueAccessorKey_maxdy)
	{
		if (!distances_x) throw "Argument is null: distances_x.";
		if (!distances_x.length) throw "Argument is invalid: distances_x.";
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = ArrayView.wrap(arg);

		const result = [];
		let klength = distances_x.length;
		for (let length = arv.length, i = 0; i < length; ++i)
		{
			const x0 = arv.get(i, valueAccessorKey_x);
			const y0 = arv.get(i, valueAccessorKey_y);
			let deltaYmin = 0;
			let deltaYmax = 0;
			let distance_x = distances_x[0];
			let decklength = true;
			for (let k = 0, j = i + 1; j < length; ++j)
			{
				const x1 = arv.get(j, valueAccessorKey_x);
				const y1 = arv.get(j, valueAccessorKey_y);
				const deltaX = x1 - x0;
				const deltaY = y1 - y0;
				deltaYmin = Math.min(deltaYmin, deltaY);
				deltaYmax = Math.max(deltaYmax, deltaY);
				if (deltaX < distance_x) continue;
				const resultItem = {};
				resultItem[valueAccessorKey_x] = x0;
				if (valueAccessorKey_mindy) resultItem[valueAccessorKey_mindy] = deltaYmin;
				if (valueAccessorKey_maxdy) resultItem[valueAccessorKey_maxdy] = deltaYmax;
				if (deltaX == distance_x)
				{
					resultItem[valueAccessorKey_y] = deltaY;
				}
				else
				{
					const x_prev = arv.get(j - 1, valueAccessorKey_x);
					const y_prev = arv.get(j - 1, valueAccessorKey_y);
					const deltaX_prev = x1 - x_prev;
					const deltaY_prev = y1 - y_prev;
					const ratio = (distance_x - x_prev + x0) / deltaX_prev;
					resultItem[valueAccessorKey_y] = y_prev + deltaY_prev * ratio - y0;
				}
				let resultBranch = result[k];
				if (!resultBranch)
				{
					resultBranch = [];
					result[k] = resultBranch;
				}
				resultBranch.push(resultItem);
				++k;
				if (k >= klength)
				{
					decklength = false;
					break;
				}
				const distance_x1 = distances_x[k];
				if (distance_x1 <= distance_x) throw "Argument is invalid: distances_x.";
				distance_x = distance_x1;
			}
			if (decklength) --klength;
		}
		return result;
	}

	static derivative(arg, valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = ArrayView.wrap(arg);

		const result = [];
		let prevX = arv.get(0, valueAccessorKey_x);
		let prevY = arv.get(0, valueAccessorKey_y);
		for (let length = arv.length, i = 1; i < length; ++i)
		{
			const x = arv.get(i, valueAccessorKey_x);
			const y = arv.get(i, valueAccessorKey_y);
			const deltaX = prevX - x;
			const deltaY = prevY - y;
			const resultItem = {};
			resultItem[valueAccessorKey_x] = x;
			resultItem[valueAccessorKey_y] = deltaY / deltaX;
			result.push(resultItem);
			prevX = x;
			prevY = y;
		}
		return result;
	}

	static peaks(arg, count, valueAccessorKey, epsylon)
	{
		const arv = ArrayView.wrap(arg);
		const result = [];
		for (let ci = Math.floor(count / 2), length = arv.length - count + 1, i = 0; i < length; ++i, ++ci)
		{
			if (Sample.classifyExtremum(arv.extract(i, count), valueAccessorKey, epsylon) != 1) continue;
			const centerItem = arv.get(ci);
			const detectionItem = arv.get(i + count - 1);
			result.push({ t: 1, i: ci, v: arv.valueOf(centerItem, valueAccessorKey), m: centerItem, di: i + count - 1, dm: detectionItem, dv: arv.valueOf(detectionItem, valueAccessorKey) });
		}
		return result;
	}

	static valleys(arg, count, valueAccessorKey, epsylon)
	{
		const arv = ArrayView.wrap(arg);
		const result = [];
		for (let ci = Math.floor(count / 2), length = arv.length - count + 1, i = 0; i < length; ++i, ++ci)
		{
			if (Sample.classifyExtremum(arv.extract(i, count), valueAccessorKey, epsylon) != -1) continue;
			const centerItem = arv.get(ci);
			const detectionItem = arv.get(i + count - 1);
			result.push({ t: -1, i: ci, v: arv.valueOf(centerItem, valueAccessorKey), m: centerItem, di: i + count - 1, dm: detectionItem, dv: arv.valueOf(detectionItem, valueAccessorKey) });
		}
		return result;
	}

	static extremums(arg, count, valueAccessorKey, epsylon)
	{
		const arv = ArrayView.wrap(arg);

		const result =
		{
			peaks: [],
			valleys: [],
		};

		for (let ci = Math.floor(count / 2), length = arv.length - count + 1, i = 0; i < length; ++i, ++ci)
		{
			const centerItem = arv.get(ci);
			const centerValue = arv.valueOf(centerItem, valueAccessorKey);
			const detectionItem = arv.get(i + count - 1);
			const detectionValue = arv.valueOf(detectionItem, valueAccessorKey);

			const extremumType = Sample.classifyExtremum(arv.extract(i, count), valueAccessorKey, epsylon);
			switch (extremumType)
			{
				case -1:
					result.valleys.push({ t: extremumType, i: ci, v: centerValue, m: centerItem, di: i + count - 1, dm: detectionItem, dv: detectionValue });
					break;
				case 1:
					result.peaks.push({ t: extremumType, i: ci, v: centerValue, m: centerItem, di: i + count - 1, dm: detectionItem, dv: detectionValue });
					break;
				case 0:
					break;
				default:
					throw "Not implemented.";
			}
		}

		return result;
	}

	static rextremums(arg, count, valueAccessorKey, epsylon)
	{
		const arv = ArrayView.wrap(arg);

		const result =
		{
			peaks: [],
			valleys: [],
		};

		for (let i = arv.length - count - 1, ci = i + Math.floor(count / 2); i >= 0; --i, --ci)
		{
			const centerItem = arv.get(ci);
			const centerValue = arv.valueOf(centerItem, valueAccessorKey);
			const detectionItem = arv.get(i + count - 1);
			const detectionValue = arv.valueOf(detectionItem, valueAccessorKey);

			const extremumType = Sample.classifyExtremum(arv.extract(i, count), valueAccessorKey, epsylon);
			switch (extremumType)
			{
				case -1:
					result.valleys.push({ t: extremumType, i: ci, v: centerValue, m: centerItem, di: i + count - 1, dm: detectionItem, dv: detectionValue });
					break;
				case 1:
					result.peaks.push({ t: extremumType, i: ci, v: centerValue, m: centerItem, di: i + count - 1, dm: detectionItem, dv: detectionValue });
					break;
				case 0:
					break;
				default:
					throw "Not implemented.";
			}
		}

		return result;
	}

	static movingAverage(arg, count, produce)
	{
		const arv = Array.isArray(arg) ? new ArrayView(arg) : arg.extract();

		const result = [];
		arv.resize(count);
		for (let length = arg.length - count, i = 0; i < length; ++i)
		{
			arv.move(i);
			result.push(produce(arv));
		}
		return result;
	}

	//	https://www.investopedia.com/ask/answers/122314/what-exponential-moving-average-ema-formula-and-how-ema-calculated.asp
	static ema(arg, count, valueAccessorKey, produce)
	{
		if (count < 1) throw "Argument is invalid: count.";

		const arv = ArrayView.wrap(arg);
		if (arv.length < count) throw "Argument is invalid: arg.";

		const k = 2 / (count + 1);
		const result = [];
		let current = arv.first(valueAccessorKey);
		for (let length = arv.length, i = 1; i < length; ++i)
		{
			current = arv.get(i, valueAccessorKey) * k + current * (1 - k);
			result.push(produce(current, i, arv));
		}
		return result;
	}

	//	https://en.wikipedia.org/wiki/Moving_average#Exponentially_weighted_moving_variance_and_standard_deviation
	//	https://stats.stackexchange.com/questions/111851/standard-deviation-of-an-exponentially-weighted-mean
	static emsdy(arg, count, valueAccessorKey, produce)
	{
		if (count < 1) throw "Argument is invalid: count.";

		const arv = ArrayView.wrap(arg);
		if (arv.length < count) throw "Argument is invalid: arg.";

		const result = [];
		const k = 2 / (count + 1);
		const first = arv.first(valueAccessorKey);
		let currentVariance = 0;
		let currentM = first;
		for (let length = arv.length, i = 2; i < length; ++i)
		{
			const v = arv.get(i, valueAccessorKey);
			const delta = v - currentM;
			currentM = currentM + k * delta;
			currentVariance = (1 - k) * (currentVariance + k * delta * delta);
			if (currentVariance < 0) log(999, currentVariance);
			result.push(produce(Math.sqrt(currentVariance), i, arv));
		}
		return result;
	}

	/////////////////////////////////////////////
	//	standard deviation

	//	NOT TESTED
	static standardDeviationOfResiduals(arg, linedef, valueAccessorKey_x, valueAccessorKey_y)
	{
		if (!valueAccessorKey_x) throw "Argument is null: valueAccessorKey_x.";
		if (!valueAccessorKey_y) throw "Argument is null: valueAccessorKey_y.";

		const arv = ArrayView.wrap(arg);

		if (arv.length < 3) return 0;

		let sum = 0;
		for (let length = arv.length, i = 0; i < length; ++i)
		{
			const x = arv.get(i, valueAccessorKey_x);
			const y = arv.get(i, valueAccessorKey_y);
			const y2 = linedef.calc(x);
			const r = y - y2;
			sum += r * r;
		}
		return Math.sqrt(sum / (arv.length - 2))
	}

	//	returns an estimated ratio of a maximum sample sd to the sample range
	static sdUpperBoundRatio(n)
	{
		if (n < 2) return 0;
		if (n == 2) return 0.7071;
		const result = -Math.log((n / 100 - 0.027) * 10000000) / 21 + 1.118;
		if (result > 1) return 1;
		if (result < 0) return 0;
		return result;
	}

	//	returns an estimated ratio of a minimum sample sd to the sample range
	static sdLowerBoundRatio(n)
	{
		if (n < 2) return 0;
		if (n == 2) return 0.0000015;
		if (n == 3) return 0.0009;
		const result = Math.log((n / 100 - 0.027) * 100000000) / 21 - 0.67;
		if (result > 1) return 1;
		if (result < 0) return 0;
		return result;
	}

	/////////////////////////////////////////////
	//	real data stat functions

	static calcNormalXYRatio_EURUSD(intervalMs)
	{
		const x = intervalMs;

		const a = 0.35;
		const k = 0.533;
		const factor = 967549.3643736127;
		return Math.pow(a * x, k) * factor;
	}

	/////////////////////////////////////////////
	//	math functions

	//	x in (-Infinity, +Infinity), y in (0, 1)
	static sigmoid(x)
	{
		//	desmos.com: \frac{1}{\left(1+e^{-x}\right)}
		return 1 / (1 + Math.exp(-x));
	}

	//	x in (0, 1), y in (-Infinity, +Infinity)
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

		let a;
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

	//	incremental arithmetic average
	//	https://math.stackexchange.com/questions/106700/incremental-averageing
	static avginc(prev, an, n)
	{
		return prev + (an - prev) / n;
	}

	/////////////////////////////////////////////
	//	tables

	static get Tables()
	{
		if (!Sample._Tables)
		{
			Sample._Tables = {};

			//	precalculated ratio of the sd upper bould to interval range per sample length - 1
			//	values are estimated
			//	for sample length 2 (table index 1) the sd to sample range factor is a constant is equals 0.071
			Sample._Tables.sdUpperBoundRatio =
			[
				0, 0.7071, 0.7066101721833479, 0.5664790664521209, 0.5568211370309475, 0.5251670358158426, 0.5077221795028702, 0.4842730105944406, 0.4667840860211573, 0.46297833513678216, 0.45769581734943215, 0.4372156314356321, 0.4301658214355196, 0.42896945397502095, 0.4225610260856278, 0.42930214673497136, 0.4277577750935708, 0.4203630398938937, 0.4091939798293885, 0.4016363887028559, 0.4062516867487387, 0.4062353640525236, 0.3944239847382047, 0.397843329964878, 0.39957187697642454, 0.3983068444702682, 0.3935727614529364, 0.3968295513698075, 0.3902374141468996, 0.3853559620099024, 0.38124321863955557, 0.3834458264857814, 0.395740471152706, 0.3947809002874919, 0.3754089351108484, 0.38852071794139775, 0.37497216729044297, 0.3795281519018877, 0.3832730482571962, 0.36858998064610676, 0.3810111449955614, 0.373014698964116, 0.37003653136554404, 0.3654939669472468, 0.3728313783471734, 0.36791123436211914, 0.38007289010245165, 0.36216562453344353, 0.3648248868432703, 0.3738335746987691, 0.3666140769792359, 0.36088364419525926, 0.3574417885668538, 0.35944721159598475, 0.3629734793932458, 0.35537330245138554, 0.35966049267577466, 0.35179074889084005, 0.35829992308626624, 0.3551577412092628, 0.35587502185632075, 0.3577522998348986, 0.35749837141294194, 0.3577732874427786, 0.35796216461650027, 0.35541605853350744, 0.35575945264621933, 0.34846679785450035, 0.3518023831862401, 0.36073523801495355, 0.3528050996077555, 0.3520219893522458, 0.34720175587757907, 0.36242643514186446, 0.3478516764457712, 0.34818398610025847, 0.3547852847760349, 0.3456513711215932, 0.353979911588807, 0.3436862631774854, 0.3520572798863785, 0.34944280407097567, 0.349037877590278, 0.3470123931402847, 0.3434784699028172, 0.34621774586034343, 0.35050798479945144, 0.3440674906795895, 0.34609287666749844, 0.34430220775471165, 0.34545960884167615, 0.3507142345804322, 0.34027605640980174, 0.3506782858778417, 0.34114741307872576, 0.34541636625262756, 0.34297242806258593, 0.34310590475566466, 0.34320382336998867, 0.3461026781571617
			];

			//	precalculated ratio of the sd lower bould to interval range per sample length - 1
			//	values are estimated
			//	for sample length 2 (table index 1) the sd to sample range factor is a constant is equals 0.071
			Sample._Tables.sdLowerBoundRatio =
			[
				0, 0.7071, 0.0000014949890202765457, 0.0008616202659149646, 0.00475923879924107, 0.016925453322443263, 0.023767809090665875, 0.04640001707636289, 0.05138160194674707, 0.057339362069936596, 0.06028473770439013, 0.048557866633444725, 0.10563921099208183, 0.09464591279360718, 0.11998984898427148, 0.10967879317810046, 0.09960285550163339, 0.12425006629419404, 0.12876396202470727, 0.12581530307267041, 0.12761033247937711, 0.14946481798488073, 0.1496283806790933, 0.1352737520242736, 0.1487073509734417, 0.14292564006795272, 0.16715548968854235, 0.13934907645926844, 0.16491468927138683, 0.16756310241161224, 0.15628331204273618, 0.1724440409019682, 0.16846013144977082, 0.17234845061983953, 0.18234093917797914, 0.18142111612091383, 0.18414061865592898, 0.18427179030879945, 0.18327290295342283, 0.17446436156290965, 0.18314923375347356, 0.19253596918538401, 0.19506518840774323, 0.19462538251738845, 0.19337739782562793, 0.19498750865572295, 0.19538086495590598, 0.19892914463427863, 0.1954341757945014, 0.19748479082363524, 0.19275578302924296, 0.2037846767418657, 0.20210005153186233, 0.20955743458417023, 0.20663765633854272, 0.19887232611650985, 0.1916182003618118, 0.20532033481246226, 0.21258830283352675, 0.20784412043551703, 0.21147272130408531, 0.21012835235766225, 0.20804623715141024, 0.21840361493171578, 0.20882001580722975, 0.21480406709352548, 0.21612602622068328, 0.21599199964383234, 0.21428753782278723, 0.20297192610613557, 0.21828725385014353, 0.21463410721213563, 0.2213970389671735, 0.21548919470664946, 0.21907398211175189, 0.21876814661795435, 0.2104105523386691, 0.21844110698945124, 0.22143199742115546, 0.21992555046640333, 0.22058126262535624, 0.22075287681667144, 0.22724289995977448, 0.22130774208722268, 0.219311319765522, 0.22627641328568832, 0.2280660047536934, 0.22642648675099156, 0.22806287637994035, 0.22927083808099116, 0.22546617917831926, 0.22578910602302066, 0.2275063278466921, 0.22670042466161178, 0.22738711081776525, 0.22446592587807285, 0.22033385835131175, 0.2282642688956856, 0.23092039438730091, 0.22976847858385746
			];

		}
		return Sample._Tables;
	}


	/////////////////////////////////////////////
	//	private

	static _testCachePerformance()
	{
		const factor = 20;
		const results = {};
		for (let clength = 200, c = 0; c < clength; ++c)
		{
			log(27346, c, ' of ', clength)

			const result = { direct: 0, cached: 0, ratio: 0 };
			results[c * factor] = result;

			const begin1 = new Date();
			let temp1 = 0;
			for (let i1length = c * factor, i1 = 0; i1 < i1length; ++i1)
				for (let i2length = 3* i1length, i2 = 0; i2 < i2length; ++i2)
					temp1 += Math.sqrt(i1 / i2);
			const end1 = new Date();
			result.direct = end1.getTime() - begin1.getTime();

			const begin2 = new Date();
			const tempMap = { "x*y": 0 };
			const x = "x";
			const y = "y";
			let temp2;
			for (let i1length = c * factor, i1 = 0; i1 < i1length; ++i1)
				for (let i2length = 3 * i1length, i2 = 0; i2 < i2length; ++i2)
					temp2 = tempMap[x + "*" + y];
			const end2 = new Date();
			result.cached = end2.getTime() - begin2.getTime();
			result.ratio = Math.round(100 * result.cached / result.direct) / 100;
		}
		log(56346, results);
	}

	static get _CacheBuckets()
	{
		if (!Sample.__CacheBuckets)
		{
			Sample.__CacheBuckets = {};
			Sample.__CacheBuckets.lineOfBestFit = newLUID();
			Sample.__CacheBuckets.standardDeviation = newLUID();
			Sample.__CacheBuckets.standardDeviationOfResiduals = newLUID();
			Sample.__CacheBuckets.totalSumOfSquares = newLUID();
			Sample.__CacheBuckets.explainedSumOfSquares = newLUID();
			Sample.__CacheBuckets.correlationCoefficient = newLUID();
			Sample.__CacheBuckets.coefficientOfDetermination = newLUID();
			Sample.__CacheBuckets.variability = newLUID();
			Sample.__CacheBuckets.variabilityArray = newLUID();
			Sample.__CacheBuckets.stepMovements = newLUID();
			Sample.__CacheBuckets.derivative = newLUID();
			Sample.__CacheBuckets.stat = newLUID();
		}
		return Sample.__CacheBuckets;
	}
}
