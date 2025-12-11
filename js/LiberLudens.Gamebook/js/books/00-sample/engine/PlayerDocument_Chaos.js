"use strict";

include("StdAfx.js");

function PlayerDocument_Chaos()
{
}

PlayerDocument_Chaos.prototype.apply = function (chaosDef)
{
	for(var length = chaosDef.length, i = 0; i < length; ++i)
	{
		var item = chaosDef[i];
		switch(item.type)
		{
			case "diceRoll":
				this.rollDice(true);
				break;
			case "randomInt":
				this.rollRandomInt(item.from || 0, item.to || 0, item.constraint, true);
				break;
			default:
				console.error("Unrecognized chaos type \"" + item.type + "\"");
				break;
		}
	}
}

PlayerDocument_Chaos.prototype.rollDice = function (storeDiceRoll)
{
	storeDiceRoll = storeDiceRoll || false;

	var result;

	if (this.diceRollOverwrite)
	{
		result = this.diceRollOverwrite;
		this.diceRollOverwrite = null;
	}
	else
	{
		result = Math.floor(Math.random() * 11) + 2;
	}

	if (storeDiceRoll)
	{
		this.diceRoll = result;
	}

	return result;
}

PlayerDocument_Chaos.prototype.getDiceRoll = function ()
{
	return this.diceRoll;
}

PlayerDocument_Chaos.prototype.overwriteNextDiceRoll = function (value)
{
	this.diceRollOverwrite = value;
}

PlayerDocument_Chaos.prototype.rollRandomInt = function (rangeStart, rangeEnd, constraint, storeRandomInt)
{
	storeRandomInt = storeRandomInt || false;

	var rangeLength = rangeEnd - rangeStart + 1;

	var result;

	if (this.randomIntOverwrite)
	{
		result = this.randomIntOverwrite;
		this.randomIntOverwrite = null;
	}
	else
	{
		result = Math.floor(Math.random() * 11) + 2;
		if (constraint !== void (0))
		{
			switch (constraint)
			{
				case "noConsecutiveRepeat":
					if (this.randomInt === void (0))
					{
						result = Math.floor(Math.random() * rangeLength) + rangeStart;
						break;
					}
					//	- generate a newRandomInt in the range [rangeStart .. rangeEnd - 1]
					//	- if newRandomInt < this.randomInt return newRandomInt
					//	- if newRandomInt >= this.randomInt return newRandomInt + 1
					result = Math.floor(Math.random() * (rangeLength - 1)) + rangeStart;
					if (result >= this.randomInt)
					{
						++result;
					}
					break;
				default:
					throw "Not implemented.";
			}
		}
		else
		{
			result = Math.floor(Math.random() * rangeLength) + rangeStart;
		}
	}

	if (storeRandomInt)
	{
		this.randomInt = result;
	}

	return result;
}

PlayerDocument_Chaos.prototype.getRandomInt = function ()
{
	return this.randomInt;
}

PlayerDocument_Chaos.prototype.overwriteNextRandomInt = function (value)
{
	this.randomIntOverwrite = value;
}


PlayerDocument_Chaos.splitDiceRollInTwo = function (diceRoll)
{
	var minDice1 = diceRoll - 6;
	if (minDice1 < 1) minDice1 = 1;
	var maxDice1 = Math.min(diceRoll - 1, 6);
	var dice1 = Math.floor(Math.random() * (maxDice1 - minDice1 + 1)) + minDice1;
	var dice2 = diceRoll - dice1;
	return { dice1: dice1, dice2: dice2 };
}

