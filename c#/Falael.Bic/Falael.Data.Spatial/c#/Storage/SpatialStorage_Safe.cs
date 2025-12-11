// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Falael.IO;

namespace Falael.Data.Spatial.Storage
{
	public class SpatialStorage_Safe<ValueT> where ValueT : struct
	{
		public SpatialStorage_Safe(FileSystem fileSystem, SpatialStorageIndex spatialStorageIndex)
		{
			this.fileSystem = fileSystem;
			this.spatialStorageIndex = spatialStorageIndex;
		}

		public void SetAt(decimal[] vvector, ValueT value, EDimensionHitTestHint dimensionHitTestHint)
		{
			var hitTestResult = this.spatialStorageIndex.HitTest(vvector, dimensionHitTestHint);
			if (!hitTestResult.Success)
			{
				throw new ArgumentException("Cannot hit test vvector", "vvector");
			}

            using (var fsFileLock = this.fileSystem.GetLock(DbInfoFileName))
            {
                var dbInfo = this.ReadDbInfo(fsFileLock);

                bool hasChanged = false;
                if (dbInfo.First.CompareTo(hitTestResult.SpaceIterator) > 0)
                {
                    dbInfo.First = hitTestResult.SpaceIterator;
                    hasChanged = true;
                }
                if (dbInfo.Last.CompareTo(hitTestResult.SpaceIterator) < 0)
                {
                    dbInfo.Last = hitTestResult.SpaceIterator;
                    hasChanged = true;
                }
                if (hasChanged)
                {
                    this.WriteDbInfo(fsFileLock, dbInfo);
                }

                ulong dataOffset = this.fileSystem.Append<ValueT>(DataFileName, value);
                var indexEntry = new IndexEntry
                {
                    flags = EIndexEntryFlagsByte.Set,
                    offset = dataOffset,
                };
                this.fileSystem.WriteAt(hitTestResult.Path, hitTestResult.Offset, indexEntry);
            }
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
            if (!indexEntry.Value.flags.HasFlag(EIndexEntryFlagsByte.Set))
            {
                return null;
            }
            return this.fileSystem.ReadAt<ValueT>(DataFileName, indexEntry.Value.offset);
		}

		protected DbInfo ReadDbInfo(FsFileLock fsFileLock)
		{
			return this.fileSystem.EnsureReadAt<DbInfo>(fsFileLock, 0, DbInfo.Default);
		}
		protected void WriteDbInfo(FsFileLock fsFileLock, DbInfo dbInfo)
		{
			this.fileSystem.WriteAt<DbInfo>(fsFileLock, 0, dbInfo);
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
                using (var fsFileLock = this.fileSystem.GetLock(DbInfoFileName))
                {
                    return this.ReadDbInfo(fsFileLock).First;
                }
			}
		}
		public SpaceIterator LastSpaceIterator
		{
			get
			{
                using (var fsFileLock = this.fileSystem.GetLock(DbInfoFileName))
                {
                    return this.ReadDbInfo(fsFileLock).Last;
                }
			}
		}

		public const string DbInfoFileName = "db.info";
		public const string DataFileName = "data.array";

		FileSystem fileSystem;
		SpatialStorageIndex spatialStorageIndex;
	}
}
