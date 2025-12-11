// R1Q3/daniel
//	- doc
//	- dev
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Falael;
using Falael.Dom;
using Falael.Collections;

namespace LiberLudens.Gamebook.Builder.Book
{
    public class BookDocument<IDT> : Document<IDT>
    {
		#region Interface
		public void LoadDirectory(string path, Action<EBookDirectoryLoadingPass, int, int, string> progressCallback)
        {
			List<FileSystemEntry> fileSystemEntryCollector = new List<FileSystemEntry>();
			var directoryFileSystemEntry = new FileSystemEntry
			{
				fileSystemEntryType = EFileSystemEntryType.Directory,
				path = path,
				depth = 0,
				parent = null,
			};
			fileSystemEntryCollector.Add(new FileSystemEntry { fileSystemEntryType = EFileSystemEntryType.Directory, path = path });
			var relevantFileSystemEntryCount = 0;
			ListDirectory(path, fileSystemEntryCollector, directoryFileSystemEntry, 1, ref relevantFileSystemEntryCount);

			var fileCount = 0;
			Stack<Node<IDT>> directoryStack = new Stack<Node<IDT>>();
			directoryStack.Push(this.RootNode);
			for (int length = fileSystemEntryCollector.Count, i = 0, counter = 0; i < length; ++i)
			{
				var item = fileSystemEntryCollector[i];
				switch (item.fileSystemEntryType)
				{
					case EFileSystemEntryType.File:
						directoryStack.Peek().AddChild(new BookFileNode<IDT>(this, item.path));
						++counter;
						++fileCount;
						progressCallback(EBookDirectoryLoadingPass.Enumerate, counter, relevantFileSystemEntryCount, item.path);
						break;
					case EFileSystemEntryType.Directory:
						BookDirectoryNode<IDT> node = new BookDirectoryNode<IDT>(this, item.path);
						directoryStack.Peek().AddChild(node);
						directoryStack.Push(node);
						++counter;
						progressCallback(EBookDirectoryLoadingPass.Enumerate, counter, relevantFileSystemEntryCount, item.path);
						break;
					case EFileSystemEntryType.DirectoryUp:
						directoryStack.Pop();
						break;
					default:
						throw new NotImplementedException();
				}
			}
		}
		#endregion

		#region Infrastructure
		enum EFileSystemEntryType
		{
			File,
			Directory,
			DirectoryUp,
		}
		class FileSystemEntry
		{
			public EFileSystemEntryType fileSystemEntryType;
			public string path;
			public int depth;
			public FileSystemEntry parent;
		}

		static void ListDirectory(string path, List<FileSystemEntry> fileSystemEntryCollector, FileSystemEntry parent, int depth, ref int relevantFileSystemEntryCount)
		{
			var files = Directory.GetFiles(path, "*.*", SearchOption.TopDirectoryOnly);
			Array.Sort(files);
			for (int length = files.Length, i = 0; i < length; ++i)
			{
				string item = files[i];
				fileSystemEntryCollector.Add(new FileSystemEntry
				{
					fileSystemEntryType = EFileSystemEntryType.File,
					path = item,
					depth = depth,
					parent = parent,
				});
				++relevantFileSystemEntryCount;
			}

			var directories = Directory.GetDirectories(path, "*.*", SearchOption.TopDirectoryOnly);
			Array.Sort(directories);
			for (int length = directories.Length, i = 0; i < length; ++i)
			{
				var item = directories[i];
				var directoryFileSystemEntry = new FileSystemEntry
				{
					fileSystemEntryType = EFileSystemEntryType.Directory,
					path = item,
					depth = depth,
					parent = parent,
				};
				fileSystemEntryCollector.Add(directoryFileSystemEntry);
				++relevantFileSystemEntryCount;

				ListDirectory(item, fileSystemEntryCollector, directoryFileSystemEntry, depth + 1, ref relevantFileSystemEntryCount);

				directoryFileSystemEntry = new FileSystemEntry
				{
					fileSystemEntryType = EFileSystemEntryType.DirectoryUp,
					path = item,
					depth = depth,
					parent = parent,
				};
				fileSystemEntryCollector.Add(directoryFileSystemEntry);
			}
		}
		#endregion
	}
}
