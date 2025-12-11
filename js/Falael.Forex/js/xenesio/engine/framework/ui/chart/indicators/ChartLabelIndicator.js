"use strict";

include("StdAfx.js");

class ChartLabelIndicator extends ChartElement
{
	constructor(id, series, visible)
	{
		super(id, 7900, null, null, visible, "label");

		this._series = series;
		this._series.change.add(this._series_change.bind(this));

		this._hAlign = null;
		this._vAlign = null;

		this._opacity = null;
		this._backplaneColor = null;
		this._backplaneBorderLineStyle = new ChartLineStyle("backplaneBorderLineStyle", this);
		this._backplaneBorderLineStyle.change.add(function (sender, args) { this.__invalidateAspect("backplaneStyle"); }.bind(this));
		this._labelStyle = new ChartLabelStyle("labelStyle", this);
		this._labelStyle.change.add(function (sender, args) { this.__invalidateAspect("textStyle"); }.bind(this));

		this._value = null;
		this._textCache = null;
		this._sceneX = null;
		this._sceneY = null;
	}

	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var backplaneValid = boundingRectValid && this.__isAspectValid("backplaneStyle");
		var textStyleValid = boundingRectValid && this.__isAspectValid("textStyle");

		var paddingTop = 5;
		var paddingRight = 3;
		var paddingBottom = 3;
		var paddingLeft = 3;

		var marginTop = 3;
		var marginRight = 3;
		var marginBottom = 3;
		var marginLeft = 3;

		var textSize = null;

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
			switch (this.hAlign)
			{
				case EChartHAlign.Left:
					renderInfo.x = this.sceneX - renderInfo.width - marginRight;
					break;
				case EChartHAlign.Center:
					renderInfot.x = this.sceneX - renderInfo.width / 2;
					break;
				case EChartHAlign.Right:
					renderInfo.x = this.sceneX + marginLeft;
					break;
				default:
					throw "Not implemented.";
			}
			switch (this.vAlign)
			{
				case EChartVAlign.Top:
					renderInfo.y = this.sceneY + marginBottom;
					break;
				case EChartVAlign.Middle:
					renderInfo.y = this.sceneY + renderInfo.height / 2;
					break;
				case EChartVAlign.Bottom:
					renderInfo.y = this.sceneY - renderInfo.height - marginTop;
					break;
				default:
					throw "Not implemented.";
			}
			if (renderInfo.x < this._series.xAxis.boundingRect.x) renderInfo.x = this._series.xAxis.boundingRect.x;
			else if (renderInfo.x + renderInfo.width + marginLeft + marginRight > this._series.xAxis.boundingRect.x + this._series.xAxis.boundingRect.width) renderInfo.x = this._series.xAxis.boundingRect.x + this._series.xAxis.boundingRect.width - renderInfo.width - marginLeft - marginRight;
			if (renderInfo.y < this._series.yAxis.boundingRect.y) renderInfo.y = this._series.yAxis.boundingRect.y;
			else if (renderInfo.y + renderInfo.height + marginTop + marginBottom > this._series.yAxis.boundingRect.y + this._series.yAxis.boundingRect.height) renderInfo.y = this._series.yAxis.boundingRect.y + this._series.yAxis.boundingRect.height - renderInfo.height - marginTop - marginBottom;
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
			switch (this.hAlign)
			{
				case EChartHAlign.Left:
					renderInfo.x = this.sceneX - renderInfo.width - marginRight + paddingLeft;
					break;
				case EChartHAlign.Center:
					renderInfot.x = this.sceneX - renderInfo.width / 2 + paddingLeft;
					break;
				case EChartHAlign.Right:
					renderInfo.x = this.sceneX + marginLeft + paddingLeft;
					break;
				default:
					throw "Not implemented.";
			}
			switch (this.vAlign)
			{
				case EChartVAlign.Top:
					renderInfo.y = this.sceneY + marginBottom + paddingBottom;
					break;
				case EChartVAlign.Middle:
					renderInfo.y = this.sceneY + renderInfo.height / 2 + paddingBottom;
					break;
				case EChartVAlign.Bottom:
					renderInfo.y = this.sceneY - renderInfo.height - marginTop - paddingBottom;
					break;
				default:
					throw "Not implemented.";
			}
			if (renderInfo.x < this._series.xAxis.boundingRect.x) renderInfo.x = this._series.xAxis.boundingRect.x;
			else if (renderInfo.x + renderInfo.width + marginLeft + marginRight > this._series.xAxis.boundingRect.x + this._series.xAxis.boundingRect.width) renderInfo.x = this._series.xAxis.boundingRect.x + this._series.xAxis.boundingRect.width - renderInfo.width - marginLeft - marginRight;
			if (renderInfo.y < this._series.yAxis.boundingRect.y) renderInfo.y = this._series.yAxis.boundingRect.y;
			else if (renderInfo.y + renderInfo.height + marginTop + marginBottom > this._series.yAxis.boundingRect.y + this._series.yAxis.boundingRect.height) renderInfo.y = this._series.yAxis.boundingRect.y + this._series.yAxis.boundingRect.height - renderInfo.height - marginTop - marginBottom;
		}
	}


	_series_change(sender, args)
	{
		switch (args.aspect)
		{
			case "dataRanges":
			case "boundingRect":
				this.__invalidateAspect("boundingRect");
				break;
			default:
				throw "Not implemented.";
		}
	}


	get hAlign()
	{
		return this._hAlign;
	}

	set hAlign(value)
	{
		if (this._hAlign == value)
		{
			return;
		}
		this._hAlign = value;
		this.__invalidateAspect("boundingRect");
	}

	get vAlign()
	{
		return this._vAlign;
	}

	set vAlign(value)
	{
		if (this._vAlign == value)
		{
			return;
		}
		this._vAlign = value;
		this.__invalidateAspect("boundingRect");
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


	get series()
	{
		return this._series;
	}

	set series(value)
	{
		if (this._series == value)
		{
			return;
		}
		this._series = value;
		this.__invalidateAspect("boundingRect");
	}

	get value()
	{
		return this._value;
	}

	set value(value)
	{
		if (this._value == value)
		{
			return;
		}
		this._value = value;
		this._textCache = this.labelStyle.formatter(
		{
			scaleInfoX: this._series.xAxis.scaleInfoCache,
			scaleInfoY: this._series.yAxis.scaleInfoCache,
		},
		this._value);
		this.__invalidateAspect("boundingRect");
	}

	get text()
	{
		return this._textCache;
	}

	get sceneX()
	{
		return this._sceneX;
	}

	set sceneX(value)
	{
		if (this._sceneX == value)
		{
			return;
		}
		this._sceneX = value;
		this.__invalidateAspect("boundingRect");
	}

	get sceneY()
	{
		return this._sceneY;
	}

	set sceneY(value)
	{
		if (this._sceneY == value)
		{
			return;
		}
		this._sceneY = value;
		this.__invalidateAspect("boundingRect");
	}
}
