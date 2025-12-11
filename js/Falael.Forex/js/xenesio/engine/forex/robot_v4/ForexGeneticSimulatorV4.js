"use strict";

include("StdAfx.js");

//	chromosome is the entire array
//	gene is one number from the array
//	allele is one bit from the number
class ForexGeneticSimulatorV4
{
	constructor(par)
	{
		this._onGenerationAvailable = par.onGenerationAvailable;
		this._onSolutionAvailable = par.onSolutionAvailable;

		this._populationCount = par.populationCount;				//	integer > 0
		this._leastFitDeathRate = par.leastFitDeathRate;			//	integer > 0 < populationCount
		this._alleleCrossoverChance = par.alleleCrossoverChance;	//	[0..1]
		this._alleleMutationChance = par.alleleMutationChance;	//	[0..1]
		this._maxGenerationCount = par.maxGenerationCount;		//	integer > 0

		this._targetEquityIncreaseRatio = par.targetEquityIncreaseRatio;	//	[1..+%]
		this._simulation_intervalMin = par.simulation_intervalMin;
		this._simulation_intervalMax = par.simulation_intervalMax;
		this._simulation_sampleIntervalName = par.simulation_sampleIntervalName;
		this._transactionDelayMinMs = par.transactionDelayMinMs;
		this._transactionDelayMaxMs = par.transactionDelayMaxMs;

		this._strongChromosomes = par.strongChromosomes || [];
		if (this._populationCount - this._leastFitDeathRate <= this._strongChromosomes.length) throw "Invalid combination of arguments.";

		this._forexDataChannel = null;
		this._chromosomeInfoCache = {};
		this._stats_run = null;
		this._stats_generation = null;
	}

	async run()
	{
		this._forexDataChannel = app.db.getChannel("5d96423f5a4aa978f03002d2", await app.db.getSampleIntervalByName(this._simulation_sampleIntervalName));
		this._forexDataChannel.ensureRange(
		{
			range: new Range(this._simulation_intervalMin, this._simulation_intervalMax),
		});

		var generation = [];

		for (var i = 0; i < this._strongChromosomes.length; ++i) generation.push({ chromosome: this._strongChromosomes[i], fitness: -1, balanceChange: 0 });
		for (var length = this._populationCount - this._strongChromosomes.length, i = 0; i < length; ++i) generation.push({ chromosome: this.createRandomChromosome(), fitness: -1, balanceChange: 0 });
		this._onGenerationAvailable({ generation: generation, number: 0 });

		this._stats_run =
		{
			cacheHits: 0,
			cacheCollisions: 0,
			mutations: 0,
			crossovers: 0,
		};

		for (var i = 0; i < this._maxGenerationCount; ++i)
		{
			generation = this.runGeneration(generation, i);
			if (generation[0].fitness > 0.999)
			{
				this._onSolutionAvailable({ generation: generation, number: i });
				break;
			}
		}
	}

	//	returns [0..1]
	runGeneration(generation, number)
	{
		this._stats_generation =
		{
			bestFitness: 0,
			worstFitness: 1,
			avgFitness: 0,
			mutations: 0,
			crossovers: 0,
			tradeCount: 0,
			tradeBalance: 0,
		};

		var workingGeneration = [];
		for (var i = 0; i < generation.length; ++i) 
		{
			var item = generation[i];
			var workingItem = { chromosome: item.chromosome.slice(), fitness: item.fitness, balanceChange: item.balanceChange };
			if(i != 0) this.mutate(workingItem.chromosome);	//	don't mutate the top performer
			var debug_hasChanged = !ForexGeneticSimulatorV4._chromosomesEqual(item.chromosome, workingItem.chromosome);
			var cachedChromosomeInfo = this._lookupCachedChromosomeInfo(workingItem.chromosome);
			workingItem.fitness = cachedChromosomeInfo.fitness;
			workingItem.balanceChange = cachedChromosomeInfo.balanceChange;
			workingGeneration.push(workingItem);
		}
		workingGeneration.sort((left, right) => right.fitness - left.fitness);
		workingGeneration.splice(workingGeneration.length - this._leastFitDeathRate);
		for (var length = workingGeneration.length, i = 0; i < length; ++i) for (var j = 0; j < length; ++j) this.crossover(workingGeneration[i], workingGeneration[j]);
		for (var i = 0; i < this._leastFitDeathRate; ++i) workingGeneration.push({ chromosome: this.createRandomChromosome(), fitness: -1, balanceChange: 0 });

		this._onGenerationAvailable({ generation: workingGeneration, stats_run: this._stats_run, stats_generation: this._stats_generation, number: number });

		return workingGeneration;
	}

	runSimulation(chromosome)
	{
		//var initialBalance = 100000;
		var initialBalance = 5000;

		var forexAccount = new ForexAccount_Oanda_Simulated(
		{
			monthlyCommission: 200,
			instrumentCommission: 0,
			minimumInstrumentCommission: 0,
			marginRequirementFactor: 3.3 / 100,
			marginCallLevelPercent: 100,
			stopOutLevelPercent: 50,
			balance: initialBalance,
		});

		var settings =
		{
			minSignificantDataPointCount: 3,
			forexAccount: forexAccount,
			forexAccount_autoUpdate: true,
			transactionDelayMinMs: this._transactionDelayMinMs,
			transactionDelayMaxMs: this._transactionDelayMaxMs,
		};
		var callbacks =
		{
			openPosition: positionInfo => ++this._stats_generation.tradeCount, //log(511, "open", positionInfo),
			closePosition: positionInfo => this._stats_generation.tradeBalance += positionInfo.position.floatingAmount, //log(512, "close", EForexPositionCloseReasonV4.toString(positionInfo.reason), positionInfo.position.floatingAmount, positionInfo),
		};
		var config = ForexRobotFactoryV4.numericArrayToJsonSettings(chromosome);
		var robotFactory = new ForexRobotFactoryV4();
		var forexRobotV4 = robotFactory.createRobot(settings, callbacks, config);
		forexRobotV4.feedRange(this._forexDataChannel.rawData);
		forexAccount.closeAll();
		for (var length = forexAccount.positions.length, i = 0; i < length; ++i) log(512, "close", forexAccount.currentDt, EForexPositionCloseReasonV4.toString(EForexPositionCloseReasonV4.Shutdown), forexAccount.positions[i].floatingAmount);

		var result =
		{
			balanceChange: forexAccount.balance - initialBalance,
			fitness: 0,
		};

		if (forexAccount.balance / initialBalance >= this._targetEquityIncreaseRatio) result.fitness = 1;
		result.fitness = (forexAccount.balance / initialBalance) / this._targetEquityIncreaseRatio;

		if (!this._stats_generation.tradeCount) result.fitness = 0;
		//else result.fitness /= Math.pow(this._stats_generation.tradeCount, 1/10);

		return result;
	}


	createRandomChromosome()
	{
		var result = new Array(ForexRobotFactoryV4.lastOffset + 1);
		for (var key in ForexRobotFactoryV4.Offsets)
		{
			var i = ForexRobotFactoryV4.Offsets[key];
			var schema = ForexRobotFactoryV4.Schema[key];
			var schemaRange = schema.max - schema.min;	//	0.0001
			result[i] = ForexRobotFactoryV4.encodeAsInteger(Math.random() * schemaRange + schema.min, schema);
		}
		return result;
	}

	crossover(chromosome1, chromosome2)
	{
		var result = false;
		for (var key in ForexRobotFactoryV4.Offsets)
		{
			var i = ForexRobotFactoryV4.Offsets[key];
			var gene1 = chromosome1[i];
			var gene2 = chromosome2[i];
			var schema = ForexRobotFactoryV4.Schema[key];
			var schemaRange = schema.max - schema.min;
			var possibleValueCount = schemaRange / schema.resolution;
			//	https://stackoverflow.com/questions/7150035/calculating-bits-required-to-store-decimal-number
			var significantBitCount = Math.ceil(Math.log(possibleValueCount) / Math.log(2));

			for (var j = 0; j < significantBitCount; ++j)
			{
				if (Math.random() > this._alleleCrossoverChance) continue;
				//	https://stackoverflow.com/questions/1436438/how-do-you-set-clear-and-toggle-a-single-bit-in-javascript
				var mask = (1 << j);
				var allele1 = (gene1 & mask);
				var allele2 = (gene2 & mask);
				if (allele1) gene2 |= mask; else gene2 &= ~mask;
				if (allele2) gene1 |= mask; else gene1 &= ~mask;
				++this._stats_run.crossovers;
				++this._stats_generation.crossovers;
			}
		}
	}

	mutate(chromosome)
	{
		for (var key in ForexRobotFactoryV4.Offsets)
		{
			var i = ForexRobotFactoryV4.Offsets[key];
			var gene = chromosome[i];
			var schema = ForexRobotFactoryV4.Schema[key];
			var schemaRange = schema.max - schema.min;
			var possibleValueCount = schemaRange / schema.resolution;
			//	https://stackoverflow.com/questions/7150035/calculating-bits-required-to-store-decimal-number
			var significantBitCount = Math.ceil(Math.log(possibleValueCount) / Math.log(2));

			for (var j = 0; j < significantBitCount; ++j)
			{
				if (Math.random() > this._alleleMutationChance) continue;
				//	https://stackoverflow.com/questions/1436438/how-do-you-set-clear-and-toggle-a-single-bit-in-javascript
				gene ^= (1 << j);
				++this._stats_run.mutations;
				++this._stats_generation.mutations;
			}
		}
	}


	_lookupCachedChromosomeInfo(chromosome)
	{
		var result = null;
		var chromosomeHash = ForexGeneticSimulatorV4._hashChromosome(chromosome);
		var cachedChromosomeInfos = this._chromosomeInfoCache[chromosomeHash];
		if (!cachedChromosomeInfos)
		{
			this._chromosomeInfoCache[chromosomeHash] = cachedChromosomeInfos = [];
			var simulationResult = this.runSimulation(chromosome);
			result =
			{
				chromosome: chromosome,
				fitness: simulationResult.fitness,
				balanceChange: simulationResult.balanceChange,
			};
			cachedChromosomeInfos.push(result);
			this._stats_generation.bestFitness = Math.max(this._stats_generation.bestFitness, result.fitness);
			this._stats_generation.worstFitness = Math.min(this._stats_generation.worstFitness, result.fitness);
			return result;
		}
		for (var length = cachedChromosomeInfos.length, i = 0; i < length; ++i)
		{
			var item = cachedChromosomeInfos[i];
			if (!ForexGeneticSimulatorV4._chromosomesEqual(item.chromosome, chromosome)) continue;
			else ++this._stats_run.cacheHits;
			return item;
		}
		++this._stats_run.cacheCollisions;
		var simulationResult = this.runSimulation(chromosome);
		result =
		{
			chromosome: chromosome,
			fitness: simulationResult.fitness,
			balanceChange: simulationResult.balanceChange,
		};
		cachedChromosomeInfos.push(result);
		this._stats_generation.bestFitness = Math.max(this._stats_generation.bestFitness, result.fitness);
		this._stats_generation.worstFitness = Math.min(this._stats_generation.worstFitness, result.fitness);
		return result;
	}


	static _hashChromosome(chromosome)
	{
		var result = 0;
		for (var length = chromosome.length, i = 0; i < length; ++i) result ^= chromosome[i];
		//log(6666, chromosome.slice(), result);
		return result;
	}

	static _chromosomesEqual(chromosome1, chromosome2)
	{
		for (var length = chromosome1.length, i = 0; i < length; ++i) if (chromosome1[i] != chromosome2[i]) return false;
		return true;
	}
}
