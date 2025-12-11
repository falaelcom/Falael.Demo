"use strict";

include("StdAfx.js");

class ChartElement extends ChartNode
{
	constructor(id, zIndex, parentPath, parentNode, visible, elementType)
	{
		super(id, parentPath, parentNode);

		this._zIndex = zIndex;

		this._boundingRect = { x: 0, y: 0, width: -1, height: -1};
		this._hitTestInfo = null;
		this._visible = (visible == void (0) ? true : visible);
		this._elementType = elementType;
	}


	performLayout(boundingRect)
	{
		if (!this._visible)
		{
			return;
		}

		this.x = boundingRect.x;
		this.y = boundingRect.y;
		this.width = boundingRect.width;
		this.height = boundingRect.height;

		this.__performLayout();
	}

	__performLayout()
	{
	}

	buildRenderPlan(renderPlan)
	{
		if (!this._visible)
		{
			return;
		}

		renderPlan.visited[this.path] = true;
		this.__buildRenderPlan(renderPlan);
		this.__validateAllAspects();
	}

	__buildRenderPlan(renderPlan)
	{
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
		this._visible = value;
		this.__invalidateAspect("boundingRect");
	}

	get elementType()
	{
		return this._elementType;
	}

	get zIndex()
	{
		return this._zIndex;
	}

	get boundingRect()
	{
		return this._boundingRect;
	}

	set x(value)
	{
		if (this._boundingRect.x == value)
		{
			return;
		}
		this._boundingRect.x = value;
		this.__invalidateAspect("boundingRect");
		this.onChange({ aspect: "boundingRect" });
	}

	set y(value)
	{
		if (this._boundingRect.y == value)
		{
			return;
		}
		this._boundingRect.y = value;
		this.__invalidateAspect("boundingRect");
		this.onChange({ aspect: "boundingRect" });
	}

	set width(value)
	{
		if (this._boundingRect.width == value)
		{
			return;
		}
		this._boundingRect.width = value;
		this.__invalidateAspect("boundingRect");
		this.onChange({ aspect: "boundingRect" });
	}

	set height(value)
	{
		if (this._boundingRect.height == value)
		{
			return;
		}
		this._boundingRect.height = value;
		this.__invalidateAspect("boundingRect");
		this.onChange({ aspect: "boundingRect" });
	}

	get hitTestInfo()
	{
		return this._hitTestInfo;
	}

	set __hitTestInfo(value)
	{
		this._hitTestInfo = value;
	}

}
