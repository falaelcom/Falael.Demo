using System;
using System.Diagnostics;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;

namespace Qnd.Bic.Research.Fractals.BinaryTree.App
{
	/// <summary>
	/// Summary description for Form1.
	/// </summary>
	public class Form1 : System.Windows.Forms.Form
	{
		private System.Windows.Forms.Panel drawPanel;
		private System.Windows.Forms.VScrollBar vScrollBar1;
		private System.Windows.Forms.VScrollBar vScrollBar2;
		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.Label label2;
		private System.Windows.Forms.VScrollBar vScrollBar3;
		private System.Windows.Forms.Label label3;
		private System.Windows.Forms.VScrollBar vScrollBar4;
		private System.Windows.Forms.Label label4;
		private System.Windows.Forms.VScrollBar vScrollBar5;
		private System.Windows.Forms.Label label5;
		private System.Windows.Forms.Label label6;
		private System.Windows.Forms.VScrollBar vScrollBar6;
		private System.Windows.Forms.VScrollBar vScrollBar7;
		private System.Windows.Forms.Label label7;
		private System.Windows.Forms.TabControl tabControl1;
		private System.Windows.Forms.TabPage tabPage1;
		private System.Windows.Forms.TabPage tabPage2;
		private System.Windows.Forms.VScrollBar vScrollBar8;
		private System.Windows.Forms.VScrollBar vScrollBar9;
		private System.Windows.Forms.Label label8;
		private System.Windows.Forms.Label label9;
		private System.Windows.Forms.VScrollBar vScrollBar10;
		private System.Windows.Forms.Label label10;
		private System.Windows.Forms.VScrollBar vScrollBar11;
		private System.Windows.Forms.Label label11;
		private System.Windows.Forms.Label label12;
		private System.Windows.Forms.VScrollBar vScrollBar12;
		private System.Windows.Forms.Label label13;
		private System.Windows.Forms.VScrollBar vScrollBar13;
		private System.Windows.Forms.Label label14;
		private System.Windows.Forms.VScrollBar vScrollBar14;
		private System.Windows.Forms.HScrollBar hScrollBar1;
		private System.Windows.Forms.Button button1;
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.Container components = null;

		public Form1()
		{
			//
			// Required for Windows Form Designer support
			//
			InitializeComponent();

			//
			// TODO: Add any constructor code after InitializeComponent call
			//
		}

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		protected override void Dispose( bool disposing )
		{
			if( disposing )
			{
				if (components != null) 
				{
					components.Dispose();
				}
			}
			base.Dispose( disposing );
		}

		#region Windows Form Designer generated code
		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.drawPanel = new System.Windows.Forms.Panel();
			this.vScrollBar1 = new System.Windows.Forms.VScrollBar();
			this.vScrollBar2 = new System.Windows.Forms.VScrollBar();
			this.label1 = new System.Windows.Forms.Label();
			this.label2 = new System.Windows.Forms.Label();
			this.vScrollBar3 = new System.Windows.Forms.VScrollBar();
			this.label3 = new System.Windows.Forms.Label();
			this.vScrollBar4 = new System.Windows.Forms.VScrollBar();
			this.label4 = new System.Windows.Forms.Label();
			this.vScrollBar5 = new System.Windows.Forms.VScrollBar();
			this.label5 = new System.Windows.Forms.Label();
			this.label6 = new System.Windows.Forms.Label();
			this.vScrollBar6 = new System.Windows.Forms.VScrollBar();
			this.vScrollBar7 = new System.Windows.Forms.VScrollBar();
			this.label7 = new System.Windows.Forms.Label();
			this.tabControl1 = new System.Windows.Forms.TabControl();
			this.tabPage1 = new System.Windows.Forms.TabPage();
			this.tabPage2 = new System.Windows.Forms.TabPage();
			this.vScrollBar8 = new System.Windows.Forms.VScrollBar();
			this.vScrollBar9 = new System.Windows.Forms.VScrollBar();
			this.label8 = new System.Windows.Forms.Label();
			this.label9 = new System.Windows.Forms.Label();
			this.vScrollBar10 = new System.Windows.Forms.VScrollBar();
			this.label10 = new System.Windows.Forms.Label();
			this.vScrollBar11 = new System.Windows.Forms.VScrollBar();
			this.label11 = new System.Windows.Forms.Label();
			this.label12 = new System.Windows.Forms.Label();
			this.vScrollBar12 = new System.Windows.Forms.VScrollBar();
			this.label13 = new System.Windows.Forms.Label();
			this.vScrollBar13 = new System.Windows.Forms.VScrollBar();
			this.label14 = new System.Windows.Forms.Label();
			this.vScrollBar14 = new System.Windows.Forms.VScrollBar();
			this.hScrollBar1 = new System.Windows.Forms.HScrollBar();
			this.button1 = new System.Windows.Forms.Button();
			this.tabControl1.SuspendLayout();
			this.tabPage1.SuspendLayout();
			this.tabPage2.SuspendLayout();
			this.SuspendLayout();
			// 
			// drawPanel
			// 
			this.drawPanel.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.drawPanel.BackColor = System.Drawing.Color.White;
			this.drawPanel.Location = new System.Drawing.Point(0, 37);
			this.drawPanel.Name = "drawPanel";
			this.drawPanel.Size = new System.Drawing.Size(539, 545);
			this.drawPanel.TabIndex = 0;
			this.drawPanel.Paint += new System.Windows.Forms.PaintEventHandler(this.drawPanel_Paint);
			// 
			// vScrollBar1
			// 
			this.vScrollBar1.Location = new System.Drawing.Point(48, 194);
			this.vScrollBar1.Name = "vScrollBar1";
			this.vScrollBar1.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar1.TabIndex = 1;
			this.vScrollBar1.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar1_Scroll);
			// 
			// vScrollBar2
			// 
			this.vScrollBar2.Location = new System.Drawing.Point(77, 194);
			this.vScrollBar2.Name = "vScrollBar2";
			this.vScrollBar2.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar2.TabIndex = 1;
			this.vScrollBar2.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar2_Scroll);
			// 
			// label1
			// 
			this.label1.Location = new System.Drawing.Point(48, 9);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(10, 176);
			this.label1.TabIndex = 2;
			this.label1.Text = "Depth Scale";
			this.label1.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// label2
			// 
			this.label2.Location = new System.Drawing.Point(134, 9);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(10, 176);
			this.label2.TabIndex = 2;
			this.label2.Text = "Beta";
			this.label2.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar3
			// 
			this.vScrollBar3.Location = new System.Drawing.Point(134, 194);
			this.vScrollBar3.Name = "vScrollBar3";
			this.vScrollBar3.Size = new System.Drawing.Size(20, 443);
			this.vScrollBar3.TabIndex = 1;
			this.vScrollBar3.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar3_Scroll);
			// 
			// label3
			// 
			this.label3.Location = new System.Drawing.Point(77, 9);
			this.label3.Name = "label3";
			this.label3.Size = new System.Drawing.Size(9, 176);
			this.label3.TabIndex = 2;
			this.label3.Text = "Alpha";
			this.label3.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar4
			// 
			this.vScrollBar4.Location = new System.Drawing.Point(163, 194);
			this.vScrollBar4.Name = "vScrollBar4";
			this.vScrollBar4.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar4.TabIndex = 1;
			this.vScrollBar4.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar4_Scroll);
			// 
			// label4
			// 
			this.label4.Location = new System.Drawing.Point(163, 9);
			this.label4.Name = "label4";
			this.label4.Size = new System.Drawing.Size(10, 176);
			this.label4.TabIndex = 2;
			this.label4.Text = "a";
			this.label4.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar5
			// 
			this.vScrollBar5.Location = new System.Drawing.Point(192, 194);
			this.vScrollBar5.Name = "vScrollBar5";
			this.vScrollBar5.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar5.TabIndex = 1;
			this.vScrollBar5.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar5_Scroll);
			// 
			// label5
			// 
			this.label5.Location = new System.Drawing.Point(192, 9);
			this.label5.Name = "label5";
			this.label5.Size = new System.Drawing.Size(10, 176);
			this.label5.TabIndex = 2;
			this.label5.Text = "b";
			this.label5.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// label6
			// 
			this.label6.Location = new System.Drawing.Point(106, 9);
			this.label6.Name = "label6";
			this.label6.Size = new System.Drawing.Size(9, 176);
			this.label6.TabIndex = 2;
			this.label6.Text = "Alpha dec. rate";
			this.label6.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar6
			// 
			this.vScrollBar6.Location = new System.Drawing.Point(106, 194);
			this.vScrollBar6.Name = "vScrollBar6";
			this.vScrollBar6.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar6.TabIndex = 1;
			this.vScrollBar6.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar6_Scroll);
			// 
			// vScrollBar7
			// 
			this.vScrollBar7.Location = new System.Drawing.Point(19, 194);
			this.vScrollBar7.Name = "vScrollBar7";
			this.vScrollBar7.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar7.TabIndex = 1;
			this.vScrollBar7.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar7_Scroll);
			// 
			// label7
			// 
			this.label7.Location = new System.Drawing.Point(19, 9);
			this.label7.Name = "label7";
			this.label7.Size = new System.Drawing.Size(10, 176);
			this.label7.TabIndex = 2;
			this.label7.Text = "Max Weight";
			this.label7.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// tabControl1
			// 
			this.tabControl1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.tabControl1.Controls.Add(this.tabPage1);
			this.tabControl1.Controls.Add(this.tabPage2);
			this.tabControl1.Location = new System.Drawing.Point(558, 9);
			this.tabControl1.Name = "tabControl1";
			this.tabControl1.SelectedIndex = 0;
			this.tabControl1.Size = new System.Drawing.Size(240, 674);
			this.tabControl1.TabIndex = 3;
			// 
			// tabPage1
			// 
			this.tabPage1.Controls.Add(this.vScrollBar2);
			this.tabPage1.Controls.Add(this.vScrollBar4);
			this.tabPage1.Controls.Add(this.label3);
			this.tabPage1.Controls.Add(this.label7);
			this.tabPage1.Controls.Add(this.vScrollBar3);
			this.tabPage1.Controls.Add(this.label2);
			this.tabPage1.Controls.Add(this.vScrollBar1);
			this.tabPage1.Controls.Add(this.label6);
			this.tabPage1.Controls.Add(this.label4);
			this.tabPage1.Controls.Add(this.vScrollBar6);
			this.tabPage1.Controls.Add(this.label1);
			this.tabPage1.Controls.Add(this.vScrollBar5);
			this.tabPage1.Controls.Add(this.label5);
			this.tabPage1.Controls.Add(this.vScrollBar7);
			this.tabPage1.Location = new System.Drawing.Point(4, 25);
			this.tabPage1.Name = "tabPage1";
			this.tabPage1.Size = new System.Drawing.Size(232, 645);
			this.tabPage1.TabIndex = 0;
			this.tabPage1.Text = "Values";
			// 
			// tabPage2
			// 
			this.tabPage2.Controls.Add(this.vScrollBar8);
			this.tabPage2.Controls.Add(this.vScrollBar9);
			this.tabPage2.Controls.Add(this.label8);
			this.tabPage2.Controls.Add(this.label9);
			this.tabPage2.Controls.Add(this.vScrollBar10);
			this.tabPage2.Controls.Add(this.label10);
			this.tabPage2.Controls.Add(this.vScrollBar11);
			this.tabPage2.Controls.Add(this.label11);
			this.tabPage2.Controls.Add(this.label12);
			this.tabPage2.Controls.Add(this.vScrollBar12);
			this.tabPage2.Controls.Add(this.label13);
			this.tabPage2.Controls.Add(this.vScrollBar13);
			this.tabPage2.Controls.Add(this.label14);
			this.tabPage2.Controls.Add(this.vScrollBar14);
			this.tabPage2.Location = new System.Drawing.Point(4, 25);
			this.tabPage2.Name = "tabPage2";
			this.tabPage2.Size = new System.Drawing.Size(232, 645);
			this.tabPage2.TabIndex = 1;
			this.tabPage2.Text = "Random";
			// 
			// vScrollBar8
			// 
			this.vScrollBar8.Location = new System.Drawing.Point(77, 194);
			this.vScrollBar8.Name = "vScrollBar8";
			this.vScrollBar8.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar8.TabIndex = 9;
			this.vScrollBar8.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar8_Scroll);
			// 
			// vScrollBar9
			// 
			this.vScrollBar9.Location = new System.Drawing.Point(163, 194);
			this.vScrollBar9.Name = "vScrollBar9";
			this.vScrollBar9.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar9.TabIndex = 8;
			this.vScrollBar9.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar9_Scroll);
			// 
			// label8
			// 
			this.label8.Location = new System.Drawing.Point(77, 9);
			this.label8.Name = "label8";
			this.label8.Size = new System.Drawing.Size(9, 176);
			this.label8.TabIndex = 12;
			this.label8.Text = "Alpha";
			this.label8.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// label9
			// 
			this.label9.Location = new System.Drawing.Point(19, 9);
			this.label9.Name = "label9";
			this.label9.Size = new System.Drawing.Size(10, 176);
			this.label9.TabIndex = 13;
			this.label9.Text = "Max Weight";
			this.label9.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar10
			// 
			this.vScrollBar10.Location = new System.Drawing.Point(134, 194);
			this.vScrollBar10.Name = "vScrollBar10";
			this.vScrollBar10.Size = new System.Drawing.Size(20, 443);
			this.vScrollBar10.TabIndex = 7;
			this.vScrollBar10.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar10_Scroll);
			// 
			// label10
			// 
			this.label10.Location = new System.Drawing.Point(134, 9);
			this.label10.Name = "label10";
			this.label10.Size = new System.Drawing.Size(10, 176);
			this.label10.TabIndex = 14;
			this.label10.Text = "Beta";
			this.label10.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar11
			// 
			this.vScrollBar11.Location = new System.Drawing.Point(48, 194);
			this.vScrollBar11.Name = "vScrollBar11";
			this.vScrollBar11.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar11.TabIndex = 4;
			this.vScrollBar11.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar11_Scroll);
			// 
			// label11
			// 
			this.label11.Location = new System.Drawing.Point(106, 9);
			this.label11.Name = "label11";
			this.label11.Size = new System.Drawing.Size(9, 176);
			this.label11.TabIndex = 16;
			this.label11.Text = "Alpha dec. rate";
			this.label11.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// label12
			// 
			this.label12.Location = new System.Drawing.Point(163, 9);
			this.label12.Name = "label12";
			this.label12.Size = new System.Drawing.Size(10, 176);
			this.label12.TabIndex = 15;
			this.label12.Text = "a";
			this.label12.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar12
			// 
			this.vScrollBar12.Location = new System.Drawing.Point(106, 194);
			this.vScrollBar12.Name = "vScrollBar12";
			this.vScrollBar12.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar12.TabIndex = 3;
			this.vScrollBar12.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar12_Scroll);
			// 
			// label13
			// 
			this.label13.Location = new System.Drawing.Point(48, 9);
			this.label13.Name = "label13";
			this.label13.Size = new System.Drawing.Size(10, 176);
			this.label13.TabIndex = 10;
			this.label13.Text = "Depth Scale";
			this.label13.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar13
			// 
			this.vScrollBar13.Location = new System.Drawing.Point(192, 194);
			this.vScrollBar13.Name = "vScrollBar13";
			this.vScrollBar13.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar13.TabIndex = 6;
			this.vScrollBar13.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar13_Scroll);
			// 
			// label14
			// 
			this.label14.Location = new System.Drawing.Point(192, 9);
			this.label14.Name = "label14";
			this.label14.Size = new System.Drawing.Size(10, 176);
			this.label14.TabIndex = 11;
			this.label14.Text = "b";
			this.label14.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
			// 
			// vScrollBar14
			// 
			this.vScrollBar14.Location = new System.Drawing.Point(19, 194);
			this.vScrollBar14.Name = "vScrollBar14";
			this.vScrollBar14.Size = new System.Drawing.Size(19, 443);
			this.vScrollBar14.TabIndex = 5;
			this.vScrollBar14.Scroll += new System.Windows.Forms.ScrollEventHandler(this.vScrollBar14_Scroll);
			// 
			// hScrollBar1
			// 
			this.hScrollBar1.Location = new System.Drawing.Point(10, 9);
			this.hScrollBar1.Maximum = 50;
			this.hScrollBar1.Minimum = 1;
			this.hScrollBar1.Name = "hScrollBar1";
			this.hScrollBar1.Size = new System.Drawing.Size(576, 19);
			this.hScrollBar1.TabIndex = 4;
			this.hScrollBar1.Value = 1;
			this.hScrollBar1.Scroll += new System.Windows.Forms.ScrollEventHandler(this.hScrollBar1_Scroll);
			// 
			// button1
			// 
			this.button1.Location = new System.Drawing.Point(605, 9);
			this.button1.Name = "button1";
			this.button1.Size = new System.Drawing.Size(90, 27);
			this.button1.TabIndex = 5;
			this.button1.Text = "Save Img";
			this.button1.Click += new System.EventHandler(this.button1_Click);
			// 
			// Form1
			// 
			this.AutoScaleBaseSize = new System.Drawing.Size(6, 15);
			this.ClientSize = new System.Drawing.Size(808, 597);
			this.Controls.Add(this.button1);
			this.Controls.Add(this.hScrollBar1);
			this.Controls.Add(this.tabControl1);
			this.Controls.Add(this.drawPanel);
			this.Name = "Form1";
			this.Text = "Form1";
			this.tabControl1.ResumeLayout(false);
			this.tabPage1.ResumeLayout(false);
			this.tabPage2.ResumeLayout(false);
			this.ResumeLayout(false);

		}
		#endregion

		/// <summary>
		/// The main entry point for the application.
		/// </summary>
		[STAThread]
		static void Main() 
		{
			Application.Run(new Form1());
		}

		private void drawPanel_Paint(object sender, System.Windows.Forms.PaintEventArgs e)
		{
			try
			{
//				Bitmap bmp = new Bitmap(this.drawPanel.Width, this.drawPanel.Height, e.Graphics);
//				this.DrawCircle(bmp, new PointF(200, 200), 150, 0.01f);
//				this.DrawSine(bmp, new PointF(0, 100), 10, 100, 0.1f, 0.1f);				
//				e.Graphics.DrawImageUnscaled(bmp, 0, 0, this.drawPanel.Width, this.drawPanel.Height);
//				e.Graphics.Flush();

				this.bmp = new Bitmap(this.drawPanel.Width, this.drawPanel.Height);
				Graphics g = Graphics.FromImage(this.bmp);
				g.FillRectangle(Brushes.White, 0, 0, this.drawPanel.Width, this.drawPanel.Height);
				this.DrawKarfiol01(g, new PointF(300, 500), this.maxWeight, this.alpha, this.alphaDecreaseRate, this.beta, this.a, this.b, this.depthscale, 0, this.maxdepth);
				e.Graphics.DrawImageUnscaled(this.bmp, 0, 0, this.drawPanel.Width, this.drawPanel.Height);
			}
			catch(Exception ex)
			{
				Debug.WriteLine(ex.Message);
			}
		}

		
		#region Basic Draw Functions
		
		public void DrawCircle(Bitmap bmp, PointF center, float radius, float step)
		{
			float x = 0, y1 = 0, y2 = 0;
			for(x = -radius; x < radius; x+=step)
			{
				y1 = (float) Math.Sqrt((double)(radius*radius - x*x));
				y2 = -y1;

				int px = (int) Math.Round(x + center.X);
				int py1 = (int) Math.Round(y1 + center.Y);
				int py2 = (int) Math.Round(y2 + center.Y);

				if(px < 0 || px >= this.drawPanel.Width)
					continue;
				
				if(py1 < 0 || py1 >= this.drawPanel.Height)
					continue;

				if(py2 < 0 || py2 >= this.drawPanel.Height)
					continue;

				bmp.SetPixel(px, py1, Color.Red);
				bmp.SetPixel(px, py2, Color.Red);
			}
		}
		
		
		public void DrawSine(Bitmap bmp, PointF offset, float phase, float amplitude, float frequency, float step)
		{
			float x = 0, y = 0;
			float maxx = (float) this.drawPanel.Width;
			for(x = 0; x < maxx; x+=step)
			{
				y = (float)Math.Sin((float)((x - phase)*frequency))*amplitude;

				int px = (int) Math.Round(x + offset.X);
				int py = (int) Math.Round(y + offset.Y);

				if(px < 0 || px >= this.drawPanel.Width)
					continue;
				
				if(py < 0 || py >= this.drawPanel.Height)
					continue;

				bmp.SetPixel(px, py, Color.Blue);
			}
		}


		#endregion

		#region Draw Karfiol 01

		public void DrawKarfiol01(Graphics g, PointF root, float maxWeight1, float alpha1, float alphaDecreaseRate1, float beta1, float a1, float b1, float depthscale1, float depth, float maxdepth)
		{
			if(depth >= maxdepth)
				return;

			//	import noise
			float maxWeight = (float)(maxWeight1 + this.RNDmaxWeight * random.NextDouble());
			float alpha = (float)(alpha1 + this.RNDalpha * random.NextDouble());
			float alphaDecreaseRate = (float)(alphaDecreaseRate1 + this.RNDalphaDecreaseRate * random.NextDouble());
			float beta = (float)(beta1 + this.RNDbeta * random.NextDouble());
			float a = (float)(a1 + this.RNDa * random.NextDouble());
			float b = (float)(b1 + this.RNDb * random.NextDouble());
			float depthscale = (float)(depthscale1 + this.RNDdepthscale * random.NextDouble());

			float gamma = 0;
			float m = 0;
			float n = 0;
			float x1 = 0;
			float y1 = 0;

			//	calculate line A
			gamma = (float)((Math.PI - alpha) / 2);
			m = - (float)(Math.Tan(gamma));
			n = (float)(root.Y + root.X * Math.Tan(gamma));
			x1 = (float)((a / Math.Sqrt(m*m + 1)) + root.X);
			y1 = m*x1 + n;
			PointF lineAEndpoint = new PointF(x1, y1);

			//	calculate line B
			gamma = (float)((Math.PI + alpha) / 2);
			m = - (float)(Math.Tan(gamma));
			n = (float)(root.Y + root.X * Math.Tan(gamma));
			x1 = (float)((- b / Math.Sqrt(m*m + 1)) + root.X);
			y1 = m*x1 + n;
			PointF lineBEndpoint = new PointF(x1, y1);

			Pen p = null;

			//	recurse
			this.DrawKarfiol01(g, lineAEndpoint, maxWeight1, alpha1 - alpha1 / alphaDecreaseRate + beta, alphaDecreaseRate1, beta1, a1 * depthscale, b1 * depthscale, depthscale1, ++depth, maxdepth);
			this.DrawKarfiol01(g, lineBEndpoint, maxWeight1, alpha1 - alpha1 / alphaDecreaseRate + beta, alphaDecreaseRate1, beta1, a1 * depthscale, b1 * depthscale, depthscale1, ++depth, maxdepth);

			if(depth >= maxdepth)
				return;

			//	draw lines
			p = new Pen(this.GetColor(depth, maxdepth, a, this.a), (float)Math.Round((maxdepth - depth)*maxWeight/maxdepth));
			g.DrawLine(p, root, lineAEndpoint);
			p = new Pen(this.GetColor(depth, maxdepth, b, this.b), (float)Math.Round((maxdepth - depth)*maxWeight/maxdepth));
			g.DrawLine(p, root, lineBEndpoint);
		}

		
		public Color GetColor(float depth, float maxdepth, float length, float maxlength)
		{
			int red = (int) Math.Round(255 * length / maxlength);
			int green = (int) Math.Round(255 * depth / maxdepth);

			if(red > 255)
				red = 255;
			
			if(green > 255)
				green = 255;

			int blue = (int) Math.Round((float)(red/4 + green/4));

			return Color.FromArgb(red, green, blue);
		}

		
		private void vScrollBar1_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar2_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar3_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar4_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar5_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar6_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar7_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		
		private void vScrollBar14_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar11_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar8_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar12_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar10_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar9_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		private void vScrollBar13_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		
		private void hScrollBar1_Scroll(object sender, System.Windows.Forms.ScrollEventArgs e)
		{
			this.ReadScrollValues();
		}

		
		public void ReadScrollValues()
		{
			this.depthscale = (float)((float)vScrollBar1.Value / 50f);
			this.alpha = (float)Math.PI*((float)vScrollBar2.Value / 100f);
			this.beta = (float)Math.PI/32*((float)(vScrollBar3.Value - 50) / 50f);
			this.a = (float)(vScrollBar4.Value);
			this.b = (float)(vScrollBar5.Value);
			this.alphaDecreaseRate = (float)(vScrollBar6.Value - 50);
			this.maxWeight = (float)(vScrollBar7.Value / 5);

			this.RNDmaxWeight = (float)(vScrollBar14.Value / 5);
			this.RNDdepthscale = (float)((vScrollBar11.Value - 50) / 100f);
			this.RNDalpha = (float)(Math.PI * (vScrollBar8.Value - 50) / 100);
			this.RNDalphaDecreaseRate = (float)((vScrollBar12.Value - 50) / 1);
			this.RNDbeta = (float)(Math.PI * (vScrollBar10.Value - 50) / 150);
			this.RNDa = (float)(vScrollBar9.Value);
			this.RNDb = (float)(vScrollBar13.Value);
			
			this.maxdepth = (float)(hScrollBar1.Value);

			this.drawPanel.Refresh();
		}


		float depthscale = 0.1f;
		float alpha = (float)(Math.PI / 2);
		float alphaDecreaseRate = 32;
		float beta = (float)(Math.PI / 32);
		float a = 30;
		float b = 50;
		float maxWeight = 1;
		float maxdepth = 15;

		float RNDdepthscale = 0;
		float RNDalpha = 0;
		float RNDalphaDecreaseRate = 0;
		float RNDbeta = 0;
		float RNDa = 0;
		float RNDb = 0;
		float RNDmaxWeight = 0;
		
		Random random = new Random(unchecked((int)DateTime.Now.Ticks));
		Bitmap bmp = null;

		#endregion

		protected override void OnLoad(EventArgs e)
		{
			base.OnLoad (e);

			this.vScrollBar1.Value = 45;
			this.vScrollBar2.Value = 30;
			this.vScrollBar3.Value = 32;
			this.vScrollBar4.Value = 30;
			this.vScrollBar5.Value = 50;
			this.vScrollBar6.Value = 32;
			this.vScrollBar7.Value = 10;

			this.vScrollBar8.Value = 50;
			this.vScrollBar10.Value = 50;
			this.vScrollBar11.Value = 50;
			this.vScrollBar12.Value = 50;

			this.hScrollBar1.Value = 15;

			this.ReadScrollValues();
		}

		
		private void button1_Click(object sender, System.EventArgs e)
		{
			lock(this)
			{
				this.bmp.Save("c:\\" + Guid.NewGuid().ToString() + ".bmp");
			}
		}
	}
}
