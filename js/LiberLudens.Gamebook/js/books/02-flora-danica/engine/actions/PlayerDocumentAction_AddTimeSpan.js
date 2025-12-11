"use strict";

include("StdAfx.js");

function PlayerDocumentAction_AddTimeSpan(slotName, timeSpanString, noExecute)
{
    this.type = "PlayerDocumentAction_AddTimeSpan";

    this.slotName = slotName;
    this.timesig = timeSpanString ? GameTimeSpan.parse(timeSpanString).getTimesig() : null;
    this.noExecute = noExecute;
}

PlayerDocumentAction_AddTimeSpan.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_AddTimeSpan();
	result.slotName = obj.slotName;
	result.timesig = obj.timesig;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_AddTimeSpan.prototype.getActionListStrings = function (bookDocument)
{
	if (!bookDocument.isDebugMode)
	{
		return null;
	}
	return ["[DEBUG] Time elapsed: " + GameTimeSpan.fromTimesig(this.timesig).toString() + "."];
}

PlayerDocumentAction_AddTimeSpan.prototype.execute = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var timeSpan = GameTimeSpan.fromTimesig(this.timesig);

    var oldTimecode = playerDocument.playerState.currentTimecode;
    var currentDateTime = GameDateTime.fromTimecode(playerDocument.playerState.currentTimecode);
    currentDateTime.addTimeSpan(timeSpan);
    playerDocument.playerState.currentTimecode = currentDateTime.getTimecode();

    var old_timesig = playerDocument.playerState.currentTimesig;
    var current_timeSpan = GameTimeSpan.fromTimesig(playerDocument.playerState.currentTimesig);
    current_timeSpan.add(timeSpan);
    playerDocument.playerState.currentTimesig = current_timeSpan.getTimesig();

    //	return changeArgs
    return [
	{
		propertyName: "currentTimecode",
		oldValue: oldTimecode,
		newValue: playerDocument.playerState.currentTimecode,
	},
    {
		propertyName: "currentTimesig",
		oldValue: old_timesig,
		newValue: playerDocument.playerState.currentTimesig,
    }];
}

PlayerDocumentAction_AddTimeSpan.prototype.rollback = function(playerDocument)
{
	if (this.noExecute)
	{
		return;
	}

	var timeSpan = GameTimeSpan.fromTimesig(this.timesig);

	var oldValue = playerDocument.playerState.currentTimecode;
	var currentDateTime = GameDateTime.fromTimecode(playerDocument.playerState.currentTimecode);
	currentDateTime.subtractTimeSpan(timeSpan);
	playerDocument.playerState.currentTimecode = currentDateTime.getTimecode();

	var old_timesig = playerDocument.playerState.currentTimesig;
	var current_timeSpan = GameTimeSpan.fromTimesig(playerDocument.playerState.currentTimesig);
	current_timeSpan.subtract(timeSpan);
	playerDocument.playerState.currentTimesig = current_timeSpan.getTimesig();

	//	return changeArgs
	return [
	{
		propertyName: "currentTimecode",
		oldValue: oldValue,
		newValue: playerDocument.playerState.currentTimecode,
	},
    {
		propertyName: "currentTimesig",
		oldValue: old_timesig,
		newValue: playerDocument.playerState.currentTimesig,
    }];
}
