using System.Diagnostics;
using System.Text.RegularExpressions;

namespace Falael.Core.AppTasks
{
	public class AppTaskQueueInfo : List<AppTaskQueueInfo.Item>
	{
		#region Nested Types

		public enum QueueItemState
		{
			Enqueued,
			Running,
			Throttled,
			Error,
			Exception,
		}

		public class Item
		{
			public Item(string fileName)
			{
				this.FileName = fileName;

				var partsL1 = fileName.Split('~');
				if (partsL1.Length != 2) throw new FormatException($"Invalid queue item file name: \"{fileName}\".");
				this.Uid = partsL1[0];

				var partsL2 = partsL1[1].Split('.');

				if (partsL2.Length < 2) throw new FormatException($"Invalid queue item file name: \"{fileName}\".");

				string queueItemStateMarker = partsL2[^1].ToLower();

				var runningOrThrottledPattern = $@"({Regex.Escape(TOKEN_RUNNING.ToLower())}|{Regex.Escape(TOKEN_THROTTLED.ToLower())})!(\d+)(\+\d+)?$";

				if (queueItemStateMarker != TOKEN_JSON && partsL2.Length < 3) throw new FormatException($"Invalid queue item file name: \"{fileName}\".");
				if (queueItemStateMarker != TOKEN_JSON && partsL2[^2] != TOKEN_JSON) throw new FormatException($"Invalid queue item file name: \"{fileName}\".");
				if (queueItemStateMarker != TOKEN_JSON && !Regex.IsMatch(queueItemStateMarker, runningOrThrottledPattern, RegexOptions.IgnoreCase) && !queueItemStateMarker.Equals(TOKEN_ERROR, StringComparison.CurrentCultureIgnoreCase) && !queueItemStateMarker.Equals(TOKEN_EXCEPTION, StringComparison.CurrentCultureIgnoreCase)) throw new FormatException($"Invalid queue item file name: \"{fileName}\".");

				var match = Regex.Match(queueItemStateMarker, runningOrThrottledPattern, RegexOptions.IgnoreCase);
				if (match.Success)
				{
					queueItemStateMarker = match.Groups[1].Value;

					if (!ulong.TryParse(match.Groups[2].Value, out ulong timestamp)) throw new FormatException($"Invalid timestamp format in file name: \"{fileName}\".");
					this.Timestamp = timestamp;

					if (match.Groups[3].Success)
					{
						string throttlePart = match.Groups[3].Value[1..]; // Remove the leading '+'
						if (!ulong.TryParse(throttlePart, out ulong throttleDurationMs)) throw new FormatException($"Invalid throttle time format in file name: \"{fileName}\".");
						this.ThrottleDurationMs = throttleDurationMs;
					}
				}

				switch (queueItemStateMarker.ToUpper())
				{
					case TOKEN_JSON_UPPERCASE:
						this.QueueItemState = QueueItemState.Enqueued;
						this.Tags = partsL2[..^1];
						break;
					case TOKEN_RUNNING:
						this.QueueItemState = QueueItemState.Running;
						this.Tags = partsL2[..^2];
						break;
					case TOKEN_THROTTLED:
						this.QueueItemState = QueueItemState.Throttled;
						this.Tags = partsL2[..^2];
						break;
					case TOKEN_ERROR:
						this.QueueItemState = QueueItemState.Error;
						this.Tags = partsL2[..^2];
						break;
					case TOKEN_EXCEPTION:
						this.QueueItemState = QueueItemState.Exception;
						this.Tags = partsL2[..^2];
						break;
					default:
						throw new NotImplementedException(queueItemStateMarker);
				}

				Array.Sort(this.Tags);
			}

			public Item(string uid, string[] tags, QueueItemState queueItemState, ulong? timestamp, ulong? throttleDurationMs)
			{
				if (uid.Length == 0) throw new ArgumentException("Cannot be an empty string.", nameof(uid));
				if (tags.Length == 0) throw new ArgumentException("Cannot be an empty array.", nameof(tags));
				if ((queueItemState == QueueItemState.Running || queueItemState == QueueItemState.Throttled) && timestamp == null) throw new ArgumentException("Running and throttled tasks require timestamp.", nameof(tags));
				if (queueItemState != QueueItemState.Running && queueItemState != QueueItemState.Throttled && (timestamp != null || throttleDurationMs != null)) throw new ArgumentException("Only running and throttled tasks can have a timestamp and throttleDurationMs.", nameof(tags));

				string[] sortedTags = new string[tags.Length];
				Array.Copy(tags, sortedTags, tags.Length);
				Array.Sort(sortedTags);

				this.Uid = uid;
				this.Tags = sortedTags;
				this.QueueItemState = queueItemState;
				this.Timestamp = timestamp;
				this.ThrottleDurationMs = throttleDurationMs;

				this.FileName = $"{uid}~{string.Join('.', tags)}.json";
				switch (this.QueueItemState)
				{
					case QueueItemState.Enqueued:
						break;
					case QueueItemState.Running:
						this.FileName += $".{TOKEN_RUNNING}!{this.Timestamp}{(this.ThrottleDurationMs != null && this.ThrottleDurationMs != 0 ? "+" + this.ThrottleDurationMs : string.Empty)}";
						break;
					case QueueItemState.Throttled:
						this.FileName += $".{TOKEN_THROTTLED}!{this.Timestamp}{(this.ThrottleDurationMs != null && this.ThrottleDurationMs != 0 ? "+" + this.ThrottleDurationMs : string.Empty)}";
						break;
					case QueueItemState.Error:
						this.FileName += "." + TOKEN_ERROR;
						break;
					case QueueItemState.Exception:
						this.FileName += "." + TOKEN_EXCEPTION;
						break;
					default:
						throw new NotImplementedException(this.QueueItemState.ToString());
				}
			}

			public Item ChangeKind(QueueItemState queueItemState, ulong? throttleDurationDeltaMs = null)
			{
				if (this.QueueItemState == QueueItemState.Running && queueItemState == QueueItemState.Throttled)
				{
					Debug.Assert(throttleDurationDeltaMs == null);
					return new(this.Uid, this.Tags, QueueItemState.Throttled, this.Timestamp, this.ThrottleDurationMs);
				}
				if (this.QueueItemState == QueueItemState.Throttled && queueItemState == QueueItemState.Running)
				{
					Debug.Assert(throttleDurationDeltaMs != null);
					return new(this.Uid, this.Tags, QueueItemState.Running, this.Timestamp, this.ThrottleDurationMs + throttleDurationDeltaMs);
				}
				Debug.Assert(throttleDurationDeltaMs == null);
				return new(this.Uid, this.Tags, queueItemState, queueItemState == QueueItemState.Running ? (ulong)DateTime.Now.Ticks : null, null);
			}

			public static bool Recognize(string fileName)
			{
				var fileName_lower = fileName.ToLower();

				var fullRunningOrThrottledPattern = Regex.Escape(TOKEN_JSON.ToLower()) + @"\." + $@"({Regex.Escape(TOKEN_RUNNING.ToLower())}|{Regex.Escape(TOKEN_THROTTLED.ToLower())})!(\d+)(\+\d+)?$";
				return fileName_lower.Contains('~') &&
				(
					fileName_lower.EndsWith(TOKEN_JSON.ToLower()) ||
					fileName_lower.EndsWith($"{TOKEN_JSON.ToLower()}.{TOKEN_ERROR.ToLower()}") ||
					fileName_lower.EndsWith($"{TOKEN_JSON.ToLower()}.{TOKEN_EXCEPTION.ToLower()}") ||
					Regex.IsMatch(fileName_lower, fullRunningOrThrottledPattern)
				);
			}

			public const string TOKEN_JSON = "json";
			public const string TOKEN_JSON_UPPERCASE = "JSON";
			public const string TOKEN_RUNNING = "RUNNING";
			public const string TOKEN_THROTTLED = "THROTTLED";
			public const string TOKEN_ERROR = "ERROR";
			public const string TOKEN_EXCEPTION = "EXCEPTION";

			public string FileName { get; private set; }

			public string Uid { get; private set; }
			public string[] Tags { get; private set; }
			public QueueItemState QueueItemState { get; private set; }
			public ulong? Timestamp { get; private set; }
			public ulong? ThrottleDurationMs { get; private set; } = 0;
		}

		#endregion

		public int CountExact(string[] tags, QueueItemState queueItemState)
		{
			return this.Count(item => item.QueueItemState == queueItemState && TagsEqual(item.Tags, tags));
		}

		/// <param name="tags"></param>
		/// <param name="queueItemState"></param>
		/// <remarks>will count all <see cref="AppTaskQueueInfo"/> items with tags that contain at least all <paramref name="tags"/></remarks>
		public int CountSuperset(string[] tags, QueueItemState queueItemState)
		{
			return this.Count(item => item.QueueItemState == queueItemState && TagsIsSupersetOf(item.Tags, tags));
		}

		public static bool TagsEqual(string[] left, string[] right)
		{
			var set_left = new HashSet<string>(left);
			var set_right = new HashSet<string>(right);

			return set_left.IsSupersetOf(set_right) && set_right.IsSupersetOf(set_left);
		}

		public static bool TagsIsSupersetOf(string[] left, string[] right)
		{
			var set_left = new HashSet<string>(left);
			var set_right = new HashSet<string>(right);

			return set_left.IsSupersetOf(set_right);
		}

		public static IEnumerable<string[]> TagsPowerSet(string[] tags)
		{
			var subsets = new List<string[]>();

			for (int ilength = 1 << tags.Length, i = 0; i < ilength; ++i)    // length = 2^n subsets for n tags
			{
				var subset = new List<string>();
				for (int jlength = tags.Length, j = 0; j < jlength; ++j) if ((i & 1 << j) != 0) subset.Add(tags[j]);
				subsets.Add([.. subset]);
			}

			foreach (var subset in subsets.OrderBy(s => s.Length)) yield return subset;
		}
	}
}
