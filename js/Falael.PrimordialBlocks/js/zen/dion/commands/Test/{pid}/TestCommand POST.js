//	R0Q3?/daniel/20211013
//	- TODO: add `input.xml: string` (XML schema for XML request bodies) and `output.xml: string` (XML schema for XML response bodies)
"use strict";

const { logger, log, guid, heap } = require("-/pb/natalis/010/Context.js");

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

//	CLI
//
//		node app [POST] /Test/123/Test --header="content-type: application/json" --header="x-my-header: 1" --trailer="x-md5hash: mhfgk4u523534y5" -j "{ ""name"": ""test1"", ""age"": 20, ""deceased"": false, ""address"": { ""object"": { ""city"": ""sofia"", zip: ""1000"" } } }" -- --qid=1
//	
//	CLI auth is done by the app/router with additional interpretation of command line arguments and custom implementation (the `--auth`, `--psk` and `--sid` options are not a standard part of the command CLI protocol):
//
//		node app [POST] /Do/Something/That/Requires/AuthHeader/Or/Session/Cookie --auth=daniel@falael.com:password
//		node app [POST] /Do/Something/That/Requires/AuthHeader/Or/Session/Cookie --psk=presharedAppSecret
//		node app [POST] /Do/Something/That/Requires/AuthHeader/Or/Session/Cookie --sid=sessionId
//
const schema =
{
	input:
	{
		//	`params: {}`
		//	command path params, e.g. in `Test/{pid}/Test`, `pid` is a parm name, and in `Test/122/Test`, `122` is a param value
		//	also `Test/{pid}/{paramname}`, where `params.paramname === "/any/further/path/here"`
		params: { pid: "" },

		//	`query: {}`
		//	- for REST - query string fields
		//	- for CLI (merged in that order)
		//		- via multiple options (`--query="qid=1"`)
		//		- via multiple long options following the operand list marker (`-- --qid=1`)
		query: { qid: "" },

		//	- for REST - all request HTTP headers (`req.rawHeaders`)
		//	- for CLI - via multiple options (--header="content-type: application/json")
		//	- alternative schemas are available for every header's value:
		//		- `""`, `{string: 1}` - the value of the `context.headers` header-property will be set to the value from the first occurrence of the header; subsequent headers with the same name will cause a validation error
		//		- `{string: 1, also: void 0}` - as previous, but will validate a missing header, in which case the `context.headers` header-property will be ommitted
		//		- `[""]`, `{array: {string: 1}}` - the value of the `context.headers` header-property will be set to an array of the values of all occurrences of the header
		//		- `{array: {string: 1}, also: void 0}` - as previous, but will validate a missing header, in which case the `context.headers` header-property will be ommitted
		//		- `{also: "<value>"}` - will validate the header only if its value matches exactly `"<value>"`
		headers: { objex: { "content-type": { also: "multipart/form-data" }, "x-client-timezone": [""] } },

		//	`cookies: {}`
		//	- for REST - all cookie headers, parsed
		//	- for CLI - via one option (--cookies="NAME=VALUE; NAME=VALUE;...")
		//	- https://stackoverflow.com/questions/1969232/what-are-allowed-characters-in-cookies
		//	- https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
		//	- https://curl.se/rfc/cookie_spec.html
		cookies: { objex: { sessionid: "" } },

		stream:
		{
			//	`form: {}` - for "application/x-www-form-urlencoded" and "multipart/form-data" bodies - schema for form fields, including file uploads
			//	- for REST, the request body
			//	- for CLI (merged in that order)
			//		- via `stdin` 
			//		- via multiple options (--form="qid=1")
			//		- via multiple vendor-reserved options preceding or following the operand list marker (`-Wqid=1`, `-- -Wqid=1`)
			//		- via multiple the `-f, --file` option (`--file="/etc/issue"`) for file uploads
			//	- in schema, recognize file upload fields by `match: "file"`
			//	- for bodies other than of mime type "application/x-www-form-urlencoded" and "multipart/form-data" - ommitted.
			//	- `json` and `form` are mutually exclusive
			form: { name: "", age: 0, deceased: true, address: "", myfileupload: { match: "file" } },

			//	`json: *` - for "application/json" bodies - schema for deserialized JSON; 
			//	- for REST, the request body
			//	- for CLI (merged in that order via Object.assign(stdinJson, jOptionJson1, jOptionJson2,..., {viaVendorReserved_name:viaVendorReserved_value, ...}))
			//		- via `stdin` 
			//		- via multiple `--json, -j` options (--json="{""var"":1}")
			//		- via multiple vendor-reserved options preceding or following the operand list marker (`-Wqid=1`, `-- -Wqid=1`)
			//	- for bodies other than of mime type "application/json" - ommitted.
			//	- `json` and `form` are mutually exclusive
			json: { name: "", age: 0, deceased: true, address: { object: { city: "", zip: "" } }, myfileupload: { match: "file" } },
		},
	},
	output:
	{
		//	`headers: {}`
		//	- for REST - all response headers specified in this dictionary will be written to the response stream
		//	- for CLI - all headers specified in this dictionary will be written to `stdout`
		//	- alternative schemas are available for every header:
		//		- ``""`, {string: 1}` - a single occurrence of the header
		//		- `{string: 1, also: void 0}` - as previous, but will validate an ommitted header, in which case the header will be ommitted also from the response/output, unless the header is `"set-cookie"` and there's a
		//			`"set-cookie"` header generated automatically from the `output.cookies` collection
		//		- `[""]`, `{array: {string: 1}}` - multiple occurrences of the header; an empty array is accepted, in which case the header will be ommitted from the response/output, unless the header is `"set-cookie"` and there's a
		//			`"set-cookie"` header generated automatically from the `output.cookies` collection
		//		- `{array: {string: 1}, also: void 0}` - as previous, but will validate also an ommitted header, in which case the header will be ommitted also from the response/output, unless the header is `"set-cookie"` and 
		//			 there's a `"set-cookie"` header generated automatically from the `output.cookies` collection
		//		- `{also: "<value>"}` - will validate the header only if its value matches exactly `"<value>"`
		//		- validation is performed AFTER the `output.cookies` collection has added it's headers to the response/output
		headers: { "x-client-timezone": "" },
		//	`trailers: {}`
		//	- for REST - all trailers specified in this dictionary will be written to the response stream
		//	- for CLI - all trailers specified in this dictionary will be written to `stdout`
		//	- alternative schemas are available for every trailer:
		//		- ``""`, `{string: 1}` - a single occurrence of the trailer
		//		- `{string: 1, also: void 0}` - as previous, but will validate an ommitted trailer, in which case the trailer will be ommitted also from the response/output
		//		- `[""]`, `{array: {string: 1}}` - multiple occurrences of the trailer; an empty array is accepted, in which case the trailer will be ommitted from the response/output
		//		- `{array: {string: 1}, also: void 0}` - as previous, but will validate also an ommitted trailer, in which case the trailer will be ommitted also from the response/output
		//		- `{also: "<value>"}` - will validate the trailer only if its value matches exactly `"<value>"`
		trailers: { "x-md5hash": "" },
		//	`cookies: {}`
		//	- all cookies will be serialized via `"Set-Cookie"` headers and added to the reponse/output, overwriting any previous cookies with the same cookie-name,
		//		domain-value and path-value that have been set in the `output.headers` collection.
		cookies: { sessionid: {} },

		stream:
		{
			//	`json: *` - for "application/json" bodies
			//	- if present - schema for a JSON response;
			//	- for bodies other than of mime type "application/json" - ommitted.
			json:
			{
				alt:
				[
					{ rid: "" },
					{ error: { dictionary: { ncode: 0, message: "" } } },
				]
			}
		}
	}
};

//	Parameter: `context: Command.Context` - a general purpose object holding modules like `auth`
//		`context.auth`:
//		`
//			...
//			const { sid, psk } = require("-/pb/dion/00X.Security.js");
//			const headers_out = {}, cookies_out = {};
//			context.auth = 
//			{
//				headers: headers_out,
//				cookies: cookies_out,
//				sid: cookies_in => sid(cookies_in, cookies_out),
//				psk: headers_in => sid(headers_in, headers_out),
//			};
//			...
//		`
//	Parameter: `input: Command.Input` - a wrapper around nodejs request/CLI options and stdin
//	Parameter: `output: Command.Output` - a wrapper around nodejs response/CLI stdout
async function execute(context, input, output)
{
	//	`parseHeaders` - fully parse headers and validate headers and cookies
	const {headers, cookies} = input.parseHeaders(schema);

	const principal_sid = await context.auth.sid({cookies}).throwRequire("some.permission", "some.further.permission");
	const principal_psk = await context.auth.psk({headers}).throwRequire("some.other.permission");

	//	`parseUrl` - fully parse the url and validate params and query
	const {path, params, query} = input.parseUrl(schema);

	{	//	for a "application/x-www-form-urlencoded" body
		//	`input.parseBody` - fully consume, parse and validate the complete "application/x-www-form-urlencoded" body
		const {fields} = await input.parseBody(headers, schema);
	}
	{	//	for a "multipart/form-data" body
		//	`input.parseBody` - fully consume, parse and validate the complete "multipart/form-data" body
		//		- an implementation is possible where the validation is done as early as possible during parsing; validation failure stops parsing
		const {files, fields} = await input.parseBody(headers, schema);
	}
	{	//	for a "application/json" body
		//	`input.parseBody` - fully consume, parse and validate the complete "application/json" body
		//		- an implementation is possible where the validation is done as early as possible during parsing; validation failure stops parsing
		const {json} = await input.parseBody(headers, schema);
	}
	{	//	for a "multipart/form-data" body - in chunks
		const fields = {}, files = [];
		//	`input.parseNext` - consume, parse and validate the "multipart/form-data" body in chunks (emits field- and file entities)
		//		- an implementation is possible where the validation is done as early as possible during parsing; validation failure stops parsing
		for(const item of await input.parseNext(headers, schema))
		{
			switch(item.type)
			{
				case Command.Field: fields.push({name: item.name, value: item.value}); continue;
				case Command.File: files.push({name: item.name, chunks: [item.value], fileName: item.fileName}); continue;
				case Command.FileChunk: files[files.length - 1].chunks.push(item.value); continue;
				case Command.EOI: break;
				default: throw new Exception(0x00, `Not implemented.`);
			}
			break;
		}
	}
	{
		output.writeHeaders({ headers: {}, cookies: {} }, context.auth.headers, context.auth.cookies, schema);
		output.write({ abc: 1 }, schema);
		output.writeTrailers({ xyz: 1 }, schema);
	}
}

module.exports = { schema, execute };
