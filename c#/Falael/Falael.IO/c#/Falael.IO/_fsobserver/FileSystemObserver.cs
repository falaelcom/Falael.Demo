//	R0Q4/daniel/20250828
//	TODO:
//		- provision exclusion patterns
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

using static Falael.IO.FileSystemObserver.FileSystemSnapshot;

namespace Falael.IO;

using PathFilter = UniPath.PathFilter;

public partial class FileSystemObserver : FalaelContextAware, IDisposable
{
	const ulong LGID = 0x921DA1;

	public FileSystemObserver(IFalaelContext coreContext, Configuration configuration, string rootDirectory, ChangedDelegate changedCallback)
			: base(coreContext)
	{
		Debug.Assert(Path.IsPathRooted(rootDirectory));

		this.rootDirectory = rootDirectory;
		this.acceptedPathFilters = [.. configuration.Fso_AcceptedFileExtensions
			.Select(v => new PathFilter { Pattern = v, UsePatternMatching = false })
			.Concat(configuration.Fso_AcceptedGlobs
			.Select(v => new PathFilter { Pattern = v, UsePatternMatching = true }))];
		this.excludedPathFilters = [.. configuration.Fso_ExcludedFileExtensions
			.Select(v => new PathFilter { Pattern = v, UsePatternMatching = false })
			.Concat(configuration.Fso_ExcludedGlobs
			.Select(v => new PathFilter { Pattern = v, UsePatternMatching = true }))];
		this.periodicScanInterval = configuration.Fso_PeriodicScanInterval;
		this.fileGracePeriod = configuration.Fso_FileGracePeriod;
		this.fileGracePeriodRescanInterval = configuration.Fso_FileGracePeriodRescanInterval;
		this.notifyGracePeriod = configuration.Fso_NotifyGracePeriod;
		this.changedCallback = changedCallback;

		this.changeDebounceBuffer = new ChangeDebounceBuffer(coreContext, this.rootDirectory, this.fileGracePeriod, this.fileGracePeriodRescanInterval, this.modDebounceBuffer_SignalCallback);
		this.watcher = new FileSystemWatcher(rootDirectory)
		{
			NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite | NotifyFilters.Size,
			IncludeSubdirectories = true,
			EnableRaisingEvents = false
		};
		this.watcher.Created += this.fileSystemWatcher_Created;
		this.watcher.Changed += this.fileSystemWatcher_Changed;
		this.watcher.Deleted += this.fileSystemWatcher_Deleted;
		this.watcher.Renamed += this.fileSystemWatcher_Renamed;

		this.notify_graceTimer = new Timer(_ => this.notify_graceTimer_tick(), null, Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);

		var task = this.InitialScan();
		task?.Wait();   //	`task == null` - app is exiting
		this.watcher.EnableRaisingEvents = true;
		this.periodicScanTimer = new Timer(_ => this.periodicScanTimer_tick(), null, this.periodicScanInterval, this.periodicScanInterval);
	}

	#region IDisposable

	~FileSystemObserver()
	{
		this.Dispose(false);
	}

	public void Dispose()
	{
		this.Dispose(true);
		GC.SuppressFinalize(this);
	}

	protected virtual void Dispose(bool disposing)
	{
		try
		{
			if (this.disposed) return;
			if (!disposing) return;

			this.watcher.EnableRaisingEvents = false;
			this.periodicScanTimer.Dispose();
			this.watcher.Dispose();
			this.changeDebounceBuffer.Dispose();
		}
		finally
		{
			this.disposed = true;
		}
	}

	#endregion

	#region Configuration

	[ConfigurationClass]
	public class Configuration
	{
		[ConfigurationField("fso.acceptedFileExtensions")]
		public string[] Fso_AcceptedFileExtensions { get; init; } = [];

		[ConfigurationField("fso.excludedFileExtensions")]
		public string[] Fso_ExcludedFileExtensions { get; init; } = [];

		[ConfigurationField("fso.acceptedGlobs")]
		public string[] Fso_AcceptedGlobs { get; init; } = [];

		[ConfigurationField("fso.excludedGlobs")]
		public string[] Fso_ExcludedGlobs { get; init; } = [];

		[ConfigurationField("fso.periodicScanInterval")]
		public TimeSpan Fso_PeriodicScanInterval { get; init; } = TimeSpan.FromSeconds(2.5);

		[ConfigurationField("fso.fileGracePeriod")]
		public TimeSpan Fso_FileGracePeriod { get; init; } = TimeSpan.FromMilliseconds(350);

		[ConfigurationField("fso.fileGracePeriodRescanInterval")]
		public TimeSpan Fso_FileGracePeriodRescanInterval { get; init; } = TimeSpan.FromMilliseconds(125);

		[ConfigurationField("fso.notifyGracePeriod")]
		public TimeSpan Fso_NotifyGracePeriod { get; init; } = TimeSpan.FromMilliseconds(700);
	}

	#endregion

	#region Nested Types

	public enum FileChangeType
	{
		Created,
		Modified,
		Deleted,
	}

	public enum FileEventType
	{
		Created,
		Modified,
		Deleted,
		Error,
		Locked,
	}

	public enum FileStateType
	{
		Normal,
		Error,
		Locked,
	}

	public class FileEvent
	{
		public required FileFootprint FileFootprint;
		public required FileChangeType FileChangeType;
	}

	public class FileFootprint
	{
		public required string RelativePath;
		public required FileStateType FileStateType;
		public required DateTime DiscoveryTime;

		public DateTime? KnownModifiedTimeUtc;
		public long? KnownSize;
		public Exception? Exception;

		public override string ToString()
		{
			StringBuilder sb = new();

			var timeText = this.KnownModifiedTimeUtc?.ToString("yyyy-MM-dd-HH-mm-ss-fff") ?? "(n/a)";

			sb.AppendFormat("| {0, 7} ", this.FileStateType.ToString());
			sb.AppendFormat("| {0, 8} ", this.KnownSize.ToString());
			sb.AppendFormat("| {0, 24} ", timeText);
			sb.AppendFormat("| {0} ", this.RelativePath);
			if (this.Exception != null) sb.AppendFormat("| {0} ", this.Exception);

			return sb.ToString();
		}
	}

	public delegate void ChangedDelegate(FileSystemObserver sender, List<FileEvent> fileEvents);

	#endregion

	public List<FileFootprint> GetFileRegistry()
	{
		lock (this.fileRegistry)
		{
			return [.. this.fileRegistry];
		}
	}

	public FileSystemSnapshot GetFileSystemSnapshot()
	{
		lock (this.fileRegistry)
		{
			return new FileSystemSnapshot(this.rootDirectory, this.acceptedPathFilters, this.excludedPathFilters, [.. this.fileRegistry.Select(v => new FileEntry { RelativePath = v.RelativePath, ModifiedTimeUtc = v.KnownModifiedTimeUtc ?? DateTime.MinValue})]);
		}
	}


	protected virtual void OnChanged(FileChangeType fileChangeType, FileFootprint fileFootprint)
	{
		if (this.notifyGracePeriod != TimeSpan.Zero)
		{
			lock (this.notify_fileEvents)
			{
				this.notify_fileEvents.Add(new FileEvent { FileChangeType = fileChangeType, FileFootprint = fileFootprint });
				this.notify_graceTimer.Change(this.notifyGracePeriod, Timeout.InfiniteTimeSpan);
			}
			return;
		}

#if DEBUG
		this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x8F3E79),
			nameof(FileSystemObserver), nameof(OnChanged), "Notify."
		);
#endif
		this.changedCallback(this, [new FileEvent { FileChangeType = fileChangeType, FileFootprint = fileFootprint }]);
	}

	void notify_graceTimer_tick()
	{
		List<FileEvent> fileEvents;
		lock (this.notify_fileEvents)
		{
			fileEvents = [.. this.notify_fileEvents];
			this.notify_fileEvents.Clear();
			this.notify_graceTimer.Change(Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
		}
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xAA3E82),
			nameof(FileSystemObserver), nameof(notify_graceTimer_tick), "Notify."
		);
#endif
		this.changedCallback(this, fileEvents);
	}

	Task? InitialScan()
	{
		return this.CoreContext.StartManagedTask(() =>
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x44A590),
				nameof(FileSystemObserver), nameof(InitialScan), "Scanning..."
			);
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x50EDD9),
				nameof(FileSystemObserver), nameof(InitialScan), this.rootDirectory
			);
#endif
			var files = Directory.GetFiles(this.rootDirectory, "*", SearchOption.AllDirectories);
			foreach (var filePath in files)
			{
				try
				{
					this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();

					var relativePath = Path.GetRelativePath(this.rootDirectory, filePath);
					if (!Path.IsMatch(relativePath, this.acceptedPathFilters, this.excludedPathFilters)) continue;

					DateTime lastWriteTimeUtc;
					long length;
					try
					{
						FileInfo fileInfo;
						try
						{
							fileInfo = new FileInfo(filePath);
						}
						catch (Exception ex)
							when (ex is PathTooLongException || ex is UnauthorizedAccessException)
						{
							this.Log.WriteLine(Severity.Alert, (LGID, 0x5FBED8),
								nameof(FileSystemObserver), nameof(InitialScan), relativePath, ex
							);
							var now = DateTime.UtcNow;
#if DEBUG
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8A7672),
								nameof(FileSystemObserver), nameof(InitialScan), "[REG]", relativePath, nameof(FileEventType.Error), now
							);
#endif
							this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
							continue;
						}
						catch (IOException ex)
						{
							if (!IsFileLockedException(ex)) throw;
							var now = DateTime.UtcNow;
#if DEBUG
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xFB9E07),
								nameof(FileSystemObserver), nameof(InitialScan), "[REG]", relativePath, nameof(FileEventType.Locked), now
							);
#endif
							this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
							continue;
						}
						lastWriteTimeUtc = fileInfo.LastWriteTimeUtc;
						length = fileInfo.Length;
						using (File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) { } //	will throw IOException if locked
					}
					catch (FileNotFoundException ex)
					{
						this.Log.WriteLine(Severity.Alert, (LGID, 0x284DDF),
							nameof(FileSystemObserver), nameof(InitialScan), relativePath, ex
						);
						continue;
					}
					catch (IOException ex)
					{
						var now = DateTime.UtcNow;
						if (IsFileLockedException(ex))
						{
#if DEBUG
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x476ACD),
								nameof(FileSystemObserver), nameof(InitialScan), "[REG]", relativePath, nameof(FileEventType.Locked), now
							);
#endif
							this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
							continue;
						}
						this.Log.WriteLine(Severity.Alert, (LGID, 0xDB37AC),
							nameof(FileSystemObserver), nameof(InitialScan), relativePath, ex
						);
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x111144),
							nameof(FileSystemObserver), nameof(InitialScan), "[REG]", relativePath, nameof(FileEventType.Error), now
						);
#endif
						this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
						continue;
					}
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x223FD7),
						nameof(FileSystemObserver), nameof(InitialScan), "[REG]", relativePath, nameof(FileEventType.Created), $"({length})", lastWriteTimeUtc
					);
#endif
					this.changeDebounceBuffer.Post(relativePath, FileEventType.Created, DateTime.UtcNow, lastWriteTimeUtc, length);
				}
				catch (OperationCanceledException)
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x1234B5),
						nameof(FileSystemObserver), nameof(InitialScan), "Task cancelled"
					);
					break;
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Alert, (LGID, 0xCB3079),
						nameof(FileSystemObserver), nameof(InitialScan), ex
					);
				}
			}
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xD61245),
				nameof(FileSystemObserver), nameof(InitialScan), "Done."
			);
#endif
		});
	}

	void periodicScanTimer_tick()
	{
		lock (this.discoverySync)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x133B34),
				nameof(FileSystemObserver), nameof(periodicScanTimer_tick), $"lock ({nameof(this.discoverySync)})", $"lock ({nameof(this.isScanning)}) ENTER {this.isScanning}"
			);
#endif
			if (this.isScanning) return;
			this.isScanning = true;
		}
		this.CoreContext.StartManagedTask(() =>
		{
			try
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x78CC88),
					nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "Scanning..."
				);
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x40EC94),
					nameof(FileSystemObserver), nameof(periodicScanTimer_tick), this.rootDirectory
				);
#endif

				var filePaths = Directory.GetFiles(this.rootDirectory, "*", SearchOption.AllDirectories);
				var currentPaths = new HashSet<string>(filePaths.Select(p => Path.GetRelativePath(this.rootDirectory, p)));

				Dictionary<string, FileFootprint> registeredFilesMap;
				lock (this.fileRegistry)
				{
					registeredFilesMap = this.fileRegistry.ToDictionary(v => v.RelativePath, v => v);
				}

				foreach (var filePath in filePaths)
				{
					try
					{
						this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();
						var relativePath = Path.GetRelativePath(this.rootDirectory, filePath);
						if (!Path.IsMatch(relativePath, this.acceptedPathFilters, this.excludedPathFilters)) continue;

						DateTime lastWriteTimeUtc;
						long length;
						try
						{
							this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();

							FileInfo fileInfo;
							try
							{
								fileInfo = new FileInfo(filePath);
							}
							catch (Exception ex)
								when (ex is PathTooLongException || ex is UnauthorizedAccessException)
							{
								this.Log.WriteLine(Severity.Alert, (LGID, 0xBF99BC),
									nameof(FileSystemObserver), nameof(periodicScanTimer_tick), relativePath, ex
								);
								var now = DateTime.UtcNow;
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD2BD12),
									nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Error), now
								);
#endif
								this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
								continue;
							}
							catch (IOException ex)
							{
								if (!IsFileLockedException(ex)) throw;
								var now = DateTime.UtcNow;
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x69B944),
									nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Locked), now
								);
#endif
								this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
								continue;
							}
							if (!fileInfo.Exists)
							{
								var now = DateTime.UtcNow;
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8F82F7),
									nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Deleted), now
								);
#endif
								this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
								continue;
							}
							lastWriteTimeUtc = fileInfo.LastWriteTimeUtc;
							length = fileInfo.Length;
							using (File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) { } //	will throw IOException if locked
						}
						catch (FileNotFoundException ex)
						{
							this.Log.WriteLine(Severity.Warning, (LGID, 0x157855),
								nameof(FileSystemObserver), nameof(periodicScanTimer_tick), relativePath, ex
							);
							var now = DateTime.UtcNow;
#if DEBUG
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8ED815),
								nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Deleted), now
							);
#endif
							this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
							continue;
						}
						catch (IOException ex)
						{
							var now = DateTime.UtcNow;
							if (IsFileLockedException(ex))
							{
#if DEBUG
								this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xBE50EB),
									nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Locked), now
								);
#endif
								this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
								continue;
							}
							this.Log.WriteLine(Severity.Alert, (LGID, 0x503AF7),
								nameof(FileSystemObserver), nameof(periodicScanTimer_tick), relativePath, ex
							);
#if DEBUG
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xB30CA2),
								nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Error), now
							);
#endif
							this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
							continue;
						}
						if (!registeredFilesMap.TryGetValue(relativePath, out FileFootprint? existingEntry))
						{
#if DEBUG
							this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xDD53AD),
								nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Created), $"({length})", lastWriteTimeUtc
							);
#endif
							this.changeDebounceBuffer.Post(relativePath, FileEventType.Created, DateTime.UtcNow, lastWriteTimeUtc, length);
							continue;
						}
						if (existingEntry.KnownModifiedTimeUtc == lastWriteTimeUtc) continue;
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xA7BAEA),
							nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", relativePath, nameof(FileEventType.Modified), $"({length})", lastWriteTimeUtc
						);
#endif
						this.changeDebounceBuffer.Post(relativePath, FileEventType.Modified, DateTime.UtcNow, lastWriteTimeUtc, length);
					}
					catch (OperationCanceledException)
					{
						this.Log.WriteLine(Severity.Warning, (LGID, 0x46D0AE),
							nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "Task cancelled"
						);
						break;
					}
					catch (Exception ex)
					{
						this.Log.WriteLine(Severity.Alert, (LGID, 0x374020),
							nameof(FileSystemObserver), nameof(periodicScanTimer_tick), ex
						);
					}
				}
				foreach (var kvp in registeredFilesMap)
				{
					if (currentPaths.Contains(kvp.Key)) continue;

					var now = DateTime.UtcNow;
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x982C01),
						nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "[REG]", kvp.Key, nameof(FileEventType.Deleted), now
					);
#endif
					this.changeDebounceBuffer.Post(kvp.Key, FileEventType.Deleted, now);
				}
			}
			finally
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x8F6EF7),
					nameof(FileSystemObserver), nameof(periodicScanTimer_tick), "Done."
				);
#endif
				lock (this.discoverySync)
				{
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x02BF19),
						nameof(FileSystemObserver), nameof(periodicScanTimer_tick), $"lock ({nameof(this.discoverySync)})", $"({nameof(this.isScanning)}) EXIT"
					);
#endif
					this.isScanning = false;
				}
			}
		});
	}

	void fileSystemWatcher_Created(object sender, FileSystemEventArgs e)
	{
		lock (this.discoverySync)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x96324F),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileCreated)}) ENTER"
			);
#endif
			this.OnFileCreated(sender, e);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xBA866C),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileCreated)}) EXIT"
			);
#endif
		}
	}

	void OnFileCreated(object sender, FileSystemEventArgs e)
	{
		var fullPath = e.FullPath;
		var relativePath = Path.GetRelativePath(this.rootDirectory, fullPath);

		if (!Path.IsMatch(relativePath, this.acceptedPathFilters, this.excludedPathFilters)) return;

		DateTime lastWriteTimeUtc;
		long length;
		try
		{
			FileInfo fileInfo;
			try
			{
				fileInfo = new FileInfo(fullPath);
			}
			catch (Exception ex)
				when (ex is PathTooLongException || ex is UnauthorizedAccessException)
			{
				this.Log.WriteLine(Severity.Alert, (LGID, 0x4131B5),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), relativePath, ex
				);
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x31BEB0),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), "[REG]", relativePath, nameof(FileEventType.Error), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
				return;
			}
			catch (IOException ex)
			{
				if (!IsFileLockedException(ex)) throw;
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x1B5EF2),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), "[REG]", relativePath, nameof(FileEventType.Locked)
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
				return;
			}
			lastWriteTimeUtc = fileInfo.LastWriteTimeUtc;
			length = fileInfo.Length;
			using (File.Open(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) { } //	will throw IOException if locked
		}
		catch (FileNotFoundException ex)
		{
			this.Log.WriteLine(Severity.Alert, (LGID, 0x9F236F),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), relativePath, ex
			);
			return;
		}
		catch (IOException ex)
		{
			var now = DateTime.UtcNow;
			if (IsFileLockedException(ex))
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x180379),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), "[REG]", relativePath, nameof(FileEventType.Locked), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
				return;
			}
			this.Log.WriteLine(Severity.Alert, (LGID, 0x0CF075),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), relativePath, ex
			);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x7A8BB3),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), "[REG]", relativePath, nameof(FileEventType.Error), now
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
			return;
		}

		Dictionary<string, FileFootprint> registeredFilesMap;
		lock (this.fileRegistry)
		{
			registeredFilesMap = this.fileRegistry.ToDictionary(v => v.RelativePath, v => v);
		}

		if (!registeredFilesMap.TryGetValue(relativePath, out FileFootprint? existingEntry))
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x4ABC38),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), "[REG]", relativePath, nameof(FileEventType.Created), $"({length})", lastWriteTimeUtc
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Created, DateTime.UtcNow, lastWriteTimeUtc, length);
			return;
		}
		if (existingEntry.KnownModifiedTimeUtc == lastWriteTimeUtc) return;
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x9A98F9),
			nameof(FileSystemObserver), nameof(fileSystemWatcher_Created), "[REG]", relativePath, nameof(FileEventType.Modified), $"({length})", lastWriteTimeUtc
		);
#endif
		this.changeDebounceBuffer.Post(relativePath, FileEventType.Modified, DateTime.UtcNow, lastWriteTimeUtc, length);
	}

	void fileSystemWatcher_Changed(object sender, FileSystemEventArgs e)
	{
		lock (this.discoverySync)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xB2F303),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileChanged)}) ENTER"
			);
#endif
			this.OnFileChanged(sender, e);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x6DA204),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileChanged)}) EXIT"
			);
#endif
		}
	}

	void OnFileChanged(object sender, FileSystemEventArgs e)
	{
		var fullPath = e.FullPath;
		var relativePath = Path.GetRelativePath(this.rootDirectory, fullPath);

		if (!Path.IsMatch(relativePath, this.acceptedPathFilters, this.excludedPathFilters)) return;

		DateTime lastWriteTimeUtc;
		long length;
		try
		{
			FileInfo fileInfo;
			try
			{
				fileInfo = new FileInfo(fullPath);
			}
			catch (Exception ex)
				when (ex is PathTooLongException || ex is UnauthorizedAccessException)
			{
				this.Log.WriteLine(Severity.Alert, (LGID, 0xAA5AED),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), relativePath, ex
				);
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD8826D),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Error), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
				return;
			}
			catch (IOException ex)
			{
				if (!IsFileLockedException(ex)) throw;
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xEB2753),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Locked), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
				return;
			}
			if (!fileInfo.Exists)
			{
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x73FB7E),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Deleted), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
				return;
			}
			lastWriteTimeUtc = fileInfo.LastWriteTimeUtc;
			length = fileInfo.Length;
			using (File.Open(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) { } //	will throw IOException if locked
		}
		catch (FileNotFoundException ex)
		{
			this.Log.WriteLine(Severity.Warning, (LGID, 0x854603),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), relativePath, ex
			);
			var now = DateTime.UtcNow;
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xF20973),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Deleted), now
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
			return;
		}
		catch (IOException ex)
		{
			var now = DateTime.UtcNow;
			if (IsFileLockedException(ex))
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x4A4A70),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Locked), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
				return;
			}
			this.Log.WriteLine(Severity.Alert, (LGID, 0xFC53C9),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), relativePath, ex
			);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8A2128),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Error), now
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
			return;
		}

		Dictionary<string, FileFootprint> registeredFilesMap;
		lock (this.fileRegistry)
		{
			registeredFilesMap = this.fileRegistry.ToDictionary(v => v.RelativePath, v => v);
		}

		if (!registeredFilesMap.TryGetValue(relativePath, out FileFootprint? existingEntry))
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x62E80E),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Created), $"({length})", lastWriteTimeUtc
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Created, DateTime.UtcNow, lastWriteTimeUtc, length);
			return;
		}
		if (existingEntry.KnownModifiedTimeUtc == lastWriteTimeUtc) return;
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x52F24B),
			nameof(FileSystemObserver), nameof(fileSystemWatcher_Changed), "[REG]", relativePath, nameof(FileEventType.Modified), $"({length})", lastWriteTimeUtc
		);
#endif
		this.changeDebounceBuffer.Post(relativePath, FileEventType.Modified, DateTime.UtcNow, lastWriteTimeUtc, length);
	}

	void fileSystemWatcher_Deleted(object sender, FileSystemEventArgs e)
	{
		lock (this.discoverySync)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xA39758),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileDeleted)}) ENTER"
			);
#endif
			this.OnFileDeleted(sender, e);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x8543E7),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileDeleted)}) EXIT"
			);
#endif
		}
	}

	void OnFileDeleted(object sender, FileSystemEventArgs e)
	{
		var fullPath = e.FullPath;
		var relativePath = Path.GetRelativePath(this.rootDirectory, fullPath);

		if (!Path.IsMatch(relativePath, this.acceptedPathFilters, this.excludedPathFilters)) return;

		DateTime lastWriteTimeUtc;
		long length;
		try
		{
			FileInfo fileInfo;
			try
			{
				fileInfo = new FileInfo(fullPath);
			}
			catch (Exception ex)
				when (ex is PathTooLongException || ex is UnauthorizedAccessException)
			{
				this.Log.WriteLine(Severity.Alert, (LGID, 0x6CF316),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), relativePath, ex
				);
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x7BDA06),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Error), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
				return;
			}
			catch (IOException ex)
			{
				if (!IsFileLockedException(ex)) throw;
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x37E751),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Locked), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
				return;
			}
			if (!fileInfo.Exists)
			{
				var now = DateTime.UtcNow;
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE4C576),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Deleted), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
				return;
			}
			lastWriteTimeUtc = fileInfo.LastWriteTimeUtc;
			length = fileInfo.Length;
			using (File.Open(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) { } //	will throw IOException if locked
		}
		catch (FileNotFoundException)
		{
			var now = DateTime.UtcNow;
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x211221),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Deleted), now
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
			return;
		}
		catch (DirectoryNotFoundException)
		{
			var now = DateTime.UtcNow;
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x9A3BF9),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Deleted), now
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Deleted, now);
			return;
		}
		catch (IOException ex)
		{
			var now = DateTime.UtcNow;
			if (IsFileLockedException(ex))
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x16E53B),
					nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Locked), now
				);
#endif
				this.changeDebounceBuffer.Post(relativePath, FileEventType.Locked, now, ex);
				return;
			}
			this.Log.WriteLine(Severity.Warning, (LGID, 0x6276E2),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), relativePath, ex
			);
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xD48735),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Error), now
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Error, now, ex);
			return;
		}

		Dictionary<string, FileFootprint> registeredFilesMap;
		lock (this.fileRegistry)
		{
			registeredFilesMap = this.fileRegistry.ToDictionary(v => v.RelativePath, v => v);
		}

		if (!registeredFilesMap.TryGetValue(relativePath, out FileFootprint? existingEntry))
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x5C61FF),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Created), $"({length})", lastWriteTimeUtc
			);
#endif
			this.changeDebounceBuffer.Post(relativePath, FileEventType.Created, DateTime.UtcNow, lastWriteTimeUtc, length);
			return;
		}
		if (existingEntry.KnownModifiedTimeUtc == lastWriteTimeUtc) return;
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x1209FB),
			nameof(FileSystemObserver), nameof(fileSystemWatcher_Deleted), "[REG]", relativePath, nameof(FileEventType.Modified), $"({length})", lastWriteTimeUtc
		);
#endif
		this.changeDebounceBuffer.Post(relativePath, FileEventType.Modified, DateTime.UtcNow, lastWriteTimeUtc, length);
	}

	void fileSystemWatcher_Renamed(object sender, RenamedEventArgs e)
	{
		lock (this.discoverySync)
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xEC5C47),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Renamed), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileDeleted)})+({nameof(OnFileCreated)}) ENTER"
			);
#endif
			this.OnFileDeleted(sender, new(WatcherChangeTypes.Deleted, Path.GetDirectoryName(e.OldFullPath)!, e.OldName));
			this.OnFileCreated(sender, new(WatcherChangeTypes.Created, Path.GetDirectoryName(e.FullPath)!, e.Name));
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x73B257),
				nameof(FileSystemObserver), nameof(fileSystemWatcher_Renamed), $"lock ({nameof(this.discoverySync)})", $"({nameof(OnFileDeleted)})+({nameof(OnFileCreated)}) EXIT"
			);
#endif
		}
	}

	void modDebounceBuffer_SignalCallback()
	{
		lock (this.processingSync)
		{
			if (this.isProcessing) return;
			this.isProcessing = true;
		}

		this.CoreContext.StartManagedTask(() =>
		{
			lock (this.discoverySync)
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x66ED84),
					nameof(FileSystemObserver), nameof(modDebounceBuffer_SignalCallback), $"lock ({nameof(this.discoverySync)})", "ENTER"
				);
#endif
				try
				{
					while (true)
					{
						try
						{
							this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();

							var filePathState = this.changeDebounceBuffer.Next();
							if (filePathState == null) break;
							lock (this.fileRegistry)
							{
								var existing = this.fileRegistry.FirstOrDefault(ff => ff.RelativePath == filePathState.RelativePath);

								switch (filePathState.FinalEventType)
								{
									case FileEventType.Created:
									case FileEventType.Modified:
										if (existing == null)
										{
											var newEntry = new FileFootprint
											{
												RelativePath = filePathState.RelativePath,
												FileStateType = FileStateType.Normal,
												DiscoveryTime = DateTime.UtcNow,
												KnownModifiedTimeUtc = filePathState.ModifiedTimeUtc,
												KnownSize = filePathState.Size,
												Exception = null,
											};
											this.fileRegistry.Add(newEntry);
											this.OnChanged(FileChangeType.Created, newEntry);
											break;
										}

										if (existing.KnownModifiedTimeUtc == filePathState.ModifiedTimeUtc) break;

										existing.FileStateType = FileStateType.Normal;
										existing.KnownModifiedTimeUtc = filePathState.ModifiedTimeUtc;
										existing.KnownSize = filePathState.Size;
										existing.Exception = null;
										this.OnChanged(FileChangeType.Modified, existing);
										break;
									case FileEventType.Deleted:
										if (existing == null) break;
										this.fileRegistry.Remove(existing);
										this.OnChanged(FileChangeType.Deleted, existing);
										break;
									case FileEventType.Error:
									case FileEventType.Locked:
										throw new InvalidOperationException(filePathState.FinalEventType.ToString());
									default: throw new NotImplementedException(filePathState.FinalEventType.ToString());
								}
							}
						}
						catch (OperationCanceledException)
						{
							this.Log.WriteLine(Severity.Warning, (LGID, 0x359A24),
								nameof(FileSystemObserver), nameof(modDebounceBuffer_SignalCallback), "Task cancelled"
							);
							break;
						}
						catch (Exception ex)
						{
							this.Log.WriteLine(Severity.Alert, (LGID, 0x0B8070),
								nameof(FileSystemObserver), nameof(modDebounceBuffer_SignalCallback), ex
							);
						}
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0x90F4C0),
						nameof(FileSystemObserver), nameof(modDebounceBuffer_SignalCallback), ex
					);
				}
				finally
				{
					lock (this.processingSync)
					{
						this.isProcessing = false;
					}
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x93488F),
						nameof(FileSystemObserver), nameof(modDebounceBuffer_SignalCallback), $"lock ({nameof(this.discoverySync)})", "EXIT"
					);
#endif
				}
			}
		});
	}


	public PathFilter[] AcceptedPathFilters => this.acceptedPathFilters;

	public PathFilter[] ExcludedPathFilters => this.excludedPathFilters;

	public static bool IsFileLockedException(IOException exception)
	{
		int errorCode = Marshal.GetHRForException(exception) & ((1 << 16) - 1);
		return errorCode == 32 || errorCode == 33;
	}

	public string RootDirectory => this.rootDirectory;

	readonly string rootDirectory;
	readonly PathFilter[] acceptedPathFilters;
	readonly PathFilter[] excludedPathFilters;
	readonly TimeSpan periodicScanInterval;
	readonly TimeSpan fileGracePeriod;
	readonly TimeSpan fileGracePeriodRescanInterval;
	readonly TimeSpan notifyGracePeriod;
	readonly List<FileFootprint> fileRegistry = new(5 * 1024);
	readonly FileSystemWatcher watcher;
	readonly Timer periodicScanTimer;
	readonly Timer notify_graceTimer;
	readonly ChangeDebounceBuffer changeDebounceBuffer;
	readonly ChangedDelegate changedCallback;

	readonly object processingSync = new();
	readonly object discoverySync = new();

	readonly List<FileEvent> notify_fileEvents = new(2 * 1024);

	bool isScanning = false;
	bool isProcessing = false;
	bool disposed = false;
}