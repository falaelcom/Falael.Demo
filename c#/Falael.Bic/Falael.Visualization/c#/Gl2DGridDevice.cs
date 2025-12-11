// R1Q2/daniel
//  - lacks documentation
//  - architecture
using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using OpenGL;

namespace Falael.Visualization
{
    public class Gl2DGridDevice
	{
		#region Constructors
		public Gl2DGridDevice(Size size, float scale, float cellMargin)
		{
			this.size = size;
			this.scale = scale;
			this.cellMargin = cellMargin;

			this.UpdateViewport();
		}

		public Gl2DGridDevice(Size size, float scale)
			: this(size, scale, 0)
		{
		}

		public Gl2DGridDevice()
		{
			this.size = new Size(100, 100);
			this.scale = 0.01f;
			this.cellMargin = 0;
		}
		#endregion

		#region Operations
		public void Clear()
		{
			Gl.Clear(ClearBufferMask.ColorBufferBit);
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

			List<Vertex2f> vertexList = new List<Vertex2f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			float offset = 0.5f - this.cellMargin;

			vertexList.Add(new Vertex2f(point.X - offset, point.Y - offset));       //  bl
			vertexList.Add(new Vertex2f(point.X - offset, point.Y + offset));       //  tl
			vertexList.Add(new Vertex2f(point.X + offset, point.Y + offset));       //  tr

			vertexList.Add(new Vertex2f(point.X - offset, point.Y - offset));       //  bl
			vertexList.Add(new Vertex2f(point.X + offset, point.Y - offset));       //  br
			vertexList.Add(new Vertex2f(point.X + offset, point.Y + offset));       //  tr

			for(int length = 6, i = 0; i < length; ++i)
			{
				colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
			}

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(2, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Triangles, 0, vertexArray.Length);
			}
		}
		public void DrawCells(PointF[] points, Color color)
		{
			int maxGridX = (int)Math.Ceiling(this.gridSize.Width / 2f);
			int minGridX = -maxGridX;
			int maxGridY = (int)Math.Ceiling(this.gridSize.Height / 2f);
			int minGridY = -maxGridY;

			List<Vertex2f> vertexList = new List<Vertex2f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

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

				vertexList.Add(new Vertex2f(point.X - offset, point.Y - offset));       //  bl
				vertexList.Add(new Vertex2f(point.X - offset, point.Y + offset));       //  tl
				vertexList.Add(new Vertex2f(point.X + offset, point.Y + offset));       //  tr

				vertexList.Add(new Vertex2f(point.X - offset, point.Y - offset));       //  bl
				vertexList.Add(new Vertex2f(point.X + offset, point.Y - offset));       //  br
				vertexList.Add(new Vertex2f(point.X + offset, point.Y + offset));       //  tr

				for (int jlength = 6, j = 0; j < jlength; ++j)
				{
					colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
				}
			}

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(2, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Triangles, 0, vertexArray.Length);
			}
		}
		public void DrawCells(PointF[] points, Color[] colors)
		{
			int maxGridX = (int)Math.Ceiling(this.gridSize.Width / 2f);
			int minGridX = -maxGridX;
			int maxGridY = (int)Math.Ceiling(this.gridSize.Height / 2f);
			int minGridY = -maxGridY;

			List<Vertex2f> vertexList = new List<Vertex2f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

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

				vertexList.Add(new Vertex2f(point.X - offset, point.Y - offset));       //  bl
				vertexList.Add(new Vertex2f(point.X - offset, point.Y + offset));       //  tl
				vertexList.Add(new Vertex2f(point.X + offset, point.Y + offset));       //  tr

				vertexList.Add(new Vertex2f(point.X - offset, point.Y - offset));       //  bl
				vertexList.Add(new Vertex2f(point.X + offset, point.Y - offset));       //  br
				vertexList.Add(new Vertex2f(point.X + offset, point.Y + offset));       //  tr

				Color color = colors[i];
				for (int jlength = 6, j = 0; j < jlength; ++j)
				{
					colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
				}
			}

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(2, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Triangles, 0, vertexArray.Length);
			}
		}
		#endregion

		#region Inheritable methods
		protected void UpdateViewport()
        {
            Gl.Viewport(0, 0, this.size.Width, this.size.Height);
            Gl.MatrixMode(MatrixMode.Projection);
            Gl.LoadIdentity();
            Gl.Scale(this.scale, this.scale, 1f);

            //  http://stackoverflow.com/questions/9071814/opengl-stretched-shapes-aspect-ratio
            float aspect = (float)this.size.Height / (float)this.size.Width;
            //  http://stackoverflow.com/questions/4338729/preserve-aspect-ratio-of-2d-object-on-window-resize
            Gl.Ortho(-1, 1, (double)-aspect, (double)aspect, 0, 1);

            this.gridSize.Width = (int)Math.Ceiling(2 / this.scale);
            this.gridSize.Height = (int)Math.Ceiling(2 * aspect / this.scale);
        }
        #endregion

        #region Properties
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
		Size size;
        float scale = 0.01f;
		float cellMargin = 0;

		Size gridSize;
        #endregion
    }
}
