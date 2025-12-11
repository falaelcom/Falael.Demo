//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
namespace Falael
{
	public partial struct UniPath
	{
		public enum DirectorySeparatorFormat
		{
			Windows,
			Posix,
			Native,
			Context,
		}

		public enum DirectoryTrailingSeparatorFormat
		{
			Always,
			Never,
			Original,
		}

		public enum DirectoryTrailingSeparatorEquality
		{
			Respect,
			Ignore,
		}

		public enum WindowsDriveLetterFormat
		{
			LowerCase,
			UpperCase,
			Original,
		}

		public enum VolumeGuidFormat
		{
			LowerCase,
			UpperCase,
			Original,
		}
	}
}