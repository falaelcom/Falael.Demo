//	R0Q0/daniel/20201018
using System;

namespace Falael.Posix.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Thrown on CLI arguments parsing error.
    /// </summary>
    /// <remarks>
    /// Built-in error codes:
    /// <list type="bullet">
    /// <item>101 - "Illegal character sequence." Thrown by <see cref="Parser.GetNext"/> when <see cref="Parser.Config.unrecognizableArgumentTreatment"/> == <see cref="Parser.UnrecognizableArgumentTreatment.Error"/> and a non-operand list marker string starting with "--" is encountered.</item>
    /// <item>102 - "Value is required." Thrown by <see cref="Parser.GetNext"/> when <see cref="Parser.Config.vendorReservedOptionTreatment"/> == <see cref="Parser.VendorReservedOptionTreatment.Special"/> and a <code>-W</code> without a value is encoutered.</item>
    /// <item>103 - "Value is required." Thrown by <see cref="Parser.GetNext"/> when no value is given to an occurrence of an assignable that requires a value.</item>
    /// <item>104 - "Illegal character." Thrown by <see cref="Parser.GetNext"/> when <see cref="Parser.Config.unrecognizableArgumentTreatment"/> == <see cref="Parser.UnrecognizableArgumentTreatment.Error"/> and the second character of a string starting with '-' is not '-' and cannot be parsed as an option, (e.g. "-+", "-+azz").</item>
    /// <item>105 - "Illegal character in group." Thrown by <see cref="Parser.GetNext"/> when an option group contains a non-recognizable character immediately after a grouped flag (e.g. "-a+zzz", "-az+zz", where a and z are flags).</item>
    /// </list>
    /// </remarks>
    public class ParserException : Exception
    {
        /// <summary>
        /// Initializes a new instance of this class.
        /// </summary>
        /// <param name="code">A code identifying the exception source.</param>
        /// <param name="message">The message that describes the error.</param>
        /// <param name="state">The state of the parser when the error occurred.</param>
        /// <param name="elementType">The current element type at the time the error occurred. Can be null if the current element type was unknown at the time the error occurred.</param>
        /// <param name="elementText">The current element text at the time the error occurred. Can be null if the current element text was unknown at the time the error occurred.</param>
        /// <param name="argumentOffset">The argument index at which the error occurred.</param>
        /// <param name="characterOffset">The character index within the argument at which the error occurred.</param>
        public ParserException(int code, string message, State state, ElementType? elementType, string elementText, int argumentOffset, int characterOffset)
            : base(message)
        {
            this.Code = code;
            this.State = state;
            this.ElementType = elementType;
            this.ElementText = elementText;
            this.ArgumentOffset = argumentOffset;
            this.CharacterOffset = characterOffset;
        }
        /// <summary>
        /// Initializes a new instance of this class.
        /// </summary>
        public ParserException()
        {
        }
        /// <summary>
        /// A code identifying the exception source.
        /// </summary>
        public int Code { get; }
        /// <summary>
        /// The state of the POSIX parser at the time the error occurred.
        /// </summary>
        public State State { get; }
        /// <summary>
        /// The current element type at the time the error occurred. Can be null if the current element type was unknown at the time the error occurred.
        /// </summary>
        public ElementType? ElementType { get; }
        /// <summary>
        /// The current element text at the time the error occurred. Can be null if the current element text was unknown at the time the error occurred.
        /// </summary>
        public string ElementText { get; }
        /// <summary>
        /// The argument index at which the error occurred.
        /// </summary>
        public int ArgumentOffset { get; }
        /// <summary>
        /// The character index within the argument at which the error occurred.
        /// </summary>
        public int CharacterOffset { get; }
    }
}