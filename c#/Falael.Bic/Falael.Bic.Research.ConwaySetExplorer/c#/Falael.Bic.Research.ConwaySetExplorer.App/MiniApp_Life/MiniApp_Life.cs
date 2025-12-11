using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.Windows.Forms;

using Falael.Visualization;
using Falael.Bic.GameOfLife;
using OpenGL;

namespace Falael.Bic.Research.ConwaySetExplorer.MiniApp_Life
{
    public class MiniApp_Life : MiniApp
    {
        public MiniApp_Life() : base(true) { }

		public override void Dispose()
		{
			this.timer.Stop();
		}

        public override void Init(Form mainForm, GlControl glControl, Panel controlsPanel, string storageBasePath)
        {
            base.Init(mainForm, glControl, controlsPanel, storageBasePath);

            this.timer = new System.Timers.Timer();
            this.timer.AutoReset = false;
            this.timer.Interval = 500;
            this.timer.Elapsed += this.Timer_Elapsed;

            this.controlsUserControl = new FuzzyFileControls_UserControl();
            this.controlsPanel.Controls.Add(this.controlsUserControl);
            this.controlsUserControl.Dock = DockStyle.Top;
            this.controlsUserControl.Changed += this.ControlsUserControl_Changed;
            this.controlsUserControl.OnChanged();

            this.device.Scale = 0.01f;
            this.device.DotMargin = 0.1f;
            this.device.Size = this.glControl.Size;

            this.SizeChanged(this.glControl.Size);

            //this.lifeDocument.SetConfiguration(LifeResources.rPentomino);
            //this.lifeDocument.Rules = LifeResources.conway3Rules;
        }

        const int wrapRadius = 15;

        void ControlsUserControl_Changed(object sender, EventArgs e)
        {
            this.lifeDocument.Clear();
            this.lifeDocument.SetConfiguration(LifeResources.GenerateRandomConfiguration(wrapRadius, new int[] { LifeDocument.DEAD, LifeDocument.ALIVE }));
            this.lifeDocument.Rules = LifeResources.BuildConwayFuzzyRules(
                this.controlsUserControl.DeathByIsolation,
                this.controlsUserControl.DeathByOvercrowding,
                this.controlsUserControl.Birth);

            this.timer.Enabled = false;
            this.timer.Enabled = true;
            this.cancelCurrentExplorationCycle = true;
        }

        void Timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            this.cancelCurrentExplorationCycle = false;

            lock (this)
            {
                if (!this.controlsUserControl.IsDisposed && !this.controlsUserControl.Disposing)
				{
					try
					{
						this.controlsUserControl.BeginInvoke(new Action(() =>
						{
							this.controlsUserControl.DetailsText = "Calculating...";
						}));
					}
					catch (Exception ex)
					{
						System.Diagnostics.Debug.WriteLine(ex);
					}
				}

                LifeDocument explorationDocument = new LifeDocument();
                explorationDocument.Rules = LifeResources.BuildConwayFuzzyRules(
                    this.controlsUserControl.DeathByIsolation,
                    this.controlsUserControl.DeathByOvercrowding,
                    this.controlsUserControl.Birth);
                ConwaySet conwaySet = new ConwaySet(explorationDocument, new ConwaySet.ExplorationOptions { iterationCount = 1000, activeTreshold = 8 });
                ConwaySet.ExplorationStatsAverage explorationStatsAverage = new ConwaySet.ExplorationStatsAverage();
                while (!this.cancelCurrentExplorationCycle)
                {
                    var configuration = LifeResources.GenerateRandomConfiguration(wrapRadius, new int[] { LifeDocument.DEAD, LifeDocument.ALIVE });
                    explorationDocument.SetConfiguration(configuration);

                    List<ConwaySet.DataItem> setData = conwaySet.Explore();
                    ConwaySet.ExplorationStats explorationStats = conwaySet.Analyse(setData);
                    explorationStatsAverage.Add(explorationStats);

                    if(this.controlsUserControl.InvokeRequired && !this.controlsUserControl.IsDisposed && !this.controlsUserControl.Disposing)
					{
						try
						{
							this.controlsUserControl.BeginInvoke(new Action(() =>
							{
								this.controlsUserControl.DetailsText = explorationStatsAverage.ToString();
							}));
						}
						catch (Exception ex)
						{
							System.Diagnostics.Debug.WriteLine(ex);
						}
					}
				}
            }

            this.cancelCurrentExplorationCycle = false;
        }

        public override void SizeChanged(Size size)
        {
            this.device.Size = this.glControl.Size;
            this.glControl.Invalidate();
        }
        public override void Render()
        {
            lock (this.lifeDocument)
            {
				this.device.Clear();

				List<PointF> dots = new List<PointF>();
				var cells = this.lifeDocument.QueryOccupiedCells();
				for (int length = cells.Length, i = 0; i < length; ++i)
				{
					var cell = cells[i];
					dots.Add(new PointF(cell.gridPoint.x, cell.gridPoint.y));
				}

				this.device.DrawCells(dots.ToArray(), Color.Red);
			}
		}
        public override void Tick()
        {
            lock (this.lifeDocument)
            {
                this.lifeDocument.NextGeneration();
            }

            this.glControl.Invalidate();
        }

        LifeDocument lifeDocument = new LifeDocument();
		Gl2DGridDevice device = new Gl2DGridDevice();

		FuzzyFileControls_UserControl controlsUserControl;

        System.Timers.Timer timer;
        volatile bool cancelCurrentExplorationCycle = false;
    }
}
