using System.Collections;
using System.Diagnostics;

namespace Falael.TranscribeProtocol.Explicit
{
	public sealed partial record class GraphPath : IEnumerable<object?>, IEnumerable, IReadOnlyList<object?>, IReadOnlyCollection<object?>, IEquatable<GraphPath>
	{
		public GraphPath(IFabric fabric, IReadOnlyList<object?> arcs)
		{
			Debug.Assert(arcs.Count == 0 || arcs.Count > 3);

			this.Fabric = fabric;
			this.arcs = new(arcs);
			this.AssertStructure();
		}

		public GraphPath(IFabric fabric)
		{
			this.Fabric = fabric;
			this.arcs = [];
			this.AssertStructure();
		}

		public GraphPath(GraphPath value)
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
			if (arcs.Count == 0) return;

			Debug.Assert(arcs.Count % 2 == 0);
			Debug.Assert(arcs.Count > 1);

			Debug.Assert(arcs[1] == null);

			if (arcs.Count == 2) return;

			for (int length = arcs.Count - 2, i = 2; i < length; i += 2)
			{
				var head = arcs[i];
				var label = arcs[i + 1];
				Debug.Assert(head != null);
				Debug.Assert(label != null);
				fabric.AssertInstanceCoherent(label, head);
			}

			Debug.Assert(arcs[^2] == null);
			Debug.Assert(arcs[^1] != null);
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

		public GraphPath WithSetRoot() => new(this.Fabric);

		public GraphPath WithAdd<TTail>(object label, TTail tail)
			where TTail : notnull
		{
			var arcs = this.arcs.ToList();
			switch (this.arcs.Count)
			{
				case 0:
					arcs.Add(tail);
					arcs.Add(null);
					arcs.Add(null);
					arcs.Add(label);
					break;
				default:
					arcs[^2] = tail;
					arcs.Add(null);
					arcs.Add(label);
					break;
			}
			return new GraphPath(this.Fabric, arcs);
		}

		public GraphPath WithRemoveLast()
		{
			Debug.Assert(this.arcs.Count != 0);

			GraphPath result;
			if (this.arcs.Count == 4) result = new(this.Fabric);
			else
			{
				var arcs = this.arcs.ToList();
				arcs.RemoveAt(arcs.Count - 1);
				arcs.RemoveAt(arcs.Count - 1);
				arcs[^2] = null;
				result = new GraphPath(this.Fabric, arcs);
			}
			return result;
		}

		#endregion

		public Builder ToBuilder() => new(this);

		public IReadOnlyList<(object? head, object? label)> ToArcList()
		{
			if(this.cache_arcListCache != null) return this.cache_arcListCache;
			var result = new List<(object?, object?)> ();
			for (int length = this.arcs.Count, i = 0; i < length; i += 2) result.Add((this.arcs[i], this.arcs[i + 1]));
			this.cache_arcListCache = result;
			return result;
		}

		public GraphCursor ToGraphCursor(object? cursorValue)
		{
			if (this.arcs.Count == 0) return new GraphCursor(this.Fabric, cursorValue);
			var arcs = this.arcs.ToList();
			arcs[^2] = cursorValue;
			return new GraphCursor(this.Fabric, arcs);
		}

		public IFabric Fabric { get; }

		ListRecord<object?> arcs = ListRecord<object?>.Empty;
		
		IReadOnlyList<(object? head, object? label)>? cache_arcListCache = null;
	}
}