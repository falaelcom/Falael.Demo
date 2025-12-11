"use strict";

include("StdAfx.js");

include("framework/http/EHttpMethod.js");
include("framework/http/EHttpBodyParserType.js");
include("framework/http/EResponseType.js");

include("framework/http/DionClientError.js");
include("framework/http/DionJsonSyntaxError.js");
include("framework/http/DionHttpError.js");
include("framework/http/DionValidateError.js");
include("framework/http/DionJsonSerializationError.js");

class DionClient
{
	constructor(par)
	{
		this._serverUrl = par.serverUrl;

		this._commandList = null;

		this._ajv = new Ajv();
	}

	async loadCommands()
	{
		var result = await this.__request(
		{
			url: this._serverUrl + "/Manifest/ListCommands",
			method: EHttpMethod.Get,
		});

		this._commandList = JSON.parse(result);

		for (var length = this._commandList.length, i = 0; i < length; ++i)
		{
			let item = this._commandList[i];

			let validateRequestBody = null;
			let validateRequestQuerystring = null;
			let validateRequestParams = null;
			let validateRequestHeaders = null;
			switch (item.requestType)
			{
				case EHttpBodyParserType.Json:
				case EHttpBodyParserType.Form:
				case EHttpBodyParserType.FormMultipart:
					if (item.requestValidate.body) validateRequestBody = this._ajv.compile(item.requestValidate.body);
					if (item.requestValidate.querystring) validateRequestQuerystring = this._ajv.compile(item.requestValidate.querystring);
					if (item.requestValidate.params) validateRequestParams = this._ajv.compile(item.requestValidate.params);
					if (item.requestValidate.headers) validateRequestHeaders = this._ajv.compile(item.requestValidate.headers);
					break;
				case EHttpBodyParserType.None:
				case EHttpBodyParserType.Stream:
					break;
				default:
					throw "Not implemented.";
			}
			let validateResponse = null;
			switch (item.responseType)
			{
				case EResponseType.Json:
					if (item.responseValidate) validateResponse = this._ajv.compile(item.responseValidate);
					break;
				case EResponseType.None:
				case EResponseType.Text:
				case EResponseType.Binary:
				case EResponseType.Stream:
					break;
				default:
					throw "Not implemented.";
			}

			var parts = item.path.split('/');
			var obj = this;
			for (var jlength = parts.length, j = 1; ; ++j)	//	j = 1 ignores the frst part which is always "" because of the leading '/' in thepath string
			{
				var jitem = parts[j];
				var nested = obj[jitem];
				if (j == jlength - 1)
				{
					obj[jitem] = async function (par)
					{
						return await this._executeCommand(item, par || {}, validateResponse);
					}.bind(this);
					obj[jitem].validateRequest = function (par)
					{
						return this._validateCommandRequest(item, par || {}, validateRequestBody, validateRequestQuerystring, validateRequestParams, validateRequestHeaders);
					}.bind(this);
					break;
				}
				if (!nested)
				{
					nested = {};
					obj[jitem] = nested;
				}
				obj = nested;
			}
		}
	}

	async __request(par)
	{
		var url = par.url;						//	string
		var method = par.method;				//	EHttpMethod
		var body = par.body;					//	object
		var querystring = par.querystring;		//	object
		var filter = par.filter;				//	object
		var headers = par.headers;				//	object

		var methodName = EHttpMethod.toString(method);
		var querystringText = DionClient.buildQueryString(querystring, filter);
		var fullUrl = querystringText.length ? url + '?' + querystringText : url;

		return new Promise(function (resolve, reject)
		{
			var request = new XMLHttpRequest();
			request.open(methodName, fullUrl, true);
			if (headers)
			{
				for (var key in headers)
				{
					request.setRequestHeader(key, headers[key]);
				}
			}
			request.onreadystatechange = function ()
			{
				if (request.readyState == 4 || request.readyState == 0)
				{
					if (request.status == "200")
					{
						return resolve(request.responseText);
					}
					else
					{
						return reject(
						{
							readyState: request.readyState,
							status: request.status,
							response: request.responseText,
						});
					}
				}
			};
			request.send(body);
		});
	}


	static addParam(name, value)
	{
		DionClient._currentParams[name] = value;
		return ':' + name;
	}

	static applyParams(path, fields)
	{
		var result = [];
		var parts = path.split('/');
		for (var jlength = parts.length, j = 1; j < jlength; ++j)	//	j = 1 ignores the frst part which is always "" because of the leading '/' in thepath string
		{
			var jitem = parts[j];
			if (jitem.indexOf(':') != 0)
			{
				result.push(jitem);
				continue;
			}
			result.push(encodeURIComponent(fields[jitem.substr(1)] || ""));
		}
		return '/' + result.join('/');
	}

	static buildQueryString(fields, filter)
	{
		if (!fields && !filter)
		{
			return "";
		}
		var result = [];
		const filterJson = JSON.stringify(filter || {});
		if (filterJson.length > DionClient._resultFilterJSON_maxLength) throw "Limit exceeded.";
		for (var key in fields)
		{
			result.push(encodeURIComponent(key) + '=' + encodeURIComponent(fields[key]));
		}
		result.push(encodeURIComponent(DionClient._resultFilterJSON_queryStringKey) + '=' + encodeURIComponent(filterJson));
		return result.join('&');
	}


	async _executeCommand(item, par, validateResponse)
	{
		var body = par.body;					//	object
		var querystring = par.querystring;		//	object
		var headers = par.headers;				//	object
		var filter = par.filter;				//	object
		var params = DionClient._currentParams;
		DionClient._currentParams = {};

		var url = this._serverUrl + DionClient.applyParams(item.path, params);
		var method = item.httpMethod;

		var result =
		{
			success: false,
			errors: [],
			value: null,
		};

		var response = null;

		switch (item.requestType)
		{
			case EHttpBodyParserType.None:
				try
				{
					response = await this.__request(
					{
						url: url,
						method: method,
						body: null,
						querystring: querystring,
						headers: headers,
						filter: filter, 
					});
				}
				catch (ex)
				{
					result.errors.push(new DionHttpError(ex.status, ex.response, ex.readyState, "Request failed."));
					return result;
				}
				break;
			case EHttpBodyParserType.Json:
				var jsonText = null;
				try
				{
					jsonText = JSON.stringify(body);
				}
				catch (ex)
				{
					result.errors.push(new DionJsonSerializationError(body, "Unable to serialize request payload."));
					return result;
				}

				var fullHeaders = Object.assign(
				{
					"Content-Type": "application/json;charset=UTF-8",
				}, headers);
				try
				{
					response = await this.__request(
					{
						url: url,
						method: method,
						body: jsonText,
						querystring: querystring,
						headers: fullHeaders,
						filter: filter, 
					});
				}
				catch (ex)
				{
					result.errors.push(new DionHttpError(ex.status, ex.response, ex.readyState, "Request failed.", ex));
					return result;
				}
				break;
			case EHttpBodyParserType.Form:
			case EHttpBodyParserType.FormMultipart:
			case EHttpBodyParserType.Stream:
				throw "Not implemented.";
			default:
				throw "Not implemented.";
		}

		switch (item.responseType)
		{
			case EResponseType.Json:
				var json;
				try
				{
					json = JSON.parse(response);
				}
				catch (ex)
				{
					result.errors.push(new DionJsonSyntaxError(response, "Unable to parse response.", ex));
					return result;
				}
				if (validateResponse && !validateResponse(json))
				{
					result.errors = result.errors.concat(DionValidateError.fromAjvErrors("Validation of response failed.", validateResponse.errors));
					return result;
				}
				result.value = json;
				break;
			case EResponseType.Text:
				result.value = response;
				break;
			case EResponseType.None:
				break;
			case EResponseType.Binary:
			case EResponseType.Stream:
				throw "Not implemented.";
			default:
				throw "Not implemented.";
		}

		result.success = true;
		return result;
	}

	_validateCommandRequest(item, par, validateRequestBody, validateRequestQuerystring, validateRequestParams, validateRequestHeaders)
	{
		var body = par.body;					//	object
		var querystring = par.querystring;		//	object
		var headers = par.headers;				//	object

		var params = DionClient._currentParams;
		DionClient._currentParams = {};

		var errors = [];

		if (validateRequestHeaders && !validateRequestHeaders(headers)) errors = errors.concat(DionValidateError.fromAjvErrors("Validation of request headers failed.", validateRequestHeaders.errors));
		if (validateRequestParams && !validateRequestParams(params)) errors = errors.concat(DionValidateError.fromAjvErrors("Validation of request params failed.", validateRequestParams.errors));
		if (validateRequestQuerystring && !validateRequestQuerystring(querystring)) errors = errors.concat(DionValidateError.fromAjvErrors("Validation of request query string failed.", validateRequestQuerystring.errors));
		if (validateRequestBody && !validateRequestBody(body)) errors = errors.concat(DionValidateError.fromAjvErrors("Validation of request body failed.", validateRequestBody.errors));

		return {
			success: !errors.length,
			errors: errors
		};
	}


	get ready()
	{
		return this._commandList !== null;
	}
}

DionClient._currentParams = {};
DionClient._resultFilterJSON_maxLength = 32767;
DionClient._resultFilterJSON_queryStringKey = "_rf_";

