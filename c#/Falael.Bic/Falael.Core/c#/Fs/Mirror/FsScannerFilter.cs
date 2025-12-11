using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Core.Fs.Mirror
{
    public class FsScannerFilter
    {
        #region Constructors
        protected FsScannerFilter(string pattern)
        {
            this.pattern = pattern;
        }
        #endregion

        #region Overrides
        public override string ToString()
        {
            return this.pattern == null || this.pattern == string.Empty ? "*.*" : this.pattern;
        }
        #endregion

        #region Operations
        public bool IsMatch(string name)
        {
            if(this.pattern == string.Empty || this.pattern == null)
            {
                return true;
            }
            return PatternMatcher.StrictMatchPattern(this.pattern, name);
        }
        #endregion

        #region Properties
        public string Pattern
        {
            get
            {
                return this.pattern;
            }
        }
        #endregion

        #region Static methods
        public static bool IsMatchArray(FsScannerFilter[] filters, string name)
        {
            if (filters == null)
            {
                throw new ArgumentNullException("filters");
            }
            if (filters.Length == 0)
            {
                throw new InvalidOperationException();
            }
            for (int length = filters.Length, i = 0; i < length; ++i)
            {
                if (filters[i].IsMatch(name))
                {
                    return true;
                }
            }
            return false;
        }

        public static FsScannerFilter MatchArray(FsScannerFilter[] filters, string name)
        {
            if (filters == null)
            {
                throw new ArgumentNullException("filters");
            }
            if (filters.Length == 0)
            {
                throw new InvalidOperationException();
            }
            for (int length = filters.Length, i = 0; i < length; ++i)
            {
                var filter = filters[i];
                if (filter.IsMatch(name))
                {
                    return filter;
                }
            }
            return null;
        }

        public static void Iterate(FsScannerFilter[] filters, Action<FsScannerFilter> itemCallback)
        {
            if (filters == null)
            {
                throw new ArgumentNullException("filters");
            }
            if (filters.Length == 0)
            {
                throw new InvalidOperationException();
            }
            for (int length = filters.Length, i = 0; i < length; ++i)
            {
                itemCallback(filters[i]);
            }
        }
        #endregion

        #region Fields
        string pattern;
        #endregion
    }
}
