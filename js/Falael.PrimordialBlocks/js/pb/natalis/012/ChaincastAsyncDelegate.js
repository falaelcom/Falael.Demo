//	R0Q3?/daniel/20220411
//  - TODO: add a method to undo the last `put` (like `pop` or sth)
//  - TEST: using the same callback with multiple `ChaincastAsyncDelegate`s and `MulticastDelegate`s.
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

module.exports =

//	Class: A managed chain of callback functions.
//  Parameter: `...args` - any combination of functions and arrays of functions, including none.
//  Remarks:
//      `callback.__pbcdi` - "pbcdi" is an abbreviation of "Primordial Blocks Chaincast Delegate Info". For internal use.
//      `MulticastDelegate.__pbcdfn` - "pbcdfn" is an abbreviation of "Primordial Blocks Chaincast Delegate FuNction". For internal use.
//      If there are arguments passed to this function, they will be put as callbacks in the order of appearance with the latest callback firts (see `ChaincastAsyncDelegate.put()`).
//      Callbacks are `put` at the top of the chain, and are invoked from head to tail, meaning that callbacks `put` last will be invoked first.
//      Callbacks will be invoked with one extra argument (`next: function | void 0`) added at the end of the argument list. Calling `next` will invoke the next callback in the chain, but is
//          not mandatory. If a callback determines so it can return without invoking the rest of the chain by not calling `next`. If the current callback is executed at the bottom of the
//          chain, `next` will be undefined. As a consequence, every callback must test if `next` is set before calling it (e.g. `next && next()`).
//      Unlike the `MulticastDelegate`, which ignores values returned by callbacks, the invokation of `ChaincastAsyncDelegate` returns the return value of the top callback, which in turn may return
//          the return value of the `next` callback, and so on; each callback can decide for itself whether to provide own return value or to return the return value of the `next` callback.
//      Anny `ChaincastAsyncDelegate` instance can be used transparently in place of a plain synchronous function.
//	Exception: `"Argument is invalid"`.
//	Exception: `"Invalid operation"`.
//	Usage:
//      `
//          const cb1 = async (v, next) => String(v) + (next ? await next(v) : ""), cb2 = async (v, next) => v === 1 ? "STOP" : next && await next(v), cb3 = async (v, next) => String(v) + (next ? await next(v) : "");
//          const ccd = new ChaincastAsyncDelegate(cb1, [cb2, cb3]);
//          const cbref = ccd.put(next => next && await next());
//          const outcome1 = await ccd(1);
//          const outcome2 = await ccd("arg1");
//          ccd.remove(cb1);
//          if(ccd.has(cb3)) ccd.remove(cb3);
//          if(ccd.has(cbref)) ccd.remove(cbref);
//      `
//		To examine exact function behavior, see `UnitTests.unitTest_ChaincastAsyncDelegate`.
class ChaincastAsyncDelegate
{
    constructor(...args)
    {
        this._top = void 0;

        function findParent(callback, top)
        {
            let m = top;
            while (m !== void 0 && m.n !== void 0)
            {
                if (m.n.c === callback) return m;
                m = m.n;
            }
            return null;
        }

        const result = execute.bind(this);

        result.__pbcad = true;

        //  Function: Puts an asynchronous callback function on the top of the chain.
        //  Parameter: `callback` - an asynchronous callback function to put.
        //  Returns: The callback function. The callback function can be used as an argument for `ChaincastAsyncDelegate.remove()` and `ChaincastAsyncDelegate.has()`.
        //  Remarks: The `callback` parameter is required to be an asynchronous function.
		//	Exception: `"Argument is invalid"`.
		//	Exception: `"Invalid operation"`.
        result.put = callback =>
        {
            if (PB_DEBUG)
            {
                if (!CallableType.isAsyncFunction(callback)) throw new Exception(0x5773B0, `Argument is invalid: "callback".`);
                if (!Type.isNU(callback.__pbcdi) && Type.getType(callback.__pbcdi) !== Type.Set) throw new Exception(0x64A5C8, `Argument is invalid: "callback.__pbcdi".`);
                if (!Type.isNU(callback.__pbcdi) && callback.__pbcdi.has(this)) throw new Exception(0x25B76F, `Invalid operation.`);
                if (this._top !== void 0 && (this._top === callback || findParent(callback, this._top) !== null)) throw new Exception(0x4611F7, `Argument is invalid: "callback".`);
            }
            if (!callback.__pbcdi) callback.__pbcdi = new Set();
            callback.__pbcdi.add(result);
            const item = this._top =
            {
                n: this._top,
                c: callback,
            };
            item.f = async function (...args)
            {
                return await this.c(...args, this.n ? this.n.f : void 0);
            }.bind(item);
            return callback;
        };

        for (let length = args.length, i = 0; i < length; ++i)
        {
            const item = args[i];
            if (Type.isArray(item)) for (let jlength = item.length, j = 0; j < jlength; ++j)
            {
                const jitem = item[j];
                if (PB_DEBUG)
                {
                    if (!CallableType.isAsyncFunction(jitem)) throw new Exception(0x48ECB7, `Argument is invalid: "...args[${i}][${j}]".`);
                    if (!Type.isNU(jitem.__pbcdi) && Type.getType(jitem.__pbcdi) !== Type.Set) throw new Exception(0x83A5A4, `Argument is invalid: "...args[${i}][${j}].__pbcdi".`);
                    if (!Type.isNU(jitem.__pbcdi) && jitem.__pbcdi.has(result)) throw new Exception(0x39C655, `Invalid operation; related argument: ...args[${i}][${j}].`);
                    if (this._top !== void 0 && (this._top === jitem || findParent(jitem, this._top) !== null)) throw new Exception(0x3BA382, `Argument is invalid; related argument: ...args[${i}][${j}].`);
                }
                result.put(item[j]);
            }
            else
            {
                if (PB_DEBUG)
                {
                    if (!CallableType.isAsyncFunction(item)) throw new Exception(0xBB4602, `Argument is invalid: "...args[${i}]".`);
                    if (!Type.isNU(item.__pbcdi) && Type.getType(item.__pbcdi) !== Type.Set) throw new Exception(0x5331D8, `Argument is invalid: "...args[${i}].__pbcdi".`);
                    if (!Type.isNU(item.__pbcdi) && item.__pbcdi.has(result)) throw new Exception(0x701774, `Invalid operation; related argument: ...args[${i}].`);
                    if (this._top !== void 0 && (this._top === item || findParent(item, this._top) !== null)) throw new Exception(0x79A4E0, `Argument is invalid; related argument: ...args[${i}].`);
                }
                result.put(item);
            }
        }

        //  Function: Removes the callback function currently at the top of the chain.
		//	Exception: `"Invalid operation"`.
        result.lift = () =>
        {
            if (PB_DEBUG)
            {
                if (this._top === void 0) throw new Exception(0xE00699, `Invalid operation.`);
            }
            this._top.c.__pbcdi.delete(result);
            this._top = this._top.n;
        };

        //  Function: Removes a callback function from the chain.
        //  Parameter: `arg` - the callback function to remove, as returned by `ChaincastAsyncDelegate.put()`.
		//	Exception: `"Argument is invalid"`.
		//	Exception: `"Invalid operation"`.
        result.remove = arg =>
        {
            if (PB_DEBUG)
            {
                if (!CallableType.isAsyncFunction(arg)) throw new Exception(0x8B4205, `Argument is invalid: "arg".`);
                if (CallableType.isAsyncFunction(arg) && Type.getType(arg.__pbcdi) !== Type.Set) throw new Exception(0x5799D1, `Argument is invalid: "arg.__pbcdi".`);
                if (CallableType.isAsyncFunction(arg) && !arg.__pbcdi.has(result)) throw new Exception(0x14D33B, `Argument is invalid: "arg.__pbcdi".`);
                if (this._top === void 0 || (this._top.c !== arg && findParent(arg, this._top) === null)) throw new Exception(0xFE241F, `Invalid operation.`);
            }
            if (this._top.c === arg)
            {
                this._top.c.__pbcdi.delete(result);
                this._top = this._top.n;
                return;
            }
            const p = findParent(arg, this._top);
            p.n.c.__pbcdi.delete(result);
            p.n = p.n.n;
        };

        //  Function: Tests whether a callback function belongs to the chain.
        //  Parameter: `arg` - the callback function to test, as returned by `ChaincastAsyncDelegate.put()`.
        //  Returns: `true` if the specified callback function is present in the chain, otherwise returns `false`.
		//	Exception: `"Argument is invalid"`.
        result.has = arg =>
        {
            if (PB_DEBUG)
            {
                if (!CallableType.isAsyncFunction(arg)) throw new Exception(0x95618D, `Argument is invalid: "arg".`);
            }
            if (!arg.__pbcdi) return false;
            if (!arg.__pbcdi.has(result)) return false;
            if (PB_DEBUG)
            {
                if (this._top === void 0 || (this._top.c !== arg && findParent(arg, this._top) === null)) throw new Exception(0xB13DA7, `Invalid operation.`);
            }
            return true;
        };

        //  Property: Gets a collection of all chained callback functions, with the last put callback first.
        //  Remarks: For diagnosic usage.
        result.getCallbacks = () =>
        {
            const result = [];
            let m = this._top;
            while (m !== void 0)
            {
                result.push(m.c);
                m = m.n;
            }
            return result;
        };

        return result;
    }
}

async function execute(...args)
{
    return this._top && await this._top.c(...args, this._top.n ? this._top.n.f : void 0);
}

module.exports.ChaincastAsyncDelegate = module.exports;
