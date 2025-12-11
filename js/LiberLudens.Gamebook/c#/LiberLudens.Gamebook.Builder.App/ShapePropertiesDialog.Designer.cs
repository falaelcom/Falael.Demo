namespace LiberLudens.Gamebook.Builder.App
{
    partial class ShapePropertiesDialog
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
            this.shapePropertyGrid = new System.Windows.Forms.PropertyGrid();
            this.propertyPresenter = new Dataweb.NShape.WinFormsUI.PropertyPresenter();
            this.propertyController = new Dataweb.NShape.Controllers.PropertyController();
            this.tagTextBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // shapePropertyGrid
            // 
            this.shapePropertyGrid.Location = new System.Drawing.Point(0, 0);
            this.shapePropertyGrid.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.shapePropertyGrid.Name = "shapePropertyGrid";
            this.shapePropertyGrid.Size = new System.Drawing.Size(455, 546);
            this.shapePropertyGrid.TabIndex = 0;
            // 
            // propertyPresenter
            // 
            this.propertyPresenter.PrimaryPropertyGrid = this.shapePropertyGrid;
            this.propertyPresenter.PropertyController = this.propertyController;
            this.propertyPresenter.SecondaryPropertyGrid = null;
            // 
            // propertyController
            // 
            this.propertyController.Project = null;
            this.propertyController.PropertyDisplayMode = Dataweb.NShape.Controllers.NonEditableDisplayMode.ReadOnly;
            // 
            // tagTextBox
            // 
            this.tagTextBox.Font = new System.Drawing.Font("Courier New", 9.134328F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
            this.tagTextBox.Location = new System.Drawing.Point(51, 571);
            this.tagTextBox.Name = "tagTextBox";
            this.tagTextBox.Size = new System.Drawing.Size(392, 27);
            this.tagTextBox.TabIndex = 1;
            this.tagTextBox.TextChanged += new System.EventHandler(this.tagTextBox_TextChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 576);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(33, 16);
            this.label1.TabIndex = 2;
            this.label1.Text = "Tag";
            // 
            // ShapePropertiesDialog
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(455, 620);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.tagTextBox);
            this.Controls.Add(this.shapePropertyGrid);
            this.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.Name = "ShapePropertiesDialog";
            this.ShowInTaskbar = false;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Shape Properties";
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.ShapePropertiesDialog_FormClosed);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.PropertyGrid shapePropertyGrid;
        private Dataweb.NShape.WinFormsUI.PropertyPresenter propertyPresenter;
        internal Dataweb.NShape.Controllers.PropertyController propertyController;
        private System.Windows.Forms.TextBox tagTextBox;
        private System.Windows.Forms.Label label1;
    }
}