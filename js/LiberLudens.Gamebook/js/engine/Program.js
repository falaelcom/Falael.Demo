"use strict";

include("App.js");

if(!("Program" in window)) window.Program = {};

Program.main = function()
{
	window.app = new App();
	window.app.run();
};
