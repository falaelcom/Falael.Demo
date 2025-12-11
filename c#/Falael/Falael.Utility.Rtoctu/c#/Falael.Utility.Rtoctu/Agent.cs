//	R0Q4/daniel/20250829

using System.Diagnostics;

using Falael.IO;

using static Falael.Utility.Rtoctu.Agent;

namespace Falael.Utility.Rtoctu
{
	public static class AgentExtensions
	{
		public static AgentSyncStatus Interpret(this SyncStatus syncState, bool isEnabled)
		{
			if (isEnabled)
			{
				switch (syncState)
				{
					case SyncStatus.Pristine: return AgentSyncStatus.PristineEnabled;
					case SyncStatus.Dirty: return AgentSyncStatus.DirtyEnabled;
					case SyncStatus.Synced: return AgentSyncStatus.SyncedEnabled;
					default: throw new NotImplementedException(syncState.ToString());
				}
			}
			switch (syncState)
			{
				case SyncStatus.Pristine: return AgentSyncStatus.PristineDisabled;
				case SyncStatus.Dirty: return AgentSyncStatus.DirtyDisabled;
				case SyncStatus.Synced: return AgentSyncStatus.SyncedDisabled;
				default: throw new NotImplementedException(syncState.ToString());
			}
		}

		public static AgentSyncStatus Combine(this IEnumerable<SyncStatus> syncStates, bool isEnabled) => syncStates.Combine().Interpret(isEnabled);
	}

	public abstract class Agent : FalaelContextAware
	{
		public static readonly string Agent_ON = "ON";
		public static readonly string Agent_OFF = "OFF";

		public Agent(ProgramContext programContext, AgentContext agentContext)
			: base(programContext)
		{
			this.AgentContext = agentContext;
		}

		#region Exceptions

		public class CannotApplyException(Agent agent, object? tag, string? message = "Cannot apply.", Exception? innerException = null) : Exception(message + " Tag: " + tag?.ToString() ?? "(null)" + ".", innerException)
		{
			public Agent Agent { get; } = agent;
		}

		#endregion

		#region Nested Types

		public enum AgentSyncStatus
		{
			PristineEnabled,
			DirtyEnabled,
			SyncedEnabled,
			PristineDisabled,
			DirtyDisabled,
			SyncedDisabled,
		}

		#endregion

		#region Lock File Handling

		public static readonly string Agent_Extension_OriginalVersion =
			new(@".xmod-original");

		public (string[]? strXids, Path? lockPath, bool lockHasOwnXid) FileLock_LookupOwnXid(Path currentFilePath, string? _strXid = null)
		{
			var strXidOwn = _strXid == null ? ILog.Hex(this.XID) : _strXid;
			var glob = currentFilePath
				.AppendExtension(".*")
				.AppendExtension(Agent_Extension_OriginalVersion);
			var dir = currentFilePath.GetDirectoryPath();
			var files = dir.EnumerateFiles(glob);
			var fileCount = files.Count();
			switch (fileCount)
			{
				case 0: return (null, null, false);
				case 1:
					var lockPath = files.First();
					var strXids = lockPath.FileName.Substring(
						currentFilePath.FileName.Length + 1,
						lockPath.FileName.Length - currentFilePath.FileName.Length - 1 - Agent_Extension_OriginalVersion.Length)
					.Split('-', StringSplitOptions.RemoveEmptyEntries);
					return (strXids, lockPath, strXids.Contains(strXidOwn));
				default: throw new InvalidOperationException("Multiple original fails not supported.");
			}
		}

		public (string[]? strXids, Path lockPath, bool lockHasOwnXid) FileLock_SetOwnXid(Path currentFilePath)
		{
			var strXidOwn = ILog.Hex(this.XID);
			var outcome = this.FileLock_LookupOwnXid(currentFilePath, strXidOwn);

			if (outcome.lockPath == null)	//	no lock file
			{
				string[] strXids = [strXidOwn];

				var copiedFilePath = currentFilePath
					.AppendExtension('.' + string.Join('-', strXids))
					.AppendExtension(Agent_Extension_OriginalVersion);
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (this.XID, 0x56EAE0),
					nameof(Agent), nameof(FileLock_SetOwnXid), "--- CREATE ORIGINAL FILE COPY", currentFilePath, "-->", copiedFilePath
				);
#endif
				currentFilePath.CopyAsFile(copiedFilePath, overwrite: true);
				return (strXids.ToArray(), copiedFilePath, true);
			}
			else
			{
				Debug.Assert(outcome.strXids != null);
				if (outcome.strXids.Contains(strXidOwn)) return (outcome.strXids, outcome.lockPath.Value, true);	//	already present, nothing changes

				var strXids = outcome.strXids
					.Append(strXidOwn)
					.ToArray();

				var copiedFilePath = currentFilePath
					.AppendExtension('.' + string.Join('-', strXids))
					.AppendExtension(Agent_Extension_OriginalVersion);

#if DEBUG
				this.Log.WriteLine(LogDensity.LD_7_7, (this.XID, 0xEF97A5),
					nameof(Agent), nameof(FileLock_SetOwnXid), "--- RENAME ORIGINAL FILE COPY", outcome.lockPath.Value, "-->", copiedFilePath
				);
#endif
				outcome.lockPath.Value.CopyAsFile(copiedFilePath, overwrite: true);
				outcome.lockPath.Value.DeleteAsFile();
				return (strXids, copiedFilePath, true);
			}
		}

		public (string[]? strXids, Path? lockPath, bool lockHasOwnXid) FileLock_RemoveOwnXid(Path currentFilePath, bool throwOnPristine = true)
		{
			var strXidOwn = ILog.Hex(this.XID);
			var outcome = this.FileLock_LookupOwnXid(currentFilePath, strXidOwn);

			if (outcome.lockPath == null)   //	no lock file
			{
				if (throwOnPristine) throw new InvalidOperationException("Already in pristine state (1).");
				return (outcome.strXids, outcome.lockPath, false);
			}
			
			Debug.Assert(outcome.strXids != null);
			if (!outcome.lockHasOwnXid)
			{
				if (throwOnPristine) throw new InvalidOperationException("Already in pristine state (2).");
				return (outcome.strXids, outcome.lockPath, false);
			}

			switch (outcome.strXids.Count())
			{
				case 1:						//	only own XID
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_7_7, (this.XID, 0xF4179E),
						nameof(Agent), nameof(FileLock_RemoveOwnXid), "--- RESTORE FROM ORIGINAL FILE", outcome.lockPath.Value, "-->", currentFilePath
					);
#endif
					outcome.lockPath.Value.CopyAsFile(currentFilePath, overwrite: true);
					outcome.lockPath.Value.DeleteAsFile();
					return (null, null, false);
				default:
					var strXids = outcome.strXids
						.Where(v => v != strXidOwn)
						.ToArray();

					var copiedFilePath = currentFilePath
						.AppendExtension('.' + string.Join('-', strXids))
						.AppendExtension(Agent_Extension_OriginalVersion);
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_7_7, (this.XID, 0x5047FC),
							nameof(Agent), nameof(FileLock_RemoveOwnXid), "--- RENAME ORIGINAL FILE COPY", outcome.lockPath.Value, "-->", copiedFilePath
					);
#endif
					outcome.lockPath.Value.CopyAsFile(currentFilePath, overwrite: true);	//	restore to pristine state, this will trigger all enabled agents to apply their changes
					outcome.lockPath.Value.CopyAsFile(copiedFilePath, overwrite: true);
					outcome.lockPath.Value.DeleteAsFile();
					return (strXids, copiedFilePath, false);
			}
		}

		#endregion


		public abstract ulong XID { get; }

		public abstract ulong Ver { get; }



		public abstract bool RecognizeSource(Path relativeFilePath);

		public abstract bool RecognizeTarget(Path relativeFilePath);

		public abstract AgentSyncStatus QuerySyncState(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled);

		public virtual AgentSyncStatus GetSyncStatus(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled)
		{
			return this.QuerySyncState(relativeSourceFilePath, relativeTargetFilePath, isEnabled);
		}

		public virtual void Sync(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled)
		{
			if (isEnabled)
			{
#if DEBUG
				if(relativeSourceFilePath != null) this.Log.WriteLine(LogDensity.LD_5_7, (this.XID, 0x40D714),
					nameof(Agent), nameof(Sync), this.GetType().Name, nameof(EnsureAppliedOnTarget), nameof(relativeSourceFilePath), relativeSourceFilePath
				);
				else this.Log.WriteLine(LogDensity.LD_5_7, (this.XID, 0xC9B779),
					nameof(Agent), nameof(Sync), this.GetType().Name, nameof(EnsureAppliedOnTarget), nameof(relativeTargetFilePath), relativeTargetFilePath
				);
#endif
				this.EnsureAppliedOnTarget(relativeSourceFilePath, relativeTargetFilePath);
			}
			else
			{
#if DEBUG
				if (relativeSourceFilePath != null) this.Log.WriteLine(LogDensity.LD_5_7, (this.XID, 0x05F7F3),
					nameof(Agent), nameof(Sync), this.GetType().Name, nameof(EnsureOriginalTarget), nameof(relativeSourceFilePath), relativeSourceFilePath
				);
				else this.Log.WriteLine(LogDensity.LD_5_7, (this.XID, 0xCCA0E9),
					nameof(Agent), nameof(Sync), this.GetType().Name, nameof(EnsureOriginalTarget), nameof(relativeTargetFilePath), relativeTargetFilePath
				);
#endif
				this.EnsureOriginalTarget(relativeSourceFilePath, relativeTargetFilePath);
			}
		}


		/// <summary>
		/// Tests if all conditions are met to apply changes to target, such as all required source files are available.
		/// </summary>
		public abstract bool QueryIsEnabled();

		public abstract void EnsureAppliedOnTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath);

		public abstract void EnsureOriginalTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath);


		protected ProgramContext ProgramContext => (ProgramContext)this.CoreContext;

		public AgentContext AgentContext { get; }
	}
}
