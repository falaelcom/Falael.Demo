"use strict";

include("StdAfx.js");

class ChartOverlay extends ChartElement
{
	constructor(id, parentPath, parentNode)
	{
		super(id, 10000, parentPath, parentNode);

		//	axis range indicator (rect)

		this._indicators = new Collection(this._indicators_change.bind(this));
	}

	__performLayout()
	{
		for (var length = this._indicators.length, i = 0; i < length; ++i)
		{
			var item = this._indicators[i];
			item.performLayout(this.boundingRect);
		}
	}

	__buildRenderPlan(renderPlan)
	{
		for (var length = this._indicators.length, i = 0; i < length; ++i)
		{
			var item = this._indicators[i];
			item.buildRenderPlan(renderPlan);
		}
	}

	__enumerateChildren()
	{
		return [].concat(this.indicators.toArray());
	}

	_indicators_change(sender, args)
	{
		switch (args.changeType)
		{
			case "add":
				if (args.item.parentNode)
				{
					throw "Invalid operation.";
				}
				args.item.__parentNode = this;
				args.item.__parentPath = "indicator." + args.item.elementType + '.' + args.item.id;
				break;
			case "remove":
				if (!args.item.parentNode)
				{
					throw "Invalid operation.";
				}
				args.item.__parentNode = null;
				args.item.__parentPath = null;
				break;
			default:
				throw new "Not implemented.";
		}
	}

	get indicators()
	{
		return this._indicators;
	}
}
