"use strict";

include("StdAfx.js");

class DataQuery
{
	//	par.query: async function(args) { return [] } - peforms database read; returns a records array
	//	par.map: function(record) { return {} } - translates record into another object
	//	par.stat: function(context, arg) { return void } - collects statistical information record by record; if par.map is specified, the argument is a mapped record
	//	par.stat: function(context) { return {} } - returns the collected statistical information; called once after par.stat(record) has been called for every record
	//	par.stat: function() { return {} } - returns a context object; called once before the first par.stat(record) call
	//		- the context object is shared between all par.stat calls during one query operation
	constructor(par)
	{
		if (!par.query) throw "Argument is null: par.query.";

		this._query = par.query;
		this._map = par.map;
		this._stat = par.stat;
	}

	//	args: {}, directly passed to the this.query call
	//	returns { data: [], stats: {} or null }
	async executeQuery(args)
	{
		var queryResult = await this._query(args);
		if (!queryResult) throw "Invalid callback result: await this._query(args).";

		var result =
		{
			data: this._map ? [] : queryResult,
			stats: null,
		};

		var statContext = this._stat();
		if (this._map && this._stat)
		{
			for (var length = queryResult.length, i = 0; i < length; ++i)
			{
				var mappedRecord = this._map(queryResult[i]);
				result.data.push(mappedRecord);
				this._stat(statContext, mappedRecord);
			}
		}
		else if (this._map) for (var length = queryResult.length, i = 0; i < length; ++i) result.data.push(this._map(queryResult[i]));
		else if (this._stat) for (var length = queryResult.length, i = 0; i < length; ++i) this._stat(statContext, queryResult[i]);

		if (this._stat) result.stats = this._stat(statContext);

		return result;
	}


	get query()
	{
		return this._query;
	}

	get map()
	{
		return this._map;
	}
}
