//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

namespace Falael
{
	public partial struct UniPath
	{
		public partial struct RootDirectory
		{
			public static readonly RootDirectory Empty = new();

			static char[] INVALID_CHARS;

			static RootDirectory()
			{
				INVALID_CHARS = System.IO.Path.GetInvalidFileNameChars();
			}

			#region Construction

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			RootDirectory(TType type, WindowsRootDirectoryLetter letter, bool isLetterUpperCase)
			{
				this.Type = type;
				this.Letter = letter;
				this.IsLetterUpperCase = isLetterUpperCase;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			RootDirectory(TType type, WindowsUncNetworkRoot uncNetworkRoot)
			{
				ValidateUncComponent(uncNetworkRoot.UncServer, nameof(uncNetworkRoot.UncServer));
				ValidateUncComponent(uncNetworkRoot.UncShare, nameof(uncNetworkRoot.UncShare));
				this.Type = type;
				this.UncNetworkRoot = uncNetworkRoot;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			RootDirectory(TType type, Guid volume)
			{
				ValidateVolumeGuid(volume);
				this.Type = type;
				this.Volume = volume;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			RootDirectory(TType type, WindowsLegacyDevice legacyDevice)
			{
				this.Type = type;
				this.LegacyDevice = legacyDevice;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			RootDirectory(TType type, bool isError)
			{
				Debug.Assert(isError);
				this.Type = type;
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			RootDirectory(TType type)
			{
				this.Type = type;
			}


			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static void ValidateUncComponent(string component, string componentName)
			{
				if (string.IsNullOrWhiteSpace(component)) throw new ArgumentException($"Cannot be null, empty, or whitespace: \"{componentName}\".", nameof(componentName));

				if (component.Contains('\\')) throw new ArgumentException($"Cannot contain path separators: \"{componentName}\".", nameof(componentName));

				if (component.IndexOfAny(INVALID_CHARS) >= 0) throw new ArgumentException($"Contains invalid characters: \"{componentName}\".", nameof(componentName));
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static void ValidateVolumeGuid(Guid volume)
			{
				if (volume == Guid.Empty) throw new ArgumentException("Cannot be empty GUID.", nameof(volume));
			}


			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreatePosixDoubleSlash() => new(TType.Posix_DoubleSlash);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsStandard(WindowsRootDirectoryLetter letter, bool isLetterUpperCase) => new(TType.Windows_Standard, letter, isLetterUpperCase);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsUnc(WindowsUncNetworkRoot uncRootDirectory) => new(TType.Windows_Unc, uncRootDirectory);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsQuestionMarkVolume(Guid volume) => new(TType.Windows_QuestionMarkVolume, volume);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsPeriodVolume(Guid volume) => new(TType.Windows_PeriodVolume, volume);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsQuestionMarkDosDevice(WindowsRootDirectoryLetter letter, bool isLetterUpperCase) => new(TType.Windows_QuestionMarkDosDevice, letter, isLetterUpperCase);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsPeriodDosDevice(WindowsRootDirectoryLetter letter, bool isLetterUpperCase) => new(TType.Windows_PeriodDosDevice, letter, isLetterUpperCase);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsQuestionMarkDosDeviceUnc(WindowsUncNetworkRoot uncRootDirectory) => new(TType.Windows_QuestionMarkDosDeviceUnc, uncRootDirectory);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsPeriodDosDeviceUnc(WindowsUncNetworkRoot uncRootDirectory) => new(TType.Windows_PeriodDosDeviceUnc, uncRootDirectory);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsDosDeviceLegacy(WindowsLegacyDevice legacyDevice) => new(TType.Windows_DosDeviceLegacy, legacyDevice);

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory CreateWindowsError(TType errorUniPathType) => new(errorUniPathType, isError: true);

			#endregion

			#region Parsing

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory FromRootDirectory(string? rootDirectoryRaw) => FromRootDirectory(TContext.Default, rootDirectoryRaw);

			/// <param name="isNormalizedPath">Indicates that <paramref name="value"/> is expected to be provided in normalized form strictly using '\\' as directory separator. Provided to prevent redundant multiple normalization passes.</param>
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static RootDirectory FromRootDirectory(TContext context, string? value, bool isNormalizedPath = false)
			{
#if DEBUG
				if (isNormalizedPath) Debug.Assert(
					value?.Contains('/') == false,
					"When isNormalizedPath == true, the path should not contain '/' characters. This flag is present only as means to avoid redundant normalization."
				);
#endif
				var posixDoubleSlashHandling = context.PosixDoubleSlashHandling;
				var validRootDirectoryLetters = context.ValidRootDirectoryLetters;

				if (string.IsNullOrEmpty(value)) return Empty;
				var rootDirectoryNorm = isNormalizedPath ? value : DeduplicateDirectorySeparators.Replace(value, "\\"); ;
				if (rootDirectoryNorm == "\\") return Empty;

				TType pathType = TType.NotAvailable;

				bool handled = false;
				switch (posixDoubleSlashHandling)
				{
					case PosixDoubleSlashHandling.Undefined:
						// TType.Posix_DoubleSlash - "//" (normalized to "\\\\")
						if (value.StartsWith("\\\\", StringComparison.Ordinal) && (value.Length == 2 || value[2] != '\\'))
						{
							pathType = TType.Posix_DoubleSlash;
							handled = true;
						}
						break;
					case PosixDoubleSlashHandling.Windows:
						//	will be handled by the `TType.Windows_Unc` case below
						break;
					default: throw new NotImplementedException(posixDoubleSlashHandling.ToString());
				}
				if (handled) { }
				// TType.Windows_QuestionMarkVolume - \\?\Volume{guid}, \\?\volume{guid}
				else if (rootDirectoryNorm.StartsWith(@"\\?\Volume", StringComparison.OrdinalIgnoreCase))
				{
					pathType = ValidateVolumePath(rootDirectoryNorm) ?? TType.Windows_QuestionMarkVolume;
				}
				// TType.Windows_PeriodVolume - \\.\Volume{guid}
				else if (rootDirectoryNorm.StartsWith(@"\\.\Volume", StringComparison.OrdinalIgnoreCase))
				{
					pathType = ValidateVolumePath(rootDirectoryNorm) ?? TType.Windows_PeriodVolume;
				}
				// TType.Windows_DosDeviceLegacy - \\.\CON, \\.\COM1, \\.\LPT1
				else if (
					rootDirectoryNorm.StartsWith(@"\\.\") &&
					(
						rootDirectoryNorm.Length >= 7 && Enum.IsDefined(typeof(WindowsLegacyDevice), rootDirectoryNorm.Substring(4, 3)) ||
						rootDirectoryNorm.Length >= 8 && Enum.IsDefined(typeof(WindowsLegacyDevice), rootDirectoryNorm.Substring(4, 4))
					)
				)
				{
					string deviceName = rootDirectoryNorm[4..];
					int separatorIndex = deviceName.IndexOfAny(['\\']);
					if (separatorIndex >= 0) deviceName = deviceName[..separatorIndex];
					pathType = Enum.IsDefined(typeof(WindowsLegacyDevice), deviceName) ? TType.Windows_DosDeviceLegacy : TType.ErrorUnknownLegacyDevice;
				}
				// TType.Windows_QuestionMarkDosDeviceUnc - \\?\UNC\Server\Share
				else if (rootDirectoryNorm.StartsWith(@"\\?\UNC\", StringComparison.Ordinal))
				{
					pathType = ValidateUncPath(rootDirectoryNorm[8..]) ?? TType.Windows_QuestionMarkDosDeviceUnc;
				}
				// TType.Windows_PeriodDosDeviceUnc - \\.\UNC\Server\Share
				else if (rootDirectoryNorm.StartsWith(@"\\.\UNC\", StringComparison.Ordinal))
				{
					pathType = ValidateUncPath(rootDirectoryNorm[8..]) ?? TType.Windows_PeriodDosDeviceUnc;
				}
				// TType.Windows_QuestionMarkDosDevice - \\?\C:
				else if (rootDirectoryNorm.StartsWith(@"\\?\", StringComparison.Ordinal) && rootDirectoryNorm.Length >= 6)
				{
					pathType = ValidateDosDevicePath(rootDirectoryNorm) ?? TType.Windows_QuestionMarkDosDevice;
				}
				// TType.Windows_PeriodDosDevice - \\.\C:
				else if (rootDirectoryNorm.StartsWith(@"\\.\", StringComparison.Ordinal) && rootDirectoryNorm.Length >= 6)
				{
					pathType = ValidateDosDevicePath(rootDirectoryNorm) ?? TType.Windows_PeriodDosDevice;
				}
				// TType.Windows_Unc - \\Server\Share
				else if (rootDirectoryNorm.StartsWith(@"\\", StringComparison.Ordinal) &&
						 !rootDirectoryNorm.StartsWith(@"\\.\", StringComparison.Ordinal) &&
						 !rootDirectoryNorm.StartsWith(@"\\?\", StringComparison.Ordinal))
				{
					pathType = ValidateUncPath(rootDirectoryNorm[2..]) ?? TType.Windows_Unc;
				}
				// TType.ErrorInvalidDosDeviceFormat - dos device root directory starts with `"\\.\"` or `"\\?\"` but doesnt match any supported dos device type.
				else if (rootDirectoryNorm.StartsWith(@"\\?\", StringComparison.Ordinal) || rootDirectoryNorm.StartsWith(@"\\.\", StringComparison.Ordinal))
				{
					pathType = TType.ErrorInvalidDosDeviceFormat;
				}
				// Windows_Standard - C:
				else if (rootDirectoryNorm.Length >= 2 && rootDirectoryNorm[1] == ':' && validRootDirectoryLetters?.Length != 0)
				{
					bool isValidDriveLetter = false;
					if (Enum.TryParse(char.ToUpper(rootDirectoryNorm[0]).ToString(), out WindowsRootDirectoryLetter windowsRootDirectoryLetter))
					{
						if (validRootDirectoryLetters == null) isValidDriveLetter = true;
						else isValidDriveLetter = validRootDirectoryLetters.Contains(windowsRootDirectoryLetter);
					}
					if (isValidDriveLetter) pathType = TType.Windows_Standard;
				}

				// Create based on type
				return pathType switch
				{
					TType.Posix_DoubleSlash => CreatePosixDoubleSlash(),
					TType.Windows_Standard => CreateWindowsStandard(Enum.Parse<WindowsRootDirectoryLetter>(rootDirectoryNorm[0].ToString().ToUpper()), char.IsUpper(rootDirectoryNorm[0])),
					TType.Windows_Unc => CreateWindowsUnc(ParseUncFromRoot(rootDirectoryNorm, 2)),
					TType.Windows_QuestionMarkVolume => CreateWindowsQuestionMarkVolume(ParseVolumeGuid(rootDirectoryNorm)),
					TType.Windows_PeriodVolume => CreateWindowsPeriodVolume(ParseVolumeGuid(rootDirectoryNorm)),
					TType.Windows_QuestionMarkDosDevice => CreateWindowsQuestionMarkDosDevice(Enum.Parse<WindowsRootDirectoryLetter>(rootDirectoryNorm[4].ToString().ToUpper()), char.IsUpper(rootDirectoryNorm[4])),
					TType.Windows_PeriodDosDevice => CreateWindowsPeriodDosDevice(Enum.Parse<WindowsRootDirectoryLetter>(rootDirectoryNorm[4].ToString().ToUpper()), char.IsUpper(rootDirectoryNorm[4])),
					TType.Windows_QuestionMarkDosDeviceUnc => CreateWindowsQuestionMarkDosDeviceUnc(ParseUncFromRoot(rootDirectoryNorm, 8)),
					TType.Windows_PeriodDosDeviceUnc => CreateWindowsPeriodDosDeviceUnc(ParseUncFromRoot(rootDirectoryNorm, 8)),
					TType.Windows_DosDeviceLegacy => CreateWindowsDosDeviceLegacy(ParseLegacyDevice(rootDirectoryNorm)),
					TType.NotAvailable => Empty,

					TType.ErrorInvalidDriveLetter => CreateWindowsError(pathType),
					TType.ErrorInvalidDriveFormat => CreateWindowsError(pathType),
					TType.ErrorUncMissingShare => CreateWindowsError(pathType),
					TType.ErrorUncInvalidServerName => CreateWindowsError(pathType),
					TType.ErrorUncInvalidShareName => CreateWindowsError(pathType),
					TType.ErrorInvalidVolumeGuid => CreateWindowsError(pathType),
					TType.ErrorInvalidVolumeFormat => CreateWindowsError(pathType),
					TType.ErrorUnknownLegacyDevice => CreateWindowsError(pathType),
					TType.ErrorInvalidDosDeviceFormat => CreateWindowsError(pathType),

					_ => throw new NotImplementedException(rootDirectoryNorm.ToString())
				};
			}


			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static TType? ValidateUncPath(string uncPart)
			{
				string[] segments = uncPart.Split(['\\'], StringSplitOptions.RemoveEmptyEntries);

				if (segments.Length < 2) return TType.ErrorUncMissingShare;

				if (segments[0].IndexOfAny(INVALID_CHARS) >= 0) return TType.ErrorUncInvalidServerName;
				if (segments[1].IndexOfAny(INVALID_CHARS) >= 0) return TType.ErrorUncInvalidShareName;

				return null; // Valid
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static TType? ValidateVolumePath(string path)
			{
				int offset = 10;
				if (path.Length <= offset + 2 + 36 || path[offset] != '{' || path[offset + 1 + 36] != '}') return TType.ErrorInvalidVolumeFormat;

				string guidStr = path.Substring(offset + 1, 36);
				if (!Guid.TryParse(guidStr, out Guid guid)) return TType.ErrorInvalidVolumeGuid;
				if (guid == Guid.Empty) return TType.ErrorInvalidVolumeGuid;

				return null; // Valid
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static TType? ValidateDosDevicePath(string path)
			{
				int offset = 4;

				if (path.Length < offset + 2) return TType.ErrorInvalidDriveFormat;
				if (path[offset + 1] != ':') return TType.ErrorInvalidDriveFormat;

				char driveLetter = char.ToUpper(path[offset]);
				if (!Enum.IsDefined(typeof(WindowsRootDirectoryLetter), driveLetter.ToString())) return TType.ErrorInvalidDriveLetter;

				return null; // Valid
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static WindowsLegacyDevice ParseLegacyDevice(string path)
			{
				string deviceName = path[4..];
				int separatorIndex = deviceName.IndexOfAny(['\\']);
				if (separatorIndex >= 0) deviceName = deviceName[..separatorIndex];

				return Enum.Parse<WindowsLegacyDevice>(deviceName, true);
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static WindowsUncNetworkRoot ParseUncFromRoot(string rootDirectory, int startIndex)
			{
				var parts = rootDirectory[startIndex..].Split('\\', StringSplitOptions.RemoveEmptyEntries);
				return new WindowsUncNetworkRoot { UncServer = parts[0], UncShare = parts[1] };
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			static Guid ParseVolumeGuid(string rootDirectory)
			{
				return Guid.Parse(rootDirectory.AsSpan(11, 36));
			}

			#endregion

			#region Formatting

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public string Format(TContext context, DirectorySeparatorFormat directorySeparatorFormat = DirectorySeparatorFormat.Context, WindowsDriveLetterFormat windowsDriveLetterFormat = WindowsDriveLetterFormat.Original, VolumeGuidFormat volumeGuidFormat = VolumeGuidFormat.Original)
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
						s = context.DirectorySeparator;
						break;
					default: throw new NotImplementedException(directorySeparatorFormat.ToString());
				}

				bool upperLetter;
				switch (windowsDriveLetterFormat)
				{
					case WindowsDriveLetterFormat.LowerCase:
						upperLetter = false;
						break;
					case WindowsDriveLetterFormat.UpperCase:
						upperLetter = true;
						break;
					case WindowsDriveLetterFormat.Original:
						upperLetter = this.IsLetterUpperCase;
						break;
					default: throw new NotImplementedException(windowsDriveLetterFormat.ToString());
				}

				string volume;
				switch (volumeGuidFormat)
				{
					case VolumeGuidFormat.LowerCase:
						volume = this.Volume.ToString().ToLower();
						break;
					case VolumeGuidFormat.UpperCase:
						volume = this.Volume.ToString().ToUpper();
						break;
					case VolumeGuidFormat.Original:
						volume = this.Volume.ToString();
						break;
					default: throw new NotImplementedException(windowsDriveLetterFormat.ToString());
				}

				string? l = this.Letter != WindowsRootDirectoryLetter.Unset
					? upperLetter
					? this.Letter.ToString().ToUpperInvariant()
					: this.Letter.ToString().ToLowerInvariant()
					: null;

				return this.Type switch
				{
					TType.NotAvailable => "",
					TType.Posix_DoubleSlash => "/",   //	the second slash will be added by <see cref="UniPath"/> when formatting the path

					TType.Windows_Unc => @$"{s}{s}{this.UncNetworkRoot!.UncServer}{s}{this.UncNetworkRoot!.UncShare}",
					TType.Windows_QuestionMarkDosDeviceUnc => @$"{s}{s}?{s}UNC{s}{this.UncNetworkRoot!.UncServer}{s}{this.UncNetworkRoot!.UncShare}",
					TType.Windows_PeriodDosDeviceUnc => @$"{s}{s}.{s}UNC{s}{this.UncNetworkRoot!.UncServer}{s}{this.UncNetworkRoot!.UncShare}",
					TType.Windows_Standard => @$"{l}:",
					TType.Windows_QuestionMarkVolume => @$"{s}{s}?{s}Volume{{{volume}}}",
					TType.Windows_PeriodVolume => @$"{s}{s}.{s}Volume{{{volume}}}",
					TType.Windows_QuestionMarkDosDevice => @$"{s}{s}?{s}{this.Letter}:",
					TType.Windows_PeriodDosDevice => @$"{s}{s}.{s}{this.Letter}:",
					TType.Windows_DosDeviceLegacy => @$"{s}{s}.{s}{this.LegacyDevice}",

					TType.ErrorInvalidDriveLetter => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorInvalidDriveFormat => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorUncMissingShare => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorUncInvalidServerName => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorUncInvalidShareName => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorInvalidVolumeGuid => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorInvalidVolumeFormat => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorUnknownLegacyDevice => throw new FormatException($"Error: {this.Type}"),
					TType.ErrorInvalidDosDeviceFormat => throw new FormatException($"Error: {this.Type}"),

					_ => throw new NotImplementedException(this.Type.ToString())
				};
			}

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public string Format(DirectorySeparatorFormat directorySeparatorFormat = DirectorySeparatorFormat.Context, WindowsDriveLetterFormat windowsDriveLetterFormat = WindowsDriveLetterFormat.Original, VolumeGuidFormat volumeGuidFormat = VolumeGuidFormat.Original) => this.Format(TContext.Default, directorySeparatorFormat, windowsDriveLetterFormat, volumeGuidFormat);

			#endregion

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public override string ToString() => this.Format();

			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			public static bool IsErrorType(TType uniPathType)
			{
				switch (uniPathType)
				{
					case TType.NotAvailable:
					case TType.Posix_DoubleSlash:
					case TType.Windows_Standard:
					case TType.Windows_Unc:
					case TType.Windows_QuestionMarkVolume:
					case TType.Windows_PeriodVolume:
					case TType.Windows_QuestionMarkDosDevice:
					case TType.Windows_PeriodDosDevice:
					case TType.Windows_QuestionMarkDosDeviceUnc:
					case TType.Windows_PeriodDosDeviceUnc:
					case TType.Windows_DosDeviceLegacy:
						return false;
					case TType.ErrorInvalidDriveLetter:
					case TType.ErrorInvalidDriveFormat:
					case TType.ErrorUncMissingShare:
					case TType.ErrorUncInvalidServerName:
					case TType.ErrorUncInvalidShareName:
					case TType.ErrorInvalidVolumeGuid:
					case TType.ErrorInvalidVolumeFormat:
					case TType.ErrorUnknownLegacyDevice:
					case TType.ErrorInvalidDosDeviceFormat:
						return true;
					default: throw new NotImplementedException(uniPathType.ToString());
				}
			}

			public readonly bool IsEmpty => this.Type == TType.NotAvailable;
			public readonly bool IsError => IsErrorType(this.Type);
			public readonly int Length
			{
				get
				{
					return this.Type switch
					{
						TType.NotAvailable => 0,
						TType.Posix_DoubleSlash => 1,
						TType.Windows_Unc => 3 + this.UncNetworkRoot.UncServer.Length + this.UncNetworkRoot.UncShare.Length,
						TType.Windows_QuestionMarkDosDeviceUnc => 9 + this.UncNetworkRoot.UncServer.Length + this.UncNetworkRoot.UncShare.Length,
						TType.Windows_PeriodDosDeviceUnc => 9 + this.UncNetworkRoot.UncServer.Length + this.UncNetworkRoot.UncShare.Length,
						TType.Windows_Standard => 2,
						TType.Windows_QuestionMarkDosDevice => 6,
						TType.Windows_PeriodDosDevice => 6,
						TType.Windows_QuestionMarkVolume => 48,
						TType.Windows_PeriodVolume => 48,
						TType.Windows_DosDeviceLegacy => this.LegacyDevice switch
						{
							WindowsLegacyDevice.Unset => -1,

							WindowsLegacyDevice.AUX or
							WindowsLegacyDevice.CON or
							WindowsLegacyDevice.NUL or
							WindowsLegacyDevice.PRN => 7,

							WindowsLegacyDevice.COM1 or
							WindowsLegacyDevice.COM2 or
							WindowsLegacyDevice.COM3 or
							WindowsLegacyDevice.COM4 or
							WindowsLegacyDevice.COM5 or
							WindowsLegacyDevice.COM6 or
							WindowsLegacyDevice.COM7 or
							WindowsLegacyDevice.COM8 or
							WindowsLegacyDevice.COM9 or
							WindowsLegacyDevice.LPT1 or
							WindowsLegacyDevice.LPT2 or
							WindowsLegacyDevice.LPT3 or
							WindowsLegacyDevice.LPT4 or
							WindowsLegacyDevice.LPT5 or
							WindowsLegacyDevice.LPT6 or
							WindowsLegacyDevice.LPT7 or
							WindowsLegacyDevice.LPT8 or
							WindowsLegacyDevice.LPT9 => 8,

							_ => throw new NotImplementedException(this.LegacyDevice.ToString())
						},
						_ => throw new NotImplementedException(this.Type.ToString())
					};
				}
			}

			#region Struct Fields

			public readonly TType Type;

			public readonly WindowsRootDirectoryLetter Letter;

			public readonly bool IsLetterUpperCase;
			
			public readonly WindowsUncNetworkRoot UncNetworkRoot;

			public readonly WindowsLegacyDevice LegacyDevice;

			public readonly Guid Volume;

			#endregion
		}
	}
}