using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;

using Falael.Core.Syncronization;
using Falael.Core.Services;

namespace Falael.Services
{
	//	+ Falael.Auto.Core.OpenAIClient -> Falael.Services.OpenAIMeteredService
	//	+ Falael.Auto.Core.YouTubeClient -> Falael.Services.YouTubeMeteredService
	//	- AppTaskQueueMeteredService (quotas are defined via CTS rules and SchedulerUtility)
	//	? SendGridMeteredService - no existing abstraction
	//	? GmailImapMeteredService (must define new quota at the user side) - need to rethink the `static class SendMailUtility` approach - a static class cannot be turned into a metered service
	//	? AppleCalendarMeteredService (must define new quota at the user side) - need to rethink the `static class AppleCalendarUtility` approach - a static class cannot be turned into a metered service

	////////////////////////////////////////////////////////////////////////////////

	public class TestMeteredService : MeteredService<TestMeteredService.TestUsageMeter>
	{
		public TestMeteredService(IFalaelContext coreContext, TestUsageMeter usageMeter, TimeSpan hibernateTimeout)
			: base(coreContext, usageMeter, hibernateTimeout)
		{
		}

		public class TestUsageMeter : UsageMeter<TestUsageMeter.RateInfo>
		{
			public TestUsageMeter(IFalaelContext coreContext, decimal initialOpsLimit, int concurrentOpsLimit)
				: base(coreContext, initialOpsLimit, concurrentOpsLimit)
			{
			}

			public class RateInfo
			{
				public decimal RequestsUsage { get; set; }
				public decimal RequestsLimit { get; set; }
				public int RequestsReplenishTimeMs { get; set; }

				public decimal TokensUsage { get; set; }
				public decimal TokensLimit { get; set; }
				public int TokensReplenishTimeMs { get; set; }
			}

			//	non-thread-safe
			protected override async Task<decimal> QuerySemaphoreLimit(RateInfo? rateInfo)
			{
				if (rateInfo == null) return this.InitialOpsLimit;

				decimal thresholdNormalOpNv = 0.5m;
				decimal thresholdDelayNv = 0.25m;

				decimal healthLevel1Nv = rateInfo.RequestsUsage < rateInfo.RequestsLimit ? 1 - rateInfo.RequestsUsage / rateInfo.RequestsLimit : 0;
				decimal healthLevel2Nv = rateInfo.TokensUsage < rateInfo.TokensLimit ? 1 - rateInfo.TokensUsage / rateInfo.TokensLimit : 0;

				Console.WriteLine($"{nameof(TestUsageMeter)} (1): requests health {healthLevel1Nv}, tokens health {healthLevel2Nv}");

				if (healthLevel1Nv > thresholdNormalOpNv && healthLevel2Nv > thresholdNormalOpNv) return this.ConcurrentOpsLimit;

				decimal result1, result2;

				if (healthLevel1Nv > thresholdNormalOpNv)
					result1 = this.ConcurrentOpsLimit;
				else if (healthLevel1Nv >= thresholdDelayNv)
					result1 = _calcConcurrentLimit((healthLevel1Nv - thresholdDelayNv) / (thresholdNormalOpNv - thresholdDelayNv), 1, this.ConcurrentOpsLimit);
				else
					result1 = _calcDelayFraction(Math.Max(0, healthLevel1Nv) / thresholdDelayNv, Math.Max(1, rateInfo.RequestsReplenishTimeMs));

				Debug.Assert(result1 <= this.ConcurrentOpsLimit);

				if (healthLevel2Nv > thresholdNormalOpNv)
					result2 = this.ConcurrentOpsLimit;
				else if (healthLevel2Nv >= thresholdDelayNv)
					result2 = _calcConcurrentLimit((healthLevel2Nv - thresholdDelayNv) / (thresholdNormalOpNv - thresholdDelayNv), 1, this.ConcurrentOpsLimit);
				else
					result2 = _calcDelayFraction(Math.Max(0, healthLevel2Nv) / thresholdDelayNv, Math.Max(1, rateInfo.TokensReplenishTimeMs));

				Debug.Assert(result2 <= this.ConcurrentOpsLimit);

				Console.WriteLine($"{nameof(TestUsageMeter)} (2): requests semaphore limit {result1}, tokens semaphore limit {result2} | combined semaphore limit {Math.Min(result1, result2)}");

				return Math.Min(result1, result2);

				//	valueNv in [0, 1]
				//	returns in [lowerBound, upperBound], suitable for newLimit in SemaphoreSmart.SetLimit(newLimit)
				int _calcConcurrentLimit(decimal valueNv, int lowerBound, int upperBound)
				{
					var delta = upperBound - lowerBound;
					var offset = valueNv * delta;
					return (int)Math.Floor(lowerBound + offset);
				}

				//	valueNv in [0, 1)
				//	returns in [1/replenishTimeMs, 1], suitable for newLimit in SemaphoreSmart.SetLimit(newLimit)
				decimal _calcDelayFraction(decimal valueNv, int replenishTimeMs)
				{
					Debug.Assert(valueNv >= 0 && valueNv < 1);
					Debug.Assert(replenishTimeMs > 0);

					return Math.Min(1, 1 / (replenishTimeMs * (1 - valueNv)));
				}
			}

			internal SemaphoreSmart SemaphoreSmart
			{
				get
				{
					return base.semaphoreSmart;
				}
			}
		}

		public class DebugWaitNotifiable : SemaphoreSmart.IAsyncOperationObserver
		{
			public async Task OnWaitStartAsync()
			{
				await this.sync.WaitAsync();
				try
				{
					++this.WaitCount;
					Console.WriteLine($"{nameof(DebugWaitNotifiable)}.{nameof(OnWaitStartAsync)}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}");
				}
				finally
				{
					this.sync.Release();
				}
			}

			public async Task OnWaitEndAsync(SemaphoreSmart.WaitEndReason waitEndReason, TimeSpan waitTime)
			{
				await this.sync.WaitAsync();
				try
				{
					--this.WaitCount;
					Console.WriteLine($"{nameof(DebugWaitNotifiable)}.{nameof(OnWaitEndAsync)}, {nameof(waitEndReason)} = {waitEndReason}, {nameof(waitTime)} = {waitTime}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}");
				}
				finally
				{
					this.sync.Release();
				}
			}

			public async Task OnExecutingAsync(SemaphoreSmart.ExecutionTiming executionTiming)
			{
				await this.sync.WaitAsync();
				try
				{
					++this.ConcurrentCount;
					Console.WriteLine($"{nameof(DebugWaitNotifiable)}.{nameof(OnExecutingAsync)}, {nameof(executionTiming)} = {executionTiming}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}");
				}
				finally
				{
					this.sync.Release();
				}
			}

			public async Task OnReleasedAsync()
			{
				await this.sync.WaitAsync();
				try
				{
					--this.ConcurrentCount;
					Console.WriteLine($"{nameof(DebugWaitNotifiable)}.{nameof(OnReleasedAsync)}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}");
				}
				finally
				{
					this.sync.Release();
				}
			}

			public int WaitCount { get; private set; } = 0;
			public int ConcurrentCount { get; private set; } = 0;
			readonly SemaphoreSlim sync = new(1, 1);
		}

		public async Task WriteLrrh(SemaphoreSmart.IAsyncOperationObserver operationObserver, string openAiApiKey)
		{
			await this.UsageMeter.SemaphoreSmart.WaitAsync(operationObserver, this.HibernateTimeout);
			try
			{
				#region OpenAI test

				var systemContext = @"Write like Bram Stoker, use an epistolary format (""3 May. Bistritz.—Left Munich at 8:35 P.M."") with Gothic atmosphere (""The castle is on the very edge of a terrible precipice.""), slow-building tension (""There was something so strange in this that I felt uneasy, and began to be aware of the dreadful fears.""), and Victorian sensibilities; provide detailed character descriptions (""He had a mighty brain, a learning beyond compare, and a heart that knew no fear and no remorse.""); blend folklore with modernity (""The very phonograph became accursed through his malignant will!""); employ dialects (""Aye, it's a fine place, yer honor, it is indeed.""); incorporate symbolism (""The rats were multiplying in thousands, and we must not leave them there.""); utilize polyphonic narration through multiple viewpoints; focus on creating suspenseful, ominous moods with vivid setting descriptions (""The tomb in the daytime, and when wreathed with fresh flowers, had looked grim and gruesome enough, but now, some days afterwards, when the flowers hung lank and dead, their whites turning to rust and their greens to browns...the whole effect was more miserable and sordid than could have been imagined.""); gradually hint at supernatural elements (""What manner of man is this, or what manner of creature, is it in the semblance of man?""); reflect period-appropriate morals and social norms; and use objects, weather, or animals as symbolic devices (""Listen to them, the children of the night. What music they make!"")—all while maintaining a richly descriptive, tension-building narrative style that combines realism with the supernatural.";
				var userMessage = @"now answer as told and no other text, only answer; tell me the lrrh story in 350 words following the following internal structure in the form of a chapterless fluent publishing-ready short story with dialogues and scene descriptions. Internal structure (not directly referenced in the final chapterless text): Introduction (LRRH's character, village setting) > The Task (Mother's request, basket packing, warnings) > Entering the Forest (atmosphere, initial journey) > Meeting the Wolf (first encounter, conversation, deception) > Diverging Paths (wolf's suggestion, LRRH's choice) > Wolf's Journey (rush to grandmother's house, confrontation) > LRRH's Journey (slower progress, activities) > Wolf's Deception (disguise as grandmother) > LRRH at Grandmother's House (arrival, noticing oddities) > Famous Dialogue (""What big eyes you have"") > Reveal and Danger (wolf's identity exposed, LRRH in peril) > Rescue (woodcutter/hunter arrival, confrontation) > Resolution (saving grandmother, dealing with wolf) > Aftermath (lessons learned, return home) > Conclusion (moral, final reflections).";

				List<OpenAIChatMeteredService.Message> messages =
				[
					new() { Role = "system", Content = systemContext },
					new() { Role = "user", Content = userMessage }
				];

				dynamic requestData = new
				{
					model = "gpt-4o-mini",
					messages = messages.ToArray(),
					//max_tokens = 5000
					max_tokens = 50
				};

				string json = JsonSerializer.Serialize(requestData, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				var content = new StringContent(json, Encoding.UTF8, "application/json");

				//var outputDirectory = @"c:\temp\lrrh";
				var API_CHAT_ENDPOINT = "https://api.openai.com/v1/chat/completions";

				HttpClient httpClient = new()
				{
					Timeout = TimeSpan.FromMilliseconds(10 * 60 * 1000)
				};
				httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");
				var response = await httpClient.PostAsync(API_CHAT_ENDPOINT, content);
				if (!response.IsSuccessStatusCode) throw new HttpRequestException($"GPT endpoint {API_CHAT_ENDPOINT} returned an error: {(int)response.StatusCode} {response.ReasonPhrase}", null, response.StatusCode);

				var rateLimits = OpenAIChatMeteredService.RateLimits.FromResponse(response);
				var responseString = await response.Content.ReadAsStringAsync();
				var openAIResponse = JsonSerializer.Deserialize<OpenAIChatMeteredService.OpenAIChatResponse>(responseString);
				var responseText = openAIResponse?.Choices?[0]?.Message?.Content ?? throw new Exception("ChatGPT returned an empty response.");

				//Directory.CreateDirectory(outputDirectory);
				//var filePath = Path.Combine(outputDirectory, Guid.NewGuid() + ".txt");
				//await File.WriteAllTextAsync(filePath, responseText);

				#endregion

				TestUsageMeter.RateInfo rateInfo = new() 
				{
					RequestsLimit = rateLimits?.LimitRequests ?? throw new NullReferenceException("rateLimits?.LimitRequests"),
					RequestsUsage = rateLimits?.LimitRequests - rateLimits?.RemainingRequests ?? throw new NullReferenceException("rateLimits?.RemainingRequests"),
					RequestsReplenishTimeMs = (int)(rateLimits?.ResetRequests?.TotalMilliseconds ?? throw new NullReferenceException("rateLimits?.ResetRequests?.TotalMilliseconds")),

					TokensLimit = rateLimits?.LimitTokens ?? throw new NullReferenceException("rateLimits?.LimitTokens"),
					TokensUsage = rateLimits?.LimitTokens - rateLimits?.RemainingTokens ?? throw new NullReferenceException("rateLimits?.RemainingTokens"),
					TokensReplenishTimeMs = (int)(rateLimits?.ResetTokens?.TotalMilliseconds ?? throw new NullReferenceException("rateLimits?.ResetTokens?.TotalMilliseconds")),
				};
				Console.WriteLine($"RATE INFO: R {rateInfo.RequestsUsage}/{rateInfo.RequestsLimit} ({rateInfo.RequestsReplenishTimeMs} ms), T {rateInfo.TokensUsage}/{rateInfo.TokensLimit} ({rateInfo.TokensReplenishTimeMs} ms).");

				await this.UsageMeter.SemaphoreSmart.SetLimitAsync(await this.UsageMeter.Update(rateInfo));
				Console.WriteLine($"SEMAPHORE LIMIT: {this.UsageMeter.SemaphoreSmart.Limit} / {this.UsageMeter.ConcurrentOpsLimit} ({this.UsageMeter.SemaphoreSmart.DelayMs} ms).");
			}
			finally
			{
				await this.UsageMeter.SemaphoreSmart.ReleaseWaitAsync(operationObserver);
			}
		}


		public async static Task Test(IFalaelContext coreContext, string openAiApiKey)
		{
			int simultaneousCalls = 20;

			var operationObserver = new TestMeteredService.DebugWaitNotifiable();

			var testUsageMeter = new TestMeteredService.TestUsageMeter(coreContext, 1m, 10);
			var testMeteredService = new TestMeteredService(coreContext, testUsageMeter, TimeSpan.FromMinutes(5));

			var cts = new CancellationTokenSource();
			Console.CancelKeyPress += (s, e) =>
			{
				e.Cancel = true;
				cts.Cancel();
			};

			var tasks = new ConcurrentBag<Task>();
			try
			{
				while (!cts.IsCancellationRequested)
				{
					while (tasks.Count < simultaneousCalls)
					{
						tasks.Add(Task.Run(async () =>
						{
							try
							{
								await testMeteredService.WriteLrrh(operationObserver, openAiApiKey);
							}
							catch (Exception ex)
							{
								Console.WriteLine($"Error in WriteLrrh: {ex.Message}");
							}
							finally
							{
								tasks.TryTake(out Task? currentTask);
							}
						}, cts.Token));
					}

					await Task.Delay(1000, cts.Token); // Wait for 1 second before checking again
				}
			}
			catch (OperationCanceledException ex)
			{
				Debug.WriteLine(ex);
				Console.WriteLine("Operation cancelled. Waiting for running tasks to complete...");
			}
			finally
			{
				await Task.WhenAll(tasks);
				Console.WriteLine("All tasks completed. Program exiting.");
			}
		}
	}
}