"use strict";

include("StdAfx.js");

function PlayerDocumentAction_SelectInsertText(slotName, items, noExecute)
{
	this.type = "PlayerDocumentAction_SelectInsertText";

	this.slotName = slotName;
	this.items = items;
	this.onlyOnceKey = null;
	this.noExecute = noExecute;
}

PlayerDocumentAction_SelectInsertText.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_SelectInsertText();
	result.slotName = obj.slotName;
	result.items = obj.items;
	result.onlyOnceKey = obj.onlyOnceKey;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_SelectInsertText.prototype.getText = function (playerDocument, bookDocument)
{
	//new WPlayerDocument_Timeline(playerDocument.timeline).writeToConsole("INSERT TEXT");

	for (var i = 0, length = this.items.length; i < length; ++i)
	{
		var item = this.items[i];

		if (item.condition)
		{
			if (!playerDocument.testCondition(item.condition))
			{
				continue;
			}
		}
		if (item.onlyOnce)
		{
			if (playerDocument.hasInsertTextOnce(item.onlyOnce))
			{
				continue;
			}
			playerDocument.playerState.currentInsertTextOnce[item.onlyOnce] = true;
			this.onlyOnceKey = item.onlyOnce;
		}

		var text = bookDocument.getTextDef(item.textId);
		if (!text)
		{
			console.error("Text def with id \"" + item.textId + "\" not found.");
			return null;
		}
		return text;
	}
}

PlayerDocumentAction_SelectInsertText.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }

    //	return changeArgs
	return null;
}

PlayerDocumentAction_SelectInsertText.prototype.rollback = function(playerDocument)
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
