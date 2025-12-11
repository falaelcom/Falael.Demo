using System.Text;
using System.Diagnostics;

using Discord;
using Discord.WebSocket;

namespace Falael.Services
{
    public class DiscordService : FalaelContextAware
	{
		const ulong LGID = 0x82E4FC;

		const string MetadataTag = "FSSMD";
		public static readonly Dictionary<string, StandardReaction> StandardEmotes = new()
		{
			{ "❤️", StandardReaction.Heart },
			{ "💔", StandardReaction.HeartBroken },
			{ "❤️‍🔥", StandardReaction.HeartFire },
			{ "🤎", StandardReaction.HeartBrown },
			{ "👍", StandardReaction.ThumbsUp },
			{ "👎", StandardReaction.ThumbsDown },
			{ "😀", StandardReaction.FaceGrin },
			{ "☹️", StandardReaction.FaceFrown },
			{ "❌", StandardReaction.X },
			{ "⭐", StandardReaction.Star },
			{ "⚡", StandardReaction.Lightning },
			{ "❗", StandardReaction.ExclamationMark },
			{ "❓", StandardReaction.QuestionMark },
			{ "🔁", StandardReaction.Repeat },
			{ "🔂", StandardReaction.RepeatOnce },
			{ "🕐", StandardReaction.Clock },
			{ "♀️", StandardReaction.GenderFemale },
			{ "♂️", StandardReaction.GenderMale },
			{ "🛑", StandardReaction.Stop },
			{ "💩", StandardReaction.Poo },
		};
		public static readonly Dictionary<StandardReaction, string> StandardEmotesReverse = StandardEmotes.ToDictionary(kv => kv.Value, kv => kv.Key);

		/// <param name="debugGuildId">Acquire from "Copy Server ID" dropdown menu option on the server's icon of the server being used for tests.</param>
		public DiscordService(IFalaelContext coreContext, Configuration configuration)
			: base(coreContext)
		{
			this.discordClient = new DiscordSocketClient(new DiscordSocketConfig
			{
				GatewayIntents = GatewayIntents.Guilds
								| GatewayIntents.GuildMessages
								| GatewayIntents.GuildMessageReactions
								| GatewayIntents.DirectMessages
								| GatewayIntents.DirectMessageReactions
								| GatewayIntents.MessageContent
			});

			this.discordClient.Log += _logAsync;
			this.discordClient.Ready += this.OnReadyAsync;
			this.discordClient.MessageReceived += this.MessageReceivedAsync;
			this.discordClient.ReactionAdded += this.ReactionAddedAsync;
			this.discordClient.ReactionRemoved += this.ReactionRemovedAsync;
			this.discordClient.SlashCommandExecuted += this.SlashCommandHandler;

			Task _logAsync(LogMessage logMessage)
			{
				switch (logMessage.Severity)
				{
					case LogSeverity.Critical:
						this.Log.WriteLine(Severity.Error, (LGID, 0xF7DD34), 
							nameof(DiscordService), logMessage.ToString()
						);
						break;
					case LogSeverity.Error:
						this.Log.WriteLine(Severity.Error, (LGID, 0xEE448E),
							nameof(DiscordService), logMessage.ToString()
						);
						break;
					case LogSeverity.Warning:
						this.Log.WriteLine(Severity.Warning, (LGID, 0xDCCE96),
							nameof(DiscordService), logMessage.ToString()
						);
						break;
					case LogSeverity.Info:
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xBD8E57),
							nameof(DiscordService), logMessage.ToString()
						);
						break;
					case LogSeverity.Verbose:
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x623EB8),
							nameof(DiscordService), logMessage.ToString()
						);
						break;
					case LogSeverity.Debug:
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xF929F5),
							nameof(DiscordService), logMessage.ToString()
						);
						break;
					default: 
						throw new NotImplementedException(logMessage.Severity.ToString());
				}
				return Task.CompletedTask;
			}

			this.configuration = configuration;
		}

		//	thread-safe
		public void SetResponders(Responder[] responders)
		{
			this.sync.Wait();
			try
			{
				this.Responders = responders;
			}
			finally
			{
				this.sync.Release();
			}
		}

		#region Configuration

		[ConfigurationClass]
		public class Configuration
		{
			/// <summary>
			/// The Discord bot token, e.g. `"aaaaaaaaaaaaaaaaaaaaaaaaaa.bbbbbb.cccccccccccccccccccccccccccccccccccccc"`.
			/// Get it from https://discord.com/developers/applications, select app and then from left - Bot
			/// </summary>
			[ConfigurationField("discord.botToken")]
			public string Discord_BotToken { get; init; } = string.Empty;

			/// <summary>
			/// The Discord bot user id, e.g. `1111111111111111111`.
			/// While Discord developer mode is enabled, right-click on the bot chat icon and select Copy User ID
			/// </summary>
			[ConfigurationField("discord.botUserId")]
			public ulong Discord_BotUserId { get; init; } = 0;

			/// <summary>
			/// Timeout before DiscordService will give up an operation because of disconnected state, e.g. `"00:20:00"`.
			/// </summary>
			[ConfigurationField("discord.ensureConnectionTimeout")]
			public TimeSpan Discord_EnsureConnectionTimeout { get; init; } = TimeSpan.FromSeconds(20);

			/// <summary>
			/// Interval between subsequent DiscordService connection polling attempts, e.g. `"00:00:00.100"`.
			/// </summary>
			[ConfigurationField("discord.ensureConnectionRetryInterval")]
			public TimeSpan Discord_EnsureConnectionRetryInterval { get; init; } = TimeSpan.FromMilliseconds(100);
		}

		#endregion


		#region Nested Types

		public enum StandardReaction
		{
			Heart,
			HeartBroken,
			HeartFire,
			HeartBrown,
			ThumbsUp,
			ThumbsDown,
			FaceGrin,
			FaceFrown,
			X,
			Star,
			Lightning,
			ExclamationMark,
			QuestionMark,
			Repeat,
			RepeatOnce,
			Clock,
			GenderMale,
			GenderFemale,
			Stop,
			Poo,
		}

		public abstract class DiscordCommand : FalaelContextAware
		{
			public DiscordCommand(IFalaelContext coreContext, SlashCommandProperties commandDef)
				: base(coreContext)
			{
				this.CommandDef = commandDef;
			}

			public SlashCommandProperties CommandDef { get; }

			public abstract Task Execute(SocketSlashCommand command);
		}

		///	<remarks>
		///	To implement slash commands, to the derived class add methods as follows:
		///	```
		///		[SlashCommand("echo", "Repeats your message")]
		///		public async Task EchoCommand([Summary("message", "The message to echo back")] string message)
		///		{
		///			await base.RespondAsync(message);
		///		}
		///	```
		///	</remarks>
		public class Responder : FalaelContextAware
		{
			public Responder(IFalaelContext coreContext) : base(coreContext) { }

			public virtual async Task MessageReceivedAsync(string senderUserId, string senderUserName, string messageText, IUserMessage userMessage, string? metadata) { }
			public virtual async Task StandardReactionAddedAsync(string senderUserId, string senderUserName, IUserMessage userMessage, string? metadata, DiscordService.StandardReaction standardReaction) { }
			public virtual async Task StandardReactionRemovedAsync(string senderUserId, string senderUserName, IUserMessage userMessage, string? metadata, DiscordService.StandardReaction standardReaction) { }

			public virtual DiscordCommand[] BuildCommands() { return []; }
		}

		#endregion


		//	thread-safe
		public async Task Start()
		{
			await this.sync.WaitAsync();
			try
			{
				if (this.hasStarted) throw new InvalidOperationException("already started");

				await this.discordClient.LoginAsync(TokenType.Bot, this.configuration.Discord_BotToken);
				await this.discordClient.StartAsync();
			}
			finally
			{
				this.sync.Release();
			}
		}

		async Task WaitForConnectionAsync(TimeSpan timeout)
		{
			var timeoutTask = Task.Delay(timeout);
			var completedTask = await Task.WhenAny(this.readyTcs.Task, timeoutTask);
			if (completedTask == timeoutTask) throw new TimeoutException("Timed out waiting for Discord client to connect");
			await this.readyTcs.Task;
		}

		//	thread-safe
		public async Task SendMessageToUser(string discordUserIdText, string message, string? metadata)
		{
			if (!ulong.TryParse(discordUserIdText, out ulong discordUserId)) throw new ArgumentException("Bad Discord Id", discordUserIdText);

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x713796), 
				nameof(DiscordService), nameof(SendMessageToUser), nameof(discordUserIdText), discordUserIdText,
				CL129(nameof(metadata), metadata),
				CL(nameof(message), message)
			);

			await this.WaitForConnectionAsync(this.configuration.Discord_EnsureConnectionTimeout);

			await this.sync.WaitAsync();
			try
			{
				var user = await this.discordClient.Rest.GetUserAsync(discordUserId) ?? throw new Exception($"Discord user id {discordUserId} not found on Discord.");
				var dmChannel = await user.CreateDMChannelAsync();
				if (metadata == null) await dmChannel.SendMessageAsync(message);
				else
				{
					var encodedMetadata = Convert.ToBase64String(Encoding.UTF8.GetBytes(metadata));
					await dmChannel.SendMessageAsync($"[{MetadataTag}:{encodedMetadata}]{Environment.NewLine}{message}");
				}
			}
			finally
			{
				this.sync.Release();
			}
		}

		public async Task DeleteBotMessagesAsync(string discordUserIdText, TimeSpan olderThan, TimeSpan singleMessageDelay, int maxDeleteBatchSize)
		{
			ArgumentOutOfRangeException.ThrowIfLessThan(maxDeleteBatchSize, 1);

			if (!ulong.TryParse(discordUserIdText, out ulong discordUserId)) throw new ArgumentException("Bad Discord Id", discordUserIdText);

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xB5A6D2),
				nameof(DiscordService), nameof(DeleteBotMessagesAsync), nameof(discordUserIdText), discordUserIdText, nameof(olderThan), olderThan, nameof(singleMessageDelay), singleMessageDelay, nameof(maxDeleteBatchSize), maxDeleteBatchSize
			);

			await this.WaitForConnectionAsync(this.configuration.Discord_EnsureConnectionTimeout);

			var now = DateTimeOffset.UtcNow;
			var i = 0;
			var channels = await _getAllBotChannels(discordUserId, true);
			foreach (var channel in channels)
			{
				try
				{
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x7B26E3),
						nameof(DiscordService), nameof(DeleteBotMessagesAsync), "Cleaning up channel.", nameof(channel), channel.Id, channel.Name
					);
					var matchingMessages = _enumerateMatchingMessages(
						channel,
						100,
						m => (m.Author.Id == this.configuration.Discord_BotUserId || m.MentionedUserIds.Contains(this.configuration.Discord_BotUserId)) && (now - m.Timestamp) > olderThan
					);
					await foreach (var message in matchingMessages)
					{
						if (i >= maxDeleteBatchSize) break;
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE505A7),
							nameof(DiscordService), nameof(DeleteBotMessagesAsync), "Deleting message.", i + 1, " / ", maxDeleteBatchSize, nameof(message.Timestamp), message.Timestamp
						);
						try
						{
							await message.DeleteAsync();
						}
						catch (Exception ex)
						{
							this.Log.WriteLine(Severity.Error, (LGID, 0xA708D1),
								nameof(DiscordService), nameof(DeleteBotMessagesAsync), "Failed to delete discord message.", nameof(channel), channel.Id, channel.Name, nameof(message), message.Id, message.Content, ex
							);
						}
						await Task.Delay(singleMessageDelay);
						++i;
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0x77A53B),
						nameof(DiscordService), nameof(DeleteBotMessagesAsync), "Failed to process discord channel for message cleanup.", nameof(channel), channel.Id, channel.Name, ex
					);
				}
			}
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xA2BCDC),
				nameof(DiscordService), nameof(DeleteBotMessagesAsync), "Deleted", i, "old messages."
			);

			async Task<List<IMessageChannel>> _getAllBotChannels(ulong discordUserId, bool includeGuildChannels)
			{
				var result = new List<IMessageChannel>();
				var dmChannel = await this.discordClient.GetDMChannelAsync(discordUserId);
				if (dmChannel == null)
				{
					var user = this.discordClient.GetUser(discordUserId) ?? await this.discordClient.GetUserAsync(discordUserId);
					if (user != null) dmChannel = await user.CreateDMChannelAsync();
				}
				if(dmChannel != null) result.Add(dmChannel);
				if(includeGuildChannels) foreach (var guild in this.discordClient.Guilds) result.AddRange(guild.TextChannels);
				return result;
			}

			async IAsyncEnumerable<IMessage> _enumerateMatchingMessages(IMessageChannel channel, int pageSize, Func<IMessage, bool> predicate)
			{
				List<IMessage> currentPage = await _getFirstPage(channel, pageSize);

				while (currentPage.Count > 0)
				{
					foreach (var message in currentPage)
					{
						if (!predicate(message)) continue;
						yield return message;
					}
					if (currentPage.Count < pageSize) yield break;
					currentPage = await _getNextPage(channel, pageSize, currentPage.Last());
				}
			}

			async Task<List<IMessage>> _getFirstPage(IMessageChannel channel, int pageSize)
			{
				var messages = await channel.GetMessagesAsync(pageSize).FlattenAsync();
				return messages.ToList();
			}

			async Task<List<IMessage>> _getNextPage(IMessageChannel channel, int pageSize, IMessage fromMessage)
			{
				var messages = await channel.GetMessagesAsync(fromMessage, Direction.Before, pageSize).FlattenAsync();
				return messages.ToList();
			}
		}


		//	thread-safe
		protected async Task OnReadyAsync()
		{
			await this.sync.WaitAsync();
			try
			{
				if (this.hasStarted)
				{
					this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0xC98D87),
						nameof(DiscordService), nameof(OnReadyAsync), "Reconnected."
					);
					return;
				}

				Debug.Assert(this.Responders != null);

				this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x1C84D5),
					nameof(DiscordService), nameof(OnReadyAsync), $"Logged in as {this.discordClient.CurrentUser.Username}#{this.discordClient.CurrentUser.Discriminator}."
				);

				foreach (var responder in this.Responders)
				{
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x7555D0),
						nameof(DiscordService), nameof(OnReadyAsync), "Building discord commands for responder.", responder.GetType().FullName
					);
					try
					{
						var commands = responder.BuildCommands();
						foreach (var item in commands)
						{
							try
							{
								this.discordCommandMap.Add(item.CommandDef.Name.Value, item);
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE6CAF2),
									nameof(DiscordService), nameof(OnReadyAsync), "Registering discord command.", item.GetType().FullName, "as", item.CommandDef.Name
								);
								var command = await this.discordClient.CreateGlobalApplicationCommandAsync(item.CommandDef);
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x712C6E),
									nameof(DiscordService), nameof(OnReadyAsync), "Registered discord command.", command.Id
								);
							}
							catch (Exception ex)
							{
								this.Log.WriteLine(Severity.Error, (LGID, 0x8F7D28),
									nameof(DiscordService), nameof(OnReadyAsync), "Failed to build discord command.", ex
								);
							}
						}
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x1514F4),
							nameof(DiscordService), nameof(OnReadyAsync), "Registered", commands.Length, "discord commands for responder.", responder.GetType().FullName
						);
					}
					catch (Exception ex)
					{
						this.Log.WriteLine(Severity.Error, (LGID, 0xB403DC),
							nameof(DiscordService), nameof(OnReadyAsync), "Failed to build discord commands for responder.", ex
						);
					}
				}

				Debug.Assert(this.discordClient.ConnectionState == ConnectionState.Connected);

				this.hasStarted = true;
				this.readyTcs.SetResult(true);
			}
			catch(Exception ex)
			{
				this.readyTcs.TrySetException(new InvalidOperationException("Failed to get to ready state", ex));
				throw;
			}
			finally
			{
				this.sync.Release();
			}
		}

		//	thread-safe
		protected async Task MessageReceivedAsync(SocketMessage message)
		{
			await this.sync.WaitAsync();
			try
			{
				if (!this.hasStarted) return;

				Debug.Assert(this.Responders != null);

				if (message is not SocketUserMessage userMessage) return;
				if (userMessage.Author.IsBot) return;

				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x8CE02C),
					nameof(DiscordService), nameof(MessageReceivedAsync), $"from {userMessage.Author.Username} (ID: {userMessage.Author.Id}).",
					CL257(nameof(userMessage.Content), userMessage.Content),
					CL(nameof(userMessage.Content), userMessage.Content)
				);

				foreach (var responder in this.Responders) await responder.MessageReceivedAsync(userMessage.Author.Id.ToString(), userMessage.Author.Username, userMessage.Content, userMessage, GetMetadataFromMessage(userMessage));
			}
			finally
			{
				this.sync.Release();
			}
		}

		//	thread-safe
		protected async Task ReactionAddedAsync(Cacheable<IUserMessage, ulong> cacheable, Cacheable<IMessageChannel, ulong> channelCache, SocketReaction reaction)
		{
			await this.sync.WaitAsync();
			try
			{
				if (!this.hasStarted) return;

				Debug.Assert(this.Responders != null);

				var message = await cacheable.GetOrDownloadAsync();
				var user = reaction.User.IsSpecified ? reaction.User.Value : await this.discordClient.GetUserAsync(reaction.UserId);

				if (user == null)
				{
					this.Log.WriteLine(Severity.Alert, (LGID, 0x914B77),
						nameof(DiscordService), nameof(ReactionAddedAsync), "User is null."
					);
					return;
				}
				if (user.Id.ToString() == this.configuration.Discord_BotUserId.ToString()) return;

				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xEA037B),
					nameof(DiscordService), nameof(ReactionAddedAsync), $"Received reaction from {user.Username} (ID: {user.Id})."
				);
				string unicodeEscape = string.Join("", reaction.Emote.ToString()!.Select(c => $"\\u{(int)c:X4}"));
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x85AF2B),
					nameof(DiscordService), nameof(ReactionAddedAsync), $"Received reaction: \"{unicodeEscape}\"."
				);

				if (StandardEmotes.TryGetValue(reaction.Emote.Name, out StandardReaction standardReaction)) foreach (var responder in this.Responders) await responder.StandardReactionAddedAsync(user.Id.ToString(), user.Username, message, GetMetadataFromMessage(message), standardReaction);
				else
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0xCC5B3A),
						nameof(DiscordService), nameof(ReactionAddedAsync), "Non-standard reaction."
					);
				}
			}
			finally
			{
				this.sync.Release();
			}
		}

		//	thread-safe
		protected async Task ReactionRemovedAsync(Cacheable<IUserMessage, ulong> cacheable, Cacheable<IMessageChannel, ulong> channelCache, SocketReaction reaction)
		{
			await this.sync.WaitAsync();
			try
			{
				if (!this.hasStarted) return;

				Debug.Assert(this.Responders != null);

				var message = await cacheable.GetOrDownloadAsync();
				var user = reaction.User.IsSpecified ? reaction.User.Value : await this.discordClient.GetUserAsync(reaction.UserId);

				if (user == null)
				{
					this.Log.WriteLine(Severity.Alert, (LGID, 0x4BF410),
						nameof(DiscordService), nameof(ReactionRemovedAsync), "User is null."
					);
					return;
				}
				if (user.Id.ToString() == this.configuration.Discord_BotUserId.ToString()) return;

				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x664354),
					nameof(DiscordService), nameof(ReactionRemovedAsync), $"Removed reaction from {user.Username} (ID: {user.Id})."
				);
				string unicodeEscape = string.Join("", reaction.Emote.ToString()!.Select(c => $"\\u{(int)c:X4}"));
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE78DB0),
					nameof(DiscordService), nameof(ReactionRemovedAsync), $"Removed reaction: \"{unicodeEscape}\"."
				);

				if (StandardEmotes.TryGetValue(reaction.Emote.Name, out StandardReaction standardReaction)) foreach (var responder in this.Responders) await responder.StandardReactionRemovedAsync(user.Id.ToString(), user.Username, message, GetMetadataFromMessage(message), standardReaction);
				else
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x91C6E3),
						nameof(DiscordService), nameof(ReactionRemovedAsync), "Non-standard reaction."
					);
				}
			}
			finally
			{
				this.sync.Release();
			}
		}

		//	thread-safe
		protected async Task SlashCommandHandler(SocketSlashCommand command)
		{
			await this.sync.WaitAsync();
			try
			{
				if (!this.hasStarted) return;

				Debug.Assert(this.Responders != null);

				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x333763),
					nameof(DiscordService), nameof(SlashCommandHandler), "Received slash command", command.Data.Name
				);

				if (this.discordCommandMap.TryGetValue(command.Data.Name, out DiscordCommand? discordCommand)) await discordCommand.Execute(command);
				else
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x56899D),
						nameof(DiscordService), nameof(SlashCommandHandler), "Unknown command", command.Data.Name
					);
				}
			}
			finally
			{
				this.sync.Release();
			}
		}


		static string? GetMetadataFromMessage(IUserMessage userMessage)
		{
			//if (userMessage.Embeds.Count > 0 && userMessage.Embeds.First()!.Footer.HasValue)
			//{
			//	string encodedMetadata = userMessage.Embeds.First()!.Footer!.Value.Text;
			//	byte[] data = Convert.FromBase64String(encodedMetadata);
			//	return System.Text.Encoding.UTF8.GetString(data);
			//}
			if (userMessage.Content.Contains($"[{MetadataTag}:"))
			{
				int startIndex = userMessage.Content.IndexOf($"[{MetadataTag}:") + $"[{MetadataTag}:".Length;
				int endIndex = userMessage.Content.IndexOf(']', startIndex);
				if (endIndex > startIndex)
				{
					string encodedMetadata = userMessage.Content[startIndex..endIndex];
					byte[] data = Convert.FromBase64String(encodedMetadata);
					return Encoding.UTF8.GetString(data);
				}
			}
			return null;
		}


		public Responder[]? Responders { get; private set; }

		readonly DiscordSocketClient discordClient;
		readonly Dictionary<string, DiscordCommand> discordCommandMap = [];
		readonly SemaphoreSlim sync = new(1, 1);
		readonly TaskCompletionSource<bool> readyTcs = new();
		readonly Configuration configuration;
		bool hasStarted = false;
	}
}