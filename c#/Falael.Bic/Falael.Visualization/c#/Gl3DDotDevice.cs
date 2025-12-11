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
using MathNet.Numerics.LinearAlgebra;

namespace Falael.Visualization
{
    public class Gl3DDotDevice
	{
		#region Constructors
		public Gl3DDotDevice(Size size, float scale)
		{
			this.size = size;
			this.scale = scale;

			this.UpdateViewport();
            this.UpdateModelview();
        }

		public Gl3DDotDevice()
		{
			this.size = new Size { Width = 100, Height = 100 };
			this.scale = 0.01f;
		}
		#endregion

		#region Nested types
		public struct Size3D
		{
			public int Width;
			public int Height;
			public int Depth;
		}
		public struct SizeF3D
		{
			public float Width;
			public float Height;
			public float Depth;
		}
		public struct PointF3D
		{
			public float X;
			public float Y;
			public float Z;
		}
		public struct LineF3D
		{
			public float X1;
			public float Y1;
			public float Z1;
			public float X2;
			public float Y2;
			public float Z2;
		}
		public struct QuadrilateralF3D
		{
			public float X1;
			public float Y1;
			public float Z1;

			public float X2;
			public float Y2;
			public float Z2;

			public float X3;
			public float Y3;
			public float Z3;

			public float X4;
			public float Y4;
			public float Z4;
		}
		#endregion

		#region Operations
		public void Clear()
		{
			Gl.Clear(ClearBufferMask.ColorBufferBit | ClearBufferMask.DepthBufferBit);
		}
		public void DrawDemoPyramids()
		{
			this.Clear();

			Gl.MatrixMode(MatrixMode.Modelview);
			Gl.LoadIdentity();
			Gl.Translate(0f, 0f, -1f);
			Gl.Scale(0.02f, 0.02f, 0.02f);
			Gl.Rotate(45f, 1f, 1f, 1f);

			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			for(int x = -20; x <= 20; x += 8)
				for (int y = -20; y <= 20; y += 8)
					for (int z = -20; z <= 20; z += 8)
					{
						vertexList.Add(new Vertex3f( 0 + x,  1 + y,  0 + z)); colorList.Add(new ColorRGBA32(Color.Red.R, Color.Red.G, Color.Red.B, Color.Red.A));
						vertexList.Add(new Vertex3f(-1 + x, -1 + y, -1 + z)); colorList.Add(new ColorRGBA32(Color.Green.R, Color.Green.G, Color.Green.B, Color.Green.A));
						vertexList.Add(new Vertex3f( 1 + x, -1 + y, -1 + z)); colorList.Add(new ColorRGBA32(Color.Blue.R, Color.Blue.G, Color.Blue.B, Color.Blue.A));

						vertexList.Add(new Vertex3f( 0 + x,  1 + y,  0 + z)); colorList.Add(new ColorRGBA32(Color.Red.R, Color.Red.G, Color.Red.B, Color.Red.A));
						vertexList.Add(new Vertex3f( 0 + x, -1 + y,  1 + z)); colorList.Add(new ColorRGBA32(Color.Magenta.R, Color.Magenta.G, Color.Magenta.B, Color.Magenta.A));
						vertexList.Add(new Vertex3f(-1 + x, -1 + y, -1 + z)); colorList.Add(new ColorRGBA32(Color.Green.R, Color.Green.G, Color.Green.B, Color.Green.A));

						vertexList.Add(new Vertex3f( 0 + x,  1 + y,  0 + z)); colorList.Add(new ColorRGBA32(Color.Red.R, Color.Red.G, Color.Red.B, Color.Red.A));
						vertexList.Add(new Vertex3f( 1 + x, -1 + y, -1 + z)); colorList.Add(new ColorRGBA32(Color.Blue.R, Color.Blue.G, Color.Blue.B, Color.Blue.A));
						vertexList.Add(new Vertex3f( 0 + x, -1 + y,  1 + z)); colorList.Add(new ColorRGBA32(Color.Magenta.R, Color.Magenta.G, Color.Magenta.B, Color.Magenta.A));

						vertexList.Add(new Vertex3f( 0 + x, -1 + y,  1 + z)); colorList.Add(new ColorRGBA32(Color.Magenta.R, Color.Magenta.G, Color.Magenta.B, Color.Magenta.A));
						vertexList.Add(new Vertex3f(-1 + x, -1 + y, -1 + z)); colorList.Add(new ColorRGBA32(Color.Green.R, Color.Green.G, Color.Green.B, Color.Green.A));
						vertexList.Add(new Vertex3f( 1 + x, -1 + y, -1 + z)); colorList.Add(new ColorRGBA32(Color.Blue.R, Color.Blue.G, Color.Blue.B, Color.Blue.A));
					}

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Triangles, 0, vertexArray.Length);
			}
		}
		public void DrawDot(PointF3D point, Color color)
		{
			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			vertexList.Add(new Vertex3f(point.X, point.Y, point.Z)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Points, 0, vertexArray.Length);
			}
		}
		public void DrawDots(PointF3D[] points, Color color)
		{
			if(points == null)
			{
				return;
			}

			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			for (int length = points.Length, i = 0; i < length; ++i)
			{
				PointF3D point = points[i];
				vertexList.Add(new Vertex3f(point.X, point.Y, point.Z)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
			}

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Points, 0, vertexArray.Length);
			}
		}
		public void DrawDots(PointF3D[] points, Color[] colors)
		{
			if (points == null)
			{
				return;
			}
			if (colors == null)
			{
				return;
			}
			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			for (int length = points.Length, i = 0; i < length; ++i)
			{
				PointF3D point = points[i];
                Color color = colors[i];
                vertexList.Add(new Vertex3f(point.X, point.Y, point.Z)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
            }

            var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Points, 0, vertexArray.Length);
			}
		}
		public void DrawLine(LineF3D line, Color color)
		{
			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			vertexList.Add(new Vertex3f(line.X1, line.Y1, line.Z1)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
			vertexList.Add(new Vertex3f(line.X2, line.Y2, line.Z2)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Lines, 0, vertexArray.Length);
			}
		}
		public void DrawLines(LineF3D[] lines, Color color)
		{
			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			for (int length = lines.Length, i = 0; i < length; ++i)
			{
				LineF3D line = lines[i];
				vertexList.Add(new Vertex3f(line.X1, line.Y1, line.Z1)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
				vertexList.Add(new Vertex3f(line.X2, line.Y2, line.Z2)); colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
			}

			var vertexArray = vertexList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.DrawArrays(PrimitiveType.Lines, 0, vertexArray.Length);
			}
		}
		public void DrawQuadrilateral(QuadrilateralF3D quadrilateral, Color color)
		{
			List<Vertex3f> vertexList = new List<Vertex3f>();
			List<int> firstList = new List<int>();
			List<int> countList = new List<int>();
			List<ColorRGBA32> colorList = new List<ColorRGBA32>();

			firstList.Add(0);
			countList.Add(4);
			vertexList.Add(new Vertex3f(quadrilateral.X1, quadrilateral.Y1, quadrilateral.Z1));
			vertexList.Add(new Vertex3f(quadrilateral.X2, quadrilateral.Y2, quadrilateral.Z2));
			vertexList.Add(new Vertex3f(quadrilateral.X3, quadrilateral.Y3, quadrilateral.Z3));
			vertexList.Add(new Vertex3f(quadrilateral.X4, quadrilateral.Y4, quadrilateral.Z4));

			for (int length = 8, i = 0; i < length; ++i)
			{
				colorList.Add(new ColorRGBA32(color.R, color.G, color.B, color.A));
			}

			var vertexArray = vertexList.ToArray();
			var firstArray = firstList.ToArray();
			var countArray = countList.ToArray();
			var colorArray = colorList.ToArray();
			using (MemoryLock vertexArrayLock = new MemoryLock(vertexArray))
			using (MemoryLock vertexColorLock = new MemoryLock(colorArray))
			{
				Gl.VertexPointer(3, VertexPointerType.Float, 0, vertexArrayLock.Address);
				Gl.EnableClientState(EnableCap.VertexArray);

				Gl.ColorPointer(4, ColorPointerType.UnsignedByte, 0, vertexColorLock.Address);
				Gl.EnableClientState(EnableCap.ColorArray);

				Gl.MultiDrawArrays(PrimitiveType.Polygon, firstArray, countArray, firstArray.Length);
			}
		}
		public PointF3D? Unproject(float x, float y, float z)
		{
			//	http://gamedev.stackexchange.com/questions/8974/how-can-i-convert-a-mouse-click-to-a-ray

			float[] pjmatrix2_data = new float[16];
			Gl.Get(Gl.PROJECTION_MATRIX, pjmatrix2_data);
			Matrix<float> pjm2 = Matrix<float>.Build.DenseOfColumnMajor(4, 4, pjmatrix2_data);

			float[] mvmatrix2_data = new float[16];
			Gl.Get(Gl.MODELVIEW_MATRIX, mvmatrix2_data);
			Matrix<float> mvm2 = Matrix<float>.Build.DenseOfColumnMajor(4, 4, mvmatrix2_data);

			Matrix<float> m2 = (pjm2 * mvm2).Inverse();
			Matrix<float> v2 = Matrix<float>.Build.DenseOfColumnMajor(4, 1, new float[]
			{
				(x - 0) / (float)this.size.Width * 2.0f - 1.0f,
				((float)this.size.Height - y - 0) / (float)this.size.Height * 2.0f - 1.0f,
				2.0f * z - 1.0f,
				1.0f });
			Matrix<float> r2 = m2 * v2;

			if (!WithinEpsilon(r2[3, 0], 0f))
			{
				// Invert to normalize x, y, and z values.
				r2[3, 0] = 1.0f / r2[3, 0];

				PointF3D result;
				result.X = r2[0, 0] * r2[3, 0];
				result.Y = r2[1, 0] * r2[3, 0];
				result.Z = r2[2, 0] * r2[3, 0];
				return result;
			}

			return null;
		}
		#endregion

		#region Inheritable methods
		protected void UpdateModelview()
		{
			//https://gist.github.com/sixman9/871099

			float aspect = (float)this.size.Height / (float)this.size.Width;
            Gl.MatrixMode(MatrixMode.Projection);

			//Gl.LoadIdentity();
			float fieldOfView = 45;
			float zNear = 0.01f;
			float zFar = 1000.0f;
			//float fH = (float)Math.Tan(fieldOfView * 3.14159f / 360.0f) * zNear;
			//float fW = fH * aspect;
			//Gl.Frustum(-fW, fW, -fH, fH, zNear, zFar);

			PerspectiveProjectionMatrix pjmatrix = new PerspectiveProjectionMatrix(fieldOfView, aspect, zNear, zFar);
			Gl.LoadMatrix(pjmatrix.ToArray());


			Gl.MatrixMode(MatrixMode.Modelview);
            Gl.LoadIdentity();

            Gl.Translate(0f, -0f, -1f);
            Gl.Rotate(this.rotation.Width, 0f, -1f, 0f);
            Gl.Rotate(this.rotation.Height, -1f, 0f, 0f);

			Gl.Scale(this.scale, this.scale, this.scale);
			Gl.Translate(this.pan.Width * 100, this.pan.Height * 100, this.pan.Depth * 100);
		}
		protected void UpdateViewport()
        {
			//	https://www.ntu.edu.sg/home/ehchua/programming/opengl/CG_Examples.html

			//	init gl
			Gl.BlendFunc(BlendingFactorSrc.SrcAlpha, BlendingFactorDest.OneMinusDstAlpha);
			Gl.Enable(EnableCap.Blend);
			Gl.ClearColor(0.0f, 0.0f, 0.0f, 1.0f);
			Gl.ClearDepth(10.0f);
			Gl.Enable(EnableCap.DepthTest);
			Gl.DepthFunc(DepthFunction.Less);
			Gl.ShadeModel(ShadingModel.Smooth);
			Gl.Hint(HintTarget.PerspectiveCorrectionHint, HintMode.Nicest);

			//	reshape
			float aspect = (float)this.size.Height / (float)this.size.Width;
			Gl.Viewport(0, 0, this.size.Width, this.size.Height);
        }
		#endregion

		#region Static methods
		private static bool WithinEpsilon(float a, float b)
		{
			float num = a - b;
			return ((-1.401298E-45f <= num) && (num <= float.Epsilon));
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
                this.UpdateModelview();
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
                this.UpdateModelview();
                System.Diagnostics.Debug.WriteLine(this.scale);
            }
        }

        public SizeF Rotation
        {
            get
            {
                return this.rotation;
            }
            set
            {
                this.rotation = value;
                this.UpdateViewport();
                this.UpdateModelview();
            }
        }

		public SizeF3D Pan
		{
			get
			{
				return this.pan;
			}
			set
			{
				this.pan = value;
				this.UpdateViewport();
				this.UpdateModelview();
			}
		}
		#endregion

		#region Fields
		Size size;
        float scale = 0.01f;
        SizeF rotation = new SizeF(15f, 80f);
		SizeF3D pan = new SizeF3D { Width = 0f, Height = 0f, Depth = 0f };
        #endregion
    }
}
