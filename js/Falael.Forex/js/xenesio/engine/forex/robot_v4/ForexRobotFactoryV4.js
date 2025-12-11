"use strict";

include("StdAfx.js");

class ForexRobotFactoryV4
{
	constructor()
	{
	}

	static static_constructor()
	{
		var i = -1;
		ForexRobotFactoryV4.Offsets = {};
		ForexRobotFactoryV4.Schema = {};

		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_correlationCoefficient_biasStrength = i; ForexRobotFactoryV4.Schema.trendLineShaper_correlationCoefficient_biasStrength = { min: 0.2, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_correlationCoefficient_weight = i; ForexRobotFactoryV4.Schema.trendLineShaper_correlationCoefficient_weight = { min: 0, max: 100, resolution: 0.1 };
		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_standardDeviationFactor = i; ForexRobotFactoryV4.Schema.trendLineShaper_standardDeviationFactor = { min: 0, max: 0.001, resolution: 0.000001 };
		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_standardDeviationRating_weight = i; ForexRobotFactoryV4.Schema.trendLineShaper_standardDeviationRating_weight = { min: 0, max: 100, resolution: 0.1 };
		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_normalizedSlope_scaleMin = i; ForexRobotFactoryV4.Schema.trendLineShaper_normalizedSlope_scaleMin = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_normalizedSlope_scaleMax = i; ForexRobotFactoryV4.Schema.trendLineShaper_normalizedSlope_scaleMax = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.trendLineShaper_normalizedSlopeRating_weight = i; ForexRobotFactoryV4.Schema.trendLineShaper_normalizedSlopeRating_weight = { min: 0, max: 100, resolution: 0.1 };

		++i; ForexRobotFactoryV4.Offsets.peaksShaper_epsylon = i; ForexRobotFactoryV4.Schema.peaksShaper_epsylon = { min: 0, max: 0.0001, resolution: 0.000001 };

		++i; ForexRobotFactoryV4.Offsets.valleyShaper_epsylon = i; ForexRobotFactoryV4.Schema.valleyShaper_epsylon = { min: 0, max: 0.0001, resolution: 0.000001 };

		++i; ForexRobotFactoryV4.Offsets.robot_windowsSize = i; ForexRobotFactoryV4.Schema.robot_windowsSize = { min: 5 * 60 * 1000, max: 1 * 60 * 60 * 1000, resolution: 5 * 60 * 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_tsEpsylon = i; ForexRobotFactoryV4.Schema.robot_tsEpsylon = { min: 15 * 1000, max: 30 * 60 * 1000, resolution: 15 * 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_angleEpsylon = i; ForexRobotFactoryV4.Schema.robot_angleEpsylon = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_open_extremumNext_interval = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_open_extremumNext_interval = { min: 0, max: 30 * 60 * 1000, resolution: 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_open_sdAngleFactor_min = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_open_sdAngleFactor_min = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_open_sdThreshold = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_open_sdThreshold = { min: 0, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_close_sdAngleFactor = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_close_sdAngleFactor = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_close_sdThreshold = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_close_sdThreshold = { min: 0, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_close_sdSafeguardThreshold = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_close_sdSafeguardThreshold = { min: 0, max: 100, resolution: 0.05 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_position_gracePeriod = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_position_gracePeriod = { min: 0, max: 10 * 60 * 60 * 1000, resolution: 60 * 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_position_maxTime = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_position_maxTime = { min: 60 * 1000, max: 24 * 60 * 60 * 1000, resolution: 60 * 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_position_targetProfitFactor = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_position_targetProfitFactor = { min: 0, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_longPosition_investmentFactor = i; ForexRobotFactoryV4.Schema.robot_trading_longPosition_investmentFactor = { min: 0, max: 1, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_open_extremumNext_interval = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_open_extremumNext_interval = { min: 0, max: 30 * 60 * 1000, resolution: 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_open_sdAngleFactor_min = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_open_sdAngleFactor_min = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_open_sdThreshold = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_open_sdThreshold = { min: 0, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_close_sdAngleFactor = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_close_sdAngleFactor = { min: 0, max: 1, resolution: 0.001 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_close_sdThreshold = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_close_sdThreshold = { min: 0, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_close_sdSafeguardThreshold = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_close_sdSafeguardThreshold = { min: 0, max: 100, resolution: 0.05 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_position_gracePeriod = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_position_gracePeriod = { min: 0, max: 10 * 60 * 60 * 1000, resolution: 60 * 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_position_maxTime = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_position_maxTime = { min: 60 * 1000, max: 24 * 60 * 60 * 1000, resolution: 60 * 1000 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_position_targetProfitFactor = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_position_targetProfitFactor = { min: 0, max: 10, resolution: 0.01 };
		++i; ForexRobotFactoryV4.Offsets.robot_trading_shortPosition_investmentFactor = i; ForexRobotFactoryV4.Schema.robot_trading_shortPosition_investmentFactor = { min: 0, max: 1, resolution: 0.01 };

		ForexRobotFactoryV4.lastOffset = i;

		ForexRobotFactoryV4._testSchemaIntegrity();
	}


	//	settings - fixed settings
	//		minSignificantDataPointCount
	//		forexAccount
	//		forexAccount_autoUpdate
	//		transactionDelayMinMs
	//		transactionDelayMaxMs
	//	callbacks - fixed callbacks
	//		openPosition
	//		closePosition
	//	config - genetically mutable configuration
	createRobot(settings, callbacks, config)
	{
		var trendLineShaper = new ForexShaperV4_TrendLine(
		{
			minSignificantDataPointCount: settings.minSignificantDataPointCount,

			correlationCoefficient_biasStrength: config.trendLineShaper.correlationCoefficient_biasStrength,
			correlationCoefficient_weight: config.trendLineShaper.correlationCoefficient_weight,

			standardDeviationFactor: config.trendLineShaper.standardDeviationFactor,
			standardDeviationRating_weight: config.trendLineShaper.standardDeviationRating_weight,

			normalizedSlope_scaleMin: config.trendLineShaper.normalizedSlope_scaleMin,
			normalizedSlope_scaleMax: config.trendLineShaper.normalizedSlope_scaleMax,
			normalizedSlopeRating_weight: config.trendLineShaper.normalizedSlopeRating_weight,
		});
		var peaksShaper = new ForexShaperV4_SignificantPeaks(
		{
			epsylon: config.peaksShaper.epsylon,
		});
		var valleyShaper = new ForexShaperV4_SignificantValleys(
		{
			epsylon: config.valleyShaper.epsylon,
		});
		var forexRobotV4 = new ForexRobotV4(
		{
			forexAccount: settings.forexAccount,
			forexAccount_autoUpdate: settings.forexAccount_autoUpdate,

			transactionDelayMinMs: settings.transactionDelayMinMs,
			transactionDelayMaxMs: settings.transactionDelayMaxMs,

			trendLineShaper: trendLineShaper,
			peaksShaper: peaksShaper,
			valleyShaper: valleyShaper,

			windowsSize: config.windowsSize,
			tsEpsylon: config.tsEpsylon,
			angleEpsylon: config.angleEpsylon,
			trading_longPosition:
			{
				open_extremumNext_interval: config.trading_longPosition.open_extremumNext_interval,
				open_sdAngleFactor_min: config.trading_longPosition.open_sdAngleFactor_min,
				open_sdThreshold: config.trading_longPosition.open_sdThreshold,
				close_sdAngleFactor: config.trading_longPosition.close_sdAngleFactor,
				close_sdThreshold: config.trading_longPosition.close_sdThreshold,
				close_sdSafeguardThreshold: config.trading_longPosition.close_sdSafeguardThreshold,
				position_gracePeriod: config.trading_longPosition.position_gracePeriod,
				position_maxTime: config.trading_longPosition.position_maxTime,
				position_targetProfitFactor: config.trading_longPosition.position_targetProfitFactor,
				investmentFactor: config.trading_longPosition.investmentFactor,
			},
			trading_shortPosition:
			{
				open_extremumNext_interval: config.trading_shortPosition.open_extremumNext_interval,
				open_sdAngleFactor_min: config.trading_shortPosition.open_sdAngleFactor_min,
				open_sdThreshold: config.trading_shortPosition.open_sdThreshold,
				close_sdAngleFactor: config.trading_shortPosition.close_sdAngleFactor,
				close_sdThreshold: config.trading_shortPosition.close_sdThreshold,
				close_sdSafeguardThreshold: config.trading_shortPosition.close_sdSafeguardThreshold,
				position_gracePeriod: config.trading_shortPosition.position_gracePeriod,
				position_maxTime: config.trading_shortPosition.position_maxTime,
				position_targetProfitFactor: config.trading_shortPosition.position_targetProfitFactor,
				investmentFactor: config.trading_shortPosition.investmentFactor,
			},
		},
		{
			openPosition: callbacks.openPosition,
			closePosition: callbacks.closePosition,
		});
		return forexRobotV4;
	}


	static numericArrayToJsonSettings(array)
	{
		function get(schemaName) { return ForexRobotFactoryV4.decodeFromInteger(array[ForexRobotFactoryV4.Offsets[schemaName]], ForexRobotFactoryV4.Schema[schemaName]); }

		var result =
		{
			trendLineShaper:
			{
				correlationCoefficient_biasStrength: get("trendLineShaper_correlationCoefficient_biasStrength"),
				correlationCoefficient_weight: get("trendLineShaper_correlationCoefficient_weight"),

				standardDeviationFactor: get("trendLineShaper_standardDeviationFactor"),
				standardDeviationRating_weight: get("trendLineShaper_standardDeviationRating_weight"),

				normalizedSlope_scaleMin: get("trendLineShaper_normalizedSlope_scaleMin"),
				normalizedSlope_scaleMax: get("trendLineShaper_normalizedSlope_scaleMax"),
				normalizedSlopeRating_weight: get("trendLineShaper_normalizedSlopeRating_weight"),
			},
			peaksShaper:
			{
				epsylon: get("peaksShaper_epsylon"),
			},
			valleyShaper:
			{
				epsylon: get("valleyShaper_epsylon"),
			},
			
			windowsSize: get("robot_windowsSize"),
			tsEpsylon: get("robot_tsEpsylon"),
			angleEpsylon: get("robot_angleEpsylon"),
			trading_longPosition:
			{
				open_extremumNext_interval: get("robot_trading_longPosition_open_extremumNext_interval"),
				open_sdAngleFactor_min: get("robot_trading_longPosition_open_sdAngleFactor_min"),
				open_sdThreshold: get("robot_trading_longPosition_open_sdThreshold"),
				close_sdAngleFactor: get("robot_trading_longPosition_close_sdAngleFactor"),
				close_sdThreshold: get("robot_trading_longPosition_close_sdThreshold"),
				close_sdSafeguardThreshold: get("robot_trading_longPosition_close_sdSafeguardThreshold"),
				position_gracePeriod: get("robot_trading_longPosition_position_gracePeriod"),
				position_maxTime: get("robot_trading_longPosition_position_maxTime"),
				position_targetProfitFactor: get("robot_trading_longPosition_position_targetProfitFactor"),
				investmentFactor: get("robot_trading_longPosition_investmentFactor"),
			},
			trading_shortPosition:
			{
				open_extremumNext_interval: get("robot_trading_shortPosition_open_extremumNext_interval"),
				open_sdAngleFactor_min: get("robot_trading_shortPosition_open_sdAngleFactor_min"),
				open_sdThreshold: get("robot_trading_shortPosition_open_sdThreshold"),
				close_sdAngleFactor: get("robot_trading_shortPosition_close_sdAngleFactor"),
				close_sdThreshold: get("robot_trading_shortPosition_close_sdThreshold"),
				close_sdSafeguardThreshold: get("robot_trading_shortPosition_close_sdSafeguardThreshold"),
				position_gracePeriod: get("robot_trading_shortPosition_position_gracePeriod"),
				position_maxTime: get("robot_trading_shortPosition_position_maxTime"),
				position_targetProfitFactor: get("robot_trading_shortPosition_position_targetProfitFactor"),
				investmentFactor: get("robot_trading_shortPosition_investmentFactor"),
			},
		};

		return result;
	}

	static jsonToNumericArraySettings(json)
	{
		var result = [];

		function set(schemaName, modelValue) { result[ForexRobotFactoryV4.Offsets[schemaName]] = ForexRobotFactoryV4.encodeAsInteger(modelValue, ForexRobotFactoryV4.Schema[schemaName]); }

		set("trendLineShaper_correlationCoefficient_biasStrength", json.trendLineShaper.correlationCoefficient_biasStrength);
		set("trendLineShaper_correlationCoefficient_weight", json.trendLineShaper.correlationCoefficient_weight);
		set("trendLineShaper_standardDeviationFactor", json.trendLineShaper.standardDeviationFactor);
		set("trendLineShaper_standardDeviationRating_weight", json.trendLineShaper.standardDeviationRating_weight);
		set("trendLineShaper_normalizedSlope_scaleMin", json.trendLineShaper.normalizedSlope_scaleMin);
		set("trendLineShaper_normalizedSlope_scaleMax", json.trendLineShaper.normalizedSlope_scaleMax);
		set("trendLineShaper_normalizedSlopeRating_weight", json.trendLineShaper.normalizedSlopeRating_weight);

		set("peaksShaper_epsylon", json.peaksShaper.epsylon);

		set("valleyShaper_epsylon", json.valleyShaper.epsylon);

		set("robot_windowsSize", json.windowsSize);
		set("robot_tsEpsylon", json.tsEpsylon);
		set("robot_angleEpsylon", json.angleEpsylon);
		set("robot_trading_longPosition_open_extremumNext_interval", json.trading_longPosition.open_extremumNext_interval);
		set("robot_trading_longPosition_open_sdAngleFactor_min", json.trading_longPosition.open_sdAngleFactor_min);
		set("robot_trading_longPosition_open_sdThreshold", json.trading_longPosition.open_sdThreshold);
		set("robot_trading_longPosition_close_sdAngleFactor", json.trading_longPosition.close_sdAngleFactor);
		set("robot_trading_longPosition_close_sdThreshold", json.trading_longPosition.close_sdThreshold);
		set("robot_trading_longPosition_close_sdSafeguardThreshold", json.trading_longPosition.close_sdSafeguardThreshold);
		set("robot_trading_longPosition_position_gracePeriod", json.trading_longPosition.position_gracePeriod);
		set("robot_trading_longPosition_position_maxTime", json.trading_longPosition.position_maxTime);
		set("robot_trading_longPosition_position_targetProfitFactor", json.trading_longPosition.position_targetProfitFactor);
		set("robot_trading_longPosition_investmentFactor", json.trading_longPosition.investmentFactor);
		set("robot_trading_shortPosition_open_extremumNext_interval", json.trading_shortPosition.open_extremumNext_interval);
		set("robot_trading_shortPosition_open_sdAngleFactor_min", json.trading_shortPosition.open_sdAngleFactor_min);
		set("robot_trading_shortPosition_open_sdThreshold", json.trading_shortPosition.open_sdThreshold);
		set("robot_trading_shortPosition_close_sdAngleFactor", json.trading_shortPosition.close_sdAngleFactor);
		set("robot_trading_shortPosition_close_sdThreshold", json.trading_shortPosition.close_sdThreshold);
		set("robot_trading_shortPosition_close_sdSafeguardThreshold", json.trading_shortPosition.close_sdSafeguardThreshold);
		set("robot_trading_shortPosition_position_gracePeriod", json.trading_shortPosition.position_gracePeriod);
		set("robot_trading_shortPosition_position_maxTime", json.trading_shortPosition.position_maxTime);
		set("robot_trading_shortPosition_position_targetProfitFactor", json.trading_shortPosition.position_targetProfitFactor);
		set("robot_trading_shortPosition_investmentFactor", json.trading_shortPosition.investmentFactor);

		return result;
	}


	static encodeAsInteger(modelValue, schema)
	{
		//	sample: ForexRobotFactoryV4.Offsets.valleyShaper_epsylon = { min: 0, max: 0.0001, resolution: 0.000001 };
		var schemaRange = schema.max - schema.min;	//	0.0001
		var possibleValueCount = schemaRange / schema.resolution;	//	100
		var modelToIndexRatio = schemaRange / possibleValueCount;	//	0.000001
		var indexValue = Math.round((modelValue - schema.min) / modelToIndexRatio);	//	modelValue 0 -> 0; modelValue 0.0001 -> 100; modelValue 0.00005 -> 50
		return indexValue;
	}

	static decodeFromInteger(indexValue, schema)
	{
		//	sample: ForexRobotFactoryV4.Offsets.valleyShaper_epsylon = { min: 0, max: 0.0001, resolution: 0.000001 };
		var schemaRange = schema.max - schema.min;	//	0.0001
		var possibleValueCount = schemaRange / schema.resolution;
		var modelToIndexRatio = schemaRange / possibleValueCount;
		var modelValue = indexValue * modelToIndexRatio + schema.min;
		return modelValue;
	}


	static _testSchemaIntegrity()
	{
		var arraySample = [];
		for (var length = ForexRobotFactoryV4.lastOffset + 1, i = 0; i < length; ++i) arraySample[i] = i + 1;
		var json = ForexRobotFactoryV4.numericArrayToJsonSettings(arraySample);
		var processedArray = ForexRobotFactoryV4.jsonToNumericArraySettings(json);
		for (var length = arraySample.length, i = 0; i < length; ++i) if (arraySample[i] != processedArray[i]) throw "Invalid operation.";
	}
}

ForexRobotFactoryV4.static_constructor();

