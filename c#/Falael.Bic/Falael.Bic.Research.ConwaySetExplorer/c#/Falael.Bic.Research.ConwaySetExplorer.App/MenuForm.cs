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

namespace Falael.Bic.Research.ConwaySetExplorer
{
	public partial class MenuForm : Form
	{
		public MenuForm()
		{
			InitializeComponent();

			Type[] typelist = Assembly.GetExecutingAssembly().GetTypes().Where(t => t.Name.IndexOf("MiniApp_") == 0).ToArray();
			Array.Sort(typelist, (left, right) =>
			{
				return left.Name.CompareTo(right.Name);
			});
			for (int length = typelist.Length, i = 0; i < length; ++i)
			{
				var type = typelist[i];
				Button button = new Button();
				this.miniAppsPanel.Controls.Add(button);
				button.Tag = type;
				button.Text = type.Name.Replace("MiniApp_", string.Empty).Replace("_", " ");
				button.Height = 35;
				button.Top = i * button.Height + 12;
				button.Left = 15;
				button.Width = this.miniAppsPanel.Width - 30;
				button.Click += this.Button_Click;
			}
		}

		void Button_Click(object sender, EventArgs e)
		{
			this.miniAppType = (Type)((Button)sender).Tag;
			this.Close();
		}

		void exitButton_Click(object sender, EventArgs e)
		{
			this.miniAppType = null;
			this.Close();
		}

		public Type MiniAppType
		{
			get
			{
				return this.miniAppType;
			}
		}

		Type miniAppType = null;
	}
}
