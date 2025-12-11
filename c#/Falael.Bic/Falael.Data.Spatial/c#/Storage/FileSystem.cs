// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Falael.IO;

namespace Falael.Data.Spatial.Storage
{
	//	struct serialization - https://www.codeproject.com/Questions/58018/Convert-Object-Struct-to-byte-without-serializatio
	//	ISerializable - https://msdn.microsoft.com/en-us/library/system.runtime.serialization.iserializable(v=vs.110).aspx
	public class FileSystem
	{
		public FileSystem(string path)
		{
			this.path = path;
		}

		public void Whipe(bool ignoreErrors = false)
		{
			if(ignoreErrors)
			{
				try
				{
					Directory.Delete(this.path, true);
				}
				catch { }
				return;
			}
			Directory.Delete(this.path, true);
		}

        public FsFileLock GetLock(string pegFileName)
        {
            string path = GetFullPath(this.path, pegFileName);
            EnsurePath(path);

            return new FsFileLock(path: path, lockOptions: new FsLockOptions(conflictStrategy: EFsConflictStrategy.Wait));
        }

        public ulong Append<T>(string localPath, T value) where T : struct
		{
			ulong result = 0;
			string path = GetFullPath(this.path, localPath);
			EnsurePath(path);
			FileInfo fileInfo = new FileInfo(path);
			if(fileInfo.Exists)
			{
				result = (ulong)fileInfo.Length;
			}
			using (FileStream fileStream = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read))
			{
				WriteStruct<T>(fileStream, value);
			}
			return result;
		}

		public void WriteAt<T>(string localPath, ulong offset, T value) where T : struct
		{
			string path = GetFullPath(this.path, localPath);
			EnsurePath(path);

			long fileSize = 0;
			FileInfo fileInfo = new FileInfo(path);
			if (fileInfo.Exists)
			{
				fileSize = fileInfo.Length;
			}
			long delta = (long)offset - fileSize;
			if (delta > 0)
			{
				using (FileStream fileStream = new FileStream(path, FileMode.OpenOrCreate, FileAccess.Write, FileShare.Read))
				{
                    EnsureFillSize(fileStream, delta, 0);
                    WriteStruct<T>(fileStream, value);
				}
			}
			else if (delta == 0)
			{
				using (FileStream fileStream = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read))
				{
					WriteStruct<T>(fileStream, value);
				}
			}
			else
			{
				using (FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.Write, FileShare.Read))
				{
					fileStream.Seek((long)offset, SeekOrigin.Begin);
					WriteStruct<T>(fileStream, value);
				}
			}
		}

        public void WriteAt<T>(FsFileLock fileLock, ulong offset, T value) where T : struct
        {
            long fileSize = fileLock.FileStream.Length;
            long delta = (long)offset - fileSize;
            if (delta > 0)
            {
                EnsureFillSize(fileLock.FileStream, delta, 0);
                WriteStruct<T>(fileLock.FileStream, value);
            }
            else if (delta == 0)
            {
                fileLock.FileStream.Seek(0, SeekOrigin.End);
                WriteStruct<T>(fileLock.FileStream, value);
            }
            else
            {
                fileLock.FileStream.Seek((long)offset, SeekOrigin.Begin);
                WriteStruct<T>(fileLock.FileStream, value);
            }
        }

        public T? ReadAt<T>(string localPath, ulong offset) where T : struct
		{
			string path = GetFullPath(this.path, localPath);

			FileInfo fileInfo = new FileInfo(path);
			if (!fileInfo.Exists)
			{
				return null;
			}
            var delta = (long)offset - fileInfo.Length;
            if (delta >= 0)
			{
				return null;
			}
			using (FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
			{
				fileStream.Seek((long)offset, SeekOrigin.Begin);
				return ReadStruct<T>(fileStream);
			}
		}

		public T EnsureReadAt<T>(string localPath, ulong offset, T defaultValue) where T : struct
		{
			string path = GetFullPath(this.path, localPath);
			EnsurePath(path);

			long fileSize = 0;
			FileInfo fileInfo = new FileInfo(path);
			if (fileInfo.Exists)
			{
				fileSize = fileInfo.Length;
			}
			long delta = (long)offset - fileSize;
			if (delta >= 0)
			{
				using (FileStream fileStream = new FileStream(path, FileMode.OpenOrCreate, FileAccess.Write, FileShare.Read))
				{
                    EnsureFillSize(fileStream, delta, 0);

					fileStream.Seek((long)offset, SeekOrigin.Begin);
					WriteStruct<T>(fileStream, defaultValue);
				}
				return defaultValue;
			}
			using (FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
			{
				fileStream.Seek((long)offset, SeekOrigin.Begin);
				return ReadStruct<T>(fileStream);
			}
		}

        public T EnsureReadAt<T>(FsFileLock fileLock, ulong offset, T defaultValue) where T : struct
        {
            long fileSize = fileLock.FileStream.Length;
            long delta = (long)offset - fileSize;
            if (delta >= 0)
            {
                EnsureFillSize(fileLock.FileStream, delta, 0);

                fileLock.FileStream.Seek((long)offset, SeekOrigin.Begin);
                WriteStruct<T>(fileLock.FileStream, defaultValue);
                return defaultValue;
            }
            fileLock.FileStream.Seek((long)offset, SeekOrigin.Begin);
            return ReadStruct<T>(fileLock.FileStream);
        }

        static void EnsurePath(string path)
		{
			string directoryName = System.IO.Path.GetDirectoryName(path);
			if(!Directory.Exists(directoryName))
			{
				Directory.CreateDirectory(directoryName);
			}
		}

		static string GetFullPath(string rootPath, string relativePath)
		{
			if(System.IO.Path.IsPathRooted(relativePath))
			{
				throw new ArgumentException("Must be a relative path", "relativePath");
			}
			return System.IO.Path.Combine(rootPath, relativePath);
		}

		static T ReadStruct<T>(Stream Stream) where T : struct
		{
			int length = Marshal.SizeOf(typeof(T));
			byte[] bytes = new byte[length];
			Stream.Read(bytes, 0, length);
			IntPtr handle = Marshal.AllocHGlobal(length);
			Marshal.Copy(bytes, 0, handle, length);
			T result = (T)Marshal.PtrToStructure(handle, typeof(T));
			Marshal.FreeHGlobal(handle);
			return result;
		}

		static void WriteStruct<T>(Stream stream, T value) where T : struct
		{
			int length = Marshal.SizeOf(typeof(T));
			byte[] bytes = new byte[length];
			IntPtr handle = Marshal.AllocHGlobal(length);
			Marshal.StructureToPtr(value, handle, true);
			Marshal.Copy(handle, bytes, 0, length);
			Marshal.FreeHGlobal(handle);
			stream.Write(bytes, 0, length);
		}

        static void EnsureFillSize(Stream stream, long length, byte fill)
        {
            stream.Seek(0, SeekOrigin.End);
            if (length <= 0)
            {
                return;
            }
            for (long i = 0; i < length; ++i)
            {
                stream.WriteByte(fill);
            }
        }

		public string Path
		{
			get
			{
				return this.path;
			}
		}

		string path;
	}
}
