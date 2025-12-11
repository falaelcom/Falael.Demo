// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

namespace Falael.Data.Spatial.Storage
{
	public class SpatialStorageIndex
	{
		public SpatialStorageIndex(ISpace space)
		{
			this.space = space;
		}

		public class HitTestResult
		{
			public HitTestResult(bool success, string path, ulong offset, SpaceIterator spaceIterator)
			{
				this.success = success;
				this.path = path;
				this.offset = offset;
				this.spaceIterator = spaceIterator;
			}

			public bool Success
			{
				get
				{
					return this.success;
				}
			}
			public string Path
			{
				get
				{
					return this.path;
				}
			}
			public ulong Offset
			{
				get
				{
					return this.offset;
				}
			}
			public SpaceIterator SpaceIterator
			{
				get
				{
					return this.spaceIterator;
				}
			}

			public static readonly HitTestResult Fail = new HitTestResult(false, null, 0, null);

			bool success;
			string path;
			ulong offset;
			SpaceIterator spaceIterator;
		}

		public HitTestResult HitTest(decimal[] vvector, EDimensionHitTestHint dimensionHitTestHint)
		{
			var hitTestResult = this.space.HitTest(vvector, dimensionHitTestHint);
			if (!hitTestResult.Success)
			{
				return HitTestResult.Fail;
			}
			return new HitTestResult(true, hitTestResult.SpaceIterator.Ipi.ToString() + IndexFileExtension, hitTestResult.SpaceIterator.Ic0 * IndexEntry.Size, hitTestResult.SpaceIterator);
		}

		public ISpace Space
		{
			get
			{
				return this.space;
			}
		}

		public const string IndexFileExtension = ".index";

		ISpace space;
	}
}
