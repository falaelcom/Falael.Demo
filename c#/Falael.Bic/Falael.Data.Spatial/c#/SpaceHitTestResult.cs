// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial
{
    public class SpaceHitTestResult
    {
        public SpaceHitTestResult(bool success, SpaceIterator spaceIterator)
        {
            this.success = success;
            this.spaceIterator = spaceIterator;
        }

        public bool Success
        {
            get
            {
                return this.success;
            }
        }
        public SpaceIterator SpaceIterator
        {
            get
            {
                return this.spaceIterator;
            }
        }

        public static readonly SpaceHitTestResult Fail = new SpaceHitTestResult(false, null);

        bool success;
        SpaceIterator spaceIterator;
    }
}
