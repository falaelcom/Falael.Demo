"use strict";

include("StdAfx.js");

class ForexDataBase
{
	constructor(par)
	{
		this._client = par.client;
		this._sync = par.sync;

		this._forexMetadata = null;
		this._instruments = {};
		this._channels = [];
	}


	getChannel(instrumentId, sampleIntervalDef)
	{
		if (!instrumentId) throw "Argument is null: instrumentId.";
		if (sampleIntervalDef === void(0)) throw "Argument is undefined: sampleIntervalDef.";

		var instrument = this._instruments[instrumentId];
		if (!instrument)
		{
			instrument = new WeakMap();
			this._instruments[instrumentId] = instrument;
		}
		var channel = instrument.get(sampleIntervalDef || ForexDataBase._sampleIntervalDef_tick);
		if (!channel)
		{
			channel = new ForexDbDataChannel({ instrumentId: instrumentId, sampleIntervalDef: sampleIntervalDef, client: this._client, sync: this._sync });
			instrument.set(sampleIntervalDef || ForexDataBase._sampleIntervalDef_tick, channel);
			this._channels.push(channel);
		}
		return channel;
	}

	async getForexMetadata()
	{
		if (!this._forexMetadata)
		{
			if (!app.client.ready) return null;

			var response = await app.client.Data.GetForexMetadata();
			if (!response.success)
			{
				alert("Error! See console!");
				log(7808736, response.errors);
				return this._forexMetadata;
			}
			this._forexMetadata = response.value;
			this._forexMetadata.samplingIntervals.sort(function (left, right)
			{
				if (left.unit == right.unit) return left.length - right.length;
				return right.unit - left.unit;
			});
		}
		return this._forexMetadata;
	}

	async selectSampleInterval(min, max, maxDataPointCount, tickDataTresholdMs)
	{
		if (max - min < tickDataTresholdMs) return null;

		var momentMin = moment(min);
		var momentMax = moment(max);
		var dps = 1;

		var forexMetadata = await this.getForexMetadata();
		if (!forexMetadata) return null;
		for (var length = forexMetadata.samplingIntervals.length, i = 0; i < length; ++i)
		{
			var item = forexMetadata.samplingIntervals[i];
			var modelRangeInUnits = Math.floor(EDateTimeUnit.diffMoments(momentMax, momentMin, item.unit) / item.length);
			var sceneRangeForUnit = modelRangeInUnits / dps;
			if (sceneRangeForUnit < maxDataPointCount) return item;
		}
		return forexMetadata.samplingIntervals[forexMetadata.samplingIntervals.length - 1];
	}

	async getSampleIntervalByName(name)
	{
		var forexMetadata = await this.getForexMetadata();
		for (var length = forexMetadata.samplingIntervals.length, i = 0; i < length; ++i)
		{
			var item = forexMetadata.samplingIntervals[i];
			if (item.collectionName == name)
			{
				return item;
			}
		}
		return null;
	}

	async getLowerSampleInterval(name, offset)
	{
		offset = offset || 1;
		var forexMetadata = await this.getForexMetadata();
		for (var length = forexMetadata.samplingIntervals.length, i = 0; i < length; ++i)
		{
			var item = forexMetadata.samplingIntervals[i];
			if (item.collectionName == name)
			{
				if (i < offset) return forexMetadata.samplingIntervals[0];
				return forexMetadata.samplingIntervals[i - offset];
			}
		}
		return null;
	}

	getStat(instrumentId, collectionName)
	{
		const instrumentStats = this.stats[instrumentId];
		if (!instrumentStats) throw "Argument is invalid: instrumentId.";

		const stat = instrumentStats.find(m => m.coll == collectionName);
		if (!stat) throw "Argument is invalid: collectionName.";

		return stat;
	}

	getNormalXYRatio(instrumentId, collectionName)
	{
		const stat = this.getStat(instrumentId, collectionName);

		return ((stat.durationMaxMs + stat.durationMinMs) / 2) / stat.abarn;
	}

	async listNormalXYRatios(instrumentId)
	{
		const result = [];
		const metadata = await this.getForexMetadata();
		for (let i = 0; i < metadata.samplingIntervals.length; ++i)
		{
			const cn = metadata.samplingIntervals[i].collectionName;
			const ratio = app.db.getNormalXYRatio(instrumentId, cn);
			const stat = app.db.getStat(instrumentId, cn);
			const range_x = (stat.durationMaxMs + stat.durationMinMs) / 2;
			const range_y = stat.abarn;
			result.push({ range_x, range_y, ratio });
		}
		return result;
	}


	get cachedDataPointCount()
	{
		var result = 0;
		for (var length = this._channels.length, i = 0; i < length; ++i) result += this._channels[i].cachedDataPointCount;
		return result;
	}


	get client()
	{
		return this._client;
	}

	get sync()
	{
		return this._sync;
	}

	get stats()
	{
		const result =
		{
			"5d96423f5a4aa978f03002d2":
				[{
					"coll": "forex.sampledData.second5",
					"durationMinMs": 5000,
					"durationMaxMs": 5000,
					"almin": 1.03405,
					"ahmin": 1.03428,
					"almax": 1.51446,
					"ahmax": 1.5145,
					"aavg": 1.2405205641633255,
					"aminrn": 0,
					"amaxrn": 0.07734999999999981,
					"aarn": 0.00005520120002439099,
					"blmin": 1.034,
					"bhmin": 1.03423,
					"blmax": 1.51441,
					"bhmax": 1.51443,
					"bavg": 1.2404626360057878,
					"bminrn": 0,
					"bmaxrn": 0.05325999999999986,
					"barn": 0.00005484226901335837,
					"abavg": 1.2404916898173832,
					"abminrn": -0.0009900000000000464,
					"abmaxrn": 0.1307999999999998,
					"abarn": 0.00011294989201830353,
					"abiavg": 1.2404915103517027,
					"abiminrn": -0.017390000000000017,
					"abimaxrn": 0.06801999999999997,
					"abiarn": 0.0000029064229805272435,
					"spreadmin": -0.002349999999999852,
					"spreadmax": 0.11848999999999998,
					"spreadavg": 0.000057649515634272154
				}, {
						"coll": "forex.sampledData.second10",
						"durationMinMs": 10000,
						"durationMaxMs": 10000,
						"almin": 1.03405,
						"ahmin": 1.03429,
						"almax": 1.51446,
						"ahmax": 1.5145,
						"aavg": 1.2440748031460418,
						"aminrn": 0,
						"amaxrn": 0.07746999999999993,
						"aarn": 0.00008054411023410728,
						"blmin": 1.034,
						"bhmin": 1.03424,
						"blmax": 1.51437,
						"bhmax": 1.51443,
						"bavg": 1.244015304559718,
						"bminrn": 0,
						"bmaxrn": 0.053279999999999994,
						"barn": 0.00008018014533385072,
						"abavg": 1.2440451448442427,
						"abminrn": -0.0006800000000000139,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0001398607145415827,
						"abiavg": 1.2440449628615735,
						"abiminrn": -0.017390000000000017,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.000020863541026340285,
						"spreadmin": -0.002349999999999852,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00005890819637197228
					}, {
						"coll": "forex.sampledData.second30",
						"durationMinMs": 30000,
						"durationMaxMs": 30000,
						"almin": 1.03405,
						"ahmin": 1.03455,
						"almax": 1.51441,
						"ahmax": 1.5145,
						"aavg": 1.247022550522702,
						"aminrn": 0,
						"amaxrn": 0.0774999999999999,
						"aarn": 0.00015186876228884188,
						"blmin": 1.034,
						"bhmin": 1.03451,
						"blmax": 1.51432,
						"bhmax": 1.51443,
						"bavg": 1.2469610655311896,
						"bminrn": 0,
						"bmaxrn": 0.053279999999999994,
						"barn": 0.00015145309603533535,
						"abavg": 1.2469919119434936,
						"abminrn": -0.0006399999999999739,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0002131459208019149,
						"abiavg": 1.2469917041104768,
						"abiminrn": -0.017390000000000017,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.00009017593752230156,
						"spreadmin": -0.0010300000000000864,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00006050285901852738
					}, {
						"coll": "forex.sampledData.minute1",
						"durationMinMs": 60000,
						"durationMaxMs": 60000,
						"almin": 1.03405,
						"ahmin": 1.03462,
						"almax": 1.51439,
						"ahmax": 1.5145,
						"aavg": 1.2474236577658548,
						"aminrn": 0,
						"amaxrn": 0.0776199999999998,
						"aarn": 0.00022607375202566464,
						"blmin": 1.034,
						"bhmin": 1.03458,
						"blmax": 1.51431,
						"bhmax": 1.51443,
						"bavg": 1.2473613478301262,
						"bminrn": 0,
						"bmaxrn": 0.053279999999999994,
						"barn": 0.00022556383650295452,
						"abavg": 1.247392630276842,
						"abminrn": -0.0005699999999999594,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.00028812872977561116,
						"abiavg": 1.2473923753190534,
						"abiminrn": -0.01747999999999994,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.0001635088587529776,
						"spreadmin": -0.0010300000000000864,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.0000610630449973844
					}, {
						"coll": "forex.sampledData.minute5",
						"durationMinMs": 300000,
						"durationMaxMs": 300000,
						"almin": 1.03405,
						"ahmin": 1.03587,
						"almax": 1.51429,
						"ahmax": 1.5145,
						"aavg": 1.2475326530291169,
						"aminrn": 0,
						"amaxrn": 0.07800999999999991,
						"aarn": 0.0005456943877101408,
						"blmin": 1.034,
						"bhmin": 1.03583,
						"blmax": 1.51422,
						"bhmax": 1.51443,
						"bavg": 1.2474674667803942,
						"bminrn": 0,
						"bmaxrn": 0.05335999999999985,
						"barn": 0.0005447198126833847,
						"abavg": 1.2475003035484662,
						"abminrn": 0,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0006103933488718598,
						"abiavg": 1.247499816260922,
						"abiminrn": -0.017549999999999955,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.0004800208515216788,
						"spreadmin": -0.0010300000000000864,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00006331475118340352
					}, {
						"coll": "forex.sampledData.minute10",
						"durationMinMs": 600000,
						"durationMaxMs": 600000,
						"almin": 1.03405,
						"ahmin": 1.03602,
						"almax": 1.51429,
						"ahmax": 1.5145,
						"aavg": 1.247556222754741,
						"aminrn": 0,
						"amaxrn": 0.07800999999999991,
						"aarn": 0.000785547680549912,
						"blmin": 1.034,
						"bhmin": 1.03597,
						"blmax": 1.51421,
						"bhmax": 1.51443,
						"bavg": 1.2474885636728434,
						"bminrn": 0,
						"bmaxrn": 0.05401999999999996,
						"barn": 0.000784144776167199,
						"abavg": 1.247522743939863,
						"abminrn": 0.00004999999999988347,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0008525053102918116,
						"abiavg": 1.247522042487642,
						"abiminrn": -0.020489999999999897,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.0007171871464253145,
						"spreadmin": -0.0010300000000000864,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00006546920030740566
					}, {
						"coll": "forex.sampledData.minute15",
						"durationMinMs": 900000,
						"durationMaxMs": 900000,
						"almin": 1.03405,
						"ahmin": 1.03633,
						"almax": 1.51419,
						"ahmax": 1.5145,
						"aavg": 1.2475694303007334,
						"aminrn": 0,
						"amaxrn": 0.07800999999999991,
						"aarn": 0.000969451849776916,
						"blmin": 1.034,
						"bhmin": 1.03629,
						"blmax": 1.51411,
						"bhmax": 1.51443,
						"bavg": 1.2474993042277527,
						"bminrn": 0,
						"bmaxrn": 0.054119999999999946,
						"barn": 0.0009678206446707627,
						"abavg": 1.2475347750655081,
						"abminrn": 0.00005999999999994898,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0010387623201744739,
						"abiavg": 1.2475339594629526,
						"abiminrn": -0.024350000000000094,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.0008985101742731853,
						"spreadmin": -0.0010300000000000864,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00006803869625242066
					}, {
						"coll": "forex.sampledData.minute30",
						"durationMinMs": 1800000,
						"durationMaxMs": 1800000,
						"almin": 1.03405,
						"ahmin": 1.03648,
						"almax": 1.51369,
						"ahmax": 1.5145,
						"aavg": 1.2475930734469518,
						"aminrn": 0,
						"amaxrn": 0.07800999999999991,
						"aarn": 0.0013848871861728135,
						"blmin": 1.034,
						"bhmin": 1.03643,
						"blmax": 1.51361,
						"bhmax": 1.51443,
						"bavg": 1.2475165873917298,
						"bminrn": 0,
						"bmaxrn": 0.054199999999999804,
						"barn": 0.001382913484071684,
						"abavg": 1.2475553238448656,
						"abminrn": 0.00005999999999994898,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0014603863903574212,
						"abiavg": 1.2475543369938096,
						"abiminrn": -0.024660000000000126,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.0013074142798870875,
						"spreadmin": -0.0010300000000000864,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00007510433579409165
					}, {
						"coll": "forex.sampledData.hour1",
						"durationMinMs": 3600000,
						"durationMaxMs": 3600000,
						"almin": 1.03405,
						"ahmin": 1.03704,
						"almax": 1.51328,
						"ahmax": 1.5145,
						"aavg": 1.2476534857270627,
						"aminrn": 0,
						"amaxrn": 0.07873999999999981,
						"aarn": 0.0019757604511110053,
						"blmin": 1.034,
						"bhmin": 1.03701,
						"blmax": 1.51321,
						"bhmax": 1.51443,
						"bavg": 1.2475667238542467,
						"bminrn": 0,
						"bmaxrn": 0.05626999999999982,
						"barn": 0.0019726282327758296,
						"abavg": 1.2476108878452337,
						"abminrn": 0.00005999999999994898,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0020609562147569363,
						"abiavg": 1.2476093217360762,
						"abiminrn": -0.02532000000000001,
						"abimaxrn": 0.06801999999999997,
						"abiarn": -0.0018874324691298971,
						"spreadmin": -0.00039999999999995595,
						"spreadmax": 0.11848999999999998,
						"spreadavg": 0.00008499017587577928
					}, {
						"coll": "forex.sampledData.hour4",
						"durationMinMs": 14400000,
						"durationMaxMs": 14400000,
						"almin": 1.03405,
						"ahmin": 1.03897,
						"almax": 1.51249,
						"ahmax": 1.5145,
						"aavg": 1.2476643780692427,
						"aminrn": 0,
						"amaxrn": 0.0801099999999999,
						"aarn": 0.003999030272891134,
						"blmin": 1.034,
						"bhmin": 1.03891,
						"blmax": 1.51242,
						"bhmax": 1.51443,
						"bavg": 1.2475449832162617,
						"bminrn": 0,
						"bmaxrn": 0.05626999999999982,
						"barn": 0.003991360104432149,
						"abavg": 1.247606598184872,
						"abminrn": 0.00005999999999994898,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.0041145900416485566,
						"abiavg": 1.2476027631006377,
						"abiminrn": -0.04259999999999997,
						"abimaxrn": 0.0014999999999998348,
						"abiarn": -0.0038758003356747645,
						"spreadmin": -0.00029999999999996696,
						"spreadmax": 0.06801999999999997,
						"spreadavg": 0.00010426742089885812
					}, {
						"coll": "forex.sampledData.day1",
						"durationMinMs": 86400000,
						"durationMaxMs": 86400000,
						"almin": 1.03405,
						"ahmin": 1.04192,
						"almax": 1.50373,
						"ahmax": 1.5145,
						"aavg": 1.2480293555417175,
						"aminrn": 0,
						"amaxrn": 0.08257999999999988,
						"aarn": 0.009386805728518093,
						"blmin": 1.034,
						"bhmin": 1.04191,
						"blmax": 1.50365,
						"bhmax": 1.51443,
						"bavg": 1.2478394287048586,
						"bminrn": 0,
						"bmaxrn": 0.06320999999999999,
						"barn": 0.009366348069738469,
						"abavg": 1.2479395065379808,
						"abminrn": 0.00005999999999994898,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.009566503735990045,
						"abiavg": 1.2479292777085946,
						"abiminrn": -0.051569999999999894,
						"abimaxrn": 0.000220000000000109,
						"abiarn": -0.009186650062266457,
						"spreadmin": 0,
						"spreadmax": 0.06801999999999997,
						"spreadavg": 0.00029746886674968613
					}, {
						"coll": "forex.sampledData.week1",
						"durationMinMs": 604800000,
						"durationMaxMs": 604800000,
						"almin": 1.03405,
						"ahmin": 1.04997,
						"almax": 1.48291,
						"ahmax": 1.5145,
						"aavg": 1.2485493784786648,
						"aminrn": 0.006790000000000074,
						"amaxrn": 0.08309999999999995,
						"aarn": 0.024480983302411885,
						"blmin": 1.034,
						"bhmin": 1.04995,
						"blmax": 1.48282,
						"bhmax": 1.51443,
						"bavg": 1.248078988868274,
						"bminrn": 0.006820000000000048,
						"bmaxrn": 0.08338000000000001,
						"barn": 0.024450556586270874,
						"abavg": 1.2483217903525048,
						"abminrn": 0.006839999999999957,
						"abmaxrn": 0.1307999999999998,
						"abarn": 0.024936159554730972,
						"abiavg": 1.2483065769944335,
						"abiminrn": -0.08288999999999991,
						"abimaxrn": -0.006770000000000165,
						"abiarn": -0.02399538033395175,
						"spreadmin": 0,
						"spreadmax": 0.06801999999999997,
						"spreadavg": 0.0014528014842300507
					}, {
						"coll": "forex.sampledData.month1",
						"durationMinMs": 2419200000,
						"durationMaxMs": 2678400000,
						"almin": 1.03405,
						"ahmin": 1.08127,
						"almax": 1.46268,
						"ahmax": 1.5145,
						"aavg": 1.2491769758064515,
						"aminrn": 0.01583000000000001,
						"amaxrn": 0.13129999999999997,
						"aarn": 0.05123991935483869,
						"blmin": 1.034,
						"bhmin": 1.08123,
						"blmax": 1.46264,
						"bhmax": 1.51443,
						"bavg": 1.2483956451612905,
						"bminrn": 0.01580999999999988,
						"bmaxrn": 0.13137,
						"barn": 0.05103483870967743,
						"abavg": 1.2488375806451613,
						"abminrn": 0.01583000000000001,
						"abmaxrn": 0.13138000000000005,
						"abarn": 0.05191870967741935,
						"abiavg": 1.2487350403225803,
						"abiminrn": -0.1312899999999999,
						"abimaxrn": -0.01580999999999988,
						"abiarn": -0.050356048387096765,
						"spreadmin": 0.000009999999999843467,
						"spreadmax": 0.01819000000000015,
						"spreadavg": 0.0006895967741935518
					}
				],
		};
		return result;
	}
}

ForexDataBase._sampleIntervalDef_tick = {};
ForexDataBase.Instruments =
{
	EURUSD: "5d96423f5a4aa978f03002d2",
};
