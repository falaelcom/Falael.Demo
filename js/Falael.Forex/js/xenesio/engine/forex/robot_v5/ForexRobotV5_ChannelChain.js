"use strict";

include("StdAfx.js");

class ForexRobotV5_ChannelChain
{
	constructor(par)
	{
		this._instrumentId = par.instrumentId;
		this._sampleIntervalDef = par.sampleIntervalDef;
		this._pageSizeMs = par.pageSizeMs;	//1000 * 60 * 60 * 10;	//	10h
		this._channelShaper = par.channelShaper;

		this._progress = par.progress;

		this._channelChain = null;
		this._isBroken = false;
	}


	initialize(sampleIntervalDef)
	{
		this._sampleIntervalDef = sampleIntervalDef;
		this._channelChain = null;
		this._isBroken = false;
	}

	async buildRange(range)
	{
		var simulationRange = range.clone();
		if (!this._channelChain || !this._channelChain.length)
		{
			this._channelChain = [];
		}
		else
		{
			var lastChannel = this._channelChain[this._channelChain.length - 1];
			if (lastChannel.lastDt >= simulationRange.max) return;
			simulationRange.min = lastChannel.lastDt;
		}

		var progressRange = new Range(simulationRange.min, range.max);
		if (this._progress) this._progress({ range: progressRange, current: simulationRange.min });

		var dbChannel = app.db.getChannel(this._instrumentId, this._sampleIntervalDef);
		var dbDataEndMs = await dbChannel.getAllDataEndMs();
		var progressInfo = null;
		while (simulationRange.max <= dbDataEndMs)
		{
			await dbChannel.ensureRange(simulationRange.roundUp(0.5));
			var data = dbChannel.getRawDataInRange(simulationRange.roundUp(0.5));
			if (data.length < this._channelShaper.minSignificantDataPointCount)
			{
				simulationRange.max += this._pageSizeMs;
				continue;
			}

			var channelFeature = this._channelShaper.shape({ sampleIntervalDef: this._sampleIntervalDef, progressInfo: progressInfo }, data);
			if (!channelFeature) return;
			if (channelFeature.isBroken)
			{
				this._isBroken = true;
				break;
			}
			if (channelFeature.lineOfBestFitInfo.lineOfBestFit_significantPointSample.length < this._channelShaper.minSignificantDataPointCount)
			{
				simulationRange.max += this._pageSizeMs;
				continue;
			}

			
			if (channelFeature.isFinished)
			{
				this._channelChain.push(channelFeature);
				simulationRange.min = channelFeature.lastDt + 1;
				if (simulationRange.min >= range.max) break;
				if (simulationRange.max - simulationRange.min < this._pageSizeMs) simulationRange.max += this._pageSizeMs;
				progressInfo = null;
			}
			else if (this.gapTester(data[data.length - 1].dt, simulationRange.max))
			{
				this._channelShaper.finish({ sampleIntervalDef: this._sampleIntervalDef }, channelFeature, data);
				this._channelChain.push(channelFeature);
				simulationRange.min = channelFeature.lastDt + 1;
				if (simulationRange.min >= range.max) break;
				simulationRange.max = simulationRange.min + this._pageSizeMs;
				progressInfo = null;
			}
			else
			{
				progressInfo = channelFeature.progressInfo;
				simulationRange.max += this._pageSizeMs;
			}

			if (this._progress) this._progress({ range: progressRange, current: simulationRange.min });
		}
		if (this._progress) this._progress({ range: progressRange, current: progressRange.max });
	}


	gapTester (left, right)
	{
		var gapSize = 10;

		var unit = this._sampleIntervalDef.unit;
		var length = this._sampleIntervalDef.length;
		var leftMoment = moment.utc(left);
		var rightMoment = moment.utc(right);
		var range = EDateTimeUnit.diffMoments(rightMoment, leftMoment, unit);
		return range > gapSize * length;
	}


	get correlationRating()
	{
		if (this._channelChain.length < 2) return 0;

		var sum = 0;
		for (var length = this._channelChain.length, i = 0; i < length; ++i)
		{
			var item = this._channelChain[i];
			try
			{
				sum += item.lineOfBestFitInfo.lineOfBestFit_pointSample.correlationCoefficient("x", "y");
			}
			catch (ex)
			{
				log(52363514, ex);
			}
		}
		return sum / this._channelChain.length;
	}

	get ccscCountRating()
	{
		if (this._channelChain.length < 2) return 0;

		var sum = 0;
		for (var length = this._channelChain.length, i = 0; i < length; ++i) sum += 1 - MappedArray.fnorm(-0.9, 2 * MappedArray.sigmoid(this._channelChain[i].lineOfBestFitInfo.lineOfBestFit_turningPoints_spi3.length / 5) - 1);
		return sum / this._channelChain.length;
	}

	static movementInfo(channelFeatures)
	{
		if (!channelFeatures || !channelFeatures.length) return null;

		var sum = 0;
		var sdSum = 0;
		for (var jlength = channelFeatures.length, j = 0; j < jlength; ++j)
		{
			var feature = channelFeatures[j];
			var sdy = feature.lineOfBestFitInfo.lineOfBestFit_pointSample.standardDeviation("y");
			for (var length = feature.tradeSample.length, i = 0; i < length; ++i)
			{
				var item = feature.tradeSample.getAt(i);
				sum += item.movement || 0;
				sdSum += (item.movement || 0) / sdy;
			}
		}
		var result =
		{
			totalMovement: sum,
			sdTotalMovement: sdSum,
		};
		return result;
	}


	get channelChain()
	{
		return this._channelChain;
	}

	get initialized()
	{
		return !!this._sampleIntervalDef;
	}

	get isBroken()
	{
		return this._isBroken;
	}
}
