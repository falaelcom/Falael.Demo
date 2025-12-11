"use strict";

include("StdAfx.js");

class ChartLinearZoneMarker extends ChartElement
{
	//	spreadAxisRole: EChartAxisRole
	constructor(id, xAxis, yAxis, spreadAxisRole, visible)
	{
		super(id, 2000, null, null, visible, "linearZone");

		this._xAxis = xAxis;
		this._xAxis.change.add(this._xAxis_change.bind(this));
		this._yAxis = yAxis;
		this._yAxis.change.add(this._yAxis_change.bind(this));

		this._opacity = null;
		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("lineStyle"); }.bind(this));
		this._backplaneColor = null;

		this._modelLowerX = null;
		this._modelUpperX = null;
		this._modelLowerY = null;
		this._modelUpperY = null;
		this._modelSpread = null;
		this._spreadAxisRole = spreadAxisRole;

		this._screenSpread = null;
	}

	static fromJson(context, json)
	{
		if (json.type != "ChartLinearZoneMarker")
		{
			throw "Invalid argument \"json.type\".";
		}

		var xAxis = context.control.scene.getChildById(json.xAxisId);
		var yAxis = context.control.scene.getChildById(json.yAxisId);

		if (!xAxis || !yAxis) return null;

		var result = new ChartLinearZoneMarker(json.id, xAxis, yAxis, json.visible);

		result.modelLowerX = json.modelLowerX;
		result.modelUpperX = json.modelUpperX;
		result.modelLowerY = json.modelLowerY;
		result.modelUpperY = json.modelUpperY;
		result.modelSpread = json.modelSpread;
		result.spreadAxisRole = json.spreadAxisRole;

		result.lineStyle = json.lineStyle;
		result.backplaneColor = json.backplaneColor;

		return result;
	}

	toJson()
	{
		var result =
		{
			type: "ChartLinearZoneMarker",
			id: this.id,
			visible: this.visible,
			xAxisId: this._xAxis.id,
			yAxisId: this._yAxis.id,
			modelLowerX: this._modelLowerX,
			modelUpperX: this._modelUpperX,
			modelLowerY: this._modelLowerY,
			modelUpperY: this._modelUpperY,
			modelSpread: this._modelSpread,
			spreadAxisRole: this._spreadAxisRole,
			lineStyle: this._lineStyle,
			backplaneColor: this._backplaneColor,
		};
		return result;
	}


	__performLayout()
	{
	}

	__buildRenderPlan(renderPlan)
	{
		var boundingRectValid = this.__isAspectValid("boundingRect");
		var lineValid = boundingRectValid && this.__isAspectValid("lineStyle");
		var backplaneValid = boundingRectValid && this.__isAspectValid("backplaneStyle");

		var sceneLowerX = this._xAxis.modelToScene(this.modelLowerX);
		var sceneUpperX = this._xAxis.modelToScene(this.modelUpperX);
		var sceneLowerY = this._yAxis.modelToScene(this.modelLowerY);
		var sceneUpperY = this._yAxis.modelToScene(this.modelUpperY);

		if (!backplaneValid)
		{
			var renderInfo =
			{
				aspects: ["boundingRect", "backplaneStyle"],
				primitive: "linearZone",
				style:
				{
					fill: this.backplaneColor,
				},
				lineStyle: this.lineStyle,
				rotation: null,
				source: this,
				zIndex: this.zIndex,
				opacity: this._opacity,
			};

			renderPlan.renderInfos.push(renderInfo);

			renderInfo.x = sceneLowerX;
			renderInfo.y = sceneLowerY;
			if (!this._screenSpread)
			{
				switch (this._spreadAxisRole)
				{
					case EChartAxisRole.Ox:
						renderInfo.width = this._xAxis.modelToScene(this._modelSpread) - this._xAxis.modelToScene(0);
						break;
					case EChartAxisRole.Oy:
						renderInfo.width = this._yAxis.modelToScene(this._modelSpread) - this._yAxis.modelToScene(0);
						break;
				}
			}
			else
			{
				renderInfo.width = this._screenSpread;
			}
			renderInfo.height = Math.sqrt((sceneUpperX - sceneLowerX) * (sceneUpperX - sceneLowerX) + (sceneUpperY - sceneLowerY) * (sceneUpperY - sceneLowerY));

			var x1 = sceneLowerX;
			var y1 = sceneLowerY;
			var x2 = sceneUpperX;
			var y2 = sceneUpperY;
			var a = (y1 - y2) / (x1 - x2);
			var b = y1 - a * x1;

			var x3 = x1;
			var y3 = y1 - renderInfo.height;
			var x4 = (y3 - b) / a;
			var c = x4 - x3;
			var d = renderInfo.height;
			var e = Math.sqrt(c * c + d * d);
			var alpha = Math.asin(c / e);
			if (this.modelLowerY <= this.modelUpperY)
			{
				renderInfo.rotation = -alpha;
			}
			else
			{
				renderInfo.rotation = Math.PI - alpha;
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

	get lineStyle()
	{
		return this._lineStyle;
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


	get modelSpread()
	{
		return this._modelSpread;
	}

	set modelSpread(value)
	{
		if (this._modelSpread == value)
		{
			return;
		}
		this._modelSpread = value;
		this.__invalidateAspect("boundingRect");
	}

	get spreadAxisRole()
	{
		return this._spreadAxisRole;
	}

	set spreadAxisRole(value)
	{
		if (this._spreadAxisRole == value)
		{
			return;
		}
		this._spreadAxisRole = value;
		this.__invalidateAspect("boundingRect");
	}


	get screenSpread()
	{
		return this._screenSpread;
	}

	set screenSpread(value)
	{
		if (this._screenSpread == value)
		{
			return;
		}
		this._screenSpread = value;
		this.__invalidateAspect("boundingRect");
	}
}
