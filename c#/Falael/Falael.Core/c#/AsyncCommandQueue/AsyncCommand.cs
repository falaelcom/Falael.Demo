namespace Falael.Core.AsyncCommandQueue
{
	public abstract class AsyncCommand
	{
		public abstract int Priority { get; }
		public abstract Task Execute();

		public int RetryCount { get; internal set; } = 0;

		readonly TaskCompletionSource<bool> completionSource = new();

		public async Task WaitAsync()
		{
			await this.completionSource.Task;
		}

		internal void Complete()
		{
			this.completionSource.TrySetResult(true);
		}

		internal void Fail(Exception ex)
		{
			this.completionSource.TrySetException(ex);
		}

		internal void Cancel()
		{
			this.completionSource.TrySetCanceled();
		}
	}
}
