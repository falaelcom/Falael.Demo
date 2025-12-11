"use strict";

include("StdAfx.js");

class ChartRangeCudBehavior extends Behavior
{
	constructor(control, xAxis, yAxis)
	{
		super(control.backplane);

		this._xAxis = xAxis;
		this._yAxis = yAxis;
		this._elementTypes = ["backplane", "range2d"];

		this.enableEventRole(EBrowserEventType.MouseDown, "chart");
		this.enableEventRole(EBrowserEventType.DblClick, "chart");

		this._control = control;

		this._mode = ChartRangeCudBehavior.Mode.None;
		this._dragInfo = null;
		this._selectedRange = null;
		this._createdRange = null;

		this._cudCommand = new MulticastDelegate();
		this._selectionChanged = new MulticastDelegate();
		this._dataRangeAvailable = new MulticastDelegate();
	}

	onCudCommand(args)
	{
		this._cudCommand.execute(this, args);
	}

	onSelectionChanged(args)
	{
		this._selectionChanged.execute(this, args);
	}

	onDataRangeAvailable(args)
	{
		this._dataRangeAvailable.execute(this, args);
	}

	get cudCommand()
	{
		return this._cudCommand;
	}

	get selectionChanged()
	{
		return this._selectionChanged;
	}

	get dataRangeAvailable()
	{
		return this._dataRangeAvailable;
	}


	__onMouseMove(args)
	{
		if (!this._dragInfo)
		{
			return;
		}

		var mouseSceneX = args.localX;
		var mouseSceneY = this.control.deviceToScene(args.localY);
		var mouseModelX = this._xAxis.sceneToModel(mouseSceneX);
		var mouseModelY = this._yAxis.sceneToModel(mouseSceneY);
		var deltaSceneX = mouseSceneX - this._dragInfo.initialMouseSceneX;
		var deltaSceneY = mouseSceneY - this._dragInfo.initialMouseSceneY;

		if (!this._createdRange)
		{
			if (Math.abs(deltaSceneX) < 3 && Math.abs(deltaSceneX) < 3)
			{
				return;
			}

			this._mode = ChartRangeCudBehavior.Mode.Draw;
			this.enableEventRole(EBrowserEventType.KeyDown, "*");

			this._createdRange = new ChartRange2DIndicator("range2d_" + newLUID(), this._xAxis, this._yAxis, true);
			this._createdRange.state = EChartRange2DIndicatorState.New;
			this._createdRange.modelLowerX = deltaSceneX > 0 ? this._dragInfo.initialMouseModelX : mouseModelX;
			this._createdRange.modelUpperX = deltaSceneX > 0 ? mouseModelX : this._dragInfo.initialMouseModelX;
			this._createdRange.modelLowerY = deltaSceneY > 0 ? this._dragInfo.initialMouseModelY : mouseModelY;
			this._createdRange.modelUpperY = deltaSceneY > 0 ? mouseModelY : this._dragInfo.initialMouseModelY;
			this.onCudCommand({ action: "create", element: this._createdRange });
		}
		else
		{
			if (Math.abs(deltaSceneX) < 2 || Math.abs(deltaSceneX) < 2)
			{
				return;
			}
			this._createdRange.modelLowerX = deltaSceneX > 0 ? this._dragInfo.initialMouseModelX : mouseModelX;
			this._createdRange.modelUpperX = deltaSceneX > 0 ? mouseModelX : this._dragInfo.initialMouseModelX;
			this._createdRange.modelLowerY = deltaSceneY > 0 ? this._dragInfo.initialMouseModelY : mouseModelY;
			this._createdRange.modelUpperY = deltaSceneY > 0 ? mouseModelY : this._dragInfo.initialMouseModelY;
			this.onCudCommand({ action: "change", element: this._createdRange });
		}
	}

	__onMouseDown(args)
	{
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

		if (this._selectedRange)
		{
			this._selectedRange.state = EChartRange2DIndicatorState.Normal;
			this.onSelectionChanged({ element: this._selectedRange });
			this._selectedRange = null;
			this._mode = ChartRangeCudBehavior.Mode.None;
			this.disableEventRole(EBrowserEventType.KeyDown, "*");
		}
		switch (topTestResult.elementType)
		{
			case "backplane":
				if (this._createdRange)
				{
					this._createdRange.state = EChartRange2DIndicatorState.Normal;
					this.onCudCommand({ action: "delete", element: this._createdRange });
					this._createdRange = null;
					this.disableEventRole(EBrowserEventType.KeyDown, "*");
				}

				if (!args.keys.shiftKey)
				{
					break;
				}

				this._dragInfo =
				{
					initialMouseSceneX: args.localX,
					initialMouseSceneY: this.control.deviceToScene(args.localY),
					initialMouseModelX: this._xAxis.sceneToModel(args.localX),
					initialMouseModelY: this._yAxis.sceneToModel(this.control.deviceToScene(args.localY)),
				};
				this.enableEventRole(EBrowserEventType.MouseUp, "*");
				this.enableEventRole(EBrowserEventType.MouseMove, "*");
				break;
			case "range2d":
				if (this._createdRange == topTestResult.element)
				{
					break;
				}
				if (this._createdRange)
				{
					this._createdRange.state = EChartRange2DIndicatorState.Normal;
					this.onCudCommand({ action: "delete", element: this._createdRange });
					this._createdRange = null;
					this.disableEventRole(EBrowserEventType.KeyDown, "*");
				}
				if (!args.keys.shiftKey)
				{
					break;
				}
				this._mode = ChartRangeCudBehavior.Mode.Select;
				this._selectedRange = topTestResult.element;
				this._selectedRange.state = EChartRange2DIndicatorState.Selected;
				this.onSelectionChanged({ element: this._selectedRange });
				this.enableEventRole(EBrowserEventType.KeyDown, "*");
				break;
			default:
				throw "Not implemented.";
		}
	}

	__onMouseUp(args)
	{
		this._dragInfo = null;
		this._mode = ChartRangeCudBehavior.Mode.None;
		this.disableEventRole(EBrowserEventType.MouseUp, "*");
		this.disableEventRole(EBrowserEventType.MouseMove, "*");
	}

	__onKeyDown(args)
	{
		switch (this._mode)
		{
			case ChartRangeCudBehavior.Mode.None:
				if (this._createdRange)
				{
					switch (args.code)
					{
						case "Enter":
							this._createdRange.state = EChartRange2DIndicatorState.Normal;
							this.onSelectionChanged({ element: this._createdRange });
							this.onCudCommand({ action: "commitCreate", element: this._createdRange });
							this._createdRange = null;
							this._mode = ChartRangeCudBehavior.Mode.None;
							this.disableEventRole(EBrowserEventType.KeyDown, "*");
							break;
						case "Escape":
						case "NumpadDecimal":
						case "Delete":
						case "Backspace":
							this.onCudCommand({ action: "delete", element: this._createdRange });
							this._createdRange = null;
							this._mode = ChartRangeCudBehavior.Mode.None;
							this.disableEventRole(EBrowserEventType.KeyDown, "*");
							break;
					}
				}
				break;
			case ChartRangeCudBehavior.Mode.Draw:
				break;
			case ChartRangeCudBehavior.Mode.Select:
				//log(511, args.code);
				switch (args.code)
				{
					case "Escape":
						this._selectedRange.state = EChartRange2DIndicatorState.Normal;
						this.onSelectionChanged({ element: this._selectedRange });
						this._selectedRange = null;
						this._mode = ChartRangeCudBehavior.Mode.None;
						this.disableEventRole(EBrowserEventType.KeyDown, "*");
						break;
					case "NumpadDecimal":
					case "Delete":
					case "Backspace":
						this.onCudCommand({ action: "delete", element: this._selectedRange });
						this._selectedRange = null;
						this._mode = ChartRangeCudBehavior.Mode.None;
						this.disableEventRole(EBrowserEventType.KeyDown, "*");
						break;
				}
				break;
			default:
				throw "Not implemented.";
		}
	}

	__onDblClick(args)
	{
		if (args.button != 0)
		{
			return;
		}
		var hitTestResult = this.control.hitTest(args.localX, args.localY, function (element)
		{
			return ["range2d"].indexOf(element.elementType) != -1;
		}.bind(this));
		if (!hitTestResult)
		{
			return;
		}
		hitTestResult.items.sort(function (left, right)
		{
			return left.element.screenArea - right.element.screenArea;
		});
		var topTestResult = hitTestResult.items[0];

		this.onDataRangeAvailable(
		{
			element: topTestResult.element,
			modelLowerX: topTestResult.element.modelLowerX,
			modelUpperX: topTestResult.element.modelUpperX,
			modelLowerY: topTestResult.element.modelLowerY,
			modelUpperY: topTestResult.element.modelUpperY,
		});
	}


	get control()
	{
		return this._control;
	}

	get xAxis()
	{
		return this._xAxis;
	}

	get yAxis()
	{
		return this._yAxis;
	}
}

ChartRangeCudBehavior.Mode =
{
	None: 0,
	Draw: 1,
	//ResizeTL: 2,
	//ResizeTR: 3,
	//ResizeBL: 4,
	//ResizeBR: 5,
	//ResizeT: 6,
	//ResizeB: 7,
	//ResizeL: 8,
	//ResizeR: 9,
	Select: 10,
};