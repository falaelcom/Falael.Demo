"use strict";

module.exports =

class LinearFunction
{
	//	x = c
	//		or
	//	y = a * x + b
	//
	//	NOTE: setting c to a value different from undefined takes precedence and defines a vertical function
	constructor(a, b, c)
	{
		this._a = a;
		this._b = b;
		this._c = c;
	}

	static wrap(arg)
	{
		if (arg instanceof LinearFunction) return arg;

		return new LinearFunction(arg._a, arg._b, arg._c);
	}

	clone()
	{
		return new LinearFunction(this._a, this._b, this._c);
	}


	calc(x)
	{
		if (this._c !== void (0))
		{
			if (x === this._c) throw "The function produces an infinite number of values for the specified value of x.";
			else throw "The function is not defined for the specified value of x.";
		}
		if (x == -Infinity)
		{
			if (this._a < 0) return Infinity;
			if (this._a == 0) return this._b;
			return -Infinity;
		}
		else if (x == Infinity)
		{
			if (this._a < 0) return -Infinity;
			if (this._a == 0) return this._b;
			return Infinity;
		}
		else return this._a * x + this._b;
	}

	isDefined(x)
	{
		if (this._c === void (0)) return true;	//	non-vertical line
		return x === this._c;					//	vertical line
	}

	//	https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line - Another formula
	distanceTo(point)
	{
		if (this._c !== void (0)) return Math.abs(this._c - point.x);

		const m = this._a;
		const k = this._b;
		const x0 = point.x;
		const y0 = point.y;
		return Math.abs(k + m * x0 - y0) / Math.sqrt(1 + m * m);
	}

	isBelowPoint(point, epsylon)
	{
		if (this.isParalellOy) throw "The test result is undefined.";
		if (!epsylon) return (point.y > this.calc(point.x));
		return point.y > this.calc(point.x) - epsylon;
	}

	intersectWith(linedef)
	{
		if (this.isParalellTo(linedef)) return null;
		if (this.isParalellOy) return { x: this._c, y: linedef.calc(this._c) };
		if (linedef.isParalellOy) return { x: linedef.c, y: this.calc(linedef.c) };

		const a1 = this._a;
		const b1 = this._b;
		const a2 = linedef.a;
		const b2 = linedef.b;
		const xc = (b2 - b1) / (a1 - a2);
		const yc = this.calc(xc);
		return { x: xc, y: yc };
	}

	isParalellTo(linedef)
	{
		if (this.isParalellOx && linedef.isParalellOx) return true;
		if (this.isParalellOy && linedef.isParalellOy) return true;
		if (this.isParalellOx && linedef.isParalellOy) return false;
		if (this.isParalellOy && linedef.isParalellOx) return false;
		return this._a == linedef.a;
	}

	angleWith(linedef)
	{
		return Math.abs(this.angle - linedef.angle);
	}

	arePointsWithinSpread(points, lineSpread)
	{
		for (let length = points.length, i = 0; i < length; ++i)
		{
			const item = points[i];
			const d = this.distanceTo(item);
			if (d > lineSpread / 2)
			{
				return false;
			}
		}
		return true;
	}

	getDistance(x1, x2)
	{
		const y1 = this.calc(x1);
		const y2 = this.calc(x2);

		const deltaX = x2 - x1;
		const deltaY = y2 - y1;

		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	//	https://math.stackexchange.com/questions/62633/orthogonal-projection-of-a-point-onto-a-line
	orthogonalProjectPoint(point)
	{
		if (this.isParalellOy) return { x: this._c, y: point.y };
		if (this.isParalellOx) return { x: point.x, y: this._b };

		const linedefOrthogonal = LinearFunction.buildOrthogonalLine(this, point);
		return this.intersectWith(linedefOrthogonal);
	}


	//	https://www.varsitytutors.com/hotmath/hotmath_help/topics/line-of-best-fit
	static buildLineOfBestFit(points)
	{
		let sumX = 0;
		let sumY = 0;
		for (let length = points.length, i = 0; i < length; ++i)
		{
			const item = points[i];
			sumX += item.x;
			sumY += item.y;
		}
		const meanX = sumX / points.length;
		const meanY = sumY / points.length;

		let m_sum1 = 0;
		let m_sum2 = 0;
		for (let length = points.length, i = 0; i < length; ++i)
		{
			const item = points[i];
			m_sum1 += (item.x - meanX) * (item.y - meanY);
			m_sum2 += (item.x - meanX) * (item.x - meanX);
		}
		const m = m_sum1 / m_sum2;
		const b = meanY - m * meanX;

		return new LinearFunction(m, b);
	}

	static buildWeightedLineOfBestFit(points)
	{
		let wsumX = 0;
		let sumWX = 0;
		let wsumY = 0;
		let sumWY = 0;
		for (let length = points.length, i = 0; i < length; ++i)
		{
			const item = points[i];
			wsumX += item.wx * item.x;
			sumWX += item.wx;
			wsumY += item.wy * item.y;
			sumWY += item.wy;
		}
		const wmeanX = wsumX / sumWX;
		const wmeanY = wsumY / sumWY;

		let m_wsum1 = 0;
		let m_wsum2 = 0;
		for (let length = points.length, i = 0; i < length; ++i)
		{
			const item = points[i];
			m_wsum1 += item.wx * item.wy * (item.x - wmeanX) * (item.y - wmeanY);
			m_wsum2 += item.wx * item.wx * (item.x - wmeanX) * (item.x - wmeanX);
		}
		const m = m_wsum1 / m_wsum2;
		const b = wmeanY - m * wmeanX;

		return new LinearFunction(m, b);
	}

	static buildMeanLine(linedef1, linedef2)
	{
		return new LinearFunction(

			(linedef1.a + linedef2.a) / 2,
			(linedef1.b + linedef2.b) / 2
		);
	}

	static buildOrthogonalLine(linedef, point)
	{
		if (linedef.isParalellOy) return new LinearFunction(0, point.y);
		if (linedef.isParalellOx) return new LinearFunction(0, 0, point.x);

		const mr = linedef.slope;
		const ms = - 1 / linedef.slope;
		const bs = point.y - ms * point.x;
		return new LinearFunction(ms, bs);
	}

	//	http://www.mathcentre.ac.uk/resources/uploaded/mc-ty-strtlines-2009-1.pdf
	static buildLineFromPoints(point1, point2)
	{
		if (point1.x == point2.x) return new LinearFunction(0, 0, point1.x);
		if (point1.y == point2.y) return new LinearFunction(0, point1.y);

		const m = (point2.y - point1.y) / (point2.x - point1.x);
		const c = point1.y - m * point1.x;

		return new LinearFunction(m, c);
	}

	//	https://www.coolmath.com/algebra/08-lines/11-finding-equation-line-point-slope-01
	static buildLineFromPointSlope(point, m)
	{
		if (m == Infinity) throw "The result is undefined.";
		return new LinearFunction(m, point.y - m * point.x);
	}

	static buildScaledLine(linedef, scalex, scaley, precisionExponent)
	{
		if (precisionExponent < 0) throw "Argument is invalid: precisionFactor.";
		precisionExponent = precisionExponent || 10;

		const x0 = -Math.pow(10, precisionExponent);
		const x1 = Math.pow(10, precisionExponent);
		const y0 = linedef.calc(x0);
		const y1 = linedef.calc(x1);
		return LinearFunction.buildLineFromPoints({ x: x0 * scalex, y: y0 * scaley }, { x: x1 * scalex, y: y1 * scaley });
	}


	get a()
	{
		return this._a;
	}

	set a(value)
	{
		this._a = value;
	}

	get b()
	{
		return this._b;
	}

	set b(value)
	{
		this._b = value;
	}

	get c()
	{
		return this._c;
	}

	set c(value)
	{
		this._c = value;
	}


	get isParalellOy()
	{
		return this._c !== void (0);
	}

	get isParalellOx()
	{
		return this._c === void (0) && !this._a;
	}


	get slope()
	{
		if (this.isParalellOy) return Infinity;
		return this.calc(1) - this.calc(0);
	}

	//	angle in [0, Pi)
	get angle()
	{
		if (this.isParalellOy) return Math.PI / 2;
		let result = Math.atan(this.slope);
		if (result < 0) result = Math.PI + result;
		return result;
	}


	static __unitTest()
	{
		const result = [];
		let resultJson;
		function assertResult(method, name, value)
		{
			if (value == resultJson)
			{
				result.push("OK LinearFunction." + method + ": " + name);
			}
			else
			{
				result.push("FAIL LinearFunction." + method + ": " + name + "<br />&nbsp;&nbsp;&nbsp;&nbsp;- expected: " + value + "<br />&nbsp;&nbsp;&nbsp;&nbsp;- got: " + resultJson);
			}
		};

		function translate(key, value)
		{
			if (value === Infinity) return "Infinity";
			else if (value === -Infinity) return "-Infinity";
			else return value;
		}

		let linedef1;
		let linedef2;
		let point;
		let point1;
		let point2;

		//	calc
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		resultJson = JSON.stringify(linedef1.calc(0), translate);
		assertResult("distanceTo", "y = 1; x = 0", "1");

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		resultJson = JSON.stringify(linedef1.calc(1), translate);
		assertResult("distanceTo", "y = 1; x = 1", "1");

		linedef1 = new LinearFunction(0, 0, 1);	//	x = 1
		try { resultJson = JSON.stringify(linedef1.calc(0), translate); } catch (ex) { resultJson = ex; }
		assertResult("distanceTo", "x = 1; x = 0", "The function is not defined for the specified value of x.");

		linedef1 = new LinearFunction(0, 0, 1);	//	x = 1
		try { resultJson = JSON.stringify(linedef1.calc(1), translate); } catch (ex) { resultJson = ex; }
		assertResult("distanceTo", "x = 1; x = 1", "The function produces an infinite number of values for the specified value of x.");

		linedef1 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.calc(0), translate);
		assertResult("distanceTo", "y = x; x = 0", "0");

		linedef1 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.calc(1), translate);
		assertResult("distanceTo", "y = x; x = 1", "1");

		linedef1 = new LinearFunction(2, 2);	//	y = 2 * x + 2
		resultJson = JSON.stringify(linedef1.calc(0), translate);
		assertResult("distanceTo", "y = 2 * x + 2; x = 0", "2");

		linedef1 = new LinearFunction(2, 2);	//	y = 2 * x + 2
		resultJson = JSON.stringify(linedef1.calc(1), translate);
		assertResult("distanceTo", "y = 2 * x + 2; x = 1", "4");

		//	distanceTo
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(linedef1.distanceTo(point), translate);
		assertResult("distanceTo", "y = 1; (0, 0)", "1");

		linedef1 = new LinearFunction(0, 0, -1);	//	x = -1
		point = { x: 1, y: 0 };
		resultJson = JSON.stringify(linedef1.distanceTo(point), translate);
		assertResult("distanceTo", "x = -1; (1, 0)", "2");

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		point = { x: 1, y: 1 };
		resultJson = JSON.stringify(linedef1.distanceTo(point), translate);
		assertResult("distanceTo", "y = 1; (1, 1)", "0");

		linedef1 = new LinearFunction(1, 0);	//	y = x
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(linedef1.distanceTo(point), translate);
		assertResult("distanceTo", "y = x; (0, 0)", "0");

		linedef1 = new LinearFunction(1, 0);	//	y = x
		point = { x: 1, y: 0 };
		resultJson = JSON.stringify(linedef1.distanceTo(point), translate);
		assertResult("distanceTo", "y = x; (1, 0)", "0.7071067811865475");

		//	intersectWith
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(0, 2);	//	y = 2
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; y = 2", 'null');

		linedef1 = new LinearFunction(0, 0, 1);	//	x = 1
		linedef2 = new LinearFunction(0, 0, 2);	//	x = 2
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "x = 1; x = 2", 'null');

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(0, 0, 1);	//	x = 1
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; x = 1", '{"x":1,"y":1}');

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(0, 0, 1);	//	x = 1
		resultJson = JSON.stringify(linedef2.intersectWith(linedef1), translate);
		assertResult("intersectWith", "x = 1; y = 1", '{"x":1,"y":1}');

		linedef1 = new LinearFunction(1, 1);	//	y = x + 1
		linedef2 = new LinearFunction(1, -1);	//	y = x - 1
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = x + 1; y = x - 1", 'null');

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; y = x", '{"x":1,"y":1}');

		linedef1 = new LinearFunction(2, 0);	//	y = 2 * x
		linedef2 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = x; y = 2 * x", '{"x":0,"y":0}');

		linedef1 = new LinearFunction(1, 1);	//	y = x + 1
		linedef2 = new LinearFunction(0, 1);	//	y = 1
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; y = x + 1", '{"x":0,"y":1}');

		linedef1 = new LinearFunction(2, -2);	//	y = 2 * x - 2
		linedef2 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = x; y = 2 * x - 2", '{"x":2,"y":2}');

		linedef1 = new LinearFunction(1, 0);	//	y = x
		linedef2 = new LinearFunction(-1, 1);	//	y = -x + 1
		resultJson = JSON.stringify(linedef1.intersectWith(linedef2), translate);
		assertResult("intersectWith", "y = x; y = x - 1", '{"x":0.5,"y":0.5}');

		//	angle
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		resultJson = JSON.stringify(linedef1.angle, translate);
		assertResult("angle", "y = 1", "0");

		linedef1 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.angle, translate);
		assertResult("angle", "y = x", "0.7853981633974483");	//	pi / 4

		linedef1 = new LinearFunction(0, 0, 0);	//	x = 0
		resultJson = JSON.stringify(linedef1.angle, translate);
		assertResult("angle", "x = 0", "1.5707963267948966");	//	pi / 2

		linedef1 = new LinearFunction(-1, 0);	//	y = -x
		resultJson = JSON.stringify(linedef1.angle, translate);
		assertResult("angle", "y = -x", "2.356194490192345");	//	3 * pi / 4

		//	angleWith
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(0, 2);	//	y = 2
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; y = 2", '0');

		linedef1 = new LinearFunction(0, 0, 1);	//	x = 1
		linedef2 = new LinearFunction(0, 0, 2);	//	x = 2
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "x = 1; x = 2", '0');

		linedef1 = new LinearFunction(1, 1);	//	y = x + 1
		linedef2 = new LinearFunction(1, -1);	//	y = x - 1
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = x + 1; y = x - 1", '0');

		linedef1 = new LinearFunction(-1, 1);	//	y = -x + 1
		linedef2 = new LinearFunction(-1, -1);	//	y = -x - 1
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = -x + 1; y = -x - 1", '0');

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; y = x", '0.7853981633974483');			//	pi /4

		linedef1 = new LinearFunction(1, 0);	//	y = x
		linedef2 = new LinearFunction(0, 1);	//	y = 1
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = x; y = 1", '0.7853981633974483');			//	pi /4

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(-1, 0);	//	y = -x
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = 1; y = -x", "2.356194490192345");			//	3 * pi / 4

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		linedef2 = new LinearFunction(-1, 0);	//	y = -x
		resultJson = JSON.stringify(linedef2.angleWith(linedef1), translate);
		assertResult("intersectWith", "y = -x; y = 1", "2.356194490192345");			//	3 * pi / 4

		linedef1 = new LinearFunction(0, 0, 1);	//	x = 1
		linedef2 = new LinearFunction(1, 0);	//	y = x
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "x = 1; y = x", '0.7853981633974483');			//	pi /4

		linedef1 = new LinearFunction(0, 0, 1);	//	x = 1
		linedef2 = new LinearFunction(-1, 0);	//	y = -x
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "x = 1; y = -x", '0.7853981633974483');			//	pi /4

		linedef1 = new LinearFunction(1, 0);	//	y = x
		linedef2 = new LinearFunction(-1, 0);	//	y = - x
		resultJson = JSON.stringify(linedef1.angleWith(linedef2), translate);
		assertResult("intersectWith", "y = x; y = - x", "1.5707963267948966");		//	pi / 2

		linedef1 = new LinearFunction(1, 0);	//	y = x
		linedef2 = new LinearFunction(-1, 0);	//	y = - x
		resultJson = JSON.stringify(linedef2.angleWith(linedef1), translate);
		assertResult("intersectWith", "y = - x; y = x", "1.5707963267948966");		//	pi / 2

		//	buildLineFromPoints
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildOrthogonalLine(linedef1, point), translate);
		assertResult("buildOrthogonalLine", "y = 1; (0, 0)", '{"_a":0,"_b":0,"_c":0}');

		linedef1 = new LinearFunction(0, 0, -1);	//	x = -1
		point = { x: 1, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildOrthogonalLine(linedef1, point), translate);
		assertResult("buildOrthogonalLine", "x = -1; (1, 0)", '{"_a":0,"_b":0}');

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		point = { x: 1, y: 1 };
		resultJson = JSON.stringify(LinearFunction.buildOrthogonalLine(linedef1, point), translate);
		assertResult("buildOrthogonalLine", "y = 1; (1, 1)", '{"_a":0,"_b":0,"_c":1}');

		linedef1 = new LinearFunction(1, 0);	//	y = x
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildOrthogonalLine(linedef1, point), translate);
		assertResult("buildOrthogonalLine", "y = x; (0, 0)", '{"_a":-1,"_b":0}');

		linedef1 = new LinearFunction(-1, 0);	//	y = -x
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildOrthogonalLine(linedef1, point), translate);
		assertResult("buildOrthogonalLine", "y = -x; (0, 0)", '{"_a":1,"_b":0}');

		linedef1 = new LinearFunction(1, 0);	//	y = x
		point = { x: 1, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildOrthogonalLine(linedef1, point), translate);
		assertResult("buildOrthogonalLine", "y = x; (1, 0)", '{"_a":-1,"_b":1}');

		//	buildLineFromPoints
		point1 = { x: 0, y: 0 };
		point2 = { x: 0, y: 1 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 0); (0, 1)", '{"_a":0,"_b":0,"_c":0}');

		point1 = { x: 0, y: 0 };
		point2 = { x: 1, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 0); (1, 0)", '{"_a":0,"_b":0}');

		point1 = { x: 0, y: 0 };
		point2 = { x: 1, y: 1 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 0); (1, 1)", '{"_a":1,"_b":0}');

		point1 = { x: 0, y: 0 };
		point2 = { x: 1, y: -1 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 0); (1, -1)", '{"_a":-1,"_b":0}');

		point1 = { x: 0, y: 0 };
		point2 = { x: 1, y: 2 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 0); (1, 2)", '{"_a":2,"_b":0}');

		point1 = { x: 0, y: 1 };
		point2 = { x: 1, y: 2 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 1); (1, 2)", '{"_a":1,"_b":1}');

		point1 = { x: 0, y: 1 };
		point2 = { x: 1, y: 0 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, 1); (1, 0)", '{"_a":-1,"_b":1}');

		point1 = { x: 0, y: -1 };
		point2 = { x: 1, y: -2 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, -1); (1, -2)", '{"_a":-1,"_b":-1}');

		point1 = { x: 0, y: -1 };
		point2 = { x: 1, y: 1 };
		resultJson = JSON.stringify(LinearFunction.buildLineFromPoints(point1, point2), translate);
		assertResult("buildLineFromPoints", "(0, -1); (1, 1)", '{"_a":2,"_b":-1}');

		//	orthogonalProjectPoint
		linedef1 = new LinearFunction(0, 1);	//	y = 1
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(linedef1.orthogonalProjectPoint(point), translate);
		assertResult("orthogonalProjectPoint", "y = 1; (0, 0)", '{"x":0,"y":1}');

		linedef1 = new LinearFunction(0, 0, -1);	//	x = -1
		point = { x: 1, y: 0 };
		resultJson = JSON.stringify(linedef1.orthogonalProjectPoint(point), translate);
		assertResult("orthogonalProjectPoint", "x = -1; (1, 0)", '{"x":-1,"y":0}');

		linedef1 = new LinearFunction(0, 1);	//	y = 1
		point = { x: 1, y: 1 };
		resultJson = JSON.stringify(linedef1.orthogonalProjectPoint(point), translate);
		assertResult("orthogonalProjectPoint", "y = 1; (1, 1)", '{"x":1,"y":1}');

		linedef1 = new LinearFunction(1, 0);	//	y = x
		point = { x: 0, y: 0 };
		resultJson = JSON.stringify(linedef1.orthogonalProjectPoint(point), translate);
		assertResult("orthogonalProjectPoint", "y = x; (0, 0)", '{"x":0,"y":0}');

		linedef1 = new LinearFunction(1, 0);	//	y = x
		point = { x: 1, y: 0 };
		resultJson = JSON.stringify(linedef1.orthogonalProjectPoint(point), translate);
		assertResult("orthogonalProjectPoint", "y = x; (1, 0)", '{"x":0.5,"y":0.5}');

		return result;
	}
}