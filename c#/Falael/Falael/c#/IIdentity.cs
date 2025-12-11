namespace Falael
{
	public interface IIdentity<T>
	{
		bool IdentityEquals(T other);
		int GetIdentityHashCode();

		public class EqualityComparer : IEqualityComparer<T>
		{
			public static EqualityComparer Default = new();

			public bool Equals(T? x, T? y)
			{
				if (x == null || y == null) return x == null && y == null;
				return ((IIdentity<T>)x).IdentityEquals(y);
			}

			public int GetHashCode(T obj) => ((IIdentity<T>)obj!).GetIdentityHashCode();
		}
	}
}