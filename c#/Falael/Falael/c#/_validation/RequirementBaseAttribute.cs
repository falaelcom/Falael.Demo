using System.Diagnostics;

namespace Falael
{
	[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
	public abstract class RequirementBaseAttribute : Attribute
	{
		public RequirementBaseAttribute(Requirement requirement, int intMin, int intMax, string? explanation = null, bool success = false)
			: this(requirement, explanation, success)
		{
			Debug.Assert(requirement == Requirement.IntRange);
			this.IntMin = intMin;
			this.IntMax = intMax;
		}

		public RequirementBaseAttribute(Requirement requirement, double doubleMin, double doubleMax, string? explanation = null, bool success = false)
			: this(requirement, explanation, success)
		{
			Debug.Assert(requirement == Requirement.DoubleRange);
			this.DoubleMin = doubleMin;
			this.DoubleMax = doubleMax;
		}

		public RequirementBaseAttribute(Requirement requirement, string? explanation = null, bool success = false)
		{
			this.Requirement = requirement;
			this.Explanation = explanation;
			this.Success = success;
		}

		public Requirement Requirement { get; }
		public string? Explanation { get; }
		public bool Success { get; }
		public int? IntMin { get; }
		public int? IntMax { get; }
		public double? DoubleMin { get; }
		public double? DoubleMax { get; }
	}
}
