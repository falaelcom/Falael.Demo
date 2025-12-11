//	R0Q2?/daniel/20230820
//  - TEST: using the same callback with multiple `ChaincastDelegate`s and `MulticastDelegate`s.
//  - TODO: implement `MulticastAsyncDelegate`
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

module.exports =

//	Class: A managed collection of callback functions.
//  Parameter: `...args` - any combination of functions and arrays of functions, including none.
//  Remarks:
//      `callback.__pbmdi` - "pbmdi" is an abbreviation of "Primordial Blocks Multicast Delegate Info". For internal use.
//      `execute` - "pbmdfn" is an abbreviation of "Primordial Blocks Multicast Delegate FuNction". For internal use.
//      If there are arguments passed to this function, they will be added as callbacks (see `MulticastDelegate.add()`).
//      Anny `MulticastDelegate` instance can be used transparently in place of a plain synchronous function.
//	Exception: `"Argument is invalid"`.
//	Exception: `"Invalid operation"`.
//	Usage:
//      `
//          const cb1 = () => {}, cb2 = () => {}, cb3 = () => {};
//          const mcd = new MulticastDelegate(cb1, [cb2, cb3]);
//          const cbref = mcd.add(() => {});
//          mcd("arg1", { arg2: true });
//          mcd.remove(cb1);
//          if(mcd.has(cb3)) mcd.remove(cb3);
//          if(mcd.has(cbref)) mcd.remove(cbref);
//      `
//		To examine exact function behavior, see `UnitTests.unitTest_MulticastDelegate`.
class MulticastDelegate
{
    constructor(...args)
    {
        this._callbacks = [];

        const result = execute.bind(this);

        result.__pbmd = true;

        //  Function: Adds a callback function to the collection.
        //  Parameter: `callback` - the callback function to add.
        //  Returns: The callback function. The callback function can be used as an argument for `MulticastDelegate.remove()` and `MulticastDelegate.has()`.
        //  Remarks: The `callback` parameter can be either a synchronous or asynchronous function. When invoked, the `MulticastDelegate` does not wait for asynchronous functions.
        //	Exception: `"Argument is invalid"`.
        //	Exception: `"Invalid operation"`.
        result.add = callback =>
        {
            if (PB_DEBUG)
            {
                if (!Type.isCallable(callback)) throw new Exception(0x579504, `Argument is invalid: "callback".`);
                if (!Type.isNU(callback.__pbmdi) && Type.getType(callback.__pbmdi) !== Type.Set) throw new Exception(0x4678C1, `Argument is invalid: "callback.__pbmdi".`);
                if (!Type.isNU(callback.__pbmdi) && callback.__pbmdi.has(this)) throw new Exception(0x90E0A1, `Invalid operation.`);
                if (this._callbacks.indexOf(callback) !== -1) throw new Exception(0xBFEF45, `Argument is invalid: "callback".`);
            }
            if (!callback.__pbmdi) callback.__pbmdi = new Set();
            this._callbacks.push(callback);
            callback.__pbmdi.add(result);
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
                    if (!Type.isCallable(jitem)) throw new Exception(0xBBE3A4, `Argument is invalid: "...args[${i}][${j}]".`);
                    if (!Type.isNU(jitem.__pbmdi) && Type.getType(jitem.__pbmdi) !== Type.Set) throw new Exception(0x256052, `Argument is invalid: "...args[${i}][${j}].__pbmdi".`);
                    if (!Type.isNU(jitem.__pbmdi) && jitem.__pbmdi.has(result)) throw new Exception(0x4727B8, `Invalid operation; related argument: ...args[${i}][${j}].`);
                }
                result.add(item[j]);
            }
            else
            {
                if (PB_DEBUG)
                {
                    if (!Type.isCallable(item)) throw new Exception(0xFFD392, `Argument is invalid: "...args[${i}]".`);
                    if (!Type.isNU(item.__pbmdi) && Type.getType(iitem.__pbmdi) !== Type.Set) throw new Exception(0xBFA310, `Argument is invalid: "...args[${i}].__pbmdi".`);
                    if (!Type.isNU(item.__pbmdi) && item.__pbmdi.has(result)) throw new Exception(0xC0FC02, `Invalid operation; related argument: ...args[${i}].`);
                }
                result.add(item);
            }
        }

        //  Function: Removes a callback function from the collection.
        //  Parameter: `arg` - the callback function to remove, as returned by `MulticastDelegate.add()`.
        //	Exception: `"Argument is invalid"`.
        //	Exception: `"Invalid operation"`.
        result.remove = arg =>
        {
            if (PB_DEBUG)
            {
                if (!Type.isCallable(arg)) throw new Exception(0x79C2E9, `Argument is invalid: "arg".`);
                if (Type.isCallable(arg) && Type.getType(arg.__pbmdi) !== Type.Set) throw new Exception(0xF3991B, `Argument is invalid: "arg.__pbmdi".`);
                if (Type.isCallable(arg) && !arg.__pbmdi.has(result)) throw new Exception(0x7A13C7, `Argument is invalid: "arg.__pbmdi".`);
                if (this._callbacks.indexOf(arg) === -1) throw new Exception(0xB7D70A, `Invalid operation.`);
            }
            this._callbacks.splice(this._callbacks.indexOf(arg), 1)[0].__pbmdi.delete(result);
        };

        //  Function: Tests whether a callback function belongs to the collection.
        //  Parameter: `arg` - the callback function to test, as returned by `MulticastDelegate.add()`.
        //  Returns: `true` if the specified callback function is present in the collection, otherwise returns `false`.
        //	Exception: `"Argument is invalid"`.
        result.has = arg =>
        {
            if (PB_DEBUG)
            {
                if (!Type.isCallable(arg)) throw new Exception(0xBB8312, `Argument is invalid: "arg".`);
            }
            if (!arg.__pbmdi) return false;
            if (!arg.__pbmdi.has(result)) return false;
            if (PB_DEBUG)
            {
                if (this._callbacks.indexOf(arg) === -1) throw new Exception(0x9F521C, `Invalid operation.`);
            }
            return true;
        };

        //  Property: Gets the internal collection of callback functions.
        //  Remarks: For diagnosic usage.
        result.getCallbacks = () =>
        {
            return this._callbacks;
        };

        return result;
    }

    //	Function: Test whether the provided `value` is a multicast delegate (see `MulticastDelegate`).
    //	Parameter: `value` - any value.
    //	Returns: `true` if the `value` is a multicast delegate, otherwise returns `false`.
    //	Remarks: To examine exact method behavior, see `UnitTests.unitTest_Type`.
    static isMulticastDelegate(value)
    {
        return value instanceof Function && value.__pbmd === true;
    }
}

function execute(...args)
{
    for (let length = this._callbacks.length, i = 0; i < length; ++i) this._callbacks[i](...args);
}

module.exports.MulticastDelegate = module.exports;
