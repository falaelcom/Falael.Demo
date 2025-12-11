//	R0Q2/daniel/20220505
"use strict";

const { Exception, ArgumentException } = require("-/pb/natalis/003/Exception.js");

module.exports =

class UnitTests_Exception
{
	//	Category: Unit test
	//	Function: Run unit tests for `Exception` class.
	static unitTest_Exception(result)
	{
		const fail = testName => result.push({ testName });
		const test = (outcome, testName) => { if (outcome !== expected) result.push({ testName, outcome, expected }) };

		let expected, subject, cyclic, cyclic2;

		test_Exception();
		test_Exception_InvalidArgument();

		function test_Exception()
		{
			//	bad message
			{
				try
				{
					throw new Exception(0, 1);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (012.001)");
					expected = `0xA35A92 Bad exception. Argument is invalid: "message" (1); string expected. Details: "ncode" (0x0), "detailsOrInnerException" (null), "innerException" (null).`;
					test(ex.message, "Exception (012.002)")
				}

				try
				{
					throw new Exception(0, 1);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (013.001)");
					expected = `0xA35A92 Bad exception. Argument is invalid: "message" (1); string expected. Details: "ncode" (0x0), "detailsOrInnerException" (null), "innerException" (null).`;
					test(ex.message, "Exception (013.002)")
				}

				try
				{
					throw new Exception(0, NaN);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (014.001)");
					expected = `0xA35A92 Bad exception. Argument is invalid: "message" (NaN); string expected. Details: "ncode" (0x0), "detailsOrInnerException" (null), "innerException" (null).`;
					test(ex.message, "Exception (014.002)")
				}
			}

			//	bad innerException
			{
				try
				{
					throw new Exception(0, "", null, {});
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (011.001)");
					expected = `0xC0ACDA Bad exception. Argument is invalid: "innerException" ({}); Error instance expected. Details: "ncode" (0x0), "message" (""), "detailsOrInnerException" (null).`;
					test(ex.message, "Exception (011.002)")
				}

				try
				{
					throw new Exception(0, "", null, 0);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (012.001)");
					expected = `0xC0ACDA Bad exception. Argument is invalid: "innerException" (0); Error instance expected. Details: "ncode" (0x0), "message" (""), "detailsOrInnerException" (null).`;
					test(ex.message, "Exception (012.002)")
				}
			}

			//	bad detailsOrInnerException, innerException
			{
				try
				{
					throw new Exception(0, "", new Error(), 1);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (021.001)");
					expected = `0xC0ACDA Bad exception. Argument is invalid: "innerException" (1); Error instance expected. Details: "ncode" (0x0), "message" (""), "detailsOrInnerException" (&Error{}).`;
					test(ex.message, "Exception (021.002)")
				}

				try
				{
					throw new Exception(0, "", new Error(), new Error());
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (022.001)");
					expected = `0x7D52E4 Bad exception. Arguments are invalid: "detailsOrInnerException" (&Error{}), "innerException" (&Error{}). Details: "ncode" (0x0), "message" ("").`;
					test(ex.message, "Exception (022.002)")
				}
			}

			//	OK
			{
				try
				{
					throw new Exception(0);
				}
				catch (ex)
				{
					expected = `0x0`;
					test(ex.message, "Exception (011.002)")
				}

				try
				{
					throw new Exception(0, "");
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (100.001)");
					expected = `0x0`;
					test(ex.message, "Exception (100.002)")
				}

				try
				{
					throw new Exception(0, "", null);
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (101.001)");
					expected = `0x0`;
					test(ex.message, "Exception (101.002)")
				}

				try
				{
					throw new Exception(0, "a");
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (102.001)");
					expected = `0x0 a`;
					test(ex.message, "Exception (102.002)")
				}

				try
				{
					throw new Exception(0, "", null, new Error());
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (103.001)");
					expected = `0x0`;
					test(ex.message, "Exception (103.002)")
				}

				try
				{
					throw new Exception(0, "", null, new Error("a"));
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (104.001)");
					expected = `0x0 a`;
					test(ex.message, "Exception (104.002)")
				}

				try
				{
					throw new Exception(0, "b", null, new Error("a"));
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (105.001)");
					expected = `0x0 b a`;
					test(ex.message, "Exception (105.002)")
				}

				try
				{
					throw new Exception(0, "b", null, new Exception(1, "a"));
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (106.001)");
					expected = `0x0 b 0x1 a`;
					test(ex.message, "Exception (106.002)")
				}
			}
		}

		function test_Exception_InvalidArgument()
		{
			//	bad name
			{
				try
				{
					throw new ArgumentException(0);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (031.001)");
					expected = `0x13B72B Bad exception. Argument is invalid: "name" (void 0); string expected. Details: "ncode" (0x0), "value" (void 0), "message" (null), "innerException" (null).`;
					test(ex.message, "Exception (031.002)")
				}

				try
				{
					throw new ArgumentException(0, null);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (032.001)");
					expected = `0x13B72B Bad exception. Argument is invalid: "name" (null); string expected. Details: "ncode" (0x0), "value" (void 0), "message" (null), "innerException" (null).`;
					test(ex.message, "Exception (032.002)")
				}

				try
				{
					throw new ArgumentException(0, 1);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (033.001)");
					expected = `0x13B72B Bad exception. Argument is invalid: "name" (1); string expected. Details: "ncode" (0x0), "value" (void 0), "message" (null), "innerException" (null).`;
					test(ex.message, "Exception (033.002)")
				}

				try
				{
					throw new ArgumentException(0, NaN);
				}
				catch (ex)
				{
					if (ex instanceof Exception) fail("Exception (034.001)");
					expected = `0x13B72B Bad exception. Argument is invalid: "name" (NaN); string expected. Details: "ncode" (0x0), "value" (void 0), "message" (null), "innerException" (null).`;
					test(ex.message, "Exception (034.002)")
				}
			}

			//	OK
			{
				try
				{
					throw new ArgumentException(0, "");
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (130.001)");
					expected = `0x0 Argument is invalid: "" (void 0).`;
					test(ex.message, "Exception (130.002)")
				}

				try
				{
					throw new ArgumentException(0, "a", 1);
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (131.001)");
					expected = `0x0 Argument is invalid: "a" (1).`;
					test(ex.message, "Exception (131.002)")
				}

				try
				{
					throw new ArgumentException(0, "a", 1, "b");
				}
				catch (ex)
				{
					if (!(ex instanceof Exception)) fail("Exception (132.001)");
					expected = `0x0 Argument is invalid: "a" (1)b.`;
					test(ex.message, "Exception (132.002)")
				}
			}
		}
	}
}

module.exports.UnitTests_Exception = module.exports;
