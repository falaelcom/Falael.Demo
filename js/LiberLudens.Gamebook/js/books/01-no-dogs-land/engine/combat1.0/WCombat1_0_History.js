"use strict";

include("StdAfx.js");

function WCombat1_0_History(obj)
{
	if (!obj)
	{
		throw "Argument is null: obj";
	}
	if (!obj.items)
	{
		throw "Argument is not valid: obj";
	}
	this.obj = obj;
}

WCombat1_0_History.create = function()
{
	return {
		items: [],
	};
}

WCombat1_0_History.prototype.undo = function ()
{
	return this.obj.items.pop();
}

WCombat1_0_History.prototype.addPalyerOptions = function (par)
{
	//	only one option currently - roll a dice - so, ommitting any params
	this.obj.items.push(
	{
		subject: "playerOptions",
	});
}

WCombat1_0_History.prototype.addEnemyOptions = function (par)
{
	//	only one option currently - roll a dice - so, ommitting any params
	this.obj.items.push(
	{
		subject: "enemyOptions",
	});
}

WCombat1_0_History.prototype.addPalyerHit = function (par)
{
	var hitPower = par.hitPower;
	var damageDone = par.damageDone;
	var diceRoll = par.diceRoll;
	var isEnemyDead = par.isEnemyDead;

	this.obj.items.push(
	{
		subject: "playerAttack",
		diceRoll: diceRoll,
		enemyHpDelta: -damageDone,
		playerHitPower: hitPower,
		isEnemyDead: isEnemyDead,
	});
}

WCombat1_0_History.prototype.addEnemyHit = function (par)
{
	var hitPower = par.hitPower;
	var damageDone = par.damageDone;
	var diceRoll = par.diceRoll;
	var isPlayerDead = par.isPlayerDead;

	this.obj.items.push(
	{
		subject: "enemyAttack",
		playerHpDelta: -damageDone,
		enemyHitPower: hitPower,
		diceRoll: diceRoll,
		isPlayerDead: isPlayerDead,
	});
}

