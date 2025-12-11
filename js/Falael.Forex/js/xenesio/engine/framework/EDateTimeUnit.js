"use strict";

include("StdAfx.js");

window.EDateTimeUnit =
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
};

EDateTimeUnit.getName = function (value)
{
	switch (value)
	{
		case EDateTimeUnit.Century:
			return "century";
		case EDateTimeUnit.Decade:
			return "decade";
		case EDateTimeUnit.Year:
			return "year";
		case EDateTimeUnit.Quarter:
			return "quarter";
		case EDateTimeUnit.Month:
			return "month";
		case EDateTimeUnit.Week:
			return "week";
		case EDateTimeUnit.Day:
			return "day";
		case EDateTimeUnit.Hour:
			return "hour";
		case EDateTimeUnit.Minute:
			return "minute";
		case EDateTimeUnit.Second:
			return "second";
		case EDateTimeUnit.Millisecond:
			return "millisecond";
		default:
			throw "Not implemented";
	}
};

////////////////////////////////////////////////////////////////////
//	moment

EDateTimeUnit.getMomentDiffKey = function (value)
{
	switch (value)
	{
		case EDateTimeUnit.Century:
			return "years";
		case EDateTimeUnit.Decade:
			return "years";
		case EDateTimeUnit.Year:
			return "years";
		case EDateTimeUnit.Quarter:
			return "months";
		case EDateTimeUnit.Month:
			return "months";
		case EDateTimeUnit.Week:
			return "weeks";
		case EDateTimeUnit.Day:
			return "days";
		case EDateTimeUnit.Hour:
			return "hours";
		case EDateTimeUnit.Minute:
			return "minutes";
		case EDateTimeUnit.Second:
			return "seconds";
		case EDateTimeUnit.Millisecond:
			throw "Not supported.";
		default:
			throw "Not implemented.";
	}
};

EDateTimeUnit.getMomentAddKey = function (value)
{
	switch (value)
	{
		case EDateTimeUnit.Century:
			return "y";
		case EDateTimeUnit.Decade:
			return "y";
		case EDateTimeUnit.Year:
			return "y";
		case EDateTimeUnit.Quarter:
			return "Q";
		case EDateTimeUnit.Month:
			return "M";
		case EDateTimeUnit.Week:
			return "w";
		case EDateTimeUnit.Day:
			return "d";
		case EDateTimeUnit.Hour:
			return "h";
		case EDateTimeUnit.Minute:
			return "m";
		case EDateTimeUnit.Second:
			return "s";
		case EDateTimeUnit.Millisecond:
			return "ms";
		default:
			throw "Not implemented.";
	}
};

EDateTimeUnit.getMomentRoundingKey = function (value)
{
	switch (value)
	{
		case EDateTimeUnit.Century:
			return "year";
		case EDateTimeUnit.Decade:
			return "year";
		case EDateTimeUnit.Year:
			return "year";
		case EDateTimeUnit.Quarter:
			return "quarter";
		case EDateTimeUnit.Month:
			return "month";
		case EDateTimeUnit.Week:
			return "week";
		case EDateTimeUnit.Day:
			return "day";
		case EDateTimeUnit.Hour:
			return "hour";
		case EDateTimeUnit.Minute:
			return "minute";
		case EDateTimeUnit.Second:
			return "second";
		case EDateTimeUnit.Millisecond:
			throw "Not supported.";
		default:
			throw "Not implemented.";
	}
};

EDateTimeUnit.getMomentDurationKey = function (value)
{
	switch (value)
	{
		case EDateTimeUnit.Century:
			return "y";
		case EDateTimeUnit.Decade:
			return "y";
		case EDateTimeUnit.Year:
			return "y";
		case EDateTimeUnit.Quarter:
			return "M";
		case EDateTimeUnit.Month:
			return "M";
		case EDateTimeUnit.Week:
			return "w";
		case EDateTimeUnit.Day:
			return "d";
		case EDateTimeUnit.Hour:
			return "h";
		case EDateTimeUnit.Minute:
			return "m";
		case EDateTimeUnit.Second:
			return "s";
		case EDateTimeUnit.Millisecond:
			return "ms";
		default:
			throw "Not implemented.";
	}
};

EDateTimeUnit.diffMoments = function (left, right, unit)
{
	if (unit == EDateTimeUnit.Millisecond)
	{
		return left.valueOf() - right.valueOf();
	}

	var result = left.diff(right, EDateTimeUnit.getMomentDiffKey(unit), true);
	switch (unit)
	{
		case EDateTimeUnit.Century:
			result /= 100;
			break;
		case EDateTimeUnit.Decade:
			result /= 10;
			break;
		case EDateTimeUnit.Quarter:
			result /= 3;
			break;
		case EDateTimeUnit.Year:
		case EDateTimeUnit.Month:
		case EDateTimeUnit.Week:
		case EDateTimeUnit.Day:
		case EDateTimeUnit.Hour:
		case EDateTimeUnit.Minute:
		case EDateTimeUnit.Second:
		case EDateTimeUnit.Millisecond:
			break;
		default:
			throw "Not implemented";
	}

	return result;
}

EDateTimeUnit.addToMoment = function (left, right, unit)
{
	var result;
	switch (unit)
	{
		case EDateTimeUnit.Century:
			result = moment(left).add(right * 100, EDateTimeUnit.getMomentAddKey(unit));
			break;
		case EDateTimeUnit.Decade:
			result = moment(left).add(right * 10, EDateTimeUnit.getMomentAddKey(unit));
			break;
		case EDateTimeUnit.Quarter:
		case EDateTimeUnit.Year:
		case EDateTimeUnit.Month:
		case EDateTimeUnit.Week:
		case EDateTimeUnit.Day:
		case EDateTimeUnit.Hour:
		case EDateTimeUnit.Minute:
		case EDateTimeUnit.Second:
		case EDateTimeUnit.Millisecond:
			result = moment(left).add(right, EDateTimeUnit.getMomentAddKey(unit));
			break;
		default:
			throw "Not implemented";
	}

	return result;
}

EDateTimeUnit.subtractFromMoment = function (left, right, unit)
{
	return EDateTimeUnit.addToMoment(left, -right, unit);
}

EDateTimeUnit.startOfMoment = function (value, unit)
{
	if (unit == EDateTimeUnit.Millisecond)
	{
		return value;
	}

	var result = moment(value).startOf(EDateTimeUnit.getMomentRoundingKey(unit));

	switch (unit)
	{
		case EDateTimeUnit.Century:
			result.year(100 * Math.floor(result.year() / 100));
			break;
		case EDateTimeUnit.Decade:
			result.year(10 * Math.floor(result.year() / 10));
			break;
		case EDateTimeUnit.Year:
		case EDateTimeUnit.Quarter:
		case EDateTimeUnit.Month:
		case EDateTimeUnit.Week:
		case EDateTimeUnit.Day:
		case EDateTimeUnit.Hour:
		case EDateTimeUnit.Minute:
		case EDateTimeUnit.Second:
		case EDateTimeUnit.Millisecond:
			break;
		default:
			throw "Not implemented";
	}

	return result;
}

EDateTimeUnit.floorMoment = function (value, unit, factor)
{
	if (unit == EDateTimeUnit.Millisecond)
	{
		return moment(value).millisecond(factor * Math.floor(moment(value).millisecond() / factor));
	}

	var result = moment(value).startOf(EDateTimeUnit.getMomentRoundingKey(unit));

	switch (unit)
	{
		case EDateTimeUnit.Century:
			result.year(factor * 100 * Math.floor(result.year() / (factor * 100)));
			break;
		case EDateTimeUnit.Decade:
			result.year(factor * 10 * Math.floor(result.year() / (factor * 10)));
			break;
		case EDateTimeUnit.Year:
			result.year(factor * Math.floor(result.year() / factor));
			break;
		case EDateTimeUnit.Quarter:
			result.quarter(factor * Math.floor(result.quarter() / factor));
			break;
		case EDateTimeUnit.Month:
			result.month(factor * Math.floor(result.month() / factor));
			break;
		case EDateTimeUnit.Week:
			result.week(factor * Math.floor(result.week() / factor));
			break;
		case EDateTimeUnit.Day:
			result.day(factor * Math.floor(result.day() / factor));
			break;
		case EDateTimeUnit.Hour:
			result.hour(factor * Math.floor(result.hour() / factor));
			break;
		case EDateTimeUnit.Minute:
			result.minute(factor * Math.floor(result.minute() / factor));
			break;
		case EDateTimeUnit.Second:
			result.second(factor * Math.floor(result.second() / factor));
			break;
		case EDateTimeUnit.Millisecond:
			throw "Invalid operation.";
		default:
			throw "Not implemented.";
	}

	return result;
}

EDateTimeUnit.findLowestHigherRoundingUnit = function (value, unit)
{
	function step(lowerUnit, stepUnit)
	{
		var stepValue = EDateTimeUnit.startOfMoment(value, stepUnit);
		if (stepUnit == EDateTimeUnit.Century)
		{
			if (stepValue.valueOf() == value.valueOf()) return stepUnit;
			return lowerUnit;
		}
		if (stepValue.valueOf() == value.valueOf()) return step(stepUnit, EDateTimeUnit.higherUnit(stepUnit));
		return lowerUnit;
	}
	var higherUnit = EDateTimeUnit.higherUnit(unit);
	if (EDateTimeUnit.startOfMoment(value, higherUnit).valueOf() == value.valueOf()) return step(unit, higherUnit);
	return unit;
}

EDateTimeUnit.isRoundWeek = function (value, unit)
{
	if (unit <= EDateTimeUnit.Week) return false;
	return (EDateTimeUnit.startOfMoment(value, EDateTimeUnit.Week).valueOf() == EDateTimeUnit.startOfMoment(value, unit).valueOf());
}

EDateTimeUnit.higherUnit = function (unit)
{
	switch (unit)
	{
		case EDateTimeUnit.Century:
			return unit;
		case EDateTimeUnit.Decade:
			return EDateTimeUnit.Century;
		case EDateTimeUnit.Year:
			return EDateTimeUnit.Century;
		case EDateTimeUnit.Quarter:
			return EDateTimeUnit.Year;
		case EDateTimeUnit.Month:
			return EDateTimeUnit.Year;
		case EDateTimeUnit.Week:
			return EDateTimeUnit.Year;
		case EDateTimeUnit.Day:
			return EDateTimeUnit.Month;
		case EDateTimeUnit.Hour:
			return EDateTimeUnit.Day;
		case EDateTimeUnit.Minute:
			return EDateTimeUnit.Hour;
		case EDateTimeUnit.Second:
			return EDateTimeUnit.Minute;
		case EDateTimeUnit.Millisecond:
			return EDateTimeUnit.Second;
		default:
			throw "Not implemented.";
	}
}

EDateTimeUnit.lowerUnit = function (unit)
{
	switch (unit)
	{
		case EDateTimeUnit.Century:
			return EDateTimeUnit.Year;
		case EDateTimeUnit.Decade:
			return EDateTimeUnit.Year;
		case EDateTimeUnit.Year:
			return EDateTimeUnit.Month;
		case EDateTimeUnit.Quarter:
			return EDateTimeUnit.Month;
		case EDateTimeUnit.Month:
			return EDateTimeUnit.Day;
		case EDateTimeUnit.Week:
			return EDateTimeUnit.Day;
		case EDateTimeUnit.Day:
			return EDateTimeUnit.Hour;
		case EDateTimeUnit.Hour:
			return EDateTimeUnit.Month;
		case EDateTimeUnit.Minute:
			return EDateTimeUnit.Second;
		case EDateTimeUnit.Second:
			return EDateTimeUnit.Millisecond;
		case EDateTimeUnit.Millisecond:
			return EDateTimeUnit.Millisecond;
		default:
			throw "Not implemented.";
	}
}

EDateTimeUnit.getMaxUnitLengthMs = function (unit)
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
}

EDateTimeUnit.getMinUnitLengthMs = function (unit)
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

////////////////////////////////////////////////////////////////////
//	moment format

EDateTimeUnit.formatCommon = function(left, right)
{
	var leftMoment = moment.utc(left);
	var rightMoment = moment.utc(right);

	var sb = [];

	if (leftMoment.year() != rightMoment.year()) return "";
	sb.push(leftMoment.format("YYYY"));

	if (leftMoment.month() != rightMoment.month()) return sb.join("");
	sb.unshift(" ");
	sb.unshift(leftMoment.format("MMM"));

	if (leftMoment.date() != rightMoment.date()) return sb.join("");
	sb.unshift(".");
	sb.unshift(leftMoment.format("ddd DD"));

	if (leftMoment.hour() != rightMoment.hour()) return sb.join("");
	sb.push(", ");
	sb.push(leftMoment.format("HH"));

	if (leftMoment.minute() != rightMoment.minute()) return sb.join("") + ":00";
	sb.push(":");
	sb.push(leftMoment.format("mm"));

	if (leftMoment.second() != rightMoment.second()) return sb.join("");
	sb.push(":");
	sb.push(leftMoment.format("ss"));

	if (leftMoment.millisecond() != rightMoment.millisecond()) return sb.join("");
	sb.push(".");
	sb.push(leftMoment.format("SSS"));

	return sb.join("");
}

EDateTimeUnit.formatUncommon = function (left, right)
{
	var leftMoment = moment.utc(left);
	var rightMoment = moment.utc(right);

	var sb = [];

	if (leftMoment.year() != rightMoment.year())
	{
		sb.push(leftMoment.format("YYYY"));
		sb.unshift(" ");
	}

	if (leftMoment.month() != rightMoment.month() || sb.length)
	{
		sb.unshift(leftMoment.format("MMM"));
		sb.unshift(".");
	}

	if (leftMoment.date() != rightMoment.date() || sb.length)
	{
		sb.unshift(leftMoment.format("ddd DD"));
		sb.push(", ");
	}

	if (leftMoment.hour() != rightMoment.hour() || sb.length)
	{
		sb.push(leftMoment.format("HH"));
		sb.push(":");
	}

	if (leftMoment.minute() != rightMoment.minute() || sb.length)
	{
		sb.push(leftMoment.format("mm"));
		sb.push(":");
	}

	if (leftMoment.second() != rightMoment.second() || sb.length)
	{
		sb.push(leftMoment.format("ss"));
		sb.push(".");
	}

	if (leftMoment.millisecond() != rightMoment.millisecond() || sb.length)
	{
		sb.push(leftMoment.format("SSS"));
	}

	return sb.join("");
}