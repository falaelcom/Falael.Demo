using Falael.Core.Syncronization;

namespace Falael.Core.AppTasks
{
	public interface IAppTaskQueue
	{
		Task EnqueueAppTask(Peg peg, AppTask appTask);
		Task<AppTask?> DequeueNextAppTask(Peg peg, object? appTaskDeserializationContext);
		Task ResetOrphanedAppTasks(Peg peg);
		void FinalizeAppTask(Peg peg, AppTask appTask, object? result, AppTaskException? exception);

		Task ThrottleAppTask(Peg peg, AppTask appTask);
		Task UnthrottleAppTask(Peg peg, AppTask appTask, TimeSpan waitTime);
		Task ResetAppTask(Peg peg, AppTask appTask);

		event EventHandler<AppTaskEventArgs> AppTaskResetting;
		event EventHandler<AppTaskEventArgs> AppTaskReset;
		event EventHandler<AppTaskEventArgs> AppTaskEnqueuing;
		event EventHandler<AppTaskEventArgs> AppTaskEnqueued;
		event EventHandler<AppTaskEventArgs> AppTaskDequeuing;
		event EventHandler<AppTaskEventArgs> AppTaskDequeued;
		event EventHandler<AppTaskEventArgs> AppTaskThrottling;
		event EventHandler<AppTaskEventArgs> AppTaskThrottled;
		event EventHandler<AppTaskEventArgs> AppTaskUnthrottling;
		event EventHandler<AppTaskEventArgs> AppTaskUnthrottled;
		event EventHandler<AppTaskEventArgs> AppTaskFinalizing;
		event EventHandler<AppTaskEventArgs> AppTaskFinalized;
		event EventHandler<AppTaskEventArgs> AppTaskError;
		event EventHandler<AppTaskEventArgs> AppTaskTimeout;

		public class AppTaskEventArgs : EventArgs
		{
			public AppTaskEventArgs(AppTask appTask, TimeSpan throttleWaitTime)
			{
				this.AppTask = appTask;
				this.ThrottleWaitTime = throttleWaitTime;
			}

			public AppTaskEventArgs(AppTask appTask, object? result)
			{
				this.AppTask = appTask;
				this.Result = result;
			}

			public AppTaskEventArgs(AppTask? appTask)
			{
				this.AppTask = appTask;
			}

			public AppTaskEventArgs(AppTaskException exception)
			{
				this.AppTask = exception.AppTask;
				this.Exception = exception;
			}

			public AppTaskEventArgs(TimeoutException exception)
			{
				this.Exception = exception;
			}

			public AppTaskEventArgs()
			{
			}

			public AppTask? AppTask { get; }
			public TimeSpan? ThrottleWaitTime { get; }
			public object? Result { get; }
			public Exception? Exception { get; }
		}

	}
}