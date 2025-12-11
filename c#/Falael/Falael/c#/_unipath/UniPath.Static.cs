//	R0Q4/daniel/
//	TODO:
//	- doc
//	- test

using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text;

using static Falael.UniPath;

namespace Falael
{
	public partial struct UniPath : IComparable<UniPath>
	{
		//	implements the `private static string GetRelativePath(string relativeTo, string path, StringComparison comparisonType)` method of `System.IO.Path`
		//		to allow use of custom StringComparison
		static string GetRelativePath(TContext context, string relativeTo, string path, StringComparison comparisonType)
		{
			relativeTo = System.IO.Path.GetFullPath(relativeTo);
			path = System.IO.Path.GetFullPath(path);

			var relativeToRootDirectory = RootDirectory.FromRootDirectory(context, System.IO.Path.GetPathRoot(relativeTo));
			var relativeToRootDirectoryText = relativeToRootDirectory.Format(context, DirectorySeparatorFormat.Windows, WindowsDriveLetterFormat.LowerCase, VolumeGuidFormat.LowerCase);

			var pathRootDirectory = RootDirectory.FromRootDirectory(context, System.IO.Path.GetPathRoot(path));
			var pathRootDirectoryText = pathRootDirectory.Format(context, DirectorySeparatorFormat.Windows, WindowsDriveLetterFormat.LowerCase, VolumeGuidFormat.LowerCase);

			// Need to check if the roots are different- if they are we need to return the "to" path.
			if (relativeToRootDirectoryText != pathRootDirectoryText) return path;

			relativeTo = relativeToRootDirectoryText + relativeTo[relativeToRootDirectoryText.Length..];
			path = pathRootDirectoryText + path[pathRootDirectoryText.Length..];

			int commonLength = _getCommonPrefixLength(relativeTo, path, comparisonType);

			// If there is nothing in common they can't share the same root, return the "to" path as is.
			if (commonLength == 0) return path;

			// Trailing separators aren't significant for comparison
			int relativeToLength = relativeTo.Length;
			if (relativeToLength > 0 && EndsInDirectorySeparator(relativeTo)) --relativeToLength;

			int pathLength = path.Length;
			bool pathEndsInSeparator = EndsInDirectorySeparator(path);
			if (pathEndsInSeparator) --pathLength;

			// If we have effectively the same path, return "."
			if (relativeToLength == pathLength && commonLength >= relativeToLength) return ".";

			// We have the same root, we need to calculate the difference now using the
			// common Length and Segment count past the length.
			//
			// Some examples:
			//
			//  C:\Foo C:\Bar L3, S1 -> ..\Bar
			//  C:\Foo C:\Foo\Bar L6, S0 -> Bar
			//  C:\Foo\Bar C:\Bar\Bar L3, S2 -> ..\..\Bar\Bar
			//  C:\Foo\Foo C:\Foo\Bar L7, S1 -> ..\Bar

			var sb = new StringBuilder(Math.Max(relativeToLength, pathLength));

			// Add parent segments for segments past the common on the "from" path
			if (commonLength < relativeToLength)
			{
				sb.Append("..");

				for (int i = commonLength + 1; i < relativeToLength; i++)
				{
					if (relativeTo[i] == DirectorySeparatorChar || relativeTo[i] == AltDirectorySeparatorChar)
					{
						sb.Append(context.DirectorySeparator);
						sb.Append("..");
					}
				}
			}
			else if (path[commonLength] == DirectorySeparatorChar || path[commonLength] == AltDirectorySeparatorChar)
			{
				// No parent segments and we need to eat the initial separator
				//  (C:\Foo C:\Foo\Bar case)
				++commonLength;
			}

			// Now add the rest of the "to" path, adding back the trailing separator
			int differenceLength = pathLength - commonLength;
			if (pathEndsInSeparator) ++differenceLength;

			if (differenceLength > 0)
			{
				if (sb.Length > 0) sb.Append(context.DirectorySeparator);
				sb.Append(path.AsSpan(commonLength, differenceLength));
			}

			return sb.ToString();

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static int _getCommonPrefixLength(string left, string right, StringComparison comparisonType)
			{
				int n = Math.Min(left.Length, right.Length);
				int i = 0;
				for (; i < n; ++i)
					if (!left.AsSpan(i, 1).Equals(right.AsSpan(i, 1), comparisonType))
						break;

				// If fully matched up to left or right end and the other is at a boundary, don't backtrack.
				bool leftEnded = i == left.Length;
				bool rightEnded = i == right.Length;
				bool rightAtSep = !rightEnded && (right[i] == DirectorySeparatorChar || right[i] == AltDirectorySeparatorChar);
				bool leftAtSep = !leftEnded && (left[i] == DirectorySeparatorChar || left[i] == AltDirectorySeparatorChar);
				if ((leftEnded && (rightEnded || rightAtSep)) ||
					(rightEnded && (leftEnded || leftAtSep)))
					return i;

				// Otherwise, align to previous separator (segment boundary)
				while (i > 0)
				{
					char c = left[i - 1];
					if (c == DirectorySeparatorChar || c == AltDirectorySeparatorChar) break;
					--i;
				}
				return i;
			}
		}

		public static UniPath CreateFromDirectoryPath(TContext context, string path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path)))
			.GetDirectoryPath();


		public static bool IsMatch(TContext context, string? path, IEnumerable<PathFilter> acceptedPathFilters, IEnumerable<PathFilter> excludedPathFilters) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).IsMatch(acceptedPathFilters, excludedPathFilters);

		public static bool IsMatch(string? path, IEnumerable<PathFilter> acceptedPathFilters, IEnumerable<PathFilter> excludedPathFilters) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).IsMatch(acceptedPathFilters, excludedPathFilters);

		public static bool IsMatch(TContext context, string? path, string? pattern, bool patternIsGlob = true) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pattern, patternIsGlob);

		public static bool IsMatch(string? path, string? pattern, bool patternIsGlob = true) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pattern, patternIsGlob);

		public static bool IsMatch(TContext context, string? path, IEnumerable<string?> patterns, bool patternIsGlob = true) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).IsMatch(patterns, patternIsGlob);

		public static bool IsMatch(string? path, IEnumerable<string?> patterns, bool patternIsGlob = true) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).IsMatch(patterns, patternIsGlob);

		public static bool IsMatch(TContext context, string? path, PathFilter pathFilter) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pathFilter);

		public static bool IsMatch(string? path, PathFilter pathFilter) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pathFilter);

		public static bool IsMatch(TContext context, string? path, IEnumerable<PathFilter> pathFilters) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pathFilters);

		public static bool IsMatch(string? path, IEnumerable<PathFilter> pathFilters) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pathFilters);

		
		public static bool IsRelativeTo(TContext context, string? path, IEnumerable<PathFilter> pathFilters) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pathFilters);

		public static bool IsRelativeTo(string? path, IEnumerable<PathFilter> pathFilters) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).IsMatch(pathFilters);

		#region .NET 8.0 System.IO.Path.Path Static Interface as of 2025.09.01 excluding ReadOnlySpan<> methods

		public static readonly char DirectorySeparatorChar = System.IO.Path.DirectorySeparatorChar;
		public static readonly char AltDirectorySeparatorChar = System.IO.Path.AltDirectorySeparatorChar;
		public static readonly char VolumeSeparatorChar = System.IO.Path.VolumeSeparatorChar;
		public static readonly char PathSeparator = System.IO.Path.PathSeparator;

		public static string ChangeExtension(TContext context, string? path, string? extension) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).SetFileExtension(extension).ToString();
		public static string ChangeExtension(string? path, string? extension, TContext? context = null) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).SetFileExtension(extension).ToString();

		public static bool Exists(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).Exists();
		public static bool Exists(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).Exists();

		public static string GetDirectoryName(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path)))
			.GetDirectoryPath();
		public static string GetDirectoryName(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path)))
			.GetDirectoryPath();

		public static string GetExtension(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path)))
			.FileExtension;
		public static string GetExtension(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path)))
			.FileExtension;

		public static string GetFileName(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path)))
			.FileName;
		public static string GetFileName(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path)))
			.FileName;

		public static string GetFileNameWithoutExtension(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path)))
			.FileNameWithoutExtension;
		public static string GetFileNameWithoutExtension(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path)))
			.FileNameWithoutExtension;

		public static string GetRandomFileName() => System.IO.Path.GetRandomFileName();

		public static bool IsPathFullyQualified(TContext context, string path) =>
			new UniPath(context, path)
			.IsFullyQualified();
		public static bool IsPathFullyQualified(string path) =>
			new UniPath(path)
			.IsFullyQualified();

		public static bool HasExtension(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path)))
			.HasFileExtension;
		public static bool HasExtension(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path)))
			.HasFileExtension;

		#region Combine *

		public static string Combine(TContext context, string path1, string path2) =>
			new UniPath(context, path1).CombineWith(
				path2: new UniPath(context, path2)
			).ToString();
		public static string Combine(string path1, string path2) =>
			new UniPath(path1).CombineWith(
				path2: new UniPath(path2)
			).ToString();

		public static string Combine(TContext context, string path1, string path2, string path3) =>
			new UniPath(context, path1)
			.CombineWith(
				path2: new UniPath(context, path2),
				path3: new UniPath(context, path3)

			).ToString();
		public static string Combine(string path1, string path2, string path3) =>
			new UniPath(path1)
			.CombineWith(
				path2: new UniPath(path2),
				path3: new UniPath(path3)
				
			).ToString();

		public static string Combine(TContext context, string path1, string path2, string path3, string path4) =>
			new UniPath(context, path1)
			.CombineWith(
				path2: new UniPath(context, path2),
				path3: new UniPath(context, path3),
				path4: new UniPath(context, path4)
				
			).ToString();
		public static string Combine(string path1, string path2, string path3, string path4) =>
			new UniPath(path1)
			.CombineWith(
				path2: new UniPath(path2),
				path3: new UniPath(path3),
				path4: new UniPath(path4)

			).ToString();

		public static string Combine(TContext context, params string[] paths) =>
			new UniPath(context, System.IO.Path.Combine(paths)).ToString();
		public static string Combine(params string[] paths) =>
			new UniPath(System.IO.Path.Combine(paths)).ToString();

		#endregion

		#region Join *

		public static string Join(TContext context, string? path1, string? path2) =>
			new UniPath(context, path1 ?? throw new ArgumentNullException(nameof(path1)))
			.JoinWith(
				path2: new UniPath(context, path2 ?? throw new ArgumentNullException(nameof(path2)))
			).ToString();
		public static string Join(string? path1, string? path2) =>
			new UniPath(path1 ?? throw new ArgumentNullException(nameof(path1)))
			.JoinWith(
				path2: new UniPath(path2 ?? throw new ArgumentNullException(nameof(path2)))
			).ToString();

		public static string Join(TContext context, string? path1, string? path2, string? path3) =>
			new UniPath(context, path1 ?? throw new ArgumentNullException(nameof(path1)))
			.JoinWith(
				path2: new UniPath(context, path2 ?? throw new ArgumentNullException(nameof(path2))),
				path3: new UniPath(context, path3 ?? throw new ArgumentNullException(nameof(path3)))

			).ToString();
		public static string Join(string? path1, string? path2, string? path3) =>
			new UniPath(path1 ?? throw new ArgumentNullException(nameof(path1)))
			.JoinWith(
				path2: new UniPath(path2 ?? throw new ArgumentNullException(nameof(path2))),
				path3: new UniPath(path3 ?? throw new ArgumentNullException(nameof(path3)))
				
			).ToString();

		public static string Join(TContext context, string? path1, string? path2, string? path3, string? path4) =>
			new UniPath(context, path1 ?? throw new ArgumentNullException(nameof(path1)))
			.JoinWith(
				path2: new UniPath(context, path2 ?? throw new ArgumentNullException(nameof(path2))),
				path3: new UniPath(context, path3 ?? throw new ArgumentNullException(nameof(path3))),
				path4: new UniPath(context, path4 ?? throw new ArgumentNullException(nameof(path4)))

			).ToString();
		public static string Join(string? path1, string? path2, string? path3, string? path4) =>
			new UniPath(path1 ?? throw new ArgumentNullException(nameof(path1)))
			.JoinWith(
				path2: new UniPath(path2 ?? throw new ArgumentNullException(nameof(path2))),
				path3: new UniPath(path3 ?? throw new ArgumentNullException(nameof(path3))),
				path4: new UniPath(path4 ?? throw new ArgumentNullException(nameof(path4)))
				
			).ToString();

		public static string Join(TContext context, params string?[] paths)
		{
			if (paths.Length == 0) return "";
			List<string> selPaths = [];
			if (paths.Any(v => v == null)) throw new ArgumentException("Null element encountered.", nameof(paths));
			return new UniPath(context, System.IO.Path.Join(paths!)).ToString();
		}
		public static string Join(params string?[] paths)
		{
			if (paths.Length == 0) return "";
			List<string> selPaths = [];
			if (paths.Any(v => v == null)) throw new ArgumentException("Null element encountered.", nameof(paths));
			return new UniPath(System.IO.Path.Join(paths!)).ToString();
		}

		#endregion

		public static string GetRelativePath(TContext context, string relativeTo, string path) => new UniPath(context, path).GetRelativePath(
			relativeTo: new UniPath(context, relativeTo)
		).ToString();
		public static string GetRelativePath(string relativeTo, string path) => new UniPath(path).GetRelativePath(
			relativeTo: new UniPath(relativeTo)
		).ToString();

		public static string TrimEndingDirectorySeparator(TContext context, string path) => System.IO.Path.TrimEndingDirectorySeparator(
			path: new UniPath(context, path).ToString()
		);
		public static string TrimEndingDirectorySeparator(string path) => System.IO.Path.TrimEndingDirectorySeparator(
			path: new UniPath(path).ToString()
		);

		public static bool EndsInDirectorySeparator(string? path) 
			=> System.IO.Path.EndsInDirectorySeparator(path: path ?? throw new ArgumentNullException(nameof(path)));

		public static string GetFullPath(TContext context, string path) 
			=> new UniPath(context, path).GetFullPath().ToString();
		public static string GetFullPath(string path)
			=> new UniPath(path).GetFullPath().ToString();

		public static string GetFullPath(TContext context, string path, string basePath) 
			=> new UniPath(context, path).GetFullPath(new UniPath(context, basePath)).ToString();
		public static string GetFullPath(string path, string basePath)
			=> new UniPath(path).GetFullPath(new UniPath(basePath)).ToString();

		public static string GetTempPath(TContext context)
			=> new UniPath(context, System.IO.Path.GetTempPath()).ToString();
		public static string GetTempPath() 
			=> new UniPath(System.IO.Path.GetTempPath()).ToString();

		public static string GetTempFileName() => System.IO.Path.GetTempFileName();

		public static bool IsPathRooted(string? path) => System.IO.Path.IsPathRooted(path ?? throw new ArgumentNullException(nameof(path)));

		public static string GetPathRoot(TContext context, string? path) =>
			new UniPath(context, path ?? throw new ArgumentNullException(nameof(path))).RootDir.ToString();
		public static string GetPathRoot(string? path) =>
			new UniPath(path ?? throw new ArgumentNullException(nameof(path))).RootDir.ToString();

		#endregion
	}
}