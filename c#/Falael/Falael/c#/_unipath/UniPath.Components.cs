//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
using System;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace Falael
{
	public partial struct UniPath
	{
		struct Components
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public Components()
			{
				this.Initialized = false;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public Components(Components components)
			{
				this.Initialized = components.Initialized;
				this.PathStringComparison = components.PathStringComparison;
				this.Context = components.Context;
				this.RootDirectory = components.RootDirectory;
				this.HasRootDirectory = components.HasRootDirectory;
				this.DirectorySegments = components.DirectorySegments;
				this.HasDirectorySegments = components.HasDirectorySegments;
				this.HasPathRoot = components.HasPathRoot;
				this.HasTrailingSlash = components.HasTrailingSlash;
				this.FileNameWithoutExtension = components.FileNameWithoutExtension;
				this.HasFileNameWithoutExtension = components.HasFileNameWithoutExtension;
				this.FileExtension = components.FileExtension;
				this.HasFileExtension = components.HasFileExtension;

			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public override bool Equals(object? obj)
			{
				if (obj is Components other) return this.Equals(other);
				return false;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public bool Equals(Components other)
			{
				Debug.Assert(this.Context != null);
				Debug.Assert(this.PathStringComparison != null);
				switch (this.Context.DirectoryTrailingSeparatorEquality)
				{
					case DirectoryTrailingSeparatorEquality.Respect:
						return this.Initialized == other.Initialized
							&& EqualityComparer<RootDirectory?>.Default.Equals(this.RootDirectory, other.RootDirectory)
							&& this.HasRootDirectory == other.HasRootDirectory
							&& string.Equals(this.DirectorySegments, other.DirectorySegments, this.PathStringComparison.Value)
							&& this.HasDirectorySegments == other.HasDirectorySegments
							&& this.HasPathRoot == other.HasPathRoot
							&& this.HasTrailingSlash == other.HasTrailingSlash
							&& string.Equals(this.FileNameWithoutExtension, other.FileNameWithoutExtension, this.PathStringComparison.Value)
							&& this.HasFileNameWithoutExtension == other.HasFileNameWithoutExtension
							&& string.Equals(this.FileExtension, other.FileExtension, this.PathStringComparison.Value)
							&& this.HasFileExtension == other.HasFileExtension;
					case DirectoryTrailingSeparatorEquality.Ignore:
						return this.Initialized == other.Initialized
							&& EqualityComparer<RootDirectory?>.Default.Equals(this.RootDirectory, other.RootDirectory)
							&& this.HasRootDirectory == other.HasRootDirectory
							&& string.Equals(this.DirectorySegments, other.DirectorySegments, this.PathStringComparison.Value)
							&& this.HasDirectorySegments == other.HasDirectorySegments
							&& this.HasPathRoot == other.HasPathRoot
							&& string.Equals(this.FileNameWithoutExtension, other.FileNameWithoutExtension, this.PathStringComparison.Value)
							&& this.HasFileNameWithoutExtension == other.HasFileNameWithoutExtension
							&& string.Equals(this.FileExtension, other.FileExtension, this.PathStringComparison.Value)
							&& this.HasFileExtension == other.HasFileExtension;
					default: throw new NotImplementedException(this.Context.DirectoryTrailingSeparatorEquality.ToString());
				}
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public override int GetHashCode()
			{
				Debug.Assert(this.PathStringComparison != null);
				Debug.Assert(this.Context != null);

				var hc = new HashCode();
				hc.Add(this.Initialized);
				hc.Add(this.RootDirectory);
				hc.Add(this.HasRootDirectory);
				hc.Add(string.GetHashCode(this.DirectorySegments ?? "", this.PathStringComparison.Value));
				hc.Add(this.HasDirectorySegments);
				hc.Add(this.HasPathRoot);
				switch (this.Context.DirectoryTrailingSeparatorEquality)
				{
					case DirectoryTrailingSeparatorEquality.Respect:
						hc.Add(this.HasTrailingSlash);
						break;
					case DirectoryTrailingSeparatorEquality.Ignore:
						break;
					default: throw new NotImplementedException(this.Context.DirectoryTrailingSeparatorEquality.ToString());
				}
				hc.Add(string.GetHashCode(this.FileNameWithoutExtension ?? "", this.PathStringComparison.Value));
				hc.Add(this.HasFileNameWithoutExtension);
				hc.Add(string.GetHashCode(this.FileExtension ?? "", this.PathStringComparison.Value));
				hc.Add(this.HasFileExtension);
				return hc.ToHashCode();
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public void Parse(TContext context, string value, bool denotesFile)
			{
				var rootDirectory = UniPath.RootDirectory.FromRootDirectory(context, System.IO.Path.GetPathRoot(value));
				if (UniPath.RootDirectory.IsErrorType(rootDirectory.Type)) throw new FormatException($"Invalid path root: \"{rootDirectory}\"");

				this.RootDirectory = rootDirectory.IsEmpty ? null : rootDirectory;
				this.HasRootDirectory = this.RootDirectory != null;
				if (this.RootDirectory != null && this.RootDirectory.Value.IsError) throw new FormatException($"Invalid root directory format: {this.RootDirectory.Value.Type}. {value}");

				var directoryName = value == "." || value == ".." ? value : denotesFile ? System.IO.Path.GetDirectoryName(value) : value;
				this.HasDirectorySegments = !string.IsNullOrEmpty(directoryName);
				if (this.HasDirectorySegments)
				{
					var directories = this.RootDirectory != null
						? directoryName![this.RootDirectory.Value.Length..]
						: directoryName!;
					this.HasPathRoot = directories.Length > 0 && directories[0] == '\\';
					if(this.HasPathRoot) this.HasTrailingSlash = value.Length > (this.RootDirectory?.Length + 1 ?? 1) && value[^1] == '\\';
					else this.HasTrailingSlash = value.Length > (this.RootDirectory?.Length ?? 0) && value[^1] == '\\';
					this.DirectorySegments = this.HasPathRoot ? directories[1..] : directories;
				}

				var outcome = ParsePathFileName(context, value, denotesFile);
				this.FileNameWithoutExtension = outcome.fileNameWithoutExtension;
				this.HasFileNameWithoutExtension = outcome.hasFileNameWithoutExtension;
				this.FileExtension = outcome.fileExtension;
				this.HasFileExtension = outcome.hasFileExtension;

				this.PathStringComparison = context.PathStringComparison;
				this.Context = context;
				this.Initialized = true;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static (string? fileNameWithoutExtension, bool hasFileNameWithoutExtension, string? fileExtension, bool hasFileExtension) ParsePathFileName(TContext context, string value, bool denotesFile)
			{
				string? fileNameWithoutExtension = null;
				bool hasFileNameWithoutExtension = false;
				string? fileExtension = null;
				bool hasFileExtension = false;

				if (!denotesFile) return (fileNameWithoutExtension, hasFileNameWithoutExtension, fileExtension, hasFileExtension);

				if (context.KnownFileExtensions == null)
				{
					fileNameWithoutExtension = System.IO.Path.GetFileNameWithoutExtension(value);
					hasFileNameWithoutExtension = !string.IsNullOrEmpty(fileNameWithoutExtension);

					fileExtension = System.IO.Path.GetExtension(value);
					hasFileExtension = !string.IsNullOrEmpty(fileExtension);
				}
				else
				{
					var fileName = System.IO.Path.GetFileName(value);
					if (!string.IsNullOrEmpty(fileName))
					{
						var comparison = context.PathStringComparison;
						var known = context.KnownFileExtensions!;
						string? bestMatch = null;
						int bestLen = -1;

						foreach (var ext in known)
						{
							Debug.Assert(ext.Length > 0 && ext[0] == '.');
							if (fileName.Length < ext.Length) continue;
							var tail = fileName[^ext.Length..];
							if (!tail.Equals(ext, comparison) || ext.Length <= bestLen) continue;
							bestMatch = tail;
							bestLen = ext.Length;
						}

						if (bestMatch == null)
						{
							fileNameWithoutExtension = System.IO.Path.GetFileNameWithoutExtension(value);
							hasFileNameWithoutExtension = !string.IsNullOrEmpty(fileNameWithoutExtension);

							fileExtension = System.IO.Path.GetExtension(value);
							hasFileExtension = !string.IsNullOrEmpty(fileExtension);
						}
						else
						{
							fileExtension = bestMatch;
							hasFileExtension = true;

							if (bestLen < fileName.Length)
							{
								fileNameWithoutExtension = fileName[..^bestLen];
								hasFileNameWithoutExtension = true;
							}
						}
					}
				}
				return (fileNameWithoutExtension, hasFileNameWithoutExtension, fileExtension, hasFileExtension);
			}

			public bool Initialized;
			
			public StringComparison? PathStringComparison;
			public TContext? Context;

			//	root directory is the official MS term for c: and similar; the root directory doesn't include the leading root backslash (@"c:\file.txt" - "c:" is root directory; "\" is the path root; there are no directories; "file.txt" is the file name); <see cref="HasPathRoot">
			//	<see href = "https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats" />
			public RootDirectory? RootDirectory;
			public bool HasRootDirectory;

			public string? DirectorySegments;
			public bool HasDirectorySegments;
			//	a path is considered having root if the list of directories after the <see cref="RootDirectory"> starts with a slash
			public bool HasPathRoot;
			public bool HasTrailingSlash;

			public string? FileNameWithoutExtension;
			public bool HasFileNameWithoutExtension;

			public string? FileExtension;
			public bool HasFileExtension;
		}
	}
}