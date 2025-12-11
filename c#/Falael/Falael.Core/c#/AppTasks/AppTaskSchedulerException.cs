using System;
using System.Runtime.Serialization;
using System.Text;

namespace Falael.Core.AppTasks
{
	public class AppTaskSchedulerException : Exception
	{
		public AppTaskSchedulerException(AppTask appTask, AppTaskSchedulerUtility.ScheduleRuleTestResult scheduleRuleTestResult, string message)
			: base(message)
		{
			this.AppTask = appTask;
			this.ScheduleRuleTestResult = scheduleRuleTestResult;
		}

		public AppTaskSchedulerException(AppTask appTask, AppTaskSchedulerUtility.ScheduleRuleTestResult scheduleRuleTestResult, string message, Exception? innerException)
			: base(message, innerException)
		{
			this.AppTask = appTask;
			this.ScheduleRuleTestResult = scheduleRuleTestResult;
		}

		public override string Message => $"{base.Message} {this.ScheduleRuleTestResult.Serialize()}";

		public AppTask AppTask { get; private set; }
		public AppTaskSchedulerUtility.ScheduleRuleTestResult ScheduleRuleTestResult { get; private set; }
	}
}