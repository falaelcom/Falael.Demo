"use strict";

include("StdAfx.js");

window.EChartHAlign =
{
	Left: 1,
	Center: 2,
	Right: 3,

	parse: function (text)
	{
		switch (text)
		{
			case "left": return this.Left;
			case "center": return this.Center;
			case "right": return this.Right;
			default: throw "Not implemented.";
		}
	},
}