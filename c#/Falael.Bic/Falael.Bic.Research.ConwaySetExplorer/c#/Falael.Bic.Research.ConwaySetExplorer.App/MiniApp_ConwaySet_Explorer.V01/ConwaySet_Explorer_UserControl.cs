using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Timers;

using Falael.Data.Spatial;
using Falael.Data.Spatial.Storage;
using Falael.Data.Spatial.Operators;

using Falael.Visualization;

using Falael.Bic.GameOfLife;

namespace Falael.Bic.Research.ConwaySetExplorer.MiniApp_ConwaySet_Explorer.V01
{
    public partial class ConwaySet_Explorer_UserControl : UserControl
    {
		#region Constructors
		public ConwaySet_Explorer_UserControl()
        {
			InitializeComponent();

            this.dbiTrackBar.Minimum = UpDownToTrackbarValue(this.dbiNumericUpDown.Minimum);
            this.dbiTrackBar.Maximum = UpDownToTrackbarValue(this.dbiNumericUpDown.Maximum);
            this.dbiTrackBar.Value = UpDownToTrackbarValue(this.dbiNumericUpDown.Value);

            this.dboTrackBar.Minimum = UpDownToTrackbarValue(this.dboNumericUpDown.Minimum);
            this.dboTrackBar.Maximum = UpDownToTrackbarValue(this.dboNumericUpDown.Maximum);
            this.dboTrackBar.Value = UpDownToTrackbarValue(this.dboNumericUpDown.Value);

            this.birthTrackBar.Minimum = UpDownToTrackbarValue(this.birthNumericUpDown.Minimum);
            this.birthTrackBar.Maximum = UpDownToTrackbarValue(this.birthNumericUpDown.Maximum);
            this.birthTrackBar.Value = UpDownToTrackbarValue(this.birthNumericUpDown.Value);

			this.timer = new System.Timers.Timer();
			this.timer.AutoReset = false;
			this.timer.Interval = 40;
			this.timer.Elapsed += this.Timer_Elapsed;

			if (!SystemInformation.TerminalServerSession)
			{
				this.lifeGraphicsPanel.GetType().GetProperty("DoubleBuffered", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance).SetValue(this.lifeGraphicsPanel, true, null);
				this.slicePanel.GetType().GetProperty("DoubleBuffered", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance).SetValue(this.slicePanel, true, null);
			}
		}
		#endregion

		#region Coloring algorithm
		public enum EColoringAlgorithm
		{
			Activity,
			Population,
			Fullness,
		}
		void activityColoringRadioButton_CheckedChanged(object sender, EventArgs e)
		{
			this.OnColoringAlgorithmChanged();
		}
		void populationRadioButton_CheckedChanged(object sender, EventArgs e)
		{
			this.OnColoringAlgorithmChanged();
		}
		void fullnessRadioButton_CheckedChanged(object sender, EventArgs e)
		{
			this.OnColoringAlgorithmChanged();
		}

		public void OnColoringAlgorithmChanged()
		{
			this.ColoringAlgorithmChanged?.Invoke(this, new EventArgs());
		}

		public EColoringAlgorithm ColoringAlgorithm
		{
			get
			{
				if (this.activityColoringRadioButton.Checked)
				{
					return EColoringAlgorithm.Activity;
				}
				if (this.populationRadioButton.Checked)
				{
					return EColoringAlgorithm.Population;
				}
				if (this.fullnessRadioButton.Checked)
				{
					return EColoringAlgorithm.Fullness;
				}

				throw new NotImplementedException();
			}
		}

		public event EventHandler ColoringAlgorithmChanged;
		#endregion

		#region Filtering algorithm
		[Flags]
		public enum EFilteringAlgorithm
		{
			None = 0,
			IsFinite = 1,
			IsInfinite = 2,
			PositiveActiveCellCountTrend = 4,
			NegativeActiveCellCountTrend = 8,
			PositiveGenerationSizeTrend = 16,
			NegativeGenerationSizeTrend = 32,
			PositiveFulnessTrend = 64,
			NegativeFulnessTrend = 128,
		}
		void isFiniteCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void infiniteCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void positiveActiveCellCountTrendCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void negativeActiveCellCountTrendCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void positiveGenerationSizeTrendCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void negativeGenerationSizeTrendCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void positiveFulnessTrendCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}
		void negativeFulnessTrendCheckBox_CheckedChanged(object sender, EventArgs e)
		{
			this.OnFilteringAlgorithmChanged();
		}

		public void OnFilteringAlgorithmChanged()
		{
			this.FilteringAlgorithmChanged?.Invoke(this, new EventArgs());
		}

		public EFilteringAlgorithm FilteringAlgorithm
		{
			get
			{
				EFilteringAlgorithm result = EFilteringAlgorithm.None;
				if (this.isFiniteCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.IsFinite;
				}
				if (this.infiniteCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.IsInfinite;
				}
				if (this.positiveActiveCellCountTrendCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.PositiveActiveCellCountTrend;
				}
				if (this.negativeActiveCellCountTrendCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.NegativeActiveCellCountTrend;
				}
				if (this.positiveFulnessTrendCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.PositiveFulnessTrend;
				}
				if (this.negativeFulnessTrendCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.NegativeFulnessTrend;
				}
				if (this.positiveGenerationSizeTrendCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.PositiveGenerationSizeTrend;
				}
				if (this.negativeGenerationSizeTrendCheckBox.Checked)
				{
					result |= EFilteringAlgorithm.NegativeGenerationSizeTrend;
				}

				return result;
			}
		}

		public event EventHandler FilteringAlgorithmChanged;
		#endregion

		#region Game of Life
		const int wrapRadius = 20;

		void Timer_Elapsed(object sender, ElapsedEventArgs e)
		{
			this.timer.Enabled = false;
			lock (this.lifeDocument)
			{
				this.lifeDocument.NextGeneration();
			}

			if (!this.IsDisposed && !this.Disposing)
				this.BeginInvoke(new Action(() =>
				{
					this.lifeGraphicsPanel.Invalidate();
					this.lifeGraphicsPanel.Refresh();
				}));
		}
		void lifeGraphicsPanel_Paint(object sender, PaintEventArgs e)
		{
			lock (this.lifeDocument)
			{
				GDI2DGridDevice device = new GDI2DGridDevice(e.Graphics, this.lifeGraphicsPanel.Size, 5f, 0.05f);
				device.Clear();

				List<PointF> dots = new List<PointF>();
				var cells = this.lifeDocument.QueryOccupiedCells();
				for (int length = cells.Length, i = 0; i < length; ++i)
				{
					var cell = cells[i];
					dots.Add(new PointF(cell.gridPoint.x, cell.gridPoint.y));
				}
				if (dots.Count == 0)
				{
					return;
				}

				device.DrawCells(dots.ToArray(), Color.Red);
				this.timer.Enabled = true;
			}
		}
		void FuzzyFileControls_UserControl_Load(object sender, EventArgs e)
		{
		}
		void dbiNumericUpDown_ValueChanged(object sender, EventArgs e)
		{
			this.dbiTrackBar.Value = UpDownToTrackbarValue(this.dbiNumericUpDown.Value);
			this.OnLifeSettingsChanged();
		}
		void dboNumericUpDown_ValueChanged(object sender, EventArgs e)
		{
			this.dboTrackBar.Value = UpDownToTrackbarValue(this.dboNumericUpDown.Value);
			this.OnLifeSettingsChanged();
		}
		void birthNumericUpDown_ValueChanged(object sender, EventArgs e)
		{
			this.birthTrackBar.Value = UpDownToTrackbarValue(this.birthNumericUpDown.Value);
			this.OnLifeSettingsChanged();
		}
		void dbiTrackBar_Scroll(object sender, EventArgs e)
		{
			this.dbiNumericUpDown.Value = TrackbarToUpDownValue(this.dbiTrackBar.Value);
		}
		void dboTrackBar_Scroll(object sender, EventArgs e)
		{
			this.dboNumericUpDown.Value = TrackbarToUpDownValue(this.dboTrackBar.Value);
		}
		void birthTrackBar_Scroll(object sender, EventArgs e)
		{
			this.birthNumericUpDown.Value = TrackbarToUpDownValue(this.birthTrackBar.Value);
		}

		public void OnLifeSettingsChanged()
		{
			this.LifeSettingsChanged?.Invoke(this, new EventArgs());

			lock (this.lifeDocument)
			{
				this.lifeDocument.Clear();
				this.lifeDocument.SetConfiguration(LifeResources.GenerateRandomConfiguration(wrapRadius, new int[] { LifeDocument.DEAD, LifeDocument.ALIVE }));
				this.lifeDocument.Rules = LifeResources.BuildConwayFuzzyRules(
					this.DeathByIsolation,
					this.DeathByOvercrowding,
					this.Birth);
			}

			this.timer.Enabled = false;
			this.timer.Enabled = true;
		}

		public float DeathByIsolation
		{
			get
			{
				return (float)this.dbiNumericUpDown.Value;
			}
			set
			{
				this.dbiNumericUpDown.Value = (decimal)value;
			}
		}
		public float DeathByOvercrowding
		{
			get
			{
				return (float)this.dboNumericUpDown.Value;
			}
			set
			{
				this.dboNumericUpDown.Value = (decimal)value;
			}
		}
		public float Birth
		{
			get
			{
				return (float)this.birthNumericUpDown.Value;
			}
			set
			{
				this.birthNumericUpDown.Value = (decimal)value;
			}
		}

		public event EventHandler LifeSettingsChanged;

		System.Timers.Timer timer;
		LifeDocument lifeDocument = new LifeDocument();
		#endregion

		#region Conway set slice
		public void SetSlice(SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo> spatialStorage, Gl3DDotDevice.PointF3D cursor)
		{
			this.spatialStorage = spatialStorage;
			this.cursor = cursor;

			ISpace space = this.spatialStorage.SpatialStorageIndex.Space;
			decimal sliceSize = space.Dimensions[0].GetPass(0).Step;

			string[] superSpaceSchema = { "x:dbi", "y:dbo", "z:b" };
			string[] subSpaceSchema = { "sx:dbi", "sy:dbo", "sz:b" };
			IOperator[] operators =
			{
				new Map("sx:dbi", "x:dbi"),
				new Map("sy:dbo", "y:dbo"),
				new RangeFilter("sz:b", "z:b", (decimal)this.cursor.Z - sliceSize / 2, (decimal)this.cursor.Z + sliceSize / 2),
			};
			this.subSpace = new SubSpace(space, operators, superSpaceSchema, subSpaceSchema);



			this.slicePanel.Refresh();
		}

		SpatialStorage_Unsafe<ConwaySet.ExplorationStatsAverageInfo> spatialStorage;
		SubSpace subSpace;
		Gl3DDotDevice.PointF3D cursor;
		#endregion

		#region Status text
		public string DetailsText
        {
            get
            {
                return this.detailsTextBox.Text;
            }
            set
            {
				if(this.IsDisposed || this.Disposing)
				{
					return;
				}
				if (this.InvokeRequired)
				{
					this.BeginInvoke(new Action(() =>
					{
						this.detailsTextBox.Text = value;
					}));
				}
				else
				{
					this.detailsTextBox.Text = value;
				}
			}
        }
		#endregion

		#region Utility methods
		static decimal TrackbarToUpDownValue(int trackbarValue)
        {
            return (decimal)trackbarValue / trackbarToUpDownRatio;
        }
        static int UpDownToTrackbarValue(decimal UpDownValue)
        {
            return (int)Math.Round(UpDownValue * trackbarToUpDownRatio);
        }
		static decimal trackbarToUpDownRatio = 1000;
		#endregion
	}
}
