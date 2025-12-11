"use strict";

include("StdAfx.js");

class ChartAxisLabelIndicator extends ChartElement
{
	constructor(id, axis, visible)
	{
		super(id, 7900, null, null, visible, "axisLabel");

		this._axis = axis;
		this._axis.change.add(this._axis_change.bind(this));

		this._opacity = null;
		this._backplaneColor = null;
		this._backplaneBorderLineStyle = new ChartLineStyle("backplaneBorderLineStyle", this);
		this._backplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));
		this._labelStyle = new ChartLabelStyle("labelStyle", this);
		this._labelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));

		this._value = null;
		this._sceneOffset = null;
		this._modelOffset = null;
	}


	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var backplaneValid = boundingRectValid && this.__isAspectValid("backplaneStyle");
		var textStyleValid = boundingRectValid && this.__isAspectValid("textStyle");

		var paddingTop = 3;
		var paddingRight = 3;
		var paddingBottom = 1;
		var paddingLeft = 3;

		var marginTop = 0;
		var marginRight = 0;
		var marginBottom = 3;
		var marginLeft = 0;

		var textSize = null;
		var sceneOffset = this.modelOffset !== null ? this._axis.modelToScene(this.modelOffset) : this.sceneOffset;

		if (!backplaneValid)
		{
			textSize = this.labelStyle.measureText(this.text);

			var renderInfo =
			{
				aspects: ["boundingRect", "backplaneStyle"],
				primitive: "labelBackplane",
				style:
				{
					fill: this.backplaneColor,
				},
				opacity: this._opacity,
				lineStyle: this.backplaneBorderLineStyle,
				source: this,
				zIndex: this.zIndex + 1,
			};
			renderPlan.renderInfos.push(renderInfo);
			renderInfo.width = textSize.width + paddingLeft + paddingRight;
			renderInfo.height = textSize.height + paddingTop + paddingBottom;
			switch (this.axis.position)
			{
				case EChartAxisPosition.Bottom:
					renderInfo.x = sceneOffset - renderInfo.width / 2;
					renderInfo.y = this.axis.boundingRect.y + this.axis.boundingRect.height + marginBottom;
					break;
				case EChartAxisPosition.Right:
					renderInfo.x = this.axis.boundingRect.x - renderInfo.width - marginRight;
					renderInfo.y = sceneOffset - renderInfo.height / 2;
					break;
				case EChartAxisPosition.Top:
					renderInfo.x = sceneOffset - renderInfo.width / 2;
					renderInfo.y = this.axis.boundingRect.y - renderInfo.height - marginTop;
					break;
				case EChartAxisPosition.Left:
					renderInfo.x = this.axis.boundingRect.x + this.axis.boundingRect.width + marginLeft;
					renderInfo.y = sceneOffset - renderInfo.height / 2;
					break;
				default:
					throw "Not implemented.";
			}
			switch (this.axis.position)
			{
				case EChartAxisPosition.Top:
				case EChartAxisPosition.Bottom:
					if (renderInfo.x < this._axis.boundingRect.x) renderInfo.x = this._axis.boundingRect.x;
					else if (renderInfo.x + renderInfo.width + marginLeft + marginRight > this._axis.boundingRect.x + this._axis.boundingRect.width) renderInfo.x = this._axis.boundingRect.x + this._axis.boundingRect.width - renderInfo.width - marginLeft - marginRight;
					break;
				case EChartAxisPosition.Left:
				case EChartAxisPosition.Right:
					if (renderInfo.y < this._axis.boundingRect.y) renderInfo.y = this._axis.boundingRect.y;
					else if (renderInfo.y + renderInfo.height + marginTop + marginBottom > this._axis.boundingRect.y + this._axis.boundingRect.height) renderInfo.y = this._axis.boundingRect.y + this._axis.boundingRect.height - renderInfo.height - marginTop - marginBottom;
					break;
				default:
					throw "Not implemented.";
			}
		}

		if (!textStyleValid)
		{
			textSize = textSize || this.labelStyle.measureText(this.text);

			var renderInfo =
			{
				aspects: ["boundingRect", "textStyle"],
				primitive: "labelText",
				font: this.labelStyle.fontStyles,
				hAlign: EChartHAlign.Left,
				vAlign: EChartVAlign.Top,
				text: this.text,
				source: this,
			};
			renderPlan.renderInfos.push(renderInfo);
			renderInfo.width = textSize.width;
			renderInfo.height = textSize.height;
			switch (this.axis.position)
			{
				case EChartAxisPosition.Bottom:
					renderInfo.x = sceneOffset - renderInfo.width / 2;
					renderInfo.y = this.axis.boundingRect.y + this.axis.boundingRect.height + marginBottom;
					break;
				case EChartAxisPosition.Right:
					renderInfo.x = this.axis.boundingRect.x - renderInfo.width - marginRight - paddingRight;
					renderInfo.y = sceneOffset - renderInfo.height / 2;
					break;
				case EChartAxisPosition.Top:
					renderInfo.x = sceneOffset - renderInfo.width / 2;
					renderInfo.y = this.axis.boundingRect.y - renderInfo.height - marginTop - paddingTop;
					break;
				case EChartAxisPosition.Left:
					renderInfo.x = this.axis.boundingRect.x + this.axis.boundingRect.width + marginLeft + paddingLeft;
					renderInfo.y = sceneOffset - renderInfo.height / 2;
					break;
				default:
					throw "Not implemented.";
			}
			switch (this.axis.position)
			{
				case EChartAxisPosition.Top:
				case EChartAxisPosition.Bottom:
					if (renderInfo.x < this._axis.boundingRect.x) renderInfo.x = this._axis.boundingRect.x;
					else if (renderInfo.x + renderInfo.width + marginLeft + marginRight > this._axis.boundingRect.x + this._axis.boundingRect.width) renderInfo.x = this._axis.boundingRect.x + this._axis.boundingRect.width - renderInfo.width - marginLeft - marginRight;
					break;
				case EChartAxisPosition.Left:
				case EChartAxisPosition.Right:
					if (renderInfo.y < this._axis.boundingRect.y) renderInfo.y = this._axis.boundingRect.y;
					else if (renderInfo.y + renderInfo.height + marginLeft + marginRight > this._axis.boundingRect.y + this._axis.boundingRect.height) renderInfo.y = this._axis.boundingRect.y + this._axis.boundingRect.height - renderInfo.height - marginLeft - marginRight;
					break;
				default:
					throw "Not implemented.";
			}
		}
	}


	_axis_change(sender, args)
	{
		switch (args.aspect)
		{
			case "scale":
			case "boundingRect":
			case "labels":
				this.__invalidateAspect("boundingRect");
				break;
			case "line":
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

	get labelStyle()
	{
		return this._labelStyle;
	}


	get axis()
	{
		return this._axis;
	}

	set axis(value)
	{
		if (this._axis == value)
		{
			return;
		}
		this._axis = value;
		this.__invalidateAspect("boundingRect");
	}

	get text()
	{
		return this.labelStyle.formatter({ scaleInfo: this._axis.scaleInfoCache }, this._modelOffset !== null ? this._modelOffset : this._axis.sceneToModel(this._sceneOffset));
	}

	get sceneOffset()
	{
		return this._sceneOffset;
	}

	set sceneOffset(value)
	{
		if (this._sceneOffset == value)
		{
			return;
		}
		this._sceneOffset = value;
		this.__invalidateAspect("boundingRect");
	}

	get modelOffset()
	{
		return this._modelOffset;
	}

	set modelOffset(value)
	{
		if (this._modelOffset == value)
		{
			return;
		}
		this._modelOffset = value;
		this.__invalidateAspect("boundingRect");
	}
}
