//	R0Q4/daniel/20250908
using System.Diagnostics;
using System.Runtime.ConstrainedExecution;

namespace Falael
{
	public class MemoryCache<TNsp, TGrp, TKey, TVer> : FalaelContextAware
		where TNsp : notnull
		where TGrp : notnull
		where TKey : notnull
		where TVer : notnull
	{
		const ulong LGID = 0x3E4739;

		public MemoryCache(IFalaelContext falaelContext, TimeSpan? maxLifeSpan = null, int? maxCapacity = null)
			: base(falaelContext)
		{
			this.MaxLifeSpan = maxLifeSpan;
			this.MaxCapacity = maxCapacity;

#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xC4352E),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), "INIT", nameof(this.MaxLifeSpan), this.MaxLifeSpan, nameof(this.MaxCapacity), this.MaxCapacity
			);
#endif
		}

		#region Nested Types

		struct CompositeKey : IEquatable<CompositeKey>
		{
			public TNsp Nsp;
			public TGrp Grp;
			public TKey Key;
			public TVer Ver;

			public override bool Equals(object? obj) => obj is CompositeKey other && this.Equals(other);

			public bool Equals(CompositeKey other) =>
				EqualityComparer<TNsp>.Default.Equals(this.Nsp, other.Nsp) &&
				EqualityComparer<TGrp>.Default.Equals(this.Grp, other.Grp) &&
				EqualityComparer<TKey>.Default.Equals(this.Key, other.Key) &&
				EqualityComparer<TVer>.Default.Equals(this.Ver, other.Ver);

			public override int GetHashCode() => HashCode.Combine(this.Nsp, this.Grp, this.Key, this.Ver);
		}

		class Entry
		{
			public required object? Value;
			public required DateTime Time;
		}

		#endregion

		public bool TryGetValue<T>(TNsp nsp, TGrp grp, TKey key, TVer ver, out T? value)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x80FCE3),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), nameof(T) + "?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver
			);
#endif
			bool success;
			object? outcome;
			lock (this.sync_dict)
			{
				success = this.dict.TryGetValue(new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver }, out outcome);
			}
			if (!success)
			{
				value = default;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x12654B),
					nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), nameof(T) + "?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
				);
#endif
				return false;
			}
			var entry = outcome as Entry;
			Debug.Assert(entry != null);
			value = (T?)entry.Value;
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x2569C2),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), nameof(T) + "?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
			);
#endif
			return true;
		}

		public T? GetValue<T>(TNsp nsp, TGrp grp, TKey key, TVer ver, T? defaultValue = default) => this.TryGetValue(nsp, grp, key, ver, out T? value) ? value : defaultValue;

		public void Set<T>(TNsp nsp, TGrp grp, TKey key, TVer ver, T? value)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xCE8636),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(Set), nameof(T) + "?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
			);
#endif
			var entry = new Entry()
			{
				Time = DateTime.UtcNow,
				Value = value,
			};
			lock (this.sync_dict)
			{
				this.dict[new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver }] = entry;
			}
		}

		public void Delete(TNsp nsp, TGrp grp, TKey key, TVer ver)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xCEA787),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver
			);
#endif
			lock (this.sync_dict)
			{
				this.dict.Remove(new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver });
			}
		}

		public void Delete(TNsp nsp, TGrp grp, TKey key)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x5A4F56),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp, nameof(grp), grp, nameof(key), key
			);
#endif
			lock (this.sync_dict)
			{
				var keysToRemove = this.dict.Keys.Where(ck => 
					EqualityComparer<TNsp>.Default.Equals(ck.Nsp, nsp) &&
					EqualityComparer<TGrp>.Default.Equals(ck.Grp, grp) &&
					EqualityComparer<TKey>.Default.Equals(ck.Key, key)
				);
				foreach (var ck in keysToRemove) this.dict.Remove(ck);
			}
		}

		public void Delete(TNsp nsp, TGrp grp)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xD8D77B),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp, nameof(grp), grp
			);
#endif
			lock (this.sync_dict)
			{
				var keysToRemove = this.dict.Keys.Where(ck =>
					EqualityComparer<TNsp>.Default.Equals(ck.Nsp, nsp) &&
					EqualityComparer<TGrp>.Default.Equals(ck.Grp, grp)
				);
				foreach (var ck in keysToRemove) this.dict.Remove(ck);
			}
		}

		public void Delete(TNsp nsp)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xFDDC93),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp
			);
#endif
			lock (this.sync_dict)
			{
				var keysToRemove = this.dict.Keys.Where(ck => 
					EqualityComparer<TNsp>.Default.Equals(ck.Nsp, nsp)
				);
				foreach (var ck in keysToRemove)
				{
					this.dict.Remove(ck);
				}
			}
		}

		public void Purge()
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x3F7B14),
				nameof(MemoryCache<TNsp, TGrp, TKey, TVer>), nameof(Purge)
			);
#endif
			if (this.MaxLifeSpan == null && this.MaxCapacity == null) return;
			lock (this.sync_dict)
			{
				if (this.MaxLifeSpan != null)
				{
					var cutoffTime = DateTime.UtcNow - this.MaxLifeSpan.Value;
					this.dict = this.dict
						.Where(kvp => ((Entry)kvp.Value!).Time >= cutoffTime)
						.ToDictionary();
				}
				if (this.MaxCapacity != null)
				{
					this.dict = this.dict
						.OrderByDescending(kvp => ((Entry)kvp.Value!).Time)
						.Take(this.MaxCapacity.Value)
						.ToDictionary();
				}
			}
		}

		Dictionary<CompositeKey, object?> dict = [];
		readonly object sync_dict = new();

		public TimeSpan? MaxLifeSpan { get; }
		public int? MaxCapacity { get; }
	}
}