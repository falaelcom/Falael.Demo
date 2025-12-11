using System.Reflection;

namespace Falael.Core.AppTasks
{
	[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
	public class AppTaskSchemaTagsAttribute : Attribute
	{
		public AppTaskSchemaTagsAttribute(int flavor, params string[] tags)
		{
			this.Flavor = flavor;
			this.Tags = tags;
		}

		public AppTaskSchemaTagsAttribute(params string[] tags)
		{
			this.Flavor = 0;
			this.Tags = tags;
		}

		public static string[] GetTags(int flavor, Type type)
		{
			var attribute = type.GetCustomAttributes<AppTaskSchemaTagsAttribute>().FirstOrDefault(attr => attr.Flavor == flavor);
			return attribute?.Tags ?? [];
		}

		public static string[] GetTags(Type type)
		{
			var attribute = type.GetCustomAttributes<AppTaskSchemaTagsAttribute>().FirstOrDefault(attr => attr.Flavor == 0);
			return attribute?.Tags ?? [];
		}

		public int Flavor { get; }
		public string[] Tags { get; }
	}
}