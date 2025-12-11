namespace Falael.Bic.Research.ConwaySetExplorer
{
    partial class Form1
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

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
			this.components = new System.ComponentModel.Container();
			this.glControl = new OpenGL.GlControl();
			this.timer = new System.Windows.Forms.Timer(this.components);
			this.controlsPanel = new System.Windows.Forms.Panel();
			this.SuspendLayout();
			// 
			// glControl
			// 
			this.glControl.BackColor = System.Drawing.Color.DimGray;
			this.glControl.ColorBits = ((uint)(24u));
			this.glControl.DepthBits = ((uint)(24u));
			this.glControl.Dock = System.Windows.Forms.DockStyle.Right;
			this.glControl.Location = new System.Drawing.Point(910, 0);
			this.glControl.Margin = new System.Windows.Forms.Padding(5);
			this.glControl.MultisampleBits = ((uint)(0u));
			this.glControl.Name = "glControl";
			this.glControl.Size = new System.Drawing.Size(906, 944);
			this.glControl.StencilBits = ((uint)(0u));
			this.glControl.TabIndex = 0;
			this.glControl.ContextCreated += new System.EventHandler<OpenGL.GlControlEventArgs>(this.glControl_ContextCreated);
			this.glControl.Render += new System.EventHandler<OpenGL.GlControlEventArgs>(this.glControl_Render);
			this.glControl.SizeChanged += new System.EventHandler(this.glControl_SizeChanged);
			// 
			// timer
			// 
			this.timer.Enabled = true;
			this.timer.Interval = 10;
			this.timer.Tick += new System.EventHandler(this.timer_Tick);
			// 
			// controlsPanel
			// 
			this.controlsPanel.Dock = System.Windows.Forms.DockStyle.Fill;
			this.controlsPanel.Location = new System.Drawing.Point(0, 0);
			this.controlsPanel.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.controlsPanel.Name = "controlsPanel";
			this.controlsPanel.Size = new System.Drawing.Size(910, 944);
			this.controlsPanel.TabIndex = 1;
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(134F, 134F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Dpi;
			this.ClientSize = new System.Drawing.Size(1816, 944);
			this.Controls.Add(this.controlsPanel);
			this.Controls.Add(this.glControl);
			this.DoubleBuffered = true;
			this.Font = new System.Drawing.Font("Microsoft Sans Serif", 8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
			this.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.Name = "Form1";
			this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
			this.Text = "Form1";
			this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
			this.ResumeLayout(false);

        }

        #endregion

        private OpenGL.GlControl glControl;
        private System.Windows.Forms.Timer timer;
        private System.Windows.Forms.Panel controlsPanel;
    }
}

