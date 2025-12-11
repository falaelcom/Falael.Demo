using System.Collections;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Falael
{
	#region ListRecord<T>

	///	<seealso cref="System.Collections.Immutable.ImmutableList<T>"/>
	[CollectionBuilder(typeof(ListRecord), nameof(ListRecord.Create))]
	[DebuggerDisplay("Count = {Count}, IsReadOnly = true")]
	[DebuggerTypeProxy(typeof(ListRecordDebugView<>))]
	public sealed partial class ListRecord<T> : IEnumerable<T>, IEnumerable, IReadOnlyList<T>, IReadOnlyCollection<T>, IList<T>, IList, ICollection<T>, IEquatable<ListRecord<T>>
	{
		public static readonly ListRecord<T> Empty = [];

		public ListRecord(ListRecord<T> value)
		{
			this.immlist = value.immlist;
		}

		public ListRecord(IEnumerable<T> value)
		{
			if (value is ListRecord<T> coll) this.immlist = coll.immlist;
			else if (value is ImmutableList<T> immlist) this.immlist = immlist;
			else this.immlist = ImmutableList.CreateRange(value);
		}

		public ListRecord()
		{
			this.immlist = [];
		}

		#region IEquatable<ListRecord<T>>

		public bool Equals(ListRecord<T>? other)
		{
			if (other is null) return false;
			return this.immlist.SequenceEqual(other.immlist);
		}

		#endregion

		#region IEnumerable

		IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();

		#endregion

		#region IEnumerable<T>

		public IEnumerator<T> GetEnumerator() => this.immlist.GetEnumerator();

		#endregion

		#region IReadOnlyCollection<T>

		public int Count => this.immlist.Count;

		#endregion

		#region IReadOnlyList<T>

		public T this[int index] => this.immlist[index];

		#endregion

		#region IList<T>

		public int IndexOf(T item) => this.immlist.IndexOf(item);

		public int LastIndexOf(T item) => this.immlist.LastIndexOf(item);

		void IList<T>.Insert(int index, T item) => throw new NotSupportedException();

		void IList<T>.RemoveAt(int index) => throw new NotSupportedException();

		T IList<T>.this[int index]
		{
			get => this[index];
			set => throw new NotSupportedException();
		}

		#endregion

		#region ICollection<T>

		void ICollection<T>.Add(T item) => throw new NotSupportedException();

		void ICollection<T>.Clear() => throw new NotSupportedException();

		bool ICollection<T>.IsReadOnly => true;

		bool ICollection<T>.Remove(T item) => throw new NotSupportedException();

		public void CopyTo(T[] array, int arrayIndex) => this.immlist.CopyTo(array, arrayIndex);

		#endregion

		#region ICollection

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		object ICollection.SyncRoot => this;

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		bool ICollection.IsSynchronized => true;

		void ICollection.CopyTo(Array array, int arrayIndex) => this.immlist.ToArray().CopyTo(array, arrayIndex);

		#endregion

		#region IList members

		int IList.Add(object? value) => throw new NotSupportedException();

		void IList.RemoveAt(int index) => throw new NotSupportedException();

		void IList.Clear() => throw new NotSupportedException();

		bool IList.Contains(object? value) => IsCompatibleObject(value) && this.Contains((T)value!);

		int IList.IndexOf(object? value) => IsCompatibleObject(value) ? this.IndexOf((T)value!) : -1;

		void IList.Insert(int index, object? value) => throw new NotSupportedException();

		bool IList.IsFixedSize => true;

		bool IList.IsReadOnly => true;

		void IList.Remove(object? value) => throw new NotSupportedException();

		object? IList.this[int index]
		{
			get => this[index];
			set => throw new NotSupportedException();
		}

		#endregion

		#region With-Mutations

		public ListRecord<T> WithAdd(T value) => new(this.immlist.Add(value));
		public ListRecord<T> WithAddRange(IEnumerable<T> items) => new(this.immlist.AddRange(items));
		public ListRecord<T> WithClear() => Empty;
		public ListRecord<T> WithInsert(int index, T value) => new(this.immlist.Insert(index, value));
		public ListRecord<T> WithInsertRange(int index, IEnumerable<T> items) => new(this.immlist.InsertRange(index, items));
		public ListRecord<T> WithRemove(T value) => new(this.immlist.Remove(value));
		public ListRecord<T> WithRemove(T value, IEqualityComparer<T>? ec) => new(this.immlist.Remove(value, ec));
		public ListRecord<T> WithRemoveAll(Predicate<T> match) => new(this.immlist.RemoveAll(match));
		public ListRecord<T> WithRemoveAt(int index) => new(this.immlist.RemoveAt(index));
		public ListRecord<T> WithRemoveRange(IEnumerable<T> items) => new(this.immlist.RemoveRange(items));
		public ListRecord<T> WithRemoveRange(IEnumerable<T> items, IEqualityComparer<T>? ec) => new(this.immlist.RemoveRange(items, ec));
		public ListRecord<T> WithRemoveRange(int index, int count) => new(this.immlist.RemoveRange(index, count));
		public ListRecord<T> WithReplace(T oldv, T newv) => new(this.immlist.Replace(oldv, newv));
		public ListRecord<T> WithReplace(T oldv, T newv, IEqualityComparer<T>? ec) => new(this.immlist.Replace(oldv, newv, ec));
		public ListRecord<T> WithReverse() => new(this.immlist.Reverse());
		public ListRecord<T> WithReverse(int index, int count) => new(this.immlist.Reverse(index, count));
		public ListRecord<T> WithSort() => new(this.immlist.Sort());
		public ListRecord<T> WithSort(Comparison<T> comparison) => new(this.immlist.Sort(comparison));
		public ListRecord<T> WithSort(IComparer<T>? comparer) => new(this.immlist.Sort(comparer));
		public ListRecord<T> WithSort(int index, int count, IComparer<T>? comparer) => new(this.immlist.Sort(index, count, comparer));
		public ListRecord<T> WithSetItem(int index, T value) => new(this.immlist.SetItem(index, value));
		public ListRecord<T> WithUnion(IEnumerable<T> other) => new(this.immlist.Union(other));
		public ListRecord<T> WithUnion(params IEnumerable<T>[] others) => new(this.immlist.Union(others.SelectMany(x => x)));
		public ListRecord<T> WithIntersect(IEnumerable<T> other) => new(this.immlist.Intersect(other));
		public ListRecord<T> WithIntersect(params IEnumerable<T>[] others) => new(this.immlist.Intersect(others.SelectMany(x => x)));
		public ListRecord<T> WithExcept(IEnumerable<T> other) => new(this.immlist.Except(other));
		public ListRecord<T> WithSymmetricExcept(IEnumerable<T> other)
			=> new(this.immlist.Except(other).Concat(other.Except(this.immlist)));
		public ListRecord<T> WithConcat(IEnumerable<T> other) => new(this.immlist.Concat(other));
		public (ListRecord<T> Matched, ListRecord<T> Unmatched) WithPartition(Func<T, bool> predicate)
			=> (this.immlist.Where(predicate).ToListRecord(), this.immlist.Where(x => !predicate(x)).ToListRecord());

		#endregion

		#region ImmutableList<T>::IImmutableListQueries<T>

		public void ForEach(Action<T> action) => this.immlist.ForEach(action);
		public void CopyTo(T[] array) => this.immlist.CopyTo(array);
		public void CopyTo(int index, T[] array, int arrayIndex, int count) => this.immlist.CopyTo(index, array, arrayIndex, count);
		public ListRecord<T> GetRange(int index, int count) => new(this.immlist.GetRange(index, count));
		public ListRecord<TOutput> ConvertAll<TOutput>(Func<T, TOutput> converter) => new(this.immlist.ConvertAll(converter));
		public bool Exists(Predicate<T> match) => this.immlist.Exists(match);
		public T? Find(Predicate<T> match) => this.immlist.Find(match);
		public ListRecord<T> FindAll(Predicate<T> match) => new(this.immlist.FindAll(match));
		public int FindIndex(Predicate<T> match) => this.immlist.FindIndex(match);
		public int FindIndex(int startIndex, Predicate<T> match) => this.immlist.FindIndex(startIndex, match);
		public int FindIndex(int startIndex, int count, Predicate<T> match) => this.immlist.FindIndex(startIndex, count, match);
		public T? FindLast(Predicate<T> match) => this.immlist.FindLast(match);
		public int FindLastIndex(Predicate<T> match) => this.immlist.FindLastIndex(match);
		public int FindLastIndex(int startIndex, Predicate<T> match) => this.immlist.FindLastIndex(startIndex, match);
		public int FindLastIndex(int startIndex, int count, Predicate<T> match) => this.immlist.FindLastIndex(startIndex, count, match);
		public int IndexOf(T item, int index, int count, IEqualityComparer<T>? equalityComparer) => this.immlist.IndexOf(item, index, count, equalityComparer);
		public int LastIndexOf(T item, int index, int count, IEqualityComparer<T>? equalityComparer) => this.immlist.LastIndexOf(item, index, count, equalityComparer);
		public bool TrueForAll(Predicate<T> match) => this.immlist.TrueForAll(match);

		#endregion

		#region ImmutableList<T>

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		public bool IsEmpty => this.immlist.IsEmpty;

		public ref readonly T ItemRef(int index) => ref this.immlist.ItemRef(index);

		public bool Contains(T item) => this.immlist.Contains(item);

		public Builder ToBuilder() => new(this);

		#endregion

		#region LINQ - Typed

		public ListRecord<T> Where(Func<T, bool> predicate) => new(this.immlist.Where(predicate));
		public ListRecord<T> Where(Func<T, int, bool> predicate) => new(this.immlist.Where(predicate));
		public ListRecord<T> OrderBy<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer = null) => new(this.immlist.OrderBy(keySelector, comparer));
		public ListRecord<T> OrderByDescending<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer = null) => new(this.immlist.OrderByDescending(keySelector, comparer));
		public ListRecord<T> Distinct(IEqualityComparer<T>? comparer = null) => new(this.immlist.Distinct(comparer));
		public ListRecord<T> DistinctBy<TKey>(Func<T, TKey> keySelector) => new(this.immlist.DistinctBy(keySelector));
		public ListRecord<T> Skip(int count) => new(this.immlist.Skip(count));
		public ListRecord<T> Take(int count) => new(this.immlist.Take(count));
		public ListRecord<TResult> Select<TResult>(Func<T, TResult> selector) => new(this.immlist.Select(selector));
		public ListRecord<TResult> Select<TResult>(Func<T, int, TResult> selector) => new(this.immlist.Select(selector));
		public ListRecord<TResult> OfType<TResult>() => new(this.immlist.OfType<TResult>());
		public ListRecord<TResult> Cast<TResult>() => new(this.immlist.Cast<TResult>());

		#endregion

		#region Overrides

		public override string ToString() => $"[{string.Join(", ", this.immlist)}]";

		public override bool Equals(object? obj)
		{
			if (obj is null) return false;
			if (ReferenceEquals(this, obj)) return true;
			return obj is ListRecord<T> other && this.Equals(other);
		}

		public override int GetHashCode()
		{
			if (this.immlist.IsEmpty) return 0;
			return this.immlist.Aggregate(0, (hash, item) => HashCode.Combine(hash, item?.GetHashCode() ?? 0));
		}

		public static bool operator ==(ListRecord<T>? left, ListRecord<T>? right)
		{
			if (ReferenceEquals(left, right)) return true;
			if (left is null || right is null) return false;
			return left.Equals(right);
		}

		public static bool operator !=(ListRecord<T>? left, ListRecord<T>? right) => !(left == right);

		#endregion

		#region Private

		static bool IsCompatibleObject(object? value)
		{
			return value is T || default(T) == null && value == null;
		}

		#endregion

		readonly ImmutableList<T> immlist;
	}

	#endregion

	#region ListRecordDebugView<T>

	internal sealed class ListRecordDebugView<T>
	{
		public ListRecordDebugView(ListRecord<T> collection)
		{
			this.collection = collection;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public T[] Items => [.. this.collection];

		readonly ListRecord<T> collection;
	}

	#endregion

	#region ListRecord

	public static class ListRecord
	{
		public static ListRecord<T> Create<T>(ReadOnlySpan<T> items) => new(items.ToArray());

		#region Extension Methods

		public static ListRecord<T> ToListRecord<T>(this ImmutableList<T> source) => new(source);
		public static ListRecord<T> ToListRecord<T>(this IEnumerable<T> source) => new(source);

		#endregion

		#region JSON Serialization

		public class JsonConverter<T> : global::System.Text.Json.Serialization.JsonConverter<ListRecord<T>>
		{
			public override ListRecord<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
			{
				if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException("Expected StartArray token");
				var builder = new ListRecord<T>.Builder();
				while (reader.Read())
				{
					if (reader.TokenType == JsonTokenType.EndArray) return builder.ToListRecord();
					var item = JsonSerializer.Deserialize<T>(ref reader, options);
					if (item != null) builder.Add(item);
				}
				throw new JsonException("Expected EndArray token");
			}

			public override void Write(Utf8JsonWriter writer, ListRecord<T> value, JsonSerializerOptions options)
			{
				writer.WriteStartArray();
				foreach (var item in value) JsonSerializer.Serialize(writer, item, options);
				writer.WriteEndArray();
			}
		}

		public class JsonConverterFactory : global::System.Text.Json.Serialization.JsonConverterFactory
		{
			public override bool CanConvert(Type typeToConvert)
			{
				if (!typeToConvert.IsGenericType) return false;
				return typeToConvert.GetGenericTypeDefinition() == typeof(ListRecord<>);
			}

			public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
			{
				var elementType = typeToConvert.GetGenericArguments()[0];
				var converterType = typeof(ListRecord.JsonConverter<>).MakeGenericType(elementType);
				return (JsonConverter)Activator.CreateInstance(converterType)!;
			}
		}

		#endregion
	}

	#endregion
}