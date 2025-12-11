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
    public class FragmentedSubDimension : FragmentedDimension
	{
        #region Constructors
        public FragmentedSubDimension(IDimension superDimension, decimal n1, decimal n2)
		{
			if (n2 < n1)
			{
				throw new ArgumentException();
			}

			if (n1 < superDimension.N1)
			{
				throw new ArgumentException();
			}
			if (n2 > superDimension.N2)
			{
				throw new ArgumentException();
			}

			var firstTickHitTestResult = superDimension.HitTest(n1, EDimensionHitTestHint.NearestRight);
			if (!firstTickHitTestResult.Success)
			{
				throw new ArgumentException();
			}

			var lastTickHitTestResult = superDimension.HitTest(n2, EDimensionHitTestHint.NearestLeft);
			if (!lastTickHitTestResult.Success)
			{
				throw new ArgumentException();
			}

			this.n1 = firstTickHitTestResult.V;
			this.n2 = lastTickHitTestResult.V;

            this.superDimension = superDimension;

			ulong totalTickCount = 0;
			List<IPass> passes = new List<IPass>();
			for (int maxp = this.superDimension.Maxp, p = 0; p <= maxp; ++p)
			{
				var superPass = this.superDimension.GetPass(p);
				var subPass = new SubPass(superPass, this.n1, this.n2, totalTickCount);
				passes.Add(subPass);
				totalTickCount = subPass.TotalTickCount;
			}

			this.passes = passes.ToArray();
		}
        #endregion

        #region Properties
        public IDimension SuperDimension
        {
            get
            {
                return this.superDimension;
            }
        }
        #endregion

        #region Fields
        IDimension superDimension;
        #endregion
    }
}
