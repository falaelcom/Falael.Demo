using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Globalization;

using Falael;

namespace Falael.Utility.LogPipe.App
{
    class Program
    {
        #region Command line options - constants and nested types
        static readonly string[] OPTIONS_OUT = new string[] { "o", "out" };
        static readonly string[] OPTIONS_ERROR = new string[] { "e", "error" };
        static readonly string[] OPTIONS_EXECUTABLE = new string[] { "x", "executable" };
        static readonly string[] OPTIONS_SIZELIMIT = new string[] { "s", "sizelimit" };
        static readonly string[] OPTIONS_TIMELIMIT = new string[] { "t", "timelimit" };
        static readonly string[] OPTIONS_REDIRECT_OWN_OUTPUT = new string[] { "r", "redirect-own-output" };

        static readonly string[] schemaFields = new List<string>()
            .Concat(OPTIONS_OUT)
            .Concat(OPTIONS_ERROR)
            .Concat(OPTIONS_EXECUTABLE)
            .Concat(OPTIONS_SIZELIMIT)
            .Concat(OPTIONS_TIMELIMIT)
            .Concat(OPTIONS_REDIRECT_OWN_OUTPUT)
        .ToArray();

        static readonly char OPTION_MIRROR = 'm';
        static readonly char OPTION_GENERATOR = 'g';
        static readonly char OPTION_SIMULATE_UNHANDLED_EXCEPTION = 'u';
        static readonly char OPTION_INVARIANT_CULTURE = 'i';
        static readonly char OPTION_DEBUG = 'd';

        static readonly char[] schemaFlags = new char[]
        {
            OPTION_MIRROR,
            OPTION_GENERATOR,
            OPTION_SIMULATE_UNHANDLED_EXCEPTION,
            OPTION_INVARIANT_CULTURE,
            OPTION_DEBUG
        };
        
        class Configuration
        {
            public string outputFilePath;
            public string errorFilePath;
            public string redirectOwnOutputFilePath;
            public string executable;
            public string arguments;

            public bool useSizeLimit;
            public long sizeLimit;

            public bool useInterval;
            public TimeSpan interval;

            public bool mirror;
            public bool generator;
            public bool simulateUnhandledException;
            public bool invariantCulture;
            public bool debug;
        }

        enum EOperation
        {
            Invalid,
            InvalidRedirect,
            InvalidStdinPiping,
            Genertor,
            SimulateException,
            ExecutableWrapper,
            PipeStdin
        }
        #endregion

        #region Nested types
        class StreamingContext
        {
            public StreamWriter outputStreamWriter;
            public StreamWriter errorStreamWriter;

            public void OpenStreams(Configuration configuration)
            {
                if (!File.Exists(configuration.outputFilePath))
                {
                    File.Create(configuration.outputFilePath).Close();
                    File.SetCreationTime(configuration.outputFilePath, DateTime.Now);
                }
                this.outputStreamWriter = new StreamWriter(new FileStream(configuration.outputFilePath, FileMode.Append, FileAccess.Write, FileShare.Read));
                if (configuration.errorFilePath != null)
                {
                    if (!File.Exists(configuration.outputFilePath))
                    {
                        File.Create(configuration.errorFilePath).Close();
                        File.SetCreationTime(configuration.errorFilePath, DateTime.Now);
                    }
                    this.errorStreamWriter = new StreamWriter(new FileStream(configuration.errorFilePath, FileMode.Append, FileAccess.Write, FileShare.Read));
                }
                else
                {
                    this.errorStreamWriter = this.outputStreamWriter;
                }
            }

            public void CloseStreams()
            {
                if (this.outputStreamWriter != null)
                {
                    this.outputStreamWriter.Close();
                }
                if (this.errorStreamWriter != null && this.errorStreamWriter != this.outputStreamWriter)
                {
                    this.errorStreamWriter.Close();
                }
                this.outputStreamWriter = null;
                this.errorStreamWriter = null;
            }
        }
        #endregion

        static void Main(string[] args)
        {
            EOperation operation;
            Configuration configuration;

            //  logging in the next region is done to stdout and stderr regardless of the OPTIONS_REDIRECT_OWN_OUTPUT option field value
            #region Command line options - parsing into operation, configuration
            GnuOptions options = null;
            try
            {
                options = Parse.GnuArguments_Legacy(schemaFlags, schemaFields, args);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(string.Format("Unknown option {0}.", ex.Message));
                Console.Error.WriteLine();

                Operation_PrintUsage();
                return;
            }

            if (options.HasOption(OPTION_GENERATOR))
            {
                operation = EOperation.Genertor;
            }
            else if (options.HasOption(OPTION_SIMULATE_UNHANDLED_EXCEPTION))
            {
                operation = EOperation.SimulateException;
            }
            else if (!options.HasOptions(OPTIONS_OUT))
            {
                operation = EOperation.Invalid;
            }
            else if (options.HasOptions(OPTIONS_EXECUTABLE) && Console.IsInputRedirected)
            {
                operation = EOperation.InvalidStdinPiping;
            }
            else if (Console.IsInputRedirected)
            {
                if (options.HasOptions(OPTIONS_ERROR))
                {
                    operation = EOperation.InvalidRedirect;
                }
                else
                {
                    operation = EOperation.PipeStdin;
                }
            }
            else if (options.HasOptions(OPTIONS_EXECUTABLE))
            {
                operation = EOperation.ExecutableWrapper;
            }
            else
            {
                operation = EOperation.Invalid;
            }

            if (options.HasOption(OPTION_INVARIANT_CULTURE))
            {
                //  needs to be set before the parsing of the command line option values
                CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
            }

            configuration = new Configuration
            {
                outputFilePath = options.First(OPTIONS_OUT),
                errorFilePath = options.First(OPTIONS_ERROR),
                redirectOwnOutputFilePath = options.First(OPTIONS_REDIRECT_OWN_OUTPUT),
                executable = options.First(OPTIONS_EXECUTABLE),
                arguments = String.Join(" ", options.NonOptionArgs),

                useSizeLimit = Parse.AsLong(options.First(OPTIONS_SIZELIMIT)) > 0,
                sizeLimit = Parse.AsLong(options.First(OPTIONS_SIZELIMIT)),

                useInterval = Parse.AsTimeSpan(options.First(OPTIONS_TIMELIMIT), TimeSpan.Zero) > TimeSpan.Zero,
                interval = Parse.AsTimeSpan(options.First(OPTIONS_TIMELIMIT), TimeSpan.Zero),

                mirror = options.HasOption(OPTION_MIRROR),
                generator = options.HasOption(OPTION_GENERATOR),
                simulateUnhandledException = options.HasOption(OPTION_SIMULATE_UNHANDLED_EXCEPTION),
                invariantCulture = options.HasOption(OPTION_INVARIANT_CULTURE),
                debug = options.HasOption(OPTION_DEBUG),
            };
            #endregion

            //  from here on if OPTIONS_REDIRECT_OWN_OUTPUT option is specified instead of using stdout and stderr, all logging of own messages is done to the file specified,
            //  except for exceptions raized when trying to write to that file, which are dumped to stderr
            AppDomain.CurrentDomain.UnhandledException += new UnhandledExceptionEventHandler((object sender, UnhandledExceptionEventArgs e) =>
            {
                OwnWriteDebugLine(configuration, "BEGIN AppDomain.CurrentDomain.UnhandledException...");
                if (e.ExceptionObject is Exception)
                {
                    Exception ex = (Exception)e.ExceptionObject;
                    OwnWriteErrorLine(configuration, ex.ToString());
                }
                else
                {
                    OwnWriteErrorLine(configuration, string.Format("Unknown domain exception type: {0}", e.ExceptionObject.GetType().Name));
                }
                OwnWriteDebugLine(configuration, "END AppDomain.CurrentDomain.UnhandledException.");
            });

            try
            {
                OwnWriteDebugLine(configuration, "lpipe is now running.");

                switch (operation)
                {
                    case EOperation.Invalid:
                        OwnWriteDebugLine(configuration, "BEGIN EOperation.Invalid...");
                        Operation_PrintUsage(configuration);
                        OwnWriteDebugLine(configuration, "END EOperation.Invalid.");
                        break;
                    case EOperation.InvalidRedirect:
                        OwnWriteDebugLine(configuration, "BEGIN EOperation.InvalidRedirect...");
                        OwnWriteErrorLine(configuration, "Cannot redirect source's stderr when stdin is piped. Use the following command-line syntax to merge stderr into stdout for combined piping: <executable> 2>&1 | .\\lpipe.exe -o stdout+stderr.log");
                        OwnWriteErrorLine(configuration);
                        OwnWriteDebugLine(configuration, "END EOperation.InvalidRedirect.");
                        Operation_PrintUsage();
                        break;
                    case EOperation.InvalidStdinPiping:
                        OwnWriteDebugLine(configuration, "BEGIN EOperation.InvalidStdinPiping...");
                        OwnWriteErrorLine(configuration, "Cannot run as an executable wrapper when stdin is piped. Use either only the -x option, or only stdin piping.");
                        OwnWriteErrorLine(configuration);
                        OwnWriteDebugLine(configuration, "END EOperation.InvalidStdinPiping.");
                        Operation_PrintUsage();
                        break;
                    case EOperation.Genertor:
                        OwnWriteDebugLine(configuration, "BEGIN EOperation.Genertor...");
                        Operation_RunAsGenerator(configuration);
                        OwnWriteDebugLine(configuration, "END EOperation.Genertor.");
                        break;
                    case EOperation.SimulateException:
                        OwnWriteDebugLine(configuration, "BEGIN EOperation.SimulateException...");
                        Operation_SimulateException(configuration);
                        OwnWriteDebugLine(configuration, "END EOperation.SimulateException.");
                        break;
                    case EOperation.ExecutableWrapper:
                        {
                            OwnWriteDebugLine(configuration, "BEGIN EOperation.ExecutableWrapper (1/4)...");

                            StreamingContext streamingContext = new StreamingContext();
                            streamingContext.OpenStreams(configuration);

                            OwnWriteDebugLine(configuration, "STREAMS OPENED EOperation.ExecutableWrapper (2/4)...");

                            try
                            {
                                Operation_RunExecutable(
                                    configuration,
                                    line =>
                                    {
                                        ForwardWriteLine_StdOut(configuration, streamingContext, line);
                                    },
                                    line =>
                                    {
                                        ForwardWriteLine_StdErr(configuration, streamingContext, line);
                                    }
                                );
                            }
                            finally
                            {
                                OwnWriteDebugLine(configuration, "STREAMS CLOSING EOperation.ExecutableWrapper (3/4)...");

                                streamingContext.CloseStreams();

                                OwnWriteDebugLine(configuration, "END EOperation.ExecutableWrapper (4/4).");
                            }
                        }
                        break;
                    case EOperation.PipeStdin:
                        {
                            OwnWriteDebugLine(configuration, "BEGIN EOperation.PipeStdin (1/4)...");

                            StreamingContext streamingContext = new StreamingContext();
                            streamingContext.OpenStreams(configuration);

                            OwnWriteDebugLine(configuration, "STREAMS OPENED EOperation.PipeStdin (2/4)...");

                            try
                            {
                                Operation_PipeStdin(configuration, streamingContext);
                            }
                            finally
                            {
                                OwnWriteDebugLine(configuration, "STREAMS CLOSING EOperation.PipeStdin (3/4)...");

                                streamingContext.CloseStreams();

                                OwnWriteDebugLine(configuration, "END EOperation.PipeStdin (4/4).");
                            }
                        }
                        break;
                    default:
                        throw new NotImplementedException();
                }
            }
            catch (Exception ex)
            {
                OwnWriteErrorLine(configuration, ex.ToString());
            }
        }

        #region Operation: Pipe stdin to file
        static void Operation_PipeStdin(Configuration configuration, StreamingContext streamingContext)
        {
            using (StreamReader reader = new StreamReader(Console.OpenStandardInput(), Console.InputEncoding))
            {
                string line;
                do
                {
                    line = reader.ReadLine();
                    if (line == null)
                    {
                        OwnWriteDebug(configuration, "x");
                        break;
                    }
                    OwnWriteDebug(configuration, "o");
                    ForwardWriteLine_StdOut(configuration, streamingContext, line);
                }
                while (true);
            }
        }
        #endregion

        #region Operation: Executable wrapper
        static void Operation_RunExecutable(Configuration configuration, Action<string> onLineReceived, Action<string> onErrorLineReceived)
        {
            string executablePath = configuration.executable;
            string executableArguments = configuration.arguments;

            StringBuilder sb = new StringBuilder();

            ProcessStartInfo processStartInfo = new ProcessStartInfo();
            processStartInfo.CreateNoWindow = true;
            processStartInfo.RedirectStandardOutput = true;
            processStartInfo.RedirectStandardInput = true;
            processStartInfo.RedirectStandardError = true;
            processStartInfo.UseShellExecute = false;

            processStartInfo.Arguments = executableArguments;
            processStartInfo.FileName = executablePath;

            Process process = new Process();
            process.StartInfo = processStartInfo;
            process.EnableRaisingEvents = true;

            var waitEvent = new System.Threading.ManualResetEvent(false);

            process.OutputDataReceived += new DataReceivedEventHandler
            (
                delegate (object sender, DataReceivedEventArgs e)
                {
                    try
                    {
                        if (e.Data == null)
                        {
                            return;
                        }
                        OwnWriteDebugLine(configuration, "process.OutputDataReceived");
                        onLineReceived(e.Data);
                    }
                    catch (Exception ex)
                    {
                        OwnWriteErrorLine(configuration, ex.ToString());
                    }
                }
            );
            process.ErrorDataReceived += new DataReceivedEventHandler
            (
                delegate (object sender, DataReceivedEventArgs e)
                {
                    try
                    {
                        if (e.Data == null)
                        {
                            return;
                        }
                        OwnWriteDebugLine(configuration, "process.ErrorDataReceived");
                        onErrorLineReceived(e.Data);
                    }
                    catch (Exception ex)
                    {
                        OwnWriteErrorLine(configuration, ex.ToString());
                    }
                }
            );

            process.Exited += new EventHandler
            (
                delegate (object sender, EventArgs eventArgs)
                {
                    try
                    {
                        OwnWriteDebugLine(configuration, "Operation_PipeStdin: Guest process exit event.");
                        waitEvent.Set();
                    }
                    catch (Exception ex)
                    {
                        OwnWriteErrorLine(configuration, ex.ToString());
                    }
                }
            );

            OwnWriteDebugLine(configuration, string.Format("Operation_PipeStdin: Starting guest process: {0} {1}...", processStartInfo.FileName, processStartInfo.Arguments));
            process.Start();
            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Guest process started.");


            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Adding guest process to Win32_ChildProcessTracker...");
            Win32_ChildProcessTracker.AddProcess(process);
            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Guest process added to Win32_ChildProcessTracker.");


            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Redirecting stdio and stderr...");
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            OwnWriteDebugLine(configuration, "Operation_PipeStdin: stdio and stderr redirected.");


            OwnWriteDebugLine(configuration, "Operation_PipeStdin: waiting for the guest process to exit...");
            waitEvent.WaitOne();
            OwnWriteDebugLine(configuration, string.Format("Operation_PipeStdin: Guest process exited with code {0}, time {1}, hasExited {2}.", process.ExitCode, process.ExitTime, process.HasExited));


            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Cancelling stdio and stderr redirects...");
            process.CancelOutputRead();
            process.CancelErrorRead();
            OwnWriteDebugLine(configuration, "Operation_PipeStdin: stdio and stderr redirects cancelled.");


            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Closing guest process...");
            process.Close();
            OwnWriteDebugLine(configuration, "Operation_PipeStdin: Guest process closed.");
        }
        #endregion

        #region Operation: Generator
        static void Operation_RunAsGenerator(Configuration configuration)
        {
            var exitRequested = false;
            Console.CancelKeyPress += new ConsoleCancelEventHandler(delegate (Object sender, ConsoleCancelEventArgs e)
            {
                try
                {
                    OwnWriteLine(configuration, "Ctrl-C signalled, exiting.");
                    exitRequested = true;
                }
                catch (Exception ex)
                {
                    OwnWriteErrorLine(configuration, ex.ToString());
                }
            });
            var task = Task.Run(() =>
            {
                try
                {
                    while (!exitRequested)
                    {
                        OwnWriteLine(configuration, Guid.NewGuid().ToString() + ":" + Guid.NewGuid().ToString() + ":" + Guid.NewGuid().ToString());
                        OwnWriteErrorLine(configuration, "ERROR:" + Guid.NewGuid().ToString() + ":" + Guid.NewGuid().ToString() + ":" + Guid.NewGuid().ToString());
                        System.Threading.Thread.Sleep(1000);
                    }
                }
                catch (Exception ex)
                {
                    OwnWriteErrorLine(configuration, ex.ToString());
                }
            });
            task.Wait();
        }
        #endregion

        #region Operation: Simulate exception
        static void Operation_SimulateException(Configuration configuration)
        {
            var task = Task.Run(() =>
            {
                OwnWriteDebugLine(configuration, "Operation_SimulateException: Throwing a simulated unhandled thread exception...");
                throw new Exception("Simulated unhandled thread exception.");
            });
            task.Wait();
        }
        #endregion

        #region Operation: PrintUsage
        static void Operation_PrintUsage(Configuration configuration = null)
        {
            string executableName = Path.GetFileName(System.Reflection.Assembly.GetExecutingAssembly().CodeBase);
            OwnWriteErrorLine(configuration, string.Format("Usage: {0} <options> -- <executable arguments>", executableName));
            OwnWriteErrorLine(configuration, "");
            OwnWriteErrorLine(configuration, "Field options:");
            OwnWriteErrorLine(configuration, "\t-o, --out\t\t\tthe path to the stdout destination log file; required in non-simulation mode (see the -g and -u flags)");
            OwnWriteErrorLine(configuration, "\t-e, --error\t\t\t(optional) the path to the stderr destination log file");
            OwnWriteErrorLine(configuration, "\t-x, --executable\t\t(optional) the path to the execute to run");
            OwnWriteErrorLine(configuration, "\t-s, --sizelimit\t\t\t(optional) output file size threshold to trigger archiving of all current log files");
            OwnWriteErrorLine(configuration, "\t-t, --timelimit\t\t\t(optional) a time span (d | [d.]hh:mm[:ss[.ff]]) after the creation time of the current output file when all current log files will be considered for archiving");
            OwnWriteErrorLine(configuration, "\t-r, --redirect-own-output\t(optional) the path to a file to write to all own stdout and stderr messages; if present, this field will cause also the generator output (-g) to be redirected");
            OwnWriteErrorLine(configuration, "");
            OwnWriteErrorLine(configuration, "Flags:");
            OwnWriteErrorLine(configuration, "\t-i\t\t\t\t(optional) if present the invariant culture will be set for the whole program lifespan");
            OwnWriteErrorLine(configuration, "\t-m\t\t\t\t(optional) if present together with the --error option will cause the stderr stream to be mirrored to the output log file");
            OwnWriteErrorLine(configuration, "\t-d\t\t\t\t(optional) if present will cause verbouse debug logging");
            OwnWriteErrorLine(configuration, "\t-g\t\t\t\t(optional) simulation mode; if present causes the program to switch behavior to generating bogus log output to stdout and stderr every second; in this mode all other options are ignored");
            OwnWriteErrorLine(configuration, "\t-u\t\t\t\t(optional) simulation mode; if present causes the program to immediately throw an unhandled exception from within a thread");
            OwnWriteErrorLine(configuration, "");
            OwnWriteErrorLine(configuration, "NOTE: For this utility to operate it needs either a piped stdin from another process or the --executable parameter specified.");
            OwnWriteErrorLine(configuration, "NOTE: The size and the time of only the output file are monitored for archiving purposes. The error log file is archived along with the output file.");
            OwnWriteErrorLine(configuration, "");
            //Console.ReadKey();
        }
        #endregion

        #region Infrastructure: Logging
        static void ForwardWriteLine_StdOut(Configuration configuration, StreamingContext streamingContext, string line, bool suppressArchiving = false)
        {
            OwnWriteDebugLine(configuration, "ForwardWriteLine_StdOut: Writing...");
            lock (sync)
            {
                if (NeedsArchiving(configuration, streamingContext))
                {
                    ArchiveCurrentLogFiles(configuration, streamingContext);
                }
                streamingContext.outputStreamWriter.WriteLine(line);
                streamingContext.outputStreamWriter.Flush();
            }
            OwnWriteDebugLine(configuration, "ForwardWriteLine_StdOut: Written.");
        }

        static void ForwardWriteLine_StdErr(Configuration configuration, StreamingContext streamingContext, string line)
        {
            OwnWriteDebugLine(configuration, "ForwardWriteLine_StdErr: Writing...");
            lock (sync)
            {
                streamingContext.errorStreamWriter.WriteLine(line);
                streamingContext.errorStreamWriter.Flush();
                if (configuration.mirror && streamingContext.errorStreamWriter != streamingContext.outputStreamWriter)
                {
                    ForwardWriteLine_StdOut(configuration, streamingContext, line, false);
                }
            }
            OwnWriteDebugLine(configuration, "ForwardWriteLine_StdErr: Written.");
        }

        static bool NeedsArchiving(Configuration configuration, StreamingContext streamingContext)
        {
            OwnWriteDebugLine(configuration, "NeedsArchiving...");
            try
            {
                if (!configuration.useSizeLimit && !configuration.useInterval)
                {
                    OwnWriteDebugLine(configuration, "NeedsArchiving: Not configured.");
                    return false;
                }

                FileInfo outputFileInfo = new FileInfo(configuration.outputFilePath);

                if (configuration.useSizeLimit)
                {
                    if (outputFileInfo.Length >= configuration.sizeLimit)
                    {
                        OwnWriteDebugLine(configuration, string.Format("NeedsArchiving: Yes, exceeded the size limit {0}.", configuration.useSizeLimit));
                        return true;
                    }
                }
                if (configuration.useInterval)
                {
                    TimeSpan logFileAge = DateTime.Now - outputFileInfo.CreationTime;
                    if (logFileAge >= configuration.interval)
                    {
                        OwnWriteDebugLine(configuration, string.Format("NeedsArchiving: Yes, exceeded the interval {0}.", configuration.interval));
                        return true;
                    }
                }

                OwnWriteDebugLine(configuration, "NeedsArchiving: No need.");
                return false;
            }
            catch (Exception ex)
            {
                OwnWriteErrorLine(configuration, ex.ToString());
                return false;
            }
        }

        static void ArchiveCurrentLogFiles(Configuration configuration, StreamingContext streamingContext)
        {
            OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles...");

            try
            {
                var date = DateTime.Now;

                string archive_outputFileName = string.Format("{0}-{1}{2}", Path.GetFileNameWithoutExtension(configuration.outputFilePath), date.ToString("yyyyMMddTHHmmss\\Ffffffff"), Path.GetExtension(configuration.outputFilePath));
                string archive_outputFilePath = Path.Combine(Path.GetDirectoryName(configuration.outputFilePath), archive_outputFileName);
                string archive_errorFilePath = null;

                if (configuration.errorFilePath != null)
                {
                    string archive_errorFileName = string.Format("{0}-{1}{2}", Path.GetFileNameWithoutExtension(configuration.errorFilePath), date.ToString("yyyyMMddTHHmmss\\Ffffffff"), Path.GetExtension(configuration.errorFilePath));
                    archive_errorFilePath = Path.Combine(Path.GetDirectoryName(configuration.errorFilePath), archive_errorFileName);
                }

                OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles: Closing srteams...");
                streamingContext.CloseStreams();
                OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles: Srteams closed.");

                OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles: Renaming files...");
                File.Move(configuration.outputFilePath, archive_outputFilePath);
                if (archive_errorFilePath != null)
                {
                    File.Move(configuration.errorFilePath, archive_errorFilePath);
                }
                OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles: Files renamed.");

                OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles: Reopening streams...");
                streamingContext.OpenStreams(configuration);
                OwnWriteDebugLine(configuration, "ArchiveCurrentLogFiles: Streams reopened.");
            }
            catch (Exception ex)
            {
                OwnWriteErrorLine(configuration, ex.ToString());
            }
        }

        static void OwnWriteLine(Configuration configuration = null, string text = "")
        {
            if(configuration == null || configuration.redirectOwnOutputFilePath == null)
            {
                Console.WriteLine(text);
                return;
            }

            lock(redirectOwnOutputSync)
            {
                try
                {
                    File.AppendAllText(configuration.redirectOwnOutputFilePath, string.Format("[{0}] {1}{2}", DateTime.Now.ToString("yyyyMMdd-HHmmss-fff"), text, Environment.NewLine));
                }
                catch(Exception ex)
                {
                    Console.Error.WriteLine(ex.ToString());
                }
            }
        }

        static void OwnWriteDebugLine(Configuration configuration = null, string text = "")
        {
            if (!configuration.debug)
            {
                return;
            }

            if (configuration == null || configuration.redirectOwnOutputFilePath == null)
            {
                Console.WriteLine(text);
                return;
            }

            lock (redirectOwnOutputSync)
            {
                try
                {
                    File.AppendAllText(configuration.redirectOwnOutputFilePath, string.Format("[{0}] {1}{2}", DateTime.Now.ToString("yyyyMMdd-HHmmss-fff"), text, Environment.NewLine));
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.ToString());
                }
            }
        }

        static void OwnWriteDebug(Configuration configuration = null, string text = "")
        {
            if (!configuration.debug)
            {
                return;
            }

            if (configuration == null || configuration.redirectOwnOutputFilePath == null)
            {
                Console.Write(text);
                return;
            }

            lock (redirectOwnOutputSync)
            {
                try
                {
                    File.AppendAllText(configuration.redirectOwnOutputFilePath, text);
                }
                catch (Exception ex)
                {
                    Console.Error.Write(ex.ToString());
                }
            }
        }

        static void OwnWriteErrorLine(Configuration configuration = null, string text = "")
        {
            if (configuration == null || configuration.redirectOwnOutputFilePath == null)
            {
                Console.Error.WriteLine(text);
                return;
            }

            lock (redirectOwnOutputSync)
            {
                try
                {
                    File.AppendAllText(configuration.redirectOwnOutputFilePath, string.Format("[{0}] {1}{2}", DateTime.Now.ToString("yyyyMMdd-HHmmss-fff"), text, Environment.NewLine));
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.ToString());
                }
            }
        }
        #endregion

        static readonly object sync = new object();
        static readonly object redirectOwnOutputSync = new object();
    }
}
