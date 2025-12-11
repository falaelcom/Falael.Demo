"use strict";

include("StdAfx.js");

function PlayerDocumentAction_StartTimer(slotName, key, interval_timesig, once, noExecute)
{
    this.type = "PlayerDocumentAction_StartTimer";

    this.slotName = slotName;
    this.key = key;
    this.interval_timesig = interval_timesig;
    this.once = once;
	this.noExecute = noExecute;
}

PlayerDocumentAction_StartTimer.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_StartTimer();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.interval_timesig = obj.interval_timesig;
	result.once = obj.once;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_StartTimer.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var timer = WPlayerDocument_Timer.create(this.key);
    new WPlayerDocument_Timer(timer).start(playerDocument.playerState.currentTimesig, this.interval_timesig, this.once);
    playerDocument.playerState.timers[this.key] = timer;

	//	return changeArgs
    return [
	{
		propertyName: "timers",
		subKey: this.key,
		oldValue: false,
		newValue: true,
	}];
}

PlayerDocumentAction_StartTimer.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var timer = playerDocument.playerState.timers[this.key];
    if (!timer || !new WPlayerDocument_Timer(timer).isActive(playerDocument.getCurrentTimeSpan()))
    {
    	console.error("Cannot rollback: timer with key \"" + this.key + "\" is not active.");
    	return;
    }

    if (!new WPlayerDocument_Timer(timer).rollback())
    {
    	delete playerDocument.playerState.timers[this.key];
    }

    //	return changeArgs
    return [{
    	propertyName: "timers",
    	subKey: this.key,
    	oldValue: true,
    	newValue: false,
    }];
}
