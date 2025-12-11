"use strict";

include("StdAfx.js");

class ChartDateTimeAxis extends ChartAxis
{
	constructor(id, dataRange)
	{
		super(id, EChartDataType.DateTime, dataRange, "dateTimeAxis");

		this._rangeStyles = null;
		this._rangeStyles_duration = null;
	}


	__buildRenderPlan_tick(renderPlan, tickInfo, aspects)
	{
		super.__buildRenderPlan_tick(renderPlan, tickInfo, aspects);
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
		var sceneOriginDeflated = sceneOriginInflated + this.paddingLower;
		var sceneLengthDeflated = sceneLengthInflated - this.paddingLower - this.paddingUpper;

		if (this._dataRange.min >= this._dataRange.max)
		{
			var emptyResult =
			{
				major:
				{
					unit: EDateTimeUnit.Century,
				},
				minor:
				{
					unit: EDateTimeUnit.Century,
				},
				micro:
				{
					unit: EDateTimeUnit.Century,
				},
				valueType: EChartDataType.DateTime,
				ticks: [],
				sceneOriginInflated: sceneOriginInflated,
				sceneRangeInflated: sceneLengthInflated,
				sceneOriginDeflated: sceneOriginDeflated,
				sceneLengthDeflated: sceneLengthDeflated,
				sceneToModel: function (value)
				{
					return 0;
				},
				modelToScene: function (value)
				{
					return Infinity;
				},
			};
			return emptyResult;
		}

		var ticks = [];

		var rangeStyle = this._lookupRangeStyle(this._dataRange.min, this._dataRange.max);
		//log(711, "less than " + rangeStyle.lessThan.value + " " + EDateTimeUnit.getName(rangeStyle.lessThan.unit));
		var majorTickRangeDuration = rangeStyle.majorTicks.every;
		var minorTickRangeDuration = rangeStyle.minorTicks.every;
		var microTickRangeDuration = rangeStyle.microTicks.every;
		var showWeeks = rangeStyle.showWeeks;

		var modelMinMomentDeflated = moment.utc(this._dataRange.min);
		var modelMaxMomentDeflated = moment.utc(this._dataRange.max);
		var modelRangeDeflatedInMajorUnits = Math.floor(EDateTimeUnit.diffMoments(modelMaxMomentDeflated, modelMinMomentDeflated, majorTickRangeDuration.unit));

		if (modelRangeDeflatedInMajorUnits <= 0) throw "Invalid operation.";
		var majorTickRangeCount = Math.floor(modelRangeDeflatedInMajorUnits / majorTickRangeDuration.value);
		var majorSceneTickRange = Math.floor(sceneLengthDeflated / majorTickRangeCount);
		var modelMinMomentDeflated_majorUnitRounded = EDateTimeUnit.floorMoment(modelMinMomentDeflated, majorTickRangeDuration.unit, majorTickRangeDuration.value);
		var firstMajorTickInRangeMoment = EDateTimeUnit.addToMoment(modelMinMomentDeflated_majorUnitRounded, majorTickRangeDuration.value, majorTickRangeDuration.unit);
		var zeroMajorRangeModelLenght = firstMajorTickInRangeMoment.valueOf() - modelMinMomentDeflated_majorUnitRounded.valueOf();
		var minModelOffsetInZeroMajorRange = this._dataRange.min - modelMinMomentDeflated_majorUnitRounded.valueOf();
		var minModelOffsetInZeroMajorRangeRatio = minModelOffsetInZeroMajorRange / zeroMajorRangeModelLenght;
		var minSceneOffsetInZeroMajorRange = majorSceneTickRange * minModelOffsetInZeroMajorRangeRatio;
		var zeroMajorRangeSceneOffset = sceneOriginDeflated - minSceneOffsetInZeroMajorRange;

		var hitTestInfos = [];
		var lastRangeUnitDensity = null;
		var currentTickMoment = moment.utc(modelMinMomentDeflated_majorUnitRounded);
		var majorTickSceneOffset = zeroMajorRangeSceneOffset;

		var extrudeLeft_majorTickRangeCount = Math.ceil(this.paddingLower / majorSceneTickRange);
		var extrudeRight_majorTickRangeCount = Math.ceil((this.paddingUpper - zeroMajorRangeSceneOffset) / majorSceneTickRange);
		if (extrudeLeft_majorTickRangeCount)
		{
			currentTickMoment = EDateTimeUnit.subtractFromMoment(currentTickMoment, extrudeLeft_majorTickRangeCount * majorTickRangeDuration.value, majorTickRangeDuration.unit);
			majorTickSceneOffset -= extrudeLeft_majorTickRangeCount * majorSceneTickRange;
		}
		for (var length = majorTickRangeCount + extrudeLeft_majorTickRangeCount + extrudeRight_majorTickRangeCount + 1, i = 0; i < length; ++i)
		{
			var nextTickMoment = EDateTimeUnit.addToMoment(currentTickMoment, majorTickRangeDuration.value, majorTickRangeDuration.unit);
			var modelTickRange = nextTickMoment.valueOf() - currentTickMoment.valueOf();

			if (majorTickSceneOffset >= sceneOriginInflated && majorTickSceneOffset <= sceneOriginInflated + sceneLengthInflated)
			{
				ticks.push(
				{
					tickType: EChartTickType.Major,
					sceneOffset: Math.round(majorTickSceneOffset),
					modelOffset: EDateTimeUnit.startOfMoment(currentTickMoment, majorTickRangeDuration.unit).valueOf(),
					unit: majorTickRangeDuration.unit,
				});

				var lowestHigherRoundingUnit = EDateTimeUnit.findLowestHigherRoundingUnit(currentTickMoment, majorTickRangeDuration.unit);
				if (lowestHigherRoundingUnit != majorTickRangeDuration.unit)
				{
					var higherRoundingUnit = EDateTimeUnit.higherUnit(lowestHigherRoundingUnit);
					var tick =
					{
						tickType: EChartTickType.Running,
						sceneOffset: Math.round(majorTickSceneOffset),
						modelOffset: EDateTimeUnit.startOfMoment(currentTickMoment, lowestHigherRoundingUnit).valueOf(),
						unit: lowestHigherRoundingUnit,
					};
					if (showWeeks && EDateTimeUnit.isRoundWeek(currentTickMoment, majorTickRangeDuration.unit))
					{
						tick.weekModelOffset = EDateTimeUnit.startOfMoment(currentTickMoment, EDateTimeUnit.Week).valueOf();
					}
					ticks.push(tick);
				}
				else if (showWeeks && EDateTimeUnit.isRoundWeek(currentTickMoment, majorTickRangeDuration.unit))
				{
					ticks.push(
					{
						tickType: EChartTickType.Running,
						sceneOffset: Math.round(majorTickSceneOffset),
						modelOffset: EDateTimeUnit.startOfMoment(currentTickMoment, EDateTimeUnit.Week).valueOf(),
						unit: EDateTimeUnit.Week,
					});
				}
			}

			//	minor ticks
			var majorTickRangeInMinorUnits = Math.floor(EDateTimeUnit.diffMoments(nextTickMoment, currentTickMoment, minorTickRangeDuration.unit));

			var minorTickRangeCount = Math.floor(majorTickRangeInMinorUnits / minorTickRangeDuration.value);
			var minorSceneTickRange = majorSceneTickRange / minorTickRangeCount;
			var currentMinorTickMoment = new moment.utc(currentTickMoment);
			var minorTickSceneOffset = majorTickSceneOffset;
			for (var jlength = minorTickRangeCount, j = 0; j < jlength; ++j)
			{
				var nextMinorTickMoment = EDateTimeUnit.addToMoment(currentMinorTickMoment, minorTickRangeDuration.value, minorTickRangeDuration.unit);
				var modelMinorTickRange = nextMinorTickMoment.valueOf() - currentMinorTickMoment.valueOf();

				hitTestInfos.push(
				{
					sceneOffset: Math.round(minorTickSceneOffset),
					modelOffset: EDateTimeUnit.startOfMoment(currentMinorTickMoment, minorTickRangeDuration.unit).valueOf(),
					modelToSceneRatio: modelMinorTickRange / minorSceneTickRange,
				});

				if (hitTestInfos.length > 1)
				{
					var prevItem = hitTestInfos[hitTestInfos.length - 2];
					var thisItem = hitTestInfos[hitTestInfos.length - 1];
					var modelDistance = thisItem.modelOffset - prevItem.modelOffset;
					if (modelDistance <= 0) throw "Invalid operation.";
					var sceneDistance = thisItem.sceneOffset - prevItem.sceneOffset;
					prevItem.modelToSceneRatio = modelDistance / sceneDistance;
				}

				if (minorTickSceneOffset >= sceneOriginInflated && minorTickSceneOffset <= sceneOriginInflated + sceneLengthInflated)
				{
					if (minorTickSceneOffset > majorTickSceneOffset && minorTickSceneOffset < majorTickSceneOffset + majorSceneTickRange)
					{
						ticks.push(
						{
							tickType: EChartTickType.Minor,
							sceneOffset: Math.round(minorTickSceneOffset),
							modelOffset: EDateTimeUnit.startOfMoment(currentMinorTickMoment, minorTickRangeDuration.unit).valueOf(),
							unit: minorTickRangeDuration.unit,

							showLabel: true,
						});

						if (showWeeks && EDateTimeUnit.isRoundWeek(currentMinorTickMoment, minorTickRangeDuration.unit))
						{
							ticks.push(
							{
								tickType: EChartTickType.Running,
								sceneOffset: Math.round(minorTickSceneOffset),
								modelOffset: EDateTimeUnit.startOfMoment(currentMinorTickMoment, EDateTimeUnit.Week).valueOf(),
								unit: EDateTimeUnit.Week,
							});
						}
					}
				}

				var minorTickRangeInMicroUnits = Math.floor(EDateTimeUnit.diffMoments(nextMinorTickMoment, currentMinorTickMoment, microTickRangeDuration.unit));
				var microTickRangeCount = Math.floor(minorTickRangeInMicroUnits / microTickRangeDuration.value);
				if (microTickRangeCount > 50)
				{
					throw "Maximum value exceeded.";
				}
				var microSceneTickRange = minorSceneTickRange / microTickRangeCount;
				var currentMicroTickMoment = new moment.utc(currentMinorTickMoment);
				var microTickSceneOffset = minorTickSceneOffset;

				for (var klength = microTickRangeCount, k = 0; k < klength; ++k)
				{
					var nextMicroTickMoment = EDateTimeUnit.addToMoment(currentMicroTickMoment, microTickRangeDuration.value, microTickRangeDuration.unit);
					var modelMicroTickRange = nextMicroTickMoment.valueOf() - currentMicroTickMoment.valueOf();

					if (microTickSceneOffset >= sceneOriginInflated && microTickSceneOffset <= sceneOriginInflated + sceneLengthInflated)
					{
						if (microTickSceneOffset > minorTickSceneOffset && microTickSceneOffset < minorTickSceneOffset + minorSceneTickRange)
						{
							ticks.push(
							{
								tickType: EChartTickType.Micro,
								sceneOffset: Math.round(microTickSceneOffset),
								modelOffset: EDateTimeUnit.startOfMoment(currentMicroTickMoment, microTickRangeDuration.unit).valueOf(),
								unit: microTickRangeDuration.unit,

								showLabel: true,
							});

							if (showWeeks && EDateTimeUnit.isRoundWeek(currentMicroTickMoment, microTickRangeDuration.unit))
							{
								ticks.push(
								{
									tickType: EChartTickType.Running,
									sceneOffset: Math.round(microTickSceneOffset),
									modelOffset: EDateTimeUnit.startOfMoment(currentMicroTickMoment, EDateTimeUnit.Week).valueOf(),
									unit: EDateTimeUnit.Week,
								});
							}
						}
					}

					currentMicroTickMoment = nextMicroTickMoment;
					microTickSceneOffset += microSceneTickRange;
				}

				currentMinorTickMoment = nextMinorTickMoment;
				minorTickSceneOffset += minorSceneTickRange;
			}

			currentTickMoment = nextTickMoment;
			majorTickSceneOffset += majorSceneTickRange;
		}

		var avgModelToSceneRatio = this._dataRange.length / sceneLengthDeflated;
		var result =
		{
			major:
			{
				unit: majorTickRangeDuration.unit,
			},
			minor:
			{
				unit: minorTickRangeDuration.unit,
			},
			micro:
			{
				unit: microTickRangeDuration.unit,
			},
			valueType: EChartDataType.DateTime,
			ticks: ticks,
			sceneOriginInflated: sceneOriginInflated,
			sceneRangeInflated: sceneLengthInflated,
			sceneOriginDeflated: sceneOriginDeflated,
			sceneLengthDeflated: sceneLengthDeflated,
			sceneToModel: function (value)
			{
				value = Math.round(value);

				var firstHitTestInfo = hitTestInfos[0];
				if (value < firstHitTestInfo.sceneOffset) return firstHitTestInfo.modelOffset + (value - firstHitTestInfo.sceneOffset)* avgModelToSceneRatio;
				if (value == firstHitTestInfo.sceneOffset) return firstHitTestInfo.modelOffset;
				var lastHitTestInfo = null;
				for (var length = hitTestInfos.length, i = 0; i < length; ++i)
				{
					var item = hitTestInfos[i];
					if (value < item.sceneOffset)
					{
						break;
					}
					if (value == item.sceneOffset)
					{
						return item.modelOffset;
					} 
					lastHitTestInfo = item;
				}
				return lastHitTestInfo.modelOffset + (value - lastHitTestInfo.sceneOffset) * lastHitTestInfo.modelToSceneRatio;
			},
			modelToScene: function (value)
			{
				var firstHitTestInfo = hitTestInfos[0];
				if (value < firstHitTestInfo.modelOffset) return firstHitTestInfo.sceneOffset + (value - firstHitTestInfo.modelOffset) / avgModelToSceneRatio;
				if (value == firstHitTestInfo.modelOffset) return firstHitTestInfo.sceneOffset;
				var lastHitTestInfo = null;
				for (var length = hitTestInfos.length, i = 0; i < length; ++i)
				{
					var item = hitTestInfos[i];
					if (value < item.modelOffset)
					{
						break;
					}
					if (value == item.modelOffset)
					{
						return item.sceneOffset;
					}
					lastHitTestInfo = item;
				}
				return lastHitTestInfo.sceneOffset + (value - lastHitTestInfo.modelOffset) / lastHitTestInfo.modelToSceneRatio;
			},
		};

		return result;
	}


	_lookupRangeStyle(startMs, endMs)
	{
		if (startMs >= endMs) throw "Argument is invalid: startMs.";
		for (var length = this._rangeStyles_duration.length, i = 0; i < length; ++i)
		{
			var item = this._rangeStyles_duration[i];
			var rangeDuration = SimpleDuration.fromRange(startMs, endMs, item.lessThan.unit);
			if (rangeDuration.lessThanOrEquals(item.lessThan))
			{
				return item;
			}
		}
		return this._rangeStyles_duration[this._rangeStyles_duration.length - 1];
	}

	static _buildRangeStyles_duration(rangeStyles)
	{
		var result = [];
		for (var length = rangeStyles.length, i = 0; i < length; ++i)
		{
			var item = rangeStyles[i];
			var copy = JSON.parse(JSON.stringify(item));
			result.push(copy);

			copy.lessThan = SimpleDuration.parse(item.lessThan);
			copy.majorTicks.every = SimpleDuration.parse(item.majorTicks.every);
			copy.minorTicks.every = SimpleDuration.parse(item.minorTicks.every);
			copy.microTicks.every = SimpleDuration.parse(item.microTicks.every);
		}
		return result;
	}

	get rangeStyles()
	{
		return this._rangeStyles;
	}

	set rangeStyles(value)
	{
		if (JSON.stringify(this._rangeStyles) == JSON.stringify(value))
		{
			return;
		}
		this._rangeStyles = value;
		this._rangeStyles_duration = ChartDateTimeAxis._buildRangeStyles_duration(value);
		this.__invalidateAspect("scale");
	}
}
