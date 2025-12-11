using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Falael
{
	[AttributeUsage(AttributeTargets.Class)]
	public class ConfigurationClassAttribute : Attribute
	{
		public ConfigurationClassAttribute(bool nested = false)
		{
			this.Nested = nested;
		}

		public bool Nested { get; }
	}
}
