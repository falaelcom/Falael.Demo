function parseCustomDate(str)
{
	const [d, m, y, h, min, s] = str.split(/[\s:.]/).map(Number);
	return new Date(y, m - 1, d, h, min, s);
}

function sanitizeScriptTags(str)
{
	return str.replace(/<\s*\/\s*script\s*>/gi, "&lt;/script&gt;");
}

function sanitizeScriptTags_reverse(str)
{
	return str.replace(/&lt;\/script&gt;/gi, "</script>");
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
		const renderer = new marked.Renderer();

		// override how raw HTML in markdown is handled
		renderer.html = (html) =>
		{
			const div = document.createElement('div');
			div.textContent = html;
			return div.innerHTML; // shows <div> as &lt;div&gt;
		};

		//// leave code blocks untouched (marked already escapes inside)
		//renderer.code = (code, infostring, escaped) =>
		//{
		//	return `<pre><code>${code}</code></pre>`;
		//};
		//renderer.codespan = (code) =>
		//{
		//	return `<code>${code}</code>`;
		//};

		marked.setOptions({
			renderer,
			mangle: false,
			headerIds: false,
			gfm: true,
			breaks: true
		});

		this.setupEventListeners();
		this.loadChatList("first-time").then(() => this.processPermalink());
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

		$('#chat-filter-input').on('input', (e) =>
		{
			const val = e.target.value.trim();
			this.applyChatFilter(val);
		});
	}
	processPermalink()
	{
		const params = new URLSearchParams(window.location.search);
		const permalinkId = params.get("chatId");
		if (permalinkId)
		{
			this.selectChat(permalinkId);
		}
		else
		{
			// latest chat = first after sort (newest on top)
			const firstChat = $('#chat-list .chat-item').first().data('chat-id');
			if (firstChat) this.selectChat(firstChat);
		}
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

	applyChatFilter(pattern)
	{
		const items = $('#chat-list .chat-item');
		if (!pattern)
		{
			items.show();
			return;
		}

		// convert glob-like pattern to regex
		// replace spaces with ".*", surround with .* … .*
		const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
		const regexStr = '.*' + escaped.replace(/\s+/g, '.*') + '.*';
		const regex = new RegExp(regexStr, 'i');

		items.each(function ()
		{
			const text = $(this).text();
			if (regex.test(text))
			{
				$(this).show();
			} else
			{
				$(this).hide();
			}
		});
	}

	async loadChatList(reason)
	{
		this.showLoaderWithDelay();
		try
		{
			const response = await $.get(API_ENDPOINTS.READ_ALL_CHATS);
			this.validTimestamp = response.validTimestamp || 0;
			const chats = response.chats || [];
			chats.sort((a, b) => parseCustomDate(b.time) - parseCustomDate(a.time));

			this.renderChatList(chats);

			if (reason !== "first-time" && !this.currentChatId && chats.length > 0)
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
					<i class="material-icons chat-copy-btn" title="Copy chat link">link</i>
					<i class="material-icons chat-history-btn" title="Copy full chat">content_copy</i>
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

		$('.chat-copy-btn').on('click', (e) =>
		{
			e.stopPropagation();
			const chatId = $(e.currentTarget).closest('.chat-item').data('chat-id');
			const url = window.location.origin + window.location.pathname + "?chatId=" + encodeURIComponent(chatId);
			navigator.clipboard.writeText(url).then(() =>
			{
				M.toast({ html: 'Chat link copied' });
			});
		});

		$('.chat-history-btn').on('click', (e) =>
		{
			e.stopPropagation();

			const lines = [];
			$('#chat-content .message').each(function ()
			{
				const $m = $(this);
				const role = $m.hasClass('user') ? 'USER'
					: $m.hasClass('assistant') ? 'ASSISTANT'
						: $m.hasClass('system') ? 'SYSTEM'
							: 'OTHER';

				const raw = $m.find('.raw-md').text().trim();
				const text = sanitizeScriptTags_reverse(raw || $m.find('.content').text().trim());

				lines.push(`# ${role}\n${text}\n`);
			});

			const fullText = lines.join("\n");
			navigator.clipboard.writeText(fullText).then(() =>
			{
				M.toast({ html: 'Chat history copied' });
			}).catch(err =>
			{
				console.error('Copy failed:', err);
				alert('Copy failed');
			});
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
		const newUrl = window.location.origin + window.location.pathname + "?chatId=" + encodeURIComponent(chatId);
		window.history.replaceState({}, "", newUrl);
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
						//console.log(911, isAtBottom, oldScroll);
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
			let contentHtml = marked.parse(message.content);

			// inject copy buttons after each code block
			contentHtml = contentHtml.replace(/<pre><code[\s\S]*?<\/code><\/pre>/g, (match) =>
			{
				return `
					<div class="codeblock-wrapper">
						${match}
						<button class="code-copy-btn">Copy</button>
					</div>
				`;
			});
			//console.log(912, message);
			return `
						<div class="message ${message.role}" data-message-index="${index}">
							<div class="role">${message.role}</div>
							<div class="content">${contentHtml}</div>
							<i class="material-icons delete-btn" title="Delete message">delete</i>
							<i class="material-icons copy-btn" title="Copy raw markdown">content_copy</i>
							<script type="application/json" class="raw-md">${sanitizeScriptTags(message.content)}</script>
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

		$('.copy-btn').on('click', (e) =>
		{
			const messageDiv = $(e.currentTarget).closest('.message');
			const raw = sanitizeScriptTags_reverse(messageDiv.find('.raw-md').text());
			navigator.clipboard.writeText(raw).then(() =>
			{
				M.toast({ html: 'Copied to clipboard' });
			}).catch(err =>
			{
				console.error('Copy failed:', err);
				alert('Copy failed');
			});
		});

		$('.code-copy-btn').on('click', (e) =>
		{
			const code = $(e.currentTarget).siblings('pre').find('code').text();
			navigator.clipboard.writeText(code).then(() =>
			{
				M.toast({ html: 'Code copied' });
			}).catch(err =>
			{
				console.error('Copy failed:', err);
				alert('Copy failed');
			});
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
		const rendered = marked.parse(content); // render MD

		const msgHtml = `
			<div class="message user streaming">
				<div class="role">user</div>
				<div class="content">${rendered}</div>
				<i class="material-icons delete-btn" title="Delete message">delete</i>
				<i class="material-icons copy-btn" title="Copy raw markdown">content_copy</i>
				<script type="application/json" class="raw-md">${sanitizeScriptTags(content)}</script>
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

				const oldChatIds = new Set($('#chat-list .chat-item').map((_, el) => $(el).data('chat-id')).get());

				const responseChats = await $.get(API_ENDPOINTS.READ_ALL_CHATS);
				this.validTimestamp = responseChats.validTimestamp || 0;
				const chats = responseChats.chats || [];

				chats.sort((a, b) => parseCustomDate(b.time) - parseCustomDate(a.time));

				this.renderChatList(chats);

				// detect new chat
				const newChat = chats.find(c => !oldChatIds.has(c.chatId));
				if (newChat)
				{
					await this.selectChat(newChat.chatId);
				} else if (this.currentChatId)
				{
					await this.loadChat(this.currentChatId);
				}

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
		const poll = async () =>
		{
			await this.checkForNewData();
			setTimeout(poll, 1000); // schedule next only after this one completes
		};
		poll();
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