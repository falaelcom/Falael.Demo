using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

using Falael.Async;
using Falael.Diagnostics;
using Falael.Mirror;

namespace Falael.Core.Fs.Mirror
{
    public class FsScanner
    {
        #region Constructors
        public FsScanner()
        {
        }
        #endregion

        #region Nested types - configuration
        public class Configuration
        {
            public string path;
            public bool recursive = true;
            public string filter = string.Empty;
            public NotifyFilters notifyFilters = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName | NotifyFilters.Security;
        }
        #endregion

    }
}
