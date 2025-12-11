"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ChangeMight(slotName, amountDelta, silent, noExecute)
{
	this.type = "PlayerDocumentAction_ChangeMight";

    this.slotName = slotName;
    this.amountDelta = amountDelta;
    this.silent = silent;
    this.noExecute = noExecute;
}

PlayerDocumentAction_ChangeMight.fromObject = function (obj)
{
	var result = new PlayerDocumentAction_ChangeMight();
	result.slotName = obj.slotName;
	result.amountDelta = obj.amountDelta;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ChangeMight.prototype.getActionListStrings = function (bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	if (this.amountDelta >= 0)
    {
   		return ["Your might increses by " + this.amountDelta + "."];
    }
    return ["Your might decreses by " + this.amountDelta + "."];
}

PlayerDocumentAction_ChangeMight.prototype.execute = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var amountDelta = this.amountDelta;
    if (amountDelta == 0)
    {
   		console.error("Invalid argument value for amountDelta: " + amountDelta);
    }

    var oldValue = playerDocument.playerState.currentMight;
    playerDocument.playerState.currentMight += amountDelta;

    //	return changeArgs
	return [{
		propertyName: "currentMight",
	    oldValue: oldValue,
	    newValue: playerDocument.playerState.currentMight,
	}];
}

PlayerDocumentAction_ChangeMight.prototype.rollback = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentMight;
    playerDocument.playerState.currentMight -= this.amountDelta;

    //	return changeArgs
    return [{
    		propertyName: "currentMight",
        oldValue: oldValue,
        newValue: playerDocument.playerState.currentMight,
    }];
}
