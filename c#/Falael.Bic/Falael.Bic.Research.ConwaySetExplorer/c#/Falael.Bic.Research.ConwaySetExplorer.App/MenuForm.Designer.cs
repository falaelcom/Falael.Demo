namespace Falael.Bic.Research.ConwaySetExplorer
{
	partial class MenuForm
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
			this.miniAppsPanel = new System.Windows.Forms.Panel();
			this.exitButton = new System.Windows.Forms.Button();
			this.SuspendLayout();
			// 
			// miniAppsPanel
			// 
			this.miniAppsPanel.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left)));
			this.miniAppsPanel.AutoScroll = true;
			this.miniAppsPanel.Location = new System.Drawing.Point(13, 13);
			this.miniAppsPanel.Name = "miniAppsPanel";
			this.miniAppsPanel.Size = new System.Drawing.Size(404, 712);
			this.miniAppsPanel.TabIndex = 0;
			// 
			// exitButton
			// 
			this.exitButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.exitButton.DialogResult = System.Windows.Forms.DialogResult.Cancel;
			this.exitButton.Location = new System.Drawing.Point(431, 25);
			this.exitButton.Name = "exitButton";
			this.exitButton.Size = new System.Drawing.Size(113, 42);
			this.exitButton.TabIndex = 1;
			this.exitButton.Text = "Exit";
			this.exitButton.UseVisualStyleBackColor = true;
			this.exitButton.Click += new System.EventHandler(this.exitButton_Click);
			// 
			// MenuForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(134F, 134F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Dpi;
			this.CancelButton = this.exitButton;
			this.ClientSize = new System.Drawing.Size(556, 737);
			this.Controls.Add(this.exitButton);
			this.Controls.Add(this.miniAppsPanel);
			this.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
			this.Name = "MenuForm";
			this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
			this.Text = "MenuForm";
			this.ResumeLayout(false);

		}

		#endregion

		private System.Windows.Forms.Panel miniAppsPanel;
		private System.Windows.Forms.Button exitButton;
	}
}