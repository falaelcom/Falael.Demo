using System.Diagnostics;
using System.Text;

using Falael;

namespace Falael
{
    public class LogSinkLineFilter
	{
		public int? MaxLineLength { get; init; } = null;
		public int? MaxLogDensity { get; init; } = null;
		public Severity[]? Severities { get; init; } = null;
		public ulong[]? TraceBucketIds { get; init; } = null;

		public bool IsMatch(Severity severity, int logDensity, ulong traceGroupId, ulong tracePointId)
		{
			if (this.MaxLogDensity != null && logDensity > this.MaxLogDensity) return false;
			if (this.Severities != null && !this.Severities.Contains(severity)) return false;
			if (this.TraceBucketIds != null && !this.TraceBucketIds.Contains(traceGroupId)) return false;
			return true;
		}
	}
}
