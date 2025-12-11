using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Falael
{
	public class ConfigurationLock : IDisposable
	{
		public ConfigurationLock(string configFilePath, bool create, bool exclusive)
		{
			this.ConfigFilePath = configFilePath;
			this.Create = create;
			this.Exclusive = exclusive;

			try
			{
				this.stream = new FileStream(this.ConfigFilePath, create ? FileMode.CreateNew : FileMode.Open, FileAccess.ReadWrite, this.Exclusive ? FileShare.Read : FileShare.ReadWrite);
			}
			catch (IOException ex)
			{
				if (ex is FileNotFoundException && !create) throw new FileNotFoundException($"Configuration file \"{this.ConfigFilePath}\" does not exist.", this.ConfigFilePath, ex);
				if (create && (File.Exists(this.ConfigFilePath) || ex.HResult == -2147024816)) throw new IOException($"Cannot create configuration file \"{this.ConfigFilePath}\" because it already exists.", ex);
				else if (IsFileLocked(ex)) throw new Exception("Configuration file is locked. For multiple application instances to run with the same configuration file, all instances must start with the -m, --multi-instance command line flag set.", ex);
				else throw;
			}

			bool IsFileLocked(IOException ex)
			{
				int errorCode = ex.HResult & 0xFFFF;
				if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) return errorCode == 32 || errorCode == 33;		// ERROR_SHARING_VIOLATION or ERROR_LOCK_VIOLATION
				else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux)) return errorCode == 11 || errorCode == 26;  // EWOULDBLOCK (11) or ETXTBSY (26) might indicate a locked file
				else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) return errorCode == 16;                       // EBUSY (16) might indicate a locked file
				return ex.Message.Contains("used by another process") || ex.Message.Contains("sharing violation") || ex.Message.Contains("lock violation");
			}

		}

		~ConfigurationLock()
		{
			this.Dispose(false);
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

				this.stream?.Dispose();
				this.stream = null;
			}
			finally
			{
				this.disposed = true;
			}
		}

		public string ReadAllText()
		{
			Debug.Assert(this.stream != null);

			this.stream.Position = 0;
			using StreamReader reader = new(this.stream, leaveOpen: true);
			return reader.ReadToEnd();
		}

		public void WriteAllText(string content)
		{
			Debug.Assert(this.stream != null);

			this.stream.SetLength(0);
			this.stream.Position = 0;
			using StreamWriter writer = new(this.stream, leaveOpen: true);
			writer.Write(content);
			writer.Flush();
		}

		public string ConfigFilePath { get; }
		public bool Create { get; }
		public bool Exclusive { get; }

		FileStream? stream;
		bool disposed = false;
	}
}
