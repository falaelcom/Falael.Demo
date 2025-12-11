"use strict";

include("StdAfx.js");

window.EChartVAlign =
{
	Top: 4,
	Middle: 5,
	Bottom: 6,

	parse: function (text)
	{
		switch (text)
		{
			case "top": return this.Top;
			case "middle": return this.Middle;
			case "bottom": return this.Bottom;
			default: throw "Not implemented.";
		}
	},
}