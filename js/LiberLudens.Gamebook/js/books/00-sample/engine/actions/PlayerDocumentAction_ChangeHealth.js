"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ChangeHealth(slotName, amountDelta, silent, noExecute)
{
    this.type = "PlayerDocumentAction_ChangeHealth";

    this.slotName = slotName;
    this.amountDelta = amountDelta;
    this.silent = silent;
    this.noExecute = noExecute;
}

PlayerDocumentAction_ChangeHealth.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_ChangeHealth();
	result.slotName = obj.slotName;
	result.amountDelta = obj.amountDelta;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ChangeHealth.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	if (this.amountDelta >= 0)
    {
        return ["Your health increses by " + this.amountDelta + "."];
    }
    return ["Your health decreses by " + this.amountDelta + "."];
}

PlayerDocumentAction_ChangeHealth.prototype.execute = function(playerDocument)
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

    var oldValue = playerDocument.playerState.currentHealth;
    playerDocument.playerState.currentHealth += amountDelta;

    //	return changeArgs
	return [{
	    propertyName: "currentHealth",
	    oldValue: oldValue,
	    newValue: playerDocument.playerState.currentHealth,
	}];
}

PlayerDocumentAction_ChangeHealth.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentHealth;
    playerDocument.playerState.currentHealth -= this.amountDelta;

    //	return changeArgs
    return [{
        propertyName: "currentHealth",
        oldValue: oldValue,
        newValue: playerDocument.playerState.currentHealth,
    }];
}
