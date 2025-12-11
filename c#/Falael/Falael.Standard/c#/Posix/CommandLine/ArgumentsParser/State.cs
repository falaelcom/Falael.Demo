//	R0Q0/daniel/20201018
namespace Falael.Posix.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Enumerates the POSIX CLI arguments parser states.
    /// </summary>
    /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
    public enum State
    {
        /// <summary>
        /// Parsing the input.
        /// </summary>
        Input,
        /// <summary>
        /// Parsing the input immediately after an option with a value.
        /// </summary>
        Value,
        /// <summary>
        /// Parsing the value of an option that accepts an optional value.
        /// </summary>
        MergedOptionalValue,
        /// <summary>
        /// Parsing the value of an option that requires a value.
        /// </summary>
        MergedRequiredValue,
        /// <summary>
        /// Parsing the value of -Wvalue.
        /// </summary>
        VendorReservedMergedValue,
        /// <summary>
        /// Parsing the value of -W value.
        /// </summary>
        VendorReservedValue,
        /// <summary>
        /// Parsing a group of options.
        /// </summary>
        Group,
        /// <summary>
        /// Parsing the operand list.
        /// </summary>
        OperandList,
    }
}
