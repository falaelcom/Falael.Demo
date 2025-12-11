//	values: [v1, v2, ...]
//	v1, v2, ... (- Z, >= 0
//	maxs: [max1, max2, max3, ...]
//	returns number
function to_c0(maxs, values)
{
	if(values.length != maxs.length)
	{
		throw "Invalid argument";
	}

	var c = 0;
	for(var length = values.length, i = 0; i < length; ++i)
	{
		c = (maxs[i] + 1) * c + values[i];
	}

	return c;
}

//	c0: a c0 value (see to_c0)
//	maxs: [max2, max3, ...] - max1 is omitted
//	returns [v1, v2, ...]
//	v1, v2, ... (- Z, >= 0
function from_c0(maxs, c0)
{
	var result = [];
	var c = c0;
	for(var length = maxs.length, i = length - 1; i >= 0; --i)
	{
		var max = maxs[i];
		var v = c % (max + 1);
		c = (c - v) / (max + 1);
		result.unshift(v);
	}
	
	result.unshift(c);
	return result;
}
	
function Space(dimensions)
{
	this.dimensions = dimensions;

	this.tickCount = null;
	this.iterationPlan = null;

	this.iterationPlan = [];
	this.iterationPlanHash = {};
	this.maxps = [];

	if(this.dimensions.length == 0)
	{
		this.tickCount = 0;
	}
	else
	{
		var counters = [];

		this.tickCount = 1;
		var zeroPvector = [];
		for(var length = this.dimensions.length, i = 0; i < length; ++i)
		{
			var dimension = this.dimensions[i];
			this.maxps.push(dimension.getMaxP());
			counters.push(0);
			zeroPvector.push(0);

			this.tickCount *= dimension.getTotalTickCount();
		}
		this.iterationPlan.push(zeroPvector);

		var exhausted;
		do
		{
			var pvector = [];
			var incremented = false;
			exhausted = true;
			for(var length = counters.length, i = 0; i < length; ++i)
			{
				var count = counters[i];
				if(incremented)
				{
					pvector.push(count);
					continue;
				}

			var maxp = this.maxps[i];
				if(count < maxp)
				{
					++count;
					exhausted = false;
					incremented = true;
				}
				else
				{
					count = 0;
				}
				counters[i] = count;
				pvector.push(count);
			}
			if(!exhausted)
			{
				this.iterationPlan.push(pvector);
			}
		} while(!exhausted);

		this.iterationPlan.sort(function(left, right)
		{
			function sum(array)
			{
				var result = 0;
				for(var length = array.length, i = 0; i < length; ++i) result += array[i];
				return result;
			}

			function lexigoraphicCompare(left, right)
			{
				for(var length = left.length, i = 0; i < length; ++i)
				{
					var delta = left[i] - right[i];
					if(delta != 0)
					{
						return delta;
					}
				}
				return 0;
			}

			var maxLeft = Math.max.apply(null, left);
			var maxRight = Math.max.apply(null, right);

			var maxDelta = maxLeft - maxRight;
			if(maxDelta != 0)
			{
				return maxDelta;
			}

			var sumDelta = sum(left) - sum(right);
			if(sumDelta != 0)
			{
				return sumDelta;
			}

			var minLeft = Math.min.apply(null, left);
			var minRight = Math.min.apply(null, right);
			var minDelta = minLeft - minRight;
			if(minDelta != 0)
			{
				return minDelta;
			}

			return lexigoraphicCompare(left, right);
		});

		for(var length = this.iterationPlan.length, i = 0; i < length; i++)
		{
			var pc0 = to_c0(this.maxps, this.iterationPlan[i]);
			this.iterationPlanHash[pc0] = i;
		}
	}

	this.getDimensions = function()
	{
		return this.dimensions;
	};

	this.getTickCount = function()
	{
		return this.tickCount;
	};

	this.getPvector = function(ipi)
	{
		return this.iterationPlan[ipi];
	}

	this.getIpiLength = function(ipi)
	{
		var pvector = this.iterationPlan[ipi];

		var result = 1;
		for(var length = this.dimensions.length, i = 0; i < length; ++i)
		{
			var dimension = this.dimensions[i];
			var p = pvector[i];
			var pass = dimension.getPass(p);
			result *= (pass.getTickCount());
		}

		return result;
	};
	
	//	vvector: [v1, v2, ...]
	//	returns indexer {ipi, ic0} || null
	this.hitTest = function(vvector, useNearest)
	{
		var ivector = [];
		var pvector = [];
		for(var length = this.dimensions.length, i = 0; i < length; ++i)
		{
			var dimension = this.dimensions[i];
			var v = vvector[i];
			var hitTestResult = dimension.hitTest(v, useNearest);
			if(!hitTestResult)
			{
				return null;
			}
			ivector.push(hitTestResult.i);
			pvector.push(hitTestResult.p);
		}
		
		return {
			ipi: this.iterationPlanHash[to_c0(this.maxps, pvector)],
			ic0: this._ic0_from_vector(pvector, ivector),
		};
	};
	
	//	pvector: [p1, p2, ...]
	//	ic0: number
	//	returns [i1, i2, ...]
	this._ic0_to_vector = function(pvector, ic0)
	{
		var maxis = [];
		for(var length = this.dimensions.length, i = 1; i < length; ++i)
		{
			var dimension = this.dimensions[i];
			var p = pvector[i];
			var pass = dimension.getPass(p);
			maxis.push(pass.getTickCount() - 1);
		}
		return from_c0(maxis, ic0);
	}
	
	//	pvector: [p1, p2, ...]
	//	ivector: [i1, i2, ...]
	//	returns ic0
	this._ic0_from_vector = function(pvector, ivector)
	{
		var maxis = [];
		for(var length = this.dimensions.length, i = 0; i < length; ++i)
		{
			var dimension = this.dimensions[i];
			var p = pvector[i];
			var pass = dimension.getPass(p);
			maxis.push(pass.getTickCount() - 1);
		}

		return to_c0(maxis, ivector);
	}
	
	//	indexer: {ipi, ic0}
	//	returns [vx, vy, ...]
	this.getAt = function(indexer)
	{
		var pvector = this.iterationPlan[indexer.ipi];
		var ivector = this._ic0_to_vector(pvector, indexer.ic0);
	
		var result = [];
		for(var length = this.dimensions.length, j = 0; j < length; ++j)
		{
			var dimension = this.dimensions[j];
			var i = ivector[j];
			var p = pvector[j];
			var pass = dimension.getPass(p);
			result.push(pass.getAt(i));
		}
		
		return result;
	}

	//	returns indexer {ipi, ic0}
	this.first = function()
	{
		return {
			ipi: 0,
			ic0: 0
		};
	}

	//	indexer: {ipi, ic0}
	//	returns indexer {ipi, ic0}
	this.next = function(indexer)
	{
		var pvector = this.iterationPlan[indexer.ipi];
		var ivector = this._ic0_to_vector(pvector, indexer.ic0);

		//	find the first pass that has not exhausted tick iteration and get next tick index
		for(var length = this.dimensions.length, j = length - 1; j >= 0 ; --j)
		{
			var dimension = this.dimensions[j];
			var p = pvector[j];
			var i = ivector[j];
			var pass = dimension.getPass(p);
			++i;
			if(i < pass.getTickCount())
			{
				ivector[j] = i;
				return {
					ipi: indexer.ipi,
					ic0: this._ic0_from_vector(pvector, ivector),
				}
			}
			ivector[j] = 0;
		}
		
		//	or if all passes have exhausted tick iteration, iterate the pass vector and get the first tick of the first pass
		var ipi = indexer.ipi;
		++ipi;
		if(ipi < this.iterationPlan.length)
		{
			return {
				ipi: ipi,
				ic0: 0,
			}
		}
		
		//	rewind
		return this.first();
	};
}

Space.Empty = new Space([]);

//  genfrag: function(origin, p): frag
function Dimension(frag, maxp, n1, n2, genfrag)
{
	this.frag = frag;
	this.maxp = maxp;
	this.n1 = n1;
	this.n2 = n2;
	this.genfrag = genfrag;
	
	this.epsilon = null;	//	used for floating point equality comparison

	var totalTickCount = 2;
	var frag = this.frag;
	this.passes = [];
	for(var p = 0; p <= this.maxp; ++p)
	{
		if(this.genfrag)
		{
			frag = this.genfrag(this.frag, p);
		}
		var pass = new Pass(frag, this.n1, this.n2, p, totalTickCount);
		this.passes.push(pass);
		totalTickCount = pass.getTotalTickCount();
	}
	var epsilon = this.passes[this.passes.length - 1].getStep() / 2;
	var inflation = 1.01;
	this.epsilon = inflation * epsilon;	//	inflate a bit to mitigate the js floating point error

	for (var i = 0; i < this.passes.length; ++i)
	{
		this.passes[i].setEpsilon(this.epsilon);
	}

	this.getPass = function(p)
	{
		if(p > this.passes)
		{
			throw "Invalid argument";
		}
		return this.passes[p];
	};

	this.getMaxP = function()
	{
		return this.maxp;
	};
	
	this.getTotalTickCount = function()
	{
		return this.passes[this.passes.length - 1].getTotalTickCount();
	};

	this.getAt = function(p, i)
	{
		if(p >= this.passes.length)
		{
			throw "Argument out of range: p";
		}
		
		return this.passes[p].getAt(i);
	};

	this.hitTest = function(v, useNearest)
	{
		for(var length = this.passes.length, p = 0; p < length; ++p)
		{
			var result = this.passes[p].hitTest(v, useNearest);
			if(result)
			{
				return result;
			}
		}
		return null;
	}
	
	this.queryAllTicks = function()
	{
		var result = [];
		for(var length = this.passes.length, p = 0; p < length; ++p)
		{
			result.push(this.passes[p].queryAllTicks());
		}
		return result;
	};
}

function Pass(frag, n1, n2, p, totalTickCount)
{
	this.p = p;
	this.frag = frag;
	this.n1 = n1;
	this.n2 = n2;
	this.p = p;
	this.totalTickCount = (totalTickCount - 1) * this.frag + 1;

	this.epsilon = null;

	this.step = null;
	this.tickCount = null;
	this.hitTestEpsilon = 1 / Math.pow(10, 14);

	var p = this.p;
	var frag = this.frag;
	var n1 = this.n1;
	var n2 = this.n2;
	
	var dimensionInterval = n2 - n1;

	this.step = dimensionInterval / (this.totalTickCount - 1);

	if(p == 0)
	{
		this.tickCount = this.totalTickCount;
	}
	else if(p > 0)
	{
		this.tickCount = (this.totalTickCount - 1) - Math.floor((this.totalTickCount - 1) / frag)
	}
	else
	{
		throw "Invalid operation";
	}

	this.setEpsilon = function(value)
	{
		this.epsilon = value;
	}

	this.getTotalTickCount = function()
	{
		return this.totalTickCount;
	};
	
	this.getTickCount = function()
	{
		return this.tickCount;
	};
	
	this.getStep = function()
	{
		return this.step;
	};

	this.getAt = function(i)
	{
		if(this.p == 0)
		{
			return i * this.step + this.n1;
		}
		var n = i + Math.floor(i / (this.frag - 1)) + 1;
		return n * this.step + this.n1;
	};
	
	this.hitTest = function(v, useNearest)
	{
		var translatedV = v - this.n1;
		var n = translatedV / this.step;
		var nearestN = Math.round(n);
		if(useNearest)
		{
			var nearestV = nearestN * this.step;
			if(Math.abs(nearestV - translatedV) <= this.epsilon)
			{
				if(this.p == 0)
				{
					return {
						p: this.p,		//	pass
						i: nearestN,	//	index within pass
						v: nearestV,
					};
				}
				var i = Math.round(nearestN - Math.floor(nearestN / this.frag)) - 1;
				return {
					p: this.p,		//	pass
					i: i,			//	index within pass
					v: nearestV,
				};
			}
		}
		else
		{
			if(Math.abs(n - nearestN) < this.hitTestEpsilon)	//	is a whole number?
			{
				if(this.p == 0)
				{
					return {
						p: this.p,		//	pass
						i: nearestN,	//	index within pass
						v: v,
					};
				}
				var i = Math.round(n - Math.floor(n / this.frag)) - 1;
				return {
					p: this.p,		//	pass
					i: i,			//	index within pass
					v: v,
				};
			}
		}
		return null;
	};

	this.queryAllTicks = function()
	{
		var result = [];
	
		if(this.p == 0)
		{
			result.push(this.n1);
		}

		var i = 0;
		var v = this.n1;
		while(v <= this.n2)
		{
			if(i % this.frag != 0)
			{
				result.push(v);
			}
			
			v += this.step;
			++i;
		}
		
		if(this.p == 0)
		{
			result.push(this.n2);
		}
		
		return result;
	};
}

