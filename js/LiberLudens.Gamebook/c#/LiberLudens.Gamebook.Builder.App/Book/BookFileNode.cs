using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Falael;
using Falael.Dom;
using Falael.Collections;

namespace LiberLudens.Gamebook.Builder.Book
{
    public class BookFileNode<IDT> : Node<IDT>
	{
		public BookFileNode(Document<IDT> document, string path)
			: base(document)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path");
			}

			this.path = path;
		}


		public string Path
		{
			get
			{
				return this.path;
			}
		}

		public string Directory
		{
			get
			{
				return System.IO.Path.GetDirectoryName(this.path);
			}
		}

		public string FullName
		{
			get
			{
				return System.IO.Path.GetFileName(this.path);
			}
		}

		public string Name
		{
			get
			{
				return System.IO.Path.GetFileNameWithoutExtension(this.path);
			}
		}

		public string Extension
		{
			get
			{
				return System.IO.Path.GetExtension(this.path);
			}
		}

		public EBookFileType BookFileType
		{
			get
			{
				switch (this.Extension.ToLower())
				{
					case ".css":
						return EBookFileType.Css;
					case ".html":
						return EBookFileType.Html;
					case ".ico":
						return EBookFileType.Ico;
					case ".js":
						return EBookFileType.JavaScript;
					case ".jpeg":
					case ".jpg":
						return EBookFileType.Jpeg;
					case ".json":
						return EBookFileType.Json;
					case ".png":
						return EBookFileType.Png;
					case ".txt":
						if (!this.Name.ToLower().StartsWith("resource-") &&
							!this.Name.ToLower().StartsWith("room-"))
						{
							return EBookFileType.DocText;
						}
						return EBookFileType.RoomText;
					case ".xhtml":
						return EBookFileType.Xhtml;
					default:
						return EBookFileType.Unsupported;
				}
			}
		}

		string path;
	}
}
