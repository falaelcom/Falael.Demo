//	R0Q0/daniel/20201018
namespace Falael.Gnu.CommandLine.OptionsParser
{
    /// <summary>
    /// Enumerates the types of the entries detected by the options parser.
    /// </summary>
    /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
    public enum ElementType
    {
        /// <summary>
        /// End Of Input.
        /// </summary>
        EOI,
        /// <summary>
        /// Option without a value.
        /// </summary>
        Flag,
        /// <summary>
        /// Option with a value.
        /// </summary>
        Assignable,
        /// <summary>
        /// Operand.
        /// </summary>
        Operand,
        /// <summary>
        /// Marks the start of the operand list; generated at "--".
        /// </summary>
        OperandListMarker,
    }
}
