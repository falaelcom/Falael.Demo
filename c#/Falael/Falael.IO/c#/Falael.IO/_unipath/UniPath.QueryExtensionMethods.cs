//	R0Q4/daniel/
//	TODO:
//	- int HasEmptyDirectories-family, replace `path.EnumerateFiles(ignoreFileGlob).Count() == path.EnumerateFiles().Count()` with sth more optimized, requires interface changes

using System.Reflection.Metadata;

using static Falael.UniPath;

namespace Falael.IO
{
	[Flags]
	public enum FileSystemEntryTypes
	{
		Files = 1,
		Directories = 2,
		All = Files | Directories,
	}

	public enum SyncStatus
	{
		Pristine,
		Dirty,
		Synced,
	}

	public static class UniPath2_QueryExtensionMethods
	{
		//	prioritiy:
		//	- hasDirty - top priority - not synced, but also not pristine
		//		- when syncing - needs work
		//		- when reverting - needs work
		//	- hasPristine - not synced (untouched)
		//		- when syncing - needs work
		//		- when reverting - up-to-date
		//	- hasSynced - synced (fully)
		//		- when syncing - up-to-date
		//		- when reverting - needs work
		/// <returns>If <paramref name="syncStates"/> is empty returns <see cref="SyncStatus.Pristine"/>, otherwise returns a value according to the above priorities.</returns>
		public static SyncStatus Combine(this IEnumerable<SyncStatus> syncStates)
		{
			bool hasPristine = false;
			bool hasSynced = false;

			foreach (SyncStatus syncState in syncStates)
			{
				switch (syncState)
				{
					case SyncStatus.Pristine:
						hasPristine = true;
						continue;
					case SyncStatus.Dirty:
						//	a single dirty is enough to treat the whole as dirty
						return SyncStatus.Dirty;
					case SyncStatus.Synced:
						hasSynced = true;
						continue;
					default: throw new NotImplementedException(syncState.ToString());
				}
			}

			if (hasSynced)
			{
				if (hasPristine) return SyncStatus.Dirty;            //	some in sync, some pristine = dirty
				return SyncStatus.Synced;                            //	some in sync, no pristine, no dirty = in sync
			}
			
			return SyncStatus.Pristine;                              //	(if only pristine)
																	//	or
																	//	(no pristine, no dirty, no in sync = empty syncStates)
																	//	= pristine, by convention
		}

		#region ToPath

		public static UniPath ToPath(this string[] strs, TContext context) => new(context, strs);

		public static UniPath ToPath(this string[] strs) => new(strs);

		public static UniPath ToPath(this string str, TContext context, bool denotesFile) => new(context, denotesFile, str);

		public static UniPath ToPath(this string str, TContext context) => new(context, str);

		public static UniPath ToPath(this string str, bool denotesFile) => new(denotesFile, str);

		public static UniPath ToPath(this string str) => new(str);

		#endregion

		#region ToPathFilter(s)

		public static IEnumerable<PathFilter> ToPathFilters(this IEnumerable<string?> strs, bool patternIsGlob = true) => [.. strs.Select(str => new PathFilter() { Pattern = str, UsePatternMatching = patternIsGlob })];

		public static PathFilter ToPathFilter(this string? str, bool patternIsGlob = true) => new() { Pattern = str, UsePatternMatching = patternIsGlob };

		#endregion

		#region HasFileSystemEntries, HasFiles, HasDirectories, HasEmptyDirectories

		public static bool HasFileSystemEntries(this UniPath path, bool recursive = false) => path.EnumerateSubPaths(recursive).Any();

		public static bool HasFileSystemEntries(this UniPath path, FileSystemEntryTypes selector, bool recursive = false) => path.EnumerateSubPaths(selector, recursive).Any();

		public static bool HasFileSystemEntries(this UniPath path, string glob, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false) => path.EnumerateSubPaths(glob, selector, recursive).Any();

		public static bool HasFileSystemEntries(this UniPath path, IEnumerable<string?> globs, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false) => path.EnumerateSubPaths(globs, selector, recursive).Any();

		public static bool HasFileSystemEntries(this UniPath path, PathFilter filter, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false) => path.EnumerateSubPaths(filter, selector, recursive).Any();

		public static bool HasFileSystemEntries(this UniPath path, IEnumerable<PathFilter> filters, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false) => path.EnumerateSubPaths(filters, selector, recursive).Any();

		public static bool HasFiles(this UniPath path) => path.EnumerateSubPaths(FileSystemEntryTypes.All).Any();

		public static bool HasFiles(this UniPath path, bool recursive) => path.EnumerateSubPaths(FileSystemEntryTypes.Files, recursive).Any();
		
		public static bool HasFiles(this UniPath path, string glob, bool recursive = false) => path.EnumerateSubPaths(glob, FileSystemEntryTypes.Files, recursive).Any();

		public static bool HasFiles(this UniPath path, IEnumerable<string?> globs, bool recursive = false) => path.EnumerateSubPaths(globs, FileSystemEntryTypes.Files, recursive).Any();

		public static bool HasFiles(this UniPath path, PathFilter filter, bool recursive = false) => path.EnumerateSubPaths(filter, FileSystemEntryTypes.Files, recursive).Any();

		public static bool HasFiles(this UniPath path, IEnumerable<PathFilter> filters, bool recursive = false) => path.EnumerateSubPaths(filters, FileSystemEntryTypes.Files, recursive).Any();

		public static bool HasDirectories(this UniPath path) => path.EnumerateSubPaths(FileSystemEntryTypes.Directories).Any();

		public static bool HasDirectories(this UniPath path, bool recursive) => path.EnumerateSubPaths(FileSystemEntryTypes.Directories, recursive).Any();

		public static bool HasDirectories(this UniPath path, string glob, bool recursive = false) => path.EnumerateSubPaths(glob, FileSystemEntryTypes.Directories, recursive).Any();

		public static bool HasDirectories(this UniPath path, IEnumerable<string?> globs, bool recursive = false) => path.EnumerateSubPaths(globs, FileSystemEntryTypes.Directories, recursive).Any();

		public static bool HasDirectories(this UniPath path, PathFilter filter, bool recursive = false) => path.EnumerateSubPaths(filter, FileSystemEntryTypes.Directories, recursive).Any();

		public static bool HasDirectories(this UniPath path, IEnumerable<PathFilter> filters, bool recursive = false) => path.EnumerateSubPaths(filters, FileSystemEntryTypes.Directories, recursive).Any();

		public static bool HasEmptyDirectories(this UniPath path)
		{
			if (!path.IsDirectory()) return false;
			if (!path.HasFileSystemEntries()) return true;
			return false;
		}

		public static bool HasEmptyDirectories(this UniPath path, bool recursive)
		{
			if (!path.IsDirectory()) return false;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) if(HasEmptyDirectories(subDir, recursive: true)) return true;
			if (!path.HasFileSystemEntries()) return true;
			return false;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool HasEmptyDirectories(this UniPath path, string ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return false;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) if(HasEmptyDirectories(subDir, ignoreFileGlob, recursive: true)) return true;
			if (!path.HasDirectories() && path.EnumerateFiles(ignoreFileGlob).Count() == path.EnumerateFiles().Count()) return true;
			return false;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool HasEmptyDirectories(this UniPath path, IEnumerable<string?> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return false;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) if(HasEmptyDirectories(subDir, ignoreFileGlobs, recursive: true)) return true;
			if (!path.HasDirectories() && path.EnumerateFiles(ignoreFileGlobs).Count() == path.EnumerateFiles().Count()) return true;
			return false;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool HasEmptyDirectories(this UniPath path, PathFilter ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return false;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) if (HasEmptyDirectories(subDir, ignoreFileGlob, recursive: true)) return true;
			if (!path.HasDirectories() && path.EnumerateFiles(ignoreFileGlob).Count() == path.EnumerateFiles().Count()) path.DeleteAsDirectory(recursive: true);
			return false;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool HasEmptyDirectories(this UniPath path, IEnumerable<PathFilter> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return false;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) if(HasEmptyDirectories(subDir, ignoreFileGlobs, recursive: true)) return true;
			if (!path.HasDirectories() && path.EnumerateFiles(ignoreFileGlobs).Count() == path.EnumerateFiles().Count()) path.DeleteAsDirectory(recursive: true);
			return false;
		}


		public static bool IsDirectoryTreeEmpty(this UniPath path)
		{
			if (!path.IsDirectory()) return false;
			return !path.HasFileSystemEntries();
		}

		public static bool IsDirectoryTreeEmpty(this UniPath path, bool recursive)
		{
			if (!path.IsDirectory()) return false;
			if (recursive)
			{
				if (path.HasFiles()) return false;
				foreach (var subDir in path.EnumerateDirectories()) if (!IsDirectoryTreeEmpty(subDir, recursive: true)) return false;
				return true;
			}
			return !path.HasFileSystemEntries();
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool IsDirectoryTreeEmpty(this UniPath path, string ignoreFileGlob, bool recursive = true)
		{
			if (!path.IsDirectory()) return false;
			if (recursive)
			{
				if (path.HasFiles(ignoreFileGlob)) return false;
				foreach (var subDir in path.EnumerateDirectories()) if (!IsDirectoryTreeEmpty(subDir, ignoreFileGlob, recursive: true)) return false;
				return true;
			}
			return !path.HasDirectories() && !path.HasFiles(ignoreFileGlob);
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool IsDirectoryTreeEmpty(this UniPath path, IEnumerable<string?> ignoreFileGlobs, bool recursive = true)
		{
			if (!path.IsDirectory()) return false;
			if (recursive)
			{
				if (path.HasFiles(ignoreFileGlobs)) return false;
				foreach (var subDir in path.EnumerateDirectories()) if (!IsDirectoryTreeEmpty(subDir, ignoreFileGlobs, recursive: true)) return false;
				return true;
			}
			return !path.HasDirectories() && !path.HasFiles(ignoreFileGlobs);
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool IsDirectoryTreeEmpty(this UniPath path, PathFilter ignoreFileGlob, bool recursive = true)
		{
			if (!path.IsDirectory()) return false;
			if (recursive)
			{
				if (path.HasFiles(ignoreFileGlob)) return false;
				foreach (var subDir in path.EnumerateDirectories()) if (!IsDirectoryTreeEmpty(subDir, ignoreFileGlob, recursive: true)) return false;
				return true;
			}
			return !path.HasDirectories() && !path.HasFiles(ignoreFileGlob);
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, otherwise only directories containing no files are considered empty.</param>
		public static bool IsDirectoryTreeEmpty(this UniPath path, IEnumerable<PathFilter> ignoreFileGlobs, bool recursive = true)
		{
			if (!path.IsDirectory()) return false;
			if (recursive)
			{
				if (path.HasFiles(ignoreFileGlobs)) return false;
				foreach (var subDir in path.EnumerateDirectories()) if (!IsDirectoryTreeEmpty(subDir, ignoreFileGlobs, recursive: true)) return false;
				return true;
			}
			return !path.HasDirectories() && !path.HasFiles(ignoreFileGlobs);
		}

		#endregion

		#region EnumerateSubPaths, EnumerateFiles, EnumerateDirectories

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path) => path.EnumerateSubPaths(FileSystemEntryTypes.All, recursive: false);

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, bool recursive) => path.EnumerateSubPaths(FileSystemEntryTypes.All, recursive);

		public static IEnumerable<UniPath> EnumerateFiles(this UniPath path, bool recursive = false) => path.EnumerateSubPaths(FileSystemEntryTypes.Files, recursive);

		public static IEnumerable<UniPath> EnumerateDirectories(this UniPath path, bool recursive = false) => path.EnumerateSubPaths(FileSystemEntryTypes.Directories, recursive);

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false)
		{
			switch (selector)
			{
				case FileSystemEntryTypes.Files:
					return Directory.EnumerateFiles(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v));
				case FileSystemEntryTypes.Directories:
					return Directory.EnumerateDirectories(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v));
				case FileSystemEntryTypes.All:
					return Directory.EnumerateFileSystemEntries(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v));
				default: throw new NotImplementedException(selector.ToString());
			}
		}


		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, string glob, bool recursive = false) => path.EnumerateSubPaths(glob, FileSystemEntryTypes.All, recursive);

		public static IEnumerable<UniPath> EnumerateFiles(this UniPath path, string glob, bool recursive = false) => path.EnumerateSubPaths(glob, FileSystemEntryTypes.Files, recursive);

		public static IEnumerable<UniPath> EnumerateDirectories(this UniPath path, string glob, bool recursive = false) => path.EnumerateSubPaths(glob, FileSystemEntryTypes.Directories, recursive);

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, string glob, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false)
		{
			switch (selector)
			{
				case FileSystemEntryTypes.Files:
					return Directory.EnumerateFiles(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(glob));
				case FileSystemEntryTypes.Directories:
					return Directory.EnumerateDirectories(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(glob));
				case FileSystemEntryTypes.All:
					return Directory.EnumerateFileSystemEntries(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(glob));
				default: throw new NotImplementedException(selector.ToString());
			}
		}


		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, IEnumerable<string?> globs, bool recursive = false) => path.EnumerateSubPaths(globs, FileSystemEntryTypes.All, recursive);

		public static IEnumerable<UniPath> EnumerateFiles(this UniPath path, IEnumerable<string?> globs, bool recursive = false) => path.EnumerateSubPaths(globs, FileSystemEntryTypes.Files, recursive);

		public static IEnumerable<UniPath> EnumerateDirectories(this UniPath path, IEnumerable<string?> globs, bool recursive = false) => path.EnumerateSubPaths(globs, FileSystemEntryTypes.Directories, recursive);

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, IEnumerable<string?> globs, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false)
		{
			switch (selector)
			{
				case FileSystemEntryTypes.Files:
					return Directory.EnumerateFiles(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(globs));
				case FileSystemEntryTypes.Directories:
					return Directory.EnumerateDirectories(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(globs));
				case FileSystemEntryTypes.All:
					return Directory.EnumerateFileSystemEntries(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(globs));
				default: throw new NotImplementedException(selector.ToString());
			}
		}


		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, PathFilter filter, bool recursive = false) => path.EnumerateSubPaths(filter, FileSystemEntryTypes.All, recursive);

		public static IEnumerable<UniPath> EnumerateFiles(this UniPath path, PathFilter filter, bool recursive = false) => path.EnumerateSubPaths(filter, FileSystemEntryTypes.Files, recursive);

		public static IEnumerable<UniPath> EnumerateDirectories(this UniPath path, PathFilter filter, bool recursive = false) => path.EnumerateSubPaths(filter, FileSystemEntryTypes.Directories, recursive);

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, PathFilter filter, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false)
		{
			switch (selector)
			{
				case FileSystemEntryTypes.Files:
					return Directory.EnumerateFiles(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(filter));
				case FileSystemEntryTypes.Directories:
					return Directory.EnumerateDirectories(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(filter));
				case FileSystemEntryTypes.All:
					return Directory.EnumerateFileSystemEntries(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(filter));
				default: throw new NotImplementedException(selector.ToString());
			}
		}


		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, IEnumerable<PathFilter> filters, bool recursive = false) => path.EnumerateSubPaths(filters, FileSystemEntryTypes.All, recursive);

		public static IEnumerable<UniPath> EnumerateFiles(this UniPath path, IEnumerable<PathFilter> filters, bool recursive = false) => path.EnumerateSubPaths(filters, FileSystemEntryTypes.Files, recursive);

		public static IEnumerable<UniPath> EnumerateDirectories(this UniPath path, IEnumerable<PathFilter> filters, bool recursive = false) => path.EnumerateSubPaths(filters, FileSystemEntryTypes.Directories, recursive);

		public static IEnumerable<UniPath> EnumerateSubPaths(this UniPath path, IEnumerable<PathFilter> filters, FileSystemEntryTypes selector = FileSystemEntryTypes.All, bool recursive = false)
		{
			switch (selector)
			{
				case FileSystemEntryTypes.Files:
					return Directory.EnumerateFiles(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(filters));
				case FileSystemEntryTypes.Directories:
					return Directory.EnumerateDirectories(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(filters));
				case FileSystemEntryTypes.All:
					return Directory.EnumerateFileSystemEntries(path, "*", recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)
						.Select(v => path.NewReuseContext(v))
						.Where(v => v.IsMatch(filters));
				default: throw new NotImplementedException(selector.ToString());
			}
		}

		#endregion

		#region Ensure*, Create*, Copy*, Delete*

		public static UniPath EnsureDirectory(this UniPath path) => path.CreateAsDirectory();

		public static UniPath DeleteAsDirectory(this UniPath path, bool recursive = false)
		{
			Directory.Delete(path, recursive);
			return path;
		}

		public static UniPath DeleteAsFile(this UniPath path)
		{
			File.Delete(path);
			return path;
		}

		public static UniPath CreateAsDirectory(this UniPath path)
		{
			Directory.CreateDirectory(path);
			return path;
		}

		public static void CopyAsFile(this UniPath sourcePath, UniPath destPath, bool overwrite = false)
		{
			Directory.CreateDirectory(destPath.GetDirectoryPath());
			File.Copy(sourcePath, destPath, overwrite);
		}

		public static UniPath CopyAsFileWithSource(this UniPath sourcePath, UniPath destPath, bool overwrite = false)
		{
			Directory.CreateDirectory(destPath.GetDirectoryPath());
			File.Copy(sourcePath, destPath, overwrite);
			return sourcePath;
		}

		public static UniPath CopyAsFileWithDestination(this UniPath sourcePath, UniPath destPath, bool overwrite = false)
		{
			Directory.CreateDirectory(destPath.GetDirectoryPath());
			File.Copy(sourcePath, destPath, overwrite);
			return destPath;
		}

		public static void CopyAsDirectory(this UniPath sourceBasePath, UniPath destBasePath, bool overwrite = false)
		{
			var sourcePaths = sourceBasePath.EnumerateSubPaths(recursive: true);
			foreach (var path in sourcePaths)
			{
				var sourceRelPath = path.GetRelativePath(sourceBasePath);
				var destPath = destBasePath.CombineWith(sourceRelPath);
				Directory.CreateDirectory(destPath.GetDirectoryPath());
				File.Copy(sourceBasePath.CombineWith(sourceRelPath), destPath, overwrite);
			}
		}

		public static IEnumerable<UniPath> CopyAsDirectoryWithSource(this UniPath sourceBasePath, UniPath destBasePath, bool overwrite = false)
		{
			var sourcePaths = sourceBasePath.EnumerateSubPaths(recursive: true);
			foreach (var path in sourcePaths)
			{
				var sourceRelPath = path.GetRelativePath(sourceBasePath);
				var destPath = destBasePath.CombineWith(sourceRelPath);
				Directory.CreateDirectory(destPath.GetDirectoryPath());
				File.Copy(sourceBasePath.CombineWith(sourceRelPath), destPath, overwrite);
			}
			return sourcePaths;
		}

		public static IEnumerable<UniPath> CopyAsDirectoryWithDestination(this UniPath sourceBasePath, UniPath destBasePath, bool overwrite = false)
		{
			var sourcePaths = sourceBasePath.EnumerateSubPaths(recursive: true);
			var destPaths = new List<UniPath>();
			foreach (var path in sourcePaths)
			{
				var sourceRelPath = path.GetRelativePath(sourceBasePath);
				var destPath = destBasePath.CombineWith(sourceRelPath);
				destPaths.Add(destPath);
				Directory.CreateDirectory(destPath.GetDirectoryPath());
				File.Copy(sourceBasePath.CombineWith(sourceRelPath), destPath, overwrite);
			}
			return destPaths;
		}

		public static IEnumerable<UniPath> EnsureDirectories(this IEnumerable<UniPath> paths, bool leavesAreDirectories = false) => paths.Select(v =>
		{
			if (leavesAreDirectories) Directory.CreateDirectory(v);
			else Directory.CreateDirectory(v.GetParentDirectory());
			return v;
		});

		public static IEnumerable<UniPath> CopyToWithSource(this IEnumerable<UniPath> paths, UniPath baseDir, UniPath destinationDir, bool overwrite = false) => paths.Select(v =>
		{
			if (!v.IsRelativeTo(baseDir)) throw new InvalidOperationException($"\"{v}\" must be a subdirectory of \"{baseDir}\"");
			var sourceRelativePath = v.GetRelativePath(baseDir);
			var sourceFullPath = v.GetFullPath(baseDir);
			var destinationFullPath = destinationDir.CombineWith(sourceRelativePath);
			if (File.Exists(sourceFullPath))
			{
				Directory.CreateDirectory(destinationFullPath.GetParentDirectory());
				File.Copy(sourceFullPath, destinationFullPath, overwrite);
			}
			else if (Directory.Exists(sourceFullPath)) Directory.CreateDirectory(destinationFullPath);
			return destinationFullPath;
		});

		public static IEnumerable<UniPath> CopyToWithDestination(this IEnumerable<UniPath> paths, UniPath baseDir, UniPath destinationDir, bool overwrite = false) => paths.Select(v =>
		{
			if (!v.IsRelativeTo(baseDir)) throw new InvalidOperationException($"\"{v}\" must be a subdirectory of \"{baseDir}\"");
			var sourceRelativePath = v.GetRelativePath(baseDir);
			var sourceFullPath = v.GetFullPath(baseDir);
			var destinationFullPath = destinationDir.CombineWith(sourceRelativePath);
			if (File.Exists(sourceFullPath))
			{
				Directory.CreateDirectory(destinationFullPath.GetParentDirectory());
				File.Copy(sourceFullPath, destinationFullPath, overwrite);
			}
			else if (Directory.Exists(sourceFullPath)) Directory.CreateDirectory(destinationFullPath);
			return v;
		});

		public static IEnumerable<UniPath> DeleteAsFiles(this IEnumerable<UniPath> paths) => paths
			.Select(v =>
			{
				if (File.Exists(v)) File.Delete(v);
				return v;
			});

		#endregion

		#region Purge*

		public static UniPath PurgeEmptyDirectories(this UniPath path)
		{
			if (!path.IsDirectory()) return path;
			if (!path.HasFileSystemEntries()) path.DeleteAsDirectory(recursive: true);
			return path;
		}

		public static UniPath PurgeEmptyDirectories(this UniPath path, bool recursive)
		{
			if (!path.IsDirectory()) return path;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) PurgeEmptyDirectories(subDir, recursive: true);
			if (!path.HasFileSystemEntries()) path.DeleteAsDirectory(recursive: true);
			return path;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static UniPath PurgeEmptyDirectories(this UniPath path, string ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return path;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) PurgeEmptyDirectories(subDir, ignoreFileGlob, recursive: true);
			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlob)) path.DeleteAsDirectory(recursive: true);
			return path;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static UniPath PurgeEmptyDirectories(this UniPath path, IEnumerable<string?> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return path;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) PurgeEmptyDirectories(subDir, ignoreFileGlobs, recursive: true);
			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlobs)) path.DeleteAsDirectory(recursive: true);
			return path;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static UniPath PurgeEmptyDirectories(this UniPath path, PathFilter ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return path;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) PurgeEmptyDirectories(subDir, ignoreFileGlob, recursive: true);
			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlob)) path.DeleteAsDirectory(recursive: true);
			return path;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static UniPath PurgeEmptyDirectories(this UniPath path, IEnumerable<PathFilter> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return path;
			if (recursive) foreach (var subDir in path.EnumerateDirectories()) PurgeEmptyDirectories(subDir, ignoreFileGlobs, recursive: true);
			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlobs)) path.DeleteAsDirectory(recursive: true);
			return path;
		}


		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithDeleted(this UniPath path)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (!path.HasFileSystemEntries())
			{
				path.DeleteAsDirectory(recursive: true);
				result.Add(path);
			}

			return result;
		}

		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithDeleted(this UniPath path, bool recursive)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithDeleted(subDir, recursive: true));

			if (!path.HasFileSystemEntries())
			{
				path.DeleteAsDirectory(recursive: true);
				result.Add(path);
			}

			return result;
		}


		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithDeleted(this UniPath path, string ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithDeleted(subDir, ignoreFileGlob, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlob))
			{
				path.DeleteAsDirectory(recursive: true);
				result.Add(path);
			}

			return result;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithDeleted(this UniPath path, IEnumerable<string?> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithDeleted(subDir, ignoreFileGlobs, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlobs))
			{
				path.DeleteAsDirectory(recursive: true);
				result.Add(path);
			}

			return result;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithDeleted(this UniPath path, PathFilter ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithDeleted(subDir, ignoreFileGlob, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlob))
			{
				path.DeleteAsDirectory(recursive: true);
				result.Add(path);
			}

			return result;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithDeleted(this UniPath path, IEnumerable<PathFilter> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithDeleted(subDir, ignoreFileGlobs, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlobs))
			{
				path.DeleteAsDirectory(recursive: true);
				result.Add(path);
			}

			return result;
		}


		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithKept(this UniPath path)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (!path.HasFileSystemEntries()) path.DeleteAsDirectory(recursive: true);
			else result.Add(path);

			return result;
		}

		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithKept(this UniPath path, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithKept(subDir, recursive: true));

			if (!path.HasFileSystemEntries()) path.DeleteAsDirectory(recursive: true);
			else result.Add(path);

			return result;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithKept(this UniPath path, string ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithKept(subDir, ignoreFileGlob, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlob)) path.DeleteAsDirectory(recursive: true);
			else result.Add(path);

			return result;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithKept(this UniPath path, IEnumerable<string?> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithKept(subDir, ignoreFileGlobs, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlobs)) path.DeleteAsDirectory(recursive: true);
			else result.Add(path);

			return result;
		}

		/// <param name="ignoreFileGlob">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithKept(this UniPath path, PathFilter ignoreFileGlob, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithKept(subDir, ignoreFileGlob, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlob)) path.DeleteAsDirectory(recursive: true);
			else result.Add(path);

			return result;
		}

		/// <param name="ignoreFileGlobs">If present, this parameter considers a directory empty if it contains only matching files, ignoring and deleting any other files, otherwise only directories containing no files are deleted.</param>
		public static IEnumerable<UniPath> PurgeEmptyDirectoriesWithKept(this UniPath path, IEnumerable<PathFilter> ignoreFileGlobs, bool recursive = false)
		{
			if (!path.IsDirectory()) return [];

			var result = new List<UniPath>();

			if (recursive) foreach (var subDir in path.EnumerateDirectories()) result.AddRange(PurgeEmptyDirectoriesWithKept(subDir, ignoreFileGlobs, recursive: true));

			if (!path.HasDirectories() && !path.HasFiles(ignoreFileGlobs)) path.DeleteAsDirectory(recursive: true);
			else result.Add(path);

			return result;
		}

		#endregion

		#region Sync

		public static SyncStatus GetSyncState(this UniPath targetPath, UniPath referencePath, string glob, bool recursive = false)
		{
			if (!referencePath.Exists() && !targetPath.Exists()) return SyncStatus.Synced;          //	syncing non-existing reference over non-existing target - in sync

			if (referencePath.IsFile())
			{
				if (!referencePath.IsMatch(glob)) 
					throw new InvalidOperationException("Must match glob");
				if (targetPath.IsFile()) return referencePath.TimesEqual(targetPath)                //	syncing 2 files
						? SyncStatus.Synced															//	- times equal - in sync
						: SyncStatus.Dirty;                                                          //	- times differ - dirty
				if (targetPath.Exists())                                                            //	syncing reference file over target directory - invalid
					throw new InvalidOperationException("Must match fs entry type (1)");
				return SyncStatus.Pristine;															//	syncing reference file over non-existing target - target pristine
			}

			if (!referencePath.Exists()) return SyncStatus.Dirty;									//	syncing non-existing reference over existing target - target dirty
			if (!targetPath.Exists()) return SyncStatus.Pristine;									//	syncing existing reference directory over non-existing target - target pristine
			if (targetPath.IsFile())                                                                //	syncing reference directory over target file - invalid
				throw new InvalidOperationException("Must match fs entry type (2)");

			//	syncing reference directory over target directory

			HashSet<UniPath> sourceFiles = [.. referencePath.EnumerateFiles(glob, recursive).ToRelativePaths(referencePath)];
			HashSet<UniPath> destFiles = [.. targetPath.EnumerateFiles(glob, recursive).ToRelativePaths(targetPath)];

			if (destFiles.Count == 0) return SyncStatus.Pristine;                                    //	no globbed files in target - target pristine
			if (destFiles.Except(sourceFiles).Any()) return SyncStatus.Dirty;                        //	extra files in target - target dirty

			var disappearedTargetFileCount = 0;
			foreach (var relPath in sourceFiles)
			{
				var sourceFullPath = relPath.GetFullPath(referencePath);
				if (!sourceFullPath.Exists()) return SyncStatus.Dirty;                               //	reference file disappeared, extra files in target - target dirty

				var destFullPath = relPath.GetFullPath(targetPath);
				if (!destFullPath.Exists())                                                          //	target file disappeared - one less file in dest
				{
					++disappearedTargetFileCount;
					if (destFiles.Count - disappearedTargetFileCount == 0)                           //	no more globbed files in target - target pristine
						return SyncStatus.Pristine;
				}

				if (sourceFullPath.TimesEqual(destFullPath)) continue;

				return SyncStatus.Dirty;															 //	files have different time - target dirty
			}

			return SyncStatus.Synced;
		}


		public static (IEnumerable<UniPath> created, IEnumerable<UniPath> updated, IEnumerable<UniPath> deleted) Sync(this UniPath targetPath, UniPath referencePath) => Sync(targetPath, referencePath, Array.Empty<PathFilter>(), recursive: false);

		public static (IEnumerable<UniPath> created, IEnumerable<UniPath> updated, IEnumerable<UniPath> deleted) Sync(this UniPath targetPath, UniPath referencePath, string glob, bool recursive = false) => Sync(targetPath, referencePath, [glob.ToPathFilter()], recursive);

		public static (IEnumerable<UniPath> created, IEnumerable<UniPath> updated, IEnumerable<UniPath> deleted) Sync(this UniPath targetPath, UniPath referencePath, IEnumerable<string?> globs, bool recursive = false) => Sync(targetPath, referencePath, globs.ToPathFilters(), recursive);

		public static (IEnumerable<UniPath> created, IEnumerable<UniPath> updated, IEnumerable<UniPath> deleted) Sync(this UniPath targetPath, UniPath referencePath, IEnumerable<PathFilter> filters, bool recursive)
		{
			List<UniPath> created = [], updated = [], deleted = [];

			if (!referencePath.Exists() && !targetPath.Exists()) return (created, updated, deleted);       //	syncing non-existing reference over non-existing target - noop

			if (referencePath.IsFile())
			{
				if (!referencePath.IsMatch(filters)) 
					throw new InvalidOperationException("Must match glob");

				if (targetPath.IsFile())																	//	synching 2 files - overwrite target
				{
					if (!referencePath.TimesEqual(targetPath))
					{
						updated.Add(targetPath);
						referencePath.CopyAsFile(targetPath, overwrite: true);
					}
					return (created, updated, deleted);
				}

				if (targetPath.Exists())                                                                    //	syncing reference file over target directory
					throw new InvalidOperationException("Must match fs entry type (3)");

				//	syncing reference file over non-existing target
				created.Add(targetPath);
				referencePath.CopyAsFile(targetPath, overwrite: true);
				return (created, updated, deleted);
			}

			if (!referencePath.Exists())
			{
				if (targetPath.IsDirectory())																//	syncing non-existing reference over target directory
				{
					var targetFiles = targetPath.EnumerateFiles(filters, recursive);
					deleted.AddRange(targetFiles);
					foreach (var file in targetFiles) file.DeleteAsFile();
					targetPath.PurgeEmptyDirectories(recursive: true);
					return (created, updated, deleted);
				}
				if (targetPath.Exists())																	//	syncing non-existing reference over target file
				{
					deleted.Add(targetPath);
					targetPath.DeleteAsFile();
				}
				return (created, updated, deleted);
			}

			if (targetPath.IsFile())																		//	syncing reference directory over target file
				throw new InvalidOperationException("Must match fs entry type (4)");

			targetPath.EnsureDirectory();                                                                   //	syncing reference directory over target directory

			HashSet<UniPath> sourceFiles = [.. referencePath.EnumerateFiles(filters, recursive).ToRelativePaths(referencePath)];
			HashSet<UniPath> destFiles = [.. targetPath.EnumerateFiles(filters, recursive).ToRelativePaths(targetPath)];

			// delete extra files in target
			foreach (var relPath in destFiles.Except(sourceFiles))
			{
				var fullPath = relPath.GetFullPath(targetPath);
				deleted.Add(fullPath);
				File.Delete(fullPath);
			}

			// copy/update files from source to target
			foreach (var relPath in sourceFiles)
			{
				var sourceFullPath = relPath.GetFullPath(referencePath);
				if (!sourceFullPath.Exists())                                                               //	reference file disappeared - delete possibly existing target as well
				{
					var fullPath = relPath.GetFullPath(targetPath);
					if (fullPath.IsFile())
					{
						deleted.Add(fullPath);
						File.Delete(fullPath);
					}
					continue;
				}

				var destFullPath = relPath.GetFullPath(targetPath);
				if (!destFullPath.Exists())                                                                 //	target file disappeared - copy the reference anyway
				{
					created.Add(destFullPath);
					sourceFullPath.CopyAsFile(destFullPath, overwrite: true);
					continue;
				}

				if (sourceFullPath.TimesEqual(destFullPath)) continue;                                      //	files have different time - target dirty
				updated.Add(destFullPath);
				sourceFullPath.CopyAsFile(destFullPath, overwrite: true);
			}

			targetPath.PurgeEmptyDirectories(recursive);

			return (created, updated, deleted);
		}

		#endregion


		public static IEnumerable<UniPath> WhereExists(this IEnumerable<UniPath> paths) => paths.Where(v => v.Exists());
		public static IEnumerable<UniPath> WhereIsDirectory(this IEnumerable<UniPath> paths) => paths.Where(v => v.IsDirectory());
		public static IEnumerable<UniPath> WhereIsFile(this IEnumerable<UniPath> paths) => paths.Where(v => v.IsFile());

		public static IEnumerable<UniPath> WhereIsMatch(this IEnumerable<UniPath> paths, string glob) => paths.Where(v => v.IsMatch(glob));
		public static IEnumerable<UniPath> WhereIsMatch(this IEnumerable<UniPath> paths, IEnumerable<string?> globs) => paths.Where(v => v.IsMatch(globs));
		public static IEnumerable<UniPath> WhereIsMatch(this IEnumerable<UniPath> paths, PathFilter filter) => paths.Where(v => v.IsMatch(filter));
		public static IEnumerable<UniPath> WhereIsMatch(this IEnumerable<UniPath> paths, IEnumerable<PathFilter> filters) => paths.Where(v => v.IsMatch(filters));

		public static IEnumerable<UniPath> WhereIsNotMatch(this IEnumerable<UniPath> paths, string glob) => paths.Where(v => !v.IsMatch(glob));
		public static IEnumerable<UniPath> WhereIsNotMatch(this IEnumerable<UniPath> paths, IEnumerable<string?> globs) => paths.Where(v => !v.IsMatch(globs));
		public static IEnumerable<UniPath> WhereIsNotMatch(this IEnumerable<UniPath> paths, PathFilter filter) => paths.Where(v => !v.IsMatch(filter));
		public static IEnumerable<UniPath> WhereIsNotMatch(this IEnumerable<UniPath> paths, IEnumerable<PathFilter> filters) => paths.Where(v => !v.IsMatch(filters));

		public static IEnumerable<UniPath> ToFullPaths(this IEnumerable<UniPath> paths, UniPath basePath) => paths.Select(v => v.GetFullPath(basePath));
		public static IEnumerable<UniPath> ToFullPaths(this IEnumerable<UniPath> paths) => paths.Select(v => v.GetFullPath());
		public static IEnumerable<UniPath> ToRelativePaths(this IEnumerable<UniPath> paths, UniPath basePath) => paths.Select(v => v.GetRelativePath(basePath));
	}
}