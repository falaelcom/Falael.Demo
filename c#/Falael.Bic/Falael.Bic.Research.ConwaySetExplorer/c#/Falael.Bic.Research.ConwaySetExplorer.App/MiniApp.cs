using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using OpenGL;

namespace Falael.Bic.Research.ConwaySetExplorer
{
    public abstract class MiniApp: IDisposable
    {
        public MiniApp(bool requireDoubleBuffer)
        {
            this.requireDoubleBuffer = requireDoubleBuffer;
        }

        public virtual void Init(Form mainForm, GlControl glControl, Panel controlsPanel, string storageBasePath)
        {
            mainForm.Text = this.GetType().Name;

            this.glControl = glControl;
            this.controlsPanel = controlsPanel;
            this.storageBasePath = storageBasePath;
		}
        public virtual void SizeChanged(Size size) { }
        public abstract void Render();
        public virtual void Tick() { }

		public abstract void Dispose();

		public bool RequireDoubleBuffer
        {
            get
            {
                return this.requireDoubleBuffer;
            }
        }

		public Control GlControl
		{
			get
			{
				return this.glControl;
			}
		}

		protected GlControl glControl;
        protected Panel controlsPanel;
        bool requireDoubleBuffer;
		protected string storageBasePath;

	}
}
