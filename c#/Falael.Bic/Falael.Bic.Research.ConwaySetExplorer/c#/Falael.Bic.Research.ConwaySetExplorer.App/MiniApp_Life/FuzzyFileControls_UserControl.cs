using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Falael.Bic.Research.ConwaySetExplorer.MiniApp_Life
{
    public partial class FuzzyFileControls_UserControl : UserControl
    {
        public FuzzyFileControls_UserControl()
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
        }

        void FuzzyFileControls_UserControl_Load(object sender, EventArgs e)
        {

        }

        void dbiNumericUpDown_ValueChanged(object sender, EventArgs e)
        {
            this.dbiTrackBar.Value = UpDownToTrackbarValue(this.dbiNumericUpDown.Value);
            this.OnChanged();
        }

        void dboNumericUpDown_ValueChanged(object sender, EventArgs e)
        {
            this.dboTrackBar.Value = UpDownToTrackbarValue(this.dboNumericUpDown.Value);
            this.OnChanged();
        }

        void birthNumericUpDown_ValueChanged(object sender, EventArgs e)
        {
            this.birthTrackBar.Value = UpDownToTrackbarValue(this.birthNumericUpDown.Value);
            this.OnChanged();
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

        public void OnChanged()
        {
            this.Changed?.Invoke(this, new EventArgs());
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

        public string DetailsText
        {
            get
            {
                return this.detailsTextBox.Text;
            }
            set
            {
                this.detailsTextBox.Text = value;
            }
        }

        public event EventHandler Changed;

        static decimal TrackbarToUpDownValue(int trackbarValue)
        {
            return (decimal)trackbarValue / trackbarToUpDownRatio;
        }

        static int UpDownToTrackbarValue(decimal UpDownValue)
        {
            return (int)Math.Round(UpDownValue * trackbarToUpDownRatio);
        }

        static decimal trackbarToUpDownRatio = 1000;
    }
}
