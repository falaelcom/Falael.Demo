namespace Falael
{
    public class CallbackLogSink : ILogSink
	{
		public CallbackLogSink(Action<Severity, ulong, ulong, string> callback)
		{
			this.callback = callback;
		}

		public void Log(
			string line,

			DateTimeOffset timestamp,
			Severity severity,
			int logDensity,
			ulong logGroupId,
			ulong codePointId,

			string timestampText,
			string severityText,
			string? logGroupIdText,
			string? codePointIdText,

			int? maxLineLength)
		{
			lock (this.sync)
			{
				this.callback(severity, logGroupId, codePointId, line);
			}
		}

		public bool IsActive => true;

		readonly Action<Severity, ulong, ulong, string> callback;

		readonly object sync = new();
	}
}
