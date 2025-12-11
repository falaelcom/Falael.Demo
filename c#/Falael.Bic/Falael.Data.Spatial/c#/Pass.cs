// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Numerics;

namespace Falael.Data.Spatial
{
    public class Pass : IPass
	{
        #region Constructors
        public Pass(ulong frag, decimal n1, decimal n2, int p, ulong totalTickCount)
        {
            if (frag < 2)
            {
                throw new ArgumentException("frag");
            }

            if (n2 < n1)
            {
                throw new ArgumentException();
            }

            this.frag = frag;
            this.n1 = n1;
            this.n2 = n2;
            this.p = p;
            this.totalTickCount = (totalTickCount - 1) * this.frag + 1;

			ulong dimensionInterval = (ulong)(this.n2 - this.n1);

            this.step = dimensionInterval / (decimal)(this.totalTickCount - 1);

            if (p == 0)
            {
                this.tickCount = this.totalTickCount;
            }
            else if (p > 0)
            {
                this.tickCount = (this.totalTickCount - 1) - (ulong)Math.Floor((this.totalTickCount - 1) / (decimal)frag);
            }
            else
            {
                throw new ArgumentOutOfRangeException("p");
            }
        }
		#endregion

		#region IPass
		public decimal GetAt(ulong i)
		{
			if (this.p == 0)
			{
				return i * this.step + this.n1;
			}
			var n = i + (ulong)Math.Floor(i / (decimal)(this.frag - 1)) + 1;
			return n * this.step + this.n1;
		}
		public DimensionHitTestResult HitTest(decimal v, EDimensionHitTestHint dimensionHitTestHint, EPassHitTestHint passHitTestHint)
		{
			decimal translatedV = v - this.n1;
			decimal si = translatedV / this.step;

			ulong nearestSi;
			decimal nearestV;
			ulong? ti;
			switch (dimensionHitTestHint)
			{
				case EDimensionHitTestHint.Precise:
					nearestSi = (ulong)Math.Round(si);
					if (si != nearestSi)   //	not a whole number? with decimal there's no need to use epsilon; in javascript, c, c++ this code must be adapted to use epsilon
					{
						return DimensionHitTestResult.Fail;
					}
					nearestV = v;
					ti = si2ti(nearestSi);
					break;
				case EDimensionHitTestHint.Nearest:
				case EDimensionHitTestHint.NearestLeft:
				case EDimensionHitTestHint.NearestRight:
					switch (dimensionHitTestHint)
					{
						case EDimensionHitTestHint.Nearest:
							nearestSi = (ulong)Math.Round(si);
							ti = si2ti(nearestSi);
							if (!ti.HasValue)
							{
								if (si < nearestSi)
								{
									--nearestSi;
									ti = si2ti(nearestSi);
								}
								else if (si > nearestSi)
								{
									++nearestSi;
									ti = si2ti(nearestSi);
								}
								else
								{
									//	https://en.wikipedia.org/wiki/Rounding#Round-to-even_method
									//	http://stackoverflow.com/questions/977796/why-does-math-round2-5-return-2-instead-of-3
									//	select either the left or right acceptable nearest si, considering the default Math.Rount algorithm for midpoints (ToEven)
									ulong? tiLeft = si2ti((ulong)((long)nearestSi - 1));
									if (!tiLeft.HasValue)
									{
										throw new InvalidOperationException();
									}
									if (tiLeft.Value % 2 == 0)
									{
										ti = tiLeft;
										--nearestSi;
										break;
									}
									ti = si2ti((ulong)((long)nearestSi + 1));
									++nearestSi;
								}
								if (!ti.HasValue)
								{
									throw new InvalidOperationException();
								}
							}
							break;
						case EDimensionHitTestHint.NearestLeft:
							nearestSi = (ulong)Math.Floor(si);
							ti = si2ti(nearestSi);
							if (!ti.HasValue)
							{
								--nearestSi;
								ti = si2ti(nearestSi);
								if (!ti.HasValue)
								{
									throw new InvalidOperationException();
								}
							}
							break;
						case EDimensionHitTestHint.NearestRight:
							nearestSi = (ulong)Math.Ceiling(si);
							ti = si2ti(nearestSi);
							if (!ti.HasValue)
							{
								++nearestSi;
								ti = si2ti(nearestSi);
								if (!ti.HasValue)
								{
									throw new InvalidOperationException();
								}
							}
							break;
						default:
							throw new InvalidOperationException();
					}

					nearestV = nearestSi * this.step;
					switch (passHitTestHint)
					{
						case EPassHitTestHint.VerticalScan:
							if (Math.Abs(nearestV - translatedV) >= this.epsilon)   //	too far from the matched value, try on the next, more detailed pass; because epsilon matches the bottom-most pass' step, this if will never succeed (translatedV will always be close enought to nearestV)
							{
								return DimensionHitTestResult.Fail;
							}
							break;
						case EPassHitTestHint.HorizontalScan:
							break;
						default:
							throw new NotImplementedException();
					}
					break;
				default:
					throw new NotImplementedException();
			}

			if (this.p == 0)
			{
				return new DimensionHitTestResult(true, this.p, (ulong)nearestSi, nearestV);
			}
			if (!ti.HasValue || ti.Value >= this.tickCount)
			{
				return DimensionHitTestResult.Fail;
			}
			return new DimensionHitTestResult(true, this.p, ti.Value, nearestV);
		}

		public decimal[] QueryTicks(decimal v1, decimal v2)
		{
			var result = new List<decimal>();

			var v1HitTestResult = this.HitTest(v1, EDimensionHitTestHint.NearestRight, EPassHitTestHint.HorizontalScan);
			if(v1HitTestResult.Success)
			{
				v1 = v1HitTestResult.V;
			}
			var v2HitTestResult = this.HitTest(v2, EDimensionHitTestHint.NearestLeft, EPassHitTestHint.HorizontalScan);
			if (v2HitTestResult.Success)
			{
				v2 = v2HitTestResult.V;
			}

			decimal translatedV1 = v1 - this.n1;
			ulong si = (ulong)Math.Round(translatedV1 / this.step);
			ulong? ti = si2ti(si);
			decimal v = v1;
			while (v <= v2)
			{
				if (ti.HasValue)
				{
					result.Add(v);
				}

				v += this.step;
				++si;
				ti = si2ti(si);
			}

			return result.ToArray();
		}
		public decimal[] QueryAllTicks()
		{
			return this.QueryTicks(this.n1, this.n2);
		}

		public ulong TotalTickCount
		{
			get
			{
				return this.totalTickCount;
			}
		}
		public ulong TickCount
		{
			get
			{
				return this.tickCount;
			}
		}
		public decimal Step
		{
			get
			{
				return this.step;
			}
		}
		#endregion

		#region Infrastructure
		internal void SetEpsilon(decimal value)
        {
            this.epsilon = value;
        }
		#endregion

		#region Tools
		//v				     19 23  
		//n                   | |
		//i   0    1    2    3     4    5    6    7      8    9    10
		//	  0    |    |    |	  25    |    |    | 	    50    |    |    |	75    |    |    |	100
		//		6.25 12.5 18.75       31.25 37.5 43.75      56.25
		//p0i 0                    1                    2                   3
		//p1i      0    1    2          3    4    5           6    7
		//
		//	si: step index within pass
		//	ti: tick index within pass
		ulong? si2ti(ulong si)
		{
			if (this.p == 0)
			{
				return si;
			}
			var localOffset = si % this.frag;
			if (localOffset == 0)
			{
				return null;
			}
			var partentOffset = (ulong)Math.Floor(si / (decimal)this.frag);
			return partentOffset * (this.frag - 1) + localOffset - 1;
		}
		#endregion

		#region Properties
		public ulong Frag
        {
            get
            {
                return this.frag;
            }
        }
        public decimal N1
        {
            get
            {
                return this.n1;
            }
        }
        public decimal N2
        {
            get
            {
                return this.n2;
            }
        }
        public int P
        {
            get
            {
                return this.p;
            }
        }
        #endregion

        #region Fields
        ulong frag;
        decimal n1;
        decimal n2;
        int p;

        decimal epsilon;

		decimal step;
		ulong totalTickCount;
        ulong tickCount;
        #endregion
    }
}
