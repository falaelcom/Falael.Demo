//	R0Q0/daniel/20201018
namespace Falael.Gnu.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Enumerates the GNU CLI arguments parser states.
    /// </summary>
    /// <seealso href="http://bic.wiki/wiki/Falael.CommandLine"/>
    public enum State
    {
        /// <summary>
        /// Parsing the input.
        /// </summary>
        Input,
        /// <summary>
        /// Parsing a long option.
        /// </summary>
        LongOption,
        /// <summary>
        /// Parsing a long option translated from a POSIX vendor-reserved assignable.
        /// </summary>
        TranslatedLongOption,
        /// <summary>
        /// Parsing a long option value.
        /// </summary>
        Value,
        /// <summary>
        /// Parsing a long option merged optional value.
        /// </summary>
        LongOptionMergedOptionalValue,
        /// <summary>
        /// Parsing a long option merged required value.
        /// </summary>
        LongOptionMergedRequiredValue,
        /// <summary>
        /// Parsing a long option merged optional value translated from a POSIX vendor-reserved assignable.
        /// </summary>
        TranslatedLongOptionMergedOptionalValue,
        /// <summary>
        /// Parsing a long option merged required value translated from a POSIX vendor-reserved assignable.
        /// </summary>
        TranslatedLongOptionMergedRequiredValue,
    }
}