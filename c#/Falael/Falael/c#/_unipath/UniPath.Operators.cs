//	R0Q4/daniel/20250906
//	TODO:
//	- doc
//	- test
namespace Falael
{
	public partial struct UniPath
	{
		public static implicit operator string(UniPath path) => path.ToString();
		public static bool operator ==(UniPath left, UniPath right) => left.Equals(right);
		public static bool operator !=(UniPath left, UniPath right) => !left.Equals(right);
	}
}