"use strict";

include("StdAfx.js");

class TwoGraphicsDevice
{
	constructor(two)
	{
		this._two = two;

		this._sceneToDevice = null;
	}


	addCircleFigure(def, clippingRectanglePrimititve)
	{
		var x = def.x;
		var y = def.y;
		var size = def.size;
		var zIndex = def.zIndex || def.source.zIndex;
		var fill = def.style.fill;
		var lineStyle = def.lineStyle;
		var opacity = def.opacity;

		var p = new Two.Ellipse(
			x,
			this._sceneToDevice(y),
			size,
			size
		);
		p.zIndex = zIndex;
		if (fill)
		{
			p.fill = fill;
		}
		else
		{
			p.noFill();
		}
		if (lineStyle)
		{
			p.stroke = lineStyle.color;
			p.strokeStyle = lineStyle.strokeStyle;
			p.linewidth = lineStyle.width;
		}
		else
		{
			p.noStroke();
		}
		if (opacity != void (0)) p.opacity = opacity;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}

	addTriangleFigure(def, clippingRectanglePrimititve)
	{
		var x = def.x;
		var y = def.y;
		var size = def.size;
		var zIndex = def.zIndex || def.source.zIndex;
		var fill = def.style.fill;
		var lineStyle = def.lineStyle;
		var opacity = def.opacity;

		var p = new Two.Polygon(
			x,
			this._sceneToDevice(y),
			size
		);
		p.zIndex = zIndex;
		if (fill)
		{
			p.fill = fill;
		}
		else
		{
			p.noFill();
		}
		if (lineStyle)
		{
			p.stroke = lineStyle.color;
			p.strokeStyle = lineStyle.strokeStyle;
			p.linewidth = lineStyle.width;
		}
		else
		{
			p.noStroke();
		}
		if (opacity != void (0)) p.opacity = opacity;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}


	addRectangle(def, clippingRectanglePrimititve)
	{
		var x = def.x;
		var y = def.y;
		var width = def.width;
		var height = def.height;
		var zIndex = def.zIndex || def.source.zIndex;
		var fill = def.style.fill;
		var lineStyle = def.lineStyle;
		var opacity = def.opacity;

		var p = new Two.Rectangle(
			x + width / 2,
			this._sceneToDevice(y + height / 2),
			width,
			height
		);
		p.zIndex = zIndex;
		p.fill = fill;
		if (lineStyle)
		{
			p.stroke = lineStyle.color;
			p.linewidth = lineStyle.width;
		}
		else
		{
			p.noStroke();
		}
		if (opacity != void (0)) p.opacity = opacity;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}

	addClippingRectangle(def)
	{
		var x = def.x;
		var y = def.y;
		var width = def.width;
		var height = def.height;

		var p = new Two.Rectangle(
			x + width / 2,
			this._sceneToDevice(y + height / 2),
			width,
			height
		);

		this._two.scene.add(p);

		return p;
	}

	addLine(def, clippingRectanglePrimititve)
	{
		var x = def.x;
		var y = def.y;
		var width = def.width;
		var height = def.height;
		var zIndex = def.source.zIndex;
		var lineStyle = def.lineStyle;

		var p = new Two.Line(
			x,
			this._sceneToDevice(y),
			x + width,
			this._sceneToDevice(y + height)
		);
		p.stroke = lineStyle.color;
		p.strokeStyle = lineStyle.strokeStyle;
		p.linewidth = lineStyle.width;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}

	addLinePath(def, clippingRectanglePrimititve)
	{
		var vertices = def.vertices;
		var zIndex = def.source.zIndex;
		var lineStyle = def.lineStyle;

		var startPoint = vertices[0];
		var deviceX = startPoint.sceneX;
		var deviceY = this._sceneToDevice(startPoint.sceneY);
		var anchors =
		[
			new Two.Anchor(
				deviceX, deviceY,
				deviceX, deviceY,
				deviceX, deviceY,
				Two.Commands.move
			)
		];
		for (var length = vertices.length, i = 1; i < length; ++i)
		{
			var item = vertices[i];
			deviceX = item.sceneX;
			deviceY = this._sceneToDevice(item.sceneY);
			anchors.push(new Two.Anchor(
				deviceX, deviceY,
				deviceX, deviceY,
				deviceX, deviceY,
				Two.Commands.line
			));
		}
		var p = new Two.Path(anchors);
		p.noFill();
		p.stroke = lineStyle.color;
		p.strokeStyle = lineStyle.strokeStyle;
		p.linewidth = lineStyle.width;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}

	addArea(def, clippingRectanglePrimititve)
	{
		var vertices = def.vertices;
		var zIndex = def.source.zIndex;
		var fill = def.style.fill;
		var opacity = def.opacity;

		var startPoint = vertices[0];
		var deviceX = startPoint.sceneX;
		var deviceY = this._sceneToDevice(startPoint.sceneY);
		var anchors =
		[
			new Two.Anchor(
				deviceX, deviceY,
				deviceX, deviceY,
				deviceX, deviceY,
				Two.Commands.move
			)
		];
		for (var length = vertices.length, i = 1; i < length; ++i)
		{
			var item = vertices[i];
			deviceX = item.sceneX;
			deviceY = this._sceneToDevice(item.sceneY);
			anchors.push(new Two.Anchor(
				deviceX, deviceY,
				deviceX, deviceY,
				deviceX, deviceY,
				Two.Commands.line
			));
		}
		var p = new Two.Path(anchors);
		p.fill = fill;
		p.noStroke();
		if (opacity != void (0)) p.opacity = opacity;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}

	addText(def, clippingRectanglePrimititve)
	{
		var text = def.text;
		var x = def.x;
		var y = def.y;
		var width = def.width;
		var height = def.height;
		var font = def.font;
		var zIndex = def.source.zIndex;
		var hAlign = def.hAlign || EChartHAlign.Center;
		var vAlign = def.vAlign || EChartVAlign.Middle;
		var opacity = def.opacity;

		var anchorX;
		var anchorY;

		switch (hAlign)
		{
			case EChartHAlign.Left:
				anchorX = x + width / 2;
				break;
			case EChartHAlign.Center:
				anchorX = x;
				break;
			case EChartHAlign.Right:
				anchorX = x - width / 2;
				break;
			default:
				throw "Not implemented.";
		}

		switch (vAlign)
		{
			case EChartVAlign.Top:
				anchorY = y + height / 2;
				break;
			case EChartVAlign.Middle:
				anchorY = y;
				break;
			case EChartVAlign.Bottom:
				anchorY = y - height / 2;
				break;
			default:
				throw "Not implemented.";
		}

		var p = new Two.Text(
			text,
			anchorX,
			this._sceneToDevice(anchorY),
			font
		);
		p.zIndex = zIndex;
		if (opacity != void (0)) p.opacity = opacity;

		return this._addPrimitive(zIndex, p, clippingRectanglePrimititve);
	}

	addSpreadLine(def, clippingRectanglePrimititve)
	{
		var x = def.x;
		var y = def.y;
		var width = def.width;
		var height = def.height;
		var zIndex = def.zIndex || def.source.zIndex;
		var fill = def.style.fill;
		var lineStyle = def.lineStyle;
		var opacity = def.opacity;
		var rotation = def.rotation;

		//	the line
		var g = new Two.Group();
		g.rotation = rotation;
//		g.rotation = Math.PI * 0.05;
		g.translation.set(x, this._sceneToDevice(y));

		var p = new Two.Line(
			0,
			0,
			0,
			this._sceneToDevice(height) - this._sceneToDevice(0)
		);
		p.stroke = lineStyle.color;
		p.strokeStyle = lineStyle.strokeStyle;
		p.linewidth = lineStyle.width;
		p.zIndex = 1;
		g.add(p);

		//	the rectangle
		var p = new Two.Rectangle(
			0,
			this._sceneToDevice(height / 2) - this._sceneToDevice(0),
			width,
			this._sceneToDevice(height) - this._sceneToDevice(0)
		);
		p.zIndex = 2;
		p.fill = fill;
		p.noStroke();
		if (opacity != void (0)) p.opacity = opacity;
		g.add(p);

		if (clippingRectanglePrimititve)
		{
			var gg = new Two.Group();
			gg.zIndex = zIndex;
			gg.mask = clippingRectanglePrimititve;
			gg.add(g);
			this._two.scene.add(gg);
			return gg;
		}

		this._two.scene.add(g);
		g.zIndex = zIndex;
		return g;
	}


	setSceneToDevice(value)
	{
		return this._sceneToDevice = value;
	}


	_addPrimitive(zIndex, primitive, clippingRectanglePrimititve)
	{
		if (clippingRectanglePrimititve)
		{
			var g = new Two.Group();
			g.zIndex = zIndex;
			g.mask = clippingRectanglePrimititve;
			g.add(primitive);
			this._two.scene.add(g);
			return g;
		}

		primitive.zIndex = zIndex;
		this._two.scene.add(primitive);
		return primitive;
	}

	get two()
	{
		return this._two;
	}
}
