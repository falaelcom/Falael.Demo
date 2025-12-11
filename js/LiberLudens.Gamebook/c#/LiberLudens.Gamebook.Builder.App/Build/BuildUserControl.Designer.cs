namespace LiberLudens.Gamebook.Builder.Build
{
    partial class BuildUserControl
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
			this.buildLogTextBox = new System.Windows.Forms.TextBox();
			this.buildButton = new System.Windows.Forms.Button();
			this.bookCheckedListBox = new System.Windows.Forms.CheckedListBox();
			this.booksRootPathTextBox = new System.Windows.Forms.TextBox();
			this.SuspendLayout();
			// 
			// buildLogTextBox
			// 
			this.buildLogTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.buildLogTextBox.BackColor = System.Drawing.SystemColors.Window;
			this.buildLogTextBox.Font = new System.Drawing.Font("Courier New", 9.134328F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
			this.buildLogTextBox.Location = new System.Drawing.Point(304, 38);
			this.buildLogTextBox.Multiline = true;
			this.buildLogTextBox.Name = "buildLogTextBox";
			this.buildLogTextBox.ReadOnly = true;
			this.buildLogTextBox.ScrollBars = System.Windows.Forms.ScrollBars.Both;
			this.buildLogTextBox.Size = new System.Drawing.Size(825, 862);
			this.buildLogTextBox.TabIndex = 3;
			this.buildLogTextBox.WordWrap = false;
			// 
			// buildButton
			// 
			this.buildButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.buildButton.Location = new System.Drawing.Point(899, 3);
			this.buildButton.Name = "buildButton";
			this.buildButton.Size = new System.Drawing.Size(230, 30);
			this.buildButton.TabIndex = 2;
			this.buildButton.Text = "&Build";
			this.buildButton.UseVisualStyleBackColor = true;
			this.buildButton.Click += new System.EventHandler(this.buildButton_Click);
			// 
			// bookCheckedListBox
			// 
			this.bookCheckedListBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left)));
			this.bookCheckedListBox.FormattingEnabled = true;
			this.bookCheckedListBox.IntegralHeight = false;
			this.bookCheckedListBox.Location = new System.Drawing.Point(0, 38);
			this.bookCheckedListBox.Name = "bookCheckedListBox";
			this.bookCheckedListBox.Size = new System.Drawing.Size(298, 862);
			this.bookCheckedListBox.TabIndex = 4;
			this.bookCheckedListBox.ItemCheck += new System.Windows.Forms.ItemCheckEventHandler(this.bookCheckedListBox_ItemCheck);
			// 
			// booksRootPathTextBox
			// 
			this.booksRootPathTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.booksRootPathTextBox.Location = new System.Drawing.Point(3, 7);
			this.booksRootPathTextBox.Name = "booksRootPathTextBox";
			this.booksRootPathTextBox.Size = new System.Drawing.Size(890, 22);
			this.booksRootPathTextBox.TabIndex = 5;
			this.booksRootPathTextBox.TextChanged += new System.EventHandler(this.booksRootPathTextBox_TextChanged);
			// 
			// BuildUserControl
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.Controls.Add(this.booksRootPathTextBox);
			this.Controls.Add(this.bookCheckedListBox);
			this.Controls.Add(this.buildLogTextBox);
			this.Controls.Add(this.buildButton);
			this.Name = "BuildUserControl";
			this.Size = new System.Drawing.Size(1132, 903);
			this.ResumeLayout(false);
			this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox buildLogTextBox;
        private System.Windows.Forms.Button buildButton;
        private System.Windows.Forms.CheckedListBox bookCheckedListBox;
        private System.Windows.Forms.TextBox booksRootPathTextBox;
    }
}
