"use strict";

include("StdAfx.js");

function PlayerDocumentAction_Combat1_0_PlayerTurn(diceRoll, noExecute)
{
	this.type = "PlayerDocumentAction_Combat1_0_PlayerTurn";

	this.diceRoll = diceRoll;
	this.noExecute = noExecute;
}

PlayerDocumentAction_Combat1_0_PlayerTurn.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_Combat1_0_PlayerTurn();
	result.diceRoll = obj.diceRoll;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_Combat1_0_PlayerTurn.prototype.getCustomView = function (bookDocument)
{
	return "combat1.0";
}

PlayerDocumentAction_Combat1_0_PlayerTurn.prototype.execute = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    var diceScaled = 1.5 + 2 * (this.diceRoll - 7) / 5;	//	diceScaled is a real number in the interval [-0.5 .. 3.5]
    var hitPower = Math.round(diceScaled * combat1_0State.playerMight) + combat1_0State.ballance;
    if(hitPower < 0)
    {
	    	hitPower = 0;
    }
    var damageDone = hitPower;

    combat1_0State.hp -= hitPower;
    if (combat1_0State.hp < 0)
    {
    		damageDone += combat1_0State.hp;
    		combat1_0State.hp = 0;
    }
    new WCombat1_0_History(combat1_0State.combatHistory).addPalyerHit(
	{
		hitPower: hitPower,
		damageDone: damageDone,
		diceRoll: this.diceRoll,
		isEnemyDead: combat1_0State.hp == 0,
	});

	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
    }];
}

PlayerDocumentAction_Combat1_0_PlayerTurn.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    var combatHistoryItem = new WCombat1_0_History(combat1_0State.combatHistory).undo();
    combat1_0State.hp -= combatHistoryItem.enemyHpDelta;

	//	return changeArgs
    return [{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
    }];
}
