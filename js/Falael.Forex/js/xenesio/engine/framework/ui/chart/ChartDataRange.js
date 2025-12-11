"use strict";

include("StdAfx.js");

class ChartDataRange extends ChartNode
{
	constructor(id)
	{
		super(id);

		this._range = new Range(-1, -1);
	}

	clone()
	{
		var result = new ChartDataRange(this.id + "_" + newLUID());
		result._range = this._range.clone();
		return result;
	}


	setBounds(min, max)
	{
		if (this._min == min && this._max == max)
		{
			return;
		}
		this._range.min = min;
		this._range.max = max;
		this.onChange({ aspect: "range" });
	}

	inflate(lowerExtrusionFactor, upperExtrusionFactor)
	{
		this._range.inflate(lowerExtrusionFactor, upperExtrusionFactor);
		this.onChange({ aspect: "range" });
	}


	get min()
	{
		return this._range.min;
	}

	set min(value)
	{
		if (this._range.min == value)
		{
			return;
		}
		this._range.min = value;
		this.onChange({ aspect: "range" });
	}

	get max()
	{
		return this._range.max;
	}

	set max(value)
	{
		if (this._range.max == value)
		{
			return;
		}
		this._range.max = value;
		this.onChange({ aspect: "range" });
	}


	get length()
	{
		return this._range.length;
	}

	get range()
	{
		return this._range;
	}


	static normalizeModelRange(modelLowerOffset, modelUpperOffset)
	{
		var minModelOffset = -16725218400000;
		var maxModelOffset = 16725218400000;	//	16725218400000 ~= 1.1.2500
		var minModelRange = 1000;

		if (modelLowerOffset < minModelOffset - minModelRange / 2)
		{
			modelLowerOffset = minModelOffset - minModelRange / 2;
			if (modelUpperOffset - modelLowerOffset < minModelRange)
			{
				modelUpperOffset = modelLowerOffset + minModelRange;
			}
		}
		if (modelLowerOffset > maxModelOffset - minModelRange / 2)
		{
			modelLowerOffset = maxModelOffset - minModelRange / 2;
			if (modelUpperOffset - modelLowerOffset < minModelRange)
			{
				modelUpperOffset = modelLowerOffset + minModelRange;
			}
		}
		if (modelUpperOffset < minModelOffset + minModelRange / 2)
		{
			modelUpperOffset = minModelOffset + minModelRange / 2;
			if (modelUpperOffset - modelLowerOffset < minModelRange)
			{
				modelLowerOffset = modelUpperOffset - minModelRange;
			}
		}
		if (modelUpperOffset > maxModelOffset + minModelRange / 2)
		{
			modelUpperOffset = maxModelOffset + minModelRange / 2;
			if (modelUpperOffset - modelLowerOffset < minModelRange)
			{
				modelLowerOffset = modelUpperOffset - minModelRange;
			}
		}

		if (modelUpperOffset - modelLowerOffset < minModelRange)
		{
			modelLowerOffset = modelUpperOffset - minModelRange / 2;
			modelUpperOffset = modelLowerOffset + minModelRange;
		}

		var result =
		{
			modelLowerOffset: modelLowerOffset,
			modelUpperOffset: modelUpperOffset,
		};
		return result;
	}
}
