"use strict";

include("StdAfx.js");

function PlayerDocumentAction_Combat1_0_PlayerOptions(noExecute)
{
	this.type = "PlayerDocumentAction_Combat1_0_PlayerOptions";

	this.noExecute = noExecute;
}

PlayerDocumentAction_Combat1_0_PlayerOptions.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_Combat1_0_PlayerOptions();
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_Combat1_0_PlayerOptions.prototype.getCustomView = function (bookDocument)
{
	return "combat1.0";
}

PlayerDocumentAction_Combat1_0_PlayerOptions.prototype.execute = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    new WCombat1_0_History(combat1_0State.combatHistory).addPalyerOptions(	{});

	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
    }];
}

PlayerDocumentAction_Combat1_0_PlayerOptions.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    new WCombat1_0_History(combat1_0State.combatHistory).undo();

	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
    }];
}
