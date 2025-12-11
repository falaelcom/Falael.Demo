"use strict";

const Utility = require("@framework/Utility.js");
const UUID = require("pure-uuid");

const Exception = require("@shared/Exception.js");
const EErrorToClientPolicy = require("@framework/EErrorToClientPolicy.js");

module.exports =

class DionException extends Exception
{
    constructor(statusCode, code, name, message, innerException)
    {
        super(name, message, innerException);
		this.statusCode = statusCode;
		this.code = code;
		this.exceptionId = new UUID(1).format("std");
    }

	//	policy: EErrorToClientPolicy
	static buildErrorJSON(error, policy)
	{
		let result = null;

		switch (policy)
		{
			case EErrorToClientPolicy.Bare:
				result =
				{
					statusCode: 500,
					error: "Internal server error",
				};
				result.exceptionId = error.exceptionId;
				break;
			default:
				if (error instanceof DionException)
				{
					switch (policy)
					{
						case EErrorToClientPolicy.Normal:
							result =
							{
								statusCode: error.statusCode,
								error: error.name,
								message: error.message || undefined,
								code: error.code,
								exceptionId: error.exceptionId,
							};
							break;
						case EErrorToClientPolicy.Verbose:
							result =
							{
								error: error.name,
								message: error.message || undefined,
							};
							for (var key in error)
							{
								if (key[0] == '_')
								{
									continue;
								}
								switch (key)
								{
									case "name":
									case "innerException":
										break;
									default:
										result[key] = error[key];
										break;
								}
							}
							break;
						default:
							console.error("Not implemented (1).");
							return new Error(500, "Not implemented.");
					}
					if (error.innerException) result.innerException = DionException.buildErrorJSON(error.innerException, policy);
					break;
				}

				switch (policy)
				{
					case EErrorToClientPolicy.Normal:
						result =
						{
							error: error.error,
						};
						break;
					case EErrorToClientPolicy.Verbose:
						result = {};
						Object.assign(result, error);
						result.message = error.message || undefined;
						break;
					default:
						console.error("Not implemented (2).");
						return new Error(500, "Not implemented.");
				}

				result.statusCode = error.statusCode;
				result.error = error.error || "General error";
				result.signature = error.code;
				result.exceptionId = error.exceptionId;
				if (!Utility.Type.isNumber(error.statusCode))
				{
					//	imply statusCode from fastify error details
					if (error.validation)
					{
						result.statusCode = 400;
						result.error = "Request validation failed";
					}
				}

				switch (result.statusCode)
				{
					case 400:
						result.code = 10009;
						break;
					default:
						result.code = 0;
						break;
				}
				break;
		}

		result.statusCode = result.statusCode || 500;
		return result;
	}

	static parseErrorToClientPolicyText(text)
	{
		switch (text)
		{
			case "bare":
				return EErrorToClientPolicy.Bare;
			case "normal":
				return EErrorToClientPolicy.Normal;
			case "verbose":
				return EErrorToClientPolicy.Verbose;
			default:
				console.error("Not implemented (3).");
				return EErrorToClientPolicy.Bare;
		}
	}
}
