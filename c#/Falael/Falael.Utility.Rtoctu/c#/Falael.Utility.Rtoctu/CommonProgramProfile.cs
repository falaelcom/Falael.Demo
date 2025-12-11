//	R0Q4/daniel/20250828
using System.Reflection;
using System.Text.RegularExpressions;

namespace Falael.Utility.Rtoctu
{
	public class CommonProgramProfile
	{
		public CommonProgramProfile(CommonProgramInfo programInfo)
		{
			this.ProgramInfo = programInfo;
		}

		#region Nested Types

		public enum Outcome
		{
			Exit,
			Continue
		}

		#endregion

		public virtual Outcome ProcessOptions(CommonProgramOptions rsProgramOptions)
		{
			try
			{
				if (rsProgramOptions.HelpFlag)
				{
					Console.WriteLine(this.ProgramInfo.VersionText);
					Console.WriteLine(rsProgramOptions.GetHelpPrintout());
					return Outcome.Exit;
				}
				if (rsProgramOptions.VersionFlag)
				{
					Console.WriteLine(this.ProgramInfo.VersionText);
					return Outcome.Exit;
				}
				if (rsProgramOptions.RequiresConfiguration && rsProgramOptions.ConfigFilePath == null)
				{
					Console.WriteLine(this.ProgramInfo.VersionText);
					Console.WriteLine();
					Console.WriteLine("ERROR: Configuration file must be specified via -c or --config-file.");
					Environment.Exit(-5);
					return Outcome.Exit;
				}

				return Outcome.Continue;
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex);
				Console.WriteLine(rsProgramOptions.GetHelpPrintout());
				return Outcome.Exit;
			}
		}

		public virtual (Outcome, ConfigurationRepository) CreateConfigurationRepository(string configFilePath, bool requireExclusiveConfigFileLock, bool createConfigFileFlag, Func<ConfigurationRepository, ConfigurationRepository>? onCascadeConfiguration = null)
		{
			using ConfigurationLock configurationLock = new(
				configFilePath: configFilePath,
				create: createConfigFileFlag,
				exclusive: requireExclusiveConfigFileLock
			);

			ConfigurationRepository configurationRepository;
			if (createConfigFileFlag)
			{
				var configDirectory = Path.GetDirectoryName(configFilePath);
				if (!string.IsNullOrWhiteSpace(configDirectory)) Directory.CreateDirectory(configDirectory!);
				configurationRepository = new ConfigurationRepository()
					.CascadeDefaultConfiguration("Falael");
				if (onCascadeConfiguration != null) configurationRepository = onCascadeConfiguration.Invoke(configurationRepository);
				configurationLock.WriteAllText(configurationRepository.ToJSON());
				Console.WriteLine($"Configuration file created: {configFilePath}");
				return (Outcome.Exit, configurationRepository);
			}

			Dictionary<string, object?> systemConfiguration = new()
			{
				{ "system.startupDirectory", Directory.GetCurrentDirectory() },
				{ "system.executableDirectory", Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? throw new InvalidOperationException() },
			};
			configurationRepository = new ConfigurationRepository()
				.CascadeDictionary(systemConfiguration)
				.CascadeJSON(configurationLock.ReadAllText());

			return (Outcome.Continue, configurationRepository);
		}

		public virtual (ILog log, int? maxLogDensity) CreateLog(string verbosity)
		{
			int maxLogDensity = LogDensity.LD_4_7;
			Severity maxSeverity = Severity.Diagnostic;

			switch (verbosity)
			{
				case "Insane":
					maxSeverity = Severity.Diagnostic;
					maxLogDensity = LogDensity.LD_7_7;
					break;
				case "Trace":
					maxSeverity = Severity.Diagnostic;
					maxLogDensity = LogDensity.LD_6_7;
					break;
				case "Debug":
					maxSeverity = Severity.Diagnostic;
					maxLogDensity = LogDensity.LD_5_7;
					break;
				case "Info":
					maxSeverity = Severity.Neutral;
					break;
				case "Warning":
					maxSeverity = Severity.Warning;
					break;
				case "Alert":
					maxSeverity = Severity.Alert;
					break;
				case "Error":
					maxSeverity = Severity.Error;
					break;
				case "Critical":
					maxSeverity = Severity.Critical;
					break;
				default:
					Console.WriteLine($"Invalid verbosity level: {verbosity}, assuming \"Info\".");
					break;
			}

			var log = new ConsoleLog(maxSeverity, maxLogDensity);

			return (log, maxLogDensity);
		}

		public virtual void LogSessionStart(ulong LGID, ILog log, int? maxLogDensity, CommonProgramOptions programOptions, ConfigurationRepository? configurationRepository = null)
		{
			log.WriteLine(Severity.Neutral, (LGID, 0x9E8F62), "Session started.");
			log.WriteLine(Severity.Neutral, (LGID, 0xC6E7F8), "Log verbosity:", $"{programOptions.Verbosity}.");
			if(configurationRepository != null) log.WriteLine(Severity.Neutral, (LGID, 0xFFA2CF), "Loaded Configuration:", Environment.NewLine + configurationRepository.ToJSON(
				spreadCursors: false,
				stripCursorMatch: new(".*(secret|apikey|bottoken|password).*", RegexOptions.IgnoreCase)
			));
		}

		public virtual void InstallGlobalEventHandlers(ulong LGID, ILog log, ProgramContext programContext)
		{
			Console.CancelKeyPress += (sender, e) =>
			{
				e.Cancel = true;
				log.WriteLine(Severity.Neutral, (LGID, 0x466981), "Ctrl-C");
				programContext.ManagedTasksCancellationTokenSource?.Cancel();
			};
			AppDomain.CurrentDomain.UnhandledException += (sender, e) =>    //	non-UI thread exceptions
			{
				log.WriteLine(Severity.Fatal, (LGID, 0x0DF2D2), e.ExceptionObject);
				programContext.ManagedTasksCancellationTokenSource?.Cancel();
			};
			TaskScheduler.UnobservedTaskException += (sender, e) =>
			{
				log.WriteLine(Severity.Fatal, (LGID, 0xBA44FA), e.Exception);
				e.SetObserved(); // Prevents the process from terminating
				programContext.ManagedTasksCancellationTokenSource?.Cancel();
			};
		}

		public CommonProgramInfo ProgramInfo { get; }
	}
}
