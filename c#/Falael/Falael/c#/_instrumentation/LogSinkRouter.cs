using System.Diagnostics;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;

using Falael;

namespace Falael
{
	public class LogSinkRouter : LogRouter
	{
		const int SeverityTextClampLength = 5;

		public LogSinkRouter(string appPrefix, LoggerTimeOffset loggerTimeOffset = LoggerTimeOffset.Local, TimeSpan? customTimeOffset = null)
			: base(loggerTimeOffset, customTimeOffset)
		{
			if (!Regex.IsMatch(appPrefix, @"^[a-zA-Z0-9_\-\./]*$")) throw new ArgumentException("Bad format, must match /^[a-zA-Z0-9_\\-\\./]*$/", nameof(appPrefix));

			this.AppPrefix = appPrefix;
		}

		//	thread-safe
		public void AddLogSink(ILogSink logSink, LogSinkLineFilter? logSinkLineFilter = null)
		{
			lock (this.sync)
			{
				this.logSinks = [.. this.logSinks, (logSinkLineFilter, logSink)];
			}
		}

		//	thread-safe
		public bool HasLogSink(ILogSink logSink)
		{
			lock (this.sync)
			{
				return this.logSinks.Any(v => v.logSink == logSink);
			}
		}


		//	thread-safe
		protected virtual string FormatTimeStamp(DateTimeOffset timestamp)
		{
			return timestamp.ToString("o");
		}

		//	thread-safe
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

		//	thread-safe
		protected virtual string FormatHexDecimalId(ulong value) => ILog.Hex(value);

		//	thread-safe
		protected override void RouteLine(DateTimeOffset timestamp, Severity severity, int logDensity, ulong logGroupId, ulong codePointId, params object?[] args)
		{
			var timestampText = this.FormatTimeStamp(timestamp);
			var severityText = this.FormatEventSeverity(severity);
			string? traceGroupIdText = null, tracePointIdText = null;
			if (logGroupId != DefaultLogGroupId || codePointId != DefaultLogPointId)
			{
				traceGroupIdText = this.FormatHexDecimalId(logGroupId);
				tracePointIdText = this.FormatHexDecimalId(codePointId);
			}
			List<string> clampCache = [];
			string? noClampCache = null;
			lock (this.sync)
			{
				for (int length = this.logSinks.Length, i = 0; i < length; ++i)
				{
					(LogSinkLineFilter? logSinkLineFilter, ILogSink logSink) = this.logSinks[i];
					if (!logSink.IsActive) continue;
					if (logSinkLineFilter != null && !logSinkLineFilter.IsMatch(severity, logDensity, logGroupId, codePointId)) continue;
					string? messageLine = logSinkLineFilter?.MaxLineLength != null ? clampCache.FirstOrDefault(v => v.Length == logSinkLineFilter?.MaxLineLength.Value) : noClampCache;
					if (messageLine == null)
					{
						StringBuilder sb = new();
						sb.Append(timestampText);
						sb.Append('|');
						if (this.AppPrefix != string.Empty)
						{
							sb.Append(this.AppPrefix);
							sb.Append('|');
						}
						sb.Append(severityText.PadRight(SeverityTextClampLength, ' '));
						if (traceGroupIdText != null || tracePointIdText != null) sb.Append($"|{traceGroupIdText}:{tracePointIdText}");
						sb.Append("| ");
						FormatArgs(sb, logSinkLineFilter?.MaxLineLength, args);
						sb.AppendLine();
						messageLine = sb.ToString();
						if (logSinkLineFilter?.MaxLineLength != null) clampCache.Add(messageLine);
						else noClampCache = messageLine;
					}
					logSink.Log(messageLine, timestamp, severity, logDensity, logGroupId, codePointId, timestampText, severityText, traceGroupIdText, tracePointIdText, logSinkLineFilter?.MaxLineLength);
				}
			}
		}

		//	thread-safe
		protected override void RouteLine(DateTimeOffset timestamp, Severity severity, int logDensity, ulong logGroupId, ulong codePointId, params (int clamp, object?[] values)[] args)
		{
			var timestampText = this.FormatTimeStamp(timestamp);
			var severityText = this.FormatEventSeverity(severity);
			string? traceGroupIdText = null, tracePointIdText = null;
			if (logGroupId != DefaultLogGroupId || codePointId != DefaultLogPointId)
			{
				traceGroupIdText = this.FormatHexDecimalId(logGroupId);
				tracePointIdText = this.FormatHexDecimalId(codePointId);
			}
			List<string> clampCache = [];
			string? noClampCache = null;
			lock (this.sync)
			{
				for (int length = this.logSinks.Length, i = 0; i < length; ++i)
				{
					(LogSinkLineFilter? logSinkLineFilter, ILogSink logSink) = this.logSinks[i];
					if (!logSink.IsActive) continue;
					if (logSinkLineFilter != null && !logSinkLineFilter.IsMatch(severity, logDensity, logGroupId, codePointId)) continue;
					string? messageLine = logSinkLineFilter?.MaxLineLength != null ? clampCache.FirstOrDefault(v => v.Length == logSinkLineFilter?.MaxLineLength.Value) : noClampCache;
					if (messageLine == null)
					{
						StringBuilder sb = new();
						sb.Append(timestampText);
						sb.Append('|');
						if (this.AppPrefix != string.Empty)
						{
							sb.Append(this.AppPrefix);
							sb.Append('|');
						}
						sb.Append(severityText.PadRight(SeverityTextClampLength, ' '));
						if (traceGroupIdText != null || tracePointIdText != null) sb.Append($"|{traceGroupIdText}:{tracePointIdText}");
						sb.Append("| ");
						FormatArgs(sb, logSinkLineFilter?.MaxLineLength, args);
						sb.AppendLine();
						messageLine = sb.ToString();
						if (logSinkLineFilter?.MaxLineLength != null) clampCache.Add(messageLine);
						else noClampCache = messageLine;
					}
					logSink.Log(messageLine, timestamp, severity, logDensity, logGroupId, codePointId, timestampText, severityText, traceGroupIdText, tracePointIdText, logSinkLineFilter?.MaxLineLength);
				}
			}
		}


		public string GetUnprefixedLine(string line, ulong logGroupId, ulong codePointId)
		{
			if (logGroupId != DefaultLogGroupId || codePointId != DefaultLogPointId) return line[(this.LinePrefixLength + this.IdsPrefixLength)..];
			return line[this.LinePrefixLength..];
		}


		public int LinePrefixLength
		{
			get
			{
				DateTimeOffset now;
				switch (this.LoggerTimeOffset)
				{
					case LoggerTimeOffset.Local: now = DateTimeOffset.Now; break;
					case LoggerTimeOffset.Utc: now = DateTimeOffset.UtcNow; break;
					case LoggerTimeOffset.Custom: now = new DateTimeOffset(DateTime.Now, this.CustomTimeOffset!.Value); break;
					default: throw new NotImplementedException(this.LoggerTimeOffset.ToString());
				}
				var timestampTextLength = this.FormatTimeStamp(now).Length + 1;							//	+1 for a trailing '|'
				var appPrefixTextLength = this.AppPrefix.Length > 0 ? this.AppPrefix.Length + 1 : 0;    //	+1 for a trailing '|'
				var severityTextLength = SeverityTextClampLength + 2;                                   //	+2 for a trailing "| "
				return timestampTextLength + appPrefixTextLength + severityTextLength;
			}
		}

		public int IdsPrefixLength
		{
			get
			{
				return 2 * ILog.HexDecimalIdTextClampLength + 2; //	+2 for a heading '|' and intermediate ':'
			}
		}

		public string AppPrefix { get; }


		(LogSinkLineFilter? logSinkLineFilter, ILogSink logSink)[] logSinks = [];

		readonly object sync = new();
	}
}
