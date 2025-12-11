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
    public class DimensionHitTestResult
    {
        public DimensionHitTestResult(bool success, int p, ulong i, decimal v)
        {
            this.success = success;
            this.p = p;
            this.i = i;
			this.v = v;
		}

        public bool Success
        {
            get
            {
                return this.success;
            }
        }
        public int P
        {
            get
            {
                return this.p;
            }
        }
        public ulong I
        {
            get
            {
                return this.i;
            }
        }
		public decimal V
		{
			get
			{
				return this.v;
			}
		}

		public static readonly DimensionHitTestResult Fail = new DimensionHitTestResult(false, 0, 0, 0);

        bool success;
        int p;
        ulong i;
		decimal v;
	}
}
