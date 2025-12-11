"use strict";

module.exports =

class Utility_Async
{
    static async wait(intervalMs)
    {
        return new Promise((resolve, reject) =>
        {
            return setTimeout(resolve, intervalMs);
        });
    }
}