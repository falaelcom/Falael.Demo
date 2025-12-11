"use strict";

include("StdAfx.js");

function WPlayerDocument_Timer(obj)
{
	if (!obj)
	{
		throw "Argument is null: obj";
	}
	this.obj = obj;
}

WPlayerDocument_Timer.create = function (key)
{
	return {
		key: key,
		history: [],
	};
}

WPlayerDocument_Timer.prototype.start = function (startTime_timesig, interval_timesig, once)
{
	if (this.isActive())
	{
		throw "Already started.";
	}

	var historyItem =
	{
		startTime_timesig: startTime_timesig,
		stopTime_timesig: null,
		interval_timesig: interval_timesig,
		once: once,
	};

	this.obj.history.push(historyItem);
}

WPlayerDocument_Timer.prototype.stop = function (stopTime_timesig)
{
	if (!this.isActive())
	{
		throw "Already stopped.";
	}

	var currentState = this.obj.history[this.obj.history.length - 1];
	currentState.stopTime_timesig = stopTime_timesig;
}

WPlayerDocument_Timer.prototype.rollback = function ()
{
	if (!this.obj.history.length)
	{
		throw "Invalid operation.";
	}

	var currentState = this.obj.history[this.obj.history.length - 1];
	if (!currentState.stopTime_timesig)
	{
		this.obj.history.pop();
		return this.obj.history.length;
	}

	currentState.stopTime_timesig = null;

	return this.obj.history.length;
}

WPlayerDocument_Timer.prototype.isActive = function (timepoint_timespan)
{
	//if (this.obj.key == "timers.priestUnconscious")
	//{
	//	debugger;
	//}
	if (!this.obj.history.length)
	{
		return false;
	}
	var currentState = this.obj.history[this.obj.history.length - 1];
	if (!currentState.startTime_timesig)
	{
		throw "Invalid operation.";
	}
	if (currentState.stopTime_timesig)
	{
		return false;
	}

	if (timepoint_timespan)
	{
		if (currentState.once)
		{
			var interval_timespan = GameTimeSpan.fromTimesig(currentState.interval_timesig);
			var startTime_timespan = GameTimeSpan.fromTimesig(currentState.startTime_timesig);
			var stopTime_timespan = startTime_timespan.clone();
			stopTime_timespan.add(interval_timespan);

			return timepoint_timespan.moreThanOrEquals(startTime_timespan) && timepoint_timespan.lessThanOrEquals(stopTime_timespan);
		}

		throw "Not implemented.";
	}

	return true;
}

WPlayerDocument_Timer.prototype.isActiveWithin = function (rangeBegin_timespan, rangeBegin_isInclusive, rangeEnd_timespan, rangeEnd_isInclusive)
{
	if (!rangeBegin_timespan)
	{
		throw "Invalid argument: rangeBegin_timespan.";
	}
	if (!rangeEnd_timespan)
	{
		throw "Invalid argument: rangeEnd_timespan.";
	}
	if (!this.obj.history.length)
	{
		return false;
	}
	var currentState = this.obj.history[this.obj.history.length - 1];
	if (!currentState.startTime_timesig)
	{
		throw "Invalid operation.";
	}
	if (currentState.stopTime_timesig)
	{
		return false;
	}

	if (currentState.once)
	{
		var interval_timespan = GameTimeSpan.fromTimesig(currentState.interval_timesig);
		var startTime_timespan = GameTimeSpan.fromTimesig(currentState.startTime_timesig);
		var stopTime_timespan = null;

		if (currentState.stopTime_timesig)
		{
			stopTime_timespan = GameTimeSpan.fromTimesig(currentState.stopTime_timesig);
		}
		else
		{
			stopTime_timespan = startTime_timespan.clone();
			stopTime_timespan.add(interval_timespan);
		}

		var stoppedBeforeRange = stopTime_timespan.isWithinRange(GameTimeSpan.zero, true, rangeBegin_timespan, !rangeBegin_isInclusive);
		var startedAfterRange = startTime_timespan.isWithinRange(rangeEnd_timespan, !rangeEnd_isInclusive, GameTimeSpan.maxValue, true);

		return (!stoppedBeforeRange) && (!startedAfterRange);
	}

	throw "Not implemented.";
}

WPlayerDocument_Timer.prototype.ticksWithin = function (rangeBegin_timespan, rangeBegin_isInclusive, rangeEnd_timespan, rangeEnd_isInclusive)
{
	if (!rangeBegin_timespan)
	{
		throw "Invalid argument: rangeBegin_timespan.";
	}
	if (!rangeEnd_timespan)
	{
		throw "Invalid argument: rangeEnd_timespan.";
	}
	if (!this.obj.history.length)
	{
		return false;
	}
	var currentState = this.obj.history[this.obj.history.length - 1];
	if (!currentState.startTime_timesig)
	{
		throw "Invalid operation.";
	}

	if (currentState.once)
	{
		var interval_timespan = GameTimeSpan.fromTimesig(currentState.interval_timesig);
		var startTime_timespan = GameTimeSpan.fromTimesig(currentState.startTime_timesig);
		var tickTime_timespan = startTime_timespan.clone();
		tickTime_timespan.add(interval_timespan);

		if (currentState.stopTime_timesig)
		{
			var stopTime_timespan = GameTimeSpan.fromTimesig(currentState.stopTime_timesig);
			rangeEnd_timespan = GameTimeSpan.min(rangeEnd_timespan, stopTime_timespan);
		}

		return tickTime_timespan.isWithinRange(rangeBegin_timespan, rangeBegin_isInclusive, rangeEnd_timespan, rangeEnd_isInclusive);
	}

	throw "Not implemented.";
}

WPlayerDocument_Timer.prototype.getTimerStart_timesig = function ()
{
	if (!this.obj.history.length)
	{
		throw "Invalid operation.";
	}
	var currentState = this.obj.history[this.obj.history.length - 1];
	if (!currentState.startTime_timesig)
	{
		throw "Invalid operation.";
	}
	
	return currentState.startTime_timesig;
}

WPlayerDocument_Timer.prototype.getTimerInterval_timesig = function ()
{
	if (!this.obj.history.length)
	{
		throw "Invalid operation.";
	}
	var currentState = this.obj.history[this.obj.history.length - 1];
	if (!currentState.interval_timesig)
	{
		throw "Invalid operation.";
	}

	return currentState.interval_timesig;
}

WPlayerDocument_Timer.prototype.getTimerOnce = function ()
{
	if (!this.obj.history.length)
	{
		throw "Invalid operation.";
	}
	var currentState = this.obj.history[this.obj.history.length - 1];
	return currentState.once;
}

