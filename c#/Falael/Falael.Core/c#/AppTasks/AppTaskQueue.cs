using System.Text;
using System.Diagnostics;

using static Falael.Core.AppTasks.AppTaskSchedulerUtility;
using Falael.Core.Syncronization;

namespace Falael.Core.AppTasks
{
	public class AppTaskQueue : FalaelContextAware, IAppTaskQueue
	{
		const ulong LGID = 0x8BFECE;

		public const string FILE_SYSTEM_SAFE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_!$#@";

		public AppTaskQueue(
			IFalaelContext coreContext,
			Configuration configuration,
			List<IAppTaskStorageFormat> appTaskStorageFormats
		) : base(coreContext)
		{
			this.configuration = configuration;
			this.appTaskStorageFormats = appTaskStorageFormats;
		}


		#region Configuration

		[ConfigurationClass]
		public class Configuration
		{
			#region app.task.orchestrator

			/// <summary>
			/// A directory for storing current app task queue state files - app task files, the scheduler state file, e.g. `@".\tasks\"`.
			/// </summary>
			[ConfigurationField("app.task.orchestrator.tasksDirectory")]
			public string App_Task_Orchestrator_TasksDirectory { get; init; } = @".\tasks\";

			/// <summary>
			/// A directory for storing failed app task files, e.g. `@".\tasks\errors\"`.
			/// </summary>
			[ConfigurationField("app.task.orchestrator.taskErrorsDirectory")]
			public string App_Task_Orchestrator_TaskErrorsDirectory { get; init; } = @".\tasks\errors\";

			#endregion

			#region app.task.scheduler

			/// <summary>
			/// Scheduler rules CTS file path, e.g. `"scheduler-rules.cts.json"`.
			/// </summary>
			/// <see cref="CascadingTaggedSheet"/>
			[ConfigurationField("app.task.scheduler.rulesFilePath")]
			public string App_Task_Scheduler_RulesFilePath { get; init; } = "scheduler-rules.cts.json";

			/// <summary>
			/// Scheduler current state JSON file name, e.g. `"scheduler-state.json"`.
			/// </summary>
			[ConfigurationField("app.task.scheduler.stateFilePath")]
			public string App_Task_Scheduler_StateFilePath { get; init; } = "scheduler-state.json";

			#endregion
		}

		#endregion

		#region IAppTaskQueue

		public async Task EnqueueAppTask(Peg peg, AppTask appTask)
		{
			Debug.Assert(peg.IsLocked);

			this.OnAppTaskEnqueuing(appTask);

			var rulesCTS = await this.ReadSchedulerRules(peg);
			var queueInfo = await this.ReadQueueInfo(peg);

			await this.AbortTimeoutAppTasks(peg, rulesCTS, queueInfo);

			var outcome = CanEnqueue(appTask.InstanceTags, rulesCTS, queueInfo);

			Debug.Assert(outcome.Result_RateLimitTemplate == null);             //	not used in enqueueing scenario
			Debug.Assert(outcome.Result_RateLimit == null);                     //	not used in enqueueing scenario
			Debug.Assert(outcome.Result_ExecutionTokenCount == null);           //	not used in enqueueing scenario

			switch (outcome.Decision)
			{
				case ScheduleDecision.OK:
					break;
				case ScheduleDecision.Decline_EnqueueDisabled:
					throw new AppTaskSchedulerException(appTask, outcome, "Cannot enqueue, task is disabled.");
				case ScheduleDecision.Decline_LimitQueue:
					throw new AppTaskSchedulerException(appTask, outcome, "Cannot enqueue, task queue limit exceeded.");
				case ScheduleDecision.Decline_DequeueDisabled:
				case ScheduleDecision.Decline_LimitRate:
				case ScheduleDecision.Decline_LimitRunning:
					throw new InvalidOperationException(outcome.Decision.ToString()); //	not used in enqueueing scenario
				default:
					throw new NotImplementedException(outcome.Decision.ToString());
			}

			AppTaskQueueInfo.Item queueItem = new(_generateRandomFsToken(), appTask.InstanceTags, AppTaskQueueInfo.QueueItemState.Enqueued, null, null);  //	no timestamp, timestamp is only for running tasks
			var fileFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, queueItem.FileName);

			this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x466A5C),
				nameof(AppTaskQueue), "Writing app task file.", fileFullPath
			);

			var appTaskStorageFormat = this.LookupAppTaskStorageFormat(appTask.InstanceTags);
			Debug.Assert(appTaskStorageFormat != null);

			string text = appTaskStorageFormat.WriteObject(appTask);
			await File.WriteAllTextAsync(fileFullPath, text);

			this.OnAppTaskEnqueued(appTask);

			static string _generateRandomFsToken(int length = 8)
			{
				var sb = new StringBuilder(length);
				for (int i = 0; i < length; i++) sb.Append(FILE_SYSTEM_SAFE_CHARACTERS[fsRandom.Next(FILE_SYSTEM_SAFE_CHARACTERS.Length)]);
				return sb.ToString();
			}
		}

		public async Task<AppTask?> DequeueNextAppTask(Peg peg, object? appTaskDeserializationContext)
		{
			Debug.Assert(peg.IsLocked);

			this.OnAppTaskDequeuing();

			var rulesCTS = await this.ReadSchedulerRules(peg);
			var queueInfo = await this.ReadQueueInfo(peg);

			await this.AbortTimeoutAppTasks(peg, rulesCTS, queueInfo);

			var queuedItems = queueInfo
				.Where(v => v.QueueItemState == AppTaskQueueInfo.QueueItemState.Enqueued)
				.OrderByDescending(v => Policy.FromCTS(v.Tags, rulesCTS).Priority)
				.ThenBy(v => File.GetCreationTime(Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, v.FileName)));

			var schedulerInfo = await this.ReadSchedulerInfo(peg);
			var schedulerInfoChanged = false;

			AppTaskQueueInfo.Item? selectedItem = null;
			ExecutionInfo? executionInfo = null;
			ScheduleRuleTestResult? scheduleRuleTestResult = null;
			foreach (var item in queuedItems)
			{
				executionInfo = schedulerInfo.GetByTags(item.Tags);
				scheduleRuleTestResult = CanDequeue(item.Tags, rulesCTS, queueInfo, executionInfo);

				//	detect CST rule changes that affect the current executionInfo state 
				if (executionInfo != null && (scheduleRuleTestResult.Decision == ScheduleDecision.Decline_LimitRate || scheduleRuleTestResult.Decision == ScheduleDecision.OK))
				{
					if (scheduleRuleTestResult.Result_RateLimitTemplate == null)
					{
						if (executionInfo.RateLimitTemplate != null)    //	rate limit was removed
						{
							executionInfo.RateLimitTemplate = null;
							executionInfo.RateLimit = null;
							executionInfo.ExecutionTokenCount = null;
							schedulerInfoChanged = true;
						}
					}
					else
					{
						Debug.Assert(scheduleRuleTestResult.Result_RateLimitTemplate != null);
						Debug.Assert(scheduleRuleTestResult.Result_RateLimit != null);
						Debug.Assert(scheduleRuleTestResult.Result_ExecutionTokenCount != null);

						if (!scheduleRuleTestResult.Result_RateLimitTemplate.Equals(executionInfo.RateLimitTemplate))
						{
							executionInfo.RateLimitTemplate = scheduleRuleTestResult.Result_RateLimitTemplate;
							schedulerInfoChanged = true;
						}
						if (!scheduleRuleTestResult.Result_RateLimit.Value.Equals(executionInfo.RateLimit))
						{
							executionInfo.RateLimit = scheduleRuleTestResult.Result_RateLimit;
							schedulerInfoChanged = true;
						}
						if (scheduleRuleTestResult.Result_ExecutionTokenCount != executionInfo.ExecutionTokenCount)
						{
							executionInfo.ExecutionTokenCount = scheduleRuleTestResult.Result_ExecutionTokenCount;
							schedulerInfoChanged = true;
						}
					}
				}

				switch (scheduleRuleTestResult.Decision)
				{
					case ScheduleDecision.OK:
						break;
					case ScheduleDecision.Decline_DequeueDisabled:
					case ScheduleDecision.Decline_LimitRate:
					case ScheduleDecision.Decline_LimitRunning:
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xE41F02),
							nameof(AppTaskQueue), "File skipped due to orchestrator scheduling rules.", item.FileName,
							CL(Environment.NewLine, nameof(scheduleRuleTestResult), scheduleRuleTestResult.Serialize()),
							CL(Environment.NewLine, nameof(executionInfo), executionInfo?.Serialize())
						);
						continue;
					case ScheduleDecision.Decline_EnqueueDisabled:
					case ScheduleDecision.Decline_LimitQueue:
						throw new InvalidOperationException(scheduleRuleTestResult.Decision.ToString()); //	not used in dequeueing scenario
					default:
						throw new NotImplementedException(scheduleRuleTestResult.Decision.ToString());
				}

				//	take the first applicable item; because of sorting it is the next item to be dequeued (the one among the highest priority with the oldest date)
				selectedItem = item;
				break;
			}

			if (selectedItem == null)
			{
				if (schedulerInfoChanged) await this.WriteSchedulerInfo(peg, schedulerInfo);
				this.OnAppTaskDequeued(null);
				return null;
			}

			var fileFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, selectedItem.FileName);

			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x786A13),
				nameof(AppTaskQueue), "Reading task from file.", Path.GetFileName(fileFullPath),
				CL(fileFullPath)
			);

			var appTaskStorageFormat = this.LookupAppTaskStorageFormat(selectedItem.Tags) ?? throw new FormatException($"Unrecognized task storage format in file: {fileFullPath}");
			;
			var result = (AppTask?)appTaskStorageFormat.ReadObject(await File.ReadAllTextAsync(fileFullPath), appTaskDeserializationContext) ?? throw new FormatException($"Bad app task file format: {fileFullPath}");
			try
			{
				var runningTaskFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, selectedItem.ChangeKind(AppTaskQueueInfo.QueueItemState.Running).FileName);
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x2E72EF),
					nameof(AppTaskQueue), "Marking task as running.", Path.GetFileName(runningTaskFullPath),
					CL(fileFullPath, "->", runningTaskFullPath)
				);
				File.Move(fileFullPath, runningTaskFullPath);
				result.FilePath = runningTaskFullPath;
#if DEBUG
				var count = LockHandle.Count(runningTaskFullPath);
				if (count != 0)
				{
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xB0F7A4),
						nameof(AppTaskQueue), "[------------------------------------]:", nameof(AppTaskQueue), nameof(DequeueNextAppTask), $"MULTIPLE LOCKS ({count}) ON.", Path.GetFileName(runningTaskFullPath),
						CL(runningTaskFullPath)
					);
				}
#endif
				result.LockHandle = await LockHandle.AcquireAsync(Guid.NewGuid(), Path.GetFileName(runningTaskFullPath), new() { FullFilePath = runningTaskFullPath, FileMode = FileMode.Open, FileShare = FileShare.Read });

				Debug.Assert(scheduleRuleTestResult != null);
				if (executionInfo == null) schedulerInfo.Add(executionInfo = new()
				{
					Tags = selectedItem.Tags,
					LastTokenReplenishTime = scheduleRuleTestResult.Result_LastTokenReplenishTime,

					RateLimitTemplate = scheduleRuleTestResult.Result_RateLimitTemplate,
					RateLimit = scheduleRuleTestResult.Result_RateLimit,
					ExecutionTokenCount = scheduleRuleTestResult.Result_ExecutionTokenCount,
				});
				else
				{
					//executionInfo.RateLimitTemplate = scheduleRuleTestResult.Selected_RateLimitTemplate;		//	set earlier
					//executionInfo.RateLimit = scheduleRuleTestResult.Selected_RateLimit;						//	set earlier
					//executionInfo.ExecutionTokenCount = scheduleRuleTestResult.Selected_ExecutionTokenCount;	//	set earlier
					executionInfo.LastTokenReplenishTime = scheduleRuleTestResult.Result_LastTokenReplenishTime;
				}
				await this.WriteSchedulerInfo(peg, schedulerInfo);
			}
			catch
			{
				result.LockHandle?.Release();
				throw;
			}

			this.OnAppTaskDequeued(result);

			return result;
		}

		public async Task ResetOrphanedAppTasks(Peg peg)
		{
			Debug.Assert(peg.IsLocked);

			var queueInfo = await this.ReadQueueInfo(peg);
			var queuedItems = queueInfo.Where(v => v.QueueItemState == AppTaskQueueInfo.QueueItemState.Running || v.QueueItemState == AppTaskQueueInfo.QueueItemState.Throttled).ToList();

			SchedulerInfo? schedulerInfo = null;
			var schedulerInfoChanged = false;

			foreach (var item in queuedItems)
			{
				var orphanedTaskFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, item.FileName);
				var queuedTaskFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, item.ChangeKind(AppTaskQueueInfo.QueueItemState.Enqueued).FileName);
				this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x25CEFF),
					nameof(AppTaskQueue), "Resetting orphaned task.", Path.GetFileName(orphanedTaskFilePath),
					CL(orphanedTaskFilePath, "->", queuedTaskFilePath)
				);
				try
				{
					File.Move(orphanedTaskFilePath, queuedTaskFilePath);

					schedulerInfo ??= await this.ReadSchedulerInfo(peg);
					var executionInfo = schedulerInfo.GetByTags(item.Tags);
					if (executionInfo == null) continue;
					if (executionInfo.RateLimit != null && executionInfo.ExecutionTokenCount != null)
					{
						executionInfo.ExecutionTokenCount = Math.Min((int)executionInfo.ExecutionTokenCount + 1, (int)executionInfo.RateLimit.Value.Value);
						schedulerInfoChanged = true;
					}
				}
				catch (IOException ex)
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x102D9B),
						nameof(AppTaskQueue), "Failed to rename task file (this might be normal if a running task has been started by another application instance).", Path.GetFileName(orphanedTaskFilePath),
						CL(orphanedTaskFilePath),
						CL(ex)
					);
				}
			}

			if (schedulerInfoChanged)
			{
				Debug.Assert(schedulerInfo != null);
				await this.WriteSchedulerInfo(peg, schedulerInfo);
			}
		}

		public void FinalizeAppTask(Peg peg, AppTask appTask, object? result, AppTaskException? exception)
		{
			Debug.Assert(peg.IsLocked);

			if (exception == null) this.OnAppTaskFinalizing(appTask, result);
			else this.OnAppTaskError(exception);

			appTask?.LockHandle?.Release();
			if (appTask?.FilePath == null) return;

			if (exception != null)
			{
				var queueInfoItem = new AppTaskQueueInfo.Item(Path.GetFileName(appTask.FilePath));
				var destAppTaskFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory, queueInfoItem.ChangeKind(AppTaskQueueInfo.QueueItemState.Error).FileName);
				var destExceptionFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory, queueInfoItem.ChangeKind(AppTaskQueueInfo.QueueItemState.Exception).FileName);

				this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0xC1004C),
					nameof(AppTaskQueue), "Moving failed task file.", appTask.FilePath, "->", destAppTaskFilePath
				);
				Directory.CreateDirectory(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory);
				File.Move(appTask.FilePath, destAppTaskFilePath);

				this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x63FBFB),
					nameof(AppTaskQueue), "Saving exception data.", appTask.FilePath, "->", destExceptionFilePath
				);
				File.WriteAllText(destExceptionFilePath, DateTime.Now.ToString() + Environment.NewLine + exception.ToString());
				return;
			}

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xC57EB7),
				nameof(AppTaskQueue), "Deleting finished task file.", Path.GetFileName(appTask.FilePath),
				CL(appTask.FilePath)
			);
			File.Delete(appTask.FilePath);
			this.OnAppTaskFinalized(appTask, result);
		}


		public async Task ThrottleAppTask(Peg peg, AppTask appTask)
		{
			Debug.Assert(peg.IsLocked);
			Debug.Assert(appTask?.FilePath != null);
			Debug.Assert(appTask?.LockHandle != null);

			if (!File.Exists(appTask.FilePath))
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0xE7D890),
					nameof(AppTaskQueue), "Cannot throttle a deleted file. This might be because the app task has already timed out.", appTask.FilePath);
				return;
			}

			this.OnAppTaskThrottling(appTask);

			var runningTaskFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, appTask.FilePath);
			this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x463BD3),
				nameof(AppTaskQueue), "Throttling app task.", Path.GetFileName(runningTaskFilePath),
				CL(runningTaskFilePath)
			);

			AppTaskQueueInfo.Item? queueInfoItem = new(appTask.FilePath);
			var throttledTaskFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, queueInfoItem.ChangeKind(AppTaskQueueInfo.QueueItemState.Throttled).FileName);
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x2FFFE2),
				nameof(AppTaskQueue), "Renaming task file.", Path.GetFileName(runningTaskFilePath),
				CL(runningTaskFilePath, "->", throttledTaskFullPath)
			);

			appTask.LockHandle.Release();
			try
			{
				File.Move(runningTaskFilePath, throttledTaskFullPath);
				appTask.FilePath = throttledTaskFullPath;
				appTask.LockHandle = await LockHandle.AcquireAsync(Guid.NewGuid(), Path.GetFileName(throttledTaskFullPath), new() { FullFilePath = throttledTaskFullPath, FileMode = FileMode.Open, FileShare = FileShare.Read });

				this.OnAppTaskThrottled(appTask);
			}
			catch (IOException ex)
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0xD894D4),
					nameof(AppTaskQueue), "Failed to rename task file (this might be normal if a running task has been started by another application instance).",
					CL(runningTaskFilePath),
					CL(ex)
				);
			}
		}

		public async Task UnthrottleAppTask(Peg peg, AppTask appTask, TimeSpan waitTime)
		{
			Debug.Assert(peg.IsLocked);
			Debug.Assert(appTask?.FilePath != null);
			Debug.Assert(appTask?.LockHandle != null);

			if (!File.Exists(appTask.FilePath))
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0xBA6189),
					nameof(AppTaskQueue), "Cannot unthrottle a deleted file. This might be because the app task has already timed out.", appTask.FilePath
				);
				return;
			}

			this.OnAppTaskUnthrottling(appTask, waitTime);

			var throttledTaskFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, appTask.FilePath);
			this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x1A7925),
				nameof(AppTaskQueue), "Unthrottling app task.", Path.GetFileName(throttledTaskFullPath),
				CL(throttledTaskFullPath)
			);

			AppTaskQueueInfo.Item? queueInfoItem = new(appTask.FilePath);
			var runningTaskFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, queueInfoItem.ChangeKind(AppTaskQueueInfo.QueueItemState.Running, (ulong)waitTime.TotalMilliseconds).FileName);
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x1EA380),
				nameof(AppTaskQueue), "Renaming task file.", Path.GetFileName(throttledTaskFullPath),
				CL(throttledTaskFullPath, "->", runningTaskFullPath)
			);

			appTask.LockHandle.Release();
			try
			{
				File.Move(throttledTaskFullPath, runningTaskFullPath);
				appTask.FilePath = runningTaskFullPath;
				appTask.LockHandle = await LockHandle.AcquireAsync(Guid.NewGuid(), Path.GetFileName(runningTaskFullPath), new() { FullFilePath = runningTaskFullPath, FileMode = FileMode.Open, FileShare = FileShare.Read });

				this.OnAppTaskUnthrottled(appTask, waitTime);
			}
			catch (IOException ex)
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0x8EFB3D),
					nameof(AppTaskQueue), "Failed to rename task file (this might be normal if a running task has been started by another application instance).",
					CL(throttledTaskFullPath),
					CL(ex)
				);
			}
		}

		public async Task ResetAppTask(Peg peg, AppTask appTask)
		{
			Debug.Assert(peg.IsLocked);
			Debug.Assert(appTask?.FilePath != null);

			this.OnAppTaskResetting(appTask);

			if (!File.Exists(appTask.FilePath))
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0xF9FFDB),
					nameof(AppTaskQueue), "Cannot reset a deleted file. This might be because the app task has already timed out.", appTask.FilePath
				);
				return;
			}

			SchedulerInfo? schedulerInfo = null;
			var schedulerInfoChanged = false;

			var orphanedTaskFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, appTask.FilePath);   //	appTask.FilePath - full path or file name? need file name
			this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0x541A17),
				nameof(AppTaskQueue), "Resetting timed-out task.", Path.GetFileName(orphanedTaskFilePath),
				CL(orphanedTaskFilePath)
			);

			AppTaskQueueInfo.Item? queueInfoItem = new(appTask.FilePath);   //	appTask.FilePath - full path or file name? need file name
			var queuedTaskFilePath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, queueInfoItem.ChangeKind(AppTaskQueueInfo.QueueItemState.Enqueued).FileName);
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x6FFD09),
				nameof(AppTaskQueue), "Renaming task file.", Path.GetFileName(orphanedTaskFilePath),
				CL(orphanedTaskFilePath, "->", queuedTaskFilePath)
			);
			try
			{
				File.Move(orphanedTaskFilePath, queuedTaskFilePath);

				schedulerInfo ??= await this.ReadSchedulerInfo(peg);
				var executionInfo = schedulerInfo.GetByTags(queueInfoItem.Tags);
				if (executionInfo != null)
				{
					if (executionInfo.RateLimit != null && executionInfo.ExecutionTokenCount != null)
					{
						executionInfo.ExecutionTokenCount = Math.Min((int)executionInfo.ExecutionTokenCount + 1, (int)executionInfo.RateLimit.Value.Value);
						schedulerInfoChanged = true;
					}
				}
			}
			catch (IOException ex)
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0xCEBA39),
					nameof(AppTaskQueue), "Failed to rename task file (this might be normal if a running task has been started by another application instance).",
					CL(orphanedTaskFilePath),
					CL(ex)
				);
			}

			if (schedulerInfoChanged)
			{
				Debug.Assert(schedulerInfo != null);
				await this.WriteSchedulerInfo(peg, schedulerInfo);
			}

			this.OnAppTaskReset(appTask);
		}


		protected IAppTaskStorageFormat? LookupAppTaskStorageFormat(string[] instanceTags)
		{
			for (int length = this.appTaskStorageFormats.Count, i = 0; i < length; ++i)
			{
				var item = this.appTaskStorageFormats[i];
				if (item.Recognize(instanceTags)) return item;
			}
			return null;
		}

		protected async Task<CascadingTaggedSheet> ReadSchedulerRules(Peg peg)
		{
			Debug.Assert(peg.IsLocked);

			if (!File.Exists(this.configuration.App_Task_Scheduler_RulesFilePath))
			{
				this.Log.WriteLine(Severity.Error, (LGID, 0xE295AF),
					nameof(AppTaskQueue), "CTS not found, all app tasks are disabled. Scheduler rules file:", this.configuration.App_Task_Scheduler_RulesFilePath
				);
				return new(CascadingTaggedSheet.CstTemplate.Disabled);
			}
			var json = await File.ReadAllTextAsync(this.configuration.App_Task_Scheduler_RulesFilePath);
			return CascadingTaggedSheet.TryParseJson(json);
		}

		protected async Task<SchedulerInfo> ReadSchedulerInfo(Peg peg)
		{
			Debug.Assert(peg.IsLocked);
			Debug.Assert(this.configuration.App_Task_Orchestrator_TasksDirectory != null);

			if (!File.Exists(this.configuration.App_Task_Scheduler_StateFilePath)) return [];
			var json = await File.ReadAllTextAsync(this.configuration.App_Task_Scheduler_StateFilePath);

			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x3278CA),
				nameof(AppTaskQueue), "Scheduler info acquired.",
				CL(json)
			);

			return SchedulerInfo.Deserialize(json) ?? [];
		}

		protected async Task WriteSchedulerInfo(Peg peg, SchedulerInfo schedulerInfo)
		{
			Debug.Assert(peg.IsLocked);

			var json = schedulerInfo.Serialize();
			await File.WriteAllTextAsync(this.configuration.App_Task_Scheduler_StateFilePath, json);
		}

		protected async Task<AppTaskQueueInfo> ReadQueueInfo(Peg peg)
		{
			Debug.Assert(peg.IsLocked);

			var appTaskFilePaths = await Task.Run(() =>
			{
				var queued = Directory.EnumerateFiles(this.configuration.App_Task_Orchestrator_TasksDirectory).Where(v => AppTaskQueueInfo.Item.Recognize(Path.GetFileName(v))).ToList();
				var errors = Directory.Exists(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory) ? Directory.EnumerateFiles(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory).Where(v => AppTaskQueueInfo.Item.Recognize(Path.GetFileName(v))).ToArray() : [];
				return queued.Concat(errors);
			});
			var items = appTaskFilePaths.Select(v => new AppTaskQueueInfo.Item(Path.GetFileName(v)));
			var result = new AppTaskQueueInfo();
			result.AddRange(items);
			return result;
		}

		protected async Task AbortTimeoutAppTasks(Peg peg, CascadingTaggedSheet rulesCTS, AppTaskQueueInfo queueInfo)
		{
			Debug.Assert(peg.IsLocked);

			var now = DateTime.Now;

			var timeoutItems = queueInfo.Where(v =>
			{
				if (v.QueueItemState != AppTaskQueueInfo.QueueItemState.Running) return false;

				Debug.Assert(v.Timestamp != null);

				var policy = Policy.FromCTS(v.Tags, rulesCTS);
				if (policy.Timeout == TimeSpan.Zero) return false;
				var appTaskStartTime = new DateTime((long)v.Timestamp);
				var appTaskThrottleTime = TimeSpan.FromMilliseconds(v.ThrottleDurationMs ?? 0);
				return now - appTaskStartTime - appTaskThrottleTime > policy.Timeout;
			}).ToList();

			foreach (var item in timeoutItems)
			{
				Debug.Assert(item.Timestamp != null);

				var appTaskStartTime = new DateTime((long)item.Timestamp);
				var appTaskThrottleTime = TimeSpan.FromMilliseconds(item.ThrottleDurationMs ?? 0);

				var fileFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TasksDirectory, item.FileName);
				var errorFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory, item.ChangeKind(AppTaskQueueInfo.QueueItemState.Error).FileName);
				var exceptionFullPath = Path.Combine(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory, item.ChangeKind(AppTaskQueueInfo.QueueItemState.Exception).FileName);

				try
				{
					var errorText = $"Timeout: app task stated at {appTaskStartTime}, ignoring accumulated {appTaskThrottleTime} throttle time, timed out at {now} after {now - appTaskStartTime - appTaskThrottleTime}";

					this.Log.WriteLine(Severity.Error, (LGID, 0x71747C),
						nameof(AppTaskQueue), "App task timed out.", fileFullPath, new Exception(errorText)
					);

					this.OnAppTaskTimeout(new TimeoutException(errorText));

					LockHandle.Release(fileFullPath);

					Directory.CreateDirectory(this.configuration.App_Task_Orchestrator_TaskErrorsDirectory);

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x2508B8),
						nameof(AppTaskQueue), "Moving timed-out task file.", Path.GetFileName(fileFullPath),
						CL(fileFullPath, "->", errorFullPath)
					);

					File.Move(fileFullPath, errorFullPath);

					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xC21592),
						nameof(AppTaskQueue), "Saving timeout exception data.", Path.GetFileName(fileFullPath),
						CL(fileFullPath, "->", exceptionFullPath)
					);

					await File.WriteAllTextAsync(exceptionFullPath, errorText);
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x4A7BDC),
						nameof(AppTaskQueue), "Failed to abort timed-out app task file (this might be normal if a running task has been started by another application instance).",
						CL(fileFullPath),
						CL(ex)
					);
				}
			}
		}


		protected virtual void OnAppTaskResetting(AppTask appTask)
		{
			this.AppTaskResetting?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskResetting;

		protected virtual void OnAppTaskReset(AppTask appTask)
		{
			this.AppTaskReset?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskReset;

		protected virtual void OnAppTaskEnqueuing(AppTask appTask)
		{
			this.AppTaskEnqueuing?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskEnqueuing;

		protected virtual void OnAppTaskEnqueued(AppTask appTask)
		{
			this.AppTaskEnqueued?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskEnqueued;

		protected virtual void OnAppTaskDequeuing()
		{
			this.AppTaskDequeuing?.Invoke(this, new());
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskDequeuing;

		protected virtual void OnAppTaskDequeued(AppTask? appTask)
		{
			this.AppTaskDequeued?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskDequeued;

		protected virtual void OnAppTaskThrottling(AppTask appTask)
		{
			this.AppTaskThrottling?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskThrottling;

		protected virtual void OnAppTaskThrottled(AppTask appTask)
		{
			this.AppTaskThrottled?.Invoke(this, new(appTask));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskThrottled;

		protected virtual void OnAppTaskUnthrottling(AppTask appTask, TimeSpan throttleWaitTime)
		{
			this.AppTaskUnthrottling?.Invoke(this, new(appTask, throttleWaitTime));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskUnthrottling;

		protected virtual void OnAppTaskUnthrottled(AppTask appTask, TimeSpan throttleWaitTime)
		{
			this.AppTaskUnthrottled?.Invoke(this, new(appTask, throttleWaitTime));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskUnthrottled;

		protected virtual void OnAppTaskFinalizing(AppTask appTask, object? result)
		{
			this.AppTaskFinalizing?.Invoke(this, new(appTask, result));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskFinalizing;

		protected virtual void OnAppTaskFinalized(AppTask appTask, object? result)
		{
			this.AppTaskFinalized?.Invoke(this, new(appTask, result));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskFinalized;

		protected virtual void OnAppTaskError(AppTaskException exception)
		{
			this.AppTaskError?.Invoke(this, new(exception));
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskError;

		protected virtual void OnAppTaskTimeout(TimeoutException exception)
		{
			this.AppTaskTimeout?.Invoke(this, new());
		}
		public event EventHandler<IAppTaskQueue.AppTaskEventArgs>? AppTaskTimeout;

		#endregion

		static readonly Random fsRandom = new(unchecked((int)DateTime.Now.Ticks & 0x0000FFFF));

		readonly List<IAppTaskStorageFormat> appTaskStorageFormats;
		readonly Configuration configuration;
	}
}
