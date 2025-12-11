"use strict";

include("StdAfx.js");

function PlayerDocumentAction_SetFlags(key, oldImplicitData, noExecute)
{
	this.type = "PlayerDocumentAction_SetFlags";

	this.key = key;
	this.oldImplicitData = Object.copy(oldImplicitData);
	this.noExecute = noExecute;
}

PlayerDocumentAction_SetFlags.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_SetFlags();
	result.key = obj.key;
	result.oldImplicitData = obj.oldImplicitData;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_SetFlags.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    PlayerDocument.validateFlagName(this.key);

    var oldValue = !!playerDocument.playerState.currentFlags[this.key];
    playerDocument.playerState.currentFlags[this.key] = true;
	//	return changeArgs
	return [{
	    propertyName: "currentFlags",
		subKey: this.key,
		oldValue: oldValue,
		newValue: true,
	}];
}

PlayerDocumentAction_SetFlags.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var oldValue = !!playerDocument.playerState.currentFlags[this.key];
    playerDocument.playerState.currentFlags = Object.copy(this.oldImplicitData);
	//	return changeArgs
    return [{
        propertyName: "currentFlags",
        subKey: this.key,
        oldValue: oldValue,
        newValue: !!playerDocument.playerState.currentFlags[this.key],
    }];
}
