using System.Diagnostics;
using System.Net;
using System.Text.RegularExpressions;

using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Util.Store;

using MimeKit;

using MailKit;
using MailKit.Search;
using MailKit.Security;
using MailKit.Net.Imap;

using Falael.Core.Syncronization;
using Falael.Core.AsyncCommandQueue;

namespace Falael.Services
{
	public class GmailImapClient : FalaelContextAware, IEmailSend
	{
		const ulong LGID = 0x795FF2;

		public GmailImapClient(IFalaelContext coreContext, Configuration configuration)
			: base(coreContext)
		{
			this.configuration = configuration;

			this.CommandOrchestrator.CommandDequeued += (object? sender, AsyncCommandQueue.CommandEventArgs e) => this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD83337), 
				CL57(e.Command.GetType().Name, e.Priority, e.Command.RetryCount != 0 ? "RETRYING" : string.Empty)
			);

			this.CommandOrchestrator.CommandAbort += (object? sender, AsyncCommandQueue.CommandAbortEventArgs e) => this.Log.WriteLine(Severity.Warning, (LGID, 0x38F68F),
				CL57(e.CommandAbortException.GetType().Name, e.Command.GetType().Name, e.Priority), CL1025(e.CommandAbortException.Message, e.CommandAbortException.InnerException?.Message)
			);

			this.CommandOrchestrator.CommandRetry += (object? sender, AsyncCommandQueue.CommandRetryEventArgs e) => this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xB564B8), 
				CL57(e.CommandRetryException.GetType().Name, e.Command.GetType().Name, e.Priority), CL1025(e.CommandRetryException.Message, e.CommandRetryException.InnerException?.Message)
			);

			this.CommandOrchestrator.UnexpectedError += (object? sender, AsyncCommandQueue.UnexpectedErrorEventArgs e) => this.Log.WriteLine(Severity.Warning, (LGID, 0xE5DABC), 
				CL57(e.Exception.GetType().Name, e.Command.GetType().Name, e.Priority), CL1025(e.Exception.Message, e.Exception.InnerException?.Message)
			);

			var gmailImapDataStoreUtility = new GmailImapDataStoreUtility(
				coreContext,
				this.configuration.GetLockHandleOptions(configuration.Service_Gmail_DataStoreNameProvider_LockHandle_PegFilePath),
				configuration.Service_Gmail_DataStoreNameProvider_StoreDirectory
			);
			this.dataStoreNameProvider = new DataStoreNameProvider(
				this.CoreContext,
				gmailImapDataStoreUtility,
				this.configuration.Service_Gmail_DataStoreNameProvider_Key,
				this.configuration.Service_Gmail_DataStoreNameProvider_LockId
			);
		}

		#region Private Nested Types

		class DataStoreNameProvider : FalaelContextAware
		{
			public DataStoreNameProvider(IFalaelContext coreContext, GmailImapDataStoreUtility gmailImapDataStoreUtility, string key, Guid lockId)
				: base(coreContext)
			{
				this.GmailImapDataStoreUtility = gmailImapDataStoreUtility;
				this.Key = key;
				this.LockId = lockId;
			}

			public async Task<string> QueryGmailDataStoreName()
			{
				using Peg peg = await this.GmailImapDataStoreUtility.HoldGmailImapClientPeg($"{nameof(DataStoreNameProvider)}/QueryGmailDataStoreName", this.LockId, true);

				return await this.GmailImapDataStoreUtility.GetGmailDataStoreName(peg, this.Key);
			}

			public async Task InvalidateGmailDataStoreName()
			{
				using Peg peg = await this.GmailImapDataStoreUtility.HoldGmailImapClientPeg($"{nameof(DataStoreNameProvider)}/InvalidateGmailDataStoreName", this.LockId, true);

				var dataStoreDirectory = new FileDataStore(await this.GmailImapDataStoreUtility.GetGmailDataStoreName(peg, this.Key)).FolderPath;
				if (Directory.Exists(dataStoreDirectory)) Directory.Delete(dataStoreDirectory, true);
				await this.GmailImapDataStoreUtility.SaveGmailDataStoreName(peg, this.Key, Guid.NewGuid().ToString());
			}

			public string Key { get; }
			public Guid LockId { get; }

			public GmailImapDataStoreUtility GmailImapDataStoreUtility { get; }
		}

		class GmailImapDataStoreUtility : FalaelContextAware
		{
			public GmailImapDataStoreUtility(IFalaelContext coreContext, LockHandle.Options gmailImapClientPeg_lockHandle_options, string tempDirectoryPath)
				: base(coreContext)
			{
				this.GmailImapClientPeg_LockHandle_Options = gmailImapClientPeg_lockHandle_options;
				this.TempDirectoryPath = tempDirectoryPath;
			}

			#region IGmailImapDataStoreUtility

			public async Task<Peg> HoldGmailImapClientPeg(string pegHolderName, Guid lockId, bool retainReusedLockHandle = false)
			{
				return await Peg.Hold(this.CoreContext, pegHolderName, this.GmailImapClientPeg_LockHandle_Options, lockId, retainReusedLockHandle);
			}

			public async Task SaveGmailDataStoreName(Peg peg, string key, string name)
			{
				Debug.Assert(peg.IsLocked);

				string path = Path.Combine(this.TempDirectoryPath, $"~GmailDataStoreName-{key}.txt");
				await File.WriteAllTextAsync(path, name);
			}

			public async Task<string> GetGmailDataStoreName(Peg peg, string key)
			{
				Debug.Assert(peg.IsLocked);

				string path = Path.Combine(this.TempDirectoryPath, $"~GmailDataStoreName-{key}.txt");
				if (!File.Exists(path))
				{
					var result = Guid.NewGuid().ToString();
					await this.SaveGmailDataStoreName(peg, key, result);
					return result;
				}
				else return await File.ReadAllTextAsync(path);
			}

			#endregion

			public LockHandle.Options GmailImapClientPeg_LockHandle_Options { get; }
			public string TempDirectoryPath { get; }
		}

		#endregion

		#region Nested Types

		public class State
		{
			public string? AccessToken
			{
				get
				{
					lock (this.accessTokenSync)
					{
						return this.accessToken;
					}
				}
				set
				{
					lock (this.accessTokenSync)
					{
						this.accessToken = value;
					}
				}
			}

			string? accessToken = null;

			readonly object accessTokenSync = new();
		}

		public class MessageInFolder
		{
			public MimeMessage? MimeMessage = null;
			public UniqueId? UniqueId = null;
			public string? Folder = null;
		}

		#endregion

		#region Configuration

		[ConfigurationClass]
		public class Configuration
		{
			[ConfigurationField("service.gmail.imap.server")]
			public string Service_Gmail_Imap_Server { get; init; } = "imap.gmail.com";

			[ConfigurationField("service.gmail.imap.port")]
			public int Service_Gmail_Imap_Port { get; init; } = 993;

			[ConfigurationField("service.gmail.imap.skipFoldersRegex")]
			public Regex Service_Gmail_Imap_SkipFoldersRegex { get; init; } = new Regex(@"^\[Gmail].*", RegexOptions.IgnoreCase);

			[ConfigurationField("service.gmail.oauth.url")]
			public string Service_Gmail_OAuth_Url { get; init; } = "https://oauth2.googleapis.com/token";

			[ConfigurationField("service.gmail.oauth.scope")]
			public string Service_Gmail_OAuth_Scope { get; init; } = "https://mail.google.com/";

			[ConfigurationField("service.gmail.oauth.client.id")]
			public string Service_Gmail_OAuth_Client_Id { get; init; } = string.Empty;

			[ConfigurationField("service.gmail.oauth.client.secret")]
			public string Service_Gmail_OAuth_Client_Secret { get; init; } = string.Empty;

			[ConfigurationField("service.gmail.accountName")]
			public string Service_Gmail_AccountName { get; init; } = string.Empty;

			[ConfigurationField("service.gmail.dataStoreNameProvider.key")]
			public string Service_Gmail_DataStoreNameProvider_Key { get; init; } = string.Empty;

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockId")]
			public Guid Service_Gmail_DataStoreNameProvider_LockId { get; init; }

			[ConfigurationField("service.gmail.dataStoreNameProvider.storeDirectory")]
			public string Service_Gmail_DataStoreNameProvider_StoreDirectory { get; init; } = string.Empty;

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockHandle.pegFilePath")]
			public string Service_Gmail_DataStoreNameProvider_LockHandle_PegFilePath { get; init; } = string.Empty;

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockHandle.timeout")]
			public TimeSpan Service_Gmail_DataStoreNameProvider_LockHandle_Timeout { get; init; }

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockHandle.pollingInterval")]
			public TimeSpan Service_Gmail_DataStoreNameProvider_LockHandle_PollingInterval { get; init; }

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockHandle.fileAccess")]
			public FileAccess Service_Gmail_DataStoreNameProvider_LockHandle_FileAccess { get; init; } = FileAccess.ReadWrite;

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockHandle.fileMode")]
			public FileMode Service_Gmail_DataStoreNameProvider_LockHandle_FileMode { get; init; } = FileMode.OpenOrCreate;

			[ConfigurationField("service.gmail.dataStoreNameProvider.lockHandle.fileShare")]
			public FileShare Service_Gmail_DataStoreNameProvider_LockHandle_FileShare { get; init; } = FileShare.None;


			public LockHandle.Options GetLockHandleOptions(string pegFileFullPath)
			{
				return new LockHandle.Options()
				{
					FileAccess = this.Service_Gmail_DataStoreNameProvider_LockHandle_FileAccess,
					FileMode = this.Service_Gmail_DataStoreNameProvider_LockHandle_FileMode,
					FileShare = this.Service_Gmail_DataStoreNameProvider_LockHandle_FileShare,
					FullFilePath = pegFileFullPath,
					Timeout = this.Service_Gmail_DataStoreNameProvider_LockHandle_Timeout,
					PollingInterval = this.Service_Gmail_DataStoreNameProvider_LockHandle_PollingInterval,
				};
			}
		}

		#endregion

		#region Instrumentation

		public class LogSink : ILogSink
		{
			const ulong LGID = 0x442530;

			public LogSink(LogSinkRouter owner, ILog internalLogger, GmailImapClient gmailImapClient, string prefix, string senderName, string senderEmail, string recipientName, string recipientEmail)
			{
				this.Owner = owner;
				this.internalLogger = internalLogger;
				this.GmailImapClient = gmailImapClient;
				this.Prefix = prefix;
				this.SenderName = senderName;
				this.SenderEmail = senderEmail;
				this.RecipientName = recipientName;
				this.RecipientEmail = recipientEmail;
			}

			//	thread-safe
			public void Log(
				string line,

				DateTimeOffset timestamp,
				Severity severity,
				int logDensity,
				ulong logGroupId,
				ulong codePointId,

				string timestampText,
				string severityText,
				string? logGroupIdText,
				string? codePointIdText,

				int? maxLineLength)
			{
				Task.Run(async () =>
				{
					switch (this.TestForFlood())
					{
						case FloodPeventionResult.NormalOperation:
							await this.SendMail(this.Prefix, logGroupId, codePointId, severity.ToString(), line);
							break;
						case FloodPeventionResult.WarnAndMute:
							var warningText = $"Error message sendmail quota of {ErrorMail_MaxAllowedRate} per {ErrorMail_RateMonitorInterval} exceeded, sending warning email instead and muting for {ErrorMail_MuteInterval}.";
							this.Logger.WriteLine(Severity.Warning, (LGID, 0x7CD5E3),
								nameof(this.GmailImapClient), nameof(LogSink), warningText
							);
							await this.SendMail(this.Prefix, logGroupId, codePointId, Severity.Warning.ToString(), warningText + "\n\n" + line);
							break;
						case FloodPeventionResult.Muted:
							this.Logger.WriteLine(Severity.Warning, (LGID, 0xDA4510),
								nameof(this.GmailImapClient), nameof(LogSink), $"Error message sendmail muted until {this.errorMail_SeriesStartTime + ErrorMail_MuteInterval}."
							);
							break;
						default: throw new NotImplementedException();
					}
				});
			}

			async Task SendMail(string prefix, ulong logGroupId, ulong codePointId, string severityText, string line)
			{
				try
				{
					var emailMessage = new EmailMessage(
						this.SenderName,
						this.SenderEmail,
						this.RecipientName,
						this.RecipientEmail,
						LogRouter.Format(prefix, severityText, CL57(this.Owner.GetUnprefixedLine(line, logGroupId, codePointId))).TrimEnd(),
						line
					);
					await this.GmailImapClient.SendAsync(emailMessage);
				}
				catch (Exception ex)
				{
					this.Logger.WriteLine(Severity.Critical, (LGID, 0x579D1A),
						nameof(this.GmailImapClient), nameof(LogSink), "Failed to send email message.", ex
					);
				}
			}

			enum FloodPeventionResult
			{
				NormalOperation,
				WarnAndMute,
				Muted,
			}

			//	thread-safe
			//	Remarks: splits the time into subsequent intervals, for each interval counts the mails sent and if max rate is exceeded, signals mute
			FloodPeventionResult TestForFlood()
			{
				lock (this.sync)
				{
					this.errorMail_SeriesStartTime ??= DateTime.Now;
					var elapsed = DateTime.Now - this.errorMail_SeriesStartTime;

					//	handle muted state
					if (this.errorMail_Muted)
					{
						//	still waiting for the mute interval to elapse; stay muted
						if (elapsed < ErrorMail_MuteInterval) return FloodPeventionResult.Muted;

						//	mute interval elapsed; start a new interval and go back to normal
						this.errorMail_Muted = false;
						this.errorMail_SeriesStartTime = DateTime.Now;
						this.errorMail_CountInSeries = 1;
						return FloodPeventionResult.NormalOperation;
					}

					//	handle one interval elapsed, see whether the rate has been exceeded; if yes - mute, otherwise reset and start a new interval
					if (elapsed >= ErrorMail_RateMonitorInterval)
					{
						//	too many mail send ops detected within the current interval - warn caller and go mute
						if (this.errorMail_CountInSeries > ErrorMail_MaxAllowedRate)
						{
							this.errorMail_Muted = true;
							return FloodPeventionResult.WarnAndMute;
						}
						//	rates were not exceeded, reset and start a new interval with normal op
						this.errorMail_SeriesStartTime = DateTime.Now;
						this.errorMail_CountInSeries = 1;
						return FloodPeventionResult.NormalOperation;
					}

					//	handle current interval is still on - only increase the sent mail count
					++this.errorMail_CountInSeries;
					return FloodPeventionResult.NormalOperation;
				}
			}


			public bool IsActive => true;

			public ILog Logger
			{
				get
				{
					Debug.Assert(this.internalLogger is not LogSinkRouter logSinkRouter || !logSinkRouter.HasLogSink(this));
					return this.internalLogger;
				}
			}
			readonly ILog internalLogger;

			public LogSinkRouter Owner { get; }
			public GmailImapClient GmailImapClient { get; }
			public string Prefix { get; }
			public string SenderName { get; }
			public string SenderEmail { get; }
			public string RecipientName { get; }
			public string RecipientEmail { get; }

			readonly object sync = new();

			static readonly TimeSpan ErrorMail_RateMonitorInterval = new(0, 0, 1);
			static readonly TimeSpan ErrorMail_MuteInterval = new(1, 0, 0);
			const int ErrorMail_MaxAllowedRate = 7;

			DateTime? errorMail_SeriesStartTime;
			int errorMail_CountInSeries = 0;
			bool errorMail_Muted = false;
		}

		#endregion

		#region Commands

		abstract class GmailImapCommand : AsyncCommand, IFalaelContextAware
		{
			public GmailImapCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state)
			{
				this.CoreContext = coreContext;

				this.configuration = configuration;
				this.dataStoreNameProvider = dataStoreNameProvider;
				this.state = state;
			}

			public IFalaelContext CoreContext { get; }

			public ILog Log { get { return this.CoreContext.Log; } }

			public ConfigurationRepository ConfigurationRepository { get { return this.CoreContext.ConfigurationRepository; } }

			protected readonly Configuration configuration;
			protected readonly DataStoreNameProvider dataStoreNameProvider;
			protected readonly State state;
		}

		class GetFirstInboxMessageCommand : GmailImapCommand
		{
			public GetFirstInboxMessageCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x2E617F),
					nameof(GmailImapClient), nameof(GetFirstInboxMessageCommand), nameof(Execute)
				);

				try
				{
					if (this.state.AccessToken == null) throw new AuthenticationException("No access token.");

					using (var client = new ImapClient())
					{
						await client.ConnectAsync(this.configuration.Service_Gmail_Imap_Server, this.configuration.Service_Gmail_Imap_Port, SecureSocketOptions.SslOnConnect);
						await client.AuthenticateAsync(new SaslMechanismOAuth2(this.configuration.Service_Gmail_AccountName, this.state.AccessToken));

						var inbox = client.Inbox;
						await inbox.OpenAsync(FolderAccess.ReadWrite);
						var uids = await inbox.SearchAsync(SearchQuery.All);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD05262), 
							nameof(GmailImapClient), nameof(GetFirstInboxMessageCommand), nameof(Execute), "found", uids.Count, "emails in inbox", 
							CL(nameof(uids), string.Join(" ", uids.ToArray()))
						);

						foreach (var uid in uids)
						{
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x9A1F9E),
								nameof(GmailImapClient), nameof(GetFirstInboxMessageCommand), nameof(Execute), "reading inbox message", $"[0/{uids.Count}]", nameof(uid), uid
							);

							this.result = new MessageInFolder
							{
								MimeMessage = await inbox.GetMessageAsync(uid),
								UniqueId = uid,
								Folder = "Inbox",
							};

							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xC07FD1),
								nameof(GmailImapClient), nameof(GetFirstInboxMessageCommand), nameof(Execute),
								nameof(uid), uid,
								CL33("TO", this.result.MimeMessage.To),
								CL33("FROM", this.result.MimeMessage.From),
								CL57("SUBJECT", this.result.MimeMessage.Subject),
								CL129("MESSAGEID", this.result.MimeMessage.MessageId),
								CL("BODY", Environment.NewLine, this.result.MimeMessage.TextBody ?? this.result.MimeMessage.HtmlBody + Environment.NewLine));
							break;
						}
						await client.DisconnectAsync(true);
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xC69086),
						nameof(GmailImapClient), nameof(GetFirstInboxMessageCommand), nameof(Execute), "Done."
					);
				}
				catch (AuthenticationException ex)
				{
					throw new AsyncCommandRetryException("Failed to obtain first message, refreshing access token...", ex, [new RefreshAccessTokenCommand(this.CoreContext, this.configuration, this. dataStoreNameProvider, this.state)]);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to obtain first message, aborting...", ex);
				}
			}

			public override int Priority => 100;

			public MessageInFolder? Result
			{
				get
				{
					return this.result;
				}
			}

			MessageInFolder? result = null;
		}

		class GetAllInboxMessagesCommand : GmailImapCommand
		{
			public GetAllInboxMessagesCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state, uint[]? skipUids = null)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
				this.skipUids = skipUids;
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x69D74C),
					nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute),
					CL(nameof(this.skipUids), string.Join(" ", this.skipUids?.ToArray() ?? []))
				);

				try
				{
					if (this.state.AccessToken == null) throw new AuthenticationException("No access token.");

					using (var client = new ImapClient())
					{
						await client.ConnectAsync(this.configuration.Service_Gmail_Imap_Server, this.configuration.Service_Gmail_Imap_Port, SecureSocketOptions.SslOnConnect);
						await client.AuthenticateAsync(new SaslMechanismOAuth2(this.configuration.Service_Gmail_AccountName, this.state.AccessToken));

						var inbox = client.Inbox;
						await inbox.OpenAsync(FolderAccess.ReadWrite);
						var uids = await inbox.SearchAsync(SearchQuery.All);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x3C3E57),
							nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute),
							CL33("found", uids.Count, "emails in inbox"),
							CL(nameof(uids), string.Join(" ", uids.ToArray()))
							);

						List<MessageInFolder>? result = [];
						int i = 0;
						foreach (var uid in uids)
						{
							if (this.skipUids != null && Array.IndexOf(this.skipUids, uid.Id) != -1)
							{
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE8CCA8),
									nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute), $"[{i}/{uids.Count}] inbox message", nameof(uid), uid, "skipped."
								);
								++i;
								continue;
							}
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x5327E6),
								nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute), $"[{i}/{uids.Count}] reading inbox message", nameof(uid), uid
							);
							var mif = new MessageInFolder
							{
								MimeMessage = await inbox.GetMessageAsync(uid),
								UniqueId = uid,
								Folder = "Inbox",
							};
							result?.Add(mif);

							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x2083AC),
								nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute),
								nameof(uid), uid,
								CL33("TO", mif.MimeMessage.To),
								CL33("FROM", mif.MimeMessage.From),
								CL57("SUBJECT", mif.MimeMessage.Subject),
								CL129("MESSAGEID", mif.MimeMessage.MessageId),
								CL("BODY", Environment.NewLine, mif.MimeMessage.TextBody ?? mif.MimeMessage.HtmlBody + Environment.NewLine));
							++i;
						}
						await client.DisconnectAsync(true);
						this.result = result?.ToArray();
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xA8D38B),
						nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute), "Done."
					);
				}
				catch (AuthenticationException ex)
				{
					throw new AsyncCommandRetryException("Failed to obtain first message, refreshing access token...", ex, [new RefreshAccessTokenCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state)]);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to obtain first message, aborting...", ex);
				}
			}

			public override int Priority => 100;

			public MessageInFolder[]? Result
			{
				get
				{
					return this.result;
				}
			}

			MessageInFolder[]? result = null;

			readonly uint[]? skipUids = null;
		}

		class MoveFromInboxToFolderCommand : GmailImapCommand
		{
			public MoveFromInboxToFolderCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state, uint messageUidInInbox, string destinationFolderPath)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
				this.messageUidInInbox = messageUidInInbox;
				this.destinationFolderPath = destinationFolderPath;
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xA8376C),
					nameof(GmailImapClient), nameof(MoveFromInboxToFolderCommand), nameof(Execute),
					CL(nameof(this.messageUidInInbox), this.messageUidInInbox, nameof(this.destinationFolderPath), this.destinationFolderPath)
				);

				try
				{
					if (this.state.AccessToken == null) throw new AuthenticationException("No access token.");

					using (var client = new ImapClient())
					{
						await client.ConnectAsync(this.configuration.Service_Gmail_Imap_Server, this.configuration.Service_Gmail_Imap_Port, SecureSocketOptions.SslOnConnect);
						await client.AuthenticateAsync(new SaslMechanismOAuth2(this.configuration.Service_Gmail_AccountName, this.state.AccessToken));

						var inbox = client.Inbox;
						await inbox.OpenAsync(FolderAccess.ReadWrite);

						var uid = new UniqueId(this.messageUidInInbox);
						
						var message = await inbox.GetMessageAsync(uid) ?? throw new InvalidOperationException("Message not found in the inbox.");

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xEF0D81),
							nameof(GmailImapClient), nameof(GetAllInboxMessagesCommand), nameof(Execute),
							nameof(uid), uid,
							CL33("TO", message.To),
							CL33("FROM", message.From),
							CL57("SUBJECT", message.Subject),
							CL129("MESSAGEID", message.MessageId),
							CL("BODY", Environment.NewLine, message.TextBody ?? message.HtmlBody + Environment.NewLine));

						var destinationFolder = await client.GetFolderAsync(this.destinationFolderPath) ?? throw new InvalidOperationException("Destination folder not found.");

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x9043D4),
							nameof(GmailImapClient), nameof(MoveFromInboxToFolderCommand), nameof(Execute), "destination folder status", "(1)", destinationFolder.FullName, destinationFolder.IsOpen, destinationFolder.Access
						);

						// reopen the destination folder in ReadWrite mode just before the move
						if (!destinationFolder.IsOpen || destinationFolder.Access != FolderAccess.ReadWrite) await destinationFolder.OpenAsync(FolderAccess.ReadWrite);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x259B34), 
							nameof(GmailImapClient), nameof(MoveFromInboxToFolderCommand), nameof(Execute), "destination folder status", "(2)", destinationFolder.FullName, destinationFolder.IsOpen, destinationFolder.Access
						);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE181DF),
							nameof(GmailImapClient), nameof(MoveFromInboxToFolderCommand), nameof(Execute), "inbox folder status", "(1)", inbox.FullName, inbox.IsOpen, inbox.Access
						);

						// reopen the inbox in ReadWrite mode just before the move (for some reason it was losing its ReadWrite access...)
						if (!inbox.IsOpen || inbox.Access != FolderAccess.ReadWrite) await inbox.OpenAsync(FolderAccess.ReadWrite);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x47BC3A),
							nameof(GmailImapClient), nameof(MoveFromInboxToFolderCommand), nameof(Execute), "inbox folder status", "(2)", inbox.FullName, inbox.IsOpen, inbox.Access
						);

						await inbox.MoveToAsync(uid, destinationFolder);

						await client.DisconnectAsync(true);
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xE1D767), 
						nameof(GmailImapClient), nameof(MoveFromInboxToFolderCommand), nameof(Execute), "Done."
					);
				}
				catch (AuthenticationException ex)
				{
					throw new AsyncCommandRetryException("Failed to move message, refreshing access token...", ex, [new RefreshAccessTokenCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state)]);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to move message, aborting...", ex);
				}
			}

			public override int Priority => 90;

			readonly uint messageUidInInbox;
			readonly string destinationFolderPath;
		}

		class MoveToFolderCommand : GmailImapCommand
		{
			public MoveToFolderCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state, string messageId, string destinationFolderPath, Regex skipImapFoldersRegex)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
				this.messageId = messageId;
				this.destinationFolderPath = destinationFolderPath;
				this.skipImapFoldersRegex = skipImapFoldersRegex;
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x975838),
					nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute),
					CL(nameof(this.messageId), this.messageId, nameof(this.destinationFolderPath), this.destinationFolderPath, nameof(this.skipImapFoldersRegex), string.Join(" ", this.skipImapFoldersRegex))
				);

				try
				{
					if (this.state.AccessToken == null) throw new AuthenticationException("No access token.");

					UniqueId? uid = null;
					IMailFolder? sourceFolder = null;
					MimeMessage? message = null;

					using (var client = new ImapClient())
					{
						await client.ConnectAsync(this.configuration.Service_Gmail_Imap_Server, this.configuration.Service_Gmail_Imap_Port, SecureSocketOptions.SslOnConnect);
						await client.AuthenticateAsync(new SaslMechanismOAuth2(this.configuration.Service_Gmail_AccountName, this.state.AccessToken));

						// Locate the message folder
						var folders = await client.GetFoldersAsync(client.PersonalNamespaces[0]);

						foreach (var folder in folders)
						{
							if (this.skipImapFoldersRegex != null && this.skipImapFoldersRegex.IsMatch(folder.FullName))
							{
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD8D0ED), 
									nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "skipped by configuration", nameof(folder), folder.FullName
								);
								continue;
							}

							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xB95EEA),
								nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "examining folder", folder.FullName, "for message", nameof(this.messageId), this.messageId
							);
							
							await folder.OpenAsync(FolderAccess.ReadOnly);
							
							var uids = await folder.SearchAsync(SearchQuery.HeaderContains("Message-ID", this.messageId));

							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xDEBD04), 
								nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), nameof(this.messageId), this.messageId, "in", nameof(folder), folder.FullName, nameof(uids), string.Join(" ", uids.ToArray())
							);
							
							if (uids.Count > 0)
							{
								sourceFolder = folder;
								uid = uids[0];
								break;
							}
						}

						if (sourceFolder == null || uid == null) throw new InvalidOperationException("Message not found in any folder.");

						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x5D6C0C), 
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), nameof(sourceFolder), sourceFolder.FullName
						);

						message = await sourceFolder.GetMessageAsync(uid.Value);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x96071D),
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute),
							nameof(uid), uid,
							CL33("TO", message.To),
							CL33("FROM", message.From),
							CL57("SUBJECT", message.Subject),
							CL129("MESSAGEID", message.MessageId),
							CL("BODY", Environment.NewLine, message.TextBody ?? message.HtmlBody + Environment.NewLine)
						);

						var destinationFolder = await client.GetFolderAsync(this.destinationFolderPath) ?? throw new InvalidOperationException("Destination folder not found.");

						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xA01118),
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), nameof(destinationFolder), destinationFolder.FullName
						);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x65B2ED),
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "status", "(1)", nameof(destinationFolder), destinationFolder.IsOpen, destinationFolder.Access
						);

						// open the destination folder in ReadWrite mode
						if (!destinationFolder.IsOpen || destinationFolder.Access != FolderAccess.ReadWrite) await destinationFolder.OpenAsync(FolderAccess.ReadWrite);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x2DB747),
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "status", "(2)", nameof(destinationFolder), destinationFolder.IsOpen, destinationFolder.Access
						);

						await destinationFolder.AppendAsync(message);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x707CFA),
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "status", "(1)", nameof(sourceFolder), sourceFolder.IsOpen, sourceFolder.Access
						);

						// Reopen the source folder in ReadWrite mode and delete the message
						await sourceFolder.OpenAsync(FolderAccess.ReadWrite);
						await sourceFolder.AddFlagsAsync(uid.Value, MessageFlags.Deleted, true);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xF83F6B),
							nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "status", "(2)", nameof(sourceFolder), sourceFolder.IsOpen, sourceFolder.Access
						);

						// expunge the message to remove it permanently (whatever that means)
						await sourceFolder.ExpungeAsync();

						await client.DisconnectAsync(true);
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x1B675E),
						nameof(GmailImapClient), nameof(MoveToFolderCommand), nameof(Execute), "Done."
					);
				}
				catch (AuthenticationException ex)
				{
					throw new AsyncCommandRetryException("Failed to move message, refreshing access token...", ex, [new RefreshAccessTokenCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state)]);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to move message, aborting...", ex);
				}
			}

			public override int Priority => 90;

			readonly string messageId;
			readonly string destinationFolderPath;
			readonly Regex skipImapFoldersRegex;
		}

		class CreateTextMessageInInboxCommand : GmailImapCommand
		{
			public CreateTextMessageInInboxCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state, MimeMessage mimeMessage)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
				this.mimeMessage = mimeMessage;
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xE00532),
					nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute),
					CL33("TO", this.mimeMessage.To),
					CL33("FROM", this.mimeMessage.From),
					CL57("SUBJECT", this.mimeMessage.Subject),
					CL129("MESSAGEID", this.mimeMessage.MessageId),
					CL("BODY", Environment.NewLine, this.mimeMessage.TextBody ?? this.mimeMessage.HtmlBody + Environment.NewLine)
				);

				try
				{
					if (this.state.AccessToken == null) throw new AuthenticationException("No access token.");

					using (var client = new ImapClient())
					{
						await client.ConnectAsync(this.configuration.Service_Gmail_Imap_Server, this.configuration.Service_Gmail_Imap_Port, SecureSocketOptions.SslOnConnect);
						await client.AuthenticateAsync(new SaslMechanismOAuth2(this.configuration.Service_Gmail_AccountName, this.state.AccessToken));

						var inbox = client.Inbox;
						await inbox.OpenAsync(FolderAccess.ReadWrite);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE14F78),
							nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute), "folder status", "(1)", nameof(inbox), inbox.FullName, inbox.IsOpen, inbox.Access
						);

						var uid = await inbox.AppendAsync(this.mimeMessage);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8AD046),
							nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute), "new inbox", nameof(uid), uid.Value.Id
						);

						// reopen the inbox in ReadWrite mode just before the move (for some reason it was losing its ReadWrite access...)
						if (!inbox.IsOpen || inbox.Access != FolderAccess.ReadWrite) await inbox.OpenAsync(FolderAccess.ReadWrite);

						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xA711E5),
							nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute), "folder status", "(2)", nameof(inbox), inbox.FullName, inbox.IsOpen, inbox.Access
						);

						if (uid != null)
						{
							var message = await inbox.GetMessageAsync(uid.Value);
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x86CA5A),
								nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute), "new", nameof(message.MessageId), message.MessageId
							);
						}
						else
						{
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE8C15F),
								nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute), "failed to locate new message in inbox"
							);
							throw new Exception($"Failed to locate new message in inbox after creation:{Environment.NewLine}From: {this.mimeMessage.From}{Environment.NewLine}To: {this.mimeMessage.To}{Environment.NewLine}Subject: {this.mimeMessage.Subject}{Environment.NewLine}Text body:{Environment.NewLine}{this.mimeMessage.TextBody}{Environment.NewLine}HTML body:{Environment.NewLine}{this.mimeMessage.HtmlBody}");
						}

						await client.DisconnectAsync(true);
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xEE318A),
						nameof(GmailImapClient), nameof(CreateTextMessageInInboxCommand), nameof(Execute), "Done."
					);
				}
				catch (AuthenticationException ex)
				{
					throw new AsyncCommandRetryException("Failed to create message, refreshing access token...", ex, [new RefreshAccessTokenCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state)]);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to create message, aborting...", ex);
				}
			}

			public override int Priority => 80;

			MimeMessage mimeMessage { get; }
		}

		class RefreshAccessTokenCommand : GmailImapCommand
		{
			public RefreshAccessTokenCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x8DAFE1),
					nameof(GmailImapClient), nameof(RefreshAccessTokenCommand), nameof(Execute)					
				);

				try
				{
					string refreshToken = (await new FileDataStore(await this.dataStoreNameProvider.QueryGmailDataStoreName()).GetAsync<TokenResponse>("user"))?.RefreshToken ?? throw new TokenResponseException(new TokenErrorResponse { Error = "invalid_grant" });
					using (var httpClient = new HttpClient())
					{
						var request = new HttpRequestMessage(HttpMethod.Post, this.configuration.Service_Gmail_OAuth_Url);
						var content = new FormUrlEncodedContent(
						[
							new KeyValuePair<string, string>("client_id", this.configuration.Service_Gmail_OAuth_Client_Id),
							new KeyValuePair<string, string>("client_secret", this.configuration.Service_Gmail_OAuth_Client_Secret),
							new KeyValuePair<string, string>("refresh_token", refreshToken),
							new KeyValuePair<string, string>("grant_type", "refresh_token")
						]);

						request.Content = content;
						var response = await httpClient.SendAsync(request);
						if (!response.IsSuccessStatusCode)
						{
							var error = await response.Content.ReadAsStringAsync();
							if (response.StatusCode == HttpStatusCode.BadRequest && error.Contains("invalid_grant")) throw new TokenResponseException(new TokenErrorResponse { Error = "invalid_grant" });
							throw new Exception(error);
						}

						var payload = await response.Content.ReadAsStringAsync();
						var tokenResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<TokenResponse>(payload) ?? throw new Exception($"Invalid response format: {payload}.");
						this.result = tokenResponse.AccessToken;
						this.state.AccessToken = this.result;
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x1F7411),
						nameof(GmailImapClient), nameof(RefreshAccessTokenCommand), nameof(Execute), "Done."
					);
				}
				catch (TokenResponseException ex)
				{
					throw new AsyncCommandRetryException("Failed to obtain access token, resetting refresh token...", ex, [new ResetRefreshTokenCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state)]);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to obtain access token, aborting...", ex);
				}
			}

			public override int Priority => 50;

			public string? Result
			{
				get
				{
					return this.result;
				}
			}

			string? result = null;
		}

		class ResetRefreshTokenCommand : GmailImapCommand
		{
			public ResetRefreshTokenCommand(IFalaelContext coreContext, Configuration configuration, DataStoreNameProvider dataStoreNameProvider, State state)
				: base(coreContext, configuration, dataStoreNameProvider, state)
			{
			}

			public override async Task Execute()
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x2846F7),
					nameof(GmailImapClient), nameof(ResetRefreshTokenCommand), nameof(Execute)
				);

				try
				{
					await this.dataStoreNameProvider.InvalidateGmailDataStoreName();
					var clientSecrets = new ClientSecrets
					{
						ClientId = this.configuration.Service_Gmail_OAuth_Client_Id,
						ClientSecret = this.configuration.Service_Gmail_OAuth_Client_Secret
					};
					var scopes = new[] { this.configuration.Service_Gmail_OAuth_Scope };
					var credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(clientSecrets, scopes, "user", CancellationToken.None, new FileDataStore(await this.dataStoreNameProvider.QueryGmailDataStoreName()));
					this.result = credential.Token.RefreshToken;

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x9357FB),
						nameof(GmailImapClient), nameof(ResetRefreshTokenCommand), nameof(Execute), "Done."
					);
				}
				catch (Exception ex)
				{
					throw new AsyncCommandAbortException("Failed to obtain refresh token, aborting...", ex);
				}
			}

			public override int Priority => 25;

			public string? Result
			{
				get
				{
					return this.result;
				}
			}

			string? result = null;
		}

		#endregion

		#region IEmailSend

		public async Task SendAsync(EmailMessage emailMessage)
		{
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xF1E34A),
				nameof(GmailImapClient), nameof(SendAsync),
				CL33("to", $"\"{emailMessage.RecipientName}\" <{emailMessage.RecipientEmail}>"),
				CL33("from", $"\"{emailMessage.SenderName}\" <{emailMessage.SenderEmail}>"),
				CL513("text", emailMessage.Text),
				CL1025("att", emailMessage.GetAttachmentsJSON()));

			try
			{
				await this.CreateTextMessageInInbox(emailMessage.ToMimeKitMessage());
			}
			catch (EmailSendException)
			{
				throw;
			}
			catch (Exception ex)
			{
				throw new EmailSendException(emailMessage, "Unable to send email.", ex);
			}
		}

		#endregion


		public async Task<MessageInFolder?> GetFirstInboxMessage(bool useLock)
		{
			if (useLock)
			{
				using Peg peg = await this.dataStoreNameProvider.GmailImapDataStoreUtility.HoldGmailImapClientPeg($"{nameof(GmailImapClient)}/nameof(GetFirstInboxMessage)", this.LockId);

				var command = new GetFirstInboxMessageCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state);
				await this.commandOrchestrator.PostCommand(command);
				await command.WaitAsync();
				return command.Result;
			}
			else
			{
				var command = new GetFirstInboxMessageCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state);
				await this.commandOrchestrator.PostCommand(command);
				await command.WaitAsync();
				return command.Result;
			}
		}

		public async Task<MessageInFolder[]> GetAllInboxMessages(uint[]? skipUids = null)
		{
			var command = new GetAllInboxMessagesCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state, skipUids);
			await this.commandOrchestrator.PostCommand(command);
			await command.WaitAsync();
			Debug.Assert(command.Result != null);
			return command.Result;
		}

		public async Task MoveFromInboxToFolder(uint messageUidInInbox, string destinationFolderPath)
		{
			var command = new MoveFromInboxToFolderCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state, messageUidInInbox, destinationFolderPath);
			await this.commandOrchestrator.PostCommand(command);
			await command.WaitAsync();
		}

		public async Task MoveToFolder(string messageId, string destinationFolderPath)
		{
			var command = new MoveToFolderCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state, messageId, destinationFolderPath, this.configuration.Service_Gmail_Imap_SkipFoldersRegex);
			await this.commandOrchestrator.PostCommand(command);
			await command.WaitAsync();
		}

		public async Task CreateTextMessageInInbox(MimeMessage mimeMessage)
		{
			var command = new CreateTextMessageInInboxCommand(this.CoreContext, this.configuration, this.dataStoreNameProvider, this.state, mimeMessage);
			await this.commandOrchestrator.PostCommand(command);
			await command.WaitAsync();
		}

		public AsyncCommandQueue CommandOrchestrator
		{
			get
			{
				return this.commandOrchestrator; 
			}
		}

		public Guid LockId
		{
			get
			{
				return this.dataStoreNameProvider.LockId;
			}
		}

		public string AccountEmail
		{
			get
			{
				return this.configuration.Service_Gmail_AccountName;
			}
		}


		readonly Configuration configuration;
		readonly DataStoreNameProvider dataStoreNameProvider;
		readonly State state = new();

		readonly AsyncCommandQueue commandOrchestrator = new(10);
	}
}
