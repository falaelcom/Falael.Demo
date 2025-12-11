"use strict";

include("StdAfx.js");

include("framework/ui/chart/EChartDeviceType.js");
include("framework/ui/chart/EChartAxisPosition.js");
include("framework/ui/chart/EChartTickType.js");
include("framework/ui/chart/EChartDataType.js");
include("framework/ui/chart/EChartHAlign.js");
include("framework/ui/chart/EChartVAlign.js");
include("framework/ui/chart/EChartAxisRole.js");

include("framework/ui/chart/ChartPersistentStorage.js");

include("framework/ui/chart/ChartAspectedCache.js");
include("framework/ui/chart/ChartAspectRegistry.js");
include("framework/ui/chart/ChartNode.js");
include("framework/ui/chart/ChartElement.js");
include("framework/ui/chart/ChartStyleSheet.js");
include("framework/ui/chart/ChartLabelStyle.js");
include("framework/ui/chart/ChartLineStyle.js");

include("framework/ui/chart/ChartDataRange.js");
include("framework/ui/chart/ChartDataSource.js");
include("framework/ui/chart/ChartDataSource_Buffer.js");

include("framework/ui/chart/ChartAxis.js");
include("framework/ui/chart/ChartNumericAxis.js");
include("framework/ui/chart/ChartDateTimeAxis.js");
include("framework/ui/chart/ChartBackplane.js");
include("framework/ui/chart/ChartSeries.js");
include("framework/ui/chart/ChartDataSeries.js");
include("framework/ui/chart/series/ChartLineSeries.js");
include("framework/ui/chart/series/ChartAreaSeries.js");
include("framework/ui/chart/series/ChartHeatMapSeries.js");
include("framework/ui/chart/ChartScene.js");

include("framework/ui/chart/ChartOverlay.js");

//	overlay indicators
include("framework/ui/chart/indicators/ChartLineIndicator.js");
include("framework/ui/chart/indicators/ChartLabelIndicator.js");
include("framework/ui/chart/indicators/ChartAxisLineIndicator.js");
include("framework/ui/chart/indicators/ChartAxisLabelIndicator.js");
include("framework/ui/chart/indicators/ChartAxisRangeIndicator.js");
include("framework/ui/chart/indicators/ChartHorizontalRangeIndicator.js");
//	scene indicators
include("framework/ui/chart/indicators/EChartRange2DIndicatorState.js");
include("framework/ui/chart/indicators/ChartRange2DIndicator.js");

include("framework/ui/chart/markers/ChartChannelZoneMarker.js");
include("framework/ui/chart/markers/ChartLinearZoneMarker.js");
include("framework/ui/chart/markers/ChartLineMarker.js");
include("framework/ui/chart/markers/ChartPointMarker.js");

include("framework/ui/chart/behaviors/ChartIndicatorsBehavior.js");
include("framework/ui/chart/behaviors/ChartAxisPanZoomBehavior.js");
include("framework/ui/chart/behaviors/ChartPanZoomBehavior.js");
include("framework/ui/chart/behaviors/ChartRangeCudBehavior.js");
include("framework/ui/chart/behaviors/ChartKeyboardBehavior.js");
include("framework/ui/chart/behaviors/ChartHorizontalRangeSelectBehavior.js");

include("framework/ui/chart/controllers/ChartHorizontalPanZoomController.js");
include("framework/ui/chart/controllers/ChartIndicatorsController.js");

//	visualizers
include("framework/ui/chart/visualizers/ChartMovementHistogramVisualizer.js");

//	width, height - optional
class ChartVisual extends Control
{
	//	deviceType: EChartDeviceType
	constructor(id, deviceType, width, height)
	{
		super(id);

		this._deviceType = deviceType;
		this._width = width;
		this._height = height;

		this._sceneDevice = null;
		this._sceneGraphics = null;
		this._overlayDevice = null;
		this._overlayGraphics = null;
		this._hitTestMap = [];

		this._scene = new ChartScene("scene", "scene");
		this._aspectedCache_scene = new ChartAspectedCache();
		this._aspectedCache_scene_hitTest = new ChartAspectedCache();

		this._overlay = new ChartOverlay("overlay", "overlay");
		this._aspectedCache_overlay = new ChartAspectedCache();
		this._aspectedCache_overlay_hitTest = new ChartAspectedCache();

		this._drawOps = [];

		this._debug_sceneRenderTime = -1;
		this._debug_overlayRenderTime = -1;
		this._debug_infoAvailable = new MulticastDelegate();
		this._debug_items = [];
		this._debug_primitives = [];
		this._debug_drawOps = [];
	}


	__render(hostElement)
	{
		this._sceneDevice = new Two(
		{
			type: Two.Types[EChartDeviceType.toTwojsName(this._deviceType)],
			width: this._width || hostElement.offsetWidth,
			height: this._height || hostElement.offsetHeight,
			autostart: false,
		}).appendTo(hostElement);
		this._sceneDevice.renderer.domElement.onselectstart = function () { return false; };

		this._overlayDevice = new Two(
		{
			type: Two.Types[EChartDeviceType.toTwojsName(this._deviceType)],
			width: this._width || hostElement.offsetWidth,
			height: this._height || hostElement.offsetHeight,
			autostart: false,
		}).appendTo(hostElement);
		this._overlayDevice.renderer.domElement.onselectstart = function () { return false; };
		
		var backplaneElement = this._overlayDevice.renderer.domElement;
		backplaneElement.style.marginTop = String(-(this._height || hostElement.offsetHeight)) + "px";
		backplaneElement.id = newLUID();
		backplaneElement.setAttribute("rl", "chart");

		this._sceneGraphics = new TwoGraphicsDevice(this._sceneDevice);
		this._overlayGraphics = new TwoGraphicsDevice(this._overlayDevice);

		return {
			backplane: backplaneElement,
		};
	}

	__refresh()
	{
		//	refresh scene
		var renderPlan =
		{
			renderInfos: [],
			hitTestInfos: [],
			visited: {},
		};
		var start = new Date();
		this._scene.performLayout({ x: 0, y: 0, width: this._sceneDevice.width, height: this._sceneDevice.height });
		this._scene.buildRenderPlan(renderPlan);
		var end = new Date();
		this._runSceneRenderPlan(renderPlan, ChartVisual._buildSceneToDeviceTransform(this._sceneDevice.height), end.getTime() - start.getTime());

		//	refresh overlay
		var renderPlan =
		{
			renderInfos: [],
			hitTestInfos: [],
			visited: {},
		};
		var start = new Date();
		this._overlay.performLayout({ x: 0, y: 0, width: this._sceneDevice.width, height: this._sceneDevice.height });
		this._overlay.buildRenderPlan(renderPlan);
		var end = new Date();
		this._runOverlayRenderPlan(renderPlan, ChartVisual._buildSceneToDeviceTransform(this._sceneDevice.height), end.getTime() - start.getTime());

		this.onDebug_infoAvailable();
	}

	__applyControlStyles()
	{
		super.__applyControlStyles();

		this._sceneDevice.renderer.domElement.style.display = this.visible ? "" : "none";
	}


	_runSceneRenderPlan(renderPlan, sceneToDevice, buildPlanTime)
	{
		var drawPixel = function (xx, yy, color)
		{
			var op = (function ()
			{
				var quitckFixRatio = this._sceneDevice.renderer.domElement.height / this._sceneDevice.renderer.height;
				var x = Math.round(xx * quitckFixRatio);
				var y = Math.round(yy * quitckFixRatio);
				var r = color.r;
				var g = color.g;
				var b = color.b;
				var a = color.a;
				var alpha = a / 255;
				if (alpha == 0) return null;

				return function (pixelData)
				{
					if (x >= pixelData.width || x < 0)
					{
						return;
					}
					if (y >= pixelData.height || y < 0)
					{
						return;
					}

					var y2 = pixelData.height - y;

					var index1 = (x + y2 * pixelData.width) * 4;
					var index2 = index1 + 1;
					var index3 = index2 + 1;
					var index4 = index3 + 1;
					pixelData.data[index1] = Math.round(r * alpha + pixelData.data[index1] * (1 - alpha));
					pixelData.data[index2] = Math.round(g * alpha + pixelData.data[index2] * (1 - alpha));
					pixelData.data[index3] = Math.round(b * alpha + pixelData.data[index4] * (1 - alpha));
					pixelData.data[index4] = 255;
				};
			}.bind(this))();

			if (op) this._drawOps.push(op);
		}.bind(this);
		var drawOpsFlush = function ()
		{
			var quitckFixRatio = this._sceneDevice.renderer.domElement.height / this._sceneDevice.renderer.height;
			var canvas = this._sceneDevice.renderer.domElement;
			var context2d = canvas.getContext("2d");
			var pixelData = context2d.getImageData(

				Math.round(this.scene.backplane.boundingRect.x * quitckFixRatio),
				Math.round(this.scene.backplane.boundingRect.height * quitckFixRatio) - Math.round(this.sceneToDevice(this.scene.backplane.boundingRect.y) * quitckFixRatio),
				Math.round(this.scene.backplane.boundingRect.width * quitckFixRatio),
				Math.round(this.scene.backplane.boundingRect.height * quitckFixRatio)
			);
			for (var length = this._drawOps.length, i = 0; i < length; ++i) this._drawOps[i](pixelData);
			context2d.putImageData(pixelData, Math.round(this.scene.backplane.boundingRect.x * quitckFixRatio), Math.round(this.scene.backplane.boundingRect.height * quitckFixRatio) - Math.round(this.sceneToDevice(this.scene.backplane.boundingRect.y) * quitckFixRatio));
		}.bind(this);

		var start = new Date();
		var requireDeviceUpdate = false;

		//	remove orphaned hit test infos
		var aspectRegistry_hitTest = new ChartAspectRegistry();
		for (var length = renderPlan.hitTestInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.hitTestInfos[i];
			aspectRegistry_hitTest.registerAspects(item.source.path, item.aspects);
		}
		var hitTestInfos = this._aspectedCache_scene_hitTest.commit(renderPlan.visited, aspectRegistry_hitTest);
		for (var length = hitTestInfos.length, i = 0; i < length; ++i)
		{
			var item = hitTestInfos[i];
			var foundAt = this._hitTestMap.indexOf(item);
			if (foundAt == -1) throw "Invalid operation.";
			this._hitTestMap.splice(foundAt, 1);
		}

		//	add newly provided hit test infos
		for (var length = renderPlan.hitTestInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.hitTestInfos[i];
			if (item.hitTestInfo == "$clearAspects") continue;
			if (!item.aspects) continue;
			this._hitTestMap.push(item.hitTestInfo);
			this._aspectedCache_scene_hitTest.add(item.source.path, item.aspects, item.hitTestInfo);
		}

		//	remove orphaned primitives from the device scene
		var aspectRegistry = new ChartAspectRegistry();
		for (var length = renderPlan.renderInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.renderInfos[i];
			if (!item.aspects) continue;
			aspectRegistry.registerAspects(item.source.path, item.aspects);
		}
		var primitives = this._aspectedCache_scene.commit(renderPlan.visited, aspectRegistry);
		for (var length = primitives.length, i = 0; i < length; ++i)
		{
			var p = primitives[i];
			if (this._debug_primitives.length && this._debug_isDebugPrimitive(p)) continue;
			this._sceneDevice.scene.remove(p);
			requireDeviceUpdate = true;
		}

		//	add newly provided primitives to the device scene
		this._sceneGraphics.setSceneToDevice(sceneToDevice);
		for (var length = renderPlan.renderInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.renderInfos[i];
			switch (item.primitive)
			{
				case "$clearAspects":
					requireDeviceUpdate = true;
					break;
				case "background":
					var p = this._sceneGraphics.addRectangle(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "axis":
					var p = this._sceneGraphics.addLine(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "tick":
					var p = this._sceneGraphics.addLine(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "label":
					var p = this._sceneGraphics.addText(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "lineChart":
					if (!item.vertexGroups.length)
					{
						break;
					}
					var c = this._sceneGraphics.addClippingRectangle(item.source.boundingRect);
					this._aspectedCache_scene.add(item.source.path, item.aspects, c);
					for (var jlength = item.vertexGroups.length, j = 0; j < jlength; ++j)
					{
						var vertices = item.vertexGroups[j];
						if (!vertices.length) continue;
						var p = this._sceneGraphics.addLinePath(
						{
							vertices: vertices,
							source: item.source,
							lineStyle: item.lineStyle,
						}, c);
						this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					}
					requireDeviceUpdate = true;
					break;
				case "areaChart":
					if (!item.vertexGroups.length)
					{
						break;
					}
					var c = this._sceneGraphics.addClippingRectangle(item.source.boundingRect);
					this._aspectedCache_scene.add(item.source.path, item.aspects, c);
					for (var jlength = item.vertexGroups.length, j = 0; j < jlength; ++j)
					{
						var vertices = item.vertexGroups[j];
						if (!vertices.length) continue;
						var p = this._sceneGraphics.addArea(
						{
							vertices: vertices,
							source: item.source,
							style: item.style,
							opacity: item.opacity,
						}, c);
						this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					}
					requireDeviceUpdate = true;
					break;
				case "markerLine":
					if (item.x < this.scene.backplane.boundingRect.x || item.x > this.scene.backplane.boundingRect.x + this.scene.backplane.boundingRect.width)
					{
						break;
					}

					var c = this._sceneGraphics.addClippingRectangle(this.scene.backplane.boundingRect);
					this._aspectedCache_scene.add(item.source.path, item.aspects, c);
					var p = this._sceneGraphics.addLine(item, c);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "vGridLine":
				case "hGridLine":
					//var p = this._sceneGraphics.addLine(item, c);
					var p = this._sceneGraphics.addLine(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "range2d":
					var p = this._sceneGraphics.addRectangle(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "linearZone":
					var c = this._sceneGraphics.addClippingRectangle(this.scene.backplane.boundingRect);
					this._aspectedCache_scene.add(item.source.path, item.aspects, c);
					var p = this._sceneGraphics.addSpreadLine(item, c);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "line":
					var c = this._sceneGraphics.addClippingRectangle(this.scene.backplane.boundingRect);
					this._aspectedCache_scene.add(item.source.path, item.aspects, c);
					var p = this._sceneGraphics.addLine(item, c);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "point":
					//var p = this._sceneGraphics.addTriangleFigure(item);
					var p = this._sceneGraphics.addCircleFigure(item);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "channel":
					var c = this._sceneGraphics.addClippingRectangle(this.scene.backplane.boundingRect);
					this._aspectedCache_scene.add(item.source.path, item.aspects, c);

					var areaVertices = [];
					areaVertices.push( //	top left
					{
						sceneX: item.resistanceLine_sceneLowerX,
						sceneY: item.resistanceLine_sceneLowerY,
					});
					areaVertices.push( //	top right
					{
						sceneX: item.resistanceLine_sceneUpperX,
						sceneY: item.resistanceLine_sceneUpperY,
					});
					areaVertices.push( //	bottom right
					{
						sceneX: item.supportLine_sceneUpperX,
						sceneY: item.supportLine_sceneUpperY,
					});
					areaVertices.push( //	bottom left
					{
						sceneX: item.supportLine_sceneLowerX,
						sceneY: item.supportLine_sceneLowerY,
					});

					var p = this._sceneGraphics.addArea(
					{
						vertices: areaVertices,
						source: { zIndex: item.zIndex },
						style: item.style,
						opacity: item.opacity,
					}, c);
					this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					//var p = this._sceneGraphics.addSpreadLine(item, c);
					//this._aspectedCache_scene.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "pixelGrid":
					//	item.dotSize
					//	item.gridSpacing
					//	item.getColor = function(modelX, modelX), returns {r, g, b, a}
					//	item.xAxis
					//	item.yAxis
					//	item.isValid

					if (item.isValid) break;

					this._drawOps = [];
					var dotCenterOffset = (item.dotSize - 1) / 2;
					for (var x = 0; x < this.scene.backplane.boundingRect.width; x += item.gridSpacing)
						for (var y = 0; y < this.scene.backplane.boundingRect.height; y += item.gridSpacing)
						{
							for (var ix = 0, ixlength = item.dotSize; ix < ixlength; ++ix)
								for (var iy = 0, iylength = item.dotSize; iy < iylength; ++iy)
								{
									var pixelModelX = item.xAxis.sceneToModel(Math.round(this.scene.backplane.boundingRect.x + x + ix - dotCenterOffset));
									var pixelModelY = item.yAxis.sceneToModel(Math.round(this.scene.backplane.boundingRect.y + y + iy - dotCenterOffset));
									var color = item.getColor(pixelModelX, pixelModelY);
									if (!color) continue;
									drawPixel(x + ix - dotCenterOffset, y + iy - dotCenterOffset, color);
								}
						}
					
					requireDeviceUpdate = true;
					break;
				default:
					throw "Not implemented.";
			}
		}

		if (this._debug_items.length || this._debug_drawOps.length) log("CHART SCENE DEBUG RENDER IS ACTIVE: " + this.id);
		if (requireDeviceUpdate || this._debug_items.length || this._debug_drawOps.length)
		{
			this.debug_refresh();
			this._sceneDevice.scene.children.sort(function (left, right) { return right.zIndex - left.zIndex; });
			this._sceneDevice.update();
			if (this._debug_drawOps.length) this.debug_sceneRaw_flush();
			if (this._drawOps.length) drawOpsFlush();
			var end = new Date();
			this._debug_sceneRenderTime = end.getTime() - start.getTime() + buildPlanTime;
		}
	}

	_runOverlayRenderPlan(renderPlan, sceneToDevice, buildPlanTime)
	{
		var start = new Date();
		var requireDeviceUpdate = false;

		//	remove orphaned hit test infos
		var aspectRegistry_hitTest = new ChartAspectRegistry();
		for (var length = renderPlan.hitTestInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.hitTestInfos[i];
			aspectRegistry_hitTest.registerAspects(item.source.path, item.aspects);
		}
		var hitTestInfos = this._aspectedCache_overlay_hitTest.commit(renderPlan.visited, aspectRegistry_hitTest);
		for (var length = hitTestInfos.length, i = 0; i < length; ++i)
		{
			var item = hitTestInfos[i];
			var foundAt = this._hitTestMap.indexOf(item);
			if (foundAt == -1) throw "Invalid operation.";
			this._hitTestMap.splice(foundAt, 1);
		}

		//	add newly provided hit test infos
		for (var length = renderPlan.hitTestInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.hitTestInfos[i];
			this._hitTestMap.push(item.hitTestInfo);
			this._aspectedCache_overlay_hitTest.add(item.source.path, item.aspects, item.hitTestInfo);
		}


		//	remove orphaned primitives from the device scene
		var aspectRegistry = new ChartAspectRegistry();
		for (var length = renderPlan.renderInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.renderInfos[i];
			aspectRegistry.registerAspects(item.source.path, item.aspects);
		}
		var primitives = this._aspectedCache_overlay.commit(renderPlan.visited, aspectRegistry);
		for (var length = primitives.length, i = 0; i < length; ++i)
		{
			this._overlayDevice.scene.remove(primitives[i]);
			requireDeviceUpdate = true;
		}

		//	add newly provided primitives to the device scene
		this._overlayGraphics.setSceneToDevice(sceneToDevice);
		for (var length = renderPlan.renderInfos.length, i = 0; i < length; ++i)
		{
			var item = renderPlan.renderInfos[i];
			switch (item.primitive)
			{
				case "$clearAspects":
					requireDeviceUpdate = true;
					break;
				case "axisIndicatorLine":
					var p = this._overlayGraphics.addLine(item);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "indicatorLine":
					var c = this._overlayGraphics.addClippingRectangle(this.scene.backplane.boundingRect);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, c);
					var p = this._overlayGraphics.addLine(item, c);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "labelBackplane":
					var p = this._overlayGraphics.addRectangle(item);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "labelText":
					var p = this._overlayGraphics.addText(item);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "axisRange":
					var p = this._overlayGraphics.addRectangle(item);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				case "horizontalRange":
					var c = this._overlayGraphics.addClippingRectangle(this.scene.backplane.boundingRect);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, c);
					var p = this._overlayGraphics.addRectangle(item, c);
					this._aspectedCache_overlay.add(item.source.path, item.aspects, p);
					requireDeviceUpdate = true;
					break;
				default:
					throw "Not implemented.";
			}
		}

		if (requireDeviceUpdate)
		{
			this._overlayDevice.scene.children.sort(function (left, right) { return right.zIndex - left.zIndex; });
			this._overlayDevice.update();
			var end = new Date();
			this._debug_overlayRenderTime = end.getTime() - start.getTime() + buildPlanTime;
		}
	}


	_debug_isDebugPrimitive(p)
	{
		for (var length = this._debug_primitives.length, i = 0; i < length; ++i) if (this._debug_primitives[i] == p) return true;
		return false;
	}

	onDebug_infoAvailable()
	{
		this._debug_infoAvailable.execute(this, {});
	}


	debug_draw(item, _redraw)
	{
		if (!_redraw) this._debug_items.push(item);
		switch (item.primitive)
		{
			case "circle":
				if (item.modelX !== void (0)) item.x = this.debug_xAxis.modelToScene(item.modelX);
				if (item.modelY !== void (0)) item.y = this.debug_yAxis.modelToScene(item.modelY);
				var p = this._sceneGraphics.addCircleFigure(item);
				this._debug_primitives.push(p);
				break;
			case "triangle":
				if (item.modelX !== void (0)) item.x = this.debug_xAxis.modelToScene(item.modelX);
				if (item.modelY !== void (0)) item.y = this.debug_yAxis.modelToScene(item.modelY);
				var p = this._sceneGraphics.addTriangleFigure(item);
				this._debug_primitives.push(p);
				break;
			case "line":
				if (item.modelX0 !== void (0)) item.x = this.debug_xAxis.modelToScene(item.modelX0);
				if (item.modelY0 !== void (0)) item.y = this.debug_yAxis.modelToScene(item.modelY0);
				if (item.modelX1 !== void (0)) item.width = this.debug_xAxis.modelToScene(item.modelX1) - item.x;
				if (item.modelY1 !== void (0)) item.height = this.debug_yAxis.modelToScene(item.modelY1) - item.y;
				var p = this._sceneGraphics.addLine(item);
				this._debug_primitives.push(p);
				break;
			default:
				throw "Not implemented.";
		}
	}

	debug_clear()
	{
		for (var length = this._debug_primitives.length, i = 0; i < length; ++i) this._sceneDevice.scene.remove(this._debug_primitives[i]);
		this._debug_items = [];
		this._debug_primitives = [];
	}

	debug_refresh()
	{
		for (var length = this._debug_primitives.length, i = 0; i < length; ++i) this._sceneDevice.scene.remove(this._debug_primitives[i]);
		this._debug_primitives = [];
		for (var length = this._debug_items.length, i = 0; i < length; ++i) this.debug_draw(this._debug_items[i], true);
	}


	debug_sceneRaw_getSize()
	{
		return { width: this._sceneDevice.renderer.domElement.width, height: this._sceneDevice.renderer.domElement.height };
	}

	debug_sceneRaw_drawPixel(xx, yy, rr, gg, bb, aa)
	{
		var op = (function ()
		{
			var quitckFixRatio = this._sceneDevice.renderer.domElement.height / this._sceneDevice.renderer.height;
			var x = Math.round(xx * quitckFixRatio);
			var y = Math.round(this.sceneToDevice(yy) * quitckFixRatio);
			var r = rr;
			var g = gg;
			var b = bb;
			var a = aa;
			var alpha = a / 255;
			if (alpha == 0) return null;

			return function (pixelData)
			{
				if (x >= pixelData.width || x < 0)
				{
					return;
				}
				if (y >= pixelData.height || y < 0)
				{
					return;
				}

				var index1 = (x + y * pixelData.width) * 4;
				var index2 = index1 + 1;
				var index3 = index2 + 1;
				var index4 = index3 + 1;
				pixelData.data[index1] = Math.round(r * alpha + pixelData.data[index1] * (1 - alpha));
				pixelData.data[index2] = Math.round(g * alpha + pixelData.data[index2] * (1 - alpha));
				pixelData.data[index3] = Math.round(b * alpha + pixelData.data[index4] * (1 - alpha));
				pixelData.data[index4] = 255;
			};
		}.bind(this))();

		if (op) this._debug_drawOps.push(op);
	}

	debug_sceneRaw_clear()
	{
		this._debug_drawOps = [];
	}

	debug_sceneRaw_flush()
	{
		var canvas = this._sceneDevice.renderer.domElement;
		var context2d = canvas.getContext("2d");
		var pixelData = context2d.getImageData(0, 0, canvas.width, canvas.height);
		for (var length = this._debug_drawOps.length, i = 0; i < length; ++i) this._debug_drawOps[i](pixelData);
		context2d.putImageData(pixelData, 0, 0);
	}


	hitTest(deviceX, deviceY, accept)
	{
		var deviceToScene = ChartVisual._buildSceneToDeviceTransform(this._sceneDevice.height);
		var sceneX = deviceX;
		var sceneY = deviceToScene(deviceY);
		
		var matches = [];
		var coll = this._hitTestMap;
		for (var i = coll.length - 1; i >= 0; --i)
		{
			var item = coll[i];
			if (sceneX <= item.sceneX || sceneX > item.sceneX + item.sceneWidth)
			{
				continue;
			}
			if (sceneY <= item.sceneY || sceneY > item.sceneY + item.sceneHeight)
			{
				continue;
			}
			if (accept && !accept(item))
			{
				continue;
			}
			matches.push(item);
		}

		if (!matches.length)
		{
			return null;
		}
		var result =
		{
			sceneX: sceneX,
			sceneY: sceneY,
			deviceX: deviceX,
			deviceY: deviceY,
			items: matches,
		};
		return result;
	}

	sceneToDevice(sceneY)
	{
		var sceneToDevice = ChartVisual._buildSceneToDeviceTransform(this._sceneDevice.height);
		return sceneToDevice(sceneY);
	}

	deviceToScene(sceneY)
	{
		var sceneToDevice = ChartVisual._buildDeviceToSceneTransform(this._sceneDevice.height);
		return sceneToDevice(sceneY);
	}


	static _buildSceneToDeviceTransform(deviceLength)
	{
		return function (sx)
		{
			return deviceLength - sx;
		}
	}

	static _buildDeviceToSceneTransform(deviceLength)
	{
		return function (dx)
		{
			return deviceLength - dx;
		}
	}


	get deviceType()
	{
		return this._deviceType;
	}

	get scene()
	{
		return this._scene;
	}

	get overlay()
	{
		return this._overlay;
	}

	
	getDebug_sceneToModelRatio(axis)
	{
		return axis.scaleInfoCache.sceneToModel(1) - axis.scaleInfoCache.sceneToModel(0);
	}


	get debug_sceneRenderFps()
	{
		return Math.round(100000 / this._debug_sceneRenderTime) / 100;
	}

	get debug_overlayRenderFps()
	{
		return Math.round(100000 / this._debug_overlayRenderTime) / 100;
	}

	get debug_renderFps()
	{
		return Math.round(100000 / (this._debug_overlayRenderTime + this._debug_sceneRenderTime)) / 100;
	}


	get debug_infoAvailable()
	{
		return this._debug_infoAvailable;
	}
}
