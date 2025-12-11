"use strict";

include("StdAfx.js");

class ForexTradeEngineV7
{
	constructor(par)
	{
		if (par.sampleIntervalDef.unit < EDateTimeUnit.Week) throw "Argument is invalid.";

		this._sampleIntervalDef = par.sampleIntervalDef;

		this._config_windowSize_sampledDps = par.config_windowSize_sampledDps;
		this._config_windowSize_extremums = par.config_windowSize_extremums;
		this._config_windowSize_movements = par.config_windowSize_movements;
		this._config_vicinity = par.config_vicinity;

		this._prebuilt_sampledDp = par.prebuilt_sampledDp;
		this._prebuilt_valleys = par.prebuilt_valleys;
		this._prebuilt_peaks = par.prebuilt_peaks;
		this._prebuilt_channels = par.prebuilt_channels.sort((l, r) => l.detectionDp.dt - r.detectionDp.dt);

		this._prebuilt_sampledDp_curi = 0;
		this._prebuilt_valleys_curi = 0;
		this._prebuilt_peaks_curi = 0;
		this._prebuilt_channels_curi = 0;

		this._sampleLengthMs = EDateTimeUnit.getMaxUnitLengthMs(this._sampleIntervalDef.unit) * this._sampleIntervalDef.length;

		this._state =
		{
			clientTick: null,
			sampledDps: new Queue(),
			extremums: new Queue(),
			movements: new Queue(),
			channels: [],
			channelState: {},
			positions: [],
		};
		this._changes =
		{
			clientTick_removed: null,
			clientTick_added: null,
			sampledDp_removed: null,
			sampledDp_added: null,
			extremum_removed: null,
			extremum_added: null,
			movement_removed: null,
			movement_added: null,
			channels_removed: [],
			channels_added: [],
			channels_changed: [],
			positions_removed: [],
			positions_added: [],
			positions_changed: [],

			reset()
			{
				this.clientTick_removed = null;
				this.clientTick_added = null;
				this.sampledDp_removed = null;
				this.sampledDp_added = null;
				this.extremum_removed = null;
				this.extremum_added = null;
				this.movement_removed = null;
				this.movement_added = null;
				this.channels_added.length = 0;
				this.channels_removed.length = 0;
				this.channels_changed.length = 0;
				this.positions_added.length = 0;
				this.positions_removed.length = 0;
				this.positions_changed.length = 0;
			},

			log()
			{
				const sb = [];
				//if (this.clientTick_removed) sb.push("clientTick removed: " + moment.utc(this.clientTick_removed.dt).toString() + "." + moment.utc(this.clientTick_removed.dt).format("SSS"));
				//if (this.clientTick_added) sb.push(  "clientTick added  : " + moment.utc(this.clientTick_added.dt).toString() + "." + moment.utc(this.clientTick_added.dt).format("SSS"));
				if (this.sampledDp_removed) sb.push("sampledDp removed: " + moment.utc(this.sampledDp_removed.dt).toString());
				if (this.sampledDp_added) sb.push(  "sampledDp added  : " + moment.utc(this.sampledDp_added.dt).toString());
				if (this.extremum_removed) sb.push("extremum removed: " + moment.utc(this.extremum_removed.dm.dt).toString() + ", " + moment.utc(this.extremum_removed.m.dt).toString() + ", t: " + this.extremum_removed.t);
				if (this.extremum_added) sb.push("extremum added  : " + moment.utc(this.extremum_added.dm.dt).toString() + ", " + moment.utc(this.extremum_added.m.dt).toString() + ", t: " + this.extremum_added.t);
				if (this.movement_removed) sb.push("movement removed: " + moment.utc(this.movement_removed.last.dt).toString() + ", da: " + this.movement_removed.directiona + ", db: " + this.movement_removed.directionb);
				if (this.movement_added) sb.push("movement added  : " + moment.utc(this.movement_added.last.dt).toString() + ", da: " + this.movement_added.directiona + ", db: " + this.movement_added.directionb);
				if (this.channels_changed.length) sb.push("channels_changed : " + this.channels_changed.length);
				for (let length = this.channels_changed.length, i = 0; i < length; ++i)
				{
					const item = this.channels_changed[i];
					if (item.clientTickPriceLocation_removed) sb.push("-- " + item.id + " clientTickPriceLocation removed: " + EForexChannelLocationV7.toString(item.clientTickPriceLocation_removed));
					if (item.clientTickPriceLocation_added) sb.push("-- " + item.id + " clientTickPriceLocation added  : " + EForexChannelLocationV7.toString(item.clientTickPriceLocation_added));
				}
				const text = sb.join("\n");
				if (!text) return;
				log("======================\n" + text);
			},
		};
	}


	clientTick(clientTick)
	{
		this._changes.reset();

		//	clientTick
		if (!this._state.clientTick || this._state.clientTick.dt != clientTick.dt)
		{
			this._changes.clientTick_removed = this._state.clientTick;
			this._state.clientTick = clientTick;
			this._changes.clientTick_added = this._state.clientTick;
		}

		//	sampledDp
		if (this._changes.clientTick_added)
		{
			const sampledDp = this._buildSampledDp();
			if (sampledDp)
			{
				this._state.sampledDps.enqueue(sampledDp);
				this._changes.sampledDp_added = sampledDp;
				if (this._state.sampledDps.length > this._config_windowSize_sampledDps) this._changes.sampledDp_removed = this._state.sampledDps.dequeue();
			}
		}

		if (this._changes.sampledDp_added)
		{
			//	channels_removed
			const endedChannelIds = this._testChannels();
			if (endedChannelIds)
			{
				const channels_mod = [];
				for (let length = this._state.channels.length, i = 0; i < length; ++i)
				{
					const item = this._state.channels[i];
					if (!endedChannelIds[item.id]) channels_mod.push(item);
					else
					{
						this._changes.channels_removed.push(item);
						delete this._state.channelState[item.id];
					}
				}
				this._state.channels = channels_mod;
			}

			//	extremum
			const extremum = this._buildExtremum();
			if (extremum)
			{
				this._state.extremums.enqueue(extremum);
				this._changes.extremum_added = extremum;
				if (this._state.extremums.length > this._config_windowSize_extremums) this._changes.extremum_removed = this._state.extremums.dequeue();
			}

			//	movement
			const movement = this._buildMovement();
			if (movement)
			{
				this._state.movements.enqueue(movement);
				this._changes.movement_added = movement;
				if (this._state.movements.length > this._config_windowSize_movements) this._changes.movement_removed = this._state.movements.dequeue();
			}
		}

		//	channels_added
		if (this._changes.sampledDp_added)
		{
			const detectedChannels = this._buildChannels();
			if (detectedChannels)
			{
				this._state.channels = this._state.channels.concat(detectedChannels);
				this._changes.channels_added = detectedChannels;
				for (let length = detectedChannels.length, i = 0; i < length; ++i) this._state.channelState[detectedChannels[i].id] =
				{
					clientTickPriceLocation: null,
					sampledDpPriceLocation: null,
					movementCrossing: null,
					extremumLocation: null,
				};
			}
		}

		//	channels_changed
		if (this._changes.clientTick_added)
		{
			for (let length = this._state.channels.length, i = 0; i < length; ++i)
			{
				const item = this._state.channels[i];
				this._changes.channels_changed.push(this._updateChannelState(item, this._state.channelState[item.id]));
			}
		}

		for (let length = this._changes.channels_changed.length, i = 0; i < length; ++i)
		{
			const item = this._changes.channels_changed[i];

			if (item.movementCrossing_added)
			{
				switch (item.movementCrossing_added.location)
				{
					case EForexChannelLocationV7.Support_Outward:
						//this._openPosition();
						break;
					case EForexChannelLocationV7.Resistance_Outward:
						break;
					default: break;
				}
			}

		}


		this._changes.log();
		//log(991, this._changes, this._state);
	}


	_buildSampledDp()
	{
		if (this._prebuilt_sampledDp_curi >= this._prebuilt_sampledDp.length) return null;
		let nextSampledDp = this._prebuilt_sampledDp[this._prebuilt_sampledDp_curi];
		let detectionDt = nextSampledDp.dt + this._sampleLengthMs;
		while (detectionDt < this._state.clientTick.dt)
		{
			nextSampledDp = this._prebuilt_sampledDp[++this._prebuilt_sampledDp_curi];
			detectionDt = nextSampledDp.dt + this._sampleLengthMs;
		}
		if (detectionDt == this._state.clientTick.dt)
		{
			const result = this._prebuilt_sampledDp[++this._prebuilt_sampledDp_curi - 1];
			result.ddt = detectionDt;
			return result;
		}
		return null;
	}

	_buildExtremum()
	{
		if (this._prebuilt_valleys_curi < this._prebuilt_valleys.length)
		{
			let nextExtremum = this._prebuilt_valleys[this._prebuilt_valleys_curi];
			while (this._prebuilt_valleys_curi < this._prebuilt_valleys.length && nextExtremum.dm.dt < this._changes.sampledDp_added.dt)
			{
				nextExtremum = this._prebuilt_valleys[++this._prebuilt_valleys_curi];
			}
			if (this._prebuilt_valleys_curi < this._prebuilt_valleys.length && nextExtremum.dm.dt == this._changes.sampledDp_added.dt) return this._prebuilt_valleys[++this._prebuilt_valleys_curi - 1];
		}
		if (this._prebuilt_peaks_curi < this._prebuilt_peaks.length)
		{
			let nextExtremum = this._prebuilt_peaks[this._prebuilt_peaks_curi];
			while (this._prebuilt_peaks_curi < this._prebuilt_peaks.length && nextExtremum.dm.dt < this._changes.sampledDp_added.dt)
			{
				nextExtremum = this._prebuilt_peaks[++this._prebuilt_peaks_curi];
			}
			if (this._prebuilt_peaks_curi < this._prebuilt_peaks.length && nextExtremum.dm.dt == this._changes.sampledDp_added.dt) return this._prebuilt_peaks[++this._prebuilt_peaks_curi - 1];
		}
		return null;
	}

	_buildMovement()
	{
		if (this._state.sampledDps.length < 2) return null;
	
		const first = this._state.sampledDps.lookup(1);
		const last = this._changes.sampledDp_added;
		
		const directiona = Math.sign(last.ask - first.ask);
		const directionb = Math.sign(last.bid - first.bid);

		const linedefa = LinearFunction.buildLineFromPoints({ x: first.ddt, y: first.ask }, { x: last.ddt, y: last.ask });
		const linedefb = LinearFunction.buildLineFromPoints({ x: first.ddt, y: first.bid }, { x: last.ddt, y: last.bid });

		const result =
		{
			directiona,
			directionb,
			first,
			last,
			linedefa,
			linedefb,
		};
		return result;
	}

	_testChannels()
	{
		const result = {};
		const currentDp = this._changes.sampledDp_added;
		let match = false;
		for (let length = this._state.channels.length, i = 0; i < length; ++i)
		{
			const item = this._state.channels[i];
			if (item.longEndDp && item.longEndDp.dt == currentDp.dt)
			{
				result[item.id] = true;
				match = true;
			}
		}
		if (!match) return null;
		return result;
	}

	_buildChannels()
	{
		if (this._prebuilt_channels_curi >= this._prebuilt_channels.length) return null;

		const result = [];
		const currentDp = this._changes.sampledDp_added;
		for (let length = this._prebuilt_channels.length; this._prebuilt_channels_curi < length; ++this._prebuilt_channels_curi)
		{
			const item = this._prebuilt_channels[this._prebuilt_channels_curi];
//			log(9999, item.detectionDp.dt, currentDp.dt, item.detectionDp.dt == currentDp.dt);
			if (item.detectionDp.dt == currentDp.dt) result.push(item);
			else if (item.detectionDp.dt > currentDp.dt) break;
		}
		if (!result.length) return null;
		return result;
	}

	_updateChannelState(channel, channelState)
	{
		const result =
		{
			id: channel.id,
			channel: channel,
			clientTickPriceLocation_removed: null,
			clientTickPriceLocation_added: null,
			sampledDpPriceLocation_removed: null,
			sampledDpPriceLocation_added: null,
			movementCrossing_removed: null,
			movementCrossing_added: null,
			extremumLocation_removed: null,
			extremumLocation_added: null,
		};

		const vicinity = this._config_vicinity * channel.spread;
		//	const vicinity = this._config_vicinity * channel.sdy;
		let proposed = null;

		const sly_ct = channel.supportLine.calc(this._changes.clientTick_added.dt);
		const rly_ct = channel.resistanceLine.calc(this._changes.clientTick_added.dt);
		if (this._changes.clientTick_added.bid > rly_ct - vicinity && this._changes.clientTick_added.bid <= rly_ct) proposed = EForexChannelLocationV7.ResistanceVicinity_Inside;
		else if (this._changes.clientTick_added.bid < rly_ct + vicinity && this._changes.clientTick_added.bid > rly_ct) proposed = EForexChannelLocationV7.ResistanceVicinity_Outside;
		else if (this._changes.clientTick_added.ask < sly_ct + vicinity && this._changes.clientTick_added.ask >= sly_ct) proposed = EForexChannelLocationV7.SupportVicinity_Inside;
		else if (this._changes.clientTick_added.ask > sly_ct - vicinity && this._changes.clientTick_added.ask < sly_ct) proposed = EForexChannelLocationV7.SupportVicinity_Outside;
		else if (this._changes.clientTick_added.bid < rly_ct && this._changes.clientTick_added.ask > sly_ct) proposed = EForexChannelLocationV7.Inside;
		else if (this._changes.clientTick_added.bid >= rly_ct) proposed = EForexChannelLocationV7.Above;
		else proposed = EForexChannelLocationV7.Below;
		if (channelState.clientTickPriceLocation != proposed)
		{
			log(888,
				"bid", this._changes.clientTick_added.bid,
				"rly_ct", rly_ct - vicinity, rly_ct, rly_ct + vicinity,
				"ask", this._changes.clientTick_added.ask,
				"sly_ct", sly_ct - vicinity, sly_ct, sly_ct + vicinity,
				EForexChannelLocationV7.toString(proposed),
			);
			result.clientTickPriceLocation_removed = channelState.clientTickPriceLocation;
			channelState.clientTickPriceLocation = proposed;
			result.clientTickPriceLocation_added = channelState.clientTickPriceLocation;
		}

		if (this._changes.sampledDp_added)
		{
			const sly_sdp = channel.supportLine.calc(this._changes.sampledDp_added.dt);
			const rly_sdp = channel.resistanceLine.calc(this._changes.sampledDp_added.dt);
			if (this._changes.sampledDp_added.bid > rly_sdp - vicinity && this._changes.sampledDp_added.bid <= rly_sdp) proposed = EForexChannelLocationV7.ResistanceVicinity_Inside;
			else if (this._changes.sampledDp_added.bid < rly_sdp + vicinity && this._changes.sampledDp_added.bid > rly_sdp) proposed = EForexChannelLocationV7.ResistanceVicinity_Outside;
			else if (this._changes.sampledDp_added.ask < sly_sdp + vicinity && this._changes.sampledDp_added.ask >= sly_sdp) proposed = EForexChannelLocationV7.SupportVicinity_Inside;
			else if (this._changes.sampledDp_added.ask > sly_sdp - vicinity && this._changes.sampledDp_added.ask < sly_sdp) proposed = EForexChannelLocationV7.SupportVicinity_Outside;
			else if (this._changes.sampledDp_added.bid < rly_sdp && this._changes.sampledDp_added.ask > sly_sdp) proposed = EForexChannelLocationV7.Inside;
			else if (this._changes.sampledDp_added.bid >= rly_sdp) proposed = EForexChannelLocationV7.Above;
			else proposed = EForexChannelLocationV7.Below;
			if (channelState.sampledDpPriceLocation != proposed)
			{
				result.sampledDpPriceLocation_removed = channelState.sampledDpPriceLocation;
				channelState.sampledDpPriceLocation = proposed;
				result.sampledDpPriceLocation_added = channelState.sampledDpPriceLocation;
			}
		}

		if (this._changes.movement_added)
		{
			const sCrossPoint = this._changes.movement_added.linedefa.intersectWith(channel.supportLine);
			const rCrossPoint = this._changes.movement_added.linedefb.intersectWith(channel.resistanceLine);

			if (sCrossPoint && sCrossPoint.x >= this._changes.movement_added.first.ddt && sCrossPoint.x <= this._changes.movement_added.last.ddt)
			{
				if (this._changes.movement_added.directiona > 0) proposed = { location: EForexChannelLocationV7.Support_Inward, point: sCrossPoint };
				else proposed = { location: EForexChannelLocationV7.Support_Outward, point: sCrossPoint };
			}
			else if (rCrossPoint && rCrossPoint.x >= this._changes.movement_added.first.ddt && rCrossPoint.x <= this._changes.movement_added.last.ddt)
			{
				if (this._changes.movement_added.directionb < 0) proposed = { location: EForexChannelLocationV7.Resistance_Inward, point: rCrossPoint };
				else proposed = { location: EForexChannelLocationV7.Resistance_Outward, point: rCrossPoint };
			}
			else proposed = { location: EForexChannelLocationV7.None };
			if (!channelState.movementCrossing || channelState.movementCrossing.location != proposed.location)
			{
				result.movementCrossing_removed = channelState.movementCrossing;
				channelState.movementCrossing = proposed;
				result.movementCrossing_added = channelState.movementCrossing;
			}
		}

		if (this._changes.extremum_added)
		{
			const sly_ext = channel.supportLine.calc(this._changes.extremum_added.m.dt);
			const rly_ext = channel.resistanceLine.calc(this._changes.extremum_added.m.dt);
			if (this._changes.extremum_added.v > rly_ext - vicinity && this._changes.extremum_added.v <= rly_ext) proposed = EForexChannelLocationV7.ResistanceVicinity_Inside;
			else if (this._changes.extremum_added.v < rly_ext + vicinity && this._changes.extremum_added.v > rly_ext) proposed = EForexChannelLocationV7.ResistanceVicinity_Outside;
			else if (this._changes.extremum_added.v < sly_ext + vicinity && this._changes.extremum_added.v >= sly_ext) proposed = EForexChannelLocationV7.SupportVicinity_Inside;
			else if (this._changes.extremum_added.v > sly_ext - vicinity && this._changes.extremum_added.v < sly_ext) proposed = EForexChannelLocationV7.SupportVicinity_Outside;
			else if (this._changes.extremum_added.v < rly_ext && this._changes.extremum_added.v > sly_ext) proposed = EForexChannelLocationV7.Inside;
			else if (this._changes.extremum_added.v >= rly_ext) proposed = EForexChannelLocationV7.Above;
			else proposed = EForexChannelLocationV7.Below;
			if (channelState.extremumLocation != proposed)
			{
				result.extremumLocation_removed = channelState.extremumLocation;
				channelState.extremumLocation = proposed;
				result.extremumLocation_added = channelState.extremumLocation;
			}
		}

		return result;
	}


	get state()
	{
		return this._state;
	}
	
	get changes()
	{
		return this._changes;
	}
}