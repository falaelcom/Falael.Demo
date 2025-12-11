"use strict";

include("StdAfx.js");

class ChartAxisPanZoomBehavior extends Behavior
{
	constructor(control, indicators, enablePan, enableZoom)
	{
		super(control.backplane);

		this._rangeIndicator = indicators.rangeIndicator;
		this._enablePan = enablePan;
		this._enableZoom = enableZoom;

		if (this._enablePan)
		{
			this.enableEventRole(EBrowserEventType.MouseDown, "chart");
		}
		if (this._enableZoom)
		{
			this.enableEventRole(EBrowserEventType.Wheel, "chart");
		}

		this._control = control;

		this._dragInfo = null;

		this._dataRangeAvailable = new MulticastDelegate();
	}


	onDataRangeAvailable(args)
	{
		this._dataRangeAvailable.execute(this, args);
	}

	get dataRangeAvailable()
	{
		return this._dataRangeAvailable;
	}


	__onMouseMove(args)
	{
		if (args.keys.shiftKey)
		{
			return;
		}
		if (!this._dragInfo)
		{
			return;
		}

		switch (this._dragInfo.elementType)
		{
			case "axisRange":
				var deltaFactor;
				deltaFactor = 1;

				var mouseSceneOffset = this._dragInfo.element.axis.position == EChartAxisPosition.Left || this._dragInfo.element.axis.position == EChartAxisPosition.Right ? this.control.deviceToScene(args.localY) : args.localX;
				var deltaSceneOffset = this._dragInfo.initialMouseSceneOffset - mouseSceneOffset;
				var deltaModelOffset = this._dragInfo.element.axis.sceneToModel(deltaSceneOffset) - this._dragInfo.element.axis.sceneToModel(0);
				var modelLowerOffset = this._dragInfo.initialModelLowerOffset - deltaFactor * deltaModelOffset;
				var modelUpperOffset = this._dragInfo.initialModelUpperOffset - deltaFactor * deltaModelOffset;
				var normalizedResult = ChartDataRange.normalizeModelRange(modelLowerOffset, modelUpperOffset);

				this._dragInfo.element.modelLowerOffset = normalizedResult.modelLowerOffset;
				this._dragInfo.element.modelUpperOffset = normalizedResult.modelUpperOffset;

				this.onDataRangeAvailable(
				{
					min: normalizedResult.modelLowerOffset,
					max: normalizedResult.modelUpperOffset,
				});
				break;
			default:
				break;

		}
	}

	__onMouseDown(args)
	{
		if (args.keys.shiftKey)
		{
			return;
		}
		if (args.button != 0)
		{
			return;
		}
		var hitTestResult = this.control.hitTest(args.localX, args.localY);
		if (!hitTestResult)
		{
			return;
		}
		var topTestResult = hitTestResult.items[0];
		switch (topTestResult.elementType)
		{
			case "axisRange":
				if (topTestResult.element != this._rangeIndicator)
				{
					break;
				}
				this._dragInfo =
				{
					element: topTestResult.element,
					elementType: "axisRange",
					initialMouseSceneOffset: topTestResult.element.axis.position == EChartAxisPosition.Left || topTestResult.element.axis.position == EChartAxisPosition.Right ? this.control.deviceToScene(args.localY) : args.localX,
					initialModelLowerOffset: topTestResult.element.modelLowerOffset,
					initialModelUpperOffset: topTestResult.element.modelUpperOffset,
				};
				this.enableEventRole(EBrowserEventType.MouseUp, "*");
				this.enableEventRole(EBrowserEventType.MouseMove, "*");
				break;
			case "axis":
				if (topTestResult.element != this._rangeIndicator.axis)
				{
					break;
				}
				var element = this._rangeIndicator;

				this._dragInfo =
				{
					element: element,
					elementType: "axisRange",
					initialMouseSceneOffset: element.axis.position == EChartAxisPosition.Left || element.axis.position == EChartAxisPosition.Right ? this.control.deviceToScene(args.localY) : args.localX,
					initialModelLowerOffset: element.modelLowerOffset,
					initialModelUpperOffset: element.modelUpperOffset,
				};
				this.enableEventRole(EBrowserEventType.MouseUp, "*");
				this.enableEventRole(EBrowserEventType.MouseMove, "*");
				break;
			default:
				break;

		}
	}

	__onMouseUp(args)
	{
		this._dragInfo = null;
		this.disableEventRole(EBrowserEventType.MouseUp, "*");
		this.disableEventRole(EBrowserEventType.MouseMove, "*");
	}

	__onWheel(args)
	{
		if (args.keys.shiftKey)
		{
			return;
		}
		if (!args.deltaY)
		{
			return;
		}

		try
		{
			var hitTestResult = this.control.hitTest(args.localX, args.localY);
			if (!hitTestResult)
			{
				return;
			}
			var topTestResult = hitTestResult.items[0];

			var deltaFactor;
			deltaFactor = 0.1;
			if (args.keys.ctrlKey)
			{
				deltaFactor = 0.6;
			}

			var factor = (args.deltaY > 0 ? 1 + deltaFactor : 1 / (1 + deltaFactor));

			switch (topTestResult.elementType)
			{
				case "axisRange":
					var element = topTestResult.element;
					var sceneRange = element.axis.position == EChartAxisPosition.Left || element.axis.position == EChartAxisPosition.Right ? topTestResult.sceneHeight : topTestResult.sceneWidth;
					if (sceneRange <= 0)
					{
						break;
					}
					var sceneOffset = element.axis.position == EChartAxisPosition.Left || element.axis.position == EChartAxisPosition.Right ? hitTestResult.sceneY : hitTestResult.sceneX;
					var elementSceneOffset = element.axis.position == EChartAxisPosition.Left || element.axis.position == EChartAxisPosition.Right ? topTestResult.sceneY : topTestResult.sceneX;
					var offsetFactor = (sceneRange <= 5) ? 0.5 : (sceneOffset - elementSceneOffset) / sceneRange;

					var modelRange = element.modelUpperOffset - element.modelLowerOffset;
					var alteredModelRange = modelRange * factor;
					var modelDelta = alteredModelRange - modelRange;
					var modelLowerOffset = element.modelLowerOffset - offsetFactor * modelDelta;
					var modelUpperOffset = element.modelUpperOffset + (1 - offsetFactor) * modelDelta;
					if (modelLowerOffset == modelUpperOffset)
					{
						return true;
					}
					var normalizedResult = ChartDataRange.normalizeModelRange(modelLowerOffset, modelUpperOffset);
					element.modelLowerOffset = normalizedResult.modelLowerOffset;
					element.modelUpperOffset = normalizedResult.modelUpperOffset;
					this.onDataRangeAvailable(
					{
						min: normalizedResult.modelLowerOffset,
						max: normalizedResult.modelUpperOffset,
					});
					break;
				case "axis":
					if (topTestResult.element != this._rangeIndicator.axis)
					{
						return;
					}
					var element = this._rangeIndicator;
					var sceneOffset = element.axis.position == EChartAxisPosition.Left || element.axis.position == EChartAxisPosition.Right ? hitTestResult.sceneY : hitTestResult.sceneX;
					var sceneLowerOffset = element.axis.modelToScene(element.modelLowerOffset);
					var offsetFactor = sceneOffset - sceneLowerOffset < 0 ? 0 : 1;

					var modelRange = element.modelUpperOffset - element.modelLowerOffset;
					var alteredModelRange = modelRange * factor;
					var modelDelta = alteredModelRange - modelRange;
					var modelLowerOffset = element.modelLowerOffset - offsetFactor * modelDelta;
					var modelUpperOffset = element.modelUpperOffset + (1 - offsetFactor) * modelDelta;
					if (modelLowerOffset == modelUpperOffset)
					{
						return true;
					}
					var normalizedResult = ChartDataRange.normalizeModelRange(modelLowerOffset, modelUpperOffset);
					element.modelLowerOffset = normalizedResult.modelLowerOffset;
					element.modelUpperOffset = normalizedResult.modelUpperOffset;
					this.onDataRangeAvailable(
					{
						min: normalizedResult.modelLowerOffset,
						max: normalizedResult.modelUpperOffset,
					});
					break;
				default:
					break;

			}
		}
		finally
		{
			return true;
		}
	}


	get control()
	{
		return this._control;
	}

	get enablePan()
	{
		return this._enablePan;
	}

	get enableZoom()
	{
		return this._enableZoom;
	}
}
