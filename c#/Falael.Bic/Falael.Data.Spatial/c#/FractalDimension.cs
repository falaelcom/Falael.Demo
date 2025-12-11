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
    public class FractalDimension : FragmentedDimension
	{
        #region Constructors
        public FractalDimension(ulong frag, int maxp, decimal n1, decimal n2, Func<ulong, int, ulong> genfrag)
			: base(n1, n2)
        {
            if (frag < 2)
            {
                throw new ArgumentException("frag");
            }

            if (maxp < 1)
            {
                throw new ArgumentException("maxp");
            }

            this.frag = frag;
            this.maxp = maxp;
            this.genfrag = genfrag;

            ulong totalTickCount = 2;
            ulong curFrag = this.frag;
            List<IPass> passes = new List<IPass>();
            for (int p = 0; p <= this.maxp; ++p)
            {
                if (this.genfrag != null)
                {                                     
                    frag = this.genfrag(this.frag, p);
                }                                     
                var pass = new Pass(frag, this.n1, this.n2, p, totalTickCount);
                passes.Add(pass);                                              
                totalTickCount = pass.TotalTickCount;                          
            }
            this.passes = passes.ToArray();

            decimal epsilon = this.passes[this.passes.Length - 1].Step / 2m;
            decimal inflation = 1.01m;
            this.epsilon = inflation * epsilon; //	inflate a bit to mitigate the js floating point error

            for (int length = this.passes.Length, i = 0; i < length; ++i)
            {
                ((Pass)passes[i]).SetEpsilon(this.epsilon);
            }
        }
        public FractalDimension(ulong frag, int maxp, decimal n1, decimal n2)
            : this(frag, maxp, n1, n2, null)
        {
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
        #endregion

        #region Fields
        ulong frag;
        int maxp;
        Func<ulong, int, ulong> genfrag;

        decimal epsilon;
        #endregion
    }
}
