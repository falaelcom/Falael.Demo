//	R0Q0/daniel/20201018
namespace Falael.Gnu.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Enumerates the types of the entries detected by the arguments parser.
    /// </summary>
    /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
    public enum ElementType
    {
        /// <summary>
        /// End Of List
        /// </summary>
        EOI = Posix.CommandLine.ArgumentsParser.ElementType.EOI,
        /// <summary>
        /// Option without a value.
        /// </summary>
        Flag = Posix.CommandLine.ArgumentsParser.ElementType.Flag,
        /// <summary>
        /// Option with a value.
        /// </summary>
        Assignable = Posix.CommandLine.ArgumentsParser.ElementType.Assignable,
        /// <summary>
        /// Optional value.
        /// </summary>
        OptionalValue = Posix.CommandLine.ArgumentsParser.ElementType.OptionalValue,
        /// <summary>
        /// Optional value.
        /// </summary>
        RequiredValue = Posix.CommandLine.ArgumentsParser.ElementType.RequiredValue,
        /// <summary>
        /// -W or -Wvalue.
        /// </summary>
        /// <remarks>
        /// The <see cref="Parser"/> will produce elemens with this type only if <see cref="Posix.CommandLine.ArgumentsParser.Parser.Config.vendorReservedOptionTreatment"/> == <see cref="Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Special"/> and <see cref="Parser.Config.VendorReservedOptionTreatment"/> == <see cref="Parser.VendorReservedOptionTreatment.Verbatim"/>.
        /// </remarks>
        VendorReservedAssignable = Posix.CommandLine.ArgumentsParser.ElementType.VendorReservedAssignable,
        /// <summary>
        /// The value that fillows a <see cref="VendorReservedAssignable"/> element.
        /// </summary>
        /// <remarks>
        /// The <see cref="Parser"/> will produce elemens with this type only if <see cref="Posix.CommandLine.ArgumentsParser.Parser.Config.vendorReservedOptionTreatment"/> == <see cref="Posix.CommandLine.ArgumentsParser.Parser.VendorReservedOptionTreatment.Special"/> and <see cref="Parser.Config.VendorReservedOptionTreatment"/> == <see cref="Parser.VendorReservedOptionTreatment.Verbatim"/>.
        /// </remarks>
        VendorReservedValue = Posix.CommandLine.ArgumentsParser.ElementType.VendorReservedValue,
        /// <summary>
        /// Operand.
        /// </summary>
        Operand = Posix.CommandLine.ArgumentsParser.ElementType.Operand,
        /// <summary>
        /// Marks the start of the operand list; generated at "--".
        /// </summary>
        OperandListMarker = Posix.CommandLine.ArgumentsParser.ElementType.OperandListMarker,
        /// <summary>
        /// Long option without a value.
        /// </summary>
        LongFlag,
        /// <summary>
        /// Long option with a value.
        /// </summary>
        LongAssignable,
        /// <summary>
        /// Long option optional value.
        /// </summary>
        LongOptionOptionalValue,
        /// <summary>
        /// Long option required value.
        /// </summary>
        LongOptionRequiredValue,
    }
}
