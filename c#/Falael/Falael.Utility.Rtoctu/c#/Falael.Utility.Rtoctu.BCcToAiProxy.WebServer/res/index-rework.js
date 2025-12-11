//#region Utility Functions

function esc(text)
{
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

function assert(condition, text)
{
	if (!condition) throw new Error(text || "Assertion failed");
}

function log(...args)
{
	console.log(...args);
}

//#endregion

//#region Client

class Client
{
	static endpoints =
	{
		CHECK_NEW_DATA: '/is_valid',
		READ_ALL_CHATS: '/list_chats',
		READ_CHAT_BY_ID: '/read_chat_by_id',
		POST_MESSAGE: '/post_message',
		POST_MESSAGE_STREAMING: '/post_message_streaming',
		DELETE_MESSAGE: '/delete_message',
	}
	static serverUrl = "http://localhost:3523";

	validTimestamp = 0;

	constructor()
	{
	}

	async queryIsValid()
	{
		const url = `${Client.serverUrl}${Client.endpoints.CHECK_NEW_DATA}?validTimestamp=${this.validTimestamp}`;
		const response = await $.get(url);
		assert(response === "true" || response === "false");
		return response === "true";
	}

	async queryChatList()
	{
		const url = `${Client.serverUrl}${Client.endpoints.READ_ALL_CHATS}`;
		const response = await $.get(url);
		assert(typeof response.validTimestamp === "number");
		assert(response.chats);
		this.validTimestamp = response.validTimestamp;
		return response.chats;
	}

	async queryChat(id)
	{
		const url = `${Client.serverUrl}${Client.endpoints.READ_CHAT_BY_ID}`;
		const response = await $.get(url, { id });
		assert(typeof response.validTimestamp === "number");
		assert(response.history);
		this.validTimestamp = response.validTimestamp;
		return response.history;
	}

	async deleteMessage(chatId, index)
	{
		const url = `${Client.serverUrl}${Client.endpoints.DELETE_MESSAGE}` + "?id=" + encodeURIComponent(chatId) + "&index=" + index;
		await $.ajax({
			url,
			method: 'DELETE'
		});
	}
}

//#endregion

//#region DomSurface

class DomSurface
{
	chatList_get()
	{
		const chats = [];
		$("chat-list .chat-item").each(function ()
		{
			const $item = $(this);
			const id = $item.data("chat-id");
			if (!id) return;

			const title = $item.find(".chat-title").text();
			const time = $item.find(".chat-time").text();

			chats.push({ id, title, time });
		});
		return chats;
	}

	chatList_getSelectedId()
	{
		const $selected = $("#chat-list .chat-item.active");
		if ($selected.length !== 1) return null;
		const result = $selected.data("chat-id");
		assert(result);
		return result;
	}

	chatList_refreshList({ created, deleted, updated })
	{
		assert(created);
		assert(deleted);
		assert(updated);

		const resultCreated = [];
		const resultUpdated = [];
		const resultDeleted = [];

		for (const ex of deleted)
		{
			const $item = $(`#chat-list .chat-item[data-chat-id="${ex.id}"]`);
			if ($item.length)
			{
				resultDeleted.push(ex.id);
				$item.remove();
			}
		}

		for (const u of updated)
		{
			const $item = $(`#chat-list .chat-item[data-chat-id="${u.current.id}"]`);
			if ($item.length)
			{
				$item.find(".chat-title").text(u.current.title);
				$item.find(".chat-time").text(u.current.time);
				resultUpdated.push(u.current.id);
			}
		}

		for (const inc of created)
		{
			const classes = ["chat-item", "new-chat"];
			const html = `
				<div class="${classes.join(" ")}" data-chat-id="${inc.id}">
					<div class="chat-title">${esc(inc.title)}</div>
					<div class="chat-time">${esc(inc.time)}</div>
				</div>
			`;
			const $elem = $(html);
			$("#chat-list").append($elem);
			resultCreated.push(inc.id);
		}

		// re-sort all items by time (desc), just like original renderChatList
		const items = $("chat-list .chat-item").get();
		items.sort((a, b) =>
			new Date($(b).find(".chat-time").text()) -
			new Date($(a).find(".chat-time").text())
		);
		$("#chat-list").append(items);

		return {
			created: resultCreated,
			updated: resultUpdated,
			deleted: resultDeleted,
		};
	}

	chatList_refreshSelectedItem(selectedId)
	{
		assert(selectedId);
		$(".chat-item").removeClass("active");
		const $selected = $(`#chat-list .chat-item[data-chat-id="${selectedId}"]`);
		$selected.addClass("active").removeClass("new-chat");
		return $selected[0];
	}

	chatList_wireUpEventHandlers({ created }, { created_onClick })
	{
		assert(created_onClick);
		for (const id of created)
		{
			const $elem = $(`#chat-list .chat-item[data-chat-id="${id}"]`);
			if ($elem.length) 
			{
				$elem.off("click", created_onClick);
				$elem.on("click", created_onClick);
			}
		}
	}

	messages_recreate(messages)
	{
		assert(messages);

		const resultCreated = [];
		const container = $("#chat-content");

		const messagesHtml = messages.map((message, index) =>
		{
			const contentHtml = marked.parse(message.content);
			return `
			<div class="message ${message.role}" data-message-index="${index}">
				<div class="role">${esc(message.role)}</div>
				<div class="content">${contentHtml}</div>
				<i class="material-icons delete-btn" title="Delete message">delete</i>
			</div>
		`;
		}).join("");

		container.html(messagesHtml);

		let i = 0;
		container.find(".message").each(function ()
		{
			resultCreated.push(i);
			++i;
		});

		return { created: resultCreated };
	}

	messages_wireUpEventHandlers({ created_onDeleteClick })
	{
		assert(created_onDeleteClick);
		const $btns = $(`#chat-content .message .delete-btn`);
		$btns.off("click", created_onDeleteClick);
		$btns.on("click", created_onDeleteClick);
	}

	messages_delete(index)
	{
		assert(typeof index === "number");
		const resultDeleted = [];
		const container = $("#chat-content");

		// find all messages with data-message-index >= index
		container.find(`.message`).each(function ()
		{
			const msgIndex = $(this).data("message-index");
			if (msgIndex >= index)
			{
				resultDeleted.push(msgIndex);
				$(this).remove();
			}
		});

		return { deleted: resultDeleted };
	}
}

//#endregion

//#region Orchestration

//class Queue
//{
//	items = [];

//	enqueue(value)
//	{
//		this.items.push(value);
//	}
//	dequeue()
//	{
//		assert(this.items.length);
//		return this.items.shift();
//	}
//	peek()
//	{
//		assert(this.items.length);
//		return this.items[this.items.length];
//	}
//	getCount()
//	{
//		return this.items.length;
//	}
//	isEmpty()
//	{
//		return this.items.length == 0;
//	}
//}

const MergeDecision =
{
	Discard: 1,
	Replace: 2,
	Enqueue: 3,
}

class StateItem
{
	time;
	value;

	constructor(time, value)
	{
		assert(time != null);

		this.time = time;
		this.value = value;
	}

	getTime() { return this.time; }
	getValue() { return this.value; }
}

//class PriorityState
//{
//	fnMerge;
//	fnItemEnqueued;
//	item = null;

//	constructor({ fnMerge, fnItemEnqueued })
//	{
//		assert (fnMerge != null);
//		assert (fnItemEnqueued != null);

//		this.fnMerge = fnMerge;
//		this.fnItemEnqueued = fnItemEnqueued;
//	}

//	enqueue(value, time = new Date())
//	{
//		const { mergeDecision, newItem } = this.fnMerge(new StateItem(time, value), this.item);
//		switch (mergeDecision)
//		{
//			case MergeDecision.Discard: return;
//			case MergeDecision.Enqueue: throw new Error();
//			case MergeDecision.Replace:
//				const oldItem = this.item;
//				this.item = newItem;
//				this.fnItemEnqueued(this, { oldItem, item: newItem });
//				break;
//			default: throw new Error(mergeDecision);
//		}
//	}
//	dequeue()
//	{
//		const result = this.item;
//		this.item = null;
//		return result;
//	}
//	peek()
//	{
//		return this.item;
//	}
//	getCount()
//	{
//		return this.item ? 1 : 0;
//	}
//	isEmpty()
//	{
//		return this.item ? false : true;
//	}
//}

class PriorityQueue
{
	fnMerge;
	fnItemEnqueued;
	items = [];

	constructor({ fnMerge, fnItemEnqueued })
	{
		assert(fnMerge != null);
		assert(fnItemEnqueued != null);

		this.fnMerge = fnMerge;
		this.fnItemEnqueued = fnItemEnqueued;
	}

	enqueue(value, time = new Date())
	{
		let replacedItems;
		let replaceItem;
		for (let i = this.items.length - 1; i >= 0; --i)
		{
			const item = this.items[i];
			const { mergeDecision, newItem } = this.fnMerge(new StateItem(time, value), item);
			switch (mergeDecision)
			{
				case MergeDecision.Discard: return;
				case MergeDecision.Enqueue:
					this.items.push(new StateItem(time, value));
					this.fnItemEnqueued(this, { oldItem: item, item: newItem });
					return;
				case MergeDecision.Replace:
					(replacedItems = replacedItems || []).push(item);
					replaceItem = newItem;
					continue;
				default: throw new Error(mergeDecision);
			}
		}
		assert(replacedItems);
		this.items.length -= replacedItems.length;
		this.items.push(replaceItem);
		this.fnItemEnqueued(this, { oldItem: replacedItems[0], oldItems: replacedItems, item: replaceItem });
	}
	dequeue()
	{
		assert(this.items.length != 0);
		return this.items.shift();
	}
	peek()
	{
		assert(this.items.length != 0);
		return this.items[0];
	}
	getCount()
	{
		return this.items.length;
	}
	isEmpty()
	{
		return this.items.length == 0;
	}
}

const CommandState =
{
	Pending: 1,
	Running: 2,
	Completed: 3,
}

class Command
{
	priority;	//	higher values - higher priorities
	type;
	executeCallback;
	result;
	commandState;

	constructor(priority, type, executeCallback)
	{
		this.priority = priority;
		this.type = type;
		this.executeCallback = executeCallback;

		this.result = null;
		this.commandState = CommandState.Pending;
	}

	async execute(context)
	{
		assert(!this.commandState);

		this.commandState = CommandState.Running;
		try
		{
			this.result = await this.executeCallback(context);
		}
		finally
		{
			this.commandState = CommandState.Completed;
		}

		return this;
	}

	getType() { return this.type; }
	getResult() { return this.result; }
	getCommandState() { return this.commandState; }
}

//#endregion

//#region Client Commands

Command.QueryIsValid = class extends Command
{
	constructor(client)
	{
		assert(client !== null);
		super(1000, Command.QueryIsValid, () => client.queryIsValid());
	}
}

Command.QueryChatList = class extends Command
{
	constructor(client)
	{
		assert(client !== null);
		super(3000, Command.QueryChatList, () => client.queryChatList());
	}
}

Command.QueryChat = class extends Command
{
	constructor(client, id)
	{
		assert(client !== null);
		super(2000, Command.QueryChat, () => client.queryChat(id));
	}
}

Command.DeleteMessage = class extends Command
{
	constructor(client, chatId, index)
	{
		assert(client !== null);
		super(5000, Command.DeleteMessage, 1000, () =>
		{
			client.deleteMessage(chatId, index)
			return index;
		});
	}
}

//#endregion

//#region UI Commands

Command.ChatList_RefreshList = class extends Command
{
	constructor(domSurface, chatList)
	{
		assert(domSurface !== null);
		super(20000, Command.ChatList_RefreshList, () =>
		{
			return domSurface.chatList_refreshList(Command.ChatList_RefreshList.getChatListDelta(chatList, domSurface.chatList_get()));
		});
	}

	static getChatListDelta(incoming, existing)
	{
		const created = [];
		const deleted = [];
		const updated = [];

		// new or updated
		for (const inc of incoming)
		{
			const ex = existing.find(e => e.id === inc.id);
			if (!ex)
			{
				created.push(inc);
			}
			else if (ex.title !== inc.title || ex.time !== inc.time)
			{
				updated.push({ old: ex, current: inc });
			}
		}

		// deleted
		for (const ex of existing)
		{
			const inc = incoming.find(i => i.id === ex.id);
			if (!inc)
			{
				deleted.push(ex);
			}
		}

		return { created, deleted, updated };
	}
}

Command.ChatList_RefreshSelectedItem = class extends Command
{
	constructor(domSurface, selectedItemId)
	{
		assert(domSurface !== null);
		super(20000, Command.ChatList_RefreshSelectedItem, () =>
		{
			return domSurface.chatList_refreshSelectedItem(selectedItemId);
		});
	}
}

Command.ChatList_WireUpEventHandlers = class extends Command
{
	constructor(domSurface, chatListIds, { created_onClick })
	{
		assert(domSurface !== null);
		super(10000, Command.ChatList_WireUpEventHandlers, () =>
		{
			return domSurface.chatList_wireUpEventHandlers(chatListIds, { created_onClick });
		});
	}
}

Command.Messages_Recreate = class extends Command
{
	constructor(domSurface, messages)
	{
		assert(domSurface !== null);
		super(15000, Command.Messages_Recreate, () =>
		{
			return domSurface.messages_recreate(messages);
		});
	}
}

Command.Messages_WireUpEventHandlers = class extends Command
{
	constructor(domSurface, { created_onDeleteClick })
	{
		assert(domSurface !== null);
		super(10000, Command.Messages_WireUpEventHandlers, () =>
		{
			return domSurface.messages_wireUpEventHandlers({ created_onDeleteClick });
		});
	}
}

Command.Messages_Delete = class extends Command
{
	constructor(domSurface, index)
	{
		assert(domSurface !== null);
		super(20000, Command.Messages_Delete, () =>
		{
			return domSurface.messages_delete(index);
		});
	}
}

//#endregion

class ChatApp2
{
	//#region Construction

	states_mutex = false;

	constructor()
	{
		this.client_commandPriorityQueue.enqueue(new Command.QueryChatList(this.client));
		setInterval(() =>
		{
			this.client_commandPriorityQueue.enqueue(new Command.QueryChatList(this.client));
		}, 1000);
	}

	//#endregion

	//#region Command Queue

	commandQueue_mutex = false;
	commandQueue = new PriorityQueue(
	{
		fnMerge: (newItem, oldItem) =>
		{
			if (!oldItem) return { mergeDecision: MergeDecision.Enqueue, newItem };
			const newValue = newItem.getValue();
			if (this.ui_stateQueue.find(oldItem => oldItem.getValue().getType() == newValue.getType())) return { mergeDecision: MergeDecision.Discard };
			return { mergeDecision: MergeDecision.Enqueue, newItem };
		},
		fnItemEnqueued: (sender, { oldItem, item }) => this.client_command_signal(),
	});


	//#endregion

	//#region Client

	client_mutex = false;
	client = new Client();
	client_commandPriorityQueue = new PriorityQueue(
	{
		fnMerge: (newItem, oldItem) =>
		{
			if (!oldItem) return { mergeDecision: MergeDecision.Enqueue, newItem };
			const newValue = newItem.getValue();
			if (this.ui_stateQueue.find(oldItem => oldItem.getValue().getType() == newValue.getType())) return { mergeDecision: MergeDecision.Discard };
			return { mergeDecision: MergeDecision.Enqueue, newItem };
		},
		fnItemEnqueued: (sender, { oldItem, item }) => this.client_command_signal(),
	});
	client_state = new PriorityQueue(
	{
		fnMerge: (newItem, oldItem) =>
		{
			if (!oldItem) return { mergeDecision: MergeDecision.Replace, newItem };
			const oldValue = oldItem.getValue();
			const newValue = newItem.getValue();
			if (oldValue.getType() === newValue.getType()) return { mergeDecision: MergeDecision.Discard };
			switch (oldValue.getType())
			{
				case Command.QueryIsValid: return { mergeDecision: MergeDecision.Replace, newItem };
				case Command.QueryChatList:
					switch (newValue.getType())
					{
						case Command.QueryIsValid: return { mergeDecision: MergeDecision.Discard };
						case Command.QueryChat: return { mergeDecision: MergeDecision.Replace, newItem };		//	potential to mask invalid chat list, will set latest validtimestamp w/o refreshing the chatlist 
						case Command.DeleteMessage: return { mergeDecision: MergeDecision.Replace, newItem };	//	doesn't respect validtimestamp, isvalid on timer will trigger refresh
						default: throw new Error(newValue.getType().name);
					}
				case Command.QueryChat:
					switch (newValue.getType())
					{
						case Command.QueryIsValid: return { mergeDecision: MergeDecision.Discard };
						case Command.QueryChatList: return { mergeDecision: MergeDecision.Discard };			//	potential to skip valid chat list refresh
						case Command.DeleteMessage: return { mergeDecision: MergeDecision.Replace, newItem };	//	doesn't respect validtimestamp, isvalid on timer will trigger refresh
						default: throw new Error(newValue.getType().name);
					}
				case Command.DeleteMessage:
					switch (newValue.getType())
					{
						case Command.QueryIsValid: return { mergeDecision: MergeDecision.Discard };
						case Command.QueryChatList: return { mergeDecision: MergeDecision.Discard };
						case Command.QueryChat: return { mergeDecision: MergeDecision.Discard };				//	Command.DeleteMessage doesn't respect validtimestamp, isvalid on timer will trigger refresh
						default: throw new Error(newValue.getType().name);
					}
				default: throw new Error(oldValue.getType().name);
			}
		},
		fnItemEnqueued: (sender, { oldItem, item }) => this.states_signal(),
	});
	client_command_signal()
	{
		if (this.client_mutex === true) return;
		this.client_mutex = true;
		const f = async () =>
		{
			if (this.client_commandPriorityQueue.isEmpty())
			{
				this.client_mutex = false;
				return;
			}
			try
			{
				const command = this.client_commandPriorityQueue.dequeue();
				assert(command.getCommandState() === CommandState.Pending);
				this.client_state.enqueue(await command.execute());
			}
			catch (ex)
			{
				console.error(ex);
			}
			finally
			{
				this.defer(f);
			}
		};
		this.defer(f);
	}

	//#endregion

	//#region UI

	ui_mutex = false;
	ui_domSurface = new DomSurface();
	ui_commandQueue = new PriorityQueue(
	{
		fnMerge: (newItem, oldItem) =>
		{
			if (!oldItem) return { mergeDecision: MergeDecision.Enqueue, newItem };
			const newValue = newItem.getValue();
			if (this.ui_stateQueue.find(oldItem => oldItem.getValue().getType() == newValue.getType())) return { mergeDecision: MergeDecision.Discard };
			return { mergeDecision: MergeDecision.Enqueue, newItem };
		},
		fnItemEnqueued: (sender, { oldItem, item }) => this.states_signal(),
	});
	ui_stateQueue = new PriorityQueue(
	{
		fnMerge: (newItem, oldItem) =>
		{
			if (!oldItem) return { mergeDecision: MergeDecision.Enqueue, newItem };
			const newValue = newItem.getValue();
			if (this.ui_stateQueue.find(oldItem => oldItem.getValue().getType() == newValue.getType()) ) return { mergeDecision: MergeDecision.Discard };
			return { mergeDecision: MergeDecision.Enqueue, newItem };
		},
		fnItemEnqueued: (sender, { oldItem, item }) => this.states_signal(),
	});
	ui_command_signal()
	{
		if (this.ui_mutex === true) return;
		this.ui_mutex = true;
		const f = async () =>
		{
			if (this.ui_commandQueue.isEmpty())
			{
				this.ui_mutex = false;
				return;
			}
			try
			{
				const command = this.ui_commandQueue.dequeue();
				assert(command.getCommandState() === CommandState.Pending);
				this.ui_stateQueue.enqueue(await command.execute());
			}
			catch (ex)
			{
				console.error(ex);
			}
			finally
			{
				this.defer(f);
			}
		};
		this.defer(f);
	}

	//#endregion

	//#region State

	states_signal()
	{
		if (this.states_mutex === true) return;
		this.states_mutex = true;
		const f = () =>
		{
			let handled = false;
			try
			{
				if (!this.client_state.isEmpty())
				{
					handled = true;
					var state = this.client_state.dequeue();

					var command = state.getValue();
					assert(command.getCommandState() === CommandState.Completed);
					var commandType = state.getValue().getType();

					switch (commandType)
					{
						case Command.QueryIsValid:
							{
								if (command.getResult() === true) break;
								this.client_commandPriorityQueue.enqueue(new Command.QueryChatList(this.client));
								break;
							}
						case Command.QueryChatList:
							{
								this.ui_commandQueue.enqueue(new Command.ChatList_RefreshList(this.ui_domSurface, command.getResult()));
								this.ui_command_signal();
								break;
							}
						case Command.QueryChat:
							{
								const outcome = command.getResult();
								this.ui_commandQueue.enqueue(new Command.ChatList_RefreshSelectedItem(this.ui_domSurface, outcome.id));
								this.ui_commandQueue.enqueue(new Command.Messages_Recreate(this.ui_domSurface, outcome.history));
								this.ui_command_signal();
								break;
							}
						case Command.DeleteMessage:
							{
								const outcome = command.getResult();
								this.ui_commandQueue.enqueue(new Command.Messages_Delete(this.ui_domSurface, outcome));
								this.ui_command_signal();
								break;
							}
						default: throw new Error(commandType.name);
					}
				}
				if (!this.ui_stateQueue.isEmpty())
				{
					handled = true;
					var state = this.ui_stateQueue.dequeue();

					var command = state.getValue();
					assert(command.getCommandState() === CommandState.Completed);
					var commandType = state.getValue().getType();

					switch (commandType)
					{
						case Command.ChatList_RefreshList:
							const ids = command.getResult();
							this.ui_commandQueue.enqueue(new Command.ChatList_WireUpEventHandlers(this.ui_domSurface, ids,
							{
								created_onClick: function () { this.ui_commandQueue.enqueue(new Command.QueryChat(this.client, $(this).data("chat-id"))); }
							}));
							this.ui_command_signal();
							break;
						case Command.ChatList_RefreshSelectedItem:
							break;
						case Command.ChatList_WireUpEventHandlers:
							break;
						case Command.Messages_Recreate:
							this.ui_commandQueue.enqueue(new Command.Messages_WireUpEventHandlers(this.ui_domSurface, 
							{
								created_onDeleteClick: function ()
								{
									const container = $(this).closest("chat-content");
									const chatId = container.data("chat-id");
									const index = $(this).closest(".message").data("message-index");
									this.ui_commandQueue.enqueue(new Command.DeleteMessage(this.client, chatId, index));
								}.bind(this)
							}));
							this.ui_command_signal();
							break;
						case Command.Messages_Delete:
							break;
						default: throw new Error(commandType.name);
					}
				}
			}
			catch (ex)
			{
				console.error(ex);
			}
			finally
			{
				if (handled) this.defer(f);
				else this.states_mutex = false;
			}
		};
		this.defer(f);
	}

	//#endregion

	defer(f)
	{
		setTimeout(f.bind(this), 0);
	}
}

class ChatApp
{
	constructor()
	{
		this.validTimestamp = 0;
		this.currentChatId = null;
		this.isUpdating = false;
		this.newChats = new Set();
		this.scrollPosition = 0;

		this.loaderTimer = null;
		this.loaderVisible = false;

		this.streamingAssistantElem = null;

		this.init();
	}

	init()
	{
		this.setupEventListeners();
		this.loadChatList();
		this.startPeriodicCheck();
	}

	setupEventListeners()
	{
		$('#message-input').on('keydown', (e) =>
		{
			if (e.key === 'Enter' && !e.shiftKey)
			{
				e.preventDefault();
				this.sendMessage();
			}
		});

		$('#scroll-top-btn').on('click', () =>
		{
			$('#chat-content').scrollTop(0);
			$('#message-input').focus();
		});

		$('#scroll-bottom-btn').on('click', () =>
		{
			this.scrollToBottom();
			$('#message-input').focus();
		});

		$('#scroll-prev-btn').on('click', () =>
		{
			this.scrollToAdjacentMessage(-1);
		});

		$('#scroll-next-btn').on('click', () =>
		{
			this.scrollToAdjacentMessage(1);
		});
	}
	showLoaderWithDelay()
	{
		clearTimeout(this.loaderTimer);
		this.loaderTimer = setTimeout(() =>
		{
			$('#chat-loader').show();
			this.loaderVisible = true;
		}, 2000);
	}

	hideLoader()
	{
		clearTimeout(this.loaderTimer);
		this.loaderTimer = null;
		if (this.loaderVisible)
		{
			$('#chat-loader').hide();
			this.loaderVisible = false;
		}
	}

	async loadChatList()
	{
		this.showLoaderWithDelay();
		try
		{
			const response = await $.get(API_ENDPOINTS.READ_ALL_CHATS);
			this.validTimestamp = response.validTimestamp || 0;
			const chats = response.chats || [];

			this.renderChatList(chats);

			if (!this.currentChatId && chats.length > 0)
			{
				await this.selectChat(chats[0].chatId);
			}
		} catch (error)
		{
			console.error('Failed to load chat list:', error);
			this.validTimestamp = 0;
			$('#chat-list').html('<div class="loading">Failed to load chats</div>');
		} finally
		{
			this.hideLoader();
		}
	}

	renderChatList(chats)
	{
		chats.sort((a, b) => new Date(b.time) - new Date(a.time));

		const chatListHtml = chats.map(chat =>
		{
			const isNew = this.newChats.has(chat.chatId);
			const isActive = this.currentChatId === chat.chatId;
			const classes = ['chat-item'];

			if (isNew) classes.push('new-chat');
			if (isActive) classes.push('active');

			return `
                        <div class="${classes.join(' ')}" data-chat-id="${chat.chatId}">
                            <div class="chat-title">${this.escapeHtml(chat.title)}</div>
                            <div class="chat-time">${this.escapeHtml(chat.time)}</div>
                        </div>
                    `;
		}).join('');

		$('#chat-list').find('.chat-item, .loading').remove();
		$('#chat-list').append(chatListHtml);

		$('.chat-item').on('click', (e) =>
		{
			const chatId = $(e.currentTarget).data('chat-id');
			this.selectChat(chatId);
		});
	}

	async selectChat(chatId)
	{
		this.newChats.delete(chatId);
		$('.chat-item').removeClass('active');
		$(`.chat-item[data-chat-id="${chatId}"]`).addClass('active').removeClass('new-chat');

		this.currentChatId = chatId;
		await this.loadChat(chatId);
		this.scrollToBottom();
	}

	async loadChat(chatId)
	{
		try
		{
			const container = $('#chat-content');
			const oldScroll = container.scrollTop();
			const isAtBottom = this.isScrollAtBottom();

			await new Promise((resolve, reject) =>
			{
				setTimeout(async () =>
				{
					try
					{
						$('#chat-content').html('<div class="loading">Loading chat...</div>');
						const chatEntity = await $.get(API_ENDPOINTS.READ_CHAT_BY_ID, { id: chatId });
						this.validTimestamp = chatEntity.validTimestamp;
						const messages = chatEntity.history || [];
						this.renderChat(messages);

						$('#chat-content').css('scroll-behavior', 'auto');
						console.log(911, isAtBottom, oldScroll);
						if (!USE_POST_MESSAGE_STREAMING)
						{
							if (isAtBottom)
							{
								this.scrollToBottom();
							} else
							{
								container.scrollTop(oldScroll);
							}
						}
						else this.scrollToBottom();
						$('#chat-content').css('scroll-behavior', 'smooth');


						resolve();
					} catch (err)
					{
						reject(err);
					}
				}, 500);
			});
		} catch (error)
		{
			console.error('Failed to load chat:', error);
			$('#chat-content').html('<div class="loading">Failed to load chat</div>');
		}
	}


	renderChat(messages)
	{
		const container = $('#chat-content');

		const messagesHtml = messages.map((message, index) =>
		{
			const contentHtml = marked.parse(message.content);
			return `
						<div class="message ${message.role}" data-message-index="${index}">
							<div class="role">${message.role}</div>
							<div class="content">${contentHtml}</div>
							<i class="material-icons delete-btn" title="Delete message">delete</i>
						</div>
					`;
		}).join('');

		container.html(messagesHtml);

		$('.delete-btn').on('click', async (e) =>
		{
			const messageDiv = $(e.currentTarget).closest('.message');
			const index = messageDiv.data('message-index');

			if (confirm("Delete this message?"))
			{
				try
				{
					await $.ajax({
						url: API_ENDPOINTS.DELETE_MESSAGE + "?id=" + encodeURIComponent(this.currentChatId) + "&index=" + index,
						method: 'DELETE'
					});
					messageDiv.remove();
				} catch (error)
				{
					console.error('Failed to delete message:', error);
					alert('Failed to delete message');
				}
			}
		});

		$('#message-input').focus();
	}

	async sendMessage()
	{
		const content = $('#message-input').val().trim();
		if (!content || !this.currentChatId) return;

		try
		{
			$('#message-input').val('');
			if (USE_POST_MESSAGE_STREAMING)
			{
				await this.streaming_sendMessage(content);
				return;
			}

			const response = await $.ajax({
				url: API_ENDPOINTS.POST_MESSAGE,
				method: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({
					chatId: this.currentChatId,
					content: content
				})
			});

			this.validTimestamp = response.validTimestamp;
			if (response.event === 'changed')
			{
				await this.loadChat(this.currentChatId);
			} else if (response.event === 'error')
			{
				alert('Error: ' + response.errorMessage);
			}
		} catch (error)
		{
			console.error('Failed to send message:', error);
			alert('Failed to send message');
		}
	}


	async streaming_sendMessage(content)
	{
		$('#message-input').val('');

		const container = $('#chat-content');
		const msgHtml = `
					<div class="message user streaming">
						<div class="role">user</div>
						<div class="content">${content}</div>
					</div>
				`;
		container.append(msgHtml);
		this.streaming_createAssistantPlaceholder();
		this.scrollToBottom();

		let streamBuffer = "";
		const contentEl = container.find('.message.assistant.streaming .content');

		try
		{
			const response = await fetch(API_ENDPOINTS.POST_MESSAGE_STREAMING, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chatId: this.currentChatId,
					content: content
				})
			});

			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");

			while (true)
			{
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });

				if (chunk.length - chunk.indexOf("[DONE]") === chunk.length - "[DONE]".length)
				{
					contentEl.closest('.message').removeClass('streaming');
					this.scrollToBottom();
					this.loadChat(this.currentChatId);
					return;
				}
				streamBuffer += chunk;
				const html = marked.parse(streamBuffer);
				const isAtBottom = this.isScrollAtBottom();
				contentEl.html(html);
				if (isAtBottom)
				{
					this.scrollToBottom();
				}
			}
		} catch (error)
		{
			console.error('Streaming error:', error);
			contentEl.html('<em>Streaming failed</em>');
		}
	}


	async checkForNewData()
	{
		if (this.isUpdating) return;

		try
		{
			const url = `${API_ENDPOINTS.CHECK_NEW_DATA}?validTimestamp=${this.validTimestamp}`;
			const response = await $.get(url);
			const hasNewData = (response === "false" || response === false);

			if (hasNewData)
			{
				this.isUpdating = true;
				this.showLoaderWithDelay();

				const chatListPromise = this.loadChatList();
				const currentChatPromise = this.currentChatId
					? this.loadChat(this.currentChatId)
					: Promise.resolve();

				await Promise.all([chatListPromise, currentChatPromise]);

				this.isUpdating = false;
				this.hideLoader();
			}
		} catch (error)
		{
			console.error('Failed to check for new data:', error);
			this.isUpdating = false;
			this.hideLoader();
		}
	}

	startPeriodicCheck()
	{
		setInterval(() =>
		{
			this.checkForNewData();
		}, 1000);
	}

	scrollToBottom()
	{
		$('#chat-content').scrollTop($('#chat-content')[0].scrollHeight);
	}

	scrollToAdjacentMessage(direction)
	{
		const container = $('#chat-content');
		const messages = container.find('.message');

		if (messages.length === 0) return;

		const scrollTop = container.scrollTop();

		// find the current message index
		let currentIndex = 0;
		messages.each(function (index)
		{
			const msgTop = $(this).position().top + scrollTop;
			const msgBottom = msgTop + $(this).outerHeight();
			if (msgTop <= scrollTop + 5 && msgBottom > scrollTop + 5)
			{
				currentIndex = index;
				return false;
			}
		});

		let targetIndex = currentIndex + direction;

		// prev button special case for being below the last message’s middle
		if (direction < 0 && currentIndex === messages.length - 1)
		{
			const lastMsg = messages.eq(currentIndex);
			const lastTop = lastMsg.position().top + scrollTop;
			const lastHeight = lastMsg.outerHeight();
			const lastMiddle = lastTop + lastHeight / 2;

			if (scrollTop > lastMiddle)
			{
				container.animate({ scrollTop: lastTop }, 150, () =>
				{
					$('#message-input').focus();
				});
				return;
			}
		}

		if (targetIndex < 0)
		{
			container.animate({ scrollTop: 0 }, 150, () =>
			{
				$('#message-input').focus();
			});
			return;
		}
		if (targetIndex >= messages.length)
		{
			container.animate({ scrollTop: container[0].scrollHeight }, 150, () =>
			{
				$('#message-input').focus();
			});
			return;
		}

		const target = messages.eq(targetIndex);
		if (target.length)
		{
			const targetTop = target.position().top + container.scrollTop();
			container.animate({ scrollTop: targetTop }, 150, () =>
			{
				$('#message-input').focus();
			});
		}
	}

	isScrollAtBottom()
	{
		const element = $('#chat-content')[0];
		return Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 100;
	}

	escapeHtml(text)
	{
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	async streaming_postMessage(content)
	{
		const response = await fetch(API_ENDPOINTS.POST_MESSAGE_STREAMING, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chatId: this.currentChatId, content: content })
		});
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		while (true)
		{
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let lines = buffer.split('\n');
			buffer = lines.pop();
			for (const line of lines)
			{
				if (line.startsWith('data:'))
				{
					const data = line.slice(5).trim();
					if (data === '[DONE]')
					{
						this.streaming_finalizeAssistant();
					} else
					{
						this.streaming_handleChunk(data);
					}
				}
			}
		}
	}

	streaming_createAssistantPlaceholder()
	{
		const container = $('#chat-content');
		const elem = $(`
                    <div class="message assistant streaming">
                        <div class="role">assistant</div>
                        <div class="content"></div>
                    </div>
                `);
		container.append(elem);
		this.streamingAssistantElem = elem.find('.content');
	}

	streaming_handleChunk(chunk)
	{
		if (this.streamingAssistantElem)
		{
			this.streamingAssistantElem.append(this.escapeHtml(chunk));
			this.scrollToBottom();
		}
	}

	streaming_finalizeAssistant()
	{
		this.scrollToBottom();
		this.streamingAssistantElem = null;
	}
}

$(document).ready(() =>
{
	new ChatApp();
});