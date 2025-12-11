"use strict";

include("StdAfx.js");

class ChartHorizontalRangeSelectBehavior extends Behavior
{
	constructor(control, axis)
	{
		super(control.backplane);

		if (axis.position != EChartAxisPosition.Top && axis.position != EChartAxisPosition.Bottom)
		{
			throw "Argument is not valid: axis.position.";
		}

		this._control = control;
		this._axis = axis;
		this._gripperSize = 9;

		this.enableEventRole(EBrowserEventType.MouseDown, "chart");
		this.enableEventRole(EBrowserEventType.MouseMove, "*");
		this.enableEventRole(EBrowserEventType.KeyUp, "*");

		this._mode = ChartHorizontalRangeSelectBehavior.Mode.None;
		this._dragInfo = null;
		this._createdRange = null;

		this._cudCommand = new MulticastDelegate();
		this._dataRangeAvailable = new MulticastDelegate();
	}


	onCudCommand(args)
	{
		this._cudCommand.execute(this, args);
	}

	onDataRangeAvailable(args)
	{
		this._dataRangeAvailable.execute(this, args);
	}


	get cudCommand()
	{
		return this._cudCommand;
	}

	get dataRangeAvailable()
	{
		return this._dataRangeAvailable;
	}


	__onMouseMove(args)
	{
		if (!args.keys.altKey)
		{
			return;
		}
		if (!this._dragInfo)
		{
			if (this._createdRange)
			{
				if (args.localX >= Math.floor(this._createdRange.sceneLowerX - this._gripperSize / 2) &&
					args.localX <= Math.ceil(this._createdRange.sceneLowerX + this._gripperSize / 2))
				{
					document.body.style.cursor = "col-resize";
					return;
				}
				if (args.localX >= Math.floor(this._createdRange.sceneUpperX - this._gripperSize / 2) &&
					args.localX <= Math.ceil(this._createdRange.sceneUpperX + this._gripperSize / 2))
				{
					document.body.style.cursor = "col-resize";
					return;
				}
			}
			document.body.style.cursor = "auto";
			return;
		}

		var mouseSceneOffset = args.localX;
		var deltaSceneOffset = mouseSceneOffset - this._dragInfo.initialMouseSceneOffset;
		var deltaModelOffset = this._axis.sceneToModel(deltaSceneOffset) - this._axis.sceneToModel(0);

		if (!this._createdRange)
		{
			if (Math.abs(deltaSceneOffset) < 3 && Math.abs(deltaSceneOffset) < 3)
			{
				return;
			}
			switch (this._mode)
			{
				case ChartHorizontalRangeSelectBehavior.Mode.None:
				case ChartHorizontalRangeSelectBehavior.Mode.ResizeL:
				case ChartHorizontalRangeSelectBehavior.Mode.ResizeR:
					break;
				case ChartHorizontalRangeSelectBehavior.Mode.Draw:
					this._createdRange = new ChartHorizontalRangeIndicator("horizontalRange_" + newLUID(), this._axis, true);
					this._createdRange.modelLowerX = this._axis.sceneToModel(deltaSceneOffset > 0 ? this._dragInfo.initialMouseSceneOffset : mouseSceneOffset);
					this._createdRange.modelUpperX = this._axis.sceneToModel(deltaSceneOffset > 0 ? mouseSceneOffset : this._dragInfo.initialMouseSceneOffset);
					this.onCudCommand({ action: "create", element: this._createdRange });
					break;
				default:
					throw "Not implemented.";
			}
		}
		else
		{
			switch (this._mode)
			{
				case ChartHorizontalRangeSelectBehavior.Mode.None:
					throw "Invalid operation.";
				case ChartHorizontalRangeSelectBehavior.Mode.Draw:
					if (Math.abs(deltaSceneOffset) < 2 || Math.abs(deltaSceneOffset) < 2)
					{
						return;
					}
					this._createdRange.modelLowerX = this._axis.sceneToModel(deltaSceneOffset > 0 ? this._dragInfo.initialMouseSceneOffset : mouseSceneOffset);
					this._createdRange.modelUpperX = this._axis.sceneToModel(deltaSceneOffset > 0 ? mouseSceneOffset : this._dragInfo.initialMouseSceneOffset);
					this.onCudCommand({ action: "change", element: this._createdRange });
					break;
				case ChartHorizontalRangeSelectBehavior.Mode.ResizeL:
					if (Math.abs(deltaSceneOffset) < 2 || Math.abs(deltaSceneOffset) < 2)
					{
						return;
					}
					this._createdRange.modelLowerX = this._axis.sceneToModel(mouseSceneOffset);
					this.onCudCommand({ action: "change", element: this._createdRange });
					break;
				case ChartHorizontalRangeSelectBehavior.Mode.ResizeR:
					if (Math.abs(deltaSceneOffset) < 2 || Math.abs(deltaSceneOffset) < 2)
					{
						return;
					}
					this._createdRange.modelUpperX = this._axis.sceneToModel(mouseSceneOffset);
					this.onCudCommand({ action: "change", element: this._createdRange });
					break;
				case ChartHorizontalRangeSelectBehavior.Mode.Move:
					if (Math.abs(deltaSceneOffset) < 2 || Math.abs(deltaSceneOffset) < 2)
					{
						return;
					}
					this._createdRange.modelLowerX = this._dragInfo.initialModelLowerOffset + deltaModelOffset;
					this._createdRange.modelUpperX = this._dragInfo.initialModelUpperOffset + deltaModelOffset;
					this.onCudCommand({ action: "change", element: this._createdRange });
					break;
				default:
					throw "Not implemented.";
			}
			this.onDataRangeAvailable(
			{
				min: this._createdRange.modelLowerX,
				max: this._createdRange.modelUpperX,
			});
		}
	}

	__onMouseDown(args)
	{
		if (!args.keys.altKey)
		{
			return;
		}
		if (args.button != 0)
		{
			return;
		}
		var hitTestResult = this.control.hitTest(args.localX, args.localY, function (element)
		{
			return element.elementType == "backplane";
		}.bind(this));
		if (!hitTestResult)
		{
			return;
		}
		var topTestResult = hitTestResult.items[0];

		this._dragInfo =
		{
			initialMouseSceneOffset: args.localX,
			initialModelLowerOffset: this._createdRange ? this._createdRange.modelLowerX : this._axis.dataRange.min,
			initialModelUpperOffset: this._createdRange ? this._createdRange.modelUpperX : this._axis.dataRange.max,
		};
		this.enableEventRole(EBrowserEventType.MouseUp, "*");

		if (this._createdRange)
		{
			if (args.localX >= Math.floor(this._createdRange.sceneLowerX - this._gripperSize / 2) &&
				args.localX <= Math.ceil(this._createdRange.sceneLowerX + this._gripperSize / 2))
			{
				this._mode = ChartHorizontalRangeSelectBehavior.Mode.ResizeL;
				return;
			}
			if (args.localX >= Math.floor(this._createdRange.sceneUpperX - this._gripperSize / 2) &&
				args.localX <= Math.ceil(this._createdRange.sceneUpperX + this._gripperSize / 2))
			{
				this._mode = ChartHorizontalRangeSelectBehavior.Mode.ResizeR;
				return;
			}
			if (args.localX >= Math.floor(this._createdRange.sceneLowerX + this._gripperSize / 2) &&
				args.localX <= Math.ceil(this._createdRange.sceneUpperX - this._gripperSize / 2))
			{
				this._mode = ChartHorizontalRangeSelectBehavior.Mode.Move;
				return;
			}

			this.onCudCommand({ action: "delete", element: this._createdRange });
			this._createdRange = null;
		}
		this._mode = ChartHorizontalRangeSelectBehavior.Mode.Draw;
	}

	__onMouseUp(args)
	{
		if (this._createdRange)
		{
			switch (this._mode)
			{
				case ChartHorizontalRangeSelectBehavior.Mode.None:
					throw "Invalid operation.";
				case ChartHorizontalRangeSelectBehavior.Mode.Draw:
					//this.onDataRangeAvailable(
					//{
					//	min: this._createdRange.modelLowerX,
					//	max: this._createdRange.modelUpperX,
					//});
					break;
				case ChartHorizontalRangeSelectBehavior.Mode.ResizeL:
				case ChartHorizontalRangeSelectBehavior.Mode.ResizeR:
				case ChartHorizontalRangeSelectBehavior.Mode.Move:
					break;
				default:
					throw "Not implemented.";
			}
		}
		else
		{
			this.onDataRangeAvailable({empty: true});
		}

		this._mode = ChartHorizontalRangeSelectBehavior.Mode.None;
		this._dragInfo = null;
		this.disableEventRole(EBrowserEventType.MouseUp, "*");
		document.body.style.cursor = "auto";
	}

	__onKeyUp(args)
	{
		switch (args.code)
		{
			case "AltLeft":
			case "AltRight":
				document.body.style.cursor = "auto";
				break;
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
}

ChartHorizontalRangeSelectBehavior.Mode =
{
	None: 0,
	Draw: 1,
	ResizeL: 2,
	ResizeR: 3,
	Move: 4,
};