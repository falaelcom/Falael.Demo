"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ChangeSpeed(slotName, amountDelta, silent, noExecute)
{
    this.type = "PlayerDocumentAction_ChangeSpeed";

    this.slotName = slotName;
    this.amountDelta = amountDelta;
    this.silent = silent;
    this.noExecute = noExecute;
}

PlayerDocumentAction_ChangeSpeed.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_ChangeSpeed();
	result.slotName = obj.slotName;
	result.amountDelta = obj.amountDelta;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ChangeSpeed.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	if (this.amountDelta >= 0)
    {
        return ["Your speed increses by " + this.amountDelta + "."];
    }
    return ["Your speed decreses by " + this.amountDelta + "."];
}

PlayerDocumentAction_ChangeSpeed.prototype.execute = function(playerDocument)
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

    var oldValue = playerDocument.playerState.currentSpeed;
    playerDocument.playerState.currentSpeed += amountDelta;

    //	return changeArgs
	return [{
	    propertyName: "currentSpeed",
	    oldValue: oldValue,
	    newValue: playerDocument.playerState.currentSpeed,
	}];
}

PlayerDocumentAction_ChangeSpeed.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentSpeed;
    playerDocument.playerState.currentSpeed -= this.amountDelta;

    //	return changeArgs
    return [{
        propertyName: "currentSpeed",
        oldValue: oldValue,
        newValue: playerDocument.playerState.currentSpeed,
    }];
}
