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
    public enum EPassHitTestHint
	{
		/// <summary>
		/// Will use the dimension epsilon and fail, if there is no tick in the epsilon orbit around the value. This effectively delegates the hit testing to the next pass (in-depth, i.e. vertically).
		/// </summary>
		VerticalScan,
		/// <summary>
		/// Will look for a tick within the pass only (i.e. horizontally).
		/// </summary>
		HorizontalScan,
	}
}
