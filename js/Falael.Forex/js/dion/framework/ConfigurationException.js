"use strict";

const DionException = require("@framework/DionException.js");

module.exports =

class ConfigurationException extends DionException // 10003
{
	constructor(name, environment, selector, group, keyPath, message)
	{
        super(500, 10003, "Configuration error", message);

		this.name = name;
		this.environment = environment;
		this.selector = selector;
		this.group = group;
		this.keyPath = keyPath;
	}

	static createFrom(ex, json, environment, selector, group, keyPath, message)
	{
		const json2 = json || ex.json;
		const environment2 = environment || ex.environment;
		const selector2 = selector || ex.selector;
		const group2 = group || ex.group;
		const keyPath2 = keyPath || ex.keyPath;
		const message2 = message || ex.message;

		return new ConfigurationException(json2, environment2, selector2, group2, keyPath2, message2);
	}

}