"use strict";

include("StdAfx.js");

class ForexTradeSensorV7_Channel extends ForexTradeSensorV7
{
	constructor(configuration, channel)
	{
		super(configuration);

		this._channel = channel;
	}

	static activator(signalQueue, signal, data, result)
	{
		switch (signal)
		{
			case EForexTradeSignalV7.Channel:
				result.tradeSensor = new ForexTradeSensorV7_Channel(data);
				result.finished = false;
				break;
			default:
				result.finished = true;
				break;
		}
		return result;
	}

	progress(signalQueue, signal, data, result)
	{
		switch (signal)
		{
			case EForexTradeSignalV7.SampledDatapoint:
				if (data.dt >= this._channel.longEndDp.dt)
				{
					signalQueue.enqueue({ channel: this.channel,
						signal: EForexTradeSignalV7.Channel_End,
					});
					result.finished = true;
					break;
				}

				const config = this.__configuration.channel;

				const spy = this._channel.supportLine.calc(data.dt);
				const rsy = this._channel.resistanceLine.calc(data.dt);
				const pvy = (spy + rsy) / 2;

				if (data.ask >= spy && data.bid <= rsy) signalQueue.enqueue({ channel: this.channel,
					signal: EForexTradeSignalV7.Channel_Inside,
				});

				if (data.ask > spy - config.vicinity && data.ask < spy + config.vicinity) signalQueue.enqueue({ channel: this.channel,
					signal: EForexTradeSignalV7.Channel_SupportVicinity,
				});
				else if (data.bid > rsy - config.vicinity && data.bid < rsy + config.vicinity) signalQueue.enqueue({ channel: this.channel,
					signal: EForexTradeSignalV7.Channel_ResistanceVicinity,
				});

				const emsdy = this._channel.msdy.emsdy_index[data.dt];
				if (emsdy === void (0)) throw "Assertion failed.";
				const emsdy_sp1 = pvy - emsdy;
				const emsdy_rs1 = pvy + emsdy;

				if (data.ask >= emsdy_sp1 && data.bid <= emsdy_rs1) signalQueue.enqueue({ channel: this.channel, 
					signal: EForexTradeSignalV7.Channel_Emsdy1_Inside,
				});

				if (data.ask > emsdy_sp1 - config.vicinity && data.ask < emsdy_sp1 + config.vicinity) signalQueue.enqueue({ channel: this.channel,
					signal: EForexTradeSignalV7.Channel_Emsdy1_SupportVicinity,
				});
				else if (data.bid > emsdy_rs1 - config.vicinity && data.bid < emsdy_rs1 + config.vicinity) signalQueue.enqueue({ channel: this.channel,
					signal: EForexTradeSignalV7.Channel_Emsdy1_ResistanceVicinity,
				});

				result.finished = false;
				break;
			default:
				result.finished = false;
				break;
		}
		return result;
	}
}