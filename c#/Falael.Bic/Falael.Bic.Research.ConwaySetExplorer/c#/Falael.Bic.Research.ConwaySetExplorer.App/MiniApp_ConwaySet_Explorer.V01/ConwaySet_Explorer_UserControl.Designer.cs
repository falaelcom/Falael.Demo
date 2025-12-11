namespace Falael.Bic.Research.ConwaySetExplorer.MiniApp_ConwaySet_Explorer.V01
{
	partial class ConwaySet_Explorer_UserControl
	{
		/// <summary> 
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary> 
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Component Designer generated code

		/// <summary> 
		/// Required method for Designer support - do not modify 
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.label1 = new System.Windows.Forms.Label();
			this.dbiTrackBar = new System.Windows.Forms.TrackBar();
			this.dbiNumericUpDown = new System.Windows.Forms.NumericUpDown();
			this.label2 = new System.Windows.Forms.Label();
			this.dboTrackBar = new System.Windows.Forms.TrackBar();
			this.dboNumericUpDown = new System.Windows.Forms.NumericUpDown();
			this.label3 = new System.Windows.Forms.Label();
			this.birthTrackBar = new System.Windows.Forms.TrackBar();
			this.birthNumericUpDown = new System.Windows.Forms.NumericUpDown();
			this.detailsTextBox = new System.Windows.Forms.TextBox();
			this.label4 = new System.Windows.Forms.Label();
			this.lifeGraphicsPanel = new System.Windows.Forms.Panel();
			this.groupBox1 = new System.Windows.Forms.GroupBox();
			this.fullnessRadioButton = new System.Windows.Forms.RadioButton();
			this.populationRadioButton = new System.Windows.Forms.RadioButton();
			this.activityColoringRadioButton = new System.Windows.Forms.RadioButton();
			this.groupBox2 = new System.Windows.Forms.GroupBox();
			this.negativeFulnessTrendCheckBox = new System.Windows.Forms.CheckBox();
			this.positiveFulnessTrendCheckBox = new System.Windows.Forms.CheckBox();
			this.negativeGenerationSizeTrendCheckBox = new System.Windows.Forms.CheckBox();
			this.positiveGenerationSizeTrendCheckBox = new System.Windows.Forms.CheckBox();
			this.negativeActiveCellCountTrendCheckBox = new System.Windows.Forms.CheckBox();
			this.positiveActiveCellCountTrendCheckBox = new System.Windows.Forms.CheckBox();
			this.infiniteCheckBox = new System.Windows.Forms.CheckBox();
			this.isFiniteCheckBox = new System.Windows.Forms.CheckBox();
			this.slicePanel = new System.Windows.Forms.Panel();
			((System.ComponentModel.ISupportInitialize)(this.dbiTrackBar)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.dbiNumericUpDown)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.dboTrackBar)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.dboNumericUpDown)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.birthTrackBar)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.birthNumericUpDown)).BeginInit();
			this.groupBox1.SuspendLayout();
			this.groupBox2.SuspendLayout();
			this.SuspendLayout();
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(3, 0);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(188, 16);
			this.label1.TabIndex = 6;
			this.label1.Text = "Death by isolation (Ox, Yellow)";
			// 
			// dbiTrackBar
			// 
			this.dbiTrackBar.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
			| System.Windows.Forms.AnchorStyles.Right)));
			this.dbiTrackBar.Location = new System.Drawing.Point(0, 18);
			this.dbiTrackBar.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.dbiTrackBar.Name = "dbiTrackBar";
			this.dbiTrackBar.Size = new System.Drawing.Size(620, 64);
			this.dbiTrackBar.TabIndex = 5;
			this.dbiTrackBar.Scroll += new System.EventHandler(this.dbiTrackBar_Scroll);
			// 
			// dbiNumericUpDown
			// 
			this.dbiNumericUpDown.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.dbiNumericUpDown.DecimalPlaces = 3;
			this.dbiNumericUpDown.Increment = new decimal(new int[] {
			1,
			0,
			0,
			196608});
			this.dbiNumericUpDown.Location = new System.Drawing.Point(626, 18);
			this.dbiNumericUpDown.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.dbiNumericUpDown.Maximum = new decimal(new int[] {
			8,
			0,
			0,
			0});
			this.dbiNumericUpDown.Name = "dbiNumericUpDown";
			this.dbiNumericUpDown.Size = new System.Drawing.Size(93, 22);
			this.dbiNumericUpDown.TabIndex = 4;
			this.dbiNumericUpDown.Value = new decimal(new int[] {
			2,
			0,
			0,
			0});
			this.dbiNumericUpDown.ValueChanged += new System.EventHandler(this.dbiNumericUpDown_ValueChanged);
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point(3, 66);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(211, 16);
			this.label2.TabIndex = 9;
			this.label2.Text = "Death by overcrowding (Oy, Cyan)";
			// 
			// dboTrackBar
			// 
			this.dboTrackBar.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
			| System.Windows.Forms.AnchorStyles.Right)));
			this.dboTrackBar.Location = new System.Drawing.Point(0, 86);
			this.dboTrackBar.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.dboTrackBar.Name = "dboTrackBar";
			this.dboTrackBar.Size = new System.Drawing.Size(620, 64);
			this.dboTrackBar.TabIndex = 8;
			this.dboTrackBar.Scroll += new System.EventHandler(this.dboTrackBar_Scroll);
			// 
			// dboNumericUpDown
			// 
			this.dboNumericUpDown.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.dboNumericUpDown.DecimalPlaces = 3;
			this.dboNumericUpDown.Increment = new decimal(new int[] {
			1,
			0,
			0,
			196608});
			this.dboNumericUpDown.Location = new System.Drawing.Point(626, 86);
			this.dboNumericUpDown.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.dboNumericUpDown.Maximum = new decimal(new int[] {
			8,
			0,
			0,
			0});
			this.dboNumericUpDown.Name = "dboNumericUpDown";
			this.dboNumericUpDown.Size = new System.Drawing.Size(93, 22);
			this.dboNumericUpDown.TabIndex = 7;
			this.dboNumericUpDown.Value = new decimal(new int[] {
			3,
			0,
			0,
			0});
			this.dboNumericUpDown.ValueChanged += new System.EventHandler(this.dboNumericUpDown_ValueChanged);
			// 
			// label3
			// 
			this.label3.AutoSize = true;
			this.label3.Location = new System.Drawing.Point(3, 134);
			this.label3.Name = "label3";
			this.label3.Size = new System.Drawing.Size(120, 16);
			this.label3.TabIndex = 12;
			this.label3.Text = "Birth (Oz, Magenta)";
			// 
			// birthTrackBar
			// 
			this.birthTrackBar.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
			| System.Windows.Forms.AnchorStyles.Right)));
			this.birthTrackBar.Location = new System.Drawing.Point(0, 153);
			this.birthTrackBar.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.birthTrackBar.Name = "birthTrackBar";
			this.birthTrackBar.Size = new System.Drawing.Size(620, 64);
			this.birthTrackBar.TabIndex = 11;
			this.birthTrackBar.Scroll += new System.EventHandler(this.birthTrackBar_Scroll);
			// 
			// birthNumericUpDown
			// 
			this.birthNumericUpDown.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.birthNumericUpDown.DecimalPlaces = 3;
			this.birthNumericUpDown.Increment = new decimal(new int[] {
			1,
			0,
			0,
			196608});
			this.birthNumericUpDown.Location = new System.Drawing.Point(626, 153);
			this.birthNumericUpDown.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.birthNumericUpDown.Maximum = new decimal(new int[] {
			8,
			0,
			0,
			0});
			this.birthNumericUpDown.Name = "birthNumericUpDown";
			this.birthNumericUpDown.Size = new System.Drawing.Size(93, 22);
			this.birthNumericUpDown.TabIndex = 10;
			this.birthNumericUpDown.Value = new decimal(new int[] {
			3,
			0,
			0,
			0});
			this.birthNumericUpDown.ValueChanged += new System.EventHandler(this.birthNumericUpDown_ValueChanged);
			// 
			// detailsTextBox
			// 
			this.detailsTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
			| System.Windows.Forms.AnchorStyles.Right)));
			this.detailsTextBox.Location = new System.Drawing.Point(318, 330);
			this.detailsTextBox.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.detailsTextBox.Multiline = true;
			this.detailsTextBox.Name = "detailsTextBox";
			this.detailsTextBox.ReadOnly = true;
			this.detailsTextBox.ScrollBars = System.Windows.Forms.ScrollBars.Both;
			this.detailsTextBox.Size = new System.Drawing.Size(398, 192);
			this.detailsTextBox.TabIndex = 13;
			this.detailsTextBox.WordWrap = false;
			// 
			// label4
			// 
			this.label4.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)
			| System.Windows.Forms.AnchorStyles.Right)));
			this.label4.Location = new System.Drawing.Point(315, 533);
			this.label4.Name = "label4";
			this.label4.Size = new System.Drawing.Size(401, 94);
			this.label4.TabIndex = 14;
			this.label4.Text = "Alt+Mouse - rotate\r\nSpace+Mouse - pan\r\nMouse Wheel - zoom\r\nCtrl+Mouse - move curs" +
	"or Ox and Oy\r\nShift+Ctrl+Mouse - move cursor Oz";
			this.label4.TextAlign = System.Drawing.ContentAlignment.TopRight;
			// 
			// lifeGraphicsPanel
			// 
			this.lifeGraphicsPanel.Location = new System.Drawing.Point(15, 330);
			this.lifeGraphicsPanel.Margin = new System.Windows.Forms.Padding(4);
			this.lifeGraphicsPanel.Name = "lifeGraphicsPanel";
			this.lifeGraphicsPanel.Size = new System.Drawing.Size(291, 297);
			this.lifeGraphicsPanel.TabIndex = 15;
			this.lifeGraphicsPanel.Paint += new System.Windows.Forms.PaintEventHandler(this.lifeGraphicsPanel_Paint);
			// 
			// groupBox1
			// 
			this.groupBox1.Controls.Add(this.fullnessRadioButton);
			this.groupBox1.Controls.Add(this.populationRadioButton);
			this.groupBox1.Controls.Add(this.activityColoringRadioButton);
			this.groupBox1.Location = new System.Drawing.Point(8, 189);
			this.groupBox1.Name = "groupBox1";
			this.groupBox1.Size = new System.Drawing.Size(710, 51);
			this.groupBox1.TabIndex = 16;
			this.groupBox1.TabStop = false;
			this.groupBox1.Text = "Coloring algorithm";
			// 
			// fullnessRadioButton
			// 
			this.fullnessRadioButton.AutoSize = true;
			this.fullnessRadioButton.Location = new System.Drawing.Point(185, 22);
			this.fullnessRadioButton.Name = "fullnessRadioButton";
			this.fullnessRadioButton.Size = new System.Drawing.Size(79, 20);
			this.fullnessRadioButton.TabIndex = 2;
			this.fullnessRadioButton.Text = "Fullness";
			this.fullnessRadioButton.UseVisualStyleBackColor = true;
			this.fullnessRadioButton.CheckedChanged += new System.EventHandler(this.fullnessRadioButton_CheckedChanged);
			// 
			// populationRadioButton
			// 
			this.populationRadioButton.AutoSize = true;
			this.populationRadioButton.Location = new System.Drawing.Point(86, 22);
			this.populationRadioButton.Name = "populationRadioButton";
			this.populationRadioButton.Size = new System.Drawing.Size(93, 20);
			this.populationRadioButton.TabIndex = 1;
			this.populationRadioButton.Text = "Population";
			this.populationRadioButton.UseVisualStyleBackColor = true;
			this.populationRadioButton.CheckedChanged += new System.EventHandler(this.populationRadioButton_CheckedChanged);
			// 
			// activityColoringRadioButton
			// 
			this.activityColoringRadioButton.AutoSize = true;
			this.activityColoringRadioButton.Checked = true;
			this.activityColoringRadioButton.Location = new System.Drawing.Point(7, 22);
			this.activityColoringRadioButton.Name = "activityColoringRadioButton";
			this.activityColoringRadioButton.Size = new System.Drawing.Size(71, 20);
			this.activityColoringRadioButton.TabIndex = 0;
			this.activityColoringRadioButton.TabStop = true;
			this.activityColoringRadioButton.Text = "Activity";
			this.activityColoringRadioButton.UseVisualStyleBackColor = true;
			this.activityColoringRadioButton.CheckedChanged += new System.EventHandler(this.activityColoringRadioButton_CheckedChanged);
			// 
			// groupBox2
			// 
			this.groupBox2.Controls.Add(this.negativeFulnessTrendCheckBox);
			this.groupBox2.Controls.Add(this.positiveFulnessTrendCheckBox);
			this.groupBox2.Controls.Add(this.negativeGenerationSizeTrendCheckBox);
			this.groupBox2.Controls.Add(this.positiveGenerationSizeTrendCheckBox);
			this.groupBox2.Controls.Add(this.negativeActiveCellCountTrendCheckBox);
			this.groupBox2.Controls.Add(this.positiveActiveCellCountTrendCheckBox);
			this.groupBox2.Controls.Add(this.infiniteCheckBox);
			this.groupBox2.Controls.Add(this.isFiniteCheckBox);
			this.groupBox2.Location = new System.Drawing.Point(8, 246);
			this.groupBox2.Name = "groupBox2";
			this.groupBox2.Size = new System.Drawing.Size(710, 79);
			this.groupBox2.TabIndex = 17;
			this.groupBox2.TabStop = false;
			this.groupBox2.Text = "Filtering algorithm";
			// 
			// negativeFulnessTrendCheckBox
			// 
			this.negativeFulnessTrendCheckBox.AutoSize = true;
			this.negativeFulnessTrendCheckBox.Location = new System.Drawing.Point(427, 48);
			this.negativeFulnessTrendCheckBox.Name = "negativeFulnessTrendCheckBox";
			this.negativeFulnessTrendCheckBox.Size = new System.Drawing.Size(141, 20);
			this.negativeFulnessTrendCheckBox.TabIndex = 7;
			this.negativeFulnessTrendCheckBox.Text = "Fulness Trend (-,0)";
			this.negativeFulnessTrendCheckBox.UseVisualStyleBackColor = true;
			this.negativeFulnessTrendCheckBox.CheckedChanged += new System.EventHandler(this.negativeFulnessTrendCheckBox_CheckedChanged);
			// 
			// positiveFulnessTrendCheckBox
			// 
			this.positiveFulnessTrendCheckBox.AutoSize = true;
			this.positiveFulnessTrendCheckBox.Location = new System.Drawing.Point(427, 22);
			this.positiveFulnessTrendCheckBox.Name = "positiveFulnessTrendCheckBox";
			this.positiveFulnessTrendCheckBox.Size = new System.Drawing.Size(137, 20);
			this.positiveFulnessTrendCheckBox.TabIndex = 6;
			this.positiveFulnessTrendCheckBox.Text = "Fullness Trend (+)";
			this.positiveFulnessTrendCheckBox.UseVisualStyleBackColor = true;
			this.positiveFulnessTrendCheckBox.CheckedChanged += new System.EventHandler(this.positiveFulnessTrendCheckBox_CheckedChanged);
			// 
			// negativeGenerationSizeTrendCheckBox
			// 
			this.negativeGenerationSizeTrendCheckBox.AutoSize = true;
			this.negativeGenerationSizeTrendCheckBox.Location = new System.Drawing.Point(242, 48);
			this.negativeGenerationSizeTrendCheckBox.Name = "negativeGenerationSizeTrendCheckBox";
			this.negativeGenerationSizeTrendCheckBox.Size = new System.Drawing.Size(189, 20);
			this.negativeGenerationSizeTrendCheckBox.TabIndex = 5;
			this.negativeGenerationSizeTrendCheckBox.Text = "Generation Size Trend (-,0)";
			this.negativeGenerationSizeTrendCheckBox.UseVisualStyleBackColor = true;
			this.negativeGenerationSizeTrendCheckBox.CheckedChanged += new System.EventHandler(this.negativeGenerationSizeTrendCheckBox_CheckedChanged);
			// 
			// positiveGenerationSizeTrendCheckBox
			// 
			this.positiveGenerationSizeTrendCheckBox.AutoSize = true;
			this.positiveGenerationSizeTrendCheckBox.Location = new System.Drawing.Point(242, 22);
			this.positiveGenerationSizeTrendCheckBox.Name = "positiveGenerationSizeTrendCheckBox";
			this.positiveGenerationSizeTrendCheckBox.Size = new System.Drawing.Size(182, 20);
			this.positiveGenerationSizeTrendCheckBox.TabIndex = 4;
			this.positiveGenerationSizeTrendCheckBox.Text = "Generation Size Trend (+)";
			this.positiveGenerationSizeTrendCheckBox.UseVisualStyleBackColor = true;
			this.positiveGenerationSizeTrendCheckBox.CheckedChanged += new System.EventHandler(this.positiveGenerationSizeTrendCheckBox_CheckedChanged);
			// 
			// negativeActiveCellCountTrendCheckBox
			// 
			this.negativeActiveCellCountTrendCheckBox.AutoSize = true;
			this.negativeActiveCellCountTrendCheckBox.Location = new System.Drawing.Point(86, 48);
			this.negativeActiveCellCountTrendCheckBox.Name = "negativeActiveCellCountTrendCheckBox";
			this.negativeActiveCellCountTrendCheckBox.Size = new System.Drawing.Size(157, 20);
			this.negativeActiveCellCountTrendCheckBox.TabIndex = 3;
			this.negativeActiveCellCountTrendCheckBox.Text = "Active Cell Trend (-,0)";
			this.negativeActiveCellCountTrendCheckBox.UseVisualStyleBackColor = true;
			this.negativeActiveCellCountTrendCheckBox.CheckedChanged += new System.EventHandler(this.negativeActiveCellCountTrendCheckBox_CheckedChanged);
			// 
			// positiveActiveCellCountTrendCheckBox
			// 
			this.positiveActiveCellCountTrendCheckBox.AutoSize = true;
			this.positiveActiveCellCountTrendCheckBox.Location = new System.Drawing.Point(86, 22);
			this.positiveActiveCellCountTrendCheckBox.Name = "positiveActiveCellCountTrendCheckBox";
			this.positiveActiveCellCountTrendCheckBox.Size = new System.Drawing.Size(150, 20);
			this.positiveActiveCellCountTrendCheckBox.TabIndex = 2;
			this.positiveActiveCellCountTrendCheckBox.Text = "Active Cell Trend (+)";
			this.positiveActiveCellCountTrendCheckBox.UseVisualStyleBackColor = true;
			this.positiveActiveCellCountTrendCheckBox.CheckedChanged += new System.EventHandler(this.positiveActiveCellCountTrendCheckBox_CheckedChanged);
			// 
			// infiniteCheckBox
			// 
			this.infiniteCheckBox.AutoSize = true;
			this.infiniteCheckBox.Checked = true;
			this.infiniteCheckBox.CheckState = System.Windows.Forms.CheckState.Checked;
			this.infiniteCheckBox.Location = new System.Drawing.Point(7, 22);
			this.infiniteCheckBox.Name = "infiniteCheckBox";
			this.infiniteCheckBox.Size = new System.Drawing.Size(67, 20);
			this.infiniteCheckBox.TabIndex = 1;
			this.infiniteCheckBox.Text = "Infinite";
			this.infiniteCheckBox.UseVisualStyleBackColor = true;
			this.infiniteCheckBox.CheckedChanged += new System.EventHandler(this.infiniteCheckBox_CheckedChanged);
			// 
			// isFiniteCheckBox
			// 
			this.isFiniteCheckBox.AutoSize = true;
			this.isFiniteCheckBox.Location = new System.Drawing.Point(7, 48);
			this.isFiniteCheckBox.Name = "isFiniteCheckBox";
			this.isFiniteCheckBox.Size = new System.Drawing.Size(62, 20);
			this.isFiniteCheckBox.TabIndex = 0;
			this.isFiniteCheckBox.Text = "Finite";
			this.isFiniteCheckBox.UseVisualStyleBackColor = true;
			this.isFiniteCheckBox.CheckedChanged += new System.EventHandler(this.isFiniteCheckBox_CheckedChanged);
			// 
			// slicePanel
			// 
			this.slicePanel.Location = new System.Drawing.Point(15, 635);
			this.slicePanel.Margin = new System.Windows.Forms.Padding(4);
			this.slicePanel.Name = "slicePanel";
			this.slicePanel.Size = new System.Drawing.Size(465, 465);
			this.slicePanel.TabIndex = 16;
			// 
			// ConwaySet_Explorer_UserControl
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.Controls.Add(this.slicePanel);
			this.Controls.Add(this.groupBox2);
			this.Controls.Add(this.groupBox1);
			this.Controls.Add(this.lifeGraphicsPanel);
			this.Controls.Add(this.label4);
			this.Controls.Add(this.detailsTextBox);
			this.Controls.Add(this.label3);
			this.Controls.Add(this.birthTrackBar);
			this.Controls.Add(this.birthNumericUpDown);
			this.Controls.Add(this.label2);
			this.Controls.Add(this.dboTrackBar);
			this.Controls.Add(this.dboNumericUpDown);
			this.Controls.Add(this.label1);
			this.Controls.Add(this.dbiTrackBar);
			this.Controls.Add(this.dbiNumericUpDown);
			this.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.Name = "ConwaySet_Explorer_UserControl";
			this.Size = new System.Drawing.Size(722, 1104);
			this.Load += new System.EventHandler(this.FuzzyFileControls_UserControl_Load);
			((System.ComponentModel.ISupportInitialize)(this.dbiTrackBar)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.dbiNumericUpDown)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.dboTrackBar)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.dboNumericUpDown)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.birthTrackBar)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.birthNumericUpDown)).EndInit();
			this.groupBox1.ResumeLayout(false);
			this.groupBox1.PerformLayout();
			this.groupBox2.ResumeLayout(false);
			this.groupBox2.PerformLayout();
			this.ResumeLayout(false);
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.TrackBar dbiTrackBar;
		private System.Windows.Forms.NumericUpDown dbiNumericUpDown;
		private System.Windows.Forms.Label label2;
		private System.Windows.Forms.TrackBar dboTrackBar;
		private System.Windows.Forms.NumericUpDown dboNumericUpDown;
		private System.Windows.Forms.Label label3;
		private System.Windows.Forms.TrackBar birthTrackBar;
		private System.Windows.Forms.NumericUpDown birthNumericUpDown;
		private System.Windows.Forms.TextBox detailsTextBox;
		private System.Windows.Forms.Label label4;
		private System.Windows.Forms.Panel lifeGraphicsPanel;
		private System.Windows.Forms.GroupBox groupBox1;
		private System.Windows.Forms.RadioButton activityColoringRadioButton;
		private System.Windows.Forms.RadioButton populationRadioButton;
		private System.Windows.Forms.RadioButton fullnessRadioButton;
		private System.Windows.Forms.GroupBox groupBox2;
		private System.Windows.Forms.CheckBox isFiniteCheckBox;
		private System.Windows.Forms.CheckBox infiniteCheckBox;
		private System.Windows.Forms.CheckBox negativeActiveCellCountTrendCheckBox;
		private System.Windows.Forms.CheckBox positiveActiveCellCountTrendCheckBox;
		private System.Windows.Forms.CheckBox negativeGenerationSizeTrendCheckBox;
		private System.Windows.Forms.CheckBox positiveGenerationSizeTrendCheckBox;
		private System.Windows.Forms.CheckBox negativeFulnessTrendCheckBox;
		private System.Windows.Forms.CheckBox positiveFulnessTrendCheckBox;
		private System.Windows.Forms.Panel slicePanel;
	}
}
