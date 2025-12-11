"use strict";

include("StdAfx.js");

window.EForexPositionType =
{
	Long: 1,
	Short: 2,

	parse: function (text)
	{
		switch (text)
		{
			case "long": return this.Long;
			case "short": return this.Short;
			default: throw "Not implemented.";
		}
	},
}