//	R0Q4/daniel/20250828
using System.Reflection;

namespace Falael.Utility.Rtoctu
{
	public class CommonProgramInfo
	{
		public CommonProgramInfo(Assembly executingAssembly)
		{
			var assemblyName = executingAssembly.GetName().Name ?? throw new NotImplementedException("executingAssembly.GetName().Name == null");

			string? name = assemblyName;
			Version? version = executingAssembly.GetName().Version;
			string versionText = $"{name} {version?.Major}.{version?.Minor}.{version?.Build}";

			this.AssemblyName = assemblyName;
			this.VersionText = versionText;
		}

		public string AssemblyName { get; }
		public string VersionText { get; }
	}
}
