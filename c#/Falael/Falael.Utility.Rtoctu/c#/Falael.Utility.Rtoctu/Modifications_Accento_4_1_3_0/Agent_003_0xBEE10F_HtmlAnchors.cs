//	R0Q4/daniel/20250920
//	- TODO:
//		- attr: x-data-mod="main-menu-start" 
//		- element: <x-mod x-data-mod="main-menu-header-insert" />
//		
//		
//		
//		Understood. Tight list of anchors for **`admin/view/template/design/layout_form.twig`**, ignoring td/th equivalence:
//		
//		---
//		
//		### Route table
//		
//		* `RouteTableHeadStore` → header cell with `{{ entry_store }}`
//		* `RouteTableHeadRoute` → header cell with `{{ entry_route }}`
//		* `RouteTableCellStore` → data cell wrapping `<select>` for `layout_route[route_row][store_id]`
//		* `RouteTableCellRoute` → data cell wrapping `<input>` for `layout_route[route_row][route]`
//		
//		---
//		
//		### Module tables (core)
//		
//		* `ModuleTableColumnLeft` → `<table id="module-column-left">` (used as template source)
//		* `ModuleTableContentTop` → `<table id="module-content-top">`
//		* `ModuleTableContentBottom` → `<table id="module-content-bottom">`
//		* `ModuleTableColumnRight` → `<table id="module-column-right">`
//		* `ModuleCell` → data cell in any module row wrapping `<div class="input-group input-group-sm">`
//		* `ModuleIcons` → `<i …>` inside module action buttons
//		
//		---
//		
//		### Custom module tables (theme only, derived from template)
//		
//		* `ModuleTableFooterLeft` → clone of template with `id="module-footer-left"` / filter `footer_left`
//		* `ModuleTableFtopFull` → clone of template with `id="module-ftop-full"` / filter `ftop_full`
//		* `ModuleTableFbottomFull` → clone of template with `id="module-fbottom-full"` / filter `fbottom_full`
//		* `ModuleTableFooterRight` → clone of template with `id="module-footer-right"` / filter `footer_right`
//		
//		---
//		
//		### Anchor for insertion point
//		
//		* `CustomModuleInsertAfter` → marker dropped after the closing `</div>` of the stock module row group, before `<input type="hidden" name="layout_id" …>`
//		
//		---
//		
//		That’s the complete anchor set needed to reproduce both **core theme mods** and **theme-only extensions** in this twig.
//		
//		Do you want me to compress this further into a “must-have” subset (the absolute minimum anchors to support the theme mods)?
//		
//		
//		
//		
//		
//		stylesheets official - oc_v4.0.2.3-official vs oc_v4.1.0.3-official

//using System.Diagnostics;
//using System.Text.Json;
//using System.Text.Json.Serialization;
//using System.Text.RegularExpressions;

//using Falael.Core.Query;
//using Falael.IO;

//using static Falael.Core.Query.RegexLocatorQuery;
//using static Falael.Core.Query.HtmlLocatorQuery;

//namespace Falael.Utility.Rtoctu;

//public class Agent_003_0xBEE10F_HtmlAnchors : Agent
//{
//	//	Common Constants //
//	const ulong ALGO_VER = 0;       //	increment to invalidate cache when code changes break cache compatibility

//	const ulong LGID = 0xBEE10F;    //	never change, used as XID

//	const ulong CACHE_MODDED_TWIG_TIME = 0;
//	const ulong CACHE_ORIGINAL_TWIG_TIME = 1;

//	//	Common Constants //
//	static readonly Path Source_ONOFF_FileGlob =
//		new(@$"{nameof(Agent_003_0xBEE10F_HtmlAnchors)}.*");

//	static readonly Path Source_JSON_FilePath =
//		new(@$"{nameof(Agent_003_0xBEE10F_HtmlAnchors)}.json");

//	static readonly Path Target_LayoutForm_TwigFilePath =
//		new(@"admin\view\template\design\layout_form.twig");

//	static readonly Path[] Target_LayoutForm_SignificantPaths = [Target_LayoutForm_TwigFilePath];

//	static readonly string Table_Route_Td_Store_XmodId = "Table_Route_Td_Store";

//	static readonly Regex Table_Route_Regex =
//		HtmlTagRegex(
//			name: "table",
//			options: TagOptions.AcceptOpeningTag | TagOptions.CaptureTagName,
//			attributeFilters:
//			[
//				new("id", "route")
//			]);

//	static readonly Regex Table_Route_TdBody_Store_Regex =
//		HtmlTagBodyRegex(
//			name: "td",
//			options: TagBodyOptions.CaptureOpeningTag,
//			body: TwigFieldRegex("entry_store").ToString()
//		);
//	const int Table_Route_TdBody_Store_OpeningTagCapture = 1;

//	static readonly Regex Table_Route_Td_Store_XmodAttribute_Regex =
//		HtmlAttributeRegex(
//			name: "x-data-mod",
//			value: QuotedContent,
//			options: AttributeOptions.CaptureAttributeValue
//		);
//	const int Table_Route_Td_Store_XmodAttribute_ValueCapture = 1;

//	static readonly string Table_Route_Td_Store_Attribute = @"x-data-mod=""RouteTableHeadStore""";

//	const int TAG_Table_Route_Match = 0;
//	const int TAG_Table_Route_TdBody_Store_Match = 1;
//	const int TAG_Table_Route_Td_Store_XmodAttribute_Match = 2;

//	//	Implementation //
//	public override bool QueryIsEnabled() =>
//		this.AgentContext.SourceRootDir
//			.CombineWith(Source_ONOFF_FileGlob)
//			.SetFileExtension(Agent_ON)
//			.IsFile();

//	public override bool RecognizeSource(Path relativeFilePath) =>
//		relativeFilePath.IsMatch(Source_ONOFF_FileGlob);

//	public override bool RecognizeTarget(Path relativeFilePath) =>
//		relativeFilePath == Target_LayoutForm_TwigFilePath;

//	public override AgentSyncStatus QuerySyncState(Path? relativeSourceFilePath, Path? relativeTargetFilePath, bool isEnabled)
//	{
//		if (relativeSourceFilePath != null) return Target_LayoutForm_SignificantPaths
//			.ToFullPaths(this.AgentContext.TargetRootDir)
//			.Select(v => _file_Process(v, isEnabled))
//			.Combine(isEnabled);
//		else if (relativeTargetFilePath != null) return _file_Process(relativeTargetFilePath.Value, isEnabled).Interpret(isEnabled);
//		else throw new InvalidOperationException();

//		SyncStatus _file_Process(Path relativeTargetFilePath, bool isEnabled)
//		{
//			var cache = this.AgentContext.Cache;

//			#region Cache Handling

//			var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);

//			//	NOTE: do cache delete here and not on Ensure* because Ensure* might not be able to delete the respective cache entry due to an error, leaving the agent in an irrivesably broken state
//			//		- possible reason would be external application termination during Ensure* execution w/o the option to update cache before exit
//			//		- possible solution to avoid repeated deletion attempts of inexisting cache keys
//			//			- enable cache single transaction management (see JsonFileCache.cs TODO)
//			//			- move cache update to respective Ensure* methods
//			//	NOTE: interpretation of cache varies between enabled an disabled state
//			if (isEnabled) cache.Delete(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver);
//			else cache.Delete(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver);

//			//	NOTE: interpretation of cache varies between enabled an disabled state
//			if (isEnabled)
//			{
//				//	when enabled, equal times mean "yes, in sync", can skip heavier twig file read and parsing
//				if (twigFilePath.FileInfo().LastWriteTimeUtc == cache.GetValue(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, DateTime.MinValue)) return SyncStatus.Synced;
//			}
//			else
//			{
//				//	when disabled, equal times mean "yes, pristine", can skip heavier twig file read and parsing
//				if (twigFilePath.FileInfo().LastWriteTimeUtc == cache.GetValue(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, DateTime.MinValue)) return SyncStatus.Pristine;
//			}

//			//	in enabled and disabled state alike, different times mean potentially "dirty", establish sync status based on twig file html artifacts

//			#endregion

//			SyncStatus result = _getDecorationStatus(File.ReadAllText(twigFilePath));

//			#region Cache Handling

//			//	NOTE: interpretation of cache varies between enabled an disabled state
//			//	- cache that fact if the file is up-to-date

//			if (isEnabled && result == SyncStatus.Synced) cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);
//			if (!isEnabled && result == SyncStatus.Pristine) cache.Set(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

//			#endregion

//#if DEBUG
//			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x218EC8),
//				nameof(Agent_003_0xBEE10F_HtmlAnchors), nameof(QuerySyncState), "--- RESULT", twigFilePath, result + (isEnabled ? "Enabled" : "Disabled")
//			);
//#endif
//			return result;

//			SyncStatus _getDecorationStatus(string twigFileText)
//			{
//				var strXid = ILog.Hex(this.XID);

//				var result = SyncStatus.Pristine;
//				var rlq = new RegexLocatorQuery(twigFileText)
//					.FindOne(TAG_Table_Route_Match, Table_Route_Regex)
//						.Fail_IfNotFound(TAG_Table_Route_Match, "Route table not found.")
//						.TrimRangeStart()
//					.FindOne(TAG_Table_Route_TdBody_Store_Match, Table_Route_TdBody_Store_Regex)
//						.Fail_IfNotFound(TAG_Table_Route_TdBody_Store_Match, $"Store header td not found.")
//						.NarrowRange(Table_Route_TdBody_Store_OpeningTagCapture)
//					.FindAll(TAG_Table_Route_Td_Store_XmodAttribute_Match, Table_Route_Td_Store_XmodAttribute_Regex)
//						.Fail_IfNotFound(TAG_Table_Route_Td_Store_XmodAttribute_Match, $"No xmod attributes found.")
//						.TrimRangeEnd()
//					.Commit()

//					.OnFail(TAG_Table_Route_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
//					.OnFail(TAG_Table_Route_TdBody_Store_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
//					.OnFail(TAG_Table_Route_Td_Store_XmodAttribute_Match, (rlq, tag) => { })        //	no xmod attributes, defaults to pristine - in enabled state apply, in disabled noop 
//					.OnSuccess(rlq =>
//					{
//						var f = rlq.GetLastFindingByTag(TAG_Table_Route_Td_Store_XmodAttribute_Match);
//						var ownXidMatches = f.FindingMatches.Where(v => v.RegexMatch.Captures[Table_Route_Td_Store_XmodAttribute_ValueCapture].Value == strXid);
//						var ownXidMatcheCount = ownXidMatches.Count();
//						result = ownXidMatcheCount == 1
//							? SyncStatus.Synced														//	exactly one own xid attribute - in enabled state noop, in disabled - revert
//							: SyncStatus.Dirty;                                                     //	need to remove multiple insertions - in enabled state remove multiple, in disabled revert
//					});
//				return result;
//			}
//		}
//	}

//	public override void EnsureAppliedOnTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
//	{
//		if (relativeSourceFilePath != null) Target_LayoutForm_SignificantPaths
//			.ToFullPaths(this.AgentContext.TargetRootDir)
//			.ToList()
//			.ForEach(v => _file_Process(v));
//		else if (relativeTargetFilePath != null) _file_Process(relativeTargetFilePath.Value);
//		else throw new InvalidOperationException();

//		void _file_Process(Path relativeTargetFilePath)
//		{
//			var cache = this.AgentContext.Cache;

//			//	twig closing tag insertion
//			{
//				var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);
//				var twigFileText = File.ReadAllText(twigFilePath);
//				var rlq = new RegexLocatorQuery(twigFileText)
//					.WhileFailed(rlq => rlq
//						.FindOne(TAG_OpeningTag_Match, GetOpeningTagRegex(defItem.Tag))
//							.TrimRangeStart()
//							.Fail_IfNotFound(TAG_OpeningTag_Match, $"No {defItem.Tag} opening tag found.")
//						.PushRange()
//						.FindOne(TAG_InsertBeforeText_Match, GetInsertBeforeRegex(defItem.CloseBeforeText))
//							.TrimRangeEnd()
//							.Fail_IfNotFound(TAG_InsertBeforeText_Match, $"No {defItem.CloseBeforeText} found.")
//						.FindOneBackwards(TAG_ClosingTag_Match, GetClosingTagRegex(defItem.Tag))
//							.Fail_IfFound(TAG_ClosingTag_Match, $"{defItem.Tag} closing tag found.")
//						.PopRange()
//					)
//					.Commit()

//					.OnFail(TAG_INFINITE_LOOP, (rlq, tag) =>	//	all tags closed
//					{
//						#region Cache Handling

//						//	reaching this point means that the cache was wrongly invalidated, validate now
//						cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

//						#endregion
//					})
//					.OnFail(TAG_OpeningTag_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
//					.OnFail(TAG_InsertBeforeText_Match, (rlq, tag) => throw new CannotApplyException(this, tag))
//					.OnFail(TAG_ClosingTag_Match, (rlq, tag) => Debug.Fail(nameof(TAG_ClosingTag_Match)))   //	not expected, loop goes infinite if closing tag has been found
//					.OnSuccess(rlq =>
//					{
//						this.FileLock_SetOwnXid(twigFilePath);
//						rlq
//							.GetLastFindingByTag(TAG_InsertBeforeText_Match)
//							.Edit()
//							.InsertBefore(GetClosingTag(defItem.Tag))
//							.Commit();

//						File.WriteAllText(twigFilePath, rlq.Subject);

//						#region Cache Handling

//						cache.Set(this.XID, twigFilePath, CACHE_MODDED_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

//						#endregion
//#if DEBUG
//						this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x23F27F),
//							nameof(Agent_003_0xBEE10F_HtmlAnchors), nameof(EnsureAppliedOnTarget), "--- CLOSING TAG INSERTED", defItem.Tag
//						);
//#endif
//					});
//			}
//		}
//	}

//	public override void EnsureOriginalTarget(Path? relativeSourceFilePath, Path? relativeTargetFilePath)
//	{
//		var defs = DefItem.FromFile(this.ProgramContext, this.AgentContext.SourceRootDir
//				.CombineWith(Source_JSON_FilePath));

//		if (relativeSourceFilePath != null) defs
//				.ToList()
//				.ForEach(kvp => { _file_Process(kvp.Key.ToPath()); });
//		else if (relativeTargetFilePath != null) _file_Process(relativeTargetFilePath.Value);
//		else throw new InvalidOperationException();

//		void _file_Process(Path relativeTargetFilePath)
//		{
//			var cache = this.AgentContext.Cache;

//			//	twig closing tag insertion
//			{
//				var twigFilePath = this.AgentContext.TargetRootDir.CombineWith(relativeTargetFilePath);
//				var outcome = this.FileLock_RemoveOwnXid(twigFilePath, throwOnPristine: false);
//#if DEBUG
//				if (outcome.lockPath != null) this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x0825E0),
//					nameof(Agent_003_0xBEE10F_HtmlAnchors), nameof(EnsureAppliedOnTarget), "--- REVERT TWIG", outcome.lockPath.Value
//				);
//#endif
//				#region Cache Handling

//				cache.Set(this.XID, twigFilePath, CACHE_ORIGINAL_TWIG_TIME, this.Ver, twigFilePath.FileInfo().LastWriteTimeUtc);

//				#endregion
//			}
//		}
//	}

//	//	Common //
//	#region Common

//	public Agent_003_0xBEE10F_HtmlAnchors(ProgramContext programContext, AgentContext agentContext, Configuration configuration)
//		: base(programContext, agentContext)
//	{
//		this.configuration = configuration;
//	}

//	[ConfigurationClass]
//	public class Configuration
//	{
//		//[ConfigurationField("primeAgent.foo")]
//		//public string PrimeAgent_Foo { get; init; } = @"bar";
//	}

//	readonly Configuration configuration;

//	public override ulong XID => LGID;

//	public override ulong Ver => ALGO_VER;

//	#endregion
//}
