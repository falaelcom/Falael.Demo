"use strict";

include("StdAfx.js");

include("app.css");
include("app.theme.dark.css");
include("app.theme.light.css");
include("book.css");

include("rootLayout", "rootLayout.xhtml");
include("navigationRow", "navigationRow.xhtml");
include("navigationRow_diceDebug", "navigationRow_diceDebug.xhtml");
include("navigationRow_randomIntDebug", "navigationRow_randomIntDebug.xhtml");
include("navigationRow_randomIntDebug_item", "navigationRow_randomIntDebug_item.xhtml");
include("actionListRow", "actionListRow.xhtml");
include("timerRow", "timerRow.xhtml");
include("timerHeadersRow", "timerHeadersRow.xhtml");

include("separator", "separator.xhtml");
include("illustration", "illustration.xhtml");

ft_include(EFeature.twoDice, "2dicesView", "2dicesView.xhtml");

ft_include(EFeature.combat1_0, "combat1.0/Combat1_0_View.js");


function GameView()
{
	this.isDebugMode = false;
	this.bookDocument = null;
	this.playerDocument = null;

	this.elements = null;
	this.pageDefaultCssClassName = null;
}

GameView.prototype.setIsDebugMode = function (value)
{
	if (this.isDebugMode == value)
	{
		return;
	}
	this.isDebugMode = value;
	this.refresh();
}

GameView.prototype.getIsDebugMode = function ()
{
	return this.isDebugMode;
}

GameView.prototype.setBookDocument = function (value)
{
	if (this.bookDocument == value)
	{
		return;
	}
	this.bookDocument = value;
	this.refresh();
}

GameView.prototype.getBookDocument = function ()
{
	return this.bookDocument;
}

GameView.prototype.setPlayerDocument = function (value)
{
	if (this.playerDocument == value)
	{
		return;
	}
	if (this.playerDocument)
	{
		this.playerDocument.change.remove(this.playerDocument_change.multicastDelegateId);
	}
	this.playerDocument = value;
	if (this.playerDocument)
	{
		this.playerDocument_change.multicastDelegateId = this.playerDocument.change.add(this.playerDocument_change.bind(this));
	}
	this.refresh();
}

GameView.prototype.getPlayerDocument = function ()
{
	return this.playerDocument;
}

GameView.prototype.render = function (container)
{
	this.elements = XhtmlTemplate.apply("rootLayout", container);

	this.elements.restart.onclick = this.restart_onclick.bind(this);
	this.elements.changeTheme.onclick = this.changeTheme_onclick.bind(this);
	this.elements.back.onclick = this.back_onclick.bind(this);
	this.elements.navigation.onclick = this.navigation_onclick.bind(this);
	this.elements.text.onclick = this.text_onclick.bind(this);

	this.pageDefaultCssClassName = document.body.className;
}

GameView.prototype.refresh = function ()
{
	function onCommandSlot(commandSlot)
	{
		var sb2 = [];
		sb2.push("<span class=\"secret\" ux-role=\"secret\" command=\"");
		sb2.push(commandSlot.command);
		sb2.push("\" argument=\"");
		sb2.push(commandSlot.argument);
		sb2.push("\">");
		sb2.push(commandSlot.text);
		sb2.push("</span>");
		return sb2.join("");
	}

	function onXmlTag(tagDef)
	{
		if (!XhtmlTemplate.has(tagDef.name))
		{
			return null;
		}
		return XhtmlTemplate.fill(tagDef.name, tagDef.attributes).xhtml;
	}

	if (!this.bookDocument || !this.playerDocument)
	{
		return;
	}

	document.body.className = this.pageDefaultCssClassName + " " + this.playerDocument.getCurrenTheme();

	var currentRoomKey = this.playerDocument.getCurrentRoomKey();
	var currentRoom = this.bookDocument.getRoom(currentRoomKey);

	var actionSlots = {};
	var exits = Array.copy(currentRoom.exits);

	var pauseBeforeNavigation = false;
	if (Boot.hasFeature(EFeature.combat1_0))
	{
		this.elements.combat1_0.style.display = "none";
	}

	var currentActionList = this.playerDocument.getCurrentActionList();
	for (var length = currentActionList.length, i = 0; i < length; ++i)
	{
		var item = currentActionList[i];

		if (item.getCustomView)
		{
			var customView = item.getCustomView();
			switch (customView)
			{
				case "combat1.0":
					var combat1_0View = new Combat1_0_View(this.getPlayerDocument());
					combat1_0View.render(this.elements.combat1_0);
					combat1_0View.refresh(onXmlTag);

					this.elements.combat1_0.style.display = "";

					var combat1_0State = this.playerDocument.getCurrentCombat1_0State();
					if (combat1_0State.hp != 0 && combat1_0State.playerHp != 0)
					{
						pauseBeforeNavigation = true;
					}
					continue;
			}
		}

		if (!item.slotName)
		{
			continue;
		}
		var sb = actionSlots[item.slotName];
		if (!sb)
		{
			sb = [];
			actionSlots[item.slotName] = sb;
		}

		if (item.getActionListStrings)
		{
			var actionListStrings = item.getActionListStrings(this.bookDocument);
			if (actionListStrings)
			{
				for (var length2 = actionListStrings.length, i2 = 0; i2 < length2; ++i2)
				{
					var fill = XhtmlTemplate.fill("actionListRow", { text: "> " + actionListStrings[i2] });
					sb.push(fill.xhtml);
				}
			}
		}
		if (item.getText)
		{
			var text = item.getText(this.playerDocument, this.bookDocument);
			if (text)
			{
				sb.push(text);
			}
		}
		if (item.insertExit)
		{
			item.insertExit(this.playerDocument, this.bookDocument, exits);
		}

		if (item.getCustomView)
		{
			var customView = item.getCustomView();
			switch (customView)
			{
				case "2 dices":
					var twoDiceRolls = PlayerDocument_Chaos.splitDiceRollInTwo(this.playerDocument.getCurrentDiceRoll());
					var fill = XhtmlTemplate.fill("2dicesView",
					{
						dice1: twoDiceRolls.dice1,
						dice2: twoDiceRolls.dice2,
						style: "white",
					});
					sb.push(fill.xhtml);
					break;
				default:
					console.error("Unrecognized custom view \"" + customView + "\"");
					break;
			}
		}
	}
	for (var key in actionSlots)
	{
		actionSlots[key] = actionSlots[key].join("");
	}

	var roomEnterSlotText = (actionSlots["exit"] || "") + (actionSlots["enter"] || "");
	if (!roomEnterSlotText.length)
	{
		this.elements.actionList.style.display = "none";
	}
	else
	{
		this.elements.actionList.style.display = "";
		this.elements.actionList.innerHTML = roomEnterSlotText;
	}

	var roomFinalSlotText = actionSlots["finish"] || "";
	if (!roomFinalSlotText.length)
	{
		this.elements.finalActionList.style.display = "none";
	}
	else
	{
		this.elements.finalActionList.style.display = "";
		this.elements.finalActionList.innerHTML = roomFinalSlotText;
	}

	if (pauseBeforeNavigation)
	{
		//	hide the room finishing elements
		this.elements.navigation.style.display = "none";
		this.elements.finalActionList.style.display = "none";
	}
	else
	{
		this.elements.navigation.style.display = "";
	}

	if (!currentRoom)
	{
		console.error(37246283, "Room key \"" + currentRoomKey + "\" not found");
	}
	else
	{
		this.elements.text.innerHTML = GameView.formatText(currentRoom.text, actionSlots, onCommandSlot, onXmlTag);

		//new WPlayerDocument_Timeline(this.playerDocument.timeline).writeToConsole("REFRESH NAVIGATION");

		var sb = [];

		if (this.isDebugMode)
		{
			var match = false;
			for (var key1 in currentRoom)
			{
				if (key1.indexOf("on") != 0)
				{
					continue;
				}
				var actions = currentRoom[key1];
				var chaosAction = actions["chaos"];
				if(!chaosAction)
				{
					continue;
				}
				for (var length2 = chaosAction.length, i2 = 0; i2 < length2; ++i2)
				{
					var item2 = chaosAction[i2];
					GameView.renderChaosDebugUi(sb, "room", key1, item2);
					match = true;
				}
			}
			if (match)
			{
				sb.push("<hr />");
			}
		}

		for (var length = exits.length, i = 0; i < length; ++i)
		{
			var item = exits[i];
			if (item.condition)
			{
				if (!this.playerDocument.testCondition(item.condition))
				{
					continue;
				}
			}

			if (this.isDebugMode)
			{
				for (var key1 in item)
				{
					if (key1.indexOf("on") != 0)
					{
						continue;
					}
					var actions = item[key1];
					var chaosAction = actions["chaos"];
					if (!chaosAction)
					{
						continue;
					}
					for (var length2 = chaosAction.length, i2 = 0; i2 < length2; ++i2)
					{
						var item2 = chaosAction[i2];
						GameView.renderChaosDebugUi(sb, "exit", key1, item2);
					}
				}
			}

			var exitText = null;
			if (item.textId)
			{
				exitText = this.bookDocument.getTextDef(item.textId);
				if(!exitText)
				{
					exitText = "(global text with textId " + item.textId + " not found)"
				}
			}
			else
			{
				exitText = item.text;
			}
			var fill = XhtmlTemplate.fill("navigationRow",
			{
				title: exitText,
				target: item.target || item.systemTarget,
				targetType: item.systemTarget ? "systemTarget" : "roomTarget",
				ignoreActions: item.ignoreActions ? "true" : "false",
				exitIndex: i.toString(),
			});
			sb.push(fill.xhtml);
		}

		this.elements.navigation.innerHTML = sb.join("");
		this.elements.navigation.querySelectorAll('input[ux-role=navigateButton]').forEach(function (node)
		{
			node.disabled = !node.id;
		});
	}

	if (currentRoom && currentRoom.roomJson && currentRoom.roomJson.title)
	{
		this.elements.title.innerHTML = currentRoom.roomJson.title;
		this.elements.title.style.display = "";
	}
	else
	{
		this.elements.title.style.display = "none";
	}

	if (currentRoom && currentRoom.roomJson && currentRoom.roomJson.coverImage)
	{
		var fullImagePath = this.bookDocument.buildImagePath(currentRoom.roomJson.coverImage);
		this.elements.coverImage.style.backgroundImage = "url(\"" + fullImagePath + "\")";
		this.elements.coverImage.style.display = "";

		if (currentRoom.roomJson.coverImageSize)
		{
			switch (currentRoom.roomJson.coverImageSize)
			{
				case "size16_9":
				case "size4_3":
				case "size1_1":
					break;
				default:
					console.error(365746283, "Invalid cover image size key \"" + currentRoom.roomJson.coverImageSize + "\"");
					break;
			}
			this.elements.coverImage.className = "coverImage " + currentRoom.roomJson.coverImageSize;
		}
		else
		{
			this.elements.coverImage.className = "coverImage size16_9";
		}
	}
	else
	{
		this.elements.coverImage.style.display = "none";
	}

	var knowledge = this.playerDocument.getCurrentKnowledge();
	if (!knowledge.length)
	{
		this.elements.knowledge.innerHTML = "";
	}
	else
	{
		var sb = [];
		for (var length = knowledge.length, i = 0; i < length; ++i)
		{
			var item = knowledge[i];
			var text = this.bookDocument.getKnowledgeText(item);
			if (!text)
			{
				console.error("Knowledge text for \"" + item + "\" not found.");
				text = "(n/a)";
			}
			sb.push(text);
		}
		this.elements.knowledge.innerHTML = sb.join("<br />");
	}

	var inventory = this.playerDocument.getCurrentInventory();
	var inventoryArray = [];
	for (var key in inventory)
	{
		var item = inventory[key];
		var text = this.bookDocument.getInventoryText(key);
		if (!text)
		{
			console.error("Inventory text for \"" + text + "\" not found.");
			text = "(n/a)";
		}
		inventoryArray.push(
        {
        	key: key,
        	text: text,
        	inventoryItem: item,
        });
	}
	if (!inventoryArray.length)
	{
		this.elements.inventory.innerHTML = "";
	}
	else
	{
		inventoryArray.sort(function (left, right) { return left.text.localeCompare(right.text); });
		var sb = [];
		for (var length = inventoryArray.length, i = 0; i < length; ++i)
		{
			var item = inventoryArray[i];
			sb.push(item.text + (item.inventoryItem.quantity > 1 ? " (" + item.inventoryItem.quantity + ")" : ""));
		}
		this.elements.inventory.innerHTML = sb.join("<br />");
	}

	var skills = this.playerDocument.getCurrentSkills();
	if (!skills.length)
	{
		this.elements.skills.innerHTML = "";
	}
	else
	{
		skills.sort();
		var sb = [];
		for (var length = skills.length, i = 0; i < length; ++i)
		{
			var item = skills[i];
			var text = this.bookDocument.getSkillText(item);
			if (!text)
			{
				console.error("Skill text for \"" + item + "\" not found.");
				text = "(n/a)";
			}
			sb.push(text);
		}
		this.elements.skills.innerHTML = sb.join("<br />");
	}

	var implicitData = this.playerDocument.getCurrentImplicitData();
	var implicitDataArray = [];
	var flags = this.playerDocument.getCurrentFlags();
	var flagsArray = [];
	var bookmarks = this.playerDocument.bookmarks;
	var bookmarksArray = [];
	var context = this.playerDocument.getCurrentContext();
	if (this.isDebugMode)
	{
		this.elements.subHeader.innerHTML = ">> " + currentRoomKey;

		//	game time
		var gameTimeElapsedSeconds = this.playerDocument.getCurrentDateTime().subtractDateTime(this.playerDocument.getStartDateTime().getDateOnly()).getTotalSeconds();
		var gameTimeElapsedDays = Math.floor(gameTimeElapsedSeconds / GameDateTime.secondsInDay);
		var gameTimeElapsedSecondsRest = gameTimeElapsedSeconds % GameDateTime.secondsInDay;

		var progressDisplayTicks = 43;
		var secondsPerTick = Math.floor(GameDateTime.secondsInDay / progressDisplayTicks);

		var currentProgressTicks;
		if (gameTimeElapsedSecondsRest < progressDisplayTicks * secondsPerTick)
		{
			currentProgressTicks = Math.ceil(gameTimeElapsedSecondsRest / secondsPerTick);
		}
		else
		{
			currentProgressTicks = progressDisplayTicks;
		}

		var sb = [];
		sb.push(this.playerDocument.getCurrentDateTime().toString());
		sb.push(" (" + this.playerDocument.getCurrentTimeSpan().toString() + ")");
		sb.push(" | ");
		sb.push("(");
		sb.push(gameTimeElapsedDays);
		sb.push(")");
		sb.push(" [");
		for (var length = progressDisplayTicks, i = 0; i < length; ++i)
		{
			if (i < currentProgressTicks)
			{
				sb.push("#");
				continue;
			}
			sb.push(".");
		}
		sb.push("]");

		this.elements.dateTime.innerHTML = sb.join("");
		//	/game time

		var sb = [];

		for (var key in bookmarks)
		{
			bookmarksArray.push(key);
		}
		bookmarksArray.sort();
		for (var length = bookmarksArray.length, i = 0; i < length; ++i)
		{
			var item = bookmarksArray[i];
			var value = bookmarks[item];
			sb.push("bookmark: " + item + "<br />&nbsp;&nbsp;&nbsp;&nbsp;=> " + value);
		}
		sb.push("\n");

		for (var key in implicitData)
		{
			var item = implicitData[key];
			implicitDataArray.push(
            {
            	key: key,
            	item: item,
            });
		}
		implicitDataArray.sort(function (left, right) { return left.key.localeCompare(right.key); });
		for (var length = implicitDataArray.length, i = 0; i < length; ++i)
		{
			var item = implicitDataArray[i];
			sb.push("implicit: " + item.key + ": " + JSON.stringify(item.item));
		}
		
		for (var key in flags)
		{
			flagsArray.push(key);
		}
		flagsArray.sort();
		for (var length = flagsArray.length, i = 0; i < length; ++i)
		{
			var item = flagsArray[i];
			sb.push("flag: " + item);
		}

		var currentEnterOnce = this.playerDocument.getCurrentEnterOnce();
		for (var key in currentEnterOnce)
		{
			sb.push("enterOnce: " + key);
		}

		var currentInsertTextOnce = this.playerDocument.getCurrentInsertTextOnce();
		for (var key in currentInsertTextOnce)
		{
			sb.push("insertTextOnce: " + key);
		}

		var storageSize = this.playerDocument.getStorageSize();
		var storageSizeMB = Math.round(storageSize * 100 / (1024 * 1024)) / 100;
		var storageSize_earlyTreshold = 5 * 1024 * 1024;
		var storageSize_alertTreshold = 8 * 1024 * 1024;
		if (storageSize > storageSize_alertTreshold)
		{
			sb.push("storage: <b style='color:red;'>" + storageSizeMB + "MB</b>");
		}
		else if (storageSize > storageSize_earlyTreshold)
		{
			sb.push("storage: <span style='color:orange;'>" + storageSizeMB + "MB</span>");
		}
		else
		{
			sb.push("storage: " + storageSizeMB + "MB");
		}

		if (sb.length)
		{
			this.elements.implicit.innerHTML = sb.join("<br />");
			this.elements.implicitTitleRow.style.display = "";
			this.elements.implicitRow.style.display = "";
		}
		else
		{
			this.elements.implicit.innerHTML = "";
			this.elements.implicitTitleRow.style.display = "none";
			this.elements.implicitRow.style.display = "none";
		}

		var fill_timer = XhtmlTemplate.fill("timerHeadersRow");
		var timersSb = [fill_timer.xhtml];
		var hasTimers = false;
		for (var key in this.playerDocument.playerState.timers)
		{
			var timer = this.playerDocument.playerState.timers[key];
			var wtimer = new WPlayerDocument_Timer(timer);
			fill_timer = XhtmlTemplate.fill("timerRow",
			{
				key: timer.key,
				start: GameTimeSpan.fromTimesig(wtimer.getTimerStart_timesig()).toString(),
				interval: GameTimeSpan.fromTimesig(wtimer.getTimerInterval_timesig()).toString(),
				once: wtimer.getTimerOnce() ? "once" : "repreat",
				hit: !wtimer.isActive(this.playerDocument.getCurrentTimeSpan()) ? "stopped" : "TODO",
			});
			timersSb.push(fill_timer.xhtml);
			hasTimers = true;
		}
		this.elements.timersTable.style.display = hasTimers ? "" : "none";
		document.getElementById("timersTitle").style.display = hasTimers ? "" : "none";
		this.elements.timersTable.innerHTML = timersSb.join("");

		var contextEmpty = true;
		for (var key in this.playerDocument.getCurrentContext())
		{
			contextEmpty = false;
		}
		this.elements.contextTitleRow.style.display = contextEmpty ? "none" : "";
		this.elements.contextRow.style.display = contextEmpty ? "none" : "";
		this.elements.context.innerHTML = JSON.stringify(this.playerDocument.getCurrentContext(), null, '\t');

		this.elements.back.style.display = "";
		this.elements.subHeader.style.display = "";
		this.elements.dateTime.style.display = "";
	}
	else
	{
		document.getElementById("timersTitle").style.display = "none";
		this.elements.back.style.display = "none";
		this.elements.subHeader.style.display = "none";
		this.elements.dateTime.style.display = "none";
		this.elements.implicitTitleRow.style.display = "none";
		this.elements.implicitRow.style.display = "none";
		this.elements.contextTitleRow.style.display = "none";
		this.elements.contextRow.style.display = "none";
		this.elements.timersTable.style.display = "none";
	}

	if (!knowledge.length && !inventoryArray.length && !skills.length && !implicitDataArray.length)
	{
		this.elements.playerInventory.style.display = "none";
	}
	else if(this.playerDocument.getCurrentRoomKey() == this.bookDocument.getDefaultRoom().key)
	{
		this.elements.playerInventory.style.display = "none";
	}
	else
	{
		this.elements.playerInventory.style.display = "";
	}

	this.elements.health.innerHTML = this.playerDocument.getCurrentHealth();
	this.elements.energy.innerHTML = this.playerDocument.getCurrentEnergy();
	this.elements.might.innerHTML = this.playerDocument.getCurrentMight();
	this.elements.speed.innerHTML = this.playerDocument.getCurrentSpeed();

	if (this.playerDocument.getCurrentStance())
	{
		var stanceTextItems = this.bookDocument.getStanceTextItems(this.playerDocument.getCurrentStance().key);
		if (!stanceTextItems)
		{
			console.error("Stance text items for \"" + this.playerDocument.getCurrentStance().key + "\" not found.");
			this.elements.stance.innerHTML = "(n/a)";
		}
		else
		{
			this.elements.stance.innerHTML = stanceTextItems.title;
		}
		this.elements.playerStats.style.display = "";
	}
	else
	{
		this.elements.playerStats.style.display = "none";
	}
}

GameView.prototype.playerDocument_change = function (sender, e)
{
	if (!e.flush)
	{
		return;
	}
	this.refresh();
}

GameView.prototype.navigation_onclick = function (e)
{
	e = e || window.event;
	var element = e.target || e.srcElement;
	switch(element.getAttribute("ux-role"))
	{
		case "navigateButton":
			this.navigation_onclick_navigate(element);
			break;
		case "overwriteChaosDiceRollButton":
			this.navigation_onclick_overwriteChaosDiceRoll(element);
			break;
		case "overwriteChaosRandomIntButton":
			this.navigation_onclick_overwriteChaosRandomInt(element);
			break;
		default:
			return;
	}
}

GameView.prototype.navigation_onclick_navigate = function (element)
{
	if (!element.id)
	{
		return;
	}

	var ignoreActions = element.getAttribute("ignoreActions") == "true";
	var exitIndex = parseInt(element.getAttribute("exitIndex"));

	var currentRoom = this.bookDocument.getRoom(this.playerDocument.getCurrentRoomKey());
	if (!currentRoom)
	{
		console.error("Room key \"" + this.playerDocument.getCurrentRoomKey() + "\" not found (1).");
		return;
	}

	var room = null;
	var currentRoomExit = currentRoom.exits[exitIndex];

	var buttonTargetType = element.getAttribute("target-type");
	switch (buttonTargetType)
	{
		case "systemTarget":
			if (!currentRoomExit.systemTarget)
			{
				throw "Invalid operation.";
			}
			this.playerDocument.navigate(room, currentRoom, currentRoomExit, false, ignoreActions);
			break;
		default:
			room = this.bookDocument.getRoom(element.id);
			if (!room)
			{
				console.error("Room key \"" + element.id + "\" not found (2).");
				return;
			}
			this.playerDocument.navigate(room, currentRoom, currentRoomExit, false, ignoreActions);
			scroll(0, 0);
			break;
	}
}

GameView.prototype.navigation_onclick_overwriteChaosDiceRoll = function (element)
{
	var diceRoll = element.getAttribute("diceRoll");
	if (!diceRoll)
	{
		throw "Invalid html element (1).";
	}
	var parentType = element.getAttribute("parentType");
	if (!parentType)
	{
		throw "Invalid html element (2).";
	}

	this.playerDocument.chaos.overwriteNextDiceRoll(parseInt(diceRoll));
}

GameView.prototype.navigation_onclick_overwriteChaosRandomInt = function (element)
{
	var relatedSelectId = element.getAttribute("relatedSelectId");
	if (!relatedSelectId)
	{
		throw "Invalid html element (3).";
	}
	var selectElement = document.getElementById(relatedSelectId);
	if (!selectElement)
	{
		throw "Invalid html element (4).";
	}

	var selectedValue = selectElement.options[selectElement.selectedIndex].value;

	this.playerDocument.chaos.overwriteNextRandomInt(parseInt(selectedValue));
}

GameView.prototype.restart_onclick = function (e)
{
	if (!this.isDebugMode)
	{
		if (!confirm("If you press OK all your game progress wil be lost. Are you sure you want to start over?"))
		{
			return;
		}
	}
	this.playerDocument.restart("fromTitle");
}

GameView.prototype.back_onclick = function (e)
{
	this.playerDocument.back();
	scroll(0, 0);
}

GameView.prototype.changeTheme_onclick = function (e)
{
	var currentTheme = this.playerDocument.getCurrenTheme();
	switch (currentTheme)
	{
		case "light":
			this.playerDocument.setCurrenTheme("dark");
			break;
		case "dark":
			this.playerDocument.setCurrenTheme("light");
			break;
		default:
			console.error("Unknown theme \"" + currentTheme + "\"");
			this.playerDocument.setCurrenTheme("dark");
			break;
	}
	this.refresh();
}

GameView.prototype.text_onclick = function (e)
{
	e = e || window.event;
	var element = e.target || e.srcElement;
	if (element.getAttribute("ux-role") != "secret")
	{
		return;
	}
	var command = element.getAttribute("command");
	if (!command)
	{
		return;
	}
	var argument = element.getAttribute("argument") || "";

	this.playerDocument.executeCommand(
    {
    	action: "textClick",
    	name: command,
    	argument: argument,
    });
}


GameView.renderChaosDebugUi = function (sb, parentType, name, chaosItem)
{
	switch (chaosItem.type)
	{
		case "diceRoll":
			var fill = XhtmlTemplate.fill("navigationRow_diceDebug",
			{
				parentType: parentType,
				name: name
			});
			sb.push(fill.xhtml);
			break;
		case "randomInt":
			var length = chaosItem.to - chaosItem.from;
			if(length > 99)
			{
				//	implement a textbox instead of a dropdown
				throw "Not implemented.";
			}
			var itemSb = [];
			for (var i = 0; i < length; ++i)
			{
				var fill_item = XhtmlTemplate.fill("navigationRow_randomIntDebug_item",
				{
					value: i + chaosItem.from,
				});
				itemSb.push(fill_item.xhtml);
			}
			var fill = XhtmlTemplate.fill("navigationRow_randomIntDebug",
			{
				parentType: parentType,
				name: name,
				items: itemSb.join("")
			});
			sb.push(fill.xhtml);
			break;
		default:
			throw "Not implemented.";
	}
}

GameView.formatText = function (text, slotValues, onCommandSlot, onXmlTag, isInline)
{
	isInline = !!isInline;

	var sb = [];

	var STATE_TEXT = 1;
	var STATE_STUB_MARKER = 101;
	var STATE_NEWLINES = 2;
	var STATE_SLOTCANDIDATE = 3;
	var STATE_SLOT = 4;
	var STATE_COMMAND = 5;
	var STATE_XML_TAG = 6;
	var STATE_XML_ATTRBIBUTE_LIST = 7;
	var STATE_XML_ATTRBIBUTE_NAME = 8;
	var STATE_XML_ATTRBIBUTE_VALUE_CANDIDATE = 9;
	var STATE_XML_ATTRBIBUTE_VALUE = 10;

	var state = STATE_TEXT;
	if (text.length && text[0] == '!')
	{
		state = STATE_STUB_MARKER;
	}

	var stubMarkerCounter = 0;
	var slotNameSb = null;
	var commandTextSb = null;
	var tagVerbatimSb = null;
	var tagNameSb = null;
	var attributeNameSb = null;
	var attributeValueSb = null;
	var hasParagraphs = false;

	var attributeName = null;
	var tagDef = null;

	for (var length = text.length, i = 0; i < length; ++i)
	{
		var c = text[i];
		switch (state)
		{
			case STATE_STUB_MARKER:
				switch (c)
				{
					case '!':
						++stubMarkerCounter;
						break;
					default:
						if (stubMarkerCounter >= 3)
						{
							sb.push("<p class=\"stub\">This room is a stub. It is a subject of further development and will be expanded in the future.</p>");
						}
						--i;
						state = STATE_TEXT;
						break;
				}
				break;
			case STATE_TEXT:
				switch (c)
				{
					case '\r':
					case '\n':
						hasParagraphs = true;
						sb.push("</p><p>");
						state = STATE_NEWLINES;
						break;
					case '@':
						state = STATE_SLOTCANDIDATE;
						break;
					case '<':
						tagNameSb = [];
						tagVerbatimSb = [];
						tagDef =
						{
							name: null,
							attributes: {},
						};
						tagVerbatimSb.push(c);
						state = STATE_XML_TAG;
						break;
					default:
						sb.push(c);
						break;
				}
				break;
			case STATE_NEWLINES:
				switch (c)
				{
					case '\r':
					case '\n':
					case '\t':
					case ' ':
						state = STATE_NEWLINES;
						break;
					case '@':
						state = STATE_SLOTCANDIDATE;
						break;
					case '<':
						tagNameSb = [];
						tagVerbatimSb = [];
						tagDef =
						{
							name: null,
							attributes: {},
						};
						tagVerbatimSb.push(c);
						state = STATE_XML_TAG;
						break;
					default:
						state = STATE_TEXT;
						sb.push(c);
						break;
				}
				break;
			case STATE_SLOTCANDIDATE:
				switch (c)
				{
					case '\r':
					case '\n':
					case '\t':
						console.error("Syntax error: new lines, spaces and tabs are not allowed.");
						break;
					case '!':
						commandTextSb = [];
						state = STATE_COMMAND;
						break;
					default:
						slotNameSb = [];
						slotNameSb.push(c);
						state = STATE_SLOT;
						break;
				}
				break;
			case STATE_SLOT:
				switch (c)
				{
					case '\r':
					case '\n':
					case '\t':
						console.error("Slot reference syntax error: new lines, spaces and tabs are not allowed.");
						break;
					case '@':
						var slotName = slotNameSb.join("");
						var slotValue = slotValues[slotName] || "";
						var slotValue_formatted = GameView.formatText(slotValue, slotValues, onCommandSlot, onXmlTag, true);
						sb.push(slotValue_formatted);
						state = STATE_TEXT;
						break;
					default:
						slotNameSb.push(c);
						break;
				}
				break;
			case STATE_COMMAND:
				switch (c)
				{
					case '@':
						var commandText = commandTextSb.join("");
						var commandSlot = GameView.parseCommandTag(commandText);
						var commandOutputText;
						if (!commandSlot)
						{
							commandOutputText = commandText;
						}
						else if (onCommandSlot)
						{
							commandOutputText = onCommandSlot(commandSlot);
						}
						else
						{
							commandOutputText = commandSlot.text;
						}
						sb.push(commandOutputText);
						state = STATE_TEXT;
						break;
					default:
						commandTextSb.push(c);
						break;
				}
				break;
			case STATE_XML_TAG:
				tagVerbatimSb.push(c);
				switch (c)
				{
					case '/':
						break;
					case '>':
						tagDef.name = tagNameSb.join("");
						var callbackResult = onXmlTag(tagDef);
						if (callbackResult === null)
						{
							sb.push(tagVerbatimSb.join(""));
						}
						else
						{
							sb.push(callbackResult);
						}
						state = STATE_TEXT;
						break;
					case ' ':
					case '\t':
					case '\r':
					case '\n':
						state = STATE_XML_ATTRBIBUTE_LIST;
						break;
					default:
						tagNameSb.push(c);
						break;
				}
				break;
			case STATE_XML_ATTRBIBUTE_LIST:
				tagVerbatimSb.push(c);
				switch (c)
				{
					case '/':
						break;
					case '>':
						tagDef.name = tagNameSb.join("");
						var callbackResult = onXmlTag(tagDef);
						if (callbackResult === null)
						{
							sb.push(tagVerbatimSb.join(""));
						}
						else
						{
							sb.push(callbackResult);
						}
						state = STATE_TEXT;
						break;
					case ' ':
					case '\t':
					case '\r':
					case '\n':
						break;
					default:
						attributeNameSb = [c];
						attributeName = null;
						state = STATE_XML_ATTRBIBUTE_NAME;
						break;
				}
				break;
			case STATE_XML_ATTRBIBUTE_NAME:
				tagVerbatimSb.push(c);
				switch (c)
				{
					case '/':
						break;
					case '>':
						tagDef.name = tagNameSb.join("");
						var callbackResult = onXmlTag(tagDef);
						if (callbackResult === null)
						{
							sb.push(tagVerbatimSb.join(""));
						}
						else
						{
							sb.push(callbackResult);
						}
						state = STATE_TEXT;
						break;
					case '=':
						attributeName = attributeNameSb.join("");
						tagDef.attributes[attributeName] = null;
						state = STATE_XML_ATTRBIBUTE_VALUE_CANDIDATE;
						break;
					case ' ':
					case '\t':
					case '\r':
					case '\n':
						attributeName = attributeNameSb.join("");
						tagDef.attributes[attributeName] = null;
						state = STATE_XML_ATTRBIBUTE_LIST;
						break;
					default:
						attributeNameSb.push(c);
						break;
				}
				break;
			case STATE_XML_ATTRBIBUTE_VALUE_CANDIDATE:
				tagVerbatimSb.push(c);
				switch (c)
				{
					case '/':
						break;
					case '>':
						tagDef.name = tagNameSb.join("");
						var callbackResult = onXmlTag(tagDef);
						if (callbackResult === null)
						{
							sb.push(tagVerbatimSb.join(""));
						}
						else
						{
							sb.push(callbackResult);
						}
						state = STATE_TEXT;
						break;
					case '"':
						attributeValueSb = [];
						state = STATE_XML_ATTRBIBUTE_VALUE;
						break;
					case ' ':
					case '\t':
					case '\r':
					case '\n':
						break;
					default:
						state = STATE_XML_ATTRBIBUTE_LIST;
						break;
				}
				break;
			case STATE_XML_ATTRBIBUTE_VALUE:
				tagVerbatimSb.push(c);
				switch (c)
				{
					case '"':
						tagDef.attributes[attributeName] = attributeValueSb.join("");
						state = STATE_XML_ATTRBIBUTE_LIST;
						break;
					default:
						attributeValueSb.push(c);
						break;
				}
				break;
			default:
				throw "Not implemented";
		}
	}

	if (!isInline || hasParagraphs)
	{
		sb.unshift("<p>");
		sb.push("</p>");
	}

	return sb.join("");
}

GameView.parseCommandTag = function (text)
{
	var result =
    {
    		command: null,
    		argument: null,
    		text: null,
    };

	var colon_foundAt = text.indexOf(':');
	if (colon_foundAt == -1)
	{
		console.error(37246285, "Invalid command tag syntax (1).");
		return null;
	}
	result.command = text.substr(0, colon_foundAt);

	var questionMark_foundAt = text.indexOf('?', colon_foundAt + 1);
	if (questionMark_foundAt == -1)
	{
		result.argument = text.substr(colon_foundAt + 1);
	}
	else
	{
		result.argument = text.substr(colon_foundAt + 1, questionMark_foundAt - colon_foundAt - 1);
		result.text = text.substr(questionMark_foundAt + 1);
	}

	return result;
}
