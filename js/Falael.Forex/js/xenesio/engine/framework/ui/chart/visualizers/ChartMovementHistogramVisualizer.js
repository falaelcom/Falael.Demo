"use strict";

include("StdAfx.js");

class ChartMovementHistogramVisualizer
{
	constructor(chartVisual, xAxis, yAxis)
	{
		this._chartVisual = chartVisual;
		this._xAxis = xAxis;
		this._yAxis = yAxis;
	}

	//var sampleIntervalDef = await app.db.getLowerSampleInterval(this._sampleIntervalDef.collectionName, 2);
	//log("working with sample interval ", sampleIntervalDef.collectionName);
	//
	//var dbChannel = app.db.getChannel(this._instrumentId, sampleIntervalDef);
	//await dbChannel.ensureRange(range.roundUp(0.5));
	//var data = dbChannel.getRawDataInRange(range.roundUp(0.5));
	//if (!data.length) return;
	//
	//var avgUnitLengthMs = (EDateTimeUnit.getMinUnitLengthMs(sampleIntervalDef.unit) + EDateTimeUnit.getMaxUnitLengthMs(sampleIntervalDef.unit)) / 2;
	//var avgIntervalLengthMs = avgUnitLengthMs * sampleIntervalDef.length;
	//
	//var distances_x = [avgIntervalLengthMs, 2 * avgIntervalLengthMs, 4 * avgIntervalLengthMs, 8 * avgIntervalLengthMs, 16 * avgIntervalLengthMs, 32 * avgIntervalLengthMs, 64 * avgIntervalLengthMs, 128 * avgIntervalLengthMs, 256 * avgIntervalLengthMs];
	//var movements = Sample.movements(new ArrayMapper(data, { x: "dt", y: "ask" }), distances_x, "x", "y");
	//
	//var visualizer = new ChartMovementHistogramVisualizer(this._fftChart, this._fftxAxis, this._fftyAxis);
	//visualizer.draw(distances_x, movements, 0.00005);
	//
	//	mode: none | "probabilities" | "effectiveness"
	draw(distances, movements, valueAccessorKey_y, valueAccessorKey_mindy, valueAccessorKey_maxdy, histogramInterval, mode, threshold1, threshold2)
	{
		var threshold1 = threshold1 || 0.25;
		var threshold2 = threshold2 || 0.5;

		var movement_histograms = [];
		var minX = 0;
		var maxX = -Infinity;
		var centerX = -Infinity;
		var minY = Infinity;
		var maxY = -Infinity;
		for (var coll = movements, length = coll.length, i = 0; i < length; ++i)
		{
			var branch = coll[i];
			
			let histogramRaw;
			let histogram; 
			switch (mode)
			{
				case "probabilities":
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw.probabilities();
					break;
				case "effectiveness":
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw.probabilities().effectiveness();
					break;
				default:
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw;
					break;
			}
			movement_histograms[i] = histogram;
			minY = Math.min(minY, histogram.min);
			maxY = Math.max(maxY, histogram.max);
			centerX = Math.max(centerX, histogram.negative.length);
			maxX = Math.max(maxX, histogram.length + centerX - histogram.negative.length);

			histogram.contraMovements_negative = new Array(histogram.negative.length).fill(0);
			histogram.contraMovements_positive = new Array(histogram.positive.length).fill(0);
			for (var klength = branch.length, k = 0; k < klength; ++k)
			{
				var kitem = branch[k];
				var y = kitem[valueAccessorKey_y];
				var index = histogram.index(y);
				if (index == 0) continue;
				if (index < 0)
				{
					var maxdy = kitem[valueAccessorKey_maxdy];
					if (y * threshold1 + maxdy > 0)++histogram.contraMovements_negative[-index - 1];
				}
				else
				{
					var mindy = kitem[valueAccessorKey_mindy];
					if (y * threshold1 + mindy < 0)++histogram.contraMovements_positive[index - 1];
				}
			}
			switch (mode)
			{
				case "probabilities":
					for (var klength = histogramRaw.negative.length, k = 0; k < klength; ++k) histogram.contraMovements_negative[k] /= histogramRaw.negative[k];
					for (var klength = histogramRaw.positive.length, k = 0; k < klength; ++k) histogram.contraMovements_positive[k] /= histogramRaw.positive[k];
					break;
				case "effectiveness":
					for (var klength = histogramRaw.negative.length, k = 0; k < klength; ++k) histogram.contraMovements_negative[k] = (histogram.contraMovements_negative[k] / histogramRaw.negative[k] < threshold2);
					for (var klength = histogramRaw.positive.length, k = 0; k < klength; ++k) histogram.contraMovements_positive[k] = (histogram.contraMovements_positive[k] / histogramRaw.positive[k] < threshold2);
					break;
				default:
					break;
			}
		}

		var vstep = (maxY - minY) * 1.2;
		for (var coll = movement_histograms, length = coll.length, i = 0; i < length; ++i)
		{
			var histogram = coll[i];
			var branch = histogram.toArray();
			var contraMovements = histogram.contraMovements_negative.reverse().concat([0]).concat(histogram.contraMovements_positive);
			for (var jlength = branch.length, j = 0; j < jlength; ++j)
			{
				var y = branch[j] || 0;

				var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
				lineMarker.modelX0 = j + centerX - histogram.negative.length;
				lineMarker.modelY0 = i * vstep;
				lineMarker.modelX1 = lineMarker.modelX0;
				switch (mode)
				{
					case "probabilities":
						lineMarker.modelY1 = i * vstep + y;
						break;
					case "effectiveness":
						lineMarker.modelY1 = i * vstep + y;
						break;
					default:
						lineMarker.modelY1 = i * vstep + (y < 3 ? 3 : y);
						break;
				}
				lineMarker.lineStyle.color = "blue";
				lineMarker.lineStyle.width = 1;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

				var yc = contraMovements[j];
				if (Utility.Type.isBoolean(yc))
				{
					yc = yc ? Math.sign(y) * vstep / 10 : 0;
				}
				var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
				lineMarker.modelX0 = j + centerX - histogram.negative.length;
				lineMarker.modelY0 = i * vstep;
				lineMarker.modelX1 = lineMarker.modelX0;
				switch (mode)
				{
					case "probabilities":
						lineMarker.modelY1 = i * vstep - yc;
						break;
					case "effectiveness":
						lineMarker.modelY1 = i * vstep - yc
						break;
					default:
						lineMarker.modelY1 = i * vstep - (yc < 3 ? 3 : yc);
						break;
				}
				lineMarker.lineStyle.color = "red";
				lineMarker.lineStyle.width = 1;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
				
			}
			var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
			lineMarker.modelX0 = Number.MIN_SAFE_INTEGER;
			lineMarker.modelY0 = i * vstep;
			lineMarker.modelX1 = Number.MAX_SAFE_INTEGER;
			lineMarker.modelY1 = i * vstep;
			lineMarker.lineStyle.color = "black";
			lineMarker.lineStyle.width = 0.3;
			this._chartVisual.scene.markers.add(lineMarker);
			ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

			log(36235, Math.round(10 * distances[i] / 1000 ) / 10, "sec", "most effective -", histogram.value(histogram.minIndex), "most effective +", histogram.value(histogram.maxIndex));

			var pointMarker1 = new ChartPointMarker(newLUID(), this._xAxis, this._yAxis, true);
			pointMarker1.modelX = histogram.minIndex + centerX;
			pointMarker1.modelY = i * vstep + histogram.min;
			pointMarker1.opacity = 1;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "blue";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);

			var pointMarker1 = new ChartPointMarker(newLUID(), this._xAxis, this._yAxis, true);
			pointMarker1.modelX = histogram.maxIndex + centerX;
			pointMarker1.modelY = i * vstep + histogram.max;
			pointMarker1.opacity = 1;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "red";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);
		}

		var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
		lineMarker.modelX0 = centerX;
		lineMarker.modelY0 = Number.MIN_SAFE_INTEGER;
		lineMarker.modelX1 = centerX;
		lineMarker.modelY1 = Number.MAX_SAFE_INTEGER;
		lineMarker.lineStyle.color = "black";
		lineMarker.lineStyle.width = 0.3;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		this._xAxis.dataRange.setBounds(minX, maxX);
		this._yAxis.dataRange.setBounds(minY, movement_histograms.length * vstep);
	}

	draw2(distances, movements, valueAccessorKey_y, valueAccessorKey_mindy, valueAccessorKey_maxdy, histogramInterval, mode, hullSensitivity)
	{
		var movement_histograms = [];
		var minX = 0;
		var maxX = movements.length;
		var minY = Infinity;
		var maxY = -Infinity;
		var maxNegativeLenght = Infinity;
		var maxPositiveLenght = -Infinity;
		var minValue = Infinity;
		var maxValue = -Infinity;
		var centerY = -Infinity;
		for (var coll = movements, length = coll.length, i = 0; i < length; ++i)
		{
			var branch = coll[i];

			let histogramRaw;
			let histogram;
			switch (mode)
			{
				case "probabilities":
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw.probabilities();
					break;
				case "effectiveness":
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw.probabilities().effectiveness();
					break;
				default:
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw;
					break;
			}
			movement_histograms[i] = histogram;
			minY = Math.min(minY, histogram.length);
			maxY = Math.max(maxY, histogram.length);
			maxNegativeLenght = Math.max(maxNegativeLenght, histogram.negative.length);
			maxPositiveLenght = Math.max(maxPositiveLenght, histogram.positive.length);
			minValue = Math.min(minValue, Math.min(...histogram.negative));
			maxValue = Math.max(maxValue, Math.max(...histogram.positive));
			centerY = 0;
		}

		minY = 0;
		for (var j = minY; j < maxY; ++j)
		{
			for (var coll = movement_histograms, length = coll.length, i = 0; i < length; ++i)
			{
				var viewX = i;
				var histogram = coll[i];
				var viewY = j + centerY - histogram.negative.length;
				var branch = histogram.toArray();
				var y = branch[j] || 0;

				var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
				lineMarker.modelX0 = viewX;
				lineMarker.modelY0 = viewY;
				lineMarker.modelX1 = viewX;
				//lineMarker.modelY1 = viewY + (y / (maxValue - minValue) < 0.1 ? 0.1 : y / (maxValue - minValue));
				lineMarker.modelY1 = viewY + y / (maxValue - minValue);
				lineMarker.lineStyle.color = j > histogram.negative.length ? "red" : "blue";
				lineMarker.lineStyle.width = 2;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);
			}
		}

		this._xAxis.dataRange.setBounds(minX, maxX);
		this._yAxis.dataRange.setBounds(-50, 50);
	}

	draw3(distances, movements, valueAccessorKey_y, valueAccessorKey_mindy, valueAccessorKey_maxdy, histogramInterval, mode, hullSensitivity)
	{
		var movement_histograms = [];
		var minX = 0;
		var maxX = movements.length;
		var minY = Infinity;
		var maxY = -Infinity;
		var maxNegativeLenght = Infinity;
		var maxPositiveLenght = -Infinity;
		var minValue = Infinity;
		var maxValue = -Infinity;
		var centerY = -Infinity;
		for (var coll = movements, length = coll.length, i = 0; i < length; ++i)
		{
			var branch = coll[i];

			let histogramRaw;
			let histogram;
			switch (mode)
			{
				case "probabilities":
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw.probabilities();
					break;
				case "effectiveness":
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw.probabilities().effectiveness();
					break;
				default:
					histogramRaw = new Histogram(histogramInterval, branch, valueAccessorKey_y);
					histogram = histogramRaw;
					break;
			}
			movement_histograms[i] = histogram;
			minY = Math.min(minY, histogram.length);
			maxY = Math.max(maxY, histogram.length);
			maxNegativeLenght = Math.max(maxNegativeLenght, histogram.negative.length);
			maxPositiveLenght = Math.max(maxPositiveLenght, histogram.positive.length);
			minValue = Math.min(minValue, Math.min(...histogram.negative));
			maxValue = Math.max(maxValue, Math.max(...histogram.positive));
			centerY = 0;
		}

		minY = 0;
		var minY_red = new Array(maxX).fill(Infinity);
		var maxY_red = new Array(maxX).fill(-Infinity);
		var minY_blue = new Array(maxX).fill(Infinity);
		var maxY_blue = new Array(maxX).fill(-Infinity);
		for (var j = minY; j < maxY; ++j)
		{
			for (var coll = movement_histograms, length = coll.length, i = 0; i < length; ++i)
			{
				var viewX = i;
				var histogram = coll[i];
				var viewY = j + centerY - histogram.negative.length;
				var branch = histogram.toArray();
				var y = branch[j] || 0;

				var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
				lineMarker.modelX0 = viewX;
				lineMarker.modelY0 = viewY;
				lineMarker.modelX1 = viewX;
				//lineMarker.modelY1 = viewY + (y / (maxValue - minValue) < 0.1 ? 0.1 : y / (maxValue - minValue));
				lineMarker.modelY1 = viewY + y / (maxValue - minValue);
				lineMarker.lineStyle.color = j > histogram.negative.length ? "red" : "blue";
				lineMarker.lineStyle.width = 2;
				this._chartVisual.scene.markers.add(lineMarker);
				ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

				if (j > histogram.negative.length)
				{
					if (Math.abs(y) < histogram.count * hullSensitivity) continue;
					minY_red[viewX] = Math.min(minY_red[viewX], viewY);
					maxY_red[viewX] = Math.max(maxY_red[viewX], viewY + y / (maxValue - minValue));
				}
				else if (j < histogram.negative.length)
				{
					if (Math.abs(y) < histogram.count * hullSensitivity) continue;
					minY_blue[viewX] = Math.min(minY_blue[viewX], viewY);
					maxY_blue[viewX] = Math.max(maxY_blue[viewX], viewY + y / (maxValue - minValue));
				}
			}
		}

		var middlePoints_red = [];
		for (var length = minY_red.length, i = 0; i < length; ++i)
		{
			var pointMarker1 = new ChartPointMarker(newLUID(), this._xAxis, this._yAxis, true);
			pointMarker1.modelX = i;
			pointMarker1.modelY = minY_red[i];
			pointMarker1.opacity = 0.5;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "red";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);

			var pointMarker1 = new ChartPointMarker(newLUID(), this._xAxis, this._yAxis, true);
			pointMarker1.modelX = i;
			pointMarker1.modelY = maxY_red[i];
			pointMarker1.opacity = 0.5;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "red";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);

			if (maxY_red[i] != -Infinity && minY_red[i] != Infinity) middlePoints_red.push({ x: i, y: (maxY_red[i] + minY_red[i]) / 2 });
		}
		var trendLine_red = LinearFunction.buildLineOfBestFit(middlePoints_red);
		var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
		lineMarker.modelX0 = minX;
		lineMarker.modelY0 = trendLine_red.calc(minX);
		lineMarker.modelX1 = maxX;
		lineMarker.modelY1 = trendLine_red.calc(maxX);
		lineMarker.lineStyle.color = "red";
		lineMarker.lineStyle.width = 0.5;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		var middlePoints_blue = [];
		for (var length = minY_blue.length, i = 0; i < length; ++i)
		{
			var pointMarker1 = new ChartPointMarker(newLUID(), this._xAxis, this._yAxis, true);
			pointMarker1.modelX = i;
			pointMarker1.modelY = minY_blue[i];
			pointMarker1.opacity = 0.5;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "blue";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);

			var pointMarker1 = new ChartPointMarker(newLUID(), this._xAxis, this._yAxis, true);
			pointMarker1.modelX = i;
			pointMarker1.modelY = maxY_blue[i];
			pointMarker1.opacity = 0.5;
			pointMarker1.color = "white";
			pointMarker1.lineStyle.color = "blue";
			pointMarker1.lineStyle.width = 0.5;
			pointMarker1.size = 3;
			this._chartVisual.scene.markers.add(pointMarker1);
			ChartStyleSheet.defaultSceneStyle.applyToLine(pointMarker1);

			if (maxY_blue[i] != -Infinity && minY_blue[i] != Infinity) middlePoints_blue.push({ x: i, y: (maxY_blue[i] + minY_blue[i]) / 2 });
		}
		var trendLine_red = LinearFunction.buildLineOfBestFit(middlePoints_blue);
		var lineMarker = new ChartLineMarker(newLUID(), this._xAxis, this._yAxis, true);
		lineMarker.modelX0 = minX;
		lineMarker.modelY0 = trendLine_red.calc(minX);
		lineMarker.modelX1 = maxX;
		lineMarker.modelY1 = trendLine_red.calc(maxX);
		lineMarker.lineStyle.color = "blue";
		lineMarker.lineStyle.width = 0.5;
		this._chartVisual.scene.markers.add(lineMarker);
		ChartStyleSheet.defaultSceneStyle.applyToLine(lineMarker);

		this._xAxis.dataRange.setBounds(minX, maxX);
		this._yAxis.dataRange.setBounds(-50, 50);
	}
}
