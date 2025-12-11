"use strict";

include("StdAfx.js");

class ChartScene extends ChartElement
{
	constructor(id, parentPath, parentNode)
	{
		super(id, 10000, parentPath, parentNode);

		this._backplane = new ChartBackplane("backplane", "backplane", this);
		this._axes = new Collection(this._elementCollection_change.bind(this));
		this._series = new Collection(this._elementCollection_change.bind(this));
		this._indicators = new Collection(this._elementCollection_change.bind(this));
		this._markers = new Collection(this._elementCollection_change.bind(this));

		this._backgroundColor = null;
	}


	__performLayout()
	{
		var topAxesSpread = 0;
		var rightAxesSpread = 0;
		var bottomAxesSpread = 0;
		var leftAxesSpread = 0;

		for (var length = this._axes.length, i = 0; i < length; ++i)
		{
			var item = this._axes[i];
			switch (item.position)
			{
				case EChartAxisPosition.Bottom:
					topAxesSpread += item.spread;
					break;
				case EChartAxisPosition.Right:
					rightAxesSpread += item.spread;
					break;
				case EChartAxisPosition.Top:
					bottomAxesSpread += item.spread;
					break;
				case EChartAxisPosition.Left:
					leftAxesSpread += item.spread;
					break;
				default:
					throw "Not implemented.";
			}
		}

		var backplaneRect =
		{
			x: this.boundingRect.x + leftAxesSpread,
			y: this.boundingRect.y + topAxesSpread,
			width: this.boundingRect.width - leftAxesSpread - rightAxesSpread,
			height: this.boundingRect.height - topAxesSpread - bottomAxesSpread,
		};
		this._backplane.performLayout(backplaneRect);

		var topAxisOffset = 0;
		var rightAxisOffset = 0;
		var bottomAxisOffset = 0;
		var leftAxisOffset = 0;
		for (var length = this._axes.length, i = 0; i < length; ++i)
		{
			var item = this._axes[i];
			switch (item.position)
			{
				case EChartAxisPosition.Bottom:
					item.performLayout(
					{
						x: backplaneRect.x,
						y: this.boundingRect.y + topAxisOffset,
						width: backplaneRect.width,
						height: item.spread,
					});
					topAxisOffset += item.spread;
					break;
				case EChartAxisPosition.Right:
					item.performLayout(
					{
						x: backplaneRect.x + backplaneRect.width + rightAxisOffset,
						y: backplaneRect.y,
						width: item.spread,
						height: backplaneRect.height,
					});
					rightAxisOffset += item.spread;
					break;
				case EChartAxisPosition.Top:
					item.performLayout(
					{
						x: backplaneRect.x,
						y: backplaneRect.y + backplaneRect.height + bottomAxisOffset,
						width: backplaneRect.width,
						height: item.spread,
					});
					bottomAxisOffset += item.spread;
					break;
				case EChartAxisPosition.Left:
					item.performLayout(
					{
						x: this.boundingRect.x + leftAxisOffset,
						y: backplaneRect.y,
						width: item.spread,
						height: backplaneRect.height,
					});
					leftAxisOffset += item.spread;
					break;
				default:
					throw "Not implemented.";
			}
		}

		for (var length = this._series.length, i = 0; i < length; ++i) this._series[i].performLayout(backplaneRect);
		for (var length = this._indicators.length, i = 0; i < length; ++i) this._indicators[i].performLayout(backplaneRect);
		for (var length = this._markers.length, i = 0; i < length; ++i) this._markers[i].performLayout(backplaneRect);
	}

	__buildRenderPlan(renderPlan)
	{
		if (!this.__isAspectValid("backgroundColor") || !this.__isAspectValid("boundingRect"))
		{
			renderPlan.renderInfos.push(
			{
				aspects: ["backgroundColor", "boundingRect"],
				primitive: "background",
				x: this.boundingRect.x,
				y: this.boundingRect.y,
				width: this.boundingRect.width,
				height: this.boundingRect.height,
				style:
				{
					fill: this.backgroundColor,
				},
				source: this,
			});
		}

		for (var length = this._axes.length, i = 0; i < length; ++i) this._axes[i].buildRenderPlan(renderPlan);
		this._backplane.buildRenderPlan(renderPlan);
		for (var length = this._series.length, i = 0; i < length; ++i) this._series[i].buildRenderPlan(renderPlan);
		for (var length = this._indicators.length, i = 0; i < length; ++i) this._indicators[i].buildRenderPlan(renderPlan);
		for (var length = this._markers.length, i = 0; i < length; ++i) this._markers[i].buildRenderPlan(renderPlan);
	}

	__enumerateChildren()
	{
		return [this.backplane]
			.concat(this.axes.toArray())
			.concat(this.series.toArray())
			.concat(this.indicators.toArray())
			.concat(this.markers.toArray());
	}


	static _getElementStylePath(element)
	{
		if (element instanceof ChartAxis) return "axis." + element.elementType + "." + element.id;
		if (element instanceof ChartSeries) return "series." + element.elementType + "." + element.id;
		if (element instanceof ChartRange2DIndicator) return "range." + element.elementType + "." + element.id;
		if (element instanceof ChartLinearZoneMarker) return "marker.linearZone" + "." + element.id;
		if (element instanceof ChartChannelZoneMarker) return "marker.channelZone" + "." + element.id;
		if (element instanceof ChartPointMarker) return "marker.point" + "." + element.id;
		if (element instanceof ChartLineMarker) return "marker.line" + "." + element.id;

		throw "Not implemented.";
	}


	_elementCollection_change(sender, args)
	{
		switch (args.changeType)
		{
			case "add":
				if (args.item.parentNode)
				{
					throw "Invalid operation.";
				}
				args.item.__parentNode = this;
				args.item.__parentPath = ChartScene._getElementStylePath(args.item);
				break;
			case "remove":
				if (!args.item.parentNode)
				{
					throw "Invalid operation.";
				}
				args.item.__parentNode = null;
				args.item.__parentPath = null;
				break;
			default:
				throw new "Not implemented.";
		}
	}


	get backplane()
	{
		return this._backplane;
	}

	get axes()
	{
		return this._axes;
	}

	get series()
	{
		return this._series;
	}

	get indicators()
	{
		return this._indicators;
	}

	get markers()
	{
		return this._markers;
	}


	get backgroundColor()
	{
		return this._backgroundColor;
	}

	set backgroundColor(value)
	{
		if (this._backgroundColor == value)
		{
			return;
		}
		this._backgroundColor = value;
		this.__invalidateAspect("backgroundColor");
	}
}
