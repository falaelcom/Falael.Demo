using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

using Falael.Core.Web;
using Falael.Core.Syncronization;
using Falael.Core.Services;

namespace Falael.Services
{
	//	See also: https://platform.openai.com/docs/api-reference/making-requests
	public class OpenAIChatMeteredService : MeteredService<OpenAIChatMeteredService.UsageMeter>
	{
		const ulong LGID = 0x2F0B53;

		#region Authoring Automation - Constants

		public const string AUTHORINGAUTOMATION_TITLE_FIRST = "AIBOOK";

		#endregion

		const decimal UsageMeter_ThresholdNormalOpNv = 0.5m;
		const decimal UsageMeter_ThresholdDelayNv = 0.25m;

		public OpenAIChatMeteredService(IFalaelContext coreContext, UsageMeter usageMeter, TimeSpan hibernateTimeout, int gptRequestTimeoutMs, string apiKey)
			: base(coreContext, usageMeter, hibernateTimeout)
		{
			this.gptRequestTimeoutMs = gptRequestTimeoutMs;
			this.apiKey = apiKey;

			this.httpClient = new()
			{
				Timeout = TimeSpan.FromMilliseconds(this.gptRequestTimeoutMs)
			};
			this.httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {this.apiKey}");
		}

		#region Nested Types - Metered Service

		public class RateInfo
		{
			public static RateInfo FromRateLimits(RateLimits rateLimits)
			{
				return  new()
				{
					RequestsLimit = rateLimits?.LimitRequests ?? throw new NullReferenceException("rateLimits?.LimitRequests"),
					RequestsUsage = rateLimits?.LimitRequests - rateLimits?.RemainingRequests ?? throw new NullReferenceException("rateLimits?.RemainingRequests"),
					RequestsReplenishTimeMs = (int)(rateLimits?.ResetRequests?.TotalMilliseconds ?? throw new NullReferenceException("rateLimits?.ResetRequests?.TotalMilliseconds")),

					TokensLimit = rateLimits?.LimitTokens ?? throw new NullReferenceException("rateLimits?.LimitTokens"),
					TokensUsage = rateLimits?.LimitTokens - rateLimits?.RemainingTokens ?? throw new NullReferenceException("rateLimits?.RemainingTokens"),
					TokensReplenishTimeMs = (int)(rateLimits?.ResetTokens?.TotalMilliseconds ?? throw new NullReferenceException("rateLimits?.ResetTokens?.TotalMilliseconds")),
				};
			}

			public decimal RequestsUsage { get; set; }
			public decimal RequestsLimit { get; set; }
			public int RequestsReplenishTimeMs { get; set; }

			public decimal TokensUsage { get; set; }
			public decimal TokensLimit { get; set; }
			public int TokensReplenishTimeMs { get; set; }
		}

		new public class UsageMeter : UsageMeter<RateInfo>
		{
			public UsageMeter(IFalaelContext coreContext, decimal initialOpsLimit, int concurrentOpsLimit)
				: base(coreContext, initialOpsLimit, concurrentOpsLimit)
			{
			}

			//	non-thread-safe
			protected override async Task<decimal> QuerySemaphoreLimit(RateInfo? rateInfo)
			{
				if (rateInfo == null) return this.InitialOpsLimit;

				decimal requestsHealthNv = rateInfo.RequestsUsage < rateInfo.RequestsLimit ? 1 - rateInfo.RequestsUsage / rateInfo.RequestsLimit : 0;
				decimal tokensHealthNv = rateInfo.TokensUsage < rateInfo.TokensLimit ? 1 - rateInfo.TokensUsage / rateInfo.TokensLimit : 0;

				this.RequestsHealthNv = requestsHealthNv;   //	`this.RequestsHealthNv` getter is thread-safe and must not be accessed here or deadlock will occur
				this.TokensHealthNv = tokensHealthNv;       //	`this.TokensHealthNv` getter is thread-safe and must not be accessed here or deadlock will occur

				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x29D9DF), 
					nameof(UsageMeter), $"(1): requests health {requestsHealthNv}, tokens health {tokensHealthNv}"
				);

				if (requestsHealthNv > UsageMeter_ThresholdNormalOpNv && tokensHealthNv > UsageMeter_ThresholdNormalOpNv) return this.ConcurrentOpsLimit;

				decimal result_requests, result_tokens;

				if (requestsHealthNv > UsageMeter_ThresholdNormalOpNv)
					result_requests = this.ConcurrentOpsLimit;
				else if (requestsHealthNv >= UsageMeter_ThresholdDelayNv)
					result_requests = _calcConcurrentLimit((requestsHealthNv - UsageMeter_ThresholdDelayNv) / (UsageMeter_ThresholdNormalOpNv - UsageMeter_ThresholdDelayNv), 1, this.ConcurrentOpsLimit);
				else
					result_requests = _calcDelayFraction(Math.Max(0, requestsHealthNv) / UsageMeter_ThresholdDelayNv, Math.Max(1, rateInfo.RequestsReplenishTimeMs));

				Debug.Assert(result_requests <= this.ConcurrentOpsLimit);

				if (tokensHealthNv > UsageMeter_ThresholdNormalOpNv)
					result_tokens = this.ConcurrentOpsLimit;
				else if (tokensHealthNv >= UsageMeter_ThresholdDelayNv)
					result_tokens = _calcConcurrentLimit((tokensHealthNv - UsageMeter_ThresholdDelayNv) / (UsageMeter_ThresholdNormalOpNv - UsageMeter_ThresholdDelayNv), 1, this.ConcurrentOpsLimit);
				else
					result_tokens = _calcDelayFraction(Math.Max(0, tokensHealthNv) / UsageMeter_ThresholdDelayNv, Math.Max(1, rateInfo.TokensReplenishTimeMs));

				Debug.Assert(result_tokens <= this.ConcurrentOpsLimit);

				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xCCDDBF),
					nameof(UsageMeter), $"(2): requests semaphore limit {result_requests}, tokens semaphore limit {result_tokens} | combined semaphore limit {Math.Min(result_requests, result_tokens)}"
				);

				return Math.Min(result_requests, result_tokens);

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

			public decimal RequestsHealthNv
			{
				get 
				{
					base.sync.Wait();
					try
					{
						return this.requestsHealthNv;
					}
					finally
					{
						this.sync.Release(); 
					}
				}
				protected set
				{
					this.requestsHealthNv = value;
				}
			}
			public decimal TokensHealthNv
			{
				get 
				{
					base.sync.Wait();
					try
					{
						return this.tokensHealthNv;
					}
					finally
					{
						this.sync.Release();
					}
				}
				protected set
				{
					this.tokensHealthNv = value;
				}
			}

			internal SemaphoreSmart SemaphoreSmart 
			{
				get
				{
					return base.semaphoreSmart;
				}
			}

			decimal requestsHealthNv;
			decimal tokensHealthNv;
		}

		#endregion

		#region Nested Types

		public class OpenAIChatResponse
		{
			[JsonPropertyName("id")]
			public string? Id { get; set; }

			[JsonPropertyName("object")]
			public string? Object { get; set; }

			[JsonPropertyName("created")]
			public int? Created { get; set; }

			[JsonPropertyName("model")]
			public string? Model { get; set; }

			[JsonPropertyName("choices")]
			public Choice[]? Choices { get; set; }

			[JsonPropertyName("usage")]
			public CumulativeUsage? Usage { get; set; }
		}

		public class Choice
		{
			[JsonPropertyName("index")]
			public int? Index { get; set; }

			[JsonPropertyName("message")]
			public Message? Message { get; set; }

			[JsonPropertyName("finish_reason")]
			public string? FinishReason { get; set; }
		}

		public enum ReasoningModelReasoningEffort
		{
			Minimal,
			Low,
			Medium,
			High,
		}

		public enum ReasoningModelVerbosity
		{
			Low,
			Medium,
			High,
		}

		/// <remarks>
		///	temperature and top_p are two parameters that influence the randomness and diversity of the generated text.
		///	- Temperature: Ranges from 0 to 1. A lower temperature (closer to 0) results in more deterministic and predictable text. A higher temperature (closer to 1) increases randomness, making the responses more varied and less predictable.
		///	- Top P (Nucleus Sampling): Also ranges from 0 to 1. This parameter controls the diversity based on a probability threshold. A lower top_p value means the model will only consider the most likely words, leading to more predictable text. A //	higher top_p allows less likely words to be considered, increasing diversity and randomness in the output.
		/// </remarks>
		public class RequestOptions
		{
			public string? Model { get; set; } = null;

			public string? ContinuePrompt { get; set; } = null;

			public bool InstructOnTokenLimit { get; set; } = true;

			public int ResponseMaxTokenCount { get; set; } = 2500;

			public bool RequireJson { get; set; } = false;

			public bool ParseJson { get; set; } = true;

			public float Temperature { get; set; } = DEFAULT_TEMPERATURE;

			public float TopP { get; set; } = DEFAULT_TOPP;

			public ReasoningModelReasoningEffort ReasoningModelReasoningEffort { get; set; } = ReasoningModelReasoningEffort.Low;

			public ReasoningModelVerbosity ReasoningModelVerbosity { get; set; } = ReasoningModelVerbosity.Medium;

			public int ReasoningModelResponseMaxTokenCount { get; set; } = 2500;

			public bool IsReasoningModelModel { get; set; } = false;

			public bool UseInternalCache { get; set; } = true;

			public override string ToString()
				{
					return $"Model: {this.Model}, ResponseMaxTokenCount: {this.ResponseMaxTokenCount}, RequireJson: {this.RequireJson}, Temperature: {this.Temperature}, TopP: {this.TopP}";
				}
		}

		public class Message
		{
			[JsonPropertyName("role")]
			public string? Role { get; set; }

			[JsonPropertyName("content")]
			public string? Content { get; set; }
		}

		public class CumulativeUsage
		{
			[JsonPropertyName("prompt_tokens")]
			public int? PromptTokenCount { get; set; }

			[JsonPropertyName("completion_tokens")]
			public int? CompletionTokenCount { get; set; }

			[JsonPropertyName("total_tokens")]
			public int? TotalTokenCount { get; set; }


			public override string ToString()
			{
				return JsonSerializer.Serialize(this, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
			}

			public void Accumulate(CumulativeUsage? value)
			{
				if (value == null) return;

				this.PromptTokenCount = this.PromptTokenCount == null ? value.PromptTokenCount : this.PromptTokenCount + value.PromptTokenCount;
				this.CompletionTokenCount = this.CompletionTokenCount == null ? value.CompletionTokenCount : this.CompletionTokenCount + value.CompletionTokenCount;
				this.TotalTokenCount = this.TotalTokenCount == null ? value.TotalTokenCount : this.TotalTokenCount + value.TotalTokenCount;
			}
		}

		public class RateLimits
		{
			public static RateLimits? FromResponse(HttpResponseMessage value)
			{
				var result = new RateLimits();

				string? limitRequests_text;
				string? limitTokens_text;
				string? remainingRequests_text;
				string? remainingTokens_text;
				string? resetRequests_text;
				string? resetTokens_text;

				try
				{
					limitRequests_text = value.Headers.GetValues("x-ratelimit-limit-requests").FirstOrDefault();
					limitTokens_text = value.Headers.GetValues("x-ratelimit-limit-tokens").FirstOrDefault();
					remainingRequests_text = value.Headers.GetValues("x-ratelimit-remaining-requests").FirstOrDefault();
					remainingTokens_text = value.Headers.GetValues("x-ratelimit-remaining-tokens").FirstOrDefault();
					resetRequests_text = value.Headers.GetValues("x-ratelimit-reset-requests").FirstOrDefault();
					resetTokens_text = value.Headers.GetValues("x-ratelimit-reset-tokens").FirstOrDefault();
				}
				catch (Exception ex)
				{
					Debug.WriteLine(ex);
					return null;
				}
				
				if (limitRequests_text == null || limitTokens_text == null || remainingRequests_text == null || remainingTokens_text == null || resetRequests_text == null || resetTokens_text == null) return null;

				result.LimitRequests = int.Parse(limitRequests_text);
				result.LimitTokens = int.Parse(limitTokens_text);
				result.RemainingRequests = int.Parse(remainingRequests_text);
				result.RemainingTokens = int.Parse(remainingTokens_text);
				result.ResetRequests = parseTimeString(resetRequests_text);
				result.ResetTokens = parseTimeString(resetTokens_text);

				return result;

				TimeSpan parseTimeString(string input)
				{
					var timeSpan = TimeSpan.Zero;
					var regex = new Regex(@"(\d+)(ms|d|h|m|s)");
					var matches = regex.Matches(input);

					foreach (Match match in matches)
					{
						int value = int.Parse(match.Groups[1].Value);
						string unit = match.Groups[2].Value;

						switch (unit)
						{
							case "d":
								timeSpan = timeSpan.Add(TimeSpan.FromDays(value));
								break;
							case "h":
								timeSpan = timeSpan.Add(TimeSpan.FromHours(value));
								break;
							case "m":
								timeSpan = timeSpan.Add(TimeSpan.FromMinutes(value));
								break;
							case "s":
								timeSpan = timeSpan.Add(TimeSpan.FromSeconds(value));
								break;
							case "ms":
								timeSpan = timeSpan.Add(TimeSpan.FromMilliseconds(value));
								break;
						}
					}

					return timeSpan;
				}
			}

			[JsonPropertyName("limitRequests")]
			public int? LimitRequests { get; private set; }

			[JsonPropertyName("limitTokens")]
			public int? LimitTokens { get; private set; }

			[JsonPropertyName("remainingRequests")]
			public int? RemainingRequests { get; private set; }

			[JsonPropertyName("remainingTokens")]
			public int? RemainingTokens { get; private set; }

			[JsonPropertyName("resetRequests")]
			public TimeSpan? ResetRequests { get; private set; }

			[JsonPropertyName("resetTokens")]
			public TimeSpan? ResetTokens { get; private set; }
		}

		#endregion

		public async Task<string> SendMessageAsync(SemaphoreSmart.IAsyncOperationObserver operationObserver, string? systemContext, string? userMessage, RequestOptions options, Action<string> streamingCallback) => await this.SendMessageAsync(operationObserver, systemContext, [], userMessage, options, streamingCallback);

		public async Task<string> SendMessageAsync(SemaphoreSmart.IAsyncOperationObserver operationObserver, string? systemContext, List<(string role, string content)> history, string? userMessage, RequestOptions options, Action<string>? streamingCallback)
		{
			int maxIterations = 10;
			if (options.InstructOnTokenLimit) systemContext = (systemContext ?? string.Empty) + $" You shall reply in multiple messages. You shall keep each message slightly shorter than {(int)Math.Round(0.9 * options.ResponseMaxTokenCount)} words, then wait for the \"(CONTINUE!)\" command before continuing your response.";

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x91659D),
				nameof(OpenAIChatMeteredService), nameof(SendMessageAsync),
				CL129(systemContext),
				CL129(userMessage),
				CL(options),
				CL(systemContext),
				CL(userMessage)
			);

			string? cacheKey = null;
			if (options.UseInternalCache)
			{
				cacheKey = systemContext + "*^*^*" + userMessage;
				if (this.completionsCache.TryGetValue(cacheKey, out string? value))
				{
					var cachedResult = value;
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x82F462),
						nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"Using cached value.",
						CL129(cachedResult),
						CL("Full cached result (unstripped):", cachedResult)
					);
					return WebUtility.ExtractJson(cachedResult);
				}
			}

			List<Message> messages = [];
			if (systemContext != null) messages.Add(new() { Role = "system", Content = systemContext });
			if (history.Any()) history.ForEach(v => messages.Add(new() { Role = v.role, Content = v.content }));
			if (userMessage != null) messages.Add(new() { Role = "user", Content = userMessage });

			int i = 0;
			string result = string.Empty;
			string? finishReason = null;

			do
			{
				try
				{
					dynamic requestData = options.IsReasoningModelModel
						? new
						{
							model = options.Model ?? throw new Exception("GPT model is not configured."),
							messages = messages.ToArray(),
							reasoning_effort = options.ReasoningModelReasoningEffort.ToString().ToLower(),
							verbosity = options.ReasoningModelVerbosity.ToString().ToLower(),
							max_completion_tokens = options.ReasoningModelResponseMaxTokenCount,
							stream = true
						}
						: new
						{
							model = options.Model ?? throw new Exception("GPT model is not configured."),
							messages = messages.ToArray(),
							temperature = options.Temperature,
							top_p = options.TopP,
							max_tokens = options.ResponseMaxTokenCount,
							stream = true
						};
					if (options.RequireJson) requestData.response_format = new { type = "json_object" };

					string json = JsonSerializer.Serialize(requestData, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					var content = new StringContent(json, Encoding.UTF8, "application/json");

					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x63E666),
						nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"sending request to openai ({i}/{maxIterations}):",
						CL(json)
					);

					HttpResponseMessage response;

					await base.UsageMeter.SemaphoreSmart.WaitAsync(operationObserver, this.HibernateTimeout);
					try
					{
						response = await this.httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Post, API_CHAT_ENDPOINT) { Content = content }, HttpCompletionOption.ResponseHeadersRead);

						var rateLimits = RateLimits.FromResponse(response) ?? throw new HttpRequestException($"GPT endpoint {API_CHAT_ENDPOINT} returned no rate limit headers, which usually means that the designated financial resource for openai has been depleted - check status at https://platform.openai.com/settings/organization/billing/overview; http status code: {(int)response.StatusCode} {response.ReasonPhrase}", null, response.StatusCode);

						var rateInfo = RateInfo.FromRateLimits(rateLimits);

						await base.UsageMeter.SemaphoreSmart.SetLimitAsync(await base.UsageMeter.Update(rateInfo));

						var um = (UsageMeter)base.UsageMeter;
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x765300),
							nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"Health: R {um.RequestsHealthNv}, T {um.RequestsHealthNv}; Limits: R {rateInfo.RequestsUsage}/{rateInfo.RequestsLimit} ({rateInfo.RequestsReplenishTimeMs} ms), T {rateInfo.TokensUsage}/{rateInfo.TokensLimit} ({rateInfo.TokensReplenishTimeMs} ms), S: {base.UsageMeter.SemaphoreSmart.Limit}/{base.UsageMeter.ConcurrentOpsLimit} ({base.UsageMeter.SemaphoreSmart.DelayMs} ms)."
						);
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x6CC41D),
							nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "response success:", response.IsSuccessStatusCode
						);

						if (!response.IsSuccessStatusCode) throw new HttpRequestException($"GPT endpoint {API_CHAT_ENDPOINT} returned an error: {(int)response.StatusCode} {response.ReasonPhrase}", null, response.StatusCode);

						using var stream = await response.Content.ReadAsStreamAsync();
						using var reader = new StreamReader(stream);

						while (!reader.EndOfStream)
						{
							var line = await reader.ReadLineAsync();
							if (string.IsNullOrWhiteSpace(line)) continue;
							if (!line.StartsWith("data:")) continue;

							var data = line.Substring("data:".Length).Trim();
							if (data == "[DONE]") break;

							this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x9CA8E6),
								nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "streaming chunk:",
								CL257(data),
								CL(data)
							);

							using var doc = JsonDocument.Parse(data);
							var root = doc.RootElement;

							var delta = root.GetProperty("choices")[0].GetProperty("delta");
							if (delta.TryGetProperty("content", out var contentDelta))
							{
								var text = contentDelta.GetString();
								if (!string.IsNullOrEmpty(text))
								{
									result += text;
									if (streamingCallback != null) streamingCallback(text);
								}
							}

							if (root.GetProperty("choices")[0].TryGetProperty("finish_reason", out var fr) && fr.ValueKind == JsonValueKind.String)
							{
								finishReason = fr.GetString();
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xA71BE6),
									nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "response finish reason:", finishReason
								);
							}
						}
					}
					finally
					{
						await base.UsageMeter.SemaphoreSmart.ReleaseWaitAsync(operationObserver);
					}

					switch (finishReason)
					{
						case FINISH_REASON_STOP:
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x6F7954),
								nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "conversation finished."
							);
							break;
						case FINISH_REASON_LENGTH:
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xEB708C),
								nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "conversation continues..."
							);
							messages.Add(new() { Role = "assistant", Content = result });
							var continuePrompt = options.InstructOnTokenLimit ? "(CONTINUE!)" : options.ContinuePrompt ?? "continue from the last character";
							messages.Add(new() { Role = "user", Content = continuePrompt });
							continue;
						case FINISH_REASON_DELIMITER:
						default:
							if (finishReason != null)
								throw new Exception($"ChatGPT returned an invalid response: unexpected finishReason: {finishReason}{Environment.NewLine}{result}.");
							break;
					}
				}
				finally
				{
					++i;
				}
			}
			while (finishReason != FINISH_REASON_STOP && i < maxIterations);

			if (i >= maxIterations) throw new Exception($"GPT response was too long: {result}.");

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x5B1F27),
				nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"GPT chat event complete.",
				CL129(result),
				CL("Full result (unstripped):", result)
			);

			if (options.UseInternalCache)
			{
				Debug.Assert(cacheKey != null);
				this.completionsCache[cacheKey] = result;
			}
			return options.ParseJson ? WebUtility.ExtractJson(result) : result;
		}



		public async Task<string> SendMessageAsync(SemaphoreSmart.IAsyncOperationObserver operationObserver, string? systemContext, string? userMessage, RequestOptions options) => await this.SendMessageAsync(operationObserver, systemContext, [], userMessage, options);

		//	See: requireJson - https://platform.openai.com/docs/guides/text-generation/json-mode
		public async Task<string> SendMessageAsync(SemaphoreSmart.IAsyncOperationObserver operationObserver, string? systemContext, List<(string role, string content)> history, string? userMessage, RequestOptions options)
		{
			int maxIterations = 10;
			if (options.InstructOnTokenLimit) systemContext = (systemContext ?? string.Empty) + $" You shall reply in multiple messages. You shall keep each message slightly shorter than {(int)Math.Round(0.9 * options.ResponseMaxTokenCount)} words, then wait for the \"(CONTINUE!)\" command before continuing your response.";

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xC9E292),
				nameof(OpenAIChatMeteredService), nameof(SendMessageAsync),
				CL129(systemContext),
				CL129(userMessage),
				CL(options),
				CL(systemContext),
				CL(userMessage)
			);

			var cacheKey = systemContext + "*^*^*" + userMessage;
			if (this.completionsCache.TryGetValue(cacheKey, out string? value))
			{
				var cachedResult = value;
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x27B76C),
					nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"Using cached value.",
					CL129(cachedResult),
					CL("Full cached result (unstripped):", cachedResult)
				);
				return WebUtility.ExtractJson(cachedResult);
			}

			List<Message> messages = [];
			if (systemContext != null) messages.Add(new() { Role = "system", Content = systemContext });
			if (history.Any()) history.ForEach(v => messages.Add(new() { Role = v.role, Content = v.content }));
			if (userMessage != null) messages.Add(new() { Role = "user", Content = userMessage });

			int i = 0;
			string? result = string.Empty;
			CumulativeUsage usage = new();
			string? finishReason;
			string? prevResponseText = null;
			do
			{
				try
				{
					//if (options.IsReasoningModelModel) throw new NotImplementedException("previous_response_id");  //	read https://platform.openai.com/docs/api-reference/responses/create#responses_create-previous_response_id for a new workflow, would probably require a new method
					dynamic requestData = options.IsReasoningModelModel
						? new
						{
							model = options.Model ?? throw new Exception("GPT model is not configured."),
							messages = messages.ToArray(),
							reasoning_effort = options.ReasoningModelReasoningEffort.ToString().ToLower(),
							verbosity = options.ReasoningModelVerbosity.ToString().ToLower(),
							max_completion_tokens = options.ReasoningModelResponseMaxTokenCount
						}
						: new
						{
							model = options.Model ?? throw new Exception("GPT model is not configured."),
							messages = messages.ToArray(),
							temperature = options.Temperature,
							top_p = options.TopP,
							max_tokens = options.ResponseMaxTokenCount,
						};
					if (options.RequireJson) requestData.response_format = new { type = "json_object" };

					string json = JsonSerializer.Serialize(requestData, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					var content = new StringContent(json, Encoding.UTF8, "application/json");

					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x74EFC2),
						nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"sending request to openai ({i}/{maxIterations}):",
						CL(json)
					);

					HttpResponseMessage response;

					await base.UsageMeter.SemaphoreSmart.WaitAsync(operationObserver, this.HibernateTimeout);
					try
					{
						response = await this.httpClient.PostAsync(API_CHAT_ENDPOINT, content);

						var rateLimits = RateLimits.FromResponse(response) ?? throw new HttpRequestException($"GPT endpoint {API_CHAT_ENDPOINT} returned no rate limit headers, which usually means that the designated financial resource for openai has been depleted - check status at https://platform.openai.com/settings/organization/billing/overview; http status code: {(int)response.StatusCode} {response.ReasonPhrase}", null, response.StatusCode);

						var rateInfo = RateInfo.FromRateLimits(rateLimits);

						await base.UsageMeter.SemaphoreSmart.SetLimitAsync(await base.UsageMeter.Update(rateInfo));

						var um = (UsageMeter)base.UsageMeter;
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xEC82ED),
							nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"Health: R {um.RequestsHealthNv}, T {um.RequestsHealthNv}; Limits: R {rateInfo.RequestsUsage}/{rateInfo.RequestsLimit} ({rateInfo.RequestsReplenishTimeMs} ms), T {rateInfo.TokensUsage}/{rateInfo.TokensLimit} ({rateInfo.TokensReplenishTimeMs} ms), S: {base.UsageMeter.SemaphoreSmart.Limit}/{base.UsageMeter.ConcurrentOpsLimit} ({base.UsageMeter.SemaphoreSmart.DelayMs} ms)."
						);
					}
					finally
					{
						await base.UsageMeter.SemaphoreSmart.ReleaseWaitAsync(operationObserver);
					}

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x6D210F),
						nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "response success:", response.IsSuccessStatusCode
					);

					if (!response.IsSuccessStatusCode) throw new HttpRequestException($"GPT endpoint {API_CHAT_ENDPOINT} returned an error: {(int)response.StatusCode} {response.ReasonPhrase}", null, response.StatusCode);

					var responseString = await response.Content.ReadAsStringAsync();

					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x3F3504),
						nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "response:",
						CL257(responseString),
						CL(responseString)
					);

					var openAIResponse = JsonSerializer.Deserialize<OpenAIChatResponse>(responseString);
					var responseText = openAIResponse?.Choices?[0]?.Message?.Content ?? throw new Exception("ChatGPT returned an empty response.");
					if (prevResponseText == responseText) throw new Exception("ChatGPT returned a duplicate response.");
					prevResponseText = responseText;
					result += responseText;
					usage.Accumulate(openAIResponse?.Usage);

					await this.semaphore_debugUsageHistory.WaitAsync();
					try
					{
						this.debugCumulativeUsageHistory.Add(new Tuple<Message[], CumulativeUsage?>([.. messages], openAIResponse?.Usage));
					}
					finally
					{
						this.semaphore_debugUsageHistory.Release();
					}

					finishReason = openAIResponse?.Choices?[0]?.FinishReason ?? null;

					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xC2D560),
						nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "response finish reason:", finishReason
					);

					switch (finishReason)
					{
						case FINISH_REASON_STOP:
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD5ED4A),
								nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "conversation finished."
							);
							break;
						case FINISH_REASON_LENGTH:
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x2DA0CA),
								nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), "conversation continues..."
							);
							messages.Add(new() { Role = "assistant", Content = openAIResponse?.Choices?[0]?.Message?.Content });
							var continuePrompt = options.InstructOnTokenLimit ? "(CONTINUE!)" : options.ContinuePrompt ?? "continue from the last character";
							messages.Add(new() { Role = "user", Content = continuePrompt });
							continue;
						case FINISH_REASON_DELIMITER:
						default:
							throw new Exception($"ChatGPT returned an invalid response: unexpected finishReason: {finishReason ?? "(null)"}{Environment.NewLine}{openAIResponse?.Choices?[0]?.Message?.Content ?? null}.");
					}
				}
				finally
				{
					++i;
				}
			}
			while (finishReason != FINISH_REASON_STOP && i < maxIterations);

			if (i >= maxIterations) throw new Exception($"GPT response was too long: {result}.");

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x752BE1),
				nameof(OpenAIChatMeteredService), nameof(SendMessageAsync), $"GPT chat event complete. Usage: {usage}.",
				CL129(result),
				CL("Full result (unstripped):", result)
			);

			return options.ParseJson ? WebUtility.ExtractJson(this.completionsCache[cacheKey] = result) : this.completionsCache[cacheKey] = result;
		}

		public Tuple<Message[], CumulativeUsage?>[] DebugUsageHistory
		{
			get
			{
				return [.. this.debugCumulativeUsageHistory];
			}
		}

		const float DEFAULT_TEMPERATURE = 0;
		const float DEFAULT_TOPP = 0;
		const string API_CHAT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
		const string FINISH_REASON_STOP = "stop";
		const string FINISH_REASON_LENGTH = "length";
		const string FINISH_REASON_DELIMITER = "delimiter";     //	unused, present for completeness

		readonly int gptRequestTimeoutMs;
		readonly string apiKey;

		readonly HttpClient httpClient;

		readonly List<Tuple<Message[], CumulativeUsage?>> debugCumulativeUsageHistory = [];
		readonly Dictionary<string, string> completionsCache = [];
		readonly SemaphoreSlim semaphore_debugUsageHistory = new(1, 1);
	}
}
