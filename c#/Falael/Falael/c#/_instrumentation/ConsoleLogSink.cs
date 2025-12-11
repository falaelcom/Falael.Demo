using System.Diagnostics;
using System.Text;

using Falael;

namespace Falael
{
    public class ConsoleLogSink : ILogSink
	{
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
				Console.Write(line);
			}
		}

		public bool IsActive => true;

		readonly object sync = new();
	}
}
