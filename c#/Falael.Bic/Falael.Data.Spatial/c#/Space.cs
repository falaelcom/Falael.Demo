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
    public class Space : ISpace
	{
        #region Constructors
        public Space(IDimension[] dimensions)
        {
            this.dimensions = dimensions;
			this.spaceIterationPlan = new SpaceIterationPlan(this.dimensions);
		}

		protected Space()
		{
		}
		#endregion

		#region ISpace
        public SpaceHitTestResult HitTest(decimal[] vvector, EDimensionHitTestHint hitTestHint)
        {
            var ivector = new List<ulong>();
            var pvector = new List<ulong>();
            for (int length = this.dimensions.Length, i = 0; i < length; ++i)
            {
                var dimension = this.dimensions[i];
                var v = vvector[i];
                var hitTestResult = dimension.HitTest(v, hitTestHint);
                if (!hitTestResult.Success)
                {
                    return SpaceHitTestResult.Fail;
                }
                ivector.Add(hitTestResult.I);
                pvector.Add((ulong)hitTestResult.P);
            }

            var spaceIterator = new SpaceIterator(
                this.spaceIterationPlan.IterationPlanHash[Utility.ToC0(this.spaceIterationPlan.Maxps, pvector.ToArray())],
                this._ic0_from_vector(pvector.ToArray(), ivector.ToArray())
            );

            return new SpaceHitTestResult(true, spaceIterator);
        }
        public decimal[] GetAt(SpaceIterator spaceIterator)
        {
            var pvector = this.spaceIterationPlan.IterationSteps[spaceIterator.Ipi];
            var ivector = this._ic0_to_vector(pvector, spaceIterator.Ic0);

            var result = new List<decimal>();
            for (int length = this.dimensions.Length, j = 0; j < length; ++j)
            {
                var dimension = this.dimensions[j];
                var i = ivector[j];
                var p = pvector[j];
                var pass = dimension.GetPass((int)p);
                result.Add(pass.GetAt(i));
            }

            return result.ToArray();
        }
        public SpaceIterator First()
        {
            return new SpaceIterator(0, 0);
        }
        public SpaceIterator Next(SpaceIterator spaceIterator)
        {
            var pvector = this.spaceIterationPlan.IterationSteps[spaceIterator.Ipi];
            var ivector = this._ic0_to_vector(pvector, spaceIterator.Ic0);

            //	find the first pass that has not exhausted tick iteration and get next tick index
            for (int length = this.dimensions.Length, j = length - 1; j >= 0; --j)
            {
                var dimension = this.dimensions[j];
                var p = pvector[j];
                var i = ivector[j];
                var pass = dimension.GetPass((int)p);
                ++i;
                if (i < pass.TickCount)
                {
                    ivector[j] = i;
                    return new SpaceIterator(
                        spaceIterator.Ipi,
                        this._ic0_from_vector(pvector, ivector)
                    );
                }
                ivector[j] = 0;
            }

            //	or if all passes have exhausted tick iteration, iterate the pass vector and get the first tick of the first pass
            var ipi = spaceIterator.Ipi;
            ++ipi;
            if (ipi < this.spaceIterationPlan.IterationSteps.Length)
            {
                return new SpaceIterator(ipi, 0);
            }

            //	rewind
            return this.First();
        }
        public ulong CountSpaceIteratorTicks(SpaceIterator spaceIterator)
        {
            ulong result = spaceIterator.Ic0;
            for (int length = spaceIterator.Ipi, ipi = 0; ipi < length; ++ipi)
            {
                result += this.GetIpiLength(ipi);
            }
            return result;
        }

		public IDimension[] Dimensions
		{
			get
			{
				return this.dimensions;
			}
		}
		public ulong TickCount
		{
			get
			{
				return this.spaceIterationPlan.TickCount;
			}
		}
		public bool IsEmpty
		{
			get
			{
				return this.dimensions.Length == 0;
			}
		}
		#endregion

		#region Operations
		public ulong GetIpiLength(int ipi)
		{
			var pvector = this.spaceIterationPlan.IterationSteps[ipi];

			ulong result = 1;
			for (int length = this.dimensions.Length, i = 0; i < length; ++i)
			{
				var dimension = this.dimensions[i];
				var p = pvector[i];
				var pass = dimension.GetPass((int)p);
				result *= (pass.TickCount);
			}

			return result;
		}
		public ulong[] GetPvector(int ipi)
		{
			return this.spaceIterationPlan.IterationSteps[ipi];
		}
		#endregion

		#region Tools
		protected ulong[] _ic0_to_vector(ulong[] pvector, ulong ic0)
        {
            var maxis = new List<ulong>();
            for (int length = this.dimensions.Length, i = 1; i < length; ++i)
            {
                var dimension = this.dimensions[i];
                var p = pvector[i];
                var pass = dimension.GetPass((int)p);
                maxis.Add(pass.TickCount - 1);
            }
            return Utility.FromC0(maxis.ToArray(), ic0);
        }

        protected ulong _ic0_from_vector(ulong[] pvector, ulong[] ivector)
        {
            var maxis = new List<ulong>();
            for (int length = this.dimensions.Length, i = 0; i < length; ++i)
            {
                var dimension = this.dimensions[i];
                var p = pvector[i];
                var pass = dimension.GetPass((int)p);
                maxis.Add(pass.TickCount - 1);
            }

            return Utility.ToC0(maxis.ToArray(), ivector);
        }
        #endregion

		#region Static members
		public static readonly ISpace Empty = new Space(new IDimension[] { });
        #endregion

        #region Fields
        protected IDimension[] dimensions;
		protected SpaceIterationPlan spaceIterationPlan;
		#endregion
	}
}
