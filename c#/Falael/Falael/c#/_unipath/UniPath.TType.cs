//	R0Q1/daniel/20250906
namespace Falael
{
	public partial struct UniPath
	{
		///	<summary>
		///	Enumerates all plausible Windows- and POSIX-compliant path fortmats as of 20250611.
		///	</summary>
		/// <see href="https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats" />
		/// <see href="https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html" />
		public enum TType : int
		{
			/// <summary>
			/// Not available (any path that doesn't start with any of the other path types).
			/// </summary>
			NotAvailable = 0,

			/// <summary>
			/// Describes Paths that start with `@"\\"` or `"//"` sequences that are immediately followed by EOS or a non-'/', non-'\\' character. Requires <see cref="PosixDoubleSlashHandling.Undefined"/> to be specified as a `posixDoubleSlashHandling` value to parsers, otherwise parsers never treat Paths as <see cref="Posix_DoubleSlash">.
			/// </summary>
			/// <remarks>
			/// A pathname that begins with two successive slash characters may be interpreted in an implementation-defined manner, although more than two leading slashes shall be treated as a single slash:
			/// - most Linux/Unix systems - Double slash at start does nothing special; behaves like `/`. Supporting user tests: cd `//` -> `/`;
			/// - Tru64 UNIX (OSF/1, Digital UNIX) - Implements POSIX and legacy OSF/1 features (e.g., AdvFS). Early UNIX systems used `//hostname/path` to reference remote mounts;
			/// - Cygwin on Windows - Supports UNC Paths via `//server/share/...`, treated as POSIX Paths with forward slashes. A virtual `//` lists known fileservers.
			/// 
			/// NOTE: Paths with three or more leading slashes (`///...`) collapse to a single slash (`/`), no special behavior.
			/// 
			/// NOTE: Unlike all other cases, which always convert all `'/'` character to `'\\'` before parsing, a path that starts precisely with `"//"` followed by a non-`'/'` character or EOS will be parsed as a special case depending on the <see cref="PosixDoubleSlashHandling"/> value passed to a <see cref="UniPathRootDirectory.FromRootDirectory"/> call or <see cref="UniPath"/> constructor.
			/// </remarks>
			/// <see cref="PosixDoubleSlashHandling"/>
			Posix_DoubleSlash,

			/// <summary>
			/// c:\
			/// c:/
			/// </summary>
			Windows_Standard,

			/// <summary>
			/// \\server\share
			/// //server\share - only with <see cref="PosixDoubleSlashHandling.Windows"/>, otherwise Paths starting with `"//"` followed by a non-`'/'` character or EOS are treated as <see cref="Posix_DoubleSlash"/>
			/// </summary>
			Windows_Unc,

			/// <summary>
			/// \\?\Volume{b75e2c83-0000-0000-0000-602f00000000}\Test\Foo.txt
			/// </summary>
			Windows_QuestionMarkVolume,

			/// <summary>
			/// \\.\Volume{b75e2c83-0000-0000-0000-602f00000000}\Test\Foo.txtt
			/// </summary>
			Windows_PeriodVolume,

			/// <summary>
			/// \\?\C:\Test\Foo.txt
			/// </summary>
			Windows_QuestionMarkDosDevice,

			/// <summary>
			/// \\.\C:\Test\Foo.txt
			/// </summary>
			Windows_PeriodDosDevice,

			/// <summary>
			/// \\?\UNC\Server\Share\Test\Foo.txt
			/// </summary>
			Windows_QuestionMarkDosDeviceUnc,

			/// <summary>
			/// \\.\UNC\Server\Share\Test\Foo.txt
			/// </summary>
			Windows_PeriodDosDeviceUnc,

			/// <summary>
			/// \\.\CON
			/// \\.\COM1
			/// \\.\LPT1
			/// </summary>
			Windows_DosDeviceLegacy,

			/// <summary>
			/// Error: Drive letter does not match a valid rawValue from <see cref="WindowsRootDirectoryLetter"/> enum `[a-zA-Z]`.
			/// </summary>
			ErrorInvalidDriveLetter,

			/// <summary>
			/// Error: Drive format is malformed (e.g., missing colon after drive letter, invalid characters).
			/// </summary>
			ErrorInvalidDriveFormat,

			/// <summary>
			/// Error: UNC path is missing the share component after server name.
			/// </summary>
			ErrorUncMissingShare,

			/// <summary>
			/// Error: UNC server name contains invalid characters from <see cref="System.IO.Path.GetInvalidFileNameChars()"/>.
			/// </summary>
			ErrorUncInvalidServerName,

			/// <summary>
			/// Error: UNC share name contains invalid characters from <see cref="System.IO.Path.GetInvalidFileNameChars()"/>.
			/// </summary>
			ErrorUncInvalidShareName,

			/// <summary>
			/// Error: Volume GUID is invalid, malformed, or empty.
			/// </summary>
			ErrorInvalidVolumeGuid,

			/// <summary>
			/// Error: Volume format is malformed (e.g., missing opening/closing braces around GUID).
			/// </summary>
			ErrorInvalidVolumeFormat,

			/// <summary>
			/// Error: Legacy device name is not a valid rawValue from <see cref="WindowsLegacyDevice"/> enum.
			/// </summary>
			ErrorUnknownLegacyDevice,

			/// <summary>
			/// Error: Dos device root directory starts with `"\\.\"` or `"\\?\"` but doesnt match any supported dos device type.
			/// </summary>
			ErrorInvalidDosDeviceFormat,
		}
	}
}