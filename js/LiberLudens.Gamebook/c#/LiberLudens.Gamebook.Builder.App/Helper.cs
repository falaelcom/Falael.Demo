using System;
using System.Drawing;
using System.Collections.Generic;
using System.Text;

using Dataweb.NShape;
using Dataweb.NShape.Advanced;

namespace LiberLudens.Gamebook.Builder.App
{
    public static class Helper
    {
        public static string GetShapeText(Shape shape)
        {
            if (shape is CaptionedShapeBase)
            {
                CaptionedShapeBase captionedShape = (CaptionedShapeBase)shape;
                return captionedShape.Text;
            }
            else
            {
                return (shape.Tag == null ? string.Empty : shape.Tag.ToString());
            }
        }

        public static void SetShapeText(Shape shape, string text)
        {
            if (shape is CaptionedShapeBase)
            {
                CaptionedShapeBase captionedShape = (CaptionedShapeBase)shape;
                captionedShape.Text = text;
            }
            else
            {
                shape.Tag = text;
            }
        }

        public static string GetShapeId(Shape shape)
        {
            IEntity entity = (IEntity)shape;
            if(entity.Id == null)
            {
                return null;
            }
            return entity.Id.ToString();
        }

        public static Point[] GetLinearShapePoints(LineShapeBase shape)
        {
            List<Point> result = new List<Point>();
            foreach (ControlPointId pointId in shape.GetControlPointIds(ControlPointCapabilities.All))
            {
                var point = shape.GetControlPointPosition(pointId);
                result.Add(point);
            }
            return result.ToArray();
        }

        public static Rectangle[] GetLinearShapeSegments(LineShapeBase shape)
        {
            List<Rectangle> result = new List<Rectangle>();
            var points = GetLinearShapePoints(shape);
            Point prevPoint = points[0];
            for (int length = points.Length, i = 1; i < length; ++i)
            {
                var item = points[i];
                result.Add(new Rectangle(
                    Math.Min(prevPoint.X, item.X),
                    Math.Min(prevPoint.Y, item.Y),
                    Math.Abs(item.X - prevPoint.X),
                    Math.Abs(item.Y - prevPoint.Y)
                ));
                prevPoint = item;
            }
            return result.ToArray();
        }
    }
}
