namespace Falael
{
	[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
	public class RequirementAttribute : RequirementBaseAttribute
	{
		public RequirementAttribute(Requirement requirement, string? explanation = null, bool success = false)
			: base(requirement, explanation, success) { }

		public RequirementAttribute(Requirement requirement, int intMin, int intMax, string? explanation = null, bool success = false)
			: base(requirement, intMin, intMax, explanation, success) { }

		public RequirementAttribute(Requirement requirement, double doubleMin, double doubleMax, string? explanation = null, bool success = false)
			: base(requirement, doubleMin, doubleMax, explanation, success) { }
	}
}
