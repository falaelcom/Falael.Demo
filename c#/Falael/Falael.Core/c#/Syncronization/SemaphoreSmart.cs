using System.Diagnostics;

namespace Falael.Core.Syncronization
{
	public class SemaphoreSmart : IDisposable
	{
		const ulong LGID = 0x11EE11;

		#region Life Cycle

		public SemaphoreSmart(decimal initialLimit)
		{
			if (initialLimit <= 0) throw new ArgumentException("Limit must be positive", nameof(initialLimit));
			if (initialLimit > 1 && initialLimit != Math.Floor(initialLimit)) throw new ArgumentException("Limit must be a whole number when greater than 1", nameof(initialLimit));

			this.currentLimit = initialLimit;
		}

		//  thread-safe
		~SemaphoreSmart()
		{
			this.Dispose(false);
		}

		//  thread-safe
		public void Dispose()
		{
			this.Dispose(true);
			GC.SuppressFinalize(this);
		}

		//  thread-safe
		protected virtual void Dispose(bool disposing)
		{
			this.sync.Wait();
			try
			{
				if (this.disposed) return;
				this.disposed = true;

				this.currentLimit = 0;
				while (this.waitQueue.Count > 0)
				{
					var (tcs, observer, startTime) = this.waitQueue.Dequeue();
					observer
						.OnWaitEndAsync(WaitEndReason.SemaphorDisposing, DateTime.UtcNow - startTime)
						.Wait();
					tcs.SetException(new OperationCanceledException("The semaphore was disposed, canceling the wait operation."));
				}
			}
			finally
			{
				this.sync.Release();
			}
		}

		#endregion

		#region Nested Types

		public enum WaitEndReason
		{
			Continue,
			Timeout,
			SemaphorDisposing
		}

		public enum ExecutionTiming
		{
			Immediate,
			WaitEnded
		}

		public interface IAsyncOperationObserver
		{
			Task OnWaitStartAsync();
			Task OnWaitEndAsync(WaitEndReason waitEndReason, TimeSpan waitTime);
			Task OnExecutingAsync(ExecutionTiming executionTiming);
			Task OnReleasedAsync();
		}

		public class DebuggingObserver : FalaelContextAware, IAsyncOperationObserver
		{
			public DebuggingObserver(IFalaelContext coreContext, string name)
				: base(coreContext)
			{
				this.Name = name;
			}

			#region SemaphoreSmart.IOperationObserver

			public async Task OnWaitStartAsync()
			{
				await this.sync.WaitAsync();
				try
				{
					++this.WaitCount;
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xBF823D),
						$"{nameof(DebuggingObserver)}.{this.Name}.{nameof(OnWaitStartAsync)}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
				}
				finally
				{
					this.sync.Release();
				}
			}

			public async Task OnWaitEndAsync(WaitEndReason waitEndReason, TimeSpan waitTime)
			{
				await this.sync.WaitAsync();
				try
				{
					--this.WaitCount;
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xFEA701),
						$"{nameof(DebuggingObserver)}.{this.Name}.{nameof(OnWaitEndAsync)}, {nameof(waitEndReason)} = {waitEndReason}, {nameof(waitTime)} = {waitTime}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
				}
				finally
				{
					this.sync.Release();
				}
			}

			public async Task OnExecutingAsync(ExecutionTiming executionTiming)
			{
				await this.sync.WaitAsync();
				try
				{
					++this.ConcurrentCount;
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x4572B3),
						$"{nameof(DebuggingObserver)}.{this.Name}.{nameof(OnExecutingAsync)}, {nameof(executionTiming)} = {executionTiming}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
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
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE00F5D),
						$"{nameof(DebuggingObserver)}.{this.Name}.{nameof(OnReleasedAsync)}, {nameof(this.WaitCount)} = {this.WaitCount}, {nameof(this.ConcurrentCount)} = {this.ConcurrentCount}"
					);
				}
				finally
				{
					this.sync.Release();
				}
			}

			public string Name { get; }

			#endregion

			public int WaitCount { get; private set; } = 0;
			public int ConcurrentCount { get; private set; } = 0;

			readonly SemaphoreSlim sync = new(1, 1);
		}

		#endregion

		//  thread-safe
		public async Task SetLimitAsync(decimal newLimit)
		{
			await this.sync.WaitAsync();
			try
			{
				this.ThrowIfDisposed();

				if (newLimit <= 0) throw new ArgumentException("Limit must be positive", nameof(newLimit));
				if (newLimit > 1 && newLimit != Math.Floor(newLimit)) throw new ArgumentException("Limit must be a whole number when greater than 1", nameof(newLimit));

				this.currentLimit = newLimit;

				await this.TryUnblockWaitingOperations();
			}
			finally
			{
				this.sync.Release();
			}
		}

		//  thread-safe
		public async Task WaitAsync(IAsyncOperationObserver observer, TimeSpan? timeout = null)
		{
			TaskCompletionSource<bool> tcs;

			await this.sync.WaitAsync();
			try
			{
				this.ThrowIfDisposed();

				if (this.currentCount < this.currentLimit)
				{
					++this.currentCount;
					await observer.OnExecutingAsync(ExecutionTiming.Immediate);
					return;
				}
				tcs = new(TaskCreationOptions.RunContinuationsAsynchronously);
				this.waitQueue.Enqueue((tcs, observer, DateTime.UtcNow));
				await observer.OnWaitStartAsync();
			}
			finally
			{
				this.sync.Release();
			}

			if (!timeout.HasValue)
			{
				await tcs.Task;
				return;
			}

			//	the current operation has been unblocked
			if (await Task.WhenAny(tcs.Task, Task.Delay(timeout.Value)) == tcs.Task) return;

			//	the current operation has timed out
			await this.sync.WaitAsync();
			try
			{
				var waitingList = new List<(TaskCompletionSource<bool> tsc, IAsyncOperationObserver observer, DateTime startTime)>(this.waitQueue);
				var itemToRemove = waitingList.Find(x => x.tsc == tcs);
				if (itemToRemove.tsc == null) Debug.Fail("itemToRemove.tsc == null");    //  itemToRemove is always a non-null tuple, default value as returned by Find is (null, null, default)
				this.waitQueue = new(waitingList.Where(x => x.tsc != tcs));
				await itemToRemove.observer.OnWaitEndAsync(WaitEndReason.Timeout, DateTime.UtcNow - itemToRemove.startTime);
				tcs.SetException(new TimeoutException("The semaphore wait operation timed out."));
			}
			finally
			{
				this.sync.Release();
			}
		}

		//  thread-safe
		public async Task ReleaseWaitAsync(IAsyncOperationObserver observer)
		{
			await this.sync.WaitAsync();
			try
			{
				this.ThrowIfDisposed();

				if (this.currentCount == 0) throw new InvalidOperationException("Semaphore released more times than acquired");

				--this.currentCount;

				if (this.currentLimit >= 1)
				{
					await this.TryUnblockWaitingOperations();
					return;
				}

				//  delaying inside the lock guarantees mandatority of the delay for all threads hitting this semaphore
				await Task.Delay((int)(1 / this.currentLimit)).ContinueWith(_ => this.TryUnblockWaitingOperations());
			}
			finally
			{
				this.sync.Release();
				await observer.OnReleasedAsync();
			}
		}

		//  thread-safe
		public decimal Limit
		{
			get
			{
				this.sync.Wait();
				try
				{
					return this.currentLimit;
				}
				finally
				{
					this.sync.Release();
				}
			}
		}

		//  thread-safe
		public int DelayMs
		{
			get
			{
				this.sync.Wait();
				try
				{
					if (this.currentLimit >= 1) return 0;
					return (int)(1 / this.currentLimit);
				}
				finally
				{
					this.sync.Release();
				}
			}
		}

		//  non-thread-safe
		async Task TryUnblockWaitingOperations()
		{
			while (this.waitQueue.Count > 0 && this.currentCount < this.currentLimit)
			{
				var (tcs, observer, startTime) = this.waitQueue.Dequeue();
				++this.currentCount;
				await observer.OnWaitEndAsync(WaitEndReason.Continue, DateTime.UtcNow - startTime);
				await observer.OnExecutingAsync(ExecutionTiming.WaitEnded);
				tcs.SetResult(true);
			}
		}

		//  non-thread-safe
		void ThrowIfDisposed()
		{
			ObjectDisposedException.ThrowIf(this.disposed, nameof(SemaphoreSmart));
		}

		decimal currentLimit;
		int currentCount = 0;
		Queue<(TaskCompletionSource<bool> tcs, IAsyncOperationObserver observer, DateTime startTime)> waitQueue = new();
		readonly SemaphoreSlim sync = new(1, 1);

		bool disposed = false;
	}
}