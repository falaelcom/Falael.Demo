using Falael.Core.Syncronization;

namespace Falael.Core.AppTasks
{
	public class AppTaskAutomatedGenerator : FalaelContextAware
	{
		const ulong LGID = 0xE75CD7;

		public delegate Task AppTaskPostAttemptDelegate(Peg peg);

		public AppTaskAutomatedGenerator(IFalaelContext coreContext, IPegMutex pegSemaphore, int generatorIntervalMs, List<AppTaskPostAttemptDelegate> appTask_AttemptList)
			: base(coreContext)
		{
			this.PegSemaphore = pegSemaphore;
			this.GeneratorIntervalMs = generatorIntervalMs;
			this.AppTask_AttemptList = appTask_AttemptList;
		}

		public async Task Run()
		{
			lock (this.sync)
			{
				if (this.isRunning) throw new InvalidOperationException();
				this.isRunning = true;
			}

			this.Log.WriteLine(LogDensity.LD_1_7, (LGID, 0x20486A),
				nameof(AppTaskAutomatedGenerator), "Starting..."
			);

			var firstIteration = true;

			while (true)
			{
				if (firstIteration)
				{
					this.Log.WriteLine(LogDensity.LD_1_7, (LGID, 0xD02546),
						nameof(AppTaskAutomatedGenerator), "Started."
					);
					firstIteration = false;
				}

				for (int length = this.AppTask_AttemptList.Count, i = 0; i < length; ++i)
				{
					var callback = this.AppTask_AttemptList[i];
					try
					{
						using (Peg peg = await this.PegSemaphore.HoldPeg($"{nameof(AppTaskAutomatedGenerator)}/attempt/{i}"))
						{
							await callback(peg);
						}
					}
					catch (Exception ex)
					{
						this.Log.WriteLine(Severity.Critical, (LGID, 0x7E0549),
							nameof(AppTaskAutomatedGenerator), $"attempt {i}", ex
						);
					}
				}
				await Task.Delay(this.GeneratorIntervalMs);
			}
		}

		public IPegMutex PegSemaphore { get; }
		public int GeneratorIntervalMs { get; }
		public List<AppTaskPostAttemptDelegate> AppTask_AttemptList { get; }

		bool isRunning = false;
		readonly object sync = new();
	}
}
