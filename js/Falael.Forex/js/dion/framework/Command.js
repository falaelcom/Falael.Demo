"use strict";

const Ajv = new require("ajv");

const NotImplementedException = require("@framework/NotImplementedException.js");
const InvalidOperationException = require("@framework/InvalidOperationException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const ECliBodyParserType = require("@framework/ECliBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const errorSchema =
{
	type: "object",
	properties:
	{
		statusCode: { type: "number" },	//	HTTP status code 200-503 (see __buildFastifySchema) (fastify complient)
		error: { type: "string" },		//	the general name of the error (fastify complient)
		message: { type: "string" },	//	the specific details regarding the error (fastify complient)
		code: { type: "number" },		//	dion-specific error code 10001-99999 (additional field)
	},
	additionalProperties: true,
};

module.exports =

class Command
{
    constructor(data)
    {
        this._data = data;
    }

    get data()
    {
        return this._data;
    }

	static __ensureManifest(manifest)
	{
		let result = manifest;

		if (!result) result = {};

		if (result.rest !== false)
		{
			if (!result.rest) result.rest = {};
			if (!result.rest.method) result.rest.method = EHttpMethod.Get;
			if (!result.rest.parameters) result.rest.parameters = [];
			if (!result.rest.bodyParserType) result.rest.bodyParserType = EHttpBodyParserType.None;
			if (!result.rest.validate) result.rest.validate = {};
		}

		if (result.cli !== false)
		{
			if (!result.cli) result.cli = {};
			if (!result.cli.bodyParserType) result.cli.bodyParserType = ECliBodyParserType.None;
			if (!result.cli.options) result.cli.options = [];
			if (!result.cli.validate) result.cli.validate = {};
			if (!result.cli.validate.json) result.cli.validate.json = {};
			if (!result.cli.validate.args) result.cli.validate.args = {};
		}

		if (result.response !== false)
		{
			if (!result.response) result.response = {};
			if (!result.response.responseType) result.response.responseType = EResponseType.None;
			if (result.response.compressed === void (0)) result.response.compressed = false;
		}

		if (result.cli.options.$rest)
		{
			var coll = result.rest.validate[result.cli.options.$rest].properties;
			result.cli.options = [];
			for (var key in coll)
			{
				var item = coll[key];
				var dashdashType;
				//	https://github.com/trentm/node-dashdash
				//	https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md#type
				switch (item.type)
				{
					case "number":
						dashdashType = "number";
						break;
					case "integer":
						dashdashType = "integer";
						break;
					case "string":
						dashdashType = "string";
						break;
					case "boolean":
						dashdashType = "bool";
						break;
					case "array":
						dashdashType = "arrayOfString";
						break;
					case "object":
					case "null":
						throw "Not supported.";
					default:
						throw "Not implemented.";
				}
				result.cli.options.push(
				{
					name: key,
					type: dashdashType ,
				});
			}
		}
		if (result.cli.validate.json.$rest) result.cli.validate.json = result.rest.validate[result.cli.validate.json.$rest];
		if (result.cli.validate.args.$rest) result.cli.validate.args = result.rest.validate[result.cli.validate.args.$rest];

		return result;
	}

    //  manifest:
    //  {
    //      rest:
    //      {
    //          method: EHttpMethod.<method>,
	//			parameters: [ "<param1>", "<param2>", ... ],			//	the REST endpoint parameters that follow the full REST path, e.g. /rest/path/endpoint/:param1/:param2
    //          bodyParserType: EHttpBodyParserType.<bodyParserType>,   //  defaults to EHttpBodyParserType.None
	//			//	fastify schema (used exactly as required by fastify for increased performance)
	//			//	all inbound fields must have unique names regardless of their location (quesy string, form fields, params, headers)
    //			validate:
	//			{
	//				body: { ... },				//	default is undefined
	//				querystring: { ... },		//	default is undefined
	//				params: { ... },			//	default is undefined
	//				headers: { ... },			//	default is undefined
	//			}
	//      },
    //      cli:
    //      {
    //          bodyParserType: ECliBodyParserType.<bodyParserType>,    //  defaults to ECliBodyParserType.None
	//			options: [ ... ],	//	dashdash options definition for the command options after the -- in the command line
	//
	//			options: { $rest: "querystring" },	//	will map the fields from will use the res.validate.querystring.properties as an option def array
	//			//	in the args schema all inbound fields must have unique names regardless of their location (cli arguments, cli json, stdin json)
    //			validate:
	//			{
	//				json: { ... },				//	default is {}; ajv schema for a json passed the --json cli parameter or through through stdin
	//				args: { ... },				//	default is {}; ajv schema for the cli arguments passed after --
	//
	//				json: { $rest: "body" },		//	will use the res.validate.body as validation schema for the cli json
	//				args: { $rest: "querystring" },	//	will use the res.validate.querystring as validation schema for the cli args
	//			}
    //      },
	//		response:
	//		{
	//			responseType: EResponseType.<responseType>		//	defaults to EResponseType.None
	//			compressed: <bool>,								//	defaults to false; only used with EResponseType.Json, EResponseType.Text, EResponseType.Binary
	//			validate: { ... },								//	default is undefined; only used with status 200 and EResponseType.Json; for other status codes the validation schema is created implicitly
	//		},					
	//  }
	//
	//	NOTE: any or all fields and the root itself can be undefined or null
    //  NOTE: https://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters
	//	NOTE: setting "mainfest.rest: false" or "mainfest.cli: false" disables the corresponding protocol for the specific command
	static get __manifest()
    {
		return null;
    }

	static __buildFastifySchema(manifest)
	{
		var result =
		{
			body: manifest.rest.validate.body,
			querystring: manifest.rest.validate.querystring,
			params: manifest.rest.validate.params,
			headers: manifest.rest.validate.headers,
			response:
			{
				"400": errorSchema,							//	Bad Request
				"401": errorSchema,							//	Unauthorized (unauthenticated)
				"403": errorSchema,							//	Forbidden (unauthorized)
				"404": errorSchema,							//	Not Found
				"500": errorSchema,							//	Internal Server Error
				"501": errorSchema,							//	Not Implemented
				"502": errorSchema,							//	Bad Gateway
				"503": errorSchema,							//	Service Unavailable
			},
		};

		if (manifest.response.validate)
		{
			if (manifest.response.responseType != EResponseType.Json)
			{
				throw new InvalidOperationException("Response schema is only applicable with manifest.response.responseType == EResponseType.Json.");
			}
			result.response["200"] = manifest.response.validate;		//	OK
		}

		return result;
	}

    static __initializeCliAjv()
    {
		Command.__ajv = new Ajv(
		{
			removeAdditional: true,
			useDefaults: true,
			coerceTypes: true,
			allErrors: true,
		});
    }

    static __initializeCommandCliAjvSchema(commandType)
    {
		Command.__ajv.addSchema(commandType.manifest.cli.validate.json, commandType.key + " json");
		Command.__ajv.addSchema(commandType.manifest.cli.validate.args, commandType.key + " args");
    }

	//	must return CommandResult
	async execute(inboundStream, outboundStream)
    {
        throw new NotImplementedException();
    }
}
