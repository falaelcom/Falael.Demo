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
    public interface IDimension
    {
        IPass GetPass(int p);
        DimensionHitTestResult HitTest(decimal v, EDimensionHitTestHint hitTestHint);
		decimal[][] QueryTicks(decimal v1, decimal v2);
		decimal[][] QueryAllTicks();

        int Maxp { get; }
        decimal N1 { get; }
        decimal N2 { get; }

        ulong TotalTickCount { get; }
    }
}
