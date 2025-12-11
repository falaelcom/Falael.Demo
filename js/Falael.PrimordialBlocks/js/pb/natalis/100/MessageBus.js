//	R0Q2?/daniel/20220504
//	- TEST
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const Runtime = require("-/pb/natalis/000/Runtime.js");
const Context = require("-/pb/natalis/010/Context.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");
const MulticastDelegate = require("-/pb/natalis/012/MulticastDelegate.js");
const TryObsolete = require("-/pb/natalis/080/TryObsolete.js");

module.exports =

//	Class: Represents an abstract message bus with the following capabilities:
//		- post message through a proxy that knows how to send out outgoing messages (`proxy.dispatchMessage` - synchronous or asychnronous);
//		- receive a message through a proxy that knows how to channel in incoming messages (`proxy.messageReceived` - synchronous or asychnronous);
//		- query a proxy (post a message and expect a response) (`MessageBus.query` - asychnronous);
//		- also supports timeout on outbound queries (`MessageBus.queryTimeoutMs`);
//		- respond to a remote query (expect a query message and respond with a query result) (`MessageBus.respond` - synchronous or asychnronous);
//		- response is delegated to a synchronous or asychnronous callback (`MessageBus.respond` - synchronous or asychnronous);
//		- optimized response with synchronous callback (`MessageBus.respond` - synchronous);
//		- inspect all significant actions via callback (`MessageBus.inspect` - synchronous or asychnronous);
//		- optimized unicast alternatives for the `inspect` and `messageReceived` callbacks.
//	Remarks: From the standpoint of the message bus, an incoming message is a message dispatched by proxy to the message bus. Incoming messages are internally received by the message bus 
//		by subscribing and listening to a proxy unicast callback or multicast delegate. An outgoing message is a message created by a message bus user via `MessageBus.post`
//		or `MessageBus.query`. The message bus then sends out a relevant message through the proxy.
//		
//		For the purposes of automatically generating unique query ids, by default this class makes use of `Context.guid()`. A custom unique id generator function can be passed as
//			the `par.newid` constructor parameter. Additionally, the `MessageBus.query` method allows query ids to be passed explicitly as an argument, which effectively prevents 
//			`Context.guid()`, respectively the custom `MessageBus.newid()` function from being called.
class MessageBus
{
	//	Parameter: `par.proxy: {dispatchMessage: function(name: string, data: any, qid: number | string): void, messageReceived: MulticastDelegate }` - defines the actual routes for the messages,
	//		i.e. knows how to dispatch a message and notifies for incoming messages.
	//		- `proxy.dispatchMessage(name: string | undefined, data: any, qid: number | string)` - required; called by the message bus to send out messages and queries; can be synchronous or
	//			asynchronous.
	//			- `name: string` - the name of the message, e.g. `"resize"`, `"application.ready"` etc.; must be undefined if the message is a response to a query.
	//			- `data: any` - the message data; can be anything; it's up to the proxy to set rules and limitations, depending on the way outgoing messages are actually dispatched.
	//			- `qid: number | string` - a query id - an id that is shared between the incoming query message and the outgoing query response.
	//		- `proxy.messageReceived: MulticastDelegate: function(sender: proxy, name: string, data: any, qid: number | string)` - optional; if the field is set,
	//			the message bus will add a callback; otherwise the message bus will set it to a single callback for optimized performance.
	//	Parameter: `par.messageReceived: function(sender: MessageBus, name: string, data: any): void` - optional; if set, this callback will be called by the message bus whenever
	//		a non-query message is received; otherwise the `MessageBus.messageReceived` property will be set to a multicast delegate, allowing multipe message bus users to subscribe for incoming 
	//		non- query messages; can be synchronous or asynchronous.
	//		- `sender: MessageBus` - this `MessageBus` instance.
	//		- `name: string` - the name of the incoming message, e.g. `"resize"`.
	//		- `data: any` - the message data; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming messages are acquired and processed.
	//	Parameter: `par.respond: function(sender: MessageBus, name: string, data: any, qid: number | string)` - optional; a syncronous or asynchronous callback to process incoming queries; also can be set to a
	//		`ChaincastDelegate` or`ChaincastAsyncDelegate`
	//		- `sender: MessageBus` - this `MessageBus` instance.
	//		- `name: string` - the name of the incoming query message, e.g. `"credentials"`.
	//		- `data: any` - the message query data; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming messages are acquired and processed.
	//		- `qid: number | string` - a query id - an id that is shared between the outgoing query message and the incoming query response; in the context of `respond`, `qid` is useful for diagnostic purposes.
	//	Parameter: `par.inspect: function(sender: MessageBus, actionText: string, name: string, data: any, qid: number | string)` - optional; if set, this callback will be called by the message bus whenever a significant messaging event occurs;
	//		otherwise the `MessageBus.inspect` property will be set to a multicast delegate, allowing multipe message bus users to subscribe.
	//		- `sender: MessageBus` - this `MessageBus` instance.
	//		- `actionText: string` - a text describing the current acction; one of the following: `"Posting message", "Querying", "Message received", "Query result received", "Query received", "Sending query response"`.
	//		- `name: string` - the name of the related incoming or outgoing message; when inspecting a received response to an outgoing query, the value of this parameter will be undefined.
	//		- `data: any` - the data of the related incoming or outgoing message; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming and
	//				outgoing messages are acquired and processed.
	//		- `qid: number | string` - the id of the related query - an id that is shared between the outgoing query message and the incoming query response; the value of this parameter will be undefined
	//				if there is query related to the current action.
	//	Parameter: `par.newid: function(): number | string` - optional, defaults to `Context.guid`; provides the means to create new query ids.
	//	Parameter: `par.queryTimeoutMs: integer` - optional, defaults to `2000` (2 seconds); specifies the timeout in milliseconds before an unanswered outbound query will be aborted (see `MessageBus.query()`).
	//		If set to a non-positive value (`<= 0`), query operations will never time out.
	//	Remarks:
	//		IMPORTANT: If `proxy.messageReceived` is not set, this `MessageBus` will internally set its own callback as a value of the `proxy` field. This behavior will modify the `proxy` instance and 
	//		effectively "bind" it to this `MessageBus`. Although such behavior generally defies the good programming practices, it allows for an important performance optimization. Nevertheless,
	//		the aforementioned behavior must be used with caution by treating such proxy instances as a defacto part of the particular `MessageBus` instnace.
	//	Exception: `"Argument is invalid"`.
	constructor({ proxy, messageReceived = null, respond = null, respondIsAsync = null, inspect = null, newid = null, queryTimeoutMs = 2000 })
	{
		if (PB_DEBUG)
		{
			if (Type.isNU(proxy)) throw new Exception(0xC35659, `Argument is invalid: "proxy".`);
			TryObsolete.argument(0x789CA5, "proxy.dispatchMessage", proxy.dispatchMessage, { match: "functionPrimitive" });
			if (!Type.isNU(proxy.dispatchMessageIsAsync) && !Type.isBoolean(proxy.dispatchMessageIsAsync)) throw new Exception(0x288735, `Argument is invalid: "proxy.dispatchMessageIsAsync".`);
			TryObsolete.argument(0xEDE4A6, "proxy.messageReceived", proxy.messageReceived, { match: "multicastDelegateNU" });
			TryObsolete.argument(0x37CEF6, "messageReceived", messageReceived, { match: "functionPrimitiveNU" });
			if (!Type.isNU(respond) && !CallableType.isFunction(respond) && !CallableType.isAsyncFunction(respond)) throw new Exception(0x282953, `Argument is invalid: "respond".`);
			if (!Type.isNU(respondIsAsync) && !Type.isBoolean(respondIsAsync)) throw new Exception(0x96F68E, `Argument is invalid: "respondIsAsync".`);
			TryObsolete.argument(0xEF9FE0, "inspect", inspect, { match: "functionNU" });
			TryObsolete.argument(0x7E46B9, "newid", newid, { match: "functionPrimitiveNU" });
			TryObsolete.argument(0xE6A901, "queryTimeoutMs", queryTimeoutMs, { match: "integer" });

			if (!Runtime.supports("AsyncFunction:indication") && !Type.isNU(respond) && Type.isNU(respondIsAsync)) throw new Exception(0xC17DA8, `Argument is invalid: "respondIsAsync".`);
			if (!Runtime.supports("AsyncFunction:indication") && Type.isNU(proxy.dispatchMessageIsAsync)) throw new Exception(0x67E8A9, `Argument is invalid: "proxy.dispatchMessageIsAsync".`);
		}

		this._proxy = proxy;
		this._proxy_dispatchMessageIsAsync = Type.isNU(proxy.dispatchMessageIsAsync) ? CallableType.hasAsyncAttribute(this._proxy.dispatchMessage) : proxy.dispatchMessageIsAsync;
		this._messageReceived = messageReceived || new MulticastDelegate();			//	performance optimization for unicast
		this._respond = respond;
		this._respondIsAsync = Type.isNU(respondIsAsync) ? CallableType.hasAsyncAttribute(respond) : respondIsAsync;
		this._inspect = inspect || new MulticastDelegate();							//	performance optimization for unicast
		this._newid = newid || Context.guid;
		this._queryTimeoutMs = queryTimeoutMs;

		if (this._proxy.messageReceived) this._proxy.messageReceived.add(this._proxy_messageReceived.bind(this));
		else this._proxy.messageReceived = this._proxy_messageReceived.bind(this);	//	performance optimization for unicast
	}

	//	Function: Sends out a message.
	//	Parameter: `name: string` - the name of the message, e.g. `"resize"`, `"application.ready"` etc.
	//	Parameter: `data: any` - the message data; can be anything; it's up to the proxy (see `MessageBus.proxy`) to set rules and limitations, depending on the way outgoing messages are actually dispatched.
	post(name, data)
	{
		this.onInspect(`Posting message`, name, data);
		this._proxy.dispatchMessage(name, data);
	}

	//	Function: Sends out a query and waits for the response.
	//	Parameter: `name: string` - the name of the query message, e.g. `"credentials"`.
	//	Parameter: `data: any` - the query message data; can be anything; it's up to the proxy (see `MessageBus.proxy`) to set rules and limitations, depending on the way outgoing messages are actually dispatched.
	//	Parameter: `qid: number | string` - an explicitly-provided query id. If this parameter is ommitted, a new id will be automatically generated via `MessageBus.newid`, which defaults to `Context.guid()`.
	//	Parameter: `timeoutMs: integer` - optional, defaults to `MessageBus.queryTimeoutMs`; specifies the timeout in milliseconds before an this query will 
	//		be aborted if unanswered. If set to a non-positive value (`<= 0`), the query operation will never time out.
	//	Returns: the data of the message received as a response to the query.
	//	Exception: `"Invalid operation"`.
	//	Exception: `"Operation timeout"`.
	//	Exception: `"Delegation failed"`.
	async query(name, data, qid = null, timeoutMs = null)
	{
		if (PB_DEBUG)
		{
			if (!Type.isNU(qid) && !(Type.isNumber(qid) || Type.isString(qid))) throw new Exception(0x121BF2, `Argument is invalid: "qid".`);
			if (!Type.isNU(timeoutMs) && !Type.isInteger(timeoutMs)) throw new Exception(0xFA0FD4, `Argument is invalid: "timeoutMs".`);
		}

		if (timeoutMs === null) timeoutMs = this._queryTimeoutMs;

		if (qid === null || qid === void 0) qid = this._newid();
		this.onInspect(`Querying`, name, data, qid);
		return new Promise((resolve, reject) =>
		{
			let cb_queryResultReceived = null;
			const unsubscribe = () =>
			{
				if (cb_queryResultReceived !== null)
				{
					this._queryResultReceived.remove(cb_queryResultReceived);
					cb_queryResultReceived = null;
				}
			}

			let timerId = -1;
			if (timeoutMs > 0) timerId = setTimeout(() =>
			{
				unsubscribe();
				reject(new Exception(0x448B5C, `Operation timeout: ${timeoutMs} ms, qid ${JSON.stringify(qid)}.`));
			}, timeoutMs);

			cb_queryResultReceived = this._queryResultReceived.add((sender, resultData, resultQid) =>
			{
				if (PB_DEBUG)
				{
					if (sender !== this) throw new Exception(0x20CE0E, `Invalid operation: qid ${JSON.stringify(qid)}.`);
				}
				if (resultQid !== qid) return;
				if (timerId !== -1) clearTimeout(timerId);
				unsubscribe();
				resolve(resultData);
			});

			if (!this._proxy_dispatchMessageIsAsync)
			{
				try
				{
					this._proxy.dispatchMessage(name, data, qid);
				}
				catch (ex)
				{
					if (timerId !== -1) clearTimeout(timerId);
					unsubscribe();
					reject(new Exception(0xE74833, `Delegation failed: qid ${JSON.stringify(qid)}.`, ex));
				}
			}
			else
			{
				this._proxy.dispatchMessage(name, data, qid).catch(ex =>
				{
					if (timerId !== -1) clearTimeout(timerId);
					unsubscribe();
					reject(new Exception(0xABB766, `Delegation failed: qid ${JSON.stringify(qid)}.`, ex));
				});
			}
		});
	}

	//	Function: If set invokes the `inspect` unicast or multicast callbacks.
	//	Parameter: `actionText` - a text describing the current acction; internal calls of this method will provide one of the following as a value: `"Posting message", "Querying",
	//		"Message received", "Query result received", "Query received", "Sending query response"`.
	//	Parameter: `name: string` - the name of the related incoming or outgoing message; when inspecting a received response to an outgoing query, the value of this parameter must be undefined.
	//	Parameter: `data: any` - the data of the related incoming or outgoing message; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming and
	//		outgoing messages are acquired and processed.
	//	Parameter: `qid: number | string` - the id of the related query - an id that is shared between the outgoing query message and the incoming query response; the value of this parameter must be undefined
	//		if there is query related to the current action.
	onInspect(actionText, name, data, qid)
	{
		this._inspect && this._inspect(this, actionText, name, data, qid);
	}

	//	Function: If set invokes the `messageReceived` unicast or multicast callbacks, preceded by an invokation of `inspect("Message received", ...)` (see `MessageBus.onInspect()`).
	//	Parameter: `name: string` - the name of the message, e.g. `"resize"`, `"application.ready"` etc.
	//	Parameter: `data: any` - the message data; can be anything; it's up to the proxy to set rules and limitations, depending on the way outgoing messages are actually dispatched.
	onMessageReceived(name, data)
	{
		this.onInspect(`Message received`, name, data);
		this._messageReceived && this._messageReceived(this, name, data);
	}

	//	Function: If set invokes the internal `_queryResultReceived` unicast or multicast callbacks, preceded by an invokation of `inspect("Query result received", ...)` (see `MessageBus.onInspect()`).
	//	Parameter: `data: any` - the query response data; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming messages are acquired and processed.
	//	Parameter: `qid: number | string` - the id of the original query.
	onQueryResultReceived(data, qid)
	{
		this.onInspect(`Query result received`, void 0, data, qid);
		this._queryResultReceived && this._queryResultReceived(this, data, qid);
	}

	//	Function: Synchronously handles an incoming query request by synchronously invloking `MessageBus.respond` and then dispatching the response via `proxy.dispatchMessage()`.
	//		Invokes also `inspect("Query received", ...)`  and `inspect("Sending query response", ...)` (see `MessageBus.onInspect()`).
	//	Parameter: `name: string` - the name of the query message, e.g. `"credentials"`.
	//	Parameter: `data: any` - the query message data; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming messages are actually dispatched.
	//	Parameter: `qid: number | string` - the id of the incoming query - an id that is shared between the outgoing query message and the incoming query response.
	//	Exception: `"Invalid operation"`.
	onQueryReceived(name, data, qid)
	{
		if (PB_DEBUG)
		{
			if (this._respondIsAsync) throw new Exception(0xA7E449, `Invalid operation.`);
		}
		this.onInspect(`Query received`, name, data, qid);
		const result = (this._respond || null) && this._respond(this, name, data, qid);
		if (PB_DEBUG)
		{
			if (Type.getType(result) === Type.Promise) throw new Exception(0x2FD612, `Invalid operation.`);
		}
		this.onInspect(`Sending query response:`, void 0, result, qid);
		this._proxy.dispatchMessage(void 0, result, qid);
	}

	//	Function: Asynchronously handles an incoming query request by asynchronously invloking `MessageBus.respond` and then dispatching the response via `proxy.dispatchMessage()`.
	//		Invokes also `inspect("Query received", ...)`  and `inspect("Sending query response", ...)` (see `MessageBus.onInspect()`).
	//	Parameter: `name: string` - the name of the query message, e.g. `"credentials"`.
	//	Parameter: `data: any` - the query message data; can be anything; it's up to the proxy to set rules and limitations, depending on the way incoming messages are actually dispatched.
	//	Parameter: `qid: number | string` - the id of the incoming query - an id that is shared between the outgoing query message and the incoming query response.
	//	Exception: `"Invalid operation"`.
	async onQueryReceivedAsync(name, data, qid)
	{
		if (PB_DEBUG)
		{
			if (!this._respondIsAsync) throw new Exception(0x500B55, `Invalid operation.`);
		}
		this.onInspect(`Query received (async):`, name, data, qid);
		const outcome = this._respond(this, name, data, qid);
		if (PB_DEBUG)
		{
			if (Type.getType(outcome) !== Type.Promise) throw new Exception(0xF6C59C, `Invalid operation.`);
		}
		const result = await outcome;
		this.onInspect(`Sending query response (async):`, void 0, result, qid);
		this._proxy.dispatchMessage(void 0, result, qid);
	}


	_proxy_messageReceived(sender, name, data, qid)
	{
		if (PB_DEBUG)
		{
			if (sender !== this._proxy) throw new Exception(0x622473, `Invalid operation.`);
		}
		if (qid === void 0) this.onMessageReceived(name, data);
		else if (name === void 0) this.onQueryResultReceived(data, qid);
		else if (this._respondIsAsync) this.onQueryReceivedAsync(name, data, qid);
		else this.onQueryReceived(name, data, qid);
	}


	//	Property: Gets the instance of `proxy` as set in the `MessageBus` constructor.
	get proxy()
	{
		return this._proxy;
	}

	//	Property: Gets the `messageReceived` unicast callback or `MulticastDelegate`.
	//	Returns: a unicast callback or a `MulticastDelegate`.
	//	Remarks: If a `messageReceived` unicast callback has been passed to the `MessageBus` constructor, there is no legitimate way to switch to multicast delegate. Otherwise,
	//		multiple subscibers are able to listen for new messages via `messageBus.messageReceived.add(callback)`.
	get messageReceived()
	{
		return this._messageReceived;
	}

	//	Property: Gets the `respond` unicast callback.
	//	Returns: a unicast callback or `null` or `undefined`.
	//	Remarks: The `respond` unicast callback can be either synchronous or asynchronous. To tell which one is the case, use `CallableType.hasAsyncAttribute(messageBus.respond)`.
	get respond()
	{
		return this._respond;
	}

	//	Property: Gets the `inspect` unicast callback or `MulticastDelegate`.
	//	Returns: a unicast callback or a `MulticastDelegate`.
	get inspect()
	{
		return this._inspect;
	}

	//	Property: Gets the `inspect` unicast callback or `MulticastDelegate`.
	//	Returns: an integer.
	get queryTimeoutMs()
	{
		return this._queryTimeoutMs;
	}

	//	Property: Gets a value that indicates whether the `respond` callback is an asynchronous function.
	//	Returns: a boolean.
	get respondIsAsync()
	{
		return this._respondIsAsync;
	}


	_queryResultReceived = new MulticastDelegate();
	}

module.exports.MessageBus = module.exports;
