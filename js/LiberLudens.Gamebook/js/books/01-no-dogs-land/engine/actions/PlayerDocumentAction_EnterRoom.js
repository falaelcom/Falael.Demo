"use strict";

include("StdAfx.js");

function PlayerDocumentAction_EnterRoom(key, previousRoomKey, onlyOnce)
{
	this.type = "PlayerDocumentAction_EnterRoom";

	this.key = key;
	this.previousRoomKey = previousRoomKey;
	this.onlyOnce = onlyOnce;
}

PlayerDocumentAction_EnterRoom.fromObject = function(obj)
{
	var result = new PlayerDocumentAction_EnterRoom();
	result.key = obj.key;
	result.previousRoomKey = obj.previousRoomKey;
	result.onlyOnce = obj.onlyOnce;
	return result;
}

PlayerDocumentAction_EnterRoom.prototype.execute = function(playerDocument)
{
	if (this.key == playerDocument.playerState.currentRoomKey)
	{
		return;
	}
	if(this.onlyOnce)
	{
	    if (playerDocument.playerState.currentEnterOnce[this.key])
	    {
	        return;
	    }
	    playerDocument.playerState.currentEnterOnce[this.key] = true;
	}

	var oldValue = playerDocument.playerState.currentRoomKey;
	playerDocument.playerState.currentRoomKey = this.key;

	//	return changeArgs
	return [{
		propertyName: "currentRoomKey",
		oldValue: oldValue,
		newValue: playerDocument.playerState.currentRoomKey,
	}];
}

PlayerDocumentAction_EnterRoom.prototype.rollback = function(playerDocument)
{
	if (this.previousRoomKey == playerDocument.playerState.currentRoomKey)
	{
		return;
	}
	if (this.onlyOnce)
	{
	    delete playerDocument.playerState.currentEnterOnce[this.key];
	}

	var oldValue = playerDocument.playerState.currentRoomKey;
	playerDocument.playerState.currentRoomKey = this.previousRoomKey;

	//	return changeArgs
	return [{
		propertyName: "currentRoomKey",
		oldValue: oldValue,
		newValue: playerDocument.playerState.currentRoomKey,
	}];
}
