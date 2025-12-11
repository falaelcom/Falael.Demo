"use strict";

include("StdAfx.js");

class ForexChannel
{
	constructor(supportLine, resistanceLine)
	{
		this._supportLine = supportLine;
		this._resistanceLine = resistanceLine;
	}


	hitTest(x, y)
	{
		var sy = this._supportLine.linedef.calc(x);
		var ry = this._resistanceLine.linedef.calc(x);
		var result =
		{
			isAboveSupportLine: y >= sy,
			isBelowResistanceLine: y <= ry,
			distanceToSupportLine: this._supportLine.linedef.distanceTo({ x: x, y: y }),
			distanceToResistanceLine: this._resistanceLine.linedef.distanceTo({ x: x, y: y })
		};
		return result;
	}

	getEpsylon(factor)
	{
		var distance0 = Math.abs(this.y0_resistance - this.y0_support);
		var distance1 = Math.abs(this.y1_resistance - this.y1_support);
		var meanDistance = (distance0 + distance1) / 2;
		return meanDistance * factor;
	}


	get supportLine()
	{
		return this._supportLine;
	}

	set supportLine(value)
	{
		this._supportLine = value;
	}

	get resistanceLine()
	{
		return this._resistanceLine;
	}

	set resistanceLine(value)
	{
		this._resistanceLine = value;
	}


	get x0()
	{
		return Math.min(this._supportLine.x0, this._resistanceLine.x0);
	}

	get x1()
	{
		return Math.min(this._supportLine.x1, this._resistanceLine.x1);
	}


	get y0_support()
	{
		return this._supportLine.linedef.calc(this.x0);
	}

	get y1_support()
	{
		return this._supportLine.linedef.calc(this.x1);
	}

	get y0_resistance()
	{
		return this._resistanceLine.linedef.calc(this.x0);
	}

	get y1_resistance()
	{
		return this._resistanceLine.linedef.calc(this.x1);
	}


	get angle()
	{
		return LinearFunction.buildMeanLine(this._supportLine.linedef, this._resistanceLine.linedef).angle;
	}

	get crossPoint()
	{
		var point = this._supportLine.linedef.intersect(this._resistanceLine.linedef);
		if (point.x < this.x0 || point.x > this.x1) return null;
		return point;
	}

	//	https://www.math-only-math.com/angle-between-two-straight-lines.html
	get divergenceAngle()
	{
		return this._supportLine.linedef.angleWidth(this._resistanceLine.linedef);
	}
}
