using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

using Falael.Diagnostics;
using Falael.Mirror;

namespace Falael.Core.Fs.Mirror
{
    public class FsWatcherSensor : Sensor<Guid>, ISignalTarget
    {
        #region Constructors
        public FsWatcherSensor(Configuration config, Action<object, ErrorEventArgs> feedErrAction)
            : base(Guid.NewGuid(), feedErrAction)
        {
            if(config == null)
            {
                throw new ArgumentNullException("config");
            }
            this.config = config;
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

        #region Nested types - signals
        public class PauseSignal { }
        public class ResumeSignal { }
        #endregion

        #region ISignalTarget
        public void Signal(object signal)
        {
            if (signal is PauseSignal)
            {
                lock (this.watcherSync)
                {
                    if (this.watcher == null)
                    {
                        throw new InvalidOperationException("FileSystemWatcher not initialized.");
                    }
                    this.watcher.EnableRaisingEvents = false;
                }
                return;
            }
            if (signal is ResumeSignal)
            {
                lock (this.watcherSync)
                {
                    if (this.watcher == null)
                    {
                        throw new InvalidOperationException("FileSystemWatcher not initialized.");
                    }
                    this.watcher.EnableRaisingEvents = true;
                }
                return;
            }
        }
        #endregion

        #region Interface
        public Configuration Config
        {
            get
            {
                return this.config;
            }
        }
        #endregion

        #region Infrastructure
        protected override void DoActivate(Action ready)
        {
            lock (this.watcherSync)
            {
                if (this.watcher != null)
                {
                    throw new InvalidOperationException("FileSystemWatcher already initialized.");
                }

                this.watcher = new FileSystemWatcher();
                this.watcher.InternalBufferSize = 8192 * 8; //  64K, https://msdn.microsoft.com/en-us/library/system.io.filesystemwatcher.internalbuffersize(v=vs.110).aspx
                                                            //this.watcher.InternalBufferSize = 8192 / 8; //  1K, for tests
                this.watcher.Path = Path.Combine(Directory.GetCurrentDirectory(), this.config.path);
                this.watcher.Filter = this.config.filter;
                this.watcher.NotifyFilter = this.config.notifyFilters;
                this.watcher.IncludeSubdirectories = this.config.recursive;

                this.watcher.Created += this.watcher_Notify_Direct;
                this.watcher.Renamed += this.watcher_Notify_Direct;
                this.watcher.Deleted += this.watcher_Notify_Direct;
                this.watcher.Changed += this.watcher_Notify_Direct;
                this.watcher.Error += this.watcher_Error;

                this.watcher.EnableRaisingEvents = true;
            }
        }

        protected override void DoDeactivate(Action ready)
        {
            lock (this.watcherSync)
            {
                if (this.watcher == null)
                {
                    return;
                }

                this.watcher.EnableRaisingEvents = false;
                this.watcher.Dispose();
                this.watcher = null;
            }
        }

        protected override void DoQuery(StateReport<Guid> sensorReport)
        {
            sensorReport.Stats.Add("filter", this.config.filter);
            sensorReport.Stats.Add("path", this.config.path);
            sensorReport.Stats.Add("recursive", this.config.recursive);
        }

        void watcher_Notify_Direct(object sender, FileSystemEventArgs args)
        {
            this.ProcessEventArgs(args);
        }

        void watcher_Error(object sender, ErrorEventArgs args)
        {
#if LOG || LOG_FSWS
            Console.WriteLine("FSWS watcher_Error {0}", args.GetException());
#endif
            this.FeedError(this, new ErrorEventArgs(new FsWatcherException(args.GetException(), this)));
        }

        void ProcessEventArgs(FileSystemEventArgs args)
        {
            switch (args.ChangeType)
            {
                case WatcherChangeTypes.Created:
#if LOG || LOG_FSWS
                    Console.WriteLine("FSWS watcher_Created {0}", args.FullPath);
#endif
                    this.Feed(this, args);
                    break;

                case WatcherChangeTypes.Deleted:
#if LOG || LOG_FSWS
                    Console.WriteLine("FSWS watcher_Deleted {0}", args.FullPath);
#endif
                    this.Feed(this, args);
                    break;

                case WatcherChangeTypes.Changed:
#if LOG || LOG_FSWS
                    Console.WriteLine("FSWS watcher_Changed {0}", args.FullPath);
#endif
                    this.Feed(this, args);
                    break;

                case WatcherChangeTypes.Renamed:
                    var renamedArgs = (RenamedEventArgs)args;
#if LOG || LOG_FSWS
                    Console.WriteLine("FSWS watcher_Renamed {0}<-{1}", args.FullPath, renamedArgs.OldFullPath);
#endif
                    this.Feed(this, args);
                    break;

                default:
                    throw new NotImplementedException(string.Format("Unsupported WatcherChangeTypes {0} (1)", Enum.GetName(typeof(WatcherChangeTypes), args.ChangeType)));
            }
        }

        protected internal void FeedError(ErrorEventArgs eventArgs)
        {
            this.Feed(this, eventArgs);
        }

        Configuration config;

        FileSystemWatcher watcher;
        object watcherSync = new object();
        #endregion
    }
}
