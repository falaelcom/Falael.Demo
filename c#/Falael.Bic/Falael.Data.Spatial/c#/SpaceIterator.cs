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
    public class SpaceIterator : IComparable
    {
        public SpaceIterator(int ipi, ulong ic0)
        {
            this.ipi = ipi;
            this.ic0 = ic0;
        }

		#region IComparable
		public int CompareTo(object obj)
		{
			if (obj == null)
			{
				return -1;
			}
			SpaceIterator right = (SpaceIterator)obj;
			if(this.ipi == right.ipi)
			{
				return Math.Sign((long)this.ic0 - (long)right.ic0);
			}
			return this.ipi - right.ipi;
		}
		#endregion

		public override string ToString()
		{
			return string.Format("Space iterator: ipi={0}, ic0={1}", this.ipi, this.ic0);
		}

		public override bool Equals(object obj)
		{
			if (obj == null)
			{
				return false;
			}
			SpaceIterator right = (SpaceIterator)obj;
			return this.ipi == right.ipi && this.ic0 == right.ic0;
		}

		public override int GetHashCode()
		{
			return this.ipi.GetHashCode() ^ this.ic0.GetHashCode();
		}

		public int Ipi
        {
            get
            {
                return this.ipi;
            }
        }
        public ulong Ic0
        {
            get
            {
                return this.ic0;
            }
        }

        int ipi;
        ulong ic0;
	}
}
