"use strict";

include("StdAfx.js");

function PlayerDocumentAction_RollDice(slotName, newDiceRoll, oldDiceRoll, silent, noExecute)
{
	this.type = "PlayerDocumentAction_RollDice";

	this.slotName = slotName;
	this.newDiceRoll = newDiceRoll;
	this.oldDiceRoll = oldDiceRoll;
	this.silent = silent;
	this.noExecute = noExecute;
}

PlayerDocumentAction_RollDice.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_RollDice();
	result.slotName = obj.slotName;
	result.newDiceRoll = obj.newDiceRoll;
	result.oldDiceRoll = obj.oldDiceRoll;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_RollDice.prototype.getCustomView = function (bookDocument)
{
	return "2 dices";
}

PlayerDocumentAction_RollDice.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	return ["Your rolled " + this.newDiceRoll + "."];
}

PlayerDocumentAction_RollDice.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentDiceRoll;
    playerDocument.playerState.currentDiceRoll = this.newDiceRoll;

	//	return changeArgs
	return [{
	    propertyName: "currentDiceRoll",
	    oldValue: oldValue,
	    newValue: playerDocument.playerState.currentDiceRoll,
	}];
}

PlayerDocumentAction_RollDice.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentDiceRoll;
    playerDocument.playerState.currentDiceRoll = this.oldDiceRoll;

	//	return changeArgs
    return [{
        propertyName: "currentDiceRoll",
        oldValue: oldValue,
        newValue: playerDocument.playerState.currentDiceRoll,
    }];
}
