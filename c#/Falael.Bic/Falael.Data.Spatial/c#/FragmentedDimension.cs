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
    public abstract class FragmentedDimension : IDimension
    {
        #region Constructors
        public FragmentedDimension(decimal n1, decimal n2)
        {
            if (n2 < n1)
            {
                throw new ArgumentException();
            }

            this.n1 = n1;
            this.n2 = n2;
        }

		protected FragmentedDimension()
		{
		}
		#endregion

		#region IDimension
		public virtual IPass GetPass(int p)
        {
            if (p > this.passes.Length)
            {
                throw new ArgumentOutOfRangeException("p");
            }
            return this.passes[p];
        }
        public virtual DimensionHitTestResult HitTest(decimal v, EDimensionHitTestHint hitTestHint)
        {
            for (ulong length = (ulong)this.passes.Length, p = 0; p < length; ++p)
            {
				bool isBottom = (p == length - 1);
				var result = this.passes[p].HitTest(v, hitTestHint, isBottom ? EPassHitTestHint.HorizontalScan : EPassHitTestHint.VerticalScan);
                if (result.Success)
                {
                    return result;
                }
            }
            return DimensionHitTestResult.Fail;
        }
		public virtual decimal[][] QueryTicks(decimal v1, decimal v2)
		{
			var result = new List<decimal[]>();
			for (ulong length = (ulong)this.passes.Length, p = 0; p < length; ++p)
			{
				result.Add(this.passes[p].QueryTicks(v1, v2));
			}
			return result.ToArray();
		}
		public virtual decimal[][] QueryAllTicks()
        {
			return this.QueryTicks(this.n1, this.n2);
        }

        public int Maxp
        {
            get
            {
                return this.passes.Length - 1;
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

        public ulong TotalTickCount
        {
            get
            {
                return this.passes.Last().TotalTickCount;
            }
        }
		#endregion

		#region Fields
		protected decimal n1;
		protected decimal n2;

		protected IPass[] passes;
        #endregion
    }
}
