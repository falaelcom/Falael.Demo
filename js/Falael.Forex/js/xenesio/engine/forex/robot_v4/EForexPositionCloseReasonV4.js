"use strict";

include("StdAfx.js");

Enum(window.EForexPositionCloseReasonV4 =
{
	None: 1,

	TrendingDirectionChanged: 2,
	TrendLineAngleTooLow: 3,
	ChannelSafeguard: 4,
	GracePeriodExpired: 5,
	MaximumTimeElapsed: 6,
	GoalReached: 7,

	Shutdown: 999,
});