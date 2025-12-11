"use strict";

const NotImplementedException = require("@framework/NotImplementedException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EResponseType = require("@framework/EResponseType.js");

module.exports =

class Protocol
{
    constructor(commandDirectory)
    {
		this.commandDirectory = commandDirectory;
    }

	async start(options)
	{
        throw new NotImplementedException();
	}

    //  parses the inbound data and returns a unified CommandData object
	//	NOTE: the stream property must be set only if commandManifest.rest.bodyParserType == EHttpBodyParserType.Stream
	//	NOTE: the fields property must be always initialized
	//	NOTE: the stream property must be set only if commandManifest.rest.bodyParserType == EHttpBodyParserType.Stream
	async parse(commandManifest, data)
    {
        throw new NotImplementedException();
    }

	//	makes sure that the inbound stream will be available only with the appropriate body type
	getInboundStream(commandManifest, outboundStream)
	{
		throw new NotImplementedException();
	}

	//	makes sure that the output stream will be available only for EResponseType.Stream
	getOutboundStream(commandManifest, outboundStream)
	{
		switch (commandManifest.response.responseType)
		{
			case EResponseType.None:
			case EResponseType.Json:
			case EResponseType.Text:
			case EResponseType.Binary:
				return null;
			case EResponseType.Stream:
				return outboundStream;
			default:
				throw new NotImplementedException();
		}
	}

	//	sends the result of a command to the output channel
	reply(commandManifest, commandResult, channel)
	{
        throw new NotImplementedException();
	}
}
