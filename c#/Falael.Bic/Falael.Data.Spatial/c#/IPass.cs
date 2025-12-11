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
	public interface IPass
	{
		decimal GetAt(ulong i);
		DimensionHitTestResult HitTest(decimal v, EDimensionHitTestHint dimensionHitTestHint, EPassHitTestHint passHitTestHint);
		decimal[] QueryTicks(decimal v1, decimal v2);
		decimal[] QueryAllTicks();

		ulong TotalTickCount { get; }
		ulong TickCount { get; }
		decimal Step { get; }
	}
}
