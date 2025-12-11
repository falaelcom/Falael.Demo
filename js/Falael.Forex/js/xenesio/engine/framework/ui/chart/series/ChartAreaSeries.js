"use strict";

include("StdAfx.js");

class ChartAreaSeries extends ChartDataSeries
{
	constructor(id, zIndex, xAxis, yAxis, xFieldName, yFieldName_low, yFieldName_high, dataSource, mapping, defaultValues)
	{
		super(id, zIndex, xAxis, yAxis, dataSource, mapping, defaultValues, "areaSeries");

		this._xFieldName = xFieldName;
		this._yFieldName_low = yFieldName_low;
		this._yFieldName_high = yFieldName_high;

		this._areaOpacity = null;
		this._areaBackgroundColor = null;

		this._lineStyle_low = new ChartLineStyle("lineStyle_low", this);
		this._lineStyle_low.change.add(function (sender, args) { this.__invalidateAspect("lineStyles"); }.bind(this));
		this._lineStyle_high = new ChartLineStyle("lineStyle_high", this);
		this._lineStyle_high.change.add(function (sender, args) { this.__invalidateAspect("lineStyles"); }.bind(this));
		this._gapBoundryLineStyle = new ChartLineStyle("gapBoundryLineStyle", this);
		this._gapBoundryLineStyle.change.add(function (sender, args) { this.__invalidateAspect("lineStyles"); }.bind(this));

		this._gapTester = null;
	}


	__buildRenderPlan(renderPlan)
	{
		if (this.__isAspectValid("boundingRect") && this.__isAspectValid("areaBackplaneStyle") && this.__isAspectValid("dataRanges") && this.__isAspectValid("dataSource") && this.dataSourceValid && this.__isAspectValid("lineStyles"))
		{
			return;
		}

		var arm = new ArrayMapper(this.dataSource.rawData, this.mapping, this.defaultValues);
		if (arm.length)
		{
			var vertices_low = null;
			var vertexGroups_low = [];
			var vertices_high = null;
			var vertexGroups_high = [];
			var lastModelX;
			var lastSceneX;
			for (var length = arm.length, i = 0; i < length; ++i)
			{
				var item = arm.get(i);
				var modelX = arm.valueOf(item, this._xFieldName);
				var modelY_low = arm.valueOf(item, this._yFieldName_low);
				var modelY_high = arm.valueOf(item, this._yFieldName_high);
				if (lastModelX > modelX) throw "Invalid data.";

				var sceneX = this._xAxis.modelToScene(modelX);
				var sceneY_low = this._yAxis.modelToScene(modelY_low);
				var sceneY_high = this._yAxis.modelToScene(modelY_high);
				if (lastSceneX > sceneX) throw "Invalid operation.";

				if (i == 0 || this.gapTester && this.gapTester(lastModelX, modelX))
				{
					vertices_low = [];
					vertexGroups_low.push(vertices_low);
					vertices_high = [];
					vertexGroups_high.push(vertices_high);

					if (i != 0) renderPlan.renderInfos.push(
					{
						aspects: ["boundingRect", "dataRanges", "dataSource", "lineStyles"],
						primitive: "markerLine",
						x: this._xAxis.modelToScene(lastModelX),
						y: this.boundingRect.y,
						width: 0,
						height: this.boundingRect.height,
						lineStyle: this._gapBoundryLineStyle,
						source: this,
					});
					renderPlan.renderInfos.push(
					{
						aspects: ["boundingRect", "dataRanges", "dataSource", "lineStyles"],
						primitive: "markerLine",
						x: sceneX,
						y: this.boundingRect.y,
						width: 0,
						height: this.boundingRect.height,
						lineStyle: this._gapBoundryLineStyle,
						source: this,
					});
				}
				vertices_low.push({ sceneX: sceneX, sceneY: sceneY_low });
				vertices_high.push({ sceneX: sceneX, sceneY: sceneY_high });
				lastModelX = modelX;
				lastSceneX = sceneX;
			}

			renderPlan.renderInfos.push(
			{
				aspects: ["boundingRect", "dataRanges", "dataSource", "lineStyles"],
				primitive: "markerLine",
				x: this._xAxis.modelToScene(lastModelX),
				y: this.boundingRect.y,
				width: 0,
				height: this.boundingRect.height,
				lineStyle: this._gapBoundryLineStyle,
				source: this,
			});

			if (vertexGroups_low.length != vertexGroups_high.length) throw "Invalid operation.";
			var vertexGroups_area = [];
			for (var length = vertexGroups_low.length, i = 0; i < length; ++i)
			{
				var group_low = vertexGroups_low[i];
				var group_high = vertexGroups_high[i];
				var group_area = [];
				vertexGroups_area.push(group_area);
				for (var jlength = group_low.length, j = 0; j < jlength; ++j) group_area.push(group_low[j]);
				for (var j = group_high.length - 1; j >= 0; --j) group_area.push(group_high[j]);
			}
			renderPlan.renderInfos.push(
			{
				aspects: ["boundingRect", "areaBackplaneStyle", "dataRanges", "dataSource", "lineStyles"],
				primitive: "areaChart",
				vertexGroups: vertexGroups_area || [],
				opacity: this.areaOpacity,
				style:
				{
					fill: this.areaBackgroundColor,
				},
				source: this,
			});

			renderPlan.renderInfos.push(
			{
				aspects: ["boundingRect", "dataRanges", "dataSource", "lineStyles"],
				primitive: "lineChart",
				vertexGroups: vertexGroups_low || [],
				lineStyle: this.lineStyle_low,
				source: this,
			});

			renderPlan.renderInfos.push(
			{
				aspects: ["boundingRect", "dataRanges", "dataSource", "lineStyles"],
				primitive: "lineChart",
				vertexGroups: vertexGroups_high || [],
				lineStyle: this.lineStyle_high,
				source: this,
			});
		}

		this.validateDataSource();
	}


	get xFieldName()
	{
		return this._xFieldName;
	}

	get yFieldName_low()
	{
		return this._yFieldName_low;
	}

	get yFieldName_high()
	{
		return this._yFieldName_high;
	}


	get areaOpacity()
	{
		return this._areaOpacity;
	}

	set areaOpacity(value)
	{
		if (this._areaOpacity == value)
		{
			return;
		}
		this._areaOpacity = value;
		this.__invalidateAspect("areaBackplaneStyle");
	}

	get areaBackgroundColor()
	{
		return this._areaBackgroundColor;
	}

	set areaBackgroundColor(value)
	{
		if (this._areaBackgroundColor == value)
		{
			return;
		}
		this._areaBackgroundColor = value;
		this.__invalidateAspect("areaBackplaneStyle");
	}


	get lineStyle_low()
	{
		return this._lineStyle_low;
	}

	get lineStyle_high()
	{
		return this._lineStyle_high;
	}

	get gapBoundryLineStyle()
	{
		return this._gapBoundryLineStyle;
	}

	get gapTester()
	{
		return this._gapTester;
	}

	set gapTester(value)
	{
		if (this._gapTester == value)
		{
			return;
		}
		this._gapTester = value;
	}
}
