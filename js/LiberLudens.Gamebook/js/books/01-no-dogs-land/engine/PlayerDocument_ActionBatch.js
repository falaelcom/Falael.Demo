"use strict";

include("StdAfx.js");

function PlayerDocument_ActionBatch()
{
	this.actions = [];
}

PlayerDocument_ActionBatch.fromObject = function(obj)
{
	var result = new PlayerDocument_ActionBatch();
	for (var length = obj.actions.length, i = 0; i < length; ++i)
	{
		var item = obj.actions[i];
		var action = null;
		switch (item.type)
		{
		    case "PlayerDocumentAction_SetImplicitData":
		        action = PlayerDocumentAction_SetImplicitData.fromObject(item);
		        break;
			case "PlayerDocumentAction_IncImplicitData":
				action = PlayerDocumentAction_IncImplicitData.fromObject(item);
				break;
			case "PlayerDocumentAction_SetFlags":
				action = PlayerDocumentAction_SetFlags.fromObject(item);
				break;
			case "PlayerDocumentAction_UnsetFlags":
				action = PlayerDocumentAction_UnsetFlags.fromObject(item);
				break;

		    case "PlayerDocumentAction_AddInventory":
		        action = PlayerDocumentAction_AddInventory.fromObject(item);
		        break;
		    case "PlayerDocumentAction_AddKnowledge":
				action = PlayerDocumentAction_AddKnowledge.fromObject(item);
				break;
			case "PlayerDocumentAction_ReplaceKnowledge":
				action = PlayerDocumentAction_ReplaceKnowledge.fromObject(item);
				break;
		    case "PlayerDocumentAction_AddSkill":
		        action = PlayerDocumentAction_AddSkill.fromObject(item);
		        break;
			case "PlayerDocumentAction_AddTimeSpan":
				action = PlayerDocumentAction_AddTimeSpan.fromObject(item);
				break;
		    case "PlayerDocumentAction_ChangeEnergy":
		        action = PlayerDocumentAction_ChangeEnergy.fromObject(item);
		        break;
		    case "PlayerDocumentAction_ChangeHealth":
		        action = PlayerDocumentAction_ChangeHealth.fromObject(item);
		        break;
			case "PlayerDocumentAction_ChangeMight":
			    	action = PlayerDocumentAction_ChangeMight.fromObject(item);
		        break;
		    case "PlayerDocumentAction_ChangeContext":
		        action = PlayerDocumentAction_ChangeContext.fromObject(item);
		        break;
		    case "PlayerDocumentAction_ChangeSpeed":
		        action = PlayerDocumentAction_ChangeSpeed.fromObject(item);
		        break;
		    case "PlayerDocumentAction_ChangeStance":
		        action = PlayerDocumentAction_ChangeStance.fromObject(item);
		        break;
		    case "PlayerDocumentAction_EnterRoom":
				action = PlayerDocumentAction_EnterRoom.fromObject(item);
				break;
		    case "PlayerDocumentAction_ExitOnce":
		        action = PlayerDocumentAction_ExitOnce.fromObject(item);
		        break;
		    case "PlayerDocumentAction_InsertText":
		        action = PlayerDocumentAction_InsertText.fromObject(item);
		        break;
			case "PlayerDocumentAction_SelectInsertText":
				action = PlayerDocumentAction_SelectInsertText.fromObject(item);
				break;
			case "PlayerDocumentAction_InsertExit":
				action = PlayerDocumentAction_InsertExit.fromObject(item);
				break;
			case "PlayerDocumentAction_RemoveInventory":
				action = PlayerDocumentAction_RemoveInventory.fromObject(item);
				break;
			case "PlayerDocumentAction_Combat1_0_EnemyOptions":
				action = PlayerDocumentAction_Combat1_0_PlayerOptions.fromObject(item);
				break;
			case "PlayerDocumentAction_Combat1_0_EnemyTurn":
				action = PlayerDocumentAction_Combat1_0_EnemyTurn.fromObject(item);
				break;
			case "PlayerDocumentAction_Combat1_0_PlayerOptions":
				action = PlayerDocumentAction_Combat1_0_PlayerOptions.fromObject(item);
				break;
			case "PlayerDocumentAction_Combat1_0_PlayerTurn":
				action = PlayerDocumentAction_Combat1_0_PlayerTurn.fromObject(item);
				break;
			case "PlayerDocumentAction_Combat1_0_Start":
				action = PlayerDocumentAction_Combat1_0_Start.fromObject(item);
				break;
			case "PlayerDocumentAction_RollDice":
				action = PlayerDocumentAction_RollDice.fromObject(item);
				break;
			case "PlayerDocumentAction_RollRandomInt":
				action = PlayerDocumentAction_RollRandomInt.fromObject(item);
				break;
			case "PlayerDocumentAction_SetGameDateTime":
				action = PlayerDocumentAction_SetGameDateTime.fromObject(item);
				break;
			case "PlayerDocumentAction_StartTimer":
				action = PlayerDocumentAction_StartTimer.fromObject(item);
				break;
			case "PlayerDocumentAction_StopTimer":
				action = PlayerDocumentAction_StopTimer.fromObject(item);
				break;

			case "PlayerDocumentAction_AddBookmark":
				action = PlayerDocumentAction_AddBookmark.fromObject(item);
				break;
			default:
				console.error("Not implemented: " + item.type);
				continue;
		}
		result.actions.push(action);
	}
	return result;
}

PlayerDocument_ActionBatch.prototype.add = function(action)
{
	this.actions.push(action);
}

PlayerDocument_ActionBatch.prototype.execute = function(playerDocument)
{
	var cumulativeChangeArgs = [];
	for (var length = this.actions.length, i = 0; i < length; ++i)
	{
		var item = this.actions[i];

		//log(911, item);

		var changeArgsArray = item.execute(playerDocument);
	    if (!changeArgsArray || !changeArgsArray.length)
	    {
	        continue;
	    }
	    cumulativeChangeArgs = cumulativeChangeArgs.concat(changeArgsArray);
	}
	return cumulativeChangeArgs;
}

PlayerDocument_ActionBatch.prototype.rollback = function(playerDocument)
{
	var cumulativeChangeArgs = [];
	for (var i = this.actions.length - 1; i >= 0; --i)
	{
		var changeArgsArray = this.actions[i].rollback(playerDocument);
		if (!changeArgsArray || !changeArgsArray.length)
		{
			continue;
		}
		cumulativeChangeArgs = cumulativeChangeArgs.concat(changeArgsArray);
	}
	return cumulativeChangeArgs;
}

PlayerDocument_ActionBatch.prototype.appendBatch = function(actionBatch)
{
	for (var length = actionBatch.actions.length, i = 0; i < length; ++i)
	{
		this.actions.push(actionBatch.actions[i]);
	}
}