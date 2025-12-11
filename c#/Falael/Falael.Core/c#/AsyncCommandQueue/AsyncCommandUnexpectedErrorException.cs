namespace Falael.Core.AsyncCommandQueue
{
	public class AsyncCommandUnexpectedErrorException : AsyncCommandException
	{
		public AsyncCommandUnexpectedErrorException(string message, Exception? innerException)
			: base(message, innerException)
		{
		}
	}
}
