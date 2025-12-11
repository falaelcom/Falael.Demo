using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Reflection;

using OpenGL;

namespace Falael.Bic.Research.ConwaySetExplorer
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] appargs)
        {
            string envDebug = Environment.GetEnvironmentVariable("DEBUG");

            if (envDebug == "GL")
            {
                KhronosApi.RegisterApplicationLogDelegate(delegate (string format, object[] args) 
                {
                    Console.WriteLine(format, args);
                });
            }

			if (Environment.OSVersion.Version.Major >= 6)
                SetProcessDPIAware();

			Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

			string miniAppTypeName = Properties.Settings.Default.MiniAppTypeName;
			Type miniAppType = null;
			try
			{
				miniAppType = Assembly.GetExecutingAssembly().GetType(miniAppTypeName);
			}
			catch (Exception ex)
			{
				System.Diagnostics.Debug.WriteLine(ex);
			}

			do
			{
				if (miniAppType == null)
				{
					var menuForm = new MenuForm();
					menuForm.ShowDialog();
					miniAppType = menuForm.MiniAppType;
					if (miniAppType != null)
					{
						Properties.Settings.Default.MiniAppTypeName = miniAppType.FullName;
						Properties.Settings.Default.Save();
					}
					else
					{
						break;
					}
				}
				Application.Run(new Form1(miniAppType, appargs[0] ?? @".\"));
				miniAppType = null;
			}
			while (true);
		}

		[System.Runtime.InteropServices.DllImport("user32.dll")]
		private static extern bool SetProcessDPIAware();
	}
}
