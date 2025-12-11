"use strict";

include("StdAfx.js");

//////////////////////////////////////////////////////
//	GameDateTime

//	timecode: 0 for 0h on 01.01.0000
function GameDateTime(year, month, day, hour, minute, second)
{
	this.year = parseInt(year, 10) || 0;
	this.month = parseInt(month, 10) || 1;
	this.day = parseInt(day, 10) || 1;
	this.hour = parseInt(hour, 10) || 0;
	this.minute = parseInt(minute, 10) || 0;
	this.second = parseInt(second, 10) || 0;

	this.validate();
	this.rebuildTimecode();
}

GameDateTime.fromTimecode = function (timecode)
{
	if (isNaN(timecode))
	{
		throw "Invalid argument type.";
	}

	var result = new GameDateTime();
	result.setTimecode(timecode);
	return result;
}

GameDateTime.parse = function(text)
{
	var result = new GameDateTime();

	var parseResult = {};

	GameTimeSpan._parseInternal(text, "dateTime", parseResult);

	result.year = parseResult.years || 0;
	result.month = parseResult.months || 1;
	result.day = parseResult.days || 1;
	result.hour = parseResult.hours || 0;
	result.minute = parseResult.minutes || 0;
	result.second = parseResult.seconds || 0;

	result.validate();
	result.rebuildTimecode();

	return result;
}

GameDateTime.selfTest = function()
{
	var start = new Date();
	var step = Math.floor(64832489999 / 10000);
	for (var tc = 0, length = 64832489999; tc <= length; ++tc)
	{
		if (tc % step == 0)
		{
			var stepsLeftCount = Math.ceil((length - tc) / step);
			var cur = new Date();
			var stepTimeSpanMs = cur.getTime() - start.getTime();
			var stepTimeSpanHr = Math.ceil(10000 * stepTimeSpanMs / (1000 * 60 * 60)) / 10000;
			var timeLeftTimeSpanHr = stepTimeSpanHr * stepsLeftCount;
			var end = new Date(Date.now() + stepTimeSpanMs * stepsLeftCount);
			console.log(Math.ceil(10000 * tc / 64832489999) / 100 + "%", "time left: " + timeLeftTimeSpanHr + "h", "ends at: " + end);
			start = new Date();
		}
		var gt3 = GameDateTime.fromTimecode(tc);
	}
}


GameDateTime.prototype.toString = function ()
{
	var sb = [];

	sb.push(this.year.toString().padStart(4, '0'));
	sb.push(".");
	sb.push(this.month.toString().padStart(2, '0'));
	sb.push(".");
	sb.push(this.day.toString().padStart(2, '0'));
	sb.push(";");
	sb.push(this.hour.toString().padStart(2, '0'));
	sb.push(":");
	sb.push(this.minute.toString().padStart(2, '0'));
	sb.push(":");
	sb.push(this.second.toString().padStart(2, '0'));

	return sb.join("");
}

GameDateTime.prototype.clone = function ()
{
	return GameDateTime.fromTimecode(this.getTimecode());
}


GameDateTime.prototype.getTimecode = function ()
{
	return this.timecode;
}

GameDateTime.prototype.setTimecode = function (timecode)
{
	var divider = 1;
	var moduler = 1;

	divider *= moduler; moduler = GameDateTime.secondPackCount;
	this.second = Math.floor(timecode / divider) % moduler;

	divider *= moduler; moduler = GameDateTime.minutePackCount;
	this.minute = Math.floor(timecode / divider) % moduler;

	divider *= moduler; moduler = GameDateTime.hourPackCount;
	this.hour = Math.floor(timecode / divider) % moduler;

	divider *= moduler; moduler = GameDateTime.dayPackCount;
	this.day = Math.floor(timecode / divider) % moduler;

	divider *= moduler; moduler = GameDateTime.monthPackCount;
	this.month = Math.floor(timecode / divider) % moduler;

	divider *= moduler; moduler = 1;
	this.year = Math.floor(timecode / divider);

	++this.month;
	++this.day;

	this.timecode = timecode;
	this.validate();
	this.rebuildTimecode();
	if(this.timecode != timecode)
	{
		throw "Assertion failed";
	}
}

GameDateTime.prototype.rebuildTimecode = function ()
{
	var multiplier = 0;

	this.timecode = 0;

	multiplier = 1;
	this.timecode += this.second * multiplier;

	multiplier *= GameDateTime.secondPackCount;
	this.timecode += this.minute * multiplier;

	multiplier *= GameDateTime.minutePackCount;
	this.timecode += this.hour * multiplier;

	multiplier *= GameDateTime.hourPackCount;
	this.timecode += (this.day - 1) * multiplier;

	multiplier *= GameDateTime.dayPackCount;
	this.timecode += (this.month - 1) * multiplier;

	multiplier *= GameDateTime.monthPackCount;
	this.timecode += this.year * multiplier;
}

GameDateTime.prototype.validate = function()
{
    if (!Number.isInteger(this.second)|| this.second < 0 || this.second >= GameDateTime.secondPackCount)
    {
        throw "Invalid number of seconds.";
    }

    if (!Number.isInteger(this.minute) || this.minute < 0 || this.minute >= GameDateTime.minutePackCount)
    {
        throw "Invalid number of minutes.";
    }

    if (!Number.isInteger(this.hour) || this.hour < 0 || this.hour >= GameDateTime.hourPackCount)
    {
        throw "Invalid number of hours.";
    }

    if (!Number.isInteger(this.day) || this.day < 1 || this.day > GameDateTime.dayPackCount)
    {
        throw "Invalid number of days.";
    }

    if (!Number.isInteger(this.month) || this.month < 1 || this.month > GameDateTime.monthPackCount)
    {
        throw "Invalid number of months.";
    }

    if (!Number.isInteger(this.year) || this.year >= GameDateTime.yearPackCount)
    {
        throw "Invalid number of years.";
    }
}


GameDateTime.prototype.getTotalSeconds = function()
{
	var result = 0;
	
	result += this.second;
	result += this.minute * GameDateTime.secondsInMinute;
	result += this.hour * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;
	result += (this.day - 1)* GameDateTime.hoursInDay * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;

	for (var length = this.month - 1, i = 0; i < length; ++i)
	{
		var daysInMonth = GameDateTime.daysInMonths[i];
		result += daysInMonth * GameDateTime.hoursInDay * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;
	}

	result += this.year * GameDateTime.secondsInYear;

	return result;
}

GameDateTime.prototype.getDateOnly = function()
{
	return new GameDateTime(this.getYear(), this.getMonth(), this.getDay());
}

GameDateTime.prototype.getTimeOnly = function()
{
	return new GameDateTime(0, 1, 1, this.getHour(), this.getMinute(), this.getSecond());
}


GameDateTime.prototype.equals = function(gameDateTime)
{
	if (!gameDateTime || !gameDateTime.getTimecode)
	{
		return false;
	}

	return this.getTimecode() == gameDateTime.getTimecode();
}

GameDateTime.prototype.lessThan = function(gameDateTime)
{
	if (!gameDateTime || !gameDateTime.getTimecode)
	{
		return false;
	}

	return this.getTimecode() < gameDateTime.getTimecode();
}

GameDateTime.prototype.lessThanOrEquals = function(gameDateTime)
{
	if (!gameDateTime || !gameDateTime.getTimecode)
	{
		return false;
	}

	return this.getTimecode() <= gameDateTime.getTimecode();
}

GameDateTime.prototype.moreThan = function(gameDateTime)
{
	if (!gameDateTime || !gameDateTime.getTimecode)
	{
		return false;
	}

	return this.getTimecode() > gameDateTime.getTimecode();
}

GameDateTime.prototype.moreThanOrEquals = function(gameDateTime)
{
	if (!gameDateTime || !gameDateTime.getTimecode)
	{
		return false;
	}

	return this.getTimecode() >= gameDateTime.getTimecode();
}


GameDateTime.prototype.getYear = function ()
{
	return this.year;
}

GameDateTime.prototype.setYear = function (value)
{
    this.year = value;
    this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype.getMonth = function ()
{
	return this.month;
}

GameDateTime.prototype.setMonth = function (value)
{
	this.month = value;
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype.getDay = function ()
{
	return this.day;
}

GameDateTime.prototype.setDay = function (value)
{
	this.day = value;
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype.getHour = function ()
{
	return this.hour;
}

GameDateTime.prototype.setHour = function (value)
{
	this.hour = value;
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype.getMinute = function ()
{
	return this.minute;
}

GameDateTime.prototype.setMinute = function (value)
{
	this.minute = value;
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype.getSecond = function ()
{
	return this.second;
}

GameDateTime.prototype.setSecond = function (value)
{
	this.second = value;
	this.validate();
	this.rebuildTimecode();
}


GameDateTime.prototype._addYears = function(value)
{
	this.year += value;
}

GameDateTime.prototype.addYears = function(value)
{
	this._addYears(value);
    this.validate();
    this.rebuildTimecode();
}

GameDateTime.prototype._addMonths = function(value)
{
	this._addYears(Math.floor(value / GameDateTime.monthsInYear));
	this.month += value % GameDateTime.monthsInYear;
	if (this.month - 1 >= GameDateTime.monthsInYear)
	{
		this._addYears(1);
		this.month = ((this.month - 1) % GameDateTime.monthsInYear) + 1;
	}
}

GameDateTime.prototype.addMonths = function(value)
{
	this._addMonths(value);
    this.validate();
    this.rebuildTimecode();
}

GameDateTime.prototype._addDays = function(value)
{
	this._addYears(Math.floor(value / GameDateTime.daysInYear));
	this.day += value % GameDateTime.daysInYear;

	var daysInMonth = GameDateTime.daysInMonths[this.month - 1];
	if (this.day - 1 < daysInMonth)
	{
		return;
	}

	var daysLeft = this.day - 1;
	do
	{
		daysLeft -= daysInMonth;
		this._addMonths(1);
		daysInMonth = GameDateTime.daysInMonths[this.month - 1];
	}
	while (daysLeft >= daysInMonth);

	this.day = daysLeft + 1;
}

GameDateTime.prototype.addDays = function(value)
{
	this._addDays(value);
	this.validate();
    this.rebuildTimecode();
}

GameDateTime.prototype._addHours = function(value)
{
	this._addDays(Math.floor(value / GameDateTime.hoursInDay));
	this.hour += value % GameDateTime.hoursInDay;
	if (this.hour >= GameDateTime.hoursInDay)
	{
		this._addDays(1);
		this.hour = this.hour % GameDateTime.hoursInDay;
	}
}

GameDateTime.prototype.addHours = function(value)
{
	this._addHours(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._addMinutes = function(value)
{
	this._addHours(Math.floor(value / GameDateTime.minutesInHour));
	this.minute += value % GameDateTime.minutesInHour;
	if (this.minute >= GameDateTime.minutesInHour)
	{
		this._addHours(1);
		this.minute = this.minute % GameDateTime.minutesInHour;
	}
}

GameDateTime.prototype.addMinutes = function(value)
{
	this._addMinutes(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._addSeconds = function(value)
{
	this._addMinutes(Math.floor(value / GameDateTime.secondsInMinute));
	this.second += value % GameDateTime.secondsInMinute;
	if (this.second >= GameDateTime.secondsInMinute)
	{
		this._addMinutes(1);
		this.second = this.second % GameDateTime.secondsInMinute;
	}
}

GameDateTime.prototype.addSeconds = function(value)
{
	this._addMinutes(value);
	this.validate();
	this.rebuildTimecode();
}


GameDateTime.prototype._subtractYears = function(value)
{
	this.year -= value;
}

GameDateTime.prototype.subtractYears = function(value)
{
	this._subtractYears(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._subtractMonths = function(value)
{
	this._subtractYears(Math.floor(value / GameDateTime.monthsInYear));
	this.month -= value % GameDateTime.monthsInYear;
	if (this.month - 1 < 0)
	{
		this._subtractYears(1);
		this.month = GameDateTime.monthsInYear + (this.month % GameDateTime.monthsInYear);
	}
}

GameDateTime.prototype.subtractMonths = function(value)
{
	this._subtractMonths(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._subtractDays = function(value)
{
	this._subtractYears(Math.floor(value / GameDateTime.daysInYear));
	this.day -= value % GameDateTime.daysInYear;
	if (this.day - 1 >= 0)
	{
		return;
	}

	this._subtractMonths(1);
	var daysLeft = Math.abs(this.day);
	var daysInMonth = GameDateTime.daysInMonths[this.month - 1];
	while (daysLeft >= daysInMonth)
	{
		daysLeft -= daysInMonth;
		this._subtractMonths(1);
		daysInMonth = GameDateTime.daysInMonths[this.month - 1];
	}

	this.day = daysInMonth - daysLeft;
}

GameDateTime.prototype.subtractDays = function(value)
{
	this._subtractDays(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._subtractHours = function(value)
{
	this._subtractDays(Math.floor(value / GameDateTime.hoursInDay));
	this.hour -= value % GameDateTime.hoursInDay;
	if (this.hour < 0)
	{
		this._subtractDays(1);
		this.hour = GameDateTime.hoursInDay + (this.hour % GameDateTime.hoursInDay);
	}
}

GameDateTime.prototype.subtractHours = function(value)
{
	this._subtractHours(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._subtractMinutes = function(value)
{
	this._subtractHours(Math.floor(value / GameDateTime.minutesInHour));
	this.minute -= value % GameDateTime.minutesInHour;
	if (this.minute < 0)
	{
		this._subtractHours(1);
		this.minute = GameDateTime.minutesInHour + (this.minute % GameDateTime.minutesInHour);
	}
}

GameDateTime.prototype.subtractMinutes = function(value)
{
	this._subtractMinutes(value);
	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype._subtractSeconds = function(value)
{
	this._subtractMinutes(Math.floor(value / GameDateTime.secondsInMinute));
	this.second -= value % GameDateTime.secondsInMinute;
	if (this.second < 0)
	{
		this._subtractMinutes(1);
		this.second = GameDateTime.secondsInMinute + (this.second % GameDateTime.secondsInMinute);
	}
}

GameDateTime.prototype.subtractSeconds = function(value)
{
	this._subtractMinutes(value);
	this.validate();
	this.rebuildTimecode();
}


GameDateTime.prototype.addTimeSpan = function(gameTimeSpan)
{
	this._addYears(gameTimeSpan.years);
	this._addMonths(gameTimeSpan.months);
	this._addDays(gameTimeSpan.days);
	this._addHours(gameTimeSpan.hours);
	this._addMinutes(gameTimeSpan.minutes);
	this._addSeconds(gameTimeSpan.seconds);

	this.validate();
	this.rebuildTimecode();
}

GameDateTime.prototype.subtractTimeSpan = function(gameTimeSpan)
{
	this._subtractYears(gameTimeSpan.years);
	this._subtractMonths(gameTimeSpan.months);
	this._subtractDays(gameTimeSpan.days);
	this._subtractHours(gameTimeSpan.hours);
	this._subtractMinutes(gameTimeSpan.minutes);
	this._subtractSeconds(gameTimeSpan.seconds);

	this.validate();
	this.rebuildTimecode();
}

//	returns GameTimeSpan, represented in days, hours, minutes and seconds
//	this function never sets the years and months properties
GameDateTime.prototype.subtractDateTime = function(gameDateTime)
{
	var leftTotalSeconds = this.getTotalSeconds();
	var rightTotalSeconds = gameDateTime.getTotalSeconds();

	var diffTotalSeconds = leftTotalSeconds - rightTotalSeconds;

	return GameTimeSpan.fromTotalSeconds(diffTotalSeconds);
}


//	constants
GameDateTime.daysInWeek = 7;		// 1 - 7
GameDateTime.daysInMonths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 29];
GameDateTime.monthsInSeasons = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];
GameDateTime.hoursInDay = 25;		// 0 - 24
GameDateTime.minutesInHour = 60;		// 0 - 59
GameDateTime.secondsInMinute = 60;	// 0 - 59

GameDateTime.seasonNames =
[
	"Spring",
	"Summer",
	"Autumn",
	"Winter",
];

GameDateTime.monthNames =
[
	"Nysan",		// early spring
	"Iyaar",		// spring
	"Zirnyr",	// late spring
	"Tammaz",	// early summer
	"Abat",		// summer
	"Illou",		// late summer
	"Tishnir",	// early autumn
	"Tizran",	// autumn
	"Cheslir",	// late autumn
	"Teblin",	// early winter
	"Seber",		// winter
	"Aydar",		// late winter
];

GameDateTime.dayOfWeekNames =
[
	"Lunis",		//	Monday
	"Martis",	//	Tuesday
	"Mercuria",	//	Wednsday
	"Iovis",		//	Thursday
	"Veneris",	//	Friday
	"Saturnia",	//	Saturday
	"Solis",		//	Sunday
];

GameDateTime.daysInYear = GameDateTime.daysInMonths.reduce(function(a, b) { return a + b }, 0);	//	0 - ?  (calculated)
GameDateTime.monthsInYear = GameDateTime.daysInMonths.length;								//	1 - 12 (calculated)
GameDateTime.seasonsInYear = GameDateTime.monthsInSeasons.length;							//	1 - 4  (calculated)
GameDateTime.hoursInYear = GameDateTime.daysInYear * GameDateTime.hoursInDay;
GameDateTime.minutesInYear = GameDateTime.hoursInYear * GameDateTime.minutesInHour;
GameDateTime.secondsInYear = GameDateTime.minutesInYear * GameDateTime.secondsInMinute;

GameDateTime.secondsInDay = GameDateTime.hoursInDay * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;
GameDateTime.secondsInHour = GameDateTime.minutesInHour * GameDateTime.secondsInMinute;

GameDateTime.yearPackCount = 10000;
GameDateTime.monthPackCount = 12;
GameDateTime.dayPackCount = 31;
GameDateTime.hourPackCount = 25;
GameDateTime.minutePackCount = 60;
GameDateTime.secondPackCount = 60;


//////////////////////////////////////////////////////
//	GameTimeSpan

function GameTimeSpan(years, months, days, hours, minutes, seconds)
{
	this.years = parseInt(years) || 0;
	this.months = parseInt(months) || 0;
	this.days = parseInt(days) || 0;
	this.hours = parseInt(hours) || 0;
	this.minutes = parseInt(minutes) || 0;
	this.seconds = parseInt(seconds) || 0;

	this.rebuildTimesig();
}

GameTimeSpan.fromTimesig = function (timesig)
{
	var result = new GameTimeSpan();
	result.setTimesig(timesig);
	return result;
}

GameTimeSpan.fromTotalSeconds = function (value)
{
	var result = new GameTimeSpan();

	var rest;

	result.days = Math.floor(value / GameDateTime.secondsInDay);
	rest = value % GameDateTime.secondsInDay;

	result.hours = Math.floor(rest / GameDateTime.secondsInHour);
	rest = value % GameDateTime.secondsInHour;

	result.minutes = Math.floor(rest / GameDateTime.secondsInMinute);

	result.seconds = rest % GameDateTime.secondsInMinute;

	result.rebuildTimesig();
	return result;
}

GameTimeSpan.parse = function (text)
{
	var result = new GameTimeSpan();

	GameTimeSpan._parseInternal(text, "timeSpan", result);

	result.rebuildTimesig();
	return result;
}

GameTimeSpan.sum = function ()
{
	var result = new GameTimeSpan();
	for (var i = 0, length = arguments.length; i < arguments.length; ++i)
	{
		var item = arguments[i];
		if (!item)
		{
			continue;
		}
		if (item.getTimesig)
		{
			result.add(item);
			continue;
		}
		result.add(GameTimeSpan.fromTimesig(item));
	}
	return result;
}

GameTimeSpan.min = function (leftGameTimeSpan, rightGameTimeSpan)
{
	if (!leftGameTimeSpan)
	{
		throw "Argument is null: leftGameTimeSpan";
	}
	if (!rightGameTimeSpan)
	{
		throw "Argument is null: rightGameTimeSpan";
	}

	if(leftGameTimeSpan.lessThan(rightGameTimeSpan))
	{
		return leftGameTimeSpan;
	}
	return rightGameTimeSpan;
}


GameTimeSpan.prototype.toString = function ()
{
	return this.getNormalizedTimeSpan()._toStringInternal();
}

GameTimeSpan.prototype.clone = function ()
{
	return GameTimeSpan.fromTotalSeconds(this.getTotalSeconds());
}


//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.getNormalizedTimeSpan = function (monthOrigin)
{
	var totalSeconds = this.getTotalSeconds(monthOrigin);
	return GameTimeSpan.fromTotalSeconds(totalSeconds);
}

GameTimeSpan.prototype.getTimesig = function ()
{
	return this.timesig;
}

GameTimeSpan.prototype.setTimesig = function (timesig)
{
	GameTimeSpan._parseInternal(timesig, "timeSpan", this);
	this.timesig = timesig;

	this.rebuildTimesig();
	if (this.timesig != timesig)
	{
		throw "Assertion failed";
	}
}

GameTimeSpan.prototype.rebuildTimesig = function ()
{
	this.timesig = this._toStringInternal();
}

//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.getTotalSeconds = function (monthOrigin)
{
	if (monthOrigin < 1 || monthOrigin > GameDateTime.monthsInYear)
	{
		throw "Invalid argument: monthOrigin.";
	}

	monthOrigin = monthOrigin || 1;
	--monthOrigin;

	var result = 0;

	result += this.seconds;
	result += this.minutes * GameDateTime.secondsInMinute;
	result += this.hours * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;
	result += this.days * GameDateTime.hoursInDay * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;

	for (var length = this.months, i = 0; i < length; ++i)
	{
		var monthOffset = (monthOrigin + i) % GameDateTime.monthsInYear;
		var daysInMonth = GameDateTime.daysInMonths[monthOffset];
		result += daysInMonth * GameDateTime.hoursInDay * GameDateTime.minutesInHour * GameDateTime.secondsInMinute;
	}

	result += this.years * GameDateTime.secondsInYear;

	return result;
}


//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.equals = function (gameTimeSpan, monthOrigin)
{
	if (!gameTimeSpan || !gameTimeSpan.getTotalSeconds)
	{
		return false;
	}

	return this.getTotalSeconds(monthOrigin) == gameTimeSpan.getTotalSeconds(monthOrigin);
}

//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.lessThan = function (gameTimeSpan, monthOrigin)
{
	if (!gameTimeSpan || !gameTimeSpan.getTotalSeconds)
	{
		return false;
	}

	return this.getTotalSeconds(monthOrigin) < gameTimeSpan.getTotalSeconds(monthOrigin);
}

//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.lessThanOrEquals = function (gameTimeSpan, monthOrigin)
{
	if (!gameTimeSpan || !gameTimeSpan.getTotalSeconds)
	{
		return false;
	}

	return this.getTotalSeconds(monthOrigin) <= gameTimeSpan.getTotalSeconds(monthOrigin);
}

//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.moreThan = function (gameTimeSpan, monthOrigin)
{
	if (!gameTimeSpan || !gameTimeSpan.getTotalSeconds)
	{
		return false;
	}

	return this.getTotalSeconds(monthOrigin) > gameTimeSpan.getTotalSeconds(monthOrigin);
}

//	monthOrigin - optional, defaults to 1
GameTimeSpan.prototype.moreThanOrEquals = function (gameTimeSpan, monthOrigin)
{
	if (!gameTimeSpan || !gameTimeSpan.getTotalSeconds)
	{
		return false;
	}

	return this.getTotalSeconds(monthOrigin) >= gameTimeSpan.getTotalSeconds(monthOrigin);
}

GameTimeSpan.prototype.isWithinRange = function (rangeBegin_timespan, rangeBegin_isInclusive, rangeEnd_timespan, rangeEnd_isInclusive)
{
	var isRightOfRangeBegin = false;
	var isLeftOfRangeEnd = false;

	if (rangeBegin_isInclusive)
	{
		isRightOfRangeBegin = this.moreThanOrEquals(rangeBegin_timespan);
	}
	else
	{
		isRightOfRangeBegin = this.moreThan(rangeBegin_timespan);
	}

	if (rangeEnd_isInclusive)
	{
		isLeftOfRangeEnd = this.lessThanOrEquals(rangeEnd_timespan);
	}
	else
	{
		isLeftOfRangeEnd = this.lessThan(rangeEnd_timespan);
	}

	return isRightOfRangeBegin && isLeftOfRangeEnd;
}


GameTimeSpan.prototype.getYears = function ()
{
	return this.years;
}

GameTimeSpan.prototype.setYears = function (value)
{
	this.years = value;
	this.rebuildTimesig();
}

GameTimeSpan.prototype.getMonths = function ()
{
	return this.months;
}

GameTimeSpan.prototype.setMonths = function (value)
{
	this.months = value;
	this.rebuildTimesig();
}

GameTimeSpan.prototype.getDays = function ()
{
	return this.days;
}

GameTimeSpan.prototype.setDays = function (value)
{
	this.days = value;
	this.rebuildTimesig();
}

GameTimeSpan.prototype.getHours = function ()
{
	return this.hours;
}

GameTimeSpan.prototype.setHours = function (value)
{
	this.hours = value;
	this.rebuildTimesig();
}

GameTimeSpan.prototype.getMinutes = function ()
{
	return this.minutes;
}

GameTimeSpan.prototype.setMinutes = function (value)
{
	this.minutes = value;
	this.rebuildTimesig();
}

GameTimeSpan.prototype.getSeconds = function ()
{
	return this.seconds;
}

GameTimeSpan.prototype.setSeconds = function (value)
{
	this.seconds = value;
	this.rebuildTimesig();
}

GameTimeSpan.prototype.getNegative = function ()
{
	return new GameTimeSpan(
		-this.years,
		-this.months,
		-this.days,
		-this.hours,
		-this.minutes,
		-this.seconds
	);
}


GameTimeSpan.prototype.add = function (gameTimeSpan)
{
	this.years += gameTimeSpan.years;
	this.months += gameTimeSpan.months;
	this.days += gameTimeSpan.days;
	this.hours += gameTimeSpan.hours;
	this.minutes += gameTimeSpan.minutes;
	this.seconds += gameTimeSpan.seconds;

	this.rebuildTimesig();
}

GameTimeSpan.prototype.subtract = function (gameTimeSpan)
{
	this.years -= gameTimeSpan.years;
	this.months -= gameTimeSpan.months;
	this.days -= gameTimeSpan.days;
	this.hours -= gameTimeSpan.hours;
	this.minutes -= gameTimeSpan.minutes;
	this.seconds -= gameTimeSpan.seconds;

	this.rebuildTimesig();
}


//	mode = "dateTime" | "timeSpan"
GameTimeSpan._parseInternal = function (text, mode, result)
{
	if (!text)
	{
		throw "Invalid argument: text.";
	}
	if (!result)
	{
		throw "Invalid argument: result.";
	}

	var dateString = null;
	var timeString = null;

	var parts_1 = text.split(';');
	if (parts_1.length == 1)
	{
		var part = parts_1[0];
		if (part.indexOf(':') != -1)
		{
			timeString = part;
		}
		else
		{
			dateString = part;
		}
	}
	else if (parts_1.length == 2)
	{
		dateString = parts_1[0];
		timeString = parts_1[1];
	}

	var parts_2 = null;
	if (dateString)
	{
		parts_2 = dateString.split('.');
		if (parts_2.length > 3)
		{
			throw "Invalid date format: " + dateString;
		}
		switch (mode)
		{
			case "dateTime":
				for (var length = parts_2.length, i = 0; i < length; ++i)
				{
					var item = parts_2[i];
					switch (i)
					{
						case 0:
							result.years = parseInt(item, 10) || 0;
							break;
						case 1:
							result.months = parseInt(item, 10) || 1;
							break;
						case 2:
							result.days = parseInt(item, 10) || 1;
							break;
					}
				}
				break;
			case "timeSpan":
				for (var length = parts_2.length, i = length - 1; i >= 0; --i)
				{
					var item = parts_2[i];
					switch (i)
					{
						case length - 3:
							result.years = parseInt(item, 10) || 0;
							break;
						case length - 2:
							result.months = parseInt(item, 10) || 1;
							break;
						case length - 1:
							result.days = parseInt(item, 10) || 1;
							break;
					}
				}
				break;
			default:
				throw "Not implemented.";
		}
	}
	if (timeString)
	{
		switch (mode)
		{
			case "dateTime":
				if (parts_2 && parts_2.length != 3)
				{
					throw "Invalid date/time format: " + text;
				}
				break;
			case "timeSpan":
				break;
			default:
				throw "Not implemented.";
		}
		var parts_3 = timeString.split(':');
		if (parts_3.length > 3)
		{
			throw "Invalid time format: " + dateString;
		}
		switch (mode)
		{
			case "dateTime":
				for (var length = parts_3.length, i = 0; i < length; ++i)
				{
					var item = parts_3[i];
					switch (i)
					{
						case 0:
							result.hours = parseInt(item, 10) || 0;
							break;
						case 1:
							result.minutes = parseInt(item, 10) || 0;
							break;
						case 2:
							result.seconds = parseInt(item, 10) || 0;
							break;
					}
				}
				break;
			case "timeSpan":
				for (var length = parts_3.length, i = length - 1; i >= 0; --i)
				{
					var item = parts_3[i];
					switch (i)
					{
						case length - 3:
							result.hours = parseInt(item, 10) || 0;
							break;
						case length - 2:
							result.minutes = parseInt(item, 10) || 0;
							break;
						case length - 1:
							result.seconds = parseInt(item, 10) || 0;
							break;
					}
				}
				break;
			default:
				throw "Not implemented.";
		}
	}
}

GameTimeSpan.prototype._toStringInternal = function ()
{
	var sb = [];

	if (this.years)
	{
		sb.push(this.years.toString().padStart(4, '0'));
		sb.push(".");
	}
	if (this.years || this.months)
	{
		sb.push(this.months.toString().padStart(2, '0'));
		sb.push(".");
	}
	if (this.years || this.months || this.days)
	{
		sb.push(this.days.toString().padStart(2, '0'));
		sb.push(";");
	}
	if (this.years || this.months || this.days || this.hours)
	{
		sb.push(this.hours.toString().padStart(2, '0'));
		sb.push(":");
	}
	sb.push(this.minutes.toString().padStart(2, '0'));
	sb.push(":");
	sb.push(this.seconds.toString().padStart(2, '0'));

	return sb.join("");
}


GameTimeSpan.zero = new GameTimeSpan();
GameTimeSpan.maxValue = GameTimeSpan.fromTotalSeconds(Number.MAX_SAFE_INTEGER);
