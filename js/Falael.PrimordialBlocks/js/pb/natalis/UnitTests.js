//	R0Q2/daniel/20220414
"use strict";

const Runtime = require("-/pb/natalis/000/Runtime.js");

const UnitTests_JavaScript = require("-/pb/natalis/UnitTests/JavaScript.js");

const UnitTests_Native = require("-/pb/natalis/UnitTests/Native.js");
const UnitTests_Diagnostics = require("-/pb/natalis/UnitTests/Diagnostics.js");
const UnitTests_Exception = require("-/pb/natalis/UnitTests/Exception.js");
const UnitTests_Context = require("-/pb/natalis/UnitTests/Context.js");
const UnitTests_Fabric = require("-/pb/natalis/UnitTests/Fabric.js");
const UnitTests_LiteralFabric = require("-/pb/natalis/UnitTests/LiteralFabric.js"); 
const UnitTests_MathEx = require("-/pb/natalis/UnitTests/MathEx.js");
const UnitTests_UnitFormat = require("-/pb/natalis/UnitTests/UnitFormat.js");
const UnitTests_Compound = require("-/pb/natalis/UnitTests/Compound.js");
const UnitTests_List = require("-/pb/natalis/UnitTests/List.js");
const UnitTests_Delegate = require("-/pb/natalis/UnitTests/Delegate.js");
const UnitTests_Pins = require("-/pb/natalis/UnitTests/Pins.js");
const UnitTests_DebugAggregator = require("-/pb/natalis/UnitTests/DiagnosticsCollector.js");
const UnitTests_QueryDelegate = require("-/pb/natalis/UnitTests/QueryDelegate.js");
const UnitTests_Query = require("-/pb/natalis/UnitTests/Query.js");
const UnitTests_DotSharpNotation = require("-/pb/natalis/UnitTests/DotSharpNotation.js");
const UnitTests_GraphCursor = require("-/pb/natalis/UnitTests/GraphCursor.js");
const UnitTests_GraphQuery = require("-/pb/natalis/UnitTests/GraphQuery.js");
const UnitTests_NativeGraph = require("-/pb/natalis/UnitTests/NativeGraph.js");
const UnitTests_MulticastDelegate = require("-/pb/natalis/UnitTests/MulticastDelegate.js");
const UnitTests_ChaincastDelegate = require("-/pb/natalis/UnitTests/ChaincastDelegate.js");
const UnitTests_ChaincastAsyncDelegate = require("-/pb/natalis/UnitTests/ChaincastAsyncDelegate.js");
const UnitTests_BoyerMoore = require("-/pb/natalis/UnitTests/BoyerMoore.js");
const UnitTests_Parse = require("-/pb/natalis/UnitTests/Parse.js");
const UnitTests_Options = require("-/pb/natalis/UnitTests/Options.js");
const UnitTests_Configuration = require("-/pb/natalis/UnitTests/Configuration.js");
const UnitTests_SchemaObsolete = require("-/pb/natalis/UnitTests/SchemaObsolete.js");
const UnitTests_MessageBus = require("-/pb/natalis/UnitTests/MessageBus.js");

const unitTestClasses =
[
	UnitTests_JavaScript,

	UnitTests_Native,
	UnitTests_Diagnostics,
	UnitTests_Exception,
	UnitTests_Context,
	UnitTests_Fabric,
	UnitTests_LiteralFabric,
	UnitTests_MathEx,
	UnitTests_UnitFormat,
	UnitTests_Compound,
	UnitTests_List,
	UnitTests_Delegate,
	UnitTests_Pins,
	UnitTests_DebugAggregator,
	UnitTests_QueryDelegate,
	UnitTests_Query,
	UnitTests_DotSharpNotation,
	UnitTests_GraphCursor,
	UnitTests_GraphQuery,
	UnitTests_NativeGraph,
	UnitTests_MulticastDelegate,
	UnitTests_ChaincastDelegate,
	UnitTests_ChaincastAsyncDelegate,
	UnitTests_BoyerMoore,
	UnitTests_Parse,
	UnitTests_Options,
	UnitTests_Configuration,
	UnitTests_SchemaObsolete,
	UnitTests_MessageBus,

//	UnitTests_Transcribe,
];

module.exports =

//	Class: Holds the unit tests for natais.
class UnitTests
{
	//	Function: Run all available unit tests.
	//	Parameter: `disabledTests: []` - a list of function names in the form `"unitTest_*"` to skip during testing.
	//		A useful application of this filter is the suppression of the `"unitTest_MessageBus"` tests in Google Chrome, where the `setTimeout(..., 0)` function sometimes takes unpractically long
	//		time to execute its callback.
	//	Remarks: If one or more unit tests have failed, appends to `result` elements in the form `{ class: string, testName: string, expected, outcome }`.
	static unitTest(testFailed, { disabledTests = null, acknowledged = null } = {})
	{
		return Runtime.unitTest(unitTestClasses.concat(UnitTests), testFailed, { disabledTests, acknowledged });
	}
}

module.exports.UnitTests = module.exports;
