using System.Collections;
using System.Collections.Immutable;
using System.Diagnostics;

namespace Falael
{
	#region HashSetRecord<T>

	public sealed partial class HashSetRecord<T>
	{
		#region Builder

		[DebuggerDisplay("Count = {Count}, IsReadOnly = false")]
		[DebuggerTypeProxy(typeof(HashSetRecordBuilderDebugView<>))]
		public sealed class Builder : ISet<T>, ICollection<T>, IReadOnlyCollection<T>, IEnumerable<T>, IEnumerable
		{
			internal Builder(HashSetRecord<T> source) => this.immbuilder = source.immhs.ToBuilder();
			public Builder() => this.immbuilder = ImmutableHashSet.CreateBuilder<T>();
			public Builder(IEqualityComparer<T> equalityComparer) => this.immbuilder = ImmutableHashSet.CreateBuilder<T>(equalityComparer);

			#region Public methods

			public HashSetRecord<T> ToHashSetRecord() => new(this.immbuilder.ToImmutable());

			#endregion

			#region IEnumerable

			IEnumerator IEnumerable.GetEnumerator() => this.immbuilder.GetEnumerator();

			#endregion

			#region IEnumerable<T>

			IEnumerator<T> IEnumerable<T>.GetEnumerator() => this.immbuilder.GetEnumerator();

			#endregion

			#region IReadOnlyCollection<T>

			public int Count => this.immbuilder.Count;

			#endregion

			#region ICollection<T>

			int ICollection<T>.Count => this.immbuilder.Count;
			bool ICollection<T>.IsReadOnly => false;
			void ICollection<T>.Add(T item) => this.immbuilder.Add(item);
			void ICollection<T>.Clear() => this.immbuilder.Clear();
			bool ICollection<T>.Contains(T item) => this.immbuilder.Contains(item);
			bool ICollection<T>.Remove(T item) => this.immbuilder.Remove(item);
			void ICollection<T>.CopyTo(T[] array, int arrayIndex) => ((ICollection<T>)this.immbuilder).CopyTo(array, arrayIndex);

			#endregion

			#region ISet<T>

			public bool Add(T item) => this.immbuilder.Add(item);
			public void Clear() => this.immbuilder.Clear();
			public bool Contains(T item) => this.immbuilder.Contains(item);
			public bool Remove(T item) => this.immbuilder.Remove(item);
			public void ExceptWith(IEnumerable<T> other) => this.immbuilder.ExceptWith(other);
			public void IntersectWith(IEnumerable<T> other) => this.immbuilder.IntersectWith(other);
			public bool IsProperSubsetOf(IEnumerable<T> other) => this.immbuilder.IsProperSubsetOf(other);
			public bool IsProperSupersetOf(IEnumerable<T> other) => this.immbuilder.IsProperSupersetOf(other);
			public bool IsSubsetOf(IEnumerable<T> other) => this.immbuilder.IsSubsetOf(other);
			public bool IsSupersetOf(IEnumerable<T> other) => this.immbuilder.IsSupersetOf(other);
			public bool Overlaps(IEnumerable<T> other) => this.immbuilder.Overlaps(other);
			public bool SetEquals(IEnumerable<T> other) => this.immbuilder.SetEquals(other);
			public void SymmetricExceptWith(IEnumerable<T> other) => this.immbuilder.SymmetricExceptWith(other);
			public void UnionWith(IEnumerable<T> other) => this.immbuilder.UnionWith(other);

			#endregion

			#region ImmutableHashSet<T>

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			public bool IsEmpty => this.immbuilder.Count == 0;

			public bool TryGetValue(T equalValue, out T actualValue) => this.immbuilder.TryGetValue(equalValue, out actualValue);

			#endregion

			public IEqualityComparer<T> KeyComparer
			{
				get => this.immbuilder.KeyComparer;
				set => this.immbuilder.KeyComparer = value;
			}

			readonly ImmutableHashSet<T>.Builder immbuilder;
		}

		#endregion
	}

	#endregion

	#region ListRecordBuilderDebugView<T>

	internal sealed class HashSetRecordBuilderDebugView<T>
	{
		public HashSetRecordBuilderDebugView(HashSetRecord<T>.Builder builder)
		{
			this.builder = builder;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public T[] Items => [.. this.builder];

		readonly HashSetRecord<T>.Builder builder;
	}

	#endregion
}