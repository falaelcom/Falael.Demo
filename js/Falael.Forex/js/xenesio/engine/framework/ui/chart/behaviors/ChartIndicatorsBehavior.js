"use strict";

include("StdAfx.js");

class ChartIndicatorsBehavior extends Behavior
{
	constructor(control, indicators)
	{
		super(control.backplane);

		this._mouseIndicatorX = indicators.mouseIndicatorX;
		this._mouseIndicatorY = indicators.mouseIndicatorY;
		this._mouseLabelIndicator = indicators.mouseLabelIndicator;

		this._mouseAxisIndicatorX = indicators.mouseAxisIndicatorX;
		this._mouseAxisIndicatorY = indicators.mouseAxisIndicatorY;
		this._mouseAxisLabelIndicatorX = indicators.mouseAxisLabelIndicatorX;
		this._mouseAxisLabelIndicatorY = indicators.mouseAxisLabelIndicatorY;

		this.enableEventRole(EBrowserEventType.MouseMove, "chart");
		this.enableEventRole(EBrowserEventType.KeyDown, "chart");
		this.enableEventRole(EBrowserEventType.KeyUp, "chart");

		this._control = control;

		this._mouseDeviceX = null;
		this._mouseDeviceY = null;
		this._ctrlKeyPressed = false;
		this._shiftKeyPressed = false;

		this._indicatorUpdate = new MulticastDelegate();
	}


	onIndicatorUpdate(args)
	{
		this._indicatorUpdate.execute(this, args);
	}

	get indicatorUpdate()
	{
		return this._indicatorUpdate;
	}


	__onMouseMove(args)
	{
		this._mouseDeviceX = args.localX;
		this._mouseDeviceY = args.localY;

		this._updateMouseAxisIndicators();
		if (!this._ctrlKeyPressed)
		{
			return;
		}
		this._updateMouseIndicators();
	}

	__onKeyDown(args)
	{
		this._ctrlKeyPressed = args.keys.ctrlKey;
		this._shiftKeyPressed = args.keys.shiftKey;
		this._updateMouseIndicators();
	}

	__onKeyUp(args)
	{
		this._ctrlKeyPressed = args.keys.ctrlKey;
		this._shiftKeyPressed = args.keys.shiftKey;
		this._updateMouseIndicators();
	}


	_updateMouseIndicators()
	{
		if (!this._ctrlKeyPressed && !this._shiftKeyPressed)
		{
			this._mouseIndicatorX.visible = false;
			this._mouseIndicatorY.visible = false;
			this._mouseLabelIndicator.visible = false;

			this.onIndicatorUpdate({ update: "visibility", indicator: "mouseIndicatorX", visible: false });
			this.onIndicatorUpdate({ update: "visibility", indicator: "mouseIndicatorY", visible: false });

			this.control.refresh();
			return;
		}

		this._mouseIndicatorX.visible = true;
		this._mouseIndicatorY.visible = true;
		this._mouseLabelIndicator.visible = true;

		this.onIndicatorUpdate({ update: "visibility", indicator: "mouseIndicatorX", visible: true });
		this.onIndicatorUpdate({ update: "visibility", indicator: "mouseIndicatorY", visible: true });

		var controlHitTestResult = this.control.hitTest(this._mouseDeviceX, this._mouseDeviceY);
		if (!controlHitTestResult) return;
		var axisHitTestResult;

		var item = this.control.scene.series[0];

		var modelX = item.xAxis.sceneToModel(controlHitTestResult.sceneX);
		var modelY = item.yAxis.sceneToModel(controlHitTestResult.sceneY);

		var sceneX = item.xAxis.modelToScene(modelX);
		var sceneY = item.yAxis.modelToScene(modelY);

		this._mouseIndicatorX.sceneX = sceneX;
		this._mouseIndicatorX.sceneY = sceneY;

		this._mouseIndicatorY.sceneX = sceneX;
		this._mouseIndicatorY.sceneY = sceneY;

		this._mouseLabelIndicator.sceneX = sceneX;
		this._mouseLabelIndicator.sceneY = sceneY;
		this._mouseLabelIndicator.value = { x: modelX, y: modelY };

		this.onIndicatorUpdate({ update: "offset", indicator: "mouseIndicatorX", sceneOffset: sceneX, modelOffset: modelX });
		this.onIndicatorUpdate({ update: "offset", indicator: "mouseIndicatorY", sceneOffset: sceneY, modelOffset: modelY });

		this.control.refresh();
	}

	_updateMouseAxisIndicators()
	{
		var controlHitTestResult = this.control.hitTest(this._mouseDeviceX, this._mouseDeviceY);
		if (!controlHitTestResult) return;
		var axisHitTestResult;

		var item = this.control.scene.series[0];

		var modelX = item.xAxis.sceneToModel(controlHitTestResult.sceneX);
		var modelXMin = item.xAxis.sceneToModel(item.xAxis.scaleInfoCache.sceneOriginInflated);
		var modelXMax = item.xAxis.sceneToModel(item.xAxis.scaleInfoCache.sceneOriginInflated + item.xAxis.scaleInfoCache.sceneRangeInflated);
		if (isFinite(modelXMin) && modelX < modelXMin) modelX = modelXMin;
		else if (isFinite(modelXMax) && modelX > modelXMax) modelX = modelXMax;

		var modelY = item.yAxis.sceneToModel(controlHitTestResult.sceneY);
		var modelYMin = item.yAxis.sceneToModel(item.yAxis.scaleInfoCache.sceneOriginInflated);
		var modelYMax = item.yAxis.sceneToModel(item.yAxis.scaleInfoCache.sceneOriginInflated + item.yAxis.scaleInfoCache.sceneRangeInflated);
		if (isFinite(modelYMin) && modelY < modelYMin) modelY = modelYMin;
		else if (isFinite(modelYMax) && modelY > modelYMax) modelY = modelYMax;

		var sceneX = item.xAxis.modelToScene(modelX);
		var sceneY = item.yAxis.modelToScene(modelY);

		this._mouseAxisIndicatorX.sceneOffset = sceneX;
		this._mouseAxisLabelIndicatorX.sceneOffset = sceneX;

		this._mouseAxisIndicatorY.sceneOffset = sceneY;
		this._mouseAxisLabelIndicatorY.sceneOffset = sceneY;

		this.control.refresh();
	}


	get control()
	{
		return this._control;
	}
}
