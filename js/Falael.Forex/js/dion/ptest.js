"use strict";

const addon = require('../../cpp/napi/test/build/Release/main');

const Server = require("mongodb").Server;
const MongoClient = require("mongodb").MongoClient;

function test_forLoop(iterationCount)
{
	let z = 3;
	const step = function(z)
	{
		let result = z;
		for (let i = 0; i < 1000; ++i) result = (result * 2 + 1) / 2;
		return result;
	}

	console.time("for-loop");
	for (let i = 0; i < iterationCount; ++i) z = step(z);
	console.timeEnd("for-loop");
	console.log("for-loop result", z);
}

function test_forLoop_cpp(iterationCount)
{
	console.time("for-loop-cpp");
	const result = addon.testLoop(iterationCount);
	console.timeEnd("for-loop-cpp");
	console.log("for-loop-cpp result", result);
}

async function test_mongoInitVm()
{
	console.time("mongo-init: vm");
	const server = new Server("192.168.56.13", 27017);
	global.mongoClientVm = await MongoClient.connect(server, {});
	global.dbVm = mongoClientVm.db("ptest");
	console.timeEnd("mongo-init: vm");
}

async function test_mongoRequestsVm()
{
	const iterationCount = 10000;
	const step = async function (createIndex)
	{
		if (createIndex)
		{
			await dbVm.collection("counters").createIndex(

				{ name: 1 },
				{ unique: true }
			);
		}

		await dbVm.collection("counters").updateOne({ name: "test" }, { $inc: { value: 1 } });
	}

	console.time("mongo-requests: vm");
	for (let i = 0; i < iterationCount; ++i) step();
	console.timeEnd("mongo-requests: vm");
}

async function test_mongoInitWin64()
{
	console.time("mongo-init: win64");
	const server = new Server("localhost", 27017);
	global.mongoClientWin64 = await MongoClient.connect(server, {});
	global.dbWin64 = mongoClientWin64.db("ptest");
	console.timeEnd("mongo-init: win64");
}

async function test_mongoRequestsWin64()
{
	const iterationCount = 10000;
	const step = async function (createIndex)
	{
		if (createIndex)
		{
			await dbWin64.collection("counters").createIndex(

				{ name: 1 },
				{ unique: true }
			);
		}

		await dbWin64.collection("counters").updateOne({ name: "test" }, { $inc: { value: 1 } });
	}

	console.time("mongo-requests: win64");
	for (let i = 0; i < iterationCount; ++i) step();
	console.timeEnd("mongo-requests: win64");
}


(async function ()
{
	const forLoop_iterationCount = 100000;
	test_forLoop(forLoop_iterationCount);
	test_forLoop_cpp(forLoop_iterationCount);
//	await test_mongoInitVm();
//	await test_mongoRequestsVm();
//	await test_mongoInitWin64();
//	await test_mongoRequestsWin64();
//	mongoClientVm.close();
//	mongoClientWin64.close();
})();

console.log('Press any key to exit');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
