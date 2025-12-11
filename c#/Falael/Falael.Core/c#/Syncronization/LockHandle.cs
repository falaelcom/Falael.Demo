using System.Diagnostics;

namespace Falael.Core.Syncronization
{
	public class LockHandle
	{
		LockHandle(string fullFilePath, FileStream fileStream, Guid id, string holderName)
		{
			this.FullFilePath = fullFilePath;
			this.FileStream = fileStream;
			this.Id = id;
			this.HolderName = holderName;
		}

		#region Nested Types

		public class Options
		{
			public FileAccess FileAccess { get; set; } = FileAccess.ReadWrite;
			public FileMode FileMode { get; set; } = FileMode.OpenOrCreate;
			public FileShare FileShare { get; set; } = FileShare.None;
			public string FullFilePath { get; set; } = string.Empty;
			public TimeSpan Timeout { get; set; } = TimeSpan.Zero;
			public TimeSpan PollingInterval { get; set; } = TimeSpan.Zero;
		}

		#endregion

		public static async Task<LockHandle> AcquireAsync(Guid id, string holderName, Options options)
		{
			LockHandle result;

			if (options.Timeout == TimeSpan.Zero || options.PollingInterval == TimeSpan.Zero)
			{
				result = new LockHandle(options.FullFilePath, new FileStream(options.FullFilePath, options.FileMode, FileAccess.ReadWrite, options.FileShare), id, holderName);
				lock (allLockHandles)
				{
					allLockHandles.Add(result);
				}
				return result;
			}

			DateTime timeoutTime = DateTime.Now.Add(options.Timeout);
			FileStream? fileStream = null;

			while (DateTime.Now < timeoutTime)
			{
				try
				{
					fileStream = new FileStream(options.FullFilePath, options.FileMode, options.FileAccess, options.FileShare);
					break;
				}
				catch (IOException ex)
				{
					Debug.WriteLine(ex);
					var delayMs = Random.Shared.Next((int)Math.Round(options.PollingInterval.TotalMilliseconds / 2f), (int)Math.Round(3 * options.PollingInterval.TotalMilliseconds / 2f));
					await Task.Delay(delayMs);
				}
			}

			if (fileStream == null)
			{
				LockHandle? currentLockHandle;
				lock (allLockHandles)
				{
					currentLockHandle = allLockHandles.FirstOrDefault(v => v.FullFilePath.Equals(options.FullFilePath, StringComparison.CurrentCultureIgnoreCase));
				}
				throw new TimeoutException($"[{id}] {holderName}: Unable to acquire lock on file \"{options.FullFilePath}\" within the given timeout. Lock is been currently held by [{currentLockHandle?.Id}] {currentLockHandle?.HolderName}.");
			}

			result = new LockHandle(options.FullFilePath, fileStream, id, holderName);
			lock (allLockHandles)
			{
				allLockHandles.Add(result);
			}
			return result;
		}

		public static bool TryGetById(Guid id, out LockHandle? outcome)
		{
			lock (allLockHandles)
			{
				outcome = allLockHandles.FirstOrDefault(v => v.Id == id);
				return outcome != null;
			}
		}

		public void Release()
		{
			lock (allLockHandles)
			{
				allLockHandles.Remove(this);
			}
			this.FileStream.Close();
		}

		public static void Release(string fullFilePath)
		{
			lock (allLockHandles)
			{
				allLockHandles.RemoveAll(v =>
				{
					if (v.FullFilePath == fullFilePath)
					{
						v.FileStream.Close();
						return true;// remove the item from the list
					}
					return false;   // keep the item in the list
				});
			}
		}

		public static int Count(string fullFilePath)
		{
			lock (allLockHandles)
			{
				return allLockHandles.Count(v => v.FullFilePath == fullFilePath);
			}
		}

		public static string[] HolderNames(string fullFilePath)
		{
			lock (allLockHandles)
			{
				return allLockHandles
					.Where(v => v.FullFilePath == fullFilePath)
					.Select(v => v.HolderName)
					.ToArray();
			}
		}


		readonly static List<LockHandle> allLockHandles = [];

		public FileStream FileStream { get; }
		public Guid Id { get; }
		public string HolderName { get; }
		public string FullFilePath { get; }
	}
}
