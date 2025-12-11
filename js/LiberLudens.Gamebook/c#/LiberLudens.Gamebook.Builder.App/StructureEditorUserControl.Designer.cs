namespace LiberLudens.Gamebook.Builder.App
{
    partial class StructureEditorUserControl
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
            this.jsonEditorControl = new ICSharpCode.TextEditor.TextEditorControlEx();
            this.fsTreeView = new System.Windows.Forms.TreeView();
            this.textEditorControl = new ICSharpCode.TextEditor.TextEditorControlEx();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.entryListView = new System.Windows.Forms.ListView();
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.splitContainer2 = new System.Windows.Forms.SplitContainer();
            this.tableLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer2)).BeginInit();
            this.splitContainer2.Panel1.SuspendLayout();
            this.splitContainer2.Panel2.SuspendLayout();
            this.splitContainer2.SuspendLayout();
            this.SuspendLayout();
            // 
            // jsonEditorControl
            // 
            this.jsonEditorControl.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.jsonEditorControl.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.jsonEditorControl.FoldingStrategy = "XML";
            this.jsonEditorControl.Font = new System.Drawing.Font("Courier New", 10F);
            this.jsonEditorControl.Location = new System.Drawing.Point(4, 4);
            this.jsonEditorControl.Margin = new System.Windows.Forms.Padding(4);
            this.jsonEditorControl.Name = "jsonEditorControl";
            this.jsonEditorControl.Size = new System.Drawing.Size(908, 561);
            this.jsonEditorControl.SyntaxHighlighting = "JSON";
            this.jsonEditorControl.TabIndex = 0;
            // 
            // fsTreeView
            // 
            this.fsTreeView.Dock = System.Windows.Forms.DockStyle.Fill;
            this.fsTreeView.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.059701F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
            this.fsTreeView.Location = new System.Drawing.Point(0, 0);
            this.fsTreeView.Name = "fsTreeView";
            this.fsTreeView.Size = new System.Drawing.Size(449, 1135);
            this.fsTreeView.TabIndex = 1;
            // 
            // textEditorControl
            // 
            this.textEditorControl.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.textEditorControl.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.textEditorControl.FoldingStrategy = "XML";
            this.textEditorControl.Font = new System.Drawing.Font("Courier New", 10F);
            this.textEditorControl.Location = new System.Drawing.Point(4, 573);
            this.textEditorControl.Margin = new System.Windows.Forms.Padding(4);
            this.textEditorControl.Name = "textEditorControl";
            this.textEditorControl.Size = new System.Drawing.Size(908, 562);
            this.textEditorControl.SyntaxHighlighting = "JSON";
            this.textEditorControl.TabIndex = 2;
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.ColumnCount = 1;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.Controls.Add(this.jsonEditorControl, 0, 0);
            this.tableLayoutPanel1.Controls.Add(this.textEditorControl, 0, 1);
            this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 2;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(916, 1139);
            this.tableLayoutPanel1.TabIndex = 3;
            // 
            // entryListView
            // 
            this.entryListView.Dock = System.Windows.Forms.DockStyle.Fill;
            this.entryListView.Location = new System.Drawing.Point(0, 0);
            this.entryListView.Name = "entryListView";
            this.entryListView.Size = new System.Drawing.Size(446, 1135);
            this.entryListView.TabIndex = 4;
            this.entryListView.UseCompatibleStateImageBehavior = false;
            // 
            // splitContainer1
            // 
            this.splitContainer1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer1.Location = new System.Drawing.Point(0, 0);
            this.splitContainer1.Name = "splitContainer1";
            // 
            // splitContainer1.Panel1
            // 
            this.splitContainer1.Panel1.Controls.Add(this.splitContainer2);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.tableLayoutPanel1);
            this.splitContainer1.Size = new System.Drawing.Size(1827, 1139);
            this.splitContainer1.SplitterDistance = 907;
            this.splitContainer1.TabIndex = 5;
            // 
            // splitContainer2
            // 
            this.splitContainer2.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.splitContainer2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer2.Location = new System.Drawing.Point(0, 0);
            this.splitContainer2.Name = "splitContainer2";
            // 
            // splitContainer2.Panel1
            // 
            this.splitContainer2.Panel1.Controls.Add(this.fsTreeView);
            // 
            // splitContainer2.Panel2
            // 
            this.splitContainer2.Panel2.Controls.Add(this.entryListView);
            this.splitContainer2.Size = new System.Drawing.Size(907, 1139);
            this.splitContainer2.SplitterDistance = 453;
            this.splitContainer2.TabIndex = 0;
            // 
            // StructureEditorUserControl
            // 
            this.AllowDrop = true;
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.splitContainer1);
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "StructureEditorUserControl";
            this.Size = new System.Drawing.Size(1827, 1139);
            this.DragDrop += new System.Windows.Forms.DragEventHandler(this.StructureEditorUserControl_DragDrop);
            this.DragEnter += new System.Windows.Forms.DragEventHandler(this.StructureEditorUserControl_DragEnter);
            this.tableLayoutPanel1.ResumeLayout(false);
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.splitContainer2.Panel1.ResumeLayout(false);
            this.splitContainer2.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer2)).EndInit();
            this.splitContainer2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private ICSharpCode.TextEditor.TextEditorControlEx jsonEditorControl;
        private System.Windows.Forms.TreeView fsTreeView;
        private ICSharpCode.TextEditor.TextEditorControlEx textEditorControl;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.ListView entryListView;
        private System.Windows.Forms.SplitContainer splitContainer1;
        private System.Windows.Forms.SplitContainer splitContainer2;
    }
}
