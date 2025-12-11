"use strict";

const moment = require("moment");

//	EDateTimeUnit
const EDateTimeUnit = module.exports =
{
	Century: 1,
	Decade: 2,
	Year: 3,
	Quarter: 4,
	Month: 5,
	Week: 6,
	Day: 7,
	Hour: 8,
	Minute: 9,
	Second: 10,
	Millisecond: 11,

	getName: function(value)
	{
		switch (value)
		{
			case this.Century:
				return "century";
			case this.Decade:
				return "decade";
			case this.Year:
				return "year";
			case this.Quarter:
				return "quarter";
			case this.Month:
				return "month";
			case this.Week:
				return "week";
			case this.Day:
				return "day";
			case this.Hour:
				return "hour";
			case this.Minute:
				return "minute";
			case this.Second:
				return "second";
			case this.Millisecond:
				return "millisecond";
			default:
				throw "Not implemented";
		}
	},

	getMomentDiffKey: function (value)
	{
		switch (value)
		{
			case this.Century:
				return "years";
			case this.Decade:
				return "years";
			case this.Year:
				return "years";
			case this.Quarter:
				return "months";
			case this.Month:
				return "months";
			case this.Week:
				return "weeks";
			case this.Day:
				return "days";
			case this.Hour:
				return "hours";
			case this.Minute:
				return "minutes";
			case this.Second:
				return "seconds";
			case this.Millisecond:
				throw "Not supported.";
			default:
				throw "Not implemented.";
		}
	},

	getMomentAddKey: function (value)
	{
		switch (value)
		{
			case this.Century:
				return "y";
			case this.Decade:
				return "y";
			case this.Year:
				return "y";
			case this.Quarter:
				return "Q";
			case this.Month:
				return "M";
			case this.Week:
				return "w";
			case this.Day:
				return "d";
			case this.Hour:
				return "h";
			case this.Minute:
				return "m";
			case this.Second:
				return "s";
			case this.Millisecond:
				return "ms";
			default:
				throw "Not implemented.";
		}
	},

	getMomentRoundingKey: function (value)
	{
		switch (value)
		{
			case this.Century:
				return "year";
			case this.Decade:
				return "year";
			case this.Year:
				return "year";
			case this.Quarter:
				return "quarter";
			case this.Month:
				return "month";
			case this.Week:
				return "week";
			case this.Day:
				return "day";
			case this.Hour:
				return "hour";
			case this.Minute:
				return "minute";
			case this.Second:
				return "second";
			case this.Millisecond:
				throw "Not supported.";
			default:
				throw "Not implemented.";
		}
	},

	addToMoment: function (left, right, unit)
	{
		var result;
		switch (unit)
		{
			case this.Century:
				result = moment(left).add(right * 100, this.getMomentAddKey(unit));
				break;
			case this.Decade:
				result = moment(left).add(right * 10, this.getMomentAddKey(unit));
				break;
			case this.Quarter:
			case this.Year:
			case this.Month:
			case this.Week:
			case this.Day:
			case this.Hour:
			case this.Minute:
			case this.Second:
			case this.Millisecond:
				result = moment(left).add(right, this.getMomentAddKey(unit));
				break;
			default:
				throw "Not implemented";
		}

		return result;
	},

	diffMoments: function (left, right, unit)
	{
		if (unit == this.Millisecond)
		{
			return left.valueOf() - right.valueOf();
		}

		var result = left.diff(right, this.getMomentDiffKey(unit), true);
		switch (unit)
		{
			case this.Century:
				result /= 100;
				break;
			case this.Decade:
				result /= 10;
				break;
			case this.Quarter:
				result /= 3;
				break;
			case this.Year:
			case this.Month:
			case this.Week:
			case this.Day:
			case this.Hour:
			case this.Minute:
			case this.Second:
			case this.Millisecond:
				break;
			default:
				throw "Not implemented";
		}

		return result;
	},

	startOfMoment: function (value, unit)
	{
		if (unit == this.Millisecond)
		{
			return value;
		}

		var result = moment(value).startOf(this.getMomentRoundingKey(unit));

		switch (unit)
		{
			case this.Century:
				result.year(100 * Math.floor(result.year() / 100));
				break;
			case this.Decade:
				result.year(10 * Math.floor(result.year() / 10));
				break;
			case this.Year:
			case this.Quarter:
			case this.Month:
			case this.Week:
			case this.Day:
			case this.Hour:
			case this.Minute:
			case this.Second:
			case this.Millisecond:
				break;
			default:
				throw "Not implemented";
		}

		return result;
	},

	floorMoment: function (value, unit, factor)
	{
		if (unit == this.Millisecond)
		{
			return moment(value).millisecond(factor * Math.floor(moment(value).millisecond() / factor));
		}

		var result = moment(value).startOf(this.getMomentRoundingKey(unit));

		switch (unit)
		{
			case this.Century:
				result.year(factor * 100 * Math.floor(result.year() / (factor * 100)));
				break;
			case this.Decade:
				result.year(factor * 10 * Math.floor(result.year() / (factor * 10)));
				break;
			case this.Year:
				result.year(factor * Math.floor(result.year() / factor));
				break;
			case this.Quarter:
				result.quarter(factor * Math.floor(result.quarter() / factor));
				break;
			case this.Month:
				result.month(factor * Math.floor(result.month() / factor));
				break;
			case this.Week:
				result.week(factor * Math.floor(result.week() / factor));
				break;
			case this.Day:
				result.day(factor * Math.floor(result.day() / factor));
				break;
			case this.Hour:
				result.hour(factor * Math.floor(result.hour() / factor));
				break;
			case this.Minute:
				result.minute(factor * Math.floor(result.minute() / factor));
				break;
			case this.Second:
				result.second(factor * Math.floor(result.second() / factor));
				break;
			case this.Millisecond:
				throw "Invalid operation.";
			default:
				throw "Not implemented.";
		}

		return result;
	},

	getMaxUnitLengthMs: function (unit)
	{
		switch (unit)
		{
			//	https://www.quora.com/How-many-days-are-in-a-millennium
			case EDateTimeUnit.Century:
				return 1000 * 60 * 60 * 24 * 36525;
			//	https://www.answers.com/Q/How_many_days_are_in_a_decade
			case EDateTimeUnit.Decade:
				return 1000 * 60 * 60 * 24 * 3653;
			case EDateTimeUnit.Year:
				return 1000 * 60 * 60 * 24 * 366;
			//	min 31+28+31+30+31+30+31+31+30+31+30+31+31+28
			//	min       90 89 92 91 92 92 92 92 91 92 92 90 = 89
			//	max 31+29+31+30+31+30+31+31+30+31+30+31+31+29
			//	max       91 90 92 91 92 92 92 92 91 92 92 91 = 92
			case EDateTimeUnit.Quarter:
				return 1000 * 60 * 60 * 24 * 92;
			case EDateTimeUnit.Month:
				return 1000 * 60 * 60 * 24 * 31;
			case EDateTimeUnit.Week:
				return 1000 * 60 * 60 * 24 * 7;
			case EDateTimeUnit.Day:
				return 1000 * 60 * 60 * 24;
			case EDateTimeUnit.Hour:
				return 1000 * 60 * 60;
			case EDateTimeUnit.Minute:
				return 1000 * 60;
			case EDateTimeUnit.Second:
				return 1000;
			case EDateTimeUnit.Millisecond:
				return 1;
			default:
				throw "Not implemented";
		}
	},

	getMinUnitLengthMs: function (unit)
	{
		switch (unit)
		{
			//	https://www.quora.com/How-many-days-are-in-a-millennium
			case EDateTimeUnit.Century:
				return 1000 * 60 * 60 * 24 * 36524;
			//	https://www.answers.com/Q/How_many_days_are_in_a_decade
			case EDateTimeUnit.Decade:
				return 1000 * 60 * 60 * 24 * 3652;
			case EDateTimeUnit.Year:
				return 1000 * 60 * 60 * 24 * 365;
			//	min 31+28+31+30+31+30+31+31+30+31+30+31+31+28
			//	min       90 89 92 91 92 92 92 92 91 92 92 90 = 89
			//	max 31+29+31+30+31+30+31+31+30+31+30+31+31+29
			//	max       91 90 92 91 92 92 92 92 91 92 92 91 = 92
			case EDateTimeUnit.Quarter:
				return 1000 * 60 * 60 * 24 * 89;
			case EDateTimeUnit.Month:
				return 1000 * 60 * 60 * 24 * 28;
			case EDateTimeUnit.Week:
				return 1000 * 60 * 60 * 24 * 7;
			case EDateTimeUnit.Day:
				return 1000 * 60 * 60 * 24;
			case EDateTimeUnit.Hour:
				return 1000 * 60 * 60;
			case EDateTimeUnit.Minute:
				return 1000 * 60;
			case EDateTimeUnit.Second:
				return 1000;
			case EDateTimeUnit.Millisecond:
				return 1;
			default:
				throw "Not implemented";
		}
	}
};