"use strict";

include("StdAfx.js");

function PlayerDocumentAction_AddInventory(slotName, key, quantityDelta, properties, silent, noExecute)
{
    this.type = "PlayerDocumentAction_AddInventory";

    this.slotName = slotName;
	this.key = key;
	this.quantityDelta = quantityDelta;
	this.properties = properties;
	this.silent = silent;
	this.noExecute = noExecute;
}

PlayerDocumentAction_AddInventory.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_AddInventory();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.quantityDelta = obj.quantityDelta;
	result.properties = obj.properties;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_AddInventory.prototype.getActionListStrings = function(bookDocument)
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
    if(this.quantityDelta == 1)
    {
        if (itemTitle.toLowerCase().indexOf("glasses") != -1)
        {
            result.push("You add the " + itemTitle + " to your inventory.");
        }
        else
        {
            result.push("You add " + itemTitle.getUnspecificArticle() + " " + itemTitle + " to your inventory.");
        }
    }
    else
    {
        result.push("You add " + this.quantityDelta + " " + itemTitle + "s to your inventory.");
    }
    if (this.properties)
    {
        var sentencePrefix = null;
        if (this.quantityDelta == 1)
        {
            sentencePrefix = "The possession of the ";
        }
        else
        {
            sentencePrefix = "The possession of ";
        }

        if (this.properties.might > 0)
        {
		   	result.push(sentencePrefix + itemTitle + " increases your might by " + this.properties.might + ".");
        }
        else if (this.properties.might < 0)
        {
		    	result.push(sentencePrefix + itemTitle + " decreases your might by " + Math.abs(this.properties.might) + ".");
        }

        if (this.properties.speed > 0)
        {
            result.push(sentencePrefix + itemTitle + " grants you " + this.properties.speed + " additional speed.");
        }
        else if (this.properties.speed < 0)
        {
            result.push(sentencePrefix + itemTitle + " decreases your speed by " + Math.abs(this.properties.speed) + ".");
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
                result.push(sentencePrefix + itemTitle + " grants you the " + skillTitle + " skill.");
            }
        }
    }
    return result;
}

PlayerDocumentAction_AddInventory.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var quantityDelta = this.quantityDelta;
    if (quantityDelta <= 0)
    {
    	console.error("Invalid argument value for quantityDelta: " + quantityDelta);
    	quantityDelta = 1;
	}

    var item = playerDocument.playerState.currentInventory[this.key];
    if (!item)
    {
        item =
        {
            quantity: quantityDelta,
            properties: this.properties,
        };
        playerDocument.playerState.currentInventory[this.key] = item;
		return;
	}
    var oldQuantity = item.quantity;
    item.quantity += quantityDelta;

    //	return changeArgs
	return [{
	    propertyName: "currentInventory",
		subKey: this.key,
		oldValue: oldQuantity,
		newValue: item.quantity,
	}];
}

PlayerDocumentAction_AddInventory.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var item = playerDocument.playerState.currentInventory[this.key];
    if (!item)
    {
        return;
    }
    var oldQuantity = item.quantity;
    item.quantity -= this.quantityDelta;
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
