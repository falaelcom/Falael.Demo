"use strict";

include("StdAfx.js");

include("framework/labelVisual.plain.css");
include("labelVisual.plain", "framework/labelVisual.plain.xhtml");

class LabelVisual extends Control
{
	constructor(style, instanceCssClass, id)
	{
		super(id, style, "label", instanceCssClass);

		this._text = "";
	}

	__render(hostElement)
	{
		return XhtmlTemplate.apply("labelVisual." + this.style, hostElement, null, TemplateEngine.Append);
	}

	__refresh()
	{
		if (this.isDirty("text"))
		{
			this.__elements.text.innerHTML = this._text;
		}
	}

	get text()
	{
		return this._text;
	}

	set text(value)
	{
		if (this._text == value)
		{
			return;
		}
		this._text = value;
		this.setDirty("text");
		this.refresh();
	}
}
