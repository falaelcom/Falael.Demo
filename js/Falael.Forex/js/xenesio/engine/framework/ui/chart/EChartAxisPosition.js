"use strict";

include("StdAfx.js");

window.EChartAxisPosition =
{
	Top: 1,
	Right: 2,
	Bottom: 3,
	Left: 4,

	parse: function (text)
	{
		switch (text)
		{
			case "top": return this.Top;
			case "right": return this.Right;
			case "bottom": return this.Bottom;
			case "left": return this.Left;
			default: throw "Not implemented.";
		}
	},
}