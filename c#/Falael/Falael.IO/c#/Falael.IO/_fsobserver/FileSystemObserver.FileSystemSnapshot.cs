//	R0Q4/daniel/20250924
using System.Text;

namespace Falael.IO;

using PathFilter = UniPath.PathFilter;

public partial class FileSystemObserver : FalaelContextAware, IDisposable
{
	public class FileSystemSnapshot
	{
		public FileSystemSnapshot(string rootDirectory, PathFilter[] acceptedPathFilters, PathFilter[] excludedPathFilters, List<FileEntry> entries)
		{
			this.RootDirectory = rootDirectory;
			this.AcceptedPathFilters = acceptedPathFilters;
			this.ExcludedPathFilters = excludedPathFilters;
			this.Entries = entries;
		}

		#region Nested Types

		public class FileEntry
		{
			public required string RelativePath;
			public required DateTime ModifiedTimeUtc;
		}

		#endregion

		public string ToText(bool sort = false)
		{
			StringBuilder sb = new();

			// Line 1: RootDirectory
			bool needsQuotes = this.RootDirectory.Any(char.IsWhiteSpace);
			if (this.RootDirectory.Contains('"')) throw new InvalidOperationException("Path contains invalid character '\"'.");
			sb.Append("// ");
			if (needsQuotes) sb.Append('"');
			sb.Append(this.RootDirectory);
			if (needsQuotes) sb.Append('"');
			sb.AppendLine();

			// Line 2: AcceptedPathFilters
			bool isAcceptAll = this.AcceptedPathFilters.Length == 0 || this.AcceptedPathFilters.Any(p => p.Pattern == null || p.Pattern == string.Empty || p.Pattern == "*" || p.Pattern == "*.*");
			if (!isAcceptAll)
			{
				var filters = this.AcceptedPathFilters;
				if (sort) filters = [.. filters.OrderBy(v => v.Pattern + ':' + v.UsePatternMatching.ToString())];

				sb.Append(' ');
				for (int i = 0; i < filters.Length; i++)
				{
					var filter = filters[i];
					var pattern = filter.Pattern ?? "";
					needsQuotes = pattern.Any(char.IsWhiteSpace);
					if (pattern.Contains('"')) throw new InvalidOperationException("Pattern contains invalid character '\"'.");
					sb.Append('(');
					if (needsQuotes) sb.Append('"');
					sb.Append(pattern);
					if (needsQuotes) sb.Append('"');
					sb.Append(", ");
					sb.Append(filter.UsePatternMatching ? "glob" : "ext");
					sb.Append(')');
					if (i < filters.Length - 1) sb.Append(' ');
				}
			}
			sb.AppendLine();

			// Line 3: ExcludePathFilters
			sb.Append("?!");
			bool isExcludeAll = this.ExcludedPathFilters.Length == 0 || this.ExcludedPathFilters.Any(p => p.Pattern == null || p.Pattern == string.Empty || p.Pattern == "*" || p.Pattern == "*.*");
			if (!isExcludeAll)
			{
				var filters = this.ExcludedPathFilters;
				if (sort) filters = [.. filters.OrderBy(v => v.Pattern + ':' + v.UsePatternMatching.ToString())];

				sb.Append(' ');
				for (int i = 0; i < filters.Length; i++)
				{
					var filter = filters[i];
					var pattern = filter.Pattern ?? "";
					needsQuotes = pattern.Any(char.IsWhiteSpace);
					if (pattern.Contains('"')) throw new InvalidOperationException("Pattern contains invalid character '\"'.");
					sb.Append('(');
					if (needsQuotes) sb.Append('"');
					sb.Append(pattern);
					if (needsQuotes) sb.Append('"');
					sb.Append(", ");
					sb.Append(filter.UsePatternMatching ? "glob" : "ext");
					sb.Append(')');
					if (i < filters.Length - 1) sb.Append(' ');
				}
			}
			sb.AppendLine();

			// Lines 4+: Entries
			var entries = this.Entries;
			if (sort) entries = [.. entries.OrderBy(v => v.RelativePath)];

			foreach (var entry in entries)
			{
				sb.Append(entry.ModifiedTimeUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
				sb.Append(", ");
				needsQuotes = entry.RelativePath.Any(char.IsWhiteSpace);
				if (entry.RelativePath.Contains('"')) throw new InvalidOperationException("Path contains invalid character '\"'.");
				if (needsQuotes) sb.Append('"');
				sb.Append(entry.RelativePath);
				if (needsQuotes) sb.Append('"');
				sb.AppendLine();
			}

			return sb.ToString();
		}

		public static FileSystemSnapshot FromText(string text)
		{
			var lines = text.Split(["\r\n", "\r", "\n"], StringSplitOptions.None);
			if (lines.Length < 2) throw new FormatException("Invalid format: Too few lines.");

			// Line 1: RootDirectory
			var line1 = lines[0].Trim();
			if (!line1.StartsWith("//")) throw new FormatException("Invalid format: First line must start with '//'.");
			var rootDir = line1.Substring(2).Trim();
			if (rootDir.StartsWith('"') && rootDir.EndsWith('"')) rootDir = rootDir[1..^1];

			// Line 2: AcceptedPathFilters
			var line2 = lines[1].Trim();
			if (!line2.StartsWith("??")) throw new FormatException("Invalid format: Second line must start with '??'.");
			var filterStr = line2[2..].Trim();
			var acceptedPathFilters = new List<PathFilter>();
			if (!string.IsNullOrWhiteSpace(filterStr))
			{
				List<string> tokens = [];
				StringBuilder currentToken = new();
				bool inQuotes = false;
				bool inParen = false;
				foreach (char c in filterStr)
				{
					switch (c)
					{
						case '"':
							inQuotes = !inQuotes;
							currentToken.Append(c);
							break;
						case '(':
							if (!inQuotes) inParen = true;
							currentToken.Append(c);
							break;
						case ')':
							if (!inQuotes) inParen = false;
							currentToken.Append(c);
							break;
						case ',':
						case ' ':
						case '\t':
							if (inQuotes || inParen) currentToken.Append(c);
							else if (currentToken.Length > 0)
							{
								tokens.Add(currentToken.ToString());
								currentToken.Clear();
							}
							break;
						default:
							currentToken.Append(c);
							break;
					}
				}
				if (currentToken.Length > 0) tokens.Add(currentToken.ToString());
				if (inQuotes || inParen) throw new FormatException("Unclosed quote or parenthesis.");

				for (int i = 0; i < tokens.Count; i += 2)
				{
					if (i + 1 >= tokens.Count) throw new FormatException("Invalid filter format.");
					var patternToken = tokens[i].Trim('(', ')');
					var typeToken = tokens[i + 1].Trim('(', ')');
					var pattern = patternToken;
					if (pattern.StartsWith('"') && pattern.EndsWith('"')) pattern = pattern[1..^1];
					var usePatternMatching = typeToken == "glob";
					acceptedPathFilters.Add(new PathFilter()
					{
						Pattern = string.IsNullOrEmpty(pattern) ? null : pattern,
						UsePatternMatching = usePatternMatching
					});
				}
			}

			// Line 3: ExcludedPathFilters
			var line3 = lines[1].Trim();
			if (!line3.StartsWith("?!")) throw new FormatException("Invalid format: Third line must start with '?!'.");
			filterStr = line3[2..].Trim();
			var excludedPathFilters = new List<PathFilter>();
			if (!string.IsNullOrWhiteSpace(filterStr))
			{
				List<string> tokens = [];
				StringBuilder currentToken = new();
				bool inQuotes = false;
				bool inParen = false;
				foreach (char c in filterStr)
				{
					switch (c)
					{
						case '"':
							inQuotes = !inQuotes;
							currentToken.Append(c);
							break;
						case '(':
							if (!inQuotes) inParen = true;
							currentToken.Append(c);
							break;
						case ')':
							if (!inQuotes) inParen = false;
							currentToken.Append(c);
							break;
						case ',':
						case ' ':
						case '\t':
							if (inQuotes || inParen) currentToken.Append(c);
							else if (currentToken.Length > 0)
							{
								tokens.Add(currentToken.ToString());
								currentToken.Clear();
							}
							break;
						default:
							currentToken.Append(c);
							break;
					}
				}
				if (currentToken.Length > 0) tokens.Add(currentToken.ToString());
				if (inQuotes || inParen) throw new FormatException("Unclosed quote or parenthesis.");

				for (int i = 0; i < tokens.Count; i += 2)
				{
					if (i + 1 >= tokens.Count) throw new FormatException("Invalid filter format.");
					var patternToken = tokens[i].Trim('(', ')');
					var typeToken = tokens[i + 1].Trim('(', ')');
					var pattern = patternToken;
					if (pattern.StartsWith('"') && pattern.EndsWith('"')) pattern = pattern[1..^1];
					var usePatternMatching = typeToken == "glob";
					excludedPathFilters.Add(new PathFilter()
					{
						Pattern = string.IsNullOrEmpty(pattern) ? null : pattern,
						UsePatternMatching = usePatternMatching
					});
				}
			}

			// Remaining lines: Entries
			var entries = new List<FileEntry>();
			for (int i = 2; i < lines.Length; i++)
			{
				var line = lines[i].Trim();
				if (string.IsNullOrWhiteSpace(line)) continue;
				int sepIndex = -1;
				for (int j = 0; j < line.Length; j++)
				{
					if (line[j] == ',' || line[j] == ' ' || line[j] == '\t')
					{
						sepIndex = j;
						break;
					}
				}
				if (sepIndex == -1) throw new FormatException("Invalid entry format: No separator found.");
				var modTimeStr = line.Substring(0, sepIndex).Trim();
				var pathStr = line.Substring(sepIndex).TrimStart(',', ' ', '\t').Trim();
				if (pathStr.StartsWith('"') && pathStr.EndsWith('"')) pathStr = pathStr[1..^1];
				if (!DateTime.TryParse(modTimeStr, out DateTime modTime)) throw new FormatException($"Invalid modified time: {modTimeStr}");
				entries.Add(new FileEntry { RelativePath = pathStr, ModifiedTimeUtc = modTime.ToUniversalTime() });
			}

			return new FileSystemSnapshot(rootDir, [.. acceptedPathFilters], [.. excludedPathFilters], entries);
		}

		public readonly string RootDirectory;
		public readonly PathFilter[] AcceptedPathFilters;
		public readonly PathFilter[] ExcludedPathFilters;
		public readonly List<FileEntry> Entries;
	}
}
