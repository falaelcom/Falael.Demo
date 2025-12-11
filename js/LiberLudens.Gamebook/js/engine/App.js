"use strict";

include("StdAfx.js");

include("BookDocument_ResourceLoader.js");
include("BookDocument.js");
include("PlayerDocument.js");
include("GameView.js");

//include("test", "test.xhtml");

function App()
{
	this.isDebugMode = window.appConfig.isDebugMode;

	this.bookDocument = new BookDocument(new BookDocument_ResourceLoader(window.appConfig.ioBasePath, window.appConfig.bookDataRoot, window.appConfig.bookResourcesRoot), window.appConfig.bookIndexFile, this.isDebugMode);
	this.playerDocument = new PlayerDocument(this.bookDocument);
	this.gameView = new GameView();
	this.gameView.setIsDebugMode(this.isDebugMode);
}

App.prototype.run = function ()
{
	//Utility.Template.loadFromFile("test", "client/test.xhtml", function(err, result)
	//{
	//    log(811, Utility.Template.templates);
	//    var result = Utility.Template.fill("test", { field1: "<field1>", field2: "<field2>", field3: "<field3>" });
	//    log(812, result);
	//});

	return async.waterfall(
	[
		function (next)
		{
			return XhtmlTemplate.loadAllDocumentTemplateLinks(next);
		}.bind(this),
		function (next)
		{
			return this.bookDocument.load(next);
		}.bind(this),
		function (next)
		{
			return this.playerDocument.load(this.bookDocument.getDefaultRoom(), this.bookDocument.getRestartRoom(), next);
		}.bind(this),
		function (next)
		{
			this.gameView.render(document.getElementById("root"));

			this.playerDocument.change.add(this.playerDocument_change.bind(this));
			this.playerDocument.onPlayerInteraction.add(this.playerDocument_onPlayerInteraction.bind(this));

			this.gameView.setBookDocument(this.bookDocument);
			this.gameView.setPlayerDocument(this.playerDocument);

			return next();
		}.bind(this)
	], function done(err, result)
	{
		if (err)
		{
			console.error(377001, err);
		}
	});
}

App.prototype.playerDocument_change = function (sender, e)
{
	if (!e.flush)
	{
		return;
	}
	sender.save();
}

App.prototype.playerDocument_onPlayerInteraction = function (sender, e)
{
	if (!window.ga)
	{
		console.error(834734, "Google analytics is not installed properly");
	}

	var eventName = this.playerDocument.storage.uuid + " | " + e.name.toUpperCase();
	switch (e.name)
	{
		case "back":
			window.ga('send', 'event', "PlayerDocument", eventName, "source: " + e.data.sourceRoomKey, 10003);
			break;
		case "restart":
			window.ga('send', 'event', "PlayerDocument", eventName, "source: " + e.data.sourceRoomKey, 10002);
			break;
		case "navigate":
			window.ga('send', 'event', "PlayerDocument", eventName, "target: " + e.data.targetRoomKey + ", source: " + e.data.sourceRoomKey, 10001);
			break;
		default:
			window.ga('send', 'event', "PlayerDocument", eventName, "", 19999);
			break;
	}
}