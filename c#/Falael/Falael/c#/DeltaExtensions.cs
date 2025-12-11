using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Json.Serialization;
using System.Diagnostics;
using System.Reflection;

using System.Collections;
using System.Collections.Immutable;
using System.Collections.Frozen;

namespace Falael
{
	#region ModInstruction

	public enum ModInstructionSpecialization
	{
		Object,
		HashSet,
		Dictionary,
		List,
		Tree
	}

	public abstract class ModInstruction
	{
		public ModInstruction(ModInstructionSpecialization modInstructionSpecialization)
		{
			this.ModInstructionSpecialization = modInstructionSpecialization;
		}

		public abstract object? LeftObject { get; protected set; }

		public abstract object? RightObject { get; protected set; }

		public ModInstructionSpecialization ModInstructionSpecialization { get; }
	}

	#endregion

	#region Object

	/// <summary>
	/// Defines the types of modifications that can be performed on object properties/fields.
	/// </summary>
	public enum ObjectModInstructionType
	{
		UpdateProperty,  // Indicates a change to a property value
		UpdateField,     // Indicates a change to a field value
	}

	/// <summary>
	/// Represents a modification instruction for object properties or fields.
	/// Used to track and apply changes between two objects of the same type.
	/// </summary>
	/// <typeparam name="T">The type of objects being compared</typeparam>
	public class ObjectModInstruction<T> : ModInstruction
	{
		public ObjectModInstruction() : base(ModInstructionSpecialization.Object) { }

		private object? leftObject;
		private object? rightObject;

		public override object? LeftObject
		{
			get => this.leftObject;
			protected set => this.leftObject = value;
		}

		public override object? RightObject
		{
			get => this.rightObject;
			protected set => this.rightObject = value;
		}

		/// <summary>
		/// The type of modification being performed (property or field update)
		/// </summary>
		public ObjectModInstructionType InstructionType { get; set; }

		/// <summary>
		/// The original object being compared from
		/// </summary>
		public T Left
		{
			get => (T)this.LeftObject!;
			set => this.LeftObject = value;
		}

		/// <summary>
		/// The target object being compared to
		/// </summary>
		public T Right
		{
			get => (T)this.RightObject!;
			set => this.RightObject = value;
		}

		/// <summary>
		/// Name of the property or field being modified
		/// Used to identify which member is being changed
		/// </summary>
		public required string MemberName { get; set; }

		/// <summary>
		/// Reference to the PropertyInfo if this is a property update
		/// Null if this is a field update
		/// Used for reflection-based access to the property
		/// </summary>
		public PropertyInfo? Property { get; set; }

		/// <summary>
		/// Reference to the FieldInfo if this is a field update
		/// Null if this is a property update
		/// Used for reflection-based access to the field
		/// </summary>
		public FieldInfo? Field { get; set; }

		/// <summary>
		/// The new value that will be assigned to the property/field.
		/// Represents the target state after the modification.
		/// </summary>
		public object? TargetValue { get; set; }

		/// <summary>
		/// The old value that was previously in the property/field.
		/// </summary>
		public object? RelatedValue { get; set; }

		public override string ToString() => $"{this.InstructionType} {this.MemberName} {this.TargetValue}";
	}

	#endregion

	#region HashSet

	/// <summary>
	/// Defines the types of modifications that can be performed on a HashSet.
	/// </summary>
	public enum HashSetModInstructionType
	{
		Add,     // Add new element to the set
		Remove,  // Remove existing element from the set
		Update   // Update existing element (same identity, different value) - might happen if the equality comparer for the sets is different from the default equality comparer of `T` (for ex. `HashSetRecord<T>` where `T` implements `IIdentity<T>`) - in such case same identity might carry different values, and the new value must be updated on the target hash set
	}

	/// <summary>
	/// Represents a modification instruction for HashSet operations.
	/// Used to track and apply changes between two sets.
	/// </summary>
	/// <typeparam name="T">The type of elements in the sets</typeparam>
	public class HashSetModInstruction<T> : ModInstruction
	{
		public HashSetModInstruction() : base(ModInstructionSpecialization.HashSet) { }

		private object? leftObject;
		private object? rightObject;

		public override object? LeftObject
		{
			get => this.leftObject;
			protected set => this.leftObject = value;
		}

		public override object? RightObject
		{
			get => this.rightObject;
			protected set => this.rightObject = value;
		}

		/// <summary>
		/// The type of set operation being performed (Add/Remove/Update)
		/// </summary>
		public HashSetModInstructionType InstructionType { get; set; }

		/// <summary>
		/// The original set being compared from
		/// </summary>
		public IReadOnlySet<T> Left
		{
			get => (IReadOnlySet<T>)this.LeftObject!;
			set => this.LeftObject = value;
		}

		/// <summary>
		/// The target set being compared to
		/// </summary>
		public IReadOnlySet<T> Right
		{
			get => (IReadOnlySet<T>)this.RightObject!;
			set => this.RightObject = value;
		}

		/// <summary>
		/// For Add: The new element being added
		/// For Remove: The element being removed
		/// For Update: The new version of the element with updated values
		/// </summary>
		public required T TargetElement { get; set; }

		/// <summary>
		/// For Update operations: Contains the old version of the element before the update
		/// For Add/Remove: Null
		/// Used to track the original state when updating elements
		/// </summary>
		public T? RelatedElement { get; set; }

		public override string ToString() => $"{this.InstructionType} {this.TargetElement}";
	}

	#endregion

	#region Dictionary

	/// <summary>
	/// Defines the types of modifications that can be performed on a Dictionary.
	/// </summary>
	public enum DictionaryModInstructionType
	{
		Add,     // Add new key-value pair
		Remove,  // Remove existing key-value pair
		Update   // Update value for existing key
	}

	/// <summary>
	/// Represents a modification instruction for Dictionary operations.
	/// Used to track and apply changes between two dictionaries.
	/// </summary>
	/// <typeparam name="TKey">The type of keys in the dictionary</typeparam>
	/// <typeparam name="TValue">The type of values in the dictionary</typeparam>
	public class DictionaryModInstruction<TKey, TValue> : ModInstruction where TKey : notnull
	{
		public DictionaryModInstruction() : base(ModInstructionSpecialization.Dictionary) { }

		private object? leftObject;
		private object? rightObject;

		public override object? LeftObject
		{
			get => this.leftObject;
			protected set => this.leftObject = value;
		}

		public override object? RightObject
		{
			get => this.rightObject;
			protected set => this.rightObject = value;
		}

		/// <summary>
		/// The type of dictionary operation being performed: Add, Remove, Update
		/// </summary>
		public DictionaryModInstructionType InstructionType { get; set; }

		/// <summary>
		/// The original dictionary being compared from
		/// </summary>
		public IReadOnlyDictionary<TKey, TValue> Left
		{
			get => (IReadOnlyDictionary<TKey, TValue>)this.LeftObject!;
			set => this.LeftObject = value;
		}

		/// <summary>
		/// The target dictionary being compared to
		/// </summary>
		public IReadOnlyDictionary<TKey, TValue> Right
		{
			get => (IReadOnlyDictionary<TKey, TValue>)this.RightObject!;
			set => this.RightObject = value;
		}

		/// <summary>
		/// The dictionary key being operated on
		/// For all operations: Identifies the key where the change is happening
		/// </summary>
		public required TKey Key { get; set; }

		/// <summary>
		/// For Add: The new value being added
		/// For Remove: The value being removed (for reference)
		/// For Update: The new value replacing the old one
		/// </summary>
		public required TValue TargetValue { get; set; }

		/// <summary>
		/// For Update: Contains the old value before the update
		/// For Add/Remove: Null
		/// Used to track the original value when updating entries
		/// </summary>
		public TValue? RelatedValue { get; set; }

		public override string ToString() => $"{this.InstructionType} {this.Key} {this.TargetValue}";
	}

	#endregion

	#region List

	/// <summary>
	/// Defines the types of modifications that can be performed on a List.
	/// </summary>
	public enum ListModInstructionType
	{
		Insert,     // Insert a new element at a specific position
		Remove,     // Remove an element at a specific position
		Update,     // Update an element in place
		Move,       // Move an element to a new position
		UpdateMove, // Move an element to a new position and update its value
	}

	/// <summary>
	/// Represents a modification instruction for List operations.
	/// Used to track and apply changes between two lists.
	/// </summary>
	/// <typeparam name="T">The type of elements in the list</typeparam>
	public class ListModInstruction<T> : ModInstruction
	{
		public ListModInstruction() : base(ModInstructionSpecialization.List) { }

		private object? leftObject;
		private object? rightObject;

		public override object? LeftObject
		{
			get => this.leftObject;
			protected set => this.leftObject = value;
		}

		public override object? RightObject
		{
			get => this.rightObject;
			protected set => this.rightObject = value;
		}

		/// <summary>
		/// The type of list operation being performed: Insert, Remove, Remove, Move, UpdateMove
		/// </summary>
		public ListModInstructionType InstructionType { get; set; }

		/// <summary>
		/// The original list being compared from
		/// </summary>
		public IReadOnlyList<T> Left
		{
			get => (IReadOnlyList<T>)this.LeftObject!;
			set => this.LeftObject = value;
		}

		/// <summary>
		/// The target list being compared to
		/// </summary>
		public IReadOnlyList<T> Right
		{
			get => (IReadOnlyList<T>)this.RightObject!;
			set => this.RightObject = value;
		}

		/// <summary>
		/// For Insert: Target insertion position
		/// For Remove: Position to remove from
		/// For Update: Position to update
		/// For Move/UpdateMove: Source position of the element being moved
		/// </summary>
		public int Index { get; set; }

		/// <summary>
		/// For Move/UpdateMove: Negative offset indicating how many positions backward to move
		/// For Insert/Remove: null
		/// </summary>
		public int Delta { get; set; }

		/// <summary>
		/// For Insert: The new element being inserted
		/// For Remove: The element being removed (for debug info)
		/// For Update: The new value
		/// For Move: The element being moved
		/// For UpdateMove: The new value of the moved element
		/// </summary>
		public required T TargetElement { get; set; }

		/// <summary>
		/// For Update/UpdateMove: Contains the old value before the update
		/// For other operations: Null
		/// Used to track the original value when updating elements
		/// </summary>
		public T? RelatedElement { get; set; }

		public override string ToString()
		{
			switch (this.InstructionType)
			{
				case ListModInstructionType.Insert:
				case ListModInstructionType.Remove:
				case ListModInstructionType.Update:
					return $"{this.InstructionType} {this.Index} {this.TargetElement}";
				case ListModInstructionType.Move:
					return $"{this.InstructionType} {this.Index} {this.Delta} {this.TargetElement}";
				case ListModInstructionType.UpdateMove:
					return $"{this.InstructionType} {this.Index} {this.Delta} {this.TargetElement} {this.RelatedElement}";
				default: return "Not implemented.";
			}
		}
	}

	#endregion

	#region Tree

	/// <summary>
	/// Defines the types of modifications that can be performed on a Tree structure.
	/// Each type represents a specific operation that can be performed on either root or non-root nodes.
	/// </summary>
	public enum TreeModInstructionType
	{
		RootInsert,             // Insert new root node at specific index
		RootRemoveRecursive,    // Remove root node and its subtree 
		RootUpdate,             // Update root node value only
		RootShift,              // Move root node position
		RootUpdateShift,        // Move root node position and update value
		NonRootInsert,          // Insert new node under parent
		NonRootRemoveRecursive, // Remove node and its subtree
		NonRootUpdate,          // Update node value
		NonRootShift,           // Move within same parent 
		NonRootUpdateShift,     // Move within same parent and update
		NonRootRelocate,        // Change parent
		NonRootUpdateRelocate   // Change parent and update
	}

	/// <summary>
	/// Represents a modification instruction for Tree operations.
	/// Used to track and apply changes between two trees, handling both structure and value modifications.
	/// </summary>
	/// <typeparam name="T">The type of values stored in tree nodes</typeparam>
	public class TreeModInstruction<T> : ModInstruction
	{
		public TreeModInstruction() : base(ModInstructionSpecialization.Tree) { }

		private object? leftObject;
		private object? rightObject;

		public override object? LeftObject
		{
			get => this.leftObject;
			protected set => this.leftObject = value;
		}

		public override object? RightObject
		{
			get => this.rightObject;
			protected set => this.rightObject = value;
		}

		/// <summary>
		/// The specific tree operation to perform
		/// </summary>
		public TreeModInstructionType InstructionType { get; set; }

		/// <summary>
		/// The original tree being compared from.
		/// Used as source state for all operations.
		/// </summary> 
		public TreeRecord<T> Left
		{
			get => (TreeRecord<T>)this.LeftObject!;
			set => this.LeftObject = value;
		}

		/// <summary>
		/// The target tree being compared to.
		/// Used as target state for all operations.
		/// </summary>
		public TreeRecord<T> Right
		{
			get => (TreeRecord<T>)this.RightObject!;
			set => this.RightObject = value;
		}

		/// <summary>
		/// Position index used in all operations:
		/// 
		/// - RootInsert: Target insertion index in root collection
		/// - RootRemoveRecursive: Index of root node to remove
		/// - RootUpdate: Index of root node to update
		/// - RootShift: Source index of root node to move
		/// - RootUpdateShift: Source index of root node to move and update
		/// - NonRootInsert: Target index in parent's children collection
		/// - NonRootRemoveRecursive: Index of node to remove in parent's children
		/// - NonRootUpdate: Index of node to update in parent's children
		/// - NonRootShift: Source index in parent's children for move
		/// - NonRootUpdateShift: Source index in parent's children for move and update
		/// - NonRootRelocate: Source index in original parent's children
		/// - NonRootUpdateRelocate: Source index in original parent's children
		/// 
		/// </summary>
		public int Index { get; set; }

		/// <summary>
		/// Position offset used in moving operations:
		/// 
		/// - RootShift: Negative offset for root position change
		/// - RootUpdateShift: Negative offset for root position change
		/// - NonRootShift: Negative offset in same parent's children
		/// - NonRootUpdateShift: Negative offset in same parent's children
		/// - NonRootRelocate: Target position in new parent's children
		/// - NonRootUpdateRelocate: Target position in new parent's children
		/// 
		/// - RootInsert, RootRemoveRecursive, RootUpdate, NonRootInsert, NonRootRemoveRecursive, NonRootUpdate: null
		/// 
		/// </summary>
		public int Delta { get; set; }

		/// <summary>
		/// Parent node from the Left tree, used in relocate operations:
		/// 
		/// - NonRootRelocate: Parent node from Left tree that the node is being moved from
		/// - NonRootUpdateRelocate: Parent node from Left tree that the node is being moved from
		/// 
		/// - RootInsert, RootRemoveRecursive, RootUpdate, RootShift, RootUpdateShift, NonRootInsert, NonRootRemoveRecursive, NonRootUpdate, NonRootShift, NonRootUpdateShift: null
		/// 
		/// </summary>
		public TreeRecordNode<T>? RelatedParent { get; set; }

		/// <summary>
		/// Node from the Left tree that is being modified:
		/// 
		/// - RootUpdate: Left tree's root node that is being updated (compared with TargetNode's new value)
		/// - RootUpdateShift: Left tree's root node that is being updated and moved (compared with TargetNode's new value)
		/// - NonRootUpdate: Left tree's node that is being updated (compared with TargetNode's new value)
		/// - NonRootUpdateShift: Left tree's node that is being updated and moved within same parent (compared with TargetNode's new value)
		/// - NonRootUpdateRelocate: Left tree's node that is being updated and moved to a different parent
		/// 
		/// - RootInsert, RootRemoveRecursive, NonRootInsert, NonRootRemoveRecursive, RootShift, NonRootShift, NonRootRelocate: null
		/// 
		/// For update operations, RelatedNode contains the original node being updated, allowing comparison or reference
		/// For move operations without updates, RelatedNode is null as only the positional change matters
		/// 
		/// </summary>
		public TreeRecordNode<T>? RelatedNode { get; set; }

		/// <summary>
		/// Parent node for non-root operations (from Right tree, except for remove operation):
		/// 
		/// - NonRootInsert: Parent node from Left tree to insert new node under
		/// - NonRootRemoveRecursive: Parent node from Left tree containing node to remove
		/// - NonRootUpdate: Parent node from Left tree where node should be updated
		/// - NonRootShift: Parent node from Left tree where move occurs
		/// - NonRootUpdateShift: Parent node from Left tree where move occurs
		/// - NonRootRelocate: Parent node from Left tree to move node to
		/// - NonRootUpdateRelocate: Parent node from Left tree to move node to
		///
		/// - RootInsert, RootRemoveRecursive, RootUpdate, RootShift, RootUpdateShift: null
		/// 
		/// </summary>
		public TreeRecordNode<T>? TargetParent { get; set; }

		/// <summary>
		/// Node from the Right tree (**Left tree** for remove ops) that specifies what node to create/move/update to:
		/// 
		/// - RootInsert: Node from Right tree containing the value to use for the new root node
		/// - RootRemoveRecursive: Node from **Left tree** at Index being removed (for reference)
		/// - RootUpdate: Node from Right tree containing the new value to apply to the root node at Index
		/// - RootShift: Node from Right tree that matches the root node at Index being moved (for reference)
		/// - RootUpdateShift: Node from Right tree containing the new value to apply to the root node at Index being moved
		/// - NonRootInsert: Node from Right tree containing the value to use for new node under TargetParent
		/// - NonRootRemoveRecursive: Node from **Left tree** at Index under TargetParent being removed (for reference)
		/// - NonRootUpdate: Node from Right tree containing new value to apply to the node at Index under TargetParent
		/// - NonRootShift: Node from Right tree that matches the node at Index under TargetParent being moved (for reference)
		/// - NonRootUpdateShift: Node from Right tree containing the new value to apply to the node at Index under TargetParent being moved 
		/// - NonRootRelocate: Node from Right tree that matches the node at Index under RelatedParent being moved to TargetParent (for reference)
		/// - NonRootUpdateRelocate: Node from Right tree containing the new value to apply to the node at Index under RelatedParent being moved to TargetParent
		/// 
		/// For all operations except removals, TargetNode comes from Right tree and represents the desired final state
		/// For update operations, TargetNode provides the new value while RelatedNode (from Left tree) holds the original value
		/// For non-update operations, TargetNode only serves as reference - actual positions are specified by Index and Delta
		/// For remove operations, TargetNode contains the node from **Left tree** being removed
		/// </summary>
		public TreeRecordNode<T>? TargetNode { get; set; }

		public override string ToString()
		{
			switch (this.InstructionType)
			{
				case TreeModInstructionType.RootInsert:
					return $"{this.InstructionType} {this.Index} RT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.RootRemoveRecursive:
					return $"{this.InstructionType} {this.Index} LT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.RootUpdate:
					return $"{this.InstructionType} {this.Index} RT({this.TargetNode?.Value?.ToString()}) LT({this.RelatedNode?.Value?.ToString()})";
				case TreeModInstructionType.RootShift:
					return $"{this.InstructionType} {this.Index} {this.Delta} RT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.RootUpdateShift:
					return $"{this.InstructionType} {this.Index} {this.Delta} RT({this.TargetNode?.Value?.ToString()}) LT({this.RelatedNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootInsert:
					return $"{this.InstructionType} {this.Index} LT({this.TargetParent?.Value?.ToString()}) RT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootRemoveRecursive:
					return $"{this.InstructionType} {this.Index} LT({this.TargetParent?.Value?.ToString()}) LT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootUpdate:
					return $"{this.InstructionType} {this.Index} LT({this.TargetParent?.Value?.ToString()}) RT({this.TargetNode?.Value?.ToString()}) LT({this.RelatedNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootShift:
					return $"{this.InstructionType} {this.Index} {this.Delta} LT({this.TargetParent?.Value?.ToString()}) RT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootUpdateShift:
					return $"{this.InstructionType} {this.Index} {this.Delta} LT({this.TargetParent?.Value?.ToString()}) RT({this.TargetNode?.Value?.ToString()}) LT({this.RelatedNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootRelocate:
					return $"{this.InstructionType} {this.Index} {this.Delta} LT({this.RelatedParent?.Value?.ToString()}) LT({this.TargetParent?.Value?.ToString()}) RT({this.TargetNode?.Value?.ToString()})";
				case TreeModInstructionType.NonRootUpdateRelocate:
					return $"{this.InstructionType} {this.Index} {this.Delta} LT({this.RelatedParent?.Value?.ToString()}) LT({this.TargetParent?.Value?.ToString()}) RT({this.TargetNode?.Value?.ToString()}) LT({this.RelatedNode?.Value?.ToString()})";
				default: return "Not implemented.";
			}
		}
	}

	#endregion

	#region DeltaExtensions

	public static class DeltaExtensions
	{
		#region DeepDiff

		#region DeepDiffContext

		public class DeepDiffContext
		{
			public static readonly DeepDiffContext Empty = new();

			public DeepDiffContext(DictionaryRecord<Type, (object KeyComparer, object? ValueComparer)> value)
			{
				this.comparers = value;
			}

			public DeepDiffContext()
			{
				this.comparers = [];
			}

			public DeepDiffContext WithKeyComparer<T>(IEqualityComparer<T> comparer)
			{
				return new(this.comparers.WithEnsureItem(typeof(T), (comparer, null)));
			}

			public DeepDiffContext WithComparers<TKey, TValue>(IEqualityComparer<TKey> keyComparer, IEqualityComparer<TValue> valueComparer)
			{
				return new(this.comparers.WithEnsureItems(
				[
					new(typeof(TKey), (keyComparer, valueComparer)), 
					new(typeof(TValue), (keyComparer, valueComparer))
				]));
			}

			public IEqualityComparer<T>? GetKeyComparer<T>() => this.comparers.TryGetValue(typeof(T), out var comparers) ? (IEqualityComparer<T>)comparers.KeyComparer : null;

			public IEqualityComparer<T>? GetValueComparer<T>() => this.comparers.TryGetValue(typeof(T), out var comparers) && comparers.ValueComparer != null ? (IEqualityComparer<T>)comparers.ValueComparer : null;

			public DictionaryRecord<Type, object>? GetValueComparers()
			{
				var result = this.comparers
					.Where(kvp => kvp.Value.ValueComparer != null)
					.Select(kvp => new KeyValuePair<Type, object>(kvp.Key, kvp.Value.ValueComparer!));
				if (result.Count() == 0) return null;
				return new(result);
			}

			DictionaryRecord<Type, (object KeyComparer, object? ValueComparer)> comparers;

		}

		#endregion

		public static TreeRecord<ModInstruction> DeepDiffTree<T>(this TreeRecord<T> left, TreeRecord<T> right, DeepDiffContext? context = null) where T : notnull
		{
			var builder = new TreeRecord<ModInstruction>.Builder();
			DeepDiffTreeRecord(builder, null, left, right, [], context ?? DeepDiffContext.Empty);
			return builder.ToTreeRecord();
		}

		public static TreeRecord<ModInstruction> DeepDiffHashSet<T>(this IReadOnlySet<T> left, IReadOnlySet<T> right, DeepDiffContext? context = null)
		{
			var builder = new TreeRecord<ModInstruction>.Builder();
			DeepDiffSet(builder, null, left, right, [], context ?? DeepDiffContext.Empty);
			return builder.ToTreeRecord();
		}

		public static TreeRecord<ModInstruction> DeepDiffDictionary<TKey, TValue>(this IReadOnlyDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, DeepDiffContext? context = null) where TKey : notnull
		{
			var builder = new TreeRecord<ModInstruction>.Builder();
			DeepDiffDictionary(builder, null, left, right, [], context ?? DeepDiffContext.Empty);
			return builder.ToTreeRecord();
		}

		public static TreeRecord<ModInstruction> DeepDiffList<T>(this IReadOnlyList<T> left, IReadOnlyList<T> right, DeepDiffContext? context = null)
		{
			var builder = new TreeRecord<ModInstruction>.Builder();
			DeepDiffList(builder, null, left, right, [], context ?? DeepDiffContext.Empty);
			return builder.ToTreeRecord();
		}

		public static TreeRecord<ModInstruction> DeepDiffObject<T>(this T left, T right, DeepDiffContext? context = null)
		{
			var builder = new TreeRecord<ModInstruction>.Builder();
			DeepDiffObject(builder, null, left, right, [], context ?? DeepDiffContext.Empty);
			return builder.ToTreeRecord();
		}

		internal static void ProcessNestedProp(TreeRecord<ModInstruction>.Builder builder, TreeRecordNode<ModInstruction>? node, object oldValue, object newValue, Stack<object?> path, DeepDiffContext context)
		{
			string methodName;
			Type leftRightType;

			var oldValueType = oldValue.GetType();
			var newValueType = newValue.GetType();

			if (ImplementsInterface(oldValueType, typeof(IReadOnlySet<>)) && ImplementsInterface(newValueType, typeof(IReadOnlySet<>)))
			{
				methodName = nameof(DeepDiffSet);
				leftRightType = GetGenericInterfaceType(oldValueType, typeof(IReadOnlySet<>));
			}
			else if (ImplementsInterface(oldValueType, typeof(IReadOnlyList<>)) && ImplementsInterface(newValueType, typeof(IReadOnlyList<>)))
			{
				methodName = nameof(DeepDiffList);
				leftRightType = GetGenericInterfaceType(oldValueType, typeof(IReadOnlyList<>));
			}
			else if (ImplementsInterface(oldValueType, typeof(IReadOnlyDictionary<,>)) && ImplementsInterface(newValueType, typeof(IReadOnlyDictionary<,>)))
			{
				methodName = nameof(DeepDiffDictionary);
				leftRightType = GetGenericInterfaceType(oldValueType, typeof(IReadOnlyDictionary<,>));
			}
			else if (oldValueType.IsGenericType && oldValueType.GetGenericTypeDefinition() == typeof(TreeRecord<>))
			{
				methodName = nameof(DeepDiffTreeRecord);
				leftRightType = oldValueType;
			}
			else if (!oldValueType.IsPrimitive && !oldValueType.IsEnum && oldValueType != typeof(string))
			{
				methodName = nameof(DeepDiffObject);
				leftRightType = oldValueType;
			}
			else return;

			var methodInfo = typeof(DeltaExtensions).GetMethod(methodName, BindingFlags.Static | BindingFlags.NonPublic);
			Debug.Assert(methodInfo != null);

			if (leftRightType.IsGenericType && leftRightType.GetGenericTypeDefinition() == typeof(IReadOnlyDictionary<,>))
			{
				var genericArgs = leftRightType.GetGenericArguments();
				methodInfo = methodInfo.MakeGenericMethod(genericArgs[0], genericArgs[1]);
			}
			else
			{
				var genericArg = leftRightType.GetGenericArguments().FirstOrDefault() ?? leftRightType;
				methodInfo = methodInfo.MakeGenericMethod(genericArg);
			}
			Debug.Assert(methodInfo != null);

			methodInfo.Invoke(null, [ builder, node, oldValue, newValue, path, context ]);

			static bool ImplementsInterface(Type type, Type interfaceType)
			{
				return type.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == interfaceType);
			}

			static Type GetGenericInterfaceType(Type type, Type interfaceType)
			{
				return type.GetInterfaces().First(i => i.IsGenericType && i.GetGenericTypeDefinition() == interfaceType);
			}
		}

		internal static void DeepDiffTreeRecord<T>(TreeRecord<ModInstruction>.Builder builder, TreeRecordNode<ModInstruction>? parent, TreeRecord<T> left, TreeRecord<T> right, Stack<object?> path, DeepDiffContext context) where T : notnull
		{
			if (path.Contains(left)) return;

			// Only track objects that could form circles
			var elementType = typeof(T);
			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Push(left);

			DiffTree(left, right, _handleInstruction, context.GetKeyComparer<T>(), context.GetValueComparer<T>());

			void _handleInstruction(TreeModInstruction<T> instruction)
			{
				var node = builder.AddChild(parent, instruction);

				if (instruction.InstructionType != TreeModInstructionType.RootUpdate &&
					instruction.InstructionType != TreeModInstructionType.NonRootUpdate &&
					instruction.InstructionType != TreeModInstructionType.RootUpdateShift &&
					instruction.InstructionType != TreeModInstructionType.NonRootUpdateShift &&
					instruction.InstructionType != TreeModInstructionType.NonRootUpdateRelocate) return;

				Debug.Assert(instruction.RelatedNode != null);
				Debug.Assert(instruction.TargetNode != null);

				var oldValue = instruction.RelatedNode.Value;
				var newValue = instruction.TargetNode.Value;
				if (oldValue == null || newValue == null) return;

				ProcessNestedProp(builder, node, oldValue, newValue, path, context);
			}

			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Pop();
		}

		internal static void DeepDiffSet<T>(TreeRecord<ModInstruction>.Builder builder,	TreeRecordNode<ModInstruction>? parent, IReadOnlySet<T> left, IReadOnlySet<T> right, Stack<object?> path, DeepDiffContext context)
		{
			if (path.Contains(left)) return;

			// Only track objects that could form circles 
			var elementType = typeof(T);
			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Push(left);

			void handleInstruction(HashSetModInstruction<T> instruction)
			{
				var node = builder.AddChild(parent, instruction);

				if (instruction.InstructionType != HashSetModInstructionType.Update) return;

				var oldValue = instruction.RelatedElement;
				var newValue = instruction.TargetElement;
				if (oldValue == null || newValue == null) return;

				ProcessNestedProp(builder, node, oldValue, newValue, path, context);
			}

			switch (left)
			{
				case HashSetRecord<T> hashSetRecord:
					DiffHashSet(hashSetRecord, right, handleInstruction);
					break;
				case HashSet<T> hashSet:
					DiffHashSet(hashSet, right, handleInstruction);
					break;
				case ImmutableHashSet<T> immutableHashSet:
					DiffHashSet(immutableHashSet, right, handleInstruction);
					break;
				case FrozenSet<T> frozenSet:
					DiffHashSet(frozenSet, right, handleInstruction);
					break;
				default:
					DiffHashSet(left, right, handleInstruction, context.GetKeyComparer<T>());
					break;
			}

			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Pop();
		}

		internal static void DeepDiffDictionary<TKey, TValue>(TreeRecord<ModInstruction>.Builder builder, TreeRecordNode<ModInstruction>? parent, IReadOnlyDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Stack<object?> path, DeepDiffContext context) where TKey : notnull
		{
			if (path.Contains(left)) return;

			// Only track objects that could form circles
			var elementType = typeof(TValue);
			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Push(left);

			void handleInstruction(DictionaryModInstruction<TKey, TValue> instruction)
			{
				var node = builder.AddChild(parent, instruction);

				if (instruction.InstructionType != DictionaryModInstructionType.Update) return;

				var oldValue = instruction.RelatedValue;
				var newValue = instruction.TargetValue;
				if (oldValue == null || newValue == null) return;

				ProcessNestedProp(builder, node, oldValue, newValue, path, context);
			}

			switch (left)
			{
				case ImmutableDictionary<TKey, TValue> immutableDictionary:
					DiffDictionary(immutableDictionary, right, handleInstruction);
					break;
				case DictionaryRecord<TKey, TValue> dictionaryRecord:
					DiffDictionary(dictionaryRecord, right, handleInstruction);
					break;
				case Dictionary<TKey, TValue> dictionary:
					DiffDictionary(dictionary, right, handleInstruction);
					break;
				case FrozenDictionary<TKey, TValue> frozenDictionary:
					DiffDictionary(frozenDictionary, right, handleInstruction);
					break;
				default:
					DiffDictionary(left, right, handleInstruction, context.GetKeyComparer<TKey>(), context.GetValueComparer<TValue>());
					break;
			}

			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Pop();
		}

		internal static void DeepDiffList<T>(TreeRecord<ModInstruction>.Builder builder, TreeRecordNode<ModInstruction>? parent, IReadOnlyList<T> left, IReadOnlyList<T> right, Stack<object?> path, DeepDiffContext context)
		{
			if (path.Contains(left)) return;

			// Only track objects that could form circles
			var elementType = typeof(T);
			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Push(left);

			void handleInstruction(ListModInstruction<T> instruction)
			{
				var node = builder.AddChild(parent, instruction);

				if (instruction.InstructionType != ListModInstructionType.Update &&
					instruction.InstructionType != ListModInstructionType.UpdateMove) return;

				var oldValue = instruction.RelatedElement;
				var newValue = instruction.TargetElement;
				if (oldValue == null || newValue == null) return;

				ProcessNestedProp(builder, node, oldValue, newValue, path, context);
			}

			DiffList(left, right, handleInstruction, context.GetKeyComparer<T>(), context.GetValueComparer<T>());

			if (!elementType.IsPrimitive && elementType.GetProperties().Any(p => !p.PropertyType.IsPrimitive)) path.Pop();
		}

		internal static void DeepDiffObject<T>(TreeRecord<ModInstruction>.Builder builder, TreeRecordNode<ModInstruction>? parent, T left, T right, Stack<object?> path, DeepDiffContext context)
		{
			if (path.Contains(left)) return;

			// Only track objects that could form circles
			if (left != null && !left.GetType().IsPrimitive && left.GetType().GetProperties().Any(p => !p.PropertyType.IsPrimitive))
				path.Push(left);

			void handleInstruction(ObjectModInstruction<T> instruction)
			{
				var node = builder.AddChild(parent, instruction);

				if (instruction.InstructionType != ObjectModInstructionType.UpdateProperty &&
					instruction.InstructionType != ObjectModInstructionType.UpdateField) return;

				var oldValue = instruction.RelatedValue;
				var newValue = instruction.TargetValue;
				if (oldValue == null || newValue == null) return;

				ProcessNestedProp(builder, node, oldValue, newValue, path, context);
			}

			DiffObject(left, right, handleInstruction, context.GetValueComparers());

			if (left != null && !left.GetType().IsPrimitive && left.GetType().GetProperties().Any(p => !p.PropertyType.IsPrimitive))
				path.Pop();
		}

		#endregion

		#region Diff

		public static void DiffTree<T>(this TreeRecord<T> left, TreeRecord<T> right, Action<TreeModInstruction<T>> callback, IEqualityComparer<T>? keyComparer = null, IEqualityComparer<T>? valueComparer = null) where T : notnull
		{
			// Try to use IIdentity comparer if available and no explicit comparer provided
			keyComparer ??= (typeof(IIdentity<T>).IsAssignableFrom(typeof(T))
				? IIdentity<T>.EqualityComparer.Default
				: EqualityComparer<T>.Default);

			var leftNodes = left.ToNodeList(TraverseOrder.LevelOrder);

			var rightNodes = new List<(TreeRecordNode<T> node, int childIndex)>();
			right.TraverseLevelOrder((v, i) => rightNodes.Add((v, i)));

			Debug.Assert(leftNodes.Select((n, i) => (node: n, index: i))
				.All(ni => leftNodes.Skip(ni.index + 1)
					.All(n => !keyComparer.Equals(ni.node.Value, n.Value))),
				"Left tree contains duplicate identities");

			Debug.Assert(rightNodes.Select((n, i) => (node: n, index: i))
				.All(ni => rightNodes.Skip(ni.index + 1)
					.All(n => !keyComparer.Equals(ni.node.node.Value, n.node.Value))),
				"Right tree contains duplicate identities");


			var intermediate = new TreeRecord<T>(left).ToBuilder();
			var intermediateTreeNodes = intermediate.ToNodeList(TraverseOrder.LevelOrder);

			var intermediateNodes = new Dictionary<T, TreeRecordNode<T>>(keyComparer);
			foreach (var node in intermediateTreeNodes) intermediateNodes.Add(node.Value, node);

			var nonProcessedNodes = new HashSet<TreeRecordNode<T>>(ReferenceEqualityComparer.Instance);
			foreach (var node in intermediateTreeNodes) nonProcessedNodes.Add(node);

			var removalsDict = new Dictionary<IReadOnlyList<TreeRecordNode<T>>, List<(int index, TreeRecordNode<T> node)>>(ReferenceEqualityComparer.Instance);

			intermediate.TraverseLevelOrder((node, index) => 
			{
				if (rightNodes.Any(rn => keyComparer.Equals(rn.node.Value, node.Value))) return;
				var children = node.Parent?.Children ?? intermediate.Children;
				if (!removalsDict.TryGetValue(children, out var removals))
				{
					removals = [];
					removalsDict.Add(children, removals);
				}
				removals.Add((index, node));
			});

			for (int length = rightNodes.Count, i = 0; i < length; ++i)  // Changed to start at 0 to include roots
			{
				var (rightNode, rightNodeIndex) = rightNodes[i];
				bool isRoot = rightNode.Parent == null;
				var intermediateParent = isRoot ? null : intermediateNodes[rightNode.Parent!.Value];
				var currentChildren = isRoot ? intermediate.Children : intermediateParent!.Children;

				if (removalsDict.TryGetValue(currentChildren, out var removals))
				while (removals.Count != 0)
				{
					var matchingRemoval = removals.FirstOrDefault(r => r.index == rightNodeIndex);
					if (matchingRemoval.node == null) break;

					var instruction = new TreeModInstruction<T>
					{
						InstructionType = isRoot ? TreeModInstructionType.RootRemoveRecursive : TreeModInstructionType.NonRootRemoveRecursive,
						Left = left,
						Right = right,
						TargetParent = matchingRemoval.node.Parent,
						Index = matchingRemoval.index,
						TargetNode = matchingRemoval.node
					};
					callback(instruction);
					var removedNode = _applyInstruction(intermediate, instruction);
					Debug.Assert(removedNode != null);
					nonProcessedNodes.Remove(removedNode);
					removals.Remove(matchingRemoval);
					for (int jlength = removals.Count, j = 0; j < jlength; ++j)
					{
						if (removals[j].index > matchingRemoval.index) removals[j] = (removals[j].index - 1, removals[j].node);
					}
				}

				if (!intermediateNodes.TryGetValue(rightNode.Value, out var matchedIntermediateNode))
				{
					var instruction = new TreeModInstruction<T>
					{
						InstructionType = isRoot ? TreeModInstructionType.RootInsert : TreeModInstructionType.NonRootInsert,
						Left = left,
						Right = right,
						TargetParent = isRoot ? null : intermediateParent,
						Index = rightNodeIndex,
						TargetNode = rightNode
					};
					callback(instruction);
					var newNode = _applyInstruction(intermediate, instruction);
					Debug.Assert(newNode != null);
					intermediateNodes.Add(rightNode.Value, newNode);
					_adjustRemovalIndices(currentChildren, instruction.Index, 1);
					continue;
				}

				// matched by identity in intermediate tree
				bool sameParent = isRoot ?
					matchedIntermediateNode.Parent == null :
					matchedIntermediateNode.Parent != null && keyComparer.Equals(matchedIntermediateNode.Parent!.Value, rightNode.Parent!.Value);

				int pos;
				bool equality;

				if (sameParent)
				{
					if (isRoot)
					{
						pos = _findByKey(matchedIntermediateNode.Value, intermediate.Children, rightNodeIndex);
					}
					else
					{
						pos = _findByKey(matchedIntermediateNode.Value, matchedIntermediateNode.Parent!.Children, rightNodeIndex);
					}
					Debug.Assert(pos != -1);

					equality = valueComparer == null ? matchedIntermediateNode.Value.Equals(rightNode.Value) : valueComparer.Equals(matchedIntermediateNode.Value, rightNode.Value);
					if (pos == rightNodeIndex)
					{
						if (equality)
						{
							nonProcessedNodes.Remove(matchedIntermediateNode);
							continue;
						}
						var instruction = new TreeModInstruction<T>
						{
							InstructionType = isRoot ? TreeModInstructionType.RootUpdate : TreeModInstructionType.NonRootUpdate,
							Left = left,
							Right = right,
							TargetParent = isRoot ? null : matchedIntermediateNode.Parent,
							Index = rightNodeIndex,
							TargetNode = rightNode,
							RelatedNode = matchedIntermediateNode,
						};
						callback(instruction);
						_applyInstruction(intermediate, instruction);
						nonProcessedNodes.Remove(matchedIntermediateNode);
						continue;
					}

					var delta = -(pos - rightNodeIndex);
					Debug.Assert(delta < 0);

					var shiftInstruction = new TreeModInstruction<T>
					{
						InstructionType = isRoot ?
							(equality ? TreeModInstructionType.RootShift : TreeModInstructionType.RootUpdateShift) :
							(equality ? TreeModInstructionType.NonRootShift : TreeModInstructionType.NonRootUpdateShift),
						Left = left,
						Right = right,
						TargetParent = isRoot ? null : matchedIntermediateNode.Parent,
						Index = pos,
						Delta = delta,
						TargetNode = rightNode,
						RelatedNode = equality ? null : matchedIntermediateNode,
					};
					callback(shiftInstruction);
					_applyInstruction(intermediate, shiftInstruction);
					nonProcessedNodes.Remove(matchedIntermediateNode);
					_adjustRemovalIndices(currentChildren, pos + delta, -delta);
					continue;
				}

				pos = _findByKey(matchedIntermediateNode.Value,	matchedIntermediateNode.Parent?.Children ?? intermediate.Children, 0);

				Debug.Assert(pos != -1);

				equality = valueComparer == null ? matchedIntermediateNode.Value.Equals(rightNode.Value) : valueComparer.Equals(matchedIntermediateNode.Value, rightNode.Value);
				var relocateInstruction = new TreeModInstruction<T>
				{
					InstructionType = equality ? TreeModInstructionType.NonRootRelocate : TreeModInstructionType.NonRootUpdateRelocate,
					Left = left,
					Right = right,
					Index = pos,												// Source index in current parent
					Delta = rightNodeIndex,										// Target index in new parent
					TargetParent = intermediateParent,							// New parent in intermediate tree
					TargetNode = rightNode,
					RelatedParent = matchedIntermediateNode.Parent,				// source parent in intermediate tree
					RelatedNode = equality ? null : matchedIntermediateNode,
				};
				callback(relocateInstruction);
				_applyInstruction(intermediate, relocateInstruction);
				nonProcessedNodes.Remove(matchedIntermediateNode);
				_adjustRemovalIndices(matchedIntermediateNode.Parent?.Children ?? intermediate.Children, pos, -1);  // old parent
				_adjustRemovalIndices(currentChildren, rightNodeIndex, 1);  // new parent
			}

			// Process remaining nodes (nodes in intermediate that weren't matched/processed)
			var removingNodes = new HashSet<TreeRecordNode<T>>(ReferenceEqualityComparer.Instance);
			foreach (var node in nonProcessedNodes)
			{
				if (node.Parent == null || removingNodes.Contains(node.Parent)) continue;

				// This is a top-level node to remove
				removingNodes.Add(node);
				var pos = _findByKey(node.Value, node.Parent.Children, 0);
				Debug.Assert(pos != -1);

				var instruction = new TreeModInstruction<T>
				{
					InstructionType = node.Parent == null ? TreeModInstructionType.RootRemoveRecursive : TreeModInstructionType.NonRootRemoveRecursive,
					Left = left,
					Right = right,
					TargetParent = node.Parent,
					Index = pos,
					TargetNode = node
				};
				callback(instruction);
				_applyInstruction(intermediate, instruction);
			}

			_validateResult(intermediate.ToTreeRecord(), right);

			void _adjustRemovalIndices(IReadOnlyList<TreeRecordNode<T>> children, int fromIndex, int adjustment)
			{
				if (!removalsDict.TryGetValue(children, out var removals)) return;
				for (int jlength = removals.Count, j = 0; j < jlength; ++j)
				{
					if (removals[j].index >= fromIndex) removals[j] = (removals[j].index + adjustment, removals[j].node);
				}
			}

			int _findByKey(T value, IReadOnlyList<TreeRecordNode<T>> list, int startIndex)
			{
				for (int j = startIndex; j < list.Count; j++)
				{
					if (keyComparer.Equals(value, list[j].Value)) return j;
				}
				return -1;
			}

			TreeRecordNode<T>? _applyInstruction(TreeRecord<T>.Builder intermediate, TreeModInstruction<T> instruction)
			{
				switch (instruction.InstructionType)
				{
					case TreeModInstructionType.RootInsert:
						return intermediate.InsertChild(null, instruction.Index, instruction.TargetNode!.Value);

					case TreeModInstructionType.RootRemoveRecursive:
						return intermediate.RemoveChildAt(instruction.Index);

					case TreeModInstructionType.RootUpdate:
					case TreeModInstructionType.NonRootUpdate:
						intermediate.UpdateChildFrom(instruction.TargetParent, instruction.Index, instruction.TargetNode!, false);
						return null;

					case TreeModInstructionType.RootShift:
						intermediate.MoveChild(instruction.Index, instruction.Index + instruction.Delta);
						return null;

					case TreeModInstructionType.RootUpdateShift:
						intermediate.UpdateChildFrom(instruction.Index, instruction.TargetNode!, false);
						intermediate.MoveChild(instruction.Index, instruction.Index + instruction.Delta);
						return null;

					case TreeModInstructionType.NonRootInsert:
						return intermediate.InsertChild(instruction.TargetParent, instruction.Index, instruction.TargetNode!.Value);

					case TreeModInstructionType.NonRootRemoveRecursive:
						return intermediate.RemoveChildAt(instruction.TargetParent, instruction.Index);

					case TreeModInstructionType.NonRootShift:
						intermediate.MoveChild(instruction.TargetParent, instruction.Index, instruction.Index + instruction.Delta);
						return null;

					case TreeModInstructionType.NonRootUpdateShift:
						intermediate.UpdateChildFrom(instruction.TargetParent, instruction.Index, instruction.TargetNode!, false);
						intermediate.MoveChild(instruction.TargetParent, instruction.Index, instruction.Index + instruction.Delta);
						return null;

					case TreeModInstructionType.NonRootRelocate:
						intermediate.MoveChild(instruction.RelatedParent, instruction.Index, instruction.TargetParent, instruction.Delta);
						return null;

					case TreeModInstructionType.NonRootUpdateRelocate:
						intermediate.UpdateChildFrom(instruction.RelatedParent, instruction.Index, instruction.TargetNode!, false);
						intermediate.MoveChild(instruction.RelatedParent, instruction.Index, instruction.TargetParent, instruction.Delta);
						return null;

					default:
						throw new NotImplementedException($"Unknown instruction type: {instruction.InstructionType}");
				}
			}

			void _validateResult(TreeRecord<T> intermediate, TreeRecord<T> right)
			{
				if (!intermediate.Equals(right))
				{
					var json_intermediate = JsonSerializer.Serialize(intermediate, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					var json_left = JsonSerializer.Serialize(left, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					var json_right = JsonSerializer.Serialize(right, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					if (json_intermediate != json_right)
					{
						Debug.Fail("json_intermediate != json_right");
						//DeepTreeDelta(left, right);
					}
					else
					{
						Debug.Fail("!intermediate.SequenceEqual(right)");
						//DeepTreeDelta(left, right);
					}
				}
			}
		}

		public static IReadOnlyCollection<TreeModInstruction<T>> DiffTree<T>(this TreeRecord<T> left, TreeRecord<T> right, IEqualityComparer<T>? keyComparer = null, IEqualityComparer<T>? valueComparer = null) where T : notnull
		{
			var result = new List<TreeModInstruction<T>>();
			DiffTree<T>(left, right, result.Add, keyComparer, valueComparer);
			return result;
		}

		#region DiffHashSet

		static IReadOnlyCollection<HashSetModInstruction<T>> DiffHashSetInternal<T>(IReadOnlySet<T> left, IReadOnlySet<T> right, IEqualityComparer<T> intermediateEqualityComparer)
		{
			var result = new List<HashSetModInstruction<T>>();
			DiffHashSetInternal<T>(left, right, result.Add, intermediateEqualityComparer);
			return result;
		}

		static void DiffHashSetInternal<T>(IReadOnlySet<T> left, IReadOnlySet<T> right, Action<HashSetModInstruction<T>> callback, IEqualityComparer<T> intermediateEqualityComparer)
		{
			Debug.Assert(left.All(x => x != null), "Left set contains null values");
			Debug.Assert(right.All(x => x != null), "Right set contains null values");

			var intermediate = new HashSet<T>(left, intermediateEqualityComparer);

			// Handle removals first - elements in left that aren't in right
			foreach (var element in left)
			{
				if (!right.Contains(element))
				{
					var instruction = new HashSetModInstruction<T>
					{
						InstructionType = HashSetModInstructionType.Remove,
						Left = left,
						Right = right,
						TargetElement = element
					};
					callback(instruction);
					_applyInstruction(intermediate, instruction);
				}
			}

			// Handle updates and insertions - check each element in right
			foreach (var rightElement in right)
			{
				// If element exists in left but is different (has different value but same identity/equality)
				if (intermediate.TryGetValue(rightElement, out var leftElement))
				{
					if (!leftElement!.Equals(rightElement)) //	might happen if the equality comparer for the sets is different from the default quality comparer of `T` (for ex. `HashSetRecord<T>` where `T` implements `IIdentity<T>`)
					{
						var instruction = new HashSetModInstruction<T>
						{
							InstructionType = HashSetModInstructionType.Update,
							Left = left,
							Right = right,
							TargetElement = rightElement,
							RelatedElement = leftElement
						};
						callback(instruction);
						_applyInstruction(intermediate, instruction);
					}
				}
				else // Element doesn't exist in left at all - insert it
				{
					var instruction = new HashSetModInstruction<T>
					{
						InstructionType = HashSetModInstructionType.Add,
						Left = left,
						Right = right,
						TargetElement = rightElement
					};
					callback(instruction);
					_applyInstruction(intermediate, instruction);
				}
			}

			// Verify our instructions produce the correct result
			if (!intermediate.SetEquals(right))
			{
				var json_intermediate = JsonSerializer.Serialize(intermediate, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				var json_left = JsonSerializer.Serialize(left, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				var json_right = JsonSerializer.Serialize(right, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				if (json_intermediate != json_right)
				{
					Debug.Fail("json_intermediate != json_right");
					//Diff(left, right);
				}
				else
				{
					Debug.Fail("!intermediate.SetEquals(right)");
					//Diff(left, right);
				}
			}

			void _applyInstruction(HashSet<T> set, HashSetModInstruction<T> instruction)
			{
				switch (instruction.InstructionType)
				{
					case HashSetModInstructionType.Add:
						set.Add(instruction.TargetElement);
						break;

					case HashSetModInstructionType.Remove:
						set.Remove(instruction.TargetElement);
						break;

					case HashSetModInstructionType.Update:		//	might happen if the equality comparer for the sets is different from the default quality comparer of `T` (for ex. `HashSetRecord<T>` where `T` implements `IIdentity<T>`) - in such case same identity might carry different values, and the new value must be updated on the target hash set
						set.Remove(instruction.TargetElement);  // Remove via set's cofigured equality comparer (existing element has a different value from the new `instruction.Element`)
						set.Add(instruction.TargetElement);     // Add `instruction.Element` via set's cofigured equality comparer
						break;

					default:
						throw new NotImplementedException($"Unknown instruction type: {instruction.InstructionType}");
				}
			}
		}

		public static IReadOnlyCollection<HashSetModInstruction<T>> DiffHashSet<T>(this HashSetRecord<T> left, IReadOnlySet<T> right) => DiffHashSetInternal(left, right, left.KeyComparer);

		public static void DiffHashSet<T>(this HashSetRecord<T> left, IReadOnlySet<T> right, Action<HashSetModInstruction<T>> callback) => DiffHashSetInternal(left, right, callback, left.KeyComparer);

		public static IReadOnlyCollection<HashSetModInstruction<T>> DiffHashSet<T>(this HashSet<T> left, IReadOnlySet<T> right)	=> DiffHashSetInternal(left, right, left.Comparer);

		public static void DiffHashSet<T>(this HashSet<T> left, IReadOnlySet<T> right, Action<HashSetModInstruction<T>> callback) => DiffHashSetInternal(left, right, callback, left.Comparer);

		public static IReadOnlyCollection<HashSetModInstruction<T>> DiffHashSet<T>(this ImmutableHashSet<T> left, IReadOnlySet<T> right) => DiffHashSetInternal(left, right, left.KeyComparer);

		public static void DiffHashSet<T>(this ImmutableHashSet<T> left, IReadOnlySet<T> right, Action<HashSetModInstruction<T>> callback) => DiffHashSetInternal(left, right, callback, left.KeyComparer);

		public static IReadOnlyCollection<HashSetModInstruction<T>> DiffHashSet<T>(this FrozenSet<T> left, IReadOnlySet<T> right) => DiffHashSetInternal(left, right, left.Comparer);

		public static void DiffHashSet<T>(this FrozenSet<T> left, IReadOnlySet<T> right, Action<HashSetModInstruction<T>> callback) => DiffHashSetInternal(left, right, callback, left.Comparer);

		// Last resort overload for unknown implementations or when you want to specify the comparer
		public static IReadOnlyCollection<HashSetModInstruction<T>> DiffHashSet<T>(this IReadOnlySet<T> left, IReadOnlySet<T> right, IEqualityComparer<T>? intermediateEqualityComparer = null)
		{
			if(intermediateEqualityComparer != null) return DiffHashSetInternal(left, right, intermediateEqualityComparer);

			return DiffHashSetInternal(left, right, new[] { "Comparer", "KeyComparer", "EqualityComparer" }
				.Select(name => left
					.GetType()
					.GetProperty(name)?
					.GetValue(left)
				)
				.FirstOrDefault(c => 
					c is IEqualityComparer<T>) as IEqualityComparer<T> 
					?? EqualityComparer<T>.Default
				);
		}

		public static void DiffHashSet<T>(this IReadOnlySet<T> left, IReadOnlySet<T> right, Action<HashSetModInstruction<T>> callback, IEqualityComparer<T>? intermediateEqualityComparer = null)
		{
			if (intermediateEqualityComparer != null)
			{
				DiffHashSetInternal(left, right, callback, intermediateEqualityComparer);
				return;
			}

			DiffHashSetInternal(left, right, callback, new[] { "Comparer", "KeyComparer", "EqualityComparer" }
				.Select(name => left
					.GetType()
					.GetProperty(name)?
					.GetValue(left)
				)
				.FirstOrDefault(c =>
					c is IEqualityComparer<T>) as IEqualityComparer<T>
					?? EqualityComparer<T>.Default
				);
		}

		#endregion

		#region DiffDictionary

		static void DiffDictionaryInternal<TKey, TValue>(IReadOnlyDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Action<DictionaryModInstruction<TKey, TValue>> callback, IEqualityComparer<TKey> intermediateKeyComparer, IEqualityComparer<TValue> intermediateValueComparer) where TKey : notnull
		{
			Debug.Assert(left.Values.All(x => x != null), "Left dictionary contains null values");
			Debug.Assert(right.Values.All(x => x != null), "Right dictionary contains null values");

			var intermediate = new DictionaryRecord<TKey, TValue>.Builder(intermediateKeyComparer, intermediateValueComparer);
			foreach (var kvp in left) intermediate.Add(kvp.Key, kvp.Value);

			// Handle removals - keys in left that aren't in right
			foreach (var kvp in left)
			{
				if (!right.ContainsKey(kvp.Key))
				{
					var instruction = new DictionaryModInstruction<TKey, TValue>
					{
						InstructionType = DictionaryModInstructionType.Remove,
						Left = left,
						Right = right,
						Key = kvp.Key,
						TargetValue = kvp.Value  // Store original value for debugging
					};
					callback(instruction);
					_applyInstruction(intermediate, instruction);
				}
			}

			foreach (var kvp in right)
			{
				// Handle insertions - keys in right that aren't in left
				if (!left.ContainsKey(kvp.Key))
				{
					var instruction = new DictionaryModInstruction<TKey, TValue>
					{
						InstructionType = DictionaryModInstructionType.Add,
						Left = left,
						Right = right,
						Key = kvp.Key,
						TargetValue = kvp.Value
					};
					callback(instruction);
					_applyInstruction(intermediate, instruction);
				}
				// Handle updates - shared keys with different values
				else
				{
					var leftValue = left[kvp.Key]!;
					var rightValue = kvp.Value;
					if (intermediateValueComparer == null ? !leftValue.Equals(rightValue) : !intermediateValueComparer.Equals(leftValue, rightValue))
					{
						var instruction = new DictionaryModInstruction<TKey, TValue>
						{
							InstructionType = DictionaryModInstructionType.Update,
							Left = left,
							Right = right,
							Key = kvp.Key,
							TargetValue = rightValue,
							RelatedValue = leftValue,
						};
						callback(instruction);
						_applyInstruction(intermediate, instruction);
					}
				}
			}

			_validateResult(intermediate, right);

			// Changed parameter type to Builder
			void _applyInstruction(DictionaryRecord<TKey, TValue>.Builder dict, DictionaryModInstruction<TKey, TValue> instruction)
			{
				switch (instruction.InstructionType)
				{
					case DictionaryModInstructionType.Add:
						dict.Add(instruction.Key, instruction.TargetValue);
						break;

					case DictionaryModInstructionType.Remove:
						dict.Remove(instruction.Key);
						break;

					case DictionaryModInstructionType.Update:
						dict[instruction.Key] = instruction.TargetValue;
						break;

					default:
						throw new NotImplementedException($"Unknown instruction type: {instruction.InstructionType}");
				}
			}

			// Changed parameter type to Builder and using Builder's comparers
			void _validateResult(DictionaryRecord<TKey, TValue>.Builder intermediate, IReadOnlyDictionary<TKey, TValue> right)
			{
				if (!_dictionariesEqual(intermediate, right))
				{
					var json_intermediate = JsonSerializer.Serialize(intermediate, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					var json_left = JsonSerializer.Serialize(left, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					var json_right = JsonSerializer.Serialize(right, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
					if (json_intermediate != json_right)
					{
						Debug.Fail("json_intermediate != json_right");
						//DiffDictionary(intermediate, right);
					}
					else
					{
						Debug.Fail("!intermediate.SequenceEqual(right)");
						//DiffDictionary(intermediate, right);
					}
				}
				bool _dictionariesEqual(DictionaryRecord<TKey, TValue>.Builder first, IReadOnlyDictionary<TKey, TValue> second)
				{
					if (first.Count != second.Count) return false;

					foreach (var kvp in second) if (!first.TryGetValue(kvp.Key, out var firstValue) || !first.ValueComparer.Equals(firstValue, kvp.Value)) return false;

					return true;
				}
			}
		}

		static IReadOnlyCollection<DictionaryModInstruction<TKey, TValue>> DiffDictionaryInternal<TKey, TValue>(IReadOnlyDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, IEqualityComparer<TKey> intermediateKeyComparer, IEqualityComparer<TValue> intermediateValueComparer) where TKey : notnull
		{
			var result = new List<DictionaryModInstruction<TKey, TValue>>();
			DiffDictionaryInternal<TKey, TValue>(left, right, result.Add, intermediateKeyComparer, intermediateValueComparer);
			return result;
		}


		public static IReadOnlyCollection<DictionaryModInstruction<TKey, TValue>> DiffDictionary<TKey, TValue>(this ImmutableDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right) where TKey : notnull => DiffDictionaryInternal(left, right, left.KeyComparer, left.ValueComparer);

		public static void DiffDictionary<TKey, TValue>(this ImmutableDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Action<DictionaryModInstruction<TKey, TValue>> callback) where TKey : notnull => DiffDictionaryInternal(left, right, callback, left.KeyComparer, left.ValueComparer);


		public static IReadOnlyCollection<DictionaryModInstruction<TKey, TValue>> DiffDictionary<TKey, TValue>(this DictionaryRecord<TKey, TValue> left,
		   IReadOnlyDictionary<TKey, TValue> right) where TKey : notnull => DiffDictionaryInternal(left, right, left.KeyComparer, left.ValueComparer);

		public static void DiffDictionary<TKey, TValue>(this DictionaryRecord<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Action<DictionaryModInstruction<TKey, TValue>> callback) where TKey : notnull => DiffDictionaryInternal(left, right, callback, left.KeyComparer, left.ValueComparer);
		
		public static IReadOnlyCollection<DictionaryModInstruction<TKey, TValue>> DiffDictionary<TKey, TValue>(this Dictionary<TKey, TValue> left,
		   IReadOnlyDictionary<TKey, TValue> right) where TKey : notnull => DiffDictionaryInternal(left, right, left.Comparer, EqualityComparer<TValue>.Default);

		public static void DiffDictionary<TKey, TValue>(this Dictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Action<DictionaryModInstruction<TKey, TValue>> callback) where TKey : notnull => DiffDictionaryInternal(left, right, callback, left.Comparer, EqualityComparer<TValue>.Default);
		
		public static IReadOnlyCollection<DictionaryModInstruction<TKey, TValue>> DiffDictionary<TKey, TValue>(this FrozenDictionary<TKey, TValue> left,
		   IReadOnlyDictionary<TKey, TValue> right) where TKey : notnull => DiffDictionaryInternal(left, right, left.Comparer, EqualityComparer<TValue>.Default);

		public static void DiffDictionary<TKey, TValue>(this FrozenDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Action<DictionaryModInstruction<TKey, TValue>> callback) where TKey : notnull => DiffDictionaryInternal(left, right, callback, left.Comparer, EqualityComparer<TValue>.Default);

		public static IReadOnlyCollection<DictionaryModInstruction<TKey, TValue>> DiffDictionary<TKey, TValue>(this IReadOnlyDictionary<TKey, TValue> left,
		   IReadOnlyDictionary<TKey, TValue> right, IEqualityComparer<TKey>? intermediateKeyComparer = null, IEqualityComparer<TValue>? intermediateValueComparer = null) where TKey : notnull
		{
			Type type = left.GetType();

			// Try to get key comparer
			intermediateKeyComparer ??= new[] { "KeyComparer", "Comparer" }
				.Select(name => type.GetProperty(name)?.GetValue(left))
				.FirstOrDefault(c => c is IEqualityComparer<TKey>) as IEqualityComparer<TKey>;

			// Try to get value comparer
			intermediateValueComparer ??= type.GetProperty("ValueComparer")
				?.GetValue(left) as IEqualityComparer<TValue>;

			return DiffDictionaryInternal(left, right, intermediateKeyComparer ?? EqualityComparer<TKey>.Default, intermediateValueComparer ?? EqualityComparer<TValue>.Default);
		}

		public static void DiffDictionary<TKey, TValue>(this IReadOnlyDictionary<TKey, TValue> left, IReadOnlyDictionary<TKey, TValue> right, Action<DictionaryModInstruction<TKey, TValue>> callback, IEqualityComparer<TKey>? intermediateKeyComparer = null, IEqualityComparer<TValue>? intermediateValueComparer = null) where TKey : notnull
		{
			Type type = left.GetType();

			// Try to get key comparer
			intermediateKeyComparer ??= new[] { "KeyComparer", "Comparer" }
				.Select(name => type.GetProperty(name)?.GetValue(left))
				.FirstOrDefault(c => c is IEqualityComparer<TKey>) as IEqualityComparer<TKey>;

			// Try to get value comparer
			intermediateValueComparer ??= type.GetProperty("ValueComparer")
				?.GetValue(left) as IEqualityComparer<TValue>;

			DiffDictionaryInternal(left, right, callback, intermediateKeyComparer ?? EqualityComparer<TKey>.Default, intermediateValueComparer ?? EqualityComparer<TValue>.Default);
		}

		#endregion

		public static void DiffList<T>(this IReadOnlyList<T> left, IReadOnlyList<T> right, Action<ListModInstruction<T>> callback, IEqualityComparer<T>? keyComparer = null, IEqualityComparer<T>? valueComparer = null)
		{
			// Try to use IIdentity comparer if available and no explicit comparer provided
			keyComparer ??= (typeof(IIdentity<T>).IsAssignableFrom(typeof(T))
				? IIdentity<T>.EqualityComparer.Default
				: EqualityComparer<T>.Default);

			Debug.Assert(left.All(x => x != null), "Left array contains null values");
			Debug.Assert(right.All(x => x != null), "Right array contains null values");

			Debug.Assert(left.Select((x, i) => (element: x, index: i))
				.All(xi => left.Skip(xi.index + 1)
					.All(y => !keyComparer.Equals(xi.element, y))),
				"Left array contains duplicate identities");

			Debug.Assert(right.Select((x, i) => (element: x, index: i))
				.All(xi => right.Skip(xi.index + 1)
					.All(y => !keyComparer.Equals(xi.element, y))),
				"Right array contains duplicate identities");

			var rightList = right.ToList();
			var intermediate = new List<T>(left);

			int i = 0;
			while (i < intermediate.Count || i < right.Count)
			{
				if (i >= intermediate.Count)
				{
					var instruction = new ListModInstruction<T>
					{
						InstructionType = ListModInstructionType.Insert,
						Left = left,
						Right = right,
						Index = i,
						TargetElement = right[i]
					};
					callback(instruction);
					i += _applyInstruction(intermediate, instruction);
					continue;
				}
				if (i >= right.Count)
				{
					var instruction = new ListModInstruction<T>
					{
						InstructionType = ListModInstructionType.Remove,
						Left = left,
						Right = right,
						Index = i,
						TargetElement = intermediate[i]
					};
					callback(instruction);
					i += _applyInstruction(intermediate, instruction);
					continue;
				}

				var rightElement = right[i];
				var currElement = intermediate[i];

				bool sameIdentity = keyComparer.Equals(rightElement, currElement);
				bool sameValue = sameIdentity && rightElement!.Equals(currElement);

				if (sameIdentity)
				{
					if (sameValue)
					{
						++i;
						continue;
					}
					else
					{
						var instruction = new ListModInstruction<T>
						{
							InstructionType = ListModInstructionType.Update,
							Left = left,
							Right = right,
							Index = i,
							TargetElement = rightElement,
							RelatedElement = currElement,
						};
						callback(instruction);
						i += _applyInstruction(intermediate, instruction);
						continue;
					}
				}

				var pos = _findKeyMatch(currElement, rightList, i + 1);
				if (pos == -1)
				{
					var instruction = new ListModInstruction<T>
					{
						InstructionType = ListModInstructionType.Remove,
						Left = left,
						Right = right,
						Index = i,
						TargetElement = currElement
					};
					callback(instruction);
					i += _applyInstruction(intermediate, instruction);
					continue;
				}

				pos = _findKeyMatch(rightElement, intermediate, i + 1);
				if (pos == -1)
				{
					var instruction = new ListModInstruction<T>
					{
						InstructionType = ListModInstructionType.Insert,
						Left = left,
						Right = right,
						Index = i,
						TargetElement = rightElement
					};
					callback(instruction);
					i += _applyInstruction(intermediate, instruction);
					continue;
				}

				var delta = -(pos - i);
				Debug.Assert(delta < 0);
				var movingElement = intermediate[pos];
				var equality = valueComparer == null ? movingElement!.Equals(rightElement) : valueComparer.Equals(movingElement, rightElement);
				var moveInstruction = new ListModInstruction<T>
				{
					InstructionType = equality ? ListModInstructionType.Move : ListModInstructionType.UpdateMove,
					Left = left,
					Right = right,
					Index = pos,
					Delta = delta,
					TargetElement = rightElement,
					RelatedElement = movingElement,
				};
				callback(moveInstruction);
				i += _applyInstruction(intermediate, moveInstruction);
				continue;
			}

			if (!intermediate.SequenceEqual(right))
			{
				var json_intermediate = JsonSerializer.Serialize(intermediate, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				var json_left = JsonSerializer.Serialize(left, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				var json_right = JsonSerializer.Serialize(right, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
				if (json_intermediate != json_right)
				{
					Debug.Fail("json_intermediate != json_right");
					//Diff(left, right);
				}
				else
				{
					Debug.Fail("!intermediate.SequenceEqual(right)");
					//Diff(left, right);
				}
			}

			int _findKeyMatch(T element, List<T> list, int startIndex)
			{
				for (int j = startIndex; j < list.Count; j++)
				{
					if (keyComparer.Equals(element, list[j])) return j;
				}
				return -1;
			}

			int _applyInstruction(List<T> list, ListModInstruction<T> instruction)
			{
				switch (instruction.InstructionType)
				{
					case ListModInstructionType.Insert:
						list.Insert(instruction.Index, instruction.TargetElement!);
						return 1;

					case ListModInstructionType.Remove:
						list.RemoveAt(instruction.Index);
						return 0;

					case ListModInstructionType.Move:
						var element = list[instruction.Index];
						list.RemoveAt(instruction.Index);
						list.Insert(instruction.Index + instruction.Delta, element);
						return 1;

					case ListModInstructionType.Update:
						list[instruction.Index] = instruction.TargetElement!;
						return 1;

					case ListModInstructionType.UpdateMove:
						list.RemoveAt(instruction.Index);
						list.Insert(instruction.Index + instruction.Delta, instruction.TargetElement!);
						return 1;

					default:
						throw new NotImplementedException($"Unknown instruction type: {instruction.InstructionType}");
				}
			}
		}

		public static IReadOnlyCollection<ListModInstruction<T>> DiffList<T>(this IReadOnlyList<T> left, IReadOnlyList<T> right, IEqualityComparer<T>? keyComparer = null, IEqualityComparer<T>? valueComparer = null)
		{
			var result = new List<ListModInstruction<T>>();
			DiffList<T>(left, right, result.Add, keyComparer, valueComparer);
			return result;
		}

		///<remarks>
		///When diffing objects of different but related types, we'd need to treat them as property bags/dictionaries where properties can be added or removed, not just updated. We'd also need a special instruction type to indicate that the entire left object is changing into a different type (right). Simply tracking property changes wouldn't capture the full transition, since object type changes affect behavior, not just data. Any consuming system would need to know about the type change to properly reconstruct the object graph.
		///</remarks>
		public static void DiffObject<T>(this T left, T right, Action<ObjectModInstruction<T>> callback, DictionaryRecord<Type, object>? comparers = null)
		{
			if (left == null || right == null) throw new ArgumentNullException(left == null ? nameof(left) : nameof(right));

			// Ensure exact type match (see function remarks)
			if (left.GetType() != right.GetType()) throw new ArgumentException($"Type mismatch: {left.GetType().Name} vs {right.GetType().Name}");

			var type = left.GetType();
			var intermediate = new Dictionary<string, object?>();

			// Get all readable public properties and fields
			var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(p => p.GetMethod != null);
			var fields = type.GetFields(BindingFlags.Public | BindingFlags.Instance);

			// Build intermediate state from left
			foreach (var property in properties) intermediate[property.Name] = property.GetValue(left);
			foreach (var field in fields) intermediate[field.Name] = field.GetValue(left);

			// Check properties
			foreach (var property in properties)
			{
				var leftValue = property.GetValue(left);
				var rightValue = property.GetValue(right);

				if (leftValue == null && rightValue == null) continue;

				bool equals;
				if (leftValue == null || rightValue == null) equals = false;
				else if (comparers != null && comparers.TryGetValue(leftValue.GetType(), out var valueComparer))
				{
					Type valueType = leftValue.GetType();
					Type comparerType = typeof(IEqualityComparer<>).MakeGenericType(valueType);
					var equalsMethod = comparerType.GetMethod("Equals", [valueType, valueType]);
					Debug.Assert(equalsMethod != null);
					var outcome = equalsMethod.Invoke(valueComparer, [leftValue, rightValue]);
					Debug.Assert(outcome != null);
					equals = (bool)outcome;
				}
				else equals = leftValue.Equals(rightValue);

				if (!equals)
				{
					var instruction = new ObjectModInstruction<T>
					{
						InstructionType = ObjectModInstructionType.UpdateProperty,
						Left = left,
						Right = right,
						MemberName = property.Name,
						Property = property,
						TargetValue = rightValue,
						RelatedValue = leftValue,
					};
					callback(instruction);
					_applyInstruction(intermediate, instruction);
				}
			}

			// Check fields
			foreach (var field in fields)
			{
				var leftValue = field.GetValue(left);
				var rightValue = field.GetValue(right);

				if (leftValue == null && rightValue == null) continue;

				bool equals;
				if (leftValue == null || rightValue == null) equals = false;
				else if (comparers != null && comparers.TryGetValue(leftValue.GetType(), out var valueComparer))
				{
					Type valueType = leftValue.GetType();
					Type comparerType = typeof(IEqualityComparer<>).MakeGenericType(valueType);
					var equalsMethod = comparerType.GetMethod("Equals", [valueType, valueType]);
					Debug.Assert(equalsMethod != null);
					var outcome = equalsMethod.Invoke(valueComparer, [leftValue, rightValue]);
					Debug.Assert(outcome != null);
					equals = (bool)outcome;
				}
				else equals = leftValue.Equals(rightValue);

				if (!equals)
				{
					var instruction = new ObjectModInstruction<T>
					{
						InstructionType = ObjectModInstructionType.UpdateField,
						Left = left,
						Right = right,
						MemberName = field.Name,
						Field = field,
						TargetValue = rightValue,
						RelatedValue = leftValue,
					};
					callback(instruction);
					_applyInstruction(intermediate, instruction);
				}
			}

			if (!_validateResult(intermediate, right, properties, fields))
			{
				var jsonOptions = new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.Never, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
				var json_intermediate = JsonSerializer.Serialize(intermediate, jsonOptions);
				var json_left = JsonSerializer.Serialize(left, jsonOptions);
				var json_right = JsonSerializer.Serialize(right, jsonOptions);
				if (json_intermediate != json_right)
				{
					Debug.Fail("json_intermediate != json_right");
					//	DiffObject(left, right, comparers);
				}
				else
				{
					Debug.Fail("Intermediate state doesn't match right object");
					//	DiffObject(left, right, comparers);
				}
			}

			void _applyInstruction(Dictionary<string, object?> state, ObjectModInstruction<T> instruction)
			{
				switch (instruction.InstructionType)
				{
					case ObjectModInstructionType.UpdateProperty:
					case ObjectModInstructionType.UpdateField:
						state[instruction.MemberName] = instruction.TargetValue;
						break;
					default:
						throw new NotImplementedException($"Unknown instruction type: {instruction.InstructionType}");
				}
			}

			bool _validateResult(Dictionary<string, object?> state, T right,
				IEnumerable<PropertyInfo> properties, IEnumerable<FieldInfo> fields)
			{
				foreach (var property in properties)
				{
					var rightValue = property.GetValue(right);
					var intermediateValue = state[property.Name];

					if (rightValue == null && intermediateValue == null) continue;

					if ((rightValue == null && intermediateValue != null) ||
						(rightValue != null && intermediateValue == null) ||
						!rightValue!.Equals(intermediateValue))
					{
						return false;
					}
				}

				foreach (var field in fields)
				{
					var rightValue = field.GetValue(right);
					var intermediateValue = state[field.Name];

					if (rightValue == null && intermediateValue == null) continue;

					if ((rightValue == null && intermediateValue != null) ||
						(rightValue != null && intermediateValue == null) ||
						!rightValue!.Equals(intermediateValue))
					{
						return false;
					}
				}

				return true;
			}
		}

		public static IReadOnlyCollection<ObjectModInstruction<T>> DiffObject<T>(this T left, T right, DictionaryRecord<Type, object>? comparers = null)
		{
			var result = new List<ObjectModInstruction<T>>();
			DiffObject<T>(left, right, result.Add, comparers);
			return result;
		}


		public static bool DiffEqualsObsolete<T>(this IReadOnlyList<T> left, IReadOnlyList<T> right) => DiffList(left, right).Count == 0;

		#endregion

		#region ApplyDelta

		public static void ApplyDelta<T>(this IList<T> list, IReadOnlyCollection<ListModInstruction<T>> delta)
		{
			foreach (var deltaItem in delta)
			{
				switch (deltaItem.InstructionType)
				{
					case ListModInstructionType.Insert:
						{
							list.Insert(deltaItem.Index, deltaItem.TargetElement);
							break;
						}
					case ListModInstructionType.Remove:
						{
							list.RemoveAt(deltaItem.Index);
							break;
						}
					case ListModInstructionType.Update:
						{
							list[deltaItem.Index] = deltaItem.TargetElement;
							break;
						}
					case ListModInstructionType.Move:
						{
							Debug.Assert(deltaItem.Delta < 0);  //	only backword moves allowed, see `CompareUtility.DeepDelta`
							var listViewItem = list[deltaItem.Index];
							list.RemoveAt(deltaItem.Index);
							list.Insert(deltaItem.Index + deltaItem.Delta, listViewItem);
							break;
						}
					case ListModInstructionType.UpdateMove:
						{
							Debug.Assert(deltaItem.Delta < 0);  //	only backword moves allowed, see `CompareUtility.DeepDelta`
							var newListViewItem = deltaItem.TargetElement;
							list.RemoveAt(deltaItem.Index);
							list.Insert(deltaItem.Index, newListViewItem);
							break;
						}
					default: throw new NotImplementedException(deltaItem.InstructionType.ToString());
				}
			}
		}

		public static void ApplyDelta(this IList list, IReadOnlyCollection<ListModInstruction<object>> delta)
		{
			foreach (var deltaItem in delta)
			{
				switch (deltaItem.InstructionType)
				{
					case ListModInstructionType.Insert:
						{
							list.Insert(deltaItem.Index, deltaItem.TargetElement);
							break;
						}
					case ListModInstructionType.Remove:
						{
							list.RemoveAt(deltaItem.Index);
							break;
						}
					case ListModInstructionType.Update:
						{
							list[deltaItem.Index] = deltaItem.TargetElement;
							break;
						}
					case ListModInstructionType.Move:
						{
							Debug.Assert(deltaItem.Delta < 0);  //	only backword moves allowed, see `CompareUtility.DeepDelta`
							var listViewItem = list[deltaItem.Index];
							list.RemoveAt(deltaItem.Index);
							list.Insert(deltaItem.Index + deltaItem.Delta, listViewItem);
							break;
						}
					case ListModInstructionType.UpdateMove:
						{
							Debug.Assert(deltaItem.Delta < 0);  //	only backword moves allowed, see `CompareUtility.DeepDelta`
							var newListViewItem = deltaItem.TargetElement;
							list.RemoveAt(deltaItem.Index);
							list.Insert(deltaItem.Index, newListViewItem);
							break;
						}
					default: throw new NotImplementedException(deltaItem.InstructionType.ToString());
				}
			}
		}

		#endregion
	}

	#endregion
}