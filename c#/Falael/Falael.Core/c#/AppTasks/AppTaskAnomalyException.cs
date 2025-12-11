using System;
using System.Runtime.Serialization;
using System.Text;

namespace Falael.Core.AppTasks
{
	public class AppTaskAnomalyException : AppTaskException
	{
		public AppTaskAnomalyException(AppTask appTask, Exception? innerException)
			: base(appTask, innerException?.Message ?? string.Empty, innerException)
		{
		}
	}
}