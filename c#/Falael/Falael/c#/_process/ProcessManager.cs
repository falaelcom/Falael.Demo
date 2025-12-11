using System;
using System.Diagnostics;
using System.Text;
using System.Threading;

namespace Falael
{
	public abstract class ProcessManager<TTag> : FalaelContextAware, IDisposable
	{
		const ulong LGID = 0xC40F90;

		public ProcessManager(
			IFalaelContext coreContext,
			Configuration configuration,
			ProcessStartingDelegate processStarting,
			ProcessStoppedDelegate  processStopped, 
			CancellationTokenSource? cancellationTokenSource
			)
			: base(coreContext)
		{
			this.configuration = configuration;
			this.ProcessStarting = processStarting;
			this.ProcessStopped = processStopped;
			this.cancellationTokenSource = cancellationTokenSource;
		}

		#region IDisposable

		~ProcessManager()
		{
			this.Dispose(false);
		}

		public void Dispose()
		{
			this.Dispose(true);
			GC.SuppressFinalize(this);
		}

		protected virtual void Dispose(bool disposing)
		{
			try
			{
				if (this.disposed) return;
				if (!disposing) return;
				this.cancellationTokenSource?.Cancel();
				this.sync.Dispose();
			}
			finally
			{
				this.disposed = true;
			}
		}

		#endregion

		#region Configuration

		[ConfigurationClass]
		public class Configuration
		{
			[ConfigurationField("executablePath")]
			public string ExecutablePath { get; init; } = string.Empty;

			[ConfigurationField("postProcessFinishDelay")]
			public TimeSpan PostProcessFinishDelay { get; init; } = TimeSpan.Zero;

			[ConfigurationField("maxConcurrentInstances")]
			public int? MaxConcurrentInstances { get; init; } = null;

			[ConfigurationField("maxConcurrentInstancesPerTag")]
			public int? MaxConcurrentInstancesPerTag { get; init; } = null;

			[ConfigurationField("gracefulKillTimeout")]
			public TimeSpan GracefulKillTimeout { get; init; } = TimeSpan.FromSeconds(1);

		}

		#endregion

		#region Nested Types

		public enum ManagedProcessStoppedReason
		{
			Exit,
			Kill,
			Kill_Cts,
			Kill_Cts_Timeout,
		}

		public class ManagedProcess
		{
			public ManagedProcess(Process process, TTag tag, string? cliArgs, string displayName, CancellationTokenSource? cancellationTokenSource)
			{
				this.Process = process;
				this.DisplayName = displayName;
				this.Tag = tag;
				this.CliArgs = cliArgs;
				this.CancellationTokenSource = cancellationTokenSource;
			}

			public override string ToString()
			{
				return $"Process {this.DisplayName}, PID {this.Process.Id}, tag {this.Tag}";
			}

			public readonly Process Process;
			public readonly TTag Tag;
			public readonly string? CliArgs;
			public readonly string DisplayName;
			public readonly CancellationTokenSource? CancellationTokenSource;
		}

		#endregion

		protected abstract string GetProcessArgs();

		protected async Task Execute(TTag tag, CancellationTokenSource? cancellationTokenSource = null)
		{
			if (this.configuration.MaxConcurrentInstances != null)
			{
				await this.sync.WaitAsync();
				try
				{
					if (this.processes.Count >= this.configuration.MaxConcurrentInstances) throw new ProcessLimitReachedException(this.configuration.MaxConcurrentInstances.Value);
				}
				finally
				{
					this.sync.Release();
				}
			}
			if (this.configuration.MaxConcurrentInstancesPerTag != null)
			{
				await this.sync.WaitAsync();
				try
				{
					if (this.processes.Where(v => v.Tag != null && v.Tag.Equals(tag)).Count() >= this.configuration.MaxConcurrentInstancesPerTag) throw new ProcessLimitReachedException(this.configuration.MaxConcurrentInstancesPerTag.Value);
				}
				finally
				{
					this.sync.Release();
				}
			}

			Task stdoutTask;
			Task stderrTask;
			StringBuilder stdoutSb = new();
			StringBuilder stderrSb = new();

			string args = this.GetProcessArgs();

			ManagedProcess managedProcess = new(new Process
			{
				StartInfo = new ProcessStartInfo
				{
					FileName = this.configuration.ExecutablePath,
					Arguments = args,
					UseShellExecute = false,
					RedirectStandardOutput = true,
					RedirectStandardError = true,
					CreateNoWindow = true
				}
			}, tag, args, Path.GetFileNameWithoutExtension(this.configuration.ExecutablePath), cancellationTokenSource ?? this.CoreContext.ManagedTasksCancellationTokenSource);
			try
			{
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xDE47BC),
					$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", "New managed process:"
				);
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x28677B),
					this.configuration.ExecutablePath, args
				);
				await this.sync.WaitAsync();
				try
				{
					this.processes.Add(managedProcess);
					this.OnProcessStarting(managedProcess, this.processes.Count);
					managedProcess.Process.Start();
					stdoutTask = _logStdoutStreamAsync(managedProcess.Process.StandardOutput);
					stderrTask = _logStderrStreamAsync(managedProcess.Process.StandardError);
					async Task _logStdoutStreamAsync(StreamReader stream)
					{
						string? line;
						while ((line = await stream.ReadLineAsync()) != null)
						{
							stdoutSb.AppendLine(line);
							this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xC2C852),
								$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", line
							);
						}
					}
					async Task _logStderrStreamAsync(StreamReader stream)
					{
						string? line;
						while ((line = await stream.ReadLineAsync()) != null)
						{
							stderrSb.AppendLine(line);
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x7C9B57),
								$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", line
							);
						}
					}
				}
				finally
				{
					this.sync.Release();
				}

				using var cts = CancellationTokenSource.CreateLinkedTokenSource(
					this.CoreContext.ManagedTasksCancellationTokenSource?.Token ?? CancellationToken.None,
					this.cancellationTokenSource?.Token ?? CancellationToken.None,
					managedProcess.CancellationTokenSource?.Token ?? CancellationToken.None
				);
				try
				{
					await this.CoreContext.StartManagedTask(managedProcess!.Process.WaitForExitAsync, cts.Token);
					await Task.WhenAll(stdoutTask, stderrTask);
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x2EC8D3),
						$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", "Process exited with exit code", managedProcess.Process.ExitCode
					);
					this.OnProcessStopped(managedProcess, ManagedProcessStoppedReason.Exit, managedProcess.Process.ExitCode, stdoutSb.ToString(), stderrSb.ToString());

					if (this.configuration.PostProcessFinishDelay != TimeSpan.Zero) await Task.Delay(this.configuration.PostProcessFinishDelay);
					await this.sync.WaitAsync();
					try
					{
						this.processes.Remove(managedProcess);
					}
					finally
					{
						this.sync.Release();
					}
				}
				catch (TaskCanceledBeforeCreationException)
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0xCECD5D),
						$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", "Managed process canceled before start."
					);
					this.OnProcessStopped(managedProcess, ManagedProcessStoppedReason.Kill_Cts, -1, null, null);
				}
				catch (TaskCanceledException)
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x6C139B),
						$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", "Managed process canceled, force termination..."
					);
					managedProcess.Process.Kill();
					if (!managedProcess.Process.WaitForExit((int)this.configuration.GracefulKillTimeout.TotalMilliseconds))
					{
						await Task.WhenAll(stdoutTask, stderrTask);
						this.Log.WriteLine(Severity.Alert, (LGID, 0xAE87B1),
							$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", "Managed process termination timed out."
						);
						this.OnProcessStopped(managedProcess, ManagedProcessStoppedReason.Kill_Cts_Timeout, -1, stdoutSb.ToString(), stderrSb.ToString());
						return;
					}
					await Task.WhenAll(stdoutTask, stderrTask);
					this.Log.WriteLine(Severity.Warning, (LGID, 0x00A827),
						$"[{managedProcess.DisplayName}:{managedProcess.Tag}]", "Managed process terminated."
					);
					this.OnProcessStopped(managedProcess, ManagedProcessStoppedReason.Kill_Cts, -1, stdoutSb.ToString(), stderrSb.ToString());
				}
			}
			finally
			{
				managedProcess.Process.Dispose();
			}
		}

		public static void KillAllSystemProcesses(ILog log, string executablePath)
		{
			var processName = Path.GetFileNameWithoutExtension(executablePath);
			try
			{
				foreach (var process in Process.GetProcessesByName(processName))
				{
					process.Kill();
					process.WaitForExit();
					log.WriteLine(LogDensity.LD_6_7, (LGID, 0x9C425D),
						$"[{processName}]", "System process terminated."
					);
				}
			}
			catch (Exception ex)
			{
				log.WriteLine(Severity.Error, (LGID, 0x99E7C2),
					$"[{processName}]", "Failed to terminate system process.", ex
				);
			}
		}

		#region Notifications

		public class ProcessArgs
		{
			public ProcessArgs(ManagedProcess managedProcess)
			{
				this.ManagedProcess = managedProcess;
			}
			public readonly ManagedProcess ManagedProcess;
		}

		public class ProcessStartingArgs : ProcessArgs
		{
			public ProcessStartingArgs(ManagedProcess managedProcess, int concurrentOrdinal)
				: base(managedProcess)
			{
				this.ConcurrentOrdinal = concurrentOrdinal;
			}
			public readonly int ConcurrentOrdinal;
		}
		public delegate void ProcessStartingDelegate(ProcessManager<TTag> sender, ProcessStartingArgs args);
		public virtual void OnProcessStarting(ManagedProcess managedProcess, int concurrentOrdinal) => this.ProcessStarting(this, new(managedProcess, concurrentOrdinal));
		readonly ProcessStartingDelegate ProcessStarting;


		public class ProcessStoppedArgs : ProcessArgs
		{
			public ProcessStoppedArgs(ManagedProcess managedProcess, ManagedProcessStoppedReason managedProcessStoppedReason, int exitCode, string? stdout, string? stderr)
				: base(managedProcess)
			{
				this.ManagedProcessStoppedReason = managedProcessStoppedReason;
				this.ExitCode = exitCode;
				this.Stdout = stdout;
				this.Stderr = stderr;
			}

			public readonly ManagedProcessStoppedReason ManagedProcessStoppedReason;
			public readonly int ExitCode;
			public readonly string? Stdout;
			public readonly string? Stderr;
		}
		public delegate void ProcessStoppedDelegate(ProcessManager<TTag> sender, ProcessStoppedArgs args);
		public virtual void OnProcessStopped(ManagedProcess managedProcess, ManagedProcessStoppedReason managedProcessStoppedReason, int exitCode, string? stdout, string? stderr) => this.ProcessStopped(this, new(managedProcess, managedProcessStoppedReason, exitCode, stdout, stderr));
		readonly ProcessStoppedDelegate ProcessStopped;

		#endregion

		public virtual string DisplayName => new UniPath(this.configuration.ExecutablePath).FileName;

		public int RunningProcessCount
		{
			get
			{
				this.sync.Wait();
				try
				{
					return this.processes.Count;
				}
				finally
				{
					this.sync.Release();
				}
			}
		}

		readonly Configuration configuration;
		readonly CancellationTokenSource? cancellationTokenSource;

		List<ManagedProcess> processes = [];

		readonly SemaphoreSlim sync = new(1, 1);

		bool disposed = false;
	}

	public class ProcessLimitReachedException(int limit, string? message = "Maximum process number reached.", Exception? innerExceptio = null) : Exception(message, innerExceptio)
	{
		public int Limit { get; } = limit;
	}

	public class ProcessLimitPerTagReachedException<TTag>(TTag tag, int limit, string? message = "Maximum process number reached.", Exception? innerExceptio = null) : Exception(message, innerExceptio)
	{
		public TTag Tag { get; } = tag;
		public int Limit { get; } = limit;
	}
}