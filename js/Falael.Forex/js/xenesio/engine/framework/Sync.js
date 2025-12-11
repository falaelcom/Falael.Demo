"use strict";

include("StdAfx.js");

class Sync
{
	constructor(id)
	{
		this._id = id || newLUID();

		this._blocking = false;
		this._queue = [];
	}

	async execute(action, actionPar)
	{
		return new Promise(async function Sync_execute_promise(resolve, reject)
		{
			this._queue.push(
			{
				action: action,
				actionPar: actionPar,
				resolve: resolve,
				reject: reject,
			});

			if (this._blocking) return;

			this._blocking = true;
			try
			{
				while (this._queue.length)
				{
					var item = this._queue.shift();
					try
					{
						item.resolve(await item.action(item.actionPar));
					}
					catch (ex)
					{
						item.reject(ex);
					}
				}
			}
			finally
			{
				this._blocking = false;
			}
		}.bind(this));
	}

	get id()
	{
		return this._id;
	}
}
