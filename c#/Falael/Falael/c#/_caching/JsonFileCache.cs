//	R0Q4/daniel/20250918
//	TODO:
//		- `serializationDict = [];	//	cache is non-crucial, can be recreated from scratch` - migrate reporting to logger instead of Debug.WriteLine
//		- enable cache single transaction management
//			- start a transaction before entering a cache-critical code seciton
//			- close the transaction after cache update
//			- delete all cache on app start if unclosed transaction detected
using System.Diagnostics;
using System.Globalization;
using System.Text.Json;

namespace Falael
{
	public class JsonFileCache<TNsp, TGrp, TKey, TVer> : FalaelContextAware
		where TNsp : notnull
		where TGrp : notnull
		where TKey : notnull
		where TVer : notnull
	{
		const ulong LGID = 0xDB4454;

		public JsonFileCache(IFalaelContext falaelContext, Path jsonFilePath, TimeSpan? maxLifeSpan = null, int? maxCapacity = null)
			: base(falaelContext)
		{
			this.JsonFilePath = jsonFilePath.GetFullPath();
			this.MaxLifeSpan = maxLifeSpan;
			this.MaxCapacity = maxCapacity;

#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x0F9D1D),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), "INIT", nameof(this.MaxLifeSpan), this.MaxLifeSpan, nameof(this.MaxCapacity), this.MaxCapacity
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
			public required string? Value;
			public required DateTime Time;
		}

		#endregion

		public bool TryGetValue(TNsp nsp, TGrp grp, TKey key, TVer ver, out string? value)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xF3E34A),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), "string?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver
			);
#endif
			bool success;
			Entry? outcome;
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				success = dict.TryGetValue(new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver }, out outcome);
			}
			if (!success)
			{
				value = default;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x42C0C9),
					nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), "string?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
				);
#endif
				return false;
			}
			Debug.Assert(outcome != null);
			value = outcome.Value;
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x70AB1D),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), "string?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
			);
#endif
			return true;
		}

		public bool TryGetValue(TNsp nsp, TGrp grp, TKey key, TVer ver, out DateTime value)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x2834A3),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), "DateTime", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value)
			);
#endif
			bool success;
			Entry? outcome;
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				success = dict.TryGetValue(new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver }, out outcome);
			}
			if (!success)
			{
				value = default;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xB27195),
					nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), "DateTime", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
				);
#endif
				return false;
			}
			Debug.Assert(outcome != null);
			if (outcome.Value == null) throw new FormatException();
			value = DateTime.ParseExact(outcome.Value, "o", CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xC58356),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(TryGetValue), "DateTime", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
			);
#endif
			return true;
		}

		public string? GetValue(TNsp nsp, TGrp grp, TKey key, TVer ver, string? defaultValue = default) => this.TryGetValue(nsp, grp, key, ver, out string? value) ? value : defaultValue;

		public DateTime? GetValue(TNsp nsp, TGrp grp, TKey key, TVer ver, DateTime? defaultValue = default) => this.TryGetValue(nsp, grp, key, ver, out DateTime value) ? value : defaultValue;

		public void Set(TNsp nsp, TGrp grp, TKey key, TVer ver, string? value)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xC0176D),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Set), "string?", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
			);
#endif
			var entry = new Entry()
			{
				Time = DateTime.UtcNow,
				Value = value,
			};
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				dict[new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver }] = entry;
				this.WriteDict(dict);
			}
		}

		public void Set(TNsp nsp, TGrp grp, TKey key, TVer ver, DateTime value)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xD63E83),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Set), "DateTime", nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver, nameof(value), value
			);
#endif
			var entry = new Entry()
			{
				Time = DateTime.UtcNow,
				Value = value.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture),
			};
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				dict[new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver }] = entry;
				this.WriteDict(dict);
			}
		}

		public void Delete(TNsp nsp, TGrp grp, TKey key, TVer ver)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xD3B216),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp, nameof(grp), grp, nameof(key), key, nameof(ver), ver
			);
#endif
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				dict.Remove(new CompositeKey { Nsp = nsp, Grp = grp, Key = key, Ver = ver });
				this.WriteDict(dict);
			}
		}

		public void Delete(TNsp nsp, TGrp grp, TKey key)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xC73CEA),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp, nameof(grp), grp, nameof(key), key
			);
#endif
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				var keysToRemove = dict.Keys.Where(ck => 
					EqualityComparer<TNsp>.Default.Equals(ck.Nsp, nsp) &&
					EqualityComparer<TGrp>.Default.Equals(ck.Grp, grp) &&
					EqualityComparer<TKey>.Default.Equals(ck.Key, key)
				);
				foreach (var ck in keysToRemove) dict.Remove(ck);
				this.WriteDict(dict);
			}
		}

		public void Delete(TNsp nsp, TGrp grp)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xEB5A1F),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp, nameof(grp), grp
			);
#endif
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				var keysToRemove = dict.Keys.Where(ck =>
					EqualityComparer<TNsp>.Default.Equals(ck.Nsp, nsp) &&
					EqualityComparer<TGrp>.Default.Equals(ck.Grp, grp)
				);
				foreach (var ck in keysToRemove) dict.Remove(ck);
				this.WriteDict(dict);
			}
		}

		public void Delete(TNsp nsp)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x1CB0A4),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Delete), nameof(nsp), nsp
			);
#endif
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				var keysToRemove = dict.Keys.Where(ck => 
					EqualityComparer<TNsp>.Default.Equals(ck.Nsp, nsp)
				);
				foreach (var ck in keysToRemove)
				{
					dict.Remove(ck);
				}
				this.WriteDict(dict);
			}
		}

		public void Purge()
		{
			if (this.MaxLifeSpan == null && this.MaxCapacity == null) return;
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x7A38B1),
				nameof(JsonFileCache<TNsp, TGrp, TKey, TVer>), nameof(Purge), "INVOKED"
			);
#endif
			lock (this.sync_dict)
			{
				var dict = this.ReadDict();
				if (this.MaxLifeSpan != null)
				{
					var cutoffTime = DateTime.UtcNow - this.MaxLifeSpan.Value;
					dict = dict
						.Where(kvp => (kvp.Value!).Time >= cutoffTime)
						.ToDictionary();
				}
				if (this.MaxCapacity != null)
				{
					dict = dict
						.OrderByDescending(kvp => (kvp.Value!).Time)
						.Take(this.MaxCapacity.Value)
						.ToDictionary();
				}
				this.WriteDict(dict);
			}
		}

		Dictionary<CompositeKey, Entry> ReadDict()
		{
			var json = this.JsonFilePath.ReadText(defaultValue: null);
			if (json == null) return [];

			Dictionary<string, Entry> serializationDict;
			try
			{
				serializationDict = JsonSerializer.Deserialize<Dictionary<string, Entry>>(json, new JsonSerializerOptions { IncludeFields = true }) ?? throw new FormatException($"Cannot parse JSON file {this}\n{json}\n\n");
			}
			catch(Exception ex)
			{
				Debug.WriteLine(ex);
				serializationDict = [];	//	cache is non-crucial, can be recreated from scratch
			}

			var dict = new Dictionary<CompositeKey, Entry>(serializationDict.Count);
			foreach (var (k, v) in serializationDict) dict[_parseKey(k)] = v;
			return dict;

			static CompositeKey _parseKey(string s)
			{
				var p = s.Split('\0', 4);
				return new CompositeKey
				{
					Nsp = (TNsp)Convert.ChangeType(p[0], typeof(TNsp))!,
					Grp = (TGrp)Convert.ChangeType(p[1], typeof(TGrp))!,
					Key = (TKey)Convert.ChangeType(p[2], typeof(TKey))!,
					Ver = (TVer)Convert.ChangeType(p[3], typeof(TVer))!,
				};
			}
		}

		void WriteDict(Dictionary<CompositeKey, Entry> dict)
		{
			var serializationDict = new Dictionary<string, Entry>(dict.Count);
			foreach (var (k, v) in dict) serializationDict[_keyString(k)] = v;

			var json = JsonSerializer.Serialize(serializationDict, new JsonSerializerOptions { IncludeFields = true });
			this.JsonFilePath.WriteText(json);

			static string _keyString(in CompositeKey k) => $"{k.Nsp}\0{k.Grp}\0{k.Key}\0{k.Ver}";
		}


		readonly object sync_dict = new();

		public Path JsonFilePath { get; }
		public TimeSpan? MaxLifeSpan { get; }
		public int? MaxCapacity { get; }
	}
}