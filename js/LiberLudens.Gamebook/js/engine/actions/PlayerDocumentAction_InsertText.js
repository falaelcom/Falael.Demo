"use strict";

include("StdAfx.js");

function PlayerDocumentAction_InsertText(slotName, condition, textId, onlyOnceKey, noExecute)
{
	this.type = "PlayerDocumentAction_InsertText";

	this.slotName = slotName;
	this.condition = condition;
	this.textId = textId;
	this.onlyOnceKey = onlyOnceKey;
	this.noExecute = noExecute;
}

PlayerDocumentAction_InsertText.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_InsertText();
	result.slotName = obj.slotName;
	result.condition = obj.condition;
	result.textId = obj.textId;
	result.onlyOnceKey = obj.onlyOnceKey;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_InsertText.prototype.getText = function (playerDocument, bookDocument)
{
	//new WPlayerDocument_Timeline(playerDocument.timeline).writeToConsole("INSERT TEXT");

	if (this.condition)
	{
		if (!playerDocument.testCondition(this.condition))
		{
			return null;
		}
	}
	if (this.onlyOnceKey)
	{
		if (playerDocument.hasInsertTextOnce(this.onlyOnceKey))
		{
			return null;
		}
		playerDocument.playerState.currentInsertTextOnce[this.onlyOnceKey] = true;
	}
	var text = bookDocument.getTextDef(this.textId);
    if (!text)
    {
        console.error("Text def with id \"" + this.textId + "\" not found.");
        return null;
    }
    return text;
}

PlayerDocumentAction_InsertText.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    //	return changeArgs
	return null;
}

PlayerDocumentAction_InsertText.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    if (this.onlyOnceKey)
    {
    	delete playerDocument.playerState.currentInsertTextOnce[this.onlyOnceKey];
    }

    //	return changeArgs
    return null;
}
