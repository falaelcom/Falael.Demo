"use strict";

include("StdAfx.js");

include("framework/panelVisual.plain.css");
include("panelVisual.plain", "framework/panelVisual.plain.xhtml");

class PanelVisual extends Control
{
	constructor(style, instanceCssClass, id)
	{
		super(id, style, "panel", instanceCssClass);

		this._selectedControl = null;
		this._previousSelectedControl = null;
	}


	__render(hostElement)
	{
		return XhtmlTemplate.apply("panelVisual." + this.style, hostElement, null, TemplateEngine.Append);
	}

	__refresh()
	{
	}

	__onEnabledChanged(value)
	{
		throw "Not implemented.";
	}
}