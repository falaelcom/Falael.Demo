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
	public class SpatialStorage_Unsafe<ValueT> where ValueT : struct
	{
		public SpatialStorage_Unsafe(FileSystem fileSystem, SpatialStorageIndex spatialStorageIndex)
		{
			this.fileSystem = fileSystem;
			this.spatialStorageIndex = spatialStorageIndex;

			this.dbInfo = this.ReadDbInfo();
		}

		public void SetAt(decimal[] vvector, ValueT value, EDimensionHitTestHint dimensionHitTestHint)
		{
			var hitTestResult = this.spatialStorageIndex.HitTest(vvector, dimensionHitTestHint);
			if (!hitTestResult.Success)
			{
				throw new ArgumentException("Cannot hit test vvector", "vvector");
			}

			bool hasChanged = false;
			if (this.dbInfo.First.CompareTo(hitTestResult.SpaceIterator) > 0)
			{
				this.dbInfo.First = hitTestResult.SpaceIterator;
				hasChanged = true;
			}
			if (this.dbInfo.Last.CompareTo(hitTestResult.SpaceIterator) < 0)
			{
				this.dbInfo.Last = hitTestResult.SpaceIterator;
				hasChanged = true;
			}
			if(hasChanged)
			{
				this.WriteDbInfo(this.dbInfo);
			}

			ulong dataOffset = this.fileSystem.Append<ValueT>(DataFileName, value);
            var indexEntry = new IndexEntry
            {
                flags = EIndexEntryFlagsByte.Set,
                offset = dataOffset,
            };
            this.fileSystem.WriteAt(hitTestResult.Path, hitTestResult.Offset, indexEntry);
		}
		public ValueT? GetAt(decimal[] vvector, EDimensionHitTestHint dimensionHitTestHint)
		{
			var hitTestResult = this.spatialStorageIndex.HitTest(vvector, dimensionHitTestHint);
			if (!hitTestResult.Success)
			{
				throw new ArgumentException("Cannot hit test vvector", "vvector");
			}

            IndexEntry? indexEntry = this.fileSystem.ReadAt<IndexEntry>(hitTestResult.Path, hitTestResult.Offset);
			if (indexEntry == null)
			{
				return null;
			}
            if(!indexEntry.Value.flags.HasFlag(EIndexEntryFlagsByte.Set))
            {
                return null;
            }
			return this.fileSystem.ReadAt<ValueT>(DataFileName, indexEntry.Value.offset);
		}

		protected DbInfo ReadDbInfo()
		{
			return this.fileSystem.EnsureReadAt<DbInfo>(DbInfoFileName, 0, DbInfo.Default);
		}
		protected void WriteDbInfo(DbInfo dbInfo)
		{
			this.fileSystem.WriteAt<DbInfo>(DbInfoFileName, 0, dbInfo);
		}

		public FileSystem FileSystem
		{
			get
			{
				return this.fileSystem;
			}
		}
		public SpatialStorageIndex SpatialStorageIndex
		{
			get
			{
				return this.spatialStorageIndex;
			}
		}

		public SpaceIterator FirstSpaceIterator
		{
			get
			{
				return this.dbInfo.First;
			}
		}
		public SpaceIterator LastSpaceIterator
		{
			get
			{
				return this.dbInfo.Last;
			}
		}

		public const string DbInfoFileName = "db.info";
		public const string DataFileName = "data.array";

		FileSystem fileSystem;
		SpatialStorageIndex spatialStorageIndex;

		DbInfo dbInfo;
	}
}
