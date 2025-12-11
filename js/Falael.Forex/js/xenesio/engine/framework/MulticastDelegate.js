"use strict";

function MulticastDelegate()
{
    this.callbackSet = {};
    this.callbackList = [];
};

MulticastDelegate.prototype.add = function (func)
{
    if (!func._multicastDelegateId)
    {
        ++MulticastDelegate._counter;
        func._multicastDelegateId = MulticastDelegate._counter;
    }
    else if (this.callbackSet[func._multicastDelegateId])
    {
        return 0;
    }

    this.callbackSet[func._multicastDelegateId] = func;
    this.callbackList.push(func);

    return func._multicastDelegateId;
};

MulticastDelegate.prototype.remove = function (multicastDelegateId)
{
    if (!this.callbackSet[multicastDelegateId])
    {
        return false;
    }

    delete this.callbackSet[multicastDelegateId];

    for (var length = this.callbackList.length, i = 0; i < length; ++i)
    {
        var item = this.callbackList[i];
        if(item._multicastDelegateId == multicastDelegateId)
        {
            this.callbackList.splice(i, 1);
            return true;
        }
    }

    throw "Invalid state.";
};

MulticastDelegate.prototype.executeSync = function (par1, par2, par3, par4, par5, par6, par7)
{
    for (var length = this.callbackList.length, i = 0; i < length; ++i)
    {
        this.callbackList[i](par1, par2, par3, par4, par5, par6, par7);
    }
};

MulticastDelegate.prototype.execute = async function (par1, par2, par3, par4, par5, par6, par7)
{
    for (var length = this.callbackList.length, i = 0; i < length; ++i)
    {
		var func = this.callbackList[i];
		if (func.constructor.name === "AsyncFunction")
		{
			await func(par1, par2, par3, par4, par5, par6, par7);
			continue;
		}
		func(par1, par2, par3, par4, par5, par6, par7);
    }
};

MulticastDelegate._counter = 0;