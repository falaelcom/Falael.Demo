using System.Diagnostics;
using System.Threading;

using Falael.Core.Syncronization;
using Falael.IO;
using Falael.Services;

namespace Falael.Utility.Rtoctu.BCcToAiProxy
{
	internal class Program
	{
		const ulong LGID = 0xA5AC96;

		//	BC4 cli w/ double quoted option values fails to produce adequate cli, may be puts quotes itself
		//
		//	full cli: `c:\repos\Falael.CODE\bin\debug\Falael.Utility.Rtoctu\net8.0\Falael.Utility.Rtoctu.BCcToAiProxy.exe --focused-file-full-path=%f --focused-file-line-number=%l --file-name=%n --unfocused-dir-full-path=%p --file-ext=%x --file-name-without-ext=%b --unfocused-file-rel-path=%F --unfocused-dir-rel-path=%P`
		//
		// sample params: --focused-file-full-path=C:\dev\www\oc_v4.1.0.3-accento\catalog\controller\common\cart.php --focused-file-line-number=16 --file-name=cart.php --unfocused-dir-full-path=C:\temp\kuchko-alvina-theme\src\oc_v4.0.2.3-alvina-stripped-tamed\catalog\controller\common\ --file-ext=.php --file-name-without-ext=cart --unfocused-file-rel-path=..\..\temp\kuchko-alvina-theme\src\oc_v4.0.2.3-alvina-stripped-tamed\catalog\controller\common\cart.php --unfocused-dir-rel-path=..\..\temp\kuchko-alvina-theme\src\oc_v4.0.2.3-alvina-stripped-tamed\catalog\controller\common\
		//
		//
		//--focused-file-full-path=%f  [0]
		//--focused-file-line-number=%l  [1]
		//--file-name=%n				 [2]
		//--unfocused-dir-full-path=%p [3]
		//--file-ext=%x
		//--file-name-without-ext=%b
		//--unfocused-file-rel-path=%F
		//--unfocused-dir-rel-path=%P

		static readonly Path bc4ExeFilePath = @"C:\Program Files\Beyond Compare 4\BCompare.exe".ToPath();
		static readonly Path outputDirPath = @"c:\repos\Kljuchko.WEB\data\Falael.Utility.Rtoctu.BCcToAiProxy".ToPath(denotesFile: false);
		static readonly Path logFilePath = outputDirPath.SetFileName("bc4-web-ai-extender.log");
		static readonly string baseDirMarker = "4.0.2.3-alvina";
		static readonly Path baseDir = @"c:\repos\Kljuchko.WEB.RESOURCES\src\oc_v4.0.2.3-alvina-stripped-tamed".ToPath();

		static async Task AsyncMain(string[] args)
		{
			try
			{
				#region Logging

				int maxLogDensity = LogDensity.LD_6_7;
				int maxLineLength = 270;

				var debugLogSink = new DebugLogSink();
				var consoleLogSink = new ConsoleLogSink();
				var fileLogSink = new FileLogSink(logFilePath);
				
				var log = new LogSinkRouter("Rtoctu.BCcToAiProxy");
				
				log.AddLogSink(debugLogSink, new() { MaxLogDensity = maxLogDensity });
				log.AddLogSink(consoleLogSink, new() { MaxLineLength = maxLineLength, MaxLogDensity = maxLogDensity });
				log.AddLogSink(fileLogSink, new() { MaxLogDensity = maxLogDensity });

				log.WriteLine(LogDensity.Unset, (LGID, 0xC01B6D),
					"Session Start:", string.Join(' ', args)
				);
				#endregion

				try
				{
					#region CLI Optionss

					var argsText = "ARGS: " + string.Join(' ', args);
					if (args.Length != 8) throw new InvalidOperationException("Invalid args (1). " + argsText);
					if (!args[0].StartsWith("--focused-file-full-path=")) throw new InvalidOperationException("Invalid args (2). " + argsText);
					if (!args[3].StartsWith("--unfocused-dir-full-path=")) throw new InvalidOperationException("Invalid args (3). " + argsText);

					var focusedFileFullPath = args[0].Replace("--focused-file-full-path=", "").ToPath();
					var unfocusedDirFullPath = args[3].Replace("--unfocused-dir-full-path=", "").ToPath();
					var unfocusedFileFullPath = unfocusedDirFullPath.SetFileName(focusedFileFullPath.FileName);

					#endregion

					#region BC4 Automation

					Path leftFilePath, rightFilePath;
					if (focusedFileFullPath.ToString().Contains(baseDirMarker))
					{
						leftFilePath = focusedFileFullPath;
						rightFilePath = unfocusedFileFullPath;
					}
					else
					{
						leftFilePath = unfocusedFileFullPath;
						rightFilePath = focusedFileFullPath;
					}
					var relativeFilePath = leftFilePath.GetRelativePath(baseDir);
					var fileName = HashConverter.GetCustomBase72MD5Hash(relativeFilePath);
					var fullFilePath = outputDirPath.SetFileName(fileName);
					var scriptFilePath = fullFilePath.SetFileExtension(".BC4-Script");
					var scriptLogFilePath = fullFilePath.SetFileExtension(".BC4-Log");
					var reportFilePath = fullFilePath.SetFileExtension(".BC4-Report");
					var titleFilePath = fullFilePath.SetFileExtension(".BC4-Title");

					titleFilePath.WriteText(relativeFilePath);

					var bc4CompareScript = "";
					bc4CompareScript +=
	$@"
log normal ""{scriptLogFilePath}""
file-report layout:interleaved &
 options:display-all &
 output-to:%3 %1 %2
";
					scriptFilePath.WriteText(bc4CompareScript);

					var psi = new ProcessStartInfo
					{
						FileName = bc4ExeFilePath,
						Arguments = @$"@""{scriptFilePath}"" ""{leftFilePath}"" ""{rightFilePath}"" ""{reportFilePath}""",
						RedirectStandardOutput = true,
						RedirectStandardError = true,
						UseShellExecute = false,
						CreateNoWindow = true,
					};
					using (var p = Process.Start(psi))
					{
						Debug.Assert(p != null);
						string stdout = p.StandardOutput.ReadToEnd();
						string stderr = p.StandardError.ReadToEnd();
						p.WaitForExit();
						log.WriteLine(LogDensity.Unset, (LGID, 0xB383E7),
							"[BC4:stdout]", stdout
						);
						log.WriteLine(LogDensity.Unset, (LGID, 0xD72A02),
							"[BC4:stderr]", stderr
						);
					}

					#endregion
				}
				catch (Exception ex)
				{
					log.WriteLine(Severity.Error, (LGID, 0x131CDE),
						ex
					);
				}
			}
			catch (Exception ex)
			{
				Debug.WriteLine(ex.ToString());
				Console.WriteLine(ex.ToString());
				File.AppendAllText(logFilePath, ex.ToString());
			}
		}

		static void Main(string[] args)
		{
			AsyncMain(args).GetAwaiter().GetResult();
		}
	}
}
