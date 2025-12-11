//	R0Q4/daniel/
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

using Falael.Core.Query;
using Falael.IO;

using static Falael.Core.Query.RegexLocatorQuery;
using static Falael.Core.Query.HtmlLocatorQuery;

namespace Falael.Utility.Rtoctu;

public class Agent_002_0xE827C5_HtmlSanitation_ClosingTags : Agent
{
	//	Common Constants //
	const ulong ALGO_VER = 0;       //	increment to invalidate cache when code changes break cache compatibility

	const ulong LGID = 0xE827C5;    //	never change, used as XID

	const ulong CACHE_MODDED_TWIG_TIME = 0;
	const ulong CACHE_ORIGINAL_TWIG_TIME = 1;

	//	Common Constants //
	static readonly Path Source_ONOFF_FileGlob =
		new(@$"{nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags)}.*");

	static readonly Path Source_JSON_FilePath =
		new(@$"{nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags)}.json");

	static Regex GetOpeningTagRegex(string tag) =>
		HtmlTagRegex(
			name: tag,
			options: TagOptions.AcceptOpeningTag | TagOptions.CaptureTagName);

	static Regex GetClosingTagRegex(string tag) =>
		HtmlTagRegex(
			name: tag,
			options: TagOptions.AcceptClosingTag | TagOptions.CaptureTagName | TagOptions.Backwards | TagOptions.Anchored);

	static Regex GetInsertBeforeRegex(string text) => new Regex(
		Regex.Escape(text),
		RegexOptions.Compiled | RegexOptions.IgnoreCase);

	static string GetClosingTag(string tag) => $"</{tag}>";

	const int TAG_OpeningTag_Match = 0;
	const int TAG_ClosingTag_Match = 1;
	const int TAG_InsertBeforeText_Match = 2;

	//	Implementation //
	public override bool QueryIsEnabled() =>
		this.AgentContext.SourceRootDir
			.CombineWith(Source_ONOFF_FileGlob)
			.SetFileExtension(Agent_ON)
			.IsFile();

	public override bool RecognizeSource(Path relativeFilePath) =>
		relativeFilePath.IsMatch(Source_ONOFF_FileGlob);

	public override bool RecognizeTarget(Path relativeFilePath) =>
		DefItem.FromFile(this.ProgramContext, this.AgentContext.SourceRootDir
			.CombineWith(Source_JSON_FilePath))
			.ContainsKey(relativeFilePath);

	public override AgentSyncStatus QuerySyncState(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled)
	{
		var defs = DefItem.FromFile(this.ProgramContext, this.AgentContext.SourceRootDir.CombineWith(Source_JSON_FilePath));

		if (relativeSourceFilePath != null) return defs.Select(kvp => _file_Process(kvp.Key.ToPath(), kvp.Value, isEnabled)).Combine(isEnabled);
		else if (relativeTargetFilePath != null) return _file_Process(relativeTargetFilePath.Value, defs[relativeTargetFilePath], isEnabled).Interpret(isEnabled);
		else throw new InvalidOperationException();

		SyncStatus _file_Process(Path relativeTargetFilePath, DefItem defItem, bool isEnabled)
		{
			Debug.Assert(defItem.Tag != null);
			Debug.Assert(defItem.CloseBeforeText != null);

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
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x5BB07A),
					nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(QuerySyncState), "--- INSPECT TWIG ORIGINAL", outcome.lockPath.Value
				);
#endif
				var twigOriginalVersionFileText = outcome.lockPath.Value.ReadText();
				if (!_hasMissingClosingTag(twigOriginalVersionFileText))
				{
					//	NOTE: interpretation of facts about the original twig varies between enabled an disabled state
					//	- if original file has no missing closing tags, twig file it's of no interest to this agent - noop
					//		- report pristine in disabled state and synced in enabled state as both facts are true, effectively preventing the agent from acting on this file
					result = isEnabled ? SyncStatus.Synced : SyncStatus.Pristine;
				}
				else
				{
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x98C6F3),
						nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(QuerySyncState), "--- ALSO INSPECT CURRENT TWIG", twigFilePath
					);
#endif
					var twigFileText = File.ReadAllText(twigFilePath);
					if (_hasMissingClosingTag(twigFileText))
					{
						//	NOTE: interpretation of facts about the twig varies between enabled an disabled state
						//	original file exists and has missing closing tags, twig file also has missing closing tags
						//	- if agent is enabled, sync is required for the twig file to insert missing closing tags, i.e. dirty sync status - will trigger sync
						//	- if agent is disabled, treat the twig file as pristine - both original and current twig file have missing closing tags - no noop
						//		- some other agent has modded it and kept the original file for revert
						result = isEnabled ? SyncStatus.Dirty : SyncStatus.Pristine;
					}
					else
					{
						//	original file exists and has missing closing tags, twig file has no missing closing tags
						//	- if agent is enabled - in sync
						//	- if agent is disabled, revert is required - sync status will trigger revert
						result = SyncStatus.Synced;
					}
				}
			}
			else
			{
#if DEBUG
				this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x511B8A),
					nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(QuerySyncState), "--- INSPECT CURRENT TWIG", twigFilePath
				);
#endif
				//	no original file present, the twig file is unaltered, it's the original file
				var twigFileText = File.ReadAllText(twigFilePath);
				if (!_hasMissingClosingTag(twigFileText))
				{
					//	NOTE: interpretation of facts about the original twig varies between enabled an disabled state
					//	- if original file has no missing closing tags, twig file it's of no interest to this agent - noop
					//		- report pristine in disabled state and synced in enabled state as both facts are true, effectively preventing the agent from acting on this file
					result = isEnabled ? SyncStatus.Synced : SyncStatus.Pristine;
				}
				else
				{
					//	twig file exists, has missing closing tags, and is unprocessed
					//	- if agent is enabled, sync is required - pristine status will trigger sync
					//	- if agent is disabled, already pristine - noop
					result = SyncStatus.Pristine;
				}
			}

			bool _hasMissingClosingTag(string twigFileText)
			{
				var result = false;
				var rlq = new RegexLocatorQuery(twigFileText)
					.WhileFailed(rlq => rlq
						.FindOne(TAG_OpeningTag_Match, GetOpeningTagRegex(defItem.Tag))
							.Fail_IfNotFound(TAG_OpeningTag_Match, $"No {defItem.Tag} opening tag found.")
							.TrimRangeStart()
						.PushRange()
						.FindOne(TAG_InsertBeforeText_Match, GetInsertBeforeRegex(defItem.CloseBeforeText))
							.Fail_IfNotFound(TAG_InsertBeforeText_Match, $"No {defItem.CloseBeforeText} found.")
							.TrimRangeEnd()
						.FindOneBackwards(TAG_ClosingTag_Match, GetClosingTagRegex(defItem.Tag))
							.Fail_IfFound(TAG_ClosingTag_Match, $"{defItem.Tag} closing tag found.")	//	looking for a case of missing closing tag, when found we consider it success
						.PopRange()
					)
					.Commit()

					.OnFail(TAG_INFINITE_LOOP, (rlq, tag) => { })    //	default to false, all tags closed
					.OnFail(TAG_OpeningTag_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
					.OnFail(TAG_InsertBeforeText_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
					.OnFail(TAG_ClosingTag_Match, (rlq, tag) => Debug.Fail(nameof(TAG_ClosingTag_Match)))	//	not expected, loop goes infinite if closing tag has been found
					.OnSuccess(rlq =>
					{
						result = true;  //	found an opening tag with a missing closing tag immediately before the next "CloseBeforeText"
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
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xB8CAFB),
				nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(QuerySyncState), "--- RESULT", twigFilePath, result + (isEnabled ? "Enabled" : "Disabled")
			);
#endif
			return result;
		}
	}

	public override void EnsureAppliedOnTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		var defs = DefItem.FromFile(this.ProgramContext, this.AgentContext.SourceRootDir
				.CombineWith(Source_JSON_FilePath));

		if (relativeSourceFilePath != null) defs
				.ToList()
				.ForEach(kvp => { _file_Process(kvp.Key.ToPath(), kvp.Value); });
		else if (relativeTargetFilePath != null) _file_Process(relativeTargetFilePath.Value, defs[relativeTargetFilePath]);
		else throw new InvalidOperationException();

		void _file_Process(Path relativeTargetFilePath, DefItem defItem)
		{
			Debug.Assert(defItem.Tag != null);
			Debug.Assert(defItem.CloseBeforeText != null);

			var cache = this.AgentContext.Cache;

			//	twig closing tag insertion
			{
				var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);
				var twigFileText = File.ReadAllText(twigFilePath);
				var rlq = new RegexLocatorQuery(twigFileText)
					.WhileFailed(rlq => rlq
						.FindOne(TAG_OpeningTag_Match, GetOpeningTagRegex(defItem.Tag))
							.TrimRangeStart()
							.Fail_IfNotFound(TAG_OpeningTag_Match, $"No {defItem.Tag} opening tag found.")
						.PushRange()
						.FindOne(TAG_InsertBeforeText_Match, GetInsertBeforeRegex(defItem.CloseBeforeText))
							.TrimRangeEnd()
							.Fail_IfNotFound(TAG_InsertBeforeText_Match, $"No {defItem.CloseBeforeText} found.")
						.FindOneBackwards(TAG_ClosingTag_Match, GetClosingTagRegex(defItem.Tag))
							.Fail_IfFound(TAG_ClosingTag_Match, $"{defItem.Tag} closing tag found.")
						.PopRange()
					)
					.Commit()

					.OnFail(TAG_INFINITE_LOOP, (rlq, tag) =>	//	all tags closed
					{
						#region Cache Handling

						//	reaching this point means that the cache was wrongly invalidated, validate now
						cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

						#endregion
					})
					.OnFail(TAG_OpeningTag_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
					.OnFail(TAG_InsertBeforeText_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
					.OnFail(TAG_ClosingTag_Match, (rlq, tag) => Debug.Fail(nameof(TAG_ClosingTag_Match)))   //	not expected, loop goes infinite if closing tag has been found
					.OnSuccess(rlq =>
					{
						this.FileLock_SetOwnXid(twigFilePath);
						rlq
							.GetLastFindingByTag(TAG_InsertBeforeText_Match)
							.Edit()
							.InsertBefore(GetClosingTag(defItem.Tag))
							.Commit();

						File.WriteAllText(twigFilePath, rlq.Subject);

						#region Cache Handling

						cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

						#endregion
#if DEBUG
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x483EAF),
							nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(EnsureAppliedOnTarget), "--- CLOSING TAG INSERTED", defItem.Tag
						);
#endif
					});
			}
		}
	}

	public override void EnsureOriginalTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		var defs = DefItem.FromFile(this.ProgramContext, this.AgentContext.SourceRootDir
				.CombineWith(Source_JSON_FilePath));

		if (relativeSourceFilePath != null) defs
				.ToList()
				.ForEach(kvp => { _file_Process(kvp.Key.ToPath()); });
		else if (relativeTargetFilePath != null) _file_Process(relativeTargetFilePath.Value);
		else throw new InvalidOperationException();

		void _file_Process(Path relativeTargetFilePath)
		{
			var cache = this.AgentContext.Cache;

			//	twig closing tag insertion
			{
				var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);
				var outcome = this.FileLock_RemoveOwnXid(twigFilePath, throwOnPristine: false);
#if DEBUG
				if (outcome.lockPath != null) this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xCCF6EF),
					nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(EnsureAppliedOnTarget), "--- REVERT TWIG", outcome.lockPath.Value
				);
#endif
				#region Cache Handling

				cache.Set(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

				#endregion
			}
		}
	}

	//	Nested Types //
	#region Nested Types

	public class DefItem
	{
		[JsonPropertyName("tag")]
		public string? Tag;

		[JsonPropertyName("closeBeforeText")]
		public string? CloseBeforeText;

		public static Dictionary<string, DefItem> FromFile(IFalaelContext context, Path filePath)
		{
			try
			{
				return ParseDictJson(context, filePath.ReadText());
			}
			catch (Exception ex)
			{
				context.Log.WriteLine(Severity.Alert, (LGID, 0xEAA125),
					nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(DefItem), nameof(ParseDictJson), ex
				);
				return [];
			}
		}

		public static Dictionary<string, DefItem> ParseDictJson(IFalaelContext context, string json)
		{
			try
			{
				var dict = JsonSerializer.Deserialize<Dictionary<string, DefItem>>(json, new JsonSerializerOptions { IncludeFields = true }) ?? throw new FormatException(json);
				var result = dict
					.Select(kvp => new KeyValuePair<string, DefItem>(kvp.Key.ToPath(), kvp.Value))
					.ToDictionary();
				return result;
			}
			catch (Exception ex)
			{
				context.Log.WriteLine(Severity.Alert, (LGID, 0xB565E7),
					nameof(Agent_002_0xE827C5_HtmlSanitation_ClosingTags), nameof(DefItem), nameof(ParseDictJson), ex
				);
				return [];
			}
		}
	}

	#endregion

	//	Utility //


	//	Common //
	#region Common

	public Agent_002_0xE827C5_HtmlSanitation_ClosingTags(ProgramContext programContext, AgentContext agentContext, Configuration configuration)
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
