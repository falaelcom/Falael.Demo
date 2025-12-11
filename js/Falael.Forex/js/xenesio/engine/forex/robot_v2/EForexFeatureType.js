"use strict";

include("StdAfx.js");

Enum(window.EForexFeatureType =
{
	RawData: 1,

	Ask_Close_Peak: 20001,
	Ask_Close_Valley: 20002,
	Ask_Close_UpwardResistanceLine: 20101,
	Ask_Close_UpwardSupportLine: 20102,
	Ask_Close_DownwardResistanceLine: 20103,
	Ask_Close_DownwardSupportLine: 20104,

	Bid_Close_Peak: 30001,
	Bid_Close_Valley: 30002,
	Bid_Close_UpwardResistanceLine: 30101,
	Bid_Close_UpwardSupportLine: 30102,
	Bid_Close_DownwardResistanceLine: 30103,
	Bid_Close_DownwardSupportLine: 30104,

	Close_UpwardChannel: 40001,
	Close_DownwardChannel: 40002,

	Buy_OpenTrade_Decision: 90001,
	Buy_CloseTrade_Decision: 90002,
	Sell_OpenTrade_Decision: 90003,
	Sell_CloseTrade_Decision: 90004,
});