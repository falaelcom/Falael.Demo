namespace LiberLudens.Gamebook.Builder.App
{
	partial class MainForm {
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing) {
			if (disposing && (components != null)) {
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows Form Designer generated code

		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent() {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            Dataweb.NShape.RoleBasedSecurityManager roleBasedSecurityManager1 = new Dataweb.NShape.RoleBasedSecurityManager();
            this.mainMenuStrip = new System.Windows.Forms.MenuStrip();
            this.fileToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.fileNewToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.openToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.saveToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.fileSaveAsToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.exitToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.editToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.copyToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.deleteToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem2 = new System.Windows.Forms.ToolStripSeparator();
            this.shapeTemplateTtoolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.stylesToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.propertiesToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.diagramInsertToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.diagramDeleteToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.helpToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.aboutArchiSketchToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.saveFileDialog = new System.Windows.Forms.SaveFileDialog();
            this.openFileDialog = new System.Windows.Forms.OpenFileDialog();
            this.toolBoxStrip = new System.Windows.Forms.ToolStrip();
            this.toolBoxContextMenuStrip = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.addTemplateToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.editTemplateToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.deleteTemplateToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.mainContextMenuStrip = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.propertiesToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripContainer = new System.Windows.Forms.ToolStripContainer();
            this.panel1 = new System.Windows.Forms.Panel();
            this.panel2 = new System.Windows.Forms.Panel();
            this.measurementsTextBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.scaleNumericUpDown = new System.Windows.Forms.NumericUpDown();
            this.edgeListBox = new System.Windows.Forms.ListBox();
            this.node2ListBox = new System.Windows.Forms.ListBox();
            this.node1ListBox = new System.Windows.Forms.ListBox();
            this.toolStrip2 = new System.Windows.Forms.ToolStrip();
            this.diagramComboBox = new System.Windows.Forms.ToolStripComboBox();
            this.mainTabControl = new System.Windows.Forms.TabControl();
            this.buildTabPage = new System.Windows.Forms.TabPage();
            this.structureTabPage = new System.Windows.Forms.TabPage();
            this.mapsTabPage = new System.Windows.Forms.TabPage();
            this.display = new Dataweb.NShape.WinFormsUI.Display();
            this.diagramSetController = new Dataweb.NShape.Controllers.DiagramSetController();
            this.project = new Dataweb.NShape.Project(this.components);
            this.repository = new Dataweb.NShape.Advanced.CachedRepository();
            this.xmlStore = new Dataweb.NShape.XmlStore();
            this.toolSetController = new Dataweb.NShape.Controllers.ToolSetController();
            this.buildUserControl = new LiberLudens.Gamebook.Builder.Build.BuildUserControl();
            this.structureEditorUserControl1 = new LiberLudens.Gamebook.Builder.App.StructureEditorUserControl();
            this.mainMenuStrip.SuspendLayout();
            this.toolBoxContextMenuStrip.SuspendLayout();
            this.mainContextMenuStrip.SuspendLayout();
            this.toolStripContainer.ContentPanel.SuspendLayout();
            this.toolStripContainer.TopToolStripPanel.SuspendLayout();
            this.toolStripContainer.SuspendLayout();
            this.panel1.SuspendLayout();
            this.panel2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.scaleNumericUpDown)).BeginInit();
            this.toolStrip2.SuspendLayout();
            this.mainTabControl.SuspendLayout();
            this.buildTabPage.SuspendLayout();
            this.structureTabPage.SuspendLayout();
            this.mapsTabPage.SuspendLayout();
            this.SuspendLayout();
            // 
            // mainMenuStrip
            // 
            this.mainMenuStrip.Dock = System.Windows.Forms.DockStyle.None;
            this.mainMenuStrip.ImageScalingSize = new System.Drawing.Size(22, 22);
            this.mainMenuStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.fileToolStripMenuItem,
            this.editToolStripMenuItem,
            this.toolStripMenuItem1,
            this.helpToolStripMenuItem});
            this.mainMenuStrip.Location = new System.Drawing.Point(0, 0);
            this.mainMenuStrip.Name = "mainMenuStrip";
            this.mainMenuStrip.Size = new System.Drawing.Size(1401, 31);
            this.mainMenuStrip.TabIndex = 3;
            // 
            // fileToolStripMenuItem
            // 
            this.fileToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.fileNewToolStripMenuItem,
            this.openToolStripMenuItem,
            this.saveToolStripMenuItem,
            this.fileSaveAsToolStripMenuItem,
            this.exitToolStripMenuItem});
            this.fileToolStripMenuItem.Name = "fileToolStripMenuItem";
            this.fileToolStripMenuItem.Size = new System.Drawing.Size(47, 27);
            this.fileToolStripMenuItem.Text = "File";
            // 
            // fileNewToolStripMenuItem
            // 
            this.fileNewToolStripMenuItem.Name = "fileNewToolStripMenuItem";
            this.fileNewToolStripMenuItem.Size = new System.Drawing.Size(158, 28);
            this.fileNewToolStripMenuItem.Text = "New";
            this.fileNewToolStripMenuItem.Click += new System.EventHandler(this.fileNewToolStripMenuItem_Click);
            // 
            // openToolStripMenuItem
            // 
            this.openToolStripMenuItem.Name = "openToolStripMenuItem";
            this.openToolStripMenuItem.Size = new System.Drawing.Size(158, 28);
            this.openToolStripMenuItem.Text = "Open...";
            this.openToolStripMenuItem.Click += new System.EventHandler(this.fileOpenToolStripMenuItem_Click);
            // 
            // saveToolStripMenuItem
            // 
            this.saveToolStripMenuItem.Name = "saveToolStripMenuItem";
            this.saveToolStripMenuItem.Size = new System.Drawing.Size(158, 28);
            this.saveToolStripMenuItem.Text = "Save";
            this.saveToolStripMenuItem.Click += new System.EventHandler(this.saveToolStripMenuItem_Click);
            // 
            // fileSaveAsToolStripMenuItem
            // 
            this.fileSaveAsToolStripMenuItem.Name = "fileSaveAsToolStripMenuItem";
            this.fileSaveAsToolStripMenuItem.Size = new System.Drawing.Size(158, 28);
            this.fileSaveAsToolStripMenuItem.Text = "Save as...";
            this.fileSaveAsToolStripMenuItem.Click += new System.EventHandler(this.fileSaveAsToolStripMenuItem_Click);
            // 
            // exitToolStripMenuItem
            // 
            this.exitToolStripMenuItem.Name = "exitToolStripMenuItem";
            this.exitToolStripMenuItem.Size = new System.Drawing.Size(158, 28);
            this.exitToolStripMenuItem.Text = "Exit";
            this.exitToolStripMenuItem.Click += new System.EventHandler(this.exitToolStripMenuItem_Click);
            // 
            // editToolStripMenuItem
            // 
            this.editToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.copyToolStripMenuItem,
            this.deleteToolStripMenuItem,
            this.toolStripMenuItem2,
            this.shapeTemplateTtoolStripMenuItem,
            this.stylesToolStripMenuItem,
            this.propertiesToolStripMenuItem1});
            this.editToolStripMenuItem.Name = "editToolStripMenuItem";
            this.editToolStripMenuItem.Size = new System.Drawing.Size(51, 27);
            this.editToolStripMenuItem.Text = "Edit";
            // 
            // copyToolStripMenuItem
            // 
            this.copyToolStripMenuItem.Name = "copyToolStripMenuItem";
            this.copyToolStripMenuItem.Size = new System.Drawing.Size(223, 28);
            this.copyToolStripMenuItem.Text = "Copy";
            this.copyToolStripMenuItem.Click += new System.EventHandler(this.copyToolStripMenuItem_Click);
            // 
            // deleteToolStripMenuItem
            // 
            this.deleteToolStripMenuItem.Name = "deleteToolStripMenuItem";
            this.deleteToolStripMenuItem.Size = new System.Drawing.Size(223, 28);
            this.deleteToolStripMenuItem.Text = "Delete";
            this.deleteToolStripMenuItem.Click += new System.EventHandler(this.deleteToolStripMenuItem_Click);
            // 
            // toolStripMenuItem2
            // 
            this.toolStripMenuItem2.Name = "toolStripMenuItem2";
            this.toolStripMenuItem2.Size = new System.Drawing.Size(220, 6);
            // 
            // shapeTemplateTtoolStripMenuItem
            // 
            this.shapeTemplateTtoolStripMenuItem.Name = "shapeTemplateTtoolStripMenuItem";
            this.shapeTemplateTtoolStripMenuItem.Size = new System.Drawing.Size(223, 28);
            this.shapeTemplateTtoolStripMenuItem.Text = "Shape Template...";
            this.shapeTemplateTtoolStripMenuItem.Click += new System.EventHandler(this.shapeTemplateToolStripMenuItem_Click);
            // 
            // stylesToolStripMenuItem
            // 
            this.stylesToolStripMenuItem.Name = "stylesToolStripMenuItem";
            this.stylesToolStripMenuItem.Size = new System.Drawing.Size(223, 28);
            this.stylesToolStripMenuItem.Text = "Styles...";
            this.stylesToolStripMenuItem.Click += new System.EventHandler(this.stylesToolStripMenuItem_Click);
            // 
            // propertiesToolStripMenuItem1
            // 
            this.propertiesToolStripMenuItem1.Name = "propertiesToolStripMenuItem1";
            this.propertiesToolStripMenuItem1.Size = new System.Drawing.Size(223, 28);
            this.propertiesToolStripMenuItem1.Text = "Properties...";
            this.propertiesToolStripMenuItem1.Click += new System.EventHandler(this.propertiesToolStripMenuItem_Click);
            // 
            // toolStripMenuItem1
            // 
            this.toolStripMenuItem1.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.diagramInsertToolStripMenuItem,
            this.diagramDeleteToolStripMenuItem});
            this.toolStripMenuItem1.Name = "toolStripMenuItem1";
            this.toolStripMenuItem1.Size = new System.Drawing.Size(87, 27);
            this.toolStripMenuItem1.Text = "Diagram";
            // 
            // diagramInsertToolStripMenuItem
            // 
            this.diagramInsertToolStripMenuItem.Name = "diagramInsertToolStripMenuItem";
            this.diagramInsertToolStripMenuItem.Size = new System.Drawing.Size(139, 28);
            this.diagramInsertToolStripMenuItem.Text = "Insert";
            this.diagramInsertToolStripMenuItem.Click += new System.EventHandler(this.diagramInsertToolStripMenuItem_Click);
            // 
            // diagramDeleteToolStripMenuItem
            // 
            this.diagramDeleteToolStripMenuItem.Name = "diagramDeleteToolStripMenuItem";
            this.diagramDeleteToolStripMenuItem.Size = new System.Drawing.Size(139, 28);
            this.diagramDeleteToolStripMenuItem.Text = "Delete";
            this.diagramDeleteToolStripMenuItem.Click += new System.EventHandler(this.diagramDeleteToolStripMenuItem_Click);
            // 
            // helpToolStripMenuItem
            // 
            this.helpToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.aboutArchiSketchToolStripMenuItem});
            this.helpToolStripMenuItem.Name = "helpToolStripMenuItem";
            this.helpToolStripMenuItem.Size = new System.Drawing.Size(57, 27);
            this.helpToolStripMenuItem.Text = "Help";
            // 
            // aboutArchiSketchToolStripMenuItem
            // 
            this.aboutArchiSketchToolStripMenuItem.Name = "aboutArchiSketchToolStripMenuItem";
            this.aboutArchiSketchToolStripMenuItem.Size = new System.Drawing.Size(396, 28);
            this.aboutArchiSketchToolStripMenuItem.Text = "About Liber Ludens Gamebook Builder...";
            this.aboutArchiSketchToolStripMenuItem.Click += new System.EventHandler(this.aboutArchiSketchToolStripMenuItem_Click);
            // 
            // saveFileDialog
            // 
            this.saveFileDialog.DefaultExt = "*.askp";
            this.saveFileDialog.Filter = "ArchiSketch Files (*.askp)|*.askp";
            this.saveFileDialog.Title = "Save ArchiSketch Project";
            // 
            // openFileDialog
            // 
            this.openFileDialog.DefaultExt = "*.askp";
            this.openFileDialog.FileName = "Open ArchiSketch Project";
            this.openFileDialog.Filter = "ArchiSketch Files (*.askp)|*.askp";
            // 
            // toolBoxStrip
            // 
            this.toolBoxStrip.ContextMenuStrip = this.toolBoxContextMenuStrip;
            this.toolBoxStrip.Dock = System.Windows.Forms.DockStyle.None;
            this.toolBoxStrip.ImageScalingSize = new System.Drawing.Size(22, 22);
            this.toolBoxStrip.Location = new System.Drawing.Point(138, 31);
            this.toolBoxStrip.Name = "toolBoxStrip";
            this.toolBoxStrip.Size = new System.Drawing.Size(111, 25);
            this.toolBoxStrip.TabIndex = 5;
            this.toolBoxStrip.Text = "mainToolStrip";
            // 
            // toolBoxContextMenuStrip
            // 
            this.toolBoxContextMenuStrip.ImageScalingSize = new System.Drawing.Size(22, 22);
            this.toolBoxContextMenuStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.addTemplateToolStripMenuItem,
            this.editTemplateToolStripMenuItem,
            this.deleteTemplateToolStripMenuItem});
            this.toolBoxContextMenuStrip.Name = "toolBoxContextMenuStrip";
            this.toolBoxContextMenuStrip.Size = new System.Drawing.Size(204, 88);
            // 
            // addTemplateToolStripMenuItem
            // 
            this.addTemplateToolStripMenuItem.Name = "addTemplateToolStripMenuItem";
            this.addTemplateToolStripMenuItem.Size = new System.Drawing.Size(203, 28);
            this.addTemplateToolStripMenuItem.Text = "Add Template";
            this.addTemplateToolStripMenuItem.Click += new System.EventHandler(this.addTemplateToolStripMenuItem_Click);
            // 
            // editTemplateToolStripMenuItem
            // 
            this.editTemplateToolStripMenuItem.Name = "editTemplateToolStripMenuItem";
            this.editTemplateToolStripMenuItem.Size = new System.Drawing.Size(203, 28);
            this.editTemplateToolStripMenuItem.Text = "Edit Template";
            this.editTemplateToolStripMenuItem.Click += new System.EventHandler(this.editTemplateToolStripMenuItem_Click);
            // 
            // deleteTemplateToolStripMenuItem
            // 
            this.deleteTemplateToolStripMenuItem.Name = "deleteTemplateToolStripMenuItem";
            this.deleteTemplateToolStripMenuItem.Size = new System.Drawing.Size(203, 28);
            this.deleteTemplateToolStripMenuItem.Text = "Delete Template";
            this.deleteTemplateToolStripMenuItem.Click += new System.EventHandler(this.deleteTemplateToolStripMenuItem_Click);
            // 
            // mainContextMenuStrip
            // 
            this.mainContextMenuStrip.ImageScalingSize = new System.Drawing.Size(22, 22);
            this.mainContextMenuStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.propertiesToolStripMenuItem});
            this.mainContextMenuStrip.Name = "mainContextMenuStrip";
            this.mainContextMenuStrip.ShowItemToolTips = false;
            this.mainContextMenuStrip.Size = new System.Drawing.Size(222, 32);
            // 
            // propertiesToolStripMenuItem
            // 
            this.propertiesToolStripMenuItem.Name = "propertiesToolStripMenuItem";
            this.propertiesToolStripMenuItem.Size = new System.Drawing.Size(221, 28);
            this.propertiesToolStripMenuItem.Text = "Shape Properties...";
            this.propertiesToolStripMenuItem.Click += new System.EventHandler(this.propertiesToolStripMenuItem_Click);
            // 
            // toolStripContainer
            // 
            this.toolStripContainer.BottomToolStripPanelVisible = false;
            // 
            // toolStripContainer.ContentPanel
            // 
            this.toolStripContainer.ContentPanel.AutoScroll = true;
            this.toolStripContainer.ContentPanel.Controls.Add(this.display);
            this.toolStripContainer.ContentPanel.Controls.Add(this.panel1);
            this.toolStripContainer.ContentPanel.Margin = new System.Windows.Forms.Padding(4);
            this.toolStripContainer.ContentPanel.Size = new System.Drawing.Size(1401, 759);
            this.toolStripContainer.Dock = System.Windows.Forms.DockStyle.Fill;
            this.toolStripContainer.LeftToolStripPanelVisible = false;
            this.toolStripContainer.Location = new System.Drawing.Point(4, 4);
            this.toolStripContainer.Margin = new System.Windows.Forms.Padding(4);
            this.toolStripContainer.Name = "toolStripContainer";
            this.toolStripContainer.RightToolStripPanelVisible = false;
            this.toolStripContainer.Size = new System.Drawing.Size(1401, 821);
            this.toolStripContainer.TabIndex = 7;
            this.toolStripContainer.Text = "toolStripContainer1";
            // 
            // toolStripContainer.TopToolStripPanel
            // 
            this.toolStripContainer.TopToolStripPanel.Controls.Add(this.mainMenuStrip);
            this.toolStripContainer.TopToolStripPanel.Controls.Add(this.toolStrip2);
            this.toolStripContainer.TopToolStripPanel.Controls.Add(this.toolBoxStrip);
            // 
            // panel1
            // 
            this.panel1.BackColor = System.Drawing.SystemColors.ControlDarkDark;
            this.panel1.Controls.Add(this.panel2);
            this.panel1.Controls.Add(this.edgeListBox);
            this.panel1.Controls.Add(this.node2ListBox);
            this.panel1.Controls.Add(this.node1ListBox);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Right;
            this.panel1.Location = new System.Drawing.Point(856, 0);
            this.panel1.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(545, 759);
            this.panel1.TabIndex = 1;
            // 
            // panel2
            // 
            this.panel2.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.panel2.BackColor = System.Drawing.SystemColors.Control;
            this.panel2.Controls.Add(this.measurementsTextBox);
            this.panel2.Controls.Add(this.label1);
            this.panel2.Controls.Add(this.scaleNumericUpDown);
            this.panel2.Location = new System.Drawing.Point(4, 94);
            this.panel2.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(537, 138);
            this.panel2.TabIndex = 7;
            // 
            // measurementsTextBox
            // 
            this.measurementsTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.measurementsTextBox.BackColor = System.Drawing.SystemColors.Info;
            this.measurementsTextBox.Location = new System.Drawing.Point(8, 48);
            this.measurementsTextBox.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.measurementsTextBox.Multiline = true;
            this.measurementsTextBox.Name = "measurementsTextBox";
            this.measurementsTextBox.ReadOnly = true;
            this.measurementsTextBox.Size = new System.Drawing.Size(521, 83);
            this.measurementsTextBox.TabIndex = 9;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.BackColor = System.Drawing.SystemColors.Control;
            this.label1.Location = new System.Drawing.Point(8, 15);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(79, 16);
            this.label1.TabIndex = 8;
            this.label1.Text = "Scale (m:pt)";
            // 
            // scaleNumericUpDown
            // 
            this.scaleNumericUpDown.DecimalPlaces = 2;
            this.scaleNumericUpDown.Increment = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.scaleNumericUpDown.Location = new System.Drawing.Point(93, 14);
            this.scaleNumericUpDown.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.scaleNumericUpDown.Maximum = new decimal(new int[] {
            10000,
            0,
            0,
            0});
            this.scaleNumericUpDown.Minimum = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.scaleNumericUpDown.Name = "scaleNumericUpDown";
            this.scaleNumericUpDown.Size = new System.Drawing.Size(120, 22);
            this.scaleNumericUpDown.TabIndex = 7;
            this.scaleNumericUpDown.Value = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.scaleNumericUpDown.ValueChanged += new System.EventHandler(this.numericUpDown1_ValueChanged);
            // 
            // edgeListBox
            // 
            this.edgeListBox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.edgeListBox.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
            this.edgeListBox.FormattingEnabled = true;
            this.edgeListBox.IntegralHeight = false;
            this.edgeListBox.ItemHeight = 20;
            this.edgeListBox.Location = new System.Drawing.Point(3, 4);
            this.edgeListBox.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.edgeListBox.Name = "edgeListBox";
            this.edgeListBox.Size = new System.Drawing.Size(539, 88);
            this.edgeListBox.Sorted = true;
            this.edgeListBox.TabIndex = 2;
            this.edgeListBox.Click += new System.EventHandler(this.edgeListBox_Click);
            this.edgeListBox.SelectedIndexChanged += new System.EventHandler(this.edgeListBox_SelectedIndexChanged);
            // 
            // node2ListBox
            // 
            this.node2ListBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.node2ListBox.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
            this.node2ListBox.FormattingEnabled = true;
            this.node2ListBox.ItemHeight = 20;
            this.node2ListBox.Location = new System.Drawing.Point(3, 495);
            this.node2ListBox.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.node2ListBox.Name = "node2ListBox";
            this.node2ListBox.Size = new System.Drawing.Size(539, 244);
            this.node2ListBox.Sorted = true;
            this.node2ListBox.TabIndex = 1;
            this.node2ListBox.SelectedIndexChanged += new System.EventHandler(this.node2ListBox_SelectedIndexChanged);
            // 
            // node1ListBox
            // 
            this.node1ListBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.node1ListBox.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
            this.node1ListBox.FormattingEnabled = true;
            this.node1ListBox.ItemHeight = 20;
            this.node1ListBox.Location = new System.Drawing.Point(3, 233);
            this.node1ListBox.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.node1ListBox.Name = "node1ListBox";
            this.node1ListBox.Size = new System.Drawing.Size(539, 244);
            this.node1ListBox.Sorted = true;
            this.node1ListBox.TabIndex = 0;
            this.node1ListBox.SelectedIndexChanged += new System.EventHandler(this.node1ListBox_SelectedIndexChanged);
            // 
            // toolStrip2
            // 
            this.toolStrip2.Dock = System.Windows.Forms.DockStyle.None;
            this.toolStrip2.ImageScalingSize = new System.Drawing.Size(22, 22);
            this.toolStrip2.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.diagramComboBox});
            this.toolStrip2.Location = new System.Drawing.Point(3, 31);
            this.toolStrip2.Name = "toolStrip2";
            this.toolStrip2.Size = new System.Drawing.Size(135, 31);
            this.toolStrip2.TabIndex = 6;
            // 
            // diagramComboBox
            // 
            this.diagramComboBox.Name = "diagramComboBox";
            this.diagramComboBox.Size = new System.Drawing.Size(121, 31);
            this.diagramComboBox.ToolTipText = "Select a diagram to display, rename the current diagram or create a new one.";
            this.diagramComboBox.SelectedIndexChanged += new System.EventHandler(this.diagramComboBox_SelectedIndexChanged);
            this.diagramComboBox.KeyDown += new System.Windows.Forms.KeyEventHandler(this.diagramComboBox_KeyDown);
            // 
            // mainTabControl
            // 
            this.mainTabControl.Controls.Add(this.buildTabPage);
            this.mainTabControl.Controls.Add(this.structureTabPage);
            this.mainTabControl.Controls.Add(this.mapsTabPage);
            this.mainTabControl.Dock = System.Windows.Forms.DockStyle.Fill;
            this.mainTabControl.Location = new System.Drawing.Point(0, 0);
            this.mainTabControl.Margin = new System.Windows.Forms.Padding(4);
            this.mainTabControl.Name = "mainTabControl";
            this.mainTabControl.SelectedIndex = 0;
            this.mainTabControl.Size = new System.Drawing.Size(1417, 858);
            this.mainTabControl.TabIndex = 8;
            // 
            // buildTabPage
            // 
            this.buildTabPage.BackColor = System.Drawing.SystemColors.Control;
            this.buildTabPage.Controls.Add(this.buildUserControl);
            this.buildTabPage.Location = new System.Drawing.Point(4, 25);
            this.buildTabPage.Name = "buildTabPage";
            this.buildTabPage.Size = new System.Drawing.Size(1409, 829);
            this.buildTabPage.TabIndex = 2;
            this.buildTabPage.Text = "Build";
            // 
            // structureTabPage
            // 
            this.structureTabPage.Controls.Add(this.structureEditorUserControl1);
            this.structureTabPage.Location = new System.Drawing.Point(4, 25);
            this.structureTabPage.Margin = new System.Windows.Forms.Padding(4);
            this.structureTabPage.Name = "structureTabPage";
            this.structureTabPage.Padding = new System.Windows.Forms.Padding(4);
            this.structureTabPage.Size = new System.Drawing.Size(1409, 829);
            this.structureTabPage.TabIndex = 1;
            this.structureTabPage.Text = "Structure";
            this.structureTabPage.UseVisualStyleBackColor = true;
            // 
            // mapsTabPage
            // 
            this.mapsTabPage.Controls.Add(this.toolStripContainer);
            this.mapsTabPage.Location = new System.Drawing.Point(4, 25);
            this.mapsTabPage.Margin = new System.Windows.Forms.Padding(4);
            this.mapsTabPage.Name = "mapsTabPage";
            this.mapsTabPage.Padding = new System.Windows.Forms.Padding(4);
            this.mapsTabPage.Size = new System.Drawing.Size(1409, 829);
            this.mapsTabPage.TabIndex = 0;
            this.mapsTabPage.Text = "Maps";
            this.mapsTabPage.UseVisualStyleBackColor = true;
            // 
            // display
            // 
            this.display.AllowDrop = true;
            this.display.AutoScroll = true;
            this.display.BackColorGradient = System.Drawing.SystemColors.Control;
            this.display.ContextMenuStrip = this.mainContextMenuStrip;
            this.display.DiagramSetController = this.diagramSetController;
            this.display.Dock = System.Windows.Forms.DockStyle.Fill;
            this.display.GridColor = System.Drawing.Color.Gainsboro;
            this.display.GridSize = 19;
            this.display.ImeMode = System.Windows.Forms.ImeMode.NoControl;
            this.display.Location = new System.Drawing.Point(0, 0);
            this.display.Margin = new System.Windows.Forms.Padding(4);
            this.display.Name = "display";
            this.display.PropertyController = null;
            this.display.SelectionHilightColor = System.Drawing.Color.Firebrick;
            this.display.SelectionInactiveColor = System.Drawing.Color.Gray;
            this.display.SelectionInteriorColor = System.Drawing.Color.WhiteSmoke;
            this.display.SelectionNormalColor = System.Drawing.Color.DarkGreen;
            this.display.Size = new System.Drawing.Size(856, 759);
            this.display.SnapToGrid = false;
            this.display.TabIndex = 0;
            this.display.ToolPreviewBackColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(119)))), ((int)(((byte)(136)))), ((int)(((byte)(153)))));
            this.display.ToolPreviewColor = System.Drawing.Color.FromArgb(((int)(((byte)(96)))), ((int)(((byte)(70)))), ((int)(((byte)(130)))), ((int)(((byte)(180)))));
            this.display.DiagramChanged += new System.EventHandler(this.display_DiagramChanged);
            // 
            // diagramSetController
            // 
            this.diagramSetController.ActiveTool = null;
            this.diagramSetController.Project = this.project;
            // 
            // project
            // 
            this.project.Description = null;
            this.project.LibrarySearchPaths = ((System.Collections.Generic.IList<string>)(resources.GetObject("project.LibrarySearchPaths")));
            this.project.Name = "ArchiSketch Project 1";
            this.project.Repository = this.repository;
            roleBasedSecurityManager1.CurrentRole = Dataweb.NShape.StandardRole.Administrator;
            roleBasedSecurityManager1.CurrentRoleName = "Administrator";
            this.project.SecurityManager = roleBasedSecurityManager1;
            // 
            // repository
            // 
            this.repository.ProjectName = "ArchiSketch Project 1";
            this.repository.Store = this.xmlStore;
            this.repository.Version = 0;
            // 
            // xmlStore
            // 
            this.xmlStore.DesignFileName = "";
            this.xmlStore.DirectoryName = "";
            this.xmlStore.FileExtension = ".xml";
            this.xmlStore.ImageLocation = Dataweb.NShape.XmlStore.ImageFileLocation.Directory;
            this.xmlStore.ProjectFilePath = "ArchiSketch Project 1.xml";
            this.xmlStore.ProjectName = "ArchiSketch Project 1";
            // 
            // toolSetController
            // 
            this.toolSetController.DiagramSetController = this.diagramSetController;
            this.toolSetController.ToolSelected += new System.EventHandler<Dataweb.NShape.Controllers.ToolEventArgs>(this.toolSetController_ToolSelected);
            this.toolSetController.ToolAdded += new System.EventHandler<Dataweb.NShape.Controllers.ToolEventArgs>(this.toolSetController_ToolAdded);
            this.toolSetController.ToolRemoved += new System.EventHandler<Dataweb.NShape.Controllers.ToolEventArgs>(this.toolSetController_ToolRemoved);
            this.toolSetController.ToolChanged += new System.EventHandler<Dataweb.NShape.Controllers.ToolEventArgs>(this.toolSetController_ToolChanged);
            this.toolSetController.TemplateEditorSelected += new System.EventHandler<Dataweb.NShape.Controllers.TemplateEditorEventArgs>(this.toolBox_ShowTemplateEditorDialog);
            // 
            // buildUserControl
            // 
            this.buildUserControl.Dock = System.Windows.Forms.DockStyle.Fill;
            this.buildUserControl.Location = new System.Drawing.Point(0, 0);
            this.buildUserControl.Name = "buildUserControl";
            this.buildUserControl.Size = new System.Drawing.Size(1409, 829);
            this.buildUserControl.TabIndex = 0;
            // 
            // structureEditorUserControl1
            // 
            this.structureEditorUserControl1.AllowDrop = true;
            this.structureEditorUserControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.structureEditorUserControl1.Location = new System.Drawing.Point(4, 4);
            this.structureEditorUserControl1.Margin = new System.Windows.Forms.Padding(4);
            this.structureEditorUserControl1.Name = "structureEditorUserControl1";
            this.structureEditorUserControl1.Size = new System.Drawing.Size(1401, 821);
            this.structureEditorUserControl1.TabIndex = 0;
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1417, 858);
            this.Controls.Add(this.mainTabControl);
            this.KeyPreview = true;
            this.MainMenuStrip = this.mainMenuStrip;
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "MainForm";
            this.Text = "Liber Ludens Gamebook Builder";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.Load += new System.EventHandler(this.MainForm_Load);
            this.KeyDown += new System.Windows.Forms.KeyEventHandler(this.MainForm_KeyDown);
            this.mainMenuStrip.ResumeLayout(false);
            this.mainMenuStrip.PerformLayout();
            this.toolBoxContextMenuStrip.ResumeLayout(false);
            this.mainContextMenuStrip.ResumeLayout(false);
            this.toolStripContainer.ContentPanel.ResumeLayout(false);
            this.toolStripContainer.TopToolStripPanel.ResumeLayout(false);
            this.toolStripContainer.TopToolStripPanel.PerformLayout();
            this.toolStripContainer.ResumeLayout(false);
            this.toolStripContainer.PerformLayout();
            this.panel1.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            this.panel2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.scaleNumericUpDown)).EndInit();
            this.toolStrip2.ResumeLayout(false);
            this.toolStrip2.PerformLayout();
            this.mainTabControl.ResumeLayout(false);
            this.buildTabPage.ResumeLayout(false);
            this.structureTabPage.ResumeLayout(false);
            this.mapsTabPage.ResumeLayout(false);
            this.ResumeLayout(false);

		}

		#endregion

		private Dataweb.NShape.Controllers.ToolSetController toolSetController;
		private System.Windows.Forms.MenuStrip mainMenuStrip;
		private System.Windows.Forms.ToolStripMenuItem fileToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem editToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem helpToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem copyToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem saveToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem exitToolStripMenuItem;
		private System.Windows.Forms.SaveFileDialog saveFileDialog;
		private System.Windows.Forms.OpenFileDialog openFileDialog;
		private System.Windows.Forms.ToolStripMenuItem openToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem toolStripMenuItem1;
		private System.Windows.Forms.ToolStripMenuItem diagramInsertToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem diagramDeleteToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem fileSaveAsToolStripMenuItem;
		private System.Windows.Forms.ToolStrip toolBoxStrip;
		private System.Windows.Forms.ToolStripMenuItem propertiesToolStripMenuItem;
		private System.Windows.Forms.ContextMenuStrip mainContextMenuStrip;
		private System.Windows.Forms.ToolStripMenuItem aboutArchiSketchToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem deleteToolStripMenuItem;
		private System.Windows.Forms.ToolStripSeparator toolStripMenuItem2;
		private System.Windows.Forms.ToolStripMenuItem stylesToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem shapeTemplateTtoolStripMenuItem;
		private System.Windows.Forms.ContextMenuStrip toolBoxContextMenuStrip;
		private System.Windows.Forms.ToolStripMenuItem editTemplateToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem addTemplateToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem deleteTemplateToolStripMenuItem;
		private System.Windows.Forms.ToolStripMenuItem fileNewToolStripMenuItem;
		private Dataweb.NShape.Advanced.CachedRepository repository;
		private Dataweb.NShape.XmlStore xmlStore;
		private System.Windows.Forms.ToolStripContainer toolStripContainer;
		private System.Windows.Forms.ToolStrip toolStrip2;
		private System.Windows.Forms.ToolStripComboBox diagramComboBox;
		private Dataweb.NShape.WinFormsUI.Display display;
		private Dataweb.NShape.Controllers.DiagramSetController diagramSetController;
		private Dataweb.NShape.Project project;
		private System.Windows.Forms.ToolStripMenuItem propertiesToolStripMenuItem1;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.ListBox node1ListBox;
        private System.Windows.Forms.ListBox node2ListBox;
        private System.Windows.Forms.ListBox edgeListBox;
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.TextBox measurementsTextBox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.NumericUpDown scaleNumericUpDown;
        private System.Windows.Forms.TabControl mainTabControl;
        private System.Windows.Forms.TabPage mapsTabPage;
        private System.Windows.Forms.TabPage structureTabPage;
        private StructureEditorUserControl structureEditorUserControl1;
        private System.Windows.Forms.TabPage buildTabPage;
        private LiberLudens.Gamebook.Builder.Build.BuildUserControl buildUserControl;
    }
}

