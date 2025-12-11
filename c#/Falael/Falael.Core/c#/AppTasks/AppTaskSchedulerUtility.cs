using System.Text.RegularExpressions;
using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json.Serialization;
using System.Text.Json;

using static Falael.Core.Units;

namespace Falael.Core.AppTasks
{
	//	See ...\resources\specs\scheduler-spec.txt
	public static class AppTaskSchedulerUtility
	{
		#region Nested Types

		public class ExecutionInfo
		{
			[JsonPropertyName("tags")]
			public string[]? Tags { get; set; }

			[JsonPropertyName("replenishTime")]
			public DateTime? LastTokenReplenishTime { get; set; }


			[JsonPropertyName("tokens")]
			public int? ExecutionTokenCount { get; set; }

			[JsonPropertyName("rateLimitTemplate")]
			public FuzzyTimeRate? RateLimitTemplate { get; set; }

			[JsonPropertyName("rateLimit")]
			public TimeRate? RateLimit { get; set; }


			public string Serialize()
			{
				return JsonSerializer.Serialize(this, new JsonSerializerOptions
				{
					WriteIndented = true,
					DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
					Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
				});
			}
		}

		public class SchedulerInfo : List<ExecutionInfo>
		{
			public string Serialize()
			{
				return JsonSerializer.Serialize(this, new JsonSerializerOptions
				{
					WriteIndented = true,
					DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
					Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
				});
			}

			public ExecutionInfo? GetByTags(string[] tags)
			{
				return this.Find(v =>
				{
					Debug.Assert(v.Tags != null);
					return AppTaskQueueInfo.TagsEqual(v.Tags, tags);
				});
			}

			public static SchedulerInfo? Deserialize(string value)
			{
				return JsonSerializer.Deserialize<SchedulerInfo?>(value, new JsonSerializerOptions()
				{
					Converters = { new TimeSpanJsonConverter(), new TimeRateJsonConverter() },
				});
			}
		}

		public enum ErrorType
		{
			JsError,
			NavError,
			NetError,
			GeneralError,
		}

		public enum ErrorHandling
		{
			Discard,
			Stop,
		}

		public class Policy
		{
			public bool? Disabled { get; private set; } = null;
			public FuzzyTimeRate RateLimit { get; private set; } = FuzzyTimeRate.Infinity;
			public int RunningLimit { get; private set; } = -1;
			public int QueueLimit { get; private set; } = -1;
			public int Priority { get; private set; } = 0;
			public TimeSpan Timeout { get; private set; } = TimeSpan.Zero;
			public ErrorHandling JsErrorHandling { get; private set; } = ErrorHandling.Discard;
			public ErrorHandling NavErrorHandling { get; private set; } = ErrorHandling.Discard;
			public ErrorHandling NetErrorHandling { get; private set; } = ErrorHandling.Discard;
			public ErrorHandling GeneralErrorHandling { get; private set; } = ErrorHandling.Discard;

			public override string ToString()
			{
				var sb = new StringBuilder();

				if (this.Disabled == true) sb.Append($"disabled: true; ");
				else if (this.Disabled == false) sb.Append($"disabled: false; ");
				else sb.Append($"disabled: null; ");
				if (this.RateLimit != FuzzyTimeRate.Infinity) sb.Append($"limit rate: {this.RateLimit}; ");
				if (this.RunningLimit != -1) sb.Append($"limit running: {this.RunningLimit}; ");
				if (this.QueueLimit != -1) sb.Append($"limit queue: {this.QueueLimit}; ");
				if (this.Priority != 0) sb.Append($"priority: {this.Priority}; ");
				if (this.Timeout != TimeSpan.MaxValue) sb.Append($"timeout: {this.Timeout}; ");
				if (this.JsErrorHandling != ErrorHandling.Discard) sb.Append($"on js error: {this.JsErrorHandling}; ");
				if (this.NavErrorHandling != ErrorHandling.Discard) sb.Append($"on nav error: {this.NavErrorHandling}; ");
				if (this.NetErrorHandling != ErrorHandling.Discard) sb.Append($"on net error: {this.NetErrorHandling}; ");
				if (this.GeneralErrorHandling != ErrorHandling.Discard) sb.Append($"on general error: {this.GeneralErrorHandling}; ");

				return sb.ToString();
			}

			public static Policy FromCTS(string[] tags, CascadingTaggedSheet rules)
			{
				var raw_disabled = rules.QueryPropertyValue(tags, "disabled");
				var raw_rateLimit = rules.QueryPropertyValue(tags, "limit rate");
				var raw_runningLimit = rules.QueryPropertyValue(tags, "limit running");
				var raw_queueLimit = rules.QueryPropertyValue(tags, "limit queue");
				var raw_priority = rules.QueryPropertyValue(tags, "priority");
				var raw_timeout = rules.QueryPropertyValue(tags, "timeout");
				var raw_jsErrorHandling = rules.QueryPropertyValue(tags, "on js error");
				var raw_navErrorHandling = rules.QueryPropertyValue(tags, "on nav error");
				var raw_netErrorHandling = rules.QueryPropertyValue(tags, "on net error");
				var raw_generalErrorHandling = rules.QueryPropertyValue(tags, "on general error");

				var result = new Policy();
				if (raw_disabled != null) result.Disabled = (bool)raw_disabled;
				if (raw_rateLimit != null) result.RateLimit = __parseTimeRateDef((string)raw_rateLimit);
				if (raw_runningLimit != null) result.RunningLimit = raw_runningLimit is int @int ? @int : int.Parse((string)raw_runningLimit);
				if (raw_queueLimit != null) result.QueueLimit = raw_queueLimit is int @int ? @int : int.Parse((string)raw_queueLimit);
				if (raw_priority != null) result.Priority = raw_priority is int @int ? @int : int.Parse((string)raw_priority);
				if (raw_timeout != null) result.Timeout = ParseTimeSpan((string)raw_timeout);
				if (raw_jsErrorHandling != null) result.JsErrorHandling = __parseErrorHandling((string)raw_jsErrorHandling);
				if (raw_navErrorHandling != null) result.NavErrorHandling = __parseErrorHandling((string)raw_navErrorHandling);
				if (raw_netErrorHandling != null) result.NetErrorHandling = __parseErrorHandling((string)raw_netErrorHandling);
				if (raw_generalErrorHandling != null) result.GeneralErrorHandling = __parseErrorHandling((string)raw_generalErrorHandling);

				result.TryValidate();

				return result;

				//	kept because may come handy some day
				//FuzzyTimeSpan __parseTimeSpanDef(string input)
				//{
				//	var pattern = @"\bfuzzy\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)";
				//	var match = Regex.Match(input, pattern, RegexOptions.IgnoreCase);

				//	if (match.Success && match.Groups.Count == 3)
				//	{
				//		var value1 = match.Groups[1].Value;
				//		var value2 = match.Groups[2].Value;
				//		return new(Units.ParseTimeSpan(value1), Units.ParseTimeSpan(value2));
				//	}
				//	else return new(Units.ParseTimeSpan(input), null);
				//}

				FuzzyTimeRate __parseTimeRateDef(string input)
				{
					var pattern = @"\bfuzzy\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)";
					var match = Regex.Match(input, pattern, RegexOptions.IgnoreCase);

					if (match.Success && match.Groups.Count == 3)
					{
						var value1 = match.Groups[1].Value;
						var value2 = match.Groups[2].Value;
						return new(ParseTimeRate(value1), decimal.Parse(value2)); ;
					}
					else return new(ParseTimeRate(input), 0);
				}

				ErrorHandling __parseErrorHandling(string input)
				{
					return input switch
					{
						"discard" => ErrorHandling.Discard,
						"stop" => ErrorHandling.Stop,
						_ => throw new NotImplementedException(input),
					};
				}
			}

			void TryValidate()
			{
				if (this.RateLimit.BaseValue.Value != -1 && this.RateLimit.BaseValue.Value < 0) throw new FormatException("this.RateLimit.BaseValue.Value != -1 && this.RateLimit.BaseValue.Value < 0");

				if (this.RunningLimit != -1 && this.RunningLimit < 0) throw new FormatException("this.RunningLimit != -1 && this.RunningLimit < 0");
				if (this.QueueLimit != -1 && this.QueueLimit < 0) throw new FormatException("this.QueueLimit != -1 && this.QueueLimit < 0");

				if (this.Timeout.Ticks < 0) throw new FormatException("this.Timeout.Ticks < 0");
			}
		}

		public enum ScheduleDecision
		{
			OK,
			Decline_DequeueDisabled,
			Decline_EnqueueDisabled,
			Decline_LimitQueue,
			Decline_LimitRate,
			Decline_LimitRunning,
		}

		public class ScheduleRuleTestResult
		{
			public ScheduleDecision? Decision { get; set; }
			public Policy? Policy { get; set; }

			public FuzzyTimeRate? Result_RateLimitTemplate { get; set; }
			public TimeRate? Result_RateLimit { get; set; }
			public int? Result_ExecutionTokenCount { get; set; }
			public DateTime? Result_LastTokenReplenishTime { get; set; }

			public string Serialize()
			{
				return JsonSerializer.Serialize(this, new JsonSerializerOptions
				{
					DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
					Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
					Converters =
					{
						new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
					}
				});
			}
		}

		#endregion

		/// <remarks>
		///	This method enforces the "limit queue" scheduling rule. For a given tag set, every possible subset of tags is tested separately upon the scheduling policy that corresponds to the subset including the empty set. This way even an application-wide queue size limit would be enforced for every tag set, by counting all queued items regardless of their tags. "limit queue" scheduling rules cascading from more generic to more specific subsets via CascadingTaggedSheet, present no issue with this implementation because more specific subset limit checks will always succeed if more generic tag subsets have already succeeded (more specific tag subsets always select less or equal number of queue items than the more generic ones).
		///	Thje aforementioned approach is implemented only for the "limit queue" scheduling rule. All other scheduling rules apply to the given <paramref name="tags"/>, mainly in <see cref="CanDequeue"/> as CanEnqueue enforces only the "limit queue" scheduling rule.
		/// </remarks>
		public static ScheduleRuleTestResult CanEnqueue(string[] tags, CascadingTaggedSheet rulesCTS, AppTaskQueueInfo queueInfo)
		{
			var powerSet = AppTaskQueueInfo.TagsPowerSet(tags);
			var powerSet_reversed = AppTaskQueueInfo.TagsPowerSet(tags).Reverse();

			//	specific-to-generic CTS probing (will match the inner-most rule occurrence first)
			//	- enforce "disabled: true" - may disable all tasks at root level and enable several specific task in the depth of the tagged sheet definition
			foreach (var subset in powerSet_reversed)
			{
				var policy = Policy.FromCTS(subset, rulesCTS);
				//	treat unset "disabled" as inheritance and iterate to a more generic rule
				if (policy.Disabled == null) continue;
				//	an inner-most explicitly set "disabled" is treated as normative
				//	- `false` indicates no filtering regardless of more generic property occurrences
				if (policy.Disabled == false) break;
				//	- `true` prevents the task from being enqueued
				return new() { Decision = ScheduleDecision.Decline_EnqueueDisabled, Policy = policy };
			}

			//	generic-to-specific CTS probing (will match the outer-most rule occurrence first)
			//	- enforce "limit queue"
			foreach (var subset in powerSet)
			{
				var policy = Policy.FromCTS(subset, rulesCTS);
				if (policy.QueueLimit == -1) continue;
				if (policy.QueueLimit == 0) return new() { Decision = ScheduleDecision.Decline_LimitQueue, Policy = policy };
				var totalNumberInQueue = queueInfo.CountSuperset(subset, AppTaskQueueInfo.QueueItemState.Enqueued) + queueInfo.CountSuperset(subset, AppTaskQueueInfo.QueueItemState.Running) + queueInfo.CountSuperset(subset, AppTaskQueueInfo.QueueItemState.Throttled);
				if (totalNumberInQueue >= policy.QueueLimit) return new() { Decision = ScheduleDecision.Decline_LimitQueue, Policy = policy };
			}
			return new() { Decision = ScheduleDecision.OK };
		}

		public static ScheduleRuleTestResult CanDequeue(string[] tags, CascadingTaggedSheet rulesCTS, AppTaskQueueInfo queueInfo, ExecutionInfo? executionInfo)
		{
			var policy_exact = Policy.FromCTS(tags, rulesCTS);
			var powerSet_reversed = AppTaskQueueInfo.TagsPowerSet(tags).Reverse();

			//	specific-to-generic CTS probing (will match the inner-most rule occurrence first)
			//	- enforce "disabled: true" - may disable all tasks at root level and enable several specific task in the depth of the tagged sheet definition
			foreach (var subset in powerSet_reversed)
			{
				var policy = Policy.FromCTS(subset, rulesCTS);
				//	treat unset "disabled" as inheritance and iterate to a more generic rule
				if (policy.Disabled == null) continue;
				//	an inner-most explicitly set "disabled" is treated as normative
				//	- `false` indicates no filtering regardless of more generic property occurrences
				if (policy.Disabled == false) break;
				//	- `true` prevents the task from being enqueued
				return new() { Decision = ScheduleDecision.Decline_DequeueDisabled, Policy = policy };
			}

			ScheduleRuleTestResult result = new() { Decision = ScheduleDecision.OK, Policy = policy_exact };

			//	generic-to-specific CTS probing (will match the outer-most rule occurrence first)
			//	- enforce "limit running"
			foreach (var subset in AppTaskQueueInfo.TagsPowerSet(tags))
			{
				var policy = Policy.FromCTS(subset, rulesCTS);
				if (policy.RunningLimit == -1) continue;
				if (policy.RunningLimit == 0) return new() { Decision = ScheduleDecision.Decline_LimitRunning, Policy = policy };
				if (queueInfo.CountSuperset(subset, AppTaskQueueInfo.QueueItemState.Running) + queueInfo.CountSuperset(subset, AppTaskQueueInfo.QueueItemState.Throttled) >= policy.RunningLimit) return new() { Decision = ScheduleDecision.Decline_LimitRunning, Policy = policy };
			}

			//	enforce "limit rate"
			if (policy_exact.RateLimit != FuzzyTimeRate.Infinity)
			{
				if (executionInfo?.LastTokenReplenishTime == null || executionInfo.RateLimit == null || executionInfo.RateLimitTemplate == null || executionInfo.ExecutionTokenCount == null)                           //	first dequeing (create data) or bad data (reset data), feed the caller with the relevant info
				{
					result.Result_RateLimitTemplate = policy_exact.RateLimit;
					result.Result_RateLimit = policy_exact.RateLimit.Collapse();
					result.Result_ExecutionTokenCount = (int)Math.Round(result.Result_RateLimit.Value.Value);
					result.Result_LastTokenReplenishTime = DateTime.Now;
				}
				else if (executionInfo.RateLimitTemplate.Equals(policy_exact.RateLimit))                            //	the policy is the same, reusing the previously selected rate limit
				{
					result.Result_RateLimitTemplate = executionInfo.RateLimitTemplate;
					if (DateTime.Now - executionInfo.LastTokenReplenishTime >= executionInfo.RateLimit.Value.Unit)       //	the unit interval has elapsed, replenish the tokens
					{
						result.Result_ExecutionTokenCount = (int)Math.Round(executionInfo.RateLimit.Value.Value);   //	replenish the tokens; `Value` is not fuzzy, use it right away
						result.Result_LastTokenReplenishTime = DateTime.Now;
						result.Result_RateLimit = policy_exact.RateLimit.Collapse();                              //	select a new exact rate limit for the next interval
					}
					else
					{
						result.Result_ExecutionTokenCount = executionInfo.ExecutionTokenCount;
						result.Result_LastTokenReplenishTime = executionInfo.LastTokenReplenishTime;
						result.Result_RateLimit = executionInfo.RateLimit;
					}
				}
				else                                                                                                //	the policy has changed, updating the rate limit
				{
					result.Result_RateLimitTemplate = policy_exact.RateLimit;
					result.Result_RateLimit = policy_exact.RateLimit.Collapse();
					if (DateTime.Now - executionInfo.LastTokenReplenishTime >= result.Result_RateLimit.Value.Unit)     //	the unit interval has elapsed, replenish the tokens
					{
						result.Result_ExecutionTokenCount = (int)Math.Round(result.Result_RateLimit.Value.Value);//	replenish the tokens; `Value` is not fuzzy, use it right away
						result.Result_LastTokenReplenishTime = DateTime.Now;
					}
					else
					{                                                                                               //	trim the existing tokens if exceeding the new value
						var remainingTokensRatio = (decimal)executionInfo.ExecutionTokenCount / executionInfo.RateLimit.Value.Value;
						result.Result_ExecutionTokenCount = Math.Min((int)executionInfo.ExecutionTokenCount, (int)Math.Round(remainingTokensRatio * result.Result_RateLimit.Value.Value));
						result.Result_LastTokenReplenishTime = executionInfo.LastTokenReplenishTime;
					}
				}
				if (result.Result_ExecutionTokenCount <= 0)                                                     //	decline if no more tokens are available for the current interval
				{
					result.Result_ExecutionTokenCount = 0;
					result.Decision = ScheduleDecision.Decline_LimitRate;
					return result;
				}
				--result.Result_ExecutionTokenCount;                                                              //	decrease token count to reflect the this dequeueing op
			}
			//	else the Seclected_* properties will all be null, indicating that no "limit rate" policy has been specified

			return result;
		}

		public static ErrorHandling GetErrorHandling(string[] tags, CascadingTaggedSheet rulesCTS, ErrorType errorType)
		{
			return errorType switch
			{
				ErrorType.JsError => Policy.FromCTS(tags, rulesCTS).JsErrorHandling,
				ErrorType.NavError => Policy.FromCTS(tags, rulesCTS).NavErrorHandling,
				ErrorType.NetError => Policy.FromCTS(tags, rulesCTS).NetErrorHandling,
				ErrorType.GeneralError => Policy.FromCTS(tags, rulesCTS).GeneralErrorHandling,
				_ => throw new NotImplementedException(errorType.ToString()),
			};
		}
	}

}