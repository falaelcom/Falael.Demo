"use strict";

include("StdAfx.js");

//	tests
//		- ForexRangerV5.asString(new ForexRangerV5({ dow: [4] }).weeklyRanges(new Range(new Date(2011, 1, 1), new Date(2011, 2, 1))))
class ForexRangerV5
{
	constructor(par)
	{
		//	included days of week, default - working week days
		this._dow = par?.dow || [1, 2, 3, 4, 5];
	}

	//	generates a series of ranges including the overlapping open hours of new york and london openhours during the days of weeks specified in this._dow
	//	range in utc ms
	weeklyRanges(startDt, weekCount)
	{
		var range = new Range(startDt, EDateTimeUnit.addToMoment(moment.utc(startDt), weekCount, EDateTimeUnit.Week).valueOf())

		//	https://www.babypips.com/learn/forex/forex-trading-sessions
		//var sidney_openHour_localTime = 7;
		//var sidney_closeHour_localTime = 16;
		//var tokyo_openHour_localTime = 9;
		//var tokyo_closeHour_localTime = 18;
		//var london_openHour_localTime = 8;
		var london_closeHour_localTime = 16;
		var newYork_openHour_localTime = 8;
		//var newYork_closeHour_localTime = 17;

		var result = [];

		var startMoment = EDateTimeUnit.floorMoment(moment.utc(range.min), EDateTimeUnit.Week, 1);
		var endMoment = EDateTimeUnit.floorMoment(moment.utc(range.max), EDateTimeUnit.Week, 1);

		var currentMoment = startMoment;
		while (currentMoment.valueOf() <= endMoment.valueOf())
		{
			for (var length = this._dow.length, i = 0; i < length; ++i)
			{
				var dayStartMoment = moment(currentMoment).add(this._dow[i], 'd');
				if (dayStartMoment.month() == 0 && dayStartMoment.date() == 1) continue;	//	skip the new year's day
				var dayStartMoment_newYork = moment.tz([dayStartMoment.year(), dayStartMoment.month(), dayStartMoment.date()], "America/New_York");
				var dayStartMoment_london = moment.tz([dayStartMoment.year(), dayStartMoment.month(), dayStartMoment.date()], "Europe/London");
				//	include the time range after new york opens and before london closes
				var resultRange = new Range(

					moment(dayStartMoment_newYork).hours(newYork_openHour_localTime).valueOf(),
					moment(dayStartMoment_london).hours(london_closeHour_localTime).valueOf()
				);
				if (resultRange.length <= 0) throw "Invalid operation.";
				result.push(resultRange);
			}

			currentMoment = EDateTimeUnit.addToMoment(currentMoment, 1, EDateTimeUnit.Week);
		}

		return result;
	}

	//	generates a series of ranges including the overlapping open hours of new york and london openhours during the days of weeks specified in this._dow
	//	range in utc ms
	randomRanges(startDt, endDt, rangeCount)
	{
		var range = new Range(startDt, endDt);

		//	https://www.babypips.com/learn/forex/forex-trading-sessions
		//var sidney_openHour_localTime = 7;
		//var sidney_closeHour_localTime = 16;
		//var tokyo_openHour_localTime = 9;
		//var tokyo_closeHour_localTime = 18;
		//var london_openHour_localTime = 8;
		var london_closeHour_localTime = 16;
		var newYork_openHour_localTime = 8;
		//var newYork_closeHour_localTime = 17;

		var result = [];

		while (result.length < rangeCount)
		{
			var randomDt = range.min + Math.floor(Math.random() * range.length);
			var currentMoment = EDateTimeUnit.floorMoment(moment.utc(randomDt), EDateTimeUnit.Week, 1);

			for (var length = this._dow.length, i = 0; i < length; ++i)
			{
				var dayStartMoment = moment(currentMoment).add(this._dow[i], 'd');
				if (dayStartMoment.month() == 0 && dayStartMoment.date() == 1) continue;	//	skip the new year's day
				var dayStartMoment_newYork = moment.tz([dayStartMoment.year(), dayStartMoment.month(), dayStartMoment.date()], "America/New_York");
				var dayStartMoment_london = moment.tz([dayStartMoment.year(), dayStartMoment.month(), dayStartMoment.date()], "Europe/London");
				//	include the time range after new york opens and before london closes
				var resultRange = new Range(

					moment(dayStartMoment_newYork).hours(newYork_openHour_localTime).valueOf(),
					moment(dayStartMoment_london).hours(london_closeHour_localTime).valueOf()
				);
				if (resultRange.length <= 0) throw "Invalid operation.";
				result.push(resultRange);
			}
		}

		return result;
	}

	static asString(arg)
	{
		var ranges;
		if (Utility.Type.isArray(arg)) ranges = arg;
		else ranges = [arg];

		var sb = [];
		for (var length = ranges.length, i = 0; i < length; ++i)
		{
			var item = ranges[i];
			sb.push(moment.utc(item.min).toString());
			sb.push(" - ");
			sb.push(moment.utc(item.max).toString());
			sb.push("\n");
		}

		return sb.join("");
	}
}
