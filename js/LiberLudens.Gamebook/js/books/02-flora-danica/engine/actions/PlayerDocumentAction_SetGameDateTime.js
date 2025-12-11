"use strict";

include("StdAfx.js");

function PlayerDocumentAction_SetGameDateTime(slotName, dateTimeString, noExecute)
{
    this.type = "PlayerDocumentAction_SetGameDateTime";

    this.slotName = slotName;
    this.timecode = dateTimeString ? GameDateTime.parse(dateTimeString).getTimecode() : null;
    this.resetStartTimecode = false;
    this.noExecute = noExecute;
}

PlayerDocumentAction_SetGameDateTime.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_SetGameDateTime();
	result.slotName = obj.slotName;
	result.timecode = obj.timecode;
	result.oldTimecode = obj.oldTimecode;
	result.resetStartTimecode = obj.resetStartTimecode;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_SetGameDateTime.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    this.oldTimecode = playerDocument.playerState.currentTimecode;
    playerDocument.playerState.currentTimecode = this.timecode;
    if (playerDocument.playerState.startTimecode === null)
    {
    		this.resetStartTimecode = true;
    		playerDocument.playerState.startTimecode = this.timecode;
    }

    var changeArgs = [];

    changeArgs.push(
	{
		propertyName: "currentTimecode",
		oldValue: this.oldTimecode,
		newValue: playerDocument.playerState.currentTimecode,
	});

    if (this.resetStartTimecode)
    {
   		changeArgs.push(
		{
			propertyName: "startTimecode",
			oldValue: null,
			newValue: playerDocument.playerState.startTimecode,
		});
    }

    return changeArgs;
}

PlayerDocumentAction_SetGameDateTime.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentTimecode;
    playerDocument.playerState.currentTimecode = this.oldTimecode;
    var oldResetStartTimecode = this.resetStartTimecode;
    var oldStartTimecode = playerDocument.playerState.startTimecode;
    if (this.resetStartTimecode)
    {
    		this.resetStartTimecode = false;
    		playerDocument.playerState.startTimecode = null;
    }

    var changeArgs = [];

    changeArgs.push(
	{
		propertyName: "currentTimecode",
		oldValue: oldValue,
		newValue: playerDocument.playerState.currentTimecode,
	});

    if (oldResetStartTimecode)
    {
    		changeArgs.push(
		{
			propertyName: "startTimecode",
			oldValue: oldStartTimecode,
			newValue: null,
		});
    }

    return changeArgs;
}
