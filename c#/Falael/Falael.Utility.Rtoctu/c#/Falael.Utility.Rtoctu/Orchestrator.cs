//	R0Q4/daniel/20250915
//	TODO:
//		- agents to
//			- fix `<th{{` in oc_v4.1.0.3 - official, accento - file `C:\dev\www\oc_v4.1.0.3-accento\admin\view\template\design\layout_form.twig`
//		- tags in twigs to add css class to
//			- form
//			- div
//			- nav
//			- <hr*/>
//			- footer
//			- a
//			- ul
//			- li
//			- <input*/>
//			- header
//			- <button*/>
//			- fieldset
//			- table
//			- p
//			- h1
//			- h2
//			- h3
//			- h4
//			- <hr/>
//			- aside

using System.Diagnostics;

using Falael.IO;

using static Falael.IO.FileSystemObserver;
using static Falael.Utility.Rtoctu.Agent;

namespace Falael.Utility.Rtoctu
{
	public class Orchestrator : FalaelContextAware
	{
		const ulong LGID = 0xAE653B;

		const string CACHE_FILE_NAME = "rtoctu.cache.json";

		public Orchestrator(ProgramContext programContext, Configuration configuration)
			: base(programContext)
		{
			this.configuration = configuration;

			var tempDir = new Path(this.configuration.Orchestrator_Agent_TempDir).GetFullPath();
			var agentContext = new AgentContext(
				cache: new(programContext, tempDir.SetFileName(CACHE_FILE_NAME)),
				sourceRootDir: new Path(this.configuration.Orchestrator_Agent_SourceRootDir).GetFullPath(),
				targetRootDir: new Path(this.configuration.Orchestrator_Agent_TargetRootDir).GetFullPath(),
				tempDir,
				logsDir: new Path(this.configuration.Orchestrator_Agent_LogsDir).GetFullPath()
			);

			#region Agents

			this.agents =
			[
				//	see file todo for future agents 
				new Agent_001_0x134F0F_HtmlSanitation_THs(
					programContext,
					agentContext,
					configuration: programContext.ConfigurationRepository.Compose<Agent_001_0x134F0F_HtmlSanitation_THs.Configuration>()
				),
				new Agent_002_0xE827C5_HtmlSanitation_ClosingTags(
					programContext,
					agentContext,
					configuration: programContext.ConfigurationRepository.Compose<Agent_002_0xE827C5_HtmlSanitation_ClosingTags.Configuration>()
				),
				new Agent_998_0xEE13DC_JavaScript(
					programContext,
					agentContext,
					configuration: programContext.ConfigurationRepository.Compose<Agent_998_0xEE13DC_JavaScript.Configuration>()
				),
				new Agent_999_0x025EB4_Stylesheet(
					programContext,
					agentContext,
					configuration: programContext.ConfigurationRepository.Compose<Agent_999_0x025EB4_Stylesheet.Configuration>()
				),
			];

			#endregion

			this.source_fileSystemObserver = new FileSystemObserver(
				programContext,
				configuration: programContext.ConfigurationRepository.Compose<FileSystemObserver.Configuration>("source"),
				agentContext.SourceRootDir, 
				new ChangedDelegate(this.source_fileSystemObserver_changedCallback)
			);

			this.target_fileSystemObserver = new FileSystemObserver(
				programContext,
				configuration: programContext.ConfigurationRepository.Compose<FileSystemObserver.Configuration>("target"),
				agentContext.TargetRootDir,
				new ChangedDelegate(this.target_fileSystemObserver_changedCallback)
			);
		}

		#region Configuration

		[ConfigurationClass]
		public class Configuration
		{
			[ConfigurationField("orchestrator.queue.warningSizeThreshold")]
			public int Orchestrator_Queue_WarningSizeThreshold { get; init; } = 1024;

			[ConfigurationField("orchestrator.queue.alertSizeThreshold")]
			public int Orchestrator_Queue_AlertSizeThreshold { get; init; } = 2048;

			[ConfigurationField("orchestrator.agent.sourceRootDir")]
			public string Orchestrator_Agent_SourceRootDir { get; init; } = @"";

			[ConfigurationField("orchestrator.agent.targetRootDir")]
			public string Orchestrator_Agent_TargetRootDir { get; init; } = @"";

			[ConfigurationField("orchestrator.agent.tempDir")]
			public string Orchestrator_Agent_TempDir { get; init; } = @"";

			[ConfigurationField("orchestrator.agent.logsDir")]
			public string Orchestrator_Agent_LogsDir { get; init; } = @"";
		}

		#endregion

		void source_fileSystemObserver_changedCallback(FileSystemObserver fso, List<FileEvent> fileEvents)
		{
			lock (this.sync_isIncomingProcessing)
			{
#if DEBUG
				this.Log.WriteLine(Severity.Neutral, (LGID, 0x84126C),
					nameof(Orchestrator), nameof(source_fileSystemObserver_changedCallback), $"Change batch count: {fileEvents.Count}"
				);
				var snapshot = fso.GetFileSystemSnapshot();
				var fileName = Path.Combine(this.configuration.Orchestrator_Agent_LogsDir, "log." + DateTime.UtcNow.ToString("yyyy-MM-dd-HH-mm-ss-fff") + ".source.snapshot.txt");
				File.WriteAllText(fileName, snapshot.ToText(sort: true));
				this.Log.WriteLine(Severity.Neutral, (LGID, 0xCC4CBF),
					nameof(Orchestrator), nameof(source_fileSystemObserver_changedCallback), $"Snapshot written ({snapshot.Entries.Count}): {fileName}"
				);
#endif

				for (int length = fileEvents.Count, i = 0; i < length; ++i)
				{ 
					this.source_incoming.Enqueue(fileEvents[i]);
					if (!this.isInWarningState && this.source_incoming.Count > this.configuration.Orchestrator_Queue_WarningSizeThreshold)
					{
						this.isInWarningState = true;
						this.Log.WriteLine(Severity.Warning, (LGID, 0x91F0BA),
							nameof(Orchestrator), nameof(source_fileSystemObserver_changedCallback), $"Queue element count exceeded {this.configuration.Orchestrator_Queue_WarningSizeThreshold}."
						);
					}
					else if (this.isInWarningState && this.source_incoming.Count <= this.configuration.Orchestrator_Queue_WarningSizeThreshold)
					{
						this.isInWarningState = false;
						this.Log.WriteLine(Severity.Neutral, (LGID, 0x7CF37A),
							nameof(Orchestrator), nameof(source_fileSystemObserver_changedCallback), "Queue element count back to normal."
						);
					}
					if (!this.isInAlertState && this.source_incoming.Count > this.configuration.Orchestrator_Queue_AlertSizeThreshold)
					{
						this.isInAlertState = true;
						this.Log.WriteLine(Severity.Alert, (LGID, 0x451C43),
							nameof(Orchestrator), nameof(source_fileSystemObserver_changedCallback), $"Queue element count exceeded {this.configuration.Orchestrator_Queue_AlertSizeThreshold}."
						);
					}
					else if (this.isInAlertState && this.source_incoming.Count <= this.configuration.Orchestrator_Queue_AlertSizeThreshold)
					{
						this.isInAlertState = false;
						this.Log.WriteLine(Severity.Neutral, (LGID, 0xF7E7F4),
							nameof(Orchestrator), nameof(source_fileSystemObserver_changedCallback), "Queue element count back to normal."
						);
					}
				}
			}

			this.source_signalQueueProcessing();
		}

		void source_signalQueueProcessing()
		{
			lock (this.source_incoming)
			{
				if (this.source_incoming.Count == 0) return;
				if (this.didSourceProcessorJustRun) return;
			}
			lock (this.sync_isIncomingProcessing)
			{
#if DEBUG
				int source_queueLength;
				lock (this.source_incoming)
				{
					source_queueLength = this.source_incoming.Count;
				}
				int target_queueLength;
				lock (this.target_incoming)
				{
					target_queueLength = this.target_incoming.Count;
				}
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xDF8F94),
					nameof(Orchestrator), nameof(source_signalQueueProcessing), nameof(source_queueLength), source_queueLength, nameof(target_queueLength), target_queueLength, this.isIncomingProcessing
				);
#endif
				if (this.isIncomingProcessing) return;
				this.isIncomingProcessing = true;
				this.didSourceProcessorJustRun = true;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x4AD7AA),
					nameof(Orchestrator), nameof(source_signalQueueProcessing), "ENTER"
				);
#endif
			}
			this.CoreContext.StartManagedTask(() =>
			{
				try
				{
					while (true)
					{
						FileEvent fileEvent;
						lock (this.source_incoming)
						{
							if (this.source_incoming.Count == 0) break;
							fileEvent = this.source_incoming.Dequeue();
						}
						try
						{
							this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();
							switch (fileEvent.FileChangeType)
							{
								//	no matter the event type, the agent will test for source file existence and either apply changes or restore original target state
								case FileChangeType.Created:
								case FileChangeType.Modified:
								case FileChangeType.Deleted:
									this.RunAgentsOnSource(this.agents, fileEvent.FileFootprint.RelativePath.ToPath(), fileEvent.FileFootprint.KnownModifiedTimeUtc);
									break;
								default: throw new NotImplementedException(fileEvent.FileChangeType.ToString());
							}
						}
						catch (OperationCanceledException)
						{
							this.Log.WriteLine(Severity.Warning, (LGID, 0x638BBD),
								nameof(Orchestrator), nameof(source_signalQueueProcessing), "Task cancelled"
							);
							break;
						}
						catch (Exception ex)
						{
							this.Log.WriteLine(Severity.Alert, (LGID, 0x4086BB),
								nameof(Orchestrator), nameof(source_signalQueueProcessing), ex
							);
						}
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0xC3B304),
						nameof(Orchestrator), nameof(source_signalQueueProcessing), ex
					);
				}
				finally
				{
					lock (this.sync_isIncomingProcessing)
					{
#if DEBUG
						int source_queueLength;
						lock (this.source_incoming)
						{
							source_queueLength = this.source_incoming.Count;
						}
						int target_queueLength;
						lock (this.target_incoming)
						{
							target_queueLength = this.target_incoming.Count;
						}
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xC6EEEB),
							nameof(Orchestrator), nameof(source_signalQueueProcessing), "EXIT", nameof(source_queueLength), source_queueLength, nameof(target_queueLength), target_queueLength
						);
#endif
						this.isIncomingProcessing = false;
					}
					this.target_signalQueueProcessing();    //	enable processing of the accumulated target queue
				}
			});
		}

		void target_fileSystemObserver_changedCallback(FileSystemObserver fso, List<FileEvent> fileEvents)
		{
			lock (this.sync_isIncomingProcessing)
			{
#if DEBUG
				this.Log.WriteLine(Severity.Neutral, (LGID, 0x1FAAAB),
					nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), $"Change batch count: {fileEvents.Count}"
				);
				var snapshot = fso.GetFileSystemSnapshot();
				var fileName = Path.Combine(this.configuration.Orchestrator_Agent_LogsDir, "log." + DateTime.UtcNow.ToString("yyyy-MM-dd-HH-mm-ss-fff") + ".target.snapshot.txt");
				File.WriteAllText(fileName, snapshot.ToText(sort: true));
				this.Log.WriteLine(Severity.Neutral, (LGID, 0x190DC7),
					nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), $"Snapshot written ({snapshot.Entries.Count}): {fileName}"
				);
#endif

				for (int length = fileEvents.Count, i = 0; i < length; ++i)
				{
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x4932BC),
						nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Target fso reported as changed", fileEvents[i].FileFootprint.RelativePath
					);
#endif

					this.target_incoming.Enqueue(fileEvents[i]);
					if (!this.isInWarningState && this.target_incoming.Count > this.configuration.Orchestrator_Queue_WarningSizeThreshold)
					{
						this.isInWarningState = true;
						this.Log.WriteLine(Severity.Warning, (LGID, 0x455714),
							nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), $"Queue element count exceeded {this.configuration.Orchestrator_Queue_WarningSizeThreshold}."
						);
					}
					else if (this.isInWarningState && this.target_incoming.Count <= this.configuration.Orchestrator_Queue_WarningSizeThreshold)
					{
						this.isInWarningState = false;
						this.Log.WriteLine(Severity.Neutral, (LGID, 0xA1F4DD),
							nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Queue element count back to normal."
						);
					}
					if (!this.isInAlertState && this.target_incoming.Count > this.configuration.Orchestrator_Queue_AlertSizeThreshold)
					{
						this.isInAlertState = true;
						this.Log.WriteLine(Severity.Alert, (LGID, 0xCA3882),
							nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), $"Queue element count exceeded {this.configuration.Orchestrator_Queue_AlertSizeThreshold}."
						);
					}
					else if (this.isInAlertState && this.target_incoming.Count <= this.configuration.Orchestrator_Queue_AlertSizeThreshold)
					{
						this.isInAlertState = false;
						this.Log.WriteLine(Severity.Neutral, (LGID, 0xB54977),
							nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Queue element count back to normal."
						);
					}
				}
			}

			this.target_signalQueueProcessing();
		}

		void target_signalQueueProcessing()
		{
			lock (this.target_incoming)
			{
				if (this.target_incoming.Count == 0) return;
				if (!this.didSourceProcessorJustRun) return;
			}
			lock (this.sync_isIncomingProcessing)
			{
#if DEBUG
				int source_queueLength;
				lock (this.source_incoming)
				{
					source_queueLength = this.source_incoming.Count;
				}
				int target_queueLength;
				lock (this.target_incoming)
				{
					target_queueLength = this.target_incoming.Count;
				}
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x2A0607),
					nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), nameof(source_queueLength), source_queueLength, nameof(target_queueLength), target_queueLength, this.isIncomingProcessing
				);
#endif
				if (this.isIncomingProcessing) return;
				this.isIncomingProcessing = true;
				this.didSourceProcessorJustRun = false;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x456C0B),
					nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "ENTER"
				);
#endif
			}
			this.CoreContext.StartManagedTask(() =>
			{
				try
				{
					while (true)
					{
						FileEvent fileEvent;
						lock (this.target_incoming)
						{
							if (this.target_incoming.Count == 0) break;
							fileEvent = this.target_incoming.Dequeue();
						}
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x4B6AAD),
							nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Orchestrator picked up from the queue", fileEvent.FileFootprint.RelativePath
						);
#endif
						try
						{
							this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();
							switch (fileEvent.FileChangeType)
							{
								//	no matter the event type, the agent will test for target file existence and either apply changes or restore original target state
								case FileChangeType.Created:
								case FileChangeType.Modified:
								case FileChangeType.Deleted:
#if DEBUG
									this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xBDD76E),
										nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Orchestrator passing to agents", fileEvent.FileFootprint.RelativePath
									);
#endif
									this.RunAgentsOnTarget(this.agents, fileEvent.FileFootprint.RelativePath.ToPath(), fileEvent.FileFootprint.KnownModifiedTimeUtc);
#if DEBUG
									this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x284D91),
										nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Orchestrator agents finished with", fileEvent.FileFootprint.RelativePath
									);
#endif
									break;
								default: throw new NotImplementedException(fileEvent.FileChangeType.ToString());
							}
						}
						catch (OperationCanceledException)
						{
							this.Log.WriteLine(Severity.Warning, (LGID, 0x8ACA7E),
								nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "Task cancelled"
							);
							break;
						}
						catch (Exception ex)
						{
							this.Log.WriteLine(Severity.Alert, (LGID, 0x9DFFEC),
								nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), ex
							);
						}
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0x106934),
						nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), ex
					);
				}
				finally
				{
					lock (this.sync_isIncomingProcessing)
					{
#if DEBUG
						int source_queueLength;
						lock (this.source_incoming)
						{
							source_queueLength = this.source_incoming.Count;
						}
						int target_queueLength;
						lock (this.target_incoming)
						{
							target_queueLength = this.target_incoming.Count;
						}
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xFDBC90),
							nameof(Orchestrator), nameof(target_fileSystemObserver_changedCallback), "EXIT", nameof(source_queueLength), source_queueLength, nameof(target_queueLength), target_queueLength
						);
#endif
						this.isIncomingProcessing = false;
					}
					this.source_signalQueueProcessing();    //	enable processing of the accumulated source queue
				}
			});
		}

		void RunAgentsOnSource(Agent[] agents, Path relativePath, DateTime? modifiedTimeUtc)
		{
			var fullPath = new Path(this.configuration.Orchestrator_Agent_SourceRootDir, relativePath).GetFullPath();
			for (int length = agents.Length, i = 0; i < length; ++i)
			{
				var agent = agents[i];
				try
				{
					if (!agent.RecognizeSource(relativePath)) continue;
					try
					{
						var isEnabled = agent.QueryIsEnabled();
						var agentSyncStatus = agent.GetSyncStatus(relativeSourceFilePath: relativePath, relativeTargetFilePath: null, isEnabled);
						switch (agentSyncStatus)
						{
							case AgentSyncStatus.PristineEnabled:
							case AgentSyncStatus.DirtyEnabled:
								Debug.Assert(isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_5_7, (agent.XID, 0xC09FE5),
									nameof(Orchestrator), nameof(RunAgentsOnSource), agent.GetType().Name, fullPath, modifiedTimeUtc, "APPLYING"
								);
#endif
								agent.Sync(relativeSourceFilePath: relativePath, relativeTargetFilePath: null, isEnabled: true);
								continue;

							case AgentSyncStatus.SyncedEnabled:
								Debug.Assert(isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_5_7, (agent.XID, 0x4BB6BE),
									nameof(Orchestrator), nameof(RunAgentsOnSource), agent.GetType().Name, fullPath, modifiedTimeUtc, nameof(agentSyncStatus), agentSyncStatus
								);
#endif
								continue;
							case AgentSyncStatus.PristineDisabled:
								Debug.Assert(!isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_5_7, (agent.XID, 0xBAE02C),
									nameof(Orchestrator), nameof(RunAgentsOnSource), agent.GetType().Name, fullPath, modifiedTimeUtc, nameof(agentSyncStatus), agentSyncStatus
								);
#endif
								continue;

							case AgentSyncStatus.SyncedDisabled:
							case AgentSyncStatus.DirtyDisabled:
								Debug.Assert(!isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_5_7, (agent.XID, 0xC09FE5),
									nameof(Orchestrator), nameof(RunAgentsOnSource), agent.GetType().Name, fullPath, modifiedTimeUtc, "REVERTING"
								);
#endif
								agent.Sync(relativeSourceFilePath: relativePath, relativeTargetFilePath: null, isEnabled: false);
								continue;

							default: throw new NotImplementedException(agentSyncStatus.ToString());
						}
					}
					catch (CannotApplyException ex)
					{
						this.Log.WriteLine(Severity.Error, (agent.XID, 0x910664),
							nameof(Orchestrator), nameof(RunAgentsOnSource), agent.GetType().Name, fullPath, modifiedTimeUtc, "CANNOT APPLY", ex.Message
						);
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Alert, (LGID, 0x4E80B1),
						nameof(Orchestrator), nameof(RunAgentsOnSource), agent.GetType().Name, fullPath, modifiedTimeUtc, ex
					);
				}
			}
		}

		void RunAgentsOnTarget(Agent[] agents, Path relativePath, DateTime? modifiedTimeUtc)
		{
			var fullPath = new Path(this.configuration.Orchestrator_Agent_TargetRootDir, relativePath).GetFullPath();
			for (int length = agents.Length, i = 0; i < length; ++i)
			{
				var agent = agents[i];
				try
				{
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xFB4E61),
						nameof(Orchestrator), nameof(RunAgentsOnTarget), "Orchestrator AGENT", agent.GetType().Name, "Recognize target result is", agent.RecognizeTarget(relativePath), relativePath.FileName
					);
#endif
					if (!agent.RecognizeTarget(relativePath)) continue;
					try
					{
						var isEnabled = agent.QueryIsEnabled();
						var agentSyncStatus = agent.GetSyncStatus(relativeSourceFilePath: null, relativeTargetFilePath: relativePath, isEnabled);
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xFC50D7),
							nameof(Orchestrator), nameof(RunAgentsOnTarget), "Orchestrator AGENT", agent.GetType().Name, "Agent status for this file is", agentSyncStatus, relativePath.FileName
						);
#endif
						switch (agentSyncStatus)
						{
							case AgentSyncStatus.PristineEnabled:
							case AgentSyncStatus.DirtyEnabled:
								Debug.Assert(isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_5_7, (agent.XID, 0xCE606F),
									nameof(Orchestrator), nameof(RunAgentsOnTarget), agent.GetType().Name, fullPath, modifiedTimeUtc, "APPLYING"
								);
#endif
								agent.Sync(relativeSourceFilePath: null, relativeTargetFilePath: relativePath, isEnabled: true);
								continue;

							case AgentSyncStatus.SyncedEnabled:
								Debug.Assert(isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_6_7, (agent.XID, 0x5FEBB9),
									nameof(Orchestrator), nameof(RunAgentsOnTarget), agent.GetType().Name, fullPath, modifiedTimeUtc, nameof(agentSyncStatus), agentSyncStatus
								);
#endif
								continue;

							case AgentSyncStatus.PristineDisabled:
								Debug.Assert(!isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_6_7, (agent.XID, 0x8B8190),
									nameof(Orchestrator), nameof(RunAgentsOnTarget), agent.GetType().Name, fullPath, modifiedTimeUtc, nameof(agentSyncStatus), agentSyncStatus
								);
#endif
								continue;

							case AgentSyncStatus.SyncedDisabled:
							case AgentSyncStatus.DirtyDisabled:
								Debug.Assert(!isEnabled);
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_5_7, (agent.XID, 0x9006D9),
									nameof(Orchestrator), nameof(RunAgentsOnTarget), agent.GetType().Name, fullPath, modifiedTimeUtc, "REVERTING"
								);
#endif
								agent.Sync(relativeSourceFilePath: null, relativeTargetFilePath: relativePath, isEnabled: false);
								continue;

							default: throw new NotImplementedException(agentSyncStatus.ToString());
						}
					}
					catch (CannotApplyException ex)
					{
						this.Log.WriteLine(Severity.Error, (agent.XID, 0xB40FC4),
							nameof(Orchestrator), nameof(RunAgentsOnTarget), agent.GetType().Name, fullPath, modifiedTimeUtc, "CANNOT REVERT", ex.Message
						);
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Alert, (LGID, 0xDE28C2),
						nameof(Orchestrator), nameof(RunAgentsOnTarget), agent.GetType().Name, fullPath, modifiedTimeUtc, ex
					);
				}
			}
		}

		ProgramContext ProgramContext => (ProgramContext)this.CoreContext;

		readonly Configuration configuration;
		readonly Agent[] agents;

		readonly FileSystemObserver source_fileSystemObserver;
		readonly Queue<FileEvent> source_incoming = [];

		readonly FileSystemObserver target_fileSystemObserver;
		readonly Queue<FileEvent> target_incoming = [];

		object sync_isIncomingProcessing = new();

		bool didSourceProcessorJustRun = false;
		bool isIncomingProcessing = false;
		bool isInWarningState = false;
		bool isInAlertState = false;
	}
}


