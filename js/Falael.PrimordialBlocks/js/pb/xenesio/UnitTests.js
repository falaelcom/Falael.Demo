//	R0Q3/daniel/20210728
"use strict"; if (typeof window === "undefined") throw new Error(`Unsupported runtime.`);

const Runtime = require("-/pb/natalis/000/Runtime.js");

const unitTestClasses = [];

module.exports =

//	Class: Holds the unit tests for xenesio.
class UnitTests
{
	//	Function: Run all available unit tests.
	static unitTest(testFailed, { disabledTests = null, acknowledged = null } = {})
	{
		return Runtime.unitTest(unitTestClasses.concat(UnitTests), testFailed, { disabledTests, acknowledged });
	}
}