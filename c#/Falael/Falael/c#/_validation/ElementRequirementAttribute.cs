namespace Falael
{
	[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
	public class ElementRequirementAttribute : RequirementAttribute
	{
		public ElementRequirementAttribute(Requirement requirement, string? explanation = null, bool success = false)
			: base(requirement, explanation, success) { }

		public ElementRequirementAttribute(Requirement requirement, int intMin, int intMax, string? explanation = null, bool success = false)
			: base(requirement, intMin, intMax, explanation, success) { }

		public ElementRequirementAttribute(Requirement requirement, double doubleMin, double doubleMax, string? explanation = null, bool success = false)
		: base(requirement, doubleMin, doubleMax, explanation, success) { }
	}
}
