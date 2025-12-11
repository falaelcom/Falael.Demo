"use strict";

module.exports =

class Histogram
{
	constructor(interval, arg, valueAccessorKey)
	{
		this.interval = interval;
		this.count = 0;
		this.positive = [];
		this.zero = 0;
		this.negative = [];

		this.min = 0;
		this.minIndex = 0;
		this.max = 0;
		this.maxIndex = 0;
		this.positive_zero = 0;
		this.negative_zero = 0;

		if (arg) this.consume(arg, valueAccessorKey);
	}

	consume(arg, valueAccessorKey)
	{
		const arv = ArrayView.wrap(arg);

		this.count += arv.length;
		const halfInterval = this.interval / 2;
		for (let length = arv.length, i = 0; i < length; ++i)
		{
			const value = arv.get(i, valueAccessorKey);
			let v;
			const index = this.index(value);
			if (index == 0)
			{
				v = this.zero || 0;
				this.zero = v + 1;

				if (value == 0) { ++this.negative_zero; ++this.positive_zero; }
				else if (value < 0)++this.negative_zero;
				else if (value > 0)++this.positive_zero;
			}
			else if (value < 0)
			{
				v = this.negative[-index - 1] || 0;
				ArrayView.extendArray(this.negative, -index, 0);
				this.negative[-index - 1] = v + 1;
			}
			else
			{
				v = this.positive[index - 1] || 0;
				ArrayView.extendArray(this.positive, index, 0);
				this.positive[index - 1] = v + 1;
			}
			this._applyMinMaxValue(index, v + 1);
		}

		return this;
	}

	toArray()
	{ 
		return this.negative.slice().reverse().concat([this.zero]).concat(this.positive);
	}


	index(value)
	{
		const halfInterval = this.interval / 2;
		if (value >= -halfInterval && value <= halfInterval) return 0;
		else if (value < -halfInterval) return Math.ceil((value - halfInterval) / this.interval);
		else return Math.floor((value + halfInterval) / this.interval);
	}

	value(index)
	{
		const halfInterval = this.interval / 2;
		if (index == 0) return 0;
		else if (index < 0) return index * this.interval + halfInterval;
		else return index * this.interval - halfInterval;
	}

	p(value)
	{
		if (value < 0) throw "Argument is invalid: value."
		const index = result.index(value);
		if (index == 0) return result.positive_zero;
		return result.positive[index - 1];
	}

	n(value)
	{
		if (value > 0) throw "Argument is invalid: value."
		const index = result.index(value);
		if (index == 0) return result.negative_zero;
		return result.negative[index - 1];
	}

	probabilities()
	{
		const result = new Histogram(this.interval);
		result.count = 1;
		result.zero = 1;
		result.min = 1;
		result.max = 1;

		var sum = 0;
		for (let i = this.negative.length - 1; i >= 0; --i)
		{
			const value = (sum += this.negative[i]) / this.count;
			result.negative.push(value);
			result._applyMinMaxValue(-i - 1, value);
		}
		result.negative_zero = (sum + this.negative_zero) / this.count;
		result._applyMinMaxValue(0, result.negative_zero);

		var sum = 0;
		for (let i = this.positive.length - 1; i >= 0; --i)
		{
			const value = (sum += this.positive[i]) / this.count;
			result.positive.push(value);
			result._applyMinMaxValue(i + 1, value);
		}
		result.positive_zero = (sum + this.positive_zero) / this.count;
		result._applyMinMaxValue(0, result.positive_zero);

		result.negative.reverse();
		result.positive.reverse();

		return result;
	}

	effectiveness()
	{
		const result = new Histogram(this.interval);
		result.count = 1;

		for (let length = this.negative.length, i = 0; i < length; ++i)
		{
			const value = this.value(-i - 1);
			const resultValue = value * this.negative[i];
			result.negative.push(resultValue);
			result._applyMinMaxValue(-i - 1, resultValue);
		}

		for (let length = this.positive.length, i = 0; i < length; ++i)
		{
			const value = this.value(i + 1);
			const resultValue = value * this.positive[i];
			result.positive.push(resultValue);
			result._applyMinMaxValue(i + 1, resultValue);
		}

		return result;
	}


	_applyMinMaxValue(index, value)
	{
		if (value < this.min) { this.min = value; this.minIndex = index; }
		else if (value == this.min && index < this.minIndex) { this.minIndex = index; }
		if (value > this.max) { this.max = value; this.maxIndex = index; }
		else if (value == this.max && index < this.maxIndex) { this.maxIndex = index; }
	}


	get length()
	{
		return this.negative.length + 1 + this.positive.length;
	};
}
