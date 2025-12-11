//	R0Q2?/daniel/20210718
//		- DOC: finish Usage documentation, look for "???"
//		- TEST: finish unit tests, look for "(non-exhaustive)"
//		- TODO: move the unit tests to UnitTests.js
//		- TODO: add a `format` function (`Object.assign(output, config.all); JSON.stringify(output, null, '  ')`) with the ability to obfuscate sensitive fields like passwords; use in _bootStage_loadConfiguration
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

module.exports = 

//	Class: Represents a Primordial Blocks configuration object. For further details see the description at the end of the file.
//  Sanity: Tested against prototype pollution.
class Configuration
{
	//	Parameter: `main: { json: { schema: {} }, name: string }` - the main configuration object.
	//		- `main.json.schema: {}` - the configuration schema definition.
	//		- `main.name: string` - the name of the configuration chunk, ususally the name or the full path of the source configuration file; for diagnostic purposes only.
	//	Parameter: `snippets: [{ json: {}, name: string }]` - a list of configuration objects to be applied over the main configuration object (see parameter `main`).
	//	Remarks: Snippets are not allowed to have own schema and are consumed in the context of the main configuration schema.
	//		The following names are reserved and cannot be used as root-level configuration field names: `environment`, `client`, `all`.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Key is invalid"`.
	//	Exception: `"Circular reference"`.
	//	Exception: `"Configuration group schema is missing"`.
	//	Exception: `"Configuration schema array field definition is invalid"`.
	//	Exception: `"Configuration groups can only contain environment sections, the \"common\" section and the \"clientExport\" section"`.
	//	Exception: `"Configuration section \"clientExport\" must be an array"`.
	//	Exception: `"Configuration snippet schema is prohibited"`.
	//	Exception: `"Configuration snippet \"clientExport\" is prohibited"`.
	//	Exception: `"Configuration field not in schema"`.
	//	Exception: `"Configuration validation failed"`.
	constructor(main, snippets, environment)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(main)) throw new Exception(0x481E8A, `Argument is invalid: "main".`);
			if (!Type.isString(main.name)) throw new Exception(0x777000, `Argument is invalid: "main.name".`);
			if (!Type.isObject(main.json)) throw new Exception(0xA8287C, `Argument is invalid: "main.json".`);
			if (!Type.isArray(snippets)) throw new Exception(0xB833C5, `Argument is invalid: "snippets".`);
			for (let length = snippets.length, i = 0; i < length; ++i)
			{
				const item = snippets[i];
				if (!Type.isObject(item)) throw new Exception(0x5F43D4, `Argument is invalid: "snippets[${i}]".`);
				if (!Type.isString(item.name)) throw new Exception(0x402615, `Argument is invalid: "snippets[${i}].name".`);
				if (!Type.isObject(item.json)) throw new Exception(0x6E7F95, `Argument is invalid: "snippets[${i}].json".`);
			}
			if (!Type.isString(environment)) throw new Exception(0xFCA651, `Argument is invalid: "environment".`);
		}

		const result = Configuration.load.bind(this)(main, snippets || [], environment);
		Object.assign(this, result);
	}

	//	Function: Walks deep the object tree and generates a flat list of all object properties as illustrated in the Usage section.
	//	Parameter: `obj: {}` - the object to walk.
	//	Returns: A flat list of all object properties as illustrated in the Usage section.
	//	Exception: `"Argument is invalid"`.
	//	Usage:
	//	
	//	obj: { a: 1, b: { c: "aa" }, d: [ 2, 3, 4 ], e: [ { f: 5, g: "bb" }, { f: 6, h: true } ] }
	//	result:
	//	{
	//		"a": 1,
	//		"b.c": "aa",
	//		"d[]": 100,		//	an array of literal elements
	//		"d": [ 2, 3, 100 ],
	//		"e[].f": 6,
	//		"e[].g": "bb",
	//		"e[].h": true,
	//		"e": [ { f: 5, g: "bb" }, { f: 6, h: true } ],	//	an array of objects
	//	}
	static flatten(obj)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(obj)) throw new Exception(0x2DAF4D, `Argument is invalid: "obj".`);
		}

		const result = {};
		_flatten(obj, result);
		return result;

		function _flatten(obj, result, path)
		{
			if (obj === void 0) return;
			path = path || "";

			if (Type.isArray(obj))
			{
				const length = obj.length;
				for (let i = 0; i < length; i++)
				{
					//	accumulate possible array element configuration properties from all array elements
					//	this information will be used for array element schema validation only
					_flatten(obj[i], result, path + "[]");
				}

				//	also treat arrays as literals (i.e. if the whole array-property is missing, a default
				//	array provided by the schema will be used; also no default-value processing will be performed for array elements)
				result[path] = obj;
				return;
			}

			if (Type.isObject(obj))
			{
				for (const key in obj)
				{
					if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
					_flatten(obj[key], result, path !== "" ? path + "." + key : key);
				}
				return;
			}

			result[path] = obj;
		}
	}

	//	Function: Performs a merge using a simple template syntax: `{{key}}` is replaced by the value corresponding to `key` 
	//		in the `dict` parameter; a `"Key is invalid"` exception is raised if `key` is missing from `dict`; `{{$oparen}}` is replaced by `{`.
	//	Parameter: `value: string` - the string to perform merge on.
	//	Parameter: `dict: {}` - a dictionary of merge fields. The `"$oparen"` key is reserved and its presence in `dict` will cause a `"Key is invalid"` exception.
	//	Returns: { value: string, mergeKeys: {}, mergeCount: integer }
	//		`value` - the processed string.
	//		`mergeKeys` - enumerates as property names the keys of all merge tags that were replaced with merge field values.
	//		`mergeKeys` - indicates the total number of merges peformed on the string.
	//	Exception: `"Argument is invalid"`.
	//	Exception: `"Key is invalid"`.
	//	Exception: `"Not implemented"`.
	static mergeString(value, dict)
	{
		if (PB_DEBUG)
		{
			if (!Type.isString(value)) throw new Exception(0x9CFE3D, `Argument is invalid: "value".`);
			if (!Type.isObject(dict)) throw new Exception(0x97B80D, `Argument is invalid: "dict".`);
			for (const key in dict) if (key === "$oparen") throw new Exception(0x5A5807, `Key is invalid: "$oparen".`);
		}

		const result = { value: null, mergeKeys: {}, mergeCount: 0 };

		const STATE_INPUT = Symbol("STATE_INPUT");
		const STATE_TAG_CANDIDATE = Symbol("STATE_TAG_CANDIDATE");
		const STATE_TAG_KEY = Symbol("STATE_TAG_KEY");
		const STATE_TAG_END_CANDIDATE = Symbol("STATE_TAG_END_CANDIDATE");

		const sb = [];
		const buffer = [];
		let state = STATE_INPUT;
		const length = value.length;
		let i = 0;
		let c;
		while (i < length)
		{
			c = value[i];
			switch (state)
			{
				case STATE_INPUT:
					switch (c)
					{
						case '{': state = STATE_TAG_CANDIDATE; ++i; continue;
						default: sb.push(c); ++i; continue;
					}
				case STATE_TAG_CANDIDATE:
					switch (c)
					{
						case '{': state = STATE_TAG_KEY; ++i; continue;
						default: sb.push('{'); sb.push(c); state = STATE_INPUT; ++i; continue;
					}
				case STATE_TAG_KEY:
					switch (c)
					{
						case '}': state = STATE_TAG_END_CANDIDATE; ++i; continue;
						default: buffer.push(c); ++i; continue;
					}
				case STATE_TAG_END_CANDIDATE:
					switch (c)
					{
						case '}':
							const key = buffer.join("");
							if (!buffer.length) sb.push(`{{}}`);
							else
							{
								buffer.length = 0;
								if (key === "$oparen") sb.push(`{`);
								else
								{
									const mergeValue = dict[key];
									if (mergeValue === void 0) throw new Exception(0xECC25B, `Key is invalid: "${key}".`);
									else { sb.push(mergeValue); result.mergeKeys[key] = true; ++result.mergeCount; }
								}
							}
							state = STATE_INPUT;
							++i;
							continue;
						default: sb.push('}'); buffer.push(c); ++i; continue;
					}
				default: throw "Not implemented.";
			}
		}
		switch (state)
		{
			case STATE_INPUT: break;
			case STATE_TAG_CANDIDATE: sb.push('{'); break;
			case STATE_TAG_KEY: sb.push("{{"); sb.push(buffer.join("")); break;
			case STATE_TAG_END_CANDIDATE: sb.push("{{"); sb.push(buffer.join("")); sb.push("}"); break;
			default: throw "Not implemented.";
		}
		result.value = sb.join("");
		return result;
	}

	//	???
	//	Exception: `"Circular reference"`.
	static processSettingReferences(dict)
	{
		const result = {};

		let subset = _Configuration_transcribe(dict);
		let subset_copy = {};
		let mergeCount;
		do
		{
			mergeCount = 0;
			for (const key in subset)
			{
				const value = subset[key];
				if (!Type.isString(value)) { result[key] = value; continue; }
				const outcome = Configuration.mergeString(value, dict);
				if (!outcome.mergeCount) { result[key] = outcome.value; continue; }
				if (outcome.mergeKeys[key]) throw new Exception(0x8A6941, `Circular reference: "${key}".`);
				subset_copy[key] = outcome.value;
				mergeCount += outcome.mergeCount;
			}
			subset = subset_copy;
			subset_copy = {};
		}
		while (mergeCount);

		return result;
	}

	//	???
	static load(main, snippets, environment)
	{
		const result =
		{
			all: {},
			client: { environment },
			environment,
		};

		let clientExport = [];
		if (main.json.schema)	//	in this case, assume that the config does not use setting groups
		{
			const outcome = processGroup(main, environment, main.json, null, snippets);
			result.all = outcome.groupFlatValues;
			clientExport = outcome.clientExport;
		}
		else for (const key in main.json)	//	in this case, assume that the config uses setting groups
		{
			const outcome = processGroup(main, environment, main.json[key] || {}, key, snippets);
			Object.assign(result.all, outcome.groupFlatValues);
			clientExport.concat(outcome.clientExport);
		}

		result.all = Configuration.processSettingReferences(result.all);
		Object.assign(result.client, _Configuration_inflate(_Configuration_getClientExport(result.all, clientExport)));
		Object.assign(result, _Configuration_inflate(result.all));

		return result;

		//	Parameter: `group: { schema: {}, <configuration tree fields> }`.
		//	Parameter: `groupKey`: `null` for a single rouplessless main configuration or the group name for a main configuration group.
		//	Parameter: `snippets: [{ json: {}, name: string }]` - a list of configuration objects to be applied over the main configuration object (see parameter `main`).
		//	Returns: `{ groupFlatValues: {}, clientExport: {} }`.
		function processGroup(main, environment, group, groupKey, snippets)
		{
			if (!group.schema) throw new Exception(0x71D0B7, `Configuration group schema is missing: "${main.name}::${groupKey || "<root>"}".`);

			for (const key in group.schema)
			{
				const item = group.schema[key];
				if (!Type.isArray(item)) continue;
				if (item.length !== 1) throw new Exception(0xCAFA87, `Configuration schema array field definition is invalid: "${main.name}::${groupKey || "<root>"}.${key}".`);
			}

			for (let length = snippets.length, i = 0; i < length; ++i)
			{
				const snippet = snippets[i];
				if (snippet.json.schema) throw new Exception(0x6E8881, `Configuration snippet schema is prohibited: "${snippet.name}::${groupKey || "<root>"}".`);
				if (snippet.json.clientExport) throw new Exception(0x741F6E, `Configuration snippet "clientExport" is prohibited: "${snippet.name}::${groupKey || "<root>"}".`);
			}

			const groupFlatValues = {};
			let clientExport = [];

			const buckets = [group].concat(snippets);
			for (let length = buckets.length, i = 0; i < length; ++i)
			{
				let item = buckets[i];

				let bucket =
					item.json ||	//	a snippet
					item;			//	a main configuration group

				//	validate group sanity
				for (const key in bucket)
				{
					if (key === "clientExport")
					{
						if (!Type.isArray(bucket[key])) throw new Exception(0x93718E, `Configuration section "clientExport" must be an array: "${item.name || main.name}::${groupKey || "<root>"}".`);
						continue;
					}
					if (!Type.isObject(bucket[key])) throw new Exception(0x1BE261, `Configuration groups can only contain environment sections, the "common" section and the "clientExport" section: "${item.name || main.name}::${groupKey || "<root>"}.${key}".`);
				}

				if (i !== 0)	//	for snippets only
				{
					if (groupKey)	//	for grouped configurations only
					{
						if (!bucket[groupKey]) continue;	//	ignore snippets not containing configuration for the current configuration group
						bucket = bucket[groupKey];
					}
				}

				const bucketCommon = bucket["common"] || {};
				const bucketClientExport = bucket["clientExport"] || [];

				const bucketValues = bucket[environment] || {};

				const bucketFlatCommon = Configuration.flatten(bucketCommon);
				const bucketFlatValues = Configuration.flatten(bucketValues);

				//	use the `"common"` section as repository for default values
				for (const path in bucketFlatCommon) if (bucketFlatValues[path] === void 0) bucketFlatValues[path] = bucketFlatCommon[path];

				Object.assign(groupFlatValues, _Configuration_sortSettings(bucketFlatValues));
				clientExport = clientExport.concat(bucketClientExport);
			}

			const flatSchema = Configuration.flatten(group.schema);
			try
			{
				_Configuration_validate(groupFlatValues, flatSchema);
			}
			catch (ex)
			{
				throw new Exception(0x217BFD, `Configuration validation failed: "${main.name}[${environment}]::${groupKey || "<root>"}". ${ex.rawMessage}`);
			}

			if (!groupKey) return { groupFlatValues, clientExport };

			const flatValues = {};
			for (const key in groupFlatValues) flatValues[groupKey + '.' + key] = groupFlatValues[key];
			return { groupFlatValues: flatValues, clientExport };
		}
	}
}

function _Configuration_validate(values, schema)
{
	if (values.client) throw new Exception(0x2602AF, `Root field name is prohibited: "client".`);
	if (values.all) throw new Exception(0xA2BC11, `Root root field name is prohibited: "all"".`);
	if (values.environment) throw new Exception(0x68025F, `Root root field name is prohibited: "environment".`);

	//	validate schema basic rules
	for (const path in schema)
	{
		//	prohibit array nesting
		const matches = path.match(/\[\]/g);
		if (matches && matches.length > 1) throw new Exception(0x48D91F, `Array nesting is not supported. Related configuration field: "${path}".`);
	}

	//	detect configuration properties that are not described in the schema
	for (const path in values)
	{
		if (schema[path] === void 0)
		{
			if (path.indexOf("[]") !== -1 && path.indexOf("[]") === path.length - "[]".length) throw new Exception(0x7DAC3D, `Cannot use an array as a value, see schema. Related configuration field: "${path}".`);
			throw new Exception(0xC61BB2, `Invalid configuration property, see schema. Related configuration field: "${path}".`);
		}
	}

	//	detect schema properties that are missing from the configuration
	for (const path in schema)
	{
		const schemaItem = schema[path];
		if (values[path] === void 0)
		{
			const bracketsFoundAt = path.indexOf("[]");
			if (bracketsFoundAt !== -1)
			{
				const arrPath = path.substr(0, bracketsFoundAt);
				const arrValue = values[arrPath];
				if (arrValue && !arrValue.length) continue;
			}
			throw new Exception(0x773922, `Configuration property is required, see schema. Related configuration field: "${path}".`);
		}
	}
}

//	The opposite operation to Configuration.flatten
function _Configuration_inflate(values)
{
	const result = {};

	for (const path in values)
	{
		//	ignore deep array properties, they are used for validation only
		const matches = path.match(/\[\]/g) || [];
		if (matches.length >= 1) continue;

		const tokens = path.split(".");

		let current = result;
		for (let length = tokens.length - 1, i = 0; i < length; ++i)
		{
			const token = tokens[i];
			if (!current[token]) current[token] = {};
			current = current[token];
		}

		current[tokens[tokens.length - 1]] = values[path];
	}

	return result;
}

function _Configuration_sortSettings(flatSettings)
{
	//	prepare the denormalized data structure for processing
	const settingList = [];
	for (const key in flatSettings) settingList.push({ key: key, value: flatSettings[key] });
	
	//	sort all keys, short to long, to assure correct setting overriding behaviour (more specific settings, deeper in the object tree, override more general ones)
	settingList.sort((l, r) => l.key.length - r.key.length);

	const result = {};
	for (let length = settingList.length, i = 0; i < length; ++i)
	{
		const item = settingList[i];
		result[item.key] = item.value;
	}

	return result;
}

function _Configuration_getClientExport(flatValues, clientExport)
{
	const result = {};
	let resultFieldCount = 0;
	for (const key in flatValues)
	{
		if (clientExport.indexOf(key) !== -1)
		{
			result[key] = flatValues[key];
			++resultFieldCount;
		}
	}

	if (!resultFieldCount) return null;
	return result;
}

function _Configuration_transcribe(value)
{
	const visited = new Map();

	function _copyValue(value, parent)
	{
		const type = Type.getType(value);
		switch (type)
		{
			case Type.Object:
				{
					const existing = visited.get(value);
					if (existing) return existing;
					const result = {};
					visited.set(value, result);
					for (const key in value) result[key] = _copyValue(value[key], result);
					return result;
				}
			case Type.Array:
				{
					const result = new Array(value.length);
					for (let length = value.length, i = 0; i < length; ++i) result[i] = _copyValue(value[i], parent);
					return result;
				}
			case Type.Undefined:
			case Type.Null:
			case Type.Boolean:
			case Type.Number:
			case Type.String:
				return value;
			default:
				return void 0;
		}
	}

	return _copyValue(value);
}

//	Usage:
//
//	NodeJS Sample
//	-----------------------------
//	```
//		const Configuration = require("-/framework/Configuration.js");
//		const configJson = require("-/framework/../configuration.json");
//		const configJson_snippet1 = require("-/framework/../configuration-snippet1.json");
//		const config = new Configuration(
//			{ json: configJson, name: "configuration.json" }, 
//			[{ json: configJson_snippet1, name: "configuration-snippet1.json" }], 
//			options.environment
//		);
//		console.log("Running environment: " + config.environment);
//	```
//	where `options.environment` is a process argument, e.g. `"production"` in `nodejs app.js -e production`.
//
//	Snippets
//	-----------------------------
//  Snippets represent additional configuration files cascaded upon the main configuration; snippets are built in the same
//	way as the main configuration file, except for `"schema"`- and `"clientExport"`-sections, which are not allowed in snippets -
//	the root/group schema from the main configuration is used instead; the following needs to be considered when using snippets:
//		- the `"common"` and non-common sections in snippets are merged localy for the snippet before cascading with the loaded configuration;
//		- setting references are processed globally (cross-snippet) and are applied on the final configuration.
//
//	Groups
//	-----------------------------
//	Settings may or may not be orgainized in groups. If the main configuration contains a `"schema"` property at the root level, it is assumed
//	that no groups are used, otherwise every root property, except for `"schema"` and `"clientExport"` is expected to represent a settings group
//	(see the sample code below).
//	
//	Every group has own schema, own `"common"` section, own `"clientExport"` section and own sections for the different running enviroments 
//	(e.g. `"development"`, `"staging"`, `"production"` etc.); the settings from `"common"` are used as default values for in all environments; 
//	the schema values are provided only for reference and are ignored by the configuration parser.
//
//	Setting Cascading
//	-----------------------------
//	If a setting is present in more than one configuration object, the setting value from the object that has been loaded last will be used.
//	The main configuration object is loaded first and that snippets are loaded in the order of appearance in the `snippets` constructor parameter.
//	
//	Settings can be also cascaded through overriding the default values from the `"common"` section.
//
//	Literal values within a single array: ???
//
//	Object values within a single array: ???
//
//	Cascading of arrays from different configuration objects: ???
//
//	Sample Configuration with Groups
//	-----------------------------
//	```
//		{
//			"group1":
//			{
//				"schema":
//				{
//					"setting1": "description, sampleValue",
//					"setting2": "description, sampleValue",
//					"setting3": "description, sampleValue"
//				}
//				"common":
//				{
//					"setting2": "value in all environments",
//					"setting3": "value in all environments"
//				},
//				"production":
//				{
//					"setting1": "value in production",
//					"setting3": "override the common value"
//				}
//			},
//			"group2":
//			{
//				"schema":
//				{
//					...
//				}
//				...
//			}
//		}
//	```
//	Use `config.group1.setting1` to access settings from groups.
//
//	Sample Configuration without Groups
//	-----------------------------
//	```
//		{
//			"schema":
//			{
//				"setting1": "description, sampleValue",
//				"setting2": "description, sampleValue",
//				"setting3": "description, sampleValue"
//			}
//			"common":
//			{
//				"setting2": "value in all environments",
//				"setting3": "value in all environments"
//			},
//			"production":
//			{
//				"setting1": "value in production",
//				"setting3": "override the common value"
//			}
//		}
//	```
//	Use `config.setting1` to access settings from configuration without groups.
//
//	Array Values
//	-----------------------------
//	One level of setting arrays is allowed (nested arrays are not):
//	```
//		{
//			"schema":
//			{
//				"setting1": [ "some comment about the value, sampleValue" ],				//	array of literal values
//				"setting2": [ {"a":"comment, sampleValue", "b":"comment, sampleValue"} ]"	//	array of objects
//			},
//			"common":
//			{
//				"setting1": [ 1, 2, 3 ],
//				"setting2": [ {"a":1, "b":2}, {"a":3, "b":4, "c": 5} ]"
//			}
//		}
//	```
//
//	Optional Settings
//	-----------------------------
//	Allowing optional settings would mean that there is a default value for some settings hidden somewhere in the source code, adding this way opacity to the application's
//	configuration. To simulate an optional setting in a transparent way, a default value can be set in the `"common"` section.
//
//	Client-Side Configuration
//	-----------------------------
//	```
//	Exposing configuration fields to the client-side script is done like this:
//		{
//			"schema": 
//			{
//				"setting1": "some comment about the value, e.g. sampleValue",
//				"setting2": "some comment about the value, e.g. sampleValue",
//			}
//			"clientExport": [ "setting1" ],
//			"common":
//			{
//				"setting1": "aaa",
//				"setting2": "bbb"
//			}
//		}
//	```

//	`setting1` will be visible also in the client-side javascript, if the `app.js` exports
//	an endpoint to server; the endpoint could look like this:
//
//	```
//	app.get("/configuration", function(req, res)
//	{
//		res.end(JSON.stringify(config.client));
//	});
//	```
//
//	The client side script could acquire the exported configuration like this:
//
//	```
//	Ext.Ajax.request(
//	{
//		url: "/configuration",
//		success: function(response)
//		{
//			const config = Ext.decode(response.responseText);
//			console.log(config);
//		}
//	});
//	```
//
//	Setting References
//	-----------------------------
//
//	Settings can be referenced from the values of other settings via the `{{setting}}` syntax; setting
//	names can be hierarchical, i.e. `{{group.path1.path2.name}}`; setting references are replaced with their
//	corresponding setting values iteratively until no more outstanding setting references are left unprocessed.
//	`{{$oparen}}` is replaced by`{`.
//
//	```
//		{
//			"schema": 
//			{
//				"setting1": "this setting wil be referenced",
//				"setting2": "this setting will reference setting1",
//			},
//			"common": 
//			{
//				"setting1": "aaa",
//				"setting2": "TEST{{setting1}}TEST"	//	the value of setting2 will be TESTaaaTEST
//			}
//		}
//	```
//
//	IMPORTANT: Setting reference nesting may result in unintended tag emergence. Consider the following example:
//		`{ a: "{{$oparen}}{{b}}}", b: "{a}" }` => `{ a: "{{a}}", b: "{a}" }` => unintended circular tag reference
//
//	Reserved Configuration Field Names
//	-----------------------------
//
//	- `config.environment` - contains the value of the `environment` parameter passed to the `Configuration` constructor.
//	- `config.all` - contains a flat dictionary of `"<json.path>": <value>` pairs representing the effective configuration.
//	- `config.client` - contains the configuration fields that are includeed in the `"clientExport"` list.
//
//	Configuration Validation
//	-----------------------------
//	Final settings, resulting from the cascading of all configuration objects, are validated upon the configuration schema. The `Configuration` constructor will throw an exception
//	if the validation fails. The validation will fail if there are required settings missing, or if there are settings present that are not specified by the schema.

module.exports.Configuration = module.exports;
