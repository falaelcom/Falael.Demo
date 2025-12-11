using System.Text;

namespace Falael
{
    public interface ILog
	{
		public static readonly Severity[] Relaxed = [Severity.Diagnostic, Severity.Neutral];
		public static readonly Severity[] Severe = [Severity.Warning, Severity.Alert, Severity.Error, Severity.Critical, Severity.Fatal];
		public static readonly Severity[] Warnings = [Severity.Warning, Severity.Alert];
		public static readonly Severity[] Errors = [Severity.Error, Severity.Critical, Severity.Fatal];
		public static readonly Severity[] Alerts = [Severity.Alert, Severity.Error, Severity.Critical, Severity.Fatal];

		void WriteLine(int logDensity, (ulong logGroupId, ulong codePointId) ids, params object?[] args);
		void WriteLine(int logDensity, (ulong logGroupId, ulong codePointId) ids, params (int clamp, object?[] values)[] args);
		void WriteLine(Severity severity, (ulong logGroupId, ulong codePointId) ids, params object?[] args);
		void WriteLine(Severity severity, (ulong logGroupId, ulong codePointId) ids, params (int clamp, object?[] values)[] args);

		int MaxLineLength { get; }
		LoggerTimeOffset LoggerTimeOffset { get; }
		TimeSpan? CustomTimeOffset { get; }

		public const int HexDecimalIdTextClampLength = 8;

		public static readonly Encoding Utf8Safe = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false, throwOnInvalidBytes: false);


		public static string Hex(ulong value)
		{
			var hexString = value.ToString("X");
			if (hexString.Length > HexDecimalIdTextClampLength - 2) return "0x" + hexString[^(HexDecimalIdTextClampLength - 2)..];
			if (hexString.Length < HexDecimalIdTextClampLength - 2) return "0x" + hexString.PadLeft(HexDecimalIdTextClampLength - 2, '0');
			return $"0x{hexString}";
		}
	}
}
