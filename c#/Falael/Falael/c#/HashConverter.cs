using System.Numerics;
using System.Security.Cryptography;
using System.Text;
using System.Globalization;

namespace Falael
{
    public static class HashConverter
    {
        public static string GetCustomBase77MD5Hash(string input)
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = MD5.HashData(inputBytes);
            string hexString = ByteArrayToHexString(hashBytes);
            return ConvertHexToBase77(hexString);
        }

		public static string GetCustomBase72MD5Hash(string input)
		{
			byte[] inputBytes = Encoding.UTF8.GetBytes(input);
			byte[] hashBytes = MD5.HashData(inputBytes);
			string hexString = ByteArrayToHexString(hashBytes);
			return ConvertHexToBase72(hexString);
		}

		public static string GetCustomBase72SHA256Hash(string input)
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = SHA256.HashData(inputBytes);
            string hexString = ByteArrayToHexString(hashBytes);
            return ConvertHexToBase72(hexString);
        }

        static string ByteArrayToHexString(byte[] hashBytes)
        {
            StringBuilder hex = new(hashBytes.Length * 2);
            foreach (byte b in hashBytes) hex.AppendFormat("{0:x2}", b);
            return hex.ToString();
        }

        //	0-9 - digits (0-9)
        //	10-35 - lowercase Latin letters(a-z)
        //	36-61 - uppercase Latin letters(A-Z)
        //	62-77 - special characters(_, -, ., *, !, @, #, $, %, ^, ?, +, |, ~, /)
        static string ConvertHexToBase77(string hexString)
        {
            if (hexString == "0") return "0";
            BigInteger number = BigInteger.Parse("0" + hexString, NumberStyles.HexNumber);
            StringBuilder result = new();
            while (number > 0)
            {
                result.Insert(0, Base77Characters[(int)(number % 77)]);
                number /= 77;
            }
            return result.ToString();
        }

        //	0-9 - digits (0-9)
        //	10-35 - lowercase Latin letters(a-z)
        //	36-61 - uppercase Latin letters(A-Z)
        //	62-72 - special characters(!, #, $, %, +, -, @, ~, =, _)
        //	NOTE: file name safe
        static string ConvertHexToBase72(string hexString)
        {
            if (hexString == "0") return "0";
            BigInteger number = BigInteger.Parse("0" + hexString, NumberStyles.HexNumber);
            StringBuilder result = new();
            while (number > 0)
            {
                result.Insert(0, Base72Characters[(int)(number % 72)]);
                number /= 72;
            }
            return result.ToString();
        }

        static readonly char[] Base77Characters =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-.*!@#$%^?+|~/".ToCharArray();

        static readonly char[] Base72Characters =   //	file name safe
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%+-@~=_".ToCharArray();

        #region Tests

        public static void Test()
        {
            {
                string testHex = "0", expectedResult = "0";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "1", expectedResult = "1";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "a", expectedResult = "a";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "b", expectedResult = "b";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "10", expectedResult = "g";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "1f", expectedResult = "v";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "20", expectedResult = "w";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "3e", expectedResult = "_";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "3f", expectedResult = "-";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "40", expectedResult = ".";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "4c", expectedResult = "/";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "4d", expectedResult = "10";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "ff", expectedResult = "3o";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "100", expectedResult = "3p";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "1ff", expectedResult = "6N";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "400", expectedResult = "dn";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "1728", expectedResult = "//";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "1729", expectedResult = "100";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "6f754", expectedResult = "///";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "6f755", expectedResult = "1000";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "1000000000000000", expectedResult = "c8~T*%e$~1";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }
            {
                string testHex = "ffffffffffffffffffffffffffffffff", expectedResult = "6q8mKPmhsD4MPrRTtuIVo";
                string result = ConvertHexToBase77(testHex);
                if (result != expectedResult) throw new Exception($"Test failed: ConvertHexToBase77(\"{testHex}\") = \"{result}\", expected \"{expectedResult}\"");
            }

            Console.WriteLine("All tests passed.");
        }

        #endregion
    }
}
