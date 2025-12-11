namespace Falael.Core.AsyncCommandQueue
{
	public class AsyncCommandAbortException : AsyncCommandException
	{
		public AsyncCommandAbortException(string message)
			: base(message)
		{
		}

		public AsyncCommandAbortException(string message, Exception? innerException)
			: base(message, innerException)
		{
		}
	}
}
