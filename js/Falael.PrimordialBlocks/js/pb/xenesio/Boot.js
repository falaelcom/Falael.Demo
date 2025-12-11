//	R0Q3/daniel/20210506
//		- more code to come
//		- allow for the server to provide timestamps for cache invalidation instead of using newUUID()
//		- DOC: global.require.resolve, !!! routes
"use strict"; if (typeof window === "undefined") throw new Error(`Unsupported runtime.`);

//	File: This file prepares the web browser for consuming xenesio and natalis code. The following tasks are performed in this file:
//		- Adds a NodeJS-compliant `global` variable to the browser's global scope as an alias to `window`.
//		- Adds a NodeJS-compliant `require` method to the browser's global scope.
//		- Applies the known `"global::"` meta tags to the global object (`window`). Applies type conversion where applicable. The following meta tag names are supported:
//			- `PB_DEBUG: boolean` (`<meta name="global::PB_DEBUG" content="true" />`) - If set to `true` enforces the execution of all debugging code throught the framework, otherwise the debugging code will not executed; runtime value validations for global variables and function arguments are the primary facility used for debugging by Primordial Blocks.
//		- !!! routes
//	Usage:
//	```
//		<meta name="boot::ROUTE" rel="-/pb/natalis" content="natalis" />
//		<meta name="boot::ROUTE" rel="-/pb/xenesio" content="xenesio" />
//		<meta name="boot::ROUTE" rel="-/zen/natalis" content="natalis" />
//		<meta name="boot::ROUTE" rel="-/zen/xenesio" content="xenesio" />
//		<meta name="boot::PB_DEBUG_MANIFEST" content="/pb-debug-manifest.json" />
//
//		<meta name="global::PB_DEBUG" content="true" />
//	
//		<script src="xenesio/Boot.js" type="text/javascript"></script>
//	```

if ("module" in window) throw new Error(`Unsupported runtime.`);
if ("require" in window) throw new Error(`Unsupported runtime.`);
if ("global" in window) throw new Error(`Unsupported runtime.`);

window.global = window;

(function ()
{
	//	Function: Loads the file specified by the `path` parameter and returns `module.exports`, effectively simulating the behavior of the NodeJs `require` function.
	//		Additionally, this function always appends a random token to the query string sent to the server along with the request, preventing stale code from being loaded from the browser's cache.
	//		This behavior is usefult during development. The `require` function is not intended for use in production environments where a single file containing concatenated, minified code must be used instead.
	//	Parameter: `path: string` - the path to the JavaScript code file. If the file extension is not `".js"`, `".js"` will be appended to the `path` value before loading the file.
	//	Returns: Returns the `module.exports` object adjusted by the loaded code.
	//	Remarks: Because of its nature, this function is by design not covered by unit tests.
	//	Requires: Global variable `PB_DEBUG: boolean`.
	//	Requires: Global variable `PB_BASEURL: string`.
	//	See also: https://stackoverflow.com/a/19625245/4151043
	global.require = function (path)
	{
		if (PB_DEBUG)
		{
			if ((!path && path !== "") || path.constructor !== String) throw new Error(`0x9E7B73 Argument is invalid: "path".`);
		}

		const url = require.resolve(path);
		
		if (!global.require.__cache) global.require.__cache = {};
		let exports = global.require.__cache[url];
		if (exports) return exports;
		exports = {};

		let requestUuid = null;
		if (global.require.__debugManifest) requestUuid = global.require.__debugManifest.f[global.require.__debugManifest.aliases[path] || path];
		if (!requestUuid) requestUuid = newUUID();

		const request = new XMLHttpRequest();
		request.open("GET", url + "?" + requestUuid, false);	//	synchronous request
		request.send();

		switch (request.status)
		{
			case 200: break;
			default: throw new Error("0x216879 " + request.statusText + ": \"" + path + "\", \"" + url + "?" + requestUuid + "\"");
		}
		let text = request.responseText;

		// if saved form for Chrome Dev Tools
		if (text.substr(0, 10) === "(function(")
		{
			let moduleStartAt = text.indexOf("{");
			const moduleEndAt = text.lastIndexOf("})");
			let moduleCommentAt = text.indexOf("//@ ");
			if (moduleCommentAt === -1) moduleCommentAt = text.indexOf("//# ");
			if (moduleCommentAt > -1 && moduleCommentAt < moduleStartAt + 6) moduleStartAt = text.indexOf("\n", moduleCommentAt);
			text = text.slice(moduleStartAt + 1, moduleEndAt - 1);
		}
		// add comment to show source on Chrome Dev Tools
		text = "//# sourceURL=" + global.location.origin + "/" + path + "\n" + text;

		const module = { id: url, uri: url, exports };
		const fn = new Function("require", "exports", "module", text);
		fn(global.require, exports, module);
		global.require.__cache[url] = module.exports;

		return module.exports;
	}

	global.require.resolve = function (path)
	{
		if (PB_DEBUG)
		{
			if ((!path && path !== "") || path.constructor !== String) throw new Error(`0xC59F32 Argument is invalid: "path".`);
		}

		if (global.require.__debugManifest) path = global.require.__debugManifest.aliases[path] || path;

		let url = path;
		for(let length = bootRoutes.length, i = 0; i < length; ++i)
		{
			const item = bootRoutes[i];
			url = url.replace(item.prefix, item.path);
		};

		return url;
	}

	global.require.resource = async function (path)
	{
		if (PB_DEBUG)
		{
			if ((!path && path !== "") || path.constructor !== String) throw new Error(`0xCB1393 Argument is invalid: "path".`);
		}
		
		const url = require.resolve(path);

		if (!global.require.__cache) global.require.__cache = {};
		const outcome = global.require.__cache[url];
		if (outcome)
		{
			if (outcome.constructor === String) return outcome;
			if (outcome.constructor === Promise) return await outcome;
		}
		
		const promise = new Promise((resolve, reject) =>
		{
			fetch(url + "?" + newUUID()).then(response =>
			{
				if (!response.ok) reject(new Error(`HTTP Error ${response.status} ${response.statusText}.`));
				response.text().then(resolve);
			});
		});
		global.require.__cache[url] = promise;
		try
		{
			const text = await promise;
			global.require.__cache[url] = text;
			return text;
		}
		catch(ex)
		{
			delete global.require.__cache[url];
			throw ex;
		}
	}

	const tag_PB_DEBUG = document.querySelector("meta[name*='global::PB_DEBUG']");
	global.PB_DEBUG = tag_PB_DEBUG ? (tag_PB_DEBUG.getAttribute("content") === "true") : true;

	const bootRoutes = [];
	const tags_boot_ROUTE = document.querySelectorAll("meta[name*='boot::ROUTE']");
	for (let length = tags_boot_ROUTE.length, i = 0; i < length; ++i) 
	{
		const item = tags_boot_ROUTE[i];
		bootRoutes.push(
		{
			prefix: item.getAttribute("rel"),
			path: item.getAttribute("content"),
		});
	}

	const tag_PB_DEBUG_MANIFEST = document.querySelector("meta[name*='boot::PB_DEBUG_MANIFEST']");
	const debugManifestEndpoint = tag_PB_DEBUG_MANIFEST && tag_PB_DEBUG_MANIFEST.getAttribute("content");
	if (debugManifestEndpoint !== null && debugManifestEndpoint !== void 0)
	{
		if (PB_DEBUG) console.log("[DebugManifest]", loadDebugManifest(debugManifestEndpoint));
		else loadDebugManifest(debugManifestEndpoint);
	}

	function loadDebugManifest(endpoint)
	{
		if (PB_DEBUG)
		{
			if ((!endpoint && endpoint !== "") || endpoint.constructor !== String) throw new Error(`0x8732E6 Argument is invalid: "endpoint".`);
		}

		if (global.require.__debugManifest !== void 0) return global.require.__debugManifest;

		const request = new XMLHttpRequest();
		request.open("GET", require.resolve(endpoint) + "?" + newUUID(), false);	//	synchronous request
		request.send();

		switch (request.status)
		{
			case 200: break;
			default:
				global.require.__debugManifest = null;
				console.error("[DebugManifest]", request.statusText);
				return null;
		}
		try
		{
			global.require.__debugManifest = JSON.parse(request.responseText);
		}
		catch (ex)
		{
			global.require.__debugManifest = null;
			console.error("[DebugManifest]", ex);
			return null;
		}

		switch (global.require.__debugManifest.v)
		{
			case 1:
				global.require.__debugManifest.aliases = {};
				for (const key in global.require.__debugManifest.f)
				{
					const alias = normalizeFileName(key);
					if (alias === null) continue;
					if (global.require.__debugManifest.aliases[alias]) throw new Error(`0x9762B9 Invalid operation: duplicate alias name; related values: "${alias}" ("${key}").`);
					global.require.__debugManifest.aliases[alias] = key;
				}
				break;
			default: throw new Error(`0x3A3864 Not supported: "global.require.__debugManifest.v"; related value: ${global.require.__debugManifest.v}.`);
		}

		return global.require.__debugManifest;

		function normalizeFileName(filePath)
		{
			if (!/\d\d\d+\//.test(filePath)) return null;
			return filePath.replace(/\d\d\d+\//, "");
		}
	}

	function newUUID()
	{
		let d = new Date().getTime();
		let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
		{
			let r = Math.random() * 16;
			if (d > 0)
			{
				r = (d + r) % 16 | 0;
				d = Math.floor(d / 16);
			}
			else
			{
				r = (d2 + r) % 16 | 0;
				d2 = Math.floor(d2 / 16);
			}
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}
})();
