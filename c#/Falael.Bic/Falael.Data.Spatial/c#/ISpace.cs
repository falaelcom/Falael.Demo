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
    public interface ISpace
	{
		SpaceHitTestResult HitTest(decimal[] vvector, EDimensionHitTestHint hitTestHint);
		decimal[] GetAt(SpaceIterator spaceIterator);
		SpaceIterator First();
		SpaceIterator Next(SpaceIterator spaceIterator);
		ulong CountSpaceIteratorTicks(SpaceIterator spaceIterator);

		IDimension[] Dimensions { get; }
        ulong TickCount { get; }
		bool IsEmpty { get; }
	}
}
