using System.Collections;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Falael
{
	#region DictionaryRecord<TKey, TValue>

	///	<remarks>
	///	To make use of the `{}` dict init syntax, use
	///	```
	///		new Dictionary<DateTime, string>()
	///		{
	///			{ new DateTime(1980, 1, 1), "born" },
	///			{ new DateTime(2005, 5, 5), "wed" }
	///		}.ToDictionaryRecord()
	///	```
	///	</remarks>
	///	<seealso cref="System.Collections.Immutable.ImmutableDictionary<TKey, TValue>"/>
	[CollectionBuilder(typeof(DictionaryRecord), nameof(DictionaryRecord.Create))]
	[DebuggerDisplay("Count = {Count}, IsReadOnly = true")]
	[DebuggerTypeProxy(typeof(DictionaryRecordDebugView<,>))]
	public sealed partial class DictionaryRecord<TKey, TValue> : IEnumerable<KeyValuePair<TKey, TValue>>, IEnumerable, IReadOnlyCollection<KeyValuePair<TKey, TValue>>, IReadOnlyDictionary<TKey, TValue>, IDictionary<TKey, TValue>, IDictionary, ICollection<KeyValuePair<TKey, TValue>>, IEquatable<DictionaryRecord<TKey, TValue>>
		where TKey : notnull
	{
		public static readonly DictionaryRecord<TKey, TValue> Empty = [];

		public DictionaryRecord(DictionaryRecord<TKey, TValue> value)
		{
			this.immdict = value.immdict;
		}

		public DictionaryRecord(ImmutableDictionary<TKey, TValue> value)
		{
			this.immdict = value;
		}

		public DictionaryRecord(IEnumerable<KeyValuePair<TKey, TValue>> value, IEqualityComparer<TKey> keyComparer, IEqualityComparer<TValue> valueComparer)
		{
			this.immdict = ImmutableDictionary.CreateRange(keyComparer, valueComparer, value);
		}

		public DictionaryRecord(IEnumerable<KeyValuePair<TKey, TValue>> value, IEqualityComparer<TKey> keyComparer)
		{
			this.immdict = ImmutableDictionary.CreateRange(keyComparer, value);
		}

		public DictionaryRecord(IEnumerable<KeyValuePair<TKey, TValue>> value)
		{
			if (value is DictionaryRecord<TKey, TValue> coll) this.immdict = coll.immdict;
			else if (value is ImmutableDictionary<TKey, TValue> immlist) this.immdict = immlist;
			else this.immdict = ImmutableDictionary.CreateRange(value);
		}

		public DictionaryRecord()
		{
			this.immdict = this.immdict = ImmutableDictionary.Create<TKey, TValue>();
		}

		public DictionaryRecord(IEqualityComparer<TKey> keyComparer)
		{
			this.immdict = this.immdict = ImmutableDictionary.Create<TKey, TValue>(keyComparer);
		}

		public DictionaryRecord(IEqualityComparer<TKey> keyComparer, IEqualityComparer<TValue> valueComparer)
		{
			this.immdict = this.immdict = ImmutableDictionary.Create<TKey, TValue>(keyComparer, valueComparer);
		}

		
		#region IEquatable<DictionaryRecord<TKey, TValue>>

		public bool Equals(DictionaryRecord<TKey, TValue>? other)
		{
			if (other is null) return false;
			return this.immdict.SequenceEqual(other.immdict);
		}

		#endregion

		#region IEnumerable

		IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();

		#endregion

		#region IEnumerable<TKey, TValue>

		public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator() => this.immdict.GetEnumerator();

		#endregion

		#region IReadOnlyCollection<TKey, TValue>

		public int Count => this.immdict.Count;

		#endregion

		#region IReadOnlyDictionary<TKey, TValue>

		public IEnumerable<TKey> Keys => this.immdict.Keys;
		public IEnumerable<TValue> Values => this.immdict.Values;
		public TValue this[TKey key] => this.immdict[key];
		public bool ContainsKey(TKey key) => this.immdict.ContainsKey(key);
		public bool TryGetValue(TKey key, [MaybeNullWhen(false)] out TValue value) => this.immdict.TryGetValue(key, out value);

		#endregion

		#region IDictionary<TKey, TValue>

		TValue IDictionary<TKey, TValue>.this[TKey key]
		{
			get => this[key];
			set => throw new NotImplementedException();
		}
		ICollection<TKey> IDictionary<TKey, TValue>.Keys => ((IDictionary<TKey, TValue>)this.immdict).Keys;
		ICollection<TValue> IDictionary<TKey, TValue>.Values => ((IDictionary<TKey, TValue>)this.immdict).Values;
		void IDictionary<TKey, TValue>.Add(TKey key, TValue value) => throw new NotImplementedException();
		bool IDictionary<TKey, TValue>.ContainsKey(TKey key) => this.immdict.ContainsKey(key);
		bool IDictionary<TKey, TValue>.Remove(TKey key) => throw new NotImplementedException();
		bool IDictionary<TKey, TValue>.TryGetValue(TKey key, [MaybeNullWhen(false)] out TValue value) => this.immdict.TryGetValue(key, out value);

		#endregion

		#region IDictionary

		object? IDictionary.this[object key]
		{
			get => this[(TKey)key];
			set => throw new NotImplementedException();
		}
		bool IDictionary.IsFixedSize => true;
		bool IDictionary.IsReadOnly => true;
		ICollection IDictionary.Keys => ((IDictionary)this.immdict).Keys;
		ICollection IDictionary.Values => ((IDictionary)this.immdict).Values;
		void IDictionary.Add(object key, object? value) => throw new NotImplementedException();
		void IDictionary.Clear() => throw new NotImplementedException();
		bool IDictionary.Contains(object key) => this.immdict.ContainsKey((TKey)key);
		IDictionaryEnumerator IDictionary.GetEnumerator() => ((IDictionary)this.immdict).GetEnumerator();
		void IDictionary.Remove(object key) => throw new NotImplementedException();

		#endregion

		#region ICollection<KeyValuePair<TKey, TValue>>

		void ICollection<KeyValuePair<TKey, TValue>>.Add(KeyValuePair<TKey, TValue> item) => throw new NotSupportedException();
		void ICollection<KeyValuePair<TKey, TValue>>.Clear() => throw new NotSupportedException();
		bool ICollection<KeyValuePair<TKey, TValue>>.IsReadOnly => true;
		bool ICollection<KeyValuePair<TKey, TValue>>.Remove(KeyValuePair<TKey, TValue> item) => throw new NotSupportedException();
		bool ICollection<KeyValuePair<TKey, TValue>>.Contains(KeyValuePair<TKey, TValue> item) => this.immdict.Contains(item);
		public void CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex) => this.immdict.ToArray().CopyTo(array, arrayIndex);

		#endregion

		#region ICollection

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		object ICollection.SyncRoot => this;

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		bool ICollection.IsSynchronized => true;

		void ICollection.CopyTo(Array array, int arrayIndex) => this.immdict.ToArray().CopyTo(array, arrayIndex);

		#endregion

		#region With-Mutations

		public DictionaryRecord<TKey, TValue> WithAdd(TKey key, TValue value) => new(this.immdict.Add(key, value));
		public DictionaryRecord<TKey, TValue> WithAddRange(IEnumerable<KeyValuePair<TKey, TValue>> pairs) => new(this.immdict.AddRange(pairs));
		public DictionaryRecord<TKey, TValue> WithClear() => Empty;
		public DictionaryRecord<TKey, TValue> WithSetItem(TKey key, TValue value) => new(this.immdict.SetItem(key, value));
		public DictionaryRecord<TKey, TValue> WithSetItems(IEnumerable<KeyValuePair<TKey, TValue>> items) => new(this.immdict.SetItems(items));
		public DictionaryRecord<TKey, TValue> WithEnsureItem(TKey key, TValue value) => !this.immdict.ContainsKey(key) ? this : new (this.immdict.SetItem(key, value));
		public DictionaryRecord<TKey, TValue> WithEnsureItems(IEnumerable<KeyValuePair<TKey, TValue>> items) => new(this.immdict.SetItems(items.Where(item => !this.immdict.ContainsKey(item.Key))));
		public DictionaryRecord<TKey, TValue> WithRemove(TKey key, TValue value) => new(this.immdict.Remove(key));
		public DictionaryRecord<TKey, TValue> WithRemoveRange(IEnumerable<TKey> keys) => new(this.immdict.RemoveRange(keys));
		public DictionaryRecord<TKey, TValue> WithComparers(IEqualityComparer<TKey>? keyComparer, IEqualityComparer<TValue>? valueComparer) => new(this.immdict.WithComparers(keyComparer, valueComparer));
		public DictionaryRecord<TKey, TValue> WithComparers(IEqualityComparer<TKey>? keyComparer) => new(this.immdict.WithComparers(keyComparer));
		public (DictionaryRecord<TKey, TValue> Matched, DictionaryRecord<TKey, TValue> Unmatched) WithPartition(Func<KeyValuePair<TKey, TValue>, bool> predicate)
			=> (this.immdict.Where(predicate).ToDictionaryRecord(), this.immdict.Where(x => !predicate(x)).ToDictionaryRecord());

		#endregion

		#region ImmutableDictionary<TKey, TValue>

		public IEqualityComparer<TKey> KeyComparer => this.immdict.KeyComparer;
		public IEqualityComparer<TValue> ValueComparer => this.immdict.ValueComparer;

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		public bool IsEmpty => this.immdict.IsEmpty;

		public bool TryGetKey(TKey equalKey, out TKey actualKey) => this.immdict.TryGetKey(equalKey, out actualKey);

		public bool ContainsValue(TValue value) => this.immdict.ContainsValue(value);

		public Builder ToBuilder() => new(this);

		#endregion

		#region LINQ - Typed

		public DictionaryRecord<TKey, TValue> Where(Func<KeyValuePair<TKey, TValue>, bool> predicate) => new(this.immdict.Where(predicate));
		public DictionaryRecord<TKey, TValue> Where(Func<KeyValuePair<TKey, TValue>, int, bool> predicate) => new(this.immdict.Where(predicate));
		public DictionaryRecord<TKey, TValue> Distinct(IEqualityComparer<KeyValuePair<TKey, TValue>>? comparer = null) => new(this.immdict.Distinct(comparer));
		public DictionaryRecord<TResultKey, TResultValue> Select<TResultKey, TResultValue>(Func<KeyValuePair<TKey, TValue>, KeyValuePair<TResultKey, TResultValue>> selector) where TResultKey : notnull => new(this.immdict.Select(selector));
		public DictionaryRecord<TResultKey, TResultValue> OfType<TResultKey, TResultValue>() where TResultKey : notnull => new(this.immdict.OfType<KeyValuePair<TResultKey, TResultValue>>());
		public DictionaryRecord<TResultKey, TResultValue> Cast<TResultKey, TResultValue>() where TResultKey : notnull => new(this.immdict.Cast<KeyValuePair<TResultKey, TResultValue>>());

		#endregion

		#region Overrides

		public override bool Equals(object? obj)
		{
			if (obj is null) return false;
			if (ReferenceEquals(this, obj)) return true;
			return obj is DictionaryRecord<TKey, TValue> other && this.Equals(other);
		}

		public override int GetHashCode()
		{
			if (this.immdict.IsEmpty) return 0;
			return this.immdict.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode()));
		}

		public static bool operator ==(DictionaryRecord<TKey, TValue>? left, DictionaryRecord<TKey, TValue>? right)
		{
			if (ReferenceEquals(left, right)) return true;
			if (left is null || right is null) return false;
			return left.Equals(right);
		}

		public static bool operator !=(DictionaryRecord<TKey, TValue>? left, DictionaryRecord<TKey, TValue>? right) => !(left == right);

		#endregion

		#region Public

		public TValue? ValueOrDefault(TKey key)
		{
			if (this.TryGetValue(key, out var result)) return result;
			return default;
		}

		#endregion

		readonly ImmutableDictionary<TKey, TValue> immdict;
	}

	#endregion

	#region DictionaryRecordDebugView<TTKey, TTValue>

	sealed class DictionaryRecordDebugView<TTKey, TTValue> where TTKey : notnull
	{
		public DictionaryRecordDebugView(DictionaryRecord<TTKey, TTValue> collection)
		{
			this.collection = collection;
		}
		
		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public KeyValuePair<TTKey, TTValue>[] Items => [.. this.collection];
		
		readonly DictionaryRecord<TTKey, TTValue> collection;
	}


	#endregion

	#region DictionaryRecord

	public static class DictionaryRecord
	{
		public static DictionaryRecord<TKey, TValue> Create<TKey, TValue>(ReadOnlySpan<KeyValuePair<TKey, TValue>> items) where TKey : notnull => new(items.ToArray());

		#region Extension Methods

		public static DictionaryRecord<TKey, TValue> ToDictionaryRecord<TKey, TValue>(this ImmutableDictionary<TKey, TValue> source) where TKey : notnull => new(source);
		public static DictionaryRecord<TKey, TValue> ToDictionaryRecord<TKey, TValue>(this IEnumerable<KeyValuePair<TKey, TValue>> source) where TKey : notnull => new(source);
		public static DictionaryRecord<TKey, TValue> ToDictionaryRecord<TKey, TValue>(this IDictionary<TKey, TValue> source) where TKey : notnull => new(source);
		public static DictionaryRecord<TKey, TSource> ToDictionaryRecord<TKey, TSource>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector, IEqualityComparer<TKey>? comparer = null) where TKey : notnull
		{
			if (source == null) throw new ArgumentNullException(nameof(source));
			if (keySelector == null) throw new ArgumentNullException(nameof(keySelector));

			if (source is ICollection<TSource> collection && collection.Count == 0) return comparer == null ? [] : new(comparer);

			DictionaryRecord<TKey, TSource>.Builder db = [];
			foreach (var item in source) db.Add(keySelector(item), item);
			return db.ToDictionaryRecord();
		}

		#endregion

		#region JSON Serialization

		public class JsonConverter<TKey, TValue> : global::System.Text.Json.Serialization.JsonConverter<DictionaryRecord<TKey, TValue>> where TKey : notnull
		{
			public override DictionaryRecord<TKey, TValue> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
			{
				if (reader.TokenType != JsonTokenType.StartObject) throw new JsonException("Expected StartObject token");

				var builder = new DictionaryRecord<TKey, TValue>.Builder();

				while (reader.Read())
				{
					if (reader.TokenType == JsonTokenType.EndObject) return builder.ToDictionaryRecord();
					if (reader.TokenType != JsonTokenType.PropertyName) throw new JsonException("Expected PropertyName token");

					// Get property name and handle null case
					string propertyName = reader.GetString() ?? throw new JsonException("Dictionary key cannot be null");

					// Deserialize key by wrapping in quotes to make valid JSON string
					var key = JsonSerializer.Deserialize<TKey>($"\"{propertyName}\"", options)
						?? throw new JsonException($"Failed to deserialize key from property name: {propertyName}");

					// Read the value
					reader.Read();
					var value = JsonSerializer.Deserialize<TValue>(ref reader, options)!;

					builder.Add(key, value);
				}

				throw new JsonException("Expected EndObject token");
			}

			public override void Write(Utf8JsonWriter writer, DictionaryRecord<TKey, TValue> value, JsonSerializerOptions options)
			{
				writer.WriteStartObject();

				foreach (var kvp in value)
				{
					// Serialize key to JSON and trim the quotes
					using var ms = new MemoryStream();
					using var tempWriter = new Utf8JsonWriter(ms);
					JsonSerializer.Serialize(tempWriter, kvp.Key, options);
					tempWriter.Flush();
					var keyString = Encoding.UTF8.GetString(ms.ToArray()).Trim('"');

					writer.WritePropertyName(keyString);
					JsonSerializer.Serialize(writer, kvp.Value, options);
				}

				writer.WriteEndObject();
			}
		}

		public class JsonConverterFactory : global::System.Text.Json.Serialization.JsonConverterFactory
		{
			public override bool CanConvert(Type typeToConvert)
			{
				if (!typeToConvert.IsGenericType) return false;
				return typeToConvert.GetGenericTypeDefinition() == typeof(DictionaryRecord<,>);
			}

			public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
			{
				var keyType = typeToConvert.GetGenericArguments()[0];
				var valueType = typeToConvert.GetGenericArguments()[1];
				var converterType = typeof(JsonConverter<,>).MakeGenericType(keyType, valueType);
				return (JsonConverter)Activator.CreateInstance(converterType)!;
			}
		}

		#endregion
	}

	#endregion
}