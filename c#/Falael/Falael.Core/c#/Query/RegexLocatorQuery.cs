//	R0Q4/daniel/20250914
using System.Diagnostics;
using System.Text.RegularExpressions;

using static Falael.Core.Query.RegexLocatorQuery;

namespace Falael.Core.Query
{
	public partial class RegexLocatorQuery
	{
		public RegexLocatorQuery(string subject)
		{
			this._subject = subject;
		}

		protected internal RegexLocatorQuery(RegexLocatorQuery regexLocatorQuery, bool copyFailStatus)
		{
			this._subject = regexLocatorQuery.subject;
			this.CopyFromInternal(regexLocatorQuery, copyFailStatus);
		}

		#region Exceptions

		public class NotInitializedException(RegexLocatorQuery regexLocatorQuery, string? message = "Location query is not initialized.", Exception? innerException = null) : Exception(message, innerException)
		{
			public RegexLocatorQuery RegexLocatorQuery { get; } = regexLocatorQuery;
		}

		public class RangeConflictException(RegexLocatorQuery regexLocatorQuery, NumericRange<int> range1, NumericRange<int> range2, string? message = "Range conflict.", Exception? innerException = null) : Exception(message, innerException)
		{
			public RegexLocatorQuery RegexLocatorQuery { get; } = regexLocatorQuery;
			public NumericRange<int> Range1 { get; } = range1;
			public NumericRange<int> Range2 { get; } = range2;
		}

		public class AssertionFailedException(RegexLocatorQuery regexLocatorQuery, string message, Exception? innerException = null) : Exception(message, innerException)
		{
			public RegexLocatorQuery RegexLocatorQuery { get; } = regexLocatorQuery;
		}

		public class NotFoundException(RegexLocatorQuery regexLocatorQuery, object? tag, string? message = "Not found.", Exception? innerException = null) : Exception(message, innerException)
		{
			public RegexLocatorQuery RegexLocatorQuery { get; } = regexLocatorQuery;
			public object? Tag { get; } = tag;
		}

		#endregion

		#region Nested Types

		public enum RangeAnchor
		{
			Start,
			End,
		}

		#endregion

		public RegexLocatorQuery FindOne(object? tag, Regex pattern, string? remarks = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_FindOne(pattern, tag, remarks));
			return this;
		}
		public RegexLocatorQuery FindOne(Regex pattern, string? remarks = null) => this.FindOne(null, pattern, remarks);

		public RegexLocatorQuery FindAll(object? tag, Regex pattern, string? remarks = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_FindAll(pattern, tag, remarks));
			return this;
		}
		public RegexLocatorQuery FindAll(Regex pattern, string? remarks = null) => this.FindAll(null, pattern, remarks);

		public RegexLocatorQuery FindOneBackwards(object? tag, Regex pattern, string? remarks = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_FindOneBackwards(pattern, tag, remarks));
			return this;
		}
		public RegexLocatorQuery FindOneBackwards(Regex pattern, string? remarks = null) => this.FindOneBackwards(null, pattern, remarks);

		public RegexLocatorQuery FindAllBackwards(object? tag, Regex pattern, string? remarks = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_FindAllBackwards(pattern, tag, remarks));
			return this;
		}
		public RegexLocatorQuery FindAllBackwards(Regex pattern, string? remarks = null) => this.FindAllBackwards(null, pattern, remarks);

		public RegexLocatorQuery Fail_IfFound(object? failTag, string? failMessage)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Fail_IfFound(failTag, failMessage));
			return this;
		}
		public RegexLocatorQuery Fail_IfFound(string? failMessage = null) => this.Fail_IfFound(null, failMessage);

		public RegexLocatorQuery Fail_IfNotFound(object? failTag, string? failMessage = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Fail_IfNotFound(failTag, failMessage));
			return this;
		}
		public RegexLocatorQuery Fail_IfNotFound(string? failMessage = null) => this.Fail_IfFound(null, failMessage);

		public RegexLocatorQuery Throw_IfFound(string? message = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Throw_IfFound(message));
			return this;
		}

		public RegexLocatorQuery Throw_IfNotFound(string? message = null)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Throw_IfNotFound(message));
			return this;
		}

		public RegexLocatorQuery Throw_IfNot(Func<RegexLocatorQuery, bool> predicate, string? message)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_ThrowIfNot(predicate, message));
			return this;
		}

		public RegexLocatorQuery Then(Action<RegexLocatorQuery> next)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Then(next));
			return this;
		}

		public RegexLocatorQuery WhileFailed(Action<RegexLocatorQuery> next)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_WhileFailed(next));
			return this;
		}

		public RegexLocatorQuery NarrowRange(int captureNumber = 0, int matchIndex = -1)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_NarrowRange(captureNumber, matchIndex));
			return this;
		}

		public RegexLocatorQuery NarrowRangeStart(int captureNumber = 0, int matchIndex = -1)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_NarrowRangeStart(captureNumber, matchIndex));
			return this;
		}

		public RegexLocatorQuery NarrowRangeEnd(int captureNumber = 0, int matchIndex = -1)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_NarrowRangeEnd(captureNumber, matchIndex));
			return this;
		}

		public RegexLocatorQuery TrimRangeStart(int captureNumber = 0, int matchIndex = -1)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_TrimRangeStart(captureNumber, matchIndex));
			return this;
		}

		public RegexLocatorQuery TrimRangeEnd(int captureNumber = 0, int matchIndex = -1)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_TrimRangeEnd(captureNumber, matchIndex));
			return this;
		}

		public RegexLocatorQuery ResizeRange(int newLength, RangeAnchor rangeAnchor)
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_ResizeRange(newLength, rangeAnchor));
			return this;
		}

		public RegexLocatorQuery PushRange()
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Push());
			return this;
		}

		public RegexLocatorQuery PopRange()
		{
			Debug.Assert(!this.committed);

			this.actions.Add(new Action_Pop());
			return this;
		}

		public Result Commit()
		{
			Debug.Assert(!this.committed);

			for (int length = this.actions.Count, i = 0; i < length; ++i)
			{
				this.actions[i].Apply(this);
			}
			this.committed = true;
				return new Result
			{
				Committed = this.committed,
				Failed = this.failed,
				FailMssage = this.failMssage,
				FailTag = this.failTag,
				Findings = this.findings,
				Owner = this,
			};
		}


		public bool TryGetFindingByTag(object? tag, out Finding? result)
		{
			if (!this.committed) this.Commit(); // lazy recommit

			if (this.findings.Count == 0)
			{
				result = null;
				return false;
			}
			result = this.findings.FirstOrDefault(v =>
			{
				return v.Tag?.Equals(tag) == true;
			});
			return result != null;
		}
		public Finding GetFindingByTag(object? tag) => this.TryGetFindingByTag(tag, out Finding? outcome) ? outcome! : throw new NotFoundException(this, tag);

		public bool TryGetLastFindingByTag(object? tag, out Finding? result)
		{
			if (!this.committed) this.Commit(); // lazy recommit

			if (this.findings.Count == 0)
			{
				result = null;
				return false;
			}
			result = this.findings.LastOrDefault(v =>
			{
				return v.Tag?.Equals(tag) == true;
			});
			return result != null;
		}
		public Finding GetLastFindingByTag(object? tag) => this.TryGetLastFindingByTag(tag, out Finding? outcome) ? outcome! : throw new NotFoundException(this, tag);


		protected internal void CopyFromInternal(RegexLocatorQuery subRlq, bool copyFailStatus)
		{
			Debug.Assert(!this.committed);

			if (copyFailStatus)
			{
				this.failed = subRlq.failed;
				this.failTag = subRlq.failTag;
				this.failMssage = subRlq.failMssage;
			}
			this.findings.Clear();
			for (int length = subRlq.findings.Count, i = 0; i < length; ++i)
			{
				var f = subRlq.findings[i];
				f.Owner = this;
				this.findings.Add(f);
			}
			this.currentRange = subRlq.currentRange;
		}

		void ResetResultset()
		{
			this.failed = false;
			this.failTag = null;
			this.failMssage = null;
			this.findings.Clear();
			this.currentRange = null;
			this.currentRangeStack.Clear();
			this.committed = false;
		}


		#region Resultset

		public bool EOT
		{
			get
			{
				if (this.currentRange == null) return false;
				return this.currentRange.Value.IsEmpty;
			}
		}

		public bool BOT
		{
			get
			{
				return this.currentRange == null;
			}
		}

		public bool SuccessOrEOT => (!this.BOT && !this.failed) || this.EOT;

		public bool Failed
		{
			get
			{
				return this.failed;
			}
		}
		bool failed = false;

		public object? FailTag
		{
			get
			{
				return this.failTag;
			}
		}
		object? failTag = null;

		public string? FailMssage
		{
			get
			{
				return this.failMssage;
			}
		}
		string? failMssage = null;

		public IReadOnlyList<Finding> Findings
		{
			get
			{
				return this.findings.AsReadOnly();
			}
		}
		readonly List<Finding> findings = [];
		NumericRange<int>? currentRange = null;
		Stack<NumericRange<int>?> currentRangeStack = [];
		bool committed = false;

		#endregion

		public string Subject => this.subject;
		protected internal string subject
		{
			get => this._subject;
			set
			{
				this._subject = value;
				if(this.committed) this.ResetResultset();
			}
		}
		string _subject;

		readonly List<ActionBase> actions = [];
	}
}
