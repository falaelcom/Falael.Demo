"use strict";

include("StdAfx.js");

class ChartAxis extends ChartElement
{
	constructor(id, valueType, dataRange, axisTypeId)
	{
		super(id, 8000, null, null, true, axisTypeId);

		this._valueType = valueType;		//	EChartDataType

		this._dataRange = dataRange;
		this._dataRange.change.add(this._dataRange_change.bind(this));

		this._position = null;
		this._spread = null;
		this._paddingLower = null;
		this._paddingUpper = null;

		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("line"); }.bind(this));

		this._rangeLabelStyle = new ChartLabelStyle("rangeLabelStyle", this);
		this._rangeLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("labels"); }.bind(this));
		this._rangeStartLabelStyle = new ChartLabelStyle("rangeStartLabelStyle", this);
		this._rangeStartLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("labels"); }.bind(this));
		this._rangeEndLabelStyle = new ChartLabelStyle("rangeEndLabelStyle", this);
		this._rangeEndLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("labels"); }.bind(this));

		this._majorTickLength = null;
		this._majorTickLabelOffset = null;
		this._majorTickLineStyle = new ChartLineStyle("majorTickLineStyle", this);
		this._majorTickLineStyle.change.add(function (sender, args) { this.__invalidateAspect("scale"); }.bind(this));
		this._majorTickLabelStyle = new ChartLabelStyle("majorTickLabelStyle", this);
		this._majorTickLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("labels"); }.bind(this));

		this._minorTickLength = null;
		this._minorTickLabelOffset = null;
		this._minorTickLineStyle = new ChartLineStyle("minorTickLineStyle", this);
		this._minorTickLineStyle.change.add(function (sender, args) { this.__invalidateAspect("scale"); }.bind(this));
		this._minorTickLabelStyle = new ChartLabelStyle("minorTickLabelStyle", this);
		this._minorTickLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("labels"); }.bind(this));

		this._microTickLength = null;
		this._microTickLineStyle = new ChartLineStyle("microTickLineStyle", this);
		this._microTickLineStyle.change.add(function (sender, args) { this.__invalidateAspect("scale"); }.bind(this));

		this._runningTickLength = null;
		this._runningTickLabelOffset = null;
		this._runningTickLineStyle = new ChartLineStyle("runningTickLineStyle", this);
		this._runningTickLineStyle.change.add(function (sender, args) { this.__invalidateAspect("scale"); }.bind(this));
		this._runningTickLabelStyle = new ChartLabelStyle("runningTickLabelStyle", this);
		this._runningTickLabelStyle.change.add(function (sender, args) { this.__invalidateAspect("labels"); }.bind(this));

		this._scaleInfoCache = null;
	}


	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var lineValid = boundingRectValid && this.__isAspectValid("line");
		var scaleValid = lineValid && this.__isAspectValid("scale");
		var labelsValid = scaleValid && this.__isAspectValid("labels");

		if (!boundingRectValid) this.__buildRenderPlan_hitTestInfo(renderPlan, ["boundingRect"]);
		if (!lineValid) this.__buildRenderPlan_line(renderPlan, ["line"]);

		if (!scaleValid || !labelsValid)
		{
			this._scaleInfoCache = this.__buildScale();

			if (!scaleValid) for (var length = this._scaleInfoCache.ticks.length, i = 0; i < length; ++i) this.__buildRenderPlan_tick(renderPlan, this._scaleInfoCache.ticks[i], ["scale"]);

			if (!labelsValid)
			{
				var formatingContext_majorTick = { scaleInfo: this._scaleInfoCache };
				var formatingContext_minorTick = { scaleInfo: this._scaleInfoCache };
				var formatingContext_runningTick = { scaleInfo: this._scaleInfoCache };

				switch (this._valueType)
				{
					case EChartDataType.DateTime:
						this.__buildRenderPlan_rangeStartLabel(renderPlan, ["labels"]);
						this.__buildRenderPlan_rangeEndLabel(renderPlan, ["labels"]);
						break;
					case EChartDataType.Numeric:
						break;
					default:
						throw "Not implemented.";
				}

				for (var length = this._scaleInfoCache.ticks.length, i = 0; i < length; ++i) this.__buildRenderPlan_tickLabel(renderPlan, formatingContext_majorTick, formatingContext_minorTick, formatingContext_runningTick, this._scaleInfoCache.ticks[i], ["labels"]);

				this.__buildRenderPlan_rangeLabel(renderPlan, ["labels"])
			}
		}
	}

	__buildRenderPlan_hitTestInfo(renderPlan, aspects)
	{
		this.__hitTestInfo =
		{
			element: this,
			elementType: "axis",
			sceneX: this.boundingRect.x,
			sceneY: this.boundingRect.y,
			sceneWidth: this.boundingRect.width,
			sceneHeight: this.boundingRect.height,
			sceneOriginInflated: null,
			sceneLengthInflated: null,
		};
		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				this.hitTestInfo.sceneOriginInflated = this.boundingRect.x;
				this.hitTestInfo.sceneLengthInflated = this.boundingRect.width;
				break;
			case EChartAxisPosition.Right:
				this.hitTestInfo.sceneOriginInflated = this.boundingRect.y;
				this.hitTestInfo.sceneLengthInflated = this.boundingRect.height;
				break;
			case EChartAxisPosition.Top:
				this.hitTestInfo.sceneOriginInflated = this.boundingRect.x;
				this.hitTestInfo.sceneLengthInflated = this.boundingRect.width;
				break;
			case EChartAxisPosition.Left:
				this.hitTestInfo.sceneOriginInflated = this.boundingRect.y;
				this.hitTestInfo.sceneLengthInflated = this.boundingRect.height;
				break;
			default:
				throw "Not implemented.";
		}
		renderPlan.hitTestInfos.push(
		{
			aspects: aspects,
			hitTestInfo: this.hitTestInfo,
			source: this,
		});
	}

	__buildRenderPlan_line(renderPlan, aspects)
	{
		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				renderPlan.renderInfos.push(
				{
					aspects: aspects,
					primitive: "axis",
					boundingRect: this.boundingRect,
					x: this.boundingRect.x,
					y: this.boundingRect.y + this.boundingRect.height,
					width: this.boundingRect.width,
					height: 0,
					lineStyle: this.lineStyle,
					source: this,
				});
				break;
			case EChartAxisPosition.Right:
				renderPlan.renderInfos.push(
				{
					aspects: aspects,
					primitive: "axis",
					boundingRect: this.boundingRect,
					x: this.boundingRect.x,
					y: this.boundingRect.y,
					width: 0,
					height: this.boundingRect.height,
					lineStyle: this.lineStyle,
					source: this,
				});
				break;
			case EChartAxisPosition.Top:
				renderPlan.renderInfos.push(
				{
					aspects: aspects,
					primitive: "axis",
					boundingRect: this.boundingRect,
					x: this.boundingRect.x,
					y: this.boundingRect.y,
					width: this.boundingRect.width,
					height: 0,
					lineStyle: this.lineStyle,
					source: this,
				});
				break;
			case EChartAxisPosition.Left:
				renderPlan.renderInfos.push(
				{
					aspects: aspects,
					primitive: "axis",
					boundingRect: this.boundingRect,
					x: this.boundingRect.x + this.boundingRect.width,
					y: this.boundingRect.y,
					width: 0,
					height: this.boundingRect.height,
					lineStyle: this.lineStyle,
					source: this,
				});
				break;
			default:
				throw "Not implemented.";
		}
	}

	__buildRenderPlan_tick(renderPlan, tickInfo, aspects)
	{
		var minorTickReduction = 0;
		if (tickInfo.tickType == EChartTickType.Minor && tickInfo.showLabel)
		{
			minorTickReduction = this.minorTickReduction || 0;
		}
		var renderInfo =
		{
			aspects: aspects,
			primitive: "tick",
			source: this,
		};
		renderPlan.renderInfos.push(renderInfo);
		var tickLength;
		switch (tickInfo.tickType)
		{
			case EChartTickType.Major:
				renderInfo.lineStyle = this.majorTickLineStyle;
				tickLength = this.majorTickLength;
				break;
			case EChartTickType.Minor:
				renderInfo.lineStyle = this.minorTickLineStyle;
				tickLength = this.minorTickLength;
				break;
			case EChartTickType.Micro:
				renderInfo.lineStyle = this.microTickLineStyle;
				tickLength = this.microTickLength;
				break;
			case EChartTickType.Running:
				renderInfo.lineStyle = this.runningTickLineStyle;
				tickLength = this.runningTickLength;
				break;
			default:
				throw "Not implemented.";
		}
		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				renderInfo.x = tickInfo.sceneOffset;
				renderInfo.y = this.boundingRect.y + this.boundingRect.height - tickLength + minorTickReduction;
				renderInfo.width = 0;
				renderInfo.height = tickLength;
				break;
			case EChartAxisPosition.Right:
				renderInfo.x = this.boundingRect.x;
				renderInfo.y = tickInfo.sceneOffset;
				renderInfo.width = tickLength - minorTickReduction;
				renderInfo.height = 0;
				break;
			case EChartAxisPosition.Top:
				renderInfo.x = tickInfo.sceneOffset;
				renderInfo.y = this.boundingRect.y;
				renderInfo.width = 0;
				renderInfo.height = tickLength - minorTickReduction;
				break;
			case EChartAxisPosition.Left:
				renderInfo.x = this.boundingRect.x + this.boundingRect.width - tickLength + minorTickReduction;
				renderInfo.y = tickInfo.sceneOffset;
				renderInfo.width = tickLength - minorTickReduction;
				renderInfo.height = 0;
				break;
			default:
				throw "Not implemented.";
		}
	}

	__buildRenderPlan_rangeLabel(renderPlan, aspects)
	{
		if (!this.rangeLabelStyle.visible)
		{
			return;
		}
		var text = this.rangeLabelStyle.formatter({ scaleInfo: this._scaleInfoCache }, this._dataRange.length);
		if (!text)
		{
			text = "(null)";
		}
		var textSize = this.rangeLabelStyle.measureText(text);

		var labelRenderInfo =
		{
			aspects: aspects,
			primitive: "label",
			source: this,
			text: text,
			font: this.rangeLabelStyle.fontStyles,
		};
		renderPlan.renderInfos.push(labelRenderInfo);

		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				labelRenderInfo.x = this._scaleInfoCache.sceneOriginInflated + this._scaleInfoCache.sceneRangeInflated / 2;
				labelRenderInfo.y = this.boundingRect.y + this.boundingRect.height + textSize.height / 2 + 2;
				labelRenderInfo.width = textSize.width;
				labelRenderInfo.height = textSize.height;
				break;
			case EChartAxisPosition.Right:
				throw "Not implemented.";
			case EChartAxisPosition.Top:
				labelRenderInfo.x = this._scaleInfoCache.sceneOriginInflated + this._scaleInfoCache.sceneRangeInflated / 2;
				labelRenderInfo.y = this.boundingRect.y - textSize.height / 2 - 4;
				labelRenderInfo.width = textSize.width;
				labelRenderInfo.height = textSize.height;
				break;
			case EChartAxisPosition.Left:
				throw "Not implemented.";
			default:
				throw "Not implemented.";
		}
	}

	__buildRenderPlan_rangeStartLabel(renderPlan, aspects)
	{
		if (!this.rangeStartLabelStyle.visible)
		{
			return;
		}
		var text = this.rangeStartLabelStyle.formatter({ scaleInfo: this._scaleInfoCache }, this.sceneToModel(this._scaleInfoCache.sceneOriginInflated));
		if (!text)
		{
			return;
		}
		var textSize = this.rangeStartLabelStyle.measureText(text);

		var tickRenderInfo =
		{
			aspects: aspects,
			primitive: "tick",
			source: this,
			lineStyle: this.lineStyle,
		};
		renderPlan.renderInfos.push(tickRenderInfo);
		var tickLength = 1.5 * this.majorTickLength;

		var labelRenderInfo =
		{
			aspects: aspects,
			primitive: "label",
			source: this,
			text: text,
			font: this.rangeStartLabelStyle.fontStyles,
		};
		renderPlan.renderInfos.push(labelRenderInfo);

		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				tickRenderInfo.x = this.boundingRect.x + 1;
				tickRenderInfo.y = this.boundingRect.y + this.boundingRect.height;
				tickRenderInfo.width = 0;
				tickRenderInfo.height = tickLength;

				labelRenderInfo.x = this._scaleInfoCache.sceneOriginInflated + textSize.width / 2 + 3;
				labelRenderInfo.y = this.boundingRect.y + this.boundingRect.height + textSize.height / 2 + 2;
				labelRenderInfo.width = textSize.width;
				labelRenderInfo.height = textSize.height;
				break;
			case EChartAxisPosition.Right:
				throw "Not implemented.";
			case EChartAxisPosition.Top:
				tickRenderInfo.x = this.boundingRect.x + 1;
				tickRenderInfo.y = this.boundingRect.y + tickLength;
				tickRenderInfo.width = 0;
				tickRenderInfo.height = tickLength;

				labelRenderInfo.x = this._scaleInfoCache.sceneOriginInflated + textSize.width / 2 + 3;
				labelRenderInfo.y = this.boundingRect.y - textSize.height / 2 - 4;
				labelRenderInfo.width = textSize.width;
				labelRenderInfo.height = textSize.height;
				break;
			case EChartAxisPosition.Left:
				throw "Not implemented.";
			default:
				throw "Not implemented.";
		}
	}

	__buildRenderPlan_rangeEndLabel(renderPlan, aspects)
	{
		if (!this.rangeEndLabelStyle.visible)
		{
			return;
		}
		var text = this.rangeEndLabelStyle.formatter({ scaleInfo: this._scaleInfoCache }, this.sceneToModel(this._scaleInfoCache.sceneOriginInflated + this._scaleInfoCache.sceneRangeInflated));
		if (!text)
		{
			return;
		}
		var textSize = this.rangeEndLabelStyle.measureText(text);

		var tickRenderInfo =
		{
			aspects: aspects,
			primitive: "tick",
			source: this,
			lineStyle: this.lineStyle,
		};
		renderPlan.renderInfos.push(tickRenderInfo);
		var tickLength = 1.5 * this.majorTickLength;

		var renderInfo =
		{
			aspects: aspects,
			primitive: "label",
			source: this,
		};
		renderPlan.renderInfos.push(renderInfo);

		renderInfo.text = text;
		renderInfo.font = this.rangeEndLabelStyle.fontStyles;

		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				tickRenderInfo.x = this._scaleInfoCache.sceneOriginInflated + this.boundingRect.width - 1;
				tickRenderInfo.y = this.boundingRect.y + this.boundingRect.height;
				tickRenderInfo.width = 0;
				tickRenderInfo.height = tickLength;

				renderInfo.x = this._scaleInfoCache.sceneOriginInflated + this.boundingRect.width - textSize.width / 2 - 3;
				renderInfo.y = this.boundingRect.y + this.boundingRect.height + textSize.height / 2 + 2;
				renderInfo.width = textSize.width;
				renderInfo.height = textSize.height;
				break;
			case EChartAxisPosition.Right:
				throw "Not implemented.";
			case EChartAxisPosition.Top:
				tickRenderInfo.x = this._scaleInfoCache.sceneOriginInflated + this.boundingRect.width - 1;
				tickRenderInfo.y = this.boundingRect.y + tickLength;
				tickRenderInfo.width = 0;
				tickRenderInfo.height = tickLength;

				renderInfo.x = this._scaleInfoCache.sceneOriginInflated + this.boundingRect.width - textSize.width / 2 - 3;
				renderInfo.y = this.boundingRect.y - textSize.height / 2 - 4;
				renderInfo.width = textSize.width;
				renderInfo.height = textSize.height;
				break;
			case EChartAxisPosition.Left:
				throw "Not implemented.";
			default:
				throw "Not implemented.";
		}
	}

	__buildRenderPlan_tickLabel(renderPlan, formatingContext_majorTick, formatingContext_minorTick, formatingContext_runningTick, tickInfo, aspects)
	{
		switch (tickInfo.tickType)
		{
			case EChartTickType.Major:
				if (!this.majorTickLabelStyle.visible) return;
				break;
			case EChartTickType.Minor:
				if (!this.minorTickLabelStyle.visible) return;
				if (!tickInfo.showLabel) return;
				break;
			case EChartTickType.Micro:
				return;
			case EChartTickType.Running:
				if (!this.runningTickLabelStyle.visible) return;
				break;
			default:
				throw "Not implemented.";
		}
		var renderInfo =
		{
			aspects: aspects,
			primitive: "label",
			source: this,
		};
		renderPlan.renderInfos.push(renderInfo);
		var tickLength;
		var tickLabelOffset;
		var textSize;
		switch (tickInfo.tickType)
		{
			case EChartTickType.Major:
				renderInfo.text = this.majorTickLabelStyle.formatter(formatingContext_majorTick, tickInfo.unit, tickInfo.modelOffset !== void (0) ? tickInfo.modelOffset : this.sceneToModel(tickInfo.sceneOffset));
				renderInfo.font = this.majorTickLabelStyle.fontStyles;
				tickLength = this.majorTickLength;
				tickLabelOffset = this.majorTickLabelOffset;
				textSize = this.majorTickLabelStyle.measureText(renderInfo.text);
				break;
			case EChartTickType.Minor:
				renderInfo.text = this.minorTickLabelStyle.formatter(formatingContext_minorTick, tickInfo.unit, tickInfo.modelOffset !== void (0) ? tickInfo.modelOffset : this.sceneToModel(tickInfo.sceneOffset));
				renderInfo.font = this.minorTickLabelStyle.fontStyles;
				tickLength = this.minorTickLength;
				tickLabelOffset = this.minorTickLabelOffset;
				textSize = this.minorTickLabelStyle.measureText(renderInfo.text);
				break;
			case EChartTickType.Running:
				renderInfo.text = this.runningTickLabelStyle.formatter(formatingContext_runningTick, tickInfo.unit, tickInfo.modelOffset !== void (0) ? tickInfo.modelOffset : this.sceneToModel(tickInfo.sceneOffset));
				if (tickInfo.weekModelOffset != void (0)) renderInfo.text += ", " + this.runningTickLabelStyle.formatter(formatingContext_runningTick, EDateTimeUnit.Week, tickInfo.weekModelOffset);
				renderInfo.font = this.runningTickLabelStyle.fontStyles;
				tickLength = this.runningTickLength;
				tickLabelOffset = this.runningTickLabelOffset;
				textSize = this.runningTickLabelStyle.measureText(renderInfo.text);
				break;
			default:
				throw "Not implemented.";
		}
		switch (this.position)
		{
			case EChartAxisPosition.Bottom:
				renderInfo.x = tickInfo.sceneOffset;
				renderInfo.y = this.boundingRect.y + this.boundingRect.height - tickLength - tickLabelOffset - textSize.height / 2;
				renderInfo.width = 0;
				renderInfo.height = 0;
				break;
			case EChartAxisPosition.Right:
				renderInfo.x = this.boundingRect.x + tickLength + tickLabelOffset + textSize.width / 2;
				renderInfo.y = tickInfo.sceneOffset;
				renderInfo.width = 0;
				renderInfo.height = 0;
				break;
			case EChartAxisPosition.Top:
				renderInfo.x = tickInfo.sceneOffset;
				renderInfo.y = this.boundingRect.y + tickLength + tickLabelOffset + textSize.height / 2;
				renderInfo.width = 0;
				renderInfo.height = 0;
				break;
			case EChartAxisPosition.Left:
				renderInfo.x = this.boundingRect.x + this.boundingRect.width - tickLength - tickLabelOffset - textSize.width / 2;
				renderInfo.y = tickInfo.sceneOffset;
				renderInfo.width = 0;
				renderInfo.height = 0;
				break;
			default:
				throw "Not implemented.";
		}
	}


	__invalidateAspect(aspectId)
	{
		super.__invalidateAspect(aspectId);
		this.onChange({ aspect: aspectId });
	}

	__buildScale()
	{
		throw "Not implemented.";
	}


	modelToScene(modelOffset)
	{
		return this._scaleInfoCache.modelToScene(modelOffset);
	}

	sceneToModel(sceneOffset)
	{
		return this._scaleInfoCache.sceneToModel(sceneOffset);
	}

	
	_dataRange_change(sender, args)
	{
		switch (args.aspect)
		{
			case "range":
				this.__invalidateAspect("scale");
				break;
			case "extrusion":
				break;
			default:
				throw "Not implemented.";
		}
	}


	//	returns EChartDataType
	get valueType()
	{
		return this._valueType;
	}

	get dataRange()
	{
		return this._dataRange;
	}

	get scaleInfoCache()
	{
		return this._scaleInfoCache;
	}


	get position()
	{
		return this._position;
	}

	set position(value)
	{
		if (this._position == value)
		{
			return;
		}
		this._position = value;
	}

	get spread()
	{
		return this._spread;
	}

	set spread(value)
	{
		if (this._spread == value)
		{
			return;
		}
		this._spread = value;
	}

	get lineStyle()
	{
		return this._lineStyle;
	}


	get paddingLower()
	{
		return this._paddingLower;
	}

	set paddingLower(value)
	{
		if (this._paddingLower == value)
		{
			return;
		}
		this._paddingLower = value;
		this.__invalidateAspect("scale");
	}

	get paddingUpper()
	{
		return this._paddingUpper;
	}

	set paddingUpper(value)
	{
		if (this._paddingUpper == value)
		{
			return;
		}
		this._paddingUpper = value;
		this.__invalidateAspect("scale");
	}


	get rangeLabelStyle()
	{
		return this._rangeLabelStyle;
	}

	get rangeStartLabelStyle()
	{
		return this._rangeStartLabelStyle;
	}

	get rangeEndLabelStyle()
	{
		return this._rangeEndLabelStyle;
	}


	get majorTickLength()
	{
		return this._majorTickLength;
	}

	set majorTickLength(value)
	{
		if (this._majorTickLength == value)
		{
			return;
		}
		this._majorTickLength = value;
		this.__invalidateAspect("scale");
	}

	get majorTickLineStyle()
	{
		return this._majorTickLineStyle;
	}

	get majorTickLabelOffset()
	{
		return this._majorTickLabelOffset;
	}

	set majorTickLabelOffset(value)
	{
		if (this._majorTickLabelOffset == value)
		{
			return;
		}
		this._majorTickLabelOffset = value;
		this.__invalidateAspect("labels");
	}

	get majorTickLabelStyle()
	{
		return this._majorTickLabelStyle;
	}


	get minorTickLength()
	{
		return this._minorTickLength;
	}

	set minorTickLength(value)
	{
		if (this._minorTickLength == value)
		{
			return;
		}
		this._minorTickLength = value;
		this.__invalidateAspect("scale");
	}

	get minorTickLabelOffset()
	{
		return this._minorTickLabelOffset;
	}

	set minorTickLabelOffset(value)
	{
		if (this._minorTickLabelOffset == value)
		{
			return;
		}
		this._minorTickLabelOffset = value;
		this.__invalidateAspect("scale");
	}

	get minorTickLabelStyle()
	{
		return this._minorTickLabelStyle;
	}

	get minorTickLineStyle()
	{
		return this._minorTickLineStyle;
	}


	get microTickLength()
	{
		return this._microTickLength;
	}

	set microTickLength(value)
	{
		if (this._microTickLength == value)
		{
			return;
		}
		this._microTickLength = value;
		this.__invalidateAspect("scale");
	}

	get microTickLineStyle()
	{
		return this._microTickLineStyle;
	}


	get runningTickLength()
	{
		return this._runningTickLength;
	}

	set runningTickLength(value)
	{
		if (this._runningTickLength == value)
		{
			return;
		}
		this._runningTickLength = value;
		this.__invalidateAspect("scale");
	}

	get runningTickLabelOffset()
	{
		return this._runningTickLabelOffset;
	}

	set runningTickLabelOffset(value)
	{
		if (this._runningTickLabelOffset == value)
		{
			return;
		}
		this._runningTickLabelOffset = value;
		this.__invalidateAspect("scale");
	}

	get runningTickLabelStyle()
	{
		return this._runningTickLabelStyle;
	}

	get runningTickLineStyle()
	{
		return this._runningTickLineStyle;
	}
}
