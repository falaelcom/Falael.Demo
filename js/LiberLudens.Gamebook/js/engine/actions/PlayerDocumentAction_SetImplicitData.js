"use strict";

include("StdAfx.js");

function PlayerDocumentAction_SetImplicitData(key, data, oldImplicitData, noExecute)
{
	this.type = "PlayerDocumentAction_SetImplicitData";

	this.key = key;
	this.data = data;
	this.oldImplicitData = Object.copy(oldImplicitData);
	this.noExecute = noExecute;
}

PlayerDocumentAction_SetImplicitData.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_SetImplicitData();
	result.key = obj.key;
	result.data = obj.data;
	result.oldImplicitData = obj.oldImplicitData;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_SetImplicitData.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var oldValue = playerDocument.playerState.currentImplicitData[this.key];
    playerDocument.playerState.currentImplicitData[this.key] = Object.copy(this.data);
	//	return changeArgs
	return [{
	    propertyName: "currentImplicitData",
		subKey: this.key,
		oldValue: Object.copy(oldValue),
		newValue: Object.copy(playerDocument.playerState.currentImplicitData[this.key]),
	}];
}

PlayerDocumentAction_SetImplicitData.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var oldValue = playerDocument.playerState.currentImplicitData[this.key];
    playerDocument.playerState.currentImplicitData = Object.copy(this.oldImplicitData);
	//	return changeArgs
    return [{
        propertyName: "currentImplicitData",
        subKey: this.key,
        oldValue: Object.copy(oldValue),
        newValue: Object.copy(playerDocument.playerState.currentImplicitData[this.key]),
    }];
}
