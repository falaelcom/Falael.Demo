namespace Falael.TranscribeProtocol.Explicit
{
	public static class Extension
	{
		public static void Walk<TF, TRoot, TState>(this TRoot? root, DeclarationTypeInfo rootDeclarationTypeInfo, VisitDelegate<TState> visit, TState visitorState, TF? fabric = default) 
			where TF : IFabric, new() 
			=> (fabric ?? TF.The).Walk(visit, visitorState, root, rootDeclarationTypeInfo);
	}
}