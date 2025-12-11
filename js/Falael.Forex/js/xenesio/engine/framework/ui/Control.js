"use strict";

include("StdAfx.js");

class Control
{
	constructor(id, style, visualCssClass, instanceCssClass, stateCssClass)
	{
		this._id = id || newLUID();
		this._style = style;
		this._parent = null;

		this._controls = new ControlCollection(this._controls_change.bind(this));

		this._tag = null;

		this._visible = true;
		this._enabled = true;
		this._rendered = false;

		this._visualCssClass = visualCssClass || null;
		this._instanceCssClass = instanceCssClass || null;
		this._stateCssClass = stateCssClass || null;

		this._controlStylesDirty = true;
		this._controlCssClassDirty = !!this.cssClassText;	//	set _controlCssClassDirty to false in case no css classes have been set (will prevent className to be set to an empty string - setting className causes an error with svg elements)

		this._suspendRefreshCount = 0;
		this._dirtyElements = {};
		this.setDirty("style");

		this.__elements = null;
	}


	__render(hostElement)
	{
	}

	__refresh()
	{
	}


	__onRendered()
	{
	}

	__onEnabledChanged(value)
	{
	}


	render(hostElement)
	{
		if (!hostElement)
		{
			throw "Argument is null: hostElement.";
		}
		if (this._rendered)
		{
			throw "Already rendered.";
		}

		this.__elements = this.__render(hostElement);
		if (!this.__elements)
		{
			throw "__render must return all rendered elements.";
		}
		if (!this.__elements.backplane)
		{
			throw "__render must return { backplane, ... }.";
		}
		this.__elements.backplane.setAttribute("cid", this.id);
		this.__elements.backplane.control = this;

		if (this._controlCssClassDirty)
		{
			this.__elements.backplane.className = this.cssClassText;
			this._controlCssClassDirty = false;
		}
		if (this._controlStylesDirty)
		{
			this.__applyControlStyles();
			this._controlStylesDirty = false;
		}

		this._rendered = true;
		this.__onRendered();
		this.clearDirty("style");

		return this;
	}

	refresh()
	{
		if (this._suspendRefreshCount)
		{
			return;
		}
		if (!this._rendered)
		{
			throw "Not rendered.";
		}
		this.suspendRefresh();
		try
		{
			if (this.isDirty("style"))
			{
				//	NOTE: this code has never been tested
				//		should completely rerender the control and replace the previous backplane element with the new one in the hostElement's children collection
				var hostElement = this.backplane.parentNode;
				var nextSibling = this.backplane.nextSibling;
				hostElement.removeChild(this.backplane);
				this.__elements = this.__render(hostElement);
				if (!this.__elements)
				{
					throw "__render must return all rendered elements.";
				}
				if (!this.__elements.backplane)
				{
					throw "__render must return { backplane, ... }.";
				}
				this.__elements.backplane.setAttribute("cid", this.id);
				this.__elements.backplane.control = this;

				//	NOTE: only move the newly created backplane if the hostElement has more than one children; it is possible that
				//		this.__render overwrites the innerHTML of the hostElement and nextSibling does is not in the collection at this point
				//		in such case there is not need to reposition the new backplane
				if (this.__elements.backplane.children.length > 1) hostElement.insertBefore(this.__elements.backplane, nextSibling);

				this.__onRendered();
			}
			this.__refresh();
			if (this.isDirty("style")) this.clearDirty("style");
			if (this.isDirty("controls")) this.clearDirty("controls");
		}
		finally
		{
			this.resumeRefresh();
		}

		if (this._controlCssClassDirty)
		{
			this.backplane.className = this.cssClassText;
			this._controlCssClassDirty = false;
		}
		if (this._controlStylesDirty)
		{
			this.__applyControlStyles();
			this._controlStylesDirty = false;
		}

		return this;
	}

	suspendRefresh()
	{
		++this._suspendRefreshCount;
	}

	resumeRefresh()
	{
		if (!this._suspendRefreshCount)
		{
			throw "Invalid operation.";
		}
		--this._suspendRefreshCount;
	}

	setDirty(id)
	{
		this._dirtyElements[id] = true;
	}

	clearDirty(id)
	{
		if (!id)
		{
			this._dirtyElements = {};
			return;
		}
		delete this._dirtyElements[id];
	}

	isDirty(id)
	{
		return !!this._dirtyElements[id];
	}


	__applyControlStyles()
	{
		this.backplane.style.display = this._visible ? "" : "none";
	}

	__buildCssClassText(sb)
	{
	}


	_controls_change(sender, args)
	{
		this.setDirty("controls");
		switch (args.changeType)
		{
			case "add":
				if (args.item.__parent) throw "Invalid control.";
				args.item.__parent = this;
				break;
			case "remove":
				if (args.item.__parent != this) throw "Invalid control.";
				args.item.__parent = null;
				break;
			default:
				throw "Not implemented.";
		}
}


	get id()
	{
		return this._id;
	}

	get style()
	{
		return this._style;
	}

	set style(value)
	{
		if (this._style == value)
		{
			return;
		}
		this._style = value;
		this.setDirty("style");
		this._controlCssClassDirty = true;
		this.refresh();
	}

	get controls()
	{
		return this._controls;
	}

	get tag()
	{
		return this._tag;
	}

	set tag(value)
	{
		this._tag = value;
	}

	get parent()
	{
		return this._parent;
	}

	set __parent(value)
	{
		this._parent = value;
	}

	get backplane()
	{
		if (!this.__elements) return null;
		return this.__elements.backplane;
	}

	get rendered()
	{
		return this._rendered;
	}

	get visible()
	{
		return this._visible;
	}

	set visible(value)
	{
		if (this._visible == value)
		{
			return;
		}
		this._controlStylesDirty = true;
		this._visible = value;
	}

	get enabled()
	{
		return this._enabled;
	}

	set enabled(value)
	{
		if (this._enabled == value)
		{
			return;
		}
		this._controlCssClassDirty = true;
		this._enabled = value;
		this.__onEnabledChanged(value);
	}

	get visualCssClass()
	{
		return this._visualCssClass;
	}

	get instanceCssClass()
	{
		return this._instanceCssClass;
	}

	get stateCssClass()
	{
		return this._stateCssClass;
	}

	set __stateCssClass(value)
	{
		if (this._stateCssClass == value)
		{
			return;
		}
		this._stateCssClass = value;
		this._controlCssClassDirty = true;
	}

	get cssClassText()
	{
		let sb = [];
		if (this._style) sb.push(this._style);
		if (this._visualCssClass) sb.push(this._visualCssClass);
		if (this._instanceCssClass) sb.push(this._instanceCssClass);
		if (this._stateCssClass) sb.push(this._stateCssClass);
		if (!this._enabled) sb.push("xns-disabled");
		this.__buildCssClassText(sb);
		return sb.join(' ');
	}
}

