namespace Falael.Core.AsyncCommandQueue
{
	public class AsyncCommandRetryException : AsyncCommandException
	{
		public AsyncCommandRetryException(string message, AsyncCommand[]? enqueueCommands = null)
			: base(message)
		{
			this.EnqueueCommands = enqueueCommands;
		}

		public AsyncCommandRetryException(string message, Exception? innerException, AsyncCommand[]? enqueueCommands = null)
			: base(message, innerException)
		{
			this.EnqueueCommands = enqueueCommands;
		}

		public AsyncCommand[]? EnqueueCommands { get; }
	}
}
