//	R0Q0/daniel/20250906
namespace Falael
{
	public partial struct UniPath
	{
		/// <summary>
		/// Provides the means to specify the desired handling of Paths that start with `@"\\"` or `"//"` sequences that are immediately followed by EOS or a non-'/', non-'\\' character.
		/// </summary>
		public enum PosixDoubleSlashHandling
		{
			/// <summary>
			/// Instructs <see cref="UniPathRootDirectory"/> and <see cref="UniPath"/> to treat Paths that match the definition of <see cref="UniPathType.Posix_DoubleSlash"/> as a POSIX double slash root `"//"`.
			/// </summary>
			Undefined,
			/// Instructs <see cref="UniPathRootDirectory"/> and <see cref="UniPath"/> to treat Paths that match the definition of <see cref="UniPathType.Posix_DoubleSlash"/> as a Windows-specific "\\" prefix for multiple root directory formats: 
			/// - <see cref="UniPathType.Windows_Unc">, 
			/// - <see cref="UniPathType.Windows_QuestionMarkVolume">
			/// - <see cref="UniPathType.Windows_PeriodVolume">
			/// - <see cref="UniPathType.Windows_QuestionMarkDosDevice">
			/// - <see cref="UniPathType.Windows_PeriodDosDevice">
			/// - <see cref="UniPathType.Windows_QuestionMarkDosDeviceUnc">
			/// - <see cref="UniPathType.Windows_PeriodDosDeviceUnc">
			/// - <see cref="UniPathType.Windows_DosDeviceLegacy">
			/// </summary>
			Windows,
		}
	}
}