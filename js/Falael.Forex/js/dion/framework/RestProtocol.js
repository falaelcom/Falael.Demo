"use strict";

const path = require("path");
const chalk = require("chalk");
const UUID = require("pure-uuid");

const DionException = require("@framework/DionException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const InvalidOperationException = require("@framework/InvalidOperationException.js");
const ResponseTypeException = require("@framework/ResponseTypeException.js");
const RestEndpointException = require("@framework/RestEndpointException.js");

const EHttpMethod = require("@framework/EHttpMethod.js");
const EHttpBodyParserType = require("@framework/EHttpBodyParserType.js");
const EResponseType = require("@framework/EResponseType.js");

const Utility = require("@framework/Utility.js");
const Stream = require("@framework/Stream.js");
const Protocol = require("@framework/Protocol.js");

const CommandRegistry = require("@framework/CommandRegistry.js");
const Command = require("@framework/Command.js");
const CommandData = require("@framework/CommandData.js");
const CommandResult = require("@framework/CommandResult.js");

const LoggerFastifyProxy = require("@framework/LoggerFastifyProxy.js");

module.exports =

class RestProtocol extends Protocol
{
    constructor(commandDirectory, sharedDirectory, clientDirectory)
    {
		super(commandDirectory);

		this.sharedDirectory = sharedDirectory;
		this.clientDirectory = clientDirectory;
    }

	async start(options)
	{
		if (options.verbosity == "full") console.time("[time] REST server initialized in");

		const commandRegistry = new CommandRegistry();
        await commandRegistry.register(this.commandDirectory);
		global.application.commandRegistry = commandRegistry;
        
		const fastify = require("fastify")({ logger: new LoggerFastifyProxy(options.verbosity != "silent") });

		fastify.register(require("fastify-cookie"));
		fastify.register(require("fastify-formbody"));
		fastify.register(require("fastify-compress"), { global: false });
		fastify.register((instance, opts, next) =>
		{
			instance.register(require("fastify-static"),
			{
				root: path.join(__dirname, "..", this.sharedDirectory),
				prefix: "/engine/shared/",
			})
			return next();
		});
		fastify.register((instance, opts, next) =>
		{
			instance.register(require("fastify-static"),
			{
				root: path.join(__dirname, "../..", this.clientDirectory),
				prefix: "/",
			})
			return next();
		});
		//fastify.register(require("fastify-static"),
		//{
		//	root: path.join(__dirname, "..", this.sharedDirectory),
		//	prefix: "/engine/shared/",
		//})

		const fastilyMulter = require("fastify-multer");
		const fastifyUploader = fastilyMulter(
		{
			dest: "httpupload/",

			//	https://github.com/fox1t/multer
			//	https://github.com/mscdex/busboy#busboy-methods
			limits:
			{
				fieldNameSize: void (0),		//	Max field name size, default: 100 bytes
				fieldSize: void (0),			//	Max field value size, default: 1MB
				fields: void (0),				//	Max number of non-file fields, default: Infinity
				fileSize: void (0),				//	For multipart forms, the max file size (in bytes), default: Infinity
				files: void (0),				//	For multipart forms, the max number of file fields, default: Infinity
				parts: void (0),				//	For multipart forms, the max number of parts (fields + files), default: Infinity
				headerPairs: void (0),			//	For multipart forms, the max number of header key=>value pairs to parse, default: 2000
			},
		});
		fastify.register(fastilyMulter.contentParser);

		fastify.addHook("onRequest", (request, reply, done) =>
		{
			reply.res.id = request.id;
			return done();
		});
		fastify.addContentTypeParser("application/octet-stream", function (request, done)
		{
			const stream = new Stream(request);
			return done(null, stream);
		});

		this._createFastifyRoutes(fastify, options, commandRegistry, fastifyUploader);

		fastify.setErrorHandler(function (error, request, reply)
		{
			error.exceptionId = new UUID(1).format("std");

			if (!error.___logged)
			{
				logger.error(110002, error);
			}
			else
			{
				delete error.___logged;
			}

			const json = DionException.buildErrorJSON(error, DionException.parseErrorToClientPolicyText(global.config.server.errorToClientPolicy));
			reply
				.code(json.statusCode)
				.type("application/json")
				.send(json);
		})

		logger.info(chalk`{magentaBright Starting REST server}:`);
		fastify.listen(global.config.server.listenOnPort, global.config.server.listenOnIp, (err, address) =>
		{
			if (err) logger.error(err);
		});

		if (options.verbosity == "full") console.timeEnd("[time] REST server initialized in");
	}

	//	result.fields will be initialized by cascading the following dictionaries (fields in later buckets will overwrite fields with the same name from earlier buckets):
	//	- request.params
	//	- request.query
	//	- request.body
	//	NOTE: there is no way to propagate to a command two fields with the same field name residing in different buckets; if a request must process for Ex. a query string field "id"
	//		and a post form field "id", instead of using commands a fastify route must be added directly
	//	returns CommandData
    async parse(commandManifest, request)
    {
		const result = new CommandData();

		Object.assign(result.fields, request.params);
		Object.assign(result.fields, request.query);

		switch (commandManifest.rest.bodyParserType)
		{
			case EHttpBodyParserType.None:
				break;
			case EHttpBodyParserType.Json:
				result.document = request.body;
				break;
			case EHttpBodyParserType.Stream:
				break;
			case EHttpBodyParserType.Form:
				Object.assign(result.fields, request.body);
				break;
			case EHttpBodyParserType.FormMultipart:
				if (request.files)
				{
					for (let length = request.files.length, i = 0; i < length; ++i)
					{
						var item = request.files[i];
						result.files.push(
						{
							namespace: item.fieldname,
							name: item.originalname,
							path: item.path,
							size: item.size,
						});
					}
				}
				Object.assign(result.fields, request.body);
				break;
			default:
				throw new NotImplementedException();
		}

		return result;
    }

	getInboundStream(commandManifest, inboundStream)
	{
		switch (commandManifest.rest.bodyParserType)
		{
			case EHttpBodyParserType.None:
			case EHttpBodyParserType.Json:
			case EHttpBodyParserType.Form:
			case EHttpBodyParserType.FormMultipart:
				return null;
			case EHttpBodyParserType.Stream:
				return inboundStream;
			default:
				throw new NotImplementedException();
		}
	}

	reply(commandManifest, commandResult, fastifyReply)
	{
		var result = commandResult.value;
		switch (commandManifest.response.responseType)
		{
			case EResponseType.None:
				if (!Utility.Type.isNU(result))
				{
					throw new ResponseTypeException("null or undefined");
				}
				fastifyReply.code(204);
				fastifyReply.send();
				break;
			case EResponseType.Json:
				if (!Utility.Type.isJson(result))
				{
					throw new ResponseTypeException("json");
				}
				if (!commandManifest.response.validate)
				{
					throw new InvalidOperationException("Response schema is required with EResponseType.Json");
				}
				if (commandManifest.response.compressed)
				{
					fastifyReply.compress(result);
				}
				else
				{
					fastifyReply.send(result);
				}
				break;
			case EResponseType.Text:
				if (!Utility.Type.isString(result))
				{
					throw new ResponseTypeException("string");
				}
				if (commandManifest.response.compressed)
				{
					fastifyReply.compress(result);
				}
				else
				{
					fastifyReply.send(result);
				}
				break;
			case EResponseType.Binary:
				var className = Utility.Type.getClass(result);
				switch (className)
				{
					case "Buffer":
					case "ReadStream":
						break;
					default:
						throw new ResponseTypeException("Buffer or ReadStream");
				}
				if (commandManifest.response.compressed)
				{
					fastifyReply.compress(result);
				}
				else
				{
					fastifyReply.send(result);
				}
				break;
			case EResponseType.Stream:
				fastifyReply.send();
				break;
			default:
				throw new NotImplementedException();
		}
	}

	_createFastifyRoutes(fastify, options, commandRegistry, fastifyUploader)
	{
		logger.debug(chalk`{magentaBright REST endpoints}:`);

		const col = commandRegistry.commandList;
		for (let length = col.length, i = 0; i < length; ++i)
		{
			const item = col[i];

			if (!item.commandType.manifest.rest)
			{
				continue;
			}

			function printRestEndpoint(restPath, methodName)
			{
				const methodSignature = ('[' + methodName + ']').padEnd(7, ' ');
				logger.debug(chalk`{yellowBright ${methodSignature}} ${restPath}`);
			}

			async function endpointHandler(request, reply)
			{
				try
				{
					const commandData = await this.parse(item.commandType.manifest, request);
					const inboundStream = await this.getInboundStream(item.commandType.manifest, request.body);
					const outboundStream = await this.getOutboundStream(item.commandType.manifest, reply.res);

					const commandResult = await new item.commandType(commandData).execute(inboundStream, outboundStream);

					this.reply(item.commandType.manifest, commandResult, reply);
				}
				catch (ex)
				{
					logger.error(110001, ex);
					ex.___logged = true;
					return new RestEndpointException(item.key, ex);
				}
			}

			//  HTTP methods: https://www.w3schools.com/tags/ref_httpmethods.asp
			//  fastify file upload: https://www.npmjs.com/package/fastify-file-upload, https://github.com/fastify/fastify-multipart, http://derpturkey.com/node-multipart-form-data-explained/
			//  fastify plugin list: https://www.fastify.io/ecosystem/
			switch (item.commandType.manifest.rest.method)
			{
				case EHttpMethod.Get:
					printRestEndpoint(item.key, "get");
					fastify.get(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
					break;
				case EHttpMethod.Post:
					printRestEndpoint(item.key, "post");
					switch (item.commandType.manifest.rest.bodyParserType)
					{
						case EHttpBodyParserType.FormMultipart:
							fastify.route(
							{
								method: 'POST',
								url: item.key,
								schema: Command.__buildFastifySchema(item.commandType.manifest),
								preHandler: fastifyUploader.array("upload"),
								handler: endpointHandler.bind(this),
							});
							break;
						default:
							fastify.post(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
							break;
					}
					break;
				case EHttpMethod.Put:
					printRestEndpoint(item.key, "put");
					fastify.put(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
					break;
				case EHttpMethod.Delete:
					printRestEndpoint(item.key, "delete");
					fastify.delete(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
					break;
				case EHttpMethod.Head:
					printRestEndpoint(item.key, "head");
					fastify.head(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
					break;
				case EHttpMethod.Options:
					printRestEndpoint(item.key, "options");
					fastify.options(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
					break;
				case EHttpMethod.Patch:
					printRestEndpoint(item.key, "patch");
					fastify.patch(item.key, { schema: Command.__buildFastifySchema(item.commandType.manifest) }, endpointHandler.bind(this));
					break;
			}
		}
	}
}
