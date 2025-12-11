using System.Reflection;

namespace Falael.TranscribeProtocol
{
	/// <typeparam name="TState">The type of the visitor-provided context object.</typeparam>
	/// <param name="visitorState">visitor-specific state info shared between multiple calls</param>
	/// <param name="deltaOut">
	/// - null: visiting root (first call)
	/// - 0: moving one level deeper (in)
	///	- 1: moving sideways at same level (side)
	///	- >= 2: moving back toward root by N levels (out)
	///	- with head=null & headCardinality=null: final unroot movement
	/// </param>
	/// <param name="head">head of arc being visited, or null for unroot</param>
	/// <param name="headCardinality">cardinality of head, or null for unroot</param>
	/// <param name="label">label of arc being visited, or null for root/unroot</param>
	/// <param name="labelCardinality">cardinality of label, or null for root/unroot</param>
	/// <param name="tail">
	/// - for root/unroot visit: null
	/// - for arc visit: the head of the previous arc
	/// </param>
	/// <param name="tailCardinality">cardinality of tail, or null for root/unroot</param>
	/// <param name="declarationTypeInfo">The declaration type info of the property that produced the visited arc.</param>
	/// <returns>Returns: false to skip traversing children of composite, true to continue; call on unroot must return `true`</returns>
	/// <remarks>
	/// About <paramref name="declarationTypeInfo"/>:
	/// - `rootDeclarationTypeInfo` for root/unroot;
	/// - type info of the IEnumerable, IDictionary or IDictionary<,> containing the head;
	/// or
	/// - type info of the property containing the head directly.
	/// </remarks>
	public delegate bool VisitDelegate<TState>(
		TState visitorState,
		int? deltaOut,
		object? head,
		Cardinality? headCardinality,
		object? label,
		Cardinality? labelCardinality,
		object? tail,
		Cardinality? tailCardinality,
		DeclarationTypeInfo declarationTypeInfo
	);

	public interface IWalker
	{
		/// <summary>
		/// Initiates traversal starting from the provided graph root element. Visits for root/unroot differentials and traverses root's descentants.
		/// </summary>
		/// <typeparam name="TState">The type of the visitor-provided context object.</typeparam>
		/// <param name="visit">The visitor callback.</param>
		/// <param name="state">Visitor-provided context object carried over without use by the walker.</param>
		/// <param name="root">The subject of walking where walking starts and ends.</param>
		/// <param name="rootDeclarationTypeInfo">Declaration type info on the property containing the root, if available.</param>
		/// <remarks>
		/// Recursively calls <see cref="Descend"/> for descendant traversal.
		/// </remarks>
		void Walk<TState>(
			VisitDelegate<TState> visit,
			TState visitorState,
			object? root,
			DeclarationTypeInfo rootDeclarationTypeInfo
		);

		/// <summary>
		/// Visits for <paramref name="head"/> and traverses its descentants.
		/// </summary>
		/// <typeparam name="TState">The type of the visitor-provided context object.</typeparam>
		/// <param name="visit">The visitor callback.</param>
		/// <param name="state">Visitor-provided context object carried over without use by the walker.</param>
		/// <param name="head">The subject of walking where walking continues from.</param>
		/// <param name="headCardinality">Subject cardinality.</param>
		/// <param name="label">Label in parent vertex.</param>
		/// <param name="labelCardinality">Label cardinality.</param>
		/// <param name="tail">Parent vertex.</param>
		/// <param name="tailCardinality">Parent cardinality.</param>
		/// <param name="declarationTypeInfo">The declaration type info of the property that produced the arc.</param>
		/// <param name="currentDepth">Current depth in traversal.</param>
		/// <param name="lastVisitDepth">Depth at last successful visit.</param>
		void Descend<TState>(
			VisitDelegate<TState> visit,
			TState state,
			object? head,
			Cardinality headCardinality,
			object label,
			Cardinality labelCardinality,
			object? tail,
			Cardinality tailCardinality,
			DeclarationTypeInfo declarationTypeInfo,
			ref int currentDepth,
			ref int lastVisitDepth
		);
	}
}
