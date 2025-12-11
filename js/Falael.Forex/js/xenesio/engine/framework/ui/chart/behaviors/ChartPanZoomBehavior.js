"use strict";

include("StdAfx.js");

class ChartPanZoomBehavior extends Behavior
{
	constructor(control, axis, elementTypes, enablePan, enableZoom)
	{
		super(control.backplane);

		this._axis = axis;
		this._elementTypes = elementTypes;

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

		this._ctrlKeyPressed = false;

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
		if (args.keys.altKey)
		{
			return;
		}
		if (!this._dragInfo)
		{
			return;
		}

		var deltaFactor;
		deltaFactor = 1;
		if (args.keys.ctrlKey)
		{
			deltaFactor = 10;
		}

		var mouseSceneOffset = this._axis.position == EChartAxisPosition.Left || this._axis.position == EChartAxisPosition.Right ? this.control.deviceToScene(args.localY) : args.localX;
		var deltaSceneOffset = mouseSceneOffset - this._dragInfo.initialMouseSceneOffset;
		var deltaModelOffset = this._axis.sceneToModel(deltaSceneOffset) - this._axis.sceneToModel(0);
		this.onDataRangeAvailable(
		{
			min: this._dragInfo.initialModelLowerOffset - deltaFactor * deltaModelOffset,
			max: this._dragInfo.initialModelUpperOffset - deltaFactor * deltaModelOffset,
		});
	}

	__onMouseDown(args)
	{
		if (args.keys.shiftKey)
		{
			return;
		}
		if (args.keys.altKey)
		{
			return;
		}
		if (args.button != 0)
		{
			return;
		}
		var hitTestResult = this.control.hitTest(args.localX, args.localY, function (element)
		{
			return this._elementTypes.indexOf(element.elementType) != -1;
		}.bind(this));
		if (!hitTestResult)
		{
			return;
		}
		var topTestResult = hitTestResult.items[0];

		this._dragInfo =
		{
			initialMouseSceneOffset: this._axis.position == EChartAxisPosition.Left || this._axis.position == EChartAxisPosition.Right ? this.control.deviceToScene(args.localY) : args.localX,
			initialModelLowerOffset: this._axis.dataRange.min,
			initialModelUpperOffset: this._axis.dataRange.max,
		};
		this.enableEventRole(EBrowserEventType.MouseUp, "*");
		this.enableEventRole(EBrowserEventType.MouseMove, "*");
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
		if (args.keys.altKey)
		{
			return;
		}
		if (!args.deltaY)
		{
			return;
		}

		try
		{
			var hitTestResult = this.control.hitTest(args.localX, args.localY, function (element)
			{
				return this._elementTypes.indexOf(element.elementType) != -1;
			}.bind(this));
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

			var element = topTestResult.element;
			var sceneRange = element.boundingRect.width;
			var sceneOffset = this._axis.position == EChartAxisPosition.Left || this._axis.position == EChartAxisPosition.Right ? hitTestResult.sceneY : hitTestResult.sceneX;
			var offsetFactor = (sceneRange <= 5) ? 0.5 : (sceneOffset - element.boundingRect.x) / sceneRange;

			var modelRange = this._axis.dataRange.length;
			var alteredModelRange = modelRange * factor;
			var modelDelta = alteredModelRange - modelRange;
			var modelLowerOffset = this._axis.dataRange.min - offsetFactor * modelDelta;
			var modelUpperOffset = this._axis.dataRange.max + (1 - offsetFactor) * modelDelta;
			if (modelLowerOffset == modelUpperOffset)
			{
				return true;
			}
			var normalizedResult = ChartDataRange.normalizeModelRange(modelLowerOffset, modelUpperOffset);

			this.onDataRangeAvailable(
			{
				min: normalizedResult.modelLowerOffset,
				max: normalizedResult.modelUpperOffset,
			});
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

	get axis()
	{
		return this._axis;
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
