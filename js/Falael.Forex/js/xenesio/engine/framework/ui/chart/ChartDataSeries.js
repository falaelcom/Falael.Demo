"use strict";

include("StdAfx.js");

class ChartDataSeries extends ChartSeries
{
	constructor(id, zIndex, xAxis, yAxis, dataSource, mapping, defaultValues, seriesTypeId)
	{
		super(id, zIndex, xAxis, yAxis, seriesTypeId);

		this._dataSource = dataSource;
		this._mapping = mapping;
		this._defaultValues = defaultValues;

		this.xAxis.dataRange.change.add(this._dataRange_change.bind(this));
		this.yAxis.dataRange.change.add(this._dataRange_change.bind(this));

		this._validDataVersion = null;
		this.__invalidateAspect("dataRanges");

		if (this._dataSource) this.__invalidateAspect("dataSource");
	}

	validateDataSource()
	{
		this._validDataVersion = this._dataSource.dataVersion;
	}

	get dataSourceValid()
	{
		return (this._validDataVersion !== null && this._validDataVersion == this._dataSource.dataVersion);
	}

	get dataSource()
	{
		return this._dataSource;
	}

	set dataSource(value)
	{
		if (!value) throw "Argument is null: value.";
		if (this._dataSource == value) return;
		this._dataSource = value;
		this.__invalidateAspect("dataSource");
	}

	get mapping()
	{
		return this._mapping;
	}

	get defaultValues()
	{
		return this._defaultValues;
	}

	_dataRange_change(sender, args)
	{
		this.__invalidateAspect("dataRanges");
	}
}
