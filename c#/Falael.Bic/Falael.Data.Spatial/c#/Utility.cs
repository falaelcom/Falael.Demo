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
    public static class Utility
    {
        public static ulong ToC0(ulong[] maxs, ulong[] values)
        {
            if (values.Length != maxs.Length)
            {
                throw new ArgumentException();
            }

            ulong c = 0;
            for (int length = values.Length, i = 0; i < length; ++i)
            {
                c = (maxs[i] + 1) * c + values[i];
            }

            return c;
        }

        public static ulong[] FromC0(ulong[] maxs, ulong c0)
        {
            var result = new List<ulong>();
            ulong c = c0;
            for (int length = maxs.Length, i = length - 1; i >= 0; --i)
            {
                var max = maxs[i];
                var v = c % (max + 1);
                c = (c - v) / (max + 1);
                result.Insert(0, v);
            }

            result.Insert(0, c);
            return result.ToArray();
        }

        public static int LexigoraphicCompare(ulong[] left, ulong[] right)
        {
            for (int length = left.Length, i = 0; i < length; ++i)
            {
                var delta = (int)((long)left[i] - (long)right[i]);
                if (delta != 0)
                {
                    return delta;
                }
            }
            return 0;
        }
    }
}
