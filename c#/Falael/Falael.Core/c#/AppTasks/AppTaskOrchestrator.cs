using System.Net;

using Falael.Core.Syncronization;

namespace Falael.Core.AppTasks
{
	public class AppTaskOrchestrator : FalaelContextAware
	{
		const ulong LGID = 0x83AE71;

		public AppTaskOrchestrator(IFalaelContext coreContext, IPegMutex pegSemaphore, IAppTaskQueue appTaskQueue, int runningTaskLimit, int pollingIntervalMs)
			: base(coreContext)
		{
			this.pegSemaphore = pegSemaphore;
			this.appTaskQueue = appTaskQueue;
			this.runningTaskLimit = runningTaskLimit;
			this.pollingIntervalMs = pollingIntervalMs;
		}

		#region SemaphoreSmart.IOperationObserver

		public async Task OnWaitStartAsync(AppTask appTask)
		{
			try
			{
				using (Peg peg = await this.pegSemaphore.HoldPeg($"{nameof(AppTaskOrchestrator)}/{nameof(OnWaitStartAsync)}"))
				{
					await this.appTaskQueue.ThrottleAppTask(peg, appTask);
				}
			}
			catch (Exception ex)
			{
				this.Log.WriteLine(Severity.Critical, (LGID, 0x62B4B3),
					nameof(AppTaskOrchestrator), "Failed to hybernate app task.", ex
				);
			}
		}

		public async Task OnWaitEndAsync(AppTask appTask, SemaphoreSmart.WaitEndReason waitEndReason, TimeSpan waitTime)
		{
			try
			{
				using (Peg peg = await this.pegSemaphore.HoldPeg($"{nameof(AppTaskOrchestrator)}/{nameof(OnWaitEndAsync)}"))
				{
					switch (waitEndReason)
					{
						case SemaphoreSmart.WaitEndReason.Continue:
						case SemaphoreSmart.WaitEndReason.SemaphorDisposing:
							//	return back to running state
							await this.appTaskQueue.UnthrottleAppTask(peg, appTask, waitTime);
							break;
						case SemaphoreSmart.WaitEndReason.Timeout:
							//	return back to enqueued state (won't be marked as failed because the app task istself has actually not failed but rather some metered service's load was too high and there is no reasonable expectation for this condition to repeat itself consistently, and therefore rerunning the task is the beneficial strategy)
							await this.appTaskQueue.ResetAppTask(peg, appTask);
							break;
						default: throw new NotImplementedException(waitEndReason.ToString());
					}
				}
			}
			catch (Exception ex)
			{
				this.Log.WriteLine(Severity.Critical, (LGID, 0x10D610),
					nameof(AppTaskOrchestrator), "Failed to unhibernate app task.", ex
				);
			}
		}

		#endregion

		/// <exception cref="InvalidOperationException">Thrown when this method is called twice.</exception>
		public async Task Start(object? appTaskDeserializationContext)
		{
			lock (this.sync)
			{
				if (this.isRunning) throw new InvalidOperationException();
				this.isRunning = true;
			}

			this.Log.WriteLine(LogDensity.LD_1_7, (LGID, 0xE69E12),
				nameof(AppTaskOrchestrator), "Starting..."
			);

			{
				try
				{
					using (Peg peg = await this.pegSemaphore.HoldPeg($"{nameof(AppTaskOrchestrator)}/ResetRunningAppTasks"))
					{
						await this.appTaskQueue.ResetOrphanedAppTasks(peg);
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Critical, (LGID, 0xCA49CD),
						nameof(AppTaskOrchestrator), "Failed to reset orphaned app task.", ex
					);
				}
			}

			_ = Task.Run(async () =>
			{
				try
				{
					var semaphore = new SemaphoreSlim(this.runningTaskLimit, this.runningTaskLimit);
					var firstIteration = true;

					while (true)
					{
						AppTask? appTask = null;
						try
						{
							using (Peg peg = await this.pegSemaphore.HoldPeg($"{nameof(AppTaskOrchestrator)}/DequeueAppTask"))
							{
								if (firstIteration)
								{
									this.Log.WriteLine(LogDensity.LD_1_7, (LGID, 0x866BDB),
										nameof(AppTaskOrchestrator), "Started."
									);
									firstIteration = false;
								}
								appTask = await this.appTaskQueue.DequeueNextAppTask(peg, appTaskDeserializationContext);
							}
							if (appTask != null)
							{
								this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x720650),
									nameof(AppTaskOrchestrator), "App task scheduled for immediate execution", appTask.GetType().Name, Path.GetFileName(appTask.FilePath),
									CL(appTask.FilePath),
									CL(appTask.Serialize())
								);
							}
							else
							{
								await Task.Delay(this.pollingIntervalMs);
								continue;
							}
						}
						catch (Exception ex)
						{
							this.Log.WriteLine(Severity.Critical, (LGID, 0x9F2347),
								nameof(AppTaskOrchestrator), ex
							);
							await Task.Delay(this.pollingIntervalMs);
							continue;
						}

						__executeAppTask(appTask, semaphore);
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0x3BEC9D),
						nameof(AppTaskOrchestrator), ex
					);
					await Task.Delay(this.pollingIntervalMs);
				}
			});

			void __executeAppTask(AppTask appTask, SemaphoreSlim semaphore)
			{
				_ = Task.Run(async () =>
				{
					await semaphore.WaitAsync();
					try
					{
						if (appTask != null)
						{
							object? result = null;
							try
							{
								this.Log.WriteLine(LogDensity.LD_4_7, (LGID, 0xBC46D7),
									nameof(AppTaskOrchestrator), nameof(__executeAppTask), appTask.GetType().FullName
								);
								result = await appTask.Execute(new AppTask.SemaphoreSmartObserver(this.CoreContext, this, appTask));
								using (Peg peg = await this.pegSemaphore.HoldPeg($"{nameof(AppTaskOrchestrator)}/FinalizeAppTask"))
								{
									this.appTaskQueue.FinalizeAppTask(peg, appTask, result, null);
								}
							}
							catch (AppTaskAnomalyException ex) when (ex.InnerException is HttpRequestException httpRequestException)
							{
								if (httpRequestException.StatusCode == HttpStatusCode.TooManyRequests)
								{
									this.Log.WriteLine(Severity.Fatal, (LGID, 0xDF1A19),
										nameof(AppTaskOrchestrator), "GPT is most likely out of credit, exiting app.", ex
									);
									await Task.Delay(10000);    //	give `Log` time to send a notification email
									Environment.Exit(-666);
								}
								else
								{
									this.Log.WriteLine(Severity.Error, (LGID, 0x2081F7),
										nameof(AppTaskOrchestrator), ex
									);
								}
								await Task.Delay(this.pollingIntervalMs);
							}
							catch (AppTaskException ex)
							{
								this.Log.WriteLine(Severity.Error, (LGID, 0x77CA36),
									appTask.GetType().Name, ex
								);
								using (Peg peg = await this.pegSemaphore.HoldPeg($"{nameof(AppTaskOrchestrator)}/FinalizeAppTask (Exception)"))
								{
									this.appTaskQueue.FinalizeAppTask(peg, appTask, result, ex);
								}
							}
						}
						else
						{
							await Task.Delay(this.pollingIntervalMs);
						}
					}
					catch (Exception ex)
					{
						this.Log.WriteLine(Severity.Error, (LGID, 0x9257D7),
							nameof(AppTaskOrchestrator), ex
						);
						await Task.Delay(this.pollingIntervalMs);
					}
					finally
					{
						semaphore.Release();
					}
				});
			}
		}

		readonly IPegMutex pegSemaphore;
		readonly IAppTaskQueue appTaskQueue;
		readonly int runningTaskLimit;
		readonly int pollingIntervalMs;

		bool isRunning = false;
		readonly object sync = new();
	}
}