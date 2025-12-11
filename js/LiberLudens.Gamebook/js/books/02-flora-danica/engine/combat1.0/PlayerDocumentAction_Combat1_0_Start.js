"use strict";

include("StdAfx.js");

function PlayerDocumentAction_Combat1_0_Start(slotName, combatData, oldCombatData, noExecute)
{
	this.type = "PlayerDocumentAction_Combat1_0_Start";

	this.slotName = slotName;
	this.combatData = Object.copy(combatData);
	this.oldCombatData = Object.copy(oldCombatData);
	this.noExecute = noExecute;
}

PlayerDocumentAction_Combat1_0_Start.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_Combat1_0_Start();
	result.slotName = obj.slotName;
	result.combatData = obj.combatData;
	result.oldCombatData = obj.oldCombatData;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_Combat1_0_Start.prototype.getCustomView = function (bookDocument)
{
	return "combat1.0";
}

PlayerDocumentAction_Combat1_0_Start.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    playerDocument.playerState.currentCombat1_0State = Object.copy(this.combatData);
    new WCombat1_0_History(playerDocument.playerState.currentCombat1_0State.combatHistory).addPalyerOptions({});
	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: Object.copy(this.oldCombatData),
    		newValue: Object.copy(playerDocument.playerState.currentCombat1_0State),
    }];
}

PlayerDocumentAction_Combat1_0_Start.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var currentCombat1_0State = playerDocument.playerState.currentCombat1_0State;
    playerDocument.playerState.currentCombat1_0State = Object.copy(this.oldCombatData);
	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: Object.copy(currentCombat1_0State),
    		newValue: Object.copy(this.oldCombatData),
    }];
}
