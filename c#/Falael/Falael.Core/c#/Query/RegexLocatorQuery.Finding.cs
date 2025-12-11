//	R0Q4/daniel/20250914
using System.Text.RegularExpressions;

namespace Falael.Core.Query
{
	public partial class RegexLocatorQuery
	{
		public const int TAG_INFINITE_LOOP = int.MaxValue;

		public class FindingMatch
		{
			public string ReplaceGroup(int groupNumber, string replacement)
			{
				var g = this.RegexMatch.Groups[groupNumber];
				if (!g.Success) return this.Value;

				int relIndex = g.Index - this.RegexMatch.Index;
				string before = this.Value[..relIndex];
				string after = this.Value[(relIndex + g.Length)..];

				return before + replacement + after;
			}

			public static IList<FindingMatch> FromMatches(IEnumerable<Match> regexMatches)
			{
				return regexMatches.Select(regexMatch => new FindingMatch()
				{
					RegexMatch = regexMatch,
					Success = regexMatch.Success,
					Range = new()
					{
						Start = regexMatch.Index,
						End = regexMatch.Index + regexMatch.Length,
					},
					Value = regexMatch.Value,
				}).ToList();
			}

			public static FindingMatch FromMatch(Match regexMatch)
			{
				return new()
				{
					RegexMatch = regexMatch,
					Success = regexMatch.Success,
					Range = new()
					{
						Start = regexMatch.Index,
						End = regexMatch.Index + regexMatch.Length,
					},
					Value = regexMatch.Value,
				};
			}

			public required Match RegexMatch;
			public required bool Success;
			public required NumericRange<int> Range;
			public required string Value;
		}

		public class Finding
		{
			public Editor Edit()
			{
				return new() { TargetFinding = this };
			}

			public NumericRange<int> GetCaptureRange(int captureNumber, int matchIndex = -1)
			{
				switch (this.FindingMatches.Count)
				{
					case 0: return NumericRange<int>.Empty;
					default:
						var match = matchIndex < 0 ? this.FindingMatches[^1] : this.FindingMatches[matchIndex];
						if (!match.Success) return NumericRange<int>.Empty;
						var capture = match.RegexMatch.Captures[captureNumber];
						return new()
						{
							Start = capture.Index, 
							End = capture.Index + capture.Length,
						};
				}
			}

			public string GetCaptureValue(int captureNumber, int matchIndex = -1)
			{
				switch (this.FindingMatches.Count)
				{
					case 0: return string.Empty;
					default:
						var match = matchIndex < 0 ? this.FindingMatches[^1] : this.FindingMatches[matchIndex];
						if (!match.Success) return string.Empty;
						return match.RegexMatch.Captures[captureNumber].Value;
				}
			}

			public required RegexLocatorQuery Owner;
			public required object? Tag;
			public required string Remarks;
			public required IList<FindingMatch> FindingMatches;

			public bool Success => this.FindingMatches.Any(v => v.Success);
		}
	}
}
