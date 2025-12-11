using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;

using static Falael.Core.AppTasks.AppTaskSchedulerUtility;
using Falael.Core.Syncronization;

namespace Falael.Core.AppTasks
{
	public abstract class AppTask : FalaelContextAware
	{
		const ulong LGID = 0x5468CC;

		public AppTask(IFalaelContext coreContext)
			: base(coreContext)
		{
		}

		#region Nested Types

		internal class SemaphoreSmartObserver : FalaelContextAware, SemaphoreSmart.IAsyncOperationObserver
		{
			public SemaphoreSmartObserver(IFalaelContext coreContext, AppTaskOrchestrator upstreamObserver, AppTask appTask)
				: base(coreContext)
			{
				this.UpstreamObserver = upstreamObserver;
				this.AppTask = appTask;
			}

			#region SemaphoreSmart.IOperationObserver

			public async Task OnWaitStartAsync()
			{
				await this.UpstreamObserver.OnWaitStartAsync(this.AppTask);

				await this.sync.WaitAsync();
				try
				{
					++this.WaitCount;
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x5AEA29),
						$"{nameof(SemaphoreSmartObserver)}.{nameof(OnWaitStartAsync)}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
				}
				finally
				{
					this.sync.Release();
				}
			}

			public async Task OnWaitEndAsync(SemaphoreSmart.WaitEndReason waitEndReason, TimeSpan waitTime)
			{
				await this.UpstreamObserver.OnWaitEndAsync(this.AppTask, waitEndReason, waitTime);

				await this.sync.WaitAsync();
				try
				{
					--this.WaitCount;
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x4EA8DA),
						$"{nameof(SemaphoreSmartObserver)}.{nameof(OnWaitEndAsync)}, {nameof(waitEndReason)} = {waitEndReason}, {nameof(waitTime)} = {waitTime}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
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
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x393EFD),
						$"{nameof(SemaphoreSmartObserver)}.{nameof(OnExecutingAsync)}, {nameof(executionTiming)} = {executionTiming}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
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
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8B3123),
						$"{nameof(SemaphoreSmartObserver)}.{nameof(OnReleasedAsync)}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
				}
				finally
				{
					this.sync.Release();
				}
			}

			#endregion

			public AppTaskOrchestrator UpstreamObserver { get; }
			public AppTask AppTask { get; }
			public int WaitCount { get; private set; } = 0;
			public int ConcurrentCount { get; private set; } = 0;

			readonly SemaphoreSlim sync = new(1, 1);
		}

		#endregion

		//	Remarks: This method shall throw exceptions on error in order to prevent task completion.
		public abstract Task<object?> Execute(SemaphoreSmart.IAsyncOperationObserver meteredServiceObserver);

		/// <exception cref="NotSupportedException">
		/// There is no compatible <see cref="JsonConverter"/>
		/// for object or its serializable members.
		/// </exception>
		public virtual string Serialize()
		{
			return JsonSerializer.Serialize<object>(this, new JsonSerializerOptions //  `<object>` is modifying the JsonSerializer.Serialize behavor to include serializable properties from derived classes as well
			{
				WriteIndented = true,
				DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
				Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
			});
		}

		public void OnSchedulingRuleViolation(AppTaskSchedulerException ex, string? details = null)
		{
			switch (ex.ScheduleRuleTestResult.Decision)
			{
				case ScheduleDecision.Decline_EnqueueDisabled:
				case ScheduleDecision.Decline_DequeueDisabled:
				case ScheduleDecision.Decline_LimitQueue:
					this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x813C13),
						this.GetType().Name, "App task was not created due to task scheduling rule violation.", ex.Message, details,
						CL(this.Serialize())
					);
					return;
				case ScheduleDecision.Decline_LimitRate:
				case ScheduleDecision.Decline_LimitRunning:
				case ScheduleDecision.OK:
					throw new InvalidOperationException(nameof(AppTask) + "." + nameof(OnSchedulingRuleViolation) + ": " + nameof(AppTaskSchedulerException) + " is expected only during app task scheduling.", ex);
				default:
					throw new NotImplementedException();
			}
		}

		[JsonIgnore]
		public virtual string[] InstanceTags => AppTaskSchemaTagsAttribute.GetTags(this.GetType());

		public string? FilePath;
		public LockHandle? LockHandle;
		public string? ExceptionText;
	}
}