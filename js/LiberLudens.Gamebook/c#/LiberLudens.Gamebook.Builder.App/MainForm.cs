/******************************************************************************
  Copyright 2009-2012 dataweb GmbH
  This file is part of the NShape framework.
  NShape is free software: you can redistribute it and/or modify it under the 
  terms of the GNU General Public License as published by the Free Software 
  Foundation, either version 3 of the License, or (at your option) any later 
  version.
  NShape is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR 
  A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
  You should have received a copy of the GNU General Public License along with 
  NShape. If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

using System;
using System.Text;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

using Dataweb.NShape;
using Dataweb.NShape.Commands;
using Dataweb.NShape.Controllers;
using Dataweb.NShape.GeneralShapes;
using Dataweb.NShape.SoftwareArchitectureShapes;
using Dataweb.NShape.WinFormsUI;
using Dataweb.NShape.Advanced;


namespace LiberLudens.Gamebook.Builder.App
{
	public partial class MainForm : Form {

        const string newProjectName = "<New Project>";
        const string defaultProjectPath = @"c:\repos\Falael.CODE\code\LiberLudens\LiberLudens.Gamebook\c#\LiberLudens.Gamebook.Builder.App\woods-map.askp";
        const string metadataFileExtension = ".askpmeta";
        const string metadataFieldName_Scale = "scale";
        const string jsonFileExtension = ".json";
        const int defaultZoomLevel = 35;

        public MainForm()
        {
			InitializeComponent();

            this.display.ShapeMoved += display_ShapeMoved;
            this.display.ShapeResized += display_ShapeResized;
            this.display.ShapeRotated += display_ShapeRotated;
            this.display.ShapesInserted += display_ShapesInserted;
            this.display.ShapesRemoved += display_ShapesRemoved;
            this.display.ShapesSelected += display_ShapesSelected;

            this.display.KeyDown += display_KeyDown;
            this.display.KeyPress += display_KeyPress;
        }

        #region User Interface Events

        void aboutArchiSketchToolStripMenuItem_Click(object sender, EventArgs e) {
			MessageBox.Show("Liber Ludens Gamebook Builder", "Liber Ludens Gamebook Builder");
		}

		void deleteToolStripMenuItem_Click(object sender, EventArgs e) {
			display.DiagramSetController.DeleteShapes(display.Diagram, display.SelectedShapes, true);
		}

		void stylesToolStripMenuItem_Click(object sender, EventArgs e) {
			DesignEditorDialog de = new DesignEditorDialog(project);
			de.ShowDialog(this);
		}

		void shapeTemplateToolStripMenuItem_Click(object sender, EventArgs e) {
			EditToolBoxTemplate();
		}

		void addTemplateToolStripMenuItem_Click(object sender, EventArgs e) {
			toolSetController.ShowTemplateEditor(false);
		}

		void editTemplateToolStripMenuItem_Click(object sender, EventArgs e) {
			EditToolBoxTemplate();
		}

		void deleteTemplateToolStripMenuItem_Click(object sender, EventArgs e) {
			if (toolSetController.SelectedTool is TemplateTool) {
				toolSetController.DeleteSelectedTemplate();
			}
		}

		void propertiesToolStripMenuItem_Click(object sender, EventArgs e) {
			ShapePropertiesDialog d = new ShapePropertiesDialog();
            d.propertyController.Project = project;
            if (display.SelectedShapes.Count == 0)
            {
                d.propertyController.SetObject(0, display.Diagram);
                d.SetDiagram();
            }
            else
            {
                d.propertyController.SetObjects(0, display.SelectedShapes);
                d.SetShapes(display.SelectedShapes);
            }

            d.ClosedNotify += D_ClosedNotify;
            d.Show(this);

        }

        private void D_ClosedNotify(object sender, EventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void toolBoxStrip_Click(object sender, EventArgs args) {
			ToolStripButton button = (ToolStripButton)sender;
			if (button.Checked)
				toolSetController.SelectTool((Tool)button.Tag, false);
			else 
				toolSetController.SelectTool(toolSetController.DefaultTool);
		}

		void toolBoxStrip_DoubleClick(object sender, EventArgs args) {
			ToolStripButton button = (ToolStripButton)sender;
			if (button.Checked)
				toolSetController.SelectTool((Tool)button.Tag, true);
			else {
				UncheckAllOtherButtons(button);
				toolSetController.SelectTool(toolSetController.DefaultTool);
			}
		}

		void MainForm_Load(object sender, EventArgs e) {
			// Turn off automatic loading of shape libraries. We want all diagrams to use the same shape libraries.
			project.AutoLoadLibraries = true;
			// Add shape library "GeneralShapes"
			project.AddLibrary(Assembly.GetAssembly(typeof(Circle)), false);
			// Add shape library "SoftwareArchitectureShapes"
			project.AddLibrary(Assembly.GetAssembly(typeof(CloudSymbol)), false);
			
			// Create a new project on start
//			fileNewToolStripMenuItem_Click(this, EventArgs.Empty);

            this.OnInitialize();
        }

		void copyToolStripMenuItem_Click(object sender, EventArgs e) {
			display.CopyImageToClipboard(ImageFileFormat.EmfPlus, true);
		}

		void exitToolStripMenuItem_Click(object sender, EventArgs e) {
			Close();
		}

		void saveToolStripMenuItem_Click(object sender, EventArgs e) {
			SaveCurrentProject();
		}

		void diagramComboBox_KeyDown(object sender, KeyEventArgs e) {
			if (e.KeyCode == Keys.Enter) RenameCurrentDiagram(diagramComboBox.Text);
		}

		void diagramComboBox_SelectedIndexChanged(object sender, EventArgs e) {
			if (diagramComboBox.SelectedIndex == diagramComboBox.Items.Count - 1)
				// Create and display a new Diagram
				DisplayNewDiagram();
			else
				// Display the selected diagram
				DisplayDiagram(diagramComboBox.Items[diagramComboBox.SelectedIndex].ToString());
		}

		void diagramInsertToolStripMenuItem_Click(object sender, EventArgs e) {
			DisplayNewDiagram();
		}

		void diagramDeleteToolStripMenuItem_Click(object sender, EventArgs e) {
			if (MessageBox.Show(string.Format("Delete diagram '{0}'?", display.Diagram.Name),
				"Delete Diagram", MessageBoxButtons.OKCancel) == DialogResult.OK) {
				project.Repository.DeleteAll(display.Diagram);
				UpdateDiagramCombo();
				DisplayDefaultDiagram();
			}
		}

		void toolSetController_ToolChanged(object sender, ToolEventArgs e) {
			ToolStripButton button = FindToolStripButton(e.Tool);
			button.Image = toolSetController.SelectedTool.SmallIcon;
		}

		void toolSetController_ToolAdded(object sender, ToolEventArgs e) {
			UpdateToolBoxStrip();
		}

		void toolSetController_ToolRemoved(object sender, ToolEventArgs e) {
			UpdateToolBoxStrip();
		}

		void toolSetController_Changed(object sender, EventArgs e) {
			UpdateToolBoxStrip();
		}

		void toolSetController_ToolSelected(object sender, ToolEventArgs e) {
			ToolStripButton button = FindToolStripButton(e.Tool);
			UncheckAllOtherButtons(button);
			if (button != null) button.Checked = true;
		}

		void fileNewToolStripMenuItem_Click(object sender, EventArgs e) {
			project.Close();
			project.Name = newProjectName;
			OpenProject(true);
			DisplayNewDiagram();
			Text = GetFormTitle();
		}

		void fileOpenToolStripMenuItem_Click(object sender, EventArgs e) {
			if (openFileDialog.ShowDialog(this) == DialogResult.OK) {
				// Check whether the repository is modified and ask the user whether to save it
				if (project.Repository.IsModified) {
					switch (MessageBox.Show("Do you want to save the current project?", "Close Project", MessageBoxButtons.YesNoCancel)) {
						case DialogResult.Yes:
							SaveCurrentProject();
							break;
						case DialogResult.Cancel:
							return;
						case DialogResult.No:
							break;
					}
				}
				// Close the current project
				project.Close();
				// Set the project name (file name)
				project.Name = Path.GetFileNameWithoutExtension(openFileDialog.FileName);
				// Set the project location
				xmlStore.DirectoryName = Path.GetDirectoryName(openFileDialog.FileName);
				// Set the file extension
				xmlStore.FileExtension = Path.GetExtension(openFileDialog.FileName);
				
				// Now open the project
				OpenProject(false);
				Text = GetFormTitle();
                this.LoadMetadata(openFileDialog.FileName);
            }
        }

		void fileSaveAsToolStripMenuItem_Click(object sender, EventArgs e) {
			saveFileDialog.DefaultExt = "*.askp";
			saveFileDialog.Filter = "ArchiSketch project (*.askp)|*.askp|ArchiSketch template (*.askt)|*.askt|Windows meta file (*.emf)|*.emf";
			if (saveFileDialog.ShowDialog() == DialogResult.OK) {
				switch (Path.GetExtension(saveFileDialog.FileName)) {
					case ".askp":
						project.Name = Path.GetFileNameWithoutExtension(saveFileDialog.FileName);
						xmlStore.DirectoryName = Path.GetDirectoryName(saveFileDialog.FileName);
						xmlStore.FileExtension = Path.GetExtension(saveFileDialog.FileName);
						project.Repository.SaveChanges();
                        this.SaveMetadata(saveFileDialog.FileName);
                        this.SaveMeasurements(xmlStore.ProjectFilePath);
                        Text = GetFormTitle();
						break;
					case ".askt":
						string fileName = xmlStore.DirectoryName;
						xmlStore.DirectoryName = Path.GetDirectoryName(saveFileDialog.FileName);
						project.Repository.SaveChanges();
                        this.SaveMetadata(xmlStore.ProjectFilePath);
                        this.SaveMeasurements(xmlStore.ProjectFilePath);
                        xmlStore.DirectoryName = fileName;
						break;
					case ".emf":
						Image image = display.Diagram.CreateImage(ImageFileFormat.Emf, null);
						image.Save(saveFileDialog.FileName);
						break;
					default:
						MessageBox.Show("Unknown file extension {0}.", "Cannot Save", MessageBoxButtons.OK, MessageBoxIcon.Warning);
						break;
				}
			}
		}

		#endregion

		#region Implementations

		ToolStripButton FindToolStripButton(Tool tool) {
			ToolStripButton result = null;
			foreach (ToolStripItem tsi in toolBoxStrip.Items)
				if (tsi is ToolStripButton) {
					ToolStripButton tsb = (ToolStripButton)tsi;
					if (tsb.Tag == toolSetController.SelectedTool) {
						result = tsb;
						break;
					}
				}
			return result;
		}

		void OpenProject(bool newProject)
        {
            try
            {
				if (newProject)
                {
                    project.Create();
                }
                else 
                {
                    project.Open();
                }
                    
				UpdateToolBoxStrip();
				UpdateDiagramCombo();
				
				// Display first diagram (if a diagram exist)
				DisplayDefaultDiagram();
			}
            catch (Exception exc)
            {
				MessageBox.Show(exc.Message, "Cannot open project");
			}
		}

		void UncheckAllOtherButtons(ToolStripButton button) {
			foreach (ToolStripItem tsi in toolBoxStrip.Items)
				if (tsi != button && tsi is ToolStripButton)
					((ToolStripButton)tsi).Checked = false;
		}

		void SaveCurrentProject() {
			bool doIt = false;
            if (project.Name.Equals(newProjectName, StringComparison.InvariantCultureIgnoreCase))
            {
                if (saveFileDialog.ShowDialog(this) == DialogResult.OK)
                {
                    // Update the project name (file name) 
                    project.Name = Path.GetFileNameWithoutExtension(saveFileDialog.FileName);
                    // Update the project location 
                    xmlStore.DirectoryName = Path.GetDirectoryName(saveFileDialog.FileName);
                    // Update the file extension
                    xmlStore.FileExtension = Path.GetExtension(saveFileDialog.FileName);

                    // If a project with this name exists, delete it
                    if (repository.Exists()) repository.Erase();
                    doIt = true;
                }
            }
            else
            {
                doIt = true;
            }
            // Save the project
            if (doIt)
            {
                project.Repository.SaveChanges();
                this.SaveMetadata(xmlStore.ProjectFilePath);
                this.SaveMeasurements(xmlStore.ProjectFilePath);
            }
        }

		string GetFormTitle() {
			return project.Name + " - Liber Ludens Gamebook Builder";
		}

		void RenameCurrentDiagram(string newName) {
			display.Diagram.Name = newName;
			project.Repository.Update(display.Diagram);
			UpdateDiagramCombo();
		}

		void UpdateToolBoxStrip() {
			toolBoxStrip.SuspendLayout();
			try {
				// delete buttons from left to first separator
				while (toolBoxStrip.Items.Count > 0)
					toolBoxStrip.Items.RemoveAt(0);
				//
				// Create buttons for the tools
				int index = 0;
				foreach (Tool t in toolSetController.Tools) {
					ToolStripButton b = new ToolStripButton(null, t.SmallIcon);
					b.Tag = t;
					b.CheckOnClick = true;
					b.Click += toolBoxStrip_Click;
					b.DoubleClick += toolBoxStrip_DoubleClick;
					b.ToolTipText = t.ToolTipText;
					b.DoubleClickEnabled = true;
					toolBoxStrip.Items.Insert(index, b);
					++index;
				}
			} finally {
				toolBoxStrip.ResumeLayout();
			}
		}
		
		void UpdateDiagramCombo() {
			diagramComboBox.Text = string.Empty;
			diagramComboBox.Items.Clear();
			foreach (Diagram d in project.Repository.GetDiagrams())
			   diagramComboBox.Items.Add(d.Name);
			diagramComboBox.Items.Add("<New diagram...>");
		}

		void DisplayNewDiagram() {
			// Find a unique name for the new Diagram
			int N = 0;
			string newName;
			bool found;
			do {
				++N;
				newName = string.Format("Diagram {0}", N);
				// Search name in list of diagrams
				found = false;
				foreach (Diagram d in project.Repository.GetDiagrams())
					if (d.Name.Equals(newName, StringComparison.InvariantCultureIgnoreCase)) {
						found = true;
						break;
					}
			} while (found);
			
			Diagram diagram = new Diagram(newName);
			CreateDiagramCommand cmd = new CreateDiagramCommand(diagram);
			project.ExecuteCommand(cmd);

			UpdateDiagramCombo();
			diagramComboBox.Text = newName;
		}

		void DisplayDiagram(string diagramName) {
			Diagram diagram = GetDiagram(diagramName);
			if (diagram != null) {
				display.Diagram = diagram;
				// Refresh Diagram combo
				int index = 0;
				foreach (Diagram d in project.Repository.GetDiagrams()) {
					if (d.Name == display.Diagram.Name) {
						diagramComboBox.SelectedIndex = index;
						break;
					}
					++index;
				}
			}
		}

		Diagram GetDiagram(string diagramName) {
			Diagram result = null;
			// GetDiagram(diagramName) throws an exception if the name does not exist in the repository,
			// so we iterate through all existing diagrams
			foreach (Diagram d in project.Repository.GetDiagrams())
			   if (d.Name == diagramName) {
			      result = d;
			      break;
			   }
			return result;
		}

		void DisplayDefaultDiagram() {
			IEnumerator<Diagram> enumerator = project.Repository.GetDiagrams().GetEnumerator();
			if (enumerator.MoveNext()) DisplayDiagram(enumerator.Current.Name);
			else DisplayDiagram(null);
		}

		void EditToolBoxTemplate() {
			if (toolSetController.SelectedTool is TemplateTool)
				toolSetController.ShowTemplateEditor(true);
			else MessageBox.Show("Select a template insertion tool and repeat the command.", "Editing a Template");
		}

		#endregion

		#region NShape ToolBox event handlers for showing dialogs

		void toolBox_ShowTemplateEditorDialog(object sender, TemplateEditorEventArgs e) {
			TemplateEditorDialog dlg = new TemplateEditorDialog(e.Project, e.Template);
			dlg.Show();
		}

		void toolBox_ShowLibraryManagerDialog(object sender, EventArgs e) {
			LibraryManagementDialog dlg = new LibraryManagementDialog(project);
		}

		void toolBox_ShowDesignEditorDialog(object sender, EventArgs e) {
			DesignEditorDialog dlg = new DesignEditorDialog(project);
		}

        #endregion

        void display_DiagramChanged(object sender, EventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void display_ShapeMoved(object sender, DiagramPresenterShapeEventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void display_ShapeResized(object sender, DiagramPresenterShapeEventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void display_ShapeRotated(object sender, DiagramPresenterShapeEventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void display_ShapesInserted(object sender, DiagramPresenterShapesEventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void display_ShapesRemoved(object sender, DiagramPresenterShapesEventArgs e)
        {
            OnDiagramChanged(this.display);
        }

        void display_ShapesSelected(object sender, EventArgs e)
        {
            int counter = 0;
            Node node1 = null;
            Node node2 = null;
            Edge edge = null;
            foreach (var shape in display.SelectedShapes)
            {
                var shapeText = Helper.GetShapeText(shape);
                if (shapeText == string.Empty)
                {
                    continue;
                }
                var id = Helper.GetShapeId(shape);
                if (id == null)
                {
                    id = shapeText;
                }
                if (shape is CaptionedShapeBase)
                {
                    switch (counter)
                    {
                        case 0:
                            node1 = this.currentTopologicalData.FindNode(id);
                            break;
                        case 1:
                            node2 = this.currentTopologicalData.FindNode(id);
                            break;
                        default:
                            continue;
                    }
                    ++counter;
                }
                if (shape is LineShapeBase)
                {
                    edge = this.currentTopologicalData.FindEdge(id);
                }
            }
            if (node1 != null)
            {
                this.node1ListBox.SelectedItem = node1;
            }
            if (node2 != null)
            {
                this.node2ListBox.SelectedItem = node2;
            }
            if (edge != null)
            {
                this.edgeListBox.SelectedItem = edge;
            }
        }

        void display_KeyDown(object sender, KeyEventArgs e)
        {
        }

        void display_KeyPress(object sender, KeyPressEventArgs e)
        {
        }

        void MainForm_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.S && e.Control)
            {
                project.Repository.SaveChanges();
                this.SaveMetadata(xmlStore.ProjectFilePath);
                this.SaveMeasurements(xmlStore.ProjectFilePath);
            }
        }

        void node1ListBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            this.selectedNode1 = (Node)node1ListBox.SelectedItem;
            this.UI_AutoSelectEdge();
        }

        void node2ListBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            this.selectedNode2 = (Node)node2ListBox.SelectedItem;
            this.UI_AutoSelectEdge();
        }

        void edgeListBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            if(this.selectedEdge == (Edge)edgeListBox.SelectedItem)
            {
                return;
            }
            this.selectedEdge = (Edge)edgeListBox.SelectedItem;
            this.UI_UpdateMesurements();
        }

        void numericUpDown1_ValueChanged(object sender, EventArgs e)
        {
            this.UI_UpdateMesurements();
        }

        void edgeListBox_Click(object sender, EventArgs e)
        {
            if (this.selectedEdge == (Edge)edgeListBox.SelectedItem)
            {
                return;
            }

            this.selectedEdge = (Edge)edgeListBox.SelectedItem;
            if(this.selectedEdge == null)
            {
                return;
            }
            this.UI_UpdateMesurements();

            this.display.SelectedShapes.Clear();
            this.display.SelectedShapes.Add(this.selectedEdge.Shape);
            this.display.SelectedShapes.Add(this.selectedEdge.Node1.Shape);
            this.display.SelectedShapes.Add(this.selectedEdge.Node2.Shape);
            this.display.Refresh();
        }

        #region LiberLudens.Gamebook.Builder.App implementation

        class Node
        {
            public Node(Shape shape)
            {
                this.shape = shape;

                this.text = Helper.GetShapeText(this.shape);
            }

            public override string ToString()
            {
                return this.DisplayText;
            }

            public override bool Equals(object obj)
            {
                if (!(obj is Node))
                {
                    return false;
                }

                var right = (Node)obj;

                return 
                    this.Id == right.Id &&
                    this.Text == right.Text;
            }

            public static bool ArrayEquals(Node[] left, Node[] right)
            {
                if(left.Length != right.Length)
                {
                    return false;
                }

                Dictionary<string, Node> leftMap = new Dictionary<string, Node>();
                for (int length = left.Length, i = 0; i < length; ++i)
                {
                    var item = left[i];
                    leftMap.Add(item.Id, item);
                }

                Dictionary<string, Node> rightMap = new Dictionary<string, Node>();
                for (int length = right.Length, i = 0; i < length; ++i)
                {
                    var item = right[i];
                    rightMap.Add(item.Id, item);
                }

                for (int length = left.Length, i = 0; i < length; ++i)
                {
                    var item = left[i];
                    Node other;
                    if (!rightMap.TryGetValue(item.Id, out other))
                    {
                        return false;
                    }
                    if (!item.Equals(other))
                    {
                        return false;
                    }
                }

                for (int length = right.Length, i = 0; i < length; ++i)
                {
                    var item = right[i];
                    Node other;
                    if (!leftMap.TryGetValue(item.Id, out other))
                    {
                        return false;
                    }
                    if (!item.Equals(other))
                    {
                        return false;
                    }
                }

                return true;
            }


            public string Id
            {
                get
                {
                    var result = Helper.GetShapeId(this.shape);
                    if (result == null)
                    {
                        return this.DisplayText;
                    }
                    return result;
                }
            }

            public string Text
            {
                get
                {
                    return this.text;
                }
            }

            public string DisplayText
            {
                get
                {
                    return this.text;
                }
            }

            public Shape Shape
            {
                get
                {
                    return this.shape;
                }
            }


            public float xPt;
            public float yPt;

            Shape shape;
            string text;
        }

        class Edge
        {
            public Edge(Shape shape, Node node1, Node node2)
            {
                this.shape = shape;
                this.node1 = node1;
                this.node2 = node2;

                this.text = Helper.GetShapeText(shape);

                string[] texts = new string[] { Helper.GetShapeText(this.node1.Shape) , Helper.GetShapeText(this.node2.Shape) };
                Array.Sort(texts);
                this.displayText = string.Format("{1} <> {2} [{0}]", Helper.GetShapeText(shape), texts[0], texts[1]);
            }

            public override string ToString()
            {
                return this.DisplayText;
            }

            public override bool Equals(object obj)
            {
                if (!(obj is Edge))
                {
                    return false;
                }

                var right = (Edge)obj;

                return
                    right.Id == this.Id &&
                    right.Text == this.Text &&
                    right.node1.Equals(this.node1) &&
                    right.node2.Equals(this.node2);
            }


            public void InvalidateMeasurements()
            {
                this.distancePtValid = false;
            }


            public static bool ArrayEquals(Edge[] left, Edge[] right)
            {
                if (left.Length != right.Length)
                {
                    return false;
                }

                Dictionary<string, Edge> leftMap = new Dictionary<string, Edge>();
                for (int length = left.Length, i = 0; i < length; ++i)
                {
                    var item = left[i];
                    leftMap.Add(item.Id, item);
                }

                Dictionary<string, Edge> rightMap = new Dictionary<string, Edge>();
                for (int length = right.Length, i = 0; i < length; ++i)
                {
                    var item = right[i];
                    rightMap.Add(item.Id, item);
                }

                for (int length = left.Length, i = 0; i < length; ++i)
                {
                    var item = left[i];
                    Edge other;
                    if (!rightMap.TryGetValue(item.Id, out other))
                    {
                        return false;
                    }
                    if(!item.Equals(other))
                    {
                        return false;
                    }
                }

                for (int length = right.Length, i = 0; i < length; ++i)
                {
                    var item = right[i];
                    Edge other;
                    if (!leftMap.TryGetValue(item.Id, out other))
                    {
                        return false;
                    }
                    if (!item.Equals(other))
                    {
                        return false;
                    }
                }

                return true;
            }

            public static float CalculateEdgeLength(LineShapeBase shape)
            {
                var segments = Helper.GetLinearShapeSegments(shape);
                double result = 0;
                for (int length = segments.Length, i = 0; i < length; ++i)
                {
                    var item = segments[i];
                    double diagonalLength = Math.Sqrt(item.Width * item.Width + item.Height * item.Height);
                    result += diagonalLength;
                }
                return (float)result;
            }


            public string Id
            {
                get
                {
                    var result = Helper.GetShapeId(this.shape);
                    if (result == null)
                    {
                        return this.DisplayText;
                    }
                    return result;
                }
            }

            public string Text
            {
                get
                {
                    return this.text;
                }
            }

            public string DisplayText
            {
                get
                {
                    return this.displayText;
                }
            }

            public Shape Shape
            {
                get
                {
                    return this.shape;
                }
            }

            public Node Node1
            {
                get
                {
                    return this.node1;
                }
            }

            public Node Node2
            {
                get
                {
                    return this.node2;
                }
            }

            public float DistancePt
            {
                get
                {
                    if(!this.distancePtValid)
                    {
                        this.distancePt = CalculateEdgeLength((LineShapeBase)this.shape);
                        this.distancePtValid = true;
                    }
                    return this.distancePt;
                }
            }

            Shape shape;
            public Node node1;
            public Node node2;
            string text;
            string displayText;

            float distancePt = 0;
            bool distancePtValid = false;
        }

        class TopologicalData
        {
            public Node[] nodes;
            public Edge[] edges;

            public Edge FindConnectingEdge(Node node1, Node node2)
            {
                for (int length = this.edges.Length, i = 0; i < length; ++i)
                {
                    var item = this.edges[i];
                    if(item.node1.Id != node1.Id && item.node1.Id != node2.Id)
                    {
                        continue;
                    }
                    if (item.node2.Id != node1.Id && item.node2.Id != node2.Id)
                    {
                        continue;
                    }
                    return item;
                }
                return null;
            }

            public Node FindNode(string id)
            {
                for (int length = this.nodes.Length, i = 0; i < length; ++i)
                {
                    var item = this.nodes[i];
                    if(item.Id == id)
                    {
                        return item;
                    }
                }
                return null;
            }

            public Edge FindEdge(string id)
            {
                for (int length = this.edges.Length, i = 0; i < length; ++i)
                {
                    var item = this.edges[i];
                    if (item.Id == id)
                    {
                        return item;
                    }
                }
                return null;
            }

            public override bool Equals(object obj)
            {
                if (!(obj is TopologicalData))
                {
                    return false;
                }

                TopologicalData right = (TopologicalData)obj;
                return
                    Node.ArrayEquals(right.nodes, this.nodes) &&
                    Edge.ArrayEquals(right.edges, this.edges);

            }

            public void InvalidateMeasurements()
            {
                for (int length = this.edges.Length, i = 0; i < length; ++i)
                {
                    this.edges[i].InvalidateMeasurements();
                }
            }
        }

        void OnInitialize()
        {
            var path = Path.Combine(Path.GetDirectoryName(Application.ExecutablePath), defaultProjectPath);

            //   load the default project
            project.Close();
            project.Name = Path.GetFileNameWithoutExtension(path);
            xmlStore.DirectoryName = Path.GetDirectoryName(path);
            xmlStore.FileExtension = Path.GetExtension(path);
            OpenProject(false);
            Text = GetFormTitle();

            display.ZoomLevel = defaultZoomLevel;

            this.LoadMetadata(path);
        }

        void LoadMetadata(string projectPath)
        {
            //  read metadata file
            Dictionary<string, string> metadata = new Dictionary<string, string>();

            string metadataFilePath = Path.Combine(Path.GetDirectoryName(projectPath), Path.GetFileNameWithoutExtension(projectPath) + metadataFileExtension);

            if(!File.Exists(metadataFilePath))
            {
                return;
            }

            string[] lines = File.ReadAllLines(metadataFilePath);
            for (int length = lines.Length, i = 0; i < length; ++i)
            {
                var line = lines[i];
                string[] tokens = line.Split(new char[] { '=' }, StringSplitOptions.RemoveEmptyEntries);
                if(tokens.Length < 2)
                {
                    continue;
                }
                string name = tokens[0];
                string value = line.Substring(name.Length + 1);
                metadata.Add(name, value);
            }

            //  use metadata
            string scaleText;
            if(metadata.TryGetValue(metadataFieldName_Scale, out scaleText))
            {
                decimal scale;
                if(decimal.TryParse(scaleText.Trim(), out scale))
                {
                    if(scale >= this.scaleNumericUpDown.Minimum && scale <= this.scaleNumericUpDown.Maximum)
                    {
                        this.scaleNumericUpDown.Value = scale;
                    }
                }
            }
        }

        void SaveMetadata(string projectPath)
        {
            //  build the metadata dictionary
            Dictionary<string, string> metadata = new Dictionary<string, string>();
            metadata.Add(metadataFieldName_Scale, this.scaleNumericUpDown.Value.ToString());

            //  write the metadata to file
            string metadataFilePath = Path.Combine(Path.GetDirectoryName(projectPath), Path.GetFileNameWithoutExtension(projectPath) + metadataFileExtension);
            StringBuilder sb = new StringBuilder();
            foreach(var kvp in metadata)
            {
                sb.AppendFormat("{0}={1}", kvp.Key, kvp.Value);
                sb.AppendLine();
            }
            File.WriteAllText(metadataFilePath, sb.ToString());
        }

        void SaveMeasurements(string projectPath)
        {
            if(this.currentTopologicalData == null)
            {
                return;
            }

            string jsonFilePath = Path.Combine(Path.GetDirectoryName(projectPath), Path.GetFileNameWithoutExtension(projectPath) + jsonFileExtension);
            StringBuilder sb = new StringBuilder();

            this.currentTopologicalData.InvalidateMeasurements();

            sb.AppendLine("{");
            sb.AppendLine("  \"scale\": " + this.scaleNumericUpDown.Value.ToString() + ",");
            sb.AppendLine("  \"nodes\":");
            sb.AppendLine("  [");
            for (int length = this.currentTopologicalData.nodes.Length, i = 0; i < length; ++i)
            {
                var item = this.currentTopologicalData.nodes[i];
                var xM = Math.Round((decimal)item.xPt / (this.scaleNumericUpDown.Value == 0 ? 1 : this.scaleNumericUpDown.Value), 2);
                var yM = Math.Round((decimal)item.yPt / (this.scaleNumericUpDown.Value == 0 ? 1 : this.scaleNumericUpDown.Value), 2);

                sb.AppendLine("    {");
                sb.AppendFormat("      \"name\": \"{0}\",", item.Text.Replace("\\", "\\\\").Replace("\"", "\\\""));
                sb.AppendLine();
                sb.AppendFormat("      \"xPt\": \"{0}\",", item.xPt);
                sb.AppendLine();
                sb.AppendFormat("      \"yPt\": \"{0}\",", item.yPt);
                sb.AppendLine();
                sb.AppendFormat("      \"xM\": \"{0}\",", xM);
                sb.AppendLine();
                sb.AppendFormat("      \"yM\": \"{0}\"", yM);
                sb.AppendLine();
                sb.Append("    }");
                if (i != length - 1)
                {
                    sb.Append(",");
                }
                sb.AppendLine();
            }
            sb.AppendLine("  ],");
            sb.AppendLine("  \"edges\":");
            sb.AppendLine("  [");
            for (int length = this.currentTopologicalData.edges.Length, i = 0; i < length; ++i)
            {
                var item = this.currentTopologicalData.edges[i];
                
                var distanceM = (decimal)item.DistancePt / (this.scaleNumericUpDown.Value == 0 ? 1 : this.scaleNumericUpDown.Value);
                var timeMin_4kmPerH = (60 * distanceM / 4000);

                sb.AppendLine("    {");

                sb.AppendFormat("      \"name\": \"{0}\",", item.Text.Replace("\\", "\\\\").Replace("\"", "\\\""));
                sb.AppendLine();
                sb.AppendFormat("      \"node1\": \"{0}\",", item.node1.Text.Replace("\\", "\\\\").Replace("\"", "\\\""));
                sb.AppendLine();
                sb.AppendFormat("      \"node2\": \"{0}\",", item.node2.Text.Replace("\\", "\\\\").Replace("\"", "\\\""));
                sb.AppendLine();
                sb.AppendFormat("      \"distancePt\": {0},", Math.Round(item.DistancePt, 2));
                sb.AppendLine();
                sb.AppendFormat("      \"distanceM\": {0},", Math.Round(distanceM, 2));
                sb.AppendLine();
                sb.AppendFormat("      \"timeMin_4kmPerH\": {0}", Math.Round(timeMin_4kmPerH, 2));
                sb.AppendLine();

                sb.Append("    }");
                if (i != length - 1)
                {
                    sb.Append(",");
                }
                sb.AppendLine();
            }
            sb.AppendLine("  ]");
            sb.AppendLine("}");

            File.WriteAllText(jsonFilePath, sb.ToString());
            
        }

        void OnDiagramChanged(Display display)
        {
            if(display.Diagram == null)
            {
                return;
            }
            if (display == null)
            {
                return;
            }

            //System.Diagnostics.Debug.WriteLine("OnDiagramChanged() ====================================");
            this.UI_UpdateMesurements();

            TopologicalData oldTopologicalData = this.currentTopologicalData;
            this.currentTopologicalData = this.GetTopologicalData(this.display);
            if(this.currentTopologicalData.Equals(oldTopologicalData))
            {
                return;
            }
            this.UI_DisplayTopologicalData(this.currentTopologicalData);
        }

        void UI_DisplayTopologicalData(TopologicalData topologicalData)
        {
            //System.Diagnostics.Debug.WriteLine("UI_DisplayTopologicalData()");

            this.node1ListBox.Items.Clear();
            this.node1ListBox.Items.AddRange(topologicalData.nodes);
            this.node2ListBox.Items.Clear();
            this.node2ListBox.Items.AddRange(topologicalData.nodes);
            this.edgeListBox.Items.Clear();
            this.edgeListBox.Items.AddRange(topologicalData.edges);
        }

        void UI_AutoSelectEdge()
        {
            if(this.selectedNode1 == null || this.selectedNode2 == null || this.currentTopologicalData == null)
            {
                return;
            }
            var edge = this.currentTopologicalData.FindConnectingEdge(this.selectedNode1, this.selectedNode2);
            if(edge == null)
            {
                return;
            }
            this.edgeListBox.SelectedItem = edge;
        }

        void UI_UpdateMesurements()
        {
            if(this.selectedEdge == null)
            {
                return;
            }
            this.selectedEdge.InvalidateMeasurements();
            var distancePt = this.selectedEdge.DistancePt;
            var distanceM = (decimal)distancePt / (this.scaleNumericUpDown.Value == 0 ? 1 : this.scaleNumericUpDown.Value);
            var timeMin_4kmPerH = (60 * distanceM / 4000);

            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("{0} pt", (int)Math.Round(distancePt));
            sb.AppendLine();
            sb.AppendFormat("{0} m", (int)Math.Round(distanceM));
            sb.AppendLine();
            sb.AppendFormat("{0} min", (int)Math.Round(timeMin_4kmPerH));
            sb.AppendLine();

            this.measurementsTextBox.Text = sb.ToString();
        }

        TopologicalData GetTopologicalData(Display display)
        {
            Dictionary<string, Node> nodeMap = new Dictionary<string, Node>();

            List<Node> nodes = new List<Node>();
            List<Edge> edges = new List<Edge>();

            foreach (var shape in display.Diagram.Shapes)
            {
                if (Helper.GetShapeText(shape) == string.Empty)
                {
                    continue;
                }
                if (shape is CaptionedShapeBase)
                {
                    //System.Diagnostics.Debug.WriteLine(string.Format("Shape {0}", Helper.GetShapeText(shape)));
                    var node = new Node(shape);
                    nodes.Add(node);
                    nodeMap.Add(node.Id, node);
                }
            }
            foreach (var shape in display.Diagram.Shapes)
            {
                if (Helper.GetShapeText(shape) == string.Empty)
                {
                    continue;
                }
                if (shape is LineShapeBase)
                {
                    CaptionedShapeBase node1Shape = null;
                    CaptionedShapeBase node2Shape = null;
                    Point node1Point = new Point();
                    Point node2Point = new Point();
                    int counter = 0;
                    foreach (ControlPointId gluePointId in shape.GetControlPointIds(ControlPointCapabilities.Glue))
                    {
                        ShapeConnectionInfo sci = shape.GetConnectionInfo(gluePointId, null);
                        if (sci.IsEmpty)
                        {
                            continue;
                        }
                        if (!(sci.OtherShape is CaptionedShapeBase))
                        {
                            continue;
                        }
                        Point point = shape.GetControlPointPosition(gluePointId);

                        switch (counter)
                        {
                            case 0:
                                node1Shape = (CaptionedShapeBase)sci.OtherShape;
                                node1Point = point;
                                break;
                            case 1:
                                node2Shape = (CaptionedShapeBase)sci.OtherShape;
                                node2Point = point;
                                break;
                        }
                        ++counter;
                    }

                    if (node1Shape == null || Helper.GetShapeText(node1Shape) == string.Empty)
                    {
                        continue;
                    }
                    if (node2Shape == null || Helper.GetShapeText(node2Shape) == string.Empty)
                    {
                        continue;
                    }

                    //System.Diagnostics.Debug.WriteLine(string.Format("Line {0}, between {1} and {2}", Helper.GetShapeText(shape), Helper.GetShapeText(node1Shape), Helper.GetShapeText(node2Shape)));

                    var node1 = nodeMap[Helper.GetShapeId(node1Shape)];
                    node1.xPt = node1Point.X;
                    node1.yPt = node1Point.Y;
                    var node2 = nodeMap[Helper.GetShapeId(node2Shape)];
                    node2.xPt = node2Point.X;
                    node2.yPt = node2Point.Y;
                    var edge = new Edge(shape, node1, node2);
                    edges.Add(edge);
                }
            }

            TopologicalData result = new TopologicalData
            {
                nodes = nodes.ToArray(),
                edges = edges.ToArray(),
            };

            return result;
        }

        TopologicalData currentTopologicalData;
        Node selectedNode1;
        Node selectedNode2;
        Edge selectedEdge;

        #endregion
    }
}