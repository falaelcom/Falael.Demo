using System.Diagnostics;

namespace Falael
{
	#region TreeRecord<T>

	public sealed partial class TreeRecord<T>
	{
		#region Builder

		[DebuggerDisplay("Children = {Children.Count}, Count = {Count}, Height = {Height}, IsReadOnly = false")]
		[DebuggerTypeProxy(typeof(TreeRecordBuilderDebugView<>))]
		public class Builder
		{
			internal Builder(TreeRecord<T> source) => this.source = source;
			public Builder() { }
			public Builder(IEnumerable<TreeRecordNode<T>> rootNodes)
			{
				this.EnsureState();
				foreach (var item in rootNodes) this.AddChildFrom(item, copySubtree: true);
			}

			#region Mutations

			TreeRecordNode<T> UpdateChildInternal(TreeRecordNode<T>? parent, int index, T value)
			{
				Debug.Assert(this.buffer != null);

				if (index < 0) throw new ArgumentOutOfRangeException(nameof(index));
				if (parent == null && index >= this.buffer.children.Count) throw new ArgumentOutOfRangeException(nameof(index));
				if (parent != null && parent.Tree != this.buffer) throw new ArgumentException("Node not found on this tree.", nameof(parent));
				if (parent != null && index >= parent.children.Count) throw new ArgumentOutOfRangeException(nameof(index));

				var result = parent == null ? this.buffer.children[index] : parent.children[index];
				result.value = value;
				return result;
			}

			TreeRecordNode<T> InsertChildInternal(TreeRecordNode<T>? parent, int index, T value)
			{
				Debug.Assert(this.buffer != null);
				Debug.Assert(this.map != null);

				if (index < 0) throw new ArgumentOutOfRangeException(nameof(index));
				if (parent == null && index > this.buffer.children.Count) throw new ArgumentOutOfRangeException(nameof(index));
				if (parent != null && parent.Tree != this.buffer) throw new ArgumentException("Node is on this tree.", nameof(parent));
				if (parent != null && index > parent.children.Count) throw new ArgumentOutOfRangeException(nameof(index));

				var children = parent == null ? this.buffer.children : parent.children;
				var node = TreeRecordNode<T>.pool.Hold(this.buffer, parent, index, value);
				if (!this.map.Add(node)) Debug.Fail("!this.map.Add(node)");
				for (int length = children.Count, i = index; i < length; ++i) ++children[i].SiblingIndex;
				children.Insert(index, node);
				this.buffer.count = this.map?.Count ?? 0;
				this.buffer.height = Math.Max(this.buffer.height, node.Depth + 1);
				return node;
			}

			///	<remarks>Throws an exception if `parent` is on another tree.</remarks>
			TreeRecordNode<T> RemoveChildAtInternal(TreeRecordNode<T>? parent, int index)
			{
				Debug.Assert(this.buffer != null);
				Debug.Assert(this.map != null);

				if (index < 0) throw new ArgumentOutOfRangeException(nameof(index));
				if (parent == null && index >= this.buffer.children.Count) throw new ArgumentOutOfRangeException(nameof(index));
				if (parent != null && parent.Tree != this.buffer) throw new ArgumentException("Node not found on this tree.", nameof(parent));
				if (parent != null && index >= parent.children.Count) throw new ArgumentOutOfRangeException(nameof(index));

				var children = parent == null ? this.buffer.children : parent.children;
				var node = children[index];
				if (!this.map.Remove(node)) Debug.Fail("!this.map.Remove(node)");
				for (int length = children.Count, i = index; i < length; ++i) --children[i].SiblingIndex;
				children.RemoveAt(index);
				this.RemoveNodeSubtree(node);
				this.buffer.count = this.map?.Count ?? 0;
				this.buffer.height = this.GetTreeMaxDepth();
				return node;
			}

			TreeRecordNode<T> MoveChildInternal(TreeRecordNode<T> child, TreeRecordNode<T>? destParent, int destIndex, bool copy)
			{
				Debug.Assert(this.buffer != null);
				Debug.Assert(this.map != null);

				if (child.Tree != this.buffer && !copy) throw new ArgumentException("Moving node not found on this tree.", nameof(child));
				if (child.Parent != null && child.Parent.Tree != this.buffer && !copy) throw new ArgumentException("Moving node's parent not found on this tree.", nameof(child));

				var index = child.Parent == null ? this.buffer.children.IndexOf(child) : child.Parent.children.IndexOf(child);
				Debug.Assert(index != -1);

				return this.MoveChildInternal(child.Parent, index, destParent, destIndex, copy);
			}

			///	<remarks>
			///		Throws an exception if `srcParent` or `destParent` is on another tree.
			///	</remarks>
			TreeRecordNode<T> MoveChildInternal(TreeRecordNode<T>? srcParent, int srcIndex, TreeRecordNode<T>? destParent, int destIndex, bool copy)
			{
				this.EnsureState();
				Debug.Assert(this.buffer != null);
				Debug.Assert(this.map != null);

				if (srcIndex < 0) throw new ArgumentOutOfRangeException(nameof(srcIndex));
				if (srcParent == null && srcIndex >= this.buffer.children.Count) throw new ArgumentOutOfRangeException(nameof(srcIndex));
				if (srcParent != null && srcParent.Tree != this.buffer && !copy) throw new ArgumentException("Moving node not found on this tree.", nameof(srcParent));
				if (srcParent != null && srcIndex >= srcParent.children.Count) throw new ArgumentOutOfRangeException(nameof(srcIndex));

				if (destIndex < 0) throw new ArgumentOutOfRangeException(nameof(destIndex));
				if (destParent == null && destIndex > this.buffer.children.Count) throw new ArgumentOutOfRangeException(nameof(destIndex));
				if (destParent != null && destParent.Tree != this.buffer) throw new ArgumentException("Node not found on this tree.", nameof(destParent));
				if (destParent != null && destIndex > destParent.children.Count) throw new ArgumentOutOfRangeException(nameof(destIndex));

				var srcNode = srcParent == null ? this.buffer.children[srcIndex] : srcParent.children[srcIndex];
				if (destParent != null && destParent.HasAncestor(srcNode)) throw new InvalidOperationException("Cannot move a parent node as a child of its own subtree.");

				var srcChildren = srcParent == null ? this.buffer.children : srcParent.children;
				var destChildren = destParent == null ? this.buffer.children : destParent.children;

				if (copy)
				{
					var node = TreeRecordNode<T>.pool.Hold(this.buffer, destParent, destIndex, srcNode.Value);
					for (int length = destChildren.Count, i = destIndex; i < length; ++i) ++destChildren[i].SiblingIndex;
					destChildren.Insert(destIndex, node);
					if (!this.map.Add(node)) Debug.Fail("!this.map.Add(node)");
					this.CopyNodeSubtree(node, srcNode);
					this.buffer.count = this.map?.Count ?? 0;
					this.buffer.height = Math.Max(this.buffer.height, this.GetSubtreeMaxDepth(node) + 1);
					return node;
				}
				else
				{
					var sameCollection = srcChildren == destChildren;

					// First update node and its subtree's depth values
					srcNode.Parent = destParent;
					srcNode.Depth = (destParent?.Depth ?? -1) + 1;
					_updateChildrenDepth(srcNode);

					// Then update indices at destination
					srcNode.SiblingIndex = destIndex;
					for (int length = destChildren.Count, i = destIndex; i < length; ++i) ++destChildren[i].SiblingIndex;
					destChildren.Insert(destIndex, srcNode);

					// Then remove from source, adjusting index if in same collection
					var removeIndex = srcIndex;
					if (sameCollection && destIndex <= srcIndex) ++removeIndex;

					srcChildren.RemoveAt(removeIndex);
					for (int length = srcChildren.Count, i = removeIndex; i < length; ++i) --srcChildren[i].SiblingIndex;

					this.buffer.count = this.map?.Count ?? 0;
					this.buffer.height = Math.Max(this.buffer.height, this.GetSubtreeMaxDepth(srcNode) + 1);
					return srcNode;
				}

				void _updateChildrenDepth(TreeRecordNode<T> node)
				{
					foreach (var child in node.children)
					{
						child.Depth = node.Depth + 1;
						_updateChildrenDepth(child);
					}
				}
			}

			/// <summary>
			/// Updates the value of a child node at the specified index under the given parent.
			/// </summary>
			/// <param name="parent">The parent node. If null, operates at root level.</param>
			/// <param name="index">Zero-based index of the child to update.</param>
			/// <param name="value">The new value to set.</param>
			/// <returns>The updated node.</returns>
			/// <exception cref="ArgumentException">If parent node is from another tree.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> UpdateChild(TreeRecordNode<T>? parent, int index, T value)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.UpdateChildInternal(parent, index, value);
				}
			}

			/// <summary>
			/// Updates a node with the value and optionally the subtree structure from the provided child node.
			/// </summary>
			/// <param name="child">The source node whose value (and optionally subtree) will be copied. Must be from this tree.</param>
			/// <param name="replaceSubtree">If true, replaces the entire subtree structure. If false, only updates the value.</param>
			/// <returns>The updated node.</returns>
			/// <exception cref="ArgumentException">If child node is from another tree.</exception>
			public TreeRecordNode<T> UpdateChildFrom(TreeRecordNode<T>? parent, int index, TreeRecordNode<T> child, bool replaceSubtree = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					Debug.Assert(this.buffer != null);

					var node = this.UpdateChildInternal(parent, index, child.Value);
					if (replaceSubtree)
					{
						this.RemoveNodeSubtree(node);
						this.CopyNodeSubtree(node, child);
					}
					return node;
				}
			}

			/// <summary>
			/// Inserts a new child node with the specified value at the given index under the parent.
			/// </summary>
			/// <param name="parent">The parent node. If null, operates at root level.</param>
			/// <param name="index">Zero-based index where to insert the new child.</param>
			/// <param name="value">The value for the new node.</param>
			/// <returns>The newly created node.</returns>
			/// <exception cref="ArgumentException">If parent node is from another tree.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> InsertChild(TreeRecordNode<T>? parent, int index, T value)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.InsertChildInternal(parent, index, value);
				}
			}

			/// <summary>
			/// Inserts a new child node copying the value and optionally the subtree from the provided node at the specified index.
			/// </summary>
			/// <param name="parent">The parent node. If null, operates at root level.</param>
			/// <param name="index">Zero-based index where to insert.</param>
			/// <param name="child">Source node to copy the value and optionally the subtree from.</param>
			/// <param name="copySubtree">If true, copies the entire subtree structure. If false, copies only the value.</param>
			/// <returns>The newly created node.</returns>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> InsertChildFrom(TreeRecordNode<T>? parent, int index, TreeRecordNode<T> child, bool copySubtree = true)
			{
				lock (this.sync)
				{
					this.EnsureState();

					var node = this.InsertChildInternal(parent, index, child.Value);
					if (copySubtree) this.CopyNodeSubtree(node, child);
					return node;
				}
			}

			/// <summary>
			/// Adds a new child node with the specified value at the end of parent's children.
			/// </summary>
			/// <param name="parent">The parent node. If null, adds to root level.</param>
			/// <param name="value">The value for the new node.</param>
			/// <returns>The newly created node.</returns>
			/// <exception cref="ArgumentException">If parent node is from another tree.</exception>
			public TreeRecordNode<T> AddChild(TreeRecordNode<T>? parent, T value) => this.InsertChild(parent, parent?.children.Count ?? this.buffer?.children.Count ?? 0, value);

			/// <summary>
			/// Adds a new child node copying the value and optionally the subtree from the provided node at the end of parent's children.
			/// </summary>
			/// <param name="parent">The parent node. If null, adds to root level.</param>
			/// <param name="child">Source node to copy from.</param>
			/// <param name="copySubtree">If true, copies the entire subtree structure. If false, copies only the value.</param>
			/// <returns>The newly created node.</returns>
			public TreeRecordNode<T> AddChildFrom(TreeRecordNode<T>? parent, TreeRecordNode<T> child, bool copySubtree = true) => this.InsertChildFrom(parent, parent?.children.Count ?? this.buffer?.children.Count ?? 0, child, copySubtree);

			/// <summary>
			/// Removes the child node at the specified index from under the parent.
			/// </summary>
			/// <param name="parent">The parent node. If null, operates at root level.</param>
			/// <param name="index">Zero-based index of the child to remove.</param>
			/// <returns>The removed node.</returns>
			/// <exception cref="ArgumentException">If parent node is from another tree.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> RemoveChildAt(TreeRecordNode<T>? parent, int index)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.RemoveChildAtInternal(parent, index);
				}
			}

			/// <summary>
			/// Removes the specified child node from the tree.
			/// </summary>
			/// <param name="child">The node to remove. Must be from this tree.</param>
			/// <returns>The removed node.</returns>
			/// <exception cref="ArgumentException">If child node is from another tree.</exception>
			public TreeRecordNode<T> RemoveChild(TreeRecordNode<T> child)
			{
				lock (this.sync)
				{
					this.EnsureState();
					Debug.Assert(this.buffer != null);

					if (child.Tree != this.buffer) throw new ArgumentException("Node not found on this tree.", nameof(child));
					if (child.Parent != null && child.Parent.Tree != this.buffer) throw new ArgumentException("Node's parent not found on this tree.", nameof(child));

					var index = child.Parent == null ? this.buffer.children.IndexOf(child) : child.Parent.children.IndexOf(child);
					Debug.Assert(index != -1);

					return this.RemoveChildAtInternal(child.Parent, index);
				}
			}

			/// <summary>
			/// Moves a child node from one location to another, optionally creating a copy instead.
			/// </summary>
			/// <param name="srcParent">Source parent node. If null, moves from root level.</param>
			/// <param name="srcIndex">Source index of the child to move.</param>
			/// <param name="destParent">Destination parent node. If null, moves to root level.</param>
			/// <param name="destIndex">Destination index to move to.</param>
			/// <param name="copy">If true, creates a copy instead of moving.</param>
			/// <returns>The moved or copied node.</returns>
			/// <exception cref="ArgumentException">If source parent node is from another tree in move mode.</exception>
			/// <exception cref="ArgumentException">If dest parent node is from another tree.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If any index is invalid.</exception>
			/// <exception cref="InvalidOperationException">If attempting to move a parent as child of its own subtree.</exception>
			public TreeRecordNode<T> MoveChild(TreeRecordNode<T>? srcParent, int srcIndex, TreeRecordNode<T>? destParent, int destIndex, bool copy = false)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.MoveChildInternal(srcParent, srcIndex, destParent, destIndex, copy);
				}
			}

			/// <summary>
			/// Moves a specified node to a new location, optionally creating a copy instead.
			/// </summary>
			/// <param name="child">The node to move/copy. Must be from this tree if moving.</param>
			/// <param name="destParent">Destination parent node. If null, moves to root level.</param>
			/// <param name="destIndex">Destination index to move to.</param>
			/// <param name="copy">If true, creates a copy instead of moving.</param>
			/// <returns>The moved or copied node.</returns>
			/// <exception cref="ArgumentException">If child is from another tree, in moving mode.</exception>
			/// <exception cref="ArgumentException">If destParent is from another tree.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If destIndex is invalid.</exception>
			/// <exception cref="InvalidOperationException">If attempting to move a parent as child of its own subtree.</exception>
			public TreeRecordNode<T> MoveChild(TreeRecordNode<T> child, TreeRecordNode<T>? destParent, int destIndex, bool copy = false)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.MoveChildInternal(child, destParent, destIndex, copy);
				}
			}

			/// <summary>
			/// Moves a child node to a new position under the same parent, optionally creating a copy instead.
			/// </summary>
			/// <param name="parent">The parent node. If null, operates at root level.</param>
			/// <param name="srcIndex">Source index of the child to move.</param>
			/// <param name="destIndex">Destination index to move to.</param>
			/// <param name="copy">If true, creates a copy instead of moving.</param>
			/// <returns>The moved or copied node.</returns>
			/// <exception cref="ArgumentException">If parent node is from another tree, in move mode.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If any index is invalid.</exception>
			public TreeRecordNode<T> MoveChild(TreeRecordNode<T>? parent, int srcIndex, int destIndex, bool copy = false) => this.MoveChild(parent, srcIndex, parent, destIndex, copy);

			/// <summary>
			/// Moves a specified node to a new position under its current parent, optionally creating a copy instead.
			/// </summary>
			/// <param name="child">The node to move. Must be from this tree, in move mode.</param>
			/// <param name="destIndex">Destination index to move to.</param>
			/// <param name="copy">If true, creates a copy instead of moving.</param>
			/// <returns>The moved or copied node.</returns>
			/// <exception cref="ArgumentException">If child node is from another tree, in move mode.</exception>
			/// <exception cref="ArgumentOutOfRangeException">If destIndex is invalid.</exception>
			public TreeRecordNode<T> MoveChild(TreeRecordNode<T> child, int destIndex, bool copy = false) => this.MoveChild(child, destIndex, copy);

			/// <summary>
			/// Updates the value of a root-level child node at the specified index.
			/// </summary>
			/// <param name="index">Zero-based index of the child to update.</param>
			/// <param name="value">The new value to set.</param>
			/// <returns>The updated node.</returns>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> UpdateChild(int index, T value) => this.UpdateChild(null, index, value);

			public TreeRecordNode<T> UpdateChildFrom(int index, TreeRecordNode<T> child, bool replaceSubtree = true) => this.InsertChildFrom(null, index, child, replaceSubtree);

			/// <summary>
			/// Inserts a new child node with the specified value at the given index at root level.
			/// </summary>
			/// <param name="index">Zero-based index where to insert the new child.</param>
			/// <param name="value">The value for the new node.</param>
			/// <returns>The newly created node.</returns>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> InsertChild(int index, T value) => this.InsertChild(null, index, value);

			/// <summary>
			/// Inserts a new child node copying the value and optionally the subtree from the provided node at the specified index at root level.
			/// </summary>
			/// <param name="index">Zero-based index where to insert.</param>
			/// <param name="child">Source node to copy from.</param>
			/// <param name="copySubtree">If true, copies the entire subtree structure. If false, copies only the value.</param>
			/// <returns>The newly created node.</returns>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> InsertChildFrom(int index, TreeRecordNode<T> child, bool copySubtree = true) => this.InsertChildFrom(null, index, child, copySubtree);

			/// <summary>
			/// Adds a new child node with the specified value at the end of root level children.
			/// </summary>
			/// <param name="value">The value for the new node.</param>
			/// <returns>The newly created node.</returns>
			public TreeRecordNode<T> AddChild(T value) => this.AddChild(null, value);

			/// <summary>
			/// Adds a new child node copying the value and optionally the subtree from the provided node at the end of root level children.
			/// </summary>
			/// <param name="child">Source node to copy from.</param>
			/// <param name="copySubtree">If true, copies the entire subtree structure. If false, copies only the value.</param>
			/// <returns>The newly created node.</returns>
			public TreeRecordNode<T> AddChildFrom(TreeRecordNode<T> child, bool copySubtree = true) => this.AddChildFrom(null, child, copySubtree);

			/// <summary>
			/// Removes the child node at the specified index from root level.
			/// </summary>
			/// <param name="index">Zero-based index of the child to remove.</param>
			/// <returns>The removed node.</returns>
			/// <exception cref="ArgumentOutOfRangeException">If index is invalid.</exception>
			public TreeRecordNode<T> RemoveChildAt(int index) => this.RemoveChildAt(null, index);

			/// <summary>
			/// Moves a root-level child node to a new position, optionally creating a copy instead.
			/// </summary>
			/// <param name="srcIndex">Source index of the child to move.</param>
			/// <param name="destIndex">Destination index to move to.</param>
			/// <param name="copy">If true, creates a copy instead of moving.</param>
			/// <returns>The moved or copied node.</returns>
			/// <exception cref="ArgumentOutOfRangeException">If any index is invalid.</exception>
			public TreeRecordNode<T> MoveChild(int srcIndex, int destIndex, bool copy = false) => this.MoveChild(null, srcIndex, null, destIndex, copy);

			public void ApplyDelta<TSrc, TDest>(IReadOnlyCollection<TreeModInstruction<TSrc>> delta, Func<TSrc, T> mapValue, Func<TSrc, TDest, bool> equalsIdentity)
				where TDest : T
			{
				lock (this.sync)
				{
					this.EnsureState();
					Debug.Assert(this.buffer != null);
					foreach (var instruction in delta) _applyInstruction(this.buffer, instruction);
				}

				TreeRecordNode<T>? _applyInstruction(TreeRecord<T> buffer, TreeModInstruction<TSrc> deltaItem)
				{
					TreeRecordNode<T>? _findNodeByValue(TreeRecord<T> buffer, TSrc srcValue)
					{
						foreach (var node in buffer!.children)
						{
							var result = _findNodeRecursive(buffer, srcValue, node);
							if (result != null) return result;
						}
						return null;

						TreeRecordNode<T>? _findNodeRecursive(TreeRecord<T> buffer, TSrc srcValue, TreeRecordNode<T> node)
						{
							Debug.Assert(node.Value != null);
							if (equalsIdentity(srcValue, (TDest)node.Value)) return node;
							foreach (var child in node.children)
							{
								var result = _findNodeRecursive(buffer, srcValue, child);
								if (result != null) return result;
							}
							return null;
						}
					}

					switch (deltaItem.InstructionType)
					{
						case TreeModInstructionType.RootInsert:
							Debug.Assert(deltaItem.TargetNode != null);
							return this.InsertChildInternal(null, deltaItem.Index, mapValue(deltaItem.TargetNode.Value));

						case TreeModInstructionType.RootRemoveRecursive:
							return this.RemoveChildAtInternal(null, deltaItem.Index);

						case TreeModInstructionType.RootUpdate:
						case TreeModInstructionType.NonRootUpdate:
							Debug.Assert(deltaItem.TargetNode != null);
							this.UpdateChildInternal(null, deltaItem.Index, mapValue(deltaItem.TargetNode.Value));
							return null;

						case TreeModInstructionType.RootShift:
							Debug.Assert(deltaItem.Delta < 0);  // only backward moves allowed
							this.MoveChildInternal(null, deltaItem.Index, null, deltaItem.Index + deltaItem.Delta, false);
							return null;

						case TreeModInstructionType.RootUpdateShift:
							Debug.Assert(deltaItem.Delta < 0);  // only backward moves allowed
							Debug.Assert(deltaItem.TargetNode != null);
							this.UpdateChildInternal(null, deltaItem.Index, mapValue(deltaItem.TargetNode.Value));
							this.MoveChildInternal(null, deltaItem.Index, null, deltaItem.Index + deltaItem.Delta, false);
							return null;

						case TreeModInstructionType.NonRootInsert:
							Debug.Assert(deltaItem.TargetParent != null);
							Debug.Assert(deltaItem.TargetNode != null);
							var targetParent = _findNodeByValue(buffer, deltaItem.TargetParent.Value);
							Debug.Assert(targetParent != null);
							return this.InsertChildInternal(targetParent, deltaItem.Index, mapValue(deltaItem.TargetNode.Value));

						case TreeModInstructionType.NonRootRemoveRecursive:
							Debug.Assert(deltaItem.TargetParent != null);
							var removeParent = _findNodeByValue(buffer, deltaItem.TargetParent.Value);
							return this.RemoveChildAtInternal(removeParent, deltaItem.Index);

						case TreeModInstructionType.NonRootShift:
							Debug.Assert(deltaItem.TargetParent != null);
							var shiftParent = _findNodeByValue(buffer, deltaItem.TargetParent.Value);
							Debug.Assert(shiftParent != null);
							this.MoveChildInternal(shiftParent, deltaItem.Index, shiftParent, deltaItem.Index + deltaItem.Delta, false);
							return null;

						case TreeModInstructionType.NonRootUpdateShift:
							Debug.Assert(deltaItem.TargetParent != null);
							Debug.Assert(deltaItem.TargetNode != null);
							var updateShiftParent = _findNodeByValue(buffer, deltaItem.TargetParent.Value);
							Debug.Assert(updateShiftParent != null);
							this.UpdateChildInternal(updateShiftParent, deltaItem.Index, mapValue(deltaItem.TargetNode.Value));
							this.MoveChildInternal(updateShiftParent, deltaItem.Index, updateShiftParent, deltaItem.Index + deltaItem.Delta, false);
							return null;

						case TreeModInstructionType.NonRootRelocate:
							Debug.Assert(deltaItem.RelatedParent != null);
							Debug.Assert(deltaItem.TargetParent != null);
							var sourceParent = _findNodeByValue(buffer, deltaItem.RelatedParent.Value);
							Debug.Assert(sourceParent != null);
							var destParent = _findNodeByValue(buffer, deltaItem.TargetParent.Value);
							Debug.Assert(destParent != null);
							this.MoveChildInternal(sourceParent, deltaItem.Index, destParent, deltaItem.Delta, false);
							return null;

						case TreeModInstructionType.NonRootUpdateRelocate:
							Debug.Assert(deltaItem.RelatedParent != null);
							Debug.Assert(deltaItem.TargetParent != null);
							Debug.Assert(deltaItem.TargetNode != null);
							var updateSourceParent = _findNodeByValue(buffer, deltaItem.RelatedParent.Value);
							Debug.Assert(updateSourceParent != null);
							var updateDestParent = _findNodeByValue(buffer, deltaItem.TargetParent.Value);
							Debug.Assert(updateDestParent != null);
							this.UpdateChildInternal(updateSourceParent, deltaItem.Index, mapValue(deltaItem.TargetNode.Value));
							this.MoveChildInternal(updateSourceParent, deltaItem.Index, updateDestParent, deltaItem.Delta, false);
							return null;

						default:
							throw new NotImplementedException($"Unknown instruction type: {deltaItem.InstructionType}");
					}
				}
			}

			public async Task ApplyDeltaAsync<TSrc, TDest>(IReadOnlyCollection<TreeModInstruction<TSrc>> delta, Func<TSrc, Task<T>> mapValue, Func<TSrc, TDest, bool> equalsIdentity)
				where TSrc : notnull
				where TDest : T
			{
				var m = new Dictionary<TSrc, T>();
				foreach (var inst in delta)
				{
					Debug.Assert(inst.TargetNode != null);
					if (m.ContainsKey(inst.TargetNode.Value)) continue;
					m[inst.TargetNode.Value] = await mapValue(inst.TargetNode.Value);
				}

				this.ApplyDelta(delta, v => m[v], equalsIdentity);
			}


			#endregion

			#region LINQ - Typed

			public TreeRecord<T> Subtree(TreeRecordNode<T> parent)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Subtree(parent);
				}
			}

			public TreeRecord<T> Where(Func<TreeRecordNode<T>, bool> predicate, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Where(predicate, parent, traverse);
				}
			}

			public TreeRecord<T> Where(Func<TreeRecordNode<T>, int, bool> predicate, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Where(predicate, parent, traverse);
				}
			}

			public TreeRecord<T> OrderBy<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderBy(keySelector, parent, traverse);
				}
			}

			public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderBy(predicate, keySelector, parent, traverse);
				}
			}

			public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderBy(predicate, keySelector, parent, traverse);
				}
			}

			public TreeRecord<T> OrderBy<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderBy(keySelector, parent, comparer, traverse);
				}
			}

			public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderBy(predicate, keySelector, parent, comparer, traverse);
				}
			}

			public TreeRecord<T> OrderBy<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderBy(predicate, keySelector, parent, comparer, traverse);
				}
			}

			public TreeRecord<T> OrderByDescending<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderByDescending(keySelector, parent, traverse);
				}
			}

			public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderByDescending(predicate, keySelector, parent, traverse);
				}
			}

			public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderByDescending(predicate, keySelector, parent, traverse);
				}
			}

			public TreeRecord<T> OrderByDescending<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderByDescending(keySelector, parent, comparer, traverse);
				}
			}

			public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderByDescending(predicate, keySelector, parent, comparer, traverse);
				}
			}

			public TreeRecord<T> OrderByDescending<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, IComparer<TKey> comparer, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OrderByDescending(predicate, keySelector, parent, comparer, traverse);
				}
			}

			public TreeRecord<T> Distinct(TreeRecordNode<T>? parent, IEqualityComparer<T>? comparer = null, bool global = true, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Distinct(parent, comparer, global, traverse);
				}
			}

			public TreeRecord<T> Distinct(Func<TreeRecordNode<T>, bool> predicate, TreeRecordNode<T>? parent, IEqualityComparer<T>? comparer = null, bool global = true, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Distinct(predicate, parent, comparer, global, traverse);
				}
			}

			public TreeRecord<T> Distinct(Func<TreeRecordNode<T>, int, bool> predicate, TreeRecordNode<T>? parent, IEqualityComparer<T>? comparer = null, bool global = true, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Distinct(predicate, parent, comparer, global, traverse);
				}
			}

			public TreeRecord<T> DistinctBy<TKey>(Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool global = true, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.DistinctBy(keySelector, parent, global, traverse);
				}
			}

			public TreeRecord<T> DistinctBy<TKey>(Func<TreeRecordNode<T>, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool global = true, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.DistinctBy(predicate, keySelector, parent, global, traverse);
				}
			}

			public TreeRecord<T> DistinctBy<TKey>(Func<TreeRecordNode<T>, int, bool> predicate, Func<T, TKey> keySelector, TreeRecordNode<T>? parent, bool global = true, bool traverse = true)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.DistinctBy(predicate, keySelector, parent, global, traverse);
				}
			}

			public TreeRecord<TResult> Select<TResult>(Func<TreeRecordNode<T>, TResult> selector)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Select(selector);
				}
			}

			public TreeRecord<TResult> Select<TResult>(Func<TreeRecordNode<T>, int, TResult> selector)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Select(selector);
				}
			}

			public TreeRecord<TResult> OfType<TResult>()
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.OfType<TResult>();
				}
			}

			public TreeRecord<TResult> Cast<TResult>()
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.Cast<TResult>();
				}
			}

			#endregion

			#region Traversal

			public void TraversePreOrder(Action<TreeRecordNode<T>> action)
			{
				lock (this.sync)
				{
					this.EnsureState();
					this.buffer!.TraversePreOrder(action);
				}
			}

			public void TraversePostOrder(Action<TreeRecordNode<T>> action)
			{
				lock (this.sync)
				{
					this.EnsureState();
					this.buffer!.TraversePostOrder(action);
				}
			}

			public void TraverseLevelOrder(Action<TreeRecordNode<T>, int> action)
			{
				lock (this.sync)
				{
					this.EnsureState();
					this.buffer!.TraverseLevelOrder(action);
				}
			}

			#endregion

			#region Private

			void EnsureState()
			{
				this.buffer ??= this.source == null ? new() : (TreeRecord<T>)this.source.Clone();
				if (this.map == null)
				{
					this.map = this.source == null ? new() : new((int)1.5 * this.source.count);
					this.buffer.TraversePreOrder(n => this.map.Add(n));
				}
			}

			void CopyNodeSubtree(TreeRecordNode<T> dest, TreeRecordNode<T> src)
			{
				Debug.Assert(this.map != null);
				Debug.Assert(this.buffer != null);

				for (int length = src.children.Count, i = 0; i < length; ++i) dest.children.Add(_cloneNode(src.children[i], dest, this.map));

				TreeRecordNode<T> _cloneNode(TreeRecordNode<T> child, TreeRecordNode<T> parent, HashSet<TreeRecordNode<T>> map)
				{
					var node = TreeRecordNode<T>.pool.Hold(this.buffer, parent, child.SiblingIndex, child.Value);
					if (!map.Add(node)) Debug.Fail("!this.map.Add(node)");
					for (int length = child.children.Count, i = 0; i < length; ++i) node.children.Add(_cloneNode(child.children[i], node, map));
					return node;
				}
			}

			void RemoveNodeSubtree(TreeRecordNode<T> node)
			{
				Debug.Assert(this.map != null);

				for (int length = node.children.Count, i = 0; i < length; ++i) _removeNode(node.children[i], this.map);

				void _removeNode(TreeRecordNode<T> node, HashSet<TreeRecordNode<T>> map)
				{
					if (!map.Remove(node)) Debug.Fail("!map.Remove(parent)");
					for (int length = node.children.Count, i = 0; i < length; ++i) _removeNode(node.children[i], map);
				}
			}

			int GetSubtreeMaxDepth(TreeRecordNode<T> node)
			{
				if (node.IsLeaf) return node.Depth;
				var result = 0;
				for (int length = node.children.Count, i = 0; i < length; ++i) result = Math.Max(result, this.GetSubtreeMaxDepth(node.children[i]));
				return result;
			}

			int GetTreeMaxDepth()
			{
				Debug.Assert(this.buffer != null);

				var result = 0;
				for (int length = this.buffer.children.Count, i = 0; i < length; ++i) result = Math.Max(result, this.GetSubtreeMaxDepth(this.buffer.children[i]));
				return result;
			}

			#endregion

			#region Public

			public void Clear()
			{
				lock (this.sync)
				{
					this.EnsureState();

					Debug.Assert(this.buffer != null);
					Debug.Assert(this.map != null);

					this.buffer.children.Clear();
					this.buffer.count = 0;
					this.buffer.height = 0;
					this.map.Clear();
				}
			}

			public bool Contains(TreeRecordNode<T> item)
			{
				lock (this.sync)
				{
					return this.map?.Contains(item) ?? false;
				}
			}

			public TreeRecord<T> ToTreeRecord()
			{
				lock (this.sync)
				{
					if (this.buffer == null)
					{
						if (this.source == null) return Empty;
						return this.source;
					}
					else
					{
						this.map?.Clear();
						this.source = this.buffer;
						this.buffer = null;
					}
					return this.source;
				}
			}

			public ListRecord<TreeRecordNode<T>> ToNodeList(TraverseOrder traverseOrder)
			{
				lock (this.sync)
				{
					this.EnsureState();
					return this.buffer!.ToNodeList(traverseOrder);
				}
			}

			public IReadOnlyList<TreeRecordNode<T>> Children
			{
				get
				{
					lock (this.sync)
					{
						this.EnsureState();
						return this.buffer!.children;
					}
				}
			}

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			public bool IsEmpty
			{
				get
				{
					lock (this.sync)
					{
						this.EnsureState();
						return this.buffer!.IsEmpty;
					}
				}
			}

			public int Count
			{
				get
				{
					lock (this.sync)
					{
						return this.buffer?.Count ?? 0;
					}
				}
			}

			public int Height
			{
				get
				{
					lock (this.sync)
					{
						return this.buffer?.Height ?? 0;
					}
				}
			}

			#endregion

			internal TreeRecord<T>? buffer = null;
			TreeRecord<T>? source = null;
			HashSet<TreeRecordNode<T>>? map = null;

			[DebuggerBrowsable(DebuggerBrowsableState.Never)]
			readonly object sync = new();
		}

		#endregion
	}

	#endregion

	#region TreeRecordBuilderDebugView<T>

	internal sealed class TreeRecordBuilderDebugView<T>
	{
		public TreeRecordBuilderDebugView(TreeRecord<T>.Builder builder)
		{
			this.builder = builder;
		}

		[DebuggerBrowsable(DebuggerBrowsableState.RootHidden)]
		public TreeRecordNode<T>[] Children => [.. this.builder.Children];

		readonly TreeRecord<T>.Builder builder;
	}

	#endregion
}
