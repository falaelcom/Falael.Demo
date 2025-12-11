"use strict";

include("StdAfx.js");

class ChartStyleSheet
{
	constructor(definition)
	{
		this._value = {};
		Object.assign(this._value, definition);
	}

	cascade(definition)
	{
		var flat1 = Object.flatten(this._value);
		var flat2 = Object.flatten(definition);

		Object.assign(flat1, flat2);

		this._value = Array.inflate(flat1);
	}


	applyToScene(scene)
	{
		scene.backgroundColor = (scene.backgroundColor !== null ? scene.backgroundColor : this._get(scene.path + ".backgroundColor"));

		scene.backplane.backgroundColor = (scene.backplane.backgroundColor !== null ? scene.backplane.backgroundColor : this._get(scene.path + ".backplane.backgroundColor"));
		this._applyLineStyle(scene.backplane.majorHLineStyle, scene.path + ".backplane.majorHLineStyle");
		this._applyLineStyle(scene.backplane.majorVLineStyle, scene.path + ".backplane.majorVLineStyle");
		this._applyLineStyle(scene.backplane.minorHLineStyle, scene.path + ".backplane.minorHLineStyle");
		this._applyLineStyle(scene.backplane.minorVLineStyle, scene.path + ".backplane.minorVLineStyle");
		this._applyLineStyle(scene.backplane.microHLineStyle, scene.path + ".backplane.microHLineStyle");
		this._applyLineStyle(scene.backplane.microVLineStyle, scene.path + ".backplane.microVLineStyle");
		this._applyLineStyle(scene.backplane.runningHLineStyle, scene.path + ".backplane.runningHLineStyle");
		this._applyLineStyle(scene.backplane.runningVLineStyle, scene.path + ".backplane.runningVLineStyle");

		for (var length = scene.axes.length, i = 0; i < length; ++i) this.applyToAxis(scene.axes[i]);
		for (var length = scene.series.length, i = 0; i < length; ++i) this.applyToSeries(scene.series[i]);
		for (var length = scene.indicators.length, i = 0; i < length; ++i)
		{
			var item = scene.indicators[i];

			if (item instanceof ChartRange2DIndicator) this.applyToRange2d(item);
			else throw "Not implemented.";
		}
		for (var length = scene.markers.length, i = 0; i < length; ++i)
		{
			var item = scene.markers[i];

			if (item instanceof ChartLinearZoneMarker) this.applyToLinearZone(item);
			else if (item instanceof ChartChannelZoneMarker) this.applyToChannelZone(item);
			else if (item instanceof ChartPointMarker) this.applyToPoint(item);
			else if (item instanceof ChartLineMarker) this.applyToLine(item);
			else throw "Not implemented.";
		}
	}


	applyToSeries(item)
	{
		switch (item.elementType)
		{
			case "lineSeries":
				this._applyLineStyle(item.lineStyle, item.path + ".data");
				this._applyLineStyle(item.gapBoundryLineStyle, item.path + ".gapBoundry");
				item.gapTester = (item.gapTester !== null ? item.gapTester : this._get(item.path + ".gapTester", null));
				break;
			case "areaSeries":
				item.areaOpacity = (item.areaOpacity !== null ? item.areaOpacity : this._get(item.path + ".areaOpacity"));
				item.areaBackgroundColor = (item.areaBackgroundColor !== null ? item.areaBackgroundColor : this._get(item.path + ".areaBackgroundColor"));
				this._applyLineStyle(item.lineStyle_low, item.path + ".low");
				this._applyLineStyle(item.lineStyle_high, item.path + ".high");
				this._applyLineStyle(item.gapBoundryLineStyle, item.path + ".gapBoundry");
				item.gapTester = (item.gapTester !== null ? item.gapTester : this._get(item.path + ".gapTester", null));
				break;
			case "heatMapSeries":
				item.dotSize = (item.dotSize !== null ? item.dotSize : this._get(item.path + ".dotSize"));
				item.gridSpacing = (item.gridSpacing !== null ? item.gridSpacing : this._get(item.path + ".gridSpacing"));
				break;
		}
	}

	applyToAxis(item)
	{
		item.position = (item.position !== null ? item.position : EChartAxisPosition.parse(this._get(item.path + ".position")));
		item.spread = (item.spread !== null ? item.spread : this._get(item.path + ".spread"));
		item.paddingUpper = (item.paddingUpper !== null ? item.paddingUpper : this._get(item.path + ".paddingUpper"));
		item.paddingLower = (item.paddingLower !== null ? item.paddingLower : this._get(item.path + ".paddingLower"));

		this._applyLineStyle(item.lineStyle, item.path);

		this._applyLabelStyle(item.rangeLabelStyle, item.path + ".range.label");
		this._applyLabelStyle(item.rangeStartLabelStyle, item.path + ".range.start.label");
		this._applyLabelStyle(item.rangeEndLabelStyle, item.path + ".range.end.label");

		item.majorTickLength = (item.majorTickLength !== null ? item.majorTickLength : this._get(item.path + ".majorTick.majorTickLength"));
		item.majorTickLabelOffset = (item.majorTickLabelOffset !== null ? item.majorTickLabelOffset : this._get(item.path + ".majorTick.label.labelOffset"));
		this._applyLineStyle(item.majorTickLineStyle, item.path + ".majorTick");
		this._applyLabelStyle(item.majorTickLabelStyle, item.path + ".majorTick.label");

		item.minorTickLength = (item.minorTickLength !== null ? item.minorTickLength : this._get(item.path + ".minorTick.minorTickLength"));
		item.minorTickLabelOffset = (item.minorTickLabelOffset !== null ? item.minorTickLabelOffset : this._get(item.path + ".minorTick.label.labelOffset"));
		this._applyLineStyle(item.minorTickLineStyle, item.path + ".minorTick");
		this._applyLabelStyle(item.minorTickLabelStyle, item.path + ".minorTick.label");

		item.microTickLength = (item.microTickLength !== null ? item.microTickLength : this._get(item.path + ".microTick.microTickLength"));
		this._applyLineStyle(item.microTickLineStyle, item.path + ".microTick");

		item.runningTickLength = (item.runningTickLength !== null ? item.runningTickLength : this._get(item.path + ".runningTick.runningTickLength"));
		item.runningTickLabelOffset = (item.runningTickLabelOffset !== null ? item.runningTickLabelOffset : this._get(item.path + ".runningTick.label.labelOffset"));
		this._applyLineStyle(item.runningTickLineStyle, item.path + ".runningTick");
		this._applyLabelStyle(item.runningTickLabelStyle, item.path + ".runningTick.label");

		switch (item.elementType)
		{
			case "numericAxis":
				item.majorTickRange = (item.majorTickRange !== null ? item.majorTickRange : this._get(item.path + ".majorTick.majorTickRange"));

				item.minorTickRange = (item.minorTickRange !== null ? item.minorTickRange : this._get(item.path + ".minorTick.minorTickRange"));
				item.minorTickReduction = (item.minorTickReduction !== null ? item.minorTickReduction : this._get(item.path + ".minorTick.minorTickReduction"));
				item.minorTickLabelGuaranteedSpace = (item.minorTickLabelGuaranteedSpace !== null ? item.minorTickLabelGuaranteedSpace : this._get(item.path + ".minorTick.label.guaranteedSpace"));
				break;
			case "dateTimeAxis":
				if (item.rangeStyles === null) item.rangeStyles = this._get(item.path + ".rangeStyles");
				break;
			default:
				throw "Not implemented.";
		}
	}

	applyToRange2d(item)
	{
		item.areaRatio1 = (item.areaRatio1 !== null ? item.areaRatio1 : this._get(item.path + ".backplane.areaRatio1"));
		item.areaRatio2 = (item.areaRatio2 !== null ? item.areaRatio2 : this._get(item.path + ".backplane.areaRatio2"));
		item.opacity1 = (item.opacity1 !== null ? item.opacity1 : this._get(item.path + ".backplane.opacity1"));
		item.opacity2 = (item.opacity2 !== null ? item.opacity2 : this._get(item.path + ".backplane.opacity2"));

		item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
		this._applyLineStyle(item.backplaneBorderLineStyle, item.path + ".backplane.border");

		item.selectedBackplaneColor = (item.selectedBackplaneColor !== null ? item.selectedBackplaneColor : this._get(item.path + ".selectedBackplane.backgroundColor"));
		this._applyLineStyle(item.selectedBackplaneBorderLineStyle, item.path + ".selectedBackplane.border");

		item.newBackplaneColor = (item.newBackplaneColor !== null ? item.newBackplaneColor : this._get(item.path + ".newBackplane.backgroundColor"));
		this._applyLineStyle(item.newBackplaneBorderLineStyle, item.path + ".newBackplane.border");

		item.textVisibile_screenWidthThreshold = (item.textVisibile_screenWidthThreshold !== null ? item.textVisibile_screenWidthThreshold : this._get(item.path + ".textVisibile_screenWidthThreshold"));
		this._applyLabelStyle(item.xLabelStyle, item.path + ".xLabelStyle");
		this._applyLabelStyle(item.yLabelStyle, item.path + ".yLabelStyle");
		this._applyLabelStyle(item.xDeltaLabelStyle, item.path + ".xDeltaLabelStyle");
		this._applyLabelStyle(item.yDeltaLabelStyle, item.path + ".yDeltaLabelStyle");
	}

	applyToLinearZone(item)
	{
		item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".opacity"));
		this._applyLineStyle(item.lineStyle, item.path + ".lineStyle");
		item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
	}

	applyToChannelZone(item)
	{
		item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".opacity"));
		this._applyLineStyle(item.lineStyle, item.path + ".lineStyle");
		item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
	}

	applyToPoint(item)
	{
		item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".opacity"));
		item.color = (item.color !== null ? item.color : this._get(item.path + ".fill"));
		item.size = (item.size !== null ? item.size : this._get(item.path + ".size"));
		this._applyLineStyle(item.lineStyle, item.path + ".lineStyle");
	}

	applyToLine(item)
	{
		this._applyLineStyle(item.lineStyle, item.path + ".lineStyle");
	}


	applyToOverlay(overlay)
	{
		for (var length = overlay.indicators.length, i = 0; i < length; ++i)
		{
			var item = overlay.indicators[i];

			switch (item.elementType)
			{
				case "line":
				case "axisLine":
					this._applyLineStyle(item.lineStyle, item.path);
					break;
				case "label":
					item.hAlign = (item.hAlign !== null ? item.hAlign : EChartHAlign.parse(this._get(item.path + ".hAlign")));
					item.vAlign = (item.vAlign !== null ? item.vAlign : EChartVAlign.parse(this._get(item.path + ".vAlign")));
					item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".opacity"));
					item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
					this._applyLineStyle(item.backplaneBorderLineStyle, item.path + ".backplane.border");
					this._applyLabelStyle(item.labelStyle, item.path);
					break;
				case "axisLabel":
					item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".opacity"));
					item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
					this._applyLineStyle(item.backplaneBorderLineStyle, item.path + ".backplane.border");
					this._applyLabelStyle(item.labelStyle, item.path);
					break;
				case "axisRange":
					this.applyToAxisRange(item);
					break;
				case "horizontalRange":
					this.applyToHorizontalRange(item);
					break;
			}
		}
	}

	applyToAxisRange(item)
	{
		item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".opacity"));
		item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
		this._applyLineStyle(item.backplaneBorderLineStyle, item.path + ".backplane.border");
	}

	applyToHorizontalRange(item)
	{
		item.opacity = (item.opacity !== null ? item.opacity : this._get(item.path + ".backplane.opacity"));
		item.backplaneColor = (item.backplaneColor !== null ? item.backplaneColor : this._get(item.path + ".backplane.backgroundColor"));
		this._applyLineStyle(item.backplaneBorderLineStyle, item.path + ".backplane.border");

		this._applyLabelStyle(item.xLabelStyle, item.path + ".xLabelStyle");
		this._applyLabelStyle(item.xDeltaLabelStyle, item.path + ".xDeltaLabelStyle");
	}


	_get(selector, defaultValue)
	{
		if (!selector)
		{
			throw "Argument is null: selector.";
		}
		var tokens = selector.split('.');
		function step(root, selectorTokens, selectorOffset)
		{
			var key = selectorTokens[selectorOffset];
			if (selectorOffset == selectorTokens.length - 1)
			{
				return root[key];
			}
			var obj = root[key];
			if (obj === void (0))
			{
				return step(root, selectorTokens, selectorOffset + 1);
			}
			if (!obj) return null;
			var result = step(obj, selectorTokens, selectorOffset + 1);
			if (result === void (0))
			{
				return step(root, selectorTokens, selectorOffset + 1);
			}
			return result;
		}
		var result = step(this._value, tokens, 0);
		if (result === void (0))
		{
			if (defaultValue === void (0)) throw "Unable to resolve style selector \"" + selector + "\".";
			return defaultValue;
		}
		return result;
	}

	_applyLabelStyle(style, path)
	{
		style.visible = (style.visible !== null ? style.visible : this._get(path + ".visible"));
		style.fontFamilty = (style.fontFamilty !== null ? style.fontFamilty : this._get(path + ".font.family"));
		style.fontSize = (style.fontSize !== null ? style.fontSize : this._get(path + ".font.size"));
		style.fontWeigth = (style.fontWeigth !== null ? style.fontWeigth : this._get(path + ".font.weight"));
		style.fontFill = (style.fontFill !== null ? style.fontFill : this._get(path + ".font.fill"));
		style.formatter = (style.formatter !== null ? style.formatter : this._get(path + ".formatter"));
	}

	_applyLineStyle(style, path)
	{
		style.visible = (style.visible !== null ? style.visible : this._get(path + ".visible", true));
		style.color = (style.color !== null ? style.color : this._get(path + ".lineColor"));
		style.width = (style.width !== null ? style.width : this._get(path + ".lineWidth"));
		style.strokeStyle = (style.strokeStyle !== null ? style.strokeStyle : this._get(path + ".strokeStyle", null));
	}


	static formatDateTimeAxisLabel(value, unit)
	{
		var m = moment.utc(value);
		switch (unit)
		{
			case EDateTimeUnit.Century:
				return "C" + (Math.floor(m.year() / 100) + 1);
			case EDateTimeUnit.Decade:
				return m.format("YYYY");
			case EDateTimeUnit.Year:
				return m.format("YYYY");
			case EDateTimeUnit.Quarter:
				return m.format("YYYY") + ", Q" + (Math.floor(moment.utc(value).month() / 3) + 1);
			case EDateTimeUnit.Month:
				return m.format("MMM YYYY");
			case EDateTimeUnit.Week:
				return "week " + m.format("w YYYY");
			case EDateTimeUnit.Day:
				return m.format("ddd D.MMM YYYY");
			case EDateTimeUnit.Hour:
				return m.format("HH:mm \\o\\n ddd D.MMM YYYY");
			case EDateTimeUnit.Minute:
				return m.format("HH:mm \\o\\n ddd D.MMM YYYY");
			case EDateTimeUnit.Second:
				return m.format("HH:mm:ss \\o\\n ddd D.MMM YYYY");
			case EDateTimeUnit.Millisecond:
				return m.format("HH:mm:ss.SSS \\o\\n ddd D.MMM YYYY");
			default:
				throw "Not implemented.";
		}
	}

	static formatDateTimeRangeStartLabel(value, unit)
	{
		var m = moment.utc(value);
		switch (unit)
		{
			case EDateTimeUnit.Century:
				return "C" + (Math.floor(m.year() / 100) + 1);
			case EDateTimeUnit.Decade:
				return m.format("YYYY");
			case EDateTimeUnit.Year:
				return m.format("YYYY");
			case EDateTimeUnit.Quarter:
				return m.format("YYYY") + ", Q" + (Math.floor(moment.utc(value).month() / 3) + 1);
			case EDateTimeUnit.Month:
				return m.format("MMM YYYY");
			case EDateTimeUnit.Week:
				return "week " + m.format("w YYYY");
			case EDateTimeUnit.Day:
				return m.format("ddd D.MMM YYYY");
			case EDateTimeUnit.Hour:
				return m.format("ddd D.MMM YYYY");
			case EDateTimeUnit.Minute:
				return m.format("ddd D.MMM YYYY HH:mm");
			case EDateTimeUnit.Second:
				return m.format("ddd D.MMM YYYY HH:mm:ss");
			case EDateTimeUnit.Millisecond:
				return m.format("ddd D.MMM YYYY HH:mm:ss");
			default:
				throw "Not implemented.";
		}
	}

	static formatDateTimeDuration(min, max, unit)
	{
		var d = moment.duration(moment.utc(max).diff(moment.utc(min)));

		var sb = [];
		if (d.years()) sb.push(d.years() + " years");
		if (d.months() || sb.length) sb.push(d.months() + " months");
		if (d.days() || sb.length) sb.push(d.days() + " days");
		if (sb.length)
		{
			if (d.hours() || d.minutes() || d.seconds() || d.milliseconds()) sb.push(d.hours() + " hours");
			if (d.minutes() || d.seconds() || d.milliseconds()) sb.push(d.minutes() + " minutes");
			if (d.seconds() || d.milliseconds()) sb.push(d.seconds() + " seconds");
			if (d.milliseconds()) sb.push(d.milliseconds() + " ms");
			return sb.join(", ");
		}
		else
		{
			sb.push(String(d.hours()).padStart(2, '0') + ":");
			sb.push(String(d.minutes()).padStart(2, '0') + ":");
			sb.push(String(d.seconds()).padStart(2, '0') + ".");
			sb.push(String(d.milliseconds()).padStart(3, '0'));
			return sb.join("");
		}
	}
}

ChartStyleSheet.defaultSceneStyle = new ChartStyleSheet(
{
	font:
	{
		family: "lucida console, sans-serif",
		fill: "black",
		weight: 100,
	},
	scene:
	{
		backgroundColor: "#FCFBF8",
		backplane:
		{
			backgroundColor: "#feffff",
			majorHLineStyle:
			{
				lineColor: "#F0F0F0",
				lineWidth: 0.4,
				strokeStyle: "dashed",
			},
			majorVLineStyle:
			{
				lineColor: "#E0E0E0",
				lineWidth: 0.6,
				strokeStyle: "dashed",
			},
			minorHLineStyle:
			{
				lineColor: "#C7C7C7",
				lineWidth: 0.3,
				visible: false,
			},
			minorVLineStyle:
			{
				lineColor: "#e5e5e5",
				lineWidth: 0.4,
				strokeStyle: "dashed",
			},
			microHLineStyle:
			{
				lineColor: "#C7C7C7",
				lineWidth: 0.2,
				strokeStyle: "dashed",
				visible: false,
			},
			microVLineStyle:
			{
				lineColor: "#F0F0F0",
				lineWidth: 0.3,
				strokeStyle: "dotted",
			},
			runningHLineStyle:
			{
				lineColor: "#E0E0E0",
				lineWidth: 0.6,
				strokeStyle: "dashed",
				visible: false,
			},
			runningVLineStyle:
			{
				lineColor: "#E0E0E0",
				lineWidth: 0.7,
				strokeStyle: "dashed",
			},
		},
		series:
		{
			lineSeries:
			{
				data:
				{
					lineColor: "#204dc4",
					lineWidth: 0.8,
				},
				gapBoundry:
				{
					lineColor: "#97C4DF",
					lineWidth: 0.5,
					strokeStyle: "dashed",
				},
			},
			areaSeries:
			{
				areaOpacity: 0.03,
				areaBackgroundColor: "blue",
				low:
				{
					lineColor: "#204dc4",
					lineWidth: 0.4,
				},
				high:
				{
					lineColor: "#204dc4",
					lineWidth: 0.8,
				},
				gapBoundry:
				{
					lineColor: "#97C4DF",
					lineWidth: 0.5,
					strokeStyle: "dashed",
				},
			},
			heatMapSeries:
			{
				dotSize: 4,
				gridSpacing: 12,
			}
		},
		range:
		{
			range2d:
			{
				textVisibile_screenWidthThreshold: 50,
				backplane:
				{
					areaRatio1: 0.15,
					areaRatio2: 0.92,
					opacity1: 0.35,
					opacity2: 0,
					backgroundColor: "#512AC4",
					border:
					{
						lineColor: "#1F104B",
						lineWidth: 0.8,
					},
				},
				selectedBackplane:
				{
					backgroundColor: "#D7FF00",
					border:
					{
						lineColor: "green",
						lineWidth: 2,
					},
				},
				newBackplane:
				{
					backgroundColor: "red",
					border:
					{
						lineColor: "darkred",
						lineWidth: 2,
					},
				},

				xLabelStyle:
				{
					visible: true,
					font:
					{
						size: 8,
						fill: "darkblue",
					},
					formatter: function (formattingContext, value)
					{
						//return ChartStyleSheet.formatDateTimeAxisLabel(value, formattingContext.scaleInfo.micro.unit);
						return ChartStyleSheet.formatDateTimeAxisLabel(value, EDateTimeUnit.lowerUnit(formattingContext.scaleInfo.micro.unit));
					},
				},
				yLabelStyle:
				{
					visible: true,
					font:
					{
						size: 8,
						fill: "darkblue",
					},
					formatter: function (formattingContext, value)
					{
						return String(Math.round(value * 100000) / 100000);
					},
				},
				xDeltaLabelStyle:
				{
					visible: true,
					font:
					{
						size: 9,
						fill: "black",
					},
					formatter: function (formattingContext, min, max)
					{
						return ChartStyleSheet.formatDateTimeDuration(min, max);
					},
				},
				yDeltaLabelStyle:
				{
					visible: true,
					font:
					{
						size: 9,
						fill: "black",
					},
					formatter: function (formattingContext, min, max)
					{
						return String(Math.round((max - min) * 100000) / 100000);
					},
				},
			},
		},
		marker:
		{
			linearZone:
			{
				opacity: 0.075,
				backplane:
				{
					backgroundColor: "yellow",
					border: null,
				},
				lineStyle:
				{
					lineColor: "orange",
					lineWidth: 1,
				},
			},
			channelZone:
			{
				opacity: 0.1,
				backplane:
				{
					backgroundColor: "purple",
					border: null,
				},
				lineStyle:
				{
					lineColor: "darkBlue",
					lineWidth: 1,
				},
			},
			line:
			{
				lineStyle:
				{
					lineColor: "red",
					lineWidth: 1,
				},
			},
			point:
			{
				opacity: 0.5,
				size: 5,
				fill: "red",
				lineStyle:
				{
					lineColor: "darkred",
					lineWidth: 1,
				},
			},
		},

		axis:
		{
			position: "left",
			spread: 45,

			lineColor: "gray",
			lineWidth: 1,
			paddingUpper: 20,
			paddingLower: 20,

			majorTick:
			{
				lineColor: "gray",
				lineWidth: 1,
				majorTickLength: 11,
				label:
				{
					visible: true,
					labelOffset: 2,
					font:
					{
						size: 10,
					},
				},
			},

			minorTick:
			{
				visible: true,
				lineColor: "darkgrey",
				minorTickLength: 6,
				label:
				{
					labelOffset: 1,
					font:
					{
						fill: "gray",
						size: 8,
					},
				},
			},

			microTick:
			{
				lineColor: "lightgray",
				microTickLength: 3,
			},

			runningTick:
			{
				visible: true,
				lineColor: "darkgrey",
				strokeStyle: "dotted",
				runningTickLength: 25,
				label:
				{
					labelOffset: 1,
					font:
					{
						fill: "black",
						size: 10,
					},
				},
			},

			numericAxis:
			{
				majorTick:
				{
					majorTickRange: 50,
					formatter: function (formattingContext, unit, value)
					{
						return Utility.Format.formatNumber(value, 7);
					},
				},
				minorTick:
				{
					minorTickReduction: 2,
					minorTickRange: 5,
					label:
					{
						guaranteedSpace: 24,
						formatter: function (formattingContext, unit, value)
						{
							return Utility.Format.formatNumber(value, 7);
						},
					},
				},
				runningTick:
				{
					formatter: function (formattingContext, unit, value)
					{
						throw "Not implemented.";
					}
				},
				range:
				{
					label:
					{
						visible: true,
						formatter: function (formattingContext, value)
						{
							return Utility.Format.formatNumber(value, 7);
						},
						font:
						{
							size: 11,
						},
					},
					start:
					{
						label:
						{
							visible: true,
							formatter: function (formattingContext, value)
							{
								return Utility.Format.formatNumber(value, 7);
							},
							font:
							{
								size: 15,
							},
						},
					},
					end:
					{
						label:
						{
							visible: true,
							formatter: function (formattingContext, value)
							{
								return Utility.Format.formatNumber(value, 7);
							},
							font:
							{
								size: 9,
							},
						},
					},
				},
			},

			dateTimeAxis:
			{
				majorTick:
				{
					formatter: function (formattingContext, unit, value)
					{
						switch (unit)
						{
							case EDateTimeUnit.Century:
								return "C" + (Math.floor(moment.utc(value).year() / 100) + 1);
							case EDateTimeUnit.Decade:
								return moment.utc(value).format("YYYY");
							case EDateTimeUnit.Year:
								return moment.utc(value).year();
							case EDateTimeUnit.Quarter:
								return "Q" + (Math.floor(moment.utc(value).month() / 3) + 1);
							case EDateTimeUnit.Month:
								return moment.utc(value).format("MMM YYYY");
							case EDateTimeUnit.Week:
								return moment.utc(value).format("w");
							case EDateTimeUnit.Day:
								return moment.utc(value).format("ddd D.");
							case EDateTimeUnit.Hour:
								return moment.utc(value).format("H\\h");
							case EDateTimeUnit.Minute:
								return moment.utc(value).format("HH:mm");
							case EDateTimeUnit.Second:
								return moment.utc(value).format("s\\s");
							case EDateTimeUnit.Millisecond:
								return moment.utc(value).format("SSS\\m\\s");
							default:
								throw "Not implemented.";
						}
					},
				},
				minorTick:
				{
					formatter: function (formattingContext, unit, value)
					{
						switch (unit)
						{
							case EDateTimeUnit.Century:
								return "C" + (Math.floor(moment.utc(value).year() / 100) + 1);
							case EDateTimeUnit.Decade:
								return moment.utc(value).format("YYYY");
							case EDateTimeUnit.Year:
								return moment.utc(value).year();
							case EDateTimeUnit.Quarter:
								return "Q" + (Math.floor(moment.utc(value).month() / 3) + 1);
							case EDateTimeUnit.Month:
								return moment.utc(value).format("MMM YYYY");
							case EDateTimeUnit.Week:
								return moment.utc(value).format("w");
							case EDateTimeUnit.Day:
								return moment.utc(value).format("D.");
							case EDateTimeUnit.Hour:
								return moment.utc(value).format("H\\h");
							case EDateTimeUnit.Minute:
								return moment.utc(value).format("HH:mm");
							case EDateTimeUnit.Second:
								return moment.utc(value).format("s\\s");
							case EDateTimeUnit.Millisecond:
								return moment.utc(value).format("SSS\\m\\s");
							default:
								throw "Not implemented.";
						}
					},
				},
				runningTick:
				{
					formatter: function (formattingContext, unit, value)
					{
						switch (unit)
						{
							case EDateTimeUnit.Century:
								return "C" + (Math.floor(moment.utc(value).year() / 100) + 1);
							case EDateTimeUnit.Decade:
								return moment.utc(value).format("YYYY"); 
							case EDateTimeUnit.Year:
								return moment.utc(value).year();
							case EDateTimeUnit.Quarter:
								return "Q" + (Math.floor(moment.utc(value).month() / 3) + 1) + " " + moment.utc(value).format("YYYY");
							case EDateTimeUnit.Month:
								return moment.utc(value).format("MMM YYYY");
							case EDateTimeUnit.Week:
								return moment.utc(value).format("\\Ww");
							case EDateTimeUnit.Day:
								return moment.utc(value).format("ddd D.MMM");
							case EDateTimeUnit.Hour:
								return moment.utc(value).format("H\\h");
							case EDateTimeUnit.Minute:
								return moment.utc(value).format("HH:mm");
							case EDateTimeUnit.Second:
								return moment.utc(value).format("s\\s");
							case EDateTimeUnit.Millisecond:
								return moment.utc(value).format("SSS\\m\\s");
							default:
								throw "Not implemented.";
						}
					},
				},
				range:
				{
					label:
					{
						visible: true,
						formatter: function (formattingContext, value)
						{
							return "<-- " + moment.duration(value).humanize() + " -->";
							//return ChartStyleSheet.formatDateTimeRangeStartLabel(value, EDateTimeUnit.higherUnit(formattingContext.scaleInfo.major.unit));
						},
						font:
						{
							size: 12,
							fill: "darkblue",
						},
					},
					start:
					{
						label:
						{
							visible: true,
							formatter: function (formattingContext, value)
							{
								return ChartStyleSheet.formatDateTimeRangeStartLabel(value, EDateTimeUnit.higherUnit(formattingContext.scaleInfo.major.unit));
							},
							font:
							{
								size: 16,
								fill: "black",
							},
						},
					},
					end:
					{
						label:
						{
							visible: true,
							formatter: function (formattingContext, value)
							{
								return ChartStyleSheet.formatDateTimeAxisLabel(value, formattingContext.scaleInfo.micro.unit);
							},
							font:
							{
								size: 10,
								fill: "gray",
							},
						},
					},
				},
				rangeStyles:
				[
					{
						lessThan: "100ms",
						majorTicks: { every: "10ms" },
						minorTicks: { every: "5ms" },
						microTicks: { every: "1ms" },
						showWeeks: true,
					},
					{
						lessThan: "1s",
						majorTicks: { every: "100ms" },
						minorTicks: { every: "20ms" },
						microTicks: { every: "5ms" },
						showWeeks: true,
					},
					{
						lessThan: "2s",
						majorTicks: { every: "200ms" },
						minorTicks: { every: "50ms" },
						microTicks: { every: "10ms" },
						showWeeks: true,
					},
					{
						lessThan: "10s",
						majorTicks: { every: "1s" },
						minorTicks: { every: "500ms" },
						microTicks: { every: "100ms" },
						showWeeks: true,
					},
					{
						lessThan: "30s",
						majorTicks: { every: "5s" },
						minorTicks: { every: "1s" },
						microTicks: { every: "200ms" },
						showWeeks: true,
					},
					{
						lessThan: "1min",
						majorTicks: { every: "10s" },
						minorTicks: { every: "1s" },
						microTicks: { every: "200ms" },
						showWeeks: true,
					},
					{
						lessThan: "5min",
						majorTicks: { every: "30s" },
						minorTicks: { every: "5s" },
						microTicks: { every: "1s" },
						showWeeks: true,
					},
					{
						lessThan: "10min",
						majorTicks: { every: "1min" },
						minorTicks: { every: "10s" },
						microTicks: { every: "1s" },
						showWeeks: true,
					},
					{
						lessThan: "30min",
						majorTicks: { every: "5min" },
						minorTicks: { every: "1min" },
						microTicks: { every: "10s" },
						showWeeks: true,
					},
					{
						lessThan: "1h",
						majorTicks: { every: "10min" },
						minorTicks: { every: "5min" },
						microTicks: { every: "1min" },
						showWeeks: true,
					},
					{
						lessThan: "3h",
						majorTicks: { every: "15min" },
						minorTicks: { every: "5min" },
						microTicks: { every: "1min" },
						showWeeks: true,
					},
					{
						lessThan: "12h",
						majorTicks: { every: "1h" },
						minorTicks: { every: "15min" },
						microTicks: { every: "5min" },
						showWeeks: true,
					},
					{
						lessThan: "1d",
						majorTicks: { every: "1h" },
						minorTicks: { every: "30min" },
						microTicks: { every: "10min" },
						showWeeks: true,
					},
					{
						lessThan: "3d",
						majorTicks: { every: "6h" },
						minorTicks: { every: "1h" },
						microTicks: { every: "30min" },
						showWeeks: true,
					},
					{
						lessThan: "10d",
						majorTicks: { every: "1d" },
						minorTicks: { every: "6h" },
						microTicks: { every: "1h" },
						showWeeks: true,
					},
					{
						lessThan: "15d",
						majorTicks: { every: "1d" },
						minorTicks: { every: "12h" },
						microTicks: { every: "1h" },
						showWeeks: true,
					},
					{
						lessThan: "1M",
						majorTicks: { every: "1d" },
						minorTicks: { every: "12h" },
						microTicks: { every: "4h" },
						showWeeks: true,
					},
					{
						lessThan: "1Q",
						majorTicks: { every: "10d" },
						minorTicks: { every: "2d" },
						microTicks: { every: "6h" },
						showWeeks: true,
					},
					{
						lessThan: "2Q",
						majorTicks: { every: "1M" },
						minorTicks: { every: "14d" },
						microTicks: { every: "1d" },
						showWeeks: true,
					},
					{
						lessThan: "1y",
						majorTicks: { every: "1M" },
						minorTicks: { every: "14d" },
						microTicks: { every: "5d" },
					},
					{
						lessThan: "3y",
						majorTicks: { every: "4M" },
						minorTicks: { every: "1M" },
						microTicks: { every: "10d" },
					},
					{
						lessThan: "5y",
						majorTicks: { every: "1y" },
						minorTicks: { every: "1Q" },
						microTicks: { every: "1M" },
					},
					{
						lessThan: "1D",
						majorTicks: { every: "1y" },
						minorTicks: { every: "6M" },
						microTicks: { every: "1M" },
					},
					{
						lessThan: "2D",
						majorTicks: { every: "1y" },
						minorTicks: { every: "1Q" },
						microTicks: { every: "1M" },
					},
					{
						lessThan: "4D",
						majorTicks: { every: "5y" },
						minorTicks: { every: "1y" },
						microTicks: { every: "1Q" },
					},
					{
						lessThan: "20D",
						majorTicks: { every: "1D" },
						minorTicks: { every: "5y" },
						microTicks: { every: "1y" },
					},
					{
						lessThan: "1c",
						majorTicks: { every: "5D" },
						minorTicks: { every: "1D" },
						microTicks: { every: "5y" },
					},
					{
						lessThan: "4c",
						majorTicks: { every: "1c" },
						minorTicks: { every: "2D" },
						microTicks: { every: "5y" },
					},
				],
			}
		},
	},
});

ChartStyleSheet.defaultOverlayStyle = new ChartStyleSheet(
{
	font:
	{
		family: "lucida console, sans-serif",
		fill: "black",
		weight: 100,
	},
	overlay:
	{
		indicator:
		{
			line:
			{
				lineColor: "#826B0D",
				lineWidth: 0.5,
				strokeStyle: "dotted",
			},
			axisLine:
			{
				lineColor: "goldenrod",
				lineWidth: 1,
			},
			label:
			{
				visible: true,
				opacity: 0.7,
				hAlign: "right",
				vAlign: "top",
				backplane:
				{
					backgroundColor: "darkgoldenrod",
					border:
					{
						lineColor: "black",
						lineWidth: 0.5,
					}
				},
				font:
				{
					fill: "white",
					size: 13,
				},
				formatter: function (formattingContext, dataPoint)
				{
					var textX = null;
					switch (formattingContext.scaleInfoX.valueType)
					{
						case EChartDataType.Numeric:
							textX = String(Math.round(dataPoint.x * 100000) / 100000);
							break;
						case EChartDataType.DateTime:
							textX = ChartStyleSheet.formatDateTimeAxisLabel(dataPoint.x, EDateTimeUnit.lowerUnit(formattingContext.scaleInfoX.micro.unit)) + " (" + Math.round(formattingContext.scaleInfoX.modelToScene(dataPoint.x)) + "px)";
							break;
						default:
							throw "Not implemented.";
					}

					var textY = null;
					switch (formattingContext.scaleInfoY.valueType)
					{
						case EChartDataType.Numeric:
							textY = String(Math.round(dataPoint.y * 100000) / 100000).padEnd(7, '0') + " (" + Math.round(formattingContext.scaleInfoY.modelToScene(dataPoint.y)) + "px)";
							break;
						case EChartDataType.DateTime:
							textY = ChartStyleSheet.formatDateTimeAxisLabel(dataPoint.y, formattingContext.scaleInfoY.micro.unit);
							break;
						default:
							throw "Not implemented.";
					}

					return textY + " / " + textX;
				},
			},
			axisLabel:
			{
				visible: true,
				opacity: 0.5,
				backplane:
				{
					backgroundColor: "darkgoldenrod",
					border:
					{
						lineColor: "black",
						lineWidth: 0.5,
					},
				},
				font:
				{
					fill: "white",
					size: 11,
				},
				formatter: function (formattingContext, value)
				{
					switch (formattingContext.scaleInfo.valueType)
					{
						case EChartDataType.Numeric:
							return Utility.Format.formatNumber(value, 7);
						case EChartDataType.DateTime:
							return ChartStyleSheet.formatDateTimeAxisLabel(value, formattingContext.scaleInfo.micro.unit);
						default:
							throw "Not implemented.";
					}
				},
			},
			axisRange:
			{
				opacity: 0.4,
				backplane:
				{
					backgroundColor: "#64B8E2",
					border:
					{
						lineColor: "#062F43",
						lineWidth: 0.75,
					},
				},
			},
			horizontalRange:
			{
				backplane:
				{
					opacity: 0.35,
					backgroundColor: "#512AC4",
					border:
					{
						lineColor: "#1F104B",
						lineWidth: 0.8,
					},
				},
				
				xLabelStyle:
				{
					visible: true,
					font:
					{
						size: 8,
						fill: "darkblue",
					},
					formatter: function (formattingContext, value)
					{
						return ChartStyleSheet.formatDateTimeAxisLabel(value, EDateTimeUnit.lowerUnit(formattingContext.scaleInfo.micro.unit));
					},
				},
				xDeltaLabelStyle:
				{
					visible: true,
					font:
					{
						size: 9,
						fill: "black",
					},
					formatter: function (formattingContext, min, max)
					{
						return ChartStyleSheet.formatDateTimeDuration(min, max);
					},
				},
			},
		},
	},
});