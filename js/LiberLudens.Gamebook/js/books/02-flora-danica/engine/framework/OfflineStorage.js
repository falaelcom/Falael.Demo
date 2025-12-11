"use strict";

function OfflineStorage()
{
	if (typeof(Storage) !== "undefined")
	{
		this.set = function(name, value)
		{
			localStorage.setItem(name, value);
		};
		this.get = function(name, defaultValue)
		{
		    return localStorage.getItem(name) || defaultValue;
		};
		this.remove = function(name, defaultValue)
		{
			return localStorage.removeItem(name);
		};

		this.uuid = this.get("uuid");
		if (!this.uuid)
		{
			this.uuid = newUUID();
			this.set("uuid", this.uuid);
		}
	}
	else
	{
		throw "Offline storage is not supported.";
	}
}