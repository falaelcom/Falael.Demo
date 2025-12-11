//	R0Q3?/daniel/20210809
//  - TODO: transfer from eldyr
//      - request header "x-client-tz" -> "x-client-time-offset"
//      - request header "x-client-id"
//      - request header "x-time-offset"
//      - response header "x-request-id"
//  - TODO: replace the "multipart/form-data" parsing with internal implementations (`Parse.MultipartFormDataParser`, local temp file storage, `Parse:"quoted-printable"`)
//  - TODO: implement graceful stopping as in https://github.com/hunterloftis/stoppable
"use strict";

const { logger, log, guid, config, heap } = require("-/pb/natalis/010/Context.js");
const { _moduleAliases } = require(heap.package.path);

const DebugManifest = require("-/pb/dion/DebugManifest.js");

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");
const Feedback = require("-/pb/natalis/012/Feedback.js");

const Network = require("-/pb/dion/001/Network.js");

const formidable = require("formidable");

const utf8Decoder = new TextDecoder();

module.exports = 
{
    handler: async (req, res) => 
    {
        req.pb = { id: guid() };

        const parts = req.url.split("?");
        const path = parts[0];
        const queryString = new URLSearchParams(parts[1]);

        logger.info(req.pb.id, `HTTP${req.connection.encrypted ? 'S' : ""} ${req.httpVersion}`, req.method, req.url, Network.parseIP(req), req.headers["content-type"] || "-");

        try
        {
            switch(req.method)
            {
                case "GET":
                    switch(path)
                    {
                        case "/v01/ping":
                        {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "text/plain");
                            res.end("OK");
                            return;
                        }
                        case "/pb-debug-manifest.json":
                        {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify(await DebugManifest.build(config.sources["debug-manifest"], _moduleAliases)));
                            return;
                        }
                    }
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Not found");
                    break;
                case "POST":
                    switch(path)
                    {
                        case "/v01/test":
                        {
                            const contentType = req.headers["content-type"]?.split(';')[0];
                            switch(contentType)
                            {
                                case "application/x-www-form-urlencoded":
                                {
                                    const chunks = [];
                                    req.on("data", chunk => chunks.push(utf8Decoder.decode(chunk)));
                                    req.on("end", async () =>
                                    {
                                        try
                                        {
                                            const input = chunks.join("");
                                            const data = new URLSearchParams(input);
                                            const fields = [];
                                            for(const item of data.entries()) fields.push(item);
                                            logger.trace(req.pb.id, "PAYLOAD", fields);
                                            res.statusCode = 200;
                                            res.setHeader("Content-Type", "text/plain");
                                            res.end(JSON.stringify(fields));
                                        }
                                        catch(ex)
                                        {
                                            res.statusCode = 500;
                                            res.setHeader("Content-Type", "text/plain");
                                            res.end("Internal server error.");
                                            throw ex;
                                        }
                                    });
                                    break;
                                }
                                case "multipart/form-data":
                                {
                                    const form = formidable({ multiples: true });
                                    form.parse(req, (err, fields, files) =>
                                    {
                                        if (err)
                                        {
                                            res.statusCode = err.httpCode;
                                            res.setHeader("Content-Type", "text/plain");
                                            res.end(String(err));
                                            return;
                                        }
                                        const payloadJson = JSON.stringify({ fields, files }, null, 2);
                                        logger.trace(req.pb.id, "PAYLOAD", payloadJson);
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.end(payloadJson);
                                    });
                                    break;

                                    //  DIAGNOSTICS CODE
                                    //const sb = [];
                                    //req.on("data", chunk => sb.push(chunk));
                                    //req.on("end", () => 
                                    //{
                                    //    logger.trace(req.pb.id, "PAYLOAD", sb.join("").substr(0, 1024));
                                    //    const fs = require("fs");
                                    //    if(fs.existsSync("multipart-form-data-sample.txt")) fs.truncateSync("multipart-form-data-sample.txt", 0);
                                    //    for(let length = sb.length, i = 0; i < length; ++i) fs.appendFileSync("multipart-form-data-sample.txt", sb[i]);
                                    //    res.statusCode = 415;
                                    //    res.setHeader("Content-Type", "text/plain");
                                    //    res.end("Unsupported media type.");
                                    //});
                                    //break;
                                }
                                default:
                                    res.statusCode = 415;
                                    res.setHeader("Content-Type", "text/plain");
                                    res.end("Unsupported media type.");
                                    break;
                            }
                            return;
                        }
                    }
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Not found");
                    break;
                default:
                    res.statusCode = 405;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Method not allowed.");
                    break;
            }
        }
        catch(ex)
        {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            res.end("Internal server error.");
            throw ex;
        }
    }
};