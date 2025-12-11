using System.Collections;
using System.Diagnostics;
using System.Reflection;

namespace Falael.TranscribeProtocol
{
	public partial class Fabric : IFabric, IWalker
	{
		public static IFabric The => the;
		static readonly Fabric the = new();

		public Fabric() { }

		#region IFabric

		public Cardinality GetInstanceCardinality<TVertex>(TVertex? vertex) => vertex == null ? Cardinality.Zero : this.GetTypeCardinality(vertex.GetType());

		public Cardinality GetDeclaredCardinality(object? vertex, Type vertexDeclarationType)
		{
			Debug.Assert(vertex == null || vertex != null && vertexDeclarationType.IsAssignableFrom(vertex.GetType()));
			return this.GetTypeCardinality(vertexDeclarationType);
		}

		public Cardinality GetLabelCardinality(object label) => label.GetType() == typeof(int) ? Cardinality.AlephNull_Enumerable : Cardinality.AlephOne_Object;

		public void AssertLabelCoherent(Cardinality labelCardinality, Cardinality vertexCardinality)
		{
			Debug.Assert(vertexCardinality == labelCardinality);
		}

		public void AssertInstanceCoherent<TVertex>(object label, TVertex? tail)
		{
			var instanceCardinality = this.GetInstanceCardinality(tail);
			var labelCardinality = this.GetLabelCardinality(label);
			switch (instanceCardinality)
			{
				case Cardinality.Zero: 
					Debug.Fail("Cardinality.Zero tail cannot start arcs.");
					break;
				case Cardinality.AlephNull_Enumerable:
				case Cardinality.AlephNull_GenericEnumerable:
					Debug.Assert(this.GetLabelCardinality(label) == Cardinality.AlephNull_Enumerable);
					break;
				case Cardinality.AlephOne_Object:
				case Cardinality.AlephOne_Dictionary:
				case Cardinality.AlephOne_GenericDictionary:
					Debug.Assert(this.GetLabelCardinality(label) == Cardinality.AlephOne_Object);
					break;
				default: throw new NotImplementedException();
			}
		}

		public void AssertDeclarationCoherent(object label, object? tail, Type tailDeclarationType)
		{
			Debug.Assert(this.GetDeclaredCardinality(tail, tailDeclarationType) == this.GetLabelCardinality(label));
		}

		public DeclarationTypeInfo FromPropertyInfo(PropertyInfo propertyInfo)
		{
			return new(
				type: propertyInfo.PropertyType,
				isNullable: propertyInfo.PropertyType.IsValueType
					? Nullable.GetUnderlyingType(propertyInfo.PropertyType) != null
					: new NullabilityInfoContext().Create(propertyInfo).WriteState == NullabilityState.Nullable,
				elementType: null,
				elementIsNullable: null,
				propertyInfo.GetCustomAttributes(true).Cast<Attribute>()
			);
		}

		public DeclarationTypeInfo FromPropertyInfo(object self, string propertyName)
		{
			var propertyInfo = self.GetType().GetProperty(propertyName);
			Debug.Assert(propertyInfo != null);
			return this.FromPropertyInfo(propertyInfo);
		}

		public DeclarationTypeInfo FromEnumerablePropertyInfo(PropertyInfo propertyInfo)
		{
			Debug.Assert(!propertyInfo.PropertyType.IsValueType);

			var nullabilityInfo = new NullabilityInfoContext().Create(propertyInfo);
			var elementType = GetGenericEnumerableElementType(propertyInfo.PropertyType);

			return new(
				type: propertyInfo.PropertyType,
				isNullable: nullabilityInfo.WriteState == NullabilityState.Nullable,
				elementType,
				elementType.IsValueType
					? Nullable.GetUnderlyingType(elementType) != null
					: nullabilityInfo.GenericTypeArguments[0].WriteState == NullabilityState.Nullable,
				propertyInfo.GetCustomAttributes(true).Cast<Attribute>()
			);
		}

		public DeclarationTypeInfo FromEnumerableDeclarationTypeInfo(DeclarationTypeInfo enumerableDeclarationTypeInfo)
		{
			Debug.Assert(enumerableDeclarationTypeInfo.ElementType != null);
			Debug.Assert(enumerableDeclarationTypeInfo.ElementIsNullable != null);

			return new(
				type: enumerableDeclarationTypeInfo.ElementType,
				isNullable: enumerableDeclarationTypeInfo.ElementIsNullable.Value,
				elementType: null,
				elementIsNullable: null,
				enumerableDeclarationTypeInfo.Attributes
			);
		}

		public DeclarationTypeInfo FromDictionaryPropertyInfo(PropertyInfo propertyInfo)
		{
			Debug.Assert(!propertyInfo.PropertyType.IsValueType);

			var nullabilityInfo = new NullabilityInfoContext().Create(propertyInfo);
			var valueType = GetGenericDictionaryValueType(propertyInfo.PropertyType);

			return new(
				type: propertyInfo.PropertyType,
				isNullable: nullabilityInfo.WriteState == NullabilityState.Nullable,
				elementType: valueType,
				valueType.IsValueType
					? Nullable.GetUnderlyingType(valueType) != null
					: nullabilityInfo.GenericTypeArguments[1].WriteState == NullabilityState.Nullable,
				propertyInfo.GetCustomAttributes(true).Cast<Attribute>()
			);
		}

		public DeclarationTypeInfo FromDictionaryDeclarationTypeInfo(DeclarationTypeInfo dictionaryDeclarationTypeInfo)
		{
			Debug.Assert(dictionaryDeclarationTypeInfo.ElementType != null);
			Debug.Assert(dictionaryDeclarationTypeInfo.ElementIsNullable != null);

			return new(
				type: dictionaryDeclarationTypeInfo.ElementType,
				isNullable: dictionaryDeclarationTypeInfo.ElementIsNullable.Value,
				elementType: null,
				elementIsNullable: null,
				dictionaryDeclarationTypeInfo.Attributes
			);
		}

		static Type GetGenericEnumerableElementType(Type enumerableType)
		{
			if (enumerableType.IsArray) return enumerableType.GetElementType()!;

			Type? type = enumerableType
				.GetInterfaces()
				.FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>));
			Debug.Assert(type != null);
			return type.GetGenericArguments()[0];
		}

		static Type GetGenericDictionaryValueType(Type dictionaryType)
		{
			Type? type = dictionaryType
				.GetInterfaces()
				.FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDictionary<,>));
			Debug.Assert(type != null);
			return type.GetGenericArguments()[1];
		}

		#endregion

		#region IWalker

		public void Walk<TState>(VisitDelegate<TState> visit, TState visitorState, object? root, DeclarationTypeInfo rootDeclarationTypeInfo)
		{
			int currentDepth = -1;
			int lastVisitDepth = 0;

			++currentDepth;
			var headCardinality = this.GetInstanceCardinality(root);
			var outcome = visit(visitorState, null, root, headCardinality, null, null, null, null, rootDeclarationTypeInfo);

			if (root != null && outcome)
			{
				lastVisitDepth = currentDepth;
				this.DescendVertexChildren(visit, visitorState, root, headCardinality, null, rootDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
			}

			--currentDepth;
			var finalOutcome = visit(visitorState, lastVisitDepth - currentDepth, null, null, null, null, null, null, rootDeclarationTypeInfo);
			Debug.Assert(finalOutcome, "Final visit must return true");
		}

		public void Descend<TState>(VisitDelegate<TState> visit, TState visitorState, object? head, Cardinality headCardinality, object label, Cardinality labelCardinality, object? tail, Cardinality tailCardinality, DeclarationTypeInfo declarationTypeInfo, ref int currentDepth, ref int lastVisitDepth)
		{
			++currentDepth;
			var outcome = visit(visitorState, lastVisitDepth - currentDepth + 1, head, headCardinality, label, labelCardinality, tail, tailCardinality, declarationTypeInfo);
			lastVisitDepth = currentDepth;

			if (head != null && outcome) this.DescendVertexChildren(visit, visitorState, head, headCardinality, tail, declarationTypeInfo, ref currentDepth, ref lastVisitDepth);

			--currentDepth;
		}

		void DescendVertexChildren<TState>(VisitDelegate<TState> visit, TState visitorState, object vertex, Cardinality vertexCardinality, object? tail, DeclarationTypeInfo declarationTypeInfo, ref int currentDepth, ref int lastVisitDepth)
		{
			switch (vertexCardinality)
			{
				case Cardinality.Zero:
					break;
				case Cardinality.AlephNull_Enumerable:
					{
						var elementDeclarationTypeInfo = this.FromEnumerableDeclarationTypeInfo(declarationTypeInfo);
						var enumerable = (IEnumerable)vertex!;
						var i = -1;
						foreach (var head in enumerable)
						{
							var headCardinality = this.GetInstanceCardinality(head);
							if (head is IWalker walker) walker.Descend(visit, visitorState, head, headCardinality, ++i, Cardinality.AlephNull_Enumerable, vertex, Cardinality.AlephNull_Enumerable, elementDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
							else this.Descend(visit, visitorState, head, headCardinality, ++i, Cardinality.AlephNull_Enumerable, vertex, Cardinality.AlephNull_Enumerable, elementDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
						}
					}
					break;
				case Cardinality.AlephNull_GenericEnumerable:
					{
						var elementDeclarationTypeInfo = this.FromEnumerableDeclarationTypeInfo(declarationTypeInfo);
						var enumerable = (IEnumerable)vertex!;
						var i = -1;
						foreach (var head in enumerable)
						{
							var headCardinality = this.GetInstanceCardinality(head);
							if (head is IWalker walker) walker.Descend(visit, visitorState, head, headCardinality, ++i, Cardinality.AlephNull_Enumerable, vertex, Cardinality.AlephNull_Enumerable, elementDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
							else this.Descend(visit, visitorState, head, headCardinality, ++i, Cardinality.AlephNull_Enumerable, vertex, Cardinality.AlephNull_Enumerable, elementDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
						}
					}
					break;
				case Cardinality.AlephOne_Object:
					{
						foreach (var prop in vertex!.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
						{
							if (prop.GetMethod != null && prop.GetIndexParameters().Length == 0)
							{
								object? head = null;
								try
								{
									head = prop.GetValue(vertex);
								}
								catch (Exception ex)
								{
									Debug.WriteLine(ex);
									continue;
								}
								var headCardinality = this.GetInstanceCardinality(head);
								DeclarationTypeInfo propertyDeclarationTypeInfo;
								switch (headCardinality)
								{
									case Cardinality.Zero:
									case Cardinality.AlephOne_Object:
										propertyDeclarationTypeInfo = this.FromPropertyInfo(prop);
										break;
									case Cardinality.AlephNull_Enumerable:
									case Cardinality.AlephNull_GenericEnumerable:
										propertyDeclarationTypeInfo = this.FromEnumerablePropertyInfo(prop);
										break;
									case Cardinality.AlephOne_Dictionary:
									case Cardinality.AlephOne_GenericDictionary:
										propertyDeclarationTypeInfo = this.FromDictionaryPropertyInfo(prop);
										break;
									default: throw new NotImplementedException();
								}
								if (head is IWalker walker) walker.Descend(visit, visitorState, head, headCardinality, prop.Name, Cardinality.AlephOne_Object, vertex, Cardinality.AlephOne_Object, propertyDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
								else this.Descend(visit, visitorState, head, headCardinality, prop.Name, Cardinality.AlephOne_Object, vertex, Cardinality.AlephOne_Object, propertyDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
							}
						}
					}
					break;
				case Cardinality.AlephOne_Dictionary:
					{
						var dict = (IDictionary)vertex!;
						foreach (DictionaryEntry de in dict)
						{
							var valueDeclarationTypeInfo = this.FromDictionaryDeclarationTypeInfo(declarationTypeInfo);
							var headCardinality = this.GetInstanceCardinality(de.Value);
							if (de.Value is IWalker walker) walker.Descend(visit, visitorState, de.Value, headCardinality, de.Key, Cardinality.AlephOne_Object, vertex, Cardinality.AlephOne_Object, valueDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
							else this.Descend(visit, visitorState, de.Value, headCardinality, de.Key, Cardinality.AlephOne_Object, vertex, Cardinality.AlephOne_Object, valueDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
						}
					}
					break;
				case Cardinality.AlephOne_GenericDictionary:
					{
						var valueDeclarationTypeInfo = this.FromDictionaryDeclarationTypeInfo(declarationTypeInfo);
						var genericDict = (IEnumerable)vertex!;
						Type? kvpt = null;
						PropertyInfo? pik = null;
						PropertyInfo? piv = null;
						foreach (var kvp in genericDict)
						{
							kvpt ??= kvp.GetType();
							pik ??= kvpt.GetProperty("Key");
							piv ??= kvpt.GetProperty("Value");
							var key = pik!.GetValue(kvp)!;
							var value = piv!.GetValue(kvp);
							var headCardinality = this.GetInstanceCardinality(value);
							if (value is IWalker walker) walker.Descend(visit, visitorState, value, headCardinality, key, Cardinality.AlephOne_Object, vertex, Cardinality.AlephOne_Object, valueDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
							else this.Descend(visit, visitorState, value, headCardinality, key, Cardinality.AlephOne_Object, vertex, Cardinality.AlephOne_Object, valueDeclarationTypeInfo, ref currentDepth, ref lastVisitDepth);
						}
					}
					break;
				default: throw new NotImplementedException();
			}
		}

		#endregion

		Cardinality GetTypeCardinality(Type type) =>
			IsAtomicType(type)
			? Cardinality.Zero
			: IsGenericDictionaryType(type)
			? Cardinality.AlephOne_GenericDictionary
			: IsDictionaryType(type)
			? Cardinality.AlephOne_Dictionary
			: IsGenericEnumerableType(type)
			? Cardinality.AlephNull_GenericEnumerable
			: IsEnumerableType(type)
			? Cardinality.AlephNull_Enumerable
			: Cardinality.AlephOne_Object;


		static bool IsAtomicType(Type type) =>
			type.IsPrimitive ||
			type == typeof(string) ||
			type == typeof(decimal) ||
			type == typeof(DateTime) ||
			type == typeof(DateTimeOffset) ||
			type == typeof(TimeSpan) ||
			type == typeof(DateOnly) ||
			type == typeof(TimeOnly) ||
			type == typeof(Guid) ||
			type.IsEnum ||
			Nullable.GetUnderlyingType(type) != null;
		
		static bool IsEnumerableType(Type type) => typeof(IEnumerable).IsAssignableFrom(type);

		static bool IsGenericEnumerableType(Type type) => type.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>));

		static bool IsDictionaryType(Type type) => typeof(IDictionary).IsAssignableFrom(type);

		static bool IsGenericDictionaryType(Type type) => type.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDictionary<,>));
	}
}
