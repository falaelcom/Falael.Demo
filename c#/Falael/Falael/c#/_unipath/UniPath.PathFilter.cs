// R0Q4/daniel/20250909
// TODO:
// - doc
// - test

namespace Falael;

public partial struct UniPath
{
	public class PathFilter
	{
		public required string? Pattern;
		public bool UsePatternMatching = true;
	}
}
