//	R0Q3?/daniel/20211018
"use strict"; if (typeof window === "undefined") throw new Error(`Unsupported runtime.`);

const Crypto = require("-/pb/natalis/005/Crypto.js");
const Logger = require("-/pb/natalis/005/Logger.js");
const Context = require("-/pb/natalis/010/Context.js");

const escapeElement = document.createElement("div");

const tag_CONFIG = document.querySelector("meta[name*='context::CONFIG']");
const tag_VERSION = document.querySelector("meta[name*='context::VERSION']");

Context.configure(
{
	config: tag_CONFIG ? JSON.parse(tag_CONFIG.getAttribute("content")) : {},
	version: tag_VERSION ? JSON.parse(tag_VERSION.getAttribute("content")) : {},
	logger: new Logger(),
	guid: Crypto.uuid44,
	esc: (x) => { escapeElement.innerText = String(x); return escapeElement.innerHTML; },
});
