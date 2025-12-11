"use strict";

include("StdAfx.js");

include("forex/ForexAfx.js");

include("MainChartUserControl.js");
include("ForexAccountUserControl.js");
include("SimulationChartUserControl.js");
include("TransformExplorerChartUserControl.js");

include("app.css");
include("app.layout.css");

class App
{
	constructor()
	{
		this.isDebugMode = window.appConfig.isDebugMode;
		this.client = new DionClient({ serverUrl: "" });
		this.db = new ForexDataBase({ sync: new Sync("db"), client: this.client });

		this._tabControl = null;

		this._navigationPanel = null;
		this._mainViewButton = null;
		this._sdTransformExplorerButton = null;
		this._channelExplorerButton = null;	

		this._mainPanel = null;
		this._sdTransformExplorerPanel = null;
		this._channelExplorerPanel = null;
		this._multiView = null;

		this._mainChartUserControl = null;
		this._simulationChartUserControl = null;
		this._sdTransformExplorerUserControl = null;
	}

	async run()
	{
		try
		{
			//	at some point generalize the following code
			//		- merge with the ui library
			//		- also add selection capability to this mechanism
			var allowedScrollTargetRoles = ["listView"];
			function testAncestorChain(element)
			{
				var currentElement = element;
				while (currentElement && currentElement.getAttribute)
				{
					var elementRole = currentElement.getAttribute("rl");
					if (allowedScrollTargetRoles.indexOf(elementRole) != -1)
					{
						return true;
					}
					currentElement = currentElement.parentElement;
				}
				return false;
			}

			document.body.addEventListener("wheel", function (event) { if (!testAncestorChain(event.target)) event.preventDefault(); }, { passive: false });
			document.addEventListener("wheel", function (event) { if (!testAncestorChain(event.target)) event.preventDefault(); }, { passive: false });

			await this._loadAllDocumentTemplateLinks();
			await this.client.loadCommands();

		}
		catch (ex)
		{
			console.error(377001, ex);
		}

		try
		{
			await this._initializeControls();
		}
		catch (ex)
		{
			console.error(377002, ex);
		}
	}

	async _loadAllDocumentTemplateLinks()
	{
		return new Promise(function (resolve, reject)
		{
			return XhtmlTemplate.loadAllDocumentTemplateLinks(function (err, result)
			{
				if (err) return reject(err);
				return resolve(result);
			});
		});
	}

	async _initializeControls()
	{
		this._tabControl = new TabControl("plain", "mainTabControl", "mainTabControl");
		this._tabControl.render(document.getElementById("root"));
		this._tabControl.tabPages.add(
		{
			key: "mainView",
			title: "Main",
			render: async function (hostElement)
			{
				await this._render_mainPanel(hostElement);
			}.bind(this),
		});
		this._tabControl.tabPages.add(
		{
			key: "sdTransformExplorer",
			title: "SD Transform Explorer",
			render: async function (hostElement)
			{
				await this._render_sdTransformExplorerPanel(hostElement);
			}.bind(this),
		});
		this._tabControl.tabPages.add(
		{
			key: "channelExplorer",
			title: "Channel Explorer",
			render: async function (hostElement)
			{
				await this._render_channelExplorer(hostElement);
			}.bind(this),
		});
		this._tabControl.selectedTabPageKey = "mainView";
		//this._tabControl.selectedTabPageKey = "sdTransformExplorer";
		this._tabControl.refresh();
	}

	async _render_mainPanel(hostElement)
	{
		if (!app.client.ready)
		{
			this._mainPanel.backplane.innerHTML = "<div style='border: solid 2px red; background: white; color: darkred; padding: 10px; margin: 10px;'>No connection to server.</div>";
			return;
		}

		//	main chart
		this._mainChartUserControl = new MainChartUserControl("mainChartUserControl");
		this._mainChartUserControl.render(hostElement);
		this._mainChartUserControl.selectionChange.add(async function (sender, args)
		{
			var sampleIntervalDef = await app.db.selectSampleInterval(

				this._simulationChartUserControl.xAxis.dataRange.min,
				this._simulationChartUserControl.xAxis.dataRange.max,
				this._simulationChartUserControl.xAxis.scaleInfoCache.sceneLengthDeflated,
				this._simulationChartUserControl.tickDataThreshold
			);
			await this._simulationChartUserControl.setTimeRange(

				args.authorative.min,
				args.authorative.max,
				args.authorative.start,
				sampleIntervalDef
			);
			this._simulationChartUserControl.setValueRange(args.adaptive.min, args.adaptive.max);
			this._simulationChartUserControl.refresh();
		}.bind(this));
		await this._mainChartUserControl.initializeChartBounds(

			//1300697373895,
			//1300718493692

			// several hours
			//1300654987226,
			//1300676107023

			// several hours 2
			//1300673477972,
			//1300694597769

			//	thursday 12:00-18:00
			//1300967937931,
			//1300989600000

			//	week
			//1300024861950, 1300546203466

			//	3 h
			//1300100610169, 1300112129172

			//	2 h / 5 sec sample interval
			//1300116048054, 1300121959124

			//	8 min / 5 sec sample interval
			//1300116253263, 1300116704145

			//	10 min / 5 sec sample interval, channel <<<
			//1300116698908, 1300117299032

			//	day
			//1300089600000, 1300133343396

			//	weeks - good performance
			//1299260000971, 1300275948098

			//	weeks - modern
			//1553296366685, 1554312313812

			//	17 min / 5 sec sample interval - modern
			1553078964763, 1553079965189

			//	zoom-out
			//1299906110696, 1301642965245

			//	a day
			//1300653381690,
			//1300732540717

		);
		this._mainChartUserControl.initializeSimulationStartIndicator();
		this._mainChartUserControl.refresh();

		//	simulation chart
		this._simulationChartUserControl = new SimulationChartUserControl("simulationChartUserControl");
		this._simulationChartUserControl.render(hostElement);
		var sampleIntervalDef = await app.db.selectSampleInterval(

			this._mainChartUserControl.xAxis.dataRange.min,
			this._mainChartUserControl.xAxis.dataRange.max,
			this._mainChartUserControl.xAxis.scaleInfoCache.sceneLengthDeflated,
			this._mainChartUserControl.tickDataThreshold
		);
		await this._simulationChartUserControl.setTimeRange(

			this._mainChartUserControl.xAxis.dataRange.min,
			this._mainChartUserControl.xAxis.dataRange.max,
			this._mainChartUserControl.xAxis.dataRange.min,
			sampleIntervalDef
		);
		this._simulationChartUserControl.setValueRange(

			this._mainChartUserControl.yAxis.dataRange.min,
			this._mainChartUserControl.yAxis.dataRange.max,
		);
		this._simulationChartUserControl.simulationStateChange.add(function (sender, args)
		{
			this._mainChartUserControl.enabled = !args.isRunningSimulation;
			this._mainChartUserControl.refresh();
		}.bind(this));
		await this._simulationChartUserControl.initializeChartBounds(

			this._mainChartUserControl.xAxis.dataRange.min,
			this._mainChartUserControl.xAxis.dataRange.max,
		);
		this._simulationChartUserControl.refresh();
	}

	async _render_sdTransformExplorerPanel(hostElement)
	{
		this._sdTransformExplorerUserControl = new TransformExplorerChartUserControl("sdTransformExplorerUserControl");
		this._sdTransformExplorerUserControl.render(hostElement);
		this._sdTransformExplorerUserControl.refresh();
	}

	async _render_channelExplorer(hostElement)
	{
		var sliderControl = new Slider("horizontal", "slider1", "slider1");
		sliderControl.render(hostElement);
		//sliderControl.state = SliderVisual.State.Edit;
		sliderControl.state = SliderVisual.State.Up;
		sliderControl.min = 0;
		sliderControl.max = 1;
		sliderControl.decimalPlaces = 3;
		sliderControl.value = 0.333;
		sliderControl.refresh();
		sliderControl.valueChange.add(function (sender, args) { log(555, args) });
	}
}
