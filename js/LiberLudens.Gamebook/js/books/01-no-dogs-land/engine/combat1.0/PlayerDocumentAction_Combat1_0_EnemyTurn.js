"use strict";

include("StdAfx.js");

function PlayerDocumentAction_Combat1_0_EnemyTurn(diceRoll, noExecute)
{
	this.type = "PlayerDocumentAction_Combat1_0_EnemyTurn";

	this.diceRoll = diceRoll;
	this.noExecute = noExecute;
}

PlayerDocumentAction_Combat1_0_EnemyTurn.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_Combat1_0_EnemyTurn();
	result.diceRoll = obj.diceRoll;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_Combat1_0_EnemyTurn.prototype.getCustomView = function (bookDocument)
{
	return "combat1.0";
}

PlayerDocumentAction_Combat1_0_EnemyTurn.prototype.execute = function (playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    var diceScaled = 1.5 + 2 * (this.diceRoll - 7) / 5;	//	diceScaled is a real number in the interval [-0.5 .. 3.5]
    var hitPower = Math.round(diceScaled * combat1_0State.might) - combat1_0State.ballance;
    if(hitPower < 0)
    {
	    	hitPower = 0;
    }
    var damageDone = hitPower;

    combat1_0State.playerHp -= hitPower;
    if (combat1_0State.playerHp < 0)
    {
    		damageDone += combat1_0State.playerHp;
    		combat1_0State.playerHp = 0;
    }
    new WCombat1_0_History(combat1_0State.combatHistory).addEnemyHit(
	{
		hitPower: hitPower,
		damageDone: damageDone,
		diceRoll: this.diceRoll,
		isPlayerDead: combat1_0State.playerHp == 0,
	});

    var oldPlayerHealth = playerDocument.playerState.currentHealth;
    playerDocument.playerState.currentHealth = combat1_0State.playerHp;

	//	return changeArgs
    return [
	{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
    },
    {
    		propertyName: "currentHealth",
    		oldValue: oldPlayerHealth,
    		newValue: playerDocument.playerState.currentHealth,
    }];
}

PlayerDocumentAction_Combat1_0_EnemyTurn.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var combat1_0State = playerDocument.getCurrentCombat1_0State();
    var oldCombat1_0State = Object.copy(combat1_0State);

    var combatHistoryItem = new WCombat1_0_History(combat1_0State.combatHistory).undo();
    combat1_0State.playerHp -= combatHistoryItem.playerHpDelta;

    var oldPlayerHealth = playerDocument.playerState.currentHealth;
    playerDocument.playerState.currentHealth = combat1_0State.playerHp;

	//	return changeArgs
    return [
	{
    		propertyName: "currentCombat1_0State",
    		oldValue: oldCombat1_0State,
    		newValue: Object.copy(combat1_0State),
	},
    {
		propertyName: "currentHealth",
		oldValue: oldPlayerHealth,
		newValue: playerDocument.playerState.currentHealth,
    }];
}
