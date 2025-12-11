//	R0Q4/daniel/20250828
using System.Diagnostics;

namespace Falael.Utility.Rtoctu
{
	public class AgentContext
	{
		public AgentContext(JsonFileCache<ulong, string, ulong, ulong> cache, Path sourceRootDir, Path targetRootDir, Path tempDir, Path logsDir)
		{
			Debug.Assert(Path.IsPathRooted(sourceRootDir));
			Debug.Assert(Path.IsPathRooted(targetRootDir));
			Debug.Assert(Path.IsPathRooted(targetRootDir));
			Debug.Assert(Path.IsPathRooted(tempDir));
			Debug.Assert(Path.IsPathRooted(logsDir));
			this.Cache = cache;
			this.SourceRootDir = sourceRootDir;
			this.TargetRootDir = targetRootDir;
			this.TempDir = tempDir;
			this.LogsDir = logsDir;
		}

		public readonly JsonFileCache<ulong, string, ulong, ulong> Cache;
		public readonly Path SourceRootDir;
		public readonly Path TargetRootDir;
		public readonly Path TempDir;
		public readonly Path LogsDir;
	}
}


