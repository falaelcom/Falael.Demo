"use strict";

include("StdAfx.js");

class ForexMessageBus
{
	constructor()
	{
		this._callbacks = {};
	}


	subscribe(featureType, callback)
	{
		var callbackList = this._callbacks[featureType];
		if (!callbackList)
		{
			callbackList = [];
			this._callbacks[featureType] = callbackList;
		}
		callbackList.push(callback);
	}

	subscribeMany(featureTypeList, callback)
	{
		for (var length = featureTypeList.length, i = 0; i < length; ++i) this.subscribe(featureTypeList[i], callback);
	}

	sendMessage(featureType, sender, args)
	{
		var callbackList = this._callbacks[featureType];
		if (!callbackList) return;
		for (var length = callbackList.length, i = 0; i < length; ++i) callbackList[i](sender, args);
	}


	get callbacks()
	{
		return this._callbacks;
	}
}
