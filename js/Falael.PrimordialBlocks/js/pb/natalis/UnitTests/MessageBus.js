//	R0Q2/daniel/20220505
"use strict";

const { Runtime } = require("-/pb/natalis/000/Runtime.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");
const { MulticastDelegate } = require("-/pb/natalis/012/MulticastDelegate.js");
const { MessageBus } = require("-/pb/natalis/100/MessageBus.js");

module.exports =

class UnitTests_MessageBus
{
	//	Category: Unit test
	//	Function: Run unit tests for all class methods.
	static unitTest_MessageBus(result, asyncTests)
	{
		const { luid, sleep } = require("-/pb/natalis/010/Context.js");	//	needs to stay here

		asyncTests.push(async () =>
		{
			let mb, proxy, proxyUnicast, queryResponse;

			let sb = [];
			const test = (expected, testName) => { if (sb.join("") !== expected) fail(expected, testName); };
			const fail = (expected, testName, outcomeOverride) => result.push({ testName, expected, outcome: outcomeOverride === void 0 ? sb.join("") : outcomeOverride });
			const inspect = (sender, actionText, name, data, qid) => sb.push(`--${JSON.stringify(actionText)} #${name}# ${JSON.stringify(data)} (${JSON.stringify(qid)})--`);
			const messageReceived = (sender, name, data) => sb.push(`<${name}> ${JSON.stringify(data)}`);
			const dispatchMessage = (name, data, qid) => sb.push(`[${name}] ${JSON.stringify(data)} (${JSON.stringify(qid)})`);
			const respond = (sender, name, data, qid) => { sb.push(`{${name}} ${JSON.stringify(data)} (${JSON.stringify(qid)})`); return 100; };
			const respondAsync = async (sender, name, data, qid) => { await sleep(0); sb.push(`{{${name}}} ${JSON.stringify(data)} (${JSON.stringify(qid)})`); return 100; };
			const reset = () => sb = [];

			await test_post();
			await test_messageReceived();
			await test_respond();
			await test_query();

			async function test_post()
			{
				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage };
				mb = new MessageBus({ proxy: proxyUnicast });
				mb.post("");
				test("[] undefined (undefined)", "MessageBus post (001.001)");
				reset();

				await new Promise(resolve =>
				{
					proxy = null;
					if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage: async (name, data, qid) => { await sleep(0); sb.push(`[${name}] ${JSON.stringify(data)} (${JSON.stringify(qid)})`); resolve(name, data, qid) }, dispatchMessageIsAsync: false };
					else proxyUnicast = { dispatchMessage: async (name, data, qid) => { await sleep(0); sb.push(`[${name}] ${JSON.stringify(data)} (${JSON.stringify(qid)})`); resolve(name, data, qid) } };
					proxy = null;
					mb = new MessageBus({ proxy: proxyUnicast });
					mb.post("");
				});
				test("[] undefined (undefined)", "MessageBus post, async proxy.dispatchMessage (001.0011)");
				reset();

				proxyUnicast = null;																			// eslint-disable-line
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false  };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy });																	// eslint-disable-line
				mb.post("a");
				test("[a] undefined (undefined)", "MessageBus post (001.002)");
				reset();

				proxyUnicast = null;																			// eslint-disable-line
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy, inspect });														// eslint-disable-line
				mb.post("a");
				test(`--"Posting message" #a# undefined (undefined)--[a] undefined (undefined)`, "MessageBus post (001.003)");
				reset();

				proxyUnicast = null;																			// eslint-disable-line
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy, inspect });														// eslint-disable-line
				mb.post("a", 1);
				test(`--"Posting message" #a# 1 (undefined)--[a] 1 (undefined)`, "MessageBus post (001.004)");
				reset();
			}

			async function test_messageReceived()
			{
				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage };
				mb = new MessageBus({ proxy: proxyUnicast, messageReceived });
				proxyUnicast.messageReceived(proxyUnicast, "");
				test("<> undefined", "MessageBus messageReceived (002.001)");
				reset();

				proxyUnicast = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy, messageReceived });
				proxy.messageReceived(proxy, "");
				test("<> undefined", "MessageBus messageReceived (002.001a)");
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage };
				mb = new MessageBus({ proxy: proxyUnicast, messageReceived });
				proxyUnicast.messageReceived(proxyUnicast, "a");
				test("<a> undefined", "MessageBus messageReceived (002.002)");
				reset();

				proxyUnicast = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy, messageReceived });
				proxy.messageReceived(proxy, "a");
				test("<a> undefined", "MessageBus messageReceived (002.002a)");
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage };
				mb = new MessageBus({ proxy: proxyUnicast, messageReceived });
				proxyUnicast.messageReceived(proxyUnicast, "a", 1);
				test("<a> 1", "MessageBus messageReceived (002.003)");
				reset();

				proxyUnicast = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy, messageReceived });
				proxy.messageReceived(proxy, "a", 1);
				test("<a> 1", "MessageBus messageReceived (002.003a)");
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage };
				mb = new MessageBus({ proxy: proxyUnicast, messageReceived, inspect });
				proxyUnicast.messageReceived(proxyUnicast, "a", 1);
				test(`--"Message received" #a# 1 (undefined)--<a> 1`, "MessageBus messageReceived (002.004)");
				reset();

				proxyUnicast = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				mb = new MessageBus({ proxy, messageReceived, inspect });
				proxy.messageReceived(proxy, "a", 1);
				test(`--"Message received" #a# 1 (undefined)--<a> 1`, "MessageBus messageReceived (002.004a)");
				reset();

				await new Promise(resolve =>
				{
					proxy = null;
					if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
					else proxyUnicast = { dispatchMessage };
					mb = new MessageBus({ proxy: proxyUnicast, messageReceived: async (sender, name, data) => { sb.push(`<${name}> ${JSON.stringify(data)}`); resolve() } });
					proxyUnicast.messageReceived(proxyUnicast, "");
				});
				test("<> undefined", "MessageBus messageReceived async (002.005)");
				reset();
			}

			async function test_respond()
			{
				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage };
				if (!Runtime.supports("AsyncFunction:indication")) mb = new MessageBus({ proxy: proxyUnicast, respond, respondIsAsync: false, messageReceived });
				else mb = new MessageBus({ proxy: proxyUnicast, respond, messageReceived });
				proxyUnicast.messageReceived(proxyUnicast, "a", 1, 666);
				test("{a} 1 (666)[undefined] 100 (666)", "MessageBus respond (003.001)");
				if (mb.respondIsAsync) fail(true, "MessageBus respond (003.0011)", false);
				reset();

				proxyUnicast = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
				else proxy = { dispatchMessage, messageReceived: new MulticastDelegate() };
				if (!Runtime.supports("AsyncFunction:indication")) mb = new MessageBus({ proxy, respond, respondIsAsync: false, messageReceived });
				else mb = new MessageBus({ proxy, respond, messageReceived });
				proxy.messageReceived(proxy, "a", 1, 666);
				test("{a} 1 (666)[undefined] 100 (666)", "MessageBus respond (003.001a)");
				if (mb.respondIsAsync) fail(true, "MessageBus respond (003.0011a)", false);
				reset();

				await new Promise(resolve =>
				{
					if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage: (name, data, qid) => { sb.push("V"); resolve(name, data, qid) }, dispatchMessageIsAsync: false };
					else proxyUnicast = { dispatchMessage: (name, data, qid) => { sb.push("V"); resolve(name, data, qid) } };
					proxy = null;
					if (!Runtime.supports("AsyncFunction:indication")) mb = new MessageBus({ proxy: proxyUnicast, respond: respondAsync, respondIsAsync: true, inspect });
					else mb = new MessageBus({ proxy: proxyUnicast, respond: respondAsync, inspect });
					proxyUnicast.messageReceived(proxyUnicast, "a", 1, 666);
				});
				if (!mb.respondIsAsync) fail(true, "MessageBus respond (003.0021)", false);
				test(`--"Query received (async):" #a# 1 (666)--{{a}} 1 (666)--"Sending query response (async):" #undefined# 100 (666)--V`, "MessageBus respond (003.002)");
				reset();

				await new Promise(resolve =>
				{
					proxyUnicast = null;
					if (!Runtime.supports("AsyncFunction:indication")) proxy = { dispatchMessage: (name, data, qid) => { sb.push("V"); resolve(name, data, qid) }, messageReceived: new MulticastDelegate(), dispatchMessageIsAsync: false };
					else proxy = { dispatchMessage: (name, data, qid) => { sb.push("V"); resolve(name, data, qid) }, messageReceived: new MulticastDelegate() };
					if (!Runtime.supports("AsyncFunction:indication")) mb = new MessageBus({ proxy, respond: respondAsync, respondIsAsync: true, inspect });
					else mb = new MessageBus({ proxy, respond: respondAsync, inspect });
					proxy.messageReceived(proxy, "a", 1, 666);
				});
				if (!mb.respondIsAsync) fail(true, "MessageBus respond (003.0021a)", false);
				test(`--"Query received (async):" #a# 1 (666)--{{a}} 1 (666)--"Sending query response (async):" #undefined# 100 (666)--V`, "MessageBus respond (003.002a)");
				reset();
			}

			async function test_query()
			{
				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); this.messageReceived(this, void 0, data + 1, qid) }, dispatchMessageIsAsync: false };
				else proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); this.messageReceived(this, void 0, data + 1, qid) } };
				mb = new MessageBus({ proxy: proxyUnicast, inspect });
				queryResponse = await mb.query("a", 1, 666);
				test(`--"Querying" #a# 1 (666)--V--"Query result received" #undefined# 2 (666)--`, "MessageBus query (004.001)");
				if (queryResponse !== 2) fail(true, "MessageBus query (004.001a)", false);
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); this.messageReceived(this, void 0, data + 1, qid) }, dispatchMessageIsAsync: false };// eslint-disable-line
				else proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); this.messageReceived(this, void 0, data + 1, qid) } };						// eslint-disable-line
				mb = new MessageBus({ proxy: proxyUnicast, inspect, newid: luid.newGenerator(false) });						// eslint-disable-line
				queryResponse = await mb.query("a", 1);						// eslint-disable-line
				test(`--"Querying" #a# 1 (1)--V--"Query result received" #undefined# 2 (1)--`, "MessageBus query (204.001)");
				if (queryResponse !== 2) fail(true, "MessageBus query (204.001a)", false);
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); setTimeout(() => this.messageReceived(this, void 0, data + 2, qid), 0) }, dispatchMessageIsAsync: false };// eslint-disable-line
				else proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); setTimeout(() => this.messageReceived(this, void 0, data + 2, qid), 0) } };						// eslint-disable-line
				mb = new MessageBus({ proxy: proxyUnicast, inspect });																			// eslint-disable-line
				queryResponse = await mb.query("a", 1, 666);																					// eslint-disable-line
				test(`--"Querying" #a# 1 (666)--V--"Query result received" #undefined# 3 (666)--`, "MessageBus query (004.002)");
				if (queryResponse !== 3) fail(true, "MessageBus query async (004.002a)", false);
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); setTimeout(() => this.messageReceived(this, void 0, data + 2, qid), 200) }, dispatchMessageIsAsync: false };// eslint-disable-line
				else proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); setTimeout(() => this.messageReceived(this, void 0, data + 2, qid), 200) } };						// eslint-disable-line
				mb = new MessageBus({ proxy: proxyUnicast, queryTimeoutMs: 100 });																									// eslint-disable-line
				try
				{
					queryResponse = await mb.query("a", 1, 666);																														// eslint-disable-line
					fail(new Exception(0x448B5C, `Operation timeout: 100 ms, qid 666.`), "MessageBus query async, timeout (004.003)", void 0);
				}
				catch (ex)
				{
					if (ex.message !== `0x448B5C Operation timeout: 100 ms, qid 666.`) fail(new Exception(0x448B5C, `Operation timeout: 100 ms, qid 666.`), "MessageBus query async, timeout (004.003a)", ex);
				}
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); setTimeout(() => this.messageReceived(this, void 0, data + 2, qid), 200) }, dispatchMessageIsAsync: false };// eslint-disable-line
				else proxyUnicast = { dispatchMessage(name, data, qid) { sb.push("V"); setTimeout(() => this.messageReceived(this, void 0, data + 2, qid), 200) } };						// eslint-disable-line
				mb = new MessageBus({ proxy: proxyUnicast });																									// eslint-disable-line
				try
				{
					queryResponse = await mb.query("a", 1, 666, 100);																														// eslint-disable-line
					fail(new Exception(0x448B5C, `Operation timeout: 100 ms, qid 666.`), "MessageBus query async, timeout (004.103)", void 0);
				}
				catch (ex)
				{
					if (ex.message !== `0x448B5C Operation timeout: 100 ms, qid 666.`) fail(new Exception(0x448B5C, `Operation timeout: 100 ms, qid 666.`), "MessageBus query async, timeout (004.103a)", ex);
				}
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { dispatchMessage(name, data, qid) { throw new Error("test"); }, dispatchMessageIsAsync: false };// eslint-disable-line
				else proxyUnicast = { dispatchMessage(name, data, qid) { throw new Error("test"); } };						// eslint-disable-line
				mb = new MessageBus({ proxy: proxyUnicast, queryTimeoutMs: 100 });																									// eslint-disable-line
				try
				{
					queryResponse = await mb.query("a", 1, 666);																														// eslint-disable-line
					fail(new Exception(0xE74833, `Delegation failed: qid 666.`, ex), "MessageBus query async, timeout (004.004)", void 0);
				}
				catch (ex)
				{
					if (ex.message !== `0xE74833 Delegation failed: qid 666. test`) fail(`0xE74833 Delegation failed: qid 666. test`, "MessageBus query async, timeout (004.004a)", ex.message);
					if (ex.innerException.message !== "test") fail("test", "MessageBus query async, timeout (004.004b)", ex.innerException.message);
				}
				reset();

				proxy = null;
				if (!Runtime.supports("AsyncFunction:indication")) proxyUnicast = { async dispatchMessage(name, data, qid) { return new Promise((resolve, reject) => reject(new Error("test"))) }, dispatchMessageIsAsync: true };// eslint-disable-line
				else proxyUnicast = { async dispatchMessage(name, data, qid) { return new Promise((resolve, reject) => reject(new Error("test"))) } };						// eslint-disable-line
				mb = new MessageBus({ proxy: proxyUnicast, queryTimeoutMs: 100 });																									// eslint-disable-line
				try
				{
					queryResponse = await mb.query("a", 1, 666);																														// eslint-disable-line
					fail(new Exception(0xABB766, `Delegation failed: qid 666.`), "MessageBus query async, timeout (004.005)", void 0);
				}
				catch (ex)
				{
					if (ex.message !== `0xABB766 Delegation failed: qid 666. test`) fail(`0xABB766 Delegation failed: qid 666. test`, "MessageBus query async, timeout (004.005a)", ex.message);
					if (ex.innerException.message !== "test") fail("test", "MessageBus query async, timeout (004.005b)", ex.innerException.message);
				}
				reset();
			}
		});
	}
}

module.exports.UnitTests_MessageBus = module.exports;
