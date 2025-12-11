using System.Collections.Concurrent;

namespace Falael
{
	public interface IFalaelContext
	{
		ConfigurationRepository ConfigurationRepository { get; }
		ILog Log { get; }

		#region Tasks

		ConcurrentDictionary<Task, byte> ManagedTasks { get; }
		CancellationTokenSource? ManagedTasksCancellationTokenSource { get; }

		//	Standard .NET functions
		Task StartManagedTask(Action action);
		Task StartManagedTask(Action action, CancellationToken cancellationToken);
		Task StartManagedTask(Action action, TaskCreationOptions creationOptions);
		Task StartManagedTask(Action action, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler);
		Task StartManagedTask(Action<object?> action, object? state);
		Task StartManagedTask(Action<object?> action, object? state, CancellationToken cancellationToken);
		Task StartManagedTask(Action<object?> action, object? state, TaskCreationOptions creationOptions);
		Task StartManagedTask(Action<object?> action, object? state, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler);
		Task<TResult> StartManagedTask<TResult>(Func<TResult> function);
		Task<TResult> StartManagedTask<TResult>(Func<TResult> function, CancellationToken cancellationToken);
		Task<TResult> StartManagedTask<TResult>(Func<TResult> function, TaskCreationOptions creationOptions);
		Task<TResult> StartManagedTask<TResult>(Func<TResult> function, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler);
		Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state);
		Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state, CancellationToken cancellationToken);
		Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state, TaskCreationOptions creationOptions);
		Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler);

		//	Custom functions
		Task StartManagedTask(Func<CancellationToken, Task> function, CancellationToken cancellationToken);

		#endregion
	}

	public class TaskCanceledBeforeCreationException(string? message = "Task cancelled before creation.", Exception? innerExceptio = null) : Exception(message, innerExceptio);
}