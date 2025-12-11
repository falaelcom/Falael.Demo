"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ReplaceKnowledge(slotName, key, oldKey, silent, noExecute)
{
	this.type = "PlayerDocumentAction_ReplaceKnowledge";

	this.slotName = slotName;
	this.key = key;
	this.oldKey = oldKey;
	this.silent = silent;
	this.noExecute = noExecute;
}

PlayerDocumentAction_ReplaceKnowledge.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_ReplaceKnowledge();
	result.slotName = obj.slotName;
	result.key = obj.key;
	result.oldKey = obj.oldKey;
	result.silent = obj.silent;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ReplaceKnowledge.prototype.getActionListStrings = function(bookDocument)
{
	if (this.silent)
	{
		return null;
	}

	//var oldKnowledgeTitle = bookDocument.getKnowledgeText(this.oldKey);
	//if (!oldKnowledgeTitle)
	//{
	//	console.error("Knowledge text for \"" + this.oldKey + "\" not found.");
	//	oldKnowledgeTitle = "(n/a)";
	//}

	var newKnowledgeTitle = bookDocument.getKnowledgeText(this.key);
	if (!newKnowledgeTitle)
    {
        console.error("Knowledge text for \"" + this.key + "\" not found.");
        newKnowledgeTitle = "(n/a)";
    }
	return ["You learn something: " + newKnowledgeTitle + "."];
}

PlayerDocumentAction_ReplaceKnowledge.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    if (playerDocument.playerState.currentKnowledge.contains(this.key))
	{
	    console.error("Knowledge already available: \"" + this.key + "\". The rollback operation will yield an inconsistent result.");
	}
    else
    {
    	playerDocument.playerState.currentKnowledge.push(this.key);
    }

    if (!playerDocument.playerState.currentKnowledge.contains(this.oldKey))
    {
    	console.error("Knowledge not available: \"" + this.oldKey + "\". The rollback operation will yield an inconsistent result.");
    }
    else
    {
    	playerDocument.playerState.currentKnowledge.remove(this.oldKey);
    }

	//	return changeArgs
	return [{
		propertyName: "currentKnowledge",
		oldValue: this.oldKey,
		newValue: this.key,
	}];
}

PlayerDocumentAction_ReplaceKnowledge.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    if (playerDocument.playerState.currentKnowledge.contains(this.oldKey))
    {
    	console.error("Knowledge already available: \"" + this.oldKey + "\".");
    }
    else
    {
    	playerDocument.playerState.currentKnowledge.push(this.oldKey);
    }

    if (!playerDocument.playerState.currentKnowledge.contains(this.key))
    {
    	console.error("Knowledge not available: \"" + this.key + "\".");
    }
    else
    {
    	playerDocument.playerState.currentKnowledge.remove(this.key);
    }

	//	return changeArgs
	return [{
		propertyName: "currentKnowledge",
		oldValue: this.key,
		newValue: this.oldKey,
	}];
}
