using System.Collections;
using System.Diagnostics;

namespace Falael.TranscribeProtocol.Explicit
{
	public partial record class GraphPath
	{
		public sealed class Builder : IEnumerable<object?>, IEnumerable, IReadOnlyList<object?>, IReadOnlyCollection<object?>
		{
			internal Builder(GraphPath source)
			{
				this.Fabric = source.Fabric;
				this.source = source;
			}

			public Builder(IFabric fabric, int capacity)
			{
				this.Fabric = fabric;
				this.arcs = new(capacity);
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

			public void SetRoot()
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);
					
					this.arcs.Clear();
					GraphPath.AssertStructure(this.Fabric, this.arcs);
				}
			}

			public void Add<TTail>(object label, TTail tail)
				where TTail : notnull
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);

					switch (this.arcs.Count)
					{
						case 0:
							this.arcs.Add(tail);
							this.arcs.Add(null);
							this.arcs.Add(null);
							this.arcs.Add(label);
							break;
						default:
							this.arcs[^2] = tail;
							this.arcs.Add(null);
							this.arcs.Add(label);
							break;
					}
					GraphPath.AssertStructure(this.Fabric, this.arcs);
				}
			}

			public void WithRemoveLast()
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.arcs != null);
					Debug.Assert(this.arcs.Count != 0);

					if (this.arcs.Count == 4) this.arcs!.Clear();
					else
					{
						this.arcs.RemoveAt(this.arcs.Count - 1);
						this.arcs.RemoveAt(this.arcs.Count - 1);
						this.arcs[^2] = null;
					}
					GraphPath.AssertStructure(this.Fabric, this.arcs);
				}
			}

			#endregion

			#region Private

			void EnsureState()
			{
				this.arcs ??= this.source == null ? [] : new(this.source.arcs);
			}

			#endregion

			public bool IsVoid
			{
				get
				{
					lock (this.sync)
					{
						return this.arcs == null && this.source == null;
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

			public GraphCursor ToGraphCursor(object? cursorValue)
			{
				lock (this.sync)
				{
					this.EnsureState();

					if (this.arcs == null || this.arcs.Count == 0) return new GraphCursor(this.Fabric, cursorValue);
					var arcs = this.arcs.ToList();
					arcs[^2] = cursorValue;
					return new GraphCursor(this.Fabric, arcs);
				}
			}

			public GraphPath ToGraphPath()
			{
				lock (this.sync)
				{
					GraphPath result;
					if (this.arcs == null)
					{
						Debug.Assert(this.source != null);
						result = this.source;
						this.source = null;
						return result;
					}
					result = new GraphPath(this.Fabric, this.arcs);
					this.source = result;
					this.arcs = null;
					return result;
				}
			}

			public IFabric Fabric { get; }

			internal List<object?>? arcs = null;
			GraphPath? source = null;
			
			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			readonly object sync = new();
		}
	}
}