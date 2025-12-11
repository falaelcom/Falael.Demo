using System;
using System.IO;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace LiberLudens.Gamebook.Builder.App
{
    public partial class StructureEditorUserControl : UserControl
    {
        public StructureEditorUserControl()
        {
            InitializeComponent();

            //var bookDocument = new BookDocument(@"c:\repos\Falael.CODE\manifestation\app\LiberLudens\LiberLudens.Gamebook\js\books\01-no-dogs-land\data");
        }

        public void RefreshData()
        {
            if(this.rootPath == null)
            {
                this.fsTreeView.Nodes.Clear();
                this.entryListView.Items.Clear();
                this.textEditorControl.Text = string.Empty;
                this.jsonEditorControl.Text = string.Empty;

                return;
            }

            this.entryListView.Items.Add(this.rootPath);
        }

        bool CanDrop(DragEventArgs e)
        {
            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
            if (files.Length != 1)
            {
                return false;
            }

            string path = files[0];
            if (!Directory.Exists(files[0]))
            {
                return false;
            }

            var subDirectories = Directory.GetDirectories(path);
            for (int length = subDirectories.Length, i = 0; i < length; ++i)
            {
                var directory = subDirectories[i];
                var directoryName = Path.GetFileName(directory);
                if(directoryName.ToLower() == "data")
                {
                    return true;
                }
            }

            return false;
        }

        void StructureEditorUserControl_DragEnter(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                if (!this.CanDrop(e))
                {
                    return;
                }
                e.Effect = DragDropEffects.Move;
            }
        }

        void StructureEditorUserControl_DragDrop(object sender, DragEventArgs e)
        {
            if (!this.CanDrop(e))
            {
                return;
            }

            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);

            this.rootPath = Path.Combine(files[0], "data");
        }

        public string RootPath
		{
            get
            {
                return this.rootPath;
            }
            set
            {
                this.rootPath = value;
                this.RefreshData();
            }
        }

        string rootPath;
    }
}
