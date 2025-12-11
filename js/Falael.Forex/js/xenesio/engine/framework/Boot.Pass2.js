"use strict";

var EFeature =
{
}

EFeature.isValidValue = function (value)
{
	for(var key in EFeature)
	{
		if(EFeature[key] == value)
		{
			return true;
		}
	}
	return false;
}

EFeature.parse = function (text)
{
	var result = EFeature[text];
	if (result === void (0))
	{
		return null;
	}
	return result;
}

function Feature(id, key)
{
	this.id = id;
	this.key = key;
};

Feature.parseKeyList = function (featureKeyListText)
{
	var result = {};

	if (featureKeyListText == null || !featureKeyListText.length)
	{
		return result;
	}

	var featureKeyListText_trimmed = featureKeyListText.trim();
	if (!featureKeyListText_trimmed.length)
	{
		return result;
	}

	var parts = featureKeyListText_trimmed.split(/[ ,]+/);
	for (var length = parts.length, i = 0; i < length; ++i)
	{
		var item = parts[i].trim();

		if (!item.length)
		{
			console.error(3001001, "Empty feature key \"" + item + "\".");
			continue;
		}
		var featureId = EFeature.parse(item);
		if (!featureId)
		{
			console.error(3001002, "Unrecognized feature key \"" + item + "\".");
			continue;
		}

		if (result[featureId])
		{
			console.error(3001003, "Multiple feature key \"" + item + "\" occurrences are not supported.");
			continue;
		}

		result[featureId] = new Feature(featureId, item);
	}

	return result;
};

(function ()
{
	if (!("Boot" in window))
	{
		window.Boot = {};
	}
	if (Boot.pass2Complete)
	{
		return;
	}
	Boot.pass2Complete = true;

	Boot.features = Feature.parseKeyList(window.appConfig.features);
	Boot.hasFeature = function (featureId) { return Boot.features[featureId]; };

	if ("include" in window) throw "Browser not compatible.";
	if ("module" in window) throw "Browser not compatible.";

	var Operations =
	{
		IncludeJs: 1,
		IncludeCss: 2,
		IncludeTemplate: 3,
	};

	window.ft_include = function (featureId, arg1, arg2)
	{
		if(!EFeature.isValidValue(featureId))
		{
			console.error(3001004, "Unrecognized id \"" + featureId + "\".");
			return;
		}

		if (!Boot.hasFeature(featureId))
		{
			return;
		}

		window.include(arg1, arg2);
	}

	window.include = function (arg1, arg2)
	{
		if (!arg1)
		{
			throw "Argument is null: arg1";
		}
		var id;
		var file;
		var operation;
		if (arg2)
		{
			id = arg1;
			file = arg2;
			operation = Operations.IncludeTemplate;
		}
		else
		{
			var jsExt = ".js";
			var cssExt = ".css";
			file = arg1;
			if (file.indexOf(jsExt) == file.length - jsExt.length)
			{
				operation = Operations.IncludeJs;
			}
			else if (file.indexOf(cssExt) == file.length - cssExt.length)
			{
				operation = Operations.IncludeCss;
			}
			else
			{
				throw "Invalid file extension in path \"" + file + "\"";
			}
		}

		switch(operation)
		{
			case Operations.IncludeJs:
				includeJs(file);
				break;
			case Operations.IncludeCss:
				includeCss(file);
				break;
			case Operations.IncludeTemplate:
				includeTemplate(id, file);
				break;
		}
	}

	window.include.includedFiles = {};

	window.require = function (url)
	{
		var tokens = url.split('/');
		var foundAt = tokens[tokens.length - 1].indexOf('.js');
		if (foundAt == -1)
		{
			//	simulate spacific native nodejs require-s that are also available at the client
			switch (tokens[tokens.length - 1])
			{
				case "functional-red-black-tree":
					return window.createRBTree;
				default:
					throw "Unsupported.";
			}
		}
		var className = tokens[tokens.length - 1].substr(0, foundAt);
		try
		{
			return new Function("return " + className)();
		}
		catch (ex)
		{
			console.error(3001005, "Bad client-side require(\"" + url + "\"). Make sure the parent js file is located in \"" + window.appConfig.jsSharedBasePath + "\"");
			throw ex;
		}
	}

	function includeJs(file)
	{
		if (!file)
		{
			throw "Invalid argument file";
		}
		var url = window.appConfig.jsBasePath + file;
		if (window.include.includedFiles[url])
		{
			return;
		}
		window.include.includedFiles[url] = true;

		var request = new XMLHttpRequest();
		request.open("GET", url + "?" + newUUID(), false);
		request.send();

		var script = document.createElement("script");
		if (url.indexOf(window.appConfig.jsSharedBasePath) == 0)
		{
			//window.module = {};
			var tokens = url.split('/');
			var foundAt = tokens[tokens.length - 1].indexOf('.js');
			var className = tokens[tokens.length - 1].substr(0, foundAt);
			script.text = "/* " + url + " */\n\"use strict\";window." + className + "=(function(module){{" + request.responseText + "}if(!module.exports){throw \"Missing the \\\"module.exports=\\\" statement.\"}return module.exports})({});";
		}
		else
		{
			script.text = "/* " + url + " */\n" + request.responseText;
		}
		document.head.appendChild(script);
	}

	function includeCss(file)
	{
		if (!file)
		{
			throw "Invalid argument file";
		}
		var url = window.appConfig.cssBasePath + file;
		if (window.include.includedFiles[url])
		{
			return;
		}
		window.include.includedFiles[url] = true;

		var link = document.createElement("link");
		link.setAttribute("rel", "stylesheet")
		link.setAttribute("type", "text/css")
		link.setAttribute("href", url);// + "?u=" + newUUID())
		document.head.appendChild(link);
	}

	function includeTemplate(id, file)
	{
		if (!id)
		{
			throw "Invalid argument id";
		}
		if (!file)
		{
			throw "Invalid argument file";
		}
		var url = window.appConfig.templateBasePath + file;
		if (window.include.includedFiles[url])
		{
			return;
		}
		window.include.includedFiles[url] = true;

		var link = document.createElement("link");
		link.setAttribute("rel", "template")
		link.setAttribute("id", id)
		link.setAttribute("href", url);// + "?u=" + newUUID())
		document.head.appendChild(link);
	}
})();
