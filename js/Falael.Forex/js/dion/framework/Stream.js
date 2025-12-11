"use strict";

const ArgumentNullException = require("@framework/ArgumentNullException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const InvalidOperationException = require("@framework/InvalidOperationException.js");

module.exports =

class Stream
{
    constructor(nodejsStream)
    {
		if (!nodejsStream)
		{
			throw new ArgumentNullException("nodejsStream");
		}

		this._dataCallback = null;
		this._eosCallback = null;
		this._errorCallback = null;
		this._nodejsStream = nodejsStream;
    }

	listen(dataCallback, eosCallback, errorCallback)
	{
		this._dataCallback = dataCallback;
		this._eosCallback = eosCallback;
		this._errorCallback = errorCallback;

		var stream = this;
		this._nodejsStream.on("data", chunk =>
		{
			stream.__onData(chunk);
		});
		this._nodejsStream.on("end", () =>
		{
			stream.__onEos();
		});
		this._nodejsStream.on("error", (error) =>
		{
			stream.__onError(error);
		});
	}

	async read(onData)
	{
		if (this._dataCallback || this._eosCallback)
		{
			throw new InvalidOperationException();
		}

		return new Promise(function (resolve, reject)
		{
			try
			{
				this.listen(onData, () => resolve(), (error) => reject(error))
			}
			catch (ex)
			{
				return reject(ex);
			}
		}.bind(this));
	}

	get dataCallback()
	{
		return this._dataCallback;
	}

	get eosCallback()
	{
		return this._eosCallback;
	}

	get errorCallback()
	{
		return this._errorCallback;
	}

    __onData(chunk)
    {
		if (!this._dataCallback)
		{
			throw new InvalidOperationException();
		}

		this._dataCallback(chunk);
    }

    __onEos()
    {
        if (!this._eosCallback)
		{
			throw new InvalidOperationException();
		}

		this._eosCallback();
    }

    __onError(error)
    {
        if (!this._errorCallback)
		{
			throw new InvalidOperationException();
		}

		this._errorCallback(error);
    }
}
