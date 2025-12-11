using System.Diagnostics;
using System.Numerics;
using System.Reflection;

namespace Falael.TranscribeProtocol
{
	public class DeclarationTypeInfo
	{
		public DeclarationTypeInfo(Type type, bool isNullable, Type? elementType, bool? elementIsNullable, IEnumerable<Attribute> attributes)
		{
			Debug.Assert(elementType != null && elementIsNullable != null || elementType == null && elementIsNullable == null);

			this.Type = type;
			this.IsNullable = isNullable;
			this.ElementType = elementType;
			this.ElementIsNullable = elementIsNullable;
			this.Attributes = attributes;
		}

		public DeclarationTypeInfo(Type type)
		{
			this.Type = type;
			this.IsNullable = false;
			this.ElementType = null;
			this.ElementIsNullable = null;
			this.Attributes = [];
		}

		public bool IsElement => this.ElementType != null;

		public Type Type { get; init; }
		public bool IsNullable { get; init; }
		public Type? ElementType { get; }
		public bool? ElementIsNullable { get; }
		public IEnumerable<Attribute> Attributes { get; init; }
	}
}
