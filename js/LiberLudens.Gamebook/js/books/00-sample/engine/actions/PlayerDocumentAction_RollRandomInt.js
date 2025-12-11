"use strict";

include("StdAfx.js");

function PlayerDocumentAction_RollRandomInt(slotName, newRandomInt, oldRandomInt, noExecute)
{
	this.type = "PlayerDocumentAction_RollRandomInt";

	this.slotName = slotName;
	this.newRandomInt = newRandomInt;
	this.oldRandomInt = oldRandomInt;
	this.noExecute = noExecute;
}

PlayerDocumentAction_RollRandomInt.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_RollRandomInt();
	result.slotName = obj.slotName;
	result.newRandomInt = obj.newRandomInt;
	result.oldRandomInt = obj.oldRandomInt;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_RollRandomInt.prototype.getActionListStrings = function(bookDocument)
{
	if (!bookDocument.isDebugMode)
	{
		return null;
	}
	return ["A random integer was rolled: " + this.newRandomInt + "."];
}

PlayerDocumentAction_RollRandomInt.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentRandomInt;
    playerDocument.playerState.currentRandomInt = this.newRandomInt;

	//	return changeArgs
	return [{
		propertyName: "currentRandomInt",
	    oldValue: oldValue,
	    newValue: playerDocument.playerState.currentRandomInt,
	}];
}

PlayerDocumentAction_RollRandomInt.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentRandomInt;
    playerDocument.playerState.currentRandomInt = this.oldRandomInt;

	//	return changeArgs
    return [{
    	propertyName: "currentRandomInt",
        oldValue: oldValue,
        newValue: playerDocument.playerState.currentRandomInt,
    }];
}
