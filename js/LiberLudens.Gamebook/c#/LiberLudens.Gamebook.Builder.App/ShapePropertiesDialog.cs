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
using System.Windows.Forms;

using Dataweb.NShape;
using Dataweb.NShape.Advanced;

namespace LiberLudens.Gamebook.Builder.App
{

	public partial class ShapePropertiesDialog : Form {

		public ShapePropertiesDialog() {
			InitializeComponent();
		}

        public void SetDiagram()
        {
            this.tagTextBox.Enabled = false;
        }

        public void SetShapes(IShapeCollection shapes)
        {
            if(shapes.Count != 1)
            {
                this.tagTextBox.Enabled = false;
                return;
            }
            foreach(var s in shapes)
            {
                this.shape = s;
                break;
            }
            this.tagTextBox.Enabled = true;

            this.tagTextBox.Text = Helper.GetShapeText(this.shape);
        }

		private void ShapePropertiesDialog_FormClosed(object sender, FormClosedEventArgs e) {
			propertyController.Project = null;
		}

        private void tagTextBox_TextChanged(object sender, System.EventArgs e)
        {
            Helper.SetShapeText(this.shape, this.tagTextBox.Text);
        }

        protected override void OnClosed(EventArgs e)
        {
            this.ClosedNotify(this, new EventArgs());
            base.OnClosed(e);
        }

        public event EventHandler ClosedNotify;

        Shape shape;
    }

}