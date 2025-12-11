using System.Diagnostics;
using System.Text;

using Falael;

using static Falael.LogRouter;

namespace Falael
{
    public abstract class LogRouter : ILog
	{
		public const string ClampPostfix = "...";
		public const int AutoClampLength = -1;
		public const ulong DefaultLogGroupId = 0;
		public const ulong DefaultLogPointId = 0;

		public static class Clamp
		{
			public static (int clamp, object?[] values) CLN(int clamp, params object?[] args) => (clamp > ClampPostfix.Length ? clamp : ClampPostfix.Length + 1, args);
			public static (int clamp, object?[] values) CL9(params object?[] args) => CLN(9, args);
			public static (int clamp, object?[] values) CL17(params object?[] args) => CLN(17, args);
			public static (int clamp, object?[] values) CL33(params object?[] args) => CLN(33, args);
			public static (int clamp, object?[] values) CL57(params object?[] args) => CLN(57, args);
			public static (int clamp, object?[] values) CL65(params object?[] args) => CLN(65, args);
			public static (int clamp, object?[] values) CL129(params object?[] args) => CLN(129, args);
			public static (int clamp, object?[] values) CL193(params object?[] args) => CLN(193, args);
			public static (int clamp, object?[] values) CL257(params object?[] args) => CLN(257, args);
			public static (int clamp, object?[] values) CL513(params object?[] args) => CLN(513, args);
			public static (int clamp, object?[] values) CL1025(params object?[] args) => CLN(1025, args);
			public static (int clamp, object?[] values) CL(params object?[] args) => (AutoClampLength, args);
		}

		public LogRouter(LoggerTimeOffset loggerTimeOffset = LoggerTimeOffset.Local, TimeSpan? customTimeOffset = null)
		{
			if (loggerTimeOffset != LoggerTimeOffset.Custom && customTimeOffset != null) throw new ArgumentException("loggerTimeOffset != ELoggerTimeOffset.Custom && customTimeOffset != null", nameof(customTimeOffset));
			if (loggerTimeOffset == LoggerTimeOffset.Custom && customTimeOffset == null) throw new ArgumentException("loggerTimeOffset == ELoggerTimeOffset.Custom && customTimeOffset == null", nameof(customTimeOffset));

			this.LoggerTimeOffset = loggerTimeOffset;
			this.CustomTimeOffset = customTimeOffset;
		}

		#region ILog

		//	thread-safe
		public void WriteLine(int logDensity, (ulong logGroupId, ulong codePointId) ids, params object?[] args)
		{
			DateTimeOffset now;
			switch (this.LoggerTimeOffset)
			{
				case LoggerTimeOffset.Local: now = DateTimeOffset.Now; break;
				case LoggerTimeOffset.Utc: now = DateTimeOffset.UtcNow; break;
				case LoggerTimeOffset.Custom: now = new DateTimeOffset(DateTime.Now, this.CustomTimeOffset!.Value); break;
				default: throw new NotImplementedException(this.LoggerTimeOffset.ToString());
			}
			this.RouteLine(now, Severity.Diagnostic, logDensity, ids.logGroupId, ids.codePointId, args);
		}

		//	thread-safe
		public void WriteLine(int logDensity, (ulong logGroupId, ulong codePointId) ids, params (int clamp, object?[] values)[] args)
		{
			DateTimeOffset now;
			switch (this.LoggerTimeOffset)
			{
				case LoggerTimeOffset.Local: now = DateTimeOffset.Now; break;
				case LoggerTimeOffset.Utc: now = DateTimeOffset.UtcNow; break;
				case LoggerTimeOffset.Custom: now = new DateTimeOffset(DateTime.Now, this.CustomTimeOffset!.Value); break;
				default: throw new NotImplementedException(this.LoggerTimeOffset.ToString());
			}
			this.RouteLine(now, Severity.Diagnostic, logDensity, ids.logGroupId, ids.codePointId, args);
		}

		//	thread-safe
		public void WriteLine(Severity severity, (ulong logGroupId, ulong codePointId) ids, params object?[] args)
		{
			DateTimeOffset now;
			switch (this.LoggerTimeOffset)
			{
				case LoggerTimeOffset.Local: now = DateTimeOffset.Now; break;
				case LoggerTimeOffset.Utc: now = DateTimeOffset.UtcNow; break;
				case LoggerTimeOffset.Custom: now = new DateTimeOffset(DateTime.Now, this.CustomTimeOffset!.Value); break;
				default: throw new NotImplementedException(this.LoggerTimeOffset.ToString());
			}
			this.RouteLine(now, severity, LogDensity.Unset, ids.logGroupId, ids.codePointId, args);
		}

		//	thread-safe
		public void WriteLine(Severity severity, (ulong logGroupId, ulong codePointId) ids, params (int clamp, object?[] values)[] args)
		{
			DateTimeOffset now;
			switch (this.LoggerTimeOffset)
			{
				case LoggerTimeOffset.Local: now = DateTimeOffset.Now; break;
				case LoggerTimeOffset.Utc: now = DateTimeOffset.UtcNow; break;
				case LoggerTimeOffset.Custom: now = new DateTimeOffset(DateTime.Now, this.CustomTimeOffset!.Value); break;
				default: throw new NotImplementedException(this.LoggerTimeOffset.ToString());
			}
			this.RouteLine(now, severity, LogDensity.Unset, ids.logGroupId, ids.codePointId, args);
		}

		//	thread-safe
		public int MaxLineLength { get; }

		//	thread-safe
		public LoggerTimeOffset LoggerTimeOffset { get; }

		//	thread-safe
		public TimeSpan? CustomTimeOffset { get; }

		#endregion

		public static string Format(params (int clamp, object?[] values)[] args)
		{
			var sb = new StringBuilder();
			FormatArgs(sb, null, args);
			return sb.ToString();
		}

		public static string Format(params object?[] args)
		{
			var sb = new StringBuilder();
			FormatArgs(sb, null, args);
			return sb.ToString();
		}

		protected abstract void RouteLine(DateTimeOffset timestamp, Severity severity, int logDensity, ulong logGroupId, ulong codePointId, params object?[] args);
		protected abstract void RouteLine(DateTimeOffset timestamp, Severity severity, int logDensity, ulong logGroupId, ulong codePointId, params (int clamp, object?[] values)[] args);


		protected static void FormatArgs(StringBuilder sb, int? maxLength, (int clamp, object?[] values)[] args)
		{
			if (maxLength != null && maxLength <= ClampPostfix.Length) throw new ArgumentOutOfRangeException(nameof(maxLength));
			maxLength ??= int.MaxValue;

			bool hasMore = false;
			for (int ilength = args.Length, i = 0, cumulativeClampedLength = 0; i < ilength; ++i)
			{
				(int clamp, object?[] values) = args[i];
				if (clamp == AutoClampLength)
				{
					var text = string.Join(' ', values);
					if (cumulativeClampedLength > 0)
					{
						sb.Append(' ');
						sb.Append(text);
						cumulativeClampedLength += text.Length + 1;
						if (cumulativeClampedLength > maxLength.Value)
						{
							hasMore = true;
							break;
						}
					}
					else
					{
						sb.Append(text);
						cumulativeClampedLength += text.Length;
						if (cumulativeClampedLength > maxLength.Value)
						{
							hasMore = true;
							break;
						}
					}
					continue;
				}
				int cumulativeClamp = 0;
				int jlength = values.Length, j = 0;
				for (; j < jlength && cumulativeClamp < clamp; ++j)
				{
					var jitem = values[j]?.ToString();
					if (jitem == null) continue;
					string space = string.Empty;
					if (cumulativeClampedLength + cumulativeClamp > 0) space = " ";
					string text;
					if (cumulativeClamp + space.Length + jitem.Length <= clamp) text = space + jitem;
					else
					{
						var leftLength = clamp - cumulativeClamp - space.Length;
						text = leftLength < 0 ? string.Empty : space + jitem[..leftLength];
					}
					cumulativeClamp += text.Length;
					Debug.Assert(cumulativeClamp <= clamp);
					sb.Append(text);
				}
				cumulativeClampedLength += clamp;
				if (cumulativeClampedLength > maxLength.Value)
				{
					hasMore = true;
					break;
				}
			}

			if (hasMore)
			{
				sb.Length = Math.Min(maxLength.Value - ClampPostfix.Length, sb.Length);
				sb.Append(ClampPostfix);
			}
		}

		protected static void FormatArgs(StringBuilder sb, int? maxLength, object?[] args)
		{
			if (maxLength != null && maxLength <= ClampPostfix.Length) throw new ArgumentOutOfRangeException(nameof(maxLength));
			maxLength ??= int.MaxValue;

			bool hasMore = false;
			for (int ilength = args.Length, i = 0, cumulativeClampedLength = 0; i < ilength; ++i)
			{
				var item = args[i];
				if (item is (int clamp, object?[] values))
				{
					if (clamp == AutoClampLength)
					{
						var text = string.Join(' ', values);
						if (cumulativeClampedLength > 0)
						{
							sb.Append(' ');
							sb.Append(text);
							cumulativeClampedLength += text.Length + 1;
							if (cumulativeClampedLength > maxLength.Value)
							{
								hasMore = true;
								break;
							}
						}
						else
						{
							sb.Append(text);
							cumulativeClampedLength += text.Length;
							if (cumulativeClampedLength > maxLength.Value)
							{
								hasMore = true;
								break;
							}
						}
						continue;
					}
					int cumulativeClamp = 0;
					int jlength = values.Length, j = 0;
					for (; j < jlength && cumulativeClamp < clamp; ++j)
					{
						var jitem = values[j]?.ToString();
						if (jitem == null) continue;
						string space = string.Empty;
						if (cumulativeClampedLength + cumulativeClamp > 0) space = " ";
						string text;
						if (cumulativeClamp + space.Length + jitem.Length <= clamp) text = space + jitem;
						else
						{
							var leftLength = clamp - cumulativeClamp - space.Length;
							text = leftLength < 0 ? string.Empty : space + jitem[..leftLength];
						}
						cumulativeClamp += text.Length;
						Debug.Assert(cumulativeClamp <= clamp);
						sb.Append(text);
					}
					cumulativeClampedLength += clamp;
					if (cumulativeClampedLength > maxLength.Value)
					{
						hasMore = true;
						break;
					}
				}
				else
				{
					var text = item?.ToString();
					if (text == null) continue;
					if (cumulativeClampedLength > 0)
					{
						sb.Append(' ');
						sb.Append(text);
						cumulativeClampedLength += text.Length + 1;
					}
					else
					{
						sb.Append(text);
						cumulativeClampedLength += text.Length;
					}
				}
			}

			if (hasMore)
			{
				sb.Length = Math.Min(maxLength.Value - ClampPostfix.Length, sb.Length);
				sb.Append(ClampPostfix);
			}
		}
	}
}
