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
	public struct DbInfo
	{
		[FieldOffset(0)] public int firstSpaceIteratorIpi;		//	size 4
		[FieldOffset(4)] public ulong firstSpaceIteratorIc0;  //	size 8
		[FieldOffset(12)]public int lastSpaceIteratorIpi;		//	size 4
		[FieldOffset(16)]public ulong lastSpaceIteratorIc0;   //	size 8

		public SpaceIterator First
		{
			get
			{
				return new SpaceIterator(this.firstSpaceIteratorIpi, this.firstSpaceIteratorIc0);
			}
			set
			{
				this.firstSpaceIteratorIpi = value.Ipi;
				this.firstSpaceIteratorIc0 = value.Ic0;
			}
		}
		public SpaceIterator Last
		{
			get
			{
				return new SpaceIterator(this.lastSpaceIteratorIpi, this.lastSpaceIteratorIc0);
			}
			set
			{
				this.lastSpaceIteratorIpi = value.Ipi;
				this.lastSpaceIteratorIc0 = value.Ic0;
			}
		}

		public static DbInfo Default = new DbInfo();
	}
}
