using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Core.Fs.Mirror
{
    public class FsWatcherException : Exception
    {
        #region Constructors
        public FsWatcherException(System.Runtime.Serialization.SerializationInfo info, System.Runtime.Serialization.StreamingContext context)
            : base(info, context)
        {
        }

        public FsWatcherException(string message, Exception innerExeption)
            : base(message, innerExeption)
        {
        }

        public FsWatcherException(string message)
            : base(message)
        {
        }

        public FsWatcherException()
        {
        }

        public FsWatcherException(string message, Exception innerExeption, FsWatcherSensor fsWatcherSensor)
            : base(message, innerExeption)
        {
            this.fsWatcherSensor = fsWatcherSensor;
        }

        public FsWatcherException(string message, FsWatcherSensor fsWatcherSensor)
            : base(message)
        {
            this.fsWatcherSensor = fsWatcherSensor;
        }

        public FsWatcherException(Exception innerExeption, FsWatcherSensor fsWatcherSensor)
            : base(string.Empty, innerExeption)
        {
            this.fsWatcherSensor = fsWatcherSensor;
        }

        #endregion

        #region Overrides
        public override string ToString()
        {
            return string.Format("{0}{2}    FileSystemWatcher path: \"{1}\"", base.ToString(), this.fsWatcherSensor.Config.path, Environment.NewLine);
        }
        #endregion

        #region Properties
        public FsWatcherSensor FsWatcherSensor
        {
            get
            {
                return this.fsWatcherSensor;
            }
        }
        #endregion

        #region Fields
        FsWatcherSensor fsWatcherSensor;
        #endregion
    }
}
