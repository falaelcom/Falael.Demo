"use strict";

include("StdAfx.js");

class ForexRobotV5_ChannelChain_Factory
{
	constructor()
	{
	}

	static static_constructor()
	{
		this._template =
		{
			channelShaper:
			{
				priceSourcing: {
					enum: EPriceSourcingV5,
					values: [1, 2, 3],
					controlType: "checkboxList",
				},


				supportAndResistance_minChannelSpread: {
					min: 0.0001, max: 1000, resolution: 0.0001,
					controlType: "slider",
				},
				supportAndResistance_derangeThresholdFactor: {
					min: -1, max: 3, resolution: 0.001,
					controlType: "slider",
				},


				lineOfBestFit_variability_windowSize: {
					min: 3, max: 60, resolution: 1,
					controlType: "slider",
				},
				lineOfBestFit_spi1_variability_lowerThreshold: {
					min: 0.000001, max: 0.5, resolution: 0.000001,
					controlType: "slider",
				},
				lineOfBestFit_spi1_standardDeviation_thresholdFactor: {
					min: 0.0001, max: 3, resolution: 0.0001,
					controlType: "slider",
				},
				lineOfBestFit_deadZone_inertiaPointCount: {
					min: 0, max: 30, resolution: 1,
					controlType: "slider",
				},
				

				traderSNR_ZigZag:
				{
					SNR_ZigZag_trade_thresholdFactord: {
						min: -1, max: 1, resolution: 0.001,
						controlType: "slider",
					},
				},

				traderLBF:
				{
					LBF_tradeOpen_spreadThreshold: {
						min: 0, max: 0.0001, resolution: 0.0000001,
						controlType: "slider",
					},
					LBF_tradeOpen_ldNValue: {
						min: 0, max: 3 * 60 * 60 * 1000, resolution: 1,
						controlType: "slider",
					},
					LBF_tradeOpen_sdAngleThreshold: {
						min: 0, max: 1, resolution: 0.0001,
						controlType: "slider",
					},
					LBF_tradeOpen_sdyThresholdFactor: {
						min: -3, max: 3, resolution: 0.0001,
						controlType: "slider",
					},
					LBF_tradeClose_sdyThresholdFactor: {
						min: 0, max: 3, resolution: 0.0001,
						controlType: "slider",
					},
					LBF_tradeClose_sdTargetProfit: {
						min: 0, max: 3, resolution: 0.001,
						controlType: "slider",
					},
				},
			},
		};

		var i = -1;
		ForexRobotV5_ChannelChain_Factory.Offsets = {};
		ForexRobotV5_ChannelChain_Factory.Schema = {};

		function decimalCount(value)
		{
			var result = 0;
			while (value != Math.floor(value))
			{
				++result;
				value *= 10;
			}
			return result;
		}

		function applyTemplateLevel(root, path)
		{
			for (var key in root)
			{
				var value = root[key];
				var isLeaf = false;
				for (var jkey in value)
				{
					isLeaf = !Utility.Type.isObject(value[jkey]) || jkey == "enum";
					break;
				}
				var subPath = path.concat([key]);
				if (!isLeaf)
				{
					applyTemplateLevel(value, subPath);
					continue;
				}
				var name = subPath.join("_");
				++i;
				ForexRobotV5_ChannelChain_Factory.Offsets[name] = i;
				var leaf = Object.assign({ name: key, path: path, fullName: path.concat(key).join('_') }, value);
				if (value.enum)
				{
					if (!leaf.values)
					{
						leaf.values = [];
						for (var ekey in value.enum)
						{
							var evalue = value.enum[ekey];
							if (Utility.Type.isNumber(evalue)) leaf.values.push(evalue);
						}
					}
					leaf.resolution = 1;
					leaf.min = 0;
					leaf.max = leaf.values.length - 1;
				}
				leaf.decimalCount = decimalCount(leaf.resolution);
				ForexRobotV5_ChannelChain_Factory.Schema[name] = leaf;
			}
		}

		applyTemplateLevel(this._template, []);

		ForexRobotV5_ChannelChain_Factory.lastOffset = i;
		ForexRobotV5_ChannelChain_Factory._testSchemaIntegrity();
	}

	//	settings - fixed settings
	//		instrumentId
	//		pageSizeMs
	//		channelMode
	//		maxChannelDataPointCount
	//		minSignificantDataPointCount
	//		progress
	//	config - genetically mutable configuration
	createRobot(settings, config)
	{
		var channelShaperConfig = {};
		Object.assign(channelShaperConfig, config.channelShaper);
		Object.assign(channelShaperConfig, settings);	//	may overwrite some properties that came with config; may add some irrelevant properties
		var channelShaper = new ForexShaperV5_Channel(channelShaperConfig);

		var robotConfig = { channelShaper: channelShaper };
		Object.assign(robotConfig, settings);	//	may add some irrelevant properties
		var robot = new ForexRobotV5_ChannelChain(robotConfig);

		return robot;
	}

	createControl(elements, schemaItem, get, set)
	{
		switch (schemaItem.controlType)
		{
			case "checkboxList":
				{
					const reverseMap = [];
					for (var key in schemaItem.enum)
					{
						const value = schemaItem.enum[key];
						if (isNaN(value)) continue;
						var button = new Button("textButton", "csc_" + schemaItem.fullName + "_button");
						button.suspendRefresh();
						button.text = key;
						button.render(elements["csc_" + schemaItem.fullName + "_host"]);
						button.resumeRefresh();
						button.refresh();
						button.click.add(async function ()
						{
							if (get() == value) return;
							var currentButton = reverseMap[get()];
							currentButton.checkedState = ButtonVisual.CheckedState.Unchecked;
							currentButton = reverseMap[value];
							currentButton.checkedState = ButtonVisual.CheckedState.Checked;
							await set(value);
						}.bind(this));
						if (get() == value) button.checkedState = ButtonVisual.CheckedState.Checked;
						reverseMap[value] = button;
					}
				}
				break;
			case "slider":
				{
					function decimalCount(value)
					{
						var result = 0;
						while (value != Math.floor(value))
						{
							++result;
							value *= 10;
						}						
						return result;
					};

					var slider = new Slider("horizontal", "csc_" + schemaItem.fullName + "_slider", "csc_" + schemaItem.fullName + "_slider");
					slider.render(elements["csc_" + schemaItem.fullName + "_slider_host"]);
					slider.min = schemaItem.min;
					slider.max = schemaItem.max;
					slider.decimalPlaces = decimalCount(schemaItem.resolution);
					slider.value = get();
					slider.refresh();
					slider.valueChange.add(async function (sender, args)
					{
						if (get() == args.newValue) return;
						await set(args.newValue);
					}.bind(this));
				}
				break;
			default: throw "Not implemented.";
		}
	}


	static createRandomChromosome()
	{
		var result = new Array(ForexRobotV5_ChannelChain_Factory.lastOffset + 1);
		for (var key in ForexRobotV5_ChannelChain_Factory.Offsets)
		{
			var i = ForexRobotV5_ChannelChain_Factory.Offsets[key];
			var schema = ForexRobotV5_ChannelChain_Factory.Schema[key];
			var value;
			if (schema.values)
			{
				value = schema.values[Math.floor(Math.random() * schema.values.length)];
			}
			else
			{
				value = Math.random() * (schema.max - schema.min) + schema.min;
				var factor = Math.pow(10, schema.decimalCount);
				value = Math.round(value * factor) / factor;
			}
			result[i] = ForexRobotV5_ChannelChain_Factory.encodeAsInteger(value, schema);
		}
		return result;
	}

	static validateChromosome(array)
	{
		function get(schemaName) { return ForexRobotV5_ChannelChain_Factory.decodeFromInteger(array[ForexRobotV5_ChannelChain_Factory.Offsets[schemaName]], ForexRobotV5_ChannelChain_Factory.Schema[schemaName], true); }

		var root = {};
		for (var key in ForexRobotV5_ChannelChain_Factory.Schema)
		{
			var item = ForexRobotV5_ChannelChain_Factory.Schema[key];
			var parent = root;
			for (var length = item.path.length, i = 0; i < length; ++i)
			{
				var name = item.path[i];
				var obj = parent[name];
				if (!obj)
				{
					obj = {};
					parent[name] = obj;
				}
				parent = obj;
			}
			var value = get(key);
			if (value === void (0)) return false;
			if (value < item.min || value > item.max) return false;
		}
		return true;
	}


	static numericArrayToJsonSettings(array)
	{
		if (!ForexRobotV5_ChannelChain_Factory.validateChromosome(array)) debugger;

		function get(schemaName) { return ForexRobotV5_ChannelChain_Factory.decodeFromInteger(array[ForexRobotV5_ChannelChain_Factory.Offsets[schemaName]], ForexRobotV5_ChannelChain_Factory.Schema[schemaName]); }

		var result = {};
		for (var key in ForexRobotV5_ChannelChain_Factory.Schema)
		{
			var item = ForexRobotV5_ChannelChain_Factory.Schema[key];
			var parent = result;
			for (var length = item.path.length, i = 0; i < length; ++i)
			{
				var name = item.path[i];
				var obj = parent[name];
				if (!obj)
				{
					obj = {};
					parent[name] = obj;
				}
				parent = obj;
			}
			parent[item.name] = get(key);
		}

		return result;
	}

	static jsonToNumericArraySettings(json)
	{
		var result = [];

		function set(schemaName, modelValue) { result[ForexRobotV5_ChannelChain_Factory.Offsets[schemaName]] = ForexRobotV5_ChannelChain_Factory.encodeAsInteger(modelValue, ForexRobotV5_ChannelChain_Factory.Schema[schemaName]); }

		for (var key in ForexRobotV5_ChannelChain_Factory.Schema)
		{
			var item = ForexRobotV5_ChannelChain_Factory.Schema[key];
			var parent = json;
			for (var length = item.path.length, i = 0; i < length; ++i) parent = parent[item.path[i]];
			set(key, parent[item.name]);
		}

		return result;
	}


	static encodeAsInteger(modelValue, schema)
	{
		var value = modelValue;
		if (schema.values) value = schema.values.indexOf(value);
		if (value < schema.min || value > schema.max) throw "Invalid data.";

		var indexValue = Math.floor(Math.round((value - schema.min) * Math.pow(10, schema.decimalCount)) / (schema.resolution * Math.pow(10, schema.decimalCount)));

		var indexValueMax = Math.floor((schema.max - schema.min) / schema.resolution) + 1;
		if (indexValue < 0 || indexValue > indexValueMax) throw "Invalid data.";

		if (ForexRobotV5_ChannelChain_Factory.decodeFromInteger(indexValue, schema) != modelValue) debugger;

		return indexValue;
	}

	static decodeFromInteger(indexValue, schema, validating)
	{
		var indexValueMax = Math.floor((schema.max - schema.min) / schema.resolution) + 1;
		if (!validating) if (indexValue < 0 || indexValue > indexValueMax) throw "Invalid data.";

		var value = Math.round((schema.min + indexValue * schema.resolution) * Math.pow(10, schema.decimalCount)) / Math.pow(10, schema.decimalCount)
		if (!validating) if (value < schema.min || value > schema.max) throw "Invalid data.";

		if (!validating) if (schema.values) value = schema.values[value];

		return value;
	}


	static _testSchemaIntegrity()
	{
		var arraySample = [];
		for (var length = ForexRobotV5_ChannelChain_Factory.lastOffset + 1, i = 0; i < length; ++i) arraySample[i] = i + 1;
		var json = ForexRobotV5_ChannelChain_Factory.numericArrayToJsonSettings(arraySample);
		var processedArray = ForexRobotV5_ChannelChain_Factory.jsonToNumericArraySettings(json);
		for (var length = arraySample.length, i = 0; i < length; ++i) if (arraySample[i] != processedArray[i]) throw "Invalid operation.";
	}
}

ForexRobotV5_ChannelChain_Factory.static_constructor();

