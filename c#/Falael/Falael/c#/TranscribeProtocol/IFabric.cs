using System.Reflection;

namespace Falael.TranscribeProtocol
{
	public interface IFabric : IWalker
	{
		static abstract IFabric The { get; }

		Cardinality GetInstanceCardinality<TVertex>(TVertex? vertex);
		Cardinality GetDeclaredCardinality(object? vertex, Type vertexDeclarationType);
		Cardinality GetLabelCardinality(object label);
		void AssertLabelCoherent(Cardinality labelCardinality, Cardinality vertexCardinality);
		void AssertInstanceCoherent<TVertex>(object label, TVertex? tail);
		void AssertDeclarationCoherent(object label, object? tail, Type tailDeclarationType);

		DeclarationTypeInfo FromPropertyInfo(PropertyInfo propertyInfo);
		DeclarationTypeInfo FromPropertyInfo(object self, string propertyName);
		DeclarationTypeInfo FromEnumerablePropertyInfo(PropertyInfo propertyInfo);
		DeclarationTypeInfo FromEnumerableDeclarationTypeInfo(DeclarationTypeInfo enumerableDeclarationTypeInfo);
		DeclarationTypeInfo FromDictionaryPropertyInfo(PropertyInfo propertyInfo);
		DeclarationTypeInfo FromDictionaryDeclarationTypeInfo(DeclarationTypeInfo dictionaryDeclarationTypeInfo);
	}
}
