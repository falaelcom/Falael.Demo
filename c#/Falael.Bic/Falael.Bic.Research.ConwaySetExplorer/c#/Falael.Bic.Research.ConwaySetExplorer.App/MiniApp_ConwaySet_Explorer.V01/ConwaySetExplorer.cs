using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Falael.Data.Spatial;
using Falael.Data.Spatial.Storage;
using Falael.Bic.GameOfLife;

namespace Falael.Bic.Research.ConwaySetExplorer.MiniApp_ConwaySet_Explorer.V01
{
	public class ConwaySetExplorer : IDisposable
	{
		public ConwaySetExplorer(ISpace space, ulong frag, int wrapRadius, int iterationCount, int experimentRepeatCount, int activeTreshold, string storagePath)
		{
			this.space = space;
			this.wrapRadius = wrapRadius;
			this.iterationCount = iterationCount;
			this.experimentRepeatCount = experimentRepeatCount;
			this.activeTreshold = activeTreshold;
			this.storagePath = storagePath;

			StringBuilder sb = new StringBuilder();
            sb.Append("V01-");
            for (int length = this.space.Dimensions.Length, i = 0; i < length; ++i)
			{
				var dimension = this.space.Dimensions[i];
				if(i != 0)
				{
					sb.Append(".");
				}
				sb.AppendFormat("{0}-{1}-{2}-{3}-{4}", i, frag, dimension.Maxp, dimension.N1, dimension.N2);
			}

			this.dbPath = Path.Combine(storagePath, sb.ToString());
			this.spatialStorage = new SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo>(new FileSystem(this.dbPath), new SpatialStorageIndex(this.space));
			lock(this.spatialStorage)
			{
				this.spaceIterator = this.spatialStorage.LastSpaceIterator;
				if(this.spatialStorage.FirstSpaceIterator != this.spatialStorage.LastSpaceIterator)
				{
					this.spaceIterator = this.space.Next(this.spaceIterator);
				}
			}
		}

		#region IDisposable
		public void Dispose()
		{
			this.Pause();
		}
        #endregion

        #region Nested types
        public class ProgressEventArgs : EventArgs
        {
            public float TotalPtogress;
            public float ExperimentPtogress;
            public double AvgStepDurationMs;
        }
        #endregion

        #region Operations
        public void Resume()
		{
			this.task = Task.Run(() =>
			{
				LifeDocument document = new LifeDocument();
				ConwaySet conwaySet = new ConwaySet(document, new ConwaySet.ExplorationOptions { iterationCount = this.iterationCount, activeTreshold = this.activeTreshold });

				long counter = 0;
				while (true)
				{
                    this.OnProgress(0);

                    DateTime stepStart = DateTime.Now;
					decimal[] vvector = this.space.GetAt(this.spaceIterator);
					LifeDocument.Rule[] fuzzyRules = LifeResources.BuildConwayFuzzyRules((float)vvector[0], (float)vvector[1], (float)vvector[2]);
					document.Rules = fuzzyRules;

					ConwaySet.ExplorationStatsAverage explorationStatsAverage = new ConwaySet.ExplorationStatsAverage();
					for (int length = this.experimentRepeatCount, i = 0; i < length; ++i)
					{
						lock(this.pausesync)
						{
							if (this.pauseRequested)
							{
								break;
							}
						}

						LifeDocument.Configuration random = LifeResources.GenerateRandomConfiguration(this.wrapRadius, new int[] { LifeDocument.DEAD, LifeDocument.ALIVE });
						document.SetConfiguration(random);
						ConwaySet.ExplorationStats explorationStats = conwaySet.Analyse(conwaySet.Explore());
						explorationStatsAverage.Add(explorationStats);
                        this.OnProgress(i / (float)length);
                    }

					lock (this.pausesync)
					{
						if (this.pauseRequested)
						{
							break;
						}
					}

					ConwaySet.ExplorationStatsAverageInfo dbValue = ConwaySet.ExplorationStatsAverageInfo.FromObject(explorationStatsAverage, vvector);

					lock (this.spatialStorage)
					{
						this.spatialStorage.SetAt(vvector, dbValue, EDimensionHitTestHint.Precise);
					}

					this.spaceIterator = this.space.Next(this.spaceIterator);

					++counter;
					DateTime stepEnd = DateTime.Now;
					double stepDurationMs = (stepEnd - stepStart).TotalMilliseconds;
					this.avgStepDurationMs = this.avgStepDurationMs + (stepDurationMs - this.avgStepDurationMs) / counter;
				}
			});
		}
		public void Pause()
		{
			lock (this.pausesync)
			{
				this.pauseRequested = true;
			}
			this.task.Wait();
		}
        #endregion

        #region Overridables
        public virtual void OnProgress(float experimentProgress)
        {
            this.Progress?.Invoke(this, new ProgressEventArgs
            {
                ExperimentPtogress = experimentProgress,
                TotalPtogress = this.space.CountSpaceIteratorTicks(this.spaceIterator) / (float)this.space.TickCount,
                AvgStepDurationMs = this.avgStepDurationMs,
            });
        }
        #endregion

        #region Properties
        public ISpace Space
		{
			get
			{
				return this.space;
			}
		}
		public int WrapRadius
		{
			get
			{
				return this.wrapRadius;
			}
		}
		public int IterationCount
		{
			get
			{
				return this.iterationCount;
			}
		}
		public int ExperimentRepeatCount
		{
			get
			{
				return this.experimentRepeatCount;
			}
		}
		public int ActiveTreshold
		{
			get
			{
				return this.activeTreshold;
			}
		}
		public string StoragePath
		{
			get
			{
				return this.storagePath;
			}
		}

		public string DbPath
		{
			get
			{
				return this.dbPath;
			}
		}
		public SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo> SpatialStorage
		{
			get
			{
				return this.spatialStorage;
			}
		}
		public SpaceIterator SpaceIterator
		{
			get
			{
				return this.spaceIterator;
			}
		}
        #endregion

        #region Events
        public event EventHandler<ProgressEventArgs> Progress;
		#endregion

		#region Fields
		ISpace space;
        int wrapRadius;
        int iterationCount;
        int experimentRepeatCount;
        int activeTreshold;
        string storagePath;

        string dbPath;
        SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo> spatialStorage;
		SpaceIterator spaceIterator;
        Task task;
        bool pauseRequested = false;
        object pausesync = new object();

        double avgStepDurationMs = 0;
        #endregion
    }
}
