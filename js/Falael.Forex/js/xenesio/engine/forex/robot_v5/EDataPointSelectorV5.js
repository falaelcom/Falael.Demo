"use strict";

include("StdAfx.js");

Enum(window.EDataPointSelectorV5 =
{
	Ask_All: 1,
	Ask_Extremums: 2,
	Bid_All: 3,
	Bid_Extremums: 4,
	AskBid_All: 5,
	AskBid_Extremums: 6,
	AskBid_SmartExtremums: 7,	//	includes ask peaks and bidd valleys
});