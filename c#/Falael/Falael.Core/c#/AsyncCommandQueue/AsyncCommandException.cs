namespace Falael.Core.AsyncCommandQueue
{
	public class AsyncCommandException : Exception
	{
		public AsyncCommandException(string message)
			: base(message)
		{
		}

		public AsyncCommandException(string message, Exception? innerException)
			: base(message, innerException)
		{
		}
	}
}
