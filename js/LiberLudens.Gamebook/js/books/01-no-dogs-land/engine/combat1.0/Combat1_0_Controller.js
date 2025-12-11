"use strict";

include("StdAfx.js");

function Combat1_0_Controller(playerDocument)
{
	this.playerDocument = playerDocument;
}

Combat1_0_Controller.prototype.enemyAttack = function ()
{
	this.playerDocument.startActionBatch();
	var action = new PlayerDocumentAction_Combat1_0_EnemyTurn(this.playerDocument.chaos.rollDice());
	this.playerDocument.executeAction(action);
	this.playerDocument.commitActionBatch(true, true);
}

Combat1_0_Controller.prototype.enemyContinue = function ()
{
	this.playerDocument.startActionBatch();
	var action = new PlayerDocumentAction_Combat1_0_PlayerOptions();
	this.playerDocument.executeAction(action);
	this.playerDocument.commitActionBatch(true, true);
}

Combat1_0_Controller.prototype.playerAttack = function ()
{
	this.playerDocument.startActionBatch();
	var action = new PlayerDocumentAction_Combat1_0_PlayerTurn(this.playerDocument.chaos.rollDice());
	this.playerDocument.executeAction(action);
	this.playerDocument.commitActionBatch(true, true);
}

Combat1_0_Controller.prototype.playerContinue = function ()
{
	this.playerDocument.startActionBatch();
	var action = new PlayerDocumentAction_Combat1_0_EnemyOptions();
	this.playerDocument.executeAction(action);
	this.playerDocument.commitActionBatch(true, true);
}
