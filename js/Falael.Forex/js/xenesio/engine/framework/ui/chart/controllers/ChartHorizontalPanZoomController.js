"use strict";

include("StdAfx.js");

class ChartHorizontalPanZoomController
{
	constructor(chartVisual, xAxis, yAxis, minimapAxis)
	{
		this._chartVisual = chartVisual;
		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		this._minimapAxis = minimapAxis;

		this._mouseRangeIndicatorX = new ChartAxisRangeIndicator(this._chartVisual.id + "_mouseRangeIndicatorX", this._minimapAxis, true)
		this._mouseRangeIndicatorX.modelLowerOffset = this._xAxis.dataRange.min;
		this._mouseRangeIndicatorX.modelUpperOffset = this._xAxis.dataRange.max;
		this._chartVisual.overlay.indicators.add(this._mouseRangeIndicatorX);
		ChartStyleSheet.defaultOverlayStyle.applyToAxisRange(this._mouseRangeIndicatorX);

		this._chartAxisPanZoomBehavior = new ChartAxisPanZoomBehavior(this._chartVisual, { rangeIndicator: this._mouseRangeIndicatorX }, true, true);
		this._chartAxisPanZoomBehavior.dataRangeAvailable.add(this._chartAxisPanZoomBehavior_dataRangeAvailable.bind(this));

		this._chartPanZoomBehavior = new ChartPanZoomBehavior(this._chartVisual, this._xAxis, ["backplane"], true, true);
		this._chartPanZoomBehavior.dataRangeAvailable.add(this._chartPanZoomBehavior_dataRangeAvailable.bind(this));

		this._chartRangeCudBehavior = new ChartRangeCudBehavior(this._chartVisual, this._xAxis, this._yAxis);
		this._chartRangeCudBehavior.cudCommand.add(this._chartRangeCudBehavior_cudCommand.bind(this));
		this._chartRangeCudBehavior.selectionChanged.add(this._chartRangeCudBehavior_selectionChanged.bind(this));
		this._chartRangeCudBehavior.dataRangeAvailable.add(this._chartRangeCudBehavior_dataRangeAvailable.bind(this));

		this._chartKeyboardBehavior = new ChartKeyboardBehavior(this._chartVisual);
		this._chartKeyboardBehavior.keyPress.add(this._chartKeyboardBehavior_keyPress.bind(this));

		this._chartPersistentStorage = new ChartPersistentStorage(this._chartVisual.id, this._chartVisual);
		this._chartPersistentStorage.apply(this._chartVisual);

		this._enabled = false;

		this._lastModelLowerX = null;
		this._lastModelUpperX = null;
		this._rangeZoomHistory = [];
		this._blockDataRangeChange = false;

		this._changing = new MulticastDelegate();
		this._changed = new MulticastDelegate();
	}


	async onChanging(args)
	{
		await this._changing.execute(this, args);
	}

	onChanged(args)
	{
		this._changed.execute(this, args);
	}


	_xAxis_change(sender, args)
	{
		switch (args.aspect)
		{
			case "scale":
				this._xAxis.suspendChange();
				try
				{
					this._chartVisual.suspendRefresh();
					try
					{
						this._mouseRangeIndicatorX.modelLowerOffset = this._xAxis.dataRange.min;
						this._mouseRangeIndicatorX.modelUpperOffset = this._xAxis.dataRange.max;
					}
					finally
					{
						this._chartVisual.resumeRefresh();
					}
					this._chartVisual.refresh();
				}
				finally
				{
					this._xAxis.resumeChange();
				}
				break;
		}
		this._blockDataRangeChange = false;
	}

	async _chartAxisPanZoomBehavior_dataRangeAvailable(sender, args)
	{
		if (this._blockDataRangeChange) return;
		if (this._xAxis.dataRange.min == args.min && this._xAxis.dataRange.max == args.max) return;
		this._blockDataRangeChange = true;
		await this._setChartBounds(args.min, args.max);
	}

	async _chartPanZoomBehavior_dataRangeAvailable(sender, args)
	{
		if (this._blockDataRangeChange) return;
		if (this._xAxis.dataRange.min == args.min && this._xAxis.dataRange.max == args.max) return;
		this._blockDataRangeChange = true;
		await this._setChartBounds(args.min, args.max);
	}

	_chartRangeCudBehavior_cudCommand(sender, args)
	{
		switch (args.action)
		{
			case "delete":
				this._chartVisual.scene.indicators.remove(args.element);
				this._chartVisual.refresh();
				this._chartPersistentStorage.elements.remove(args.element);
				break;
			case "create":
				this._chartVisual.scene.indicators.add(args.element);
				ChartStyleSheet.defaultSceneStyle.applyToRange2d(args.element);
				this._chartVisual.refresh();
				break;
			case "commitCreate":
				this._chartPersistentStorage.elements.add(args.element);
				break;
			case "change":
				this._chartVisual.refresh();
				break;
			default:
				throw "Not implemented.";
		}
	}

	_chartRangeCudBehavior_selectionChanged(sender, args)
	{
		this._chartVisual.refresh();
	}

	async _chartRangeCudBehavior_dataRangeAvailable(sender, args)
	{
		if (this._blockDataRangeChange) return;
		if (this._rangeZoomHistory.length && this._rangeZoomHistory[this._rangeZoomHistory.length - 1].element == args.element) return;
		if (this._xAxis.dataRange.min == args.modelLowerX && this._xAxis.dataRange.max == args.modelUpperX) return;
		this._blockDataRangeChange = true;
		this._rangeZoomHistory.push(
		{
			element: args.element,
			lastModelLowerX: this._xAxis.dataRange.min,
			lastModelUpperX: this._xAxis.dataRange.max,
		});
		await this._setChartBounds(args.modelLowerX, args.modelUpperX);
	}

	async _chartKeyboardBehavior_keyPress(sender, args)
	{
		if (this._blockDataRangeChange) return;
		if (args.keyCode != "Escape") return;
		if (!this._rangeZoomHistory.length) return;
		if (this._xAxis.dataRange.min == this._lastModelLowerX && this._xAxis.dataRange.max == this._lastModelUpperX) return;
		this._blockDataRangeChange = true;
		var historyItem = this._rangeZoomHistory.pop();
		await this._setChartBounds(historyItem.lastModelLowerX, historyItem.lastModelUpperX);
	}


	async _setChartBounds(min, max)
	{
		this._chartVisual.suspendRefresh();
		try
		{
			this._xAxis.dataRange.setBounds(min, max);
			await this.onChanging({min: min, max: max});
		}
		finally
		{
			this._chartVisual.resumeRefresh();
		}
		this._chartVisual.refresh();
		this.onChanged({ min: min, max: max });
	}


	get enabled()
	{
		return this._enabled;
	}

	set enabled(value)
	{
		if (this._enabled == value) return;
		this._enabled = value;
		this._chartAxisPanZoomBehavior.enabled = value;
		this._chartPanZoomBehavior.enabled = value;
		this._chartRangeCudBehavior.enabled = value;
		this._chartKeyboardBehavior.enabled = value;
	}

	get chartVisual()
	{
		return this._chartVisual;
	}

	get xAxis()
	{
		return this._xAxis;
	}

	get yAxis()
	{
		return this._yAxis;
	}

	get minimapAxis()
	{
		return this._minimapAxis;
	}

	get mouseRangeIndicatorX()
	{
		return this._mouseRangeIndicatorX;
	}


	get changing()
	{
		return this._changing;
	}

	get changed()
	{
		return this._changed;
	}
}
