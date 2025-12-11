using System.Diagnostics;
using System.Reflection;

using Falael.TranscribeProtocol;
using Falael.TranscribeProtocol.Explicit;

namespace Falael
{
	public partial interface IValidatable<TContext>
	{
		public static readonly Result Success = new();

		Result ValidateInstance(TContext context, GraphCursor.Builder graphCursor);
	}

	public static class IValidatable
	{
		class VisitorState<TValidatorContext>
		{
			public VisitorState(TValidatorContext validatorContext, IFabric fabric)
			{
				this.GraphCursor = null;
				this.Visited = [];
				this.ValidatorContext = validatorContext;
				this.Fabric = fabric;
			}

			public void CreateGraphCursor(object? root)
			{
				Debug.Assert(this.GraphCursor == null);
				this.GraphCursor = new(this.Fabric ?? Falael.TranscribeProtocol.Fabric.The, root);
			}

			public void AddGraphCursorHead(object? head, object label)
			{
				Debug.Assert(this.GraphCursor != null);
				this.GraphCursor.Add(head, label);
			}

			public void ReplaceGraphCursorHead(object? head, object label)
			{
				Debug.Assert(this.GraphCursor != null);
				this.GraphCursor.ReplaceLast(head, label);
			}

			public Cardinality GraphCursorHeadCardinality
			{
				get
				{
					Debug.Assert(this.GraphCursor != null);
					return this.Fabric.GetInstanceCardinality(this.GraphCursor.Head);
				}
			}

			public GraphCursor.Builder? GraphCursor { get; private set; }
			public List<object> Visited { get; }
			public TValidatorContext ValidatorContext { get; }
			public IFabric Fabric { get; }
			public IValidatable<TValidatorContext>.Result Result { get; set; } = IValidatable<TValidatorContext>.Success;
		}

		public static IValidatable<TValidatorContext>.Result Validate<TRoot, TValidatorContext>(this TRoot? root, DeclarationTypeInfo rootDeclarationTypeInfo, TValidatorContext validatorContext, IFabric? fabric = default)
		{
			fabric = fabric == null ? Fabric.The : fabric;

			VisitorState<TValidatorContext> visitorState = new(validatorContext, fabric);
			fabric.Walk(_visit, visitorState, root, rootDeclarationTypeInfo);
			return visitorState.Result;

			bool _visit(
				VisitorState<TValidatorContext> visitorState,
				int? deltaOut,
				object? head,
				Cardinality? headCardinality,
				object? label,
				Cardinality? labelCardinality,
				object? tail,
				Cardinality? tailCardinality, 
				DeclarationTypeInfo declarationTypeInfo
			)
			{
				if (headCardinality == null) // unroot
				{
					if (visitorState.GraphCursor == null) return true;
					return true;	//	`true` is required here
				}

				if (labelCardinality == null) // root
				{
					if (headCardinality == Cardinality.Zero)
					{
						visitorState.CreateGraphCursor(head);
						// visit `head` with `visitorState.GraphCursor.ToGraphCursor()`
						_validateHeadInstance(head, declarationTypeInfo, visitorState);
						//return true;
						return visitorState.Result.Success;
					}

					visitorState.Visited.Add(head!);
					visitorState.CreateGraphCursor(head);
					// visit `head` with `visitorState.GraphCursor.ToGraphCursor()`
					_validateHeadInstance(head, declarationTypeInfo, visitorState);
					return visitorState.Result.Success;
				}

				if (deltaOut == 1) // keeping same depth; cursor points to atom or empty composite
				{
					Debug.Assert(label != null);
					Debug.Assert(visitorState.GraphCursor != null);
					if (headCardinality != Cardinality.Zero)
					{
						if (head != null && visitorState.Visited.LastIndexOf(head, Math.Max(0, visitorState.Visited.Count - 2)) != -1) return false;
						if (visitorState.GraphCursorHeadCardinality != Cardinality.Zero) visitorState.Visited[^1] = head!;
						else visitorState.Visited.Add(head!);
						visitorState.ReplaceGraphCursorHead(head, label);
					}
					// visit `head` with `visitorState.GraphCursor.ToGraphCursor()`
					_validateHeadInstance(head, declarationTypeInfo, visitorState);
					//	return true;
					return visitorState.Result.Success;
				}

				if (deltaOut == 0) // going deeper; cursor points to a non-empty composite
				{
					if (headCardinality != Cardinality.Zero)
					{
						if (head != null && visitorState.Visited.LastIndexOf(head, Math.Max(0, visitorState.Visited.Count - 1)) != -1) return false;
						visitorState.Visited.Add(head!);
					}
					Debug.Assert(label != null);
					visitorState.AddGraphCursorHead(head, label);
					// visit `head` with `visitorState.GraphCursor.ToGraphCursor()`
					_validateHeadInstance(head, declarationTypeInfo, visitorState);
					return visitorState.Result.Success;
				}

				// climb
				Debug.Assert(deltaOut != null);
				Debug.Assert(visitorState.GraphCursor != null);
				visitorState.Visited.RemoveRange(visitorState.Visited.Count - deltaOut.Value + 1, deltaOut.Value - 1);
				visitorState.GraphCursor.RemoveLast(deltaOut.Value - 1);//	climbing

				if (headCardinality != Cardinality.Zero)
				{
					if (head != null && visitorState.Visited.LastIndexOf(head, Math.Max(0, visitorState.Visited.Count - 1)) != -1) return false;
					visitorState.Visited.Add(head!);
				}
				Debug.Assert(label != null);
				visitorState.ReplaceGraphCursorHead(head, label);
				// visit `head` with `visitorState.GraphCursor.ToGraphCursor()`
				_validateHeadInstance(head, declarationTypeInfo, visitorState);
				//return true;
				return visitorState.Result.Success;
			}

			void _validateHeadInstance(object? head, DeclarationTypeInfo declarationTypeInfo, VisitorState<TValidatorContext> visitorState)
			{
				var attrs = declarationTypeInfo.Attributes.Where(v => v is RequirementAttribute).Cast<RequirementAttribute>();
				
				if (attrs.Any(v => v.Requirement == Requirement.None)) return;

				RequirementAttribute? notNullableAttr = attrs.FirstOrDefault(v => v.Requirement == Requirement.NotNull);

				bool isNullable = notNullableAttr != null ? true : declarationTypeInfo.IsNullable;
				bool isEnum = declarationTypeInfo.Type.IsEnum;

				Debug.Assert(visitorState.GraphCursor != null);

				if (head == null && !isNullable)
				{
					ValidateException exception = notNullableAttr != null && notNullableAttr.Success
						? new ValidateMessageException(new PropertyInfoEx(visitorState.GraphCursor.ToGraphCursor(), declarationTypeInfo), Requirement.NotNull)
						: new ValidateErrorException(new PropertyInfoEx(visitorState.GraphCursor.ToGraphCursor(), declarationTypeInfo), Requirement.NotNull);
					visitorState.Result = visitorState.Result.WithAddDetail(exception);
					return;
				}

				if (isEnum && (head == null || !declarationTypeInfo.Type.IsEnumDefined(head)))
				{
					ValidateException exception = notNullableAttr != null && notNullableAttr.Success
						? new ValidateMessageException(new PropertyInfoEx(visitorState.GraphCursor.ToGraphCursor(), declarationTypeInfo), Requirement.KnownEnumValue)
						: new ValidateErrorException(new PropertyInfoEx(visitorState.GraphCursor.ToGraphCursor(), declarationTypeInfo), Requirement.KnownEnumValue);
					visitorState.Result = visitorState.Result.WithAddDetail(exception);
				}

				foreach (var attr in attrs)
				{
					var hasError = false;
					switch (attr.Requirement)
					{
						case Requirement.None:
							Debug.Assert(false);
							break;
						case Requirement.NotNull:
						case Requirement.KnownEnumValue:
							continue;
						case Requirement.NonEmptyGuid:
							hasError &= head is Guid guid && guid == Guid.Empty;
							break;
						case Requirement.NonBlankString:
							hasError &= head is string text && string.IsNullOrWhiteSpace(text);
							break;
						case Requirement.NonMinDateTime:
							hasError &= head is DateTime dt && dt == DateTime.MinValue;
							break;
						case Requirement.IntMin:
							if (head != null)
							{
								hasError &= attr.IntMin != null && (int)head < attr.IntMin;
							}
							break;
						case Requirement.IntMax:
							if (head != null)
							{
								hasError &= attr.IntMax != null && (int)head > attr.IntMax;
							}
							break;
						case Requirement.IntRange:
							if (head != null)
							{
								hasError &= attr.IntMin != null && (int)head < attr.IntMin;
								hasError &= attr.IntMax != null && (int)head > attr.IntMax;
							}
							break;
						case Requirement.DoubleMin:
							if (head != null)
							{
								hasError &= attr.DoubleMin != null && (int)head < attr.DoubleMin;
							}
							break;
						case Requirement.DoubleMax:
							if (head != null)
							{
								hasError &= attr.DoubleMax != null && (int)head > attr.DoubleMax;
							}
							break;
						case Requirement.DoubleRange:
							if (head != null)
							{
								hasError &= attr.DoubleMin != null && (int)head < attr.DoubleMin;
								hasError &= attr.DoubleMax != null && (int)head > attr.DoubleMax;
							}
							break;
						default: throw new NotImplementedException();
					}
					if (hasError)
					{
						ValidateException exception = attr.Success
							? new ValidateMessageException(new PropertyInfoEx(visitorState.GraphCursor.ToGraphCursor(), declarationTypeInfo), attr.Requirement)
							: new ValidateErrorException(new PropertyInfoEx(visitorState.GraphCursor.ToGraphCursor(), declarationTypeInfo), attr.Requirement);
						visitorState.Result = visitorState.Result.WithAddDetail(exception);
					}
				}

				if (head is IValidatable<TValidatorContext> validatable) visitorState.Result = visitorState.Result.WithCascadeResult(validatable.ValidateInstance(validatorContext, visitorState.GraphCursor));
			}
		}
	}
}
