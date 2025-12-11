"use strict";

include("StdAfx.js");

function PlayerDocumentAction_AddBookmark(slotName, key, roomKey, noExecute)
{
	this.type = "PlayerDocumentAction_AddBookmark";

	this.slotName = slotName;
	this.key = key;
	this.roomKey = roomKey;
	this.oldRoomKey = null;
	this.noExecute = noExecute;
}

PlayerDocumentAction_AddBookmark.fromObject = function (obj)
{
	var result = new PlayerDocumentAction_AddBookmark();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.roomKey = obj.roomKey;
	result.oldRoomKey = obj.oldRoomKey;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_AddBookmark.prototype.getActionListStrings = function (bookDocument)
{
	if (!bookDocument.isDebugMode)
	{
		return null;
	}
	return ["[DEBUG] Bookmark " + this.key + " => " + this.roomKey];
}

PlayerDocumentAction_AddBookmark.prototype.execute = function (playerDocument)
{
	if (this.noExecute)
	{
		return;
	}

	this.oldRoomKey = playerDocument.bookmarks[this.key];
	playerDocument.bookmarks[this.key] = this.roomKey;

	//	return changeArgs
	return null;
}

PlayerDocumentAction_AddBookmark.prototype.rollback = function (playerDocument)
{
	if (this.noExecute)
	{
		return;
	}

	if (!this.oldRoomKey)
	{
		delete playerDocument.bookmarks[this.key];
	}
	else
	{
		playerDocument.bookmarks[this.key] = this.oldRoomKey;
	}

	//	return changeArgs
	return null;
}