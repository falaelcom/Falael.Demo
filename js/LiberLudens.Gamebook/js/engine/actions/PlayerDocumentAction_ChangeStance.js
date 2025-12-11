"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ChangeStance(slotName, key, properties, oldKey, oldProperties, silent, noExecute)
{
    this.type = "PlayerDocumentAction_ChangeStance";

    this.slotName = slotName;
    this.key = key;
    this.properties = Object.copy(properties);
    this.oldKey = oldKey;
    this.oldProperties = Object.copy(oldProperties);
    this.silent = silent;
    this.noExecute = noExecute;
}

PlayerDocumentAction_ChangeStance.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_ChangeStance();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.properties = obj.properties;
	result.oldKey = obj.oldKey;
	result.oldProperties = obj.oldProperties;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ChangeStance.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	var stanceTextItems = bookDocument.getStanceTextItems(this.key);
    if (!stanceTextItems)
    {
        console.error("Stance text items for \"" + this.key + "\" not found.");
        stanceTextItems =
        {
            title: "(n/a)",
            transition: "(Unknown stance key " + this.key + ")",
        };
    }

    var result = [];
    result.push(stanceTextItems.transition);

    if (this.properties)
    {
    		if (this.properties.might > 0)
        {
    			result.push("When " + stanceTextItems.title + " your might increases by " + this.properties.might + ".");
        }
        else if (this.properties.might < 0)
        {
        		result.push("When " + stanceTextItems.title + " your might decreases by " + this.properties.might + ".");
        }

        if (this.properties.speed > 0)
        {
            result.push("When " + stanceTextItems.title + " you have " + this.properties.speed + " increased speed.");
        }
        else if (this.properties.speed < 0)
        {
            result.push("When " + stanceTextItems.title + " you have " + this.properties.speed + " decreased speed.");
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
                result.push("When " + stanceTextItems.title + " you gain the " + skillTitle + " skill.");
            }
        }
    }
    
    return result;
}

PlayerDocumentAction_ChangeStance.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentStance;
    playerDocument.playerState.currentStance =
    {
        key: this.key,
        properties: this.properties,
    };

    //	return changeArgs
	return [{
	    propertyName: "currentStance",
	    oldValue: Object.copy(oldValue),
	    	newValue: Object.copy(playerDocument.playerState.currentStance),
	}];
}

PlayerDocumentAction_ChangeStance.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    var oldValue = playerDocument.playerState.currentStance;
    if (!this.oldKey)
    {
    		playerDocument.playerState.currentStance = null;
    }
    else
    {
    		playerDocument.playerState.currentStance =
		{
			key: this.oldKey,
			properties: this.oldProperties,
		};
    }

    //	return changeArgs
    return [{
        propertyName: "currentStance",
        oldValue: Object.copy(oldValue),
        newValue: Object.copy(playerDocument.playerState.currentStance),
    }];
}
