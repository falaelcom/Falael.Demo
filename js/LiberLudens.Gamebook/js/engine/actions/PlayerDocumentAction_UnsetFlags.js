"use strict";

include("StdAfx.js");

function PlayerDocumentAction_UnsetFlags(key, oldImplicitData, noExecute)
{
	this.type = "PlayerDocumentAction_UnsetFlags";

	this.key = key;
	this.oldImplicitData = Object.copy(oldImplicitData);
	this.noExecute = noExecute;
}

PlayerDocumentAction_UnsetFlags.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_UnsetFlags();
	result.key = obj.key;
	result.oldImplicitData = obj.oldImplicitData;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_UnsetFlags.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    PlayerDocument.validateFlagName(this.key);

    var oldValue = !!playerDocument.playerState.currentFlags[this.key];
    delete playerDocument.playerState.currentFlags[this.key];
	//	return changeArgs
	return [{
	    propertyName: "currentFlags",
		subKey: this.key,
		oldValue: oldValue,
		newValue: false,
	}];
}

PlayerDocumentAction_UnsetFlags.prototype.rollback = function(playerDocument)
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
