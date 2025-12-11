"use strict";

include("App.js");

include("framework/http/DionClient.js");

if(!("Program" in window)) window.Program = {};

Program.main = async function()
{
	window.$ = DionClient.addParam;

	window.app = new App();

	if (window.appConfig.isUnitTestMode)
	{
		await window.app.client.loadCommands();

		var testResultList = [];
		testResultList = testResultList.concat(LinearFunction.__unitTest().filter(x => !x.indexOf("FAIL")));
		testResultList = testResultList.concat(Utility.Type.__unitTest().filter(x => !x.indexOf("FAIL")));
		document.body.style.cssText = "background: white !important; color: black; font-family: calibri, verdana, sans serif;";
		if (testResultList.length) document.body.innerHTML = testResultList.join("<br />");
		else document.body.innerHTML = "OK";
		return;
	}

	await window.app.run();
};
