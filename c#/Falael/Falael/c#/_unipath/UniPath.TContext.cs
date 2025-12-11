//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
using System.Runtime.InteropServices;

namespace Falael
{
	public partial struct UniPath
	{
		public class TContext
		{
			#region DefaultPathStringComparer

			//	thread-safe, lock-free
			public static StringComparison DefaultPathStringComparison
			{
				get => (StringComparison)Volatile.Read(ref defaultPathStringComparison);
				set => Volatile.Write(ref defaultPathStringComparison, (int)value);
			}
			static int defaultPathStringComparison =
				RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
					? (int)StringComparison.OrdinalIgnoreCase
					: (int)StringComparison.Ordinal;

			#endregion

			#region DefaultPosixDoubleSlashHandling

			//	thread-safe, lock-free (int backing for enum)
			public static PosixDoubleSlashHandling DefaultPosixDoubleSlashHandling
			{
				get => (PosixDoubleSlashHandling)Volatile.Read(ref defaultPosixDoubleSlashHandlingRaw);
				set => Volatile.Write(ref defaultPosixDoubleSlashHandlingRaw, (int)value);
			}
			static int defaultPosixDoubleSlashHandlingRaw =
				RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
					? (int)PosixDoubleSlashHandling.Windows
					: (int)PosixDoubleSlashHandling.Undefined;

			#endregion

			#region DefaultDirectorySeparator

			// thread-safe, lock-free (int backing for enum)
			public static char DefaultDirectorySeparator
			{
				get => (char)Volatile.Read(ref defaultDirectorySeparator);
				set => Volatile.Write(ref defaultDirectorySeparator, value);
			}
			static int defaultDirectorySeparator = System.IO.Path.DirectorySeparatorChar;

			#endregion

			#region DefaultWindowsDriveLetterUpperCase

			//	thread-safe, lock-free (int backing for enum)
			public static bool DefaultWindowsDriveLetterUpperCase
			{
				get => Volatile.Read(ref defaultWindowsDriveLetterUpperCase) != 0;
				set => Volatile.Write(ref defaultWindowsDriveLetterUpperCase, value ? 1 : 0);
			}
			static int defaultWindowsDriveLetterUpperCase = 0;

			#endregion

			#region DefaultDirectoryTrailingSeparatorFormat

			//	thread-safe, lock-free (int backing for enum)
			public static DirectoryTrailingSeparatorFormat DefaultDirectoryTrailingSeparatorFormat
			{
				get => (DirectoryTrailingSeparatorFormat)Volatile.Read(ref defaultDirectoryTrailingSeparatorFormat);
				set => Volatile.Write(ref defaultDirectoryTrailingSeparatorFormat, (int)value);
			}
			static int defaultDirectoryTrailingSeparatorFormat = (int)DirectoryTrailingSeparatorFormat.Original;

			#endregion

			#region DefaultDirectoryTrailingSeparatorEquality

			//	thread-safe, lock-free (int backing for enum)
			public static DirectoryTrailingSeparatorEquality DefaultDirectoryTrailingSeparatorEquality
			{
				get => (DirectoryTrailingSeparatorEquality)Volatile.Read(ref defaultDirectoryTrailingSeparatorEquality);
				set => Volatile.Write(ref defaultDirectoryTrailingSeparatorEquality, (int)value);
			}
			static int defaultDirectoryTrailingSeparatorEquality = (int)DirectoryTrailingSeparatorEquality.Respect;

			#endregion

			#region DefaultValidRootDirectoryLetters

			//	thread-safe, lock-free (array reference publication)
			public static WindowsRootDirectoryLetter[]? DefaultValidRootDirectoryLetters
			{
				get => Volatile.Read(ref defaultValidRootDirectoryLetters);
				set => Volatile.Write(ref defaultValidRootDirectoryLetters, value);
			}
			static WindowsRootDirectoryLetter[]? defaultValidRootDirectoryLetters =
				RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? null : [];

			#endregion

			#region DefaultKnownFileExtensions

			//	thread-safe, lock-free (array reference publication)
			public static string[]? DefaultKnownFileExtensions
			{
				get => Volatile.Read(ref defaultKnownFileExtensions);
				set => Volatile.Write(ref defaultKnownFileExtensions, value);
			}
			static string[]? defaultKnownFileExtensions = null;

			#endregion

			public readonly StringComparison PathStringComparison = DefaultPathStringComparison;
			public readonly PosixDoubleSlashHandling PosixDoubleSlashHandling = DefaultPosixDoubleSlashHandling;
			public readonly char DirectorySeparator = DefaultDirectorySeparator;
			public readonly bool WindowsDriveLetterUpperCase = DefaultWindowsDriveLetterUpperCase;
			public readonly DirectoryTrailingSeparatorFormat DirectoryTrailingSeparatorFormat = DefaultDirectoryTrailingSeparatorFormat;
			public readonly DirectoryTrailingSeparatorEquality DirectoryTrailingSeparatorEquality = DefaultDirectoryTrailingSeparatorEquality; 
			/// <remarks>
			///		- If omitted (default) – all WindowsRootDirectoryLetter-s are considered valid drive letters...
			///		- If present, only the listed drive letters are considered valid...
			///		- To enforce POSIX behavior, use an empty array.
			///	</remarks>
			public readonly WindowsRootDirectoryLetter[]? ValidRootDirectoryLetters = DefaultValidRootDirectoryLetters;
			/// <summary>
			/// Specifies a list of strings that are always recognized as extensions if a file name ends with any of them, for ex. `[".mp4.metadata"]` (by default the only `.metadata` is recognized as extension).
			/// </summary>
			public readonly string[]? KnownFileExtensions = DefaultKnownFileExtensions;

			//	order is significant, `Default` must be last to initialize
			public static readonly TContext Default = new();
		}
	}
}
