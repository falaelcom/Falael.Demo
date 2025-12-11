"use strict";

include("StdAfx.js");

class ForexBrokerClient_Simulated extends ForexBrokerClient
{
	//	par.timePassage: EForexTimePassage
	constructor(par)
	{
		super();

		this._timePassage = par.timePassage;
		this._instrumentId = par.instrumentId;

		this._simulationStartMs = null;

		this._isRunning = false;
		this._timerId = -1;
		this._startTimeMs = null;
		this._startDataPoint = null;
		this._currentDataPoint = null;
		this._currentTimeMs = null;

		this._tickDataChannel = app.db.getChannel(this._instrumentId, null);
		this._pageSizeMs = 60 * 60 * 1000;		//	1 hour

		this._finish = new MulticastDelegate();
		this._idle = new MulticastDelegate();
	}


	onFinish(args)
	{
		this._finish.execute(this, args);
	}

	onIdle(args)
	{
		this._idle.execute(this, args);
	}


	async startSimulation()
	{
		if (this._timerId != -1)
		{
			throw "Invalid operation.";
		}
		if (this._simulationStartMs === null)
		{
			throw "Invalid operation.";
		}

		this._isRunning = true;

		if (this._simulationStartMs >= this._tickDataChannel.getAllDataEndMs())
		{
			this.onFinish();
			this._isRunning = false;
			return;
		}

		this._startDataPoint = await this._tickDataChannel.lookupDataPoint(
		{
			dt: this._simulationStartMs,
			pageSizeMs: this._pageSizeMs,
			lookBack: false,
			acceptEqual: false,	//	must be true
		});
		if (!this._startDataPoint) throw "Invalid operation.";
		this._currentDataPoint = this._startDataPoint;
		this._currentTimeMs = this._startDataPoint.dt;
		this._startTimeMs = new Date().getTime();

		switch (this.timePassage)
		{
			case EForexTimePassage.Discrete:
				break;
			case EForexTimePassage.RealTime:
			case EForexTimePassage.RealTime_x2:
			case EForexTimePassage.RealTime_x4:
			case EForexTimePassage.Afaic:
				this._timerId = window.setInterval(this._timerTick.bind(this), 0);
				break;
			default:
				throw "Not implemented.";
		}
	}

	stopSimulation()
	{
		switch (this.timePassage)
		{
			case EForexTimePassage.Discrete:
				break;
			case EForexTimePassage.RealTime:
			case EForexTimePassage.RealTime_x2:
			case EForexTimePassage.RealTime_x4:
			case EForexTimePassage.Afaic:
				if (this._timerId != -1)
				{
					window.clearInterval(this._timerId);
					this._timerId = -1;
				}
				break;
			default:
				throw "Not implemented.";
		}

		this._startTimeMs = null;
		this._isRunning = false;
	}

	async oneStep()
	{
		switch (this.timePassage)
		{
			case EForexTimePassage.Discrete:
				await this._oneStep_afaic();
				break;
			case EForexTimePassage.RealTime:
			case EForexTimePassage.RealTime_x2:
			case EForexTimePassage.RealTime_x4:
			case EForexTimePassage.Afaic:
				throw "Invalid operation.";
			default:
				throw "Not implemented.";
		}
	}


	async _timerTick()
	{
		switch (this.timePassage)
		{
			case EForexTimePassage.Discrete:
				throw "Invalid operation.";
			case EForexTimePassage.RealTime:
				await this._oneStep_realTime(1);
				break;
			case EForexTimePassage.RealTime_x2:
				await this._oneStep_realTime(2);
				break;
			case EForexTimePassage.RealTime_x4:
				await this._oneStep_realTime(4);
				break;
			case EForexTimePassage.Afaic:
				await this._oneStep_afaic();
				break;
			default:
				throw "Not implemented.";
		}
	}

	async _oneStep_realTime(accelerationFactor)
	{
		var elapsedMs = new Date().getTime() - this._startTimeMs;
		this._currentTimeMs = this._startDataPoint.dt + accelerationFactor * elapsedMs;

		if (this._currentTimeMs >= this._tickDataChannel.getAllDataEndMs())
		{
			this.onFinish();
			this.stopSimulation();
			return;
		}

		var dataPoint = await this._tickDataChannel.lookupDataPoint(
		{
			dt: this._currentTimeMs,
			pageSizeMs: this._pageSizeMs,
			lookBack: true,
			acceptEqual: true,
		});
		if (!dataPoint) throw "Invalid operation";
		if (dataPoint.dt <= this._currentDataPoint.dt)
		{
			this.onIdle({ dt: this._currentTimeMs });
			return;
		}

		this.currentDt = dataPoint.dt;
		this.currentAsk = dataPoint.ask;
		this.currentBid = dataPoint.bid;
		this._currentDataPoint = dataPoint;

		this.onTick({ dt: this.currentDt, ask: this.currentAsk, bid: this.currentBid });
	}

	async _oneStep_afaic()
	{
		var dataPoint = await this._tickDataChannel.lookupDataPoint(
		{
			dt: this._currentTimeMs,
			pageSizeMs: this._pageSizeMs,
			lookBack: false,
			acceptEqual: false,
		});
		if (!dataPoint)	//	eod
		{
			this.onFinish();
			this.stopSimulation();
			return;
		}

		this._currentTimeMs = dataPoint.dt;

		this.currentDt = dataPoint.dt;
		this.currentAsk = dataPoint.ask;
		this.currentBid = dataPoint.bid;
		this._currentDataPoint = dataPoint;

		this.onTick({ dt: this.currentDt, ask: this.currentAsk, bid: this.currentBid });
	}


	get simulationStartMs()
	{
		return this._simulationStartMs;
	}

	set simulationStartMs(value)
	{
		if (this.isRunning) throw "Invalid operation.";
		if (this._simulationStartMs == value) return;
		if (value <= this._tickDataChannel.getAllDataStartMs()) throw "Argument is invalid: value.";
		this._simulationStartMs = value;
	}


	get timePassage()
	{
		return this._timePassage;
	}

	set timePassage(value)
	{
		this._timePassage = value;
	}


	get isRunning()
	{
		return this._isRunning;
	}

	get currentDataPoint()
	{
		return this._currentDataPoint;
	}

	get currentTimeMs()
	{
		return this._currentTimeMs;
	}


	get finish()
	{
		return this._finish;
	}

	get idle()
	{
		return this._idle;
	}
}
