"use strict";

include("StdAfx.js");

function PlayerDocumentAction_IncImplicitData(key, amount, noExecute)
{
	this.type = "PlayerDocumentAction_IncImplicitData";

	this.key = key;
	this.amount = amount;
	this.noExecute = noExecute;
}

PlayerDocumentAction_IncImplicitData.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_IncImplicitData();
	result.key = obj.key;
	result.amount = obj.amount;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_IncImplicitData.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var amount = this.amount;
    if (isNaN(amount))
    {
    	console.error("amount must be a number: \"" + amount + "\"");
    	amount = 0;
    }

    var oldValue = playerDocument.playerState.currentImplicitData[this.key];
    if (isNaN(oldValue))
    {
    	console.error("Unable to increase the non-numerical implicit data \"" + this.key + "\".");
    	return null;
    }

    playerDocument.playerState.currentImplicitData[this.key] = oldValue + amount;

	//	return changeArgs
	return [{
	    propertyName: "currentImplicitData",
	    subKey: this.key,
		oldValue: Object.copy(oldValue),
		newValue: Object.copy(playerDocument.playerState.currentImplicitData[this.key]),
	}];
}

PlayerDocumentAction_IncImplicitData.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var oldValue = playerDocument.playerState.currentImplicitData[this.key];
    if (isNaN(oldValue))
    {
    	console.error("Unable to decrease the non-numerical implicit data \"" + this.key + "\".");
    	return;
    }

    playerDocument.playerState.currentImplicitData[this.key] = oldValue - this.amount;

	//	return changeArgs
    return [{
        propertyName: "currentImplicitData",
        subKey: this.key,
        oldValue: Object.copy(oldValue),
        newValue: Object.copy(playerDocument.playerState.currentImplicitData[this.key]),
    }];
}
