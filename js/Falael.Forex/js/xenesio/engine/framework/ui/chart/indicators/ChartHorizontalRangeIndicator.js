"use strict";

include("StdAfx.js");

class ChartHorizontalRangeIndicator extends ChartElement
{
	constructor(id, xAxis, visible)
	{
		super(id, 900, null, null, visible, "horizontalRange");

		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));

		this._backplaneColor = null;
		this._opacity = null;
		this._backplaneBorderLineStyle = new ChartLineStyle("backplaneBorderLineStyle", this);
		this._backplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));

		this._xLabelStyle = new ChartLabelStyle("xLabelStyle", this);
		this._xLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));
		this._xDeltaLabelStyle = new ChartLabelStyle("xDeltaLabelStyle", this);
		this._xDeltaLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));

		this._modelLowerX = null;
		this._modelUpperX = null;
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

		if (!backplaneValid)
		{
			var renderInfo =
			{
				aspects: ["boundingRect", "backplaneStyle"],
				primitive: "horizontalRange",
				style:
				{
					fill: this._backplaneColor,
				},
				lineStyle: this._backplaneBorderLineStyle,
				source: this,
				zIndex: this.zIndex,
				opacity: this._opacity,
			};

			renderPlan.renderInfos.push(renderInfo);

			renderInfo.x = sceneLowerX;
			renderInfo.y = this.boundingRect.y;
			renderInfo.width = sceneUpperX - sceneLowerX;
			renderInfo.height = this.boundingRect.height;

			this.__hitTestInfo =
			{
				element: this,
				elementType: "horizontalRange",
				sceneX: renderInfo.x,
				sceneY: renderInfo.y,
				sceneWidth: renderInfo.width,
				sceneHeight: renderInfo.height,
			};
			renderPlan.hitTestInfos.push(
			{
				aspects: ["boundingRect"],
				hitTestInfo: this.hitTestInfo,
				source: this,
			});

			if (!textStyleValid)
			{
				if (this.xLabelStyle.visible)
				{
					var topLeftTopText = this.xLabelStyle.formatter({ scaleInfo: this._xAxis.scaleInfoCache }, this.modelLowerX);
					var topLeftTopText_textSize = this.xLabelStyle.measureText(topLeftTopText);
					var renderInfo =
					{
						aspects: ["boundingRect", "textStyle"],
						primitive: "labelText",
						x: sceneLowerX,
						y: this.boundingRect.y,
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


				if (this.xDeltaLabelStyle.visible)
				{
					var xDeltaText = this.xDeltaLabelStyle.formatter({ scaleInfo: this._xAxis.scaleInfoCache }, this.modelLowerX, this.modelUpperX);
					var xDeltaText_textSize = this.xLabelStyle.measureText(xDeltaText);
					var renderInfo =
					{
						aspects: ["boundingRect", "textStyle"],
						primitive: "labelText",
						x: xDeltaText_textSize.width * 3 / 2 > sceneUpperX - sceneLowerX ? sceneUpperX + 10 : sceneLowerX + (sceneUpperX - sceneLowerX) / 2,
						y: this.boundingRect.y,
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


	get opacity()
	{
		return this._opacity;
	}

	set opacity(value)
	{
		if (this._opacity == value)
		{
			return;
		}
		this._opacity = value;
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

	get xLabelStyle()
	{
		return this._xLabelStyle;
	}

	get xDeltaLabelStyle()
	{
		return this._xDeltaLabelStyle;
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


	get sceneLowerX()
	{
		return this._xAxis.modelToScene(this.modelLowerX);
	}

	get sceneUpperX()
	{
		return this._xAxis.modelToScene(this.modelUpperX);
	}
}
