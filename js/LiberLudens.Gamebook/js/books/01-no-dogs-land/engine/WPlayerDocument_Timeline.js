"use strict";

include("StdAfx.js");

function WPlayerDocument_Timeline(obj)
{
	if (!obj)
	{
		throw "Argument is null: obj";
	}
	if (!obj.items)
	{
		throw "Argument is not valid: obj";
	}
	this.obj = obj;
}

WPlayerDocument_Timeline.create = function ()
{
	return {
		items: [],
	};
}

WPlayerDocument_Timeline.prototype.writeToConsole = function(source)
{
	var lastItem = null;
	var foreLastItem = null;

	if (this.obj.items.length)
	{
		lastItem = this.obj.items[this.obj.items.length - 1];
	}
	if (this.obj.items.length > 1)
	{
		foreLastItem = this.obj.items[this.obj.items.length - 2];
	}

	console.log("================================");
	console.log(source, "player document timeline dump");
	console.log("================================");
	console.log(JSON.stringify(foreLastItem, null, '\t'));
	console.log(JSON.stringify(lastItem, null, '\t'));
	console.log("--------------------------------");
}

WPlayerDocument_Timeline.prototype.addTimeCycle = function (sourceRoom, sourceExit, sourceExitEndTimesig)
{
	var lastItem = null;
	if (this.obj.items.length)
	{
		lastItem = this.obj.items[this.obj.items.length - 1];
	}

	this.obj.items.push(
	{
		sourceRoomKey: sourceRoom ? sourceRoom.key : null,
		sourceExitTarget: sourceExit ? sourceExit.target : null,
		sourceExitSystemTarget: sourceExit ? sourceExit.systemTarget : null,
		roomKey: null,

		sourceExitStartTimesig: lastItem ? lastItem.roomEndTimesig : sourceExitEndTimesig,
		sourceExitEndTimesig: sourceExitEndTimesig,
		hubExitEndTimesigs: [],
		roomStartTimesig: sourceExitEndTimesig,
		roomEndTimesig: null,
	});
}

WPlayerDocument_Timeline.prototype.addHubTime = function (hubRoom, hubExit, hubExitEndTimesig)
{
	var currentItem = this.obj.items[this.obj.items.length - 1];
	currentItem.hubExitEndTimesigs.push(
	{
		hubRoomKey: hubRoom.key,
		hubExitTarget: hubExit.target,
		hubExitEndTimesig: hubExitEndTimesig,
	});
	currentItem.roomStartTimesig = hubExitEndTimesig;
}

WPlayerDocument_Timeline.prototype.setRoomTime = function (room, roomEndTimesig)
{
	var currentItem = this.obj.items[this.obj.items.length - 1];
	currentItem.roomKey = room.key;
	currentItem.roomEndTimesig = roomEndTimesig;
}

WPlayerDocument_Timeline.prototype.rollbackTimeCycle = function ()
{
	this.obj.items.pop();
}

WPlayerDocument_Timeline.prototype.getCurrentTimeInfo = function ()
{
	if (!this.obj.items.length)
	{
		return null;
	}
	return this.obj.items[this.obj.items.length - 1];
}

WPlayerDocument_Timeline.prototype.getLastTimeInfo = function ()
{
	if (!this.obj.items.length || this.obj.items.length < 2)
	{
		return null;
	}
	return this.obj.items[this.obj.items.length - 2];
}
