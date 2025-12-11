using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Runtime.InteropServices;

using Falael.Visualization;

using Falael.Data.Spatial;
using Falael.Data.Spatial.Storage;
using Falael.Data.Spatial.Operators;

using Falael.Bic.GameOfLife;

using OpenGL;
using System.IO;

namespace Falael.Bic.Research.ConwaySetExplorer
{
    public class MiniApp_SubSpace : MiniApp
    {
   		[StructLayout(LayoutKind.Explicit, Pack = 1)]
		public struct TestDbData
		{
			[FieldOffset(0)] public int ipi;                            //	size 4
			[FieldOffset(4)] public ulong ic0;							//	size 8
		}

		const string STORAGE_path = @"sub-space-test";

		public MiniApp_SubSpace() : base(true) { }
		public override void Dispose()
		{
			this.stopRequested = true;
		}

		void TestRangeFilter2D(Action<double> finished)
		{
			DateTime stepStart;
			DateTime stepEnd;
			double avgStepDurationMs = 0;

			this.device2D = new Gl2DGridDevice();

			this.device2D.Scale = 0.005f;
			this.device2D.DotMargin = 0.38f;
			this.device2D.Size = this.glControl.Size;

			this.SizeChanged(this.glControl.Size);

			int maxp = 3;
			IDimension dimenstion1 = new FractalDimension(4, maxp, 0, 100);
			IDimension dimenstion2 = new FractalDimension(4, maxp, 0, 100);
			Space space = new Space(new IDimension[] { dimenstion1, dimenstion2 });

			var fileSystem = new FileSystem(Path.Combine(base.storageBasePath, STORAGE_path));
			try
			{
				fileSystem.Whipe();
			}
			catch (Exception ex)
			{
				System.Diagnostics.Debug.WriteLine(ex.ToString());
			}

			//	prepare a test database
			var spatialStorage = new SpatialStorage_Unsafe<TestDbData>(fileSystem, new SpatialStorageIndex(space));
			SpaceIterator dbSpaceIterator = space.First();
			ulong dbCounter = 0;
			while (dbCounter < space.TickCount)
			{
				decimal[] vvector = space.GetAt(dbSpaceIterator);
				var dbValue = new TestDbData
				{
					ipi = dbSpaceIterator.Ipi,
					ic0 = dbSpaceIterator.Ic0,
				};
				spatialStorage.SetAt(vvector, dbValue, EDimensionHitTestHint.Precise);
				dbSpaceIterator = space.Next(dbSpaceIterator);
				++dbCounter;
				if(this.stopRequested)
				{
					return;
				}
			}

			//	create subspace
			string[] superSpaceSchema = { "x", "y" };
			string[] subSpaceSchema = { "sx", "sy" };
			IOperator[] operators = 
			{
				new RangeFilter("sx", "x", 10, 100),
				new RangeFilter("sy", "y", 20.5m, 50.5m),
			};
			SubSpace subSpace = new SubSpace(space, operators, superSpaceSchema, subSpaceSchema);

			//	explore subspace
			var ticks = subSpace.Dimensions[1].QueryAllTicks();

			//	validate the test database, iterated by subspace
			var spatialStorage2 = new SpatialStorage_Unsafe<TestDbData>(fileSystem, new SpatialStorageIndex(space));
			SpaceIterator dbSpaceIterator2 = subSpace.First();
			ulong dbCounter2 = 0;
			while (dbCounter2 < subSpace.TickCount)
			{
				decimal[] vvector = subSpace.GetAt(dbSpaceIterator2);
				var dbValue = spatialStorage2.GetAt(vvector, EDimensionHitTestHint.Precise);
				if(!dbValue.HasValue)
				{
					throw new InvalidOperationException("dbValue.HasValue");
				}

				SpaceIterator superSpaceIterator = subSpace.ReverseSpaceIterator(dbSpaceIterator2);
				if(dbValue.Value.ipi != superSpaceIterator.Ipi || dbValue.Value.ic0 != superSpaceIterator.Ic0)
				{
					throw new InvalidOperationException("dbValue.HasValue");
				}
				dbSpaceIterator2 = subSpace.Next(dbSpaceIterator2);
				++dbCounter2;
				if (this.stopRequested)
				{
					return;
				}
			}

			//	draw subspace
			SpaceIterator spaceIterator = null;
			int current_ipi;
			ulong counter;
			Task.Run(() =>
			{
				#region Draw super space
				counter = 0;
				current_ipi = 0;
				spaceIterator = space.First();

				while (counter < space.TickCount)
				{
					if (this.stopRequested)
					{
						return;
					}
					lock (this.device2D)
					{
						stepStart = DateTime.Now;

						ulong[] pvector = space.GetPvector(spaceIterator.Ipi);
						ulong p_max = pvector.Max();
						ulong p_min = pvector.Min();

						int blue = 255 - (int)Math.Round(255 * p_max / (decimal)maxp);
						int green = 255 - (int)Math.Round(255 * p_min / (decimal)maxp);

						Color dotColor = Color.FromArgb(255, 255, green, blue);
						this.colorBuffer.Add(dotColor);

						decimal[] vvector = space.GetAt(spaceIterator);
						if (vvector.Length == 1)
						{
							PointF dot = new PointF((float)vvector[0], 0f);
							this.dotBuffer.Add(dot);
						}
						else if (vvector.Length >= 2)
						{
							PointF dot = new PointF((float)vvector[0], (float)vvector[1]);
							this.dotBuffer.Add(dot);
						}
						spaceIterator = space.Next(spaceIterator);
						++counter;

						stepEnd = DateTime.Now;
						double stepDurationMs = (stepEnd - stepStart).TotalMilliseconds;
						avgStepDurationMs = avgStepDurationMs + (stepDurationMs - avgStepDurationMs) / counter;
					}

					if (spaceIterator.Ipi != current_ipi)
					{
						current_ipi = spaceIterator.Ipi;
						if (this.glControl.InvokeRequired && !this.glControl.IsDisposed && !this.glControl.Disposing)
							this.glControl.Invoke(new Action(() =>
							{
								this.glControl.Invalidate(new Rectangle(new Point(0, 0), this.device2D.Size));
								Application.DoEvents();
							}));
					}
				}
				#endregion

				#region Draw sub space
				counter = 0;
				current_ipi = 0;
				spaceIterator = subSpace.First();

				while (counter < subSpace.TickCount)
				{
					if (this.stopRequested)
					{
						return;
					}
					lock (this.device2D)
					{
						stepStart = DateTime.Now;

						//SpaceIterator superSpaceIterator = subSpace.ReverseSpaceIterator(spaceIterator);

						ulong[] pvector = subSpace.GetPvector(spaceIterator.Ipi);
						ulong p_max = pvector.Max();
						ulong p_min = pvector.Min();

						int red = 255 - (int)Math.Round(255 * p_max / (decimal)maxp);
						int blue = 255 - (int)Math.Round(255 * p_min / (decimal)maxp);

						Color dotColor = Color.FromArgb(255, red, 50, blue);
						this.colorBuffer.Add(dotColor);

						decimal[] vvector = subSpace.GetAt(spaceIterator);
						if (vvector.Length == 1)
						{
							PointF dot = new PointF((float)vvector[0], 0f);
							this.dotBuffer.Add(dot);
						}
						else if (vvector.Length >= 2)
						{
							PointF dot = new PointF((float)vvector[0], (float)vvector[1]);
							this.dotBuffer.Add(dot);
						}
						spaceIterator = subSpace.Next(spaceIterator);
						++counter;

						stepEnd = DateTime.Now;
						double stepDurationMs = (stepEnd - stepStart).TotalMilliseconds;
						avgStepDurationMs = avgStepDurationMs + (stepDurationMs - avgStepDurationMs) / counter;
					}

					if (spaceIterator.Ipi != current_ipi)
					{
						current_ipi = spaceIterator.Ipi;
						if (this.glControl.InvokeRequired && !this.glControl.IsDisposed && !this.glControl.Disposing)
							this.glControl.Invoke(new Action(() =>
							{
								this.glControl.Invalidate(new Rectangle(new Point(0, 0), this.device2D.Size));
								Application.DoEvents();
							}));
					}
				}
				#endregion

				this.device2D = null;
				finished(avgStepDurationMs);
			});
		}

		//	upgrade to include the x, y and z coordinates into the data points
		void UpgradeExplorationStatsDb(Action finished)
		{
			//	setup space
			Func<ulong, int, ulong> getfrag = (origin, p) =>
			{
				if (p == 0)
				{
					return origin;
				}
				ulong frag = (ulong)Math.Ceiling(origin / (decimal)((p + 1) * (p + 1) * (p + 1)));
				return frag > 1 ? frag : 2;
			};

			const int SPACE_maxp = 4;
			const ulong SPACE_frag = 32;
			decimal n1 = 0, n2 = 8;
			decimal center = (n2 - n1) / 2;

			IDimension dim_isolationTreshold = new FractalDimension(SPACE_frag, SPACE_maxp, n1, n2, getfrag);
			IDimension dim_overcrowdingTreshold = new FractalDimension(SPACE_frag, SPACE_maxp, n1, n2, getfrag);
			IDimension dim_birthCondition = new FractalDimension(SPACE_frag, SPACE_maxp, n1, n2, getfrag);
			ISpace space = new Space(new IDimension[] { dim_isolationTreshold, dim_overcrowdingTreshold, dim_birthCondition });

			//	setup storage
			
			var sourceFileSystem = new FileSystem(Path.Combine(base.storageBasePath, @"bic-conway-set\0-32-4-0-8.1-32-4-0-8.2-32-4-0-8-old-schema"));
			var destinationFileSystem = new FileSystem(Path.Combine(base.storageBasePath, @"bic-conway-set\0-32-4-0-8.1-32-4-0-8.2-32-4-0-8"));
			try
			{
				destinationFileSystem.Whipe();
			}
			catch (Exception ex)
			{
				System.Diagnostics.Debug.WriteLine(ex.ToString());
			}

			//	copy and upgrade source database
			var sourceSpatialStorage = new SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo_Old>(sourceFileSystem, new SpatialStorageIndex(space));
			var destinationSpatialStorage = new SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo>(destinationFileSystem, new SpatialStorageIndex(space));
			SpaceIterator dbSpaceIterator = space.First();
			ulong dbCounter = 0;
			while (dbCounter < space.TickCount)
			{
				decimal[] vvector = space.GetAt(dbSpaceIterator);
				var dbValue = sourceSpatialStorage.GetAt(vvector, EDimensionHitTestHint.Precise);
				if(!dbValue.HasValue)
				{
					break;
				}
				var dbValue_new = new ConwaySet.ExplorationStatsAverageInfo
				{
					finite = dbValue.Value.finite,
					activeCellCountTrend = dbValue.Value.activeCellCountTrend,
					generationSizeTrend = dbValue.Value.generationSizeTrend,
					fulnessTrend = dbValue.Value.fulnessTrend,
					averageFullnessPercent = dbValue.Value.averageFullnessPercent,
					averageActivity = dbValue.Value.averageActivity,
					averageGenerationSize = dbValue.Value.averageGenerationSize,
					x = vvector[0],
					y = vvector[1],
					z = vvector[2],
				};
				destinationSpatialStorage.SetAt(vvector, dbValue_new, EDimensionHitTestHint.Precise);
				dbSpaceIterator = space.Next(dbSpaceIterator);
				++dbCounter;
			}

			finished();
		}

		//	convert the ulong pointers to IndexEntry pointers (insert a byte value 1 before every ulong)
		void UpgradeIndices(Action finished)
		{
			var sourceFileSystem = new FileSystem(Path.Combine(base.storageBasePath, @"bic-conway-set\0-32-4-0-8.1-32-4-0-8.2-32-4-0-8-old"));
			var destinationFileSystem = new FileSystem(Path.Combine(base.storageBasePath, @"bic-conway-set\0-32-4-0-8.1-32-4-0-8.2-32-4-0-8"));
			destinationFileSystem.Whipe(true);
			for(int length = 5, i = 0; i < length; ++i)
			{
				string fileName = i.ToString() + ".index";
				ulong offset = 0;
				ulong? dataOffset = sourceFileSystem.ReadAt<ulong>(fileName, offset);
				while (dataOffset.HasValue)
				{
					destinationFileSystem.Append(fileName, (byte)1);
					destinationFileSystem.Append(fileName, dataOffset.Value);

					offset += sizeof(ulong);
					dataOffset = sourceFileSystem.ReadAt<ulong>(fileName, offset);
				}
			}

			finished();
		}

        public override void Init(Form mainForm, GlControl glControl, Panel controlsPanel, string storageBasePath)
        {
            base.Init(mainForm, glControl, controlsPanel, storageBasePath);

            if (MessageBox.Show("Run test?", "?", MessageBoxButtons.OKCancel) == DialogResult.Cancel)
            {
                return;
            }

			this.TestRangeFilter2D((double avgStepDurationMs) =>
			{
				MessageBox.Show("TestRangeFilter2D Finished, avg ms = " + avgStepDurationMs);
			});
			//UpgradeIndices(() =>
			//{
			//	MessageBox.Show("Finished");
			//});
		}
		public override void SizeChanged(Size size)
        {
            this.glControl.Invalidate();
        }
        public override void Render()
        {
			if(this.device2D != null)
			{
				lock (this.device2D)
				{
					this.device2D.DrawCells(this.dotBuffer.ToArray(), this.colorBuffer.ToArray());
					this.dotBuffer.Clear();
					this.colorBuffer.Clear();
				}
			}
		}
        public override void Tick()
        {
        }

		Gl2DGridDevice device2D;

		List<PointF> dotBuffer = new List<PointF>();
		List<Color> colorBuffer = new List<Color>();

		volatile bool stopRequested = false;
	}
}
