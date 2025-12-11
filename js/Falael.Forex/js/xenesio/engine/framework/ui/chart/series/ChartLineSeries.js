"use strict";

include("StdAfx.js");

class ChartLineSeries extends ChartDataSeries
{
	constructor(id, zIndex, xAxis, yAxis, xFieldName, yFieldName, dataSource, mapping, defaultValues)
	{
		super(id, zIndex, xAxis, yAxis, dataSource, mapping, defaultValues, "lineSeries");

		this._xFieldName = xFieldName;
		this._yFieldName = yFieldName;

		this._lineStyle = new ChartLineStyle("lineStyle", this);
		this._lineStyle.change.add(function (sender, args) { this.__invalidateAspect("lineStyles"); }.bind(this));
		this._gapBoundryLineStyle = new ChartLineStyle("gapBoundryLineStyle", this);
		this._gapBoundryLineStyle.change.add(function (sender, args) { this.__invalidateAspect("lineStyles"); }.bind(this));

		this._gapTester = null;
	}


	__buildRenderPlan(renderPlan)
	{
		if (this.__isAspectValid("boundingRect") && this.__isAspectValid("dataRanges") && this.__isAspectValid("dataSource") && this.dataSourceValid && this.__isAspectValid("lineStyles"))
		{
			return;
		}

		var arm = new ArrayMapper(this.dataSource.rawData, this.mapping, this.defaultValues);
		if (arm.length)
		{
			var vertices = null;
			var vertexGroups = [];
			var lastModelX;
			var lastSceneX;
			for (var length = arm.length, i = 0; i < length; ++i)
			{
				var item = arm.get(i);
				var modelX = arm.valueOf(item, this._xFieldName);
				var modelY = arm.valueOf(item, this._yFieldName);
				if (lastModelX > modelX) throw "Invalid data.";

				var sceneX = this._xAxis.modelToScene(modelX);
				var sceneY = this._yAxis.modelToScene(modelY);
				if (lastSceneX > sceneX) throw "Invalid operation.";

				if (i == 0 || this.gapTester && this.gapTester(lastModelX, modelX))
				{
					vertices = [];
					vertexGroups.push(vertices);

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
				vertices.push({ sceneX: sceneX, sceneY: sceneY });
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

			renderPlan.renderInfos.push(
			{
				aspects: ["boundingRect", "dataRanges", "dataSource", "lineStyles"],
				primitive: "lineChart",
				vertexGroups: vertexGroups || [],
				lineStyle: this.lineStyle,
				source: this,
			});
		}

		this.validateDataSource();
	}


	get xFieldName()
	{
		return this._xFieldName;
	}

	get yFieldName()
	{
		return this._yFieldName;
	}

	get lineStyle()
	{
		return this._lineStyle;
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
