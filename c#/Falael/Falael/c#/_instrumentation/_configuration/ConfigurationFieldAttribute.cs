using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Falael
{
	[AttributeUsage(AttributeTargets.Property)]
	public class ConfigurationFieldAttribute : Attribute
	{
		public ConfigurationFieldAttribute(string jsonPath)
		{
			if(jsonPath == string.Empty) throw new ArgumentException("empty", nameof(jsonPath));

			this.JsonPath = jsonPath;
		}

		public string JsonPath { get; }
	}
}
