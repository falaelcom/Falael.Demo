//	R0Q4/daniel/
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;

using Falael.Core.Query;
using Falael.IO;

using static Falael.Core.Query.RegexLocatorQuery;
using static Falael.Core.Query.HtmlLocatorQuery;

namespace Falael.Utility.Rtoctu;

public class Agent_999_0x025EB4_Stylesheet : Agent
{
	//	Common Constants //
	const ulong ALGO_VER = 0;       //	increment to invalidate cache when code changes break cache compatibility

	const ulong LGID = 0x025EB4;    //	never change, used as XID

	const string CACHE_TWIG_GRP = "";
	const ulong CACHE_TWIG_TIME = 0;

	//	Common Constants //
	static readonly string Source_Glob =
		"*.css";

	static readonly Path Source_BaseStylesheetDirectory =
		new(@"");

	static readonly Path Target_StylesheetDirectory =
		new(@"catalog\view\stylesheet\accento");

	static readonly Path Target_StylesheetInclude_TwigFilePath =
		new(@"catalog\view\template\common\header.twig");

	static readonly Regex Target_StylesheerInclude_Locator_Regex =
		HtmlTagRegex(
			name: "link",
			options: TagOptions.AcceptOpeningTag | TagOptions.AcceptSelfClosingTag,
			attributeFilters:
			[
				new("href", TwigFieldRegex("stylesheet").ToString())
			]);

	static readonly Regex Target_Insertion_Regex = new(
		@$"<x-ins x-data-id=""{ILog.Hex(LGID)}"">([\s\S]*?)</x-ins>",
		RegexOptions.Compiled | RegexOptions.IgnoreCase);

	static readonly string Target_Insertion_Format =
		@"<x-ins x-data-id=""{0}"">{1}</x-ins>";

	const int TAG_InsertionPoint = 1;
	const int TAG_ExistingInsertions = 2;

	//	Implementation //
	public override bool QueryIsEnabled() => 
		this.AgentContext.SourceRootDir
			.CombineWith(Source_BaseStylesheetDirectory)
			.HasFiles(Source_Glob, recursive: true);

	public override bool RecognizeSource(Path relativeFilePath) =>
		this.AgentContext.SourceRootDir
			.CombineWith(Source_BaseStylesheetDirectory)
			.IsRelativeTo(relativeFilePath.GetDirectoryPath().GetFullPath(this.AgentContext.SourceRootDir))
		&& relativeFilePath.IsMatch(Source_Glob);

	public override bool RecognizeTarget(Path relativeFilePath) =>
		relativeFilePath.GetDirectoryPath() == Target_StylesheetDirectory ||
		relativeFilePath == Target_StylesheetInclude_TwigFilePath;

	public override AgentSyncStatus QuerySyncState(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled) => new SyncStatus[]
		{
			this.QuerySyncState_CssFiles(isEnabled),
			this.QuerySyncState_TwigInsertion(isEnabled)
		}
		.Combine(isEnabled);

	protected SyncStatus QuerySyncState_CssFiles(bool isEnabled)
	{
		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseStylesheetDirectory);
		var targetDir = new Path(this.AgentContext.TargetRootDir, Target_StylesheetDirectory);
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x77AB93),
			nameof(Agent_999_0x025EB4_Stylesheet), nameof(QuerySyncState_CssFiles), "--- INSPECT CSS FILES", nameof(sourceDir), sourceDir, "vs.", nameof(targetDir), targetDir
		);
#endif
		var result = targetDir.GetSyncState(sourceDir, Source_Glob, recursive: true);
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0xE3BC32),
			nameof(Agent_999_0x025EB4_Stylesheet), nameof(QuerySyncState_CssFiles), "--- RESULT", nameof(sourceDir), sourceDir, "vs.", nameof(targetDir), targetDir, result + (isEnabled ? "Enabled" : "Disabled")
		);
#endif
		return result;
	}

	protected SyncStatus QuerySyncState_TwigInsertion(bool isEnabled)
	{
		var cache = this.AgentContext.Cache;

		var twigFilePath = new Path(this.AgentContext.TargetRootDir, Target_StylesheetInclude_TwigFilePath);

#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x4BB91D),
			nameof(Agent_999_0x025EB4_Stylesheet), nameof(QuerySyncState_TwigInsertion), "--- INSPECT TWIG FILE", nameof(twigFilePath), twigFilePath
		);
#endif

		#region Cache Handling

		//	NOTE: interpretation of cache varies between enabled an disabled state:
		//		- because of the reuse of the same cache key in both enabled and disabled states, when transitioning from enabled and disabled and back
		//			- cache use will only work because of the css file sync dirty status detection (this agent is disabled by removing all css files from the source)
		//			- cache use only detects changes to the twig file while already enabled or disabled and marks the agent as synced or pristine
		//				- enabled, synced = no action needed, skip the heavier twig file read and parsing
		//				- disabled, pristine = no action needed, skip the heavier twig file read and parsing
		//				- otherwise = potentially dirty, establish sync status based on twig file html artifacts

		if (twigFilePath.FileInfo().LastWriteTimeUtc == cache.GetValue(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, DateTime.MinValue))
			return isEnabled
				? SyncStatus.Synced
				: SyncStatus.Pristine;

		#endregion

		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseStylesheetDirectory);

		var result = SyncStatus.Pristine;
		var rlq = new RegexLocatorQuery(File.ReadAllText(twigFilePath))
			.FindOne(Target_StylesheerInclude_Locator_Regex)
			.Fail_IfNotFound(TAG_InsertionPoint, "Reference stylesheet include-tag not found.")
			.TrimRangeStart()
			.FindAll(TAG_ExistingInsertions, Target_Insertion_Regex)
			.Fail_IfNotFound(TAG_ExistingInsertions, "No insertion found.")
			.Commit()

			.OnFail(TAG_InsertionPoint, (rlq, tag) => throw new CannotApplyException(this, tag))
			.OnFail(TAG_ExistingInsertions, (rlq, tag) => { })  //	defaults to `SyncStatus.Pristine`
			.OnSuccess(rlq =>
			{
				var f = rlq.GetLastFindingByTag(TAG_ExistingInsertions);
				if (f.FindingMatches.Count > 1) result = SyncStatus.Dirty;   //	need to remove multiple insertions
				else
				{
					var cssFiles = sourceDir
						.EnumerateFiles(glob: Source_Glob, recursive: true)
						.ToRelativePaths(sourceDir);
					var insertionText = this.GenerateInsertionText(cssFiles);
					result = f.FindingMatches[0].Value == insertionText
						? SyncStatus.Synced
						: SyncStatus.Dirty;
				}
			});

		#region Cache Handling

		//	NOTE: interpretation of cache varies between enabled an disabled state
		//	- cache that fact if the file is up-to-date

		if (isEnabled && result == SyncStatus.Synced) cache.Set(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);
		if (!isEnabled && result == SyncStatus.Pristine) cache.Set(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

		#endregion

#if DEBUG
		this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x85FCF5),
			nameof(Agent_999_0x025EB4_Stylesheet), nameof(QuerySyncState_TwigInsertion), "--- RESULT", nameof(twigFilePath), twigFilePath, result + (isEnabled ? "Enabled" : "Disabled")
		);
#endif
		return result;
	}

	public override void EnsureAppliedOnTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		var cache = this.AgentContext.Cache;

		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseStylesheetDirectory);

		//	css files
		{
			var targetDir = new Path(this.AgentContext.TargetRootDir, Target_StylesheetDirectory);
			var outcome = targetDir.Sync(sourceDir, Source_Glob, recursive: true);
#if DEBUG
			foreach (var item in outcome.created)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x19EBB3),
					nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- FILE CREATED", item.GetRelativePath(Target_StylesheetDirectory)
				);
			}
			foreach (var item in outcome.updated)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x78E4AB),
					nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- FILE UPDATED", item.GetRelativePath(Target_StylesheetDirectory)
				);
			}
			foreach (var item in outcome.deleted)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xD6F7FF),
					nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- FILE DELETED", item.GetRelativePath(Target_StylesheetDirectory)
				);
			}
#endif
		}

		//	twig insertion
		{
			var twigFilePath = new Path(this.AgentContext.TargetRootDir, Target_StylesheetInclude_TwigFilePath);
			var twigFileText = File.ReadAllText(twigFilePath);
			var rlq = new RegexLocatorQuery(twigFileText)
				.FindOne(TAG_InsertionPoint, Target_StylesheerInclude_Locator_Regex)
				.Throw_IfNotFound("Reference stylesheet include tag not found.")
				.TrimRangeStart()
				.FindAll(TAG_ExistingInsertions, Target_Insertion_Regex)
				.Fail_IfNotFound(TAG_ExistingInsertions, "No insertion found.")
				.Commit()

				.OnFail(TAG_InsertionPoint, (rlq, tag) => Debug.Fail("case TAG_INSERTION_POINT is expected to throw an exception on fail and never reach this point"))
				.OnFail(TAG_ExistingInsertions, (rlq, tag) =>					//	no insertion
				{
					//	insert insertion
					var cssFiles = sourceDir
						.EnumerateFiles(glob: Source_Glob, recursive: true)
						.ToRelativePaths(sourceDir);
					var insertionText = this.GenerateInsertionText(cssFiles);
					rlq
						.GetLastFindingByTag(TAG_InsertionPoint)
						.Edit()
						.InsertAfter(insertionText)
						.Commit();
					File.WriteAllText(twigFilePath, rlq.Subject);
					
					#region Cache Handling

					cache.Set(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

					#endregion

#if DEBUG
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x6F6289),
						nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- INSERTION(S) APPLIED", 1
					);
#endif
				})
				.OnSuccess(rlq =>													//	existing insertion
				{
#if DEBUG
					var existingMatchesFinding = rlq.GetLastFindingByTag(TAG_ExistingInsertions);
					if (existingMatchesFinding.FindingMatches.Count != 0)
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xD52846),
							nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- INSERTIONS DELETED", existingMatchesFinding.FindingMatches.Count
					);
#endif
					var cssFiles = sourceDir
						.EnumerateFiles(glob: Source_Glob, recursive: true)
						.ToRelativePaths(sourceDir);
					var insertionText = this.GenerateInsertionText(cssFiles);

					rlq
						.GetLastFindingByTag(TAG_ExistingInsertions)
						.Edit()
						.RemoveAll()
						.Commit()

						.GetLastFindingByTag(TAG_InsertionPoint)
						.Edit()
						.InsertAfter(insertionText)
						.Commit();

					File.WriteAllText(twigFilePath, rlq.Subject);

					#region Cache Handling

					cache.Set(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

					#endregion
#if DEBUG
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x8A35C9),
						nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- INSERTION(S) APPLIED", 1
					);
#endif
				});
		}
	}

	public override void EnsureOriginalTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		var cache = this.AgentContext.Cache;

		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseStylesheetDirectory);

		//	css files
		{
			var targetDir = new Path(this.AgentContext.TargetRootDir, Target_StylesheetDirectory);
			var outcome = targetDir.Sync(sourceDir, Source_Glob, recursive: true);
#if DEBUG
			foreach (var item in outcome.created)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x97C783),
					nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- FILE CREATED", item.GetRelativePath(Target_StylesheetDirectory)
				);
			}
			foreach (var item in outcome.updated)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xFB0FE0),
					nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- FILE UPDATED", item.GetRelativePath(Target_StylesheetDirectory)
				);
			}
			foreach (var item in outcome.deleted)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x722D66),
					nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- FILE DELETED", item.GetRelativePath(Target_StylesheetDirectory)
				);
			}
#endif
		}

		//	twig insertion
		{
			var twigFilePath = new Path(this.AgentContext.TargetRootDir, Target_StylesheetInclude_TwigFilePath);
			var twigFileText = File.ReadAllText(twigFilePath);
			Finding? existingMatchesFinding;
			var rlq = new RegexLocatorQuery(twigFileText)
				.FindOne(TAG_InsertionPoint, Target_StylesheerInclude_Locator_Regex)
				.Throw_IfNotFound("Reference stylesheet include tag not found.")
				.TrimRangeStart()
				.FindAll(TAG_ExistingInsertions, Target_Insertion_Regex)
				.Fail_IfNotFound(TAG_ExistingInsertions, "No insertion found.")
				.Commit()

				.OnFail(TAG_InsertionPoint, (rlq, tag) => Debug.Fail("case 1")) // case TAG_InsertionPoint is expected to throw an exception on fail and never reach to this point
				.OnFail(TAG_ExistingInsertions, (rlq, tag) => { })              //	no insertions
				.OnSuccess(rlq =>                                                   //	remove existing insertions
				{
					existingMatchesFinding = rlq.GetLastFindingByTag(TAG_ExistingInsertions);
					rlq
						.GetLastFindingByTag(TAG_ExistingInsertions)
						.Edit()
						.RemoveAll()
						.Commit();

					File.WriteAllText(twigFilePath, rlq.Subject);

					#region Cache Handling

					cache.Set(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

					#endregion
#if DEBUG
					if (existingMatchesFinding != null && existingMatchesFinding.FindingMatches.Count != 0)
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x63EEE5),
							nameof(Agent_999_0x025EB4_Stylesheet), nameof(EnsureAppliedOnTarget), "--- INSERTIONS REVERTED", existingMatchesFinding.FindingMatches.Count
					);
#endif
				});
		}
	}

	string GenerateInsertionText(IEnumerable<Path> cssFiles)
	{
		if (!cssFiles.Any()) return string.Empty;

		var links = string.Join(string.Empty, cssFiles
			.OrderBy(v => v)
			.Select(file => $@"<link href=""{Target_StylesheetDirectory}/{file}"" type=""text/css"" rel=""stylesheet""/>".Replace('\\', '/')
		));

		return string.Format(Target_Insertion_Format, ILog.Hex(this.XID), links);
	}

	//	Common //
	#region Common

	public Agent_999_0x025EB4_Stylesheet(ProgramContext programContext, AgentContext agentContext, Configuration configuration)
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