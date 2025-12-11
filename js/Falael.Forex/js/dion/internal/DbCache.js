"use strict";

const ObjectID = require("mongodb").ObjectID;

const InvalidOperationException = require("@framework/InvalidOperationException.js");
const InvalidValueException = require("@framework/InvalidValueException.js");
const DbException = require("@framework/DbException.js");

const DataBuffer = require("@shared/DataBuffer.js");

const GetForexDataBoundariesCommand = require("@commands/Data/GetForexDataBoundariesCommand.js");
const GetForexMetadataCommand = require("@commands/Data/GetForexMetadataCommand.js");

module.exports = class DbCache
{
    constructor(par)
    {
		if (!par.pid) throw new ArgumentNullException("par.pid");
		if (!par.coll) throw new ArgumentNullException("par.coll");
		if (!par.authorativePropertyName) throw new ArgumentNullException("par.authorativePropertyName");

		this._pid = par.pid;
		this._coll = par.coll;
		this._authorativePropertyName = par.authorativePropertyName;
		this._pageSize_backward = par.pageSize_backward || 1000;
		this._pageSize_forward = par.pageSize_forward || 10000;

		this._samplingInterval = null;
		this._dbBoundaries = null;
		this._initialized = false;

		this._dataBuffer = new DataBuffer({ authorativePropertyName: this._authorativePropertyName });
    }

	async datapoint(dt, less, equal)
	{
		if (!this._initialized)
		{
			await this._lateInit();
			this._initialized = true;
		}

		if (this._dbBoundaries.empty) return null;
		if (less)
		{
			if (equal) if (dt < this._dbBoundaries.min) return null;
			else if (dt <= this._dbBoundaries.min) return null;
		}
		else
		{
			if (equal) if (dt > this._dbBoundaries.max) return null;
			else if (dt >= this._dbBoundaries.max) return null;
		}

		let result = this._dataBuffer.lookupDataPoint(dt, less, equal);
		if (result) return result;

		for (let length = 1000, i = 0; i < length; ++i)
		{
			const range = this._dataBuffer.getVoidVicinity(dt, less);
			if (range.min < this._dbBoundaries.min) range.min = this._dbBoundaries.min - 1;
			if (range.max > this._dbBoundaries.max) range.max = this._dbBoundaries.max + 1;
			if (less && range.max > dt) range.max = dt + 1;
			if (!less && range.min < dt) range.min = dt - 1;
			let data;
			let loadedRange = range.clone();
			try
			{
				if (less)
				{
					data = await db.collection(this._coll).find(
					{
						pid: ObjectID(this._pid),
						dt: { $gte: range.roundDown(0.5).min, $lte: range.roundDown(0.5).max },
					}).limit(this._pageSize_backward).sort({ dt: -1 }).toArray();
					data.reverse();
					if (data.length == this._pageSize_backward) loadedRange.min = data[0].dt;
				}
				else
				{
					data = await db.collection(this._coll).find(
					{
						pid: ObjectID(this._pid),
						dt: { $gte: range.roundDown(0.5).min, $lte: range.roundDown(0.5).max },
					}).limit(this._pageSize_forward).sort({ dt: 1 }).toArray();
					if (data.length == this._pageSize_forward) loadedRange.max = data[data.length - 1].dt;
				}
			}
			catch (ex)
			{
				throw new DbException(ex);
			}
			this._dataBuffer.merge(data, loadedRange);
			let result = this._dataBuffer.lookupDataPoint(dt, less, equal);
			if (result) return result;
		}

		throw new InvalidOperationException("Limit exceeded.");
	}

	async datapoints(dt, count, less, equal)
	{
		var result = [];
		for (var cdt = dt, i = 0; i < count; ++i)
		{
			var dp = await this.datapoint(cdt, less, i == 0 ? equal : false);
			if (!dp) break;
			result.push(dp);
			cdt = dp.dt;
		}
		if (less) result.reverse();
		return result;
	}

	async _lateInit()
	{
		try
		{
			await db.collection(this._coll).createIndex(

				{ pid: 1, dt: 1 },
				{ unique: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		this._samplingInterval = await GetForexMetadataCommand.getItemByCollectionName(this._coll);
		if (!this._samplingInterval) throw new InvalidValueException("coll");

		this._dbBoundaries = await GetForexDataBoundariesCommand.run(this._pid);
	}
}
