"use strict";

module.exports =

class Simulator
{
	constructor()
	{
	}

	trade(data, testMarket, testPosition, positionOpened, positionClosed)
	{
		if (!data) throw "Argument is null: data.";
		if (!testMarket) throw "Argument is null: testMarket.";

		let tradeCount = 0;
		let positions = [];
		let totalMovement = 0;

		for (let length = data.length, i = 0; i < length; ++i)
		{
			const dp = data[i];

			const positions2 = [];
			for (let length = positions.length, i = 0; i < length; ++i)
			{
				const position = positions[i];
				let closePositionReason = null;
				let closeLevel = null;
				if (position.type == "buy")
				{
					if (position.trailingStopLossDistance) position.trailingStopLoss = Math.max(position.trailingStopLoss, Math.round((dp.raw.bh - position.trailingStopLossDistance) * 100000) / 100000);
					closeLevel = dp.bid;
					if (!closePositionReason && position.stopLoss && dp.raw.bl <= position.stopLoss) { closeLevel = position.stopLoss; closePositionReason = "stopLoss"; }
					if (!closePositionReason && position.trailingStopLoss && dp.raw.bl <= position.trailingStopLoss) { closeLevel = position.trailingStopLoss; closePositionReason = "trailingStopLoss"; }
					if (!closePositionReason && position.takeProfit && dp.raw.bc >= position.takeProfit) { closeLevel = position.takeProfit; closePositionReason = "takeProfit"; }
				}
				else
				{
					if (position.trailingStopLossDistance) position.trailingStopLoss = Math.min(position.trailingStopLoss, Math.round((dp.raw.al + position.trailingStopLossDistance) * 100000) / 100000);
					closeLevel = dp.ask;
					if (!closePositionReason && position.stopLoss && dp.raw.ah >= position.stopLoss) { closeLevel = position.stopLoss; closePositionReason = "stopLoss"; }
					if (!closePositionReason && position.trailingStopLoss && dp.raw.ah >= position.trailingStopLoss) { closeLevel = position.trailingStopLoss; closePositionReason = "trailingStopLoss"; }
					if (!closePositionReason && position.takeProfit && dp.raw.ac <= position.takeProfit) { closeLevel = position.takeProfit; closePositionReason = "takeProfit"; }
				}
				if (!closePositionReason && position.stopDt && dp.dt >= position.stopDt) closePositionReason = "stopDt";
				if (!closePositionReason && testPosition) closePositionReason = testPosition(dp, i, position);
				if (!closePositionReason)
				{
					positions2.push(position);
					continue;
				}

				let movement;
				log(999, position.type, position.price, closeLevel);
				if (position.type == "buy") movement = closeLevel - position.price;
				else movement = position.price - closeLevel;
				totalMovement += movement;
				if (positionClosed) positionClosed(dp, i, position, closeLevel, movement, closePositionReason, totalMovement, tradeCount);
				++tradeCount;
			}
			positions = positions2;

			const actions = testMarket(dp, i, totalMovement, tradeCount);
			if (!actions) continue;
			for (let klength = actions.length, k = 0; k < klength; ++k)
			{
				const action = actions[k];
				let position;
				if (action.type == "buy") position =
				{
					type: "buy",
					dt: dp.dt,
					price: dp.ask,
					trailingStopLoss: -Infinity,
					tag: action.tag,
				};
				else position =
				{
					type: "sell",
					dt: dp.dt,
					price: dp.bid,
					trailingStopLoss: Infinity,
					tag: action.tag,
				};
				if (action.stopDt) position.stopDt = action.stopDt;
				if (action.stopLoss) position.stopLoss = Math.round(action.stopLoss * 100000) / 100000;
				if (action.trailingStopLossDistance) position.trailingStopLossDistance = Math.round(action.trailingStopLossDistance * 100000) / 100000;
				if (action.takeProfit) position.takeProfit = Math.round(action.takeProfit * 100000) / 100000;
				if (positionOpened) positionOpened(dp, i, position, totalMovement, tradeCount);
				positions.push(position);
			}
		}

		const result =
		{
			totalMovement: totalMovement,
			tradeCount: tradeCount,
		};
		return result;
	}

	async ticktrade(par)
	{
		if (!par.tickIterator) throw "Argument is null: tickIterator.";
		if (!par.testMarket) throw "Argument is null: testMarket.";
		if (!par.testPosition) throw "Argument is null: testPosition.";

		const tickIterator = par.tickIterator;
		const testMarket = par.testMarket;
		const testPosition = par.testPosition;
		const clientTickResolutionTps = par.clientTickResolutionTps || 4;
		const makeSystemLatency = par.makeSystemLatency || ((tick) => 0);
		const makeClientLatency = par.makeClientLatency || ((tick) => 0);
		const positionOpen = par.positionOpen || null;
		const positionClose = par.positionClose || null;

		if (Math.floor(1000 / clientTickResolutionTps) != 1000 / clientTickResolutionTps) throw "Argument is invalid: clientTickResolutionTps.";

		const result =
		{
			tradeCount: 0,
			totalMovement: 0,
			totalSlippage: 0,
		};

		let positions = [];
		let executionPool = [];
		let systemTickPointer;
		let clientTickCandidate = null;
		let clientTickIntervalMs = Math.floor(1000 / clientTickResolutionTps);
		let clientTickLast = null;
		while (!(systemTickPointer = await tickIterator.next()).done)
		{
			const systemTick = systemTickPointer.value;

			//	simulate client ticks (the last system tick within a predefined interval within a round second)
			let clientTickTimerDt = systemTick.dt - (systemTick.dt % clientTickIntervalMs);	//	round down to a clientTickIntervalMs boundry
			const clientTickAvailable = (clientTickCandidate && clientTickCandidate.dt < clientTickTimerDt);	//	clientTickCandidate is always the previous systemTick; consider a client tick candidate as a client tick if the current client tick timer's time exceeds the last system's tick time
			const clientTick = clientTickAvailable ? Object.assign({}, clientTickCandidate, { dt: clientTickTimerDt }) : null;	//	the client tick ticks at regular intervals and not at a specific system tick

			//	test for possible new positions 
			if (clientTickAvailable)
			{
				if (clientTickLast)
				{
					const simulatedClientTickCount = (clientTick.dt - clientTickLast.dt) / clientTickIntervalMs;
					if (simulatedClientTickCount != Math.round((clientTick.dt - clientTickLast.dt) / clientTickIntervalMs)) throw "Assertion failed.";
					for (let j = 1; j < simulatedClientTickCount; ++j)
					{
						const clientTickSimulated = Object.assign({}, clientTickLast, { dt: clientTickLast.dt + j * clientTickIntervalMs });
						if (clientTickSimulated.dt == clientTick.dt || clientTickSimulated.dt == clientTickLast.dt) throw "Assertion failed.";
						const outcome = await inspectMarket(clientTickSimulated, null, testMarket);
						for (let klength = outcome.length, k = 0; k < klength; ++k) executionPool.push({ action: "open", position: outcome[k], latencyMs: makeClientLatency(clientTickSimulated) });
					}
				}
				const outcome = await inspectMarket(clientTick, systemTick, testMarket);
				for (let klength = outcome.length, k = 0; k < klength; ++k) executionPool.push({ action: "open", position: outcome[k], latencyMs: makeClientLatency(clientTick) });
				clientTickLast = clientTick;
			}

			//	test for positions due for closing
			const positions_mod = [];
			for (let klength = positions.length, k = 0; k < klength; ++k)
			{
				const position = positions[k];
				let outcome = inspectPosition_system(clientTick, systemTick, position);
				if (outcome.closeReason)
				{
					executionPool.push({ action: "close", position: outcome, latencyMs: makeSystemLatency(systemTick) });
					continue;
				}
				if (clientTickAvailable)
				{
					outcome = await inspectPosition_client(clientTick, systemTick, position, testPosition);
					if (outcome.closeReason)
					{
						executionPool.push({ action: "close", position: outcome, latencyMs: makeClientLatency(clientTick) });
						continue;
					}
				}
				positions_mod.push(outcome);
			}
			positions = positions_mod;

			//	execute scheduled position openings and closings with latency
			const executionPool_mod = [];
			for (let klength = executionPool.length, k = 0; k < klength; ++k)
			{
				const item = executionPool[k];
				const position = item.position;
				switch (item.action)
				{
					case "open":
						if (systemTick.dt >= position.opening.orderTick.dt + item.latencyMs)
						{
							position.opening.executionTick = systemTick;
							position.opening.price = (position.type == "buy" ? systemTick.ask : systemTick.bid);
							position.opening.slippage = (position.type == "buy" ? position.opening.orderTick.ask - position.opening.executionTick.ask : position.opening.executionTick.bid - position.opening.orderTick.bid);
							position.opening.latencyMs = item.latencyMs;

							positions.push(position);

							if (positionOpen) positionOpen(position, result);
							break;
						}
						executionPool_mod.push(position);
						break;
					case "close":
						if (systemTick.dt >= position.closing.orderTick.dt + item.latencyMs)
						{
							position.closing.executionTick = systemTick;
							position.closing.price = (position.type == "buy" ? systemTick.bid : systemTick.ask);
							position.closing.slippage = (position.type == "buy" ? position.closing.executionTick.bid - position.closing.orderTick.bid : position.closing.orderTick.ask - position.closing.executionTick.ask);
							position.closing.latencyMs = item.latencyMs;
							position.movement = (position.type == "buy" ? position.closing.price - position.opening.price : position.opening.price - position.closing.price);
							position.slippage = position.opening.slippage + position.closing.slippage;

							result.totalMovement += position.movement;
							result.totalSlippage += position.slippage;
							++result.tradeCount;

							if (positionClose) positionClose(position, result);
							break;
						}
						executionPool_mod.push(position);
						break;
					default:
						throw "Not implemented.";
				}
			}
			executionPool = executionPool_mod;

			clientTickCandidate = systemTick;
		}

		return result;

		async function inspectMarket(clientTick, systemTick, testMarket)
		{
			if (!clientTick) throw "Argument is null: clientTick.";

			const result = [];
			//	testMarket(clientTick): [{type, tag*, stopDt*, stopLoss*, trailingStopLossDistance*, takeProfit*}]
			const actions = await testMarket(clientTick);
			if (!actions) return result;
			for (let length = actions.length, i = 0; i < length; ++i)
			{
				const action = actions[i];
				let position;
				switch (action.type)
				{
					case "buy":
						position =
						{
							type: "buy",
							id: action.id || newLUID(),
							tag: action.tag,
							trailingStopLoss: -Infinity,
							opening: { systemTick: systemTick, clientTick: clientTick, orderTick: clientTick, executionTick: null, price: null, slippage: null, latencyMs: null },
							closing: { systemTick: null, clientTick: null, orderTick: null, executionTick: null, price: null, slippage: null, latencyMs: null },
						};
						break;
					case "sell":
						position =
						{
							type: "sell",
							id: action.id || newLUID(),
							tag: action.tag,
							trailingStopLoss: Infinity,
							opening: { systemTick: systemTick, clientTick: clientTick, orderTick: clientTick, executionTick: null, price: null, slippage: null, latencyMs: null },
							closing: { systemTick: null, clientTick: null, orderTick: null, executionTick: null, price: null, slippage: null, latencyMs: null },
						};
						break;
					default:
						throw "Not implemented.";
				}
				if (action.stopDt) position.stopDt = action.stopDt;
				if (action.stopLoss) position.stopLoss = Math.round(action.stopLoss * 100000) / 100000;
				if (action.trailingStopLossDistance) position.trailingStopLossDistance = Math.round(action.trailingStopLossDistance * 100000) / 100000;
				if (action.takeProfit) position.takeProfit = Math.round(action.takeProfit * 100000) / 100000;
				result.push(position);
			}
			return result;
		}

		async function inspectPosition_client(clientTick, systemTick, position, testPosition)
		{
			if (!clientTick) throw "Argument is null: clientTick.";

			let closeReason = await testPosition(clientTick, position);
			if (closeReason)
			{
				const result = Object.assign({}, position);
				result.opening = Object.assign({}, position.opening);
				result.closing = Object.assign({}, position.closing);
				result.closeReason = closeReason;
				result.closing.systemTick = systemTick;
				result.closing.clientTick = clientTick;
				result.closing.orderTick = clientTick;
				return result;
			}

			return position;
		}

		function inspectPosition_system(clientTick, systemTick, position)
		{
			let closeReason = null;
			switch (position.type)
			{
				case "buy":
					if (position.trailingStopLossDistance) position.trailingStopLoss = Math.max(position.trailingStopLoss, Math.round((systemTick.bid - position.trailingStopLossDistance) * 100000) / 100000);
					if (!closeReason && position.stopLoss && systemTick.bid <= position.stopLoss) closeReason = "stopLoss";
					if (!closeReason && position.trailingStopLoss && systemTick.bid <= position.trailingStopLoss) closeReason = "trailingStopLoss";
					if (!closeReason && position.takeProfit && systemTick.bid >= position.takeProfit) closeReason = "takeProfit";
					break;
				case "sell":
					if (position.trailingStopLossDistance) position.trailingStopLoss = Math.min(position.trailingStopLoss, Math.round((systemTick.ask + position.trailingStopLossDistance) * 100000) / 100000);
					if (!closeReason && position.stopLoss && systemTick.ask >= position.stopLoss) closeReason = "stopLoss";
					if (!closeReason && position.trailingStopLoss && systemTick.ask >= position.trailingStopLoss) closeReason = "trailingStopLoss";
					if (!closeReason && position.takeProfit && systemTick.ask <= position.takeProfit) closeReason = "takeProfit";
					break;
				default:
					throw "Not implemented.";
			}
			if (!closeReason && position.stopDt && systemTick.dt >= position.stopDt) closeReason = "stopDt";

			if (closeReason)
			{
				const result = Object.assign({}, position);
				result.opening = Object.assign({}, position.opening);
				result.closing = Object.assign({}, position.closing);
				result.closeReason = closeReason;
				result.closing.systemTick = systemTick;
				result.closing.clientTick = clientTick;
				result.closing.orderTick = systemTick;
				return result;
			}

			return position;
		}
	}
}
