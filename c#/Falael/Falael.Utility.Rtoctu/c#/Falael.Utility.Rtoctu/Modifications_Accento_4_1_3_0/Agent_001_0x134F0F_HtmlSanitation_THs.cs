//	R0Q4/daniel/
using System.Text.RegularExpressions;

using Falael.Core.Query;
using Falael.IO;

using static Falael.Core.Query.HtmlLocatorQuery;

namespace Falael.Utility.Rtoctu;

public class Agent_001_0x134F0F_HtmlSanitation_THs : Agent
{
	//	Common Constants //
	const ulong ALGO_VER = 0;       //	increment to invalidate cache when code changes break cache compatibility

	const ulong LGID = 0x134F0F;    //	never change, used as XID

	const ulong CACHE_MODDED_TWIG_TIME = 0;
	const ulong CACHE_ORIGINAL_TWIG_TIME = 1;

	//	Common Constants //
	static readonly Path Source_ONOFF_FilePath =
		new(@$"{nameof(Agent_001_0x134F0F_HtmlSanitation_THs)}.*");

	static readonly Path Target_Glob =
		new(@"*.twig");

	static readonly Regex Target_TH_Locator_Regex = 
		HtmlTagRegex(
			name: "th", 
			options: TagOptions.AcceptOpeningTag | TagOptions.AcceptClosingTag | TagOptions.CaptureTagName);

	const int TAG_TH_Matches = 0;

	//	Implementation //
	public override bool QueryIsEnabled() =>
		this.AgentContext.SourceRootDir
			.CombineWith(Source_ONOFF_FilePath)
			.SetFileExtension(Agent_ON)
			.IsFile();

	public override bool RecognizeSource(Path relativeFilePath) =>
		relativeFilePath.IsMatch(Source_ONOFF_FilePath);

	public override bool RecognizeTarget(Path relativeFilePath) =>
		this.AgentContext.TargetRootDir
			.CombineWith(relativeFilePath)
			.IsMatch(Target_Glob);

	public override AgentSyncStatus QuerySyncState(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled)
	{
		if (relativeSourceFilePath != null) return this.AgentContext.TargetRootDir
			.EnumerateFiles(Target_Glob, recursive: true)
			.ToRelativePaths(this.AgentContext.TargetRootDir)
			.Select(v => _file_Process(v, isEnabled))
			.Combine(isEnabled);
		else if (relativeTargetFilePath != null) return _file_Process(relativeTargetFilePath.Value, isEnabled).Interpret(isEnabled);
		else throw new InvalidOperationException();

		SyncStatus _file_Process(Path relativeTargetFilePath, bool isEnabled)
		{
			var cache = this.AgentContext.Cache;

			#region Cache Handling

			var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);

			//	NOTE: do cache delete here and not on Ensure* because Ensure* might not be able to delete the respective cache entry due to an error, leaving the agent in an irrivesably broken state
			//		- possible reason would be external application termination during Ensure* execution w/o the option to update cache before exit
			//		- possible solution to avoid repeated deletion attempts of inexisting cache keys
			//			- enable cache single transaction management (see JsonFileCache.cs TODO)
			//			- move cache update to respective Ensure* methods
			//	NOTE: interpretation of cache varies between enabled an disabled state
			if (isEnabled) cache.Delete(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver);
			else cache.Delete(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver);

			//	NOTE: interpretation of cache varies between enabled an disabled state
			if (isEnabled)
			{
				//	when enabled, equal times mean "yes, in sync", can skip heavier twig file read and parsing
				if (twigFilePath.FileInfo().LastWriteTimeUtc == cache.GetValue(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, DateTime.MinValue)) return SyncStatus.Synced;
			}
			else
			{
				//	when disabled, equal times mean "yes, pristine", can skip heavier twig file read and parsing
				if (twigFilePath.FileInfo().LastWriteTimeUtc == cache.GetValue(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, DateTime.MinValue)) return SyncStatus.Pristine;
			}

			//	in enabled and disabled state alike, different times mean potentially "dirty", establish sync status based on twig file html artifacts

			#endregion

			SyncStatus result;
			var outcome = this.FileLock_LookupOwnXid(twigFilePath);
			if (outcome.lockPath != null)
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x92E74A),
					nameof(Agent_001_0x134F0F_HtmlSanitation_THs), nameof(QuerySyncState), "--- INSPECT TWIG ORIGINAL", outcome.lockPath.Value
				);
#endif
				var twigOriginalVersionFileText = outcome.lockPath.Value.ReadText();
				if (!_hasThTags(twigOriginalVersionFileText))
				{
					//	NOTE: interpretation of facts about the original twig varies between enabled an disabled state
					//	- if original file has no THs, twig file it's of no interest to this agent - noop
					//		- report pristine in disabled state and synced in enabled state as both facts are true, effectively preventing the agent from acting on this file
					result = isEnabled ? SyncStatus.Synced : SyncStatus.Pristine;
				}
				else
				{
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xFE00EA),
						nameof(Agent_001_0x134F0F_HtmlSanitation_THs), nameof(QuerySyncState), "--- ALSO INSPECT CURRENT TWIG", twigFilePath
					);
#endif
					var twigFileText = File.ReadAllText(twigFilePath);
					if (_hasThTags(twigFileText))
					{
						//	NOTE: interpretation of facts about the twig varies between enabled an disabled state
						//	original file exists and has TH tags, twig file also has TH tags
						//	- if agent is enabled, sync is required for the twig file to remove TH tags, i.e. dirty sync status - will trigger sync
						//	- if agent is disabled, treat the twig file as pristine - both original and current twig file have THs - no noop
						//		- some other agent has modded it and kept the original file for revert
						result = isEnabled ? SyncStatus.Dirty : SyncStatus.Pristine;
					}
					else
					{
						//	original file exists and has TH tags, twig file has no TH tags
						//	- if agent is enabled - in sync
						//	- if agent is disabled, revert is required - sync status will trigger revert
						result = SyncStatus.Synced;
					}
				}
			}
			else
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x119C08),
					nameof(Agent_001_0x134F0F_HtmlSanitation_THs), nameof(QuerySyncState), "--- INSPECT CURRENT TWIG", twigFilePath
				);
#endif

				//	no original file present, the twig file is unaltered, it's the original file
				var twigFileText = File.ReadAllText(twigFilePath);
				if (!_hasThTags(twigFileText))
				{
					//	NOTE: interpretation of facts about the original twig varies between enabled an disabled state
					//	- if original file has no THs, twig file it's of no interest to this agent - noop
					//		- report pristine in disabled state and synced in enabled state as both facts are true, effectively preventing the agent from acting on this file
					result = isEnabled ? SyncStatus.Synced : SyncStatus.Pristine;
				}
				else
				{
					//	twig file exists, has TH tags, and is unprocessed
					//	- if agent is enabled, sync is required - pristine status will trigger sync
					//	- if agent is disabled, already pristine - noop
					result = SyncStatus.Pristine;
				}
			}

			bool _hasThTags(string twigFileText)
			{
				var result = false;
				var rlq = new RegexLocatorQuery(twigFileText)
					.FindAll(TAG_TH_Matches, Target_TH_Locator_Regex)
					.Fail_IfNotFound(TAG_TH_Matches, "No TH tags found.")
					.Commit()

					.OnSuccess(rlq =>
					{
						result = true;
					});
				return result;
			}

			#region Cache Handling

			//	NOTE: interpretation of cache varies between enabled an disabled state
			//	- cache that fact if the file is up-to-date

			if (isEnabled && result == SyncStatus.Synced) cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);
			if (!isEnabled && result == SyncStatus.Pristine) cache.Set(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

			#endregion

#if DEBUG
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x6FC770),
				nameof(Agent_001_0x134F0F_HtmlSanitation_THs), nameof(QuerySyncState), "--- RESULT", twigFilePath, result + (isEnabled ? "Enabled" : "Disabled")
			);
#endif
			return result;
		}
	}


	public override void EnsureAppliedOnTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		if (relativeSourceFilePath != null)
			this.AgentContext.TargetRootDir
				.EnumerateFiles(Target_Glob, recursive: true)
				.ToRelativePaths(this.AgentContext.TargetRootDir)
				.ToList()
				.ForEach(_file_Process);
		else if (relativeTargetFilePath != null) _file_Process(relativeTargetFilePath.Value);
		else throw new InvalidOperationException();

		void _file_Process(Path relativeTargetFilePath)
		{
			var cache = this.AgentContext.Cache;

			//	twig TH replacement
			{
				var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);
				var twigFileText = File.ReadAllText(twigFilePath);
				var rlq = new RegexLocatorQuery(twigFileText)
					.FindAll(TAG_TH_Matches, Target_TH_Locator_Regex)
					.Fail_IfNotFound(TAG_TH_Matches, "No TH tags found.")
					.Commit()

					.OnSuccess(rlq =>
					{
						this.FileLock_SetOwnXid(twigFilePath);
						var finding = rlq.GetLastFindingByTag(TAG_TH_Matches);
						finding
							.Edit()
							.ReplaceAll((m, i, f, rlq) => m.ReplaceGroup(1, "td"))
							.Commit();

						File.WriteAllText(twigFilePath, rlq.Subject);
						
						#region Cache Handling

						cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

						#endregion
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x0C36E9),
							nameof(Agent_001_0x134F0F_HtmlSanitation_THs), nameof(EnsureAppliedOnTarget), "--- TH TAG(S) REPLACED", finding.FindingMatches.Count
						);
#endif
					});
			}
		}
	}

	public override void EnsureOriginalTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		if (relativeSourceFilePath != null)
			this.AgentContext.TargetRootDir
				.EnumerateFiles(Target_Glob, recursive: true)
				.ToRelativePaths(this.AgentContext.TargetRootDir)
				.ToList()
				.ForEach(_file_Process);
		else if (relativeTargetFilePath != null) _file_Process(relativeTargetFilePath.Value);
		else throw new InvalidOperationException();

		void _file_Process(Path relativeTargetFilePath)
		{
			var cache = this.AgentContext.Cache;

			//	twig TH replacement
			{
				var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);
				var outcome = this.FileLock_RemoveOwnXid(twigFilePath, throwOnPristine: false);
#if DEBUG
				if (outcome.lockPath != null) this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xAEB6E1),
					nameof(Agent_001_0x134F0F_HtmlSanitation_THs), nameof(EnsureAppliedOnTarget), "--- REVERT TWIG", outcome.lockPath.Value
				);
#endif
				#region Cache Handling

				cache.Set(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

				#endregion
			}
		}
	}

	//	Common //
	#region Common

	public Agent_001_0x134F0F_HtmlSanitation_THs(ProgramContext programContext, AgentContext agentContext, Configuration configuration)
		: base(programContext, agentContext)
	{
		this.configuration = configuration;
	}

	[ConfigurationClass]
	public class Configuration
	{
		//[ConfigurationField("primeAgent.foo")]
		//public string PrimeAgent_Foo { get; init; } = @"bar";
	}

	readonly Configuration configuration;

	public override ulong XID => LGID;

	public override ulong Ver => ALGO_VER;

	#endregion
}
