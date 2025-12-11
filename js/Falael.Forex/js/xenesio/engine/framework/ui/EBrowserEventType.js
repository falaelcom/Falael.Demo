"use strict";

include("StdAfx.js");

//	flags
Enum(window.EBrowserEventType =
{
	MouseDown: 1,
	MouseUp: 2 << 0,
	MouseMove: 2 << 1,
	MouseOver: 2 << 2,
	MouseOut: 2 << 3,
	MouseEnter: 2 << 4,
	MouseLeave: 2 << 5,
	Wheel: 2 << 6,

	Click: 2 << 7,
	DblClick: 2 << 8,
	ContextMenu: 2 << 9,

	TouchStart: 2 << 10,		//	Triggers when the user makes contact with the touch surface and creates a touch point inside the element the event is bound to.
	TouchMove: 2 << 11,			//	Triggers when the user moves the touch point across the touch surface.
	TouchEnd: 2 << 12,			//	Triggers when the user removes a touch point from the surface. It fires regardless of whether the touch point is removed while inside the bound-to element, or outside, such as if the user's finger slides out of the element first or even off the edge of the screen.
	TouchCancel: 2 << 13,		//	Triggers when the touch point no longer registers on the touch surface. This can occur if the user has moved the touch point outside the browser UI or into a plugin, for example, or if an alert modal pops up.

	KeyDown: 2 << 14,
	KeyUp: 2 << 15,

	hasFlag: function (value, flag)
	{
		return !!(value & flag);
	},

	toFlagArray: function(value)
	{
		var result = [];
		for (var key in this)
		{
			var flag = this[key];
			if (this.hasFlag(value, flag))
			{
				result.push(flag);
			}
		}
		result.sort();
		return result;
	},

	getFlagName: function(flag)
	{
		return window.EBrowserEventType.reverseMap[flag];
	}
});
