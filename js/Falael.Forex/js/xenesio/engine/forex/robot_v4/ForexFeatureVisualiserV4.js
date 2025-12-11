"use strict";

include("StdAfx.js");

class ForexFeatureVisualiserV4
{
	constructor(chartVisual, timeAxis, valueAxis)
	{
		this._chartVisual = chartVisual;
		this._timeAxis = timeAxis;
		this._valueAxis = valueAxis;
	}

	draw(featureList, min, max)
	{
		for (var length = featureList.length, i = 0; i < length; ++i)
		{
			var item = featureList[i];
			if (item instanceof ForexFeatureV4_TrendLine) this._drawTrendLine(item, min, max);
			else if (item instanceof ForexFeatureV4_Extremums) this._drawExtremums(item, min, max);
			else throw "Not implemented.";
		}
	}

	_drawTrendLine(feature, min, max)
	{
		var red = feature.rating * 255;
		var blue = (1 - feature.rating) * 255;

		//	central line (trend line)
		var lineMarker = new ChartLineMarker("lineOfBestFit", this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = min;
		lineMarker.modelY0 = feature.line.calc(lineMarker.modelX0);
		lineMarker.modelX1 = max;
		lineMarker.modelY1 = feature.line.calc(lineMarker.modelX1);
		lineMarker.lineStyle.color = "rgb(" + red + ", 0, " + blue + ")";
		lineMarker.lineStyle.width = 1;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		//	standard deviation (Y-axis) lines
		var standardDeviationY = feature.pointSample.standardDeviation("y");
		var standardDeviationLineCount = 3;
		for (var i = -standardDeviationLineCount; i <= standardDeviationLineCount; ++i)
		{
			if (!i) continue;

			var line = feature.line.clone();
			line.b += i * standardDeviationY;

			var lineMarker = new ChartLineMarker("standardDeviationLine" + i, this._timeAxis, this._valueAxis, true);
			lineMarker.modelX0 = min;
			lineMarker.modelY0 = line.calc(lineMarker.modelX0);
			lineMarker.modelX1 = max;
			lineMarker.modelY1 = line.calc(lineMarker.modelX1);
			lineMarker.lineStyle.color = "gray";
			lineMarker.lineStyle.width = 1;
			lineMarker.lineStyle.strokeStyle = "dashed";
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
		}

		//	channel start
		var lineMarker = new ChartLineMarker("channelStart", this._timeAxis, this._valueAxis, true);
		lineMarker.modelX0 = feature.pointSample.getAt(0, "x");
		lineMarker.modelY0 = 0;
		lineMarker.modelX1 = lineMarker.modelX0;
		lineMarker.modelY1 = 10;
		lineMarker.lineStyle.color = "#cc00cc";
		lineMarker.lineStyle.width = 1.2;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
	}

	_drawExtremums(feature, min, max)
	{
		for (var length = feature.extremumSample.length, i = 0; i < length; i += 3)
		{
			var prevX = feature.extremumSample.getAt(i, "x");
			var extremumX = feature.extremumSample.getAt(i + 1, "x");
			var nextX = feature.extremumSample.getAt(i + 2, "x");

			var prevY = feature.extremumSample.getAt(i, "y");
			var extremumY = feature.extremumSample.getAt(i + 1, "y");
			var nextY = feature.extremumSample.getAt(i + 2, "y");

			var pointMarker = new ChartPointMarker("extremumPoint_" + feature.extremumTypes + "_" + i / 3, this._timeAxis, this._valueAxis, true);
			//pointMarker.modelX = extremumX;
			//pointMarker.modelY = extremumY;
			pointMarker.modelX = nextX;
			pointMarker.modelY = nextY;
			//pointMarker.modelX = prevX;
			//pointMarker.modelY = prevY;
			pointMarker.size = 2;
			switch (feature.extremumTypes)
			{
				case EExtremumTypesV4.Peaks:
					pointMarker.color = "orange";
					pointMarker.lineStyle.lineColor = "red";
					break;
				case EExtremumTypesV4.Valleys:
					pointMarker.color = "cyan";
					pointMarker.lineStyle.lineColor = "blue";
					break;
				default:
					throw "Not implemented.";
			}
			this._chartVisual.scene.markers.add(pointMarker);
			ChartStyleSheet.defaultSceneStyle.applyToPoint(pointMarker);
		}
	}
}
