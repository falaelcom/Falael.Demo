using System.Collections;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace Falael
{
	#region DictionaryRecord<TKey, TValue>

	public sealed partial class DictionaryRecord<TKey, TValue>
	{
		#region Builder

		[DebuggerDisplay("Count = {Count}, IsReadOnly = false")]
		[DebuggerTypeProxy(typeof(DictionaryRecordBuilderDebugView<,>))]
		public sealed class Builder : IDictionary<TKey, TValue>, IReadOnlyDictionary<TKey, TValue>, IDictionary, IReadOnlyCollection<KeyValuePair<TKey, TValue>>, ICollection<KeyValuePair<TKey, TValue>>, ICollection, IEnumerable<KeyValuePair<TKey, TValue>>, IEnumerable
		{
			internal Builder(DictionaryRecord<TKey, TValue> source) => this.immbuilder = source.immdict.ToBuilder();
			public Builder(IEqualityComparer<TKey>? keyComparer = null, IEqualityComparer<TValue>? valueComparer = null) => this.immbuilder = ImmutableDictionary.CreateBuilder<TKey, TValue>(keyComparer, valueComparer);

			#region IDictionary<TKey, TValue>, IReadOnlyDictionary<TKey, TValue>

			public TValue this[TKey key]
			{
				get => this.immbuilder[key];
				set => this.immbuilder[key] = value;
			}

			public IEnumerable<TKey> Keys => this.immbuilder.Keys;
			public IEnumerable<TValue> Values => this.immbuilder.Values;

			ICollection<TKey> IDictionary<TKey, TValue>.Keys => ((IDictionary<TKey, TValue>)this.immbuilder).Keys;
			ICollection<TValue> IDictionary<TKey, TValue>.Values => ((IDictionary<TKey, TValue>)this.immbuilder).Values;
			public void Add(TKey key, TValue value) => this.immbuilder.Add(key, value);
			public bool ContainsKey(TKey key) => this.immbuilder.ContainsKey(key);
			public bool Remove(TKey key) => this.immbuilder.Remove(key);
			public bool TryGetValue(TKey key, [MaybeNullWhen(false)] out TValue value) => this.immbuilder.TryGetValue(key, out value);

			#endregion

			#region IDictionary

			bool IDictionary.IsFixedSize => ((IDictionary)this.immbuilder).IsFixedSize;
			bool IDictionary.IsReadOnly => ((IDictionary)this.immbuilder).IsReadOnly;
			ICollection IDictionary.Keys => ((IDictionary)this.immbuilder).Keys;
			ICollection IDictionary.Values => ((IDictionary)this.immbuilder).Values;
			void IDictionary.Add(object key, object? value) => ((IDictionary)this.immbuilder).Add(key, value);
			bool IDictionary.Contains(object key) => ((IDictionary)this.immbuilder).Contains(key);
			void IDictionary.Remove(object key) => ((IDictionary)this.immbuilder).Remove(key);
			object? IDictionary.this[object key]
			{
				get => ((IDictionary)this.immbuilder)[key];
				set => ((IDictionary)this.immbuilder)[key] = value;
			}
			IDictionaryEnumerator IDictionary.GetEnumerator() => ((IDictionary)this.immbuilder).GetEnumerator();

			#endregion

			#region IReadOnlyCollection<KeyValuePair<TKey, TValue>>

			public int Count => this.immbuilder.Count;

			#endregion

			#region ICollection<KeyValuePair<TKey, TValue>>

			bool ICollection<KeyValuePair<TKey, TValue>>.IsReadOnly => ((ICollection<KeyValuePair<TKey, TValue>>)this.immbuilder).IsReadOnly;
			void ICollection<KeyValuePair<TKey, TValue>>.CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex) => ((ICollection<KeyValuePair<TKey, TValue>>)this.immbuilder).CopyTo(array, arrayIndex);
			public void Add(KeyValuePair<TKey, TValue> item) => this.immbuilder.Add(item);
			public void Clear() => this.immbuilder.Clear();
			public bool Contains(KeyValuePair<TKey, TValue> item) => this.immbuilder.Contains(item);
			public bool Remove(KeyValuePair<TKey, TValue> item) => this.immbuilder.Remove(item); 

			#endregion

			#region ICollection

			void ICollection.CopyTo(Array array, int arrayIndex) => this.immbuilder.ToArray().CopyTo(array, arrayIndex);

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			bool ICollection.IsSynchronized => false;

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			object ICollection.SyncRoot
			{
				get
				{
					if (this.syncRoot == null) Interlocked.CompareExchange<object?>(ref this.syncRoot, new object(), null);
					return this.syncRoot;
				}
			}

			#endregion

			#region IEnumerable<KeyValuePair<TKey, TValue>>

			IEnumerator<KeyValuePair<TKey, TValue>> IEnumerable<KeyValuePair<TKey, TValue>>.GetEnumerator() => ((IEnumerable<KeyValuePair<TKey, TValue>>)this.immbuilder).GetEnumerator();

			#endregion

			#region IEnumerable

			IEnumerator IEnumerable.GetEnumerator() => this.immbuilder.GetEnumerator();

			#endregion

			#region Public

			public IEqualityComparer<TKey> KeyComparer => this.immbuilder.KeyComparer;
			public IEqualityComparer<TValue> ValueComparer => this.immbuilder.ValueComparer;

			public void AddRange(IEnumerable<KeyValuePair<TKey, TValue>> items) => this.immbuilder.AddRange(items);
			public void RemoveRange(IEnumerable<TKey> keys) => this.immbuilder.RemoveRange(keys);
			public ImmutableDictionary<TKey, TValue>.Enumerator GetEnumerator() => this.immbuilder.GetEnumerator();
			public TValue? GetValueOrDefault(TKey key) => this.immbuilder.GetValueOrDefault(key);
			public TValue GetValueOrDefault(TKey key, TValue defaultValue) => this.immbuilder.GetValueOrDefault(key, defaultValue);
			public DictionaryRecord<TKey, TValue> ToDictionaryRecord() => new(this.immbuilder.ToImmutable());

			#endregion

			internal readonly ImmutableDictionary<TKey, TValue>.Builder immbuilder;

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			object? syncRoot;
		}

		#endregion
	}

	#endregion

	#region DictionaryRecordBuilderDebugView<TKey, TValue>

	internal sealed class DictionaryRecordBuilderDebugView<TTKey, TTValue> where TTKey : notnull
	{
		public DictionaryRecordBuilderDebugView(DictionaryRecord<TTKey, TTValue>.Builder builder)
		{
			this.builder = builder;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public KeyValuePair<TTKey, TTValue>[] Items => [.. this.builder];

		readonly DictionaryRecord<TTKey, TTValue>.Builder builder;
	}

	#endregion
}