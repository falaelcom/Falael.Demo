"use strict";

class DelegateRegistry
{
	constructor()
	{
		this._delegates = new WeakMap();
	}

	add(delegate, handler)
	{
		if (!delegate) throw "Argument is null: delegate.";
		if (!handler) throw "Argument is null: handler.";
		if (this._delegates.has(delegate)) throw "Invalid operation.";
		this._delegates.set(delegate, delegate.add(handler));
	}

	remove(delegate)
	{
		if (!delegate) throw "Argument is null: delegate.";
		var delegateId = this._delegates.get(delegate);
		if (delegateId === void (0)) throw "Not found.";
		delegate.remove(delegateId);
		this._delegates.delete(delegate);
	}
}