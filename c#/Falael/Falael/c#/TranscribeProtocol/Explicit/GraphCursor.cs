using System.Collections;
using System.Diagnostics;
using System.Text;

namespace Falael.TranscribeProtocol.Explicit
{
	public sealed partial record class GraphCursor : IEnumerable<object?>, IEnumerable, IReadOnlyList<object?>, IReadOnlyCollection<object?>
	{
		public GraphCursor(IFabric fabric, object? root, IReadOnlyList<object?> arcs)
		{
			this.Fabric = fabric;
			this.arcs = [root, null, ..arcs];
			this.AssertStructure();
		}

		public GraphCursor(IFabric fabric, object? root)
		{
			this.Fabric = fabric;
			this.arcs = [root, null];
			this.AssertStructure();
		}

		public GraphCursor(IFabric fabric, IReadOnlyList<object?> arcs)
		{
			Debug.Assert(arcs.Count == 2 || arcs.Count > 3);

			this.Fabric = fabric;
			this.arcs = new(arcs);
			this.AssertStructure();
		}

		public GraphCursor(GraphCursor value)
		{
			this.Fabric = value.Fabric;
			this.arcs = value.arcs;
			this.AssertStructure();
		}

		void AssertStructure()
		{
			AssertStructure(this.Fabric, this.arcs);
		}

		internal static void AssertStructure(IFabric fabric, IReadOnlyList<object?> arcs)
		{
			Debug.Assert(arcs.Count == 2 || (arcs.Count > 3 && arcs.Count % 2 == 0 && arcs[1] == null));

			if (arcs.Count == 2)
			{
				Debug.Assert(arcs[1] == null);
				return;
			}

			var tail = arcs[0];
			for (int length = arcs.Count, i = 2; i < length; i += 2)
			{
				var head = arcs[i];
				var label = arcs[i + 1];
				if(i  < length - 2) Debug.Assert(head != null);
				Debug.Assert(label != null);
				fabric.AssertInstanceCoherent(label, tail);
				tail = head;
			}
		}

		#region IEnumerable<object?>

		public IEnumerator<object?> GetEnumerator() => this.arcs.GetEnumerator();

		#endregion

		#region IEnumerable

		IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();

		#endregion

		#region IReadOnlyList<object?>

		public int Count => this.arcs.Count;

		public object? this[int index] => this.arcs[index];

		#endregion

		#region With-Mutations

		public GraphCursor WithSetRoot(object? head)
		{
			var arcs = this.arcs.ToList();
			arcs[^0] = head;
			return new GraphCursor(this.Fabric, arcs);
		}

		public GraphCursor WithAdd<TLabel>(object? head, TLabel label)
			where TLabel : notnull
		{
			var arcs = this.arcs.ToList();
			arcs.Add(head);
			arcs.Add(label);
			return new GraphCursor(this.Fabric, arcs);
		}

		public GraphCursor WithRemoveLast(int n)
		{
			if (n == 0) return this;
			
			Debug.Assert(n > 0);
			Debug.Assert(this.arcs.Count > 2 * n + 1);

			var arcs = this.arcs.ToList();
			arcs.RemoveRange(arcs.Count - 2 * n, 2 * n);
			return new GraphCursor(this.Fabric, arcs);
		}

		public GraphCursor WithRemoveLast()
		{
			Debug.Assert(this.arcs.Count > 3);

			var arcs = this.arcs.ToList();
			arcs.RemoveAt(arcs.Count - 1);
			arcs.RemoveAt(arcs.Count - 1);
			return new GraphCursor(this.Fabric, arcs);
		}

		#endregion

		public bool IsRoot => this.Count == 1;

		public object? Head
		{
			get
			{
				return this.arcs[^2];
			}
		}

		public override string ToString()
		{
			if (this.IsRoot) return string.Empty;

			StringBuilder sb = new();

			object? tail = this.arcs[0];
			for (int length = this.arcs.Count, i = 2; i< length; i += 2)
			{
				var head = this.arcs[i];
				var label = this.arcs[i + 1];
				Debug.Assert(label != null);
				var tailCardinality = this.Fabric.GetInstanceCardinality(tail);
				switch (tailCardinality)
				{
					case Cardinality.Zero: throw new InvalidOperationException();
					case Cardinality.AlephNull_Enumerable:
					case Cardinality.AlephNull_GenericEnumerable:
						sb.Append($"#{label}");
						break;
					case Cardinality.AlephOne_Object:
						sb.Append($".{_esc(label.ToString()!)}");
						break;
					case Cardinality.AlephOne_Dictionary:
					case Cardinality.AlephOne_GenericDictionary:
						var labelCardinality = this.Fabric.GetLabelCardinality(label);
						switch (labelCardinality)
						{
							case Cardinality.Zero: throw new InvalidOperationException();
							case Cardinality.AlephNull_Enumerable:
								sb.Append($"[{_esc(label.ToString()!)}]");
								break;
							case Cardinality.AlephOne_Object:
								sb.Append($"[\"{_esc(label.ToString()!)}\"]");
								break;
							default: throw new NotImplementedException();
						}
						break;
					default: throw new NotImplementedException();
				}
				tail = head;
			}

			return sb.ToString();

			string _esc(string value)
			{
				return value
					.Replace(".", "\\.")
					.Replace("#", "\\#")
					.Replace("[", "\\[")
					.Replace("]", "\\]")
					.Replace("\"", "\\\"")
					.Replace("\"", "\\\"")
					.Replace("\\", "\\\\");
			}
		}

		public Builder ToBuilder() => new(this);

		public IReadOnlyList<(object? head, object? label)> ToArcList()
		{
			if (this.cache_arcListCache != null) return this.cache_arcListCache;
			var result = new List<(object?, object?)>();
			for (int length = this.arcs.Count, i = 0; i < length; i += 2) result.Add((this.arcs[i], this.arcs[i + 1]));
			this.cache_arcListCache = result;
			return result;
		}

		public GraphPath ToGraphPath()
		{
			if (this.arcs.Count == 2) return new GraphPath(this.Fabric);
			var arcs = this.arcs.ToList();
			arcs[^2] = null;
			return new GraphPath(this.Fabric, arcs);
		}

		public IFabric Fabric { get; }

		ListRecord<object?> arcs = ListRecord<object?>.Empty;

		IReadOnlyList<(object? head, object? label)>? cache_arcListCache = null;
	}
}