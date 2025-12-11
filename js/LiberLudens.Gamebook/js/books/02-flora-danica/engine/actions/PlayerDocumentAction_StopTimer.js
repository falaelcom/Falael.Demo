"use strict";

include("StdAfx.js");

function PlayerDocumentAction_StopTimer(slotName, key, noExecute)
{
    this.type = "PlayerDocumentAction_StopTimer";

    this.slotName = slotName;
    this.key = key;
	this.noExecute = noExecute;
}

PlayerDocumentAction_StopTimer.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_StopTimer();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_StopTimer.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var timer = playerDocument.playerState.timers[this.key];
    if (!timer || !new WPlayerDocument_Timer(timer).isActive(playerDocument.getCurrentTimeSpan()))
    {
    	console.error("Timer with key \"" + this.key + "\" is not active.");
    	return;
    }

    new WPlayerDocument_Timer(timer).stop(playerDocument.playerState.currentTimesig);

	//	return changeArgs
	return [{
		propertyName: "timers",
		subKey: this.key,
		oldValue: true,
		newValue: false,
	}];
}

PlayerDocumentAction_StopTimer.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var timer = playerDocument.playerState.timers[this.key];
    if (timer && new WPlayerDocument_Timer(timer).isActive(playerDocument.getCurrentTimeSpan()))
    {
    	console.error("Cannot rollback: timer with key \"" + this.key + "\" is already active.");
    	return;
    }

    new WPlayerDocument_Timer(timer).rollback();

    //	return changeArgs
    return [{
    	propertyName: "timers",
    	subKey: this.key,
    	oldValue: false,
    	newValue: true,
    }];
}
