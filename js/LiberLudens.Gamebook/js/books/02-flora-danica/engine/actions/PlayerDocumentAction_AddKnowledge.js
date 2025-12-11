"use strict";

include("StdAfx.js");

function PlayerDocumentAction_AddKnowledge(slotName, key, silent, noExecute)
{
	this.type = "PlayerDocumentAction_AddKnowledge";

	this.slotName = slotName;
	this.key = key;
	this.alreadyExists = false;
	this.silent = silent;
	this.noExecute = noExecute;
}

PlayerDocumentAction_AddKnowledge.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_AddKnowledge();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.alreadyExists = obj.alreadyExists;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_AddKnowledge.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}
	if (this.alreadyExists)
	{
		return null;
	}
	var itemTitle = bookDocument.getKnowledgeText(this.key);
    if (!itemTitle)
    {
        console.error("Knowledge text for \"" + this.key + "\" not found.");
        itemTitle = "(n/a)";
    }
    return ["You learn something: " + itemTitle + "."];
}

PlayerDocumentAction_AddKnowledge.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    if (playerDocument.playerState.currentKnowledge.contains(this.key))
    {
   		this.alreadyExists = true;
		return;
	}
	playerDocument.playerState.currentKnowledge.push(this.key);
	//	return changeArgs
	return [{
		propertyName: "currentKnowledge",
		subKey: this.key,
		oldValue: false,
		newValue: true,
	}];
}

PlayerDocumentAction_AddKnowledge.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    if (!playerDocument.playerState.currentKnowledge.contains(this.key))
	{
		return;
    }
    if (this.alreadyExists)
    {
		return;
    }
	playerDocument.playerState.currentKnowledge.remove(this.key);
	//	return changeArgs
	return [{
		propertyName: "currentKnowledge",
		subKey: this.key,
		oldValue: true,
		newValue: false,
	}];
}
