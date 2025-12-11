using System.Diagnostics;
using System.Text.Json.Serialization;
using System.Collections.Concurrent;
using System.Text.Json;

namespace Falael
{
	#region TraverseOrder

	public enum TraverseOrder
	{
		PreOrder,
		PostOrder,
		LevelOrder,
	}

	#endregion

	#region ITreeNode<T>

	/// <summary>
	/// Interface introduce to unify common members of TreeRecord and TreeRecordNode w/o inheritance
	/// </summary>
	public interface ITreeRecordNode<T>
	{
		bool HasAncestor(ITreeRecordNode<T> node);
		IReadOnlyCollection<ITreeRecordNode<T>> GetAncestors(bool includeSelf, bool ascending);

		bool IsLeaf { get; }
		bool IsEmpty { get; }
		IReadOnlyList<TreeRecordNode<T>> Children { get; }
		TreeRecordNode<T>? Parent { get; }
		TreeRecord<T>? Tree { get; }
		public T Value { get; }
	}

	#endregion

	#region TreeRecordNode<T>

	[DebuggerDisplay("Children = {Children.Count}, Depth = {Depth}, Value = {Value}")]
	[DebuggerTypeProxy(typeof(TreeRecordNodeDebugView<>))]
	public class TreeRecordNode<T> : ITreeRecordNode<T>
	{
		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		internal readonly static Pool pool = new();
		
		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		static readonly WeakReference poolRef = new(pool);

		///// <summary>
		///// JSON Constructor
		///// </summary>
		//[JsonConstructor]
		//protected TreeRecordNode(T value, List<TreeRecordNode<T>>? children = null)
		//{
		//	this.children = children ?? [];
		//	this.value = value;
		//}

		/// <summary>
		/// Pool internal constructor.
		/// </summary>
		internal TreeRecordNode(TreeRecord<T>? tree, TreeRecordNode<T>? parent, int depth, int siblingIndex)
		{
			this.Tree = tree;
			this.Parent = parent;
			this.Depth = depth;
			this.SiblingIndex = siblingIndex;

			this.value = default!;
			this.children = [];
		}

		/// <summary>
		/// Pretty init constructor
		/// </summary>
		/// <example>
		/// TreeRecord<int> t =
		/// [
		///		1, 2,
		/// 	new()
		/// 	{
		/// 		Value = 1,
		/// 		Children =
		/// 		[
		/// 			2, 3, 4,
		///				new()
		/// 			{
		/// 				Value = 10,
		/// 				Children = [7, 8, 9]
		/// 			}
		/// 		],
		/// 	},
		/// ];
		/// </example>
		public TreeRecordNode()
		{
			this.value = default!;
		}

		#region IReadOnlyTreeNode<T>

		public bool HasAncestor(ITreeRecordNode<T> node)
		{
			var cur = this;
			while (cur != null)
			{
				if (cur == node) return true;
				cur = cur.Parent;
			}
			return false;
		}

		public IReadOnlyCollection<ITreeRecordNode<T>> GetAncestors(bool includeSelf, bool ascending = false)
		{
			ListRecord<TreeRecordNode<T>>.Builder result = includeSelf ? [this] : [];
			var node = this;
			while (node.Parent != null) result.Add(node = node.Parent);
			if (!ascending) result.Reverse();
			return result.ToListRecord();
		}

		public bool IsLeaf => this.children.Count == 0;

		public IReadOnlyList<TreeRecordNode<T>> Children
		{
			get => this.children.AsReadOnly();
			init => this.children = [.. value];
		}
		readonly internal List<TreeRecordNode<T>> children = [];

		[JsonIgnore]
		public TreeRecordNode<T>? Parent { get; internal set; }

		[JsonIgnore]
		public TreeRecord<T>? Tree { get; private set; }

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		public bool IsEmpty => this.children.Count == 0;

		public required T Value
		{
			get => this.value;
			init => this.value = value;
		}
		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		internal T value;

		#endregion

		#region Life-cycle

		protected void Reconstruct(TreeRecord<T>? tree, TreeRecordNode<T>? parent, int depth, int siblingIndex, T value)
		{
			this.Tree = tree;
			this.Parent = parent;
			this.Depth = depth;
			this.SiblingIndex = siblingIndex;
			this.value = value;
		}

		~TreeRecordNode()
		{
			this.children.Clear();
			if (poolRef.Target is not Pool pool) return;    //	expected only during app shutdown
			pool.Release(this);
			GC.ReRegisterForFinalize(this);
		}

		#endregion

		#region Nested Types

		protected internal class Pool
		{
			public TreeRecordNode<T> Hold(TreeRecord<T> tree, TreeRecordNode<T>? parent, int siblingIndex, T value)
			{
				if (!this.items.TryTake(out TreeRecordNode<T>? result)) result = new(tree, parent, (parent?.Depth ?? -1) + 1, siblingIndex) { Value = value };
				else result.Reconstruct(tree, parent, (parent?.Depth ?? -1) + 1, siblingIndex, value);
				return result;
			}

			internal void Release(TreeRecordNode<T> item)
			{
				this.items.Add(item);
			}

			public readonly ConcurrentBag<TreeRecordNode<T>> items = [];
		}

		#endregion

		#region Implicit Conversions

		public static implicit operator TreeRecordNode<T>(T value) => new() { Value = value, Children = [] };

		#endregion

		public bool IsRoot => this.Parent == null;

		[JsonIgnore]
		public int Depth { get; internal set; }

		[JsonIgnore]
		public int SiblingIndex { get; internal set; }
	}

	#endregion

	#region TreeRecord<T>

	[DebuggerDisplay("Children = {Children.Count}, Count = {Count}, Height = {Height}, IsReadOnly = true")]
	[DebuggerTypeProxy(typeof(TreeRecordDebugView<>))]
	public sealed partial class TreeRecord<T> : ITreeRecordNode<T>, IEquatable<TreeRecord<T>>, ICloneable
	{
		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		public static readonly TreeRecord<T> Empty = new();

		public TreeRecord(IEnumerable<TreeRecordNode<T>> rootNodes)
		{
			var builder = new Builder();
			foreach (var item in rootNodes) builder.AddChildFrom(item, copySubtree: true);
			this.children = builder.buffer?.children ?? [];
			this.count = builder.buffer?.count ?? 0;
			this.height = builder.buffer?.height ?? 0;
		}

		/// <summary>
		/// Copy constructor
		/// </summary>
		public TreeRecord(TreeRecord<T> source)
		{
			this.children = [];
			source.TranscribeInternal(this, null, null, false, null, null, true);   //	clone over full source's subtree
		}

		/// <summary>
		/// Default constructor
		/// </summary>
		public TreeRecord()
		{
			this.children = [];
			this.count = 0;
			this.height = 0;
		}


		#region IReadOnlyTreeNode<T>

		public bool HasAncestor(ITreeRecordNode<T> node) => node == this;

		public IReadOnlyCollection<ITreeRecordNode<T>> GetAncestors(bool includeSelf, bool ascending) => includeSelf ? [this] : [];

		public bool IsLeaf => this.children.Count == 0;

		public IReadOnlyList<TreeRecordNode<T>> Children => this.children.AsReadOnly();

		[JsonIgnore]
		public TreeRecordNode<T>? Parent => null;

		[JsonIgnore]
		public TreeRecord<T>? Tree => this;

		[DebuggerBrowsable(DebuggerBrowsableState.Never)]
		public bool IsEmpty => this.children.Count == 0;

		public T Value => throw new NotImplementedException();

		#endregion

		#region IEquatable<TreeRecord<T>>

		public bool Equals(TreeRecord<T>? other)
		{
			if (other is null) return false;
			if (ReferenceEquals(this, other)) return true;

			if (this.children.Count != other.children.Count) return false;
			for (int i = 0; i < this.children.Count; i++) if (!_equals(this.children[i], other.children[i])) return false;
			return true;

			static bool _equals(TreeRecordNode<T> left, TreeRecordNode<T> right)
			{
				if (!EqualityComparer<T>.Default.Equals(left.Value, right.Value)) return false;
				if (left.children.Count != right.children.Count) return false;
				for (int i = 0; i < left.children.Count; i++) if (!_equals(left.children[i], right.children[i])) return false;
				return true;
			}
		}

		#endregion

		#region ICloneable

		public object Clone()
		{
			var result = new TreeRecord<T>();
			for (int length = this.children.Count, i = 0; i < length; ++i) result.children.Add(_cloneNode(this.children[i], null));
			return result;

			TreeRecordNode<T> _cloneNode(TreeRecordNode<T> child, TreeRecordNode<T>? parent)
			{
				var node = TreeRecordNode<T>.pool.Hold(result, parent, child.SiblingIndex, child.Value);
				for (int length = child.children.Count, i = 0; i < length; ++i) node.children.Add(_cloneNode(child.children[i], node));
				return node;
			}
		}

		#endregion

		#region With-Mutations

		/// <summary>
		/// Creates a new tree with updated value at the specified child node position.
		/// </summary>
		/// <param name="parent">The parent node. If null, operates at root level.</param>
		/// <param name="index">Zero-based index of the child to update.</param>
		/// <param name="value">The new value to set.</param>
		/// <returns>A new tree with the updated node.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
		/// <exception cref="InvalidOperationException">If the specified node is not found on this tree.</exception>
		public TreeRecord<T> WithUpdateChild(TreeRecordNode<T>? parent, int index, T value)
		{
			if (index < 0) throw new ArgumentOutOfRangeException(nameof(index));
			if (parent == null && index >= this.children.Count) throw new ArgumentOutOfRangeException(nameof(index));

			var hasMatch = false;
			var result = new TreeRecord<T>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				if (i == index && parent == null)
				{
					Debug.Assert(!hasMatch);
					hasMatch = true;
					var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, value);
					result.children.Add(rnode);
					_traversePreOrder(lnode, rnode, parent, index);
				}
				else
				{
					var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, lnode.Value);
					result.children.Add(rnode);
					_traversePreOrder(lnode, rnode, parent, index);
				}
			}
			if (!hasMatch) throw new InvalidOperationException("Child node not found on this tree.");

			result.count = this.count;
			result.height = this.height;
			return result;

			void _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, TreeRecordNode<T>? targetLparent, int targetIndex)
			{
				if (targetLparent == lparent && targetIndex >= lparent.children.Count) throw new ArgumentOutOfRangeException(nameof(targetIndex));

				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					if (i == targetIndex && targetLparent == lparent)
					{
						Debug.Assert(!hasMatch);
						hasMatch = true;
						var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, result.children.Count, value);
						rparent.children.Add(rnode);
						_traversePreOrder(lnode, rnode, targetLparent, targetIndex);
					}
					else
					{
						var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, result.children.Count, lnode.Value);
						rparent.children.Add(rnode);
						_traversePreOrder(lnode, rnode, targetLparent, targetIndex);
					}
				}
			}
		}

		/// <summary>
		/// Creates a new tree with a new child node inserted at the specified position.
		/// </summary>
		/// <param name="parent">The parent node. If null, operates at root level.</param>
		/// <param name="index">Zero-based index where to insert the new child.</param>
		/// <param name="value">The value for the new node.</param>
		/// <returns>A new tree with the inserted node.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
		/// <exception cref="InvalidOperationException">If the specified parent is not found on this tree.</exception>
		public TreeRecord<T> WithInsertChild(TreeRecordNode<T>? parent, int index, T value)
		{
			if (index < 0) throw new ArgumentOutOfRangeException(nameof(index));
			if (parent == null && index > this.children.Count) throw new ArgumentOutOfRangeException(nameof(index));

			var hasMatch = false;
			var height = 0;
			var result = new TreeRecord<T>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				if (i == index && parent == null)
				{
					Debug.Assert(!hasMatch);
					hasMatch = true;
					result.children.Add(TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, value));
				}
				var lnode = this.children[i];
				var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, lnode.Value);
				result.children.Add(rnode);
				height = Math.Max(height, rnode.Depth + 1);
				height = _traversePreOrder(lnode, rnode, parent, index, height);
			}
			if (this.children.Count == index && parent == null)
			{
				Debug.Assert(!hasMatch);
				hasMatch = true;
				result.children.Add(TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, value));
				height = Math.Max(height, 1);
			}
			if (!hasMatch) throw new InvalidOperationException("Child node not found on this tree.");
			result.count = this.count + 1;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, TreeRecordNode<T>? targetLparent, int targetIndex, int height)
			{
				if (targetLparent == lparent && targetIndex > lparent.children.Count) throw new ArgumentOutOfRangeException(nameof(targetIndex));

				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					if (i == targetIndex && targetLparent == lparent)
					{
						Debug.Assert(!hasMatch);
						hasMatch = true;
						rparent.children.Add(TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, value));
					}
					var lnode = lparent.children[i];
					var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, lnode.Value);
					rparent.children.Add(rnode);
					height = Math.Max(height, rnode.Depth + 1);
					height = _traversePreOrder(lnode, rnode, targetLparent, targetIndex, height);
				}
				if (rparent.children.Count == targetIndex && targetLparent == lparent)
				{
					Debug.Assert(!hasMatch);
					hasMatch = true;
					rparent.children.Add(TreeRecordNode<T>.pool.Hold(result, rparent, result.children.Count, value));
					height = Math.Max(height, rparent.Depth + 2);
				}
				return height;
			}
		}

		/// <summary>
		/// Creates a new tree with a new child node added at the end of parent's children.
		/// </summary>
		/// <param name="parent">The parent node. If null, adds to root level.</param>
		/// <param name="value">The value for the new node.</param>
		/// <returns>A new tree with the added node.</returns>
		/// <exception cref="InvalidOperationException">If the specified parent is not found on this tree.</exception>
		public TreeRecord<T> WithAddChild(TreeRecordNode<T>? parent, T value) => this.WithInsertChild(parent, parent?.children.Count ?? this.children.Count, value);

		/// <summary>
		/// Creates a new tree with the specified child node removed.
		/// </summary>
		/// <param name="parent">The parent node. If null, operates at root level.</param>
		/// <param name="index">Zero-based index of the child to remove.</param>
		/// <returns>A new tree with the node removed.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
		/// <exception cref="InvalidOperationException">If the specified node is not found on this tree.</exception>
		public TreeRecord<T> WithRemoveChildAt(TreeRecordNode<T>? parent, int index)
		{
			if (index < 0) throw new ArgumentOutOfRangeException(nameof(index));
			if (parent == null && index >= this.children.Count) throw new ArgumentOutOfRangeException(nameof(index));

			var hasMatch = false;
			var height = 0;
			var result = new TreeRecord<T>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				if (i == index && parent == null)
				{
					Debug.Assert(!hasMatch);
					hasMatch = true;
					continue;
				}
				var lnode = this.children[i];
				var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, lnode.Value);
				result.children.Add(rnode);
				height = Math.Max(height, rnode.Depth + 1);
				height = _traversePreOrder(lnode, rnode, parent, index, height);
			}
			if (!hasMatch) throw new InvalidOperationException("Child node not found on this tree.");
			result.count = this.count - 1;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, TreeRecordNode<T>? targetLparent, int targetIndex, int height)
			{
				if (targetLparent == lparent && targetIndex >= lparent.children.Count) throw new ArgumentOutOfRangeException(nameof(targetIndex));

				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					if (i == targetIndex && targetLparent == lparent)
					{
						Debug.Assert(!hasMatch);
						hasMatch = true;
						continue;
					}
					var lnode = lparent.children[i];
					var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, lnode.Value);
					rparent.children.Add(rnode);
					height = Math.Max(height, rnode.Depth + 1);
					height = _traversePreOrder(lnode, rnode, targetLparent, targetIndex, height);
				}
				return height;
			}
		}

		/// <summary>
		/// Creates a new tree with a child node moved or copied to a new location.
		/// </summary>
		/// <param name="srcParent">Source parent node. If null, moves from root level.</param>
		/// <param name="srcIndex">Source index of the child to move.</param>
		/// <param name="destParent">Destination parent node. If null, moves to root level.</param>
		/// <param name="destIndex">Destination index to move to.</param>
		/// <param name="copy">If true, creates a copy instead of moving.</param>
		/// <returns>A new tree with the node moved or copied.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If any index is invalid.</exception>
		/// <exception cref="InvalidOperationException">If source node is not found on this tree (when not copying).</exception>
		/// <exception cref="InvalidOperationException">If destination parent is not found on this tree.</exception>
		/// <exception cref="InvalidOperationException">If attempting to move a parent as child of its own subtree.</exception>
		public TreeRecord<T> WithMoveChild(TreeRecordNode<T>? srcParent, int srcIndex, TreeRecordNode<T>? destParent, int destIndex, bool copy = false)
		{
			if (srcIndex < 0) throw new ArgumentOutOfRangeException(nameof(srcIndex));
			if (srcParent == null && srcIndex >= this.children.Count) throw new ArgumentOutOfRangeException(nameof(srcIndex));
			if (destIndex < 0) throw new ArgumentOutOfRangeException(nameof(destIndex));
			if (destParent == null && destIndex > this.children.Count) throw new ArgumentOutOfRangeException(nameof(destIndex));

			TreeRecordNode<T> srcLnode = srcParent == null ? this.children[srcIndex] : srcParent.children[srcIndex];
			if (destParent != null && destParent.HasAncestor(srcLnode)) throw new InvalidOperationException("Cannot move a parent node as a child of its own subtree.");

			var height = 0;
			var hasSrcParentMatch = false;
			var hasDestParentMatch = destParent == null; // null is always "matched"
			TreeRecordNode<T>? destRparent = null;
			int destRindex = -1;
			var result = new TreeRecord<T>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				if (lnode == destParent) hasDestParentMatch = true;
				if (i == destIndex && destParent == null)
				{
					Debug.Assert(destRindex == -1);
					result.children.Add(null!); //	placeholder
					destRindex = i;
				}
				if (lnode == srcLnode)
				{
					hasSrcParentMatch = true;
					if (!copy) continue;
				}
				var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, lnode.Value);
				result.children.Add(rnode);
				height = Math.Max(height, rnode.Depth + 1);
				height = _traversePreOrder(lnode, rnode, height);
			}
			if (this.children.Count == destIndex && destParent == null)
			{
				Debug.Assert(destRindex == -1);
				result.children.Add(null!); //	placeholder
				destRindex = this.children.Count;
			}
			if (!hasDestParentMatch) throw new InvalidOperationException("Destination parent node not found on this tree.");
			if (destRindex == -1) throw new InvalidOperationException("Destination node not found on this tree.");
			if (!copy && !hasSrcParentMatch) throw new InvalidOperationException("Source parent node not found on this tree.");

			if (!copy && srcParent == destParent && srcIndex < destIndex) --destRindex;
			var destRnode = TreeRecordNode<T>.pool.Hold(result, destRparent, destRindex, srcLnode.Value);
			if (destRparent == null) result.children[destRindex] = destRnode;
			else destRparent.children[destRindex] = destRnode;
			height = Math.Max(height, destRnode.Depth + 1);
			height = _traversePreOrder(srcLnode, destRnode, height);

			result.count = this.count;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, int height)
			{
				if (srcParent == lparent && srcIndex >= lparent.children.Count) throw new ArgumentOutOfRangeException(nameof(srcIndex));
				if (destParent == lparent && destIndex > lparent.children.Count) throw new ArgumentOutOfRangeException(nameof(destIndex));

				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					if (lnode == destParent) hasDestParentMatch = true;
					if (i == destIndex && destParent == lparent)
					{
						Debug.Assert(destRindex == -1);
						rparent.children.Add(null!); //	placeholder
						destRparent = rparent;
						destRindex = i;
					}
					if (lnode == srcLnode)
					{
						hasSrcParentMatch = true;
						if (!copy) continue;
					}
					var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, lnode.Value);
					rparent.children.Add(rnode);
					height = Math.Max(height, rnode.Depth + 1);
					height = _traversePreOrder(lnode, rnode, height);
				}
				if (rparent.children.Count == destIndex && destParent == lparent)
				{
					Debug.Assert(destRindex == -1);
					rparent.children.Add(null!); //	placeholder
					destRindex = rparent.children.Count;
				}
				return height;
			}
		}

		/// <summary>
		/// Creates a new tree with a child node moved or copied to a new position under the same parent.
		/// </summary>
		/// <param name="parent">The parent node. If null, operates at root level.</param>
		/// <param name="srcIndex">Source index of the child to move.</param>
		/// <param name="destIndex">Destination index to move to.</param>
		/// <param name="copy">If true, creates a copy instead of moving.</param>
		/// <returns>A new tree with the node moved or copied.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If any index is invalid.</exception>
		/// <exception cref="InvalidOperationException">If the specified node is not found on this tree.</exception>
		public TreeRecord<T> WithMoveChild(TreeRecordNode<T>? parent, int srcIndex, int destIndex, bool copy = false) => this.WithMoveChild(parent, srcIndex, parent, destIndex, copy);


		/// <summary>
		/// Creates a new tree with updated value at the specified root-level child position.
		/// </summary>
		/// <param name="index">Zero-based index of the child to update.</param>
		/// <param name="value">The new value to set.</param>
		/// <returns>A new tree with the updated node.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
		public TreeRecord<T> WithUpdateChild(int index, T value) => this.WithUpdateChild(null, index, value);

		/// <summary>
		/// Creates a new tree with a new child node inserted at the specified root-level position.
		/// </summary>
		/// <param name="index">Zero-based index where to insert the new child.</param>
		/// <param name="value">The value for the new node.</param>
		/// <returns>A new tree with the inserted node.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
		public TreeRecord<T> WithInsertChild(int index, T value) => this.WithInsertChild(null, index, value);

		/// <summary>
		/// Creates a new tree with a new child node added at the end of root-level children.
		/// </summary>
		/// <param name="value">The value for the new node.</param>
		/// <returns>A new tree with the added node.</returns>
		public TreeRecord<T> WithAddChild(T value) => this.WithAddChild(null, value);

		/// <summary>
		/// Creates a new tree with the specified root-level child node removed.
		/// </summary>
		/// <param name="index">Zero-based index of the child to remove.</param>
		/// <returns>A new tree with the node removed.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
		public TreeRecord<T> WithRemoveChildAt(int index) => this.WithRemoveChildAt(null, index);

		/// <summary>
		/// Creates a new tree with a root-level child node moved to a new position.
		/// </summary>
		/// <param name="srcIndex">Source index of the child to move.</param>
		/// <param name="destIndex">Destination index to move to.</param>
		/// <returns>A new tree with the node moved.</returns>
		/// <exception cref="ArgumentOutOfRangeException">If any index is invalid.</exception>
		public TreeRecord<T> WithMoveChild(int srcIndex, int destIndex) => this.WithMoveChild(null, srcIndex, null, destIndex);

		#endregion

		#region LINQ - Typed

		internal void TranscribeInternal(TreeRecord<T> target, Func<TreeRecordNode<T>, bool>? predicate, Func<TreeRecordNode<T>, int, bool>? predicate2, bool usePredicateAsFilter, Func<TreeRecordNode<T>, TreeRecordNode<T>>? transformNode, TreeRecordNode<T>? parent, bool traverse)
		{
			if (parent != null && parent.Tree != this) throw new ArgumentException("Node not found on this tree.", nameof(parent));

			var count = 0;
			var height = 0;
			var children = parent != null ? parent.children : this.children;
			for (int length = children.Count, i = 0; i < length; ++i)
			{
				var lnode = children[i];
				TreeRecordNode<T> rnode;
				if (usePredicateAsFilter)
				{
					if (predicate != null)
					{
						if (predicate(lnode)) continue;
					}
					else if (predicate2 != null)
					{
						if (predicate2(lnode, i)) continue;
					}
					rnode = transformNode == null ? TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value));
				}
				else
				{
					if (predicate != null)
					{
						rnode = transformNode == null || !predicate(lnode) ? TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value));
					}
					else if (predicate2 != null)
					{
						rnode = transformNode == null || !predicate2(lnode, i) ? TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value));
					}
					else rnode = transformNode == null ? TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, null, target.children.Count, lnode.Value));
				}

				target.children.Add(rnode);
				++count;
				height = Math.Max(height, rnode.Depth + 1);
				if (traverse) count = _traversePreOrder(lnode, rnode, predicate, predicate2, usePredicateAsFilter, transformNode, traverse, count, ref height);
			}
			target.count = count;
			target.height = height;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, Func<TreeRecordNode<T>, bool>? predicate, Func<TreeRecordNode<T>, int, bool>? predicate2, bool usePredicateAsFilter, Func<TreeRecordNode<T>, TreeRecordNode<T>>? transformNode, bool traverse, int count, ref int height)
			{
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					TreeRecordNode<T> rnode;
					if (usePredicateAsFilter)
					{
						if (predicate != null)
						{
							if (predicate(lnode)) continue;
						}
						else if (predicate2 != null)
						{
							if (predicate2(lnode, i)) continue;
						}
						rnode = transformNode == null ? TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value));
					}
					else
					{
						if (predicate != null)
						{
							rnode = transformNode == null || !predicate(lnode) ? TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value));
						}
						else if (predicate2 != null)
						{
							rnode = transformNode == null || !predicate2(lnode, i) ? TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value));
						}
						else rnode = transformNode == null ? TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value) : transformNode(TreeRecordNode<T>.pool.Hold(target, rparent, rparent.children.Count, lnode.Value));
					}
					rparent.children.Add(rnode);
					++count;
					height = Math.Max(height, rnode.Depth + 1);
					count = _traversePreOrder(lnode, rnode, predicate, predicate2, usePredicateAsFilter, transformNode, traverse, count, ref height);
				}
				return count;
			}
		}

		internal TreeRecord<T> TranscribeInternal(Func<TreeRecordNode<T>, bool>? predicate, Func<TreeRecordNode<T>, int, bool>? predicate2, bool usePredicateAsFilter, Func<TreeRecord<T>, TreeRecord<T>>? transformTree, Func<TreeRecordNode<T>, TreeRecordNode<T>>? transformNode, TreeRecordNode<T>? parent, bool traverse)
		{
			var result = new TreeRecord<T>();
			this.TranscribeInternal(result, predicate, predicate2, usePredicateAsFilter, transformNode, parent, traverse);
			return transformTree == null ? result : transformTree(result);
		}

		public TreeRecord<T> Subtree(TreeRecordNode<T> parent, bool onlyChildren = true)
		{
			if (parent.Tree != this) throw new ArgumentException("Node not found on this tree.", nameof(parent));

			var result = new TreeRecord<T>();
			var count = 0;
			var height = 0;

			TreeRecordNode<T>? rparent = null;
			if (!onlyChildren)
			{
				rparent = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, parent.Value);
				result.children.Add(rparent);
				++count;
				height = Math.Max(height, rparent.Depth + 1);
			}
			for (int length = parent.children.Count, i = 0; i < length; ++i)
			{
				var lnode = parent.children[i];
				var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, result.children.Count, lnode.Value);
				result.children.Add(rnode);
				++count;
				height = Math.Max(height, rnode.Depth + 1);
				count = _traversePreOrder(lnode, rnode, parent, count, ref height);
			}
			result.count = count;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, TreeRecordNode<T>? targetLparent, int count, ref int height)
			{
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, lnode.Value);
					rparent.children.Add(rnode);
					++count;
					height = Math.Max(height, rnode.Depth + 1);
					count = _traversePreOrder(lnode, rnode, targetLparent, count, ref height);
				}
				return count;
			}
		}

		public TreeRecord<T> Where(Func<TreeRecordNode<T>, int, bool> predicate, TreeRecordNode<T>? parent, bool traverse = true) => this.TranscribeInternal(null, predicate, true, null, null, parent, traverse);

		public TreeRecord<T> Where(Func<TreeRecordNode<T>, bool> predicate, TreeRecordNode<T>? parent, bool traverse = true) => this.TranscribeInternal(predicate, null, true, null, null, parent, traverse);

		public TreeRecord<T> Where(Func<TreeRecordNode<T>, int, bool> predicate, bool traverse = true) => this.TranscribeInternal(null, predicate, true, null, null, null, traverse);

		public TreeRecord<T> Where(Func<TreeRecordNode<T>, bool> predicate, bool traverse = true) => this.TranscribeInternal(predicate, null, true, null, null, null, traverse);

		public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => comparer.Compare(keySelector(a.Value), keySelector(b.Value)));
			return this.TranscribeInternal(null, predicate, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => comparer.Compare(keySelector(a.Value), keySelector(b.Value)));
			return this.TranscribeInternal(predicate, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderBy<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => comparer.Compare(keySelector(a.Value), keySelector(b.Value)));
			return this.TranscribeInternal(null, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => Comparer<TKey>.Default.Compare(keySelector(a.Value), keySelector(b.Value)));
			return this.TranscribeInternal(null, predicate, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => Comparer<TKey>.Default.Compare(keySelector(a.Value), keySelector(b.Value)));
			return this.TranscribeInternal(predicate, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderBy<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => Comparer<TKey>.Default.Compare(keySelector(a.Value), keySelector(b.Value)));
			return this.TranscribeInternal(null, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderByDescending<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => comparer.Compare(keySelector(b.Value), keySelector(a.Value)));
			return this.TranscribeInternal(null, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => comparer.Compare(keySelector(b.Value), keySelector(a.Value)));
			return this.TranscribeInternal(null, predicate, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => comparer.Compare(keySelector(b.Value), keySelector(a.Value)));
			return this.TranscribeInternal(predicate, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderByDescending<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => Comparer<TKey>.Default.Compare(keySelector(b.Value), keySelector(a.Value)));
			return this.TranscribeInternal(null, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => Comparer<TKey>.Default.Compare(keySelector(b.Value), keySelector(a.Value)));
			return this.TranscribeInternal(null, predicate, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
		{
			void _sortChildren(List<TreeRecordNode<T>> children) => children.Sort((a, b) => Comparer<TKey>.Default.Compare(keySelector(b.Value), keySelector(a.Value)));
			return this.TranscribeInternal(predicate, null, false, v => { _sortChildren(v.children); return v; }, v => { _sortChildren(v.children); return v; }, parent, traverse);
		}

		public TreeRecord<T> Distinct(Func<TreeRecordNode<T>, int, bool>? predicate, TreeRecordNode<T>? parent, IEqualityComparer<T>? comparer = null, bool global = true, bool traverse = true)
		{
			if (parent != null && parent.Tree != this) throw new ArgumentException("Node not found on this tree.", nameof(parent));

			var result = new TreeRecord<T>();
			var count = 0;
			var height = 0;
			var set = new HashSet<T>(this.children.Count, comparer);
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				if (predicate == null || predicate(lnode, i))
				{
					if (set.Contains(lnode.Value)) continue;
					set.Add(lnode.Value);
				}
				var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, lnode.Value);
				result.children.Add(rnode);
				++count;
				height = Math.Max(height, rnode.Depth + 1);
				if (traverse) count = _traversePreOrder(lnode, rnode, parent, predicate, comparer, count, ref height, set, global);
			}
			result.count = count;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, TreeRecordNode<T>? targetLparent, Func<TreeRecordNode<T>, int, bool>? predicate, IEqualityComparer<T>? comparer, int count, ref int height, HashSet<T> parentSet, bool global)
			{
				var set = global ? parentSet : new HashSet<T>(lparent.children.Count, comparer);
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					if (predicate == null || predicate(lnode, i))
					{
						if (set.Contains(lnode.Value)) continue;
						set.Add(lnode.Value);
					}
					var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, lnode.Value);
					rparent.children.Add(rnode);
					++count;
					height = Math.Max(height, rnode.Depth + 1);
					count = _traversePreOrder(lnode, rnode, targetLparent, predicate, comparer, count, ref height, parentSet, global);
				}
				return count;
			}
		}

		public TreeRecord<T> Distinct(Func<TreeRecordNode<T>, bool> predicate, TreeRecordNode<T>? parent, IEqualityComparer<T>? comparer = null, bool global = true, bool traverse = true) => this.Distinct((v, _) => predicate(v), parent, comparer, global, traverse);

		public TreeRecord<T> Distinct(TreeRecordNode<T>? parent, IEqualityComparer<T>? comparer = null, bool global = true, bool traverse = true) => this.Distinct((Func<TreeRecordNode<T>, int, bool>?)null, parent, comparer, global, traverse);

		public TreeRecord<T> DistinctBy<TKey>(Func<TreeRecordNode<T>, int, bool>? predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool global = true, bool traverse = true)
		{
			if (parent != null && parent.Tree != this) throw new ArgumentException("Node not found on this tree.", nameof(parent));

			var result = new TreeRecord<T>();
			var count = 0;
			var height = 0;
			var set = new HashSet<TKey>(this.children.Count);
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				if (predicate == null || predicate(lnode, i))
				{
					var lkey = keySelector(lnode.Value);
					if (set.Contains(lkey)) continue;
					set.Add(lkey);
				}
				var rnode = TreeRecordNode<T>.pool.Hold(result, null, result.children.Count, lnode.Value);
				result.children.Add(rnode);
				++count;
				height = Math.Max(height, rnode.Depth + 1);
				if (traverse) count = _traversePreOrder(lnode, rnode, parent, predicate, count, ref height, set, global);
			}
			result.count = count;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<T> rparent, TreeRecordNode<T>? targetLparent, Func<TreeRecordNode<T>, int, bool>? predicate, int count, ref int height, HashSet<TKey> parentSet, bool global)
			{
				var set = global ? parentSet : new HashSet<TKey>(lparent.children.Count);
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					if (predicate == null || predicate(lnode, i))
					{
						var lkey = keySelector(lnode.Value);
						if (set.Contains(lkey)) continue;
						set.Add(lkey);
					}
					var rnode = TreeRecordNode<T>.pool.Hold(result, rparent, rparent.children.Count, lnode.Value);
					rparent.children.Add(rnode);
					++count;
					height = Math.Max(height, rnode.Depth + 1);
					count = _traversePreOrder(lnode, rnode, targetLparent, predicate, count, ref height, parentSet, global);
				}
				return count;
			}
		}

		public TreeRecord<T> DistinctBy<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool global = true, bool traverse = true) => this.DistinctBy((v, _) => predicate(v), keySelector, parent, global, traverse);

		public TreeRecord<T> DistinctBy<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool global = true, bool traverse = true) => this.DistinctBy((Func<TreeRecordNode<T>, int, bool>?)null, keySelector, parent, global, traverse);

		public TreeRecord<TResult> Select<TResult>(Func<TreeRecordNode<T>, int, TResult> selector)
		{
			var height = 0;
			var result = new TreeRecord<TResult>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				var rnode = TreeRecordNode<TResult>.pool.Hold(result, null, result.children.Count, selector(lnode, i));
				result.children.Add(rnode);
				height = Math.Max(height, rnode.Depth + 1);
				height = _traversePreOrder(lnode, rnode, selector, height);
			}
			result.count = this.count;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<TResult> rparent, Func<TreeRecordNode<T>, int, TResult> selector, int height)
			{
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					var rnode = TreeRecordNode<TResult>.pool.Hold(result, rparent, rparent.children.Count, selector(lnode, i));
					rparent.children.Add(rnode);
					height = Math.Max(height, rnode.Depth + 1);
					height = _traversePreOrder(lnode, rnode, selector, height);
				}
				return height;
			}
		}

		public async Task<TreeRecord<TResult>> SelectAsync<TResult>(Func<TreeRecordNode<T>, int, Task<TResult>> selector)
		{
			var height = 0;
			var result = new TreeRecord<TResult>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				var value = await selector(lnode, i);
				var rnode = TreeRecordNode<TResult>.pool.Hold(result, null, result.children.Count, value);
				result.children.Add(rnode);
				height = Math.Max(height, rnode.Depth + 1);
				height = await _traversePreOrderAsync(lnode, rnode, selector, height);
			}
			result.count = this.count;
			result.height = height;
			return result;

			async Task<int> _traversePreOrderAsync(TreeRecordNode<T> lparent, TreeRecordNode<TResult> rparent, Func<TreeRecordNode<T>, int, Task<TResult>> selector, int height)
			{
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					var value = await selector(lnode, i);
					var rnode = TreeRecordNode<TResult>.pool.Hold(result, rparent, rparent.children.Count, value);
					rparent.children.Add(rnode);
					height = Math.Max(height, rnode.Depth + 1);
					height = await _traversePreOrderAsync(lnode, rnode, selector, height);
				}
				return height;
			}
		}

		public TreeRecord<TResult> Select<TResult>(Func<TreeRecordNode<T>, TResult> selector) => this.Select((v, _) => selector(v));

		public async Task<TreeRecord<TResult>> SelectAsync<TResult>(Func<TreeRecordNode<T>, Task<TResult>> selector) => await this.SelectAsync((v, _) => selector(v));

		public TreeRecord<TResult> OfType<TResult>()
		{
			var count = 0;
			var height = 0;
			var result = new TreeRecord<TResult>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				if (lnode.Value is not TResult rvalue) continue;
				var rnode = TreeRecordNode<TResult>.pool.Hold(result, null, result.children.Count, rvalue);
				result.children.Add(rnode);
				++count;
				height = Math.Max(height, rnode.Depth + 1);
				count = _traversePreOrder(lnode, rnode, count, ref height);
			}
			result.count = count;
			result.height = height;
			return result;

			int _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<TResult> rparent, int count, ref int height)
			{
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					if (lnode.Value is not TResult rvalue) continue;
					var rnode = TreeRecordNode<TResult>.pool.Hold(result, rparent, rparent.children.Count, rvalue);
					rparent.children.Add(rnode);
					++count;
					height = Math.Max(height, rnode.Depth + 1);
					count = _traversePreOrder(lnode, rnode, count, ref height);
				}
				return count;
			}
		}

		public TreeRecord<TResult> Cast<TResult>()
		{
			var result = new TreeRecord<TResult>();
			for (int length = this.children.Count, i = 0; i < length; ++i)
			{
				var lnode = this.children[i];
				object? rvalue = lnode.Value;
#nullable disable // there's no way to annotate the connection of the nullability of TResult to that of the source
				var rnode = TreeRecordNode<TResult>.pool.Hold(result, null, result.children.Count, (TResult)rvalue);
#nullable restore
				result.children.Add(rnode);
				_traversePreOrder(lnode, rnode);
			}
			result.count = this.count;
			result.height = this.height;
			return result;

			void _traversePreOrder(TreeRecordNode<T> lparent, TreeRecordNode<TResult> rparent)
			{
				for (int length = lparent.children.Count, i = 0; i < length; ++i)
				{
					var lnode = lparent.children[i];
					object? rvalue = lnode.Value;
#nullable disable // there's no way to annotate the connection of the nullability of TResult to that of the source
					var rnode = TreeRecordNode<TResult>.pool.Hold(result, rparent, rparent.children.Count, (TResult)rvalue);
#nullable restore
					rparent.children.Add(rnode);
					_traversePreOrder(lnode, rnode);
				}
			}
		}

		#endregion

		#region Overrides

		public override bool Equals(object? obj)
		{
			if (obj is null) return false;
			if (ReferenceEquals(this, obj)) return true;
			return obj is TreeRecord<T> other && this.Equals(other);
		}

		public override int GetHashCode()
		{
			if (this.cache_hasCode != null) return this.cache_hasCode.Value;
			var hash = new HashCode();
			_addTreeHash(hash);
			this.cache_hasCode = hash.ToHashCode();
			return this.cache_hasCode.Value;

			void _addTreeHash(HashCode hash)
			{
				for (int i = 0; i < this.children.Count; i++)
				{
					var node = this.children[i];
					hash.Add(node.Value);
					_addTreeNodeHash(node, hash);
				}
			}
			void _addTreeNodeHash(TreeRecordNode<T> parent, HashCode hash)
			{
				for (int i = 0; i < parent.children.Count; i++)
				{
					var node = parent.children[i];
					hash.Add(node.Value);
					_addTreeNodeHash(node, hash);
				}
			}
		}

		public static bool operator ==(TreeRecord<T>? left, TreeRecord<T>? right)
		{
			if (left is null) return right is null;
			return left.Equals(right);
		}

		public static bool operator !=(TreeRecord<T>? left, TreeRecord<T>? right) => !(left == right);

		#endregion

		#region Traversal

		public void TraversePreOrder(Action<TreeRecordNode<T>> action)
		{
			foreach (var root in this.children) _traversePreOrderInternal(root, action);
			void _traversePreOrderInternal(TreeRecordNode<T> node, Action<TreeRecordNode<T>> action)
			{
				action(node);
				foreach (var child in node.Children) _traversePreOrderInternal(child, action);
			}
		}

		public void TraversePostOrder(Action<TreeRecordNode<T>> action)
		{
			foreach (var root in this.children) _traversePostOrderInternal(root, action);
			void _traversePostOrderInternal(TreeRecordNode<T> node, Action<TreeRecordNode<T>> action)
			{
				foreach (var child in node.Children) _traversePostOrderInternal(child, action);
				action(node);
			}
		}

		public void TraverseLevelOrder(Action<TreeRecordNode<T>, int> action)
		{
			if (this.children.Count == 0) return;

			var queue = new Queue<TreeRecordNode<T>>();

			// Process and enqueue all roots first
			for (int i = 0; i < this.children.Count; i++)
			{
				var root = this.children[i];
				action(root, i);
				queue.Enqueue(root);
			}

			while (queue.Count > 0)
			{
				var node = queue.Dequeue();

				for (int i = 0; i < node.Children.Count; i++)
				{
					var child = node.Children[i];
					action(child, i);
					queue.Enqueue(child);
				}
			}
		}

		#endregion

		#region Public

		public bool Contains(TreeRecordNode<T> item) => this.ToNodeList(TraverseOrder.PreOrder).Contains(item);

		public Builder ToBuilder() => new(this);

		public ListRecord<TreeRecordNode<T>> ToNodeList(TraverseOrder traverseOrder = TraverseOrder.PreOrder)
		{
			switch (traverseOrder)
			{
				case TraverseOrder.PreOrder:
					{
						if (this.cache_allNodes_preOrder != null) return this.cache_allNodes_preOrder;
						var result = new ListRecord<TreeRecordNode<T>>.Builder();
						this.TraversePreOrder(result.Add);
						return this.cache_allNodes_preOrder = result.ToListRecord();
					}
				case TraverseOrder.PostOrder:
					{
						if (this.cache_allNodes_postOrder != null) return this.cache_allNodes_postOrder;
						var result = new ListRecord<TreeRecordNode<T>>.Builder();
						this.TraversePostOrder(result.Add);
						return this.cache_allNodes_postOrder = result.ToListRecord();
					}
				case TraverseOrder.LevelOrder:
					{
						if (this.cache_allNodes_levelOrder != null) return this.cache_allNodes_levelOrder;
						var result = new ListRecord<TreeRecordNode<T>>.Builder();
						this.TraverseLevelOrder((v, i) => result.Add(v));
						return this.cache_allNodes_levelOrder = result.ToListRecord();
					}
				default: throw new NotImplementedException();
			}
		}

		public IReadOnlyList<T> ToValueList(TraverseOrder traverseOrder = TraverseOrder.PreOrder)
		{
			switch (traverseOrder)
			{
				case TraverseOrder.PreOrder:
					{
						if (this.cache_allValues_preOrder != null) return this.cache_allValues_preOrder;
						if (this.cache_allNodes_preOrder != null) return this.cache_allValues_preOrder = this.cache_allNodes_preOrder.Select(v => v.value);
						var result = new ListRecord<T>.Builder();
						this.TraversePreOrder(v => result.Add(v.Value));
						return this.cache_allValues_preOrder = result.ToListRecord();
					}
				case TraverseOrder.PostOrder:
					{
						if (this.cache_allValues_postOrder != null) return this.cache_allValues_postOrder;
						if (this.cache_allNodes_postOrder != null) return this.cache_allValues_postOrder = this.cache_allNodes_postOrder.Select(v => v.value);
						var result = new ListRecord<T>.Builder();
						this.TraversePostOrder(v => result.Add(v.Value));
						return this.cache_allValues_postOrder = result.ToListRecord();
					}
				case TraverseOrder.LevelOrder:
					{
						if (this.cache_allValues_levelOrder != null) return this.cache_allValues_levelOrder;
						if (this.cache_allNodes_levelOrder != null) return this.cache_allValues_levelOrder = this.cache_allNodes_levelOrder.Select(v => v.value);
						var result = new ListRecord<T>.Builder();
						this.TraverseLevelOrder((v, i) => result.Add(v.Value));
						return this.cache_allValues_levelOrder = result.ToListRecord();
					}
				default: throw new NotImplementedException();
			}
		}

		public int Count => this.count;

		public int Height => this.height;

		#endregion

		readonly List<TreeRecordNode<T>> children;

		int count;
		int height;

		int? cache_hasCode = null;
		ListRecord<TreeRecordNode<T>>? cache_allNodes_preOrder = null;
		ListRecord<TreeRecordNode<T>>? cache_allNodes_postOrder = null;
		ListRecord<TreeRecordNode<T>>? cache_allNodes_levelOrder = null;
		ListRecord<T>? cache_allValues_preOrder = null;
		ListRecord<T>? cache_allValues_postOrder = null;
		ListRecord<T>? cache_allValues_levelOrder = null;
	}

	#endregion

	#region TreeRecordNodeDebugView<T>

	internal sealed class TreeRecordNodeDebugView<T>
	{
		public TreeRecordNodeDebugView(TreeRecordNode<T> node)
		{
			this.node = node;
		}

		public T Value => this.node.Value;

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public TreeRecordNode<T>[] Children => [.. this.node.Children];

		readonly TreeRecordNode<T> node;
	}

	#endregion

	#region TreeRecordDebugView<T>

	internal sealed class TreeRecordDebugView<T>
	{
		public TreeRecordDebugView(TreeRecord<T> tree)
		{
			this.tree = tree;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public TreeRecordNode<T>[] Children => [.. this.tree.Children];

		readonly TreeRecord<T> tree;
	}

	#endregion

	#region TreeRecord

	public static partial class TreeRecord
	{
		#region JSON Serialization

		public class JsonConverter<T> : global::System.Text.Json.Serialization.JsonConverter<TreeRecord<T>>
		{
			public override TreeRecord<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
			{
				if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException("Expected StartArray token");

				var builder = new TreeRecord<T>.Builder();
				reader.Read(); // Move to first root or end of array

				while (reader.TokenType != JsonTokenType.EndArray)
				{
					this.DeserializeNode(ref reader, options, builder, null);
					reader.Read(); // Move to next root or end of array
				}

				return builder.ToTreeRecord();
			}

			void DeserializeNode(ref Utf8JsonReader reader, JsonSerializerOptions options, TreeRecord<T>.Builder builder, TreeRecordNode<T>? parent)
			{
				if (reader.TokenType != JsonTokenType.StartObject) throw new JsonException("Expected StartObject token");

				T? value = default;
				bool hasValue = false;
				bool nodeCreated = false;

				reader.Read(); // Move to first property
				while (reader.TokenType == JsonTokenType.PropertyName)
				{
					var propertyName = reader.GetString();
					reader.Read(); // Move to property value

					switch (propertyName)
					{
						case "Value":
							value = JsonSerializer.Deserialize<T>(ref reader, options);
							hasValue = true;
							break;
						case "Children":
							if (!hasValue) throw new JsonException("Value must be deserialized before Children");
							if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException("Expected StartArray token for Children");

							var node = builder.AddChild(parent, value!);    // Create the current node before processing children
							nodeCreated = true;

							reader.Read(); // Move to first child or end of array
							while (reader.TokenType != JsonTokenType.EndArray)
							{
								this.DeserializeNode(ref reader, options, builder, node);
								reader.Read(); // Move to next child or end of array
							}
							break;
						default: throw new JsonException($"Unexpected property: {propertyName}");
					}
					reader.Read(); // Move to next property name or end of object
				}

				if (!hasValue) throw new JsonException("Required property 'Value' not found");
				if (!nodeCreated) builder.AddChild(parent, value!);	// If no children were processed, we still need to create the node
			}

			public override void Write(Utf8JsonWriter writer, TreeRecord<T> value, JsonSerializerOptions options)
			{
				writer.WriteStartArray();
				foreach (var root in value.Children) this.SerializeNode(writer, root, options);
				writer.WriteEndArray();
			}

			private void SerializeNode(Utf8JsonWriter writer, TreeRecordNode<T>? node, JsonSerializerOptions options)
			{
				if (node == null)
				{
					writer.WriteNullValue();
					return;
				}

				writer.WriteStartObject();
				writer.WritePropertyName("Value");
				JsonSerializer.Serialize(writer, node.Value, options);
				if (node.Children.Count != 0)
				{
					writer.WritePropertyName("Children");
					writer.WriteStartArray();
					foreach (var child in node.Children) this.SerializeNode(writer, child, options);
					writer.WriteEndArray();
				}
				writer.WriteEndObject();
			}
		}

		public class JsonConverterFactory : global::System.Text.Json.Serialization.JsonConverterFactory
		{
			public override bool CanConvert(Type typeToConvert)
			{
				if (!typeToConvert.IsGenericType) return false;
				return typeToConvert.GetGenericTypeDefinition() == typeof(TreeRecord<>);
			}

			public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
			{
				var elementType = typeToConvert.GetGenericArguments()[0];
				var converterType = typeof(TreeRecord.JsonConverter<>).MakeGenericType(elementType);
				return (JsonConverter)Activator.CreateInstance(converterType)!;
			}
		}

		#endregion
	}

	#endregion
}
