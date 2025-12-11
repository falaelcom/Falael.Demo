using System.Diagnostics;
using System.Text;

using Falael;

namespace Falael
{
	public class ConsoleLog : ILog
	{
		public ConsoleLog(Severity maxSeverity, int maxLogDensity)
		{
			this.MaxSeverity = maxSeverity;
			this.MaxLogDensity = maxLogDensity;
		}

		public void WriteLine(int logDensity, (ulong logGroupId, ulong codePointId) ids, params object?[] args)
		{
			if (this.MaxSeverity < Severity.Diagnostic) return;
			if (logDensity > this.MaxLogDensity) return;
			var traceGroupIdText = this.FormatHexDecimalId(ids.logGroupId);
			var tracePointIdText = this.FormatHexDecimalId(ids.codePointId);
			Console.WriteLine($"{DateTime.Now}|DIAGN|{traceGroupIdText}:{tracePointIdText}|{string.Join(' ', args)}");
		}

		public void WriteLine(int logDensity, (ulong logGroupId, ulong codePointId) ids, params (int clamp, object?[] values)[] args)
		{
			if (this.MaxSeverity < Severity.Diagnostic) return;
			if (logDensity > this.MaxLogDensity) return;
			var traceGroupIdText = this.FormatHexDecimalId(ids.logGroupId);
			var tracePointIdText = this.FormatHexDecimalId(ids.codePointId);
			Console.WriteLine($"{DateTime.Now}|DIAGN|{traceGroupIdText}:{tracePointIdText}|{string.Join(' ', args.Select(v => string.Join(' ', v.values)))}");
		}

		public void WriteLine(Severity severity, (ulong logGroupId, ulong codePointId) ids, params object?[] args)
		{
			if (severity > this.MaxSeverity) return;
			var traceGroupIdText = this.FormatHexDecimalId(ids.logGroupId);
			var tracePointIdText = this.FormatHexDecimalId(ids.codePointId);
			var severityText = this.FormatEventSeverity(severity);
			Console.WriteLine($"{DateTime.Now}|{severityText}|{traceGroupIdText}:{tracePointIdText}|{string.Join(' ', args)}");
		}

		public void WriteLine(Severity severity, (ulong logGroupId, ulong codePointId) ids, params (int clamp, object?[] values)[] args)
		{
			if (severity > this.MaxSeverity) return;
			var traceGroupIdText = this.FormatHexDecimalId(ids.logGroupId);
			var tracePointIdText = this.FormatHexDecimalId(ids.codePointId);
			var severityText = this.FormatEventSeverity(severity);
			Console.WriteLine($"{DateTime.Now}|{severityText}|{traceGroupIdText}:{tracePointIdText}|{string.Join(' ', args.Select(v => string.Join(' ', v.values)))}");
		}

		protected virtual string FormatHexDecimalId(ulong value) => ILog.Hex(value);

		protected virtual string FormatEventSeverity(Severity severity)
		{
			switch (severity)
			{
				case Severity.Diagnostic: return "DIAGN";
				case Severity.Neutral: return "INFOR";
				case Severity.Warning: return "WARNI";
				case Severity.Alert: return "ALERT";
				case Severity.Error: return "ERROR";
				case Severity.Critical: return "CRITI";
				case Severity.Fatal: return "FATAL";
				default: throw new NotImplementedException(severity.ToString());
			}
		}

		public LoggerTimeOffset LoggerTimeOffset => LoggerTimeOffset.Utc;

		public TimeSpan? CustomTimeOffset => null;

		public int MaxLineLength => -1;

		public Severity MaxSeverity { get; }
		public int MaxLogDensity { get; }
	}
}
