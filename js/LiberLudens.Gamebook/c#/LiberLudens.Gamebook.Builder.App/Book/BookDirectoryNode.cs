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
    public class BookDirectoryNode<IDT> : Node<IDT>
    {
		public BookDirectoryNode(Document<IDT> document, string path)
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

		public string ParentDirectory
		{
			get
			{
				return System.IO.Path.GetDirectoryName(this.path);
			}
		}

		public string Name
		{
			get
			{
				return System.IO.Path.GetFileName(this.path);
			}
		}

		string path;
	}
}
