using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using Falael.Visualization;
using Falael.Data.Spatial;
using OpenGL;

namespace Falael.Bic.Research.ConwaySetExplorer
{
    public class MiniApp_Space : MiniApp
    {
        public MiniApp_Space() : base(true) { }
        public override void Init(Form mainForm, GlControl glControl, Panel controlsPanel, string storageBasePath)
        {
            base.Init(mainForm, glControl, controlsPanel, storageBasePath);

            this.device.Scale = 0.005f;
			this.device.DotMargin = 0.38f;
			this.device.Size = this.glControl.Size;

			this.SizeChanged(this.glControl.Size);

			Func<ulong, int, ulong> getfrag = (origin, p) =>
			{
				if (p == 0)
				{
					return origin;
				}
				ulong frag = (ulong)Math.Ceiling(origin / (decimal)((p + 1) * (p + 1)));
				return frag > 1 ? frag : 2;
			};

			int maxp = 6;
            IDimension dimenstion1 = new FractalDimension(10, maxp, -100, 100, getfrag);
            IDimension dimenstion2 = new FractalDimension(10, maxp, -100, 100, getfrag);
			this.space = new Space(new IDimension[] { dimenstion1, dimenstion2 });
			this.spaceIterator = space.First();

			int current_ipi = 0;

			Task.Run(() =>
			{
				while (counter < space.TickCount && !this.stopRequested)
				{
					lock (this.device)
					{
						this.stepStart = DateTime.Now;

						ulong[] pvector = this.space.GetPvector(spaceIterator.Ipi);
						ulong p_max = pvector.Max();
						ulong p_min = pvector.Min();

						int blue = 255 - (int)Math.Round(255 * p_max / (decimal)maxp);
						int green = 255 - (int)Math.Round(255 * p_min / (decimal)maxp);

						Color dotColor = Color.FromArgb(255, 255, green, blue);
						this.colorBuffer.Add(dotColor);

						decimal[] vvector = this.space.GetAt(this.spaceIterator);
						if(vvector.Length == 1)
						{
							PointF dot = new PointF((float)vvector[0], 0f);
							this.dotBuffer.Add(dot);
						}
						else if (vvector.Length >= 2)
						{
							PointF dot = new PointF((float)vvector[0], (float)vvector[1]);
							this.dotBuffer.Add(dot);
						}
						this.spaceIterator = this.space.Next(this.spaceIterator);
						++counter;

						this.stepEnd = DateTime.Now;
						double stepDurationMs = (this.stepEnd - this.stepStart).TotalMilliseconds;
						this.avgStepDurationMs = this.avgStepDurationMs + (stepDurationMs - this.avgStepDurationMs) / counter;
					}

					if(spaceIterator.Ipi != current_ipi)
					{
						current_ipi = spaceIterator.Ipi;
						if (this.glControl.InvokeRequired && !this.glControl.IsDisposed && !this.glControl.Disposing)
						{
							try
							{
								this.glControl.Invoke(new Action(() =>
								{
									this.glControl.Invalidate(new Rectangle(new Point(0, 0), this.device.Size));
									Application.DoEvents();
								}));
							}
							catch (Exception ex)
							{
								System.Diagnostics.Debug.WriteLine(ex);
							}
						}
					}
				}
				if(!this.stopRequested)
				{
					System.Diagnostics.Debug.WriteLine("{0}, avg = {1}ms", this.counter, this.avgStepDurationMs);
					MessageBox.Show("Finished, avg ms = " + this.avgStepDurationMs);
				}
			});
		}
		public override void Dispose()
		{
			this.stopRequested = true;
		}
		public override void SizeChanged(Size size)
        {
            this.glControl.Invalidate();
        }
        public override void Render()
        {
            lock (this.device)
			{
				this.device.DrawCells(this.dotBuffer.ToArray(), this.colorBuffer.ToArray());
				this.dotBuffer.Clear();
				this.colorBuffer.Clear();
			}
		}
        public override void Tick()
        {
        }

		Gl2DGridDevice device = new Gl2DGridDevice();
		Space space;
		volatile bool stopRequested = false;

		SpaceIterator spaceIterator;
		ulong counter = 0;
		List<PointF> dotBuffer = new List<PointF>();
		List<Color> colorBuffer = new List<Color>();

		DateTime stepStart;
		DateTime stepEnd;
		double avgStepDurationMs = 0;
	}
}
