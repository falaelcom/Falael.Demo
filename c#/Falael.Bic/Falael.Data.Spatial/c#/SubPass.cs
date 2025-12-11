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
    public class SubPass : IPass
	{
        #region Constructors
        public SubPass(IPass superPass, decimal n1, decimal n2, ulong totalTickCount)
        {
            if (n2 < n1)
            {
                throw new ArgumentException();
            }

			this.superPass = superPass;

			var firstTickHitTestResult = superPass.HitTest(n1, EDimensionHitTestHint.NearestRight, EPassHitTestHint.HorizontalScan);
			if(!firstTickHitTestResult.Success)
			{
				throw new ArgumentException();
			}
			this.firstSuperTickI = firstTickHitTestResult.I;
			this.n1 = firstTickHitTestResult.V;

			var lastTickHitTestResult = superPass.HitTest(n2, EDimensionHitTestHint.NearestLeft, EPassHitTestHint.HorizontalScan);
			if (!lastTickHitTestResult.Success)
			{
				throw new ArgumentException();
			}
			this.lastSuperTickI = lastTickHitTestResult.I;
			this.n2 = lastTickHitTestResult.V;

			this.tickCount = this.lastSuperTickI - this.firstSuperTickI + 1;
			this.totalTickCount = totalTickCount + this.tickCount;
		}
		#endregion

		#region IPass
		public decimal GetAt(ulong i)
		{
			return this.superPass.GetAt(this.firstSuperTickI + i);
		}
		public DimensionHitTestResult HitTest(decimal v, EDimensionHitTestHint dimensionHitTestHint, EPassHitTestHint passHitTestHint)
		{
			var superHitTestResult = this.superPass.HitTest(v, dimensionHitTestHint, passHitTestHint);
			if(!superHitTestResult.Success)
			{
				return DimensionHitTestResult.Fail;
			}

			long i = (long)superHitTestResult.I - (long)this.firstSuperTickI;
			if(i < 0 || i >= (long)this.tickCount)
			{
				return DimensionHitTestResult.Fail;
			}

			return new DimensionHitTestResult(
				true,
				superHitTestResult.P,
				(ulong)i,
				superHitTestResult.V
			);
		}
		public decimal[] QueryTicks(decimal v1, decimal v2)
		{
			return this.superPass.QueryTicks(v1, v2);
		}
		public decimal[] QueryAllTicks()
		{
			return this.superPass.QueryTicks(this.n1, this.n2);
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
				return this.superPass.Step;
			}
		}
		#endregion

        #region Properties
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
		#endregion

		#region Fields
		IPass superPass;
		decimal n1;
        decimal n2;

		ulong totalTickCount;
        ulong tickCount;

		ulong firstSuperTickI;
		ulong lastSuperTickI;
		#endregion
	}
}
