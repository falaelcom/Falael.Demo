using System.Diagnostics;
using System.Text;

using Falael;

namespace Falael
{
    public class FileLogSink : ILogSink
	{
		public FileLogSink(string logFilePath)
		{
			this.LogFilePath = logFilePath;
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
				File.AppendAllText(this.LogFilePath, line, ILog.Utf8Safe);
			}
		}

		public bool IsActive => true;

		public string LogFilePath { get; }

		readonly object sync = new();
	}
}
