// R1Q2/daniel
//  - the assembly lacks features
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial
{
    public enum EDimensionHitTestHint
	{
		/// <summary>
		/// Hit test will succeed only if the value/vvector points to a tick's hit test epsilon area (should point directly to a tick, in case of decimal vvectors, but current c# implementation still uses a hit test epsilon)
		/// </summary>
		Precise,
		/// <summary>
		/// Hit test will succeed for every value/vvector that is within the definition range of the pass/dimenion/space, selecting the nearest tick (round)
		/// </summary>
		Nearest,
		/// <summary>
		/// Hit test will succeed for every value/vvector that is within the definition range of the pass/dimenion/space, selecting the nearest tick on the left (floor)
		/// </summary>
		NearestLeft,
		/// <summary>
		/// Hit test will succeed for every value/vvector that is within the definition range of the pass/dimenion/space, selecting the nearest tick on the right (ceiling)
		/// </summary>
		NearestRight,
	}
}
