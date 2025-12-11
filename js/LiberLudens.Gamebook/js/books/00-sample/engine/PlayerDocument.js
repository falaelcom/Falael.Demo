"use strict";

include("StdAfx.js");

include("WPlayerDocument_Timer.js");
include("WPlayerDocument_Timeline.js");

include("PlayerDocument_ActionBatch.js");
include("PlayerDocument_Chaos.js");

include("actions/PlayerDocumentAction_EnterRoom.js");

include("actions/PlayerDocumentAction_AddKnowledge.js");
include("actions/PlayerDocumentAction_ReplaceKnowledge.js");
include("actions/PlayerDocumentAction_AddInventory.js");
include("actions/PlayerDocumentAction_AddBookmark.js");
include("actions/PlayerDocumentAction_RemoveInventory.js");
include("actions/PlayerDocumentAction_SetImplicitData.js");
include("actions/PlayerDocumentAction_IncImplicitData.js");
include("actions/PlayerDocumentAction_SetFlags.js");
include("actions/PlayerDocumentAction_UnsetFlags.js");
include("actions/PlayerDocumentAction_AddSkill.js");

include("actions/PlayerDocumentAction_RollDice.js");
include("actions/PlayerDocumentAction_RollRandomInt.js");

include("actions/PlayerDocumentAction_ChangeHealth.js");
include("actions/PlayerDocumentAction_ChangeEnergy.js");
include("actions/PlayerDocumentAction_ChangeMight.js");
include("actions/PlayerDocumentAction_ChangeSpeed.js");
include("actions/PlayerDocumentAction_ChangeStance.js");
include("actions/PlayerDocumentAction_ChangeContext.js");

include("actions/PlayerDocumentAction_SetGameDateTime.js");
include("actions/PlayerDocumentAction_AddTimeSpan.js");

include("actions/PlayerDocumentAction_InsertText.js");
include("actions/PlayerDocumentAction_SelectInsertText.js");
include("actions/PlayerDocumentAction_InsertExit.js");

include("actions/PlayerDocumentAction_StartTimer.js");
include("actions/PlayerDocumentAction_StopTimer.js");

ft_include(EFeature.combat1_0, "combat1.0/WCombat1_0_History.js");
ft_include(EFeature.combat1_0, "combat1.0/PlayerDocumentAction_Combat1_0_Start.js");
ft_include(EFeature.combat1_0, "combat1.0/PlayerDocumentAction_Combat1_0_PlayerOptions.js");
ft_include(EFeature.combat1_0, "combat1.0/PlayerDocumentAction_Combat1_0_PlayerTurn.js");
ft_include(EFeature.combat1_0, "combat1.0/PlayerDocumentAction_Combat1_0_EnemyOptions.js");
ft_include(EFeature.combat1_0, "combat1.0/PlayerDocumentAction_Combat1_0_EnemyTurn.js");


function PlayerDocument(bookDocument)
{
	this.bookDocument = bookDocument;

	this.storage = new OfflineStorage();

	this.playerState = PlayerDocument.createEmptyPlayerState();
	this.history = [];
	this.bookmarks = {};
	this.timeline = WPlayerDocument_Timeline.create();
	this.currentActionBatch = null;
	this.chaos = new PlayerDocument_Chaos();

	this.change = new MulticastDelegate();
	this.onPlayerInteraction = new MulticastDelegate();
}

PlayerDocument.createEmptyPlayerState = function ()
{
	//	adjust also this.getCurrentContextWithStats() when adding new player state properties
	return {
		currentRoomKey: null,
		startTimecode: null,
		currentTimecode: 0,									//	the current absolute date and time of the plot progress (timecode encodes a GameDateTime)
		currentTimesig: GameTimeSpan.zero.getTimesig(),		//	the current timespan since the game began, a sum of all played room durations, exit durations and transportation durations (timesig encodes a GameTimeSpan)

		currentDiceRoll: 0,
		currentRandomInt: 0,
		currentCombat1_0State: null,

		currentKnowledge: [],
		currentSkills: [],
		currentInventory: {},
		currentImplicitData: {},
		currentFlags: {},

		currentHealth: 0,
		currentEnergy: 0,
		currentMight: 0,
		currentSpeed: 0,

		currentStance: null,

		currentEnterOnce: {},
		currentInsertTextOnce: {},
		currentContext: {},

		timers: {},
	};
}


PlayerDocument.prototype.toJSON = function ()
{
	try
	{
		return JSON.stringify(
		{
			playerState: this.playerState,
			history: this.history,
			bookmarks: this.bookmarks,
			timeline: this.timeline,
		});
	}
	catch (ex)
	{
		console.error(ex);
		return;
	}
}

PlayerDocument.prototype.readJSON = function (json)
{
	if (!json)
	{
		throw "Empty JSON";
	}

	var state;
	try
	{
		state = JSON.parse(json);
	}
	catch (ex)
	{
		console.error(ex);
		return;
	}

	if (!state.playerState)
	{
		console.error("bad player document state (1)");
		return;
	}
	if (!state.history)
	{
		console.error("bad player document state (2)");
		return;
	}
	if (!state.bookmarks)
	{
		console.error("bad player document state (3)");
		return;
	}

	this.playerState = state.playerState;
	this.timeline = state.timeline;
	this.bookmarks = state.bookmarks;

	for (var length = state.history.length, i = 0; i < length; ++i)
	{
		var item = state.history[i];
		this.history.push(PlayerDocument_ActionBatch.fromObject(item));
	}

}

PlayerDocument.prototype.load = function (mainRoom, restartRoom, callback)
{
	var json = this.storage.get(window.appConfig.bookId);

	var defaultRoom = this.getIsSoftRestart() ? restartRoom : mainRoom;

	if (!json)
	{
		this.navigate(defaultRoom, null, null);

		return callback ? callback() : null;
	}

	this.readJSON(json, defaultRoom.key);

	return callback ? callback() : null;
}

PlayerDocument.prototype.save = function (callback)
{
	this.storage.set(window.appConfig.bookId, this.toJSON());

	return callback ? callback() : null;
}

PlayerDocument.prototype.clear = function (callback)
{
	this.history = [];

	this.playerState = PlayerDocument.createEmptyPlayerState();

	this.storage.remove(window.appConfig.bookId);

	return callback ? callback() : null;
}

PlayerDocument.prototype.getStorageSize = function ()
{
	var json = this.storage.get(window.appConfig.bookId);
	return json ? json.length : 0;
}


PlayerDocument.prototype.navigate = function (nextRoom, currentRoom, currentRoomExit, onlyOnce, noExecuteActions)
{
	this.onPlayerInteraction.execute(this,
	{
		name: "navigate",
		data:
		{
			sourceRoomKey: currentRoom ? currentRoom.key : null,
			targetRoomKey: nextRoom ? nextRoom.key : null,
		},
	});

	if (currentRoomExit && currentRoomExit.systemTarget)
	{
		nextRoom = this.navigate_toSystemTarget(currentRoom, currentRoomExit);
		if (!nextRoom)
		{
			return;
		}
	}

	var currentRoomKey = currentRoom ? currentRoom.key : null;

	this.executeActionArray(currentRoomKey, [], true, false, noExecuteActions);

	var actionArray = [];

	if (currentRoom)
	{
		actionArray.push(
		{
			slotName: "exit",
			action: currentRoom.onRoomExit,
		});
	}

	if (currentRoomExit)
	{
		actionArray.push(
		{
			slotName: "exit",
			action: currentRoomExit.onExit,
		});
	}

	if (currentRoomExit && currentRoomExit.duration)
	{
		actionArray.push(
		{
			slotName: "exit",
			action: { addTime: currentRoomExit.duration },
		});
	}

	switch (nextRoom.type)
	{
		case "text":
			if (currentRoom && currentRoomExit)
			{
				var distance = this.bookDocument.getDistanceBetweenRooms(currentRoom, nextRoom, currentRoomExit.route);
				if (distance != -1)
				{
					var speedKmH = this.getCurrentSpeed() * this.bookDocument.getSpeedPointsToKmH();
					var distanceKm = distance / 1000;
					var travelTimeH = distanceKm / speedKmH;
					var travelTimeSec = Math.round(travelTimeH * GameDateTime.secondsInHour);
					var gameTimeStamp = GameTimeSpan.fromTotalSeconds(travelTimeSec);

					actionArray.push(
					{
						slotName: "exit",
						action: { addTime: gameTimeStamp.toString() },
					});
				}
			}

			this.executeActionArray(currentRoomKey, actionArray, false, false, noExecuteActions);

			new WPlayerDocument_Timeline(this.timeline).addTimeCycle(currentRoom, currentRoomExit, this.playerState.currentTimesig);

			if (currentRoomExit)
			{
				this.executeActionArray(currentRoomKey,
				[{
					slotName: "exit",
					action: currentRoomExit.onExitFinish,
				}], false, false, noExecuteActions);
			}

			this.navigate_toTextRoom(nextRoom, currentRoom, currentRoomExit, onlyOnce, noExecuteActions);
			break;
		case "hub":
			if (!nextRoom.exits || !nextRoom.exits.length)
			{
				throw "Invalid hub room definition; must have a non-empty \"exits\" collection.";
			}

			this.executeActionArray(currentRoomKey, actionArray, false, false, noExecuteActions);

			new WPlayerDocument_Timeline(this.timeline).addTimeCycle(currentRoom, currentRoomExit, this.playerState.currentTimesig);

			//new WPlayerDocument_Timeline(this.timeline).writeToConsole("SELECT HUB EXIT");

			var hubRoom = nextRoom;
			var nextTextRoom = null;
			
			var hubRoomChain = [hubRoom];
			var maxHubRoomChainLength = 100;

			do
			{
				var actionArray = [];
				actionArray.push(
				{
					slotName: "enter",
					action: hubRoom.onRoomEnter,
				});
				if (hubRoom.dateTime)
				{
					actionArray.push(
					{
						slotName: "enter",
						action: { setDateTime: hubRoom.dateTime },
					});
				}
				this.executeActionArray(hubRoom.key, actionArray, false, false, noExecuteActions);

				var selectedExit = null;
				for (var length = hubRoom.exits.length, i = 0; i < length; ++i)
				{
					var exit = hubRoom.exits[i];
					if (!exit.condition)
					{
						selectedExit = exit;
						break;
					}
					if (this.testCondition(exit.condition))
					{
						selectedExit = exit;
						break;
					}
				}
				if (!selectedExit)
				{
					console.error("Could not find a valid exit for the current context state; consider adding one last conditionless exit as a default exit.", hubRoomChain);
					return;
				}

				actionArray = [];

				actionArray.push(
				{
					slotName: "exit",
					action: hubRoom.onRoomExit,
				});

				actionArray.push(
				{
					slotName: "exit",
					action: selectedExit.onExit,
				});

				if (selectedExit.duration)
				{
					actionArray.push(
					{
						slotName: "exit",
						action: { addTime: selectedExit.duration },
					});
				}

				var selectedTargetRoom = null;
				if (selectedExit.systemTarget)
				{
					selectedTargetRoom = this.navigate_toSystemTarget(hubRoom, selectedExit);
					if (!selectedTargetRoom)
					{
						return;
					}
				}
				else
				{
					selectedTargetRoom = this.bookDocument.getRoom(selectedExit.target);
					if (!selectedTargetRoom)
					{
						console.error("Room key \"" + selectedExit.target + "\" not found (3) (hub room " + nextRoom.key + ").", hubRoomChain);
						return;
					}
				}

				if (currentRoom)
				{
					var distance = this.bookDocument.getDistanceBetweenRooms(currentRoom, selectedTargetRoom, selectedExit.route || (currentRoomExit || {}).route);
					if (distance != -1)
					{
						var speedKmH = this.getCurrentSpeed() * this.bookDocument.getSpeedPointsToKmH();
						var distanceKm = distance / 1000;
						var travelTimeH = distanceKm / speedKmH;
						var travelTimeSec = Math.round(travelTimeH * GameDateTime.secondsInHour);
						var gameTimeStamp = GameTimeSpan.fromTotalSeconds(travelTimeSec);

						actionArray.push(
						{
							slotName: "exit",
							action: { addTime: gameTimeStamp.toString() },
						});
					}
				}

				this.executeActionArray(hubRoom.key, actionArray, false, false, noExecuteActions);

				new WPlayerDocument_Timeline(this.timeline).addHubTime(hubRoom, selectedExit, this.playerState.currentTimesig);

				this.executeActionArray(hubRoom.key,
				[{
					slotName: "exit",
					action: selectedExit.onExitFinish,
				}], false, false, noExecuteActions);

				if (selectedTargetRoom.type == "text")
				{
					nextTextRoom = selectedTargetRoom;
					hubRoom = null;
				}
				else
				{
					hubRoom = selectedTargetRoom;
					hubRoomChain.push(hubRoom);
					if (hubRoomChain.length > maxHubRoomChainLength)
					{
						console.error("Max hub room chain length exceeded, hub chain is: ", hubRoomChain);
						break;
					}
				}
			}
			while (hubRoom);

			if (currentRoomExit)
			{
				this.executeActionArray(currentRoomKey,
				[{
					slotName: "exit",
					action: currentRoomExit.onExitFinish,
				}], false, false, noExecuteActions);
			}

			this.navigate_toTextRoom(nextTextRoom, currentRoom, currentRoomExit, onlyOnce, noExecuteActions);
			break;
		default:
			throw "Not implemented.";
	}
}

PlayerDocument.prototype.navigate_toTextRoom = function (nextRoom, currentRoom, currentRoomExit, onlyOnce, noExecuteActions)
{
	var roomKey = nextRoom.key;

	var actionDataArray = [];

	actionDataArray.push(
	{
		slotName: "enter",
		action: { enterRoom: { roomKey: roomKey, onlyOnce: onlyOnce } },
	});

	actionDataArray.push(
    {
   		slotName: "enter",
   		action: nextRoom.onRoomEnter,
    });
	if (nextRoom.dateTime)
	{
		actionDataArray.push(
		{
			slotName: "enter",
			action: { setDateTime: nextRoom.dateTime },
		});
	}

	this.executeActionArray(roomKey, actionDataArray, false, false, noExecuteActions);

	for (var key in nextRoom.onSlots)
	{
		var onSlot = nextRoom.onSlots[key];
		this.executeActionArray(roomKey,
		[{
			slotName: key,
			action: onSlot,
		}], false, false, noExecuteActions);
	}

	actionDataArray = [];
	this.addFinishActions(actionDataArray, nextRoom);

	if (nextRoom.combat1_0)
	{
		actionDataArray.push(
		{
			slotName: "combat1_0",
			action: { combat1_0: nextRoom.combat1_0 },
		});
	}

	this.executeActionArray(roomKey, actionDataArray, false, false, noExecuteActions);

	new WPlayerDocument_Timeline(this.timeline).setRoomTime(nextRoom, this.playerState.currentTimesig);

	this.executeActionArray(roomKey, [], false, true, noExecuteActions);	//	commits an empty action batch with flush == true, which effectively forces the view to refresh
}

PlayerDocument.prototype.navigate_toSystemTarget = function (sourceRoom, systemTargetExit)
{
	switch(systemTargetExit.systemTarget)
	{
		case "startOver":
			this.restart("startOver");
			return null;
		case "startOver_fromTitle":
			this.restart("fromTitle");
			return null;
		default:
			if (systemTargetExit.systemTarget.indexOf("history(") == 0)
			{
				var stepCount = parseInt(systemTargetExit.systemTarget.substr("history(".length));
				if (isNaN(stepCount))
				{
					throw "Invalid history step count in system exit target \"" + systemTargetExit.systemTarget + "\", source room \"" + sourceRoom.key + "\"";
				}
				return this.getHistoryRoom(stepCount);
			}
			else if (systemTargetExit.systemTarget.indexOf("bookmark(") == 0)
			{
				var bookmarkKey = systemTargetExit.systemTarget.substr("bookmark(".length);
				bookmarkKey = bookmarkKey.substr(0, bookmarkKey.length - 1);
				var roomKey = this.getBookmark(bookmarkKey);
				if (!roomKey)
				{
					throw "Invalid bookmark key in system exit target \"" + systemTargetExit.systemTarget + "\", bookmark key \"" + bookmarkKey + "\", source room \"" + sourceRoom.key + "\"";
				}
				var room = this.bookDocument.getRoom(roomKey);
				if (!room)
				{
					throw "Invalid bookmark value in system exit target \"" + systemTargetExit.systemTarget + "\", bookmark key \"" + bookmarkKey + "\", room key \"" + roomKey + "\", source room \"" + sourceRoom.key + "\"";
				}
				return room;
			}
			throw "Not implemented.";
	}
}

PlayerDocument.prototype.addFinishActions = function (actionDataArray, nextRoom)
{
	if (!nextRoom)
	{
		return;
	}

	actionDataArray.push(
	{
		slotName: "finish",
		action: nextRoom.onRoomFinish,
	});

	if (!nextRoom.duration)
	{
		return;
	}

	actionDataArray.unshift(
	{
		slotName: "finish",
		action: { addTime: nextRoom.duration },
	});
}

PlayerDocument.prototype.executeActionArray = function (roomKey, actionDataArray, startHistoryBatch, flush, noExecuteActions)
{
	this.startActionBatch();
	for (var length = actionDataArray.length, i = 0; i < length; ++i)
	{
		var actionItem = actionDataArray[i];
		if (!actionItem)
		{
			continue;
		}

		var slotName = actionItem.slotName;
		var actionData = actionItem.action;

		if (!actionData)
		{
			continue;
		}

		var silent = actionData.silent;

		if (actionData.enterRoom)
		{
			var action = new PlayerDocumentAction_EnterRoom(actionData.enterRoom.roomKey, this.playerState.currentRoomKey, actionData.enterRoom.onlyOnce);
			this.executeAction(action);
		}

		//	the order of actionData.addTime and actionData.setDateTime is significant, in case both are used in combination
		if (actionData.addTime)
		{
			var action = new PlayerDocumentAction_AddTimeSpan(slotName, actionData.addTime, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.setDateTime)
		{
			var action = new PlayerDocumentAction_SetGameDateTime(slotName, actionData.setDateTime, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.chaos)
		{
			if (!actionData.chaos.length)
			{
				console.error("chaos requires a non-empty array as value.", actionData);
			}
			this.chaos.apply(actionData.chaos);
			for (var length2 = actionData.chaos.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.chaos[i2];
				switch (item2.type)
				{
					case "diceRoll":
						var action = new PlayerDocumentAction_RollDice(slotName, this.chaos.getDiceRoll(), this.getCurrentDiceRoll(), silent, noExecuteActions);
						this.executeAction(action);
						break;
					case "randomInt":
						var action = new PlayerDocumentAction_RollRandomInt(slotName, this.chaos.getRandomInt(), this.getCurrentRandomInt(), noExecuteActions);
						this.executeAction(action);
						break;
					default:
						console.error("Unrecognized chaos type: \"" + item2.type + "\".");
						break;
				}
			}
		}
		if (actionData.addKnowledge)
		{
			if (!actionData.addKnowledge.length)
			{
				console.error("addKnowledge requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.addKnowledge.length, i2 = 0; i2 < length2; ++i2)
			{
				var action = new PlayerDocumentAction_AddKnowledge(slotName, actionData.addKnowledge[i2], silent, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.replaceKnowledge)
		{
			var action = new PlayerDocumentAction_ReplaceKnowledge(slotName, actionData.replaceKnowledge.to, actionData.replaceKnowledge.from, silent, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.addInventory)
		{
			if (!actionData.addInventory.length)
			{
				console.error("addInventory requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.addInventory.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.addInventory[i2];
				var action = new PlayerDocumentAction_AddInventory(slotName, item2.key, item2.quantity, item2.properties, silent, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.removeInventory)
		{
			if (!actionData.removeInventory.length)
			{
				console.error("removeInventory requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.removeInventory.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.removeInventory[i2];
				var existingItem = this.playerState.currentInventory[item2.key];
				if (existingItem)
				{
					var action = new PlayerDocumentAction_RemoveInventory(slotName, item2.key, existingItem.quantity, item2.quantity, existingItem.properties, silent, noExecuteActions);
					this.executeAction(action);
				}
			}
		}
		if (actionData.setImplicitData)
		{
			for (var key in actionData.setImplicitData)
			{
				var action = new PlayerDocumentAction_SetImplicitData(key, actionData.setImplicitData[key], this.playerState.currentImplicitData, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.incImplicitData)
		{
			for (var key in actionData.incImplicitData)
			{
				var action = new PlayerDocumentAction_IncImplicitData(key, actionData.incImplicitData[key], noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.setFlag)
		{
			if (this.playerState.currentFlags[actionData.setFlag])
			{
				continue;
			}
			var action = new PlayerDocumentAction_SetFlags([actionData.setFlag], this.playerState.currentFlags, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.unsetFlag)
		{
			if (!this.playerState.currentFlags[actionData.unsetFlag])
			{
				continue;
			}
			var action = new PlayerDocumentAction_UnsetFlags([actionData.unsetFlag], this.playerState.currentFlags, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.setFlags)
		{
			if (!actionData.setFlags.length)
			{
				console.error("setFlags requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.setFlags.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.setFlags[i2];
				if (this.playerState.currentFlags[item2])
				{
					continue;
				}
				var action = new PlayerDocumentAction_SetFlags(item2, this.playerState.currentFlags, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.unsetFlags)
		{
			if (!actionData.unsetFlags.length)
			{
				console.error("unsetFlags requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.unsetFlags.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.unsetFlags[i2];
				if (!this.playerState.currentFlags[item2])
				{
					continue;
				}
				var action = new PlayerDocumentAction_UnsetFlags(item2, this.playerState.currentFlags, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.changeContext)
		{
			if (!actionData.changeContext.length)
			{
				console.error("changeContext requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.changeContext.length, i2 = 0; i2 < length2; ++i2)
			{
				var action = new PlayerDocumentAction_ChangeContext(actionData.changeContext[i2], this.playerState.currentContext, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.addSkills)
		{
			if (!actionData.addSkills.length)
			{
				console.error("addSkills requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.addSkills.length, i2 = 0; i2 < length2; ++i2)
			{
				var action = new PlayerDocumentAction_AddSkill(slotName, actionData.addSkills[i2], silent, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.changeHealth)
		{
			var action = new PlayerDocumentAction_ChangeHealth(slotName, actionData.changeHealth, silent, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.changeEnergy)
		{
			var action = new PlayerDocumentAction_ChangeEnergy(slotName, actionData.changeEnergy, silent, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.changeMight)
		{
			var action = new PlayerDocumentAction_ChangeMight(slotName, actionData.changeMight, silent, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.changeSpeed)
		{
			var action = new PlayerDocumentAction_ChangeSpeed(slotName, actionData.changeSpeed, silent, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.changeStance)
		{
			var action = new PlayerDocumentAction_ChangeStance(
                slotName,
                actionData.changeStance.key,
                actionData.changeStance.properties,
                this.playerState.currentStance ? this.playerState.currentStance.key : null,
                this.playerState.currentStance ? this.playerState.currentStance.properties : null,
				silent,
                noExecuteActions
            );
			this.executeAction(action);
		}
		if (actionData.insertText)
		{
			if (!actionData.insertText.length)
			{
				console.error("insertText requires a non-empty array as value.", actionData);
			}
			else
			{
				for (var length2 = actionData.insertText.length, i2 = 0; i2 < length2; ++i2)
				{
					var item2 = actionData.insertText[i2];
					var action = new PlayerDocumentAction_InsertText(slotName, item2.condition, item2.textId, item2.onlyOnce, noExecuteActions);
					this.executeAction(action);
				}
			}
		}
		if (actionData.selectInsertText)
		{
			if (!actionData.selectInsertText.length)
			{
				console.error("selectInsertText requires a non-empty array as value.", actionData);
			}
			else
			{
				var action = new PlayerDocumentAction_SelectInsertText(slotName, actionData.selectInsertText, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.insertExits)
		{
			if (!actionData.insertExits.length)
			{
				console.error("insertExits requires a non-empty array as value.", actionData);
			}
			else
			{
				for (var length2 = actionData.insertExits.length, i2 = 0; i2 < length2; ++i2)
				{
					var item2 = actionData.insertExits[i2];
					var action = new PlayerDocumentAction_InsertExit(slotName, roomKey, item2, noExecuteActions);
					this.executeAction(action);
				}
			}
		}
		if (actionData.startTimers)
		{
			if (!actionData.startTimers.length)
			{
				console.error("startTimers requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.startTimers.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.startTimers[i2];
				var timer = this.playerState.timers[item2.key];
				if (timer && new WPlayerDocument_Timer(timer).isActive(this.getCurrentTimeSpan()))
				{
					console.error("Timer with key \"" + item2.key + "\" is already active, ignoring the start timer request.");
					continue;
				}
				var action = new PlayerDocumentAction_StartTimer(slotName, item2.key, GameTimeSpan.parse(item2.interval).getTimesig(), item2.once, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.stopTimers)
		{
			if (!actionData.stopTimers.length)
			{
				console.error("stopTimers requires a non-empty array as value.", actionData);
			}
			for (var length2 = actionData.stopTimers.length, i2 = 0; i2 < length2; ++i2)
			{
				var item2 = actionData.stopTimers[i2];
				var timer = this.playerState.timers[item2.key];
				if (!timer || !(new WPlayerDocument_Timer(timer).isActive(this.getCurrentTimeSpan())))
				{
					console.info("Timer with key \"" + item2.key + "\" is not active, ignoring the stop timer request.");
					continue;
				}
				var action = new PlayerDocumentAction_StopTimer(slotName, item2.key, noExecuteActions);
				this.executeAction(action);
			}
		}
		if (actionData.combat1_0)
		{
			var combatData =
			{
				playerOriginalHp: this.getCurrentHealth(),
				playerHp: this.getCurrentHealth(),
				playerMight: this.getCurrentMight(),
				playerAdvantage: actionData.combat1_0.advantage > 0 ? actionData.combat1_0.advantage : 0,
				enemyAdvantage: actionData.combat1_0.advantage < 0 ? -actionData.combat1_0.advantage : 0,
				enemyOriginalHp: actionData.combat1_0.hp,
				combatHistory: WCombat1_0_History.create(),
				playerVictoryTextId: actionData.combat1_0.playerVictoryTextId,
				playerDefeatTextId: actionData.combat1_0.playerDefeatTextId,
			};
			combatData.ballance = this.getCurrentMight() - actionData.combat1_0.might + actionData.combat1_0.advantage;
			Object.aggregate(combatData, actionData.combat1_0);
			var action = new PlayerDocumentAction_Combat1_0_Start(slotName, combatData, this.playerState.currentCombat1_0State, noExecuteActions);
			this.executeAction(action);
		}
		if (actionData.addBookmark)
		{
			var action = new PlayerDocumentAction_AddBookmark(slotName, actionData.addBookmark, roomKey, noExecuteActions);
			this.executeAction(action);
		}
	}
	this.commitActionBatch(startHistoryBatch, flush);
}


PlayerDocument.prototype.restart = function (restartBehavior)
{
	this.clear();

	this.setIsFirstRun(false);

	this.onPlayerInteraction.execute(this,
	{
		name: "restart",
		type: restartBehavior,
		data: { sourceRoomKey: this.playerState.currentRoomKey },
	});

	switch (restartBehavior)
	{
		case "startOver":
			this.setIsSoftRestart(true);
			break;
		case "fromTitle":
			this.setIsSoftRestart(false);
			break;
		case "fullReset":
			for (var key in localStorage)
			{
				if (key.indexOf(window.appConfig.bookId) != 0)
				{
					continue;
				}
				delete localStorage[key];
			}
			break;
		default:
			throw "Invalid restartBehavior value \"" + restartBehavior + "\" (allowed values are: \"startOver\", \"fromTitle\", \"fullReset\")";
	}

	// use document.location.reload() because it siumlates (and tests) a fresh start
	document.location.reload();
}

PlayerDocument.prototype.back = function ()
{
	if (this.currentActionBatch)
	{
		console.error("commit action batch first");
		return;
	}
	if (this.history.length < 2)
	{
		console.error("no history available");
		return;
	}
	this.onPlayerInteraction.execute(this,
	{
		name: "back",
		data: { sourceRoomKey: this.playerState.currentRoomKey },
	});
	var lastActionBatch = this.history.pop();
	var cumulativeChangeArgs = lastActionBatch.rollback(this);
	new WPlayerDocument_Timeline(this.timeline).rollbackTimeCycle();
	this.change.execute(this, { flush: true, changeList: cumulativeChangeArgs });
}

PlayerDocument.prototype.executeCommand = function (command)
{
	switch (command.name)
	{
		case "enterRoomOnce":
			if (this.playerState.currentEnterOnce[command.argument])
			{
				return;
			}
			var nextRoom = this.bookDocument.getRoom(command.argument)
			if (!nextRoom)
			{
				console.error("Room key \"" + command.argument + "\" not found (3).");
				return;
			}
			this.navigate(nextRoom, this.playerState.currentRoomKey, null, true);
			break;
		default:
			console.error("Unknown command: \"" + command.name + "\"");
			break;
	}
}

PlayerDocument.prototype.startActionBatch = function ()
{
	if (this.currentActionBatch)
	{
		throw "already started";
	}
	this.currentActionBatch = new PlayerDocument_ActionBatch();
}

PlayerDocument.prototype.executeAction = function (action)
{
	if (!this.currentActionBatch)
	{
		throw "Invalid operation.";
	}
	this.currentActionBatch.add(action);
}

PlayerDocument.prototype.commitActionBatch = function (startHistoryBatch, flush)
{
	startHistoryBatch = !!startHistoryBatch;
	flush = !!flush;

	if (!this.currentActionBatch)
	{
		throw "No action batch.";
	}

	if (!startHistoryBatch && this.history.length)
	{
		this.history[this.history.length - 1].appendBatch(this.currentActionBatch);
	}
	else
	{
		this.history.push(this.currentActionBatch);
	}

	if (this.currentActionBatch.actions.length)
	{
		//	currently cumulativeChangeArgs is not being used; provided here for furure use or debugging purposes
		var cumulativeChangeArgs = this.currentActionBatch.execute(this);
		this.change.execute(this, { flush: flush, changeList: cumulativeChangeArgs });
	}
	else if (flush)
	{
		this.change.execute(this, { flush: flush, changeList: cumulativeChangeArgs });
	}
	this.currentActionBatch = null;
}


PlayerDocument.prototype.getHistoryRoom = function (textRoomNavigationIndex)
{
	if (textRoomNavigationIndex > 99)
	{
		throw "The value provided for the argument of the system navigation target history(" + textRoomNavigationIndex + ") is too large (max is 99).";
	}
	if (this.history.length < 2)
	{
		throw "No history available";
	}

	var textRoomCounter = -1;
	for (var i = this.history.length - 1; i >= 0; --i)
	{
		var actionBatch = this.history[i];
		for (var jlength = actionBatch.actions.length, j = 0; j < jlength; ++j)
		{
			var jitem = actionBatch.actions[j];
			if(jitem.type != "PlayerDocumentAction_EnterRoom")
			{
				continue;
			}
			var room = this.bookDocument.getRoom(jitem.key);
			if (room.type != "text")
			{
				continue;
			}
			++textRoomCounter;
			if(textRoomCounter == textRoomNavigationIndex)
			{
				return room;
			}
		}
	}

	throw "The value provided for the argument of the system navigation target history(" + textRoomNavigationIndex + ") exceedss the existing navigation history.";
}


PlayerDocument.prototype.setCurrenTheme = function (theme)
{
	this.storage.set(window.appConfig.bookId + "_theme", theme);
}

PlayerDocument.prototype.getCurrenTheme = function ()
{
	return this.storage.get(window.appConfig.bookId + "_theme") || "dark";
}

PlayerDocument.prototype.setIsFirstRun = function (value)
{
	this.storage.set(window.appConfig.bookId + "_firstRun", String(!!value));
}

PlayerDocument.prototype.getIsFirstRun = function ()
{
	return this.storage.get(window.appConfig.bookId + "_firstRun") !== String(false);
}

PlayerDocument.prototype.setIsSoftRestart = function (value)
{
	this.storage.set(window.appConfig.bookId + "_softRestart", String(!!value));
}

PlayerDocument.prototype.getIsSoftRestart = function ()
{
	return this.storage.get(window.appConfig.bookId + "_softRestart") == String(true);
}


PlayerDocument.prototype.getCurrentEnterOnce = function ()
{
	return this.playerState.currentEnterOnce;
}

PlayerDocument.prototype.getCurrentInsertTextOnce = function ()
{
	return this.playerState.currentInsertTextOnce;
}

PlayerDocument.prototype.getCurrentActionList = function ()
{
	if (!this.history.length)
	{
		return [];
	}

	var result = [];
	for (var i = this.history.length - 1; i >= 0; --i)
	{
		var currentActionBatch = this.history[i];
		var hasRoomNavigation = false;
		for(var jlength = currentActionBatch.actions.length, j = 0; j < jlength; ++j)
		{
			var action = currentActionBatch.actions[j];
			if (action.type == "PlayerDocumentAction_EnterRoom")
			{
				hasRoomNavigation = true;
				break;
			}
		}
		result = result.concat(currentActionBatch.actions);
		if (hasRoomNavigation)
		{
			break;
		}
	}

	return result;
}

PlayerDocument.prototype.getCurrentRoomKey = function ()
{
	return this.playerState.currentRoomKey;
}

PlayerDocument.prototype.getCurrentImplicitData = function ()
{
	return this.playerState.currentImplicitData;
}

PlayerDocument.prototype.getCurrentFlags = function ()
{
	return this.playerState.currentFlags;
}

PlayerDocument.prototype.getCurrentContext = function ()
{
	return this.playerState.currentContext;
}

PlayerDocument.prototype.getCurrentContextWithStats = function ()
{
	var result = Object.copy(this.playerState.currentContext);

	var self = this;
	Object.defineProperty(result, "stats",
	{
		get: function ()
		{
			return {
				roomKey: self.getCurrentRoomKey(),
				startTimecode: self.playerState.startTimecode,
				timecode: self.playerState.currentTimecode,
				timesig: self.playerState.currentTimesig,

				diceRoll: self.getCurrentDiceRoll(),
				randomInt: self.getCurrentRandomInt(),
				knowledge: Array.copy(self.getCurrentKnowledge()),
				skills: Array.copy(self.getCurrentSkills()),
				inventory: Object.copy(self.getCurrentInventory()),
				implicitData: Object.copy(self.getCurrentImplicitData()),
				flags: Object.copy(self.getCurrentFlags()),

				health: self.getCurrentHealth(),
				energy: self.getCurrentEnergy(),
				might: self.getCurrentMight(),
				speed: self.getCurrentSpeed(),

				stance: self.getCurrentStance(),

				enterOnce: Object.copy(self.getCurrentEnterOnce()),
				insertTextOnce: Object.copy(self.getCurrentInsertTextOnce()),
			}
		},
	});

	return result;
}

PlayerDocument.prototype.getCurrentDiceRoll = function ()
{
	return this.playerState.currentDiceRoll;
}

PlayerDocument.prototype.getCurrentRandomInt = function ()
{
	return this.playerState.currentRandomInt;
}

PlayerDocument.prototype.getCurrentCombat1_0State = function ()
{
	return this.playerState.currentCombat1_0State;
}

PlayerDocument.prototype.getCurrentKnowledge = function ()
{
	return this.playerState.currentKnowledge;
}

PlayerDocument.prototype.getCurrentSkills = function ()
{
	var result = [];
	for (var key in this.playerState.currentInventory)
	{
		var item = this.playerState.currentInventory[key];
		if (item.properties && item.properties.skills)
		{
			result = result.concat(item.properties.skills);
		}
	}
	return result.concat(this.playerState.currentSkills);
}

PlayerDocument.prototype.getCurrentInventory = function (key)
{
	return this.playerState.currentInventory;
}

PlayerDocument.prototype.getInventoryItem = function (key)
{
	return this.playerState.currentInventory[key];
}

PlayerDocument.prototype.sumInventoryProperty = function (propertyName)
{
	var result = 0;
	for (var key in this.playerState.currentInventory)
	{
		var item = this.playerState.currentInventory[key];
		if (item.properties && item.properties[propertyName])
		{
			result += item.properties[propertyName];
		}
	}
	return result;
}

PlayerDocument.prototype.getStanceProperty = function (propertyName)
{
	if (!this.playerState.currentStance || !this.playerState.currentStance.properties)
	{
		return 0;
	}
	return this.playerState.currentStance.properties[propertyName] || 0;
}


PlayerDocument.prototype.hasKnowledge = function (key)
{
	return this.playerState.currentKnowledge.contains(key);
}

PlayerDocument.prototype.hasEnterOnce = function (key)
{
	return !!this.playerState.currentEnterOnce[key];
}

PlayerDocument.prototype.hasInsertTextOnce = function (key)
{
	return !!this.playerState.currentInsertTextOnce[key];
}


PlayerDocument.prototype.getCurrentHealth = function ()
{
	return this.playerState.currentHealth + this.sumInventoryProperty("health");
}

PlayerDocument.prototype.getCurrentEnergy = function ()
{
	return this.playerState.currentEnergy + this.sumInventoryProperty("energy");
}

PlayerDocument.prototype.getCurrentMight = function ()
{
	return this.playerState.currentMight + this.sumInventoryProperty("might") + this.getStanceProperty("might");
}

PlayerDocument.prototype.getCurrentSpeed = function ()
{
	return this.playerState.currentSpeed + this.sumInventoryProperty("speed") + this.getStanceProperty("speed");
}

PlayerDocument.prototype.getCurrentStance = function ()
{
	return this.playerState.currentStance;
}

PlayerDocument.prototype.getStartDateTime = function ()
{
	return GameDateTime.fromTimecode(this.playerState.startTimecode || 0);
}

PlayerDocument.prototype.getCurrentDateTime = function ()
{
	return GameDateTime.fromTimecode(this.playerState.currentTimecode || 0);
}

PlayerDocument.prototype.getCurrentTimeSpan = function ()
{
	return GameTimeSpan.fromTimesig(this.playerState.currentTimesig);
}

PlayerDocument.prototype.getBookmark = function (key)
{
	return this.bookmarks[key];
}


PlayerDocument.prototype.testCondition = function (condition)
{
	if (condition.and)
	{
		if (!condition.and.length)
		{
			throw "Invalid and-condition.";
		}
		for (var length = condition.and.length, i = 0; i < length; ++i)
		{
			var item = condition.and[i];
			if (!this.testCondition(item))
			{
				return false;
			}
		}
		return true;
	}

	if (condition.or)
	{
		if (!condition.or.length)
		{
			throw "Invalid or-condition.";
		}
		for (var length = condition.or.length, i = 0; i < length; ++i)
		{
			var item = condition.or[i];
			if (!this.testCondition(item))
			{
				return true;
			}
		}
		return false;
	}

	if (condition.not)
	{
		return !this.testCondition(condition.not);
	}


	if (condition.isDebugMode)
	{
		return this.bookDocument.isDebugMode;
	}

	if (condition.isPlayerDead)
	{
		return (!this.getCurrentHealth()) == condition.isPlayerDead;
	}

	if (condition.isPlayerAlive)
	{
		return (!!this.getCurrentHealth()) == condition.isPlayerAlive;
	}

	if (condition.isFirstRun !== void(0))
	{
		return this.getIsFirstRun() === !!condition.isFirstRun;
	}


	if (condition.hasKnowledge)
	{
		return this.hasKnowledge(condition.hasKnowledge);
	}

	if (condition.hasSkill)
	{
		return !!this.getCurrentSkills().contains(condition.hasSkill);
	}

	if (condition.hasItem)
	{
		return !!this.playerState.currentInventory[condition.hasItem];
	}

	if (condition.hasImplicitData)
	{
		return !!this.playerState.currentImplicitData[condition.hasImplicitData];
	}

	if (condition.hasFlag)
	{
		return !!this.playerState.currentFlags[condition.hasFlag];
	}

	if (condition.hasNoFlag)
	{
		return !this.playerState.currentFlags[condition.hasNoFlag];
	}

	if (condition.hasFlags)
	{
		for (var length = condition.hasFlags.length, i = 0; i < length; ++i)
		{
			var item = condition.hasFlags[i];
			if (!this.playerState.currentFlags[item])
			{
				return false;
			}
		}
		return true;
	}

	if (condition.hasNoFlags)
	{
		for (var length = condition.hasNoFlags.length, i = 0; i < length; ++i)
		{
			var item = condition.hasNoFlags[i];
			if (this.playerState.currentFlags[item])
			{
				return false;
			}
		}
		return true;
	}

	if (condition.test)
	{
		return PlayerDocument.testLogicalExpression(
		{
			currentFlags: this.playerState.currentFlags,
			currentKnowledge: this.playerState.currentKnowledge,
			currentSkills: this.playerState.currentSkills,
			currentInsertTextOnce: this.playerState.currentInsertTextOnce,
			
			isDebugMode: this.bookDocument.isDebugMode,
			isPlayerDead: !this.getCurrentHealth(),
			isPlayerAlive: !!this.getCurrentHealth(),
			isFirstRun: this.getIsFirstRun(),
		}, condition.test);
	}

	if (condition.implicitDataEquals)
	{
		return this.playerState.currentImplicitData[condition.implicitDataEquals.key] == condition.implicitDataEquals.value;
	}

	if (condition.diceRoll)
	{
		return condition.diceRoll.indexOf(this.chaos.getDiceRoll()) != -1;
	}

	if (condition.randomInt)
	{
		return condition.randomInt.indexOf(this.chaos.getRandomInt()) != -1;
	}

	if (condition.expression)
	{
		return !!PlayerDocument.evaluateExpression(condition.expression, this.getCurrentContextWithStats());
	}

	//	date/time conditions
	if (condition.isBefore || condition.isBeforeDate || condition.isBeforeTime ||
		condition.isAfter || condition.isAfterDate || condition.isAfterTime)
	{
		var argument = condition.isBefore || condition.isBeforeDate || condition.isBeforeTime ||
			condition.isAfter || condition.isAfterDate || condition.isAfterTime;
		var gameDateTime = GameDateTime.parse(argument);

		if (condition.isBefore)
		{
			return this.getCurrentDateTime().lessThanOrEquals(gameDateTime);
		}

		if (condition.isBeforeDate)
		{
			return this.getCurrentDateTime().getDateOnly().lessThanOrEquals(gameDateTime.getDateOnly());
		}

		if (condition.isBeforeTime)
		{
			return this.getCurrentDateTime().getTimeOnly().lessThanOrEquals(gameDateTime.getTimeOnly());
		}

		if (condition.isAfter)
		{
			return this.getCurrentDateTime().moreThanOrEquals(gameDateTime);
		}

		if (condition.isAfterDate)
		{
			return this.getCurrentDateTime().getDateOnly().moreThanOrEquals(gameDateTime.getDateOnly());
		}

		if (condition.isAfterTime)
		{
			return this.getCurrentDateTime().getTimeOnly().moreThanOrEquals(gameDateTime.getTimeOnly());
		}

		throw "Not implemented.";
	}

	if (condition.isBetween || condition.isBetweenDate || condition.isBetweenTime)
	{
		var argument = condition.isBetween || condition.isBetweenDate || condition.isBetweenTime;
		if (!argument)
		{
			throw "Invalid isBetween* condition argument: " + JSON.stringify(condition);
		}
		var start_gameDateTime = GameDateTime.parse(argument.start);
		var end_gameDateTime = GameDateTime.parse(argument.end);

		if (condition.isBetween)
		{
			return this.getCurrentDateTime().moreThanOrEquals(start_gameDateTime) && this.getCurrentDateTime().lessThanOrEquals(end_gameDateTime);
		}

		if (condition.isBetweenDate)
		{
			return this.getCurrentDateTime().getDateOnly().moreThanOrEquals(start_gameDateTime.getDateOnly()) && this.getCurrentDateTime().getDateOnly().lessThanOrEquals(end_gameDateTime.getDateOnly());
		}

		if (condition.isBetweenTime)
		{
			return this.getCurrentDateTime().getTimeOnly().moreThanOrEquals(start_gameDateTime.getTimeOnly()) && this.getCurrentDateTime().getTimeOnly().lessThanOrEquals(end_gameDateTime.getTimeOnly());
		}

		throw "Not implemented.";
	}

	//	timer conditions
	if (condition.elapses || condition.isTimerActive)
	{
		var within = null;
		if (condition.elapses)
		{
			within = condition.elapses.within;
		}
		else if (condition.isTimerActive)
		{
			within = condition.isTimerActive.within;
		}
		else
		{
			throw "Invalid opertion.";
		}

		var rangeBegin = null;
		var rangeEnd = null;
		var rangeBegin_isInclusive = false;
		var rangeEnd_isInclusive = false;

		var timeline = new WPlayerDocument_Timeline(this.timeline);

		var withinInfo = PlayerDocument.parseWithinExpression(within);
		switch (withinInfo.leftIntervalInclusiveToken)
		{
			case "[":
				rangeBegin_isInclusive = true;
				break;
			case "(":
				rangeBegin_isInclusive = false;
				break;
			case "...":
				rangeBegin = GameTimeSpan.zero;
				break;
			default:
				throw "Not implemented.";
		}
		switch (withinInfo.rightIntervalInclusiveToken)
		{
			case "]":
				rangeEnd_isInclusive = true;
				break;
			case ")":
				rangeEnd_isInclusive = false;
				break;
			case "...":
				rangeEnd = GameTimeSpan.maxValue;
				break;
			default:
				throw "Not implemented.";
		}

		switch (withinInfo.intervalTokenList)
		{
			case "sourceRoom":
				var timeInfo = timeline.getLastTimeInfo();
				if (!timeInfo)
				{
					rangeBegin = rangeBegin || GameTimeSpan.zero;
					rangeEnd = rangeEnd || GameTimeSpan.zero;
					break;
				}
				rangeBegin = rangeBegin || GameTimeSpan.fromTimesig(timeInfo.roomStartTimesig);
				rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(timeInfo.roomEndTimesig);
				break;
			case "sourceExit":
				var timeInfo = timeline.getCurrentTimeInfo();
				rangeBegin = rangeBegin || GameTimeSpan.fromTimesig(timeInfo.sourceExitStartTimesig);
				if (timeInfo.roomStartTimesig)
				{
					rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(timeInfo.roomStartTimesig);
				}
				else
				{
					rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(timeInfo.sourceExitEndTimesig);
				}
				break;
			case "currentRoom":
				var timeInfo = timeline.getCurrentTimeInfo();
				if (!timeInfo.roomEndTimesig)
				{
					throw "\"" + within + "\" is an invalid \"within\" clause in a hub-room exit condition (cannot use \"currentRoom\" in this context).";
				}
				rangeBegin = rangeBegin || GameTimeSpan.fromTimesig(timeInfo.roomStartTimesig);
				rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(timeInfo.roomEndTimesig);
				break;
			case "sourceRoom,sourceExit":
				var lastTimeInfo = timeline.getLastTimeInfo();
				if (!lastTimeInfo)
				{
					rangeBegin = rangeBegin || GameTimeSpan.zero;
				}
				else
				{
					rangeBegin = rangeBegin || GameTimeSpan.fromTimesig(lastTimeInfo.roomStartTimesig);
				}
				var currentTimeInfo = timeline.getCurrentTimeInfo();
				if (currentTimeInfo.roomStartTimesig)
				{
					rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(currentTimeInfo.roomStartTimesig);
				}
				else
				{
					rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(currentTimeInfo.sourceExitEndTimesig);
				}
				break;
			case "sourceExit,currentRoom":
				var timeInfo = timeline.getLastTimeInfo();
				if (!timeInfo.roomEndTimesig)
				{
					throw "\"" + within + "\" is an invalid \"within\" clause in a hub-room exit condition (cannot use \"currentRoom\" in this context).";
				}
				rangeBegin = rangeBegin || GameTimeSpan.fromTimesig(timeInfo.sourceExitStartTimesig);
				rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(timeInfo.roomEndTimesig);
				break;
			case "sourceRoom,sourceExit,currentRoom":
				var lastTimeInfo = timeline.getLastTimeInfo();
				if (!lastTimeInfo)
				{
					rangeBegin = rangeBegin || GameTimeSpan.zero;
				}
				else
				{
					rangeBegin = rangeBegin || GameTimeSpan.fromTimesig(lastTimeInfo.roomStartTimesig);
				}
				var currentTimeInfo = timeline.getCurrentTimeInfo();
				if (!currentTimeInfo.roomEndTimesig)
				{
					throw "\"" + within + "\" is an invalid \"within\" clause in a hub-room exit condition (cannot use \"currentRoom\" in this context).";
				}
				rangeEnd = rangeEnd || GameTimeSpan.fromTimesig(currentTimeInfo.roomEndTimesig);
				break;
			default:
				throw "Not implemented.";
		}

		if (condition.elapses)
		{
			if (condition.elapses.timespan && condition.elapses.timer)
			{
				var timer = this.playerState.timers[condition.elapses.timer];
				if (!timer)
				{
					return false;
				}

				var timerStart_timesig = new WPlayerDocument_Timer(timer).getTimerStart_timesig();
				var timePoint_timespan = GameTimeSpan.fromTimesig(timerStart_timesig);
				var offset_timepsan = GameTimeSpan.parse(condition.elapses.timespan);
				timePoint_timespan.add(offset_timepsan);

				return timePoint_timespan.isWithinRange(rangeBegin, rangeBegin_isInclusive, rangeEnd, rangeEnd_isInclusive);
			}
			else if (condition.elapses.timespan)
			{
				var offset_timepsan = GameTimeSpan.parse(condition.elapses.timespan);
				if (offset_timepsan.getMonths())
				{
					console.error("Calculations of \"condition.elapses.timespan\" cannot be precise if the months component of the timespan is set.");
				}

				return offset_timepsan.isWithinRange(rangeBegin, rangeBegin_isInclusive, rangeEnd, rangeEnd_isInclusive);
			}
			else if (condition.elapses.timer)
			{
				var timer = this.playerState.timers[condition.elapses.timer];
				if (!timer)
				{
					return false;
				}
				return new WPlayerDocument_Timer(timer).ticksWithin(rangeBegin, rangeBegin_isInclusive, rangeEnd, rangeEnd_isInclusive);
			}
		}
		else if (condition.isTimerActive)
		{
			if (condition.isTimerActive.timer)
			{
				var timer = this.playerState.timers[condition.isTimerActive.timer];
				if (!timer)
				{
					return false;
				}
				return new WPlayerDocument_Timer(timer).isActiveWithin(rangeBegin, rangeBegin_isInclusive, rangeEnd, rangeEnd_isInclusive);
			}
			else
			{
				throw "Invalid isTimerActive condition " + JSON.stringify(condition);
			}
		}
	}

	throw "Invalid condition " + JSON.stringify(condition);
}

//	"X token [[, token], token] Y", where 
//		- whitespace is insignificant
//		- token can be "sourceRoom", "sourceExit", "currentRoom"
//		- X can be "[", "(" or "...", "[" meaning interval start inclusive, "(" meaning interval start exclusive, "..." meaning interval start assumed as GameTimeSpan.zero
//		- Y can be "]", ")" or "...", "]" meaning interval end inclusive, ")" meaning interval end exclusive, "..." meaning interval end assumed as GameTimeSpan.maxValue
//	returns {
//		leftIntervalInclusiveToken: string,
//		intervalTokenList: string,
//		rightIntervalInclusiveToken: string,
//	}
PlayerDocument.parseWithinExpression = function (expression)
{
	if (!expression.length)
	{
		throw "Invalid within expression (1) \"" + expression + "\"";
	}

	var leftIntervalInclusiveTokenSb = [];
	var currentIntervalTokenSb = [];
	var rightIntervalInclusiveTokenSb = [];
	var intervalTokenList =[];

	var EState =
	{
		LeftIntervalInclusiveToken: 1,
		LeftIntervalInclusivePeriodToken: 11,
		IntervalTokenList: 2,
		IntervalToken: 3,
		RightIntervalInclusiveToken: 4,
		RightIntervalInclusivePeriodToken: 41,
	};

	var state = EState.LeftIntervalInclusiveToken;
	var i = 0;
	var length = expression.length;
	while(i < length)
	{
		var c = expression[i];
		switch(state)
		{
			case EState.LeftIntervalInclusiveToken:
				switch (c)
				{
					case '\t':
					case ' ':
						++i;
						break;
					case '[':
					case '(':
						leftIntervalInclusiveTokenSb.push(c);
						state = EState.IntervalTokenList;
						++i;
						break;
					case '.':
						leftIntervalInclusiveTokenSb.push(c);
						state = EState.LeftIntervalInclusivePeriodToken;
						++i;
						break;
					default:
						throw "Invalid left interval inclusive character \'" + c + "\'";
				}
				break;
			case EState.LeftIntervalInclusivePeriodToken:
				switch (c)
				{
					case '.':
						leftIntervalInclusiveTokenSb.push(c);
						++i;
						break;
					default:
						state = EState.IntervalTokenList;
						break;
				}
				break;
			case EState.IntervalTokenList:
				if (c.search(/\w/) == 0)
				{
					state = EState.IntervalToken;
					currentIntervalTokenSb = [];
					break;
				}
				switch (c)
				{
					case '\t':
					case ' ':
					case ',':
						++i;
						break;
					default:
						state = EState.RightIntervalInclusiveToken;
						break;
				}
				break;
			case EState.IntervalToken:
				if (c.search(/\w/) == 0)
				{
					currentIntervalTokenSb.push(c);
					++i;
					break;
				}

				intervalTokenList.push(currentIntervalTokenSb.join(""));
				state = EState.IntervalTokenList;
				break;
			case EState.RightIntervalInclusiveToken:
				switch (c)
				{
					case '\t':
					case ' ':
						++i;
						break;
					case ']':
					case ')':
						rightIntervalInclusiveTokenSb.push(c);
						state = EState.IntervalTokenList;
						++i;
						break;
					case '.':
						rightIntervalInclusiveTokenSb.push(c);
						state = EState.RightIntervalInclusivePeriodToken;
						++i;
						break;
					default:
						throw "Invalid right interval inclusive character \'" + c + "\'";
				}
				break;
			case EState.RightIntervalInclusivePeriodToken:
				switch (c)
				{
					case '.':
						rightIntervalInclusiveTokenSb.push(c);
						++i;
						break;
					default:
						state = EState.IntervalTokenList;
						break;
				}
				break;
			default:
				throw "Not implemented.";
		}
	}

	intervalTokenList.sort();
	intervalTokenList.reverse();	//	sourceRoom,sourceExit,currentRoom

	var result =
	{
		leftIntervalInclusiveToken: leftIntervalInclusiveTokenSb.join(""),
		intervalTokenList: intervalTokenList.join(","),
		rightIntervalInclusiveToken: rightIntervalInclusiveTokenSb.join(""),
	};

	switch(result.leftIntervalInclusiveToken)
	{
		case "(":
		case "[":
		case "...":
			break;
		default:
			throw "Invalid left interval inclusive token \'" + result.leftIntervalInclusiveToken + "\'";
	}

	switch (result.rightIntervalInclusiveToken)
	{
		case ")":
		case "]":
		case "...":
			break;
		default:
			throw "Invalid right interval inclusive token \'" + result.rightIntervalInclusiveToken + "\'";
	}

	return result;

}

PlayerDocument.validateFlagName = function (flagName)
{
	var inadmissiveCharactersArray = [ '(', ')', '|', '&', '!' , ' ', '\t', '\r', '\n' ];
	for(var length = inadmissiveCharactersArray.length, i = 0; i < length; ++i)
	{
		var c = inadmissiveCharactersArray[i];
		if(flagName.indexOf(c) != -1)
		{
			throw "Inadmissive character '" + c + "' in flag name \"" + flagName + "\"";
		}
	}
}
	
//	"(flag1 || !(flag2 && flag3))" where flag1, flag2 and flag3 evaluate to true if set and false if unset
//	supported operators (JavaScript logocal operators):
//		- ( and )
//		- ||
//		- &&
//		- !
PlayerDocument.testLogicalExpression = function (context, expression)
{
	if (!expression.length)
	{
		throw "Invalid within expression (2) \"" + expression + "\"";
	}

	var EState =
	{
		Input: 1,
		Operator: 2,
		FlagName: 3,
	};

	var sb = [];
	var flagNameSb = [];
	var state = EState.Input;
	var length = expression.length;
	var i = 0;
	while (i < length)
	{
		var c = expression[i];
		switch (state)
		{
			case EState.Input:
				switch (c)
				{
					case '(':
					case ')':
					case '|':
					case '&':
					case '!':
						state = EState.Operator;
						break;
					case ' ':
					case '\t':
					case '\r':
					case '\n':
						++i;
						break;
					default:
						state = EState.FlagName;
						break;
				}
				break;
			case EState.Operator:
				sb.push(c);
				++i;
				state = EState.Input;
				break;
			case EState.FlagName:
				switch (c)
				{
					case '(':
					case ')':
					case '|':
					case '&':
					case '!':
					case ' ':
					case '\t':
					case '\r':
					case '\n':
						var flagName = flagNameSb.join("");
						flagNameSb = [];
						sb.push(PlayerDocument.testLogicalIdentifier(context, flagName) ? "true" : "false");
						state = EState.Input;
						break;
					default:
						flagNameSb.push(c);
						++i;
						break;
				}
				break;
			default:
				throw "Not implemented.";
		}
	}

	if (flagNameSb.length)
	{
		var flagName = flagNameSb.join("");
		sb.push(PlayerDocument.testLogicalIdentifier(context, flagName) ? "true" : "false");
	}

	var jsExpression = sb.join("");
	try
	{
		return eval(jsExpression);
	}
	catch(ex)
	{
		console.error("Bad flags expression: \"" + expression + "\"", ex);
		return false;
	}
}

PlayerDocument.testLogicalIdentifier = function (context, literal)
{
	var tokens = literal.split("::");
	if (tokens.length == 1)
	{
		if (literal == "true")
		{
			return true;
		}
		if (literal == "false")
		{
			return false;
		}
		return context.currentFlags[literal];
	}
	else if (tokens.length == 2)
	{
		switch (tokens[0])
		{
			case "flag":
				return context.currentFlags.contains(tokens[1]);
			case "knowledge":
				return context.currentKnowledge.contains(tokens[1]);
			case "skill":
				return context.currentSkills.contains(tokens[1]);
			case "system":
				switch (tokens[1])
				{
					case "isDebugMode":
						return context.isDebugMode;
					case "isPlayerDead":
						return context.isPlayerDead;
					case "isPlayerAlive":
						return context.isPlayerAlive;
					case "isFirstRun":
						return context.isFirstRun;
				}
			default:
				throw "Not implemented.";
		}
	}
	else
	{
		throw "Invalid logical identifier syntax.";
	}
}

PlayerDocument.evaluateExpression = function (expression, context)
{
	return Function("context", "\"use strict\";return (" + expression + ")")(context);
}
