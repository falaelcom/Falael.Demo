using System.Diagnostics;

using static Falael.Core.Syncronization.LockHandle;

namespace Falael.Core.Syncronization
{
	public class Peg : FalaelContextAware, IDisposable
	{
		const ulong LGID = 0x9D7B4E;

		internal Peg(IFalaelContext coreContext, Guid id, string holderName, LockHandle lockHandle, bool retainLockHandle = false)
			: base(coreContext)
		{
			Debug.Assert(lockHandle != null);

			this.Id = id;
			this.HolderName = holderName;
			this.lockHandle = lockHandle;
			this.RetainLockHandle = retainLockHandle;

			this.start = DateTime.Now;
		}

		~Peg()
		{
			this.Dispose(false);
		}

		//	If `retainReusedLockHandle == true` and `lockId != null`, this method will try to look up an existing lock handle with the provided `lockId` and create a peg that will not release the handle on dispose; use this option only in cases when it's guaranteed that the life cycle of the lock handle is been managed by another higher-level method.
		public static async Task<Peg> Hold(IFalaelContext coreContext, string holderName, Options options, Guid? lockId = null, bool retainReusedLockHandle = false)
		{
			if (retainReusedLockHandle && lockId != null && TryGetById(lockId.Value, out LockHandle? existingLockHandle))
			{
				coreContext.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xD88893),
					$"[{lockId}] {holderName}: Peg lock handle reused", Path.GetFileName(options.FullFilePath),
					CL(options.FullFilePath)
				);
				return new Peg(coreContext, lockId.Value, holderName, existingLockHandle!, true);
			}

			var pegId = lockId ?? Guid.NewGuid();
#if DEBUG
			var count = Count(options.FullFilePath);
			if (count != 0)
			{
				var holders = string.Join(", ", HolderNames(options.FullFilePath));
				coreContext.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x8F9F6B),
					$"[{pegId}] {holderName}:", nameof(Peg), nameof(Hold), $"MULTIPLE LOCKS ({count}) ON", $"holders: [{holders}]", Path.GetFileName(options.FullFilePath),
					CL(options.FullFilePath)
				);
			}
#endif
			var lockHandle = await AcquireAsync(pegId, holderName, options);
			coreContext.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x9FA3E3),
				$"[{pegId}] {holderName}: Peg file held", Path.GetFileName(options.FullFilePath),
				CL(options.FullFilePath)
			);
			return new Peg(coreContext, pegId, holderName, lockHandle);
		}

		public void Dispose()
		{
			this.Dispose(true);
			GC.SuppressFinalize(this);
		}

		protected virtual void Dispose(bool disposing)
		{
			try
			{
				if (this.disposed) return;
				if (!disposing) return;

				Debug.Assert(this.lockHandle != null);
				var duration = DateTime.Now - this.start;
				if (this.RetainLockHandle)
				{
					this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xE8A584),
						$"[{this.Id}] {this.HolderName}: Peg reuse released after {duration}.", this.lockHandle.FullFilePath
					);
					return;
				}
				this.lockHandle.Release();
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x3EC185),
					$"[{this.Id}] {this.HolderName}: Peg file released after {duration}.", this.lockHandle.FullFilePath
				);
				this.lockHandle = null;
			}
			finally
			{
				this.disposed = true;
			}
		}

		public bool IsLocked
		{
			get
			{
				return this.lockHandle != null;
			}
		}

		public Guid Id { get; }
		public string HolderName { get; }
		public bool RetainLockHandle { get; }

		readonly DateTime start;

		LockHandle? lockHandle;
		bool disposed = false;
	}
}
