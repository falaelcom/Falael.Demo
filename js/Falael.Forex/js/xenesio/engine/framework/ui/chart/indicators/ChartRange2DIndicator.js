"use strict";

include("StdAfx.js");

class ChartRange2DIndicator extends ChartElement
{
	constructor(id, xAxis, yAxis, visible)
	{
		super(id, 1000, null, null, visible, "range2d");

		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		this._yAxis.change.add(this._yAxis_change.bind(this));

		this._state = EChartRange2DIndicatorState.Normal;

		this._areaRatio1 = null;
		this._areaRatio2 = null;
		this._opacity1 = null;
		this._opacity2 = null;
		this._textVisibile_screenWidthThreshold = null;

		this._backplaneColor = null;
		this._backplaneBorderLineStyle = new ChartLineStyle("backplaneBorderLineStyle", this);
		this._backplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));
		this._selectedBackplaneColor = null;
		this._selectedBackplaneBorderLineStyle = new ChartLineStyle("selectedBackplaneBorderLineStyle", this);
		this._selectedBackplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));
		this._newBackplaneColor = null;
		this._newBackplaneBorderLineStyle = new ChartLineStyle("newBackplaneBorderLineStyle", this);
		this._newBackplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));

		this._xLabelStyle = new ChartLabelStyle("xLabelStyle", this);
		this._xLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));
		this._yLabelStyle = new ChartLabelStyle("yLabelStyle", this);
		this._yLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));
		this._xDeltaLabelStyle = new ChartLabelStyle("xDeltaLabelStyle", this);
		this._xDeltaLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));
		this._yDeltaLabelStyle = new ChartLabelStyle("yDeltaLabelStyle", this);
		this._yDeltaLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));

		this._modelLowerX = null;
		this._modelUpperX = null;
		this._modelLowerY = null;
		this._modelUpperY = null;
	}

	static fromJson(context, json)
	{
		if (json.type != "ChartRange2DIndicator")
		{
			throw "Invalid argument \"json.type\".";
		}

		var xAxis = context.control.scene.getChildById(json.xAxisId);
		var yAxis = context.control.scene.getChildById(json.yAxisId);

		if (!xAxis || !yAxis) return null;

		var result = new ChartRange2DIndicator(json.id, xAxis, yAxis, json.visible);

		result.modelLowerX = json.modelLowerX;
		result.modelUpperX = json.modelUpperX;
		result.modelLowerY = json.modelLowerY;
		result.modelUpperY = json.modelUpperY;

		return result;
	}

	toJson()
	{
		var result =
		{
			type: "ChartRange2DIndicator",
			id: this.id,
			visible: this.visible,
			xAxisId: this._xAxis.id,
			yAxisId: this._yAxis.id,
			modelLowerX: this._modelLowerX,
			modelUpperX: this._modelUpperX,
			modelLowerY: this._modelLowerY,
			modelUpperY: this._modelUpperY,
		};
		return result;
	}


	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var backplaneValid = boundingRectValid && this.__isAspectValid("backplaneStyle");
		var textStyleValid = boundingRectValid && this.__isAspectValid("textStyle");

		var sceneLowerX = this._xAxis.modelToScene(this.modelLowerX);
		var sceneUpperX = this._xAxis.modelToScene(this.modelUpperX);
		var sceneLowerY = this._yAxis.modelToScene(this.modelLowerY);
		var sceneUpperY = this._yAxis.modelToScene(this.modelUpperY);

		//	adaptive opacity
		var indicatorArea = (sceneUpperX - sceneLowerX) * (sceneUpperY - sceneLowerY);
		var backplaneRect = this.boundingRect.width * this.boundingRect.height;
		var areaRatio = indicatorArea / backplaneRect;

		var areaRatio1 = this._areaRatio1;
		var areaRatio2 = this._areaRatio2;
		var opacity1 = this._opacity1;
		var opacity2 = this._opacity2;

		var opacity;
		if (areaRatio < areaRatio1) opacity = opacity1;
		else if (areaRatio > areaRatio2) opacity = opacity2;
		else
		{
			var a = (opacity1 - opacity2) / (areaRatio1 - areaRatio2)
			var b = opacity1 - a * areaRatio1;
			opacity = a * areaRatio + b;
		}
		//	adaptive opacity end

		if (!backplaneValid)
		{
			if (!opacity)
			{
				var renderInfo =
				{
					aspects: ["boundingRect", "backplaneStyle"],
					primitive: "$clearAspects",
					source: this,
				};
				renderPlan.renderInfos.push(renderInfo);
				this.__hitTestInfo = null;
				renderPlan.hitTestInfos.push(
				{
					aspects: ["boundingRect"],
					hitTestInfo: "$clearAspects",
					source: this,
				});
			}
			else
			{
				var renderInfo =
				{
					aspects: ["boundingRect", "backplaneStyle"],
					primitive: "range2d",
					style:
					{
						fill: null,
					},
					lineStyle: null,
					source: this,
					zIndex: this.zIndex + 1,
					opacity: opacity,
				};
				switch (this.state)
				{
					case EChartRange2DIndicatorState.Normal:
						renderInfo.style.fill = this.backplaneColor;
						renderInfo.lineStyle = this.backplaneBorderLineStyle;
						break;
					case EChartRange2DIndicatorState.Selected:
						renderInfo.style.fill = this.selectedBackplaneColor;
						renderInfo.lineStyle = this.selectedBackplaneBorderLineStyle;
						break;
					case EChartRange2DIndicatorState.New:
						renderInfo.style.fill = this.newBackplaneColor;
						renderInfo.lineStyle = this.newBackplaneBorderLineStyle;
						break;
					default:
						throw "Not implemented.";
				}

				renderPlan.renderInfos.push(renderInfo);

				renderInfo.x = sceneLowerX;
				renderInfo.y = sceneLowerY;
				renderInfo.width = sceneUpperX - sceneLowerX;
				renderInfo.height = sceneUpperY - sceneLowerY;

				this.__hitTestInfo =
				{
					element: this,
					elementType: "range2d",
					sceneX: renderInfo.x,
					sceneY: renderInfo.y,
					sceneWidth: opacity ? renderInfo.width : 0,
					sceneHeight: opacity ? renderInfo.height : 0,
				};
				renderPlan.hitTestInfos.push(
				{
					aspects: ["boundingRect"],
					hitTestInfo: this.hitTestInfo,
					source: this,
				});
			}

			if (!opacity || sceneUpperX - sceneLowerX < this._textVisibile_screenWidthThreshold)
			{
				var renderInfo =
				{
					aspects: ["boundingRect", "textStyle"],
					primitive: "$clearAspects",
					source: this,
				};
				renderPlan.renderInfos.push(renderInfo);
			}
			else
			{
				if (!textStyleValid)
				{
					if (this.xLabelStyle.visible)
					{
						var topLeftTopText = this.xLabelStyle.formatter({ scaleInfo: this._xAxis.scaleInfoCache }, this.modelLowerX);
						var topLeftTopText_textSize = this.xLabelStyle.measureText(topLeftTopText);
						var renderInfo =
						{
							aspects: ["boundingRect", "textStyle"],
							primitive: "label",
							x: sceneLowerX,
							y: sceneUpperY,
							width: topLeftTopText_textSize.width,
							height: topLeftTopText_textSize.height,
							font: this.xLabelStyle.fontStyles,
							hAlign: EChartHAlign.Left,
							vAlign: EChartVAlign.Top,
							text: topLeftTopText,
							source: this,
						};
						renderPlan.renderInfos.push(renderInfo);
					}

					if (this.yLabelStyle.visible)
					{
						var topLeftLeftText = this.yLabelStyle.formatter({ scaleInfo: this._yAxis.scaleInfoCache }, this.modelUpperY);
						var topLeftLeftText_textSize = this.yLabelStyle.measureText(topLeftLeftText);
						var renderInfo =
						{
							aspects: ["textStyle"],
							primitive: "label",
							x: sceneLowerX - 2,
							y: sceneUpperY,
							width: topLeftLeftText_textSize.width,
							height: topLeftLeftText_textSize.height,
							font: this.yLabelStyle.fontStyles,
							hAlign: EChartHAlign.Right,
							vAlign: EChartVAlign.Bottom,
							text: topLeftLeftText,
							source: this,
						};
						renderPlan.renderInfos.push(renderInfo);
					}

					if (this.xLabelStyle.visible)
					{
						var bottomRightBottomText = this.xLabelStyle.formatter({ scaleInfo: this._xAxis.scaleInfoCache }, this.modelUpperX);
						var bottomRightBottomText_textSize = this.xLabelStyle.measureText(bottomRightBottomText);
						var renderInfo =
						{
							aspects: ["textStyle"],
							primitive: "label",
							x: sceneUpperX,
							y: sceneLowerY - 2,
							width: bottomRightBottomText_textSize.width,
							height: bottomRightBottomText_textSize.height,
							font: this.xLabelStyle.fontStyles,
							hAlign: EChartHAlign.Right,
							vAlign: EChartVAlign.Bottom,
							text: bottomRightBottomText,
							source: this,
						};
						renderPlan.renderInfos.push(renderInfo);
					}

					if (this.yLabelStyle.visible)
					{
						var bottomRightRightText = this.yLabelStyle.formatter({ scaleInfo: this._yAxis.scaleInfoCache }, this.modelLowerY);
						var bottomRightRightText_textSize = this.yLabelStyle.measureText(bottomRightRightText);
						var renderInfo =
						{
							aspects: ["textStyle"],
							primitive: "label",
							x: sceneUpperX + 3,
							y: sceneLowerY,
							width: bottomRightRightText_textSize.width,
							height: bottomRightRightText_textSize.height,
							font: this.yLabelStyle.fontStyles,
							hAlign: EChartHAlign.Left,
							vAlign: EChartVAlign.Top,
							text: bottomRightRightText,
							source: this,
						};
						renderPlan.renderInfos.push(renderInfo);
					}

					if (this.xDeltaLabelStyle.visible)
					{
						var xDeltaText = this.xDeltaLabelStyle.formatter({ scaleInfo: this._xAxis.scaleInfoCache }, this.modelLowerX, this.modelUpperX);
						var xDeltaText_textSize = this.xLabelStyle.measureText(xDeltaText);
						var renderInfo =
						{
							aspects: ["textStyle"],
							primitive: "label",
							x: xDeltaText_textSize.width * 3 / 2 > sceneUpperX - sceneLowerX ? sceneUpperX + 10 : sceneLowerX + (sceneUpperX - sceneLowerX) / 2,
							y: sceneUpperY,
							width: xDeltaText_textSize.width,
							height: xDeltaText_textSize.height,
							font: this.xDeltaLabelStyle.fontStyles,
							hAlign: xDeltaText_textSize.width * 3 / 2 > sceneUpperX - sceneLowerX ? EChartHAlign.Left : EChartHAlign.Center,
							vAlign: EChartVAlign.Bottom,
							text: xDeltaText,
							source: this,
						};
						renderPlan.renderInfos.push(renderInfo);
					}

					if (this.yDeltaLabelStyle.visible)
					{
						var yDeltaText = this.yDeltaLabelStyle.formatter({ scaleInfo: this._yAxis.scaleInfoCache }, this.modelLowerY, this.modelUpperY);
						var yDeltaText_textSize = this.yLabelStyle.measureText(yDeltaText);
						var renderInfo =
						{
							aspects: ["textStyle"],
							primitive: "label",
							x: yDeltaText_textSize.width * 3 / 2 > sceneUpperX - sceneLowerX ? sceneUpperX + 10 : sceneUpperX - 10,
							y: sceneLowerY + (sceneUpperY - sceneLowerY) / 2,
							width: yDeltaText_textSize.width,
							height: yDeltaText_textSize.height,
							font: this.yDeltaLabelStyle.fontStyles,
							hAlign: yDeltaText_textSize.width * 3 / 2 > sceneUpperX - sceneLowerX ? EChartHAlign.Left : EChartHAlign.Right,
							vAlign: EChartVAlign.Middle,
							text: yDeltaText,
							source: this,
						};
						renderPlan.renderInfos.push(renderInfo);
					}
				}
			}
		}
	}



	_xAxis_change(sender, args)
	{
		switch (args.aspect)
		{
			case "scale":
			case "boundingRect":
				this.__invalidateAspect("boundingRect");
				break;
			case "line":
			case "labels":
				break;
			default:
				throw "Not implemented.";
		}
	}

	_yAxis_change(sender, args)
	{
		switch (args.aspect)
		{
			case "scale":
			case "boundingRect":
				this.__invalidateAspect("boundingRect");
				break;
			case "line":
			case "labels":
				break;
			default:
				throw "Not implemented.";
		}
	}


	get screenArea()
	{
		var sceneLowerX = this._xAxis.modelToScene(this.modelLowerX);
		var sceneUpperX = this._xAxis.modelToScene(this.modelUpperX);
		var sceneLowerY = this._yAxis.modelToScene(this.modelLowerY);
		var sceneUpperY = this._yAxis.modelToScene(this.modelUpperY);

		return (sceneUpperX - sceneLowerX) * (sceneUpperY - sceneLowerY);
	}


	get state()
	{
		return this._state;
	}

	set state(value)
	{
		if (this._state == value)
		{
			return;
		}
		this._state = value;
		this.__invalidateAspect("backplaneStyle");
	}


	get areaRatio1()
	{
		return this._areaRatio1;
	}

	set areaRatio1(value)
	{
		if (this._areaRatio1 == value)
		{
			return;
		}
		this._areaRatio1 = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get areaRatio2()
	{
		return this._areaRatio2;
	}

	set areaRatio2(value)
	{
		if (this._areaRatio2 == value)
		{
			return;
		}
		this._areaRatio2 = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get opacity1()
	{
		return this._opacity1;
	}

	set opacity1(value)
	{
		if (this._opacity1 == value)
		{
			return;
		}
		this._opacity1 = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get opacity2()
	{
		return this._opacity2;
	}

	set opacity2(value)
	{
		if (this._opacity2 == value)
		{
			return;
		}
		this._opacity2 = value;
		this.__invalidateAspect("backplaneStyle");
	}


	get backplaneColor()
	{
		return this._backplaneColor;
	}

	set backplaneColor(value)
	{
		if (this._backplaneColor == value)
		{
			return;
		}
		this._backplaneColor = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get backplaneBorderLineStyle()
	{
		return this._backplaneBorderLineStyle;
	}

	get selectedBackplaneColor()
	{
		return this._selectedBackplaneColor;
	}

	set selectedBackplaneColor(value)
	{
		if (this._selectedBackplaneColor == value)
		{
			return;
		}
		this._selectedBackplaneColor = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get selectedBackplaneBorderLineStyle()
	{
		return this._selectedBackplaneBorderLineStyle;
	}

	get newBackplaneColor()
	{
		return this._newBackplaneColor;
	}

	set newBackplaneColor(value)
	{
		if (this._newBackplaneColor == value)
		{
			return;
		}
		this._newBackplaneColor = value;
		this.__invalidateAspect("backplaneStyle");
	}

	get newBackplaneBorderLineStyle()
	{
		return this._newBackplaneBorderLineStyle;
	}


	get textVisibile_screenWidthThreshold()
	{
		return this._textVisibile_screenWidthThreshold;
	}

	set textVisibile_screenWidthThreshold(value)
	{
		if (this._textVisibile_screenWidthThreshold == value)
		{
			return;
		}
		this._textVisibile_screenWidthThreshold = value;
		this.__invalidateAspect("textStyle");
	}

	get xLabelStyle()
	{
		return this._xLabelStyle;
	}

	get yLabelStyle()
	{
		return this._yLabelStyle;
	}

	get xDeltaLabelStyle()
	{
		return this._xDeltaLabelStyle;
	}

	get yDeltaLabelStyle()
	{
		return this._yDeltaLabelStyle;
	}


	get xAxis()
	{
		return this._xAxis;
	}

	set xAxis(value)
	{
		if (this._xAxis == value)
		{
			return;
		}
		this._xAxis = value;
		this.__invalidateAspect("boundingRect");
	}

	get yAxis()
	{
		return this._yAxis;
	}

	set yAxis(value)
	{
		if (this._yAxis == value)
		{
			return;
		}
		this._yAxis = value;
		this.__invalidateAspect("boundingRect");
	}


	get modelLowerX()
	{
		return this._modelLowerX;
	}

	set modelLowerX(value)
	{
		if (this._modelLowerX == value)
		{
			return;
		}
		this._modelLowerX = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelUpperX()
	{
		return this._modelUpperX;
	}

	set modelUpperX(value)
	{
		if (this._modelUpperX == value)
		{
			return;
		}
		this._modelUpperX = value;
		this.__invalidateAspect("boundingRect");
	}


	get modelLowerY()
	{
		return this._modelLowerY;
	}

	set modelLowerY(value)
	{
		if (this._modelLowerY == value)
		{
			return;
		}
		this._modelLowerY = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelUpperY()
	{
		return this._modelUpperY;
	}

	set modelUpperY(value)
	{
		if (this._modelUpperY == value)
		{
			return;
		}
		this._modelUpperY = value;
		this.__invalidateAspect("boundingRect");
	}
}
