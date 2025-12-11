using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

using OpenGL;

using Falael.Visualization;
using Falael.Data.Spatial;
using Falael.Bic.GameOfLife;
using System.IO;

namespace Falael.Bic.Research.ConwaySetExplorer.MiniApp_ConwaySet_Explorer.V01
{
	public class MiniApp_ConwaySet_Explorer_V01 : MiniApp
	{
		#region Constructors
		public MiniApp_ConwaySet_Explorer_V01() : base(false) { }
		#endregion

		#region Configuration
		const int GOL_wrapRadius = 10;
		const int GOL_activeTreshold = 8;
		const int GOL_iterationCount = 2000;
		const int GOL_experimentRepeatCount = 20;

		const int DRAW_DirectChunk_step = 500000;
		const int DRAW_BufferChunk_step = 1000;
		const int DRAW_directRenderModeTreshold_BufferChunk = -1;
		const int DRAW_directRenderModeTreshold_EnterDirect = 1000000;
		const int DRAW_directRenderModeTreshold_EnterDirectChunk = 5000000;
		const decimal DRAW_axisDotStep = 0.1m;

		const float CONTROLER_hitTestZResolution = 0.1f;

		//const int SPACE_maxp = 4;
		//const ulong SPACE_frag = 8;
		const int SPACE_maxp = 4;
		const ulong SPACE_frag = 32;

		const string STORAGE_path = @"bic-conway-set";
		#endregion

		#region MiniApp overrides
		public override void Init(Form mainForm, GlControl glControl, Panel controlsPanel, string storageBasePath)
		{
			base.Init(mainForm, glControl, controlsPanel, storageBasePath);

			this.controlsUserControl = new ConwaySet_Explorer_UserControl();
			this.controlsPanel.Controls.Add(this.controlsUserControl);
			this.controlsUserControl.Dock = DockStyle.Top;
			this.controlsUserControl.LifeSettingsChanged += this.ControlsUserControl_LifeSettingsChanged;
			this.controlsUserControl.OnLifeSettingsChanged();
			this.controlsUserControl.ColoringAlgorithmChanged += this.ControlsUserControl_ColoringAlgorithmChanged;
			this.controlsUserControl.FilteringAlgorithmChanged += this.ControlsUserControl_FilteringAlgorithmChanged;

			this.device = new Gl3DDotDevice(this.glControl.Size, 0.05f);
			this.device.Clear();

			this.SetupCotroller(glControl);

			//this.device.DrawDemoPyramids();
			//return;


			Func<ulong, int, ulong> getfrag = (origin, p) =>
			{
				if (p == 0)
				{
					return origin;
				}
				ulong frag = (ulong)Math.Ceiling(origin / (decimal)((p + 1) * (p + 1) * (p + 1)));
				return frag > 1 ? frag : 2;
			};

			decimal n1 = 0, n2 = 8;
			decimal center = (n2 - n1) / 2;

            IDimension dim_isolationTreshold = new FractalDimension(SPACE_frag, SPACE_maxp, n1, n2, getfrag);
            IDimension dim_overcrowdingTreshold = new FractalDimension(SPACE_frag, SPACE_maxp, n1, n2, getfrag);
            IDimension dim_birthCondition = new FractalDimension(SPACE_frag, SPACE_maxp, n1, n2, getfrag);
			ISpace space = new Space(new IDimension[] { dim_isolationTreshold, dim_overcrowdingTreshold, dim_birthCondition });
			this.conwaySetExplorer = new ConwaySetExplorer(space, SPACE_frag, GOL_wrapRadius, GOL_iterationCount, GOL_experimentRepeatCount, GOL_activeTreshold, Path.Combine(base.storageBasePath, STORAGE_path));
            this.conwaySetExplorer.Progress += this.ConwaySetExplorer_Progress;

			#region Storage test
			//SpaceIterator testindexer = space.First();
			//for(int length = 200000, i = 0; i < length; ++i)
			//{
			//	testindexer = space.Next(testindexer);
			//}

			//lock (this.conwaySetExplorer.SpatialStorage)
			//{
			//	Space.Indexer lastindexer = this.conwaySetExplorer.SpatialStorage.LastIndexer;
			//	decimal[] vvector = space.GetAt(testindexer);

			//	ConwaySet.ExplorationStatsAverageInfo src = new ConwaySet.ExplorationStatsAverageInfo
			//	{
			//		finite = 1f,
			//		activeCellCountTrend = 2f,
			//		generationSizeTrend = 100f,
			//		fulnessTrend = 666f,
			//		averageFullnessPercent = 0.001f,
			//		averageActivity = -888.888f,
			//		averageGenerationSize = 348576139.3465546f,
			//	};
			//	this.conwaySetExplorer.SpatialStorage.SetAt(vvector, src, false);

			//	ConwaySet.ExplorationStatsAverageInfo? info = this.conwaySetExplorer.SpatialStorage.GetAt(vvector, false);
			//	if (info.HasValue)
			//	{
			//		ConwaySet.ExplorationStatsAverageInfo explorationStatsAverageInfo = (ConwaySet.ExplorationStatsAverageInfo)info;
			//	}
			//}
			//return;
			#endregion

			this.conwaySetExplorer.Resume();

			this.SizeChanged(this.glControl.Size);
			this.ActivateView();
		}
		public override void SizeChanged(Size size)
		{
			if(size.Width == 0 || size.Height == 0)
			{
				this.DeactivateView();
				return;
			}
			this.ActivateView();
			this.device.Size = this.glControl.Size;
			this.Invalidate();
		}
		public override void Render()
		{
			lock (this.device)
			{
				switch (this.renderMode)
				{
					case RenderMode.Buffer:
					case RenderMode.BufferChunk:
						this.device.Clear();
						this.RenderCursor();
						if (this.dotBuffer.Count != 0 && this.dotBuffer.Count == this.colorBuffer.Count)
						{
							this.device.DrawDots(this.dotBuffer.ToArray(), this.colorBuffer.ToArray());
						}
						this.RenderProgressDots();
						this.RenderDataHighlights();
						this.RenderAxes();
						break;
					case RenderMode.Direct:
					case RenderMode.DirectChunk:
						this.RenderCursor();
						if (this.dotBuffer.Count != 0 && this.dotBuffer.Count == this.colorBuffer.Count)
						{
							this.device.DrawDots(this.dotBuffer.ToArray(), this.colorBuffer.ToArray());
						}
						this.RenderProgressDots();
						this.RenderDataHighlights();
						this.dotBuffer.Clear();
						this.colorBuffer.Clear();
						break;
					default:
						throw new NotImplementedException();
				}
			}
		}
		public override void Tick()
		{
		}

		public override void Dispose()
		{
			this.conwaySetExplorer.Pause();
		}
		#endregion

		#region Presentation
		enum RenderMode
		{
			Buffer,
			BufferChunk,
			Direct,
			DirectChunk,
		}

		protected void ActivateView()
		{
			if(this.viewIsActive)
			{
				return;
			}
			this.viewIsActive = true;

			ISpace space = this.conwaySetExplorer.SpatialStorage.SpatialStorageIndex.Space;
			decimal center = (space.Dimensions[0].N2 - space.Dimensions[0].N1) / 2;

			this.spaceIterator = space.First();

			int current_ipi = 0;

			Task.Run(() =>
			{
				this.DrawAxes(space, center);

				while (counter < space.TickCount && !this.viewDeactivateRequested)
				{
					lock (this.conwaySetExplorer.SpatialStorage)
					{
						if (this.spaceIterator.CompareTo(this.conwaySetExplorer.SpatialStorage.LastSpaceIterator) >= 0)
						{
							this.DrawProgressDots(space, center);
							this.Invalidate();
							continue;
						}
					}

					lock (this.device)
					{
						this.stepStart = DateTime.Now;

						this.DrawProgressDots(space, center);

						decimal[] vvector = space.GetAt(this.spaceIterator);

						Gl3DDotDevice.PointF3D dot = new Gl3DDotDevice.PointF3D
						{
							X = (float)vvector[0] - (float)center,
							Y = (float)vvector[1] - (float)center,
							Z = (float)vvector[2] - (float)center
						};

						#region Draw space points
						//ulong[] pvector = space.GetPvector(indexer.Ipi);
						//ulong p_max = pvector.Max();
						//ulong p_min = pvector.Min();
						//int blue = 255 - (int)Math.Round(255 * p_max / (decimal)SPACE_maxp);
						//int green = 255 - (int)Math.Round(255 * p_min / (decimal)SPACE_maxp);
						//Color dotColor = Color.FromArgb(255, 255, green, blue);
						//this.colorBuffer.Add(dotColor);
						//this.dotBuffer.Add(dot); ++this.dot_counter;
						#endregion

						lock (this.conwaySetExplorer.SpatialStorage)
						{
							ConwaySet.ExplorationStatsAverageInfo? info = this.conwaySetExplorer.SpatialStorage.GetAt(vvector, EDimensionHitTestHint.Precise);
							if (!info.HasValue)
							{
								this.colorBuffer.Add(Color.Red);
								this.dotBuffer.Add(dot); ++this.dot_counter;
							}
							else
							{
								ConwaySet.ExplorationStatsAverageInfo explorationStatsAverageInfo = (ConwaySet.ExplorationStatsAverageInfo)info;

								bool isPointAccepted = true;
								if(this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.IsInfinite))
								{
									if (!(explorationStatsAverageInfo.finite < 0.999f)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.IsFinite))
								{
									if (!(explorationStatsAverageInfo.finite >= 0.999f)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.PositiveActiveCellCountTrend))
								{
									if (!(explorationStatsAverageInfo.activeCellCountTrend > 0)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.NegativeActiveCellCountTrend))
								{
									if (!(explorationStatsAverageInfo.activeCellCountTrend <= 0)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.PositiveGenerationSizeTrend))
								{
									if (!(explorationStatsAverageInfo.generationSizeTrend > 0)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.NegativeGenerationSizeTrend))
								{
									if (!(explorationStatsAverageInfo.generationSizeTrend <= 0)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.PositiveFulnessTrend))
								{
									if (!(explorationStatsAverageInfo.fulnessTrend > 0)) isPointAccepted = false;
								}
								if (this.controlsUserControl.FilteringAlgorithm.HasFlag(ConwaySet_Explorer_UserControl.EFilteringAlgorithm.NegativeFulnessTrend))
								{
									if (!(explorationStatsAverageInfo.fulnessTrend <= 0)) isPointAccepted = false;
								}

								if (isPointAccepted)
								{
									int red = 0, green = 0, blue = 0;
									int absColor;

									switch (this.controlsUserControl.ColoringAlgorithm)
									{
										case ConwaySet_Explorer_UserControl.EColoringAlgorithm.Activity:
											red = (int)Math.Round(255 * explorationStatsAverageInfo.averageActivity / 400);
											absColor = (int)Math.Round(255 * Math.Abs(explorationStatsAverageInfo.activeCellCountTrend / 100));
											if (explorationStatsAverageInfo.activeCellCountTrend > 0)
											{
												green = absColor;
											}
											else
											{
												blue = absColor;
											}
											break;
										case ConwaySet_Explorer_UserControl.EColoringAlgorithm.Population:
											red = (int)Math.Round(255 * explorationStatsAverageInfo.averageGenerationSize / 100);
											if (explorationStatsAverageInfo.generationSizeTrend > 0)
											{
												green = (int)Math.Round(255 * Math.Abs(explorationStatsAverageInfo.generationSizeTrend / 100));
											}
											else
											{
												blue = (int)Math.Round(255 * Math.Abs(explorationStatsAverageInfo.generationSizeTrend / 5));
											}
											break;
										case ConwaySet_Explorer_UserControl.EColoringAlgorithm.Fullness:
											red = (int)Math.Round(255 * explorationStatsAverageInfo.averageFullnessPercent / 75);
											if (explorationStatsAverageInfo.fulnessTrend > 0)
											{
												green = (int)Math.Round(255 * Math.Abs(explorationStatsAverageInfo.fulnessTrend / 100));
											}
											else
											{
												blue = (int)Math.Round(255 * Math.Abs(explorationStatsAverageInfo.fulnessTrend / 5));
											}
											break;
									}

									if (red < 0) red = 0;
									if (green < 0) green = 0;
									if (blue < 0) blue = 0;
									if (red > 255) red = 255;
									if (green > 255) green = 255;
									if (blue > 255) blue = 255;

									this.colorBuffer.Add(Color.FromArgb(255, red, green, blue));
									this.dotBuffer.Add(dot); ++this.dot_counter;
								}
							}
						}

						this.spaceIterator = space.Next(this.spaceIterator);
						++counter;

						this.stepEnd = DateTime.Now;
						double stepDurationMs = (this.stepEnd - this.stepStart).TotalMilliseconds;
						this.avgStepDurationMs = this.avgStepDurationMs + (stepDurationMs - this.avgStepDurationMs) / counter;
					}

					if (this.dot_counter > DRAW_directRenderModeTreshold_EnterDirectChunk)
					{
						this.renderMode = RenderMode.DirectChunk;
					}
					else if (this.dot_counter > DRAW_directRenderModeTreshold_EnterDirect)
					{
						this.renderMode = RenderMode.Direct;
					}
					else if (this.dot_counter > DRAW_directRenderModeTreshold_BufferChunk)
					{
						this.renderMode = RenderMode.BufferChunk;
					}
					else
					{
						this.renderMode = RenderMode.Buffer;
					}

					switch (this.renderMode)
					{
						case RenderMode.Buffer:
						case RenderMode.Direct:
							this.Invalidate();
							break;
						case RenderMode.BufferChunk:
							if (spaceIterator.Ipi != current_ipi || counter % DRAW_BufferChunk_step == 0)
							{
								current_ipi = spaceIterator.Ipi;
								this.Invalidate();
							}
							break;
						case RenderMode.DirectChunk:
							if (spaceIterator.Ipi != current_ipi || counter % DRAW_DirectChunk_step == 0)
							{
								current_ipi = spaceIterator.Ipi;
								this.Invalidate();
							}
							break;
						default:
							throw new NotImplementedException();
					}
				}
				System.Diagnostics.Debug.WriteLine("{0}, avg = {1}ms", this.counter, this.avgStepDurationMs);
				this.controlsUserControl.DetailsText = "Stopped, avg ms = " + this.avgStepDurationMs;
				this.viewDeactivateRequested = false;
				this.viewIsActive = false;
			});
		}
		protected void DeactivateView()
		{
			if (!this.viewIsActive)
			{
				return;
			}
			this.viewDeactivateRequested = true;
		}
		protected void Invalidate()
		{
			if (this.glControl.InvokeRequired && !this.glControl.IsDisposed && !this.glControl.Disposing)
			{
				try
				{
					this.glControl.Invoke(new Action(() =>
					{
						this.glControl.Invalidate();
						Application.DoEvents();
					}));
				}
				catch (Exception ex)
				{
					System.Diagnostics.Debug.WriteLine(ex);
				}
			}
		}
		protected void Reset()
		{
			this.spaceIterator = new SpaceIterator(0, 0);
			this.dot_counter = 0;
			this.device.Clear();
			this.dotBuffer.Clear();
			this.colorBuffer.Clear();
			this.RenderAxes();
		}
		protected void SetText(string text)
		{
			this.controlsUserControl.DetailsText = text;
		}
        protected void UpdateStatusText()
        {
            StringBuilder sb = new StringBuilder();
            if (this.conwaySetExplorer_Progress != null)
            {
                float totalPtogressPercent = (float)Math.Round(this.conwaySetExplorer_Progress.TotalPtogress * 10000f) / 100f;
                float experimentPtogressPercent = (float)Math.Round(this.conwaySetExplorer_Progress.ExperimentPtogress * 10000f) / 100f;
                float avgStepDurationSec = (float)Math.Round(this.conwaySetExplorer_Progress.AvgStepDurationMs * 100f / 1000f) / 100f;
                sb.AppendFormat("Progress: {0}%, Experiment: {1}%", totalPtogressPercent, experimentPtogressPercent);
                sb.AppendLine();
                sb.AppendFormat("Avg. time: {0}sec", avgStepDurationSec);
                sb.AppendLine();
            }
            sb.AppendLine(this.conwaySetExplorer.SpatialStorage.LastSpaceIterator.ToString());
            this.SetText(sb.ToString());
        }

		SpaceIterator spaceIterator;
		ulong counter = 0;
		List<Gl3DDotDevice.PointF3D> dotBuffer = new List<Gl3DDotDevice.PointF3D>();
		List<Color> colorBuffer = new List<Color>();

		bool viewIsActive = false;
		bool viewDeactivateRequested = false;
        ConwaySetExplorer.ProgressEventArgs conwaySetExplorer_Progress = null;

		DateTime stepStart;
		DateTime stepEnd;
		double avgStepDurationMs = 0;

		RenderMode renderMode = RenderMode.BufferChunk;
		int dot_counter = 0;

		#region Axes
		protected void DrawAxes(ISpace space, decimal center)
		{
			lock (this.device)
			{
				List<Gl3DDotDevice.PointF3D> axis_Ox_list = new List<Gl3DDotDevice.PointF3D>();
				for (decimal length = space.Dimensions[0].N2, x = 0; x <= length; x += DRAW_axisDotStep)
				{
					axis_Ox_list.Add(new Gl3DDotDevice.PointF3D
					{
						X = (float)x - (float)center,
						Y = -(float)center,
						Z = -(float)center
					});
				}
				this.axis_Ox = axis_Ox_list.ToArray();
			}

			List<Gl3DDotDevice.PointF3D> axis_Oy_list = new List<Gl3DDotDevice.PointF3D>();
			for (decimal length = space.Dimensions[1].N2, y = 0; y <= length; y += DRAW_axisDotStep)
			{
				axis_Oy_list.Add(new Gl3DDotDevice.PointF3D
				{
					X = -(float)center,
					Y = (float)y - (float)center,
					Z = -(float)center
				});
			}
			this.axis_Oy = axis_Oy_list.ToArray();

			List<Gl3DDotDevice.PointF3D> axis_Oz_list = new List<Gl3DDotDevice.PointF3D>();
			for (decimal length = space.Dimensions[2].N2, z = 0; z <= length; z += DRAW_axisDotStep)
			{
				axis_Oz_list.Add(new Gl3DDotDevice.PointF3D
				{
					X = -(float)center,
					Y = -(float)center,
					Z = (float)z - (float)center
				});
			}
			this.axis_Oz = axis_Oz_list.ToArray();
		}
		protected void RenderAxes()
		{
			this.device.DrawDots(this.axis_Ox, Color.Yellow);
			this.device.DrawDots(this.axis_Oy, Color.Cyan);
			this.device.DrawDots(this.axis_Oz, Color.Magenta);
		}
		Gl3DDotDevice.PointF3D[] axis_Ox;
		Gl3DDotDevice.PointF3D[] axis_Oy;
		Gl3DDotDevice.PointF3D[] axis_Oz;
		#endregion

		#region Progress dots
		protected void DrawProgressDots(ISpace space, decimal center)
		{
			decimal[] explorerVvector = space.GetAt(this.conwaySetExplorer.SpatialStorage.LastSpaceIterator);
			inticator_currentExplorerDot_prev = inticator_currentExplorerDot;
			inticator_currentExplorerDot = new Gl3DDotDevice.PointF3D
			{
				X = (float)explorerVvector[0] - (float)center,
				Y = (float)explorerVvector[1] - (float)center,
				Z = (float)explorerVvector[2] - (float)center
			};

			decimal[] vvector = space.GetAt(this.spaceIterator);

			inticator_currentPainterDot_prev = inticator_currentPainterDot;
			inticator_currentPainterDot = new Gl3DDotDevice.PointF3D
			{
				X = (float)vvector[0] - (float)center,
				Y = (float)vvector[1] - (float)center,
				Z = (float)vvector[2] - (float)center
			};
		}
		protected void RenderProgressDots()
		{
			switch (this.renderMode)
			{
				case RenderMode.Buffer:
				case RenderMode.BufferChunk:
					this.device.DrawDot(this.inticator_currentPainterDot, Color.Cyan);
					this.device.DrawDot(this.inticator_currentExplorerDot, Color.OrangeRed);
					break;
				case RenderMode.Direct:
				case RenderMode.DirectChunk:
					this.device.DrawDot(this.inticator_currentPainterDot_prev, Color.Black);
					this.device.DrawDot(this.inticator_currentExplorerDot_prev, Color.Black);
					this.device.DrawDot(this.inticator_currentPainterDot, Color.Cyan);
					this.device.DrawDot(this.inticator_currentExplorerDot, Color.OrangeRed);
					break;
				default:
					throw new NotImplementedException();
			}
		}
		Gl3DDotDevice.PointF3D inticator_currentPainterDot;
		Gl3DDotDevice.PointF3D inticator_currentPainterDot_prev;
		Gl3DDotDevice.PointF3D inticator_currentExplorerDot;
		Gl3DDotDevice.PointF3D inticator_currentExplorerDot_prev;
		#endregion

		#region Cursor
		protected void DrawCursor()
		{
			if (this.device == null)
			{
				return;
			}

			lock (this.device)
			{
				var space = this.conwaySetExplorer.SpatialStorage.SpatialStorageIndex.Space;
				decimal center = (space.Dimensions[0].N2 - space.Dimensions[0].N1) / 2;

				this.inticator_cursorLines_prev = this.inticator_cursorLines;

				List<Gl3DDotDevice.LineF3D> result = new List<Gl3DDotDevice.LineF3D>();

				var xv = this.cursor.X;
				var yv = (float)space.Dimensions[0].N2 - this.cursor.Y;
				var zv = this.cursor.Z;

				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = -(float)center,
					Y1 = (float)center,
					Z1 = zv - (float)center,

					X2 = -(float)center,
					Y2 = (float)center - (float)space.Dimensions[0].N2,
					Z2 = zv - (float)center,
				});
				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = xv - (float)center,
					Y1 = (float)center,
					Z1 = zv - (float)center,

					X2 = xv - (float)center,
					Y2 = (float)center - (float)space.Dimensions[0].N2,
					Z2 = zv - (float)center,
				});
				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = (float)space.Dimensions[0].N2 - (float)center,
					Y1 = (float)center,
					Z1 = zv - (float)center,

					X2 = (float)space.Dimensions[0].N2 - (float)center,
					Y2 = (float)center - (float)space.Dimensions[0].N2,
					Z2 = zv - (float)center,
				});

				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = 0 - (float)center,
					Y1 = (float)center,
					Z1 = zv - (float)center,

					X2 = (float)space.Dimensions[0].N2 - (float)center,
					Y2 = (float)center,
					Z2 = zv - (float)center,
				});
				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = 0 - (float)center,
					Y1 = (float)center - yv,
					Z1 = zv - (float)center,

					X2 = (float)space.Dimensions[0].N2 - (float)center,
					Y2 = (float)center - yv,
					Z2 = zv - (float)center,
				});
				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = 0 - (float)center,
					Y1 = (float)center - (float)space.Dimensions[0].N2,
					Z1 = zv - (float)center,

					X2 = (float)space.Dimensions[0].N2 - (float)center,
					Y2 = (float)center - (float)space.Dimensions[0].N2,
					Z2 = zv - (float)center,
				});

				result.Add(new Gl3DDotDevice.LineF3D
				{
					X1 = xv - (float)center,
					Y1 = (float)center - yv,
					Z1 = -(float)center,

					X2 = xv - (float)center,
					Y2 = (float)center - yv,
					Z2 = (float)space.Dimensions[0].N2 - (float)center,
				});

				this.inticator_cursorLines = result.ToArray();
			}
		}
		protected void RenderCursor()
		{
			switch (this.renderMode)
			{
				case RenderMode.Buffer:
				case RenderMode.BufferChunk:
					if (this.inticator_cursorLines != null)
					{
						this.device.DrawLines(this.inticator_cursorLines, Color.FromArgb(100, Color.LimeGreen));
					}
					break;
				case RenderMode.Direct:
				case RenderMode.DirectChunk:
					if (this.inticator_cursorLines_prev != null)
					{
						this.device.DrawLines(this.inticator_cursorLines_prev, Color.Black);
					}
					if (this.inticator_cursorLines != null)
					{
						this.device.DrawLines(this.inticator_cursorLines, Color.FromArgb(100, Color.LimeGreen));
					}
					break;
				default:
					throw new NotImplementedException();
			}
		}
		Gl3DDotDevice.LineF3D[] inticator_cursorLines;
		Gl3DDotDevice.LineF3D[] inticator_cursorLines_prev;
		#endregion

		#region Data highlights
		protected void DrawDataHighlights()
		{
			if (this.device == null)
			{
				return;
			}

			lock (this.device)
			{
				var space = this.conwaySetExplorer.SpatialStorage.SpatialStorageIndex.Space;
				decimal center = (space.Dimensions[0].N2 - space.Dimensions[0].N1) / 2;

				this.inticator_dataHighlightDots_prev = this.inticator_dataHighlightDots;

				var result = new List<Gl3DDotDevice.PointF3D>();
				var hitTestResult = space.HitTest(new decimal[] { (decimal)this.cursor.X, (decimal)this.cursor.Y, (decimal)this.cursor.Z }, EDimensionHitTestHint.Nearest);
				if (hitTestResult.Success)
				{
					result.Add(new Gl3DDotDevice.PointF3D
					{
						X = this.cursor.X - (float)center,
						Y = this.cursor.Y - (float)center,
						Z = this.cursor.Z - (float)center
					});
				}
				this.inticator_dataHighlightDots = result.ToArray();
			}
		}
		protected void RenderDataHighlights()
		{
			switch (this.renderMode)
			{
				case RenderMode.Buffer:
				case RenderMode.BufferChunk:
					this.device.DrawDots(this.inticator_dataHighlightDots, Color.White);
					break;
				case RenderMode.Direct:
				case RenderMode.DirectChunk:
					this.device.DrawDots(this.inticator_dataHighlightDots_prev, Color.Black);
					this.device.DrawDots(this.inticator_dataHighlightDots, Color.White);
					break;
				default:
					throw new NotImplementedException();
			}
		}

		Gl3DDotDevice.PointF3D[] inticator_dataHighlightDots;
		Gl3DDotDevice.PointF3D[] inticator_dataHighlightDots_prev;
		#endregion

		Gl3DDotDevice device;
		#endregion

		#region Controller
		protected void SetupCotroller(GlControl glControl)
        {
            glControl.MouseDown += this.GlControl_MouseDown;
            glControl.MouseMove += GlControl_MouseMove;
            glControl.MouseUp += this.GlControl_MouseUp;
            glControl.MouseWheel += this.GlControl_MouseWheel;

			glControl.KeyDown += this.GlControl_KeyDown;
			glControl.KeyUp += this.GlControl_KeyUp;
		}

		void ControlsUserControl_ColoringAlgorithmChanged(object sender, EventArgs e)
		{
			this.Reset();
		}
		void ControlsUserControl_FilteringAlgorithmChanged(object sender, EventArgs e)
		{
			this.Reset();
		}
		void ConwaySetExplorer_Progress(object sender, ConwaySetExplorer.ProgressEventArgs e)
		{
			this.conwaySetExplorer_Progress = e;
			this.UpdateStatusText();
		}

		protected void controller_MouseUpdateCursor(Point screenPoint, bool treatYasZ)
		{
			var space = this.conwaySetExplorer.SpatialStorage.SpatialStorageIndex.Space;

			if (treatYasZ)
			{
				var value2 = ((float)this.device.Size.Height - (float)screenPoint.Y) * (float)space.Dimensions[0].N2 / (float)this.device.Size.Height;
				if (value2 < (float)space.Dimensions[0].N1) value2 = (float)space.Dimensions[0].N1;
				if (value2 > (float)space.Dimensions[0].N2) value2 = (float)space.Dimensions[0].N2;
				this.controlsUserControl.Birth = value2;
			}
			else
			{
				var value1 = (float)screenPoint.X * (float)space.Dimensions[0].N2 / (float)this.device.Size.Width;
				if (value1 < (float)space.Dimensions[0].N1) value1 = (float)space.Dimensions[0].N1;
				if (value1 > (float)space.Dimensions[0].N2) value1 = (float)space.Dimensions[0].N2;
				this.controlsUserControl.DeathByIsolation = value1;

				var value2 = ((float)this.device.Size.Height - (float)screenPoint.Y) * (float)space.Dimensions[0].N2 / (float)this.device.Size.Height;
				if (value2 < (float)space.Dimensions[0].N1) value2 = (float)space.Dimensions[0].N1;
				if (value2 > (float)space.Dimensions[0].N2) value2 = (float)space.Dimensions[0].N2;
				this.controlsUserControl.DeathByOvercrowding = value2;
			}
		}
		protected void controller_MouseUpdateCursor(float delta)
		{
			var space = this.conwaySetExplorer.SpatialStorage.SpatialStorageIndex.Space;
			var value = this.controlsUserControl.Birth * (delta + 1);
			if (value < (float)space.Dimensions[0].N1) value = (float)space.Dimensions[0].N1;
			if (value > (float)space.Dimensions[0].N2) value = (float)space.Dimensions[0].N2;
			this.controlsUserControl.Birth = value;
		}
		protected void controller_MouseZoom(float delta)
		{
			lock (this.device)
			{
				this.device.Scale += this.device.Scale * delta;
				switch (this.renderMode)
				{
					case RenderMode.Buffer:
					case RenderMode.BufferChunk:
						break;
					case RenderMode.Direct:
					case RenderMode.DirectChunk:
						this.Reset();
						break;
					default:
						throw new NotImplementedException();
				}
				this.Invalidate();
			}
		}
		protected void controller_CaptureMouseRotate(Point screenPoint)
		{
			this.mouseDownPoint = screenPoint;
			this.initialRotation = this.device.Rotation;
			this.isRotating = true;
		}
		protected void controller_MouseRotate(Point screenPoint)
		{
			if (!this.isRotating)
			{
				return;
			}

			int deltaX = screenPoint.X - this.mouseDownPoint.X;
			int deltaY = screenPoint.Y - this.mouseDownPoint.Y;
			lock (this.device)
			{
				this.device.Rotation = new SizeF(this.initialRotation.Width + deltaX / 8, this.initialRotation.Height + deltaY / 8);
				switch (this.renderMode)
				{
					case RenderMode.Buffer:
					case RenderMode.BufferChunk:
						break;
					case RenderMode.Direct:
					case RenderMode.DirectChunk:
						this.Reset();
						break;
					default:
						throw new NotImplementedException();
				}
				this.Invalidate();
			}
		}
		protected void controller_ReleaseMouseRotate()
		{
			this.isRotating = false;
		}
		protected void controller_CaptureMousePan(Point screenPoint)
		{
			this.mouseDownPoint = screenPoint;
			this.initialPan = this.device.Pan;
			this.isPanning = true;
		}
		protected void controller_MousePan(Point screenPoint)
		{
			if (!this.isPanning)
			{
				return;
			}

			lock (this.device)
			{
				var sp = this.device.Unproject(screenPoint.X, screenPoint.Y, 0f);
				var mdp = this.device.Unproject(mouseDownPoint.X, mouseDownPoint.Y, 0f);

				if (!sp.HasValue || !mdp.HasValue)
				{
					return;
				}

				float deltaXf = sp.Value.X - mdp.Value.X;
				float deltaYf = sp.Value.Y - mdp.Value.Y;
				float deltaZf = sp.Value.Z - mdp.Value.Z;
				this.device.Pan = new Gl3DDotDevice.SizeF3D
				{
					Width = this.initialPan.Width + deltaXf,
					Height = this.initialPan.Height + deltaYf,
					Depth = this.initialPan.Depth + deltaZf
				};
				switch (this.renderMode)
				{
					case RenderMode.Buffer:
					case RenderMode.BufferChunk:
						break;
					case RenderMode.Direct:
					case RenderMode.DirectChunk:
						this.Reset();
						break;
					default:
						throw new NotImplementedException();
				}
				this.Invalidate();
			}
		}
		protected void controller_ReleaseMousePan()
		{
			this.isPanning = false;
		}

		void GlControl_KeyDown(object sender, KeyEventArgs e)
		{
			if (e.KeyCode == Keys.Space)
			{
				this.isSpaceDown = true;
			}
		}
		void GlControl_KeyUp(object sender, KeyEventArgs e)
		{
			if (e.KeyCode == Keys.Space)
			{
				this.isSpaceDown = false;
			}
		}
		void GlControl_MouseWheel(object sender, MouseEventArgs e)
        {
			this.controller_MouseZoom(e.Delta * 0.1f / 120);
		}
        void GlControl_MouseDown(object sender, MouseEventArgs e)
        {
			if(Control.ModifierKeys.HasFlag(Keys.Alt))
			{
				this.controller_CaptureMouseRotate(new Point(e.X, e.Y));
			}
			else if(this.isSpaceDown)
			{
				this.controller_CaptureMousePan(new Point(e.X, e.Y));
			}
		}
        void GlControl_MouseMove(object sender, MouseEventArgs e)
        {
			if(Control.ModifierKeys.HasFlag(Keys.Control))
			{
				this.controller_MouseUpdateCursor(new Point(e.X, e.Y), false);
			}
			else if (Control.ModifierKeys.HasFlag(Keys.Shift))
			{
				this.controller_MouseUpdateCursor(new Point(e.X, e.Y), true);
			}
			this.controller_MouseRotate(new Point(e.X, e.Y));
			this.controller_MousePan(new Point(e.X, e.Y));
		}
		void GlControl_MouseUp(object sender, MouseEventArgs e)
        {
			this.controller_ReleaseMouseRotate();
			this.controller_ReleaseMousePan();
		}

		void ControlsUserControl_LifeSettingsChanged(object sender, EventArgs e)
		{
			this.cursor.X = this.controlsUserControl.DeathByIsolation;
			this.cursor.Y = this.controlsUserControl.DeathByOvercrowding;
			this.cursor.Z = this.controlsUserControl.Birth;
			this.DrawCursor();
			this.DrawDataHighlights();
		}

		ConwaySet_Explorer_UserControl controlsUserControl;
		bool isPanning = false;
		bool isRotating = false;
		bool isSpaceDown = false;
		Point mouseDownPoint;
        SizeF initialRotation;
		Gl3DDotDevice.SizeF3D initialPan;
		Gl3DDotDevice.PointF3D cursor;
		#endregion

		#region Fields
		ConwaySetExplorer conwaySetExplorer;
		#endregion
	}
}
