namespace Falael.Core.AppTasks
{
	public class AppTaskException : Exception
	{
		public AppTaskException(AppTask appTask, string message)
			: base(message)
		{
			this.AppTask = appTask;
		}

		public AppTaskException(AppTask appTask, string message, Exception? innerException)
			: base(message, innerException)
		{
			this.AppTask = appTask;
		}

		public AppTask AppTask { get; }
	}
}