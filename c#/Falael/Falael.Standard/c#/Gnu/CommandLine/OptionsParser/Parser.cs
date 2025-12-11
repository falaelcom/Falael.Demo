//	R0Q0/daniel/20201018
using System;
using System.Diagnostics;

using Falael.Gnu.CommandLine.ArgumentsParser;

namespace Falael.Gnu.CommandLine.OptionsParser
{
    /// <summary>
    /// Asymmetrical parser that detects <see cref="ElementType"/> elements from the output of the <see cref="ArgumentsParser.Parser"/>.
    /// </summary>
    /// <remarks>
    /// Asymmetrical parsers introduce loss of insignificant data to their output. The original input cannot be indentically recreated from the parser's output.
    /// </remarks>
    public class Parser
    {
        /// <summary>
        /// Initializes a new instance of the class with a given <see cref="inputParser"/>.
        /// </summary>
        /// <param name="inputParser">The underlying arguments parser.</param>
        /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
        public Parser(ArgumentsParser.Parser inputParser)
        {
            this.inputParser = inputParser;
        }

        /// <summary>
        /// Enumerates the parser internal states.
        /// </summary>
        public enum State
        {
            /// <summary>
            /// Parsing the input.
            /// </summary>
            Input,
            /// <summary>
            /// Parsing an assignable.
            /// </summary>
            Assignable,
        }

        /// <summary>
        /// Initializes the output parameters with the information for the next element and returns true. At the end of the list returns false.
        /// </summary>
        /// <param name="type">The type of the element.</param>
        /// <param name="name">The name of the element for options. null for other elements.</param>
        /// <param name="value">The value of the element for assignables. The text of the element for operands and for the operand list marker. null for other elements.</param>
        /// <returns>Returns false if reached the end of the list, otherwise returns true.</returns>
        public bool GetNext(out ElementType type, out bool posix, out string name, out string value)
        {
            bool result;
            while (true)
            {
                ArgumentsParser.ElementType inputElementType;
                string inputElementText;
                int inputSourceOffset;
                int inputSourceSubOffset;
                if (!this.cache_isSet) result = this.inputParser.GetNext(out inputElementType, out inputElementText, out inputSourceOffset, out inputSourceSubOffset);
                else
                {
                    result = this.cache_result;
                    inputElementType = this.cache_inputElementType;
                    this.elementIsPosix = this.cache_elementPosix;
                    inputElementText = this.cache_inputElementText;
                    inputSourceOffset = this.cache_inputSourceOffset;
                    inputSourceSubOffset = this.cache_inputSourceSubOffset;
                    this.cache_isSet = false;
                }

                switch (this.state)
                {
                    case State.Input:
                        if (!result)
                        {
                            type = ElementType.EOI;
                            posix = true;
                            name = null;
                            value = null;
                            return result;
                        }
                        switch (inputElementType)
                        {
                            case ArgumentsParser.ElementType.Flag:
                            case ArgumentsParser.ElementType.LongFlag:
                                type = ElementType.Flag;
                                posix = inputElementType == ArgumentsParser.ElementType.Flag;
                                name = inputElementText;
                                value = null;
                                return result;
                            case ArgumentsParser.ElementType.Assignable:
                            case ArgumentsParser.ElementType.LongAssignable:
                                if (!result)
                                {
                                    type = ElementType.Assignable;
                                    posix = inputElementType == ArgumentsParser.ElementType.Assignable;
                                    name = inputElementText;
                                    value = null;
                                    return result;
                                }
                                if (inputElementType == ArgumentsParser.ElementType.Assignable && this.inputParser.IsInput)
                                {
                                    type = ElementType.Assignable;
                                    posix = true;
                                    name = inputElementText;
                                    value = null;
                                    return result;
                                }
                                this.assignableName = inputElementText;
                                this.elementIsPosix = inputElementType == ArgumentsParser.ElementType.Assignable;
                                this.state = State.Assignable;
                                continue;
                            case ArgumentsParser.ElementType.Operand:
                                type = ElementType.Operand;
                                posix = true;
                                name = null;
                                value = inputElementText;
                                return result;
                            case ArgumentsParser.ElementType.OperandListMarker:
                                type = ElementType.OperandListMarker;
                                posix = true;
                                name = null;
                                value = inputElementText;
                                return result;
                            default: throw new NotImplementedException();
                        }
                    case State.Assignable:
                        if (!result)
                        {
                            type = ElementType.Assignable;
                            posix = this.elementIsPosix;
                            name = this.assignableName;
                            value = null;
                            this.state = State.Input;
                            return true;
                        }
                        switch (inputElementType)
                        {
                            case ArgumentsParser.ElementType.Flag:
                            case ArgumentsParser.ElementType.LongFlag:
                            case ArgumentsParser.ElementType.Assignable:
                            case ArgumentsParser.ElementType.LongAssignable:
                            case ArgumentsParser.ElementType.Operand:
                            case ArgumentsParser.ElementType.OperandListMarker:
                                this.cache_result = result;
                                this.cache_inputElementType = inputElementType;
                                this.cache_elementPosix = inputElementType == ArgumentsParser.ElementType.Flag || inputElementType == ArgumentsParser.ElementType.Assignable;
                                this.cache_inputElementText = inputElementText;
                                this.cache_inputSourceOffset = inputSourceOffset;
                                this.cache_inputSourceSubOffset = inputSourceSubOffset;
                                this.cache_isSet = true;
                                type = ElementType.Assignable;
                                posix = this.elementIsPosix;
                                name = this.assignableName;
                                value = null;
                                this.state = State.Input;
                                return true;
                            case ArgumentsParser.ElementType.OptionalValue:
                            case ArgumentsParser.ElementType.RequiredValue:
                            case ArgumentsParser.ElementType.LongOptionOptionalValue:
                            case ArgumentsParser.ElementType.LongOptionRequiredValue:
                                type = ElementType.Assignable;
                                posix = inputElementType == ArgumentsParser.ElementType.OptionalValue || inputElementType == ArgumentsParser.ElementType.RequiredValue;
                                name = this.assignableName;
                                value = inputElementText;
                                this.state = State.Input;
                                return result;
                            default: throw new NotImplementedException();
                        }
                    default: throw new NotImplementedException();
                }
            }
        }

		/// <summary>
		/// Runs the unit test for this class.
		/// </summary>
		/// <exception cref="InvalidOperationException">Thrown on test fail.</exception>
		/// <remarks>May throw any other exception on broken code as well.</remarks>
		[UnitTest(3000)]
		public static void UnitTest()
        {
            string title;
            Parser parser;
            bool hasNext;
            ElementType type;
            bool posix;
            string name;
            string value;

            string f() => string.Format("{0}*{1}/{2}*{3}*{4}", hasNext, type, posix ? "P" : "G", name, value);
            void t(string expected, int subExperimentId = -1) { var outcome = f(); if (outcome != expected) { Debug.WriteLine(outcome); throw new InvalidOperationException(title + (subExperimentId == -1 ? "" : " (" + subExperimentId + ")")); } }

            title = @"new string[] { ""a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "a" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Operand/P**a");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*OperandListMarker/P**--");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--"", ""a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--", "a" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*OperandListMarker/P**--");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Operand/P**a");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--"", ""-a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--", "-a" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*OperandListMarker/P**--");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Operand/P**-a");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""-a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "-a" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"", ""-a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa", "-a" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""--aa"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "--aa" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"", ""--aa"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa", "--aa" }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Flag/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a" }, new Assignable[] { new Assignable('a') }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa" }, new Assignable[] { new Assignable("aa") }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""-a"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "-a" }, new Assignable[] { new Assignable('a') }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""--aa"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "--aa" }, new Assignable[] { new Assignable('a'), new Assignable("aa") }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"", ""-a"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa", "-a" }, new Assignable[] { new Assignable('a'), new Assignable("aa") }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"", ""--aa"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa", "--aa" }, new Assignable[] { new Assignable('a'), new Assignable("aa") }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""-a"", ""-a"" } (assignable)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "-a", "-a" }, new Assignable[] { new Assignable('a') }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""v"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "v" }, new Assignable[] { new Assignable('a') }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Operand/P**v");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"", ""v"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa", "v" }, new Assignable[] { new Assignable("aa") }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Operand/P**v");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""v"" } (requires value)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "v" }, new Assignable[] { new Assignable('a', true) }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*v");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""--aa"", ""v"" } (requires value)";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "--aa", "v" }, new Assignable[] { new Assignable("aa", true) }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/G*aa*v");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-a"", ""v"", ""c"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-a", "v", "c" }, new Assignable[] { new Assignable('a', true) }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*v");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Operand/P**c");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");

            title = @"new string[] { ""-av"", ""-a"" }";
            parser = new Parser(new ArgumentsParser.Parser(new string[] { "-av", "-a" }, new Assignable[] { new Assignable('a') }));
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*v");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("True*Assignable/P*a*");
            hasNext = parser.GetNext(out type, out posix, out name, out value); t("False*EOI/P**");
        }

        readonly ArgumentsParser.Parser inputParser;
        State state = State.Input;
        string assignableName = null;
        bool elementIsPosix = false;

        bool cache_isSet = false;
        bool cache_result = false;
        ArgumentsParser.ElementType cache_inputElementType = (ArgumentsParser.ElementType)(-1);
        bool cache_elementPosix = false;
        string cache_inputElementText = null;
        int cache_inputSourceOffset = -1;
        int cache_inputSourceSubOffset = -1;
    }
}
