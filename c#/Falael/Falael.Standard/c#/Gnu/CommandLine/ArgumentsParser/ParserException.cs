//	R0Q0/daniel/20201018
namespace Falael.Gnu.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Thrown on CLI arguments parsing error.
    /// </summary>
    /// <remarks>
    /// Built-in error codes:
    /// <list type="bullet">
    /// <item>201 - "Not an assignble option." Thrown by <see cref="Parser.GetNext"/> on a value assignment to a long flag attempt.</item>
    /// <item>202 - "Value is required." Thrown by <see cref="Parser.GetNext"/> when no value is given to an occurrence of a long assignable that requires a value.</item>
    /// <item>203 - "Invalid character in long option name." Thrown by <see cref="Parser.GetNext"/> when a long option name contains an unrecognizable character.</item>
    /// </list>
    /// </remarks>
    public class ParserException : Posix.CommandLine.ArgumentsParser.ParserException
    {
        /// <summary>
        /// Initializes a new instance of this class.
        /// </summary>
        /// <param name="code">A code identifying the exception source.</param>
        /// <param name="message">The message that describes the error.</param>
        /// <param name="gnuState">The state of the GNU parser when the error occurred.</param>
        /// <param name="posixState">The state of the POSIX parser when the error occurred.</param>
        /// <param name="elementType">The current element type at the time the error occurred. Can be null if the current element type was unknown at the time the error occurred.</param>
        /// <param name="elementText">The current element text at the time the error occurred. Can be null if the current element type was unknown at the time the error occurred.</param>
        /// <param name="offset">The argument index at which the error occurred.</param>
        /// <param name="subOffset">The character index within the argument at which the error occurred.</param>
        public ParserException(int code, string message, State gnuState, Posix.CommandLine.ArgumentsParser.State posixState, Posix.CommandLine.ArgumentsParser.ElementType? elementType, string elementText, int offset, int subOffset)
            : base(code, message, posixState, elementType, elementText, offset, subOffset)
        {
            this.GnuState = gnuState;
        }
        /// <summary>
        /// Initializes a new instance of this class.
        /// </summary>
        public ParserException()
        {
        }
        /// <summary>
        /// The state of the GNU parser at the time the error occurred.
        /// </summary>
        public State GnuState { get; }
    }
}