// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial.Storage
{
    [Flags]
    public enum EIndexEntryFlagsByte : byte
    {
		Empty = 0,
        Set = 1,
	}
}
