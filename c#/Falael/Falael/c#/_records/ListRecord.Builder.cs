using System.Collections;
using System.Collections.Immutable;
using System.Diagnostics;

namespace Falael
{
	#region ListRecord<T>

	public sealed partial class ListRecord<T>
	{
		#region Builder

		[DebuggerDisplay("Count = {Count}, IsReadOnly = false")]
		[DebuggerTypeProxy(typeof(ListRecordBuilderDebugView<>))]
		public sealed class Builder : IList<T>, IList, IReadOnlyList<T>
		{
			internal Builder(ListRecord<T> source) => this.immbuilder = source.immlist.ToBuilder();
			public Builder() => this.immbuilder = ImmutableList.CreateBuilder<T>();

			#region IReadOnlyList<TKey, TValue>

			public T this[int index]
			{
				get => this.immbuilder[index];
				set => this.immbuilder[index] = value;
			}

			#endregion

			#region ItemRef Indexer

			public ref readonly T ItemRef(int index) => ref this.immbuilder.ItemRef(index);

			#endregion

			#region IList<T>

			public int Count => this.immbuilder.Count;
			bool ICollection<T>.IsReadOnly => false;
			public int IndexOf(T item) => this.immbuilder.IndexOf(item);
			public void Insert(int index, T item) => this.immbuilder.Insert(index, item);
			public void RemoveAt(int index) => this.immbuilder.RemoveAt(index);
			public void Add(T item) => this.immbuilder.Add(item);
			public void Clear() => this.immbuilder.Clear();
			public bool Contains(T item) => this.immbuilder.Contains(item);
			public bool Remove(T item) => this.immbuilder.Remove(item);
			public ImmutableList<T>.Enumerator GetEnumerator() => this.immbuilder.GetEnumerator();
			IEnumerator<T> IEnumerable<T>.GetEnumerator() => this.immbuilder.GetEnumerator();
			IEnumerator IEnumerable.GetEnumerator() => this.immbuilder.GetEnumerator();

			#endregion

			#region IImmutableListQueries<T>

			public void ForEach(Action<T> action) => this.immbuilder.ForEach(action);
			public void CopyTo(T[] array) => this.immbuilder.CopyTo(array);
			public void CopyTo(T[] array, int arrayIndex) => this.immbuilder.CopyTo(array, arrayIndex);
			public void CopyTo(int index, T[] array, int arrayIndex, int count) => this.immbuilder.CopyTo(index, array, arrayIndex, count);
			public ImmutableList<T> GetRange(int index, int count) => this.immbuilder.GetRange(index, count);
			public ImmutableList<TOutput> ConvertAll<TOutput>(Func<T, TOutput> converter) => this.immbuilder.ConvertAll(converter);
			public bool Exists(Predicate<T> match) => this.immbuilder.Exists(match);
			public T? Find(Predicate<T> match) => this.immbuilder.Find(match);
			public ImmutableList<T> FindAll(Predicate<T> match) => this.immbuilder.FindAll(match);
			public int FindIndex(Predicate<T> match) => this.immbuilder.FindIndex(match);
			public int FindIndex(int startIndex, Predicate<T> match) => this.immbuilder.FindIndex(startIndex, match);
			public int FindIndex(int startIndex, int count, Predicate<T> match) => this.immbuilder.FindIndex(startIndex, count, match);
			public T? FindLast(Predicate<T> match) => this.immbuilder.FindLast(match);
			public int FindLastIndex(Predicate<T> match) => this.immbuilder.FindLastIndex(match);
			public int FindLastIndex(int startIndex, Predicate<T> match) => this.immbuilder.FindLastIndex(startIndex, match);
			public int FindLastIndex(int startIndex, int count, Predicate<T> match) => this.immbuilder.FindLastIndex(startIndex, count, match);
			public int IndexOf(T item, int index) => this.immbuilder.IndexOf(item, index, this.Count - index, EqualityComparer<T>.Default);
			public int IndexOf(T item, int index, int count) => this.immbuilder.IndexOf(item, index, count, EqualityComparer<T>.Default);
			public int IndexOf(T item, int index, int count, IEqualityComparer<T>? equalityComparer) => this.immbuilder.IndexOf(item, index, count, equalityComparer);
			public int LastIndexOf(T item) => this.immbuilder.LastIndexOf(item);
			public int LastIndexOf(T item, int startIndex) => this.immbuilder.LastIndexOf(item, startIndex);
			public int LastIndexOf(T item, int startIndex, int count) => this.immbuilder.LastIndexOf(item, startIndex, count, EqualityComparer<T>.Default);
			public int LastIndexOf(T item, int startIndex, int count, IEqualityComparer<T>? equalityComparer) => this.immbuilder.LastIndexOf(item, startIndex, count, equalityComparer);
			public bool TrueForAll(Predicate<T> match) => this.immbuilder.TrueForAll(match);

			#endregion

			#region Public

			public void AddRange(IEnumerable<T> items) => this.immbuilder.AddRange(items);

			public void InsertRange(int index, IEnumerable<T> items) => this.immbuilder.InsertRange(index, items);

			public int RemoveAll(Predicate<T> match) => this.immbuilder.RemoveAll(match);

			public bool Remove(T item, IEqualityComparer<T>? equalityComparer) => this.immbuilder.Remove(item, equalityComparer);

			public void RemoveRange(int index, int count) => this.immbuilder.RemoveRange(index, count);

			public void RemoveRange(IEnumerable<T> items, IEqualityComparer<T>? equalityComparer) => this.immbuilder.RemoveRange(items, equalityComparer);

			public void RemoveRange(IEnumerable<T> items) => this.immbuilder.RemoveRange(items);

			public void Replace(T oldValue, T newValue) => this.immbuilder.Replace(oldValue, newValue);

			public void Replace(T oldValue, T newValue, IEqualityComparer<T>? equalityComparer) => this.immbuilder.Replace(oldValue, newValue, equalityComparer);

			public void Reverse() => this.immbuilder.Reverse();

			public void Reverse(int index, int count) => this.immbuilder.Reverse(index, count);

			public void Sort() => this.immbuilder.Sort();

			public void Sort(Comparison<T> comparison) => this.immbuilder.Sort(comparison);

			public void Sort(IComparer<T>? comparer) => this.immbuilder.Sort(comparer);

			public void Sort(int index, int count, IComparer<T>? comparer) => this.immbuilder.Sort(index, count, comparer);

			public int BinarySearch(T item) => this.immbuilder.BinarySearch(item);

			public int BinarySearch(T item, IComparer<T>? comparer) => this.immbuilder.BinarySearch(item, comparer);

			public int BinarySearch(int index, int count, T item, IComparer<T>? comparer) => this.immbuilder.BinarySearch(index, count, item, comparer);

			public ListRecord<T> ToListRecord() => new(this.immbuilder.ToImmutable());

			#endregion

			#region IList

			int IList.Add(object? value)
			{
				this.immbuilder.Add((T)value!);
				return this.Count - 1;
			}

			void IList.Clear()
			{
				this.immbuilder.Clear();
			}

			bool IList.Contains(object? value)
			{
				if (IsCompatibleObject(value))
				{
					return this.immbuilder.Contains((T)value!);
				}

				return false;
			}

			int IList.IndexOf(object? value)
			{
				if (IsCompatibleObject(value))
				{
					return this.immbuilder.IndexOf((T)value!);
				}

				return -1;
			}

			void IList.Insert(int index, object? value)
			{
				this.immbuilder.Insert(index, (T)value!);
			}

			bool IList.IsFixedSize
			{
				get { return false; }
			}

			bool IList.IsReadOnly
			{
				get { return false; }
			}

			void IList.Remove(object? value)
			{
				if (IsCompatibleObject(value))
				{
					this.immbuilder.Remove((T)value!);
				}
			}

			object? IList.this[int index]
			{
				get { return this.immbuilder[index]; }
				set { this.immbuilder[index] = (T)value!; }
			}

			#endregion

			#region ICollection

			void ICollection.CopyTo(Array array, int arrayIndex) => ((ICollection)this.immbuilder).CopyTo(array, arrayIndex);

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			bool ICollection.IsSynchronized
			{
				get { return false; }
			}

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			object ICollection.SyncRoot
			{
				get
				{
					if (this.syncRoot == null)
					{
						Interlocked.CompareExchange<object?>(ref this.syncRoot, new object(), null);
					}

					return this.syncRoot;
				}
			}
			#endregion

			readonly ImmutableList<T>.Builder immbuilder;

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			object? syncRoot;
		}

		#endregion
	}

	#endregion

	#region ListRecordBuilderDebugView<T>

	internal sealed class ListRecordBuilderDebugView<T>
	{
		public ListRecordBuilderDebugView(ListRecord<T>.Builder builder)
		{
			this.builder = builder;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public T[] Items => [.. this.builder];

		readonly ListRecord<T>.Builder builder;
	}

	#endregion
}