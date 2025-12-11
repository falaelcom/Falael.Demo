using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;

namespace Falael
{
    public class FalaelContext : IFalaelContext
    {
		const ulong LGID = 0xB02CDF;

		#pragma warning disable CS8618
		public FalaelContext()
		{
		}
		#pragma warning restore CS8618

		#region ICoreContext

		public ConfigurationRepository ConfigurationRepository { get; private set; }

		public ILog Log { get; private set; }

		public ConcurrentDictionary<Task, byte> ManagedTasks { get; } = [];

		public CancellationTokenSource? ManagedTasksCancellationTokenSource { get; private set; }

		#endregion

		#region ICoreContext - Managed Tasks

		public Task StartManagedTask(Action action)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task(action, this.ManagedTasksCancellationTokenSource.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task(action);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task StartManagedTask(Action action, CancellationToken cancellationToken)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task(action, linkedCts.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start();
				return task;
			}
			else
			{
				var task = new Task(action, cancellationToken);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task StartManagedTask(Action action, TaskCreationOptions creationOptions)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task(action, this.ManagedTasksCancellationTokenSource.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task(action, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task StartManagedTask(Action action, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task(action, linkedCts.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start(scheduler);
				return task;
			}
			else
			{
				var task = new Task(action, cancellationToken, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start(scheduler);
				return task;
			}
		}
		public Task StartManagedTask(Action<object?> action, object? state)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task(action, state, this.ManagedTasksCancellationTokenSource.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task(action, state);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task StartManagedTask(Action<object?> action, object? state, CancellationToken cancellationToken)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task(action, state, linkedCts.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start();
				return task;
			}
			else
			{
				var task = new Task(action, state, cancellationToken);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task StartManagedTask(Action<object?> action, object? state, TaskCreationOptions creationOptions)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task(action, state, this.ManagedTasksCancellationTokenSource.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task(action, state, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task StartManagedTask(Action<object?> action, object? state, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task(action, state, linkedCts.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start(scheduler);
				return task;
			}
			else
			{
				var task = new Task(action, state, cancellationToken, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start(scheduler);
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<TResult> function)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task<TResult>(function, this.ManagedTasksCancellationTokenSource.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task<TResult>(function);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<TResult> function, CancellationToken cancellationToken)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task<TResult>(function, linkedCts.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start();
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, cancellationToken);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<TResult> function, TaskCreationOptions creationOptions)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task<TResult>(function, this.ManagedTasksCancellationTokenSource.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<TResult> function, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task<TResult>(function, linkedCts.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start(scheduler);
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, cancellationToken, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start(scheduler);
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task<TResult>(function, state, this.ManagedTasksCancellationTokenSource.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, state);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state, CancellationToken cancellationToken)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task<TResult>(function, state, linkedCts.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start();
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, state, cancellationToken);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state, TaskCreationOptions creationOptions)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var task = new Task<TResult>(function, state, this.ManagedTasksCancellationTokenSource.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (this.ManagedTasksCancellationTokenSource.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, state, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start();
				return task;
			}
		}
		public Task<TResult> StartManagedTask<TResult>(Func<object?, TResult> function, object? state, CancellationToken cancellationToken, TaskCreationOptions creationOptions, TaskScheduler scheduler)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task<TResult>(function, state, linkedCts.Token, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start(scheduler);
				return task;
			}
			else
			{
				var task = new Task<TResult>(function, state, cancellationToken, creationOptions);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(task => this.ManagedTasks.TryRemove(task, out _));
				task.Start(scheduler);
				return task;
			}
		}

		public Task StartManagedTask(Func<CancellationToken, Task> function, CancellationToken cancellationToken)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(this.ManagedTasksCancellationTokenSource.Token, cancellationToken);
				var task = new Task<Task>(() => function(linkedCts.Token), linkedCts.Token);
				this.ManagedTasks.TryAdd(task, 0);
				if (linkedCts.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					linkedCts.Dispose();
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t =>
				{
					this.ManagedTasks.TryRemove(t, out _);
					linkedCts.Dispose();
				});
				task.Start();
				return task.Unwrap();
			}
			else
			{
				var task = new Task<Task>(() => function(cancellationToken), cancellationToken);
				this.ManagedTasks.TryAdd(task, 0);
				if (cancellationToken.IsCancellationRequested)
				{
					this.ManagedTasks.TryRemove(task, out _);
					throw new TaskCanceledBeforeCreationException();
				}
				task.ContinueWith(t => this.ManagedTasks.TryRemove(t, out _));
				task.Start();
				return task.Unwrap();
			}
		}

		public async Task AwaitAllManagedTasks(TimeSpan gracefulTerminationTimeout)
		{
			if (this.ManagedTasksCancellationTokenSource != null)
			{
				while (!this.ManagedTasksCancellationTokenSource.Token.IsCancellationRequested) await Task.Delay(100);
				try
				{
					await Task.WhenAll(this.ManagedTasks.Keys).WaitAsync(gracefulTerminationTimeout);
					this.Log.WriteLine(Severity.Neutral, (LGID, 0x682D91),
						nameof(FalaelContext), nameof(AwaitAllManagedTasks), "All tasks exited gracefully."
					);
				}
				catch (OperationCanceledException)
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x3C358E),
						nameof(FalaelContext), nameof(AwaitAllManagedTasks), "Non-cooperative tasks aborted after timeout."
					);
				}
			}
		}

		#endregion

		public void Initialize(ConfigurationRepository configurationRepository, ILog log, CancellationTokenSource? cancellationTokenSource)
		{
			this.ConfigurationRepository = configurationRepository;
			this.Log = log;
			this.ManagedTasksCancellationTokenSource = cancellationTokenSource;
		}

		public void Initialize(ILog log, CancellationTokenSource? cancellationTokenSource)
		{
			this.ConfigurationRepository = null!;
			this.Log = log;
			this.ManagedTasksCancellationTokenSource = cancellationTokenSource;
		}

		public void Initialize(ConfigurationRepository configurationRepository, ILog log)
		{
			this.ConfigurationRepository = configurationRepository;
			this.Log = log;
		}

		public void Initialize(ILog log)
		{
			this.ConfigurationRepository = null!;
			this.Log = log;
		}
	}
}
