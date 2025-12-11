//	R0Q0/daniel/20201018
namespace Falael.Posix.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Enumerates the types of the entries detected by the arguments parser.
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
        /// Optional value.
        /// </summary>
        OptionalValue,
        /// <summary>
        /// Required value.
        /// </summary>
        RequiredValue,
        /// <summary>
        /// -W or -Wvalue.
        /// </summary>
        /// <remarks>
        /// The <see cref="Parser"/> will produce elemens with this type only if <see cref="Parser.Config.vendorReservedOptionTreatment"/> == <see cref="Parser.VendorReservedOptionTreatment.Special"/>.
        /// </remarks>
        VendorReservedAssignable,
        /// <summary>
        /// The value that fillows a <see cref="VendorReservedAssignable"/> element.
        /// </summary>
        /// <remarks>
        /// The <see cref="Parser"/> will produce elemens with this type only if <see cref="Parser.Config.vendorReservedOptionTreatment"/> == <see cref="Parser.VendorReservedOptionTreatment.Special"/>.
        /// </remarks>
        VendorReservedValue,
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
