//	R0Q4/daniel/20250828
using System.Diagnostics;

namespace Falael.IO;

public partial class FileSystemObserver : FalaelContextAware, IDisposable
{
	internal partial class ChangeDebounceBuffer : FalaelContextAware, IDisposable
	{
		const ulong LGID = 0x1DFB29;

		public ChangeDebounceBuffer(IFalaelContext coreContext, string rootDirectory, TimeSpan fileGracePeriod, TimeSpan fileGracePeriodRescanInterval, Action changedSignalCallback)
				: base(coreContext)
		{
			this.rootDirectory = rootDirectory;
			this.fileGracePeriod = fileGracePeriod;
			this.fileGracePeriodRescanInterval = fileGracePeriodRescanInterval;
			this.changedSignalCallback = changedSignalCallback;

			this.gracePeriodRescanTimer = new Timer(_ => this.gracePeriodRescanTimer_tick(), null, this.fileGracePeriodRescanInterval, this.fileGracePeriodRescanInterval);
		}

		#region IDisposable

		~ChangeDebounceBuffer()
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

				this.gracePeriodRescanTimer.Dispose();
			}
			finally
			{
				this.disposed = true;
			}
		}

		#endregion

		#region Nested Types

		public class FilePathState : IComparable<FilePathState>
		{
			public required string RelativePath;
			public required FileEventType FinalEventType;
			public required DateTime DiscoveryTime;

			public DateTime ModifiedTimeUtc;
			public long? Size;
			public Exception? Exception;

			int IComparable<FilePathState>.CompareTo(FilePathState? other)
			{
				Debug.Assert(other != null);
				return this.ModifiedTimeUtc.CompareTo(other.ModifiedTimeUtc);
			}

			public bool EssenceEquals(object? obj)
			{
				if (obj is null) return false;
				var right = (FilePathState)obj;
				if (!this.FinalEventType.Equals(right.FinalEventType) || !this.RelativePath.Equals(right.RelativePath)) return false;
				switch (right.FinalEventType)
				{
					case FileEventType.Created:
					case FileEventType.Modified:
					case FileEventType.Deleted:
						return
							this.ModifiedTimeUtc.Equals(right.ModifiedTimeUtc) &&
							this.Size.Equals(right.Size) &&
							(this.Exception?.Equals(right.Exception) ?? right.Exception == null);
					case FileEventType.Error:
					case FileEventType.Locked:
						return this.Exception?.Message == right.Exception?.Message;
					default: throw new NotImplementedException(right.FinalEventType.ToString());
				}
			}
		}

		#endregion


		protected virtual void OnChangedSignal()
		{
#if DEBUG
			this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0xB2CFB3),
				nameof(ChangeDebounceBuffer), nameof(OnChangedSignal), "Signal."
			);
#endif
			this.changedSignalCallback();
		}


		public void Post(string relativeFilePath, FileEventType fileEventType, DateTime discoveryTime, DateTime modificationTime, long length)
		{
			lock (this.processingSync)
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xECC7E7),
					nameof(ChangeDebounceBuffer), nameof(Post), relativeFilePath, $"({length})", modificationTime, discoveryTime
				);
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8946D1),
					nameof(ChangeDebounceBuffer), nameof(Post), "--- this.fileModRegistry.Count", this.fileModRegistry.Count
				);
#endif
				var outcome = this.ApplyModEntry(new FilePathState()
				{
					RelativePath = relativeFilePath,
					FinalEventType = fileEventType,
					DiscoveryTime = discoveryTime,
					ModifiedTimeUtc = modificationTime,
					Size = length,
				});
#if DEBUG
				if(outcome) this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x8C1798),
					nameof(ChangeDebounceBuffer), nameof(Post), "--- POSTED"
				);
#endif
			}
		}

		public void Post(string filePath, FileEventType fileEventType, DateTime discoveryTime)
		{
			lock (this.processingSync)
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x3C301F),
					nameof(ChangeDebounceBuffer), nameof(Post), filePath, $"(n/a)", discoveryTime, discoveryTime
				);
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x310279),
					nameof(ChangeDebounceBuffer), nameof(Post), "--- this.fileModRegistry.Count", this.fileModRegistry.Count
				);
#endif
				var outcome = this.ApplyModEntry(new FilePathState()
				{
					RelativePath = filePath,
					FinalEventType = fileEventType,
					DiscoveryTime = discoveryTime,
					ModifiedTimeUtc = discoveryTime,
				});
#if DEBUG
				if(outcome) this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xBDE21B),
					nameof(ChangeDebounceBuffer), nameof(Post), "--- POSTED"
				);
#endif
			}
		}

		public void Post(string filePath, FileEventType fileEventType, DateTime discoveryTime, Exception ex)
		{
			lock (this.processingSync)
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xAF2F03),
					nameof(ChangeDebounceBuffer), nameof(Post), filePath, $"(n/a)", discoveryTime, discoveryTime
				);
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x10D955),
					nameof(ChangeDebounceBuffer), nameof(Post), "--- this.fileModRegistry.Count", this.fileModRegistry.Count
				);
#endif
				var outcome = this.ApplyModEntry(new FilePathState()
				{
					RelativePath = filePath,
					FinalEventType = fileEventType,
					DiscoveryTime = discoveryTime,
					ModifiedTimeUtc = discoveryTime,
					Exception = ex,
				});
#if DEBUG
				if(outcome) this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x5B9436),
					nameof(ChangeDebounceBuffer), nameof(Post), "--- POSTED"
				);
#endif
			}
		}

		bool ApplyModEntry(FilePathState incoming)
		{
			if (!this.fileModRegistry.TryGetValue(incoming.RelativePath, out FilePathState? existing))
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xCE7ADB),
					nameof(ChangeDebounceBuffer), nameof(Post), nameof(this.fileModRegistry), "ADD", incoming.RelativePath
				);
#endif
				this.fileModRegistry[incoming.RelativePath] = incoming;
				return true;
			}

			if (existing.EssenceEquals(incoming)) return false;

#if DEBUG
			this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x5B5230),
				nameof(ChangeDebounceBuffer), nameof(Post), nameof(this.fileModRegistry), "UPDATE", incoming.RelativePath
			);
#endif

			switch (incoming.FinalEventType)
			{
				case FileEventType.Created:
					if (existing.FinalEventType != FileEventType.Modified)
					{
						this.fileModRegistry[incoming.RelativePath] = incoming;
						break;
					}
					this.fileModRegistry[incoming.RelativePath] = new()
					{
						RelativePath = incoming.RelativePath,
						FinalEventType = FileEventType.Modified,
						DiscoveryTime = incoming.DiscoveryTime,
						Exception = incoming.Exception,
						ModifiedTimeUtc = incoming.ModifiedTimeUtc,
						Size = incoming.Size,
					};
					break;
				case FileEventType.Modified:
					if (existing.FinalEventType != FileEventType.Created)
					{
						this.fileModRegistry[incoming.RelativePath] = incoming;
						break;
					}
					this.fileModRegistry[incoming.RelativePath] = new()
					{
						RelativePath = incoming.RelativePath,
						FinalEventType = FileEventType.Created,
						DiscoveryTime = incoming.DiscoveryTime,
						Exception = incoming.Exception,
						ModifiedTimeUtc = incoming.ModifiedTimeUtc,
						Size = incoming.Size,
					};
					break;
				case FileEventType.Deleted:
				case FileEventType.Error:
				case FileEventType.Locked:
					(FileEventType actualFileEventType, DateTime? actualLastWriteTimeUtc, long? actualSize) = _queryFileEventType(incoming.RelativePath);
					if (actualFileEventType != FileEventType.Created)
					{
						this.fileModRegistry[incoming.RelativePath] = incoming;
						break;
					}
					Debug.Assert(actualLastWriteTimeUtc != null);
					Debug.Assert(actualSize != null);
					this.fileModRegistry[incoming.RelativePath] = new()
					{
						RelativePath = incoming.RelativePath,
						FinalEventType = FileEventType.Created,
						DiscoveryTime = incoming.DiscoveryTime,
						Exception = incoming.Exception,
						ModifiedTimeUtc = actualLastWriteTimeUtc.Value,
						Size = actualSize.Value,
					};
					break;
				default: throw new NotImplementedException(incoming.FinalEventType.ToString());
			}
			return true;

			(FileEventType fileEventType, DateTime? lastWriteTimeUtc, long? size) _queryFileEventType(string filePath)
			{
				var fullPath = Path.Combine(this.rootDirectory, filePath);
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
						return (FileEventType.Error, null, null);
					}
					catch (IOException ex)
					{
						if (!IsFileLockedException(ex)) throw;
						return (FileEventType.Locked, null, null);
					}
					if (!fileInfo.Exists)
					{
						return (FileEventType.Deleted, null, null);
					}
					lastWriteTimeUtc = fileInfo.LastWriteTimeUtc;
					length = fileInfo.Length;
					using (File.Open(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) { } //	will throw IOException if locked
				}
				catch (FileNotFoundException)
				{
					return (FileEventType.Deleted, null, null);
				}
				catch (DirectoryNotFoundException)
				{
					return (FileEventType.Deleted, null, null);
				}
				catch (IOException ex)
				{
					if (IsFileLockedException(ex)) return (FileEventType.Locked, null, null);
					return (FileEventType.Error, null, null);
				}
				return (FileEventType.Created, lastWriteTimeUtc, length);
			}
		}

		public FilePathState? Next()
		{
			lock (this.processingSync)
			{
				try
				{
					if (this.fileModRegistry.Count == 0) return null;
					var now = DateTime.UtcNow;
					FilePathState? result = null;
					foreach (var kvp in this.fileModRegistry)
					{
						FilePathState filePathState = kvp.Value;
						switch (filePathState.FinalEventType)
						{
							case FileEventType.Created:
							case FileEventType.Modified:
							case FileEventType.Deleted:
								break;
							case FileEventType.Error:
							case FileEventType.Locked:
								continue;
							default: throw new NotImplementedException(filePathState.FinalEventType.ToString());
						}
						if (now - filePathState.DiscoveryTime < this.fileGracePeriod) continue;
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x1B3ED8),
							nameof(ChangeDebounceBuffer), nameof(Next), filePathState.RelativePath, $"({filePathState.Size})", filePathState.ModifiedTimeUtc
						);
						this.Log.WriteLine(LogDensity.LD_7_7, (LGID, 0x526F5A),
							nameof(ChangeDebounceBuffer), nameof(Next), $"|__ Grace period {this.fileGracePeriod} elapsed with {now - filePathState.DiscoveryTime}", filePathState.DiscoveryTime
						);
#endif
						result = filePathState;
						break;
					}
					if (result != null)
					{
						this.fileModRegistry.Remove(result.RelativePath);
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x04F45B),
							nameof(ChangeDebounceBuffer), nameof(Next), nameof(this.fileModRegistry), "REMOVE", result.RelativePath
						);
#endif
					}
					return result;
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0x6102CC),
						nameof(ChangeDebounceBuffer), nameof(gracePeriodRescanTimer_tick), ex
					);
					return null;
				}
			}
		}

		void gracePeriodRescanTimer_tick()
		{
			lock (this.scanningSync)
			{
				if (this.isScanning) return;
				this.isScanning = true;
			}

			this.CoreContext.StartManagedTask(() =>
			{
				try
				{
					var now = DateTime.UtcNow;
					lock (this.processingSync)
					{
						List<string> transferredKeys = [];
						foreach (var kvp in this.fileModRegistry)
						{
							try
							{
								this.CoreContext.ManagedTasksCancellationTokenSource?.Token.ThrowIfCancellationRequested();
								FilePathState filePathState = kvp.Value;
								switch (filePathState.FinalEventType)
								{
									case FileEventType.Created:
									case FileEventType.Modified:
									case FileEventType.Deleted:
										break;
									case FileEventType.Error:
									case FileEventType.Locked:
										continue;
									default: throw new NotImplementedException(filePathState.FinalEventType.ToString());
								}
								if (now - filePathState.DiscoveryTime < this.fileGracePeriod) continue;
								this.OnChangedSignal();
							}
							catch (OperationCanceledException)
							{
								this.Log.WriteLine(Severity.Warning, (LGID, 0x9DF501),
									nameof(ChangeDebounceBuffer), nameof(modDebounceBuffer_SignalCallback), "Task cancelled"
								);
								break;
							}
							catch (Exception ex)
							{
								this.Log.WriteLine(Severity.Alert, (LGID, 0x6BF94A),
									nameof(ChangeDebounceBuffer), nameof(modDebounceBuffer_SignalCallback), ex
								);
							}
						}
					}
				}
				catch (Exception ex)
				{
					this.Log.WriteLine(Severity.Error, (LGID, 0xC49FE2),
						nameof(ChangeDebounceBuffer), nameof(gracePeriodRescanTimer_tick), ex
					);
				}
				finally
				{
					lock (this.scanningSync)
					{
						this.isScanning = false;
					}
				}
			});
		}


		readonly string rootDirectory;
		readonly TimeSpan fileGracePeriod;
		readonly TimeSpan fileGracePeriodRescanInterval;
		readonly Action changedSignalCallback;

		readonly Timer gracePeriodRescanTimer;

		readonly object scanningSync = new();
		readonly object processingSync = new();

		readonly Dictionary<string, FilePathState> fileModRegistry = new(2 * 1024);

		bool isScanning = false;
		bool disposed = false;
	}
}