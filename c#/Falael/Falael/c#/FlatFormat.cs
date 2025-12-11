using System.Diagnostics;
using System.Text;

namespace Falael
{
	public class FlatFormat
	{
		public FlatFormat(List<Tuple<char, char>>? sectionDefs = null)
		{
			if (sectionDefs?.Count == 0) throw new ArgumentException("Must not be empty.", nameof(sectionDefs));

			this.SectionDefs = sectionDefs ?? DefaultSectionDefs;
		}

		#region Nested Types

		public class SectionBody
		{
			public string? Text { get; set; }
			public Dictionary<string, SectionBody>? Items { get; set; }
		}

		#endregion

		public Dictionary<string, SectionBody> Deserialize(string value)
		{
			return this.ParseSectionLines(SplitEx(value), 0);
		}

		public string Serialize(Dictionary<string, SectionBody> value)
		{
			StringBuilder sb = new();
			foreach (var kvp in value) this.WriteSection(sb, kvp.Key, kvp.Value, 0);
			return sb.ToString();
		}


		Dictionary<string, SectionBody> ParseSectionLines(List<string>? lines, int depth)
		{
			Debug.Assert(depth < this.SectionDefs.Count);

			if (lines == null) return [];

			var dectionDef = this.SectionDefs[depth];

			Dictionary<string, List<string>> lineGroups = [];

			string? sectionName = null;
			for (int length = lines.Count, i = 0; i < length; ++i)
			{
				var line = lines[i];
				if (line.StartsWith(dectionDef.Item1))
				{
					sectionName = line[1..].Trim(); //	as a char, dectionDef.Item1 has length 1
					if (lineGroups.ContainsKey(sectionName)) throw new FormatException($"Duplicate section field name \"{sectionName}\".");
					lineGroups.Add(sectionName, []);
					continue;
				}
				if (line.StartsWith(dectionDef.Item2)) continue;
				if (sectionName == null)
				{
					if (line.Trim() == string.Empty) continue;
					throw new FormatException("Unexpected text before first section.");
				}
				lineGroups[sectionName].Add(line);
			}

			Dictionary<string, SectionBody> result = [];
			foreach (var kvp in lineGroups) result.Add(kvp.Key, this.IsSectionList(kvp.Value, depth + 1) ? new() { Items = this.ParseSectionLines(kvp.Value, depth + 1) } : new() { Text = kvp.Value.Count == 0 ? null : string.Join(Environment.NewLine, kvp.Value) });
			return result;
		}

		bool IsSectionList(List<string>? lineGroup, int depth)
		{
			if (lineGroup == null) return false;
			if (depth >= this.SectionDefs.Count) return false;
			var dectionDef = this.SectionDefs[depth];
			var subSectionHeaderLine_foundAt = lineGroup.FindIndex(v => v.Length != 0 && v[0] == dectionDef.Item1);
			return subSectionHeaderLine_foundAt != -1;
		}

		void WriteSection(StringBuilder sb, string name, SectionBody body, int depth)
		{
			Debug.Assert(depth < this.SectionDefs.Count);
			Debug.Assert(!name.Contains('\r'));
			Debug.Assert(!name.Contains('\n'));
			var dectionDef = this.SectionDefs[depth];

			sb.AppendLine($"{dectionDef.Item1} {name}");
			var separatorLength = SEPARATOR_REPEAT_BASE_COUNT + (this.SectionDefs.Count - depth);
			sb.AppendLine(new string(dectionDef.Item2, Math.Max(separatorLength, 3)));
			if (body.Items != null)
			{
				foreach (var kvp in body.Items) this.WriteSection(sb, kvp.Key, kvp.Value, depth + 1);
				return;
			}

			if (body.Text != null) sb.AppendLine(NeedsVerbatimEscape(body.Text, this.SectionDefs) ? EscapeVerbatim(body.Text) : body.Text);
		}


		static List<string> SplitEx(string value)
		{
			List<string> result = [];

			string[] lines = value.Split(Environment.NewLine);
			bool parsingVerbatim = false;
			StringBuilder sb = new();
			for (int length = lines.Length, i = 0; i < length; ++i)
			{
				var line = lines[i];
				if (!parsingVerbatim)
				{
					if (!line.StartsWith(VERBATIM_LINE_MARKER))
					{
						result.Add(line);
						continue;
					}
					parsingVerbatim = true;
					sb.Length = 0;
					continue;
				}
				if (line.StartsWith(VERBATIM_LINE_MARKER))
				{
					result.Add(sb.ToString());
					parsingVerbatim = false;
				}
				else sb.AppendLine(line.Replace("\\\\", "\\").Replace("\\`", "`"));
			}
			return result;
		}

		static string EscapeVerbatim(string value)
		{
			return VERBATIM_LINE_MARKER + Environment.NewLine + value.Replace("\\", "\\\\").Replace("`", "\\`") + VERBATIM_LINE_MARKER;
		}

		static bool NeedsVerbatimEscape(string value, List<Tuple<char, char>> sectionDefs)
		{
			string[] lines = value.Split(Environment.NewLine);

			foreach (string line in lines) foreach (var sectionDef in sectionDefs)
				{
					if (line.StartsWith(sectionDef.Item1.ToString()) || line.StartsWith(sectionDef.Item2.ToString()) || line.StartsWith(VERBATIM_LINE_MARKER)) return true;
				}

			return false;
		}


		const string VERBATIM_LINE_MARKER = "```";
		const int SEPARATOR_REPEAT_BASE_COUNT = 8;

		public static readonly List<Tuple<char, char>> DefaultSectionDefs =
		[
			Tuple.Create('*', '='),
			Tuple.Create('>', '-'),
			Tuple.Create('!', '~'),
		];

		public List<Tuple<char, char>> SectionDefs { get; }
	}
}