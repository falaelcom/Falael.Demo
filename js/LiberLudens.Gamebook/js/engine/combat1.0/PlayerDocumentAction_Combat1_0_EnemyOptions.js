"use strict";

include("StdAfx.js");

function PlayerDocumentAction_Combat1_0_EnemyOptions(noExecute)
{
	this.type = "PlayerDocumentAction_Combat1_0_EnemyOptions";

	this.noExecute = noExecute;
}

PlayerDocumentAction_Combat1_0_EnemyOptions.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_Combat1_0_EnemyOptions();
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_Combat1_0_EnemyOptions.prototype.getCustomView = function (bookDocument)
{
	return "combat1.0";
}

PlayerDocumentAction_Combat1_0_EnemyOptions.prototype.execute = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    new WCombat1_0_History(combat1_0State.combatHistory).addEnemyOptions({});

	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
    }];
}

PlayerDocumentAction_Combat1_0_EnemyOptions.prototype.rollback = function(playerDocument)
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
