//	R0Q4/daniel/20250914
//	TODD:
//	- migrate RegexLocatorQuery to internal execution plan builder and executor
//		- will allow for Editor to force execution plan rerunning to update findings on modified content

namespace Falael.Core.Query
{
	public partial class RegexLocatorQuery
	{
		public class Editor
		{
			public Editor InsertBefore(string text, int captureNumber = 0, int matchIndex = -1)
			{
				if (!this.TargetFinding.Owner.committed) this.TargetFinding.Owner.Commit(); // lazy recommit

				System.Diagnostics.Debug.Assert(this.TargetFinding.Owner.findings.Count != 0);

				var captureRange = this.TargetFinding.GetCaptureRange(captureNumber, matchIndex);
				this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Insert(captureRange.Start, text);
				return this;
			}

			public Editor InsertAfter(string text, int captureNumber = 0, int matchIndex = -1)
			{
				if (!this.TargetFinding.Owner.committed) this.TargetFinding.Owner.Commit(); // lazy recommit

				System.Diagnostics.Debug.Assert(this.TargetFinding.Owner.findings.Count != 0);

				var captureRange = this.TargetFinding.GetCaptureRange(captureNumber, matchIndex);
				this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Insert(captureRange.End, text);
				return this;
			}

			public Editor RemoveAll()
			{
				if (!this.TargetFinding.Owner.committed) this.TargetFinding.Owner.Commit(); // lazy recommit

				for (int i = this.TargetFinding.FindingMatches.Count - 1; i >= 0; --i)
				{
					var match = this.TargetFinding.FindingMatches[i];
					System.Diagnostics.Debug.Assert(match.Range.Start >= 0);
					System.Diagnostics.Debug.Assert(match.Range.End <= this.TargetFinding.Owner.subject.Length);
					this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Remove(match.Range.Start, match.Range.Length);
				}
				return this;
			}

			public Editor ReplaceAll(string text)
			{
				if (!this.TargetFinding.Owner.committed) this.TargetFinding.Owner.Commit(); // lazy recommit

				for (int i = this.TargetFinding.FindingMatches.Count - 1; i >= 0; --i)
				{
					var match = this.TargetFinding.FindingMatches[i];
					System.Diagnostics.Debug.Assert(match.Range.Start >= 0);
					System.Diagnostics.Debug.Assert(match.Range.End <= this.TargetFinding.Owner.subject.Length);
					this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Remove(match.Range.Start, match.Range.Length);
					this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Insert(match.Range.Start, text);
				}
				return this;
			}

			public Editor ReplaceAll(Func<FindingMatch, int, Finding, RegexLocatorQuery, string> getReplacement)
			{
				if (!this.TargetFinding.Owner.committed) this.TargetFinding.Owner.Commit(); // lazy recommit

				for (int i = this.TargetFinding.FindingMatches.Count - 1; i >= 0; --i)
				{
					var match = this.TargetFinding.FindingMatches[i];
					System.Diagnostics.Debug.Assert(match.Range.Start >= 0);
					System.Diagnostics.Debug.Assert(match.Range.End <= this.TargetFinding.Owner.subject.Length);
					this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Remove(match.Range.Start, match.Range.Length);
					this.TargetFinding.Owner.subject = this.TargetFinding.Owner.subject.Insert(match.Range.Start, getReplacement(match, i, this.TargetFinding, this.TargetFinding.Owner));
				}
				return this;
			}

			public RegexLocatorQuery Commit()
			{
				return this.TargetFinding.Owner;
			}

			public required Finding TargetFinding;
		}
	}
}
