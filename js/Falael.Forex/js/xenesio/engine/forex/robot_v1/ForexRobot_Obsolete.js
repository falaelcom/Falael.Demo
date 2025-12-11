"use strict";

include("StdAfx.js");

class ForexRobot_Obsolete
{
	constructor()
	{
		this._dataBuffer = [];
		this._dataProcessingSuspendCount = 0;
		this._unprocessedDataPointCount = 0;
	}

	feed(time, value)
	{
		this._dataBuffer.push([time, value]);
		if (!this._dataProcessingSuspendCount)
		{
			this.__onFeed();
			this._unprocessedDataPointCount = 0;
		}
		else ++this._unprocessedDataPointCount;
	}

	__onFeed()
	{
	}

	suspendDataProcessing()
	{
		++this._dataProcessingSuspendCount;
	}

	resumeDataProcessing()
	{
		if (!this._dataProcessingSuspendCount) throw "Invalid operation.";
		--this._dataProcessingSuspendCount;
		if (!this._dataProcessingSuspendCount)
		{
			var unprocessedDataPointCount = this._unprocessedDataPointCount;
			this._unprocessedDataPointCount = 0;
			this.__onFeed(unprocessedDataPointCount);
		}
	}

	get dataCache()
	{
		return this._dataBuffer;
	}
}
