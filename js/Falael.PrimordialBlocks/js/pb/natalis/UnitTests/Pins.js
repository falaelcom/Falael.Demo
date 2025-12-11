//	R0Q2/daniel/20220505
"use strict";

const { Pins, AsyncPins } = require("-/pb/natalis/013/Pins.js");

module.exports =

class UnitTests_Pins
{
	//	Category: Unit test
	//	Function: Run unit tests for `Pins` class.
	static unitTest_Pins(result)
	{
		const fail = testName => result.push({ testName });

		let pins, counter, outcome;

		const create = a =>
		{
			++counter;
			return { a };
		};

		const asyncCreate = async a =>
		{
			++counter;
			return new Promise(r => r({ a }));
		};

		counter = 0;
		pins = new Pins(create);
		outcome = pins(1, 5);
		if (outcome.a !== 5) fail("Pins 01");
		if (counter !== 1) fail("Pins 02");
		outcome = pins(1, 6);
		if (outcome.a !== 5) fail("Pins 03");
		if (counter !== 1) fail("Pins 04");

		counter = 0;
		pins = new Pins();
		outcome = pins(1, create, 5);
		if (outcome.a !== 5) fail("Pins 10");
		if (counter !== 1) fail("Pins 12");
		outcome = pins(1, create, 6);
		if (outcome.a !== 5) fail("Pins 12");
		if (counter !== 1) fail("Pins 13");

		counter = 0;
		pins = new Pins(create);
		outcome = pins(void 0, 5);
		if (outcome.a !== 5) fail("Pins 101");
		if (counter !== 1) fail("Pins 102");
		outcome = pins(void 0, 6);
		if (outcome.a !== 6) fail("Pins 103");
		if (counter !== 2) fail("Pins 104");

		counter = 0;
		pins = new Pins();
		outcome = pins(void 0, create, 5);
		if (outcome.a !== 5) fail("Pins 110");
		if (counter !== 1) fail("Pins 112");
		outcome = pins(void 0, create, 6);
		if (outcome.a !== 6) fail("Pins 112");
		if (counter !== 2) fail("Pins 113");
	}

	//	Category: Unit test
	//	Function: Run unit tests for `Pins.AsyncPins` class.
	static unitTest_AsyncPins(result, asyncTests)
	{
		asyncTests.push(async () =>
		{
			const fail = testName => result.push({ testName });

			let pins, counter, outcome;

			const create = a =>
			{
				++counter;
				return { a };
			};

			const asyncCreate = async a =>
			{
				++counter;
				return new Promise(r => r({ a }));
			};

			counter = 0;
			pins = new AsyncPins(asyncCreate);
			outcome = pins(1, 5);
			if (!(outcome instanceof Promise)) fail("Pins 05");
			outcome = await outcome;
			if (outcome.a !== 5) fail("Pins 06");
			if (counter !== 1) fail("Pins 07");
			outcome = await pins(1, 6);
			if (outcome.a !== 5) fail("Pins 08");
			if (counter !== 1) fail("Pins 09");

			counter = 0;		// eslint-disable-line
			pins = new AsyncPins(null);
			outcome = pins(1, create, 5);
			if (!(outcome instanceof Promise)) fail("Pins 14");
			outcome = await outcome;
			if (outcome.a !== 5) fail("Pins 15");
			if (counter !== 1) fail("Pins 16");
			outcome = await pins(1, create, 6);
			if (outcome.a !== 5) fail("Pins 17");
			if (counter !== 1) fail("Pins 18");


			counter = 0;		// eslint-disable-line
			pins = new AsyncPins(asyncCreate);
			outcome = pins(void 0, 5);
			if (!(outcome instanceof Promise)) fail("Pins 105");
			outcome = await outcome;
			if (outcome.a !== 5) fail("Pins 106");
			if (counter !== 1) fail("Pins 107");
			outcome = await pins(void 0, 6);
			if (outcome.a !== 6) fail("Pins 108");
			if (counter !== 2) fail("Pins 109");

			counter = 0;		// eslint-disable-line
			pins = new AsyncPins(null);
			outcome = pins(void 0, create, 5);
			if (!(outcome instanceof Promise)) fail("Pins 114");
			outcome = await outcome;
			if (outcome.a !== 5) fail("Pins 115");
			if (counter !== 1) fail("Pins 116");
			outcome = await pins(void 0, create, 6);
			if (outcome.a !== 6) fail("Pins 117");
			if (counter !== 2) fail("Pins 118");
		});
	}
}

module.exports.UnitTests_Pins = module.exports;
