// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial
{
    public class SpaceIterationPlan
	{
        #region Constructors
        public SpaceIterationPlan(IDimension[] dimensions)
        {
            var counters = new List<int>();
            var maxps = new List<ulong>();

			if(dimensions.Length == 0)
			{
				this.tickCount = 0;
			}
			else
			{
				this.tickCount = 1;
				var zeroPvector = new List<ulong>();
				for (int length = dimensions.Length, i = 0; i < length; ++i)
				{
					var dimension = dimensions[i];
					maxps.Add((ulong)dimension.Maxp);
					counters.Add(0);
					zeroPvector.Add(0);

					this.tickCount *= dimension.TotalTickCount;
				}
				this.maxps = maxps.ToArray();

				var iterationPlan = new List<ulong[]>();
				iterationPlan.Add(zeroPvector.ToArray());

				bool exhausted;
				do
				{
					var pvector = new List<ulong>();
					var incremented = false;
					exhausted = true;
					for (int length = counters.Count, i = 0; i < length; ++i)
					{
						var count = counters[i];
						if (incremented)
						{
							pvector.Add((ulong)count);
							continue;
						}

						var maxp = this.maxps[i];
						if ((ulong)count < maxp)
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
						pvector.Add((ulong)count);
					}
					if (!exhausted)
					{
						iterationPlan.Add(pvector.ToArray());
					}
				}
				while (!exhausted);

				iterationPlan.Sort((left, right) =>
				{
					var maxLeft = left.Max();
					var maxRight = right.Max();

					var maxDelta = (int)((long)maxLeft - (long)maxRight);
					if (maxDelta != 0)
					{
						return maxDelta;
					}

					var sumDelta = (int)(left.Sum(x => (decimal)x) - right.Sum(x => (decimal)x));
					if (sumDelta != 0)
					{
						return sumDelta;
					}

					var minLeft = left.Min();
					var minRight = right.Min();
					var minDelta = (int)((long)minLeft - (long)minRight);
					if (minDelta != 0)
					{
						return minDelta;
					}

					return Utility.LexigoraphicCompare(left, right);
				});

				this.iterationSteps = iterationPlan.ToArray();

				for (int length = this.iterationSteps.Length, i = 0; i < length; i++)
				{
					var pc0 = Utility.ToC0(this.maxps, this.iterationSteps[i]);
					this.iterationPlanHash[pc0] = i;
				}
			}
		}
		#endregion

		#region Properties
		public ulong TickCount
		{
			get
			{
				return this.tickCount;
			}
		}
		public ulong[][] IterationSteps
		{
			get
			{
				return this.iterationSteps;
			}
		}
		public Dictionary<ulong, int> IterationPlanHash
		{
			get
			{
				return this.iterationPlanHash;
			}
		}
		public ulong[] Maxps
		{
			get
			{
				return this.maxps;
			}
		}
		#endregion

		#region Fields
		ulong tickCount;
        ulong[][] iterationSteps;
        Dictionary<ulong, int> iterationPlanHash = new Dictionary<ulong, int>();
		ulong[] maxps;
        #endregion
    }
}
