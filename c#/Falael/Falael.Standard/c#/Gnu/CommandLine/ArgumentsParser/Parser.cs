//	R0Q0/daniel/20201018
using System;
using System.Diagnostics;

using Falael.Posix.CommandLine.ArgumentsParser;

namespace Falael.Gnu.CommandLine.ArgumentsParser
{
    /// <summary>
    /// A symmetrical parser for CLI arguments as recommended by GNU.
    /// </summary>
	/// <remarks>
	/// The output of symmetrical parsers contains all necessary information for the original input to be identically to recreated from it.
	/// </remarks>
    /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
    public class Parser : Posix.CommandLine.ArgumentsParser.Parser
    {
        /// <summary>
        /// Initializes a new instance of the class with a given args list, optional list of options that require values and parser configuration (<see cref="Posix.CommandLine.ArgumentsParser.Parser.Config"/>).
        /// </summary>
        /// <param name="list">A list of arguments as in the program's Main function <code>string[] args</code> parameter.</param>
        /// <param name="posixSchema">A list of POSIX options that accept a value.</param>
        /// <param name="gnuSchema">A list of long options that accept a value.</param>
        /// <param name="posixConfig">Contiguration for the POSIX parser.</param>
        /// <param name="config">Contiguration for the parser.</param>
        public Parser(string[] list, Posix.CommandLine.ArgumentsParser.Assignable[] posixSchema, Assignable[] gnuSchema, Posix.CommandLine.ArgumentsParser.Parser.Config posixConfig = null, Config config = null)
            : base(list, posixSchema, posixConfig)
        {
            gnuSchema?.Validate();

            this.schema = gnuSchema;
            this.config = config ?? Config.Default;
        }

        /// <summary>
        /// Initializes a new instance of the class with a given args list, optional list of options that require values and parser configuration (<see cref="Posix.CommandLine.ArgumentsParser.Parser.Config"/>).
        /// </summary>
        /// <param name="list">A list of arguments as in the program's Main function <code>string[] args</code> parameter.</param>
        /// <param name="schema">A list of options that accept a value.</param>
        /// <param name="posixConfig">Contiguration for the POSIX parser.</param>
        /// <param name="config">Contiguration for the parser.</param>
        public Parser(string[] list, Assignable[] schema = null, Posix.CommandLine.ArgumentsParser.Parser.Config posixConfig = null, Config config = null)
            : base(list, schema.MakePosixSchema(posixConfig?.IsAlnum), posixConfig)
        {
            this.schema = schema.MakeGnuSchema(posixConfig?.IsAlnum);
            this.schema?.Validate();
            this.config = config ?? Config.Default;
        }

        /// <summary>
        /// Initializes a new instance of the class with a given args list and parser configuration (<see cref="Posix.CommandLine.ArgumentsParser.Parser.Config"/>).
        /// </summary>
        /// <param name="list">A list of arguments as in the program's Main function <code>string[] args</code> parameter.</param>
        /// <param name="posixConfig">Contiguration for the POSIX parser.</param>
        /// <param name="config">Contiguration for the parser.</param>
        public Parser(string[] list, Posix.CommandLine.ArgumentsParser.Parser.Config posixConfig, Config config = null)
            : base(list, posixConfig)
        {
            this.config = config ?? Config.Default;
        }

        /// <summary>
        /// Enumerates the possible ways the parser treats the <code>-W</code> POSIX option.
        /// </summary>
        public new enum VendorReservedOptionTreatment
        {
            /// <summary>
            /// Treated according to the POSIX schema and configuration, <see cref="Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment"/> and <see cref="Posix.CommandLine.ArgumentsParser.Parser.Config"/> (non-standard).
            /// </summary>
            Verbatim,
            /// <summary>
            /// Internally, parse as an assignable, ommit the <code>-W</code> option itself from the output, parse its value as a long option and include the resulting elements in the output.
            /// </summary>
            Translate,
        }

        /// <summary>
        /// Parser configuration class.
        /// </summary>
        public new class Config
        {
            /// <summary>
            /// Indicates the way the parser interpretats the <code>-W</code> option.
            /// </summary>
            public VendorReservedOptionTreatment VendorReservedOptionTreatment { get; init; } = VendorReservedOptionTreatment.Translate;

            /// <summary>
            /// An instance specifying a default parser configuration.
            /// </summary>
            public static readonly Config Default = new Config();
        }


        /// <summary>
        /// Initializes the output parameters with the information for the next element and returns true. At the end of the list returns false.
        /// </summary>
        /// <param name="elementType">The type of the detected element.</param>
        /// <param name="elementText">For options holds a single character string containing the name of the option. For merged arguments (i.e. an option requiring a value merged with it's value in one argument) holds a text containing the value part of the argument. In all other cases holds the complete text of the source argument.</param>
        /// <param name="argumentOffset">The current argument index.</param>
        /// <param name="characterOffset">The current character index within the current argument.</param>
        /// <returns>Returns true if there are more tokens to parse, otherwise returns false.</returns>
        /// <exception cref="NotImplementedException">Thrown on an unknown enumeration value for the <see cref="VendorReservedOptionTreatment"/> and <see cref="State"/> enumeration.</exception>
        /// <exception cref="InvalidOperationException">Thrown on an unexpected program state. Indicates a bug.</exception>
        /// <exception cref="ParserException">Thrown on on a parser error. See <see cref="ParserException"/> for details.</exception>
        public bool GetNext(out ElementType elementType, out string elementText, out int argumentOffset, out int characterOffset)
        {
            Assignable assignable;
            while (true)
            {
                switch (this.state)
                {
                    case State.Input:

                        if (this.IsEOI)
                        {
                            elementType = ElementType.EOI;
                            elementText = null;
                            argumentOffset = -1;
                            characterOffset = -1;
                            return false;
                        }

                        //  preview the parsing step request

                        Posix.CommandLine.ArgumentsParser.ElementType posixElementType;

                        switch (base.state)
                        {
                            case Posix.CommandLine.ArgumentsParser.State.Input:
                                this.argument = this.list[base.argumentOffset];
                                if (this.argument.Length <= 2)  //  not starting with "--"
                                {
                                    var outcome = base.GetNext(out posixElementType, out elementText, out argumentOffset, out characterOffset);
                                    if(posixElementType == Posix.CommandLine.ArgumentsParser.ElementType.VendorReservedAssignable) switch (this.config.VendorReservedOptionTreatment)
                                    {
                                        case VendorReservedOptionTreatment.Verbatim: break;        //  include in output
                                        case VendorReservedOptionTreatment.Translate: continue;    //  skip
                                        default: throw new NotImplementedException();
                                    }
                                    elementType = (ElementType)posixElementType;
                                    return outcome;
                                }
                                if (this.argument[0] != '-' || this.argument[1] != '-') //  not starting with "--"
                                {
                                    var outcome = base.GetNext(out posixElementType, out elementText, out argumentOffset, out characterOffset);
                                    if (posixElementType == Posix.CommandLine.ArgumentsParser.ElementType.VendorReservedAssignable) switch (this.config.VendorReservedOptionTreatment)
                                    {
                                        case VendorReservedOptionTreatment.Verbatim: break;            //  include in output
                                        case VendorReservedOptionTreatment.Translate: continue;    //  skip
                                        default: throw new NotImplementedException();
                                    }
                                    elementType = (ElementType)posixElementType;
                                    return outcome;
                                }
                                this.subOffset = 2;
                                this.state = State.LongOption;
                                continue;
                            case Posix.CommandLine.ArgumentsParser.State.VendorReservedMergedValue:    //  -Wname=value
                            case Posix.CommandLine.ArgumentsParser.State.VendorReservedValue:          //  -W name=value
                                {
                                    switch (this.config.VendorReservedOptionTreatment)
                                    {
                                        case VendorReservedOptionTreatment.Verbatim:
                                            {
                                                var outcome = base.GetNext(out posixElementType, out elementText, out argumentOffset, out characterOffset);
                                                elementType = (ElementType)posixElementType;
                                                return outcome;
                                            }
                                        case VendorReservedOptionTreatment.Translate:
                                            {
                                                this.subOffset = 0;
                                                this.vendorReservedSubOffset = base.state == Posix.CommandLine.ArgumentsParser.State.VendorReservedMergedValue ? 2 : 0;
                                                var outcome = base.GetNext(out _, out elementText, out argumentOffset, out characterOffset);
                                                if (!outcome) throw new InvalidOperationException();
                                                this.argument = elementText;
                                                this.state = State.TranslatedLongOption;
                                                continue;
                                            }
                                        default: throw new NotImplementedException();
                                    }
                                }
                            default:    //  only intercept "--" when in the input state of the POSIX parser, and "-W" 
                                {
                                    var outcome = base.GetNext(out posixElementType, out elementText, out argumentOffset, out characterOffset);
                                    if (posixElementType == Posix.CommandLine.ArgumentsParser.ElementType.VendorReservedAssignable) switch (this.config.VendorReservedOptionTreatment)
                                    {
                                        case VendorReservedOptionTreatment.Verbatim: break;
                                        case VendorReservedOptionTreatment.Translate: continue;
                                        default: throw new NotImplementedException();
                                    }
                                    elementType = (ElementType)posixElementType;
                                    return outcome;
                                }
                        }
                    case State.LongOption:
                        {
                            //  long option; parsing its name
                            var nameAnchor = this.subOffset;
                            while (this.subOffset < this.argument.Length)
                            {
                                var c = this.argument[this.subOffset];
                                if (c == '=')
                                {
                                    //  end of long option name

                                    if (this.subOffset == nameAnchor) throw new InvalidOperationException();
                                    elementText = this.argument.Substring(nameAnchor, this.subOffset - nameAnchor);
                                    elementType = ElementType.LongAssignable;
                                    assignable = this.schema?.Find(elementText);
                                    if (assignable == null) throw new ParserException(201, "Not an assignble option.", this.state, base.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, base.argumentOffset, this.subOffset);
                                    argumentOffset = base.argumentOffset;
                                    characterOffset = 2;
                                    ++this.subOffset;
                                    if (this.subOffset == this.argument.Length)
                                    {
                                        //  no long option value after '='
                                        if (assignable.ValueRequired) throw new ParserException(202, "Value is required.", this.state, base.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, base.argumentOffset, this.subOffset);

                                        ++base.argumentOffset;
                                        this.state = State.Input;
                                    }
                                    else this.state = assignable.ValueRequired ? State.LongOptionMergedRequiredValue : State.LongOptionMergedOptionalValue;
                                    return true;
                                }
                                bool isAlnum = base.config.IsAlnum == null ? char.IsLetterOrDigit(c) : base.config.IsAlnum(c);
                                if (!isAlnum && c != '-') throw new ParserException(203, "Invalid character in long option name.", this.state, base.state, null, this.argument, base.argumentOffset, this.subOffset);
                                ++this.subOffset;
                                continue;
                            }
                            //  no '=' at the end
                            elementText = this.argument.Substring(nameAnchor);
                            assignable = this.schema?.Find(elementText);
                            elementType = assignable != null ? ElementType.LongAssignable : ElementType.LongFlag;
                            argumentOffset = base.argumentOffset;
                            characterOffset = 2;
                            ++base.argumentOffset;
                            if (assignable != null && assignable.ValueRequired)
                            {
                                if (base.IsEOI) throw new ParserException(202, "Value is required.", this.state, base.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, base.argumentOffset, this.subOffset);
                                this.state = State.Value;
                            }
                            else this.state = State.Input;
                            return true;
                        }
                    case State.TranslatedLongOption:
                        {
                            //  translated long option; parsing its name
                            var nameAnchor = this.subOffset;
                            while (this.subOffset < this.argument.Length)
                            {
                                var c = this.argument[this.subOffset];
                                if (c == '=')
                                {
                                    //  end of long option name

                                    if (this.subOffset == nameAnchor) throw new InvalidOperationException();
                                    elementText = this.argument.Substring(nameAnchor, this.subOffset - nameAnchor);
                                    elementType = ElementType.LongAssignable;
                                    assignable = this.schema?.Find(elementText);
                                    if (assignable == null) throw new ParserException(201, "Not an assignble option.", this.state, base.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, base.argumentOffset, this.subOffset);
                                    argumentOffset = base.argumentOffset - 1;
                                    characterOffset = this.vendorReservedSubOffset;
                                    ++this.subOffset;
                                    if (this.subOffset == this.argument.Length)
                                    {
                                        //  no long option value after '='
                                        if (assignable.ValueRequired) throw new ParserException(202, "Value is required.", this.state, base.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, base.argumentOffset, this.subOffset);

                                        this.state = State.Input;
                                    }
                                    else this.state = assignable.ValueRequired ? State.TranslatedLongOptionMergedRequiredValue : State.TranslatedLongOptionMergedOptionalValue;
                                    return true;
                                }
                                bool isAlnum = base.config.IsAlnum == null ? char.IsLetterOrDigit(c) : base.config.IsAlnum(c);
                                if (!isAlnum && c != '-') throw new ParserException(203, "Invalid character in long option name.", this.state, base.state, null, this.argument, base.argumentOffset, this.subOffset);
                                ++this.subOffset;
                                continue;
                            }
                            //  no '=' at the end
                            elementText = this.argument.Substring(nameAnchor);
                            assignable = this.schema?.Find(elementText);
                            elementType = assignable != null ? ElementType.LongAssignable : ElementType.LongFlag;
                            argumentOffset = base.argumentOffset - 1;
                            characterOffset = this.vendorReservedSubOffset;
                            if (assignable != null && assignable.ValueRequired) throw new ParserException(202, "Value is required.", this.state, base.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, base.argumentOffset, this.subOffset);
                            else this.state = State.Input;
                            return true;
                        }
                    case State.Value:
                        elementType = ElementType.LongOptionRequiredValue;
                        elementText = this.list[base.argumentOffset];
                        argumentOffset = base.argumentOffset;
                        characterOffset = 0;
                        ++base.argumentOffset;
                        this.state = State.Input;
                        return true;
                    case State.LongOptionMergedOptionalValue:
                        //  the rest of the argument is a long option value
                        elementType = ElementType.LongOptionOptionalValue;
                        elementText = this.argument.Substring(this.subOffset);
                        argumentOffset = base.argumentOffset;
                        characterOffset = this.subOffset;
                        ++base.argumentOffset;
                        this.state = State.Input;
                        return true;
                    case State.LongOptionMergedRequiredValue:
                        //  the rest of the argument is a long option value
                        elementType = ElementType.LongOptionRequiredValue;
                        elementText = this.argument.Substring(this.subOffset);
                        argumentOffset = base.argumentOffset;
                        characterOffset = this.subOffset;
                        ++base.argumentOffset;
                        this.state = State.Input;
                        return true;
                    case State.TranslatedLongOptionMergedOptionalValue:
                        //  the rest of the argument is a long option value
                        elementType = ElementType.LongOptionOptionalValue;
                        elementText = this.argument.Substring(this.subOffset);
                        argumentOffset = base.argumentOffset - 1;
                        characterOffset = this.subOffset + this.vendorReservedSubOffset - 1;
                        this.state = State.Input;
                        return true;
                    case State.TranslatedLongOptionMergedRequiredValue:
                        //  the rest of the argument is a long option value
                        elementType = ElementType.LongOptionRequiredValue;
                        elementText = this.argument.Substring(this.subOffset);
                        argumentOffset = base.argumentOffset - 1;
                        characterOffset = this.subOffset + this.vendorReservedSubOffset - 1;
                        this.state = State.Input;
                        return true;
                    default: throw new NotImplementedException();
                }
            }
        }

        /// <summary>
        /// Indicates whether the parser is in the <see cref="State.Input"/> state.
        /// </summary>
        public bool IsInput
		{
            get
			{
                return base.state == Posix.CommandLine.ArgumentsParser.State.Input;
			}
		}


		/// <summary>
		/// Runs the unit test for this class.
		/// </summary>
		/// <exception cref="InvalidOperationException">Thrown on test fail.</exception>
		/// <remarks>May throw any other exception on broken code as well.</remarks>
		[UnitTest(2000)]
		public static new void UnitTest()
        {
            string title;
            Parser parser;
            bool hasNext;
            ElementType elementType;
            string elementText;
            int sourceOffset;
            int sourceSubOffset;

            string f() => string.Format("{0}*{1}*{2}*{3}*{4}", hasNext, elementType, elementText, sourceOffset, sourceSubOffset);
            void t(string expected, int subExperimentId = -1) { var outcome = f(); if (outcome != expected) { Debug.WriteLine(outcome); throw new InvalidOperationException(title + (subExperimentId == -1 ? "" : " (" + subExperimentId + ")")); } }

            //  PosixCliArgumentsParser tests
            title = @"(bad schema)";
            try { parser = new Parser(new string[] { }, new Assignable[] { new Assignable('+') }); throw new InvalidOperationException(title); } catch (ArgumentException) { }

            title = @"(bad schema) - W";
            try { parser = new Parser(new string[] { }, new Assignable[] { new Assignable('W') }); throw new InvalidOperationException(title); } catch (ArgumentException) { }

            title = @"(ok schema) - non-standard W";
            parser = new Parser(new string[] { }, new Assignable[] { new Assignable('W') }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Normal }); if (!parser.PosixSchema.Contains('W')) throw new InvalidOperationException(title);

            title = @"new string[] { }";
            parser = new Parser(new string[] { });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { null }";
            parser = new Parser(new string[] { "" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { "" }";
            parser = new Parser(new string[] { "" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"" }";
            parser = new Parser(new string[] { "a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-"" }";
            parser = new Parser(new string[] { "-" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*0*0");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--"" }";
            parser = new Parser(new string[] { "--" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*0*0");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--"", ""a"" }";
            parser = new Parser(new string[] { "--", "a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--"", ""-a"" }";
            parser = new Parser(new string[] { "--", "-a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"", ""--"" }";
            parser = new Parser(new string[] { "a", "--" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"", ""--"" } (non-strict)";
            parser = new Parser(new string[] { "a", "--" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { strict = false });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"", ""-"", ""--"" }";
            parser = new Parser(new string[] { "a", "-", "--" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"", ""-"", ""--"" } (non-strict)";
            parser = new Parser(new string[] { "a", "-", "--" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { strict = false });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-"", ""a"", ""--"" }";
            parser = new Parser(new string[] { "-", "a", "--" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-"", ""a"", ""--"" } (non-strict)";
            parser = new Parser(new string[] { "-", "a", "--" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { strict = false });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"", ""--"", ""-"" }";
            parser = new Parser(new string[] { "a", "--", "-" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""a"", ""--"", ""-"" } (non-strict)";
            parser = new Parser(new string[] { "a", "--", "-" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { strict = false });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-o"", ""a"", ""--"", ""-"" }";
            parser = new Parser(new string[] { "-o", "a", "--", "-" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*o*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*3*0", 4);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-o"", ""a"", ""--"", ""-"" } (non-strict)";
            parser = new Parser(new string[] { "-o", "a", "--", "-" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { strict = false });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*o*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*3*0", 4);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"" }";
            parser = new Parser(new string[] { "-a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""-a"" }";
            parser = new Parser(new string[] { "-a", "-a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*1*1", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-aa"" }";
            parser = new Parser(new string[] { "-aa" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ab"", ""-c"" }";
            parser = new Parser(new string[] { "-ab", "-c" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*1*1", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""b"" }";
            parser = new Parser(new string[] { "-a", "b" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*b*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""b"", ""-a"" }";
            parser = new Parser(new string[] { "b", "-a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*b*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""b"", ""-a"" } (non-strict)";
            parser = new Parser(new string[] { "b", "-a" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { strict = false });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*b*0*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*1*1", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""--"" }";
            parser = new Parser(new string[] { "-a", "--" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"" }";
            parser = new Parser(new string[] { "-a" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"" } (value required)";
            parser = new Parser(new string[] { "-a" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (Posix.CommandLine.ArgumentsParser.ParserException) { }

            title = @"new string[] { ""-a-"" }";
            parser = new Parser(new string[] { "-a-" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OptionalValue*-*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a-"" } (value required)";
            parser = new Parser(new string[] { "-a-" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""-"" }";
            parser = new Parser(new string[] { "-a", "-" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""-"" } (value required)";
            parser = new Parser(new string[] { "-a", "-" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""--"", ""-b"" }";
            parser = new Parser(new string[] { "-a", "--", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-b*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""--"", ""-b"" } (value required)";
            parser = new Parser(new string[] { "-a", "--", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*2*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ab"" }";
            parser = new Parser(new string[] { "-ab" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OptionalValue*b*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ab"" } (value required)";
            parser = new Parser(new string[] { "-ab" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*b*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a-b"" }";
            parser = new Parser(new string[] { "-a-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OptionalValue*-b*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a-b"" } (value required)";
            parser = new Parser(new string[] { "-a-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-b*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""b"" }";
            parser = new Parser(new string[] { "-a", "b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*b*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""b"" } (value required)";
            parser = new Parser(new string[] { "-a", "b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*b*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""-b"" }";
            parser = new Parser(new string[] { "-a", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*1*1", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""-b"" } (value required)";
            parser = new Parser(new string[] { "-a", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-b*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-cab"" }";
            parser = new Parser(new string[] { "-cab" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OptionalValue*b*0*3", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-cab"" } (value required)";
            parser = new Parser(new string[] { "-cab" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*b*0*3", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca-b"" }";
            parser = new Parser(new string[] { "-ca-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OptionalValue*-b*0*3", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca-b"" } (value required)";
            parser = new Parser(new string[] { "-ca-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-b*0*3", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca"", ""b"" }";
            parser = new Parser(new string[] { "-ca", "b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*b*1*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca"", ""b"" } (value required)";
            parser = new Parser(new string[] { "-ca", "b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*b*1*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca"", ""-b"" }";
            parser = new Parser(new string[] { "-ca", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*1*1", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca"", ""-b"" } (value required)";
            parser = new Parser(new string[] { "-ca", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-b*1*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca"", ""-b"" }";
            parser = new Parser(new string[] { "-ca", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('c', false), new ArgumentsParser.Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OptionalValue*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*1*1", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-ca"", ""-b"" } (value required)";
            parser = new Parser(new string[] { "-ca", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('a', true), new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*-b*1*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-W"" }";
            parser = new Parser(new string[] { "-W" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Special }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim } );
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (Posix.CommandLine.ArgumentsParser.ParserException) { }

            title = @"new string[] { ""-W"" } (non-standard)";
            parser = new Parser(new string[] { "-W" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Normal }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-W"", ""--abc"" } (non-standard)";
            parser = new Parser(new string[] { "-W", "--abc" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Normal }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wa"" } (non-standard)";
            parser = new Parser(new string[] { "-Wa" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Normal }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wa"", ""--abc"" } (non-standard)";
            parser = new Parser(new string[] { "-Wa", "--abc"}, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Normal }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*2", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 4);

            title = @"new string[] { ""-aW"" } (non-standard)";
            parser = new Parser(new string[] { "-aW" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Normal }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wvalue"" }";
            parser = new Parser(new string[] { "-Wvalue" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Special }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedAssignable*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedValue*value*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wvalue"", ""--abc"" }";
            parser = new Parser(new string[] { "-Wvalue", "--abc" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Special }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedAssignable*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedValue*value*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*2", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 4);

            title = @"new string[] { ""-aWvalue"" }";
            parser = new Parser(new string[] { "-aWvalue" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { vendorReservedOptionTreatment = Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Special }, new Config { VendorReservedOptionTreatment = VendorReservedOptionTreatment.Verbatim });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedAssignable*W*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedValue*value*0*3", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-b+c"" }";
            parser = new Parser(new string[] { "-b+c" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*0*1", 1);
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title + " (2)"); } catch (Posix.CommandLine.ArgumentsParser.ParserException) { }

            title = @"new string[] { ""-b+c"" } (operand)";
            parser = new Parser(new string[] { "-b+c" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { unrecognizableArgumentTreatment = UnrecognizableArgumentTreatment.Operand });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*0*1", 1);
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title + " (2)"); } catch (Posix.CommandLine.ArgumentsParser.ParserException) { }

            title = @"new string[] { ""-+bc"" }";
            parser = new Parser(new string[] { "-+bc" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (Posix.CommandLine.ArgumentsParser.ParserException) { }

            title = @"new string[] { ""-+bc"" } (operand)";
            parser = new Parser(new string[] { "-+bc" }, new Posix.CommandLine.ArgumentsParser.Parser.Config { unrecognizableArgumentTreatment = UnrecognizableArgumentTreatment.Operand });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-+bc*0*0", 1);



            //  GnuCliArgumentsParser tests
            title = @"(bad gnu schema)";
            try { parser = new Parser(new string[] { }, new Assignable[] { new Assignable("+") }); throw new InvalidOperationException(title); } catch (ArgumentException) { }

            title = @"new string[] { ""--abc"" } (1)";
            parser = new Parser(new string[] { "--abc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"" } (2)";
            parser = new Parser(new string[] { "--abc" }, new Assignable[] { new Assignable('a') });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"" } (assignable)";
            parser = new Parser(new string[] { "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""--ab-c"" }";
            parser = new Parser(new string[] { "--abc", "--ab-c" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*ab-c*1*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""-a"" }";
            parser = new Parser(new string[] { "--abc", "-a" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*1*1", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-a"", ""--abc"" }";
            parser = new Parser(new string[] { "-a", "--abc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc="" }";
            parser = new Parser(new string[] { "--abc=" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""--abc="" } (assignable)";
            parser = new Parser(new string[] { "--abc=" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2");
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc="" } (requires value)";
            parser = new Parser(new string[] { "--abc=" }, new Assignable[] { new Assignable("abc", true) });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""--abc"", ""-a"" }";
            parser = new Parser(new string[] { "--abc", "-a" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*1*1", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""-a"" } (requires value)";
            parser = new Parser(new string[] { "--abc", "-a" }, new Assignable[] { new Assignable("abc", true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionRequiredValue*-a*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc="", ""-a"" }";
            parser = new Parser(new string[] { "--abc=", "-a" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*1*1", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc=="" }";
            parser = new Parser(new string[] { "--abc==" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""--abc=="" } (assignable)";
            parser = new Parser(new string[] { "--abc==" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionOptionalValue*=*0*6", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""="" } (assignable, split value)";
            parser = new Parser(new string[] { "--abc", "=" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*=*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc=="" } (requires value)";
            parser = new Parser(new string[] { "--abc==" }, new Assignable[] { new Assignable("abc", true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionRequiredValue*=*0*6", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""="" } (requires value, split value)";
            parser = new Parser(new string[] { "--abc", "=" }, new Assignable[] { new Assignable("abc", true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionRequiredValue*=*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc=="", ""-a"" }";
            parser = new Parser(new string[] { "--abc==", "-a" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionOptionalValue*=*0*6", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*1*1", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""--"" }";
            parser = new Parser(new string[] { "--abc", "--" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""--"", ""--abc"" }";
            parser = new Parser(new string[] { "--abc", "--", "--abc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*OperandListMarker*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--abc*2*0", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--abc"", ""--"", ""--zz"" } (assignable, requires value)";
            parser = new Parser(new string[] { "--abc", "--", "--zz" }, new Assignable[] { new Assignable("abc", true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionRequiredValue*--*1*0", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*zz*2*2", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""--ab="" } (partial)";
            parser = new Parser(new string[] { "--ab=" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*ab*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""--ab"" } (ambigous)";
            parser = new Parser(new string[] { "--ab" }, new Assignable[] { new Assignable("abc", false), new Assignable("abd", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*ab*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""--ab="" } (ambigous, empty value)";
            parser = new Parser(new string[] { "--ab=" }, new Assignable[] { new Assignable("abc", false), new Assignable("abd", false) });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""--ab"" } (posix + gnu)";
            parser = new Parser(new string[] { "--ab" }, new Assignable[] { new Assignable("abc", false), new Assignable('a', false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*ab*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-Wabc"" } (translate, flag)";
            parser = new Parser(new string[] { "-Wabc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-Wabc"", ""--abc"" } (translate, flag)";
            parser = new Parser(new string[] { "-Wabc", "--abc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-W"", ""abc"" } (translate, flag)";
            parser = new Parser(new string[] { "-W", "abc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-W"", ""abc"", ""--abc"" } (translate, flag)";
            parser = new Parser(new string[] { "-W", "abc", "--abc" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongFlag*abc*2*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wabc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-Wabc" }, new Assignable[] { new Assignable("abc", false) } );
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-Wabc"", ""--abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-Wabc", "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-W"", ""abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-W", "abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-W"", ""abc"", ""--abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-W", "abc", "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*2*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wabc="" } (translate, assignable)";
            parser = new Parser(new string[] { "-Wabc=" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-Wabc="", ""--abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-Wabc=", "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-W"", ""abc="" } (translate, assignable)";
            parser = new Parser(new string[] { "-W", "abc=" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 2);

            title = @"new string[] { ""-W"", ""abc="", ""--abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-W", "abc=", "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*2*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wabc=value"" } (translate, assignable)";
            parser = new Parser(new string[] { "-Wabc=value" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionOptionalValue*value*0*5", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-Wabc=value"", ""--abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-Wabc=value", "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*0*2", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionOptionalValue*value*0*5", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*2", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 4);

            title = @"new string[] { ""-W"", ""abc=value"" } (translate, assignable)";
            parser = new Parser(new string[] { "-W", "abc=value" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionOptionalValue*value*1*3", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 3);

            title = @"new string[] { ""-W"", ""abc=value"", ""--abc"" } (translate, assignable)";
            parser = new Parser(new string[] { "-W", "abc=value", "--abc" }, new Assignable[] { new Assignable("abc", false) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*1*0", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongOptionOptionalValue*value*1*3", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*LongAssignable*abc*2*2", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1", 4);

            title = @"new string[] { ""--b+c"" }";
            parser = new Parser(new string[] { "--b+c" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""-+bc"" }";
            parser = new Parser(new string[] { "-+bc" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (Posix.CommandLine.ArgumentsParser.ParserException) { }
        }


        /// <summary>
        /// A list of POSIX options that support a value.
        /// </summary>
        protected Posix.CommandLine.ArgumentsParser.Assignable[] PosixSchema
        {
            get
            {
                return base.schema;
            }
        }

        /// <summary>
        /// A list of long options that support a value.
        /// </summary>
        protected readonly new Assignable[] schema;

        /// <summary>
        /// Contiguration for the parser.
        /// </summary>
        protected new readonly Config config;

        string argument = null;
        new State state = State.Input;
        int subOffset = 0;
        int vendorReservedSubOffset = 0;
    }
}
