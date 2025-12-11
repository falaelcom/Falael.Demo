//	R0Q4/daniel/20250828
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Falael.IO;

using static Falael.IO.FileSystemObserver;

namespace Falael.Utility.Rtoctu
{
	[ConfigurationClass]
	public class ProgramConfiguration
	{
		[ConfigurationField("app.managedTasksGracefulTerminationTimeout")]
		public TimeSpan App_ManagedTasksGracefulTerminationTimeout { get; init; } = TimeSpan.FromSeconds(5);
	}

	public class ProgramOptions : CommonProgramOptions
	{
		public ProgramOptions() : base(true) { }

		public override string GetHelpPrintout()
		{
			HelpBuilder hb = new(this);

			hb.AppendHelpPreamble();
			//hb.AppendLine("-d, --root-dir ROOTDIR" + "\t\t" + $"Required. The directory path to be monitored.");
			hb.AppendHelpCommons();
			hb.AppendHelpPostamble();

			return hb.ToString();
		}

		public void Parse(string[] args)
		{
			var sources = new List<string>();

			base.ParseInternal(gnuAssignableOptions:
			[
				//new("d"),
				//new("root-dir"),
			],
			args,
			onFlag: name =>
			{
			},
			onAssignable: (name, value) =>
			{
				switch (name)
				{
					//case "d":
					//case "root-dir":
					//	this.RootDir = value;
					//	break;
					default:
						throw new NotImplementedException(name);
				}
			});
		}

		//public string? RootDir { get; private set; } = null;
	}

	public class ProgramProfile(CommonProgramInfo programInfo) : CommonProgramProfile(programInfo)
	{
		public override Outcome ProcessOptions(CommonProgramOptions rsProgramOptions)
		{
			switch (base.ProcessOptions(rsProgramOptions))
			{
				case Outcome.Exit: return Outcome.Exit;
				case Outcome.Continue: break;
				default: throw new NotImplementedException();
			}

			var programOptions = (ProgramOptions)rsProgramOptions;

			try
			{
				//if (programOptions.RootDir == null || !Directory.SourceExists(programOptions.RootDir))
				//{
				//	Console.WriteLine(this.ProgramInfo.VersionText);
				//	Console.WriteLine();
				//	Console.WriteLine($"ERROR: Must specify a valid -d or --root-dir value pointing to an existing directory.");
				//	Environment.Exit(-6);
				//	return Outcome.Exit;
				//}
				return Outcome.Continue;
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex);
				Console.WriteLine(programOptions.GetHelpPrintout());
				return Outcome.Exit;
			}
		}

		public override (Outcome, ConfigurationRepository) CreateConfigurationRepository(string configFilePath, bool requireExclusiveConfigFileLock, bool createConfigFileFlag, Func<ConfigurationRepository, ConfigurationRepository>? onCascadeConfiguration = null)
		{
			return base.CreateConfigurationRepository(configFilePath, requireExclusiveConfigFileLock, createConfigFileFlag, onCascadeConfiguration);
		}

		public override (ILog log, int? maxLogDensity) CreateLog(string verbosity)
		{
			return base.CreateLog(verbosity);
		}
	}

	public class ProgramContext : FalaelContext
	{
		public ProgramContext()
		{
			this.ProgramProfile = null!;
			this.ProgramOptions = null!;
			this.Conf = null!;
		}

		public void InitializeProgramContext(
			ConfigurationRepository configurationRepository,
			ILog log,
			CancellationTokenSource cancellationTokenSource,
			ProgramProfile programProfile,
			ProgramOptions programOptions,
			ProgramConfiguration conf
			)
		{
			base.Initialize(configurationRepository, log, cancellationTokenSource);

			this.ProgramProfile = programProfile;
			this.ProgramOptions = programOptions;
			this.Conf = conf;
		}

		public ProgramProfile ProgramProfile { get; private set; }
		public ProgramOptions ProgramOptions { get; private set; }
		public ProgramConfiguration Conf { get; private set; }
	}

	public class Program
	{
		const ulong LGID = 0x964E37;

		/// <summary>
		/// The main sync entry point for the application.
		/// </summary>
		static void Main(string[] args)
		{
			ProgramProfile programProfile = new(new CommonProgramInfo(Assembly.GetExecutingAssembly()));

			//	CLI ProgramOptions
			ProgramOptions programOptions = new();
			programOptions.Parse(args);
			switch (programProfile.ProcessOptions(programOptions))
			{
				case CommonProgramProfile.Outcome.Exit: return;
				case CommonProgramProfile.Outcome.Continue: break;
				default: throw new NotImplementedException();
			}

			//	Configuration - safe to remove if no configuration is provisioned
			Debug.Assert(programOptions.ConfigFilePath != null);
			(
				CommonProgramProfile.Outcome outcome1,
				ConfigurationRepository configurationRepository
			) = programProfile.CreateConfigurationRepository(
				programOptions.ConfigFilePath,
				requireExclusiveConfigFileLock: false,
				createConfigFileFlag: programOptions.CreateConfigFileFlag,
				onCascadeConfiguration: configurationRepository => configurationRepository  //	add code to cascade more configuration artifacts via `configurationRepository.CascadeDefaultConfiguration`, `configurationRepository.CascadeDictionary`, `configurationRepository.CascadeConfiguration`, `configurationRepository.CascadeJSON` if such code is required; all `Cascade*` methods return the configurationRepository instance
			);
			switch (outcome1)
			{
				case CommonProgramProfile.Outcome.Exit: return;
				case CommonProgramProfile.Outcome.Continue: break;
				default: throw new NotImplementedException();
			}
			//	last chance to modify the configuration repository before expanding aliases
			configurationRepository.ExpandAliases();
			var conf = configurationRepository.Compose<ProgramConfiguration>();

			//	validate and ensure directories
			var orchestratorConf = configurationRepository.Compose<Orchestrator.Configuration>();
			if (!Directory.Exists(orchestratorConf.Orchestrator_Agent_SourceRootDir)) throw new InvalidOperationException($"Cannot access SourceRootDir: {orchestratorConf.Orchestrator_Agent_SourceRootDir}");
			if (!Directory.Exists(orchestratorConf.Orchestrator_Agent_TargetRootDir)) throw new InvalidOperationException($"Cannot access TargetRootDir: {orchestratorConf.Orchestrator_Agent_TargetRootDir}");
			Directory.CreateDirectory(orchestratorConf.Orchestrator_Agent_TempDir);
			Directory.CreateDirectory(orchestratorConf.Orchestrator_Agent_LogsDir);

			//	Logging
			(ILog log, int? maxLogDensity) = programProfile.CreateLog(programOptions.Verbosity);
			programProfile.LogSessionStart(LGID, log, maxLogDensity, programOptions, configurationRepository);

			//	UniPathContext
			using var cts = new CancellationTokenSource();
			ProgramContext programContext = new();
			programContext.InitializeProgramContext(
				configurationRepository,
				log,
				cts,
				programProfile,
				programOptions,
				conf
			);

			//	Global Event Handlers
			programProfile.InstallGlobalEventHandlers(LGID, log, programContext);

			try
			{
				AsyncMain(programContext).GetAwaiter().GetResult();
			}
			catch (Exception ex)
			{
				log.WriteLine(Severity.Fatal, (LGID, 0xD30AD8), ex);
				Environment.Exit(-4);
			}

			log.WriteLine(Severity.Neutral, (LGID, 0x9ABD64), "Session ended.");
		}

		/// <summary>
		/// The main async entry point for the application.
		/// </summary>
		static async Task AsyncMain(ProgramContext programContext)
		{
			var programOptions = programContext.ProgramOptions;
			var conf = programContext.Conf;

			new Orchestrator(
				programContext,
				configuration: programContext.ConfigurationRepository.Compose<Orchestrator.Configuration>()
			);

			await programContext.AwaitAllManagedTasks(conf.App_ManagedTasksGracefulTerminationTimeout);
		}
	}
}