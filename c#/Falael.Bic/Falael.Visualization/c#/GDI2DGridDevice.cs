// R1Q2/daniel
//  - lacks documentation
//  - architecture
using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Visualization
{
    public class GDI2DGridDevice
    {
		#region Constructors
		public GDI2DGridDevice(Graphics graphics, Size size, float scale, float cellMargin)
		{
            this.graphics = graphics;
            this.size = size;
			this.scale = scale;
			this.cellMargin = cellMargin;

			this.UpdateViewport();
		}

		public GDI2DGridDevice(Graphics graphics, Size size, float scale)
			: this(graphics, size, scale, 0)
		{
		}

		public GDI2DGridDevice(Graphics graphics)
		{
            this.graphics = graphics;
            this.size = new Size(100, 100);
			this.scale = 0.01f;
			this.cellMargin = 0;

			this.UpdateViewport();
		}
		#endregion

		#region Operations
		public void Clear()
		{
            this.graphics.Clear(Color.Black);
		}
		public void DrawCell(PointF point, Color color)
		{
			int maxGridX = (int)Math.Ceiling(this.gridSize.Width / 2f);
			int minGridX = -maxGridX;
			int maxGridY = (int)Math.Ceiling(this.gridSize.Height / 2f);
			int minGridY = -maxGridY;

			if (point.X < minGridX)
			{
				return;
			}
			if (point.X > maxGridX)
			{
				return;
			}
			if (point.Y < minGridY)
			{
				return;
			}
			if (point.Y > maxGridY)
			{
				return;
			}

			float offset = 0.5f - this.cellMargin;

			this.graphics.FillRectangle(new SolidBrush(color), point.X - offset, point.Y - offset, 2 * offset, 2 * offset);
        }
		public void DrawCells(PointF[] points, Color color)
		{
			int maxGridX = (int)Math.Ceiling(this.gridSize.Width / 2f);
			int minGridX = -maxGridX;
			int maxGridY = (int)Math.Ceiling(this.gridSize.Height / 2f);
			int minGridY = -maxGridY;

			List<RectangleF> rectangles = new List<RectangleF>();

			for (int length = points.Length, i = 0; i < length; ++i)
			{
				PointF point = points[i];
				if (point.X < minGridX)
				{
					continue;
				}
				if (point.X > maxGridX)
				{
					continue;
				}
				if (point.Y < minGridY)
				{
					continue;
				}
				if (point.Y > maxGridY)
				{
					continue;
				}

				float offset = 0.5f - this.cellMargin;
                rectangles.Add(new RectangleF(point.X - offset, point.Y + offset, 2 * offset, 2 * offset));
			}

            this.graphics.FillRectangles(new SolidBrush(color), rectangles.ToArray());
        }
        public void DrawCells(PointF[] points, Color[] colors)
		{
            int maxGridX = (int)Math.Ceiling(this.gridSize.Width / 2f);
            int minGridX = -maxGridX;
            int maxGridY = (int)Math.Ceiling(this.gridSize.Height / 2f);
            int minGridY = -maxGridY;

            for (int length = points.Length, i = 0; i < length; ++i)
            {
                PointF point = points[i];
                if (point.X < minGridX)
                {
                    continue;
                }
                if (point.X > maxGridX)
                {
                    continue;
                }
                if (point.Y < minGridY)
                {
                    continue;
                }
                if (point.Y > maxGridY)
                {
                    continue;
                }

                float offset = 0.5f - this.cellMargin;
                this.graphics.FillRectangle(new SolidBrush(colors[i]), point.X - offset, point.Y + offset, 2 * offset, 2 * offset);
            }
        }
        #endregion

        #region Inheritable methods
        protected void UpdateViewport()
        {
            this.graphics.ResetTransform();
			this.graphics.TranslateTransform((float)this.size.Width / 2, (float)this.size.Height / 2);
			this.graphics.ScaleTransform(this.scale, this.scale);

            float aspect = (float)this.size.Height / (float)this.size.Width;

            this.gridSize.Width = (int)Math.Ceiling((float)this.size.Width / this.scale);
            this.gridSize.Height = (int)Math.Ceiling((float)this.size.Height * aspect / this.scale);
        }
        #endregion

        #region Properties
        public Graphics Graphics
        {
            get
            {
                return this.graphics;
            }
        }
        public Size Size
        {
            get
            {
                return this.size;
            }
            set
            {
                this.size = value;
                this.UpdateViewport();
            }
        }

        public float Scale
        {
            get
            {
                return this.scale;
            }
            set
            {
                this.scale = value;
                this.UpdateViewport();
            }
        }

		public Size GridSize
		{
			get
			{
				return this.gridSize;
			}
		}

		public float DotMargin
		{
			get
			{
				return this.cellMargin;
			}
			set
			{
				this.cellMargin = value;
			}
		}
        #endregion

        #region Fields
        Graphics graphics;

        Size size;
        float scale = 0.01f;
		float cellMargin = 0;

		Size gridSize;
        #endregion
    }
}
