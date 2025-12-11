namespace Falael.Core.AsyncCommandQueue
{
	public class AsyncCommandQueue
	{
		public AsyncCommandQueue(int maxCommandRetryCount)
		{
			this.maxCommandRetryCount = maxCommandRetryCount;
		}

		public async Task PostCommand(AsyncCommand command, int? priorityOverride = null)
		{
			await this.commandQueueExecutionLock.WaitAsync();
			try
			{
				if (this.unexpectedError != null) throw new AsyncCommandUnexpectedErrorException($"{nameof(AsyncCommandQueue)} is in a failed state.", this.unexpectedError);
				this.commandPriorityQueue.Enqueue(command, priorityOverride ?? command.Priority);
				if (this.commandQueueExecutionTask != null && !this.commandQueueExecutionTask.IsCompleted) return;
				this.commandQueueExecutionTask = this.ExecuteQueue();
			}
			finally
			{
				this.commandQueueExecutionLock.Release();
			}
		}

		async Task ExecuteQueue()
		{
			while (true)
			{
				AsyncCommand? command;
				int priority;

				await this.commandQueueExecutionLock.WaitAsync();
				try
				{
					if (!this.commandPriorityQueue.TryDequeue(out command, out priority))
					{
						this.commandQueueExecutionTask = null;
						break;
					}
				}
				finally
				{
					this.commandQueueExecutionLock.Release();
				}

				this.OnCommandDequeued(command, priority);

				try
				{
					await command.Execute();
					command.Complete();
				}
				catch (AsyncCommandRetryException ex)
				{
					this.OnCommandRetry(command, priority, ex);
					if (command.RetryCount > this.maxCommandRetryCount)
					{
						var ex2 = new Exception("Command retry count exceeded.", ex);
						command.Fail(ex2);
						throw ex2;
					}
					++command.RetryCount;
					await this.commandQueueExecutionLock.WaitAsync();
					try
					{
						this.commandPriorityQueue.Enqueue(command, priority);
						if (ex.EnqueueCommands == null) continue;
						for (int length = ex.EnqueueCommands.Length, i = 0; i < length; ++i)
						{
							var item = ex.EnqueueCommands[i];
							this.commandPriorityQueue.Enqueue(item, item.Priority);
						}
					}
					finally
					{
						this.commandQueueExecutionLock.Release();
					}
				}
				catch (AsyncCommandAbortException ex)
				{
					this.OnCommandAbort(command, priority, ex);
					command.Fail(ex);
					continue;
				}
				catch (Exception ex)
				{
					this.OnUnexpectedError(command, priority, ex);
					command.Fail(ex);
					this.unexpectedError = ex;
					break;
				}
			}
		}

		#region Events

		public class CommandEventArgs : EventArgs
		{
			public CommandEventArgs(AsyncCommand command, int priority)
			{
				this.Command = command;
				this.Priority = priority;
			}
			public AsyncCommand Command { get; }
			public int Priority { get; }
		}

		#region Event: CommandDequeued
		public event EventHandler<CommandEventArgs>? CommandDequeued;
		public virtual void OnCommandDequeued(AsyncCommand command, int priority)
		{
			CommandDequeued?.Invoke(this, new CommandEventArgs(command, priority));
		}
		#endregion

		#region Event: CommandAbort
		public class CommandAbortEventArgs : CommandEventArgs
		{
			public CommandAbortEventArgs(AsyncCommand command, int priority, AsyncCommandAbortException commandAbortException)
				: base(command, priority)
			{
				this.CommandAbortException = commandAbortException;
			}
			public AsyncCommandAbortException CommandAbortException { get; }
		}
		public event EventHandler<CommandAbortEventArgs>? CommandAbort;
		public virtual void OnCommandAbort(AsyncCommand command, int priority, AsyncCommandAbortException commandAbortException)
		{
			CommandAbort?.Invoke(this, new CommandAbortEventArgs(command, priority, commandAbortException));
		}
		#endregion

		#region Event: CommandRetry
		public class CommandRetryEventArgs : CommandEventArgs
		{
			public CommandRetryEventArgs(AsyncCommand command, int priority, AsyncCommandRetryException commandRetryException)
				: base(command, priority)
			{
				this.CommandRetryException = commandRetryException;
			}
			public AsyncCommandRetryException CommandRetryException { get; }
		}
		public event EventHandler<CommandRetryEventArgs>? CommandRetry;
		public virtual void OnCommandRetry(AsyncCommand command, int priority, AsyncCommandRetryException commandRetryException)
		{
			CommandRetry?.Invoke(this, new CommandRetryEventArgs(command, priority, commandRetryException));
		}
		#endregion

		#region Event: UnexpectedError
		public class UnexpectedErrorEventArgs : CommandEventArgs
		{
			public UnexpectedErrorEventArgs(AsyncCommand command, int priority, Exception exception)
				: base(command, priority)
			{
				this.Exception = exception;
			}
			public Exception Exception { get; }
		}
		public event EventHandler<UnexpectedErrorEventArgs>? UnexpectedError;
		public virtual void OnUnexpectedError(AsyncCommand command, int priority, Exception exception)
		{
			UnexpectedError?.Invoke(this, new UnexpectedErrorEventArgs(command, priority, exception));
		}
		#endregion

		#endregion

		readonly int maxCommandRetryCount;
		readonly PriorityQueue<AsyncCommand, int> commandPriorityQueue = new();

		Task? commandQueueExecutionTask = null;
		Exception? unexpectedError = null;

		readonly SemaphoreSlim commandQueueExecutionLock = new(1, 1);
	}
}
