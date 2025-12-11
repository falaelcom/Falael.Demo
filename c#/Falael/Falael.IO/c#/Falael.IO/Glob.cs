//	R0Q4/daniel/
//	- stub, not implemented
//		- conceived to work around the limitations of `Microsoft.Extensions.FileSystemGlobbing.*` - fails with relative Paths that resolve below the level of the specified 
//		- the code is AI generated madness
//		- see `Falael.Utility.RsUtils.Rsq.Program.Main` for a playground area used to research and design the correct implementation for this class
//	- this attempt partially overlaps with `Falael.Utility.RsUtils.Rsq.FileSystemSearchQuery`; both `Falael.Utility.RsUtils.Rsq.FileSystemSearchQuery` and `Falael.IO.Glob` must be revised.
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

namespace Falael.IO
{
	public class Glob
	{
		public async Task GlobAsync(string basePath, string[] includeGlobs, string[] excludeGlobs, Action<string, string> match, CancellationToken cancellationToken = default)
		{
			var root = this.GetExecuteRoot(includeGlobs, basePath);
			var matcher = new Matcher();

			foreach (var glob in includeGlobs)
			{
				var normalized = this.NormalizeGlobToRoot(glob, root, basePath, out _);
				matcher.AddInclude(normalized);
			}

			foreach (var glob in excludeGlobs)
			{
				var normalized = this.NormalizeGlobToRoot(glob, root, basePath, out _);
				matcher.AddExclude(normalized);
			}

			var outcome = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(root)));

			foreach (var fileMatch in outcome.Files)
			{
				cancellationToken.ThrowIfCancellationRequested();

				var fullPath = fileMatch.Path;
				var originalGlob = includeGlobs[0]; // You'd need to track which glob matched
				var stem = this.CalculateRealStem(fullPath, originalGlob, root, basePath);

				match(fullPath, stem);
				await Task.Yield();
			}
		}

		public bool IsMatch(string fullPath, string[] includeGlobs, string[]? excludeGlobs = null)
		{
			var matcher = new Matcher();

			foreach (var glob in includeGlobs)
				matcher.AddInclude(glob);

			if (excludeGlobs != null)
				foreach (var glob in excludeGlobs)
					matcher.AddExclude(glob);

			var result = matcher.Match(fullPath);
			return result.HasMatches;
		}

		string GetExecuteRoot(string[] globs, string basePath)
		{
			// Check if any glob has a drive/root path
			foreach (var glob in globs)
			{
				if (System.IO.Path.IsPathRooted(glob))
				{
					var globRoot = System.IO.Path.GetPathRoot(glob);
					if (!string.IsNullOrEmpty(globRoot))
						return globRoot;
				}
			}

			// Fallback: get drive root from basePath, or current drive
			var baseRoot = System.IO.Path.GetPathRoot(basePath);
			if (!string.IsNullOrEmpty(baseRoot))
				return baseRoot;

			return System.IO.Path.GetPathRoot(Directory.GetCurrentDirectory()) ?? (Environment.OSVersion.Platform == PlatformID.Unix ? "/" : @"C:\");
		}

		string NormalizeGlobToRoot(string originalGlob, string executeRoot, string basePath, out string addedPrefix)
		{
			addedPrefix = "";

			if (System.IO.Path.IsPathRooted(originalGlob))
			{
				// "C:\temp\**\*.txt" -> "temp/**/*.txt"
				var relativePath = System.IO.Path.GetRelativePath(executeRoot, originalGlob);
				return relativePath.Replace('\\', '/');
			}
			else if (originalGlob.StartsWith("../"))
			{
				// "../docs/*" -> resolve to absolute, then make relative to executeRoot
				var resolvedPath = System.IO.Path.GetFullPath(System.IO.Path.Combine(basePath, originalGlob));
				var relativePath = System.IO.Path.GetRelativePath(executeRoot, resolvedPath);

				// Calculate what we effectively prepended
				var baseRelativeToRoot = System.IO.Path.GetRelativePath(executeRoot, basePath);
				addedPrefix = baseRelativeToRoot;

				return relativePath.Replace('\\', '/');
			}
			else
			{
				// Regular relative pattern like "**/*.txt"
				var resolvedPath = System.IO.Path.GetFullPath(System.IO.Path.Combine(basePath, originalGlob));
				var relativePath = System.IO.Path.GetRelativePath(executeRoot, resolvedPath);

				var baseRelativeToRoot = System.IO.Path.GetRelativePath(executeRoot, basePath);
				addedPrefix = baseRelativeToRoot;

				return relativePath.Replace('\\', '/');
			}
		}

		string CalculateRealStem(string resultPath, string originalGlob, string executeRoot, string basePath)
		{
			// Get the path relative to executeRoot
			var relativePath = System.IO.Path.GetRelativePath(executeRoot, resultPath);
			var relativeNormalized = relativePath.Replace('\\', '/');

			if (System.IO.Path.IsPathRooted(originalGlob))
			{
				// For absolute globs, stem is relative to the glob's directory part
				var globDir = System.IO.Path.GetDirectoryName(originalGlob) ?? "";
				if (!string.IsNullOrEmpty(globDir))
				{
					var globDirRelative = System.IO.Path.GetRelativePath(executeRoot, globDir);
					var globDirNormalized = globDirRelative.Replace('\\', '/');

					if (relativeNormalized.StartsWith(globDirNormalized + "/"))
						return relativeNormalized.Substring(globDirNormalized.Length + 1);
				}
				return relativeNormalized;
			}
			else if (originalGlob.StartsWith("../"))
			{
				// For ../ patterns, calculate how many levels up
				var parts = originalGlob.Split('/');
				var dotDotCount = parts.TakeWhile(p => p == "..").Count();

				// Get the base path relative to executeRoot
				var baseRelative = System.IO.Path.GetRelativePath(executeRoot, basePath);
				var baseNormalized = baseRelative.Replace('\\', '/');

				// Build the stem with appropriate ../
				var stemParts = new List<string>();
				for (int i = 0; i < dotDotCount; i++)
					stemParts.Add("..");

				// Add the part after the ../ portions
				var remainingGlob = string.Join("/", parts.Skip(dotDotCount));
				if (!string.IsNullOrEmpty(remainingGlob) && remainingGlob != "*" && remainingGlob != "**")
				{
					var globPattern = remainingGlob.Replace("*", "").Replace("?", "").Trim('/');
					if (!string.IsNullOrEmpty(globPattern))
					{
						// Remove the pattern part from result to get clean stem
						var resultWithoutPattern = relativeNormalized;
						if (resultWithoutPattern.Contains(baseNormalized))
						{
							var afterBase = resultWithoutPattern.Substring(resultWithoutPattern.IndexOf(baseNormalized));
							stemParts.Add(afterBase);
						}
						else
						{
							stemParts.Add(relativeNormalized);
						}
					}
					else
					{
						stemParts.Add(relativeNormalized);
					}
				}
				else
				{
					stemParts.Add(relativeNormalized);
				}

				return string.Join("/", stemParts);
			}
			else
			{
				// Regular relative pattern - stem is relative to basePath
				var baseRelative = System.IO.Path.GetRelativePath(executeRoot, basePath);
				var baseNormalized = baseRelative.Replace('\\', '/');

				if (relativeNormalized.StartsWith(baseNormalized + "/"))
					return relativeNormalized.Substring(baseNormalized.Length + 1);

				return relativeNormalized;
			}
		}
	}
}
