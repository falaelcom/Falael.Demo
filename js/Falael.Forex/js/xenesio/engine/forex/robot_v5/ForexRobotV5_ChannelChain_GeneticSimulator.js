"use strict";

include("StdAfx.js");

//	chromosome is the entire array
//	gene is one number from the array
//	allele is one bit from the number
class ForexRobotV5_ChannelChain_GeneticSimulator
{
	constructor(par)
	{
		this._forexRobotV5_ChannelChain_Factory = par.forexRobotV5_ChannelChain_Factory;

		this._onProgress = par.onProgress;
		this._onGenerationAvailable = par.onGenerationAvailable;
		this._onSolutionAvailable = par.onSolutionAvailable;

		this._populationCount = par.populationCount;				//	integer > 0
		this._leastFitDeathRate = par.leastFitDeathRate;			//	integer > 0 < populationCount
		this._alleleCrossoverChance = par.alleleCrossoverChance;	//	[0..1]
		this._alleleMutationChance = par.alleleMutationChance;	//	[0..1]
		this._maxGenerationCount = par.maxGenerationCount;		//	integer > 0

		this._simulation_instrumentId = par.simulation_instrumentId;
		this._simulation_sampleIntervalName = par.simulation_sampleIntervalName;
		this._simulation_pageSizeMs = par.simulation_pageSizeMs;
		this._simulation_channelMode = par.simulation_channelMode;
		this._simulation_maxChannelDataPointCount = par.simulation_maxChannelDataPointCount;
		this._simulation_ranges = par.simulation_ranges;

		this._strongChromosomes = par.strongChromosomes || [];
		if (this._populationCount - this._leastFitDeathRate <= this._strongChromosomes.length) throw "Invalid combination of arguments.";

		this._sampleIntervalDef = null;
		this._forexDataChannel = null;
		this._chromosomeInfoCache = {};
		this._stats_run = null;
		this._stats_generation = null;
	}

	async run()
	{
		this._sampleIntervalDef = await app.db.getSampleIntervalByName(this._simulation_sampleIntervalName);
		this._forexDataChannel = app.db.getChannel(this._simulation_instrumentId, this._sampleIntervalDef);
		//if (this._forexDataChannel.cachedDataPointCount > 10000) dbChannel._dataBuffer.clear();
		//for (var length = this._simulation_ranges.length, i = 0; i < length; ++i) await this._forexDataChannel.ensureRange(this._simulation_ranges[i].roundUp(0.5));

		var generation = [];

		for (var i = 0; i < this._strongChromosomes.length; ++i) generation.push({ chromosome: this._strongChromosomes[i], fitness: -1, metrics: null });
		for (var length = this._populationCount - this._strongChromosomes.length, i = 0; i < length; ++i) generation.push({ chromosome: ForexRobotV5_ChannelChain_Factory.createRandomChromosome(), fitness: -1, metrics: null });
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
			generation = await this.runGeneration(generation, i);
			//if (generation[0].fitness == 1)
			//{
			//	this._onSolutionAvailable({ generation: generation, number: i });
			//	break;
			//}
		}
	}

	//	returns [0..1]
	async runGeneration(generation, number)
	{
		this._stats_generation =
		{
			bestFitness: 0,
			worstFitness: 1,
			avgFitness: 0,
			mutations: 0,
			crossovers: 0,
		};

		var workingGeneration = [];
		for (var i = 0; i < generation.length; ++i) 
		{
			var min = await this._forexDataChannel.getAllDataStartMs();
			var max = await this._forexDataChannel.getAllDataEndMs() - 1000 * 60 * 60 * 24 * 7;
			this._simulation_ranges = new ForexRangerV5({ dow: [4] }).randomRanges(min, max, Math.ceil(Math.log2(number + 1)));

			var item = generation[i];
			var workingItem = { chromosome: item.chromosome.slice(), fitness: item.fitness, metrics: item.metrics };
			//var debug_hasChanged = !ForexRobotV5_ChannelChain_GeneticSimulator._chromosomesEqual(item.chromosome, workingItem.chromosome);
			var cachedChromosomeInfo = await this._lookupCachedChromosomeInfo(workingItem.chromosome, { generationNumber: number, individualNumber: i, individualCount: generation.length });
			workingItem.fitness = cachedChromosomeInfo.fitness;
			workingItem.metrics = cachedChromosomeInfo.metrics;
			workingGeneration.push(workingItem);

			this._stats_generation.bestFitness = Math.max(this._stats_generation.bestFitness, workingItem.fitness);
			this._stats_generation.worstFitness = Math.min(this._stats_generation.worstFitness, workingItem.fitness);
		}
		var preservationCount = 3;
		workingGeneration.sort((left, right) => right.fitness - left.fitness);
		var mostFit = [];
		for (var length = preservationCount, i = 0; i < length; ++i) mostFit.push(JSON.parse(JSON.stringify(workingGeneration[i])));
		workingGeneration.splice(workingGeneration.length - this._leastFitDeathRate - preservationCount);
		for (var length = workingGeneration.length, i = 0; i < length; ++i)
		{
			for (var j = 0; j < length; ++j) if (i != j) this.crossover(workingGeneration[i].chromosome, workingGeneration[j].chromosome);
			this.mutate(workingGeneration[i].chromosome);
		}
		for (var length = mostFit.length, i = 0; i < length; ++i) workingGeneration.push(mostFit[i]);
		for (var i = 0; i < this._leastFitDeathRate; ++i) workingGeneration.push({ chromosome: ForexRobotV5_ChannelChain_Factory.createRandomChromosome(), fitness: -1, metrics: null });
		workingGeneration.sort((left, right) => right.fitness - left.fitness);

		this._onGenerationAvailable({ generation: workingGeneration, stats_run: this._stats_run, stats_generation: this._stats_generation, number: number });

		return workingGeneration;
	}

	async runSimulation(chromosome, prorgessInfo)
	{
		if (!ForexRobotV5_ChannelChain_Factory.validateChromosome(chromosome))
		{
			var result =
			{
				fitness: 0,
				metrics: null,
			};
			return result;
		}

		var channelFeatures = [];
		var totalDuration = 0;
		for (var length = this._simulation_ranges.length, i = 0; i < length; ++i)
		{
			if (this._forexDataChannel.cachedDataPointCount > 15000) this._forexDataChannel._dataBuffer.clear();

			var item = this._simulation_ranges[i];

			var settings =
			{
				instrumentId: this._simulation_instrumentId,
				pageSizeMs: this._simulation_pageSizeMs,
				channelMode: this._channelMode,
				maxChannelDataPointCount: this._simulation_maxChannelDataPointCount,
				minSignificantDataPointCount: 3,
				progress: (args) =>
				{
					this._onProgress(
					{
						generationNumber: prorgessInfo.generationNumber,
						individualNumber: prorgessInfo.individualNumber,
						individualCount: prorgessInfo.individualCount,
						individualRangeNumber: i,
						individualRangeCount: length,
						individualProgress: args,
						stats: this._stats_generation,
						stats_run: this._stats_run,
					});
				},
			};

			var config = ForexRobotV5_ChannelChain_Factory.numericArrayToJsonSettings(chromosome);
			var robotFactory = new ForexRobotV5_ChannelChain_Factory();
			var robot = robotFactory.createRobot(settings, config);
			robot.initialize(this._sampleIntervalDef);
			await robot.buildRange(item);

			totalDuration += Math.max(item.max, robot.channelChain.length ? robot.channelChain[robot.channelChain.length - 1].lastDt : 0) - item.min;
			channelFeatures = channelFeatures.concat(robot.channelChain);
		}

		return ForexRobotV5_ChannelChain_GeneticSimulator.chainCcsc_fitnessCheck(channelFeatures, totalDuration);
	}


	crossover(chromosome1, chromosome2)
	{
		var result = false;
		for (var key in ForexRobotV5_ChannelChain_Factory.Offsets)
		{
			var i = ForexRobotV5_ChannelChain_Factory.Offsets[key];
			var gene1 = chromosome1[i];
			var gene2 = chromosome2[i];
			var schema = ForexRobotV5_ChannelChain_Factory.Schema[key];
			var schemaRange = schema.max - schema.min;
			var possibleValueCount = 1 + schemaRange / schema.resolution;
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
				chromosome1[i] = gene1;
				chromosome2[i] = gene2;
				++this._stats_run.crossovers;
				++this._stats_generation.crossovers;
			}
		}
	}

	mutate(chromosome)
	{
		for (var key in ForexRobotV5_ChannelChain_Factory.Offsets)
		{
			var i = ForexRobotV5_ChannelChain_Factory.Offsets[key];
			var gene = chromosome[i];
			var schema = ForexRobotV5_ChannelChain_Factory.Schema[key];
			var schemaRange = schema.max - schema.min;
			var possibleValueCount = 1 + schemaRange / schema.resolution;
			//	https://stackoverflow.com/questions/7150035/calculating-bits-required-to-store-decimal-number
			var significantBitCount = Math.ceil(Math.log(possibleValueCount) / Math.log(2));

			for (var j = 0; j < significantBitCount; ++j)
			{
				if (Math.random() > this._alleleMutationChance) continue;
				//	https://stackoverflow.com/questions/1436438/how-do-you-set-clear-and-toggle-a-single-bit-in-javascript
				gene ^= (1 << j);
				chromosome[i] = gene;
				++this._stats_run.mutations;
				++this._stats_generation.mutations;
			}
		}
	}


	async _lookupCachedChromosomeInfo(chromosome, progressInfo)
	{
		var result = null;
		var chromosomeHash = ForexRobotV5_ChannelChain_GeneticSimulator._hashChromosome(chromosome);
		var cachedChromosomeInfos = this._chromosomeInfoCache[chromosomeHash];
		if (!cachedChromosomeInfos)
		{
			this._chromosomeInfoCache[chromosomeHash] = cachedChromosomeInfos = [];
			var simulationResult = await this.runSimulation(chromosome, progressInfo);
			result =
			{
				chromosome: chromosome,
				fitness: simulationResult.fitness,
				metrics: simulationResult.metrics,
			};
			cachedChromosomeInfos.push(result);
			return result;
		}
		for (var length = cachedChromosomeInfos.length, i = 0; i < length; ++i)
		{
			var item = cachedChromosomeInfos[i];
			if (!ForexRobotV5_ChannelChain_GeneticSimulator._chromosomesEqual(item.chromosome, chromosome)) continue;
			else ++this._stats_run.cacheHits;
			return item;
		}
		++this._stats_run.cacheCollisions;
		var simulationResult = await this.runSimulation(chromosome, progressInfo);
		result =
		{
			chromosome: chromosome,
			fitness: simulationResult.fitness,
			metrics: simulationResult.metrics,
		};
		cachedChromosomeInfos.push(result);
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


	static chainCcsc_fitnessCheck(channelFeatures, totalDuration)
	{
		var result =
		{
			fitness: 0,
			metrics: null,
		};

		if (!channelFeatures.length) return result;
		if (channelFeatures[channelFeatures.length - 1].isBroken) return result;
		if (!totalDuration) return result;

		var movementInfo = ForexRobotV5_ChannelChain.movementInfo(channelFeatures);
			
		result.fitness = MappedArray.sigmoid(Math.pow(10, 9) * movementInfo.sdTotalMovement / totalDuration);
		result.metrics = {};
		result.metrics.totalMovement = movementInfo.totalMovement;
		result.metrics.totalDuration = totalDuration;
		result.metrics.movementPerDay = Math.round(1000 * 1000 * 60 * 60 * 24 * movementInfo.totalMovement / totalDuration) / 1000;

		return result;
	}

		//var valueRating = 1 - MappedArray.fnorm(0.9, 2 * MappedArray.sigmoid(ldNInfo.value / (60 * 60 * 1000)) - 1);

		//var ratings =
		//[
		//	{ weight: 1,  value: raRating },
		//	{ weight: 2,  value: valueRating },
		//	{ weight: 15, value: robot.correlationRating },
		//	{ weight: 4,  value: robot.ccscCountRating },
		//];

		//result.fitness = MappedArray.calcWeightedAverage(ratings);

	static channelParity_fitnessCheck(robot)
	{
		var result =
		{
			fitness: 0,
			metrics: null,
		};

		if (!robot.channelChain.length) return result;
		if (robot.isBroken) return result;

		var countRating = MappedArray.ifnorm(-0.999, MappedArray.sigmoid(robot.channelChain.length));

		var parityRating = 0;
		var goodNeighbouringCount = 0;
		var correlationRating = 0;
		var correlationRating_sum = 0;
		if (robot.channelChain.length >= 2) 
		{
			correlationRating_sum = robot.channelChain[0].lineOfBestFitInfo.lineOfBestFit_pointSample.correlationCoefficient("x", "y");
			for (var length = robot.channelChain.length, i = 1; i < length; ++i)
			{
				var left = robot.channelChain[i - 1];
				var right = robot.channelChain[i];
				if (Math.sign(left.lineOfBestFitInfo.lineOfBestFit_trendLine.a) != Math.sign(right.lineOfBestFitInfo.lineOfBestFit_trendLine.a))++goodNeighbouringCount;
				try
				{
					correlationRating_sum += right.lineOfBestFitInfo.lineOfBestFit_pointSample.correlationCoefficient("x", "y");
				}
				catch(ex)
				{
					log(5236354, ex);
				}
			}
			parityRating = goodNeighbouringCount / (robot.channelChain.length - 1);
			correlationRating = correlationRating_sum / robot.channelChain.length;
		}

		result.fitness = (countRating + 7 * correlationRating + 9 * parityRating) / 17;
		result.metrics =
		{
			channelCount: robot.channelChain.length,
			goodNeighbouringCount: goodNeighbouringCount,
			countRating: countRating,
			parityRating: parityRating,
			correlationRating: correlationRating,
		};

		return result;
	}

	static channelParity_fitnessCombine(fitnessInfos)
	{
		var result =
		{
			fitness: null,
			metrics:
			{
				channelCount: null,
				goodNeighbouringCount: null,
				countRating: null,
				parityRating: null,
				correlationRating: null,
				fitnessInfos: fitnessInfos,
			}
		};

		var fitness_sum = 0;
		var countRating_sum = 0;
		var parityRating_sum = 0;
		var correlationRating_sum = 0;
		for (var length = fitnessInfos.length, i = 0; i < length; ++i)
		{
			var item = fitnessInfos[i];
			if (item.metrics) result.metrics.channelCount += item.metrics.channelCount;
			if (item.metrics) result.metrics.goodNeighbouringCount += item.metrics.goodNeighbouringCount;

			fitness_sum += item.fitness;
			if (item.metrics) countRating_sum += item.metrics.countRating;
			if (item.metrics) parityRating_sum += item.metrics.parityRating;
			if (item.metrics) correlationRating_sum += item.metrics.correlationRating;
		}
		result.fitness = fitness_sum / fitnessInfos.length;
		if (fitnessInfos.length) result.metrics.countRating = countRating_sum / fitnessInfos.length;
		if (fitnessInfos.length) result.metrics.parityRating = parityRating_sum / fitnessInfos.length;
		if (fitnessInfos.length) result.metrics.correlationRating = correlationRating_sum / fitnessInfos.length;

		return result;
	}
}
