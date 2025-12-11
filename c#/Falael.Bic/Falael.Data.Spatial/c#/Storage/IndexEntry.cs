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
	[StructLayout(LayoutKind.Explicit, Pack = 1)]
	public struct IndexEntry
    {
		[FieldOffset(0)] public EIndexEntryFlagsByte flags;		//	size 1
		[FieldOffset(1)] public ulong offset;                 //	size 8

		public const ulong Size = 9;
    }
}
