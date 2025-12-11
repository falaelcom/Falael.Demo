using System.Collections;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Falael
{
	#region HashSetRecord<T>

	///	<seealso cref="System.Collections.Immutable.ImmutableHashSet<T>"/>
	[CollectionBuilder(typeof(HashSetRecord), nameof(HashSetRecord.Create))]
	[DebuggerDisplay("Count = {Count}, IsReadOnly = true")]
	[DebuggerTypeProxy(typeof(HashSetRecordDebugView<>))]
	public sealed partial class HashSetRecord<T> : IEnumerable<T>, IEnumerable, IReadOnlyCollection<T>, ICollection<T>, ISet<T>, IReadOnlySet<T>, ICollection, IEquatable<HashSetRecord<T>>
	{
		public static readonly HashSetRecord<T> Empty = new();

		public HashSetRecord(IEnumerable<T> value, IEqualityComparer<T> equalityComparer)
		{
			this.immhs = ImmutableHashSet.CreateRange(equalityComparer, value);
		}

		public HashSetRecord(IEnumerable<T> value)
		{
			if (typeof(IIdentity<T>).IsAssignableFrom(typeof(T)))
			{
				this.immhs = ImmutableHashSet.CreateRange(IIdentity<T>.EqualityComparer.Default, value);
				return;
			}
			if (value is HashSetRecord<T> coll) this.immhs = coll.immhs;
			else if (value is ImmutableHashSet<T> immlist) this.immhs = immlist;
			else this.immhs = ImmutableHashSet.CreateRange(value);
		}

		public HashSetRecord(IEqualityComparer<T>? equalityComparer = null)
		{
			if (typeof(IIdentity<T>).IsAssignableFrom(typeof(T)))
			{
				this.immhs = equalityComparer == null 
					? ImmutableHashSet.Create((IEqualityComparer<T>)IIdentity<T>.EqualityComparer.Default) 
					: ImmutableHashSet.Create(equalityComparer);
				return;
			}
			this.immhs = equalityComparer == null ? [] : ImmutableHashSet.Create(equalityComparer);
		}

		public HashSetRecord(HashSetRecord<T> value)
		{
			this.immhs = value.immhs;
		}

		#region IEquatable<HashSetRecord<T>>

		public bool Equals(HashSetRecord<T>? other)
		{
			if (other is null) return false;
			return this.immhs.SequenceEqual(other.immhs);
		}

		#endregion

		#region IEnumerable

		IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();

		#endregion

		#region IEnumerable<T>

		public IEnumerator<T> GetEnumerator() => this.immhs.GetEnumerator();

		#endregion

		#region IReadOnlyCollection<T>

		public int Count => this.immhs.Count;

		#endregion

		#region ICollection<T>

		void ICollection<T>.Add(T item) => throw new NotSupportedException();
		void ICollection<T>.Clear() => throw new NotSupportedException();
		bool ICollection<T>.IsReadOnly => true;
		bool ICollection<T>.Remove(T item) => throw new NotSupportedException();
		public void CopyTo(T[] array, int arrayIndex) => this.immhs.ToArray().CopyTo(array, arrayIndex);

		#endregion

		#region ICollection

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		object ICollection.SyncRoot => this;

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		bool ICollection.IsSynchronized => true;

		void ICollection.CopyTo(Array array, int arrayIndex) => this.immhs.ToArray().CopyTo(array, arrayIndex);

		#endregion

		#region ISet<T>

		bool ISet<T>.Add(T item) => throw new NotSupportedException();
		void ISet<T>.ExceptWith(IEnumerable<T> other) => throw new NotSupportedException();
		void ISet<T>.IntersectWith(IEnumerable<T> other) => throw new NotSupportedException();
		bool ISet<T>.IsProperSubsetOf(IEnumerable<T> other) => this.immhs.IsProperSubsetOf(other);
		bool ISet<T>.IsProperSupersetOf(IEnumerable<T> other) => this.immhs.IsProperSupersetOf(other);
		bool ISet<T>.IsSubsetOf(IEnumerable<T> other) => this.immhs.IsSubsetOf(other);
		bool ISet<T>.IsSupersetOf(IEnumerable<T> other) => this.immhs.IsSupersetOf(other);
		bool ISet<T>.Overlaps(IEnumerable<T> other) => this.immhs.Overlaps(other);
		bool ISet<T>.SetEquals(IEnumerable<T> other) => this.immhs.SetEquals(other);
		void ISet<T>.SymmetricExceptWith(IEnumerable<T> other) => throw new NotSupportedException();
		void ISet<T>.UnionWith(IEnumerable<T> other) => throw new NotSupportedException();

		#endregion

		#region IReadOnlySet<T>

		bool IReadOnlySet<T>.Contains(T item) => this.immhs.Contains(item);
		bool IReadOnlySet<T>.IsProperSubsetOf(IEnumerable<T> other) => this.immhs.IsProperSubsetOf(other);
		bool IReadOnlySet<T>.IsProperSupersetOf(IEnumerable<T> other) => this.immhs.IsProperSupersetOf(other);
		bool IReadOnlySet<T>.IsSubsetOf(IEnumerable<T> other) => this.immhs.IsSubsetOf(other);
		bool IReadOnlySet<T>.IsSupersetOf(IEnumerable<T> other) => this.immhs.IsSupersetOf(other);
		bool IReadOnlySet<T>.Overlaps(IEnumerable<T> other) => this.immhs.Overlaps(other);
		bool IReadOnlySet<T>.SetEquals(IEnumerable<T> other) => this.immhs.SetEquals(other);

		#endregion

		#region With-Mutations

		public HashSetRecord<T> WithAdd(T value) => new(this.immhs.Add(value));
		public HashSetRecord<T> WithAddRange(IEnumerable<T> items) => new(items.Aggregate(this.immhs, (a, v) => a.Add(v)));
		public HashSetRecord<T> WithClear() => new(this.immhs.Clear());
		public HashSetRecord<T> WithRemove(T value) => new(this.immhs.Remove(value));
		public HashSetRecord<T> WithRemoveRange(IEnumerable<T> items) => new(items.Aggregate(this.immhs, (a, v) => a.Remove(v)));
		public HashSetRecord<T> WithUnion(IEnumerable<T> other) => new(this.immhs.Union(other));
		public HashSetRecord<T> WithUnion(IEnumerable<T> other, IEqualityComparer<T> equalityComparer) => new(this.immhs.Union(other, equalityComparer));
		public HashSetRecord<T> WithUnion(params IEnumerable<T>[] others) => new(this.immhs.Union(others.SelectMany(x => x)));
		public HashSetRecord<T> WithIntersect(IEnumerable<T> other) => new(this.immhs.Intersect(other));
		public HashSetRecord<T> WithIntersect(IEnumerable<T> other, IEqualityComparer<T> equalityComparer) => new(this.immhs.Intersect(other, equalityComparer));
		public HashSetRecord<T> WithIntersect(params IEnumerable<T>[] others) => new(this.immhs.Intersect(others.SelectMany(x => x)));
		public HashSetRecord<T> WithExcept(IEnumerable<T> other) => new(this.immhs.Except(other));
		public HashSetRecord<T> WithExcept(IEnumerable<T> other, IEqualityComparer<T> equalityComparer) => new(this.immhs.Except(other, equalityComparer));
		public HashSetRecord<T> WithSymmetricExcept(IEnumerable<T> other) => new(this.immhs.Except(other).Concat(other.Except(this.immhs)));
		public HashSetRecord<T> WithConcat(IEnumerable<T> other) => new(this.immhs.Concat(other));
		public (HashSetRecord<T> Matched, HashSetRecord<T> Unmatched) WithPartition(Func<T, bool> predicate) => (this.immhs.Where(predicate).ToHashSetRecord(), this.immhs.Where(x => !predicate(x)).ToHashSetRecord());
		public HashSetRecord<T> WithComparer(IEqualityComparer<T>? equalityComparer) => new(this.immhs.WithComparer(equalityComparer));

		#endregion

		#region ImmutableHashSet<T>::IHashKeyCollection<T>

		public IEqualityComparer<T> KeyComparer => this.immhs.KeyComparer;

		#endregion

		#region ImmutableHashSet<T>

		public bool TryGetValue(T equalValue, out T actualValue) => this.immhs.TryGetValue(equalValue, out actualValue);

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		public bool IsEmpty => this.immhs.IsEmpty;

		public bool Contains(T item) => this.immhs.Contains(item);

		public Builder ToBuilder() => new(this);

		#endregion

		#region LINQ - Typed

		public HashSetRecord<T> Where(Func<T, bool> predicate) => new(this.immhs.Where(predicate));
		public HashSetRecord<T> Where(Func<T, int, bool> predicate) => new(this.immhs.Where(predicate));
		public HashSetRecord<T> OrderBy<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer = null) => new(this.immhs.OrderBy(keySelector, comparer));
		public HashSetRecord<T> OrderByDescending<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer = null) => new(this.immhs.OrderByDescending(keySelector, comparer));
		public HashSetRecord<T> Distinct(IEqualityComparer<T>? comparer = null) => new(this.immhs.Distinct(comparer));
		public HashSetRecord<T> DistinctBy<TKey>(Func<T, TKey> keySelector) => new(this.immhs.DistinctBy(keySelector));
		public HashSetRecord<T> Skip(int count) => new(this.immhs.Skip(count));
		public HashSetRecord<T> Take(int count) => new(this.immhs.Take(count));
		public HashSetRecord<TResult> Select<TResult>(Func<T, TResult> selector) => new(this.immhs.Select(selector));
		public HashSetRecord<TResult> Select<TResult>(Func<T, int, TResult> selector) => new(this.immhs.Select(selector));
		public HashSetRecord<TResult> OfType<TResult>() => new(this.immhs.OfType<TResult>());
		public HashSetRecord<TResult> Cast<TResult>() => new(this.immhs.Cast<TResult>());

		#endregion

		#region Overrides

		public override string ToString() => $"[{string.Join(", ", this.immhs)}]";

		public override bool Equals(object? obj)
		{
			if (obj is null) return false;
			if (ReferenceEquals(this, obj)) return true;
			return obj is HashSetRecord<T> other && this.Equals(other);
		}

		public override int GetHashCode()
		{
			if (this.immhs.IsEmpty) return 0;
			return this.immhs.Aggregate(0, (hash, item) => HashCode.Combine(hash, item?.GetHashCode() ?? 0));
		}

		public static bool operator ==(HashSetRecord<T>? left, HashSetRecord<T>? right)
		{
			if (ReferenceEquals(left, right)) return true;
			if (left is null || right is null) return false;
			return left.Equals(right);
		}

		public static bool operator !=(HashSetRecord<T>? left, HashSetRecord<T>? right) => !(left == right);

		#endregion

		#region Private

		static bool IsCompatibleObject(object? value)
		{
			return value is T || default(T) == null && value == null;
		}

		#endregion

		readonly ImmutableHashSet<T> immhs;
	}

	#endregion

	#region HashSetRecordDebugView<T>

	internal sealed class HashSetRecordDebugView<T>
	{
		public HashSetRecordDebugView(HashSetRecord<T> set)
		{
			this.set = set;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public T[] Items => [.. this.set];

		readonly HashSetRecord<T> set;
	}

	#endregion

	#region HashSetRecord

	public static class HashSetRecord
	{
		public static HashSetRecord<T> Create<T>(ReadOnlySpan<T> items) => new(items.ToArray());

		#region Extension Methods

		public static HashSetRecord<T> ToHashSetRecord<T>(this ImmutableHashSet<T> source) => new(source);
		public static HashSetRecord<T> ToHashSetRecord<T>(this IEnumerable<T> source) => new(source);

		#endregion

		#region JSON Serialization

		public class JsonConverter<T> : global::System.Text.Json.Serialization.JsonConverter<HashSetRecord<T>>
		{
			public override HashSetRecord<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
			{
				if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException("Expected StartArray token");
				var builder = new HashSetRecord<T>.Builder();
				while (reader.Read())
				{
					if (reader.TokenType == JsonTokenType.EndArray) return builder.ToHashSetRecord();
					var item = JsonSerializer.Deserialize<T>(ref reader, options);
					if (item != null) builder.Add(item);
				}
				throw new JsonException("Expected EndArray token");
			}

			public override void Write(Utf8JsonWriter writer, HashSetRecord<T> value, JsonSerializerOptions options)
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
				return typeToConvert.GetGenericTypeDefinition() == typeof(HashSetRecord<>);
			}

			public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
			{
				var elementType = typeToConvert.GetGenericArguments()[0];
				var converterType = typeof(JsonConverter<>).MakeGenericType(elementType);
				return (JsonConverter)Activator.CreateInstance(converterType)!;
			}
		}

		#endregion
	}

	#endregion
}