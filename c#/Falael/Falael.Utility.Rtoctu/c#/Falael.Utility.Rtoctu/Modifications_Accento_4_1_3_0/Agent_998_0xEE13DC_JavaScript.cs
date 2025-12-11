//	R0Q4/daniel/
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;

using Falael.Core.Query;
using Falael.IO;

using static Falael.Core.Query.RegexLocatorQuery;
using static Falael.Core.Query.HtmlLocatorQuery;

namespace Falael.Utility.Rtoctu;

public class Agent_998_0xEE13DC_JavaScript : Agent
{
	//	Common Constants //
	const ulong ALGO_VER = 0;       //	increment to invalidate cache when code changes break cache compatibility

	const ulong LGID = 0xEE13DC;    //	never change, used as XID

	const string CACHE_TWIG_GRP = "";
	const ulong CACHE_TWIG_TIME = 0;

	//	Common Constants //
	static readonly string Source_Glob =
		"*.js";

	static readonly Path Source_BaseJavaScriptDirectory =
		new(@"");

	static readonly Path Target_JavaScriptDirectory =
		new(@"catalog\view\javascript\accento");

	static readonly Path Target_JavaScriptInclude_TwigFilePath =
		new(@"catalog\view\template\common\header.twig");

	static readonly Regex Target_JavaScriptInclude_Locator_Regex =
		HtmlTagRegex(
			name: "script",
			options: TagOptions.AcceptOpeningTag | TagOptions.AcceptClosingTag,
			attributeFilters:
			[
				new("src", "catalog/view/javascript/common.js")
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
			.CombineWith(Source_BaseJavaScriptDirectory)
			.HasFiles(Source_Glob, recursive: true);

	public override bool RecognizeSource(Path relativeFilePath) =>
		this.AgentContext.SourceRootDir
			.CombineWith(Source_BaseJavaScriptDirectory)
			.IsRelativeTo(relativeFilePath.GetDirectoryPath().GetFullPath(this.AgentContext.SourceRootDir))
		&& relativeFilePath.IsMatch(Source_Glob);

	public override bool RecognizeTarget(Path relativeFilePath) =>
		relativeFilePath.GetDirectoryPath() == Target_JavaScriptDirectory ||
		relativeFilePath == Target_JavaScriptInclude_TwigFilePath;

	public override AgentSyncStatus QuerySyncState(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled) => new SyncStatus[]
		{
			this.QuerySyncState_JsFiles(isEnabled),
			this.QuerySyncState_TwigInsertion(isEnabled)
		}
		.Combine(isEnabled);

	protected SyncStatus QuerySyncState_JsFiles(bool isEnabled)
	{
		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseJavaScriptDirectory);
		var targetDir = new Path(this.AgentContext.TargetRootDir, Target_JavaScriptDirectory);
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x316661),
			nameof(Agent_998_0xEE13DC_JavaScript), nameof(QuerySyncState_JsFiles), "--- INSPECT JS FILES", nameof(sourceDir), sourceDir, "vs.", nameof(targetDir), targetDir
		);
#endif
		var result = targetDir.GetSyncState(sourceDir, Source_Glob, recursive: true);
#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x67F328),
			nameof(Agent_998_0xEE13DC_JavaScript), nameof(QuerySyncState_JsFiles), "--- RESULT", nameof(sourceDir), sourceDir, "vs.", nameof(targetDir), targetDir, result + (isEnabled ? "Enabled" : "Disabled")
		);
#endif
		return result;
	}

	protected SyncStatus QuerySyncState_TwigInsertion(bool isEnabled)
	{
		var cache = this.AgentContext.Cache;

		var twigFilePath = new Path(this.AgentContext.TargetRootDir, Target_JavaScriptInclude_TwigFilePath);

#if DEBUG
		this.Log.WriteLine(LogDensity.LD_6_7, (LGID, 0x42767C),
			nameof(Agent_998_0xEE13DC_JavaScript), nameof(QuerySyncState_TwigInsertion), "--- INSPECT TWIG FILE", nameof(twigFilePath), twigFilePath
		);
#endif

		#region Cache Handling

		//	NOTE: interpretation of cache varies between enabled an disabled state:
		//		- because of the reuse of the same cache key in both enabled and disabled states, when transitioning from enabled and disabled and back
		//			- cache use will only work because of the js file sync dirty status detection (this agent is disabled by removing all js files from the source)
		//			- cache use only detects changes to the twig file while already enabled or disabled and marks the agent as synced or pristine
		//				- enabled, synced = no action needed, skip the heavier twig file read and parsing
		//				- disabled, pristine = no action needed, skip the heavier twig file read and parsing
		//				- otherwise = potentially dirty, establish sync status based on twig file html artifacts

		if (twigFilePath.FileInfo().LastWriteTimeUtc == cache.GetValue(this.XID, CACHE_TWIG_GRP, CACHE_TWIG_TIME, this.Ver, DateTime.MinValue))
			return isEnabled
				? SyncStatus.Synced
				: SyncStatus.Pristine;

		#endregion

		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseJavaScriptDirectory);

		var result = SyncStatus.Pristine;
		var rlq = new RegexLocatorQuery(File.ReadAllText(twigFilePath))
			.FindOne(Target_JavaScriptInclude_Locator_Regex)
			.Fail_IfNotFound(TAG_InsertionPoint, "Reference javascript include-tag not found.")
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
					var jsFiles = sourceDir
						.EnumerateFiles(glob: Source_Glob, recursive: true)
						.ToRelativePaths(sourceDir);
					var insertionText = this.GenerateInsertionText(jsFiles);
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
		this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xF67FC9),
			nameof(Agent_998_0xEE13DC_JavaScript), nameof(QuerySyncState_TwigInsertion), "--- RESULT", nameof(twigFilePath), twigFilePath, result + (isEnabled ? "Enabled" : "Disabled")
		);
#endif
		return result;
	}

	public override void EnsureAppliedOnTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		var cache = this.AgentContext.Cache;

		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseJavaScriptDirectory);

		//	js files
		{
			var targetDir = new Path(this.AgentContext.TargetRootDir, Target_JavaScriptDirectory);
			var outcome = targetDir.Sync(sourceDir, Source_Glob, recursive: true);
#if DEBUG
			foreach (var item in outcome.created)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x55A9D7),
					nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- FILE CREATED", item.GetRelativePath(Target_JavaScriptDirectory)
				);
			}
			foreach (var item in outcome.updated)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x3CB3D0),
					nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- FILE UPDATED", item.GetRelativePath(Target_JavaScriptDirectory)
				);
			}
			foreach (var item in outcome.deleted)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x557501),
					nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- FILE DELETED", item.GetRelativePath(Target_JavaScriptDirectory)
				);
			}
#endif
		}

		//	twig insertion
		{
			var twigFilePath = new Path(this.AgentContext.TargetRootDir, Target_JavaScriptInclude_TwigFilePath);
			var twigFileText = File.ReadAllText(twigFilePath);
			var rlq = new RegexLocatorQuery(twigFileText)
				.FindOne(TAG_InsertionPoint, Target_JavaScriptInclude_Locator_Regex)
				.Throw_IfNotFound("Reference javascript include tag not found.")
				.TrimRangeStart()
				.FindAll(TAG_ExistingInsertions, Target_Insertion_Regex)
				.Fail_IfNotFound(TAG_ExistingInsertions, "No insertion found.")
				.Commit()

				.OnFail(TAG_InsertionPoint, (rlq, tag) => Debug.Fail("case TAG_INSERTION_POINT is expected to throw an exception on fail and never reach this point"))
				.OnFail(TAG_ExistingInsertions, (rlq, tag) =>					//	no insertion
				{
					//	insert insertion
					var jsFiles = sourceDir
						.EnumerateFiles(glob: Source_Glob, recursive: true)
						.ToRelativePaths(sourceDir);
					var insertionText = this.GenerateInsertionText(jsFiles);
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
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xDA7C08),
						nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- INSERTION(S) APPLIED", 1
					);
#endif
				})
				.OnSuccess(rlq =>													//	existing insertion
				{
#if DEBUG
					var existingMatchesFinding = rlq.GetLastFindingByTag(TAG_ExistingInsertions);
					if (existingMatchesFinding.FindingMatches.Count != 0)
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x03C0D4),
							nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- INSERTIONS DELETED", existingMatchesFinding.FindingMatches.Count
					);
#endif
					var jsFiles = sourceDir
						.EnumerateFiles(glob: Source_Glob, recursive: true)
						.ToRelativePaths(sourceDir);
					var insertionText = this.GenerateInsertionText(jsFiles);

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
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x900865),
						nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- INSERTION(S) APPLIED", 1
					);
#endif
				});
		}
	}

	public override void EnsureOriginalTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
	{
		var cache = this.AgentContext.Cache;

		var sourceDir = new Path(this.AgentContext.SourceRootDir, Source_BaseJavaScriptDirectory);

		//	js files
		{
			var targetDir = new Path(this.AgentContext.TargetRootDir, Target_JavaScriptDirectory);
			var outcome = targetDir.Sync(sourceDir, Source_Glob, recursive: true);
#if DEBUG
			foreach (var item in outcome.created)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x162C66),
					nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- FILE CREATED", item.GetRelativePath(Target_JavaScriptDirectory)
				);
			}
			foreach (var item in outcome.updated)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xE6EBBE),
					nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- FILE UPDATED", item.GetRelativePath(Target_JavaScriptDirectory)
				);
			}
			foreach (var item in outcome.deleted)
			{
				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x343AC5),
					nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- FILE DELETED", item.GetRelativePath(Target_JavaScriptDirectory)
				);
			}
#endif
		}

		//	twig insertion
		{
			var twigFilePath = new Path(this.AgentContext.TargetRootDir, Target_JavaScriptInclude_TwigFilePath);
			var twigFileText = File.ReadAllText(twigFilePath);
			Finding? existingMatchesFinding;
			var rlq = new RegexLocatorQuery(twigFileText)
				.FindOne(TAG_InsertionPoint, Target_JavaScriptInclude_Locator_Regex)
				.Throw_IfNotFound("Reference javascript include tag not found.")
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
						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x5C22BB),
							nameof(Agent_998_0xEE13DC_JavaScript), nameof(EnsureAppliedOnTarget), "--- INSERTIONS REVERTED", existingMatchesFinding.FindingMatches.Count
					);
#endif
				});
		}
	}

	string GenerateInsertionText(IEnumerable<Path> jsFiles)
	{
		if (!jsFiles.Any()) return string.Empty;

		var links = string.Join(string.Empty, jsFiles
			.OrderBy(v => v)
			.Select(file => $@"<script src=""{Target_JavaScriptDirectory}/{file}"" type=""text/javascript""></script>".Replace('\\', '/')
		));

		return string.Format(Target_Insertion_Format, ILog.Hex(this.XID), links);
	}

	//	Common //
	#region Common

	public Agent_998_0xEE13DC_JavaScript(ProgramContext programContext, AgentContext agentContext, Configuration configuration)
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