//	R0Q4/daniel/20250914
//	TODD:
//	- migrate RegexLocatorQuery to internal execution plan builder and executor
//		- will allow for Editor to force execution plan rerunning to update findings on modified content

using System.Diagnostics;

namespace Falael.Core.Query
{
	public partial class RegexLocatorQuery
	{
		public class Result
		{
			public Result OnFail(object? failTag, Action<RegexLocatorQuery, object?> handler)
			{
				Debug.Assert(this.Committed);

				if (!object.Equals(failTag, this.FailTag)) return this;
				handler(this.Owner, failTag);
				return this;
			}

			public Result OnSuccess(Action<RegexLocatorQuery> handler)
			{
				Debug.Assert(this.Committed);

				if (this.Failed) return this;
				handler(this.Owner);
				return this;
			}


			public required bool Committed;
			public required bool Failed;
			public required object? FailTag;
			public required string? FailMssage;
			public required IReadOnlyList<Finding> Findings;

			public required RegexLocatorQuery Owner;
		}
	}
}
