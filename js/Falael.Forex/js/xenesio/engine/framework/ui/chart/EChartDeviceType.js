"use strict";

include("StdAfx.js");

window.EChartDeviceType =
{
	WebGl: 1,
	Svg: 2,
	Canvas: 3,

	toTwojsName(value)
	{
		switch (value)
		{
			case this.WebGl: return "webgl";
			case this.Svg: return "svg";
			case this.Canvas: return "canvas";
			default: throw "Not implemented.";
		}
	}
}