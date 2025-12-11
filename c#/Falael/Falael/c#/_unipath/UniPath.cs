//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace Falael
{
	public partial struct UniPath : IComparable<UniPath>
	{
		public static readonly UniPath Empty = new();

		static readonly Regex DeduplicateDirectorySeparators = new Regex(@"[/\\]+", RegexOptions.Compiled);

		#region Construction

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath()
		{
			this.Context = TContext.Default;
			this.valueNormalized = string.Empty;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		UniPath(TContext context, Components components)
		{
			this.Context = context;
			this.components = components;
			this.valueNormalized = string.Empty;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		UniPath(TContext context, bool denotesFile, Components components)
		{
			this.Context = context;
			this.components = components;
			this.valueNormalized = string.Empty;
			this.denotesFile = true;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(TContext context, bool denotesFile, params string[] values)
		{
			this.Context = context;
			this.denotesFile = denotesFile;
			switch (values.Length)
			{
				case 0:
					this.valueNormalized = string.Empty;
					break;
				case 1:
					this.valueNormalized = DeduplicateDirectorySeparators.Replace(values[0], "\\");
					break;
				default:
					this.valueNormalized = DeduplicateDirectorySeparators.Replace(System.IO.Path.Combine(values), "\\");
					break;
			}
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(TContext context, params string[] values)
		{
			this.Context = context;
			switch (values.Length)
			{
				case 0:
					this.valueNormalized = string.Empty;
					break;
				case 1:
					this.valueNormalized = DeduplicateDirectorySeparators.Replace(values[0], "\\");
					break;
				default:
					this.valueNormalized = DeduplicateDirectorySeparators.Replace(System.IO.Path.Combine(values), "\\");
					break;
			}
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(bool denotesFile, params string[] values) : this(TContext.Default, denotesFile, values) { }

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(params string[] values) : this(TContext.Default, values) { }

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(TContext context, params UniPath[] values)
		{
			this.Context = context;
			switch (values.Length)
			{
				case 0:
					this.valueNormalized = string.Empty;
					break;
				case 1:
					{
						var source = values[0];
						this.Context = source.Context;
						this.components = source.components;
						this.valueCached = source.valueCached;
						this.valueNormalized = source.valueNormalized;
					}
					break;
				default:
					{
						var source = values[0].CombineWith(values[1..]);
						this.Context = source.Context;
						this.components = source.components;
						this.valueCached = source.valueCached;
						this.valueNormalized = source.valueNormalized;
					}
					break;
			}
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(params UniPath[] values) : this(TContext.Default, values) { }

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(TContext context, bool denotesFile, string value)
		{
			this.Context = context;
			this.denotesFile = denotesFile;
			this.valueNormalized = DeduplicateDirectorySeparators.Replace(value, "\\");
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(TContext context, string value)
		{
			this.Context = context;
			this.valueNormalized = DeduplicateDirectorySeparators.Replace(value, "\\");
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(bool denotesFile, string value) : this(TContext.Default, denotesFile, value) { }

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(string value) : this(TContext.Default, value) { }

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(UniPath source)
		{
			this.Context = source.Context;
			this.components = source.components;
			this.valueCached = source.valueCached;
			this.valueNormalized = source.valueNormalized;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath(TContext context, UniPath source)
		{
			this.Context = context;
			this.components = source.components;
			this.valueCached = source.valueCached;
			this.valueNormalized = source.valueNormalized;
		}

		#endregion

		#region Object Overrides

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool Equals(UniPath other) => this.GetComponents().Equals(other.GetComponents());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public override bool Equals(object? obj) => obj is UniPath other && this.Equals(other);

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public override int GetHashCode() => this.GetComponents().GetHashCode();

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public override string ToString()
		{
			if (this.valueCached == null)
			{
				StringBuilder sb = new();

				var components = this.GetComponents();

				if (components.HasRootDirectory) sb.Append(components.RootDirectory!.Value.ToString());
				if (components.HasPathRoot) sb.Append(this.Context.DirectorySeparator);
				if (components.HasDirectorySegments) sb.Append(components.DirectorySegments!);
				if (components.HasDirectorySegments && (components.HasFileNameWithoutExtension || components.HasFileExtension) || components.HasTrailingSlash) sb.Append(this.Context.DirectorySeparator);
				if (components.HasFileNameWithoutExtension) sb.Append(components.FileNameWithoutExtension!);
				if (components.HasFileExtension) sb.Append(components.FileExtension!);

				this.valueCached = sb.ToString();
			}
			return this.valueCached;
		}

		#endregion

		#region Formatting

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public string Format(DirectorySeparatorFormat directorySeparatorFormat = DirectorySeparatorFormat.Context, WindowsDriveLetterFormat windowsDriveLetterFormat = WindowsDriveLetterFormat.Original, DirectoryTrailingSeparatorFormat directoryTrailingSeparatorFormat = DirectoryTrailingSeparatorFormat.Original, VolumeGuidFormat volumeGuidFormat = VolumeGuidFormat.Original)
		{
			char s;
			switch (directorySeparatorFormat)
			{
				case DirectorySeparatorFormat.Windows:
					s = '\\';
					break;
				case DirectorySeparatorFormat.Posix:
					s = '/';
					break;
				case DirectorySeparatorFormat.Native:
					s = DirectorySeparatorChar;
					break;
				case DirectorySeparatorFormat.Context:
					s = this.Context.DirectorySeparator;
					break;
				default: throw new NotImplementedException(directorySeparatorFormat.ToString());
			}

			var components = this.GetComponents();

			char? ts = null;
			if (components.HasDirectorySegments && (components.HasFileNameWithoutExtension || components.HasFileExtension)) ts = s;
			else switch (directoryTrailingSeparatorFormat)
			{
				case DirectoryTrailingSeparatorFormat.Always:
					if (components.HasDirectorySegments) ts = s;
					break;
				case DirectoryTrailingSeparatorFormat.Never:
					break;
				case DirectoryTrailingSeparatorFormat.Original:
					if (components.HasTrailingSlash) ts = s;
					break;
				default:
					throw new NotImplementedException(directoryTrailingSeparatorFormat.ToString());
			}

			StringBuilder sb = new();

			if (components.HasRootDirectory) sb.Append(components.RootDirectory!.Value.Format(directorySeparatorFormat, windowsDriveLetterFormat, volumeGuidFormat));
			if (components.HasPathRoot) sb.Append(s);
			if (components.HasDirectorySegments) sb.Append(s == '\\' ? components.DirectorySegments! : components.DirectorySegments!.Replace('\\', '/'));
			if (ts.HasValue) sb.Append(ts.Value);
			if (components.HasFileNameWithoutExtension) sb.Append(components.FileNameWithoutExtension!);
			if (components.HasFileExtension) sb.Append(components.HasFileExtension!);

			return sb.ToString();
		}

		#endregion

		#region IComparable<UniPath>

		public int CompareTo(UniPath other) => string.Compare(this.ToString(), other.ToString(), this.Context.PathStringComparison);

		#endregion

		#region Component Accessors

		public bool HasRootDir
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get => this.GetComponents().HasRootDirectory;
		}

		/// <summary>
		/// Root directory as per MS definition ("c:", @"\\server\share")
		/// </summary>
		/// <remarks>
		///	root directory is the official MS term for c: and similar; the root directory doesn't include the leading root backslash (@"c:\file.txt" - "c:" is root directory; @"\" is the other root; there are no directories; "file.txt" is the file name); <see cref="HasPathRoot">, <see cref="DirectorySegments">.
		///	<see href = "https://learn.microsoft.com/en-us/dotnet/standard/io/file-other-formats" />
		/// </remarks>
		public RootDirectory RootDir
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				if (!components.HasRootDirectory) return RootDirectory.Empty;
				return components.RootDirectory!.Value;
			}
		}

		public bool HasDirectories
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get => this.GetComponents().HasDirectorySegments;
		}

		/// <summary>
		/// The other of directories w/o leading or trailing slash or backslash, e.g. `"c:\aaa\bbb\"` => `"aaa\bbb"`
		/// </summary>
		/// <remarks>
		/// To know if the other stats with a root slash or backslash, use <see cref="HasPathRoot"/>
		/// </remarks>
		public string DirectorySegments
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				if (!components.HasDirectorySegments) return string.Empty;
				return components.DirectorySegments!;
			}
		}

		public string[] DirectorySegmentList
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				if (!components.HasDirectorySegments) return [];
				return components.DirectorySegments!.Split('\\', StringSplitOptions.RemoveEmptyEntries);
			}
		}

		/// <summary>
		/// a other is considered having root if the list of directories after the <see cref="RootDirectory"> starts with a slash or backslash
		/// </summary>
		public bool HasPathRoot
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get => this.GetComponents().HasPathRoot;
		}

		public bool HasTrailingSlash
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get => this.GetComponents().HasTrailingSlash;
		}

		public bool HasFileNameWithoutExtension
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get => this.GetComponents().HasFileNameWithoutExtension;
		}

		public string FileNameWithoutExtension
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				if (!components.HasFileNameWithoutExtension) return string.Empty;
				return components.FileNameWithoutExtension!;
			}
		}

		public bool HasFileExtension
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get => this.GetComponents().HasFileExtension;
		}

		public string FileExtension
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				if (!components.HasFileExtension) return string.Empty;
				return components.FileExtension!;
			}
		}

		public bool HasFileName
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				return components.HasFileNameWithoutExtension || components.HasFileExtension;
			}
		}

		public string FileName
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				var components = this.GetComponents();
				return components.FileNameWithoutExtension + components.FileExtension;
			}
		}

		#endregion

		#region Path Info

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsFullyQualified() => System.IO.Path.IsPathFullyQualified(this.ToString());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool Exists() => System.IO.Path.Exists(this.ToString());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsDirectory() => Directory.Exists(this.ToString());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsFile() => File.Exists(this.ToString());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public FileInfo FileInfo() => new(this.ToString());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public int UnixTimestamp() => checked((int)new DateTimeOffset(this.FileInfo().LastWriteTimeUtc).ToUnixTimeSeconds());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public DirectoryInfo DirectoryInfo() => new(this.ToString());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public int CompareTimes(UniPath other)
		{
			var isThisFile = this.IsFile();
			var isOtherFile = other.IsFile();
			if (isThisFile && !isOtherFile || !isThisFile && isOtherFile) return isThisFile ? 1 : -1;

			var isThisDirectory = this.IsDirectory();
			var isOtherDirectory = other.IsDirectory();
			if (isThisDirectory && !isOtherDirectory || !isThisDirectory && isOtherDirectory) return isThisDirectory ? 1 : -1;

			return Math.Sign((new FileInfo(this).LastWriteTimeUtc - new FileInfo(other).LastWriteTimeUtc).TotalMilliseconds);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool TimesEqual(UniPath other) => this.CompareTimes(other) == 0;

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsRelativeTo(UniPath relativeTo)
		{
			var rel = this.GetRelativePath(relativeTo);
			return !rel.HasRootDir && rel != this;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsMatch(string? pattern, bool patternIsGlob = true)
		{
			if (string.IsNullOrWhiteSpace(pattern)) return true;

			if (!patternIsGlob) return string.Equals(this.FileExtension, pattern, this.Context.PathStringComparison);
			
			if (pattern == "*" || pattern == "*.*") return true;
			
			return PatternMatcher.StrictMatchPattern(pattern, this.ToString(), this.Context.PathStringComparison);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsMatch(IEnumerable<string?> patterns, bool patternIsGlob = true)
		{
			if (!patterns.Any()) return true;
			if (patterns.Any(v => string.IsNullOrWhiteSpace(v))) return true;

			var comparison = this.Context.PathStringComparison;

			if (!patternIsGlob)
			{
				var fileExtension = this.FileExtension;
				return patterns.Any(v => string.Equals(fileExtension, v, comparison));
			}

			if (patterns.Any(v => v == "*" || v == "*.*")) return true;

			var path = this.ToString();
			return patterns.Any(v => PatternMatcher.StrictMatchPattern(v!, path, comparison));
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsMatch(PathFilter pathFilter) => this.IsMatch(pathFilter?.Pattern, pathFilter?.UsePatternMatching ?? false);

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsMatch(IEnumerable<PathFilter> acceptedPathFilter)
		{
			if (!acceptedPathFilter.Any()) return true;
			if (acceptedPathFilter.Any(v => v.Pattern == null || v.Pattern == string.Empty || (v.UsePatternMatching && (v.Pattern == "*" || v.Pattern == "*.*")))) return true;

			var comparison = this.Context.PathStringComparison;
			var fileExtension = this.FileExtension;
			var path = this.ToString();

			return acceptedPathFilter.Any(v =>
			{
				if (!v.UsePatternMatching) return string.Equals(fileExtension, v.Pattern, comparison);
				return PatternMatcher.StrictMatchPattern(v.Pattern!, path, comparison);
			});
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsMatch(IEnumerable<PathFilter> acceptedPathFilters, IEnumerable<PathFilter> excludedPathFilters)
		{
			if (!excludedPathFilters.Any()) return this.IsMatch(acceptedPathFilters);
			if (excludedPathFilters.Any(v => v.Pattern == null || v.Pattern == string.Empty || (v.UsePatternMatching && (v.Pattern == "*" || v.Pattern == "*.*")))) return false;

			var comparison = this.Context.PathStringComparison;
			var fileExtension = this.FileExtension;
			var path = this.ToString();

			if (excludedPathFilters.Any(v =>
			{
				if (!v.UsePatternMatching) return string.Equals(fileExtension, v.Pattern, comparison);
				return PatternMatcher.StrictMatchPattern(v.Pattern!, path, comparison);
			})) return false;

			return this.IsMatch(acceptedPathFilters);
		}

		#endregion

		#region File Access

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public string? ReadText(Encoding encoding, string ? defaultValue = null)
		{
			if (!this.Exists()) return defaultValue;
			return File.ReadAllText(this, encoding);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public string? ReadText(string? defaultValue)
		{
			if (!this.Exists()) return defaultValue;
			return File.ReadAllText(this, Encoding.UTF8);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public string ReadText([NotNull]Encoding encoding)
		{
			return File.ReadAllText(this, encoding);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public string ReadText()
		{
			return File.ReadAllText(this, Encoding.UTF8);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public void WriteText(string text)
		{
			File.WriteAllText(this, text);
		}

		#endregion

		#region Mutations

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath NewReuseContext(string path) => new(this.Context, path);

		/// <summary>
		/// Gets the path without file name or extension.
		/// </summary>
		/// <returns></returns>
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetDirectoryPath()
		{
			var components = new Components(this.GetComponents())
			{
				FileNameWithoutExtension = null,
				HasFileNameWithoutExtension = false,
				FileExtension = null,
				HasFileExtension = false
			};
			Debug.Assert(components.Initialized);
			return new(this.Context, denotesFile: false, components);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetRelativePath(UniPath relativeTo) => new(
			UniPath.GetRelativePath(
				context: this.Context,
				relativeTo: relativeTo.ToString(),
				path: this.ToString(),
				comparisonType: this.Context.PathStringComparison
		));

		//[MethodImpl(MethodImplOptions.AggressiveInlining)]
		//public UniPath GetRelativePath(UniPath relativeTo) => new(
		//	System.IO.Path.GetRelativePath(
		//		relativeTo: relativeTo.ToString(),
		//		other: this.ToString()
		//));

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetFullPath(UniPath basePath)
		{
			var path = this.ToString();
			if (path == string.Empty) return basePath.GetFullPath();
			return new(System.IO.Path.GetFullPath(
				path,
				basePath
			));
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetFullPath()
		{
			var path = this.ToString();
			if (path == string.Empty) return new(Directory.GetCurrentDirectory());
			return new(System.IO.Path.GetFullPath(path));
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetSubDirectory(params UniPath[] paths) => new (System.IO.Path.Combine([this.GetDirectoryPath().ToString(), .. paths.Select(v => v.ToString())]));

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetParentDirectory()
		{
			if (!this.HasDirectories) throw new InvalidOperationException("Directory list is empty.");
			var components = new Components(this.GetComponents());
			Debug.Assert(components.Initialized);
			components.DirectorySegments = string.Join(this.Context.DirectorySeparator, this.DirectorySegmentList.Take(this.DirectorySegmentList.Length - 1));
			components.HasDirectorySegments = components.DirectorySegments.Length != 0;
			components.FileNameWithoutExtension = null;
			components.HasFileNameWithoutExtension = false;
			components.FileExtension = null;
			components.HasFileExtension = false;
			return new(this.Context, this.components);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath GetWithoutExtension() => this.SetFileExtension(null);

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath SetFileExtension(string? extension) => new(System.IO.Path.ChangeExtension(this.ToString(), extension) ?? throw new InvalidOperationException());

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath AppendExtension(string extension)
		{
			Debug.Assert(extension.Length > 0 && extension[0] == '.');

			var components1 = this.GetComponents();
			var components2 = new Components(this.GetComponents())
			{
				FileNameWithoutExtension = components1.FileNameWithoutExtension,
				HasFileNameWithoutExtension = components1.HasFileNameWithoutExtension,
				FileExtension = components1.HasFileExtension ? components1.FileExtension + extension : extension,
				HasFileExtension = true
			};
			Debug.Assert(components2.Initialized);
			return new(this.Context, components2);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath SetFileName(string fileName)
		{
			var outcome = Components.ParsePathFileName(this.Context, fileName, true);
			var components = new Components(this.GetComponents())
			{
				FileNameWithoutExtension = outcome.fileNameWithoutExtension,
				HasFileNameWithoutExtension = outcome.hasFileNameWithoutExtension,
				FileExtension = outcome.fileExtension,
				HasFileExtension = outcome.hasFileExtension
			};
			Debug.Assert(components.Initialized);
			return new(this.Context, denotesFile: true, components);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath SetFileNameWithoutExtension(string fileName)
		{
			var outcome = Components.ParsePathFileName(this.Context, fileName, true);
			var components = new Components(this.GetComponents())
			{
				FileNameWithoutExtension = outcome.fileNameWithoutExtension,
				HasFileNameWithoutExtension = outcome.hasFileNameWithoutExtension,
			};
			Debug.Assert(components.Initialized);
			return new(this.Context, denotesFile: true, components);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public UniPath SetTempFileName()
		{
			var outcome = Components.ParsePathFileName(this.Context, UniPath.GetTempFileName(), true);
			var components = new Components(this.GetComponents())
			{
				FileNameWithoutExtension = outcome.fileNameWithoutExtension,
				HasFileNameWithoutExtension = outcome.hasFileNameWithoutExtension,
				FileExtension = outcome.fileExtension,
				HasFileExtension = outcome.hasFileExtension
			};
			Debug.Assert(components.Initialized);
			return new(this.Context, denotesFile: true, components);
		}

		#endregion

		#region Mutations - CombineWith

		public UniPath CombineWith(UniPath path2) => new(System.IO.Path.Combine(
			path1: this.ToString(),
			path2: path2.ToString()
		));

		public UniPath CombineWith(UniPath path2, UniPath path3) => new(System.IO.Path.Combine(
			path1: this.ToString(),
			path2: path2.ToString(),
			path3: path3.ToString()
		));

		public UniPath CombineWith(UniPath path2, UniPath path3, UniPath path4) => new(System.IO.Path.Combine(
			path1: this.ToString(),
			path2: path2.ToString(),
			path3: path3.ToString(),
			path4: path4.ToString()
		));

		public UniPath CombineWith(params UniPath[] paths) => new(System.IO.Path.Combine([this.ToString(), ..paths.Select(v => v.ToString())]));

		#endregion

		#region Mutations - JoinWith

		public UniPath JoinWith(UniPath path2) => new(System.IO.Path.Join(
			path1: this.ToString(),
			path2: path2.ToString()
		));

		public UniPath JoinWith(UniPath path2, UniPath path3) => new(System.IO.Path.Join(
			path1: this.ToString(),
			path2: path2.ToString(),
			path3: path3.ToString()
		));

		public UniPath JoinWith(UniPath path2, UniPath path3, UniPath path4) => new(System.IO.Path.Join(
			path1: this.ToString(),
			path2: path2.ToString(),
			path3: path3.ToString(),
			path4: path4.ToString()
		));

		public UniPath JoinWith(params UniPath[] paths) => new(System.IO.Path.Join([this.ToString(), .. paths.Select(v => v.ToString())]));

		#endregion

		public readonly TContext Context;
		readonly bool denotesFile = true;    //	by default System.IO.Path treats paths as ending with a file

		Components GetComponents()
		{
			if (!this.components.Initialized) this.components.Parse(this.Context, this.valueNormalized, this.denotesFile);
			return this.components;
		}
		Components components;
		
		readonly string valueNormalized;
		string? valueCached;

		#region Debug

		public static void Debug_ConsoleWriteSystemIOPathSamples()
		{
			string dumpFilePath = @"c:\temp\dump.Debug_ConsoleWriteSystemIOPathSamples.txt";
			List<string?> template =
			[
				null,
				@"",
				@" ",
				"\t",
				@"*",
				@"\\",
				@"\\*",
				@"\\temp",
				@"\\temp\",
				@"\\server\share",
				@"\\server\share\",
				@"\\server\share\file",
				@"\\server\share\dir\",
				@"\\server\share\file.ext",
				@"\\server\share/file.ext",
				@"//server/share/file.ext",
				@"//server\share/file.ext",
				@"\\?\C:",
				@"\\?\C:\",
				@"\\?\C:/",
				@"\\?\C:\file",
				@"\\?\C:\dir\file.ext",
				@"\\.\C:\dir\file.ext",
				@"//?/C:",
				@"//?/C:/",
				@"//?/C:/dir/file.ext",
				@"//?\C:/dir/file.ext",
				@"//./C:/dir/file.ext",
				@"\\?\Volume{b75e2c83-0000-0000-0000-602f00000000}\Test\Foo.txt",
				@"\\?\volume{b75e2c83-0000-0000-0000-602f00000000}\Test\Foo.txt",
				@"//?/Volume{b75e2c83-0000-0000-0000-602f00000000}/Test\Foo.txt",
				@"\\.\Volume{b75e2c83-0000-0000-0000-602f00000000}\Test\Foo.txt",
				@"//./Volume{b75e2c83-0000-0000-0000-602f00000000}/Test\Foo.txt",
				@"\\?\UNC\Server\Share\Test\Foo.txt",
				@"\\?\unc\Server\Share\Test\Foo.txt",
				@"//?/UNC/Server/Share/Test/Foo.txt",
				@"\\.\UNC\Server\Share\Test\Foo.txt",
				@"//./UNC/Server/Share/Test/Foo.txt",
				@"\\.\CON",
				@"\\.\con",
				@"\\.\CON\",
				@"\\.\CON\aaaa",
				@"\\.\COM",
				@"\\.\COM\",
				@"\\.\COM\aaaa",
				@"\\.\COM1",
				@"\\.\com1",
				@"\\.\COM1\",
				@"\\.\COM1\aaaa",
				@"temp",
				@".temp",
				@"temp/",
				@".temp/",
				@"temp\",
				@".temp\",
				@"temp.x",
				@".temp.x",
				@"temp.x/",
				@".temp.x/",
				@"temp.x\",
				@".temp.x\",
				@"temp.x.y",
				@"temp.x.y/",
				@"temp.x.y\",
				@"temp/file",
				@".temp/file",
				@"temp/.file",
				@".temp/.file",
				@"temp\file",
				@".temp\file",
				@"temp\.file",
				@".temp\.file",
				@"temp/file.t",
				@"temp/.file.t",
				@"temp\file.t",
				@"temp\.file.t",
				@"temp/file.t.u",
				@"temp\file.t.u",
				@"temp.x/file",
				@"temp.x/.file",
				@"temp.x\file",
				@"temp.x\.file",
				@"temp.x/file.t",
				@"temp.x/.file.t",
				@"temp.x\file.t",
				@"temp.x\.file.t",
				@"temp.x/file.t.u",
				@"temp.x\file.t.u",
				@"temp.x.y/file",
				@"temp.x.y\file",
				@"temp.x.y/file.t",
				@"temp.x.y\file.t",
				@"temp.x.y/file.t.u",
				@"temp.x.y\file.t.u",
			];

			string prefix;
			List<string?> paths = [];
			//Paths.AddRange(template.Where(v => v == null || !v.Contains('/')));
			paths.AddRange(template);
			prefix = @"/"; paths.AddRange(template.Select(v => v == null ? null : prefix + v));
			prefix = @"\"; paths.AddRange(template.Where(v => v != null).Select(v => prefix + v));
			prefix = @"./"; paths.AddRange(template.Select(v => v == null ? null : prefix + v));
			prefix = @".\"; paths.AddRange(template.Where(v => v != null).Select(v => prefix + v));
			prefix = @"../"; paths.AddRange(template.Select(v => v == null ? null : prefix + v));
			prefix = @"..\"; paths.AddRange(template.Where(v => v != null).Select(v => prefix + v));
			paths.Add(@"c:");
			prefix = @"c:/"; paths.AddRange(template.Where(v => v != null).Select(v => prefix + v));
			prefix = @"c:\"; paths.AddRange(template.Where(v => v != null).Select(v => prefix + v));

			StringBuilder sb = new();

			string _tabs(string text)
			{
				var leftBoundary = 100;
				var tabs = "    ";
				for (int i = text.Length; i < leftBoundary; i++) tabs += " ";
				return tabs;
			}

			//	[Path.GetRoot]
			prefix = "\t\t///\t[Path.GetPathRoot] \t\"";
			sb.AppendLine();
			for (int i = 0; i < paths.Count; ++i)
			{
				var path = paths[i];
				var printpath = path ?? "(null)";
				printpath = printpath.Replace("\t", "(tab)");
				var tabs = _tabs(prefix.Replace("\t", "    ") + printpath);
				sb.AppendLine(prefix + printpath + "\"" + tabs + "\"" + (System.IO.Path.GetPathRoot(path) ?? "(null)").Replace("\t", "(tab)") + "\"");
			}

			//	[Path.GetDirectoryName]
			sb.AppendLine();
			prefix = "\t\t///\t[Path.GetDirectoryName] \t\"";
			for (int i = 0; i < paths.Count; ++i)
			{
				var path = paths[i];
				var printpath = path ?? "(null)";
				printpath = printpath.Replace("\t", "(tab)");
				var tabs = _tabs(prefix.Replace("\t", "    ") + printpath);
				sb.AppendLine(prefix + printpath + "\"" + tabs + "\"" + (System.IO.Path.GetDirectoryName(path) ?? "(null)").Replace("\t", "(tab)") + "\"");
			}

			//	[Path.GetFileNameWithoutExtension]
			sb.AppendLine();
			prefix = "\t\t///\t[Path.GetFileNameWithoutExtension] \t\"";
			for (int i = 0; i < paths.Count; ++i)
			{
				var path = paths[i];
				var printpath = path ?? "(null)";
				printpath = printpath.Replace("\t", "(tab)");
				var tabs = _tabs(prefix.Replace("\t", "    ") + printpath);
				sb.AppendLine(prefix + printpath + "\"" + tabs + "\"" + (System.IO.Path.GetFileNameWithoutExtension(path) ?? "(null)").Replace("\t", "(tab)") + "\"");
			}

			//	[Path.GetExtension]
			sb.AppendLine();
			prefix = "\t\t///\t[Path.GetExtension] \t\"";
			for (int i = 0; i < paths.Count; ++i)
			{
				var path = paths[i];
				var printpath = path ?? "(null)";
				printpath = printpath.Replace("\t", "(tab)");
				var tabs = _tabs(prefix.Replace("\t", "    ") + printpath);
				sb.AppendLine(prefix + printpath + "\"" + tabs + "\"" + (System.IO.Path.GetExtension(path) ?? "(null)").Replace("\t", "(tab)") + "\"");
			}

			sb.AppendLine();
			File.WriteAllText(dumpFilePath, sb.ToString());
		}

		#endregion
	}
}