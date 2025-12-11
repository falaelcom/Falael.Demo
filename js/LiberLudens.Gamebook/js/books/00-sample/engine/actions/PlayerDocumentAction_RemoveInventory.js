"use strict";

include("StdAfx.js");

function PlayerDocumentAction_RemoveInventory(slotName, key, currentQuantity, quantityChange, properties, silent, noExecute)
{
    this.type = "PlayerDocumentAction_RemoveInventory";

    this.slotName = slotName;
	this.key = key;
	this.currentQuantity = currentQuantity;
	this.quantityDelta = -quantityChange;
	this.properties = properties;
	this.silent = silent;
	this.noExecute = noExecute;
}

PlayerDocumentAction_RemoveInventory.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_RemoveInventory();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.currentQuantity = obj.currentQuantity;
	result.quantityDelta = obj.quantityDelta;
	result.properties = obj.properties;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_RemoveInventory.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	var itemTitle = bookDocument.getInventoryText(this.key);
    if (!itemTitle)
    {
        console.error("Inventory text for \"" + this.key + "\" not found.");
        itemTitle = "(n/a)";
    }
    var result = [];
    var resultQuantity = this.currentQuantity + this.quantityDelta;
    if (resultQuantity == 0)
    {
   		result.push("You loose the " + itemTitle + ".");
    }
    else if(this.quantityDelta == 1)
    {
   		result.push("You remove " + itemTitle.getUnspecificArticle() + " " + itemTitle + " from your inventory.");
    }
    else
    {
   		result.push("You remove " + (-this.quantityDelta) + " " + itemTitle + "s from your inventory.");
    }
    if (this.properties)
    {
        var sentencePrefix = null;
        if (this.properties.might > 0)
        {
       		result.push("Your might decreases by " + this.properties.might + ".");
        }
        else if (this.properties.might < 0)
        {
       		result.push("Your might increases by " + Math.abs(this.properties.might) + ".");
        }

        if (this.properties.speed > 0)
        {
       		result.push("Your speed decreases by " + this.properties.speed + ".");
        }
        else if (this.properties.speed < 0)
        {
       		result.push("Your speed increases by " + Math.abs(this.properties.speed) + ".");
        }

        if (this.properties.skills)
        {
            for (var length = this.properties.skills.length, i = 0; i < length; ++i)
            {
                var skillTitle = bookDocument.getSkillText(this.properties.skills[i]);
                if (!skillTitle)
                {
                    console.error("Skill text for \"" + this.properties.skills[i] + "\" not found.");
                    skillTitle = "(n/a)";
                }
                result.push("You no longer possess the " + skillTitle + " skill.");
            }
        }
    }
    return result;
}

PlayerDocumentAction_RemoveInventory.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var currentQuantity = this.currentQuantity;
    var quantityChange = -this.quantityDelta;
    if (quantityChange <= 0)
    {
    	console.error("Invalid argument value for quantityChange: " + quantityChange);
    	quantityChange = 1;
    }
    if (currentQuantity < quantityChange)
    {
    	console.error("Invalid argument value for currentQuantity: " + currentQuantity);
    	quantityChange = currentQuantity;
    }
    var quantityDelta = -quantityChange;

    var item = playerDocument.playerState.currentInventory[this.key];
    var oldQuantity = item.quantity;
    item.quantity += quantityDelta;
    if (item.quantity <= 0)
    {
    	delete playerDocument.playerState.currentInventory[this.key];
    }

    //	return changeArgs
	return [{
	    propertyName: "currentInventory",
		subKey: this.key,
		oldValue: oldQuantity,
		newValue: item.quantity,
	}];
}

PlayerDocumentAction_RemoveInventory.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var item = playerDocument.playerState.currentInventory[this.key];
    if (!item)
    {
    	item =
        {
	    	quantity: -this.quantityDelta,
        	properties: this.properties,
        };
    	playerDocument.playerState.currentInventory[this.key] = item;
    	return;
    }
    var oldQuantity = item.quantity;
    item.quantity -= this.quantityDelta;
    //	return changeArgs
    return [{
        propertyName: "currentInventory",
        subKey: this.key,
        oldValue: oldQuantity,
        newValue: item.quantity,
    }];
}
