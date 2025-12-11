//	R0Q3?/daniel/20220915
//	- TEST
"use strict";

const { Runtime } = require("-/pb/natalis/000/Runtime.js");
const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { ArgumentException, NotSupportedException } = require("-/pb/natalis/003/Exception.js");
const { timens } = require("-/pb/natalis/010/Context.js");

module.exports = 

//	Class: Facilitates sync and async function invokation quota enforcement.
class Debouncer
{
	constructor()
	{
		this._lastInvokationTime = null;
		this._asyncParallelCount = 0;
	}

	//	Function: `attempt(cooldownMs: integer, callback(): void): boolean` - invokes `callback` at first attempt and at every subsequent attempt but only if `cooldownMs` has elapsed
	//		since last invokation (last successful attempt).
	//	Parameter: `cooldownMs: integer` - required; minimum time to wait between two successful attemps, in milliseconds.
	//	Parameter: `callback(): void` - required; a synchronous non-generator function to invoke on a successful attempt.
	//	Returns: `true` if the attempt was successful, otherwise returns `false`.
	//	Remarks:
	//		An attempt is considered successful only it's the first attemp with this instance, or if `cooldownMs` has elapsed since the last successful attempt.
	//		The `callback` is invoked only on a successful attempt. The function returns without invoking the `callback` on an unsuccessful attempt.
	//	Exception: `ArgumentException`.
	attempt(cooldownMs, callback)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(cooldownMs) || cooldownMs < 0) throw new ArgumentException(0xF617AB, "cooldownMs", cooldownMs);
			if (!CallableType.isUnyielded(callback)) throw new ArgumentException(0x3317D2, "callback", callback);
		}
		const now = new Date().getTime();
		if (this._lastInvokationTime === null)
		{
			this._lastInvokationTime = now;
			callback();
			return true;
		}
		if (now - this._lastInvokationTime < cooldownMs) return false;
		this._lastInvokationTime = now;
		callback();
		return true;
	}

	//	Function: `async attemptAsync(cooldownMs: integer, async callback(): void): boolean` - invokes `callback` at first attempt and at every subsequent attempt but only if `cooldownMs`
	//		has elapsed since last invokation (last successful attempt).
	//	Parameter: `cooldownMs: integer` - required; minimum time to wait between two successful attemps, in milliseconds.
	//	Parameter: `async callback(): void` - required; an asynchronous non-generator function to invoke on a successful attempt.
	//	Parameter: `maxParallelCount: integer` - optional, defaults to `null`; a maximum number of simultaneously rinning `callback`s.
	//	Returns: `true` if the attempt was successful, otherwise returns `false`.
	//	Remarks:
	//		An attempt is considered successful only it's the first attemp with this instance, or if `cooldownMs` has elapsed since the last successful attempt and
	//			the number of simultaneously running `callback`s is less than `maxParallelCount` (if `maxParallelCount` is set).
	//		The `callback` is invoked only on a successful attempt. The function returns without invoking the `callback` on an unsuccessful attempt.
	//	Exception: `ArgumentException`.
	async attemptAsync(cooldownMs, callback, maxParallelCount = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isInteger(cooldownMs) || cooldownMs < 0) throw new ArgumentException(0x4BCD8D, "cooldownMs", cooldownMs);
			if (!CallableType.isAsyncFunction(callback)) throw new ArgumentException(0x7188DD, "callback", callback);
			if (!Type.isNU(maxParallelCount) && !Type.isInteger(maxParallelCount) || cooldownMs < 1) throw new ArgumentException(0x5DF5D2, "maxParallelCount", maxParallelCount);
		}
		if (maxParallelCount === null)
		{
			const now = new Date().getTime();
			if (this._lastInvokationTime === null)
			{
				this._lastInvokationTime = now;
				await callback();
				return true;
			}
			if (now - this._lastInvokationTime < cooldownMs) return false;
			this._lastInvokationTime = now;
			await callback();
			return true;
		}
		if (this._asyncParallelCount >= maxParallelCount) return false;
		const now = new Date().getTime();
		if (this._lastInvokationTime === null)
		{
			this._lastInvokationTime = now;
			++this._asyncParallelCount;
			try
			{
				await callback();
				return true;
			}
			finally
			{
				--this._asyncParallelCount;
			}
		}
		if (now - this._lastInvokationTime < cooldownMs) return false;
		this._lastInvokationTime = now;
		++this._asyncParallelCount;
		try
		{
			await callback();
			return true;
		}
		finally
		{
			--this._asyncParallelCount;
		}
		return true;
	}

	//	Function: `attemptNs(cooldownNs: integer, callback(): void): boolean` - invokes `callback` at first attempt and at every subsequent attempt but only if `cooldownNs` has elapsed
	//		since last invokation (last successful attempt).
	//	Parameter: `cooldownNs: integer` - required; minimum time to wait between two successful attemps, in nanoseconds.
	//	Parameter: `callback(): void` - required; a synchronous non-generator function to invoke on a successful attempt.
	//	Returns: `true` if the attempt was successful, otherwise returns `false`.
	//	Remarks:
	//		An attempt is considered successful only it's the first attemp with this instance, or if `cooldownNs` has elapsed since the last successful attempt.
	//		The `callback` is invoked only on a successful attempt. The function returns without invoking the `callback` on an unsuccessful attempt.
	//	Exception: `ArgumentException`.
	//	Exception: `NotSupportedException` - thrown if `!Runtime.supports("Timer:HR")`.
	attemptNs(cooldownNs, callback)
	{
		if (PB_DEBUG)
		{
			if (!Runtime.supports("Timer:HR")) throw new NotSupportedException(0xDF88FD);
			if (!Type.isInteger(cooldownNs) || cooldownNs < 0) throw new ArgumentException(0xBB3F52, "cooldownNs", cooldownNs);
			if (!CallableType.isUnyielded(callback)) throw new ArgumentException(0x79DAEF, "callback", callback);
		}
		if (this._lastInvokationTime === null)
		{
			this._lastInvokationTime = timens();
			callback();
			return true;
		}
		const delta = timens(this._lastInvokationTime);
		if (delta < cooldownNs) return false;
		this._lastInvokationTime = timens();
		callback();
		return true;
	}

	//	Function: `async attemptNsAsync(cooldownNs: integer, async callback(): void): boolean` - invokes `callback` at first attempt and at every subsequent attempt but only if `cooldownNs`
	//		has elapsed since last invokation (last successful attempt).
	//	Parameter: `cooldownNs: integer` - required; minimum time to wait between two successful attemps, in nanoseconds.
	//	Parameter: `async callback(): void` - required; an asynchronous non-generator function to invoke on a successful attempt.
	//	Parameter: `maxParallelCount: integer` - optional, defaults to `null`; a maximum number of simultaneously rinning `callback`s.
	//	Returns: `true` if the attempt was successful, otherwise returns `false`.
	//	Remarks:
	//		An attempt is considered successful only it's the first attemp with this instance, or if `cooldownNs` has elapsed since the last successful attempt and
	//			the number of simultaneously running `callback`s is less than `maxParallelCount` (if `maxParallelCount` is set).
	//		The `callback` is invoked only on a successful attempt. The function returns without invoking the `callback` on an unsuccessful attempt.
	//	Exception: `ArgumentException`.
	//	Exception: `NotSupportedException` - thrown if `!Runtime.supports("Timer:HR")`.
	async attemptNsAsync(cooldownNs, callback, maxParallelCount = null)
	{
		if (PB_DEBUG)
		{
			if (!Runtime.supports("Timer:HR")) throw new NotSupportedException(0x899BBA);
			if (!Type.isInteger(cooldownNs) || cooldownNs < 0) throw new ArgumentException(0x6706B4, "cooldownNs", cooldownNs);
			if (!CallableType.isAsyncFunction(callback)) throw new ArgumentException(0x76E899, "callback", callback);
			if (!Type.isNU(maxParallelCount) && !Type.isInteger(maxParallelCount) || cooldownMs < 1) throw new ArgumentException(0x123E0A, "maxParallelCount", maxParallelCount);
		}
		if (maxParallelCount === null)
		{
			if (this._lastInvokationTime === null)
			{
				this._lastInvokationTime = timens();
				await callback();
				return true;
			}
			const delta = timens(this._lastInvokationTime);
			if (delta < cooldownNs) return false;
			this._lastInvokationTime = timens();
			await callback();
			return true;
		}
		if (this._lastInvokationTime === null)
		{
			this._lastInvokationTime = timens();
			++this._asyncParallelCount;
			try
			{
				await callback();
			}
			finally
			{
				--this._asyncParallelCount;
			}
			return true;
		}
		const delta = timens(this._lastInvokationTime);
		if (delta < cooldownNs) return false;
		this._lastInvokationTime = timens();
		try
		{
			await callback();
		}
		finally
		{
			--this._asyncParallelCount;
		}
		return true;
	}
}

module.exports.Debouncer = module.exports;