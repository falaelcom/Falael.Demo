"use strict";

include("StdAfx.js");

function PlayerDocumentAction_ChangeContext(expression, oldContext, noExecute)
{
	this.type = "PlayerDocumentAction_ChangeContext";

	this.expression = expression;
	this.oldContext = Object.copy(oldContext);
	this.noExecute = noExecute;
}

PlayerDocumentAction_ChangeContext.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_ChangeContext();
	result.expression = obj.expression;
	result.oldContext = obj.oldContext;
	result.noExecute = obj.noExecute;
	return result;
}

PlayerDocumentAction_ChangeContext.prototype.execute = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    PlayerDocument.evaluateExpression(this.expression, playerDocument.playerState.currentContext);
	//	return changeArgs
	return [{
	    propertyName: "currentContext",
	    oldValue: Object.copy(this.oldContext),
	    newValue: Object.copy(playerDocument.playerState.currentContext),
	}];
}

PlayerDocumentAction_ChangeContext.prototype.rollback = function(playerDocument)
{
    if (this.noExecute)
    {
        return;
    }
    var currentContext = playerDocument.playerState.currentContext;
    playerDocument.playerState.currentContext = Object.copy(this.oldContext);
    //	return changeArgs
    return [{
        propertyName: "currentContext",
        oldValue: Object.copy(currentContext),
        newValue: Object.copy(this.oldContext),
    }];
}
