using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Reflection;

using OpenGL;

namespace Falael.Bic.Research.ConwaySetExplorer
{
    //  https://github.com/luca-piccioni/OpenGL.Net
    public partial class Form1 : Form
    {
        public Form1(Type miniAppType, string storageBasePath)
        {
            InitializeComponent();

			this.miniApp = (MiniApp)Activator.CreateInstance(miniAppType);

			this.glControl.DoubleBuffer = this.miniApp.RequireDoubleBuffer;
			this.storageBasePath = storageBasePath;
		}

		protected override void OnClosing(CancelEventArgs e)
		{
			this.timer.Stop();
			this.miniApp.Dispose();

			base.OnClosing(e);
		}

		void glControl_ContextCreated(object sender, GlControlEventArgs e)
        {
            this.miniApp.Init(this, this.glControl, this.controlsPanel, this.storageBasePath);

            if (this.glControl.MultisampleBits > 0)
            {
                Gl.Enable(EnableCap.Multisample);
            }
        }

        void glControl_SizeChanged(object sender, EventArgs e)
        {
			this.glControl.Width = this.glControl.Height;
			this.glControl.Left = this.Size.Width - this.glControl.Width;

			if (this.miniApp == null)
            {
                return;
            }
			if (this.miniApp.GlControl == null)
			{
				return;
			}

			this.miniApp.SizeChanged(this.glControl.Size);
        }

        void glControl_Render(object sender, GlControlEventArgs e)
        {
            this.miniApp.Render();
        }

        void timer_Tick(object sender, EventArgs e)
        {
            this.miniApp.Tick();
        }
        
        MiniApp miniApp;
		private readonly string storageBasePath;
	}
}
