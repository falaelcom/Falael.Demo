"use strict";

include("StdAfx.js");

class ChartPersistentStorage
{
	constructor(id, chartControl)
	{
		if (!id)
		{
			throw "Argument null exception: id.";
		}
		this._id = id;

		this._offlineStorage = new OfflineStorage();

		this._elements = new Collection();
		this._elements.change.add(this._elements_change.bind(this));
		this._multicastDelegateIds = new WeakMap();

		this._load({ control: chartControl });
	}

	apply(chartControl)
	{
		for (var length = this._elements.length, i = 0; i < length; ++i)
		{
			var item = this._elements[i];
			switch (item.constructor.name)
			{
				case "ChartRange2DIndicator":
					chartControl.scene.indicators.add(item);
					ChartStyleSheet.defaultSceneStyle.applyToRange2d(item);
					break;
				default:
					throw "Not implemented.";
			}
		}
	}

	clear()
	{
		this._offlineStorage.set("ChartPersistentStorage_" + this._id, null);
	}

	get elements()
	{
		return this._elements;
	}

	_elements_change(sender, args)
	{
		switch (args.changeType)
		{
			case "add":
				this._multicastDelegateIds.set(args.item, args.item.change.add(this._element_change.bind(this)));
				this._save();
				break;
			case "remove":
				args.item.change.remove(this._multicastDelegateIds.get(args.item.id));
				this._save();
				break;
			default:
				throw new "Not implemented.";
		}
	}

	_element_change(sender, args)
	{
		this._save();
	}

	_save()
	{
		var json = [];
		for (var length = this._elements.length, i = 0; i < length; ++i)
		{
			json.push(this._elements[i].toJson());
		}
		var jsonText = JSON.stringify(json);
		this._offlineStorage.set("ChartPersistentStorage_" + this._id, jsonText);
	}

	_load(context)
	{
		var jsonText = this._offlineStorage.get("ChartPersistentStorage_" + this._id);
		if (!jsonText) return;
		var json = JSON.parse(jsonText);
		if (!json) return;
		for (var length = json.length, i = 0; i < length; ++i)
		{
			var elementDef = json[i];
			switch (elementDef.type)
			{
				case "ChartRange2DIndicator":
					var element = ChartRange2DIndicator.fromJson(context, elementDef);
					if (element) this._elements.add(element);
					break;
				default:
					throw "Not implemented.";
			}
		}
	}
}
