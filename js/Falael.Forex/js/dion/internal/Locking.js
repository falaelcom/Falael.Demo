"use strict";

const ObjectID = require("mongodb").ObjectID;

const TimeoutException = require("@framework/TimeoutException.js");
const DbException = require("@framework/DbException.js");
const UnexpectedException = require("@framework/UnexpectedException.js");

const Utility = require("@framework/Utility.js");

const acquireLock_retryAttemptIntervalMs = 25;
const acquireLock_timeoutMs = 5000;

module.exports = class Locking
{
    constructor()
    {
    }

	static async acquireLock(par)
	{
		const key = par.key;
		const pid = par.pid;
		const coll = par.coll;
		const force = par.force;

		const retryAttemptIntervalMs = par.retryAttemptIntervalMs || acquireLock_retryAttemptIntervalMs;
		const timeoutMs = par.timeoutMs || acquireLock_timeoutMs;

		try
		{
			await db.collection(key).createIndex(

				{ pid: 1, coll: 1 },
				{ unique: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		const startTime = new Date().getTime();
		return new Promise(async (resolve, reject) =>
		{
			try
			{
				let lockInfo;
				while (new Date().getTime() - startTime <= timeoutMs)
				{
					try
					{
						const updateWriteOpResult = await db.collection(key).findOneAndUpdate(

							{ pid: ObjectID(pid), coll: coll },
							{ $set: { lock: true } },
							{ upsert: true }
						);
						if (!updateWriteOpResult.ok) return reject(new DbException(updateWriteOpResult));
						lockInfo = updateWriteOpResult.value;
						if (!lockInfo)
						{
							lockInfo =
							{
								_id: ObjectID(updateWriteOpResult.lastErrorObject.upserted),
								pid: ObjectID(pid),
								coll: coll,
								lock: false,
								validRegions: [],
							};
						}
					}
					catch (ex)
					{
						return reject(new DbException(ex));
					}
					if (force || !lockInfo.lock)
					{
						return resolve(lockInfo);
					}
					await Utility.Async.wait(retryAttemptIntervalMs);
				}
				return reject(new TimeoutException(new Date().getTime() - startTime));
			}
			catch (ex)
			{
				return reject(new UnexpectedException(ex));
			}
		});
	}

	static async releaseLock(par)
	{
		const key = par.key;
		const lockInfo = par.lockInfo;

		return new Promise(async (resolve, reject) =>
		{
			try
			{
				lockInfo.lock = false;
				await db.collection(key).findOneAndUpdate(

					{ _id: lockInfo._id },
					{ $set: lockInfo }
				);
				return resolve();
			}
			catch (ex)
			{
				return reject(new UnexpectedException(ex));
			}
		});
	}
}
