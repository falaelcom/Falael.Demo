"use strict";

include("StdAfx.js");

function PlayerDocumentAction_InsertExit(slotName, roomKey, exitDef, noExecute)
{
	this.type = "PlayerDocumentAction_InsertExit";

	if (exitDef && !exitDef.textId && !exitDef.text)
	{
		throw "Argument exitDef is invalid (2).";
	}
	if (exitDef && !exitDef.target)
	{
		throw "Argument exitDef is invalid (3).";
	}

	this.slotName = slotName;
	this.exitDef = exitDef;
	this.roomKey = roomKey;
	this.newExitIndex = 0;
	this.noExecute = noExecute;
}

PlayerDocumentAction_InsertExit.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_InsertExit();
	result.slotName = obj.slotName;
	result.exitDef = obj.exitDef;
	result.roomKey = obj.roomKey;
	result.newExitIndex = obj.newExitIndex;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_InsertExit.prototype.getActionListStrings = function (bookDocument)
{
	if (!bookDocument.isDebugMode)
	{
		return null;
	}
	var room = bookDocument.getRoom(this.roomKey);
	if (room)
	{
		return ["[DEBUG] +exit: " + this.roomKey + "::" + this.exitDef.target + "."];
	}
	return null;
}

PlayerDocumentAction_InsertExit.prototype.insertExit = function (playerDocument, bookDocument, exitArray)
{
	if (this.exitDef.condition)
	{
		if (!playerDocument.testCondition(this.exitDef.condition))
		{
			return null;
		}
	}

	var room = bookDocument.getRoom(this.roomKey);
	if (!room)
	{
		console.error("Room with key \"" + this.roomKey + "\" not found.");
		return null;
	}

	var exit = Object.copy(this.exitDef);
	delete exit.where;

	switch (this.exitDef.where)
	{
		case "first":
			this.newExitIndex = 0;
			exitArray.unshift(exit);
			break;
		case "last":
			this.newExitIndex = exitArray.length;
			exitArray.push(exit);
			break;
		default:
			throw "Not implemented.";
	}
}

PlayerDocumentAction_InsertExit.prototype.execute = function (playerDocument)
{
	if (this.noExecute)
    {
        return;
    }

	//	return changeArgs
    return null;
}

PlayerDocumentAction_InsertExit.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    return null;
}
