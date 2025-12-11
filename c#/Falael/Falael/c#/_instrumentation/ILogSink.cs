//	- allow for optional fs command file runtime adjustment of `Verbosity`, `Severity` and `LogDensity`.
using System.Diagnostics;
using System.Text;

using Falael;

namespace Falael
{
    public interface ILogSink
	{
		void Log(
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

			int? maxLineLength);

		bool IsActive { get; }
	}
}
