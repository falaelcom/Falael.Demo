//	R0Q4/daniel/20250914
using System.Diagnostics;
using System.Text.RegularExpressions;

using static Falael.Core.Query.RegexLocatorQuery;

namespace Falael.Core.Query
{
	public partial class RegexLocatorQuery
	{
		internal abstract class ActionBase
		{
			public abstract void Apply(RegexLocatorQuery q);
		}

		#region Action_FindOne

		internal sealed class Action_FindOne : ActionBase
		{
			readonly Regex pattern;
			readonly object? tag;
			readonly string? remarks;

			public Action_FindOne(Regex pattern, object? tag, string? remarks)
			{
				this.pattern = pattern;
				this.tag = tag;
				this.remarks = remarks;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				var currentRange = q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				var m = this.pattern.Match(q.subject, currentRange.Start, currentRange.Length);

				q.findings.Add(new Finding
				{
					Owner = q,
					Tag = this.tag ?? $"[{q.findings.Count}]",
					Remarks = this.remarks ?? $"FindFirst, Regex: /{this.pattern}/{this.pattern.Options}",
					FindingMatches = [FindingMatch.FromMatch(m)],
				});
			}
		}

		#endregion

		#region Action_FindAll

		internal sealed class Action_FindAll : ActionBase
		{
			readonly Regex pattern;
			readonly object? tag;
			readonly string? remarks;

			public Action_FindAll(Regex pattern, object? tag, string? remarks)
			{
				this.pattern = pattern;
				this.tag = tag;
				this.remarks = remarks;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				var currentRange = q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				List<Match> outcome;
				if (currentRange.End == q.subject.Length) outcome = new List<Match>(this.pattern.Matches(q.subject, currentRange.Start));
				else
				{
					var startOffset = currentRange.Start;
					var endOffset = currentRange.Start + currentRange.Length;
					outcome = [];
					var match = this.pattern.Match(q.subject, startOffset, endOffset - startOffset);
					while (match.Success)
					{
						outcome.Add(match);
						startOffset = match.Length == 0 ? match.Index + 1 : match.Index + match.Length;
						if (endOffset <= startOffset) break;
						match = this.pattern.Match(q.subject, startOffset, endOffset - startOffset);
					}
				}

				q.findings.Add(new Finding
				{
					Owner = q,
					Tag = this.tag ?? $"[{q.findings.Count}]",
					Remarks = this.remarks ?? $"FindAll, Regex: /{this.pattern}/{this.pattern.Options}",
					FindingMatches = FindingMatch.FromMatches(outcome),
				});
			}
		}

		#endregion

		#region Action_FindOneBackwards

		/// <remarks>
		/// From: https://learn.microsoft.com/en-us/dotnet/api/system.text.regularexpressions.regex.match?view=net-9.0#system-text-regularexpressions-regex-match(system-string-system-int32-system-int32)
		/// 
		/// If the search proceeds from left to right (the default), the regular expression engine searches from the character at index beginning to the character at index beginning + length - 1. If the regular expression engine was instantiated by using the RegexOptions.RightToLeft option so that the search proceeds from right to left, the regular expression engine searches from the character at index beginning + length - 1 to the character at index beginning.
		/// 
		/// </remarks>
		internal sealed class Action_FindOneBackwards : ActionBase
		{
			readonly Regex pattern;
			readonly object? tag;
			readonly string? remarks;

			public Action_FindOneBackwards(Regex pattern, object? tag, string? remarks)
			{
				this.pattern = pattern;
				this.tag = tag;
				this.remarks = remarks;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(this.pattern.Options.HasFlag(RegexOptions.RightToLeft));
				Debug.Assert(!q.committed);

				var currentRange = q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				var m = this.pattern.Match(q.subject, currentRange.Start, currentRange.End - currentRange.Start);

				q.findings.Add(new Finding
				{
					Owner = q,
					Tag = this.tag ?? $"[{q.findings.Count}]",
					Remarks = this.remarks ?? $"FindOneBackward Regex: /{this.pattern}/{this.pattern.Options}",
					FindingMatches = [FindingMatch.FromMatch(m)],
				});
			}
		}

		#endregion

		#region Action_FindAllBackwards

		/// <remarks>
		/// From: https://learn.microsoft.com/en-us/dotnet/api/system.text.regularexpressions.regex.match?view=net-9.0#system-text-regularexpressions-regex-match(system-string-system-int32-system-int32)
		/// 
		/// If the search proceeds from left to right (the default), the regular expression engine searches from the character at index beginning to the character at index beginning + length - 1. If the regular expression engine was instantiated by using the RegexOptions.RightToLeft option so that the search proceeds from right to left, the regular expression engine searches from the character at index beginning + length - 1 to the character at index beginning.
		/// 
		/// </remarks>
		internal sealed class Action_FindAllBackwards : ActionBase
		{
			readonly Regex pattern;
			readonly object? tag;
			readonly string? remarks;

			public Action_FindAllBackwards(Regex pattern, object? tag, string? remarks)
			{
				this.pattern = pattern;
				this.tag = tag;
				this.remarks = remarks;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(this.pattern.Options.HasFlag(RegexOptions.RightToLeft));
				Debug.Assert(!q.committed);

				var currentRange = q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				int start = currentRange.Start;
				int end = currentRange.End;

				List<Match> outcome = [];
				var match = this.pattern.Match(q.subject, start, end - start);
				while (match.Success)
				{
					outcome.Add(match);
					end = match.Length == 0 ? match.Index - 1 : match.Index;
					if (end <= start) break;
					match = this.pattern.Match(q.subject, start, end - start);
				}

				q.findings.Add(new Finding
				{
					Owner = q,
					Tag = this.tag ?? $"[{q.findings.Count}]",
					Remarks = this.remarks ?? $"FindAllBackwards Regex: /{this.pattern}/{this.pattern.Options}",
					FindingMatches = FindingMatch.FromMatches(outcome),
				});
			}
		}

		#endregion

		#region Action_Fail_IfFound

		internal sealed class Action_Fail_IfFound : ActionBase
		{
			readonly object? failTag;
			readonly string? failMessage;

			public Action_Fail_IfFound(object? failTag, string? failMessage)
			{
				this.failTag = failTag;
				this.failMessage = failMessage;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				if (q.findings.Count == 0 || !q.findings[^1].Success) return;

				q.failed = true;
				q.failTag = this.failTag;
				q.failMssage = this.failMessage;
			}
		}

		#endregion

		#region Action_Fail_IfNotFound

		internal sealed class Action_Fail_IfNotFound : ActionBase
		{
			readonly object? failTag;
			readonly string? failMessage;

			public Action_Fail_IfNotFound(object? failTag, string? failMessage)
			{
				this.failTag = failTag;
				this.failMessage = failMessage;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);
				Debug.Assert(q.findings.Count != 0);

				if (q.findings[^1].Success) return;

				q.failed = true;
				q.failTag = this.failTag;
				q.failMssage = this.failMessage;
			}
		}

		#endregion

		#region Action_Throw_IfFound 

		internal sealed class Action_Throw_IfFound : ActionBase
		{
			readonly string? message;

			public Action_Throw_IfFound(string? message)
			{
				this.message = message;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				switch (q.findings.Count)
				{
					case 0: throw new NotInitializedException(q);
					default:
						var finding = q.findings[^1];
						if (finding.FindingMatches.Count == 0) return;
						if (finding.FindingMatches.Any(v => !v.Success)) return;
						throw new AssertionFailedException(q, this.message ?? "Unexpected match.");
				}
			}
		}

		#endregion

		#region Action_Throw_IfNotFound

		internal sealed class Action_Throw_IfNotFound : ActionBase
		{
			readonly string? message;

			public Action_Throw_IfNotFound(string? message)
			{
				this.message = message;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				switch (q.findings.Count)
				{
					case 0: throw new NotInitializedException(q);
					default:
						var finding = q.findings[^1];
						if (finding.FindingMatches.Count == 0) throw new AssertionFailedException(q, this.message ?? "No matches.");
						if (finding.FindingMatches.Any(v => !v.Success)) throw new AssertionFailedException(q, this.message ?? "Unsuccessful match.");
						break;
				}
			}
		}

		#endregion

		#region Action_ThrowIfNot

		internal sealed class Action_ThrowIfNot : ActionBase
		{
			readonly Func<RegexLocatorQuery, bool> predicate;
			readonly string? message;

			public Action_ThrowIfNot(Func<RegexLocatorQuery, bool> predicate, string? message)
			{
				this.predicate = predicate;
				this.message = message;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				switch (q.findings.Count)
				{
					case 0: throw new NotInitializedException(q);
					default:
						if (!this.predicate(q)) throw new AssertionFailedException(q, this.message ?? "Condition not met.");
						break;
				}
			}
		}

		#endregion

		#region Action_Then

		internal sealed class Action_Then : ActionBase
		{
			readonly Action<RegexLocatorQuery> next;

			public Action_Then(Action<RegexLocatorQuery> next)
			{
				this.next = next;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				this.next(q);
			}
		}

		#endregion

		#region Action_WhileFailed

		internal sealed class Action_WhileFailed : ActionBase
		{
			readonly Action<RegexLocatorQuery> next;

			public Action_WhileFailed(Action<RegexLocatorQuery> next)
			{
				this.next = next;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);
				
				if (q.SuccessOrEOT) return;
				var subRlq = q;
				var visitedRanges = new List<NumericRange<int>?> { subRlq.currentRange };
				do
				{
					subRlq = new RegexLocatorQuery(subRlq, copyFailStatus: false);	//	each iteration starts clean
					this.next(subRlq);
					subRlq.Commit();
					if (visitedRanges.Contains(subRlq.currentRange))
					{
						var f = new Finding
						{
							Owner = subRlq,
							FindingMatches = [],
							Remarks = nameof(Action_WhileFailed) + ": Infinite loop aborted.",
							Tag = TAG_INFINITE_LOOP,
						};
						subRlq.failed = true;
						subRlq.failTag = f;
						subRlq.failMssage = f.Remarks;
						break;
						//throw new InvalidOperationException("Aborting an infinite loop.");
					}
					visitedRanges.Add(subRlq.currentRange);
				}
				while (!subRlq.SuccessOrEOT);
				q.CopyFromInternal(subRlq, copyFailStatus: true);
			}
		}

		#endregion

		#region Action_NarrowRange

		internal sealed class Action_NarrowRange : ActionBase
		{
			readonly int captureNumber;
			readonly int matchIndex;

			public Action_NarrowRange(int captureNumber = 0, int matchIndex = -1)
			{
				this.captureNumber = captureNumber;
				this.matchIndex = matchIndex;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				switch (q.findings.Count)
				{
					case 0: return;
					default:
						var finding = q.findings[^1];
						q.currentRange = finding.GetCaptureRange(this.captureNumber, this.matchIndex);
						return;
				}
			}
		}

		#endregion

		#region Action_NarrowRangeStart

		internal sealed class Action_NarrowRangeStart : ActionBase
		{
			readonly int captureNumber;
			readonly int matchIndex;

			public Action_NarrowRangeStart(int captureNumber = 0, int matchIndex = -1)
			{
				this.captureNumber = captureNumber;
				this.matchIndex = matchIndex;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				switch (q.findings.Count)
				{
					case 0: return;
					default:
						var finding = q.findings[^1];
						var captureRange = finding.GetCaptureRange(this.captureNumber, this.matchIndex);
						q.currentRange = new NumericRange<int> { Start = captureRange.Start, End = q.currentRange.Value.End };
						return;
				}
			}
		}

		#endregion

		#region Action_NarrowRangeEnd

		internal sealed class Action_NarrowRangeEnd : ActionBase
		{
			readonly int captureNumber;
			readonly int matchIndex;

			public Action_NarrowRangeEnd(int captureNumber = 0, int matchIndex = -1)
			{
				this.captureNumber = captureNumber;
				this.matchIndex = matchIndex;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				switch (q.findings.Count)
				{
					case 0: return;
					default:
						var finding = q.findings[^1];
						var captureRange = finding.GetCaptureRange(this.captureNumber, this.matchIndex);
						q.currentRange = new NumericRange<int> { Start = q.currentRange.Value.Start, End = captureRange.End };
						return;
				}
			}
		}

		#endregion

		#region Action_TrimRangeStart

		internal sealed class Action_TrimRangeStart : ActionBase
		{
			readonly int captureNumber;
			readonly int matchIndex;

			public Action_TrimRangeStart(int captureNumber = 0, int matchIndex = -1)
			{
				this.captureNumber = captureNumber;
				this.matchIndex = matchIndex;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				switch (q.findings.Count)
				{
					case 0: return;
					default:
						var finding = q.findings[^1];
						var captureRange = finding.GetCaptureRange(this.captureNumber, this.matchIndex);
						q.currentRange = new NumericRange<int> { Start = captureRange.End, End = q.currentRange.Value.End };
						return;
				}
			}
		}

		#endregion

		#region Action_TrimRangeEnd

		internal sealed class Action_TrimRangeEnd : ActionBase
		{
			readonly int captureNumber;
			readonly int matchIndex;

			public Action_TrimRangeEnd(int captureNumber = 0, int matchIndex = -1)
			{
				this.captureNumber = captureNumber;
				this.matchIndex = matchIndex;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				switch (q.findings.Count)
				{
					case 0: return;
					default:
						var finding = q.findings[^1];
						var captureRange = finding.GetCaptureRange(this.captureNumber, this.matchIndex);
						q.currentRange = new NumericRange<int> { Start = q.currentRange.Value.Start, End = captureRange.Start };
						return;
				}
			}
		}

		#endregion

		#region Action_Push

		internal sealed class Action_Push : ActionBase
		{
			public override void Apply(RegexLocatorQuery q)
			{
				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };
				q.currentRangeStack.Push(q.currentRange);
			}
		}

		#endregion

		#region Action_Pop

		internal sealed class Action_Pop : ActionBase
		{
			public override void Apply(RegexLocatorQuery q)
			{
				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };
				q.currentRange = q.currentRangeStack.Pop();
			}
		}

		#endregion

		#region Action_ResizeRange

		internal sealed class Action_ResizeRange : ActionBase
		{
			readonly int newLength;
			readonly RangeAnchor rangeAnchor;

			public Action_ResizeRange(int newLength, RangeAnchor rangeAnchor)
			{
				Debug.Assert(newLength >= 0);

				this.newLength = newLength;
				this.rangeAnchor = rangeAnchor;
			}

			public override void Apply(RegexLocatorQuery q)
			{
				if (q.failed) return;

				Debug.Assert(!q.committed);

				q.currentRange ??= new NumericRange<int> { Start = 0, End = q.subject.Length };

				switch (q.findings.Count)
				{
					case 0: return;
					default:
						switch (this.rangeAnchor)
						{
							case RangeAnchor.Start:
								q.currentRange = new NumericRange<int> { Start = q.currentRange.Value.Start, End = q.currentRange.Value.Start + this.newLength };
								break;
							case RangeAnchor.End:
								q.currentRange = new NumericRange<int> { Start = q.currentRange.Value.End - this.newLength, End = q.currentRange.Value.End };
								break;
							default: throw new NotImplementedException(this.rangeAnchor.ToString());
						}
						return;
				}
			}
		}

		#endregion
	}
}