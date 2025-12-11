"use strict";

const ConfigurationException = require("@framework/ConfigurationException.js");

const selectorMarker = "#";

module.exports =

//	for detailed description of this class see the end of the file

class Configuration
{
	constructor(main, snippets, environment, selector)
	{
		var result = this._load(main, snippets || [], environment, selector);
		Object.assign(this, result);

		var flatResult = {};
		_flatten(result, flatResult);
		this.$ = flatResult;
	}

	_load(main, snippets, environment, selector)
	{
		var result = {};

		function processGroup(group, groupKey, snippets)
		{
			var groupSchema = group["schema"];
			if (!groupSchema)
			{
				throw new ConfigurationException(main.name, environment, selector, groupKey || "<root>", null, "Missing configuration schema.");
			}
			for (var length = snippets.length, i = 0; i < length; ++i)
			{
				var snippet = snippets[i];
				var snippetSchema = snippet.json["schema"];
				if (snippetSchema)
				{
					throw new ConfigurationException(snippet.name, environment, selector, groupKey || "<root>", null, "Snippets cannot define configuration schema.");
				}
			}

			var flatSchema = {};
			_flatten(groupSchema, flatSchema);
			var groupFlatValues = {};
			var groupExposeToClient = [];

			var buckets = [group].concat(snippets);
			for (var length = buckets.length, i = 0; i < length; ++i)
			{
				var bucket = buckets[i];
				bucket = bucket.json || bucket;
				if (i != 0)
				{
					if (groupKey)
					{
						if (!bucket[groupKey])
						{
							continue;
						}
						bucket = bucket[groupKey]
					}
				}

				var bucketCommon = bucket["common"];
				var bucketSelectors = bucket["selectors"];
				var bucketExposeToClient = bucket["exposeToClient"];

				var bucketValues = bucket[environment] || {};

				var bucketFlatCommon = {};
				var bucketFlatValues = {};

				_flatten(bucketCommon, bucketFlatCommon);
				_flatten(bucketValues, bucketFlatValues);

				_fillInDefaults(bucketFlatValues, bucketFlatCommon);

				bucketFlatValues = _mergeDownSelectors(bucketFlatValues, bucketSelectors, selector);

				Object.assign(groupFlatValues, bucketFlatValues);
				groupExposeToClient = groupExposeToClient.concat(bucketExposeToClient);
			}

			try
			{
				_validate(groupFlatValues, flatSchema);
			}
			catch (ex)
			{
				throw ConfigurationException.createFrom(ex, main.name, environment, selector, groupKey || "<root>", null, null);
			}

			if (groupKey)
			{
				result[groupKey] = _inflate(groupFlatValues);
			}
			else
			{
				result = _inflate(groupFlatValues);
			}

			var clientFlatValues = _getExposeToClient(groupFlatValues, groupExposeToClient);
			if (clientFlatValues)
			{
				if (groupKey)
				{
					if (!result["@client"]) result["@client"] = {};
					result["@client"][groupKey] = _inflate(clientFlatValues);
				}
				else
				{
					result["@client"] = _inflate(clientFlatValues);
				}
			}
		}

		if (main.json.schema)
		{
			//	assume the config does not use setting groups
			processGroup(main, null, snippets);
		}
		else
		{
			//	the config uses setting groups
			for (var groupKey in main.json)
			{
				processGroup(main.json[groupKey] || {}, groupKey, snippets);
			}
		}

		result.environment = environment;
		if (!result["@client"]) result["@client"] = {};
		result["@client"].environment = environment;

		var flatResult = {};
		_flatten(result, flatResult);
		_processAliases(flatResult, result);

		return result;
	}
}

//	walks the object tree and generates a flat list of all object properties
//	example:
//	object: { a: 1, b: { c: "aa" }, d: [ 2, 3, 4 ], e: [ { f: 5, g: "bb" }, { f: 6, h: true } ] }
//	flat:
//	{
//		"a": 1,
//		"b.c": "aa",
//		"d[]": 4,	//	an array of literal elements
//		"d": [ 2, 3, 4 ],
//		"e[].f": 6,
//		"e[].g": "bb",
//		"e[].h": true,
//		"e": [ { f: 5, g: "bb" }, { f: 6, h: true } ],
//	}
function _flatten(src, result, path, isOptionalKey)
{
	if (src === void 0)
	{
		return;
	}
	path = path || "";

	if (Object.prototype.toString.apply(src) === '[object Array]')
	{
		var length = src.length;
		for (var i = 0; i < length; i++)
		{
			//	accumulate possible array element configuration properties from all array elements
			//	this information will be used for array element schema validation only
			_flatten(src[i], result, path + "[]", isOptionalKey);
		}

		//	also treat arrays as literals (i.e. if the whole array-property is missing, a default
		//	array provided by the schema will be used; also no default-value processing will be performed
		// 	for array elements)
		result[path] = isOptionalKey ? { "[optional]": src } : src;
		return;
	}

	if (typeof src === "object")
	{
		for (var key in src)
		{
			if (!src.hasOwnProperty(key))
			{
				continue;
			}

			var optional = isOptionalKey;
			var bareKey = key;
			if (key.indexOf("[") == 0 && key.indexOf("]") == key.length - 1)
			{
				optional = true;
				bareKey = key.substr(1, key.length - 2);
			}
			_flatten(src[key], result, path != "" ? path + "." + bareKey : bareKey, optional);
		}

		return;
	}

	result[path] = isOptionalKey ? { "[optional]": src } : src;
}

function _validate(values, schema)
{
	//	validate schema basic rules
	for (var path in schema)
	{
		//	prohibit array nesting
		var matches = path.match(/\[\]/g) || [];
		if (matches.length > 1)
		{
			throw new ConfigurationException(null, null, null, null, path, "Array nesting is not supported.");
		}
	}

	//	detect configuration properties that are not described in the schema
	for (var path in values)
	{
		if (schema[path] === void 0)
		{
			if (path.indexOf("[]") != -1 && path.indexOf("[]") == path.length - "[]".length)
			{
				throw new ConfigurationException(null, null, null, null, path, "The schema does not allow literal array values.");
			}
			throw new ConfigurationException(null, null, null, null, path, "Property not in schema.");
		}
	}

	//	detect schema properties that are missing from the configuration
	for (var path in schema)
	{
		var schemaItem = schema[path];
		if (schemaItem["[optional]"] !== void 0)
		{
			//	don't validate optional keys
			continue;
		}
		if (values[path] === void 0)
		{
			var bracketsFoundAt = path.indexOf("[]");
			if (bracketsFoundAt != -1)
			{
				var arrPath = path.substr(0, bracketsFoundAt);
				var arrValue = values[arrPath];
				if (arrValue && !arrValue.length)
				{
					continue;
				}
			}
			throw new ConfigurationException(null, null, null, null, path, "Property \"" + path + "\" is required.");
		}
	}
}

function _fillInDefaults(values, schema)
{
	//	copy schema defaults to fill in for missing value properties
	for (var path in schema)
	{
		if (values[path] === void 0)
		{
			values[path] = schema[path];
		}
	}
}

function _inflate(values)
{
	var result = {};

	for (var path in values)
	{
		//	ignore deep array properties, they are used only for validation
		var matches = path.match(/\[\]/g) || [];
		if (matches.length >= 1)
		{
			continue;
		}

		var tokens = path.split(".");

		var current = result;
		var length = tokens.length - 1;
		for (var i = 0; i < length; i++)
		{
			var token = tokens[i];
			if (!current[token])
			{
				current[token] = {};
			}
			current = current[token];
		}

		current[tokens[tokens.length - 1]] = values[path];
	}

	return result;
}

function _mergeDownSelectors(flatValues, groupSelectors, selector)
{
	//	splits the key in two parts - the selector part, if any, and the actual setting key path
	function split(key)
	{
		var tokens = key.split(".");
		var selectorSb = [];
		var keySb = [];

		for (var length = tokens.length, i = 0; i < length; i++)
		{
			var token = tokens[i];
			if (token[0] == selectorMarker)
			{
				selectorSb.push(token);
			}
			else
			{
				keySb.push(token);
			}
		}

		return {
			selector: selectorSb.join("."),
			key: keySb.join("."),
		};
	}

	//	prepare the denormalized data structure for processing
	var valueList = [];
	for (var key in flatValues)
	{
		valueList.push(
			{
				key: key,
				parts: split(key),
				value: flatValues[key],
			});
	}

	//	sort all keys, short to long, to assure correct setting overriding behaviour (more specific values override more general ones)
	valueList.sort(function (left, right)
	{
		return left.key.length - right.key.length;
	});

	if (selector && selector.length)
	{
		//	when using a current selector

		//	denormalize the current selector, for ex. "lvl1.lvl2.lvl3" produces "lvl1", "lvl1.lvl2" and "lvl1.lvl2.lvl3"
		var selectorVariants = {};
		var sb = [];
		var tokens = selector.split(".");
		for (var length = tokens.length, i = 0; i < length; i++)
		{
			var token = tokens[i];
			sb.push(token);
			selectorVariants[sb.join(".")] = true;
		}

		//	process
		var result = {};
		for (var length = valueList.length, i = 0; i < length; i++)
		{
			var item = valueList[i];
			if (item.parts.selector == "")
			{
				//	does not participate in the selector process
				result[item.key] = item.value;
				continue;
			}
			if (!selectorVariants[item.parts.selector])
			{
				//	selector used in setting definition, but does not match the current selector
				continue;
			}

			//	use the current selector on this setting to merge down it's value
			result[item.parts.key] = item.value;
		}
	}
	else
	{
		//	no current selector is specified, filter out any settings with selectors

		//	process
		var result = {};
		for (var length = valueList.length, i = 0; i < length; i++)
		{
			var item = valueList[i];
			if (item.parts.selector != "")
			{
				//	ignore any settings with selectors
				continue;
			}
			result[item.key] = item.value;
		}
	}

	return result;
}

function _getExposeToClient(flatValues, groupExposeToClient)
{
	var resultFieldCount = 0;
	var result = {};
	for (var key in flatValues)
	{
		if (groupExposeToClient.indexOf(key) != -1)
		{
			result[key] = flatValues[key];
			++resultFieldCount;
		}
	}

	if (!resultFieldCount)
	{
		return null;
	}
	return result;
}

function _processAliases(flatValues, root)
{
	if (Object.prototype.toString.apply(root) === '[object Array]')
	{
		var length = root.length;
		for (var i = 0; i < length; i++)
		{
			var value = root[i];
			if (typeof value === "string")
			{
				root[i] = processValue(value);
			}
			else
			{
				_processAliases(flatValues, root[i]);
			}
		}
	}
	else if (typeof root === "object")
	{
		for (var key in root)
		{
			if (!root.hasOwnProperty(key))
			{
				continue;
			}

			var value = root[key];
			if (typeof value === "string")
			{
				root[key] = processValue(value);
			}
			else
			{
				_processAliases(flatValues, root[key]);
			}
		}
	}

	function processValue(value)
	{
		if (value.indexOf("{{") == -1)
		{
			return value;
		}

		return value.replace(/{{([^{}]*)}}/gi, function (match, p1)
		{
			return flatValues[p1];
		});
	}

}

//	sample usage:
//		var Configuration = require("@framework/Configuration.js");
//		var configJson = require("@framework/../configuration.json");
//		var configJson_snippet1 = require("@framework/../configuration-snippet1.json");
//		var config = new Configuration({ json: configJson, name: "configuration.json" }, [{ json: configJson_snippet1, path: "configuration-snippet1.json" }], options.environment, options.selector);
//		console.log("Running environment: " + config.environment);
//	where args.environment is a process argument, e.g. "production" in "nodejs app.js -e production"
//
//  snippets represent additional configuration files stacked upon the main configuration; snippets are built the same
//	way the main configuration file is, except for schemas, which are not allowed in snippets - the corresponding root/group schema
//	is used instead; the follownig is to be considered when using snippets
//		- the common and non-common sections in snippets are merged before overriding the already loaded configuration
//		- selectors are applied in snippets before overriding the already loaded configuration
//		- aliases are processed globally (cross-snippet) and are applied on the final configuration
//
//	sample config, with groups:
//		{
//			"group1": {
//				"schema": {
//					"setting1": "description, sampleValue",
//					"setting2": "description, sampleValue",
//					"setting3": "description, sampleValue"
//				}
//				"common": {
//				{
//					"setting2": "value in all environments",
//					"setting3": "value in all environments"
//				},
//				"production": {
//					"setting1": "value in production"
//					"setting3": "override the common value"
//				}
//			}
//		}
//	use config.group1.setting1 to access settings
//	every group has own schema, common and own sections for the different enviroments (dev, staging,
//	production); the settings from "common" are included in all environments; the schema values are not
//	used, they are provided only as a reference
//
//	sample config, without groups:
//		{
//			"schema": {
//				"setting1": "description, sampleValue",
//				"setting2": "description, sampleValue",
//				"setting3": "description, sampleValue"
//			}
//			"common": {
//			{
//				"setting2": "value in all environments",
//				"setting3": "value in all environments"
//			},
//			"production": {
//				"setting1": "value in production"
//				"setting3": "override the common value"
//			}
//		}
//	use config.setting1 to access settings
//
//	one level of setting arrays is allowed (nested arrays are not):
//		{
//			"schema": {
//				"setting1": [ "some comment about the value, sampleValue" ],				//	array of literal values
//				"setting2": [ {"a":"comment, sampleValue", "b":"comment, sampleValue"} ]"	//	array of objects
//			}
//			"common": {
//			{
//				"setting1": [ 1, 2, 3 ],
//				"setting2": [ {"a":1, "b":2 }, {"a":3, "b":4} ]"
//			},
//		}
//
//	optional fields can be specified in the schema by encapsulating the field name in square brackets, like this:
//		{
//			"schema": {
//				"[setting1]": [ "some comment about the value, sampleValue" ],			//	optional setting
//				"setting2": [ {"a":"comment, sampleValue", "b":"comment, sampleValue"} ]"
//			}
//			"common": {
//			{
//				"setting1": [ 1, 2, 3 ],
//				"setting2": [ {"a":1, "b":2 }, {"a":3, "b":4} ]"
//			},
//		}
//
//	selectors
//
//	the selectors provide a way to create and use specific configurations for specific setups within
//	the current environment; there are two types of selectors: a "current selector" that is specified
//	using the -s app argument, and a "setting selector", used to define specific setting blocks
//
//	invoking the application with a specific current selector:
//
//	nodejs app -e development -s deveolpers.diana		// will look for settings in development.#deveolpers.#diana first, will fallback to development.#deveolpers and then to development
//	nodejs app -e development -s deveolpers				// will look for settings in development.#deveolpers first, will fallback to development
//	nodejs app -e development -s automated_tester		// will look for settings in development.#automated_tester first, will fallback to development
//
//	setting selectors must be declared for each group; setting selectors may be defined also in the "common" settings
// 	here is an example
//		{
//			"schema": {
//				"app_title": "application title",
//				"app_ver": "application version"
//			}
//			"selectors":
//			[
//				//	a list of all possible selectors
//				//	will look for #deveolpers, #deveolpers.#diana and #automated_tester
//				//	will ignore all other selectors silently
//				"#deveolpers.#diana", "#automated_tester"
//			],
//			"common": {
//			{
//				"app_ver": "1.2",
//				"#automated_tester": {
//					"app_ver": "1.2 (tester)",					//	will be used in case of "nodejs app -e development -s automated_tester" insted of the default value "1.2"
//				}
//			},
//			"development": {
//				"app_title": "Practicedent (DEV)",				//	will be used in case of "nodejs app -e development"
//				"#automated_tester": {
//					"app_title": "Practicedent (AUT.TESTER)",	//	will be used in case of "nodejs app -e development -s automated_tester"
//					"app_ver": "1.2 (dev tester)",				//	will be used in case of "nodejs app -e development -s automated_tester" insted of the default value "1.2" nad also insted of the more specific #automated_tester default value "1.2 (tester)"
//				}
//				"#developers": {
//					"app_title": "Practicedent (UNSPECIFIED DEVELOPER)",	//	will be used in case of "nodejs app -e development -s developers" or "nodejs app -e development -s developers.ceci"
//					"#diana": {
//						"app_title": "Practicedent (DEV DIANA)",//	will be used in case of "nodejs app -e development -s developers.diana"
//					}
//				}
//			},
//			"production": {
//			{
//				"app_title": "Practicedent",
//			}
//		}
//
//	IMPORTANT NOTE: the prupose of the selectors is to enable the creatiion of very specific very custom
//	configurations in very custom scenarios, like per strangely-configured developer machine, or per
//	application server instance; use this feature only as a last resort, becuase
//	it makes the configuration files unmaintainable
//
//	exposing configuration fields to the client-side script
//		{
//			"schema": {
//				"setting1": "some comment about the value, e.g. sampleValue",
//				"setting2": "some comment about the value, e.g. sampleValue",
//			}
//			"exposeToClient": [ "setting1" ],
//			"common": {
//			{
//				"setting1": "aaa",
//				"setting2": "bbb"
//			},
//		}
//	setting1 will be visible also in the client-side javascript, if the app.js exposes
//	an endpoint get "/configuration"; the endpoint should look like this:
//
//	app.get(Configuration.expressGet, function(req, res)
//	{
//		res.end(JSON.stringify(config["@client"]));
//	});
//
//	the client side script, in order to acquire the exposed configuration, could look like this:
//
//	Ext.Ajax.request(
//	{
//		url:'/configuration',
//		success:  function(response)
//		{
//			var config = Ext.decode(response.responseText);
//			console.log(config);
//		}
//	});
//
//	aliases
//
//	the configuration engine supports the {{setting.name}} syntax within the setting values; setting
//	names can be hierarchical, i.e. {{group.path1.path2.name}}; the value, referenced in such a way,
//	is being looked up from the raw list of loaded setting fields; value references are NOT
//  processed recursively
//
//		{
//			"schema": {
//				"[setting1]": "a settings field to be used as an alias",
//				"setting2": "a value that will make use of the alias",
//			}
//			"common": {
//			{
//				"setting1": "aaa",
//				"setting2": "TEST{{setting1}}TEST"	//	the value of setting2 will be TESTaaaTEST
//			},
//		}
//
//	IMPORTANT: there is no escaping mechanism provided for the {{ and }} character sequences,
//	so currently there is no way to include either sequence in a configuration value
//
//	config.$ contains a flat dictionary of "json.path": <value> pairs representing the effective configuration
//
