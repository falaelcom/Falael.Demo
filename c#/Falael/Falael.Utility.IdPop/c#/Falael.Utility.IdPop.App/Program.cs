using System.Text.RegularExpressions;

namespace Falael.Utility.IdPop.App
{
	internal class Program
	{
		static void Main(string[] args)
		{
			if (args.Length == 0)
			{
				Console.WriteLine("Need at least 1 arg - target directory pattern such as \"c:\\temp\\*.(cs|js)\". Multiple dirs ok");
				return;
			}

			foreach (var targetDirectoryPattern in args)
			{
				var directoryName = Path.GetDirectoryName(targetDirectoryPattern);
				if (!Directory.Exists(directoryName))
				{
					Console.WriteLine($"Cannot access \"${directoryName}\", aborting.");
					return;
				}
			}

			Console.WriteLine($"Looking up ncodes...");

			HashSet<string> paths_unsetIDs = [];
			HashSet<ulong> ncodes_Used = [];
			foreach (var targetDirectoryPattern in args)
			{
				Console.WriteLine($"Processing \"${targetDirectoryPattern}\"...");

				foreach (string filePath in FileEnumerator.EnumerateFiles(targetDirectoryPattern))
				{
					var text = File.ReadAllText(filePath);
					var findings = HexValueCollector.CollectHexValues(text);
					findings.ForEach(((string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength) value) =>
					{
						switch (value.ncodePurpose)
						{
							case ENcodePurpose.LGID:
							case ENcodePurpose.LLID:
							case ENcodePurpose.XID:
								var ncode_ulong = ulong.Parse(value.ncode[2..], System.Globalization.NumberStyles.HexNumber);
								if (ncodes_Used.Contains(ncode_ulong))
								{
									Console.WriteLine("!!!! DUPLICATE " + value.ncode + " " + value.ncodePurpose + " " + filePath);
									break;
								}
								ncodes_Used.Add(ncode_ulong);
								break;
							case ENcodePurpose.LLID_Empty:
							case ENcodePurpose.LGID_Empty:
							case ENcodePurpose.XID_Empty:
								paths_unsetIDs.Add(filePath);
								break;
							default: throw new NotImplementedException(value.ncodePurpose.ToString());
						}
					});
				}
			}

			Console.WriteLine($"Done.");
			Console.WriteLine($"Populating unset ncodes...");

			var hexDigitCount = 6;
			ulong maxValue = (1UL << (4 * hexDigitCount)) - 1;
			foreach (var path in paths_unsetIDs)
			{
				if ((ulong)ncodes_Used.Count > maxValue) throw new InvalidOperationException("All possible ncodes exhausted.");

				string fileContent = File.ReadAllText(path);
				var findings = HexValueCollector.CollectHexValues(fileContent);
				var emptyFindings = findings.Where(f =>
					f.ncodePurpose == ENcodePurpose.LGID_Empty ||
					f.ncodePurpose == ENcodePurpose.LLID_Empty ||
					f.ncodePurpose == ENcodePurpose.XID_Empty
				).OrderByDescending(f => f.matchOffset); // process from end to start to avoid offset issues

				foreach (var finding in emptyFindings)
				{
					var ncode = _generateNextHexCode(ncodes_Used, maxValue);
					ncodes_Used.Add(ncode);

					string replacementString;
					switch (finding.ncodePurpose)
					{
						case ENcodePurpose.LGID_Empty:
							replacementString = $"LGID = 0x{ncode:X6}";
							break;
						case ENcodePurpose.LLID_Empty:
							replacementString = $"LGID, 0x{ncode:X6}";
							break;
						case ENcodePurpose.XID_Empty:
							replacementString = $"this.XID, 0x{ncode:X6}";
							break;
						default: throw new InvalidOperationException(finding.ncodePurpose.ToString());
					}

					fileContent = fileContent.Remove(finding.matchOffset, finding.matchLength)
											 .Insert(finding.matchOffset, replacementString);
				}

				File.WriteAllText(path, fileContent);

				Console.WriteLine($"Processed file: {path}");
			}

			Console.WriteLine($"Done.");
			Console.WriteLine($"Ready.");

			ulong _generateNextHexCode(HashSet<ulong> ncodes_Used, ulong maxValue)
			{

				while (true)
				{
					ulong candidate = (ulong)(random.NextDouble() * (maxValue + 1));
					if (!ncodes_Used.Contains(candidate)) return candidate;
				}
			}
		}

		static Random random = new();
	}

	public static class FileEnumerator
	{
		public static IEnumerable<string> EnumerateFiles(string targetDirectoryPattern)
		{
			string directory = Path.GetDirectoryName(targetDirectoryPattern) ?? throw new NotImplementedException();
			string filePattern = Path.GetFileName(targetDirectoryPattern);

			// Convert wildcard pattern to regex
			string regexPattern = WildcardToRegex(filePattern);
			Regex regex = new(regexPattern, RegexOptions.IgnoreCase);

			return Directory.EnumerateFiles(directory, "*.*", SearchOption.AllDirectories)
				.Where(filePath => regex.IsMatch(Path.GetFileName(filePath)));
		}

		private static string WildcardToRegex(string wildcard)
		{
			string escapedWildcard = Regex.Escape(wildcard);

			// Replace wildcard characters with their regex equivalents
			escapedWildcard = escapedWildcard
				.Replace(@"\*", ".*")
				.Replace(@"\?", ".")
				.Replace(@"\(", "(")
				.Replace(@"\)", ")")
				.Replace(@"\|", "|");

			return $"^{escapedWildcard}$";
		}
	}

	public enum ENcodePurpose
	{
		LGID,
		LLID,
		XID,
		LGID_Empty,
		LLID_Empty,
		XID_Empty
	}

	public static class HexValueCollector
	{
		public static List<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValues(string input)
		{
			var results = new List<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)>();
			results.AddRange(CollectHexValuesPattern1(input));
			results.AddRange(CollectHexValuesPattern2(input));
			results.AddRange(CollectHexValuesPattern21(input));
			results.AddRange(CollectHexValuesPattern3(input));
			results.AddRange(CollectHexValuesPattern4(input));
			results.AddRange(CollectHexValuesPattern41(input));
			return results;
		}

		private static IEnumerable<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValuesPattern1(string input)
		{
			// Pattern 1: LGID=0x...;
			string pattern1 = @"LGID\s*=\s*(0x[0-9A-Fa-f]+)";
			var matches = Regex.Matches(input, pattern1);
			foreach (Match match in matches)
			{
				yield return (match.Groups[1].Value, ENcodePurpose.LGID, match.Index, match.Length);
			}
		}

		private static IEnumerable<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValuesPattern2(string input)
		{
			// Pattern 2: LGID, 0x...
			string pattern2 = @"LGID,\s*(0x[0-9A-Fa-f]+)";
			var matches = Regex.Matches(input, pattern2);
			foreach (Match match in matches)
			{
				yield return (match.Groups[1].Value, ENcodePurpose.LLID, match.Index, match.Length);
			}
		}

		private static IEnumerable<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValuesPattern21(string input)
		{
			// Pattern 2.1: this.XID, 0x...
			string pattern2 = @"this\.XID,\s*(0x[0-9A-Fa-f]+)";
			var matches = Regex.Matches(input, pattern2);
			foreach (Match match in matches)
			{
				yield return (match.Groups[1].Value, ENcodePurpose.XID, match.Index, match.Length);
			}
		}

		private static IEnumerable<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValuesPattern3(string input)
		{
			// Pattern 3: L G I D = 0x50BE4F;
			string pattern3 = @"LGID\s*=\s*-1";
			var matches = Regex.Matches(input, pattern3);
			foreach (Match match in matches)
			{
				yield return ("-1", ENcodePurpose.LGID_Empty, match.Index, match.Length);
			}
		}

		private static IEnumerable<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValuesPattern4(string input)
		{
			// Pattern 4: L G I D, 0x87DE7C
			string pattern4 = @"LGID,\s*-1";
			var matches = Regex.Matches(input, pattern4);
			foreach (Match match in matches)
			{
				yield return ("-1", ENcodePurpose.LLID_Empty, match.Index, match.Length);
			}
		}

		private static IEnumerable<(string ncode, ENcodePurpose ncodePurpose, int matchOffset, int matchLength)> CollectHexValuesPattern41(string input)
		{
			// Pattern 4.1: this.X I D, 0x87DE7C
			string pattern4 = @"this\.XID,\s*-1";
			var matches = Regex.Matches(input, pattern4);
			foreach (Match match in matches)
			{
				yield return ("-1", ENcodePurpose.XID_Empty, match.Index, match.Length);
			}
		}
	}
}
