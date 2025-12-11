using System.Diagnostics;
using System.Reflection;

namespace Falael
{
	/// <summary>
	/// Marks a public static parameterless method of a class to be run as part of the automated unit testing.
	/// </summary>
	/// <remarks>
	/// ATTENTION: Won't run tests of referenced but unused assemblies!
	/// </remarks>
	[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = false)]
	public class UnitTestAttribute : Attribute
	{
		const ulong LGID = 0x782CC3;

		/// <summary>
		/// Creates a new instance of the class.
		/// </summary>
		/// <param name="ordinal">This value is be used for determining the unit test order for multiple unit test methods within the same assembly.</param>
		public UnitTestAttribute(int ordinal = 0)
		{
			this.Ordinal = ordinal;
		}

		/// <summary>
		/// Unit test automation configuration class.
		/// </summary>
		public class Config
		{
			/// <summary>
			/// Tests the given assembly for unit test lookup fitness. The implementation is expected to return true if the assembly is accepted for unit test lookup and false otherwise.
			/// </summary>
			/// <remarks>
			/// Sample implementation:
			/// <code>
			/// new Diagnostics.UnitTestAttribute.Config { AcceptAssembly = a => a.FullName.StartsWith("Falael") }
			/// </code>
			/// </remarks>
			public Func<Assembly, bool>? AcceptAssembly { get; init; }

			/// <summary>
			/// An instance specifying a default unit test automation configuration.
			/// </summary>
			public static readonly Config Default = new();
		}

		/// <summary>
		/// Enumerates via reflection all public static methods with the <see cref="UnitTestAttribute"/> from the <paramref name="root"/> <see cref="Assembly"/> and it's dependency tree.
		/// </summary>
		/// <param name="root">The dependency tree traversal start point.</param>
		/// <param name="config">Contiguration for this method.</param>
		/// <param name="log">Logger.</param>
		/// <returns>A list of unit test methods.</returns>
		/// <remarks>
		/// Uses <see cref="Assembly.GetReferencedAssemblies"/>, which returns only the referenced assemblies that have actually been loaded, either at application start by an explicit reference to a class from the assembly or later through reflection. As a result only the unit test methods will be returned from referenced assemblies that match the aforementioned criteria.
		/// </remarks>
		/// <exception cref="NotSupportedException">Thrown if a public static method has <see cref="UnitTestAttribute"/> applied and has any parameters.</exception>
		public static MethodInfo[] EnumerateUnitTestMethods(Assembly root, Config? config = null, ILog? log = null)
		{
			config ??= Config.Default;

			var assemblyDependencies = new Dictionary<string, List<string>>();
			bool _dependsOn(string leftAssemblyName, string rightAssemblyName)
			{
				if (leftAssemblyName == rightAssemblyName) return false;
				if (!assemblyDependencies.TryGetValue(leftAssemblyName, out var dependencyList)) return false;
				for (int length = dependencyList.Count, i = 0; i < length; ++i)
				{
					var item = dependencyList[i];
					if (item == rightAssemblyName) return true;
					if (_dependsOn(item, rightAssemblyName)) return true;
				}
				return false;
			}

			var traversedItems = new HashSet<string>();
			void _traverseReferencedAssmblies(Assembly assembly, Action<Assembly> callback)
			{
				log?.WriteLine(LogDensity.LD_5_7, (LGID, 0xD97468),
					nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Scanning for assembly references", assembly.FullName
				);
				
				Debug.Assert(assembly.FullName != null);
				
				if (!assemblyDependencies.TryGetValue(assembly.FullName, out var dependencyList))
				{
					dependencyList = new List<string>();
					assemblyDependencies.Add(assembly.FullName, dependencyList);
				}
				var referencedAssembliyNames = assembly.GetReferencedAssemblies();
				for (int length = referencedAssembliyNames.Length, i = 0; i < length; ++i)
				{
					var an = referencedAssembliyNames[i];

					log?.WriteLine(LogDensity.LD_6_7, (LGID, 0x5CD33C),
						nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Reference", an.FullName
					);

					var a = Assembly.Load(an);
					if (config.AcceptAssembly != null && !config.AcceptAssembly.Invoke(a)) continue;

					dependencyList.Add(an.FullName);

					if (!traversedItems.Add(an.FullName)) continue;
					callback(a);
					_traverseReferencedAssmblies(a, callback);
				}

				log?.WriteLine(LogDensity.LD_5_7, (LGID, 0x92CC2F),
					nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Done."
				);
			}

			var result = new List<MethodInfo>();
			void _findUnitTestMethods(Assembly assembly)
			{
				log?.WriteLine(LogDensity.LD_5_7, (LGID, 0x6E00EA),
					nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Scanning assembly types", assembly.FullName
				);

				var types = assembly.GetExportedTypes();
				for (int ilength = types.Length, i = 0; i < ilength; ++i)
				{
					var iitem = types[i];

					log?.WriteLine(LogDensity.LD_6_7, (LGID, 0x66D657),
						nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Scanning type methods", iitem.Name
					);

					var methods = iitem.GetMethods(BindingFlags.Static | BindingFlags.Public);
					for (int jlength = methods.Length, j = 0; j < jlength; ++j)
					{
						var jitem = methods[j];

						log?.WriteLine(LogDensity.LD_7_7, (LGID, 0x846938),
							nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), $"Testing for [{nameof(UnitTestAttribute)}]", jitem.Name
						);

						var attribute = jitem.GetCustomAttribute<UnitTestAttribute>(false);
						if (attribute == null)
						{
							log?.WriteLine(LogDensity.LD_7_7, (LGID, 0x6385FE),
								nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "NO"
							);

							continue;
						}
						if (jitem.GetParameters().Length != 0) throw new NotSupportedException();
						result.Add(jitem);

						log?.WriteLine(LogDensity.LD_6_7, (LGID, 0x60E635),
							nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), $"YES [{nameof(UnitTestAttribute)} found.]", jitem.Name
						);
					}

					log?.WriteLine(LogDensity.LD_6_7, (LGID, 0x94AECF),
						nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Done."
					);
				}
				
				log?.WriteLine(LogDensity.LD_5_7, (LGID, 0xFD5F0C),
					nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Done."
				);
			}

			log?.WriteLine(LogDensity.LD_4_7, (LGID, 0x97057B),
				nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Looking for unit tests..."
			);

			_findUnitTestMethods(root);
			_traverseReferencedAssmblies(root, _findUnitTestMethods);

			result.Sort((a, b) =>
			{
				Debug.Assert(a.DeclaringType != null);
				Debug.Assert(b.DeclaringType != null);
				Debug.Assert(a.DeclaringType.FullName != null);
				Debug.Assert(b.DeclaringType.FullName != null);
				Debug.Assert(a.DeclaringType.Assembly.FullName != null);
				Debug.Assert(b.DeclaringType.Assembly.FullName != null);

				if (a.DeclaringType.IsSubclassOf(b.DeclaringType)) return 1;
				if (b.DeclaringType.IsSubclassOf(a.DeclaringType)) return -1;
				if (a.DeclaringType.Assembly.FullName == b.DeclaringType.Assembly.FullName)
				{
					var a_attribute = a.GetCustomAttribute<UnitTestAttribute>(false);
					var b_attribute = b.GetCustomAttribute<UnitTestAttribute>(false);

					Debug.Assert(a_attribute != null);
					Debug.Assert(b_attribute != null);

					if (a_attribute.Ordinal != b_attribute.Ordinal) return a_attribute.Ordinal - b_attribute.Ordinal;
				}

				if (_dependsOn(a.DeclaringType.Assembly.FullName, b.DeclaringType.Assembly.FullName)) return -1;
				var nameCompareResult = b.DeclaringType.FullName.CompareTo(a.DeclaringType.FullName);
				if (nameCompareResult != 0) return nameCompareResult;
				return b.Name.CompareTo(a.Name);
			});

			log?.WriteLine(LogDensity.LD_4_7, (LGID, 0x18FD6F),
				nameof(UnitTestAttribute), nameof(EnumerateUnitTestMethods), "Done."
			);

			return [.. result];
		}

		/// <summary>
		/// Runs all public static methods with the <see cref="UnitTestAttribute"/> enumerated via reflection from the <paramref name="root"/> <see cref="Assembly"/> and it's dependency tree.
		/// </summary>
		/// <param name="root">The dependency tree traversal start point.</param>
		/// <param name="config">Contiguration for this method.</param>
		/// <param name="log">Logger.</param>
		/// <remarks>
		/// <para>
		/// Uses <see cref="Assembly.GetReferencedAssemblies"/>, which returns only the referenced assemblies that have actually been loaded, either at application start by an explicit reference to a class from the assembly or later through reflection. As a result only the unit tests from referenced assemblies that match the aforementioned criteria will be executed.
		/// </para>
		/// <para>
		/// Unit tests are expected to throw an <see cref="InvalidOperationException"/> on failure.
		/// </para>
		/// 
		/// ATTENTION: Won't run tests of referenced but unused assemblies!
		/// </remarks>
		public static void Run(Assembly root, Config? config = null, ILog? log = null)
		{
			var unitTestMethods = EnumerateUnitTestMethods(root, config, log);

			log?.WriteLine(LogDensity.LD_3_7, (LGID, 0xF50064),
				nameof(UnitTestAttribute), nameof(Run), "Running", unitTestMethods.Length, "resolved unit tests methods..."
			);
			log?.WriteLine(Severity.Alert, (LGID, 0x96D2F1),
				nameof(UnitTestAttribute), nameof(Run), "Won't run tests of referenced but unused assemblies!"
			);

			for (int length = unitTestMethods.Length, i = 0; i < length; ++i)
			{
				try
				{
					var item = unitTestMethods[i];
					Debug.Assert(item.DeclaringType != null);

					log?.WriteLine(Severity.Neutral, (LGID, 0x4409E4),
						nameof(UnitTestAttribute), nameof(Run), $"{item.DeclaringType.FullName}.{item.Name}"
					);

					item.Invoke(null, null);
				}
				catch(TargetInvocationException ex)
				{
					throw new InvalidOperationException("Unit test failed.", ex.InnerException);
				}
			}

			log?.WriteLine(LogDensity.LD_3_7, (LGID, 0xA6BC9C),
				nameof(UnitTestAttribute), nameof(Run), "Done."
			);
		}

		/// <summary>
		/// This value is be used for determining the unit test order for multiple unit test methods within the same assembly.
		/// </summary>
		public int Ordinal { get; }
	}
}
