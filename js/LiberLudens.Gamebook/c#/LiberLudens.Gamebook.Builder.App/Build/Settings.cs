using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

using Falael;
using Falael.ExtensionMethods;

namespace LiberLudens.Gamebook.Builder.Build
{
    public class Settings
    {
        #region Field: BooksRootPath
        public static string BooksRootPath
        {
            get { return instance.booksRootPath; }
            set { instance.booksRootPath = value; }
        }
        public string booksRootPath
        {
            get
            {
                return this._booksRootPath;
            }
            set
            {
                if(this._booksRootPath == value)
                {
                    return;
                }
                this._booksRootPath = value;
                this.isDirty = true;
            }
        }
        string _booksRootPath = string.Empty;
        #endregion

        #region Field: SelectedBooks
        public static string[] SelectedBooks
        {
            get { return instance.selectedBooks; }
            set { instance.selectedBooks = value; }
        }
        public string[] selectedBooks
        {
            get
            {
                return this._selectedBooks;
            }
            set
            {
                if (this._selectedBooks.SetEquals(value, StringComparer.InvariantCultureIgnoreCase))
                {
                    return;
                }
                this._selectedBooks = value;
                this.isDirty = true;
            }
        }
        string[] _selectedBooks = new string[] { };
        #endregion

        #region Static members
        static Settings instance = new Settings();

        public static bool IsDirty
        {
            get
            {
                return instance.isDirty;
            }
        }

        public static void Load(string path)
        {
            string json = File.ReadAllText(path);
            var serializer = new JavaScriptSerializer();
            instance = serializer.Deserialize<Settings>(json);
            instance.isDirty = false;
        }

        public static void Save(string path)
        {
            if(!IsDirty)
            {
                return;
            }
            File.WriteAllText(path, Format.AsJson(instance, true));
            instance.isDirty = false;
        }

        public static void Create(string path)
        {
            if (File.Exists(path))
            {
                throw new IOException(string.Format("File already exists: \"{0}\".", path));
            }
            File.WriteAllText(path, Format.AsJson(instance, true));
            instance.isDirty = false;
        }
        #endregion

        #region Instance members
        bool isDirty = false;
        #endregion
    }
}
