"use strict";

include("StdAfx.js");

class ChartNumericAxis extends ChartAxis
{
	constructor(id, dataRange)
	{
		super(id, EChartDataType.Numeric, dataRange, "numericAxis");

		this._majorTickRange = null;

		this._minorTickRange = null;
		this._minorTickReduction = null;
		this._minorTickLabelGuaranteedSpace = null;
	}

	__buildScale()
	{
		var sceneOriginInflated;
		var sceneLengthInflated;
		switch (this.position)
		{
			case EChartAxisPosition.Top:
			case EChartAxisPosition.Bottom:
				sceneOriginInflated = this.boundingRect.x;
				sceneLengthInflated = this.boundingRect.width;
				break;
			case EChartAxisPosition.Left:
			case EChartAxisPosition.Right:
				sceneOriginInflated = this.boundingRect.y;
				sceneLengthInflated = this.boundingRect.height;
				break;
			default:
				throw "Not implemented.";
		}

		var ticks = [];

		var sceneOriginDeflated = sceneOriginInflated + this.paddingLower;
		var sceneLengthDeflated = Math.floor((sceneLengthInflated - this.paddingLower - this.paddingUpper) / this.majorTickRange) * this.majorTickRange;
		var sceneToModel = ChartNumericAxis._buildSceneToModelTransform(this._dataRange.min, this._dataRange.length, sceneOriginDeflated, sceneLengthDeflated);
		var majorTickRangeCountInflated = Math.floor(sceneLengthInflated / this.majorTickRange);
		var minorTickRangeCountPerMajorRange = Math.floor(this.majorTickRange / this.minorTickRange);
		var majorTickSceneOffset = sceneOriginDeflated - this.majorTickRange;
		var length2 = minorTickRangeCountPerMajorRange + 1;
		var minorTickRangeCountPerMajorRangeMax = 0
		var minorTickLabelSpaceAccumulator = 999999;
		for (var j = 1; j < length2; ++j)
		{
			var minorTickSceneOffset = sceneOriginDeflated - this.majorTickRange + j * this.minorTickRange;
			if (minorTickSceneOffset >= majorTickSceneOffset + this.majorTickRange)
			{
				break;
			}
			if (minorTickSceneOffset < sceneOriginInflated)
			{
				continue;
			}
			minorTickLabelSpaceAccumulator += this.minorTickRange;
			var item2 =
			{
				tickType: EChartTickType.Minor,
				sceneOffset: minorTickSceneOffset,
				showLabel: minorTickLabelSpaceAccumulator >= this.minorTickLabelGuaranteedSpace,
			};
			ticks.push(item2);
			if (item2.showLabel)
			{
				minorTickLabelSpaceAccumulator = 0;
			}
		}

		var length = majorTickRangeCountInflated;
		var majorTickSceneOffset;
		if (this.paddingLower + length * this.majorTickRange <= sceneLengthInflated)++length;
		for (var i = 0; i < length; ++i)
		{
			majorTickSceneOffset = sceneOriginDeflated + i * this.majorTickRange;
			var item =
			{
				tickType: EChartTickType.Major,
				sceneOffset: majorTickSceneOffset,
			};
			ticks.push(item);

			var minorTickCounter = 0;
			minorTickLabelSpaceAccumulator = 0;
			for (var j = 1; j < length2; ++j)
			{
				var minorTickSceneOffset = sceneOriginDeflated + i * this.majorTickRange + j * this.minorTickRange;
				if (minorTickSceneOffset >= majorTickSceneOffset + this.majorTickRange)
				{
					break;
				}
				if (minorTickSceneOffset >= sceneOriginInflated + sceneLengthInflated)
				{
					break;
				}
				minorTickLabelSpaceAccumulator += this.minorTickRange;
				var item2 =
				{
					tickType: EChartTickType.Minor,
					sceneOffset: minorTickSceneOffset,
					showLabel: minorTickLabelSpaceAccumulator >= this.minorTickLabelGuaranteedSpace,
				};
				ticks.push(item2);
				++minorTickCounter;
				if (item2.showLabel)
				{
					minorTickLabelSpaceAccumulator = 0;
				}
			}
			minorTickRangeCountPerMajorRangeMax = Math.max(minorTickRangeCountPerMajorRangeMax, minorTickCounter - 1);
		}

		var result =
		{
			valueType: EChartDataType.Numeric,
			ticks: ticks,
			sceneOriginInflated: sceneOriginInflated,
			sceneRangeInflated: sceneLengthInflated,
			sceneOriginDeflated: sceneOriginDeflated,
			sceneLengthDeflated: sceneLengthDeflated,
			sceneToModel: sceneToModel,
			modelToScene: ChartNumericAxis._buildModelToSceneTransform(this._dataRange.min, this._dataRange.length, sceneOriginDeflated, sceneLengthDeflated),
		};

		return result;
	}


	static _buildModelToSceneTransform(modelOrigin, modelLength, sceneOrigin, sceneLength)
	{
		var sceneToModelRatio = sceneLength / modelLength;
		return function (mx)
		{
			return (mx - modelOrigin) * sceneToModelRatio + sceneOrigin;
		}
	}

	static _buildSceneToModelTransform(modelOrigin, modelLength, sceneOrigin, sceneLength)
	{
		var modelToSceneRatio = modelLength / sceneLength;
		return function (sx)
		{
			return (sx - sceneOrigin) * modelToSceneRatio + modelOrigin;
		}
	}



	get majorTickRange()
	{
		return this._majorTickRange;
	}

	set majorTickRange(value)
	{
		if (this._majorTickRange == value)
		{
			return;
		}
		this._majorTickRange = value;
		this.__invalidateAspect("scale");
	}


	get minorTickRange()
	{
		return this._minorTickRange;
	}

	set minorTickRange(value)
	{
		if (this._minorTickRange == value)
		{
			return;
		}
		this._minorTickRange = value;
		this.__invalidateAspect("scale");
	}

	get minorTickReduction()
	{
		return this._minorTickReduction;
	}

	set minorTickReduction(value)
	{
		if (this._minorTickReduction == value)
		{
			return;
		}
		this._minorTickReduction = value;
		this.__invalidateAspect("scale");
	}

	get minorTickLabelGuaranteedSpace()
	{
		return this._minorTickLabelGuaranteedSpace;
	}

	set minorTickLabelGuaranteedSpace(value)
	{
		if (this._minorTickLabelGuaranteedSpace == value)
		{
			return;
		}
		this._minorTickLabelGuaranteedSpace = value;
		this.__invalidateAspect("labels");
	}
}
