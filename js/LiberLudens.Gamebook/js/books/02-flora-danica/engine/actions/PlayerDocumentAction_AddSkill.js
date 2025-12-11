"use strict";

include("StdAfx.js");

function PlayerDocumentAction_AddSkill(slotName, key, silent, noExecute)
{
	this.type = "PlayerDocumentAction_AddSkill";

	this.slotName = slotName;
	this.key = key;
	this.alreadyExists = false;
	this.silent = silent;
	this.noExecute = noExecute;
}

PlayerDocumentAction_AddSkill.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_AddSkill();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.alreadyExists = obj.alreadyExists;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_AddSkill.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	if (this.alreadyExists)
	{
		return null;
	}
	var itemTitle = bookDocument.getSkillText(this.key);
    if (!itemTitle)
    {
        console.error("Skill text for \"" + this.key + "\" not found.");
        itemTitle = "(n/a)";
    }
    return ["You gain a new skill: " + itemTitle + "."];
}

PlayerDocumentAction_AddSkill.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    if (playerDocument.playerState.currentSkills.contains(this.key))
	{
		this.alreadyExists = true;
		return;
	}
    playerDocument.playerState.currentSkills.push(this.key);
	//	return changeArgs
	return [{
	    propertyName: "currentSkills",
		subKey: this.key,
		oldValue: false,
		newValue: true,
	}];
}

PlayerDocumentAction_AddSkill.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    if (!playerDocument.playerState.currentSkills.contains(this.key))
	{
		return;
	}
    if (this.alreadyExists)
    {
    		return;
    }
    playerDocument.playerState.currentSkills.remove(this.key);
	//	return changeArgs
	return [{
	    propertyName: "currentSkills",
	    subKey: this.key,
	    oldValue: true,
	    newValue: false,
	}];
}
