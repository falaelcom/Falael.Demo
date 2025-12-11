"use strict";

include("StdAfx.js");

class ForextDbChartDataSource extends ChartDataSource
{
	constructor(id, dataBase)
	{
		super(id);

		this._dataBase = dataBase;

		this._instrumentId = null;
		this._sampleIntervalDef = void(0);
		this._channel = null;
		this._authorativeRange = new Range(-1, -1);

		this._data = [];
	}


	getDataInRange(range)
	{
		throw "Not implemented.";
	}

	clear()
	{
		super.clear();

		this._instrumentId = null;
		this._sampleIntervalDef = void(0);
		this._channel = null;
		this._authorativeRange = new Range(-1, -1);
	}


	async refreshData()
	{
		if (!this._channel) return;
		if (this.isValid) return;
		await this._channel.ensureRange(this._authorativeRange.roundUp(0.5));
		this.__validateData();
		this._data = this._channel.getRawDataInRange(this._authorativeRange.roundUp(0.5));
	}


	get rawData()
	{
		return this._data;
	}


	get instrumentId()
	{
		return this._instrumentId;
	}

	set instrumentId(value)
	{
		if (!value) throw "Argument is null: value.";
		if (this._instrumentId == value) return;
		this._instrumentId = value;
		if (this._instrumentId && this._sampleIntervalDef !== void(0))
		{
			this._channel = this._dataBase.getChannel(this._instrumentId, this._sampleIntervalDef);
			this.__invalidateData();
		}
	}

	get sampleIntervalDef()
	{
		return this._sampleIntervalDef;
	}

	set sampleIntervalDef(value)
	{
		if (value === void (0)) throw "Argument is undefined: value.";
		if (this._sampleIntervalDef == value) return;
		this._sampleIntervalDef = value;
		if (this._instrumentId && this._sampleIntervalDef !== void (0))
		{
			this._channel = this._dataBase.getChannel(this._instrumentId, this._sampleIntervalDef);
			this.__invalidateData();
		}
	}

	get authorativeRange()
	{
		return this._authorativeRange;
	}

	set authorativeRange(value)
	{
		if (!value) throw "Argument is null: value.";
		if (this._authorativeRange.equals(value)) return;
		this._authorativeRange = value;
		this.__invalidateData();
	}


	get adaptiveRange()
	{
		if (!this._channel) return new Range(-1, -1);
		return Range.measureArray(this._data, "ask", "bid");
	}

	get sync()
	{
		return this._channel ? this._channel.sync : new Sync();
	}


	get dataBase()
	{
		return this._dataBase;
	}
}
