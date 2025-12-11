//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
namespace Falael
{
	public partial struct UniPath
	{
		public enum WindowsLegacyDevice : int
		{
			Unset = 0,
			CON, PRN, AUX, NUL,
			COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9,
			LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9
		}
	}
}