using System.Reflection;
using System.Text;

using Falael.TranscribeProtocol;
using Falael.TranscribeProtocol.Explicit;

namespace Falael
{
	public class PropertyInfoEx
	{
		public PropertyInfoEx(GraphCursor graphCursor, DeclarationTypeInfo declarationTypeInfo)
		{
			this.GraphCursor = graphCursor;
			this.DeclarationTypeInfo = declarationTypeInfo;
		}

		public override string ToString()
		{
			return $"{this.GraphCursor}";
		}

		public GraphCursor GraphCursor { get; }
		public DeclarationTypeInfo DeclarationTypeInfo { get; }
	}

	public class ValidateErrorException : ValidateException
	{
		public ValidateErrorException(PropertyInfoEx[] propertyInfos, RequirementAttribute requirementAttribute, string? explanation = null) : base(propertyInfos, requirementAttribute, explanation) { }

		public ValidateErrorException(PropertyInfoEx[] propertyInfos, string? explanation = null) : base(propertyInfos, explanation) { }

		public ValidateErrorException(PropertyInfoEx propertyInfo, RequirementAttribute requirementAttribute, string? explanation = null) : base(propertyInfo, requirementAttribute, explanation) { }

		public ValidateErrorException(PropertyInfoEx propertyInfo, string? explanation = null) : base(propertyInfo, explanation) { }

		public ValidateErrorException(PropertyInfoEx[] propertyInfos, Requirement requirement, string? explanation = null) : base(propertyInfos, requirement, explanation) { }

		public ValidateErrorException(PropertyInfoEx propertyInfo, Requirement requirement, string? explanation = null) : base(propertyInfo, requirement, explanation) { }


		public override bool Succsess => false;
	}

	public class ValidateMessageException : ValidateException
	{
		public ValidateMessageException(PropertyInfoEx[] propertyInfos, RequirementAttribute requirementAttribute, string? explanation = null) : base(propertyInfos, requirementAttribute, explanation) { }


		public ValidateMessageException(PropertyInfoEx[] propertyInfos, string? explanation = null) : base(propertyInfos, explanation) { }

		public ValidateMessageException(PropertyInfoEx propertyInfo, RequirementAttribute requirementAttribute, string? explanation = null) : base(propertyInfo, requirementAttribute, explanation) { }

		public ValidateMessageException(PropertyInfoEx propertyInfo, string? explanation = null) : base(propertyInfo, explanation) { }

		public ValidateMessageException(PropertyInfoEx[] propertyInfos, Requirement requirement, string? explanation = null) : base(propertyInfos, requirement, explanation) { }

		public ValidateMessageException(PropertyInfoEx propertyInfo, Requirement requirement, string? explanation = null) : base(propertyInfo, requirement, explanation) { }

		public override bool Succsess => true;
	}

	public abstract class ValidateException : Exception
	{
		public ValidateException(PropertyInfoEx[] propertyInfos, RequirementAttribute requirementAttribute, string? explanation = null) : base()
		{
			this.PropertyInfos = propertyInfos;
			this.RequirementAttribute = requirementAttribute;
			this.explanation = explanation;
		}

		public ValidateException(PropertyInfoEx[] propertyInfos, string? explanation = null) : base()
		{
			this.PropertyInfos = propertyInfos;
			this.explanation = explanation;
		}

		public ValidateException(PropertyInfoEx propertyInfo, RequirementAttribute requirementAttribute, string? explanation = null) : base()
		{
			this.PropertyInfos = [propertyInfo];
			this.RequirementAttribute = requirementAttribute;
			this.explanation = explanation;
		}

		public ValidateException(PropertyInfoEx propertyInfo, string? explanation = null) : base()
		{
			this.PropertyInfos = [propertyInfo];
			this.explanation = explanation;
		}

		public ValidateException(PropertyInfoEx[] propertyInfos, Requirement requirement, string? explanation = null) : base()
		{
			this.PropertyInfos = propertyInfos;
			this.Requirement = requirement;
			this.explanation = explanation;
		}

		public ValidateException(PropertyInfoEx propertyInfo, Requirement requirement, string? explanation = null) : base()
		{
			this.PropertyInfos = [propertyInfo];
			this.Requirement = requirement;
			this.explanation = explanation;
		}

		public override string Message => $"Invalid model entity properties for \"/{string.Join(", ", (IEnumerable<PropertyInfoEx>)this.PropertyInfos)}\". {this.Explanation}";

		public PropertyInfoEx[] PropertyInfos { get; }
		public RequirementAttribute? RequirementAttribute { get; }
		public Requirement? Requirement { get; }
		public string Explanation
		{
			get
			{
				if(this.explanation != null) return this.explanation;
				if(this.RequirementAttribute == null && this.Requirement == null) return "Validation failed.";
				switch (this.RequirementAttribute?.Requirement ?? this.Requirement)
				{
					case Falael.Requirement.None: throw new InvalidOperationException();
					case Falael.Requirement.NotNull: return "Must not be null.";
					case Falael.Requirement.NonEmptyGuid: return "Must not be an empty guid.";
					case Falael.Requirement.NonBlankString: return "Must be a non-empty, non-all-whitespace string.";
					case Falael.Requirement.NonMinDateTime: return "Must not be min date value.";
					case Falael.Requirement.KnownEnumValue: return $"Must be a known \"{this.PropertyInfos.FirstOrDefault()?.DeclarationTypeInfo.Type. Name}\" enum value.";
					case Falael.Requirement.IntMin: return $"Must be less than or equal to {this.RequirementAttribute?.IntMax}.";
					case Falael.Requirement.IntMax: return $"Must be larger than or equal to {this.RequirementAttribute?.IntMin}.";
					case Falael.Requirement.IntRange: return $"Must be in interval [{this.RequirementAttribute?.IntMin}, {this.RequirementAttribute?.IntMax}].";
					case Falael.Requirement.DoubleMin: return $"Must be less than or equal to {this.RequirementAttribute?.DoubleMax}.";
					case Falael.Requirement.DoubleMax: return $"Must be larger than or equal to {this.RequirementAttribute?.DoubleMin}.";
					case Falael.Requirement.DoubleRange:return $"Must be in interval [{this.RequirementAttribute?.DoubleMin}, {this.RequirementAttribute?.DoubleMax}].";
					default: return $"Validation requirementAttribute {this.RequirementAttribute} not met.";
				}
			}
		}
		string? explanation;
		public abstract bool Succsess { get; }
	}

}
