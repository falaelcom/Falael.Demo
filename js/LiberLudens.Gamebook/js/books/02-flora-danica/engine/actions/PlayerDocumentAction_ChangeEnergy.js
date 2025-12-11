"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ChangeEnergy(slotName, amountDelta, silent, noExecute)
{
    this.type = "PlayerDocumentAction_ChangeEnergy";

    this.slotName = slotName;
    this.amountDelta = amountDelta;
    this.silent = silent;
    this.noExecute = noExecute;
}

PlayerDocumentAction_ChangeEnergy.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_ChangeEnergy();
	result.slotName = obj.slotName;
	result.amountDelta = obj.amountDelta;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ChangeEnergy.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	if (this.amountDelta >= 0)
    {
        return ["Your energy increses by " + this.amountDelta + "."];
    }
    return ["Your energy decreses by " + this.amountDelta + "."];
}

PlayerDocumentAction_ChangeEnergy.prototype.execute = function(playerDocument)
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

    var oldValue = playerDocument.playerState.currentEnergy;
    playerDocument.playerState.currentEnergy += amountDelta;

    //	return changeArgs
	return [{
	    propertyName: "currentEnergy",
	    oldValue: oldValue,
	    newValue: playerDocument.playerState.currentEnergy,
	}];
}

PlayerDocumentAction_ChangeEnergy.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentEnergy;
    playerDocument.playerState.currentEnergy -= this.amountDelta;

    //	return changeArgs
    return [{
        propertyName: "currentEnergy",
        oldValue: oldValue,
        newValue: playerDocument.playerState.currentEnergy,
    }];
}
