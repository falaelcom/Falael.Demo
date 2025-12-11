"use strict";

include("StdAfx.js");

include("forex/EForexTimePassage.js");
include("forex/EForexPositionType.js");

include("forex/ForexPosition.js");
include("forex/ForexAccount.js");
include("forex/ForexAccount_Oanda_Simulated.js");
include("forex/ForexBrokerClient.js");
include("forex/ForexBrokerClient_Simulated.js");
include("forex/ForexAccountSlippageSimulator.js");

include("forex/ForexDataBase.js");
include("forex/ForexDataChannel.js");
include("forex/ForexDbDataChannel.js");
include("forex/ForextDbChartDataSource.js");
include("forex/ForextFeedChartDataSource.js");

include("forex/robot_v4/EForexFeatureStatusV4.js");
include("forex/robot_v4/EExtremumTypesV4.js");
include("forex/robot_v4/ForexDataPointV4.js");
include("forex/robot_v4/EForexRobotStateV4.js");
include("forex/robot_v4/EForexPositionCloseReasonV4.js");
include("forex/robot_v4/ForexFeatureVisualiserV4.js");
include("forex/robot_v4/ForexFeatureV4_TrendLine.js");
include("forex/robot_v4/ForexFeatureV4_Extremums.js");
include("forex/robot_v4/ForexShaperV4.js");
include("forex/robot_v4/ForexShaperV4_TrendLine.js");
include("forex/robot_v4/ForexShaperV4_SignificantPeaks.js");
include("forex/robot_v4/ForexShaperV4_SignificantValleys.js");
include("forex/robot_v4/ForexRobotTradeConfigV4.js");
include("forex/robot_v4/ForexRobotV4.js");
include("forex/robot_v4/ForexRobotFactoryV4.js");
include("forex/robot_v4/ForexGeneticSimulatorV4.js");

include("forex/robot_v5/EDataPointSelectorV5.js");
include("forex/robot_v5/EDecisionTypeV5.js");
include("forex/robot_v5/EExtremumTypesV5.js");
include("forex/robot_v5/EForexFeatureStatusV5.js");
include("forex/robot_v5/EPriceSourcingV5.js");
include("forex/robot_v5/ETransactionTypeV5.js");
include("forex/robot_v5/ForexDataPointV5.js");
include("forex/robot_v5/ForexFeatureV5_Channel.js");
include("forex/robot_v5/ForexFeatureVisualiserV5.js");
include("forex/robot_v5/ForexShaperV5.js");
include("forex/robot_v5/ForexShaperV5_Channel.js");
include("forex/robot_v5/ForexTraderV5.js");
include("forex/robot_v5/ForexTraderV5_Channel_LBF.js");
include("forex/robot_v5/ForexTraderV5_Channel_SNR_ZigZag.js");
include("forex/robot_v5/ForexRobotV5_ChannelChain.js");
include("forex/robot_v5/ForexRobotV5_ChannelChain_Factory.js");
include("forex/robot_v5/ForexRobotV5_ChannelChain_GeneticSimulator.js");
include("forex/robot_v5/ForexRangerV5.js");

include("forex/robot_v6/ForexShaperV6.js");
include("forex/robot_v6/ForexShaper_PredictorV6.js");

include("forex/robot_v7/EForexChannelLocationV7.js");
include("forex/robot_v7/ForexTradeEngineV7.js");
include("forex/robot_v7/ForexChannelV7.js");
include("forex/robot_v7/ForexLandscapeShaperV7.js");
