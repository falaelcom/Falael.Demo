using System.Collections;
using System.Diagnostics;

namespace Falael.TranscribeProtocol.Explicit
{
	public sealed partial record class GraphCursor
	{
		public sealed class Builder : IEnumerable<object?>, IEnumerable, IReadOnlyList<object?>, IReadOnlyCollection<object?>
		{
			internal Builder(GraphCursor source)
			{
				this.Fabric = source.Fabric;
				this.source = source;
			}

			public Builder(IFabric fabric, object? root, int capacity)
			{
				this.Fabric = fabric;
				this.arcs = new(capacity) { root, null };
				GraphCursor.AssertStructure(this.Fabric, this.arcs);
			}

			public Builder(IFabric fabric, object? root)
			{
				this.Fabric = fabric;
				this.arcs = [ root, null ];
				GraphCursor.AssertStructure(this.Fabric, this.arcs);
			}

			public Builder(IFabric fabric)
			{
				this.Fabric = fabric;
			}

			#region IEnumerable<object?>

			public IEnumerator<object?> GetEnumerator()
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.arcs!.GetEnumerator();
				}
			}

			#endregion

			#region IEnumerable

			IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();

			#endregion

			#region IReadOnlyList<object?>

			public int Count
			{
				get
				{
					lock (this.sync)
					{
						this.EnsureState();
						return this.arcs!.Count;
					}
				}
			}

			public object? this[int index]
			{
				get
				{
					lock (this.sync)
					{
						this.EnsureState();
						return this.arcs![index];
					}
				}
			}

			#endregion

			#region Mutations
			
			public void Void()
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);

					this.arcs.Clear();
				}
			}

			public void SetRoot(object? head)
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);
					
					this.arcs.Clear();
					this.arcs.Add(head);

					GraphCursor.AssertStructure(this.Fabric, this.arcs);
				}
			}

			public void Add<TLabel>(object? head, TLabel label)
				where TLabel : notnull
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);
					Debug.Assert(this.arcs.Count != 0);

					if (this.arcs.Count == 1) this.arcs.Add(null);

					this.arcs.Add(head);
					this.arcs.Add(label);

					GraphCursor.AssertStructure(this.Fabric, this.arcs);
				}
			}

			public void ReplaceLast<TLabel>(object? head, TLabel label)
				where TLabel : notnull
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);
					Debug.Assert(this.arcs.Count > 3);

					this.arcs[^2] = head;
					this.arcs[^1] = label;

					GraphCursor.AssertStructure(this.Fabric, this.arcs);
				}
			}

			public void RemoveLast(int n)
			{
				if (n == 0) return;

				lock (this.sync)
				{
					this.EnsureState();
					Debug.Assert(this.arcs != null);

					if (this.arcs.Count == 1)
					{
						Debug.Assert(n == 1);
						this.Void();
					}
					else
					{
						Debug.Assert(this.arcs.Count > 2 * n + 1);
						this.arcs.RemoveRange(this.arcs.Count - 2 * n, 2 * n);
					}

					GraphCursor.AssertStructure(this.Fabric, this.arcs);
				}
			}

			public void RemoveLast()
			{
				lock (this.sync)
				{
					this.EnsureState();
					Debug.Assert(this.arcs != null);

					if (this.arcs.Count == 1) this.Void();
					else
					{
						Debug.Assert(this.arcs.Count > 1);
						this.arcs.RemoveAt(this.arcs.Count - 1);
						this.arcs.RemoveAt(this.arcs.Count - 1);
					}

					GraphCursor.AssertStructure(this.Fabric, this.arcs);
				}
			}

			#endregion

			#region Private

			void EnsureState()
			{
				if (this.arcs != null) return;
				Debug.Assert(this.source != null);
				this.arcs = new(this.source.arcs);
			}

			#endregion

			public bool IsVoid
			{
				get
				{
					lock (this.sync)
					{
						if (this.arcs != null) return this.arcs.Count == 0;
						if (this.source != null) return this.source.Count == 0;
						return true;
					}
				}
			}

			public bool IsRoot
			{
				get
				{
					lock (this.sync)
					{
						return this.Count == 1;
					}
				}
			}

			public object? Head
			{
				get
				{
					lock (this.sync)
					{
						this.EnsureState();
						Debug.Assert(this.arcs != null);

						return this.arcs[^2];
					}
				}
			}

			public IReadOnlyList<(object? head, object? label)> ToArcList()
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);

					var result = new List<(object?, object?)>();
					for (int length = this.arcs.Count, i = 0; i < length; i += 2) result.Add((this.arcs[i], this.arcs[i + 1]));
					return result;
				}
			}

			public GraphCursor ToGraphCursor()
			{
				lock (this.sync)
				{
					if (this.arcs == null)
					{
						Debug.Assert(this.source != null);
						Debug.Assert(this.source.Count > 1);
					}
					else
					{
						Debug.Assert(this.arcs.Count > 1);
						this.source = new GraphCursor(this.Fabric, this.arcs);
						this.arcs = null;
					}
					return this.source;
				}
			}

			public GraphCursor ToGraphCursorWith<TLabel>(object? withHead, TLabel withLabel)
				where TLabel : notnull
			{
				lock (this.sync)
				{
					if (this.arcs == null)
					{
						Debug.Assert(this.source != null);
						Debug.Assert(this.source.Count > 1);
						return this.source.WithAdd(withHead, withLabel);
					}
					else
					{
						Debug.Assert(this.arcs.Count > 1);
						return new(this.Fabric, [.. this.arcs, withHead, withLabel]);
					}
				}
			}

			public GraphCursor ToGraphCursorWith<TLabel1, TLabel2>(object? withHead1, TLabel1 withLabel1, object? withHead2, TLabel2 withLabel2)
				where TLabel1 : notnull
				where TLabel2 : notnull
			{
				lock (this.sync)
				{
					if (this.arcs == null)
					{
						Debug.Assert(this.source != null);
						Debug.Assert(this.source.Count > 1);
						return new(this.Fabric, [.. this.source.arcs, withHead1, withLabel1, withHead2, withLabel2]);
					}
					else
					{
						Debug.Assert(this.arcs.Count > 1);
						return new GraphCursor(this.Fabric, [.. this.arcs, withHead1, withLabel1, withHead2, withLabel2]);
					}
				}
			}

			public GraphPath ToGraphPath()
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);

					if (this.arcs.Count == 2) return new(this.Fabric);
					var arcs = this.arcs.ToList();
					arcs[^2] = null;
					return new GraphPath(this.Fabric, arcs);
				}
			}
			
			public IFabric Fabric { get; }

			internal List<object?>? arcs = null;
			GraphCursor? source = null;

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			readonly object sync = new();
		}
	}
}