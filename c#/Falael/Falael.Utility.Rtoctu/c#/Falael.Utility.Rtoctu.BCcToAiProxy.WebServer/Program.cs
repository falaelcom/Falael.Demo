using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;

using Falael.Core.Syncronization;
using Falael.IO;
using Falael.Services;

using Grapevine.Interfaces.Server;
using Grapevine.Server;
using Grapevine.Server.Attributes;
using Grapevine.Shared;

using static System.Net.Mime.MediaTypeNames;
using static Falael.IO.FileSystemObserver;
using static Falael.Utility.Rtoctu.BCcToAiProxy.WebServer.Program;

using HttpStatusCode = Grapevine.Shared.HttpStatusCode;

namespace Falael.Utility.Rtoctu.BCcToAiProxy.WebServer
{
	internal class Program
	{
		const ulong LGID = 0x5A1FA4;

		static readonly Path dataDirPath = @"c:\repos\Kljuchko.WEB\data\Falael.Utility.Rtoctu.BCcToAiProxy".ToPath(denotesFile: false);
		static readonly Path logFilePath = dataDirPath.SetFileName("bc4-web-ai-extender.web-server.log");
		static readonly Path webRootDirPath = @"C:\repos\Falael.CODE\code\Falael\Falael.Utility.Rtoctu\c#\Falael.Utility.Rtoctu.BCcToAiProxy.WebServer\res\".ToPath();

		#region GPT Prompts

		internal static readonly string SystemContext =
@"
You are a professional OpenCart specialist, you have fully read the source code of all OpenCart versions, and you exellent professional data management, comparison, processing and migration 
capabilities. 

Your task is to analyze two file versions of the same file from different OpenCart versions:

- oc_v4.0.2.3-alvina (left file) is an older OpenCart 4.0.2.3 modified by a theme; 
- oc_v4.1.0.3-accento (right file) is a OpenCart 4.1.0.3 official unmodified version (accento is a codename for the target of porting, and what you see here before the porting is identical with oc_v4.1.0.3-official).

We are aiming to migrate the theme from the oc_v4.0.2.3-alvina to oc_v4.1.0.3-accento.
 
There is another significant OpenCart version - oc_v4.0.2.3-official - the official unmodified 4.0.2.3, not covered in the comparison. This is the base oc version for the oc_v4.0.2.3-alvina theme.

There are two deltas that you need to consider:
- between oc_v4.0.2.3-official -> oc_v4.1.0.3-accento (oc_v4.1.0.3-accento introduces official changes that we need to conserve to our best ability without hurting the theme);
- between oc_v4.1.0.3-accento -> oc_v4.0.2.3-alvina (oc_v4.0.2.3-alvina introduces changes that we need to apply to the Right Official OC);

As part of your task you'll need to understand all changes in both deltas, explain them to the programmer who is in charge of the migration, and advise on which changes from both delta to
respect and how to merge them into the final oc_v4.1.0.3-accento (meaining oc_v4.1.0.3-official plust the theme applied on it).

You won't volunteer merged code unless ecplicitly asked by the user, you will focus only on the differences, their significance, analysis and recommendations for merge and migration.

When you print merged code: don't introduce any changes like new lines and ident and pretty formatting that are not on the original file and are not relevant for merge, only make changes 100% mandatory for the merge.

now answer short and no other text, only answer; never volunteer sources unless ecplicitly asked by the user; always be absolutely honest to the extent of bluntness; never try to please the user and use critical reasoning and expert knowledge to land on a motivated advice when such is due. when doing analyzis, always print only the jist and keep all information short and concise as you would write a report to an IT specialist. stop flooding me, formulate each piece of information short;
KEEP IN MIND THAT WE ARE MIGRATING THE THEME TO GET ITS BENEFITS. WHERE LAYOUT OR STYLE CONFLICTS, PREFER THEME UNLESS THERE IS A FUNCTIONAL REASON NOT TO; ALWAYS ELEVATE SUCH CASES FOR DISCUSSION
ALWAYS PREFER SPACE AND NEW LINE CODE STYLING OF THE OFFICIAL/ACCENTO VERSION UNLESS SPACING CARRIES FUNCTIONAL SIGNIFICANCE (IPMPORTANT FOR FUTURE MIGRATIONS, MINIMIZES DELTA WITH THE OFFICIAL)
";
		internal static readonly string DiffRepostPrompt =

@"
Here is an updated diff after I made some changes.
";
		#endregion

		static async Task AsyncMain(string[] args)
		{
			try
			{
				Context = new TContext();
				HttpRestEndpoints.SetContext(Context);

				#region Logging

				int maxLogDensity = LogDensity.LD_6_7;
				int maxLineLength = 270;

				var debugLogSink = new DebugLogSink();
				var consoleLogSink = new ConsoleLogSink();
				var fileLogSink = new FileLogSink(logFilePath);

				var log = new LogSinkRouter("Rtoctu.BCcToAiProxy");

				log.AddLogSink(debugLogSink, new() { MaxLogDensity = maxLogDensity });
				log.AddLogSink(consoleLogSink, new() { MaxLineLength = maxLineLength, MaxLogDensity = maxLogDensity });
				log.AddLogSink(fileLogSink, new() { MaxLogDensity = maxLogDensity });

				log.WriteLine(LogDensity.Unset, (LGID, 0xDC31C0),
					"Session Start:", string.Join(' ', args)
				);

				#endregion

				try
				{
					var programContext = new FalaelContext();
					programContext.Initialize(log);

					Context.Log = log;
					Context.ChatsDirPath = dataDirPath;
					Context.WebRootDirPath = webRootDirPath;
					Context.OpenAIChatClient = new OpenAIChatMeteredService(
						programContext,
						new OpenAIChatMeteredService.UsageMeter(programContext, 1, 5),
						TimeSpan.FromSeconds(10),
						(int)TimeSpan.FromSeconds(90).TotalMilliseconds,
						apiKey: "***"
					);
					Context.OpenAIChatMeteredServiceRequestOptions = new OpenAIChatMeteredService.RequestOptions
					{
						Model = "gpt-5-chat-latest",
						IsReasoningModelModel = false,
						ParseJson = false,
						ResponseMaxTokenCount = 1500,
						UseInternalCache = false,
					};
					Context.OperationObserver = new SemaphoreSmart.DebuggingObserver(programContext, nameof(Program) + "." + nameof(HttpRestEndpoints));
					Context.SystemContext = SystemContext;

					#region File System Observer

					FileSystemObserver fso = new FileSystemObserver(
						programContext,
						configuration: new FileSystemObserver.Configuration
						{
							Fso_AcceptedFileExtensions = [".BC4-Report"],
						},
						Context.ChatsDirPath,
						new ChangedDelegate((fso, fileEvents) =>
						{
							log.WriteLine(Severity.Neutral, (LGID, 0x17FA00),
								nameof(Program), nameof(fso), $"Change batch count: {fileEvents.Count}"
							);

							foreach (var fileEvent in fileEvents)
							{
								var rootPath = Context.ChatsDirPath;
								var fullFilePath = fileEvent.FileFootprint.RelativePath.ToPath().GetFullPath(rootPath);
								switch (fileEvent.FileChangeType)
								{
									case FileChangeType.Created:
									case FileChangeType.Modified:
										ChatEntity chatEntity = new();
										var rawDiff = fullFilePath.ReadText();
										if (rawDiff.StartsWith("test")) rawDiff = rawDiff.Substring(4);
										var diff = "\n````\n" + rawDiff + "\n````\n";
										var chatJsonFilePath = fullFilePath.SetFileExtension(".json");
										var needsInit = false;
										var needsRepost = false;
										if (chatJsonFilePath.Exists())
										{
											chatEntity = ChatEntity.FromJSON(chatJsonFilePath.ReadText());
											if (chatEntity.history.Count < 2) needsInit = true;
											else
											{
												var test1 = diff;
												var test2 = DiffRepostPrompt + diff;
												if (!chatEntity.history.Any(v => v.role == "user" && (v.content == test1 || v.content == test2))) needsRepost = true;
											}
										}
										else needsInit = true;

										if (needsInit)
										{
											string outcome = "";
											lock (Context.OpenAIChatClient)
											{
												var success = false;
												while (!success)
												{
													try
													{
														outcome = Context.OpenAIChatClient.SendMessageAsync(Context.OperationObserver, SystemContext, diff, Context.OpenAIChatMeteredServiceRequestOptions).Result;
														success = true;
													}
													catch (Exception ex)
													{
														Context.Log.WriteLine(Severity.Alert, (LGID, 0x994434),
															"OpenAI chat attempt failed, retrying indefinitely...", ex
														);
													}
												}
											}

											Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x86D791),
												Environment.NewLine + outcome
											);

											chatEntity.history.Add(new() { role = "user", content = diff });
											chatEntity.history.Add(new() { role = "assistant", content = outcome });
										}
										else if (needsRepost)
										{
											string outcome;
											lock (Context.OpenAIChatClient)
											{
												outcome = Context.OpenAIChatClient.SendMessageAsync(Context.OperationObserver, Context.SystemContext, chatEntity.history.Select(v => (v.role!, v.content!)).ToList(), DiffRepostPrompt + diff, Context.OpenAIChatMeteredServiceRequestOptions).Result;
											}
											chatEntity.history.Add(new() { role = "user", content = DiffRepostPrompt + diff });

											chatEntity.history.Add(new() { role = "assistant", content = outcome });
										}

										lock (Context)
										{
											chatJsonFilePath.WriteText(chatEntity.ToJSON());
											Context.ValidTimestamp = chatJsonFilePath.UnixTimestamp();
										}
										break;
									case FileChangeType.Deleted:
										fullFilePath
											.GetDirectoryPath()
											.EnumerateFiles(fullFilePath.SetFileExtension(".*"))
											.DeleteAsFiles();
										lock (Context)
										{
											Context.ValidTimestamp = 0;
										}
										break;
									default:
										break;
								}
							}
						})
					);

					#endregion

					#region Web Server

					RestServer? server = null;
					server = new RestServer(new ServerSettings
					{
						Host = "localhost",
						Port = "3523",
						Logger = new Grapevine.Shared.Loggers.ConsoleLogger(Grapevine.Interfaces.Shared.LogLevel.Warn)
					});
					server.Start();
					log.WriteLine(LogDensity.Unset, (LGID, 0x3D8F3C), "[HTTP/REST] Server is now running.");

					#endregion
				}
				catch (Exception ex)
				{
					log.WriteLine(Severity.Error, (LGID, 0x876293),
						ex
					);
				}
			}
			catch (Exception ex)
			{
				Debug.WriteLine(ex.ToString());
				Console.WriteLine(ex.ToString());
				File.AppendAllText(logFilePath, ex.ToString());
			}
		}

		static void Main(string[] args)
		{
			AsyncMain(args).GetAwaiter().GetResult();
		}

#pragma warning disable CS8618
		static TContext Context { get; set; }
#pragma warning restore CS8618
	}


	[RestResource]
	public class HttpRestEndpoints
	{
		const ulong LGID = 0xEF57D1;

		public static void SetContext(TContext context)
		{
			Context = context;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.GET, PathInfo = @"/is_valid")]
		public IHttpContext Manage_IsValid_GET(IHttpContext httpContext)
		{
			string queryStringLog = httpContext.Request.QueryString.AllKeys?.Length > 0
				? string.Join("&", httpContext.Request.QueryString.AllKeys
					.Where(key => key != null)
					.Select(key => $"{key}={httpContext.Request.QueryString[key]}"))
				: "(empty)";
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0xDA64E9), $@"[HTTP/REST] GET ""/is_valid"" {httpContext.Request.RemoteEndPoint.Address} {queryStringLog}");

			var validTimestamp = httpContext.Request.QueryString.GetValue<int?>("validTimestamp", null);

			if (validTimestamp == null)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x19C915), $@"[HTTP/REST] GET ""/is_valid"" {httpContext.Request.RemoteEndPoint.Address} ""validTimestamp == null""");
					httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad validTimestamp"
				);
				return httpContext;
			}

			try
			{
				lock (Context)
				{
					var result = (Context.ValidTimestamp == validTimestamp).ToString().ToLower();
					Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x15E576), 
						$@"[HTTP/REST] GET ""/is_valid"" {httpContext.Request.RemoteEndPoint.Address} {result}"
					);
					return this.ServeTextContent(httpContext, "application/json", result);
				}
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x7652D7), $@"[HTTP/REST] GET ""/is_valid"" Error: {ex}");
			}

			httpContext.Response.SendResponse(HttpStatusCode.Ok, "OK");
			return httpContext;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.GET, PathInfo = @"/list_chats")]
		public IHttpContext Manage_ListChats_GET(IHttpContext httpContext)
		{
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x9758E0), $@"[HTTP/REST] GET ""/list_chats"" {httpContext.Request.RemoteEndPoint.Address}");

			try
			{
				lock (Context)
				{
					var jsonFilePaths = Context.ChatsDirPath
						.GetDirectoryPath()
						.EnumerateFiles("*.json");
					Context.ValidTimestamp = jsonFilePaths.Any() 
						? jsonFilePaths.Max(v => v.UnixTimestamp())
						: 0;

					var chats = jsonFilePaths.
						Select(v => new ChatListItemEntity
						{
							chatId = v.FileNameWithoutExtension,
							time = v.SetFileExtension(".BC4-Report").FileInfo().LastWriteTime.ToString(),
							title = v.SetFileExtension(".BC4-Title").ReadText(),
						})
						.ToArray();

					var result = new ChatListEntity
					{
						chats = chats,
						validTimestamp = Context.ValidTimestamp,
					};
					return this.ServeTextContent(httpContext, "application/json", result.ToJSON());
				}
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0xD71934), $@"[HTTP/REST] GET ""/list_chats"" Error: {ex}");
			}

			httpContext.Response.SendResponse(HttpStatusCode.Ok, "OK");
			return httpContext;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.GET, PathInfo = @"/read_chat_by_id")]
		public IHttpContext Manage_ReadChatById_GET(IHttpContext httpContext)
		{
			string queryStringLog = httpContext.Request.QueryString.AllKeys?.Length > 0
				? string.Join("&", httpContext.Request.QueryString.AllKeys
					.Where(key => key != null)
					.Select(key => $"{key}={httpContext.Request.QueryString[key]}"))
				: "(empty)";
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x265891), $@"[HTTP/REST] GET ""/read_chat_by_id"" {httpContext.Request.RemoteEndPoint.Address} {queryStringLog}");

			var id = httpContext.Request.QueryString.GetValue<string?>("id", null);

			if (id == null)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x6E1BB6), $@"[HTTP/REST] GET ""/read_chat_by_id"" {httpContext.Request.RemoteEndPoint.Address} ""id == null""");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad id");
				return httpContext;
			}

			var fullFilePath = Context.ChatsDirPath.SetFileNameWithoutExtension(id).SetFileExtension(".json");

			try
			{
				lock (Context)
				{
					var chatEntity = fullFilePath.Exists() ? ChatEntity.FromJSON(fullFilePath.ReadText()) : new();
					var jsonFilePaths = Context.ChatsDirPath
						.GetDirectoryPath()
						.EnumerateFiles("*.json");
					Context.ValidTimestamp = jsonFilePaths.Any()
						? jsonFilePaths.Max(v => v.UnixTimestamp())
						: 0;
					chatEntity.validTimestamp = Context.ValidTimestamp;
					return this.ServeTextContent(httpContext, "application/json", chatEntity.ToJSON());
				}
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x7BDA3B), $@"[HTTP/REST] GET ""/read_chat_by_id"" Error: {ex}");
			}

			httpContext.Response.SendResponse(HttpStatusCode.Ok, "OK");
			return httpContext;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.POST, PathInfo = @"/post_message")]
		public IHttpContext Manage_PostMessage_POST(IHttpContext httpContext)
		{
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0xEE39F3), $@"[HTTP/REST] POST ""/post_message"" {httpContext.Request.RemoteEndPoint.Address} {httpContext.Request.Payload}");

			var json = httpContext.Request.Payload;
			ChatMessageEntity? chatMessageEntity;
			try
			{
				chatMessageEntity = ChatMessageEntity.FromJSON(json);
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x3324EA), $@"[HTTP/REST] POST ""/post_message"" {httpContext.Request.RemoteEndPoint.Address} {ex}");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad ChatMessageEntity");
				return httpContext;
			}

			if (chatMessageEntity?.chatId == null || chatMessageEntity?.content == null)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x2F200A), $@"[HTTP/REST] POST ""/post_message"" {httpContext.Request.RemoteEndPoint.Address} ""chatMessageEntity?.chatId == null || chatMessageEntity?.content == null""");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad ChatMessageEntity");
				return httpContext;
			}

			try
			{
				lock (Context)
				{
					var fullFilePath = Context.ChatsDirPath.SetFileNameWithoutExtension(chatMessageEntity.chatId).SetFileExtension(".json");
					var chatJsonFilePath = fullFilePath.SetFileExtension(".json");
					var chatEntity = ChatEntity.FromJSON(chatJsonFilePath.ReadText());

					string outcome;
					lock (Context.OpenAIChatClient)
					{
						outcome = Context.OpenAIChatClient.SendMessageAsync(Context.OperationObserver, Context.SystemContext, chatEntity.history.Select(v => (v.role!, v.content!)).ToList(), chatMessageEntity.content, Context.OpenAIChatMeteredServiceRequestOptions, chunk => Context.Log.WriteLine(Severity.Neutral, (LGID, 0x01249B), chunk)).Result;
					}

					Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x5FB1AE),
						Environment.NewLine + outcome
					);

					chatEntity.history.Add(new() { role = "user", content = chatMessageEntity.content });
					chatEntity.history.Add(new() { role = "assistant", content = outcome });
					chatJsonFilePath.WriteText(chatEntity.ToJSON());

					var responseEntity = new ChatMessageResponseEntity
					{
						chatId = chatMessageEntity.chatId,
						@event = "changed",
						errorMessage = null,
						validTimestamp = Context.ValidTimestamp = chatJsonFilePath.UnixTimestamp(),
					};

					return this.ServeTextContent(httpContext, "application/json", responseEntity.ToJSON());
				}
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0xCD8FA3), $@"[HTTP/REST] POST ""/post_message"" Error: {ex}");
			}

			httpContext.Response.SendResponse(HttpStatusCode.Ok, "OK");
			return httpContext;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.POST, PathInfo = @"/post_message_streaming")]
		public IHttpContext Manage_PostMessageStreaming_POST(IHttpContext httpContext)
		{
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x13BE18), $@"[HTTP/REST] POST ""/post_message_streaming"" {httpContext.Request.RemoteEndPoint.Address} {httpContext.Request.Payload}");

			var json = httpContext.Request.Payload;
			ChatMessageEntity? chatMessageEntity;
			try
			{
				chatMessageEntity = ChatMessageEntity.FromJSON(json);
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x3F3F83), $@"[HTTP/REST] POST ""/post_message_streaming"" {httpContext.Request.RemoteEndPoint.Address} {ex}");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad ChatMessageEntity");
				return httpContext;
			}

			if (chatMessageEntity?.chatId == null || chatMessageEntity?.content == null)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0xFDDF02), $@"[HTTP/REST] POST ""/post_message_streaming"" {httpContext.Request.RemoteEndPoint.Address} ""chatMessageEntity?.chatId == null || chatMessageEntity?.content == null""");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad ChatMessageEntity");
				return httpContext;
			}

			try
			{
				lock (Context)
				{
					var fullFilePath = Context.ChatsDirPath.SetFileNameWithoutExtension(chatMessageEntity.chatId).SetFileExtension(".json");
					var chatJsonFilePath = fullFilePath.SetFileExtension(".json");
					var chatEntity = ChatEntity.FromJSON(chatJsonFilePath.ReadText());

					httpContext.Response.Headers["Content-Type"] = "text/event-stream; charset=utf-8";
					httpContext.Response.Headers["Cache-Control"] = "no-cache";
					httpContext.Response.Headers["Connection"] = "keep-alive";

					chatEntity.history.Add(new() { role = "user", content = chatMessageEntity.content });
					chatJsonFilePath.WriteText(chatEntity.ToJSON());

					var native = httpContext.Response.Advanced; // AdvancedHttpResponse

					string outcome = string.Empty;
					lock (Context.OpenAIChatClient)
					{
						outcome = Context.OpenAIChatClient.SendMessageAsync(
							Context.OperationObserver,
							Context.SystemContext,
							chatEntity.history.Select(v => (v.role!, v.content!)).ToList(),
							chatMessageEntity.content,
							Context.OpenAIChatMeteredServiceRequestOptions,
							chunk =>
							{
								try
								{
									var buffer = Encoding.UTF8.GetBytes(chunk);
									native.OutputStream.Write(buffer, 0, buffer.Length);
									native.OutputStream.Flush();
								}
								catch (Exception ex)
								{
									Context.Log.WriteLine(Severity.Error, (LGID, 0x199319), $"[HTTP/REST] streaming write failed: {ex}");
								}
							}
						).Result;
					}

					Context.Log.WriteLine(LogDensity.Unset, (LGID, 0xF1CEDD),
						Environment.NewLine + outcome
					);

					chatEntity.history.Add(new() { role = "assistant", content = outcome });
					chatJsonFilePath.WriteText(chatEntity.ToJSON());

					var responseEntity = new ChatMessageResponseEntity
					{
						chatId = chatMessageEntity.chatId,
						@event = "changed",
						errorMessage = null,
						validTimestamp = Context.ValidTimestamp = chatJsonFilePath.UnixTimestamp(),
					};

					var doneMsg = "data: [DONE]\n\n";
					var doneBuffer = Encoding.UTF8.GetBytes(doneMsg);
					native.OutputStream.Write(doneBuffer, 0, doneBuffer.Length);
					native.OutputStream.Flush();
					native.OutputStream.Close();

					httpContext.Response.StatusCode = HttpStatusCode.Ok;
					return httpContext;
				}
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x5BEE8B), $@"[HTTP/REST] POST ""/post_message_streaming"" Error: {ex}");
			}

			return httpContext;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.DELETE, PathInfo = @"/delete_message")]
		public IHttpContext Manage_DeleteMessage_DELETE(IHttpContext httpContext)
		{
			string queryStringLog = httpContext.Request.QueryString.AllKeys?.Length > 0
				? string.Join("&", httpContext.Request.QueryString.AllKeys
					.Where(key => key != null)
					.Select(key => $"{key}={httpContext.Request.QueryString[key]}"))
				: "(empty)";
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x5B23B7), $@"[HTTP/REST] POST ""/delete_message"" {httpContext.Request.RemoteEndPoint.Address} {queryStringLog}");

			var id = httpContext.Request.QueryString.GetValue<string?>("id", null);
			if (id == null)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x477002), $@"[HTTP/REST] GET ""/delete_message"" {httpContext.Request.RemoteEndPoint.Address} ""id == null""");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad id");
				return httpContext;
			}

			var index = httpContext.Request.QueryString.GetValue<int?>("index", null);
			if (index == null)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0xFED1D7), $@"[HTTP/REST] GET ""/delete_message"" {httpContext.Request.RemoteEndPoint.Address} ""index == null""");
				httpContext.Response.SendResponse(HttpStatusCode.BadRequest, "Bad index");
				return httpContext;
			}

			try
			{
				lock (Context)
				{
					var fullFilePath = Context.ChatsDirPath.SetFileNameWithoutExtension(id).SetFileExtension(".json");
					var chatJsonFilePath = fullFilePath.SetFileExtension(".json");
					var chatEntity = ChatEntity.FromJSON(chatJsonFilePath.ReadText());

					chatEntity.history = [.. chatEntity.history.Take(index.Value)];

					chatJsonFilePath.WriteText(chatEntity.ToJSON());

					var responseEntity = new ChatMessageResponseEntity
					{
						chatId = id,
						@event = "changed",
						errorMessage = null,
						validTimestamp = Context.ValidTimestamp = chatJsonFilePath.UnixTimestamp(),
					};

					return this.ServeTextContent(httpContext, "application/json", responseEntity.ToJSON());
				}
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0xF16BBF), $@"[HTTP/REST] POST ""/post_message"" Error: {ex}");
			}

			httpContext.Response.SendResponse(HttpStatusCode.Ok, "OK");
			return httpContext;
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.GET, PathInfo = @"/.*\.(html|css|js)")]
		public IHttpContext ServeTextAssets_GET(IHttpContext httpContext)
		{
			var fileName = httpContext.Request.PathInfo[1..];
			Context.Log.WriteLine(LogDensity.Unset, (LGID, 0x599840), $@"[HTTP/REST] GET ""/.*\.(html|css|js)"" {httpContext.Request.RemoteEndPoint.Address} {fileName}");
			return this.ServeTextFile(httpContext, fileName, true);
		}

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.GET, PathInfo = @"^/?$")]
		public IHttpContext ServeIndexHtml_GET(IHttpContext httpContext)
		{
			Context.Log.WriteLine(Severity.Error, (LGID, 0x6934EB), $@"[HTTP/REST] GET ""/.*\.(html|css|js)"" {httpContext.Request.RemoteEndPoint.Address} index.html");
			return this.ServeTextFile(httpContext, Context.WebRootDirPath.SetFileName("index.html"), true);
		}

		#region 404 Not found

		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.HEAD, PathInfo = @".*")]
		public IHttpContext CatchAll_HEAD(IHttpContext httpContext)
		{
			Context.Log.WriteLine(Severity.Warning, (LGID, 0x22333B), $@"[HTTP/REST] {httpContext.Request.HttpMethod.ToString().ToUpperInvariant()} "".*"" {httpContext.Request.RemoteEndPoint.Address} {httpContext.Request.PathInfo} 404");
			httpContext.Response.SendResponse(HttpStatusCode.NotFound, string.Empty);
			return httpContext;
		}

		const string responseText = @"<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.22.1</center>
</body>
</html>
<!-- a padding to disable MSIE and Chrome friendly error page -->
<!-- a padding to disable MSIE and Chrome friendly error page -->
<!-- a padding to disable MSIE and Chrome friendly error page -->
<!-- a padding to disable MSIE and Chrome friendly error page -->
<!-- a padding to disable MSIE and Chrome friendly error page -->
<!-- a padding to disable MSIE and Chrome friendly error page -->
";
		[RestRoute(HttpMethod = Grapevine.Shared.HttpMethod.ALL, PathInfo = @".*")]
		public IHttpContext CatchAll(IHttpContext httpContext)
		{
			try
			{
				Context.Log.WriteLine(Severity.Warning, (LGID, 0x31AD54), $@"[HTTP/REST] {httpContext.Request.HttpMethod.ToString().ToUpperInvariant()} "".*"" {httpContext.Request.RemoteEndPoint.Address} {httpContext.Request.PathInfo} 404");
				httpContext.Response.SendResponse(HttpStatusCode.NotFound, responseText);
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Warning, (LGID, 0xF3531F), $@"[HTTP/REST] {httpContext.Request.HttpMethod.ToString().ToUpperInvariant()} "".*"" {httpContext.Request.RemoteEndPoint.Address} {httpContext.Request.PathInfo} 404", ex);
			}
			return httpContext;
		}

		#endregion

		IHttpContext ServeTextContent(IHttpContext httpContext, string contentType, string text)
		{
			httpContext.Response.Headers.Add("Content-Type", contentType + "; charset=utf-8");

			httpContext.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
			httpContext.Response.Headers.Add("Pragma", "no-cache");
			httpContext.Response.Headers.Add("Expires", "0");

			httpContext.Response.Headers.Add("Access-Control-Allow-Origin", "*");
			httpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			httpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");

			httpContext.Response.Headers.Add("Connection", "Keep-Alive");
			httpContext.Response.Headers.Add("Keep-Alive", $"timeout={Context.HttpServer_KeepAlive_TimeoutS}, max={Context.HttpServer_KeepAlive_MaxRequestNumber}");

			try
			{
				httpContext.Response.StatusCode = HttpStatusCode.Ok;
				httpContext.Response.SendResponse(Encoding.UTF8.GetBytes(text));
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x014B0B), "[HTTP/REST] 999.03 Error: " + ex.ToString());
			}
			return httpContext;
		}

		IHttpContext ServeTextFile(IHttpContext httpContext, string filePath, bool processAsTemplate = false)
		{
			var fileFullPath = Path.Combine(Context.WebRootDirPath, filePath);

			if (!File.Exists(fileFullPath))
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x0F48C5), $"[HTTP/REST] 999.011 Error: File not found on disk \"{fileFullPath}\".");
				httpContext.Response.SendResponse(HttpStatusCode.NotFound, "File not found on disk.");
				return httpContext;
			}

			var contentType = this.GetContentType(filePath);

			httpContext.Response.Headers.Add("Content-Type", contentType + "; charset=utf-8");

			httpContext.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
			httpContext.Response.Headers.Add("Pragma", "no-cache");
			httpContext.Response.Headers.Add("Expires", "0");

			httpContext.Response.Headers.Add("Access-Control-Allow-Origin", "*");
			httpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			httpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");

			httpContext.Response.Headers.Add("Connection", "Keep-Alive");
			httpContext.Response.Headers.Add("Keep-Alive", $"timeout={Context.HttpServer_KeepAlive_TimeoutS}, max={Context.HttpServer_KeepAlive_MaxRequestNumber}");

			try
			{
				httpContext.Response.StatusCode = HttpStatusCode.Ok;
				var text = File.ReadAllText(fileFullPath, Encoding.UTF8);
				if (processAsTemplate) httpContext.Response.SendResponse(text.Replace("{timestamp}", DateTime.Now.ToFileTimeUtc().ToString()));
				else httpContext.Response.SendResponse(Encoding.UTF8.GetBytes(text));
			}
			catch (Exception ex)
			{
				Context.Log.WriteLine(Severity.Error, (LGID, 0x575C1B), "[HTTP/REST] 999.01 Error: " + ex.ToString());
			}
			return httpContext;
		}

		string GetContentType(string fileName)
		{
			return Path.GetExtension(fileName).ToLowerInvariant() switch
			{
				".html" => "text/html",
				".js" => "application/javascript",
				".css" => "text/css",
				_ => "application/octet-stream",
			};
		}

#pragma warning disable CS8618
		static TContext Context { get; set; }
#pragma warning restore CS8618
	}

	public class ChatListEntity
	{
		public ChatListItemEntity[] chats = [];
		public int validTimestamp;

		public static ChatListEntity FromJSON(string? json)
		{
			if (string.IsNullOrEmpty(json)) return new();
			var options = new JsonSerializerOptions
			{
				IncludeFields = true,
				DefaultIgnoreCondition = JsonIgnoreCondition.Never
			};
			return JsonSerializer.Deserialize<ChatListEntity>(json, options) ?? new();
		}

		public string ToJSON() => JsonSerializer.Serialize(this, new JsonSerializerOptions
		{
			IncludeFields = true,
			WriteIndented = true,
			DefaultIgnoreCondition = JsonIgnoreCondition.Never,
			Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
		});
	}

	public class ChatListItemEntity
	{
		public string? chatId;
		public string? time;
		public string? title;
	}

	public class ChatEntity
	{
		public DateTime utcTime;
		public List<ChatHistoryEntity> history = [];
		public int validTimestamp;

		public static ChatEntity FromJSON(string? json)
		{
			if (string.IsNullOrEmpty(json)) return new();
			var options = new JsonSerializerOptions
			{
				IncludeFields = true,
				DefaultIgnoreCondition = JsonIgnoreCondition.Never
			};
			return JsonSerializer.Deserialize<ChatEntity>(json, options) ?? new();
		}

		public string ToJSON() => JsonSerializer.Serialize(this, new JsonSerializerOptions
		{
			IncludeFields = true,
			WriteIndented = true,
			DefaultIgnoreCondition = JsonIgnoreCondition.Never,
			Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
		});
	}

	public class ChatHistoryEntity
	{
		public string? role;
		public string? content;
	}

	public class ChatMessageEntity
	{
		public string? chatId;
		public string? content;

		public static ChatMessageEntity FromJSON(string? json)
		{
			if (string.IsNullOrEmpty(json)) return new();
			var options = new JsonSerializerOptions
			{
				IncludeFields = true,
				DefaultIgnoreCondition = JsonIgnoreCondition.Never
			};
			return JsonSerializer.Deserialize<ChatMessageEntity>(json, options) ?? new();
		}

		public string ToJSON() => JsonSerializer.Serialize(this, new JsonSerializerOptions
		{
			IncludeFields = true,
			WriteIndented = true,
			DefaultIgnoreCondition = JsonIgnoreCondition.Never,
			Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
		});
	}

	public class ChatMessageResponseEntity
	{
		public string? chatId;
		public string? @event;   //	"changed"|"error"
		public string? errorMessage;
		public int validTimestamp;

		public static ChatMessageResponseEntity FromJSON(string? json)
		{
			if (string.IsNullOrEmpty(json)) return new();
			var options = new JsonSerializerOptions
			{
				DefaultIgnoreCondition = JsonIgnoreCondition.Never
			};
			return JsonSerializer.Deserialize<ChatMessageResponseEntity>(json, options) ?? new();
		}

		public string ToJSON() => JsonSerializer.Serialize(this, new JsonSerializerOptions
		{
			IncludeFields = true,
			WriteIndented = true,
			DefaultIgnoreCondition = JsonIgnoreCondition.Never,
			Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
		});
	}

	public class TContext
	{
		public ILog Log;
		public Path ChatsDirPath;
		public Path WebRootDirPath;
		public string SystemContext;
		public OpenAIChatMeteredService OpenAIChatClient;
		public SemaphoreSmart.DebuggingObserver OperationObserver;
		public OpenAIChatMeteredService.RequestOptions OpenAIChatMeteredServiceRequestOptions;
		public int ValidTimestamp = 0;

		public int HttpServer_KeepAlive_TimeoutS = 10;
		public int HttpServer_KeepAlive_MaxRequestNumber = 1000;
	}
}

