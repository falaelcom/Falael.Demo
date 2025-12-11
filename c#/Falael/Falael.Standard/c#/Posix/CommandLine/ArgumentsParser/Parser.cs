//	R0Q0/daniel/20201018
using System;
using System.Linq;
using System.Diagnostics;

namespace Falael.Posix.CommandLine.ArgumentsParser
{
    /// <summary>
    /// A symmetrical parser for CLI arguments as recommended by POSIX.
    /// </summary>
	/// <remarks>
	/// The output of symmetrical parsers contains all necessary information for the original input to be identically to recreated from it.
	/// </remarks>
    /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
    public class Parser
    {
        /// <summary>
        /// Initializes a new instance of the class with a given args list, optional list of options that require values and parser configuration (<see cref="Config"/>).
        /// </summary>
        /// <param name="list">A list of arguments as in the program's Main function <code>string[] args</code> parameter.</param>
        /// <param name="schema">A list of options that accept a value.</param>
        /// <param name="config">Contiguration for the parser.</param>
        /// <remarks>
        /// If <paramref name="config"/>.vendorOptionTreatment == EVendorOptionTreatment.Assignable (default), the <code>('W', true)</code> assignable is implicitly added to the <paramref name="schema"/>. In such case, throws an <see cref="ArgumentException"/> if <paramref name="schema"/> already conains the name <code>'W'</code>.
        /// </remarks>
        public Parser(string[] list, Assignable[] schema = null, Config config = null)
        {
            schema?.Validate();

            this.list = list;
            this.schema = schema;
            this.config = config ?? Config.Default;

            switch (this.config.vendorReservedOptionTreatment)
            {
                case VendorReservedOptionTreatment.Special:
                    if (this.schema == null)
                    {
                        this.schema = new[] { new Assignable('W', true) };
                        break;
                    }
                    if (this.schema.Contains('W')) throw new ArgumentException("Illegal assignable name 'W'.", "schema");
                    this.schema = this.schema.Concat(new[] { new Assignable('W', true) }).ToArray();
                    break;
                case VendorReservedOptionTreatment.Normal: break;
                default: throw new NotImplementedException();
            }
        }

        /// <summary>
        /// Initializes a new instance of the class with a given args list and parser configuration (<see cref="Config"/>).
        /// </summary>
        /// <param name="list">The list of arguments as in the program's Main function <code>string[] args</code> parameter.</param>
        /// <param name="config">Contiguration for the parser.</param>
        /// <remarks>
        /// If <paramref name="config"/>.vendorOptionTreatment == EVendorOptionTreatment.Assignable (default), the <code>('W', true)</code> assignable is implicitly added to the <see cref="schema"/>.
        /// </remarks>
        public Parser(string[] list, Config config)
        {
            this.list = list;
            this.config = config ?? Config.Default;

            switch (this.config.vendorReservedOptionTreatment)
            {
                case VendorReservedOptionTreatment.Special: this.schema = new[] { new Assignable('W', true) }; break;
                case VendorReservedOptionTreatment.Normal: break;
                default: throw new NotImplementedException();
            }
        }

        /// <summary>
        /// Enumerates the possible behaviors of the parser on unrecognizable arguments. The following argument patterns are considered unrecognizable: /--.+/, /-[^\p{L}\p{N}].*/
        /// </summary>
        /// <remarks>
        /// An unrecognizable character within an option group always causes an exception.
        /// </remarks>
        public enum UnrecognizableArgumentTreatment
        {
            /// <summary>
            /// The argument is treated as an operand.
            /// </summary>
            Operand,
            /// <summary>
            /// An excepion is raised.
            /// </summary>
            Error,
        }

        /// <summary>
        /// Enumerates the possible interpretations of the <code>-W</code> option.
        /// </summary>
        /// <remarks>
        /// The POSIX guidelines specify that "The -W (capital-W) option shall be reserved for vendor options.", which implies that it shall be treated as an assignable.
        /// </remarks>
        public enum VendorReservedOptionTreatment
        {
            /// <summary>
            /// The parser treats <code>-W</code> as an assignable. An <see cref="ArgumentException"/> exception is thrown if the schema contains the <code>'W'</code> name.
            /// </summary>
            /// <remarks>
            /// Will force the parser to produce <see cref="ElementType.VendorReservedAssignable"/> and <see cref="ElementType.VendorReservedValue"/> elements.
            /// </remarks>
            Special,
            /// <summary>
            /// The parser treats <code>-W</code> as described by the schema (no special treatment, non-standard).
            /// </summary>
            Normal,
        }

        /// <summary>
        /// Parser configuration class.
        /// </summary>
        public class Config
        {
            /// <summary>
            /// If set will be used to test options for satisfying the POSIX requirement for alpha-numerical option names.
            /// </summary>
            /// <remarks>
            /// If not set the <see cref="System.Char.IsLetterOrDigit(char)"/> method is used by default.
            /// </remarks>
            public Func<char, bool> IsAlnum = null;

            /// <summary>
            /// If set to true enforces the POSIX default handling as operands for all arguments after the first operand. If set to false options and operands can be intermixed until the first "--" argument match.
            /// </summary>
            public bool strict = true;

            /// <summary>
            /// Indicates the behavior of the parser on unrecognizable arguments occurrence. The following argument patterns are considered unrecognizable: /--.+/, /-[^\p{L}\p{N}].*/
            /// </summary>
            public UnrecognizableArgumentTreatment unrecognizableArgumentTreatment = UnrecognizableArgumentTreatment.Error;

            /// <summary>
            /// Indicates the way the parser interpretats the <code>-W</code> option.
            /// </summary>
            public VendorReservedOptionTreatment vendorReservedOptionTreatment = VendorReservedOptionTreatment.Special;

            /// <summary>
            /// An instance specifying a default parser configuration.
            /// </summary>
            public static readonly Config Default = new Config();
        }


        /// <summary>
        /// Initializes the output parameters with the information for the next element and returns true. At the end of the input returns false.
        /// </summary>
        /// <remarks>Throws <see cref="ParserException"/> on group parsing error.</remarks>
        /// <param name="elementType">The type of the detected element.</param>
        /// <param name="elementText">For options holds a single character string containing the name of the option. For merged values (i.e. an option requiring a value merged with it's value in one argument) holds a text containing the value part of the argument. In all other cases holds the complete text of the source argument.</param>
        /// <param name="argumentOffset">The current argument index.</param>
        /// <param name="characterOffset">The current character index within the current argument.</param>
        /// <returns>Returns false if reached the end of the list, otherwise returns true.</returns>
        /// <exception cref="NotImplementedException">Thrown on an unknown enumeration value for the <see cref="UnrecognizableArgumentTreatment"/> and <see cref="State"/> enumeration.</exception>
        /// <exception cref="ParserException">Thrown on on a parser error. See <see cref="ParserException"/> for details.</exception>
        public bool GetNext(out ElementType elementType, out string elementText, out int argumentOffset, out int characterOffset)
        {
            while (true)
            {
                if (this.IsEOI)
                {
                    elementType = ElementType.EOI;
                    elementText = null;
                    argumentOffset = -1;
                    characterOffset = -1;
                    return false;
                }

                string a = this.list[this.argumentOffset];
                if (a == null || a.Length == 0)
                {
                    ++this.argumentOffset;
                    continue;
                }
                switch (this.state)
                {
                    case State.Input:
                        {
                            char c0 = a[0];
                            if (c0 != '-')
                            {
                                //  non-option element - does not begin with '-'
                                elementType = ElementType.Operand;
                                elementText = a;
                                argumentOffset = this.argumentOffset;
                                characterOffset = 0;
                                ++this.argumentOffset;
                                if (this.config.strict) this.state = State.OperandList;
                                return true;
                            }
                            if (a.Length == 1)
                            {
                                //  non-option element - a single '-'
                                elementType = ElementType.Operand;
                                elementText = a;
                                argumentOffset = this.argumentOffset;
                                characterOffset = 0;
                                ++this.argumentOffset;
                                if (this.config.strict) this.state = State.OperandList;
                                return true;
                            }
                            char c1 = a[1];
                            if (c1 == '-')
                            {
                                if (a.Length == 2)
                                {
                                    //  "--"
                                    elementType = ElementType.OperandListMarker;
                                    elementText = a;
                                    argumentOffset = this.argumentOffset;
                                    characterOffset = 0;
                                    ++this.argumentOffset;
                                    this.state = State.OperandList;
                                    return true;
                                }
                                //  unknown element - double '-' followed by further text
                                switch (this.config.unrecognizableArgumentTreatment)
                                {
                                    case UnrecognizableArgumentTreatment.Operand:
                                        elementType = ElementType.Operand;
                                        elementText = a;
                                        argumentOffset = this.argumentOffset;
                                        characterOffset = 0;
                                        ++this.argumentOffset;
                                        if (this.config.strict) this.state = State.OperandList;
                                        return true;
                                    case UnrecognizableArgumentTreatment.Error: throw new ParserException(101, "Illegal character sequence.", this.state, null, a, this.argumentOffset, this.characterOffset);
                                    default: throw new NotImplementedException();
                                }
                            }
                            bool isAlnum = this.config.IsAlnum == null ? char.IsLetterOrDigit(c1) : this.config.IsAlnum(c1);
                            if (isAlnum)
                            {
                                Assignable assignable = this.schema?.Find(c1);
                                if (assignable != null)
                                {
                                    //  option element with value
                                    if (a.Length > 2)
                                    {
                                        //  value merged
                                        if (c1 == 'W' && this.config.vendorReservedOptionTreatment == VendorReservedOptionTreatment.Special)
                                        {
                                            elementType = ElementType.VendorReservedAssignable;
                                            elementText = c1.ToString();
                                            argumentOffset = this.argumentOffset;
                                            characterOffset = 1;
                                            this.characterOffset = 2;
                                            this.state = State.VendorReservedMergedValue;
                                            return true;
                                        }
                                        else
                                        {
                                            elementType = ElementType.Assignable;
                                            elementText = c1.ToString();
                                            argumentOffset = this.argumentOffset;
                                            characterOffset = 1;
                                            this.characterOffset = 2;
                                            this.state = assignable.ValueRequired ? State.MergedRequiredValue : State.MergedOptionalValue;
                                            return true;
                                        }
                                    }
                                    //  no merged value
                                    if (c1 == 'W' && this.config.vendorReservedOptionTreatment == VendorReservedOptionTreatment.Special)
                                    {
                                        elementType = ElementType.VendorReservedAssignable;
                                        elementText = c1.ToString();
                                        argumentOffset = this.argumentOffset;
                                        characterOffset = 1;
                                        ++this.argumentOffset;
                                        //  value is required, will be looking for the next value-argument
                                        if (this.IsEOI) throw new ParserException(102, "Value is required.", this.state, (ElementType?)elementType, elementText, this.argumentOffset, this.characterOffset);
                                        this.state = State.VendorReservedValue;
                                        return true;
                                    }
                                    else
                                    {
                                        elementType = ElementType.Assignable;
                                        elementText = c1.ToString();
                                        argumentOffset = this.argumentOffset;
                                        characterOffset = 1;
                                        ++this.argumentOffset;
                                        if (assignable.ValueRequired)
                                        {
                                            //  value is required, will be looking for the next value-argument
                                            if (this.IsEOI) throw new ParserException(103, "Value is required.", this.state, (ElementType?)elementType, elementText, this.argumentOffset, this.characterOffset);
                                            this.state = State.Value;
                                        }
                                        //  value is optional and missing
                                        else this.state = State.Input;
                                        return true;
                                    }
                                }
                                if (a.Length > 2)
                                {
                                    //  grouped options
                                    elementType = ElementType.Flag;
                                    elementText = c1.ToString();
                                    argumentOffset = this.argumentOffset;
                                    characterOffset = 1;
                                    this.characterOffset = 2;
                                    this.state = State.Group;
                                    return true;
                                }
                                //  option with no value expected
                                elementType = ElementType.Flag;
                                elementText = c1.ToString();
                                argumentOffset = this.argumentOffset;
                                characterOffset = 1;
                                ++this.argumentOffset;
                                return true;
                            }
                            switch (this.config.unrecognizableArgumentTreatment)
                            {
                                case UnrecognizableArgumentTreatment.Operand:
                                    elementType = ElementType.Operand;
                                    elementText = a;
                                    argumentOffset = this.argumentOffset;
                                    characterOffset = 0;
                                    ++this.argumentOffset;
                                    if (this.config.strict) this.state = State.OperandList;
                                    return true;
                                case UnrecognizableArgumentTreatment.Error: throw new ParserException(104, "Illegal character.", this.state, null, a, this.argumentOffset, this.characterOffset);
                                default: throw new NotImplementedException();
                            }
                        }
                    case State.MergedOptionalValue:
                        {
                            elementType = ElementType.OptionalValue;
                            elementText = a.Substring(this.characterOffset);
                            argumentOffset = this.argumentOffset;
                            characterOffset = this.characterOffset;
                            ++this.argumentOffset;
                            this.state = State.Input;
                            return true;
                        }
                    case State.MergedRequiredValue:
                        {
                            elementType = ElementType.RequiredValue;
                            elementText = a.Substring(this.characterOffset);
                            argumentOffset = this.argumentOffset;
                            characterOffset = this.characterOffset;
                            ++this.argumentOffset;
                            this.state = State.Input;
                            return true;
                        }
                    case State.VendorReservedMergedValue:
                        {
                            elementType = ElementType.VendorReservedValue;
                            elementText = a.Substring(this.characterOffset);
                            argumentOffset = this.argumentOffset;
                            characterOffset = this.characterOffset;
                            ++this.argumentOffset;
                            this.state = State.Input;
                            return true;
                        }
                    case State.Value:
                        {
                            elementType = ElementType.RequiredValue;
                            elementText = a;
                            argumentOffset = this.argumentOffset;
                            characterOffset = 0;
                            ++this.argumentOffset;
                            this.state = State.Input;
                            return true;
                        }
                    case State.VendorReservedValue:
                        {
                            elementType = ElementType.VendorReservedValue;
                            elementText = a;
                            argumentOffset = this.argumentOffset;
                            characterOffset = 0;
                            ++this.argumentOffset;
                            this.state = State.Input;
                            return true;
                        }
                    case State.Group:
                        {
                            char c = a[this.characterOffset];
                            Assignable assignable = this.schema?.Find(c);
                            if (assignable != null)
                            {
                                //  option element with value at the end of the group
                                if (a.Length - this.characterOffset > 1)
                                {
                                    //  value merged
                                    if (c == 'W' && this.config.vendorReservedOptionTreatment == VendorReservedOptionTreatment.Special)
                                    {
                                        elementType = ElementType.VendorReservedAssignable;
                                        elementText = c.ToString();
                                        argumentOffset = this.argumentOffset;
                                        characterOffset = this.characterOffset;
                                        ++this.characterOffset;
                                        this.state = State.VendorReservedMergedValue;
                                        return true;
                                    }
                                    else
                                    {
                                        elementType = ElementType.Assignable;
                                        elementText = c.ToString();
                                        argumentOffset = this.argumentOffset;
                                        characterOffset = this.characterOffset;
                                        ++this.characterOffset;
                                        this.state = assignable.ValueRequired ? State.MergedRequiredValue : State.MergedOptionalValue;
                                        return true;
                                    }
                                }
                                //  no merged value at the end of the group
                                if (c == 'W' && this.config.vendorReservedOptionTreatment == VendorReservedOptionTreatment.Special)
                                {
                                    elementType = ElementType.VendorReservedAssignable;
                                    elementText = c.ToString();
                                    argumentOffset = this.argumentOffset;
                                    characterOffset = this.characterOffset;
                                    ++this.argumentOffset;
                                    //  value is required, will be looking for the next value-argument
                                    if (this.IsEOI) throw new ParserException(102, "Value is required.", this.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, this.argumentOffset, this.characterOffset);
                                    this.state = State.VendorReservedMergedValue;
                                    return true;
                                }
                                else
                                {
                                    elementType = ElementType.Assignable;
                                    elementText = c.ToString();
                                    argumentOffset = this.argumentOffset;
                                    characterOffset = this.characterOffset;
                                    ++this.argumentOffset;
                                    if (assignable.ValueRequired)
                                    {
                                        //  value is required, will be looking for the next value-argument
                                        if (this.IsEOI) throw new ParserException(103, "Value is required.", this.state, (Posix.CommandLine.ArgumentsParser.ElementType?)elementType, elementText, this.argumentOffset, this.characterOffset);
                                        this.state = State.Value;
                                    }
                                    //  value is optional and missing
                                    else this.state = State.Input;
                                    return true;
                                }
                            }
                            bool isAlnum = this.config.IsAlnum == null ? char.IsLetterOrDigit(c) : this.config.IsAlnum(c);
                            if (!isAlnum) throw new ParserException(105, "Illegal character in group.", this.state, null, a, this.argumentOffset, this.characterOffset);
                            //  it's a flag
                            elementType = ElementType.Flag;
                            elementText = c.ToString();
                            argumentOffset = this.argumentOffset;
                            characterOffset = this.characterOffset;
                            ++this.characterOffset;
                            if (this.characterOffset >= a.Length)
                            {
                                this.state = State.Input;
                                ++this.argumentOffset;
                            }
                            return true;
                        }
                    case State.OperandList:
                        {
                            elementType = ElementType.Operand;
                            elementText = a;
                            argumentOffset = this.argumentOffset;
                            characterOffset = 0;
                            ++this.argumentOffset;
                            return true;
                        }
                    default: throw new NotImplementedException();
                }
            }
        }

        /// <summary>
        /// Equals true if the parser has reached the end of the list, otherwise equals false.
        /// </summary>
        public bool IsEOI
        {
            get { return this.argumentOffset >= this.list.Length; }
        }


        /// <summary>
        /// Runs the unit test for this class.
        /// </summary>
        /// <exception cref="InvalidOperationException">Thrown on test fail.</exception>
		/// <remarks>May throw any other exception on broken code as well.</remarks>
        [UnitTest(1000)]
        public static void UnitTest()
        {
            string title;
            Parser parser;
            bool hasNext;
            ElementType elementType;
            string elementText;
            int sourceOffset;
            int sourceSubOffset;

            string f() => string.Format("{0}*{1}*{2}*{3}*{4}", hasNext, elementType, elementText, sourceOffset, sourceSubOffset);
            void t(string expected, int subExperimentId = -1) { var result = f(); if (result != expected) { Debug.WriteLine(result); throw new InvalidOperationException(title + (subExperimentId == -1 ? "" : " (" + subExperimentId + ")")); } }

            title = @"(bad schema)";
            try { parser = new Parser(new string[] { }, new Assignable[] { new Assignable('+') }); throw new InvalidOperationException(title); } catch (ArgumentException) { }

            title = @"(bad schema) - W";
            try { parser = new Parser(new string[] { }, new Assignable[] { new Assignable('W') }); throw new InvalidOperationException(title); } catch (ArgumentException) { }

            title = @"(ok schema) - non-standard W";
            parser = new Parser(new string[] { }, new Assignable[] { new Assignable('W') }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Normal }); if(!parser.schema.Contains('W')) throw new InvalidOperationException(title);

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
            parser = new Parser(new string[] { "a", "--" }, new Config { strict = false });
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
            parser = new Parser(new string[] { "a", "-", "--" }, new Config { strict = false });
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
            parser = new Parser(new string[] { "-", "a", "--" }, new Config { strict = false });
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
            parser = new Parser(new string[] { "a", "--", "-" }, new Config { strict = false });
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
            parser = new Parser(new string[] { "-o", "a", "--", "-" }, new Config { strict = false });
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
            parser = new Parser(new string[] { "b", "-a" }, new Config { strict = false });
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
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

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
            parser = new Parser(new string[] { "-ca", "-b" }, new ArgumentsParser.Assignable[] { new ArgumentsParser.Assignable('c', true), new ArgumentsParser.Assignable('a', true) });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Assignable*c*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*RequiredValue*a*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*1*1", 3);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("False*EOI**-1*-1");

            title = @"new string[] { ""-W"" }";
            parser = new Parser(new string[] { "-W" }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Special });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""-W"" } (non-standard)";
            parser = new Parser(new string[] { "-W" }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Normal });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*1", 1);

            title = @"new string[] { ""-Wa"" } (non-standard)";
            parser = new Parser(new string[] { "-Wa" }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Normal });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*2", 2);

            title = @"new string[] { ""-aW"" } (non-standard)";
            parser = new Parser(new string[] { "-aW" }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Normal });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*W*0*2", 2);

            title = @"new string[] { ""-Wvalue"" }";
            parser = new Parser(new string[] { "-Wvalue" }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Special });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedAssignable*W*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedValue*value*0*2", 2);

            title = @"new string[] { ""-aWvalue"" }";
            parser = new Parser(new string[] { "-aWvalue" }, new Config { vendorReservedOptionTreatment = VendorReservedOptionTreatment.Special });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*a*0*1", 1);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedAssignable*W*0*2", 2);
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*VendorReservedValue*value*0*3", 3);

            title = @"new string[] { ""-b+c"" }";
            parser = new Parser(new string[] { "-b+c" });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*0*1", 1);
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title + " (2)"); } catch (ParserException) { }

            title = @"new string[] { ""-b+c"" } (operand)";
            parser = new Parser(new string[] { "-b+c" }, new Config { unrecognizableArgumentTreatment = UnrecognizableArgumentTreatment.Operand });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Flag*b*0*1", 1);
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title + " (2)"); } catch (ParserException) { }

            title = @"new string[] { ""-+bc"" }";
            parser = new Parser(new string[] { "-+bc" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""-+bc"" } (operand)";
            parser = new Parser(new string[] { "-+bc" }, new Config { unrecognizableArgumentTreatment = UnrecognizableArgumentTreatment.Operand });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*-+bc*0*0", 1);

            title = @"new string[] { ""--a"" }";
            parser = new Parser(new string[] { "--a" });
            try { parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); throw new InvalidOperationException(title); } catch (ParserException) { }

            title = @"new string[] { ""--a"" } (operand)";
            parser = new Parser(new string[] { "--a" }, new Config { unrecognizableArgumentTreatment = UnrecognizableArgumentTreatment.Operand });
            hasNext = parser.GetNext(out elementType, out elementText, out sourceOffset, out sourceSubOffset); t("True*Operand*--a*0*0", 1);
        }


        /// <summary>
        /// A list of arguments as in the program's Main function <code>string[] args</code> parameter.
        /// </summary>
        protected readonly string[] list;
        /// <summary>
        /// A list of options that support a value.
        /// </summary>
        protected readonly Assignable[] schema;
        /// <summary>
        /// Contiguration for the parser.
        /// </summary>
        protected readonly Config config;

        /// <summary>
        /// The current argument index.
        /// </summary>
        protected int argumentOffset = 0;
        /// <summary>
        /// The current character index within the current argument. Has a meaning only while parsing groups and merged arguments.
        /// </summary>
        protected int characterOffset = 0;
        /// <summary>
        /// The current state of the parser.
        /// </summary>
        protected State state = State.Input;
    }
}
